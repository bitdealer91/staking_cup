"use client";
import { useEffect, useMemo, useRef, useState } from 'react';
import { useAccount } from 'wagmi';
import { Validator, useValidators } from '@/lib/validators';
import { formatPct, formatSOMI, shortAddr } from '@/lib/format';
import Pagination from '@/components/Pagination';
import { toast } from 'react-hot-toast';
import MetricPills from '@/components/MetricPills';
// Figma assets (vectors/lines) extracted from node 75:133
const ASSETS = {
  arrow4719: 'http://localhost:3845/assets/25c85fdec3716e9f451bfea000f8c43252de616d.svg',
  arrow4720: 'http://localhost:3845/assets/a3a1c3ab5b124e3dd1461f8c2d2f0ae8ea10b221.svg',
  line79: 'http://localhost:3845/assets/4f0bdab5b47b4c190c23ec54e01ea914357fa335.svg'
};

const HEADER_ARROW_PATH = "M-0.000114955 53.2895L10.5721 49.0693L1.72114 41.687L-0.000114955 53.2895ZM3.48876 0.624901L2.71122 2.86495e-05L1.50988 1.60523L2.28742 2.2301L2.88809 1.4275L3.48876 0.624901ZM3.29592 48.7403L4.10895 49.3146C4.67876 48.4475 5.2294 47.563 5.75865 46.6636L4.91905 46.132L4.07945 45.6004C3.56733 46.4707 3.03442 47.3267 2.48289 48.166L3.29592 48.7403ZM6.88127 42.5272L7.75373 42.9984C8.22308 42.062 8.66811 41.114 9.08652 40.1569L8.19113 39.7346L7.29574 39.3123C6.89209 40.2357 6.4624 41.1511 6.00882 42.0559L6.88127 42.5272ZM9.70076 35.9022L10.6244 36.2526C10.9745 35.2545 11.2937 34.2502 11.5796 33.2424L10.6368 32.9524L9.69397 32.6624C9.42005 33.6282 9.11369 34.5922 8.77708 35.5519L9.70076 35.9022ZM11.5879 28.9309L12.5523 29.1292C12.7502 28.0791 12.9086 27.0287 13.0245 25.9814L12.0484 25.8618L11.0722 25.7422C10.9624 26.7344 10.8121 27.7321 10.6236 28.7325L11.5879 28.9309ZM12.2723 21.7266L13.2548 21.7253C13.2495 20.6476 13.1938 19.5776 13.0841 18.5188L12.1072 18.6235L11.1302 18.7282C11.2325 19.7151 11.2848 20.7161 11.2898 21.7279L12.2723 21.7266ZM11.3844 14.549L12.334 14.2914C12.0666 13.2487 11.7382 12.2234 11.3454 11.2197L10.4349 11.5987L9.52453 11.9776C9.88545 12.8997 10.188 13.8437 10.4349 14.8065L11.3844 14.549ZM8.61342 7.90712L9.4452 7.36894C8.89711 6.46438 8.28563 5.58615 7.60808 4.7378L6.85181 5.38421L6.09555 6.03061C6.71824 6.81027 7.27927 7.61619 7.78164 8.44529L8.61342 7.90712ZM4.05346 2.41954L4.69732 1.65373C4.30887 1.30334 3.90609 0.960293 3.48876 0.624901L2.88809 1.4275L2.28742 2.2301C2.67566 2.54212 3.04962 2.86065 3.4096 3.18536L4.05346 2.41954Z";

const ROWS_PER_PAGE = 10;

type SortKey = 'name' | 'totalStaked' | 'delegationRate' | 'earnings';

