import type { ReactNode } from 'react'
import {
  TeamOutlined,
  BookOutlined,
  TrophyOutlined,
  ShoppingOutlined,
  GiftOutlined,
  BankOutlined,
  DashboardOutlined,
  SettingOutlined,
  FileTextOutlined,
  BarChartOutlined,
  DollarOutlined,
  ExperimentOutlined,
  ToolOutlined,
} from '@ant-design/icons'

export interface RouteConfig {
  path: string
  name: string
  icon?: ReactNode
  children?: RouteConfig[]
  hideInMenu?: boolean
}

export const routes: RouteConfig[] = [
  {
    path: '/system',
    name: '系统管理',
    icon: <SettingOutlined />,
    children: [
      { path: '/system/admin', name: '账号管理' },
      { path: '/system/role', name: '角色权限' },
      { path: '/system/log', name: '操作日志' },
      { path: '/system/config', name: '系统配置' },
    ],
  },
  {
    path: '/student',
    name: '学员管理',
    icon: <TeamOutlined />,
    children: [
      { path: '/student/list', name: '学员信息' },
      { path: '/student/behavior', name: '行为追踪' },
      { path: '/student/feedback', name: '反馈管理' },
    ],
  },
  {
    path: '/course',
    name: '课程管理',
    icon: <BookOutlined />,
    children: [
      { path: '/course/list', name: '课程列表' },
      { path: '/course/category', name: '课程分类' },
      { path: '/course/config', name: 'AI课程配置' },
      { path: '/course/edit', name: '编辑课程', hideInMenu: true },
      { path: '/course/chapter', name: '课程章节', hideInMenu: true },
      { path: '/course/content', name: '内容管理' },
      { path: '/course/sales', name: '销售管理' },
    ],
  },
  {
    path: '/competition',
    name: '赛事管理',
    icon: <TrophyOutlined />,
    children: [
      { path: '/competition/list', name: '赛事列表' },
      { path: '/competition/apply', name: '报名审核' },
      { path: '/competition/certificate', name: '证书管理' },
      { path: '/competition/detail', name: '赛事详情', hideInMenu: true },
    ],
  },
  {
    path: '/ai-resource',
    name: 'AI工具资源库',
    icon: <ToolOutlined />,
    children: [
      { path: '/ai-resource/list', name: '工具管理' },
    ],
  },
  {
    path: '/mall',
    name: 'AI智能商城',
    icon: <ShoppingOutlined />,
    children: [
      { path: '/mall/product', name: '商品管理' },
      { path: '/mall/order', name: '订单管理' },
      { path: '/mall/package', name: '套餐管理' },
      { path: '/mall/stock', name: '库存管理' },
    ],
  },
  {
    path: '/marketing',
    name: '营销活动',
    icon: <GiftOutlined />,
    children: [
      { path: '/marketing/activity', name: '活动管理' },
      { path: '/marketing/activity/create', name: '创建活动', hideInMenu: true },
      { path: '/marketing/activity/detail', name: '活动详情', hideInMenu: true },
      { path: '/marketing/commission', name: '佣金管理' },
      { path: '/marketing/points', name: '公益活动' },
    ],
  },
  {
    path: '/franchise',
    name: '加盟商管理',
    icon: <BankOutlined />,
    children: [
      { path: '/franchise/list', name: '加盟商列表' },
      { path: '/franchise/qualification', name: '资质审核' },
      { path: '/franchise/teaching-products', name: '学具商品配置' },
      { path: '/franchise/detail', name: '加盟商详情', hideInMenu: true },
    ],
  },
  {
    path: '/aitest',
    name: 'AI能力测评',
    icon: <ExperimentOutlined />,
    children: [
      { path: '/aitest/overview', name: '数据概览' },
      { path: '/aitest/question', name: '题库管理' },
      { path: '/aitest/rule', name: '测评规则' },
      { path: '/aitest/result', name: '测评结果' },
    ],
  },
  {
    path: '/content',
    name: '内容管理',
    icon: <FileTextOutlined />,
    children: [
      { path: '/content/page', name: '页面管理' },
      { path: '/content/banner', name: 'Banner管理' },
    ],
  },
  {
    path: '/statistics',
    name: '数据统计',
    icon: <BarChartOutlined />,
    children: [
      { path: '/statistics/overview', name: '数据看板', icon: <DashboardOutlined /> },
      { path: '/statistics/report', name: '报表导出' },
    ],
  },
  {
    path: '/finance',
    name: '财务结算',
    icon: <DollarOutlined />,
    children: [
      { path: '/finance/settlement', name: '结算管理' },
      { path: '/finance/flow', name: '财务流水' },
      { path: '/finance/commission', name: '佣金结算' },
      { path: '/finance/report', name: '财务报表' },
    ],
  },
]
