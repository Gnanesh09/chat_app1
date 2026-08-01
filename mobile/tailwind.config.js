/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
   theme: {
  extend: {
    colors: {
      primary: {
        DEFAULT: "#F59E0B", // Glowing Amber (pure orange-gold)
        light: "#FBBF24",
        dark: "#D97706",
        soft: "#FEF3C7",
      },
      surface: {
        DEFAULT: "#171717", // Pure neutral dark
        light: "#333333",
        dark: "#0A0A0A",
        card: "#222222",    // Neutral card
      },
      foreground: "#F5F5F5",
      "muted-foreground": "#A3A3A3",
      "subtle-foreground": "#666666",
    },
    fontFamily: {
        // This overrides the default font. 
        // Now anywhere you just type text, it will use Poppins-Regular!
        sans: ["Poppins-Regular", "sans-serif"],
        medium: ["Poppins-Medium", "sans-serif"],
        semibold: ["Poppins-SemiBold", "sans-serif"],
        bold: ["Poppins-Bold", "sans-serif"],
      },
  },
},
  plugins: [],
}