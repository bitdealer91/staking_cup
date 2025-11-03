"use client";
import { PropsWithChildren, useState } from 'react';
import { createConfig, http } from 'wagmi';
import { WagmiProvider } from 'wagmi';
import { mainnet } from 'viem/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

const config = createConfig({
  chains: [mainnet],
  transports: {
    [mainnet.id]: http()
  }
});

export default function Providers({ children }: PropsWithChildren) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
        <Toaster position="top-right" toastOptions={{
          style: { background: '#123d29', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }
        }} />
      </QueryClientProvider>
    </WagmiProvider>
  );
}


