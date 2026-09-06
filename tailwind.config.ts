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
        paper: '#F7F6F0',
        card: {
          DEFAULT: '#FFFEFB',
          foreground: 'var(--card-foreground, #1E3249)',
        },
        ink: '#1E3249',
        muted: {
          DEFAULT: '#718078',
          foreground: 'var(--muted-foreground, #718078)',
        },
        line: '#E8E7E0',
        mint: '#BEE6CF',
        slate: '#89938A',
        background: 'var(--background, #F7F6F0)',
        foreground: 'var(--foreground, #1E3249)',
        border: 'var(--border, #E8E7E0)',
        input: 'var(--input, #E8E7E0)',
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
        mono: ['var(--font-mono)', 'DM Mono', 'ui-monospace', 'monospace'],
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
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config
