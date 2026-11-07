import * as THREE from 'three'

const canvas = (w, h = w) => {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  return [c, c.getContext('2d')]
}

const toTexture = (c) => {
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 4
  return t
}

/** The colourful coated glass you see deep inside the lens (blue → violet → magenta). */
export function irisTexture() {
  const s = 512
  const [c, g] = canvas(s)
  const m = s / 2
  const base = g.createRadialGradient(m, m, 0, m, m, m)
  base.addColorStop(0, '#0a0420')
  base.addColorStop(0.2, '#24148a')
  base.addColorStop(0.45, '#5b3dff')
  base.addColorStop(0.7, '#d248d0')
  base.addColorStop(0.88, '#3a1270')
  base.addColorStop(1, '#07030f')
  g.fillStyle = base
  g.fillRect(0, 0, s, s)

  if (g.createConicGradient) {
    const cg = g.createConicGradient(0.8, m, m)
    cg.addColorStop(0, 'rgba(255,90,210,.55)')
    cg.addColorStop(0.22, 'rgba(70,100,255,.15)')
    cg.addColorStop(0.5, 'rgba(140,70,255,.5)')
    cg.addColorStop(0.72, 'rgba(255,255,255,.06)')
    cg.addColorStop(1, 'rgba(255,90,210,.55)')
    g.globalCompositeOperation = 'screen'
    g.fillStyle = cg
    g.beginPath()
    g.arc(m, m, s * 0.47, 0, Math.PI * 2)
    g.fill()
  }

  g.globalCompositeOperation = 'source-over'
  g.strokeStyle = 'rgba(255,255,255,.16)'
  g.lineWidth = 2
  for (const r of [0.16, 0.27, 0.38]) {
    g.beginPath()
    g.arc(m, m, s * r, 0, Math.PI * 2)
    g.stroke()
  }

  // dark pupil + the bright pink-white catch light from the logo
  const pupil = g.createRadialGradient(m, m, 0, m, m, s * 0.12)
  pupil.addColorStop(0, '#05020c')
  pupil.addColorStop(1, 'rgba(5,2,12,0)')
  g.fillStyle = pupil
  g.beginPath()
  g.arc(m, m, s * 0.12, 0, Math.PI * 2)
  g.fill()
  const spot = g.createRadialGradient(m - 14, m - 14, 0, m - 14, m - 14, 30)
  spot.addColorStop(0, '#ffffff')
  spot.addColorStop(0.35, '#ffc6f1')
  spot.addColorStop(1, 'rgba(255,120,220,0)')
  g.fillStyle = spot
  g.beginPath()
  g.arc(m - 14, m - 14, 30, 0, Math.PI * 2)
  g.fill()
  return toTexture(c)
}

/** Engraved text ring on the lens face — keyword-rich, like a real lens barrel. */
export function engravingTexture() {
  const s = 1024
  const [c, g] = canvas(s)
  const m = s / 2
  g.fillStyle = '#0c0c10'
  g.fillRect(0, 0, s, s)
  const text = 'POSE PHOTOGRAPHY · PORTRAIT · WEDDING · EVENT · SENIOR PHOTOS · 50mm 1:1.4 · '
  g.font = '600 30px "Space Grotesk", sans-serif'
  g.fillStyle = 'rgba(244,242,234,.78)'
  g.textAlign = 'center'
  g.textBaseline = 'middle'
  // RingGeometry maps its outer radius (0.88) to the canvas edge, so the
  // visible band 0.72..0.88 is 0.41..0.5 of the canvas size.
  const r = s * 0.443
  const chars = [...text]
  const step = (Math.PI * 2) / chars.length
  chars.forEach((ch, i) => {
    const a = i * step - Math.PI / 2
    g.save()
    g.translate(m + Math.cos(a) * r, m + Math.sin(a) * r)
    g.rotate(a + Math.PI / 2)
    g.fillText(ch, 0, 0)
    g.restore()
  })
  // fine tick marks
  g.strokeStyle = 'rgba(244,242,234,.25)'
  g.lineWidth = 2
  for (let i = 0; i < 120; i++) {
    const a = (i / 120) * Math.PI * 2
    const r1 = s * 0.488
    const r2 = s * (i % 10 === 0 ? 0.472 : 0.479)
    g.beginPath()
    g.moveTo(m + Math.cos(a) * r1, m + Math.sin(a) * r1)
    g.lineTo(m + Math.cos(a) * r2, m + Math.sin(a) * r2)
    g.stroke()
  }
  return toTexture(c)
}

/** Fallback artwork for a floating photo card when no real photo has been added yet. */
export function cardTexture(label, hueA, hueB) {
  const w = 512
  const h = 640
  const [c, g] = canvas(w, h)
  const bg = g.createLinearGradient(0, 0, w, h)
  bg.addColorStop(0, hueA)
  bg.addColorStop(1, hueB)
  g.fillStyle = bg
  g.fillRect(0, 0, w, h)
  // soft bokeh
  for (let i = 0; i < 14; i++) {
    const x = Math.random() * w
    const y = Math.random() * h
    const r = 20 + Math.random() * 70
    const rg = g.createRadialGradient(x, y, 0, x, y, r)
    rg.addColorStop(0, 'rgba(255,255,255,.22)')
    rg.addColorStop(1, 'rgba(255,255,255,0)')
    g.fillStyle = rg
    g.beginPath()
    g.arc(x, y, r, 0, Math.PI * 2)
    g.fill()
  }
  // viewfinder corners
  g.strokeStyle = 'rgba(255,255,255,.85)'
  g.lineWidth = 4
  const p = 34
  const l = 46
  ;[
    [p, p, 1, 1],
    [w - p, p, -1, 1],
    [p, h - p, 1, -1],
    [w - p, h - p, -1, -1],
  ].forEach(([x, y, dx, dy]) => {
    g.beginPath()
    g.moveTo(x, y + dy * l)
    g.lineTo(x, y)
    g.lineTo(x + dx * l, y)
    g.stroke()
  })
  g.fillStyle = '#f4f2ea'
  g.textAlign = 'left'
  const lines = label.split('\n')
  const firstY = h - 64 - (lines.length - 1) * 50
  g.font = '500 22px "Space Grotesk", sans-serif'
  g.fillText('( POSE PHOTOGRAPHY )', 60, firstY - 56)
  g.font = '700 46px "Space Grotesk", sans-serif'
  lines.forEach((line, i) => g.fillText(line, 60, firstY + i * 50))
  g.fillStyle = '#ff5a5a'
  g.beginPath()
  g.arc(w - 72, 72, 9, 0, Math.PI * 2)
  g.fill()
  g.fillStyle = 'rgba(255,255,255,.85)'
  g.font = '500 20px "Space Grotesk", sans-serif'
  g.textAlign = 'right'
  g.fillText('REC', w - 92, 79)
  return toTexture(c)
}
