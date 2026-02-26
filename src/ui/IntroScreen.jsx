/**
 * IntroScreen.jsx
 * Cinematic title-card intro with real GLB loading progress bar.
 * "Explore" button is disabled until the scene is fully loaded (progress === 100).
 *
 * Usage:
 *   import IntroScreen from './ui/IntroScreen.jsx'
 *   ...
 *   {showIntro && <IntroScreen progress={progress} onDone={() => setShowIntro(false)} />}
 */

import { useEffect, useState } from 'react'

const HOLD_START  = 100
const TEXT_IN     = 200
const HOLD_TEXT   = 300
const BTN_DELAY   = HOLD_START + TEXT_IN + HOLD_TEXT
const EXIT_DUR    = 300

export default function IntroScreen({ onDone, progress = 0 }) {
  const [phase, setPhase]           = useState('in')
  const [btnVisible, setBtnVisible] = useState(false)

  const loaded = progress >= 100

  useEffect(() => {
    document.body.classList.add('intro-active')
    return () => document.body.classList.remove('intro-active')
  }, [])

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('hold'),    HOLD_START + TEXT_IN)
    const t2 = setTimeout(() => setBtnVisible(true), BTN_DELAY)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  const handleExplore = () => {
    if (!loaded) return
    document.body.classList.remove('intro-active')
    setPhase('exit')
    setTimeout(() => onDone?.(), EXIT_DUR + 100)
  }

  return (
    <div
      style={{
        ...styles.overlay,
        animation: phase === 'exit'
          ? `overlayOut ${EXIT_DUR}ms cubic-bezier(0.7,0,1,1) both`
          : 'overlayIn 600ms ease both',
      }}
    >
      <style>{css}</style>

      {/* Film-grain texture overlay */}
      <div style={styles.grain} />

      {/* Letterbox bars */}
      <div style={styles.barTop} />
      <div style={styles.barBottom} />

      {/* Vignette */}
      <div style={styles.vignette} />

      {/* Centre content */}
      <div style={styles.centre}>

        <div className={`intro-rule ${phase === 'exit' ? 'intro-rule--exit' : ''}`} />

        <p className={`intro-eyebrow intro-${phase}`}>
          A DEVELOPER'S SPACE
        </p>

        <h1 className={`intro-title intro-${phase}`}>
          Welcome to Aditya's<br />
          <span className="intro-title-accent">Portfolio</span>
        </h1>

        <p className={`intro-sub intro-${phase}`}>
          Interactive · 3D · Immersive
        </p>

        <div className={`intro-rule intro-rule--delayed ${phase === 'exit' ? 'intro-rule--exit' : ''}`} />

        {/* ── Loading bar ── */}
        <div className={`intro-progress-wrap intro-${phase}`}>
          <div className="intro-progress-track">
            <div
              className="intro-progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="intro-progress-label">
            {loaded ? 'Ready' : `Loading scene… ${Math.round(progress)}%`}
          </span>
        </div>

        {/* ── Explore button ── */}
        <div
          className={[
            'intro-btn-wrap',
            btnVisible ? 'intro-btn-wrap--visible' : '',
            phase === 'exit' ? 'intro-btn-wrap--exit' : '',
          ].join(' ')}
        >
          <button
            className={`intro-btn ${!loaded ? 'intro-btn--disabled' : ''}`}
            onClick={handleExplore}
            disabled={!loaded}
          >
            <span className="intro-btn-text">{loaded ? 'Explore' : 'Loading…'}</span>
            {loaded && <span className="intro-btn-arrow">→</span>}
            <div className="intro-btn-bg" />
          </button>
        </div>

      </div>
    </div>
  )
}

