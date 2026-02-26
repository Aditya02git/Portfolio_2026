import { useEffect, useMemo, useRef } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { getInterpolatedProperties } from '../weather/dayCycle.js'
import { createSkyCanvas, drawSkyToCanvas } from '../weather/skyCanvas.js'

export default function Renderer({ progressRef, cycleDurationRef, mode }) {
  const { gl, scene, camera } = useThree()
  const orthoCamera = useMemo(() => new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1), [])
  const windowScene = useMemo(() => new THREE.Scene(), [])
  const timeRef = useRef(0)

  const skyCanvas = useMemo(() => createSkyCanvas(), [])

  const skyTexture = useMemo(() => {
    const tex = new THREE.CanvasTexture(skyCanvas)
    tex.needsUpdate = true
    return tex
  }, [skyCanvas])

  useEffect(() => {
    const onResize = () => {
      skyCanvas.width  = window.innerWidth
      skyCanvas.height = window.innerHeight
      skyTexture.needsUpdate = true
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [skyCanvas, skyTexture])

  const skyScene = useMemo(() => {
    const s = new THREE.Scene()
    const mat = new THREE.MeshBasicMaterial({
      map: skyTexture, depthTest: false, depthWrite: false, toneMapped: false,
    })
    s.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat))
    return s
  }, [skyTexture])

  useEffect(() => {
    scene.traverse((obj) => {
      if (obj.isMesh && (obj.name === 'Win_1' || obj.name === 'Win_2')) {
        obj.visible = false
        const clone = obj.clone()
        clone.visible = true
        obj.updateWorldMatrix(true, false)
        clone.applyMatrix4(obj.matrixWorld)
        clone.material = new THREE.MeshBasicMaterial({ side: THREE.FrontSide })
        windowScene.add(clone)
      }
    })
  }, [scene, windowScene])

  useFrame((_, delta) => {
    const paused = window.__dayCyclePaused?.current ?? false
    if (!paused) {
      progressRef.current += delta / cycleDurationRef.current
      if (progressRef.current > 1) progressRef.current = 0
    }
    timeRef.current += delta

    const props = getInterpolatedProperties(progressRef.current, mode)
    drawSkyToCanvas(skyCanvas, props, mode, timeRef.current)
    skyTexture.needsUpdate = true

    const glCtx = gl.getContext()
    gl.autoClear = false

    glCtx.clearColor(0, 0, 0, 1)
    glCtx.clearDepth(1)
    glCtx.clearStencil(0)
    glCtx.clear(glCtx.COLOR_BUFFER_BIT | glCtx.DEPTH_BUFFER_BIT | glCtx.STENCIL_BUFFER_BIT)

    // PASS 1: full scene
    glCtx.disable(glCtx.STENCIL_TEST)
    glCtx.depthMask(true)
    glCtx.colorMask(true, true, true, true)
    gl.render(scene, camera)

    // PASS 2: stencil write (front face + depth tested)
    glCtx.enable(glCtx.STENCIL_TEST)
    glCtx.stencilFunc(glCtx.ALWAYS, 1, 0xff)
    glCtx.stencilOp(glCtx.KEEP, glCtx.KEEP, glCtx.REPLACE)
    glCtx.stencilMask(0xff)
    glCtx.colorMask(false, false, false, false)
    glCtx.depthMask(false)
    gl.render(windowScene, camera)

    // PASS 3: sky where stencil == 1
    glCtx.colorMask(true, true, true, true)
    glCtx.depthMask(false)
    glCtx.stencilFunc(glCtx.EQUAL, 1, 0xff)
    glCtx.stencilOp(glCtx.KEEP, glCtx.KEEP, glCtx.KEEP)
    glCtx.stencilMask(0x00)
    glCtx.disable(glCtx.DEPTH_TEST)
    gl.render(skyScene, orthoCamera)

    // Restore
    glCtx.enable(glCtx.DEPTH_TEST)
    glCtx.disable(glCtx.STENCIL_TEST)
    glCtx.stencilMask(0xff)
    glCtx.depthMask(true)
    gl.autoClear = true
  }, 1)

  return null
}
