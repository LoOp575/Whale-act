import { getServerDb } from "@/lib/db/server";

type Db = NonNullable<ReturnType<typeof getServerDb>>;

type Pair = {
  chainId?: string;
  pairAddress?: string;
  url?: string;
  baseToken?: { address?: string; symbol?: string; name?: string };
  priceUsd?: string | number;
  liquidity?: { usd?: number };
  volume?: { h24?: number };
  priceChange?: { h24?: number };
};

type DiscoveryInput = {
  limitPairs?: number;
  txLimit?: number;
  minUsdVolume?: number;
  dryRun?: boolean;
};

type Candidate = {
  address: string;
  label: string;
  buyCount: number;
  sellCount: number;
  tradeCount: number;
  tokenCount: number;
  volumeUsd: number;
  copyScore: number;
  riskScore: number;
  lastSeenAt: string;
  notes: string;
  rawPayload: Record<string, unknown>;
};

type Activity = {
  walletAddress: string;
  tokenAddress: string;
  tokenSymbol: string;
  action: "BUY" | "SELL";
  amount: number;
  amountUsd: number;
  txHash: string;
  description: string;
  createdAt: string;
  rawPayload: unknown;
};

const n = (value: unknown) => Number.isFinite(Number(value)) ? Number(value) : 0;
const clamp = (value: number, min = 0, max = 100) => Math.max(min, Math.min(max, value));
const short = (value: string) => value.length <= 12 ? value : `${value.slice(0, 4)}...${value.slice(-4)}`;
const unique = <T,>(items: T[]) => Array.from(new Set(items));

function getHeliusKey() {
  return process.env.HELIUS_API_KEY || process.env.NEXT_PUBLIC_HELIUS_API_KEY || "";
}

async function fetchJson(url: string) {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);
  return response.json();
}

async function getPairsFromEnv(limit: number) {
  const tokenList = process.env.DISCOVERY_TOKEN_ADDRESSES || process.env.TOKEN_WATCHLIST || "";
  const tokens = unique(tokenList.split(/[\n,]+/).map((item) => item.trim()).filter(Boolean)).slice(0, Math.max(limit, 1));
  if (!tokens.length) return [] as Pair[];

  const json = await fetchJson(`https://api.dexscreener.com/latest/dex/tokens/${tokens.map(encodeURIComponent).join(",")}`);
  const pairs = (Array.isArray(json?.pairs) ? json.pairs : []) as Pair[];
  return pairs
    .filter((pair) => String(pair.chainId || "").toLowerCase() === "solana")
    .sort((a, b) => n(b.volume?.h24) - n(a.volume?.h24))
    .slice(0, limit);
}

async function getLatestSolanaPairs(limit: number) {
  const json = await fetchJson("https://api.dexscreener.com/token-profiles/latest/v1");
  const profiles = (Array.isArray(json) ? json : []) as Array<{ chainId?: string; tokenAddress?: string }>;
  const tokens = unique(profiles
    .filter((profile) => String(profile.chainId || "").toLowerCase() === "solana" && profile.tokenAddress)
    .map((profile) => String(profile.tokenAddress)))
    .slice(0, Math.max(limit * 2, limit));

  if (!tokens.length) return [] as Pair[];
  const tokenJson = await fetchJson(`https://api.dexscreener.com/latest/dex/tokens/${tokens.map(encodeURIComponent).join(",")}`);
  const pairs = (Array.isArray(tokenJson?.pairs) ? tokenJson.pairs : []) as Pair[];
  return pairs
    .filter((pair) => String(pair.chainId || "").toLowerCase() === "solana" && pair.pairAddress && pair.baseToken?.address)
    .sort((a, b) => n(b.volume?.h24) - n(a.volume?.h24))
    .slice(0, limit);
}

async function getDiscoveryPairs(limit: number) {
  const fromEnv = await getPairsFromEnv(limit).catch(() => [] as Pair[]);
  if (fromEnv.length) return fromEnv;
  return getLatestSolanaPairs(limit).catch(() => [] as Pair[]);
}

