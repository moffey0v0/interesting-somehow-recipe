"""Remove white background from pot images and save to p2 public assets."""
import os
from PIL import Image
import numpy as np

src_dir = r"d:\TEST\Interesting Somehow Recipe\p2\public\assets"
images = ["pot_idle.png", "pot_cooking.png", "pot_success.png", "pot_fail.png"]

for img_name in images:
    path = os.path.join(src_dir, img_name)
    if os.path.exists(path):
        img = Image.open(path).convert("RGBA")
        data = np.array(img)
        
        # Make near-white pixels transparent (threshold 230)
        r, g, b, a = data[:,:,0], data[:,:,1], data[:,:,2], data[:,:,3]
        # Only target white backgrounds on the edges or general white, 
        # but to be safe we just replace all pure white since background removing is basic
        white_mask = (r > 235) & (g > 235) & (b > 235)
        data[white_mask] = [255, 255, 255, 0]
        
        result = Image.fromarray(data)
        result.save(path)
        print(f"Processed: {img_name}")
    else:
        print(f"File not found: {path}")
