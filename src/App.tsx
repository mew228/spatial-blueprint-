import { Canvas, useFrame } from '@react-three/fiber'
import { XR, createXRStore } from '@react-three/xr'
import { Physics, RigidBody } from '@react-three/rapier'
import { useState, useRef, useEffect, useMemo } from 'react'
import * as THREE from 'three'

const store = createXRStore()

import { AnatomicalTorso, BrainModel } from './components/AnatomyModels'
import {
  StorageCabinet, HazardBin, Stool, LabCoatStand, Incubator, AnatomyChart
} from './components/Furniture'
import {
  Microscope, SpecimenJar, ErlenmeyerFlask, PetriDish,
  Centrifuge, BunsenBurner, SafetyGoggles, Autoclave,
  HotPlate, MagnifyingGlass, ScalpelProp, Forceps, MicroscopeSlides
} from './components/Props'
// ---------------------------------------------------------
// Component 1: The Dissection Subject (e.g., an organ or frog)
// ---------------------------------------------------------
function DissectionSubject({ onMakeIncision }: { onMakeIncision: (points: THREE.Vector3[]) => void }) {
  const [allPoints, setAllPoints] = useState<THREE.Vector3[]>([])

  const currentIncisionRef = useRef<THREE.Vector3[]>([])
  const isCuttingRef = useRef(false)
  const instancedMeshRef = useRef<THREE.InstancedMesh>(null)
  const meshRef = useRef<THREE.Mesh>(null)
  const groupRef = useRef<THREE.Group>(null)

  const desktopRaycaster = useMemo(() => new THREE.Raycaster(), [])

  function triggerHapticPulse(intensity: number, durationMs: number) {
    const session = store.getState().session
    if (session && session.inputSources) {
      for (const source of session.inputSources) {
        if (source.gamepad && source.gamepad.hapticActuators && source.gamepad.hapticActuators.length > 0) {
          source.gamepad.hapticActuators[0].pulse(intensity, durationMs).catch(() => { })
        }
      }
    }
  }

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      // Start crosshair drawing ONLY if FPS mode is active (mouse locked)
      if (document.pointerLockElement && e.button === 0) {
        isCuttingRef.current = true
        currentIncisionRef.current = [] // Start fresh
      }
    }
    const handleMouseUp = (e: MouseEvent) => {
      // Finish crosshair drawing
      if (document.pointerLockElement && e.button === 0 && isCuttingRef.current) {
        isCuttingRef.current = false
        if (currentIncisionRef.current.length > 1) {
          onMakeIncision([...currentIncisionRef.current])
        }
        currentIncisionRef.current = []
        triggerHapticPulse(0.8, 50)
      }
    }

    window.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [onMakeIncision])

  useFrame((state) => {
    // --- FPS Desktop Drawing (Crosshair Raycast) ---
    // Instead of relying on static pointer coords, we shoot a ray from the absolute center (0,0) every frame!
    if (isCuttingRef.current && document.pointerLockElement && meshRef.current) {
      desktopRaycaster.setFromCamera(new THREE.Vector2(0, 0), state.camera)
      const intersects = desktopRaycaster.intersectObject(meshRef.current)

      if (intersects.length > 0) {
        let point = intersects[0].point.clone()
        if (groupRef.current) groupRef.current.worldToLocal(point)

        const lastPoint = currentIncisionRef.current[currentIncisionRef.current.length - 1]

        // Add new point if we moved far enough
        if (!lastPoint || point.distanceTo(lastPoint) > 0.002) {
          currentIncisionRef.current.push(point)
          setAllPoints(prev => [...prev, point])
          triggerHapticPulse(0.1, 100)
        }
      }
    }

    // --- Instanced Mesh Visual Updates ---
    if (instancedMeshRef.current && allPoints.length > 0) {
      const dummy = new THREE.Object3D()
      allPoints.forEach((point, i) => {
        // Slightly offset outward to prevent z-fighting with the capsule
        dummy.position.copy(point).add(new THREE.Vector3(0, 0.002, 0))
        dummy.updateMatrix()
        instancedMeshRef.current!.setMatrixAt(i, dummy.matrix)
      })
      instancedMeshRef.current.instanceMatrix.needsUpdate = true
      instancedMeshRef.current.count = allPoints.length
    }
  })

  // --- XR Native Events ---
  // These fire via VR controllers, ignoring the FPS crosshair logic above
  const handlePointerDown = (e: any) => {
    if (document.pointerLockElement) return
    e.stopPropagation()
    if (!e.point) return

    let point = e.point.clone()
    if (groupRef.current) groupRef.current.worldToLocal(point)

    isCuttingRef.current = true
    currentIncisionRef.current = [point]

    setAllPoints(prev => [...prev, point])
    triggerHapticPulse(0.3, 30)
  }

  const handlePointerMove = (e: any) => {
    if (document.pointerLockElement || !isCuttingRef.current) return
    e.stopPropagation()
    if (!e.point) return

    let point = e.point.clone()
    if (groupRef.current) groupRef.current.worldToLocal(point)

    const lastPoint = currentIncisionRef.current[currentIncisionRef.current.length - 1]
    if (lastPoint && point.distanceTo(lastPoint) > 0.002) {
      currentIncisionRef.current.push(point)
      setAllPoints(prev => [...prev, point])
      triggerHapticPulse(0.1, 100)
    }
  }

  const handlePointerUp = (e: any) => {
    if (document.pointerLockElement || !isCuttingRef.current) return
    e.stopPropagation()

    isCuttingRef.current = false
    if (currentIncisionRef.current.length > 1) {
      onMakeIncision([...currentIncisionRef.current])
    }

    currentIncisionRef.current = []
    triggerHapticPulse(0.8, 50)
  }

  return (
    <group ref={groupRef}>
      <mesh
        ref={meshRef}
        position={[0, 0.05, 0]}
        rotation={[Math.PI / 2, 0, 0]}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerOut={handlePointerUp}
      >
        <capsuleGeometry args={[0.15, 0.3, 8, 8]} />
        <meshStandardMaterial color="#c27b7d" roughness={0.6} transparent opacity={0.9} />
      </mesh>

      <instancedMesh
        ref={instancedMeshRef}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        args={[undefined as any, undefined as any, 10000]}
      >
        <sphereGeometry args={[0.003, 8, 8]} />
        <meshBasicMaterial color="#4a0f11" />
      </instancedMesh>
    </group>
  )
}

