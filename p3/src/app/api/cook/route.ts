import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import OpenAI from 'openai';

// Allow up to 3 minutes for the DeepSeek API call on Vercel/edge
export const maxDuration = 180;
import { checkSafety } from '@/lib/safety';
import { checkRateLimit } from '@/lib/rateLimit';

// Initialize OpenAI client pointed at DeepSeek
const openai = new OpenAI({
    apiKey: process.env.DEEPSEEK_API_KEY || '',
    baseURL: process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com',
});

const SYSTEM_PROMPT = `你是「大概有趣菜谱」的核心 AI —— 一位同时具备专业厨艺和疯狂创意的「魔法厨师」。
你的使命是根据用户提供的食材和偏好，生成独特、有创意、有时甚至匪夷所思但绝对安全可食用的菜谱。

## 你的核心规则（不可违反）

### 🔴 安全红线（最高优先级，按三级分类处理）

**【A 级 — 有毒/危险物质，根据当前狂野度决定】**
含有以下成分时（砒霜、氰化物、汞/水银、铅、铊、甲醛、甲醇、毒蘑菇（鹅膏等）、河豚毒素、附子/乌头、曼陀罗、夹竹桃等）：
- 当前狂野度 **≤ 80**：立即返回 {"refused": true, "reason": "含有有毒/危险物质，无法生成食谱"}，不得生成任何食谱
- 当前狂野度 **> 80**：**不拒绝**，借用该物质的名称联想、视觉特征或文化梗，用完全安全的可食用食材进行创意替代，在 safety_note 中注明"已将 [原物质] 替换为安全食材"。**关键**：consumed_ingredients 中绝对不能出现真实有毒物质本身，最终食谱必须完全安全可食用

**【B 级 — 非食用物品，根据当前狂野度决定】**
含有爆炸物（TNT、炸药、火药）、工业化学品（汽油、洗洁精、油漆）、日常用品（皮鞋、轮胎、电池、塑料）等非食用但非剧毒物品时：
- 当前狂野度 **< 50**：返回 {"refused": true, "reason": "包含不可食用的物品，请更换食材"}
- 当前狂野度 **≥ 50**：**不拒绝**，借用该物品的概念、视觉特征、名称联想或文化梗，用完全安全的可食用食材进行创意替代，并在 safety_note 中注明"已将 [原物品] 替换为安全食材"。示例：
  - TNT → 用极辣红椒+芥末+花椒制作"TNT爆炸拌面"，体现"爆炸"感
  - 皮鞋 → 用牛肉塑形+焦糖脆皮呈现"皮革质感烤肉"
  - 汽油 → 用食用色素+油脂制作"彩虹油花甜品"
  - **关键**：consumed_ingredients 中只能写真实可食用食材，绝对不能出现非食用物品本身

**【C 级 — 合法食材，必须生成食谱，绝不拒绝】**
各种饮料（啤酒、红酒、可乐、雪碧、咖啡、果汁等）、普通食材的奇怪组合、看起来"难以成菜"的搭配，只要每种食材本身可食用/饮用，就必须发挥创意生成食谱，不得拒绝。

### 🟡 模式规则
- **生存模式 (survival)**：你只能使用用户提供的食材（调料除外：盐、糖、酱油、醋、料酒、食用油等常规调料可自由使用）。extra_ingredients 数组必须为空
- **创造模式 (creative)**：你可以在用户食材基础上，添加合理的辅料来提升菜品质量。新增的食材必须列在 extra_ingredients 中

### 🟢 创意规则
- wildness (狂野度) 值范围 0-100：
  - 0-20：正经家常菜，保守搭配
  - 21-50：有趣的混搭，但主流人群能接受
  - 51-80：大胆创新
  - 81-100：疯狂实验，挑战味觉极限，但仍然安全可食用
- 菜名要带有幽默感和创意

### 🍽️ 菜系规则
当用户指定了菜系和子分类时，你必须遵守该菜系的核心烹饪逻辑和风味特征：
- 如指定"川菜"，应以麻辣、复合口味为基础
- 如指定"法餐"，应以酱汁、精致摆盘为导向
- 如指定"随机/无界限"，可以自由融合任何烹饪传统
- 即使用户指定了菜系，在高狂野度下也可以适度跨界（但核心手法应保持菜系特征）

### 📦 输出格式
你必须严格以 JSON 格式输出，不要添加任何 JSON 之外的文字。你的输出必须是一个包含 { "recipes": [...], "total_recipes": N } 的对象。
每个 recipe 对象必须严格包含以下字段：
\`\`\`json
{
  "name": "中文菜品名称",
  "name_en": "English recipe name",
  "risk_rate": 75, // (0-100之间的整数，翻车率)
  "risk_reason": "中文解释翻车原因",
  "risk_reason_en": "English explanation of risk",
  "description": "中文短描述",
  "description_en": "English short description",
  "cuisine": "中文菜系名称",
  "cuisine_en": "English cuisine name",
  "consumed_ingredients": [
    { "name": "中文名", "name_en": "English name", "quantity": 50, "unit": "克", "unit_en": "grams" }
  ],
  "extra_ingredients": [
    { "name": "中文名", "name_en": "English name", "quantity": "适量", "unit": "", "unit_en": "as needed" }
  ],
  "seasonings": [
    { "name": "中文名", "name_en": "English name", "quantity": "适量", "unit": "", "unit_en": "" }
  ],
  "steps": [
    { "step": 1, "instruction": "中文描述", "instruction_en": "English instruction", "duration": "5分钟", "duration_en": "5 mins", "tip": "可选贴士", "tip_en": "Optional tip" }
  ],
  "origin": {
    "original_dish": "原型菜品名",
    "original_dish_en": "Original dish name",
    "description": "中文魔改原因",
    "description_en": "English modification reasons"
  },
  "cooking_time": "30分钟",
  "cooking_time_en": "30 mins",
  "difficulty": "简单",
  "difficulty_en": "Easy",
  "safety_note": "中文提示",
  "safety_note_en": "English safety note",
  "category": "主菜",
  "category_en": "Main Dish"
}
\`\`\`
注意：
1. 所有的结构、键名（如 consumed_ingredients、steps 等）必须完全一致，不可遗漏，以便于前端程序的正常反序列化解析。
2. steps 数组必须包含至少 5 个步骤，绝对不能为空数组。**每步只描述一个操作**，不可将多个动作合并在一步（例如：切菜、腌制、加热、调味、摆盘必须各自独立成步）。**每一步的 instruction 中必须明确写出该步骤使用的食材名称及具体用量**（例如"将 200g 牛肉切薄片"、"加入 2 汤匙酱油和 1 茶匙糖"），绝对不能写"加入食材"等模糊表述。
3. 拒绝时只返回 {"refused": true, "reason": "..."} 这一 JSON，不得返回 recipes 数组或任何其他字段。
4. A 级和 B 级替代食谱中，consumed_ingredients 字段里只能写真实可食用食材，绝对不能出现原始的有毒物质或非食用物品名称。`;

