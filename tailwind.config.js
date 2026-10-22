/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: {
          950: '#0E0E10',
          900: '#141416',
          850: '#18181B',
          800: '#27272A',
          700: '#3F3F46',
        },
        gold: {
          light: '#F5DE88',
          DEFAULT: '#D4AF37',
          dark: '#C9A84C',
          hover: '#B89328',
          deep: '#8A701E',
          muted: '#524312',
        },
        amber: {
          400: '#DCBE56',
          500: '#D4AF37',
          600: '#C9A84C',
          700: '#B89328',
        },
        orange: {
          500: '#D4AF37',
          600: '#C9A84C',
        },
        architect: {
          pure: '#FFFFFF',
          soft: '#F4F4F5',
          zinc: '#E4E4E7',
          border: '#D4D4D8',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      }
    },
  },
  plugins: [],
}
