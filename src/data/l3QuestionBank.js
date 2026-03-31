/**
 * L3 题库 + L3_单元表「评价要点」（与飞书 wiki 对齐后可替换）
 * https://my.feishu.cn/wiki/BBdUwmalwiOkjPkjlSHcBe1qnSd
 */
export const L3_EVALUATION_DIMENSIONS = [
  { key: 'feature_encoding', name: '认识特征与编码', unit: '第一单元 · AI魔法启蒙' },
  { key: 'train_eval', name: '训练模型与评估', unit: '第二单元 · 建模实训' },
  { key: 'ml_theory', name: '理解机器学习原理', unit: '第三单元 · 机器学习基础' },
  { key: 'spatial_state', name: '空间抽象与状态描述', unit: '第四单元 · 抽象与状态' },
  { key: 'search_tool', name: '搜索工具与工程实践', unit: '第五单元 · 工具与工程' },
  { key: 'search_algo', name: '搜索算法原理与应用', unit: '第六单元 · 搜索与优化' },
]

const Z = ['feature_encoding', 'train_eval', 'ml_theory', 'spatial_state', 'search_tool', 'search_algo']

/** 临时测评：6 题（选择 + 填空 + 判断），题干可与飞书 L3 文档同步替换 */
export const L3_TEST_SESSION_TEMPLATE = [
  {
    id: 'mix-1',
    type: 'choice',
    dim: Z[0],
    q: '在机器学习流程中，「特征工程」主要指什么？',
    opts: ['A. 把原始数据转成模型可用的输入表示', 'B. 编写前端页面', 'C. 压缩视频文件', 'D. 部署服务器'],
    ans: 'A',
  },
  {
    id: 'mix-2',
    type: 'choice',
    dim: Z[2],
    q: '下列哪一项最符合「监督学习」的特点？',
    opts: ['A. 只有输入没有标签', 'B. 用带标签的数据学习输入到输出的映射', 'C. 只靠试错得分学习', 'D. 不能用于分类任务'],
    ans: 'B',
  },
  {
    id: 'mix-3',
    type: 'choice',
    dim: Z[1],
    q: '「验证集」最常见的用途是？',
    opts: ['A. 最终对外报告的唯一分数', 'B. 调参与早停等模型选择', 'C. 替代测试集公布', 'D. 只用于画图'],
    ans: 'B',
  },
  {
    id: 'mix-judge-1',
    type: 'judge',
    dim: Z[3],
    q: '「过拟合」是指模型在训练集上表现很差、几乎学不到规律。',
    ans: false,
  },
  {
    id: 'mix-4',
    type: 'fill_blank',
    dim: Z[1],
    q: '请填空：将数据划分为训练集与____集，有助于估计模型在未见数据上的泛化能力。',
    blanks: ['测试', '验证'],
  },
  {
    id: 'mix-5',
    type: 'fill_blank',
    dim: Z[2],
    q: '请填空：深度学习中，____传播用于根据损失计算梯度以更新参数。',
    blanks: ['反向', '反向传播'],
  },
]

/** 当前临时测评题量（测试用，后续可改回 20） */
export const QUIZ_SESSION_COUNT = 6

export function normalizeFillAnswer(s) {
  return String(s ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '')
}

/** 填空允许较短参考答案与包含关系（如「反向」匹配「反向传播」） */
export function isFillBlankCorrectLoose(q, userAnswer) {
  if (!q.blanks?.length) return false
  const u = normalizeFillAnswer(userAnswer)
  if (!u) return false
  return q.blanks.some((b) => {
    const bn = normalizeFillAnswer(b)
    return bn === u || (bn.length >= 2 && (u.includes(bn) || bn.includes(u)))
  })
}

export function isL3AnswerCorrect(q, answer) {
  if (answer === 'skip' || answer == null) return false
  if (q.type === 'fill_blank') return isFillBlankCorrectLoose(q, answer)
  if (q.type === 'judge') return answer === q.ans
  return answer === q.ans
}

/** 洗牌后返回当次测评题目（固定 6 题结构） */
export function buildL3TestSession() {
  const list = [...L3_TEST_SESSION_TEMPLATE]
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[list[i], list[j]] = [list[j], list[i]]
  }
  return list
}

