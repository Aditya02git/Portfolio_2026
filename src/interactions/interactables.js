// Define which 3D object names are interactable and what they trigger
// 'type' maps to a modal/action component
// 'meshNames' lists the exact Blender mesh/group names to match

export const interactables = [
  {
    id: 'resume',
    label: 'Resume',
    icon: '📄',
    meshNames: ['Resume', 'resume', 'Clipboard'],
    type: 'resume',
    hint: 'View Resume',
  },
  {
    id: 'computer',
    label: 'Computer',
    icon: '💻',
    meshNames: ['Laptop', 'laptop', 'Computer', 'Monitor', 'PC', 'Projects'],
    type: 'projects',
    hint: 'View Projects',
  },
  {
    id: 'bookshelf',
    label: 'Bookshelf',
    icon: '📚',
    meshNames: ['Bookshelf', 'bookshelf', 'BookShelf', 'Books', 'Shelf'],
    type: 'skills',
    hint: 'View Skills',
  },
  {
    id: 'trophy',
    label: 'Trophy',
    icon: '🏆',
    meshNames: ['Trophy', 'trophy', 'Award', 'Cup'],
    type: 'achievements',
    hint: 'View Achievements',
  },
  {
    id: 'phone',
    label: 'Contact',
    icon: '📱',
    meshNames: ['Phone', 'phone', 'Mobile', 'Contact'],
    type: 'contact',
    hint: 'Contact Me',
  },
  {
    id: 'bottle',
    label: 'Be healthy!',
    icon: 'water',
    meshNames: ['Bottle', 'Bottle_Water'],
    type: 'bottle',
    hint: 'Be healthy!',
  },
  {
    id: 'coffee',
    label: 'Energize!',
    icon: 'coffee',
    meshNames: ['Coffee'],
    type: 'coffee',
    hint: 'energy',
  },
  {
    id: 'krishna',
    label: 'GOD',
    icon: 'krishna',
    meshNames: ['Krishna_Statue'],
    type: 'krishna',
    hint: 'god',
  },
  {
    id: 'telescope',
    label: 'telescope',
    icon: 'telescope',
    meshNames: ['Telescope'],
    type: 'telescope',
    hint: 'telescope',
  },
  {
    id: 'miniboard',
    label: 'miniboard',
    icon: 'mini-board',
    meshNames: ['Mini_Board'],
    type: 'miniboard',
    hint: 'miniboard',
  },
]

// Lookup by mesh name → interactable config
export function getInteractable(meshName) {
  if (!meshName) return null
  for (const item of interactables) {
    for (const name of item.meshNames) {
      if (meshName.toLowerCase().includes(name.toLowerCase()) ||
          name.toLowerCase().includes(meshName.toLowerCase())) {
        return item
      }
    }
  }
  return null
}