function extractUserActivity(tx: Record<string, unknown>, pair: Pair) {
  const pairAddress = String(pair.pairAddress || "");
  const tokenAddress = String(pair.baseToken?.address || "");
  const tokenSymbol = String(pair.baseToken?.symbol || short(tokenAddress));
  const priceUsd = n(pair.priceUsd);
  const transfers = Array.isArray(tx.tokenTransfers) ? tx.tokenTransfers as Record<string, unknown>[] : [];
  const sig = String(tx.signature || tx.transactionSignature || "");
  const rawTime = tx.timestamp || tx.blockTime;
  const createdAt = typeof rawTime === "number" ? new Date(rawTime * 1000).toISOString() : new Date().toISOString();

  const activities: Activity[] = [];

  for (const transfer of transfers) {
    const mint = String(transfer.mint || transfer.tokenAddress || "");
    if (!tokenAddress || mint !== tokenAddress) continue;

    const from = String(transfer.fromUserAccount || transfer.fromUser || "");
    const to = String(transfer.toUserAccount || transfer.toUser || "");
    const rawAmount = transfer.rawTokenAmount as { tokenAmount?: unknown } | undefined;
    const amount = n(transfer.tokenAmount || transfer.amount || rawAmount?.tokenAmount);
    if (!amount) continue;

    if (to && to !== pairAddress) {
      activities.push({
        walletAddress: to,
        tokenAddress,
        tokenSymbol,
        action: "BUY",
        amount,
        amountUsd: priceUsd ? amount * priceUsd : 0,
        txHash: sig,
        description: `${short(to)} received ${amount.toLocaleString()} ${tokenSymbol} from active pair`,
        createdAt,
        rawPayload: tx,
      });
    }

    if (from && from !== pairAddress) {
      activities.push({
        walletAddress: from,
        tokenAddress,
        tokenSymbol,
        action: "SELL",
        amount,
        amountUsd: priceUsd ? amount * priceUsd : 0,
        txHash: sig,
        description: `${short(from)} sent ${amount.toLocaleString()} ${tokenSymbol} into active pair`,
        createdAt,
        rawPayload: tx,
      });
    }
  }

  return activities;
}

async function scanPair(pair: Pair, txLimit: number) {
  const key = getHeliusKey();
  if (!key) return { activities: [] as Activity[], warning: "HELIUS_API_KEY belum diset, discovery tidak bisa scan transaksi pair." };

  const pairAddress = String(pair.pairAddress || "");
  if (!pairAddress) return { activities: [] as Activity[], warning: "Pair address kosong dari DexScreener." };

  const url = `https://api.helius.xyz/v0/addresses/${encodeURIComponent(pairAddress)}/transactions?api-key=${encodeURIComponent(key)}&limit=${Math.min(Math.max(txLimit, 1), 50)}`;
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) return { activities: [] as Activity[], warning: `Helius gagal scan pair ${short(pairAddress)}: HTTP ${response.status}` };

  const json = await response.json();
  const txs = Array.isArray(json) ? json as Record<string, unknown>[] : [];
  return { activities: txs.flatMap((tx) => extractUserActivity(tx, pair)) };
}

function buildCandidates(activities: Activity[]) {
  const map = new Map<string, {
    buyCount: number;
    sellCount: number;
    volumeUsd: number;
    tokens: Set<string>;
    lastSeenAt: string;
    samples: Activity[];
  }>();

  for (const activity of activities) {
    const current = map.get(activity.walletAddress) || { buyCount: 0, sellCount: 0, volumeUsd: 0, tokens: new Set<string>(), lastSeenAt: activity.createdAt, samples: [] };
    if (activity.action === "BUY") current.buyCount += 1;
    if (activity.action === "SELL") current.sellCount += 1;
    current.volumeUsd += activity.amountUsd;
    current.tokens.add(activity.tokenAddress);
    current.lastSeenAt = activity.createdAt > current.lastSeenAt ? activity.createdAt : current.lastSeenAt;
    if (current.samples.length < 8) current.samples.push(activity);
    map.set(activity.walletAddress, current);
  }

  return Array.from(map.entries()).map(([address, item]) => {
    const tradeCount = item.buyCount + item.sellCount;
    const buyBias = item.buyCount - item.sellCount;
    const volumeScore = item.volumeUsd > 0 ? Math.min(25, Math.log10(item.volumeUsd + 1) * 5) : 0;
    const copyScore = Math.round(clamp(35 + item.buyCount * 8 + item.tokens.size * 5 + volumeScore + Math.max(0, buyBias) * 4 - item.sellCount * 3));
    const riskScore = Math.round(clamp(70 - item.tokens.size * 4 - Math.min(15, item.buyCount * 2) + item.sellCount * 5, 15, 95));
    const candidate: Candidate = {
      address,
      label: `Discovered ${short(address)}`,
      buyCount: item.buyCount,
      sellCount: item.sellCount,
      tradeCount,
      tokenCount: item.tokens.size,
      volumeUsd: Number(item.volumeUsd.toFixed(2)),
      copyScore,
      riskScore,
      lastSeenAt: item.lastSeenAt,
      notes: `Auto-discovered from active Solana pair flow. This is a candidate score, not verified realized profit yet. Buys=${item.buyCount}, sells=${item.sellCount}, tokens=${item.tokens.size}.`,
      rawPayload: { samples: item.samples, tokens: Array.from(item.tokens) },
    };
    return candidate;
  }).filter((candidate) => candidate.tradeCount >= 1)
    .sort((a, b) => b.copyScore - a.copyScore)
    .slice(0, 50);
}

