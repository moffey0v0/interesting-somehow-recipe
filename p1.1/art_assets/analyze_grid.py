import os
import numpy as np
from PIL import Image

def is_background_arr(img_arr):
    # img_arr is (H, W, 4)
    # Background is where alpha < 10 or (R>240 & G>240 & B>240)
    alpha_mask = img_arr[:, :, 3] < 10
    white_mask = (img_arr[:, :, 0] > 240) & (img_arr[:, :, 1] > 240) & (img_arr[:, :, 2] > 240)
    return alpha_mask | white_mask

def count_peaks(projection, threshold=0.1):
    # Find continuous regions above threshold
    max_val = np.max(projection)
    mask = projection > (max_val * threshold)
    
    # Count transitions from False to True
    transitions = np.diff(mask.astype(int))
    peaks = np.sum(transitions == 1)
    
    # If it starts with True, that's also a peak
    if mask[0]:
        peaks += 1
        
    return peaks

def analyze_grid(image_path):
    img = Image.open(image_path).convert('RGBA')
    img_arr = np.array(img)
    
    bg_mask = is_background_arr(img_arr)
    fg_mask = ~bg_mask
    
    proj_x = np.sum(fg_mask, axis=0)
    proj_y = np.sum(fg_mask, axis=1)
    
    cols = count_peaks(proj_x, threshold=0.05)
    rows = count_peaks(proj_y, threshold=0.05)
    
    return cols, rows

ASSETS_DIR = r'd:\TEST\Interesting Somehow Recipe\p1.1\art_assets'

files = [f for f in os.listdir(ASSETS_DIR) if f.startswith('icons_') and f.endswith('.png')]

print("Detected Grids:")
for f in files:
    try:
        c, r = analyze_grid(os.path.join(ASSETS_DIR, f))
        print(f"{f}: {c} cols x {r} rows (Total expected items: {c*r})")
    except Exception as e:
        print(f"Error on {f}: {e}")
