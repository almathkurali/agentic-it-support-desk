import React from 'react'
import Badge from '../components/Badge'

export default function HistoryScreen({ tickets = [] }) {
  return (
    <div className="fade-up" style={{ padding: 32 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700 }}>Ticket History</h1>
        <p style={{ color: 'var(--muted)', fontSize: 14, marginTop: 4 }}>All submitted tickets this session</p>
      </div>
      <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
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
            {tickets.length === 0 && (
              <tr><td colSpan={5} style={{ padding: '32px 24px', textAlign: 'center', color: 'var(--muted)', fontSize: 14 }}>
                No tickets yet — submit one to get started
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
