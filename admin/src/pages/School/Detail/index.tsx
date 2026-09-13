import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Button,
  Card,
  Descriptions,
  Empty,
  Modal,
  Select,
  Space,
  Table,
  Tag,
  Transfer,
  Typography,
  message,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import {
  ACCOUNT_STATUS,
  SCHOOL_COURSE_CATALOG,
  SCHOOL_LOGIN_PATH,
  SCHOOL_ROLE,
  SCHOOL_STATUS,
  getSchoolDetail,
  getStudentSchoolHistory,
  listGrantedCourseIds,
  listSchoolAccounts,
  listSchoolClasses,
  listSchoolLogs,
  listSchoolStudents,
  listSchools,
  setCourseGrants,
  transferStudentSchool,
  type SchoolAccountRow,
  type SchoolClassRow,
  type SchoolLogRow,
  type SchoolStudentRow,
  type StudentEnrollmentHistoryRow,
} from '@/mock/schools'
import { fmtTime, maskPhone } from '@/utils/format'

const STATUS_TAG: Record<string, { text: string; color: string }> = {
  active: { text: '已启用', color: 'green' },
  disabled: { text: '已停用', color: 'red' },
}

export default function SchoolDetail() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const schoolId = searchParams.get('id') || ''
  const [tick, setTick] = useState(0)
  const refresh = () => setTick((n) => n + 1)

  const school = useMemo(() => {
    void tick
    return schoolId ? getSchoolDetail(schoolId) : null
  }, [schoolId, tick])

  const accounts = useMemo<SchoolAccountRow[]>(() => {
    void tick
    return school ? listSchoolAccounts(school.id) : []
  }, [school, tick])

  const classes = useMemo<SchoolClassRow[]>(() => {
    void tick
    return school ? listSchoolClasses(school) : []
  }, [school, tick])

  const students = useMemo<SchoolStudentRow[]>(() => {
    void tick
    return school ? listSchoolStudents(school) : []
  }, [school, tick])

  const logs = useMemo<SchoolLogRow[]>(() => {
    void tick
    return school ? listSchoolLogs(school.id) : []
  }, [school, tick])

  const grantedIds = useMemo(() => {
    void tick
    return school ? listGrantedCourseIds(school.id) : []
  }, [school, tick])

  const [draftIds, setDraftIds] = useState<string[] | null>(null)
  const selectedIds = draftIds ?? grantedIds

  const saveGrants = () => {
    if (!school || draftIds == null) return
    const r = setCourseGrants(school.id, draftIds)
    if (!r.ok) {
      message.error(r.msg || '保存失败')
      return
    }
    message.success('课程授权已更新')
    setDraftIds(null)
    refresh()
  }

  const [transferTarget, setTransferTarget] = useState<SchoolStudentRow | null>(null)
  const [targetSchoolId, setTargetSchoolId] = useState<string>('')

  const openTransfer = (row: SchoolStudentRow) => {
    setTargetSchoolId('')
    setTransferTarget(row)
  }

  const doTransfer = () => {
    if (!transferTarget) return
    if (!targetSchoolId) {
      message.warning('请选择目标学校')
      return
    }
    const r = transferStudentSchool(transferTarget.id, targetSchoolId)
    if (!r.ok) {
      message.error(r.msg || '转校失败')
      return
    }
    message.success('转校完成，学习历史已保留')
    setTransferTarget(null)
    refresh()
  }

  if (!school) {
    return (
      <Card>
        <Empty description="学校不存在或已被删除">
          <Button type="primary" onClick={() => navigate('/school/list')}>
            返回学校列表
          </Button>
        </Empty>
      </Card>
    )
  }

  const accountColumns: ColumnsType<SchoolAccountRow> = [
    { title: '姓名', dataIndex: 'name', key: 'name', width: 140 },
    { title: '登录手机号', key: 'phone', width: 140, render: (_, r) => maskPhone(r.phone) },
    {
      title: '角色',
      key: 'role',
      width: 120,
      render: (_, r) =>
        r.role === SCHOOL_ROLE.OWNER ? <Tag color="blue">总管理员</Tag> : <Tag>老师（子管理员）</Tag>,
    },
    { title: '主讲班级', dataIndex: 'classCount', key: 'classCount', width: 100 },
    {
      title: '状态',
      key: 'status',
      width: 100,
      render: (_, r) =>
        r.status === ACCOUNT_STATUS.ACTIVE ? <Tag color="green">正常</Tag> : <Tag color="red">已停用</Tag>,
    },
    { title: '创建时间', key: 'createdAt', width: 170, render: (_, r) => fmtTime(r.createdAt) },
  ]

  const classColumns: ColumnsType<SchoolClassRow> = [
    { title: '班级', dataIndex: 'name', key: 'name', width: 200, ellipsis: true },
    { title: '编号', dataIndex: 'code', key: 'code', width: 100 },
    { title: '课程', dataIndex: 'courseName', key: 'courseName', width: 180, ellipsis: true },
    { title: '主讲老师', dataIndex: 'teacherName', key: 'teacherName', width: 120 },
    { title: '学生数', dataIndex: 'studentCount', key: 'studentCount', width: 90 },
    { title: '状态', key: 'status', width: 100, render: (_, r) => <Tag>{r.status}</Tag> },
    {
      title: '周期',
      key: 'period',
      width: 200,
      render: (_, r) => `${r.startDate || '—'} ~ ${r.endDate || '长期'}`,
    },
  ]

  const studentColumns: ColumnsType<SchoolStudentRow> = [
    { title: '学生', dataIndex: 'name', key: 'name', width: 120 },
    { title: '手机号', key: 'phone', width: 140, render: (_, r) => maskPhone(r.phone) },
    {
      title: '所在班级',
      key: 'classNames',
      width: 220,
      render: (_, r) => (r.classNames.length ? r.classNames.join('、') : '未分班'),
    },
    {
      title: '平均进度',
      key: 'avgProgress',
      width: 150,
      render: (_, r) =>
        r.avgProgress === r.avgRealProgress ? (
          `${r.avgProgress}%`
        ) : (
          <span>
            {r.avgProgress}%
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              （实际 {r.avgRealProgress}%）
            </Typography.Text>
          </span>
        ),
    },
    { title: '证书', dataIndex: 'certificateCount', key: 'certificateCount', width: 80 },
    {
      title: '最近学习',
      key: 'lastStudyAt',
      width: 170,
      render: (_, r) => (r.lastStudyAt ? fmtTime(r.lastStudyAt) : '无学习记录'),
    },
    {
      title: '操作',
      key: 'ops',
      width: 90,
      fixed: 'right',
      render: (_, r) => (
        <Button type="link" size="small" onClick={() => openTransfer(r)}>
          转校
        </Button>
      ),
    },
  ]

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: 16,
          marginBottom: 16,
        }}
      >
        <div>
          <h2 style={{ marginTop: 0, marginBottom: 8 }}>
            {school.name} <Tag color={STATUS_TAG[school.status]?.color}>{STATUS_TAG[school.status]?.text}</Tag>
          </h2>
          <p style={{ color: '#666', marginBottom: 0 }}>学校基本信息、后台账号、课程授权与教学概况。</p>
        </div>
        <Space>
          <Button onClick={() => navigate('/school/list')}>返回列表</Button>
          <Button onClick={() => navigate('/school/cert-review')}>发证审核</Button>
        </Space>
      </div>

      <Card title="基本信息" style={{ marginBottom: 16 }}>
        <Descriptions bordered size="small" column={2}>
          <Descriptions.Item label="学校名称">{school.name}</Descriptions.Item>
          <Descriptions.Item label="所在区域">{school.region || '-'}</Descriptions.Item>
          <Descriptions.Item label="详细地址" span={2}>
            {school.address || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="联系人">{school.contactName || '-'}</Descriptions.Item>
          <Descriptions.Item label="联系电话">{maskPhone(school.contactPhone)}</Descriptions.Item>
          <Descriptions.Item label="开户时间">{fmtTime(school.createdAt)}</Descriptions.Item>
          <Descriptions.Item label="学校登录地址">
            <Typography.Text copyable={{ text: `${window.location.origin}${SCHOOL_LOGIN_PATH}` }}>
              {SCHOOL_LOGIN_PATH}
            </Typography.Text>
          </Descriptions.Item>
          <Descriptions.Item label="备注" span={2}>
            {school.remark || '-'}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title={`后台账号（${accounts.length}）`} style={{ marginBottom: 16 }}>
        <Table<SchoolAccountRow>
          rowKey="id"
          size="small"
          columns={accountColumns}
          dataSource={accounts}
          pagination={false}
          scroll={{ x: 800 }}
        />
      </Card>

      <Card
        title={`课程授权（已授权 ${grantedIds.length} 门）`}
        style={{ marginBottom: 16 }}
        extra={
          <Space>
            {draftIds != null ? <Button onClick={() => setDraftIds(null)}>取消</Button> : null}
            <Button type="primary" disabled={draftIds == null} onClick={saveGrants}>
              保存授权
            </Button>
          </Space>
        }
      >
        <Typography.Paragraph type="secondary" style={{ fontSize: 13 }}>
          仅已授权课程可被该校用于建班；解除授权前需先处理关联的进行中 / 未开课班级。
          {school.status === SCHOOL_STATUS.DISABLED ? '该校当前已停用，授权变更在恢复后生效。' : ''}
        </Typography.Paragraph>
        <Transfer
          dataSource={SCHOOL_COURSE_CATALOG.map((c) => ({ key: c.id, title: `${c.name}（${c.totalLessons} 课时）` }))}
          titles={['未授权课程', '已授权课程']}
          listStyle={{ width: 300, height: 280 }}
          targetKeys={selectedIds}
          onChange={(keys) => setDraftIds(keys.map(String))}
          render={(item) => item.title}
        />
      </Card>

      <Card title={`班级（${classes.length}）`} style={{ marginBottom: 16 }}>
        <Table<SchoolClassRow>
          rowKey="id"
          size="small"
          columns={classColumns}
          dataSource={classes}
          pagination={false}
          scroll={{ x: 990 }}
          locale={{ emptyText: '该校暂无班级' }}
        />
      </Card>

      <Card title={`学生（${students.length}）`} style={{ marginBottom: 16 }}>
        <Table<SchoolStudentRow>
          rowKey="id"
          size="small"
          columns={studentColumns}
          dataSource={students}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 1070 }}
          locale={{ emptyText: '该校暂无学生' }}
        />
      </Card>

      <Modal
        title={transferTarget ? `学生转校：${transferTarget.name}` : '学生转校'}
        open={!!transferTarget}
        onCancel={() => setTransferTarget(null)}
        onOk={doTransfer}
        okText="确认转校"
        width={720}
        destroyOnHidden
      >
        {transferTarget ? (
          <>
            <Descriptions bordered size="small" column={2} style={{ marginBottom: 16 }}>
              <Descriptions.Item label="当前学校">{school.name}</Descriptions.Item>
              <Descriptions.Item label="当前班级">
                {transferTarget.classNames.length ? transferTarget.classNames.join('、') : '未分班'}
              </Descriptions.Item>
              <Descriptions.Item label="转入学校" span={2}>
                <Select
                  style={{ width: '100%' }}
                  placeholder="请选择转入学校"
                  value={targetSchoolId || undefined}
                  onChange={setTargetSchoolId}
                  options={listSchools()
                    .filter((s) => s.id !== school.id && s.status === SCHOOL_STATUS.ACTIVE)
                    .map((s) => ({ value: s.id, label: `${s.name}（${s.region || '—'}）` }))}
                  notFoundContent="暂无其他可用学校"
                />
              </Descriptions.Item>
            </Descriptions>
            <Typography.Paragraph type="secondary" style={{ fontSize: 13 }}>
              转校后原学校班级的学习入口将关闭，已产生的学习记录与证书全平台保留；课程权限按新学校班级重新计算。
            </Typography.Paragraph>
            <Table<StudentEnrollmentHistoryRow>
              rowKey="id"
              size="small"
              title={() => '学校归属历史'}
              columns={[
                { title: '学校', dataIndex: 'schoolName', key: 'schoolName', width: 180 },
                {
                  title: '状态',
                  key: 'status',
                  width: 100,
                  render: (_, r) =>
                    r.removedAt ? <Tag>已转出</Tag> : <Tag color="green">在读</Tag>,
                },
                { title: '加入时间', key: 'joinedAt', width: 170, render: (_, r) => fmtTime(r.joinedAt) },
                {
                  title: '转出时间',
                  key: 'removedAt',
                  width: 170,
                  render: (_, r) => (r.removedAt ? fmtTime(r.removedAt) : '—'),
                },
                {
                  title: '班级',
                  key: 'classes',
                  render: (_, r) => (r.classes.length ? r.classes.map((c) => c.name).join('、') : '未分班'),
                },
              ]}
              dataSource={getStudentSchoolHistory(transferTarget.id)}
              pagination={false}
              scroll={{ x: 780 }}
            />
          </>
        ) : null}
      </Modal>

      <Card title="操作日志">
        <Table<SchoolLogRow>
          rowKey="id"
          size="small"
          columns={[
            { title: '时间', key: 'at', width: 170, render: (_, r) => fmtTime(r.at) },
            { title: '操作人', dataIndex: 'operator', key: 'operator', width: 140 },
            { title: '动作', dataIndex: 'action', key: 'action', width: 180 },
            { title: '详情', dataIndex: 'detail', key: 'detail' },
          ]}
          dataSource={logs}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 800 }}
          locale={{ emptyText: '暂无日志' }}
        />
      </Card>
    </div>
  )
}
