import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import {
  Card,
  Form,
  Input,
  Select,
  Switch,
  InputNumber,
  Collapse,
  Button,
  Space,
  Tag,
  message,
  Popconfirm,
  Affix,
} from 'antd'
import { ArrowLeftOutlined, PlusOutlined, DeleteOutlined, ArrowUpOutlined, ArrowDownOutlined, HolderOutlined } from '@ant-design/icons'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type {
  CourseLessonItem,
  CourseClassTypeItem,
  LessonSegment,
  LessonSegmentType,
  LessonSegmentPayload,
  VideoSegmentPayload,
  ChoiceSegmentPayload,
  MultiChoiceSegmentPayload,
  FillBlankSegmentPayload,
  MatchSegmentPayload,
  DragDropSegmentPayload,
  GameSegmentPayload,
  AIExperimentSegmentPayload,
} from '@/api/course'

const CLASS_TYPES = [
  { type: 'standard', label: '标准班' },
  { type: 'advanced', label: '进阶班' },
  { type: 'vip', label: '1V1定制' },
]

/** 环节类型选项（一节课由这些环节任意组合） */
const SEGMENT_TYPE_OPTIONS: { value: LessonSegmentType; label: string }[] = [
  { value: 'video', label: '视频片段' },
  { value: 'choice', label: '单选题' },
  { value: 'multi_choice', label: '多选题' },
  { value: 'fill_blank', label: '填空题' },
  { value: 'match', label: '连线题' },
  { value: 'drag_drop', label: '拖拽题' },
  { value: 'game', label: '游戏环节' },
  { value: 'ai_experiment', label: 'AI实验' },
]

function getDefaultPayload(type: LessonSegmentType): LessonSegmentPayload {
  switch (type) {
    case 'video':
      return { url: '', title: '', duration: 0, posterUrl: '' }
    case 'choice':
      return { question: '', options: ['A', 'B', 'C'], correctIndex: 0, explanation: '' }
    case 'multi_choice':
      return { question: '', options: ['A', 'B', 'C', 'D'], correctIndices: [0, 2], explanation: '' }
    case 'fill_blank':
      return { question: '', blanks: [''], explanation: '' }
    case 'match':
      return { leftItems: [''], rightItems: [''], correctPairs: [], explanation: '' }
    case 'drag_drop':
      return { prompt: '', slots: [''], items: [''], correctOrder: [0], explanation: '' }
    case 'game':
      return { gameType: '', title: '', config: {} }
    case 'ai_experiment':
      return { title: '', description: '', experimentId: '', config: {} }
    default:
      return { url: '' }
  }
}

