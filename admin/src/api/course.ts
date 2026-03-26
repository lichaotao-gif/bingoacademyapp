import { http } from '@/utils/request'

/** 课程状态：1=已上架 0=未上架 */
export interface Course {
  course_id: number
  course_name: string
  category_id: number
  category_name?: string
  cover_url?: string
  sale_price?: number
  status: number
  is_hot?: number
  is_recommend?: number
  create_time: string
}

export function getCourseList(params: {
  page?: number
  size?: number
  keyword?: string
  category_id?: number
  status?: number
}) {
  return http.get<Course[]>('/course/list', params as Record<string, string | number>)
}

export function batchDeleteCourse(ids: number[]) {
  return http.post<{ successCount: number; failCount: number }>('/course/batchDelete', { ids })
}

export interface CourseCategory {
  category_id: number
  category_name: string
  parent_id?: number
  sort?: number
  create_time?: string
}

export function getCourseCategoryList(params?: { page?: number; size?: number }) {
  return http.get<CourseCategory[]>('/course/category', (params || {}) as Record<string, string | number>)
}

// ========== AI能力课程 - 全局配置 ==========

/** 班型配置 */
export interface ClassTypeConfig {
  id: number
  name: string
  enabled: boolean
  sort: number
}

/** 价格区间配置 */
export interface PriceRangeConfig {
  id: number
  name: string
  startPrice: number
  endPrice: number
  sort: number
}

/** 课程体系 */
export interface CourseSystemConfig {
  id: number
  name: string
  desc?: string
  sort: number
  enabled: boolean
}

/** 层级配置 */
export interface LevelConfig {
  id: number
  name: string
  title: string
  iconUrl?: string
  desc?: string
  sort: number
  enabled: boolean
}

export function getClassTypeList() {
  return http.get<ClassTypeConfig[]>('/course/config/class-type')
}

export function saveClassType(data: Partial<ClassTypeConfig>) {
  return data.id ? http.put(`/course/config/class-type/${data.id}`, data) : http.post('/course/config/class-type', data)
}

export function getPriceRangeList() {
  return http.get<PriceRangeConfig[]>('/course/config/price-range')
}

export function savePriceRange(data: Partial<PriceRangeConfig>) {
  return data.id ? http.put(`/course/config/price-range/${data.id}`, data) : http.post('/course/config/price-range', data)
}

export function getCourseSystemList() {
  return http.get<CourseSystemConfig[]>('/course/config/system')
}

export function saveCourseSystem(data: Partial<CourseSystemConfig>) {
  return data.id ? http.put(`/course/config/system/${data.id}`, data) : http.post('/course/config/system', data)
}

export function getLevelList() {
  return http.get<LevelConfig[]>('/course/config/level')
}

export function saveLevel(data: Partial<LevelConfig>) {
  return data.id ? http.put(`/course/config/level/${data.id}`, data) : http.post('/course/config/level', data)
}

// ========== 课程详情（AI能力课程） ==========

/** 班型项（每门课程内：标准班/进阶班/1V1定制） */
export interface CourseClassTypeItem {
  type: string
  currentPrice: number
  originalPrice: number
  lessonCount: number
  targetDesc: string
  visible: boolean
}

// ========== 一节课内环节（视频片段 + 互动/游戏/AI实验 任意组合） ==========

/** 课时内环节类型 */
export type LessonSegmentType =
  | 'video'       // 视频片段
  | 'choice'      // 单选题
  | 'judge'       // 判断题（正确 / 错误）
  | 'multi_choice' // 多选题
  | 'fill_blank'  // 填空题
  | 'match'       // 连线题
  | 'drag_drop'   // 拖拽题
  | 'game'        // 游戏环节
  | 'ai_experiment' // AI实验

/** 视频片段 */
export interface VideoSegmentPayload {
  url: string
  title?: string
  duration?: number // 秒
  /** 第一帧/封面图 URL，用于未播放时演示效果 */
  posterUrl?: string
}

