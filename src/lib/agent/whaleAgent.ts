import { getServerDb } from "@/lib/db/server";

type Db = NonNullable<ReturnType<typeof getServerDb>>;
type Wallet = {
  address: string;
  label?: string | null;
  winrate_7d?: number | string | null;
  realized_pnl_7d?: number | string | null;
  trade_count_7d?: number | null;
  copy_score?: number | string | null;
  risk_score?: number | string | null;
};
type Activity = {
  walletAddress: string;
  walletLabel: string;
  tokenAddress: string;
  tokenSymbol: string;
  action: "BUY" | "SELL" | "TRANSFER";
  amount: number;
  valueUsd: number;
  txHash: string;
  description: string;
  timestamp: string;
  rawPayload?: unknown;
};
type Signal = {
  id?: string;
  tokenAddress: string;
  tokenSymbol: string;
  signalType: "STRONG_BUY" | "BUY" | "WATCH" | "SKIP" | "SELL";
  suggestedAction: "BUY" | "WATCH" | "SKIP" | "SELL";
  confidence: number;
  qualifiedWhales: number;
  buyCount: number;
  sellCount: number;
  whaleWinrateAvg: number;
  whaleCopyScoreAvg: number;
  liquidityUsd: number;
  volume24h: number;
  priceUsd: number;
  priceChange24h: number;
  reason: string;
  riskNote: string;
  entryPlan: string;
  exitPlan: string;
  invalidIf: string;
  timeHorizon: string;
  source: string;
};
export type AgentRunInput = { tokenAddress?: string; tokenSymbol?: string; limitWallets?: number; txLimit?: number; dryRun?: boolean };
export type AgentRunResult = { success: boolean; source: "live-agent"; scannedWallets: number; qualifiedWallets: number; candidates: number; signals: Signal[]; warnings: string[]; config: Record<string, unknown> };

const n = (v: unknown) => (Number.isFinite(Number(v)) ? Number(v) : 0);
const clamp = (v: number, min = 0, max = 100) => Math.max(min, Math.min(max, v));
const envN = (k: string, d: number) => (Number.isFinite(Number(process.env[k])) ? Number(process.env[k]) : d);
const short = (s: string) => (!s ? "UNKNOWN" : s.length <= 12 ? s : `${s.slice(0, 4)}...${s.slice(-4)}`);
const action = (v: unknown): Activity["action"] => (String(v || "").toUpperCase() === "BUY" ? "BUY" : String(v || "").toUpperCase() === "SELL" ? "SELL" : "TRANSFER");

function getAiConfig() {
  const apiKey = process.env.AI_API_KEY || process.env.OPENAI_API_KEY || process.env.AICHIXIA_API_KEY || "";
  const baseUrl = (process.env.AI_API_BASE_URL || process.env.OPENAI_BASE_URL || process.env.AICHIXIA_API_BASE_URL || "https://api.openai.com/v1").replace(/\/+$/, "");
  const model = process.env.AI_MODEL || process.env.OPENAI_MODEL || process.env.AICHIXIA_MODEL || "gpt-4o-mini";
  const chatUrl = baseUrl.endsWith("/chat/completions") ? baseUrl : `${baseUrl}/chat/completions`;
  return { apiKey, baseUrl, model, chatUrl };
}

function envWallets(): Wallet[] {
  const raw = process.env.WHALE_WALLETS || process.env.TRACKED_WALLETS || "";
  return raw.split(/[\n,]+/).map((x) => x.trim()).filter(Boolean).map((x) => {
    const [address, label, winrate, roi, pnl, copyScore, riskScore] = x.split("|").map((p) => p.trim());
    return { address, label: label || short(address), winrate_7d: n(winrate), realized_pnl_7d: n(pnl || roi), trade_count_7d: 3, copy_score: n(copyScore), risk_score: riskScore ? n(riskScore) : 50 };
  });
}