export default function Leaderboard() {
  const { validators } = useValidators(30000);
  const [page, setPage] = useState(1);
  const { address } = useAccount();
  const [activeBtn, setActiveBtn] = useState<null | 'choose' | 'see'>(null);
  const [sortKey, setSortKey] = useState<SortKey>('totalStaked');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const [highlights, setHighlights] = useState<Record<string, 'up' | 'down'>>({});
  const lastRankRef = useRef<Map<string, number>>(new Map());

  const sorted = useMemo(() => {
    const list = [...validators];
    list.sort((a, b) => {
      if (sortKey === 'name') {
        const an = (a.name ?? shortAddr(a.address)).toLowerCase();
        const bn = (b.name ?? shortAddr(b.address)).toLowerCase();
        const cmp = an.localeCompare(bn);
        return sortDir === 'asc' ? cmp : -cmp;
      }
      const av = sortKey === 'totalStaked' ? a.totalStaked : sortKey === 'delegationRate' ? a.delegationRate : a.earnings;
      const bv = sortKey === 'totalStaked' ? b.totalStaked : sortKey === 'delegationRate' ? b.delegationRate : b.earnings;
      return sortDir === 'asc' ? Number(av) - Number(bv) : Number(bv) - Number(av);
    });
    return list;
  }, [validators, sortKey, sortDir]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / ROWS_PER_PAGE));
  const pageItems = useMemo(() => {
    const start = (page - 1) * ROWS_PER_PAGE;
    return sorted.slice(start, start + ROWS_PER_PAGE);
  }, [sorted, page]);

  useEffect(() => {
    // Reset page if out of range
    if (page > pageCount) setPage(1);
  }, [pageCount, page]);

  useEffect(() => {
    // Rank map for new data
    const rank = new Map<string, number>();
    sorted.forEach((v, i) => rank.set(v.address, i + 1));

    const last = lastRankRef.current;
    const delta: Record<string, 'up' | 'down'> = {};
    sorted.forEach((v) => {
      const prev = last.get(v.address);
      const next = rank.get(v.address)!;
      if (prev && prev !== next) {
        delta[v.address] = next < prev ? 'up' : 'down';
      }
    });
    if (Object.keys(delta).length) {
      setHighlights(delta);
      const t = setTimeout(() => setHighlights({}), 800);
      return () => clearTimeout(t);
    }
    lastRankRef.current = rank;
  }, [sorted]);

  const scrollToSelf = () => {
    if (!address) {
      toast.error('Connect wallet to find your position');
      return;
    }
    const el = document.querySelector(`[data-testid="row-${address}"]`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('self-highlight');
      setTimeout(() => el.classList.remove('self-highlight'), 1000);
    }
  };

  useEffect(() => {
    const onSee = () => scrollToSelf();
    window.addEventListener('see-position', onSee as EventListener);
    return () => window.removeEventListener('see-position', onSee as EventListener);
  }, [address, validators]);

  // Fixed template columns from Figma widths (px): 208, 208, 207, 208, 208
  const gridCols = 'grid-cols-[208px_208px_207px_208px_208px]';

  return (
    <div className="relative overflow-hidden mx-auto w-[1213px] p-0" data-testid="leaderboard-card">
      {/* Title */}
      <div className="pt-[32px] px-[40px]">
        <h3 className="font-led text-leaderboardTitle tracking-leaderboardTitle text-leaderboardTitle text-center [text-shadow:rgba(0,0,0,0.92)_1px_1px_0px]">
          LEADERBOARD
        </h3>
      </div>

  {/* Header action area positioned exactly by Figma coords */}
  <div className="relative h-[180px] mt-[0px]">
    {/* Choose your team (75:136) */}
    <button
      className={`absolute top-[93px] left-[32px] w-[246px] h-[69px] rounded-[16px] font-soccer italic uppercase text-[26px] leading-[0] tracking-[0.52px] text-ctaNeon [text-shadow:#000_0px_3px_0px] transition-colors ${
        activeBtn === 'choose' ? 'bg-ctaGreenLight shadow-[0px_4px_0px_#000]' : 'bg-ctaGreenDark shadow-none'
      }`}
      onClick={() => { setActiveBtn('choose'); window.dispatchEvent(new Event('open-team')); }}
    >
      Choose your team
    </button>
    {/* See your position (75:134) */}
    <button
      className={`absolute top-[93px] left-[291px] w-[246px] h-[69px] rounded-[16px] font-soccer italic uppercase text-[26px] leading-[0] tracking-[0.52px] text-ctaNeon [text-shadow:#000_0px_3px_0px] transition-colors ${
        activeBtn === 'see' ? 'bg-ctaGreenLight shadow-[0px_4px_0px_#000]' : 'bg-ctaGreenDark shadow-none'
      }`}
      onClick={() => { setActiveBtn('see'); scrollToSelf(); }}
    >
      See your position
    </button>
    {/* Left arrow: per Figma (Vector 4719), pointing to table */}
    <svg
      width={27.246}
      height={36.545}
      viewBox="0 0 14 54"
      xmlns="http://www.w3.org/2000/svg"
      className="absolute z-30"
      style={{
        left: '47.129px',
        top: '162.975px',
        transform: 'rotate(198deg) scaleY(-1)',
        transformOrigin: 'top left',
        opacity: activeBtn === 'choose' ? 1 : 0.24,
        pointerEvents: 'none'
      }}
    >
      <path d={HEADER_ARROW_PATH} fill="#ffffff" />
    </svg>
    {/* Vertical divider between left controls and pills */}
    <div className="absolute left-[563px] top-[86px] w-px h-[82px] bg-lime-600/60" />
    {/* Metric pills positioned by Figma */}
    <div className="absolute left-[590px] top-[90px] flex gap-[26px] items-center">
      <MetricPills burnRate={0.000695} stakingApr={0.0029} realYield={0.0036} />
    </div>
    {/* Right vector arrow (fuchsia), absolute positioned per Figma */}
    {/* Right arrow: per Figma (Vector 4720) */}
    <svg
      width={40.052}
      height={31.794}
      viewBox="0 0 14 54"
      xmlns="http://www.w3.org/2000/svg"
      className="absolute z-50"
      style={{
        left: '520.52px',
        top: '169.98px',
        transform: 'rotate(310.902deg)',
        transformOrigin: 'top left',
        opacity: activeBtn === 'see' ? 1 : 0.24,
        pointerEvents: 'none'
      }}
    >
      <path d={HEADER_ARROW_PATH} fill="#ffffff" />
    </svg>
  </div>

  {/* Divider removed per latest design feedback */}

      {/* Table inner container with rounded contour starting below the divider */}
      <div className="relative mx-auto w-[1148px] rounded-[16px] overflow-hidden">
        <div className={`grid ${gridCols} items-center px-[40px] py-[29px] bg-rowStripeAlt gap-[9px]`} style={{ height: '70px' }}>
        {/* Validator: now a pill with its own border and sorting */}
        <button
          aria-sort={sortKey === 'name' ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
          className="flex items-center justify-center gap-[6px] h-[40px] focus:outline-none active:outline-none select-none"
          onClick={() => {
            if (sortKey === 'name') setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
            setSortKey('name');
          }}
        >
          <div className="bg-leaderboardHeaderCell rounded-[6px] px-[10px] py-[9px] mt-[-17px]">
            <div className={`box-border h-[18px] w-[188px] rounded-[6px] flex items-center justify-center gap-[6px] border-[0.5px] ${sortKey==='name' ? 'border-transparent' : 'border-headerPillBorder'} transform-gpu`}>
              <span className="text-leaderboardCell text-black leading-none">Validator</span>
              <div className="flex flex-col items-center justify-center ml-[6px]">
                <svg viewBox="0 0 24 24" className={`w-[10px] h-[10px] ${sortKey==='name' && sortDir==='asc' ? 'text-arrowActive' : 'text-arrowInactive'}`} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 14l6-6 6 6"/></svg>
                <svg viewBox="0 0 24 24" className={`w-[10px] h-[10px] -mt-[6px] ${sortKey==='name' && sortDir==='desc' ? 'text-arrowActive' : 'text-arrowInactive'}`} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 10l6 6 6-6"/></svg>
              </div>
              <span className="inline-block w-[18px] h-[18px] text-arrowInactive">ⓘ</span>
            </div>
          </div>
        </button>
          {/* Tinted header cells with icons */}
          <button
            className="flex items-center justify-center gap-[6px] focus:outline-none active:outline-none select-none"
            onClick={() => {
              if (sortKey === 'totalStaked') setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
              setSortKey('totalStaked');
            }}
          >
            <div className="bg-leaderboardHeaderCell rounded-[6px] px-[10px] py-[9px] mt-[-17px]">
              <div className={`box-border h-[18px] w-[188px] rounded-[6px] flex items-center justify-center gap-[5px] border-[0.5px] ${sortKey==='totalStaked' ? 'border-transparent' : 'border-headerPillBorder'} transform-gpu`}>
                <span className="text-leaderboardCell text-[#343434] leading-none">Total staked</span>
                <div className="flex flex-col items-center justify-center ml-[6px]">
                  <svg viewBox="0 0 24 24" className={`w-[10px] h-[10px] ${sortKey==='totalStaked' && sortDir==='asc' ? 'text-arrowActive' : 'text-arrowInactive'}`} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 14l6-6 6 6"/></svg>
                  <svg viewBox="0 0 24 24" className={`w-[10px] h-[10px] -mt-[6px] ${sortKey==='totalStaked' && sortDir==='desc' ? 'text-arrowActive' : 'text-arrowInactive'}`} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 10l6 6 6-6"/></svg>
                </div>
                <span className="inline-block w-[18px] h-[18px] text-arrowInactive">ⓘ</span>
              </div>
            </div>
          </button>
          <div className="flex items-center justify-center gap-[6px]">
            <button
              aria-sort={sortKey === 'delegationRate' ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
              className="flex items-center justify-center gap-[6px] focus:outline-none active:outline-none select-none"
              onClick={() => {
                if (sortKey === 'delegationRate') setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
                setSortKey('delegationRate');
              }}
            >
              <div className="bg-leaderboardHeaderCell rounded-[6px] px-[10px] py-[9px] mt-[-17px]">
                <div className={`box-border h-[18px] w-[188px] rounded-[6px] flex items-center justify-center gap-[6px] border-[0.5px] ${sortKey==='delegationRate' ? 'border-transparent' : 'border-headerPillBorder'} transform-gpu`}>
                  <span className="text-leaderboardCell text-[#343434] leading-none whitespace-nowrap">Delegation rate</span>
                  <div className="flex flex-col items-center justify-center ml-[6px]">
                    <svg viewBox="0 0 24 24" className={`w-[10px] h-[10px] ${sortKey==='delegationRate' && sortDir==='asc' ? 'text-arrowActive' : 'text-arrowInactive'}`} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 14l6-6 6 6"/></svg>
                    <svg viewBox="0 0 24 24" className={`w-[10px] h-[10px] -mt-[6px] ${sortKey==='delegationRate' && sortDir==='desc' ? 'text-arrowActive' : 'text-arrowInactive'}`} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 10l6 6 6-6"/></svg>
                  </div>
                  <span className="inline-block w-[18px] h-[18px] text-arrowInactive">ⓘ</span>
                </div>
              </div>
            </button>
          </div>
          <div className="flex items-center justify-center gap-[6px]">
            <button
              aria-sort={sortKey === 'earnings' ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
              className="flex items-center justify-center gap-[6px] focus:outline-none active:outline-none select-none"
              onClick={() => {
                if (sortKey === 'earnings') setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
                setSortKey('earnings');
              }}
            >
              <div className="bg-leaderboardHeaderCell rounded-[6px] px-[10px] py-[9px] mt-[-17px]">
                <div className={`box-border h-[18px] w-[188px] rounded-[6px] flex items-center justify-center gap-[6px] border-[0.5px] ${sortKey==='earnings' ? 'border-transparent' : 'border-headerPillBorder'} transform-gpu`}>
                  <span className="text-leaderboardCell text-[#343434] leading-none">Earnings</span>
                  <div className="flex flex-col items-center justify-center ml-[6px]">
                    <svg viewBox="0 0 24 24" className={`w-[10px] h-[10px] ${sortKey==='earnings' && sortDir==='asc' ? 'text-arrowActive' : 'text-arrowInactive'}`} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 14l6-6 6 6"/></svg>
                    <svg viewBox="0 0 24 24" className={`w-[10px] h-[10px] -mt-[6px] ${sortKey==='earnings' && sortDir==='desc' ? 'text-arrowActive' : 'text-arrowInactive'}`} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 10l6 6 6-6"/></svg>
                  </div>
                  <span className="inline-block w-[18px] h-[18px] text-arrowInactive">ⓘ</span>
                </div>
              </div>
            </button>
          </div>
          <div className="flex items-center justify-center gap-[6px]">
            <div className="bg-leaderboardHeaderCell rounded-[6px] px-[10px] py-[9px] mt-[-17px]">
              <div className="box-border h-[18px] w-[188px] rounded-[6px] flex items-center justify-center gap-[6px] border-[0.5px] border-headerPillBorder transform-gpu">
                <span className="text-leaderboardCell text-[#343434] leading-none">Actions</span>
                <span className="inline-block w-[18px] h-[18px] text-arrowInactive">ⓘ</span>
              </div>
            </div>
          </div>
        </div>
        <div>
          {pageItems.map((v) => (
            <Row key={v.address} v={v} highlight={highlights[v.address]} />
          ))}
        </div>
      </div>

      {/* Footer actions */}
      <div className="px-[40px] py-4 w-[1148px] mx-auto">
        <Pagination
          page={page}
          pageCount={pageCount}
          onPrev={() => setPage((p) => Math.max(1, p - 1))}
          onNext={() => setPage((p) => Math.min(pageCount, p + 1))}
        />
      </div>
    </div>
  );
}

function HeaderCell({ label, active = false }: { label: string; active?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`px-[10px] py-[9px] rounded-[6px] ${active ? 'bg-leaderboardHeaderCell' : 'bg-leaderboardHeaderCell'}`}>
        <span className="text-leaderboardCell text-[#343434] font-medium leading-none">{label}</span>
      </div>
    </div>
  );
}

function Row({ v, highlight }: { v: Validator; highlight?: 'up' | 'down' }) {
  const name = v.name ?? shortAddr(v.address);
  return (
    <div
      className={`grid grid-cols-[208px_208px_207px_208px_208px] items-center px-[40px] h-[70px] odd:bg-rowStripe even:bg-rowStripeAlt gap-[9px] ${
        highlight === 'up' ? 'animate-rankUp' : highlight === 'down' ? 'animate-rankDown' : ''
      }`}
      data-testid={`row-${v.address}`}
    >
      <div className="flex items-center justify-start">
        <div className="w-[188px] ml-[10px] flex items-center gap-[13px] justify-start">
          <div
            className="h-[35px] w-[35px] rounded-full"
            style={{ backgroundColor: colorFromAddress(v.address) }}
          />
          <span className="text-leaderboardCell text-black font-medium leading-none">{name}</span>
        </div>
      </div>
      <div className="w-[188px] mx-auto rounded-leaderboardTiny flex items-center justify-center">
        <span className="text-leaderboardCell text-[#343434] leading-none text-center">{formatSOMI(v.totalStaked)} SOMI</span>
      </div>
      <div className="w-[188px] mx-auto rounded-leaderboardTiny flex items-center justify-center">
        <span className="text-leaderboardCell text-[#343434] leading-none text-center">{formatPct(v.delegationRate)}</span>
      </div>
      <div className="w-[188px] mx-auto rounded-leaderboardTiny flex items-center justify-center">
        <span className="text-leaderboardCell text-[#343434] leading-none text-center">{formatSOMI(v.earnings)} SOMI</span>
      </div>
      <div className="w-[188px] mx-auto flex items-center justify-center">
        <button
          className="bg-actionPrimary text-white text-leaderboardCell rounded-leaderboardSmall px-[25px] py-[14px] shadow-leaderboardSm"
          data-testid={`delegate-${v.address}`}
        >
          Delegate
        </button>
      </div>
    </div>
  );
}

const PALETTE = ['#FF6BB5', '#4BC0FF', '#9B7BFF', '#34D399', '#F87171', '#F59E0B', '#22D3EE', '#A3E635'];
function colorFromAddress(addr: string) {
  let h = 0;
  for (let i = 2; i < addr.length; i++) h = (h * 31 + addr.charCodeAt(i)) >>> 0;
  return PALETTE[h % PALETTE.length];
}


