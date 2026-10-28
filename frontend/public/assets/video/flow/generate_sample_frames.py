import os, math
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import numpy as np

flow_dir = r"d:\Project\rebuild bionet\frontend\public\assets\video\flow"
W, H = 1280, 720

slides_meta = [
    {
        "file": "slide1_dashboard.png",
        "badge": "01 • RINGKASAN OMSET & BONUS",
        "title": "Dashboard Kemitraan & Finansial Real-Time",
        "desc": "Monitoring saldo dompet, bonus sponsor, bonus pasangan 1:1, dan grafik omset harian.",
        "color": (16, 185, 129),     # Emerald
        "color_hex": "#10b981",
        "url": "bionet.id/app/dashboard",
        "focus": (450, 160),         # Focus point on KPI cards
        "max_zoom": 1.25,
    },
    {
        "file": "slide2_binary_tree.png",
        "badge": "02 • BINARY GENEALOGY ENGINE",
        "title": "Pohon Jaringan Binary & Genealogi MLM",
        "desc": "Visualisasi struktur genealogi 3 generasi, auto-pairing kaki kiri/kanan, dan aktivasi downline.",
        "color": (6, 182, 212),      # Cyan
        "color_hex": "#06b6d4",
        "url": "bionet.id/app/network/binary-tree",
        "focus": (512, 220),         # Focus point on leader & left/right nodes
        "max_zoom": 1.30,
    },
    {
        "file": "slide3_livechat.png",
        "badge": "03 • LIVE CHAT & HELPDESK 24/7",
        "title": "Live Chat Bantuan Layanan Pelanggan",
        "desc": "Komunikasi langsung terenkripsi antara mitra dengan tim CS & Administrator Pusat.",
        "color": (52, 211, 153),     # Mint / Emerald
        "color_hex": "#34d399",
        "url": "bionet.id/app/support/livechat",
        "focus": (620, 240),         # Focus on chat messages
        "max_zoom": 1.22,
    },
    {
        "file": "slide4_ai_copilot.png",
        "badge": "04 • ASISTEN AI & BOT TELEGRAM",
        "title": "Bionet AI Copilot (Gemini 3.1 & Telegram)",
        "desc": "Konsultasi cerdas Google Gemini dan sinkronisasi bot Telegram resmi @btfn_assistant_bot.",
        "color": (168, 85, 247),     # Purple
        "color_hex": "#a855f7",
        "url": "bionet.id/app/ai-copilot",
        "focus": (860, 360),         # Focus on AI Copilot popup window
        "max_zoom": 1.55,
    }
]

# Load fonts
font_badge = ImageFont.truetype("segoeuib.ttf", 13)
font_title = ImageFont.truetype("segoeuib.ttf", 24)
font_desc = ImageFont.truetype("segoeui.ttf", 14)
font_url = ImageFont.truetype("segoeui.ttf", 12)
font_brand = ImageFont.truetype("segoeuib.ttf", 12)
font_pill = ImageFont.truetype("segoeuib.ttf", 11)

