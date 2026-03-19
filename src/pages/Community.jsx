import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'

// ─── 论坛 BBS 存储 ─────────────────────────────────────────
const FORUM_STORAGE_KEY = 'bingo_forum'
function loadForum() {
  try {
    const raw = localStorage.getItem(FORUM_STORAGE_KEY)
    if (raw) {
      const d = JSON.parse(raw)
      return { posts: d.posts || [], comments: d.comments || [] }
    }
  } catch (_) {}
  const seedPosts = [
    { id: 'p1', title: '欢迎来到AI发展论坛', content: '这里是缤果AI发展论坛，欢迎分享你的AI学习心得、竞赛经验、升学体会，与大家一起交流成长。', author: '缤果小助手', createdAt: Date.now() - 86400000 * 3, topic: '公告' },
    { id: 'p2', title: '孩子学AI从哪开始？求经验分享', content: '我家孩子10岁，对AI很感兴趣，但不知道从哪开始学。有经验的家长或老师能分享下吗？', author: '家长小王', createdAt: Date.now() - 86400000 * 2, topic: '家长交流' },
    { id: 'p3', title: 'Python入门后如何过渡到AI？', content: '已经学完Python基础，想往AI方向走，请问接下来的学习路径是怎样的？', author: '科创学员小李', createdAt: Date.now() - 86400000, topic: '学习交流' },
  ]
  const seedComments = [
    { id: 'c1', postId: 'p1', parentId: null, content: '论坛氛围很好，期待更多干货！', author: '热心用户', createdAt: Date.now() - 86400000 * 2 },
    { id: 'c2', postId: 'p2', parentId: null, content: '建议先从图形化编程或Python启蒙开始，循序渐进。', author: '张老师', createdAt: Date.now() - 86400000 * 1.5 },
    { id: 'c3', postId: 'p2', parentId: 'c2', content: '谢谢张老师！请问有推荐的课程或教材吗？', author: '家长小王', createdAt: Date.now() - 86400000 },
  ]
  return { posts: seedPosts, comments: seedComments }
}
function saveForum(posts, comments) {
  try { localStorage.setItem(FORUM_STORAGE_KEY, JSON.stringify({ posts, comments })) } catch (_) {}
}

// ─── 数据 ─────────────────────────────────────────────────
const certifiedMentors = [
  { name: '陈建文教授/博士', photo: '/images/team/chenjianwen.jpg', fallback: 'https://ui-avatars.com/api/?name=陈建文&background=0891b2&color=fff&size=120', type: '竞赛牛人', intro: '超过20年视频处理、人工智能算法研究；多模态特征融合情感计算研究；深度内容合成和驱动算法的研究。电子科技大学教授、博士生导师，电子科技大学视觉智能研究中心主任。' },
  { name: '王文一博士', photo: '/images/team/wangwenyi.jpg', fallback: 'https://ui-avatars.com/api/?name=王文一&background=0891b2&color=fff&size=120', type: '升学牛人', intro: 'AI专家，电子科技大学副教授。研究涉及数据挖掘、人工智能及算法优化等方面。加拿大渥太华大学电子工程与计算机科学硕士、博士。' },
  { name: '徐枫博士', photo: '/images/team/xufeng.jpg', fallback: 'https://ui-avatars.com/api/?name=徐枫&background=0891b2&color=fff&size=120', type: '课题牛人', intro: '人工智能科学家，北京人工智能研究院研究员，北京市海外高层次人才。曾任三星(美国)研发中心研究员、Thomson汤姆逊公司研究员。美国宾夕法尼亚大学博士后，清华大学电子工程系博士。' },
  { name: '王爽博士', photo: '/images/team/wangshuang.jpg', fallback: 'https://ui-avatars.com/api/?name=王爽&background=0891b2&color=fff&size=120', type: '学霸牛人', intro: '人工智能科学家，美国 Lava Education 与 ScholarOne LLC 联合创始人。主导教育、医疗与AI项目落地，拥有美国人工智能传感网络专利（授权并产生版税）。专注大语言模型、多模态智能与深度学习系统研发，指导学生参与国际竞赛与科研。密苏里大学电子工程与计算机科学博士。' },
]

const partnerInstitutions = [
  { name: 'XX市青少年科技教育中心', region: '江苏·南京', type: '高校/实验室' },
  { name: 'XX区人工智能教育实践基地', region: '广东·深圳', type: '科创竞赛机构' },
  { name: 'XX教育集团科创学院', region: '北京', type: '行业认证机构' },
  { name: 'XX外国语学校AI实验室', region: '上海', type: '高校/实验室' },
  { name: 'XX培训学校', region: '浙江·杭州', type: '校企合作单位' },
  { name: 'XX创客教育', region: '四川·成都', type: '科创竞赛机构' },
]

const certifiedCourses = [
  { name: '错题帮AI', desc: '智能错题本与个性化巩固', age: '10-18岁', cert: 'AI通识与机器人认证' },
  { name: '梅林口语', desc: 'AI口语练习与测评', age: '8-16岁', cert: 'AI启蒙认证' },
  { name: '家庭教育', desc: '家长课堂与亲子共学', age: '全年龄', cert: '家庭素养认证' },
  { name: '推荐必读书目', desc: '素养与科创阅读书单', age: '6-18岁', cert: '科创素养认证' },
]

const COLUMN_ITEMS = [
  { title: 'AI科创必知：大模型是什么？', cat: '进阶专栏', score: '+5分', views: 2341, tag: '学霸加分' },
  { title: '零基础学Python：第1课——变量与类型', cat: '高阶专栏', score: '+8分', views: 1872, tag: '认证配套' },
  { title: '学霸王同学：我如何连续打卡60天', cat: '学霸经验', score: '+5分', views: 3120, tag: '学霸经验' },
  { title: '不插电实验：水火箭的科学原理', cat: '启蒙专栏', score: '+5分', views: 986, tag: '' },
  { title: 'AIGC创意：用AI生成专属头像的5个技巧', cat: '进阶专栏', score: '+5分', views: 2056, tag: '热门' },
  { title: '竞赛备赛：全国青少年AI大赛题型全解析', cat: '高阶专栏', score: '+10分', views: 4230, tag: '学霸加分' },
]

// 超级学霸体系数据
const SCHOLAR_LEVELS = [
  {
    id: 'enlighten', level: '启蒙学霸', age: '6-9岁', icon: '🌱', badge: '启蒙',
    color: 'from-emerald-400 to-teal-500', lightColor: 'bg-emerald-50 border-emerald-200/60', tagColor: 'bg-emerald-100 text-emerald-700',
    desc: '适配启蒙班学员，聚焦「学习参与+打卡坚持」，降低门槛，提升低龄孩子参与积极性',
    scoreReq: 100, extraReq: ['按时完成启蒙班课程', '社群打卡学分累计100分', '打卡质量合格'],
    perks: ['专属启蒙学霸电子证书', '启蒙学霸勋章展示', '可兑换启蒙阶段精品课程', '家长专属优惠群'],
  },
  {
    id: 'advance', level: '进阶学霸', age: '10-14岁', icon: '🚀', badge: '进阶',
    color: 'from-sky-400 to-blue-500', lightColor: 'bg-sky-50 border-sky-200/60', tagColor: 'bg-sky-100 text-sky-700',
    desc: '适配进阶班学员，聚焦「课程掌握+实操能力+打卡质量」，兼顾参与度与能力提升',
    scoreReq: 300, extraReq: ['按时完成进阶班/认证合作课程', '社群打卡学分累计300分', '实操打卡需提交有效作品', '参与学习社栏目互动'],
    perks: ['专属进阶学霸证书（含纸质）', '进阶勋章展示', '可兑换进阶精品课程+科创资料', '优先参与线下研学活动'],
  },
  {
    id: 'advanced', level: '高阶学霸', age: '14-18岁', icon: '🏆', badge: '高阶',
    color: 'from-violet-500 to-purple-600', lightColor: 'bg-violet-50 border-violet-200/60', tagColor: 'bg-violet-100 text-violet-700',
    desc: '适配竞赛班学员，聚焦「课程成果+竞赛参与+课题实践」，突出能力与荣誉双重价值',
    scoreReq: 800, extraReq: ['完成竞赛班/科研实训项目', '社群打卡学分累计800分', '参与竞赛或科研实训', '学习社栏目投稿1篇及以上'],
    perks: ['高阶学霸证书（高校导师背书）', '专属高阶勋章', '免费参与1期科研实训', '一对一竞赛备赛指导', '学霸案例品牌展示'],
  },
  {
    id: 'super', level: '缤果超级学霸', age: '全年龄段', icon: '⭐', badge: '超级',
    color: 'from-amber-400 to-orange-500', lightColor: 'bg-amber-50 border-amber-300/60', tagColor: 'bg-amber-100 text-amber-700',
    desc: '最高荣誉，不限年龄，聚焦「综合能力+核心成果+榜样作用」，直接入驻大咖智库，作为核心榜样展示',
    scoreReq: 2000, extraReq: ['完成对应阶段全部课程', '学分累计2000分+综合能力评估达标', '提交优秀实操作品或课题报告', '参与竞赛/实训，获得具体成果', '有榜样带动作用'],
    perks: ['授牌机构联合认证超级学霸证书', '专属超级学霸勋章', '直接入驻大咖智库（享专家权益）', '免费参与顶级科研实训', '专属学霸社群（与大咖直接互动）', '「缤果学霸说」短视频拍摄机会', '续报课程立减优惠', '品牌案例宣传展示'],
  },
]

const SCHOLAR_LIST = [
  { name: '李同学', age: 16, level: '高阶学霸', camp: '竞赛班', score: 1240, result: '全国青少年AI大赛省一等奖', icon: '🏆' },
  { name: '王同学', age: 12, level: '进阶学霸', camp: '进阶班', score: 680, result: 'AI通识认证证书+机器人竞赛入门奖', icon: '🚀' },
  { name: '张同学', age: 8, level: '启蒙学霸', camp: '启蒙班', score: 210, result: '连续打卡60天，完成不插电实验合集', icon: '🌱' },
  { name: '陈同学', age: 17, level: '缤果超级学霸', camp: '竞赛班', score: 2860, result: '机器学习课题实训优秀成果，获高校导师推荐信', icon: '⭐' },
  { name: '刘同学', age: 14, level: '进阶学霸', camp: '进阶班', score: 520, result: '数据科学认证证书+栏目投稿3篇', icon: '🚀' },
]

// 打卡任务数据
const CHECKIN_TASKS = [
  { cat: '学习打卡', tasks: [
    { name: '完成课程章节学习', score: '+10分', bonus: '+2学霸加分', done: true },
    { name: '阅读学习社栏目1篇', score: '+5分', bonus: '+1学霸加分', done: false },
    { name: '完成课程随堂测试', score: '+8分', bonus: '+2学霸加分', done: false },
  ]},
  { cat: '实操打卡', tasks: [
    { name: '提交实操作品截图', score: '+15分', bonus: '+3学霸加分', done: false },
    { name: '参与社群互动答疑', score: '+20分', bonus: '+2学霸加分', done: true },
  ]},
  { cat: '日常打卡', tasks: [
    { name: '每日签到打卡', score: '+5分', bonus: '+1学霸加分', done: true },
    { name: '连续打卡7天翻倍', score: '+30分', bonus: '+5学霸加分', done: false },
  ]},
  { cat: '分享打卡', tasks: [
    { name: '分享课程至朋友圈', score: '+5分', bonus: '+1学霸加分', done: false },
    { name: '邀请新用户入群', score: '+50分', bonus: '+3学霸加分', done: false },
  ]},
]

