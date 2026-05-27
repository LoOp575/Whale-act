import { PageHeader, Card, Badge } from "@/components/ui";
import { signals } from "@/lib/mock-data";

function getSignalBadge(type: string) {
  switch (type) {
    case "STRONG_BUY":
      return <Badge variant="success" size="md">STRONG BUY</Badge>;
    case "BUY":
      return <Badge variant="info" size="md">BUY</Badge>;
    case "NEUTRAL":
      return <Badge variant="default" size="md">NEUTRAL</Badge>;
    case "SELL":
      return <Badge variant="warning" size="md">SELL</Badge>;
    case "STRONG_SELL":
      return <Badge variant="danger" size="md">STRONG SELL</Badge>;
    default:
      return <Badge variant="default" size="md">{type}</Badge>;
  }
}

export default function AISignalsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Signals"
        description="AI-powered trading signals based on whale activity patterns"
        actions={
          <div className="flex items-center gap-2 px-3 py-1.5 glass-card">
            <svg className="w-4 h-4 text-accent-violet" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
            <span className="text-xs font-medium text-accent-violet">AI Model v2.4</span>
          </div>
        }
      />

      {/* Signal Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {signals.map((signal) => (
          <Card key={signal.id} hover className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-dark-700/60 border border-dark-600/50 flex items-center justify-center">
                  <span className="text-sm font-bold text-white">{signal.token[0]}</span>
                </div>
                <div>
                  <h3 className="font-semibold text-white text-lg">{signal.token}</h3>
                  <p className="text-xs text-dark-400">{signal.timestamp}</p>
                </div>
              </div>
              {getSignalBadge(signal.type)}
            </div>

            {/* Confidence bar */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-dark-400">Confidence</span>
                <span className="text-xs font-medium text-white">{signal.confidence}%</span>
              </div>
              <div className="w-full h-1.5 bg-dark-700/60 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    signal.confidence >= 80
                      ? "bg-accent-emerald"
                      : signal.confidence >= 60
                      ? "bg-accent-amber"
                      : "bg-accent-rose"
                  }`}
                  style={{ width: `${signal.confidence}%` }}
                />
              </div>
            </div>

            {/* Reason */}
            <p className="text-sm text-dark-300 mb-4 leading-relaxed">{signal.reason}</p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 pt-3 border-t border-dark-700/30">
              <div>
                <p className="text-xs text-dark-500">Whales</p>
                <p className="text-sm font-medium text-white">{signal.whaleCount}</p>
              </div>
              <div>
                <p className="text-xs text-dark-500">24h Change</p>
                <p className={`text-sm font-medium ${signal.priceChange24h >= 0 ? "text-accent-emerald" : "text-accent-rose"}`}>
                  {signal.priceChange24h >= 0 ? "+" : ""}{signal.priceChange24h}%
                </p>
              </div>
              <div>
                <p className="text-xs text-dark-500">Volume</p>
                <p className="text-sm font-medium text-white">{signal.volume24h}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
