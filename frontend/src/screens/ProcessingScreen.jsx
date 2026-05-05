import React, { useEffect, useState } from 'react'
import AgentStep from '../components/AgentStep'
import { submitTicket } from '../api'

const STEPS = [
  { label: 'Intake Agent',     description: 'Parsing issue and detecting intent' },
  { label: 'Knowledge Agent',  description: 'Searching Supabase knowledge base' },
  { label: 'Workflow Agent',   description: 'Applying resolution logic' },
  { label: 'Escalation Check', description: 'Evaluating confidence threshold' },
]

export default function ProcessingScreen({ ticket, onDone }) {
  const [statuses, setStatuses] = useState(['pending','pending','pending','pending'])

  useEffect(() => {
    async function run() {
      const delays = [0, 900, 1800, 2700]
      delays.forEach((d, i) => {
        setTimeout(() => {
          setStatuses(s => s.map((v, j) => j === i ? 'running' : v))
        }, d)
        setTimeout(() => {
          setStatuses(s => s.map((v, j) => j === i ? 'done' : v))
        }, d + 800)
      })
      const result = await submitTicket(ticket.description)
      setTimeout(() => onDone(result), 3600)
    }
    run()
  }, [])

  return (
    <div className="fade-up" style={{ padding: 32, maxWidth: 520 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700 }}>Processing Ticket</h1>
        <p style={{ color: 'var(--muted)', fontSize: 14, marginTop: 4 }}>
          Our agent pipeline is handling your request
        </p>
      </div>
      <div style={{ background: 'var(--white)', border: '1px solid var(--border)',
        borderRadius: 12, padding: '20px 24px', marginBottom: 24 }}>
        <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 4 }}>Your issue</div>
        <div style={{ fontSize: 14, fontWeight: 500 }}>{ticket.description}</div>
      </div>
      <div style={{ background: 'var(--white)', border: '1px solid var(--border)',
        borderRadius: 12, padding: '20px 24px' }}>
        {STEPS.map((step, i) => (
          <AgentStep key={step.label} label={step.label}
            description={step.description} status={statuses[i]} delay={i * 200} />
        ))}
      </div>
    </div>
  )
}