/** 普通综合测评：仅选择题 + 判断题，面向尚未明确学习方向的学生（题量可与 L3 区分） */
export const GENERAL_TEST_SESSION_TEMPLATE = [
  {
    id: 'gen-c1',
    type: 'choice',
    dim: Z[0],
    q: '下列哪项更像「无监督学习」的应用场景？',
    opts: ['A. 垃圾邮件分类', 'B. 客户分群 / 聚类', 'C. 房价预测回归', 'D. 带标签的图像分类'],
    ans: 'B',
  },
  {
    id: 'gen-j1',
    type: 'judge',
    dim: Z[1],
    q: '在严谨的开发流程中，应用「测试集」反复调参直到分数最高是可取做法。',
    ans: false,
  },
  {
    id: 'gen-c2',
    type: 'choice',
    dim: Z[2],
    q: '训练集与测试集划分的主要目的更接近下列哪一项？',
    opts: ['A. 加快训练速度', 'B. 减少参数量', 'C. 估计模型在未见数据上的泛化能力', 'D. 让损失一定为 0'],
    ans: 'C',
  },
  {
    id: 'gen-j2',
    type: 'judge',
    dim: Z[3],
    q: '「过拟合」通常指模型在训练集上表现较好，但在新数据上明显变差。',
    ans: true,
  },
  {
    id: 'gen-c3',
    type: 'choice',
    dim: Z[4],
    q: '下列哪项更属于典型的模型正则化手段？',
    opts: ['A. L2 权重惩罚或 Dropout', 'B. 盲目增大批量大小', 'C. 删除全部验证集', 'D. 把标签随机打乱'],
    ans: 'A',
  },
  {
    id: 'gen-c4',
    type: 'choice',
    dim: Z[5],
    q: '「交叉验证」更常用于什么目的？',
    opts: ['A. 更稳健地估计模型表现与方差', 'B. 减少训练样本数量', 'C. 替代数据清洗', 'D. 仅用于计算机视觉'],
    ans: 'A',
  },
]

export const GENERAL_QUIZ_COUNT = 6

export function buildGeneralTestSession() {
  const list = [...GENERAL_TEST_SESSION_TEMPLATE]
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[list[i], list[j]] = [list[j], list[i]]
  }
  return list
}

