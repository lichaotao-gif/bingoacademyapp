import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Card, Tabs, Table, Tag, Button, Row, Col, Empty } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'
import type { Competition } from '@/api/competition'
import { fmtTime } from '@/utils/format'

const STATUS_MAP: Record<string, { text: string; color: string }> = {
  pending: { text: '未开始', color: 'orange' },
  ongoing: { text: '进行中', color: 'green' },
  ended: { text: '已结束', color: 'default' },
  offline: { text: '已下架', color: 'red' },
}

const CATEGORY_MAP: Record<string, string> = {
  ai_code: 'AI编程大赛',
  algorithm: '算法挑战赛',
  design: '创意设计赛',
}

const enrollListMock = [
  { id: 1, user_name: '张三', phone: '13800138000', apply_time: '2024-05-15 10:00:00', audit_status: 'passed' },
  { id: 2, user_name: '李四', phone: '13900139000', apply_time: '2024-05-16 11:00:00', audit_status: 'pending' },
  { id: 3, user_name: '王五', phone: '13700137000', apply_time: '2024-05-17 09:00:00', audit_status: 'rejected' },
]

const awardListMock = [
  { rank: '一等奖', count: 3, prize: '奖金3000元+证书' },
  { rank: '二等奖', count: 10, prize: '奖金1000元+证书' },
  { rank: '三等奖', count: 20, prize: '奖金500元+证书' },
]

const trendData = [
  { date: '05-10', count: 12 },
  { date: '05-15', count: 45 },
  { date: '05-20', count: 89 },
  { date: '05-25', count: 120 },
  { date: '05-30', count: 128 },
]

export default function CompetitionDetail() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const id = searchParams.get('id')

  const [competition, setCompetition] = useState<Competition | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) {
      setLoading(false)
      return
    }
    setLoading(true)
    // 对接后端时替换为 getCompetitionDetail(Number(id))
    setTimeout(() => {
      setCompetition({
        competition_id: Number(id),
        competition_name: '2024缤果AI编程大赛',
        category: 'ai_code',
        start_time: '2024-06-01 09:00:00',
        end_time: '2024-06-30 18:00:00',
        cover_url: undefined,
        desc: '面向青少年的AI编程赛事，鼓励创新与实践。',
        status: 'ongoing',
        enroll_count: 128,
        enroll_start_time: '2024-05-01 09:00:00',
        enroll_end_time: '2024-05-31 18:00:00',
        max_enroll_count: 500,
        need_audit: true,
      })
      setLoading(false)
    }, 300)
  }, [id])

  const handleAuditPass = () => {}
  const handleAuditReject = () => {}

  const enrollColumns = [
    { title: '用户ID', dataIndex: 'id', width: 80 },
    { title: '用户名', dataIndex: 'user_name', width: 120 },
    { title: '手机号', dataIndex: 'phone', width: 140 },
    { title: '报名时间', dataIndex: 'apply_time', width: 180, render: (v: string) => fmtTime(v) },
    {
      title: '审核状态',
      dataIndex: 'audit_status',
      width: 100,
      render: (v: string) => {
        const m: Record<string, { t: string; c: string }> = { passed: { t: '已通过', c: 'green' }, rejected: { t: '已拒绝', c: 'red' }, pending: { t: '待审核', c: 'orange' } }
        const x = m[v] || { t: '-', c: 'default' }
        return <Tag color={x.c}>{x.t}</Tag>
      },
    },
    {
      title: '操作',
      width: 160,
      render: (_: unknown, r: { audit_status: string }) =>
        r.audit_status === 'pending' ? (
          <span>
            <Button size="small" type="link" onClick={handleAuditPass}>通过</Button>
            <Button size="small" type="link" danger onClick={handleAuditReject}>拒绝</Button>
          </span>
        ) : null,
    },
  ]

  const awardColumns = [
    { title: '奖项等级', dataIndex: 'rank', width: 120 },
    { title: '获奖人数', dataIndex: 'count', width: 100 },
    { title: '奖项内容', dataIndex: 'prize' },
  ]

  const trendOption = {
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: trendData.map((d) => d.date) },
    yAxis: { type: 'value' },
    series: [{ data: trendData.map((d) => d.count), type: 'line', smooth: true }],
    grid: { left: 60, right: 20, top: 20, bottom: 40 },
  }

  if (!id || !competition) {
    return <div style={{ padding: 24 }}>{loading ? '加载中...' : '未找到赛事'}</div>
  }

  const status = STATUS_MAP[competition.status] || STATUS_MAP.pending
  const category = CATEGORY_MAP[competition.category] || '未知'

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 16 }}>
        <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate('/competition/list')}>返回赛事列表</Button>
      </div>
      <h2 style={{ marginBottom: 24 }}>赛事详情</h2>
      <Card loading={loading}>
        <div style={{ display: 'flex', gap: 24, marginBottom: 24 }}>
          {competition.cover_url && (
            <img src={competition.cover_url} alt="赛事封面" style={{ width: 200, height: 120, objectFit: 'cover', borderRadius: 8 }} />
          )}
          <div style={{ flex: 1 }}>
            <h3 style={{ marginBottom: 12 }}>{competition.competition_name}</h3>
            <div style={{ marginBottom: 8 }}><span style={{ color: '#666' }}>赛事分类：</span><Tag color="blue">{category}</Tag></div>
            <div style={{ marginBottom: 8 }}><span style={{ color: '#666' }}>赛事状态：</span><Tag color={status.color}>{status.text}</Tag></div>
            <div style={{ marginBottom: 8 }}><span style={{ color: '#666' }}>举办时间：</span>{fmtTime(competition.start_time)} 至 {fmtTime(competition.end_time)}</div>
            <div><span style={{ color: '#666' }}>报名人数：</span>{competition.enroll_count} 人</div>
          </div>
        </div>

        <Tabs
          defaultActiveKey="intro"
          items={[
            {
              key: 'intro',
              label: '赛事介绍',
              children: <div style={{ padding: '16px 0', color: '#666' }}>{competition.desc || '暂无介绍'}</div>,
            },
            {
              key: 'enroll',
              label: '报名列表',
              children: (
                <>
                  <Table dataSource={enrollListMock} columns={enrollColumns} rowKey="id" size="small" pagination={{ pageSize: 10, total: enrollListMock.length }} />
                </>
              ),
            },
            {
              key: 'award',
              label: '奖项设置',
              children: <Table dataSource={awardListMock} columns={awardColumns} rowKey="rank" size="small" pagination={false} locale={{ emptyText: <Empty description="暂无奖项" /> }} />,
            },
            {
              key: 'stat',
              label: '数据统计',
              children: (
                <>
                  <Row gutter={16} style={{ marginBottom: 24 }}>
                    <Col span={8}><Card size="small"><div style={{ color: '#666' }}>累计报名人数</div><div style={{ fontSize: 24, fontWeight: 600 }}>{competition.enroll_count}</div></Card></Col>
                    <Col span={8}><Card size="small"><div style={{ color: '#666' }}>审核通过人数</div><div style={{ fontSize: 24, fontWeight: 600 }}>112</div></Card></Col>
                    <Col span={8}><Card size="small"><div style={{ color: '#666' }}>实际参赛人数</div><div style={{ fontSize: 24, fontWeight: 600 }}>98</div></Card></Col>
                  </Row>
                  <Card title="报名趋势" size="small">
                    <ReactECharts option={trendOption} style={{ height: 360 }} />
                  </Card>
                </>
              ),
            },
          ]}
        />
      </Card>
    </div>
  )
}
