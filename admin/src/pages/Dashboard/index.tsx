import { useState, useCallback } from 'react'
import { Card, Row, Col, Form, DatePicker, Select, Button, message } from 'antd'
import { useNavigate } from 'react-router-dom'
import ReactECharts from 'echarts-for-react'
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
const { RangePicker } = DatePicker
const { Option } = Select

/** 品牌色 */
const PRIMARY = '#0891b2'
const SUCCESS = '#10b981'
const ERROR = '#ef4444'
const CHART_COLORS = [PRIMARY, '#0e7490', '#06b6d4', '#22d3ee']

interface DashboardData {
  totalUser: number
  todayNewUser: number
  totalRevenue: number
  conversionRate: number
  userTrend: number
  todayUserTrend: number
  revenueTrend: number
  conversionTrend: number
}

const defaultData: DashboardData = {
  totalUser: 12580,
  todayNewUser: 238,
  totalRevenue: 156890,
  conversionRate: 18.5,
  userTrend: 8.2,
  todayUserTrend: 5.6,
  revenueTrend: 12.8,
  conversionTrend: 2.3,
}

const userGrowthData = {
  months: ['1月', '2月', '3月', '4月', '5月', '6月'],
  newUser: [1200, 1900, 1500, 2300, 2100, 2500],
  totalUser: [8000, 9900, 10500, 11800, 12100, 12580],
}

const revenuePieData = [
  { value: 105800, name: '课程销售' },
  { value: 38000, name: '会员订阅' },
  { value: 10000, name: '增值服务' },
  { value: 3090, name: '其他' },
]

function formatNum(v: number): string {
  return String(v).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<DashboardData>(defaultData)
  const [chartKey, setChartKey] = useState(0)

  const fetchData = useCallback(() => {
    setLoading(true)
    message.loading({ content: '正在加载数据...', key: 'dashboard' })
    setTimeout(() => {
      setData(defaultData)
      setChartKey((k) => k + 1)
      message.success({ content: '数据加载成功', key: 'dashboard' })
      setLoading(false)
    }, 600)
  }, [])

  const onFinish = () => fetchData()

  const onReset = () => {
    form.setFieldsValue({
      dateRange: [dayjs().subtract(1, 'month'), dayjs()],
      dimension: 'month',
    })
    fetchData()
  }

  const userGrowthOption = {
    color: [PRIMARY, '#0e7490'],
    tooltip: { trigger: 'axis' },
    legend: { data: ['新增用户', '累计用户'] },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', data: userGrowthData.months },
    yAxis: { type: 'value' },
    series: [
      { name: '新增用户', type: 'line', data: userGrowthData.newUser, smooth: true },
      { name: '累计用户', type: 'line', data: userGrowthData.totalUser, smooth: true },
    ],
  }

  const revenuePieOption = {
    color: CHART_COLORS,
    tooltip: {
      trigger: 'item',
      formatter: (p: unknown) => {
        const x = p as { name: string; value: number; percent: number }
        return `${x.name}: ${Number(x.value).toLocaleString()}元 (${x.percent}%)`
      },
    },
    legend: {
      orient: 'vertical',
      right: 16,
      top: 'center',
      data: revenuePieData.map((d) => d.name),
    },
    series: [
      {
        name: '营收占比',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['40%', '50%'],
        data: revenuePieData,
        avoidLabelOverlap: true,
        label: {
          position: 'outside',
          formatter: (p: unknown) => {
            const x = p as { name: string; value: number; percent: number }
            return `${x.name}: ${Number(x.value).toLocaleString()}元 (${x.percent}%)`
          },
        },
        labelLine: { length: 12, length2: 8 },
      },
    ],
  }

  const cards = [
    { title: '总用户数', value: formatNum(data.totalUser), trend: data.userTrend, suffix: '较上月', unit: '' },
    { title: '今日新增用户', value: formatNum(data.todayNewUser), trend: data.todayUserTrend, suffix: '较昨日', unit: '' },
    { title: '总营收（元）', value: formatNum(data.totalRevenue), trend: data.revenueTrend, suffix: '较上月', unit: '' },
    { title: '订单转化率', value: String(data.conversionRate) + '%', trend: data.conversionTrend, suffix: '较上月', unit: '' },
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ margin: 0 }}>数据看板</h2>
        <Button type="primary" onClick={() => navigate('/statistics/report')}>报表导出</Button>
      </div>

      {/* 筛选栏 */}
      <Card size="small" style={{ marginBottom: 20 }}>
        <Form form={form} layout="inline" onFinish={onFinish} initialValues={{
          dateRange: [dayjs().subtract(1, 'month'), dayjs()],
          dimension: 'month',
        }}>
          <Form.Item name="dateRange" label="时间范围">
            <RangePicker format="YYYY-MM-DD" />
          </Form.Item>
          <Form.Item name="dimension" label="数据维度">
            <Select style={{ width: 120 }} placeholder="请选择">
              <Option value="day">日维度</Option>
              <Option value="week">周维度</Option>
              <Option value="month">月维度</Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>查询</Button>
            <Button style={{ marginLeft: 8 }} onClick={onReset}>重置</Button>
          </Form.Item>
        </Form>
      </Card>

      {/* 数据卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        {cards.map((c, i) => (
          <Col xs={24} sm={12} lg={6} key={i}>
            <Card className="dashboard-card" bodyStyle={{ padding: 20 }}>
              <div style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>{c.title}</div>
              <div style={{ fontSize: 24, fontWeight: 600, color: '#333', marginBottom: 6 }}>{c.value}</div>
              <div
                style={{
                  fontSize: 12,
                  color: c.trend >= 0 ? SUCCESS : ERROR,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                {c.trend >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                {Math.abs(c.trend)}% {c.suffix}
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* 图表区域 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="用户增长趋势" bodyStyle={{ padding: '16px 20px' }}>
            <ReactECharts key={chartKey} option={userGrowthOption} style={{ height: 360 }} opts={{ renderer: 'canvas' }} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="营收分布" bodyStyle={{ padding: '16px 20px' }}>
            <ReactECharts key={chartKey + 1} option={revenuePieOption} style={{ height: 360 }} opts={{ renderer: 'canvas' }} />
          </Card>
        </Col>
      </Row>
    </div>
  )
}
