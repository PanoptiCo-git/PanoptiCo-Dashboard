import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
// Fixed 2026-02-21: Use different base paths for development and production environments
export default defineConfig(({ command, mode }) => ({
  base: command === 'build' ? '/PanoptiCo-Dashboard/' : '/',
  plugins: [vue()],
  server: {
    port: 5173
  }
}))


