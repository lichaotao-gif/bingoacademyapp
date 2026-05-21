import { useState } from 'react'
import { Link, useNavigate, useOutletContext } from 'react-router-dom'
import { submitOrgApplication } from '../../utils/franchiseNewOrgOnboarding'
import { normalizePartnerPhoneDigits } from '../../utils/franchisePartnerStorage'

export default function FranchisePartnerOrgApply() {
  const { session } = useOutletContext() || {}
  const navigate = useNavigate()
  const phone = normalizePartnerPhoneDigits(session?.loginPhone || session?.phone || '')
  const [orgName, setOrgName] = useState('')
  const [contactName, setContactName] = useState(session?.contactName || '')
  const [region, setRegion] = useState('')
  const [intro, setIntro] = useState('')
  const [err, setErr] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const onSubmit = (e) => {
    e.preventDefault()
    setErr('')
    setSubmitting(true)
    const r = submitOrgApplication(phone, { orgName, contactName, region, intro })
    setSubmitting(false)
    if (!r.ok) {
      setErr(r.msg || '提交失败')
      return
    }
    navigate(r.path, { replace: true })
  }

  return (
    <div className="max-w-xl mx-auto">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">新机构入驻</p>
        <h2 className="mt-1 text-xl font-bold text-slate-900">提交机构资料申请</h2>
        <p className="mt-2 text-sm text-slate-600 leading-relaxed">
          您的账号（{phone ? `${phone.slice(0, 3)}****${phone.slice(-4)}` : '—'}）尚未关联任何机构。请先填写机构基本资料；提交后将进入机构总管理后台，您可继续完善机构信息并提交总部审核，审核通过后方可开设校区、配置角色等。
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4" data-onboarding-allow>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              拟申请机构名称 <span className="text-rose-500">*</span>
            </label>
            <input
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
              placeholder="例如：某某培训中心"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              联系人姓名 <span className="text-rose-500">*</span>
            </label>
            <input
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
              placeholder="您的姓名"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              所在区域 <span className="text-rose-500">*</span>
            </label>
            <input
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
              placeholder="省 / 市 / 区"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">机构简介（选填）</label>
            <textarea
              value={intro}
              onChange={(e) => setIntro(e.target.value)}
              rows={3}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
              placeholder="主营业务、规模等"
            />
          </div>
          {err ? (
            <p className="text-sm text-rose-700 rounded-lg bg-rose-50 border border-rose-100 px-3 py-2" role="alert">
              {err}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-primary text-white py-3 text-sm font-semibold hover:brightness-105 disabled:opacity-60 transition"
          >
            {submitting ? '提交中…' : '提交并进入机构首页'}
          </button>
        </form>

        <p className="mt-4 text-xs text-slate-500">
          已有机构邀请？请联系机构管理员将您的手机号添加为机构账号。
          <Link to="/franchise-partner/login" className="text-primary font-medium ml-1 hover:underline">
            返回登录
          </Link>
        </p>
      </div>
    </div>
  )
}