/** 单选题 */
export interface ChoiceSegmentPayload {
  question: string
  options: string[]
  correctIndex: number
  explanation?: string
}

/** 判断题：学员选择「正确」或「错误」 */
export interface JudgeSegmentPayload {
  question: string
  /** 陈述为真时选「正确」得分；为假时选「错误」得分 */
  correctIsTrue: boolean
  explanation?: string
}

/** 多选题（correctIndices 为正确选项下标，从 0 开始） */
export interface MultiChoiceSegmentPayload {
  question: string
  options: string[]
  correctIndices: number[]
  explanation?: string
}

/** 填空题 */
export interface FillBlankSegmentPayload {
  question: string
  blanks: string[]  // 正确答案列表，与空位一一对应
  explanation?: string
}

/** 连线题 */
export interface MatchSegmentPayload {
  leftItems: string[]
  rightItems: string[]
  correctPairs: Array<[number, number]>  // [leftIndex, rightIndex]
  explanation?: string
}

/** 拖拽题 */
export interface DragDropSegmentPayload {
  prompt: string
  slots: string[]   // 槽位显示文案
  items: string[]   // 可拖拽项
  correctOrder: number[]  // items 中索引的正确顺序对应 slots
  explanation?: string
}

/** 找茬游戏配置（gameType === spot_difference） */
export interface SpotDifferenceGameConfig {
  /** 左侧图 URL */
  leftImage: string
  /** 右侧图 URL */
  rightImage: string
  /**
   * 需在左侧图上点中的区域：x/y 为相对图片宽高的百分比 0–100，r 为允许误差（百分比距离，默认约 10）
   */
  spots: Array<{ x: number; y: number; r?: number }>
  /** 操作提示文案 */
  hint?: string
  explanation?: string
}

/** 游戏环节 */
export interface GameSegmentPayload {
  gameType: string
  title?: string
  /** spot_difference 等参见 SpotDifferenceGameConfig */
  config?: Record<string, unknown>
}

/** AI实验 */
export interface AIExperimentSegmentPayload {
  title: string
  description?: string
  experimentId?: string
  config?: Record<string, unknown>
}

export type LessonSegmentPayload =
  | VideoSegmentPayload
  | ChoiceSegmentPayload
  | JudgeSegmentPayload
  | MultiChoiceSegmentPayload
  | FillBlankSegmentPayload
  | MatchSegmentPayload
  | DragDropSegmentPayload
  | GameSegmentPayload
  | AIExperimentSegmentPayload

/** 课时内单个环节 */
export interface LessonSegment {
  id: string
  type: LessonSegmentType
  sort: number
  payload: LessonSegmentPayload
}

/** 课时项（一节课由上述环节任意组合组成） */
export interface CourseLessonItem {
  id: string
  title: string
  intro: string
  duration: number
  freeTrial: boolean
  trialVideoUrl?: string
  sort: number
  /** 可选：有则一节课由 视频片段+互动(选择/填空/连线/拖拽)+游戏+AI实验 任意组合 */
  segments?: LessonSegment[]
}

export interface CourseDetail {
  course_id?: number
  title: string
  subtitle?: string
  coverUrl?: string
  teacherName?: string
  targetAudience?: string
  systemId?: number
  levelId?: number
  classTypeIds: number[]
  tags: string[]
  isRecommend: boolean
  classTypes: CourseClassTypeItem[]
  learningObjectives?: string
  courseFeatures?: string
  lessons: CourseLessonItem[]
  status?: 'draft' | 'published'
  updateTime?: string
}

export function getCourseDetail(id: number) {
  return http.get<CourseDetail>(`/course/${id}`)
}

export function saveCourseDraft(data: Partial<CourseDetail>) {
  return http.post('/course/draft', data)
}

export function publishCourse(id: number) {
  return http.post(`/course/publish/${id}`)
}
