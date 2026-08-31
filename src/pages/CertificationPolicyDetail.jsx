import { ArrowLeftOutlined, CheckCircleOutlined, DownOutlined, FileTextOutlined, InfoCircleOutlined, SafetyCertificateOutlined } from '@ant-design/icons'
import { useEffect } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { CERTIFICATION_POLICIES } from '../data/certificationPolicies'

function PolicyTable({ policies }) {
  return <>
    <div className="hidden overflow-hidden rounded-2xl border border-slate-200 md:block">
      <table className="w-full table-fixed border-collapse text-left text-sm">
        <thead className="bg-slate-100 text-slate-700">
          <tr>
            <th scope="col" className="w-[30%] px-5 py-4 font-bold">文件名称</th>
            <th scope="col" className="w-[17%] px-5 py-4 font-bold">文号</th>
            <th scope="col" className="w-[19%] px-5 py-4 font-bold">发文单位</th>
            <th scope="col" className="px-5 py-4 font-bold">核心摘要</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 bg-white">
          {policies.map(([name, reference, issuer, summary]) => <tr key={`${name}-${reference}`} className="align-top transition-colors hover:bg-slate-50">
            <th scope="row" className="px-5 py-5 font-semibold leading-6 text-slate-900">{name}</th>
            <td className="px-5 py-5 leading-6 text-slate-600">{reference}</td>
            <td className="px-5 py-5 leading-6 text-slate-600">{issuer}</td>
            <td className="px-5 py-5 leading-6 text-slate-600">{summary}</td>
          </tr>)}
        </tbody>
      </table>
    </div>

    <div className="grid gap-4 md:hidden">
      {policies.map(([name, reference, issuer, summary], index) => <article key={`${name}-${reference}`} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-start gap-3"><span className="grid h-8 min-w-8 place-items-center rounded-lg bg-slate-100 text-xs font-bold tabular-nums text-slate-600">{String(index + 1).padStart(2, '0')}</span><h3 className="font-bold leading-7 text-slate-950">{name}</h3></div>
        <dl className="mt-4 grid gap-3 border-t border-slate-100 pt-4 text-sm">
          <div><dt className="text-xs font-bold text-slate-400">文号</dt><dd className="mt-1 leading-6 text-slate-700">{reference}</dd></div>
          <div><dt className="text-xs font-bold text-slate-400">发文单位</dt><dd className="mt-1 leading-6 text-slate-700">{issuer}</dd></div>
          <div><dt className="text-xs font-bold text-slate-400">核心摘要</dt><dd className="mt-1 leading-6 text-slate-700">{summary}</dd></div>
        </dl>
      </article>)}
    </div>
  </>
}

