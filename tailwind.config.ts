import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        qblack: '#030712',
        qdark:  '#0a0f1e',
        qdark2: '#0d1526',
        qpanel: '#0e1628',
        qpanel2:'#131d35',
        qblue:  '#0ea5e9',
        qblue2: '#38bdf8',
        qblue3: '#7dd3fc',
        qbluedark: '#0369a1',
        qaccent:'#06b6d4',
        qgold:  '#f59e0b',
      },
      fontFamily: {
        sans: ['var(--font-noto)', 'sans-serif'],
        mono: ['var(--font-orbitron)', 'monospace'],
      },
      backgroundImage: {
        'grid-pattern': `linear-gradient(rgba(14,165,233,0.04) 1px, transparent 1px),
                         linear-gradient(90deg, rgba(14,165,233,0.04) 1px, transparent 1px)`,
      },
      backgroundSize: {
        'grid': '60px 60px',
      },
    },
  },
  plugins: [],
}
export default config
