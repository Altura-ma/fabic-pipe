import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  safelist: [
    { pattern: /bg-(orange|amber|pink|green|yellow|sky|stone)-(50|100|200|300|400|500|600|700|800|900)/ },
    { pattern: /text-(orange|amber|pink|green|yellow|sky|stone)-(50|100|200|300|400|500|600|700|800|900)/ },
    { pattern: /border-(orange|amber|pink|green|yellow|sky|stone)-(50|100|200|300|400|500|600|700|800|900)/ },
    { pattern: /ring-(orange|amber|pink|green|yellow|sky|stone)-(50|100|200|300|400|500|600|700|800|900)/ },
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
export default config
