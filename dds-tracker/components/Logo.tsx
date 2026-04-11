import React from 'react'

export function Logo({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Base Cube - Isometric (Malachite Base) */}
      <path d="M50 85 L20 70 L50 55 L80 70 Z" fill="#99FF99" />
      <path d="M20 70 L20 85 L50 100 L50 85 Z" fill="#66CC66" />
      <path d="M80 70 L80 85 L50 100 L50 85 Z" fill="#004D00" />
      
      {/* Pattern details - Simplified Chechen Knots on the front faces */}
      <path d="M28 76 L36 80 L36 84 L28 80 Z" fill="#ffffff" opacity="0.3"/>
      <path d="M42 83 L46 85 L46 89 L42 87 Z" fill="#ffffff" opacity="0.3"/>
      <path d="M72 76 L64 80 L64 84 L72 80 Z" fill="#ffffff" opacity="0.3"/>
      <path d="M58 83 L54 85 L54 89 L58 87 Z" fill="#ffffff" opacity="0.3"/>

      {/* Central element: Stylized Chechen tower */}
      {/* Left visible face of tower */}
      <path d="M50 15 L38 52 L50 63 Z" fill="#66CC66" />
      {/* Right visible face of tower */}
      <path d="M50 15 L50 63 L62 52 Z" fill="#1A4A1A" opacity="0.8"/>
      
      {/* Windows on tower */}
      <path d="M45 40 L48 41 L48 45 L45 44 Z" fill="#1A1A1A" />
      <path d="M52 41 L55 40 L55 44 L52 45 Z" fill="#1A1A1A" />
      <path d="M48 25 L50 26 L50 29 L48 28 Z" fill="#1A1A1A" />
      <path d="M50 26 L52 25 L52 28 L50 29 Z" fill="#1A1A1A" />

      {/* Details: Stack of 3 Gold Coins on the left */}
      <ellipse cx="32" cy="62" rx="7" ry="3.5" fill="#FFD700" stroke="#B8860B" strokeWidth="0.5"/>
      <ellipse cx="32" cy="59" rx="7" ry="3.5" fill="#FFD700" stroke="#B8860B" strokeWidth="0.5"/>
      <ellipse cx="32" cy="56" rx="7" ry="3.5" fill="#FFD700" stroke="#B8860B" strokeWidth="0.5"/>

      {/* Details: Key on the right */}
      <circle cx="70" cy="54" r="3.5" stroke="#FFD700" strokeWidth="1.5" fill="none"/>
      <path d="M67 56 L61 63 L59 61 L61 63 L63 65 L65 63" stroke="#FFD700" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}
