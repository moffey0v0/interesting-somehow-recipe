from PIL import Image
import numpy as np

src = r"d:\TEST\Interesting Somehow Recipe\p2\public\assets\ticket_clean.png"

try:
    img = Image.open(src).convert("RGBA")
    data = np.array(img)
    
    # Sample the top-left pixel
    bg_r, bg_g, bg_b, _ = data[0, 0]
    tolerance = 20
    
    r, g, b, a = data[:,:,0], data[:,:,1], data[:,:,2], data[:,:,3]
    
    # Create mask for pixels that are similar to the top-left corner
    mask = (np.abs(r.astype(int) - bg_r) < tolerance) & \
           (np.abs(g.astype(int) - bg_g) < tolerance) & \
           (np.abs(b.astype(int) - bg_b) < tolerance)
           
    a[mask] = 0
    data[:,:,3] = a
    
    # Save directly over the existing file
    img_trans = Image.fromarray(data)
    
    bbox = img_trans.getbbox()
    if bbox:
        img_trans = img_trans.crop(bbox)
        
    img_trans.save(src)
    print(f"Successfully processed ticket_clean.png using bg_color: ({bg_r}, {bg_g}, {bg_b})")
except Exception as e:
    print(f"Error on ticket_clean: {e}")
