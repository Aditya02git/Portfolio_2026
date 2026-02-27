import { useEffect, useRef } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const OUTLINE_TAG = '__outlineMesh'

// ── Only these objects show an outline on hover ───────────────────────────────
export const OUTLINE_WHITELIST = [
  // Lights
  'Wall_Lamp', 'TubeLight',
  // Camera animation targets
  'Desk',
  'Shelf_1', 'Shelf_2', 'Shelf_3',
  // Monitor
  'Screen', 
  // Mute
  'Speaker_1', 'Speaker_2',
  // Drawers
  'Drawer_1', 'Drawer_2', 'Drawer_3', 'Drawer_4',
  // Skills
  'Blender', 'HTML', 'Unity','C++',
  'JS', 'ThreeJs', 'MongoDB','React','Python',
  // personal items
  'Laptop','Resume','Phone','Projects',
  // Achievements
  'Trophy',
  // AC
  'Ac_base',
  // Useless but fun to outline
  'Coffee', 'Bottle','Telescope','Cat',
  // God
  'Krishna_Statue',
  // Credits
  'Mini_Board'
]

function isWhitelisted(obj) {
  let cur = obj
  while (cur) {
    if (OUTLINE_WHITELIST.some(w => cur.name === w || cur.name?.startsWith(w))) return true
    cur = cur.parent
  }
  return false
}

// ── Everything below is the original code, untouched ─────────────────────────

const outlineVert = `
  uniform float outlineThickness;
  void main() {
    vec3 norm = normalize(normalMatrix * normal);
    vec4 pos = modelViewMatrix * vec4(position, 1.0);
    pos.xy += norm.xy * outlineThickness;
    gl_Position = projectionMatrix * pos;
  }
`

const outlineFrag = `
  void main() {
    gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
  }
`

function makeOutlineMaterial() {
  return new THREE.ShaderMaterial({
    vertexShader: outlineVert,
    fragmentShader: outlineFrag,
    side: THREE.BackSide,
    depthWrite: false,
    uniforms: {
      outlineThickness: { value: 0.008 }
    }
  })
}

function collectMeshes(obj, result = []) {
  if (obj.userData[OUTLINE_TAG]) return
  if (obj.isMesh) result.push(obj)
  for (let i = 0; i < obj.children.length; i++) {
    collectMeshes(obj.children[i], result)
  }
  return result
}

function getNamedParent(obj, scene) {
  const parent = obj.parent
  if (!parent || parent === scene) return obj
  if (parent.parent === scene) return obj
  return parent
}

export default function OutlineEffect() {
  const { gl, scene, camera, raycaster, pointer } = useThree()
  const hoveredGroupRef  = useRef(null)
  const outlineSceneRef  = useRef(new THREE.Scene())
  const outlineMeshesRef = useRef([])

  function attachOutlines(group) {
    if (hoveredGroupRef.current === group) return
    detachOutlines()
    hoveredGroupRef.current = group

    collectMeshes(group).forEach((mesh) => {
      const outline = new THREE.Mesh(mesh.geometry, makeOutlineMaterial())
      outline.userData[OUTLINE_TAG] = true
      outline.raycast = () => {}
      outline.renderOrder = 999
      outline.matrixAutoUpdate = false
      outlineMeshesRef.current.push({ mesh, outline })
      outlineSceneRef.current.add(outline)
    })
  }

  function detachOutlines() {
    outlineMeshesRef.current.forEach(({ outline }) => {
      outline.material.dispose()
      outlineSceneRef.current.remove(outline)
    })
    outlineMeshesRef.current = []
    hoveredGroupRef.current = null
  }

  useFrame(() => {
    raycaster.setFromCamera(pointer, camera)
    const meshes = collectMeshes(scene)
    const hits   = raycaster.intersectObjects(meshes, false)

    if (hits.length > 0 && isWhitelisted(hits[0].object)) {
      attachOutlines(getNamedParent(hits[0].object, scene))
      document.body.style.cursor = 'pointer'
    } else {
      detachOutlines()
      document.body.style.cursor = 'default'
    }

    outlineMeshesRef.current.forEach(({ mesh, outline }) => {
      mesh.updateWorldMatrix(true, false)
      outline.matrix.copy(mesh.matrixWorld)
      outline.matrixWorld.copy(mesh.matrixWorld)
    })

    gl.autoClear = false
    gl.render(outlineSceneRef.current, camera)
  }, 2)

  useEffect(() => {
    return () => {
      detachOutlines()
      document.body.style.cursor = 'default'
    }
  }, [])

  return null
}