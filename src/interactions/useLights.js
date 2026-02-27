import { useRef, useState } from 'react'

// Tracks on/off state for all toggleable lights
export function useLights({ onAutoOn } = {}) {
  const [wallLampOn, setWallLampOn] = useState(false)
  const [tubeLightOn, setTubeLightOn] = useState(false)
  const [flickering, setFlickering] = useState(false)

  // Track if user manually turned off — block auto-on until next day cycle
  const manuallyOffRef = useRef(false)
  // Track last known isNight state to detect day→night transition
  const wasNightRef = useRef(false)

  function toggleWallLamp() {
    setWallLampOn(v => !v)
  }

  function toggleTubeLight() {
    if (!tubeLightOn) {
      // User manually turning ON — clear the manual-off flag
      manuallyOffRef.current = false
      setFlickering(true)
      setTubeLightOn(true)
      setTimeout(() => setFlickering(false), 1200)
    } else {
      // User manually turning OFF — set flag to block auto-on
      manuallyOffRef.current = true
      setTubeLightOn(false)
      setFlickering(false)
    }
  }

  function syncWithDayCycle(progress) {
    const isNight = progress >= 0.30 && progress <= 0.85

    // Reset the manual-off block when a new night cycle begins (day → night transition)
    if (isNight && !wasNightRef.current) {
      manuallyOffRef.current = false
    }
    wasNightRef.current = isNight

    setTubeLightOn(prev => {
      if (isNight && !prev && !manuallyOffRef.current) {
        // Auto turn on — trigger flicker and play click sound
        setFlickering(true)
        setTimeout(() => setFlickering(false), 1200)

        // Small realistic delay before the click — like a light sensing darkness
        setTimeout(() => onAutoOn?.(), 300)

        return true
      }
      if (!isNight && prev) {
        // Day came — turn off and reset flag for next night
        manuallyOffRef.current = false
        return false
      }
      return prev
    })
  }

  return {
    wallLampOn, tubeLightOn, flickering,
    toggleWallLamp, toggleTubeLight, syncWithDayCycle
  }
}