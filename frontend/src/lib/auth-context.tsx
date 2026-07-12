'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { api, tokenStore } from '@/lib/api';
import type { Role, User } from '@/lib/types';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasRole: (...roles: Role[]) => boolean;
}

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);
  const router = useRouter();

  React.useEffect(() => {
    const token = tokenStore.get();
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get<{ user: User }>('/auth/me')
      .then((res) => setUser(res.user))
      .catch(() => tokenStore.clear())
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.post<{ token: string; user: User }>(
      '/auth/login',
      { email, password },
      false
    );
    tokenStore.set(res.token);
    setUser(res.user);
    router.push('/dashboard');
  };

  const logout = () => {
    tokenStore.clear();
    setUser(null);
    router.push('/login');
  };

  // ADMIN passes every role check.
  const hasRole = (...roles: Role[]) =>
    !!user && (user.role === 'ADMIN' || roles.includes(user.role));

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
