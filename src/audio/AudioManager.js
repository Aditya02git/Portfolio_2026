/**
 * AudioManager.js
 * Handles all audio for the portfolio-3d project.
 * Inspired by the reference project's Audio.js architecture.
 *
 * Sounds used (from public/sounds/):
 *  - crickets/Crickets.mp3          → night ambiance
 *  - owl/...mp3                     → random night calls
 *  - rooster/rooster-crowing.mp3    → dawn trigger
 *  - wolf/...mp3                    → deep night trigger
 *  - rain/...mp3                    → rainy weather
 *  - wind/...mp3                    → wind ambiance
 *  - thunder/...mp3                 → rainy/cloudy random
 *  - clicks/...mp3                  → UI interactions
 *  - paper/...mp3                   → UI interactions
 *  - musics/...mp3                  → background playlist
 */

import { Howl, Howler } from 'howler'

// ─── helpers ────────────────────────────────────────────────────────────────

/** Linear remap, no clamping */
function remap(value, inMin, inMax, outMin, outMax) {
  return outMin + ((value - inMin) / (inMax - inMin)) * (outMax - outMin)
}

/** Linear remap, clamped to [outMin, outMax] */
function remapClamp(value, inMin, inMax, outMin, outMax) {
  return Math.min(outMax, Math.max(outMin, remap(value, inMin, inMax, outMin, outMax)))
}

// ─── AudioManager ────────────────────────────────────────────────────────────

