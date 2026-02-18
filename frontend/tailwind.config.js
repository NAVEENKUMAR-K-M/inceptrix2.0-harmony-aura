/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0F1115",
        surface: "#15171C",
        surfaceHighlight: "#1E2025",
        border: "#2A2D35",
        primary: "#10B981", // Soft Green
        warning: "#F59E0B", // Amber
        critical: "#EF4444", // Red
        accent: "#6366F1", // Indigo/Neon
        textMain: "rgba(255, 255, 255, 0.9)",
        textSecondary: "rgba(255, 255, 255, 0.5)",
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        'card': '16px',
      },
      boxShadow: {
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'glow': '0 0 15px rgba(99, 102, 241, 0.3)',
      }
    },
  },
  plugins: [],
}
