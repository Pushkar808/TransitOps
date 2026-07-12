'use client';

import { LogOut, Bell } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { formatStatus } from '@/lib/format';

// Maps route paths to page titles
const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/vehicles': 'Vehicle Registry',
  '/drivers': 'Driver Management',
  '/trips': 'Trip Management',
  '/maintenance': 'Maintenance',
  '/finance': 'Fuel & Expenses',
  '/reports': 'Reports & Analytics',
  '/admin': 'Access Requests',
};

export function Header() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const pageTitle = PAGE_TITLES[pathname] ?? 'TransitOps';

  return (
    <header
      className="flex h-16 items-center justify-between px-6"
      style={{
        background: 'rgba(0,0,0,0.5)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }}
    >
      {/* Left: page title */}
      <div>
        <h2 className="text-sm font-semibold text-white/90 tracking-wide">{pageTitle}</h2>
        <p className="text-[11px] text-white/35 mt-0.5">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-2">
        {/* User pill */}
        {user && (
          <div
            className="hidden sm:flex items-center gap-3 rounded-xl px-3 py-2"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <div
              className="flex h-7 w-7 items-center justify-center rounded-lg text-xs font-semibold text-white"
              style={{ background: 'rgba(255,255,255,0.12)' }}
            >
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="text-right">
              <p className="text-xs font-medium text-white/80 leading-none">{user.name}</p>
              <p className="text-[10px] text-white/35 mt-0.5">{formatStatus(user.role)}</p>
            </div>
          </div>
        )}

        {/* Logout */}
        <button
          onClick={logout}
          aria-label="Log out"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-white/40 hover:text-white/80 hover:bg-white/8 transition-all duration-200"
          style={{ transition: 'all 0.2s' }}
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
