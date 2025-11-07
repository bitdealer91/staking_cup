'use client';

import { Card, CardContent } from '@/components/ui/card';
import { StatCard } from './StatCard';
import { useReadContract, useReadContracts } from 'wagmi';
import { Address } from 'viem';
import stakingAbi from '@/components/abi/SomniaStaking.json';
import nodeCommitteeAbi from '@/components/abi/NodeCommitteeV2.json';
import type { Abi } from 'viem';

export const StatsSection = ({ validationCommittee }: { validationCommittee: any }) => {

  // Extract stakes directly from the committee data
  const committeeStakes = Array.isArray(validationCommittee)
    ? validationCommittee.map(node =>
        typeof node === 'object' && node !== null && 'stakedAmount' in node
          ? BigInt(node.stakedAmount.toString())
          : 0n
      )
    : [];
      
  // Calculate total stake by summing up all individual stakes from committee data
  const totalStake = committeeStakes.length > 0
    ? committeeStakes.reduce((acc, stake) => acc + Number(stake), 0)
    : 0;

  // Format the total stake value for display
  // Assuming stakedAmount is in wei (10^18) format for tokens like ETH
  const formattedTotalStake = totalStake > 0 
    ? Number(totalStake) / 10**18 
    : 0;

  return (
    <section className='w-full mx-auto mt-[88px]'>
      <Card className='border-none shadow-none'>
        <CardContent className='flex items-center p-0 pb-6'>
          <h2 className='flex-1 font-heading-primary-heading-02 text-[32px] tracking-[0.64px] text-somnia-color-text-primary-01'>
            Stats
          </h2>
        </CardContent>
      </Card>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4 w-full'>
        <StatCard
          value={validationCommittee?.length || 0}
          label={'Validators'}
        />
        <StatCard
          value={formattedTotalStake}
          label={'Total Staked'}
        />
      </div>
    </section>
  );
};
