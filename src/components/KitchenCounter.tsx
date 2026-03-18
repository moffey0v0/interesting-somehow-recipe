'use client';

import { useCookingStore } from '@/stores/cookingStore';
import { Recipe } from '@/lib/types';
import { motion } from 'framer-motion';
import { useState, useRef } from 'react';
import Image from 'next/image';

function RecipeTicket({ recipe, index }: { recipe: Recipe; index: number }) {
    const { locale } = useCookingStore();
    const isZh = locale === 'zh';
    const [showDetail, setShowDetail] = useState(false);
    const [saving, setSaving] = useState(false);
    const modalContentRef = useRef<HTMLDivElement>(null);

    async function handleSave() {
        const node = modalContentRef.current;
        if (!node) return;
        setSaving(true);
        try {
            const { toPng } = await import('html-to-image');

            // Temporarily remove scroll constraints so the full card is captured
            const prevMaxHeight = node.style.maxHeight;
            const prevOverflow = node.style.overflow;
            node.style.maxHeight = 'none';
            node.style.overflow = 'visible';

            const dataUrl = await toPng(node, {
                pixelRatio: 2,
                skipFonts: true,           // avoids cross-origin cssRules error
                cacheBust: true,
            });

            node.style.maxHeight = prevMaxHeight;
            node.style.overflow = prevOverflow;

            const filename = `${isZh ? recipe.name : recipe.name_en}.png`;
            const a = document.createElement('a');
            a.href = dataUrl;
            a.download = filename;
            a.click();
        } finally {
            setSaving(false);
        }
    }

    const rotation = [-2, 1, -3][index] || 0;

    return (
        <>
            <motion.div
                className="relative w-full md:w-72 cursor-pointer md:shrink-0"
                style={{ rotate: `${rotation}deg` }}
                initial={{ y: -300, opacity: 0, rotate: rotation - 10 }}
                animate={{ y: 0, opacity: 1, rotate: rotation }}
                transition={{ delay: index * 0.25, type: 'spring', damping: 15 }}
                whileHover={{ scale: 1.03, rotate: 0 }}
                onClick={() => setShowDetail(true)}
            >
                {/* Ticket background using the torn paper template */}
                <div className="absolute inset-0 z-0">
                    <Image
                        src="/assets/ticket_clean.png"
                        alt=""
                        fill
                        className="object-fill rounded-lg"
                    />
                </div>

                {/* Content on top of the ticket */}
                <div className="relative z-10 px-5 py-6 flex flex-col items-center text-center font-display tracking-wide">
                    {/* Title */}
                    <h3 className="text-xl font-bold text-deep-brown leading-tight mb-2">
                        {isZh ? recipe.name : recipe.name_en}
                    </h3>

                    {/* Risk Rate */}
                    <div className="mb-3">
                        <span className="text-base font-bold text-chef-red">
                            {isZh ? '翻车率' : 'Risk'}: {recipe.risk_rate}%
                        </span>
                    </div>

                    {/* Ingredients */}
                    <div className="space-y-0.5 text-base text-deep-brown">
                        {recipe.consumed_ingredients.map((ing, i) => (
                            <div key={i}>{isZh ? ing.name : ing.name_en}</div>
                        ))}
                        {recipe.extra_ingredients.map((ing, i) => (
                            <div key={`extra-${i}`}>
                                <span className="bg-yellow-200/60 px-1.5 py-0.5 rounded text-deep-brown font-bold shadow-sm">
                                    *{isZh ? ing.name : ing.name_en}
                                </span>
                            </div>
                        ))}
                        {recipe.seasonings.map((ing, i) => (
                            <div key={`s-${i}`} className="text-deep-brown/70">
                                {isZh ? ing.name : ing.name_en}
                            </div>
                        ))}
                    </div>

                    {/* View Details */}
                    <div className="mt-5 text-center">
                        <span className="inline-block px-5 py-2 rounded-lg border-2 border-deep-brown/20 text-sm text-deep-brown/70 font-semibold hover:bg-deep-brown/5">
                            {isZh ? '查看详情' : 'View Details'}
                        </span>
                    </div>
                </div>
            </motion.div>

            {/* ─── Detail Modal ─── */}
            {showDetail && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowDetail(false)}>
                    <motion.div
                        ref={modalContentRef}
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-marble text-deep-brown rounded-2xl p-8 max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-2xl mx-4 border-2 border-panel-border"
                        onClick={e => e.stopPropagation()}
                    >
                        <h2 className="text-3xl font-bold mb-2">{isZh ? recipe.name : recipe.name_en}</h2>
                        <p className="text-base text-deep-brown/60 mb-5">{isZh ? recipe.description : recipe.description_en}</p>

                        {/* Risk bar */}
                        <div className="flex items-center gap-3 mb-2">
                            <span className="text-base font-semibold">{isZh ? '翻车率' : 'Risk Rate'}</span>
                            <div className="flex-1 h-4 bg-deep-brown/10 rounded-full overflow-hidden">
                                <motion.div
                                    className={`h-full rounded-full ${recipe.risk_rate > 70 ? 'bg-chef-red' : recipe.risk_rate > 40 ? 'bg-creative-orange' : 'bg-herb-green'}`}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${recipe.risk_rate}%` }}
                                    transition={{ duration: 0.8 }}
                                />
                            </div>
                            <span className="text-base font-bold">{recipe.risk_rate}%</span>
                        </div>
                        {recipe.risk_reason && (
                            <p className="text-sm text-deep-brown/70 mb-5 bg-deep-brown/5 p-3 rounded-lg border-l-4 border-creative-orange">
                                💡 {isZh ? recipe.risk_reason : recipe.risk_reason_en}
                            </p>
                        )}

                        {/* Ingredients */}
                        <h4 className="font-bold text-base mb-2 border-b-2 border-deep-brown/10 pb-1">
                            {isZh ? '─── 食材清单 ───' : '─── Ingredients ───'}
                        </h4>
                        <div className="space-y-1.5 text-base mb-5">
                            {recipe.consumed_ingredients.map((ing, i) => (
                                <div key={i} className="flex justify-between">
                                    <span>{isZh ? ing.name : ing.name_en}</span>
                                    <span className="text-deep-brown/50">{ing.quantity} {isZh ? ing.unit : ing.unit_en}</span>
                                </div>
                            ))}
                            {recipe.extra_ingredients.map((ing, i) => (
                                <div key={`e-${i}`} className="flex justify-between bg-creative-orange/15 px-2 py-1 rounded">
                                    <span className="text-creative-orange font-semibold">*{isZh ? ing.name : ing.name_en}</span>
                                    <span className="text-creative-orange/70">{ing.quantity} {isZh ? ing.unit : ing.unit_en}</span>
                                </div>
                            ))}
                        </div>

                        {/* Steps */}
                        <h4 className="font-bold text-base mb-2 border-b-2 border-deep-brown/10 pb-1">
                            {isZh ? '─── 烹饪步骤 ───' : '─── Steps ───'}
                        </h4>
                        <div className="space-y-2.5 text-base mb-5">
                            {recipe.steps.map(s => (
                                <div key={s.step} className="flex gap-2">
                                    <span className="font-bold text-wood-gold text-lg">{'①②③④⑤⑥⑦⑧⑨⑩'[s.step - 1] || s.step}</span>
                                    <div className="flex-1">
                                        <p>{isZh ? s.instruction : s.instruction_en}</p>
                                        {(isZh ? s.tip : s.tip_en) && <p className="text-sm text-deep-brown/50 mt-0.5">💡 {isZh ? s.tip : s.tip_en}</p>}
                                    </div>
                                    <span className="text-sm text-deep-brown/40 whitespace-nowrap">{isZh ? s.duration : s.duration_en}</span>
                                </div>
                            ))}
                        </div>

                        {/* Origin */}
                        <div className="bg-deep-brown/5 p-4 rounded-xl text-sm text-deep-brown/60 mb-5">
                            <p className="font-bold mb-1 text-base">{isZh ? '─── 魔改来源 ───' : '─── Origin ───'}</p>
                            <p>{isZh ? '本菜谱由' : 'Based on'} 【{isZh ? recipe.origin.original_dish : recipe.origin.original_dish_en}】 {isZh ? '魔改而来。' : ''}</p>
                            <p>{isZh ? recipe.origin.description : recipe.origin.description_en}</p>
                        </div>

                        {/* Meta */}
                        <div className="flex gap-5 text-base text-deep-brown/50">
                            <span>⏱️ {isZh ? recipe.cooking_time : recipe.cooking_time_en}</span>
                            <span>📊 {isZh ? recipe.difficulty : recipe.difficulty_en}</span>
                        </div>

                        <div className="flex gap-3 mt-5">
                            <button
                                className="flex-1 py-3 rounded-xl bg-wood-gold text-white text-base font-semibold hover:bg-oak-brown border border-oak-brown disabled:opacity-60"
                                onClick={handleSave}
                                disabled={saving}
                            >
                                {saving ? (isZh ? '保存中...' : 'Saving...') : (isZh ? '💾 保存为图片' : '💾 Save as Image')}
                            </button>
                            <button
                                className="flex-1 py-3 rounded-xl bg-warm-bg text-deep-brown text-base font-medium hover:bg-deep-brown/10 border border-panel-border"
                                onClick={() => setShowDetail(false)}
                            >
                                {isZh ? '🔙 返回' : '🔙 Back'}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

        </>
    );
}

export default function KitchenCounter() {
    const { recipes, setCookingState, setRecipes, setView, locale, setLocale } = useCookingStore();
    const isZh = locale === 'zh';

    const handleBack = () => {
        setCookingState('idle');
        setRecipes([]);
        setView('cooking');
    };

    return (
        <div className="min-h-screen relative flex flex-col">
            {/* Background — wide with baked-in decorations */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="/assets/bg_counter.png"
                    alt="Kitchen Counter"
                    fill
                    className="object-cover"
                    priority
                />
            </div>

            {/* Top Navigation Navigation */}
            <div className="relative z-10 flex justify-between p-5 w-full max-w-7xl mx-auto">
                {/* Back to Kitchen button */}
                <button
                    className="px-5 py-2.5 rounded-xl bg-panel-bg/90 text-deep-brown text-base font-bold border-2 border-panel-border shadow-lg hover:bg-panel-bg transition-colors backdrop-blur-sm"
                    onClick={handleBack}
                >
                    {isZh ? '← 返回厨房' : '← Back to Kitchen'}
                </button>

                {/* Language Switch */}
                <button
                    className="px-5 py-2.5 rounded-xl bg-wood-gold/20 text-deep-brown text-base font-bold border-2 border-panel-border shadow-lg hover:bg-wood-gold/40 transition-colors backdrop-blur-sm"
                    onClick={() => setLocale(isZh ? 'en' : 'zh')}
                >
                    {isZh ? 'EN' : '中文'}
                </button>
            </div>

            {/* Recipe Tickets */}
            <div className="relative z-20 flex-1 w-full mt-4 md:mt-8
                overflow-y-auto md:overflow-y-visible
                flex md:items-center">
                <div className="flex flex-col md:flex-row
                    gap-6 md:gap-8
                    md:items-center md:justify-center
                    w-full max-w-2xl md:max-w-7xl mx-auto
                    px-5 md:px-4
                    py-4 md:py-0">
                    {recipes.map((r, i) => (
                        <RecipeTicket key={i} recipe={r} index={i} />
                    ))}
                </div>
            </div>

            {/* Cook Again Button */}
            <div className="relative z-10 flex justify-center pb-8">
                <motion.button
                    className="px-10 py-4 rounded-xl bg-panel-bg/90 text-deep-brown font-display text-xl font-bold shadow-lg border-2 border-panel-border hover:bg-panel-bg transition-colors backdrop-blur-sm"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1 }}
                    onClick={handleBack}
                >
                    🍳 {isZh ? '再煮一锅' : 'Cook Again'}
                </motion.button>
            </div>
        </div>
    );
}
