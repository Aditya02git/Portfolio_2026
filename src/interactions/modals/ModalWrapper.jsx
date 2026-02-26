import { useEffect } from 'react'
import {
  colors, fonts,
  cornerStyle, dividerRowStyle, dividerLineStyle, dividerLeafStyle,
  btnStyle, panelStyle, overlayStyle, iconBadgeStyle,
} from '../../theme/theme.js'

// Shared parchment-style game modal wrapper
export default function ModalWrapper({ icon, title, onClose, children }) {
  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div
        style={{ ...panelStyle, width: 'min(560px, 92vw)', maxHeight: '85vh', overflowY: 'auto' }}
        onClick={e => e.stopPropagation()}
      >

        {/* Decorative corner pieces */}
        <div style={{ ...cornerStyle, top: 6, left: 6, borderTopLeftRadius: 6 }} />
        <div style={{ ...cornerStyle, top: 6, right: 6, borderTopRightRadius: 6, borderLeft: 'none', borderRight: `2px solid ${colors.goldBorder}` }} />
        <div style={{ ...cornerStyle, bottom: 6, left: 6, borderBottomLeftRadius: 6, borderTop: 'none', borderBottom: `2px solid ${colors.goldBorder}` }} />
        <div style={{ ...cornerStyle, bottom: 6, right: 6, borderBottomRightRadius: 6, borderTop: 'none', borderBottom: `2px solid ${colors.goldBorder}`, borderLeft: 'none', borderRight: `2px solid ${colors.goldBorder}` }} />

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={iconBadgeStyle}>
            <span style={{ fontSize: 28 }}>{icon}</span>
            {/* glow ring */}
            <div style={{
              position: 'absolute', inset: -4, borderRadius: '50%',
              background: `radial-gradient(circle, ${colors.goldGlow} 0%, transparent 70%)`,
              pointerEvents: 'none',
            }} />
          </div>

          <div style={dividerRowStyle}>
            <div style={dividerLineStyle} />
            <span style={dividerLeafStyle}>❧</span>
            <div style={dividerLineStyle} />
          </div>

          <h2 style={{
            margin: '8px 0 4px',
            fontSize: 26, fontWeight: 800,
            letterSpacing: 3, textTransform: 'uppercase',
            color: colors.textDark,
            fontFamily: fonts.display,
            textShadow: '1px 1px 0 rgba(255,255,255,0.4)',
          }}>
            {title}
          </h2>

          <div style={dividerRowStyle}>
            <div style={dividerLineStyle} />
            <span style={dividerLeafStyle}>❦</span>
            <div style={dividerLineStyle} />
          </div>
        </div>

        {/* Content */}
        <div style={{ color: colors.textDark, fontSize: 14, lineHeight: 1.7, fontFamily: fonts.body }}>
          {children}
        </div>

        {/* Close button */}
        <button style={btnStyle} onClick={onClose}>
          ✕ Close
        </button>
      </div>
    </div>
  )
}