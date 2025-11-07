import Image from 'next/image';

interface SocialLinkButtonProps {
  href: string;
  icon: string;
  label: string;
  type:
    | 'x'
    | 'discord'
    | 'reddit'
    | 'telegram'
    | 'linkedin'
    | 'link3'
    | 'galxe';
}

const socialColors = {
  x: 'bg-black',
  discord: 'bg-[#5865F2]',
  reddit: 'bg-[#FF4500]',
  telegram: 'bg-[#25A2E0]',
  linkedin: 'bg-[#007BB5]',
  link3: 'bg-black',
  galxe: 'bg-[#0057FF]',
} as const;

export default function SocialLinkButton({
  href,
  icon,
  label,
  type,
}: SocialLinkButtonProps) {
  return (
    <a
      href={href}
      className='flex h-14 items-center justify-center 
        gap-3 rounded-2xl bg-[#F1F1F1] px-3 pl-2'
    >
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-lg ${socialColors[type]} text-white`}
      >
        <div className='h-10 w-10'>
          <Image src={icon} alt={label} width={40} height={40} />
        </div>
      </div>
      <span>{label}</span>
    </a>
  );
}
