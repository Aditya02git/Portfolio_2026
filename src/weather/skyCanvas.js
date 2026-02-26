import { createRainDrops, createSnowFlakes } from './particles.js'

const rainDrops  = createRainDrops(220)
const snowFlakes = createSnowFlakes(180)

const stormClouds = [
  { x: 0.12, y: 0.12, r: 0.14 },
  { x: 0.39, y: 0.08, r: 0.18 },
  { x: 0.70, y: 0.11, r: 0.15 },
  { x: 0.92, y: 0.16, r: 0.12 },
  { x: 0.25, y: 0.20, r: 0.13 },
  { x: 0.59, y: 0.18, r: 0.16 },
]

// ── Lightning flash state ─────────────────────────────────────────────────────
// Tracks whether we were in a flash last frame so we only fire the event
// on the rising edge (first frame the flash becomes active), not every frame.
// Separate trackers for rainy and cloudy so they don't interfere.
let _wasFlashingRainy  = false
let _wasFlashingCloudy = false

export function createSkyCanvas() {
  const canvas = document.createElement('canvas')
  canvas.width  = window.innerWidth
  canvas.height = window.innerHeight
  return canvas
}

function drawStormClouds(ctx, W, H, alpha = 0.85) {
  stormClouds.forEach(({ x, y, r }) => {
    const cx = x * W, cy = y * H, cr = r * W
    const cg = ctx.createRadialGradient(cx, cy, cr * 0.1, cx, cy, cr)
    cg.addColorStop(0, `rgba(30,30,40,${alpha})`)
    cg.addColorStop(1, 'rgba(20,20,28,0)')
    ctx.fillStyle = cg
    ctx.beginPath()
    ctx.arc(cx, cy, cr, 0, Math.PI * 2)
    ctx.fill()
  })
}

export function drawSkyToCanvas(canvas, props, mode, time) {
  const ctx = canvas.getContext('2d')
  const W = canvas.width
  const H = canvas.height

  // Base gradient — all modes
  const gradient = ctx.createLinearGradient(0, 0, 0, H)
  gradient.addColorStop(0, `#${props.skyTop.getHexString()}`)
  gradient.addColorStop(1, `#${props.skyBottom.getHexString()}`)
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, W, H)

  if (mode === 'rainy') {
    ctx.save()
    drawStormClouds(ctx, W, H, 0.85)
    ctx.restore()

    ctx.save()
    ctx.lineCap = 'round'
    rainDrops.forEach((drop) => {
      drop.y += drop.speed
      if (drop.y > 1 + drop.length / H) { drop.y = -drop.length / H; drop.x = Math.random() }
      const px = drop.x * W, py = drop.y * H
      const grad = ctx.createLinearGradient(px, py, px + 2, py + drop.length)
      grad.addColorStop(0,   'rgba(174,214,241,0)')
      grad.addColorStop(0.3, `rgba(200,230,255,${drop.opacity})`)
      grad.addColorStop(1,   'rgba(174,214,241,0)')
      ctx.strokeStyle = grad
      ctx.lineWidth = drop.width
      ctx.beginPath()
      ctx.moveTo(px, py)
      ctx.lineTo(px + 2, py + drop.length)
      ctx.stroke()
    })
    ctx.restore()

    // ── Lightning flash ───────────────────────────────────────────────────────
    const flashCycle = time % 8
    const isFlashing = flashCycle > 7.7

    if (isFlashing) {
      const flashAlpha = Math.sin((flashCycle - 7.7) / 0.3 * Math.PI) * 0.25
      ctx.fillStyle = `rgba(220,230,255,${flashAlpha})`
      ctx.fillRect(0, 0, W, H)
    }

    // Rising edge — fire audio event only on the FIRST frame of each flash
    if (isFlashing && !_wasFlashingRainy) {
      // 60 % chance near strike, 40 % chance distant rumble
      const distance = Math.random() < 0.6 ? 'near' : 'distant'
      window.dispatchEvent(new CustomEvent('lightning:flash', { detail: { distance } }))
    }
    _wasFlashingRainy = isFlashing
  }

  if (mode === 'cloudy') {
    ctx.save()
    drawStormClouds(ctx, W, H, 0.85)
    ctx.restore()

    // ── Occasional dim lightning — longer cycle, lower alpha than rainy ───────
    // Cycle of 20s with a short flash window at the end → ~1 flash per 20s
    const cloudyFlashCycle = time % 20
    const isCloudyFlashing = cloudyFlashCycle > 19.6

    if (isCloudyFlashing) {
      const flashAlpha = Math.sin((cloudyFlashCycle - 19.6) / 0.4 * Math.PI) * 0.12
      ctx.fillStyle = `rgba(210,220,255,${flashAlpha})`
      ctx.fillRect(0, 0, W, H)
    }

    // Rising edge — fire audio event (always distant for cloudy)
    if (isCloudyFlashing && !_wasFlashingCloudy) {
      window.dispatchEvent(new CustomEvent('lightning:flash', { detail: { distance: 'distant' } }))
    }
    _wasFlashingCloudy = isCloudyFlashing
  }

  if (mode === 'snow') {
    ctx.save()
    stormClouds.forEach(({ x, y, r }) => {
      const cx = x * W, cy = y * H, cr = r * W * 1.1
      const cg = ctx.createRadialGradient(cx, cy, cr * 0.1, cx, cy, cr)
      cg.addColorStop(0, 'rgba(200,210,220,0.55)')
      cg.addColorStop(1, 'rgba(180,195,210,0)')
      ctx.fillStyle = cg
      ctx.beginPath()
      ctx.arc(cx, cy, cr, 0, Math.PI * 2)
      ctx.fill()
    })
    ctx.restore()

    ctx.save()
    snowFlakes.forEach((flake) => {
      flake.y += flake.speedY
      flake.wobble += 0.02
      flake.x += flake.speedX + Math.sin(flake.wobble) * 0.0003
      if (flake.y > 1 + flake.radius / H) { flake.y = -flake.radius / H; flake.x = Math.random() }
      if (flake.x < 0) flake.x = 1
      if (flake.x > 1) flake.x = 0
      const px = flake.x * W, py = flake.y * H
      const radGrad = ctx.createRadialGradient(px, py, 0, px, py, flake.radius * 2)
      radGrad.addColorStop(0,   `rgba(255,255,255,${flake.opacity})`)
      radGrad.addColorStop(0.5, `rgba(220,235,245,${flake.opacity * 0.6})`)
      radGrad.addColorStop(1,   'rgba(200,220,240,0)')
      ctx.fillStyle = radGrad
      ctx.beginPath()
      ctx.arc(px, py, flake.radius * 2, 0, Math.PI * 2)
      ctx.fill()
    })
    ctx.restore()
  }
  // normal: pure gradient only
}