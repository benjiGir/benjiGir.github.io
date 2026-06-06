import { useState } from 'react'
import { projects, type Project } from '@/os/apps/data/projects'

function StackTag({ label }: { label: string }) {
  return (
    <span
      style={{
        padding: '2px 8px',
        borderRadius: 4,
        background: 'rgba(255,255,255,0.07)',
        border: '1px solid rgba(255,255,255,0.1)',
        fontSize: 10,
        color: 'rgba(255,255,255,0.6)',
        letterSpacing: 0.3,
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </span>
  )
}

function ProjectDetail({ project }: { project: Project }) {
  return (
    <div
      style={{
        flex: 1,
        padding: '24px 28px',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        overflowY: 'auto',
      }}
    >
      <div>
        <div
          style={{
            width: 36,
            height: 4,
            borderRadius: 2,
            background: project.color,
            marginBottom: 12,
          }}
        />
        <div style={{ fontSize: 18, fontWeight: 600, color: '#fff', marginBottom: 4 }}>
          {project.name}
        </div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', letterSpacing: 0.3 }}>
          {project.year}
        </div>
      </div>

      <p style={{ fontSize: 12, lineHeight: 1.7, color: 'rgba(255,255,255,0.65)', margin: 0 }}>
        {project.description}
      </p>

      <div>
        <div
          style={{
            fontSize: 10,
            letterSpacing: 2,
            color: 'rgba(255,255,255,0.3)',
            marginBottom: 8,
            textTransform: 'uppercase',
          }}
        >
          Stack
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {project.stack.map((s) => (
            <StackTag key={s} label={s} />
          ))}
        </div>
      </div>

      {project.links.length > 0 && (
        <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
          {project.links.map((link) => (
            <a
              key={link.label}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: '6px 14px',
                borderRadius: 6,
                background: project.color,
                color: '#fff',
                fontSize: 11,
                fontWeight: 600,
                textDecoration: 'none',
                letterSpacing: 0.3,
              }}
            >
              {link.label}
            </a>
          ))}
        </div>
      )}
    </div>
  )
}

function ProjectRow({
  project,
  selected,
  onClick,
}: {
  project: Project
  selected: boolean
  onClick: () => void
}) {
  return (
    <div
      onClick={onClick}
      style={{
        padding: '12px 16px',
        cursor: 'pointer',
        background: selected ? 'rgba(255,255,255,0.07)' : 'transparent',
        borderLeft: `3px solid ${selected ? project.color : 'transparent'}`,
        transition: 'background 0.1s',
      }}
    >
      <div style={{ fontSize: 12, fontWeight: 600, color: selected ? '#fff' : 'rgba(255,255,255,0.7)', marginBottom: 2 }}>
        {project.name}
      </div>
      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', letterSpacing: 0.2 }}>
        {project.tagline}
      </div>
    </div>
  )
}

export default function ProjectsApp() {
  const [selected, setSelected] = useState(projects[0])

  return (
    <div style={{ display: 'flex', height: '100%', background: '#0d1525' }}>
      {/* Sidebar */}
      <div
        style={{
          width: 220,
          flexShrink: 0,
          borderRight: '1px solid rgba(255,255,255,0.06)',
          overflowY: 'auto',
          paddingTop: 8,
        }}
      >
        <div
          style={{
            padding: '8px 16px 12px',
            fontSize: 10,
            letterSpacing: 2,
            color: 'rgba(255,255,255,0.25)',
            textTransform: 'uppercase',
          }}
        >
          Projets
        </div>
        {projects.map((p) => (
          <ProjectRow
            key={p.id}
            project={p}
            selected={selected.id === p.id}
            onClick={() => setSelected(p)}
          />
        ))}
      </div>

      {/* Detail */}
      <ProjectDetail project={selected} />
    </div>
  )
}
