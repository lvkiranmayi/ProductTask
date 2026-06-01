/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: [
    
    "./App.tsx",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        mira: {
          primary:    '#7C5FFF',
          secondary:  '#A78BFA',
          accent:     '#F0A0D8',
          bg:         '#F6F3FF',
          surface:    '#EDE8FF',
          border:     '#D4CBFF',
          text:       '#1E1B4B',
          muted:      '#7C7CB0',
          dark:       '#1A1033',
          'dark-surface': '#2A1F50',
        },
      },
    },
  },
  plugins: [],
}