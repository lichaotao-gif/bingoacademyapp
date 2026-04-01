import { useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  dicebearAvatarUrl,
  getSessionUser,
  saveSessionUser,
  sessionUserDisplayAvatarUrl,
} from '../utils/sessionUser'

const PRESET_AVATARS = [
  { seed: 'bingo-academy', label: '缤果' },
  { seed: 'star-student', label: '星际学员' },
  { seed: 'code-kid', label: '编程少年' },
  { seed: 'sunny-mom', label: '阳光家长' },
  { seed: 'robot-friend', label: '机器人' },
  { seed: 'galaxy-explorer', label: '探索者' },
]

const MAX_UPLOAD_BYTES = 2 * 1024 * 1024

function resizeImageToDataUrl(dataUrl, maxEdge = 256, quality = 0.88) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      try {
        let { width, height } = img
        if (width <= 0 || height <= 0) {
          resolve(dataUrl)
          return
        }
        if (width > maxEdge || height > maxEdge) {
          if (width >= height) {
            height = Math.round((height * maxEdge) / width)
            width = maxEdge
          } else {
            width = Math.round((width * maxEdge) / height)
            height = maxEdge
          }
        }
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          resolve(dataUrl)
          return
        }
        ctx.drawImage(img, 0, 0, width, height)
        resolve(canvas.toDataURL('image/jpeg', quality))
      } catch (e) {
        reject(e)
      }
    }
    img.onerror = () => reject(new Error('图像无法读取'))
    img.src = dataUrl
  })
}

export default function ProfileEdit() {
  const navigate = useNavigate()
  const fileRef = useRef(null)
  const initial = useMemo(() => getSessionUser(), [])

  const [nickname, setNickname] = useState(initial.nickname)
  const [avatarSeed, setAvatarSeed] = useState(initial.avatarSeed || 'bingo-academy')
  const [avatarUrl, setAvatarUrl] = useState(initial.avatarUrl || '')
  const [uploadError, setUploadError] = useState('')

  const previewUser = { nickname, avatarSeed, avatarUrl }
  const previewSrc = sessionUserDisplayAvatarUrl(previewUser)

  const handlePreset = (seed) => {
    setAvatarSeed(seed)
    setAvatarUrl('')
    setUploadError('')
  }

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setUploadError('请选择图片文件')
      return
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      setUploadError('图片请小于 2MB')
      return
    }
    setUploadError('')
    const reader = new FileReader()
    reader.onload = async () => {
      try {
        const raw = String(reader.result || '')
        const resized = await resizeImageToDataUrl(raw, 256, 0.88)
        if (resized.length > 500_000) {
          setUploadError('压缩后仍较大，请换一张较小的图片')
          return
        }
        setAvatarUrl(resized)
      } catch {
        setUploadError('图片处理失败，请换一张试试')
      }
    }
    reader.onerror = () => setUploadError('无法读取文件')
    reader.readAsDataURL(file)
  }

  const handleSave = () => {
    saveSessionUser({
      nickname,
      avatarSeed,
      avatarUrl: avatarUrl.trim(),
    })
    navigate('/profile')
  }

  const handleClearUpload = () => {
    setAvatarUrl('')
    setUploadError('')
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <Link to="/profile" className="text-primary text-sm hover:underline mb-6 inline-block">
        ← 返回个人中心
      </Link>
      <h1 className="text-xl font-bold text-bingo-dark mb-6">编辑资料</h1>

      <div className="card p-6 space-y-6">
        <div className="flex flex-col items-center gap-2">
          <img
            src={previewSrc}
            alt=""
            className="h-24 w-24 rounded-full border-4 border-primary/15 object-cover bg-slate-100 shadow-inner"
            width={96}
            height={96}
            decoding="async"
          />
          <p className="text-xs text-slate-500">预览 · 保存后全站报告与头像一致</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">昵称</label>
          <input
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            maxLength={24}
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
            placeholder="显示在测评报告等处"
          />
        </div>

        <div>
          <p className="text-sm font-semibold text-bingo-dark mb-3">预设头像</p>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {PRESET_AVATARS.map(({ seed, label }) => {
              const active = !avatarUrl && avatarSeed === seed
              return (
                <button
                  key={seed}
                  type="button"
                  title={label}
                  onClick={() => handlePreset(seed)}
                  className={
                    'flex flex-col items-center gap-1 rounded-xl p-2 border-2 transition ' +
                    (active ? 'border-primary bg-primary/5' : 'border-slate-100 hover:border-slate-200')
                  }
                >
                  <img
                    src={dicebearAvatarUrl(seed, 96)}
                    alt=""
                    className="h-12 w-12 rounded-full object-cover bg-slate-50"
                    width={48}
                    height={48}
                    decoding="async"
                  />
                  <span className="text-[10px] text-slate-600 truncate max-w-full">{label}</span>
                </button>
              )
            })}
          </div>
          <p className="text-[11px] text-slate-400 mt-2">选择预设会关闭自定义上传图，以卡通形象展示。</p>
        </div>

        <div>
          <p className="text-sm font-semibold text-bingo-dark mb-2">本地上传</p>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={handleFile}
          />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="rounded-xl border border-primary text-primary text-sm font-medium px-4 py-2.5 hover:bg-primary/5"
            >
              选择图片
            </button>
            {avatarUrl ? (
              <button
                type="button"
                onClick={handleClearUpload}
                className="rounded-xl border border-slate-200 text-slate-600 text-sm px-4 py-2.5 hover:bg-slate-50"
              >
                移除自定义图
              </button>
            ) : null}
          </div>
          {uploadError ? <p className="text-xs text-red-500 mt-2">{uploadError}</p> : null}
          <p className="text-[11px] text-slate-400 mt-2">
            支持 JPG / PNG / WebP / GIF，最大 2MB；将自动压缩后再保存到浏览器。
          </p>
        </div>

        <div className="flex gap-3 pt-2">
          <Link
            to="/profile"
            className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-medium text-sm text-center hover:bg-slate-50"
          >
            取消
          </Link>
          <button type="button" onClick={handleSave} className="flex-1 btn-primary py-3 font-bold text-sm rounded-xl">
            保存
          </button>
        </div>
      </div>
    </div>
  )
}
