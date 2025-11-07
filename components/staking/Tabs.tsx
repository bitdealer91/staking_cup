"use client";

import clsx from "clsx";
import React from "react";
import { Button } from "../ui/button";
import { TabsList, Tabs as TabsPrimitive, TabsTrigger } from "../ui/tabs";
import { DelegateModal } from "./DelegateModal";
import { DelegationsModal } from "./DelegationsModal";
import { useValidatorData } from "./hooks/useValidatorData";
import { VALIDATOR_NAMES, ALLOWED_VALIDATOR_NAMES } from "./data/validatorNames";

const STACKING_NAVIGATION_TABS = [
  { id: "delegations-manage", label: "My Delegations" },
  { id: "delegations", label: "Delegate your Stake" },
];

export const Tabs = () => {
  const [activeTab, setActiveTab] = React.useState<string>(
    STACKING_NAVIGATION_TABS[0].id
  );
  const [showDelegateModal, setShowDelegateModal] = React.useState(false);
  const [showDelegationsModal, setShowDelegationsModal] = React.useState(false);

  // (debug logs removed)

  // Get all validators for the delegate modal
  const { allValidators, maxTotalValidatorStake } = useValidatorData(
    "",
    { key: null, direction: "asc" },
    1,
    100, // Large number to get more validators
    VALIDATOR_NAMES,
    ALLOWED_VALIDATOR_NAMES
  );

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    // If delegations tab is clicked, show the delegate modal
    if (value === "delegations") {
      setShowDelegateModal(true);
    }
    // If delegations-manage tab is clicked, show the delegations management modal
    if (value === "delegations-manage") {
      setShowDelegationsModal(true);
    }
  };

  return (
    <>
      <TabsPrimitive
        defaultValue={STACKING_NAVIGATION_TABS[0].id}
        className="w-full flex flex-col items-center"
        orientation="vertical"
        onValueChange={handleTabChange}
        value={activeTab}
      >
        <TabsList
          className={clsx(
            "md:w-[420px] w-full flex md:flex-row flex-col items-center justify-between gap-4 p-[6px] mb-6 h-[48px]",
            "rounded-[16px] bg-somnia-color-background-primary-01",
            "border-none"
          )}
          data-orientation="horizontal"
        >
          {STACKING_NAVIGATION_TABS.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              asChild
              className="border-none"
            >
              <Button
                variant={activeTab === tab.id ? "somnia" : "outline"}
                onClick={() => {
                  handleTabChange(tab.id);
                }}
                className={clsx(
                  "md:w-[200px] w-full h-full font-label-primary-label-03 tracking-[0.32px] text-[14px] md:text-[15px] font-semibold rounded-[12px]",
                  activeTab === tab.id
                    ? "!bg-somnia-color-background-accent-03 !text-somnia-color-text-fixed-primary-01 !shadow-md"
                    : "!bg-somnia-color-background-primary-02 !text-somnia-color-text-primary-01 hover:!bg-somnia-color-background-primary-02/90 !border !border-somnia-color-background-accent-03"
                )}
              >
                {tab.label}
              </Button>
            </TabsTrigger>
          ))}
        </TabsList>
      </TabsPrimitive>

      {/* Delegate Modal */}
      <DelegateModal
        validators={allValidators}
        isOpen={showDelegateModal}
        onOpenChange={(open) => {
          setShowDelegateModal(open);
          // If modal is closed, switch back to first tab
          if (!open && activeTab === "delegations") {
            setActiveTab(STACKING_NAVIGATION_TABS[0].id);
          }
        }}
        maxTotalValidatorStake={maxTotalValidatorStake}
      />

      {/* Delegations Management Modal */}
      <DelegationsModal
        isOpen={showDelegationsModal}
        onOpenChange={(open) => {
          setShowDelegationsModal(open);
          // If modal is closed, switch back to first tab
          if (!open && activeTab === "delegations-manage") {
            setActiveTab(STACKING_NAVIGATION_TABS[0].id);
          }
        }}
      />
    </>
  );
};
