import { useState } from 'react'
import { downloadLeadAsset, getLeadAsset } from '../utils/leadCaptureAssets'
import { useLeadSubmitted } from '../hooks/useLeadSubmitted'
import LeadCaptureModal from './LeadCaptureModal'

/** 资料列表行：提交前领取，提交后下载 */
export default function LeadCaptureListRow({ leadKey, icon, title, tag }) {
  const [modalOpen, setModalOpen] = useState(false)
  const asset = getLeadAsset(leadKey)
  const resolvedKey = asset?.key || leadKey
  const submitted = useLeadSubmitted(resolvedKey)

  const onRowClick = () => {
    if (submitted) {
      if (!downloadLeadAsset(resolvedKey)) {
        window.alert('暂无法下载该资料，请联系商务顾问。')
      }
      return
    }
    setModalOpen(true)
  }

  return (
    <>
      <li
        role="button"
        tabIndex={0}
        onClick={onRowClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onRowClick()
          }
        }}
        className="flex items-center gap-3 p-3 bg-white rounded-xl border border-sky-100 hover:border-sky-300 transition cursor-pointer"
      >
        <span className="text-xl shrink-0">{icon}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-bingo-dark">{title}</p>
          <span className="text-[10px] bg-sky-100 text-sky-700 px-1.5 py-0.5 rounded">{tag}</span>
        </div>
        <span className={`text-xs shrink-0 font-semibold ${submitted ? 'text-emerald-600' : 'text-sky-600'}`}>
          {submitted ? '下载资料 →' : '领取 →'}
        </span>
      </li>
      {modalOpen ? (
        <LeadCaptureModal leadKey={resolvedKey} title={title} onClose={() => setModalOpen(false)} orgField />
      ) : null}
    </>
  )
}