def build_scene_frame(slide_idx, t, total_t=1.0):
    """
    t: normalized progress from 0.0 to 1.0 within this slide
    """
    meta = slides_meta[slide_idx]
    c = meta["color"]
    
    # 1. Base Dark Ambient Canvas
    canvas = Image.new("RGBA", (W, H), (8, 12, 22, 255))
    
    # 2. Glowing Ambient Orbs in background
    # Subtle drifting ambient lighting
    glow_layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow_layer)
    
    # Primary theme glow
    glow_cx = int(W * 0.45 + math.sin(t * math.pi) * 60)
    glow_cy = int(H * 0.40 + math.cos(t * math.pi) * 40)
    glow_r = 380
    glow_draw.ellipse(
        (glow_cx - glow_r, glow_cy - glow_r, glow_cx + glow_r, glow_cy + glow_r),
        fill=(c[0], c[1], c[2], 45)
    )
    # Secondary teal/emerald accent glow
    glow_draw.ellipse(
        (W - 250, H - 200, W + 150, H + 200),
        fill=(16, 185, 129, 30)
    )
    glow_layer = glow_layer.filter(ImageFilter.GaussianBlur(90))
    canvas = Image.alpha_composite(canvas, glow_layer)
    
    # Subtle high-tech geometric dots / stars (ambient particle effect)
    particle_layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    p_draw = ImageDraw.Draw(particle_layer)
    # Fixed pseudo-random particles
    for i in range(40):
        px = (i * 137 + int(t * 15)) % W
        py = (i * 229 + int(t * 10)) % (H - 120)
        p_alpha = int(40 + 30 * math.sin(i + t * 4))
        p_draw.ellipse((px, py, px + 2, py + 2), fill=(255, 255, 255, p_alpha))
    canvas = Image.alpha_composite(canvas, particle_layer)
    
    # 3. Load & Clean Screenshot (Crop top 46px browser bar)
    raw_img = Image.open(os.path.join(flow_dir, meta["file"])).convert("RGBA")
    clean_img = raw_img.crop((0, 46, raw_img.width, raw_img.height))
    
    # 4. Cinematic Camera Zoom & Pan Interpolation (Smooth Hermite Ease-In-Out)
    # ease = 3*t^2 - 2*t^3
    ease = t * t * (3.0 - 2.0 * t)
    cur_zoom = 1.0 + (meta["max_zoom"] - 1.0) * ease
    
    orig_w, orig_h = clean_img.size
    fx, fy = meta["focus"]
    # Adjust focus coordinates relative to cropped image
    fy_cropped = max(0, fy - 46)
    
    # Crop window in original coordinates
    crop_w = orig_w / cur_zoom
    crop_h = orig_h / cur_zoom
    crop_x1 = (orig_w - crop_w) / 2.0 + (fx - orig_w / 2.0) * ease * 0.5
    crop_y1 = (orig_h - crop_h) / 2.0 + (fy_cropped - orig_h / 2.0) * ease * 0.5
    
    # Clamp
    crop_x1 = max(0, min(orig_w - crop_w, crop_x1))
    crop_y1 = max(0, min(orig_h - crop_h, crop_y1))
    crop_x2 = crop_x1 + crop_w
    crop_y2 = crop_y1 + crop_h
    
    cam_cropped = clean_img.crop((int(crop_x1), int(crop_y1), int(crop_x2), int(crop_y2)))
    
    # 5. Device Frame Dimensions (MacBook / Dashboard Monitor Mockup)
    # Mockup window positioned in center upper area
    mock_w = 1060
    mock_h = 490
    mock_x = (W - mock_w) // 2
    mock_y = 78
    
    # Content display area inside window
    content_w = mock_w
    content_h = mock_h - 32 # 32px titlebar
    
    cam_resized = cam_cropped.resize((content_w, content_h), Image.Resampling.LANCZOS)
    
    # 6. Window Drop Shadow & Colored Ambient Glow Behind Window
    shadow_layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    s_draw = ImageDraw.Draw(shadow_layer)
    # Deep shadow
    s_draw.rounded_rectangle(
        (mock_x - 14, mock_y - 4, mock_x + mock_w + 14, mock_y + mock_h + 24),
        radius=20,
        fill=(0, 0, 0, 180)
    )
    # Colored edge glow matching feature color
    s_draw.rounded_rectangle(
        (mock_x - 6, mock_y - 6, mock_x + mock_w + 6, mock_y + mock_h + 6),
        radius=18,
        fill=(c[0], c[1], c[2], 55)
    )
    shadow_layer = shadow_layer.filter(ImageFilter.GaussianBlur(16))
    canvas = Image.alpha_composite(canvas, shadow_layer)
    
    # 7. Draw Window Container
    draw = ImageDraw.Draw(canvas)
    # Window background & subtle outer border
    draw.rounded_rectangle(
        (mock_x, mock_y, mock_x + mock_w, mock_y + mock_h),
        radius=14,
        fill=(15, 23, 42, 255),
        outline=(51, 65, 85, 200),
        width=1
    )
    
    # Window Titlebar (macOS dark theme)
    tb_h = 32
    draw.rounded_rectangle(
        (mock_x, mock_y, mock_x + mock_w, mock_y + tb_h + 10),
        radius=14,
        fill=(23, 31, 50, 255)
    )
    draw.rectangle(
        (mock_x, mock_y + 14, mock_x + mock_w, mock_y + tb_h),
        fill=(23, 31, 50, 255)
    )
    # Subtle separator line under titlebar
    draw.line(
        [(mock_x, mock_y + tb_h), (mock_x + mock_w, mock_y + tb_h)],
        fill=(51, 65, 85, 180),
        width=1
    )
    
    # macOS window dots
    dot_y = mock_y + 16
    draw.ellipse((mock_x + 16, dot_y - 5, mock_x + 26, dot_y + 5), fill=(239, 68, 68, 255))
    draw.ellipse((mock_x + 32, dot_y - 5, mock_x + 42, dot_y + 5), fill=(245, 158, 11, 255))
    draw.ellipse((mock_x + 48, dot_y - 5, mock_x + 58, dot_y + 5), fill=(16, 185, 129, 255))
    
    # Window URL pill
    url_box_w = 340
    url_box_x = mock_x + (mock_w - url_box_w) // 2
    draw.rounded_rectangle(
        (url_box_x, mock_y + 6, url_box_x + url_box_w, mock_y + tb_h - 6),
        radius=6,
        fill=(15, 23, 42, 220),
        outline=(51, 65, 85, 120),
        width=1
    )
    # Lock icon indicator (green dot) + URL
    draw.ellipse((url_box_x + 10, mock_y + 13, url_box_x + 16, mock_y + 19), fill=(16, 185, 129, 255))
    draw.text((url_box_x + 24, mock_y + 8), f"https://{meta['url']}", fill=(148, 163, 184, 255), font=font_url)
    
    # Right pill: "BIONET NETWORK LIVE"
    draw.text((mock_x + mock_w - 150, mock_y + 9), "● NETWORK ACTIVE", fill=(52, 211, 153, 230), font=font_brand)
    
    # 8. Mask and Paste Camera View inside window (with rounded bottom corners)
    # Create mask for content area
    content_mask = Image.new("L", (content_w, content_h), 255)
    # Round bottom corners
    bot_mask = Image.new("L", (content_w, content_h), 0)
    bot_draw = ImageDraw.Draw(bot_mask)
    bot_draw.rounded_rectangle(
        (0, -10, content_w, content_h),
        radius=14,
        fill=255
    )
    
    canvas.paste(cam_resized, (mock_x, mock_y + tb_h), bot_mask)
    
    # 9. TOP BRAND HEADER OVERLAY (Sleek minimalist bar)
    # Left: Bionet Logo & System name
    draw.text((mock_x, 32), "BIONET", fill=(255, 255, 255, 255), font=font_brand)
    draw.text((mock_x + 60, 32), "SYSTEM PLATFORM SHOWCASE", fill=(100, 116, 139, 255), font=font_brand)
    
    # Right: Step count badge
    step_str = f"FEATURE {slide_idx + 1} OF 4"
    draw.text((mock_x + mock_w - 110, 32), step_str, fill=(c[0], c[1], c[2], 255), font=font_brand)
    
    # 10. BOTTOM FLOATING GLASS HUD CARD (Feature Title, Desc & Progress Timeline)
    hud_h = 100
    hud_y = H - hud_h - 18
    hud_x = mock_x
    hud_w = mock_w
    
    # Floating HUD Card Glass Background
    hud_glass = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    hg_draw = ImageDraw.Draw(hud_glass)
    hg_draw.rounded_rectangle(
        (hud_x, hud_y, hud_x + hud_w, hud_y + hud_h),
        radius=14,
        fill=(15, 23, 42, 235),
        outline=(51, 65, 85, 200),
        width=1
    )
    # Colored left indicator strip on HUD
    hg_draw.rounded_rectangle(
        (hud_x, hud_y, hud_x + 6, hud_y + hud_h),
        radius=3,
        fill=(c[0], c[1], c[2], 255)
    )
    hud_glass = hud_glass.filter(ImageFilter.GaussianBlur(1))
    canvas = Image.alpha_composite(canvas, hud_glass)
    draw = ImageDraw.Draw(canvas)
    
    # HUD Badge
    badge_pad_x = 10
    badge_w = 210
    draw.rounded_rectangle(
        (hud_x + 22, hud_y + 14, hud_x + 22 + badge_w, hud_y + 34),
        radius=6,
        fill=(c[0], c[1], c[2], 30),
        outline=(c[0], c[1], c[2], 180),
        width=1
    )
    draw.text((hud_x + 30, hud_y + 16), meta["badge"], fill=(c[0], c[1], c[2], 255), font=font_badge)
    
    # HUD Title
    draw.text((hud_x + 22, hud_y + 40), meta["title"], fill=(255, 255, 255, 255), font=font_title)
    
    # HUD Description
    draw.text((hud_x + 22, hud_y + 72), meta["desc"], fill=(148, 163, 184, 255), font=font_desc)
    
    # HUD Right: 4-Segment Interactive Step Progress Indicators
    seg_total_w = 200
    seg_w = (seg_total_w - 15) // 4
    seg_x_start = hud_x + hud_w - seg_total_w - 24
    seg_y = hud_y + 46
    
    for s_idx in range(4):
        sx = seg_x_start + s_idx * (seg_w + 5)
        # Background track
        draw.rounded_rectangle(
            (sx, seg_y, sx + seg_w, seg_y + 6),
            radius=3,
            fill=(30, 41, 59, 255)
        )
        if s_idx < slide_idx:
            # Completed segments (solid theme color)
            draw.rounded_rectangle(
                (sx, seg_y, sx + seg_w, seg_y + 6),
                radius=3,
                fill=(16, 185, 129, 255)
            )
        elif s_idx == slide_idx:
            # Active segment (fills up smoothly from 0 to 1 with t)
            fill_w = max(4, int(seg_w * t))
            draw.rounded_rectangle(
                (sx, seg_y, sx + fill_w, seg_y + 6),
                radius=3,
                fill=(c[0], c[1], c[2], 255)
            )
    
    draw.text((seg_x_start, seg_y - 18), "OVERVIEW FLOW PROGRESS", fill=(100, 116, 139, 255), font=font_pill)
    
    return canvas

# Generate a sample frame at t=0.5 for each of the 4 slides
for i in range(4):
    out_path = os.path.join(flow_dir, f"sample_frame_{i+1}.jpg")
    frame = build_scene_frame(i, 0.65)
    frame.convert("RGB").save(out_path, "JPEG", quality=95)
    print(f"Generated {out_path}")
