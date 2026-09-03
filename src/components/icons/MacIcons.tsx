import React from 'react'

interface IconProps {
  size?: number
  className?: string
  style?: React.CSSProperties
}

/** ── Apple Logo SVG ── */
export function AppleLogoIcon({ size = 16, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 170 170" fill="currentColor" className={className} style={style}>
      <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.04-7.69-7.85-12-14.43-6-9.12-10.74-19.45-14.23-31-3.48-11.54-5.23-22.61-5.23-33.2 0-14.77 3.8-27.15 11.41-37.15 7.61-10 17.38-15.11 29.31-15.34 4.58 0 9.8 1.19 15.65 3.57 5.86 2.39 9.53 3.65 11.02 3.79 1.85-.27 5.76-1.63 11.72-4.08 5.97-2.45 11.03-3.56 15.18-3.34 11.52.65 20.89 4.79 28.11 12.4 2.83 2.94 5.34 6.2 7.52 9.79-10.45 6.31-15.63 15.01-15.53 26.11.11 8.81 3.59 16.21 10.45 22.2 4.47 3.91 9.57 6.64 15.3 8.16-2.28 6.63-4.88 12.97-7.8 19.01zM119.22 33.15c0-7.39 2.62-14.15 7.85-20.27 5.23-6.13 11.66-9.98 19.3-11.55.11 1.09.16 2.07.16 2.94 0 7.39-2.73 14.37-8.19 20.93-5.46 6.56-12.04 10.37-19.74 11.43-.32-1.08-.48-2.24-.48-3.48z" />
    </svg>
  )
}

/** ── Golden Gate Bridge Badge SVG ── */
export function GoldenGateBadgeIcon({ size = 22, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className} style={style}>
      <defs>
        <linearGradient id="gg-bg" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ff7e40" />
          <stop offset="50%" stopColor="#ea384d" />
          <stop offset="100%" stopColor="#7a08fa" />
        </linearGradient>
        <linearGradient id="gg-tower" x1="0" y1="0" x2="0" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#ffe4dc" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="8" fill="url(#gg-bg)" />
      {/* Golden Gate Cable Arcs */}
      <path d="M2 12 Q 10 22, 16 13 Q 22 22, 30 12" stroke="rgba(255,255,255,0.75)" strokeWidth="1.2" fill="none" />
      {/* Tower 1 */}
      <path d="M9 7 L11 7 L12 26 L8 26 Z" fill="url(#gg-tower)" opacity="0.95" />
      <line x1="9" y1="12" x2="11" y2="12" stroke="#ea384d" strokeWidth="0.8" />
      <line x1="9" y1="17" x2="11" y2="17" stroke="#ea384d" strokeWidth="0.8" />
      {/* Tower 2 */}
      <path d="M21 7 L23 7 L24 26 L20 26 Z" fill="url(#gg-tower)" opacity="0.95" />
      <line x1="21" y1="12" x2="23" y2="12" stroke="#ea384d" strokeWidth="0.8" />
      <line x1="21" y1="17" x2="23" y2="17" stroke="#ea384d" strokeWidth="0.8" />
      {/* Road Deck */}
      <rect x="2" y="21" width="28" height="2" rx="1" fill="#ffffff" />
    </svg>
  )
}

/** ── Add / Plus — Emerald Green Squircle ── */
export function MacAddIcon({ size = 18, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className} style={style}>
      <defs>
        <linearGradient id="mac-add-g" x1="0" y1="0" x2="20" y2="20" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
        <linearGradient id="mac-add-shine" x1="0" y1="0" x2="0" y2="10">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width="20" height="20" rx="6" fill="url(#mac-add-g)" />
      <rect width="20" height="10" rx="6" fill="url(#mac-add-shine)" />
      <path d="M10 5.5V14.5M5.5 10H14.5" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  )
}

/** ── Edit / Pencil — Azure Blue Squircle ── */
export function MacEditIcon({ size = 16, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className} style={style}>
      <defs>
        <linearGradient id="mac-edit-g" x1="0" y1="0" x2="20" y2="20" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="100%" stopColor="#2563eb" />
        </linearGradient>
        <linearGradient id="mac-edit-shine" x1="0" y1="0" x2="0" y2="10">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width="20" height="20" rx="5.5" fill="url(#mac-edit-g)" />
      <rect width="20" height="10" rx="5.5" fill="url(#mac-edit-shine)" />
      <path d="M13.2 5.3a1.2 1.2 0 0 1 1.7 1.7L8.2 13.7 5.8 14.4l.7-2.4 6.7-6.7z" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  )
}

