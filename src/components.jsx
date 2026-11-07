export const KEYWORDS = ['Portrait Photography', 'Wedding Photography', 'Event Photography', 'Senior Photos']

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
        <circle cx="32" cy="32" r="31" fill="#0b0b0d" stroke="#3a3a42" strokeWidth="2" />
        <circle cx="32" cy="32" r="22" fill="url(#lg)" />
        <circle cx="32" cy="32" r="7" fill="#0a0420" />
        <circle cx="29" cy="29" r="2.5" fill="#fff" />
      </svg>
      SE
    </span>
  )
}
