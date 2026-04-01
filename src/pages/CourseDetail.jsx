import { useState, useEffect, useMemo } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import PaymentModal from '../components/PaymentModal'
import ShareActionPopover from '../components/ShareActionPopover'
import { getPurchasedCourseIds } from '../utils/purchasedCoursesStorage'
import { getUserReviewsForCourse, prependUserReviewForCourse } from '../utils/courseDetailReviewsStorage'

// 班型数据（启蒙课/Level1 默认）
const CLASS_TYPES_LEVEL1 = [
  { id: 'standard', name: '标准班', price: 299, origPrice: 399, lessons: 12, fit: '6-10岁入门', recommended: true },
  { id: 'premium', name: '进阶班', price: 499, origPrice: 699, lessons: 20, fit: '10-14岁进阶' },
  { id: 'vip', name: '1v1定制', price: 1280, origPrice: 1680, lessons: 12, fit: '专属学习计划' },
]
const CLASS_TYPES_LEVEL2 = [
  { id: 'standard', name: '标准班', price: 698, origPrice: 898, lessons: 16, fit: '13-15岁初中', recommended: true },
  { id: 'premium', name: '进阶班', price: 998, origPrice: 1298, lessons: 20, fit: '15-18岁高中' },
  { id: 'vip', name: '1v1定制', price: 2680, origPrice: 3280, lessons: 16, fit: '专属学习计划' },
]
const CLASS_TYPES_LEVEL3 = [
  { id: 'standard', name: '标准班', price: 1280, origPrice: 1580, lessons: 20, fit: '16-18岁高中', recommended: true },
  { id: 'premium', name: '进阶班', price: 1980, origPrice: 2480, lessons: 24, fit: '18-22岁大学' },
  { id: 'vip', name: '1v1定制', price: 3980, origPrice: 4980, lessons: 20, fit: '专属项目指导' },
]
const CLASS_TYPES_LEVEL4 = [
  { id: 'standard', name: '标准班', price: 1680, origPrice: 2180, lessons: 24, fit: '职场/创业', recommended: true },
  { id: 'premium', name: '进阶班', price: 2680, origPrice: 3480, lessons: 32, fit: '深度专项' },
  { id: 'vip', name: '1v1定制', price: 5980, origPrice: 7980, lessons: 24, fit: '精英导师1v1' },
]

// 与课程列表一致的封面图 seed（picsum），详情页用同 seed 大图
const COURSE_COVER_SEED = {
  'ai-enlighten': 'level1',
  'ai-programming': 'level1',
  'ai-art': 'level1',
  'ai-robot': 'level1',
  'ai-advance-basic': 'level2',
  'ai-advance-ml': 'level2',
  'ai-advance-contest': 'level2',
  'ai-advance-ethics': 'level2',
  'ai-practice-general': 'level3',
  'ai-practice-robot': 'level3',
  'ai-practice-edu': 'level3',
  'ai-practice-data': 'level3',
  'ai-empower-specialty': 'level4',
  'ai-empower-startup': 'level4',
  'ai-empower-value': 'level4',
  'ai-empower-leadership': 'level4',
}

