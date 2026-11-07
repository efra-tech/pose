// One window-level pointer shared by every 3D scene, so canvases can stay
// pointer-events: none and never block the text or buttons on top of them.
export const pointer = { x: 0, y: 0 }

if (typeof window !== 'undefined') {
  const set = (cx, cy) => {
    pointer.x = (cx / window.innerWidth) * 2 - 1
    pointer.y = -((cy / window.innerHeight) * 2 - 1)
  }
  window.addEventListener('pointermove', (e) => set(e.clientX, e.clientY), { passive: true })
  window.addEventListener('touchmove', (e) => set(e.touches[0].clientX, e.touches[0].clientY), { passive: true })
}

export const prefersReducedMotion =
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
