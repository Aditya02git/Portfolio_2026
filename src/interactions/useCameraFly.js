/**
 * useCameraFly.js
 * Generic camera fly-to named empty node in the scene.
 *
 * Usage:
 *   const { flyTo, flyBack } = useCameraFly(scene)
 *   flyTo('Desk_View')       // fly to that node's position/orientation
 *   flyBack()                // return to saved position
 */

import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

const easeInOutCubic = (t) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2

export function useCameraFly(scene) {
  const { camera } = useThree()
  const flyRef     = useRef(null)
  const savedRef   = useRef(null)   // saved pos+lookAt for fly-back

  // ── tick ──────────────────────────────────────────────────────────────────
  useFrame((_, delta) => {
    const fly = flyRef.current
    if (!fly || fly.done) return

    fly.elapsed += delta
    const raw = Math.min(fly.elapsed / fly.duration, 1)
    const t   = easeInOutCubic(raw)

    camera.position.lerpVectors(fly.startPos, fly.targetPos, t)
    const look = new THREE.Vector3().lerpVectors(fly.startLook, fly.targetLook, t)
    camera.lookAt(look)

    if (raw >= 1) {
      fly.done = true
      fly.onDone?.()
    }
  })

  // ── helpers ───────────────────────────────────────────────────────────────

  /** Save current camera state and fly to a named node in the scene. */
  function flyTo(nodeName, { duration = 1.3, onDone } = {}) {
    if (!scene) return

    const node = scene.getObjectByName(nodeName)
    if (!node) { console.warn(`[CameraFly] Node "${nodeName}" not found`); return }

    // World position of the node
    const targetPos = new THREE.Vector3()
    node.getWorldPosition(targetPos)

    // Use node's forward direction as lookAt target if it has rotation,
    // otherwise look toward scene centre
    const forward = new THREE.Vector3(0, 0, -1)
      .applyQuaternion(node.getWorldQuaternion(new THREE.Quaternion()))
    const targetLook = targetPos.clone().add(forward)

    // Save current state for fly-back
    const curDir = new THREE.Vector3()
    camera.getWorldDirection(curDir)
    savedRef.current = {
      pos:  camera.position.clone(),
      look: camera.position.clone().add(curDir),
    }

    flyRef.current = {
      startPos:  camera.position.clone(),
      startLook: camera.position.clone().add(curDir),
      targetPos,
      targetLook,
      duration,
      elapsed: 0,
      done:    false,
      onDone,
    }
  }

  /** Fly back to the position saved before the last flyTo. */
  function flyBack({ duration = 1.2, onDone } = {}) {
    if (!savedRef.current) return

    const curDir = new THREE.Vector3()
    camera.getWorldDirection(curDir)

    flyRef.current = {
      startPos:  camera.position.clone(),
      startLook: camera.position.clone().add(curDir),
      targetPos:  savedRef.current.pos.clone(),
      targetLook: savedRef.current.look.clone(),
      duration,
      elapsed: 0,
      done:    false,
      onDone: () => { savedRef.current = null; onDone?.() },
    }
  }

  /** True while a fly is in progress */
  function isFlying() {
    return flyRef.current !== null && !flyRef.current.done
  }

  return { flyTo, flyBack, isFlying }
}