import os, sys, math, subprocess
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import numpy as np

flow_dir = r"d:\Project\rebuild bionet\frontend\public\assets\video\flow"
output_dir = r"d:\Project\rebuild bionet\frontend\public\assets\video"
W, H = 1280, 720
FPS = 30
FRAMES_PER_SLIDE = 105 # 3.5s per slide @ 30fps
CROSSFADE_FRAMES = 15  # 0.5s crossfade
TOTAL_SLIDES = 4
TOTAL_FRAMES = TOTAL_SLIDES * FRAMES_PER_SLIDE # 420 frames = 14.0s

slides_meta = [
    {
        "file": "slide1_dashboard.png",
        "badge": "01 • RINGKASAN OMSET & BONUS",
        "title": "Dashboard Kemitraan & Finansial Real-Time",
        "desc": "Monitoring saldo dompet tunai, bonus sponsor, bonus pasangan 1:1, dan grafik omset harian.",
        "color": (16, 185, 129),     # Emerald
        "url": "bionet.id/app/dashboard",
        "pan_x": 0.35, # Center slightly left towards KPI cards
        "pan_y": 0.45,
        "max_zoom": 1.18,
    },
    {
        "file": "slide2_binary_tree.png",
        "badge": "02 • BINARY GENEALOGY ENGINE",
        "title": "Pohon Jaringan Binary & Genealogi MLM",
        "desc": "Visualisasi struktur genealogi 3 generasi, auto-pairing kaki kiri/kanan, dan aktivasi downline.",
        "color": (6, 182, 212),      # Cyan
        "url": "bionet.id/app/network/binary-tree",
        "pan_x": 0.50, # Center horizontally on the tree
        "pan_y": 0.52, # Pan down towards left & right binary nodes
        "max_zoom": 1.25,
    },
    {
        "file": "slide3_livechat.png",
        "badge": "03 • LIVE CHAT & HELPDESK 24/7",
        "title": "Live Chat Bantuan Layanan Pelanggan",
        "desc": "Komunikasi terenkripsi langsung antara mitra kemitraan dan Customer Service Pusat.",
        "color": (52, 211, 153),     # Mint / Emerald
        "url": "bionet.id/app/support/livechat",
        "pan_x": 0.50,
        "pan_y": 0.52,
        "max_zoom": 1.20,
    },
    {
        "file": "slide4_ai_copilot.png",
        "badge": "04 • ASISTEN AI & BOT TELEGRAM",
        "title": "Bionet AI Copilot (Gemini 3.1 & Telegram)",
        "desc": "Konsultasi cerdas Google Gemini dan sinkronisasi bot Telegram resmi @btfn_assistant_bot.",
        "color": (168, 85, 247),     # Purple
        "url": "bionet.id/app/ai-copilot",
        "pan_x": 0.76, # Smooth zoom into bottom-right AI Copilot popup window
        "pan_y": 0.65,
        "max_zoom": 1.45,
    }
]

# Load fonts
font_badge = ImageFont.truetype("segoeuib.ttf", 12)
font_title = ImageFont.truetype("segoeuib.ttf", 23)
font_desc = ImageFont.truetype("segoeui.ttf", 13)
font_url = ImageFont.truetype("segoeui.ttf", 12)
font_brand = ImageFont.truetype("segoeuib.ttf", 12)
font_pill = ImageFont.truetype("segoeuib.ttf", 11)

# Pre-load clean cropped screenshots
clean_screenshots = []
for meta in slides_meta:
    raw_path = os.path.join(flow_dir, meta["file"])
    raw_im = Image.open(raw_path).convert("RGBA")
    # Crop out top 46px browser bar
    clean_im = raw_im.crop((0, 46, raw_im.width, raw_im.height))
    clean_screenshots.append(clean_im)

# Pre-render static base templates for each slide to achieve 60+ FPS render speed!
mock_w = 1060
mock_h = 490
mock_x = (W - mock_w) // 2
mock_y = 78
content_w = mock_w
content_h = mock_h - 32
tb_h = 32

