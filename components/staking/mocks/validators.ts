export interface ValidatorData {
  id: number;
  icon: string;
  name: string;
  address: string;
  totalStaked: string;
  nextRound: string;
  earnings: string;
  delegationRate: string;
  totalStakedWei?: bigint; // Raw stake amount in wei for comparisons
  isAtMaxStake?: boolean; // Whether validator has reached max allowed stake
}

export const mockValidators: ValidatorData[] = Array.from(
  { length: 95 },
  (_, i) => ({
    id: i + 1,
    icon: "/staking/user-default-avatar.png",
    name: `Validator ${i + 1}`,
    address: `0x${i.toString(16).padStart(40, "0")}`,
    totalStaked: `${64574 + i * 100} SOMI`,
    nextRound: i % 3 === 0 ? "Yes" : "No",
    earnings: `${14750 + i * 50} SOMI`,
    delegationRate: `${5 + ((i * 3) % 15)}%`, // Random rates between 5-20%
  })
);
