import { useEffect, useRef } from 'react'

interface Star {
  x: number
  y: number
  radius: number
  baseAlpha: number
  twinkleSpeed: number
  twinklePhase: number
  vx: number
  vy: number
  layer: number // 1: distant, 2: mid, 3: close
}

interface ShootingStar {
  x: number
  y: number
  length: number
  speed: number
  angle: number
  opacity: number
  active: boolean
}

export default function StarfieldBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number
    let width = 0
    let height = 0
    let dpr = window.devicePixelRatio || 1

    const handleResize = () => {
      if (!canvas) return
      dpr = window.devicePixelRatio || 1
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.scale(dpr, dpr)
    }

    handleResize()
    window.addEventListener('resize', handleResize)

    // Generate multi-depth star layers matching the Framer space video
    // Density tuned for high aesthetics
    const starCount = Math.floor((width * height) / 2200)
    const stars: Star[] = []

    // Base drift direction (smooth continuous motion towards upper-left diagonal)
    const driftAngle = (215 * Math.PI) / 180 // ~215 degrees
    const baseSpeed = 0.55 // lively and smooth velocity

    for (let i = 0; i < starCount; i++) {
      const depthRand = Math.random()
      let layer = 1
      let speedMult = 0.4
      let radius = Math.random() * 0.7 + 0.35

      if (depthRand > 0.88) {
        // Foreground close stars: larger, faster, soft glow
        layer = 3
        speedMult = 1.25
        radius = Math.random() * 0.9 + 1.2
      } else if (depthRand > 0.55) {
        // Midground stars
        layer = 2
        speedMult = 0.8
        radius = Math.random() * 0.6 + 0.8
      } else {
        // Distant background stars: small, subtle, slower
        layer = 1
        speedMult = 0.45
        radius = Math.random() * 0.5 + 0.3
      }

      const speed = baseSpeed * speedMult * (0.8 + Math.random() * 0.4)
      const starAngle = driftAngle + (Math.random() - 0.5) * 0.2 // subtle variation in angle

      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius,
        baseAlpha: Math.random() * 0.55 + 0.35,
        twinkleSpeed: Math.random() * 0.035 + 0.01,
        twinklePhase: Math.random() * Math.PI * 2,
        vx: Math.cos(starAngle) * speed,
        vy: Math.sin(starAngle) * speed,
        layer,
      })
    }

    // Occasional subtle shooting star
    const shootingStars: ShootingStar[] = []
    let nextShootingStarTime = Date.now() + 4000

    function spawnShootingStar() {
      shootingStars.push({
        x: Math.random() * (width * 0.8) + width * 0.2,
        y: Math.random() * (height * 0.4),
        length: Math.random() * 70 + 60,
        speed: Math.random() * 7 + 10,
        angle: (220 * Math.PI) / 180 + (Math.random() - 0.5) * 0.15,
        opacity: 0.9,
        active: true,
      })
    }

    let lastTime = performance.now()

    const render = (currentTime: number) => {
      const delta = Math.min((currentTime - lastTime) / 16.667, 2.5) // normalize to ~60fps
      lastTime = currentTime

      // Deep space black backdrop
      ctx.fillStyle = '#000002'
      ctx.fillRect(0, 0, width, height)

      // Subtle atmospheric deep indigo / obsidian gradient
      const radialGradient = ctx.createRadialGradient(
        width * 0.5,
        height * 0.4,
        80,
        width * 0.5,
        height * 0.5,
        Math.max(width, height) * 0.85
      )
      radialGradient.addColorStop(0, 'rgba(8, 11, 22, 0.4)')
      radialGradient.addColorStop(0.6, 'rgba(3, 4, 10, 0.2)')
      radialGradient.addColorStop(1, 'rgba(0, 0, 1, 0.85)')
      ctx.fillStyle = radialGradient
      ctx.fillRect(0, 0, width, height)

      const timeSec = currentTime * 0.001

      // Render shooting stars
      if (currentTime > nextShootingStarTime) {
        spawnShootingStar()
        nextShootingStarTime = currentTime + Math.random() * 6000 + 4000
      }

      for (let s = shootingStars.length - 1; s >= 0; s--) {
        const ss = shootingStars[s]
        if (!ss.active) continue

        ss.x += Math.cos(ss.angle) * ss.speed * delta
        ss.y += Math.sin(ss.angle) * ss.speed * delta
        ss.opacity -= 0.015 * delta

        if (ss.opacity <= 0 || ss.x < -100 || ss.y > height + 100) {
          shootingStars.splice(s, 1)
          continue
        }

        const tailX = ss.x - Math.cos(ss.angle) * ss.length
        const tailY = ss.y - Math.sin(ss.angle) * ss.length

        const grad = ctx.createLinearGradient(ss.x, ss.y, tailX, tailY)
        grad.addColorStop(0, `rgba(235, 240, 255, ${ss.opacity * 0.95})`)
        grad.addColorStop(0.3, `rgba(180, 200, 255, ${ss.opacity * 0.6})`)
        grad.addColorStop(1, 'rgba(180, 200, 255, 0)')

        ctx.beginPath()
        ctx.moveTo(ss.x, ss.y)
        ctx.lineTo(tailX, tailY)
        ctx.strokeStyle = grad
        ctx.lineWidth = 1.2
        ctx.stroke()
      }

      // Render and update starfield
      for (let i = 0; i < stars.length; i++) {
        const star = stars[i]

        // Smooth continuous movement
        star.x += star.vx * delta
        star.y += star.vy * delta

        // Wrap around boundaries smoothly
        if (star.x < -10) star.x = width + 10
        if (star.x > width + 10) star.x = -10
        if (star.y < -10) star.y = height + 10
        if (star.y > height + 10) star.y = -10

        // Smooth sinusoidal twinkling
        const twinkle = Math.sin(timeSec * star.twinkleSpeed * 120 + star.twinklePhase)
        const currentAlpha = Math.max(0.18, Math.min(0.98, star.baseAlpha + twinkle * 0.38))

        // Soft halo glow for larger stars (layer 3)
        if (star.layer === 3) {
          ctx.beginPath()
          ctx.arc(star.x, star.y, star.radius * 2.6, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(215, 228, 255, ${currentAlpha * 0.15})`
          ctx.fill()
        }

        // Star core
        ctx.beginPath()
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(238, 242, 255, ${currentAlpha})`
        ctx.fill()
      }

      animationFrameId = requestAnimationFrame(render)
    }

    animationFrameId = requestAnimationFrame(render)

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
        background: '#000002',
      }}
    />
  )
}
