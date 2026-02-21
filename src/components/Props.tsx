import { RigidBody } from '@react-three/rapier'
import * as THREE from 'three'

export function Microscope({ position, rotation }: { position: [number, number, number], rotation?: [number, number, number] }) {
    return (
        <group position={position} rotation={rotation || [0, 0, 0]}>
            <mesh position={[0, 0.02, 0]}><boxGeometry args={[0.15, 0.04, 0.2]} /><meshStandardMaterial color="#333" roughness={0.8} /></mesh>
            <mesh position={[0, 0.15, -0.06]} rotation={[0.2, 0, 0]}><boxGeometry args={[0.05, 0.25, 0.05]} /><meshStandardMaterial color="#555" roughness={0.5} /></mesh>
            <mesh position={[0, 0.1, 0.02]}><boxGeometry args={[0.12, 0.01, 0.12]} /><meshStandardMaterial color="#222" roughness={0.9} /></mesh>
            <mesh position={[0, 0.25, 0.0]} rotation={[-0.5, 0, 0]}><cylinderGeometry args={[0.015, 0.02, 0.15]} /><meshStandardMaterial color="#c0c0c0" metalness={0.8} /></mesh>
            <mesh position={[0, 0.18, 0.02]}><cylinderGeometry args={[0.01, 0.02, 0.05]} /><meshStandardMaterial color="#c0c0c0" metalness={0.8} /></mesh>
        </group>
    )
}

export function SpecimenJar({ position, blobColor = "#556b2f" }: { position: [number, number, number], blobColor?: string }) {
    return (
        <RigidBody colliders="hull" mass={0.5} position={position}>
            <group>
                <mesh position={[0, 0.1, 0]}>
                    <cylinderGeometry args={[0.06, 0.06, 0.2, 8]} />
                    <meshPhysicalMaterial color="#ffffff" transmission={0.9} opacity={1} transparent roughness={0.1} />
                </mesh>
                <mesh position={[0, 0.21, 0]}>
                    <cylinderGeometry args={[0.065, 0.065, 0.02, 8]} />
                    <meshStandardMaterial color="#2c3e50" roughness={0.6} />
                </mesh>
                <mesh position={[0, 0.08, 0]}>
                    <sphereGeometry args={[0.035, 8, 8]} />
                    <meshStandardMaterial color={blobColor} roughness={0.9} />
                </mesh>
            </group>
        </RigidBody>
    )
}

export function ErlenmeyerFlask({ position, liquidColor }: { position: [number, number, number], liquidColor: string }) {
    return (
        <group position={position}>
            <mesh position={[0, 0.06, 0]}>
                <cylinderGeometry args={[0.02, 0.06, 0.12, 8]} />
                <meshPhysicalMaterial color="#ffffff" transmission={0.95} opacity={1} transparent roughness={0.05} />
            </mesh>
            <mesh position={[0, 0.04, 0]}>
                <cylinderGeometry args={[0.045, 0.058, 0.08, 8]} />
                <meshStandardMaterial color={liquidColor} transparent opacity={0.8} />
            </mesh>
        </group>
    )
}

export function PetriDish({ position }: { position: [number, number, number] }) {
    return (
        <RigidBody colliders="hull" mass={0.1} position={position}>
            <group>
                <mesh position={[0, 0.005, 0]}>
                    <cylinderGeometry args={[0.05, 0.05, 0.01, 8]} />
                    <meshPhysicalMaterial color="#ffffff" transmission={0.9} opacity={1} transparent roughness={0.1} side={THREE.DoubleSide} />
                </mesh>
                <mesh position={[0, 0.0051, 0]}>
                    <cylinderGeometry args={[0.048, 0.048, 0.008, 8]} />
                    <meshStandardMaterial color="#f5e050" transparent opacity={0.6} />
                </mesh>
                {/* Colonies */}
                <mesh position={[0.02, 0.01, 0.01]}><sphereGeometry args={[0.004, 8, 8]} /><meshStandardMaterial color="#d35400" /></mesh>
                <mesh position={[-0.01, 0.01, -0.02]}><sphereGeometry args={[0.003, 8, 8]} /><meshStandardMaterial color="#d35400" /></mesh>
                <mesh position={[-0.02, 0.01, 0.02]}><sphereGeometry args={[0.005, 8, 8]} /><meshStandardMaterial color="#d35400" /></mesh>
            </group>
        </RigidBody>
    )
}