/** ── Reset / Refresh — Golden Gate Crimson Squircle ── */
export function MacResetIcon({ size = 16, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className} style={style}>
      <defs>
        <linearGradient id="mac-res-g" x1="0" y1="0" x2="20" y2="20" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fb7185" />
          <stop offset="100%" stopColor="#e11d48" />
        </linearGradient>
        <linearGradient id="mac-res-shine" x1="0" y1="0" x2="0" y2="10">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width="20" height="20" rx="5.5" fill="url(#mac-res-g)" />
      <rect width="20" height="10" rx="5.5" fill="url(#mac-res-shine)" />
      <path d="M6 10a4 4 0 0 1 6.9-2.8L14 8.5" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" fill="none" />
      <path d="M14 10a4 4 0 0 1-6.9 2.8L6 11.5" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" fill="none" />
      <path d="M12.5 6.5l1.5 2-2 .5" stroke="#ffffff" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M7.5 13.5L6 11.5l2-.5" stroke="#ffffff" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  )
}

/** ── Settings / Gear — Titanium Slate Squircle ── */
export function MacSettingsIcon({ size = 16, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className} style={style}>
      <defs>
        <linearGradient id="mac-set-g" x1="0" y1="0" x2="20" y2="20" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#94a3b8" />
          <stop offset="100%" stopColor="#334155" />
        </linearGradient>
        <linearGradient id="mac-set-shine" x1="0" y1="0" x2="0" y2="10">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.30" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width="20" height="20" rx="5.5" fill="url(#mac-set-g)" />
      <rect width="20" height="10" rx="5.5" fill="url(#mac-set-shine)" />
      <circle cx="10" cy="10" r="2.2" stroke="#ffffff" strokeWidth="1.5" fill="none" />
      <path d="M10 5.2v1.2M10 13.6v1.2M5.2 10h1.2M13.6 10h1.2M6.8 6.8l.9.9M12.3 12.3l.9.9M13.2 6.8l-.9.9M7.7 12.3l-.9.9" stroke="#ffffff" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

/** ── Wifi Live — Cyan Squircle ── */
export function MacWifiIcon({ size = 15, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className} style={style}>
      <defs>
        <linearGradient id="mac-wifi-g" x1="0" y1="0" x2="20" y2="20" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#0891b2" />
        </linearGradient>
      </defs>
      <rect width="20" height="20" rx="5.5" fill="url(#mac-wifi-g)" />
      <path d="M5 9a7 7 0 0 1 10 0" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path d="M7 11.2a4.2 4.2 0 0 1 6 0" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <circle cx="10" cy="14" r="1.1" fill="#ffffff" />
    </svg>
  )
}

/** ── Wifi Offline — Amber Squircle ── */
export function MacWifiOffIcon({ size = 15, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className} style={style}>
      <defs>
        <linearGradient id="mac-woff-g" x1="0" y1="0" x2="20" y2="20" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
      </defs>
      <rect width="20" height="20" rx="5.5" fill="url(#mac-woff-g)" />
      <circle cx="10" cy="14" r="1.1" fill="#ffffff" />
      <path d="M7 11.2a4.2 4.2 0 0 1 6 0" stroke="#ffffff" strokeWidth="1.4" strokeLinecap="round" fill="none" strokeDasharray="2 2" />
      <path d="M6 6.5L14 14.5" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

/** ── Clock / Local Mode — Violet Squircle ── */
export function MacClockIcon({ size = 15, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className} style={style}>
      <defs>
        <linearGradient id="mac-clk-g" x1="0" y1="0" x2="20" y2="20" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#7e22ce" />
        </linearGradient>
      </defs>
      <rect width="20" height="20" rx="5.5" fill="url(#mac-clk-g)" />
      <circle cx="10" cy="10" r="4.5" stroke="#ffffff" strokeWidth="1.4" fill="none" />
      <path d="M10 7.5V10l1.8 1.8" stroke="#ffffff" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
