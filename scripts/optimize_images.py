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