import { Environment, PointerLockControls, Text, Float } from '@react-three/drei'

function Player() {
  const [movement, setMovement] = useState({ forward: false, backward: false, left: false, right: false })

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW': setMovement(m => ({ ...m, forward: true })); break
        case 'KeyS': setMovement(m => ({ ...m, backward: true })); break
        case 'KeyA': setMovement(m => ({ ...m, left: true })); break
        case 'KeyD': setMovement(m => ({ ...m, right: true })); break
      }
    }
    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW': setMovement(m => ({ ...m, forward: false })); break
        case 'KeyS': setMovement(m => ({ ...m, backward: false })); break
        case 'KeyA': setMovement(m => ({ ...m, left: false })); break
        case 'KeyD': setMovement(m => ({ ...m, right: false })); break
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('keyup', handleKeyUp)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  useFrame((state, delta) => {
    // Only move if pointer is locked (desktop) or we are rendering
    const speed = 2 * delta
    const { forward, backward, left, right } = movement

    const direction = new THREE.Vector3()
    const frontVector = new THREE.Vector3(0, 0, (backward ? 1 : 0) - (forward ? 1 : 0))
    const sideVector = new THREE.Vector3((left ? 1 : 0) - (right ? 1 : 0), 0, 0)

    direction.subVectors(frontVector, sideVector).normalize().multiplyScalar(speed)
    direction.applyQuaternion(state.camera.quaternion)
    direction.y = 0 // Keep movement strictly horizontal

    state.camera.position.add(direction)

    // Lock player height to average standing height (1.6m) 
    // unless in standard WebXR session where headset tracks height
    if (!store.getState().session) {
      state.camera.position.y = 1.6
    }
  })

  // PointerLockControls hides the mouse and lets you aim with the head (FPS style)
  return <PointerLockControls />
}

