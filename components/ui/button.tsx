import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-[16px] font-semibold ring-offset-background transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:brightness-105 active:translate-y-[1px] active:brightness-95 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline:
          'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        'primary-100':
          'bg-somnia-color-background-primary-02 text-somnia-color-text-primary-01 hover:bg-somnia-color-background-primary-03',
        'primary-200':
          'bg-somnia-color-background-primary-03 text-somnia-color-text-primary-01 hover:bg-somnia-color-background-primary-04',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
        somnia:
          "font-polysans [font-feature-settings:'liga'_off,'clig'_off] font-semibold leading-normal tracking-[0.4px] text-edge-cap [font-feature-settings:'liga'_off,'clig'_off] shadow-[0px_2px_2px_0px_#FFF_inset] rounded-[16px] transition-all duration-200 disabled:bg-[#F8F8F8] disabled:text-[#BFBFBF] bg-[#333BFF] text-white hover:bg-[#2930CC] active:bg-[#1F2499] hover:brightness-105 active:translate-y-[1px]",
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-[40px] text-[16px]',
        md: 'h-[48px] text-[18px]',
        lg: 'h-[64px] text-[24px]',
        icon: 'h-10 w-10',
      },
      fullWidth: {
        true: 'w-full',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      fullWidth: false,
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, fullWidth, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, fullWidth, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
