import { useEffect, useRef, useState } from 'react'
import { prefersReducedMotion } from './three/pointer'

export const KEYWORDS = ['Portrait Photography', 'Wedding Photography', 'Event Photography', 'Senior Photos']

/** 0 → 100 counter with the service keywords flicking past, then wipes away. */
export function Preloader({ onDone }) {
  const [n, setN] = useState(0)
  const [leaving, setLeaving] = useState(false)
  useEffect(() => {
    const start = performance.now()
    const dur = prefersReducedMotion ? 400 : 1900
    let raf
    const tick = (now) => {
      const p = Math.min(1, (now - start) / dur)
      setN(Math.round((1 - Math.pow(1 - p, 3)) * 100))
      if (p < 1) raf = requestAnimationFrame(tick)
      else {
        setLeaving(true)
        onDone()
      }
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [onDone])
  const word = KEYWORDS[Math.min(KEYWORDS.length - 1, Math.floor(n / 26))]
  return (
    <div className={`preloader${leaving ? ' is-leaving' : ''}`} aria-hidden="true">
      <div className="preloader__num">{n}</div>
      <div className="preloader__bar">
        <span style={{ transform: `scaleX(${n / 100})` }} />
      </div>
      <div className="preloader__word">( {word} )</div>
    </div>
  )
}

/** Types and deletes each keyword in the highlighted block. */
export function Typed({ words, active }) {
  const [text, setText] = useState(prefersReducedMotion ? words[0] : '')
  const state = useRef({ i: 0, del: false, t: '' })
  useEffect(() => {
    if (!active || prefersReducedMotion) return
    let id
    const step = () => {
      const s = state.current
      const word = words[s.i]
      let delay
      if (!s.del) {
        s.t = word.slice(0, s.t.length + 1)
        if (s.t === word) {
          s.del = true
          delay = 1800
        } else delay = 70 + Math.random() * 60
      } else {
        s.t = word.slice(0, s.t.length - 1)
        delay = 35
        if (!s.t) {
          s.del = false
          s.i = (s.i + 1) % words.length
          delay = 280
        }
      }
      setText(s.t)
      id = setTimeout(step, delay)
    }
    id = setTimeout(step, 600)
    return () => clearTimeout(id)
  }, [active, words])
  return (
    <span className="hl">
      <span className="hl__text">{text || ' '}</span>
      <i className="hl__caret" aria-hidden="true" />
    </span>
  )
}

export function Clock() {
  const fmt = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  const [t, setT] = useState(fmt)
  useEffect(() => {
    const id = setInterval(() => setT(fmt()), 1000)
    return () => clearInterval(id)
  }, [])
  return (
    <span className="mono">
      <span className="hide-sm">Local time </span>
      {t}
    </span>
  )
}

/** Small ring cursor that follows the mouse and grows over links (mouse only). */
export function Cursor() {
  const ref = useRef()
  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return
    const el = ref.current
    el.style.display = 'block'
    let x = innerWidth / 2
    let y = innerHeight / 2
    let cx = x
    let cy = y
    let raf
    const move = (e) => {
      x = e.clientX
      y = e.clientY
      el.classList.toggle('is-hover', !!e.target.closest('a, button'))
    }
    const loop = () => {
      cx += (x - cx) * 0.2
      cy += (y - cy) * 0.2
      el.style.transform = `translate3d(${cx}px, ${cy}px, 0)`
      raf = requestAnimationFrame(loop)
    }
    window.addEventListener('pointermove', move)
    raf = requestAnimationFrame(loop)
    return () => {
      window.removeEventListener('pointermove', move)
      cancelAnimationFrame(raf)
    }
  }, [])
  return <div ref={ref} className="cursor" aria-hidden="true" />
}

export function Logo() {
  return (
    <span className="logo" aria-label="Pose Photography">
      P
      <svg className="logo__lens" viewBox="0 0 64 64" aria-hidden="true">
        <defs>
          <radialGradient id="lg" cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor="#ffd2f4" />
            <stop offset=".25" stopColor="#2a1a8a" />
            <stop offset=".6" stopColor="#5b3dff" />
            <stop offset=".85" stopColor="#e64fc4" />
            <stop offset="1" stopColor="#1a0b35" />
          </radialGradient>
        </defs>
        <circle cx="32" cy="32" r="31" fill="#0b0b0d" stroke="#2a2a31" strokeWidth="2" />
        <circle cx="32" cy="32" r="22" fill="url(#lg)" />
        <circle cx="32" cy="32" r="7" fill="#0a0420" />
        <circle cx="29" cy="29" r="2.5" fill="#fff" />
      </svg>
      SE
    </span>
  )
}
