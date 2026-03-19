import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import 'dayjs/locale/zh-cn'
import App from './App'
import { themeConfig } from './config/theme'
import './index.css'

/** 管理后台根组件，供主站 main.jsx 按路径条件渲染 */
export default function AdminRoot() {
  return (
    <ConfigProvider locale={zhCN} theme={themeConfig}>
      <App />
    </ConfigProvider>
  )
}
