"use client";

import Typography from "./typography";

type SectionTitleProps = {
  size?: "Desktop" | "Mobile";
  title: string;
  seeMoreText?: string;
  seeMoreOnClick?: () => void;
  prevOnClick?: () => void;
  nextOnClick?: () => void;
};

export const SectionTitle = ({
  title,
  size = "Desktop",
  seeMoreText,
  seeMoreOnClick,
  prevOnClick,
  nextOnClick,
}: SectionTitleProps) => {
  const SeeMore = () => {
    return (
      <Typography
        onClick={seeMoreOnClick}
        variant="p2"
        className="cursor-pointer text-somnia-color-text-primary-02 hover:underline"
      >
        {seeMoreText}
      </Typography>
    );
  };

  // TODO implement this
  const ActionButtons = () => {
    return <></>;
  };

  return (
    <div className="flex h-[40px] w-full items-center justify-between py-2">
      <Typography variant={size === "Desktop" ? "h2" : "h3"}>
        {title}
      </Typography>
      {seeMoreText && <SeeMore />}
      {(prevOnClick || nextOnClick) && <ActionButtons />}
    </div>
  );
};
