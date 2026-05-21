import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'
import process from 'node:process'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
// CloudBase 静态托管子路径 `tcb hosting deploy ./dist /bingoacademy` 时，构建时设 VITE_BASE=/bingoacademy/
// Vercel 等根路径部署默认使用 /，避免生产资源从 /bingoacademy/assets 加载导致白屏。
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const defaultBase = '/'
  const base = env.VITE_BASE || defaultBase

  return {
    base,
    plugins: [react()],
    resolve: {
      alias: { '@': path.resolve(__dirname, 'admin/src') },
      dedupe: ['react', 'react-dom', 'react-router', 'react-router-dom'],
    },
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom', 'antd', '@ant-design/icons'],
    },
    server: {
      /** 固定开发地址：http://127.0.0.1:5173/（端口被占用时会报错，不会悄悄换成 5174） */
      port: 5173,
      strictPort: true,
      host: '127.0.0.1',
      proxy: { '/api': { target: 'http://localhost:8080', changeOrigin: true } },
    },
    preview: {
      /** 固定预览地址：http://127.0.0.1:4173/ */
      host: '127.0.0.1',
      port: 4173,
      strictPort: true,
    },
  }
})
