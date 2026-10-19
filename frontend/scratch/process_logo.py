import numpy as np
from PIL import Image, ImageFilter

img_path = 'E:/DeFAI_sentinal/frontend/public/WhatsApp Image 2026-10-04 at 11.09.45 AM.jpeg'
img = Image.open(img_path).convert('RGB')
arr = np.array(img, dtype=np.float32)

# Focus strictly on the bounding box containing the E and Rupee
y1, y2 = 490, 1110
x1, x2 = 320, 1280

crop = arr[y1:y2, x1:x2].copy()
h, w, _ = crop.shape

r = crop[:, :, 0]
g = crop[:, :, 1]
b = crop[:, :, 2]

# Sample local background color from corners of this crop
bg_samples = np.vstack([
    crop[:20, :20].reshape(-1, 3),
    crop[:20, -20:].reshape(-1, 3),
    crop[-20:, :20].reshape(-1, 3),
    crop[-20:, -20:].reshape(-1, 3)
])
bg_color = np.mean(bg_samples, axis=0)

# Distance to background
dist_to_bg = np.linalg.norm(crop - bg_color, axis=2)

# 1. Detect 'E' (white front face + bevel)
is_e_face = (r > 190) & (g > 190) & (b > 190)
is_e_bevel = (r > 120) & (g > 120) & (b > 120) & (np.abs(r - g) < 20) & (np.abs(g - b) < 20) & (dist_to_bg > 50)
is_e = is_e_face | is_e_bevel

# 2. Detect '₹' (green front face + shaded sides + anti-aliased edges)
is_rupee = (g > b + 15) & (g > r - 15) & (g > 60) & (dist_to_bg > 30)
is_rupee_edge = (g > b + 8) & (dist_to_bg > 25) & ~is_e
is_rupee_all = is_rupee | is_rupee_edge

# 3. Transform the Rupee from Green to vibrant Royal Blue
luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255.0
norm_lum = np.clip(luminance / 0.75, 0.2, 1.35)

new_r = r.copy()
new_g = g.copy()
new_b = b.copy()

lum_rup = norm_lum[is_rupee_all]
new_r[is_rupee_all] = np.clip(25 * (lum_rup ** 1.5), 0, 255)
new_g[is_rupee_all] = np.clip(115 * lum_rup, 0, 255)
new_b[is_rupee_all] = np.clip(255 * (lum_rup ** 0.8), 0, 255)

# Keep 'E' clean white
new_r[is_e_face] = 255
new_g[is_e_face] = 255
new_b[is_e_face] = 255

# 4. Alpha transparency mask
alpha = np.zeros((h, w), dtype=np.float32)
alpha[is_e] = 1.0
alpha[is_rupee_all] = 1.0

# Subtle shadow
is_shadow = (dist_to_bg > 25) & ~is_e & ~is_rupee_all & (luminance < 0.3)
alpha[is_shadow] = np.clip((dist_to_bg[is_shadow] - 25) / 35.0, 0, 0.75)

# Smooth mask with Gaussian blur
mask_img = Image.fromarray((alpha * 255).astype(np.uint8), mode='L')
mask_smooth = mask_img.filter(ImageFilter.GaussianBlur(radius=1.0))
alpha_smooth = np.array(mask_smooth, dtype=np.float32) / 255.0

# Build final RGBA
rgba = np.zeros((h, w, 4), dtype=np.uint8)
rgba[:, :, 0] = np.clip(new_r, 0, 255).astype(np.uint8)
rgba[:, :, 1] = np.clip(new_g, 0, 255).astype(np.uint8)
rgba[:, :, 2] = np.clip(new_b, 0, 255).astype(np.uint8)
rgba[:, :, 3] = np.clip(alpha_smooth * 255, 0, 255).astype(np.uint8)

# Crop tight to content
y_idx, x_idx = np.where(alpha_smooth > 0.05)
pad = 12
ymin = max(0, np.min(y_idx) - pad)
ymax = min(h, np.max(y_idx) + pad)
xmin = max(0, np.min(x_idx) - pad)
xmax = min(w, np.max(x_idx) + pad)

final_crop = rgba[ymin:ymax, xmin:xmax]
final_img = Image.fromarray(final_crop, mode='RGBA')

out_path = 'E:/DeFAI_sentinal/frontend/public/escapement-logo-blue.png'
final_img.save(out_path, format='PNG')
print(f"Final clean logo saved to {out_path} with size {final_img.size}")
