"""One-time migration script — not a general-purpose tool.

This ran once, when the site moved off its old Jekyll scaffold (source
files under _site/assets, with inconsistent phone-export filenames like
"IMG_4821.JPG") onto the current static-HTML structure (assets/img/, with
descriptive slugs like headshot-2024.jpg). It resizes each image to a
1900px max dimension and re-compresses it (JPEG quality 82, optimized PNG),
which is what took the original image set from ~99MB down to ~14MB.

It is NOT the tool to reach for when adding a new photo today — the
RENAME dict below is a fixed, one-time mapping of specific old filenames to
specific new ones, and SRC points at a directory (_site/) that no longer
exists in this repo. To add a photo now: just save an already-reasonably-
sized image (a phone photo run through any image editor/exporter at up to
~1900px on the long edge is plenty) straight into assets/img/ with a
descriptive-slug filename, and reference it from the relevant HTML page.
Requires Pillow (`pip install pillow`) to run at all, which is why it's a
standalone script rather than something wired into a build step — this
site has no build step. See the "generalize the image script" issue in
GitHub Issues if you want to turn this into a reusable "add a photo" tool.
"""

import os
from PIL import Image, ImageOps

SRC = os.path.join("_site", "assets")
DST = os.path.join("assets", "img")

# name -> new slug (lowercase, hyphenated, descriptive)
RENAME = {
    "17blackred.jpg": "headshot-black-red.jpg",
    "17firstheadshot.jpg": "headshot-classic.jpg",
    "17redsuit.jpg": "headshot-red-suit.jpg",
    "17redsuitNoBkg.png": "cutout-red-suit.png",
    "17whitesweater.jpg": "headshot-white-sweater.jpg",
    "Bateman_Jackson_Headshot_2024.jpg": "headshot-2024.jpg",
    "Jackson Bateman Headshot2.jpg": "headshot-studio.jpg",
    "JacksonBatemanHeadshot.jpg": "headshot-primary.jpg",
    "AllBravo.JPG": "bravo-show-choir.jpg",
    "BFAllCast.PNG": "big-fish-full-cast.jpg",
    "BFJuggle.JPG": "big-fish-juggle.jpg",
    "BFclownbros.JPG": "big-fish-clown-bros.jpg",
    "BFsoloclown.JPG": "big-fish-solo-clown.jpg",
    "GreaseBflip.jpg": "grease-backflip.jpg",
    "GreaseFullCast.jpg": "grease-full-cast.jpg",
    "GreaseOTIW.jpg": "grease-one-that-i-want.jpg",
    "GreaseSandy.jpg": "grease-sandy.jpg",
    "GreaseSandyman.jpg": "grease-sandy-danny.jpg",
    "GreaseYOTIW.JPG": "grease-youre-the-one-that-i-want.jpg",
    "IICloseup.JPG": "imaginary-invalid-closeup.jpg",
    "IIFullCast.JPG": "imaginary-invalid-full-cast.jpg",
    "IIServant.JPG": "imaginary-invalid-servant.jpg",
    "IIServants.JPG": "imaginary-invalid-servants.jpg",
    "IITongue.JPG": "imaginary-invalid-comic-bit.jpg",
    "ITWJump.PNG": "into-the-woods-jump.jpg",
    "ITWPrince.PNG": "into-the-woods-prince.jpg",
    "ITWcinder.PNG": "into-the-woods-cinderella.jpg",
    "PhantomMasquerade.JPG": "phantom-masquerade.jpg",
    "PhantomRaoulCC.jpg": "phantom-raoul-close.jpg",
    "PhantomRaoulmad.jpg": "phantom-raoul-intense.jpg",
    "PhantomRehearsal.jpeg": "phantom-rehearsal.jpg",
    "SmokeyBoys.PNG": "smokey-boys.jpg",
    "SmokeyDW.PNG": "smokey-dw.jpg",
    "SmokeyDance.PNG": "smokey-dance.jpg",
    "SmokeyHand.PNG": "smokey-hand.jpg",
    "SmokeyHeart.PNG": "smokey-heart.jpg",
    "SmokeyHeartNoBkg.png": "cutout-smokey-heart.png",
    "SmokeyOnBroadway.PNG": "smokey-on-broadway.jpg",
    "SmokeyOnBroadwayNoBkg.png": "cutout-smokey-broadway.png",
    "SmokeyPotion.PNG": "smokey-potion.jpg",
    "SmokeyRollin.PNG": "smokey-rollin.jpg",
    "SmokeySearchin.PNG": "smokey-searchin.jpg",
    "SmokeyStandByMe.PNG": "smokey-stand-by-me.jpg",
    "BroadwayTheNextGeneration.PNG": "broadway-next-generation.jpg",
}

MAX_DIM = 1900

os.makedirs(DST, exist_ok=True)

report = []
for fname, newname in RENAME.items():
    src_path = os.path.join(SRC, fname)
    if not os.path.exists(src_path):
        print("MISSING:", src_path)
        continue
    dst_path = os.path.join(DST, newname)
    im = Image.open(src_path)
    im = ImageOps.exif_transpose(im)
    w, h = im.size
    if max(w, h) > MAX_DIM:
        scale = MAX_DIM / max(w, h)
        im = im.resize((round(w * scale), round(h * scale)), Image.LANCZOS)

    ext = os.path.splitext(newname)[1].lower()
    orig_size = os.path.getsize(src_path)
    if ext == ".png":
        if im.mode not in ("RGBA", "LA") and "A" not in im.mode:
            im = im.convert("RGB")
        im.save(dst_path, "PNG", optimize=True)
    else:
        if im.mode in ("RGBA", "P"):
            im = im.convert("RGB")
        im.save(dst_path, "JPEG", quality=82, optimize=True, progressive=True)

    new_size = os.path.getsize(dst_path)
    report.append((fname, newname, orig_size // 1024, new_size // 1024))

total_orig = sum(r[2] for r in report)
total_new = sum(r[3] for r in report)
for r in report:
    print(f"{r[0]:40s} -> {r[1]:40s} {r[2]:>6}K -> {r[3]:>6}K")
print(f"\nTOTAL: {total_orig}K -> {total_new}K")
