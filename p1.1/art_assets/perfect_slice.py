import os
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

def extract_perfect(image_path, names, output_dir):
    try:
        img = Image.open(image_path).convert('RGBA')
    except Exception as e:
        print(f"Failed to open {image_path}: {e}")
        return
        
    width, height = img.size
    pixels = img.load()
    
    visited = set()
    blobs = []
    
    for y in range(height):
        for x in range(width):
            if (x, y) not in visited:
                if not is_background(pixels[x, y]):
                    min_x, max_x = x, x
                    min_y, max_y = y, y
                    queue = [(x, y)]
                    visited.add((x, y))
                    area = 0
                    
                    while queue:
                        cx, cy = queue.pop(0)
                        area += 1
                        if cx < min_x: min_x = cx
                        if cx > max_x: max_x = cx
                        if cy < min_y: min_y = cy
                        if cy > max_y: max_y = cy
                        
                        # 8-connected ensures we grab all touching pixels
                        for dx, dy in [(0, 1), (1, 0), (0, -1), (-1, 0), (1, 1), (-1, -1), (1, -1), (-1, 1)]:
                            nx, ny = cx + dx, cy + dy
                            if 0 <= nx < width and 0 <= ny < height:
                                if (nx, ny) not in visited:
                                    if not is_background(pixels[nx, ny]):
                                        visited.add((nx, ny))
                                        queue.append((nx, ny))
                                    else:
                                        visited.add((nx, ny))
                else:
                    visited.add((x, y))
                    
            if 'min_x' in locals():
                w = max_x - min_x + 1
                h = max_y - min_y + 1
                # Drop absolute minuscule noise
                if w > 10 and h > 10 and area > 100:
                    blobs.append((min_x, min_y, max_x, max_y, area))
                del min_x
                
    # A food item is a massive blob (several thousands of pixels). Text letters are tiny blobs.
    # We find blobs with area > 600 which safely excludes single letters but includes small UI elements.
    main_blobs = [b for b in blobs if b[4] > 600]
    
    if len(main_blobs) < len(names):
        # Fallback if the image had very small icons
        blobs.sort(key=lambda b: b[4], reverse=True)
        main_blobs = blobs[:len(names)]
        
    # Sort the big blobs row by row. 80px tolerance for "same row".
    main_blobs.sort(key=lambda b: (b[1] // 80, b[0]))
    
    print(f"[{os.path.basename(image_path)}] Found {len(main_blobs)} main items, extracting {len(names)}.")
    
    for i, name in enumerate(names):
        if i >= len(main_blobs):
            break
            
        x1, y1, x2, y2, _ = main_blobs[i]
        pad = 8
        c_left = max(0, x1 - pad)
        c_top = max(0, y1 - pad)
        c_right = min(width, x2 + pad)
        c_bottom = min(height, y2 + pad)
        
        cropped = img.crop((c_left, c_top, c_right, c_bottom))
        
        c_w, c_h = cropped.size
        c_pixels = cropped.load()
        for cy in range(c_h):
            for cx in range(c_w):
                if is_background(c_pixels[cx, cy]):
                    c_pixels[cx, cy] = (255, 255, 255, 0)
                    
        # Pad slightly to square
        size = max(c_w, c_h) + 10
        final_img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
        offset_x = (size - c_w) // 2
        offset_y = (size - c_h) // 2
        final_img.paste(cropped, (offset_x, offset_y))
        
        out_path = os.path.join(output_dir, f"{name}.png")
        final_img.save(out_path, "PNG")

ASSETS_DIR = r'd:\\TEST\\Interesting Somehow Recipe\\p1.1\\art_assets'
OUTPUT_DIR = os.path.join(ASSETS_DIR, 'icons')

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
        
    extract_perfect(sheet_path, icon_names, cat_dir)
    print(f"Processed {sheet_name}")
