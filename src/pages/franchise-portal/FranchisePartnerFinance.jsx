import { useState } from 'react'
import { submitWithdrawal } from '../../utils/franchisePartnerStorage'
import { useFranchiseWorkspace } from './useFranchiseWorkspace'

function fmtDate(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

export default function FranchisePartnerFinance() {
  const { session, ws, refresh } = useFranchiseWorkspace()
  const [tab, setTab] = useState('apply') // apply | withdrawals | ledger
  const [amount, setAmount] = useState('')
  const [bankNote, setBankNote] = useState('招商银行尾号 6288')
  const [msg, setMsg] = useState('')

  if (!ws || !session) return <p className="text-slate-500 text-sm">加载中…</p>

  const onWithdraw = (e) => {
    e.preventDefault()
    setMsg('')
    const r = submitWithdrawal(session.partnerId, session.refCode, amount, bankNote)
    if (!r.ok) setMsg(r.msg)
    else {
      setAmount('')
      refresh()
      setMsg('已提交申请（演示：金额已从可提余额扣除）')
      setTab('withdrawals')
    }
  }

  const tabs = [
    { id: 'apply', label: '申请提现' },
    { id: 'withdrawals', label: '提现记录' },
    { id: 'ledger', label: '收支明细' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-bingo-dark">财务提现</h1>
        <p className="text-sm text-slate-500 mt-1">余额、提现申请与资金流水。正式环境需对接打款与审核。</p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <div className="card p-5 rounded-2xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50 to-white">
          <p className="text-xs text-emerald-800/80 font-medium">可提现余额</p>
          <p className="text-2xl font-bold text-emerald-700 mt-2">¥{ws.balance.toFixed(2)}</p>
        </div>
        <div className="card p-5 rounded-2xl border border-slate-200">
          <p className="text-xs text-slate-500">冻结金额（演示）</p>
          <p className="text-2xl font-bold text-bingo-dark mt-2">¥{Number(ws.frozen || 0).toFixed(2)}</p>
        </div>
        <div className="card p-5 rounded-2xl border border-slate-200">
          <p className="text-xs text-slate-500">最近提现</p>
          <p className="text-sm font-medium text-bingo-dark mt-2 truncate">
            {ws.withdrawals[0] ? `¥${ws.withdrawals[0].amount} · ${ws.withdrawals[0].status}` : '暂无'}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">{ws.withdrawals[0] ? fmtDate(ws.withdrawals[0].createdAt) : ''}</p>
        </div>
      </div>

      <div className="border-b border-slate-200 flex gap-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={
              'px-4 py-2.5 text-sm font-medium rounded-t-lg transition ' +
              (tab === t.id ? 'bg-white text-primary border border-b-0 border-slate-200 -mb-px' : 'text-slate-500 hover:text-bingo-dark')
            }
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'apply' && (
        <form onSubmit={onWithdraw} className="card p-6 rounded-2xl border border-slate-200 max-w-lg space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">提现金额（元）</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              max={ws.balance}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
              placeholder={`最多 ¥${ws.balance.toFixed(2)}`}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">收款信息备注</label>
            <input
              value={bankNote}
              onChange={(e) => setBankNote(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
            />
          </div>
          {msg ? <p className={'text-sm ' + (msg.includes('提交') ? 'text-emerald-600' : 'text-red-600')}>{msg}</p> : null}
          <button type="submit" className="btn-primary px-6 py-2.5 rounded-xl text-sm font-semibold">
            提交提现申请
          </button>
        </form>
      )}

      {tab === 'withdrawals' && (
        <div className="overflow-x-auto card rounded-2xl border border-slate-200">
          <table className="w-full text-sm text-left min-w-[560px]">
            <thead className="bg-slate-50 text-xs text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">申请时间</th>
                <th className="px-4 py-3 font-medium">金额</th>
                <th className="px-4 py-3 font-medium">状态</th>
                <th className="px-4 py-3 font-medium">收款信息</th>
                <th className="px-4 py-3 font-medium">完成时间</th>
              </tr>
            </thead>
            <tbody>
              {ws.withdrawals.map((w) => (
                <tr key={w.id} className="border-t border-slate-100">
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{fmtDate(w.createdAt)}</td>
                  <td className="px-4 py-3 font-medium">¥{Number(w.amount).toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <span className={'text-xs px-2 py-0.5 rounded-full ' + (w.status === '已完成' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800')}>
                      {w.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600 text-xs">{w.bankInfo}</td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{w.reviewedAt ? fmtDate(w.reviewedAt) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'ledger' && (
        <div className="overflow-x-auto card rounded-2xl border border-slate-200">
          <table className="w-full text-sm text-left min-w-[560px]">
            <thead className="bg-slate-50 text-xs text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">时间</th>
                <th className="px-4 py-3 font-medium">摘要</th>
                <th className="px-4 py-3 font-medium">变动</th>
                <th className="px-4 py-3 font-medium">余额</th>
              </tr>
            </thead>
            <tbody>
              {ws.ledger.map((l) => (
                <tr key={l.id} className="border-t border-slate-100">
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{fmtDate(l.createdAt)}</td>
                  <td className="px-4 py-3 text-slate-800">{l.title}</td>
                  <td className={'px-4 py-3 font-medium ' + (l.amount >= 0 ? 'text-emerald-600' : 'text-red-600')}>
                    {l.amount >= 0 ? '+' : ''}{l.amount.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-slate-600">¥{l.balanceAfter.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
