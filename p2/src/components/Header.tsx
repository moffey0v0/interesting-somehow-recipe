'use client';

import { useCookingStore } from '@/stores/cookingStore';
import Image from 'next/image';

export default function Header() {
    const { locale, setLocale, setView } = useCookingStore();
    const isZh = locale === 'zh';

    return (
        <header className="flex items-center justify-between px-6 py-3 bg-panel-bg border-b-2 border-panel-border">
            <div
                className="flex items-center gap-3 cursor-pointer"
                onClick={() => setView('landing')}
            >
                <Image src="/assets/logo.png" alt="Logo" width={42} height={42} className="rounded-lg" />
                <h1 className="text-xl font-display font-bold text-deep-brown">
                    {isZh ? '应该有趣？食谱' : 'Interesting Somehow Recipe'}
                </h1>
            </div>
            <button
                className="px-4 py-2 rounded-lg bg-wood-gold/20 text-deep-brown text-base font-semibold hover:bg-wood-gold/30 transition-colors border border-panel-border"
                onClick={() => setLocale(isZh ? 'en' : 'zh')}
            >
                {isZh ? 'EN' : '中文'}
            </button>
        </header>
    );
}
