import { lerpColor } from '../utils/maths.js'
import { presetsMap } from './presets.js'

function buildKeyframes(presets) {
  return [
    { properties: presets.day,   stop: 0.00 },
    { properties: presets.day,   stop: 0.15 },
    { properties: presets.dusk,  stop: 0.25 },
    { properties: presets.night, stop: 0.35 },
    { properties: presets.night, stop: 0.60 },
    { properties: presets.dawn,  stop: 0.80 },
    { properties: presets.day,   stop: 0.90 },
  ]
}

const keyframesMap = {
  normal: buildKeyframes(presetsMap.normal),
  rainy:  buildKeyframes(presetsMap.rainy),
  cloudy: buildKeyframes(presetsMap.cloudy),
  snow:   buildKeyframes(presetsMap.snow),
}

export function getInterpolatedProperties(progress, mode) {
  const keyframes = keyframesMap[mode]
  let startKf = keyframes[0]
  let endKf = keyframes[1]

  for (let i = 0; i < keyframes.length - 1; i++) {
    if (progress >= keyframes[i].stop && progress <= keyframes[i + 1].stop) {
      startKf = keyframes[i]
      endKf = keyframes[i + 1]
      break
    }
  }
  if (progress > keyframes[keyframes.length - 1].stop) {
    startKf = keyframes[keyframes.length - 1]
    endKf = keyframes[0]
  }

  const segLen = endKf.stop - startKf.stop
  const t = segLen > 0 ? (progress - startKf.stop) / segLen : 0

  return {
    skyTop:    lerpColor(startKf.properties.skyTop,    endKf.properties.skyTop,    t),
    skyBottom: lerpColor(startKf.properties.skyBottom, endKf.properties.skyBottom, t),
  }
}

export function getTimeLabel(progress) {
  if (progress < 0.15) return '☀️ Day'
  if (progress < 0.25) return '🌅 Dusk'
  if (progress < 0.60) return '🌙 Night'
  if (progress < 0.80) return '🌄 Dawn'
  return '☀️ Day'
}