import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './context/**/*.{js,ts,jsx,tsx,mdx}',
    './hooks/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        sidebar: {
          DEFAULT: '#ECE9DF',
          border: '#D8D3C5',
        },
        paper: '#FAF9F5',
        card: {
          DEFAULT: '#FFFFFF',
          foreground: 'var(--card-foreground, #1E3249)',
        },
        ink: '#1E3249',
        muted: {
          DEFAULT: '#718078',
          foreground: 'var(--muted-foreground, #718078)',
        },
        line: '#DFDCD2',
        mint: '#BEE6CF',
        slate: '#89938A',
        background: 'var(--background, #FAF9F5)',
        foreground: 'var(--foreground, #1E3249)',
        border: 'var(--border, #DFDCD2)',
        input: 'var(--input, #DFDCD2)',
        ring: 'var(--ring, #3E8F68)',
        primary: {
          DEFAULT: 'var(--primary, #1E3249)',
          foreground: 'var(--primary-foreground, #ffffff)',
        },
        secondary: {
          DEFAULT: 'var(--secondary, #E6F0EA)',
          foreground: 'var(--secondary-foreground, #3E8F68)',
        },
        destructive: {
          DEFAULT: 'var(--destructive, #D98362)',
          foreground: 'var(--destructive-foreground, #ffffff)',
        },
        accent: {
          DEFAULT: 'var(--accent, #E9EEFB)',
          foreground: 'var(--accent-foreground, #315DCB)',
        },
        popover: {
          DEFAULT: 'var(--popover, #FFFEFB)',
          foreground: 'var(--popover-foreground, #1E3249)',
        },
        green: {
          DEFAULT: '#3E8F68',
          soft: '#E6F0EA',
        },
        blue: {
          DEFAULT: '#315DCB',
          soft: '#E9EEFB',
        },
        coral: {
          DEFAULT: '#D98362',
          soft: '#F8EBE5',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'DM Sans', 'sans-serif'],
        display: ['var(--font-display)', 'Fraunces', 'serif'],
        numeric: ['var(--font-numeric)', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['var(--font-mono)', 'JetBrains Mono', 'DM Mono', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        none: '0px',
        sm: '12px',
        md: '14px',
        lg: '18px',
        xl: '20px',
        '2xl': '24px',
        '3xl': '32px',
        full: '9999px',
      },
      boxShadow: {
        '2xs': '0 1px 3px rgba(30, 50, 73, 0.05), 0 2px 8px rgba(30, 50, 73, 0.03)',
        'xs': '0 1px 3px rgba(30, 50, 73, 0.05), 0 3px 10px rgba(30, 50, 73, 0.035)',
        'card': '0 1px 3px rgba(30, 50, 73, 0.05), 0 4px 14px rgba(30, 50, 73, 0.04)',
        'card-hover': '0 4px 20px rgba(30, 50, 73, 0.08)',
        'panel': '0 1px 3px rgba(30, 50, 73, 0.04), 0 6px 24px rgba(30, 50, 73, 0.04)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config
