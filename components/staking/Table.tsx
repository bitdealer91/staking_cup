"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import * as ScrollArea from "@radix-ui/react-scroll-area";
import Image from "next/image";

import {
  TableBody,
  TableCell,
  TableRow,
  Table as UITable,
} from "@/components/ui/table";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ValidatorData } from "./mocks/validators";
import { Search } from "lucide-react";
import { useState } from "react";
import { usePagination } from "@/components/staking/usePagination";
import { useValidatorData } from "@/components/staking/hooks/useValidatorData";
import { TableHeader } from "@/components/staking/TableHeader";
import { TablePagination } from "@/components/staking/TablePagination";
import { VALIDATOR_NAMES, ALLOWED_VALIDATOR_NAMES } from "@/components/staking/data/validatorNames";
import { DelegateModal } from "@/components/staking/DelegateModal";
import { Button } from "@/components/ui/button";

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50, 100] as const;

export const Table = () => {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(20);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof ValidatorData | null;
    direction: "asc" | "desc";
  }>({ key: "totalStaked", direction: "desc" });
  const [isDelegateModalOpen, setIsDelegateModalOpen] = useState(false);
  const [selectedValidator, setSelectedValidator] =
    useState<ValidatorData | null>(null);

  const { paginatedData, totalPages, totalItems, allValidators, maxTotalValidatorStake } =
    useValidatorData(
      search,
      sortConfig,
      currentPage,
      rowsPerPage,
      VALIDATOR_NAMES,
      ALLOWED_VALIDATOR_NAMES
    );

  const getPageNumbers = usePagination(totalPages);
  const pageNumbers = getPageNumbers(currentPage);

  const handleDelegateClick = (validator: ValidatorData) => {
    setSelectedValidator(validator);
    setIsDelegateModalOpen(true);
  };

  const handleSort = (key: keyof ValidatorData) => {
    setSortConfig({
      key,
      direction:
        sortConfig.key === key
          ? sortConfig.direction === "asc"
            ? "desc"
            : "asc"
          : "asc",
    });
  };

  return (
    <section className="w-full mx-auto mt-[88px]">
      <ScrollArea.Root className="w-full">
        <ScrollArea.Viewport className="w-full overflow-x-auto">
          <Card className="flex border-none shadow-none items-center justify-between">
            <CardContent className="flex items-center p-0">
              <h2 className="flex-1 font-heading-primary-heading-02 text-[32px] tracking-[0.64px] text-somnia-color-text-primary-01">
                Validators
              </h2>
            </CardContent>
            <div className="w-[320px] relative flex items-center p-1">
              <Search className="absolute left-5 z-10 w-5 h-5 pointer-events-none text-somnia-color-text-primary-02" />
              <Input
                type="text"
                placeholder="Search validator name"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-12 pl-12 pr-4 w-full bg-somnia-color-background-primary-02 border-none rounded-2xl placeholder:text-somnia-color-text-primary-03 placeholder:font-polysans placeholder:text-[18px] focus:ring-1 focus:ring-offset-0 focus:ring-somnia-color-accent-primary"
              />
            </div>
          </Card>
          <TooltipProvider>
            <UITable>
              <TableHeader onSort={handleSort} sortConfig={sortConfig} />
              <TableBody>
                {paginatedData.map((validator) => (
                  <TableRow
                    key={validator.id}
                    className="border-b-2 border-somnia-color-background-primary-02"
                  >
                    <TableCell className="text-somnia-color-text-primary-01 py-3 px-4 min-w-[160px] whitespace-nowrap">
                      <div className="flex items-center gap-8">
                        <div className="h-6 w-6 rounded-[var(--somnia-radius-radius-sm)] overflow-hidden flex-shrink-0">
                          <Image
                            src={validator.icon}
                            alt="validator-icon"
                            className="h-full w-full object-cover"
                            width={24}
                            height={24}
                          />
                        </div>
                        <span className="-ml-4" title={validator.address}>
                          {validator.name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-somnia-color-text-primary-01 py-3 px-4 min-w-[160px] whitespace-nowrap">
                      {validator.totalStaked}
                    </TableCell>
                    {/* Next validation round removed */}
                    <TableCell className="text-somnia-color-text-primary-01 text-center py-3 px-4 min-w-[140px] whitespace-nowrap">
                      {validator.delegationRate}
                    </TableCell>
                    <TableCell className="text-somnia-color-text-primary-01 text-right py-3 px-4 min-w-[160px] whitespace-nowrap">
                      {validator.earnings}
                    </TableCell>
                    <TableCell className="text-center py-3 px-4 min-w-[120px] whitespace-nowrap">
                      <Button
                        onClick={() => handleDelegateClick(validator)}
                        className="bg-gradient-dream-aurora text-white px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 hover:scale-105"
                      >
                        Delegate
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </UITable>
          </TooltipProvider>
        </ScrollArea.Viewport>
        <ScrollArea.Scrollbar
          className="flex h-[10px] select-none touch-none p-[2px]"
          orientation="horizontal"
        >
          <ScrollArea.Thumb className='relative flex-1 rounded-[10px] bg-somnia-color-background-accent before:absolute before:top-1/2 before:left-1/2 before:h-full before:min-h-[44px] before:w-full before:min-w-[44px] before:-translate-x-1/2 before:-translate-y-1/2 before:content-[""]' />
        </ScrollArea.Scrollbar>
      </ScrollArea.Root>

      <TablePagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        rowsPerPage={rowsPerPage}
        pageNumbers={pageNumbers}
        onPageChange={setCurrentPage}
        onRowsPerPageChange={(value) => setRowsPerPage(Number(value))}
        pageSizeOptions={PAGE_SIZE_OPTIONS}
      />

      <DelegateModal
        validators={allValidators}
        isOpen={isDelegateModalOpen}
        onOpenChange={(open) => {
          setIsDelegateModalOpen(open);
          if (!open) {
            setSelectedValidator(null); // Clear selection when modal closes
          }
        }}
        preselectedValidator={selectedValidator}
        maxTotalValidatorStake={maxTotalValidatorStake}
      />
    </section>
  );
};
