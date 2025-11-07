import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import React from "react";

const typographyVariants = cva(
  "font-polysans leading-[100%] font-semibold tracking-[0%]",
  {
    variants: {
      variant: {
        display1: "text-[96px] ",
        display2: "text-[72px] ",
        display3: "text-[56px] ",
        h1: "text-[40px] ",
        h2: "text-[32px] ",
        h3: "text-[24px] ",
        h4: "text-[20px] ",
        h5: "text-[16px] ",
        h6: "text-[14px] ",
        p1: "text-[20px] font-normal",
        p2: "text-[18px] font-normal",
        p3: "text-[16px] font-normal",
        p4: "text-[14px] font-normal",
      },
      //TODO add all colors to globalcss
      color: {
        "primary-100": "text-somnia-color-text-primary-01",
        "primary-200": "text-somnia-color-text-primary-02",
        "primary-300": "text-somnia-color-text-primary-02",
        "primary-400": "text-somnia-color-text-primary-02",
        "primary-500": "text-somnia-color-text-primary-02",
        "secondary-100": "text-somnia-color-text-primary-01",
        "secondary-200": "text-somnia-color-text-secondary-02",
        "secondary-300": "text-somnia-color-text-secondary-03",
        "secondary-400": "text-somnia-color-text-secondary-04",
        "secondary-500": "text-somnia-color-text-secondary-05",
        "fixed-primary-100": "text-somnia-color-text-primary-01",
        "fixed-primary-200": "text-somnia-color-text-primary-02",
        "fixed-secondary-100": "text-somnia-color-text-secondary-01",
        "fixed-secondary-200": "text-somnia-color-text-secondary-02",
      },
    },
    defaultVariants: {
      variant: "p1",
      color: "primary-100",
    },
  }
);

export interface TypographyProps
  extends Omit<React.HTMLAttributes<HTMLHeadingElement>, "color">,
    VariantProps<typeof typographyVariants> {}

const Typography = React.forwardRef<HTMLElement, TypographyProps>(
  ({ className, variant, color, ...props }, ref) => {
    const element = variant?.startsWith("p")
      ? "p"
      : variant?.startsWith("display")
      ? "div"
      : variant || "p";

    const ariaProps = variant?.startsWith("display")
      ? { role: "heading", "aria-level": "1" }
      : {};

    return React.createElement(element as any, {
      className: cn(typographyVariants({ variant, color, className })),
      ref,
      ...ariaProps,
      ...props,
    });
  }
);
Typography.displayName = "H1";

export default Typography;
