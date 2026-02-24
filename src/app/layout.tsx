'use client';

import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import AppShell from "@/components/AppShell";
import { useEffect } from "react";
import { seedData } from "@/lib/store";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    seedData();
  }, []);

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
