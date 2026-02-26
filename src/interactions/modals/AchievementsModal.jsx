import ModalWrapper from './ModalWrapper.jsx'

const achievements = [
  { icon: '🏆', title: 'Hackathon Finalist', desc: 'Hackfest 2025 MSIT', year: '2025' },
  { icon: '🌐', title: 'Open Source Contributor', desc: 'Contributed to Three.js and React Three Fiber ecosystems', year: '2025' },
]

export default function AchievementsModal({ onClose }) {
  return (
    <ModalWrapper icon="" title="Achievements" onClose={onClose}>
      <style>{`
        @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
        @keyframes popIn { from { opacity:0; transform:scale(0.85) translateY(20px) } to { opacity:1; transform:scale(1) translateY(0) } }
        .ach-row { display:flex; gap:14px; align-items:flex-start; padding:10px 0; border-bottom:1px solid #c9a22744 }
        .ach-row:last-child { border-bottom:none }
        .ach-icon { font-size:28px; flex-shrink:0; filter:drop-shadow(0 2px 4px rgba(0,0,0,0.2)) }
        .ach-title { font-size:14px; font-weight:800; color:#3d2800 }
        .ach-year { font-size:10px; color:#8B6914; font-weight:700; letter-spacing:1px; margin-left:6px }
        .ach-desc { font-size:12px; color:#5a3e10; margin-top:3px }
      `}</style>
      {achievements.map((a, i) => (
        <div className="ach-row" key={i}>
          <span className="ach-icon">{a.icon}</span>
          <div>
            <div>
              <span className="ach-title">{a.title}</span>
              <span className="ach-year">{a.year}</span>
            </div>
            <div className="ach-desc">{a.desc}</div>
          </div>
        </div>
      ))}
    </ModalWrapper>
  )
}