import { useState, useEffect, useCallback } from 'react'
import { SKILLS, getDiscovered, markDiscovered } from './skills.js'

// ── "New Skill Discovered!" toast popup ────────────────────────────────────
function DiscoveryToast({ skill, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3200)
    return () => clearTimeout(t)
  }, [])

  return (
    <div style={ts.overlay}>
      <style>{`
        @keyframes toastIn {
          0%   { opacity:0; transform:translateX(-50%) translateY(40px) scale(0.85) }
          20%  { opacity:1; transform:translateX(-50%) translateY(0)    scale(1.05) }
          30%  { transform:translateX(-50%) translateY(0) scale(1) }
          80%  { opacity:1; transform:translateX(-50%) translateY(0) scale(1) }
          100% { opacity:0; transform:translateX(-50%) translateY(-20px) scale(0.95) }
        }
        @keyframes starSpin { to { transform: rotate(360deg) scale(1.2) } }
        @keyframes shimmer {
          0%,100% { text-shadow: 0 0 8px ${skill.color}88 }
          50%      { text-shadow: 0 0 22px ${skill.color}, 0 0 40px ${skill.color}66 }
        }
      `}</style>
      <div style={{...ts.toast, animation:'toastIn 3.2s ease forwards'}}>
        {/* Corner ornaments */}
        <div style={{...ts.corner, top:5,left:5,borderTopLeftRadius:4}} />
        <div style={{...ts.corner, top:5,right:5,borderTopRightRadius:4,borderLeft:'none',borderRight:'2px solid #8B6914'}} />
        <div style={{...ts.corner, bottom:5,left:5,borderBottomLeftRadius:4,borderTop:'none',borderBottom:'2px solid #8B6914'}} />
        <div style={{...ts.corner, bottom:5,right:5,borderBottomRightRadius:4,borderTop:'none',borderBottom:'2px solid #8B6914',borderLeft:'none',borderRight:'2px solid #8B6914'}} />

        <div style={ts.toastTop}>✦ NEW SKILL DISCOVERED ✦</div>

        <div style={{...ts.iconBadge, background:`radial-gradient(circle, ${skill.color}44, ${skill.color}11)`, border:`2px solid ${skill.color}88`}}>
          <span style={{fontSize:36}}>{skill.icon}</span>
        </div>

        <div style={{...ts.skillName, animation:'shimmer 1.2s ease infinite', color: skill.color}}>
          {skill.name}
        </div>
        <div style={ts.category}>{skill.category} · {skill.level}</div>
        <div style={{...ts.divRow}}>
          <div style={ts.divLine}/><span style={ts.divLeaf}>❧</span><div style={ts.divLine}/>
        </div>
        <div style={ts.toastDesc}>{skill.desc}</div>
      </div>
    </div>
  )
}

