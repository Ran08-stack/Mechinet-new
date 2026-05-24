/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  // safelist — classes that originate from DB (pipeline_stages.color) and may not appear in source code.
  // ensures JIT generates them regardless.
  safelist: [
    "bg-gray-100", "text-gray-700",
    "bg-blue-100", "text-blue-700",
    "bg-yellow-100", "text-yellow-700",
    "bg-green-100", "text-green-700",
    "bg-red-100", "text-red-700",
    "bg-purple-100", "text-purple-700",
    "bg-orange-100", "text-orange-700",
    "bg-pink-100", "text-pink-700",
    "bg-teal-100", "text-teal-700",
    "bg-indigo-100", "text-indigo-700",
  ],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        surface: "var(--surface)",
        fg: "var(--fg)",
        "fg-muted": "var(--fg-muted)",
        "fg-subtle": "var(--fg-subtle)",
        line: "var(--line)",
        primary: "var(--primary)",
        accent: "var(--accent)",
        "accent-hover": "var(--accent-hover)",
        ai: "var(--ai)",
        "ai-bright": "var(--ai-bright)",
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
        mono: ["var(--font-mono)"],
      },
      borderRadius: {
        DEFAULT: "var(--radius)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
      },
    },
  },
  plugins: [],
}
