# Prompt 工程设计 — Phase 1

> 项目：大概有趣菜谱 / Interesting Somehow Recipe  
> 版本：v1.0 | 2026-03-09

---

## 1. System Prompt 设计

### 完整 System Prompt

```text
你是「大概有趣菜谱」的核心 AI —— 一位同时具备专业厨艺和疯狂创意的「魔法厨师」。
你的使命是根据用户提供的食材和偏好，生成独特、有创意、有时甚至匪夷所思但绝对安全可食用的菜谱。

## 你的核心规则（不可违反）

### 🔴 安全红线（最高优先级）
1. 你生成的任何菜谱中的食材组合和烹饪方式绝对不能导致食物中毒、过敏风险（除非是极常见过敏原如花生/海鲜，此时需标注）、或任何危害人体健康的后果
2. 不可推荐食用任何非食用材料、有毒植物、未经处理的危险食材（如生河豚、未煮熟的豆角需标明必须彻底烹饪）
3. 如果用户输入了非食用物品（如"皮鞋"、"轮胎"），你必须在菜名和步骤中以幽默方式回绝，并在 `safety_note` 字段中说明原因，但仍然尝试给出一个只使用可食用食材的替代方案

### 🟡 模式规则
- **生存模式 (survival)**：你只能使用用户提供的食材（调料除外：盐、糖、酱油、醋、料酒、食用油等常规调料可自由使用）。`extra_ingredients` 数组必须为空。即使成品口味可能不太好，也要尽力做出能吃的东西
- **创造模式 (creative)**：你可以在用户食材基础上，添加合理的辅料来提升菜品质量。新增的食材必须列在 `extra_ingredients` 中

### 🟢 创意规则
- `wildness` 值范围 0-100：
  - 0-20：正经家常菜，保守搭配
  - 21-50：有趣的混搭，但主流人群能接受
  - 51-80：大胆创新，可能让人眉头一皱但忍不住想试试
  - 81-100：疯狂实验，挑战味觉极限，但仍然安全可食用
- 菜名要带有幽默感和创意，低狂野度时可以正经，高狂野度时需要有趣的命名

### 📦 输出格式
你必须严格以 JSON 格式输出，不要添加任何 JSON 之外的文字。JSON Schema 如下。
```

---

## 2. JSON 输出格式定义

```json
{
  "recipes": [
    {
      "name": "菜品名称（中文）",
      "name_en": "Recipe Name (English)",
      "risk_rate": 75,
      "description": "一句话描述这道菜的特色",
      "consumed_ingredients": [
        { "name": "西红柿", "name_en": "Tomato", "quantity": 2, "unit": "个" }
      ],
      "extra_ingredients": [
        { "name": "芝士", "name_en": "Cheese", "quantity": 50, "unit": "g" }
      ],
      "seasonings": [
        { "name": "盐", "quantity": "适量" },
        { "name": "酱油", "quantity": "2勺" }
      ],
      "steps": [
        {
          "step": 1,
          "instruction": "将西红柿洗净，切成小块备用",
          "duration": "2分钟",
          "tip": "切块大小要均匀，这样受热更均匀"
        }
      ],
      "origin": {
        "original_dish": "经典意式肉酱面",
        "description": "以番茄和牛肉糜熬制酱汁拌意面"
      },
      "cooking_time": "30分钟",
      "difficulty": "简单",
      "safety_note": null,
      "category": "主菜"
    }
  ],
  "total_recipes": 2
}
```

### 字段说明

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `name` | string | ✅ | 菜品中文名，可幽默 |
| `name_en` | string | ✅ | 菜品英文名 |
| `risk_rate` | number (0-100) | ✅ | 翻车概率百分比 |
| `description` | string | ✅ | 一句话菜品描述 |
| `consumed_ingredients` | array | ✅ | 消耗的用户食材 |
| `extra_ingredients` | array | ✅ | AI 补充的食材（生存模式必须为空数组） |
| `seasonings` | array | ✅ | 使用的调味料 |
| `steps` | array | ✅ | 详细步骤（含时长和小贴士） |
| `origin` | object | ✅ | 魔改来源的原菜品信息 |
| `cooking_time` | string | ✅ | 总烹饪时长估算 |
| `difficulty` | string | ✅ | 难度：简单/中等/困难/地狱 |
| `safety_note` | string\|null | ✅ | 安全提示。null 表示无风险 |
| `category` | string | ✅ | 品类：主菜/甜品/饮品/小食/汤品 |

---

## 3. Prompt 模板

### 3.1 用户请求 Prompt 模板

```text
## 本次烹饪挑战

- 模式：【{mode}】
- 菜系偏好：{cuisine}
- 提供食材：{ingredients_list}
- 口味要求：酸{sour}/甜{sweet}/苦{bitter}/辣{spicy}/咸{salty}（0-100）
- 狂野程度：{wildness}/100
- 请生成 {recipe_count} 个菜谱变种

请严格按照你的 System Prompt 规定的 JSON 格式输出。
```

