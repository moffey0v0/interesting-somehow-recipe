'use client';

import { useCookingStore } from '@/stores/cookingStore';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { checkSafety } from '@/lib/safety';
import { useState } from 'react';

const POT_IMAGES: Record<string, string> = {
    idle: '/assets/pot_idle.png',
    cooking: '/assets/pot_cooking.png',
    success: '/assets/pot_success.png',
    fail: '/assets/pot_fail.png',
};

export default function MagicPot() {
    const {
        selectedIngredients, decrementIngredient, incrementIngredient,
        cookingState, setCookingState, setRecipes, setView, locale,
        mode, taste, wildness, cuisineMain, cuisineSub
    } = useCookingStore();
    const isZh = locale === 'zh';
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const showError = (msg: string) => {
        setCookingState('idle');
        setErrorMsg(msg);
    };

    const handleCook = async () => {
        if (selectedIngredients.length === 0) return;

        const names = selectedIngredients.map(si => si.ingredient.name);
        const result = checkSafety(names, wildness);

        if (!result.safe) {
            setCookingState('fail');
            setTimeout(() => showError(isZh ? result.message : result.message_en), 1200);
            return;
        }

        setCookingState('cooking');

        try {
            const response = await fetch('/api/cook', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ingredients: selectedIngredients.map(si => ({
                        name: isZh ? si.ingredient.name : si.ingredient.name_en,
                        quantity: si.quantity
                    })),
                    mode,
                    taste,
                    wildness,
                    cuisineMain,
                    cuisineSub,
                    locale
                })
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                const msg = errData.error || (isZh ? '烹饪失败，请重试' : 'Cooking failed, please retry');
                setCookingState('fail');
                setTimeout(() => showError(msg), 1500);
                return;
            }

            const data = await response.json();

            let recipesArray = data.result?.recipes || data.result;
            if (!Array.isArray(recipesArray)) {
                recipesArray = [];
            }

            recipesArray = recipesArray.map((r: any) => ({
                ...r,
                consumed_ingredients: Array.isArray(r.consumed_ingredients) ? r.consumed_ingredients : [],
                extra_ingredients: Array.isArray(r.extra_ingredients) ? r.extra_ingredients : [],
                seasonings: Array.isArray(r.seasonings) ? r.seasonings : [],
                steps: Array.isArray(r.steps) ? r.steps : [],
                origin: r.origin || { original_dish: '未知', original_dish_en: 'Unknown', description: '', description_en: '' }
            }));

            setCookingState('success');
            setRecipes(recipesArray);
            setTimeout(() => {
                setView('result');
            }, 1000);
        } catch (error: any) {
            console.error(error);
            setCookingState('fail');
            setTimeout(() => showError(isZh ? '网络错误，请检查连接后重试' : 'Network error, please check your connection'), 1500);
        }
    };

    return (
        <div className="magic-pot md:h-full flex flex-col gap-3">
            {/* ─── Cauldron Section ─── */}
            <div className="panel-section flex flex-col items-center shrink-0">
                <h3 className="text-base font-bold text-deep-brown mb-2 tracking-widest uppercase w-full text-center">
                    {isZh ? '🍲 烹饪锅' : '🍲 Cauldron'}
                </h3>

                {/* Pot — smaller container on mobile to leave room for the generate button */}
                <div className="relative h-28 md:h-44 flex items-center justify-center w-full">
                    <motion.div className="relative transform scale-50 md:scale-75 origin-top mt-4 md:mt-20">
                        {cookingState === 'idle' && (
                            <motion.div
                                className="absolute inset-0 rounded-full bg-rune-glow/25 blur-2xl"
                                animate={{ opacity: [0.3, 0.6, 0.3], scale: [0.9, 1.1, 0.9] }}
                                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                            />
                        )}
                        {cookingState === 'cooking' && (
                            <>
                                <motion.div
                                    className="absolute inset-0 rounded-full bg-chef-red/30 blur-2xl"
                                    animate={{ opacity: [0.5, 0.9, 0.5], scale: [0.95, 1.15, 0.95] }}
                                    transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                                />
                                <div className="relative z-10 transition-transform">
                                    <Image
                                        src={POT_IMAGES[cookingState]}
                                        alt="Cooking Pot"
                                        width={240}
                                        height={240}
                                        className="relative z-10"
                                        priority
                                    />
                                    {/* Additional pulsing glow over the pot image */}
                                    <motion.div
                                        className="absolute inset-0 rounded-full bg-wood-gold/20 mix-blend-overlay blur-md"
                                        animate={{ opacity: [0.3, 0.8, 0.3] }}
                                        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                                    />
                                </div>
                            </>
                        )}
                        {cookingState !== 'cooking' && (
                            <Image
                                src={POT_IMAGES[cookingState]}
                                alt="Cooking Pot"
                                width={240}
                                height={240}
                                className="relative z-10"
                                priority
                            />
                        )}
                    </motion.div>
                </div>

                {/* Progress bar — only visible while cooking */}
                {cookingState === 'cooking' && (
                    <div className="mt-2 flex flex-col items-center gap-1.5">
                        <p className="text-xs text-deep-brown/45">
                            {isZh ? '⏳ AI 施法中，约 2 分钟…' : '⏳ AI is cooking, ~2 min…'}
                        </p>
                        <div className="h-1 w-36 bg-deep-brown/10 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full w-1/3 rounded-full"
                                style={{ background: 'linear-gradient(90deg, #C8956C, #F0C060, #C8956C)' }}
                                initial={{ x: '-100%' }}
                                animate={{ x: '300%' }}
                                transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* ─── Selected Ingredients ─── */}
            {/* Mobile: auto-height (page scrolls); Desktop: flex-1 with internal scroll */}
            <div id="tour-magic-pot" className="panel-section md:flex-1 md:flex md:flex-col md:min-h-0">
                <h3 className="text-base font-bold text-deep-brown mb-2 tracking-widest uppercase text-center shrink-0">
                    {isZh ? '📋 已选食材' : '📋 Selected Ingredients'}
                </h3>
                <div className="md:flex-1 md:relative mt-1">
                    <div className="md:absolute md:inset-0 md:overflow-y-auto custom-scrollbar pr-2 pb-2">
                        <div className="space-y-2">
                            <AnimatePresence>
                                {selectedIngredients.length === 0 && (
                                    <p className="text-center text-sm text-deep-brown/40 py-4">
                                        {isZh ? '从食材库选择食材' : 'Pick ingredients from the pantry'}
                                    </p>
                                )}
                                {selectedIngredients.map(si => (
                                    <motion.div
                                        key={si.ingredient.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 10 }}
                                        className="flex items-center gap-2 bg-warm-bg rounded-lg px-3 py-2"
                                    >
                                        <Image
                                            src={si.ingredient.icon}
                                            alt={si.ingredient.name}
                                            width={32} height={32}
                                            className="rounded"
                                        />
                                        <span className="flex-1 text-base text-deep-brown font-medium truncate">
                                            {isZh ? si.ingredient.name : si.ingredient.name_en}
                                        </span>
                                        <button
                                            className="w-7 h-7 rounded bg-panel-border/30 text-deep-brown font-bold text-base flex items-center justify-center hover:bg-chef-red/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                            disabled={cookingState === 'cooking'}
                                            onClick={() => decrementIngredient(si.ingredient.id)}
                                        >
                                            −
                                        </button>
                                        <span className="w-7 text-center text-base font-bold text-deep-brown">{si.quantity}</span>
                                        <button
                                            className="w-7 h-7 rounded bg-panel-border/30 text-deep-brown font-bold text-base flex items-center justify-center hover:bg-herb-green/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                            disabled={cookingState === 'cooking'}
                                            onClick={() => incrementIngredient(si.ingredient.id)}
                                        >
                                            +
                                        </button>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>

            {/* ─── Generate Button ─── */}
            <motion.button
                id="tour-generate-btn"
                className="btn-generate"
                disabled={selectedIngredients.length === 0 || cookingState === 'cooking'}
                whileHover={selectedIngredients.length > 0 ? { scale: 1.02 } : {}}
                whileTap={selectedIngredients.length > 0 ? { scale: 0.98 } : {}}
                onClick={handleCook}
            >
                {cookingState === 'cooking'
                    ? (isZh ? '🔥 烹饪中...' : '🔥 Cooking...')
                    : (isZh ? '🍳 开始烹饪' : '🍳 GENERATE')
                }
            </motion.button>

            {/* ─── Error Modal ─── */}
            <AnimatePresence>
                {errorMsg && (
                    <motion.div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setErrorMsg(null)}
                    >
                        <motion.div
                            className="bg-marble text-deep-brown rounded-2xl p-8 max-w-sm w-full mx-4 shadow-2xl border-2 border-panel-border text-center"
                            initial={{ scale: 0.85, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.85, opacity: 0 }}
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="text-4xl mb-4">🚫</div>
                            <p className="text-base font-medium leading-relaxed mb-6 text-deep-brown/80">
                                {errorMsg}
                            </p>
                            <button
                                className="px-8 py-2.5 rounded-xl bg-wood-gold text-white font-bold text-base hover:bg-oak-brown border border-oak-brown transition-colors"
                                onClick={() => setErrorMsg(null)}
                            >
                                {isZh ? '重新选择' : 'Try Again'}
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
