// ─────────────────────────────────────────────
//  theme.js  –  Shared parchment UI design tokens
// ─────────────────────────────────────────────

// ── Color palette ──────────────────────────────
export const colors = {
  parchment:     '#fdf3d0',
  parchmentLight:'#fdf0c4',
  parchmentMid:  '#f5d97a',
  parchmentDark: '#e8c14a',

  goldBorder:    '#8B6914',
  goldBorderFade:'#8B691455',
  goldDark:      '#5c4209',
  goldMid:       '#c9a227',
  goldLight:     '#f5c842',
  goldGlow:      'rgba(197,162,39,0.6)',

  textDark:      '#3d2800',
  textMid:       '#7a5500',
  textLight:     '#8B6914',

  overlayBg:     'rgba(10, 8, 5, 0.82)',
}

// ── Typography ─────────────────────────────────
export const fonts = {
  display: "'Cinzel', serif",
  body:    "'EB Garamond', 'Palatino Linotype', Palatino, 'Book Antiqua', serif",
}

export const googleFontsImport =
  "@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=EB+Garamond:ital,wght@0,400;0,500;1,400&display=swap');"

// ── Reusable JS style objects ───────────────────

/** Inset gold corner bracket (top-left by default). Override per-corner with spread. */
export const cornerStyle = {
  position:  'absolute',
  width:     18,
  height:    18,
  border:    `2px solid ${colors.goldBorder}`,
  pointerEvents: 'none',
  borderRight:   'none',
  borderBottom:  'none',
}

/** Horizontal ornamental divider row  ❧ ─────── ❦ */
export const dividerRowStyle = {
  display:    'flex',
  alignItems: 'center',
  gap:        8,
  margin:     '6px 0',
}

export const dividerLineStyle = {
  flex:       1,
  height:     1,
  background: `linear-gradient(90deg, transparent, ${colors.goldBorder}, transparent)`,
}

export const dividerLeafStyle = {
  color:    colors.goldBorder,
  fontSize: 16,
}

/** Primary gold-gradient action button */
export const btnStyle = {
  display:    'block',
  margin:     '20px auto 0',
  padding:    '8px 28px',
  background: `linear-gradient(135deg, ${colors.goldBorder}, ${colors.goldMid})`,
  border:     `2px solid ${colors.goldDark}`,
  borderRadius: 6,
  color:      colors.parchment,
  fontFamily: fonts.body,
  fontWeight: 700,
  fontSize:   13,
  letterSpacing: 1,
  cursor:     'pointer',
  textTransform: 'uppercase',
  boxShadow:  '0 3px 10px rgba(0,0,0,0.3)',
  transition: 'all 0.15s',
}

/** Main parchment panel */
export const panelStyle = {
  position:   'relative',
  background: colors.parchment,
  border:     `3px solid ${colors.goldBorder}`,
  borderRadius: 12,
  padding:    '28px 32px 24px',
  fontFamily: fonts.body,
}

/** Full-screen overlay backdrop */
export const overlayStyle = {
  position:        'fixed',
  inset:           0,
  zIndex:          1000,
  background:      colors.overlayBg,
  backdropFilter:  'blur(4px)',
  display:         'flex',
  alignItems:      'center',
  justifyContent:  'center',
}

/** Circular icon badge with gold glow */
export const iconBadgeStyle = {
  position:      'relative',
  display:       'inline-flex',
  alignItems:    'center',
  justifyContent:'center',
  width:         64,
  height:        64,
  background:    `linear-gradient(135deg, ${colors.goldLight}, ${colors.goldMid})`,
  borderRadius:  '50%',
  border:        `3px solid ${colors.goldBorder}`,
  boxShadow:     `0 0 20px ${colors.goldGlow}, 0 4px 12px rgba(0,0,0,0.3)`,
  marginBottom:  10,
}

// ── CSS snippet helpers (for <style> injection) ──

/** Corner bracket CSS for a given corner — pass 'tl' | 'tr' | 'bl' | 'br' */
export function cornerCSS(sel, corner) {
  const positions = {
    tl: 'top:6px;left:6px;border-radius:4px 0 0 0;border-right:none;border-bottom:none',
    tr: 'top:6px;right:6px;border-radius:0 4px 0 0;border-left:none;border-bottom:none',
    bl: 'bottom:6px;left:6px;border-radius:0 0 0 4px;border-right:none;border-top:none',
    br: 'bottom:6px;right:6px;border-radius:0 0 4px 0;border-left:none;border-top:none',
  }
  return `
    ${sel} {
      position:absolute; width:16px; height:16px;
      border: 2px solid ${colors.goldBorder};
      pointer-events:none;
      ${positions[corner]}
    }
  `
}