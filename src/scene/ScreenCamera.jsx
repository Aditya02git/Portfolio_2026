import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

// Handles smooth camera fly-to Screen and fly-back
export default function ScreenCamera({ active, scene, onArrived }) {
  const { camera } = useThree()
  const flyRef     = useRef(null)
  const startRef   = useRef({ pos: new THREE.Vector3(), look: new THREE.Vector3() })

  useEffect(() => {
    if (!active || !scene) return

    // Save current camera state for fly-back
    startRef.current.pos  = camera.position.clone()
    const dir = new THREE.Vector3()
    camera.getWorldDirection(dir)
    startRef.current.look = camera.position.clone().add(dir)

    // Find Screen world position
    const screen = scene.getObjectByName('Screen')
    if (!screen) { console.warn('[ScreenCam] Screen not found'); return }

    const screenPos = new THREE.Vector3()
    screen.getWorldPosition(screenPos)

    // Place camera in front of the screen, slightly elevated
    const targetPos    = new THREE.Vector3(screenPos.x, screenPos.y + 0.2, screenPos.z + 1.8)
    const targetLookAt = screenPos.clone()

    flyRef.current = {
      startPos:    camera.position.clone(),
      startLookAt: startRef.current.look.clone(),
      targetPos, targetLookAt,
      duration: 1.4, elapsed: 0,
      done: false, isReturn: false,
      onDone: onArrived,
    }
  }, [active, scene])

  useEffect(() => {
    if (active) return  // only trigger fly-back when active turns false
    if (!flyRef.current && startRef.current.pos.lengthSq() === 0) return

    // Fly back to saved position
    flyRef.current = {
      startPos:    camera.position.clone(),
      startLookAt: (() => { const d = new THREE.Vector3(); camera.getWorldDirection(d); return camera.position.clone().add(d) })(),
      targetPos:   startRef.current.pos.clone(),
      targetLookAt:startRef.current.look.clone(),
      duration: 1.2, elapsed: 0,
      done: false, isReturn: true,
      onDone: null,
    }
  }, [active])

  useFrame((_, delta) => {
    const fly = flyRef.current
    if (!fly || fly.done) return

    fly.elapsed += delta
    const raw = Math.min(fly.elapsed / fly.duration, 1)
    const t   = raw < 0.5 ? 4*raw*raw*raw : 1 - Math.pow(-2*raw+2,3)/2

    camera.position.lerpVectors(fly.startPos, fly.targetPos, t)
    const lookAt = new THREE.Vector3().lerpVectors(fly.startLookAt, fly.targetLookAt, t)
    camera.lookAt(lookAt)

    if (raw >= 1) {
      fly.done = true
      if (fly.onDone) fly.onDone()
    }
  })

  return null
}