const COURSES = {
  'ai-enlighten': {
    name: 'AI 启蒙通识课',
    poster: 'https://placehold.co/1400x600/0891b2/ffffff?text=AI%E5%90%AF%E8%92%99%E9%80%9A%E8%AF%86%E8%AF%BE',
    teacher: '缤果讲师团',
    audience: '8-14岁',
    learningGoal: '建立对人工智能的科学认知框架，理解AI与人类社会的协作关系，培养未来的数字公民素养。',
    goalPoints: ['理解人工智能的定义与基本分类', '掌握机器感知（视觉、语音）的常见应用场景', '了解知识表征与推理在AI中的作用', '建立对机器学习入门的直观认知', '能描述自然交互与AI实验的简单原理'],
    keyDesc: '体系化涵盖机器感知、知识表征推理、机器学习与自然交互四大核心模块。课程摒弃枯燥理论，搭配人脸识别、语音控制等丰富的AI互动实验，通过动手实验与互动项目，引导孩子建立对 AI 工作方式的直观理解。',
    outline: ['机器感知', '知识表征与推理', '机器学习入门', '自然交互与AI实验'],
    trial: true,
    commission: '10%',
    price: '价格',
    priceNote: null,
  },
  'ai-programming': {
    name: 'AI编程入门课',
    classTypes: CLASS_TYPES_LEVEL1,
    poster: 'https://placehold.co/1400x600/0f172a/ffffff?text=AI%E7%BC%96%E7%A8%8B%E5%85%A5%E9%97%A8%E8%AF%BE',
    teacher: '缤果讲师团',
    audience: '10-15岁',
    learningGoal: '掌握 Python 核心语法，初步建立计算思维，具备开发独立小型软件的能力。',
    goalPoints: ['掌握 Python 变量、数据类型与基本运算', '能使用条件与循环编写简单程序', '理解函数定义与调用，完成计算器项目', '能独立实现智能贪吃蛇小游戏', '掌握迷宫寻路等基础算法思想'],
    keyDesc: '采用Python编程基础+AI场景应用的双重教学法。通过项目制学习，带领学生亲手编写计算器、智能贪吃蛇、迷宫寻路算法等应用程序。在编程项目中引入基础的算法思想与问题拆解方法，为后续学习人工智能打下认知基础。',
    outline: ['Python 核心语法', '计算器项目', '智能贪吃蛇', '迷宫寻路算法与算法思想'],
    trial: true,
    commission: '10%',
    price: '价格',
    priceNote: null,
  },
  'ai-art': {
    name: 'AI 艺术创意工坊',
    classTypes: CLASS_TYPES_LEVEL1,
    poster: 'https://placehold.co/1400x600/155e75/ffffff?text=AI%E8%89%BA%E6%9C%AF%E5%88%9B%E6%84%8F%E5%B7%A5%E5%9D%8A',
    teacher: '缤果讲师团',
    audience: '8-15岁',
    learningGoal: '掌握生成式AI（AIGC）工具的使用，培养「提示词工程」能力与审美表达。',
    goalPoints: ['熟练使用即梦、豆包、通义等AIGC工具', '掌握提示词撰写与迭代优化方法', '能完成数字画展主题创作与排版', '能独立完成一本AI绘本从构思到成稿', '建立跨学科创意表达与审美判断能力'],
    keyDesc: '融合即梦、豆包、通义、ComfyUI等工具，带领孩子从零开始构建自己的数字画展或绘本。课程核心不在于绘画技巧，而在于如何将脑中的创意转化为精准的指令，培养跨学科的表达力。',
    outline: ['AIGC 工具入门', '提示词工程', '数字画展创作', '绘本制作与实践'],
    trial: true,
    commission: '10%',
    price: '价格',
    priceNote: null,
  },
  'ai-robot': {
    name: '智能机器人实战营',
    poster: 'https://placehold.co/1400x600/0e7490/ffffff?text=%E6%99%BA%E8%83%BD%E6%9C%BA%E5%99%A8%E4%BA%BA%E5%AE%9E%E6%88%98%E8%90%A5',
    teacher: '缤果讲师团',
    audience: '9-15岁',
    learningGoal: '理解传感器原理与嵌入式编程，实现AI算法在物理世界的落地。',
    goalPoints: ['理解常见传感器原理与接线方法', '掌握 Arduino/树莓派基础编程与环境搭建', '能实现避障与自动巡航功能', '能完成人脸追踪智能小车项目', '建立硬件与软件联调的问题排查能力'],
    keyDesc: '使用 Arduino 或树莓派硬件平台，亲手组装具备避障、人脸追踪、自动巡航功能的智能小车。让代码走出屏幕，让孩子在动手拆装中理解工业 4.0 的基本逻辑。',
    outline: ['传感器原理与嵌入式编程', 'Arduino/树莓派入门', '避障与自动巡航', '人脸追踪智能小车'],
    trial: false,
    commission: '10%',
    price: '¥4500',
    priceNote: '含器材包',
    classTypes: CLASS_TYPES_LEVEL1,
  },
  // ── AI精英进阶课 Level2 ──
  'ai-advance-basic': {
    name: 'AI基础原理与应用',
    poster: 'https://placehold.co/1400x600/0284c7/ffffff?text=AI%E5%9F%BA%E7%A1%80%E5%8E%9F%E7%90%86',
    teacher: '缤果讲师团',
    audience: '13-15岁',
    learningGoal: '掌握AI核心概念与常用工具进阶应用，对接初中AI白名单赛事。',
    goalPoints: ['理解机器学习、深度学习、神经网络的基本概念', '掌握AI视频剪辑与AI文案创作工具进阶用法', '能使用AI完成数据可视化与报告', '能将AI与学科内容融合设计教学场景', '了解初中AI白名单赛事要求与备赛要点'],
    keyDesc: 'AI核心概念：机器学习、深度学习、神经网络（简化聚焦应用）；常用AI工具进阶：AI视频剪辑、AI文案创作、AI数据可视化；AI与学科融合，对接初中AI白名单赛事。',
    outline: ['AI核心概念', '常用AI工具进阶', 'AI与学科融合', '对接白名单赛事'],
    trial: true,
    commission: '10%',
    price: '¥698起',
    priceNote: null,
    classTypes: CLASS_TYPES_LEVEL2,
  },
  'ai-advance-ml': {
    name: '机器学习入门与实战',
    poster: 'https://placehold.co/1400x600/0369a1/ffffff?text=%E6%9C%BA%E5%99%A8%E5%AD%A6%E4%B9%A0',
    teacher: '缤果讲师团',
    audience: '15-18岁',
    learningGoal: '掌握机器学习基础与AI项目实战，对接科技特长生升学。',
    goalPoints: ['掌握数据收集、特征提取与模型训练基本流程', '理解线性回归、决策树、神经网络的应用场景', '能使用 Python 完成简单机器学习项目', '能独立完成一个AI小项目并撰写说明', '了解科技特长生升学政策与材料准备要点'],
    keyDesc: '机器学习基础：数据收集、特征提取、模型训练（结合Python）；常用模型：线性回归、决策树、神经网络；AI项目实战与科技特长生升学解读。',
    outline: ['机器学习基础', '常用模型', 'AI项目实战', '科技特长生升学'],
    trial: true,
    commission: '10%',
    price: '¥698起',
    priceNote: null,
    classTypes: CLASS_TYPES_LEVEL2,
  },
  'ai-advance-contest': {
    name: 'AI竞赛培优课',
    poster: 'https://placehold.co/1400x600/0c4a6e/ffffff?text=AI%E7%AB%9E%E8%B5%9B%E5%9F%B9%E4%BC%98',
    teacher: '缤果讲师团',
    audience: '14-18岁',
    learningGoal: '聚焦2026年AI类白名单赛事，从选题到答辩全程指导。',
    goalPoints: ['掌握2026年AI类白名单赛事规则与评分标准', '能完成从选题、方案设计到作品落地的全流程', '能撰写项目说明与答辩稿并做模拟答辩', '能分析往届获奖案例并迁移到自己的项目', '建立赛事时间管理与团队协作意识'],
    keyDesc: '聚焦2026年AI类白名单赛事拆解与评分标准；项目选题、方案设计到落地展示，全程指导；虚拟赛事场景模拟，往届获奖案例解析。',
    outline: ['赛事拆解', '项目全流程', '虚拟模拟', '案例解析'],
    trial: false,
    commission: '10%',
    price: '¥998起',
    priceNote: null,
    classTypes: CLASS_TYPES_LEVEL2,
  },
  'ai-advance-ethics': {
    name: 'AI伦理与精英思维',
    poster: 'https://placehold.co/1400x600/075985/ffffff?text=AI%E4%BC%A6%E7%90%86',
    teacher: '缤果讲师团',
    audience: '13-18岁',
    learningGoal: 'AI伦理深度探讨与精英思维培养，AI公益项目设计。',
    goalPoints: ['理解AI伦理中的偏见、隐私与社会责任问题', '建立批判性思维与创新思维的分析框架', '能参与AI伦理辩论并表达观点', '能设计一个AI公益项目方案', '具备一定的全球视野与跨文化思考能力'],
    keyDesc: 'AI伦理：偏见、隐私、社会责任；批判性思维、创新思维、全球视野；AI伦理辩论赛、AI公益项目设计。',
    outline: ['AI伦理', '精英思维', '伦理辩论', '公益项目'],
    trial: true,
    commission: '10%',
    price: '¥698起',
    priceNote: null,
    classTypes: CLASS_TYPES_LEVEL2,
  },
  // ── AI精英实战课 Level3 ──
  'ai-practice-general': {
    name: 'AI创新项目实战（通用方向）',
    poster: 'https://placehold.co/1400x600/4338ca/ffffff?text=AI%E5%88%9B%E6%96%B0%E9%A1%B9%E7%9B%AE',
    teacher: '缤果讲师团',
    audience: '16-22岁',
    learningGoal: '能独立完成AI创新项目，对接科创成果转化与孵化支持。',
    goalPoints: ['能完成从选题、方案设计到技术实现的全流程', '掌握项目测试优化与展示汇报的方法', '能开发跨学科AI小项目并撰写说明文档', '掌握科创论文写作与期刊投稿基本规范', '了解成果转化与孵化平台对接流程'],
    keyDesc: 'AI项目全流程：选题→方案设计→技术实现→测试优化→展示；跨学科AI项目开发，科创论文写作与期刊发表指导；优秀项目对接孵化平台。',
    outline: ['项目全流程', '跨学科开发', '论文发表', '成果转化'],
    trial: false,
    commission: '10%',
    price: '¥1280起',
    priceNote: null,
    classTypes: CLASS_TYPES_LEVEL3,
  },
  'ai-practice-robot': {
    name: 'AI视觉与机器人编程实战',
    poster: 'https://placehold.co/1400x600/4f46e5/ffffff?text=AI%E8%A7%86%E8%A7%89%E6%9C%BA%E5%99%A8%E4%BA%BA',
    teacher: '缤果讲师团',
    audience: '16-22岁',
    learningGoal: '掌握AI视觉与机器人编程，对接企业实习与专利申请。',
    goalPoints: ['掌握图像识别、目标检测、人脸识别的基本应用', '能完成机器人搭建与编程控制实战', '能独立完成一个AI视觉或机器人小项目', '了解专利申请流程与材料准备', '具备线下实训与实习对接的沟通能力'],
    keyDesc: 'AI视觉：图像识别、目标检测、人脸识别；机器人搭建与编程控制；线下实训基地，对接AI机器人企业实习。',
    outline: ['AI视觉基础', '机器人编程', '线下实训', '实习对接'],
    trial: false,
    commission: '10%',
    price: '¥1280起',
    priceNote: null,
    classTypes: CLASS_TYPES_LEVEL3,
  },
  'ai-practice-edu': {
    name: '教育AI实战与开发',
    poster: 'https://placehold.co/1400x600/3730a3/ffffff?text=%E6%95%99%E8%82%B2AI%E5%AE%9E%E6%88%98',
    teacher: '缤果讲师团',
    audience: '16-22岁',
    learningGoal: '教育AI工具开发，项目投入实际使用。',
    goalPoints: ['能进行教育场景需求分析与方案设计', '能开发简易AI答疑机器人或学情分析模块', '掌握教育大模型调用与提示设计', '能撰写项目说明并参与中小学试点对接', '建立教育产品思维与用户反馈迭代意识'],
    keyDesc: '教育AI需求分析；AI答疑机器人、AI学情分析系统；教育大模型应用；对接中小学试点。',
    outline: ['需求分析', '工具开发', '大模型应用', '试点对接'],
    trial: false,
    commission: '10%',
    price: '¥1280起',
    priceNote: null,
    classTypes: CLASS_TYPES_LEVEL3,
  },
  'ai-practice-data': {
    name: 'AI数据科学与可视化实战',
    poster: 'https://placehold.co/1400x600/312e81/ffffff?text=AI%E6%95%B0%E6%8D%AE%E7%A7%91%E5%AD%A6',
    teacher: '缤果讲师团',
    audience: '16-22岁',
    learningGoal: '数据科学基础与AI建模，考取AI数据分析师证书。',
    goalPoints: ['掌握数据收集、清洗与分析的完整流程', '能使用 Python 与 Excel 完成数据分析任务', '理解机器学习在数据科学中的典型应用', '能制作数据可视化与专业分析报告', '了解AI数据分析师证书考试要求与备考要点'],
    keyDesc: '数据收集、清洗、分析（Python+Excel）；机器学习在数据科学中的应用；数据可视化与专业报告；对接企业真实数据项目。',
    outline: ['数据基础', 'AI建模', '数据可视化', '证书对接'],
    trial: false,
    commission: '10%',
    price: '¥1280起',
    priceNote: null,
    classTypes: CLASS_TYPES_LEVEL3,
  },
  // ── AI精英赋能课 Level4 ──
  'ai-empower-specialty': {
    name: 'AI专项领域精通课',
    poster: 'https://placehold.co/1400x600/6b21a8/ffffff?text=AI%E4%B8%93%E9%A1%B9%E7%B2%BE%E9%80%9A',
    teacher: '缤果精英导师团',
    audience: '20-28岁',
    learningGoal: '成为AI专项领域精英，获企业内推机会。',
    goalPoints: ['掌握AI大模型应用与Prompt工程实战技能', '理解AI产品经理职责与需求分析方法', '具备AI算法入门级理解与调参能力', '能完成1v1指导下的专项作品集与面试准备', '了解企业内推渠道与简历投递要点'],
    keyDesc: '赛道1：AI大模型应用与Prompt工程；赛道2：AI产品经理；赛道3：AI算法入门；职场精英导师1v1指导。',
    outline: ['大模型应用', 'AI产品经理', 'AI算法', '1v1指导'],
    trial: false,
    commission: '10%',
    price: '¥1680起',
    priceNote: null,
    classTypes: CLASS_TYPES_LEVEL4,
  },
  'ai-empower-startup': {
    name: 'AI创业赋能课',
    poster: 'https://placehold.co/1400x600/7c3aed/ffffff?text=AI%E5%88%9B%E4%B8%9A%E8%B5%8B%E8%83%BD',
    teacher: '缤果精英导师团',
    audience: '20-28岁',
    learningGoal: '2026年AI创业趋势，对接孵化器与投资机构。',
    goalPoints: ['掌握2026年AI创业趋势与典型应用场景', '能撰写合格的创业计划书并做路演展示', '了解融资技巧与投资人沟通要点', '能完成虚拟AI创业项目从创意到BP', '了解孵化器与投资机构对接流程'],
    keyDesc: 'AI创业趋势与风口；创业计划书、融资技巧、资源对接；虚拟AI创业项目孵化；对接孵化器+投资机构。',
    outline: ['创业趋势', '计划书撰写', '项目孵化', '融资对接'],
    trial: false,
    commission: '10%',
    price: '¥1680起',
    priceNote: null,
    classTypes: CLASS_TYPES_LEVEL4,
  },
  'ai-empower-value': {
    name: 'AI成果变现实战课',
    poster: 'https://placehold.co/1400x600/581c87/ffffff?text=AI%E6%88%90%E6%9E%9C%E5%8F%98%E7%8E%B0',
    teacher: '缤果精英导师团',
    audience: '20-28岁',
    learningGoal: 'AI成果变现多路径，打造个人AI品牌。',
    goalPoints: ['掌握工具售卖、接单、课程创作、专利授权等变现路径', '能熟练使用接单平台并完成成果包装', '能独立完成一个真实AI变现小项目', '能制定个人AI品牌传播与运营计划', '建立持续变现与复购意识'],
    keyDesc: '工具售卖、接单、课程创作、专利授权；接单平台操作与成果包装；真实AI变现项目实操。',
    outline: ['变现路径', '平台操作', '项目实操', '个人品牌'],
    trial: false,
    commission: '10%',
    price: '¥1680起',
    priceNote: null,
    classTypes: CLASS_TYPES_LEVEL4,
  },
  'ai-empower-leadership': {
    name: 'AI精英领导力课',
    poster: 'https://placehold.co/1400x600/4c1d95/ffffff?text=AI%E7%B2%BE%E8%8B%B1%E9%A2%86%E5%AF%BC%E5%8A%9B',
    teacher: '缤果精英导师团',
    audience: '20-28岁',
    learningGoal: 'AI时代领导力，对接全球AI精英资源。',
    goalPoints: ['理解创新领导力、资源整合与团队管理核心要点', '能进行跨领域资源整合与项目协作', '建立全球AI趋势洞察与信息筛选能力', '能参与精英社群活动并输出观点', '具备与全球AI从业者沟通与协作的基础能力'],
    keyDesc: '创新领导力、资源整合、团队管理；跨领域资源整合；全球AI趋势洞察；加入缤果AI精英领袖社群。',
    outline: ['领导力核心', '资源整合', '趋势洞察', '精英社群'],
    trial: false,
    commission: '10%',
    price: '¥1680起',
    priceNote: null,
    classTypes: CLASS_TYPES_LEVEL4,
  },
}

