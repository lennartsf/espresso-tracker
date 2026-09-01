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
          'surface-btm': 'var(--coffee-surface-btm)',
          surface2: 'var(--coffee-surface-2)',
          accent: 'var(--coffee-accent)',
          'accent-soft': 'var(--coffee-accent-soft)',
          // NUR textfreie Flaechen (Balken, Dial-Ringe). Nie auf Text.
          'accent-deco': 'var(--coffee-accent-deco)',
          'glow-top': 'var(--coffee-glow-top)',
          // Schrift auf Akzent-Flaechen — nicht mit `bg` verwechseln.
          'on-accent': 'var(--coffee-on-accent)',
          cream: 'var(--coffee-cream)',
          text: 'var(--coffee-text)',
          muted: 'var(--coffee-muted)',
          line: 'var(--coffee-line)',
          // Kante der Eingabefelder — kraeftiger als `line`.
          field: 'var(--coffee-field-border)',
        },
      },
      boxShadow: {
        // Embossed-Signatur + Glow-Button als Token — pro Theme in index.css.
        card: 'var(--coffee-card-shadow)',
        glow: 'var(--coffee-glow-shadow)',
        inset: 'var(--coffee-inset-shadow)',
        dial: 'var(--coffee-dial-shadow)',
        track: 'var(--coffee-track-shadow)',
        liquid: 'var(--coffee-liquid-glow)',
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