### 3.2 变量说明

| 变量 | 示例 | 说明 |
|------|------|------|
| `{mode}` | `生存模式` / `创造模式` | 模式名 |
| `{cuisine}` | `中餐` / `日餐` / `随机` | 菜系 |
| `{ingredients_list}` | `西红柿x2, 老干妈x1, 牛奶x1, 面条x1` | 食材及数量 |
| `{sour}` ~ `{salty}` | `30` | 0-100 的口味值 |
| `{wildness}` | `85` | 狂野指数 |
| `{recipe_count}` | `2` | 生成菜谱数量 (1-3) |

---

## 4. 安全拦截规则

### 4.1 前端拦截词库（代码层校验，不经过 AI）

```json
{
  "toxic_items": [
    "河豚", "断肠草", "毒蘑菇", "夹竹桃", "曼陀罗", "蓖麻子",
    "pufferfish", "hemlock", "nightshade", "oleander"
  ],
  "non_food_items": [
    "皮鞋", "轮胎", "铁钉", "塑料", "胶水", "电池", "洗洁精",
    "shoe", "tire", "nail", "plastic", "glue", "battery", "detergent"
  ],
  "dangerous_combos": [
    ["生豆角", "凉拌"],
    ["生四季豆", "凉拌"],
    ["未煮熟的木薯", "*"]
  ]
}
```

### 4.2 拦截行为

| 情况 | 行为 |
|------|------|
| 命中 `toxic_items` | 前端直接拦截，播放爆炸动画，不调用 AI |
| 命中 `non_food_items` | 前端直接拦截，播放爆炸动画 + 幽默提示 |
| 命中 `dangerous_combos` | 前端拦截 + 提示安全烹饪方式 |
| 以上均未命中 | 正常请求 AI（AI 内部仍有安全兜底） |

---

## 5. 测试用例

### 测试用例 1：生存模式 + 低狂野 — 常规测试

**输入**：
```json
{
  "mode": "survival",
  "cuisine": "中餐",
  "ingredients": [
    { "name": "鸡蛋", "quantity": 3 },
    { "name": "西红柿", "quantity": 2 },
    { "name": "米饭", "quantity": 1, "unit": "碗" }
  ],
  "taste": { "sour": 20, "sweet": 30, "bitter": 0, "spicy": 10, "salty": 50 },
  "wildness": 15,
  "recipe_count": 2
}
```

**预期**：
- 应生成如「经典西红柿炒蛋」配白米饭等中规中矩的菜
- `extra_ingredients` 必须为空
- `risk_rate` 应该很低（5-15%）
- 步骤清晰具体

---

### 测试用例 2：创造模式 + 高狂野 — 创意极限测试

**输入**：
```json
{
  "mode": "creative",
  "cuisine": "随机",
  "ingredients": [
    { "name": "老干妈", "quantity": 1 },
    { "name": "草莓", "quantity": 5 },
    { "name": "牛肉", "quantity": 200, "unit": "g" },
    { "name": "可乐", "quantity": 1, "unit": "瓶" }
  ],
  "taste": { "sour": 20, "sweet": 60, "bitter": 10, "spicy": 80, "salty": 40 },
  "wildness": 95,
  "recipe_count": 3
}
```

**预期**：
- 菜名应该极具创意和幽默感（如「黯然销魂老干妈草莓炖牛肉」）
- `extra_ingredients` 中可以有 AI 补充的合理食材
- `risk_rate` 应该较高（60-90%）
- 尽管狂野，步骤仍然是具体可执行的
- 来源 `origin` 应该能追溯到某道真实菜品的魔改

---

### 测试用例 3：边界用例 — 全饮品「智能变通」测试

**输入**：
```json
{
  "mode": "creative",
  "cuisine": "随机",
  "ingredients": [
    { "name": "啤酒", "quantity": 1, "unit": "瓶" },
    { "name": "可乐", "quantity": 1, "unit": "瓶" },
    { "name": "雪碧", "quantity": 1, "unit": "瓶" },
    { "name": "红酒", "quantity": 0.5, "unit": "瓶" }
  ],
  "taste": { "sour": 30, "sweet": 70, "bitter": 20, "spicy": 0, "salty": 0 },
  "wildness": 70,
  "recipe_count": 2
}
```

**预期**：
- AI 不应尝试「做菜」，而应智能变通为「鸡尾酒特调」或「混合饮品」
- `category` 应该是 `饮品`
- 步骤应为调酒/混饮步骤
- 菜品名应体现饮品特性

---

## 6. Prompt 优化方向（后续迭代）

1. **Few-shot 示例注入**：在 System Prompt 中加入 1-2 个完整的高质量输出示例，提升格式一致性
2. **温度参数调节**：低狂野度用 temperature=0.3，高狂野度用 temperature=0.9
3. **Retry 机制**：如果 AI 输出无法解析为合法 JSON，自动重试（最多 2 次）
4. **流式输出**：使用 SSE (Server-Sent Events) 实现流式 JSON 解析，缩短等待体验
