export default function AppIcon({
  icon,
  label,
  bg,
  size = 44,
}: {
  icon?: string
  label: string
  bg: string
  size?: number
}) {
  if (icon) {
    return (
      <img
        src={icon}
        alt=""
        draggable={false}
        style={{
          width: size,
          height: size,
          objectFit: 'contain',
          filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.4))',
        }}
      />
    )
  }

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 12,
        background: bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 11,
        fontWeight: 700,
        color: '#fff',
        letterSpacing: 0.5,
        boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
      }}
    >
      {label.slice(0, 2).toUpperCase()}
    </div>
  )
}
