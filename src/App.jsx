/**
 * App.jsx  (updated)
 * ─────────────────────────────────────────────────────────────────────────────
 * Loading flow:
 *   1. LoaderScreen  — shown while portfolio.glb downloads + GPU compiles
 *                      (tracks real drei useProgress, disappears at 100 %)
 *   2. IntroScreen   — cinematic title card, shown once after load
 *   3. Scene         — interactive 3D room
 *
 * The Canvas is always mounted so the GLTF fetch starts immediately.
 * LoaderScreen sits on top (z-index 10000) and blurs the canvas while active.
 */

import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { Suspense, useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import Model from './scene/Model.jsx'
import Renderer from './scene/Renderer.jsx'
import OutlineEffect from './scene/OutlineEffect.jsx'
import ScreenCamera from './scene/ScreenCamera.jsx'
import ScreenOS from './scene/ScreenOS.jsx'
import { DynamicSceneLighting, WallLampLight, TubeLightLight } from './scene/RoomLights.jsx'
import AcGlowEffect from './scene/AcGlowEffect.jsx'
import DayCycleGUI from './gui/DayCycleGUI.jsx'
import ModalRouter from './interactions/ModalRouter.jsx'
import HintLabel from './interactions/HintLabel.jsx'
import SkillDiscovery from './interactions/SkillDiscovery.jsx'
import { useInteraction } from './interactions/useInteraction.js'
import { useLights } from './interactions/useLights.js'
import { WEATHER_MODE } from './weather/weatherMode.js'
import { useAudio } from './audio/useAudio.js'
import LoaderScreen from './ui/LoaderScreen.jsx'   // ← NEW
import IntroScreen from './ui/IntroScreen.jsx'
import SleepEffect from './scene/SleepEffect.jsx'
import CameraFly from './scene/CameraFly.jsx'
import SmokeEffect from './scene/SmokeEffect.jsx'
import PlayingBanner from './ui/PlayingBanner.jsx'

const NIGHT_CHECK_INTERVAL = 2000

export default function App() {
  // ── loading / intro state ──────────────────────────────────────────────────
  const [showLoader, setShowLoader] = useState(true)   // ← NEW
  const [showIntro,  setShowIntro]  = useState(false)  // shown AFTER loader done
  const [ready,      setReady]      = useState(false)

  // ── scene state ────────────────────────────────────────────────────────────
  const [scene3D, setScene3D]               = useState(null)
  const [acOn, setAcOn]                     = useState(false)
  const [screenActive, setScreenActive]     = useState(false)
  const [showOS, setShowOS]                 = useState(false)
  const [cycleDuration, setCycleDuration]   = useState(60)
  const [hoveredName, setHoveredName]       = useState(null)
  const [skillTrigger, setSkillTrigger]     = useState(null)

  const progressRef      = useRef(0)
  const cycleDurationRef = useRef(60)
  const orbitRef         = useRef()
  const cameraFlyRef     = useRef()
  const flyingRef        = useRef(false)

  const { activeModal, handleClick, closeModal } = useInteraction()
  const { muted, toggleMute, togglePlaylist, playClick, playPaper, playAchievement, playDrawer, playCat, nowPlaying } = useAudio(progressRef, WEATHER_MODE)
  const { wallLampOn, tubeLightOn, flickering, toggleWallLamp, toggleTubeLight, syncWithDayCycle } = useLights({
    onAutoOn: () => playClick(true)
  })

  useEffect(() => { cycleDurationRef.current = cycleDuration }, [cycleDuration])

  useEffect(() => {
    window.__onHoverChange = (name) => setHoveredName(name)
    return () => { window.__onHoverChange = null }
  }, [])

  useEffect(() => {
    const id = setInterval(() => syncWithDayCycle(progressRef.current), NIGHT_CHECK_INTERVAL)
    return () => clearInterval(id)
  }, [syncWithDayCycle])

  // ── loader done → show intro ───────────────────────────────────────────────
  const handleLoaderDone = () => {
    setShowLoader(false)
    setShowIntro(true)   // hand off immediately to cinematic intro
  }

  // ── handlers ──────────────────────────────────────────────────────────────
  const handleLightClick = (name) => {
    playClick()
    if (name === 'Wall_Lamp_1') toggleWallLamp()
    if (name === 'TubeLight_1') toggleTubeLight()
  }

  const handleScreenClick = () => {
    playClick()
    if (orbitRef.current) orbitRef.current.enabled = false
    setScreenActive(true)
  }

  const handleExitScreen = () => {
    setShowOS(false)
    setScreenActive(false)
    setTimeout(() => { if (orbitRef.current) orbitRef.current.enabled = true }, 1400)
  }

  const handleDrawerClick = (name, willOpen) => {
    playDrawer(willOpen)
  }

  const SPEAKER_MESHES = ['Speaker_1', 'Speaker_2']
  const SHELF_MESHES   = ['Shelf_1', 'Shelf_2', 'Shelf_3']
  const DESK_MESHES    = ['Desk']
  const CAT_MESHES     = ['Cat']

  const handleObjectClick = (name) => {
    if (CAT_MESHES.some(s => name.toLowerCase().includes(s.toLowerCase()))) {
      playCat(); return
    }
    if (SPEAKER_MESHES.some(s => name.toLowerCase().includes(s.toLowerCase()))) {
      playClick(); togglePlaylist(); return
    }
    if (DESK_MESHES.some(s => name.toLowerCase() === s.toLowerCase())) {
      playClick()
      if (flyingRef.current) {
        flyingRef.current = false
        cameraFlyRef.current?.flyBack({
          onDone: () => { if (orbitRef.current) orbitRef.current.enabled = true }
        })
      } else {
        flyingRef.current = true
        if (orbitRef.current) orbitRef.current.enabled = false
        cameraFlyRef.current?.flyTo('Desk_View')
      }
      return
    }
    if (SHELF_MESHES.some(s => name.toLowerCase().includes(s.toLowerCase()))) {
      playClick()
      if (flyingRef.current) {
        flyingRef.current = false
        cameraFlyRef.current?.flyBack({
          onDone: () => { if (orbitRef.current) orbitRef.current.enabled = true }
        })
      } else {
        flyingRef.current = true
        if (orbitRef.current) orbitRef.current.enabled = false
        cameraFlyRef.current?.flyTo('Library_View')
      }
      return
    }
    handleClick(name)
  }

  useEffect(() => {
    if (activeModal) playPaper()
  }, [activeModal]) // eslint-disable-line

  // ── canvas blur style: blurred during loader, sharp after ─────────────────
  // This mirrors what IntroScreen did via body class.
  // We extend the same approach so the blur is continuous loader → intro → clear.
  useEffect(() => {
    if (showLoader) {
      document.body.classList.add('loader-active')
      document.body.classList.remove('intro-active')
    } else if (showIntro) {
      document.body.classList.remove('loader-active')
      document.body.classList.add('intro-active')
    } else {
      document.body.classList.remove('loader-active')
      document.body.classList.remove('intro-active')
    }
  }, [showLoader, showIntro])

  return (
    <div style={{ width: '100vw', height: '100vh', background: 'black' }}>

      {/* Global canvas blur rules (loader-active mirrors intro-active) */}
      <style>{`
        body.loader-active canvas {
          filter: blur(18px) brightness(0.4);
          transition: filter 1s cubic-bezier(0.16,1,0.3,1);
        }
      `}</style>

      <Canvas
        camera={{ position: [5, 5, 5], fov: 60 }}
        gl={{ stencil: true, antialias: true }}
        frameloop="always"
        onCreated={({ gl }) => {
          gl.setClearColor(new THREE.Color('#000000'), 1)
          gl.autoClear = false
        }}
      >
        <DynamicSceneLighting progressRef={progressRef} />
        <Suspense fallback={null}>
          <Model
            onReady={setReady}
            onObjectClick={handleObjectClick}
            onLightClick={handleLightClick}
            onSceneReady={setScene3D}
            onAcToggle={setAcOn}
            onSkillClick={setSkillTrigger}
            onScreenClick={handleScreenClick}
            onDrawerClick={handleDrawerClick}
          />
          {ready && scene3D && (
            <>
              <Renderer progressRef={progressRef} cycleDurationRef={cycleDurationRef} mode={WEATHER_MODE} />
              <OutlineEffect />
              <WallLampLight  on={wallLampOn}  scene={scene3D} />
              <TubeLightLight on={tubeLightOn} flickering={flickering} scene={scene3D} />
              <AcGlowEffect   on={acOn}        scene={scene3D} />
              <ScreenCamera
                active={screenActive}
                scene={scene3D}
                onArrived={() => setShowOS(true)}
              />
              <SleepEffect scene={scene3D} />
              <SmokeEffect scene={scene3D} />
              <CameraFly ref={cameraFlyRef} scene={scene3D} />
            </>
          )}
        </Suspense>
        <OrbitControls ref={orbitRef} />
      </Canvas>

      {/* ── Loader (highest layer, covers everything while GLB downloads) ── */}
      {showLoader && <LoaderScreen onDone={handleLoaderDone} />}

      {/* ── Cinematic intro (after load, before first interaction) ── */}
      {showIntro && <IntroScreen onDone={() => setShowIntro(false)} />}

      {/* ── HUD (only once intro is dismissed) ── */}
      {ready && !showOS && !showLoader && !showIntro && (
        <>
          <DayCycleGUI
            progressRef={progressRef}
            cycleDuration={cycleDuration}
            setCycleDuration={setCycleDuration}
            mode={WEATHER_MODE}
          />
          <HintLabel hoveredName={hoveredName} />
          <ModalRouter activeModal={activeModal} onClose={closeModal} />
          <SkillDiscovery trigger={skillTrigger} onClear={() => setSkillTrigger(null)} onAchievement={playAchievement} />

          {acOn && (
            <div style={{
              position: 'fixed', bottom: 90, left: '50%', transform: 'translateX(-50%)',
              background: 'rgba(0,20,20,0.85)', border: '1px solid #00ffcc',
              borderRadius: 8, padding: '6px 18px',
              fontFamily: 'monospace', fontSize: 13, color: '#00ffcc',
              pointerEvents: 'none', zIndex: 500,
            }}>❄ AC Running</div>
          )}

          <PlayingBanner nowPlaying={nowPlaying} />
        </>
      )}

      {showOS && <ScreenOS onExit={handleExitScreen} />}
    </div>
  )
}