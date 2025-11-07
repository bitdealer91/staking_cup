import { ValidatorData, mockValidators } from "../mocks/validators";
import { useMemo } from "react";
import { useReadContract, useReadContracts } from "wagmi";
import nodeCommitteeAbi from "@/components/abi/NodeCommitteeV2.json";
import stakingAbi from "@/components/abi/SomniaStaking.json";
import { Abi } from "abitype";
import { formatEther } from "viem";

interface SortConfig {
  key: keyof ValidatorData | null;
  direction: "asc" | "desc";
}

// Custom name mapping type
export interface ValidatorNameMapping {
  [address: string]: string;
}

export const useValidatorData = (
  search: string,
  sortConfig: SortConfig,
  currentPage: number,
  rowsPerPage: number,
  customNames: ValidatorNameMapping = {}, // Optional custom names mapping
  allowedValidatorNames?: string[]
) => {
  const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000" as `0x${string}`;
  const nodeCommitteeAddress = (process.env
    .NEXT_PUBLIC_NODE_COMMITTEE_ADDRESS || "") as `0x${string}`;
  const stakingAddress = (process.env.NEXT_PUBLIC_STAKING_ADDRESS || "") as `0x${string}`;

  // Get the committee data from the contract
  const { data: validationCommittee } = useReadContract({
    address: (nodeCommitteeAddress || ZERO_ADDRESS) as `0x${string}`,
    abi: nodeCommitteeAbi.abi as Abi,
    functionName: "getCurrentEpochCommittee",
    query: {
      enabled: Boolean(nodeCommitteeAddress),
      retry: 3,
      retryDelay: 500,
    },
  });

  // Get the max total validator stake limit
  const { data: maxTotalValidatorStake } = useReadContract({
    address: (stakingAddress || ZERO_ADDRESS) as `0x${string}`,
    abi: stakingAbi.abi as Abi,
    functionName: "maxTotalValidatorStake",
    query: {
      enabled: Boolean(stakingAddress),
      retry: 3,
      retryDelay: 500,
    },
  });

  // Use multicall to get rewards for all validators
  const rewardsQueries = useMemo(() => {
    if (!validationCommittee || !Array.isArray(validationCommittee)) return [];

    return validationCommittee.map((node: any) => ({
      address: stakingAddress as `0x${string}`,
      abi: stakingAbi.abi as Abi,
      functionName: "getAccumulatedRewards",
      args: [node.nodeAddress],
    }));
  }, [validationCommittee, stakingAddress]);

  // Use multicall to get delegation rates for all validators
  const delegationRatesQueries = useMemo(() => {
    if (!validationCommittee || !Array.isArray(validationCommittee)) return [];

    return validationCommittee.map((node: any) => ({
      address: stakingAddress as `0x${string}`,
      abi: stakingAbi.abi as Abi,
      functionName: "getValidatorDelegatedStakeRate",
      args: [node.nodeAddress],
    }));
  }, [validationCommittee, stakingAddress]);

  // Use multicall to get TOTAL stake (own + delegated) for each validator
  const totalStakeQueries = useMemo(() => {
    if (!validationCommittee || !Array.isArray(validationCommittee)) return [];

    return validationCommittee.map((node: any) => ({
      address: stakingAddress as `0x${string}`,
      abi: stakingAbi.abi as Abi,
      functionName: "getValidatorTotalStakeAmount",
      args: [node.nodeAddress],
    }));
  }, [validationCommittee, stakingAddress]);

  const { data: validatorRewards } = useReadContracts({
    contracts: rewardsQueries,
    query: {
      enabled: Boolean(stakingAddress) && rewardsQueries.length > 0,
    },
  });

  const { data: validatorDelegationRates } = useReadContracts({
    contracts: delegationRatesQueries,
    query: {
      enabled: Boolean(stakingAddress) && delegationRatesQueries.length > 0,
    },
  });

  const { data: validatorTotalStakes } = useReadContracts({
    contracts: totalStakeQueries,
    query: {
      enabled: Boolean(stakingAddress) && totalStakeQueries.length > 0,
    },
  });

  // Transform contract data into ValidatorData format
  const validators = useMemo(() => {
    if (!validationCommittee || !Array.isArray(validationCommittee)) return [];

    const allowList = (allowedValidatorNames || []).map((n) => n.toLowerCase().trim());

    const list = validationCommittee.map((node: any, index: number) => {
      const nodeAddress = node.nodeAddress as string;
      // Get raw stake amount in wei for comparisons
      const rawStakeTotal =
        validatorTotalStakes && validatorTotalStakes[index]
          ? validatorTotalStakes[index].result?.toString() || "0"
          : undefined;
      const rawStakeWei =
        rawStakeTotal !== undefined
          ? BigInt(rawStakeTotal)
          : node.stakedAmount
          ? BigInt(node.stakedAmount.toString())
          : BigInt(0);

      // Convert to ether for display
      const rawStake = formatEther(rawStakeWei);

      // Format stake with zero decimals
      const formattedStake = parseFloat(rawStake).toLocaleString("en-US", {
        maximumFractionDigits: 0,
        minimumFractionDigits: 0,
      });

      // Get raw earnings value
      const rawEarnings =
        validatorRewards && validatorRewards[index]
          ? formatEther(
              BigInt(validatorRewards[index].result?.toString() || "0")
            )
          : "0";

      // Format earnings with zero decimals
      const formattedEarnings = parseFloat(rawEarnings).toLocaleString(
        "en-US",
        {
          maximumFractionDigits: 0,
          minimumFractionDigits: 0,
        }
      );

      // Get delegation rate (in basis points, where 10000 = 100%)
      const rawDelegationRate =
        validatorDelegationRates && validatorDelegationRates[index]
          ? Number(validatorDelegationRates[index].result?.toString() || "0")
          : 0;

      // Convert from basis points to percentage (e.g., 1000 basis points = 10%)
      const delegationRatePercentage = (rawDelegationRate / 100).toFixed(1);

      // Look up node address in custom names, defaulting to a shortened address format if not found
      const lowerCaseAddress = nodeAddress.toLowerCase();
      const name =
        customNames[lowerCaseAddress] ||
        `${nodeAddress.slice(0, 6)}...${nodeAddress.slice(-4)}`;

      // Check if validator is at max stake
      const maxStakeWei = maxTotalValidatorStake
        ? BigInt(maxTotalValidatorStake.toString())
        : BigInt(0);
      const isAtMaxStake = maxStakeWei > 0 && rawStakeWei >= maxStakeWei;

      return {
        id: index + 1,
        icon: `https://api.dicebear.com/9.x/rings/png?seed=${nodeAddress}`,
        name,
        address: nodeAddress,
        totalStaked: `${formattedStake} SOMI`,
        nextRound: "Yes",
        earnings: `${formattedEarnings} SOMI`,
        delegationRate: `${delegationRatePercentage}%`,
        totalStakedWei: rawStakeWei,
        isAtMaxStake,
      } as ValidatorData;
    });

    // Apply whitelist if provided
    if (allowList.length > 0) {
      return list.filter((v) => allowList.includes(String(v.name).toLowerCase().trim()));
    }

    return list;
  }, [
    validationCommittee,
    validatorRewards,
    validatorDelegationRates,
    customNames,
    maxTotalValidatorStake,
    allowedValidatorNames,
  ]);

  const processedData = useMemo(() => {
    let result = validators;

    // Apply search filtering
    if (search) {
      result = result.filter((validator) =>
        Object.values(validator)
          .map((value) => String(value).toLowerCase())
          .some((value) => value.includes(search.toLowerCase().trim()))
      );
    }

    // Apply sorting
    result.sort((a, b) => {
      if (!sortConfig.key) return 0;

      if (sortConfig.key === "name") {
        return sortConfig.direction === "asc"
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      }

      const aNum = parseInt(
        String(a[sortConfig.key]).replace(/[^\d]/g, ""),
        10
      );
      const bNum = parseInt(
        String(b[sortConfig.key]).replace(/[^\d]/g, ""),
        10
      );
      return sortConfig.direction === "asc" ? aNum - bNum : bNum - aNum;
    });

    return result;
  }, [search, sortConfig, validators]);

  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedData = processedData.slice(
    startIndex,
    startIndex + rowsPerPage
  );
  const totalPages = Math.ceil(processedData.length / rowsPerPage);

  return {
    paginatedData,
    totalPages,
    totalItems: processedData.length,
    allValidators: validators,
    maxTotalValidatorStake,
  };
};
