// ─── Core Types ───

export type CookingMode = 'survival' | 'creative';

export type CookingState = 'idle' | 'cooking' | 'success' | 'fail';

export interface TasteProfile {
    sour: number;   // 0-100
    sweet: number;
    bitter: number;
    spicy: number;
    salty: number;
}

export interface Ingredient {
    id: string;
    name: string;
    name_en: string;
    category: IngredientCategory;
    icon: string; // path relative to /assets/icons/
}

export interface SelectedIngredient {
    ingredient: Ingredient;
    quantity: number;
}

export type IngredientCategory =
    | 'vegetables' | 'fruits' | 'meat' | 'seafood'
    | 'dairy' | 'drinks' | 'staples' | 'sauces';

export interface CuisineSubCategory {
    id: string;
    name: string;
    name_en: string;
}

export interface CuisineCategory {
    id: string;
    name: string;
    name_en: string;
    emoji: string;
    sub: CuisineSubCategory[];
}

// ─── AI Response Types ───

export interface RecipeIngredient {
    name: string;
    name_en: string;
    quantity: number | string;
    unit: string;
}

export interface RecipeStep {
    step: number;
    instruction: string;
    duration: string;
    tip?: string;
}

export interface Recipe {
    name: string;
    name_en: string;
    risk_rate: number;
    description: string;
    cuisine: string;
    consumed_ingredients: RecipeIngredient[];
    extra_ingredients: RecipeIngredient[];
    seasonings: RecipeIngredient[];
    steps: RecipeStep[];
    origin: {
        original_dish: string;
        description: string;
    };
    cooking_time: string;
    difficulty: string;
    safety_note: string | null;
    category: string;
}

export interface CookResponse {
    recipes: Recipe[];
    total_recipes: number;
}
