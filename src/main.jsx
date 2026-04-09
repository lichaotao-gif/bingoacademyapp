import { StrictMode, lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { AdminErrorBoundary } from './AdminErrorBoundary.jsx'

const AdminApp = lazy(() => import('../admin/src/AdminRoot.tsx'))

function Root() {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '')
  const isAdmin =
    typeof window !== 'undefined' &&
    window.location.pathname.startsWith(`${base}/admin`.replace(/\/+/g, '/'))
  if (isAdmin) {
    return (
      <AdminErrorBoundary>
        <Suspense fallback={<div style={{ padding: 48, textAlign: 'center', fontSize: 16 }}>加载中...</div>}>
          <AdminApp />
        </Suspense>
      </AdminErrorBoundary>
    )
  }
  const routerBasename = base || undefined
  return (
    <BrowserRouter basename={routerBasename}>
      <App />
    </BrowserRouter>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
