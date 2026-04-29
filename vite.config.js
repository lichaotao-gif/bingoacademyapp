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
      /** 固定 5288（更新端口时改此处即可） */
      port: 5288,
      /**
       * true：只用上面端口；被占用时直接报错退出，绝不静默改端口。
       * 若报错：lsof -i :5288 查看占用进程并结束后，再执行 npm run dev。
       */
      strictPort: true,
      proxy: { '/api': { target: 'http://localhost:8080', changeOrigin: true } },
    },
  }
})
