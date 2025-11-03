import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './lib/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        pitch: '#0a3a22',
        // Card/container + UI tokens extracted from Figma frame 75:133
        leaderboardContainer: '#0b7000', // outer container fill
        cardBg: '#0b7000', // alias
        leaderboardHeaderCell: '#ecfeea',
        leaderboardRow: '#eaffe7',
        rowStripe: '#eaffe7',
        rowStripeAlt: '#dbfcd7',
        divider: 'rgba(255,255,255,0.66)',
        leaderboardTitle: '#74ff63',
        // CTA buttons (greens from Figma)
        ctaGreenLight: '#4fc841',
        ctaGreenDark: '#258f19',
        ctaNeon: '#d9ff00',
        // Metric pill backgrounds
        pillBurn: '#00aeff',
        pillApr: '#7741ff',
        pillYield: '#e700ef',
        pillBlue: '#00aeff',
        pillPurple: '#7741ff',
        pillPink: '#e700ef',
        // Actions
        actionPrimary: '#004cd0',
        btnBlue: '#004cd0',
        arrowActive: '#343434',
        arrowInactive: 'rgba(52,52,52,0.45)',
        // Accents used for avatar dots (8-color palette)
        accent1: '#ff6bb5',
        accent2: '#4bc0ff',
        accent3: '#9b7bff',
        accent4: '#34d399',
        accent5: '#f87171',
        accent6: '#f59e0b',
        accent7: '#22d3ee',
        accent8: '#a3e635'
      },
      borderRadius: {
        // Card/container radius from Figma
        leaderboard: '39px',
        // Pills/buttons
        leaderboardPill: '16px',
        leaderboardSmall: '8px',
        leaderboardTiny: '6px'
      },
      boxShadow: {
        // Outer card shadow
        leaderboard: '0px 21px 31.8px rgba(0,0,0,0.18)',
        cardShadow: '0px 21px 31.8px rgba(0,0,0,0.18)',
        // Small raised controls (pills/buttons)
        leaderboardSm: '0px 4px 0px rgba(0,0,0,0.14)'
      },
      fontFamily: {
        inter: ['var(--font-inter)'],
        bangers: ['var(--font-bangers)'],
        pixel: ['var(--font-press)'],
        led: ['"The Led Display St"', 'sans-serif'],
        soccer: ['"Soccer League"', 'sans-serif'],
        polysans: ['"PolySans"', 'Inter', 'sans-serif']
      },
      fontSize: {
        // Title size from Figma (41px)
        leaderboardTitle: ['41px', { lineHeight: '1.2' }],
        // Metric pill value (32px)
        leaderboardMetric: ['32px', { lineHeight: '1' }],
        // Table cells / headers (16px)
        leaderboardCell: ['16px', { lineHeight: '1' }]
      },
      letterSpacing: {
        leaderboardTitle: '5.33px',
        leaderboardMetric: '-0.32px'
      }
    }
  },
  plugins: []
};

export default config;

