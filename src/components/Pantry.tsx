'use client';

import { useCookingStore } from '@/stores/cookingStore';
import { CATEGORIES, getIngredientsByCategory } from '@/lib/ingredients';
import { IngredientCategory } from '@/lib/types';
import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

export default function Pantry() {
    const { addIngredient, addCustomIngredient, locale, cookingState } = useCookingStore();
    const locked = cookingState === 'cooking';
    const [activeTab, setActiveTab] = useState<IngredientCategory>('vegetables');
    const [showCustomModal, setShowCustomModal] = useState(false);
    const [customName, setCustomName] = useState('');
    const isZh = locale === 'zh';

    const ingredients = getIngredientsByCategory(activeTab);

    const handleAddCustom = () => {
        if (customName.trim()) {
            addCustomIngredient(customName.trim(), customName.trim());
            setCustomName('');
            setShowCustomModal(false);
        }
    };

    return (
        <div id="tour-pantry" className="pantry flex flex-col md:h-full">
            <div className="panel-section flex flex-col md:flex-1 md:min-h-0">
                <h3 className="text-base font-bold text-deep-brown mb-3 tracking-widest uppercase text-center shrink-0">
                    {isZh ? '🧺 食材库' : '🧺 Pantry'}
                </h3>

                {/* ─── Category Tabs ─── */}
                <div className="grid grid-cols-4 gap-2 mb-3 shrink-0">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat.id}
                            className={`px-2 py-2 rounded-lg text-sm font-semibold transition-all text-center
                                ${activeTab === cat.id
                                    ? 'bg-wood-gold text-white shadow-sm'
                                    : 'bg-warm-bg text-deep-brown/70 hover:bg-wood-gold/20 border border-panel-border/50'
                                } disabled:opacity-40 disabled:cursor-not-allowed`}
                            disabled={locked}
                            onClick={() => setActiveTab(cat.id)}
                        >
                            {isZh ? cat.name : cat.name_en}
                        </button>
                    ))}
                </div>

                {/* ─── Ingredient Grid ─── */}
                {/* Mobile: page scrolls, no flex-1 needed. Desktop: flex-1 min-h-0 keeps it inside the panel */}
                <div className="md:flex-1 md:min-h-0 md:overflow-y-auto custom-scrollbar pr-1 pb-2">
                    <div className="grid grid-cols-4 gap-3">
                        {ingredients.map(ing => (
                            <motion.button
                                key={ing.id}
                                className="flex flex-col items-center p-2.5 rounded-xl bg-warm-bg hover:bg-wood-gold/10 transition-colors border border-transparent hover:border-wood-gold/30 disabled:opacity-40 disabled:cursor-not-allowed"
                                whileTap={locked ? {} : { scale: 0.85 }}
                                disabled={locked}
                                onClick={() => { if (!locked) addIngredient(ing); }}
                            >
                                <motion.div
                                    whileTap={{ scale: 1.3, y: -8 }}
                                    transition={{ type: 'spring', stiffness: 300 }}
                                >
                                    <Image
                                        src={ing.icon}
                                        alt={ing.name}
                                        width={56} height={56}
                                        className="rounded-full"
                                    />
                                </motion.div>
                                <span className="text-xs text-deep-brown/70 mt-1.5 truncate w-full text-center font-medium">
                                    {isZh ? ing.name : ing.name_en}
                                </span>
                            </motion.button>
                        ))}
                    </div>
                </div>

                {/* ─── Custom Ingredient Button — inside panel so it's always reachable ─── */}
                <motion.button
                    className="shrink-0 mt-3 flex items-center justify-center gap-2 py-2.5 rounded-xl
                        bg-warm-bg border border-panel-border/60 hover:border-wood-gold/50 hover:bg-wood-gold/10
                        transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    animate={locked ? {} : { boxShadow: ['0 0 0px rgba(200,149,108,0)', '0 0 8px rgba(200,149,108,0.25)', '0 0 0px rgba(200,149,108,0)'] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    disabled={locked}
                    onClick={() => { if (!locked) setShowCustomModal(true); }}
                >
                    <Image src="/assets/icon_custom_basket.png" alt="basket" width={28} height={28} className="object-contain" />
                    <span className="text-sm font-bold text-deep-brown">
                        {isZh ? '✨ 添加自定义食材' : '✨ Add Custom'}
                    </span>
                </motion.button>
            </div>

            {/* ─── Custom Ingredient Modal ─── */}
            {showCustomModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowCustomModal(false)}>
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-panel-bg border-2 border-panel-border rounded-2xl p-6 w-96 max-w-[92vw] shadow-2xl"
                        onClick={e => e.stopPropagation()}
                    >
                        <h3 className="text-xl font-bold text-deep-brown mb-4">
                            {isZh ? '🧺 添加食材' : '🧺 Add Ingredient'}
                        </h3>
                        <input
                            type="text"
                            value={customName}
                            onChange={e => setCustomName(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleAddCustom()}
                            placeholder={isZh ? '输入任何食材...哪怕是月亮' : 'Enter anything...even the moon'}
                            className="w-full px-4 py-3 bg-warm-bg rounded-xl text-deep-brown text-base outline-none ring-1 ring-panel-border focus:ring-wood-gold transition-all placeholder:text-deep-brown/30"
                            autoFocus
                        />
                        <div className="flex gap-3 mt-5">
                            <button
                                className="flex-1 py-2.5 rounded-xl bg-warm-bg text-deep-brown/60 text-base font-medium hover:bg-warm-bg/80 border border-panel-border"
                                onClick={() => setShowCustomModal(false)}
                            >
                                {isZh ? '取消' : 'Cancel'}
                            </button>
                            <button
                                className="flex-1 py-2.5 rounded-xl bg-wood-gold text-white text-base font-semibold hover:bg-oak-brown border border-oak-brown"
                                onClick={handleAddCustom}
                            >
                                {isZh ? '添加' : 'Add'}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
