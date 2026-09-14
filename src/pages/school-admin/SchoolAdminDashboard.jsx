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

const STAT_TONES = {
  blue: {
    shell: 'border-blue-100 bg-gradient-to-br from-white via-blue-50/70 to-cyan-50',
    label: 'text-blue-700',
    value: 'text-blue-950',
    badge: 'bg-blue-600 text-white shadow-blue-200',
    glow: 'bg-blue-300/25',
    bar: 'from-blue-600 to-cyan-400',
  },
  violet: {
    shell: 'border-violet-100 bg-gradient-to-br from-white via-violet-50/70 to-fuchsia-50',
    label: 'text-violet-700',
    value: 'text-violet-950',
    badge: 'bg-violet-600 text-white shadow-violet-200',
    glow: 'bg-violet-300/25',
    bar: 'from-violet-600 to-fuchsia-400',
  },
  emerald: {
    shell: 'border-emerald-100 bg-gradient-to-br from-white via-emerald-50/70 to-teal-50',
    label: 'text-emerald-700',
    value: 'text-emerald-950',
    badge: 'bg-emerald-600 text-white shadow-emerald-200',
    glow: 'bg-emerald-300/25',
    bar: 'from-emerald-600 to-teal-400',
  },
  amber: {
    shell: 'border-amber-100 bg-gradient-to-br from-white via-amber-50/70 to-orange-50',
    label: 'text-amber-700',
    value: 'text-amber-950',
    badge: 'bg-amber-500 text-white shadow-amber-200',
    glow: 'bg-amber-300/25',
    bar: 'from-amber-500 to-orange-400',
  },
}

