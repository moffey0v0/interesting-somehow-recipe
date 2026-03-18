from PIL import Image
import numpy as np

images_to_process = [
    r"d:\TEST\Interesting Somehow Recipe\p2\public\assets\icon_custom_basket.png",
    r"d:\TEST\Interesting Somehow Recipe\p2\public\assets\icons\CuisineTypes\cuisine_japanese.png",
    r"d:\TEST\Interesting Somehow Recipe\p2\public\assets\icons\CuisineTypes\cuisine_random.png"
]

for src in images_to_process:
    try:
        img = Image.open(src).convert("RGBA")
        data = np.array(img)
        
        r, g, b, a = data[:,:,0], data[:,:,1], data[:,:,2], data[:,:,3]
        
        # Make strictly near-white background transparent
        # 245 provides a good buffer for JPEG-like compression artifacts around edges
        white_mask = (r > 245) & (g > 245) & (b > 245)
        a[white_mask] = 0
        data[:,:,3] = a
        
        # Crop tight
        img_trans = Image.fromarray(data)
        bbox = img_trans.getbbox()
        if bbox:
            img_trans = img_trans.crop(bbox)
            
        img_trans.save(src)
        print(f"Processed and explicitly saved {src.split('/')[-1]}")
    except Exception as e:
        print(f"Error on {src}: {e}")