async function persistActivities(db: Db, activities: Activity[]) {
  const hashes = unique(activities.map((activity) => activity.txHash).filter(Boolean)).slice(0, 250);
  const seen = new Set<string>();
  if (hashes.length) {
    const { data } = await db.from("live_activities").select("tx_hash").in("tx_hash", hashes);
    for (const item of (data || []) as Array<{ tx_hash?: string }>) {
      if (item.tx_hash) seen.add(item.tx_hash);
    }
  }

  const rows = activities
    .filter((activity) => activity.txHash && !seen.has(activity.txHash))
    .slice(0, 250)
    .map((activity) => ({
      wallet_address: activity.walletAddress,
      token_address: activity.tokenAddress,
      token_symbol: activity.tokenSymbol,
      action: activity.action,
      amount: activity.amount,
      amount_usd: activity.amountUsd,
      tx_hash: activity.txHash,
      description: activity.description,
      source: "discovery_agent",
      raw_summary: activity.description,
      raw_payload: activity.rawPayload,
      created_at: activity.createdAt,
    }));

  if (rows.length) await db.from("live_activities").insert(rows);
  return rows.length;
}

async function persistCandidates(db: Db, candidates: Candidate[]) {
  const rows = candidates.map((candidate) => ({
    address: candidate.address,
    chain: "solana",
    label: candidate.label,
    notes: candidate.notes,
    status: "DISCOVERED",
    source: "discovery_agent",
    roi_7d: 0,
    realized_pnl_7d: 0,
    winrate_7d: 0,
    trade_count_7d: candidate.tradeCount,
    avg_hold_minutes: 0,
    copy_score: candidate.copyScore,
    risk_score: candidate.riskScore,
    consistency_score: candidate.buyCount,
    exit_speed_score: Math.max(0, 100 - candidate.sellCount * 10),
    last_seen_at: candidate.lastSeenAt,
    raw_payload: candidate.rawPayload,
    updated_at: new Date().toISOString(),
  }));

  if (!rows.length) return 0;
  const { error } = await db.from("wallets").upsert(rows, { onConflict: "address" });
  if (error) throw error;
  return rows.length;
}

export async function runWalletDiscovery(input: DiscoveryInput = {}) {
  const db = getServerDb();
  const warnings: string[] = [];
  const limitPairs = Math.min(Math.max(input.limitPairs || 8, 1), 20);
  const txLimit = Math.min(Math.max(input.txLimit || 20, 1), 50);
  const minUsdVolume = n(input.minUsdVolume || 0);

  if (!db) {
    return { success: false, source: "wallet-discovery", warnings: ["Supabase env belum lengkap."], pairsScanned: 0, activitiesFound: 0, walletsDiscovered: 0, walletsSaved: 0, candidates: [] as Candidate[] };
  }

  const pairs = (await getDiscoveryPairs(limitPairs))
    .filter((pair) => !minUsdVolume || n(pair.volume?.h24) >= minUsdVolume)
    .slice(0, limitPairs);

  if (!pairs.length) warnings.push("Tidak ada Solana pair aktif dari DexScreener. Isi DISCOVERY_TOKEN_ADDRESSES/TOKEN_WATCHLIST untuk scan token tertentu.");

  let activities: Activity[] = [];
  for (const pair of pairs) {
    const result = await scanPair(pair, txLimit);
    if (result.warning) warnings.push(result.warning);
    activities = activities.concat(result.activities);
  }

  const candidates = buildCandidates(activities);
  const activitiesSaved = input.dryRun ? 0 : await persistActivities(db, activities);
  const walletsSaved = input.dryRun ? 0 : await persistCandidates(db, candidates);

  const output = {
    success: true,
    source: "wallet-discovery" as const,
    warnings: unique(warnings),
    pairsScanned: pairs.length,
    activitiesFound: activities.length,
    activitiesSaved,
    walletsDiscovered: candidates.length,
    walletsSaved,
    candidates,
  };

  await db.from("agent_logs").insert({
    agent_name: "wallet_discovery_agent",
    action: input.dryRun ? "dry_run" : "run",
    input_summary: JSON.stringify(input).slice(0, 1000),
    output_summary: JSON.stringify(output).slice(0, 1000),
    level: output.warnings.length ? "warning" : "info",
    raw_payload: { input, output },
  });

  return output;
}
