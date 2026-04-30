import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  Button,
  Card,
  Descriptions,
  Input,
  InputNumber,
  Progress,
  Space,
  Switch,
  Table,
  Tabs,
  Tag,
  Typography,
  message,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { ArrowLeftOutlined } from '@ant-design/icons'
import {
  clearPartnerHqCourseDiscounts,
  DEFAULT_WORKSPACE_DISCOUNT_RATES,
  getPartnerHqCourseDiscounts,
  HQ_FRANCHISE_COURSE_CATALOG,
  rateToZhLabel,
  savePartnerHqCourseDiscounts,
} from '@/mock/franchiseHqCourseDiscounts'
import {
  getPartner,
  setPartnerAccountStatus,
  syncAllPartnerAccountStatusToLocalStorage,
  updatePartnerConclusion,
  type ClassBrief,
  type FranchisePartnerDetail,
  type LedgerRow,
} from '@/mock/franchisePartners'
import { fmtMoney, fmtTime, maskPhone } from '@/utils/format'

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

function QualificationPanel({ p, onGoReview }: { p: FranchisePartnerDetail; onGoReview: () => void }) {
  const q = p.qualification
  const labelMap: Record<string, string> = {
    orgName: '机构名称',
    legalRepresentative: '法定代表人',
    address: '地址',
    contactPhone: '联系电话',
    businessLicenseNumber: '统一社会信用代码',
    businessScope: '经营范围',
  }
  const rows = (snap: Record<string, string>) =>
    Object.entries(snap).map(([k, v]) => ({ key: k, label: labelMap[k] ?? k, value: v || '-' }))

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Descriptions bordered size="small" column={1}>
        <Descriptions.Item label="资质状态">
          <Tag color={QUAL_TAG[p.qualificationStatus]?.color}>{QUAL_TAG[p.qualificationStatus]?.text}</Tag>
        </Descriptions.Item>
        {q.lastApprovedAt && (
          <Descriptions.Item label="最近通过时间">{fmtTime(q.lastApprovedAt)}</Descriptions.Item>
        )}
        {q.rejectReason && (
          <Descriptions.Item label={p.qualificationStatus === 'approved' ? '变更驳回说明' : '准入驳回原因'}>
            <Typography.Text type="danger">{q.rejectReason}</Typography.Text>
          </Descriptions.Item>
        )}
      </Descriptions>

      <Card size="small" title="当前已通过快照">
        <Descriptions bordered size="small" column={1}>
          {rows(q.approvedSnapshot).map((r) => (
            <Descriptions.Item key={r.key} label={r.label}>
              {r.value}
            </Descriptions.Item>
          ))}
          {Object.keys(q.approvedSnapshot).length === 0 && (
            <Typography.Text type="secondary">暂无 — 首次入网待审通过后生成</Typography.Text>
          )}
        </Descriptions>
      </Card>

      {q.pendingReview && (
        <Card size="small" title="待审核提交" extra={<Tag color="processing">待总部处理</Tag>}>
          <Typography.Paragraph type="secondary" style={{ marginBottom: 12 }}>
            提交时间：{fmtTime(q.pendingReview.submittedAt)}
          </Typography.Paragraph>
          <Descriptions bordered size="small" column={1}>
            {rows(q.pendingReview.snapshot).map((r) => (
              <Descriptions.Item key={r.key} label={r.label}>
                {r.value}
              </Descriptions.Item>
            ))}
          </Descriptions>
          <Button type="primary" style={{ marginTop: 16 }} onClick={onGoReview}>
            去审核页处理
          </Button>
        </Card>
      )}
    </Space>
  )
}

