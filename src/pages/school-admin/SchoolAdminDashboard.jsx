import { useMemo, useState } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import ReactECharts from 'echarts-for-react'
import { fmtDateTime, getDashboardStats, listClasses, listGrantedCourses } from '../../utils/schoolAdminStorage'
import useSchoolDbRefresh from './useSchoolDbRefresh'
import { DataTable, EmptyState, Pill, SectionCard, inputCls } from './SchoolUiKit'

const RANGE_OPTIONS = [
  { value: 7, label: '近 7 天' },
  { value: 14, label: '近 14 天' },
  { value: 30, label: '近 30 天' },
]

const WARNING_TABS = [
  { key: 'noStudy7d', label: '7 天未学习' },
  { key: 'belowClassAvg', label: '低于班级均值 20%' },
  { key: 'endedNotCompleted', label: '已结课未完成' },
]

function StatCard({ label, value, unit, hint, tone = 'slate' }) {
  const toneCls = tone === 'primary' ? 'text-primary' : 'text-slate-900'
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs text-slate-500">{label}</p>
      <p className={`mt-1 text-2xl font-semibold ${toneCls}`}>
        {value}
        {unit ? <span className="ml-1 text-sm font-normal text-slate-400">{unit}</span> : null}
      </p>
      {hint ? <p className="mt-1 text-[11px] leading-4 text-slate-400">{hint}</p> : null}
    </div>
  )
}

