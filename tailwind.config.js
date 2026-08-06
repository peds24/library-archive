/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Material 3 / OLED-black theme — see inspo/mockups/ui-direction-material-crisp.html
        accent: {
          DEFAULT: '#9ecaff',
          on: '#003258', // text/icons placed directly on solid accent fills
          container: '#003a63',
          'on-container': '#d1e4ff', // text/icons on accent.container
        },
        surface: {
          DEFAULT: '#0a0a0a',
          2: '#141414',
        },
        ink: {
          DEFAULT: '#ffffff',
          muted: '#c9c0b7',
          faint: '#8f857a',
        },
        border: '#2a2a2a',
        status: {
          reading: { bg: 'rgba(59,130,246,0.22)', fg: '#9dc0ff' },
          tbr: { bg: 'rgba(217,119,6,0.24)', fg: '#ffc069' },
          read: { bg: 'rgba(34,197,94,0.22)', fg: '#7fe6a0' },
          shelved: { bg: 'rgba(255,255,255,0.09)', fg: '#d6cec5' },
        },
      },
    },
  },
  plugins: [],
};
