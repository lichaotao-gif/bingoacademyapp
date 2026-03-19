# BingoAcademy 项目全貌

> 最后更新：2026-03-03

---

## 一、技术架构

### 核心设计：单 Vite 实例，双应用

```
bingoacademyapp/
├── src/               ← C端（用户侧）React + JSX + Tailwind CSS v4
├── admin/src/         ← 管理后台 React + TypeScript + Ant Design Pro
├── vite.config.js     ← 单入口，运行时靠路径分流
└── vercel.json        ← Vercel 部署配置
```

**分流逻辑**：`src/main.jsx` 用 `window.location.pathname.startsWith('/admin')` 在运行时决定加载哪套 UI，两套应用各有独立 Router，通过 `lazy()` + `Suspense` 做代码分割。

### 技术栈对比

| 层 | C端 | Admin端 |
|---|---|---|
| 框架 | React 18 + JSX | React 18 + TypeScript |
| 路由 | React Router v6 | React Router v6 |
| 样式 | Tailwind CSS v4 + 自定义 `@theme` | Ant Design Pro + 主题 token |
| 数据 | 全部硬编码 mock | `admin/src/api/` 接真实后端 |
| 后端代理 | 无 | Vite proxy → `localhost:8080` |
| 持久化 | localStorage（仅社群板块） | 真实 API |
| 部署 | Vercel | 同上 |

---

## 二、目录结构

```
bingoacademyapp/
├── src/
│   ├── main.jsx              ← 双应用分流入口
│   ├── App.jsx               ← C端全部路由定义
│   ├── components/
│   │   ├── Navbar.jsx        ← 顶部导航栏
│   │   ├── Footer.jsx        ← 底部栏
│   │   ├── FloatingBar.jsx   ← 悬浮操作栏
│   │   └── ChatPopup.jsx     ← 客服聊天弹窗
│   ├── config/
│   │   └── nav.js            ← 导航数据配置
│   ├── pages/                ← 45个页面组件（详见下方）
│   └── document/             ← 项目文档（本目录）
│
├── admin/
│   ├── index.html
│   └── src/
│       ├── main.tsx          ← Admin独立入口
│       ├── App.tsx           ← Admin路由
│       ├── layouts/
│       │   └── BasicLayout.tsx  ← ProLayout 框架
│       ├── pages/            ← 14个管理功能页面
│       ├── api/              ← 12个 API 模块
│       ├── config/
│       │   └── theme.ts      ← Ant Design 主题 token
│       └── utils/
│           ├── auth.ts       ← 认证工具
│           ├── format.ts     ← 格式化工具
│           └── request.ts    ← HTTP 请求封装
│
├── public/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── vercel.json
```

---

## 三、C端页面与功能（45个页面）

### 1. 首页
| 路由 | 文件 | 状态 |
|---|---|---|
| `/` | `Home.jsx` | 完整 |

**功能**：Banner 轮播、平台核心数据展示、6大核心板块入口导航（课程/赛事/研学/成长/认证/社群）。

---

### 2. 课程体系
| 路由 | 文件 | 状态 |
|---|---|---|
| `/courses` | `Courses.jsx` | mock 完整 |
| `/courses/:id` | `CourseDetail.jsx` | mock 完整 |
| `/courses/:id/checkout` | `CourseCheckout.jsx` | mock 完整 |
| `/courses/:id/payment` | `CoursePayment.jsx` | UI完整，接口 TODO |
| `/courses/:id/success` | `CourseSuccess.jsx` | mock 完整 |

**功能**：课程列表/分类筛选 → 课程详情（大纲/讲师/评价）→ 结算 → 支付 → 完成。

---

### 3. 赛事挑战
| 路由 | 文件 | 状态 |
|---|---|---|
| `/competitions` | `Competitions.jsx` | mock 完整 |
| `/competitions/:id` | `CompetitionDetail.jsx` | mock 完整 |
| `/competitions/:id/register` | `CompetitionRegister.jsx` | mock 完整 |
| `/competitions/:id/payment` | `CompetitionPayment.jsx` | UI完整，接口 TODO |
| `/competitions/:id/success` | `CompetitionSuccess.jsx` | mock 完整 |

**功能**：赛事列表 → 赛事详情 → 报名表单 → 支付 → 报名成功。

---

### 4. 科创研学
| 路由 | 文件 | 状态 |
|---|---|---|
| `/study-tours` | `StudyTours.jsx` | mock 完整 |
| `/study-tours/:id` | `StudyTourDetail.jsx` | mock 完整 |
| `/study-tours/:id/apply` | `StudyTourApply.jsx` | mock 完整 |
| `/study-tours/:id/confirm` | `StudyTourConfirm.jsx` | mock 完整 |
| `/study-tours/:id/payment` | `StudyTourPayment.jsx` | UI完整，接口 TODO |
| `/study-tours/:id/success` | `StudyTourSuccess.jsx` | mock 完整 |

**功能**：研学项目列表 → 详情 → 申请表 → 确认 → 支付 → 成功。

---

