import Link from "next/link";
import { Button } from "./button";
import Typography from "./typography";
import Image from "next/image";
import { cn } from "@/lib/utils";

type AppProfileCardProps = {
  name: string;
  description: string;
  avatarUrl: string;
  coverUrl: string;
  appUrl: string;
  xUrl?: string;
  discordUrl?: string;
  telegramUrl?: string;
  deployed: boolean;
} & React.HTMLAttributes<HTMLDivElement>;

const AppProfileCard = ({
  name,
  description,
  avatarUrl,
  coverUrl,
  appUrl,
  xUrl,
  discordUrl,
  telegramUrl,
  deployed,
  className,
  ...props
}: AppProfileCardProps) => {
  return (
    <div
      className={cn(
        "relative flex flex-col gap-[var(--somnia-spacing-4xl)] overflow-hidden rounded-[var(--somnia-radius-4xl)] bg-somnia-color-background-primary-02 px-[var(--somnia-spacing-4xl)] pb-[var(--somnia-spacing-4xl)] pt-[var(--somnia-spacing-6xl)]",
        className
      )}
      {...props}
    >
      {!deployed && (
        <div className='absolute inset-0 bg-gray-700/60 z-20 flex items-center justify-center'>
          <div className='transform rotate-45 text-white font-bold text-2xl whitespace-nowrap'>
            Coming Soon! 😁
          </div>
        </div>
      )}
      <div className="absolute left-0 top-0 h-[124px] w-full overflow-hidden z-10">
        <Image src={coverUrl} alt={name} fill className="object-cover" />
      </div>
      {/* TODO old tailwindcss outline classes, needs to be updated with new ui lib, and color needs to be updated  */}
      <div className="relative z-10 h-20 w-20">
        <Image
          src={avatarUrl}
          alt={name}
          width={80}
          height={80}
          className="overflow-hidden rounded-[var(--somnia-radius-2xl)] bg-white outline outline-4 outline-offset-0 outline-[#F8F8F8]"
        />
      </div>
      <div className="flex flex-col gap-[var(--somnia-spacing-2xl)] z-10">
        <Typography variant="h4">{name}</Typography>
        <Typography variant="p3" color="primary-200">
          {description}
        </Typography>
      </div>
      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:gap-0 relative z-30">
        {appUrl === "#" ? (
          <Button variant="primary-200" disabled>
            Launch app
          </Button>
        ) : (
          <Button variant="primary-200" asChild>
            <Link href={appUrl} target="_blank" rel="noopener noreferrer">
              Launch app
            </Link>
          </Button>
        )}
        <div className="flex gap-[var(--somnia-spacing-lg)]">
          {xUrl && (
            <Button variant="primary-200" asChild className="w-full sm:w-fit">
              <Link href={xUrl} target="_blank" rel="noopener noreferrer">
                <img src="/icons/X.svg" alt="X" className="h-5 w-5" />
              </Link>
            </Button>
          )}
          {discordUrl && (
            <Button variant="primary-200" asChild className="w-full sm:w-fit">
              <Link href={discordUrl} target="_blank" rel="noopener noreferrer">
                <img
                  src="/icons/discord.svg"
                  alt="Discord"
                  className="h-5 w-5"
                />
              </Link>
            </Button>
          )}
          {telegramUrl && (
            <Button variant="primary-200" asChild className="w-full sm:w-fit">
              <Link
                href={telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src="/icons/telegram.svg"
                  alt="Telegram"
                  className="h-5 w-5"
                />
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppProfileCard;