function PilotDetails({ pilot, accent }) {
  return <details className="group rounded-2xl border border-slate-200 bg-white shadow-sm open:border-blue-200 open:shadow-md">
    <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 font-bold leading-6 text-slate-900 focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-blue-600 sm:px-6">
      <span>{pilot.title}</span>
      <DownOutlined className={`shrink-0 transition-transform duration-200 group-open:rotate-180 motion-reduce:transition-none ${accent}`} aria-hidden="true" />
    </summary>
    <div className="border-t border-slate-100 px-5 pb-6 pt-5 text-sm leading-7 text-slate-600 sm:px-6">
      {pilot.intro ? <p>{pilot.intro}</p> : null}
      {pilot.groups?.map((group) => <section key={group.label} className="mt-5 first:mt-0">
        <h3 className="font-bold text-slate-900">{group.label}</h3>
        {group.items ? <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{group.items.map((item) => <li key={item} className="rounded-lg bg-slate-50 px-3 py-2 text-slate-700">{item}</li>)}</ul> : <p className="mt-2">{group.text}</p>}
      </section>)}
      {pilot.label ? <p className="mt-5 font-bold text-slate-900">{pilot.label}</p> : null}
      {pilot.items ? <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{pilot.items.map((item) => <li key={item} className="flex min-h-10 items-center rounded-lg bg-slate-50 px-3 py-2 text-slate-700"><span className={`mr-2 h-1.5 w-1.5 shrink-0 rounded-full bg-current ${accent}`} aria-hidden="true" />{item}</li>)}</ul> : null}
      {pilot.note ? <p className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900">{pilot.note}</p> : null}
    </div>
  </details>
}

function InsightList({ items, theme, numbered = false }) {
  return <ul className="mt-6 space-y-4">
    {items.map((item, index) => <li key={item} className="flex gap-3 text-sm leading-7 text-slate-700">
      {numbered ? <span className={`grid h-7 min-w-7 place-items-center rounded-lg text-xs font-bold tabular-nums ${theme.badge}`}>{String(index + 1).padStart(2, '0')}</span> : <CheckCircleOutlined className={`mt-1.5 shrink-0 ${theme.accent}`} aria-hidden="true" />}
      <span>{item}</span>
    </li>)}
  </ul>
}

export default function CertificationPolicyDetail() {
  const { slug } = useParams()
  const policy = CERTIFICATION_POLICIES[slug]

  useEffect(() => {
    const previousTitle = document.title
    const currentPolicyTitle = CERTIFICATION_POLICIES[slug]?.title
    if (currentPolicyTitle) document.title = `综评认证 > ${currentPolicyTitle} | Bingo AI Credentials`
    window.scrollTo({ top: 0, behavior: 'auto' })
    return () => { document.title = previousTitle }
  }, [slug])

  if (!policy) return <Navigate to="/cert" replace />

  return <main className="bg-slate-50 pb-16 text-slate-900">
    <a href="#policy-main-content" className="sr-only z-[100] rounded-lg bg-white px-4 py-3 font-bold text-blue-700 focus:not-sr-only focus:fixed focus:left-4 focus:top-4">跳至政策正文</a>

    <header className={`relative overflow-hidden bg-gradient-to-br text-white ${policy.theme.hero}`}>
      <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full border border-white/15" aria-hidden="true" />
      <div className="absolute right-20 top-20 h-32 w-32 rounded-full border border-white/10" aria-hidden="true" />
      <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-10 sm:px-6 sm:pb-20 sm:pt-14">
        <nav aria-label="面包屑" className="flex flex-wrap items-center gap-2 text-sm text-white/75">
          <Link to="/cert" className="rounded-md underline-offset-4 hover:text-white hover:underline focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-white">综评认证</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{policy.title} · 政策详情</span>
        </nav>
        <div className="mt-9 max-w-4xl">
          <span className="inline-flex min-h-8 items-center rounded-full border border-white/20 bg-white/10 px-3 text-xs font-bold tracking-[.12em]">{policy.stage} · {policy.eyebrow}</span>
          <h1 className="mt-5 text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">{policy.pageTitle}</h1>
          <p className="mt-5 max-w-3xl text-base leading-8 text-white/85 sm:text-lg">依据原政策资料整理学段定位、核心文件、相关试点与AI素养应用边界。</p>
        </div>
      </div>
    </header>

    <div id="policy-main-content" className="relative z-10 mx-auto -mt-7 max-w-7xl px-4 sm:px-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,.10)] sm:p-8" aria-labelledby="overview-heading">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-xl ${policy.theme.badge}`} aria-hidden="true"><SafetyCertificateOutlined /></span>
          <div><p className={`text-xs font-bold tracking-[.14em] ${policy.theme.accent}`}>STAGE OVERVIEW</p><h2 id="overview-heading" className="mt-2 text-2xl font-bold text-slate-950">学段改革总览</h2><p className="mt-4 max-w-5xl text-base leading-8 text-slate-700">{policy.summary}</p></div>
        </div>
      </section>

      <section className="mt-10" aria-labelledby="policy-list-heading">
        <div className="mb-6 flex items-center gap-3"><span className={`grid h-11 w-11 place-items-center rounded-xl text-lg ${policy.theme.badge}`} aria-hidden="true"><FileTextOutlined /></span><div><p className={`text-xs font-bold tracking-[.14em] ${policy.theme.accent}`}>CORE POLICIES</p><h2 id="policy-list-heading" className="mt-1 text-2xl font-bold text-slate-950">核心政策清单</h2></div></div>
        <PolicyTable policies={policy.policies} />
      </section>

      <section className="mt-12" aria-labelledby="pilot-heading">
        <div><p className={`text-xs font-bold tracking-[.14em] ${policy.theme.accent}`}>NATIONAL PILOTS</p><h2 id="pilot-heading" className="mt-2 text-2xl font-bold text-slate-950">相关国家级试点</h2><p className="mt-3 text-sm leading-7 text-slate-600">点击下方条目展开查看原资料中的试点说明与名单。</p></div>
        <div className="mt-6 space-y-4">{policy.pilots.map((pilot) => <PilotDetails key={pilot.title} pilot={pilot} accent={policy.theme.accent} />)}</div>
      </section>

      <div className="mt-12 grid gap-6 lg:grid-cols-2">
        <section className={`rounded-3xl border p-6 sm:p-8 ${policy.theme.soft}`} aria-labelledby="ai-position-heading">
          <p className={`text-xs font-bold tracking-[.14em] ${policy.theme.accent}`}>AI LITERACY</p>
          <h2 id="ai-position-heading" className="mt-2 text-2xl font-bold leading-9 text-slate-950">{policy.aiSectionTitle}</h2>
          <InsightList items={policy.aiPosition} theme={policy.theme} />
        </section>
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8" aria-labelledby="trend-heading">
          <p className={`text-xs font-bold tracking-[.14em] ${policy.theme.accent}`}>FIVE-YEAR OUTLOOK</p>
          <h2 id="trend-heading" className="mt-2 text-2xl font-bold text-slate-950">未来5年改革趋势预判</h2>
          <InsightList items={policy.trends} theme={policy.theme} numbered />
        </section>
      </div>

      <aside className="mt-12 rounded-3xl border border-amber-200 bg-amber-50 p-5 sm:p-7 lg:p-8" aria-labelledby="policy-notice-heading">
        <div className="flex items-center gap-3"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-amber-500 text-lg text-white" aria-hidden="true"><InfoCircleOutlined /></span><div><p className="text-xs font-bold tracking-[.14em] text-amber-700">IMPORTANT NOTICE</p><h2 id="policy-notice-heading" className="mt-1 text-xl font-bold text-slate-950">重要提示</h2></div></div>
        <ol className="mt-6 grid gap-4 lg:grid-cols-2">{policy.notices.map((notice, index) => <li key={notice} className="flex gap-4 rounded-2xl border border-amber-200 bg-white/80 p-5 text-sm leading-7 text-slate-700"><span className="font-bold tabular-nums text-amber-700">{String(index + 1).padStart(2, '0')}</span><p>{notice}</p></li>)}</ol>
      </aside>

      <div className="mt-10 flex justify-center"><Link to="/cert" className="inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 text-sm font-bold text-white shadow-sm transition duration-200 hover:bg-blue-700 focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-blue-600 motion-reduce:transition-none"><ArrowLeftOutlined aria-hidden="true" />返回综评认证首页</Link></div>
    </div>
  </main>
}
