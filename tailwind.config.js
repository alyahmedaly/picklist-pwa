/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
    './stories/**/*.{ts,tsx}',
  ],
  prefix: '',
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      // Ali's nutrition-focused color system
      colors: {
        // Design system colors
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },

        // Nutrition-specific colors using CSS variables
        protein: {
          low: 'var(--protein-low)',
          moderate: 'var(--protein-moderate)',
          high: 'var(--protein-high)',
          DEFAULT: 'var(--protein-high)',
        },
        'protein-low': 'var(--protein-low)',
        'protein-moderate': 'var(--protein-moderate)',
        'protein-high': 'var(--protein-high)',
        calories: {
          low: 'var(--calories-low)',
          moderate: 'var(--calories-moderate)',
          high: 'var(--calories-high)',
          DEFAULT: 'var(--calories-moderate)',
        },
        health: {
          A: 'var(--health-A)',
          B: 'var(--health-B)',
          C: 'var(--health-C)',
          D: 'var(--health-D)',
          E: 'var(--health-E)',
          DEFAULT: 'var(--health-A)',
        },
        'health-A': 'var(--health-A)',
        'health-B': 'var(--health-B)',
        'health-C': 'var(--health-C)',
        'health-D': 'var(--health-D)',
        'health-E': 'var(--health-E)',
        halal: {
          confirmed: 'var(--halal-confirmed)',
          questionable: 'var(--halal-questionable)',
          prohibited: 'var(--halal-prohibited)',
          DEFAULT: 'var(--halal-confirmed)',
        },
        'halal-confirmed': 'var(--halal-confirmed)',
        'halal-questionable': 'var(--halal-questionable)',
        'halal-prohibited': 'var(--halal-prohibited)',
      },

      // Extended spacing for nutrition data density
      spacing: {
        xs: '0.25rem',    // 4px
        sm: '0.5rem',     // 8px
        md: '1rem',       // 16px
        lg: '1.5rem',     // 24px
        xl: '2rem',       // 32px
        '2xl': '3rem',    // 48px
      },

      // Typography system
      fontSize: {
        xs: '0.75rem',    // 12px
        sm: '0.875rem',   // 14px
        md: '1rem',       // 16px
        lg: '1.125rem',   // 18px
        xl: '1.25rem',    // 20px
        '2xl': '1.5rem',  // 24px
      },
      fontWeight: {
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
      },
      lineHeight: {
        tight: 1.25,
        normal: 1.5,
        relaxed: 1.75,
      },

      // Border radius
      borderRadius: {
        lg: '0.75rem',    // 12px
        md: '0.5rem',     // 8px
        sm: '0.25rem',    // 4px
        none: '0px',
        full: '9999px',
      },

      // Box shadows
      boxShadow: {
        sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        none: '0 0 #0000',
      },

      // Animation keyframes for nutrition components
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'protein-fill': {
          from: { strokeDashoffset: '176' },
          to: { strokeDashoffset: '0' },
        },
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'protein-fill': 'protein-fill 1s ease-out',
        'fade-in': 'fade-in 0.3s ease-out',
      },
    },
  },
  plugins: [
    // Add custom plugin for nutrition utilities
    function({ addUtilities, theme }) {
      const newUtilities = {
        // Nutrition density utilities
        '.nutrition-compact': {
          lineHeight: theme('lineHeight.tight'),
          fontSize: theme('fontSize.sm'),
        },
        '.nutrition-scannable': {
          display: 'flex',
          alignItems: 'center',
          gap: theme('spacing.sm'),
        },
        // Mobile-first touch targets
        '.touch-target': {
          minHeight: '44px',
          minWidth: '44px',
        },
        // Quick nutrition color utilities
        '.text-protein-level': {
          '&[data-level="low"]': { color: theme('colors.protein.low') },
          '&[data-level="moderate"]': { color: theme('colors.protein.moderate') },
          '&[data-level="high"]': { color: theme('colors.protein.high') },
        },
        '.bg-health-grade': {
          '&[data-grade="A"]': { backgroundColor: theme('colors.health.A') },
          '&[data-grade="B"]': { backgroundColor: theme('colors.health.B') },
          '&[data-grade="C"]': { backgroundColor: theme('colors.health.C') },
          '&[data-grade="D"]': { backgroundColor: theme('colors.health.D') },
          '&[data-grade="E"]': { backgroundColor: theme('colors.health.E') },
        },
      };
      addUtilities(newUtilities);
    },
  ],
};