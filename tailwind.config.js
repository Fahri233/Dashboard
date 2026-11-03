/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        k3: {
          banner: '#354F52',
          accent: '#6B8E6B',
          panel: '#EAF0EC',
          bg: '#F7F9F5',
          dark: {
            banner: '#1e292d',
            panel: '#1f2937',
            bg: '#111827',
            card: '#1f2937'
          }
        },
        risk: {
          tinggi: '#DC2626',
          sedang: '#F59E0B',
          rendah: '#16A34A'
        }
      }
    },
  },
  plugins: [],
}

