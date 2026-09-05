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
        card: '#FFFEFB',
        ink: '#1E3249',
        muted: '#718078',
        line: '#E8E7E0',
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
        sans: ['DM Sans', 'sans-serif'],
        display: ['Fraunces', 'serif'],
      },
      borderRadius: {
        lg: '18px',
        md: 'calc(18px - 2px)',
        sm: 'calc(18px - 4px)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config
