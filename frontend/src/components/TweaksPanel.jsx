import React, { useState } from 'react'

export default function TweaksPanel({ demo, setDemo, hue, setHue, speed, setSpeed }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 100 }}>
      <button onClick={() => setOpen(o => !o)} style={{
        width: 44, height: 44, borderRadius: '50%', border: 'none',
        background: 'var(--accent)', color: 'white', cursor: 'pointer',
        fontSize: 20, display: 'grid', placeItems: 'center', boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
      }}>⚙</button>
      {open && (
        <div style={{
          position: 'absolute', bottom: 52, right: 0, width: 240,
          background: 'var(--white)', border: '1px solid var(--border)',
          borderRadius: 12, padding: 16, boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
        }}>
          <div style={{ fontWeight: 600, marginBottom: 12 }}>Tweaks</div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, fontSize: 13 }}>
            <input type="checkbox" checked={demo} onChange={e => setDemo(e.target.checked)} />
            Demo mode (simulate backend)
          </label>
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 4 }}>Accent hue ({hue})</div>
            <input type="range" min={180} max={320} value={hue}
              onChange={e => {
                setHue(e.target.value)
                document.documentElement.style.setProperty('--accent', `oklch(0.55 0.2 ${e.target.value})`)
                document.documentElement.style.setProperty('--accent-dim', `oklch(0.65 0.15 ${e.target.value})`)
                document.documentElement.style.setProperty('--accent-light', `oklch(0.92 0.06 ${e.target.value})`)
              }}
              style={{ width: '100%' }} />
          </div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 4 }}>Animation speed</div>
            <select value={speed} onChange={e => setSpeed(e.target.value)}
              style={{ width: '100%', padding: '4px 8px', borderRadius: 6, border: '1px solid var(--border)', fontSize: 13 }}>
              <option value="slow">Slow</option>
              <option value="normal">Normal</option>
              <option value="fast">Fast</option>
            </select>
          </div>
        </div>
      )}
    </div>
  )
}
