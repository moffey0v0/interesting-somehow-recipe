# Art Assets Metadata & Usage Guide

This document lists all sliced art assets and explains their intended use in the "Interesting Somehow Recipe" application.

## 1. Directory Structure

- `/art_assets/`: Root folder for all raw and processed assets.
- `/art_assets/icons/`: Sliced individual icons (128x128px).
    - `/vegetables/`: 12 icons
    - `/fruits/`: 8 icons
    - `/meat/`: 8 icons
    - `/seafood/`: 6 icons
    - `/dairy/`: 5 icons
    - `/drinks/`: 6 icons
    - `/staples/`: 6 icons
    - `/sauces/`: 8 icons
    - `/custom/`: 2 icons (Basket & Orb)

---

## 2. Core Scene Assets

| Filename | Purpose | Implementation Note |
|----------|---------|---------------------|
| `bg_main.png` | Main page background | Modern kitchen, dark/minimalist style. |
| `bg_counter.png` | Result page background | Light marble counter top. |
| `pot_idle.png` | Cooking pot (Standby) | Displayed in center column when not cooking. |
| `pot_cooking.png` | Cooking pot (Active) | Loop animation during AI request. |
| `pot_success.png` | Success state | Triggered when recipe is generated. |
| `pot_fail.png` | Failure state | Triggered on safety error or AI failure. |
| `deco_plant.png` | Kitchen decoration | Used for the "Counter" scene corner. |

---

## 3. Icons & Interaction

### Standard Ingredients (`/icons/[category]/[name].png`)
- **Dimensions**: 128x128px.
- **Usage**: Displayed in the `Pantry` (Right Column).
- **Interaction**: On click, animate a copy flying towards the `CookingPot` (Center Column).

### Custom Selection (`/icons/custom/`)
- `custom_basket.png`: The entry point for custom ingredients. Place it at the bottom of the `Pantry`.
- `custom_orb.png`: A placeholder used for user-typed ingredients. Show the ingredient name inside or under this orb.

---

## 4. Layout Assets

| File | Use Case |
|------|----------|
| `icon_custom_basket.png` | Large button for "Add Custom Ingredient". |
| `icon_custom_orb.png` | Template for custom ingredient display items. |

---

## 5. Technical Specification

- **Slicing Grid**: 128x128px derived from 640x640px sheets.
- **File Format**: Transparent PNG-24.
- **Animation Strategy**:
    - Use `framer-motion` for the flight path.
    - Path: `Pantry item -> window coordinate -> Pot coordinate`.
    - Ease: `backOut` for a "pop" effect.

---

## 6. Full Ingredient List (for `cuisines.ts`)

### Vegetables
`tomato`, `cabbage`, `potato`, `carrot`, `onion`, `cucumber`, `eggplant`, `pepper`, `mushroom`, `corn`, `lettuce`, `broccoli`

### Fruits
`apple`, `banana`, `strawberry`, `lemon`, `orange`, `watermelon`, `grape`, `mango`

### Meat
`pork`, `beef`, `chicken`, `mutton`, `bacon`, `sausage`, `ground_meat`, `ribs`

### Seafood
`shrimp`, `fish`, `crab`, `shellfish`, `squid`, `salmon`

### Dairy
`milk`, `eggs`, `cheese`, `butter`, `yogurt`

### Drinks
`beer`, `wine`, `cola`, `sprite`, `juice`, `cooking_wine`

### Staples
`rice`, `noodles`, `flour`, `bread`, `toast`, `dumpling_skin`

### Sauces
`laoganma`, `soy_sauce`, `vinegar`, `salt`, `sugar`, `garlic`, `ginger`, `sichuan_pepper`
