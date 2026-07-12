'use client';

import * as React from 'react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

// Simple data-fetching hook with loading/error/refetch semantics.
export function useFetch<T>(path: string | null) {
  const [data, setData] = React.useState<T | null>(null);
  const [loading, setLoading] = React.useState(true);

  const refetch = React.useCallback(async () => {
    if (!path) return;
    setLoading(true);
    try {
      const res = await api.get<T>(path);
      setData(res);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [path]);

  React.useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, loading, refetch, setData };
}
