// ============================================================
// Services — Barrel Export
// All service functions are placeholders returning mock data.
// Replace with real API calls when ready.
// ============================================================

export {
  fetchTopWallets,
  fetchWalletTransactions,
  fetchWalletBalance,
  subscribeToWallet,
} from "./heliusService";

export {
  fetchTokenData,
  fetchMultipleTokens,
  searchTokens,
  checkLiquidity,
} from "./dexScreenerService";

export type { TokenMarketData } from "./dexScreenerService";

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
