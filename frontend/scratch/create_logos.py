import numpy as np
from PIL import Image, ImageFilter

raw = Image.open('frontend/public/raw_logo_crop.png').convert('RGB')
arr = np.array(raw, dtype=np.float32)
h, w, _ = arr.shape

r, g, b = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2]

# Compute greenness index for Rupee
green_score = g - np.maximum(r, b)
is_rupee = (green_score > 12) & (g > 60)

# Grow rupee mask slightly to capture edges
rupee_img = Image.fromarray((is_rupee * 255).astype(np.uint8))
rupee_dilated = np.array(rupee_img.filter(ImageFilter.MaxFilter(size=5))) > 0
is_rupee_refined = rupee_dilated & ((green_score > 3) | ((g > b + 10) & (g > 45)))

# For E: high brightness, low saturation (neutral gray/white)
brightness = (r + g + b) / 3.0
saturation = np.maximum(np.maximum(r, g), b) - np.minimum(np.minimum(r, g), b)
is_e = (brightness > 135) & (saturation < 35) & (~is_rupee_refined)

# Dilate E slightly
e_img = Image.fromarray((is_e * 255).astype(np.uint8))
e_dilated = np.array(e_img.filter(ImageFilter.MaxFilter(size=5))) > 0
is_e_refined = e_dilated & (brightness > 95) & (saturation < 40) & (~is_rupee_refined)

# Combine foreground mask
fg_mask = is_e_refined | is_rupee_refined

# Clean anti-aliased alpha mask
mask_img = Image.fromarray((fg_mask * 255).astype(np.uint8), mode='L')
mask_blur = mask_img.filter(ImageFilter.GaussianBlur(radius=0.8))
alpha = np.array(mask_blur, dtype=np.float32) / 255.0

# Recoloring Rupee to vibrant royal blue (#0066ff)
rup_lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255.0
norm_lum = np.clip(rup_lum / 0.65, 0.2, 1.4)

new_r = r.copy()
new_g = g.copy()
new_b = b.copy()

norm_sub = norm_lum[is_rupee_refined]
new_r[is_rupee_refined] = np.clip(20 * (norm_sub ** 2.0), 0, 255)
new_g[is_rupee_refined] = np.clip(102 * norm_sub, 0, 255)
new_b[is_rupee_refined] = np.clip(255 * (norm_sub ** 0.6), 0, 255)

# Version 1: White E (as in original, but clean with crisp 3D bevels)
v1_r = new_r.copy()
v1_g = new_g.copy()
v1_b = new_b.copy()

e_lum_sub = (brightness[is_e_refined] / 255.0)
v1_r[is_e_refined] = np.clip(255 * (e_lum_sub ** 0.4), 180, 255)
v1_g[is_e_refined] = np.clip(255 * (e_lum_sub ** 0.4), 180, 255)
v1_b[is_e_refined] = np.clip(255 * (e_lum_sub ** 0.4), 180, 255)

rgba_v1 = np.zeros((h, w, 4), dtype=np.uint8)
rgba_v1[:, :, 0] = np.clip(v1_r, 0, 255).astype(np.uint8)
rgba_v1[:, :, 1] = np.clip(v1_g, 0, 255).astype(np.uint8)
rgba_v1[:, :, 2] = np.clip(v1_b, 0, 255).astype(np.uint8)
rgba_v1[:, :, 3] = np.clip(alpha * 255, 0, 255).astype(np.uint8)

# Crop tight to content
y_idx, x_idx = np.where(alpha > 0.05)
ymin, ymax = np.min(y_idx), np.max(y_idx)
xmin, xmax = np.min(x_idx), np.max(x_idx)

# Add small 8px padding
ymin = max(0, ymin - 8)
ymax = min(h - 1, ymax + 8)
xmin = max(0, xmin - 8)
xmax = min(w - 1, xmax + 8)

img_v1 = Image.fromarray(rgba_v1[ymin:ymax+1, xmin:xmax+1], mode='RGBA')
img_v1.save('frontend/public/escapement-logo-blue.png')

# Version 2: Dark Obsidian 3D E (#0b0f19) matching the dark text of the website
v2_r = new_r.copy()
v2_g = new_g.copy()
v2_b = new_b.copy()

dark_lum_sub = np.clip((brightness[is_e_refined] - 95) / (255 - 95), 0.0, 1.0)
v2_r[is_e_refined] = np.clip(11 + 45 * dark_lum_sub, 0, 255)
v2_g[is_e_refined] = np.clip(15 + 55 * dark_lum_sub, 0, 255)
v2_b[is_e_refined] = np.clip(25 + 75 * dark_lum_sub, 0, 255)

rgba_v2 = np.zeros((h, w, 4), dtype=np.uint8)
rgba_v2[:, :, 0] = np.clip(v2_r, 0, 255).astype(np.uint8)
rgba_v2[:, :, 1] = np.clip(v2_g, 0, 255).astype(np.uint8)
rgba_v2[:, :, 2] = np.clip(v2_b, 0, 255).astype(np.uint8)
rgba_v2[:, :, 3] = np.clip(alpha * 255, 0, 255).astype(np.uint8)

img_v2 = Image.fromarray(rgba_v2[ymin:ymax+1, xmin:xmax+1], mode='RGBA')
img_v2.save('frontend/public/escapement-logo-blue-dark-e.png')

print(f"Generated clean logo v1 (white E) size: {img_v1.size}")
print(f"Generated clean logo v2 (dark E) size: {img_v2.size}")