export function Centrifuge({ position, rotation }: { position: [number, number, number], rotation?: [number, number, number] }) {
    return (
        <group position={position} rotation={rotation || [0, 0, 0]}>
            {/* Base Machine */}
            <mesh position={[0, 0.15, 0]}>
                <boxGeometry args={[0.3, 0.3, 0.35]} />
                <meshStandardMaterial color="#ecf0f1" roughness={0.3} metalness={0.1} />
            </mesh>
            {/* Angled Control Panel */}
            <mesh position={[0, 0.1, 0.18]} rotation={[0.4, 0, 0]}>
                <boxGeometry args={[0.26, 0.15, 0.02]} />
                <meshStandardMaterial color="#34495e" roughness={0.8} />
            </mesh>
            {/* Lid (Closed) */}
            <mesh position={[0, 0.3, -0.05]} rotation={[-0.1, 0, 0]}>
                <cylinderGeometry args={[0.12, 0.12, 0.02, 8]} />
                <meshStandardMaterial color="#bdc3c7" />
            </mesh>
        </group>
    )
}

export function BunsenBurner({ position }: { position: [number, number, number] }) {
    return (
        <group position={position}>
            {/* Base */}
            <mesh position={[0, 0.01, 0]}><cylinderGeometry args={[0.05, 0.05, 0.02, 8]} /><meshStandardMaterial color="#7f8c8d" metalness={0.6} /></mesh>
            {/* Gas Tube Attachment */}
            <mesh position={[0.06, 0.02, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.008, 0.008, 0.04]} /><meshStandardMaterial color="#d35400" /></mesh>
            {/* Vertical Pipe */}
            <mesh position={[0, 0.08, 0]}><cylinderGeometry args={[0.015, 0.015, 0.12, 8]} /><meshStandardMaterial color="#bdc3c7" metalness={0.8} /></mesh>
            {/* Flame (Outer) */}
            <mesh position={[0, 0.18, 0]}>
                <coneGeometry args={[0.02, 0.08, 8]} />
                <meshPhysicalMaterial color="#3498db" transmission={0.8} opacity={0.6} transparent emissive="#2980b9" emissiveIntensity={0.5} />
            </mesh>
            {/* Flame (Inner core) */}
            <mesh position={[0, 0.16, 0]}>
                <coneGeometry args={[0.01, 0.04, 8]} />
                <meshPhysicalMaterial color="#00ffff" transmission={0.4} opacity={0.9} transparent emissive="#00ffff" emissiveIntensity={1} />
            </mesh>
        </group>
    )
}

export function SafetyGoggles({ position, rotation }: { position: [number, number, number], rotation?: [number, number, number] }) {
    return (
        <group position={position} rotation={rotation || [0, 0, 0]}>
            {/* Left Lens Box */}
            <mesh position={[-0.04, 0.03, 0]}>
                <boxGeometry args={[0.07, 0.05, 0.02]} />
                <meshPhysicalMaterial color="#ffffff" transmission={0.9} opacity={1} transparent roughness={0.1} />
            </mesh>
            {/* Right Lens Box */}
            <mesh position={[0.04, 0.03, 0]}>
                <boxGeometry args={[0.07, 0.05, 0.02]} />
                <meshPhysicalMaterial color="#ffffff" transmission={0.9} opacity={1} transparent roughness={0.1} />
            </mesh>
            {/* Bridge */}
            <mesh position={[0, 0.04, 0]}><boxGeometry args={[0.02, 0.01, 0.01]} /><meshStandardMaterial color="#111" /></mesh>
            {/* Straps/Frames */}
            <mesh position={[-0.075, 0.03, -0.03]} rotation={[0, 0.2, 0]}><boxGeometry args={[0.005, 0.01, 0.08]} /><meshStandardMaterial color="#111" /></mesh>
            <mesh position={[0.075, 0.03, -0.03]} rotation={[0, -0.2, 0]}><boxGeometry args={[0.005, 0.01, 0.08]} /><meshStandardMaterial color="#111" /></mesh>
        </group>
    )
}

export function Autoclave({ position, rotation }: { position: [number, number, number], rotation?: [number, number, number] }) {
    return (
        <group position={position} rotation={rotation || [0, 0, 0]}>
            <mesh position={[0, 0.3, 0]}>
                <cylinderGeometry args={[0.25, 0.25, 0.6, 8]} />
                <meshStandardMaterial color="#95a5a6" metalness={0.6} roughness={0.3} />
            </mesh>
            <mesh position={[0, 0.6, 0]}>
                <cylinderGeometry args={[0.26, 0.26, 0.05, 8]} />
                <meshStandardMaterial color="#7f8c8d" metalness={0.8} />
            </mesh>
            {/* Pressure dial */}
            <mesh position={[0, 0.45, 0.26]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.05, 0.05, 0.02]} />
                <meshStandardMaterial color="#ecf0f1" />
            </mesh>
        </group>
    )
}

