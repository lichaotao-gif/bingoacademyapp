import { useState, useRef } from 'react'
import { ProTable } from '@ant-design/pro-components'
import type { ProColumns, ActionType } from '@ant-design/pro-components'
import {
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  message,
  Empty,
  Popconfirm,
  Divider,
} from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, UploadOutlined } from '@ant-design/icons'
import { mockPage } from '@/api/mock'
import type { AIResource } from '@/api/aiResource'
import { AI_RESOURCE_CATEGORIES } from '@/api/aiResource'
import { fmtMoney } from '@/utils/format'

const mockList: AIResource[] = [
  { id: '1', name: 'AI智能写作助手', categoryId: '1', price: 990, useCount: 1280, status: '1', sort: 10 },
  { id: '2', name: 'AI绘画工具', categoryId: '2', price: 1990, useCount: 560, status: '1', sort: 20 },
  { id: '3', name: 'AI语音合成', categoryId: '3', price: 0, useCount: 3200, status: '1', sort: 30 },
]

export default function AIResourceManagement() {
  const actionRef = useRef<ActionType>()
  const [form] = Form.useForm()
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [currentRecord, setCurrentRecord] = useState<AIResource | null>(null)
  const [submitLoading, setSubmitLoading] = useState(false)

  const handleAdd = () => {
    setCurrentRecord(null)
    form.resetFields()
    form.setFieldsValue({ status: '1', sort: 99 })
    setEditModalOpen(true)
  }

  const handleEdit = (record: AIResource) => {
    setCurrentRecord(record)
    form.setFieldsValue({
      name: record.name,
      categoryId: record.categoryId,
      coverUrl: record.coverUrl,
      description: record.description,
      detail: record.detail,
      price: record.price ? record.price / 100 : 0,
      sort: record.sort ?? 99,
      status: record.status || '1',
    })
    setEditModalOpen(true)
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      const price = Math.round((values.price || 0) * 100)
      setSubmitLoading(true)
      await new Promise((r) => setTimeout(r, 500))
      message.success(currentRecord ? '编辑成功' : '新增成功')
      setEditModalOpen(false)
      actionRef.current?.reload()
    } catch {
      // 校验失败
    } finally {
      setSubmitLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    await new Promise((r) => setTimeout(r, 300))
    message.success('删除成功')
    actionRef.current?.reload()
  }

  const handleStatusChange = (record: AIResource) => {
    const next = record.status === '1' ? '0' : '1'
    message.success(next === '1' ? '已上架' : '已下架')
    actionRef.current?.reload()
  }

  const columns: ProColumns<AIResource>[] = [
    { title: '工具ID', dataIndex: 'id', width: 90, hideInSearch: true },
    { title: '关键词', dataIndex: 'keyword', hideInTable: true, fieldProps: { placeholder: '工具名称' } },
    { title: '分类', dataIndex: 'categoryId', width: 120, valueType: 'select', valueEnum: Object.fromEntries(AI_RESOURCE_CATEGORIES.map((c) => [c.id, { text: c.name }])), render: (_, r) => AI_RESOURCE_CATEGORIES.find((c) => c.id === r.categoryId)?.name || '未知' },
    { title: '工具名称', dataIndex: 'name', width: 180, hideInSearch: true },
    { title: '封面', dataIndex: 'coverUrl', width: 90, hideInSearch: true, render: (_, r) => r.coverUrl ? <img src={r.coverUrl} alt="" style={{ width: 56, height: 36, objectFit: 'cover', borderRadius: 4 }} /> : <span style={{ color: '#999' }}>-</span> },
    { title: '价格(元)', dataIndex: 'price', width: 100, hideInSearch: true, render: (_, r) => fmtMoney(r.price / 100) },
    { title: '使用次数', dataIndex: 'useCount', width: 100, hideInSearch: true },
    { title: '状态', dataIndex: 'status', width: 100, valueType: 'select', valueEnum: { '1': { text: '已上架' }, '0': { text: '已下架' } }, render: (_, r) => <Tag color={r.status === '1' ? 'green' : 'red'}>{r.status === '1' ? '已上架' : '已下架'}</Tag> },
    { title: '排序', dataIndex: 'sort', width: 80, hideInSearch: true },
    {
      title: '操作',
      valueType: 'option',
      width: 260,
      render: (_, record) => (
        <Space size="small">
          <a onClick={() => window.open(`/tool/detail/${record.id}`, '_blank')}>预览</a>
          <a onClick={() => handleEdit(record)}>编辑</a>
          <Popconfirm title={record.status === '1' ? '确定下架该工具？' : '确定上架该工具？'} onConfirm={() => handleStatusChange(record)}>
            <a>{record.status === '1' ? '下架' : '上架'}</a>
          </Popconfirm>
          <Popconfirm title="确定删除？删除后不可恢复！" onConfirm={() => handleDelete(record.id)}>
            <a style={{ color: '#ff4d4f' }}>删除</a>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  const request = async (params: { current?: number; pageSize?: number; keyword?: string; categoryId?: string; status?: string }) => {
    const { current = 1, pageSize = 10, keyword, categoryId, status } = params
    let list = [...mockList]
    if (keyword) list = list.filter((r) => r.name?.includes(String(keyword)))
    if (categoryId) list = list.filter((r) => r.categoryId === categoryId)
    if (status) list = list.filter((r) => r.status === status)
    const res = mockPage(list, current, pageSize)
    return { data: res.data as AIResource[], total: res.total, success: true }
  }

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>AI工具资源库管理</h2>
      <ProTable<AIResource>
        rowKey="id"
        actionRef={actionRef}
        columns={columns}
        request={request}
        search={{ labelWidth: 'auto' }}
        locale={{ emptyText: <Empty description="暂无数据" /> }}
        pagination={{ defaultPageSize: 10, showSizeChanger: true }}
        toolBarRender={() => [
          <Button key="add" type="primary" icon={<PlusOutlined />} onClick={handleAdd}>新增工具</Button>,
        ]}
      />

      <Modal
        title={currentRecord ? '编辑AI工具' : '新增AI工具'}
        open={editModalOpen}
        onOk={handleSubmit}
        onCancel={() => setEditModalOpen(false)}
        confirmLoading={submitLoading}
        destroyOnClose
        width={640}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Divider orientation="left" plain>基础信息</Divider>
          <Form.Item name="name" label="工具名称" rules={[{ required: true, message: '请输入工具名称' }]}>
            <Input placeholder="例如：AI智能写作助手" />
          </Form.Item>
          <Form.Item name="categoryId" label="工具分类" rules={[{ required: true, message: '请选择分类' }]}>
            <Select placeholder="选择分类">
              {AI_RESOURCE_CATEGORIES.map((c) => (
                <Select.Option key={c.id} value={c.id}>{c.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="coverUrl" label="封面图URL">
            <Input placeholder="输入封面图片地址" />
          </Form.Item>
          <Form.Item name="description" label="工具简介" rules={[{ required: true }]}>
            <Input.TextArea rows={3} placeholder="简要描述工具功能" />
          </Form.Item>
          <Form.Item name="detail" label="工具详情">
            <Input.TextArea rows={4} placeholder="详细描述工具功能、使用场景等" />
          </Form.Item>

          <Divider orientation="left" plain>价格与配置</Divider>
          <Form.Item name="price" label="单价(元)" rules={[{ required: true, type: 'number', min: 0 }]}>
            <InputNumber min={0} step={0.01} style={{ width: '100%' }} placeholder="0.00" />
          </Form.Item>
          <Form.Item name="sort" label="排序值" rules={[{ required: true }]}>
            <InputNumber min={0} style={{ width: '100%' }} placeholder="数字越小越靠前" />
          </Form.Item>
          <Form.Item name="status" label="上架状态">
            <Select>
              <Select.Option value="1">已上架</Select.Option>
              <Select.Option value="0">已下架</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
