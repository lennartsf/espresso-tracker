import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Dark-Premium-Tokens (via CSS-Vars in index.css). Namespaced unter
        // `coffee` → keine Kollision mit Tailwind-Defaults. Genutzt von Marketing/Auth
        // UND der gesamten App-Shell (Reskin live seit 2026-06-08).
        coffee: {
          bg: 'var(--coffee-bg)',
          surface: 'var(--coffee-surface)',
          surface2: 'var(--coffee-surface-2)',
          accent: 'var(--coffee-accent)',
          'accent-soft': 'var(--coffee-accent-soft)',
          cream: 'var(--coffee-cream)',
          text: 'var(--coffee-text)',
          muted: 'var(--coffee-muted)',
          line: 'var(--coffee-line)',
        },
      },
      fontFamily: {
        // font-display (Fraunces) + font-grotesk (Space Grotesk) — Marketing & App.
        display: ['"Fraunces Variable"', 'Fraunces', 'Georgia', 'serif'],
        grotesk: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config
