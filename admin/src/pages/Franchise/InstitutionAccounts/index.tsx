import React, { useMemo, useState } from 'react'
import {
  Button,
  Card,
  Checkbox,
  Form,
  Input,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Tabs,
  Tag,
  Typography,
  message,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { PlusOutlined } from '@ant-design/icons'
import { listPartners, type FranchisePartnerDetail } from '@/mock/franchisePartners'
// @ts-expect-error 主站 JS 工具模块无类型声明
import { addInstitutionAccount, deleteInstitutionAccount, deleteInstitutionRole, listInstitutionAccounts, listInstitutionRoles, resetInstitutionAccountPassword, upsertInstitutionRole } from '../../../../../src/utils/franchiseInstitutionAccounts.js'
// @ts-expect-error 主站常量
import { FRANCHISE_PARTNER_MENUS_FOR_ROLE } from '../../../../../src/constants/franchisePartnerPortalNav.js'

type RoleRow = { id: string; name: string; menuKeys: string[]; updatedAt?: string }
type AccountRow = {
  id: string
  name: string
  phone: string
  roleId: string
  roleName?: string
  createdAt?: string
}

const MENU_CHECKBOX_OPTIONS = FRANCHISE_PARTNER_MENUS_FOR_ROLE.map((x: { key: string; label: string }) => ({
  label: x.label,
  value: x.key,
}))

export default function FranchiseInstitutionAccounts() {
  const [tick, setTick] = useState(0)
  const partners = useMemo(() => {
    void tick
    return listPartners()
  }, [tick])

  const [partnerId, setPartnerId] = useState<string>(() => partners[0]?.partnerId || '')
  const selectedPartner = useMemo(
    () => partners.find((p) => p.partnerId === partnerId) || null,
    [partners, partnerId],
  )

  const roles = useMemo(() => {
    void tick
    if (!partnerId) return []
    return listInstitutionRoles(partnerId) as RoleRow[]
  }, [tick, partnerId])

  const accounts = useMemo(() => {
    void tick
    if (!partnerId) return []
    return listInstitutionAccounts(partnerId) as AccountRow[]
  }, [tick, partnerId])

  const refresh = () => setTick((t) => t + 1)

  const [roleOpen, setRoleOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<RoleRow | null>(null)
  const [roleForm] = Form.useForm<{ name: string; menuKeys: string[] }>()

  const [accOpen, setAccOpen] = useState(false)
  const [accForm] = Form.useForm<{ name: string; phone: string; password: string; roleId: string }>()

  const [resetOpen, setResetOpen] = useState(false)
  const [resetTarget, setResetTarget] = useState<AccountRow | null>(null)
  const [resetForm] = Form.useForm<{ password: string }>()

  React.useEffect(() => {
    if (partners.length && !partners.some((p) => p.partnerId === partnerId)) {
      setPartnerId(partners[0].partnerId)
    }
  }, [partners, partnerId])

  const openRoleCreate = () => {
    setEditingRole(null)
    roleForm.resetFields()
    roleForm.setFieldsValue({ name: '', menuKeys: ['dashboard'] })
    setRoleOpen(true)
  }

  const openRoleEdit = (row: RoleRow) => {
    setEditingRole(row)
    roleForm.setFieldsValue({ name: row.name, menuKeys: row.menuKeys?.length ? row.menuKeys : ['dashboard'] })
    setRoleOpen(true)
  }

  const submitRole = async () => {
    try {
      const v = await roleForm.validateFields()
      const r = upsertInstitutionRole(partnerId, {
        id: editingRole?.id,
        name: v.name,
        menuKeys: v.menuKeys,
      })
      if (!r.ok) {
        message.error(r.msg || '保存失败')
        return
      }
      message.success(editingRole ? '角色已更新' : '角色已创建')
      setRoleOpen(false)
      refresh()
    } catch {
      /* validate */
    }
  }

  const submitAccount = async () => {
    if (!selectedPartner) return
    try {
      const v = await accForm.validateFields()
      const r = addInstitutionAccount(partnerId, selectedPartner.refCode, selectedPartner.orgName, {
        name: v.name,
        phone: v.phone,
        password: v.password,
        roleId: v.roleId,
      })
      if (!r.ok) {
        message.error(r.msg || '添加失败')
        return
      }
      message.success('机构账号已添加，子账号可使用该手机号与密码登录加盟商工作台')
      setAccOpen(false)
      refresh()
    } catch {
      /* validate */
    }
  }

  const roleColumns: ColumnsType<RoleRow> = [
    { title: '角色名称', dataIndex: 'name', key: 'name' },
    {
      title: '可访问菜单',
      key: 'menus',
      ellipsis: true,
      render: (_, row) => {
        const labels = (row.menuKeys || [])
          .map((k) => FRANCHISE_PARTNER_MENUS_FOR_ROLE.find((x: { key: string }) => x.key === k)?.label || k)
          .join('、')
        return <Typography.Text ellipsis={{ tooltip: labels }}>{labels || '—'}</Typography.Text>
      },
    },
    {
      title: '操作',
      key: 'act',
      width: 160,
      render: (_, row) => (
        <Space>
          <Button type="link" size="small" onClick={() => openRoleEdit(row)}>
            编辑
          </Button>
          <Popconfirm title="确定删除该角色？" onConfirm={() => {
            const r = deleteInstitutionRole(partnerId, row.id)
            if (!r.ok) message.error(r.msg || '删除失败')
            else { message.success('已删除'); refresh() }
          }}>
            <Button type="link" size="small" danger>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  const accountColumns: ColumnsType<AccountRow> = [
    { title: '姓名', dataIndex: 'name', key: 'name', width: 120 },
    { title: '手机号', dataIndex: 'phone', key: 'phone', width: 130 },
    {
      title: '角色',
      key: 'role',
      width: 120,
      render: (_, row) => <Tag>{row.roleName || row.roleId}</Tag>,
    },
    { title: '创建时间', dataIndex: 'createdAt', key: 'createdAt', width: 200, ellipsis: true },
    {
      title: '操作',
      key: 'act',
      width: 200,
      render: (_, row) => (
        <Space>
          <Button
            type="link"
            size="small"
            onClick={() => {
              setResetTarget(row)
              resetForm.resetFields()
              setResetOpen(true)
            }}
          >
            重置密码
          </Button>
          <Popconfirm
            title="确定删除该机构账号？删除后无法登录。"
            onConfirm={() => {
              deleteInstitutionAccount(partnerId, row.id)
              message.success('已删除')
              refresh()
            }}
          >
            <Button type="link" size="small" danger>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <h2 style={{ marginTop: 0, marginBottom: 16 }}>机构账号</h2>

      <Card size="small" style={{ marginBottom: 16 }}>
        <Space wrap align="center">
          <span>选择加盟商机构</span>
          <Select
            style={{ minWidth: 280 }}
            value={partnerId || undefined}
            placeholder="请选择"
            options={partners.map((p: FranchisePartnerDetail) => ({
              value: p.partnerId,
              label: `${p.orgName}（${p.refCode}）`,
            }))}
            onChange={(v) => setPartnerId(v)}
            showSearch
            optionFilterProp="label"
          />
        </Space>
      </Card>

      {!partnerId ? (
        <Typography.Text type="secondary">暂无加盟商数据</Typography.Text>
      ) : (
        <Tabs
          items={[
            {
              key: 'roles',
              label: '角色与菜单权限',
              children: (
                <div>
                  <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button type="primary" icon={<PlusOutlined />} onClick={openRoleCreate}>
                      新建角色
                    </Button>
                  </div>
                  <Table<RoleRow> rowKey="id" columns={roleColumns} dataSource={roles} pagination={false} />
                </div>
              ),
            },
            {
              key: 'accounts',
              label: '机构子账号',
              children: (
                <div>
                  <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={() => {
                        if (!roles.length) {
                          message.warning('请先在本页「角色与菜单权限」中创建至少一个角色')
                          return
                        }
                        accForm.resetFields()
                        setAccOpen(true)
                      }}
                    >
                      添加账号
                    </Button>
                  </div>
                  <Table<AccountRow> rowKey="id" columns={accountColumns} dataSource={accounts} pagination={false} scroll={{ x: 720 }} />
                </div>
              ),
            },
          ]}
        />
      )}

      <Modal
        title={editingRole ? '编辑角色' : '新建角色'}
        open={roleOpen}
        onCancel={() => setRoleOpen(false)}
        onOk={submitRole}
        width={560}
        destroyOnClose
      >
        <Form form={roleForm} layout="vertical" style={{ marginTop: 8 }}>
          <Form.Item name="name" label="角色名称" rules={[{ required: true, message: '请输入角色名称' }]}>
            <Input placeholder="如：班主任、合伙人" maxLength={32} />
          </Form.Item>
          <Form.Item
            name="menuKeys"
            label="可访问菜单（加盟商工作台侧栏）"
            rules={[
              { required: true, message: '请勾选菜单' },
              { type: 'array', min: 1, message: '至少勾选一个菜单' },
            ]}
          >
            <Checkbox.Group options={MENU_CHECKBOX_OPTIONS} style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 360, overflow: 'auto' }} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal title="添加机构子账号" open={accOpen} onCancel={() => setAccOpen(false)} onOk={submitAccount} destroyOnClose>
        <Form form={accForm} layout="vertical" style={{ marginTop: 8 }}>
          <Form.Item name="name" label="姓名" rules={[{ required: true }]}>
            <Input maxLength={32} />
          </Form.Item>
          <Form.Item name="phone" label="手机号" rules={[{ required: true }, { pattern: /^\d{11}$/, message: '11位数字' }]}>
            <Input maxLength={11} placeholder="登录账号，勿与机构主账号手机号重复" />
          </Form.Item>
          <Form.Item name="password" label="初始密码" rules={[{ required: true }, { min: 6, message: '至少6位' }]}>
            <Input.Password placeholder="至少 6 位，请妥善保管" />
          </Form.Item>
          <Form.Item name="roleId" label="角色" rules={[{ required: true, message: '请选择角色' }]}>
            <Select
              options={roles.map((r) => ({ value: r.id, label: r.name }))}
              placeholder="选择角色"
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={`重置密码：${resetTarget?.name || ''}`}
        open={resetOpen}
        onCancel={() => setResetOpen(false)}
        onOk={async () => {
          try {
            const v = await resetForm.validateFields()
            if (!resetTarget) return
            const r = resetInstitutionAccountPassword(partnerId, resetTarget.id, v.password)
            if (!r.ok) message.error(r.msg || '失败')
            else {
              message.success('密码已重置')
              setResetOpen(false)
              refresh()
            }
          } catch {
            /* validate */
          }
        }}
        destroyOnClose
      >
        <Form form={resetForm} layout="vertical">
          <Form.Item name="password" label="新密码" rules={[{ required: true }, { min: 6, message: '至少6位' }]}>
            <Input.Password />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