async function loadWallets(db: Db, limit: number) {
  const { data, error } = await db.from("wallets")
    .select("address,label,winrate_7d,realized_pnl_7d,trade_count_7d,copy_score,risk_score,status")
    .neq("status", "REJECTED")
    .order("copy_score", { ascending: false })
    .limit(Math.min(limit * 3, 100));
  if (error) throw error;
  const rows = ((data || []) as Wallet[]).filter((w) => w.address);
  return rows.length ? rows : envWallets();
}

function qualified(wallets: Wallet[]) {
  const minWinrate = envN("AGENT_MIN_WINRATE", 70);
  const minTrades = envN("AGENT_MIN_TRADES_7D", 3);
  const minCopy = envN("AGENT_MIN_COPY_SCORE", 65);
  return wallets.filter((w) => {
    const win = n(w.winrate_7d), pnl = n(w.realized_pnl_7d), trades = n(w.trade_count_7d), copy = n(w.copy_score), risk = n(w.risk_score);
    return (win >= minWinrate && pnl > 0 && trades >= minTrades) || (win >= minWinrate && copy >= minCopy && risk <= 75);
  });
}

export function extractHeliusActivities(tx: Record<string, unknown>, wallet: Wallet): Activity[] {
  const transfers = Array.isArray(tx.tokenTransfers) ? tx.tokenTransfers as Record<string, unknown>[] : [];
  const sig = String(tx.signature || tx.transactionSignature || "");
  const rawTime = tx.timestamp || tx.blockTime;
  const timestamp = typeof rawTime === "number" ? new Date(rawTime * 1000).toISOString() : new Date().toISOString();
  return transfers.map((t) => {
    const mint = String(t.mint || t.tokenAddress || "");
    if (!mint) return null;
    const from = String(t.fromUserAccount || t.fromUser || "");
    const to = String(t.toUserAccount || t.toUser || "");
    const rawAmount = t.rawTokenAmount as { tokenAmount?: unknown } | undefined;
    const amount = n(t.tokenAmount || t.amount || rawAmount?.tokenAmount);
    const tokenSymbol = String(t.tokenSymbol || t.symbol || short(mint));
    const a: Activity["action"] = to === wallet.address && from !== wallet.address ? "BUY" : from === wallet.address && to !== wallet.address ? "SELL" : "TRANSFER";
    const item: Activity = { walletAddress: wallet.address, walletLabel: wallet.label || short(wallet.address), tokenAddress: mint, tokenSymbol, action: a, amount, valueUsd: 0, txHash: sig, description: `${wallet.label || short(wallet.address)} ${a.toLowerCase()} ${amount || ""} ${tokenSymbol}`.trim(), timestamp, rawPayload: tx };
    return item;
  }).filter((x): x is Activity => Boolean(x));
}

async function storedActivities(db: Db, wallets: Wallet[]) {
  const addresses = wallets.map((w) => w.address).filter(Boolean);
  if (!addresses.length) return [] as Activity[];
  const { data, error } = await db.from("live_activities")
    .select("wallet_address,token_address,token_symbol,action,amount,amount_usd,tx_hash,description,raw_summary,raw_payload,created_at")
    .in("wallet_address", addresses).order("created_at", { ascending: false }).limit(200);
  if (error) throw error;
  const labels = new Map(wallets.map((w) => [w.address, w.label || short(w.address)]));
  return ((data || []) as Record<string, unknown>[]).map((r) => {
    const walletAddress = String(r.wallet_address || ""), tokenAddress = String(r.token_address || ""), tokenSymbol = String(r.token_symbol || (tokenAddress ? short(tokenAddress) : "UNKNOWN"));
    if (!walletAddress || (!tokenAddress && tokenSymbol === "UNKNOWN")) return null;
    const item: Activity = { walletAddress, walletLabel: labels.get(walletAddress) || short(walletAddress), tokenAddress, tokenSymbol, action: action(r.action), amount: n(r.amount), valueUsd: n(r.amount_usd), txHash: String(r.tx_hash || ""), description: String(r.description || r.raw_summary || "Stored whale activity"), timestamp: String(r.created_at || new Date().toISOString()), rawPayload: r.raw_payload };
    return item;
  }).filter((x): x is Activity => Boolean(x));
}

