"use client";
import Image from 'next/image';
import LeaderboardCard from './LeaderboardCard';
import SiteHeader from '@/components/SiteHeader';

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
        <div className="absolute left-0 top-0 w-full">
          <SiteHeader />
        </div>
        {/* Trophy shine overlay (landing effect) */}
        <div className="absolute left-1/2 top-[250px] -translate-x-1/2 ml-[24px] z-[2] pointer-events-none">
          <div className="trophy-shines" aria-hidden="true">
            <span className="shine shine-top"></span>
          </div>
        </div>
        <div className="absolute left-1/2 top-[869px] -translate-x-1/2 w-[1213px]">
          <LeaderboardCard />
        </div>
      </section>
    </main>
  );
}


