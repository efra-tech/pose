import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { Logo, KEYWORDS } from './components'

const LensCanvas = lazy(() => import('./three/Lens'))
const LensIntro = lazy(() => import('./three/Lens').then((m) => ({ default: m.LensIntro })))

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

const EMAIL = 'mailto:posephotography0@gmail.com?subject=Booking%20a%20shoot%20with%20Pose%20Photography'

export default function App() {
  const [fontsReady, setFontsReady] = useState(false)
  // the lens flies in from full screen once per page load, then stays put
  const [introDone, setIntroDone] = useState(reducedMotion)
  const slotRef = useRef(null)

  // The lens engraving is drawn with a web font, so wait for it before mounting 3D.
  useEffect(() => {
    const done = () => setFontsReady(true)
    Promise.race([document.fonts.load('600 30px "Inter"'), new Promise((r) => setTimeout(r, 2500))]).then(done, done)
  }, [])

  return (
    <div className="app">
      <header className="topbar">
        <Logo />
        <a className="pill" href={EMAIL}>
          Now booking
        </a>
      </header>

      <main className="hero">
        <p className="eyebrow">Photography by Efra Ahsan</p>

        <h1 className="wordmark">
          <span className="sr-only">Pose Photography — portrait, wedding, event and senior photography</span>
          <span aria-hidden="true">P</span>
          <span className={`lens-slot${introDone ? '' : ' is-waiting'}`} ref={slotRef} aria-hidden="true">
            {fontsReady && (
              <Suspense fallback={null}>
                <LensCanvas />
              </Suspense>
            )}
          </span>
          <span aria-hidden="true">SE</span>
        </h1>
        <p className="byline" aria-hidden="true">
          photography by efra
        </p>

        <h2 className="headline">Portraits, weddings, events &amp; senior photos.</h2>

        <p className="lede">
          Natural light, honest moments, and images you&rsquo;ll keep for good.
        </p>

        <div className="ctas">
          <a className="btn btn--primary" href={EMAIL}>
            Book a shoot
          </a>

        </div>
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

      {fontsReady && !introDone && (
        <Suspense fallback={null}>
          <LensIntro slotRef={slotRef} onDone={() => setIntroDone(true)} />
        </Suspense>
      )}

      <footer className="bottombar">© {new Date().getFullYear()} Pose Photography</footer>
    </div>
  )
}
