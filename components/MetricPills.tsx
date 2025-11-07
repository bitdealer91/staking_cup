"use client";
import { formatPct } from '@/lib/format';

type Props = { burnRate?: number; stakingApr?: number; realYield?: number };

// Expect these PNGs to be placed under public/assets/ (Figma export)
const ICONS = {
  burn: '/assets/mingcute_fire-line.png',
  rocket: '/assets/mingcute_rocket-line.png',
  diamond: '/assets/material-symbols_diamond-shine-outline.png',
  info: '/assets/material-symbols_diamond-shine-outline.png', // small info icon; replace if separate asset provided
};

function Pill({
  bgClass,
  icon,
  label,
  value
}: {
  bgClass: string;
  icon: string;
  label: string;
  value?: string;
}) {
  return (
    <div
      className={`relative h-[73px] w-[179px] rounded-leaderboardPill shadow-leaderboardSm flex flex-col items-start justify-center p-[32px] ${bgClass}`}
    >
      <div className="text-white text-3xl font-semibold font-polysans capitalize leading-8">
        {value ?? '--'}
      </div>
      <div className="flex items-center gap-1 text-white text-base font-normal font-polysans leading-4">
        <span className="leading-none">{label}</span>
        <img src={ICONS.info} alt="info" className="inline-block w-[18px] h-[18px] opacity-90" />
      </div>
      <div className="absolute -top-[13px] -left-[13px] h-9 w-9 rounded-full bg-[#1f1f1f] grid place-items-center">
        <img src={icon} alt="" className="w-5 h-5" />
      </div>
    </div>
  );
}

export default function MetricPills({ burnRate, stakingApr, realYield }: Props) {
  return (
    <div className="flex gap-[26px]">
      <Pill
        bgClass="bg-pillBlue"
        icon={ICONS.burn}
        label="Burn Rate"
        value={burnRate !== undefined ? formatPct(burnRate) : undefined}
      />
      <Pill
        bgClass="bg-pillPurple"
        icon={ICONS.rocket}
        label="Staking APR"
        value={stakingApr !== undefined ? formatPct(stakingApr) : undefined}
      />
      <Pill
        bgClass="bg-pillPink"
        icon={ICONS.diamond}
        label="Real Yield"
        value={realYield !== undefined ? formatPct(realYield) : undefined}
      />
    </div>
  );
}


