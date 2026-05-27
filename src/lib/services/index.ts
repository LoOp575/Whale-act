// ============================================================
// Services — Barrel Export
// All service functions. Falls back to mock data when API unavailable.
// ============================================================

export {
  fetchTopWallets,
  fetchWalletTransactions,
  fetchWalletBalance,
  subscribeToWallet,
} from "./heliusService";

export {
  fetchTokenPairs,
  fetchTokenProfile,
  fetchTokenData,
  fetchMultipleTokens,
  searchTokens,
  checkLiquidity,
  normalizeDexTokenData,
} from "./dexScreenerService";

export type { TokenMarketData, DexPairRaw } from "./dexScreenerService";

export {
  generateSignals,
  getSignalsByType,
  analyzeWallet,
  checkExitSignal,
} from "./aiSignalService";

export {
  openPaperTrade,
  closePaperTrade,
  getAllPaperTrades,
  getPaperTradingSummary,
  checkStopLossTP,
  autoCopyTrade,
} from "./paperTradingService";
