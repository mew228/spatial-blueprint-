import { useState, useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useGameState } from '../store'

interface PatrolEnemyProps {
    playerRef: React.RefObject<THREE.Vector3>
    onCatch: () => void
}

const WAYPOINTS = [
    new THREE.Vector3(-7, 0.9, -7),
    new THREE.Vector3(7, 0.9, -7),
    new THREE.Vector3(7, 0.9, 7),
    new THREE.Vector3(-7, 0.9, 7),
]

export function PatrolEnemy({ playerRef, onCatch }: PatrolEnemyProps) {
    const meshRef = useRef<THREE.Group>(null)
    const bodyRef = useRef<THREE.Mesh>(null)
    const [currentWaypoint, setCurrentWaypoint] = useState(0)
    const [state, setState] = useState<'patrol' | 'search' | 'chase' | 'investigate'>('patrol')
    const searchTimerRef = useRef(0)
    const investigationPosRef = useRef<THREE.Vector3 | null>(null)

    // Detection settings
    const detectionDistance = 5
    const catchDistance = 1.2
    const fov = 1.0 // ~60 degrees

    // Listen to noise from the store
    const lastNoise = useGameState(s => s.lastNoise)
    const lastHandledNoiseRef = useRef(0)

    useEffect(() => {
        if (lastNoise.timestamp > lastHandledNoiseRef.current && state !== 'chase') {
            lastHandledNoiseRef.current = lastNoise.timestamp
            if (lastNoise.position) {
                investigationPosRef.current = lastNoise.position.clone()
                investigationPosRef.current.y = 0.9 // maintain float height
                setState('investigate')
            }
        }
    }, [lastNoise, state])

    useFrame((stateObj, delta) => {
        if (!meshRef.current || !playerRef.current) return

        const enemyPos = meshRef.current.position
        const playerPos = playerRef.current

        // 1. Organic "Breathing" / Floating Animation
        if (bodyRef.current) {
            bodyRef.current.position.y = 0.9 + Math.sin(stateObj.clock.elapsedTime * 2) * 0.05
        }

        // 2. Distance & Detection Logic
        const distToPlayer = enemyPos.distanceTo(playerPos)

        const toPlayer = new THREE.Vector3().subVectors(playerPos, enemyPos).normalize()
        const forward = new THREE.Vector3(0, 0, 1).applyQuaternion(meshRef.current.quaternion)
        const dot = forward.dot(toPlayer)

        // Detection is harder if not looking directly
        const canSeePlayer = distToPlayer < detectionDistance && dot > Math.cos(fov / 2)

        if (distToPlayer < catchDistance) {
            onCatch()
            return
        }

        if (canSeePlayer) {
            setState('chase')
        } else if (state === 'chase') {
            setState('search')
            searchTimerRef.current = 2
        }

        // 3. State-based Movement
        if (state === 'chase') {
            const moveDir = new THREE.Vector3().subVectors(playerPos, enemyPos).normalize()
            moveDir.y = 0 // Keep on floor plane
            enemyPos.add(moveDir.multiplyScalar(2.8 * delta)) // Slightly faster chase
            const targetRotation = Math.atan2(toPlayer.x, toPlayer.z)
            meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, targetRotation, 8 * delta) // Snappier rotation

        } else if (state === 'investigate' && investigationPosRef.current) {
            const target = investigationPosRef.current
            const moveDir = new THREE.Vector3().subVectors(target, enemyPos).normalize()
            moveDir.y = 0
            enemyPos.add(moveDir.multiplyScalar(2.2 * delta))
            const targetRotation = Math.atan2(moveDir.x, moveDir.z)
            meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, targetRotation, 5 * delta)

            if (enemyPos.distanceTo(target) < 0.5) {
                setState('search')
                searchTimerRef.current = 4.0
                investigationPosRef.current = null
            }
        } else if (state === 'search') {
            searchTimerRef.current -= delta
            // Jittery search rotation
            meshRef.current.rotation.y += Math.sin(stateObj.clock.elapsedTime * 5) * 5 * delta
            if (searchTimerRef.current <= 0) {
                setState('patrol')
            }
        } else {
            // Patrol mode
            const target = WAYPOINTS[currentWaypoint]
            const moveDir = new THREE.Vector3().subVectors(target, enemyPos).normalize()
            moveDir.y = 0
            enemyPos.add(moveDir.multiplyScalar(1.5 * delta))
            const targetRotation = Math.atan2(moveDir.x, moveDir.z)
            meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, targetRotation, 3 * delta)

            if (enemyPos.distanceTo(target) < 0.5) {
                setCurrentWaypoint((currentWaypoint + 1) % WAYPOINTS.length)
                setState('search')
                searchTimerRef.current = 1.5
            }
        }
    })

    // Visuals
    const color = state === 'chase' ? '#ff0000' :
        state === 'investigate' ? '#e67e22' :
            state === 'search' ? '#f1c40f' : '#2c3e50'

    // Emissive Pulsing Logic
    useFrame((stateObj) => {
        if (!bodyRef.current) return
        const material = bodyRef.current.material as THREE.MeshStandardMaterial
        const baseIntensity = state === 'chase' ? 2 :
            state === 'investigate' ? 1.5 :
                state === 'search' ? 1 : 0.2

        const pulse = state === 'search' ? Math.sin(stateObj.clock.elapsedTime * 10) * 0.5 + 1 : 1
        material.emissiveIntensity = baseIntensity * pulse
    })

    return (
        <group ref={meshRef} position={[0, 0, -5]}>
            {/* Body */}
            <mesh ref={bodyRef} position={[0, 0.9, 0]} castShadow>
                <capsuleGeometry args={[0.3, 1.2, 8, 16]} />
                <meshStandardMaterial
                    color={color}
                    emissive={color}
                    roughness={0.1}
                    metalness={0.8}
                />
            </mesh>

            {/* "Eyes" or Visor */}
            <mesh position={[0, 1.6, 0.25]}>
                <boxGeometry args={[0.4, 0.05, 0.1]} />
                <meshStandardMaterial color={color} emissive={color} emissiveIntensity={5} />
            </mesh>

            <pointLight position={[0, 2, 0]} color={color} intensity={0.5} distance={3} />
        </group>
    )
}
