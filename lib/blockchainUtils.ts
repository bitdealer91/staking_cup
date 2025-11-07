import { Address, generatePrivateKey, privateKeyToAccount } from 'viem/accounts'
import { getAddress } from 'viem/utils'
import { Chain } from 'viem'
import { defineChain } from 'viem'

export function generateRandomEthAddress(): Address {
  const privateKey = generatePrivateKey()
  const account = privateKeyToAccount(privateKey)
  
  return getAddress(account.address)
}

const FALLBACK_ID = 50311;
const FALLBACK_NAME = 'Somnia Devnet';
const FALLBACK_CURRENCY_NAME = 'Somnia Test Token';
const FALLBACK_CURRENCY_SYMBOL = 'SOMI';
const FALLBACK_RPC = 'https://dream-rpc.somnia.network';
const FALLBACK_EXPLORER = 'https://explorer.somnia.network';

export const customChainConfig: Chain = {
  id: Number(process.env.NEXT_PUBLIC_NEW_CHAIN_ID) || FALLBACK_ID,
  name: process.env.NEXT_PUBLIC_NEW_CHAIN_NAME || FALLBACK_NAME,
  nativeCurrency: {
    name: process.env.NEXT_PUBLIC_NEW_CHAIN_NATIVE_CURRENCY || FALLBACK_CURRENCY_NAME,
    symbol: process.env.NEXT_PUBLIC_NEW_CHAIN_NATIVE_CURRENCY_SYMBOL || FALLBACK_CURRENCY_SYMBOL,
    decimals: 18,
  },
  rpcUrls: {
    default: { http: [process.env.NEXT_PUBLIC_NEW_CHAIN_RPC_URL || FALLBACK_RPC] },
    public: { http: [process.env.NEXT_PUBLIC_NEW_CHAIN_RPC_URL || FALLBACK_RPC] },
  },
  blockExplorers: {
    default: { 
      name: 'Shannon explorer', 
      url: process.env.NEXT_PUBLIC_NEW_CHAIN_BLOCK_EXPLORER_URL || FALLBACK_EXPLORER,
    },
  },
  testnet: true,
  fees: {
    defaultPriorityFee: 1_000_000_000n,
  },
};


