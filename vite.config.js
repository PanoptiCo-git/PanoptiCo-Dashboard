import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/PanoptiCo-Dashboard.github.io',
  plugins: [vue()],
  server: {
    port: 5173
  }
})
