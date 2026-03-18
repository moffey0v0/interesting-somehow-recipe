# Phase 3 阶段总结：AI 核心大脑开发

> 项目：大概有趣菜谱 / Interesting Somehow Recipe  
> 阶段：Phase 3 — AI 核心大脑接入  

---

## 📋 阶段目标完成情况

### ✅ 1. API 接口搭建
-  **框架使用**：采用 Next.js App Router (`src/app/api/cook/route.ts`)。
-  **模型选择**：根据用户在中国境内使用的需求，最终选定 **DeepSeek API** (`deepseek-chat`)。
-  **环境配置**：创建了 `.env.local` 文件，配置了 `DEEPSEEK_API_KEY` 及 `DEEPSEEK_BASE_URL`。

### ✅ 2. 核心 Prompt 注入
- 依据 `p1.1/prompt_design.md` 设计的规则设定 System Prompt。
- 在用户 Prompt 中整合前端发送的新增数据维度：
  1. 当前所选食材列表。
  2. 当前模式 (`creative` 或 `survival`)。
  3. 五维口味设定 (酸、甜、苦、辣、咸)。
  4. 狂野程度 Slider 值 (0-100)。
  5. 左侧面板设定的具体菜系（`cuisineMain` 以及 `cuisineSub`）。
- **结构化输出保证**：利用 OpenAI SDK 的 `response_format: { type: "json_object" }` 强制约束 DeepSeek 输出合法的 JSON 数据结构。

### ✅ 3. 前端通信链路对接
- 修改了 `src/components/MagicPot.tsx` 里的 `handleCook` 逻辑。
- 移除了前期的 `setTimeout` Mock 实现，改为实际触发 `fetch('/api/cook')` 请求。
- 保留并接入了由 `checkSafety` 辅助函数提供的前端安全拦截。
- 补全了对于 API 网络异常及大模型返回错误的 UI 等待动画 (`cooking` 状态) 及错误 `alert()` 阻断提示 (`fail` 状态)。

## 📁 阶段产出文件
| 状态 | 文件路径 | 变更说明 |
|------|-----------|----------|
| ➕ 新增 | `src/app/api/cook/route.ts` | 承接前后端所有 LLM 通信并实施 System Prompt 的服务端点 |
| ➕ 新增 | `.env.local` | 存储 DeepSeek API Key 凭证 |
| 🔄 修改 | `src/components/MagicPot.tsx` | 重构烹饪按钮的核心发起逻辑与网络响应处理 |

## 🚀 后续 (Phase 4) 预告
- 进行海报画成图片功能（将菜谱记录生成为实体海报供下载分享）。
- 在生产环境压测极端食材的输入处理。
