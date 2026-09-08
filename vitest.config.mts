import { defineConfig } from 'vitest/config'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
  },
  resolve: {
    alias: [
      { find: '@', replacement: path.resolve(__dirname, './') },
      { find: /^react$/, replacement: path.resolve(__dirname, 'node_modules/react/index.js') },
      { find: /^react-dom$/, replacement: path.resolve(__dirname, 'node_modules/react-dom/index.js') },
    ],
  },
})
