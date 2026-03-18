# 技术选型文档 — Phase 1.1 (修订版)

> 项目：大概有趣菜谱 / Interesting Somehow Recipe  
> 版本：v1.1 | 2026-03-09（基于 p1 修订）

---

## 技术栈总览

| 层级 | 技术 | 版本 | 选型理由 |
|------|------|------|---------|
| 前端框架 | React + Next.js | 18 + 14 (App Router) | SSR/SSG 支持、API Routes 内建 Serverless、状态管理生态丰富 |
| 样式 | TailwindCSS | 3.x | 原子化 CSS，快速迭代布局，自定义主题能力强 |
| 动画 | Framer Motion | 11.x | React 原生动画库，支持布局动画、手势、SVG 动画 |
| 状态管理 | Zustand | 4.x | 轻量无 boilerplate，TypeScript 原生支持 |
| 国际化 | next-intl | 3.x | 与 App Router 深度集成，中/英双语 |
| 后端 | Next.js API Routes | — | Serverless 架构 |
| AI 接入 | OpenAI GPT-4o | — | 创意能力强，JSON mode 支持好 |
| AI 备选 | DeepSeek / Claude 3.5 Sonnet | — | 降低成本 / Prompt 遵从性更佳 |
| 部署 | Vercel | — | Next.js 原生托管 |
| 包管理 | pnpm | 8.x | 磁盘效率高 |
| 类型 | TypeScript | 5.x | 全链路类型安全 |

> 技术栈与 p1 一致，无变更。

---

## 架构图

```
┌──────────────────────────────────────────────────────┐
│                     Vercel (CDN)                     │
├──────────────────────────────────────────────────────┤
│               Next.js 14 (App Router)                │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────┐ │
│  │   Pages /    │  │  Components  │  │   API      │ │
│  │   Layout     │  │  (React 18)  │  │   Routes   │ │
│  │              │  │              │  │            │ │
│  │  - 主烹饪页   │  │  - 风格面板   │  │  /api/cook │ │
│  │  - 出单台面   │  │  - 烹饪锅     │  │  /api/safe │ │
│  │              │  │  - 食材库     │  │            │ │
│  │              │  │  - 小纸条     │  │            │ │
│  └──────────────┘  └──────────────┘  └─────┬──────┘ │
│                                            │        │
│  ┌──────────────┐  ┌──────────────┐        │        │
│  │  Zustand     │  │  next-intl   │        │        │
│  │  (状态管理)   │  │  (i18n)      │        │        │
│  └──────────────┘  └──────────────┘        │        │
│  ┌──────────────┐                          │        │
│  │ TailwindCSS  │                          │        │
│  │ + Framer     │                          │        │
│  │   Motion     │                          │        │
│  └──────────────┘                          │        │
├────────────────────────────────────────────┼────────┤
│                  外部服务                    │        │
│  ┌──────────────────────────────────────┐  │        │
│  │        LLM API (GPT-4o / DeepSeek)   │◄─┘        │
│  └──────────────────────────────────────┘           │
└──────────────────────────────────────────────────────┘
```

---

## 目录结构规划 (v1.1 修订)

```
interesting-somehow-recipe/
├── public/
│   ├── icons/              # 食材卡通图标 (SVG/PNG)
│   ├── animations/         # Lottie/GIF 动画素材
│   └── fonts/
├── src/
│   ├── app/
│   │   ├── [locale]/
│   │   │   ├── page.tsx    # 主烹饪页 (左=风格 中=锅 右=食材)
│   │   │   ├── result/
│   │   │   │   └── page.tsx # 出单台面页
│   │   │   └── layout.tsx
│   │   └── api/
│   │       ├── cook/
│   │       └── safety/
│   ├── components/
│   │   ├── StylePanel/     # 左栏：菜系两级选择器 + 模式/口味/狂野控制
│   │   ├── MagicPot/       # 中区：烹饪锅 + 食材槽
│   │   ├── Pantry/         # 右栏：食材选取 + 自定义食材
│   │   ├── KitchenCounter/ # 出单台面
│   │   └── RecipeCard/     # 小纸条 + 展开详情海报
│   ├── stores/
│   │   └── cookingStore.ts
│   ├── lib/
│   │   ├── prompts.ts
│   │   ├── safety.ts
│   │   ├── cuisines.ts     # 菜系数据（大类+子分类）
│   │   └── types.ts
│   ├── i18n/
│   │   ├── zh.json
│   │   └── en.json
│   └── styles/
│       └── globals.css
├── tailwind.config.ts
├── next.config.ts
├── tsconfig.json
└── package.json
```

> **v1.1 变更**：组件名从 `ControlPanel` 改为 `StylePanel`，`Pantry` 移至右栏，增加 `KitchenCounter` 组件，新增 `cuisines.ts` 数据文件，增加 `result/page.tsx` 页面。
