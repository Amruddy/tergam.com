import React from 'react'

export function Logo({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background circle */}
      <circle cx="50" cy="50" r="48" fill="#004D00" />

      {/* === CUBE BASE (isometric) === */}
      {/* Top face */}
      <polygon points="50,54 26,67 50,80 74,67" fill="#66CC66" />
      {/* Left face */}
      <polygon points="26,67 26,80 50,93 50,80" fill="#33A033" />
      {/* Right face */}
      <polygon points="74,67 74,80 50,93 50,80" fill="#1A5C1A" />

      {/* Celtic knot pattern on left face — simplified */}
      <rect x="29" y="72" width="4" height="4" rx="0.5" fill="#99FF99" opacity="0.35" />
      <rect x="35" y="75" width="4" height="4" rx="0.5" fill="#99FF99" opacity="0.35" />
      <rect x="41" y="78" width="4" height="4" rx="0.5" fill="#99FF99" opacity="0.35" />
      {/* Celtic knot pattern on right face */}
      <rect x="57" y="78" width="4" height="4" rx="0.5" fill="#99FF99" opacity="0.2" />
      <rect x="63" y="75" width="4" height="4" rx="0.5" fill="#99FF99" opacity="0.2" />
      <rect x="69" y="72" width="4" height="4" rx="0.5" fill="#99FF99" opacity="0.2" />

      {/* === OBELISK TOWER === */}
      {/* Left face of tower */}
      <polygon points="50,10 42,54 50,58" fill="#66CC66" />
      {/* Right face of tower (shadow) */}
      <polygon points="50,10 50,58 58,54" fill="#1A5C1A" />
      {/* Tower tip highlight */}
      <polygon points="50,10 47,18 50,20 53,18" fill="#99FF99" />

      {/* Window left face */}
      <rect x="44" y="36" width="5" height="6" rx="1" fill="#004D00" opacity="0.7" />
      {/* Window right face */}
      <rect x="51" y="36" width="5" height="6" rx="1" fill="#002800" opacity="0.8" />
      {/* Small window near top */}
      <rect x="47" y="22" width="3" height="4" rx="0.5" fill="#002800" opacity="0.7" />

      {/* === GOLD COINS (left side) === */}
      <ellipse cx="30" cy="66" rx="6" ry="2.8" fill="#FFD700" />
      <rect x="24" y="62" width="12" height="4" fill="#FFD700" />
      <ellipse cx="30" cy="62" rx="6" ry="2.8" fill="#FFC200" />
      <rect x="24" y="58.5" width="12" height="3.5" fill="#FFC200" />
      <ellipse cx="30" cy="58.5" rx="6" ry="2.8" fill="#FFD700" />
      {/* Coin symbol */}
      <text x="30" y="62.5" fontSize="5" textAnchor="middle" fill="#B8860B" fontWeight="bold">₽</text>

      {/* === KEY (right side) === */}
      <circle cx="71" cy="60" r="4" stroke="#FFD700" strokeWidth="2" fill="none" />
      <line x1="68.2" y1="63.2" x2="62" y2="69.5" stroke="#FFD700" strokeWidth="2" strokeLinecap="round" />
      <line x1="62" y1="69.5" x2="60" y2="67.5" stroke="#FFD700" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="63" y1="71.5" x2="61" y2="69.5" stroke="#FFD700" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}
