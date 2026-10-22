import math
from PIL import Image, ImageDraw, ImageFilter

def create_vortex_logo(size=1024):
    # Render at high resolution with supersampling (1024x1024)
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    center = size / 2.0
    radius = size * 0.46
    
    # Create dark circular background with subtle neon rim
    bg_mask = Image.new('L', (size, size), 0)
    draw_bg_mask = ImageDraw.Draw(bg_mask)
    draw_bg_mask.ellipse([center - radius, center - radius, center + radius, center + radius], fill=255)
    
    # Outer dark background
    bg_layer = Image.new('RGBA', (size, size), (11, 15, 25, 255))
    img.paste(bg_layer, (0, 0), bg_mask)
    
    # Draw outer glowing ring (Cyan / Violet)
    ring_layer = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw_ring = ImageDraw.Draw(ring_layer)
    
    ring_width = int(size * 0.025)
    for i in range(ring_width):
        r_current = radius - i
        alpha = int(180 * (1 - i / ring_width))
        draw_ring.ellipse(
            [center - r_current, center - r_current, center + r_current, center + r_current],
            outline=(0, 240, 255, alpha)
        )
    img = Image.alpha_composite(img, ring_layer)

    # Draw dynamic 3D swirling Vortex arms
    # 4 swirling vortex spiral arms
    arms_layer = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw_arms = ImageDraw.Draw(arms_layer)

    # Colors for arms: Cyan (#00f0ff) -> Electric Blue (#0072ff) -> Neon Purple (#9333ea) -> Magenta (#ff0080)
    color_stops = [
        ((0, 240, 255), (0, 114, 255)),    # Arm 1: Cyan to Blue
        ((0, 114, 255), (147, 51, 234)),   # Arm 2: Blue to Purple
        ((147, 51, 234), (255, 0, 128)),   # Arm 3: Purple to Pink
        ((255, 0, 128), (0, 240, 255))     # Arm 4: Pink to Cyan
    ]

    num_arms = 4
    for arm_idx in range(num_arms):
        base_angle = (arm_idx * (360.0 / num_arms)) * (math.pi / 180.0)
        c_start, c_end = color_stops[arm_idx]

        # Draw spiral arm points
        steps = 180
        prev_pt = None
        for step in range(steps):
            t = step / float(steps)
            # Spiral radius from outer (0.85 * radius) to inner core (0.15 * radius)
            r = radius * (0.86 - 0.70 * t)
            # Spiral angle rotation (160 degrees swirl)
            theta = base_angle + (t * 2.8)
            x = center + r * math.cos(theta)
            y = center + r * math.sin(theta)

            # Thickness transitions: thinner at edges, thicker in mid-body
            thickness = int(size * (0.015 + 0.055 * math.sin(t * math.pi)))

            # Interpolate color
            r_c = int(c_start[0] + (c_end[0] - c_start[0]) * t)
            g_c = int(c_start[1] + (c_end[1] - c_start[1]) * t)
            b_c = int(c_start[2] + (c_end[2] - c_start[2]) * t)
            a_c = int(220 + 35 * math.sin(t * math.pi))

            draw_arms.ellipse(
                [x - thickness, y - thickness, x + thickness, y + thickness],
                fill=(r_c, g_c, b_c, a_c)
            )

    # Soft glow around arms
    glow = arms_layer.filter(ImageFilter.GaussianBlur(radius=int(size * 0.03)))
    img = Image.alpha_composite(img, glow)
    img = Image.alpha_composite(img, arms_layer)

    # Draw Central Vortex Core (Eye of the Vortex)
    core_layer = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw_core = ImageDraw.Draw(core_layer)

    core_outer_r = size * 0.14
    # Cyan/Blue glow circle
    for i in range(int(core_outer_r), 0, -2):
        factor = i / core_outer_r
        alpha = int(240 * (1 - factor * 0.7))
        draw_core.ellipse(
            [center - i, center - i, center + i, center + i],
            fill=(0, 210, 255, alpha)
        )

    # Inner bright core (White & Electric Cyan)
    core_inner_r = size * 0.065
    draw_core.ellipse(
        [center - core_inner_r, center - core_inner_r, center + core_inner_r, center + core_inner_r],
        fill=(255, 255, 255, 255)
    )

    core_glow = core_layer.filter(ImageFilter.GaussianBlur(radius=int(size * 0.02)))
    img = Image.alpha_composite(img, core_glow)
    img = Image.alpha_composite(img, core_layer)

    return img

if __name__ == '__main__':
    import os
    os.makedirs('assets', exist_ok=True)
    os.makedirs('build', exist_ok=True)
    os.makedirs('docs/assets', exist_ok=True)

    print("Gerando Logo oficial do Vortex Browser em altíssima resolução...")
    high_res = create_vortex_logo(1024)

    # 512x512
    icon512 = high_res.resize((512, 512), Image.Resampling.LANCZOS)
    icon512.save('assets/icon.png', 'PNG')
    icon512.save('build/icon.png', 'PNG')
    icon512.save('docs/assets/icon.png', 'PNG')

    # Multi-resolution Windows ICO (16, 24, 32, 48, 64, 128, 256)
    ico_sizes = [(16, 16), (24, 24), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)]
    icon512.save('assets/icon.ico', format='ICO', sizes=ico_sizes)
    icon512.save('build/icon.ico', format='ICO', sizes=ico_sizes)
    icon512.save('docs/assets/icon.ico', format='ICO', sizes=ico_sizes)

    # Favicon 32x32
    fav32 = high_res.resize((32, 32), Image.Resampling.LANCZOS)
    fav32.save('docs/favicon.ico', format='ICO', sizes=[(32, 32)])

    print("Icons gerados com sucesso em assets/, build/ e docs/assets/!")
