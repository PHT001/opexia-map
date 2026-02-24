import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import AppShell from "@/components/AppShell";

export const metadata: Metadata = {
  title: "REELCRM - B2B Client Manager",
  description: "Gestion de clients B2B ultra-optimisée",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="bg-bg min-h-screen">
        <div className="ambient" />
        <Sidebar />
        <main className="ml-[260px] min-h-screen relative z-10">
          <AppShell>{children}</AppShell>
        </main>
      </body>
    </html>
  );
}
