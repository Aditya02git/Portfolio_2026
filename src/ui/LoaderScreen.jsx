/**
 * LoaderScreen.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Cinematic loader that tracks real GLTF download + GPU-upload progress.
 * Shows a film-style progress bar, animated counters, and witty status lines.
 * Fades out and calls onDone() once progress hits 100 % and a brief hold elapses.
 *
 * Usage (App.jsx):
 *   import LoaderScreen from './ui/LoaderScreen.jsx'
 *   ...
 *   {showLoader && <LoaderScreen onDone={() => setShowLoader(false)} />}
 *
 * Requires:  @react-three/drei  (useProgress)
 */

import { useEffect, useRef, useState } from 'react'
import { useProgress } from '@react-three/drei'

// ── tunables ──────────────────────────────────────────────────────────────────
const HOLD_AFTER_100  = 600   // ms  — linger at 100 % before exit
const EXIT_DURATION   = 700   // ms  — fade-out duration
const FAKE_FLOOR      = 4     // %   — minimum shown so bar isn't stuck at 0
const FAKE_CEIL       = 92    // %   — cap before real 100 % lands (prevents lying)

// Status copy — cycled while loading
const STATUS_LINES = [
  'Assembling the room…',
  'Hanging the wall lamp…',
  'Brewing virtual coffee…',
  'Tuning the AC…',
  'Placing books on shelves…',
  'Waking the cat…',
  'Connecting monitor…',
  'Almost there…',
]

