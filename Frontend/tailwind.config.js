/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      // ─── Colors ──────────────────────────────────────────────────────────
      colors: {
        // Primary civic blue scale
        primary: {
          50:  '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#1668B8',
          700: '#0B4F8A',
          800: '#1E3A5F',
          900: '#1E2D48',
          DEFAULT: '#0B4F8A',
        },
        // Semantic status colors
        status: {
          draft:            '#64748B',
          submitted:        '#1E40AF',
          'conflict-analysis': '#92400E',
          'dept-notified':  '#164E63',
          'under-review':   '#9A3412',
          approved:         '#065F46',
          rejected:         '#991B1B',
          scheduled:        '#3730A3',
          'in-progress':    '#1D4ED8',
          completed:        '#065F46',
        },
        // Department colors (matching DEPARTMENT_COLORS in constants.js)
        dept: {
          pwd:       '#1E40AF',
          water:     '#0891B2',
          electricity: '#D97706',
          telecom:   '#7C3AED',
          traffic:   '#EA580C',
          municipal: '#059669',
          gas:       '#BE123C',
        },
        // Risk level colors
        risk: {
          low:      '#059669',
          medium:   '#D97706',
          high:     '#EA580C',
          critical: '#DC2626',
        },
        // Sidebar specific
        sidebar: {
          bg:       '#0B1929',
          hover:    '#112240',
          active:   '#1668B8',
          text:     '#94A3B8',
          'text-active': '#FFFFFF',
          border:   '#1E3A5F',
        },
      },
      // ─── Typography ─────────────────────────────────────────────────────
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
      },
      // ─── Spacing / Sizing ────────────────────────────────────────────────
      spacing: {
        '18': '4.5rem',
        '72': '18rem',
        '84': '21rem',
        '96': '24rem',
        '128': '32rem',
      },
      // ─── Border Radius ───────────────────────────────────────────────────
      borderRadius: {
        '4xl': '2rem',
      },
      // ─── Box Shadows ─────────────────────────────────────────────────────
      boxShadow: {
        'card':   '0 1px 3px 0 rgb(0 0 0 / 0.08), 0 1px 2px -1px rgb(0 0 0 / 0.06)',
        'card-hover': '0 4px 12px 0 rgb(0 0 0 / 0.12), 0 2px 4px -1px rgb(0 0 0 / 0.08)',
        'sidebar': '2px 0 8px 0 rgb(0 0 0 / 0.15)',
        'topbar':  '0 1px 3px 0 rgb(0 0 0 / 0.08)',
        'modal':   '0 20px 60px -10px rgb(0 0 0 / 0.25)',
        'glow-blue': '0 0 0 3px rgb(22 104 184 / 0.25)',
      },
      // ─── Keyframes & Animations ──────────────────────────────────────────
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-in-right': {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'slide-in-left': {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'pulse-ring': {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.05)', opacity: '0.8' },
        },
        'count-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'spin-slow': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        'fade-in':        'fade-in 0.2s ease-out',
        'slide-in-right': 'slide-in-right 0.25s ease-out',
        'slide-in-left':  'slide-in-left 0.25s ease-out',
        'slide-up':       'slide-up 0.2s ease-out',
        'pulse-ring':     'pulse-ring 2s ease-in-out infinite',
        'count-up':       'count-up 0.3s ease-out',
        'shimmer':        'shimmer 1.5s infinite linear',
        'spin-slow':      'spin-slow 3s linear infinite',
      },
      // ─── Background Image ────────────────────────────────────────────────
      backgroundImage: {
        'gradient-civic': 'linear-gradient(135deg, #0B4F8A 0%, #1668B8 50%, #1E3A5F 100%)',
        'shimmer-gradient': 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)',
      },
      // ─── Z-Index ─────────────────────────────────────────────────────────
      zIndex: {
        'sidebar': '40',
        'topbar':  '30',
        'modal':   '50',
        'toast':   '60',
        'tooltip': '70',
      },
      // ─── Screen Breakpoints ──────────────────────────────────────────────
      screens: {
        'xs': '480px',
      },
    },
  },
  plugins: [],
};
