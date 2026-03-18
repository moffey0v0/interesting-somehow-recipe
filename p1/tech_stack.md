# 技术选型文档 — Phase 1

> 项目：大概有趣菜谱 / Interesting Somehow Recipe  
> 版本：v1.0 | 2026-03-09

---

## 技术栈总览

| 层级 | 技术 | 版本 | 选型理由 |
|------|------|------|---------|
| 前端框架 | React + Next.js | 18 + 14 (App Router) | SSR/SSG 支持、API Routes 内建 Serverless、状态管理生态丰富 |
| 样式 | TailwindCSS | 3.x | 原子化 CSS，快速迭代布局，自定义主题能力强 |
| 动画 | Framer Motion | 11.x | React 原生动画库，支持布局动画、手势、SVG 动画 |
| 状态管理 | Zustand | 4.x | 轻量无 boilerplate，TypeScript 原生支持、适合中复杂度场景 |
| 国际化 | next-intl | 3.x | 与 App Router 深度集成，支持中/英双语切换 |
| 后端 | Next.js API Routes | — | Serverless 架构，无需独立后端服务器 |
| AI 接入 | OpenAI GPT-4o | — | 创意能力强，JSON mode 支持好 |
| AI 备选 | DeepSeek / Claude 3.5 Sonnet | — | 降低成本 / Prompt 遵从性更佳 |
| 部署 | Vercel | — | Next.js 原生托管，免费 Hobby 计划，自动 CI/CD |
| 包管理 | pnpm | 8.x | 磁盘效率高，monorepo 友好 |
| 类型 | TypeScript | 5.x | 全链路类型安全 |

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
│  │              │  │              │  │  (Server-  │ │
│  │  - 主烹饪页   │  │  - 控制台     │  │   less)    │ │
│  │  - 结果页     │  │  - 食材库     │  │            │ │
│  │              │  │  - 魔法锅     │  │  /api/cook │ │
│  │              │  │  - 小纸条     │  │  /api/safe │ │
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

## 关键技术决策说明

### 为什么选 Next.js 而不是 Vite + Vue？
1. **全栈能力**：API Routes 可以直接充当 Serverless 后端，保护 API Key 不暴露给前端
2. **React 生态**：Framer Motion、Zustand 等库在 React 中最成熟
3. **Vercel 部署**：零配置部署，自动边缘优化

### 为什么用 Zustand 而不是 Redux？
- 本项目状态复杂度为中等（食材列表、模式选项、滑块值）
- Zustand 无需 actions/reducers 模板代码，store 定义简洁
- 天然支持 TypeScript 推断

### 为什么选 Framer Motion 而不是 GSAP？
- 与 React 组件生命周期深度绑定（`AnimatePresence`、layout animation）
- 声明式 API 更适合 React 哲学
- 内建手势识别（适合移动端拖拽交互）

---

## 目录结构规划

```
interesting-somehow-recipe/
├── public/
│   ├── icons/              # 食材卡通图标 (SVG/PNG)
│   ├── animations/         # Lottie/GIF 动画素材
│   └── fonts/              # 自定义字体
├── src/
│   ├── app/
│   │   ├── [locale]/       # 国际化路由
│   │   │   ├── page.tsx    # 主烹饪页
│   │   │   └── layout.tsx  # 根布局
│   │   └── api/
│   │       ├── cook/       # AI 菜谱生成接口
│   │       └── safety/     # 安全校验接口
│   ├── components/
│   │   ├── ControlPanel/   # 左栏：模式/口味/菜系控制
│   │   ├── Pantry/         # 中区：食材选择区
│   │   ├── MagicPot/       # 右区：烹饪锅 + 食材槽
│   │   └── RecipeCard/     # 结果：小纸条 + 详细展开
│   ├── stores/
│   │   └── cookingStore.ts # Zustand 全局状态
│   ├── lib/
│   │   ├── prompts.ts      # Prompt 模板
│   │   ├── safety.ts       # 安全校验逻辑
│   │   └── types.ts        # 类型定义
│   ├── i18n/
│   │   ├── zh.json         # 中文翻译
│   │   └── en.json         # 英文翻译
│   └── styles/
│       └── globals.css     # TailwindCSS 配置
├── tailwind.config.ts
├── next.config.ts
├── tsconfig.json
└── package.json
```
