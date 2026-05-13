import { Typography } from 'antd'
import { useLocation } from 'react-router-dom'

const TITLES: Record<string, string> = {
  '/franchise/partner-portal-orders': '订单管理',
  '/franchise/partner-online-learning': '线上课与充课',
}

export default function FranchiseFutureModulePlaceholder() {
  const { pathname } = useLocation()
  const norm = pathname.includes('/franchise/') ? pathname.slice(pathname.indexOf('/franchise/')) : pathname
  const title = TITLES[norm] || '后续版本规划'

  return (
    <div>
      <Typography.Title level={4} style={{ marginTop: 0 }}>
        {title}
      </Typography.Title>
      <Typography.Paragraph type="secondary" style={{ maxWidth: 640 }}>
        本模块为演示占位：开发联调与评审时可据此识别「待实现能力」。正式环境将对接总部业务接口与权限体系。
      </Typography.Paragraph>
    </div>
  )
}
