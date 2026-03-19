import { ProTable } from '@ant-design/pro-components'
import type { ProColumns } from '@ant-design/pro-components'
import { Button, Space, Tag, message } from 'antd'
import { mockPage } from '@/api/mock'
import type { CompetitionApply } from '@/api/competition'
import { fmtTime, maskPhone } from '@/utils/format'
import { AUDIT_STATUS } from '@/config/constant'

const mockList: CompetitionApply[] = [
  { apply_id: 1, competition_id: 1, competition_name: '青少年AI挑战赛', student_id: 1, real_name: '张小明', phone: '13800138000', grade: '小学三年级', audit_status: 0, pay_status: 0, apply_time: '2024-02-10 14:00:00' },
  { apply_id: 2, competition_id: 1, competition_name: '青少年AI挑战赛', student_id: 2, real_name: '李华', phone: '13900139000', grade: '初中一年级', audit_status: 1, pay_status: 1, apply_time: '2024-02-09 10:30:00' },
]

export default function CompetitionApplyPage() {
  const columns: ProColumns<CompetitionApply>[] = [
    { title: '报名ID', dataIndex: 'apply_id', width: 90 },
    { title: '赛事', dataIndex: 'competition_name', width: 180 },
    { title: '学员姓名', dataIndex: 'real_name', width: 100 },
    { title: '手机号', dataIndex: 'phone', width: 130, render: (_, r) => maskPhone(r.phone) },
    { title: '年级', dataIndex: 'grade', width: 100 },
    { title: '审核状态', dataIndex: 'audit_status', width: 100, render: (_, r) => {
      const m: Record<number, { color: string }> = { 0: { color: 'orange' }, 1: { color: 'green' }, 2: { color: 'red' } }
      return <Tag color={m[r.audit_status]?.color}>{AUDIT_STATUS[r.audit_status as keyof typeof AUDIT_STATUS]}</Tag>
    }},
    { title: '报名时间', dataIndex: 'apply_time', width: 170, render: (_, r) => fmtTime(r.apply_time) },
    { title: '操作', valueType: 'option', width: 180, render: (_, r) => (
      r.audit_status === 0 ? (
        <Space>
          <a onClick={() => handleAudit(r.apply_id, 1)}>通过</a>
          <a style={{ color: '#ff4d4f' }} onClick={() => handleAudit(r.apply_id, 2)}>驳回</a>
        </Space>
      ) : <a>查看详情</a>
    )},
  ]

  const request = async (params: { current?: number; pageSize?: number }) => {
    const { current = 1, pageSize = 10 } = params
    const res = mockPage(mockList, current, pageSize)
    return { data: res.data as CompetitionApply[], total: res.total, success: true }
  }

  const handleAudit = (applyId: number, auditStatus: number) => {
    message.success(auditStatus === 1 ? `报名 ${applyId} 已通过` : `报名 ${applyId} 已驳回`)
  }

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>赛事报名审核</h2>
      <ProTable<CompetitionApply>
        rowKey="apply_id"
        columns={columns}
        request={request}
        search={{ labelWidth: 'auto' }}
        pagination={{ defaultPageSize: 10, showSizeChanger: true }}
        toolBarRender={() => [
          <Button key="batch" type="primary">批量审核</Button>,
        ]}
      />
    </div>
  )
}
