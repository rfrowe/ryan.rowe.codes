#!/usr/bin/env python3
"""
Align the night skyline photo onto the day photo via a homography, crop both to their
largest common (overlapping) rectangle, and emit the two webps the home page renders --
plus every constant src/components/SkylineAnchors.tsx needs to draw the anchor overlay.

Workflow (see tools/README.md):
  1. Drop the two source photos next to this script as DAY_FILE / NIGHT_FILE (below).
  2. Pick index-matched anchor pairs in tools/anchor-tool.html and paste them into
     DAY_PTS / NIGHT_PTS below (the tool prints them in exactly this format).
  3. Run:  python tools/align-homography.py
     (needs numpy, opencv-python, pillow -- e.g. `pip install numpy opencv-python pillow`)
  4. It overwrites public/seattle-day.webp + public/seattle-night.webp and prints a block
     of constants -- paste IMG_W/H, CROP_*, DAY_PTS, NIGHT_PTS, NIGHT_WARPED_PTS and ERRS
     into src/components/SkylineAnchors.tsx.

The night photo is warped ONTO the day photo, so the day frame is the reference; the day
webp is just the day photo cropped, and the night webp is warp(night) cropped identically.
"""

import os
import cv2
import numpy as np
from PIL import Image

# --- inputs ---------------------------------------------------------------------------
HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(HERE)
PUBLIC = os.path.join(REPO, "public")

DAY_FILE = os.path.join(HERE, "photo-day-1.jpg")
NIGHT_FILE = os.path.join(HERE, "photo-night-1.jpg")

TARGET_WIDTH = 2400  # rendered webp width; height follows the crop's aspect ratio
WEBP_QUALITY = 82

# Index-matched anchor pairs in NATURAL pixel coords of each source photo (from anchor-tool.html).
DAY_PTS = np.float32([
    [1612, 483], [1406, 746], [1819, 748], [1644, 2004], [2244, 1017], [3398, 1990], [417, 883],
    [1632, 1053], [1899, 1210], [2176, 2007], [1509, 2004], [2946, 1972], [1633, 1387], [1468, 1234],
    [2425, 1270], [573, 1983], [690, 1750], [1038, 1807], [2076, 1209], [2091, 1214], [2429, 1964],
])
NIGHT_PTS = np.float32([
    [2584, 358], [2305, 709], [2856, 712], [2608, 2395], [3459, 1080], [4943, 2394], [1037, 887],
    [2602, 1120], [2998, 1334], [3323, 2409], [2427, 2390], [4176, 2345], [2599, 1568], [2414, 1363],
    [3696, 1423], [1211, 2344], [1370, 2040], [1819, 2120], [3230, 1335], [3248, 1342], [3493, 2330],
])


def maximal_rect(mask):
    """Largest all-ones axis-aligned rectangle in a 0/1 mask (histogram/stack method)."""
    h, w = mask.shape
    heights = np.zeros(w, int)
    best = (0, 0, 0, 0, 0)  # area, x0, y0, x1, y1
    for i in range(h):
        heights = np.where(mask[i] > 0, heights + 1, 0)
        stack = []
        extended = np.append(heights, 0)
        j = 0
        while j < len(extended):
            if not stack or extended[j] >= extended[stack[-1]]:
                stack.append(j)
                j += 1
            else:
                top = stack.pop()
                height = extended[top]
                left = stack[-1] + 1 if stack else 0
                right = j - 1
                area = height * (right - left + 1)
                if area > best[0]:
                    best = (area, left, i - height + 1, right, i)
    return best


def fmt_pairs(pts, per_row=7):
    """Format an (N,2) int array as TSX rows: `  [x, y], [x, y], ...`."""
    rows = []
    for i in range(0, len(pts), per_row):
        chunk = ", ".join("[%d, %d]" % (int(x), int(y)) for x, y in pts[i:i + per_row])
        rows.append("  " + chunk + ",")
    return "\n".join(rows)