export async function POST(req: Request) {
    try {
        // ── Rate limiting ──────────────────────────────────────────────────────
        const headersList = await headers();
        const ip =
            headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ??
            headersList.get('x-real-ip') ??
            '127.0.0.1';

        const rateResult = checkRateLimit(ip);
        if (!rateResult.allowed) {
            return NextResponse.json(
                { error: 'Too many requests. Please wait a moment before trying again.' },
                {
                    status: 429,
                    headers: { 'Retry-After': String(Math.ceil(rateResult.retryAfterMs / 1000)) },
                }
            );
        }

        // ── API key guard ──────────────────────────────────────────────────────
        if (!process.env.DEEPSEEK_API_KEY) {
            return NextResponse.json({ error: 'DEEPSEEK_API_KEY not configured' }, { status: 500 });
        }

        // ── Parse body ─────────────────────────────────────────────────────────
        const body = await req.json();
        const {
            ingredients,
            mode,
            taste = {},
            wildness,
            cuisineMain,
            cuisineSub = null,
            locale = 'zh',
        } = body;
        const isZh = locale !== 'en';

        // ── Input validation ───────────────────────────────────────────────────
        if (!Array.isArray(ingredients) || ingredients.length === 0) {
            return NextResponse.json(
                { error: 'ingredients must be a non-empty array' },
                { status: 400 }
            );
        }
        if (ingredients.length > 20) {
            return NextResponse.json(
                { error: 'Too many ingredients (max 20)' },
                { status: 400 }
            );
        }
        for (const ing of ingredients) {
            if (typeof ing?.name !== 'string' || ing.name.trim().length === 0 || ing.name.length > 50) {
                return NextResponse.json({ error: 'Invalid ingredient name' }, { status: 400 });
            }
        }
        if (!['survival', 'creative'].includes(mode)) {
            return NextResponse.json({ error: 'Invalid mode' }, { status: 400 });
        }
        const wildnessNum = Number(wildness);
        if (isNaN(wildnessNum) || wildnessNum < 0 || wildnessNum > 100) {
            return NextResponse.json({ error: 'wildness must be between 0 and 100' }, { status: 400 });
        }
        if (cuisineMain != null && (typeof cuisineMain !== 'string' || cuisineMain.length > 50)) {
            return NextResponse.json({ error: 'Invalid cuisineMain' }, { status: 400 });
        }

        // ── Server-side safety check (mirrors frontend checkSafety) ───────────
        const ingredientNames: string[] = ingredients.map((i: { name: string }) => String(i.name));
        const safetyResult = checkSafety(ingredientNames, wildnessNum);
        if (!safetyResult.safe) {
            return NextResponse.json(
                { error: isZh ? safetyResult.message : safetyResult.message_en, reason: safetyResult.reason },
                { status: 422 }
            );
        }

        // ── Build prompts ──────────────────────────────────────────────────────
        const resolvedCuisineMain = typeof cuisineMain === 'string' ? cuisineMain : '随机';
        const ingredientsList = ingredients
            .map((i: { name: string; quantity: number }) => `${i.name} (x${i.quantity})`)
            .join('，');

        const userPrompt = `## 本次烹饪挑战

- 模式：【${mode === 'survival' ? '生存模式' : '创造模式'}】
- 菜系偏好：${resolvedCuisineMain} ${cuisineSub ? '> ' + cuisineSub : ''}
- 提供食材：${ingredientsList}
- 口味要求：酸${taste.sour}/甜${taste.sweet}/苦${taste.bitter}/辣${taste.spicy}/咸${taste.salty}（满分100）
- 狂野程度：${wildnessNum}/100
- 请生成恰好 3 个菜谱变种。

【本次请求的安全处理决策（最高优先级，必须严格执行）】
当前狂野度 = ${wildnessNum}。

A 级 — 若食材中含有有毒/危险物质（砒霜、氰化物、毒蘑菇、河豚毒素、附子、曼陀罗等）：
  - 狂野度 ${wildnessNum} ${wildnessNum <= 80 ? '<= 80 → 你必须立即返回 {"refused": true, "reason": "含有有毒/危险物质，无法生成食谱"} ，不得生成任何食谱。' : '> 80 → 你必须用完全安全的可食用食材替代，借用其名称或概念发挥创意，绝对不能在任何字段中出现真实有毒物质，safety_note 必须注明替代说明。'}

B 级 — 若食材中含有非食用物品（爆炸物、工业品、日常用品等）：
  - 狂野度 ${wildnessNum} ${wildnessNum < 50 ? '< 50 → 你必须立即返回 {"refused": true, "reason": "狂野度不足，无法接受非食用食材，请提高狂野度或更换食材"} ，不得生成任何食谱。' : '>= 50 → 你必须用可食用食材替代，发挥创意生成食谱，不得拒绝。'}

额外严格要求：
1. 计量单位：无论原始提供的食材单位是什么，在生成菜谱包含的 \`quantity\` 和 \`unit\` 字段时，对于肉类、腌料、液体等，必须使用真实的烹饪计量单位（如："50", "克" 或 "2", "勺"），绝对不能用"个"、"块"这种模糊单位。
2. 极度狂野法则：如果当前提供的狂野度（wildness）大于 80，哪怕提供的食材都是西红柿、鸡蛋之类极其普通的菜，你也 **必须** 在这3个变种中，生成至少1个彻底打破常规、极度猎奇、非常小众或者做法极其出人意料的菜谱（比如：西红柿分子冰沙拌老干妈、焦糖酱油煎蛋卷等）。

请严格按照 JSON 格式输出。
`;

        // ── Call DeepSeek API ──────────────────────────────────────────────────
        const completion = await openai.chat.completions.create({
            model: 'deepseek-chat',
            messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                { role: 'user', content: userPrompt },
            ],
            response_format: { type: 'json_object' },
            temperature: 0.3 + (wildnessNum / 100) * 0.7,
        });

        const text = completion.choices[0].message.content || '{}';

        if (process.env.NODE_ENV !== 'production') {
            console.log('DeepSeek Response:', text);
        }

        let parsedData: Record<string, unknown>;
        try {
            parsedData = JSON.parse(text);
        } catch {
            return NextResponse.json(
                {
                    error: isZh
                        ? '⚠️ AI 无法为这些食材生成食谱，可能包含不可食用的成分。请重新选择食材后再试！'
                        : '⚠️ AI could not generate a recipe for these ingredients — they may be inedible. Please change your ingredients and try again!',
                    reason: 'ai_refused',
                },
                { status: 422 }
            );
        }

        // ── Detect AI refusal ──────────────────────────────────────────────────
        if (parsedData.refused === true) {
            return NextResponse.json(
                {
                    error: isZh
                        ? '⚠️ 检测到不可食用的成分，无法生成食谱。请重新选择食材后再试！'
                        : '⚠️ Inedible ingredients detected — recipe generation refused. Please change your ingredients and try again!',
                    reason: 'ai_refused',
                },
                { status: 422 }
            );
        }

        // ── Validate recipes structure ─────────────────────────────────────────
        const recipes = parsedData.recipes;
        if (!Array.isArray(recipes) || recipes.length === 0) {
            return NextResponse.json(
                {
                    error: isZh
                        ? '⚠️ AI 未能生成有效食谱，可能包含不可食用的成分。请重新选择食材后再试！'
                        : '⚠️ AI failed to generate valid recipes — ingredients may be inedible. Please change your ingredients and try again!',
                    reason: 'ai_refused',
                },
                { status: 422 }
            );
        }
        // Filter out any recipe that came back without steps instead of failing the whole request
        const validRecipes = (recipes as Record<string, unknown>[]).filter(r =>
            Array.isArray(r.steps) && (r.steps as unknown[]).length > 0
        );
        if (process.env.NODE_ENV !== 'production' && validRecipes.length < recipes.length) {
            console.warn(`[cook] ${recipes.length - validRecipes.length} recipe(s) had empty/missing steps and were dropped`);
        }
        if (validRecipes.length === 0) {
            return NextResponse.json(
                {
                    error: isZh
                        ? '⚠️ AI 生成的食谱缺少烹饪步骤，请重试'
                        : '⚠️ AI generated recipes with no cooking steps. Please try again.',
                    reason: 'no_steps',
                },
                { status: 500 }
            );
        }

        return NextResponse.json({ result: { ...parsedData, recipes: validRecipes } });
    } catch (error: unknown) {
        console.error('API /cook error:', error);
        // Translate SDK/network errors into a friendly message so raw SDK text isn't shown to users
        const raw = error instanceof Error ? error.message : String(error);
        const isTimeout = /timeout|timed out|ETIMEDOUT|socket hang up/i.test(raw);
        const isOverload = /rate.?limit|overload|capacity|529|503/i.test(raw);
        const friendlyZh = isTimeout
            ? '⏳ AI 响应超时，请稍后重试'
            : isOverload
                ? '😅 AI 服务当前繁忙，请稍后重试'
                : '⚠️ 生成食谱时出现错误，请重试';
        const friendlyEn = isTimeout
            ? '⏳ AI response timed out. Please try again.'
            : isOverload
                ? '😅 AI service is busy. Please try again in a moment.'
                : '⚠️ An error occurred while generating recipes. Please try again.';
        return NextResponse.json(
            { error: isZh ? friendlyZh : friendlyEn },
            { status: 500 }
        );
    }
}
