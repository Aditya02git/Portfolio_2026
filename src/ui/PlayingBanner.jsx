import { colors, fonts } from '../theme/theme.js'

export default function NowPlayingBanner({ nowPlaying }) {
  if (!nowPlaying) return null

  return (
    <div style={styles.banner}>
      <i class="fa fa-music" aria-hidden="true" style={{color: '#ffffff'}}></i> Now playing:{' '}
      <span style={styles.trackName}>{nowPlaying}</span>
    </div>
  )
}

const styles = {
  banner: {
    position:        'fixed',
    bottom:          20,
    left:            '50%',
    transform:       'translateX(-50%)',
    background:      'rgba(0,0,0,0.75)',
    border:          `1px solid ${colors.goldBorderFade}`,
    borderRadius:    8,
    padding:         '6px 18px',
    fontFamily:      fonts.body,
    fontSize:        12,
    color:           colors.parchment,
    pointerEvents:   'none',
    zIndex:          500,
    animation:       'fadeIn 0.4s ease',
    letterSpacing:   '0.5px',
  },
  trackName: {
    color:       colors.parchmentLight,
    fontWeight:  500,
    fontStyle:   'italic',
  },
}