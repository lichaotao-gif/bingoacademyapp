import { useState } from 'react'
import { Tabs, Card, Row, Col, Table, Input, Select, DatePicker, Button, Tag, Modal, Form, InputNumber, Space, message } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'
import type { AITestDimension, AITestQuestion, AITestUserRecord, AITestReportAudit } from '@/api/aitest'
import { fmtTime } from '@/utils/format'

const { RangePicker } = DatePicker

const statsMock = {
  totalUsers: 1258,
  userTrend: 8.5,
  todayNew: 68,
  todayTrend: 12.3,
  averageScore: 82.5,
  scoreTrend: 2.1,
  reportCount: 1196,
  reportTrend: 7.8,
}

const trendData = ['1日', '5日', '10日', '15日', '20日', '25日', '30日']
const trendValues = [35, 42, 58, 65, 72, 88, 95]

const dimensionPieData = [
  { value: 30, name: 'AI基础能力' },
  { value: 40, name: 'AI应用能力' },
  { value: 30, name: 'AI创新能力' },
]

const dimensionListMock: AITestDimension[] = [
  { id: 1, name: 'AI基础能力', desc: '包含AI概念、原理、基础工具使用', scoreWeight: 30, createTime: '2024-01-10 10:20:30' },
  { id: 2, name: 'AI应用能力', desc: '包含AI在工作/学习中的实际应用场景', scoreWeight: 40, createTime: '2024-01-12 09:15:20' },
  { id: 3, name: 'AI创新能力', desc: '包含AI场景创新、方案设计能力', scoreWeight: 30, createTime: '2024-01-15 14:30:10' },
]

const questionListMock: AITestQuestion[] = [
  { id: 1, title: '以下哪项不是大语言模型的核心特征？', dimensionName: 'AI基础能力', type: 'single', score: 5 },
  { id: 2, title: 'AI在教育场景中的应用包括哪些？', dimensionName: 'AI应用能力', type: 'multiple', score: 8 },
  { id: 3, title: '请设计一个基于AI的办公效率提升方案', dimensionName: 'AI创新能力', type: 'essay', score: 15 },
]

const userTestListMock: AITestUserRecord[] = [
  { id: 1001, username: '张三', phone: '138****8000', totalScore: 85, testTime: '2024-02-20 14:30:20', status: 'finished' },
  { id: 1002, username: '李四', phone: '139****9010', totalScore: 0, testTime: '2024-02-21 09:15:10', status: 'unfinished' },
]

const auditListMock: AITestReportAudit[] = [
  { reportId: 2001, username: '张三', totalScore: 85, submitTime: '2024-02-20 15:00:20', auditStatus: 'pending' },
  { reportId: 2002, username: '王五', totalScore: 92, submitTime: '2024-02-19 16:20:10', auditStatus: 'passed' },
]

