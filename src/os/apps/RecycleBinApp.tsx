const DELETED_FILES = [
  { name: 'motivation_lundi_matin.exe', date: '06/01/2024', size: '0 Ko' },
  { name: 'excuses_pour_le_retard.docx', date: '14/02/2024', size: '12 Ko' },
  { name: 'idee_de_genie_3h_du_matin.txt', date: '22/03/2024', size: '1 Ko' },
  { name: 'CV_version_finale_finale_v2.pdf', date: '02/04/2024', size: '248 Ko' },
  { name: 'bugs_que_je_refuse_de_voir.log', date: '17/05/2024', size: '∞' },
  { name: 'todo_list_jamais_terminee.md', date: '30/05/2024', size: '4 Ko' },
]

function IconTrash() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18" />
      <path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" />
      <path d="M19 6l-1 14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1L5 6" />
    </svg>
  )
}

export default function RecycleBinApp() {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#0d1525' }}>
      <div
        style={{
          padding: '12px 16px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          flexShrink: 0,
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>
          Corbeille
        </div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>
          {DELETED_FILES.length} éléments — supprimés mais jamais oubliés
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '6px 8px' }}>
        {DELETED_FILES.map((file) => (
          <div
            key={file.name}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '9px 10px',
              borderRadius: 6,
              opacity: 0.7,
            }}
          >
            <IconTrash />
            <span
              style={{
                flex: 1,
                fontSize: 12,
                color: 'rgba(255,255,255,0.6)',
                textDecoration: 'line-through',
                textDecorationColor: 'rgba(255,255,255,0.25)',
              }}
            >
              {file.name}
            </span>
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', whiteSpace: 'nowrap' }}>
              {file.date}
            </span>
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', width: 48, textAlign: 'right' }}>
              {file.size}
            </span>
          </div>
        ))}
      </div>

      <div
        style={{
          padding: '10px 16px',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          fontSize: 10,
          color: 'rgba(255,255,255,0.25)',
          textAlign: 'center',
          letterSpacing: 0.3,
          flexShrink: 0,
        }}
      >
        La restauration n'est pas implémentée. Et c'est probablement mieux ainsi.
      </div>
    </div>
  )
}
