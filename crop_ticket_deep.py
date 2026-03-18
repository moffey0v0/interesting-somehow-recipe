"""Crop ticket template aggressively."""
import os
from PIL import Image

path = r"d:\TEST\Interesting Somehow Recipe\p2\public\assets\ticket_template.png"
if os.path.exists(path):
    img = Image.open(path).convert("RGBA")
    width, height = img.size
    
    # Looking at the proportions, the paper is often in the center with huge margins.
    # Let's crop 80 pixels from left/right, and 40 from top/bottom to be sure we hit the paper.
    cropped = img.crop((100, 50, width - 100, height - 50))
    cropped.save(path)
    
    print("Ticket template successfully deep-cropped to remove borders.")
else:
    print("Ticket file not found!")
