import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
// CloudBase 静态托管子路径 `tcb hosting deploy ./dist /bingoacademy`：生产构建默认 base 为 /bingoacademy/
// （多数 CI 未把控制台环境变量注入到 vite，仅配 VITE_BASE 往往不生效）。若部署在根路径（如 Vercel），构建时设 VITE_BASE=/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const defaultBase = mode === 'development' ? '/' : '/bingoacademy/'
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
      port: 5176,
      /** true：始终使用 5176；被占用则直接报错，避免静默改端口导致看错地址 */
      strictPort: true,
      proxy: { '/api': { target: 'http://localhost:8080', changeOrigin: true } },
    },
  }
})
