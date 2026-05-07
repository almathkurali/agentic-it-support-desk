import React, { useEffect } from 'react'
import Icon from '../components/Icon'
import Badge from '../components/Badge'

export default function ResolutionScreen({ ticket, result, onNewTicket }) {
  useEffect(() => {
    console.log("[ResolutionScreen] result prop on mount:", result);
  }, []);

  if (!result) return null
  const { intent, priority, confidence, escalated, resolution } = result
  const pct = Math.round((confidence || 0) * 100)

  return (
    <div className="fade-up" style={{ padding: 32, maxWidth: 620 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700 }}>Resolution</h1>
        <p style={{ color: 'var(--muted)', fontSize: 14, marginTop: 4 }}>
          Agent pipeline completed
        </p>
      </div>

      {escalated && (
        <div style={{
          background: 'oklch(0.95 0.08 25)', border: '1px solid oklch(0.85 0.12 25)',
          borderRadius: 10, padding: '14px 18px', marginBottom: 20,
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <Icon name="escalate" size={18} color="oklch(0.50 0.18 25)" />
          <div>
            <div style={{ fontWeight: 600, fontSize: 14, color: 'oklch(0.40 0.18 25)' }}>
              Escalated to human support
            </div>
            <div style={{ fontSize: 12, color: 'oklch(0.50 0.15 25)', marginTop: 2 }}>
              Confidence below threshold — a technician will follow up
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Intent',     value: intent || 'unknown' },
          { label: 'Priority',   value: <Badge type="priority" value={priority || 'low'} /> },
          { label: 'Confidence', value: `${pct}%` },
        ].map(item => (
          <div key={item.label} style={{
            background: 'var(--white)', border: '1px solid var(--border)',
            borderRadius: 10, padding: '14px 16px',
          }}>
            <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600,
              textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
              {item.label}
            </div>
            <div style={{ fontSize: 15, fontWeight: 600 }}>{item.value}</div>
          </div>
        ))}
      </div>

      <div style={{ background: 'var(--white)', border: '1px solid var(--border)',
        borderRadius: 12, padding: '20px 24px', marginBottom: 20 }}>
        <div style={{ fontWeight: 600, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Icon name="resolution" size={16} color="var(--accent)" />
          Solution
        </div>
        {resolution?.solution ? (
          <div style={{ fontSize: 14, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
            {resolution.solution}
          </div>
        ) : (
          <div style={{ fontSize: 14, color: 'var(--muted)' }}>
            No automated solution found — ticket has been escalated to a technician.
          </div>
        )}
        {resolution?.source && (
          <div style={{ marginTop: 12, fontSize: 12, color: 'var(--muted)',
            borderTop: '1px solid var(--border)', paddingTop: 10 }}>
            Source: {resolution.source}
          </div>
        )}
      </div>

      <button onClick={onNewTicket} style={{
        padding: '11px 24px', borderRadius: 8, border: 'none',
        background: 'var(--accent)', color: 'white',
        fontWeight: 700, fontSize: 14, cursor: 'pointer',
      }}>Submit Another Ticket</button>
    </div>
  )
}
