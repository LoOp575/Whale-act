const DEFAULT_BASE_URL = "https://api.dexscreener.com";

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

function baseUrl(): string {
  return (process.env.DEXSCREENER_BASE_URL || DEFAULT_BASE_URL).replace(/\/$/, "");
}

async function requestDexScreener(path: string) {
  const response = await fetch(`${baseUrl()}${path}`, {
    headers: { Accept: "application/json" },
    next: { revalidate: 20 },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`DexScreener error ${response.status}: ${text.slice(0, 200)}`);
  }

  return response.json();
}

export async function searchDexPairs(query: string): Promise<DexPair[]> {
  const json = await requestDexScreener(`/latest/dex/search?q=${encodeURIComponent(query)}`);
  return Array.isArray(json?.pairs) ? json.pairs : [];
}

export async function getTokenPairs(chainId: string, tokenAddress: string): Promise<DexPair[]> {
  const json = await requestDexScreener(`/token-pairs/v1/${encodeURIComponent(chainId)}/${encodeURIComponent(tokenAddress)}`);
  if (Array.isArray(json)) return json;
  return Array.isArray(json?.pairs) ? json.pairs : [];
}

export async function getLatestTokenPairs(tokenAddress: string): Promise<DexPair[]> {
  const json = await requestDexScreener(`/latest/dex/tokens/${encodeURIComponent(tokenAddress)}`);
  return Array.isArray(json?.pairs) ? json.pairs : [];
}

export function pickBestPair(pairs: DexPair[]): DexPair | null {
  if (!pairs.length) return null;
  return [...pairs].sort((a, b) => (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0))[0] || null;
}
