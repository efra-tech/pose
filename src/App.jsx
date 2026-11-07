import { lazy, Suspense, useCallback, useEffect, useState } from 'react'
import { Preloader, Typed, Clock, Cursor, Logo, KEYWORDS } from './components'

const LensCanvas = lazy(() => import('./three/Lens'))
const BgScene = lazy(() => import('./three/BgScene'))

const TYPED = ['Portraits', 'Weddings', 'Events', 'Senior Photos']
const EMAIL = 'mailto:posephotography0@gmail.com?subject=Booking%20a%20shoot%20with%20Pose%20Photography'
const INSTAGRAM = 'https://www.instagram.com/posephotography._/'

export default function App() {
  const [loaded, setLoaded] = useState(false)
  const [fontsReady, setFontsReady] = useState(false)
  const [shots, setShots] = useState(0)
  const [flash, setFlash] = useState(0)

  // Canvas textures draw text, so wait for the web font before mounting 3D.
  useEffect(() => {
    const done = () => setFontsReady(true)
    Promise.race([
      Promise.all([document.fonts.load('600 30px "Space Grotesk"'), document.fonts.load('700 46px "Space Grotesk"')]),
      new Promise((r) => setTimeout(r, 2500)),
    ]).then(done, done)
  }, [])

  const onLoaded = useCallback(() => setLoaded(true), [])
  const ready = loaded && fontsReady

  const shoot = () => {
    setShots((s) => s + 1)
    setFlash((f) => f + 1)
    if (navigator.vibrate) navigator.vibrate(12)
  }

  return (
    <div className={`app${ready ? ' is-ready' : ''}`}>
      <Preloader onDone={onLoaded} />
      <Cursor />

      <div className="backdrop" aria-hidden="true" />
      {fontsReady && (
        <Suspense fallback={null}>
          <BgScene ready={ready} />
        </Suspense>
      )}
      <div className="scrim" aria-hidden="true" />

      <div className="corners" aria-hidden="true">
        <i /> <i /> <i /> <i />
      </div>

      <header className="topbar">
        <span className="topbar__logo">
          <Logo />
        </span>
        <div className="topbar__right">
          <a className="pill pill--status" href={EMAIL}>
            <span className="dot" /> Now booking
          </a>
        </div>
      </header>

      <main className="hero">
        <p className="eyebrow reveal" style={{ '--d': 0 }}>
          ( Photography by Efra Ahsan )
        </p>

        <h1 className="wordmark reveal" style={{ '--d': 1 }}>
          <span className="sr-only">Pose Photography — portrait, wedding, event and senior photography</span>
          <span aria-hidden="true">P</span>
          <button className="lens-slot" onClick={shoot} aria-label="Take a photo">
            {fontsReady && (
              <Suspense fallback={null}>
                <LensCanvas ready={ready} shots={shots} />
              </Suspense>
            )}
          </button>
          <span aria-hidden="true">SE</span>
        </h1>
        <p className="byline reveal" style={{ '--d': 2 }} aria-hidden="true">
          photography by efra
        </p>

        <h2 className="headline reveal" style={{ '--d': 3 }}>
          <span className="headline__line">Book a shoot for</span>
          <Typed words={TYPED} active={ready} />
        </h2>

        <p className="lede reveal" style={{ '--d': 4 }}>
          Portrait photography, wedding photography, event photography and senior photos. Natural light, honest
          moments, and images you&rsquo;ll keep for good.
        </p>

        <ul className="tags reveal" style={{ '--d': 5 }}>
          {KEYWORDS.map((k) => (
            <li key={k}>{k}</li>
          ))}
        </ul>

        <div className="ctas reveal" style={{ '--d': 6 }}>
          <a className="btn btn--primary" href={EMAIL}>
            Book a shoot <span aria-hidden="true">→</span>
          </a>
          <a className="btn btn--ghost" href={INSTAGRAM} target="_blank" rel="noreferrer">
            @posephotography._
          </a>
        </div>

        <p className="hint mono reveal" style={{ '--d': 7 }} aria-live="polite">
          {shots === 0 ? '( Tap the lens )' : `( ${String(shots).padStart(3, '0')} frames captured )`}
        </p>
      </main>

      <div className="ticker" aria-hidden="true">
        <div className="ticker__track">
          {[0, 1].map((k) => (
            <span key={k}>
              {KEYWORDS.concat(['Couples', 'Family', 'Now Booking']).map((w) => (
                <span key={w}>
                  {w} <b>✦</b>{' '}
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      <footer className="bottombar mono">
        <span>© {new Date().getFullYear()} Pose Photography</span>
        <Clock />
      </footer>

      <div key={flash} className={`flash${flash ? ' is-firing' : ''}`} aria-hidden="true" />
    </div>
  )
}
