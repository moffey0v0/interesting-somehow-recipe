'use client';

import LandingPage from '@/components/LandingPage';
import Header from '@/components/Header';
import StylePanel from '@/components/StylePanel';
import MagicPot from '@/components/MagicPot';
import Pantry from '@/components/Pantry';
import KitchenCounter from '@/components/KitchenCounter';
import { useCookingStore } from '@/stores/cookingStore';

export default function Home() {
  const { view } = useCookingStore();

  if (view === 'landing') {
    return <LandingPage />;
  }

  if (view === 'result') {
    return <KitchenCounter />;
  }

  // Cooking view
  return (
    <div className="h-screen w-screen overflow-hidden bg-warm-bg flex flex-col">
      <Header />
      <main className="flex-1 overflow-hidden p-6 pt-4">
        <div className="h-full flex gap-6 max-w-7xl mx-auto">
          <div className="w-[300px] shrink-0 h-full overflow-y-auto custom-scrollbar rounded-2xl pb-4">
            <StylePanel />
          </div>
          <div className="flex-1 shrink-0 h-full overflow-hidden flex flex-col">
            <MagicPot />
          </div>
          <div className="w-[420px] shrink-0 h-full overflow-y-auto custom-scrollbar rounded-2xl pb-4">
            <Pantry />
          </div>
        </div>
      </main>
    </div>
  );
}