export default function SchoolAdminDashboard() {
  const { session, owner } = useOutletContext()
  const rev = useSchoolDbRefresh()
  const [days, setDays] = useState(7)
  const [classId, setClassId] = useState('')
  const [courseId, setCourseId] = useState('')
  const [warnTab, setWarnTab] = useState('noStudy7d')

  const classes = useMemo(() => {
    void rev
    return listClasses(session)
  }, [session, rev])

  const courses = useMemo(() => {
    void rev
    return listGrantedCourses(session.schoolId)
  }, [session, rev])

  const stats = useMemo(() => {
    void rev
    return getDashboardStats(session, { days, classId: classId || undefined, courseId: courseId || undefined })
  }, [session, rev, days, classId, courseId])

  if (!stats) return <EmptyState>登录状态已失效，请重新登录。</EmptyState>

  const { overview, study, teaching, outcome, warnings } = stats

  const trendOption = {
    grid: { left: 40, right: 16, top: 24, bottom: 28 },
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: study.trend.map((t) => t.date), axisTick: { show: false } },
    yAxis: { type: 'value', minInterval: 1 },
    series: [
      {
        name: '活跃学习人次',
        type: 'line',
        smooth: true,
        data: study.trend.map((t) => t.count),
        areaStyle: { opacity: 0.12 },
        itemStyle: { color: '#2563eb' },
        lineStyle: { color: '#2563eb' },
      },
    ],
  }

  const classStatusData = [
    { name: '进行中', value: teaching.ongoing, itemStyle: { color: '#22c55e' } },
    { name: '未开课', value: teaching.pending, itemStyle: { color: '#3b82f6' } },
    { name: '已结课', value: teaching.ended, itemStyle: { color: '#94a3b8' } },
    { name: '已停用', value: teaching.disabled, itemStyle: { color: '#f43f5e' } },
  ].filter((d) => d.value > 0)

  const classStatusOption = {
    tooltip: { trigger: 'item' },
    legend: {
      bottom: 0,
      icon: 'circle',
      formatter: (name) => `${name} ${classStatusData.find((d) => d.name === name)?.value ?? 0}`,
    },
    series: [
      {
        type: 'pie',
        radius: ['45%', '70%'],
        center: ['50%', '45%'],
        label: { show: false },
        data: classStatusData,
      },
    ],
  }

  const certOption = {
    grid: { left: 48, right: 16, top: 24, bottom: 60 },
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: outcome.byCourse.map((c) => c.courseName),
      axisLabel: { interval: 0, width: 90, overflow: 'break', fontSize: 11 },
    },
    yAxis: { type: 'value', minInterval: 1 },
    series: [
      {
        name: '已发证书',
        type: 'bar',
        barMaxWidth: 40,
        data: outcome.byCourse.map((c) => c.count),
        itemStyle: { color: '#8b5cf6', borderRadius: [4, 4, 0, 0] },
      },
    ],
  }

  const warnRows = warnings[warnTab] || []

  return (
    <div className="space-y-4">
      <SectionCard
        title="统计范围"
        desc={
          owner
            ? '总管理员可查看本校全部班级；所有进度指标均基于真实学习进度，不受手动结课影响。'
            : '仅统计本人主讲的班级；所有进度指标均基于真实学习进度，不受手动结课影响。'
        }
      >
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-slate-600">时间范围</span>
            <select className={inputCls} value={days} onChange={(e) => setDays(Number(e.target.value))}>
              {RANGE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-slate-600">班级</span>
            <select className={inputCls} value={classId} onChange={(e) => setClassId(e.target.value)}>
              <option value="">全部班级</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-slate-600">课程</span>
            <select className={inputCls} value={courseId} onChange={(e) => setCourseId(e.target.value)}>
              <option value="">全部课程</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
        </div>
      </SectionCard>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="在读学生" value={overview.studentCount} unit="人" hint={`班级 ${overview.classCount} 个`} />
        <StatCard
          label={owner ? '老师账号' : '我的账号'}
          value={overview.teacherCount}
          unit="个"
          hint={`已授权课程 ${overview.grantedCourseCount} 门`}
        />
        <StatCard
          label="活跃学生"
          value={overview.activeStudentCount}
          unit="人"
          hint={`活跃率 ${overview.activeRate}%`}
          tone="primary"
        />
        <StatCard
          label="平均真实进度"
          value={study.avgProgress}
          unit="%"
          hint={`完成率 ${study.completionRate}%`}
          tone="primary"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <SectionCard title="学习活跃趋势" desc={`按最后学习时间统计的每日学习人次（${days} 天）`} className="lg:col-span-2">
          <ReactECharts option={trendOption} style={{ height: 260 }} notMerge lazyUpdate />
        </SectionCard>
        <SectionCard title="班级状态分布">
          {teaching.ongoing + teaching.pending + teaching.ended + teaching.disabled === 0 ? (
            <EmptyState>暂无班级</EmptyState>
          ) : (
            <ReactECharts option={classStatusOption} style={{ height: 260 }} notMerge lazyUpdate />
          )}
        </SectionCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard
          title="证书发放"
          desc={`共 ${outcome.certificateCount} 张（自学完成 ${outcome.autoCertCount} 张 / 手动结课 ${outcome.manualCertCount} 张）`}
        >
          {outcome.byCourse.length ? (
            <ReactECharts option={certOption} style={{ height: 260 }} notMerge lazyUpdate />
          ) : (
            <EmptyState>暂无证书数据</EmptyState>
          )}
        </SectionCard>
        <SectionCard title="班级完成率排行" desc="按真实进度达到 100% 的学生占比排序">
          <DataTable
            rows={teaching.ranking}
            rowKey={(r) => r.classId}
            empty="暂无班级"
            minWidth={420}
            columns={[
              {
                key: 'name',
                title: '班级',
                render: (r) => (
                  <Link to={`/school/classes/${r.classId}`} className="text-primary hover:underline">
                    {r.name}
                  </Link>
                ),
              },
              { key: 'studentCount', title: '学生数', render: (r) => `${r.studentCount} 人` },
              {
                key: 'completionRate',
                title: '完成率',
                render: (r) => (
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-24 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${r.completionRate}%` }} />
                    </div>
                    <span className="text-xs text-slate-500">{r.completionRate}%</span>
                  </div>
                ),
              },
            ]}
          />
        </SectionCard>
      </div>

      <SectionCard
        title="学习预警"
        desc="用于结课发证前排查，进度以真实学习进度计算"
        extra={
          <div className="flex flex-wrap gap-1">
            {WARNING_TABS.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setWarnTab(t.key)}
                className={`rounded-lg border px-2.5 py-1 text-xs transition ${
                  warnTab === t.key
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                {t.label}（{(warnings[t.key] || []).length}）
              </button>
            ))}
          </div>
        }
      >
        <DataTable
          rows={warnRows}
          rowKey={(r) => `${r.studentId}-${r.className}`}
          empty="该预警项暂无学生"
          columns={[
            {
              key: 'name',
              title: '学生',
              render: (r) => (
                <Link to={`/school/students/${r.studentId}`} className="text-primary hover:underline">
                  {r.name}
                </Link>
              ),
            },
            { key: 'className', title: '班级' },
            {
              key: 'realProgress',
              title: '真实进度',
              render: (r) =>
                r.realProgress >= 100 ? (
                  <Pill tone="green">100%</Pill>
                ) : r.realProgress === 0 ? (
                  <Pill tone="rose">0%</Pill>
                ) : (
                  `${r.realProgress}%`
                ),
            },
            {
              key: 'lastStudyAt',
              title: '最后学习时间',
              render: (r) => (r.lastStudyAt ? fmtDateTime(r.lastStudyAt) : '无学习记录'),
            },
          ]}
        />
      </SectionCard>
    </div>
  )
}
