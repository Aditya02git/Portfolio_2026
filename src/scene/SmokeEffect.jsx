/**
 * SmokeEffect.jsx
 * Zero per-frame allocation smoke — geometry built ONCE at mount.
 * Animation done entirely in a vertex shader (GPU), not CPU.
 * CPU does: one uniform update per frame. That's it.
 */

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const STRAND_COUNT = 6
const LIFETIME     = 5.0
const SPAWN_RADIUS = 0.025
const SEG_COUNT    = 20       // vertices per strand
const RISE         = 0.28
const WAVE_AMP     = 0.022

// ── Random point uniformly inside a disc ─────────────────────────────────────
function randInDisc(r) {
  const a = Math.random() * Math.PI * 2
  const d = Math.sqrt(Math.random()) * r
  return [Math.cos(a) * d, Math.sin(a) * d]
}

// ── Build ALL strand geometry ONCE ───────────────────────────────────────────
// Each strand is a line of vertices along Y.
// Custom attributes carry per-vertex and per-strand data to the shader.
function buildGeometry(seeds) {
  const totalVerts = STRAND_COUNT * SEG_COUNT

  // Per-vertex attributes
  const positions  = new Float32Array(totalVerts * 3)  // base spawn position
  const aFrac      = new Float32Array(totalVerts)       // 0..1 along strand
  const aPhase     = new Float32Array(totalVerts)       // per-strand phase offset
  const aSeed1     = new Float32Array(totalVerts)
  const aSeed2     = new Float32Array(totalVerts)
  const aWobSpeed  = new Float32Array(totalVerts)
  const aStrandIdx = new Float32Array(totalVerts)

  for (let si = 0; si < STRAND_COUNT; si++) {
    const s = seeds[si]
    for (let vi = 0; vi < SEG_COUNT; vi++) {
      const idx  = si * SEG_COUNT + vi
      const frac = vi / (SEG_COUNT - 1)

      // Base position = spawn point, shader will displace it
      positions[idx * 3 + 0] = s.sx
      positions[idx * 3 + 1] = 0       // Y handled in shader
      positions[idx * 3 + 2] = s.sz

      aFrac[idx]      = frac
      aPhase[idx]     = s.phase
      aSeed1[idx]     = s.s1
      aSeed2[idx]     = s.s2
      aWobSpeed[idx]  = s.wspd
      aStrandIdx[idx] = si
    }
  }

  // Build index buffer: lines connecting consecutive verts per strand
  const indices = []
  for (let si = 0; si < STRAND_COUNT; si++) {
    for (let vi = 0; vi < SEG_COUNT - 1; vi++) {
      const base = si * SEG_COUNT + vi
      indices.push(base, base + 1)
    }
  }

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position',   new THREE.BufferAttribute(positions,  3))
  geo.setAttribute('aFrac',      new THREE.BufferAttribute(aFrac,      1))
  geo.setAttribute('aPhase',     new THREE.BufferAttribute(aPhase,     1))
  geo.setAttribute('aSeed1',     new THREE.BufferAttribute(aSeed1,     1))
  geo.setAttribute('aSeed2',     new THREE.BufferAttribute(aSeed2,     1))
  geo.setAttribute('aWobSpeed',  new THREE.BufferAttribute(aWobSpeed,  1))
  geo.setAttribute('aStrandIdx', new THREE.BufferAttribute(aStrandIdx, 1))
  geo.setIndex(indices)
  return geo
}

// ── Vertex shader — all animation lives here ──────────────────────────────────
const vertexShader = /* glsl */`
  attribute float aFrac;
  attribute float aPhase;
  attribute float aSeed1;
  attribute float aSeed2;
  attribute float aWobSpeed;

  uniform float uTime;
  uniform vec3  uOrigin;
  uniform float uRise;
  uniform float uAmp;
  uniform float uLifetime;

  varying float vAlpha;

  void main() {
    // Per-strand time, looped
    float t = mod((uTime + aPhase * uLifetime) / uLifetime, 1.0);

    // Rise: vertex height = frac * RISE * t
    float y = aFrac * uRise * t;

    // Wave: amplitude grows quadratically with frac and t
    float amp   = aFrac * aFrac * uAmp * (0.5 + t);
    float angle = uTime * aWobSpeed + aFrac * 3.14159 * 3.5;
    float dx    = sin(angle + aSeed1) * amp;
    float dz    = cos(angle * 0.8 + aSeed2) * amp;

    vec3 pos = vec3(
      uOrigin.x + position.x + dx,
      uOrigin.y + y,
      uOrigin.z + position.z + dz
    );

    // Fade envelope: in → hold → out
    float alpha;
    if (t < 0.10)       alpha = t / 0.10;
    else if (t < 0.72)  alpha = 1.0 - (t - 0.10) * 0.45;
    else                alpha = max(0.0, (1.0 - t) / 0.28);

    // Taper: tip is thinner (fade by frac towards tip)
    float taper = 1.0 - aFrac * 0.75;

    vAlpha = alpha * taper * 0.85;

    gl_Position  = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = 2.0;
  }
`

const fragmentShader = /* glsl */`
  varying float vAlpha;
  uniform vec3 uColor;

  void main() {
    gl_FragColor = vec4(uColor, vAlpha);
  }
`

// ── Main export ───────────────────────────────────────────────────────────────
export default function SmokeEffect({ scene }) {
  const meshRef = useRef()

  const origin = useMemo(() => {
    if (!scene) return null
    let found = null
    scene.traverse(obj => {
      if (obj.name === 'Smoke' || obj.name === 'smoke') found = obj
    })
    if (!found) return null
    const p = new THREE.Vector3()
    found.getWorldPosition(p)
    return p
  }, [scene])

  const seeds = useMemo(() => Array.from({ length: STRAND_COUNT }, (_, i) => {
    const [sx, sz] = randInDisc(SPAWN_RADIUS)
    return {
      phase: i / STRAND_COUNT,
      sx, sz,
      s1:   Math.random() * Math.PI * 2,
      s2:   Math.random() * Math.PI * 2,
      wspd: 0.35 + Math.random() * 0.45,
    }
  }), [])

  const geometry = useMemo(() => origin ? buildGeometry(seeds) : null, [seeds, origin])

  const material = useMemo(() => origin ? new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    transparent:  true,
    depthWrite:   false,
    blending:     THREE.AdditiveBlending,
    uniforms: {
      uTime:     { value: 0 },
      uOrigin:   { value: origin.clone() },
      uRise:     { value: RISE },
      uAmp:      { value: WAVE_AMP },
      uLifetime: { value: LIFETIME },
      uColor:    { value: new THREE.Color(0.96, 0.93, 0.90) },
    },
  }) : null, [origin])

  // One uniform write per frame — that's the entire CPU cost
  useFrame((state) => {
    if (material) material.uniforms.uTime.value = state.clock.elapsedTime
  })

  if (!origin || !geometry || !material) return null

  return (
    <lineSegments
      ref={meshRef}
      geometry={geometry}
      material={material}
      renderOrder={5}
      frustumCulled={false}
    />
  )
}