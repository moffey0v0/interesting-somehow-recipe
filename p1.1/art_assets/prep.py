import os
import shutil

src_dir = r"C:\Users\12758\.gemini\antigravity\brain\aee8033d-8614-49f5-9e7b-de7fd3cf8c5c"
dest_dir = r"d:\TEST\Interesting Somehow Recipe\p1.1\art_assets"

files_to_move = {
    "deco_pendant_light_1773128711148.png": "deco_pendant_light.png",
    "deco_pepper_grinder_1773128697525.png": "deco_pepper_grinder.png",
    "logo_1773128723382.png": "logo.png",
    "ticket_template_1773128768265.png": "ticket_template.png",
    "icons_cuisine_types_1773128785069.png": "icons_cuisine_types.png",
    "icons_mode_toggle_1773128798100.png": "icons_mode_toggle.png",
    "icons_taste_sliders_1773128828387.png": "icons_taste_sliders.png",
    "icons_category_tabs_1773128844816.png": "icons_category_tabs.png",
    "ui_buttons_1773128859727.png": "ui_buttons.png"
}

for src, dest in files_to_move.items():
    src_path = os.path.join(src_dir, src)
    dest_path = os.path.join(dest_dir, dest)
    if os.path.exists(src_path):
        shutil.copy2(src_path, dest_path)
        print(f"Moved {src} -> {dest}")
    else:
        print(f"Not found: {src_path}")

os.chdir(dest_dir)

mapping_extension = {
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

code = """
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

def get_bounding_boxes(img):
    img = img.convert('RGBA')
    pixels = img.load()
    width, height = img.size
    
    visited = set()
    boxes = []
    
    for y in range(height):
        for x in range(width):
            if (x, y) not in visited:
                if not is_background(pixels[x, y]):
                    min_x, min_y, max_x, max_y = width, height, -1, -1
                    queue = [(x, y)]
                    visited.add((x, y))
                    
                    while queue:
                        cx, cy = queue.pop(0)
                        min_x = min(min_x, cx)
                        min_y = min(min_y, cy)
                        max_x = max(max_x, cx)
                        max_y = max(max_y, cy)
                        
                        for dx, dy in [(0, 1), (1, 0), (0, -1), (-1, 0), (1, 1), (-1, -1), (1, -1), (-1, 1)]: # 8-connected
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
                if w > 20 and h > 20:
                    boxes.append((min_x, min_y, w, h))
                del min_x
                    
    boxes.sort(key=lambda b: b[1])
    rows = []
    for b in boxes:
        if not rows:
            rows.append([b])
        else:
            last_row = rows[-1]
            last_y = sum([x[1] for x in last_row]) / len(last_row)
            if abs(b[1] - last_y) < 40:
                rows[-1].append(b)
            else:
                rows.append([b])
                
    sorted_boxes = []
    for row in rows:
        row.sort(key=lambda b: b[0])
        sorted_boxes.extend(row)
        
    return sorted_boxes

def make_transparent(img, padding=10):
    img = img.convert('RGBA')
    pixels = img.load()
    width, height = img.size
    
    for y in range(height):
        for x in range(width):
            if is_background(pixels[x, y]):
                pixels[x, y] = (255, 255, 255, 0)
                
    size = max(width, height) + padding*2
    new_img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    offset_x = (size - width) // 2
    offset_y = (size - height) // 2
    new_img.paste(img, (offset_x, offset_y))
    return new_img

def slice_image(image_path, names, output_dir):
    try:
        img = Image.open(image_path)
    except Exception as e:
        print(f"Failed to open {image_path}: {e}")
        return
        
    boxes = get_bounding_boxes(img)
    if not boxes:
        print(f"Could not find objects in {image_path}")
        return
        
    print(f"[{os.path.basename(image_path)}] Found {len(boxes)} objects, expected {len(names)}.")
    
    for i, name in enumerate(names):
        if i >= len(boxes):
            break
        x, y, w, h = boxes[i]
        
        pad = 5
        left = max(0, x - pad)
        top = max(0, y - pad)
        right = min(img.width, x + w + pad)
        bottom = min(img.height, y + h + pad)
        
        cropped = img.crop((left, top, right, bottom))
        final_icon = make_transparent(cropped, padding=10)
        
        out_path = os.path.join(output_dir, f"{name}.png")
        final_icon.save(out_path, "PNG")

ASSETS_DIR = r'd:\\TEST\\Interesting Somehow Recipe\\p1.1\\art_assets'
OUTPUT_DIR = os.path.join(ASSETS_DIR, 'icons_auto3')

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
        
    slice_image(sheet_path, icon_names, cat_dir)
    print(f"Processed {sheet_name}")
"""

with open("auto_slice3.py", "w", encoding="utf-8") as f:
    f.write(code)

os.system("python auto_slice3.py")
