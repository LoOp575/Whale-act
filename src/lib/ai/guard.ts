type GuardActivity = {
  action?: string | null;
  description?: string | null;
  token_symbol?: string | null;
};

export function normalizeConfidence(value: unknown) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 0;
  const scaled = parsed > 0 && parsed <= 1 ? parsed * 100 : parsed;
  return Math.max(0, Math.min(100, Math.round(scaled)));
}

export function shouldGuardActivity(rows: GuardActivity[], hasMarket: boolean, liquidityUsd: number) {
  const latest = rows[0];
  const text = rows.map((row) => `${row.action || ""} ${row.description || ""}`).join(" ").toLowerCase();

  return {
    shouldGuard:
      !latest?.token_symbol ||
      latest.token_symbol === "UNKNOWN" ||
      !hasMarket ||
      liquidityUsd <= 0 ||
      text.includes("magic_eden") ||
      text.includes("magic eden") ||
      text.includes("nft") ||
      /#[0-9]+/.test(text),
  };
}
