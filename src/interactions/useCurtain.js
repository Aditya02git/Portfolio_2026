import { useEffect } from 'react'
import * as THREE from 'three'

export function useCurtain(gltf, mixerRef, mixerReady) {
  useEffect(() => {
    if (!mixerReady || !gltf?.animations?.length || !mixerRef.current) return

    console.log('[Curtain] All clips:', gltf.animations.map(c => c.name))

    // Find clip by exact name first, then by tracks targeting Curtain_2
    const clip =
      gltf.animations.find(c => c.name === 'KeyAction.003') ??
      gltf.animations.find(c => c.tracks.some(t => t.name.toLowerCase().includes('curtain_2')))

    if (!clip) {
      console.warn('[Curtain] No clip has Curtain_2 tracks. Tracks in all clips:',
        gltf.animations.flatMap(c => c.tracks.map(t => t.name))
      )
      return
    }

    // Extract only Curtain_2 tracks so other objects aren't affected
    const curtainTracks = clip.tracks.filter(t =>
      t.name.toLowerCase().includes('curtain_2')
    )
    const finalClip = new THREE.AnimationClip('Curtain_2_loop', clip.duration, curtainTracks)

    const action = mixerRef.current.clipAction(finalClip)
    action.setLoop(THREE.LoopRepeat, Infinity)
    action.enabled   = true
    action.timeScale = 1
    action.play()

    console.log(`[Curtain] ✓ Playing "${clip.name}" with ${curtainTracks.length} Curtain_2 tracks, duration: ${clip.duration.toFixed(2)}s`)

    return () => action.stop()
  }, [mixerReady, gltf])
}