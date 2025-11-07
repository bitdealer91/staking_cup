"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

interface SegmentedControlProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}

interface SegmentedControlContextValue {
  selectedValue: string | null;
  onValueChange: (value: string) => void;
}

const SegmentedControlContext = React.createContext<
  SegmentedControlContextValue | undefined
>(undefined);

const SegmentedControl = React.forwardRef<
  HTMLDivElement,
  SegmentedControlProps
>(
  (
    { className, value, defaultValue, onValueChange, children, ...props },
    ref
  ) => {
    const [selectedValue, setSelectedValue] = React.useState<string | null>(
      value ?? defaultValue ?? null
    );

    React.useEffect(() => {
      if (value !== undefined) {
        setSelectedValue(value);
      }
    }, [value]);

    const handleValueChange = (newValue: string) => {
      if (value === undefined) {
        setSelectedValue(newValue);
      }
      onValueChange?.(newValue);
    };

    return (
      <SegmentedControlContext.Provider
        value={{ selectedValue, onValueChange: handleValueChange }}
      >
        <div
          ref={ref}
          className={cn("inline-flex items-center", className)}
          {...props}
        >
          {children}
        </div>
      </SegmentedControlContext.Provider>
    );
  }
);
SegmentedControl.displayName = "SegmentedControl";

interface SegmentedControlListProps
  extends React.HTMLAttributes<HTMLDivElement> {}

const SegmentedControlList = React.forwardRef<
  HTMLDivElement,
  SegmentedControlListProps
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center gap-[var(--somnia-spacing-lg)]",
      className
    )}
    {...props}
  />
));
SegmentedControlList.displayName = "SegmentedControlList";

interface SegmentedControlTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
}

const SegmentedControlTrigger = React.forwardRef<
  HTMLButtonElement,
  SegmentedControlTriggerProps
>(({ className, value, children, ...props }, ref) => {
  const context = React.useContext(SegmentedControlContext);

  if (!context) {
    throw new Error(
      "SegmentedControlTrigger must be used within a SegmentedControl"
    );
  }

  const isSelected = context.selectedValue === value;

  return (
    <Button
      ref={ref}
      //TODO change variants based on new button component
      variant={isSelected ? "default" : "primary-100"}
      className={cn(className)}
      onClick={() => context.onValueChange(value)}
      {...props}
    >
      {children}
    </Button>
  );
});
SegmentedControlTrigger.displayName = "SegmentedControlTrigger";

export { SegmentedControl, SegmentedControlList, SegmentedControlTrigger };
