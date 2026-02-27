/**
 * SleepEffect.jsx
 * Floating 3D "Z Z Z" letters that rise from the Sleep empty axis in the GLB.
 * Uses @react-three/drei Text for 3D text rendered in the scene.
 *
 * Usage in App.jsx (inside Canvas, after Model is ready):
 *   {ready && scene3D && <SleepEffect scene={scene3D} />}
 */

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'

// Three Z particles, staggered in time
const Z_CONFIGS = [
  { delay: 0.0,  offsetX: 0.00, size: 0.13 },
  { delay: 0.65, offsetX: 0.10, size: 0.10 },
  { delay: 1.30, offsetX: 0.05, size: 0.08 },
]

const CYCLE   = 2.2    // seconds per Z loop
const RISE    = 0.55   // world-units to rise over the cycle
const COLOR   = '#ffffff'

function ZParticle({ originX, originY, originZ, offsetX, delay, size }) {
  const ref    = useRef()
  const clock  = useRef(delay * CYCLE)   // start at delay offset so they're staggered

  useFrame((_, delta) => {
    clock.current += delta
    const t = (clock.current % CYCLE) / CYCLE   // 0 → 1

    if (!ref.current) return

    // Rise
    ref.current.position.y = originY + t * RISE

    // Drift slightly right as it rises (like the CSS version)
    ref.current.position.x = originX + offsetX + t * 0.08

    // Fade in fast, fade out slow
    const alpha = t < 0.25
      ? t / 0.25                          // fade in
      : t < 0.75
        ? 1                               // hold
        : 1 - (t - 0.75) / 0.25          // fade out

    // Scale from small → large (mirrors font-size 30→72 in CSS)
    const scale = 0.55 + t * 0.45

    ref.current.scale.setScalar(scale)
    ref.current.material.opacity = alpha
  })

  return (
    <Text
      ref={ref}
      position={[originX + offsetX, originY, originZ]}
      fontSize={size}
      color={COLOR}
      fontWeight="bold"
      anchorX="center"
      anchorY="middle"
      renderOrder={10}
      material-transparent
      material-opacity={0}
      material-depthWrite={false}
    >
      Z
    </Text>
  )
}

export default function SleepEffect({ scene }) {
  // Find the Sleep empty/axis in the GLB
  const origin = useMemo(() => {
    if (!scene) return null
    let found = null
    scene.traverse(obj => {
      if (obj.name === 'Sleep' || obj.name === 'sleep') found = obj
    })
    if (!found) return null

    const pos = new THREE.Vector3()
    found.getWorldPosition(pos)
    return pos
  }, [scene])

  if (!origin) return null

  return (
    <group>
      {Z_CONFIGS.map((cfg, i) => (
        <ZParticle
          key={i}
          originX={origin.x}
          originY={origin.y}
          originZ={origin.z}
          offsetX={cfg.offsetX}
          delay={cfg.delay}
          size={cfg.size}
        />
      ))}
    </group>
  )
}