function CourseDiscountHqPanel({
  partnerId,
  onSaved,
}: {
  partnerId: string
  onSaved: () => void
}) {
  const [draft, setDraft] = useState<Record<string, number>>({})

  useEffect(() => {
    const hq = getPartnerHqCourseDiscounts(partnerId)
    const next: Record<string, number> = {}
    for (const c of HQ_FRANCHISE_COURSE_CATALOG) {
      next[c.id] = hq[c.id] ?? DEFAULT_WORKSPACE_DISCOUNT_RATES[c.id] ?? 1
    }
    setDraft(next)
  }, [partnerId])

  const save = () => {
    savePartnerHqCourseDiscounts(partnerId, draft)
    message.success('课程折扣已保存，加盟商端与同域名前台即时生效')
    onSaved()
  }

  const reset = () => {
    clearPartnerHqCourseDiscounts(partnerId)
    message.success('已清除总部折扣覆盖，恢复为各工作台默认折扣')
    const next: Record<string, number> = {}
    for (const c of HQ_FRANCHISE_COURSE_CATALOG) {
      next[c.id] = DEFAULT_WORKSPACE_DISCOUNT_RATES[c.id] ?? 1
    }
    setDraft(next)
    onSaved()
  }

  const columns: ColumnsType<{ id: string; name: string; listPrice: number }> = [
    {
      title: '课程包',
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
    },
    {
      title: '标价',
      key: 'listPrice',
      width: 100,
      render: (_, row) => (
        <span style={{ fontVariantNumeric: 'tabular-nums' }}>¥{Number(row.listPrice).toFixed(2)}</span>
      ),
    },
    {
      title: '折扣系数',
      key: 'rate',
      width: 160,
      render: (_, row) => (
        <InputNumber
          min={0.05}
          max={1}
          step={0.05}
          value={draft[row.id]}
          style={{ width: '100%' }}
          onChange={(v) => setDraft((d) => ({ ...d, [row.id]: typeof v === 'number' ? v : (DEFAULT_WORKSPACE_DISCOUNT_RATES[row.id] ?? 1) }))}
        />
      ),
    },
    {
      title: '展示',
      key: 'label',
      width: 88,
      render: (_, row) => rateToZhLabel(draft[row.id] ?? 1),
    },
    {
      title: '折后参考',
      key: 'sale',
      width: 110,
      render: (_, row) => (
        <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600, color: '#1677ff' }}>
          ¥{(Math.round(row.listPrice * (draft[row.id] ?? 1) * 100) / 100).toFixed(2)}
        </span>
      ),
    },
  ]

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
        按<strong>加盟商 · 课程包</strong>单独设置充课折扣系数（0.05～1）。保存后写入本地演示存储 Key{' '}
        <Typography.Text code copyable>
          bingo_franchise_hq_course_discounts_v1
        </Typography.Text>
        ，与加盟工作台同源时可覆盖其默认折扣；「清除总部覆盖」后恢复工作台内置默认值。
      </Typography.Paragraph>
      <Space wrap>
        <Button type="primary" onClick={save}>
          保存折扣配置
        </Button>
        <Button onClick={reset}>清除总部覆盖</Button>
      </Space>
      <Table
        rowKey="id"
        columns={columns}
        dataSource={[...HQ_FRANCHISE_COURSE_CATALOG]}
        pagination={false}
        scroll={{ x: 720 }}
      />
    </Space>
  )
}

