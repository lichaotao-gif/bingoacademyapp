import { ArrowLeftOutlined, CalendarOutlined, FileTextOutlined } from '@ant-design/icons'
import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getHomeGuide } from '../data/homeGuides'

function RichTextBlock({ block }) {
  if (block.type === 'heading') {
    return <h2 className="mt-9 text-xl font-bold text-slate-950 sm:text-2xl">{block.text}</h2>
  }
  if (block.type === 'paragraph') {
    return <p className="mt-4 text-base leading-8 text-slate-700">{block.text}</p>
  }
  if (block.type === 'list') {
    return <ul className="mt-4 list-disc space-y-2 pl-6 text-base leading-8 text-slate-700">{block.items.map(item => <li key={item}>{item}</li>)}</ul>
  }
  if (block.type === 'image') {
    return <figure className="mt-7"><img src={block.src} alt={block.alt} width="1200" height="675" className="aspect-video w-full rounded-xl object-cover"/><figcaption className="mt-2 text-center text-xs text-slate-500">{block.caption}</figcaption></figure>
  }
  if (block.type === 'quote') {
    return <aside className="mt-7 border-l-4 border-slate-300 pl-4 text-sm leading-7 text-slate-500"><strong className="mr-2 text-slate-700">说明：</strong>{block.text}</aside>
  }
  return null
}

export default function GuideDetail() {
  const { slug } = useParams()
  const guide = getHomeGuide(slug)

  useEffect(() => {
    window.scrollTo(0, 0)
    if (!guide) return undefined
    const previousTitle = document.title
    document.title = `${guide.title}-缤果 AI 学院`
    return () => { document.title = previousTitle }
  }, [guide])

  if (!guide) {
    return <main className="mx-auto max-w-3xl px-5 py-24 text-center"><FileTextOutlined className="text-5xl text-slate-300"/><h1 className="mt-5 text-2xl font-black text-slate-950">未找到该指南</h1><Link to="/" className="mt-6 inline-flex min-h-11 items-center rounded-xl bg-blue-600 px-5 text-sm font-bold text-white">返回首页</Link></main>
  }

  return <main className="bg-white pb-16 text-slate-800">
    <section className="px-5 py-10 sm:py-12">
      <div className="mx-auto max-w-3xl">
        <Link to="/" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-blue-700 hover:text-blue-800 focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-blue-600"><ArrowLeftOutlined aria-hidden="true"/>返回首页</Link>
        <div className="mt-6 flex flex-wrap items-center gap-3 text-xs"><span className="font-semibold text-blue-700">{guide.category}</span><span className="inline-flex items-center gap-1.5 text-slate-500"><CalendarOutlined aria-hidden="true"/>更新于 {guide.updatedAt}</span></div>
        <h1 className="mt-4 text-3xl font-bold leading-tight text-slate-950 sm:text-4xl">{guide.title}</h1>
        <p className="mt-4 text-base leading-8 text-slate-600">{guide.summary}</p>
      </div>
    </section>

    <article className="mx-auto max-w-3xl px-5 py-8 sm:py-10" aria-label={`${guide.title}正文`}>
      {guide.content.map((block, index) => <RichTextBlock key={`${block.type}-${index}`} block={block} index={index}/>)}
    </article>
  </main>
}
