import { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Layout, Menu, Dropdown, Space, Avatar } from 'antd'
import type { MenuProps } from 'antd'
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  LogoutOutlined,
} from '@ant-design/icons'
import { routes } from '@/config/routes'

const { Header, Sider, Content } = Layout

function BasicLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

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

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed} width={220}>
        <div
          style={{
            height: 56,
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'center',
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
        />
      </Sider>
      <Layout>
        <Header
          style={{
            padding: '0 24px',
            background: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 1px 4px rgba(0,21,41,.08)',
          }}
        >
          {collapsed ? (
            <MenuUnfoldOutlined style={{ fontSize: 18 }} onClick={() => setCollapsed(false)} />
          ) : (
            <MenuFoldOutlined style={{ fontSize: 18 }} onClick={() => setCollapsed(true)} />
          )}
          <Dropdown menu={{ items: userMenu, onClick: handleUserMenu }} placement="bottomRight">
            <Space style={{ cursor: 'pointer' }}>
              <Avatar icon={<UserOutlined />} />
              <span>管理员</span>
            </Space>
          </Dropdown>
        </Header>
        <Content style={{ margin: 24, background: '#fff', padding: 24, borderRadius: 8, minHeight: 280 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}

export default BasicLayout
