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

    return (
        <aside className="style-panel h-full overflow-y-auto space-y-3 pr-1">
            {/* ─── Cooking Style ─── */}
            <div className="panel-section flex flex-col min-h-0 flex-shrink-0">
                <h3 className="text-base font-bold text-deep-brown mb-3 tracking-wide shrink-0">
                    {isZh ? '菜系选择' : 'Cooking Style'}
                </h3>
                <div className="space-y-0.5">
                    {CUISINES.map(c => {
                        // Map cuisine ID to the image filename
                        const imgName = c.id === 'middle-eastern' ? 'cuisine_middle_eastern.png' :
                            c.id === 'southeast-asian' ? 'cuisine_southeast_asian.png' :
                                c.id === 'latin-american' ? 'cuisine_latin.png' :
                                    `cuisine_${c.id}.png`;

                        return (
                            <div key={c.id}>
                                <button
                                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2
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
            </div>

            {/* ─── Mode Toggle ─── */}
            <div className="panel-section">
                <h3 className="text-base font-bold text-deep-brown mb-3 tracking-wide">
                    {isZh ? '模式' : 'Mode'}
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
            <div className="panel-section">
                <h3 className="text-base font-bold text-deep-brown mb-3 tracking-wide">
                    {isZh ? '口味倾向' : 'Taste Sliders'}
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
            </div>

            {/* ─── Wildness ─── */}
            <div className="panel-section">
                <h3 className="text-base font-bold text-deep-brown mb-3 tracking-wide">
                    {isZh ? '🔥 狂野指数' : '🔥 Wildness'}
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
