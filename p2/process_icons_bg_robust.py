from PIL import Image
import numpy as np

images_to_process = [
    r"d:\TEST\Interesting Somehow Recipe\p2\public\assets\icon_custom_basket.png",
    r"d:\TEST\Interesting Somehow Recipe\p2\public\assets\icons\CuisineTypes\cuisine_japanese.png",
    r"d:\TEST\Interesting Somehow Recipe\p2\public\assets\icons\CuisineTypes\cuisine_random.png"
]

def make_transparent(img_path):
    try:
        img = Image.open(img_path).convert("RGBA")
        data = np.array(img)
        
        # Sample the top-left pixel as the background color
        bg_r, bg_g, bg_b, _ = data[0, 0]
        
        # Tolerance for background color match
        tolerance = 20
        
        r, g, b, a = data[:,:,0], data[:,:,1], data[:,:,2], data[:,:,3]
        
        # Create mask based on similarity to background color
        mask = (np.abs(r.astype(int) - bg_r) < tolerance) & \
               (np.abs(g.astype(int) - bg_g) < tolerance) & \
               (np.abs(b.astype(int) - bg_b) < tolerance)
               
        a[mask] = 0
        data[:,:,3] = a
        
        # Crop tight
        img_trans = Image.fromarray(data)
        bbox = img_trans.getbbox()
        if bbox:
            img_trans = img_trans.crop(bbox)
        else:
            img_trans = Image.fromarray(data)
            
        img_trans.save(img_path)
        print(f"Successfully removed background from {img_path.split('\\')[-1]} using bg_color: ({bg_r}, {bg_g}, {bg_b})")
    except Exception as e:
        print(f"Error on {img_path}: {e}")

for src in images_to_process:
    make_transparent(src)
