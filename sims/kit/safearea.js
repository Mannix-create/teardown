// The part of the screen a page can use. Built pages set viewport-fit=cover, so on a phone in landscape (and above
// all in fullscreen) the page runs under the rounded corners and the camera cutout. The live pages fit their fixed
// 1600 x 900 layout inside this rectangle instead of the whole window, with a little air on touch screens.

let probe = null;

/** env(safe-area-inset-*) in CSS px, read through a hidden probe element. */
export function safeInsets() {
  if (!probe) {
    probe = document.createElement('div');
    probe.setAttribute('aria-hidden', 'true');
    probe.style.cssText =
      'position:fixed;top:0;left:0;width:0;height:0;visibility:hidden;pointer-events:none;' +
      'padding:env(safe-area-inset-top,0px) env(safe-area-inset-right,0px) env(safe-area-inset-bottom,0px) env(safe-area-inset-left,0px)';
    document.body.appendChild(probe);
  }
  const cs = getComputedStyle(probe);
  const px = (v) => parseFloat(v) || 0;
  return {top: px(cs.paddingTop), right: px(cs.paddingRight), bottom: px(cs.paddingBottom), left: px(cs.paddingLeft)};
}

/**
 * Scale and offset that fit a W x H layout inside the usable screen, centred.
 * `top` is space the page reserves above the layout (a site header); `air` is extra margin on touch screens, where
 * rounded corners clip more than the reported insets on some phones.
 */
export function fitRect(W, H, top = 0) {
  const ins = safeInsets();
  const air = matchMedia('(pointer: coarse)').matches ? 10 : 0;
  const left = ins.left + air;
  const right = ins.right + air;
  const t = top + ins.top + air;
  const bottom = ins.bottom + air;
  const w = Math.max(1, innerWidth - left - right);
  const h = Math.max(1, innerHeight - t - bottom);
  const scale = Math.min(w / W, h / H);
  return {scale, x: left + (w - W * scale) / 2, y: t + (h - H * scale) / 2};
}
