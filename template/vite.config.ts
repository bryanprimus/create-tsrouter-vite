import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import { resolve } from 'node:path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    // Please make sure that '@tanstack/router-plugin' is passed before '@vitejs/plugin-react'
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
    }),
    react(),
    // ...,
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
})
