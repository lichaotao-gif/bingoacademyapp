import { useState } from 'react'
import { Card, Row, Col, Form, Input, Select, DatePicker, Button, Table, Tag, Modal, Descriptions, Dropdown, message } from 'antd'
import { DownloadOutlined, ReloadOutlined, DownOutlined } from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'
import type { Settlement, SettlementStatus, SettlementTargetType } from '@/api/finance'
import { fmtTime, fmtMoney } from '@/utils/format'

const { RangePicker } = DatePicker

const STATUS_MAP: Record<SettlementStatus, { text: string; color: string }> = {
  pending: { text: '待结算', color: 'orange' },
  processing: { text: '结算中', color: 'blue' },
  completed: { text: '已结算', color: 'green' },
  exception: { text: '结算异常', color: 'red' },
}

const TARGET_TYPE_MAP: Record<SettlementTargetType, string> = {
  teacher: '讲师',
  merchant: '合作商户',
  course: '内部课程',
}

const statsMock = {
  totalSettlementAmount: 1289650.89,
  settledAmount: 987650.56,
  pendingAmount: 302000.33,
  exceptionOrderCount: 12,
  trendRate: { income: 8.5, settled: 12.3, pending: -5.2, exception: 3.8 },
}

const chartData = {
  months: ['8月', '9月', '10月', '11月', '12月', '1月'],
  total: [985000, 1024500, 1189000, 1256000, 1328000, 1289650],
  settled: [785000, 824500, 956000, 928000, 998000, 987650],
  pending: [200000, 200000, 233000, 328000, 330000, 302000],
}

const mockList: Settlement[] = [
  {
    settlementNo: 'BGS20260128001',
    targetName: '张老师',
    targetType: 'teacher',
    settlementAmount: 25689.5,
    feeAmount: 1284.48,
    actualAmount: 24405.02,
    settlementCycle: '2026-01-01 至 2026-01-31',
    status: 'completed',
    createTime: '2026-02-01 10:25:36',
    orderList: [
      { orderNo: 'BG20260105001', courseName: 'AI绘画实战课', orderAmount: 1299, settlementRatio: 0.8, orderSettlementAmount: 1039.2 },
      { orderNo: 'BG20260112005', courseName: 'Python数据分析', orderAmount: 1999, settlementRatio: 0.8, orderSettlementAmount: 1599.2 },
    ],
  },
  {
    settlementNo: 'BGS20260128002',
    targetName: 'XX教育机构',
    targetType: 'merchant',
    settlementAmount: 89560.2,
    feeAmount: 4478.01,
    actualAmount: 85082.19,
    settlementCycle: '2026-01-01 至 2026-01-31',
    status: 'pending',
    createTime: '2026-02-01 11:08:22',
    orderList: [
      { orderNo: 'BG20260108012', courseName: 'Java全栈开发', orderAmount: 2999, settlementRatio: 0.75, orderSettlementAmount: 2249.25 },
    ],
  },
  {
    settlementNo: 'BGS20260128003',
    targetName: 'AI进阶训练营',
    targetType: 'course',
    settlementAmount: 156890.8,
    feeAmount: 7844.54,
    actualAmount: 149046.26,
    settlementCycle: '2026-01-01 至 2026-01-31',
    status: 'exception',
    createTime: '2026-02-01 14:15:49',
    orderList: [
      { orderNo: 'BG20260109018', courseName: 'AI进阶训练营', orderAmount: 3999, settlementRatio: 0.9, orderSettlementAmount: 3599.1 },
    ],
  },
]