### 5. 成果展示
| 路由 | 文件 | 状态 |
|---|---|---|
| `/showcase` | `Showcase.jsx` | 完整（荣誉/公益入口） |
| `/showcase/works` | `ShowcaseWorks.jsx` | **占位骨架** |
| `/showcase/awards` | `ShowcaseAwards.jsx` | **占位骨架** |
| `/showcase/school` | `ShowcaseSchool.jsx` | **占位骨架** |
| `/showcase/materials` | `ShowcaseMaterials.jsx` | **占位骨架** |
| `/showcase/venture/:id` | `ShowcaseCase.jsx` | 5个硬编码案例 |
| `/showcase/award/:id` | `ShowcaseCase.jsx` | 5个硬编码案例 |

---

### 6. 商城
| 路由 | 文件 | 状态 |
|---|---|---|
| `/shop` | `Shop.jsx` | mock 完整 |
| `/shop/:id` | `ShopDetail.jsx` | mock 完整 |
| `/cart` | `Cart.jsx` | UI完整，接口 TODO |

---

### 7. 个人中心
| 路由 | 文件 | 状态 |
|---|---|---|
| `/profile` | `Profile.jsx` | mock，大量 TODO |
| `/profile/courses` | `ProfileCourses.jsx` | mock |
| `/profile/competitions` | `ProfileCompetitions.jsx` | mock |
| `/profile/orders` | `ProfileOrders.jsx` | mock |
| `/profile/certificates` | `ProfileCertificates.jsx` | mock |
| `/profile/settings` | `ProfileSettings.jsx` | UI完整，接口 TODO |
| `/profile/wallet` | `ProfileWallet.jsx` | mock |

---

### 8. 认证 / 社群 / 职业
| 路由 | 文件 | 状态 |
|---|---|---|
| `/certification` | `Certification.jsx` | 静态内容（四级认证体系介绍） |
| `/community` | `Community.jsx` | localStorage 模拟持久化 |
| `/career` | `Career.jsx` | 静态内容 |

---

### 9. 加盟合作
| 路由 | 文件 | 状态 |
|---|---|---|
| `/franchise` | `Franchise.jsx` | 表单提交，接口 TODO |
| `/event-organizer` | `EventOrganizer.jsx` | 表单提交，接口 TODO |
| `/event-whitelist` | `EventWhitelist.jsx` | 表单提交，接口 TODO |

---

### 10. AI 工具库
| 路由 | 文件 | 状态 |
|---|---|---|
| `/tools` | `Tools.jsx` | 4个工具（硬编码） |
| `/tools/:id` | `ToolDetail.jsx` | 工具详情，购买 TODO |

**现有工具**：错题帮AI、作业批改助手、梅林口语、学习报告生成器。

---

### 11. 账户系统
| 路由 | 文件 | 状态 |
|---|---|---|
| `/login` | `Login.jsx` | UI完整（验证码/密码/微信），接口 TODO |
| `/register` | `Register.jsx` | UI完整，接口 TODO |
| `/forgot-password` | `ForgotPassword.jsx` | **占位**，待接短信服务 |

**登录支持的身份**：学生/家长、教师/机构、企业。

---

### 12. 旧路由重定向
| 旧路由 | 重定向目标 |
|---|---|
| `/growth` | `/courses#growth-plan` |
| `/charity` | `/showcase#honor` |

---

## 四、Admin 后台模块（14个管理功能）

| 模块 | 路由 | API 文件 |
|---|---|---|
| 仪表盘 | `/admin` | `dashboard.ts` |
| 用户管理 | `/admin/users` | `users.ts` |
| 课程管理 | `/admin/courses` | `courses.ts` |
| 赛事管理 | `/admin/competitions` | `competitions.ts` |
| 研学管理 | `/admin/study-tours` | `study-tours.ts` |
| 商城管理 | `/admin/shop` | `shop.ts` |
| 订单管理 | `/admin/orders` | `orders.ts` |
| 证书管理 | `/admin/certificates` | `certificates.ts` |
| 社群管理 | `/admin/community` | `community.ts` |
| 加盟管理 | `/admin/franchise` | `franchise.ts` |
| AI工具管理 | `/admin/tools` | `tools.ts` |
| 系统设置 | `/admin/settings` | `settings.ts` |

Admin 端通过 `admin/src/utils/request.ts` 统一封装 HTTP 请求，Vite dev server proxy 转发至 `http://localhost:8080`。

---

## 五、当前核心问题

### 问题一：C端数据层是纯 mock
45个页面的数据全部硬编码在组件内，没有任何真实 API 调用。Admin 有 API 层，但两端尚未打通。

### 问题二：支付流程是空壳
课程、赛事、研学的支付页 UI 完整，但 `onClick` 回调全是 `console.log` 或空函数，无真实支付集成。

### 问题三：认证系统零实现
登录/注册 UI 完整，但接口全是 TODO。没有 token 管理，没有路由守卫，任何人都能访问"需登录"的页面。

### 问题四：持久化逻辑孤岛
社群模块用 `localStorage` 模拟帖子持久化，是 C 端唯一的"数据持久化"，无法跨设备、跨用户。

### 问题五：Showcase 子页面是空壳
`ShowcaseWorks`、`ShowcaseAwards`、`ShowcaseSchool`、`ShowcaseMaterials` 四页只有标题和占位文字，无任何内容。

---

## 六、一句话定位

> 这是一个完整度很高的 **UI 原型**。Admin 后台有 API 层骨架，C 端是纯静态展示，两端尚未真正打通，核心业务流程（支付、认证、数据）都停在 UI 层面。
