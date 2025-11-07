import clsx from 'clsx';

interface IWalletBalance {
  insufficientBallance?: boolean;
  walletBalance?: string;
  onMaxButtonClick?: (maxValue: string) => void;
  label?: string;
}

const WalletBalance = ({
  walletBalance,
  onMaxButtonClick,
  insufficientBallance,
  label = 'Balance',
}: IWalletBalance) => {
  return walletBalance ? (
    <p
      className={clsx(
        'text-xs',
        insufficientBallance ? 'text-red-500' : 'text-gray-500'
      )}
    >
      {insufficientBallance ? 'Insufficient ' : ''}
      {label}: <span className='font-mono'>{walletBalance}</span>
      {parseFloat(walletBalance) > 0 && onMaxButtonClick && (
        <span
          className='ml-2 text-blue-600 font-bold uppercase text-xs cursor-pointer'
          onClick={() => onMaxButtonClick(walletBalance)}
        >
          Max
        </span>
      )}
    </p>
  ) : (
    <p className='flex items-center'>
      <span className='text-gray-500 text-xs'>Balance not viewable</span>
    </p>
  );
};

export default WalletBalance;
