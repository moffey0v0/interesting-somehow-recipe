"""Aggressively remove white glowing fringes from pot images."""
import os
from PIL import Image
import numpy as np

src_dir = r"d:\TEST\Interesting Somehow Recipe\p2\public\assets"
images = ["pot_idle.png", "pot_cooking.png", "pot_success.png", "pot_fail.png"]

for img_name in images:
    path = os.path.join(src_dir, img_name)
    if os.path.exists(path):
        img = Image.open(path).convert("RGBA")
        data = np.array(img).astype(float)
        
        r, g, b, a = data[:,:,0], data[:,:,1], data[:,:,2], data[:,:,3]
        
        # Calculate pixel lightness/brightness
        lightness = (r + g + b) / 3.0
        
        # We want to target the glowing aura that overlaps with transparency.
        # If a pixel is very bright (> 150) AND has partial transparency, we aggressively zero it.
        # This removes the white anti-aliasing halo.
        
        # Condition 1: Lightness is high (close to white/bright)
        # Condition 2: Alpha is not fully opaque (halo area)
        fringe_mask = (lightness > 180) & (a < 240)
        
        # Force these pixels to be completely transparent
        a[fringe_mask] = 0
        
        # Hard erosion step to eat 1 pixel into the edge to kill any remaining white borders
        # We only really need this if the glow is baked into opaque pixels.
        # But this should be enough to delete the halo. 
        # For super bright white pixels anywhere, let's just kill them if lightness > 230 to be safe.
        super_white = (r > 230) & (g > 230) & (b > 230)
        a[super_white] = 0
        
        data[:,:,3] = a
        
        result = Image.fromarray(data.astype(np.uint8))
        result.save(path)
        print(f"Aggressively cleaned fringe: {img_name}")
    else:
        print(f"File not found: {path}")
