import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter

flow_dir = r"d:\Project\rebuild bionet\frontend\public\assets\video\flow"
os.makedirs(flow_dir, exist_ok=True)

slides_data = [
    {
        "src": "slide1_dashboard.png",
        "step": "FLOW 01 • DASHBOARD KEMITRAAN",
        "title": "Sales & Overview Omset Real-time",
        "desc": "Monitoring saldo dompet, bonus sponsor, bonus pasangan 1:1, dan grafik omset harian.",
        "badge_color": (16, 185, 129), # Emerald
    },
    {
        "src": "slide2_binary_tree.png",
        "step": "FLOW 02 • MLM BINARY ENGINE",
        "title": "Pohon Jaringan Binary (MLM Tree)",
        "desc": "Struktur genealogi 3 generasi, auto-pairing kaki kiri & kanan, serta pendaftaran downline.",
        "badge_color": (14, 165, 233), # Sky blue
    },
    {
        "src": "slide3_livechat.png",
        "step": "FLOW 03 • LAYANAN PELANGGAN",
        "title": "Live Chat Helpdesk 24/7",
        "desc": "Komunikasi terenkripsi langsung antara mitra kemitraan dan tim CS/Admin pusat.",
        "badge_color": (245, 158, 11), # Amber
    },
    {
        "src": "slide4_ai_copilot.png",
        "step": "FLOW 04 • AI & TELEGRAM BOT",
        "title": "Bionet AI Copilot (Gemini 3.1 & Telegram)",
        "desc": "Asisten cerdas Google Gemini dan bot Telegram untuk cek status, omset, dan edukasi mitra.",
        "badge_color": (168, 85, 247), # Purple
    }
]

# Canvas Dimensions: 1280x720
W, H = 1280, 720

# Load fonts if possible, or default
try:
    font_step = ImageFont.truetype("arialbd.ttf", 16)
    font_title = ImageFont.truetype("arialbd.ttf", 26)
    font_desc = ImageFont.truetype("arial.ttf", 15)
    font_brand = ImageFont.truetype("arialbd.ttf", 14)
except:
    font_step = ImageFont.load_default()
    font_title = ImageFont.load_default()
    font_desc = ImageFont.load_default()
    font_brand = ImageFont.load_default()

for idx, s in enumerate(slides_data):
    src_path = os.path.join(flow_dir, s["src"])
    if not os.path.exists(src_path):
        print(f"Missing {src_path}")
        continue
    
    screenshot = Image.open(src_path).convert("RGBA")
    
    # Create dark futuristic background canvas
    canvas = Image.new("RGBA", (W, H), (10, 15, 29, 255))
    draw = ImageDraw.Draw(canvas)
    
    # Background subtle radial glow with badge_color
    glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow)
    bc = s["badge_color"]
    glow_draw.ellipse(
        (W//2 - 350, H//2 - 250, W//2 + 350, H//2 + 250),
        fill=(bc[0], bc[1], bc[2], 35)
    )
    glow = glow.filter(ImageFilter.GaussianBlur(80))
    canvas = Image.alpha_composite(canvas, glow)
    draw = ImageDraw.Draw(canvas)
    
    # Subtle grid lines
    for x in range(0, W, 40):
        draw.line([(x, 0), (x, H)], fill=(255, 255, 255, 6), width=1)
    for y in range(0, H, 40):
        draw.line([(0, y), (W, y)], fill=(255, 255, 255, 6), width=1)

    # Frame the screenshot in a mockup browser window
    # Screenshot aspect ratio is approx 1024x530 -> Scale to fit ~1000px width
    target_sw = 1040
    target_sh = int(screenshot.height * (target_sw / screenshot.width))
    if target_sh > 480:
        target_sh = 480
        target_sw = int(screenshot.width * (target_sh / screenshot.height))
        
    sc_resized = screenshot.resize((target_sw, target_sh), Image.Resampling.LANCZOS)
    
    # Mockup header bar
    header_h = 28
    mock_w = target_sw + 8
    mock_h = target_sh + header_h + 8
    mock_x = (W - mock_w) // 2
    mock_y = 135
    
    # Mockup container shadow
    shadow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    sh_draw = ImageDraw.Draw(shadow)
    sh_draw.rounded_rectangle(
        [mock_x - 10, mock_y - 5, mock_x + mock_w + 10, mock_y + mock_h + 15],
        radius=16,
        fill=(0, 0, 0, 160)
    )
    shadow = shadow.filter(ImageFilter.GaussianBlur(15))
    canvas = Image.alpha_composite(canvas, shadow)
    draw = ImageDraw.Draw(canvas)
    
    # Mockup outer window
    draw.rounded_rectangle(
        [mock_x, mock_y, mock_x + mock_w, mock_y + mock_h],
        radius=12,
        fill=(22, 28, 44, 255),
        outline=(51, 65, 85, 255),
        width=1
    )
    
    # Window 3 buttons (macOS style dots)
    draw.ellipse([mock_x + 12, mock_y + 10, mock_x + 20, mock_y + 18], fill=(239, 68, 68, 255))
    draw.ellipse([mock_x + 24, mock_y + 10, mock_x + 32, mock_y + 18], fill=(245, 158, 11, 255))
    draw.ellipse([mock_x + 36, mock_y + 10, mock_x + 44, mock_y + 18], fill=(16, 185, 129, 255))
    
    # Window URL bar
    draw.rounded_rectangle(
        [mock_x + 60, mock_y + 6, mock_x + mock_w - 60, mock_y + 22],
        radius=6,
        fill=(30, 41, 59, 200)
    )
    draw.text((mock_x + mock_w//2 - 60, mock_y + 7), "https://bionet.id/app/dashboard", fill=(148, 163, 184, 255), font=font_brand)

    # Paste screenshot inside mockup
    canvas.paste(sc_resized, (mock_x + 4, mock_y + header_h + 4), sc_resized)
    
    # TOP HERO HEADER (Title, Step, Description)
    # Step Badge
    step_text = f"  {s['step']}  "
    draw.rounded_rectangle([mock_x, 24, mock_x + 260, 48], radius=8, fill=(bc[0], bc[1], bc[2], 40), outline=(bc[0], bc[1], bc[2], 180), width=1)
    draw.text((mock_x + 12, 27), s['step'], fill=(bc[0], bc[1], bc[2], 255), font=font_step)
    
    # Title
    draw.text((mock_x, 54), s["title"], fill=(255, 255, 255, 255), font=font_title)
    
    # Description
    draw.text((mock_x, 90), s["desc"], fill=(148, 163, 184, 255), font=font_desc)

    # Bottom Branding Strip
    draw.text((mock_x, H - 35), "BIONET NETWORK MARKETING PLATFORM • MULTI-TIER ECOSYSTEM", fill=(100, 116, 139, 255), font=font_brand)
    draw.text((mock_x + mock_w - 180, H - 35), f"SCREEN {idx+1} OF 4", fill=(bc[0], bc[1], bc[2], 255), font=font_step)

    # Save finalized presentation frame
    out_frame_path = os.path.join(flow_dir, f"frame_slide_{idx+1}.jpg")
    canvas.convert("RGB").save(out_frame_path, quality=95)
    print(f"Generated: {out_frame_path}")

print("All 4 showcase frames generated successfully!")
