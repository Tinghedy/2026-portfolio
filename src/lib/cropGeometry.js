/**
 * Geometry for the image cropper. Crop rects are normalized to the image box:
 * `{ x, y, w, h }` with every value in 0–1, origin top-left.
 *
 * Kept free of React/DOM so the maths can be tested on its own.
 */

/** Smallest allowed crop edge, as a fraction of the image. */
export const MIN_SIZE = 0.05;

export const clamp01 = (n) => Math.min(1, Math.max(0, n));

/** @typedef {{ x: number, y: number, w: number, h: number }} Crop */
/** @typedef {{ width: number, height: number }} Natural */

/**
 * Move a crop rect by a normalized delta, keeping it fully inside the image.
 *
 * @param {Crop} crop
 * @param {number} dx
 * @param {number} dy
 * @returns {Crop}
 */
export function moveCrop(crop, dx, dy) {
  return {
    ...crop,
    x: clamp01(Math.min(crop.x + dx, 1 - crop.w)),
    y: clamp01(Math.min(crop.y + dy, 1 - crop.h)),
  };
}

/**
 * Shrink a crop rect to a target aspect ratio (width / height, in real pixels),
 * anchored at its top-left corner. Never grows past the image bounds.
 *
 * @param {Crop} crop
 * @param {number | null} ratio
 * @param {Natural | null} natural
 * @returns {Crop}
 */
export function fitRatio(crop, ratio, natural) {
  if (!ratio || !natural) return crop;

  let { w, h } = crop;
  const current = (w * natural.width) / (h * natural.height);
  if (current > ratio) w = (h * natural.height * ratio) / natural.width;
  else h = (w * natural.width) / ratio / natural.height;

  // A ratio can push an edge past the image; scale both down to fit.
  const overflow = Math.max(w, h);
  if (overflow > 1) {
    w /= overflow;
    h /= overflow;
  }

  return {
    x: clamp01(Math.min(crop.x, 1 - w)),
    y: clamp01(Math.min(crop.y, 1 - h)),
    w,
    h,
  };
}

/**
 * Resize a crop rect by dragging one of its corners. The opposite corner stays
 * pinned; with a ratio the free axis is shrunk so the locked shape is kept.
 *
 * @param {Crop} crop
 * @param {"nw" | "ne" | "sw" | "se"} mode  Corner being dragged.
 * @param {number} dx  Normalized horizontal delta.
 * @param {number} dy  Normalized vertical delta.
 * @param {number | null} ratio
 * @param {Natural | null} natural
 * @returns {Crop}
 */
export function resizeCrop(crop, mode, dx, dy, ratio, natural) {
  let x1 = crop.x;
  let y1 = crop.y;
  let x2 = crop.x + crop.w;
  let y2 = crop.y + crop.h;

  if (mode.includes("w")) x1 = clamp01(Math.min(x1 + dx, x2 - MIN_SIZE));
  if (mode.includes("e")) x2 = clamp01(Math.max(x2 + dx, x1 + MIN_SIZE));
  if (mode.includes("n")) y1 = clamp01(Math.min(y1 + dy, y2 - MIN_SIZE));
  if (mode.includes("s")) y2 = clamp01(Math.max(y2 + dy, y1 + MIN_SIZE));

  let w = x2 - x1;
  let h = y2 - y1;

  if (ratio && natural) {
    const pxW = w * natural.width;
    const pxH = h * natural.height;
    if (pxW / pxH > ratio) w = (pxH * ratio) / natural.width;
    else h = pxW / ratio / natural.height;
    // Re-pin the corner the user is not dragging.
    if (mode.includes("w")) x1 = x2 - w;
    if (mode.includes("n")) y1 = y2 - h;
  }

  return {
    x: clamp01(Math.min(x1, 1 - w)),
    y: clamp01(Math.min(y1, 1 - h)),
    w: Math.min(w, 1),
    h: Math.min(h, 1),
  };
}

/**
 * Source rect for `ctx.drawImage`, in real pixels and clamped to the bitmap.
 *
 * @param {Crop} crop
 * @param {Natural} natural
 * @returns {{ sx: number, sy: number, sw: number, sh: number }}
 */
export function cropToPixels(crop, natural) {
  const sx = Math.min(natural.width - 1, Math.max(0, Math.round(crop.x * natural.width)));
  const sy = Math.min(natural.height - 1, Math.max(0, Math.round(crop.y * natural.height)));
  return {
    sx,
    sy,
    sw: Math.max(1, Math.min(natural.width - sx, Math.round(crop.w * natural.width))),
    sh: Math.max(1, Math.min(natural.height - sy, Math.round(crop.h * natural.height))),
  };
}

/**
 * `clip-path` polygon that dims everything except the crop rect: the outer ring
 * runs clockwise and the inner one counter-clockwise, so the nonzero fill rule
 * punches a hole.
 *
 * @param {Crop} crop
 * @returns {string}
 */
export function shadePolygon(crop) {
  const pct = (n) => `${(n * 100).toFixed(4)}%`;
  const { x, y, w, h } = crop;
  return [
    "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%",
    `${pct(x)} ${pct(y)}`,
    `${pct(x)} ${pct(y + h)}`,
    `${pct(x + w)} ${pct(y + h)}`,
    `${pct(x + w)} ${pct(y)}`,
    `${pct(x)} ${pct(y)})`,
  ].join(", ");
}
