'use client';

import { useState } from 'react';
import LandingPage from '@/components/LandingPage';
import Header from '@/components/Header';
import StylePanel from '@/components/StylePanel';
import MagicPot from '@/components/MagicPot';
import Pantry from '@/components/Pantry';
import KitchenCounter from '@/components/KitchenCounter';
import TutorialTour from '@/components/TutorialTour';
import { useCookingStore } from '@/stores/cookingStore';

export default function Home() {
  const { view, locale } = useCookingStore();
  const isZh = locale === 'zh';
  const [mobileTab, setMobileTab] = useState<'style' | 'pantry'>('pantry');

  if (view === 'landing') return <LandingPage />;
  if (view === 'result') return <KitchenCounter />;

  return (
    <div className="min-h-screen md:h-screen w-screen overflow-y-auto md:overflow-hidden bg-warm-bg flex flex-col">
      <Header />

      {/*
       * Layout:
       *   Desktop (md+) : StylePanel | MagicPot | Pantry  — horizontal 3-column, h-screen fixed
       *   Mobile (<md)  : MagicPot (fixed height) + tab bar (sticky bottom) + active tab panel
       *                   Whole page scrolls naturally — no internal overflow clipping
       */}
      <div className="flex flex-col md:flex-row md:p-6 md:pt-4 md:gap-6 md:flex-1 md:min-h-0 md:overflow-hidden">

        {/* ── StylePanel ──────────────────────────────────────────────────────
            Desktop : left column, always visible, internal scroll
            Mobile  : shown only when style tab is active, below the pot, no height cap */}
        <div className={[
          'order-2 md:order-1',
          mobileTab === 'style' ? 'block' : 'hidden',
          'md:block',
          'shrink-0',
          'md:h-full md:w-[300px]',
          'md:overflow-y-auto md:custom-scrollbar',
          'p-3 md:p-0 md:pb-4',
          'rounded-2xl',
        ].join(' ')}>
          <StylePanel />
        </div>

        {/* ── MagicPot ────────────────────────────────────────────────────────
            Desktop : center column, fills remaining height
            Mobile  : always at top, fixed height so generate button stays reachable */}
        <div className={[
          'order-1 md:order-2',
          'h-[400px] md:h-auto',
          'md:flex-1 md:min-h-0',
          'overflow-hidden flex flex-col',
          'px-3 pt-2 pb-1 md:p-0',
        ].join(' ')}>
          <MagicPot />
        </div>

        {/* ── Pantry ──────────────────────────────────────────────────────────
            Desktop : right column, always visible, internal scroll
            Mobile  : shown only when pantry tab is active, no height cap (page scrolls) */}
        <div className={[
          'order-3',
          mobileTab === 'pantry' ? 'block' : 'hidden',
          'md:block',
          'shrink-0',
          'md:h-full md:w-[420px]',
          'md:overflow-y-auto md:custom-scrollbar',
          'p-3 md:p-0 md:pb-4',
          'rounded-2xl',
        ].join(' ')}>
          <Pantry />
        </div>
      </div>

      <TutorialTour onMobileTabSwitch={setMobileTab} />

      {/* ── Mobile tab bar: sticky at bottom of viewport while scrolling ──── */}
      <div className="md:hidden sticky bottom-0 z-20 flex bg-panel-bg border-t-2 border-panel-border">
        <button
          className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-1.5 transition-colors
            ${mobileTab === 'style'
              ? 'text-wood-gold border-t-2 border-wood-gold -mt-px'
              : 'text-deep-brown/50 hover:text-deep-brown/70'}`}
          onClick={() => setMobileTab('style')}
        >
          ⚙️ {isZh ? '设置' : 'Settings'}
        </button>
        <div className="w-px bg-panel-border" />
        <button
          className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-1.5 transition-colors
            ${mobileTab === 'pantry'
              ? 'text-wood-gold border-t-2 border-wood-gold -mt-px'
              : 'text-deep-brown/50 hover:text-deep-brown/70'}`}
          onClick={() => setMobileTab('pantry')}
        >
          🥬 {isZh ? '食材库' : 'Pantry'}
        </button>
      </div>
    </div>
  );
}
