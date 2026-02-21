import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: mode === 'production' ? '/PanoptiCo-Dashboard/' : '/',
  plugins: [vue()],
  server: {
    port: 5173
  }
}))
