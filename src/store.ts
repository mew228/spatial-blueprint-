import { createXRStore } from '@react-three/xr'
import { create } from 'zustand'
import * as THREE from 'three'

// XR Store for AR/VR interactions
export const store = createXRStore()

// Game State Store for AI and logic
interface GameState {
    lastNoise: {
        position: THREE.Vector3 | null
        timestamp: number
    }
    emitNoise: (position: THREE.Vector3) => void
}

export const useGameState = create<GameState>((set) => ({
    lastNoise: {
        position: null,
        timestamp: 0,
    },
    emitNoise: (position) => set({
        lastNoise: {
            position: position.clone(),
            timestamp: Date.now()
        }
    }),
}))
