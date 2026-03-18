# CLAUDE.md — 大概有趣菜谱 / Interesting Somehow Recipe

> 快速上手指南，减少每次进入此项目的理解成本。

---

## 项目一句话定位

受《塞尔达：旷野之息》烹饪玩法启发，用户从"冰箱食材"出发，通过 AI 生成奇怪但可食用的菜谱。核心卖点是**娱乐性**（翻车率、魔改来源）而非实用性。

---

## 目录结构

```
D:\TEST\Interesting Somehow Recipe\
├── Interesting Somehow Recipe.md  # 原始需求文档（用户的产品愿景）
├── 产品说明书.md                   # 详细产品规格
├── 开发计划书.md                   # 五阶段开发路线图
├── p1/                            # 阶段一产出：线框图、技术选型、UI规范
├── p1.1/                          # 阶段一补充：Prompt 设计稿、art assets
├── p2/                            # 阶段二产出：前端静态页面（含 Mock 数据）
├── p3/                            # 阶段三产出：AI 接口接入（当前主要工作目录）
└── p4/                            # 阶段四（待开发）：图片海报导出功能
```

---

## 技术栈（p3 当前状态）

| 层 | 技术 |
|---|---|
| 框架 | Next.js 16 (App Router) + React 19 + TypeScript |
| 样式 | Tailwind CSS v4 |
| 动画 | Framer Motion |
| 状态管理 | Zustand |
| AI 接口 | DeepSeek API（通过 OpenAI SDK 兼容层调用，model: `deepseek-chat`） |
| 部署目标 | Vercel（未部署） |

> ⚠️ `package.json` 中存在 `@google/generative-ai` 残留依赖（开发过程中曾尝试 Gemini），实际代码已切换为 DeepSeek，该依赖可以清理。

---

## 关键文件速查

| 文件 | 作用 |
|---|---|
| `p3/src/app/api/cook/route.ts` | 唯一的后端 API 路由，接收前端参数 → 拼装 Prompt → 调用 DeepSeek → 返回 JSON |
| `p3/src/lib/safety.ts` | 前端安全检查：有毒食材词库 + 危险搭配词库 |
| `p3/src/components/MagicPot.tsx` | 烹饪锅组件，含 `handleCook()`：前端安全拦截 → fetch `/api/cook` → 解析菜谱 |
| `p3/src/stores/cookingStore.ts` | Zustand 全局状态：食材列表、模式、口味、狂野度、菜系、视图切换 |
| `p3/src/lib/types.ts` | 所有 TypeScript 类型定义（Recipe、Ingredient、TasteProfile 等） |
| `p3/src/lib/ingredients.ts` | 硬编码的食材数据库（含中英文、分类、图标路径） |
| `p3/src/components/KitchenCounter.tsx` | 结果页：展示菜谱"小纸条"列表 |
| `p3/.env.local` | 本地密钥文件（已被 `.gitignore` 排除，**不可提交**） |

---

## 核心业务逻辑流

```
用户选择食材 + 调整参数（菜系/模式/口味/狂野度）
    ↓
[前端] checkSafety() — 词库匹配，命中则播放爆炸动画，阻止请求
    ↓
fetch POST /api/cook  { ingredients, mode, taste, wildness, cuisineMain, cuisineSub }
    ↓
[后端] route.ts — 拼装 System Prompt + User Prompt → 调用 DeepSeek
    ↓
DeepSeek 返回强制 JSON 格式的 { recipes: [...], total_recipes: 3 }
    ↓
前端解析 → setRecipes() → setView('result') → KitchenCounter 展示小纸条
```

**视图状态机**：`landing` → `cooking` → `result`（可重置回 `cooking`）

---

## 阶段完成情况

| 阶段 | 状态 | 备注 |
|---|---|---|
| 阶段一：原型设计与资产准备 | ✅ 完成 | p1/ p1.1/ |
| 阶段二：前端界面与交互开发 | ✅ 完成 | p2/ 静态页面 |
| 阶段三：AI 核心大脑 | ✅ 核心功能完成，有安全隐患（见下） | p3/ |
| 阶段四：图片生成导出 | ❌ 未开始 | p4/ 目录已建但为空 |
| 阶段五：测试部署上线 | ❌ 未开始 | |

---

## 已知安全问题（阶段三遗留）

### 🔴 高危：后端无输入验证，前端安全检查可被绕过

`/api/cook` 是公开 HTTP 端点，任何人可直接调用，完全跳过前端的 `checkSafety()`，传入"河豚"等有毒食材让 AI 生成有害食谱，或传入超长字符串进行 Prompt 注入。**后端未做任何 server-side 校验。**

### 🔴 高危：无接口限流

`/api/cook` 无速率限制（Rate Limiting）。恶意用户可无限调用，耗尽 DeepSeek API 额度。

### 🟡 中危：错误响应泄露 AI 原始输出

JSON 解析失败时，`route.ts:135` 将完整的 AI 原始响应文本 `text` 返回给客户端，可能泄露内部 Prompt 结构。

### 🟡 中危：console.log 记录完整 AI 响应

`route.ts:129` 的 `console.log("DeepSeek Response:", text)` 在生产环境中会将完整响应写入服务端日志，生产部署前应移除或改为 debug 级别。

### 🟢 已正确处理
- API Key 通过 `process.env` 读取，不暴露给前端
- `.env.local` 已在 `.gitignore` 中排除
- 启动前检查 `DEEPSEEK_API_KEY` 是否配置

---

## 本地开发启动

```bash
cd p3
npm install
# 确保 .env.local 存在且包含：
# DEEPSEEK_API_KEY=your_key_here
# DEEPSEEK_BASE_URL=https://api.deepseek.com
npm run dev
```

访问 http://localhost:3000

---

## 下一步优先事项（Phase 4 开始前建议修复）

1. **后端复制安全检查**：在 `route.ts` 中对 `ingredients` 数组执行与前端相同的 `checkSafety()` 逻辑（server-side）
2. **添加输入长度/格式校验**：限制 `ingredients` 数组长度（如 ≤ 20）、各字段最大字符数
3. **接入 Vercel Rate Limiting 或 upstash/ratelimit**：保护 API 额度
4. **移除生产环境 console.log**：或替换为条件性 debug 日志
5. **错误响应脱敏**：JSON 解析失败时不返回原始 `text` 字段
6. **Phase 4 功能**：`html2canvas` 菜谱海报导出（产品说明书 §3.2）
