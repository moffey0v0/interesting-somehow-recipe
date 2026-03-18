"""Process and copy the newly generated clean ticket."""
from PIL import Image
import numpy as np

src = r"C:\Users\12758\.gemini\antigravity\brain\521bed95-f57d-4c64-b9ce-58e2af082ac4\clean_ticket_v2_1773213071774.png"
dst = r"d:\TEST\Interesting Somehow Recipe\p2\public\assets\ticket_clean.png"

try:
    img = Image.open(src).convert("RGBA")
    data = np.array(img)
    
    r, g, b, a = data[:,:,0], data[:,:,1], data[:,:,2], data[:,:,3]
    
    # Make EXACT white background transparent
    white_mask = (r == 255) & (g == 255) & (b == 255)
    a[white_mask] = 0
    data[:,:,3] = a
    
    # Optional: crop any massive transparent borders left behind
    img_trans = Image.fromarray(data)
    bbox = img_trans.getbbox()
    if bbox:
        img_trans = img_trans.crop(bbox)
        
    img_trans.save(dst)
    print("Clean ticket processed and saved.")
except Exception as e:
    print(f"Error: {e}")
