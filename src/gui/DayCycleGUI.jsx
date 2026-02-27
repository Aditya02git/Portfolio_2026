import { useEffect, useState } from 'react'
import { getTimeLabel } from '../weather/dayCycle.js'
import {
  colors, fonts, googleFontsImport,
  btnStyle, cornerCSS,
} from '../theme/theme.js'

const modeConfig = {
  normal: { label: '🌤 Normal', accent: '#c9a227', glow: 'rgba(245,200,66,0.35)',  badgeBg: 'rgba(197,162,39,0.18)', badgeBorder: '#c9a227', badgeColor: '#000000' },
  rainy:  { label: '🌧 Rainy',  accent: '#5588ff', glow: 'rgba(80,140,255,0.35)',  badgeBg: 'rgba(80,120,220,0.2)',  badgeBorder: '#c9a227', badgeColor: '#000000' },
  cloudy: { label: '☁️ Cloudy', accent: '#aaaacc', glow: 'rgba(160,160,200,0.3)',  badgeBg: 'rgba(120,120,160,0.2)', badgeBorder: '#c9a227', badgeColor: '#000000' },
  snow:   { label: '❄️ Snow',   accent: '#88ccff', glow: 'rgba(150,210,255,0.3)',  badgeBg: 'rgba(150,210,255,0.2)', badgeBorder: '#c9a227', badgeColor: '#000000' },
}

const barColors = {
  normal: ['#87CEEB', '#f39c12', '#020818', '#ff9d9d', '#87CEEB'],
  rainy:  ['#3a3a4a', '#2a2030', '#080810', '#2a2028', '#3a3a4a'],
  cloudy: ['#3a3a4a', '#2a2030', '#080810', '#2a2028', '#3a3a4a'],
  snow:   ['#8aaabb', '#6a7a88', '#0a0e18', '#aabbcc', '#8aaabb'],
}

const segLabels = ['Day', 'Dusk', 'Night', 'Dawn', 'Day']