function SegmentForm({
  segment,
  lessonIdx,
  segmentIdx,
  onUpdatePayload,
}: {
  segment: LessonSegment
  lessonIdx: number
  segmentIdx: number
  onUpdatePayload: (li: number, si: number, payload: LessonSegmentPayload) => void
}) {
  const p = segment.payload
  const update = (field: string, value: unknown) => {
    const next = { ...p, [field]: value }
    onUpdatePayload(lessonIdx, segmentIdx, next)
  }
  switch (segment.type) {
    case 'video': {
        const vp = p as VideoSegmentPayload
        return (
          <Space direction="vertical" style={{ width: '100%' }}>
            <Input placeholder="视频URL" value={vp.url} onChange={(e) => update('url', e.target.value)} />
            <Input placeholder="第一帧/封面图URL（未播放时演示）" value={vp.posterUrl} onChange={(e) => update('posterUrl', e.target.value)} />
            <Input placeholder="片段标题" value={vp.title} onChange={(e) => update('title', e.target.value)} />
            <InputNumber placeholder="时长(秒)" value={vp.duration} onChange={(v) => update('duration', v)} min={0} />
          </Space>
        )
      }
    case 'choice': {
      const cp = p as ChoiceSegmentPayload
      return (
        <Space direction="vertical" style={{ width: '100%' }}>
          <Input placeholder="题目" value={cp.question} onChange={(e) => update('question', e.target.value)} />
          {cp.options.map((opt, i) => (
            <Input key={i} placeholder={`选项${i + 1}`} value={opt} onChange={(e) => {
              const arr = [...cp.options]
              arr[i] = e.target.value
              update('options', arr)
            }} addonBefore={String.fromCharCode(65 + i)} />
          ))}
          <Space>
            <span>正确答案索引(0起)：</span>
            <InputNumber value={cp.correctIndex} onChange={(v) => update('correctIndex', v)} min={0} max={cp.options.length - 1} />
          </Space>
          <Input placeholder="解析(可选)" value={cp.explanation} onChange={(e) => update('explanation', e.target.value)} />
        </Space>
      )
    }
    case 'multi_choice': {
      const mp = p as MultiChoiceSegmentPayload
      const indices = mp.correctIndices || []
      return (
        <Space direction="vertical" style={{ width: '100%' }}>
          <Input placeholder="题目" value={mp.question} onChange={(e) => update('question', e.target.value)} />
          {mp.options.map((opt, i) => (
            <Input key={i} placeholder={`选项${i + 1}`} value={opt} onChange={(e) => {
              const arr = [...mp.options]
              arr[i] = e.target.value
              update('options', arr)
            }} addonBefore={String.fromCharCode(65 + i)} />
          ))}
          <Input
            placeholder="正确答案索引，逗号分隔（从 0 开始），如 0,2,3"
            value={indices.join(', ')}
            onChange={(e) => {
              const parsed = e.target.value
                .split(/[,，\s]+/)
                .map((s) => parseInt(s.trim(), 10))
                .filter((n) => !Number.isNaN(n) && n >= 0 && n < mp.options.length)
              update('correctIndices', [...new Set(parsed)].sort((a, b) => a - b))
            }}
          />
          <div style={{ color: '#888', fontSize: 12 }}>至少填一个正确选项索引；学员需勾选全部正确项后提交。</div>
          <Input placeholder="解析(可选)" value={mp.explanation} onChange={(e) => update('explanation', e.target.value)} />
        </Space>
      )
    }
    case 'fill_blank': {
      const fp = p as FillBlankSegmentPayload
      return (
        <Space direction="vertical" style={{ width: '100%' }}>
          <Input.TextArea placeholder="题目（用 ___ 表示空）" value={fp.question} onChange={(e) => update('question', e.target.value)} rows={2} />
          {fp.blanks.map((b, i) => (
            <Input key={i} placeholder={`第${i + 1}空答案`} value={b} onChange={(e) => {
              const arr = [...fp.blanks]
              arr[i] = e.target.value
              update('blanks', arr)
            }} />
          ))}
          <Input placeholder="解析(可选)" value={fp.explanation} onChange={(e) => update('explanation', e.target.value)} />
        </Space>
      )
    }
    case 'match': {
      const mp = p as MatchSegmentPayload
      return (
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>左侧项（每行一个）：</div>
          <Input.TextArea value={mp.leftItems.join('\n')} onChange={(e) => update('leftItems', e.target.value.split('\n').filter(Boolean))} rows={3} />
          <div>右侧项（每行一个）：</div>
          <Input.TextArea value={mp.rightItems.join('\n')} onChange={(e) => update('rightItems', e.target.value.split('\n').filter(Boolean))} rows={3} />
          <Input placeholder="解析(可选)" value={mp.explanation} onChange={(e) => update('explanation', e.target.value)} />
        </Space>
      )
    }
    case 'drag_drop': {
      const dp = p as DragDropSegmentPayload
      return (
        <Space direction="vertical" style={{ width: '100%' }}>
          <Input placeholder="题目说明" value={dp.prompt} onChange={(e) => update('prompt', e.target.value)} />
          <div>槽位文案（每行一个）：</div>
          <Input.TextArea value={dp.slots.join('\n')} onChange={(e) => update('slots', e.target.value.split('\n').filter(Boolean))} rows={2} />
          <div>可拖拽项（每行一个）：</div>
          <Input.TextArea value={dp.items.join('\n')} onChange={(e) => update('items', e.target.value.split('\n').filter(Boolean))} rows={2} />
          <Input placeholder="正确顺序(逗号分隔索引，如 0,1,2)" value={dp.correctOrder.join(',')} onChange={(e) => update('correctOrder', e.target.value.split(',').map(Number).filter((n) => !Number.isNaN(n)))} />
          <Input placeholder="解析(可选)" value={dp.explanation} onChange={(e) => update('explanation', e.target.value)} />
        </Space>
      )
    }
    case 'game': {
      const gp = p as GameSegmentPayload
      return (
        <Space direction="vertical" style={{ width: '100%' }}>
          <Input placeholder="环节标题" value={gp.title} onChange={(e) => update('title', e.target.value)} />
          <Input placeholder="游戏类型标识（可选，客户端演示仅显示占位）" value={gp.gameType} onChange={(e) => update('gameType', e.target.value)} />
        </Space>
      )
    }
    case 'ai_experiment': {
      const ap = p as AIExperimentSegmentPayload
      return (
        <Space direction="vertical" style={{ width: '100%' }}>
          <Input placeholder="AI实验标题" value={ap.title} onChange={(e) => update('title', e.target.value)} />
          <Input.TextArea placeholder="描述" value={ap.description} onChange={(e) => update('description', e.target.value)} rows={2} />
          <Input placeholder="实验ID(可选)" value={ap.experimentId} onChange={(e) => update('experimentId', e.target.value)} />
        </Space>
      )
    }
    default:
      return null
  }
}

