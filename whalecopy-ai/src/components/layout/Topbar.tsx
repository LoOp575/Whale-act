"use client";

export default function Topbar() {
  return (
    <header className="sticky top-0 z-30 h-16 bg-dark-900/80 backdrop-blur-xl border-b border-dark-700/50 flex items-center justify-between px-6">
      {/* Left: Search */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search wallets, tokens..."
            className="w-72 pl-10 pr-4 py-2 bg-dark-800/60 border border-dark-700/50 rounded-lg text-sm text-dark-200 placeholder:text-dark-500 focus:outline-none focus:border-whale-500/50 focus:ring-1 focus:ring-whale-500/20 transition-all"
          />
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-4">
        {/* Network status */}
        <div className="flex items-center gap-2 px-3 py-1.5 glass-card">
          <div className="w-2 h-2 rounded-full bg-accent-emerald" />
          <span className="text-xs font-medium text-dark-300">Solana Mainnet</span>
        </div>

        {/* Notifications */}
        <button className="relative p-2 rounded-lg hover:bg-dark-700/50 transition-colors">
          <svg className="w-5 h-5 text-dark-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
            />
          </svg>
          <span className="absolute top-1 right-1 w-2 h-2 bg-accent-rose rounded-full" />
        </button>

        {/* Profile */}
        <div className="flex items-center gap-3 pl-4 border-l border-dark-700/50">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-whale-500 to-accent-violet flex items-center justify-center">
            <span className="text-xs font-bold text-white">W</span>
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium text-white">Whale User</p>
            <p className="text-xs text-dark-400">Pro Plan</p>
          </div>
        </div>
      </div>
    </header>
  );
}
