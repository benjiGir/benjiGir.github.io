import { useEffect, useState } from 'react'

export default function Clock() {
  const [time, setTime] = useState(() => new Date())

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  return (
    <div
      style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', textAlign: 'right', lineHeight: 1.3 }}
    >
      <div>{time.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</div>
      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>
        {time.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
      </div>
    </div>
  )
}
