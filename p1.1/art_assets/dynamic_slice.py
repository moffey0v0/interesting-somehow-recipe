import os
import numpy as np
from PIL import Image

def is_background(pixel):
    if isinstance(pixel, int): return pixel > 245
    if len(pixel) == 4:
        r, g, b, a = pixel
        if a < 10: return True
        if r > 240 and g > 240 and b > 240: return True
    elif len(pixel) == 3:
        r, g, b = pixel
        if r > 240 and g > 240 and b > 240: return True
    return False

def is_background_arr(img_arr):
    if img_arr.shape[2] == 4:
        alpha_mask = img_arr[:, :, 3] < 10
    else:
        alpha_mask = np.zeros(img_arr.shape[:2], dtype=bool)
    white_mask = (img_arr[:, :, 0] > 240) & (img_arr[:, :, 1] > 240) & (img_arr[:, :, 2] > 240)
    return alpha_mask | white_mask

def count_peaks(projection, threshold=0.05):
    max_val = np.max(projection)
    if max_val == 0: return 1
    mask = projection > (max_val * threshold)
    transitions = np.diff(mask.astype(int))
    peaks = np.sum(transitions == 1)
    if mask[0]: peaks += 1
    return max(1, peaks)

def trim_cell_ignore_edges(img):
    img = img.convert('RGBA')
    pixels = img.load()
    width, height = img.size
    
    # Ignore bottom 30% (AI text) and 5% padding
    active_min_y = int(height * 0.05)
    active_max_y = int(height * 0.70) 
    active_min_x = int(width * 0.05)
    active_max_x = int(width * 0.95)
    
    min_x, min_y, max_x, max_y = width, height, -1, -1
    has_pixels = False
    
    for y in range(active_min_y, active_max_y):
        for x in range(active_min_x, active_max_x):
            if not is_background(pixels[x, y]):
                has_pixels = True
                if x < min_x: min_x = x
                if x > max_x: max_x = x
                if y < min_y: min_y = y
                if y > max_y: max_y = y
                
    if not has_pixels:
        return None
        
    cropped = img.crop((min_x, min_y, max_x + 1, max_y + 1))
    
    c_w, c_h = cropped.size
    if c_w < 10 or c_h < 10: return None # Noise
    
    c_pixels = cropped.load()
    for y in range(c_h):
        for x in range(c_w):
            if is_background(c_pixels[x, y]):
                c_pixels[x, y] = (255, 255, 255, 0)
                
    size = max(c_w, c_h) + 20
    final_img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    offset_x = (size - c_w) // 2
    offset_y = (size - c_h) // 2
    final_img.paste(cropped, (offset_x, offset_y))
    return final_img

def slice_dynamic(image_path, names, output_dir):
    try:
        img = Image.open(image_path).convert('RGBA')
    except Exception as e:
        print(f"Failed to open {image_path}: {e}")
        return
        
    img_arr = np.array(img)
    fg_mask = ~is_background_arr(img_arr)
    
    cols = count_peaks(np.sum(fg_mask, axis=0))
    rows = count_peaks(np.sum(fg_mask, axis=1))
    
    width, height = img.size
    cell_w = width / cols
    cell_h = height / rows
    
    print(f"[{os.path.basename(image_path)}] Detected grid: {cols}x{rows}. Extracting expected {len(names)} items.")
    
    valid_cells = []
    
    for r in range(rows):
        for c in range(cols):
            left = int(c * cell_w)
            top = int(r * cell_h)
            right = int((c + 1) * cell_w)
            bottom = int((r + 1) * cell_h)
            
            cell_img = img.crop((left, top, right, bottom))
            trimmed = trim_cell_ignore_edges(cell_img)
            if trimmed:
                valid_cells.append(trimmed)

    # If we have extracted more valid cells than we need names, we just map 1 to 1 sequentially
    for i, name in enumerate(names):
        if i >= len(valid_cells):
            print(f"Not enough cells for {name}")
            break
        out_path = os.path.join(output_dir, f"{name}.png")
        valid_cells[i].save(out_path, "PNG")

ASSETS_DIR = r'd:\TEST\Interesting Somehow Recipe\p1.1\art_assets'
OUTPUT_DIR = os.path.join(ASSETS_DIR, 'icons_final')

if not os.path.exists(OUTPUT_DIR):
    os.makedirs(OUTPUT_DIR)

mapping = [
    ('icons_vegetables.png', [
        'tomato', 'cabbage', 'potato', 'carrot', 'onion',
        'cucumber', 'eggplant', 'pepper', 'mushroom', 'corn',
        'lettuce', 'broccoli'
    ]),
    ('icons_fruits.png', [
        'apple', 'banana', 'strawberry', 'lemon', 'orange',
        'watermelon', 'grape', 'mango'
    ]),
    ('icons_meat.png', [
        'pork', 'beef', 'chicken', 'mutton', 'bacon',
        'sausage', 'ground_meat', 'ribs'
    ]),
    ('icons_seafood.png', [
        'shrimp', 'fish', 'crab', 'shellfish', 'squid',
        'salmon'
    ]),
    ('icons_dairy.png', [
        'milk', 'eggs', 'cheese', 'butter', 'yogurt'
    ]),
    ('icons_drinks.png', [
        'beer', 'wine', 'cola', 'sprite', 'juice',
        'cooking_wine'
    ]),
    ('icons_staples.png', [
        'rice', 'noodles', 'flour', 'bread', 'toast',
        'dumpling_skin'
    ]),
    ('icons_sauces.png', [
        'laoganma', 'soy_sauce', 'vinegar', 'salt', 'sugar',
        'garlic', 'ginger', 'sichuan_pepper'
    ]),
    ('icons_cuisine_types.png', [
        'cuisine_chinese', 'cuisine_western', 'cuisine_japanese',
        'cuisine_korean', 'cuisine_southeast_asian', 'cuisine_middle_eastern',
        'cuisine_indian', 'cuisine_latin', 'cuisine_random'
    ]),
    ('icons_mode_toggle.png', [
        'mode_survival', 'mode_creative'
    ]),
    ('icons_taste_sliders.png', [
        'taste_sour', 'taste_sweet', 'taste_bitter', 'taste_spicy', 'taste_salty'
    ]),
    ('icons_category_tabs.png', [
        'tab_vegetables', 'tab_fruits', 'tab_meat', 'tab_seafood',
        'tab_dairy', 'tab_drinks', 'tab_staples', 'tab_sauces'
    ])
]

for sheet_name, icon_names in mapping:
    sheet_path = os.path.join(ASSETS_DIR, sheet_name)
    if not os.path.exists(sheet_path):
        continue
        
    category = sheet_name.replace('icons_', '').replace('.png', '').replace('icon_', '')
    cat_dir = os.path.join(OUTPUT_DIR, category)
    if not os.path.exists(cat_dir):
        os.makedirs(cat_dir)
        
    slice_dynamic(sheet_path, icon_names, cat_dir)
    print(f"Processed {sheet_name} into {cat_dir}")
