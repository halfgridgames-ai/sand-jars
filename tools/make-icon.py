# Draws the Sand Jars app icon (web/icon-512.png, apple-touch-icon, icon-192) and the Play feature graphic.
# A glass jar of wavy sand-art strata with a cork, on the game's dusk sky. Needs Pillow.
import math, random, pathlib
from PIL import Image, ImageDraw, ImageFilter
root = pathlib.Path(__file__).resolve().parent.parent
S = 1024
SAND = [(239, 91, 91), (245, 150, 59), (247, 208, 70), (56, 178, 122), (92, 196, 242), (139, 92, 214), (242, 123, 184)]

def sky(w, h):
    im = Image.new('RGB', (w, h)); d = ImageDraw.Draw(im)
    top, mid, bot = (58, 36, 92), (178, 103, 143), (242, 176, 138)
    for y in range(h):
        k = y / h
        c = [int(top[i] + (mid[i] - top[i]) * k / 0.6) for i in range(3)] if k < 0.6 else [int(mid[i] + (bot[i] - mid[i]) * (k - 0.6) / 0.4) for i in range(3)]
        d.line([(0, y), (w, y)], fill=tuple(c))
    return im

def jar(size, seed=3):
    """RGBA jar image size x size."""
    r = random.Random(seed); W = H = size; SS = 2; w, h = W * SS, H * SS
    im = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    x0, x1, y0, y1 = int(w * 0.24), int(w * 0.76), int(h * 0.2), int(h * 0.9)
    rad = int(w * 0.07)
    body = Image.new('L', (w, h), 0); ImageDraw.Draw(body).rounded_rectangle((x0, y0, x1, y1), rad, fill=255)
    # sand strata: wavy bands from the bottom up
    sand = Image.new('RGB', (w, h), (0, 0, 0)); px = sand.load()
    bands = []; top = y0 + int((y1 - y0) * 0.12)
    n = 6; edges = [y1 - (y1 - top) * i / n for i in range(n + 1)]
    ph = [r.random() * 6 for _ in range(n + 1)]; amp = [(y1 - y0) * (0.03 + 0.03 * r.random()) for _ in range(n + 1)]
    order = [0, 2, 4, 5, 1, 6]; r.shuffle(order) if seed != 3 else None; cols = [SAND[i] for i in order]
    for y in range(y0, y1):
        for x in range(x0, x1):
            fx = (x - x0) / (x1 - x0)
            band = -1
            for i in range(n):
                hi = edges[i + 1] + amp[i + 1] * math.sin(fx * 6.3 + ph[i + 1]) if i + 1 < n else top + amp[n] * math.sin(fx * 5 + ph[n]) * 0.6
                if y >= hi: band = i; break
            if band < 0: continue
            c = cols[band]; f = 0.9 + r.random() * 0.2
            if r.random() < 0.05: f *= 1.25
            elif r.random() < 0.04: f *= 0.7
            f *= 1 - 0.18 * max(0, (y - y0) / (y1 - y0) - 0.5)
            px[x, y] = tuple(min(255, int(v * f)) for v in c)
    smask = body.copy(); d = ImageDraw.Draw(smask)
    sm = Image.new('L', (w, h), 0); sp = sm.load(); spx = sand.load()
    for y in range(y0, y1):
        for x in range(x0, x1):
            if spx[x, y] != (0, 0, 0): sp[x, y] = 255
    sm = Image.composite(sm, Image.new('L', (w, h), 0), body)
    # glass back
    glass = Image.new('RGBA', (w, h), (255, 255, 255, 34)); im = Image.composite(glass, im, body)
    im.paste(sand, (0, 0), sm)
    d = ImageDraw.Draw(im)
    # wall shading and highlights
    sh = Image.new('RGBA', (w, h), (0, 0, 0, 0)); sd = ImageDraw.Draw(sh)
    for i in range(int((x1 - x0) * 0.14)):
        a = int(90 * (1 - i / ((x1 - x0) * 0.14)))
        sd.line([(x0 + i, y0), (x0 + i, y1)], fill=(40, 14, 50, a)); sd.line([(x1 - i, y0), (x1 - i, y1)], fill=(40, 14, 50, a))
    sh.putalpha(Image.composite(sh.getchannel('A'), Image.new('L', (w, h), 0), body)); im.alpha_composite(sh)
    d.rounded_rectangle((x0 + int(w * 0.035), y0 + int(h * 0.06), x0 + int(w * 0.065), y1 - int(h * 0.12)), int(w * 0.015), fill=(255, 255, 255, 170))
    d.rounded_rectangle((x1 - int(w * 0.06), y0 + int(h * 0.1), x1 - int(w * 0.045), y0 + int(h * 0.38)), int(w * 0.01), fill=(255, 255, 255, 90))
    d.rounded_rectangle((x0, y0, x1, y1), rad, outline=(255, 255, 255, 235), width=int(w * 0.012))
    # rim and cork
    d.rounded_rectangle((x0 - int(w * 0.015), y0 - int(h * 0.025), x1 + int(w * 0.015), y0 + int(h * 0.02)), int(w * 0.015), fill=(236, 244, 255, 255))
    cx0, cx1 = x0 + int(w * 0.05), x1 - int(w * 0.05)
    d.rounded_rectangle((cx0, y0 - int(h * 0.12), cx1, y0 - int(h * 0.02)), int(w * 0.025), fill=(183, 123, 69, 255))
    d.rounded_rectangle((cx0, y0 - int(h * 0.13), cx1, y0 - int(h * 0.06)), int(w * 0.025), fill=(211, 154, 98, 255))
    for _ in range(40):
        x = r.randint(cx0 + 10, cx1 - 10); y = r.randint(y0 - int(h * 0.125), y0 - int(h * 0.03)); d.ellipse((x, y, x + 6, y + 6), fill=(120, 70, 35, 120))
    return im.resize((W, H), Image.LANCZOS)

