import {
  TableHead,
  TableRow,
  TableHeader as UITableHeader,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ValidatorData } from "./mocks/validators";
import clsx from "clsx";
import { ArrowDown, ArrowUp, Info } from "lucide-react";
import Image from "next/image";

interface TableHeaderProps {
  onSort: (key: keyof ValidatorData) => void;
  sortConfig: {
    key: keyof ValidatorData | null;
    direction: "asc" | "desc";
  };
}

const COLUMN_TOOLTIPS = {
  name: "Name and identifier of the Validator node",
  totalStaked: "Total amount of tokens currently staked with this Validator",
  nextRound:
    "Is this Validator active on the Consensus?",
  delegationRate:
    "Percentage of rewards the Validator gives away to its Delegators",
  earnings: "Total rewards earned and unclaimed by Validator and Delegators",
  actions: "Available actions you can perform with this Validator",
};

const InfoTooltip = ({ content }: { content: string }) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <Info
        size={14}
        className="text-somnia-color-text-primary-03 hover:text-somnia-color-text-primary-02 cursor-help transition-colors"
      />
    </TooltipTrigger>
    <TooltipContent side="top" className="max-w-[200px] text-center">
      <p>{content}</p>
    </TooltipContent>
  </Tooltip>
);

const getSortIcon = (
  columnKey: keyof ValidatorData,
  sortConfig: TableHeaderProps["sortConfig"]
) => {
  if (sortConfig.key !== columnKey) {
    return "/staking/chevron-up-down.svg";
  }
  return sortConfig.direction === "desc" ? (
    <ArrowUp size={16} />
  ) : (
    <ArrowDown size={16} />
  );
};

export const TableHeader = ({ onSort, sortConfig }: TableHeaderProps) => (
  <UITableHeader>
    <TableRow className="border-none">
      <TableHead className="font-headline-polysans-h7 text-somnia-color-text-primary-02">
        <div className="flex items-center gap-2">
          <div
            className={clsx(
              "flex items-center gap-2 cursor-pointer",
              sortConfig.key === "name" && "font-semibold"
            )}
            onClick={() => onSort("name")}
          >
            Validator
            {typeof getSortIcon("name", sortConfig) === "string" ? (
              <Image
                src={getSortIcon("name", sortConfig) as string}
                className="hover:cursor-pointer somnia-home-header"
                alt="chevron Logo"
                width={16}
                height={16}
                style={{ pointerEvents: "none" }}
              />
            ) : (
              getSortIcon("name", sortConfig)
            )}
          </div>
          <InfoTooltip content={COLUMN_TOOLTIPS.name} />
        </div>
      </TableHead>
      <TableHead className="font-headline-polysans-h7 text-somnia-color-text-primary-02">
        <div className="flex items-center gap-2">
          <div
            className={clsx(
              "flex items-center gap-2 cursor-pointer",
              sortConfig.key === "totalStaked" && "font-semibold"
            )}
            onClick={() => onSort("totalStaked")}
          >
            Total staked
            {typeof getSortIcon("totalStaked", sortConfig) === "string" ? (
              <Image
                src={getSortIcon("totalStaked", sortConfig) as string}
                className="hover:cursor-pointer somnia-home-header"
                alt="chevron Logo"
                width={16}
                height={16}
                style={{ pointerEvents: "none" }}
              />
            ) : (
              getSortIcon("totalStaked", sortConfig)
            )}
          </div>
          <InfoTooltip content={COLUMN_TOOLTIPS.totalStaked} />
        </div>
      </TableHead>
      {/* Removed Next validation round column as per requirements */}
      <TableHead className="font-headline-polysans-h7 text-somnia-color-text-primary-02 text-center">
        <div className="flex items-center justify-center gap-2">
          <div
            className={clsx(
              "flex items-center gap-2 cursor-pointer",
              sortConfig.key === "delegationRate" && "font-semibold"
            )}
            onClick={() => onSort("delegationRate")}
          >
            Delegation Rate
            {typeof getSortIcon("delegationRate", sortConfig) === "string" ? (
              <Image
                src={getSortIcon("delegationRate", sortConfig) as string}
                className="hover:cursor-pointer somnia-home-header"
                alt="chevron Logo"
                width={16}
                height={16}
                style={{ pointerEvents: "none" }}
              />
            ) : (
              getSortIcon("delegationRate", sortConfig)
            )}
          </div>
          <InfoTooltip content={COLUMN_TOOLTIPS.delegationRate} />
        </div>
      </TableHead>
      <TableHead className="font-headline-polysans-h7 text-somnia-color-text-primary-02 text-right">
        <div className="flex items-center justify-end gap-2">
          <div
            className={clsx(
              "flex items-center gap-2 cursor-pointer",
              sortConfig.key === "earnings" && "font-semibold"
            )}
            onClick={() => onSort("earnings")}
          >
            Earnings
            {typeof getSortIcon("earnings", sortConfig) === "string" ? (
              <Image
                src={getSortIcon("earnings", sortConfig) as string}
                className="hover:cursor-pointer somnia-home-header"
                alt="chevron Logo"
                width={16}
                height={16}
                style={{ pointerEvents: "none" }}
              />
            ) : (
              getSortIcon("earnings", sortConfig)
            )}
          </div>
          <InfoTooltip content={COLUMN_TOOLTIPS.earnings} />
        </div>
      </TableHead>
      <TableHead className="font-headline-polysans-h7 text-somnia-color-text-primary-02 text-center">
        <div className="flex items-center justify-center gap-2">
          <span>Actions</span>
          <InfoTooltip content={COLUMN_TOOLTIPS.actions} />
        </div>
      </TableHead>
    </TableRow>
  </UITableHeader>
);
