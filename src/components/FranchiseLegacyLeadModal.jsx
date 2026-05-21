import { useState } from 'react'
import { downloadLeadAsset, resolveLeadAssetKey } from '../utils/leadCaptureAssets'
import { saveLeadSubmission } from '../utils/leadCaptureStorage'

/** 提交后于弹窗内提供资料下载的入口（专属资源列表领取仍仅关闭弹窗） */
const FRANCHISE_LEGACY_DOWNLOAD_KEYS = new Set(['franchise-cooperation-plan', 'franchise-ai-transform-pack'])

/**
 * 加盟合作页留资弹窗（原版样式）。合作方案、机构转型资料包提交后可下载对应文件。
 */
export default function FranchiseLegacyLeadModal({ title, onClose }) {
  const [phase, setPhase] = useState('form')
  const assetKey = resolveLeadAssetKey(title)
  const enableDownload = Boolean(assetKey && FRANCHISE_LEGACY_DOWNLOAD_KEYS.has(assetKey))

  const downloadSuccessHint =
    assetKey === 'franchise-ai-transform-pack'
      ? '提交成功，可下载机构 AI 教育转型资料包'
      : '提交成功，可下载合作方案资料'

  const handleSubmit = () => {
    if (enableDownload) {
      saveLeadSubmission(assetKey, {})
      setPhase('download')
      return
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose} role="dialog" aria-modal="true">
      <div className="bg-white rounded-2xl p-8 max-w-sm w-full mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {phase === 'download' && enableDownload ? (
          <>
            <h3 className="font-bold text-bingo-dark text-lg mb-1">{title}</h3>
            <p className="text-slate-500 text-sm mb-5">{downloadSuccessHint}</p>
            <button
              type="button"
              onClick={() => {
                if (!downloadLeadAsset(assetKey)) {
                  window.alert('暂无法下载，请联系商务顾问。')
                }
              }}
              className="w-full bg-sky-600 hover:bg-sky-700 text-white py-3 rounded-xl font-bold text-sm transition"
            >
              下载资料
            </button>
            <button type="button" onClick={onClose} className="mt-3 w-full text-slate-400 text-sm hover:text-slate-600">
              关闭
            </button>
          </>
        ) : (
          <>
            <h3 className="font-bold text-bingo-dark text-lg mb-1">{title}</h3>
            <p className="text-slate-500 text-sm mb-5">请留下您的联系方式，商务顾问将在24小时内与您联系</p>
            <input type="text" placeholder="您的姓名" className="w-full border rounded-xl px-4 py-2.5 text-sm mb-3 outline-none focus:border-sky-400" />
            <input type="tel" placeholder="手机号码" className="w-full border rounded-xl px-4 py-2.5 text-sm mb-3 outline-none focus:border-sky-400" />
            <input type="text" placeholder="机构名称（选填）" className="w-full border rounded-xl px-4 py-2.5 text-sm mb-4 outline-none focus:border-sky-400" />
            <button
              type="button"
              onClick={handleSubmit}
              className="w-full bg-sky-600 hover:bg-sky-700 text-white py-3 rounded-xl font-bold text-sm transition"
            >
              立即提交
            </button>
            <button type="button" onClick={onClose} className="mt-3 w-full text-slate-400 text-sm hover:text-slate-600">
              取消
            </button>
          </>
        )}
      </div>
    </div>
  )
}
