import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Form, Input, InputNumber, Modal, Space, Table, Tag, Typography, message } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { EyeOutlined, PayCircleOutlined, SafetyCertificateOutlined, UserAddOutlined } from '@ant-design/icons'
import {
  createPartnerManual,
  listPartners,
  manualTopUpPartner,
  syncAllPartnerAccountStatusToLocalStorage,
  type CreatePartnerManualInput,
  type FranchisePartnerDetail,
} from '@/mock/franchisePartners'
import { fmtMoney, maskPhone } from '@/utils/format'

const ACCOUNT_TAG: Record<string, { text: string; color: string }> = {
  normal: { text: '正常', color: 'green' },
  pending_qualification: { text: '待准入', color: 'orange' },
  frozen: { text: '已冻结', color: 'red' },
}

const QUAL_TAG: Record<string, { text: string; color: string }> = {
  approved: { text: '资质已通过', color: 'green' },
  pending: { text: '待审核', color: 'blue' },
  rejected: { text: '已驳回', color: 'red' },
  pending_update: { text: '变更待审', color: 'gold' },
}

export default function FranchisePartnerList() {
  const navigate = useNavigate()
  const [tick, setTick] = useState(0)

  useEffect(() => {
    syncAllPartnerAccountStatusToLocalStorage()
  }, [])
  const data = useMemo(() => {
    void tick
    return listPartners()
  }, [tick])

  const [modalOpen, setModalOpen] = useState(false)
  const [form] = Form.useForm<CreatePartnerManualInput>()
  const [topUpOpen, setTopUpOpen] = useState(false)
  const [topUpTarget, setTopUpTarget] = useState<FranchisePartnerDetail | null>(null)
  const [topUpForm] = Form.useForm<{ amount: number; remark?: string }>()

  const refresh = () => setTick((t) => t + 1)

  const openModal = () => {
    form.resetFields()
    form.setFieldsValue({
      openingBalance: 0,
      contactName: '管理员',
      businessScope: '教育培训',
    })
    setModalOpen(true)
  }

  const submitManual = async () => {
    try {
      const v = await form.validateFields()
      const r = createPartnerManual({
        ...v,
        openingBalance: v.openingBalance != null ? Number(v.openingBalance) : 0,
      })
      if (!r.ok || !r.partner) {
        message.error(r.msg || '添加失败')
        return
      }
      message.success('已添加加盟商并完成演示开户（见下方说明）')
      setModalOpen(false)
      refresh()
      Modal.info({
        title: '开户信息（请告知加盟商）',
        width: 480,
        content: (
          <div style={{ marginTop: 12 }}>
            <Typography.Paragraph style={{ marginBottom: 8 }}>
              <strong>登录手机号：</strong>
              {r.partner.contactPhone}
            </Typography.Paragraph>
            <Typography.Paragraph style={{ marginBottom: 8 }}>
              <strong>初始密码：</strong>为您在表单中设置的密码
            </Typography.Paragraph>
            <Typography.Paragraph style={{ marginBottom: 8 }}>
              <strong>推广码：</strong>
              {r.partner.refCode}
            </Typography.Paragraph>
            <Typography.Paragraph type="secondary" style={{ marginBottom: 0, fontSize: 13 }}>
              演示环境：登录档案写入当前浏览器本地存储。请与「加盟商前台」使用<strong>同一站点域名</strong>访问后台；若本地开发后台与前台端口不同，前台将无法读到本次开户，需改为同源部署或在同一应用域名下操作。
            </Typography.Paragraph>
          </div>
        ),
      })
    } catch {
      /* validate only */
    }
  }

  const openTopUp = (row: FranchisePartnerDetail) => {
    setTopUpTarget(row)
    topUpForm.resetFields()
    setTopUpOpen(true)
  }

  const submitTopUp = async () => {
    if (!topUpTarget) return
    try {
      const v = await topUpForm.validateFields()
      const r = manualTopUpPartner(topUpTarget.partnerId, Number(v.amount), v.remark)
      if (!r.ok) {
        message.error(r.msg || '充值失败')
        return
      }
      message.success(`充值成功，当前余额 ${fmtMoney(r.balanceAfter ?? 0)}`)
      setTopUpOpen(false)
      setTopUpTarget(null)
      refresh()
    } catch {
      /* validate */
    }
  }

  const columns: ColumnsType<FranchisePartnerDetail> = [
    { title: '机构名称', dataIndex: 'orgName', key: 'orgName', width: 220, ellipsis: true },
    { title: '推广码', dataIndex: 'refCode', key: 'refCode', width: 100 },
    { title: '区域', dataIndex: 'region', key: 'region', width: 120 },
    {
      title: '账户',
      key: 'account',
      width: 110,
      render: (_, r) => <Tag color={ACCOUNT_TAG[r.accountStatus]?.color}>{ACCOUNT_TAG[r.accountStatus]?.text}</Tag>,
    },
    {
      title: '资质',
      key: 'qual',
      width: 110,
      render: (_, r) => <Tag color={QUAL_TAG[r.qualificationStatus]?.color}>{QUAL_TAG[r.qualificationStatus]?.text}</Tag>,
    },
    {
      title: '余额',
      key: 'balance',
      width: 120,
      render: (_, r) => <span style={{ fontVariantNumeric: 'tabular-nums' }}>{fmtMoney(r.balance)}</span>,
    },
    {
      title: '班级 / 学员',
      key: 'cs',
      width: 120,
      render: (_, r) => `${r.classes.length} / ${r.classes.reduce((s, c) => s + c.studentCount, 0)}`,
    },
    {
      title: '本月订单',
      dataIndex: 'ordersMonthCount',
      key: 'ordersMonthCount',
      width: 90,
    },
    {
      title: '联系人',
      key: 'phone',
      width: 120,
      render: (_, r) => maskPhone(r.contactPhone),
    },
    {
      title: '操作',
      key: 'act',
      fixed: 'right',
      width: 280,
      render: (_, r) => (
        <Space size="small" wrap>
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => navigate(`/franchise/detail?id=${encodeURIComponent(r.partnerId)}`)}>
            详情
          </Button>
          <Button type="link" size="small" icon={<PayCircleOutlined />} onClick={() => openTopUp(r)}>
            充值
          </Button>
          {(r.qualificationStatus === 'pending' || r.qualificationStatus === 'pending_update') && (
            <Button
              type="link"
              size="small"
              icon={<SafetyCertificateOutlined />}
              onClick={() => navigate(`/franchise/qualification?focus=${encodeURIComponent(r.partnerId)}`)}
            >
              审核
            </Button>
          )}
        </Space>
      ),
    },
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 16 }}>
        <div>
          <h2 style={{ marginBottom: 8, marginTop: 0 }}>加盟商列表</h2>
          <p style={{ color: '#666', marginBottom: 0 }}>
            总部统一查看加盟商账户状态、资质结论与班级规模；余额与消费明细、班级列表请在「详情」中查看。
          </p>
        </div>
        <Button type="primary" icon={<UserAddOutlined />} onClick={openModal}>
          手动添加加盟商
        </Button>
      </div>
      <Table<FranchisePartnerDetail>
        rowKey="partnerId"
        columns={columns}
        dataSource={data}
        pagination={{ pageSize: 10 }}
        scroll={{ x: 1180 }}
      />
      <Modal
        title={topUpTarget ? `手动充值 · ${topUpTarget.orgName}` : '手动充值'}
        open={topUpOpen}
        onCancel={() => {
          setTopUpOpen(false)
          setTopUpTarget(null)
        }}
        onOk={submitTopUp}
        destroyOnClose
        okText="确认充值"
      >
        {topUpTarget ? (
          <>
            <Typography.Paragraph type="secondary" style={{ marginBottom: 12, fontSize: 13 }}>
              当前余额 {fmtMoney(topUpTarget.balance)}；推广码 {topUpTarget.refCode}。演示环境将同步写入加盟商工作台本地余额（须同源）。
            </Typography.Paragraph>
            <Form form={topUpForm} layout="vertical">
              <Form.Item name="amount" label="充值金额（元）" rules={[{ required: true, message: '请输入金额' }]}>
                <InputNumber min={0.01} step={100} style={{ width: '100%' }} placeholder="大于 0" />
              </Form.Item>
              <Form.Item name="remark" label="备注（可选）">
                <Input placeholder="如：活动补贴、预付款" maxLength={80} />
              </Form.Item>
            </Form>
          </>
        ) : null}
      </Modal>
      <Modal
        title="手动添加加盟商（快速开户）"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={submitManual}
        width={560}
        destroyOnClose
        okText="保存并开户"
      >
        <Typography.Paragraph type="secondary" style={{ marginBottom: 12, fontSize: 13 }}>
          将写入后台加盟商列表，并在演示环境下写入登录手机号、初始密码与推广档案，便于对方使用加盟前台登录。
        </Typography.Paragraph>
        <Form form={form} layout="vertical" style={{ marginTop: 8 }}>
          <Form.Item name="orgName" label="机构名称" rules={[{ required: true, message: '必填' }]}>
            <Input placeholder="与资质一致或常用对外名称" />
          </Form.Item>
          <Form.Item
            name="contactPhone"
            label="登录手机号（11 位）"
            rules={[
              { required: true, message: '必填' },
              { pattern: /^1\d{10}$/, message: '请输入 11 位手机号' },
            ]}
          >
            <Input placeholder="加盟商用这个手机号登录前台" maxLength={11} />
          </Form.Item>
          <Form.Item name="initialPassword" label="初始登录密码" rules={[{ required: true, message: '必填' }, { min: 6, message: '至少 6 位' }]}>
            <Input.Password placeholder="至少 6 位，请告知对方首次登录使用" />
          </Form.Item>
          <Form.Item name="region" label="区域" rules={[{ required: true, message: '必填' }]}>
            <Input placeholder="例如：华东 · 杭州" />
          </Form.Item>
          <Form.Item name="contactName" label="联系人称呼">
            <Input placeholder="默认：管理员" />
          </Form.Item>
          <Form.Item name="partnerId" label="加盟商 ID（可选，留空自动生成）">
            <Input placeholder="如 fp-m-sh001，仅字母数字 ._-" />
          </Form.Item>
          <Form.Item name="refCode" label="推广码（可选，留空自动生成）">
            <Input placeholder="对外推广绑定用" />
          </Form.Item>
          <Form.Item name="openingBalance" label="初始账户余额（元，演示）">
            <InputNumber min={0} step={100} style={{ width: '100%' }} placeholder="0" />
          </Form.Item>
          <Typography.Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
            资质快照（可后补）
          </Typography.Text>
          <Form.Item name="legalRepresentative" label="法定代表人">
            <Input placeholder="选填，默认待补充" />
          </Form.Item>
          <Form.Item name="address" label="地址">
            <Input placeholder="选填" />
          </Form.Item>
          <Form.Item name="businessLicenseNumber" label="统一社会信用代码">
            <Input placeholder="选填" />
          </Form.Item>
          <Form.Item name="businessScope" label="经营范围">
            <Input placeholder="默认：教育培训" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
