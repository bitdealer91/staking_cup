"use client";

import { useEffect, useState } from 'react';
import { fetchDelegatorRank } from '@/lib/subgraph';

export function useDelegatorRank(validatorAddress?: string, stakerId?: string) {
  const [rank, setRank] = useState<number | null>(null);
  const [thresholdWei, setThresholdWei] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!validatorAddress || !stakerId) return;
      try {
        setLoading(true);
        setError(null);
        const res = await fetchDelegatorRank(validatorAddress, stakerId, '0', 1000, 20);
        if (!active) return;
        setRank(res.rank);
        setThresholdWei(res.top10ThresholdWei);
      } catch (e: any) {
        if (!active) return;
        setError(e?.message || 'Failed to get rank');
        setRank(null);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [validatorAddress, stakerId]);

  return { rank, thresholdWei, loading, error };
}




