import { useState, useRef, useEffect, useCallback } from 'react'

// ── Draggable window hook ──────────────────────────────────────────────────
function useDrag(windowRef, headerRef, maximized, onFocus) {
  const dragRef = useRef(null)
  useEffect(() => {
    if (maximized) return
    const header = headerRef.current
    if (!header) return
    const onDown = (e) => {
      onFocus()
      const rect = windowRef.current.getBoundingClientRect()
      dragRef.current = { startX: e.clientX - rect.left, startY: e.clientY - rect.top }
    }
    const onMove = (e) => {
      if (!dragRef.current) return
      windowRef.current.style.left = (e.clientX - dragRef.current.startX) + 'px'
      windowRef.current.style.top  = (e.clientY - dragRef.current.startY) + 'px'
    }
    const onUp = () => { dragRef.current = null }
    header.addEventListener('mousedown', onDown)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      header.removeEventListener('mousedown', onDown)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [maximized])
}

// ── Window chrome wrapper ──────────────────────────────────────────────────
function AppWindow({ title, icon, iconImg, onClose, onFocus, onMinimize, minimized, defaultPos, zIndex, width, height, children }) {
  const [maximized, setMaximized] = useState(false)
  const windowRef = useRef()
  const headerRef = useRef()
  useDrag(windowRef, headerRef, maximized, onFocus)

  if (minimized) return null

  return (
    <div
      ref={windowRef}
      onMouseDown={onFocus}
      style={{
        ...win.window,
        ...(maximized
          ? win.maximized
          : { left: defaultPos.x, top: defaultPos.y, width: width || 520, height: height || 420 }),
        zIndex,
      }}
    >
      <div ref={headerRef} style={win.titleBar}>
        <div style={win.titleLeft}>
          {iconImg
            ? <img src={iconImg} style={{width:16,height:16,borderRadius:3,objectFit:'cover'}} alt="" />
            : <span style={win.titleIcon}>{icon}</span>}
          <span style={win.titleText}>{title}</span>
        </div>
        <div style={win.titleBtns}>
          <button style={{...win.winBtn, background:'#3a3a4a'}}
            onClick={(e)=>{e.stopPropagation();onMinimize()}} title="Minimize">─</button>
          <button style={{...win.winBtn, background:maximized?'#3d5a99':'#3a3a4a'}}
            onClick={(e)=>{e.stopPropagation();setMaximized(v=>!v)}} title="Maximize">□</button>
          <button style={{...win.winBtn, background:'#c0392b'}}
            onClick={(e)=>{e.stopPropagation();onClose()}} title="Close">✕</button>
        </div>
      </div>
      <div style={{flex:1,overflow:'hidden',display:'flex',flexDirection:'column'}}>
        {children}
      </div>
    </div>
  )
}

// ── Notepad ────────────────────────────────────────────────────────────────
function Notepad({ onClose, onFocus, onMinimize, minimized, initialContent='', title='Untitled.txt', defaultPos, zIndex }) {
  const [text, setText] = useState(initialContent)
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0
  const lineCount = text.split('\n').length
  return (
    <AppWindow title={title} icon="📝" onClose={onClose} onFocus={onFocus}
      onMinimize={onMinimize} minimized={minimized}
      defaultPos={defaultPos} zIndex={zIndex} width={520} height={420}>
      <style>{`.np-ta::-webkit-scrollbar{width:8px}.np-ta::-webkit-scrollbar-track{background:#1a1a2e}.np-ta::-webkit-scrollbar-thumb{background:#3d5a99;border-radius:4px}.np-ta:focus{outline:none}.np-mi:hover{background:rgba(255,255,255,0.08)}.np-tb:hover{background:rgba(255,255,255,0.12)}`}</style>
      <div style={np.menuBar}>{['File','Edit','Format','View','Help'].map(m=><div key={m} className="np-mi" style={np.menuItem}>{m}</div>)}</div>
      <div style={np.toolbar}>
        <button className="np-tb" style={np.tbBtn} onClick={()=>setText('')}>🗋 New</button>
        <div style={np.tbSep}/>
        <button className="np-tb" style={np.tbBtn} onClick={()=>navigator.clipboard?.writeText(text)}>📋 Copy</button>
        <button className="np-tb" style={np.tbBtn} onClick={()=>setText('')}>🗑 Clear</button>
        <div style={np.tbSep}/>
        <span style={np.tbInfo}>{lineCount} lines · {wordCount} words · {text.length} chars</span>
      </div>
      <textarea className="np-ta" style={np.textarea} value={text} onChange={e=>setText(e.target.value)} spellCheck/>
      <div style={np.statusBar}>
        <span>Ln {lineCount}, Col 1</span>
        <span style={{marginLeft:'auto'}}>UTF-8 · Plain Text</span>
      </div>
    </AppWindow>
  )
}

// ── My Computer ────────────────────────────────────────────────────────────
const DRIVES = [
  {icon:'💾',label:'Local Disk (C:)', size:'256 GB SSD',free:'189 GB free',pct:'26%',color:'#3d99f5'},
  {icon:'📀',label:'Data Drive (D:)', size:'1 TB HDD',  free:'642 GB free',pct:'36%',color:'#27ae60'},
  {icon:'💿',label:'USB Drive (E:)',  size:'32 GB',     free:'18 GB free', pct:'44%',color:'#e67e22'},
  {icon:'🌐',label:'Network (Z:)',    size:'Cloud',     free:'Unlimited',  pct:'10%',color:'#8e44ad'},
]
const SYSINFO = [
  {k:'OS',    v:'PortfolioOS 1.0'},
  {k:'CPU',   v:'Intel Core i5 11th Gen'},
  {k:'RAM',   v:'8 GB DDR4'},
  {k:'GPU',   v:'NVIDIA GTX 1650'},
  {k:'Owner', v:'CS Engineer 2022–2026'},
  {k:'Build', v:'v1.0.0-portfolio'},
]
function MyComputer({ onClose, onFocus, onMinimize, minimized, defaultPos, zIndex }) {
  const [tab, setTab] = useState('drives')
  return (
    <AppWindow title="My Computer" icon="🖥️" onClose={onClose} onFocus={onFocus}
      onMinimize={onMinimize} minimized={minimized}
      defaultPos={defaultPos} zIndex={zIndex} width={560} height={440}>
      <style>{`.mc-tab:hover{background:rgba(255,255,255,0.08)!important}.mc-drive:hover{background:rgba(255,255,255,0.07)!important;transform:translateY(-1px)}`}</style>
      <div style={mc.tabBar}>
        {[['drives','💾 Drives'],['system','ℹ️ System']].map(([k,l])=>(
          <div key={k} className="mc-tab" onClick={()=>setTab(k)}
            style={{...mc.tab,...(tab===k?mc.tabActive:{})}}>
            {l}
          </div>
        ))}
      </div>
      <div style={mc.body}>
        {tab==='drives' && (
          <div style={mc.driveGrid}>
            {DRIVES.map(d=>(
              <div key={d.label} className="mc-drive" style={mc.driveCard}>
                <div style={{fontSize:32,marginBottom:8}}>{d.icon}</div>
                <div style={{fontSize:13,color:'#cdd6f4',fontWeight:600,marginBottom:2}}>{d.label}</div>
                <div style={{fontSize:11,color:'#6c7086',marginBottom:8}}>{d.size}</div>
                <div style={mc.bar}><div style={{...mc.barFill,background:d.color,width:d.pct}}/></div>
                <div style={{fontSize:10,color:'#888',marginTop:4}}>{d.free}</div>
              </div>
            ))}
          </div>
        )}
        {tab==='system' && (
          <div style={mc.sysTable}>
            <div style={mc.sysTitle}>⚙️ System Information</div>
            {SYSINFO.map(r=>(
              <div key={r.k} style={mc.sysRow}>
                <span style={mc.sysKey}>{r.k}</span>
                <span style={mc.sysVal}>{r.v}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppWindow>
  )
}
const mc = {
  tabBar:{display:'flex',background:'#252535',borderBottom:'1px solid #313244',flexShrink:0},
  tab:{padding:'8px 20px',fontSize:12,color:'#888',cursor:'pointer',transition:'background 0.1s',userSelect:'none'},
  tabActive:{color:'#5dade2',borderBottom:'2px solid #5dade2',background:'rgba(93,173,226,0.08)'},
  body:{flex:1,overflow:'auto',padding:20,background:'#1a1a2e'},
  driveGrid:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16},
  driveCard:{background:'#252535',border:'1px solid #313244',borderRadius:10,padding:16,cursor:'default',transition:'all 0.15s'},
  bar:{height:6,borderRadius:3,background:'#2a2a3e',overflow:'hidden'},
  barFill:{height:'100%',borderRadius:3},
  sysTable:{background:'#252535',borderRadius:10,padding:20,border:'1px solid #313244'},
  sysTitle:{fontSize:14,color:'#5dade2',fontWeight:700,marginBottom:16},
  sysRow:{display:'flex',padding:'8px 0',borderBottom:'1px solid rgba(255,255,255,0.05)'},
  sysKey:{width:100,fontSize:12,color:'#6c7086',flexShrink:0},
  sysVal:{fontSize:12,color:'#cdd6f4'},
}

// ── Browser ────────────────────────────────────────────────────────────────
const BOOKMARKS = [
  {icon:'🐙',label:'GitHub',      url:'github.com/yourusername',     color:'#6e40c9'},
  {icon:'💼',label:'LinkedIn',    url:'linkedin.com/in/yourprofile', color:'#0077b5'},
  {icon:'🎮',label:'itch.io',     url:'itch.io/yourusername',        color:'#fa5c5c'},
  {icon:'📺',label:'YouTube',     url:'youtube.com',                 color:'#ff0000'},
  {icon:'🔷',label:'React Docs',  url:'react.dev',                   color:'#61dafb'},
  {icon:'🟩',label:'Three.js',    url:'threejs.org',                 color:'#049ef4'},
]
function Browser({ onClose, onFocus, onMinimize, minimized, defaultPos, zIndex }) {
  const [urlBar, setUrlBar] = useState('portfolio://home')
  const [page,   setPage]   = useState('home')
  const go = (url) => { setUrlBar(url); setPage('blocked') }
  return (
    <AppWindow title="Portfolio Browser" icon="🌐" onClose={onClose} onFocus={onFocus}
      onMinimize={onMinimize} minimized={minimized}
      defaultPos={defaultPos} zIndex={zIndex} width={640} height={480}>
      <style>{`.bm-card:hover{background:rgba(255,255,255,0.08)!important;transform:translateY(-2px)}`}</style>
      <div style={br.toolbar}>
        <button style={br.navBtn} onClick={()=>{setUrlBar('portfolio://home');setPage('home')}}>◀</button>
        <button style={br.navBtn}>▶</button>
        <button style={br.navBtn} onClick={()=>{setUrlBar('portfolio://home');setPage('home')}}>🏠</button>
        <div style={br.urlWrap}>
          <span style={{fontSize:12,color:'#6c7086',marginRight:6}}>🔒</span>
          <input style={br.urlInput} value={urlBar}
            onChange={e=>setUrlBar(e.target.value)}
            onKeyDown={e=>{if(e.key==='Enter')go(urlBar)}}/>
        </div>
        <button style={br.navBtn} onClick={()=>go(urlBar)}>↻</button>
      </div>
      <div style={br.page}>
        {page==='home' && (
          <div>
            <div style={br.heroTitle}>🌐 Portfolio Browser</div>
            <div style={br.heroSub}>Quick Links — double-click to visit</div>
            <div style={br.bookmarkGrid}>
              {BOOKMARKS.map(b=>(
                <div key={b.label} className="bm-card" style={br.bookmarkCard} onClick={()=>go(b.url)}>
                  <div style={{...br.bmIcon,background:b.color+'22',border:`1px solid ${b.color}44`}}>
                    <span style={{fontSize:22}}>{b.icon}</span>
                  </div>
                  <div style={br.bmLabel}>{b.label}</div>
                  <div style={br.bmUrl}>{b.url}</div>
                </div>
              ))}
            </div>
          </div>
        )}
        {page==='blocked' && (
          <div style={br.blocked}>
            <div style={{fontSize:48,marginBottom:16}}>🚫</div>
            <div style={{fontSize:20,color:'#ff6b6b',fontWeight:700,marginBottom:8}}>Cannot connect to internet</div>
            <div style={{fontSize:13,color:'#6c7086',marginBottom:20}}>
              This is a portfolio OS running inside a 3D scene.<br/>External browsing is not available here 😄
            </div>
            <div style={br.errorUrl}>{urlBar}</div>
            <button style={br.homeBtn} onClick={()=>{setUrlBar('portfolio://home');setPage('home')}}>← Back to Home</button>
          </div>
        )}
      </div>
    </AppWindow>
  )
}
const br = {
  toolbar:{display:'flex',alignItems:'center',gap:6,padding:'6px 10px',background:'#252535',borderBottom:'1px solid #313244',flexShrink:0},
  navBtn:{background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:5,color:'#bac2de',fontSize:13,width:28,height:26,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'inherit'},
  urlWrap:{flex:1,display:'flex',alignItems:'center',background:'#1a1a2e',border:'1px solid #313244',borderRadius:6,padding:'0 10px',height:26},
  urlInput:{flex:1,background:'transparent',border:'none',outline:'none',color:'#cdd6f4',fontSize:12,fontFamily:'inherit'},
  page:{flex:1,overflow:'auto',padding:24,background:'#13131f'},
  heroTitle:{fontSize:20,fontWeight:700,color:'#5dade2',marginBottom:4},
  heroSub:{fontSize:12,color:'#6c7086',marginBottom:20},
  bookmarkGrid:{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12},
  bookmarkCard:{background:'#252535',border:'1px solid #313244',borderRadius:10,padding:14,cursor:'pointer',transition:'all 0.15s'},
  bmIcon:{width:44,height:44,borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',marginBottom:8},
  bmLabel:{fontSize:13,color:'#cdd6f4',fontWeight:600,marginBottom:2},
  bmUrl:{fontSize:10,color:'#6c7086',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'},
  blocked:{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',textAlign:'center',padding:40,color:'#cdd6f4',fontFamily:'inherit'},
  errorUrl:{background:'#252535',border:'1px solid #313244',borderRadius:6,padding:'6px 16px',fontSize:12,color:'#6c7086',marginBottom:20,fontFamily:'monospace'},
  homeBtn:{background:'#3d5a99',border:'none',borderRadius:8,color:'#fff',fontSize:13,padding:'8px 20px',cursor:'pointer',fontFamily:'inherit'},
}

// ── Flappy Bird ────────────────────────────────────────────────────────────
function FlappyBird({ onClose, onFocus, onMinimize, minimized, defaultPos, zIndex }) {
  const canvasRef = useRef()
  useEffect(()=>{
    const canvas=canvasRef.current; if(!canvas)return
    const ctx=canvas.getContext('2d')
    const FPS=40,JUMP=-8,MAX_FALL=10,ACCEL=1,PS=-2,W=320,H=480
    function ms(src){const img=new Image();if(src)img.src=src;return{x:0,y:0,visible:true,vx:0,vy:0,angle:0,flipV:false,img}}
    function ds(s){
      if(!s.visible){s.x+=s.vx;s.y+=s.vy;return}
      ctx.save();ctx.translate(s.x+s.img.width/2,s.y+s.img.height/2);ctx.rotate(s.angle*Math.PI/180)
      if(s.flipV)ctx.scale(1,-1);ctx.drawImage(s.img,-s.img.width/2,-s.img.height/2);ctx.restore();s.x+=s.vx;s.y+=s.vy
    }
    function hit(a,b){
      if(!a.visible||!b.visible)return false
      if(a.x>=b.x+b.img.width||a.x+a.img.width<=b.x)return false
      if(a.y>=b.y+b.img.height||a.y+a.img.height<=b.y)return false;return true
    }
    const bg=new Image();bg.src='https://s2js.com/img/etc/flappyback.png'
    const bar=new Image();bar.src='https://s2js.com/img/etc/flappybottom.png'
    const pi=new Image();pi.src='https://s2js.com/img/etc/flappypipe.png'
    const bird=ms('https://s2js.com/img/etc/flappybird.png');bird.x=W/3;bird.y=H/2
    let pipes=[],mode='prestart',bo=0,lr=null
    function ap(x,t,g){
      const tp=ms();tp.img=pi;tp.x=x;tp.y=t-pi.height;tp.vx=PS;pipes.push(tp)
      const bp=ms();bp.img=pi;bp.flipV=true;bp.x=x;bp.y=t+g;bp.vx=PS;pipes.push(bp)
    }
    function aa(){
      ap(500,100,140);ap(800,50,140);ap(1000,250,140);ap(1200,150,120);ap(1600,100,120)
      ap(1800,150,120);ap(2000,200,120);ap(2200,250,120);ap(2400,30,100);ap(2700,300,100)
      ap(3000,100,80);ap(3300,250,80);ap(3600,50,60)
      const fin=ms('https://s2js.com/img/etc/flappyend.png');fin.x=3900;fin.vx=PS;pipes.push(fin)
    }
    pi.onload=aa
    function reset(){bird.y=H/2;bird.vy=0;bird.angle=0;pipes=[];aa()}
    function onInput(e){
      if(mode==='prestart')mode='running'
      else if(mode==='running')bird.vy=JUMP
      else if(mode==='over'&&new Date()-lr>1000){reset();mode='running'}
      e.stopPropagation()
    }
    canvas.addEventListener('mousedown',onInput);canvas.addEventListener('touchstart',onInput)
    const id=setInterval(()=>{
      if(bg.complete)ctx.drawImage(bg,0,0,W,H);else{ctx.fillStyle='#70c5ce';ctx.fillRect(0,0,W,H)}
      ds(bird)
      if(bar.complete){if(bo<-23)bo=0;ctx.drawImage(bar,bo,H-bar.height)}
      if(mode==='prestart'){
        ctx.fillStyle='rgba(0,0,0,0.45)';ctx.fillRect(W/2-130,H/4-28,260,40)
        ctx.font='15px Arial';ctx.fillStyle='#fff';ctx.textAlign='center'
        ctx.fillText('Click or tap to start!',W/2,H/4)
      }
      if(mode==='running'){
        lr=new Date();bo+=PS;pipes.forEach(p=>ds(p))
        if(bird.vy<0)bird.angle=-15;else if(bird.angle<70)bird.angle+=4
        if(bird.vy<MAX_FALL)bird.vy+=ACCEL
        if(bird.y>H-bird.img.height||bird.y<-bird.img.height){bird.vy=0;mode='over'}
        pipes.forEach(p=>{if(hit(bird,p))mode='over'})
      }
      if(mode==='over'){
        pipes.forEach(p=>ds(p))
        if(bird.vy<MAX_FALL)bird.vy+=ACCEL;if(bird.y>H-bird.img.height)bird.vy=0
        let sc=0;pipes.forEach(p=>{if(p.x<bird.x)sc+=0.5})
        ctx.fillStyle='rgba(0,0,0,0.55)';ctx.fillRect(W/2-120,70,240,145)
        ctx.font='bold 24px Arial';ctx.fillStyle='#ff4444';ctx.textAlign='center'
        ctx.fillText('Game Over',W/2,106);ctx.font='18px Arial';ctx.fillStyle='#fff'
        ctx.fillText('Score: '+Math.floor(sc),W/2,140);ctx.font='12px Arial';ctx.fillStyle='#ccc'
        ctx.fillText('Click / tap to play again',W/2,190)
      }
    },1000/FPS)
    return()=>{clearInterval(id);canvas.removeEventListener('mousedown',onInput);canvas.removeEventListener('touchstart',onInput)}
  },[])
  return (
    <AppWindow title="FlappyBird.exe" icon="🐦" onClose={onClose} onFocus={onFocus}
      onMinimize={onMinimize} minimized={minimized}
      defaultPos={defaultPos} zIndex={zIndex} width={348} height={546}>
      <div style={{flex:1,display:'flex',justifyContent:'center',alignItems:'center',background:'#1a1a2e'}}>
        <canvas ref={canvasRef} width={320} height={480} style={{display:'block',cursor:'pointer'}}/>
      </div>
    </AppWindow>
  )
}

// ── AOE Fake Game ──────────────────────────────────────────────────────────
function AoeGame({ onClose, onFocus, onMinimize, minimized, defaultPos, zIndex }) {
  const [screen, setScreen] = useState('menu') // menu | loading | playing
  const [progress, setProgress] = useState(0)
  const [tip, setTip] = useState(0)
  const TIPS = [
    'Tip: Always build a Town Center first.',
    'Tip: Wood is the most valuable early resource.',
    'Tip: Scout your surroundings before expanding.',
    'Tip: A mix of units beats a single type.',
    'Tip: Walls can save your civilization!',
  ]
  useEffect(()=>{
    if(screen!=='loading')return
    setProgress(0)
    const id=setInterval(()=>{
      setProgress(p=>{
        if(p>=100){clearInterval(id);setScreen('playing');return 100}
        setTip(Math.floor(Math.random()*TIPS.length))
        return p+2
      })
    },60)
    return()=>clearInterval(id)
  },[screen])

  return (
    <AppWindow title="Age of Empires II" iconImg="/aoe_icon.png" onClose={onClose} onFocus={onFocus}
      onMinimize={onMinimize} minimized={minimized}
      defaultPos={defaultPos} zIndex={zIndex} width={580} height={460}>
      <div style={{flex:1,background:'#0a0a0a',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',position:'relative',overflow:'hidden'}}>
        {/* bg texture */}
        <div style={{position:'absolute',inset:0,background:'radial-gradient(ellipse at 30% 40%,#1a0f00 0%,#0a0800 60%,#000 100%)',opacity:0.95}}/>
        <div style={{position:'absolute',inset:0,backgroundImage:'repeating-linear-gradient(0deg,transparent,transparent 40px,rgba(139,100,20,0.03) 40px,rgba(139,100,20,0.03) 41px),repeating-linear-gradient(90deg,transparent,transparent 40px,rgba(139,100,20,0.03) 40px,rgba(139,100,20,0.03) 41px)'}}/>

        {screen==='menu' && (
          <div style={{position:'relative',zIndex:1,textAlign:'center',fontFamily:'Georgia,serif'}}>
            <img src="/aoe_icon.png" alt="AOE" style={{width:80,height:80,marginBottom:16,filter:'drop-shadow(0 0 20px rgba(255,180,0,0.6))',borderRadius:8}}
              onError={e=>e.target.style.display='none'}/>
            <div style={{fontSize:26,fontWeight:700,color:'#d4a017',textShadow:'0 0 20px rgba(212,160,23,0.8)',marginBottom:4,letterSpacing:2}}>
              AGE OF EMPIRES II
            </div>
            <div style={{fontSize:12,color:'#8a7040',marginBottom:32,letterSpacing:4}}>THE CONQUERORS</div>
            <div style={{display:'flex',flexDirection:'column',gap:10,alignItems:'center', color: '#ffffff'}}>Back then it was one of my favourite games.
            </div>
          </div>
        )}
      </div>
    </AppWindow>
  )
}
const aoe = {
  menuBtn:{background:'rgba(139,100,20,0.15)',border:'1px solid rgba(139,100,20,0.4)',borderRadius:4,color:'#c8a84b',fontSize:13,padding:'8px 28px',cursor:'pointer',fontFamily:'Georgia,serif',transition:'all 0.15s',width:200,textAlign:'left'},
  menuBtnPrimary:{background:'rgba(180,130,20,0.25)',border:'1px solid rgba(212,160,23,0.6)',color:'#d4a017'},
}

// ── IGI Fake Game ──────────────────────────────────────────────────────────
function IgiGame({ onClose, onFocus, onMinimize, minimized, defaultPos, zIndex }) {
  const [screen, setScreen] = useState('menu')
  const [progress, setProgress] = useState(0)
  const MISSIONS = [
    {n:'Mission 1',t:'Trainyard',d:'Infiltrate the trainyard and steal the manifest.'},
    {n:'Mission 2',t:'Military Airbase',d:'Locate and destroy the helicopter.'},
    {n:'Mission 3',t:'Border Crossing',d:'Cross the border undetected.'},
    {n:'Mission 4',t:'SAM Base',d:'Disable the surface-to-air missile battery.'},
  ]
  useEffect(()=>{
    if(screen!=='loading')return
    setProgress(0)
    const id=setInterval(()=>setProgress(p=>{
      if(p>=100){clearInterval(id);setScreen('playing');return 100}
      return p+3
    }),50)
    return()=>clearInterval(id)
  },[screen])

  return (
    <AppWindow title="I.G.I. - I'm Going In" iconImg="/igi_icon.png" onClose={onClose} onFocus={onFocus}
      onMinimize={onMinimize} minimized={minimized}
      defaultPos={defaultPos} zIndex={zIndex} width={580} height={460}>
      <div style={{flex:1,background:'#000',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',inset:0,background:'radial-gradient(ellipse at 50% 30%,#001a00 0%,#000800 50%,#000 100%)'}}/>
        {/* scanlines */}
        <div style={{position:'absolute',inset:0,backgroundImage:'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,255,0,0.015) 2px,rgba(0,255,0,0.015) 4px)',pointerEvents:'none'}}/>

        {screen==='menu' && (
          <div style={{position:'relative',zIndex:1,textAlign:'center',fontFamily:'monospace'}}>
            <img src="/igi_icon.png" alt="IGI" style={{width:72,height:72,marginBottom:16,filter:'drop-shadow(0 0 16px rgba(0,255,0,0.5))',borderRadius:6}}
              onError={e=>e.target.style.display='none'}/>
            <div style={{fontSize:24,fontWeight:700,color:'#00ff41',textShadow:'0 0 16px rgba(0,255,65,0.7)',marginBottom:2,letterSpacing:3}}>
              I.G.I.
            </div>
            <div style={{fontSize:11,color:'#005a14',marginBottom:28,letterSpacing:5}}>I'M GOING IN</div>
            <div style={{display:'flex',flexDirection:'column',gap:8,alignItems:'center', color: '#ffffff', padding: '40px'}}>
              It was my first FPS game and I loved the realistic military setting and stealth gameplay. The missions were so memorable that I still remember the objectives of each one after all these years!
            </div>
          </div>
        )}
      </div>
    </AppWindow>
  )
}
const igi = {
  menuBtn:{background:'rgba(0,255,65,0.07)',border:'1px solid rgba(0,255,65,0.25)',borderRadius:2,color:'#00cc33',fontSize:12,padding:'7px 24px',cursor:'pointer',fontFamily:'monospace',transition:'all 0.15s',width:190,textAlign:'left',letterSpacing:1},
}

// ── Initial apps ───────────────────────────────────────────────────────────
const INITIAL_APPS = [
  {id:'notepad-welcome',type:'notepad',title:'Welcome.txt',defaultPos:{x:560,y:60},zIndex:102,minimized:false,
    content:`Welcome to my Portfolio!  👋\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nHi Aditya this side ,I am a Computer Science Engineer\nMy background spans across:\n  →  Web Development\n  →  Game Development\n  →  AI Development  (currently learning)\n\nFeel free to explore around the room!\nDouble-click the desktop icons to open apps.`},
  {id:'notepad-story-1',type:'notepad',title:'MyStory_Part1.txt',defaultPos:{x:380,y:120},zIndex:101,minimized:false,
    content:`A Little Backstory...  🎮\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nI had quite an interest in games when I was a child.\n\nBut back then I had absolutely no idea how games\nactually worked under the hood.\nI just played them for fun.\n\nBut since I was from a middle-class family —\nyou know how it is...  strict parents, right? 😄\n\nGaming was always seen as a distraction,\nnever as something you could build a future on.\n\nLittle did anyone know...`},
  {id:'notepad-story-2',type:'notepad',title:'MyStory_Part2.txt',defaultPos:{x:200,y:180},zIndex:100,minimized:false,
    content:`The Journey  🚀\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nAlthough I was a good student in secondary and\nhigher secondary school, when I chose Computer\nScience Engineering I had zero coding knowledge.\n\nGradually I started learning by watching my friends.\nBut after some time... I completely lost track.\n\nI was like a fish out of water. 🐟\n\nSo I took a break and went back to playing games.\n\nAnd then it hit me —\n\n  "If I can MAKE games, I get two things at once:\n    1.  I'll learn by understanding concepts.\n    2.  I'll never get bored doing it."\n\nThat realization changed everything for me.\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nYeah... that was my story. 😄\nHope you liked it!  🙏\n\n         — Thank you for reading!`},
]

const DESKTOP_ICONS = (openApp) => [
  {icon:<i className="fa fa-file-text-o" style={{ color: "white" }}></i>,      img:null,           label:'Notepad',      action:()=>openApp('notepad')},
  {icon:<i className="fa fa-desktop" style={{ color: "white" }}></i>,      img:null,           label:'My Computer',  action:()=>openApp('mycomputer')},
  {icon:<i className="fa fa-chrome" style={{ color: "white" }}></i>,      img:null,           label:'Browser',      action:()=>openApp('browser')},
  {icon:'null',      img:'/flappy-bird-icon.png',           label:'FlappyBird',   action:()=>openApp('flappy')},
  {icon:null,      img:'/aoe_icon.png',label:'Age of Empires',action:()=>openApp('aoe')},
  {icon:null,      img:'/igi_icon.png', label:'I.G.I.',       action:()=>openApp('igi')},
]

// ── Desktop / OS Shell ─────────────────────────────────────────────────────
export default function ScreenOS({ onExit }) {
  const [apps, setApps]   = useState(INITIAL_APPS)
  const topZRef           = useRef(103)
  const time              = useCurrentTime()

  const bringToFront = useCallback((id) => {
    topZRef.current += 1
    const z = topZRef.current
    setApps(prev => prev.map(a => a.id===id ? {...a, zIndex:z, minimized:false} : a))
  }, [])

  const setMinimized = (id, val) =>
    setApps(prev => prev.map(a => a.id===id ? {...a, minimized:val} : a))

  function openApp(type, extra={}) {
    const singletons = ['mycomputer','browser','flappy','aoe','igi']
    if (singletons.includes(type)) {
      const ex = apps.find(a=>a.type===type)
      if (ex) { bringToFront(ex.id); return }
    }
    topZRef.current += 1
    const POS = {
      notepad:    {x:80+Math.random()*120, y:50+Math.random()*80},
      flappy:     {x:340, y:60},
      mycomputer: {x:200, y:80},
      browser:    {x:160, y:60},
      aoe:        {x:180, y:70},
      igi:        {x:220, y:80},
    }
    setApps(v=>[...v,{
      id:`${type}-${Date.now()}`, type,
      zIndex:topZRef.current, minimized:false,
      defaultPos: POS[type]||{x:100,y:80},
      title: type==='notepad'?'Untitled.txt':undefined,
      content: type==='notepad'?'':undefined,
      ...extra,
    }])
  }

  function closeApp(id) { setApps(v=>v.filter(a=>a.id!==id)) }

  const minimizedApps = apps.filter(a=>a.minimized)

  const APP_LABEL = { notepad:'📝', flappy:'🐦', mycomputer:'🖥️', browser:'🌐', aoe:'⚔️', igi:'🔫' }

  return (
    <div style={os.shell}>
      <style>{`
        @keyframes desktopIn{from{opacity:0}to{opacity:1}}
        @keyframes winOpen{from{opacity:0;transform:scale(0.94)}to{opacity:1;transform:scale(1)}}
        .dock-icon:hover{transform:scale(1.18) translateY(-6px)!important;box-shadow:0 8px 24px rgba(0,0,0,0.5)}
        .exit-btn:hover{background:rgba(255,80,80,0.25)!important;color:#ff6b6b!important}
        .desk-icon:hover{background:rgba(255,255,255,0.08)!important}
        .tb-btn:hover{background:rgba(255,255,255,0.15)!important}
      `}</style>

      <div style={os.wallpaper}/>

      {/* Topbar */}
      <div style={os.topbar}>
        <span style={os.topbarLogo}>◈ PortfolioOS</span>
        <div style={os.topbarCenter}>
          <span style={os.topbarItem}>File</span>
          <span style={os.topbarItem}>Edit</span>
          <span style={os.topbarItem}>View</span>
        </div>
        <div style={os.topbarRight}>
          <span style={os.topbarClock}>{time}</span>
          <button className="exit-btn" style={os.exitBtn} onClick={onExit}><span className='fa'>&#xf011;</span></button>
        </div>
      </div>

      {/* Desktop icons */}
      <div style={os.desktopIcons}>
        {DESKTOP_ICONS(openApp, onExit).map(d=>(
          <div key={d.label} className="desk-icon" style={os.desktopIcon} onDoubleClick={d.action}>
            {d.img
              ? <img src={d.img} style={os.desktopIconImgSrc} alt={d.label}
                  onError={e=>{e.target.style.display='none';e.target.nextSibling.style.display='block'}}/>
              : null}
            {d.icon
              ? <div style={{...os.desktopIconImg, display: d.img ? 'none':'block'}}>{d.icon}</div>
              : <div style={{...os.desktopIconImg, display:'none'}}>📄</div>}
            <div style={os.desktopIconLabel}>{d.label}</div>
          </div>
        ))}
      </div>

      {/* App windows */}
      {apps.map(app=>{
        const shared = {
          key:app.id, onClose:()=>closeApp(app.id),
          onFocus:()=>bringToFront(app.id),
          onMinimize:()=>setMinimized(app.id,true),
          minimized:app.minimized,
          defaultPos:app.defaultPos||{x:80,y:60},
          zIndex:app.zIndex||100,
        }
        if(app.type==='notepad')    return <Notepad    {...shared} initialContent={app.content||''} title={app.title||'Untitled.txt'}/>
        if(app.type==='flappy')     return <FlappyBird {...shared}/>
        if(app.type==='mycomputer') return <MyComputer {...shared}/>
        if(app.type==='browser')    return <Browser    {...shared}/>
        if(app.type==='aoe')        return <AoeGame    {...shared}/>
        if(app.type==='igi')        return <IgiGame    {...shared}/>
        return null
      })}

      {/* ── Taskbar (always visible at bottom, above dock) ── */}
      <div style={os.taskbar}>
        {minimizedApps.length === 0
          ? null
          : minimizedApps.map(a=>(
            <button key={a.id} className="tb-btn" style={os.tbBtn}
              onClick={()=>bringToFront(a.id)}>
              <span style={{fontSize:14}}>{APP_LABEL[a.type]||'📄'}</span>
              <span style={{maxWidth:100,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',fontSize:11}}>
                {a.title || a.type}
              </span>
            </button>
          ))
        }
      </div>

      {/* Dock */}
      <div style={os.dock}>
        <div className="dock-icon" style={os.dockIcon} onDoubleClick={()=>openApp('notepad')} title="Notepad"><i class="fa fa-file-text-o" aria-hidden="true" style={{color: 'white'}}></i></div>
        <div style={os.dockSep}/>
        <div className="dock-icon" style={os.dockIcon} onDoubleClick={()=>openApp('mycomputer')} title="My Computer"><i class="fa fa-desktop" aria-hidden="true" style={{color: 'white'}}></i></div>
        <div className="dock-icon" style={os.dockIcon} onDoubleClick={()=>openApp('browser')} title="Browser"><i class="fa fa-chrome" aria-hidden="true" style={{color: 'white'}}></i></div>
        <div className="dock-icon" style={os.dockIcon} onDoubleClick={()=>openApp('flappy')} title="FlappyBird"><img src="/flappy-bird-icon.png" style={{width:36,height:36,borderRadius:8,objectFit:'cover'}} alt="AOE"
            onError={e=>{e.target.style.display='none';e.target.parentNode.innerHTML='⚔️'}}/></div>
        <div style={os.dockSep}/>
        <div className="dock-icon" style={{...os.dockIcon,padding:4}} onDoubleClick={()=>openApp('aoe')} title="Age of Empires">
          <img src="/aoe_icon.png" style={{width:36,height:36,borderRadius:8,objectFit:'cover'}} alt="AOE"
            onError={e=>{e.target.style.display='none';e.target.parentNode.innerHTML='⚔️'}}/>
        </div>
        <div className="dock-icon" style={{...os.dockIcon,padding:4}} onDoubleClick={()=>openApp('igi')} title="I.G.I.">
          <img src="/igi_icon.png" style={{width:36,height:36,borderRadius:8,objectFit:'cover'}} alt="IGI"
            onError={e=>{e.target.style.display='none';e.target.parentNode.innerHTML='🔫'}}/>
        </div>
        <div style={os.dockSep}/>
        <div className="dock-icon" style={{...os.dockIcon,fontSize:22}} onClick={onExit} title="Exit"><i className="fa fa-sign-out" aria-hidden="true" style={{color: 'white'}}></i></div>
      </div>
    </div>
  )
}

function useCurrentTime() {
  const [t,setT] = useState('')
  useEffect(()=>{
    const tick=()=>setT(new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}))
    tick();const id=setInterval(tick,1000);return()=>clearInterval(id)
  },[])
  return t
}

// ─── Styles ───────────────────────────────────────────────────────────────
const os = {
  shell:{position:'fixed',inset:0,overflow:'hidden',zIndex:3000,animation:'desktopIn 0.4s ease',fontFamily:"'Segoe UI',system-ui,sans-serif"},
  wallpaper:{position:'absolute',inset:0,background:'url(/wallpaper.jpg'},
  topbar:{position:'absolute',top:0,left:0,right:0,height:28,background:'rgba(10,16,28,0.88)',backdropFilter:'blur(20px)',borderBottom:'1px solid rgba(255,255,255,0.07)',display:'flex',alignItems:'center',padding:'0 16px',zIndex:9999,color:'#c8d6e5',fontSize:13},
  topbarLogo:{fontWeight:700,color:'#5dade2',letterSpacing:1,marginRight:24,fontSize:13},
  topbarCenter:{display:'flex',gap:4,flex:1,justifyContent:'center'},
  topbarItem:{padding:'2px 10px',borderRadius:4,cursor:'default',color:'#a8b8c8',fontSize:12},
  topbarRight:{display:'flex',alignItems:'center',gap:12},
  topbarClock:{color:'#a8b8c8',fontSize:12,fontVariantNumeric:'tabular-nums'},
  exitBtn:{background:'rgba(255,80,80,0.12)',border:'1px solid rgba(255,80,80,0.3)',borderRadius:5,color:'#ff8888',fontSize:11,padding:'2px 10px',cursor:'pointer',transition:'all 0.15s',fontFamily:'inherit'},
  desktopIcons:{position:'absolute',top:36,left:12,display:'flex',flexDirection:'column',gap:4,zIndex:50},
  desktopIcon:{display:'flex',flexDirection:'column',alignItems:'center',gap:3,cursor:'default',padding:'8px 6px',borderRadius:8,transition:'background 0.15s',userSelect:'none',width:76},
  desktopIconImgSrc:{width:40,height:40,borderRadius:8,objectFit:'cover',filter:'drop-shadow(0 2px 8px rgba(0,0,0,0.6))'},
  desktopIconImg:{fontSize:36,filter:'drop-shadow(0 2px 8px rgba(0,0,0,0.6))'},
  desktopIconLabel:{fontSize:11,color:'#d0e0f0',textAlign:'center',textShadow:'0 1px 4px rgba(0,0,0,0.8)',lineHeight:1.2},
  // ── Taskbar ──
  taskbar:{
    position:'absolute',bottom:74,left:'50%',transform:'translateX(-50%)',
    display:'flex',gap:6,alignItems:'center',zIndex:9998,
    minHeight:32,padding:'4px 12px',
    // background:'rgba(8,14,28,0.82)',backdropFilter:'blur(16px)',
    // border:'1px solid rgba(255,255,255,0.08)',borderRadius:10,
    // boxShadow:'0 4px 16px rgba(0,0,0,0.5)',
  },
  tbBtn:{
    display:'flex',alignItems:'center',gap:6,
    background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.1)',
    borderRadius:6,padding:'4px 10px',color:'#cdd6f4',
    cursor:'pointer',transition:'background 0.1s',userSelect:'none',fontFamily:'inherit',
  },
  // ── Dock ──
  dock:{position:'absolute',bottom:10,left:'50%',transform:'translateX(-50%)',background:'rgba(20,30,48,0.78)',backdropFilter:'blur(24px)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:20,padding:'8px 20px',display:'flex',alignItems:'center',gap:10,boxShadow:'0 8px 32px rgba(0,0,0,0.6)',zIndex:9999},
  dockIcon:{fontSize:34,cursor:'pointer',padding:6,borderRadius:12,background:'rgba(255,255,255,0.05)',transition:'all 0.2s cubic-bezier(0.34,1.56,0.64,1)'},
  dockSep:{width:1,height:36,background:'rgba(255,255,255,0.15)',margin:'0 2px'},
}

const win = {
  window:{position:'absolute',background:'#1e1e2e',border:'1px solid #313244',borderRadius:10,overflow:'hidden',boxShadow:'0 20px 60px rgba(0,0,0,0.8),0 0 0 1px rgba(255,255,255,0.05)',display:'flex',flexDirection:'column',userSelect:'none',animation:'winOpen 0.16s ease'},
  maximized:{left:0,top:28,right:0,bottom:0,width:'100%',height:'calc(100% - 28px)',borderRadius:0},
  titleBar:{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 12px',height:36,background:'linear-gradient(180deg,#2a2a3e,#252535)',borderBottom:'1px solid #313244',cursor:'move',flexShrink:0},
  titleLeft:{display:'flex',alignItems:'center',gap:8},
  titleIcon:{fontSize:14},
  titleText:{fontSize:12,color:'#cdd6f4',fontWeight:500},
  titleBtns:{display:'flex',gap:6},
  winBtn:{width:28,height:22,border:'none',borderRadius:4,color:'#cdd6f4',fontSize:11,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',transition:'filter 0.1s'},
}

const np = {
  menuBar:{display:'flex',padding:'0 4px',height:28,alignItems:'center',background:'#252535',borderBottom:'1px solid #313244',flexShrink:0},
  menuItem:{padding:'0 12px',height:'100%',display:'flex',alignItems:'center',fontSize:12,color:'#bac2de',cursor:'default',borderRadius:4,transition:'background 0.1s'},
  toolbar:{display:'flex',alignItems:'center',padding:'4px 8px',gap:4,background:'#252535',borderBottom:'1px solid #313244',flexShrink:0,height:34},
  tbBtn:{padding:'3px 10px',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:5,color:'#bac2de',fontSize:11,cursor:'pointer',transition:'background 0.1s',fontFamily:'inherit'},
  tbSep:{width:1,height:18,background:'rgba(255,255,255,0.12)',margin:'0 4px'},
  tbInfo:{fontSize:11,color:'#6c7086',marginLeft:'auto',fontVariantNumeric:'tabular-nums'},
  textarea:{flex:1,background:'#1e1e2e',color:'#cdd6f4',border:'none',padding:'12px 16px',fontSize:14,lineHeight:1.65,resize:'none',fontFamily:"'Cascadia Code','Fira Code','Consolas',monospace",userSelect:'text',cursor:'text'},
  statusBar:{display:'flex',padding:'0 12px',height:22,alignItems:'center',background:'#1565c0',color:'rgba(255,255,255,0.85)',fontSize:11,flexShrink:0,gap:16},
}