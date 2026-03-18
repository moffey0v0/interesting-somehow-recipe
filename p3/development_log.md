# Phase 3 开发日志

- **时间**：2026-03-11
- **目标**：实现 AI 生成引擎（Gemini）与前端界面的串联。

## 开发记录
1. **获取与规划 API**：
   - 用户决定使用 Google Gemini。创建了 `gemini_api_guide.md` 以协助获取 API Key。
   - 配置环境为 `.env.local` 本地存放凭证。

2. **安装核心库**：
   - 执行 `npm install @google/generative-ai` 安装官方 SDK（在后台静默完成）。

3. **创建 Serverless 路由 `api/cook/route.ts`**：
   - 由于需要保证输出格式百分之百吻合我们前端解析逻辑，我采用了 `temperature: 0.3` (基础) ~ `1.0` 的动态范围关联 `wildness` 狂野程度。
   - 使用 `responseSchema` 搭配 `responseMimeType: 'application/json'` 强制要求模型输出我们定义的复杂 `recipeSchema`。
   - 提取参数：`mode`, `taste`, `wildness`, `cuisineMain`, `cuisineSub` 动态拼装进 User Prompt。

4. **更新魔法锅 `MagicPot.tsx`**：
   - 移除了阶段二中使用的 `setTimeout` 以及硬编码假数据。
   - 重构了 `handleCook` 为异步方法：`await fetch('/api/cook', ...)`。
   - 当 API 请求发生时，保留了生动的 `pot_cooking.png` 动画与状态；请求失败时，调用 `alert` 提示用户并在 1.5 秒后回退到 `idle` 状态以便用户重新点击。

## 遇到的问题与防范
- JSON 破坏风险：大模型很容易因为 “狂野程度太高” 生成乱七八糟的内容。因为利用了 Gemini 1.5 的 Structure Outputs 特性，这个问题得到完美根除，返回的必定是完整正确的菜谱数组形式。
- **预检安全防护**：对 `"皮鞋"` 等有毒或非食用危险物质，依然在前端 `MagicPot.tsx` 入口处（通过重用的 `checkSafety` 方法）进行有效拦截，节省 API 开支并且符合逻辑预期。
