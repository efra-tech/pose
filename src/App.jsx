import { lazy, Suspense, useEffect, useState } from 'react'
import { Logo, KEYWORDS } from './components'

const LensCanvas = lazy(() => import('./three/Lens'))

const EMAIL = 'mailto:posephotography0@gmail.com?subject=Booking%20a%20shoot%20with%20Pose%20Photography'
const INSTAGRAM = 'https://www.instagram.com/posephotography._/'

export default function App() {
  const [fontsReady, setFontsReady] = useState(false)

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
          <span className="lens-slot" aria-hidden="true">
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
          <a className="btn btn--ghost" href={INSTAGRAM} target="_blank" rel="noreferrer">
            @posephotography._
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

      <footer className="bottombar">© {new Date().getFullYear()} Pose Photography</footer>
    </div>
  )
}
