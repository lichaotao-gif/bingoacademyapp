import { useState, useRef } from 'react'
import { ProTable } from '@ant-design/pro-components'
import type { ProColumns, ActionType } from '@ant-design/pro-components'
import { Button, Modal, Form, Input, InputNumber, Select, message, Empty, Popconfirm } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { mockPage } from '@/api/mock'
import type { MallPackage } from '@/api/mall'
import { fmtTime, fmtMoney } from '@/utils/format'

const toolOptions = [
  { id: '1', name: 'AI写作助手' },
  { id: '2', name: 'AI绘画工具' },
  { id: '3', name: 'AI语音合成' },
  { id: '4', name: 'AI编程助手' },
]

const mockList: MallPackage[] = [
  { id: '1', name: 'AI全能创作套餐', price: 9990, validDays: 30, toolCount: 6, salesCount: 45, createTime: '2024-01-10 10:00:00' },
  { id: '2', name: 'AI写作+绘画套餐', price: 4990, validDays: 30, toolCount: 2, salesCount: 128, createTime: '2024-01-15 09:00:00' },
]

export default function MallPackage() {
  const actionRef = useRef<ActionType>()
  const [form] = Form.useForm()
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [currentRecord, setCurrentRecord] = useState<MallPackage | null>(null)
  const [submitLoading, setSubmitLoading] = useState(false)

  const handleAdd = () => {
    setCurrentRecord(null)
    form.resetFields()
    setEditModalOpen(true)
  }

  const handleEdit = (record: MallPackage) => {
    setCurrentRecord(record)
    form.setFieldsValue({
      name: record.name,
      price: record.price ? record.price / 100 : 0,
      validDays: record.validDays,
      toolIds: record.toolIds ? record.toolIds.split(',') : [],
      description: record.description,
    })
    setEditModalOpen(true)
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      const toolIds = Array.isArray(values.toolIds) ? values.toolIds.join(',') : ''
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

  const columns: ProColumns<MallPackage>[] = [
    { title: '套餐ID', dataIndex: 'id', width: 90 },
    { title: '套餐名称', dataIndex: 'name', width: 200 },
    { title: '包含工具数', dataIndex: 'toolCount', width: 110 },
    { title: '套餐价格(元)', dataIndex: 'price', width: 120, render: (_, r) => fmtMoney(r.price / 100) },
    { title: '有效期(天)', dataIndex: 'validDays', width: 100 },
    { title: '销量', dataIndex: 'salesCount', width: 80 },
    { title: '创建时间', dataIndex: 'createTime', width: 170, render: (_, r) => fmtTime(r.createTime) },
    {
      title: '操作',
      valueType: 'option',
      width: 150,
      render: (_, record) => (
        <>
          <a onClick={() => handleEdit(record)}>编辑</a>
          <Popconfirm title="确定删除？" onConfirm={() => handleDelete(record.id)}>
            <a style={{ marginLeft: 12, color: '#ff4d4f' }}>删除</a>
          </Popconfirm>
        </>
      ),
    },
  ]

  const request = async (params: { current?: number; pageSize?: number }) => {
    const { current = 1, pageSize = 10 } = params
    const res = mockPage(mockList, current, pageSize)
    return { data: res.data as MallPackage[], total: res.total, success: true }
  }

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>套餐管理</h2>
      <ProTable<MallPackage>
        rowKey="id"
        actionRef={actionRef}
        columns={columns}
        request={request}
        search={false}
        locale={{ emptyText: <Empty description="暂无数据" /> }}
        pagination={{ defaultPageSize: 10, showSizeChanger: true }}
        toolBarRender={() => [
          <Button key="add" type="primary" icon={<PlusOutlined />} onClick={handleAdd}>新增套餐</Button>,
        ]}
      />

      <Modal
        title={currentRecord ? '编辑套餐' : '新增套餐'}
        open={editModalOpen}
        onOk={handleSubmit}
        onCancel={() => setEditModalOpen(false)}
        confirmLoading={submitLoading}
        destroyOnClose
        width={560}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="name" label="套餐名称" rules={[{ required: true }]}>
            <Input placeholder="例如：AI全能创作套餐" />
          </Form.Item>
          <Form.Item name="price" label="套餐价格(元)" rules={[{ required: true, type: 'number', min: 0 }]}>
            <InputNumber min={0} step={0.01} style={{ width: '100%' }} placeholder="0.00" />
          </Form.Item>
          <Form.Item name="validDays" label="有效期(天)" rules={[{ required: true, type: 'number', min: 1 }]}>
            <InputNumber min={1} style={{ width: '100%' }} placeholder="例如：30" />
          </Form.Item>
          <Form.Item name="toolIds" label="包含工具" rules={[{ required: true, message: '请选择至少一个工具' }]}>
            <Select mode="multiple" placeholder="选择套餐包含的AI工具">
              {toolOptions.map((t) => (
                <Select.Option key={t.id} value={t.id}>{t.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="description" label="套餐描述">
            <Input.TextArea rows={3} placeholder="请输入套餐详细描述" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
