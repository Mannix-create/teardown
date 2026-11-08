// Fullscreen for live pages. On a phone the browser's address bar and system bars eat a third of a landscape
// screen, so the first tap on the page asks for fullscreen and turns the screen to landscape. A small button in
// the corner toggles fullscreen on any device. Browsers only allow fullscreen from a tap or click, never on load.
// iPhone Safari has no fullscreen for pages; there the button stays hidden and nothing happens.

const CSS = `
.fsbtn{position:fixed;z-index:20;top:calc(env(safe-area-inset-top,0px) + 10px);right:calc(env(safe-area-inset-right,0px) + 10px);
  width:40px;height:40px;display:grid;place-items:center;border:1px solid rgba(22,24,27,.14);border-radius:6px;
  background:rgba(255,255,255,.92);color:#16181b;cursor:pointer;padding:0;-webkit-tap-highlight-color:transparent}
.fsbtn:hover{background:#fff}
.fsbtn:focus-visible{outline:2px solid #16181b;outline-offset:2px}
.fsbtn svg{width:18px;height:18px}
`;

const ENTER = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>';
const EXIT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5"/></svg>';

export function installFullscreen() {
  const root = document.documentElement;
  const can = !!(root.requestFullscreen && document.fullscreenEnabled);
  if (!can) return;

  const style = document.createElement('style');
  style.textContent = CSS;
  document.head.appendChild(style);

  const btn = document.createElement('button');
  btn.className = 'fsbtn';
  btn.type = 'button';
  document.body.appendChild(btn);

  const isFull = () => !!document.fullscreenElement;
  const paint = () => {
    btn.innerHTML = isFull() ? EXIT : ENTER;
    btn.setAttribute('aria-label', isFull() ? 'Exit full screen' : 'Full screen');
    btn.title = btn.getAttribute('aria-label');
  };

  const enter = async () => {
    try {
      await root.requestFullscreen({navigationUI: 'hide'});
      // A phone held upright shows the 16:9 page as a strip; landscape fills the screen.
      await screen.orientation?.lock?.('landscape').catch(() => {});
    } catch {
      /* the browser said no; the page still works */
    }
  };
  const leave = () => document.exitFullscreen().catch(() => {});

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (isFull()) leave();
    else enter();
  });

  // On a touch screen the first tap anywhere goes fullscreen. After that taps drive the page as usual, and
  // leaving fullscreen (back gesture or the button) is respected until the next page load.
  if (matchMedia('(pointer: coarse)').matches) {
    const first = (e) => {
      if (e.target === btn) return;
      removeEventListener('pointerdown', first, true);
      if (!isFull()) enter();
    };
    addEventListener('pointerdown', first, true);
  }

  // The page fits itself on resize; entering or leaving fullscreen changes the size.
  document.addEventListener('fullscreenchange', () => {
    paint();
    dispatchEvent(new Event('resize'));
  });
  paint();
}
