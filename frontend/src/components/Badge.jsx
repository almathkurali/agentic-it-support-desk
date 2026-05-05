import React from 'react'

const STATUS = {
  resolved:  { bg: 'oklch(0.92 0.08 150)', color: 'oklch(0.38 0.14 150)', label: 'Resolved' },
  escalated: { bg: 'oklch(0.95 0.08 25)',  color: 'oklch(0.50 0.18 25)',  label: 'Escalated' },
  pending:   { bg: 'oklch(0.94 0.07 60)',  color: 'oklch(0.48 0.15 60)',  label: 'Pending' },
}

const PRIORITY = {
  high:   { bg: 'oklch(0.95 0.08 25)',  color: 'oklch(0.50 0.18 25)',  label: 'High' },
  medium: { bg: 'oklch(0.94 0.07 60)',  color: 'oklch(0.48 0.15 60)',  label: 'Medium' },
  low:    { bg: 'oklch(0.92 0.04 250)', color: 'oklch(0.45 0.10 250)', label: 'Low' },
}

export default function Badge({ type = 'status', value }) {
  const map = type === 'priority' ? PRIORITY : STATUS
  const style = map[value] || { bg: 'oklch(0.92 0.02 250)', color: 'oklch(0.45 0.05 250)', label: value }
  return (
    <span style={{
      background: style.bg, color: style.color,
      padding: '2px 10px', borderRadius: 999,
      fontSize: 12, fontWeight: 600, letterSpacing: '0.02em',
      display: 'inline-block',
    }}>
      {style.label}
    </span>
  )
}
