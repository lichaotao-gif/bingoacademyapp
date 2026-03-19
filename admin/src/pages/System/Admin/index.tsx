import { useState, useRef } from 'react'
import { ProTable } from '@ant-design/pro-components'
import type { ProColumns, ActionType } from '@ant-design/pro-components'
import { Button, Space, Tag, Modal, Form, Input, Select, Switch, message, Empty } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { mockPage } from '@/api/mock'
import type { Admin } from '@/api/system'
import { fmtTime } from '@/utils/format'
import AuthButton from '@/components/common/AuthButton'
import { PERM } from '@/utils/auth'

const mockList: Admin[] = [
  { admin_id: 1, username: 'admin', real_name: '超级管理员', phone: '13800138000', role_id: 1, status: 1, create_time: '2024-01-15 10:00:00' },
  { admin_id: 2, username: 'ops', real_name: '运营管理员', phone: '13800138001', role_id: 2, status: 1, create_time: '2024-02-01 09:00:00' },
]

const roleOptions = [
  { label: '超级管理员', value: 1 },
  { label: '运营管理员', value: 2 },
]

const phoneReg = /^1[3-9]\d{9}$/
const usernameReg = /^[a-zA-Z0-9_]+$/

export default function SystemAdmin() {
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [form] = Form.useForm()
  const actionRef = useRef<ActionType>()

  const handleAdd = () => {
    setEditingId(null)
    form.resetFields()
    form.setFieldsValue({ status: true })
    setModalOpen(true)
  }

  const handleEdit = (record: Admin) => {
    setEditingId(record.admin_id)
    form.setFieldsValue({
      username: record.username,
      real_name: record.real_name,
      phone: record.phone,
      role_id: record.role_id,
      status: record.status === 1,
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
      const values = form.getFieldsValue()
      const payload: Record<string, unknown> = {
        ...values,
        status: values.status ? 1 : 0,
      }
      if (!editingId) payload.password = values.password
      else delete payload.password
      // 模拟接口请求
      await new Promise((r) => setTimeout(r, 500))
      message.success(editingId ? '编辑成功' : '新增成功')
      setModalOpen(false)
      actionRef.current?.reload()
    } catch {
      message.error('操作失败，请重试')
    } finally {
      setSubmitLoading(false)
    }
  }

  const columns: ProColumns<Admin>[] = [
    { title: 'ID', dataIndex: 'admin_id', width: 80 },
    { title: '用户名', dataIndex: 'username', width: 120 },
    { title: '真实姓名', dataIndex: 'real_name', width: 120 },
    { title: '手机号', dataIndex: 'phone', width: 130 },
    { title: '角色', dataIndex: 'role_id', width: 100, render: (_, r) => roleOptions.find((o) => o.value === r.role_id)?.label || '-' },
    { title: '状态', dataIndex: 'status', width: 90, render: (_, r) => (r.status === 1 ? <Tag color="green">启用</Tag> : <Tag color="red">禁用</Tag>) },
    { title: '创建时间', dataIndex: 'create_time', width: 180, render: (_, r) => fmtTime(r.create_time) },
    {
      title: '操作',
      valueType: 'option',
      width: 180,
      render: (_, r) => (
        <Space>
          <AuthButton permCode={PERM.ADMIN_EDIT}>
            <a onClick={() => handleEdit(r)}>编辑</a>
          </AuthButton>
          <a>重置密码</a>
        </Space>
      ),
    },
  ]

  const request = async (params: { current?: number; pageSize?: number }) => {
    const { current = 1, pageSize = 10 } = params
    const res = mockPage(mockList, current, pageSize)
    return { data: res.data as Admin[], total: res.total, success: true }
  }

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>账号管理</h2>
      <ProTable<Admin>
        rowKey="admin_id"
        actionRef={actionRef}
        columns={columns}
        request={request}
        search={false}
        locale={{ emptyText: <Empty description="暂无数据" /> }}
        pagination={{ defaultPageSize: 10, showSizeChanger: true }}
        toolBarRender={() => [
          <AuthButton key="add" permCode={PERM.ADMIN_EDIT}>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>新增管理员</Button>
          </AuthButton>,
        ]}
      />

      <Modal
        title={editingId ? '编辑管理员' : '新增管理员'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        confirmLoading={submitLoading}
        destroyOnClose
        width={480}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="username"
            label="用户名"
            rules={[
              { required: true, message: '请输入用户名' },
              { min: 3, max: 15, message: '用户名长度为3-15位' },
              { pattern: usernameReg, message: '仅支持字母、数字、下划线' },
            ]}
          >
            <Input placeholder="请输入用户名" disabled={!!editingId} />
          </Form.Item>
          {!editingId && (
            <Form.Item name="password" label="密码" rules={[{ required: true, message: '请输入密码' }, { min: 6, message: '密码至少6位' }]}>
              <Input.Password placeholder="请输入密码" />
            </Form.Item>
          )}
          <Form.Item name="real_name" label="真实姓名" rules={[{ required: true, message: '请输入真实姓名' }]}>
            <Input placeholder="请输入真实姓名" />
          </Form.Item>
          <Form.Item
            name="phone"
            label="手机号"
            rules={[
              { required: true, message: '请输入手机号' },
              { pattern: phoneReg, message: '请输入正确的手机号格式' },
            ]}
          >
            <Input placeholder="请输入手机号" />
          </Form.Item>
          <Form.Item name="role_id" label="所属角色" rules={[{ required: true, message: '请选择所属角色' }]}>
            <Select placeholder="请选择角色" options={roleOptions} allowClear />
          </Form.Item>
          <Form.Item name="status" label="状态" valuePropName="checked">
            <Switch checkedChildren="启用" unCheckedChildren="禁用" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
