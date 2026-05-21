/** 留资后可下载的资料配置（演示：浏览器端生成文件） */

export const LEAD_CAPTURE_CHANGED_EVENT = 'bingo-lead-capture-changed'

export const LEAD_ASSETS = {
  'franchise-cooperation-plan': {
    title: '免费获取机构合作方案',
    aliases: ['免费获取合作方案', '免费获取机构合作方案'],
    fileName: '缤果AI学院-加盟合作方案.txt',
    mimeType: 'text/plain;charset=utf-8',
    getContent: () => `缤果AI学院 · 加盟合作方案（资料摘要）

一、品牌与定位
缤果AI学院专注 AI 素养、科创竞赛与升学赋能，为教培机构提供「品牌 + 课程 + 师训 + 赛事 + 运营」一站式合作体系。

二、合作模式
1. 线下机构课程合作：授牌 + 课程 + 师训 + 运营赋能
2. 品牌加盟：品牌授权 + 全体系支持，共创本地 AI 教育
3. OEM 定制：课程 / 教具 / 工具定制 + 品牌联名 + 技术输出

三、总部支持清单
· 标准化分层课程产品（素养启蒙 / 竞赛培优 / 升学路径）
· 师资培训、教学督导与教研更新
· 白名单及国际赛事资源对接
· 招生方案、活动策划与品牌物料
· 教材教具与 AI 工具供应链支持

四、加盟流程
咨询洽谈 → 实地考察 / 线上评估 → 签约授牌 → 师训启动与开业督导

五、联系我们
机构合作热线：400-xxx-xxxx
商务微信：bingoacademy-b
邮箱：contact@bingoacademy.cn

—— 本文件为演示下载资料，正式合作政策以双方签署的协议为准。
`,
  },
  'franchise-ai-transform-pack': {
    title: '免费获取机构AI教育转型资料包',
    aliases: ['免费获取机构转型资料包'],
    fileName: '缤果AI学院-机构AI教育转型资料包.txt',
    mimeType: 'text/plain;charset=utf-8',
    getContent: () => `缤果AI学院 · 机构 AI 教育转型资料包

1. 行业趋势：校内 AI 素养与校外科创培训需求增长
2. 机构痛点：缺体系化课程、缺师训、缺赛事出口、缺运营方法
3. 转型路径：试点班 → 师资认证 → 赛事成果 → 品牌招生
4. 落地工具包：课程目录样例、4 周开业排期表、家长会话术提纲
5. 案例指标：合作机构营收平均提升 60%（演示数据）

详情请与商务顾问沟通获取完整版 PPT 与测算表。
`,
  },
  'resource-ai-transform-guide': {
    title: '《教培机构AI教育转型全攻略》',
    aliases: ['免费领取：《教培机构AI教育转型全攻略》'],
    fileName: '教培机构AI教育转型全攻略.txt',
    mimeType: 'text/plain;charset=utf-8',
    getContent: () => `《教培机构 AI 教育转型全攻略》目录摘要

第一章 为什么现在必须做 AI 教育
第二章 机构现有资源盘点与定位
第三章 课程产品组合与定价策略
第四章 师资培养与课堂 SOP
第五章 赛事与证书如何转化为招生
第六章 90 天转型行动清单

本资料为缤果AI学院加盟商专属资源演示版。
`,
  },
  'resource-ai-course-ops': {
    title: '《AI课程机构运营实操手册》',
    aliases: ['免费领取：《AI课程机构运营实操手册》'],
    fileName: 'AI课程机构运营实操手册.txt',
    mimeType: 'text/plain;charset=utf-8',
    getContent: () => `《AI 课程机构运营实操手册》目录摘要

· 开业前 30 天筹备清单
· 体验课转化 5 步法
· 续费与扩科话术
· 地推 / 异业 / 线上投放基础框架
· 班级满班率与退费率管理指标

本资料为缤果AI学院加盟商专属资源演示版。
`,
  },
  'resource-franchise-policy-live': {
    title: '免费公开课·合作政策+盈利模式解析',
    aliases: ['免费领取：免费公开课·合作政策+盈利模式解析'],
    fileName: '合作政策与盈利模式解析-公开课提纲.txt',
    mimeType: 'text/plain;charset=utf-8',
    getContent: () => `免费公开课 · 合作政策 + 盈利模式解析（提纲）

1. 缤果合作政策与授权范围说明
2. 单校盈利模型与投资回报测算逻辑
3. 典型校区营收结构拆解（演示）
4. 问答：场地、师资、招生节奏

报名后请联系商务顾问获取直播回放链接（演示环境为文本提纲下载）。
`,
  },
}

/** 根据弹窗标题或业务 key 解析资料 ID */
export function resolveLeadAssetKey(input) {
  const raw = String(input || '').trim()
  if (!raw) return null
  if (LEAD_ASSETS[raw]) return raw
  for (const [key, asset] of Object.entries(LEAD_ASSETS)) {
    if (asset.title === raw) return key
    if (asset.aliases?.includes(raw)) return key
    if (raw.startsWith('免费领取：')) {
      const inner = raw.slice('免费领取：'.length).trim()
      if (asset.title === inner || asset.aliases?.includes(raw)) return key
    }
  }
  if (raw.includes('合作方案')) return 'franchise-cooperation-plan'
  if (raw.includes('转型资料包')) return 'franchise-ai-transform-pack'
  return null
}

export function getLeadAsset(leadKey) {
  const key = resolveLeadAssetKey(leadKey)
  return key ? { key, ...LEAD_ASSETS[key] } : null
}

export function downloadLeadAsset(leadKey) {
  const asset = getLeadAsset(leadKey)
  if (!asset?.getContent) return false
  const blob = new Blob([asset.getContent()], { type: asset.mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = asset.fileName
  a.rel = 'noopener'
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
  return true
}