/** 课程详情页：每门课至少 6 条虚拟评价（由课程名生成文案） */
function buildDetailPageMockReviews(courseId, courseName) {
  const slug = String(courseId).replace(/[^a-z0-9-]/gi, 'x') || 'c'
  return [
    { id: `${slug}-rv1`, nickname: '李家长', avatarSeed: `${slug}a`, rating: 5, content: `「${courseName}」内容扎实、节奏清楚，我们跟下来很顺。`, at: '2025-03-22 18:30' },
    { id: `${slug}-rv2`, nickname: '张同学', avatarSeed: `${slug}b`, rating: 5, content: '讲师专业，案例贴近实际，作业反馈也很快。', at: '2025-03-21 14:22' },
    { id: `${slug}-rv3`, nickname: '晨晨妈', avatarSeed: `${slug}c`, rating: 4, content: '整体满意，若直播课互动再多一点会更好。', at: '2025-03-20 09:18' },
    { id: `${slug}-rv4`, nickname: 'Coder_W', avatarSeed: `${slug}d`, rating: 5, content: '干货足，适合想系统提升的同学，已推荐给朋友。', at: '2025-03-18 21:08' },
    { id: `${slug}-rv5`, nickname: 'ivy笔记', avatarSeed: `${slug}e`, rating: 5, content: '二刷了重点章节，学习群氛围好，值得报。', at: '2025-03-17 11:45' },
    { id: `${slug}-rv6`, nickname: '南哥', avatarSeed: `${slug}f`, rating: 4, content: '性价比高，教务衔接顺畅，整体学习体验不错。', at: '2025-03-15 16:33' },
  ]
}

