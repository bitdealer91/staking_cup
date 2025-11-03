"use client";
import Image from 'next/image';
import LeaderboardCard from './LeaderboardCard';

export default function Page() {
  return (
    <main className="flex justify-center py-0 px-0">
      <section className="relative w-[1440px] h-[2449px]">
        <Image
          src="/assets/hero-Qua.png"
          alt="Somnia Staking Cup – Qualifiers"
          fill
          priority
          sizes="1440px"
          className="object-cover"
        />
        <div className="absolute left-1/2 top-[869px] -translate-x-1/2 w-[1213px]">
          <LeaderboardCard />
        </div>
      </section>
    </main>
  );
}


