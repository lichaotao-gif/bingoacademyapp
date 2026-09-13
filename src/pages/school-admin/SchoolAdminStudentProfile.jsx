import { Link, useNavigate, useOutletContext, useParams } from 'react-router-dom'
import {
  CERT_SOURCE,
  ENROLL_STATUS,
  fmtDateTime,
  getStudentProfile,
  maskPhone,
} from '../../utils/schoolAdminStorage'
import useSchoolDbRefresh from './useSchoolDbRefresh'
import { DataTable, GhostButton, Pill, SectionCard } from './SchoolUiKit'

const ENROLL_LABELS = {
  [ENROLL_STATUS.ACTIVE]: '在读',
  [ENROLL_STATUS.SUSPENDED]: '已停用',
  [ENROLL_STATUS.REMOVED]: '已移出',
}

export default function SchoolAdminStudentProfile() {
  const { session } = useOutletContext()
  const { studentId } = useParams()
  const navigate = useNavigate()
  useSchoolDbRefresh()

  const profile = getStudentProfile(session, studentId)

  if (!profile) {
    return (
      <SectionCard title="学生学习档案">
        <p className="text-sm text-slate-600">学生不存在，或不在您的管理范围内。</p>
        <div className="mt-3">
          <GhostButton type="button" onClick={() => navigate('/school/students')}>
            返回学生列表
          </GhostButton>
        </div>
      </SectionCard>
    )
  }

  const progressColumns = [
    {
      key: 'className',
      title: '班级',
      render: (r) => (
        <div>
          <Link to={`/school/classes/${r.classId}`} className="font-medium text-primary hover:underline">
            {r.className}
          </Link>
          <p className="mt-0.5 text-xs text-slate-400">{r.classStatus}</p>
        </div>
      ),
    },
    { key: 'courseName', title: '课程' },
    {
      key: 'progressPct',
      title: '学习进度',
      render: (r) => (
        <div>
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-100">
              <i className="block h-full rounded-full bg-primary" style={{ width: `${r.progressPct}%` }} />
            </span>
            <span className="text-xs font-medium text-slate-700">{r.progressPct}%</span>
          </div>
          {r.progressPct !== r.realProgress ? (
            <p className="mt-0.5 text-[11px] text-slate-400">实际学习 {r.realProgress}%（手动结课置顶）</p>
          ) : null}
        </div>
      ),
    },
    { key: 'lessonsDone', title: '完成课时', render: (r) => `${r.lessonsDone}/${r.totalLessons}` },
    { key: 'studyMinutes', title: '学习时长', render: (r) => `${r.studyMinutes} 分钟` },
    {
      key: 'lastStudyAt',
      title: '最近学习',
      render: (r) => (r.lastStudyAt ? fmtDateTime(r.lastStudyAt) : <span className="text-slate-400">无学习记录</span>),
    },
    {
      key: 'certificate',
      title: '证书',
      render: (r) =>
        r.certificate ? (
          <Pill tone={r.certificate.source === CERT_SOURCE.MANUAL ? 'violet' : 'green'}>
            {r.certificate.source === CERT_SOURCE.MANUAL ? '手动发证' : '自动发证'}
          </Pill>
        ) : (
          <span className="text-xs text-slate-400">未发证</span>
        ),
    },
  ]

  const certColumns = [
    { key: 'className', title: '班级', render: (r) => r.className || '—' },
    { key: 'courseName', title: '课程', render: (r) => r.courseName || '—' },
    {
      key: 'source',
      title: '发证方式',
      render: (r) => (
        <Pill tone={r.source === CERT_SOURCE.MANUAL ? 'violet' : 'green'}>
          {r.source === CERT_SOURCE.MANUAL ? '手动发证（平台审核）' : '自动发证'}
        </Pill>
      ),
    },
    { key: 'completedAt', title: '完成时间', render: (r) => fmtDateTime(r.completedAt) },
    { key: 'issuedAt', title: '发证时间', render: (r) => fmtDateTime(r.issuedAt) },
    { key: 'progressSnapshot', title: '发证时实际进度', render: (r) => `${r.progressSnapshot}%` },
  ]

  const certificates = profile.certificates.map((c) => {
    const pr = profile.progressList.find((p) => p.classId === c.classId)
    return { ...c, className: pr?.className, courseName: pr?.courseName }
  })

  return (
    <div className="space-y-4">
      <SectionCard
        title={profile.name}
        desc={`登录手机号 ${maskPhone(profile.phone)} · 加入本校 ${fmtDateTime(profile.createdAt)}`}
        extra={
          <GhostButton type="button" onClick={() => navigate('/school/students')}>
            返回列表
          </GhostButton>
        }
      >
        <dl className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
          {[
            [
              '在读状态',
              <Pill key="s" tone={profile.enrollStatus === ENROLL_STATUS.ACTIVE ? 'green' : 'amber'}>
                {ENROLL_LABELS[profile.enrollStatus] || profile.enrollStatus}
              </Pill>,
            ],
            ['所在班级', profile.classNames.length ? profile.classNames.join('、') : '未分班'],
            ['平均进度', `${profile.avgProgress}%（实际 ${profile.avgRealProgress}%）`],
            [
              '最近学习',
              profile.lastStudyAt ? fmtDateTime(profile.lastStudyAt) : '无学习记录',
            ],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-2">
              <dt className="text-xs text-slate-500">{label}</dt>
              <dd className="mt-1 font-medium text-slate-900">{value}</dd>
            </div>
          ))}
        </dl>
        {profile.gender || profile.birthday ? (
          <p className="mt-3 text-xs leading-5 text-slate-500">
            {profile.gender ? `性别：${profile.gender}` : ''}
            {profile.gender && profile.birthday ? ' · ' : ''}
            {profile.birthday ? `出生日期：${profile.birthday}` : ''}
          </p>
        ) : null}
      </SectionCard>

      <SectionCard title={`分班学习记录（${profile.progressList.length}）`} desc="仅展示您有权查看的班级记录。">
        <DataTable columns={progressColumns} rows={profile.progressList} rowKey={(r) => r.id} empty="暂无学习记录" />
      </SectionCard>

      <SectionCard title={`已获证书（${certificates.length}）`} desc="手动发证需平台审核通过后签发，且不可撤销。">
        <DataTable columns={certColumns} rows={certificates} rowKey={(r) => r.id} empty="暂未获得证书" />
      </SectionCard>
    </div>
  )
}