export default function AITestOverview() {
  const [activeTab, setActiveTab] = useState('overview')
  const [dimensionModalOpen, setDimensionModalOpen] = useState(false)
  const [editingDimension, setEditingDimension] = useState<AITestDimension | null>(null)
  const [dimensionForm] = Form.useForm()

  const userTrendOption = {
    xAxis: { type: 'category', data: trendData },
    yAxis: { type: 'value' },
    series: [{ data: trendValues, type: 'line', smooth: true, itemStyle: { color: '#0891b2' } }],
    grid: { left: 60, right: 20, bottom: 40, top: 20 },
  }

  const dimensionPieOption = {
    tooltip: { trigger: 'item' },
    legend: { top: 0, left: 'center' },
    series: [{
      name: '维度分布',
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: false,
      itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
      label: { show: false },
      emphasis: { label: { show: true, fontSize: 16, fontWeight: 'bold' } },
      data: dimensionPieData,
    }],
  }

  const openAddDimension = () => {
    setEditingDimension(null)
    dimensionForm.resetFields()
    setDimensionModalOpen(true)
  }

  const editDimension = (row: AITestDimension) => {
    setEditingDimension(row)
    dimensionForm.setFieldsValue({ name: row.name, desc: row.desc, scoreWeight: row.scoreWeight })
    setDimensionModalOpen(true)
  }

  const saveDimension = async () => {
    try {
      await dimensionForm.validateFields()
      message.success('保存成功')
      setDimensionModalOpen(false)
    } catch {
      //
    }
  }

  const passAudit = (reportId: number) => {
    message.success('审核通过')
  }

  const rejectAudit = (reportId: number) => {
    message.success('已驳回')
  }

  const getAuditStatusTag = (s: string) => {
    const m: Record<string, { text: string; color: string }> = {
      pending: { text: '待审核', color: 'orange' },
      passed: { text: '已通过', color: 'green' },
      rejected: { text: '已驳回', color: 'red' },
    }
    return m[s] || { text: '-', color: 'default' }
  }

  const getQuestionTypeName = (t: string) => {
    const m: Record<string, string> = { single: '单选题', multiple: '多选题', essay: '主观题' }
    return m[t] || t
  }

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ marginBottom: 24 }}>AI能力测评</h2>
      <Tabs activeKey={activeTab} onChange={setActiveTab} type="card">
        {/* 1. 数据概览 */}
        <Tabs.TabPane tab="数据概览" key="overview">
          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col span={6}>
              <Card size="small">
                <div style={{ color: '#666', fontSize: 12 }}>累计测评人数</div>
                <div style={{ fontSize: 22, fontWeight: 600 }}>{statsMock.totalUsers}</div>
                <div style={{ fontSize: 12, color: statsMock.userTrend >= 0 ? '#52c41a' : '#ff4d4f' }}>
                  {Math.abs(statsMock.userTrend)}% {statsMock.userTrend >= 0 ? '↑' : '↓'}
                </div>
              </Card>
            </Col>
            <Col span={6}>
              <Card size="small">
                <div style={{ color: '#666', fontSize: 12 }}>今日新增测评</div>
                <div style={{ fontSize: 22, fontWeight: 600 }}>{statsMock.todayNew}</div>
                <div style={{ fontSize: 12, color: statsMock.todayTrend >= 0 ? '#52c41a' : '#ff4d4f' }}>
                  {Math.abs(statsMock.todayTrend)}% {statsMock.todayTrend >= 0 ? '↑' : '↓'}
                </div>
              </Card>
            </Col>
            <Col span={6}>
              <Card size="small">
                <div style={{ color: '#666', fontSize: 12 }}>平均测评得分</div>
                <div style={{ fontSize: 22, fontWeight: 600 }}>{statsMock.averageScore}</div>
                <div style={{ fontSize: 12, color: statsMock.scoreTrend >= 0 ? '#52c41a' : '#ff4d4f' }}>
                  {Math.abs(statsMock.scoreTrend)}% {statsMock.scoreTrend >= 0 ? '↑' : '↓'}
                </div>
              </Card>
            </Col>
            <Col span={6}>
              <Card size="small">
                <div style={{ color: '#666', fontSize: 12 }}>已生成报告数</div>
                <div style={{ fontSize: 22, fontWeight: 600 }}>{statsMock.reportCount}</div>
                <div style={{ fontSize: 12, color: statsMock.reportTrend >= 0 ? '#52c41a' : '#ff4d4f' }}>
                  {Math.abs(statsMock.reportTrend)}% {statsMock.reportTrend >= 0 ? '↑' : '↓'}
                </div>
              </Card>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={14}>
              <Card title="测评人数趋势（近30天）" size="small">
                <ReactECharts option={userTrendOption} style={{ height: 280 }} />
              </Card>
            </Col>
            <Col span={10}>
              <Card title="测评维度分布" size="small">
                <ReactECharts option={dimensionPieOption} style={{ height: 280 }} />
              </Card>
            </Col>
          </Row>
        </Tabs.TabPane>

        {/* 2. 测评配置 */}
        <Tabs.TabPane tab="测评配置" key="config">
          <Card title="测评维度管理" extra={<Button type="primary" size="small" icon={<PlusOutlined />} onClick={openAddDimension}>新增维度</Button>} style={{ marginBottom: 20 }}>
            <Table
              dataSource={dimensionListMock}
              rowKey="id"
              size="small"
              columns={[
                { title: 'ID', dataIndex: 'id', width: 80 },
                { title: '维度名称', dataIndex: 'name' },
                { title: '维度描述', dataIndex: 'desc' },
                { title: '分值权重', dataIndex: 'scoreWeight', width: 100, render: (v: number) => `${v}%` },
                { title: '创建时间', dataIndex: 'createTime', width: 180, render: (v: string) => fmtTime(v) },
                { title: '操作', width: 160, render: (_, r) => (
                  <Space>
                    <a onClick={() => editDimension(r)}>编辑</a>
                    <a style={{ color: '#ff4d4f' }}>删除</a>
                  </Space>
                )},
              ]}
            />
          </Card>
          <Card title="测评题目管理" extra={<Button type="primary" size="small" icon={<PlusOutlined />}>新增题目</Button>}>
            <Table
              dataSource={questionListMock}
              rowKey="id"
              size="small"
              columns={[
                { title: 'ID', dataIndex: 'id', width: 80 },
                { title: '题目内容', dataIndex: 'title', ellipsis: true },
                { title: '所属维度', dataIndex: 'dimensionName', width: 120 },
                { title: '题型', dataIndex: 'type', width: 100, render: (v: string) => getQuestionTypeName(v) },
                { title: '分值', dataIndex: 'score', width: 80 },
                { title: '操作', width: 160, render: () => (
                  <Space>
                    <a>编辑</a>
                    <a style={{ color: '#ff4d4f' }}>删除</a>
                  </Space>
                )},
              ]}
            />
          </Card>
        </Tabs.TabPane>

        {/* 3. 用户测评管理 */}
        <Tabs.TabPane tab="用户测评管理" key="userTest">
          <Space style={{ marginBottom: 16 }} wrap>
            <Input placeholder="用户名/手机号搜索" style={{ width: 200 }} allowClear />
            <RangePicker placeholder={['开始日期', '结束日期']} />
            <Select placeholder="测评状态" style={{ width: 120 }} allowClear>
              <Select.Option value="unfinished">未完成</Select.Option>
              <Select.Option value="finished">已完成</Select.Option>
            </Select>
            <Button type="primary">查询</Button>
            <Button>重置</Button>
          </Space>
          <Table
            dataSource={userTestListMock}
            rowKey="id"
            size="small"
            pagination={{ total: userTestListMock.length, pageSize: 10, showSizeChanger: true }}
            columns={[
              { title: '测评ID', dataIndex: 'id', width: 90 },
              { title: '用户名', dataIndex: 'username', width: 120 },
              { title: '手机号', dataIndex: 'phone', width: 130 },
              { title: '总分', dataIndex: 'totalScore', width: 80 },
              { title: '测评时间', dataIndex: 'testTime', width: 180, render: (v: string) => fmtTime(v) },
              { title: '状态', dataIndex: 'status', width: 90, render: (v: string) => <Tag color={v === 'finished' ? 'green' : 'orange'}>{v === 'finished' ? '已完成' : '未完成'}</Tag> },
              { title: '操作', width: 200, render: (_, r) => (
                <Space>
                  <a>查看报告</a>
                  <a>导出数据</a>
                </Space>
              )},
            ]}
          />
        </Tabs.TabPane>

        {/* 4. 报告审核 */}
        <Tabs.TabPane tab="报告审核" key="reportAudit">
          <Space style={{ marginBottom: 16 }}>
            <Select placeholder="审核状态" style={{ width: 120 }} allowClear>
              <Select.Option value="pending">待审核</Select.Option>
              <Select.Option value="passed">已通过</Select.Option>
              <Select.Option value="rejected">已驳回</Select.Option>
            </Select>
            <Button type="primary">查询</Button>
          </Space>
          <Table
            dataSource={auditListMock}
            rowKey="reportId"
            size="small"
            pagination={{ total: auditListMock.length, pageSize: 10, showSizeChanger: true }}
            columns={[
              { title: '报告ID', dataIndex: 'reportId', width: 90 },
              { title: '用户名', dataIndex: 'username', width: 120 },
              { title: '测评总分', dataIndex: 'totalScore', width: 100 },
              { title: '提交时间', dataIndex: 'submitTime', width: 180, render: (v: string) => fmtTime(v) },
              { title: '审核状态', dataIndex: 'auditStatus', width: 100, render: (v: string) => {
                const s = getAuditStatusTag(v)
                return <Tag color={s.color}>{s.text}</Tag>
              }},
              { title: '操作', width: 250, render: (_, r) => (
                <Space>
                  <a>查看详情</a>
                  {r.auditStatus === 'pending' && (
                    <>
                      <a style={{ color: '#52c41a' }} onClick={() => passAudit(r.reportId)}>通过</a>
                      <a style={{ color: '#ff4d4f' }} onClick={() => rejectAudit(r.reportId)}>驳回</a>
                    </>
                  )}
                </Space>
              )},
            ]}
          />
        </Tabs.TabPane>
      </Tabs>

      <Modal
        title={editingDimension ? '编辑维度' : '新增维度'}
        open={dimensionModalOpen}
        onOk={saveDimension}
        onCancel={() => setDimensionModalOpen(false)}
        destroyOnClose
      >
        <Form form={dimensionForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="name" label="维度名称" rules={[{ required: true }]}>
            <Input placeholder="如：AI基础能力" />
          </Form.Item>
          <Form.Item name="desc" label="维度描述">
            <Input.TextArea rows={3} placeholder="请输入维度描述" />
          </Form.Item>
          <Form.Item name="scoreWeight" label="分值权重" rules={[{ required: true }]}>
            <InputNumber min={1} max={100} style={{ width: '100%' }} addonAfter="%" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
