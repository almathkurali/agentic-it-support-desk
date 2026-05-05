import React from 'react'
import Badge from '../components/Badge'

const STATS = [
  { label: 'Total Tickets', value: '142', delta: '+12 this week' },
  { label: 'Resolved',      value: '118', delta: '83% resolution rate' },
  { label: 'Escalated',     value: '24',  delta: '17% escalation rate' },
  { label: 'Avg Response',  value: '1.4m', delta: 'across all tickets' },
]

export default function DashboardScreen({ tickets = [], setScreen }) {
  return (
    <div className="fade-up" style={{ padding: 32 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700 }}>Dashboard</h1>
        <p style={{ color: 'var(--muted)', fontSize: 14, marginTop: 4 }}>
          Agentic IT Support Desk — SJSU BUS4-118S
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        {STATS.map(s => (
          <div key={s.label} style={{
            background: 'var(--white)', border: '1px solid var(--border)',
            borderRadius: 12, padding: '20px 24px',
          }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--accent)' }}>{s.value}</div>
            <div style={{ fontWeight: 600, fontSize: 14, marginTop: 4 }}>{s.label}</div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{s.delta}</div>
          </div>
        ))}
      </div>

      <div style={{
        background: 'linear-gradient(135deg, var(--accent), var(--accent-dim))',
        borderRadius: 12, padding: '24px 28px', marginBottom: 28,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ color: 'white', fontWeight: 700, fontSize: 16 }}>Submit a new IT ticket</div>
          <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, marginTop: 4 }}>
            Our AI agents will route and resolve your issue automatically
          </div>
        </div>
        <button onClick={() => setScreen('ticket')} style={{
          background: 'white', color: 'var(--accent)', border: 'none',
          borderRadius: 8, padding: '10px 20px', fontWeight: 700,
          fontSize: 14, cursor: 'pointer',
        }}>New Ticket</button>
      </div>

      <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>
          Recent Tickets
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'oklch(0.97 0.005 240)' }}>
              {['ID', 'Subject', 'Status', 'Priority', 'Time'].map(h => (
                <th key={h} style={{ padding: '10px 24px', textAlign: 'left', fontSize: 12,
                  fontWeight: 600, color: 'var(--muted)', letterSpacing: '0.05em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tickets.map((t, i) => (
              <tr key={t.id} style={{ borderTop: '1px solid var(--border)',
                background: i % 2 === 0 ? 'transparent' : 'oklch(0.985 0.003 240)' }}>
                <td style={{ padding: '12px 24px', fontSize: 13, fontFamily: 'monospace', color: 'var(--muted)' }}>{t.id}</td>
                <td style={{ padding: '12px 24px', fontSize: 13, fontWeight: 500 }}>{t.subject}</td>
                <td style={{ padding: '12px 24px' }}><Badge type="status" value={t.status} /></td>
                <td style={{ padding: '12px 24px' }}><Badge type="priority" value={t.priority} /></td>
                <td style={{ padding: '12px 24px', fontSize: 12, color: 'var(--muted)' }}>{t.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
