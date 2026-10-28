import subprocess
import os
import shutil

flow_dir = r"d:\Project\rebuild bionet\frontend\public\assets\video\flow"
video_dir = r"d:\Project\rebuild bionet\frontend\public\assets\video"

f1 = os.path.join(flow_dir, "frame_slide_1.jpg")
f2 = os.path.join(flow_dir, "frame_slide_2.jpg")
f3 = os.path.join(flow_dir, "frame_slide_3.jpg")
f4 = os.path.join(flow_dir, "frame_slide_4.jpg")

out_mp4 = os.path.join(video_dir, "bionet_flow_loop_opt.mp4")
out_webm = os.path.join(video_dir, "bionet_flow_loop.webm")
poster = os.path.join(video_dir, "bionet_network_flow.jpg")

shutil.copyfile(f1, poster)

# Render 4 individual smooth clips (4 seconds each at 30 fps)
frames = [f1, f2, f3, f4]
clips = []

for i, f in enumerate(frames):
    clip_path = os.path.join(flow_dir, f"clip_{i+1}.mp4")
    clips.append(clip_path)
    # Sinusoidal breathing zoom
    vf = (
        "scale=1280:720,format=yuv420p,"
        f"zoompan=z='1.025-0.025*cos(2*PI*on/120)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=120:s=1280x720:fps=30,"
        "fps=30"
    )
    cmd_clip = [
        "ffmpeg", "-y",
        "-loop", "1", "-i", f,
        "-vf", vf,
        "-t", "4",
        "-c:v", "libx264",
        "-preset", "veryfast",
        "-crf", "22",
        "-an",
        clip_path
    ]
    subprocess.run(cmd_clip, capture_output=True)
    print(f"Clip {i+1} rendered.")

# Now concatenate clips with smooth xfade transitions:
# Clip 1 (0 to 4s) xfade with Clip 2 at 3.3s (duration 0.7s) -> length 7.3s
# xfade with Clip 3 at 6.6s (duration 0.7s) -> length 10.6s
# xfade with Clip 4 at 9.9s (duration 0.7s) -> length 13.9s
# xfade back with Clip 1 for seamless loop!

cmd_concat = [
    "ffmpeg", "-y",
    "-i", clips[0],
    "-i", clips[1],
    "-i", clips[2],
    "-i", clips[3],
    "-filter_complex",
    (
        "[0:v][1:v]xfade=transition=fade:duration=0.7:offset=3.3[c01];"
        "[c01][2:v]xfade=transition=fade:duration=0.7:offset=6.6[c012];"
        "[c012][3:v]xfade=transition=fade:duration=0.7:offset=9.9,format=yuv420p[final]"
    ),
    "-map", "[final]",
    "-c:v", "libx264",
    "-preset", "medium",
    "-crf", "25",
    "-movflags", "+faststart",
    "-an",
    out_mp4
]

res = subprocess.run(cmd_concat, capture_output=True, text=True)
if res.returncode != 0:
    print("Concat Error:", res.stderr)
else:
    size_kb = os.path.getsize(out_mp4) / 1024
    print(f"Showcase MP4 Generated! Size: {size_kb:.1f} KB")

# Render WebM version
cmd_webm = [
    "ffmpeg", "-y",
    "-i", out_mp4,
    "-c:v", "libvpx-vp9",
    "-crf", "30",
    "-b:v", "0",
    "-an",
    out_webm
]
subprocess.run(cmd_webm, capture_output=True)
if os.path.exists(out_webm):
    print(f"Showcase WebM Generated! Size: {os.path.getsize(out_webm)/1024:.1f} KB")
