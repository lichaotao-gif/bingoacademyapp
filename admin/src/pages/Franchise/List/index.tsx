import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Divider, Form, Input, InputNumber, Modal, Radio, Space, Steps, Table, Tag, Typography, Upload, message } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import type { UploadFile } from 'antd/es/upload/interface'
import { EyeOutlined, PayCircleOutlined, SafetyCertificateOutlined, UploadOutlined, UserAddOutlined } from '@ant-design/icons'
import {
  createPartnerManual,
  listPartners,
  manualTopUpPartner,
  syncAllPartnerAccountStatusToLocalStorage,
  type CreatePartnerManualInput,
  type FranchisePartnerDetail,
  type ReviewAttachment,
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
  incomplete: { text: '资料待补充', color: 'default' },
  rejected: { text: '已驳回', color: 'red' },
  pending_update: { text: '变更待审', color: 'gold' },
}

interface ManualPartnerFormValues extends Omit<CreatePartnerManualInput, 'businessLicenseAttachment' | 'venueFrontPhotoAttachment' | 'venueClassroomPhotoAttachment' | 'schoolPermitAttachment'> {
  businessLicenseFiles?: UploadFile[]
  venueFrontPhotoFiles?: UploadFile[]
  venueClassroomPhotoFiles?: UploadFile[]
  schoolPermitFiles?: UploadFile[]
}

const MAX_REVIEW_FILE_SIZE = 4 * 1024 * 1024

function normUpload(e: { fileList?: UploadFile[] } | UploadFile[] | undefined): UploadFile[] {
  if (Array.isArray(e)) return e.slice(-1)
  return (e?.fileList || []).slice(-1)
}

function beforeReviewUpload(file: File) {
  if (file.size > MAX_REVIEW_FILE_SIZE) {
    message.error('单个文件不能超过 4MB')
    return Upload.LIST_IGNORE
  }
  return false
}

