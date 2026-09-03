export interface UserThemeConfig {
  id: string
  name: string
  bgGradient: string
  tableBg: string
  headerBg: string
  headerTextColor: string
  emailBg: string
  emailTextColor: string
  availableBg: string
  availableTextColor: string
  limitedBg: string
  limitedTextColor: string
  countdownTextColor: string
}

export const THEME_PRESETS: UserThemeConfig[] = [
  {
    id: 'obsidian-dark',
    name: 'Obsidian Dark (Recommended)',
    bgGradient: 'radial-gradient(circle at 50% 10%, #181824 0%, #0c0d14 50%, #050508 100%)',
    tableBg: 'rgba(13, 14, 22, 0.75)',
    headerBg: 'linear-gradient(135deg, rgba(220, 38, 38, 0.45), rgba(185, 28, 28, 0.35))',
    headerTextColor: '#ffffff',
    emailBg: 'rgba(251, 191, 36, 0.08)',
    emailTextColor: '#fef08a',
    availableBg: 'linear-gradient(135deg, rgba(16, 185, 129, 0.22), rgba(5, 150, 105, 0.12))',
    availableTextColor: '#34d399',
    limitedBg: 'linear-gradient(135deg, rgba(245, 158, 11, 0.20), rgba(217, 119, 6, 0.10))',
    limitedTextColor: '#fbbf24',
    countdownTextColor: '#fef08a',
  },
  {
    id: 'pure-oled',
    name: 'Pure OLED Stealth Black',
    bgGradient: 'radial-gradient(circle at 50% 10%, #111111 0%, #050505 50%, #000000 100%)',
    tableBg: 'rgba(5, 5, 5, 0.90)',
    headerBg: 'linear-gradient(135deg, rgba(239, 68, 68, 0.35), rgba(153, 27, 27, 0.25))',
    headerTextColor: '#ffffff',
    emailBg: 'rgba(255, 255, 255, 0.04)',
    emailTextColor: '#e2e8f0',
    availableBg: 'rgba(16, 185, 129, 0.18)',
    availableTextColor: '#10b981',
    limitedBg: 'rgba(245, 158, 11, 0.16)',
    limitedTextColor: '#f59e0b',
    countdownTextColor: '#38bdf8',
  },
  {
    id: 'golden-gate-dusk',
    name: 'Golden Gate Sunset Dusk',
    bgGradient: 'radial-gradient(circle at 50% 10%, #2a1538 0%, #160d26 40%, #0c0b17 80%, #05050d 100%)',
    tableBg: 'rgba(18, 16, 28, 0.55)',
    headerBg: 'linear-gradient(135deg, rgba(244, 63, 94, 0.35), rgba(225, 29, 72, 0.25))',
    headerTextColor: '#ffffff',
    emailBg: 'rgba(251, 191, 36, 0.08)',
    emailTextColor: '#fef3c7',
    availableBg: 'linear-gradient(135deg, rgba(16, 185, 129, 0.20), rgba(5, 150, 105, 0.12))',
    availableTextColor: '#34d399',
    limitedBg: 'linear-gradient(135deg, rgba(245, 158, 11, 0.18), rgba(217, 119, 6, 0.10))',
    limitedTextColor: '#fde68a',
    countdownTextColor: '#fef08a',
  },
  {
    id: 'midnight-navy',
    name: 'Midnight Pacific Navy',
    bgGradient: 'radial-gradient(circle at 50% 10%, #0f172a 0%, #090e1a 50%, #020617 100%)',
    tableBg: 'rgba(15, 23, 42, 0.70)',
    headerBg: 'linear-gradient(135deg, rgba(59, 130, 246, 0.35), rgba(29, 78, 216, 0.25))',
    headerTextColor: '#ffffff',
    emailBg: 'rgba(56, 189, 248, 0.08)',
    emailTextColor: '#bae6fd',
    availableBg: 'linear-gradient(135deg, rgba(52, 211, 153, 0.20), rgba(16, 185, 129, 0.12))',
    availableTextColor: '#6ee7b7',
    limitedBg: 'linear-gradient(135deg, rgba(251, 146, 60, 0.18), rgba(234, 88, 12, 0.10))',
    limitedTextColor: '#fed7aa',
    countdownTextColor: '#38bdf8',
  },
]
