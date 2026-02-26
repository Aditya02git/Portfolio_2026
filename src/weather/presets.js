import * as THREE from 'three'

export const normalPresets = {
  day:   { skyTop: new THREE.Color('#1a6aa8'), skyBottom: new THREE.Color('#ddeeff') },
  dusk:  { skyTop: new THREE.Color('#c0392b'), skyBottom: new THREE.Color('#f39c12') },
  night: { skyTop: new THREE.Color('#020818'), skyBottom: new THREE.Color('#0a1a3a') },
  dawn:  { skyTop: new THREE.Color('#ff9d9d'), skyBottom: new THREE.Color('#ffd59b') },
}

export const rainyPresets = {
  day:   { skyTop: new THREE.Color('#2c2c3a'), skyBottom: new THREE.Color('#4a4a5a') },
  dusk:  { skyTop: new THREE.Color('#1a1a2a'), skyBottom: new THREE.Color('#3a2a2a') },
  night: { skyTop: new THREE.Color('#080810'), skyBottom: new THREE.Color('#101018') },
  dawn:  { skyTop: new THREE.Color('#2a2030'), skyBottom: new THREE.Color('#3a3028') },
}

export const cloudyPresets = rainyPresets

export const snowPresets = {
  day:   { skyTop: new THREE.Color('#8aaabb'), skyBottom: new THREE.Color('#d8eaf0') },
  dusk:  { skyTop: new THREE.Color('#6a7a88'), skyBottom: new THREE.Color('#aabbcc') },
  night: { skyTop: new THREE.Color('#0a0e18'), skyBottom: new THREE.Color('#1a2030') },
  dawn:  { skyTop: new THREE.Color('#aabbcc'), skyBottom: new THREE.Color('#ddeeff') },
}

export const presetsMap = {
  normal: normalPresets,
  rainy:  rainyPresets,
  cloudy: cloudyPresets,
  snow:   snowPresets,
}