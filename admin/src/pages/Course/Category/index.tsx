import { useState } from 'react'
import { ProTable } from '@ant-design/pro-components'
import type { ProColumns } from '@ant-design/pro-components'
import { Button, Space, Modal, Form, Input, InputNumber, message, Empty } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { mockPage } from '@/api/mock'
import type { CourseCategory } from '@/api/course'
import AuthButton from '@/components/common/AuthButton'
import { PERM } from '@/utils/auth'

const mockList: CourseCategory[] = [
  { category_id: 1, category_name: 'AI课程', parent_id: 0, sort: 1 },
  { category_id: 2, category_name: '竞赛课程', parent_id: 0, sort: 2 },
]

export default function CourseCategory() {
  const [modalOpen, setModalOpen] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [form] = Form.useForm()

  const handleAdd = () => {
    setEditId(null)
    form.resetFields()
    setModalOpen(true)
  }

  const handleEdit = (record: CourseCategory) => {
    setEditId(record.category_id)
    form.setFieldsValue({
      category_name: record.category_name,
      sort: record.sort ?? 0,
    })
    setModalOpen(true)
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
      message.success(editId ? '编辑成功' : '新增成功')
      setModalOpen(false)
    } finally {
      setSubmitLoading(false)
    }
  }

  const columns: ProColumns<CourseCategory>[] = [
    { title: 'ID', dataIndex: 'category_id', width: 90 },
    { title: '分类名称', dataIndex: 'category_name', width: 200 },
    { title: '排序', dataIndex: 'sort', width: 100 },
    {
      title: '操作',
      valueType: 'option',
      width: 150,
      render: (_, r) => (
        <Space>
          <AuthButton permCode={PERM.COURSE_EDIT}>
            <a onClick={() => handleEdit(r)}>编辑</a>
          </AuthButton>
        </Space>
      ),
    },
  ]

  const request = async (params: { current?: number; pageSize?: number }) => {
    const { current = 1, pageSize = 10 } = params
    const res = mockPage(mockList, current, pageSize)
    return { data: res.data as CourseCategory[], total: res.total, success: true }
  }

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>课程分类</h2>
      <ProTable<CourseCategory>
        rowKey="category_id"
        columns={columns}
        request={request}
        search={false}
        locale={{ emptyText: <Empty description="暂无数据" /> }}
        pagination={{ defaultPageSize: 10, showSizeChanger: true }}
        toolBarRender={() => [
          <AuthButton key="add" permCode={PERM.COURSE_EDIT}>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>新增分类</Button>
          </AuthButton>,
        ]}
      />

      <Modal
        title={editId ? '编辑分类' : '新增分类'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        confirmLoading={submitLoading}
        destroyOnClose
        width={400}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="category_name" label="分类名称" rules={[{ required: true, message: '请输入分类名称' }]}>
            <Input placeholder="请输入分类名称" />
          </Form.Item>
          <Form.Item name="sort" label="排序">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="数字越小越靠前" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
