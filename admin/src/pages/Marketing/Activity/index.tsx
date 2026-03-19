import { useRef } from 'react'
import { ProTable } from '@ant-design/pro-components'
import type { ProColumns, ActionType } from '@ant-design/pro-components'
import { Button, Space, Tag, Empty, Popconfirm, message } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { mockPage } from '@/api/mock'
import type { MarketingActivity, ActivityStatus, ActivityType } from '@/api/marketing'
import { ACTIVITY_TYPE_MAP, ACTIVITY_STATUS_MAP } from '@/api/marketing'
import { fmtTime } from '@/utils/format'

const mockList: MarketingActivity[] = [
  { id: '1', name: '新人优惠券活动', type: 'coupon', startTime: '2024-02-01 00:00:00', endTime: '2024-02-28 23:59:59', status: 'published', participantNum: 1200, convertNum: 180, convertRate: 15 },
  { id: '2', name: 'AI课程拼团', type: 'group', startTime: '2024-02-10 09:00:00', endTime: '2024-02-20 18:00:00', status: 'paused', participantNum: 560, convertNum: 89, convertRate: 15.89 },
  { id: '3', name: '限时8折', type: 'discount', startTime: '2024-02-05 00:00:00', endTime: '2024-02-15 23:59:59', status: 'ended', participantNum: 3200, convertNum: 456, convertRate: 14.25 },
  { id: '4', name: '开学礼包', type: 'gift', startTime: '2024-03-01 00:00:00', endTime: '2024-03-31 23:59:59', status: 'draft', participantNum: 0, convertNum: 0, convertRate: 0 },
]

export default function MarketingActivityList() {
  const navigate = useNavigate()
  const actionRef = useRef<ActionType>()

  const handleCreate = () => {
    navigate('/marketing/activity/create')
  }

  const handleEdit = (id: string) => {
    navigate(`/marketing/activity/create?id=${id}`)
  }

  const handleDetail = (id: string) => {
    navigate(`/marketing/activity/detail?id=${id}`)
  }

  const handleStatusChange = (record: MarketingActivity, newStatus?: ActivityStatus) => {
    const status = newStatus ?? (record.status === 'published' ? 'paused' : 'published')
    const msg = status === 'published' ? '已发布' : status === 'paused' ? '已暂停' : '已结束'
    message.success(`活动已${msg}`)
    actionRef.current?.reload()
  }

  const columns: ProColumns<MarketingActivity>[] = [
    { title: '活动ID', dataIndex: 'id', width: 90, hideInSearch: true },
    { title: '关键词', dataIndex: 'keyword', hideInTable: true, fieldProps: { placeholder: '活动名称/编号' } },
    { title: '活动名称', dataIndex: 'name', width: 200 },
    { title: '活动类型', dataIndex: 'type', width: 120, valueType: 'select', valueEnum: Object.fromEntries(Object.entries(ACTIVITY_TYPE_MAP).map(([k, v]) => [k, { text: v }])), render: (_, r) => <Tag>{ACTIVITY_TYPE_MAP[r.type as ActivityType]}</Tag> },
    { title: '开始时间', dataIndex: 'startTime', width: 170, hideInSearch: true, render: (_, r) => fmtTime(r.startTime) },
    { title: '结束时间', dataIndex: 'endTime', width: 170, hideInSearch: true, render: (_, r) => fmtTime(r.endTime) },
    { title: '状态', dataIndex: 'status', width: 100, valueType: 'select', valueEnum: Object.fromEntries(Object.entries(ACTIVITY_STATUS_MAP).map(([k, v]) => [k, { text: v.text }])), render: (_, r) => {
      const s = ACTIVITY_STATUS_MAP[r.status as ActivityStatus]
      return <Tag color={s?.color}>{s?.text}</Tag>
    }},
    { title: '核心数据', width: 180, hideInSearch: true, render: (_, r) => (
      <div style={{ fontSize: 12 }}>
        <div>参与人数：{r.participantNum ?? 0}</div>
        <div>转化数：{r.convertNum ?? 0}</div>
        <div>转化率：{(r.convertRate ?? 0).toFixed(2)}%</div>
      </div>
    )},
    {
      title: '操作',
      valueType: 'option',
      width: 260,
      render: (_, record) => (
        <Space size="small">
          <a onClick={() => handleDetail(record.id)}>查看详情</a>
          {['draft', 'published', 'paused'].includes(record.status) && (
            <a onClick={() => handleEdit(record.id)}>编辑</a>
          )}
          {record.status === 'published' && (
            <Popconfirm title="确定暂停该活动？" onConfirm={() => handleStatusChange(record, 'paused')}>
              <a style={{ color: '#fa8c16' }}>暂停</a>
            </Popconfirm>
          )}
          {['draft', 'paused'].includes(record.status) && (
            <Popconfirm title="确定发布该活动？" onConfirm={() => handleStatusChange(record, 'published')}>
              <a style={{ color: '#52c41a' }}>发布</a>
            </Popconfirm>
          )}
          {['published', 'paused'].includes(record.status) && (
            <Popconfirm title="确定结束该活动？" onConfirm={() => handleStatusChange(record, 'ended')}>
              <a style={{ color: '#ff4d4f' }}>结束</a>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ]

  const request = async (params: { current?: number; pageSize?: number; keyword?: string; status?: string }) => {
    const { current = 1, pageSize = 10, keyword, status } = params
    let list = [...mockList]
    if (keyword) list = list.filter((a) => a.name?.includes(String(keyword)) || a.id?.includes(String(keyword)))
    if (status) list = list.filter((a) => a.status === status)
    const res = mockPage(list, current, pageSize)
    return { data: res.data as MarketingActivity[], total: res.total, success: true }
  }

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>活动管理</h2>
      <ProTable<MarketingActivity>
        rowKey="id"
        actionRef={actionRef}
        columns={columns}
        request={request}
        search={{ labelWidth: 'auto' }}
        locale={{ emptyText: <Empty description="暂无数据" /> }}
        pagination={{ defaultPageSize: 10, showSizeChanger: true }}
        toolBarRender={() => [
          <Button key="create" type="primary" icon={<PlusOutlined />} onClick={handleCreate}>创建活动</Button>,
        ]}
      />
    </div>
  )
}