// ── component ─────────────────────────────────────────────────────────────────
export default function LoaderScreen({ onDone }) {
  const { progress, total, loaded, item } = useProgress()

  // Displayed progress — smoothly lerps toward real value, never goes backward
  const [displayPct, setDisplayPct]   = useState(FAKE_FLOOR)
  const [statusIdx,  setStatusIdx]    = useState(0)
  const [phase,      setPhase]        = useState('in')   // 'in' | 'hold' | 'exit'
  const displayRef = useRef(FAKE_FLOOR)
  const rafRef     = useRef(null)
  const doneRef    = useRef(false)

  // ── smooth lerp toward target ──────────────────────────────────────────────
  useEffect(() => {
    // target: clamp real progress between FAKE_FLOOR and FAKE_CEIL,
    // jump straight to 100 when drei says 100
    const rawTarget = progress >= 100 ? 100 : Math.min(FAKE_CEIL, Math.max(FAKE_FLOOR, progress))

    const tick = () => {
      const curr = displayRef.current
      const diff = rawTarget - curr
      if (Math.abs(diff) < 0.05) {
        displayRef.current = rawTarget
        setDisplayPct(rawTarget)
        return
      }
      // fast lerp — 8 % of gap per frame (~60 fps)
      const next = curr + diff * 0.08
      displayRef.current = next
      setDisplayPct(next)
      rafRef.current = requestAnimationFrame(tick)
    }

    cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [progress])

  // ── trigger exit once displayPct reaches 100 ──────────────────────────────
  useEffect(() => {
    if (displayPct >= 99.9 && !doneRef.current) {
      doneRef.current = true
      setPhase('hold')
      setTimeout(() => {
        setPhase('exit')
        setTimeout(() => onDone?.(), EXIT_DURATION + 80)
      }, HOLD_AFTER_100)
    }
  }, [displayPct, onDone])

  // ── cycle status lines every ~1.8 s ───────────────────────────────────────
  useEffect(() => {
    const id = setInterval(() => {
      setStatusIdx(i => (i + 1) % STATUS_LINES.length)
    }, 1800)
    return () => clearInterval(id)
  }, [])

  const pct    = Math.round(Math.min(100, Math.max(0, displayPct)))
  const exiting = phase === 'exit'

  return (
    <div
      className={`ls-overlay ${exiting ? 'ls-exit' : 'ls-enter'}`}
      aria-label="Loading portfolio"
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <style>{css}</style>

      {/* film grain */}
      <div className="ls-grain" />

      {/* letterbox bars */}
      <div className="ls-bar ls-bar--top" />
      <div className="ls-bar ls-bar--bottom" />

      {/* vignette */}
      <div className="ls-vignette" />

      {/* ── centre card ── */}
      <div className={`ls-card ${exiting ? 'ls-card--exit' : ''}`}>

        {/* eyebrow */}
        <p className="ls-eyebrow ls-fade-in" style={{ animationDelay: '0.1s' }}>
          PORTFOLIO · 3D EXPERIENCE
        </p>

        {/* main title */}
        <h1 className="ls-title ls-fade-in" style={{ animationDelay: '0.25s' }}>
          Aditya's<br /><span className="ls-title-italic">Space</span>
        </h1>

        {/* divider */}
        <div className="ls-divider ls-fade-in" style={{ animationDelay: '0.4s' }} />

        {/* progress track */}
        <div className="ls-track-wrap ls-fade-in" style={{ animationDelay: '0.5s' }}>
          <div className="ls-track">
            <div
              className="ls-fill"
              style={{ width: `${Math.min(100, displayPct)}%` }}
            />
            {/* travelling glow dot */}
            <div
              className="ls-dot"
              style={{ left: `calc(${Math.min(100, displayPct)}% - 4px)` }}
            />
          </div>
        </div>

        {/* counter + status row */}
        <div className="ls-meta ls-fade-in" style={{ animationDelay: '0.55s' }}>
          <span className="ls-pct">{pct < 100 ? pct : 100}<span className="ls-pct-sym">%</span></span>
          <span className="ls-sep">·</span>
          <span className="ls-status" key={statusIdx}>{STATUS_LINES[statusIdx]}</span>
        </div>

        {/* asset detail (tiny, optional) */}
        {item && pct < 100 && (
          <p className="ls-asset">{item.split('/').pop()}</p>
        )}

        {/* decorative corner marks */}
        <span className="ls-corner ls-corner--tl" />
        <span className="ls-corner ls-corner--tr" />
        <span className="ls-corner ls-corner--bl" />
        <span className="ls-corner ls-corner--br" />
      </div>
    </div>
  )
}

// ── CSS ───────────────────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;1,300&family=Montserrat:wght@200;400&display=swap');

  /* ─ overlay ─ */
  .ls-overlay {
    position: fixed;
    inset: 0;
    z-index: 10000;
    background: #06080a;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }
  .ls-enter { animation: lsOverlayIn  500ms ease both; }
  .ls-exit  { animation: lsOverlayOut ${EXIT_DURATION}ms cubic-bezier(0.7,0,1,1) both; }

  @keyframes lsOverlayIn  { from { opacity:0 } to { opacity:1 } }
  @keyframes lsOverlayOut { from { opacity:1 } to { opacity:0 } }

  /* ─ film grain ─ */
  .ls-grain {
    position: absolute;
    inset: -50%;
    width: 200%; height: 200%;
    opacity: 0.04;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
    background-size: 256px;
    animation: lsGrain 0.35s steps(1) infinite;
    pointer-events: none;
  }
  @keyframes lsGrain {
    0%,100% { transform:translate(0,0) }
    25%      { transform:translate(-2%,2%) }
    50%      { transform:translate(2%,-1%) }
    75%      { transform:translate(-1%,1%) }
  }

  /* ─ letterbox ─ */
  .ls-bar {
    position: absolute;
    left:0; right:0;
    height: clamp(40px, 5vh, 56px);
    background: #000;
    pointer-events: none;
  }
  .ls-bar--top    { top: 0 }
  .ls-bar--bottom { bottom: 0 }

  /* ─ vignette ─ */
  .ls-vignette {
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,0.8) 100%);
    pointer-events: none;
  }

  /* ─ card ─ */
  .ls-card {
    position: relative;
    text-align: center;
    padding: 52px 64px 48px;
    z-index: 1;
    transition: opacity ${EXIT_DURATION * 0.8}ms ease, transform ${EXIT_DURATION * 0.8}ms ease;
  }
  .ls-card--exit {
    opacity: 0;
    transform: translateY(-12px);
  }

  /* ─ corner marks ─ */
  .ls-corner {
    position: absolute;
    width: 14px; height: 14px;
    border-color: rgba(255,255,255,0.18);
    border-style: solid;
    border-width: 0;
  }
  .ls-corner--tl { top:0; left:0;  border-top-width:1px;    border-left-width:1px  }
  .ls-corner--tr { top:0; right:0; border-top-width:1px;    border-right-width:1px }
  .ls-corner--bl { bottom:0; left:0;  border-bottom-width:1px; border-left-width:1px  }
  .ls-corner--br { bottom:0; right:0; border-bottom-width:1px; border-right-width:1px }

  /* ─ typography ─ */
  .ls-eyebrow {
    font-family: 'Montserrat', sans-serif;
    font-weight: 200;
    font-size: clamp(9px, 1vw, 11px);
    letter-spacing: 0.38em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.35);
    margin: 0 0 20px;
  }
  .ls-title {
    font-family: 'Cormorant Garamond', serif;
    font-weight: 300;
    font-size: clamp(48px, 7.5vw, 96px);
    line-height: 1.05;
    color: rgba(255,255,255,0.88);
    margin: 0 0 10px;
    letter-spacing: 0.03em;
  }
  .ls-title-italic {
    font-style: italic;
    color: #fff;
  }

  /* ─ divider ─ */
  .ls-divider {
    width: 180px;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
    margin: 0 auto 36px;
  }

  /* ─ progress track ─ */
  .ls-track-wrap {
    width: clamp(260px, 36vw, 420px);
    margin: 0 auto 18px;
  }
  .ls-track {
    position: relative;
    height: 2px;
    background: rgba(255,255,255,0.1);
    border-radius: 2px;
    overflow: visible;
  }
  .ls-fill {
    height: 100%;
    background: linear-gradient(90deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.9) 100%);
    border-radius: 2px;
    transition: width 0.08s linear;
    will-change: width;
  }
  .ls-dot {
    position: absolute;
    top: 50%;
    width: 8px; height: 8px;
    margin-top: -4px;
    background: #fff;
    border-radius: 50%;
    box-shadow: 0 0 12px 4px rgba(255,255,255,0.6);
    transition: left 0.08s linear;
    will-change: left;
  }

  /* ─ meta row ─ */
  .ls-meta {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    font-family: 'Montserrat', sans-serif;
    color: rgba(255,255,255,0.45);
    font-size: clamp(10px, 1.1vw, 12px);
    letter-spacing: 0.1em;
  }
  .ls-pct {
    font-weight: 400;
    font-size: clamp(12px, 1.4vw, 15px);
    color: rgba(255,255,255,0.7);
    min-width: 3.2ch;
    text-align: right;
    font-variant-numeric: tabular-nums;
  }
  .ls-pct-sym { font-size: 0.75em; opacity: 0.7; }
  .ls-sep { opacity: 0.3; }
  .ls-status {
    font-weight: 200;
    letter-spacing: 0.14em;
    animation: lsStatusIn 0.4s ease both;
  }
  @keyframes lsStatusIn {
    from { opacity:0; transform:translateY(4px) }
    to   { opacity:1; transform:translateY(0) }
  }

  /* ─ asset filename ─ */
  .ls-asset {
    margin: 10px 0 0;
    font-family: 'Montserrat', monospace;
    font-size: 9px;
    letter-spacing: 0.12em;
    color: rgba(255,255,255,0.18);
    text-transform: uppercase;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 340px;
    margin-left: auto;
    margin-right: auto;
  }

  /* ─ fade-in utility ─ */
  .ls-fade-in {
    animation: lsFadeUp 0.7s cubic-bezier(0.16,1,0.3,1) both;
  }
  @keyframes lsFadeUp {
    from { opacity:0; transform:translateY(10px); filter:blur(6px) }
    to   { opacity:1; transform:translateY(0);    filter:blur(0)   }
  }
`