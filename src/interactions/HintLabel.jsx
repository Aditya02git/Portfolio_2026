// Shows a small floating hint when hovering an interactable object
import { getInteractable } from './interactables.js'

export default function HintLabel({ hoveredName }) {
  if (!hoveredName) return null
  const item = getInteractable(hoveredName)
  if (!item) return null

  return (
    <div style={{
      position: 'fixed',
      bottom: 40,
      left: '50%',
      transform: 'translateX(-50%)',
      background: 'linear-gradient(135deg, #fdf3d0, #f5e4a8)',
      border: '2px solid #8B6914',
      borderRadius: 8,
      padding: '8px 20px',
      fontFamily: "'Palatino Linotype', serif",
      fontSize: 14,
      fontWeight: 700,
      color: '#3d2800',
      letterSpacing: 1,
      boxShadow: '0 0 0 3px #c9a227, 0 8px 30px rgba(0,0,0,0.4)',
      pointerEvents: 'none',
      animation: 'hintPop 0.2s ease',
      whiteSpace: 'nowrap',
      zIndex: 500,
    }}>
      <style>{`@keyframes hintPop { from { opacity:0; transform:translateX(-50%) translateY(8px) } to { opacity:1; transform:translateX(-50%) translateY(0) } }`}</style>
      {item.icon} {item.hint} — <span style={{fontStyle:'italic', fontWeight:400}}>click to open</span>
    </div>
  )
}