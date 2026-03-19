import type { ThemeConfig } from 'antd'

/** 缤果AI学院品牌色 */
export const themeConfig: ThemeConfig = {
  token: {
    colorPrimary: '#0891b2',   // cyan-600 主色
    colorSuccess: '#10b981',
    colorWarning: '#f59e0b',
    colorError: '#ef4444',
    borderRadius: 6,
  },
  components: {
    Layout: {
      siderBg: '#0f172a',
      triggerBg: '#1e293b',
    },
  },
}
