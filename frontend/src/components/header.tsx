'use client';

import { LogOut } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/theme-toggle';
import { formatStatus } from '@/lib/format';

export function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="flex h-16 items-center justify-between border-b bg-card px-6">
      <div className="md:hidden text-lg font-bold">TransitOps</div>
      <div className="ml-auto flex items-center gap-3">
        <div className="hidden text-right sm:block">
          <p className="text-sm font-medium leading-none">{user?.name}</p>
          <p className="text-xs text-muted-foreground">{user?.email}</p>
        </div>
        {user && <Badge variant="secondary">{formatStatus(user.role)}</Badge>}
        <ThemeToggle />
        <Button variant="ghost" size="icon" onClick={logout} aria-label="Log out">
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