export function HotPlate({ position, rotation }: { position: [number, number, number], rotation?: [number, number, number] }) {
    return (
        <group position={position} rotation={rotation || [0, 0, 0]}>
            <mesh position={[0, 0.02, 0]}>
                <boxGeometry args={[0.2, 0.04, 0.2]} />
                <meshStandardMaterial color="#bdc3c7" roughness={0.6} />
            </mesh>
            <mesh position={[0, 0.041, 0]}>
                <boxGeometry args={[0.15, 0.002, 0.15]} />
                <meshStandardMaterial color="#c0392b" emissive="#e74c3c" emissiveIntensity={0.5} /> {/* Glowing heated surface */}
            </mesh>
            {/* Dial */}
            <mesh position={[0, 0.02, 0.1]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.015, 0.015, 0.02]} />
                <meshStandardMaterial color="#333" />
            </mesh>
        </group>
    )
}

export function MagnifyingGlass({ position, rotation }: { position: [number, number, number], rotation?: [number, number, number] }) {
    return (
        <RigidBody colliders="hull" mass={0.2} position={position} rotation={rotation || [0, 0, 0]}>
            <group>
                {/* Handle */}
                <mesh position={[0.1, 0.01, 0.1]} rotation={[0, -Math.PI / 4, 0]}>
                    <cylinderGeometry args={[0.01, 0.01, 0.12]} />
                    <meshStandardMaterial color="#8e44ad" roughness={0.8} />
                </mesh>
                {/* Rim */}
                <mesh position={[0, 0.01, 0]}>
                    <torusGeometry args={[0.05, 0.005, 8, 8]} />
                    <meshStandardMaterial color="#bdc3c7" metalness={0.7} />
                </mesh>
                {/* Lens */}
                <mesh position={[0, 0.01, 0]}>
                    <cylinderGeometry args={[0.048, 0.048, 0.005, 8]} />
                    <meshPhysicalMaterial color="#ffffff" transmission={0.9} opacity={1} transparent roughness={0.05} ior={1.5} />
                </mesh>
            </group>
        </RigidBody>
    )
}

export function ScalpelProp({ position, rotation }: { position: [number, number, number], rotation?: [number, number, number] }) {
    return (
        <RigidBody colliders="hull" mass={0.1} position={position} rotation={rotation || [0, 0, 0]}>
            <group>
                {/* Handle */}
                <mesh position={[0, 0.005, 0]} rotation={[0, 0, Math.PI / 2]}>
                    <boxGeometry args={[0.1, 0.01, 0.005]} />
                    <meshStandardMaterial color="#2c3e50" roughness={0.8} />
                </mesh>
                {/* Blade */}
                <mesh position={[-0.06, 0.005, 0]} rotation={[0, 0, Math.PI / 2]}>
                    <coneGeometry args={[0.01, 0.03, 3]} />
                    <meshStandardMaterial color="#ecf0f1" metalness={0.8} />
                </mesh>
            </group>
        </RigidBody>
    )
}

export function Forceps({ position, rotation }: { position: [number, number, number], rotation?: [number, number, number] }) {
    return (
        <RigidBody colliders="hull" mass={0.05} position={position} rotation={rotation || [0, 0, 0]}>
            <group>
                {/* Left Arm */}
                <mesh position={[-0.01, 0, 0]} rotation={[0, 0, 0.1]}>
                    <boxGeometry args={[0.005, 0.01, 0.15]} />
                    <meshStandardMaterial color="#c0c0c0" metalness={0.9} roughness={0.1} />
                </mesh>
                {/* Right Arm */}
                <mesh position={[0.01, 0, 0]} rotation={[0, 0, -0.1]}>
                    <boxGeometry args={[0.005, 0.01, 0.15]} />
                    <meshStandardMaterial color="#c0c0c0" metalness={0.9} roughness={0.1} />
                </mesh>
                {/* Hinge */}
                <mesh position={[0, 0, -0.075]} rotation={[0, Math.PI / 2, 0]}>
                    <cylinderGeometry args={[0.01, 0.01, 0.02, 8]} />
                    <meshStandardMaterial color="#7f8c8d" metalness={0.9} />
                </mesh>
            </group>
        </RigidBody>
    )
}

export function MicroscopeSlides({ position, rotation }: { position: [number, number, number], rotation?: [number, number, number] }) {
    return (
        <RigidBody colliders="hull" mass={0.02} position={position} rotation={rotation || [0, 0, 0]}>
            <group>
                {/* Box */}
                <mesh position={[0, 0.01, 0]}>
                    <boxGeometry args={[0.1, 0.02, 0.08]} />
                    <meshStandardMaterial color="#dcdde1" roughness={0.9} />
                </mesh>
                {/* Slides inside */}
                <mesh position={[0, 0.025, 0]}>
                    <boxGeometry args={[0.08, 0.01, 0.06]} />
                    <meshPhysicalMaterial color="#ffffff" transmission={0.95} opacity={1} transparent roughness={0.05} />
                </mesh>
            </group>
        </RigidBody>
    )
}
