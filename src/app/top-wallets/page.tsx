import { PageHeader, Table, Badge, Button } from "@/components/ui";
import { topWallets } from "@/data/dummy";

export default function TopWalletsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Top Wallets"
        description="Track the most profitable whale wallets on Solana"
        actions={
          <Button variant="primary" size="md">
            + Add Wallet
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex items-center gap-3">
        <button className="px-4 py-2 text-sm font-medium text-white bg-whale-600/20 border border-whale-500/30 rounded-lg">
          All Wallets
        </button>
        <button className="px-4 py-2 text-sm font-medium text-dark-400 hover:text-white hover:bg-dark-700/50 rounded-lg transition-colors">
          Tracked Only
        </button>
        <button className="px-4 py-2 text-sm font-medium text-dark-400 hover:text-white hover:bg-dark-700/50 rounded-lg transition-colors">
          High Win Rate
        </button>
        <button className="px-4 py-2 text-sm font-medium text-dark-400 hover:text-white hover:bg-dark-700/50 rounded-lg transition-colors">
          Low Risk
        </button>
      </div>

      {/* Wallets Table */}
      <Table headers={["Wallet", "7D P&L", "30D P&L", "Win Rate", "Trades", "Avg Hold", "Risk", "Status"]}>
        {topWallets.map((wallet) => (
          <tr key={wallet.id} className="hover:bg-dark-800/40 transition-colors">
            <td className="table-cell">
              <div>
                <p className="font-medium text-white">{wallet.label}</p>
                <p className="text-xs text-dark-500 font-mono">{wallet.address}</p>
              </div>
            </td>
            <td className="table-cell">
              <span className={wallet.pnl7d >= 0 ? "text-accent-emerald" : "text-accent-rose"}>
                {wallet.pnl7d >= 0 ? "+" : ""}${wallet.pnl7d.toLocaleString()}
              </span>
            </td>
            <td className="table-cell">
              <span className={wallet.pnl30d >= 0 ? "text-accent-emerald" : "text-accent-rose"}>
                {wallet.pnl30d >= 0 ? "+" : ""}${wallet.pnl30d.toLocaleString()}
              </span>
            </td>
            <td className="table-cell">
              <span className="text-white font-medium">{wallet.winRate}%</span>
            </td>
            <td className="table-cell text-dark-300">{wallet.totalTrades}</td>
            <td className="table-cell text-dark-300">{wallet.avgHoldTime}</td>
            <td className="table-cell">
              <Badge
                variant={
                  wallet.riskScore === "Low" ? "success" :
                  wallet.riskScore === "Medium" ? "warning" : "danger"
                }
              >
                {wallet.riskScore}
              </Badge>
            </td>
            <td className="table-cell">
              {wallet.isTracked ? (
                <Badge variant="info">Tracking</Badge>
              ) : (
                <button className="text-xs text-dark-400 hover:text-whale-400 transition-colors">
                  + Track
                </button>
              )}
            </td>
          </tr>
        ))}
      </Table>
    </div>
  );
}