// ── Full skill book modal ──────────────────────────────────────────────────
function SkillBookModal({ discovered, onClose }) {
  useEffect(() => {
    const h = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [])

  return (
    <div style={mb.overlay} onClick={onClose}>
      <div style={mb.panel} onClick={e => e.stopPropagation()}>
        <style>{`
          @keyframes popIn { from{opacity:0;transform:scale(0.85) translateY(20px)} to{opacity:1;transform:scale(1) translateY(0)} }
          @keyframes fadeIn { from{opacity:0} to{opacity:1} }
          .skill-card:hover { transform:translateY(-3px); box-shadow:0 8px 24px rgba(0,0,0,0.25) !important; }
        `}</style>
        <div style={{...mb.corner,top:6,left:6,borderTopLeftRadius:5}}/>
        <div style={{...mb.corner,top:6,right:6,borderTopRightRadius:5,borderLeft:'none',borderRight:'2px solid #8B6914'}}/>
        <div style={{...mb.corner,bottom:6,left:6,borderBottomLeftRadius:5,borderTop:'none',borderBottom:'2px solid #8B6914'}}/>
        <div style={{...mb.corner,bottom:6,right:6,borderBottomRightRadius:5,borderTop:'none',borderBottom:'2px solid #8B6914',borderLeft:'none',borderRight:'2px solid #8B6914'}}/>

        <div style={mb.header}>
          <div style={mb.iconBadge}>📖</div>
          <div style={mb.divRow}><div style={mb.divLine}/><span style={mb.leaf}>❧</span><div style={mb.divLine}/></div>
          <h2 style={mb.title}>SKILL BOOK</h2>
          <div style={mb.divRow}><div style={mb.divLine}/><span style={mb.leaf}>❦</span><div style={mb.divLine}/></div>
          <p style={mb.subtitle}>
            {discovered.length} / {SKILLS.length} skills discovered
          </p>
          {/* Progress bar */}
          <div style={mb.progressBg}>
            <div style={{...mb.progressFill, width: `${(discovered.length/SKILLS.length)*100}%`}}/>
          </div>
        </div>

        <div style={mb.grid}>
          {SKILLS.map(skill => {
            const found = discovered.includes(skill.id)
            return (
              <div
                key={skill.id}
                className="skill-card"
                style={{
                  ...mb.card,
                  opacity: found ? 1 : 0.45,
                  filter: found ? 'none' : 'grayscale(1)',
                  transition: 'all 0.2s',
                  borderColor: found ? skill.color + '88' : '#8B691444',
                }}
              >
                <div style={{
                  ...mb.cardIcon,
                  background: found ? `radial-gradient(circle, ${skill.color}33, transparent)` : 'rgba(0,0,0,0.1)',
                  border: `1px solid ${found ? skill.color + '66' : '#8B691433'}`,
                }}>
                  <span style={{fontSize: found ? 28 : 22}}>{found ? skill.icon : '?'}</span>
                </div>
                <div style={mb.cardName}>{found ? skill.name : '???'}</div>
                <div style={{...mb.cardCategory, color: found ? skill.color : '#8B6914aa'}}>
                  {found ? `${skill.category} · ${skill.level}` : 'Undiscovered'}
                </div>
                {found && <div style={mb.cardDesc}>{skill.desc}</div>}
                {!found && (
                  <div style={mb.cardHint}>Find this item in the room to unlock</div>
                )}
              </div>
            )
          })}
        </div>

        <button style={mb.closeBtn} onClick={onClose}>✕ Close</button>
      </div>
    </div>
  )
}

// ── Main export: manages toast + modal state ───────────────────────────────
export default function SkillDiscovery({ trigger, onClear, onAchievement }) {
  const [toast, setToast]       = useState(null)
  const [showBook, setShowBook] = useState(false)
  const [discovered, setDiscovered] = useState(() => getDiscovered())

  useEffect(() => {
    if (!trigger) return

    const isNew = markDiscovered(trigger.id)
    const updated = getDiscovered()
    setDiscovered(updated)

    if (isNew) {
      // Play achievement sound then show toast
      onAchievement?.()
      setToast(trigger)
    } else {
      // Already discovered → just open the book
      setShowBook(true)
    }

    if (onClear) onClear()
  }, [trigger])

  return (
    <>
      {toast && (
        <DiscoveryToast
          skill={toast}
          onDone={() => { setToast(null); setShowBook(true) }}
        />
      )}
      {showBook && (
        <SkillBookModal
          discovered={discovered}
          onClose={() => setShowBook(false)}
        />
      )}
    </>
  )
}

// ─── Styles ────────────────────────────────────────────────────────────────
const ts = {
  overlay: {
    position:'fixed', inset:0, zIndex:2000,
    pointerEvents:'none',
  },
  toast: {
    position:'absolute', bottom:120, left:'50%',
    transform:'translateX(-50%)',
    background:'linear-gradient(160deg, #fdf3d0 0%, #f5e4a8 50%, #ede0a0 100%)',
    border:'3px solid #8B6914',
    borderRadius:12,
    padding:'20px 28px 18px',
    width:280,
    boxShadow:'0 0 0 5px #c9a227, 0 0 0 8px #8B6914, 0 20px 60px rgba(0,0,0,0.7)',
    fontFamily:"'Palatino Linotype', serif",
    textAlign:'center',
    pointerEvents:'none',
  },
  corner: {
    position:'absolute', width:14, height:14,
    border:'2px solid #8B6914',
    pointerEvents:'none',
    borderRight:'none', borderBottom:'none',
  },
  toastTop: {
    fontSize:9, letterSpacing:2.5, textTransform:'uppercase',
    color:'#8B6914', fontWeight:700, marginBottom:10,
  },
  iconBadge: {
    width:64, height:64, borderRadius:'50%',
    display:'inline-flex', alignItems:'center', justifyContent:'center',
    marginBottom:10,
  },
  skillName: {
    fontSize:22, fontWeight:800, letterSpacing:2,
    textTransform:'uppercase', color:'#3d2800', marginBottom:4,
  },
  category: {
    fontSize:11, color:'#7a5c1e', letterSpacing:1,
    textTransform:'uppercase', marginBottom:8,
  },
  divRow: { display:'flex', alignItems:'center', gap:6, margin:'6px 0' },
  divLine: { flex:1, height:1, background:'linear-gradient(90deg,transparent,#8B6914,transparent)' },
  divLeaf: { color:'#8B6914', fontSize:14 },
  toastDesc: { fontSize:12, color:'#5a3e10', lineHeight:1.5 },
}

const mb = {
  overlay: {
    position:'fixed', inset:0, zIndex:1500,
    background:'rgba(10,8,5,0.82)', backdropFilter:'blur(4px)',
    display:'flex', alignItems:'center', justifyContent:'center',
    animation:'fadeIn 0.2s ease',
  },
  panel: {
    position:'relative',
    background:'linear-gradient(160deg, #fdf3d0 0%, #f5e4a8 40%, #ede0a0 100%)',
    border:'3px solid #8B6914',
    borderRadius:12,
    padding:'28px 28px 24px',
    width:'min(640px, 94vw)',
    maxHeight:'85vh', overflowY:'auto',
    boxShadow:'0 0 0 6px #c9a227, 0 0 0 9px #8B6914, 0 24px 80px rgba(0,0,0,0.7)',
    animation:'popIn 0.3s cubic-bezier(0.175,0.885,0.32,1.275)',
    fontFamily:"'Palatino Linotype', serif",
  },
  corner: {
    position:'absolute', width:18, height:18,
    border:'2px solid #8B6914', pointerEvents:'none',
    borderRight:'none', borderBottom:'none',
  },
  header: { textAlign:'center', marginBottom:20 },
  iconBadge: {
    fontSize:36, display:'inline-block',
    background:'linear-gradient(135deg,#f5c842,#c9a227)',
    borderRadius:'50%', width:60, height:60,
    lineHeight:'60px', border:'3px solid #8B6914',
    boxShadow:'0 0 20px rgba(197,162,39,0.5)', marginBottom:10,
  },
  divRow: { display:'flex', alignItems:'center', gap:8, margin:'6px 0' },
  divLine: { flex:1, height:1, background:'linear-gradient(90deg,transparent,#8B6914,transparent)' },
  leaf: { color:'#8B6914', fontSize:16 },
  title: { margin:'8px 0 4px', fontSize:24, fontWeight:800, letterSpacing:3, textTransform:'uppercase', color:'#3d2800' },
  subtitle: { fontSize:13, color:'#7a5c1e', margin:'4px 0 8px' },
  progressBg: { height:6, background:'#c9a22744', borderRadius:3, margin:'4px 0 0' },
  progressFill: { height:'100%', background:'linear-gradient(90deg,#c9a227,#f5c842)', borderRadius:3, transition:'width 0.6s ease' },
  grid: { display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:12, marginTop:4 },
  card: {
    background:'rgba(139,105,20,0.08)', border:'1.5px solid #c9a22766',
    borderRadius:8, padding:'14px 12px', textAlign:'center',
    boxShadow:'0 2px 8px rgba(0,0,0,0.1)',
  },
  cardIcon: { width:52, height:52, borderRadius:'50%', display:'inline-flex', alignItems:'center', justifyContent:'center', marginBottom:8 },
  cardName: { fontSize:14, fontWeight:800, color:'#3d2800', marginBottom:3 },
  cardCategory: { fontSize:10, letterSpacing:0.8, textTransform:'uppercase', marginBottom:6 },
  cardDesc: { fontSize:11, color:'#5a3e10', lineHeight:1.5 },
  cardHint: { fontSize:10, color:'#8B6914aa', fontStyle:'italic' },
  closeBtn: {
    display:'block', margin:'20px auto 0', padding:'8px 28px',
    background:'linear-gradient(135deg,#8B6914,#c9a227)',
    border:'2px solid #5c4209', borderRadius:6,
    color:'#fdf3d0', fontFamily:"'Palatino Linotype', serif",
    fontWeight:700, fontSize:13, letterSpacing:1,
    textTransform:'uppercase', cursor:'pointer',
    boxShadow:'0 3px 10px rgba(0,0,0,0.3)',
  },
}