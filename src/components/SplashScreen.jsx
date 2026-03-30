import { useEffect, useState } from 'react'

export default function SplashScreen({ onDone }) {
  const [phase, setPhase] = useState('visible') // visible → fading → gone

  useEffect(() => {
    // Show for 2.2s, then fade out over 0.6s
    const fadeTimer = setTimeout(() => setPhase('fading'), 2200)
    const doneTimer = setTimeout(() => { setPhase('gone'); onDone?.() }, 2800)
    return () => { clearTimeout(fadeTimer); clearTimeout(doneTimer) }
  }, [])

  if (phase === 'gone') return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-end',
        overflow: 'hidden',
        opacity: phase === 'fading' ? 0 : 1,
        transition: 'opacity 0.6s ease',
      }}
    >
      {/* Background image */}
      <img
        src="/splash.jpg"
        alt="Running"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center top',
        }}
      />

      {/* Dark gradient overlay at bottom */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, rgba(31,56,100,0.7) 60%, rgba(31,56,100,0.95) 100%)',
      }} />

      {/* Content */}
      <div style={{
        position: 'relative',
        textAlign: 'center',
        color: '#fff',
        padding: '0 24px 64px',
        width: '100%',
      }}>
        <div style={{
          fontSize: 13,
          letterSpacing: 4,
          textTransform: 'uppercase',
          opacity: 0.7,
          marginBottom: 8,
          fontFamily: 'sans-serif',
        }}>
          Adelaide · 2026
        </div>
        <div style={{
          fontSize: 32,
          fontWeight: 800,
          letterSpacing: 1,
          fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
          lineHeight: 1.15,
        }}>
          Marathon<br />Event Manager
        </div>
        <div style={{
          marginTop: 32,
          display: 'flex',
          justifyContent: 'center',
        }}>
          {/* Animated loading dots */}
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: '#FF4D4D',
                margin: '0 4px',
                animation: `bounce 1s ease-in-out ${i * 0.2}s infinite`,
              }}
            />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); opacity: 0.4; }
          50% { transform: translateY(-8px); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
