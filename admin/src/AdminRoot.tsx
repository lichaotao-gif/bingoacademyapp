import { ConfigProvider, unstableSetRender } from 'antd'
import { createRoot, type Root } from 'react-dom/client'
import zhCN from 'antd/locale/zh_CN'
import 'dayjs/locale/zh-cn'
import App from './App'
import { themeConfig } from './config/theme'
import './index.css'

// antd v5 静态方法（message / Modal.success 等）在 React 19 下需显式接管渲染，否则不出现
unstableSetRender((node, container) => {
  const host = container as Element & { _reactRoot?: Root }
  host._reactRoot ||= createRoot(host)
  const root = host._reactRoot
  root.render(node)
  return async () => {
    await new Promise((resolve) => setTimeout(resolve, 0))
    root.unmount()
  }
})

/** 管理后台根组件，供主站 main.jsx 按路径条件渲染 */
export default function AdminRoot() {
  return (
    <ConfigProvider locale={zhCN} theme={themeConfig}>
      <App />
    </ConfigProvider>
  )
}
