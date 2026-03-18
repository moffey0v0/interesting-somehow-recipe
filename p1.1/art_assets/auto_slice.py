import os
from PIL import Image

def get_bounding_boxes(img):
    # Process alpha channel
    # img is expected to be RGBA
    if img.mode != 'RGBA':
        img = img.convert('RGBA')
    
    pixels = img.load()
    width, height = img.size
    
    visited = set()
    boxes = []
    
    # Simple BFS for connected components of non-transparent pixels
    for y in range(height):
        for x in range(width):
            if (x, y) not in visited:
                alpha = pixels[x, y][3]
                if alpha > 10:  # Not fully transparent
                    min_x, min_y, max_x, max_y = width, height, -1, -1
                    # Start BFS
                    queue = [(x, y)]
                    visited.add((x, y))
                    
                    while queue:
                        cx, cy = queue.pop(0)
                        min_x = min(min_x, cx)
                        min_y = min(min_y, cy)
                        max_x = max(max_x, cx)
                        max_y = max(max_y, cy)
                        
                        # Check neighbors
                        for dx, dy in [(0, 1), (1, 0), (0, -1), (-1, 0)]:
                            nx, ny = cx + dx, cy + dy
                            if 0 <= nx < width and 0 <= ny < height:
                                if (nx, ny) not in visited:
                                    n_alpha = pixels[nx, ny][3]
                                    if n_alpha > 10:
                                        visited.add((nx, ny))
                                        queue.append((nx, ny))
                                    else:
                                        visited.add((nx, ny)) # Mark transparent as visited too
                else:
                    visited.add((x, y))
                    
            if 'min_x' in locals():
                w = max_x - min_x + 1
                h = max_y - min_y + 1
                if w > 20 and h > 20: # Exclude small noise
                    boxes.append((min_x, min_y, w, h))
                del min_x
                    
    # Sort boxes: by row (roughly) then by col
    # We group by y ranges
    boxes.sort(key=lambda b: (b[1] // 60, b[0]))
    return boxes

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
        
        # Add a little padding
        padding = 10
        left = max(0, x - padding)
        top = max(0, y - padding)
        right = min(img.width, x + w + padding)
        bottom = min(img.height, y + h + padding)
        
        cropped = img.crop((left, top, right, bottom))
        
        # Create square image with transparent background to match expected size
        size = max(right - left, bottom - top) + 10
        new_img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
        offset_x = (size - (right - left)) // 2
        offset_y = (size - (bottom - top)) // 2
        new_img.paste(cropped, (offset_x, offset_y))
        
        out_path = os.path.join(output_dir, f"{name}.png")
        new_img.save(out_path, "PNG")

ASSETS_DIR = r'd:\TEST\Interesting Somehow Recipe\p1.1\art_assets'
OUTPUT_DIR = os.path.join(ASSETS_DIR, 'icons_auto')

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
    'icon_custom_basket.png': ['custom_basket'],
    'icon_custom_orb.png': ['custom_orb']
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
