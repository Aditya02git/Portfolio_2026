import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export const DRAWER_NAMES = ['Drawer_1', 'Drawer_2', 'Drawer_3', 'Drawer_4']
const FPS = 24

export function useDrawers(gltf, mixerRef, mixerReady) {
  const stateRef = useRef({})

  useEffect(() => {
    if (!mixerReady || !gltf?.animations?.length || !mixerRef.current) return

    stateRef.current = {}
    DRAWER_NAMES.forEach((drawerName) => {
      const clip =
        gltf.animations.find(c => c.name.toLowerCase().includes(drawerName.toLowerCase())) ??
        gltf.animations.find(c => c.tracks.some(t => t.name.toLowerCase().includes(drawerName.toLowerCase())))

      if (!clip) { console.warn(`[Drawers] No clip for ${drawerName}`); return }

      const tracks = clip.tracks.filter(t => t.name.toLowerCase().includes(drawerName.toLowerCase()))
      const drawerClip = new THREE.AnimationClip(
        `${drawerName}_full`, clip.duration,
        tracks.length > 0 ? tracks : clip.tracks
      )
      const openClip  = THREE.AnimationUtils.subclip(drawerClip, `${drawerName}_open`,  0,  50, FPS)
      const closeClip = THREE.AnimationUtils.subclip(drawerClip, `${drawerName}_close`, 50, 100, FPS)

      const openAction  = mixerRef.current.clipAction(openClip)
      const closeAction = mixerRef.current.clipAction(closeClip)
      ;[openAction, closeAction].forEach(a => {
        a.setLoop(THREE.LoopOnce, 1)
        a.clampWhenFinished = true
      })
      stateRef.current[drawerName] = { openAction, closeAction, isOpen: false }
      console.log(`[Drawers] ✓ ${drawerName} ready`)
    })
  }, [mixerReady, gltf])

  function toggleDrawer(name) {
    const d = stateRef.current[name]
    if (!d) return
    if (d.isOpen) { d.openAction.stop(); d.closeAction.reset().play() }
    else          { d.closeAction.stop(); d.openAction.reset().play() }
    d.isOpen = !d.isOpen
    console.log(`[Drawers] ${name} → ${d.isOpen ? 'open' : 'closed'}`)
  }

  function getDrawerName(clickedName) {
    return DRAWER_NAMES.find(d => clickedName === d || clickedName.startsWith(d)) ?? null
  }

  /** Returns current open state of a drawer (before any toggle). */
  function isDrawerOpen(name) {
    return stateRef.current[name]?.isOpen ?? false
  }

  return { toggleDrawer, getDrawerName, isDrawerOpen }
}