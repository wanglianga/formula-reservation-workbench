/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,vue}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        cream: {
          50: '#FFFBF7',
          100: '#FFF6EC',
          200: '#FDEFD8',
        },
        pink: {
          soft: '#FDE8EC',
          200: '#F8CED6',
          300: '#F2A5B4',
          400: '#E87A90',
          500: '#DC5A74',
        },
        mint: {
          soft: '#C8EAD1',
          300: '#95D4A6',
          500: '#4CAF6B',
          600: '#3A8F54',
        },
        orange: {
          soft: '#FFD9B3',
          400: '#FFAA5C',
          500: '#F58A2C',
        },
        coral: {
          soft: '#F8A5A5',
          500: '#E86060',
        },
        brown: {
          500: '#4A3F3A',
          400: '#8B7D77',
          300: '#B5A8A1',
        },
      },
      borderRadius: {
        xl2: '14px',
        xl3: '18px',
      },
      boxShadow: {
        soft: '0 4px 16px -4px rgba(74, 63, 58, 0.08)',
        softer: '0 2px 10px -2px rgba(74, 63, 58, 0.06)',
        card: '0 6px 24px -6px rgba(74, 63, 58, 0.10)',
      },
      fontFamily: {
        sans: [
          '"Noto Sans SC"',
          '"PingFang SC"',
          '"Microsoft YaHei"',
          'system-ui',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
};
