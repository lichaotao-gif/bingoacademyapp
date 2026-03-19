import { ProTable } from '@ant-design/pro-components'
import type { ProColumns } from '@ant-design/pro-components'
import { Form, DatePicker, Select, Button, Tag, Empty } from 'antd'
import { mockPage } from '@/api/mock'
import { fmtTime } from '@/utils/format'

const { RangePicker } = DatePicker

interface LogRecord {
  log_id: number
  admin_name: string
  module: string
  action: string
  result: number
  ip: string
  create_time: string
}

const mockList: LogRecord[] = [
  { log_id: 1, admin_name: 'admin', module: '账号管理', action: '新增管理员', result: 1, ip: '192.168.1.1', create_time: '2024-02-15 10:30:00' },
  { log_id: 2, admin_name: 'ops', module: '赛事管理', action: '批量审核报名', result: 1, ip: '192.168.1.2', create_time: '2024-02-15 09:15:00' },
]

const moduleOptions = [
  { label: '全部', value: '' },
  { label: '账号管理', value: '账号管理' },
  { label: '赛事管理', value: '赛事管理' },
  { label: '课程管理', value: '课程管理' },
]

export default function SystemLog() {
  const [form] = Form.useForm()

  const columns: ProColumns<LogRecord>[] = [
    { title: '日志ID', dataIndex: 'log_id', width: 90 },
    { title: '操作人', dataIndex: 'admin_name', width: 100 },
    { title: '操作模块', dataIndex: 'module', width: 110 },
    { title: '操作描述', dataIndex: 'action', width: 160 },
    { title: '操作结果', dataIndex: 'result', width: 90, render: (_, r) => (r.result === 1 ? <Tag color="green">成功</Tag> : <Tag color="red">失败</Tag>) },
    { title: 'IP', dataIndex: 'ip', width: 120 },
    { title: '操作时间', dataIndex: 'create_time', width: 180, render: (_, r) => fmtTime(r.create_time) },
  ]

  const request = async (params: { current?: number; pageSize?: number }) => {
    const { current = 1, pageSize = 10 } = params
    const res = mockPage(mockList, current, pageSize)
    return { data: res.data as LogRecord[], total: res.total, success: true }
  }

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>操作日志</h2>
      <ProTable<LogRecord>
        rowKey="log_id"
        columns={columns}
        request={request}
        search={false}
        locale={{ emptyText: <Empty description="暂无数据" /> }}
        pagination={{ defaultPageSize: 10, showSizeChanger: true }}
        toolBarRender={() => [
          <Form key="filter" form={form} layout="inline" style={{ marginBottom: 0 }}>
            <Form.Item name="dateRange" label="时间范围">
              <RangePicker />
            </Form.Item>
            <Form.Item name="module" label="操作模块">
              <Select options={moduleOptions} style={{ width: 120 }} placeholder="请选择" />
            </Form.Item>
            <Form.Item>
              <Button type="primary">查询</Button>
              <Button style={{ marginLeft: 8 }}>重置</Button>
            </Form.Item>
          </Form>,
        ]}
      />
    </div>
  )
}
