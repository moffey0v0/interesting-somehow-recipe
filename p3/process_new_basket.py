from PIL import Image
import numpy as np
import os
import shutil

src = r"C:\Users\12758\.gemini\antigravity\brain\521bed95-f57d-4c64-b9ce-58e2af082ac4\new_clean_basket_1773228267097.png"
dst = r"d:\TEST\Interesting Somehow Recipe\p2\public\assets\icon_custom_basket.png"

try:
    img = Image.open(src).convert("RGBA")
    data = np.array(img)
    
    # We sample corner for absolute certainty, though we know it's white
    bg_r, bg_g, bg_b, _ = data[0, 0]
    tolerance = 20
    
    r, g, b, a = data[:,:,0], data[:,:,1], data[:,:,2], data[:,:,3]
    
    mask = (np.abs(r.astype(int) - bg_r) < tolerance) & \
           (np.abs(g.astype(int) - bg_g) < tolerance) & \
           (np.abs(b.astype(int) - bg_b) < tolerance)
           
    a[mask] = 0
    data[:,:,3] = a
    
    img_trans = Image.fromarray(data)
    bbox = img_trans.getbbox()
    if bbox:
        img_trans = img_trans.crop(bbox)
        
    img_trans.save(dst)
    print(f"Successfully processed true white background and saved to {dst}")
except Exception as e:
    print(f"Error: {e}")