def icon():
    bg = sky(S, S).convert('RGBA')
    # soft sun glow behind the jar
    glow = Image.new('RGBA', (S, S), (0, 0, 0, 0)); ImageDraw.Draw(glow).ellipse((S * 0.2, S * 0.3, S * 0.8, S * 0.9), fill=(255, 220, 170, 120))
    bg.alpha_composite(glow.filter(ImageFilter.GaussianBlur(S * 0.08)))
    shadow = Image.new('RGBA', (S, S), (0, 0, 0, 0)); ImageDraw.Draw(shadow).ellipse((S * 0.25, S * 0.86, S * 0.75, S * 0.93), fill=(40, 10, 30, 110))
    bg.alpha_composite(shadow.filter(ImageFilter.GaussianBlur(14)))
    j = jar(S); bg.alpha_composite(j, (0, int(S * 0.02)))
    return bg.convert('RGB')

def feature():
    W, H = 1024, 500
    bg = sky(W, H).convert('RGBA')
    glow = Image.new('RGBA', (W, H), (0, 0, 0, 0)); ImageDraw.Draw(glow).ellipse((W * 0.55, H * 0.1, W * 1.0, H * 1.2), fill=(255, 220, 170, 110)); bg.alpha_composite(glow.filter(ImageFilter.GaussianBlur(50)))
    for i, (x, s, seed) in enumerate([(0.6, 320, 5), (0.76, 370, 3), (0.92, 320, 9)]):
        j = jar(s, seed); bg.alpha_composite(j, (int(W * x - s / 2), H - s + int(s * 0.07)))
    try:
        from PIL import ImageFont
        f = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 76); f2 = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 30)
        d = ImageDraw.Draw(bg); d.text((48, 150), 'Sand Jars', font=f, fill=(255, 246, 232)); d.text((52, 250), 'Pour. Sort. Relax.', font=f2, fill=(255, 226, 200))
    except Exception as e: print('no font', e)
    return bg.convert('RGB')

if __name__ == '__main__':
    web = root / 'web'; web.mkdir(exist_ok=True)
    ic = icon(); ic.resize((512, 512), Image.LANCZOS).save(web / 'icon-512.png'); ic.resize((192, 192), Image.LANCZOS).save(web / 'icon-192.png'); ic.resize((180, 180), Image.LANCZOS).save(web / 'apple-touch-icon.png')
    ic.save(root / 'store' / 'icon-1024.png')
    feature().save(root / 'store' / 'feature-graphic-1024x500.png')
    print('icon + feature graphic written')
