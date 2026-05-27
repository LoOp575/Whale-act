"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const icons = {
  dashboard: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zm10.5 0A2.25 2.25 0 0116.5 3.75h2.25A2.25 2.25 0 0121 6v2.25a2.25 2.25 0 01-2.25 2.25H16.5a2.25 2.25 0 01-2.25-2.25V6zM3.75 16.5A2.25 2.25 0 016 14.25h2.25a2.25 2.25 0 012.25 2.25v2.25A2.25 2.25 0 018.25 21H6a2.25 2.25 0 01-2.25-2.25v-2.25zm10.5 0a2.25 2.25 0 012.25-2.25h2.25A2.25 2.25 0 0121 16.5v2.25A2.25 2.25 0 0118.75 21H16.5a2.25 2.25 0 01-2.25-2.25v-2.25z" />
    </svg>
  ),
  wallets: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 013 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 013 6v3" />
    </svg>
  ),
  activity: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
    </svg>
  ),
  signals: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
    </svg>
  ),
  trading: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
    </svg>
  ),
  settings: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
};

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: icons.dashboard },
  { name: "Top Wallets", href: "/top-wallets", icon: icons.wallets },
  { name: "Live Activity", href: "/live-activity", icon: icons.activity },
  { name: "AI Signals", href: "/ai-signals", icon: icons.signals },
  { name: "Paper Trading", href: "/paper-trading", icon: icons.trading },
  { name: "Settings", href: "/settings", icon: icons.settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-dark-700/40">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-whale-500 to-accent-cyan flex items-center justify-center shadow-lg shadow-whale-500/20">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
          </svg>
        </div>
        <div>
          <h1 className="text-base font-bold text-white tracking-tight">WhaleCopy AI</h1>
          <p className="text-[11px] text-dark-400 font-medium">AI Whale Scanner</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`
                group flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium
                transition-all duration-200 ease-out
                ${isActive
                  ? "bg-gradient-to-r from-whale-600/25 to-whale-500/10 text-white border border-whale-500/30 shadow-sm shadow-whale-500/10"
                  : "text-dark-400 hover:text-white hover:bg-dark-700/40 border border-transparent"
                }
              `}
            >
              <span className={`transition-colors duration-200 ${isActive ? "text-whale-400" : "text-dark-500 group-hover:text-dark-200"}`}>
                {item.icon}
              </span>
              <span>{item.name}</span>
              {isActive && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-whale-400" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom status */}
      <div className="px-4 py-4 border-t border-dark-700/40">
        <div className="bg-dark-800/80 border border-dark-700/40 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-2 h-2 rounded-full bg-accent-emerald animate-pulse" />
            <span className="text-xs font-semibold text-accent-emerald">Scanner Active</span>
          </div>
          <p className="text-[11px] text-dark-500">Monitoring 142 wallets in real-time</p>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-dark-800/90 border border-dark-700/50 lg:hidden"
        aria-label="Open menu"
      >
        <svg className="w-5 h-5 text-dark-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={`
          fixed left-0 top-0 z-50 h-screen w-64 bg-dark-900 border-r border-dark-700/50 flex flex-col
          transition-transform duration-300 ease-out lg:hidden
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Close button */}
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-dark-700/50 text-dark-400 hover:text-white transition-colors"
          aria-label="Close menu"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        {sidebarContent}
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 z-40 h-screen w-64 bg-dark-900/95 backdrop-blur-xl border-r border-dark-700/50 flex-col">
        {sidebarContent}
      </aside>
    </>
  );
}
