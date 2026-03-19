import { useState, useRef } from 'react'
import { ProTable } from '@ant-design/pro-components'
import type { ProColumns, ActionType } from '@ant-design/pro-components'
import { Button, Space, Tag, Modal, Form, Input, Select, DatePicker, InputNumber, Switch, message, Empty, Popconfirm } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { mockPage } from '@/api/mock'
import type { Competition, CompetitionStatus, CompetitionCategory } from '@/api/competition'
import dayjs from 'dayjs'
import { fmtTime } from '@/utils/format'
import AuthButton from '@/components/common/AuthButton'
import { PERM } from '@/utils/auth'

const { TextArea } = Input

const STATUS_MAP: Record<CompetitionStatus, { text: string; color: string }> = {
  pending: { text: '未开始', color: 'orange' },
  ongoing: { text: '进行中', color: 'green' },
  ended: { text: '已结束', color: 'default' },
  offline: { text: '已下架', color: 'red' },
}

const CATEGORY_MAP: Record<CompetitionCategory, string> = {
  ai_code: 'AI编程大赛',
  algorithm: '算法挑战赛',
  design: '创意设计赛',
}

const categoryOptions = Object.entries(CATEGORY_MAP).map(([value, label]) => ({ label, value }))

const mockList: Competition[] = [
  { competition_id: 1, competition_name: '2024缤果AI编程大赛', category: 'ai_code', start_time: '2024-06-01 09:00:00', end_time: '2024-06-30 18:00:00', enroll_count: 128, status: 'ongoing' },
  { competition_id: 2, competition_name: '算法挑战赛（夏季赛）', category: 'algorithm', start_time: '2024-07-10 09:00:00', end_time: '2024-07-20 18:00:00', enroll_count: 89, status: 'pending' },
  { competition_id: 3, competition_name: 'AI创意设计赛', category: 'design', start_time: '2024-05-01 09:00:00', end_time: '2024-05-20 18:00:00', enroll_count: 210, status: 'ended' },
]