function SortableLesson({
  lesson,
  index,
  total,
  onUpdate,
  onRemove,
  onMoveUp,
  onMoveDown,
  onAddSegment,
  onUpdateSegment,
  onRemoveSegment,
  onMoveSegment,
}: {
  lesson: CourseLessonItem
  index: number
  total: number
  onUpdate: (idx: number, field: keyof CourseLessonItem, value: unknown) => void
  onRemove: (idx: number) => void
  onMoveUp: (idx: number) => void
  onMoveDown: (idx: number) => void
  onAddSegment: (lessonIdx: number, type: LessonSegmentType) => void
  onUpdateSegment: (lessonIdx: number, segmentIdx: number, updates: Partial<LessonSegment>) => void
  onRemoveSegment: (lessonIdx: number, segmentIdx: number) => void
  onMoveSegment: (lessonIdx: number, segmentIdx: number, dir: 'up' | 'down') => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: lesson.id })
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }
  const segments = lesson.segments || []
  const segmentTypeLabel = (t: LessonSegmentType) => SEGMENT_TYPE_OPTIONS.find((o) => o.value === t)?.label ?? t
  return (
    <div ref={setNodeRef} style={style} {...attributes} className="sortable-lesson-item">
      <Collapse size="small" style={{ marginBottom: 8 }}>
        <Collapse.Panel
          key="1"
          header={
            <Space>
              <span {...listeners} style={{ cursor: 'grab', color: '#999' }}><HolderOutlined /></span>
              {lesson.title || `课时 ${index + 1}`}
              {segments.length > 0 && <Tag color="blue">{segments.length} 个环节</Tag>}
            </Space>
          }
        >
          <Space direction="vertical" style={{ width: '100%' }}>
            <Input placeholder="课时标题" value={lesson.title} onChange={(e) => onUpdate(index, 'title', e.target.value)} />
            <Input.TextArea placeholder="课时介绍" value={lesson.intro} onChange={(e) => onUpdate(index, 'intro', e.target.value)} rows={2} />
            <Space>
              <span>时长(分钟)：</span>
              <InputNumber value={lesson.duration} onChange={(v) => onUpdate(index, 'duration', v)} min={0} />
              <Switch checked={lesson.freeTrial} onChange={(v) => onUpdate(index, 'freeTrial', v)} checkedChildren="免费试学" unCheckedChildren="否" />
            </Space>
            {lesson.freeTrial && <Input placeholder="试学视频URL" value={lesson.trialVideoUrl} onChange={(e) => onUpdate(index, 'trialVideoUrl', e.target.value)} />}

            <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid #f0f0f0' }}>
              <div style={{ marginBottom: 8, fontWeight: 500 }}>本课环节（视频+互动+游戏+AI实验 任意组合）</div>
              <Space wrap style={{ marginBottom: 8 }}>
                <Select
                  key={`add-seg-${segments.length}`}
                  placeholder="选择环节类型并添加（视频/选择题/填空题/连线题/拖拽题/游戏/AI实验）"
                  style={{ width: 320 }}
                  options={SEGMENT_TYPE_OPTIONS}
                  onSelect={(type: LessonSegmentType) => onAddSegment(index, type)}
                  allowClear={false}
                />
              </Space>
              {segments.map((seg, segIdx) => (
                <Collapse size="small" key={seg.id} style={{ marginBottom: 8 }}>
                  <Collapse.Panel
                    header={
                      <Space>
                        <Tag>{segmentTypeLabel(seg.type)}</Tag>
                        <span>环节 {segIdx + 1}</span>
                        <Button type="text" size="small" icon={<ArrowUpOutlined />} onClick={(e) => { e.stopPropagation(); onMoveSegment(index, segIdx, 'up') }} disabled={segIdx === 0} />
                        <Button type="text" size="small" icon={<ArrowDownOutlined />} onClick={(e) => { e.stopPropagation(); onMoveSegment(index, segIdx, 'down') }} disabled={segIdx === segments.length - 1} />
                        <Popconfirm title="删除该环节？" onConfirm={(e) => { e?.stopPropagation(); onRemoveSegment(index, segIdx) }}>
                          <Button type="text" size="small" danger icon={<DeleteOutlined />} onClick={(e) => e.stopPropagation()}>删除</Button>
                        </Popconfirm>
                      </Space>
                    }
                    key={seg.id}
                  >
                    <SegmentForm
                      segment={seg}
                      lessonIdx={index}
                      segmentIdx={segIdx}
                      onUpdatePayload={(li, si, payload) => onUpdateSegment(li, si, { payload })}
                    />
                  </Collapse.Panel>
                </Collapse>
              ))}
            </div>

            <Space>
              <Button size="small" icon={<ArrowUpOutlined />} onClick={() => onMoveUp(index)} disabled={index === 0} />
              <Button size="small" icon={<ArrowDownOutlined />} onClick={() => onMoveDown(index)} disabled={index === total - 1} />
              <Popconfirm title="确定删除该课时？" onConfirm={() => onRemove(index)}>
                <Button size="small" danger icon={<DeleteOutlined />}>删除</Button>
              </Popconfirm>
            </Space>
          </Space>
        </Collapse.Panel>
      </Collapse>
    </div>
  )
}

