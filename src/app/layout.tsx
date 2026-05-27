import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import DashboardShell from "@/components/layout/DashboardShell";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "WhaleCopy AI - Smart Crypto Trading Dashboard",
  description: "AI-powered whale wallet tracking and copy trading dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-dark-950 text-dark-100 antialiased`}>
        <DashboardShell>{children}</DashboardShell>
      </body>
    </html>
  );
}