function shuffleArrayInPlace(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

/** 课程结业考评：补充填空（与 L3 同系评价要点，可随飞书 wiki 替换） */
const COURSE_FINAL_FILL_EXTRA = [
  {
    id: 'cfe-fill-1',
    type: 'fill_blank',
    dim: Z[0],
    q: '请填空：把原始数据加工成模型可用输入的过程，常被称作____。',
    blanks: ['特征工程', '特征'],
  },
  {
    id: 'cfe-fill-2',
    type: 'fill_blank',
    dim: Z[3],
    q: '请填空：____是指模型在训练数据上拟合过好，但在新数据上表现明显变差。',
    blanks: ['过拟合'],
  },
  {
    id: 'cfe-fill-3',
    type: 'fill_blank',
    dim: Z[4],
    q: '请填空：分类任务中，除准确率外，____与召回率的调和平均常记作 F1。',
    blanks: ['精确率', '精准率'],
  },
  {
    id: 'cfe-fill-4',
    type: 'fill_blank',
    dim: Z[5],
    q: '请填空：在训练过程中若监控到验证集指标持续变差，常采用____以提前结束训练防过拟合。',
    blanks: ['早停', 'earlystopping', 'early stopping'],
  },
  {
    id: 'cfe-fill-5',
    type: 'fill_blank',
    dim: Z[2],
    q: '请填空：有标签数据学习输入到输出映射的学习范式称为____学习。',
    blanks: ['监督'],
  },
]

/** 课程结业考评：补充判断题 */
const COURSE_FINAL_JUDGE_EXTRA = [
  {
    id: 'cfe-judge-1',
    type: 'judge',
    dim: Z[1],
    q: '「测试集」适合反复调参直到调到最高分再报告，这是推荐做法。',
    ans: false,
  },
  {
    id: 'cfe-judge-2',
    type: 'judge',
    dim: Z[2],
    q: '混淆矩阵可以用于同时观察真阳性、假阳性等情况。',
    ans: true,
  },
  {
    id: 'cfe-judge-3',
    type: 'judge',
    dim: Z[4],
    q: '神经网络一定只能有两层隐藏层，否则无法训练。',
    ans: false,
  },
  {
    id: 'cfe-judge-4',
    type: 'judge',
    dim: Z[0],
    q: '无监督学习典型应用之一是聚类或表示学习，不一定需要人工标签。',
    ans: true,
  },
]

/** 结业整体考评总题量（5 选择 + 3 填空 + 2 判断，再整体打乱） */
export const COURSE_FINAL_EXAM_TOTAL = 10
const CFE_N_CHOICE = 5
const CFE_N_FILL = 3
const CFE_N_JUDGE = 2

/**
 * 从 L3 选择题库 + L3/通用测评中的填空与判断扩展池随机抽题，固定 10 题且三者均有。
 * 题干可与飞书 L3 wiki 同步：https://my.feishu.cn/wiki/BBdUwmalwiOkjPkjlSHcBe1qnSd
 */
export function buildCourseFinalExamSession() {
  const choicePool = L3_QUESTION_BANK.map((q) => ({ ...q, type: 'choice' }))
  shuffleArrayInPlace(choicePool)
  const choices = choicePool.slice(0, CFE_N_CHOICE)

  const fillPool = [
    ...L3_TEST_SESSION_TEMPLATE.filter((t) => t.type === 'fill_blank'),
    ...COURSE_FINAL_FILL_EXTRA,
  ]
  shuffleArrayInPlace(fillPool)
  const fills = fillPool.slice(0, CFE_N_FILL)

  const judgePool = [
    ...L3_TEST_SESSION_TEMPLATE.filter((t) => t.type === 'judge'),
    ...GENERAL_TEST_SESSION_TEMPLATE.filter((t) => t.type === 'judge'),
    ...COURSE_FINAL_JUDGE_EXTRA,
  ]
  shuffleArrayInPlace(judgePool)
  const judges = judgePool.slice(0, CFE_N_JUDGE)

  const merged = [...choices, ...fills, ...judges]
  shuffleArrayInPlace(merged)
  return merged
}

export const L3_QUESTION_BANK = [
  { id: 'l3-1', dim: Z[0], q: '在机器学习流程中，「特征工程」主要指什么？', opts: ['A. 把原始数据转成模型可用的输入表示', 'B. 编写前端页面', 'C. 压缩视频文件', 'D. 部署服务器'], ans: 'A' },
  { id: 'l3-2', dim: Z[1], q: '下列哪一项最符合「监督学习」的特点？', opts: ['A. 只有输入没有标签', 'B. 用带标签的数据学习输入到输出的映射', 'C. 只靠试错得分学习', 'D. 不能用于分类任务'], ans: 'B' },
  { id: 'l3-3', dim: Z[2], q: '训练集与测试集划分的主要目的是？', opts: ['A. 加快训练速度', 'B. 减少参数数量', 'C. 估计模型在未见数据上的泛化能力', 'D. 让 loss 一定为 0'], ans: 'C' },
  { id: 'l3-4', dim: Z[3], q: '「过拟合」通常指模型？', opts: ['A. 在训练集上表现差', 'B. 不能收敛', 'C. 只能处理图像', 'D. 在训练集很好但泛化差'], ans: 'D' },
  { id: 'l3-5', dim: Z[4], q: '分类任务中，「准确率」可能存在的局限是？', opts: ['A. 一定高于 F1', 'B. 只能用于二分类', 'C. 与混淆矩阵无关', 'D. 样本极度不平衡时不够敏感'], ans: 'D' },
  { id: 'l3-6', dim: Z[5], q: '深度学习中的「反向传播」主要用于？', opts: ['A. 数据增强', 'B. 根据损失计算梯度以更新参数', 'C. 可视化特征', 'D. 压缩模型文件'], ans: 'B' },
  { id: 'l3-7', dim: Z[0], q: '下列哪项更像「无监督学习」应用？', opts: ['A. 垃圾邮件分类', 'B. 客户分群/聚类', 'C. 房价回归', 'D. 人脸识别门禁'], ans: 'B' },
  { id: 'l3-8', dim: Z[1], q: '「数据泄露」在建模中最危险的是？', opts: ['A. 测试信息不当进入训练导致虚假高分', 'B. 训练太慢', 'C. 显存不够', 'D. 标签编码错误'], ans: 'A' },
  { id: 'l3-9', dim: Z[2], q: '混淆矩阵能直接读出？', opts: ['A. 学习率', 'B. TP/TN/FP/FN 等情况', 'C. 神经网络层数', 'D. 数据集文件大小'], ans: 'B' },
  { id: 'l3-10', dim: Z[3], q: '学习率过大通常会导致？', opts: ['A. 一定更快收敛', 'B. 训练不稳定或难以收敛', 'C. 模型变小', 'D. 自动免调参'], ans: 'B' },
  { id: 'l3-11', dim: Z[4], q: '「验证集」最常见的用途是？', opts: ['A. 最终对外报告的唯一分数', 'B. 调参与早停等模型选择', 'C. 替代测试集公布', 'D. 只用于画图'], ans: 'B' },
  { id: 'l3-12', dim: Z[5], q: '下列哪项属于典型的正则化手段？', opts: ['A. L2 权重惩罚 / Dropout', 'B. 增大批量大小', 'C. 提高分辨率', 'D. 减少训练轮次到 1 轮'], ans: 'A' },
  { id: 'l3-13', dim: Z[0], q: '「标签噪声」对监督学习的影响主要是？', opts: ['A. 没有影响', 'B. 误导模型学习错误映射', 'C. 一定提升泛化', 'D. 只影响无监督'], ans: 'B' },
  { id: 'l3-14', dim: Z[1], q: '迁移学习适合的场景更接近？', opts: ['A. 数据极多且分布相同', 'B. 目标数据少但源域有相关知识可迁移', 'C. 不能做微调', 'D. 只能用于强化学习'], ans: 'B' },
  { id: 'l3-15', dim: Z[2], q: '数据集中「缺失值」处理不当可能？', opts: ['A. 自动消失', 'B. 只影响测试', 'C. 只影响 CNN', 'D. 引入偏差或训练异常'], ans: 'D' },
  { id: 'l3-16', dim: Z[3], q: '「批次 Batch」的主要作用之一是？', opts: ['A. 减少需要的前向计算', 'B. 估计梯度并平衡显存与时间', 'C. 去掉验证集', 'D. 替代损失函数'], ans: 'B' },
  { id: 'l3-17', dim: Z[4], q: '下列对「神经网络」描述更合适的是？', opts: ['A. 只能是两层', 'B. 由可组合的非线性变换层堆叠而成', 'C. 不能用于表格数据', 'D. 不需要激活函数'], ans: 'B' },
  { id: 'l3-18', dim: Z[5], q: '推理（Inference）阶段相对训练阶段通常？', opts: ['A. 一定更慢', 'B. 必须更新所有权重', 'C. 不能使用 GPU', 'D. 侧重在给定参数下前向预测'], ans: 'D' },
  { id: 'l3-19', dim: Z[0], q: '对类别不平衡，较合理的策略可以是？', opts: ['A. 只删除多数类全部样本', 'B. 重采样、类权重或合适的指标配合', 'C. 禁止用 F1', 'D. 把标签随机打乱'], ans: 'B' },
  { id: 'l3-20', dim: Z[1], q: '「特征缩放」对许多算法的主要意义是？', opts: ['A. 加密数据', 'B. 让不同量纲特征在优化中更均衡', 'C. 删除异常值', 'D. 把标签变成 0/1'], ans: 'B' },
  { id: 'l3-21', dim: Z[2], q: '早停（Early Stopping）主要防止？', opts: ['A. 下载超时', 'B. 在验证集变差后继续训练导致过拟合', 'C. 显存泄漏', 'D. 数据集变大'], ans: 'B' },
  { id: 'l3-22', dim: Z[3], q: '下列哪种更偏「强化学习」情境？', opts: ['A. 给定句子做翻译', 'B. 智能体在环境中根据奖励不断改进策略', 'C. 对图像分 10 类', 'D. 聚类用户'], ans: 'B' },
  { id: 'l3-23', dim: Z[4], q: '部署模型前，哪一项做法不够稳妥？', opts: ['A. 延迟与资源占用评估', 'B. 用训练集当唯一验收标准而忽略分布偏移风险', 'C. 明确输入输出契约', 'D. 关注安全与隐私合规'], ans: 'B' },
  { id: 'l3-24', dim: Z[5], q: '「交叉验证」常用于？', opts: ['A. 更稳健地估计模型表现与方差', 'B. 减少数据中样本数', 'C. 替代数据清洗', 'D. 只能用于深度学习'], ans: 'A' },
  { id: 'l3-25', dim: Z[0], q: '表格数据中「类别特征」常需要？', opts: ['A. 一定保持原始中文不编码', 'B. 编码（如 One-Hot / 目标编码等）以适配模型', 'C. 乘以学习率', 'D. 删除所有类别列'], ans: 'B' },
  { id: 'l3-26', dim: Z[1], q: '下列哪项更像伦理与合规层面的注意点？', opts: ['A. 批量大小取 32', 'B. 训练数据授权与用途透明', 'C. 选用 ReLU', 'D. 使用 SGD'], ans: 'B' },
  { id: 'l3-27', dim: Z[2], q: '「基线模型」在竞赛或项目中的价值主要是？', opts: ['A. 必须比深度学习复杂', 'B. 提供可比较的下限/参照', 'C. 不能量化', 'D. 只能线下跑'], ans: 'B' },
  { id: 'l3-28', dim: Z[3], q: '对预测结果做「不确定性」估计的意义更接近？', opts: ['A. 让准确率达 100%', 'B. 在关键场景中知道何时该拒识或请人复核', 'C. 取消验证集', 'D. 只在 NLP 需要'], ans: 'B' },
]

const QUIZ_DRAW_COUNT = 20

export function pickRandomL3Questions(n = QUIZ_DRAW_COUNT) {
  const list = [...L3_QUESTION_BANK]
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[list[i], list[j]] = [list[j], list[i]]
  }
  return list.slice(0, Math.min(n, list.length))
}

export function dimensionMeta(key) {
  return L3_EVALUATION_DIMENSIONS.find((d) => d.key === key)
}

export { QUIZ_DRAW_COUNT }
