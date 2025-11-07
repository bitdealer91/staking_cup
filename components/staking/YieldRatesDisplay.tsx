"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import { useAprData } from "@/hooks/useAprData";

export const YieldRatesDisplay = () => {
  const { yieldData, burnRate, realYield, loading, error } = useAprData();

  if (loading) {
    return (
      <div className="w-full flex justify-center items-center py-6">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-somnia-color-background-accent-03"></div>
          <span className="text-somnia-color-text-primary-02 text-sm">
            Loading yield rates...
          </span>
        </div>
      </div>
    );
  }

  if (error || !yieldData) {
    return (
      <div className="w-full flex justify-center items-center py-6">
        <div className="text-somnia-color-text-primary-02 text-sm">
          Unable to load yield rates
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="w-full flex justify-center mb-8">
        <Card className="border-none shadow-none bg-transparent">
          <CardContent className="p-0">
            <div className="flex flex-col items-center justify-center gap-6">
              {/* Top Row - Burn Rate and APY */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12">
                {/* Burn Rate Display */}
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-orange-400 to-red-500">
                    <span className="text-xl">🔥</span>
                  </div>
                  <div className="text-center sm:text-left">
                    <div className="text-2xl sm:text-3xl font-bold text-somnia-color-text-primary-01">
                      {burnRate.toFixed(4)}%
                    </div>
                    <div className="text-sm text-somnia-color-text-primary-02 font-medium flex items-center gap-1">
                      Burn Rate
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info
                            size={14}
                            className="text-somnia-color-text-primary-03 hover:text-somnia-color-text-primary-02 cursor-help transition-colors"
                          />
                        </TooltipTrigger>
                        <TooltipContent
                          side="top"
                          className="max-w-[250px] text-center"
                        >
                          <p>
                            The percentage of total token supply (1B tokens)
                            that gets "burned" through rewards distribution
                            annually. This creates deflationary pressure on the
                            token.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                </div>

                {/* Separator */}
                <div className="hidden sm:block w-px h-12 bg-somnia-color-background-accent-03/30"></div>

                {/* APY Display */}
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-purple-500">
                    <span className="text-xl">🚀</span>
                  </div>
                  <div className="text-center sm:text-left">
                    <div className="text-2xl sm:text-3xl font-bold text-somnia-color-text-primary-01">
                      {yieldData.apy.toFixed(2)}%
                    </div>
                    <div className="text-sm text-somnia-color-text-primary-02 font-medium flex items-center gap-1">
                      Staking APR
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info
                            size={14}
                            className="text-somnia-color-text-primary-03 hover:text-somnia-color-text-primary-02 cursor-help transition-colors"
                          />
                        </TooltipTrigger>
                        <TooltipContent
                          side="top"
                          className="max-w-[250px] text-center"
                        >
                          <p>
                            Annual Percentage Yield for staking. This is the
                            compound interest rate you earn by staking your
                            tokens, with rewards compounding every ~5 minutes.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Row - Real Yield (Centered) */}
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500">
                  <span className="text-xl">💎</span>
                </div>
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold text-somnia-color-text-primary-01">
                    {realYield.toFixed(2)}%
                  </div>
                  <div className="text-sm text-somnia-color-text-primary-02 font-medium flex items-center gap-1 justify-center">
                    Real Yield
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info
                          size={14}
                          className="text-somnia-color-text-primary-03 hover:text-somnia-color-text-primary-02 cursor-help transition-colors"
                        />
                      </TooltipTrigger>
                      <TooltipContent
                        side="top"
                        className="max-w-[250px] text-center"
                      >
                        <p>
                          The total economic benefit combining both deflationary
                          burn rate and staking yield. This represents the true
                          value accrual to the Somnia ecosystem (Burn Rate +
                          APY).
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="mt-6 text-center">
              <div className="text-xs text-somnia-color-text-primary-02/50">
                Calculated from last 100 epochs • Updates every 5 minutes •
                Cached for performance
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
};
