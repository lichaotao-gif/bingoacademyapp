import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Alert, Button, Descriptions, Input, Modal, Space, Table, Tag, Typography, message } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import {
  CERT_REQUEST_STATUS,
  approveCertRequest,
  listCertRequests,
  rejectCertRequest,
  type CertRequestRow,
  type CertRequestStudent,
} from '@/mock/schools'
import { fmtTime, maskPhone } from '@/utils/format'

const STATUS_TAG: Record<string, { text: string; color: string }> = {
  pending: { text: '待审核', color: 'blue' },
  approved: { text: '已通过', color: 'green' },
  rejected: { text: '已驳回', color: 'red' },
}

function SnapshotTable({ students }: { students: CertRequestStudent[] }) {
  const columns: ColumnsType<CertRequestStudent> = [
    { title: '学生', dataIndex: 'studentName', key: 'studentName', width: 120 },
    { title: '手机号', key: 'phone', width: 140, render: (_, r) => maskPhone(r.studentPhone) },
    {
      title: '提交时真实进度',
      key: 'realProgress',
      width: 140,
      render: (_, r) => `${r.realProgress}%`,
    },
    {
      title: '最后学习时间',
      key: 'lastStudyAt',
      render: (_, r) => (r.lastStudyAt ? fmtTime(r.lastStudyAt) : '无学习记录'),
    },
  ]
  return (
    <Table<CertRequestStudent>
      rowKey="studentId"
      size="small"
      columns={columns}
      dataSource={students}
      pagination={false}
      scroll={{ y: 320 }}
    />
  )
}

