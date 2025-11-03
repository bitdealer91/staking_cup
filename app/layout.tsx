import type { Metadata } from 'next';
import '@/styles/globals.css';
import { Inter, Bangers, Press_Start_2P } from 'next/font/google';
import Providers from '@/app/providers';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const bangers = Bangers({ weight: '400', subsets: ['latin'], variable: '--font-bangers' });
const press = Press_Start_2P({ weight: '400', subsets: ['latin'], variable: '--font-press' });

export const metadata: Metadata = {
  title: 'Somnia Staking Cup – Qualifiers',
  description: 'Stake, compete, win. Qualifiers leaderboard.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${bangers.variable} ${press.variable}`}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}


