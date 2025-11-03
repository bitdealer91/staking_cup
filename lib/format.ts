export const formatSOMI = (wei: bigint) =>
  Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(Number(wei) / 1e18);

export const formatPct = (x: number) => (x * 100).toFixed(1) + '%';

export const shortAddr = (a: string) => a.slice(0, 6) + '…' + a.slice(-4);


