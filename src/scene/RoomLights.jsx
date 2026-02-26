import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// ─── Ambient + Directional: driven by day cycle progress ───────────────────
export function DynamicSceneLighting({ progressRef }) {
  const ambientRef = useRef()
  const dirRef     = useRef()

  useFrame(() => {
    if (!ambientRef.current || !dirRef.current) return
    const p = progressRef.current

    let ambientTarget, dirTarget
    if (p < 0.15)      { ambientTarget = 0.9;  dirTarget = 1.0 }
    else if (p < 0.30) { const t = (p-0.15)/0.15; ambientTarget = 0.9-t*0.65;  dirTarget = 1.0-t*0.85 }
    else if (p < 0.45) { const t = (p-0.30)/0.15; ambientTarget = 0.25-t*0.20; dirTarget = 0.15-t*0.13 }
    else if (p < 0.65) { ambientTarget = 0.05; dirTarget = 0.02 }
    else if (p < 0.80) { const t = (p-0.65)/0.15; ambientTarget = 0.05+t*0.50; dirTarget = 0.02+t*0.60 }
    else if (p < 0.90) { const t = (p-0.80)/0.10; ambientTarget = 0.55+t*0.35; dirTarget = 0.62+t*0.38 }
    else               { ambientTarget = 0.9;  dirTarget = 1.0 }

    ambientRef.current.intensity += (ambientTarget - ambientRef.current.intensity) * 0.03
    dirRef.current.intensity     += (dirTarget     - dirRef.current.intensity)     * 0.03
  })

  return (
    <>
      <ambientLight     ref={ambientRef} intensity={0.9} color="#fff8f0" />
      <directionalLight ref={dirRef}     intensity={1.0} color="#fff5e0" position={[8, 12, 6]} />
    </>
  )
}

// ─── Wall Lamp ──────────────────────────────────────────────────────────────
export function WallLampLight({ on, scene }) {
  const lightRef  = useRef()
  const posSetRef = useRef(false)

  useFrame(() => {
    if (!lightRef.current || !scene) return
    if (!posSetRef.current) {
      const lamp = scene.getObjectByName('Wall_Lamp_1')
      if (lamp) {
        const pos = new THREE.Vector3()
        lamp.getWorldPosition(pos)
        if (pos.lengthSq() > 0) {
          lightRef.current.position.set(pos.x, pos.y -0.2, pos.z+0.4)
          posSetRef.current = true
          console.log('[WallLamp] positioned at', lightRef.current.position.toArray())
        }
      }
    }
    const target = on ? 4.0 : 0
    lightRef.current.intensity += (target - lightRef.current.intensity) * 0.1
  })

  return (
    <>
    <pointLight
      ref={lightRef}
      color="#ff33f5"
      intensity={0}
      distance={16}
      decay={2}
    />
    <pointLight
      ref={lightRef}
      color="#4433ff"
      intensity={0}
      distance={16}
      decay={2}
    />
    </>
  )
}

// ─── Tube Light ─────────────────────────────────────────────────────────────
export function TubeLightLight({ on, flickering, scene }) {
  const ambientRef = useRef()
  const flickerRef = useRef({ t: 0 })

  useFrame((_, delta) => {
    if (!ambientRef.current) return

    let target = 0
    if (on) {
      if (flickering) {
        flickerRef.current.t += delta
        const t = flickerRef.current.t
        const noise =
          Math.sin(t * 58) * 0.4 +
          Math.sin(t * 31) * 0.25 +
          (Math.random() > 0.88 ? -0.7 : 0)
        target = Math.max(0, 1.2 + noise * 0.8)
      } else {
        target = 1.8
      }
    }

    const speed = flickering ? 1 : 0.06
    ambientRef.current.intensity += (target - ambientRef.current.intensity) * speed
  })

  // Emissive glow on tube mesh
  useEffect(() => {
    if (!scene) return
    const tube = scene.getObjectByName('TubeLight_1')
    if (!tube) return
    tube.traverse(obj => {
      if (obj.isMesh && obj.material) {
        const mats = Array.isArray(obj.material) ? obj.material : [obj.material]
        mats.forEach(m => {
          m.emissive = new THREE.Color(on ? '#ddeeff' : '#000000')
          m.emissiveIntensity = on ? 1.5 : 0
          m.needsUpdate = true
        })
      }
    })
  }, [on, scene])

  return (
    <ambientLight ref={ambientRef} color="#ddeeff" intensity={0} />
  )
}