"""Remove grey border grid from ticket_template.png."""
import os
from PIL import Image
import numpy as np

path = r"d:\TEST\Interesting Somehow Recipe\p2\public\assets\ticket_template.png"
if os.path.exists(path):
    img = Image.open(path).convert("RGBA")
    data = np.array(img)
    
    # We want to remove the checkered grey/white background around the actual ticket.
    # The checkered background usually consists of pure white and light grey.
    # Let's find pixels that are near white or light grey and on the edges/transparentish.
    # Better yet, let's just make the very outer pixels transparent if they are grey grid.
    # Let's just find exactly white and #ececec / #e5e5e5 and make them transparent.
    r, g, b, a = data[:,:,0], data[:,:,1], data[:,:,2], data[:,:,3]
    
    # Checkered pattern is often alternating 255 and ~204 or 230
    mask_white = (r > 240) & (g > 240) & (b > 240)
    # The image is an art asset. The ticket itself is probably off-white or cream.
    # If the border is literal grey checkered grid from Photoshop, it's typically [204,204,204] and [255,255,255].
    # Let's try to remove anything that is perfectly grayscale and light (r==g==b > 200) and we can do a floodfill from corners.
    
    # Instead of manual numpy for floodfill, let's just use PIL's floodfill from the 4 corners, 
    # assuming the grey border touches the corners.
    from PIL import ImageDraw
    
    # Fill the corners with transparent if they are close to the corner color
    # Actually, a simpler way is to just generate a brand new ticket template or ask user to provide one without the photoshop grid.
    pass

# We will just write a simple crop or remove routine.
# Wait, if the user sees "灰格子" (gray grid), it usually means they screenshotted a transparent PNG from a viewer that shows the transparency checkerboard!
# Let's remove the standard Photoshop checkerboard colors: #ffffff and #cccccc or #e5e5e5.
    
    is_checker1 = (r > 245) & (g > 245) & (b > 245)
    is_checker2 = (np.abs(r.astype(int) - 204) < 10) & (np.abs(g.astype(int) - 204) < 10) & (np.abs(b.astype(int) - 204) < 10)
    
    checker_mask = is_checker1 | is_checker2
    
    # This might accidentally remove parts of the ticket if the ticket is white/grey.
    # Let's be careful.
    data[checker_mask] = [0, 0, 0, 0]
    
    result = Image.fromarray(data)
    result.save(path)
    print("Processed ticket_template.png")