export default function CourseEdit() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const id = searchParams.get('id')
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [classTypes, setClassTypes] = useState<CourseClassTypeItem[]>(
    CLASS_TYPES.map((t) => ({
      type: t.type,
      currentPrice: 0,
      originalPrice: 0,
      lessonCount: 0,
      targetDesc: '',
      visible: true,
    }))
  )
  const [lessons, setLessons] = useState<CourseLessonItem[]>([])
  const [systems] = useState([{ id: 1, name: 'AI素养体系' }])
  const [levels] = useState([{ id: 1, name: 'L1', title: '入门' }])

  useEffect(() => {
    if (!id) {
      form.resetFields()
      return
    }
    setLoading(true)
    setTimeout(() => {
      form.setFieldsValue({
        title: 'AI精英启蒙课',
        subtitle: '零基础入门',
        teacherName: '张老师',
        targetAudience: '小学3-6年级',
        systemId: 1,
        levelId: 1,
        classTypeIds: [1, 2, 3],
        isRecommend: true,
        learningObjectives: '掌握AI基础概念',
        courseFeatures: '项目驱动、动手实践',
      })
      setTags(['入门', 'AI', '素养'])
      setClassTypes([
        { type: 'standard', currentPrice: 299, originalPrice: 399, lessonCount: 12, targetDesc: '零基础学员', visible: true },
        { type: 'advanced', currentPrice: 599, originalPrice: 799, lessonCount: 24, targetDesc: '有基础学员', visible: true },
        { type: 'vip', currentPrice: 1999, originalPrice: 2499, lessonCount: 48, targetDesc: '定制需求', visible: true },
      ])
      setLessons([
        {
          id: '1',
          title: '第1课 初识AI',
          intro: '了解AI基础',
          duration: 45,
          freeTrial: true,
          trialVideoUrl: '',
          sort: 1,
          segments: [
            { id: 'seg-1-v', type: 'video', sort: 0, payload: { url: 'https://example.com/v1.mp4', title: '什么是AI', duration: 300 } },
            { id: 'seg-1-c', type: 'choice', sort: 1, payload: { question: 'AI的全称是？', options: ['人工智慧', '人工智能', '自动推理'], correctIndex: 1, explanation: 'Artificial Intelligence' } },
            { id: 'seg-1-ai', type: 'ai_experiment', sort: 2, payload: { title: '人脸识别小实验', description: '体验图像识别', experimentId: 'face-demo' } },
          ],
        },
        { id: '2', title: '第2课 实践入门', intro: '动手操作', duration: 60, freeTrial: false, sort: 2, segments: [] },
      ])
      setLoading(false)
    }, 300)
  }, [id, form])

  const addTag = () => {
    const v = tagInput.trim()
    if (!v) return
    if (tags.includes(v)) {
      message.warning('标签已存在')
      return
    }
    setTags([...tags, v])
    setTagInput('')
  }

  const removeTag = (t: string) => setTags(tags.filter((x) => x !== t))

  const addLesson = () => {
    setLessons([
      ...lessons,
      { id: String(Date.now()), title: '', intro: '', duration: 0, freeTrial: false, sort: lessons.length + 1, segments: [] },
    ])
  }

  const addSegment = (lessonIdx: number, type: LessonSegmentType) => {
    const arr = [...lessons]
    const segs = arr[lessonIdx].segments || []
    const newSeg: LessonSegment = {
      id: `seg-${Date.now()}-${lessonIdx}`,
      type,
      sort: segs.length,
      payload: getDefaultPayload(type),
    }
    arr[lessonIdx] = { ...arr[lessonIdx], segments: [...segs, newSeg] }
    setLessons(arr)
  }

  const updateSegment = (lessonIdx: number, segmentIdx: number, updates: Partial<LessonSegment>) => {
    const arr = [...lessons]
    const segs = [...(arr[lessonIdx].segments || [])]
    segs[segmentIdx] = { ...segs[segmentIdx], ...updates }
    arr[lessonIdx] = { ...arr[lessonIdx], segments: segs }
    setLessons(arr)
  }

  const removeSegment = (lessonIdx: number, segmentIdx: number) => {
    const arr = [...lessons]
    const segs = (arr[lessonIdx].segments || []).filter((_, i) => i !== segmentIdx)
    arr[lessonIdx] = { ...arr[lessonIdx], segments: segs.map((s, i) => ({ ...s, sort: i })) }
    setLessons(arr)
  }

  const moveSegment = (lessonIdx: number, segmentIdx: number, dir: 'up' | 'down') => {
    const arr = [...lessons]
    const segs = [...(arr[lessonIdx].segments || [])]
    const j = dir === 'up' ? segmentIdx - 1 : segmentIdx + 1
    if (j < 0 || j >= segs.length) return
    const reordered = arrayMove(segs, segmentIdx, j).map((s, i) => ({ ...s, sort: i }))
    arr[lessonIdx] = { ...arr[lessonIdx], segments: reordered }
    setLessons(arr)
  }

  const removeLesson = (idx: number) => {
    setLessons(lessons.filter((_, i) => i !== idx))
  }

  const moveLesson = (idx: number, dir: 'up' | 'down') => {
    const arr = [...lessons]
    const j = dir === 'up' ? idx - 1 : idx + 1
    if (j < 0 || j >= arr.length) return
    setLessons(arrayMove(arr, idx, j).map((r, i) => ({ ...r, sort: i + 1 })))
  }

  const handleLessonDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIdx = lessons.findIndex((l) => l.id === active.id)
    const newIdx = lessons.findIndex((l) => l.id === over.id)
    if (oldIdx === -1 || newIdx === -1) return
    setLessons(arrayMove(lessons, oldIdx, newIdx).map((r, i) => ({ ...r, sort: i + 1 })))
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const updateLesson = (idx: number, field: keyof CourseLessonItem, value: unknown) => {
    const arr = [...lessons]
    arr[idx] = { ...arr[idx], [field]: value }
    setLessons(arr)
  }

  const updateClassType = (idx: number, field: keyof CourseClassTypeItem, value: unknown) => {
    const arr = [...classTypes]
    arr[idx] = { ...arr[idx], [field]: value }
    setClassTypes(arr)
  }

  const handleSaveDraft = async () => {
    try {
      await form.validateFields(['title'])
      setLoading(true)
      await new Promise((r) => setTimeout(r, 500))
      message.success('草稿已保存')
    } catch { /* validation */ } finally { setLoading(false) }
  }

  const handlePreview = () => {
    message.info('预览功能：新窗口打开课程详情页')
    // window.open(`/course/${id}`, '_blank')
  }

  const handlePublish = async () => {
    try {
      await form.validateFields()
      setLoading(true)
      await new Promise((r) => setTimeout(r, 500))
      message.success('课程已发布')
    } catch { /* validation */ } finally { setLoading(false) }
  }

  return (
    <div style={{ padding: 24, paddingBottom: 100 }}>
      <div style={{ marginBottom: 16 }}>
        <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate('/course/list')}>返回课程列表</Button>
      </div>
      <h2 style={{ marginBottom: 24 }}>{id ? '编辑课程' : '新增课程'}</h2>

      <Form form={form} layout="vertical" initialValues={{ isRecommend: false }}>
        <Collapse
          defaultActiveKey={['basic', 'tags', 'class', 'content', 'lessons']}
          items={[
            {
              key: 'basic',
              label: '基础信息',
              children: (
                <>
                  <Form.Item name="title" label="课程标题" rules={[{ required: true }]}>
                    <Input placeholder="请输入课程标题" />
                  </Form.Item>
                  <Form.Item name="subtitle" label="课程副标题">
                    <Input placeholder="如：零基础入门" />
                  </Form.Item>
                  <Form.Item name="coverUrl" label="封面图URL">
                    <Input placeholder="上传后填写图片地址" />
                  </Form.Item>
                  <Form.Item name="teacherName" label="讲师名称">
                    <Input placeholder="如：张老师" />
                  </Form.Item>
                  <Form.Item name="targetAudience" label="面向人群">
                    <Input placeholder="如：小学3-6年级" />
                  </Form.Item>
                  <Form.Item name="systemId" label="所属课程体系">
                    <Select placeholder="请选择" options={systems.map((s) => ({ label: s.name, value: s.id }))} allowClear />
                  </Form.Item>
                  <Form.Item name="levelId" label="所属层级">
                    <Select placeholder="请选择" options={levels.map((l) => ({ label: `${l.name} ${l.title}`, value: l.id }))} allowClear />
                  </Form.Item>
                  <Form.Item name="classTypeIds" label="班型选择（多选）">
                    <Select mode="multiple" placeholder="请选择班型" options={[{ label: '标准班', value: 1 }, { label: '进阶班', value: 2 }, { label: '1V1定制', value: 3 }]} />
                  </Form.Item>
                </>
              ),
            },
            {
              key: 'tags',
              label: '标签配置',
              children: (
                <>
                  <Space wrap style={{ marginBottom: 12 }}>
                    {tags.map((t) => (
                      <Tag key={t} closable onClose={() => removeTag(t)}>{t}</Tag>
                    ))}
                    <Input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onPressEnter={addTag}
                      placeholder="输入后回车添加"
                      style={{ width: 120 }}
                    />
                    <Button size="small" icon={<PlusOutlined />} onClick={addTag}>添加</Button>
                  </Space>
                </>
              ),
            },
            {
              key: 'recommend',
              label: '是否推荐',
              children: (
                <Form.Item name="isRecommend" label="推荐开关" valuePropName="checked">
                  <Switch checkedChildren="是" unCheckedChildren="否" />
                </Form.Item>
              ),
            },
            {
              key: 'class',
              label: '班型自定义配置',
              children: (
                <div>
                  {classTypes.map((ct, i) => (
                    <Card key={ct.type} size="small" title={CLASS_TYPES[i]?.label} style={{ marginBottom: 12 }}>
                      <Space wrap>
                        <span>现价：</span><InputNumber value={ct.currentPrice} onChange={(v) => updateClassType(i, 'currentPrice', v)} min={0} />
                        <span>原价：</span><InputNumber value={ct.originalPrice} onChange={(v) => updateClassType(i, 'originalPrice', v)} min={0} />
                        <span>课时：</span><InputNumber value={ct.lessonCount} onChange={(v) => updateClassType(i, 'lessonCount', v)} min={0} />
                        <span>人群说明：</span><Input value={ct.targetDesc} onChange={(e) => updateClassType(i, 'targetDesc', e.target.value)} placeholder="适配人群" style={{ width: 160 }} />
                        <Switch checked={ct.visible} onChange={(v) => updateClassType(i, 'visible', v)} checkedChildren="展示" unCheckedChildren="隐藏" />
                      </Space>
                    </Card>
                  ))}
                </div>
              ),
            },
            {
              key: 'content',
              label: '课程内容模块',
              children: (
                <>
                  <Form.Item name="learningObjectives" label="学习目标">
                    <Input.TextArea rows={4} placeholder="多行文本" />
                  </Form.Item>
                  <Form.Item name="courseFeatures" label="课程特色">
                    <Input.TextArea rows={4} placeholder="多行文本" />
                  </Form.Item>
                </>
              ),
            },
            {
              key: 'lessons',
              label: '课程详情（课时结构）',
              children: (
                <div>
                  <Button type="primary" icon={<PlusOutlined />} onClick={addLesson} style={{ marginBottom: 12 }}>新增课时</Button>
                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleLessonDragEnd}>
                    <SortableContext items={lessons.map((l) => l.id)} strategy={verticalListSortingStrategy}>
                      {lessons.map((l, i) => (
                        <SortableLesson
                          key={l.id}
                          lesson={l}
                          index={i}
                          total={lessons.length}
                          onUpdate={updateLesson}
                          onRemove={removeLesson}
                          onMoveUp={(idx) => moveLesson(idx, 'up')}
                          onMoveDown={(idx) => moveLesson(idx, 'down')}
                          onAddSegment={addSegment}
                          onUpdateSegment={updateSegment}
                          onRemoveSegment={removeSegment}
                          onMoveSegment={moveSegment}
                        />
                      ))}
                    </SortableContext>
                  </DndContext>
                </div>
              ),
            },
          ]}
        />
      </Form>

      <Affix offsetBottom={0}>
        <div style={{ background: '#fff', padding: '16px 24px', borderTop: '1px solid #f0f0f0', display: 'flex', gap: 12 }}>
          <Button type="primary" onClick={handleSaveDraft} loading={loading}>保存草稿</Button>
          <Button onClick={handlePreview}>预览</Button>
          <Button type="primary" onClick={handlePublish} loading={loading}>发布</Button>
        </div>
      </Affix>
    </div>
  )
}