hud_h = 100
hud_y = H - hud_h - 18
hud_x = mock_x
hud_w = mock_w

slide_base_templates = []
content_masks = []

# Pre-calculate rounded bottom corner mask for screenshot paste
bot_mask = Image.new("L", (content_w, content_h), 0)
bot_draw = ImageDraw.Draw(bot_mask)
bot_draw.rounded_rectangle((0, -10, content_w, content_h), radius=14, fill=255)

print("Pre-rendering optimized background templates...")
for slide_idx, meta in enumerate(slides_meta):
    c = meta["color"]
    
    # 1. Base Dark Canvas
    canvas = Image.new("RGBA", (W, H), (8, 12, 22, 255))
    
    # 2. Ambient Glow Orbs (Computed ONCE per slide!)
    glow_layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow_layer)
    glow_draw.ellipse(
        (W//2 - 380, H//2 - 280, W//2 + 380, H//2 + 280),
        fill=(c[0], c[1], c[2], 44)
    )
    glow_draw.ellipse(
        (W - 220, H - 180, W + 180, H + 220),
        fill=(16, 185, 129, 28)
    )
    glow_layer = glow_layer.filter(ImageFilter.GaussianBlur(80))
    canvas = Image.alpha_composite(canvas, glow_layer)
    
    # 3. Ambient Particle Dots
    particle_layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    p_draw = ImageDraw.Draw(particle_layer)
    for i in range(40):
        px = (i * 149 + 33) % W
        py = (i * 233 + 47) % (H - 120)
        p_alpha = int(35 + 25 * math.sin(i * 1.5))
        p_draw.ellipse((px, py, px + 2, py + 2), fill=(255, 255, 255, p_alpha))
    canvas = Image.alpha_composite(canvas, particle_layer)
    
    # 4. Shadow Layer (Computed ONCE per slide!)
    shadow_layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    s_draw = ImageDraw.Draw(shadow_layer)
    s_draw.rounded_rectangle(
        (mock_x - 12, mock_y - 4, mock_x + mock_w + 12, mock_y + mock_h + 24),
        radius=20,
        fill=(0, 0, 0, 180)
    )
    s_draw.rounded_rectangle(
        (mock_x - 6, mock_y - 6, mock_x + mock_w + 6, mock_y + mock_h + 6),
        radius=18,
        fill=(c[0], c[1], c[2], 50)
    )
    shadow_layer = shadow_layer.filter(ImageFilter.GaussianBlur(16))
    canvas = Image.alpha_composite(canvas, shadow_layer)
    
    # 5. Window Titlebar & Header
    draw = ImageDraw.Draw(canvas)
    draw.rounded_rectangle(
        (mock_x, mock_y, mock_x + mock_w, mock_y + mock_h),
        radius=14,
        fill=(15, 23, 42, 255),
        outline=(51, 65, 85, 200),
        width=1
    )
    draw.rounded_rectangle(
        (mock_x, mock_y, mock_x + mock_w, mock_y + tb_h + 10),
        radius=14,
        fill=(23, 31, 50, 255)
    )
    draw.rectangle(
        (mock_x, mock_y + 14, mock_x + mock_w, mock_y + tb_h),
        fill=(23, 31, 50, 255)
    )
    draw.line(
        [(mock_x, mock_y + tb_h), (mock_x + mock_w, mock_y + tb_h)],
        fill=(51, 65, 85, 180),
        width=1
    )
    
    # macOS dots
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
    draw.ellipse((url_box_x + 10, mock_y + 13, url_box_x + 16, mock_y + 19), fill=(16, 185, 129, 255))
    draw.text((url_box_x + 24, mock_y + 8), f"https://{meta['url']}", fill=(148, 163, 184, 255), font=font_url)
    draw.text((mock_x + mock_w - 150, mock_y + 9), "● NETWORK ACTIVE", fill=(52, 211, 153, 230), font=font_brand)
    
    # Top Brand Header
    draw.text((mock_x, 32), "BIONET", fill=(255, 255, 255, 255), font=font_brand)
    draw.text((mock_x + 60, 32), "SYSTEM PLATFORM SHOWCASE", fill=(100, 116, 139, 255), font=font_brand)
    step_str = f"FEATURE {slide_idx + 1} OF 4"
    draw.text((mock_x + mock_w - 110, 32), step_str, fill=(c[0], c[1], c[2], 255), font=font_brand)
    
    # Bottom HUD Background
    draw.rounded_rectangle(
        (hud_x, hud_y, hud_x + hud_w, hud_y + hud_h),
        radius=14,
        fill=(15, 23, 42, 245),
        outline=(51, 65, 85, 200),
        width=1
    )
    draw.rounded_rectangle(
        (hud_x, hud_y, hud_x + 6, hud_y + hud_h),
        radius=3,
        fill=(c[0], c[1], c[2], 255)
    )
    
    # HUD Badge
    badge_text = meta["badge"]
    bbox = font_badge.getbbox(badge_text)
    badge_w = (bbox[2] - bbox[0]) + 20
    draw.rounded_rectangle(
        (hud_x + 22, hud_y + 14, hud_x + 22 + badge_w, hud_y + 36),
        radius=6,
        fill=(20, 30, 52, 255),
        outline=(c[0], c[1], c[2], 255),
        width=1
    )
    draw.text((hud_x + 32, hud_y + 18), badge_text, fill=(c[0], c[1], c[2], 255), font=font_badge)
    draw.text((hud_x + 22, hud_y + 42), meta["title"], fill=(255, 255, 255, 255), font=font_title)
    draw.text((hud_x + 22, hud_y + 72), meta["desc"], fill=(148, 163, 184, 255), font=font_desc)
    
    slide_base_templates.append(canvas)

print("Base templates ready!")

def render_frame_fast(slide_idx, t):
    meta = slides_meta[slide_idx]
    c = meta["color"]
    clean_img = clean_screenshots[slide_idx]
    
    # Copy pre-rendered template
    canvas = slide_base_templates[slide_idx].copy()
    
    # Smooth Hermite Ease-In-Out
    ease = t * t * (3.0 - 2.0 * t)
    cur_zoom = 1.0 + (meta["max_zoom"] - 1.0) * ease
    
    orig_w, orig_h = clean_img.size
    crop_w = orig_w / cur_zoom
    crop_h = orig_h / cur_zoom
    
    target_cx = orig_w * meta["pan_x"]
    target_cy = orig_h * meta["pan_y"]
    cur_cx = (orig_w / 2.0) * (1.0 - ease) + target_cx * ease
    cur_cy = (orig_h / 2.0) * (1.0 - ease) + target_cy * ease
    
    crop_x1 = max(0, min(orig_w - crop_w, cur_cx - crop_w / 2.0))
    crop_y1 = max(0, min(orig_h - crop_h, cur_cy - crop_h / 2.0))
    crop_x2 = crop_x1 + crop_w
    crop_y2 = crop_y1 + crop_h
    
    cam_cropped = clean_img.crop((int(crop_x1), int(crop_y1), int(crop_x2), int(crop_y2)))
    cam_resized = cam_cropped.resize((content_w, content_h), Image.Resampling.BILINEAR)
    
    # Paste camera view
    canvas.paste(cam_resized, (mock_x, mock_y + tb_h), bot_mask)
    
    # Draw fast dynamic progress bar
    draw = ImageDraw.Draw(canvas)
    seg_total_w = 200
    seg_w = (seg_total_w - 15) // 4
    seg_x_start = hud_x + hud_w - seg_total_w - 24
    seg_y = hud_y + 46
    
    draw.text((seg_x_start, seg_y - 18), "OVERVIEW FLOW PROGRESS", fill=(100, 116, 139, 255), font=font_pill)
    
    for s_idx in range(4):
        sx = seg_x_start + s_idx * (seg_w + 5)
        draw.rounded_rectangle(
            (sx, seg_y, sx + seg_w, seg_y + 6),
            radius=3,
            fill=(30, 41, 59, 255)
        )
        if s_idx < slide_idx:
            draw.rounded_rectangle(
                (sx, seg_y, sx + seg_w, seg_y + 6),
                radius=3,
                fill=(16, 185, 129, 255)
            )
        elif s_idx == slide_idx:
            fill_w = max(4, int(seg_w * t))
            draw.rounded_rectangle(
                (sx, seg_y, sx + fill_w, seg_y + 6),
                radius=3,
                fill=(c[0], c[1], c[2], 255)
            )
            
    return canvas

def main():
    print(f"Starting optimized render: {TOTAL_FRAMES} frames ({TOTAL_FRAMES/FPS:.1f}s)")
    out_mp4 = os.path.join(output_dir, "bionet_flow_loop_opt.mp4")
    out_webm = os.path.join(output_dir, "bionet_flow_loop.webm")
    poster_jpg = os.path.join(output_dir, "bionet_network_flow.jpg")
    
    # Save first frame as poster
    f0 = render_frame_fast(0, 0.0)
    f0.convert("RGB").save(poster_jpg, "JPEG", quality=95)
    print(f"Saved initial poster: {poster_jpg}")
    
    cmd_mp4 = [
        "ffmpeg", "-y",
        "-f", "rawvideo",
        "-vcodec", "rawvideo",
        "-s", f"{W}x{H}",
        "-pix_fmt", "rgba",
        "-r", str(FPS),
        "-i", "-",
        "-c:v", "libx264",
        "-pix_fmt", "yuv420p",
        "-preset", "veryfast",
        "-crf", "22",
        "-movflags", "+faststart",
        out_mp4
    ]
    
    proc = subprocess.Popen(cmd_mp4, stdin=subprocess.PIPE)
    
    for frame_idx in range(TOTAL_FRAMES):
        slide_idx = frame_idx // FRAMES_PER_SLIDE
        slide_f = frame_idx % FRAMES_PER_SLIDE
        t = slide_f / float(FRAMES_PER_SLIDE)
        
        remaining = FRAMES_PER_SLIDE - slide_f
        if remaining <= CROSSFADE_FRAMES:
            alpha = (CROSSFADE_FRAMES - remaining + 1) / float(CROSSFADE_FRAMES)
            next_idx = (slide_idx + 1) % TOTAL_SLIDES
            frame_curr = render_frame_fast(slide_idx, 1.0)
            frame_next = render_frame_fast(next_idx, 0.0)
            frame = Image.blend(frame_curr, frame_next, alpha)
        else:
            frame = render_frame_fast(slide_idx, t)
            
        proc.stdin.write(frame.tobytes())
        
        if (frame_idx + 1) % 70 == 0 or frame_idx == TOTAL_FRAMES - 1:
            pct = ((frame_idx + 1) / TOTAL_FRAMES) * 100
            print(f"Progress: {frame_idx + 1}/{TOTAL_FRAMES} frames ({pct:.1f}%)")
            
    proc.stdin.close()
    proc.wait()
    print(f"MP4 done: {out_mp4} ({os.path.getsize(out_mp4)/1024/1024:.2f} MB)")
    
    # Convert to WebM using fast realtime VP8/VP9 settings
    print("Generating WebM version...")
    cmd_webm = [
        "ffmpeg", "-y",
        "-i", out_mp4,
        "-c:v", "libvpx-vp9",
        "-crf", "32",
        "-b:v", "1200k",
        "-deadline", "realtime",
        "-cpu-used", "8",
        "-an",
        out_webm
    ]
    subprocess.run(cmd_webm, check=True)
    print(f"WebM done: {out_webm} ({os.path.getsize(out_webm)/1024/1024:.2f} MB)")
    print("FINISHED ALL SUCCESSFULLY!")

if __name__ == "__main__":
    main()
