'use client';

import { useCookingStore } from '@/stores/cookingStore';
import { motion } from 'framer-motion';
import Image from 'next/image';

export default function LandingPage() {
    const { setView, locale, setLocale } = useCookingStore();
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
            </div>

        </div>
    );
}
