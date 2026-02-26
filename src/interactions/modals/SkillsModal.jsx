import ModalWrapper from './ModalWrapper.jsx'

const skillCategories = [
  { label: 'Frontend', icon: '🎨', skills: ['React', 'Three.js', 'TypeScript', 'CSS/SASS', 'WebGL'] },
  { label: 'Backend',  icon: '⚙️', skills: ['Node.js', 'Python', 'FastAPI', 'PostgreSQL', 'MongoDB'] },
  { label: '3D & Tools', icon: '🧊', skills: ['Blender', 'React Three Fiber', 'GLSL', 'Figma', 'Git'] },
]

export default function SkillsModal({ onClose }) {
  return (
    <ModalWrapper icon="📚" title="Skills" onClose={onClose}>
      <style>{`
        @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
        @keyframes popIn { from { opacity:0; transform:scale(0.85) translateY(20px) } to { opacity:1; transform:scale(1) translateY(0) } }
        .cat-label { font-size:11px; letter-spacing:2px; text-transform:uppercase; color:#8B6914; margin:14px 0 8px; display:flex; align-items:center; gap:6px }
        .cat-label::after { content:''; flex:1; height:1px; background:linear-gradient(90deg,#c9a22766,transparent) }
        .skills-wrap { display:flex; flex-wrap:wrap; gap:7px }
        .skill-pill { background:linear-gradient(135deg,#f5c842,#e8b820); border:1px solid #8B6914; border-radius:20px; padding:4px 13px; font-size:12px; font-weight:700; color:#3d2800; letter-spacing:0.3px; box-shadow:0 2px 6px rgba(0,0,0,0.15) }
      `}</style>
      {skillCategories.map((cat, i) => (
        <div key={i}>
          <div className="cat-label">{cat.icon} {cat.label}</div>
          <div className="skills-wrap">
            {cat.skills.map(s => <span className="skill-pill" key={s}>{s}</span>)}
          </div>
        </div>
      ))}
    </ModalWrapper>
  )
}