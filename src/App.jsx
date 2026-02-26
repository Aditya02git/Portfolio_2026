import { Canvas } from '@react-three/fiber'
import { OrbitControls, useProgress } from '@react-three/drei'
import { Suspense, useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
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
import IntroScreen from './ui/IntroScreen.jsx'
import SleepEffect from './scene/SleepEffect.jsx'
import CameraFly from './scene/CameraFly.jsx'
import SmokeEffect from './scene/SmokeEffect.jsx'
import PlayingBanner from './ui/PlayingBanner.jsx'
import Model from './scene/Model.jsx'

const NIGHT_CHECK_INTERVAL = 2000

// ── Inner component so useProgress can run inside Canvas context ──────────────
function SceneWithProgress({ onProgress, ...sceneProps }) {
  const { progress } = useProgress()

  useEffect(() => {
    onProgress(progress)
  }, [progress, onProgress])

  return <SceneContents {...sceneProps} />
}

// ── All the scene contents, extracted so App stays clean ─────────────────────
function SceneContents({
  onReady,
  onObjectClick,
  onLightClick,
  onSceneReady,
  onAcToggle,
  onSkillClick,
  onScreenClick,
  onDrawerClick,
  ready,
  scene3D,
  wallLampOn,
  tubeLightOn,
  flickering,
  acOn,
  screenActive,
  progressRef,
  cycleDurationRef,
}) {
  return (
    <Suspense fallback={null}>
      <Model
        onReady={onReady}
        onObjectClick={onObjectClick}
        onLightClick={onLightClick}
        onSceneReady={onSceneReady}
        onAcToggle={onAcToggle}
        onSkillClick={onSkillClick}
        onScreenClick={onScreenClick}
        onDrawerClick={onDrawerClick}
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
          />
          <SleepEffect scene={scene3D} />
          <SmokeEffect scene={scene3D} />
        </>
      )}
    </Suspense>
  )
}

export default function App() {
  const [ready, setReady]               = useState(false)
  const [scene3D, setScene3D]           = useState(null)
  const [acOn, setAcOn]                 = useState(false)
  const [screenActive, setScreenActive] = useState(false)
  const [showOS, setShowOS]             = useState(false)
  const [showIntro, setShowIntro]       = useState(true)
  const [cycleDuration, setCycleDuration] = useState(60)
  const [hoveredName, setHoveredName]   = useState(null)
  const [skillTrigger, setSkillTrigger] = useState(null)
  const [loadProgress, setLoadProgress] = useState(0)

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

  // ── handlers ───────────────────────────────────────────────────────────────

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
      playCat()
      return
    }
    if (SPEAKER_MESHES.some(s => name.toLowerCase().includes(s.toLowerCase()))) {
      playClick()
      togglePlaylist()
      return
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

  return (
    <div style={{ width: '100vw', height: '100vh', background: 'black' }}>
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

        {/* SceneWithProgress lives inside Canvas so useProgress works correctly */}
        <SceneWithProgress
          onProgress={setLoadProgress}
          onReady={setReady}
          onObjectClick={handleObjectClick}
          onLightClick={handleLightClick}
          onSceneReady={setScene3D}
          onAcToggle={setAcOn}
          onSkillClick={setSkillTrigger}
          onScreenClick={handleScreenClick}
          onDrawerClick={handleDrawerClick}
          ready={ready}
          scene3D={scene3D}
          wallLampOn={wallLampOn}
          tubeLightOn={tubeLightOn}
          flickering={flickering}
          acOn={acOn}
          screenActive={screenActive}
          progressRef={progressRef}
          cycleDurationRef={cycleDurationRef}
        />

        <OrbitControls ref={orbitRef} />
        <CameraFly ref={cameraFlyRef} scene={scene3D} />
      </Canvas>

      {ready && !showOS && (
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

      {/* IntroScreen stays visible until user clicks Explore AND scene is loaded */}
      {showIntro && (
        <IntroScreen
          progress={loadProgress}
          onDone={() => setShowIntro(false)}
        />
      )}
    </div>
  )
}