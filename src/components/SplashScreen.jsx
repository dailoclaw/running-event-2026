import { useEffect, useState } from 'react'

export default function SplashScreen({ onDone }) {
  const [phase, setPhase] = useState('visible') // visible → fading → gone

  useEffect(() => {
    const fadeTimer = setTimeout(() => setPhase('fading'), 2400)
    const doneTimer = setTimeout(() => { setPhase('gone'); onDone?.() }, 3000)
    return () => { clearTimeout(fadeTimer); clearTimeout(doneTimer) }
  }, [])

  if (phase === 'gone') return null

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 99999,
      overflow: 'hidden',
      opacity: phase === 'fading' ? 0 : 1,
      transition: 'opacity 0.6s ease',
    }}>
      {/* Background image — center-focused for both orientations */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'url(/splash.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center center',
        // On portrait mobile, show the runner in foreground (left side of image)
        // On landscape / desktop, show full width naturally
      }} />

      {/* Gradient overlay — stronger at top and bottom for text legibility */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: `
          linear-gradient(
            to bottom,
            rgba(31,56,100,0.65) 0%,
            rgba(0,0,0,0) 30%,
            rgba(0,0,0,0) 50%,
            rgba(31,56,100,0.75) 75%,
            rgba(31,56,100,0.97) 100%
          )
        `,
      }} />

      {/* Top — logo / event name */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        padding: 'clamp(20px, 5vw, 40px) clamp(20px, 6vw, 48px)',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}>
        <img
          src="/runner-192.png"
          alt=""
          style={{
            width: 'clamp(36px, 6vw, 52px)',
            height: 'clamp(36px, 6vw, 52px)',
            borderRadius: 10,
            flexShrink: 0,
          }}
        />
        <div style={{
          color: '#fff',
          fontSize: 'clamp(14px, 2.5vw, 20px)',
          fontWeight: 700,
          letterSpacing: 0.5,
          fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
          textShadow: '0 1px 4px rgba(0,0,0,0.4)',
        }}>
          Marathon Event Manager
        </div>
      </div>

      {/* Bottom — title + loading dots */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 'clamp(24px, 5vw, 48px) clamp(24px, 6vw, 56px)',
        textAlign: 'left',
      }}>
        <div style={{
          color: 'rgba(255,255,255,0.6)',
          fontSize: 'clamp(10px, 1.8vw, 13px)',
          letterSpacing: '0.25em',
          textTransform: 'uppercase',
          marginBottom: 8,
          fontFamily: 'sans-serif',
        }}>
          Adelaide · 2026
        </div>

        <div style={{
          color: '#fff',
          fontSize: 'clamp(28px, 6vw, 52px)',
          fontWeight: 800,
          lineHeight: 1.1,
          fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
          textShadow: '0 2px 12px rgba(0,0,0,0.3)',
          marginBottom: 'clamp(16px, 3vw, 28px)',
        }}>
          Ready.<br />Set.<br />Go.
        </div>

        {/* Loading dots */}
        <div style={{ display: 'flex', gap: 8 }}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{
              width: 8, height: 8,
              borderRadius: '50%',
              background: '#FF4D4D',
              animation: `bounce 1s ease-in-out ${i * 0.18}s infinite`,
            }} />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); opacity: 0.4; }
          50% { transform: translateY(-7px); opacity: 1; }
        }
        @media (orientation: portrait) and (max-width: 600px) {
          /* On narrow portrait phones, anchor image to the runner on left */
          .splash-bg {
            background-position: 30% center !important;
          }
        }
      `}</style>
    </div>
  )
}
