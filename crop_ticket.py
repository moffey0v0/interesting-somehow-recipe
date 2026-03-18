"""Physically crop the ticket image to permanently remove gray edge grids."""
import os
from PIL import Image

path = r"d:\TEST\Interesting Somehow Recipe\p2\public\assets\ticket_template.png"
if os.path.exists(path):
    img = Image.open(path).convert("RGBA")
    
    # Let's crop 15 pixels off every side. The grey checkered border
    # from photoshop transparent exports is usually right on the absolute edges.
    width, height = img.size
    crop_amount = 20
    
    cropped = img.crop((crop_amount, crop_amount, width - crop_amount, height - crop_amount))
    cropped.save(path)
    
    print("Ticket template successfully hard-cropped to remove borders.")
else:
    print("Ticket file not found!")
