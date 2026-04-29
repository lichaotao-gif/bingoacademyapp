import { useState } from 'react'
import { Link } from 'react-router-dom'
import { demoTopUpBalance } from '../../utils/franchisePartnerStorage'
import { useFranchiseWorkspace } from './useFranchiseWorkspace'

const PRESETS = [5000, 10000, 20000]

export default function FranchisePartnerBalance() {
  const { session, ws, refresh } = useFranchiseWorkspace()
  const [amount, setAmount] = useState('5000')
  const [msg, setMsg] = useState('')
  const [msgOk, setMsgOk] = useState(true)

  if (!ws || !session) return <p className="text-slate-500 text-sm">加载中…</p>

  const submit = (e) => {
    e.preventDefault()
    setMsg('')
    const r = demoTopUpBalance(session.partnerId, session.refCode, amount)
    if (!r.ok) {
      setMsgOk(false)
      setMsg(r.msg)
    } else {
      setMsgOk(true)
      setMsg('充值成功')
      refresh()
    }
  }

  return (
    <div className="w-full">
      <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-2 md:items-stretch md:gap-8 xl:gap-10">
        <div className="min-w-0 w-full rounded-2xl border border-[#3B66FF]/25 bg-gradient-to-br from-sky-50 to-white p-6 sm:p-8 shadow-sm flex flex-col min-h-[11rem] justify-center">
          <p className="text-xs text-slate-600 font-medium">当前余额（元）</p>
          <p className="text-3xl sm:text-4xl font-bold text-[#3B66FF] mt-2 tabular-nums">
            ¥{ws.balance.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
          </p>
          <Link to="/franchise-partner/finance" className="text-sm text-[#3B66FF] font-medium hover:underline mt-4 inline-block">
            查看余额变动记录 →
          </Link>
        </div>

        <form onSubmit={submit} className="min-w-0 w-full rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-4 flex flex-col justify-center">
        <div className="w-full">
          <label className="block text-sm font-medium text-slate-700 mb-2">充值金额（元）</label>
          <div className="grid w-full grid-cols-3 gap-2 sm:gap-3 mb-3">
            {PRESETS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setAmount(String(p))}
                className="min-w-0 rounded-xl border border-slate-200 bg-slate-50/80 px-2 py-3.5 sm:py-4 text-center text-sm font-semibold tabular-nums text-slate-800 hover:border-[#3B66FF] hover:bg-sky-50/80 hover:text-[#3B66FF] sm:text-base"
              >
                ¥{p.toLocaleString()}
              </button>
            ))}
          </div>
          <input
            type="number"
            min="0.01"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-base font-semibold tabular-nums text-slate-900 sm:py-3.5 sm:text-lg"
          />
        </div>
        {msg ? <p className={'text-sm ' + (msgOk ? 'text-emerald-600' : 'text-red-600')}>{msg}</p> : null}
        <button type="submit" className="w-full py-3 rounded-xl bg-[#3B66FF] hover:bg-[#2f56e6] text-white text-sm font-semibold transition">
          确认充值
        </button>
      </form>
      </div>
    </div>
  )
}
