/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './contexts/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#25D366', // WhatsApp green
          50: '#E6F9ED',
          100: '#CCF3DB',
          200: '#99E7B7',
          300: '#66DB93',
          400: '#33CF6F',
          500: '#25D366',
          600: '#1EA952',
          700: '#177F3E',
          800: '#10542A',
          900: '#082A15',
        },
        secondary: {
          DEFAULT: '#128C7E', // WhatsApp dark green
          50: '#E6F5F3',
          100: '#CCEBE7',
          200: '#99D7CF',
          300: '#66C3B7',
          400: '#33AF9F',
          500: '#128C7E',
          600: '#0E7065',
          700: '#0B544C',
          800: '#073833',
          900: '#041C19',
        },
        accent: {
          DEFAULT: '#34B7F1', // WhatsApp blue
          50: '#E6F5FC',
          100: '#CCEBF9',
          200: '#99D7F3',
          300: '#66C3ED',
          400: '#33AFE7',
          500: '#34B7F1',
          600: '#2A92C1',
          700: '#1F6D91',
          800: '#154861',
          900: '#0A2431',
        },
      },
    },
  },
  plugins: [],
}