export default function CompetitionList() {
  const navigate = useNavigate()
  const actionRef = useRef<ActionType>()
  const [form] = Form.useForm()

  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [submitLoading, setSubmitLoading] = useState(false)

  const handleAdd = () => {
    setEditId(null)
    form.resetFields()
    setEditModalOpen(true)
  }

  const handleEdit = (record: Competition) => {
    setEditId(record.competition_id)
    form.setFieldsValue({
      competition_name: record.competition_name,
      category: record.category,
      start_time: record.start_time ? dayjs(record.start_time) : undefined,
      end_time: record.end_time ? dayjs(record.end_time) : undefined,
      desc: record.desc,
      enroll_start_time: record.enroll_start_time ? dayjs(record.enroll_start_time) : undefined,
      enroll_end_time: record.enroll_end_time ? dayjs(record.enroll_end_time) : undefined,
      max_enroll_count: record.max_enroll_count,
      need_audit: record.need_audit ?? false,
    })
    setEditModalOpen(true)
  }

  const handleSubmit = async () => {
    try {
      await form.validateFields()
    } catch {
      return
    }
    setSubmitLoading(true)
    try {
      await new Promise((r) => setTimeout(r, 500))
      message.success(editId ? '保存成功' : '新增成功')
      setEditModalOpen(false)
      actionRef.current?.reload()
    } finally {
      setSubmitLoading(false)
    }
  }

  const handleDetail = (record: Competition) => {
    navigate(`/competition/detail?id=${record.competition_id}`)
  }

  const handlePublish = (record: Competition) => {
    message.success(`赛事【${record.competition_name}】已发布`)
    actionRef.current?.reload()
  }

  const handleOffline = (record: Competition) => {
    message.success(`赛事【${record.competition_name}】已下架`)
    actionRef.current?.reload()
  }

  const columns: ProColumns<Competition>[] = [
    { title: '赛事ID', dataIndex: 'competition_id', width: 90, hideInSearch: true },
    { title: '关键词', dataIndex: 'keyword', hideInTable: true, fieldProps: { placeholder: '赛事名称' } },
    { title: '状态', dataIndex: 'status', width: 100, valueType: 'select', valueEnum: { pending: { text: '未开始' }, ongoing: { text: '进行中' }, ended: { text: '已结束' }, offline: { text: '已下架' } }, render: (_, r) => {
      const s = STATUS_MAP[r.status as CompetitionStatus] || STATUS_MAP.pending
      return <Tag color={s.color}>{s.text}</Tag>
    }},
    { title: '赛事名称', dataIndex: 'competition_name', width: 220, hideInSearch: true, render: (_, r) => <a onClick={() => handleDetail(r)}>{r.competition_name}</a> },
    { title: '分类', dataIndex: 'category', width: 120, hideInSearch: true, render: (_, r) => CATEGORY_MAP[r.category as CompetitionCategory] },
    { title: '开始时间', dataIndex: 'start_time', width: 170, hideInSearch: true, render: (_, r) => fmtTime(r.start_time) },
    { title: '结束时间', dataIndex: 'end_time', width: 170, hideInSearch: true, render: (_, r) => fmtTime(r.end_time) },
    { title: '报名人数', dataIndex: 'enroll_count', width: 100, hideInSearch: true },
    {
      title: '操作',
      valueType: 'option',
      width: 260,
      render: (_, r) => (
        <Space>
          <a onClick={() => handleEdit(r)}>编辑</a>
          <a onClick={() => handleDetail(r)}>详情</a>
          {r.status === 'pending' && (
            <AuthButton permCode={PERM.COMPETITION_PUBLISH}>
              <a style={{ color: '#1890ff' }} onClick={() => handlePublish(r)}>发布</a>
            </AuthButton>
          )}
          {r.status === 'ongoing' && (
            <a style={{ color: '#fa8c16' }} onClick={() => handleOffline(r)}>下架</a>
          )}
          {r.status !== 'ongoing' && (
            <AuthButton permCode={PERM.COMPETITION_DELETE}>
              <Popconfirm title="确定删除该赛事？" onConfirm={() => { message.success('删除成功'); actionRef.current?.reload(); }}>
                <a style={{ color: '#ff4d4f' }}>删除</a>
              </Popconfirm>
            </AuthButton>
          )}
        </Space>
      ),
    },
  ]

  const request = async (params: { current?: number; pageSize?: number; keyword?: string; status?: string }) => {
    const { current = 1, pageSize = 10, keyword, status } = params
    let list = [...mockList]
    if (status) list = list.filter((c) => c.status === status)
    if (keyword) list = list.filter((c) => c.competition_name?.includes(String(keyword)))
    const res = mockPage(list, current, pageSize)
    return { data: res.data as Competition[], total: res.total, success: true }
  }

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>赛事列表</h2>
      <ProTable<Competition>
        rowKey="competition_id"
        actionRef={actionRef}
        columns={columns}
        request={request}
        search={{ labelWidth: 'auto' }}
        locale={{ emptyText: <Empty description="暂无数据" /> }}
        pagination={{ defaultPageSize: 10, showSizeChanger: true }}
        toolBarRender={() => [
          <AuthButton key="add" permCode={PERM.COMPETITION_EDIT}>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>新增赛事</Button>
          </AuthButton>,
        ]}
      />

      <Modal
        title={editId ? '编辑赛事' : '新增赛事'}
        open={editModalOpen}
        onOk={handleSubmit}
        onCancel={() => setEditModalOpen(false)}
        confirmLoading={submitLoading}
        destroyOnClose
        width={640}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="competition_name" label="赛事名称" rules={[{ required: true, message: '请输入赛事名称' }]}>
            <Input placeholder="请输入赛事名称" />
          </Form.Item>
          <Form.Item name="category" label="赛事分类" rules={[{ required: true, message: '请选择分类' }]}>
            <Select placeholder="请选择" options={categoryOptions} allowClear />
          </Form.Item>
          <Form.Item name="start_time" label="开始时间" rules={[{ required: true, message: '请选择开始时间' }]}>
            <DatePicker showTime style={{ width: '100%' }} format="YYYY-MM-DD HH:mm:ss" />
          </Form.Item>
          <Form.Item name="end_time" label="结束时间" rules={[{ required: true, message: '请选择结束时间' }]}>
            <DatePicker showTime style={{ width: '100%' }} format="YYYY-MM-DD HH:mm:ss" />
          </Form.Item>
          <Form.Item name="desc" label="赛事简介">
            <TextArea rows={4} placeholder="请输入赛事简介" />
          </Form.Item>
          <Form.Item name="enroll_start_time" label="报名开始时间">
            <DatePicker showTime style={{ width: '100%' }} format="YYYY-MM-DD HH:mm:ss" />
          </Form.Item>
          <Form.Item name="enroll_end_time" label="报名结束时间">
            <DatePicker showTime style={{ width: '100%' }} format="YYYY-MM-DD HH:mm:ss" />
          </Form.Item>
          <Form.Item name="max_enroll_count" label="报名人数上限">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="不填表示不限制" />
          </Form.Item>
          <Form.Item name="need_audit" label="是否需要审核" valuePropName="checked">
            <Switch checkedChildren="是" unCheckedChildren="否" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