export default function FranchisePartnerDetailPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const id = searchParams.get('id')
  const [tick, setTick] = useState(0)
  const partner = useMemo(() => {
    void tick
    return id ? getPartner(id) : undefined
  }, [id, tick])

  const [conclusionDraft, setConclusionDraft] = useState('')
  useEffect(() => {
    syncAllPartnerAccountStatusToLocalStorage()
  }, [])

  useEffect(() => {
    setConclusionDraft(partner?.conclusion ?? '')
  }, [partner?.partnerId, partner?.conclusion])

  const saveConclusion = () => {
    if (!id) return
    if (updatePartnerConclusion(id, conclusionDraft)) {
      message.success('总部结论已保存')
      setTick((t) => t + 1)
    } else message.error('保存失败')
  }

  const ledgerColumns: ColumnsType<LedgerRow> = [
    { title: '时间', dataIndex: 'createdAt', key: 'createdAt', width: 170, render: (v) => fmtTime(v) },
    { title: '类型', dataIndex: 'type', key: 'type', width: 130 },
    { title: '摘要', dataIndex: 'title', key: 'title', ellipsis: true },
    {
      title: '变动',
      dataIndex: 'amount',
      key: 'amount',
      width: 120,
      align: 'right',
      render: (v: number) => (
        <span style={{ color: v < 0 ? '#cf1322' : '#389e0d', fontVariantNumeric: 'tabular-nums' }}>
          {v >= 0 ? '+' : ''}
          {fmtMoney(v).replace('¥', '')}
        </span>
      ),
    },
    {
      title: '余额',
      dataIndex: 'balanceAfter',
      key: 'balanceAfter',
      width: 130,
      align: 'right',
      render: (v) => <span style={{ fontVariantNumeric: 'tabular-nums' }}>{fmtMoney(v)}</span>,
    },
  ]

  const classColumns: ColumnsType<ClassBrief> = [
    { title: '班级名称', dataIndex: 'name', key: 'name', ellipsis: true },
    { title: '学员数', dataIndex: 'studentCount', key: 'studentCount', width: 90 },
    {
      title: '线下课进度',
      key: 'off',
      width: 200,
      render: (_, r) => (
        <Progress percent={r.offlineTotal ? Math.round((100 * r.offlineDone) / r.offlineTotal) : 0} size="small" format={() => `${r.offlineDone}/${r.offlineTotal}`} />
      ),
    },
  ]

  if (!id) {
    return (
      <div>
        <Typography.Text type="danger">缺少加盟商参数 id</Typography.Text>
        <div style={{ marginTop: 16 }}>
          <Link to="/franchise/list">返回列表</Link>
        </div>
      </div>
    )
  }

  if (!partner) {
    return (
      <div>
        <Typography.Text type="secondary">未找到该加盟商</Typography.Text>
        <div style={{ marginTop: 16 }}>
          <Link to="/franchise/list">返回列表</Link>
        </div>
      </div>
    )
  }

  const p = partner

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Link to="/franchise/list">
          <Button icon={<ArrowLeftOutlined />}>返回列表</Button>
        </Link>
      </Space>
      <h2 style={{ marginTop: 0, marginBottom: 8 }}>{p.orgName}</h2>
      <Space wrap style={{ marginBottom: 24 }}>
        <Tag>{p.refCode}</Tag>
        <Tag color={ACCOUNT_TAG[p.accountStatus]?.color}>{ACCOUNT_TAG[p.accountStatus]?.text}</Tag>
        <Tag color={QUAL_TAG[p.qualificationStatus]?.color}>{QUAL_TAG[p.qualificationStatus]?.text}</Tag>
        <Typography.Text type="secondary">{p.region}</Typography.Text>
      </Space>

      <Tabs
        items={[
          {
            key: 'overview',
            label: '概况与总部结论',
            children: (
              <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <Descriptions bordered column={2} size="small">
                  <Descriptions.Item label="推广码">{p.refCode}</Descriptions.Item>
                  <Descriptions.Item label="联系人手机">{maskPhone(p.contactPhone)}</Descriptions.Item>
                  <Descriptions.Item label="账户冻结" span={2}>
                    <Space direction="vertical" size={4}>
                      <Space wrap align="center">
                        <Switch
                          checkedChildren="已冻结"
                          unCheckedChildren="正常"
                          checked={p.accountStatus === 'frozen'}
                          onChange={(nextFrozen) => {
                            const status = nextFrozen ? 'frozen' : 'normal'
                            if (setPartnerAccountStatus(p.partnerId, status)) {
                              message.success(nextFrozen ? '已冻结：加盟商将无法登录并使用工作台' : '已解除冻结')
                              setTick((t) => t + 1)
                            } else message.error('操作失败')
                          }}
                        />
                        <Typography.Text type="secondary">
                          演示环境写入 Key <Typography.Text code>bingo_franchise_hq_partner_account_v1</Typography.Text>
                          ，须与加盟前台同源方可即时生效。
                        </Typography.Text>
                      </Space>
                      <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
                        关闭冻结会将演示账户状态恢复为「正常」（不区分原待准入等细分状态）。
                      </Typography.Paragraph>
                    </Space>
                  </Descriptions.Item>
                  <Descriptions.Item label="账户余额">
                    <strong style={{ fontVariantNumeric: 'tabular-nums' }}>{fmtMoney(p.balance)}</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="冻结金额">{fmtMoney(p.frozen)}</Descriptions.Item>
                  <Descriptions.Item label="本月订单数">{p.ordersMonthCount}</Descriptions.Item>
                  <Descriptions.Item label="累计流水（演示）">{fmtMoney(p.totalSales)}</Descriptions.Item>
                  <Descriptions.Item label="教具订单数">{p.materialOrderCount}</Descriptions.Item>
                  <Descriptions.Item label="班级数">{p.classes.length}</Descriptions.Item>
                </Descriptions>
                <Card size="small" title="总部经营结论 / 风控备注">
                  <Input.TextArea rows={5} value={conclusionDraft} onChange={(e) => setConclusionDraft(e.target.value)} placeholder="记录履约评价、异常说明、后续跟进要求等" />
                  <Button type="primary" style={{ marginTop: 12 }} onClick={saveConclusion}>
                    保存结论
                  </Button>
                </Card>
              </Space>
            ),
          },
          {
            key: 'discounts',
            label: '课程折扣',
            children: <CourseDiscountHqPanel partnerId={p.partnerId} onSaved={() => setTick((t) => t + 1)} />,
          },
          {
            key: 'qualification',
            label: '资质',
            children: (
              <QualificationPanel
                p={p}
                onGoReview={() => navigate(`/franchise/qualification?focus=${encodeURIComponent(p.partnerId)}`)}
              />
            ),
          },
          {
            key: 'ledger',
            label: '账户与流水',
            children: (
              <Table<LedgerRow>
                rowKey="id"
                columns={ledgerColumns}
                dataSource={[...p.ledger].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())}
                pagination={false}
              />
            ),
          },
          {
            key: 'classes',
            label: '班级情况',
            children: (
              <Table<ClassBrief>
                rowKey="id"
                columns={classColumns}
                dataSource={p.classes}
                pagination={false}
                locale={{ emptyText: '暂无班级数据' }}
              />
            ),
          },
        ]}
      />
    </div>
  )
}
