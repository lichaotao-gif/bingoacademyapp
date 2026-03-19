import { useState, useRef } from 'react'
import { ProTable } from '@ant-design/pro-components'
import type { ProColumns, ActionType } from '@ant-design/pro-components'
import { Button, Space, Tag, message, Empty, Popconfirm } from 'antd'
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { mockPage } from '@/api/mock'
import type { Course } from '@/api/course'
import { fmtTime, fmtMoney } from '@/utils/format'
import AuthButton from '@/components/common/AuthButton'
import { PERM } from '@/utils/auth'

const mockList: Course[] = [
  { course_id: 1, course_name: 'AI精英启蒙课', category_id: 1, sale_price: 299, status: 1, is_hot: 1, is_recommend: 1, create_time: '2024-01-01 10:00:00' },
  { course_id: 2, course_name: 'AI精英进阶课', category_id: 1, sale_price: 599, status: 1, is_hot: 1, is_recommend: 0, create_time: '2024-01-15 09:00:00' },
]

export default function CourseList() {
  const navigate = useNavigate()
  const actionRef = useRef<ActionType>()

  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
  const [batchLoading, setBatchLoading] = useState(false)

  const handleAdd = () => {
    navigate('/course/edit')
  }

  const handleBatchDelete = async () => {
    if (selectedRowKeys.length === 0) return
    setBatchLoading(true)
    try {
      await new Promise((r) => setTimeout(r, 500))
      message.success(`批量删除成功，共删除 ${selectedRowKeys.length} 条`)
      setSelectedRowKeys([])
      actionRef.current?.reload()
    } finally {
      setBatchLoading(false)
    }
  }

  const goChapter = (courseId: number, courseName: string) => {
    navigate(`/course/chapter?courseId=${courseId}&courseName=${encodeURIComponent(courseName)}`)
  }

  const columns: ProColumns<Course>[] = [
    { title: '课程ID', dataIndex: 'course_id', width: 90, hideInSearch: true },
    { title: '关键词', dataIndex: 'keyword', hideInTable: true, fieldProps: { placeholder: '课程名称' } },
    { title: '状态', dataIndex: 'status', width: 90, valueType: 'select', valueEnum: { 1: { text: '已上架' }, 0: { text: '未上架' } }, render: (_, r) => (r.status === 1 ? <Tag color="green">已上架</Tag> : <Tag>未上架</Tag>) },
    { title: '课程名称', dataIndex: 'course_name', width: 180, hideInSearch: true },
    { title: '分类', dataIndex: 'category_id', width: 100, hideInSearch: true, render: () => 'AI课程' },
    { title: '售价', dataIndex: 'sale_price', width: 100, hideInSearch: true, render: (_, r) => fmtMoney(r.sale_price) },
    { title: '热门', dataIndex: 'is_hot', width: 70, hideInSearch: true, render: (_, r) => (r.is_hot ? <Tag color="orange">是</Tag> : '-') },
    { title: '推荐', dataIndex: 'is_recommend', width: 70, hideInSearch: true, render: (_, r) => (r.is_recommend ? <Tag color="blue">是</Tag> : '-') },
    { title: '创建时间', dataIndex: 'create_time', width: 170, hideInSearch: true, render: (_, r) => fmtTime(r.create_time) },
    {
      title: '操作',
      valueType: 'option',
      width: 220,
      render: (_, r) => (
        <Space>
          <AuthButton permCode={PERM.COURSE_EDIT}>
            <a onClick={() => navigate(`/course/edit?id=${r.course_id}`)}>编辑</a>
          </AuthButton>
          <a onClick={() => goChapter(r.course_id, r.course_name)}>章节管理</a>
          <AuthButton permCode={PERM.COURSE_DELETE}>
            <Popconfirm title="确定删除该课程？" onConfirm={() => message.success('删除成功')}>
              <a style={{ color: '#ff4d4f' }}>删除</a>
            </Popconfirm>
          </AuthButton>
        </Space>
      ),
    },
  ]

  const request = async (params: { current?: number; pageSize?: number; keyword?: string; status?: number }) => {
    const { current = 1, pageSize = 10, keyword, status } = params
    let list = [...mockList]
    if (status !== undefined && status !== null) list = list.filter((c) => c.status === status)
    if (keyword) list = list.filter((c) => c.course_name?.includes(String(keyword)))
    const res = mockPage(list, current, pageSize)
    return { data: res.data as Course[], total: res.total, success: true }
  }

  const selectedCount = selectedRowKeys.length

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>课程列表</h2>
      <ProTable<Course>
        rowKey="course_id"
        actionRef={actionRef}
        columns={columns}
        request={request}
        rowSelection={{
          selectedRowKeys,
          onChange: (keys) => setSelectedRowKeys(keys),
        }}
        search={{ labelWidth: 'auto' }}
        locale={{ emptyText: <Empty description="暂无数据" /> }}
        pagination={{ defaultPageSize: 10, showSizeChanger: true }}
        toolBarRender={() => [
          <AuthButton key="add" permCode={PERM.COURSE_EDIT}>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>新增课程</Button>
          </AuthButton>,
          <AuthButton key="batch" permCode={PERM.COURSE_BATCH}>
            <Popconfirm
              title={`确定删除选中的 ${selectedCount} 条课程？`}
              onConfirm={handleBatchDelete}
            >
              <Button
                danger
                icon={<DeleteOutlined />}
                loading={batchLoading}
                disabled={selectedCount === 0}
                style={selectedCount > 0 ? { background: '#fff2f0', borderColor: '#ffccc7' } : undefined}
              >
                批量删除{selectedCount > 0 ? `（${selectedCount}条）` : ''}
              </Button>
            </Popconfirm>
          </AuthButton>,
        ]}
      />
    </div>
  )
}
