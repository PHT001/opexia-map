'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, TrendingUp, FileText, Settings, Zap, Receipt, Search } from 'lucide-react';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/clients', label: 'Clients', icon: Users },
  { href: '/deals', label: 'Pipeline', icon: TrendingUp },
  { href: '/contracts', label: 'Contrats', icon: FileText },
  { href: '/facturation', label: 'Facturation', icon: Receipt },
  { href: '/scrapping', label: 'Scrapping', icon: Search },
  { href: '/settings', label: 'Paramètres', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-[260px] flex flex-col z-40"
      style={{
        background: 'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)',
        backdropFilter: 'blur(40px) saturate(1.3)',
        WebkitBackdropFilter: 'blur(40px) saturate(1.3)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="w-9 h-9 rounded-[10px] flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, rgba(94,158,255,0.8), rgba(94,158,255,0.5))',
            border: '1px solid rgba(255,255,255,0.15)',
            boxShadow: '0 4px 12px rgba(94,158,255,0.2), inset 0 1px 0 rgba(255,255,255,0.2)',
          }}
        >
          <Zap className="w-4 h-4 text-white" />
        </div>
        <div>
          <h1 className="text-[15px] font-bold text-text tracking-tight">REEL<span className="text-blue">CRM</span></h1>
          <p className="text-[9px] text-text-dim uppercase tracking-[0.15em] font-medium">Business Manager</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-5 space-y-0.5">
        {navItems.map((item) => {
          const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href} className={`nav-item ${isActive ? 'active' : ''}`}>
              <item.icon className="w-[16px] h-[16px]" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-5">
        <div className="glass-inset p-3.5 rounded-[14px]">
          <div className="flex items-center gap-2.5 mb-2.5">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
              style={{ background: 'linear-gradient(135deg, rgba(167,139,250,0.7), rgba(244,114,182,0.5))', border: '1px solid rgba(255,255,255,0.1)' }}
            >U</div>
            <div>
              <p className="text-[12px] font-medium text-text">Mon Espace</p>
              <p className="text-[10px] text-text-dim">Plan Pro</p>
            </div>
          </div>
          <div className="w-full h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <div className="h-full w-[72%] rounded-full" style={{ background: 'linear-gradient(90deg, rgba(94,158,255,0.6), rgba(94,158,255,0.3))' }} />
          </div>
          <p className="text-[10px] text-text-dim mt-1.5">72% du quota utilisé</p>
        </div>
      </div>
    </aside>
  );
}
