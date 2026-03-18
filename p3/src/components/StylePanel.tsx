'use client';

import { useCookingStore } from '@/stores/cookingStore';
import { CUISINES } from '@/lib/cuisines';
import { TasteProfile } from '@/lib/types';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

const TASTE_KEYS: { key: keyof TasteProfile; label: string; label_en: string; icon: string }[] = [
    { key: 'sour', label: '酸', label_en: 'Sour', icon: '/assets/icons/taste_sliders/taste_sour.png' },
    { key: 'sweet', label: '甜', label_en: 'Sweet', icon: '/assets/icons/taste_sliders/taste_sweet.png' },
    { key: 'bitter', label: '苦', label_en: 'Bitter', icon: '/assets/icons/taste_sliders/taste_bitter.png' },
    { key: 'spicy', label: '辣', label_en: 'Spicy', icon: '/assets/icons/taste_sliders/taste_spicy.png' },
    { key: 'salty', label: '咸', label_en: 'Salty', icon: '/assets/icons/taste_sliders/taste_salty.png' },
];

export default function StylePanel() {
    const { cuisineMain, cuisineSub, setCuisine, mode, setMode, taste, setTaste, wildness, setWildness, locale } = useCookingStore();
    const [expandedCuisine, setExpandedCuisine] = useState<string | null>(null);
    const isZh = locale === 'zh';

    const allTastesZero = Object.values(taste).every(v => v === 0);
    const cuisineNotSelected = cuisineMain === null;

    const glowAnim = {
        boxShadow: [
            '0 0 0px rgba(200,149,108,0)',
            '0 0 14px rgba(200,149,108,0.45)',
            '0 0 0px rgba(200,149,108,0)',
        ],
    };
    const glowTransition = { duration: 2, repeat: Infinity, ease: 'easeInOut' as const };
    const noGlow = { boxShadow: '0 0 0px rgba(0,0,0,0)' };

    return (
        <aside id="tour-style-panel" className="style-panel space-y-3 pr-1 pb-2">
            {/* ─── Cooking Style ─── */}
            <motion.div
                className="panel-section flex flex-col min-h-0 flex-shrink-0"
                animate={cuisineNotSelected ? glowAnim : noGlow}
                transition={cuisineNotSelected ? glowTransition : {}}
            >
                <h3 className="text-base font-bold text-deep-brown mb-3 tracking-wide shrink-0">
                    {isZh ? '菜系选择' : 'Cooking Style'}
                </h3>
                {/* max-h limits the cuisine list so Mode/Taste/Wildness sections
                    remain visible below on first load; the list scrolls internally */}
                <div id="tour-cuisine-list" className="space-y-0.5 max-h-40 overflow-y-auto custom-scrollbar pr-1">
                    {CUISINES.map(c => {
                        // Map cuisine ID to the image filename
                        const imgName = c.id === 'middle-eastern' ? 'cuisine_middle_eastern.png' :
                            c.id === 'southeast-asian' ? 'cuisine_southeast_asian.png' :
                                c.id === 'latin-american' ? 'cuisine_latin.png' :
                                    `cuisine_${c.id}.png`;

                        return (
                            <div key={c.id}>
                                <button
                                    className={`w-full text-left px-2 py-1 rounded-lg text-sm transition-colors flex items-center gap-2
                                        ${cuisineMain === c.id
                                            ? 'bg-wood-gold/20 text-deep-brown font-bold border border-wood-gold/40'
                                            : 'text-deep-brown/80 hover:bg-wood-gold/10'
                                        }`}
                                    onClick={() => {
                                        if (c.sub.length === 0) {
                                            setCuisine(c.id, null);
                                            setExpandedCuisine(null);
                                        } else {
                                            setExpandedCuisine(expandedCuisine === c.id ? null : c.id);
                                            if (cuisineMain !== c.id) setCuisine(c.id, null);
                                        }
                                    }}
                                >
                                    <Image src={`/assets/icons/CuisineTypes/${imgName}`} alt="" width={32} height={32} />
                                    <span className="flex-1 text-base ml-2">{isZh ? c.name : c.name_en}</span>
                                    {c.sub.length > 0 && (
                                        <span className="text-sm opacity-50">
                                            {expandedCuisine === c.id ? '▾' : '▸'}
                                        </span>
                                    )}
                                </button>

                                <AnimatePresence>
                                    {expandedCuisine === c.id && c.sub.length > 0 && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden ml-8"
                                        >
                                            {c.sub.map(s => (
                                                <button
                                                    key={s.id}
                                                    className={`w-full text-left px-3 py-1.5 rounded text-sm transition-colors
                                                    ${cuisineSub === s.id
                                                            ? 'bg-wood-gold/30 text-deep-brown font-bold'
                                                            : 'text-deep-brown/60 hover:text-deep-brown'
                                                        }`}
                                                    onClick={() => setCuisine(c.id, s.id)}
                                                >
                                                    {isZh ? s.name : s.name_en}
                                                </button>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    })}
                </div>
            </motion.div>

            {/* ─── Mode Toggle ─── */}
            <div id="tour-mode-taste" className="panel-section">
                <h3 className="relative group text-base font-bold text-deep-brown mb-3 tracking-wide flex items-center gap-1.5">
                    {isZh ? '模式' : 'Mode'}
                    <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-deep-brown/15 text-deep-brown/60 text-xs font-bold cursor-default select-none">?</span>
                    {/* Tooltip: bottom-full keeps it inside the panel (no horizontal overflow) */}
                    <div className="absolute bottom-full mb-1 right-0 w-44 bg-deep-brown text-warm-bg text-xs rounded-xl p-3 shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 z-50 leading-relaxed">
                        <p className="font-bold mb-1">{isZh ? '🌿 生存模式' : '🌿 Survival Mode'}</p>
                        <p className="text-warm-bg/80 mb-2">{isZh ? '只使用你选的食材（加常规调料）。考验创意极限！' : 'Only use your chosen ingredients (plus basic seasoning). Pure creativity!'}</p>
                        <p className="font-bold mb-1">{isZh ? '✨ 创造模式' : '✨ Creative Mode'}</p>
                        <p className="text-warm-bg/80">{isZh ? 'AI 会自由添加辅料提升口味，新增食材会标 * 显示。' : 'AI freely adds extra ingredients to enhance the dish. New ones are marked *.'}</p>
                        <div className="absolute top-full right-3 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-deep-brown" />
                    </div>
                </h3>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                        <Image src="/assets/icons/mode_toggle/mode_survival.png" alt="" width={24} height={24} />
                        <span className={`text-sm font-semibold ${mode === 'survival' ? 'text-herb-green' : 'text-deep-brown/40'}`}>
                            {isZh ? '生存' : 'Survival'}
                        </span>
                    </div>
                    <button
                        className="relative w-14 h-7 rounded-full transition-colors"
                        style={{ backgroundColor: mode === 'creative' ? '#F39C12' : '#5CB85C' }}
                        onClick={() => setMode(mode === 'survival' ? 'creative' : 'survival')}
                    >
                        <motion.div
                            className="absolute top-1 w-5 h-5 rounded-full bg-white shadow-md"
                            animate={{ left: mode === 'creative' ? 32 : 4 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                        />
                    </button>
                    <div className="flex items-center gap-1.5">
                        <Image src="/assets/icons/mode_toggle/mode_creative.png" alt="" width={24} height={24} />
                        <span className={`text-sm font-semibold ${mode === 'creative' ? 'text-creative-orange' : 'text-deep-brown/40'}`}>
                            {isZh ? '创造' : 'Creative'}
                        </span>
                    </div>
                </div>
            </div>

            {/* ─── Taste Sliders ─── */}
            <motion.div
                className="panel-section"
                animate={allTastesZero ? glowAnim : noGlow}
                transition={allTastesZero ? glowTransition : {}}
            >
                <h3 className="text-base font-bold text-deep-brown mb-3 tracking-wide flex items-center gap-2">
                    {isZh ? '口味倾向' : 'Taste Sliders'}
                    {allTastesZero && (
                        <span className="text-xs font-normal text-deep-brown/50 bg-deep-brown/8 rounded-md px-1.5 py-0.5 border border-deep-brown/15">
                            {isZh ? '全0 = 不限制' : 'All 0 = No limit'}
                        </span>
                    )}
                </h3>
                <div className="space-y-3">
                    {TASTE_KEYS.map(t => (
                        <div key={t.key} className="flex items-center gap-2">
                            <span className="w-8 text-sm text-deep-brown/70 font-medium">
                                {isZh ? t.label : t.label_en}
                            </span>
                            <Image src={t.icon} alt="" width={22} height={22} />
                            <input
                                type="range"
                                min={0} max={100}
                                value={taste[t.key]}
                                onChange={e => setTaste(t.key, Number(e.target.value))}
                                className="flex-1"
                            />
                            <span className="w-8 text-right text-sm text-deep-brown/50 font-mono">{taste[t.key]}</span>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* ─── Wildness ─── */}
            <div id="tour-wildness" className="panel-section">
                <h3 className="relative group text-base font-bold text-deep-brown mb-3 tracking-wide flex items-center gap-1.5">
                    {isZh ? '🔥 狂野指数' : '🔥 Wildness'}
                    <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-deep-brown/15 text-deep-brown/60 text-xs font-bold cursor-default select-none">?</span>
                    {/* Tooltip: bottom-full keeps it inside the panel (no horizontal overflow) */}
                    <div className="absolute bottom-full mb-1 right-0 w-44 bg-deep-brown text-warm-bg text-xs rounded-xl p-3 shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 z-50 leading-relaxed">
                        <p className="font-bold mb-0.5">0–20 · {isZh ? '正经家常菜' : 'Classic home-cooking'}</p>
                        <p className="text-warm-bg/70 mb-1.5">{isZh ? '保守搭配，规规矩矩。' : 'Conservative combos, by the book.'}</p>
                        <p className="font-bold mb-0.5">21–50 · {isZh ? '有趣的混搭' : 'Interesting fusion'}</p>
                        <p className="text-warm-bg/70 mb-1.5">{isZh ? '有创意但大众能接受。' : 'Creative but widely acceptable.'}</p>
                        <p className="font-bold mb-0.5">51–80 · {isZh ? '大胆创新！' : 'Bold innovation!'}</p>
                        <p className="text-warm-bg/70 mb-1.5">{isZh ? '非食用物品可解锁创意替代！' : 'Non-food items unlocked as substitutes!'}</p>
                        <p className="font-bold mb-0.5">81–100 · {isZh ? '🤪 疯狂实验！' : '🤪 Mad experiment!'}</p>
                        <p className="text-warm-bg/70">{isZh ? '终极解锁："有毒概念"也可借灵感，AI 只用安全食材替代。' : 'Ultimate unlock: "toxic concepts" as inspiration — AI uses safe substitutes only.'}</p>
                        <div className="absolute top-full right-3 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-deep-brown" />
                    </div>
                </h3>
                <div className="flex items-center gap-2">
                    <span className="text-lg">🔥</span>
                    <input
                        type="range"
                        min={0} max={100}
                        value={wildness}
                        onChange={e => setWildness(Number(e.target.value))}
                        className="flex-1 wildness-slider"
                    />
                    <span className="w-10 text-right text-base font-bold text-chef-red">{wildness}</span>
                </div>
                <p className="text-sm text-deep-brown/50 mt-1.5">
                    {wildness < 20 ? (isZh ? '正经家常菜' : 'Classic home-cooking')
                        : wildness < 50 ? (isZh ? '有趣的混搭' : 'Interesting fusion')
                            : wildness < 80 ? (isZh ? '大胆创新！' : 'Bold innovation!')
                                : (isZh ? '🤪 疯狂实验！' : '🤪 Mad experiment!')}
                </p>
            </div>
        </aside>
    );
}