export default function FinanceSettlement() {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [list, setList] = useState<Settlement[]>(mockList)
  const [total, setTotal] = useState(89)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [detailVisible, setDetailVisible] = useState(false)
  const [currentRow, setCurrentRow] = useState<Settlement | null>(null)
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])

  const handleQuery = () => {
    setLoading(true)
    setTimeout(() => {
      setList(mockList)
      setLoading(false)
    }, 500)
  }

  const handleReset = () => {
    form.resetFields()
    handleQuery()
  }

  const handleExport = () => {
    message.success('报表导出成功')
  }

  const handleBatchAudit = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择需要审核的结算单')
      return
    }
    message.success('批量审核成功')
    handleQuery()
  }

  const handleReconciliation = () => {
    message.info('异常订单对账功能处理中...')
  }

  const viewDetail = (row: Settlement) => {
    setCurrentRow(row)
    setDetailVisible(true)
  }

  const auditSettlement = (row: Settlement) => {
    message.success('结算单审核成功')
    handleQuery()
    setDetailVisible(false)
  }

  const handleException = (row: Settlement) => {
    message.success('异常已处理，已恢复为待结算状态')
    handleQuery()
  }

  const chartOption = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend: { data: ['应结算金额', '已结算金额', '待结算金额'], right: 10 },
    grid: { left: 60, right: 40, bottom: 40, top: 40 },
    xAxis: { type: 'category', data: chartData.months },
    yAxis: { type: 'value', axisLabel: { formatter: '¥{value}' } },
    series: [
      { name: '应结算金额', type: 'bar', data: chartData.total, itemStyle: { color: '#0891b2' } },
      { name: '已结算金额', type: 'bar', data: chartData.settled, itemStyle: { color: '#52c41a' } },
      { name: '待结算金额', type: 'bar', data: chartData.pending, itemStyle: { color: '#faad14' } },
    ],
  }

  const columns = [
    { title: '结算单号', dataIndex: 'settlementNo', width: 180 },
    { title: '结算对象', dataIndex: 'targetName', width: 120 },
    { title: '对象类型', dataIndex: 'targetType', width: 110, render: (v: SettlementTargetType) => <Tag>{TARGET_TYPE_MAP[v]}</Tag> },
    { title: '结算金额(元)', dataIndex: 'settlementAmount', width: 130, render: (v: number) => fmtMoney(v) },
    { title: '手续费/税费(元)', dataIndex: 'feeAmount', width: 130, render: (v: number) => fmtMoney(v) },
    { title: '实际到账(元)', dataIndex: 'actualAmount', width: 130, render: (v: number) => fmtMoney(v) },
    { title: '结算周期', dataIndex: 'settlementCycle', width: 200 },
    { title: '状态', dataIndex: 'status', width: 100, render: (v: SettlementStatus) => <Tag color={STATUS_MAP[v]?.color}>{STATUS_MAP[v]?.text}</Tag> },
    { title: '创建时间', dataIndex: 'createTime', width: 170 },
    {
      title: '操作',
      width: 220,
      fixed: 'right' as const,
      render: (_: unknown, row: Settlement) => (
        <>
          <a onClick={() => viewDetail(row)}>查看详情</a>
          {row.status === 'pending' && <a style={{ marginLeft: 12, color: '#52c41a' }} onClick={() => auditSettlement(row)}>审核结算</a>}
          {row.status === 'exception' && <a style={{ marginLeft: 12, color: '#ff4d4f' }} onClick={() => handleException(row)}>处理异常</a>}
        </>
      ),
    },
  ]

  const expandedRowRender = (record: Settlement) => (
    <Table
      size="small"
      dataSource={record.orderList}
      rowKey="orderNo"
      pagination={false}
      columns={[
        { title: '订单号', dataIndex: 'orderNo', width: 180 },
        { title: '课程名称', dataIndex: 'courseName', width: 150 },
        { title: '订单金额(元)', dataIndex: 'orderAmount', width: 120, render: (v: number) => fmtMoney(v) },
        { title: '结算比例', dataIndex: 'settlementRatio', width: 100, render: (v: number) => `${(v * 100).toFixed(0)}%` },
        { title: '结算金额(元)', dataIndex: 'orderSettlementAmount', width: 120, render: (v: number) => fmtMoney(v) },
      ]}
    />
  )

  const Trend = ({ rate }: { rate: number }) => (
    <span style={{ color: rate >= 0 ? '#52c41a' : '#ff4d4f', fontSize: 12 }}>
      {rate >= 0 ? '↑' : '↓'} {Math.abs(rate)}% 较上期
    </span>
  )

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ margin: 0 }}>财务结算管理</h2>
        <div>
          <Button type="primary" icon={<DownloadOutlined />} onClick={handleExport}>导出结算报表</Button>
          <Button icon={<ReloadOutlined />} onClick={handleQuery} style={{ marginLeft: 8 }}>刷新数据</Button>
          <Dropdown
            menu={{
              items: [
                { key: 'batch', label: '批量审核结算单', onClick: handleBatchAudit },
                { key: 'reconcile', label: '异常订单对账', onClick: handleReconciliation },
                { key: 'config', label: '结算规则配置', onClick: () => message.info('结算规则配置') },
              ],
            }}
          >
            <Button style={{ marginLeft: 8 }}>更多操作 <DownOutlined /></Button>
          </Dropdown>
        </div>
      </div>

      <Card style={{ marginBottom: 20 }}>
        <Form form={form} layout="inline" onFinish={handleQuery}>
          <Form.Item name="settlementCycle" label="结算周期">
            <RangePicker format="YYYY-MM-DD" />
          </Form.Item>
          <Form.Item name="status" label="结算状态">
            <Select placeholder="全部状态" style={{ width: 120 }} allowClear>
              {Object.entries(STATUS_MAP).map(([k, v]) => (
                <Select.Option key={k} value={k}>{v.text}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="targetType" label="结算对象类型">
            <Select placeholder="全部类型" style={{ width: 130 }} allowClear>
              {Object.entries(TARGET_TYPE_MAP).map(([k, v]) => (
                <Select.Option key={k} value={k}>{v}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="keyword" label="关键词">
            <Input placeholder="结算单号/对象名称" style={{ width: 180 }} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">查询</Button>
            <Button onClick={handleReset} style={{ marginLeft: 8 }}>重置</Button>
          </Form.Item>
        </Form>
      </Card>

      <Row gutter={16} style={{ marginBottom: 20 }}>
        <Col span={6}>
          <Card size="small">
            <div style={{ color: '#666', fontSize: 12 }}>本期应结算总额</div>
            <div style={{ fontSize: 22, fontWeight: 600 }}>{fmtMoney(statsMock.totalSettlementAmount)}</div>
            <Trend rate={statsMock.trendRate.income} />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <div style={{ color: '#666', fontSize: 12 }}>已结算金额</div>
            <div style={{ fontSize: 22, fontWeight: 600 }}>{fmtMoney(statsMock.settledAmount)}</div>
            <Trend rate={statsMock.trendRate.settled} />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <div style={{ color: '#666', fontSize: 12 }}>待结算金额</div>
            <div style={{ fontSize: 22, fontWeight: 600 }}>{fmtMoney(statsMock.pendingAmount)}</div>
            <Trend rate={statsMock.trendRate.pending} />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <div style={{ color: '#666', fontSize: 12 }}>结算异常订单数</div>
            <div style={{ fontSize: 22, fontWeight: 600 }}>{statsMock.exceptionOrderCount} 笔</div>
            <Trend rate={statsMock.trendRate.exception} />
          </Card>
        </Col>
      </Row>

      <Card title="结算金额趋势（近6个月）" style={{ marginBottom: 20 }}>
        <ReactECharts option={chartOption} style={{ height: 360 }} />
      </Card>

      <Card title={`结算明细列表（共 ${total} 条）`}>
        <Table
          rowSelection={{ selectedRowKeys, onChange: setSelectedRowKeys }}
          dataSource={list}
          rowKey="settlementNo"
          loading={loading}
          columns={columns}
          expandable={{ expandedRowRender }}
          pagination={{ current: page, pageSize, total, showSizeChanger: true, showTotal: (t) => `共 ${t} 条` }}
        />
      </Card>

      <Modal
        title="结算单详情"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        width={800}
        footer={
          currentRow?.status === 'pending' ? (
            <Button type="primary" onClick={() => auditSettlement(currentRow)}>审核结算</Button>
          ) : null
        }
      >
        {currentRow && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 16, fontWeight: 600 }}>结算单号：{currentRow.settlementNo} <Tag color={STATUS_MAP[currentRow.status]?.color}>{STATUS_MAP[currentRow.status]?.text}</Tag></div>
              <div style={{ color: '#666', marginTop: 8 }}>结算对象：{currentRow.targetName}（{TARGET_TYPE_MAP[currentRow.targetType]}）</div>
            </div>
            <Descriptions column={2} bordered size="small" style={{ marginBottom: 16 }}>
              <Descriptions.Item label="结算周期">{currentRow.settlementCycle}</Descriptions.Item>
              <Descriptions.Item label="创建时间">{currentRow.createTime}</Descriptions.Item>
              <Descriptions.Item label="结算总额">{fmtMoney(currentRow.settlementAmount)}</Descriptions.Item>
              <Descriptions.Item label="手续费/税费">{fmtMoney(currentRow.feeAmount)}</Descriptions.Item>
              <Descriptions.Item label="实际到账">{fmtMoney(currentRow.actualAmount)}</Descriptions.Item>
            </Descriptions>
            <div style={{ marginTop: 16 }}>
              <h4>关联订单明细</h4>
              <Table
                size="small"
                dataSource={currentRow.orderList}
                rowKey="orderNo"
                pagination={false}
                columns={[
                  { title: '订单号', dataIndex: 'orderNo', width: 180 },
                  { title: '课程名称', dataIndex: 'courseName', width: 150 },
                  { title: '订单金额(元)', dataIndex: 'orderAmount', width: 120, render: (v: number) => fmtMoney(v) },
                  { title: '结算比例', dataIndex: 'settlementRatio', width: 100, render: (v: number) => `${(v * 100).toFixed(0)}%` },
                  { title: '结算金额(元)', dataIndex: 'orderSettlementAmount', width: 120, render: (v: number) => fmtMoney(v) },
                ]}
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
