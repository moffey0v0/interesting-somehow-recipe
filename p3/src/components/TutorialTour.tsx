'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCookingStore } from '@/stores/cookingStore';

const TOUR_KEY = 'isr_tour_done';

interface TourStep {
  targetId: string | null;   // null = centered welcome card (no spotlight)
  placement: 'right' | 'left' | 'top' | 'bottom' | 'center';
  titleZh: string;
  titleEn: string;
  bodyZh: string | React.ReactNode;
  bodyEn: string | React.ReactNode;
  mobileTab?: 'style' | 'pantry' | null;
}

const STEPS: TourStep[] = [
  // ── Step 0: Welcome (centered, no spotlight) ──────────────────────────
  {
    targetId: null,
    placement: 'center',
    titleZh: '👋 欢迎来到大概有趣菜谱！',
    titleEn: '👋 Welcome to Interesting Somehow Recipe!',
    bodyZh: (
      <span>
        这是一个受《塞尔达：旷野之息》启发的 <strong>AI 食谱生成器</strong>。<br /><br />
        🧊 <strong>冰箱还剩一堆菜不知道怎么处理？</strong> 把它们扔进锅里，AI 帮你变出一道菜！<br /><br />
        🧪 <strong>也可以单纯做实验</strong>——把离谱食材组合在一起，看看 AI 创意的极限在哪里。<br /><br />
        接下来会有一个简短的引导，带你认识各个功能区 👇
      </span>
    ),
    bodyEn: (
      <span>
        An <strong>AI recipe generator</strong> inspired by Zelda: Breath of the Wild.<br /><br />
        🧊 <strong>Got a fridge full of random leftovers?</strong> Throw them in the pot — AI will cook something up!<br /><br />
        🧪 <strong>Or just run wild experiments</strong> — combine absurd ingredients and test the limits of AI creativity.<br /><br />
        A short tour will show you around the key features 👇
      </span>
    ),
    mobileTab: null,
  },
  // ── Step 1: Style panel overview ─────────────────────────────────────
  {
    targetId: 'tour-style-panel',
    placement: 'right',
    titleZh: '🍽️ 烹饪风格设定',
    titleEn: '🍽️ Cooking Style Settings',
    bodyZh: '左栏是所有「烹饪参数」的控制台——菜系、模式、口味偏好和狂野度都在这里调整。',
    bodyEn: 'The left panel is your cooking control panel — set cuisine, mode, taste, and wildness here.',
    mobileTab: 'style',
  },
  // ── Step 2: Cuisine list ──────────────────────────────────────────────
  {
    targetId: 'tour-cuisine-list',
    placement: 'right',
    titleZh: '🌍 菜系列表',
    titleEn: '🌍 Cuisine List',
    bodyZh: '点击任意菜系可选中，有子分类的菜系点击后会展开。可以滚动查看更多选项。',
    bodyEn: 'Click any cuisine to select it. Cuisines with sub-categories expand on click. Scroll to see more.',
    mobileTab: 'style',
  },
  // ── Step 3: Mode + Taste ──────────────────────────────────────────────
  {
    targetId: 'tour-mode-taste',
    placement: 'right',
    titleZh: '🌿 模式 & 口味倾向',
    titleEn: '🌿 Mode & Taste Sliders',
    bodyZh: (
      <span>
        <strong>生存模式</strong>：AI 只用你的食材（加常规调料），考验极限搭配！<br />
        <strong>创造模式</strong>：AI 可以自由添加辅料让成品更好吃，新增食材标 * 显示。<br /><br />
        下方的<strong>口味滑块</strong>让你指定期望的味道偏向——酸甜苦辣咸随你调。
      </span>
    ),
    bodyEn: (
      <span>
        <strong>Survival</strong>: AI only uses your ingredients (plus basic seasoning) — pure creativity!<br />
        <strong>Creative</strong>: AI freely adds extra ingredients for better flavour, marked with *.<br /><br />
        The <strong>taste sliders</strong> below let you dial in your preferred flavour profile.
      </span>
    ),
    mobileTab: 'style',
  },
  // ── Step 4: Wildness ──────────────────────────────────────────────────
  {
    targetId: 'tour-wildness',
    placement: 'right',
    titleZh: '🔥 狂野指数',
    titleEn: '🔥 Wildness Index',
    bodyZh: '拖动滑块控制 AI 创意程度。50 以上可以用非食用物品当灵感，80 以上连有毒概念也能变成创意菜！',
    bodyEn: 'Drag to control AI creativity. Above 50, non-food items inspire dishes. Above 80, even "toxic concepts" become creative inspiration!',
    mobileTab: 'style',
  },
  // ── Step 5: Pantry ────────────────────────────────────────────────────
  {
    targetId: 'tour-pantry',
    placement: 'left',
    titleZh: '🧺 食材库',
    titleEn: '🧺 Pantry',
    bodyZh: '点击食材图标即可加入烹饪锅。找不到的食材可以点底部「添加自定义食材」手动输入。',
    bodyEn: "Tap an ingredient icon to add it to the pot. Can't find what you need? Use \"Add Custom\" at the bottom.",
    mobileTab: 'pantry',
  },
  // ── Step 6: Magic pot ─────────────────────────────────────────────────
  {
    targetId: 'tour-magic-pot',
    placement: 'right',
    titleZh: '🍲 烹饪锅',
    titleEn: '🍲 Cauldron',
    bodyZh: '已选食材会显示在这里，可以用 +/- 调整用量。准备好后点击「开始烹饪」！',
    bodyEn: 'Your chosen ingredients appear here. Use +/- to adjust amounts. Then hit the cook button!',
    mobileTab: null,
  },
  // ── Step 7: Generate button ───────────────────────────────────────────
  {
    targetId: 'tour-generate-btn',
    placement: 'top',
    titleZh: '🍳 开始烹饪！',
    titleEn: "🍳 Let's Cook!",
    bodyZh: '点击这个按钮，AI 将为你生成 3 个独特菜谱变种。等待约 2 分钟，施法完成！',
    bodyEn: 'Click to generate 3 unique recipe variants. Wait ~2 minutes while the AI works its magic!',
    mobileTab: null,
  },
];

