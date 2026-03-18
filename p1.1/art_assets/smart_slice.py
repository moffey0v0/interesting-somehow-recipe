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

def get_gutters(projection, min_width=20):
    # Find contiguous regions where projection is 0 (or very low)
    max_val = np.max(projection)
    threshold = max_val * 0.05 # 5% noise tolerance
    
    gutters = []
    in_gutter = False
    start = 0
    for i, val in enumerate(projection):
        if val <= threshold:
            if not in_gutter:
                in_gutter = True
                start = i
        else:
            if in_gutter:
                in_gutter = False
                end = i
                # if end - start >= min_width: # Commented out min width to catch all gaps
                gutters.append((start, end))
                
    if in_gutter:
        gutters.append((start, len(projection)))
        
    # We want the midpoints of the gutters as our splitting lines
    splits = [0]
    for start, end in gutters:
        splits.append((start + end) // 2)
    splits.append(len(projection))
    
    # Filter out splits that are too close to each other (e.g. within 60 px)
    filtered_splits = [splits[0]]
    for s in splits[1:]:
        if s - filtered_splits[-1] > 60:
            filtered_splits.append(s)
            
    return filtered_splits

def slice_smart(image_path, names, output_dir):
    try:
        img = Image.open(image_path).convert('RGBA')
    except Exception as e:
        print(f"Failed to open {image_path}: {e}")
        return
        
    width, height = img.size
    pixels = img.load()
    
    # Create mask of dark pixels
    mask = np.zeros((height, width))
    for y in range(height):
        for x in range(width):
            if not is_background(pixels[x, y]):
                mask[y, x] = 1
                
    proj_x = np.sum(mask, axis=0)
    proj_y = np.sum(mask, axis=1)
    
    splits_x = get_gutters(proj_x)
    splits_y = get_gutters(proj_y)
    
    # Form grid cells
    cells = []
    for yi in range(len(splits_y)-1):
        for xi in range(len(splits_x)-1):
            left = splits_x[xi]
            right = splits_x[xi+1]
            top = splits_y[yi]
            bottom = splits_y[yi+1]
            
            # Find exact bounding box within this cell
            cell_mask = mask[top:bottom, left:right]
            if np.sum(cell_mask) < 100: # empty cell
                continue
                
            y_indices, x_indices = np.where(cell_mask > 0)
            if len(y_indices) > 0:
                c_top = top + np.min(y_indices)
                c_bottom = top + np.max(y_indices)
                c_left = left + np.min(x_indices)
                c_right = left + np.max(x_indices)
                cells.append((c_left, c_top, c_right, c_bottom))
                
    print(f"[{os.path.basename(image_path)}] Found {len(cells)} cells, expected {len(names)}.")
    
    for i, name in enumerate(names):
        if i >= len(cells):
            break
        
        x1, y1, x2, y2 = cells[i]
        
        pad = 5
        left = max(0, x1 - pad)
        top = max(0, y1 - pad)
        right = min(width, x2 + pad)
        bottom = min(height, y2 + pad)
        
        cropped = img.crop((left, top, right, bottom))
        
        # Make background transparent
        # and place in a square padded frame
        c_width, c_height = cropped.size
        c_pixels = cropped.load()
        for cy in range(c_height):
            for cx in range(c_width):
                if is_background(c_pixels[cx, cy]):
                    c_pixels[cx, cy] = (255, 255, 255, 0)
                    
        # Put in a square
        size = max(c_width, c_height) + 20
        final_img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
        offset_x = (size - c_width) // 2
        offset_y = (size - c_height) // 2
        final_img.paste(cropped, (offset_x, offset_y))
        
        out_path = os.path.join(output_dir, f"{name}.png")
        final_img.save(out_path, "PNG")

ASSETS_DIR = r'd:\TEST\Interesting Somehow Recipe\p1.1\art_assets'
OUTPUT_DIR = os.path.join(ASSETS_DIR, 'icons') # overwriting the original wrong ones

if not os.path.exists(OUTPUT_DIR):
    os.makedirs(OUTPUT_DIR)

mapping = {
    'icons_vegetables.png': [
        'tomato', 'cabbage', 'potato', 'carrot', 'onion',
        'cucumber', 'eggplant', 'pepper', 'mushroom', 'corn',
        'lettuce', 'broccoli'
    ],
    'icons_fruits.png': [
        'apple', 'banana', 'strawberry', 'lemon', 'orange',
        'watermelon', 'grape', 'mango'
    ],
    'icons_meat.png': [
        'pork', 'beef', 'chicken', 'mutton', 'bacon',
        'sausage', 'ground_meat', 'ribs'
    ],
    'icons_seafood.png': [
        'shrimp', 'fish', 'crab', 'shellfish', 'squid',
        'salmon'
    ],
    'icons_dairy.png': [
        'milk', 'eggs', 'cheese', 'butter', 'yogurt'
    ],
    'icons_drinks.png': [
        'beer', 'wine', 'cola', 'sprite', 'juice',
        'cooking_wine'
    ],
    'icons_staples.png': [
        'rice', 'noodles', 'flour', 'bread', 'toast',
        'dumpling_skin'
    ],
    'icons_sauces.png': [
        'laoganma', 'soy_sauce', 'vinegar', 'salt', 'sugar',
        'garlic', 'ginger', 'sichuan_pepper'
    ],
    'icons_cuisine_types.png': [
        'cuisine_chinese', 'cuisine_western', 'cuisine_japanese',
        'cuisine_korean', 'cuisine_southeast_asian', 'cuisine_middle_eastern',
        'cuisine_indian', 'cuisine_latin', 'cuisine_random'
    ],
    'icons_mode_toggle.png': [
        'mode_survival', 'mode_creative'
    ],
    'icons_taste_sliders.png': [
        'taste_sour', 'taste_sweet', 'taste_bitter', 'taste_spicy', 'taste_salty'
    ],
    'icons_category_tabs.png': [
        'tab_vegetables', 'tab_fruits', 'tab_meat', 'tab_seafood',
        'tab_dairy', 'tab_drinks', 'tab_staples', 'tab_sauces'
    ]
}

for sheet_name, icon_names in mapping.items():
    sheet_path = os.path.join(ASSETS_DIR, sheet_name)
    if not os.path.exists(sheet_path):
        continue
        
    category = sheet_name.replace('icons_', '').replace('.png', '').replace('icon_', '')
    category = category.replace('custom_basket', 'custom').replace('custom_orb', 'custom')
    cat_dir = os.path.join(OUTPUT_DIR, category)
    if not os.path.exists(cat_dir):
        os.makedirs(cat_dir)
        
    slice_smart(sheet_path, icon_names, cat_dir)
    print(f"Processed {sheet_name}")

