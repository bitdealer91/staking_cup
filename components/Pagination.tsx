"use client";
import { clsx } from 'clsx';

type Props = {
  page: number;
  pageCount: number;
  onPrev: () => void;
  onNext: () => void;
};

export default function Pagination({ page, pageCount, onPrev, onNext }: Props) {
  const isFirst = page <= 1;
  const isLast = page >= pageCount;
  const CTA_LEFT = 'http://localhost:3845/assets/37e9d0ff2bf605a93d8f366e172f8edceda17704.svg';
  const CTA_RIGHT = 'http://localhost:3845/assets/b81c35d25438112e9541dddbdaae0a0b80071ff6.svg';
  return (
    <div className="flex items-center justify-center gap-3">
      <button
        aria-label="Previous"
        className={clsx(
          'h-[50.003px] w-[50.005px] rounded-full grid place-items-center shadow-leaderboardSm',
          isFirst ? 'opacity-40 cursor-not-allowed' : 'hover:bg-white/10'
        )}
        onClick={onPrev}
        disabled={isFirst}
      >
        <img src={CTA_LEFT} alt="" className="w-[50.003px] h-[50.005px]" style={{ transform: 'scaleX(-1)' }} />
      </button>
      <button
        aria-label="Next"
        className={clsx(
          'h-[50.003px] w-[50.005px] rounded-full grid place-items-center shadow-leaderboardSm',
          isLast ? 'opacity-40 cursor-not-allowed' : 'hover:bg-white/10'
        )}
        onClick={onNext}
        disabled={isLast}
      >
        <img src={CTA_RIGHT} alt="" className="w-[50.003px] h-[50.005px]" />
      </button>
    </div>
  );
}


