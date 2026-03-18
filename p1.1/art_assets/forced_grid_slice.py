import os
from PIL import Image, ImageChops

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

def trim_cell(img):
    img = img.convert('RGBA')
    pixels = img.load()
    width, height = img.size
    
    # Find bounding box
    min_x, min_y, max_x, max_y = width, height, -1, -1
    for y in range(height):
        for x in range(width):
            if not is_background(pixels[x, y]):
                if x < min_x: min_x = x
                if x > max_x: max_x = x
                if y < min_y: min_y = y
                if y > max_y: max_y = y
                
    if min_x > max_x: # Empty cell
        return None
        
    cropped = img.crop((min_x, min_y, max_x + 1, max_y + 1))
    
    # Make bg transparent
    c_w, c_h = cropped.size
    c_pixels = cropped.load()
    for y in range(c_h):
        for x in range(c_w):
            if is_background(c_pixels[x, y]):
                c_pixels[x, y] = (255, 255, 255, 0)
                
    # Pad to square
    size = max(c_w, c_h) + 20
    final_img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    offset_x = (size - c_w) // 2
    offset_y = (size - c_h) // 2
    final_img.paste(cropped, (offset_x, offset_y))
    return final_img

def slice_grid(image_path, names, cols, rows, output_dir):
    try:
        img = Image.open(image_path).convert('RGBA')
    except Exception as e:
        print(f"Failed to open {image_path}: {e}")
        return
        
    width, height = img.size
    cell_w = width / cols
    cell_h = height / rows
    
    cells = []
    for r in range(rows):
        for c in range(cols):
            left = int(c * cell_w)
            top = int(r * cell_h)
            right = int((c + 1) * cell_w)
            bottom = int((r + 1) * cell_h)
            
            cell_img = img.crop((left, top, right, bottom))
            cells.append(cell_img)
            
    print(f"[{os.path.basename(image_path)}] Grid {cols}x{rows} -> extracted {min(len(names), len(cells))} expected.")
    
    for i, name in enumerate(names):
        if i >= len(cells):
            break
            
        final_icon = trim_cell(cells[i])
        if final_icon:
            out_path = os.path.join(output_dir, f"{name}.png")
            final_icon.save(out_path, "PNG")

ASSETS_DIR = r'd:\\TEST\\Interesting Somehow Recipe\\p1.1\\art_assets'
OUTPUT_DIR = os.path.join(ASSETS_DIR, 'icons')

if not os.path.exists(OUTPUT_DIR):
    os.makedirs(OUTPUT_DIR)

# format: (sheet_name, cols, rows, list_of_names)
mapping = [
    ('icons_vegetables.png', 4, 3, [
        'tomato', 'cabbage', 'potato', 'carrot', 'onion',
        'cucumber', 'eggplant', 'pepper', 'mushroom', 'corn',
        'lettuce', 'broccoli'
    ]),
    ('icons_fruits.png', 4, 2, [
        'apple', 'banana', 'strawberry', 'lemon', 'orange',
        'watermelon', 'grape', 'mango'
    ]),
    ('icons_meat.png', 4, 2, [
        'pork', 'beef', 'chicken', 'mutton', 'bacon',
        'sausage', 'ground_meat', 'ribs'
    ]),
    ('icons_seafood.png', 3, 2, [
        'shrimp', 'fish', 'crab', 'shellfish', 'squid',
        'salmon'
    ]),
    ('icons_dairy.png', 3, 2, [
        'milk', 'eggs', 'cheese', 'butter', 'yogurt'
    ]),
    ('icons_drinks.png', 3, 2, [
        'beer', 'wine', 'cola', 'sprite', 'juice',
        'cooking_wine'
    ]),
    ('icons_staples.png', 3, 2, [
        'rice', 'noodles', 'flour', 'bread', 'toast',
        'dumpling_skin'
    ]),
    ('icons_sauces.png', 4, 2, [
        'laoganma', 'soy_sauce', 'vinegar', 'salt', 'sugar',
        'garlic', 'ginger', 'sichuan_pepper'
    ]),
    ('icons_cuisine_types.png', 3, 3, [
        'cuisine_chinese', 'cuisine_western', 'cuisine_japanese',
        'cuisine_korean', 'cuisine_southeast_asian', 'cuisine_middle_eastern',
        'cuisine_indian', 'cuisine_latin', 'cuisine_random'
    ]),
    ('icons_mode_toggle.png', 2, 1, [
        'mode_survival', 'mode_creative'
    ]),
    ('icons_taste_sliders.png', 5, 1, [
        'taste_sour', 'taste_sweet', 'taste_bitter', 'taste_spicy', 'taste_salty'
    ]),
    ('icons_category_tabs.png', 4, 2, [
        'tab_vegetables', 'tab_fruits', 'tab_meat', 'tab_seafood',
        'tab_dairy', 'tab_drinks', 'tab_staples', 'tab_sauces'
    ])
]

for sheet_name, cols, rows, icon_names in mapping:
    sheet_path = os.path.join(ASSETS_DIR, sheet_name)
    if not os.path.exists(sheet_path):
        continue
        
    category = sheet_name.replace('icons_', '').replace('.png', '').replace('icon_', '')
    cat_dir = os.path.join(OUTPUT_DIR, category)
    if not os.path.exists(cat_dir):
        os.makedirs(cat_dir)
        
    slice_grid(sheet_path, icon_names, cols, rows, cat_dir)
    print(f"Processed {sheet_name}")
