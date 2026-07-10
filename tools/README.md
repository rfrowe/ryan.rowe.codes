# Skyline alignment tools

Everything needed to regenerate the home-page Kerry Park skyline banner
(`public/seattle-day.webp` + `public/seattle-night.webp`) and its interactive anchor overlay
(`src/components/SkylineAnchors.tsx`) — for the current photos, or if you ever swap in new ones.

The two photos are shot from slightly different camera positions, so they're aligned with a
**projective homography** estimated from hand-picked corresponding points. That fit is
intentionally imperfect: the leftover parallax gives each anchor a small residual, which is
exactly what makes the markers visibly *glide* and the photo *morph* when you toggle
light/dark. Don't chase a zero-error fit — a per-anchor-exact warp removes the parallax the
effect depends on (and distorts the sparsely-anchored sky/foreground), leaving nothing to move.

## Files

- **`anchor-tool.html`** — a single-file, no-dependency browser tool for picking anchors. Open
  it directly (`file://…/tools/anchor-tool.html`). It shows both photos side by side with a 5×
  magnifier/loupe (click inside the loupe to drop a point on the exact crosshair pixel; arrow
  keys nudge), a live 50/50 blend to judge the fit, and it prints the `day_pts` / `night_pts`
  arrays ready to paste. Its `PRELOAD()` is seeded with the current 21 anchors.
- **`align-homography.py`** — reads the two source photos + the anchor arrays, estimates the
  homography (OpenCV least-squares DLT), warps night→day, crops both to the largest rectangle
  fully inside the warped overlap, writes the two webps, and prints every constant the overlay
  component needs. Deps: `numpy`, `opencv-python`, `pillow`.

## Workflow (new photos)

1. Drop the two source photos in `tools/` as `photo-day-1.jpg` and `photo-night-1.jpg` (or edit
   the filenames at the top of both files).
2. Open `anchor-tool.html`. Pick ~15–25 index-matched pairs on stable, sharp features (Space
   Needle tip/legs, building corners, antenna masts — avoid trees/water/clouds). More pairs
   spread across the frame = a better-conditioned fit. Copy the printed arrays.
3. Paste the arrays into `align-homography.py` (`DAY_PTS` / `NIGHT_PTS`). Optionally paste them
   into `anchor-tool.html`'s `PRELOAD()` so they're there next time.
4. Run `python tools/align-homography.py`. It overwrites the two webps in `public/` and prints
   a block of constants.
5. Paste that block into `src/components/SkylineAnchors.tsx`: `IMG_W`/`IMG_H`, `CROP_*`,
   `DAY_PTS`, `NIGHT_PTS`, `NIGHT_WARPED_PTS`, and `ERRS`.

## Source photos (provenance)

Not committed to the repo (they're large originals — day 4816×2408, night 5130×3108). Re-fetch
them into `tools/` if you need to re-tune the current alignment:

- **Day** — a Kerry Park Seattle skyline shot from Wikimedia Commons, public domain / CC0.
- **Night** — by Tiffany Von Arnim (Flickr `tiffany98101`), Kerry Park at night, CC BY 2.0.

The derived, cropped, aligned `public/seattle-*.webp` are what ship.
