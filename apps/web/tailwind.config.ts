import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Run Digital placeholder palette — tighten in Phase 2 once
        // we have actual brand tokens from The Run Digital design.
        brand: {
          DEFAULT: '#0F172A', // slate-900-ish
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
        },
        accent: {
          DEFAULT: '#2563EB', // blue-600
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
        },
        // Approval queue badge colors
        status: {
          pending: '#F59E0B',
          approved: '#10B981',
          rejected: '#EF4444',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
