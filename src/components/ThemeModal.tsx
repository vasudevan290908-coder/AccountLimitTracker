import { useState } from 'react'
import { X, Check, RotateCcw, Palette } from 'lucide-react'
import type { UserThemeConfig } from '../types/theme'
import { THEME_PRESETS } from '../types/theme'

interface ThemeModalProps {
  currentTheme: UserThemeConfig
  onSelectTheme: (theme: UserThemeConfig) => void
  onClose: () => void
}

export default function ThemeModal({
  currentTheme,
  onSelectTheme,
  onClose,
}: ThemeModalProps) {
  const [activeTheme, setActiveTheme] = useState<UserThemeConfig>(currentTheme)

  function handlePresetClick(preset: UserThemeConfig) {
    setActiveTheme(preset)
    onSelectTheme(preset)
  }

  function handleColorChange(key: keyof UserThemeConfig, value: string) {
    const updated = { ...activeTheme, [key]: value }
    setActiveTheme(updated)
    onSelectTheme(updated)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
      <div
        className="w-full max-w-lg rounded-2xl p-5 sm:p-6 text-slate-100 shadow-2xl relative border"
        style={{
          background: 'rgba(18, 16, 28, 0.92)',
          backdropFilter: 'blur(40px)',
          borderColor: 'rgba(255, 255, 255, 0.15)',
          fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', sans-serif",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Choose Your Color Theme</h2>
              <p className="text-xs text-white/50">Pick a sleek dark preset or customize any color</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/50 hover:text-white bg-white/5 hover:bg-white/10 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Preset Selector */}
        <div className="mb-5">
          <label className="text-xs font-semibold uppercase tracking-wider text-white/60 mb-2 block">
            Dark Mode Presets
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {THEME_PRESETS.map((preset) => {
              const isSelected = activeTheme.id === preset.id
              return (
                <button
                  key={preset.id}
                  onClick={() => handlePresetClick(preset)}
                  className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'border-emerald-500/80 bg-emerald-500/10 text-white ring-1 ring-emerald-500/50'
                      : 'border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-4 h-4 rounded-full border border-white/20"
                      style={{ background: preset.availableTextColor }}
                    />
                    <span className="text-xs font-medium">{preset.name}</span>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-emerald-400" />}
                </button>
              )
            })}
          </div>
        </div>

        {/* Custom Color Fine-Tuning */}
        <div className="mb-5 pt-3 border-t border-white/10">
          <label className="text-xs font-semibold uppercase tracking-wider text-white/60 mb-2.5 block">
            Fine-Tune Colors
          </label>

          <div className="grid grid-cols-2 gap-3 text-xs">
            {/* Header Text */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/10">
              <span className="text-white/80">Header Text</span>
              <input
                type="color"
                value={activeTheme.headerTextColor.startsWith('#') ? activeTheme.headerTextColor : '#ffffff'}
                onChange={(e) => handleColorChange('headerTextColor', e.target.value)}
                className="w-7 h-7 rounded cursor-pointer bg-transparent border-0"
              />
            </div>

            {/* Email Text */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/10">
              <span className="text-white/80">Email Text</span>
              <input
                type="color"
                value={activeTheme.emailTextColor.startsWith('#') ? activeTheme.emailTextColor : '#fef08a'}
                onChange={(e) => handleColorChange('emailTextColor', e.target.value)}
                className="w-7 h-7 rounded cursor-pointer bg-transparent border-0"
              />
            </div>

            {/* Available Indicator */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/10">
              <span className="text-white/80">Available Color</span>
              <input
                type="color"
                value={activeTheme.availableTextColor.startsWith('#') ? activeTheme.availableTextColor : '#34d399'}
                onChange={(e) => handleColorChange('availableTextColor', e.target.value)}
                className="w-7 h-7 rounded cursor-pointer bg-transparent border-0"
              />
            </div>

            {/* Limited Indicator */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/10">
              <span className="text-white/80">Limited Color</span>
              <input
                type="color"
                value={activeTheme.limitedTextColor.startsWith('#') ? activeTheme.limitedTextColor : '#fbbf24'}
                onChange={(e) => handleColorChange('limitedTextColor', e.target.value)}
                className="w-7 h-7 rounded cursor-pointer bg-transparent border-0"
              />
            </div>

            {/* Countdown Color */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/10 col-span-2">
              <span className="text-white/80">Real-Time Countdown Ticker</span>
              <input
                type="color"
                value={activeTheme.countdownTextColor.startsWith('#') ? activeTheme.countdownTextColor : '#fef08a'}
                onChange={(e) => handleColorChange('countdownTextColor', e.target.value)}
                className="w-7 h-7 rounded cursor-pointer bg-transparent border-0"
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-white/10">
          <button
            onClick={() => handlePresetClick(THEME_PRESETS[0])}
            className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset to Default Dark
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all shadow-lg"
          >
            Save & Close
          </button>
        </div>
      </div>
    </div>
  )
}
