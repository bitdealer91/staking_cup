"use client";

import React from "react";

type ConnectWalletButtonProps = {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
};

export default function ConnectWalletButton({ label, onClick, disabled, className }: ConnectWalletButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex h-[45px] items-center justify-center gap-2 rounded-[38px] bg-[#7700ff] px-[22px] py-[15px] text-[14px] text-white shadow-[0px_6px_10.6px_rgba(0,0,0,0.27)] transition disabled:cursor-not-allowed disabled:opacity-70 hover:brightness-105 hover:shadow-[0px_8px_16px_rgba(0,0,0,0.35)] active:translate-y-[1px] active:shadow-[0px_3px_8px_rgba(0,0,0,0.35)] ${className ?? ""}`}
      aria-busy={disabled || undefined}
    >
      <span className="inline-flex h-[14px] w-[14px] items-center justify-center">
        {/* Wallet icon (material-style) */}
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          className="block h-[14px] w-[14px]"
        >
          <path
            d="M21 7H5a2 2 0 0 1 0-4h12a1 1 0 1 1 0 2H5a0 0 0 0 0 0 0v14a0 0 0 0 0 0 0h16V7Zm0 2v8H7V9h14Zm-4.5 4.75a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5Z"
            fill="currentColor"
          />
        </svg>
      </span>
      <span className="capitalize leading-none">{label}</span>
    </button>
  );
}


