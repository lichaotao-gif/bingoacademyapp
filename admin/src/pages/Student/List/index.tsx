import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ProTable } from '@ant-design/pro-components'
import type { ProColumns, ActionType } from '@ant-design/pro-components'
import { Button, Space, Tag, Modal, Form, Input, Select, message, Empty, Descriptions, Table } from 'antd'
import { PlusOutlined, LockOutlined, UnlockOutlined, DownloadOutlined } from '@ant-design/icons'
import { mockPage } from '@/api/mock'
import type { Student, StudentStatus } from '@/api/student'
import {
  getStudentSchoolHistory,
  listSchools,
  listSiteStudentsWithSchool,
  type StudentEnrollmentHistoryRow,
} from '@/mock/schools'
import { fmtTime, fmtMoney, maskPhone } from '@/utils/format'
import AuthButton from '@/components/common/AuthButton'
import { PERM } from '@/utils/auth'

const STATUS_MAP: Record<StudentStatus, { text: string; color: string }> = {
  1: { text: '正常', color: 'green' },
  2: { text: '冻结', color: 'orange' },
  3: { text: '待审核', color: 'blue' },
  4: { text: '注销', color: 'red' },
}

const SCHOOL_ENROLL_STATUS_MAP: Record<string, { text: string; color: string }> = {
  active: { text: '在读', color: 'green' },
  suspended: { text: '已暂停', color: 'orange' },
  removed: { text: '已转出', color: 'default' },
}

const GRADE_OPTIONS = [
  { label: '小学三年级', value: '小学三年级' },
  { label: '初中一年级', value: '初中一年级' },
  { label: '初中二年级', value: '初中二年级' },
  { label: '高一', value: '高一' },
  { label: '高二', value: '高二' },
  { label: '高三', value: '高三' },
]

const CLASS_BY_GRADE: Record<string, { label: string; value: string }[]> = {
  小学三年级: [{ label: '3年1班', value: '3年1班' }, { label: '3年2班', value: '3年2班' }],
  初中一年级: [{ label: '初一1班', value: '初一1班' }, { label: '初一2班', value: '初一2班' }],
  初中二年级: [{ label: '初二1班', value: '初二1班' }],
  高一: [{ label: '高一1班', value: '高一1班' }, { label: '高一2班', value: '高一2班' }],
  高二: [{ label: '高二1班', value: '高二1班' }],
  高三: [{ label: '高三1班', value: '高三1班' }],
}

const SOURCE_OPTIONS = [
  { label: '官网', value: '官网' },
  { label: '线下推广', value: '线下推广' },
  { label: '推荐', value: '推荐' },
]

const mockList: Student[] = [
  { student_id: 1, real_name: '张小明', phone: '13800138000', grade: '小学三年级', status: 1, ai_test_level: '进阶', total_points: 120, commission_balance: 0, create_time: '2024-01-10 14:00:00', source: '官网' },
  { student_id: 2, real_name: '李华', phone: '13900139000', grade: '初中一年级', status: 2, ai_test_level: '启蒙', total_points: 50, commission_balance: 0, create_time: '2024-02-05 09:30:00', source: '线下推广' },
]

const phoneReg = /^1[3-9]\d{9}$/

