import ModalWrapper from './ModalWrapper.jsx'


export default function CoffeeModal({ onClose }) {
  return (
    <ModalWrapper icon="☕" title="energize!" onClose={onClose}>
      <style>{`
        @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
        @keyframes popIn { from { opacity:0; transform:scale(0.85) translateY(20px) } to { opacity:1; transform:scale(1) translateY(0) } }
        .cat-label { font-size:11px; letter-spacing:2px; text-transform:uppercase; color:#8B6914; margin:14px 0 8px; display:flex; align-items:center; gap:6px }
        .cat-label::after { content:''; flex:1; height:1px; background:linear-gradient(90deg,#c9a22766,transparent) }
        .skills-wrap { display:flex; flex-wrap:wrap; gap:7px }
        .skill-pill { background:linear-gradient(135deg,#f5c842,#e8b820); border:1px solid #8B6914; border-radius:20px; padding:4px 13px; font-size:12px; font-weight:700; color:#3d2800; letter-spacing:0.3px; box-shadow:0 2px 6px rgba(0,0,0,0.15) }
      `}</style>
      
        <div style={{
          display:'flex', alignItems: 'center', justifyContent: 'center'
        }}>Coffee gives you energy!</div>
    </ModalWrapper>
  )
}