# ESP32 Atlas · ESP32 开源项目地图

> 按目标找项目、按证据选芯片、按路线学到底。
> Find projects by goal, choose chips with evidence, and learn along a real path.

[![Live](https://img.shields.io/badge/live-esp32--atlas.changyuansex.workers.dev-B8F36B?style=flat-square)](https://esp32-atlas.changyuansex.workers.dev)
[![Next.js](https://img.shields.io/badge/Next.js-15.5-000?style=flat-square&logo=nextdotjs)](https://nextjs.org)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers%20%2B%20D1-F38020?style=flat-square&logo=cloudflare)](https://workers.cloudflare.com)
[![Tests](https://img.shields.io/badge/tests-73%20unit%20%2B%2065%20e2e-63D8C5?style=flat-square)](#测试与验收)
[![License](https://img.shields.io/badge/license-MIT-9BAFA8?style=flat-square)](LICENSE)

**简体中文** · [English](README.en.md)

---

## 这是什么

ESP32 Atlas 不是又一个「awesome list」。它回答四个具体问题：

1. **我想做 AI 语音助手 / 灯带 / 墨水屏天气站 / 智能家居设备，从哪个项目开始？**
2. **哪些仓库适配我的芯片、框架、技能水平和硬件预算？**
3. **这些项目现在真的还在维护吗？**（区分总 Stars、最近提交、版本发布、Issue 积压）
4. **我该按什么顺序学，才算真的做出来？**

为此它把 GitHub 的**真实指标**、人工整理的**项目指南**、**芯片规格**和**学习路线**放在同一个可比较的目录里，并明确标注哪些数字是抓取的、哪些是编辑判断、哪些还没核验。

![首页](docs/screenshots/home-desktop.png)

---

## 核心能力

| 能力 | 实现方式 | 可信度标注 |
| --- | --- | --- |
| 按目标找项目 | 6 个目标入口 + 9 个类别筛选，URL 完整保存筛选状态 | 结果为空时解释原因，不填充假数据 |
| 项目可比较 | 芯片兼容性、框架、难度、文档完整度、演示可用度、Stars/Forks/Issues、最近 push、最近 release、许可证 | Stars 等来自 GitHub API；难度与评分为编辑评估并在页面注明 |
| 开源活跃度雷达 | 总 Stars、近 60/90 天提交、180 天内发版、Issue/Stars 比值分开展示 | **星标增长只在有历史快照时才显示**，否则显示「趋势数据积累中」 |
| 实战学习路线 | 10 条路线，每阶段含目标、前置知识、资源、粗略耗时与**可观察的完成标准** | 时间明确标注为粗略估计 |
| 芯片硬件指南 | ESP32 / S2 / S3 / C3 / C6 / H2 / P4 对比表 + 卡片 | 引用 Espressif 官方页面；无法确认的字段标「待核验」 |
| 教程中心 | 46 条中英文教程与官方文档，含语言/难度/来源/最后核验时间 | 每条链接写入前实测返回 200 |
| 收藏清单 | localStorage 持久化，状态（未开始/进行中/已完成）+ 备注 + JSON 导出/导入 | 页面明示「只存在此浏览器」 |
| 项目提交 | GitHub URL 校验 → 仓库真实性核查 → 去重 → 待审核队列 | 通过前不会出现在任何榜单 |
| 管理后台 | PBKDF2 密码 + D1 会话 + HttpOnly Cookie；审核提交、触发同步、查看同步异常 | 服务端校验，隐藏入口不是权限控制 |
| 中英文切换 | Cookie 持久化，覆盖所有页面文案、空状态、图表标签 | 仓库名/代码/技术标识保持原样 |

### 界面

| 探索（筛选 + 排序） | 项目详情（真实指标 + 来源） |
| --- | --- |
| ![explore](docs/screenshots/explore-desktop.png) | ![project](docs/screenshots/project-desktop.png) |

| 芯片硬件对比 | 趋势雷达 |
| --- | --- |
| ![hardware](docs/screenshots/hardware-desktop.png) | ![radar](docs/screenshots/radar-desktop.png) |

| 学习路线 | 教程中心 |
| --- | --- |
| ![paths](docs/screenshots/paths-desktop.png) | ![tutorials](docs/screenshots/tutorials-desktop.png) |

| 移动端首页 | 移动端探索 |
| --- | --- |
| ![mobile home](docs/screenshots/home-mobile.png) | ![mobile explore](docs/screenshots/explore-mobile.png) |

> 所有截图来自本地运行的生产构建（`opennextjs-cloudflare preview`，真实 workerd 运行时 + 本地 D1），不是设计稿。

---

## 在线演示

<https://esp32-atlas.changyuansex.workers.dev>

生产环境已实测：`/`、`/explore`、`/projects/[slug]`、`/paths`、`/paths/[slug]`、`/tutorials`、`/hardware`、`/radar`、`/collections`、`/submit`、`/admin`、`/about`、`/robots.txt`、`/sitemap.xml` 全部返回 200，未知项目返回 404。

---

## 技术栈

```
Next.js 15.5 (App Router, RSC)  +  React 19  +  TypeScript 5.9
Tailwind CSS v4（设计 Token 集中在 app/globals.css）
Cloudflare Workers（@opennextjs/cloudflare 1.20）
Cloudflare D1（SQLite）—— 全部数据访问走 ? 占位符
Zod 4（输入校验）· Web Crypto（PBKDF2 密码哈希）
Vitest 3（单元/内容完整性）· Playwright 1.56（桌面 + 移动端 E2E）
```

**为什么不是纯静态站？** 因为需要：服务端持有 GitHub Token、真实数据库、管理后台鉴权、提交审核队列、同步任务记录。改用 GitHub Pages 就要把这些全部砍掉，与「数据可信 + 可持续维护」的目标冲突。

### 目录结构

```
esp32-atlas/
├─ app/                      # 路由（全部为 Server Component，按请求读 D1）
│  ├─ page.tsx               # 首页：目标入口 / 本周热门 / 近期活跃 / 新手 / 新收录
│  ├─ explore/               # 探索：筛选、排序、分页，状态全在 URL
│  ├─ projects/[slug]/       # 项目详情：指标 + 指南 + 相似项目 + 增长
│  ├─ paths/ , paths/[slug]/ # 10 条学习路线
│  ├─ tutorials/             # 教程中心（按语言/难度筛选）
│  ├─ hardware/              # 芯片对比表 + 规格卡
│  ├─ radar/                 # 趋势雷达
│  ├─ collections/           # 本地收藏清单
│  ├─ submit/                # 提交项目
│  ├─ admin/                 # 管理后台（服务端鉴权）
│  ├─ api/{auth,submit,admin} # Route Handlers
│  ├─ sitemap.ts, robots.ts  # SEO
│  └─ globals.css            # 设计 Token 与组件类
├─ src/
│  ├─ content/               # 人工策划内容（curation / guides / paths / tutorials / chips）
│  ├─ lib/
│  │  ├─ db/                 # 驱动抽象（D1 + node:sqlite）、查询封装
│  │  ├─ search.ts           # 纯函数：筛选、评分、排序（有单测）
│  │  ├─ sync.ts             # GitHub 同步引擎（限流退避 + 快照）
│  │  ├─ auth.ts/password.ts # 会话 + PBKDF2
│  │  ├─ i18n.ts             # 全部界面文案（中/英）
│  │  └─ collections.ts      # localStorage 清单
│  └─ components/            # 卡片、筛选面板、封面生成、偏好控件…
├─ migrations/               # 0001_init.sql + 0002_seed.sql（自动生成）
├─ scripts/                  # fetch-github / build-seed / create-admin
├─ tests/                    # Vitest
├─ e2e/                      # Playwright（desktop + mobile）
└─ docs/                     # 安全审查、架构、部署、截图
```

---

## 本地运行

```bash
# 1. 安装依赖
npm install

# 2. 建本地数据库并灌入核验过的数据
npm run db:migrate:local      # 建表
npm run db:seed               # 从 src/content + src/data 生成 migrations/0002_seed.sql
npm run db:migrate:local      # 应用 seed

# 3. 起开发服务器（D1 由 Miniflare 模拟）
npm run dev                   # http://localhost:3100
```

> Windows 提示：如果 Miniflare 报 `CreateDirectory: 拒绝访问`，把 `TEMP` 指到可写目录即可（本项目在 `.tmp-work/` 里做过验证）。

### 生产构建

```bash
npm run build                 # next build（类型检查 + 优化构建）
npm run preview:cf            # 本地用 workerd 跑 Workers 产物（最接近线上）
npx opennextjs-cloudflare build && npx opennextjs-cloudflare deploy   # 部署
```

---

## 环境变量

复制 `.env.example`：

| 变量 | 用途 | 是否必需 |
| --- | --- | --- |
| `GITHUB_TOKEN` | 服务端同步 GitHub 指标（5000 次/小时；留空则匿名 60 次/小时） | 推荐 |
| `SYNC_TOKEN` | 定时任务调用 `POST /api/admin/sync` 的 Bearer Token | 生产必需 |
| `SITE_URL` | sitemap / robots / OG 绝对地址 | 生产必需 |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | 仅 `scripts/create-admin.ts` 使用，不进前端构建 | 建管理员时 |

生产环境用 `wrangler secret put`（本项目已配置 `GITHUB_TOKEN` 与 `SYNC_TOKEN`）。**任何密钥都不会进入浏览器 bundle**。

---

## 数据来源与真实性规则

这是本项目最重要的设计约束，也是它区别于普通导航站的地方：

1. **仓库指标只来自 GitHub REST API**，由服务端同步后写入 D1 缓存。页面渲染**从不**实时请求 GitHub —— 因此 GitHub 挂掉或限流时站点照常可用。
2. **编辑内容与抓取数据分表存储。** 同步任务的 `UPDATE` 语句里不包含 `category`、`difficulty`、`doc_score`、`demo_score`、`summary_i18n` 等字段，从机制上保证「同步不会覆盖人工整理」。
3. **星标增长必须有历史快照才显示。** 每次同步写一条 `repository_snapshots`；查不到足够旧的快照时，UI 显示「趋势数据积累中」，绝不编造周增长。
4. **同步失败保留旧数据并标脏。** 404/限流/网络错误只把 `sync_status` 置为 `stale` 并在页面和管理后台提示，不会清空。
5. **教程只存标题 + 一句话学习目标 + 原始链接**，不复制第三方正文；每条都带 `verified_at`（写入前实测 HTTP 200）。
6. **芯片规格引用 Espressif 官方页面**，无法确认的字段（如 P4 的部分参数）标记「待核验」。
7. **没有 Demo 假数据混入排行榜。** 种子数据的 30 个仓库全部来自真实 API 抓取（`src/data/github-snapshot.json` 记录了抓取时间）。

### 综合推荐排序规则

见 [`docs/RANKING.md`](docs/RANKING.md)。摘要：近期活跃 30 分 + log10(Stars) 上限 25 + 文档完整度 12 + 演示可用度 8 + 新手友好 8 + 近期发版 6 + 编辑推荐 6 + 关键词命中 14/词；归档仓库 −30。**Stars 永远不是唯一依据**，用户可一键切换「按 Stars 排序」。

---

## 测试与验收

全部命令与真实结果（2026-10-26 实测）：

```bash
npm run typecheck   # tsc --noEmit                     → 通过，0 error
npm run lint        # eslint .                        → 通过，0 error 0 warning
npm test            # vitest run                      → 5 files, 73 tests 全通过
npm run build       # next build                      → 成功，19 条路由
npm run e2e         # playwright test（desktop+mobile） → 65 passed, 1 skipped
```

- **单元测试**覆盖：筛选/评分/排序纯函数、URL 参数往返、Zod 校验（含 SSRF 用例）、PBKDF2 哈希与常量时间比较、日期与数字本地化、内容完整性（跨表引用、双语文案、评分边界、芯片 slug 合法性）。
- **E2E 覆盖**：目标入口跳转、筛选 URL 可分享、空结果清除、项目详情指标与来源链接、无快照时不显示增长、404、语言切换刷新后保留、收藏持久化与状态/备注往返、提交（非 GitHub URL / 不存在仓库 / 重复仓库）、匿名访问 admin API 返回 401、robots 屏蔽 /admin、移动端 9 个页面无横向溢出、封面无破图、主要按钮在视口内可点。
- **安全审查**：见 [`docs/SECURITY.md`](docs/SECURITY.md)（含未修复项与原因）。

### 设计系统抽查（真实计算值）

| 项 | 值 |
| --- | --- |
| 深色背景 / 主文字对比度 | 16.87 : 1 |
| 次级文字对比度 | 8.26 : 1 |
| 浅色主题对比度 | 16.54 : 1 |
| 首个 Tab 焦点 | 「跳到主要内容」跳转链接，`2px solid #63D8C5` 可见焦点环 |
| `prefers-reduced-motion` | 过渡时长降为 ~0（实测 1e-06s） |

---

## 已知限制

1. **定时同步未启用。** Cloudflare 免费版每账号上限 5 个 Cron Trigger，该账号已用满，因此 `wrangler.jsonc` 中没有 `triggers` 配置。替代方案：后台点「立即同步 GitHub」，或从外部调度器带 `SYNC_TOKEN` 调用 `POST /api/admin/sync`（已实测可用）。
2. **搜索是关键词 + 标签匹配**，不是语义检索。
3. **收录是精选而非全量**：30 个经人工核验的仓库，而不是 ESP32 生态的全部仓库。
4. **收藏仅本地**，无账号与云同步（页面已明示，并提供导出/导入）。
5. **依赖审计残留**：`next` 间接依赖的 `postcss` 有上游 advisory，修复需要跨大版本升级 Next（会破坏当前构建）。已记录在安全文档，未强升。
6. **合成封面图**：为避免第三方图片版权与失效问题，封面是按仓库名确定性生成的 PCB 风格 SVG，而不是真实项目截图。

---

## 参与贡献

- 提交新项目：站内 `/submit`，或直接提 Issue（需包含公开 GitHub 链接与一句话定位）。
- 修正内容：`src/content/*.ts` 是唯一的人工内容来源，改完跑 `npm run db:seed && npm run db:migrate:local`。
- 报告数据错误：请附上页面 URL 与正确数值的来源链接。

细节见 [`CONTRIBUTING.md`](CONTRIBUTING.md)。

---

## 许可

代码以 [MIT](LICENSE) 许可开源。收录的第三方项目、教程与文档版权归各自作者所有，本站仅提供链接与编辑性描述。

## 联系

X / Twitter：[@0xkillcoin](https://x.com/0xkillcoin)

---

<sub>ESP32 Atlas 是独立社区项目，与 Espressif Systems 无隶属关系。ESP32 是 Espressif Systems 的商标。</sub>
