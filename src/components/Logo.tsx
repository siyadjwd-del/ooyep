export function Logo({ size = 34, light = false }: { size?: number; light?: boolean }) {
  const navy = light ? '#ffffff' : '#0b2545'
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
      <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
        <rect width="64" height="64" rx="14" fill={light ? 'rgba(255,255,255,0.12)' : '#0b2545'} />
        <path
          d="M16 40c4 4 9 6 14 6 7 0 12-3 12-8 0-10-22-6-22-15 0-4 4-7 10-7 4 0 8 1 11 4"
          fill="none"
          stroke="#c9a227"
          strokeWidth="4.5"
          strokeLinecap="round"
        />
      </svg>
      <span style={{ lineHeight: 1 }}>
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: size * 0.62,
            fontWeight: 600,
            color: navy,
            letterSpacing: '-0.02em',
          }}
        >
          Sit Invest
        </span>
      </span>
    </span>
  )
}
