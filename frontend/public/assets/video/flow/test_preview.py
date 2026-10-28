import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter

flow_dir = r"d:\Project\rebuild bionet\frontend\public\assets\video\flow"

# Test loading and cropping slide 1
im1 = Image.open(os.path.join(flow_dir, "slide1_dashboard.png")).convert("RGBA")
# Crop browser header (top 46px)
im1_clean = im1.crop((0, 46, im1.width, im1.height))
print(f"Original size: {im1.size}, Cropped size: {im1_clean.size}")

# Check fonts available
fonts_to_try = ["segoeui.ttf", "segoeuib.ttf", "arial.ttf", "arialbd.ttf"]
for f in fonts_to_try:
    try:
        font = ImageFont.truetype(f, 20)
        print(f"Font {f}: Available")
    except Exception as e:
        print(f"Font {f}: Not available ({e})")
