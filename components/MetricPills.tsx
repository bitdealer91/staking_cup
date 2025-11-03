"use client";
import { formatPct } from '@/lib/format';

type Props = { burnRate?: number; stakingApr?: number; realYield?: number };

const ICONS = {
  burn: 'http://localhost:3845/assets/1f02168d25d9007dc8cc90f0dfab8c032887485d.svg',
  rocket: 'http://localhost:3845/assets/b3632efe8cf0e78a3a390b167fee3134af3801cd.svg',
  diamond: 'http://localhost:3845/assets/db8e6375036bd816c3adc13bd937e6632766588d.svg',
  info: 'http://localhost:3845/assets/90216cda230668eac99ed2dc032e74586f7eca56.svg'
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


