import { useMemo } from "react";
import { useAccount, useReadContract, useReadContracts } from "wagmi";
import stakingAbi from "@/components/abi/SomniaStaking.json";
import type { Abi } from "viem";
import { formatEther } from "viem";
import { ValidatorNameMapping } from "./useValidatorData";

export interface DelegationData {
  validatorAddress: string;
  validatorName: string;
  delegatedAmount: string;
  pendingRewards: string;
  formattedDelegatedAmount: string;
  formattedPendingRewards: string;
  isOnline: boolean;
}

export const useDelegationsData = (
  customNames: ValidatorNameMapping = {},
  options?: { enabled?: boolean }
) => {
  const { address: userAddress } = useAccount();
  const enabled = options?.enabled ?? true;

  // Get all delegations for the user
  const {
    data: delegatedValidators,
    isLoading: isLoadingDelegations,
    error: delegationsError,
  } = useReadContract({
    address: process.env.NEXT_PUBLIC_STAKING_ADDRESS as `0x${string}`,
    abi: stakingAbi.abi as Abi,
    functionName: "getDelegations",
    args: [userAddress],
    query: {
      enabled: enabled && !!userAddress,
      retry: 3,
      retryDelay: 500,
    },
  });

  // (debug logs removed)

  // Create queries to get delegation amounts, pending rewards and committee status for each validator
  const delegationQueries = useMemo(() => {
    if (
      !delegatedValidators ||
      !Array.isArray(delegatedValidators) ||
      !userAddress
    )
      return [];

    const queries: Array<{
      address: `0x${string}`;
      abi: Abi;
      functionName: string;
      args: any[];
    }> = [];

    // For each validator, create queries for both delegation amount and pending rewards
    for (const validatorAddress of delegatedValidators) {
      // Query for delegation amount
      queries.push({
        address: process.env.NEXT_PUBLIC_STAKING_ADDRESS as `0x${string}`,
        abi: stakingAbi.abi as Abi,
        functionName: "getDelegationByValidator",
        args: [userAddress, validatorAddress],
      });

      // Query for pending rewards
      queries.push({
        address: process.env.NEXT_PUBLIC_STAKING_ADDRESS as `0x${string}`,
        abi: stakingAbi.abi as Abi,
        functionName: "getDelegatedStakerRewards",
        args: [validatorAddress, userAddress],
      });

      // Query committee membership
      queries.push({
        address: process.env.NEXT_PUBLIC_STAKING_ADDRESS as `0x${string}`,
        abi: stakingAbi.abi as Abi,
        functionName: "isValidatorInCommittee",
        args: [validatorAddress],
      });
    }

    return queries;
  }, [delegatedValidators, userAddress]);

  const { data: delegationResults, isLoading: isLoadingDetails } =
    useReadContracts({
      contracts: delegationQueries,
      query: {
        enabled: enabled && delegationQueries.length > 0,
      },
    });

  // (debug logs removed)

  // Transform the data into a more usable format
  const delegations = useMemo(() => {
    if (
      !delegatedValidators ||
      !Array.isArray(delegatedValidators) ||
      !delegationResults
    ) {
      return [];
    }

    const processedDelegations: DelegationData[] = [];

    delegatedValidators.forEach((validatorAddress: string, index: number) => {
      // Each validator has 3 queries: amount, rewards, committee
      const base = index * 3;
      const delegationAmountIndex = base;
      const pendingRewardsIndex = base + 1;
      const committeeIndex = base + 2;

      const delegationAmountResult = delegationResults[delegationAmountIndex];
      const pendingRewardsResult = delegationResults[pendingRewardsIndex];
      const committeeResult = delegationResults[committeeIndex];

      // Only require amount result presence; pending rewards may be zero
      const hasAmount =
        delegationAmountResult && delegationAmountResult.result !== undefined;
      if (hasAmount) {
        const rawDelegatedAmount = (
          delegationAmountResult!.result as bigint
        ).toString();
        const rawPendingRewards =
          pendingRewardsResult && pendingRewardsResult.result !== undefined
            ? (pendingRewardsResult.result as bigint).toString()
            : "0";
        const isOnline =
          committeeResult && committeeResult.result !== undefined
            ? Boolean(committeeResult.result as boolean)
            : false;

        // Only include delegations with non-zero amounts
        if (rawDelegatedAmount !== "0") {
          const delegatedAmountEther = formatEther(BigInt(rawDelegatedAmount));
          const pendingRewardsEther = formatEther(BigInt(rawPendingRewards));

          // Format amounts with proper decimals
          const formattedDelegatedAmount = parseFloat(
            delegatedAmountEther
          ).toLocaleString("en-US", {
            maximumFractionDigits: 4,
            minimumFractionDigits: 0,
          });

          const formattedPendingRewards = parseFloat(
            pendingRewardsEther
          ).toLocaleString("en-US", {
            maximumFractionDigits: 4,
            minimumFractionDigits: 0,
          });

          // Get validator name from custom names or use shortened address
          const lowerCaseAddress = validatorAddress.toLowerCase();
          const validatorName =
            customNames[lowerCaseAddress] ||
            `${validatorAddress.slice(0, 6)}...${validatorAddress.slice(-4)}`;

          processedDelegations.push({
            validatorAddress,
            validatorName,
            delegatedAmount: rawDelegatedAmount,
            pendingRewards: rawPendingRewards,
            formattedDelegatedAmount: `${formattedDelegatedAmount} SOMI`,
            formattedPendingRewards: `${formattedPendingRewards} SOMI`,
            isOnline,
          });
        }
      }
    });

    return processedDelegations;
  }, [delegatedValidators, delegationResults, customNames]);

  return {
    delegations,
    isLoading: isLoadingDelegations || isLoadingDetails,
    hasError: !userAddress,
  };
};
