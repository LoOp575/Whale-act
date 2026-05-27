"use client";

export default function Topbar() {
  return (
    <header className="sticky top-0 z-30 h-16 bg-dark-900/80 backdrop-blur-xl border-b border-dark-700/50 flex items-center justify-between px-4 sm:px-6">
      {/* Left: Search */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="relative w-full max-w-xs sm:max-w-sm">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500"
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
            placeholder="Search wallet or token..."
            className="w-full pl-10 pr-4 py-2 bg-dark-800/50 border border-dark-700/40 rounded-lg text-sm text-dark-200 placeholder:text-dark-500 focus:outline-none focus:border-whale-500/50 focus:ring-1 focus:ring-whale-500/20 transition-all"
            readOnly
          />
        </div>
      </div>

      {/* Right: Badges + Button */}
      <div className="flex items-center gap-2 sm:gap-3 ml-3 flex-shrink-0">
        {/* Paper Mode badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 bg-accent-amber/10 border border-accent-amber/25 rounded-lg">
          <div className="w-1.5 h-1.5 rounded-full bg-accent-amber" />
          <span className="text-xs font-medium text-accent-amber whitespace-nowrap">Paper Mode</span>
        </div>

        {/* AI Scanner Active badge */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 bg-accent-emerald/10 border border-accent-emerald/25 rounded-lg">
          <div className="w-1.5 h-1.5 rounded-full bg-accent-emerald animate-pulse" />
          <span className="text-xs font-medium text-accent-emerald whitespace-nowrap">AI Scanner Active</span>
        </div>

        {/* Refresh Scan button */}
        <button className="inline-flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-whale-600 to-whale-500 hover:from-whale-500 hover:to-whale-400 text-white text-xs sm:text-sm font-medium rounded-lg transition-all duration-200 shadow-md shadow-whale-600/20 hover:shadow-whale-500/30 active:scale-95">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
          <span className="hidden sm:inline">Refresh Scan</span>
        </button>
      </div>
    </header>
  );
}