const COURSE_DETAIL_REVIEWS = Object.fromEntries(
  Object.entries(COURSES).map(([cid, c]) => [cid, buildDetailPageMockReviews(cid, c.name)])
)
const DETAIL_REVIEWS_FALLBACK = buildDetailPageMockReviews('fallback', '本课程')

function detailReviewAvatarUrl(seed) {
  const s = encodeURIComponent((seed || 'user').toString())
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${s}&size=128`
}

function DetailStars({ value }) {
  const n = Math.min(5, Math.max(0, Math.round(Number(value) || 0)))
  return (
    <span className="inline-flex items-center gap-0.5 text-amber-400 text-sm" aria-hidden>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={i <= n ? 'text-amber-400' : 'text-slate-200'}>
          ★
        </span>
      ))}
    </span>
  )
}

function DetailStarInput({ value, onChange, className = '' }) {
  const v = Math.min(5, Math.max(1, Math.round(Number(value) || 1)))
  return (
    <div className={`inline-flex flex-wrap items-center gap-1 ${className}`} role="group" aria-label="星级评分">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i)}
          className={`text-2xl leading-none p-0.5 rounded transition ${i <= v ? 'text-amber-400' : 'text-slate-200 hover:text-amber-200'}`}
          aria-label={`${i} 星`}
        >
          ★
        </button>
      ))}
      <span className="text-sm text-slate-500 ml-1 tabular-nums">{v} 星</span>
    </div>
  )
}

function getCourseDetailReviews(courseId) {
  return COURSE_DETAIL_REVIEWS[courseId] || DETAIL_REVIEWS_FALLBACK
}

function mergeDetailReviewsForDisplay(courseId) {
  const user = getUserReviewsForCourse(courseId)
  const mock = getCourseDetailReviews(courseId)
  return [...user, ...mock].sort((a, b) => String(b.at).localeCompare(String(a.at)))
}

export default function CourseDetail() {
  const { id } = useParams()
  const course = COURSES[id] || COURSES['ai-enlighten']
  const resolvedCourseId = COURSES[id] ? id : 'ai-enlighten'
  const classTypes = course.classTypes || CLASS_TYPES_LEVEL1
  const defaultClass = classTypes[0]
  const [showTrialEndModal, setShowTrialEndModal] = useState(false)
  const [showPlanModal, setShowPlanModal] = useState(false)
  const [showQa, setShowQa] = useState(false)
  const [coverError, setCoverError] = useState(false)
  const [searchParams] = useSearchParams()
  const incomingGroupId = searchParams.get('group')?.trim() || ''

  const [paymentModalOpen, setPaymentModalOpen] = useState(false)
  const [paymentModalPayload, setPaymentModalPayload] = useState({
    price: '',
    paymentState: {},
  })
  const [showGroupBuyModal, setShowGroupBuyModal] = useState(false)
  const [groupSession, setGroupSession] = useState(null)
  const [shareMenuRect, setShareMenuRect] = useState(null)
  const [purchasedIds, setPurchasedIds] = useState(() => getPurchasedCourseIds())
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewDraft, setReviewDraft] = useState('')
  const [detailReviewTick, setDetailReviewTick] = useState(0)
  const [detailReviewsExpanded, setDetailReviewsExpanded] = useState(false)

  const hasPurchasedCurrent = purchasedIds.includes(resolvedCourseId)
  const mergedDetailReviews = useMemo(() => mergeDetailReviewsForDisplay(resolvedCourseId), [resolvedCourseId, detailReviewTick])

  useEffect(() => {
    setPurchasedIds(getPurchasedCourseIds())
  }, [resolvedCourseId])

  useEffect(() => {
    const refresh = () => setPurchasedIds(getPurchasedCourseIds())
    window.addEventListener('focus', refresh)
    return () => window.removeEventListener('focus', refresh)
  }, [])

  useEffect(() => {
    if (!showReviewModal) return
    setReviewRating(5)
    setReviewDraft('')
  }, [showReviewModal])

  useEffect(() => {
    setDetailReviewsExpanded(false)
  }, [resolvedCourseId])

  const DETAIL_REVIEWS_PREVIEW = 5
  const visibleDetailReviews =
    detailReviewsExpanded || mergedDetailReviews.length <= DETAIL_REVIEWS_PREVIEW
      ? mergedDetailReviews
      : mergedDetailReviews.slice(0, DETAIL_REVIEWS_PREVIEW)
  const detailReviewsMoreCount = Math.max(0, mergedDetailReviews.length - DETAIL_REVIEWS_PREVIEW)

  const courseLink =
    typeof window !== 'undefined' ? `${window.location.origin}/courses/detail/${resolvedCourseId}` : ''
  const openShareMenu = (e) => setShareMenuRect(e.currentTarget.getBoundingClientRect())
  const closeShareMenu = () => setShareMenuRect(null)

  // 与课程列表一致的封面图（同 seed 大图），加载失败时回退到 course.poster
  const coverUrl = (id && COURSE_COVER_SEED[id] && !coverError)
    ? `https://picsum.photos/seed/${COURSE_COVER_SEED[id]}/1200/675`
    : course.poster

  const GROUP_TARGET = 3
  const GROUP_DISCOUNT = 0.6

  // 免费/赠送显示 0元，其余显示具体金额
  const priceDisplay = (course.price === '免费' || course.price === '赠送') ? '0元' : course.price
  const isCourseFree = course.price === '免费' || course.price === '赠送'
  const groupPriceNum = isCourseFree ? 0 : Math.round((defaultClass.price || 0) * GROUP_DISCOUNT)
  const groupPriceLabel = isCourseFree ? '0元' : `¥${groupPriceNum}`

  const openNormalCheckout = () => {
    setPaymentModalPayload({
      price: priceDisplay,
      paymentState: { courseId: resolvedCourseId, classType: defaultClass },
    })
    setPaymentModalOpen(true)
  }

  /** 发起新团或携带已有团号（好友邀请链接） */
  const openGroupBuyModal = (reuseGroupId = null) => {
    const id =
      (typeof reuseGroupId === 'string' && reuseGroupId.trim()) ||
      `grp_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`
    const invite =
      typeof window !== 'undefined'
        ? `${window.location.origin}/courses/detail/${resolvedCourseId}?group=${encodeURIComponent(id)}`
        : ''
    setGroupSession({ id, inviteLink: invite })
    setShowGroupBuyModal(true)
  }

  const copyGroupInviteLink = async () => {
    if (!groupSession?.inviteLink) return
    try {
      await navigator.clipboard.writeText(groupSession.inviteLink)
      window.alert('邀请链接已复制，快去微信发给好友吧～')
    } catch {
      window.prompt('请手动复制邀请链接：', groupSession.inviteLink)
    }
  }

  const inviteWeChatFriends = async () => {
    if (!groupSession?.inviteLink) return
    const text = `一起拼团学「${course.name}」！点链接参团享${Math.round(GROUP_DISCOUNT * 10)}折优惠～`
    try {
      if (navigator.share) {
        await navigator.share({ title: course.name, text: `${text}\n${groupSession.inviteLink}`, url: groupSession.inviteLink })
        return
      }
    } catch {
      /* 取消 */
    }
    await copyGroupInviteLink()
  }

  const payGroupOrder = () => {
    if (!groupSession) return
    setShowGroupBuyModal(false)
    setPaymentModalPayload({
      price: groupPriceLabel,
      paymentState: {
        courseId: resolvedCourseId,
        classType: {
          ...defaultClass,
          price: groupPriceNum,
          name: `${defaultClass.name}（${GROUP_TARGET}人拼团）`,
        },
        groupBuy: true,
        groupId: groupSession.id,
        groupInviteLink: groupSession.inviteLink,
        groupTargetSize: GROUP_TARGET,
      },
    })
    setPaymentModalOpen(true)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 lg:py-10 min-h-screen pb-24 lg:pb-28">
      <PaymentModal
        open={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        courseName={course.name}
        price={paymentModalPayload.price}
        paymentState={paymentModalPayload.paymentState}
      />
      {/* 顶部导航：仅返回 */}
      <div className="flex items-center justify-between gap-3 mb-4 sm:mb-6 lg:mb-8 sticky top-0 bg-white/95 backdrop-blur z-10 py-3 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 border-b border-slate-100 -mt-4 sm:mt-0">
        <Link to="/courses" className="text-primary text-sm lg:text-base hover:underline min-h-[44px] flex items-center">← 返回 AI精品课</Link>
      </div>

      {incomingGroupId && (
        <div className="mb-4 rounded-2xl border border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 px-4 py-3 sm:py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-sm text-orange-900">
            <span className="font-semibold">好友邀您拼团</span>
            <span className="text-orange-800/90"> · 成团享 {Math.round(GROUP_DISCOUNT * 10)} 折，还差成员即可锁定优惠</span>
          </p>
          <button
            type="button"
            onClick={() => openGroupBuyModal(incomingGroupId)}
            className="shrink-0 rounded-xl bg-orange-500 text-white text-sm font-semibold px-4 py-2.5 hover:bg-orange-600 min-h-[44px]"
          >
            立即参团
          </button>
        </div>
      )}

      <div className="card overflow-hidden p-0 mb-4 sm:mb-6 lg:mb-8 rounded-2xl">
        <div className="aspect-[16/9] bg-slate-100 relative">
          <img src={coverUrl} alt={course.name} className="w-full h-full object-cover" onError={() => setCoverError(true)} />
          <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 lg:bottom-5 lg:right-5 flex flex-wrap gap-2 justify-end">
            {course.trial && (
              <button onClick={() => setShowTrialEndModal(true)} className="bg-white/90 text-slate-700 px-3 py-2 sm:px-4 lg:px-5 lg:py-2.5 rounded-lg text-xs sm:text-sm font-medium hover:bg-white min-h-[40px]">
                免费试学
              </button>
            )}
          </div>
        </div>
        <div className="p-4 sm:p-6 lg:p-8">
          <h1 className="text-xl sm:text-3xl lg:text-4xl font-bold text-bingo-dark leading-tight">{course.name}</h1>
          <p className="text-slate-600 mt-2 text-sm sm:text-base lg:text-base">讲师：{course.teacher}</p>
          {course.audience && <p className="text-slate-600 mt-1 text-sm sm:text-base">面向人群：{course.audience}</p>}
          <div className="flex flex-wrap gap-2 sm:gap-3 mt-3 sm:mt-4 lg:mt-5">
            <span className="text-xs sm:text-sm px-2.5 py-1 sm:px-3 rounded-full bg-primary/10 text-primary">佣金比例 {course.commission}</span>
            <span className="text-xs sm:text-sm px-2.5 py-1 sm:px-3 rounded-full bg-slate-100 text-slate-700">价格 {priceDisplay}{course.priceNote ? `（${course.priceNote}）` : ''}</span>
            {course.trial && <span className="text-xs sm:text-sm px-2.5 py-1 sm:px-3 rounded-full bg-amber-50 text-amber-700">支持试看</span>}
          </div>
          {/* 封面图下方：价格 + 分享课程 + 立即购买 */}
          <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4 mt-4 sm:mt-5 lg:mt-6 pt-4 sm:pt-5 border-t border-slate-100">
            <span className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary">{priceDisplay}{course.priceNote ? `（${course.priceNote}）` : ''}</span>
            <div className="flex items-center gap-2 shrink-0">
              <button type="button" data-share-popover-anchor onClick={openShareMenu} className="border border-slate-300 text-slate-700 px-4 sm:px-5 py-2.5 sm:py-3 min-h-[44px] sm:min-h-[48px] rounded-xl text-sm font-medium hover:bg-slate-50 flex items-center gap-2">
                分享课程
              </button>
              <button type="button" onClick={openNormalCheckout} className="btn-primary px-5 sm:px-6 lg:px-8 py-2.5 sm:py-3 font-bold min-h-[44px] sm:min-h-[48px] rounded-xl text-sm shrink-0">
                立即购买
              </button>
            </div>
          </div>
        </div>
      </div>

      <section className="mb-6 sm:mb-8 lg:mb-10">
        <h2 className="text-base sm:text-lg lg:text-xl font-bold text-bingo-dark mb-3 sm:mb-4 lg:mb-5">学习目标</h2>
        <div className="card p-4 sm:p-6 lg:p-8 rounded-2xl">
          {(course.goalPoints && course.goalPoints.length > 0) ? (
            <ul className="space-y-2 sm:space-y-3">
              {course.goalPoints.map((point, i) => (
                <li key={i} className="flex items-start gap-2 text-slate-700 text-sm sm:text-base lg:text-lg leading-relaxed">
                  <span className="text-primary font-medium shrink-0">{i + 1}.</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-slate-700 leading-relaxed text-sm sm:text-base lg:text-lg">{course.learningGoal}</p>
          )}
        </div>
      </section>

      <section className="mb-6 sm:mb-8 lg:mb-10">
        <h2 className="text-base sm:text-lg lg:text-xl font-bold text-bingo-dark mb-3 sm:mb-4 lg:mb-5">课程特色</h2>
        <div className="card p-4 sm:p-6 lg:p-8 rounded-2xl">
          <p className="text-slate-700 leading-relaxed text-sm sm:text-base lg:text-lg">{course.keyDesc}</p>
        </div>
      </section>

      {/* 课程详情：大纲 + 试学视频，H5 单列 / md+ 左右等宽两列 */}
      <section className="mb-6 sm:mb-8 lg:mb-10">
        <h2 className="text-base sm:text-lg lg:text-xl font-bold text-bingo-dark mb-3 sm:mb-4 lg:mb-5">课程详情</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 md:items-stretch">
          <div className="card p-4 lg:p-5 rounded-2xl h-full flex flex-col min-h-0 md:min-h-[320px]">
            <h3 className="font-semibold text-bingo-dark mb-3 lg:text-base shrink-0">课程大纲</h3>
            <div className="flex-1 min-h-0 overflow-y-auto">
              <ul className="list-none m-0 p-0">
                {(course.outline || []).map((t, i) => (
                  <li key={i} className="border-b border-slate-100 last:border-0 py-2.5 text-sm text-slate-700 leading-snug">
                    {i + 1}. {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="card p-4 lg:p-5 rounded-2xl h-full flex flex-col min-h-0 md:min-h-[320px]">
            <h3 className="font-semibold text-bingo-dark mb-3 text-sm sm:text-base shrink-0">试学视频</h3>
            <div className="flex-1 flex flex-col min-h-[200px] md:min-h-0">
              <div className="aspect-video bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 text-xs sm:text-sm w-full flex-1 min-h-[160px]">
                直播/录播片段
              </div>
              <p className="text-xs text-slate-500 mt-2 shrink-0">支持倍速 · 暂停</p>
            </div>
          </div>
        </div>
      </section>

      {/* 学员评价（独立板块，位于定制学情上方） */}
      <section className="mb-6 sm:mb-8 lg:mb-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3 sm:mb-4">
          <h2 className="text-base sm:text-lg lg:text-xl font-bold text-bingo-dark m-0">学员评价</h2>
          <button
            type="button"
            onClick={() => {
              if (!hasPurchasedCurrent) {
                window.alert(
                  '仅已购买本课程的学员可以发表评价。\n\n请先点击「立即购买」或「拼团报名」完成购课；支付成功后将自动获得评价权限。',
                )
                return
              }
              setShowReviewModal(true)
            }}
            className="shrink-0 inline-flex items-center justify-center rounded-xl bg-primary text-white text-sm font-medium px-4 py-2.5 hover:bg-primary/90 w-full sm:w-auto"
          >
            我要评价
          </button>
        </div>
        <div className="card p-4 sm:p-6 lg:p-8 rounded-2xl">
          <ul className="space-y-4 max-h-[min(480px,60vh)] overflow-y-auto pr-1">
            {visibleDetailReviews.map((r) => (
              <li key={r.id} className="flex gap-3 sm:gap-4 pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                <img
                  src={detailReviewAvatarUrl(r.avatarSeed || r.nickname)}
                  alt=""
                  width={44}
                  height={44}
                  className="w-11 h-11 rounded-full bg-slate-100 shrink-0 object-cover"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="text-sm font-semibold text-bingo-dark">{r.nickname}</span>
                    <DetailStars value={r.rating} />
                    <span className="text-xs text-slate-400 tabular-nums ml-auto">{r.at}</span>
                  </div>
                  <p className="text-sm text-slate-700 mt-2 leading-relaxed break-words">{r.content}</p>
                </div>
              </li>
            ))}
          </ul>
          {detailReviewsMoreCount > 0 && (
            <div className="mt-4 flex justify-center">
              <button
                type="button"
                onClick={() => setDetailReviewsExpanded((v) => !v)}
                className="text-sm font-medium text-primary hover:text-primary/80 px-4 py-2 rounded-xl border border-primary/30 hover:bg-primary/5"
              >
                {detailReviewsExpanded ? '收起' : `展开其余 ${detailReviewsMoreCount} 条评价`}
              </button>
            </div>
          )}
        </div>
      </section>

      {showReviewModal && hasPurchasedCurrent && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50"
          role="dialog"
          aria-modal="true"
          aria-label="发表课程评价"
          onClick={() => setShowReviewModal(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white shadow-xl border border-slate-200 p-5 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-bold text-bingo-dark text-base mb-1">发表评价</h3>
            <p className="text-xs text-slate-500 mb-4 line-clamp-2">{course.name}</p>
            <p className="text-xs font-medium text-slate-600 mb-1">星级好评</p>
            <DetailStarInput value={reviewRating} onChange={setReviewRating} className="mb-4" />
            <textarea
              id="detail-review-text"
              aria-label="评价正文"
              value={reviewDraft}
              onChange={(e) => setReviewDraft(e.target.value)}
              maxLength={200}
              rows={4}
              placeholder="学习感受、收获或建议…"
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-bingo-dark placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 resize-y min-h-[100px]"
            />
            <p className="text-xs text-slate-400 text-right tabular-nums mt-0.5">{reviewDraft.length}/200</p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowReviewModal(false)}
                className="text-sm px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100"
              >
                取消
              </button>
              <button
                type="button"
                onClick={() => {
                  const t = reviewDraft.trim()
                  if (!t) {
                    window.alert('请填写评价内容')
                    return
                  }
                  prependUserReviewForCourse(resolvedCourseId, {
                    id: `me-${Date.now()}`,
                    nickname: '我',
                    avatarSeed: 'bingo-me',
                    rating: reviewRating,
                    content: t.slice(0, 200),
                    at: new Date().toLocaleString('zh-CN', { hour12: false }),
                  })
                  setDetailReviewTick((x) => x + 1)
                  setShowReviewModal(false)
                  window.alert('感谢您的评价！')
                }}
                className="text-sm px-4 py-2 rounded-xl bg-primary text-white font-medium hover:bg-primary/90"
              >
                提交评价
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 定制学习计划 */}
      <section className="mb-6 sm:mb-8 lg:mb-10">
        <div className="card p-4 sm:p-6 lg:p-8 bg-primary/5 border-primary/20 rounded-2xl">
          <h3 className="font-semibold text-bingo-dark mb-2 text-sm sm:text-base lg:text-lg">定制学习计划</h3>
          <p className="text-xs sm:text-sm lg:text-base text-slate-600 mb-3 sm:mb-4">输入孩子年龄段、每周学习时长，自动生成周度学习计划表</p>
          <button onClick={() => setShowPlanModal(true)} className="btn-primary text-sm lg:text-base px-5 lg:px-6 py-2.5 min-h-[44px] rounded-xl">定制学习计划</button>
        </div>
      </section>

      {showPlanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setShowPlanModal(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-md w-full" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-bingo-dark mb-4">定制学习计划</h3>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">孩子年龄段</label>
                <select className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm">
                  <option>6-8岁</option>
                  <option>8-12岁</option>
                  <option>12-15岁</option>
                  <option>15-18岁</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">每周学习时长（小时）</label>
                <input type="number" defaultValue={3} className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm" />
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowPlanModal(false)} className="btn-primary flex-1 py-2.5">生成计划</button>
              <button onClick={() => setShowPlanModal(false)} className="flex-1 border border-slate-200 rounded-lg py-2.5 text-slate-600">取消</button>
            </div>
          </div>
        </div>
      )}

      {/* 在线答疑：H5 自底部弹出 / Web 居中 */}
      <button onClick={() => setShowQa(true)} className="fixed right-4 bottom-6 z-30 w-12 h-12 rounded-full bg-primary text-white shadow-lg flex items-center justify-center text-lg hover:bg-cyan-600 transition active:scale-95" aria-label="在线答疑">💬</button>
      {showQa && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-4" onClick={() => setShowQa(false)}>
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md max-h-[85vh] overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b flex justify-between items-center min-h-[56px]">
              <h3 className="font-bold text-bingo-dark text-base sm:text-lg">在线答疑</h3>
              <button onClick={() => setShowQa(false)} className="p-2 -m-2 text-slate-400 min-w-[44px] min-h-[44px] flex items-center justify-center">✕</button>
            </div>
            <div className="p-4 space-y-2 max-h-[50vh] sm:max-h-60 overflow-y-auto">
              <p className="text-sm text-slate-600">课程难度、适配性、升学对接等问题可随时咨询</p>
              <p className="text-xs text-slate-500">客服回复后推送消息提醒</p>
            </div>
            <div className="p-4 border-t pb-4">
              <input placeholder="输入您的问题..." className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm mb-2" />
              <button className="btn-primary w-full py-3 min-h-[48px] rounded-xl">发送</button>
            </div>
          </div>
        </div>
      )}

      {/* 信任背书：H5 单列 / Web 两列 */}
      <section className="mb-6 sm:mb-8 lg:mb-10">
        <h2 className="text-base sm:text-lg lg:text-xl font-bold text-bingo-dark mb-3 sm:mb-4 lg:mb-5">信任背书</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 lg:gap-5">
          <div className="card p-4 lg:p-5 rounded-2xl">
            <p className="text-xs font-semibold text-slate-500 mb-1 lg:text-sm">师资背书</p>
            <p className="text-xs sm:text-sm lg:text-base text-slate-700">{course.teacher} · AI领域教龄5年+ · 赛事指导经验丰富</p>
          </div>
          <div className="card p-4 lg:p-5 rounded-2xl">
            <p className="text-xs font-semibold text-slate-500 mb-1 lg:text-sm">成果背书</p>
            <p className="text-xs sm:text-sm lg:text-base text-slate-700">学员赛事获奖300+ · 科技特长生升学案例2000+</p>
          </div>
          <div className="card p-4 lg:p-5 rounded-2xl">
            <p className="text-xs font-semibold text-slate-500 mb-1 lg:text-sm">服务背书</p>
            <p className="text-xs sm:text-sm lg:text-base text-slate-700">7天无理由退款 · 全程答疑 · 学情报告 · 售后400-XXX-XXXX</p>
          </div>
          <div className="card p-4 lg:p-5 rounded-2xl">
            <p className="text-xs font-semibold text-slate-500 mb-1 lg:text-sm">权威背书</p>
            <p className="text-xs sm:text-sm lg:text-base text-slate-700">白名单赛事合作 · 教育部门认可 · 媒体报道</p>
          </div>
        </div>
      </section>

      {/* 限时优惠 + 分享 / 拼团：Web 端横向排布 */}
      <section className="mb-6 sm:mb-8 lg:mb-10">
        <div className="card p-4 sm:p-6 lg:p-8 bg-amber-50 border-amber-200/60 rounded-2xl">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 sm:gap-4 mb-3 sm:mb-4">
            <div>
              <p className="text-xs lg:text-sm text-amber-600 font-bold">限时优惠 · 剩余 12 名额</p>
              <p className="text-xs sm:text-sm lg:text-base text-slate-700 mt-1">7天无理由退款 · 发票保障 · 支付安全</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" data-share-popover-anchor onClick={openShareMenu} className="border border-slate-300 text-slate-600 px-4 lg:px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-50 min-h-[44px] shrink-0">分享课程</button>
              <button
                type="button"
                onClick={() => openGroupBuyModal(incomingGroupId || null)}
                className="border border-orange-500 text-orange-600 px-4 lg:px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-orange-50 min-h-[44px]"
              >
                {incomingGroupId ? '拼团参团' : '拼团报名'}
              </button>
            </div>
          </div>
          <p className="text-xs lg:text-sm text-slate-500">拼团3人6折、5人5折 · 组合购买素养课+竞赛课立减20%</p>
        </div>
      </section>

      {/* 试学结束弹窗 */}
      {showTrialEndModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setShowTrialEndModal(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center" onClick={e => e.stopPropagation()}>
            <div className="text-4xl mb-3">🎓</div>
            <h3 className="font-bold text-bingo-dark text-lg mb-2">试学结束</h3>
            <p className="text-sm text-slate-600 mb-4">解锁全部课程，获得完整学习体验</p>
            <button onClick={() => { setShowTrialEndModal(false); openNormalCheckout() }} className="btn-primary w-full py-3 font-bold mb-2">解锁全部课程</button>
            <button onClick={() => setShowTrialEndModal(false)} className="text-sm text-slate-500">稍后再说</button>
          </div>
        </div>
      )}

      <ShareActionPopover
        open={shareMenuRect != null}
        anchorRect={shareMenuRect}
        onClose={closeShareMenu}
        shareUrl={courseLink}
        shareTitle={course.name}
        shareText={`推荐课程：${course.name}`}
      />

      {showGroupBuyModal && groupSession && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/45"
          role="dialog"
          aria-modal="true"
          aria-labelledby="group-buy-title"
          onClick={() => setShowGroupBuyModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-slate-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-slate-100 flex items-start justify-between gap-3 bg-gradient-to-r from-orange-50 to-amber-50 rounded-t-2xl">
              <div className="min-w-0">
                <h3 id="group-buy-title" className="font-bold text-bingo-dark text-lg m-0">
                  {incomingGroupId && groupSession.id === incomingGroupId ? '加入好友拼团' : '发起拼团 · 邀请好友'}
                </h3>
                <p className="text-xs text-orange-800/90 mt-1 leading-relaxed">
                  {GROUP_TARGET} 人成团享 {Math.round(GROUP_DISCOUNT * 10)} 折；先支付锁定拼团价，再分享链接邀好友一起付
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowGroupBuyModal(false)}
                className="shrink-0 p-2 text-slate-400 hover:text-slate-600 rounded-lg"
                aria-label="关闭"
              >
                ✕
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3">
                <p className="text-sm font-medium text-bingo-dark line-clamp-2">{course.name}</p>
                <p className="text-xs text-slate-500 mt-1">{defaultClass.name}</p>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-slate-400 line-through text-sm">{isCourseFree ? '0元' : `¥${defaultClass.price}`}</span>
                  <span className="text-xl font-bold text-orange-600">{groupPriceLabel}</span>
                  <span className="text-xs text-orange-700">拼团价</span>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-600 mb-2">成团进度（演示）</p>
                <div className="flex gap-2">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className={`flex-1 h-2 rounded-full ${i === 0 ? 'bg-orange-500' : 'bg-slate-200'}`}
                      title={i === 0 ? '您（团长/已付）' : '待邀请'}
                    />
                  ))}
                </div>
                <p className="text-[11px] text-slate-500 mt-1.5">当前 1 / {GROUP_TARGET} 人，邀请好友打开链接即可参团</p>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-600 mb-1.5">邀请链接</p>
                <div className="flex gap-2">
                  <input
                    readOnly
                    value={groupSession.inviteLink}
                    className="flex-1 min-w-0 text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 font-mono"
                  />
                  <button
                    type="button"
                    onClick={copyGroupInviteLink}
                    className="shrink-0 px-3 py-2 rounded-xl border border-orange-200 text-orange-700 text-xs font-medium hover:bg-orange-50"
                  >
                    复制
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={inviteWeChatFriends}
                  className="flex-1 py-2.5 rounded-xl border border-[#07C160] text-[#07C160] text-sm font-medium hover:bg-green-50"
                >
                  微信邀请好友
                </button>
                <button
                  type="button"
                  onClick={payGroupOrder}
                  className="flex-1 btn-primary py-3 rounded-xl text-sm font-bold"
                >
                  {incomingGroupId && groupSession.id === incomingGroupId ? '支付参团' : '支付开团'}
                </button>
              </div>
              <p className="text-[11px] text-slate-400 text-center">演示环境：无真实支付与成团回调，成功页可复制链接继续邀请</p>
            </div>
          </div>
        </div>
      )}

      {/* 底部浮动条：课程名称 + 分享课程 + 立即购买 */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-center gap-3 px-4 py-3 bg-white/95 backdrop-blur border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] safe-area-pb"
        style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}
      >
        <div className="w-full max-w-4xl flex items-center gap-3">
          <p className="flex-1 min-w-0 truncate text-sm font-medium text-bingo-dark pr-2" title={course.name}>
            {course.name}
          </p>
          <button
            type="button"
            data-share-popover-anchor
            onClick={openShareMenu}
            className="shrink-0 py-3 px-4 rounded-xl text-sm font-medium border border-slate-300 text-slate-700 bg-white hover:bg-slate-50"
          >
            分享课程
          </button>
          <button
            type="button"
            onClick={openNormalCheckout}
            className="shrink-0 py-3 px-5 rounded-xl text-sm font-bold bg-primary text-white hover:bg-primary/90"
          >
            立即购买
          </button>
        </div>
      </div>
    </div>
  )
}

