// Map mesh names → skill definitions
// Add more meshNames if you have additional skill objects
export const SKILLS = [
  {
    id: 'blender',
    meshNames: ['Blender_2', 'Blender'],
    name: 'Blender',
    icon: '🧊',
    category: 'Design',
    level: 'Intermediate',
    desc: 'Creating 3D models, scenes, and animations with Blender.',
    color: '#f5a623',
  },
  {
    id: 'cpp',
    meshNames: ['C++_2', 'C++', 'CPP_2', 'CPP'],
    name: 'C++',
    icon: '⚙️',
    category: 'Programming',
    level: 'Intermediate',
    desc: 'Systems programming, game engines, and performance-critical applications.',
    color: '#4a9eff',
  },
  {
    id: 'html',
    meshNames: ['HTML_2', 'HTML'],
    name: 'HTML / CSS',
    icon: '🌐',
    category: 'Frontend',
    level: 'Advanced',
    desc: 'Semantic markup, modern CSS layouts, animations and responsive design.',
    color: '#e34c26',
  },
  {
    id: 'unity',
    meshNames: ['Unity_2', 'Unity'],
    name: 'Unity',
    icon: '🎮',
    category: 'Game Dev',
    level: 'Beginner',
    desc: 'Building 2D/3D games and interactive experiences with Unity engine.',
    color: '#aaaaaa',
  },
  {
    id: 'js',
    meshNames: ['JS_2', 'JS', 'JavaScript_2'],
    name: 'JavaScript',
    icon: '✨',
    category: 'Programming',
    level: 'Advanced',
    desc: 'Full-stack JS development, Node.js and modern ES6+.',
    color: '#f7df1e',
  },
  {
    id: 'threejs',
    meshNames: ['ThreeJs_2'],
    name: 'Three Js',
    icon: '✨',
    category: 'Library',
    level: 'Intermediate',
    desc: 'Three.js is for creating and displaying animated 3D graphics in a web browser using WebGL.',
    color: '#f7df1e',
  },
  {
    id: 'mongodb',
    meshNames: ['MongoDB_2'],
    name: 'Mongo DB',
    icon: '✨',
    category: 'Database',
    level: 'Beginner',
    desc: 'NoSQL database for storing and retrieving large volumes of data.',
    color: '#f7df1e',
  },
  {
    id: 'reactjs',
    meshNames: ['React_2'],
    name: 'React Js',
    icon: '⚛️',
    category: 'Web Dev',
    level: 'Intermediate',
    desc: 'Building fast, component-based UIs and single-page applications with React.',
    color: '#61dafb',
  },
]

// Lookup by clicked mesh name
export function getSkillByMesh(meshName) {
  if (!meshName) return null
  return SKILLS.find(s =>
    s.meshNames.some(m => m.toLowerCase() === meshName.toLowerCase())
  ) ?? null
}

// ── localStorage key ──────────────────────────────────────────────────────────
const STORAGE_KEY = 'portfolio_discovered_skills'

// Clear on every page load so skills always start fresh each visit
localStorage.removeItem(STORAGE_KEY)

export function getDiscovered() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch { return [] }
}

export function markDiscovered(skillId) {
  const current = getDiscovered()
  if (!current.includes(skillId)) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...current, skillId]))
    return true  // newly discovered
  }
  return false  // already known
}