def main():
    day = cv2.imread(DAY_FILE)
    night = cv2.imread(NIGHT_FILE)
    if day is None or night is None:
        raise SystemExit("Could not read %s and/or %s" % (DAY_FILE, NIGHT_FILE))
    dh, dw = day.shape[:2]
    nh, nw = night.shape[:2]

    # Least-squares homography over ALL pairs (method=0), then per-point reprojection error.
    H, _ = cv2.findHomography(NIGHT_PTS, DAY_PTS, 0)
    warped_pts = cv2.perspectiveTransform(NIGHT_PTS.reshape(-1, 1, 2), H).reshape(-1, 2)
    errs = np.linalg.norm(warped_pts - DAY_PTS, axis=1)
    print("anchors=%d  reproj mean %.1fpx  max %.1fpx" % (len(DAY_PTS), errs.mean(), errs.max()))

    # Warp the night photo into the day frame; coverage = where warped night actually exists.
    warp = cv2.warpPerspective(night, H, (dw, dh))
    coverage = (cv2.warpPerspective(np.full((nh, nw), 255, np.uint8), H, (dw, dh)) > 0).astype(np.uint8)

    # Largest rectangle fully inside the overlap (compute on a downsampled mask, then inset a
    # touch off every edge so no warp-boundary fringe sneaks in).
    f = 4
    _, x0, y0, x1, y1 = maximal_rect(coverage[::f, ::f])
    x0, y0, x1, y1 = x0 * f, y0 * f, (x1 + 1) * f, (y1 + 1) * f
    x0 += f; y0 += f; x1 -= f; y1 -= f
    x1 = min(x1, dw); y1 = min(y1, dh)
    cw, ch = x1 - x0, y1 - y0
    th = round(ch * TARGET_WIDTH / cw)

    # Emit the two webps: day = cropped day photo, night = cropped warp(night).
    os.makedirs(PUBLIC, exist_ok=True)
    for src, name in [(day, "seattle-day.webp"), (warp, "seattle-night.webp")]:
        rgb = cv2.cvtColor(src[y0:y1, x0:x1], cv2.COLOR_BGR2RGB)
        Image.fromarray(rgb).resize((TARGET_WIDTH, th), Image.LANCZOS).save(
            os.path.join(PUBLIC, name), "WEBP", quality=WEBP_QUALITY, method=6
        )

    # A 50/50 blend with the crop rectangle + anchors drawn, for eyeballing the alignment.
    blend = cv2.addWeighted(day, 0.5, warp, 0.5, 0)
    cv2.rectangle(blend, (x0, y0), (x1, y1), (0, 0, 255), 6)
    for (x, y) in DAY_PTS:
        cv2.circle(blend, (int(x), int(y)), 10, (0, 255, 255), 3)
    cv2.imwrite(os.path.join(HERE, "blend-preview.png"), cv2.resize(blend, (dw // 3, dh // 3)))

    # Paste this block into src/components/SkylineAnchors.tsx.
    print("\n// ---- paste into src/components/SkylineAnchors.tsx ----")
    print("const IMG_W = %d;\nconst IMG_H = %d;" % (TARGET_WIDTH, th))
    print("const CROP_X0 = %d;\nconst CROP_Y0 = %d;\nconst CROP_W = %d;\nconst CROP_H = %d;" % (x0, y0, cw, ch))
    print("\nconst DAY_PTS = [\n%s\n];" % fmt_pairs(DAY_PTS.astype(int)))
    print("\nconst NIGHT_PTS = [\n%s\n];" % fmt_pairs(NIGHT_PTS.astype(int)))
    print("\nconst NIGHT_WARPED_PTS = [\n%s\n];" % fmt_pairs(np.rint(warped_pts).astype(int)))
    print("\nconst ERRS = [%s];" % ", ".join("%.1f" % e for e in errs))


if __name__ == "__main__":
    main()
