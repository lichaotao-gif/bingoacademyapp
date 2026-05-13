/**
 * 演示用：学具详情富文本为总部配置的可信 HTML，仍做基础剥离以降低误粘贴风险。
 * 正式环境应由服务端渲染或白名单富文本方案替代。
 */
export function sanitizeTeachingDetailHtml(html) {
  if (!html || typeof html !== 'string') return ''
  let s = html
  s = s.replace(/<\/(?:script|iframe|object|embed)[^>]*>/gi, '')
  s = s.replace(/<(?:script|iframe|object|embed)[\s\S]*?>[\s\S]*?<\/(?:script|iframe|object|embed)>/gi, '')
  s = s.replace(/<(?:script|iframe|object|embed)[^>]*\/?>/gi, '')
  s = s.replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
  s = s.replace(/href\s*=\s*(["']?)\s*javascript:/gi, 'href=$1#')
  return s
}
