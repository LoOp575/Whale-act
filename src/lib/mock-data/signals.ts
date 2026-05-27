// ============================================================
// MOCK DATA — AI Signals
// WhaleCopy AI — No real predictions, for UI display only
// ============================================================

export type SignalType = "BUY" | "WAIT" | "REJECT" | "EXIT" | "WARNING";

export interface SignalData {
  id: string;
  token: string;
  type: SignalType;
  walletCopied: string;
  confidence: number;
  reason: string;
  riskNote: string;
  suggestedAction: string;
  priceChange24h: number;
  volume24h: string;
  timestamp: string;
}

export const signals: SignalData[] = [
  {
    id: "s1",
    token: "SOL",
    type: "BUY",
    walletCopied: "Whale Alpha",
    confidence: 94,
    reason: "Wallet ini profit 24h +24.8%, sudah 342 trade, winrate 87.5%, dan token liquidity sangat aman. Volume spike terdeteksi.",
    riskNote: "Harga sudah naik 5.2% hari ini, monitor support level $168.",
    suggestedAction: "Paper buy — position size medium.",
    priceChange24h: 5.2,
    volume24h: "$2.4B",
    timestamp: "5 min ago",
  },
  {
    id: "s2",
    token: "JUP",
    type: "BUY",
    walletCopied: "Smart Money #1",
    confidence: 78,
    reason: "Smart money rotasi dari RAY ke JUP. Governance vote segera dimulai. 5 wallet akumulasi minggu ini.",
    riskNote: "Harga sudah naik 12.8%, gunakan entry kecil dan split order.",
    suggestedAction: "Paper buy only — wait for dip.",
    priceChange24h: 12.8,
    volume24h: "$890M",
    timestamp: "12 min ago",
  },
  {
    id: "s3",
    token: "WIF",
    type: "WAIT",
    walletCopied: "Degen King",
    confidence: 52,
    reason: "Sinyal campur — 2 wallet beli, 1 whale besar jual. Belum ada konfirmasi arah yang jelas.",
    riskNote: "Volume turun 15% dari kemarin. Bisa terjebak di range.",
    suggestedAction: "Jangan entry dulu — tunggu breakout konfirmasi.",
    priceChange24h: -2.1,
    volume24h: "$1.2B",
    timestamp: "18 min ago",
  },
  {
    id: "s4",
    token: "BONK",
    type: "EXIT",
    walletCopied: "MEV Bot #7",
    confidence: 71,
    reason: "Top holder dump 45M token. MEV bot front-run exit. Momentum melemah dan buyer berkurang.",
    riskNote: "Sudah turun 8.4% — potensi turun lagi ke support berikutnya.",
    suggestedAction: "Close paper position — take profit atau cut loss.",
    priceChange24h: -8.4,
    volume24h: "$560M",
    timestamp: "25 min ago",
  },
  {
    id: "s5",
    token: "RENDER",
    type: "BUY",
    walletCopied: "Institutional Acc",
    confidence: 88,
    reason: "Wallet institusi buka posisi besar. Narasi AI sedang trending dan volume meningkat signifikan.",
    riskNote: "Harga sudah naik 18.7%, gunakan entry kecil bertahap.",
    suggestedAction: "Paper buy — split 3x entry, target +30%.",
    priceChange24h: 18.7,
    volume24h: "$340M",
    timestamp: "32 min ago",
  },
  {
    id: "s6",
    token: "PYTH",
    type: "EXIT",
    walletCopied: "Whale Alpha",
    confidence: 65,
    reason: "Whale Alpha exit 80% posisi PYTH. Narasi oracle mulai cooling off. Sentimen bearish.",
    riskNote: "Jika hold, pasang stop loss di -10% dari harga sekarang.",
    suggestedAction: "Close position — follow the whale exit.",
    priceChange24h: -4.3,
    volume24h: "$180M",
    timestamp: "45 min ago",
  },
  {
    id: "s7",
    token: "JITO",
    type: "WAIT",
    walletCopied: "DeFi Farmer",
    confidence: 74,
    reason: "Aktivitas MEV meningkat di Solana. 4 wallet tambah eksposur JITO minggu ini, tapi belum breakout.",
    riskNote: "Resistance kuat di $4.20. Tunggu close candle di atas level itu.",
    suggestedAction: "Watchlist — entry setelah konfirmasi breakout.",
    priceChange24h: 6.9,
    volume24h: "$420M",
    timestamp: "1 hour ago",
  },
  {
    id: "s8",
    token: "POPCAT",
    type: "REJECT",
    walletCopied: "Degen King",
    confidence: 82,
    reason: "Degen King dump 60% posisi. Community sentiment bearish. Liquidity pool mengecil drastis.",
    riskNote: "Sudah drop 15.3% — bisa dead cat bounce tapi risky.",
    suggestedAction: "Jangan copy — skip token ini.",
    priceChange24h: -15.3,
    volume24h: "$290M",
    timestamp: "1.5 hours ago",
  },
  {
    id: "s9",
    token: "SLERF",
    type: "WARNING",
    walletCopied: "Sniper Bot",
    confidence: 45,
    reason: "Sniper Bot pola buy/sell cepat — kemungkinan rug atau pump-and-dump scheme terdeteksi.",
    riskNote: "Liquidity sangat rendah. Slippage bisa 10%+. Jangan masuk.",
    suggestedAction: "AVOID — high risk of manipulation.",
    priceChange24h: -22.1,
    volume24h: "$45M",
    timestamp: "2 hours ago",
  },
  {
    id: "s10",
    token: "RAY",
    type: "BUY",
    walletCopied: "Institutional Acc",
    confidence: 80,
    reason: "Wallet institusi DCA mingguan masih jalan. Raydium TVL naik 12% minggu ini. Fundamental solid.",
    riskNote: "Entry aman di range $3.2-$3.5. Stop loss di $2.9.",
    suggestedAction: "Paper buy — DCA strategy recommended.",
    priceChange24h: 3.8,
    volume24h: "$520M",
    timestamp: "2.5 hours ago",
  },
];
