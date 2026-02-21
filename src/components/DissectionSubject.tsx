import { useState, useRef, useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { store } from '../store'

export function DissectionSubject({ onMakeIncision }: { onMakeIncision: (points: THREE.Vector3[]) => void }) {
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
