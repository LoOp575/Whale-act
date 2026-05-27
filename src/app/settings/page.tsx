import { PageHeader, Card, Button } from "@/components/ui";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Configure your WhaleCopy AI dashboard"
      />

      {/* General Settings */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4">General</h3>
        <div className="space-y-4">
          <SettingRow
            label="Display Name"
            description="Your profile display name"
          >
            <input
              type="text"
              defaultValue="Whale User"
              className="input-field w-64"
            />
          </SettingRow>
          <SettingRow
            label="Theme"
            description="Dashboard color theme"
          >
            <select className="input-field w-48">
              <option>Dark (Default)</option>
              <option>Midnight Blue</option>
              <option>Deep Space</option>
            </select>
          </SettingRow>
        </div>
      </Card>


      {/* Notifications */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Notifications</h3>
        <div className="space-y-4">
          <SettingRow
            label="Whale Alerts"
            description="Get notified on large transactions"
          >
            <ToggleSwitch defaultOn />
          </SettingRow>
          <SettingRow
            label="AI Signal Alerts"
            description="Notify on high-confidence signals"
          >
            <ToggleSwitch defaultOn />
          </SettingRow>
          <SettingRow
            label="Paper Trade Updates"
            description="P&L notifications for open positions"
          >
            <ToggleSwitch />
          </SettingRow>
        </div>
      </Card>

      {/* Tracking */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          Tracking Preferences
        </h3>
        <div className="space-y-4">
          <SettingRow
            label="Min Transaction Value"
            description="Only show txns above this USD value"
          >
            <input
              type="text"
              defaultValue="$10,000"
              className="input-field w-48"
            />
          </SettingRow>
          <SettingRow
            label="Auto-Track Threshold"
            description="Auto-track wallets with win rate above"
          >
            <input
              type="text"
              defaultValue="80%"
              className="input-field w-32"
            />
          </SettingRow>
        </div>
      </Card>

      {/* Save */}
      <div className="flex justify-end">
        <Button variant="primary" size="lg">
          Save Settings
        </Button>
      </div>
    </div>
  );
}


// Helper components
function SettingRow({
  label,
  description,
  children,
}: {
  label: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-dark-700/30 last:border-0">
      <div>
        <p className="text-sm font-medium text-white">{label}</p>
        <p className="text-xs text-dark-400 mt-0.5">{description}</p>
      </div>
      {children}
    </div>
  );
}

function ToggleSwitch({ defaultOn = false }: { defaultOn?: boolean }) {
  return (
    <button
      className={`w-11 h-6 rounded-full transition-colors relative ${
        defaultOn ? "bg-whale-500" : "bg-dark-600"
      }`}
    >
      <div
        className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${
          defaultOn ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}
