"use client";
import { useEffect, useState } from 'react';
import { fetchTopDelegators, TopDelegator } from '@/lib/subgraph';
import { formatSOMI } from '@/lib/format';
import { formatEther } from 'viem';

export interface UiDelegator {
  stakerId: string;
  amountWei: string;
  formattedAmount: string;
}

export function useTopDelegators(validatorAddress?: string, first = 10) {
  const [delegators, setDelegators] = useState<UiDelegator[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function run() {
      if (!validatorAddress) return;
      try {
        setLoading(true);
        setError(null);
        const data = await fetchTopDelegators(validatorAddress, first, '0'); // include all, even 1 SOMI
        if (!active) return;
        const ui = data.map((d) => ({
          stakerId: d.stakerId,
          amountWei: d.amountWei,
          formattedAmount: `${Number(formatEther(BigInt(d.amountWei))).toLocaleString('en-US', { maximumFractionDigits: 4 })} SOMI`,
        }));
        setDelegators(ui);
      } catch (e: any) {
        if (!active) return;
        setError(e?.message || 'Failed to load');
      } finally {
        if (active) setLoading(false);
      }
    }
    run();
    return () => { active = false; };
  }, [validatorAddress, first]);

  return { delegators, loading, error };
}




