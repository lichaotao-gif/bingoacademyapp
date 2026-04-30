import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button, Input, Modal, Space, Table, Tag, message } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import {
  approveQualification,
  listPartners,
  rejectQualification,
  type FranchisePartnerDetail,
} from '@/mock/franchisePartners'
import { fmtTime, maskPhone } from '@/utils/format'

export default function FranchiseQualification() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const focusId = searchParams.get('focus')
  const [tick, setTick] = useState(0)
  const refresh = () => setTick((n) => n + 1)

  const pendingList = useMemo(() => {
    void tick
    void focusId
    return listPartners().filter((p) => p.qualification.pendingReview != null)
  }, [tick, focusId])

  const [rejectOpen, setRejectOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [rejectTargetId, setRejectTargetId] = useState<string | null>(null)

  const openReject = (partnerId: string) => {
    setRejectTargetId(partnerId)
    setRejectReason('')
    setRejectOpen(true)
  }

  const confirmReject = () => {
    if (!rejectTargetId) return
    const r = rejectReason.trim()
    if (!r) {
      message.warning('请填写驳回原因')
      return
    }
    if (rejectQualification(rejectTargetId, r)) {
      message.success('已驳回')
      setRejectOpen(false)
      refresh()
    } else message.error('操作失败')
  }

  const doApprove = (partnerId: string) => {
    if (approveQualification(partnerId)) {
      message.success('已通过资质审核')
      refresh()
    } else message.error('操作失败')
  }

  const columns: ColumnsType<FranchisePartnerDetail> = [
    {
      title: '机构名称',
      dataIndex: 'orgName',
      key: 'orgName',
      width: 200,
      ellipsis: true,
      render: (text, r) => (
        <span style={{ fontWeight: focusId === r.partnerId ? 600 : undefined }}>{text}</span>
      ),
    },
    { title: '推广码', dataIndex: 'refCode', key: 'refCode', width: 90 },
    {
      title: '类型',
      key: 'type',
      width: 110,
      render: (_, r) =>
        r.qualificationStatus === 'pending_update' ? (
          <Tag color="gold">资质变更</Tag>
        ) : (
          <Tag color="blue">首次准入</Tag>
        ),
    },
    {
      title: '提交时间',
      key: 'submitted',
      width: 170,
      render: (_, r) => fmtTime(r.qualification.pendingReview?.submittedAt),
    },
    { title: '联系人', key: 'phone', width: 120, render: (_, r) => maskPhone(r.contactPhone) },
    {
      title: '操作',
      key: 'act',
      fixed: 'right',
      width: 220,
      render: (_, r) => (
        <Space size="small">
          <Button type="link" size="small" onClick={() => navigate(`/franchise/detail?id=${encodeURIComponent(r.partnerId)}`)}>
            查看详情
          </Button>
          <Button type="primary" size="small" onClick={() => doApprove(r.partnerId)}>
            通过
          </Button>
          <Button danger size="small" onClick={() => openReject(r.partnerId)}>
            驳回
          </Button>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <h2 style={{ marginBottom: 8 }}>加盟商资质审核</h2>
      <p style={{ color: '#666', marginBottom: 16 }}>
        处理首次入网与资质变更提交；通过后生效至「已通过」快照，驳回需加盟商修改后重新提交。
      </p>
      <Table<FranchisePartnerDetail>
        rowKey="partnerId"
        columns={columns}
        dataSource={pendingList}
        pagination={false}
        locale={{ emptyText: '暂无待审核提交' }}
        scroll={{ x: 900 }}
      />
      <Modal
        title="驳回资质"
        open={rejectOpen}
        onOk={confirmReject}
        onCancel={() => setRejectOpen(false)}
        destroyOnClose
      >
        <p style={{ marginBottom: 8 }}>请填写驳回原因（加盟商端可见）：</p>
        <Input.TextArea rows={4} value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="例如：营业执照模糊，请上传清晰彩色扫描件。" />
      </Modal>
    </div>
  )
}