export default function DayCycleGUI({ progressRef, cycleDuration, setCycleDuration, mode }) {
  const [displayProgress, setDisplayProgress] = useState(0)
  const [paused,   setPaused]   = useState(false)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => { window.__dayCyclePaused = { current: paused } }, [paused])
  useEffect(() => {
    const id = setInterval(() => setDisplayProgress(progressRef.current), 100)
    return () => clearInterval(id)
  }, [progressRef])

  const pct    = Math.round(displayProgress * 100)
  const cfg    = modeConfig[mode] ?? modeConfig.normal
  const bColors = barColors[mode] ?? barColors.normal

  const barSegments = [
    { color: bColors[0], w: 15 },
    { color: bColors[1], w: 20 },
    { color: bColors[2], w: 25 },
    { color: bColors[3], w: 30 },
    { color: bColors[4], w: 10 },
  ]

  const durationFill = `${((cycleDuration - 5) / 295) * 100}%`

  return (
    <>
      <style>{`
        ${googleFontsImport}

        .dcg-root {
          position: fixed;
          top: 16px; right: 16px;
          z-index: 100;
          width: 275px;
          font-family: ${fonts.body};
          filter: drop-shadow(0 8px 32px rgba(0,0,0,0.7));
        }

        /* ── Header ── */
        .dcg-header {
          position: relative;
          background: linear-gradient(160deg, ${colors.parchmentLight} 0%, ${colors.parchmentMid} 45%, ${colors.parchmentDark} 100%);
          border: 2px solid ${colors.goldBorder};
          border-radius: 10px 10px 0 0;
          padding: 9px 12px 9px 14px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: pointer;
          user-select: none;
          transition: border-radius 0.3s, background 0.2s;
        }
        .dcg-header:hover {
          background: linear-gradient(160deg, #fff8e0 0%, #fae290 45%, #f0cc55 100%);
        }
        .dcg-header::before {
          content: '';
          position: absolute;
          top: 3px; left: 15%; right: 15%;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.7), transparent);
          border-radius: 1px;
        }
        .dcg-header::after {
          content: '◆';
          position: absolute;
          right: 38px; top: 50%;
          transform: translateY(-50%);
          color: ${colors.goldBorderFade};
          font-size: 7px;
        }

        .dcg-header-left  { display: flex; align-items: center; gap: 9px; }
        .dcg-icon {
          width: 30px; height: 30px;
          background: linear-gradient(135deg, #3d2800, #5c3d00);
          border: 1.5px solid ${colors.goldBorder};
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 14px;
          box-shadow: inset 0 1px 2px rgba(255,255,255,0.15), 0 2px 6px rgba(0,0,0,0.4);
          flex-shrink: 0;
        }
        .dcg-title {
          font-family: ${fonts.display};
          font-size: 11.5px; font-weight: 700;
          letter-spacing: 2.5px; color: ${colors.textDark};
          display: block; line-height: 1.2;
        }
        .dcg-subtitle {
          font-size: 10px; font-style: italic;
          color: ${colors.textMid}; letter-spacing: 0.5px;
        }
        .dcg-badge {
          font-family: ${fonts.body};
          font-size: 10.5px; padding: 2px 8px;
          border-radius: 20px; border: 1px solid;
          letter-spacing: 0.3px; white-space: nowrap;
        }
        .dcg-chevron {
          width: 22px; height: 22px;
          display: flex; align-items: center; justify-content: center;
          color: #5c3d00; font-size: 10px;
          transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
          flex-shrink: 0; opacity: 0.8;
        }
        .dcg-chevron.open { transform: rotate(180deg); }

        /* ── Body ── */
        .dcg-body {
          background: ${colors.parchment};
          border: 2px solid ${colors.goldBorder};
          border-top: none;
          border-radius: 0 0 10px 10px;
          overflow: hidden;
          max-height: 380px; opacity: 1;
          transition: max-height 0.38s cubic-bezier(0.4,0,0.2,1), opacity 0.25s ease;
        }
        .dcg-body.collapsed { max-height: 0; opacity: 0; }
        .dcg-inner { padding: 14px 16px 16px; }

        .dcg-time-row   { text-align: center; margin-bottom: 12px; }
        .dcg-time-val {
          font-family: ${fonts.display};
          font-size: 21px; font-weight: 700;
          color: ${colors.textDark};
          text-shadow: 0 1px 0 rgba(255,255,255,0.5); letter-spacing: 1px;
        }
        .dcg-time-pct {
          font-size: 11px; font-style: italic;
          color: ${colors.textLight}; letter-spacing: 1.5px; margin-top: 1px;
        }

        /* divider */
        .dcg-divider { display: flex; align-items: center; gap: 7px; margin: 10px 0 12px; }
        .dcg-divider-line {
          flex: 1; height: 1px;
          background: linear-gradient(90deg, transparent, ${colors.goldBorderFade}, transparent);
        }
        .dcg-divider-ornament { color: ${colors.textLight}; font-size: 9px; }

        /* progress bar */
        .dcg-bar-wrap {
          position: relative; height: 13px; border-radius: 7px;
          overflow: hidden; margin-bottom: 5px; display: flex;
          border: 1px solid ${colors.goldBorderFade};
          box-shadow: inset 0 1px 3px rgba(0,0,0,0.2);
        }
        .dcg-bar-seg { height: 100%; }
        .dcg-bar-cursor {
          position: absolute; top: -1px; bottom: -1px;
          width: 3px; background: white; border-radius: 2px;
          box-shadow: 0 0 6px white, 0 0 12px rgba(255,255,255,0.6);
          transform: translateX(-50%); transition: left 0.1s linear;
        }
        .dcg-seg-labels {
          display: flex; justify-content: space-between;
          font-size: 9.5px; font-style: italic;
          color: ${colors.textLight}; margin-bottom: 14px; opacity: 0.85;
        }

        .dcg-section-label {
          font-size: 11px; font-style: italic;
          color: ${colors.textMid}; letter-spacing: 1px;
          display: block; margin-bottom: 5px;
        }
        .dcg-section-value { color: ${colors.textDark}; font-weight: 500; font-style: normal; }

        /* sliders */
        .dcg-slider {
          width: 100%; height: 4px;
          -webkit-appearance: none; appearance: none;
          border-radius: 2px; border: 1px solid ${colors.goldMid}44;
          margin-bottom: 13px; cursor: pointer; outline: none;
        }
        .dcg-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 15px; height: 15px; border-radius: 50%;
          background: linear-gradient(135deg, ${colors.goldLight}, ${colors.goldMid});
          border: 2px solid ${colors.goldBorder};
          box-shadow: 0 1px 4px rgba(0,0,0,0.35), 0 0 6px ${colors.goldGlow ?? 'rgba(197,162,39,0.4)'};
          cursor: pointer; transition: box-shadow 0.15s, transform 0.15s;
        }
        .dcg-slider::-webkit-slider-thumb:hover {
          transform: scale(1.2);
          box-shadow: 0 1px 4px rgba(0,0,0,0.35), 0 0 12px rgba(245,200,66,0.7);
        }
        .dcg-slider-dur, .dcg-slider-scrub {
          background: linear-gradient(90deg, ${colors.goldBorder} var(--fill, 0%), #d4b87a var(--fill, 0%));
        }

        /* pause button */
        .dcg-btn {
          width: 100%; padding: 7px 0;
          background: linear-gradient(135deg, ${colors.goldBorder} 0%, ${colors.goldMid} 50%, ${colors.goldBorder} 100%);
          background-size: 200% 100%; background-position: right center;
          border: 1.5px solid ${colors.goldDark}; border-radius: 6px;
          color: ${colors.parchment};
          font-family: ${fonts.display};
          font-size: 11px; letter-spacing: 2.5px; cursor: pointer;
          text-shadow: 0 1px 2px rgba(0,0,0,0.4);
          box-shadow: 0 2px 8px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.15);
          transition: background-position 0.3s, box-shadow 0.2s;
          position: relative; overflow: hidden;
        }
        .dcg-btn:hover {
          background-position: left center;
          box-shadow: 0 4px 14px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2);
        }
        .dcg-btn.paused {
          background: linear-gradient(135deg, #1a3a1a 0%, #2d6e2d 50%, #1a3a1a 100%);
          border-color: #3a6e3a; color: #ccffcc;
        }

        /* corner ornaments */
        ${cornerCSS('.dcg-corner-tl', 'tl')}
        ${cornerCSS('.dcg-corner-tr', 'tr')}
        ${cornerCSS('.dcg-corner-bl', 'bl')}
        ${cornerCSS('.dcg-corner-br', 'br')}
      `}</style>

      <div className="dcg-root">

        {/* Header */}
        <div
          className="dcg-header"
          style={{ borderRadius: expanded ? '10px 10px 0 0' : '10px' }}
          onClick={() => setExpanded(e => !e)}
        >
          <div className="dcg-header-left">
            <div className="dcg-icon"><i class="fa fa-clock-o" aria-hidden="true" style={{color: 'white'}}></i></div>
            <div>
              <span className="dcg-title">DAY CYCLE</span>
              <span className="dcg-subtitle">Time & Weather</span>
            </div>
          </div>

          <span
            className="dcg-badge"
            style={{
              background:  cfg.badgeBg,
              borderColor: cfg.badgeBorder,
              color:        cfg.badgeColor,
            }}
          >
            {cfg.label}
          </span>

          <span className={`dcg-chevron ${expanded ? 'open' : ''}`}>▼</span>
        </div>

        {/* Body */}
        <div className={`dcg-body ${expanded ? '' : 'collapsed'}`}>
          <div className="dcg-inner" style={{ position: 'relative' }}>

            {/* Corner ornaments — now via shared CSS classes */}
            <div className="dcg-corner-tl" />
            <div className="dcg-corner-tr" />
            <div className="dcg-corner-bl" />
            <div className="dcg-corner-br" />

            {/* Time */}
            <div className="dcg-time-row">
              <div className="dcg-time-val">{getTimeLabel(displayProgress)}</div>
              <div className="dcg-time-pct">Progress: {pct}%</div>
            </div>

            {/* Progress bar */}
            <div className="dcg-bar-wrap">
              {barSegments.map((seg, i) => (
                <div key={i} className="dcg-bar-seg" style={{ width: `${seg.w}%`, background: seg.color }} />
              ))}
              <div className="dcg-bar-cursor" style={{ left: `${pct}%` }} />
            </div>
            <div className="dcg-seg-labels">
              {segLabels.map((l, i) => <span key={i}>{l}</span>)}
            </div>

            <div className="dcg-divider">
              <div className="dcg-divider-line" />
              <span className="dcg-divider-ornament">❧</span>
              <div className="dcg-divider-line" />
            </div>

            {/* Cycle Duration */}
            <label className="dcg-section-label">
              Cycle Duration — <span className="dcg-section-value">{cycleDuration}s</span>
            </label>
            <input
              type="range" min={5} max={300} step={5} value={cycleDuration}
              onChange={e => setCycleDuration(Number(e.target.value))}
              className="dcg-slider dcg-slider-dur"
              style={{ '--fill': durationFill }}
            />

            {/* Manual Scrub */}
            <label className="dcg-section-label">Manual Scrub</label>
            <input
              type="range" min={0} max={100} step={1} value={pct}
              onChange={e => { progressRef.current = Number(e.target.value) / 100 }}
              className="dcg-slider dcg-slider-scrub"
              style={{ '--fill': `${pct}%` }}
            />

            {/* Pause / Resume */}
            <button
              onClick={() => setPaused(p => !p)}
              className={`dcg-btn ${paused ? 'paused' : ''}`}
            >
              {paused ? '▶ RESUME' : '⏸ PAUSE'}
            </button>
          </div>
        </div>

      </div>
    </>
  )
}