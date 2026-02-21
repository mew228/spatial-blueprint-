import { useState, useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { PointerLockControls } from '@react-three/drei'
import { store } from '../store'

export function Player({ positionRef }: { positionRef?: React.RefObject<THREE.Vector3> }) {
    const [movement, setMovement] = useState({ forward: false, backward: false, left: false, right: false })
    const [flashlightOn, setFlashlightOn] = useState(false)
    const lightRef = useRef<THREE.SpotLight>(null)

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            switch (e.code) {
                case 'KeyW': setMovement(m => ({ ...m, forward: true })); break
                case 'KeyS': setMovement(m => ({ ...m, backward: true })); break
                case 'KeyA': setMovement(m => ({ ...m, left: true })); break
                case 'KeyD': setMovement(m => ({ ...m, right: true })); break
                case 'KeyF': setFlashlightOn(f => !f); break // Toggle flashlight
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

        // Lock player height
        if (!store.getState().session) {
            state.camera.position.y = 1.6
        }

        // Update position ref for AI
        if (positionRef?.current) {
            positionRef.current.copy(state.camera.position)
        }

        // Make flashlight follow the camera
        if (flashlightOn && lightRef.current) {
            lightRef.current.position.copy(state.camera.position)
            lightRef.current.position.y -= 0.2 // slightly below eye level
            lightRef.current.target.position.copy(state.camera.position).add(
                new THREE.Vector3(0, 0, -1).applyQuaternion(state.camera.quaternion)
            )
            lightRef.current.target.updateMatrixWorld()
        }
    })

    return (
        <>
            <PointerLockControls />
            {flashlightOn && (
                <spotLight
                    ref={lightRef}
                    color="#ffffff"
                    intensity={3}
                    angle={0.5}
                    penumbra={0.8}
                    distance={15}
                />
            )}
        </>
    )
}
