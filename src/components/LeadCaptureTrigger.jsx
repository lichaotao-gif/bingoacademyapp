import { useState } from 'react'
import { downloadLeadAsset, getLeadAsset } from '../utils/leadCaptureAssets'
import { useLeadSubmitted } from '../hooks/useLeadSubmitted'
import LeadCaptureModal from './LeadCaptureModal'

/**
 * 留资按钮：未提交显示 label；已提交显示「下载资料」并直接下载。
 */
export default function LeadCaptureTrigger({
  leadKey,
  label,
  className = '',
  downloadClassName = '',
  submittedLabel = '下载资料',
  orgField = false,
  title,
}) {
  const [modalOpen, setModalOpen] = useState(false)

  const asset = getLeadAsset(leadKey)
  const resolvedKey = asset?.key || leadKey
  const submitted = useLeadSubmitted(resolvedKey)
  const canDownload = Boolean(asset?.getContent)

  const handleClick = () => {
    if (submitted && canDownload) {
      if (!downloadLeadAsset(resolvedKey)) {
        window.alert('暂无法下载该资料，请联系商务顾问。')
      }
      return
    }
    if (submitted) return
    setModalOpen(true)
  }

  const btnClass = submitted && canDownload
    ? downloadClassName ||
      'bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl text-sm font-bold transition'
    : className

  return (
    <>
      <button type="button" onClick={handleClick} className={btnClass}>
        {submitted && canDownload ? submittedLabel : submitted ? '已提交' : label}
      </button>
      {modalOpen ? (
        <LeadCaptureModal
          leadKey={resolvedKey}
          title={title || asset?.title}
          orgField={orgField}
          onClose={() => setModalOpen(false)}
        />
      ) : null}
    </>
  )
}
