import { useState, useRef } from 'react'
import { ProTable } from '@ant-design/pro-components'
import type { ProColumns, ActionType } from '@ant-design/pro-components'
import { Button, Space, Tag, Modal, Form, Input, Select, message, Empty, Popconfirm } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { mockPage } from '@/api/mock'
import type { ContentPage, PageStatus } from '@/api/content'

const mockList: ContentPage[] = [
  { id: 1, name: '关于我们', path: '/about', status: 'published', viewCount: 1200, updateTime: '2024-02-15 10:00:00' },
  { id: 2, name: '用户协议', path: '/agreement', status: 'published', viewCount: 850, updateTime: '2024-02-10 14:30:00' },
  { id: 3, name: '隐私政策', path: '/privacy', status: 'draft', updateTime: '2024-02-08 09:00:00' },
]

const STATUS_MAP: Record<PageStatus, { text: string; color: string }> = {
  draft: { text: '草稿', color: 'default' },
  published: { text: '已发布', color: 'green' },
  offline: { text: '已下架', color: 'red' },
}

export default function ContentPageList() {
  const actionRef = useRef<ActionType>()
  const [form] = Form.useForm()
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
  const [batchAction, setBatchAction] = useState<string>('')

  const handleAdd = () => {
    setEditId(null)
    form.resetFields()
    form.setFieldsValue({ status: 'draft' })
    setEditModalOpen(true)
  }

  const handleEdit = (record: ContentPage) => {
    setEditId(record.id)
    form.setFieldsValue({ name: record.name, path: record.path, status: record.status })
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

  const handleStatusChange = (record: ContentPage, newStatus: PageStatus) => {
    message.success(`已${newStatus === 'published' ? '发布' : '下架'}`)
    actionRef.current?.reload()
  }

  const handleBatchOperate = () => {
    if (!batchAction || selectedRowKeys.length === 0) {
      message.warning('请选择要操作的页面并选择操作类型')
      return
    }
    const actionText = batchAction === 'publish' ? '发布' : batchAction === 'offline' ? '下架' : '删除'
    message.success(`批量${actionText}成功`)
    setSelectedRowKeys([])
    actionRef.current?.reload()
  }

  const columns: ProColumns<ContentPage>[] = [
    { title: '页面ID', dataIndex: 'id', width: 90, hideInSearch: true },
    { title: '关键词', dataIndex: 'keyword', hideInTable: true, fieldProps: { placeholder: '页面名称/路径' } },
    { title: '页面名称', dataIndex: 'name', width: 180 },
    { title: '路径', dataIndex: 'path', width: 150 },
    { title: '浏览量', dataIndex: 'viewCount', width: 100, hideInSearch: true },
    { title: '状态', dataIndex: 'status', width: 100, valueType: 'select', valueEnum: { draft: { text: '草稿' }, published: { text: '已发布' }, offline: { text: '已下架' } }, render: (_, r) => {
      const s = STATUS_MAP[r.status]
      return <Tag color={s?.color}>{s?.text}</Tag>
    }},
    { title: '更新时间', dataIndex: 'updateTime', width: 170, hideInSearch: true },
    {
      title: '操作',
      valueType: 'option',
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <a onClick={() => handleEdit(record)}>编辑</a>
          {record.status !== 'published' && (
            <a style={{ color: '#52c41a' }} onClick={() => handleStatusChange(record, 'published')}>发布</a>
          )}
          {record.status === 'published' && (
            <a style={{ color: '#fa8c16' }} onClick={() => handleStatusChange(record, 'offline')}>下架</a>
          )}
          <Popconfirm title="确定删除？" onConfirm={() => { message.success('删除成功'); actionRef.current?.reload(); }}>
            <a style={{ color: '#ff4d4f' }}>删除</a>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  const request = async (params: { current?: number; pageSize?: number; keyword?: string; status?: string }) => {
    const { current = 1, pageSize = 10, keyword, status } = params
    let list = [...mockList]
    if (keyword) list = list.filter((p) => p.name?.includes(String(keyword)) || p.path?.includes(String(keyword)))
    if (status) list = list.filter((p) => p.status === status)
    const res = mockPage(list, current, pageSize)
    return { data: res.data as ContentPage[], total: res.total, success: true }
  }

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>页面管理</h2>
      <ProTable<ContentPage>
        rowKey="id"
        actionRef={actionRef}
        columns={columns}
        request={request}
        search={{ labelWidth: 'auto' }}
        rowSelection={{ selectedRowKeys, onChange: setSelectedRowKeys }}
        locale={{ emptyText: <Empty description="暂无数据" /> }}
        pagination={{ defaultPageSize: 10, showSizeChanger: true }}
        toolBarRender={() => [
          <Button key="refresh" onClick={() => actionRef.current?.reload()}>刷新</Button>,
          <Select key="batch" placeholder="批量操作" style={{ width: 120 }} value={batchAction} onChange={setBatchAction} allowClear>
            <Select.Option value="publish">批量发布</Select.Option>
            <Select.Option value="offline">批量下架</Select.Option>
            <Select.Option value="delete">批量删除</Select.Option>
          </Select>,
          <Button key="batchBtn" type="primary" disabled={!batchAction || selectedRowKeys.length === 0} onClick={handleBatchOperate}>执行</Button>,
          <Button key="add" type="primary" icon={<PlusOutlined />} onClick={handleAdd}>新增页面</Button>,
        ]}
      />

      <Modal
        title={editId ? '编辑页面' : '新增页面'}
        open={editModalOpen}
        onOk={handleSubmit}
        onCancel={() => setEditModalOpen(false)}
        confirmLoading={submitLoading}
        destroyOnClose
        width={480}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="name" label="页面名称" rules={[{ required: true }]}>
            <Input placeholder="如：关于我们" />
          </Form.Item>
          <Form.Item name="path" label="页面路径" rules={[{ required: true }]}>
            <Input placeholder="如：/about" />
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select>
              <Select.Option value="draft">草稿</Select.Option>
              <Select.Option value="published">已发布</Select.Option>
              <Select.Option value="offline">已下架</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
