/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        // Échelle typo alignée sur les tokens CSS (src/styles/tokens.css).
        // Les classes Tailwind par défaut (text-xs, text-sm…) restent pour
        // la compat, mais préférer les classes sémantiques `.heading-*` et
        // `.text-caption` dans @layer components.
        caption: ['11px', { lineHeight: '1.4', letterSpacing: '0.06em' }],
      },
      colors: {
        // === Tokens sémantiques (référencent les CSS variables) ===
        // Usage Tailwind : bg-primary, text-primary-soft, border-border, etc.
        primary: {
          DEFAULT: 'var(--color-primary)',
          hover: 'var(--color-primary-hover)',
          active: 'var(--color-primary-active)',
          soft: 'var(--color-primary-soft)',
          'soft-text': 'var(--color-primary-soft-text)',
        },
        success: {
          DEFAULT: 'var(--color-success)',
          hover: 'var(--color-success-hover)',
          soft: 'var(--color-success-soft)',
          'soft-text': 'var(--color-success-soft-text)',
        },
        warning: {
          DEFAULT: 'var(--color-warning)',
          hover: 'var(--color-warning-hover)',
          soft: 'var(--color-warning-soft)',
          'soft-text': 'var(--color-warning-soft-text)',
        },
        danger: {
          DEFAULT: 'var(--color-danger)',
          hover: 'var(--color-danger-hover)',
          soft: 'var(--color-danger-soft)',
          'soft-text': 'var(--color-danger-soft-text)',
        },
        info: {
          DEFAULT: 'var(--color-info)',
          soft: 'var(--color-info-soft)',
          'soft-text': 'var(--color-info-soft-text)',
        },
        surface: {
          DEFAULT: 'var(--color-surface)',
          2: 'var(--color-surface-2)',
          muted: 'var(--color-surface-muted)',
        },
        border: {
          DEFAULT: 'var(--color-border)',
          strong: 'var(--color-border-strong)',
          subtle: 'var(--color-border-subtle)',
        },
        // === Legacy (conservé pour compat — ne pas utiliser sur du neuf) ===
        dark: {
          900: '#0a0a0f',
          800: '#131318',
          700: '#1c1c24',
          600: '#26262f',
          500: '#31313a',
        },
        accent: {
          blue: '#3b82f6',
          purple: '#8b5cf6',
          green: '#10b981',
          yellow: '#f59e0b',
          red: '#ef4444',
          pink: '#ec4899',
        },
        stage: {
          prospect: '#6366f1',
          qualified: '#3b82f6',
          proposal: '#8b5cf6',
          negotiation: '#f59e0b',
          won: '#10b981',
          lost: '#ef4444',
        },
      },
      borderRadius: {
        // Aligné sur --radius-*
        xs: '4px',
        sm: '6px',
        DEFAULT: '10px',
        md: '10px',
        lg: '14px',
        xl: '20px',
      },
      boxShadow: {
        // Aligné sur --shadow-*
        xs: 'var(--shadow-xs)',
        sm: 'var(--shadow-sm)',
        DEFAULT: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        xl: 'var(--shadow-xl)',
        focus: 'var(--shadow-focus)',
      },
      animation: {
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'fade-in': 'fadeIn 0.2s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'shimmer': 'shimmer 2s infinite',
      },
      keyframes: {
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};
