# 新手引导教程方案

## 概览

首次进入烹饪页面时，触发一套「聚焦式点击弹窗」引导流程（Spotlight Tour）。
共 6 步，每步高亮一个 UI 区域，用户点击「下一步」逐步推进，可随时跳过。

---

## 触发逻辑

```ts
// 使用 localStorage 标记是否已完成引导
const TOUR_KEY = 'isr_tour_done';
const hasSeenTour = localStorage.getItem(TOUR_KEY) === '1';

// 进入 cooking 视图后，若未见过则自动启动
// 用户完成最后一步或点击「跳过」后写入标记
localStorage.setItem(TOUR_KEY, '1');
```

---

## 组件结构

```
src/
└── components/
    └── TutorialTour.tsx       # 主组件，管理步骤状态与遮罩
```

### Props / State

```ts
interface TourStep {
  targetId: string;          // 目标元素的 id 属性
  placement: 'right' | 'left' | 'top' | 'bottom';
  titleZh: string;
  titleEn: string;
  bodyZh: string;
  bodyEn: string;
}

// 内部 state
const [step, setStep] = useState(0);
const [rect, setRect] = useState<DOMRect | null>(null);

// 每次 step 变化时重新计算目标元素位置
useEffect(() => {
  const el = document.getElementById(steps[step].targetId);
  if (el) setRect(el.getBoundingClientRect());
}, [step]);
```

### 渲染层次（z-index）

```
z-[9998]  半透明黑色遮罩（全屏，pointer-events: none）
z-[9999]  聚焦镂空高亮（box-shadow 实现，pointer-events: none）
z-[10000] 说明气泡（Tooltip Bubble，pointer-events: auto）
```

### 聚焦高亮实现（CSS box-shadow 镂空）

```tsx
<div
  style={{
    position: 'fixed',
    top: rect.top - 6,
    left: rect.left - 6,
    width: rect.width + 12,
    height: rect.height + 12,
    borderRadius: 12,
    boxShadow: '0 0 0 9999px rgba(0,0,0,0.55)',
    pointerEvents: 'none',
    zIndex: 9999,
    transition: 'all 0.3s ease',
  }}
/>
```

不需要 SVG clip-path，box-shadow 超大偏移即可实现镂空效果。

---

## 6 步引导内容

每个目标元素需在对应组件的根 div 加 `id` 属性。

| # | targetId | placement | 中文标题 | 中文说明 |
|---|---|---|---|---|
| 1 | `tour-style-panel` | right | 🍽️ 选择菜系与风格 | 在这里选择想要的菜系，调整生存/创造模式、口味偏好和狂野度。狂野度越高，AI 越发散！ |
| 2 | `tour-cuisine-list` | right | 🌍 菜系列表 | 点击任意菜系可选中，有子分类的菜系点击后会展开。可以滚动查看更多选项。 |
| 3 | `tour-wildness` | right | 🔥 狂野指数 | 拖动滑块控制 AI 创意程度。50 以上可以用非食用物品当灵感，80 以上连有毒概念也能变成创意菜！ |
| 4 | `tour-pantry` | left | 🧺 食材库 | 点击食材图标即可加入烹饪锅。找不到的食材可以点底部「添加自定义食材」手动输入。 |
| 5 | `tour-magic-pot` | right | 🍲 烹饪锅 | 已选食材会显示在这里，可以用 +/- 调整用量。准备好后点击「开始烹饪」！ |
| 6 | `tour-generate-btn` | top | 🍳 开始烹饪！ | 点击这个按钮，AI 将为你生成 3 个独特菜谱变种。等待约 15–30 秒，施法完成！ |

---

## 气泡 UI 结构

```tsx
<motion.div
  style={{
    position: 'fixed',
    // 根据 placement 和 rect 计算 top/left
    zIndex: 10000,
  }}
  className="bg-marble border-2 border-panel-border rounded-2xl p-5 shadow-2xl w-64"
  initial={{ opacity: 0, scale: 0.9 }}
  animate={{ opacity: 1, scale: 1 }}
>
  {/* 步骤进度 */}
  <div className="flex gap-1 mb-3">
    {steps.map((_, i) => (
      <div key={i} className={`h-1 flex-1 rounded-full ${i <= step ? 'bg-wood-gold' : 'bg-deep-brown/15'}`} />
    ))}
  </div>

  {/* 标题 */}
  <h3 className="text-base font-bold text-deep-brown mb-1">
    {isZh ? current.titleZh : current.titleEn}
  </h3>

  {/* 正文 */}
  <p className="text-sm text-deep-brown/70 leading-relaxed mb-4">
    {isZh ? current.bodyZh : current.bodyEn}
  </p>

  {/* 操作按钮 */}
  <div className="flex justify-between items-center">
    <button
      className="text-xs text-deep-brown/40 hover:text-deep-brown/60"
      onClick={onSkip}
    >
      {isZh ? '跳过引导' : 'Skip'}
    </button>
    <button
      className="px-4 py-1.5 rounded-xl bg-wood-gold text-white text-sm font-bold hover:bg-oak-brown"
      onClick={onNext}
    >
      {isLast ? (isZh ? '完成 🎉' : 'Done 🎉') : (isZh ? '下一步 →' : 'Next →')}
    </button>
  </div>

  {/* 三角箭头（根据 placement 朝向） */}
  <div className="absolute ..." />
</motion.div>
```

---

## 气泡位置计算

```ts
function getBubblePos(rect: DOMRect, placement: string, bubbleW = 256, bubbleH = 200) {
  const GAP = 16;
  switch (placement) {
    case 'right':  return { top: rect.top, left: rect.right + GAP };
    case 'left':   return { top: rect.top, left: rect.left - bubbleW - GAP };
    case 'top':    return { top: rect.top - bubbleH - GAP, left: rect.left + rect.width / 2 - bubbleW / 2 };
    case 'bottom': return { top: rect.bottom + GAP, left: rect.left + rect.width / 2 - bubbleW / 2 };
  }
}
```

---

## 加入目标 id 的位置

| id | 加在哪个组件 / 元素 |
|---|---|
| `tour-style-panel` | `StylePanel.tsx` → `<aside>` |
| `tour-cuisine-list` | `StylePanel.tsx` → 菜系列表 `<div className="space-y-0.5 ...">` |
| `tour-wildness` | `StylePanel.tsx` → Wildness `<div className="panel-section">` |
| `tour-pantry` | `Pantry.tsx` → 外层 `<div className="pantry ...">` |
| `tour-magic-pot` | `MagicPot.tsx` → Selected Ingredients `<div className="panel-section ...">` |
| `tour-generate-btn` | `MagicPot.tsx` → `<motion.button className="btn-generate">` |

---

## 移动端适配

- 移动端的 StylePanel / Pantry 通过 tab 切换显示
- 引导时若目标元素被 `hidden` 隐藏，先自动切换对应 tab（将 `setMobileTab` 提升到全局 store）
- 气泡统一改为 `placement: 'bottom'` 或居中显示，避免超出屏幕

---

## 重置方式（开发调试）

在浏览器控制台执行：

```js
localStorage.removeItem('isr_tour_done');
location.reload();
```

---

## 实现优先级建议

1. 先实现桌面端完整流程（6步）
2. 移动端 tab 联动（需 store 暴露 `setMobileTab`）
3. 窗口 resize 时重新计算 rect（`ResizeObserver`）
4. 可选：首次进入时给「开始引导」按钮，而不是自动触发
