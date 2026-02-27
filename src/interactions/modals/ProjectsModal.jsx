import ModalWrapper from './ModalWrapper.jsx'

const projects = [
  { title: 'Chat App', tech: 'React.js · Node.js · MongoDB · Express.js · Socket.io', desc: 'A full-stack real-time messaging application with user authentication and chat rooms.', link: 'https://chattrix-app-g8al.onrender.com/login' },
  { title: 'Auralume UI Library', tech: 'React-Three-Fiber.js · Three.js · Node.js', desc: '•	Designed and published a reusable UI component library with customizable, accessible components.', link: 'https://auralume.onrender.com/' },
  { title: 'Cold Pursuit', tech: 'Three.js · Cannon(es) · Blender', desc: 'A physics-based racing system using Cannon-es for realistic vehicle dynamics and collision, Built an AI chasing mechanic where police cars pursue the player using pursuit steering behaviours', link: 'https://discourse.threejs.org/t/i-have-tried-to-build-a-game-like-need-for-speed-using-cannon-es-and-three-js/86955' },
]

export default function ProjectsModal({ onClose }) {
  return (
    <ModalWrapper icon="💻" title="Top Projects" onClose={onClose}>
      <style>{`
        @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
        @keyframes popIn { from { opacity:0; transform:scale(0.85) translateY(20px) } to { opacity:1; transform:scale(1) translateY(0) } }
        .proj-card { background:rgba(139,105,20,0.1); border:1px solid #c9a22766; border-radius:8px; padding:12px 14px; margin-bottom:12px }
        .proj-title { font-size:15px; font-weight:800; color:#3d2800; margin-bottom:3px }
        .proj-tech { font-size:11px; color:#8B6914; letter-spacing:0.5px; margin-bottom:6px; font-style:italic }
        .proj-desc { font-size:13px; color:#5a3e10; margin:0 0 8px }
        .proj-link { font-size:12px; color:#8B6914; font-weight:700; text-decoration:none; border-bottom:1px solid #c9a227 }
        .proj-link:hover { color:#3d2800 }
      `}</style>
      {projects.map((p, i) => (
        <div className="proj-card" key={i}>
          <div className="proj-title">✦ {p.title}</div>
          <div className="proj-tech">{p.tech}</div>
          <p className="proj-desc">{p.desc}</p>
          <a className="proj-link" href={p.link} target="_blank" rel="noreferrer">View Project →</a>
        </div>
      ))}
    </ModalWrapper>
  )
}