function StatCard({ label, value, unit, hint, badge, palette = 'blue', progress }) {
  const tone = STAT_TONES[palette] || STAT_TONES.blue
  const progressValue = Math.min(100, Math.max(0, Number(progress) || 0))
  return (
    <div className={`group relative overflow-hidden rounded-2xl border p-4 shadow-[0_10px_28px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(15,23,42,0.10)] ${tone.shell}`}>
      <span className={`absolute -right-8 -top-10 h-28 w-28 rounded-full blur-sm transition group-hover:scale-110 ${tone.glow}`} />
      <div className="relative flex items-start justify-between gap-3">
        <div>
          <p className={`text-xs font-semibold ${tone.label}`}>{label}</p>
          <p className={`mt-1.5 text-3xl font-bold tracking-tight ${tone.value}`}>
            {value}
            {unit ? <span className="ml-1 text-sm font-medium opacity-50">{unit}</span> : null}
          </p>
        </div>
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-base font-bold shadow-lg ${tone.badge}`}>
          {badge}
        </span>
      </div>
      {progress !== undefined ? (
        <div className="relative mt-4 h-1.5 overflow-hidden rounded-full bg-white/80">
          <div className={`h-full rounded-full bg-gradient-to-r ${tone.bar}`} style={{ width: `${progressValue}%` }} />
        </div>
      ) : null}
      {hint ? <p className="relative mt-2 text-[11px] font-medium leading-4 text-slate-500">{hint}</p> : null}
    </div>
  )
}

function DashboardHero({ owner, session, overview, study, teaching }) {
  const metrics = [
    { label: owner ? '全校班级' : '我的班级', value: overview.classCount },
    { label: '进行中', value: teaching.ongoing },
    { label: '活跃率', value: `${overview.activeRate}%` },
  ]
  return (
    <section className="relative overflow-hidden rounded-[24px] bg-gradient-to-r from-[#172554] via-[#3730a3] to-[#0e7490] px-5 py-5 text-white shadow-[0_18px_45px_rgba(30,64,175,0.24)] sm:px-6 sm:py-6">
      <div className="absolute -right-16 -top-24 h-56 w-56 rounded-full border-[32px] border-white/10" />
      <div className="absolute bottom-0 left-[38%] h-24 w-40 rounded-t-full bg-cyan-300/10 blur-xl" />
      <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-bold tracking-[0.2em] text-cyan-200">{owner ? 'SCHOOL DATA CENTER' : 'TEACHING DATA CENTER'}</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
            {owner ? '全校教学运行总览' : `${session.name}的教学工作台`}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-blue-100">
            {owner
              ? `实时汇总全校教学与学习表现，当前平均真实进度 ${study.avgProgress}%。`
              : `聚焦本人主讲班级，快速掌握学生活跃度、学习进度与结课风险。`}
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2 sm:min-w-[340px]">
          {metrics.map((metric) => (
            <div key={metric.label} className="rounded-2xl border border-white/15 bg-white/10 px-3 py-3 text-center backdrop-blur-sm">
              <p className="text-xl font-bold sm:text-2xl">{metric.value}</p>
              <p className="mt-1 text-[11px] text-blue-100">{metric.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function TeacherClassCard({ total, teaching }) {
  const statuses = [
    { label: '进行中', value: teaching.ongoing, color: 'bg-emerald-500', text: 'text-emerald-700' },
    { label: '未开课', value: teaching.pending, color: 'bg-blue-500', text: 'text-blue-700' },
    { label: '已结课', value: teaching.ended, color: 'bg-slate-400', text: 'text-slate-600' },
    { label: '已停用', value: teaching.disabled, color: 'bg-rose-500', text: 'text-rose-700' },
  ]

  return (
    <div className="relative overflow-hidden rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-4 shadow-sm">
      <div className="absolute -right-6 -top-8 h-24 w-24 rounded-full bg-blue-200/35" />
      <div className="relative">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium text-blue-700">我的班级</p>
            <p className="mt-1 text-3xl font-bold text-blue-950">
              {total}<span className="ml-1 text-sm font-normal text-blue-500">个</span>
            </p>
          </div>
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-lg font-bold text-white shadow-sm">班</span>
        </div>
        <div className="mt-3 flex h-2 overflow-hidden rounded-full bg-blue-100">
          {statuses.map((status) => (
            <span
              key={status.label}
              className={status.color}
              style={{ width: `${total ? (status.value / total) * 100 : 0}%` }}
            />
          ))}
        </div>
        <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1">
          {statuses.map((status) => (
            <p key={status.label} className={`text-[11px] ${status.text}`}>
              {status.label} <strong>{status.value}</strong>
            </p>
          ))}
        </div>
      </div>
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
    grid: { left: 42, right: 18, top: 30, bottom: 30 },
    tooltip: { trigger: 'axis', backgroundColor: '#172554', borderWidth: 0, textStyle: { color: '#fff' } },
    xAxis: {
      type: 'category',
      data: study.trend.map((t) => t.date),
      axisTick: { show: false },
      axisLine: { lineStyle: { color: '#cbd5e1' } },
      axisLabel: { color: '#64748b' },
    },
    yAxis: {
      type: 'value',
      minInterval: 1,
      axisLabel: { color: '#64748b' },
      splitLine: { lineStyle: { color: '#e2e8f0', type: 'dashed' } },
    },
    series: [
      {
        name: '活跃学习人次',
        type: 'line',
        smooth: 0.35,
        symbol: 'circle',
        symbolSize: 8,
        data: study.trend.map((t) => t.count),
        areaStyle: {
          color: {
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [{ offset: 0, color: 'rgba(37,99,235,.38)' }, { offset: 1, color: 'rgba(6,182,212,.03)' }],
          },
        },
        itemStyle: { color: '#2563eb', borderColor: '#fff', borderWidth: 2 },
        lineStyle: { color: '#2563eb', width: 4, shadowColor: 'rgba(37,99,235,.22)', shadowBlur: 10 },
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
    title: {
      text: String(overview.classCount),
      subtext: '班级总数',
      left: 'center',
      top: '31%',
      textStyle: { color: '#172554', fontSize: 28, fontWeight: 700 },
      subtextStyle: { color: '#64748b', fontSize: 11 },
    },
    tooltip: { trigger: 'item', backgroundColor: '#172554', borderWidth: 0, textStyle: { color: '#fff' } },
    legend: {
      bottom: 0,
      icon: 'circle',
      textStyle: { color: '#475569' },
      formatter: (name) => `${name} ${classStatusData.find((d) => d.name === name)?.value ?? 0}`,
    },
    series: [
      {
        type: 'pie',
        radius: ['52%', '74%'],
        center: ['50%', '43%'],
        padAngle: 3,
        itemStyle: { borderRadius: 7, borderColor: '#fff', borderWidth: 3, shadowBlur: 8, shadowColor: 'rgba(15,23,42,.10)' },
        label: { show: false },
        data: classStatusData,
      },
    ],
  }

  const certOption = {
    grid: { left: 48, right: 16, top: 28, bottom: 60 },
    tooltip: { trigger: 'axis', backgroundColor: '#312e81', borderWidth: 0, textStyle: { color: '#fff' } },
    xAxis: {
      type: 'category',
      data: outcome.byCourse.map((c) => c.courseName),
      axisTick: { show: false },
      axisLine: { lineStyle: { color: '#ddd6fe' } },
      axisLabel: { interval: 0, width: 90, overflow: 'break', fontSize: 11, color: '#64748b' },
    },
    yAxis: {
      type: 'value',
      minInterval: 1,
      axisLabel: { color: '#64748b' },
      splitLine: { lineStyle: { color: '#ede9fe', type: 'dashed' } },
    },
    series: [
      {
        name: '已发证书',
        type: 'bar',
        barMaxWidth: 40,
        showBackground: true,
        backgroundStyle: { color: '#f5f3ff', borderRadius: [8, 8, 0, 0] },
        data: outcome.byCourse.map((c) => c.count),
        itemStyle: {
          color: {
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [{ offset: 0, color: '#7c3aed' }, { offset: 1, color: '#c084fc' }],
          },
          borderRadius: [8, 8, 0, 0],
        },
      },
    ],
  }

  const warnRows = warnings[warnTab] || []

  return (
    <div className="space-y-4">
      <DashboardHero owner={owner} session={session} overview={overview} study={study} teaching={teaching} />

      <SectionCard
        title="统计范围"
        desc={
          owner
            ? '总管理员可查看本校全部班级；所有进度指标均基于真实学习进度，不受手动结课影响。'
            : '仅统计本人主讲的班级；所有进度指标均基于真实学习进度，不受手动结课影响。'
        }
        className="border-blue-100 bg-gradient-to-r from-white via-blue-50/40 to-cyan-50/50 shadow-[0_10px_30px_rgba(37,99,235,0.07)]"
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
        <StatCard
          label="在读学生"
          value={overview.studentCount}
          unit="人"
          hint={`覆盖班级 ${overview.classCount} 个`}
          badge="生"
          palette="blue"
        />
        {owner ? (
          <StatCard
            label="老师账号"
            value={overview.teacherCount}
            unit="个"
            hint={`已授权课程 ${overview.grantedCourseCount} 门`}
            badge="师"
            palette="violet"
          />
        ) : (
          <TeacherClassCard total={overview.classCount} teaching={teaching} />
        )}
        <StatCard
          label="活跃学生"
          value={overview.activeStudentCount}
          unit="人"
          hint={`近 ${days} 天活跃率 ${overview.activeRate}%`}
          badge="活"
          palette="emerald"
          progress={overview.activeRate}
        />
        <StatCard
          label="平均真实进度"
          value={study.avgProgress}
          unit="%"
          hint={`课程完成率 ${study.completionRate}%`}
          badge="进"
          palette="amber"
          progress={study.avgProgress}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <SectionCard
          title="学习活跃趋势"
          desc={`按最后学习时间统计的每日学习人次（${days} 天）`}
          className="border-blue-100 bg-gradient-to-br from-white to-blue-50/45 shadow-[0_12px_32px_rgba(37,99,235,0.08)] lg:col-span-2"
        >
          <ReactECharts option={trendOption} style={{ height: 280 }} notMerge lazyUpdate />
        </SectionCard>
        <SectionCard
          title="班级状态分布"
          className="border-emerald-100 bg-gradient-to-br from-white to-emerald-50/45 shadow-[0_12px_32px_rgba(16,185,129,0.08)]"
        >
          {teaching.ongoing + teaching.pending + teaching.ended + teaching.disabled === 0 ? (
            <EmptyState>暂无班级</EmptyState>
          ) : (
            <ReactECharts option={classStatusOption} style={{ height: 280 }} notMerge lazyUpdate />
          )}
        </SectionCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard
          title="证书发放"
          desc={`共 ${outcome.certificateCount} 张（自学完成 ${outcome.autoCertCount} 张 / 手动结课 ${outcome.manualCertCount} 张）`}
          className="border-violet-100 bg-gradient-to-br from-white to-violet-50/40 shadow-[0_12px_32px_rgba(124,58,237,0.07)]"
        >
          {outcome.byCourse.length ? (
            <ReactECharts option={certOption} style={{ height: 270 }} notMerge lazyUpdate />
          ) : (
            <EmptyState>暂无证书数据</EmptyState>
          )}
        </SectionCard>
        <SectionCard
          title="班级完成率排行"
          desc="按真实进度达到 100% 的学生占比排序"
          className="border-blue-100 bg-gradient-to-br from-white to-sky-50/40 shadow-[0_12px_32px_rgba(14,165,233,0.07)]"
        >
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
                    <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full bg-gradient-to-r from-blue-600 to-violet-500" style={{ width: `${r.completionRate}%` }} />
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
        className="border-amber-100 bg-gradient-to-br from-white via-white to-amber-50/55 shadow-[0_12px_32px_rgba(245,158,11,0.07)]"
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
