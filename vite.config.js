import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
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
    /** false：5176 被占用时自动尝试 5177、5178…（请以终端里打印的 Local 链接为准） */
    strictPort: false,
    proxy: { '/api': { target: 'http://localhost:8080', changeOrigin: true } },
  },
})
