/** Wrapped-inspired decorative SVG shapes */

export function Starburst({ color = '#8B5CF6', size = 80, opacity = 0.5, className = '' }) {
  return (
    <svg
      width={size} height={size}
      viewBox="0 0 100 100"
      className={`pointer-events-none select-none ${className}`}
      style={{ opacity }}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id={`sg-${color.replace('#','')}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={color} stopOpacity="1" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* 8-point star */}
      <polygon
        points="50,5 54,38 80,20 62,46 95,50 62,54 80,80 54,62 50,95 46,62 20,80 38,54 5,50 38,46 20,20 46,38"
        fill={color}
      />
    </svg>
  )
}

export function StarSmall({ color = '#F59E0B', size = 14, className = '' }) {
  return (
    <svg
      width={size} height={size}
      viewBox="0 0 24 24"
      className={`pointer-events-none select-none ${className}`}
      aria-hidden="true"
    >
      <polygon
        points="12,2 13.5,9.5 21,12 13.5,14.5 12,22 10.5,14.5 3,12 10.5,9.5"
        fill={color}
      />
    </svg>
  )
}

export function Zigzag({ color = '#EC4899', width = 120, opacity = 0.4, className = '' }) {
  const h = 20
  const step = 20
  const points = Array.from({ length: Math.floor(width / step) + 1 }, (_, i) => {
    const x = i * step
    const y = i % 2 === 0 ? 2 : h - 2
    return `${x},${y}`
  }).join(' ')

  return (
    <svg
      width={width} height={h}
      className={`pointer-events-none select-none ${className}`}
      style={{ opacity }}
      aria-hidden="true"
    >
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function Splash({ color = '#EC4899', size = 100, opacity = 0.35, className = '' }) {
  return (
    <svg
      width={size} height={size}
      viewBox="0 0 100 100"
      className={`pointer-events-none select-none ${className}`}
      style={{ opacity }}
      aria-hidden="true"
    >
      <path
        d="M50,10 C60,5 75,15 80,28 C90,25 98,35 92,46 C100,52 98,65 88,68 C92,80 83,90 72,88 C68,98 55,100 48,93 C40,100 28,96 26,85 C14,88 6,78 10,67 C2,60 3,47 12,43 C7,32 15,20 26,20 C30,10 42,6 50,10Z"
        fill={color}
      />
    </svg>
  )
}

export function GlowDot({ color = '#F59E0B', size = 8, className = '' }) {
  return (
    <span
      className={`inline-block rounded-full flex-shrink-0 ${className}`}
      style={{
        width: size,
        height: size,
        background: color,
        boxShadow: `0 0 ${size * 2}px ${color}`,
      }}
      aria-hidden="true"
    />
  )
}
