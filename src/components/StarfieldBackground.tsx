import { useEffect, useRef } from 'react'

interface Star {
  x: number
  y: number
  radius: number
  baseAlpha: number
  alpha: number
  twinkleSpeed: number
  vx: number
  vy: number
}

export default function StarfieldBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number
    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)

    const handleResize = () => {
      if (!canvas) return
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
    }

    window.addEventListener('resize', handleResize)

    // Generate stars matching the Framer starry night video
    const starCount = Math.floor((width * height) / 3200) // Density calibrated to video
    const stars: Star[] = []

    for (let i = 0; i < starCount; i++) {
      const radius = Math.random() < 0.85 ? Math.random() * 0.9 + 0.3 : Math.random() * 1.5 + 1.0
      const baseAlpha = Math.random() * 0.7 + 0.3
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius,
        baseAlpha,
        alpha: baseAlpha,
        twinkleSpeed: Math.random() * 0.02 + 0.005,
        vx: (Math.random() - 0.5) * 0.08,
        vy: (Math.random() - 0.5) * 0.08,
      })
    }

    let time = 0

    const render = () => {
      time += 0.02
      ctx.fillStyle = '#020205'
      ctx.fillRect(0, 0, width, height)

      // Draw subtle cosmic dust / nebula center glow
      const radialGradient = ctx.createRadialGradient(
        width * 0.5,
        height * 0.45,
        50,
        width * 0.5,
        height * 0.5,
        Math.max(width, height) * 0.75
      )
      radialGradient.addColorStop(0, 'rgba(15, 18, 30, 0.45)')
      radialGradient.addColorStop(0.5, 'rgba(6, 8, 16, 0.25)')
      radialGradient.addColorStop(1, 'rgba(1, 2, 4, 0.9)')
      ctx.fillStyle = radialGradient
      ctx.fillRect(0, 0, width, height)

      // Draw and update stars
      for (let i = 0; i < stars.length; i++) {
        const star = stars[i]

        // Move star slowly
        star.x += star.vx
        star.y += star.vy

        // Wrap around borders
        if (star.x < 0) star.x = width
        if (star.x > width) star.x = 0
        if (star.y < 0) star.y = height
        if (star.y > height) star.y = 0

        // Twinkle sinusoidal oscillation
        const twinkle = Math.sin(time * star.twinkleSpeed * 60 + i)
        const currentAlpha = Math.max(0.15, Math.min(1, star.baseAlpha + twinkle * 0.35))

        ctx.beginPath()
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(240, 244, 255, ${currentAlpha})`
        ctx.fill()

        // Soft glow for larger stars
        if (star.radius > 1.2) {
          ctx.beginPath()
          ctx.arc(star.x, star.y, star.radius * 2.2, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(225, 235, 255, ${currentAlpha * 0.18})`
          ctx.fill()
        }
      }

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{
        width: '100vw',
        height: '100vh',
        background: '#020205',
      }}
    />
  )
}