async function fileListToAttachment(files: UploadFile[] | undefined): Promise<ReviewAttachment | null> {
  const file = files?.[0]
  const raw = file?.originFileObj
  if (!raw) return null
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(new Error('read'))
    reader.readAsDataURL(raw)
  })
  return { fileName: file.name || raw.name || '审核附件', dataUrl }
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
  const [manualStep, setManualStep] = useState(0)
  const [form] = Form.useForm<ManualPartnerFormValues>()
  const [topUpOpen, setTopUpOpen] = useState(false)
  const [topUpTarget, setTopUpTarget] = useState<FranchisePartnerDetail | null>(null)
  const [topUpForm] = Form.useForm<{ amount: number; remark?: string }>()

  const refresh = () => setTick((t) => t + 1)

  const openModal = () => {
    form.resetFields()
    setManualStep(0)
    form.setFieldsValue({
      openingBalance: 0,
      contactName: '管理员',
      businessScope: '教育培训',
      isAiTechTrack: 'yes',
      hasDedicatedClassroom: 'yes',
    })
    setModalOpen(true)
  }

  const submitManual = async () => {
    try {
      const v = await form.validateFields()
      const businessLicenseAttachment = await fileListToAttachment(v.businessLicenseFiles)
      const venueFrontPhotoAttachment = await fileListToAttachment(v.venueFrontPhotoFiles)
      const venueClassroomPhotoAttachment = await fileListToAttachment(v.venueClassroomPhotoFiles)
      const schoolPermitAttachment = await fileListToAttachment(v.schoolPermitFiles)
      const r = createPartnerManual({
        ...v,
        openingBalance: v.openingBalance != null ? Number(v.openingBalance) : 0,
        businessLicenseAttachment,
        venueFrontPhotoAttachment,
        venueClassroomPhotoAttachment,
        schoolPermitAttachment,
      })
      if (!r.ok || !r.partner) {
        message.error(r.msg || '添加失败')
        return
      }
      message.success('已添加加盟商并完成开户')
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
            <Typography.Paragraph style={{ marginBottom: 0 }}>
              <strong>推广码：</strong>
              {r.partner.refCode}
            </Typography.Paragraph>
          </div>
        ),
      })
    } catch {
      /* validate only */
    }
  }

  const submitManualWithoutQualification = async () => {
    try {
      const v = await form.validateFields(['orgName', 'contactPhone', 'initialPassword', 'region', 'contactName', 'partnerId', 'openingBalance'])
      const r = createPartnerManual({
        ...(v as ManualPartnerFormValues),
        openingBalance: v.openingBalance != null ? Number(v.openingBalance) : 0,
      })
      if (!r.ok || !r.partner) {
        message.error(r.msg || '添加失败')
        return
      }
      message.success('已创建加盟商账号，审核资料可后续补充')
      setModalOpen(false)
      refresh()
    } catch {
      /* validate only */
    }
  }

  const goManualStep2 = async () => {
    try {
      await form.validateFields(['orgName', 'contactPhone', 'initialPassword', 'region', 'contactName', 'partnerId', 'openingBalance'])
      setManualStep(1)
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
      width: 340,
      render: (_, r) => (
        <Space size="small" wrap>
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => navigate(`/franchise/detail?id=${encodeURIComponent(r.partnerId)}`)}>
            详情
          </Button>
          <Button
            type="link"
            size="small"
            icon={<SafetyCertificateOutlined />}
            onClick={() => navigate(`/franchise/detail?id=${encodeURIComponent(r.partnerId)}&tab=qualification`)}
          >
            资料
          </Button>
          <Button type="link" size="small" icon={<PayCircleOutlined />} onClick={() => openTopUp(r)}>
            充值
          </Button>
          {r.qualification.pendingReview && (r.qualificationStatus === 'pending' || r.qualificationStatus === 'pending_update') && (
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
              当前余额 {fmtMoney(topUpTarget.balance)}；推广码 {topUpTarget.refCode}。确认后将入账至该加盟商账户。
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
        width={760}
        destroyOnClose
        footer={
          manualStep === 0
            ? [
                <Button key="cancel" onClick={() => setModalOpen(false)}>
                  取消
                </Button>,
                <Button key="skip" onClick={submitManualWithoutQualification}>
                  直接开户，稍后补资料
                </Button>,
                <Button key="next" type="primary" onClick={goManualStep2}>
                  下一步：补审核资料
                </Button>,
              ]
            : [
                <Button key="back" onClick={() => setManualStep(0)}>
                  上一步
                </Button>,
                <Button key="skip" onClick={submitManualWithoutQualification}>
                  跳过资料并开户
                </Button>,
                <Button key="submit" type="primary" onClick={submitManual}>
                  保存资料并开户
                </Button>,
              ]
        }
      >
        <Typography.Paragraph type="secondary" style={{ marginBottom: 12, fontSize: 13 }}>
          第一步先创建登录账号；第二步审核资料可先跳过，后续由加盟商端提交或管理员补齐。
        </Typography.Paragraph>
        <Steps
          size="small"
          current={manualStep}
          items={[
            { title: '创建账号' },
            { title: '审核资料' },
          ]}
          style={{ marginBottom: 16 }}
        />
        <Form form={form} layout="vertical" style={{ marginTop: 8 }}>
          <div style={{ display: manualStep === 0 ? 'block' : 'none' }}>
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
          <Form.Item name="openingBalance" label="初始账户余额（元）">
            <InputNumber min={0} step={100} style={{ width: '100%' }} placeholder="0" />
          </Form.Item>
          </div>
          <div style={{ display: manualStep === 1 ? 'block' : 'none' }}>
          <Divider orientation="left" plain>
            审核资料（可跳过，后续补充）
          </Divider>
          <Typography.Paragraph type="secondary" style={{ fontSize: 13, marginTop: -4 }}>
            若本次不填写，账号会以「资料待补充」状态创建；加盟商登录后可在账号设置中提交，总部管理员也可后续补录。
          </Typography.Paragraph>
          <Form.Item name="legalRepresentative" label="法定代表人">
            <Input placeholder="与营业执照一致" />
          </Form.Item>
          <Form.Item name="address" label="机构地址">
            <Input placeholder="营业执照或实际经营地址" />
          </Form.Item>
          <Form.Item name="businessLicenseNumber" label="营业执照注册号 / 统一社会信用代码">
            <Input placeholder="例如：91310000MA1FLXXXXX" />
          </Form.Item>
          <Form.Item
            name="businessLicenseFiles"
            label="营业执照电子版"
            valuePropName="fileList"
            getValueFromEvent={normUpload}
          >
            <Upload beforeUpload={beforeReviewUpload} maxCount={1} accept="application/pdf,image/*">
              <Button icon={<UploadOutlined />}>上传营业执照</Button>
            </Upload>
          </Form.Item>
          <Form.Item name="businessLicenseCopy" label="营业执照复印件说明（选填）">
            <Input placeholder="例如：纸质件已由总部存档" />
          </Form.Item>
          <Form.Item name="businessScope" label="经营范围">
            <Input placeholder="默认：教育培训" />
          </Form.Item>
          <Divider orientation="left" plain>
            负责人信息
          </Divider>
          <Form.Item name="principalName" label="负责人姓名">
            <Input placeholder="实际运营负责人" />
          </Form.Item>
          <Form.Item
            name="principalPhone"
            label="负责人电话"
            rules={[
              { pattern: /^1\d{10}$/, message: '请输入 11 位手机号' },
            ]}
          >
            <Input placeholder="负责人联系电话" maxLength={11} />
          </Form.Item>
          <Form.Item name="principalIdNumber" label="负责人身份证号">
            <Input placeholder="用于总部审核留档" />
          </Form.Item>
          <Divider orientation="left" plain>
            场地与经营情况
          </Divider>
          <Form.Item
            name="venueFrontPhotoFiles"
            label="场地门头照片"
            valuePropName="fileList"
            getValueFromEvent={normUpload}
          >
            <Upload beforeUpload={beforeReviewUpload} maxCount={1} accept="image/*" listType="picture">
              <Button icon={<UploadOutlined />}>上传门头照片</Button>
            </Upload>
          </Form.Item>
          <Form.Item
            name="venueClassroomPhotoFiles"
            label="教室照片"
            valuePropName="fileList"
            getValueFromEvent={normUpload}
          >
            <Upload beforeUpload={beforeReviewUpload} maxCount={1} accept="image/*" listType="picture">
              <Button icon={<UploadOutlined />}>上传教室照片</Button>
            </Upload>
          </Form.Item>
          <Form.Item name="isAiTechTrack" label="是否属于 AI / 科技赛道">
            <Radio.Group>
              <Radio.Button value="yes">是</Radio.Button>
              <Radio.Button value="no">否</Radio.Button>
            </Radio.Group>
          </Form.Item>
          <Form.Item name="existingProjects" label="已开办项目">
            <Input.TextArea rows={2} placeholder="例如：少儿编程、机器人、科学实验、AI体验营" />
          </Form.Item>
          <Space.Compact style={{ width: '100%', gap: 12 }}>
            <Form.Item name="studentCount" label="现有生源数量" style={{ flex: 1 }}>
              <Input placeholder="例如：80 人" />
            </Form.Item>
            <Form.Item name="studentAgeRange" label="现有生源年龄段" style={{ flex: 1 }}>
              <Input placeholder="例如：6-14 岁" />
            </Form.Item>
          </Space.Compact>
          <Form.Item name="hasDedicatedClassroom" label="是否设立加盟专用教室">
            <Radio.Group>
              <Radio.Button value="yes">是</Radio.Button>
              <Radio.Button value="no">否</Radio.Button>
            </Radio.Group>
          </Form.Item>
          <Form.Item
            name="schoolPermitFiles"
            label="办学许可证（非必录，不审核）"
            valuePropName="fileList"
            getValueFromEvent={normUpload}
            extra="可上传留存，不作为强制审核项。"
          >
            <Upload beforeUpload={beforeReviewUpload} maxCount={1} accept="application/pdf,image/*">
              <Button icon={<UploadOutlined />}>上传办学许可证</Button>
            </Upload>
          </Form.Item>
          </div>
        </Form>
      </Modal>
    </div>
  )
}
