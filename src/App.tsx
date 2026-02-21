import { Canvas } from '@react-three/fiber'
import { XR } from '@react-three/xr'
import { Physics } from '@react-three/rapier'
import { useState, useRef } from 'react'
import * as THREE from 'three'

import { store } from './store'
import { Player } from './components/Player'
import { ExitDoor, Keycard } from './components/EscapeMechanics'
import { DissectionSubject } from './components/DissectionSubject'
import { BiologyLabRoom, FloatingInfoPanel, LightSwitch, LabTray } from './components/Environment'
import { Incubator, AnatomyChart } from './components/Furniture'
import { PatrolEnemy } from './components/PatrolEnemy'
import {
  PetriDish, SpecimenJar, ErlenmeyerFlask, BunsenBurner, HotPlate,
  MagnifyingGlass, ScalpelProp, Forceps, MicroscopeSlides
} from './components/Props'

import { Environment } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'

// ---------------------------------------------------------
// Main App Component
// ---------------------------------------------------------
export default function App() {
  const [incisionCount, setIncisionCount] = useState(0)
  const [isLightOn, setIsLightOn] = useState(false)
  const [hasKey, setHasKey] = useState(false)
  const [escaped, setEscaped] = useState(false)
  const [caught, setCaught] = useState(false)

  const playerPosRef = useRef(new THREE.Vector3())

  return (
    <>
      {escaped && (
        <div style={{
          position: 'absolute', top: 0, left: 0, width: '100vw', height: '100vh',
          backgroundColor: 'rgba(46, 204, 113, 0.8)', zIndex: 100,
          display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: 'white',
          backdropFilter: 'blur(10px)'
        }}>
          <h1 style={{ fontSize: '5rem', textShadow: '2px 2px 10px black' }}>YOU ESCAPED!</h1>
          <button onClick={() => window.location.reload()} style={{ padding: '20px', fontSize: '1.5rem', cursor: 'pointer', borderRadius: '10px', border: 'none', backgroundColor: 'white', color: 'black', fontWeight: 'bold' }}>Play Again</button>
        </div>
      )}

      {caught && (
        <div style={{
          position: 'absolute', top: 0, left: 0, width: '100vw', height: '100vh',
          backgroundColor: 'rgba(192, 57, 43, 0.9)', zIndex: 100,
          display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: 'white',
          backdropFilter: 'blur(15px)'
        }}>
          <h1 style={{ fontSize: '5rem', textShadow: '2px 2px 10px black' }}>YOU WERE CAUGHT!</h1>
          <button onClick={() => window.location.reload()} style={{ padding: '20px', fontSize: '1.5rem', cursor: 'pointer', borderRadius: '10px', border: 'none', backgroundColor: 'white', color: 'black', fontWeight: 'bold' }}>Try Again</button>
        </div>
      )}

      {/* FPS Crosshair */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        color: 'rgba(255,255,255,0.7)', fontSize: '24px', pointerEvents: 'none', zIndex: 10
      }}>+</div>

      <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 1, display: 'flex', flexDirection: 'column', gap: '15px', color: 'white', fontFamily: 'sans-serif', pointerEvents: 'none' }}>
        <div style={{ pointerEvents: 'auto' }}>
          <button
            onClick={() => store.enterAR()}
            style={{
              padding: '12px 24px',
              fontSize: '18px',
              backgroundColor: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              fontWeight: 'bold',
              transition: 'all 0.2s ease'
            }}
          >
            Enter Lab (Virtual Reality)
          </button>
        </div>

        {/* Premium Glassmorphism UI */}
        <div style={{
          background: 'rgba(20, 20, 25, 0.7)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          padding: '24px',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          maxWidth: '380px',
          pointerEvents: 'auto',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
        }}>
          <h2 style={{ margin: '0 0 5px 0', color: '#fca5a5', fontSize: '22px', fontWeight: '800', letterSpacing: '0.5px' }}>BIO-RESEARCH LAB</h2>
          <p style={{ margin: '0 0 15px 0', fontSize: '12px', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>Hazard Level: Critical</p>

          <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '14px', lineHeight: '1.7', color: '#ccc' }}>
            <li><b>Look Around:</b> Click to lock pointer. Use mouse to look.</li>
            <li><b>Walk:</b> Use <span style={{ color: '#fff', background: '#333', padding: '2px 6px', borderRadius: '4px' }}>W A S D</span> keys.</li>
            <li><b>Flashlight:</b> Press <span style={{ color: '#fff', background: '#333', padding: '2px 6px', borderRadius: '4px' }}>F</span> to toggle.</li>
            <li><b>Escape:</b> Find the **Keycard** & reach the **Main Door**.</li>
            <li style={{ color: '#f87171', marginTop: '5px' }}><b>Warning:</b> Shadow Patrol active. Detection = Termination.</li>
          </ul>

          <div style={{ marginTop: '20px', paddingTop: '15px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', color: '#aaa', textTransform: 'uppercase' }}>Progression:</span>
            <span style={{ fontSize: '24px', fontWeight: '900', color: '#10b981', fontFamily: 'monospace' }}>{incisionCount.toString().padStart(2, '0')}</span>
          </div>
        </div>
      </div>

      <Canvas
        style={{ width: '100vw', height: '100vh', background: '#000' }}
        camera={{ position: [0, 1.6, 2], fov: 60 }}
        shadows={{ type: THREE.PCFShadowMap }}
        dpr={[1, 2]}
      >
        {isLightOn && <Environment preset="night" />}

        <Physics>
          <BiologyLabRoom isLightOn={isLightOn} />

          <LightSwitch position={[9.8, 1.3, 2]} rotation={[0, -Math.PI / 2, 0]} onToggle={setIsLightOn} />

          <FloatingInfoPanel position={[-2, 1.5, -2]} rotation={[0, 0.5, 0]} incisionCount={incisionCount} />

          <ExitDoor position={[0, 0, -9.8]} rotation={[0, 0, 0]} hasKey={hasKey} onEscape={() => setEscaped(true)} />
          <Keycard position={[-9, 1, 5]} onCollect={() => setHasKey(true)} />

          <Player positionRef={playerPosRef} />

          <PatrolEnemy playerRef={playerPosRef} onCatch={() => setCaught(true)} />

          <XR store={store}>
            <ambientLight intensity={isLightOn ? 0.15 : 0.02} />
            {isLightOn ? (
              <directionalLight position={[0, 10, 5]} intensity={0.4} castShadow />
            ) : (
              <pointLight position={[0, 3, 0]} intensity={1.5} color="#ff0000" distance={10} />
            )}

            <group position={[0, 0.8, 0]}>
              <LabTray />
              <DissectionSubject onMakeIncision={() => setIncisionCount(c => c + 1)} />

              <PetriDish position={[-0.4, 0.05, 0.15]} />
              <PetriDish position={[-0.45, 0.05, -0.05]} />
              <SpecimenJar position={[0.4, 0.05, -0.2]} blobColor="#556b2f" />
              <ErlenmeyerFlask position={[0.45, 0.05, 0.2]} liquidColor="#3498db" />
              <BunsenBurner position={[-0.3, 0.05, -0.25]} />
              <HotPlate position={[-0.3, 0.05, -0.3]} rotation={[0, 0.2, 0]} />

              <MagnifyingGlass position={[-0.2, 0.05, 0.3]} rotation={[-Math.PI / 2, 0, 0]} />
              <ScalpelProp position={[0.2, 0.05, 0.3]} rotation={[0, 0.5, 0]} />
              <ScalpelProp position={[0.25, 0.05, 0.25]} rotation={[0, -0.2, 0]} />
              <Forceps position={[0.1, 0.05, 0.2]} rotation={[0, 0.3, 0]} />
              <MicroscopeSlides position={[-0.35, 0.05, 0.2]} />
            </group>

            <Incubator position={[4, 0.8, 1]} rotation={[0, -1, 0]} />
            <AnatomyChart position={[-9.9, 1.5, 1]} rotation={[0, Math.PI / 2, 0]} imageType="circulatory" />
            <AnatomyChart position={[-9.9, 1.5, 3]} rotation={[0, Math.PI / 2, 0]} imageType="skeleton" />
          </XR>
        </Physics>

        {/* Post-Processing Effects */}
        <EffectComposer multisampling={8}>
          <Bloom
            intensity={0.4}
            luminanceThreshold={0.9}
            luminanceSmoothing={0.9}
            mipmapBlur
          />
          <Vignette
            offset={0.3}
            darkness={0.8}
            blendFunction={BlendFunction.NORMAL}
          />
          <Noise
            opacity={0.05}
            premultiply
            blendFunction={BlendFunction.SOFT_LIGHT}
          />
        </EffectComposer>
      </Canvas>
    </>
  )
}
