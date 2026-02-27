import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

// Returns both a ref AND a state counter so dependents can re-run
// when the mixer is actually created
export function useSharedMixer(gltf) {
  const mixerRef   = useRef(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!gltf?.scene) return
    const mixer = new THREE.AnimationMixer(gltf.scene)
    mixerRef.current = mixer
    setReady(true) // triggers re-render so dependent hooks fire with mixer present
    console.log('[Mixer] Created. Clips:', gltf.animations?.map(c => `"${c.name}"`))
    return () => {
      mixer.stopAllAction()
      mixer.uncacheRoot(gltf.scene)
      mixerRef.current = null
      setReady(false)
    }
  }, [gltf])

  return { mixerRef, ready }
}