import { useEffect } from 'react'
import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useSharedMixer }    from '../interactions/useSharedMixer.js'
import { useDrawers }        from '../interactions/useDrawers.js'
import { useCurtain }        from '../interactions/useCurtain.js'
import { useAC, isACMesh }   from '../interactions/useAC.js'
import { getSkillByMesh }    from '../interactions/skills.js'

const LIGHT_MESHES  = ['Wall_Lamp_1', 'TubeLight_1']
const SCREEN_MESHES = ['Screen', 'screen', 'Monitor_Screen']

// ── Preload starts fetching the GLB immediately when this module is imported,
//    before React even renders — so Suspense resolves faster.
useGLTF.preload('/portfolio.glb')

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

  const { mixerRef, ready: mixerReady } = useSharedMixer(gltf)
  const { toggleDrawer, getDrawerName, isDrawerOpen } = useDrawers(gltf, mixerRef, mixerReady)
  useCurtain(gltf, mixerRef, mixerReady)
  const { acOn, toggleAC } = useAC(gltf, mixerRef, mixerReady)

  useEffect(() => {
    onReady(true)
    if (onSceneReady) onSceneReady(scene)
  }, [scene]) // eslint-disable-line

  useEffect(() => {
    if (onAcToggle) onAcToggle(acOn)
  }, [acOn]) // eslint-disable-line

  useFrame((_, delta) => {
    mixerRef.current?.update(delta)
  })

  const handleClick = (e) => {
    e.stopPropagation()
    const name = e.object.name
    console.log('Clicked:', name)

    // ── Drawers ────────────────────────────────────────────────────────────
    const drawerName = getDrawerName(name)
    if (drawerName) {
      const willOpen = !isDrawerOpen(drawerName)
      toggleDrawer(drawerName)
      if (onDrawerClick) onDrawerClick(drawerName, willOpen)
      return
    }

    // ── Lights ─────────────────────────────────────────────────────────────
    if (LIGHT_MESHES.includes(name)) {
      if (onLightClick) onLightClick(name)
      return
    }

    // ── AC unit ────────────────────────────────────────────────────────────
    if (isACMesh(name)) {
      toggleAC()
      return
    }

    // ── Monitor / Screen ───────────────────────────────────────────────────
    if (SCREEN_MESHES.some(s => name.toLowerCase().includes(s.toLowerCase()))) {
      if (onScreenClick) onScreenClick()
      return
    }

    // ── Skill items ────────────────────────────────────────────────────────
    const skill = getSkillByMesh(name)
    if (skill) {
      if (onSkillClick) onSkillClick(skill)
      return
    }

    // ── Everything else ────────────────────────────────────────────────────
    if (onObjectClick) onObjectClick(name)
  }

  return <primitive object={scene} onClick={handleClick} />
}
