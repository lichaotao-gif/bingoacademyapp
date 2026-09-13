import { useOutletContext } from 'react-router-dom'
import {
  fmtDateTime,
  getSchoolDetail,
  listGrantedCourses,
  listLogs,
} from '../../utils/schoolAdminStorage'
import useSchoolDbRefresh from './useSchoolDbRefresh'

function InfoRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 py-2.5 last:border-b-0">
      <dt className="shrink-0 text-sm text-slate-500">{label}</dt>
      <dd className="min-w-0 text-right text-sm font-medium text-slate-900">{value || '—'}</dd>
    </div>
  )
}

export default function SchoolAdminSettings() {
  const { session, owner } = useOutletContext()
  useSchoolDbRefresh()

  const school = getSchoolDetail(session.schoolId)
  const courses = listGrantedCourses(session.schoolId)
  const logs = owner ? listLogs({ schoolId: session.schoolId }).slice(0, 20) : []

  if (!school) {
    return <p className="text-sm text-slate-500">未找到学校信息，请联系平台运营。</p>
  }

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-slate-900">学校档案</h2>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-500">
            档案由平台维护，如需变更请联系平台运营
          </span>
        </div>
        <dl className="mt-3">
          <InfoRow label="学校名称" value={school.name} />
          <InfoRow label="所在地区" value={school.region} />
          <InfoRow label="详细地址" value={school.address} />
          <InfoRow label="联系人" value={school.contactName} />
          <InfoRow label="联系电话" value={school.contactPhone} />
          <InfoRow label="总管理员" value={`${school.ownerName}（${school.ownerPhone}）`} />
          <InfoRow label="开通时间" value={fmtDateTime(school.createdAt)} />
        </dl>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <h2 className="text-sm font-semibold text-slate-900">已授权课程（{courses.length}）</h2>
        <p className="mt-1 text-xs text-slate-500">仅已授权课程可用于创建班级；如需新增授权请联系平台运营。</p>
        {courses.length ? (
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {courses.map((c) => (
              <li key={c.id} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                <p className="text-sm font-medium text-slate-900">{c.name}</p>
                <p className="mt-0.5 text-xs text-slate-500">共 {c.totalLessons} 课时</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-800">
            暂无授权课程，无法创建班级。请联系平台运营开通课程授权。
          </p>
        )}
      </section>

      {owner ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <h2 className="text-sm font-semibold text-slate-900">最近操作记录</h2>
          <p className="mt-1 text-xs text-slate-500">仅总管理员可见，用于追溯本校账号、班级与学生变更。</p>
          {logs.length ? (
            <ul className="mt-3 space-y-2">
              {logs.map((l) => (
                <li key={l.id} className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
                  <p className="text-sm text-slate-800">{l.detail}</p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {fmtDateTime(l.at)} · {l.operator}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-slate-500">暂无操作记录。</p>
          )}
        </section>
      ) : null}
    </div>
  )
}
