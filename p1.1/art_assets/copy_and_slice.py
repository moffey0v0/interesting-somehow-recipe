import os
import shutil
import sys

src_dir = r"C:\Users\12758\.gemini\antigravity\brain\aee8033d-8614-49f5-9e7b-de7fd3cf8c5c"
dest_dir = r"d:\TEST\Interesting Somehow Recipe\p1.1\art_assets"

files_to_move = {
    "pot_idle_1773129940281.png": "pot_idle.png",
    "icons_taste_sliders_1773129957829.png": "icons_taste_sliders.png",
    "icons_cuisine_types_1773129977323.png": "icons_cuisine_types.png",
    "bg_counter_1773130007952.png": "bg_counter.png",
    "pot_cooking_1773130029658.png": "pot_cooking.png",
    "ui_buttons_1773130053062.png": "ui_buttons.png"
}

for src, dest in files_to_move.items():
    s = os.path.join(src_dir, src)
    if os.path.exists(s):
        shutil.copy2(s, os.path.join(dest_dir, dest))
        print(f"Copied {src}")

os.chdir(dest_dir)
os.system("python robust_slice.py")
print("Slicing refreshed.")
