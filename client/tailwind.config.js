/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,jsx}', './index.html'],
  theme: {
    extend: {
      colors: {
        bg: '#0a0a0f',
        surface: '#111118',
        surface2: '#1a1a24',
        surface3: '#22222f',
        accent: '#ff3d5a',
        'accent-hover': '#e0354f',
        'accent-dim': '#ff3d5a33',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        eq: {
          'from': { height: '4px' },
          'to': { height: '14px' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        fadeIn: {
          from: { opacity: 0, transform: 'translateY(8px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
      },
      animation: {
        marquee: 'marquee 10s linear infinite',
        eq: 'eq 0.8s ease-in-out infinite alternate',
        shimmer: 'shimmer 1.5s infinite',
        fadeIn: 'fadeIn 0.3s ease forwards',
      },
    }
  },
  plugins: [],
}
