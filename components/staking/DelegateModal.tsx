"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { ValidatorData } from "./mocks/validators";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useAccount, useWriteContract, usePublicClient } from "wagmi";
import { parseEther, formatEther } from "viem";
import stakingAbi from "@/components/abi/SomniaStaking.json";
import type { Abi } from "viem";
import { Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { pendingDelegationsStorage } from "@/lib/pendingDelegations";
import { getErrorMessage, isUserRejection } from "@/utils/errorMessages";
import { useTopDelegators } from "@/hooks/useTopDelegators";

interface DelegateModalProps {
  validators: ValidatorData[];
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  preselectedValidator?: ValidatorData | null;
  maxTotalValidatorStake?: bigint | unknown;
}

export function DelegateModal({
  validators,
  isOpen,
  onOpenChange,
  preselectedValidator,
  maxTotalValidatorStake,
}: DelegateModalProps) {
  const { toast } = useToast();
  const { address: userAddress } = useAccount();
  const [selectedValidator, setSelectedValidator] = useState("");
  const [stakeAmount, setStakeAmount] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isError, setIsError] = useState(false);
  const [validatorSearch, setValidatorSearch] = useState("");

  const { delegators: topDelegators, loading: topLoading } = useTopDelegators(selectedValidator || undefined, 10);

  // Filter validators based on search term
  const filteredValidators = validators.filter(
    (validator) =>
      validator.name.toLowerCase().includes(validatorSearch.toLowerCase()) ||
      validator.address.toLowerCase().includes(validatorSearch.toLowerCase())
  );

  // Use controlled state if provided, otherwise use internal state
  const isDialogOpen = isOpen !== undefined ? isOpen : isModalOpen;

  // Set preselected validator when modal opens or preselected validator changes
  useEffect(() => {
    if (preselectedValidator && isDialogOpen) {
      setSelectedValidator(preselectedValidator.address);
      setValidatorSearch(""); // Clear search when preselecting
    }
  }, [preselectedValidator, isDialogOpen]);

  // Memoize handleOpenChange to prevent recreating it on every render
  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (onOpenChange) {
        onOpenChange(open);
      } else {
        setIsModalOpen(open);
      }
    },
    [onOpenChange]
  );

  const resetForm = () => {
    // Only reset selected validator if there's no preselected validator
    if (!preselectedValidator) {
      setSelectedValidator("");
    }
    setStakeAmount("");
    setIsError(false);
    setValidatorSearch("");

    // Reset transaction-related state
    setTxHash(null);
    setTxStatus(null);
    isWriteInProgress.current = false;
  };

  const { writeContract, writeContractAsync, isPending } = useWriteContract();
  const publicClient = usePublicClient();

  const [txHash, setTxHash] = useState<string | null>(null);
  const [txStatus, setTxStatus] = useState<
    "pending" | "success" | "reverted" | null
  >(null);

  // Note: All error and success handling is now done in handleDelegateStake function
  // This useEffect previously handled writeError but caused duplicate error messages

  // Reset flags when component unmounts or modal is closed
  useEffect(() => {
    if (!isDialogOpen) {
      resetForm();
      isWriteInProgress.current = false;
    }

    return () => {
      isWriteInProgress.current = false;
    };
  }, [isDialogOpen]);

  // Add a ref to track if a write operation is in progress
  const isWriteInProgress = useRef(false);

  // Calculate remaining capacity for selected validator
  const remainingCapacity = useMemo(() => {
    if (!selectedValidator || !maxTotalValidatorStake) return null;

    const validatorData = validators.find(
      (v) => v.address === selectedValidator
    );
    if (!validatorData?.totalStakedWei || validatorData.isAtMaxStake)
      return null;

    const maxStakeWei = BigInt(maxTotalValidatorStake.toString());
    const remainingCapacityWei = maxStakeWei - validatorData.totalStakedWei;
    const remainingCapacityEth = formatEther(remainingCapacityWei);
    const remainingCapacityFormatted = parseFloat(
      remainingCapacityEth
    ).toLocaleString("en-US", {
      maximumFractionDigits: 2,
      minimumFractionDigits: 0,
    });

    return remainingCapacityFormatted;
  }, [selectedValidator, maxTotalValidatorStake, validators]);

  const handleDelegateStake = async () => {
    // Prevent multiple submissions
    if (isWriteInProgress.current || isPending) {
      return;
    }

    try {
      if (!userAddress) {
        toast({
          variant: "destructive",
          title: "Wallet not connected",
          description: "Please connect your wallet.",
        });
        return;
      }
      if (!selectedValidator || !stakeAmount || parseFloat(stakeAmount) <= 0) {
        toast({
          variant: "destructive",
          title: "Validation Error",
          description:
            "Please select a validator and enter a valid stake amount",
        });
        return;
      }

      // Check if validator is at max stake or would exceed it with this delegation
      const selectedValidatorData = validators.find(
        (v) => v.address === selectedValidator
      );

      if (selectedValidatorData?.isAtMaxStake) {
        toast({
          variant: "destructive",
          title: "Validator at Maximum Stake",
          description: "Validator has reached its max allowed stake",
        });
        return;
      }

      // Check if delegation amount would exceed max stake
      if (selectedValidatorData?.totalStakedWei && maxTotalValidatorStake) {
        const delegationAmountWei = parseEther(stakeAmount);
        const newTotalStake =
          selectedValidatorData.totalStakedWei + delegationAmountWei;
        const maxStakeWei = BigInt(maxTotalValidatorStake.toString());

        if (newTotalStake > maxStakeWei) {
          const remainingCapacityWei =
            maxStakeWei - selectedValidatorData.totalStakedWei;
          const remainingCapacityEth = formatEther(remainingCapacityWei);
          const remainingCapacityFormatted = parseFloat(
            remainingCapacityEth
          ).toLocaleString("en-US", {
            maximumFractionDigits: 2,
            minimumFractionDigits: 0,
          });

          toast({
            variant: "destructive",
            title: "Delegation Exceeds Validator Limit",
            description: `This delegation would exceed the validator's maximum stake. Maximum additional stake allowed: ${remainingCapacityFormatted} SOMI`,
          });
          return;
        }
      }

      // Validate contract address is available
      const contractAddress = process.env
        .NEXT_PUBLIC_STAKING_ADDRESS as `0x${string}`;
      if (!contractAddress) {
        toast({
          variant: "destructive",
          title: "Configuration Error",
          description: "Contract address not found",
        });
        return;
      }

      const args = [selectedValidator, parseEther(stakeAmount)];
      const value = parseEther(stakeAmount);

      // Show pending toast
      toast({
        title: "Processing",
        description: "Your transaction is being processed...",
      });

      // Set flag to indicate write operation is in progress
      isWriteInProgress.current = true;

      // Estimate gas and 10x the limit to avoid out-of-gas
      let gasOverride: bigint | undefined = undefined;
      if (publicClient && userAddress) {
        const estimate = await publicClient.estimateContractGas({
          address: contractAddress,
          abi: stakingAbi.abi as Abi,
          functionName: "delegateStake",
          args,
          account: userAddress,
          value,
        });
        gasOverride = estimate * 10n;
      }

      // Send tx and capture hash
      const hash = await writeContractAsync({
        address: contractAddress,
        abi: stakingAbi.abi as Abi,
        functionName: "delegateStake",
        args,
        value,
        ...(gasOverride ? { gas: gasOverride } : {}),
      });
      setTxHash(hash);
      setTxStatus("pending");
      // Toast with explorer link
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

      // Wait for receipt
      if (publicClient) {
        const receipt = await publicClient.waitForTransactionReceipt({ hash });
        const reverted = receipt.status !== "success";
        setTxStatus(reverted ? "reverted" : "success");
        isWriteInProgress.current = false;

        // Notify outcome
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
          // Save pending delegation to local storage
          if (userAddress) {
            const selectedValidatorData = validators.find(
              (v) => v.address === selectedValidator
            );
            const validatorName =
              selectedValidatorData?.name ||
              `${selectedValidator.slice(0, 6)}...${selectedValidator.slice(
                -4
              )}`;

            const formattedAmount = parseFloat(stakeAmount).toLocaleString(
              "en-US",
              {
                maximumFractionDigits: 4,
                minimumFractionDigits: 0,
              }
            );

            pendingDelegationsStorage.addPendingDelegation(userAddress, {
              validatorAddress: selectedValidator,
              validatorName,
              delegatedAmount: parseEther(stakeAmount).toString(),
              txHash: hash,
              timestamp: Date.now(),
              formattedDelegatedAmount: `${formattedAmount} SOMI`,
            });
          }

          toast({
            title: "Success!",
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
      // Reset flag on error
      isWriteInProgress.current = false;

      // Show user-friendly error message
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
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        className="w-[620px] max-w-[95vw] rounded-[44px] border-0 p-0 overflow-hidden"
        style={{ backgroundColor: "#33a000", boxShadow: "0px 14px 28.7px rgba(0,0,0,0.25)" }}
      >
        <div className="px-[40px] pt-[32px] pb-[24px]">
          <DialogHeader>
            <DialogTitle className="font-soccer italic uppercase text-[40px] tracking-[0.8px] text-[#d9ff00] [text-shadow:#000_0px_3px_0px] leading-none">
              DELEGATE STAKE
            </DialogTitle>
            <DialogDescription className="mt-4 text-[20px] text-white font-polysans">
              Choose a validator and enter the amount you want to delegate.
            </DialogDescription>
          </DialogHeader>
        </div>
        <div className="grid gap-3 px-[37px] pb-6">
          {/* Validator selection */}
          <div className="grid gap-1.5">
            {!selectedValidator ? (
              <>
                <label htmlFor="validator" className="text-sm font-medium text-white">
                  Select a Validator
                </label>
                {/* Custom validator selection dropdown */}
                <div className="relative w-full">
                  <div className="relative">
                    <Input
                      placeholder="Search validators..."
                      value={validatorSearch}
                      onChange={(e) => setValidatorSearch(e.target.value)}
                      className="pl-9 py-2 h-10 w-full"
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>

                  <div className="mt-2 border rounded-md bg-white max-h-[240px] overflow-y-auto">
                    {filteredValidators.length === 0 ? (
                      <div className="p-3 text-center text-sm text-gray-500">
                        No validators found
                      </div>
                    ) : (
                      filteredValidators.map((validator) => (
                        <div
                          key={validator.id}
                          className={`p-3 cursor-pointer hover:bg-gray-50 border-b last:border-0 flex items-center gap-2 ${
                            selectedValidator === validator.address
                              ? "bg-blue-50"
                              : ""
                          }`}
                          onClick={() =>
                            setSelectedValidator(validator.address)
                          }
                        >
                          <img
                            src={validator.icon}
                            alt={validator.name}
                            className="w-6 h-6 rounded-full flex-shrink-0"
                          />
                          <div className="overflow-hidden">
                            <div className="font-medium truncate">
                              {validator.name}
                            </div>
                            <div className="text-xs text-gray-500 truncate">
                              {validator.address}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            ) : null}
          </div>

          {/* Selected validator info */}
          {selectedValidator && (
            <div className="rounded-[18px] p-5" style={{ backgroundColor: "#0b7000" }}>
              <div className="flex justify-between items-start mb-2">
                <h4 className="text-[20px] tracking-[0.4px] text-[#9dff00] font-polysans">Select Validator</h4>
                <Button
                  onClick={() => setSelectedValidator("")}
                  className="rounded-[39px] px-4 py-[14px] h-auto text-[17px] font-polysans"
                  style={{ backgroundColor: "#dffc96", color: "#0a6000", boxShadow: "0px 3px 0px rgba(0,0,0,0.18)" }}
                  variant="ghost"
                >
                  Change Validator
                </Button>
              </div>
              {validators
                .filter((v) => v.address === selectedValidator)
                .map((validator) => (
                  <div key={validator.id} className="flex items-center gap-5 mt-3">
                    <img src={validator.icon} alt={validator.name} className="w-[65px] h-[65px] rounded-full" />
                    <div className="text-white">
                      <div className="text-[25px] tracking-[0.5px] font-polysans">{validator.name}</div>
                      <div className="text-[17px] truncate max-w-[339px]">{validator.address}</div>
                      <div className="text-[15px] text-[#96df8e] mt-1">Total staked: {validator.totalStaked}</div>
                    </div>
                  </div>
                ))}
            </div>
          )}

          <div className="grid gap-2">
            <label htmlFor="amount" className="text-[20px] text-white font-polysans">
              Amount (SOMI)
            </label>
            <Input
              id="amount"
              type="number"
              placeholder="Enter stake amount"
              value={stakeAmount}
              onChange={(e) => setStakeAmount(e.target.value)}
              min="0"
              step="0.01"
              className="w-full px-3 py-[14px] rounded-[14px] text-[#9af470] placeholder:text-[#9af470]"
              style={{ backgroundColor: "#0b7000", borderColor: "#50c718", borderWidth: 1 }}
            />
            {/* Show remaining capacity for selected validator */}
            {remainingCapacity && (
              <div className="text-xs text-gray-600 mt-1">
                Maximum additional stake allowed:{" "}
                <span className="font-medium text-green-600">
                  {remainingCapacity} SOMI
                </span>
              </div>
            )}
          </div>

          {false}
        </div>
        <div className="flex flex-col sm:flex-row justify-end gap-4 px-[37px] pb-[32px]">
          {txStatus === "success" ? (
            // Show Go Back button when delegation is successful
            <Button
              onClick={() => {
                if (onOpenChange) {
                  onOpenChange(false);
                } else {
                  setIsModalOpen(false);
                }
              }}
              className="w-full sm:w-auto rounded-[98px] px-7 py-[22px] text-[21px]"
              style={{ background: "#66de2e", color: "#063d00", boxShadow: "0px 3px 0px rgba(0,0,0,0.68)" }}
            >
              Go Back
            </Button>
          ) : (
            // Show original Cancel/Delegate buttons when not successful
            <>
              <Button
                onClick={() => {
                  if (onOpenChange) {
                    onOpenChange(false);
                  } else {
                    setIsModalOpen(false);
                  }
                }}
                className="w-full sm:w-auto order-2 sm:order-1 rounded-[98px] px-7 py-[22px] text-[21px]"
                style={{ background: "#66de2e", color: "#063d00", boxShadow: "0px 3px 0px rgba(0,0,0,0.68)" }}
              >
                Cancel
              </Button>

              <Button
                onClick={(e) => {
                  e.preventDefault();
                  if (isWriteInProgress.current || isPending) return;
                  handleDelegateStake();
                }}
                disabled={
                  isPending ||
                  !selectedValidator ||
                  !stakeAmount ||
                  isWriteInProgress.current ||
                  validators.find((v) => v.address === selectedValidator)
                    ?.isAtMaxStake
                }
                className="w-full text-black sm:w-auto order-1 sm:order-2 rounded-[98px] px-7 py-[22px] text-[21px]"
                style={{ background: "#6aff00", color: "#063d00", boxShadow: "0px 3px 0px rgba(0,0,0,0.68)" }}
              >
                {isPending || isWriteInProgress.current
                  ? "Processing..."
                  : "Delegate Stake"}
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
