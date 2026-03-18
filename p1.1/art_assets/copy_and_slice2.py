import os
import shutil

src_dir = r"C:\Users\12758\.gemini\antigravity\brain\aee8033d-8614-49f5-9e7b-de7fd3cf8c5c"
dest_dir = r"d:\TEST\Interesting Somehow Recipe\p1.1\art_assets"

files_to_move = {
    "pot_success_1773146717798.png": "pot_success.png",
    "pot_fail_1773146734456.png": "pot_fail.png",
    "icons_category_tabs_1773146752523.png": "icons_category_tabs.png",
    "icons_mode_toggle_1773146769272.png": "icons_mode_toggle.png"
}

for src, dest in files_to_move.items():
    s = os.path.join(src_dir, src)
    if os.path.exists(s):
        shutil.copy2(s, os.path.join(dest_dir, dest))
        print(f"Copied {src}")

os.chdir(dest_dir)
# Re-run the perfect slicer just for these two new sprite sheets
os.system("python perfect_slice.py")
print("Slicing refreshed with perfect_slice.")
