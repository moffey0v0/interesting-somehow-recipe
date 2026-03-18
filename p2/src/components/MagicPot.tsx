'use client';

import { useCookingStore } from '@/stores/cookingStore';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { checkSafety } from '@/lib/safety';

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
    } = useCookingStore();
    const isZh = locale === 'zh';

    const handleCook = () => {
        if (selectedIngredients.length === 0) return;

        const names = selectedIngredients.map(si => si.ingredient.name);
        const result = checkSafety(names);

        if (!result.safe) {
            setCookingState('fail');
            setTimeout(() => {
                alert(result.message);
                setCookingState('idle');
            }, 1200);
            return;
        }

        setCookingState('cooking');

        setTimeout(() => {
            setCookingState('success');
            setRecipes([
                {
                    name: '蜜汁蒜香排骨',
                    name_en: 'Honey Garlic Ribs',
                    risk_rate: 15,
                    description: '用蜂蜜和大蒜打造的香甜排骨',
                    cuisine: '中餐',
                    consumed_ingredients: selectedIngredients.slice(0, 3).map(si => ({
                        name: si.ingredient.name, name_en: si.ingredient.name_en, quantity: si.quantity, unit: '份',
                    })),
                    extra_ingredients: [
                        { name: '生抽', name_en: 'Light Soy Sauce', quantity: '2勺', unit: '' },
                        { name: '老抽', name_en: 'Dark Soy Sauce', quantity: '1勺', unit: '' },
                        { name: '料酒', name_en: 'Cooking Wine', quantity: '适量', unit: '' },
                    ],
                    seasonings: [{ name: '胡椒粉', name_en: 'Pepper', quantity: '适量', unit: '' }],
                    steps: [
                        { step: 1, instruction: '排骨焯水去血沫，捞出备用', duration: '5分钟' },
                        { step: 2, instruction: '锅热油，加蒜末爆香', duration: '2分钟' },
                        { step: 3, instruction: '放入排骨翻炒，加入调料', duration: '5分钟' },
                        { step: 4, instruction: '小火焖煮30分钟至入味', duration: '30分钟' },
                        { step: 5, instruction: '大火收汁，淋蜂蜜出锅', duration: '3分钟' },
                    ],
                    origin: { original_dish: '红烧排骨', description: '经典红烧手法，加入蜂蜜提鲜增甜' },
                    cooking_time: '45分钟', difficulty: '中等', safety_note: null, category: '主菜',
                },
                {
                    name: '宫保鸡丁',
                    name_en: 'Kung Pao Chicken',
                    risk_rate: 25,
                    description: '经典川菜，麻辣鲜香',
                    cuisine: '中餐-川菜',
                    consumed_ingredients: selectedIngredients.slice(0, 2).map(si => ({
                        name: si.ingredient.name, name_en: si.ingredient.name_en, quantity: si.quantity, unit: '份',
                    })),
                    extra_ingredients: [
                        { name: '花生米', name_en: 'Peanuts', quantity: '50g', unit: '' },
                        { name: '干辣椒', name_en: 'Dried Chili', quantity: '5个', unit: '' },
                    ],
                    seasonings: [
                        { name: '姜', name_en: 'Ginger', quantity: '3片', unit: '' },
                        { name: '葱', name_en: 'Green Onion', quantity: '2根', unit: '' },
                        { name: '豆瓣酱', name_en: 'Bean Paste', quantity: '1勺', unit: '' },
                        { name: '醋', name_en: 'Vinegar', quantity: '适量', unit: '' },
                    ],
                    steps: [
                        { step: 1, instruction: '鸡胸肉切丁，加淀粉腌制', duration: '10分钟' },
                        { step: 2, instruction: '热油炸花生米至金黄，捞出', duration: '3分钟' },
                        { step: 3, instruction: '爆香干辣椒和花椒', duration: '1分钟' },
                        { step: 4, instruction: '放入鸡丁翻炒至变色', duration: '3分钟' },
                        { step: 5, instruction: '调入宫保汁，翻炒均匀', duration: '2分钟' },
                    ],
                    origin: { original_dish: '宫保鸡丁', description: '正宗川菜做法' },
                    cooking_time: '20分钟', difficulty: '简单', safety_note: null, category: '主菜',
                },
                {
                    name: '西红柿炒鸡蛋',
                    name_en: 'Tomato Egg Stir-fry',
                    risk_rate: 10,
                    description: '国民家常菜，简单美味',
                    cuisine: '中餐',
                    consumed_ingredients: [
                        { name: '鸡蛋', name_en: 'Eggs', quantity: 3, unit: '个' },
                        { name: '西红柿', name_en: 'Tomato', quantity: 2, unit: '个' },
                    ],
                    extra_ingredients: [
                        { name: '青椒', name_en: 'Green Pepper', quantity: '1个', unit: '' },
                        { name: '大葱', name_en: 'Green Onion', quantity: '1根', unit: '' },
                    ],
                    seasonings: [
                        { name: '油', name_en: 'Oil', quantity: '适量', unit: '' },
                        { name: '盐', name_en: 'Salt', quantity: '适量', unit: '' },
                        { name: '糖', name_en: 'Sugar', quantity: '少许', unit: '' },
                    ],
                    steps: [
                        { step: 1, instruction: '鸡蛋打散，西红柿切块', duration: '3分钟' },
                        { step: 2, instruction: '热油炒蛋，拨散盛出', duration: '2分钟' },
                        { step: 3, instruction: '少油炒西红柿出汁', duration: '3分钟' },
                        { step: 4, instruction: '加入鸡蛋翻炒，调味出锅', duration: '2分钟' },
                    ],
                    origin: { original_dish: '西红柿炒鸡蛋', description: '最经典的中国家常菜' },
                    cooking_time: '10分钟', difficulty: '简单', safety_note: null, category: '主菜',
                },
            ]);
            setView('result');
        }, 3000);
    };

    return (
        <div className="magic-pot h-full flex flex-col gap-3">
            {/* ─── Cauldron Section ─── */}
            <div className="panel-section flex flex-col items-center shrink-0">
                <h3 className="text-base font-bold text-deep-brown mb-2 tracking-widest uppercase w-full text-center">
                    {isZh ? '🍲 烹饪锅' : '🍲 Cauldron'}
                </h3>

                {/* Pot */}
                <div className="relative h-44 flex items-center justify-center w-full">
                    <motion.div className="relative transform scale-75 origin-top mt-20">
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
            </div>

            {/* ─── Selected Ingredients ─── */}
            <div className="panel-section flex-1 flex flex-col min-h-0">
                <h3 className="text-base font-bold text-deep-brown mb-2 tracking-widest uppercase text-center shrink-0">
                    {isZh ? '📋 已选食材' : '📋 Selected Ingredients'}
                </h3>
                <div className="flex-1 relative mt-1">
                    <div className="absolute inset-0 overflow-y-auto custom-scrollbar pr-2 pb-2">
                        <div className="space-y-2">
                            <AnimatePresence>
                                {selectedIngredients.length === 0 && (
                                    <p className="text-center text-sm text-deep-brown/40 py-4">
                                        {isZh ? '从右侧选择食材 →' : 'Pick from the right →'}
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
                                            className="w-7 h-7 rounded bg-panel-border/30 text-deep-brown font-bold text-base flex items-center justify-center hover:bg-chef-red/20 transition-colors"
                                            onClick={() => decrementIngredient(si.ingredient.id)}
                                        >
                                            −
                                        </button>
                                        <span className="w-7 text-center text-base font-bold text-deep-brown">{si.quantity}</span>
                                        <button
                                            className="w-7 h-7 rounded bg-panel-border/30 text-deep-brown font-bold text-base flex items-center justify-center hover:bg-herb-green/20 transition-colors"
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
        </div>
    );
}
