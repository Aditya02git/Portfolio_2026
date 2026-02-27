import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

export function isACMesh(name) {
  if (!name) return false
  return name.toLowerCase().startsWith('ac')
}

// ── AC startup sound with fade-out ────────────────────────────────────────────
function playAcStartSound() {
  const audio = new Audio('/sounds/ac/ac-start.mp3')
  audio.volume = 1.0
  audio.play().catch(() => {})   // ignore autoplay policy errors silently

  // Fade out over the last portion of the clip
  const FADE_START = 0.6        // start fading at 60% of duration
  const FADE_INTERVAL = 50      // ms between volume steps

  const ticker = setInterval(() => {
    if (audio.duration && audio.currentTime / audio.duration >= FADE_START) {
      audio.volume = Math.max(0, audio.volume - 0.07)
      if (audio.volume <= 0) {
        clearInterval(ticker)
        audio.pause()
      }
    }
  }, FADE_INTERVAL)

  // Safety cleanup if the clip ends naturally before fade completes
  audio.addEventListener('ended', () => clearInterval(ticker), { once: true })
}

export function useAC(gltf, mixerRef, mixerReady) {
  const actionRef = useRef(null)
  const [acOn, setAcOn] = useState(false)

  useEffect(() => {
    if (!mixerReady || !gltf?.animations?.length || !mixerRef.current) return

    const clip =
      gltf.animations.find(c => c.name.toLowerCase().includes('ac_bar')) ??
      gltf.animations.find(c => c.name.toLowerCase() === 'ac') ??
      gltf.animations.find(c => c.tracks.some(t => t.name.toLowerCase().includes('ac_bar')))

    if (!clip) { console.warn('[AC] No clip found. Clips:', gltf.animations.map(c => c.name)); return }

    const action = mixerRef.current.clipAction(clip)
    action.setLoop(THREE.LoopRepeat, Infinity)
    action.enabled   = true
    action.timeScale = 1
    action.play()
    action.paused = true
    actionRef.current = action
    console.log('[AC] ✓ Loaded:', clip.name)

    return () => action.stop()
  }, [mixerReady, gltf])

  useEffect(() => {
    if (!gltf?.scene) return
    const text = gltf.scene.getObjectByName('Ac_text')
    if (!text) return
    text.visible = acOn
    text.traverse(obj => {
      if (!obj.isMesh || !obj.material) return
      const mats = Array.isArray(obj.material) ? obj.material : [obj.material]
      mats.forEach(m => {
        m.emissive = new THREE.Color(acOn ? '#00ffcc' : '#000000')
        m.emissiveIntensity = acOn ? 2.5 : 0
        m.needsUpdate = true
      })
    })
  }, [acOn, gltf])

  function toggleAC() {
    if (!actionRef.current) { console.warn('[AC] Action not ready'); return }
    const next = !acOn

    if (next) {
      // Turn ON — play startup sound then start animation
      playAcStartSound()
      actionRef.current.reset()
      actionRef.current.paused = false
      console.log('[AC] ON ✓')
    } else {
      // Turn OFF — fade out animation over 0.5s then hold at frame 0
      actionRef.current.fadeOut(0.5)
      setTimeout(() => {
        if (!actionRef.current) return
        actionRef.current.stop()
        actionRef.current.play()
        actionRef.current.paused = true
      }, 500)
      console.log('[AC] OFF — blending to frame 0')
    }

    setAcOn(next)
  }

  return { acOn, toggleAC }
}