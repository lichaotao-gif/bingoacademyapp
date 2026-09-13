import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Button,
  Form,
  Input,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { EyeOutlined, KeyOutlined, PlusOutlined } from '@ant-design/icons'
import {
  SCHOOL_LOGIN_PATH,
  SCHOOL_STATUS,
  createSchool,
  listSchools,
  resetOwnerPassword,
  setSchoolStatus,
  updateSchool,
  type CreateSchoolInput,
  type SchoolRow,
} from '@/mock/schools'
import { fmtTime, maskPhone } from '@/utils/format'

const STATUS_TAG: Record<string, { text: string; color: string }> = {
  active: { text: '已启用', color: 'green' },
  disabled: { text: '已停用', color: 'red' },
}

function loginUrl() {
  return `${window.location.origin}${SCHOOL_LOGIN_PATH}`
}

export default function SchoolList() {
  const navigate = useNavigate()
  const [tick, setTick] = useState(0)
  const refresh = () => setTick((n) => n + 1)

  const [keyword, setKeyword] = useState('')
  const [region, setRegion] = useState('')
  const [status, setStatus] = useState<string | undefined>(undefined)

  const data = useMemo(() => {
    void tick
    return listSchools({ keyword, region, status })
  }, [tick, keyword, region, status])

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<SchoolRow | null>(null)
  const [form] = Form.useForm<CreateSchoolInput>()

  const [pwdOpen, setPwdOpen] = useState(false)
  const [pwdTarget, setPwdTarget] = useState<SchoolRow | null>(null)
  const [pwdForm] = Form.useForm<{ password: string }>()

  const openCreate = () => {
    setEditing(null)
    form.resetFields()
    setFormOpen(true)
  }

  const openEdit = (row: SchoolRow) => {
    setEditing(row)
    form.setFieldsValue({
      name: row.name,
      province: row.province,
      city: row.city,
      district: row.district,
      address: row.address,
      contactName: row.contactName,
      contactPhone: row.contactPhone,
      remark: row.remark,
    })
    setFormOpen(true)
  }

  const submitForm = async () => {
    try {
      const v = await form.validateFields()
      if (editing) {
        const r = updateSchool(editing.id, v)
        if (!r.ok) {
          message.error(r.msg || '保存失败')
          return
        }
        message.success('学校资料已更新')
      } else {
        const r = createSchool(v)
        if (!r.ok) {
          message.error(r.msg || '开户失败')
          return
        }
        Modal.success({
          title: '学校已开户',
          content: (
            <div>
              <p style={{ marginBottom: 8 }}>请将以下登录地址与账号发送给学校总管理员：</p>
              <Typography.Paragraph copyable={{ text: loginUrl() }} style={{ marginBottom: 4 }}>
                {loginUrl()}
              </Typography.Paragraph>
              <Typography.Text type="secondary">
                登录账号 {v.ownerPhone}，初始密码请线下告知并提醒首次登录后修改。
              </Typography.Text>
            </div>
          ),
        })
      }
      setFormOpen(false)
      setEditing(null)
      refresh()
    } catch {
      /* validate only */
    }
  }

  const toggleStatus = (row: SchoolRow) => {
    const next = row.status === SCHOOL_STATUS.ACTIVE ? SCHOOL_STATUS.DISABLED : SCHOOL_STATUS.ACTIVE
    const r = setSchoolStatus(row.id, next)
    if (!r.ok) {
      message.error(r.msg || '操作失败')
      return
    }
    message.success(next === SCHOOL_STATUS.ACTIVE ? '已启用该学校' : '已停用该学校，全部后台账号将无法登录')
    refresh()
  }

  const submitPwd = async () => {
    if (!pwdTarget) return
    try {
      const v = await pwdForm.validateFields()
      const r = resetOwnerPassword(pwdTarget.id, v.password)
      if (!r.ok) {
        message.error(r.msg || '重置失败')
        return
      }
      message.success('总管理员密码已重置，请线下告知学校')
      setPwdOpen(false)
      setPwdTarget(null)
      refresh()
    } catch {
      /* validate only */
    }
  }

  const columns: ColumnsType<SchoolRow> = [
    { title: '学校名称', dataIndex: 'name', key: 'name', width: 200, ellipsis: true },
    { title: '所在区域', dataIndex: 'region', key: 'region', width: 180, ellipsis: true },
    {
      title: '联系人',
      key: 'contact',
      width: 150,
      render: (_, r) => (
        <span>
          {r.contactName || '-'}
          <br />
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            {maskPhone(r.contactPhone)}
          </Typography.Text>
        </span>
      ),
    },
    {
      title: '总管理员账号',
      key: 'owner',
      width: 150,
      render: (_, r) => (
        <span>
          {r.ownerName}
          <br />
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            {maskPhone(r.ownerPhone)}
          </Typography.Text>
        </span>
      ),
    },
    { title: '授权课程', dataIndex: 'grantedCourseCount', key: 'grantedCourseCount', width: 90 },
    {
      title: '老师 / 班级 / 学生',
      key: 'scale',
      width: 140,
      render: (_, r) => `${r.teacherCount} / ${r.classCount} / ${r.studentCount}`,
    },
    {
      title: '状态',
      key: 'status',
      width: 90,
      render: (_, r) => <Tag color={STATUS_TAG[r.status]?.color}>{STATUS_TAG[r.status]?.text}</Tag>,
    },
    {
      title: '开户时间',
      key: 'createdAt',
      width: 170,
      render: (_, r) => fmtTime(r.createdAt),
    },
    {
      title: '操作',
      key: 'act',
      fixed: 'right',
      width: 300,
      render: (_, r) => (
        <Space size="small" wrap>
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/school/detail?id=${encodeURIComponent(r.id)}`)}
          >
            详情
          </Button>
          <Button type="link" size="small" onClick={() => openEdit(r)}>
            编辑
          </Button>
          <Button
            type="link"
            size="small"
            icon={<KeyOutlined />}
            onClick={() => {
              setPwdTarget(r)
              pwdForm.resetFields()
              setPwdOpen(true)
            }}
          >
            重置密码
          </Button>
          <Popconfirm
            title={r.status === SCHOOL_STATUS.ACTIVE ? '停用该学校？' : '启用该学校？'}
            description={
              r.status === SCHOOL_STATUS.ACTIVE
                ? '停用后该校总管理员与老师均无法登录，学生学习记录与证书保留。'
                : '启用后该校后台账号可正常登录。'
            }
            onConfirm={() => toggleStatus(r)}
          >
            <Button type="link" size="small" danger={r.status === SCHOOL_STATUS.ACTIVE}>
              {r.status === SCHOOL_STATUS.ACTIVE ? '停用' : '启用'}
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: 16,
          marginBottom: 16,
        }}
      >
        <div>
          <h2 style={{ marginTop: 0, marginBottom: 8 }}>学校列表</h2>
          <p style={{ color: '#666', marginBottom: 0 }}>
            官网为学校开户并开通总管理员账号，学校自行管理老师、班级与学生；登录地址统一为 {SCHOOL_LOGIN_PATH}。
          </p>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          新建学校
        </Button>
      </div>

      <Space wrap style={{ marginBottom: 16 }}>
        <Input.Search
          allowClear
          placeholder="学校名称 / 总管理员手机号"
          style={{ width: 240 }}
          onSearch={setKeyword}
          onChange={(e) => {
            if (!e.target.value) setKeyword('')
          }}
        />
        <Input
          allowClear
          placeholder="区域关键词，如 杭州"
          style={{ width: 180 }}
          value={region}
          onChange={(e) => setRegion(e.target.value)}
        />
        <Select
          allowClear
          placeholder="状态"
          style={{ width: 140 }}
          value={status}
          onChange={setStatus}
          options={[
            { value: SCHOOL_STATUS.ACTIVE, label: '已启用' },
            { value: SCHOOL_STATUS.DISABLED, label: '已停用' },
          ]}
        />
      </Space>

      <Table<SchoolRow>
        rowKey="id"
        columns={columns}
        dataSource={data}
        pagination={{ pageSize: 10 }}
        scroll={{ x: 1500 }}
        locale={{ emptyText: '暂无学校' }}
      />

      <Modal
        title={editing ? `编辑学校 · ${editing.name}` : '新建学校（开户并开通总管理员）'}
        open={formOpen}
        onCancel={() => {
          setFormOpen(false)
          setEditing(null)
        }}
        onOk={submitForm}
        okText={editing ? '保存' : '开户'}
        width={680}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="学校名称" rules={[{ required: true, message: '请填写学校名称' }]}>
            <Input placeholder="如：缤果AI实验学校" maxLength={40} />
          </Form.Item>
          <Space.Compact block>
            <Form.Item name="province" label="省" rules={[{ required: true, message: '必填' }]} style={{ flex: 1 }}>
              <Input placeholder="浙江省" />
            </Form.Item>
            <Form.Item name="city" label="市" rules={[{ required: true, message: '必填' }]} style={{ flex: 1 }}>
              <Input placeholder="杭州市" />
            </Form.Item>
            <Form.Item name="district" label="区 / 县" rules={[{ required: true, message: '必填' }]} style={{ flex: 1 }}>
              <Input placeholder="西湖区" />
            </Form.Item>
          </Space.Compact>
          <Form.Item name="address" label="详细地址" rules={[{ required: true, message: '请填写详细地址' }]}>
            <Input placeholder="街道门牌" maxLength={80} />
          </Form.Item>
          <Space.Compact block>
            <Form.Item name="contactName" label="联系人" rules={[{ required: true, message: '必填' }]} style={{ flex: 1 }}>
              <Input placeholder="校方对接人" maxLength={20} />
            </Form.Item>
            <Form.Item
              name="contactPhone"
              label="联系电话"
              rules={[{ required: true, pattern: /^1\d{10}$/, message: '请填写正确的手机号' }]}
              style={{ flex: 1 }}
            >
              <Input placeholder="11 位手机号" maxLength={11} />
            </Form.Item>
          </Space.Compact>
          {editing ? null : (
            <>
              <Typography.Text strong>总管理员账号</Typography.Text>
              <Typography.Paragraph type="secondary" style={{ fontSize: 12, margin: '4px 0 12px' }}>
                开户后学校总管理员用该手机号登录 {SCHOOL_LOGIN_PATH}，可自行创建老师子账号。
              </Typography.Paragraph>
              <Space.Compact block>
                <Form.Item name="ownerName" label="姓名" style={{ flex: 1 }}>
                  <Input placeholder="默认「学校总管理员」" maxLength={20} />
                </Form.Item>
                <Form.Item
                  name="ownerPhone"
                  label="登录手机号"
                  rules={[{ required: true, pattern: /^1\d{10}$/, message: '请填写正确的手机号' }]}
                  style={{ flex: 1 }}
                >
                  <Input placeholder="11 位手机号" maxLength={11} />
                </Form.Item>
                <Form.Item
                  name="ownerPassword"
                  label="初始密码"
                  rules={[{ required: true, min: 6, message: '至少 6 位' }]}
                  style={{ flex: 1 }}
                >
                  <Input placeholder="至少 6 位" maxLength={20} />
                </Form.Item>
              </Space.Compact>
            </>
          )}
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} maxLength={120} placeholder="合作背景、特殊约定等" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={pwdTarget ? `重置总管理员密码 · ${pwdTarget.name}` : '重置总管理员密码'}
        open={pwdOpen}
        onCancel={() => {
          setPwdOpen(false)
          setPwdTarget(null)
        }}
        onOk={submitPwd}
        okText="确认重置"
        destroyOnClose
      >
        <Typography.Paragraph type="secondary" style={{ fontSize: 13 }}>
          将重置 {pwdTarget?.ownerName}（{maskPhone(pwdTarget?.ownerPhone)}）的登录密码，老师子账号不受影响。
        </Typography.Paragraph>
        <Form form={pwdForm} layout="vertical">
          <Form.Item name="password" label="新密码" rules={[{ required: true, min: 6, message: '至少 6 位' }]}>
            <Input placeholder="至少 6 位" maxLength={20} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