// ---------------------------------------------------------
// Component 2: The Physical Environment (Lab Tray)
// ---------------------------------------------------------
function LabTray() {
  return (
    <RigidBody type="fixed" colliders="trimesh">
      <group position={[0, 0, 0]}>
        {/* The Tray Base */}
        <mesh position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.6, 0.4]} /> {/* 60cm x 40cm tray */}
          <meshStandardMaterial color="#e0e0e0" metalness={0.8} roughness={0.2} />
        </mesh>

        {/* Wax liner for slicing into */}
        <mesh position={[0, -0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.58, 0.38]} />
          <meshStandardMaterial color="#2c3e50" roughness={0.9} /> {/* Dark wax */}
        </mesh>

        {/* Tray Borders */}
        <mesh position={[0, 0.01, -0.2]}><boxGeometry args={[0.6, 0.04, 0.02]} /><meshStandardMaterial color="#cccccc" metalness={0.8} roughness={0.2} /></mesh>
        <mesh position={[0, 0.01, 0.2]}><boxGeometry args={[0.6, 0.04, 0.02]} /><meshStandardMaterial color="#cccccc" metalness={0.8} roughness={0.2} /></mesh>
        <mesh position={[-0.3, 0.01, 0]}><boxGeometry args={[0.02, 0.04, 0.4]} /><meshStandardMaterial color="#cccccc" metalness={0.8} roughness={0.2} /></mesh>
        <mesh position={[0.3, 0.01, 0]}><boxGeometry args={[0.02, 0.04, 0.4]} /><meshStandardMaterial color="#cccccc" metalness={0.8} roughness={0.2} /></mesh>
      </group>
    </RigidBody>
  )
}

// ---------------------------------------------------------
// Component 3: The Full Lab Environment Room
// ---------------------------------------------------------
function LightSwitch({ position, rotation, onToggle }: { position: [number, number, number], rotation?: [number, number, number], onToggle: (isOn: boolean) => void }) {
  const [isOn, setIsOn] = useState(true)

  const handleClick = (e: any) => {
    // Only accept clicks if pointer is locked or via VR controller
    if (!document.pointerLockElement && e.sourceEvent?.type === "click") return;

    e.stopPropagation()
    const newState = !isOn
    setIsOn(newState)
    onToggle(newState)
  }

  return (
    <group position={position} rotation={rotation || [0, 0, 0]}>
      <mesh onClick={handleClick} onPointerDown={handleClick}>
        <boxGeometry args={[0.1, 0.15, 0.02]} />
        <meshStandardMaterial color="#34495e" roughness={0.8} />
      </mesh>
      {/* The switch button */}
      <mesh position={[0, isOn ? 0.02 : -0.02, 0.015]} rotation={[isOn ? -0.1 : 0.1, 0, 0]}>
        <boxGeometry args={[0.04, 0.06, 0.02]} />
        <meshStandardMaterial color={isOn ? "#2ecc71" : "#e74c3c"} emissive={isOn ? "#2ecc71" : "#e74c3c"} emissiveIntensity={0.5} />
      </mesh>
    </group>
  )
}

