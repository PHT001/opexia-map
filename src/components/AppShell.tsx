'use client';

import { useEffect } from 'react';
import { seedData } from '@/lib/store';

export default function AppShell({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    seedData();
  }, []);

  return <>{children}</>;
}
