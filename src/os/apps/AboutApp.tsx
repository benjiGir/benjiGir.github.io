const SKILLS = [
  { category: 'Frontend', items: ['React', 'Tanstack'] },
  { category: 'Backend', items: ['NestJS', 'PostgreSQL'] },
  { category: 'Outils', items: ['Docker'] },
]

const EXPERIENCE = [
  {
    role: 'Développeur backend',
    company: 'Komity',
    period: "Septembre 2022 – aujourd'hui",
    description: '',
  },
  {
    role: 'Developpeur backend',
    company: 'Implicity',
    period: 'Fevrier 2022 – Septembre 2022',
    description: '',
  },
  {
    role: 'Technicien intégration mécatronique',
    company: 'Softbank robotics Europe',
    period: '2018 – 2021',
    description: '',
  },
]

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div
        style={{
          fontSize: 10,
          letterSpacing: 2,
          color: 'rgba(255,255,255,0.28)',
          textTransform: 'uppercase',
          marginBottom: 14,
          paddingBottom: 8,
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        {title}
      </div>
      {children}
    </div>
  )
}

export default function AboutApp() {
  return (
    <div
      style={{
        height: '100%',
        background: '#0d1525',
        overflowY: 'auto',
        padding: '28px 32px',
        boxSizing: 'border-box',
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: '#fff', marginBottom: 4 }}>
          Benjamin G.
        </div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', letterSpacing: 0.3 }}>
          Developpeur backend confirmé
        </div>
        <p
          style={{
            marginTop: 14,
            fontSize: 12,
            lineHeight: 1.75,
            color: 'rgba(255,255,255,0.55)',
            maxWidth: 420,
          }}
        >
          TODO — Quelques phrases de présentation : qui tu es, ce que tu fais, ce qui te passionne.
        </p>
      </div>

      {/* Skills */}
      <Section title="Compétences">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {SKILLS.map((group) => (
            <div
              key={group.category}
              style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}
            >
              <div
                style={{
                  width: 72,
                  flexShrink: 0,
                  fontSize: 10,
                  color: 'rgba(255,255,255,0.3)',
                  paddingTop: 3,
                }}
              >
                {group.category}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {group.items.map((item) => (
                  <span
                    key={item}
                    style={{
                      padding: '2px 8px',
                      borderRadius: 4,
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.09)',
                      fontSize: 11,
                      color: 'rgba(255,255,255,0.65)',
                    }}
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Experience */}
      <Section title="Expérience">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {EXPERIENCE.map((exp, i) => (
            <div key={i}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  marginBottom: 3,
                }}
              >
                <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>
                  {exp.role}
                </div>
                <div
                  style={{
                    fontSize: 10,
                    color: 'rgba(255,255,255,0.25)',
                    whiteSpace: 'nowrap',
                    marginLeft: 12,
                  }}
                >
                  {exp.period}
                </div>
              </div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginBottom: 6 }}>
                {exp.company}
              </div>
              <div style={{ fontSize: 11, lineHeight: 1.65, color: 'rgba(255,255,255,0.45)' }}>
                {exp.description}
              </div>
            </div>
          ))}
        </div>
      </Section>
    </div>
  )
}