function getBubblePos(
  rect: DOMRect,
  placement: string,
  bubbleW = 272,
  bubbleH = 260,
) {
  const GAP = 16;
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  let top: number;
  let left: number;

  switch (placement) {
    case 'right':
      top = rect.top;
      left = rect.right + GAP;
      break;
    case 'left':
      top = rect.top;
      left = rect.left - bubbleW - GAP;
      break;
    case 'top':
      top = rect.top - bubbleH - GAP;
      left = rect.left + rect.width / 2 - bubbleW / 2;
      break;
    case 'bottom':
    default:
      top = rect.bottom + GAP;
      left = rect.left + rect.width / 2 - bubbleW / 2;
      break;
  }

  // Clamp to viewport with padding
  left = Math.max(8, Math.min(left, vw - bubbleW - 8));
  top = Math.max(8, Math.min(top, vh - bubbleH - 8));

  return { top, left };
}

interface TutorialTourProps {
  onMobileTabSwitch?: (tab: 'style' | 'pantry') => void;
}

export default function TutorialTour({ onMobileTabSwitch }: TutorialTourProps) {
  const { locale } = useCookingStore();
  const isZh = locale === 'zh';

  const [active, setActive] = useState(false);
  const [step, setStep] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);

  // Check sessionStorage on mount — only start if not seen this session
  useEffect(() => {
    const seen = sessionStorage.getItem(TOUR_KEY);
    if (!seen) {
      const t = setTimeout(() => setActive(true), 400);
      return () => clearTimeout(t);
    }
  }, []);

  const measureTarget = useCallback((stepIndex: number) => {
    const current = STEPS[stepIndex];

    // Welcome step: no spotlight needed
    if (!current.targetId) {
      setRect(null);
      return;
    }

    // Switch mobile tab if needed
    if (current.mobileTab && onMobileTabSwitch) {
      onMobileTabSwitch(current.mobileTab);
    }

    // Wait for tab switch + layout, then scroll into view and measure
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const el = document.getElementById(current.targetId!);
        if (!el) return;
        // Scroll element into view so it's inside the viewport
        el.scrollIntoView({ block: 'nearest', behavior: 'instant' });
        // One more frame after scroll
        requestAnimationFrame(() => {
          const r = el.getBoundingClientRect();
          setRect(r);
        });
      });
    });
  }, [onMobileTabSwitch]);

  useEffect(() => {
    if (!active) return;
    measureTarget(step);
  }, [active, step, measureTarget]);

  // Re-measure on resize
  useEffect(() => {
    if (!active) return;
    const handler = () => measureTarget(step);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, [active, step, measureTarget]);

  const finish = () => {
    sessionStorage.setItem(TOUR_KEY, '1');
    setActive(false);
  };

  const handleNext = () => {
    if (step >= STEPS.length - 1) {
      finish();
    } else {
      setStep(s => s + 1);
    }
  };

  const handleSkip = () => finish();

  if (!active) return null;

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  // ── Welcome / center card ──────────────────────────────────────────────
  if (current.placement === 'center') {
    return (
      <AnimatePresence>
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/55 px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-[#FBF3E8] border-2 border-[#D4B896] rounded-2xl p-6 shadow-2xl w-full max-w-sm"
            initial={{ scale: 0.88, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.88, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            {/* Progress dots */}
            <div className="flex gap-1 mb-4">
              {STEPS.map((_, i) => (
                <div
                  key={i}
                  className="h-1 flex-1 rounded-full transition-colors duration-300"
                  style={{ backgroundColor: i <= step ? '#C8956C' : 'rgba(74,46,27,0.15)' }}
                />
              ))}
            </div>

            <h3 className="text-lg font-bold text-[#3D1F0D] mb-3">
              {isZh ? current.titleZh : current.titleEn}
            </h3>
            <div className="text-sm text-[#3D1F0D]/75 leading-relaxed mb-5">
              {isZh ? current.bodyZh : current.bodyEn}
            </div>

            <div className="flex justify-between items-center">
              <button
                className="text-xs text-[#3D1F0D]/40 hover:text-[#3D1F0D]/60 transition-colors"
                onClick={handleSkip}
              >
                {isZh ? '跳过引导' : 'Skip tour'}
              </button>
              <button
                className="px-5 py-2 rounded-xl text-white text-sm font-bold transition-colors"
                style={{ backgroundColor: '#C8956C' }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#A0714A')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#C8956C')}
                onClick={handleNext}
              >
                {isZh ? '开始引导 →' : 'Start tour →'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  }

  // ── Spotlight steps ────────────────────────────────────────────────────
  // Wait until rect is measured
  if (!rect) return null;

  const bubbleW = 272;
  const bubbleH = 260;
  const bubblePos = getBubblePos(rect, current.placement, bubbleW, bubbleH);

  const arrowStyle: Record<string, React.CSSProperties> = {
    right: {
      position: 'absolute',
      left: -8,
      top: 20,
      width: 0,
      height: 0,
      borderTop: '8px solid transparent',
      borderBottom: '8px solid transparent',
      borderRight: '8px solid #D4B896',
    },
    left: {
      position: 'absolute',
      right: -8,
      top: 20,
      width: 0,
      height: 0,
      borderTop: '8px solid transparent',
      borderBottom: '8px solid transparent',
      borderLeft: '8px solid #D4B896',
    },
    top: {
      position: 'absolute',
      bottom: -8,
      left: '50%',
      transform: 'translateX(-50%)',
      width: 0,
      height: 0,
      borderLeft: '8px solid transparent',
      borderRight: '8px solid transparent',
      borderTop: '8px solid #D4B896',
    },
    bottom: {
      position: 'absolute',
      top: -8,
      left: '50%',
      transform: 'translateX(-50%)',
      width: 0,
      height: 0,
      borderLeft: '8px solid transparent',
      borderRight: '8px solid transparent',
      borderBottom: '8px solid #D4B896',
    },
  };

  return (
    <AnimatePresence>
      {active && (
        <>
          {/* Spotlight cutout via box-shadow */}
          <motion.div
            key={`spotlight-${step}`}
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
            }}
            initial={{ opacity: 0 }}
            animate={{
              opacity: 1,
              top: rect.top - 6,
              left: rect.left - 6,
              width: rect.width + 12,
              height: rect.height + 12,
            }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          />

          {/* Bubble */}
          <motion.div
            key={`bubble-${step}`}
            style={{
              position: 'fixed',
              top: bubblePos.top,
              left: bubblePos.left,
              width: bubbleW,
              zIndex: 10000,
            }}
            className="bg-[#FBF3E8] border-2 border-[#D4B896] rounded-2xl p-5 shadow-2xl"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
          >
            {/* Arrow */}
            <div style={arrowStyle[current.placement]} />

            {/* Progress dots */}
            <div className="flex gap-1 mb-3">
              {STEPS.map((_, i) => (
                <div
                  key={i}
                  className="h-1 flex-1 rounded-full transition-colors duration-300"
                  style={{ backgroundColor: i <= step ? '#C8956C' : 'rgba(74,46,27,0.15)' }}
                />
              ))}
            </div>

            {/* Title */}
            <h3 className="text-base font-bold text-[#3D1F0D] mb-1">
              {isZh ? current.titleZh : current.titleEn}
            </h3>

            {/* Body */}
            <div className="text-sm text-[#3D1F0D]/70 leading-relaxed mb-4">
              {isZh ? current.bodyZh : current.bodyEn}
            </div>

            {/* Buttons */}
            <div className="flex justify-between items-center">
              <button
                className="text-xs text-[#3D1F0D]/40 hover:text-[#3D1F0D]/60 transition-colors"
                onClick={handleSkip}
              >
                {isZh ? '跳过引导' : 'Skip'}
              </button>
              <button
                className="px-4 py-1.5 rounded-xl text-white text-sm font-bold transition-colors"
                style={{ backgroundColor: '#C8956C' }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#A0714A')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#C8956C')}
                onClick={handleNext}
              >
                {isLast
                  ? (isZh ? '完成 🎉' : 'Done 🎉')
                  : (isZh ? '下一步 →' : 'Next →')}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
