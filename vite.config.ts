/// <reference types="vitest" />
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            return undefined
          }
          if (id.includes('react')) {
            return 'react'
          }
          if (id.includes('antd')) {
            return 'antd'
          }
          if (id.includes('@tanstack/react-query')) {
            return 'query'
          }
          return undefined
        }
      }
    }
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    }
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    exclude: ['node_modules/**', 'dist/**', 'coverage/**', 'e2e/**'],
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov']
    }
  }
})
