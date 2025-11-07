'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { formatEther } from 'viem';
import ERC20Template from '@/components/abi/ERC20Template.json';

interface BalanceContextType {
  balance: string;
  refreshBalance: () => Promise<void>;
  isLoading: boolean;
}

const BalanceContext = createContext<BalanceContextType | undefined>(undefined);

export function BalanceProvider({ children }: { children: ReactNode }) {
  const { address } = useAccount();
  const [balance, setBalance] = useState<string>('0');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Get the sUSDT contract address from environment variables
  const SUSDT_ADDRESS = process.env.NEXT_PUBLIC_SUSDT_ADDRESS as `0x${string}`;

  // Read the user's balance
  const { data: balanceData, refetch: refetchBalance } = useReadContract({
    address: SUSDT_ADDRESS,
    abi: ERC20Template.abi,
    functionName: 'balanceOf',
    args: [address],
  });

  // Update state when data changes
  useEffect(() => {
    if (balanceData) {
      setBalance(formatEther(balanceData as bigint));
    }
  }, [balanceData]);

  // Refetch balance when address changes
  useEffect(() => {
    if (address) {
      refreshBalance();
    }
  }, [address]);

  // Function to refresh balance that can be called from any component
  const refreshBalance = async () => {
    if (!address) return;
    
    setIsLoading(true);
    try {
      await refetchBalance();
    } catch (error) {
      console.error('Error refreshing balance:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <BalanceContext.Provider value={{ balance, refreshBalance, isLoading }}>
      {children}
    </BalanceContext.Provider>
  );
}

// Custom hook to use the balance context
export function useBalance() {
  const context = useContext(BalanceContext);
  if (context === undefined) {
    throw new Error('useBalance must be used within a BalanceProvider');
  }
  return context;
} 