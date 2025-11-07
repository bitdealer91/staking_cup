'use client';
import Image from 'next/image';

export interface SimpleFeaturesCardProps {
  title: string;
  text: string;
  icon: string;
  buttonBgColor: string;
  buttonTextColor: string;
  buttonHoverBgColor?: string;
  buttonText: string;
  buttonLink: string;
  buttonClassName?: string;
}
export default function SimpleFeaturesCard({
  title,
  text,
  icon,
  buttonBgColor,
  buttonTextColor,
  buttonHoverBgColor,
  buttonText,
  buttonLink,
  buttonClassName,
}: SimpleFeaturesCardProps) {
  const handleClick = () => {
    try {
      new URL(buttonLink);
      const newWindow = window.open(
        buttonLink,
        '_blank',
        'noopener,noreferrer'
      );
      if (newWindow) newWindow.opener = null;
    } catch {
      console.error('Not valid URL:', buttonLink);
    }
  };
  return (
    <div
      className='flex flex-col items-start 
        mx-2 my-2 p-8 gap-8 flex-1 self-stretch rounded-[48px] bg-[#F8F8F8]'
    >
      <Image src={icon} alt={title} width={80} height={80} />
      <div className='flex flex-col items-start gap-2'>
        <h2 className='text-lg font-bold'>{title}</h2>
        <p className='text-xs text-[#777] mb-2'>{text}</p>
        <button
          className={`
            ${buttonClassName}
            px-4 py-2 
            rounded-[12px] 
            transition-colors 
            duration-300 
            hover:opacity-90
            shadow-[inset_0px_2px_2px_0px_#FFF]
            ${buttonHoverBgColor ? `hover:bg-[${buttonHoverBgColor}]` : ''}
          `}
          style={{
            backgroundColor: buttonBgColor,
            color: buttonTextColor,
          }}
          onClick={handleClick}
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
}