function BiologyLabRoom({ isLightOn }: { isLightOn: boolean }) {
  return (
    <group>
      {/* Floor - Clean Linoleum */}
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        {/* Dark Blue-Grey floor */}
        <meshStandardMaterial color="#2c3e50" roughness={0.8} metalness={0.2} />
      </mesh>

      {/* Ceiling - Acoustic Tiles */}
      <mesh position={[0, 3.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#34495e" roughness={0.9} />
      </mesh>

      {/* Walls - Clean White/Grey Medical Aesthetic */}
      <mesh position={[0, 1.75, -10]} receiveShadow>
        <planeGeometry args={[20, 3.5]} />
        {/* Accent medical teal wall at the back */}
        <meshStandardMaterial color="#1abc9c" roughness={0.7} />
      </mesh>
      <mesh position={[0, 1.75, 10]} rotation={[0, Math.PI, 0]} receiveShadow>
        <planeGeometry args={[20, 3.5]} />
        <meshStandardMaterial color="#ecf0f1" roughness={0.8} />
      </mesh>
      <mesh position={[-10, 1.75, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[20, 3.5]} />
        <meshStandardMaterial color="#d5d8dc" roughness={0.8} />
      </mesh>
      <mesh position={[10, 1.75, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[20, 3.5]} />
        <meshStandardMaterial color="#d5d8dc" roughness={0.8} />
      </mesh>

      {/* Walls - Clean White/Grey Medical Aesthetic */}

      {/* Whiteboard on Right Wall */}
      <mesh position={[9.9, 1.5, 1]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[3, 1.2]} />
        <meshStandardMaterial color="#ffffff" roughness={0.2} metalness={0.1} />
      </mesh>
      {/* Whiteboard Frame */}
      <mesh position={[9.95, 1.5, 1]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <boxGeometry args={[3.1, 1.3, 0.05]} />
        <meshStandardMaterial color="#888888" roughness={0.4} />
      </mesh>

      {/* Anatomy Poster on Left Wall */}
      <mesh position={[-9.9, 1.6, -1]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[1.2, 1.8]} />
        <meshStandardMaterial color="#2c3e50" roughness={0.5} /> {/* Dark blue frame */}
      </mesh>
      {/* Poster Graphic Simulation */}
      <mesh position={[-9.89, 1.6, -1]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[0.9, 1.5]} />
        <meshStandardMaterial color="#ecf0f1" roughness={0.5} /> {/* White inner chart */}
      </mesh>

      {/* --- BACK LAB COUNTER --- */}
      <group position={[0, 0.9, -9.5]}>
        {/* Epoxy Countertop */}
        <mesh position={[0, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[16, 0.05, 1]} />
          <meshStandardMaterial color="#222222" metalness={0.4} roughness={0.2} />
        </mesh>
        {/* Wood Cabinets */}
        <mesh position={[-7.5, -0.45, 0]} castShadow receiveShadow><boxGeometry args={[1, 0.9, 0.9]} /><meshStandardMaterial color="#9c6644" roughness={0.8} /></mesh>
        <mesh position={[-3.5, -0.45, 0]} castShadow receiveShadow><boxGeometry args={[1, 0.9, 0.9]} /><meshStandardMaterial color="#9c6644" roughness={0.8} /></mesh>
        <mesh position={[0, -0.45, 0]} castShadow receiveShadow><boxGeometry args={[1, 0.9, 0.9]} /><meshStandardMaterial color="#9c6644" roughness={0.8} /></mesh>
        <mesh position={[3.5, -0.45, 0]} castShadow receiveShadow><boxGeometry args={[1, 0.9, 0.9]} /><meshStandardMaterial color="#9c6644" roughness={0.8} /></mesh>
        <mesh position={[7.5, -0.45, 0]} castShadow receiveShadow><boxGeometry args={[1, 0.9, 0.9]} /><meshStandardMaterial color="#9c6644" roughness={0.8} /></mesh>

        {/* Props */}
        {/* Removed shadows from small items to improve rendering performance */}
        <Microscope position={[-2.5, 0.025, 0]} rotation={[0, 0.5, 0]} />
        <Microscope position={[2.5, 0.025, 0]} rotation={[0, -0.3, 0]} />
        <SpecimenJar position={[4.5, 0.025, -0.2]} blobColor="#b83b5e" />
        <SpecimenJar position={[4.7, 0.025, 0.1]} blobColor="#6a2c70" />
        <ErlenmeyerFlask position={[1.5, 0.025, 0.1]} liquidColor="#3498db" />
        <ErlenmeyerFlask position={[1.7, 0.025, -0.1]} liquidColor="#2ecc71" />

        <Centrifuge position={[-5, 0.025, -0.1]} rotation={[0, 0.2, 0]} />
        <BunsenBurner position={[-7, 0.025, 0]} />
        <HotPlate position={[-3.5, 0.025, 0]} />

        {/* Sink moved to back counter */}
        <group position={[-5, 0, -0.1]}>
          <mesh position={[0, 0.03, 0]}><boxGeometry args={[0.6, 0.02, 0.4]} /><meshStandardMaterial color="#111111" roughness={0.8} /></mesh>
          <mesh position={[0, 0.15, -0.15]}><cylinderGeometry args={[0.015, 0.015, 0.3]} /><meshStandardMaterial color="#bdc3c7" metalness={0.9} roughness={0.2} /></mesh>
        </group>
      </group>

      {/* --- LEFT LAB COUNTER (Anatomical Models) --- */}
      <group position={[-9.5, 0.9, 0]} rotation={[0, Math.PI / 2, 0]}>
        {/* Epoxy Countertop */}
        <mesh position={[0, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[12, 0.05, 1]} />
          <meshStandardMaterial color="#222222" metalness={0.4} roughness={0.2} />
        </mesh>
        <mesh position={[-5.5, -0.45, 0]} castShadow receiveShadow><boxGeometry args={[1, 0.9, 0.9]} /><meshStandardMaterial color="#9c6644" roughness={0.8} /></mesh>
        <mesh position={[0, -0.45, 0]} castShadow receiveShadow><boxGeometry args={[1, 0.9, 0.9]} /><meshStandardMaterial color="#9c6644" roughness={0.8} /></mesh>
        <mesh position={[5.5, -0.45, 0]} castShadow receiveShadow><boxGeometry args={[1, 0.9, 0.9]} /><meshStandardMaterial color="#9c6644" roughness={0.8} /></mesh>

        {/* Props */}
        <AnatomicalTorso position={[0, 0.025, 0]} rotation={[0, Math.PI, 0]} />
        <BrainModel position={[2.5, 0.025, 0]} rotation={[0, Math.PI, 0]} />
        {/* Eye/Ear models conceptualized as jars for now or primitive structures */}
        <SpecimenJar position={[-2, 0.025, 0]} blobColor="#e6a8d7" /> {/* Preserved Brain/Heart */}
        <SpecimenJar position={[-2.3, 0.025, -0.2]} blobColor="#cc0000" />
      </group>

      {/* --- RIGHT LAB COUNTER (Safety & Prep) --- */}
      <group position={[9.5, 0.9, 0]} rotation={[0, -Math.PI / 2, 0]}>
        {/* Epoxy Countertop */}
        <mesh position={[0, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[12, 0.05, 1]} />
          <meshStandardMaterial color="#222222" metalness={0.4} roughness={0.2} />
        </mesh>
        <mesh position={[-5.5, -0.45, 0]} castShadow receiveShadow><boxGeometry args={[1, 0.9, 0.9]} /><meshStandardMaterial color="#9c6644" roughness={0.8} /></mesh>
        <mesh position={[0, -0.45, 0]} castShadow receiveShadow><boxGeometry args={[1, 0.9, 0.9]} /><meshStandardMaterial color="#9c6644" roughness={0.8} /></mesh>
        <mesh position={[5.5, -0.45, 0]} castShadow receiveShadow><boxGeometry args={[1, 0.9, 0.9]} /><meshStandardMaterial color="#9c6644" roughness={0.8} /></mesh>

        {/* Props */}
        <SafetyGoggles position={[0, 0.025, 0.1]} rotation={[0, -0.4, 0]} />
        <SafetyGoggles position={[0.4, 0.025, -0.1]} rotation={[0, 0.2, 0]} />
        <SafetyGoggles position={[-0.4, 0.025, 0]} rotation={[0, 0.8, 0]} />

        {/* Extra glassware */}
        <ErlenmeyerFlask position={[-3, 0.025, 0.1]} liquidColor="#e67e22" />
        <ErlenmeyerFlask position={[-3.2, 0.025, -0.1]} liquidColor="#8e44ad" />
        <BunsenBurner position={[3, 0.025, 0]} />

        {/* Autoclave */}
        <Autoclave position={[4.5, 0.025, 0]} />
      </group>
      {/* Floor Coat Stand and other floor furniture */}
      <LabCoatStand position={[9, 0, 5]} />
      <StorageCabinet position={[-9.6, 0, 8]} rotation={[0, Math.PI / 2, 0]} />
      <StorageCabinet position={[9.6, 0, -8]} rotation={[0, -Math.PI / 2, 0]} />
      <HazardBin position={[-8, 0, -8]} />
      <HazardBin position={[8, 0, 8]} />
      <HazardBin position={[-2, 0, 1.5]} />
      <Stool position={[0, 0, 1.5]} />
      <Stool position={[-1.5, 0, 0]} />
      <Stool position={[1.5, 0, 0]} />

      {/* Main Center Dissection Table (Where the player works) - Stainless Steel Top with Dark Blue Frame */}
      <group position={[0, 0.8, 0]}>
        {/* Table Top */}
        <mesh position={[0, -0.025, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.5, 0.05, 0.8]} />
          {/* Darker green/teal metal look */}
          <meshStandardMaterial color="#88a89f" metalness={0.7} roughness={0.2} />
        </mesh>
        {/* Table Frame/Skirt */}
        <mesh position={[0, -0.1, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.4, 0.1, 0.7]} />
          <meshStandardMaterial color="#2c3e50" metalness={0.2} roughness={0.6} />
        </mesh>
        {/* Table Legs */}
        <mesh position={[-0.65, -0.4, -0.3]} castShadow><cylinderGeometry args={[0.04, 0.04, 0.8, 8]} /><meshStandardMaterial color="#2c3e50" metalness={0.2} roughness={0.6} /></mesh>
        <mesh position={[0.65, -0.4, -0.3]} castShadow><cylinderGeometry args={[0.04, 0.04, 0.8, 8]} /><meshStandardMaterial color="#2c3e50" metalness={0.2} roughness={0.6} /></mesh>
        <mesh position={[-0.65, -0.4, 0.3]} castShadow><cylinderGeometry args={[0.04, 0.04, 0.8, 8]} /><meshStandardMaterial color="#2c3e50" metalness={0.2} roughness={0.6} /></mesh>
        <mesh position={[0.65, -0.4, 0.3]} castShadow><cylinderGeometry args={[0.04, 0.04, 0.8, 8]} /><meshStandardMaterial color="#2c3e50" metalness={0.2} roughness={0.6} /></mesh>
      </group>

      {/* Medical Overhead Lights */}
      <group position={[0, 3.4, 0]}> {/* Raised closer to new ceiling */}
        {/* Light Housing */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[2.2, 0.15, 0.6]} />
          <meshStandardMaterial color="#dddddd" roughness={0.5} />
        </mesh>
        {/* Emissive Panel */}
        <mesh position={[0, -0.08, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <planeGeometry args={[2, 0.4]} />
          <meshStandardMaterial color={isLightOn ? "#ffffff" : "#440000"} emissive={isLightOn ? "#ffffff" : "#ff0000"} emissiveIntensity={isLightOn ? 0.8 : 0.2} />
        </mesh>
      </group>
    </group>
  )
}

// ---------------------------------------------------------
// Component 4: Floating 3D Info Panel
// ---------------------------------------------------------
function FloatingInfoPanel({ position, rotation, incisionCount }: { position: [number, number, number], rotation: [number, number, number], incisionCount: number }) {
  return (
    <Float speed={2} rotationIntensity={0.1} floatIntensity={0.5} position={position} rotation={rotation}>
      <group>
        {/* Glass Screen */}
        <mesh position={[0, 0, -0.01]}>
          <planeGeometry args={[1.5, 1]} />
          <meshPhysicalMaterial color="#ffffff" transmission={0.9} opacity={0.6} transparent roughness={0.1} />
        </mesh>
        {/* Frame */}
        <mesh position={[0, 0, -0.015]}>
          <boxGeometry args={[1.55, 1.05, 0.01]} />
          <meshStandardMaterial color="#2c3e50" metalness={0.8} />
        </mesh>

        <Text position={[0, 0.35, 0]} fontSize={0.15} color="#fca5a5" anchorX="center" anchorY="middle">
          Virtual Biology Lab
        </Text>
        <Text position={[0, 0.2, 0]} fontSize={0.06} color="#aaa" anchorX="center" anchorY="middle">
          Immersive VR Experience
        </Text>

        <Text position={[-0.65, 0, 0]} fontSize={0.06} color="#fff" anchorX="left" anchorY="middle" maxWidth={1.3} lineHeight={1.5}>
          1. Look Around: Click anywhere to lock pointer. Press ESC to unlock.
          2. Walk: Use W, A, S, D keys.
          3. Incision: Aim crosshair at the pink subject, click & drag.
        </Text>

        <Text position={[-0.65, -0.35, 0]} fontSize={0.08} color="#ddd" anchorX="left" anchorY="middle">
          Successful Incisions:
        </Text>
        <Text position={[0.65, -0.35, 0]} fontSize={0.12} color="#10b981" anchorX="right" anchorY="middle">
          {incisionCount.toString()}
        </Text>
      </group>
    </Float>
  )
}

// ---------------------------------------------------------
// Main App Component
// ---------------------------------------------------------
export default function App() {
  const [incisionCount, setIncisionCount] = useState(0)
  const [isLightOn, setIsLightOn] = useState(true)

  return (
    <>
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
              fontWeight: 'bold'
            }}
          >
            Enter Lab (Virtual Reality)
          </button>
        </div>

        <div style={{ backgroundColor: 'rgba(0,0,0,0.8)', padding: '20px', borderRadius: '12px', border: '1px solid #444', maxWidth: '350px', pointerEvents: 'auto' }}>
          <h2 style={{ margin: '0 0 5px 0', color: '#fca5a5' }}>Virtual Biology Lab</h2>
          <p style={{ margin: '0 0 15px 0', fontSize: '14px', color: '#aaa' }}>Immersive VR Mode (Desktop)</p>

          <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '15px', lineHeight: '1.6' }}>
            <li><b>1. Look Around:</b> Click anywhere to lock pointer. Use mouse to look. Press ESC to unlock.</li>
            <li><b>2. Walk:</b> Use W, A, S, D keys to walk around the lab.</li>
            <li><b>3. Incision:</b> Aim crosshair at the pink subject, click & drag to cut.</li>
            <li><b>Note:</b> Connect a Meta Quest to experience full VR presence with the MX Ink.</li>
          </ul>

          <div style={{ marginTop: '20px', paddingTop: '15px', borderTop: '1px solid #444', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', color: '#ddd' }}>Successful Incisions:</span>
            <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#10b981' }}>{incisionCount}</span>
          </div>
        </div>
      </div>

      <Canvas style={{ width: '100vw', height: '100vh', background: '#000' }} camera={{ position: [0, 1.6, 2], fov: 60 }} shadows={{ type: THREE.PCFShadowMap }} dpr={[1, 1.5]}>
        {isLightOn && <Environment preset="studio" />}

        <Physics>
          <BiologyLabRoom isLightOn={isLightOn} />

          {/* The new interactive light switch placed next to the whiteboard */}
          <LightSwitch position={[9.8, 1.3, 2]} rotation={[0, -Math.PI / 2, 0]} onToggle={setIsLightOn} />

          <FloatingInfoPanel position={[-2, 1.5, -2]} rotation={[0, 0.5, 0]} incisionCount={incisionCount} />

          <Player />

          <XR store={store}>
            {/* Ambient lighting is boosted by the Environment, so we keep these subtle */}
            <ambientLight intensity={isLightOn ? 0.3 : 0.05} />
            {isLightOn ? (
              <directionalLight position={[0, 10, 5]} intensity={0.6} castShadow />
            ) : (
              /* Emergency Red Lighting */
              <pointLight position={[0, 3, 0]} intensity={2} color="#ff0000" distance={10} />
            )}

            {/* Place the lab station at standard desk height (0.8m) on the floor */}
            <group position={[0, 0.8, 0]}>
              <LabTray />
              <DissectionSubject onMakeIncision={() => setIncisionCount(c => c + 1)} />

              {/* --- Props on the main dissection table --- */}
              <PetriDish position={[-0.4, 0.05, 0.15]} /> {/* Raised slightly so they fall to table */}
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

            {/* Other props in the lab */}
            <AnatomicalTorso position={[-2, 0.8, 2]} rotation={[0, 0.5, 0]} />
            <BrainModel position={[2, 0.8, 2]} rotation={[0, -0.5, 0]} />
            <StorageCabinet position={[5, 0, -5]} />
            <HazardBin position={[-5, 0, -5]} />
            <Stool position={[0, 0, 5]} />
            <LabCoatStand position={[-8, 0, 0]} />
            <Centrifuge position={[3, 0.8, -3]} />
            <SafetyGoggles position={[0.1, 1.1, 0.1]} rotation={[0, 0, 0]} />
            <Autoclave position={[5, 0.8, 3]} />

            <Incubator position={[4, 0.8, 1]} rotation={[0, -1, 0]} />
            <AnatomyChart position={[-9.9, 1.5, 1]} rotation={[0, Math.PI / 2, 0]} imageType="circulatory" />
            <AnatomyChart position={[-9.9, 1.5, 3]} rotation={[0, Math.PI / 2, 0]} imageType="skeleton" />
          </XR>
        </Physics>
      </Canvas>
    </>
  )
}
