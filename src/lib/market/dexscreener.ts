export type DexPair = {
  chainId?: string;
  dexId?: string;
  url?: string;
  pairAddress?: string;
  baseToken?: { address?: string; name?: string; symbol?: string };
  quoteToken?: { address?: string; name?: string; symbol?: string };
  priceNative?: string;
  priceUsd?: string;
  txns?: Record<string, { buys?: number; sells?: number }>;
  volume?: Record<string, number>;
  priceChange?: Record<string, number>;
  liquidity?: { usd?: number; base?: number; quote?: number };
  fdv?: number;
  marketCap?: number;
  pairCreatedAt?: number;
};

function baseUrl() {
  return (process.env.DEXSCREENER_BASE_URL || "https://api.dexscreener.com").replace(/\/$/, "");
}

async function requestDex(path: string) {
  const response = await fetch(`${baseUrl()}${path}`, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`DexScreener request failed ${response.status}: ${text.slice(0, 200)}`);
  }

  return response.json();
}

export async function searchPairs(query: string): Promise<DexPair[]> {
  const json = await requestDex(`/latest/dex/search?q=${encodeURIComponent(query)}`);
  return Array.isArray(json?.pairs) ? json.pairs : [];
}

export async function getTokenPairs(chainId: string, tokenAddress: string): Promise<DexPair[]> {
  const json = await requestDex(`/token-pairs/v1/${encodeURIComponent(chainId)}/${encodeURIComponent(tokenAddress)}`);
  if (Array.isArray(json)) return json;
  return Array.isArray(json?.pairs) ? json.pairs : [];
}

export async function getLatestTokenPairs(tokenAddress: string): Promise<DexPair[]> {
  const json = await requestDex(`/latest/dex/tokens/${encodeURIComponent(tokenAddress)}`);
  return Array.isArray(json?.pairs) ? json.pairs : [];
}

export function pickBestPair(pairs: DexPair[]) {
  return [...pairs].sort((a, b) => (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0))[0] || null;
}

export function mapPair(pair: DexPair | null) {
  if (!pair) return null;

  return {
    chainId: pair.chainId || null,
    dexId: pair.dexId || null,
    pairAddress: pair.pairAddress || null,
    pairUrl: pair.url || null,
    tokenAddress: pair.baseToken?.address || null,
    tokenName: pair.baseToken?.name || null,
    tokenSymbol: pair.baseToken?.symbol || null,
    quoteSymbol: pair.quoteToken?.symbol || null,
    priceUsd: Number(pair.priceUsd || 0),
    liquidityUsd: Number(pair.liquidity?.usd || 0),
    volume24h: Number(pair.volume?.h24 || 0),
    priceChange5m: Number(pair.priceChange?.m5 || 0),
    priceChange1h: Number(pair.priceChange?.h1 || 0),
    priceChange24h: Number(pair.priceChange?.h24 || 0),
    txns24h: pair.txns?.h24 || null,
    marketCap: Number(pair.marketCap || 0),
    fdv: Number(pair.fdv || 0),
    pairCreatedAt: pair.pairCreatedAt || null,
  };
}
