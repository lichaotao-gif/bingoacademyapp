import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button, Card, Table, Space, Empty } from 'antd'
import { ArrowLeftOutlined, PlusOutlined } from '@ant-design/icons'

const mockChapters = [
  { chapter_id: 1, title: '第一章 入门基础', sort: 1, lesson_count: 5 },
  { chapter_id: 2, title: '第二章 进阶实战', sort: 2, lesson_count: 8 },
]

export default function CourseChapter() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const courseId = searchParams.get('courseId')
  const courseName = searchParams.get('courseName') || '课程'

  const columns = [
    { title: '章节名称', dataIndex: 'title', key: 'title' },
    { title: '排序', dataIndex: 'sort', key: 'sort', width: 80 },
    { title: '课时数', dataIndex: 'lesson_count', key: 'lesson_count', width: 100 },
    {
      title: '操作',
      key: 'action',
      width: 180,
      render: () => (
        <Space>
          <a>编辑</a>
          <a>课时管理</a>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/course/list')}>
          返回课程列表
        </Button>
        <span style={{ fontSize: 16, fontWeight: 500 }}>{decodeURIComponent(courseName)} - 章节管理</span>
      </div>
      <Card>
        <div style={{ marginBottom: 16 }}>
          <Button type="primary" icon={<PlusOutlined />}>新增章节</Button>
        </div>
        <Table
          rowKey="chapter_id"
          columns={columns}
          dataSource={courseId ? mockChapters : []}
          locale={{ emptyText: <Empty description={courseId ? '暂无章节' : '请从课程列表进入'} /> }}
          pagination={false}
        />
      </Card>
    </div>
  )
}
