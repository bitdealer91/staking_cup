'use client';

import {
  HeaderGraphics,
  StatsSection,
  Table,
  Tabs,
  Title,
  YieldRatesDisplay,
} from '@/components/staking';
import nodeCommitteeAbi from '@/components/abi/NodeCommitteeV2.json';
import type { Abi } from 'viem';
import { useReadContract } from 'wagmi';

export default function StakingPage() {
  const { data: validationCommittee } = useReadContract({
    address: process.env.NEXT_PUBLIC_NODE_COMMITTEE_ADDRESS as `0x${string}`,
    abi: nodeCommitteeAbi.abi as Abi,
    functionName: 'getCurrentEpochCommittee',
    query: {
      enabled: true,
      retry: 3,
      retryDelay: 500,
    },
  });

  return (
    <main className='pt-[148px] md:mx-[160px] mx-4'>
      <HeaderGraphics />
      <Title />
      <Tabs />
      <YieldRatesDisplay />
      <StatsSection validationCommittee={validationCommittee} />
      <Table />
    </main>
  );
}