async function helius(wallet: Wallet, limit: number) {
  const key = process.env.HELIUS_API_KEY || process.env.NEXT_PUBLIC_HELIUS_API_KEY;
  if (!key) return { items: [] as Activity[], warning: "HELIUS_API_KEY belum diset; agent pakai live_activities Supabase saja." };
  const url = `https://api.helius.xyz/v0/addresses/${encodeURIComponent(wallet.address)}/transactions?api-key=${encodeURIComponent(key)}&limit=${Math.min(limit, 50)}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return { items: [] as Activity[], warning: `Helius gagal untuk ${short(wallet.address)}: HTTP ${res.status}` };
  const json = await res.json();
  return { items: Array.isArray(json) ? json.flatMap((tx) => extractHeliusActivities(tx as Record<string, unknown>, wallet)) : [] };
}

async function persistActivities(db: Db, acts: Activity[]) {
  const hashes = Array.from(new Set(acts.map((a) => a.txHash).filter(Boolean))).slice(0, 200);
  if (!hashes.length) return;
  const { data } = await db.from("live_activities").select("tx_hash").in("tx_hash", hashes);
  const seen = new Set(((data || []) as { tx_hash?: string }[]).map((x) => x.tx_hash).filter(Boolean));
  const rows = acts.filter((a) => a.txHash && !seen.has(a.txHash)).slice(0, 200).map((a) => ({ wallet_address: a.walletAddress, token_address: a.tokenAddress || null, token_symbol: a.tokenSymbol || null, action: a.action, amount: a.amount, amount_usd: a.valueUsd, tx_hash: a.txHash, description: a.description, source: "helius", raw_summary: a.description, raw_payload: a.rawPayload || null, created_at: a.timestamp }));
  if (rows.length) await db.from("live_activities").insert(rows);
}

function groups(acts: Activity[], input: AgentRunInput) {
  const map = new Map<string, { tokenAddress: string; tokenSymbol: string; buys: number; sells: number; buyWallets: Set<string>; sellWallets: Set<string>; acts: Activity[] }>();
  const forcedAddress = input.tokenAddress?.trim();
  const forcedSymbol = input.tokenSymbol?.trim().toUpperCase();
  for (const a of acts) {
    if (forcedAddress && a.tokenAddress !== forcedAddress) continue;
    if (forcedSymbol && a.tokenSymbol.toUpperCase() !== forcedSymbol) continue;
    const key = a.tokenAddress || a.tokenSymbol.toUpperCase();
    const g = map.get(key) || { tokenAddress: a.tokenAddress, tokenSymbol: a.tokenSymbol, buys: 0, sells: 0, buyWallets: new Set<string>(), sellWallets: new Set<string>(), acts: [] };
    if (a.action === "BUY") { g.buys++; g.buyWallets.add(a.walletAddress); }
    if (a.action === "SELL") { g.sells++; g.sellWallets.add(a.walletAddress); }
    g.acts.push(a); map.set(key, g);
  }
  return Array.from(map.values()).filter((g) => g.buys + g.sells > 0).sort((a, b) => (b.buys - b.sells) - (a.buys - a.sells)).slice(0, 12);
}

async function dex(tokenAddress: string) {
  if (!tokenAddress) return null;
  const res = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${encodeURIComponent(tokenAddress)}`, { cache: "no-store" });
  if (!res.ok) return null;
  const json = await res.json();
  const pairs = (Array.isArray(json?.pairs) ? json.pairs : []) as any[];
  return pairs.filter((p) => String(p.chainId || "").toLowerCase() === "solana").sort((a, b) => n(b.liquidity?.usd) - n(a.liquidity?.usd))[0] || pairs.sort((a, b) => n(b.liquidity?.usd) - n(a.liquidity?.usd))[0] || null;
}

function avg(wallets: Wallet[], addresses: Set<string>, field: keyof Wallet) {
  const selected = wallets.filter((w) => addresses.has(w.address));
  return selected.length ? selected.reduce((s, w) => s + n(w[field]), 0) / selected.length : 0;
}

