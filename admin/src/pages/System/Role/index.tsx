import { useState } from 'react'
import { ProTable } from '@ant-design/pro-components'
import type { ProColumns } from '@ant-design/pro-components'
import { Button, Space, Tag, Modal, Tree, message, Empty } from 'antd'
import { mockPage } from '@/api/mock'

interface Role {
  role_id: number
  role_name: string
  role_code: string
  status: number
  create_time: string
}

const mockList: Role[] = [
  { role_id: 1, role_name: '超级管理员', role_code: 'super_admin', status: 1, create_time: '2024-01-01 10:00:00' },
  { role_id: 2, role_name: '运营管理员', role_code: 'ops', status: 1, create_time: '2024-01-15 09:00:00' },
]

const permTree = [
  { key: '1', title: '系统管理', children: [
    { key: '1-1', title: '账号管理', children: [{ key: '1-1-1', title: '查看' }, { key: '1-1-2', title: '新增/编辑' }] },
    { key: '1-2', title: '角色权限', children: [{ key: '1-2-1', title: '查看' }, { key: '1-2-2', title: '分配权限' }] },
    { key: '1-3', title: '操作日志', children: [{ key: '1-3-1', title: '查看' }] },
  ]},
  { key: '2', title: '学员管理', children: [{ key: '2-1', title: '查看' }, { key: '2-2', title: '编辑' }] },
  { key: '3', title: '课程管理', children: [{ key: '3-1', title: '查看' }, { key: '3-2', title: '编辑' }] },
]

export default function SystemRole() {
  const [permModalOpen, setPermModalOpen] = useState(false)
  const [currentRole, setCurrentRole] = useState<Role | null>(null)
  const [checkedKeys, setCheckedKeys] = useState<React.Key[]>(['1', '1-1', '1-1-1', '1-1-2'])
  const [submitLoading, setSubmitLoading] = useState(false)

  const handleAssignPerm = (record: Role) => {
    setCurrentRole(record)
    setCheckedKeys(record.role_id === 1 ? ['1', '1-1', '1-1-1', '1-1-2', '1-2', '1-2-1', '1-2-2', '1-3', '1-3-1', '2', '2-1', '2-2', '3', '3-1', '3-2'] : ['1', '1-1', '1-1-1'])
    setPermModalOpen(true)
  }

  const handlePermSubmit = async () => {
    setSubmitLoading(true)
    try {
      await new Promise((r) => setTimeout(r, 500))
      message.success('权限分配成功')
      setPermModalOpen(false)
    } finally {
      setSubmitLoading(false)
    }
  }

  const columns: ProColumns<Role>[] = [
    { title: 'ID', dataIndex: 'role_id', width: 80 },
    { title: '角色名称', dataIndex: 'role_name', width: 140 },
    { title: '角色编码', dataIndex: 'role_code', width: 140 },
    { title: '状态', dataIndex: 'status', width: 90, render: (_, r) => (r.status === 1 ? <Tag color="green">启用</Tag> : <Tag color="red">禁用</Tag>) },
    { title: '创建时间', dataIndex: 'create_time', width: 180 },
    {
      title: '操作',
      valueType: 'option',
      width: 120,
      render: (_, r) => (
        <Space>
          <a onClick={() => handleAssignPerm(r)}>分配权限</a>
        </Space>
      ),
    },
  ]

  const request = async (params: { current?: number; pageSize?: number }) => {
    const { current = 1, pageSize = 10 } = params
    const res = mockPage(mockList, current, pageSize)
    return { data: res.data as Role[], total: res.total, success: true }
  }

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>角色权限</h2>
      <ProTable<Role>
        rowKey="role_id"
        columns={columns}
        request={request}
        search={false}
        locale={{ emptyText: <Empty description="暂无数据" /> }}
        pagination={{ defaultPageSize: 10, showSizeChanger: true }}
      />

      <Modal
        title={`分配权限 - ${currentRole?.role_name || ''}`}
        open={permModalOpen}
        onOk={handlePermSubmit}
        onCancel={() => setPermModalOpen(false)}
        confirmLoading={submitLoading}
        width={400}
      >
        <Tree
          checkable
          defaultExpandAll
          treeData={permTree}
          checkedKeys={checkedKeys}
          onCheck={(keys) => setCheckedKeys(Array.isArray(keys) ? keys : keys.checked)}
          style={{ marginTop: 16 }}
        />
      </Modal>
    </div>
  )
}
