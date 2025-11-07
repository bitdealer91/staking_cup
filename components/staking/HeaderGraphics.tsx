'use client';

import { Card, CardContent } from '@/components/ui/card';
import clsx from 'clsx';

const items = [
  {
    size: 'w-[40px] h-[40px]',
    rotate: '-rotate-210',
    blur: 'filter blur-[2px]',
  },
  { size: 'w-20 h-20' },
  {
    size: 'w-[40px] h-[40px]',
    rotate: 'rotate-210',
    blur: 'filter blur-[2px]',
  },
];

export const HeaderGraphics = () => {
  return (
    <div className='flex items-center justify-center gap-6 pb-6'>
      {items.map((item, index) => (
        <Card
          key={index}
          className={clsx(
            'bg-transparent border-none shadow-none',
            item.rotate
          )}
        >
          <CardContent className='p-0'>
            <div
              className={clsx(
                item.size,
                'text-blue-600 flex items-center justify-center'
              )}
            >
              <img
                src='/staking/circles-pattern.svg'
                className={clsx('w-full h-full')}
                style={{
                  filter: clsx(
                    'brightness(0) saturate(100%) invert(43%) sepia(93%) saturate(6200%) hue-rotate(235deg) brightness(101%) contrast(101%)',
                    item.blur && 'blur(2px)'
                  ),
                }}
              />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
