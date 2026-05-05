import React from 'react'
import Icon from './Icon'
import Badge from './Badge'

const NAV = [
  { id: 'dashboard',  label: 'Dashboard',      icon: 'dashboard' },
  { id: 'ticket',     label: 'New Ticket',      icon: 'ticket' },
  { id: 'pipeline',   label: 'Agent Pipeline',  icon: 'pipeline' },
  { id: 'resolution', label: 'Resolution',      icon: 'resolution' },
  { id: 'history',    label: 'History',         icon: 'history' },
]

export default function Sidebar({ screen, setScreen, recentTickets = [] }) {
  return (
    <aside style={{
      width: 240, background: 'var(--sidebar-bg)', display: 'flex',
      flexDirection: 'column', padding: '24px 0', flexShrink: 0,
      borderRight: '1px solid oklch(0.22 0.02 255)',
    }}>
      <div style={{ padding: '0 20px 28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'var(--accent)', display: 'grid', placeItems: 'center',
          }}>
            <Icon name="resolution" size={16} color="white" />
          </div>
          <div>
            <div style={{ color: 'var(--white)', fontWeight: 700, fontSize: 14 }}>IT Support</div>
            <div style={{ color: 'var(--sidebar-muted)', fontSize: 11 }}>Agentic Desk</div>
          </div>
        </div>
      </div>

      <nav style={{ flex: 1, padding: '0 12px' }}>
        {NAV.map(item => {
          const active = screen === item.id
          return (
            <button key={item.id} onClick={() => setScreen(item.id)} style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 10,
              padding: '9px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
              background: active ? 'var(--sidebar-active)' : 'transparent',
              color: active ? 'var(--white)' : 'var(--sidebar-text)',
              fontSize: 13, fontWeight: active ? 600 : 400,
              marginBottom: 2, textAlign: 'left', transition: 'all 0.15s',
            }}
            onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'var(--sidebar-hover)' }}
            onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
            >
              <Icon name={item.icon} size={16} color={active ? 'var(--white)' : 'var(--sidebar-text)'} />
              {item.label}
            </button>
          )
        })}
      </nav>

      {recentTickets.length > 0 && (
        <div style={{ padding: '16px 20px 0', borderTop: '1px solid oklch(0.22 0.02 255)' }}>
          <div style={{ color: 'var(--sidebar-muted)', fontSize: 11, fontWeight: 600,
            letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>
            Recent
          </div>
          {recentTickets.slice(0, 3).map(t => (
            <div key={t.id} style={{ marginBottom: 8 }}>
              <div style={{ color: 'var(--sidebar-text)', fontSize: 12,
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {t.subject}
              </div>
              <Badge type="status" value={t.status} />
            </div>
          ))}
        </div>
      )}

      <div style={{ padding: '16px 20px 0', borderTop: '1px solid oklch(0.22 0.02 255)', marginTop: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 30, height: 30, borderRadius: '50%',
            background: 'var(--accent)', display: 'grid', placeItems: 'center',
            color: 'white', fontSize: 13, fontWeight: 700,
          }}>T</div>
          <div>
            <div style={{ color: 'var(--white)', fontSize: 13, fontWeight: 500 }}>Team 3</div>
            <div style={{ color: 'var(--sidebar-muted)', fontSize: 11 }}>SJSU — BUS4-118S</div>
          </div>
        </div>
      </div>
    </aside>
  )
}
