import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        hud: '#0f172acc',
      },
    },
  },
  plugins: [],
} satisfies Config;