async function aiReason(signal: Signal) {
  const ai = getAiConfig();
  if (!ai.apiKey) return signal.reason;
  try {
    const res = await fetch(ai.chatUrl, {
      method: "POST",
      headers: { Authorization: `Bearer ${ai.apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: ai.model,
        temperature: 0.2,
        max_tokens: 150,
        messages: [
          { role: "system", content: "Ringkas sebagai AI risk analyst crypto bahasa Indonesia. Jangan janji profit." },
          { role: "user", content: JSON.stringify(signal) },
        ],
      }),
    });
    if (!res.ok) return signal.reason;
    const json = await res.json();
    return typeof json?.choices?.[0]?.message?.content === "string" ? json.choices[0].message.content.trim() : signal.reason;
  } catch {
    return signal.reason;
  }
}

function buildSignal(g: ReturnType<typeof groups>[number], pair: any, wallets: Wallet[]): Signal {
  const winAvg = avg(wallets, g.buyWallets, "winrate_7d"), copyAvg = avg(wallets, g.buyWallets, "copy_score"), riskAvg = avg(wallets, g.buyWallets, "risk_score") || 50;
  const liquidity = n(pair?.liquidity?.usd), volume = n(pair?.volume?.h24), change = n(pair?.priceChange?.h24), price = n(pair?.priceUsd);
  const whaleQuality = clamp(winAvg * 0.6 + copyAvg * 0.4);
  const flowScore = clamp(50 + (g.buys - g.sells) * 12 + Math.max(g.buyWallets.size - 1, 0) * 8);
  const marketScore = clamp((liquidity >= 500000 ? 35 : liquidity >= 100000 ? 25 : liquidity >= 25000 ? 12 : 0) + (volume >= 1000000 ? 35 : volume >= 250000 ? 25 : volume >= 50000 ? 12 : 0) + (change > 0 ? 15 : change > -10 ? 8 : 0));
  const confidence = Math.round(clamp(whaleQuality * 0.42 + flowScore * 0.28 + marketScore * 0.3 - (riskAvg >= 75 ? 16 : riskAvg >= 55 ? 8 : 0), 0, 99));
  let signalType: Signal["signalType"] = "WATCH", suggestedAction: Signal["suggestedAction"] = "WATCH";
  if (g.sells > g.buys || confidence < 45) { signalType = "SKIP"; suggestedAction = "SKIP"; }
  else if (confidence >= 82 && g.buyWallets.size >= 2 && liquidity >= 25000) { signalType = "STRONG_BUY"; suggestedAction = "BUY"; }
  else if (confidence >= 70 && g.buyWallets.size >= 1 && g.buys > g.sells) { signalType = "BUY"; suggestedAction = "BUY"; }
  const tokenSymbol = pair?.baseToken?.symbol || g.tokenSymbol || "UNKNOWN";
  const tokenAddress = g.tokenAddress || pair?.baseToken?.address || "";
  return { tokenAddress, tokenSymbol, signalType, suggestedAction, confidence, qualifiedWhales: g.buyWallets.size, buyCount: g.buys, sellCount: g.sells, whaleWinrateAvg: Number(winAvg.toFixed(2)), whaleCopyScoreAvg: Number(copyAvg.toFixed(2)), liquidityUsd: liquidity, volume24h: volume, priceUsd: price, priceChange24h: change, reason: `${g.buyWallets.size} whale lolos filter profit/winrate mengikuti ${tokenSymbol}. Flow ${g.buys} buy vs ${g.sells} sell. Confidence ${confidence}% dari whale quality, flow, likuiditas, volume, dan risk penalty.`, riskNote: liquidity && liquidity < 25000 ? "Likuiditas tipis, slippage tinggi." : riskAvg >= 65 ? "Risk wallet cukup tinggi, tunggu konfirmasi tambahan." : "Risk normal selama entry disiplin.", entryPlan: suggestedAction === "BUY" ? "Entry kecil bertahap saat volume tetap naik dan tidak ada whale dump." : "Tunggu buy lanjutan dari wallet lolos filter.", exitPlan: "TP bertahap; keluar cepat jika whale utama sell atau volume drop.", invalidIf: "Invalid jika flow buy/sell berbalik negatif, likuiditas turun besar, atau harga breakdown volume tinggi.", timeHorizon: "1-24 jam", source: "ai_agent" };
}

async function saveSignal(db: Db, signal: Signal, pair: any, dryRun: boolean) {
  if (dryRun) return signal;
  if (signal.tokenAddress) await db.from("token_snapshots").insert({ token_address: signal.tokenAddress, token_symbol: signal.tokenSymbol, chain: "solana", price_usd: signal.priceUsd, liquidity_usd: signal.liquidityUsd, volume_24h: signal.volume24h, price_change_24h: signal.priceChange24h, pair_address: pair?.pairAddress || null, pair_url: pair?.url || null, source: "dexscreener", raw_payload: pair || null });
  const { data, error } = await db.from("signals").insert({ signal_type: signal.signalType, token_address: signal.tokenAddress || null, token_symbol: signal.tokenSymbol, confidence: signal.confidence, reason: signal.reason, risk_note: signal.riskNote, suggested_action: signal.suggestedAction, entry_plan: signal.entryPlan, exit_plan: signal.exitPlan, invalid_if: signal.invalidIf, time_horizon: signal.timeHorizon, price_change_24h: signal.priceChange24h, volume_24h: signal.volume24h, liquidity_usd: signal.liquidityUsd, status: "NEW", source: signal.source, raw_payload: signal }).select("id").single();
  if (error) throw error;
  return { ...signal, id: data?.id };
}

export async function runWhaleAgent(input: AgentRunInput = {}): Promise<AgentRunResult> {
  const db = getServerDb();
  const ai = getAiConfig();
  const minWinrate = envN("AGENT_MIN_WINRATE", 70), minTrades = envN("AGENT_MIN_TRADES_7D", 3), minCopyScore = envN("AGENT_MIN_COPY_SCORE", 65);
  const config = { minWinrate, minTrades, minCopyScore, hasSupabase: Boolean(db), hasHelius: Boolean(process.env.HELIUS_API_KEY || process.env.NEXT_PUBLIC_HELIUS_API_KEY), hasAi: Boolean(ai.apiKey), aiBaseUrl: ai.apiKey ? ai.baseUrl : null, aiModel: ai.apiKey ? ai.model : null };
  if (!db) return { success: false, source: "live-agent", scannedWallets: 0, qualifiedWallets: 0, candidates: 0, signals: [], warnings: ["Supabase env belum lengkap."], config };
  const warnings: string[] = [];
  const allWallets = await loadWallets(db, Math.min(Math.max(input.limitWallets || 20, 1), 50));
  const good = qualified(allWallets).slice(0, Math.min(Math.max(input.limitWallets || 20, 1), 50));
  if (!allWallets.length) warnings.push("Belum ada wallet asli di tabel wallets atau env WHALE_WALLETS.");
  if (!good.length) warnings.push(`Belum ada wallet lolos filter winrate ${minWinrate}% + profit positif.`);
  let acts = await storedActivities(db, good);
  const fetched = await Promise.all(good.map((w) => helius(w, Math.min(Math.max(input.txLimit || 20, 1), 50))));
  fetched.forEach((r) => { if (r.warning) warnings.push(r.warning); acts = acts.concat(r.items); });
  await persistActivities(db, acts);
  const gs = groups(acts, input);
  const signals: Signal[] = [];
  for (const g of gs) {
    const pair = await dex(g.tokenAddress);
    let signal = buildSignal(g, pair, good);
    signal = { ...signal, reason: await aiReason(signal) };
    signals.push(await saveSignal(db, signal, pair, Boolean(input.dryRun)));
  }
  const result = { success: true, source: "live-agent" as const, scannedWallets: allWallets.length, qualifiedWallets: good.length, candidates: gs.length, signals, warnings: Array.from(new Set(warnings)), config };
  await db.from("agent_logs").insert({ agent_name: "whale_profit_agent", action: "run", input_summary: JSON.stringify(input).slice(0, 1000), output_summary: JSON.stringify(result).slice(0, 1000), level: result.warnings.length ? "warning" : "info", raw_payload: { input, result } });
  return result;
}
