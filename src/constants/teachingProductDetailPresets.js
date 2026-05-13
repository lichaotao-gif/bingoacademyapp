/**
 * 学具商城详情页：无总部 detailHtml 时按商品 id 展示的图文（静态 HTML）。
 */

function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function block(title, inner) {
  return `<section style="margin-bottom:20px"><h3 style="font-size:1.05rem;margin:0 0 10px;color:#0f172a">${esc(title)}</h3>${inner}</section>`
}

/** @param {{ id: string, name: string, desc: string, coverImageUrl?: string }} p */
export function getTeachingProductDemoDetailHtml(p) {
  const id = String(p?.id || '')
  const desc = p?.desc || ''

  const commonSpecs = `
<table style="width:100%;border-collapse:collapse;font-size:13px;margin:8px 0 0">
<tr style="border-bottom:1px solid #e2e8f0"><th style="text-align:left;padding:8px 6px;color:#64748f;width:32%">项目</th><th style="text-align:left;padding:8px 6px;color:#0f172a">说明</th></tr>
<tr><td style="padding:8px 6px;color:#64748f">适用场景</td><td style="padding:8px 6px">人工智能主题课、社团与短期营</td></tr>
<tr style="background:#f8fafc"><td style="padding:8px 6px;color:#64748f">建议年级</td><td style="padding:8px 6px">小学高年级至初中（可按校区调整）</td></tr>
<tr><td style="padding:8px 6px;color:#64748f">包装清单</td><td style="padding:8px 6px">主机/套件、说明书、安全须知卡、质保说明</td></tr>
<tr style="background:#f8fafc"><td style="padding:8px 6px;color:#64748f">课堂支持</td><td style="padding:8px 6px">总部可提供教案提纲与课例参考</td></tr>
</table>`

  const innerIntro = `
<p style="line-height:1.75;color:#334155;margin:0 0 12px;font-size:14px">${esc(desc)}</p>
${commonSpecs}`

  const blocksById = {
    'kit-ai-starter': () =>
      block('产品亮点', innerIntro) +
      block('课堂建议', `<ul style="margin:0;padding-left:1.25rem;line-height:1.75;color:#334155"><li>从「感知—反馈」小实验切入，理解传感器与简单逻辑。</li><li>2～3 课时完成一个可展示的小作品。</li><li>强调用电与操作安全，课前宣读安全须知。</li></ul>`),
    'robot-microbit': () =>
      block('产品亮点', innerIntro) +
      block('编程与 AI 入门', `<ul style="margin:0;padding-left:1.25rem;line-height:1.75;color:#334155"><li>图形化编程 + 硬件互动，适合第一节编程课建立信心。</li><li>可扩展简单 AI 主题：声控灯、随机表情等。</li><li>建议两人一组共用一套，便于协作与设备管理。</li></ul>`),
    'sensor-ai-kit': () =>
      block('产品亮点', innerIntro) +
      block('多模态实验', `<ul style="margin:0;padding-left:1.25rem;line-height:1.75;color:#334155"><li>视觉、距离、声音等模块可拆分演示或组合项目。</li><li>配套实验记录表模板，便于班课过程性评价。</li><li>适合与「数据采集—标注—简单分类」教学线衔接。</li></ul>`),
    'jetson-nano-edu': () =>
      block('产品亮点', innerIntro) +
      block('边缘 AI 演示', `<ul style="margin:0;padding-left:1.25rem;line-height:1.75;color:#334155"><li>用于课堂演示推理延迟、功耗与场景差异。</li><li>建议在教师演示台固定使用，学员以观摩+笔记本记录为主。</li><li>可搭配预置 Demo 镜像与操作说明使用。</li></ul>`),
    'ai-xlab-pack': () =>
      block('产品亮点', innerIntro) +
      block('班课耗材包', `<ul style="margin:0;padding-left:1.25rem;line-height:1.75;color:#334155"><li>按约 30 人规模配置，可按班级人数加订。</li><li>适合机器学习入门：采集卡、标签贴纸、记录表等。</li><li>开课前清点物料清单，避免课堂缺件。</li></ul>`),
    'drone-ai-lite': () =>
      block('产品亮点', innerIntro) +
      block('安全与合规', `<ul style="margin:0;padding-left:1.25rem;line-height:1.75;color:#334155"><li>仅限室内空旷场地或总部指定演示流程；遵守当地无人机管理规定。</li><li>护桨与限高限速为教育版默认配置，请勿自行改装。</li><li>课前须完成安全宣讲与家长知情说明（演示要求）。</li></ul>`),
  }

  const fn = blocksById[id]
  if (!fn) return ''
  return `<div class="teaching-product-detail-demo">${fn()}</div>`
}
