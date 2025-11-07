"use client";

import { useEffect, useState } from "react";
import { ConnectKitButton } from "connectkit";
import { DelegationsModal } from "@/components/staking/DelegationsModal";
import ConnectWalletButton from "@/components/ui/ConnectWalletButton";

export default function SiteHeader() {
  const [showDelegations, setShowDelegations] = useState(false);

  

  return (
    <header className="w-full flex items-center justify-center">
      <div className="w-[1440px] px-6 py-6 flex items-center justify-end">
        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowDelegations(true)}
            className="inline-flex h-[45px] w-[176px] items-center justify-center gap-2 rounded-[38px] bg-[#7700ff] px-[22px] py-[15px] text-[14px] text-white shadow-[0px_6px_10.6px_rgba(0,0,0,0.27)] transition hover:brightness-105 hover:shadow-[0px_8px_16px_rgba(0,0,0,0.35)] active:translate-y-[1px] active:shadow-[0px_3px_8px_rgba(0,0,0,0.35)]"
          >
            <span className="capitalize leading-none">My Delegations</span>
          </button>
          <ConnectKitButton.Custom>
            {({ isConnected, isConnecting, show, address, truncatedAddress }) => (
              <ConnectWalletButton
                label={isConnected && truncatedAddress ? truncatedAddress : isConnecting ? "Connecting…" : "Connect Wallet"}
                onClick={show ?? (() => {})}
                disabled={isConnecting}
                className="w-[176px]"
              />
            )}
          </ConnectKitButton.Custom>
        </div>
      </div>

      <DelegationsModal isOpen={showDelegations} onOpenChange={setShowDelegations} />
    </header>
  );
}