export class AudioManager {
  constructor() {
    this.initiated   = false
    this.muted       = false
    this.weatherMode = 'normal'   // safe default — overwritten by init() and update()
    this.groups      = new Map()
    this.playlist    = null

    // Restored from localStorage
    const stored = localStorage.getItem('portfolio_mute')
    if (stored === '1') this._applyMute(true)

    // Pause / resume on tab visibility
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        Howler.mute(true)
      } else {
        if (!this.muted) Howler.mute(false)
      }
    })
  }

  // ── public boot ────────────────────────────────────────────────────────────

  /**
   * Call once after the first user interaction so browsers allow audio.
   * @param {string} weatherMode  - 'normal' | 'rainy' | 'snow' | 'cloudy'
   */
  init(weatherMode = 'normal') {
    if (this.initiated) return
    this.initiated  = true
    this.weatherMode = weatherMode

    this._setupPlaylist()
    this._setupAmbiants()
    this._setupOneOffs()

    // Auto-play items that were waiting for init
    this.groups.forEach(group => {
      group.items.forEach(item => {
        if (item.autoplay && !item.playing) item.play()
      })
    })
  }

  // ── registration ──────────────────────────────────────────────────────────

  /**
   * Register a sound into a named group.
   * Options mirror the reference project's API.
   */
  register(options = {}) {
    const groupName = options.group ?? 'all'
    let group = this.groups.get(groupName)

    if (!group) {
      group = { items: [], lastPlayedId: -1 }

      /** Play the next item in round-robin order */
      group.play = (...args) => {
        const id   = (group.lastPlayedId + 1) % group.items.length
        group.items[id].play(...args)
      }

      /** Play a random item (avoids immediate repeat) */
      group.playRandom = (...args) => {
        const delta = 1 + Math.floor(Math.random() * Math.max(1, group.items.length - 1))
        const id    = (group.lastPlayedId + delta) % group.items.length
        group.items[id].play(...args)
      }

      this.groups.set(groupName, group)
    }

    const item = {}
    item.id        = group.items.length
    item.volume    = options.volume    ?? 0.5
    item.rate      = options.rate      ?? 1
    item.antiSpam  = options.antiSpam  ?? 0.1   // seconds
    item.lastPlay  = -Infinity
    item.autoplay  = options.autoplay  ?? false
    item.playing   = false
    item.onPlay    = options.onPlay    ?? null
    item.onPlaying = options.onPlaying ?? null  // called every update tick

    item.howl = new Howl({
      src:      [ options.path ],
      pool:     options.pool     ?? 2,
      autoplay: this.initiated && !!options.autoplay,
      loop:     options.loop     ?? false,
      volume:   item.volume,
      preload:  options.preload  ?? true,
      onloaderror: () => console.warn(`AudioManager: failed to load "${options.path}"`),
      onend: () => { item.playing = false },
    })

    item.play = (...args) => {
      if (!this.initiated) return

      // Anti-spam
      const now = performance.now() / 1000
      if (item.antiSpam && now - item.lastPlay < item.antiSpam) return
      item.lastPlay = now

      // onPlay runs FIRST — it mutates item.volume / item.rate
      if (typeof item.onPlay === 'function') item.onPlay(item, ...args)

      // THEN apply the (potentially mutated) values to howler
      item.howl.volume(item.volume)
      item.howl.rate(Math.min(Math.max(item.rate, 0.5), 4))
      item.howl.play()
      item.playing = true
      group.lastPlayedId = item.id
    }

    group.items.push(item)
    return item
  }

  // ── update (call every frame or on interval) ───────────────────────────────

  /**
   * Must be called on every animation frame (or at least periodically).
   * @param {object} state  - { progress: 0-1, weatherMode: string }
   *   progress: day cycle progress (0 = dawn/day start, ~0.35-0.60 = night)
   */
  update({ progress = 0, weatherMode = 'normal' } = {}) {
    if (!this.initiated) return
    this.weatherMode = weatherMode

    this.groups.forEach(group => {
      group.items.forEach(item => {
        if (typeof item.onPlaying === 'function') {
          item.onPlaying(item, { progress, weatherMode })
        }
        // Sync howl volume in case onPlaying mutated item.volume
        if (item.howl.playing()) {
          item.howl.volume(item.volume)
          item.howl.rate(item.rate)
        }
      })
    })
  }

  // ── mute ──────────────────────────────────────────────────────────────────

  toggleMute() {
    this._applyMute(!this.muted)
  }

  togglePlaylist() {
    if (!this.initiated || !this.playlist) return
    const current = this.playlist.current
    if (!current) return
    if (current.howl.playing()) {
      current.howl.pause()
    } else {
      current.howl.play()
    }
  }

  isPlaylistPlaying() {
    return this.playlist?.current?.howl?.playing() ?? false
  }

  _applyMute(active) {
    this.muted = active
    Howler.mute(active)
    localStorage.setItem('portfolio_mute', active ? '1' : '0')
  }

  // ── playlist ──────────────────────────────────────────────────────────────

  _setupPlaylist() {
    const songs = [
      { path: 'sounds/musics/Music_for_Meditation.mp3', name: 'Music for Meditation' },
      { path: 'sounds/musics/Music_For_Relax.mp3',      name: 'Music for Relax'      },
      { path: 'sounds/musics/Music_for_Sleep.mp3',      name: 'Music for Sleep'      },
    ]

    // Pick a different song every ~3 minutes based on wall clock
    let index = Math.floor(Date.now() / 1000 / 60 / 3) % songs.length

    const pl = {
      songs,
      index,
      current: null,
      switching: false,
    }

    for (const song of pl.songs) {
      song.howl = new Howl({
        src:     [ song.path ],
        autoplay: false,
        loop:     false,
        preload:  false,
        volume:   0.18,
        onend:    () => pl.next(),
      })
    }

    pl.play = () => {
      pl.current = pl.songs[pl.index]
      pl.current.howl.load()
      pl.current.howl.play()
    }

    pl.next = () => {
      if (pl.switching) return
      pl.switching = true

      // optional: play disc-change sound
      this.groups.get('click')?.play()

      if (pl.current) pl.current.howl.stop()

      setTimeout(() => {
        pl.index = (pl.index + 1) % pl.songs.length
        pl.current = pl.songs[pl.index]
        pl.current.howl.load()
        pl.current.howl.play()
        pl.switching = false

        // Fire event so UI can show "now playing"
        window.dispatchEvent(new CustomEvent('audio:nowPlaying', {
          detail: { name: pl.current.name }
        }))
      }, 2000)
    }

    pl.play()
    this.playlist = pl
  }

  // ── ambiants ──────────────────────────────────────────────────────────────

  _setupAmbiants() {
    const wm = this.weatherMode   // snapshot at init; update() can change it

    // ── Bird Tweets — random chirps during daytime ───────────────────────────
    {
      // Add all files from your birdTweets folder here
      const birdPaths = [
        'sounds/birdTweets/24074 small bird tweet calling-full-1.mp3',
        'sounds/birdTweets/24074 small bird tweet calling-full-2.mp3',
        'sounds/birdTweets/20711 finch bird isolated tweet-full.mp3',
        'sounds/birdTweets/30673 Yellowhammer bird tweet 3-full.mp3',
        'sounds/birdTweets/31062 Ortolan bird tweet-full.mp3',
        'sounds/birdTweets/31451 Ortolan bunting bird isolated tweet-full.mp3',
      ]

      for (const path of birdPaths) {
        this.register({
          group:    'birdTweet',
          path,
          autoplay: false,
          loop:     false,
          volume:   0.25,
          antiSpam: 3,
          onPlay: (item) => {
            item.volume = 0.15 + Math.random() * 0.25
            item.rate   = 1    + Math.random() * 0.4
          },
        })
      }

      const tryBird = () => {
        const p       = this._lastProgress ?? 0
        const isDay   = p < 0.25 || p >= 0.85   // outside night/dusk/dawn
        if (isDay && Math.random() < 0.55) {
          this.groups.get('birdTweet')?.playRandom()
        }
        setTimeout(tryBird, 2000 + Math.random() * 6000)
      }
      setTimeout(tryBird, 3000)
    }

    // ── Crickets — loop, fade in at night ────────────────────────────────────
    {
      const sound = this.register({
        group:    'crickets',
        path:     'sounds/crickets/Crickets.mp3',
        autoplay: true,
        loop:     true,
        volume:   0,     // will be driven by onPlaying
      })

      sound.onPlaying = (item, { progress }) => {
        const isNight = progress >= 0.35 && progress < 0.80
        const target  = isNight ? 0.55 : 0
        // Fade in slowly, fade out quickly so it stops audibly fast
        const rate    = target > item.volume ? 0.02 : 0.08
        item.volume  += (target - item.volume) * rate
        // Hard-mute when essentially silent so it doesn't bleed through
        if (item.volume < 0.01) item.volume = 0
      }
    }

    // ── Owl — random call, only at night ─────────────────────────────────────
    {
      // Register all owl files you have; add more paths as needed
      const owlPaths = [
        'sounds/owl/OwlHootingReverberantSeveral_Rik8a_03.mp3',
      ]

      for (const path of owlPaths) {
        this.register({
          group:    'owl',
          path,
          autoplay: false,
          loop:     false,
          volume:   0.28,
          antiSpam: 30,
          onPlay: (item) => {
            item.volume = 0.2 + Math.random() * 0.2
            item.rate   = 1   + Math.random() * 0.25
          },
        })
      }

      // Try to hoot every 30-70 s if it's night
      const tryOwl = () => {
        const p = this._lastProgress ?? 0
        if (p >= 0.35 && p < 0.80 && Math.random() < 0.6) {
          this.groups.get('owl')?.playRandom()
        }
        const delay = 30000 + Math.random() * 40000
        setTimeout(tryOwl, delay)
      }
      setTimeout(tryOwl, 30000 + Math.random() * 30000)
    }

    // ── Rooster — crow once at dawn ───────────────────────────────────────────
    {
      this.register({
        group:    'rooster',
        path:     'sounds/rooster/rooster-crowing.mp3',
        autoplay: false,
        loop:     false,
        volume:   0.25,
        antiSpam: 60,
        onPlay: (item) => {
          item.volume = 0.15 + Math.random() * 0.15
        },
      })

      // Watch for the transition OUT of night (progress crossing 0.80)
      this._prevNight = false
      // Checked inside update via _checkDawnTrigger
    }

    // ── Wolf — howl in deep night ─────────────────────────────────────────────
    {
      // Glob all wolf sounds or just the one you have
      this.register({
        group:    'wolf',
        path:     'sounds/wolf/TimberWolvesGroupHowlingSomeWhimpering_S2h0E_04.mp3',
        autoplay: false,
        loop:     false,
        volume:   0.18,
        antiSpam: 60,
        onPlay: (item) => {
          item.volume = 0.12 + Math.random() * 0.15
          item.rate   = 1    + Math.random() * 0.15
        },
      })

      const tryWolf = () => {
        const p = this._lastProgress ?? 0
        const isDeepNight = p >= 0.45 && p < 0.70
        if (isDeepNight && Math.random() < 0.4) {
          this.groups.get('wolf')?.play()
        }
        const delay = 60000 + Math.random() * 60000
        setTimeout(tryWolf, delay)
      }
      setTimeout(tryWolf, 60000 + Math.random() * 60000)
    }

    // ── Rain — driven by weather mode ─────────────────────────────────────────
    {
      const rainPaths = [
        'sounds/rain/soundjay_rain-on-leaves_main-01.mp3',
      ]
      for (const path of rainPaths) {
        this.register({
          group:    'rain',
          path,
          autoplay: true,
          loop:     true,
          volume:   0,
          onPlaying: (item, { weatherMode }) => {
            const isRainy  = weatherMode === 'rainy'
            const target   = isRainy ? 0.7 : 0
            item.volume += (target - item.volume) * 0.015
          },
        })
      }
    }

    // ── Wind ──────────────────────────────────────────────────────────────────
    {
      const windPaths = [
        'sounds/wind/13582-wind-in-forest-loop.mp3',
      ]
      for (const path of windPaths) {
        this.register({
          group:    'wind',
          path,
          autoplay: true,
          loop:     true,
          volume:   0,
          onPlaying: (item, { weatherMode }) => {
            const windy  = weatherMode === 'cloudy' || weatherMode === 'snow'
            const rainy  = weatherMode === 'rainy'
            const target = windy ? 0.45 : rainy ? 0.55 : 0
            item.volume += (target - item.volume) * 0.012
          },
        })
      }
    }

    // ── Thunder — triggered by lightning:flash events from skyCanvas ─────────
    //
    // 'distant' group  → gentle rumbles (further away)
    // 'thunder'  group → sharp near strikes
    //
    // skyCanvas fires:  window.dispatchEvent(new CustomEvent('lightning:flash', { detail: { distance: 'near'|'distant' } }))
    // We delay the sound by a realistic amount to match the visual flash.
    {
      // Distant rumbles
      const distantPaths = [
        'sounds/thunder/distant/Thunder32GentleCr SIG014001.mp3',
        'sounds/thunder/distant/Thunder44LowRippl SIG015201.mp3',
      ]
      for (const path of distantPaths) {
        this.register({
          group:    'thunderDistant',
          path,
          autoplay: false,
          loop:     false,
          volume:   0.3,
          antiSpam: 4,
          onPlay: (item) => {
            item.volume = 0.2 + Math.random() * 0.2
            item.rate   = 0.85 + Math.random() * 0.2
          },
        })
      }

      // Near strikes
      const nearPaths = [
        'sounds/thunder/near/Lightning-Streak-with-Thunder-Crash_TTX028903.mp3',
        'sounds/thunder/near/THUNDER_GEN-HDF-23300.mp3',
        'sounds/thunder/near/ThunderSharpStrikingRumblingCrackling_JMDKp_04.mp3',
      ]
      for (const path of nearPaths) {
        this.register({
          group:    'thunderNear',
          path,
          autoplay: false,
          loop:     false,
          volume:   0.6,
          antiSpam: 4,
          onPlay: (item) => {
            item.volume = 0.45 + Math.random() * 0.35
            item.rate   = 0.9  + Math.random() * 0.2
          },
        })
      }

      // Listen for flash events dispatched by skyCanvas
      window.addEventListener('lightning:flash', (e) => {
        if (!this.initiated) return

        const isNear = e.detail?.distance !== 'distant'

        // Sound-of-thunder delay: ~3ms per km; near = 0.8–1.4s, distant = 1.8–3.2s
        const delay = isNear
          ? 800  + Math.random() * 600
          : 1800 + Math.random() * 1400

        setTimeout(() => {
          if (isNear) {
            this.groups.get('thunderNear')?.playRandom()
          } else {
            this.groups.get('thunderDistant')?.playRandom()
          }
        }, delay)
      })
    }
  }

  // ── one-offs (UI sounds) ───────────────────────────────────────────────────

  _setupOneOffs() {
    // Generic click
    this.register({
      group:    'click',
      path:     'sounds/clicks/click.mp3',
      autoplay: false,
      loop:     false,
      volume:   0.3,
      antiSpam: 0.08,
      onPlay: (item, isOpen = true) => {
        item.rate = isOpen ? 1 : 0.65
      },
    })

    // Paper / page rustle
    this.register({
      group:    'paper',
      path:     'sounds/paper/paper.mp3',
      autoplay: false,
      loop:     false,
      volume:   0.25,
      antiSpam: 0.2,
      onPlay: (item) => {
        item.rate = 0.9 + Math.random() * 0.2
      },
    })

    // Skill / achievement discovered
    this.register({
      group:    'achievement',
      path:     'sounds/achievements/Money Reward 2.mp3',
      autoplay: false,
      loop:     false,
      volume:   0.6,
      antiSpam: 1,
    })

    // Cat
    this.register({
      group:    'cat',
      path:     'sounds/cat/cat.mp3',
      autoplay: false,
      loop:     false,
      volume:   0.3,
      antiSpam: 1,
    })
    // Drawer open
    this.register({
      group:    'drawer_open',
      path:     'sounds/drawer/d_open.mp3',
      autoplay: false,
      loop:     false,
      volume:   0.5,
      antiSpam: 0.15,
      onPlay: (item) => {
        item.rate = 0.95 + Math.random() * 0.1
      },
    })

    // Drawer close — reuse same file or swap for a different one
    this.register({
      group:    'drawer_close',
      path:     'sounds/drawer/d_close.mp3',   // swap to d_close.mp3 when you have it
      autoplay: false,
      loop:     false,
      volume:   0.45,
      antiSpam: 0.15,
      onPlay: (item) => {
        item.rate = 0.75   // lower pitch = "closing" feel
      },
    })    
  }

  // ── internal helpers ──────────────────────────────────────────────────────

  /**
   * Call this inside your update loop with the current progress value.
   * Handles dawn trigger (rooster crow).
   */
  _checkDawnTrigger(progress) {
    const isNight = progress >= 0.35 && progress < 0.80
    if (this._prevNight && !isNight) {
      // Just left night → dawn
      this.groups.get('rooster')?.play()
    }
    this._prevNight = isNight
    this._lastProgress = progress
  }
}

// ── singleton export ──────────────────────────────────────────────────────────
export const audioManager = new AudioManager()
