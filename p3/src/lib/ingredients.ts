import { Ingredient, IngredientCategory } from './types';

interface CategoryMeta {
    id: IngredientCategory;
    name: string;
    name_en: string;
    tabIcon: string;
}

export const CATEGORIES: CategoryMeta[] = [
    { id: 'vegetables', name: '蔬菜', name_en: 'Vegetables', tabIcon: '/assets/icons/category_tabs/tab_vegetables.png' },
    { id: 'fruits', name: '水果', name_en: 'Fruits', tabIcon: '/assets/icons/category_tabs/tab_fruits.png' },
    { id: 'meat', name: '肉类', name_en: 'Meat', tabIcon: '/assets/icons/category_tabs/tab_meat.png' },
    { id: 'seafood', name: '海鲜', name_en: 'Seafood', tabIcon: '/assets/icons/category_tabs/tab_seafood.png' },
    { id: 'dairy', name: '乳制品', name_en: 'Dairy', tabIcon: '/assets/icons/category_tabs/tab_dairy.png' },
    { id: 'drinks', name: '酒水饮料', name_en: 'Drinks', tabIcon: '/assets/icons/category_tabs/tab_drinks.png' },
    { id: 'staples', name: '主食', name_en: 'Staples', tabIcon: '/assets/icons/category_tabs/tab_staples.png' },
    { id: 'sauces', name: '酱料香料', name_en: 'Sauces', tabIcon: '/assets/icons/category_tabs/tab_sauces.png' },
];

function ing(id: string, name: string, name_en: string, category: IngredientCategory): Ingredient {
    return { id, name, name_en, category, icon: `/assets/icons/${category}/${id}.png` };
}

export const INGREDIENTS: Ingredient[] = [
    // Vegetables
    ing('tomato', '西红柿', 'Tomato', 'vegetables'),
    ing('cabbage', '白菜', 'Cabbage', 'vegetables'),
    ing('potato', '土豆', 'Potato', 'vegetables'),
    ing('carrot', '胡萝卜', 'Carrot', 'vegetables'),
    ing('onion', '洋葱', 'Onion', 'vegetables'),
    ing('cucumber', '黄瓜', 'Cucumber', 'vegetables'),
    ing('eggplant', '茄子', 'Eggplant', 'vegetables'),
    ing('pepper', '辣椒', 'Pepper', 'vegetables'),
    ing('mushroom', '蘑菇', 'Mushroom', 'vegetables'),
    ing('corn', '玉米', 'Corn', 'vegetables'),
    ing('lettuce', '生菜', 'Lettuce', 'vegetables'),
    ing('broccoli', '西兰花', 'Broccoli', 'vegetables'),

    // Fruits
    ing('apple', '苹果', 'Apple', 'fruits'),
    ing('banana', '香蕉', 'Banana', 'fruits'),
    ing('strawberry', '草莓', 'Strawberry', 'fruits'),
    ing('lemon', '柠檬', 'Lemon', 'fruits'),
    ing('orange', '橙子', 'Orange', 'fruits'),
    ing('watermelon', '西瓜', 'Watermelon', 'fruits'),
    ing('grape', '葡萄', 'Grape', 'fruits'),
    ing('mango', '芒果', 'Mango', 'fruits'),

    // Meat
    ing('pork', '猪肉', 'Pork', 'meat'),
    ing('beef', '牛肉', 'Beef', 'meat'),
    ing('chicken', '鸡肉', 'Chicken', 'meat'),
    ing('mutton', '羊肉', 'Mutton', 'meat'),
    ing('bacon', '培根', 'Bacon', 'meat'),
    ing('sausage', '香肠', 'Sausage', 'meat'),
    ing('ground_meat', '肉末', 'Ground Meat', 'meat'),
    ing('ribs', '排骨', 'Ribs', 'meat'),

    // Seafood
    ing('shrimp', '虾', 'Shrimp', 'seafood'),
    ing('fish', '鱼', 'Fish', 'seafood'),
    ing('crab', '螃蟹', 'Crab', 'seafood'),
    ing('shellfish', '贝类', 'Shellfish', 'seafood'),
    ing('squid', '鱿鱼', 'Squid', 'seafood'),
    ing('salmon', '三文鱼', 'Salmon', 'seafood'),

    // Dairy
    ing('milk', '牛奶', 'Milk', 'dairy'),
    ing('eggs', '鸡蛋', 'Eggs', 'dairy'),
    ing('cheese', '芝士', 'Cheese', 'dairy'),
    ing('butter', '黄油', 'Butter', 'dairy'),
    ing('yogurt', '酸奶', 'Yogurt', 'dairy'),

    // Drinks
    ing('beer', '啤酒', 'Beer', 'drinks'),
    ing('wine', '红酒', 'Wine', 'drinks'),
    ing('cola', '可乐', 'Cola', 'drinks'),
    ing('sprite', '雪碧', 'Sprite', 'drinks'),
    ing('juice', '果汁', 'Juice', 'drinks'),
    ing('cooking_wine', '料酒', 'Cooking Wine', 'drinks'),

    // Staples
    ing('rice', '米饭', 'Rice', 'staples'),
    ing('noodles', '面条', 'Noodles', 'staples'),
    ing('flour', '面粉', 'Flour', 'staples'),
    ing('bread', '面包', 'Bread', 'staples'),
    ing('toast', '吐司', 'Toast', 'staples'),
    ing('dumpling_skin', '饺子皮', 'Dumpling Skin', 'staples'),

    // Sauces
    ing('laoganma', '老干妈', 'Lao Gan Ma', 'sauces'),
    ing('soy_sauce', '酱油', 'Soy Sauce', 'sauces'),
    ing('vinegar', '醋', 'Vinegar', 'sauces'),
    ing('salt', '盐', 'Salt', 'sauces'),
    ing('sugar', '糖', 'Sugar', 'sauces'),
    ing('garlic', '蒜', 'Garlic', 'sauces'),
    ing('ginger', '姜', 'Ginger', 'sauces'),
    ing('sichuan_pepper', '花椒', 'Sichuan Pepper', 'sauces'),
];

export function getIngredientsByCategory(category: IngredientCategory): Ingredient[] {
    return INGREDIENTS.filter(i => i.category === category);
}
