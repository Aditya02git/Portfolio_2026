import * as THREE from 'three'

export function lerp(start, end, ratio) {
  return (1 - ratio) * start + ratio * end
}

export function lerpColor(a, b, t) {
  return new THREE.Color().lerpColors(a, b, t)
}