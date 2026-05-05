import React, { useEffect, useState } from 'react'
import Icon from './Icon'

export default function AgentStep({ label, description, status = 'pending', delay = 0 }) {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay)
    return () => clearTimeout(t)
  }, [delay])

  if (!visible) return <div style={{ height: 64 }} />

  const colors = {
    pending:  'var(--muted)',
    running:  'var(--accent)',
    done:     'var(--success)',
    error:    'var(--danger)',
  }
  const color = colors[status] || colors.pending

  return (
    <div className="slide-in" style={{
      display: 'flex', gap: 14, alignItems: 'flex-start', padding: '12px 0',
    }}>
      <div style={{ position: 'relative', width: 28, height: 28, flexShrink: 0 }}>
        {status === 'running' && (
          <div style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            border: `2px solid ${color}`, animation: 'pulse-ring 1.2s ease-out infinite',
          }} />
        )}
        <div style={{
          width: 28, height: 28, borderRadius: '50%',
          border: `2px solid ${color}`,
          background: status === 'done' ? color : 'transparent',
          display: 'grid', placeItems: 'center',
        }}>
          {status === 'running' && (
            <div style={{
              width: 12, height: 12, borderRadius: '50%',
              border: '2px solid transparent',
              borderTopColor: color,
              animation: 'spin 0.7s linear infinite',
            }} />
          )}
          {status === 'done' && <Icon name="check" size={14} color="white" />}
          {status === 'error' && <Icon name="alert" size={14} color={color} />}
          {status === 'pending' && (
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
          )}
        </div>
      </div>
      <div>
        <div style={{ fontWeight: 600, fontSize: 14, color: status === 'pending' ? 'var(--muted)' : 'inherit' }}>
          {label}
        </div>
        {description && (
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{description}</div>
        )}
      </div>
    </div>
  )
}
