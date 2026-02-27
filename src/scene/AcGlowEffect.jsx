import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Adds a pulsing point light near the AC unit when it's on
// to simulate the cool glow of an AC screen/text
export default function AcGlowEffect({ on, scene }) {
  const lightRef  = useRef()
  const posSetRef = useRef(false)
  const pulseRef  = useRef(0)

  useFrame((_, delta) => {
    if (!lightRef.current || !scene) return

    // Position once
    if (!posSetRef.current) {
      const ac = scene.getObjectByName('Ac_text') ??
                 scene.getObjectByName('Ac_screen') ??
                 scene.getObjectByName('Ac_bar')
      if (ac) {
        const pos = new THREE.Vector3()
        ac.getWorldPosition(pos)
        if (pos.lengthSq() > 0) {
          lightRef.current.position.copy(pos)
          lightRef.current.position.z += 0.45 // slightly in front
          lightRef.current.position.y -= 0.1  // slightly above
          posSetRef.current = true
          console.log('[AC Glow] positioned at', pos.toArray())
        }
      }
    }

    // Pulse glow when on
    if (on) {
      pulseRef.current += delta * 2
      const pulse = 0.8 + Math.sin(pulseRef.current) * 0.2
      lightRef.current.intensity += (1.5 * pulse - lightRef.current.intensity) * 0.1
    } else {
      lightRef.current.intensity += (0 - lightRef.current.intensity) * 0.1
    }
  })

  return (
    <pointLight
      ref={lightRef}
      color="#00ffcc"
      intensity={0}
      distance={0.5}
      decay={0.2}
    />
  )
}