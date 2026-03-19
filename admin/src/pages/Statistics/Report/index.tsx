import { useState } from 'react'
import { Card, Dropdown, Button, Modal, Form, DatePicker, Checkbox, Radio, message, Table } from 'antd'
import { DownloadOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'

const { RangePicker } = DatePicker

const CATEGORY_OPTIONS = [
  { value: 'student', label: '学员数据' },
  { value: 'course', label: '课程数据' },
  { value: 'match', label: '赛事数据' },
  { value: 'cooperation', label: '合作数据' },
  { value: 'operation', label: '运营数据' },
  { value: 'combined', label: '综合统计' },
]

const FORMAT_OPTIONS = [
  { value: 'xlsx', label: 'Excel (.xlsx)' },
  { value: 'csv', label: 'CSV (.csv)' },
  { value: 'pdf', label: 'PDF (.pdf)' },
]

const mockRecords = [
  { fileId: '1', fileName: '缤果AI学院_学员数据_20240215.xlsx', format: 'xlsx', exportTime: '2024-02-15 10:30:00', exportUser: '管理员' },
  { fileId: '2', fileName: '缤果AI学院_课程赛事_20240214.csv', format: 'csv', exportTime: '2024-02-14 16:20:00', exportUser: '管理员' },
]

export default function StatisticsReport() {
  const [form] = Form.useForm()
  const [modalOpen, setModalOpen] = useState(false)
  const [exportLoading, setExportLoading] = useState(false)
  const [records] = useState(mockRecords)

  const handleQuickExport = (key: string) => {
    if (key === 'custom') {
      setModalOpen(true)
      return
    }
    setExportLoading(true)
    // 解析：excel_7d | csv_month
    const [format, period] = key.split('_')
    const end = dayjs()
    const start = period === '7d' ? end.subtract(7, 'day') : end.startOf('month')
    const timeRange: [string, string] = [start.format('YYYY-MM-DD'), end.format('YYYY-MM-DD')]
    setTimeout(() => {
      const fileName = `缤果AI学院_${period === '7d' ? '近7天' : '本月'}_${dayjs().format('YYYYMMDDHHmm')}.${format}`
      message.success('导出成功')
      // 实际项目中：window.open(downloadUrl) 或创建 a 标签下载
      setExportLoading(false)
    }, 1500)
  }

  const handleCustomExport = async () => {
    try {
      const values = await form.validateFields()
      const timeRange = values.timeRange as [dayjs.Dayjs, dayjs.Dayjs]
      if (!timeRange?.length) {
        message.warning('请选择统计时间')
        return
      }
      if (!values.categories?.length) {
        message.warning('请选择报表维度')
        return
      }
      setExportLoading(true)
      const range: [string, string] = [timeRange[0].format('YYYY-MM-DD'), timeRange[1].format('YYYY-MM-DD')]
      // 实际调用 exportReport({ timeRange: range, categories: values.categories, format: values.format })
      await new Promise((r) => setTimeout(r, 1500))
      message.success('导出成功')
      setModalOpen(false)
      form.resetFields()
    } catch {
      //
    } finally {
      setExportLoading(false)
    }
  }

  const handleDownload = (record: { fileId: string; fileName: string }) => {
    message.info(`下载文件：${record.fileName}`)
    // 实际：window.open(`/api/statistics/export/download/${record.fileId}`)
  }

  const menuItems = [
    { key: 'excel_7d', label: '近7天数据 (Excel)' },
    { key: 'csv_month', label: '本月数据 (CSV)' },
    { key: 'custom', label: '自定义导出' },
  ]

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ margin: 0 }}>报表导出</h2>
        <Dropdown
          menu={{
            items: menuItems,
            onClick: ({ key }) => handleQuickExport(key),
          }}
        >
          <Button type="primary" icon={<DownloadOutlined />} loading={exportLoading}>报表导出</Button>
        </Dropdown>
      </div>

      <Card title="导出说明">
        <p style={{ marginBottom: 8 }}>• 快速导出：近7天/本月数据一键导出，默认Excel或CSV格式；</p>
        <p style={{ marginBottom: 8 }}>• 自定义导出：选择时间范围、报表维度、导出格式后导出；</p>
        <p>• 支持维度：学员数据、课程数据、赛事数据、合作数据、运营数据、综合统计。</p>
      </Card>

      <Card title="导出记录" style={{ marginTop: 20 }}>
        <Table
          dataSource={records}
          rowKey="fileId"
          size="small"
          pagination={{ pageSize: 10, showTotal: (t) => `共 ${t} 条` }}
          columns={[
            { title: '文件名', dataIndex: 'fileName', ellipsis: true },
            { title: '格式', dataIndex: 'format', width: 80 },
            { title: '导出时间', dataIndex: 'exportTime', width: 170 },
            { title: '导出人', dataIndex: 'exportUser', width: 100 },
            {
              title: '操作',
              width: 100,
              render: (_, record) => (
                <a onClick={() => handleDownload(record)}>下载</a>
              ),
            },
          ]}
        />
      </Card>

      <Modal
        title="自定义报表导出"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleCustomExport}
        confirmLoading={exportLoading}
        destroyOnClose
        width={560}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }} initialValues={{ format: 'xlsx' }}>
          <Form.Item name="timeRange" label="统计时间" rules={[{ required: true, message: '请选择时间范围' }]}>
            <RangePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
          </Form.Item>
          <Form.Item name="categories" label="报表维度" rules={[{ required: true, message: '请选择至少一个维度' }]}>
            <Checkbox.Group options={CATEGORY_OPTIONS} />
          </Form.Item>
          <Form.Item name="format" label="导出格式">
            <Radio.Group options={FORMAT_OPTIONS} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
