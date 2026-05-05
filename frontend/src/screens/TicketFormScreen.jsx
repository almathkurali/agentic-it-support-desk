import React, { useState } from 'react'
import { DEMO_SCENARIOS } from '../data'
import Icon from '../components/Icon'

const CATEGORIES = [
  { value: 'wifi',     label: 'WiFi',     icon: 'wifi' },
  { value: 'vpn',      label: 'VPN',      icon: 'vpn' },
  { value: 'password', label: 'Password', icon: 'password' },
  { value: 'hardware', label: 'Hardware', icon: 'hardware' },
  { value: 'unknown',  label: 'Other',    icon: 'unknown' },
]

export default function TicketFormScreen({ onSubmit }) {
  const [category, setCategory] = useState('')
  const [subject, setSubject] = useState('')
  const [description, setDescription] = useState('')

  function applyScenario(s) {
    setCategory(s.value)
    setDescription(s.text)
    setSubject(s.label + ' Issue')
  }

  function handleSubmit() {
    if (!description.trim()) return
    onSubmit({ category, subject, description })
  }

  return (
    <div className="fade-up" style={{ padding: 32, maxWidth: 680 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700 }}>New Ticket</h1>
        <p style={{ color: 'var(--muted)', fontSize: 14, marginTop: 4 }}>Describe your IT issue and our agents will handle it</p>
      </div>

      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>Quick scenarios</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {DEMO_SCENARIOS.map(s => (
            <button key={s.value} onClick={() => applyScenario(s)} style={{
              padding: '6px 14px', borderRadius: 20, border: '1px solid var(--border)',
              background: 'var(--white)', fontSize: 13, cursor: 'pointer', fontWeight: 500,
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'inherit' }}
            >{s.label}</button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>Category</div>
        <div style={{ display: 'flex', gap: 8 }}>
          {CATEGORIES.map(c => (
            <button key={c.value} onClick={() => setCategory(c.value)} style={{
              padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontSize: 13,
              border: `1.5px solid ${category === c.value ? 'var(--accent)' : 'var(--border)'}`,
              background: category === c.value ? 'var(--accent-light)' : 'var(--white)',
              color: category === c.value ? 'var(--accent)' : 'inherit',
              fontWeight: category === c.value ? 600 : 400,
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <Icon name={c.icon} size={14} />
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Subject</label>
        <input value={subject} onChange={e => setSubject(e.target.value)}
          placeholder="Brief summary of the issue"
          style={{ width: '100%', padding: '10px 14px', borderRadius: 8,
            border: '1.5px solid var(--border)', fontSize: 14, outline: 'none',
            fontFamily: 'inherit', background: 'var(--white)',
          }} />
      </div>

      <div style={{ marginBottom: 28 }}>
        <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Description</label>
        <textarea value={description} onChange={e => setDescription(e.target.value)}
          placeholder="Describe your issue in detail..."
          rows={5}
          style={{ width: '100%', padding: '10px 14px', borderRadius: 8,
            border: '1.5px solid var(--border)', fontSize: 14, outline: 'none',
            fontFamily: 'inherit', resize: 'vertical', background: 'var(--white)',
          }} />
      </div>

      <button onClick={handleSubmit} disabled={!description.trim()} style={{
        padding: '12px 28px', borderRadius: 8, border: 'none',
        background: description.trim() ? 'var(--accent)' : 'var(--border)',
        color: 'white', fontWeight: 700, fontSize: 15, cursor: description.trim() ? 'pointer' : 'not-allowed',
        transition: 'all 0.15s',
      }}>Submit Ticket</button>
    </div>
  )
}
