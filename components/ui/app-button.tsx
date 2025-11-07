import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import Image from 'next/image';
import * as React from 'react';
import Typography from './typography';

const appButtonVariants = cva(
  'flex flex-col border items-center gap-[var(--somnia-spacing-2xl)] rounded-[var(--somnia-radius-3xl)] p-[var(--somnia-spacing-2xl)] disabled:opacity-40 hover:bg-somnia-color-background-primary-02 active:bg-somnia-color-background-primary-03 transition hover:brightness-105 active:translate-y-[1px]',
  {
    variants: {
      selected: {
        true: 'bg-somnia-color-background-primary-02 border-somnia-color-border-primary-03',
        false: 'border-transparent',
      },
      fullWidth: {
        true: 'w-full',
        false: 'w-fit max-w-[112px]',
      },
    },
    defaultVariants: {
      selected: false,
      fullWidth: false,
    },
  }
);

export interface AppButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof appButtonVariants> {
  title: string;
  avatar: string;
  fullWidth?: boolean;
  deployed: boolean;
}

export const AppButton = React.forwardRef<HTMLButtonElement, AppButtonProps>(
  ({ className, selected, fullWidth, title, avatar, deployed, ...props }, ref) => {
    if (deployed) {
      return (
        <button
          className={cn(appButtonVariants({ selected, fullWidth, className }))}
          ref={ref}
          {...props}
        >
          <div className='relative h-20 w-20'>
            <Image
              src={avatar}
              alt={`${title} avatar`}
              fill
              className='rounded-[var(--somnia-radius-2xl)]'
            />
          </div>
          <Typography variant='h5'>{title}</Typography>
        </button>
      );
    } else {
      return (
        <button
          className={cn(appButtonVariants({ selected, fullWidth, className }))}
          ref={ref}
          {...props}
        >
          <div className='relative h-20 w-20'>
            <Image
              src={avatar}
              alt={`${title} avatar`}
              fill
              className='rounded-[var(--somnia-radius-2xl)]'
            />
            <div className='absolute inset-0 bg-gray-700/60 rounded-[var(--somnia-radius-2xl)] flex items-center justify-center'>
              <div className='transform rotate-45 text-white font-bold text-xs whitespace-nowrap'>
                Coming Soon!
              </div>
            </div>
          </div>
          <Typography variant='h5'>{title}</Typography>
        </button>
      );
    }
  }
);

AppButton.displayName = 'AppButton';
