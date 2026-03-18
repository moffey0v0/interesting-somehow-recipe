import os
from PIL import Image
import numpy as np

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

def extract_icons_from_mess(image_path, names, output_dir):
    try:
        img = Image.open(image_path).convert('RGBA')
    except Exception as e:
        print(f"Failed to open {image_path}: {e}")
        return
        
    width, height = img.size
    pixels = img.load()
    
    # Blob scan
    visited = set()
    boxes = []
    
    for y in range(height):
        for x in range(width):
            if (x, y) not in visited:
                if not is_background(pixels[x, y]):
                    min_x, max_x = x, x
                    min_y, max_y = y, y
                    queue = [(x, y)]
                    visited.add((x, y))
                    
                    while queue:
                        cx, cy = queue.pop(0)
                        if cx < min_x: min_x = cx
                        if cx > max_x: max_x = cx
                        if cy < min_y: min_y = cy
                        if cy > max_y: max_y = cy
                        
                        for dx, dy in [(0, 1), (1, 0), (0, -1), (-1, 0)]:
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
                if w > 40 and h > 40:
                    boxes.append((min_x, min_y, max_x, max_y))
                del min_x
                
    cleaned_boxes = []
    for (x1, y1, x2, y2) in boxes:
        box_h = y2 - y1
        text_cutoff = int(y1 + box_h * 0.70) 
        cleaned_boxes.append((x1, y1, x2, text_cutoff))
        
    cleaned_boxes.sort(key=lambda b: (b[1] // 50, b[0]))
    
    # Filter empty or tiny boxes resulting from text cutoff
    valid_boxes = []
    for box in cleaned_boxes:
        c_left, c_top, c_right, c_bottom = box
        if c_right - c_left < 20 or c_bottom - c_top < 20:
            continue
            
        cropped = img.crop(box)
        c_pixels = cropped.load()
        has_real_pixels = False
        empty_lines = 0
        for cy in range(cropped.height):
            line_has_pixel = False
            for cx in range(cropped.width):
                if not is_background(c_pixels[cx, cy]):
                    has_real_pixels = True
                    line_has_pixel = True
                    break
            if not line_has_pixel:
                empty_lines += 1
                
        # If it's mostly empty, drop it
        if has_real_pixels and empty_lines < (cropped.height * 0.8):
            valid_boxes.append(box)
    
    print(f"[{os.path.basename(image_path)}] Found {len(valid_boxes)} good blobs, expected {len(names)}.")
    
    for i, name in enumerate(names):
        if i >= len(valid_boxes):
            break
            
        x1, y1, x2, y2 = valid_boxes[i]
        pad = 5
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
                    
        size = max(c_w, c_h) + 20
        final_img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
        offset_x = (size - c_w) // 2
        offset_y = (size - c_h) // 2
        final_img.paste(cropped, (offset_x, offset_y))
        
        out_path = os.path.join(output_dir, f"{name}.png")
        final_img.save(out_path, "PNG")

ASSETS_DIR = r'd:\\TEST\\Interesting Somehow Recipe\\p1.1\\art_assets'
OUTPUT_DIR = os.path.join(ASSETS_DIR, 'icons')

mapping = [
    ('icons_drinks.png', [
        'beer', 'wine', 'cola', 'sprite', 'juice',
        'cooking_wine'
    ]),
    ('icons_sauces.png', [
        'laoganma', 'soy_sauce', 'vinegar', 'salt', 'sugar',
        'garlic', 'ginger', 'sichuan_pepper'
    ]),
    ('icons_seafood.png', [
        'shrimp', 'fish', 'crab', 'shellfish', 'squid',
        'salmon'
    ]),
    ('icons_staples.png', [
        'rice', 'noodles', 'flour', 'bread', 'toast',
        'dumpling_skin'
    ]),
    ('icons_vegetables.png', [
        'tomato', 'cabbage', 'potato', 'carrot', 'onion',
        'cucumber', 'eggplant', 'pepper', 'mushroom', 'corn',
        'lettuce', 'broccoli'
    ]),
    ('icons_taste_sliders.png', [
        'taste_sour', 'taste_sweet', 'taste_bitter', 'taste_spicy', 'taste_salty'
    ]),
    ('icons_cuisine_types.png', [
        'cuisine_chinese', 'cuisine_western', 'cuisine_japanese',
        'cuisine_korean', 'cuisine_southeast_asian', 'cuisine_middle_eastern',
        'cuisine_indian', 'cuisine_latin', 'cuisine_random'
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
        
    extract_icons_from_mess(sheet_path, icon_names, cat_dir)
    print(f"Processed {sheet_name}")
