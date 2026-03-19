import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Card, Row, Col, Button } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'
import type { MarketingActivity } from '@/api/marketing'
import { ACTIVITY_TYPE_MAP, ACTIVITY_STATUS_MAP } from '@/api/marketing'
import { fmtTime } from '@/utils/format'

const trendMock = [
  { date: '02-01', participant: 120, convert: 18 },
  { date: '02-05', participant: 280, convert: 42 },
  { date: '02-10', participant: 560, convert: 89 },
  { date: '02-15', participant: 890, convert: 134 },
  { date: '02-20', participant: 1200, convert: 180 },
]

export default function MarketingActivityDetail() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const id = searchParams.get('id')
  const [activity, setActivity] = useState<MarketingActivity | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) {
      setLoading(false)
      return
    }
    setLoading(true)
    // 对接 getActivityDetail(id) + getActivityStats(id)
    setTimeout(() => {
      setActivity({
        id: String(id),
        name: '新人优惠券活动',
        type: 'coupon',
        startTime: '2024-02-01 00:00:00',
        endTime: '2024-02-28 23:59:59',
        status: 'published',
        participantNum: 1200,
        convertNum: 180,
        convertRate: 15,
      })
      setLoading(false)
    }, 300)
  }, [id])

  if (!id || !activity) {
    return <div style={{ padding: 24 }}>{loading ? '加载中...' : '未找到活动'}</div>
  }

  const status = ACTIVITY_STATUS_MAP[activity.status]
  const trendOption = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['参与人数', '转化数'] },
    xAxis: { type: 'category', data: trendMock.map((d) => d.date) },
    yAxis: { type: 'value' },
    series: [
      { name: '参与人数', data: trendMock.map((d) => d.participant), type: 'line', smooth: true },
      { name: '转化数', data: trendMock.map((d) => d.convert), type: 'line', smooth: true },
    ],
    grid: { left: 60, right: 40, top: 40, bottom: 40 },
  }

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 16 }}>
        <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate('/marketing/activity')}>返回活动列表</Button>
      </div>
      <h2 style={{ marginBottom: 24 }}>活动详情</h2>
      <Card loading={loading}>
        <div style={{ marginBottom: 24 }}>
          <h3 style={{ marginBottom: 12 }}>{activity.name}</h3>
          <div style={{ color: '#666', marginBottom: 8 }}>活动类型：{ACTIVITY_TYPE_MAP[activity.type]}</div>
          <div style={{ color: '#666', marginBottom: 8 }}>状态：<span style={{ color: status?.color }}>{status?.text}</span></div>
          <div style={{ color: '#666' }}>时间：{fmtTime(activity.startTime)} 至 {fmtTime(activity.endTime)}</div>
        </div>

        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={8}>
            <Card size="small">
              <div style={{ color: '#666', fontSize: 12 }}>累计参与人数</div>
              <div style={{ fontSize: 24, fontWeight: 600 }}>{activity.participantNum ?? 0}</div>
            </Card>
          </Col>
          <Col span={8}>
            <Card size="small">
              <div style={{ color: '#666', fontSize: 12 }}>转化数</div>
              <div style={{ fontSize: 24, fontWeight: 600 }}>{activity.convertNum ?? 0}</div>
            </Card>
          </Col>
          <Col span={8}>
            <Card size="small">
              <div style={{ color: '#666', fontSize: 12 }}>转化率</div>
              <div style={{ fontSize: 24, fontWeight: 600 }}>{(activity.convertRate ?? 0).toFixed(2)}%</div>
            </Card>
          </Col>
        </Row>

        <Card title="参与/转化趋势" size="small">
          <ReactECharts option={trendOption} style={{ height: 320 }} />
        </Card>
      </Card>
    </div>
  )
}
