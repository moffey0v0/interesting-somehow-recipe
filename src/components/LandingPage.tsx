'use client';

import { useCookingStore } from '@/stores/cookingStore';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useState } from 'react';

export default function LandingPage() {
    const { setView, locale, setLocale } = useCookingStore();
    const [showAbout, setShowAbout] = useState(false);
    const isZh = locale === 'zh';

    return (
        <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="/assets/bg_kitchen.png"
                    alt="Kitchen Background"
                    fill
                    className="object-cover"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/5" />
            </div>

            {/* Language Toggle */}
            <button
                className="absolute top-5 right-5 z-20 px-4 py-2 rounded-xl bg-white/80 text-deep-brown text-base font-bold hover:bg-white transition-colors shadow-lg backdrop-blur-sm border border-panel-border"
                onClick={() => setLocale(isZh ? 'en' : 'zh')}
            >
                {isZh ? 'EN' : '中文'}
            </button>

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center text-center px-4 -mt-20">
                {/* Title with glow */}
                <motion.div
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <h1
                        className="font-display text-6xl md:text-7xl font-bold leading-tight"
                        style={{
                            color: '#5C3D2E',
                            textShadow: '0 0 20px rgba(240, 213, 140, 0.6), 0 0 40px rgba(240, 213, 140, 0.3), 0 2px 4px rgba(0,0,0,0.1)',
                        }}
                    >
                        {isZh ? (
                            <>应该有趣？<br />食谱</>
                        ) : (
                            <>Interesting<br />Somehow Recipe</>
                        )}
                    </h1>
                </motion.div>

                {/* Subtitle with glow */}
                <motion.p
                    className="mt-5 text-xl md:text-2xl font-semibold max-w-lg"
                    style={{
                        color: '#5C3D2E',
                        textShadow: '0 0 15px rgba(240, 213, 140, 0.5), 0 1px 3px rgba(0,0,0,0.1)',
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.8 }}
                >
                    {isZh
                        ? '往锅里扔食材，期待未知的烹饪结果！'
                        : 'Throw ingredients in the pot, expect the unexpected!'
                    }
                </motion.p>

                {/* Start Button */}
                <motion.button
                    className="mt-10 px-12 py-5 rounded-2xl bg-wood-gold text-white font-display text-3xl font-bold shadow-xl hover:bg-oak-brown transition-all border-3 border-oak-brown"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8, type: 'spring', stiffness: 200 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setView('cooking')}
                >
                    {isZh ? '🍳 开始烹饪' : '🍳 Start Cooking'}
                </motion.button>

                {/* About Button */}
                <motion.button
                    className="mt-4 px-5 py-2 rounded-xl text-sm font-semibold transition-colors"
                    style={{ color: '#5C3D2E', background: 'rgba(255,255,255,0.55)', backdropFilter: 'blur(6px)', border: '1px solid rgba(92,61,46,0.2)' }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.1 }}
                    whileHover={{ scale: 1.03 }}
                    onClick={() => setShowAbout(true)}
                >
                    {isZh ? '❓ 这是什么？' : '❓ What is this?'}
                </motion.button>
            </div>

            {/* ─── About Modal ─── */}
            <AnimatePresence>
                {showAbout && (
                    <motion.div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowAbout(false)}
                    >
                        <motion.div
                            className="bg-marble text-deep-brown rounded-2xl p-8 max-w-md w-full shadow-2xl border-2 border-panel-border overflow-y-auto max-h-[85vh]"
                            initial={{ scale: 0.88, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.88, opacity: 0 }}
                            onClick={e => e.stopPropagation()}
                        >
                            <h2 className="text-2xl font-bold mb-1">
                                {isZh ? '🍲 大概有趣菜谱' : '🍲 Interesting Somehow Recipe'}
                            </h2>
                            <p className="text-sm text-deep-brown/50 mb-5">
                                {isZh ? 'Interesting Somehow Recipe' : '大概有趣菜谱'}
                            </p>

                            <div className="space-y-4 text-sm text-deep-brown/80 leading-relaxed">
                                <div>
                                    <p className="font-bold text-deep-brown mb-1">{isZh ? '✨ 这是什么？' : '✨ What is this?'}</p>
                                    <p>{isZh
                                        ? '一个受《塞尔达：旷野之息》烹饪玩法启发的 AI 菜谱生成器。把你冰箱里的食材扔进锅里，AI 会帮你生成奇怪但（理论上）可食用的菜谱——娱乐性第一，实用性随缘。'
                                        : 'An AI recipe generator inspired by The Legend of Zelda: Breath of the Wild\'s cooking mechanic. Throw your fridge ingredients in the pot and get weird but (theoretically) edible recipes — fun first, practicality optional.'
                                    }</p>
                                </div>

                                <div>
                                    <p className="font-bold text-deep-brown mb-1">{isZh ? '🧊 什么时候用？' : '🧊 When to use it?'}</p>
                                    <ul className="space-y-1.5 text-deep-brown/70">
                                        <li>🧊 {isZh
                                            ? '冰箱里剩了一堆零散食材不知道怎么处理——扔进来，AI 帮你变道菜！'
                                            : 'Got random leftovers in the fridge and no idea what to cook? Throw them in — AI will figure it out!'
                                        }</li>
                                        <li>🧪 {isZh
                                            ? '也可以单纯做实验：把最离谱的食材组合在一起，看看 AI 创意的极限在哪里。'
                                            : 'Or just experiment: combine the most absurd ingredients and see just how creative (or unhinged) the AI can get.'
                                        }</li>
                                    </ul>
                                </div>

                                <div>
                                    <p className="font-bold text-deep-brown mb-1">{isZh ? '🎮 怎么玩？' : '🎮 How to play?'}</p>
                                    <ol className="list-decimal list-inside space-y-1 text-deep-brown/70">
                                        <li>{isZh ? '从右侧食材库挑选食材，或手动输入自定义食材' : 'Pick ingredients from the pantry, or type custom ones'}</li>
                                        <li>{isZh ? '调整菜系、模式、口味偏好和狂野度' : 'Adjust cuisine, mode, taste, and wildness'}</li>
                                        <li>{isZh ? '点击「开始烹饪」，等待 AI 施法' : 'Hit "Generate" and let the AI work its magic'}</li>
                                        <li>{isZh ? '查看生成的菜谱小纸条，还可以保存为图片！' : 'View your recipe tickets — and save them as images!'}</li>
                                    </ol>
                                </div>

                                <div>
                                    <p className="font-bold text-deep-brown mb-1">{isZh ? '🌿 生存 vs ✨ 创造？' : '🌿 Survival vs ✨ Creative?'}</p>
                                    <p>{isZh
                                        ? '生存模式：AI 只用你提供的食材（加常规调料）。创造模式：AI 会自由添加辅料来提升菜品，新增食材用 * 标注。'
                                        : 'Survival: AI only uses your ingredients (plus basic seasoning). Creative: AI adds extra ingredients freely, marked with *.'
                                    }</p>
                                </div>

                                <div>
                                    <p className="font-bold text-deep-brown mb-1">{isZh ? '🔥 狂野度的秘密' : '🔥 Wildness Explained'}</p>
                                    <ul className="space-y-1 text-deep-brown/70">
                                        <li><span className="font-semibold text-deep-brown">0–20</span>　{isZh ? '正经家常菜，保守搭配' : 'Classic home-cooking, conservative combos'}</li>
                                        <li><span className="font-semibold text-deep-brown">21–50</span>　{isZh ? '有趣混搭，大众能接受' : 'Fun fusion, still crowd-pleasing'}</li>
                                        <li><span className="font-semibold text-deep-brown">51–80</span>　{isZh ? '大胆创新！非食用物品或概念可借此解锁创意替代' : 'Bold innovation! Non-food items or concepts unlocked as creative substitutes'}</li>
                                        <li><span className="font-semibold text-deep-brown">81–100</span>　{isZh ? '🤪 终极解锁！连"有毒概念"也能当灵感——AI 只会用安全食材替代，绝不真的有毒' : '🤪 Ultimate unlock! Even "toxic" concepts become inspiration — AI always substitutes safe ingredients'}</li>
                                    </ul>
                                </div>

                                <div className="bg-deep-brown/5 rounded-xl p-4 border-l-4 border-creative-orange">
                                    <p className="font-bold text-deep-brown mb-1">{isZh ? '⚠️ 免责声明' : '⚠️ Disclaimer'}</p>
                                    <p className="text-deep-brown/60">{isZh
                                        ? '本网站生成的菜谱由 AI 创作，仅供娱乐参考，不构成专业烹饪建议。实际烹饪前请自行判断食材安全性，尤其是过敏原和特殊烹饪要求。网站已内置安全过滤，但 AI 生成内容存在不确定性，请理性对待。'
                                        : 'All recipes are AI-generated for entertainment purposes only and do not constitute professional culinary advice. Please use your own judgment regarding food safety, allergens, and proper cooking techniques before attempting any recipe. While we include safety filters, AI content may be unpredictable — enjoy responsibly.'
                                    }</p>
                                </div>
                            </div>

                            <button
                                className="mt-6 w-full py-3 rounded-xl bg-wood-gold text-white font-bold text-base hover:bg-oak-brown border border-oak-brown transition-colors"
                                onClick={() => setShowAbout(false)}
                            >
                                {isZh ? '明白了，开始玩！' : 'Got it, let\'s cook!'}
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
