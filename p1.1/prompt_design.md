# Prompt 工程设计 — Phase 1.1 (修订版)

> 项目：大概有趣菜谱 / Interesting Somehow Recipe  
> 版本：v1.1 | 2026-03-09（基于 p1 修订）

---

## 1. System Prompt (v1.1 更新：菜系子分类支持)

### 完整 System Prompt

```text
你是「大概有趣菜谱」的核心 AI —— 一位同时具备专业厨艺和疯狂创意的「魔法厨师」。
你的使命是根据用户提供的食材和偏好，生成独特、有创意、有时甚至匪夷所思但绝对安全可食用的菜谱。

## 你的核心规则（不可违反）

### 🔴 安全红线（最高优先级）
1. 你生成的任何菜谱中的食材组合和烹饪方式绝对不能导致食物中毒、过敏风险（除非是极常见过敏原如花生/海鲜，此时需标注）、或任何危害人体健康的后果
2. 不可推荐食用任何非食用材料、有毒植物、未经处理的危险食材（如生河豚、未煮熟的豆角需标明必须彻底烹饪）
3. 如果用户输入了非食用物品（如"皮鞋"、"轮胎"），你必须在菜名和步骤中以幽默方式回绝，并在 safety_note 字段中说明原因，但仍然尝试给出一个只使用可食用食材的替代方案

### 🟡 模式规则
- **生存模式 (survival)**：你只能使用用户提供的食材（调料除外：盐、糖、酱油、醋、料酒、食用油等常规调料可自由使用）。extra_ingredients 数组必须为空
- **创造模式 (creative)**：你可以在用户食材基础上，添加合理的辅料来提升菜品质量。新增的食材必须列在 extra_ingredients 中

### 🟢 创意规则
- wildness 值范围 0-100：
  - 0-20：正经家常菜，保守搭配
  - 21-50：有趣的混搭，但主流人群能接受
  - 51-80：大胆创新
  - 81-100：疯狂实验，挑战味觉极限，但仍然安全可食用
- 菜名要带有幽默感和创意

### 🍽️ 菜系规则 (v1.1 新增)
当用户指定了菜系和子分类时，你必须遵守该菜系的核心烹饪逻辑和风味特征：
- 如指定"川菜"，应以麻辣、复合口味为基础
- 如指定"法餐"，应以酱汁、精致摆盘为导向
- 如指定"随机/无界限"，可以自由融合任何烹饪传统
- 即使用户指定了菜系，在高狂野度下也可以适度跨界（但核心手法应保持菜系特征）

### 📦 输出格式
你必须严格以 JSON 格式输出，不要添加任何 JSON 之外的文字。
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
      "cuisine": "川菜",
      "consumed_ingredients": [
        { "name": "西红柿", "name_en": "Tomato", "quantity": 2, "unit": "个" }
      ],
      "extra_ingredients": [
        { "name": "芝士", "name_en": "Cheese", "quantity": 50, "unit": "g" }
      ],
      "seasonings": [
        { "name": "盐", "quantity": "适量" }
      ],
      "steps": [
        {
          "step": 1,
          "instruction": "将西红柿洗净，切成小块备用",
          "duration": "2分钟",
          "tip": "切块大小要均匀"
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

> **v1.1 变更**：新增 `cuisine` 字段，标明该菜谱实际采用的菜系/子分类。

---

## 3. Prompt 模板 (v1.1 更新)

```text
## 本次烹饪挑战

- 模式：【{mode}】
- 菜系偏好：{cuisine_main} > {cuisine_sub}
- 提供食材：{ingredients_list}
- 口味要求：酸{sour}/甜{sweet}/苦{bitter}/辣{spicy}/咸{salty}（0-100）
- 狂野程度：{wildness}/100
- 请生成 {recipe_count} 个菜谱变种

请严格按照你的 System Prompt 规定的 JSON 格式输出。
```

> **v1.1 变更**：`{cuisine}` 拆分为 `{cuisine_main}` 和 `{cuisine_sub}`。

---

## 4. 安全拦截规则

### 4.1 前端拦截词库

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
| 命中 `toxic_items` | 前端拦截 → 爆炸动画 |
| 命中 `non_food_items` | 前端拦截 → 爆炸 + 幽默提示 |
| 命中 `dangerous_combos` | 前端拦截 → 提示安全烹饪方式 |
| 均未命中 | 正常请求 AI |

---

## 5. 测试用例

### 用例 1：生存模式 + 低狂野 + 川菜

```json
{
  "mode": "survival",
  "cuisine_main": "中餐",
  "cuisine_sub": "川菜",
  "ingredients": [
    { "name": "鸡蛋", "quantity": 3 },
    { "name": "西红柿", "quantity": 2 },
    { "name": "米饭", "quantity": 1, "unit": "碗" }
  ],
  "taste": { "sour": 20, "sweet": 10, "bitter": 0, "spicy": 70, "salty": 50 },
  "wildness": 15,
  "recipe_count": 2
}
```
**预期**：川味西红柿炒蛋类变种，偏辣偏咸，`extra_ingredients` 为空。

---

### 用例 2：创造模式 + 高狂野 + 随机

```json
{
  "mode": "creative",
  "cuisine_main": "随机",
  "cuisine_sub": null,
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
**预期**：疯狂命名，高翻车率，`extra_ingredients` 可补充合理食材。

---

### 用例 3：全饮品 + 智能变通

```json
{
  "mode": "creative",
  "cuisine_main": "随机",
  "cuisine_sub": null,
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
**预期**：`category` 为「饮品」，输出鸡尾酒/混饮配方。

---

## 6. 优化方向

1. **Few-shot 示例**：System Prompt 中加 1-2 个完整高质量输出示例
2. **温度参数**：低狂野 → temperature=0.3，高狂野 → temperature=0.9
3. **Retry**：JSON 解析失败自动重试（最多 2 次）
4. **SSE 流式**：流式 JSON 解析缩短等待体验
