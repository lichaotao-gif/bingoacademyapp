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
      /** Vite 常用默认端口；被占用时会自动顺延，终端会打印实际 Local 地址 */
      port: 5173,
      strictPort: false,
      /** 固定 IPv4，避免部分环境下 localhost 解析异常导致「打不开」 */
      host: '127.0.0.1',
      proxy: { '/api': { target: 'http://localhost:8080', changeOrigin: true } },
    },
    preview: {
      host: '127.0.0.1',
      port: 4173,
      strictPort: false,
    },
  }
})
