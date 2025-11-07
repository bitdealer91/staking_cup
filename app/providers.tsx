"use client";
import { PropsWithChildren, useState } from 'react';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConnectKitProvider } from 'connectkit';
import { customChainConfig } from '@/lib/blockchainUtils';
import { Toaster as RadixToaster } from '@/components/ui/toaster';

// Minimal wagmi config for reads (no connectors) — safe for SSR
const wagmiConfig = createConfig({
  chains: [customChainConfig],
  transports: {
    [customChainConfig.id]: http(`${process.env.NEXT_PUBLIC_NEW_CHAIN_RPC_URL}`),
  },
  connectors: [injected()],
  ssr: true,
  batch: { multicall: false },
});

export default function Providers({ children }: PropsWithChildren) {
  const [queryClient] = useState(() => new QueryClient());
  const [mounted] = useState(true);
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider>
          {children}
          <RadixToaster />
        </ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