// ── CSS ───────────────────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300&family=Montserrat:wght@200;400;600&display=swap');

  body.intro-active canvas {
    filter: blur(14px) brightness(0.55);
    transition: filter 0.9s cubic-bezier(0.16,1,0.3,1);
  }
  body:not(.intro-active) canvas {
    filter: blur(0px) brightness(1);
    transition: filter 0.9s cubic-bezier(0.16,1,0.3,1);
  }

  @keyframes overlayIn  { from { opacity:0 } to { opacity:1 } }
  @keyframes overlayOut { from { opacity:1 } to { opacity:0 } }

  @keyframes ruleSlide {
    from { transform: scaleX(0); opacity:0 }
    to   { transform: scaleX(1); opacity:1 }
  }
  @keyframes textIn {
    from { opacity:0; filter:blur(18px); letter-spacing:0.35em; transform:translateY(6px) }
    to   { opacity:1; filter:blur(0px);  letter-spacing:inherit; transform:translateY(0)  }
  }
  @keyframes textOut {
    from { opacity:1; filter:blur(0px);  transform:translateY(0)    }
    to   { opacity:0; filter:blur(18px); transform:translateY(-10px) }
  }
  @keyframes btnFadeIn {
    from { opacity:0; transform:translateY(14px); filter:blur(6px) }
    to   { opacity:1; transform:translateY(0);    filter:blur(0px) }
  }
  @keyframes btnFadeOut {
    from { opacity:1; transform:translateY(0);     filter:blur(0px) }
    to   { opacity:0; transform:translateY(-10px); filter:blur(8px) }
  }
  @keyframes arrowPulse {
    0%,100% { transform: translateX(0)  }
    50%      { transform: translateX(5px) }
  }
  @keyframes grainShift {
    0%,100% { transform: translate(0,0)   }
    20%      { transform: translate(-2%,2%)  }
    40%      { transform: translate(2%,-2%)  }
    60%      { transform: translate(-1%,1%)  }
    80%      { transform: translate(1%,-1%)  }
  }
  @keyframes progressPulse {
    0%,100% { opacity: 1   }
    50%      { opacity: 0.5 }
  }

  .intro-in   { animation: textIn  ${TEXT_IN}ms  cubic-bezier(0.16,1,0.3,1) ${HOLD_START}ms both }
  .intro-hold { animation: textIn  ${TEXT_IN}ms  cubic-bezier(0.16,1,0.3,1) ${HOLD_START}ms both }
  .intro-exit { animation: textOut ${EXIT_DUR}ms cubic-bezier(0.7,0,1,1)    0ms           both }

  .intro-rule {
    width: 220px;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.55), transparent);
    margin: 0 auto 22px;
    transform-origin: center;
    animation: ruleSlide 1.2s cubic-bezier(0.16,1,0.3,1) ${HOLD_START + 200}ms both;
  }
  .intro-rule--delayed { margin: 22px auto 0; animation-delay: ${HOLD_START + 350}ms; }
  .intro-rule--exit    { animation: textOut ${EXIT_DUR}ms cubic-bezier(0.7,0,1,1) 0ms both; }

  .intro-eyebrow {
    font-family: 'Montserrat', sans-serif;
    font-weight: 200;
    font-size: clamp(9px, 1.1vw, 11px);
    letter-spacing: 0.38em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.45);
    margin: 0 0 18px;
  }
  .intro-title {
    font-family: 'Cormorant Garamond', serif;
    font-weight: 300;
    font-size: clamp(42px, 7vw, 88px);
    line-height: 1.08;
    color: rgba(255,255,255,0.92);
    margin: 0 0 14px;
    letter-spacing: 0.04em;
  }
  .intro-title-accent {
    font-style: italic;
    color: rgba(255,255,255,1);
  }
  .intro-sub {
    font-family: 'Montserrat', sans-serif;
    font-weight: 400;
    font-size: clamp(10px, 1.2vw, 12px);
    letter-spacing: 0.28em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.3);
    margin: 0;
    animation-delay: ${HOLD_START + 200}ms !important;
  }

  /* ── Progress bar ── */
  .intro-progress-wrap {
    margin-top: 28px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }
  .intro-progress-track {
    width: 220px;
    height: 1px;
    background: rgba(255,255,255,0.12);
    border-radius: 1px;
    overflow: hidden;
    position: relative;
  }
  .intro-progress-fill {
    height: 100%;
    background: linear-gradient(90deg, rgba(255,255,255,0.4), rgba(255,255,255,0.9));
    border-radius: 1px;
    transition: width 0.3s ease;
    box-shadow: 0 0 6px rgba(255,255,255,0.4);
  }
  .intro-progress-label {
    font-family: 'Montserrat', sans-serif;
    font-weight: 200;
    font-size: 10px;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.3);
    animation: progressPulse 1.8s ease infinite;
  }

  /* ── Explore button ── */
  .intro-btn-wrap {
    margin-top: 28px;
    opacity: 0;
    pointer-events: none;
  }
  .intro-btn-wrap--visible {
    animation: btnFadeIn 700ms cubic-bezier(0.16,1,0.3,1) both;
    opacity: 1;
    pointer-events: auto;
  }
  .intro-btn-wrap--exit {
    animation: btnFadeOut ${EXIT_DUR * 0.8}ms cubic-bezier(0.7,0,1,1) both !important;
    pointer-events: none;
  }

  .intro-btn {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 12px;
    padding: 13px 36px 13px 40px;
    background: transparent;
    border: 1px solid rgba(255,255,255,0.25);
    border-radius: 2px;
    cursor: pointer;
    font-family: 'Montserrat', sans-serif;
    font-weight: 400;
    font-size: clamp(10px, 1.2vw, 12px);
    letter-spacing: 0.32em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.85);
    overflow: hidden;
    transition: border-color 0.35s ease, color 0.35s ease, opacity 0.35s ease;
  }
  .intro-btn--disabled {
    opacity: 0.35;
    cursor: not-allowed;
    border-color: rgba(255,255,255,0.1);
  }
  .intro-btn-bg {
    position: absolute;
    inset: 0;
    background: rgba(255,255,255,0.06);
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.4s cubic-bezier(0.16,1,0.3,1);
  }
  .intro-btn:not(.intro-btn--disabled):hover .intro-btn-bg    { transform: scaleX(1); }
  .intro-btn:not(.intro-btn--disabled):hover                  { border-color: rgba(255,255,255,0.55); color: #fff; }
  .intro-btn:not(.intro-btn--disabled):hover .intro-btn-arrow { animation: arrowPulse 0.7s ease infinite; }
  .intro-btn:not(.intro-btn--disabled):active                 { transform: scale(0.97); }
  .intro-btn-text  { position: relative; z-index: 1; }
  .intro-btn-arrow { position: relative; z-index: 1; font-size: 14px; opacity: 0.7; }
`

const styles = {
  overlay: {
    position:       'fixed',
    inset:           0,
    zIndex:          9999,
    background:      '#0000007d',
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
  },
  grain: {
    position:        'absolute',
    inset:          '-50%',
    width:          '200%',
    height:         '200%',
    opacity:         0.035,
    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
    backgroundSize: '256px 256px',
    animation:      'grainShift 0.4s steps(1) infinite',
    pointerEvents:  'none',
  },
  barTop: {
    position:   'absolute',
    top: 0, left: 0, right: 0,
    height:     'clamp(96px, 5vh, 56px)',
    background:  '#000',
    pointerEvents: 'none',
  },
  barBottom: {
    position:   'absolute',
    bottom: 0, left: 0, right: 0,
    height:     'clamp(96px, 5vh, 56px)',
    background:  '#000',
    pointerEvents: 'none',
  },
  vignette: {
    position:   'absolute',
    inset:       0,
    background:  'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.75) 100%)',
    pointerEvents: 'none',
  },
  centre: {
    position:  'relative',
    textAlign: 'center',
    zIndex:     1,
  },
}