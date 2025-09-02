// Tailwind v3 config with dark mode class extended from shadcn/ui's default config
/** @type {import('tailwindcss').Config} */
const defaultConfig = require("shadcn/ui/tailwind.config")

module.exports = {
  ...defaultConfig,
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}", "*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    ...defaultConfig.theme,
    extend: {
      ...defaultConfig.theme.extend,
      colors: {
        ...defaultConfig.theme.extend.colors,
        brand: {
          DEFAULT: "#0ea5a4", // teal-500-ish
          dark: "#0f766e", // teal-700
        },
      },
      boxShadow: {
        card: "0 8px 30px rgba(0,0,0,0.2)",
      },
      borderRadius: {
        ...defaultConfig.theme.extend.borderRadius,
        "2xl": "1rem",
      },
    },
  },
  plugins: [...defaultConfig.plugins, require("tailwindcss-animate")],
}
