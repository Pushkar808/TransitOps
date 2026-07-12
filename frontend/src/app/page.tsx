'use client';

import { redirect } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

// Landing page routes to dashboard or login based on auth state.
export default function Home() {
  const { user, loading } = useAuth();
  if (loading) return null;
  redirect(user ? '/dashboard' : '/login');
}
