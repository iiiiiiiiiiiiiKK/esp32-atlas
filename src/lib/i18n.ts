import type { I18nText, Lang } from "./types";

export const LANGS: Lang[] = ["zh", "en"];
export const DEFAULT_LANG: Lang = "zh";

export function isLang(v: unknown): v is Lang {
  return v === "zh" || v === "en";
}

/** Picks the localized string with a deterministic fallback chain. */
export function t(text: I18nText | null | undefined, lang: Lang): string {
  if (!text) return "";
  return text[lang] || text.zh || text.en || "";
}

type Dict = Record<string, I18nText>;

export const dict = {
  brandTagline: {
    zh: "ESP32 开源项目地图 — 按目标找项目、按证据选硬件、按路线学到底",
    en: "The ESP32 project atlas — find projects by goal, pick hardware with evidence, learn along a real path",
  },
  navHome: { zh: "首页", en: "Home" },
  navExplore: { zh: "探索项目", en: "Explore" },
  navPaths: { zh: "学习路线", en: "Paths" },
  navTutorials: { zh: "教程中心", en: "Tutorials" },
  navHardware: { zh: "芯片硬件", en: "Hardware" },
  navRadar: { zh: "趋势雷达", en: "Radar" },
  navCollections: { zh: "我的清单", en: "Collections" },
  navSubmit: { zh: "提交项目", en: "Submit" },
  navAdmin: { zh: "管理", en: "Admin" },

  searchPlaceholder: {
    zh: "搜索项目、教程、芯片，例如「AI 语音助手」「电子墨水屏」",
    en: "Search projects, tutorials, chips — try “AI voice assistant” or “e-paper display”",
  },
  searchAction: { zh: "搜索", en: "Search" },
  searchHint: { zh: "支持仓库名、描述、标签与用途", en: "Matches repo names, descriptions, tags and use cases" },

  heroEyebrow: { zh: "真实 GitHub 数据 · 人工核验内容", en: "Live GitHub data · human-verified content" },
  heroTitle: { zh: "先想清楚要做什么，再选对芯片与项目", en: "Decide what to build, then pick the right chip and project" },
  heroBody: {
    zh: "ESP32 Atlas 把散落在 GitHub、官方文档和社区教程里的信息整理成可比较的项目卡片：芯片兼容性、开发框架、上手难度、文档完整度、最近提交与版本发布，全部带来源和更新时间。",
    en: "ESP32 Atlas turns scattered GitHub repos, official docs and community tutorials into comparable project cards: chip compatibility, frameworks, difficulty, documentation quality, recent commits and releases — each with a source and a freshness timestamp.",
  },

  goalTitle: { zh: "我想做…", en: "I want to build…" },
  goalSubtitle: { zh: "从目标出发，而不是从仓库名出发", en: "Start from your goal, not from a repo name" },

  weeklyHot: { zh: "本周热门", en: "Trending this week" },
  recentlyActive: { zh: "近期活跃", en: "Recently active" },
  beginnerPicks: { zh: "适合新手", en: "Beginner friendly" },
  newArrivals: { zh: "新收录", en: "Newly indexed" },
  radarTeaser: { zh: "开源活跃度雷达", en: "Open-source activity radar" },
  pathsTeaser: { zh: "实战学习路线", en: "Hands-on learning paths" },
  dataUpdated: { zh: "数据更新时间", en: "Data updated" },
  viewAll: { zh: "查看全部", en: "View all" },

  statsRepos: { zh: "已核验仓库", en: "Verified repos" },
  statsTutorials: { zh: "教程与文档", en: "Tutorials & docs" },
  statsPaths: { zh: "学习路线", en: "Learning paths" },
  statsChips: { zh: "芯片条目", en: "Chip entries" },

  filters: { zh: "筛选", en: "Filters" },
  clearFilters: { zh: "清除筛选", en: "Clear filters" },
  sortBy: { zh: "排序", en: "Sort" },
  sortRecommended: { zh: "综合推荐", en: "Recommended" },
  sortStars: { zh: "Stars 总量", en: "Total stars" },
  sortUpdated: { zh: "最近更新", en: "Recently pushed" },
  sortNew: { zh: "最近新增", en: "Newest repos" },
  sortForks: { zh: "Forks", en: "Forks" },
  resultsCount: { zh: "个结果", en: "results" },
  noResultsTitle: { zh: "没有匹配的项目", en: "No matching projects" },
  noResultsBody: {
    zh: "试着放宽筛选条件，或换一个关键词。所有数据都可追溯，我们不会用编造结果填充空状态。",
    en: "Try loosening the filters or a different keyword. Every entry is traceable — we never fill empty states with invented results.",
  },
  loadMore: { zh: "加载更多", en: "Load more" },
  page: { zh: "第", en: "Page" },

  category: { zh: "项目类别", en: "Category" },
  chip: { zh: "芯片", en: "Chip" },
  framework: { zh: "开发框架", en: "Framework" },
  difficulty: { zh: "难度", en: "Difficulty" },
  languageLabel: { zh: "语言", en: "Language" },
  licenseLabel: { zh: "许可证", en: "License" },
  flags: { zh: "特征", en: "Signals" },

  flagActive: { zh: "近期活跃", en: "Recently active" },
  flagRelease: { zh: "近期发布", en: "Recent release" },
  flagDocumented: { zh: "文档完整", en: "Well documented" },
  flagBeginner: { zh: "适合新手", en: "Beginner friendly" },
  flagTutorial: { zh: "有教程", en: "Has tutorial" },
  flagDemo: { zh: "有演示", en: "Has demo" },

  stars: { zh: "Stars", en: "Stars" },
  forks: { zh: "Forks", en: "Forks" },
  openIssues: { zh: "Open Issues", en: "Open issues" },
  pushedAt: { zh: "最近推送", en: "Last push" },
  release: { zh: "最新版本", en: "Latest release" },
  syncedAt: { zh: "同步时间", en: "Synced" },
  lastVerified: { zh: "最后核验", en: "Last verified" },
  dataSource: { zh: "数据来源", en: "Data source" },
  viewRepo: { zh: "打开 GitHub 仓库", en: "Open on GitHub" },
  toVerify: { zh: "待核验", en: "Unverified" },
  staleData: { zh: "数据可能过期", en: "Data may be stale" },
  demoData: { zh: "示例数据", en: "Demo data" },

  guideTitle: { zh: "项目指南", en: "Project guide" },
  prerequisites: { zh: "前置知识", en: "Prerequisites" },
  hardwareList: { zh: "硬件清单", en: "Hardware checklist" },
  quickStart: { zh: "快速开始", en: "Quick start" },
  docsAndLinks: { zh: "文档 / 视频 / 教程", en: "Docs / video / tutorials" },
  faq: { zh: "常见问题", en: "FAQ" },
  limitations: { zh: "已知限制", en: "Known limitations" },
  maintenance: { zh: "维护状态", en: "Maintenance" },
  nextSteps: { zh: "进阶方向", en: "Next steps" },
  similarProjects: { zh: "相似项目", en: "Similar projects" },
  shareProject: { zh: "分享", en: "Share" },
  saveProject: { zh: "收藏", en: "Save" },
  savedProject: { zh: "已收藏", en: "Saved" },

  pathsTitle: { zh: "实战学习路线", en: "Hands-on learning paths" },
  pathsIntro: {
    zh: "每条路线都拆成阶段、目标、前置知识、资源与完成标准。时间只是粗略估计，取决于你动手的频率。",
    en: "Each path is split into stages with goals, prerequisites, resources and completion criteria. Time estimates are rough — they depend on how often you build.",
  },
  steps: { zh: "阶段", en: "Steps" },
  goal: { zh: "目标", en: "Goal" },
  estimate: { zh: "预计耗时", en: "Estimate" },
  doneWhen: { zh: "完成标准", en: "Done when" },
  resources: { zh: "资源", en: "Resources" },
  relatedProjects: { zh: "关联项目", en: "Related projects" },

  tutorialsTitle: { zh: "教程中心", en: "Tutorial hub" },
  tutorialsIntro: {
    zh: "只收录能打开、有明确学习目标的教程与官方文档，并记录最后核验时间。没有核验过的条目标记为待核验。",
    en: "Only tutorials and official docs that resolve and state a learning goal are listed, each with a last-verified date. Unverified entries are labelled as such.",
  },
  tutorialSource: { zh: "来源", en: "Source" },
  tutorialGoal: { zh: "学习目标", en: "Learning goal" },

  hardwareTitle: { zh: "芯片与硬件指南", en: "Chip & hardware guide" },
  hardwareIntro: {
    zh: "规格优先引用 Espressif 官方文档。开发板 Flash/PSRAM 与芯片内置能力分开标注；无法确认的字段标记为待核验。",
    en: "Specs cite Espressif documentation first. Board flash/PSRAM is kept distinct from on-chip capability; anything we could not confirm is marked unverified.",
  },
  coreSpecs: { zh: "核心规格", en: "Core specs" },
  useCases: { zh: "适用场景", en: "Best for" },
  commonBoards: { zh: "常见开发板", en: "Common dev boards" },
  officialDocs: { zh: "官方文档", en: "Official docs" },
  onChipFlash: { zh: "芯片内置 Flash", en: "On-chip flash" },

  radarTitle: { zh: "开源趋势雷达", en: "Open-source activity radar" },
  radarIntro: {
    zh: "总 Stars、最近提交、版本发布和 Issue 活跃度分开呈现。星标增长只在我们积累了历史快照之后才显示。",
    en: "Total stars, recent pushes, releases and issue activity are shown separately. Star growth only appears once we have collected historical snapshots.",
  },
  radarGrowthTitle: { zh: "星标增长", en: "Star growth" },
  radarAccumulating: {
    zh: "趋势数据积累中 — 历史快照从首次同步开始记录，目前还不足以计算 7/30/90 天增长。",
    en: "Trend data accumulating — snapshots start at first sync, so 7/30/90-day growth cannot be computed yet.",
  },
  radarSnapshots: { zh: "已记录快照", en: "Snapshots stored" },
  radarRising: { zh: "新增热门项目", en: "Newly indexed & popular" },
  radarReleases: { zh: "近期发布版本", en: "Recent releases" },
  radarHidden: { zh: "活跃但星标不高", en: "Active but under-starred" },
  radarIssues: { zh: "Issue / PR 活跃度", en: "Issue / PR activity" },

  collectionsTitle: { zh: "我的清单", en: "My collections" },
  collectionsIntro: {
    zh: "收藏保存在此浏览器（localStorage），不会上传服务器。换设备请用导出/导入迁移。",
    en: "Saved items live in this browser only (localStorage) and are never uploaded. Use export/import to move between devices.",
  },
  exportJson: { zh: "导出 JSON", en: "Export JSON" },
  importJson: { zh: "导入 JSON", en: "Import JSON" },
  clearAll: { zh: "清空清单", en: "Clear all" },
  statusTodo: { zh: "未开始", en: "Not started" },
  statusDoing: { zh: "进行中", en: "In progress" },
  statusDone: { zh: "已完成", en: "Done" },
  note: { zh: "备注", en: "Note" },
  emptyCollection: { zh: "清单还是空的", en: "Nothing saved yet" },
  emptyCollectionBody: {
    zh: "在项目或教程页面点「收藏」，就会出现在这里。",
    en: "Hit “Save” on any project or tutorial page and it shows up here.",
  },
  remove: { zh: "移除", en: "Remove" },

  submitTitle: { zh: "提交项目", en: "Submit a project" },
  submitIntro: {
    zh: "提交后会先经过人工审核，通过前不会出现在榜单里。我们只接受公开的 GitHub 仓库。",
    en: "Submissions are reviewed by a human before they can appear in any list. Only public GitHub repositories are accepted.",
  },
  repoUrl: { zh: "GitHub 仓库地址", en: "GitHub repo URL" },
  submitNote: { zh: "推荐理由（可选）", en: "Why it belongs here (optional)" },
  submitButton: { zh: "提交审核", en: "Submit for review" },
  submitSuccess: {
    zh: "已提交，等待审核。你可以在管理后台的提交队列中看到它。",
    en: "Submitted and queued for review. It is visible in the admin submission queue.",
  },
  submitDuplicate: { zh: "这个仓库已经在站点里了。", en: "This repository is already listed." },
  submitRateLimited: { zh: "提交过于频繁，请稍后再试。", en: "Too many submissions — please retry later." },

  adminTitle: { zh: "管理后台", en: "Admin console" },
  adminLogin: { zh: "管理员登录", en: "Admin sign-in" },
  adminEmail: { zh: "邮箱", en: "Email" },
  adminPassword: { zh: "密码", en: "Password" },
  adminSignIn: { zh: "登录", en: "Sign in" },
  adminSignOut: { zh: "退出登录", en: "Sign out" },
  adminDenied: { zh: "需要管理员身份", en: "Admin role required" },
  submissions: { zh: "提交审核", en: "Submissions" },
  curation: { zh: "项目维护", en: "Curation" },
  syncStatus: { zh: "同步任务", en: "Sync jobs" },
  approve: { zh: "通过", en: "Approve" },
  reject: { zh: "拒绝", en: "Reject" },
  runSync: { zh: "立即同步 GitHub", en: "Run GitHub sync now" },
  save: { zh: "保存", en: "Save" },
  saved: { zh: "已保存", en: "Saved" },

  footerNote: {
    zh: "ESP32 Atlas 是独立社区项目，与 Espressif Systems 无隶属关系。所有仓库指标来自 GitHub API，并在页面上标注同步时间。",
    en: "ESP32 Atlas is an independent community project, not affiliated with Espressif Systems. All repository metrics come from the GitHub API and are timestamped on-page.",
  },
  errorTitle: { zh: "出错了", en: "Something went wrong" },
  retry: { zh: "重试", en: "Retry" },
  loading: { zh: "加载中…", en: "Loading…" },
  backHome: { zh: "回到首页", en: "Back to home" },
  themeToggle: { zh: "切换主题", en: "Toggle theme" },
  langSwitch: { zh: "English", en: "简体中文" },
  skipToContent: { zh: "跳到主要内容", en: "Skip to content" },
} satisfies Dict;

export type DictKey = keyof typeof dict;

export function tr(key: DictKey, lang: Lang): string {
  return t(dict[key], lang);
}
