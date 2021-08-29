/*
 * @Author: 柳惊鸿
 * @Date: 2021-08-29 15:23:45
 * @LastEditTime: 2021-08-29 16:35:02
 * @LastEditors: 柳惊鸿
 * @Description: 
 */
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  port:80,
  plugins: [vue()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})
