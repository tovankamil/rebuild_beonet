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
        bionet: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669', // Primary Herbal Green
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
          950: '#022c22',
        },
        cyan: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          500: '#06b6d4',
          600: '#0891b2',
        },
        dashlite: {
          sidebar: '#071e17',       // Deep Forest Dark (Apps Sidebar)
          sidebarHover: '#0d3227',  // Sidebar Hover
          sidebarActive: '#124435', // Sidebar Active
          bg: '#f5f6fa',            // Signature DashLite Light Gray Canvas
          card: '#ffffff',          // Card Surface
          border: '#e5e9f2',        // Delicate Border Line
          borderSubtle: '#edf2f9',  // Subtle Inner Line
          text: '#364a63',          // Primary Body Text
          soft: '#8094ae',          // Muted / Subtitle Text
          heading: '#1e293b',       // Bold Heading
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        heading: ['Outfit', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'Courier New', 'monospace'],
      },
      boxShadow: {
        'dashlite': '0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02)',
        'dashlite-md': '0 4px 16px rgba(0, 0, 0, 0.06)',
        'dashlite-lg': '0 10px 30px rgba(0, 0, 0, 0.08)',
        'emerald-glow': '0 4px 20px rgba(5, 150, 105, 0.25)',
      },
      borderRadius: {
        'dash': '8px',
        'dash-lg': '12px',
        'dash-xl': '16px',
      },
    },
  },
  plugins: [],
};
