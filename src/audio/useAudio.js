/**
 * useAudio.js
 *
 * React hook that wires AudioManager into the portfolio-3d app.
 *
 * Usage in App.jsx:
 *   import { useAudio } from './audio/useAudio.js'
 *   const { playClick, playPaper, toggleMute, muted, nowPlaying } = useAudio(progressRef, WEATHER_MODE)
 *
 * The hook:
 *  - Inits audio on the first user interaction
 *  - Drives AudioManager.update() on a 500ms interval (cheap; no per-frame overhead)
 *  - Exposes helpers for UI sounds
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import { audioManager } from './AudioManager.js'

/**
 * @param {React.MutableRefObject<number>} progressRef  - day-cycle progress 0..1
 * @param {string}                         weatherMode  - 'normal' | 'rainy' | 'snow' | 'cloudy'
 */
export function useAudio(progressRef, weatherMode = 'normal') {
  const [initiated, setInitiated] = useState(false)
  const [muted,     setMuted]     = useState(audioManager.muted)
  const [nowPlaying, setNowPlaying] = useState(null)

  // ── init on first interaction ─────────────────────────────────────────────
  useEffect(() => {
    const handleFirstInteraction = () => {
      if (initiated) return
      audioManager.init(weatherMode)
      setInitiated(true)
      // Remove all listeners once fired
      EVENTS.forEach(e => window.removeEventListener(e, handleFirstInteraction))
    }

    const EVENTS = ['click', 'keydown', 'touchstart', 'pointerdown']
    EVENTS.forEach(e => window.addEventListener(e, handleFirstInteraction, { once: true }))

    return () => EVENTS.forEach(e => window.removeEventListener(e, handleFirstInteraction))
  }, []) // eslint-disable-line

  // ── periodic update (drives onPlaying callbacks & dawn trigger) ───────────
  useEffect(() => {
    const id = setInterval(() => {
      const progress = progressRef.current ?? 0
      audioManager.update({ progress, weatherMode })
      audioManager._checkDawnTrigger(progress)
    }, 500)

    return () => clearInterval(id)
  }, [progressRef, weatherMode])

  // ── now-playing banner ────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      setNowPlaying(e.detail.name)
      const id = setTimeout(() => setNowPlaying(null), 5000)
      return () => clearTimeout(id)
    }
    window.addEventListener('audio:nowPlaying', handler)
    return () => window.removeEventListener('audio:nowPlaying', handler)
  }, [])

  // ── helpers ───────────────────────────────────────────────────────────────

  /** Play a UI click sound. Pass `false` for a "close" click. */
  const playClick = useCallback((isOpen = true) => {
    audioManager.groups.get('click')?.items[0]?.play(isOpen)
  }, [])

  /** Play a paper rustle sound (e.g. opening a modal). */
  const playPaper = useCallback(() => {
    audioManager.groups.get('paper')?.items[0]?.play()
  }, [])

  /** Play the skill/achievement discovered sound. */
  const playAchievement = useCallback(() => {
    audioManager.groups.get('achievement')?.items[0]?.play()
  }, [])

  const playCat = useCallback(() => {
    audioManager.groups.get('cat')?.items[0]?.play()
  }, [])

  /** Play drawer open or close sound. */
const playDrawer = useCallback((isOpen = true) => {
  const key = isOpen ? 'drawer_open' : 'drawer_close'
  audioManager.groups.get(key)?.items[0]?.play()
}, [])

  /** Toggle the background music playlist on/off. */
  const togglePlaylist = useCallback(() => {
    audioManager.togglePlaylist()
  }, [])

  /** Toggle global mute and keep React state in sync. */
  const toggleMute = useCallback(() => {
    audioManager.toggleMute()
    setMuted(audioManager.muted)
  }, [])

  return { initiated, muted, toggleMute, togglePlaylist, playClick, playPaper, playAchievement, playDrawer, playCat, nowPlaying }
}