"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useAccount, useWriteContract, usePublicClient } from "wagmi";
import { parseEther } from "viem";
import stakingAbi from "@/components/abi/SomniaStaking.json";
import { Abi } from "abitype";
import { useToast } from "@/hooks/use-toast";
import { useDelegationsData, DelegationData } from "./hooks/useDelegationsData";
import { VALIDATOR_NAMES } from "./data/validatorNames";
import { Loader2, Wallet, Trophy } from "lucide-react";
import { useModal as useConnectKitModal } from "connectkit";
import { pendingDelegationsStorage } from "@/lib/pendingDelegations";
import { getErrorMessage, isUserRejection } from "@/utils/errorMessages";

interface DelegationsModalProps {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function DelegationsModal({
  isOpen,
  onOpenChange,
}: DelegationsModalProps) {
  const { toast } = useToast();
  const { address: userAddress } = useAccount();
  const { setOpen: setConnectModalOpen } = useConnectKitModal();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [undelegateAmounts, setUndelegateAmounts] = useState<
    Record<string, string>
  >({});

  // Refs to track operations in progress
  const undelegateInProgress = useRef<Record<string, boolean>>({});
  const claimInProgress = useRef<Record<string, boolean>>({});

  // Fetch user's delegations only when modal is open
  const isDialogOpen = isOpen !== undefined ? isOpen : isModalOpen;
  const {
    delegations: onChainDelegations,
    isLoading,
    hasError,
  } = useDelegationsData(VALIDATOR_NAMES, {
    enabled: !!isDialogOpen,
  });

  // Merge on-chain delegations with pending delegations from local storage
  const delegations = useMemo(() => {
    if (!userAddress) return onChainDelegations;

    const pendingDelegations =
      pendingDelegationsStorage.getPendingDelegations(userAddress);
    const merged = [...onChainDelegations];

    // Add pending delegations that aren't already on-chain
    pendingDelegations.forEach((pending) => {
      const existsOnChain = onChainDelegations.some(
        (delegation) =>
          delegation.validatorAddress.toLowerCase() ===
          pending.validatorAddress.toLowerCase()
      );

      if (!existsOnChain) {
        // Add pending delegation as a DelegationData object
        merged.push(pendingDelegationsStorage.toDelegationData(pending));
      } else {
        // If it exists on-chain, remove it from pending storage (it's been processed)
        pendingDelegationsStorage.removePendingDelegation(
          userAddress,
          pending.validatorAddress
        );
      }
    });

    return merged;
  }, [onChainDelegations, userAddress, isDialogOpen]);

  // Use controlled state if provided, otherwise use internal state

  // Memoize handleOpenChange to prevent recreating it on every render
  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (onOpenChange) {
        onOpenChange(open);
      } else {
        setIsModalOpen(open);
      }

      // Reset states when closing
      if (!open) {
        setUndelegateAmounts({});
        undelegateInProgress.current = {};
        claimInProgress.current = {};
        setTxHashes({});
        setTxStatuses({});
      }
    },
    [onOpenChange]
  );

  const { writeContract, writeContractAsync, isPending } = useWriteContract({
    mutation: {
      onSuccess: () => {
        toast({
          title: "Success!",
          description: "Transaction completed successfully",
        });
        // Reset operation flags
        undelegateInProgress.current = {};
        claimInProgress.current = {};
      },
      onError: (error) => {
        if (isUserRejection(error)) {
          toast({
            title: "Transaction Cancelled",
            description: "User rejected transaction",
          });
        } else {
          toast({
            variant: "destructive",
            title: "Transaction Failed",
            description: getErrorMessage(error),
          });
        }
        // Reset operation flags
        undelegateInProgress.current = {};
        claimInProgress.current = {};
      },
    },
  });

  const publicClient = usePublicClient();
  const [txHashes, setTxHashes] = useState<Record<string, string | null>>({});
  const [txStatuses, setTxStatuses] = useState<
    Record<string, "pending" | "success" | "reverted" | null>
  >({});
  const [claimStatuses, setClaimStatuses] = useState<
    Record<string, "pending" | "success" | "reverted" | null>
  >({});
  const [undelegateStatuses, setUndelegateStatuses] = useState<
    Record<string, "pending" | "success" | "reverted" | null>
  >({});

  const handleUndelegate = async (delegation: DelegationData) => {
    if (!userAddress) {
      toast({
        variant: "destructive",
        title: "Wallet Not Connected",
        description: "Please connect your wallet to continue.",
      });
      return;
    }

    const undelegateAmount = undelegateAmounts[delegation.validatorAddress];
    if (!undelegateAmount || parseFloat(undelegateAmount) <= 0) {
      toast({
        variant: "destructive",
        title: "Invalid Amount",
        description: "Please enter a valid amount to undelegate.",
      });
      return;
    }

    if (
      undelegateInProgress.current[delegation.validatorAddress] ||
      isPending
    ) {
      return;
    }

    try {
      const contractAddress = process.env
        .NEXT_PUBLIC_STAKING_ADDRESS as `0x${string}`;
      if (!contractAddress) {
        toast({
          variant: "destructive",
          title: "Configuration Error",
          description: "Staking contract address not found.",
        });
        return;
      }

      undelegateInProgress.current[delegation.validatorAddress] = true;

      toast({
        title: "Processing",
        description: "Your undelegation transaction is being processed...",
      });

      // Estimate gas and 10x to avoid OOG
      let gasOverride: bigint | undefined = undefined;
      if (publicClient && userAddress) {
        const estimate = await publicClient.estimateContractGas({
          address: contractAddress,
          abi: stakingAbi.abi as Abi,
          functionName: "undelegateStake",
          args: [delegation.validatorAddress, parseEther(undelegateAmount)],
          account: userAddress,
        });
        gasOverride = estimate * 10n;
      }
      const hash = await writeContractAsync({
        address: contractAddress,
        abi: stakingAbi.abi as Abi,
        functionName: "undelegateStake",
        args: [delegation.validatorAddress, parseEther(undelegateAmount)],
        ...(gasOverride ? { gas: gasOverride } : {}),
      });
      setTxHashes((prev) => ({ ...prev, [delegation.validatorAddress]: hash }));
      setTxStatuses((prev) => ({
        ...prev,
        [delegation.validatorAddress]: "pending",
      }));
      setUndelegateStatuses((prev) => ({
        ...prev,
        [delegation.validatorAddress]: "pending",
      }));
      toast({
        title: "Transaction submitted",
        description: (
          <a
            href={`https://explorer.somnia.network/tx/${hash}?tab=index`}
            target="_blank"
            rel="noreferrer"
            className="underline"
          >
            View on explorer
          </a>
        ),
      });

      if (publicClient) {
        const receipt = await publicClient.waitForTransactionReceipt({ hash });
        const reverted = receipt.status !== "success";
        setTxStatuses((prev) => ({
          ...prev,
          [delegation.validatorAddress]: reverted ? "reverted" : "success",
        }));
        setUndelegateStatuses((prev) => ({
          ...prev,
          [delegation.validatorAddress]: reverted ? "reverted" : "success",
        }));
        undelegateInProgress.current[delegation.validatorAddress] = false;

        if (reverted) {
          toast({
            variant: "destructive",
            title: "Transaction Reverted",
            description: (
              <a
                href={`https://explorer.somnia.network/tx/${hash}?tab=index`}
                target="_blank"
                rel="noreferrer"
                className="underline"
              >
                View on explorer
              </a>
            ),
          });
        } else {
          toast({
            title: "Undelegation Confirmed",
            description: (
              <a
                href={`https://explorer.somnia.network/tx/${hash}?tab=index`}
                target="_blank"
                rel="noreferrer"
                className="underline"
              >
                View on explorer
              </a>
            ),
          });
        }
      }
    } catch (error) {
      undelegateInProgress.current[delegation.validatorAddress] = false;
      if (isUserRejection(error)) {
        toast({
          title: "Transaction Cancelled",
          description: "User rejected transaction",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Undelegation Failed",
          description: getErrorMessage(error),
        });
      }
    }
  };

  const handleClaimRewards = async (delegation: DelegationData) => {
    if (!userAddress) {
      toast({
        variant: "destructive",
        title: "Wallet Not Connected",
        description: "Please connect your wallet to continue.",
      });
      return;
    }

    if (claimInProgress.current[delegation.validatorAddress] || isPending) {
      return;
    }

    try {
      const contractAddress = process.env
        .NEXT_PUBLIC_STAKING_ADDRESS as `0x${string}`;
      if (!contractAddress) {
        toast({
          variant: "destructive",
          title: "Configuration Error",
          description: "Staking contract address not found.",
        });
        return;
      }

      claimInProgress.current[delegation.validatorAddress] = true;

      toast({
        title: "Processing",
        description: "Your claim rewards transaction is being processed...",
      });

      // Estimate gas and 10x to avoid OOG
      let gasOverride: bigint | undefined = undefined;
      if (publicClient && userAddress) {
        const estimate = await publicClient.estimateContractGas({
          address: contractAddress,
          abi: stakingAbi.abi as Abi,
          functionName: "claimDelegatorRewards",
          args: [delegation.validatorAddress],
          account: userAddress,
        });
        gasOverride = estimate * 10n;
      }
      const hash = await writeContractAsync({
        address: contractAddress,
        abi: stakingAbi.abi as Abi,
        functionName: "claimDelegatorRewards",
        args: [delegation.validatorAddress],
        ...(gasOverride ? { gas: gasOverride } : {}),
      });
      setTxHashes((prev) => ({ ...prev, [delegation.validatorAddress]: hash }));
      setTxStatuses((prev) => ({
        ...prev,
        [delegation.validatorAddress]: "pending",
      }));
      setClaimStatuses((prev) => ({
        ...prev,
        [delegation.validatorAddress]: "pending",
      }));
      toast({
        title: "Transaction submitted",
        description: (
          <a
            href={`https://explorer.somnia.network/tx/${hash}?tab=index`}
            target="_blank"
            rel="noreferrer"
            className="underline"
          >
            View on explorer
          </a>
        ),
      });

      if (publicClient) {
        const receipt = await publicClient.waitForTransactionReceipt({ hash });
        const reverted = receipt.status !== "success";
        setTxStatuses((prev) => ({
          ...prev,
          [delegation.validatorAddress]: reverted ? "reverted" : "success",
        }));
        setClaimStatuses((prev) => ({
          ...prev,
          [delegation.validatorAddress]: reverted ? "reverted" : "success",
        }));
        claimInProgress.current[delegation.validatorAddress] = false;

        if (reverted) {
          toast({
            variant: "destructive",
            title: "Transaction Reverted",
            description: (
              <a
                href={`https://explorer.somnia.network/tx/${hash}?tab=index`}
                target="_blank"
                rel="noreferrer"
                className="underline"
              >
                View on explorer
              </a>
            ),
          });
        } else {
          toast({
            title: "Rewards Claimed",
            description: (
              <a
                href={`https://explorer.somnia.network/tx/${hash}?tab=index`}
                target="_blank"
                rel="noreferrer"
                className="underline"
              >
                View on explorer
              </a>
            ),
          });
        }
      }
    } catch (error) {
      claimInProgress.current[delegation.validatorAddress] = false;
      if (isUserRejection(error)) {
        toast({
          title: "Transaction Cancelled",
          description: "User rejected transaction",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Claim Failed",
          description: getErrorMessage(error),
        });
      }
    }
  };

  const handleUndelegateAmountChange = (
    validatorAddress: string,
    value: string
  ) => {
    setUndelegateAmounts((prev) => ({
      ...prev,
      [validatorAddress]: value,
    }));
  };

  if (hasError) {
    return (
      <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
        <DialogContent
          className="w-[880px] max-w-[95vw] rounded-[44px] border-0 p-0 overflow-hidden max-h-[85vh]"
          style={{ backgroundColor: '#33a000', boxShadow: '0px 14px 28.7px rgba(0,0,0,0.25)' }}
        >
          <div className="px-[40px] pt-[32px] pb-[12px]">
            <DialogHeader>
              <DialogTitle className="font-soccer italic uppercase text-[40px] tracking-[0.8px] text-[#d9ff00] [text-shadow:#000_0px_3px_0px] leading-none">
                My Delegations
              </DialogTitle>
              <DialogDescription className="mt-3 text-[18px] text-white font-polysans">
                Please connect your wallet to view your delegations.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="px-[32px] pb-[32px]">
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <button
                type="button"
                onClick={() => setConnectModalOpen(true)}
                className="mb-5 inline-flex h-[72px] w-[72px] items-center justify-center rounded-full bg-white/15 text-white shadow-[0px_6px_14px_rgba(0,0,0,0.35)] hover:brightness-110 active:translate-y-[1px] active:shadow-[0px_3px_8px_rgba(0,0,0,0.35)] transition"
                aria-label="Connect Wallet"
              >
                <Wallet className="h-9 w-9" />
              </button>
              <p className="text-white/90 font-medium">Wallet not connected</p>
              <div className="mt-6">
                <button
                  type="button"
                  onClick={() => setConnectModalOpen(true)}
                  className="inline-flex items-center justify-center text-[#063d00] rounded-[98px] px-6 py-[14px] shadow-[0px_3px_0px_rgba(0,0,0,0.68)] hover:brightness-105 active:translate-y-[1px] active:shadow-[0px_1px_0px_rgba(0,0,0,0.68)]"
                  style={{ background: '#66de2e' }}
                >
                  Connect Wallet
                </button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        className="w-[880px] max-w-[95vw] rounded-[44px] border-0 p-0 overflow-hidden max-h-[85vh]"
        style={{ backgroundColor: '#33a000', boxShadow: '0px 14px 28.7px rgba(0,0,0,0.25)' }}
      >
        <div className="px-[40px] pt-[32px] pb-[12px]">
          <DialogHeader>
            <DialogTitle className="font-soccer italic uppercase text-[40px] tracking-[0.8px] text-[#d9ff00] [text-shadow:#000_0px_3px_0px] leading-none">
              My Delegations
            </DialogTitle>
            <DialogDescription className="mt-3 text-[18px] text-white font-polysans">
              Manage your staked delegations and claim rewards.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="px-[32px] pb-[24px] overflow-y-auto" style={{ maxHeight: '70vh' }}>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              <span className="ml-2 text-gray-600">
                Loading your delegations...
              </span>
            </div>
          ) : delegations.length === 0 ? (
            <div className="text-center py-16">
              <Trophy className="mx-auto h-12 w-12 text-white/70 mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No Delegations Found</h3>
              <p className="text-white/80">You haven't delegated any stake yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Show note if there are pending delegations */}
              {delegations.some((d) => (d as any).isPending) && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-[14px] p-4 mb-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <span className="w-2 h-2 rounded-full bg-yellow-500 mt-2 block"></span>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-yellow-800">
                        <strong>Pending Delegations:</strong> Your delegation
                        will be included in the next Epoch. You will be able to
                        claim rewards and undelegate once the delegation is
                        confirmed.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {delegations.map((delegation) => (
                <div
                  key={delegation.validatorAddress}
                  className="rounded-[18px] p-4"
                  style={{ backgroundColor: '#0b7000' }}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-white font-medium text-base md:text-lg flex items-center flex-wrap gap-2 mb-2">
                        {delegation.validatorName}
                        {(delegation as any).isPending && (
                          <span
                            className="inline-flex items-center px-2 py-0.25 rounded-full text-[11px] font-medium bg-yellow-100 text-yellow-700"
                            title="Pending until next epoch"
                          >
                            <span className="w-2 h-2 rounded-full bg-yellow-500 mr-1" />
                            Pending
                          </span>
                        )}
                        <span
                          className={
                            delegation.isOnline
                              ? "inline-flex items-center px-2 py-0.25 rounded-full text-[11px] font-medium bg-green-100 text-green-700"
                              : "inline-flex items-center px-2 py-0.25 rounded-full text-[11px] font-medium bg-red-100 text-red-700"
                          }
                          title={
                            delegation.isOnline
                              ? "In committee"
                              : "Not in committee"
                          }
                        >
                          <span
                            className={
                              delegation.isOnline
                                ? "w-2 h-2 rounded-full bg-green-500 mr-1"
                                : "w-2 h-2 rounded-full bg-red-500 mr-1"
                            }
                          />
                          {delegation.isOnline ? "Online" : "Offline"}
                        </span>
                      </h4>
                      <p className="text-xs md:text-sm text-white/80 font-mono break-all">
                        {delegation.validatorAddress}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-white/80">
                        Delegated Amount
                      </div>
                      <div className="font-bold text-lg text-white">
                        {delegation.formattedDelegatedAmount}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-4">
                    <div className="rounded-lg p-3" style={{ backgroundColor: '#0e6f00' }}>
                      <div className="text-sm text-white/80 mb-1">
                        Pending Rewards
                      </div>
                      <div className="font-semibold text-white">
                        {delegation.formattedPendingRewards}
                      </div>
                    </div>
                    <div className="rounded-lg p-3" style={{ backgroundColor: '#0e6f00' }}>
                      <div className="text-sm text-white/80 mb-1">
                        Undelegate Amount
                      </div>
                      <Input
                        type="number"
                        placeholder={(delegation as any).isPending ? "Available next epoch" : "Enter amount"}
                        value={undelegateAmounts[delegation.validatorAddress] || ""}
                        onChange={(e) => handleUndelegateAmountChange(delegation.validatorAddress, e.target.value)}
                        disabled={(delegation as any).isPending}
                        className="mt-1 w-full px-3 py-[12px] rounded-[14px] text-[#9af470] placeholder:text-[#9af470] font-polysans"
                        style={{ backgroundColor: '#0b7000', borderColor: '#50c718', borderWidth: 1 }}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      onClick={() => {
                        if (!userAddress) {
                          toast({
                            variant: "destructive",
                            title: "Wallet not connected",
                            description: "Please connect your wallet.",
                          });
                          return;
                        }
                        handleClaimRewards(delegation);
                      }}
                      disabled={
                        isPending ||
                        claimInProgress.current[delegation.validatorAddress] ||
                        parseFloat(delegation.pendingRewards) === 0 ||
                        claimStatuses[delegation.validatorAddress] ===
                          "success" ||
                        (delegation as any).isPending
                      }
                      className="w-full sm:flex-1 text-[#063d00] rounded-[98px] px-6 py-[14px]"
                      style={{ background: '#66de2e', boxShadow: '0px 3px 0px rgba(0,0,0,0.68)' }}
                    >
                      {claimInProgress.current[delegation.validatorAddress] ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Claiming...
                        </>
                      ) : (
                        "Claim Rewards"
                      )}
                    </Button>
                    <Button
                      onClick={() => {
                        if (!userAddress) {
                          toast({
                            variant: "destructive",
                            title: "Wallet not connected",
                            description: "Please connect your wallet.",
                          });
                          return;
                        }
                        handleUndelegate(delegation);
                      }}
                      disabled={
                        isPending ||
                        undelegateInProgress.current[
                          delegation.validatorAddress
                        ] ||
                        !undelegateAmounts[delegation.validatorAddress] ||
                        parseFloat(
                          undelegateAmounts[delegation.validatorAddress] || "0"
                        ) <= 0 ||
                        undelegateStatuses[delegation.validatorAddress] ===
                          "success" ||
                        (delegation as any).isPending
                      }
                      className="w-full sm:flex-1 text-[#063d00] rounded-[98px] px-6 py-[14px]"
                      style={{ background: '#6aff00', boxShadow: '0px 3px 0px rgba(0,0,0,0.68)' }}
                    >
                      {undelegateInProgress.current[
                        delegation.validatorAddress
                      ] ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Undelegating...
                        </>
                      ) : (
                        "Undelegate"
                      )}
                    </Button>
                  </div>
                  {false}
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
