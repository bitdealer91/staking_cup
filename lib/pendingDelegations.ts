import { DelegationData } from "@/components/staking/hooks/useDelegationsData";

export interface PendingDelegation {
  validatorAddress: string;
  validatorName: string;
  delegatedAmount: string; // Raw amount in wei
  txHash: string;
  timestamp: number;
  formattedDelegatedAmount: string;
}

const PENDING_DELEGATIONS_KEY = "somnia_pending_delegations";
const PENDING_DELEGATIONS_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export const pendingDelegationsStorage = {
  // Get all pending delegations for a user
  getPendingDelegations: (userAddress: string): PendingDelegation[] => {
    if (typeof window === "undefined") return [];

    try {
      const stored = localStorage.getItem(
        `${PENDING_DELEGATIONS_KEY}_${userAddress.toLowerCase()}`
      );
      if (!stored) return [];

      const parsed = JSON.parse(stored);
      const now = Date.now();

      // Filter out expired entries (older than 24 hours)
      const valid = parsed.filter(
        (delegation: PendingDelegation) =>
          now - delegation.timestamp < PENDING_DELEGATIONS_EXPIRY
      );

      // Update storage if we filtered out expired entries
      if (valid.length !== parsed.length) {
        localStorage.setItem(
          `${PENDING_DELEGATIONS_KEY}_${userAddress.toLowerCase()}`,
          JSON.stringify(valid)
        );
      }

      return valid;
    } catch (error) {
      console.error(
        "Error reading pending delegations from localStorage:",
        error
      );
      return [];
    }
  },

  // Add a new pending delegation
  addPendingDelegation: (
    userAddress: string,
    delegation: PendingDelegation
  ): void => {
    if (typeof window === "undefined") return;

    try {
      const existing =
        pendingDelegationsStorage.getPendingDelegations(userAddress);

      // Remove any existing delegation for the same validator (in case of retry)
      const filtered = existing.filter(
        (d) => d.validatorAddress !== delegation.validatorAddress
      );

      // Add the new delegation
      filtered.push(delegation);

      localStorage.setItem(
        `${PENDING_DELEGATIONS_KEY}_${userAddress.toLowerCase()}`,
        JSON.stringify(filtered)
      );
    } catch (error) {
      console.error("Error saving pending delegation to localStorage:", error);
    }
  },

  // Remove a pending delegation (when it becomes available on-chain)
  removePendingDelegation: (
    userAddress: string,
    validatorAddress: string
  ): void => {
    if (typeof window === "undefined") return;

    try {
      const existing =
        pendingDelegationsStorage.getPendingDelegations(userAddress);
      const filtered = existing.filter(
        (d) => d.validatorAddress !== validatorAddress
      );

      localStorage.setItem(
        `${PENDING_DELEGATIONS_KEY}_${userAddress.toLowerCase()}`,
        JSON.stringify(filtered)
      );
    } catch (error) {
      console.error(
        "Error removing pending delegation from localStorage:",
        error
      );
    }
  },

  // Clear all pending delegations for a user
  clearPendingDelegations: (userAddress: string): void => {
    if (typeof window === "undefined") return;

    try {
      localStorage.removeItem(
        `${PENDING_DELEGATIONS_KEY}_${userAddress.toLowerCase()}`
      );
    } catch (error) {
      console.error(
        "Error clearing pending delegations from localStorage:",
        error
      );
    }
  },

  // Convert pending delegation to DelegationData format
  toDelegationData: (
    pending: PendingDelegation
  ): DelegationData & { isPending?: boolean } => {
    return {
      validatorAddress: pending.validatorAddress,
      validatorName: pending.validatorName,
      delegatedAmount: pending.delegatedAmount,
      pendingRewards: "0", // No rewards yet for pending delegations
      formattedDelegatedAmount: pending.formattedDelegatedAmount,
      formattedPendingRewards: "0 SOMI",
      isOnline: true, // Assume online for pending (we validated this when creating)
      isPending: true, // Flag to identify pending delegations
    };
  },
};
