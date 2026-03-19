import { useState, useRef } from 'react'
import { ProTable } from '@ant-design/pro-components'
import type { ProColumns, ActionType } from '@ant-design/pro-components'
import { Button, Space, Tag, Modal, Form, Input, Select, InputNumber, message, Empty, Popconfirm } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { mockPage } from '@/api/mock'
import type { ContentBanner, BannerPosition } from '@/api/content'
import { BANNER_POSITION_MAP } from '@/api/content'
import { fmtTime } from '@/utils/format'

const mockList: ContentBanner[] = [
  { id: 1, title: 'AI学习季活动', imageUrl: '', linkUrl: '/activity/ai', position: 'home_top', sort: 1, status: 1, updateTime: '2024-02-15 10:00:00' },
  { id: 2, title: '新课上线', imageUrl: '', linkUrl: '/course/new', position: 'home_mid', sort: 2, status: 1, updateTime: '2024-02-14 09:00:00' },
  { id: 3, title: '春节特惠', imageUrl: '', linkUrl: '/promo', position: 'home_top', sort: 3, status: 0, updateTime: '2024-02-10 14:00:00' },
]

const positionOptions = Object.entries(BANNER_POSITION_MAP).map(([value, label]) => ({ label, value }))

export default function ContentBannerList() {
  const actionRef = useRef<ActionType>()
  const [form] = Form.useForm()
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [submitLoading, setSubmitLoading] = useState(false)

  const handleAdd = () => {
    setEditId(null)
    form.resetFields()
    form.setFieldsValue({ status: 1, sort: 99 })
    setEditModalOpen(true)
  }

  const handleEdit = (record: ContentBanner) => {
    setEditId(record.id)
    form.setFieldsValue({
      title: record.title,
      imageUrl: record.imageUrl,
      linkUrl: record.linkUrl,
      position: record.position,
      sort: record.sort,
      status: record.status,
    })
    setEditModalOpen(true)
  }

  const handleSubmit = async () => {
    try {
      await form.validateFields()
      setSubmitLoading(true)
      await new Promise((r) => setTimeout(r, 500))
      message.success(editId ? '保存成功' : '新增成功')
      setEditModalOpen(false)
      actionRef.current?.reload()
    } catch {
      //
    } finally {
      setSubmitLoading(false)
    }
  }

  const handleDelete = (id: number) => {
    message.success('删除成功')
    actionRef.current?.reload()
  }

  const columns: ProColumns<ContentBanner>[] = [
    { title: 'ID', dataIndex: 'id', width: 80, hideInSearch: true },
    { title: '位置', dataIndex: 'position', width: 120, valueType: 'select', valueEnum: Object.fromEntries(positionOptions.map((o) => [o.value, { text: o.label }])), render: (_, r) => BANNER_POSITION_MAP[r.position as BannerPosition] },
    { title: '标题', dataIndex: 'title', width: 180 },
    { title: '图片', dataIndex: 'imageUrl', width: 100, hideInSearch: true, render: (_, r) => r.imageUrl ? <img src={r.imageUrl} alt="" style={{ width: 80, height: 40, objectFit: 'cover', borderRadius: 4 }} /> : <span style={{ color: '#999' }}>未上传</span> },
    { title: '链接', dataIndex: 'linkUrl', width: 150, ellipsis: true },
    { title: '排序', dataIndex: 'sort', width: 80, hideInSearch: true },
    { title: '状态', dataIndex: 'status', width: 90, valueType: 'select', valueEnum: { 1: { text: '启用' }, 0: { text: '禁用' } }, render: (_, r) => <Tag color={r.status === 1 ? 'green' : 'default'}>{r.status === 1 ? '启用' : '禁用'}</Tag> },
    { title: '更新时间', dataIndex: 'updateTime', width: 170, hideInSearch: true, render: (_, r) => fmtTime(r.updateTime) },
    {
      title: '操作',
      valueType: 'option',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <a onClick={() => handleEdit(record)}>编辑</a>
          <Popconfirm title="确定删除？" onConfirm={() => handleDelete(record.id)}>
            <a style={{ color: '#ff4d4f' }}>删除</a>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  const request = async (params: { current?: number; pageSize?: number; position?: string; status?: number }) => {
    const { current = 1, pageSize = 10, position, status } = params
    let list = [...mockList]
    if (position) list = list.filter((b) => b.position === position)
    if (status != null && status !== '') list = list.filter((b) => b.status === Number(status))
    const res = mockPage(list, current, pageSize)
    return { data: res.data as ContentBanner[], total: res.total, success: true }
  }

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>Banner管理</h2>
      <ProTable<ContentBanner>
        rowKey="id"
        actionRef={actionRef}
        columns={columns}
        request={request}
        search={{ labelWidth: 'auto' }}
        locale={{ emptyText: <Empty description="暂无数据" /> }}
        pagination={{ defaultPageSize: 10, showSizeChanger: true }}
        toolBarRender={() => [
          <Button key="add" type="primary" icon={<PlusOutlined />} onClick={handleAdd}>新增Banner</Button>,
        ]}
      />

      <Modal
        title={editId ? '编辑Banner' : '新增Banner'}
        open={editModalOpen}
        onOk={handleSubmit}
        onCancel={() => setEditModalOpen(false)}
        confirmLoading={submitLoading}
        destroyOnClose
        width={520}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="title" label="Banner标题" rules={[{ required: true }]}>
            <Input placeholder="如：AI学习季活动" />
          </Form.Item>
          <Form.Item name="position" label="展示位置" rules={[{ required: true }]}>
            <Select placeholder="选择位置" options={positionOptions} />
          </Form.Item>
          <Form.Item name="imageUrl" label="图片URL" rules={[{ required: true, message: '请填写图片地址' }]}>
            <Input placeholder="建议尺寸 1200×400px" />
          </Form.Item>
          <Form.Item name="linkUrl" label="跳转链接">
            <Input placeholder="如：/activity/ai" />
          </Form.Item>
          <Form.Item name="sort" label="排序值">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="数字越小越靠前" />
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select>
              <Select.Option value={1}>启用</Select.Option>
              <Select.Option value={0}>禁用</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