export default function SchoolCertReview() {
  const navigate = useNavigate()
  const [tick, setTick] = useState(0)
  const refresh = () => setTick((n) => n + 1)

  const pendingList = useMemo(() => {
    void tick
    return listCertRequests({ status: CERT_REQUEST_STATUS.PENDING })
  }, [tick])

  const historyList = useMemo(() => {
    void tick
    return listCertRequests().filter((r) => r.status !== CERT_REQUEST_STATUS.PENDING)
  }, [tick])

  const [rejectOpen, setRejectOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [rejectTarget, setRejectTarget] = useState<CertRequestRow | null>(null)
  const [detailTarget, setDetailTarget] = useState<CertRequestRow | null>(null)

  const doApprove = (row: CertRequestRow) => {
    const r = approveCertRequest(row.id)
    if (!r.ok) {
      message.error(r.msg || '操作失败')
      return
    }
    message.success(`已通过审核，共签发 ${r.issued ?? 0} 张证书`)
    refresh()
  }

  const confirmReject = () => {
    if (!rejectTarget) return
    const reason = rejectReason.trim()
    if (!reason) {
      message.warning('请填写驳回原因')
      return
    }
    const r = rejectCertRequest(rejectTarget.id, reason)
    if (!r.ok) {
      message.error(r.msg || '操作失败')
      return
    }
    message.success('已驳回，学校可修改后重新提交')
    setRejectOpen(false)
    setRejectTarget(null)
    refresh()
  }

  const zeroCount = (row: CertRequestRow) => row.students.filter((s) => s.realProgress <= 0).length

  const baseColumns: ColumnsType<CertRequestRow> = [
    { title: '学校', dataIndex: 'schoolName', key: 'schoolName', width: 180, ellipsis: true },
    { title: '班级', dataIndex: 'className', key: 'className', width: 200, ellipsis: true },
    { title: '课程', dataIndex: 'courseName', key: 'courseName', width: 180, ellipsis: true },
    {
      title: '提交人',
      key: 'applicant',
      width: 140,
      render: (_, r) => `${r.applicantName}（${r.applicantRole === 'owner' ? '总管理员' : '老师'}）`,
    },
    {
      title: '学生数',
      key: 'studentCount',
      width: 130,
      render: (_, r) =>
        zeroCount(r) > 0 ? (
          <span>
            {r.studentCount}
            <Typography.Text type="warning" style={{ fontSize: 12 }}>
              （{zeroCount(r)} 名 0%）
            </Typography.Text>
          </span>
        ) : (
          r.studentCount
        ),
    },
    { title: '提交时间', key: 'submittedAt', width: 170, render: (_, r) => fmtTime(r.submittedAt) },
  ]

  const pendingColumns: ColumnsType<CertRequestRow> = [
    ...baseColumns,
    {
      title: '操作',
      key: 'act',
      fixed: 'right',
      width: 260,
      render: (_, r) => (
        <Space size="small" wrap>
          <Button type="link" size="small" onClick={() => setDetailTarget(r)}>
            查看名单
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => navigate(`/school/detail?id=${encodeURIComponent(r.schoolId)}`)}
          >
            学校详情
          </Button>
          <Button type="primary" size="small" onClick={() => doApprove(r)}>
            通过并发证
          </Button>
          <Button
            danger
            size="small"
            onClick={() => {
              setRejectTarget(r)
              setRejectReason('')
              setRejectOpen(true)
            }}
          >
            驳回
          </Button>
        </Space>
      ),
    },
  ]

  const historyColumns: ColumnsType<CertRequestRow> = [
    ...baseColumns,
    {
      title: '结果',
      key: 'status',
      width: 100,
      render: (_, r) => <Tag color={STATUS_TAG[r.status]?.color}>{STATUS_TAG[r.status]?.text}</Tag>,
    },
    { title: '审核人', dataIndex: 'reviewer', key: 'reviewer', width: 120 },
    { title: '审核时间', key: 'reviewedAt', width: 170, render: (_, r) => fmtTime(r.reviewedAt) },
    {
      title: '驳回原因',
      key: 'rejectReason',
      width: 220,
      ellipsis: true,
      render: (_, r) => r.rejectReason || '-',
    },
    {
      title: '操作',
      key: 'act',
      fixed: 'right',
      width: 110,
      render: (_, r) => (
        <Button type="link" size="small" onClick={() => setDetailTarget(r)}>
          查看名单
        </Button>
      ),
    },
  ]

  return (
    <div>
      <h2 style={{ marginTop: 0, marginBottom: 8 }}>学校结课发证审核</h2>
      <p style={{ color: '#666', marginBottom: 16 }}>
        学校提交整班结课发证申请，平台确认后统一签发证书：视为考核通过、展示进度置 100%，真实学习进度保留用于统计与审计。
        通过后不可撤销；驳回后学校可修改并重新提交。
      </p>

      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
        message="0% 进度的学生同样发证"
        description="申请中尚无学习记录的学生，完成时间取本次审核通过时间；有学习记录的学生取最后一次实际学习时间。"
      />

      <h3 style={{ marginBottom: 8 }}>待审核（{pendingList.length}）</h3>
      <Table<CertRequestRow>
        rowKey="id"
        columns={pendingColumns}
        dataSource={pendingList}
        pagination={false}
        scroll={{ x: 1260 }}
        locale={{ emptyText: '暂无待审核的发证申请' }}
        style={{ marginBottom: 24 }}
      />

      <h3 style={{ marginBottom: 8 }}>历史记录（{historyList.length}）</h3>
      <Table<CertRequestRow>
        rowKey="id"
        columns={historyColumns}
        dataSource={historyList}
        pagination={{ pageSize: 10 }}
        scroll={{ x: 1720 }}
        locale={{ emptyText: '暂无审核记录' }}
      />

      <Modal
        title="驳回发证申请"
        open={rejectOpen}
        onOk={confirmReject}
        onCancel={() => {
          setRejectOpen(false)
          setRejectTarget(null)
        }}
        okText="确认驳回"
        destroyOnClose
      >
        <p style={{ marginBottom: 8 }}>
          驳回「{rejectTarget?.schoolName} · {rejectTarget?.className}」，原因学校端可见：
        </p>
        <Input.TextArea
          rows={4}
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          placeholder="例如：多名学生学习进度为 0 且无线下课时凭证，请补充说明后重新提交。"
        />
      </Modal>

      <Modal
        title={detailTarget ? `发证名单 · ${detailTarget.className}` : '发证名单'}
        open={detailTarget != null}
        onCancel={() => setDetailTarget(null)}
        footer={<Button onClick={() => setDetailTarget(null)}>关闭</Button>}
        width={760}
        destroyOnClose
      >
        {detailTarget ? (
          <>
            <Descriptions bordered size="small" column={2} style={{ marginBottom: 12 }}>
              <Descriptions.Item label="学校">{detailTarget.schoolName}</Descriptions.Item>
              <Descriptions.Item label="课程">{detailTarget.courseName}</Descriptions.Item>
              <Descriptions.Item label="提交人">{detailTarget.applicantName}</Descriptions.Item>
              <Descriptions.Item label="提交时间">{fmtTime(detailTarget.submittedAt)}</Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={STATUS_TAG[detailTarget.status]?.color}>{STATUS_TAG[detailTarget.status]?.text}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="审核信息">
                {detailTarget.reviewedAt ? `${detailTarget.reviewer} · ${fmtTime(detailTarget.reviewedAt)}` : '-'}
              </Descriptions.Item>
              {detailTarget.rejectReason ? (
                <Descriptions.Item label="驳回原因" span={2}>
                  {detailTarget.rejectReason}
                </Descriptions.Item>
              ) : null}
            </Descriptions>
            <SnapshotTable students={detailTarget.students} />
          </>
        ) : null}
      </Modal>
    </div>
  )
}
