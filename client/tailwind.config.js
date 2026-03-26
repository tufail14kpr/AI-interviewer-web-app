import { heroui } from '@heroui/theme'

export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    './node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}',
    '../node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}'
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Space Grotesk', 'Segoe UI Variable', 'sans-serif'],
        serif: ['IBM Plex Serif', 'Georgia', 'serif']
      },
      colors: {
        ink: '#1c2230',
        sand: '#f7f0e3',
        shell: '#fff7ec',
        coral: '#c4654f',
        gold: '#b27c2a',
        olive: '#5f6b53'
      },
      boxShadow: {
        glow: '0 28px 60px rgba(28, 34, 48, 0.12)'
      }
    }
  },
  plugins: [
    heroui({
      defaultTheme: 'light'
    })
  ]
}
