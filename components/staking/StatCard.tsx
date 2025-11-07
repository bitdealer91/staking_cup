import { Card, CardContent } from '@/components/ui/card';
import { formatNumber } from '@/lib/formatNumber';

interface StatCardProps {
  value: number;
  label: string;
}

export const StatCard = ({ value, label }: StatCardProps): JSX.Element => {
  return (
    <Card className='flex flex-col border-2 border-solid border-somnia-color-border-primary-02 rounded-[32px] bg-somnia-color-background-primary-01'>
      <CardContent className='flex flex-col justify-center gap-6 p-8'>
        <div className='font-polysans inline-flex items-end gap-2'>
          <span className='text-[40px] leading-none font-polysans font-semibold text-center tracking-[0.80px]'>
            {formatNumber(value)}
          </span>
        </div>
        <span className='text-[20px] font-semibold font-polysans leading-none text-[#777]'>
          {label}
        </span>
      </CardContent>
    </Card>
  );
};
