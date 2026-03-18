import { create } from 'zustand';
import { CookingMode, CookingState, Ingredient, Recipe, SelectedIngredient, TasteProfile } from '@/lib/types';

type AppView = 'landing' | 'cooking' | 'result';

interface CookingStore {
    // View
    view: AppView;

    // State
    selectedIngredients: SelectedIngredient[];
    cuisineMain: string | null;
    cuisineSub: string | null;
    mode: CookingMode;
    taste: TasteProfile;
    wildness: number;
    cookingState: CookingState;
    recipes: Recipe[];
    locale: 'zh' | 'en';

    // Actions
    setView: (view: AppView) => void;
    addIngredient: (ingredient: Ingredient) => void;
    removeIngredient: (ingredientId: string) => void;
    decrementIngredient: (ingredientId: string) => void;
    incrementIngredient: (ingredientId: string) => void;
    addCustomIngredient: (name: string, name_en: string) => void;
    setCuisine: (main: string | null, sub: string | null) => void;
    setMode: (mode: CookingMode) => void;
    setTaste: (key: keyof TasteProfile, value: number) => void;
    setWildness: (value: number) => void;
    setCookingState: (state: CookingState) => void;
    setRecipes: (recipes: Recipe[]) => void;
    setLocale: (locale: 'zh' | 'en') => void;
    reset: () => void;
}

const initialTaste: TasteProfile = { sour: 0, sweet: 0, bitter: 0, spicy: 0, salty: 0 };

export const useCookingStore = create<CookingStore>((set) => ({
    view: 'landing',
    selectedIngredients: [],
    cuisineMain: 'random',
    cuisineSub: null,
    mode: 'creative',
    taste: { ...initialTaste },
    wildness: 50,
    cookingState: 'idle',
    recipes: [],
    locale: 'zh',

    setView: (view) => set({ view }),

    addIngredient: (ingredient) =>
        set((s) => {
            const existing = s.selectedIngredients.find(si => si.ingredient.id === ingredient.id);
            if (existing) {
                return {
                    selectedIngredients: s.selectedIngredients.map(si =>
                        si.ingredient.id === ingredient.id
                            ? { ...si, quantity: si.quantity + 1 }
                            : si
                    ),
                };
            }
            return { selectedIngredients: [...s.selectedIngredients, { ingredient, quantity: 1 }] };
        }),

    removeIngredient: (ingredientId) =>
        set((s) => ({
            selectedIngredients: s.selectedIngredients.filter(si => si.ingredient.id !== ingredientId),
        })),

    decrementIngredient: (ingredientId) =>
        set((s) => {
            const existing = s.selectedIngredients.find(si => si.ingredient.id === ingredientId);
            if (!existing) return s;
            if (existing.quantity <= 1) {
                return { selectedIngredients: s.selectedIngredients.filter(si => si.ingredient.id !== ingredientId) };
            }
            return {
                selectedIngredients: s.selectedIngredients.map(si =>
                    si.ingredient.id === ingredientId
                        ? { ...si, quantity: si.quantity - 1 }
                        : si
                ),
            };
        }),

    incrementIngredient: (ingredientId) =>
        set((s) => ({
            selectedIngredients: s.selectedIngredients.map(si =>
                si.ingredient.id === ingredientId
                    ? { ...si, quantity: si.quantity + 1 }
                    : si
            ),
        })),

    addCustomIngredient: (name, name_en) =>
        set((s) => {
            const id = `custom_${Date.now()}`;
            const custom: Ingredient = {
                id, name, name_en,
                category: 'vegetables',
                icon: '/assets/icon_custom_orb.png',
            };
            return { selectedIngredients: [...s.selectedIngredients, { ingredient: custom, quantity: 1 }] };
        }),

    setCuisine: (main, sub) => set({ cuisineMain: main, cuisineSub: sub }),
    setMode: (mode) => set({ mode }),
    setTaste: (key, value) => set((s) => ({ taste: { ...s.taste, [key]: value } })),
    setWildness: (value) => set({ wildness: value }),
    setCookingState: (state) => set({ cookingState: state }),
    setRecipes: (recipes) => set({ recipes }),
    setLocale: (locale) => set({ locale }),
    reset: () => set({
        selectedIngredients: [],
        cuisineMain: 'random',
        cuisineSub: null,
        mode: 'creative',
        taste: { ...initialTaste },
        wildness: 50,
        cookingState: 'idle',
        recipes: [],
    }),
}));
