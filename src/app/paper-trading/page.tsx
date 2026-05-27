import { PageHeader, Card, StatCard, Table, Badge, Button } from "@/components/ui";
import { paperTrades, paperTradingSummary } from "@/lib/mock-data";

export default function PaperTradingPage() {
  const openTrades = paperTrades.filter((t) => t.status === "OPEN");
  const closedTrades = paperTrades.filter((t) => t.status === "CLOSED");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Paper Trading"
        description="Practice trading with virtual funds — no real money at risk"
        actions={
          <Button variant="primary" size="md">
            + New Trade
          </Button>
        }
      />

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Paper Balance"
          value={paperTradingSummary.totalBalance}
        />
        <StatCard
          label="Total P&L"
          value={paperTradingSummary.totalPnl}
          change={paperTradingSummary.totalPnlPercent}
          changeType="positive"
        />
        <StatCard
          label="Open Positions"
          value={String(paperTradingSummary.openPositions)}
        />
        <StatCard
          label="Win Rate"
          value={paperTradingSummary.winRate}
          changeType="positive"
        />
      </div>

      {/* Open Positions */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-3">Open Positions</h2>
        <Table headers={["Token", "Side", "Entry", "Current", "Qty", "P&L", "Opened", "Action"]}>
          {openTrades.map((trade) => (
            <tr key={trade.id} className="hover:bg-dark-800/40 transition-colors">
              <td className="table-cell">
                <span className="font-semibold text-white">{trade.token}</span>
              </td>
              <td className="table-cell">
                <Badge variant={trade.side === "LONG" ? "success" : "danger"}>
                  {trade.side}
                </Badge>
              </td>
              <td className="table-cell text-dark-300">
                ${trade.entryPrice}
              </td>
              <td className="table-cell text-white font-medium">
                ${trade.currentPrice}
              </td>
              <td className="table-cell text-dark-300">
                {trade.quantity.toLocaleString()}
              </td>
              <td className="table-cell">
                <div>
                  <span className={trade.pnl >= 0 ? "text-accent-emerald" : "text-accent-rose"}>
                    {trade.pnl >= 0 ? "+" : ""}${trade.pnl}
                  </span>
                  <span className={`ml-2 text-xs ${trade.pnlPercent >= 0 ? "text-accent-emerald" : "text-accent-rose"}`}>
                    ({trade.pnlPercent >= 0 ? "+" : ""}{trade.pnlPercent.toFixed(2)}%)
                  </span>
                </div>
              </td>
              <td className="table-cell text-dark-400 text-xs">{trade.openedAt}</td>
              <td className="table-cell">
                <Button variant="ghost" size="sm">Close</Button>
              </td>
            </tr>
          ))}
        </Table>
      </div>

      {/* Closed Positions */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-3">Trade History</h2>
        <Table headers={["Token", "Side", "Entry", "Exit", "Qty", "P&L", "Closed"]}>
          {closedTrades.map((trade) => (
            <tr key={trade.id} className="hover:bg-dark-800/40 transition-colors opacity-70">
              <td className="table-cell">
                <span className="font-semibold text-white">{trade.token}</span>
              </td>
              <td className="table-cell">
                <Badge variant={trade.side === "LONG" ? "success" : "danger"}>
                  {trade.side}
                </Badge>
              </td>
              <td className="table-cell text-dark-300">${trade.entryPrice}</td>
              <td className="table-cell text-white">${trade.currentPrice}</td>
              <td className="table-cell text-dark-300">{trade.quantity.toLocaleString()}</td>
              <td className="table-cell">
                <span className={trade.pnl >= 0 ? "text-accent-emerald" : "text-accent-rose"}>
                  {trade.pnl >= 0 ? "+" : ""}${trade.pnl} ({trade.pnlPercent >= 0 ? "+" : ""}{trade.pnlPercent.toFixed(2)}%)
                </span>
              </td>
              <td className="table-cell text-dark-400 text-xs">{trade.openedAt}</td>
            </tr>
          ))}
        </Table>
      </div>
    </div>
  );
}
