import { useState } from 'react'
import { RigidBody } from '@react-three/rapier'
import { Text, Float } from '@react-three/drei'

import { AnatomicalTorso, BrainModel } from './AnatomyModels'
import {
    StorageCabinet, HazardBin, Stool, LabCoatStand
} from './Furniture'
import {
    Microscope, SpecimenJar, ErlenmeyerFlask,
    Centrifuge, BunsenBurner, SafetyGoggles, Autoclave,
    HotPlate
} from './Props'

export function LabTray() {
    return (
        <RigidBody type="fixed" colliders="cuboid">
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

export function LightSwitch({ position, rotation, onToggle }: { position: [number, number, number], rotation?: [number, number, number], onToggle: (isOn: boolean) => void }) {
    const [isOn, setIsOn] = useState(true)

    const handleClick = (e: any) => {
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
            <mesh position={[0, isOn ? 0.02 : -0.02, 0.015]} rotation={[isOn ? -0.1 : 0.1, 0, 0]}>
                <boxGeometry args={[0.04, 0.06, 0.02]} />
                <meshStandardMaterial color={isOn ? "#2ecc71" : "#e74c3c"} emissive={isOn ? "#2ecc71" : "#e74c3c"} emissiveIntensity={0.5} />
            </mesh>
        </group>
    )
}

export function BiologyLabRoom({ isLightOn }: { isLightOn: boolean }) {
    return (
        <group>
            {/* Floor */}
            <RigidBody type="fixed" colliders="cuboid">
                <mesh position={[0, -0.1, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                    <planeGeometry args={[20, 20]} />
                    <meshStandardMaterial color="#2c3e50" roughness={0.8} metalness={0.2} />
                </mesh>
            </RigidBody>

            {/* Ceiling */}
            <mesh position={[0, 3.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <planeGeometry args={[20, 20]} />
                <meshStandardMaterial color="#34495e" roughness={0.9} />
            </mesh>

            {/* Walls */}
            <mesh position={[0, 1.75, -10]} receiveShadow>
                <planeGeometry args={[20, 3.5]} />
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

            {/* Whiteboard */}
            <mesh position={[9.9, 1.5, 1]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
                <planeGeometry args={[3, 1.2]} />
                <meshStandardMaterial color="#ffffff" roughness={0.2} metalness={0.1} />
            </mesh>
            <mesh position={[9.95, 1.5, 1]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
                <boxGeometry args={[3.1, 1.3, 0.05]} />
                <meshStandardMaterial color="#888888" roughness={0.4} />
            </mesh>

            {/* Anatomy Poster */}
            <mesh position={[-9.9, 1.6, -1]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
                <planeGeometry args={[1.2, 1.8]} />
                <meshStandardMaterial color="#2c3e50" roughness={0.5} />
            </mesh>
            <mesh position={[-9.89, 1.6, -1]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
                <planeGeometry args={[0.9, 1.5]} />
                <meshStandardMaterial color="#ecf0f1" roughness={0.5} />
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

            {/* --- LEFT LAB COUNTER --- */}
            <group position={[-9.5, 0.9, 0]} rotation={[0, Math.PI / 2, 0]}>
                {/* Epoxy Countertop */}
                <mesh position={[0, 0, 0]} castShadow receiveShadow>
                    <boxGeometry args={[12, 0.05, 1]} />
                    <meshStandardMaterial color="#222222" metalness={0.4} roughness={0.2} />
                </mesh>
                <mesh position={[-5.5, -0.45, 0]} castShadow receiveShadow><boxGeometry args={[1, 0.9, 0.9]} /><meshStandardMaterial color="#9c6644" roughness={0.8} /></mesh>
                <mesh position={[0, -0.45, 0]} castShadow receiveShadow><boxGeometry args={[1, 0.9, 0.9]} /><meshStandardMaterial color="#9c6644" roughness={0.8} /></mesh>
                <mesh position={[5.5, -0.45, 0]} castShadow receiveShadow><boxGeometry args={[1, 0.9, 0.9]} /><meshStandardMaterial color="#9c6644" roughness={0.8} /></mesh>

                <AnatomicalTorso position={[0, 0.025, 0]} rotation={[0, Math.PI, 0]} />
                <BrainModel position={[2.5, 0.025, 0]} rotation={[0, Math.PI, 0]} />
                <SpecimenJar position={[-2, 0.025, 0]} blobColor="#e6a8d7" />
                <SpecimenJar position={[-2.3, 0.025, -0.2]} blobColor="#cc0000" />
            </group>

            {/* --- RIGHT LAB COUNTER --- */}
            <group position={[9.5, 0.9, 0]} rotation={[0, -Math.PI / 2, 0]}>
                {/* Epoxy Countertop */}
                <mesh position={[0, 0, 0]} castShadow receiveShadow>
                    <boxGeometry args={[12, 0.05, 1]} />
                    <meshStandardMaterial color="#222222" metalness={0.4} roughness={0.2} />
                </mesh>
                <mesh position={[-5.5, -0.45, 0]} castShadow receiveShadow><boxGeometry args={[1, 0.9, 0.9]} /><meshStandardMaterial color="#9c6644" roughness={0.8} /></mesh>
                <mesh position={[0, -0.45, 0]} castShadow receiveShadow><boxGeometry args={[1, 0.9, 0.9]} /><meshStandardMaterial color="#9c6644" roughness={0.8} /></mesh>
                <mesh position={[5.5, -0.45, 0]} castShadow receiveShadow><boxGeometry args={[1, 0.9, 0.9]} /><meshStandardMaterial color="#9c6644" roughness={0.8} /></mesh>

                <SafetyGoggles position={[0, 0.025, 0.1]} rotation={[0, -0.4, 0]} />
                <SafetyGoggles position={[0.4, 0.025, -0.1]} rotation={[0, 0.2, 0]} />
                <SafetyGoggles position={[-0.4, 0.025, 0]} rotation={[0, 0.8, 0]} />

                <ErlenmeyerFlask position={[-3, 0.025, 0.1]} liquidColor="#e67e22" />
                <ErlenmeyerFlask position={[-3.2, 0.025, -0.1]} liquidColor="#8e44ad" />
                <BunsenBurner position={[3, 0.025, 0]} />

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
            <RigidBody type="fixed" colliders="cuboid">
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
            </RigidBody>

            {/* Medical Overhead Lights */}
            <group position={[0, 3.4, 0]}>
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

export function FloatingInfoPanel({ position, rotation, incisionCount }: { position: [number, number, number], rotation: [number, number, number], incisionCount: number }) {
    return (
        <Float speed={1} rotationIntensity={0.05} floatIntensity={0.2} position={position} rotation={rotation}>
            <group>
                {/* Glass Screen - Pushed back slightly */}
                <mesh position={[0, 0, -0.02]}>
                    <planeGeometry args={[1.5, 1]} />
                    <meshStandardMaterial color="#ffffff" opacity={0.3} transparent roughness={0.1} />
                </mesh>
                {/* Frame - Pushed back further */}
                <mesh position={[0, 0, -0.05]}>
                    <boxGeometry args={[1.55, 1.05, 0.01]} />
                    <meshStandardMaterial color="#2c3e50" metalness={0.8} />
                </mesh>

                {/* Text - Offset forward to z=0.01 to ensure clear separation */}
                <Text position={[0, 0.35, 0.01]} fontSize={0.15} color="#fca5a5" anchorX="center" anchorY="middle">
                    Virtual Biology Lab
                </Text>
                <Text position={[0, 0.2, 0.01]} fontSize={0.06} color="#aaa" anchorX="center" anchorY="middle">
                    Immersive VR Experience
                </Text>

                <Text position={[-0.65, 0, 0.01]} fontSize={0.06} color="#fff" anchorX="left" anchorY="middle" maxWidth={1.3} lineHeight={1.5}>
                    1. Look Around: Click anywhere to lock pointer. Press ESC to unlock.
                    2. Walk: Use W, A, S, D keys.
                    3. Flashlight: Press 'F' to toggle your flashlight in the dark.
                    4. Objective: Find the Keycard and interact with the main door behind you to Escape!
                    Note: Connect a Meta Quest to experience full VR presence with the MX Ink.
                </Text>

                <Text position={[-0.65, -0.35, 0.01]} fontSize={0.08} color="#ddd" anchorX="left" anchorY="middle">
                    Successful Incisions:
                </Text>
                <Text position={[0.65, -0.35, 0.01]} fontSize={0.12} color="#10b981" anchorX="right" anchorY="middle">
                    {incisionCount.toString()}
                </Text>
            </group>
        </Float>
    )
}
