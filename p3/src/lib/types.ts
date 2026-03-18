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
    quantity_en?: string; // Optional if AI provides localized quantity
    unit: string;
    unit_en: string;
}

export interface RecipeStep {
    step: number;
    instruction: string;
    instruction_en: string;
    duration: string;
    duration_en: string;
    tip?: string;
    tip_en?: string;
}

export interface Recipe {
    name: string;
    name_en: string;
    risk_rate: number;
    risk_reason: string;
    risk_reason_en: string;
    description: string;
    description_en: string;
    cuisine: string;
    cuisine_en: string;
    consumed_ingredients: RecipeIngredient[];
    extra_ingredients: RecipeIngredient[];
    seasonings: RecipeIngredient[];
    steps: RecipeStep[];
    origin: {
        original_dish: string;
        original_dish_en: string;
        description: string;
        description_en: string;
    };
    cooking_time: string;
    cooking_time_en: string;
    difficulty: string;
    difficulty_en: string;
    safety_note: string | null;
    safety_note_en: string | null;
    category: string;
    category_en: string;
}

export interface CookResponse {
    recipes: Recipe[];
    total_recipes: number;
}
