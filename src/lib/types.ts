export type Lang = "zh" | "en";

export type I18nText = { zh: string; en: string };

export type Difficulty = "beginner" | "intermediate" | "advanced";

export const CATEGORIES = [
  "ai-voice",
  "smart-home",
  "display",
  "robotics",
  "led",
  "sensors",
  "wireless",
  "dev-toolkit",
  "camera-vision",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const FRAMEWORKS = [
  "arduino",
  "esp-idf",
  "esphome",
  "platformio",
  "micropython",
  "rust",
  "javascript",
  "c-plus-plus",
  "yaml",
] as const;

export type Framework = (typeof FRAMEWORKS)[number];

export const CHIP_SLUGS = [
  "esp32",
  "esp32-s2",
  "esp32-s3",
  "esp32-c3",
  "esp32-c6",
  "esp32-h2",
  "esp32-p4",
] as const;

export type ChipSlug = (typeof CHIP_SLUGS)[number];

export interface RepoRecord {
  id: number;
  slug: string;
  owner: string;
  name: string;
  fullName: string;
  htmlUrl: string;
  homepage: string | null;
  description: string | null;
  summary: I18nText | null;
  topics: string[];
  language: string | null;
  license: string | null;
  stars: number;
  forks: number;
  openIssues: number;
  createdAt: string | null;
  updatedAt: string | null;
  pushedAt: string | null;
  defaultBranch: string | null;
  archived: boolean;
  latestReleaseTag: string | null;
  latestReleaseAt: string | null;
  latestReleaseUrl: string | null;
  category: Category | null;
  chips: string[];
  frameworks: string[];
  difficulty: Difficulty | null;
  docScore: number | null;
  demoScore: number | null;
  beginnerFriendly: boolean;
  tags: string[];
  featured: boolean;
  dataOrigin: "github" | "demo";
  firstSeenAt: string;
  lastSyncedAt: string | null;
  syncStatus: "ok" | "stale" | "failed";
  syncError: string | null;
}

export interface GuideContent {
  intro: I18nText;
  prerequisites: I18nText[];
  hardware: Array<{ item: I18nText; note?: I18nText }>;
  quickStart: Array<{ step: I18nText; detail: I18nText }>;
  docs: Array<{
    label: I18nText;
    url: string;
    kind: "doc" | "video" | "tutorial" | "demo" | "tool" | "project";
  }>;
  faq: Array<{ q: I18nText; a: I18nText }>;
  limitations: I18nText[];
  maintenance: I18nText;
  nextSteps: I18nText[];
  confidenceNote?: I18nText;
}

export interface TutorialRecord {
  id: number;
  slug: string;
  title: I18nText;
  url: string;
  source: string;
  author: string | null;
  lang: Lang;
  difficulty: Difficulty;
  topics: string[];
  chips: string[];
  frameworks: string[];
  goal: I18nText | null;
  relatedRepos: string[];
  verifiedAt: string | null;
  checkStatus: "ok" | "unverified" | "failed";
  dataOrigin: string;
}

export interface ChipRecord {
  id: number;
  slug: string;
  name: string;
  family: string;
  cores: string | null;
  clock: string | null;
  sram: string | null;
  flash: string | null;
  wifi: string | null;
  ble: string | null;
  threadZigbee: string | null;
  usb: string | null;
  camera: string | null;
  display: string | null;
  useCases: I18nText | null;
  boards: string[];
  officialUrl: string | null;
  confidence: string;
  verifiedAt: string | null;
}

export interface LearningPathRecord {
  id: number;
  slug: string;
  title: I18nText;
  summary: I18nText;
  level: Difficulty;
  hours: string | null;
  chips: string[];
  frameworks: string[];
  icon: string | null;
  sortOrder: number;
  steps: LearningPathStepRecord[];
}

export interface LearningPathStepRecord {
  id: number;
  stepNo: number;
  title: I18nText;
  goal: I18nText;
  prereq: I18nText | null;
  resources: Array<{ label: I18nText; url: string; kind: string }>;
  projects: string[];
  estimate: string | null;
  doneWhen: I18nText | null;
}

export interface SnapshotPoint {
  capturedAt: string;
  stars: number;
  forks: number;
  openIssues: number;
}

export type SortKey = "recommended" | "stars" | "updated" | "new" | "forks";

export interface ExploreFilters {
  q: string;
  category: string[];
  chips: string[];
  frameworks: string[];
  difficulty: string[];
  language: string[];
  license: string[];
  flags: string[];
  sort: SortKey;
  page: number;
}
