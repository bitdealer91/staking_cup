"use client";
import Leaderboard from '@/components/Leaderboard';

export default function LeaderboardCard() {
  return (
    <div
      className="relative w-[1213px] rounded-[39px] shadow-cardShadow overflow-hidden bg-cardBg backdrop-blur-[20.55px]"
      data-testid="leaderboard-card"
    >
      {/* inset top highlight like in Figma */}
      <div className="pointer-events-none absolute inset-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.66)]" />
      <Leaderboard />
    </div>
  );
}





