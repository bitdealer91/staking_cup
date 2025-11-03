"use client";
import { useEffect, useMemo, useRef, useState } from 'react';

export type Validator = {
  address: `0x${string}`;
  name?: string | null;
  totalStaked: bigint; // wei (18 decimals)
  delegationRate: number; // 0..1
  earnings: bigint; // wei
};

// Frontend-only mapping and allowlist
export const ALLOWLIST: `0x${string}`[] = [];
// Lowercased address -> display name (frontend-only mapping)
export const NAME_BY_ADDRESS: Record<string, string> = {
  // Dev examples (match mock addresses for visualization). Replace with your real list.
  '0x0000000000000000000000000000000000000001': 'Somniac United',
  '0x0000000000000000000000000000000000000002': 'Fox Guardians',
  '0x0000000000000000000000000000000000000003': 'Chicken City',
  '0x0000000000000000000000000000000000000004': 'Green Pitch',
  '0x0000000000000000000000000000000000000005': 'SOMI Stars'
};

export function normalizeAndFilter(list: Validator[]): Validator[] {
  return list
    .map((v) => ({
      ...v,
      name: NAME_BY_ADDRESS[v.address.toLowerCase()] ?? v.name ?? null
    }))
    .filter((v) => (ALLOWLIST.length ? (ALLOWLIST as string[]).includes(v.address) : true))
    .sort((a, b) => Number(b.totalStaked - a.totalStaked));
}

// Placeholder; will be wired to SDK later
export async function fetchAllValidatorsFromContract(): Promise<Validator[]> {
  // TEMP: Dev mock so the UI can be tuned pixel-perfect before SDK wiring
  const useMock = (process.env.NEXT_PUBLIC_USE_MOCK ?? '1') === '1';
  if (useMock) {
    const count = 35;
    const out: Validator[] = Array.from({ length: count }, (_, i) => {
      const addr = `0x${(i + 1).toString(16).padStart(40, '0')}` as `0x${string}`;
      const total = BigInt(5_000_000 + (count - i) * 25_000) * BigInt(1e18);
      const earn = BigInt(500 + i * 7) * BigInt(1e18);
      return {
        address: addr,
        name: `Validator Name`,
        totalStaked: total,
        delegationRate: 0.8,
        earnings: earn
      } satisfies Validator;
    });
    return out;
  }
  // TODO: replace with real contract call via SDK
  return [];
}

export function useValidators(pollMs = 30000) {
  const [data, setData] = useState<Validator[]>([]);
  const prevOrder = useRef<string[]>([]);

  useEffect(() => {
    let alive = true;
    async function load() {
      const raw = await fetchAllValidatorsFromContract();
      const next = normalizeAndFilter(raw);
      if (!alive) return;
      setData(next);
      prevOrder.current = next.map((v) => v.address);
    }
    load();
    const id = setInterval(load, pollMs);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [pollMs]);

  const rankByAddr = useMemo(() => {
    const m = new Map<string, number>();
    data.forEach((v, i) => m.set(v.address, i + 1));
    return m;
  }, [data]);

  return { validators: data, rankByAddr, prevOrder } as const;
}


