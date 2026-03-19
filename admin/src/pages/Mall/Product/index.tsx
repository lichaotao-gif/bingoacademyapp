import { useState, useRef } from 'react'
import { ProTable } from '@ant-design/pro-components'
import type { ProColumns, ActionType } from '@ant-design/pro-components'
import { Button, Space, Tag, Modal, Form, Input, Select, InputNumber, message, Empty, Popconfirm } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { mockPage } from '@/api/mock'
import type { MallProduct } from '@/api/mall'
import { PRODUCT_TYPES } from '@/api/mall'
import { fmtTime, fmtMoney } from '@/utils/format'

const mockList: MallProduct[] = [
  { id: '1', name: 'AI写作月卡', productType: '2', price: 2990, originalPrice: 3990, salesCount: 128, status: '1' },
  { id: '2', name: 'AI全能年卡', productType: '4', price: 19900, originalPrice: 29900, salesCount: 56, status: '1' },
  { id: '3', name: '单次使用卡', productType: '1', price: 99, originalPrice: 99, salesCount: 320, status: '1' },
]

export default function MallProduct() {
  const actionRef = useRef<ActionType>()
  const [form] = Form.useForm()
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [currentRecord, setCurrentRecord] = useState<MallProduct | null>(null)
  const [submitLoading, setSubmitLoading] = useState(false)

  const handleAdd = () => {
    setCurrentRecord(null)
    form.resetFields()
    form.setFieldsValue({ status: '1' })
    setEditModalOpen(true)
  }

  const handleEdit = (record: MallProduct) => {
    setCurrentRecord(record)
    form.setFieldsValue({
      name: record.name,
      productType: record.productType,
      coverUrl: record.coverUrl,
      price: record.price ? record.price / 100 : 0,
      originalPrice: record.originalPrice ? record.originalPrice / 100 : 0,
      description: record.description,
      status: record.status || '1',
    })
    setEditModalOpen(true)
  }

  const handleSubmit = async () => {
    try {
      await form.validateFields()
      setSubmitLoading(true)
      await new Promise((r) => setTimeout(r, 500))
      message.success(currentRecord ? '保存成功' : '新增成功')
      setEditModalOpen(false)
      actionRef.current?.reload()
    } catch {
      //
    } finally {
      setSubmitLoading(false)
    }
  }

  const handleDelete = (id: string) => {
    message.success('删除成功')
    actionRef.current?.reload()
  }

  const columns: ProColumns<MallProduct>[] = [
    { title: '商品ID', dataIndex: 'id', width: 90, hideInSearch: true },
    { title: '关键词', dataIndex: 'keyword', hideInTable: true, fieldProps: { placeholder: '商品名称' } },
    { title: '商品名称', dataIndex: 'name', width: 180 },
    { title: '类型', dataIndex: 'productType', width: 120, valueType: 'select', valueEnum: Object.fromEntries(PRODUCT_TYPES.map((t) => [t.id, { text: t.name }])), render: (_, r) => PRODUCT_TYPES.find((t) => t.id === r.productType)?.name || '-' },
    { title: '封面', dataIndex: 'coverUrl', width: 90, hideInSearch: true, render: (_, r) => r.coverUrl ? <img src={r.coverUrl} alt="" style={{ width: 56, height: 36, objectFit: 'cover', borderRadius: 4 }} /> : '-' },
    { title: '售价(元)', dataIndex: 'price', width: 100, hideInSearch: true, render: (_, r) => fmtMoney(r.price / 100) },
    { title: '原价(元)', dataIndex: 'originalPrice', width: 100, hideInSearch: true, render: (_, r) => fmtMoney(r.originalPrice / 100) },
    { title: '销量', dataIndex: 'salesCount', width: 80, hideInSearch: true },
    { title: '状态', dataIndex: 'status', width: 90, valueType: 'select', valueEnum: { '1': { text: '上架' }, '0': { text: '下架' } }, render: (_, r) => <Tag color={r.status === '1' ? 'green' : 'red'}>{r.status === '1' ? '上架' : '下架'}</Tag> },
    {
      title: '操作',
      valueType: 'option',
      width: 180,
      render: (_, record) => (
        <Space size="small">
          <a onClick={() => window.open(`/mall/product/${record.id}`, '_blank')}>预览</a>
          <a onClick={() => handleEdit(record)}>编辑</a>
          <Popconfirm title="确定删除？" onConfirm={() => handleDelete(record.id)}>
            <a style={{ color: '#ff4d4f' }}>删除</a>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  const request = async (params: { current?: number; pageSize?: number; keyword?: string; productType?: string; status?: string }) => {
    const { current = 1, pageSize = 10, keyword, productType, status } = params
    let list = [...mockList]
    if (keyword) list = list.filter((p) => p.name?.includes(String(keyword)))
    if (productType) list = list.filter((p) => p.productType === productType)
    if (status) list = list.filter((p) => p.status === status)
    const res = mockPage(list, current, pageSize)
    return { data: res.data as MallProduct[], total: res.total, success: true }
  }

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>商品管理</h2>
      <ProTable<MallProduct>
        rowKey="id"
        actionRef={actionRef}
        columns={columns}
        request={request}
        search={{ labelWidth: 'auto' }}
        locale={{ emptyText: <Empty description="暂无数据" /> }}
        pagination={{ defaultPageSize: 10, showSizeChanger: true }}
        toolBarRender={() => [
          <Button key="add" type="primary" icon={<PlusOutlined />} onClick={handleAdd}>新增商品</Button>,
        ]}
      />

      <Modal
        title={currentRecord ? '编辑商品' : '新增商品'}
        open={editModalOpen}
        onOk={handleSubmit}
        onCancel={() => setEditModalOpen(false)}
        confirmLoading={submitLoading}
        destroyOnClose
        width={560}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="name" label="商品名称" rules={[{ required: true }]}>
            <Input placeholder="请输入商品名称" />
          </Form.Item>
          <Form.Item name="productType" label="商品类型" rules={[{ required: true }]}>
            <Select placeholder="选择类型">
              {PRODUCT_TYPES.map((t) => (
                <Select.Option key={t.id} value={t.id}>{t.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="coverUrl" label="封面图URL">
            <Input placeholder="输入封面图片地址" />
          </Form.Item>
          <Form.Item name="price" label="售价(元)" rules={[{ required: true, type: 'number', min: 0 }]}>
            <InputNumber min={0} step={0.01} style={{ width: '100%' }} placeholder="0.00" />
          </Form.Item>
          <Form.Item name="originalPrice" label="原价(元)" rules={[{ required: true, type: 'number', min: 0 }]}>
            <InputNumber min={0} step={0.01} style={{ width: '100%' }} placeholder="0.00" />
          </Form.Item>
          <Form.Item name="description" label="商品描述">
            <Input.TextArea rows={3} placeholder="请输入商品描述" />
          </Form.Item>
          <Form.Item name="status" label="上架状态">
            <Select>
              <Select.Option value="1">上架</Select.Option>
              <Select.Option value="0">下架</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
