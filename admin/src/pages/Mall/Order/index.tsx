import { useRef } from 'react'
import { ProTable } from '@ant-design/pro-components'
import type { ProColumns } from '@ant-design/pro-components'
import { Tag, Button, Space, Popconfirm, message } from 'antd'
import { mockPage } from '@/api/mock'
import type { MallOrder } from '@/api/mall'
import { ORDER_STATUS_MAP } from '@/api/mall'
import { fmtTime, fmtMoney } from '@/utils/format'

const mockList: MallOrder[] = [
  { id: '1', orderNo: 'BG202402150001', userId: '1', userName: '张三', productName: 'AI写作月卡', amount: 2990, payType: '1', status: '1', createTime: '2024-02-15 10:00:00' },
  { id: '2', orderNo: 'BG202402150002', userId: '2', userName: '李四', productName: 'AI全能年卡', amount: 19900, payType: '2', status: '0', createTime: '2024-02-15 11:30:00' },
  { id: '3', orderNo: 'BG202402150003', userId: '3', userName: '王五', productName: '单次使用卡', amount: 99, payType: '1', status: '3', createTime: '2024-02-14 15:00:00' },
]

const PAY_TYPE_MAP: Record<string, string> = {
  '1': '微信支付',
  '2': '支付宝',
  '3': '其他',
}

export default function MallOrder() {
  const actionRef = useRef<any>()

  const handleConfirmPay = (id: string) => {
    message.success('已标记为已支付')
    actionRef.current?.reload()
  }

  const handleCancelOrder = (id: string) => {
    message.success('订单已取消')
    actionRef.current?.reload()
  }

  const columns: ProColumns<MallOrder>[] = [
    { title: '订单编号', dataIndex: 'orderNo', width: 180 },
    { title: '关键词', dataIndex: 'keyword', hideInTable: true, fieldProps: { placeholder: '订单编号/用户ID' } },
    { title: '用户ID', dataIndex: 'userId', width: 90 },
    { title: '用户名', dataIndex: 'userName', width: 100 },
    { title: '商品名称', dataIndex: 'productName', width: 160 },
    { title: '订单金额(元)', dataIndex: 'amount', width: 120, render: (_, r) => fmtMoney(r.amount / 100) },
    { title: '支付方式', dataIndex: 'payType', width: 100, render: (_, r) => PAY_TYPE_MAP[r.payType || ''] || '-' },
    { title: '状态', dataIndex: 'status', width: 100, valueType: 'select', valueEnum: Object.fromEntries(Object.entries(ORDER_STATUS_MAP).map(([k, v]) => [k, { text: v.text }])), render: (_, r) => {
      const s = ORDER_STATUS_MAP[r.status] || { text: '-', color: 'default' }
      return <Tag color={s.color}>{s.text}</Tag>
    }},
    { title: '创建时间', dataIndex: 'createTime', width: 170, render: (_, r) => fmtTime(r.createTime) },
    {
      title: '操作',
      valueType: 'option',
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <a>详情</a>
          {record.status === '0' && (
            <Popconfirm title="确定标记为已支付？" onConfirm={() => handleConfirmPay(record.id)}>
              <a style={{ color: '#52c41a' }}>确认支付</a>
            </Popconfirm>
          )}
          {['0', '1'].includes(record.status) && (
            <Popconfirm title="确定取消该订单？" onConfirm={() => handleCancelOrder(record.id)}>
              <a style={{ color: '#ff4d4f' }}>取消订单</a>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ]

  const request = async (params: { current?: number; pageSize?: number; keyword?: string; status?: string }) => {
    const { current = 1, pageSize = 10, keyword, status } = params
    let list = [...mockList]
    if (keyword) list = list.filter((o) => o.orderNo?.includes(String(keyword)) || o.userId?.includes(String(keyword)))
    if (status) list = list.filter((o) => o.status === status)
    const res = mockPage(list, current, pageSize)
    return { data: res.data as MallOrder[], total: res.total, success: true }
  }

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>订单管理</h2>
      <ProTable<MallOrder>
        rowKey="id"
        actionRef={actionRef}
        columns={columns}
        request={request}
        search={{ labelWidth: 'auto' }}
        pagination={{ defaultPageSize: 10, showSizeChanger: true }}
      />
    </div>
  )
}
