import { PageHeader, Table, Badge, Button } from "@/components/ui";
import { wallets } from "@/lib/mock-data";

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
      <Table headers={["Wallet", "ROI 24h", "Realized PnL", "Win Rate", "Avg Hold", "Copy Score", "Risk", "Status"]}>
        {wallets.map((wallet) => (
          <tr key={wallet.id} className="hover:bg-dark-800/40 transition-colors">
            <td className="table-cell">
              <div>
                <p className="font-medium text-white">{wallet.label}</p>
                <p className="text-xs text-dark-500 font-mono">{wallet.address}</p>
              </div>
            </td>
            <td className="table-cell">
              <span className={wallet.roi24h >= 0 ? "text-accent-emerald font-medium" : "text-accent-rose font-medium"}>
                {wallet.roi24h >= 0 ? "+" : ""}{wallet.roi24h}%
              </span>
            </td>
            <td className="table-cell">
              <span className="text-white font-medium">
                ${wallet.realizedPnl >= 1000 ? (wallet.realizedPnl / 1000).toFixed(1) + "K" : wallet.realizedPnl.toLocaleString()}
              </span>
            </td>
            <td className="table-cell">
              <span className="text-white font-medium">{wallet.winRate}%</span>
            </td>
            <td className="table-cell text-dark-300">{wallet.avgHoldTime}</td>
            <td className="table-cell">
              <div className="flex items-center gap-2">
                <div className="w-12 h-1.5 bg-dark-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      wallet.copyScore >= 80 ? "bg-accent-emerald" :
                      wallet.copyScore >= 60 ? "bg-accent-amber" :
                      "bg-accent-rose"
                    }`}
                    style={{ width: `${wallet.copyScore}%` }}
                  />
                </div>
                <span className="text-xs text-dark-300">{wallet.copyScore}</span>
              </div>
            </td>
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
