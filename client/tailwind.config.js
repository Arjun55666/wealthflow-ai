/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#6c63ff",
        "primary-dark": "#5a52d5",

        navy: "#0f172a",
        "navy-light": "#1e293b",
        "navy-lighter": "#334155",

        // ✅ extra useful shades (optional but powerful)
        success: "#16a34a",
        danger: "#dc2626",
        warning: "#f59e0b",
        info: "#3b82f6",
      },

      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },

      boxShadow: {
        soft: "0 4px 20px rgba(0,0,0,0.08)",
        card: "0 8px 30px rgba(0,0,0,0.06)",
      },

      borderRadius: {
        xl: "12px",
        "2xl": "16px",
      },
    },
  },

  plugins: [],
};