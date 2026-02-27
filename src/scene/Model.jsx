/**
 * Model.jsx  (updated)
 * ─────────────────────────────────────────────────────────────────────────────
 * Key change: onReady(true) is now deferred until THREE.WebGLRenderer has
 * actually compiled/uploaded the scene to the GPU (via renderer.compile).
 * This prevents a 1-2 s white-flash / freeze after the loader disappears.
 */

import { useEffect, useRef } from 'react'
import { useGLTF }           from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useSharedMixer }    from '../interactions/useSharedMixer.js'
import { useDrawers }        from '../interactions/useDrawers.js'
import { useCurtain }        from '../interactions/useCurtain.js'
import { useAC, isACMesh }   from '../interactions/useAC.js'
import { getSkillByMesh }    from '../interactions/skills.js'

const LIGHT_MESHES  = ['Wall_Lamp_1', 'TubeLight_1']
const SCREEN_MESHES = ['Screen', 'screen', 'Monitor_Screen']

export default function Model({
  onReady,
  onObjectClick,
  onLightClick,
  onSceneReady,
  onAcToggle,
  onSkillClick,
  onScreenClick,
  onDrawerClick,
}) {
  const gltf = useGLTF('/portfolio.glb')
  const { scene } = gltf
  const { gl, camera } = useThree()

  const compiledRef = useRef(false)

  const { mixerRef, ready: mixerReady } = useSharedMixer(gltf)
  const { toggleDrawer, getDrawerName, isDrawerOpen } = useDrawers(gltf, mixerRef, mixerReady)
  useCurtain(gltf, mixerRef, mixerReady)
  const { acOn, toggleAC } = useAC(gltf, mixerRef, mixerReady)

  // ── GPU compile / upload ──────────────────────────────────────────────────
  useEffect(() => {
    if (compiledRef.current) return
    compiledRef.current = true

    // renderer.compile walks every material and uploads textures + shaders.
    // It's synchronous-ish (schedules async texture uploads internally) so we
    // add a rAF + small timeout to let the GL driver finish before revealing.
    try {
      gl.compile(scene, camera)
    } catch (_) {
      // compile() may not exist in older r3f versions — degrade gracefully
    }

    // Two rAFs guarantee at least one rendered frame has completed
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        setTimeout(() => {
          onReady(true)
          if (onSceneReady) onSceneReady(scene)
        }, 120)   // 120 ms safety margin for texture uploads
      })
    )
  }, [scene]) // eslint-disable-line

  useEffect(() => {
    if (onAcToggle) onAcToggle(acOn)
  }, [acOn]) // eslint-disable-line

  useFrame((_, delta) => {
    mixerRef.current?.update(delta)
  })

  // ── click handler (unchanged) ─────────────────────────────────────────────
  const handleClick = (e) => {
    e.stopPropagation()
    const name = e.object.name
    console.log('Clicked:', name)

    const drawerName = getDrawerName(name)
    if (drawerName) {
      const willOpen = !isDrawerOpen(drawerName)
      toggleDrawer(drawerName)
      if (onDrawerClick) onDrawerClick(drawerName, willOpen)
      return
    }

    if (LIGHT_MESHES.includes(name)) {
      if (onLightClick) onLightClick(name)
      return
    }

    if (isACMesh(name)) {
      toggleAC()
      return
    }

    if (SCREEN_MESHES.some(s => name.toLowerCase().includes(s.toLowerCase()))) {
      if (onScreenClick) onScreenClick()
      return
    }

    const skill = getSkillByMesh(name)
    if (skill) {
      if (onSkillClick) onSkillClick(skill)
      return
    }

    if (onObjectClick) onObjectClick(name)
  }

  return <primitive object={scene} onClick={handleClick} />
}