export default function StudentList() {
  const navigate = useNavigate()
  const toast = message
  const actionRef = useRef<ActionType>(undefined)
  const [addForm] = Form.useForm()

  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
  const [freezeModalOpen, setFreezeModalOpen] = useState(false)
  const [freezeType, setFreezeType] = useState<'freeze' | 'unfreeze'>('freeze')
  const [freezeRecord, setFreezeRecord] = useState<Student | null>(null)
  const [freezeReason, setFreezeReason] = useState('')
  const [freezeLoading, setFreezeLoading] = useState(false)
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [addLoading, setAddLoading] = useState(false)
  const [addFormGrade, setAddFormGrade] = useState<string | undefined>()
  const [schoolHistoryTarget, setSchoolHistoryTarget] = useState<Student | null>(null)
  const addFormClassOptions = addFormGrade ? (CLASS_BY_GRADE[addFormGrade] || []) : []
  const schoolValueEnum = Object.fromEntries(listSchools().map((s) => [s.id, { text: s.name }]))
  const schoolHistory = schoolHistoryTarget?.school_student_id
    ? getStudentSchoolHistory(schoolHistoryTarget.school_student_id)
    : []

  const handleFreeze = (record: Student, type: 'freeze' | 'unfreeze') => {
    setFreezeRecord(record)
    setFreezeType(type)
    setFreezeReason('')
    setFreezeModalOpen(true)
  }

  const handleBatchFreeze = () => {
    setFreezeRecord(null)
    setFreezeType('freeze')
    setFreezeReason('批量冻结')
    setFreezeModalOpen(true)
  }

  const handleBatchUnfreeze = () => {
    setFreezeRecord(null)
    setFreezeType('unfreeze')
    setFreezeReason('批量解冻')
    setFreezeModalOpen(true)
  }

  const confirmFreeze = async () => {
    if (freezeType === 'freeze' && !freezeReason.trim()) {
      toast.warning('请输入冻结原因')
      return
    }
    setFreezeLoading(true)
    try {
      await new Promise((r) => setTimeout(r, 500))
      toast.success(freezeType === 'freeze' ? '冻结成功' : '解冻成功')
      setFreezeModalOpen(false)
      setSelectedRowKeys([])
      actionRef.current?.reload()
    } finally {
      setFreezeLoading(false)
    }
  }

  const handleAdd = () => {
    addForm.resetFields()
    setAddFormGrade(undefined)
    setAddModalOpen(true)
  }

  const handleAddSubmit = async () => {
    try {
      await addForm.validateFields()
    } catch {
      return
    }
    setAddLoading(true)
    try {
      await new Promise((r) => setTimeout(r, 500))
      toast.success('新增学员成功')
      setAddModalOpen(false)
      actionRef.current?.reload()
    } finally {
      setAddLoading(false)
    }
  }

  const statusValueEnum: Record<number, { text: string }> = Object.fromEntries(
    Object.entries(STATUS_MAP).map(([k, v]) => [Number(k), { text: v.text }])
  )

  const columns: ProColumns<Student>[] = [
    { title: '学员ID', dataIndex: 'student_id', width: 110, sorter: true, hideInSearch: true },
    { title: '关键词', dataIndex: 'keyword', hideInTable: true, fieldProps: { placeholder: '姓名/手机号' } },
    {
      title: '所属学校',
      dataIndex: 'school_id',
      valueType: 'select',
      valueEnum: schoolValueEnum,
      hideInTable: true,
      fieldProps: { placeholder: '全部学校' },
    },
    {
      title: '归属状态',
      dataIndex: 'school_enroll_status',
      valueType: 'select',
      valueEnum: Object.fromEntries(
        Object.entries(SCHOOL_ENROLL_STATUS_MAP).map(([key, value]) => [key, { text: value.text }])
      ),
      hideInTable: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 90,
      valueType: 'select',
      valueEnum: statusValueEnum,
      render: (_, r) => {
        const s = STATUS_MAP[r.status as StudentStatus] || STATUS_MAP[1]
        return <Tag color={s.color}>{s.text}</Tag>
      },
    },
    { title: '姓名', dataIndex: 'real_name', width: 100, hideInSearch: true },
    { title: '手机号', dataIndex: 'phone', width: 130, hideInSearch: true, render: (_, r) => maskPhone(r.phone) },
    {
      title: '所属学校',
      dataIndex: 'school_name',
      width: 180,
      hideInSearch: true,
      render: (_, r) =>
        r.school_id ? (
          <a onClick={() => navigate(`/school/detail?id=${r.school_id}`)}>{r.school_name}</a>
        ) : (
          <span style={{ color: '#999' }}>非学校学员</span>
        ),
    },
    {
      title: '归属状态',
      dataIndex: 'school_enroll_status',
      width: 100,
      hideInSearch: true,
      render: (_, r) => {
        const status = r.school_enroll_status ? SCHOOL_ENROLL_STATUS_MAP[r.school_enroll_status] : null
        return status ? <Tag color={status.color}>{status.text}</Tag> : '—'
      },
    },
    {
      title: '学校证书',
      dataIndex: 'school_certificate_count',
      width: 100,
      hideInSearch: true,
      render: (_, r) => (r.school_student_id ? `${r.school_certificate_count || 0} 张` : '—'),
    },
    { title: '年级', dataIndex: 'grade', width: 110, hideInSearch: true },
    { title: '测评等级', dataIndex: 'ai_test_level', width: 90 },
    { title: '公益积分', dataIndex: 'total_points', width: 90 },
    { title: '佣金余额', dataIndex: 'commission_balance', width: 100, render: (_, r) => fmtMoney(r.commission_balance) },
    { title: '注册时间', dataIndex: 'create_time', width: 170, render: (_, r) => fmtTime(r.create_time), sorter: true },
    {
      title: '操作',
      valueType: 'option',
      width: 280,
      render: (_, r) => (
        <Space>
          <a>编辑</a>
          <a>详情</a>
          {r.school_student_id ? <a onClick={() => setSchoolHistoryTarget(r)}>学校档案</a> : null}
          {(r.status === 1 || r.status === 3) && (
            <AuthButton permCode={PERM.STUDENT_FREEZE}>
              <a style={{ color: '#fa8c16' }} onClick={(e) => { e.stopPropagation(); handleFreeze(r, 'freeze'); }}>冻结</a>
            </AuthButton>
          )}
          {r.status === 2 && (
            <AuthButton permCode={PERM.STUDENT_FREEZE}>
              <a style={{ color: '#52c41a' }} onClick={(e) => { e.stopPropagation(); handleFreeze(r, 'unfreeze'); }}>解冻</a>
            </AuthButton>
          )}
        </Space>
      ),
    },
  ]

  const request = async (params: {
    current?: number
    pageSize?: number
    keyword?: string
    status?: number
    school_id?: string
    school_enroll_status?: string
  }) => {
    const { current = 1, pageSize = 10, keyword, status, school_id, school_enroll_status } = params
    const schoolStudents: Student[] = listSiteStudentsWithSchool().map((student) => ({
      student_id: `school_${student.id}`,
      school_student_id: student.id,
      real_name: student.name,
      phone: student.phone,
      grade: '—',
      status: student.status === 'disabled' ? 2 : 1,
      ai_test_level: '—',
      total_points: 0,
      commission_balance: 0,
      create_time: student.createdAt,
      source: student.source === 'site' ? '官网' : '学校录入',
      school_id: student.schoolId,
      school_name: student.schoolName,
      school_enroll_status: student.enrollStatus,
      school_certificate_count: student.certificateCount,
    }))
    const schoolPhones = new Set(schoolStudents.map((student) => student.phone))
    let list: Student[] = [...mockList.filter((student) => !schoolPhones.has(student.phone)), ...schoolStudents]
    if (status) list = list.filter((student) => student.status === status)
    if (school_id) list = list.filter((student) => student.school_id === school_id)
    if (school_enroll_status) {
      list = list.filter((student) => student.school_enroll_status === school_enroll_status)
    }
    if (keyword) {
      const k = String(keyword).toLowerCase()
      list = list.filter(
        (student) =>
          student.real_name?.toLowerCase().includes(k) ||
          student.phone?.includes(k) ||
          student.school_name?.toLowerCase().includes(k)
      )
    }
    const res = mockPage(list, current, pageSize)
    return { data: res.data as Student[], total: res.total, success: true }
  }

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>学员信息</h2>
      <ProTable<Student>
        rowKey="student_id"
        actionRef={actionRef}
        columns={columns}
        request={request}
        rowSelection={{
          selectedRowKeys,
          onChange: (keys) => setSelectedRowKeys(keys),
        }}
        search={{
          labelWidth: 'auto',
          defaultCollapsed: false,
        }}
        locale={{ emptyText: <Empty description="暂无数据" /> }}
        pagination={{ defaultPageSize: 10, showSizeChanger: true }}
        toolBarRender={() => [
          <AuthButton key="add" permCode={PERM.STUDENT_EDIT}>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>新增学员</Button>
          </AuthButton>,
          <AuthButton key="batchFreeze" permCode={PERM.STUDENT_BATCH}>
            <Button icon={<LockOutlined />} onClick={handleBatchFreeze} disabled={selectedRowKeys.length === 0}>批量冻结</Button>
          </AuthButton>,
          <AuthButton key="batchUnfreeze" permCode={PERM.STUDENT_BATCH}>
            <Button icon={<UnlockOutlined />} onClick={handleBatchUnfreeze} disabled={selectedRowKeys.length === 0}>批量解冻</Button>
          </AuthButton>,
          <AuthButton key="export" permCode={PERM.STUDENT_EXPORT}>
            <Button icon={<DownloadOutlined />} onClick={() => toast.info('导出功能需对接后端接口')} disabled={selectedRowKeys.length === 0}>导出</Button>
          </AuthButton>,
        ]}
      />

      <Modal
        title={schoolHistoryTarget ? `学校档案：${schoolHistoryTarget.real_name}` : '学校档案'}
        open={!!schoolHistoryTarget}
        onCancel={() => setSchoolHistoryTarget(null)}
        footer={null}
        width={920}
        destroyOnHidden
      >
        {schoolHistoryTarget ? (
          <>
            <Descriptions bordered size="small" column={3} style={{ marginBottom: 16 }}>
              <Descriptions.Item label="当前学校">
                {schoolHistoryTarget.school_id ? (
                  <a
                    onClick={() => {
                      setSchoolHistoryTarget(null)
                      navigate(`/school/detail?id=${schoolHistoryTarget.school_id}`)
                    }}
                  >
                    {schoolHistoryTarget.school_name}
                  </a>
                ) : (
                  '未归属学校'
                )}
              </Descriptions.Item>
              <Descriptions.Item label="归属状态">
                {schoolHistoryTarget.school_enroll_status ? (
                  <Tag color={SCHOOL_ENROLL_STATUS_MAP[schoolHistoryTarget.school_enroll_status]?.color}>
                    {SCHOOL_ENROLL_STATUS_MAP[schoolHistoryTarget.school_enroll_status]?.text || '—'}
                  </Tag>
                ) : (
                  '—'
                )}
              </Descriptions.Item>
              <Descriptions.Item label="学校证书">
                {schoolHistoryTarget.school_certificate_count || 0} 张
              </Descriptions.Item>
            </Descriptions>
            <Table<StudentEnrollmentHistoryRow>
              rowKey="id"
              size="small"
              pagination={false}
              scroll={{ x: 780 }}
              locale={{ emptyText: '暂无学校归属历史' }}
              columns={[
                {
                  title: '学校',
                  dataIndex: 'schoolName',
                  key: 'schoolName',
                  width: 180,
                  render: (_, r) => <a onClick={() => navigate(`/school/detail?id=${r.schoolId}`)}>{r.schoolName}</a>,
                },
                {
                  title: '状态',
                  key: 'status',
                  width: 100,
                  render: (_, r) => {
                    const status = SCHOOL_ENROLL_STATUS_MAP[r.status]
                    return <Tag color={status?.color}>{status?.text || r.status}</Tag>
                  },
                },
                { title: '加入时间', key: 'joinedAt', width: 170, render: (_, r) => fmtTime(r.joinedAt) },
                {
                  title: '转出时间',
                  key: 'removedAt',
                  width: 170,
                  render: (_, r) => (r.removedAt ? fmtTime(r.removedAt) : '—'),
                },
                {
                  title: '关联班级',
                  key: 'classes',
                  render: (_, r) => (r.classes.length ? r.classes.map((item) => item.name).join('、') : '未分班'),
                },
              ]}
              dataSource={schoolHistory}
            />
          </>
        ) : null}
      </Modal>

      {/* 冻结/解冻弹窗 */}
      <Modal
        title={freezeType === 'freeze' ? '冻结学员' : '解冻学员'}
        open={freezeModalOpen}
        onOk={confirmFreeze}
        onCancel={() => setFreezeModalOpen(false)}
        confirmLoading={freezeLoading}
        destroyOnClose
      >
        {freezeRecord && <p style={{ marginBottom: 16 }}>学员：{freezeRecord.real_name}（{maskPhone(freezeRecord.phone)})</p>}
        {!freezeRecord && selectedRowKeys.length > 0 && <p style={{ marginBottom: 16 }}>已选 {selectedRowKeys.length} 名学员</p>}
        {freezeType === 'freeze' && (
          <Form layout="vertical">
            <Form.Item label="冻结原因" required>
              <Input.TextArea rows={3} value={freezeReason} onChange={(e) => setFreezeReason(e.target.value)} placeholder="请输入冻结原因（必填）" />
            </Form.Item>
          </Form>
        )}
      </Modal>

      {/* 新增学员弹窗 */}
      <Modal
        title="新增学员"
        open={addModalOpen}
        onOk={handleAddSubmit}
        onCancel={() => setAddModalOpen(false)}
        confirmLoading={addLoading}
        destroyOnClose
        width={480}
      >
        <Form form={addForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="real_name" label="姓名" rules={[{ required: true, message: '请输入姓名' }]}>
            <Input placeholder="请输入姓名" />
          </Form.Item>
          <Form.Item
            name="phone"
            label="手机号"
            rules={[
              { required: true, message: '请输入手机号' },
              { pattern: phoneReg, message: '请输入正确的手机号格式' },
            ]}
          >
            <Input placeholder="请输入手机号" />
          </Form.Item>
          <Form.Item name="grade" label="年级">
            <Select placeholder="请选择年级" options={GRADE_OPTIONS} allowClear onChange={(v) => { setAddFormGrade(v); addForm.setFieldValue('class_name', undefined); }} />
          </Form.Item>
          <Form.Item name="class_name" label="班级">
            <Select placeholder="请先选择年级" options={addFormClassOptions} allowClear disabled={!addFormGrade} />
          </Form.Item>
          <Form.Item name="source" label="注册来源">
            <Select placeholder="请选择" options={SOURCE_OPTIONS} allowClear />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
