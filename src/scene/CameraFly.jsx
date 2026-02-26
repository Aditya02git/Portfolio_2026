/**
 * CameraFly.jsx
 * Thin wrapper around useCameraFly that exposes flyTo/flyBack
 * via an imperative ref so App.jsx can trigger them from outside the Canvas.
 *
 * Usage in App.jsx (inside Canvas):
 *   const cameraFlyRef = useRef()
 *   <CameraFly ref={cameraFlyRef} scene={scene3D} />
 *
 * Then anywhere:
 *   cameraFlyRef.current?.flyTo('Desk_View')
 *   cameraFlyRef.current?.flyBack()
 */

import { forwardRef, useImperativeHandle } from 'react'
import { useCameraFly } from '../interactions/useCameraFly.js'

const CameraFly = forwardRef(function CameraFly({ scene }, ref) {
  const { flyTo, flyBack, isFlying } = useCameraFly(scene)

  useImperativeHandle(ref, () => ({ flyTo, flyBack, isFlying }), [scene])

  return null
})

export default CameraFly