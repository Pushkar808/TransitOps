'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Truck,
  Users,
  Route,
  Wrench,
  Fuel,
  BarChart3,
  ShieldCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth-context';
import type { Role } from '@/lib/types';

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: Role[];
}

const NAV: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/vehicles', label: 'Vehicles', icon: Truck },
  { href: '/drivers', label: 'Drivers', icon: Users },
  { href: '/trips', label: 'Trips', icon: Route },
  { href: '/maintenance', label: 'Maintenance', icon: Wrench },
  { href: '/finance', label: 'Fuel & Expenses', icon: Fuel },
  { href: '/reports', label: 'Reports', icon: BarChart3 },
  { href: '/admin', label: 'Access Requests', icon: ShieldCheck, roles: ['ADMIN'] as Role[] },
];

export function Sidebar() {
  const pathname = usePathname();
  const { hasRole } = useAuth();

  const visible = NAV.filter((n) => !n.roles || hasRole(...n.roles));

  return (
    <aside
      className="hidden w-64 flex-col md:flex"
      style={{
        background: 'rgba(0,0,0,0.6)',
        borderRight: '1px solid rgba(255,255,255,0.07)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
    >
      {/* Logo */}
      <div
        className="flex h-16 items-center gap-3 px-6"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
      >
        <div
          className="flex h-8 w-8 items-center justify-center rounded-lg"
          style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.18)' }}
        >
          <Truck className="h-4 w-4 text-white" />
        </div>
        <span className="text-base font-semibold tracking-tight text-white">TransitOps</span>
      </div>

      {/* Nav items */}
      <nav className="flex-1 space-y-0.5 px-3 py-4">
        <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-widest text-white/25">
          Navigation
        </p>
        {visible.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                active
                  ? 'nav-active text-white'
                  : 'text-white/45 hover:bg-white/5 hover:text-white/80'
              )}
            >
              <Icon
                className={cn(
                  'h-4 w-4 transition-colors duration-200 flex-shrink-0',
                  active ? 'text-white' : 'text-white/35 group-hover:text-white/70'
                )}
              />
              {item.label}
              {active && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-white/70" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div
        className="px-3 pb-4"
        style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}
      >
        <div
          className="mt-4 rounded-xl px-3 py-3"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <p className="text-[11px] font-medium text-white/40">Fleet Ops Platform</p>
          <p className="text-[10px] text-white/25 mt-0.5">v1.0 · All systems operational</p>
        </div>
      </div>
    </aside>
  );
}
