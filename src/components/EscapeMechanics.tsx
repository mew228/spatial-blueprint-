import { useState } from 'react'
import { RigidBody } from '@react-three/rapier'
import { Float } from '@react-three/drei'

export function ExitDoor({ position, rotation, hasKey, onEscape }: { position: [number, number, number], rotation: [number, number, number], hasKey: boolean, onEscape: () => void }) {
    const handleClick = (e: any) => {
        if (!document.pointerLockElement && e.sourceEvent?.type === "click") return;
        e.stopPropagation()
        if (hasKey) {
            onEscape()
        }
    }

    return (
        <RigidBody type="fixed" colliders="cuboid">
            <group position={position} rotation={rotation}>
                {/* The Door */}
                <mesh position={[0, 1.5, 0]} onClick={handleClick} onPointerDown={handleClick}>
                    <boxGeometry args={[1.5, 3, 0.1]} />
                    <meshStandardMaterial color="#34495e" metalness={0.5} roughness={0.5} />
                </mesh>
                {/* Door Frame */}
                <mesh position={[0, 1.5, 0.05]}>
                    <boxGeometry args={[1.7, 3.2, 0.15]} />
                    <meshStandardMaterial color="#222" />
                </mesh>
                {/* Lock indicator light */}
                <mesh position={[0.6, 1.5, 0.06]}>
                    <boxGeometry args={[0.05, 0.1, 0.02]} />
                    <meshStandardMaterial color={hasKey ? "#2ecc71" : "#e74c3c"} emissive={hasKey ? "#2ecc71" : "#e74c3c"} emissiveIntensity={1} />
                </mesh>
            </group>
        </RigidBody>
    )
}

export function Keycard({ position, onCollect }: { position: [number, number, number], onCollect: () => void }) {
    const [collected, setCollected] = useState(false)

    const handleCollect = (e: any) => {
        if (!document.pointerLockElement && e.sourceEvent?.type === "click") return;
        e.stopPropagation()
        setCollected(true)
        onCollect()
    }

    if (collected) return null

    return (
        <Float
            speed={1.5} // Slower, more stable bobbing
            rotationIntensity={0.5} // Less aggressive rotation
            floatIntensity={0.5}
        >
            <group position={position} onClick={handleCollect} onPointerDown={handleCollect}>
                {/* Main Card Body */}
                <mesh castShadow>
                    <boxGeometry args={[0.12, 0.01, 0.08]} />
                    <meshStandardMaterial
                        color="#f1c40f"
                        emissive="#f1c40f"
                        emissiveIntensity={0.3}
                        roughness={0.3}
                        metalness={0.2}
                    />
                </mesh>

                {/* Decorative Magnetic Stripe (Hello Neighbor style detail) */}
                <mesh position={[0, 0.006, 0.015]}>
                    <boxGeometry args={[0.12, 0.001, 0.02]} />
                    <meshStandardMaterial color="#222" roughness={0.9} />
                </mesh>

                {/* Small "Chip" Detail */}
                <mesh position={[-0.03, 0.006, -0.01]}>
                    <boxGeometry args={[0.02, 0.001, 0.02]} />
                    <meshStandardMaterial color="#bdc3c7" metalness={0.8} roughness={0.2} />
                </mesh>

                {/* Very low intensity point light for local presence */}
                <pointLight color="#f1c40f" intensity={0.2} distance={0.5} />
            </group>
        </Float>
    )
}
