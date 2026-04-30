import { useMemo, useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Layout, Menu, Dropdown, Avatar, Typography } from 'antd'
import type { MenuProps } from 'antd'
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  LogoutOutlined,
} from '@ant-design/icons'
import { routes } from '@/config/routes'

const { Header, Sider, Content } = Layout

function readAdminDisplayName(): string {
  try {
    const raw = localStorage.getItem('bingo_admin_user')
    if (!raw) return '管理员'
    const { name } = JSON.parse(raw) as { name?: string }
    return name?.trim() ? String(name).trim() : '管理员'
  } catch {
    return '管理员'
  }
}

function BasicLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const adminName = useMemo(() => readAdminDisplayName(), [location.pathname])

  const menuItems: MenuProps['items'] = routes.map((r) => {
    if (r.children?.length) {
      return {
        key: r.path,
        icon: r.icon,
        label: r.name,
        children: r.children.filter((c) => !c.hideInMenu).map((c) => ({
          key: c.path,
          label: c.name,
          onClick: () => navigate(c.path),
        })),
      }
    }
    return {
      key: r.path,
      icon: r.icon,
      label: r.name,
      onClick: () => navigate(r.path),
    }
  })

  const userMenu: MenuProps['items'] = [
    { key: 'profile', icon: <UserOutlined />, label: '个人中心' },
    { key: 'logout', icon: <LogoutOutlined />, label: '退出登录', danger: true },
  ]

  const handleUserMenu: MenuProps['onClick'] = ({ key }) => {
    if (key === 'logout') {
      localStorage.removeItem('bingo_admin_token')
      localStorage.removeItem('bingo_admin_user')
      navigate('/login')
    } else if (key === 'profile') navigate('/profile')
  }

  const selectedKeys = routes
    .flatMap((r) => (r.children ? r.children.map((c) => c.path) : [r.path]))
    .filter((p) => location.pathname.startsWith(p))
  const openKeys = routes
    .filter((r) => r.children?.length && r.children.some((c) => location.pathname.startsWith(c.path)))
    .map((r) => r.path)

  const siderUser = (
    <Dropdown menu={{ items: userMenu, onClick: handleUserMenu }} placement="topLeft" trigger={['click']}>
      <div
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            ;(e.target as HTMLElement).click()
          }
        }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: collapsed ? '12px 8px' : '12px 16px',
          margin: collapsed ? '0 8px 12px' : '0 12px 12px',
          borderRadius: 8,
          cursor: 'pointer',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          justifyContent: collapsed ? 'center' : 'flex-start',
          color: 'rgba(255,255,255,0.88)',
          flexShrink: 0,
        }}
      >
        <Avatar size={collapsed ? 'default' : 36} icon={<UserOutlined />} style={{ flexShrink: 0 }} />
        {!collapsed ? (
          <div style={{ minWidth: 0, flex: 1 }}>
            <Typography.Text ellipsis style={{ display: 'block', color: 'rgba(255,255,255,0.95)', fontWeight: 500 }}>
              {adminName}
            </Typography.Text>
            <Typography.Text style={{ display: 'block', fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>
              总部账户
            </Typography.Text>
          </div>
        ) : null}
      </div>
    </Dropdown>
  )

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        className="bingo-admin-sider"
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={220}
        style={{
          height: '100vh',
          maxHeight: '100vh',
          overflow: 'hidden',
          position: 'sticky',
          top: 0,
          left: 0,
        }}
      >
        {/*
          Ant Design Sider 内容在 .ant-layout-sider-children 内，直接给 Sider 子节点设 flex 往往不生效。
          用一层包裹 + 菜单区 flex:1 + minHeight:0，才能让菜单中间滚动、底部账户始终贴底可见。
        */}
        <div
          style={{
            flex: 1,
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: 56,
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: collapsed ? 14 : 16,
              fontWeight: 600,
            }}
          >
            {collapsed ? '缤果' : '缤果AI学院'}
          </div>
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={selectedKeys}
            defaultOpenKeys={openKeys}
            items={menuItems}
            style={{
              flex: 1,
              minHeight: 0,
              overflowY: 'auto',
              overflowX: 'hidden',
              borderInlineEnd: 'none',
            }}
          />
          <div style={{ flexShrink: 0, background: 'rgba(0,0,0,0.2)' }}>{siderUser}</div>
        </div>
      </Sider>
      <Layout>
        <Header
          style={{
            padding: '0 24px',
            background: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            boxShadow: '0 1px 4px rgba(0,21,41,.08)',
          }}
        >
          {collapsed ? (
            <MenuUnfoldOutlined style={{ fontSize: 18, cursor: 'pointer' }} onClick={() => setCollapsed(false)} />
          ) : (
            <MenuFoldOutlined style={{ fontSize: 18, cursor: 'pointer' }} onClick={() => setCollapsed(true)} />
          )}
        </Header>
        <Content style={{ margin: 24, background: '#fff', padding: 24, borderRadius: 8, minHeight: 280 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}

export default BasicLayout