// 导师头像组件
function MentorAvatar({ src, name, fallback }) {
  const [currentSrc, setCurrentSrc] = useState(src)
  const [failed, setFailed] = useState(false)
  const handleError = () => {
    if (fallback && currentSrc === src) setCurrentSrc(fallback)
    else setFailed(true)
  }
  return (
    <div className="shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden bg-slate-200 flex items-center justify-center text-xl font-semibold text-slate-500">
      {!failed && <img src={currentSrc} alt={name} className="w-full h-full object-cover" onError={handleError} />}
      <span className={'w-full h-full flex items-center justify-center bg-primary/20 text-primary' + (failed ? '' : ' hidden')}>{name.charAt(0)}</span>
    </div>
  )
}

// 学霸报名弹窗
function ScholarApplyModal({ onClose }) {
  const [submitted, setSubmitted] = useState(false)
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl" onClick={e => e.stopPropagation()}>
        {submitted ? (
          <div className="text-center py-4">
            <div className="text-5xl mb-3">🎉</div>
            <h3 className="font-bold text-bingo-dark text-xl mb-2">报名成功！</h3>
            <p className="text-slate-600 text-sm mb-1">专属打卡计划已推送至您的手机</p>
            <p className="text-slate-500 text-xs mb-5">加油！期待您成为缤果AI超级学霸</p>
            <button onClick={onClose} className="btn-primary px-8 py-2.5 text-sm">知道了</button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-bold text-bingo-dark text-lg">学霸评选报名</h3>
                <p className="text-xs text-slate-500 mt-0.5">报名成功后自动生成专属打卡计划</p>
              </div>
              <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl">✕</button>
            </div>
            <form onSubmit={e => { e.preventDefault(); setSubmitted(true) }} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1 block">学员姓名 *</label>
                  <input required className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary" placeholder="请输入姓名" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1 block">学员年龄 *</label>
                  <input required type="number" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary" placeholder="请输入年龄" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">所属营班 *</label>
                <select required className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary bg-white">
                  <option value="">请选择营班</option>
                  <option>启蒙班（6-9岁）</option>
                  <option>进阶班（10-14岁）</option>
                  <option>竞赛班（14-18岁）</option>
                  <option>尚未报名（意向营班）</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">意向学霸等级 *</label>
                <select required className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary bg-white">
                  <option value="">请选择</option>
                  {SCHOLAR_LEVELS.map(l => <option key={l.id}>{l.icon} {l.level}（{l.age}）</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">联系手机号 *</label>
                <input required type="tel" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary" placeholder="接收打卡计划及进度提醒" />
              </div>
              <div className="bg-amber-50 rounded-xl p-3 text-xs text-amber-700 border border-amber-200/60">
                报名须知：报名后需按时完成课程学习+社群打卡，每月评选1次（启蒙/进阶/高阶学霸），季度评选1次（超级学霸）
              </div>
              <div className="flex gap-3 pt-1">
                <button type="submit" className="btn-primary flex-1 py-2.5 text-sm">提交报名</button>
                <button type="button" onClick={onClose} className="flex-1 border border-slate-200 rounded-lg py-2.5 text-sm text-slate-600 hover:bg-slate-50">取消</button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

// 学霸进度查询弹窗
function ScholarProgressModal({ onClose }) {
  const [queried, setQueried] = useState(false)
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-bingo-dark">学霸进度查询</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">✕</button>
        </div>
        {!queried ? (
          <div className="space-y-3">
            <input className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary" placeholder="学员姓名" />
            <input className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary" placeholder="学员编号（报名后获取）" />
            <button onClick={() => setQueried(true)} className="btn-primary w-full py-2.5 text-sm">查询进度</button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="bg-amber-50 rounded-xl p-4 border border-amber-200/60">
              <p className="font-bold text-bingo-dark">王同学 · 进阶学霸（在评）</p>
              <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                {[['当前学分', '280分'], ['学霸加分', '12分'], ['距目标差距', '还差20分'], ['当前排名', '第3名']].map(([k, v]) => (
                  <div key={k} className="bg-white rounded-lg p-2">
                    <p className="text-slate-400">{k}</p>
                    <p className="font-bold text-primary mt-0.5">{v}</p>
                  </div>
                ))}
              </div>
              <div className="mt-3">
                <div className="flex justify-between text-xs text-slate-500 mb-1"><span>打卡完成率</span><span>74%</span></div>
                <div className="w-full bg-slate-100 rounded-full h-2"><div className="bg-primary rounded-full h-2" style={{width:'74%'}} /></div>
              </div>
              <p className="text-xs text-amber-600 mt-2">⏰ 距本次评选结束还有 12 天，加油！</p>
            </div>
            <div className="flex gap-2">
              <button onClick={onClose} className="flex-1 btn-primary py-2 text-xs">去打卡赚学分</button>
              <button onClick={onClose} className="flex-1 border border-slate-200 rounded-lg py-2 text-xs text-slate-600">查看学霸榜单</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// 主组件
export default function Community() {
  const [section, setSection] = useState('home')
  const [mentorFilter, setMentorFilter] = useState('all')
  const [partnerFilter, setPartnerFilter] = useState('all')
  const [columnFilter, setColumnFilter] = useState('all')
  const [scholarLevel, setScholarLevel] = useState('enlighten')
  const [showApply, setShowApply] = useState(false)
  const [showProgress, setShowProgress] = useState(false)
  const [checkinTab, setCheckinTab] = useState('学习打卡')
  const [forumPostId, setForumPostId] = useState(null)
  const [forumData, setForumData] = useState(loadForum)
  const [forumAuthor, setForumAuthor] = useState('')
  const [forumTopicFilter, setForumTopicFilter] = useState('全部')
  const [forumShowNewPost, setForumShowNewPost] = useState(false)
  const [forumNewTitle, setForumNewTitle] = useState('')
  const [forumNewContent, setForumNewContent] = useState('')
  const [forumNewTopic, setForumNewTopic] = useState('学习交流')
  const [forumReplyingTo, setForumReplyingTo] = useState(null)
  const [forumReplyContent, setForumReplyContent] = useState('')
  const [forumCommentContent, setForumCommentContent] = useState('')
  const refreshForum = useCallback(() => setForumData(loadForum()), [])

  const navItems = [
    { key: 'forumBBS', label: 'AI发展论坛', icon: '💬', sub: '发帖·评论·回复', hot: true },
    { key: 'mentors', label: '大咖智库', icon: '🌟', sub: '论坛核心·专家赋能' },
    { key: 'parentCircle', label: 'AI不焦虑·家长圈', icon: '👨‍👩‍👧', sub: '家长专属IP·破解焦虑', ip: true },
    { key: 'teacherCircle', label: 'AI师友圈', icon: '👨‍🏫', sub: '教师专属IP·素养提升', ip: true },
    { key: 'scholar', label: '科创榜样库', icon: '⭐', sub: '榜样引领·激发动力', hot: true },
    { key: 'forumEvents', label: '科创教育峰会', icon: '🎤', sub: '交流互动·实战落地' },
    { key: 'checkin', label: '打卡成长营', icon: '🏅', sub: '打卡督学·坚持有果' },
    { key: 'training', label: '科创实训', icon: '🔬', sub: '实操赋能·提升能力' },
    { key: 'age', label: '年龄选营', icon: '🎓' },
    { key: 'courses', label: '精品课程', icon: '📚' },
    { key: 'column', label: '学习社栏目', icon: '📰' },
    { key: 'certcourses', label: '认证合作课程', icon: '📜' },
    { key: 'partners', label: '授牌合作机构', icon: '🏛️' },
  ]

  function NavBreadcrumb({ label }) {
    return (
      <div className="flex items-center gap-2 mb-6">
        <button onClick={() => setSection('home')} className="text-sm text-slate-500 hover:text-primary transition">AI发展论坛首页</button>
        <span className="text-slate-300">/</span>
        <span className="text-sm text-bingo-dark font-medium">{label}</span>
      </div>
    )
  }

  // ── 一级首页 ──
  if (section === 'home') return (
    <div>
      {/* ════ Banner：缤果AI发展论坛·未来教育专场 ════ */}
      <section className="bg-gradient-to-br from-bingo-dark via-slate-800 to-cyan-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <p className="text-xs text-cyan-300 mb-3 tracking-widest font-medium">Bingo Academy · AI学习社群</p>
          <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-2">
            家长AI教育交流圈｜青少年AI学习打卡群｜专业老师在线答疑
          </h1>
          <p className="text-xl sm:text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-orange-300 mb-2">
            共享AI学习资料 / 竞赛资讯 / 升学经验
          </p>
          <p className="text-slate-300 text-sm mb-4">缤果AI发展论坛 · 未来教育专场 · 告别AI学习焦虑，让孩子从「用AI」到「创AI」</p>
          {/* 痛点滚动条 */}
          <div className="bg-white/10 rounded-xl px-4 py-2.5 mb-5 text-sm text-orange-200 border border-white/10">
            {['想学AI不知道从哪开始？自学易走弯路、浪费时间！',
              '学了不会用、没成果、没法对接竞赛/升学！',
              '没人带、没人问、没氛围，三分钟热度难坚持！'][Math.floor(Date.now() / 3000) % 3]}
          </div>
          <div className="flex flex-wrap gap-3 mb-5">
            <button onClick={() => setShowApply(true)}
              className="bg-orange-500 hover:bg-orange-400 text-white px-7 py-3 rounded-xl text-sm font-bold transition shadow-lg">
              加入社群
            </button>
            <button onClick={() => setShowApply(true)}
              className="bg-white/15 hover:bg-white/25 text-white px-6 py-3 rounded-xl text-sm font-medium transition">
              领取学习资料
            </button>
            <button onClick={() => setSection('consult')}
              className="bg-white/15 hover:bg-white/25 text-white px-6 py-3 rounded-xl text-sm font-medium transition">
              报名咨询
            </button>
            <button onClick={() => setSection('parentCircle')}
              className="bg-rose-500/90 hover:bg-rose-500 text-white px-6 py-3 rounded-xl text-sm font-medium transition">
              家长专属通道
            </button>
            <button onClick={() => setSection('teacherCircle')}
              className="bg-indigo-500/90 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl text-sm font-medium transition">
              教师专属通道
            </button>
          </div>
          <p className="text-white/40 text-xs">清华/北大导师团队 · 已服务10,000+青少年 · 10000+家长 · 5000+教师共同选择</p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {/* ════ 五大核心营销板块（两行网格） ════ */}
        <section className="mb-10">
          <h2 className="section-title mb-4">核心亮点 · 五大必看板块</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">

            {/* 卡片1：大咖智库 */}
            <div onClick={() => setSection('mentors')}
              className="cursor-pointer rounded-2xl p-6 bg-gradient-to-br from-bingo-dark to-slate-700 text-white hover:shadow-2xl transition group flex flex-col justify-between min-h-[220px]">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex -space-x-2">
                    {['陈', '王', '徐', '王'].map((n, i) => (
                      <div key={i} className="w-8 h-8 rounded-full bg-primary/60 border-2 border-white/30 flex items-center justify-center text-xs font-bold text-white">{n}</div>
                    ))}
                  </div>
                  <span className="text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-full font-medium">专家智库</span>
                </div>
                <h3 className="font-bold text-xl mb-1 group-hover:text-cyan-300 transition">大咖智库</h3>
                <p className="text-[11px] text-orange-200 font-medium mb-2">自学无方向、没人答疑、路径易走偏？</p>
                <p className="text-slate-300 text-xs leading-relaxed mb-3">
                  汇聚AI科创名师、全国竞赛金牌教练、科技特长生升学指导专家，1v1答疑+学习路径规划+作业点评，帮孩子<strong className="text-white">少走2年弯路</strong>
                </p>
                <div className="space-y-1 text-xs">
                  {['张老师：全国AI竞赛金牌教练，指导500+获奖', '陈教授：电子科技大学博士导师，20年AI研究'].map((b, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-slate-300"><span className="text-cyan-400">✓</span>{b}</div>
                  ))}
                </div>
              </div>
              <button className="mt-5 w-full bg-primary/80 hover:bg-primary text-white py-2.5 rounded-xl text-sm font-bold transition">
                进入大咖智库 → 找专家带学
              </button>
            </div>

            {/* 卡片2：缤果超级AI学霸（视觉重点） */}
            <div onClick={() => setSection('scholar')}
              className="cursor-pointer rounded-2xl p-6 bg-gradient-to-br from-amber-400 to-orange-500 text-white hover:shadow-2xl transition group flex flex-col justify-between min-h-[220px]">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-3xl">⭐</span>
                  <span className="text-[10px] bg-white/30 text-white px-2 py-0.5 rounded-full font-bold">🔥 HOT · 核心荣誉</span>
                </div>
                <h3 className="font-bold text-xl mb-1">缤果超级AI学霸</h3>
                <p className="text-[11px] text-orange-100 font-medium mb-2">学AI没动力、没榜样、看不到成果？</p>
                <p className="text-orange-100 text-xs leading-relaxed mb-3">
                  展示历届真实学霸案例：竞赛获奖·特长生录取·AI作品落地，学霸路径<strong className="text-white">可查看、可复制</strong>，让孩子有目标有动力
                </p>
                <div className="bg-white/20 rounded-xl p-3 text-xs space-y-1">
                  <p className="text-white font-medium">📊 学霸数据背书</p>
                  <p className="text-orange-100">89% 学霸获省级以上竞赛奖项</p>
                  <p className="text-orange-100">60% 成功入选科技特长生</p>
                </div>
              </div>
              <button className="mt-5 w-full bg-white text-orange-500 py-2.5 rounded-xl text-sm font-bold hover:bg-white/90 transition">
                看学霸案例 → 复制成长路径
              </button>
            </div>

            {/* 卡片3：社群打卡积分 */}
            <div onClick={() => setSection('checkin')}
              className="cursor-pointer rounded-2xl p-6 bg-gradient-to-br from-emerald-500 to-teal-600 text-white hover:shadow-2xl transition group flex flex-col justify-between min-h-[220px]">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-3xl">🏅</span>
                  <span className="text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-full font-medium">天天有奖</span>
                </div>
                <h3 className="font-bold text-xl mb-1 group-hover:text-emerald-200 transition">社群打卡积分</h3>
                <p className="text-[11px] text-emerald-100 font-medium mb-2">AI学习三分钟热度，难以坚持怎么办？</p>
                <p className="text-emerald-100 text-xs leading-relaxed mb-3">
                  游戏化打卡积分体系，每日/每周完成打卡即赚积分，可兑换<strong className="text-white">课程优惠券·赛事报名费·AI教具·大咖1v1辅导</strong>
                </p>
                <div className="flex flex-wrap gap-2 text-xs">
                  {[['📅', '日均打卡率 78%'], ['💰', '累计发放积分 100万+'], ['🎁', '福利兑换 5大类']].map(([icon, text], i) => (
                    <span key={i} className="bg-white/15 text-white px-2.5 py-1 rounded-full">{icon} {text}</span>
                  ))}
                </div>
              </div>
              <button className="mt-5 w-full bg-white text-emerald-600 py-2.5 rounded-xl text-sm font-bold hover:bg-white/90 transition">
                立即打卡 → 赚积分兑福利
              </button>
            </div>

            {/* 卡片4：AI不焦虑·家长圈 */}
            <div onClick={() => setSection('parentCircle')}
              className="cursor-pointer rounded-2xl p-6 bg-gradient-to-br from-rose-500 to-pink-600 text-white hover:shadow-2xl transition group flex flex-col justify-between min-h-[220px]">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-3xl">👨‍👩‍👧</span>
                  <span className="text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-full font-medium">家长专属</span>
                </div>
                <h3 className="font-bold text-xl mb-1 group-hover:text-rose-200 transition">AI不焦虑·家长圈</h3>
                <p className="text-[11px] text-rose-100 font-medium mb-2">面对AI教育变革，不知如何引导孩子？</p>
                <p className="text-rose-100 text-xs leading-relaxed mb-3">
                  聚焦AI时代家庭教育共识，提供<strong className="text-white">政策解读、工具试用、育儿经验与情绪支持</strong>，助力家长科学应对AI教育变革
                </p>
                <div className="space-y-1 text-xs">
                  {['政策解读、升学政策通俗讲解', '工具试用、育儿方法实操分享'].map((b, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-rose-100"><span className="text-rose-300">✓</span>{b}</div>
                  ))}
                </div>
              </div>
              <button className="mt-5 w-full bg-white text-rose-600 py-2.5 rounded-xl text-sm font-bold hover:bg-white/90 transition">
                进入家长圈 → 破解AI焦虑
              </button>
            </div>

            {/* 卡片5：AI师友圈 */}
            <div onClick={() => setSection('teacherCircle')}
              className="cursor-pointer rounded-2xl p-6 bg-gradient-to-br from-indigo-500 to-violet-600 text-white hover:shadow-2xl transition group flex flex-col justify-between min-h-[220px]">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-3xl">👨‍🏫</span>
                  <span className="text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-full font-medium">教师专属</span>
                </div>
                <h3 className="font-bold text-xl mb-1 group-hover:text-indigo-200 transition">AI师友圈</h3>
                <p className="text-[11px] text-indigo-100 font-medium mb-2">AI教学不知从何入手？缺乏资源与同行交流？</p>
                <p className="text-indigo-100 text-xs leading-relaxed mb-3">
                  面向教师与从业者，搭建<strong className="text-white">AI教学方法、课件共创、职业发展与资源对接</strong>的互助社群，推动AI教育落地实践
                </p>
                <div className="space-y-1 text-xs">
                  {['课件共创、教学素材共享', '职业发展、资源对接互助'].map((b, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-indigo-100"><span className="text-indigo-300">✓</span>{b}</div>
                  ))}
                </div>
              </div>
              <button className="mt-5 w-full bg-white text-indigo-600 py-2.5 rounded-xl text-sm font-bold hover:bg-white/90 transition">
                进入师友圈 → 赋能教学
              </button>
            </div>
          </div>
        </section>

        {/* ════ 新用户福利展示 ════ */}
        <section className="mb-10">
          <h2 className="section-title mb-4">新用户专属福利 · 免费领取</h2>
          <div className="grid sm:grid-cols-2 gap-5">
            <div className="card p-6 bg-gradient-to-br from-rose-50 to-pink-50 border-rose-200/60">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">👨‍👩‍👧</span>
                <h3 className="font-bold text-bingo-dark">家长新用户三大福利</h3>
              </div>
              <ul className="space-y-2 mb-4 text-sm text-slate-700">
                <li className="flex items-center gap-2"><span className="text-rose-500">✓</span>免费AI家长育儿指南</li>
                <li className="flex items-center gap-2"><span className="text-rose-500">✓</span>1v1家长教育咨询（限1次）</li>
                <li className="flex items-center gap-2"><span className="text-rose-500">✓</span>家长交流社群免费加入</li>
              </ul>
              <button onClick={() => setSection('parentCircle')} className="w-full bg-rose-500 hover:bg-rose-600 text-white py-2.5 rounded-xl text-sm font-bold transition">进入家长圈 · 免费领取</button>
            </div>
            <div className="card p-6 bg-gradient-to-br from-indigo-50 to-violet-50 border-indigo-200/60">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">👨‍🏫</span>
                <h3 className="font-bold text-bingo-dark">教师新用户三大福利</h3>
              </div>
              <ul className="space-y-2 mb-4 text-sm text-slate-700">
                <li className="flex items-center gap-2"><span className="text-indigo-500">✓</span>免费AI教学工具包</li>
                <li className="flex items-center gap-2"><span className="text-indigo-500">✓</span>1v1教师AI素养咨询（限1次）</li>
                <li className="flex items-center gap-2"><span className="text-indigo-500">✓</span>教师教研交流社群免费加入</li>
              </ul>
              <button onClick={() => setSection('teacherCircle')} className="w-full bg-indigo-500 hover:bg-indigo-600 text-white py-2.5 rounded-xl text-sm font-bold transition">进入师友圈 · 免费领取</button>
            </div>
          </div>
        </section>

        {/* ════ 三大用户群体痛点与解决方案 ════ */}
        <section className="mb-10">
          <h2 className="section-title mb-2">你遇到的AI焦虑，我们一套全解决</h2>
          <p className="text-slate-500 text-sm mb-5">青少年可落地、家长能看懂、教师可借鉴 · 方案可落地、学习可坚持、成果可验证</p>
          <div className="grid sm:grid-cols-3 gap-4 mb-5">
            <div className="card p-5 border border-sky-200/60 bg-sky-50/50 hover:shadow-md transition">
              <div className="text-2xl mb-2">🎓</div>
              <p className="text-xs text-orange-600 font-bold mb-2">青少年</p>
              <p className="text-xs text-slate-600 mb-2">痛点：AI学习无方向、缺乏实操、竞赛备赛迷茫、升学无规划、付出无成果</p>
              <p className="text-sm text-slate-700 mb-3">解决方案：体系化学习路径、实操实训、竞赛指导、升学对接</p>
              <button onClick={() => setSection('mentors')} className="text-xs text-primary font-medium hover:underline">了解学习路径 →</button>
            </div>
            <div className="card p-5 border border-rose-200/60 bg-rose-50/50 hover:shadow-md transition">
              <div className="text-2xl mb-2">👨‍👩‍👧</div>
              <p className="text-xs text-orange-600 font-bold mb-2">家长</p>
              <p className="text-xs text-slate-600 mb-2">痛点：不懂AI无法引导、焦虑孩子方向、担心AI影响成长、不知如何衔接升学</p>
              <p className="text-sm text-slate-700 mb-3">解决方案（AI不焦虑·家长圈）：AI认知提升、引导方法、政策解读、家长互助</p>
              <button onClick={() => setSection('parentCircle')} className="text-xs text-rose-600 font-medium hover:underline">进入家长圈 · 免费领育儿指南 →</button>
            </div>
            <div className="card p-5 border border-indigo-200/60 bg-indigo-50/50 hover:shadow-md transition">
              <div className="text-2xl mb-2">👨‍🏫</div>
              <p className="text-xs text-orange-600 font-bold mb-2">教师</p>
              <p className="text-xs text-slate-600 mb-2">痛点：AI教学能力不足、缺乏素材、不知如何融入课堂、素养提升无路径</p>
              <p className="text-sm text-slate-700 mb-3">解决方案（AI师友圈）：AI教学培训、素材共享、教研交流、素养提升规划</p>
              <button onClick={() => setSection('teacherCircle')} className="text-xs text-indigo-600 font-medium hover:underline">进入师友圈 · 免费领教学工具包 →</button>
            </div>
          </div>
          <div className="card p-5 bg-gradient-to-r from-bingo-dark to-slate-700 text-white flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="font-bold text-base mb-1">定制专属AI学习路径</p>
              <p className="text-slate-300 text-xs">免费获取大咖1v1规划，3分钟了解孩子AI潜力与成长路径</p>
            </div>
            <button onClick={() => setShowApply(true)} className="bg-orange-500 hover:bg-orange-400 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition shrink-0">免费预约大咖规划</button>
          </div>
        </section>

        {/* ════ 学习社专属权益 ════ */}
        <section className="mb-10">
          <h2 className="section-title mb-2">学习社专属权益 · 只给懂AI、爱学习的你</h2>
          <p className="text-slate-500 text-sm mb-5">免费成员无门槛加入，高级会员解锁更多专属资源</p>
          <div className="grid sm:grid-cols-2 gap-5">
            {/* 免费权益 */}
            <div className="card p-6 bg-gradient-to-br from-slate-50 to-cyan-50 border-primary/20">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">🎁</span>
                <h3 className="font-bold text-bingo-dark">免费成员权益</h3>
                <span className="text-[10px] bg-primary/15 text-primary px-2 py-0.5 rounded-full">所有人可加入</span>
              </div>
              <ul className="space-y-2.5 mb-5">
                {[
                  '社群打卡领基础学分（每日+5~10分）',
                  '学习社栏目浏览，阅读AI科创内容',
                  '精品课程基础浏览权限',
                  '参与学霸评选报名（需满足条件）',
                  '每月1次免费大咖答疑机会',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                    <span className="text-primary mt-0.5 shrink-0">✓</span>{item}
                  </li>
                ))}
              </ul>
              <button onClick={() => setShowApply(true)}
                className="w-full bg-primary hover:bg-cyan-600 text-white py-2.5 rounded-xl text-sm font-bold transition">
                立即免费加入
              </button>
            </div>
            {/* 高级权益 */}
            <div className="card p-6 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-300/60">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">⭐</span>
                <h3 className="font-bold text-bingo-dark">学霸会员专属权益</h3>
                <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200">解锁更多</span>
              </div>
              <ul className="space-y-2.5 mb-5">
                {[
                  '打卡学分翻倍（每日+20分，快速冲学霸）',
                  '1v1大咖答疑专属通道（月内无限次）',
                  '学霸专属学习路径规划报告',
                  '优先参与线下研学/实训营名额',
                  '直接入驻大咖智库，获得品牌背书展示',
                  '学霸证书+实物奖励+续报课程优惠',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                    <span className="text-amber-500 mt-0.5 shrink-0">★</span>{item}
                  </li>
                ))}
              </ul>
              <button onClick={() => setSection('scholar')}
                className="w-full bg-amber-500 hover:bg-amber-600 text-white py-2.5 rounded-xl text-sm font-bold transition">
                冲击学霸·解锁专属权益
              </button>
            </div>
          </div>
        </section>

        {/* ════ 核心功能板块汇总（AI发展论坛导航） ════ */}
        <section className="mb-10">
          <h2 className="section-title mb-1">论坛核心板块 · 一站式导航</h2>
          <p className="text-slate-500 text-sm mb-5">快速跳转至任意功能板块，突出「AI不焦虑·家长圈」「AI师友圈」两大专属IP</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-4">
            {navItems.slice(0, 9).map(n => (
              <button key={n.key} onClick={() => setSection(n.key)}
                className={'card p-4 flex flex-col items-center gap-2 hover:shadow-md transition group relative text-left ' +
                  (n.hot ? 'border-amber-300/60 bg-amber-50/50 hover:border-amber-400' : n.ip ? 'border-rose-200/60 bg-rose-50/30 hover:border-rose-300' : 'hover:border-primary/30 hover:bg-primary/5')}>
                {n.hot && <span className="absolute -top-1.5 -right-1.5 text-[9px] bg-amber-500 text-white px-1.5 py-0.5 rounded-full font-bold">HOT</span>}
                {n.ip && <span className="absolute -top-1.5 -right-1.5 text-[9px] bg-rose-500 text-white px-1.5 py-0.5 rounded-full font-bold">IP</span>}
                <span className="text-2xl">{n.icon}</span>
                <span className={'text-xs font-bold text-center leading-tight ' + (n.hot ? 'text-amber-700' : n.ip ? 'text-rose-700' : 'text-slate-700 group-hover:text-primary')}>{n.label}</span>
                {n.sub && <span className="text-[10px] text-slate-500 text-center leading-tight">{n.sub}</span>}
              </button>
            ))}
            <button onClick={() => setSection('scoreRules')}
              className="card p-4 flex flex-col items-center gap-2 hover:shadow-md hover:border-emerald-300 hover:bg-emerald-50/50 transition">
              <span className="text-2xl">🔄</span>
              <span className="text-xs font-bold text-slate-700 text-center leading-tight">积分互通说明</span>
              <span className="text-[10px] text-slate-500 text-center">积分通用·权益共享</span>
            </button>
            <button onClick={() => setSection('consult')}
              className="card p-4 flex flex-col items-center gap-2 hover:shadow-md hover:border-primary/30 hover:bg-primary/5 transition">
              <span className="text-2xl">📋</span>
              <span className="text-xs font-bold text-slate-700 text-center leading-tight">报名咨询</span>
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to="/profile" className="card px-4 py-2 flex items-center gap-2 hover:border-primary/30 hover:bg-primary/5 transition">
              <span>👑</span>
              <span className="text-sm font-medium text-slate-700">会员中心</span>
              <span className="text-[10px] text-slate-500">专属权益·高效转化</span>
            </Link>
          </div>
        </section>

        {/* ════ 精彩成果展示 ════ */}
        <section className="mb-10">
          <h2 className="section-title mb-4">精彩成果展示</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: '🏆', title: '竞赛获奖', num: '120+', desc: '学员参加全国AI创新大赛，获省级及以上奖项' },
              { icon: '🎓', title: '名校升学', num: '35+', desc: '学员以科创特长生/综评身份成功升学名校' },
              { icon: '📁', title: '实操作品', num: '2000+', desc: '学员完成AI项目、机器人作品、数据分析报告' },
              { icon: '⭐', title: '缤果学霸', num: '86', desc: '累计评选各等级学霸，打造科创榜样生态' },
            ].map((s, i) => (
              <div key={i} className="card p-6 text-center hover:shadow-md hover:border-primary/30 transition">
                <div className="text-3xl mb-2">{s.icon}</div>
                <p className="text-2xl font-bold text-primary">{s.num}</p>
                <p className="font-semibold text-bingo-dark text-sm mt-1">{s.title}</p>
                <p className="text-xs text-slate-500 mt-1">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ════ 快速留资 ════ */}
        <section className="card p-6 bg-cyan-50 border-primary/20 flex flex-wrap gap-6 items-start mb-4">
          <div className="flex-1 min-w-[200px]">
            <h3 className="font-bold text-bingo-dark mb-1">免费领取科创学习资料</h3>
            <p className="text-sm text-slate-600 mb-1">提交后立即发送研学手册至手机</p>
            <p className="text-xs text-primary">留资可参与缤果学霸报名预约 →</p>
          </div>
          <form onSubmit={e => e.preventDefault()} className="flex flex-wrap gap-2 items-end flex-1 min-w-[280px]">
            <input className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary flex-1 min-w-[100px]" placeholder="姓名" />
            <input className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary flex-1 min-w-[120px]" placeholder="手机号" type="tel" />
            <button type="submit" className="btn-primary text-sm px-5 py-2 shrink-0">免费领取</button>
          </form>
        </section>

      </div>

      {/* 悬浮侧边栏 */}
      <div className="fixed right-4 bottom-20 z-40 flex flex-col gap-2">
        <button onClick={() => setSection('checkin')} className="bg-emerald-500 text-white text-xs px-3 py-2.5 rounded-2xl shadow-lg hover:bg-emerald-600 transition">🏅 打卡</button>
        <button onClick={() => setSection('scholar')} className="bg-amber-500 text-white text-xs px-3 py-2.5 rounded-2xl shadow-lg hover:bg-amber-600 transition">⭐ 学霸</button>
        <button onClick={() => setShowProgress(true)} className="bg-white border border-slate-200 text-slate-600 text-xs px-3 py-2.5 rounded-2xl shadow-lg hover:bg-slate-50 transition">🔍 进度</button>
      </div>

      {showApply && <ScholarApplyModal onClose={() => setShowApply(false)} />}
      {showProgress && <ScholarProgressModal onClose={() => setShowProgress(false)} />}
    </div>
  )

  // ── AI发展论坛 BBS ──
  if (section === 'forumBBS') {
    const posts = forumData.posts
    const comments = forumData.comments
    const topics = ['全部', '学习交流', '家长交流', '教师交流', '竞赛升学', '公告']
    const addPost = (e) => {
      e.preventDefault()
      const author = forumAuthor.trim() || '匿名用户'
      const title = forumNewTitle.trim()
      const content = forumNewContent.trim()
      if (!title || !content) return
      const id = 'p' + Date.now()
      const next = { posts: [...posts, { id, title, content, author, createdAt: Date.now(), topic: forumNewTopic }], comments }
      setForumData(next)
      saveForum(next.posts, next.comments)
      setForumNewTitle('')
      setForumNewContent('')
      setForumShowNewPost(false)
    }
    const addComment = (postId, parentId, content, author) => {
      if (!content.trim()) return
      const id = 'c' + Date.now()
      const next = { posts, comments: [...comments, { id, postId, parentId, content: content.trim(), author: author || '匿名用户', createdAt: Date.now() }] }
      setForumData(next)
      saveForum(next.posts, next.comments)
      setForumReplyingTo(null)
      setForumReplyContent('')
    }
    const filteredPosts = forumTopicFilter === '全部' ? posts : posts.filter(p => p.topic === forumTopicFilter)
    const post = forumPostId ? posts.find(p => p.id === forumPostId) : null
    const postComments = post ? comments.filter(c => c.postId === post.id) : []
    const topComments = postComments.filter(c => !c.parentId)
    const getReplies = (cid) => postComments.filter(c => c.parentId === cid)
    const fmt = (t) => {
      const d = new Date(t)
      const now = Date.now()
      const diff = now - t
      if (diff < 60000) return '刚刚'
      if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前'
      if (diff < 86400000) return Math.floor(diff / 3600000) + '小时前'
      if (diff < 604800000) return Math.floor(diff / 86400000) + '天前'
      return d.toLocaleDateString('zh-CN')
    }
    // 帖子详情页
    if (forumPostId && post) return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-2 mb-6">
          <button onClick={() => { setForumPostId(null); setForumReplyingTo(null) }} className="text-sm text-slate-500 hover:text-primary transition">← 返回论坛</button>
        </div>
        <div className="card p-6 mb-6">
          <span className="text-[10px] bg-primary/15 text-primary px-2 py-0.5 rounded-full">{post.topic}</span>
          <h1 className="text-xl font-bold text-bingo-dark mt-2 mb-2">{post.title}</h1>
          <p className="text-sm text-slate-500 mb-4">
            {post.author} · {fmt(post.createdAt)}
          </p>
          <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{post.content}</p>
        </div>
        <h3 className="font-semibold text-bingo-dark mb-3">评论 ({postComments.length})</h3>
        <div className="mb-4">
          <input value={forumAuthor} onChange={e => setForumAuthor(e.target.value)} className="border border-slate-200 rounded-lg px-3 py-2 text-sm w-full max-w-xs mb-2 focus:outline-none focus:border-primary" placeholder="昵称（可选）" />
          <textarea
            value={forumReplyingTo ? forumReplyContent : forumCommentContent}
            onChange={e => forumReplyingTo ? setForumReplyContent(e.target.value) : setForumCommentContent(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm w-full min-h-[80px] focus:outline-none focus:border-primary resize-none"
            placeholder={forumReplyingTo ? `回复 ${forumReplyingTo.author}：` : '写评论...'}
          />
          {forumReplyingTo ? (
            <div className="flex items-center gap-2 mt-2">
              <button onClick={() => addComment(post.id, forumReplyingTo.id, forumReplyContent, forumAuthor.trim() || '匿名用户')} className="btn-primary text-sm px-4 py-2">回复</button>
              <button onClick={() => { setForumReplyingTo(null); setForumReplyContent('') }} className="text-sm text-slate-500 hover:underline">取消</button>
            </div>
          ) : (
            <button onClick={() => { addComment(post.id, null, forumCommentContent, forumAuthor.trim() || '匿名用户'); setForumCommentContent('') }} className="mt-2 btn-primary text-sm px-4 py-2">
              发表评论
            </button>
          )}
        </div>
        <div className="space-y-4">
          {topComments.map(c => (
            <div key={c.id} className="card p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="font-medium text-bingo-dark text-sm">{c.author}</span>
                  <span className="text-slate-400 text-xs ml-2">{fmt(c.createdAt)}</span>
                </div>
                <button onClick={() => setForumReplyingTo(c)} className="text-xs text-primary hover:underline">回复</button>
              </div>
              <p className="text-slate-700 text-sm mt-1 whitespace-pre-wrap">{c.content}</p>
              {getReplies(c.id).map(r => (
                <div key={r.id} className="ml-6 mt-3 pl-4 border-l-2 border-slate-100">
                  <span className="font-medium text-bingo-dark text-sm">{r.author}</span>
                  <span className="text-slate-400 text-xs ml-2">{fmt(r.createdAt)}</span>
                  <p className="text-slate-600 text-sm mt-1 whitespace-pre-wrap">{r.content}</p>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    )
    // 帖子列表页
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <NavBreadcrumb label="AI发展论坛" />
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-bingo-dark mb-1">AI发展论坛</h2>
            <p className="text-slate-600 text-sm">发帖、评论、回复，与学员、家长、教师一起交流AI教育</p>
          </div>
          <button onClick={() => setForumShowNewPost(true)} className="btn-primary px-5 py-2.5 text-sm font-bold">📝 发表帖子</button>
        </div>
        <div className="flex gap-2 mb-5 flex-wrap">
          {topics.map(t => (
            <button key={t} onClick={() => setForumTopicFilter(t)}
              className={'px-4 py-1.5 rounded-full text-xs transition ' + (forumTopicFilter === t ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200')}>{t}</button>
          ))}
        </div>
        <div className="space-y-3">
          {filteredPosts.length === 0 ? (
            <div className="card p-12 text-center text-slate-500">暂无帖子，快来发表第一篇吧</div>
          ) : (
            filteredPosts.map(p => (
              <div key={p.id} onClick={() => setForumPostId(p.id)} className="card p-5 hover:shadow-md hover:border-primary/30 transition cursor-pointer">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] bg-primary/15 text-primary px-2 py-0.5 rounded-full">{p.topic}</span>
                    <h3 className="font-semibold text-bingo-dark mt-2 mb-1 line-clamp-1">{p.title}</h3>
                    <p className="text-sm text-slate-600 line-clamp-2">{p.content}</p>
                    <p className="text-xs text-slate-400 mt-2">{p.author} · {fmt(p.createdAt)} · {comments.filter(c => c.postId === p.id).length} 条评论</p>
                  </div>
                  <span className="text-slate-300 shrink-0">→</span>
                </div>
              </div>
            ))
          )}
        </div>
        {forumShowNewPost && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setForumShowNewPost(false)}>
            <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl" onClick={e => e.stopPropagation()}>
              <h3 className="font-bold text-bingo-dark text-lg mb-4">发表帖子</h3>
              <form onSubmit={addPost} className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1 block">版块</label>
                  <select value={forumNewTopic} onChange={e => setForumNewTopic(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary bg-white">
                    {topics.slice(1).map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1 block">标题 *</label>
                  <input value={forumNewTitle} onChange={e => setForumNewTitle(e.target.value)} required className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary" placeholder="请输入标题" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1 block">内容 *</label>
                  <textarea value={forumNewContent} onChange={e => setForumNewContent(e.target.value)} required className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary min-h-[120px] resize-none" placeholder="分享你的想法..." />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1 block">昵称（可选）</label>
                  <input value={forumAuthor} onChange={e => setForumAuthor(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary" placeholder="匿名发表可留空" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="submit" className="btn-primary flex-1 py-2.5 text-sm">发布</button>
                  <button type="button" onClick={() => setForumShowNewPost(false)} className="flex-1 border border-slate-200 rounded-lg py-2.5 text-sm text-slate-600 hover:bg-slate-50">取消</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    )
  }

  // ── 大咖智库 ──
  if (section === 'mentors') return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <NavBreadcrumb label="大咖智库" />
      <h2 className="text-2xl font-bold text-bingo-dark mb-1">大咖智库 · 论坛核心支撑·专家赋能</h2>
      <p className="text-slate-600 text-sm mb-6">科创精英展示阵地，打造榜样效应 · 汇聚AI教学、竞赛、升学专家及家长赋能、教师赋能导师</p>
      <div className="flex gap-2 mb-6 flex-wrap">
        {[['all', '全部'], ['竞赛牛人', '竞赛牛人'], ['升学牛人', '升学牛人'], ['课题牛人', '课题牛人'], ['学霸牛人', '⭐ 学霸牛人']].map(([k, l]) => (
          <button key={k} onClick={() => setMentorFilter(k)}
            className={'px-4 py-1.5 rounded-full text-xs transition ' + (mentorFilter === k ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200')}>{l}</button>
        ))}
      </div>
      <div className="grid md:grid-cols-2 gap-5 mb-6">
        {certifiedMentors.filter(m => mentorFilter === 'all' || m.type === mentorFilter).map((m, i) => (
          <div key={i} className={'card p-6 flex flex-col sm:flex-row gap-4 hover:shadow-md hover:border-primary/30 transition ' + (m.type === '学霸牛人' ? 'border-amber-300/60 bg-amber-50/30' : '')}>
            <div className="flex flex-col items-center sm:items-start shrink-0">
              <MentorAvatar src={m.photo} name={m.name} fallback={m.fallback} />
              <span className={'text-xs font-medium mt-2 px-2 py-0.5 rounded-full ' + (m.type === '学霸牛人' ? 'bg-amber-100 text-amber-700' : 'bg-primary/10 text-primary')}>{m.type}</span>
              <span className="font-semibold text-bingo-dark text-sm mt-1">{m.name}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-slate-600 leading-relaxed mb-3">{m.intro}</p>
              <div className="flex gap-2 flex-wrap">
                <button type="button" className="text-xs px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white transition">向大咖提问</button>
                <button onClick={() => setSection('scholar')} className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition">成为同款学霸</button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="card p-5 bg-amber-50 border-amber-200/60">
        <h3 className="font-semibold text-bingo-dark mb-2">⭐ 大咖智库入驻条件</h3>
        <p className="text-sm text-slate-600 mb-3">缤果超级学霸可直接入驻大咖智库，享受专家同等权益（专属展示、答疑、品牌背书）</p>
        <button onClick={() => setShowApply(true)} className="btn-primary text-sm px-5 py-2">报名学霸评选 →</button>
      </div>
      <div className="flex gap-2 mt-4">
        <button onClick={() => setSection('parentCircle')} className="text-sm text-rose-600 hover:underline">AI不焦虑·家长圈专家 →</button>
        <button onClick={() => setSection('teacherCircle')} className="text-sm text-indigo-600 hover:underline">AI师友圈专家 →</button>
      </div>
    </div>
  )

  // ── AI不焦虑·家长圈 ──
  if (section === 'parentCircle') return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <NavBreadcrumb label="AI不焦虑·家长圈" />
      <div className="card p-6 bg-gradient-to-br from-rose-50 to-pink-50 border-rose-200/60 mb-6">
        <p className="text-xs text-rose-600 font-bold mb-2">家长专属IP · 破解焦虑</p>
        <h2 className="text-2xl font-bold text-bingo-dark mb-2">AI时代家长赋能专属阵地——AI不焦虑·家长圈</h2>
        <p className="text-slate-600 text-sm mb-4">聚焦AI时代家长应对法则与解决方案，精准破解家长AI教育焦虑，打造家长互助+专家指导+干货输出三位一体</p>
        <div className="flex flex-wrap gap-2">
          {['家长干货区', '专家答疑区', '家长交流区', '线上线下家长活动', '家长案例库', '积分与权益'].map((tab, i) => (
            <button key={i} className="px-3 py-1.5 rounded-full text-xs bg-rose-100 text-rose-700 hover:bg-rose-200 transition">{tab}</button>
          ))}
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-5 mb-6">
        {[
          { icon: '📘', title: 'AI认知提升', desc: 'AI基础常识、AI发展趋势、AI对青少年成长的影响，通俗易懂', tag: '免费查看' },
          { icon: '📋', title: '应对法则干货', desc: '家长面对AI时代核心应对技巧、不同年龄段引导方法', tag: '收藏下载' },
          { icon: '🎯', title: '解决方案专区', desc: '针对家长核心痛点的落地解决方案，图文教程+视频讲解', tag: '立即尝试' },
          { icon: '📜', title: '政策解读专区', desc: '青少年AI科创升学政策、竞赛政策家长通俗解读版', tag: '专家解读' },
        ].map((item, i) => (
          <div key={i} className="card p-5 hover:shadow-md hover:border-rose-300/60 transition">
            <div className="flex items-start justify-between mb-2">
              <span className="text-2xl">{item.icon}</span>
              <span className="text-[10px] bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full">{item.tag}</span>
            </div>
            <h3 className="font-semibold text-bingo-dark mb-1">{item.title}</h3>
            <p className="text-sm text-slate-600">{item.desc}</p>
          </div>
        ))}
      </div>
      <div className="card p-6 bg-rose-50 border-rose-200/60 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="font-bold text-bingo-dark mb-1">免费领取AI家长育儿指南</p>
          <p className="text-sm text-slate-600">填写手机号，立即获取《AI时代家长应对法则》+ 1v1咨询预约资格</p>
        </div>
        <form onSubmit={e => e.preventDefault()} className="flex gap-2">
          <input className="border border-rose-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-rose-400" placeholder="手机号" type="tel" />
          <button type="submit" className="bg-rose-500 hover:bg-rose-600 text-white px-5 py-2.5 rounded-lg text-sm font-bold">免费领取</button>
        </form>
      </div>
    </div>
  )

  // ── AI师友圈 ──
  if (section === 'teacherCircle') return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <NavBreadcrumb label="AI师友圈" />
      <div className="card p-6 bg-gradient-to-br from-indigo-50 to-violet-50 border-indigo-200/60 mb-6">
        <p className="text-xs text-indigo-600 font-bold mb-2">教师专属IP · 素养提升</p>
        <h2 className="text-2xl font-bold text-bingo-dark mb-2">AI时代教师赋能专属阵地——AI师友圈</h2>
        <p className="text-slate-600 text-sm mb-4">聚焦AI时代教师AI素养建设，打造教师学习+教研交流+专家指导+资源共享四位一体</p>
        <div className="flex flex-wrap gap-2">
          {['素养提升干货区', '教研交流区', '专家答疑区', '线上线下教研活动', '教学资源库', '教师案例库'].map((tab, i) => (
            <button key={i} className="px-3 py-1.5 rounded-full text-xs bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition">{tab}</button>
          ))}
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-5 mb-6">
        {[
          { icon: '🛠️', title: 'AI教学基础', desc: 'AI教学工具应用教程、AI教学基础常识，实操性强', tag: '免费查看' },
          { icon: '📐', title: '实操技巧专区', desc: 'AI与学科融合技巧、AI课堂教学实操方法、作业设计技巧', tag: '收藏下载' },
          { icon: '📚', title: '课程开发专区', desc: 'AI校本课程开发思路、课件模板、课程案例解析', tag: '下载模板' },
          { icon: '📈', title: '素养提升路径', desc: '教师AI素养分级提升规划、AI教学能力考核标准', tag: '咨询专家' },
        ].map((item, i) => (
          <div key={i} className="card p-5 hover:shadow-md hover:border-indigo-300/60 transition">
            <div className="flex items-start justify-between mb-2">
              <span className="text-2xl">{item.icon}</span>
              <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">{item.tag}</span>
            </div>
            <h3 className="font-semibold text-bingo-dark mb-1">{item.title}</h3>
            <p className="text-sm text-slate-600">{item.desc}</p>
          </div>
        ))}
      </div>
      <div className="card p-6 bg-indigo-50 border-indigo-200/60 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="font-bold text-bingo-dark mb-1">免费领取AI教学工具包</p>
          <p className="text-sm text-slate-600">填写手机号，立即获取《AI教学实操手册》+ 1v1教师AI素养咨询预约资格</p>
        </div>
        <form onSubmit={e => e.preventDefault()} className="flex gap-2">
          <input className="border border-indigo-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400" placeholder="手机号" type="tel" />
          <button type="submit" className="bg-indigo-500 hover:bg-indigo-600 text-white px-5 py-2.5 rounded-lg text-sm font-bold">免费领取</button>
        </form>
      </div>
    </div>
  )

  // ── 科创教育峰会 ──
  if (section === 'forumEvents') return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <NavBreadcrumb label="科创教育峰会" />
      <h2 className="text-2xl font-bold text-bingo-dark mb-1">科创教育峰会</h2>
      <p className="text-slate-600 text-sm mb-6">交流互动·实战落地 · 年度科创教育峰会、季度主题沙龙、线上直播分享、每月线上竞赛</p>
      <div className="grid md:grid-cols-2 gap-5">
        {[
          { title: '年度科创教育峰会', type: '线下', desc: '每年1场，汇聚行业大咖、学员成果展示', tag: '立即报名' },
          { title: '季度主题沙龙', type: '线下', desc: '每季度1场，深度研讨AI教育趋势', tag: '查看详情' },
          { title: '每周线上直播分享', type: '线上', desc: '名师干货、家长专题、教师专题', tag: '预约提醒' },
          { title: '每月线上竞赛', type: '线上', desc: 'AI创新赛、编程赛、作品赛', tag: '立即报名' },
        ].map((item, i) => (
          <div key={i} className="card p-5 hover:shadow-md hover:border-primary/30 transition">
            <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">{item.type}</span>
            <h3 className="font-semibold text-bingo-dark mt-2 mb-1">{item.title}</h3>
            <p className="text-sm text-slate-600 mb-3">{item.desc}</p>
            <button className="text-sm text-primary font-medium hover:underline">{item.tag} →</button>
          </div>
        ))}
      </div>
    </div>
  )

  // ── 积分互通说明 ──
  if (section === 'scoreRules') return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <NavBreadcrumb label="积分互通说明" />
      <h2 className="text-2xl font-bold text-bingo-dark mb-1">积分通用 · 权益共享</h2>
      <p className="text-slate-600 text-sm mb-6">论坛学员、家长、教师三大群体积分互通，参与任一板块均可积累积分，兑换跨群体福利</p>
      <div className="card p-6 mb-6">
        <h3 className="font-semibold text-bingo-dark mb-4">积分获取规则（互通）</h3>
        <ul className="space-y-3">
          {[
            '学员：打卡、课程学习、竞赛参与、作品提交等',
            '家长：浏览干货、提问答疑、发帖互动、参与家长活动、提交案例等',
            '教师：浏览干货、教研发帖、答疑分享、参与教研活动、上传教学资源等',
          ].map((item, i) => (
            <li key={i} className="flex items-center gap-2 text-sm text-slate-700">
              <span className="text-primary">✓</span> {item}
            </li>
          ))}
        </ul>
      </div>
      <div className="card p-6 bg-emerald-50 border-emerald-200/60">
        <p className="font-semibold text-bingo-dark mb-2">积分可兑换</p>
        <p className="text-sm text-slate-600">课程优惠券、专家1v1咨询、线下活动门票、AI教具、教学资源包等，积分通用、权益共享，强化三大群体联动</p>
      </div>
    </div>
  )

  // ── 授牌合作机构 ──
  if (section === 'partners') return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <NavBreadcrumb label="授牌合作机构" />
      <h2 className="text-2xl font-bold text-bingo-dark mb-1">授牌合作机构</h2>
      <p className="text-slate-600 text-sm mb-6">权威信任背书墙 · 汇聚高校、实验室、科创企业、竞赛组委会等优质合作资源</p>
      <div className="flex gap-2 mb-6 flex-wrap">
        {[['all', '全部'], ['高校/实验室', '高校/实验室'], ['科创竞赛机构', '科创竞赛机构'], ['行业认证机构', '行业认证机构'], ['校企合作单位', '校企合作单位']].map(([k, l]) => (
          <button key={k} onClick={() => setPartnerFilter(k)}
            className={'px-4 py-1.5 rounded-full text-xs transition ' + (partnerFilter === k ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200')}>{l}</button>
        ))}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        {partnerInstitutions.filter(p => partnerFilter === 'all' || p.type === partnerFilter).map((p, i) => (
          <div key={i} className="card p-5 flex flex-col items-center text-center hover:shadow-md hover:border-primary/30 transition group">
            <div className="w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center text-2xl font-bold text-primary/60 group-hover:bg-primary/10 mb-3">{p.name.charAt(0)}</div>
            <div className="font-medium text-bingo-dark text-sm leading-tight line-clamp-2">{p.name}</div>
            <div className="text-xs text-slate-500 mt-1">{p.region}</div>
            <span className="mt-2 inline-block text-[10px] px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/30">授牌合作</span>
          </div>
        ))}
      </div>
      <div className="card p-5 bg-amber-50 border-amber-200/60">
        <p className="text-sm font-semibold text-bingo-dark mb-1">⭐ 合作机构联合认证缤果超级学霸证书</p>
        <p className="text-sm text-slate-600">超级学霸证书由授牌合作机构联合认证，证书可在升学综评、竞赛、留学等场景作为能力证明</p>
      </div>
    </div>
  )

  // ── 社群打卡领学分 ──
  if (section === 'checkin') return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <NavBreadcrumb label="社群打卡领学分" />
      <h2 className="text-2xl font-bold text-bingo-dark mb-1">社群打卡领学分</h2>
      <p className="text-slate-600 text-sm mb-6">打卡攒学分 → 学分冲学霸 → 学霸获荣誉 · 完成打卡任务，积累学分与学霸评选加分</p>

      {/* 学分概览 */}
      <div className="card p-6 bg-gradient-to-r from-primary/90 to-cyan-600 text-white mb-6">
        <div className="flex flex-wrap gap-4 justify-between mb-4">
          <div>
            <p className="text-white/80 text-sm">当前学分</p>
            <p className="text-4xl font-bold">280 分</p>
            <p className="text-white/70 text-xs mt-1">学分等级：进阶学员 ⭐⭐</p>
          </div>
          <div className="text-right">
            <p className="text-white/80 text-sm">学霸加分</p>
            <p className="text-2xl font-bold">12 分</p>
            <p className="text-white/70 text-xs mt-1">距进阶学霸还差 20 分</p>
          </div>
        </div>
        <div className="mb-3">
          <div className="flex justify-between text-xs text-white/70 mb-1"><span>进阶学霸进度</span><span>280/300 分</span></div>
          <div className="w-full bg-white/20 rounded-full h-2"><div className="bg-white rounded-full h-2" style={{width:'93%'}} /></div>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button onClick={() => setShowProgress(true)} className="px-4 py-2 rounded-lg text-sm bg-white text-primary font-medium hover:bg-white/90">查询学霸进度</button>
          <Link to="/profile#score-bank" className="px-4 py-2 rounded-lg text-sm bg-white/20 text-white hover:bg-white/30">学分中心</Link>
        </div>
      </div>

      {/* 打卡任务 */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {CHECKIN_TASKS.map(cat => (
          <button key={cat.cat} onClick={() => setCheckinTab(cat.cat)}
            className={'px-4 py-1.5 rounded-full text-xs font-medium transition ' + (checkinTab === cat.cat ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200')}>{cat.cat}</button>
        ))}
      </div>
      <div className="space-y-3 mb-6">
        {CHECKIN_TASKS.find(c => c.cat === checkinTab)?.tasks.map((t, i) => (
          <div key={i} className="card p-4 flex items-center justify-between gap-3">
            <div className="flex-1">
              <p className={'text-sm font-medium ' + (t.done ? 'line-through text-slate-400' : 'text-slate-700')}>{t.name}</p>
              <div className="flex gap-3 mt-1">
                <span className="text-xs text-primary font-medium">{t.score}</span>
                <span className="text-xs text-amber-600 font-medium">{t.bonus}</span>
              </div>
            </div>
            <button type="button"
              className={'text-xs px-4 py-1.5 rounded-lg shrink-0 ' + (t.done ? 'bg-slate-100 text-slate-400 cursor-default' : 'bg-primary text-white hover:bg-cyan-600 transition')}>
              {t.done ? '已完成 ✓' : '一键打卡'}
            </button>
          </div>
        ))}
      </div>

      {/* 打卡榜单 */}
      <div className="card overflow-hidden mb-6">
        <div className="px-5 py-4 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100">
          <h3 className="font-semibold text-bingo-dark">🏆 本月打卡之星榜单</h3>
          <p className="text-xs text-slate-500 mt-0.5">打卡TOP3可获学霸额外加分 · 打卡之星可优先参与学霸评选</p>
        </div>
        <ul className="divide-y divide-slate-100">
          {[
            { rank: 1, name: '陈同学', days: 28, score: 680, badge: '🥇' },
            { rank: 2, name: '李同学', days: 25, score: 540, badge: '🥈' },
            { rank: 3, name: '王同学', days: 23, score: 480, badge: '🥉' },
            { rank: 4, name: '张同学', days: 20, score: 380, badge: '' },
          ].map((r, i) => (
            <li key={i} className="px-5 py-3 flex items-center gap-3">
              <span className="w-7 text-center font-bold text-slate-500">{r.badge || r.rank}</span>
              <span className="flex-1 text-sm font-medium text-slate-700">{r.name}</span>
              <span className="text-xs text-slate-400">{r.days}天打卡</span>
              <span className="font-bold text-primary text-sm">{r.score}分</span>
            </li>
          ))}
        </ul>
      </div>

      {/* 福利兑换 */}
      <div>
        <h3 className="font-semibold text-bingo-dark mb-3">学分兑换福利</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { name: '课程优惠券 ¥50', cost: '500学分', type: '课程抵扣', tag: '热门', scholar: false },
            { name: '科创学习资料包', cost: '200学分', type: '资料领取', tag: '', scholar: false },
            { name: '学霸证书相框', cost: '800学分', type: '学霸专属福利', tag: '限量', scholar: true },
            { name: '专属学霸勋章', cost: '学霸专享', type: '学霸专属福利', tag: '学霸专属', scholar: true },
            { name: '赛事报名折扣 9折', cost: '300学分', type: '权益兑换', tag: '', scholar: false },
          ].map((item, i) => (
            <div key={i} className={'card p-5 hover:shadow-md transition ' + (item.scholar ? 'border-amber-300/60 bg-amber-50/50' : 'hover:border-primary/30')}>
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-sm text-bingo-dark">{item.name}</h4>
                {item.tag && <span className={'text-[10px] px-2 py-0.5 rounded-full shrink-0 ml-2 ' + (item.scholar ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600')}>{item.tag}</span>}
              </div>
              <p className="text-xs text-slate-500 mb-3">{item.type}</p>
              <div className="flex items-center justify-between">
                <span className={'font-bold text-sm ' + (item.scholar ? 'text-amber-600' : 'text-primary')}>{item.cost}</span>
                <button type="button" className={'text-xs px-3 py-1.5 rounded-lg ' + (item.scholar ? 'bg-amber-500 text-white hover:bg-amber-600' : 'bg-primary text-white hover:bg-cyan-600')}>立即兑换</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showProgress && <ScholarProgressModal onClose={() => setShowProgress(false)} />}
    </div>
  )

  // ── 学习社栏目 ──
  if (section === 'column') return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <NavBreadcrumb label="学习社栏目" />
      <h2 className="text-2xl font-bold text-bingo-dark mb-1">学习社栏目</h2>
      <p className="text-slate-600 text-sm mb-6">AI科创专属学习专栏 · 学习打卡领学分，阅读优质内容获学霸加分</p>
      <div className="flex gap-2 mb-6 flex-wrap">
        {[['all', '全部'], ['启蒙专栏', '启蒙专栏(6-9岁)'], ['进阶专栏', '进阶专栏(10-14岁)'], ['高阶专栏', '高阶专栏(14-18岁)'], ['学霸经验', '⭐ 学霸经验']].map(([k, l]) => (
          <button key={k} onClick={() => setColumnFilter(k)}
            className={'px-4 py-1.5 rounded-full text-xs transition ' + (columnFilter === k ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200')}>{l}</button>
        ))}
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {COLUMN_ITEMS.filter(c => columnFilter === 'all' || c.cat === columnFilter).map((item, i) => (
          <div key={i} className={'card p-5 hover:shadow-md transition cursor-pointer ' + (item.cat === '学霸经验' ? 'border-amber-300/60 bg-amber-50/30 hover:border-amber-400' : 'hover:border-primary/30')}>
            <div className="flex items-start justify-between gap-2 mb-2">
              <span className={'text-[10px] px-2 py-0.5 rounded-full font-medium ' + (item.cat === '学霸经验' ? 'bg-amber-100 text-amber-700' : 'bg-primary/10 text-primary')}>{item.cat}</span>
              {item.tag && <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 shrink-0">{item.tag}</span>}
            </div>
            <h3 className="font-semibold text-bingo-dark text-sm mb-3 line-clamp-2">{item.title}</h3>
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>{item.views.toLocaleString()} 阅读</span>
              <div className="flex gap-3">
                <span className="text-primary font-medium">{item.score}</span>
                <span className="text-amber-600 font-medium">+1学霸加分</span>
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <button type="button" className="btn-primary text-xs px-3 py-1.5 flex-1">学习打卡领学分</button>
              <button type="button" className="border border-slate-200 rounded-lg text-xs px-3 py-1.5 text-slate-600 hover:bg-slate-50">收藏</button>
            </div>
          </div>
        ))}
      </div>
      <div className="card p-5 bg-amber-50 border-amber-200/60 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-semibold text-bingo-dark">⭐ 学霸投稿入口</p>
          <p className="text-sm text-slate-600 mt-0.5">学霸可投稿学习心得，审核通过后发布，获得额外学霸加分</p>
        </div>
        <button type="button" className="bg-amber-500 text-white text-sm px-5 py-2 rounded-xl hover:bg-amber-600 transition">立即投稿</button>
      </div>
    </div>
  )

  // ── 认证合作课程 ──
  if (section === 'certcourses') return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <NavBreadcrumb label="认证合作课程" />
      <h2 className="text-2xl font-bold text-bingo-dark mb-1">认证合作课程</h2>
      <p className="text-slate-600 text-sm mb-6">展示权威认证课程体系，突出证书含金量与升学价值</p>
      <div className="grid md:grid-cols-2 gap-5">
        {certifiedCourses.map((c, i) => (
          <div key={i} className="card p-6 hover:shadow-md hover:border-primary/30 transition">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <h3 className="font-bold text-bingo-dark">{c.name}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{c.age} · {c.cert}</p>
              </div>
              <span className="text-[10px] px-2 py-1 rounded-full bg-primary/10 text-primary font-medium shrink-0">权威认证</span>
            </div>
            <p className="text-sm text-slate-600 mb-3">{c.desc}</p>
            <p className="text-xs text-amber-600 font-medium mb-4">⭐ 完成本认证课程，可获得学霸评选加分，助力获评对应等级学霸</p>
            <div className="flex gap-2">
              <button type="button" className="btn-primary text-xs px-4 py-2">查看课程详情</button>
              <button onClick={() => setShowApply(true)} className="border border-amber-300 text-amber-700 text-xs px-4 py-2 rounded-lg hover:bg-amber-50 transition">报名学霸评选</button>
            </div>
          </div>
        ))}
      </div>
      {showApply && <ScholarApplyModal onClose={() => setShowApply(false)} />}
    </div>
  )

  // ── 精品课程 ──
  if (section === 'courses') return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <NavBreadcrumb label="精品课程" />
      <h2 className="text-2xl font-bold text-bingo-dark mb-1">精品课程</h2>
      <p className="text-slate-600 text-sm mb-6">AI学习社系统化精品课程，含研学营+特色认证课，完成课程可积累学霸评选学分</p>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {[
          { name: 'AI通识科学营', age: '8-12岁', content: 'AI通识·不插电实验·机器人实操', scholar: '启蒙学霸/进阶学霸', score: '+50学霸加分' },
          { name: '数据科学研学营', age: '12-16岁', content: '数据采集·可视化·报告撰写', scholar: '进阶学霸', score: '+80学霸加分' },
          { name: '机器学习启蒙营', age: '14-18岁', content: '模型训练·项目实操·成果答辩', scholar: '高阶学霸', score: '+120学霸加分' },
          { name: 'AIGC创意设计营', age: '10-15岁', content: 'AIGC工具·提示词工程·创意作品', scholar: '进阶学霸', score: '+60学霸加分' },
          { name: '机器人竞赛实训营', age: '12-18岁', content: '机器人搭建·编程·赛前冲刺', scholar: '高阶学霸', score: '+100学霸加分' },
          { name: '航空航天科创营', age: '10-16岁', content: '航天原理·模型制作·飞行实验', scholar: '进阶学霸', score: '+70学霸加分' },
        ].map((c, i) => (
          <div key={i} className="card p-6 hover:shadow-md hover:border-primary/30 transition">
            <h3 className="font-bold text-bingo-dark mb-1">{c.name}</h3>
            <p className="text-xs text-slate-500 mb-2">适配年龄：{c.age}</p>
            <p className="text-sm text-slate-600 mb-3">{c.content}</p>
            <p className="text-xs text-amber-600 font-medium mb-1">⭐ 对应学霸等级：{c.scholar}</p>
            <p className="text-xs text-emerald-600 font-medium mb-4">完成课程可获 {c.score}</p>
            <div className="flex gap-2">
              <button type="button" className="btn-primary text-xs px-4 py-2 flex-1">查看课程详情</button>
              <button onClick={() => setShowApply(true)} className="border border-amber-300 text-amber-700 text-xs px-3 py-2 rounded-lg hover:bg-amber-50 transition">报名学霸</button>
            </div>
          </div>
        ))}
      </div>
      {showApply && <ScholarApplyModal onClose={() => setShowApply(false)} />}
    </div>
  )

  // ── 报名咨询 ──
  if (section === 'consult') return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <NavBreadcrumb label="报名咨询" />
      <h2 className="text-2xl font-bold text-bingo-dark mb-6">报名咨询中心</h2>
      <div className="grid md:grid-cols-3 gap-5 mb-8">
        {[
          { icon: '💻', title: '在线报名', desc: '营班/课程/实训/学霸评选，精准信息收集，快速报名', action: '立即在线报名' },
          { icon: '📞', title: '电话咨询', desc: '400-XXX-XXXX · 工作日9:00-21:00 · 周末10:00-18:00', action: '一键拨号' },
          { icon: '📍', title: '线下体验', desc: '预约到店体验，可咨询学霸评选规则，领取学霸报名指南', action: '预约到店' },
        ].map((c, i) => (
          <div key={i} className="card p-6 hover:shadow-md hover:border-primary/30 transition">
            <div className="text-3xl mb-3">{c.icon}</div>
            <h3 className="font-semibold text-bingo-dark mb-1">{c.title}</h3>
            <p className="text-xs text-slate-500 mb-4">{c.desc}</p>
            <button type="button" className="btn-primary text-xs px-4 py-2 w-full">{c.action}</button>
          </div>
        ))}
      </div>
      <div className="grid sm:grid-cols-2 gap-5 mb-6">
        <div className="card p-6 bg-amber-50 border-amber-200/60">
          <h3 className="font-semibold text-bingo-dark mb-2">⭐ 学霸专属福利</h3>
          <ul className="text-sm text-slate-600 space-y-1">
            <li>· 报名学霸评选，可领取学习资料包</li>
            <li>· 获评学霸，可解锁对应等级专属福利</li>
            <li>· 邀请好友报名课程，双方均可获得学霸评选额外加分</li>
          </ul>
          <button onClick={() => setShowApply(true)} className="mt-3 bg-amber-500 text-white text-xs px-4 py-2 rounded-lg hover:bg-amber-600 transition">报名学霸评选</button>
        </div>
        <div className="card p-6">
          <h3 className="font-semibold text-bingo-dark mb-2">核心数据</h3>
          <div className="grid grid-cols-2 gap-3">
            {[['120+', '竞赛获奖学员'], ['35+', '名校升学学员'], ['20+', '合作高校机构'], ['86', '学霸评选获奖']].map(([num, label], i) => (
              <div key={i} className="text-center">
                <p className="text-xl font-bold text-primary">{num}</p>
                <p className="text-xs text-slate-500">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      {showApply && <ScholarApplyModal onClose={() => setShowApply(false)} />}
    </div>
  )

  // ── 缤果AI超级学霸（核心模块） ──
  if (section === 'scholar') return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <NavBreadcrumb label="缤果AI超级学霸" />

      {/* Banner */}
      <div className="card p-8 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 text-white mb-8 relative overflow-hidden">
        <div className="relative z-10">
          <p className="text-white/80 text-xs mb-1">Bingo Academy · 荣誉体系</p>
          <h2 className="text-3xl font-bold mb-2">⭐ 缤果AI超级学霸</h2>
          <p className="text-white/90 mb-4">争当缤果超级学霸，解锁荣誉与成长 · 学习-参与-获荣誉-促提升闭环体系</p>
          <div className="flex flex-wrap gap-3">
            <button onClick={() => setShowApply(true)} className="bg-white text-amber-600 font-bold px-6 py-2.5 rounded-xl text-sm hover:bg-white/90 transition">⭐ 立即报名评选</button>
            <button onClick={() => setShowProgress(true)} className="bg-white/20 text-white px-5 py-2.5 rounded-xl text-sm hover:bg-white/30 transition">查询我的进度</button>
          </div>
        </div>
        <div className="absolute right-6 bottom-4 text-8xl opacity-20 select-none">🏆</div>
      </div>

      {/* 学霸等级体系 */}
      <section className="mb-8">
        <h3 className="font-bold text-bingo-dark text-lg mb-4">学霸等级体系</h3>
        <div className="flex gap-2 mb-5 flex-wrap">
          {SCHOLAR_LEVELS.map(l => (
            <button key={l.id} onClick={() => setScholarLevel(l.id)}
              className={'px-4 py-1.5 rounded-full text-sm font-medium transition ' + (scholarLevel === l.id ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200')}>
              {l.icon} {l.level}
            </button>
          ))}
        </div>
        {(() => {
          const lv = SCHOLAR_LEVELS.find(l => l.id === scholarLevel)
          return (
            <div className={'card p-6 border ' + lv.lightColor}>
              <div className="flex flex-wrap gap-4 items-start">
                <div className={'w-16 h-16 rounded-2xl bg-gradient-to-br ' + lv.color + ' flex items-center justify-center text-3xl text-white shrink-0'}>{lv.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1 flex-wrap">
                    <h4 className="font-bold text-bingo-dark text-xl">{lv.level}</h4>
                    <span className={'text-xs px-3 py-1 rounded-full font-medium ' + lv.tagColor}>适配 {lv.age}</span>
                    <span className="text-xs text-slate-500">学分门槛：{lv.scoreReq}分</span>
                  </div>
                  <p className="text-sm text-slate-600 mb-4">{lv.desc}</p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-semibold text-slate-400 mb-2">评选要求</p>
                      <ul className="space-y-1.5">
                        {lv.extraReq.map((r, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm text-slate-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />{r}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-400 mb-2">荣誉权益</p>
                      <ul className="space-y-1.5">
                        {lv.perks.map((p, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm text-slate-700">
                            <span className="text-amber-500 shrink-0">✦</span>{p}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button onClick={() => setShowApply(true)} className="btn-primary text-xs px-5 py-2">报名此等级评选</button>
                    <button onClick={() => setSection('checkin')} className="border border-primary text-primary text-xs px-4 py-2 rounded-lg hover:bg-primary/10 transition">去打卡攒学分</button>
                  </div>
                </div>
              </div>
            </div>
          )
        })()}
      </section>

      {/* 评选规则 */}
      <section className="mb-8">
        <h3 className="font-bold text-bingo-dark text-lg mb-4">评选规则</h3>
        <div className="grid md:grid-cols-2 gap-4">
          {[
            { title: '基础条件', icon: '📋', content: '按时完成对应阶段精品课程/认证合作课程学习，无旷课、缺课记录' },
            { title: '核心要求', icon: '🎯', content: '社群打卡学分累计达标（按学霸等级设定不同分数门槛），打卡质量合格（实操打卡需提交有效作品）' },
            { title: '额外加分', icon: '⬆️', content: '积极参与学习社栏目投稿、向大咖提问互动、参与竞赛/科研实训项目，可获额外加分缩短评选周期' },
            { title: '评选周期', icon: '📅', content: '每月评选1次（启蒙/进阶/高阶学霸），每季度评选1次（缤果超级学霸）。评选结束后3天内公示名单' },
          ].map((rule, i) => (
            <div key={i} className="card p-5 hover:shadow-md hover:border-primary/30 transition">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{rule.icon}</span>
                <h4 className="font-semibold text-bingo-dark">{rule.title}</h4>
              </div>
              <p className="text-sm text-slate-600">{rule.content}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 学霸榜单 */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-bingo-dark text-lg">学霸榜单</h3>
          <button onClick={() => setShowApply(true)} className="text-xs text-primary hover:underline">我要上榜 →</button>
        </div>
        <div className="card overflow-hidden mb-4">
          <div className="px-5 py-4 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100">
            <p className="font-semibold text-bingo-dark">本月学霸榜单</p>
          </div>
          <ul className="divide-y divide-slate-100">
            {SCHOLAR_LIST.map((s, i) => (
              <li key={i} className="px-5 py-4 flex items-center gap-3 hover:bg-slate-50 transition cursor-pointer">
                <span className="w-7 text-xl">{['🥇', '🥈', '🥉', '', ''][i] || s.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm text-bingo-dark">{s.name}</span>
                    <span className={'text-[10px] px-2 py-0.5 rounded-full ' + (s.level === '缤果超级学霸' ? 'bg-amber-100 text-amber-700' : 'bg-primary/10 text-primary')}>{s.level}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{s.camp} · {s.result}</p>
                </div>
                <span className="font-bold text-primary text-sm shrink-0">{s.score}分</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 超级学霸风采 */}
        <div className="card p-6 bg-amber-50 border-amber-200/60">
          <h4 className="font-semibold text-bingo-dark mb-3">⭐ 超级学霸风采</h4>
          <div className="grid md:grid-cols-2 gap-4">
            {SCHOLAR_LIST.filter(s => s.level === '缤果超级学霸').map((s, i) => (
              <div key={i} className="bg-white rounded-xl p-5 border border-amber-200/60">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-lg">{s.name.charAt(0)}</div>
                  <div>
                    <p className="font-bold text-bingo-dark">{s.name}</p>
                    <p className="text-xs text-amber-600 font-medium">⭐ {s.level}</p>
                  </div>
                </div>
                <p className="text-sm text-slate-600 mb-2">{s.result}</p>
                <p className="text-xs text-slate-400">{s.camp} · 学分 {s.score}</p>
                <div className="mt-3 flex gap-2">
                  <button type="button" className="text-xs px-3 py-1.5 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition">查看学霸详情</button>
                  <button onClick={() => setShowApply(true)} className="text-xs px-3 py-1.5 border border-amber-300 text-amber-700 rounded-lg hover:bg-amber-50 transition">成为同款学霸</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 营销引导 */}
      <section className="card p-6 bg-gradient-to-r from-primary/5 to-cyan-50 border-primary/20">
        <h3 className="font-semibold text-bingo-dark mb-3">参与学霸评选，需要做什么？</h3>
        <div className="grid sm:grid-cols-3 gap-4 mb-4">
          {[
            { step: '1', title: '报名精品课程/认证课程', desc: '选择适合年龄段的课程，完成系统学习' },
            { step: '2', title: '社群打卡积累学分', desc: '每日打卡，完成学习任务，积累学霸加分' },
            { step: '3', title: '报名学霸评选', desc: '达到门槛后报名评选，等待公示获奖名单' },
          ].map((s, i) => (
            <div key={i} className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold shrink-0">{s.step}</div>
              <div>
                <p className="font-medium text-sm text-bingo-dark">{s.title}</p>
                <p className="text-xs text-slate-500 mt-0.5">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-3">
          <button onClick={() => setShowApply(true)} className="btn-primary text-sm px-6 py-2.5">⭐ 立即报名评选</button>
          <button onClick={() => setSection('courses')} className="border border-primary text-primary text-sm px-5 py-2.5 rounded-xl hover:bg-primary/10 transition">浏览精品课程</button>
          <button onClick={() => setSection('checkin')} className="border border-slate-200 text-slate-600 text-sm px-5 py-2.5 rounded-xl hover:bg-slate-50 transition">去打卡领学分</button>
        </div>
      </section>

      {showApply && <ScholarApplyModal onClose={() => setShowApply(false)} />}
      {showProgress && <ScholarProgressModal onClose={() => setShowProgress(false)} />}
    </div>
  )

  // ── 科研实训（简化入口，指向 research） ──
  if (section === 'training') return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <NavBreadcrumb label="科研实训" />
      <h2 className="text-2xl font-bold text-bingo-dark mb-1">科研实训项目</h2>
      <p className="text-slate-600 text-sm mb-6">高校联动，深度解锁科创研究能力 · 参与实训可获高额学霸评选加分</p>
      <div className="grid md:grid-cols-2 gap-5 mb-6">
        {[
          { name: '机器学习课题实训', age: '14-18岁', bonus: '+120学霸加分', match: '高阶/超级学霸' },
          { name: '数据可视化分析实训', age: '13-18岁', bonus: '+100学霸加分', match: '进阶/高阶学霸' },
          { name: 'AI智能体设计课题', age: '14-18岁', bonus: '+150学霸加分', match: '高阶/超级学霸' },
          { name: '科创竞赛课题定制', age: '14-18岁', bonus: '+200学霸加分', match: '超级学霸专属加成' },
        ].map((t, i) => (
          <div key={i} className="card p-5 hover:shadow-md hover:border-primary/30 transition">
            <h3 className="font-bold text-bingo-dark mb-1">{t.name}</h3>
            <p className="text-xs text-slate-500 mb-2">适配年龄：{t.age}</p>
            <p className="text-xs text-amber-600 font-medium mb-1">⭐ {t.bonus} · 对应学霸：{t.match}</p>
            <p className="text-xs text-slate-500 mb-3">优秀学员可直接获评高阶/超级学霸，缤果学霸可优先报名实训</p>
            <Link to="/research" className="btn-primary text-xs px-4 py-2 inline-block">查看实训详情</Link>
          </div>
        ))}
      </div>
      <div className="card p-5 bg-amber-50 border-amber-200/60">
        <p className="font-semibold text-bingo-dark mb-1">⭐ 缤果学霸专属权益</p>
        <p className="text-sm text-slate-600">缤果高阶/超级学霸可优先报名科研实训项目，无需额外筛选，直接锁定名额</p>
      </div>
    </div>
  )

  return null
}
