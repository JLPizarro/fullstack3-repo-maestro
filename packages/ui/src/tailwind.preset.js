/** @type {import('tailwindcss').Config} */
export default {
  theme: {
    extend: {
      fontFamily: {
        display: ['"Cormorant Garamond"', 'serif'],
        body: ['"Outfit"', 'sans-serif'],
        mono: ['"DM Mono"', 'monospace'],
      },
      colors: {
        accent: {
          DEFAULT: 'var(--accent)',
          hover: 'var(--accent-h)',
          soft: 'var(--accent-soft)',
          bd: 'var(--accent-bd)',
        },
        module: {
          DEFAULT: 'var(--moduleAccent)',
          soft: 'var(--moduleAccent-soft)',
          bd: 'var(--moduleAccent-bd)',
        },
      },
      borderRadius: {
        ui: 'var(--radius)',
        'ui-sm': 'var(--radius-sm)',
        'ui-xs': 'var(--radius-xs)',
      },
      boxShadow: {
        ui: 'var(--shadow)',
        'ui-lg': 'var(--shadow-lg)',
      },
    },
  },
}

