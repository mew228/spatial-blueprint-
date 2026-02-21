
export function StorageCabinet({ position, rotation }: { position: [number, number, number], rotation?: [number, number, number] }) {
    return (
        <group position={position} rotation={rotation || [0, 0, 0]}>
            <mesh position={[0, 1, 0]} castShadow receiveShadow>
                <boxGeometry args={[1.5, 2, 0.6]} />
                <meshStandardMaterial color="#95a5a6" roughness={0.5} metalness={0.2} />
            </mesh>
            {/* Doors */}
            <mesh position={[-0.38, 1, 0.31]}>
                <boxGeometry args={[0.72, 1.9, 0.02]} />
                <meshStandardMaterial color="#ecf0f1" roughness={0.6} />
            </mesh>
            <mesh position={[0.38, 1, 0.31]}>
                <boxGeometry args={[0.72, 1.9, 0.02]} />
                <meshStandardMaterial color="#ecf0f1" roughness={0.6} />
            </mesh>
            {/* Handles */}
            <mesh position={[-0.05, 1, 0.33]}>
                <boxGeometry args={[0.02, 0.3, 0.02]} />
                <meshStandardMaterial color="#34495e" />
            </mesh>
            <mesh position={[0.05, 1, 0.33]}>
                <boxGeometry args={[0.02, 0.3, 0.02]} />
                <meshStandardMaterial color="#34495e" />
            </mesh>
        </group>
    )
}

export function HazardBin({ position, rotation }: { position: [number, number, number], rotation?: [number, number, number] }) {
    return (
        <group position={position} rotation={rotation || [0, 0, 0]}>
            <mesh position={[0, 0.3, 0]} castShadow receiveShadow>
                <cylinderGeometry args={[0.2, 0.15, 0.6, 16]} />
                <meshStandardMaterial color="#e74c3c" roughness={0.6} /> {/* Red biohazard bin */}
            </mesh>
            {/* Lid */}
            <mesh position={[0, 0.6, 0]}>
                <cylinderGeometry args={[0.21, 0.21, 0.05, 16]} />
                <meshStandardMaterial color="#c0392b" roughness={0.7} />
            </mesh>
        </group>
    )
}

export function Stool({ position, rotation }: { position: [number, number, number], rotation?: [number, number, number] }) {
    return (
        <group position={position} rotation={rotation || [0, 0, 0]}>
            {/* Seat */}
            <mesh position={[0, 0.6, 0]} castShadow>
                <cylinderGeometry args={[0.25, 0.25, 0.05, 16]} />
                <meshStandardMaterial color="#34495e" roughness={0.8} />
            </mesh>
            {/* Pole */}
            <mesh position={[0, 0.3, 0]} castShadow>
                <cylinderGeometry args={[0.03, 0.03, 0.6, 8]} />
                <meshStandardMaterial color="#bdc3c7" metalness={0.8} />
            </mesh>
            {/* Base */}
            <mesh position={[0, 0.05, 0]} castShadow>
                <cylinderGeometry args={[0.3, 0.3, 0.1, 16]} />
                <meshStandardMaterial color="#bdc3c7" metalness={0.8} />
            </mesh>
        </group>
    )
}

export function Incubator({ position, rotation }: { position: [number, number, number], rotation?: [number, number, number] }) {
    return (
        <group position={position} rotation={rotation || [0, 0, 0]}>
            {/* Main Body */}
            <mesh position={[0, 0.4, 0]} castShadow>
                <boxGeometry args={[0.6, 0.8, 0.5]} />
                <meshStandardMaterial color="#ecf0f1" roughness={0.3} metalness={0.1} />
            </mesh>
            {/* Glass Door */}
            <mesh position={[0, 0.4, 0.26]}>
                <boxGeometry args={[0.5, 0.7, 0.02]} />
                <meshPhysicalMaterial color="#ffffff" transmission={0.9} opacity={1} transparent roughness={0.1} />
            </mesh>
            {/* Shelves */}
            <mesh position={[0, 0.2, 0.05]}><boxGeometry args={[0.5, 0.02, 0.4]} /><meshStandardMaterial color="#bdc3c7" /></mesh>
            <mesh position={[0, 0.4, 0.05]}><boxGeometry args={[0.5, 0.02, 0.4]} /><meshStandardMaterial color="#bdc3c7" /></mesh>
            <mesh position={[0, 0.6, 0.05]}><boxGeometry args={[0.5, 0.02, 0.4]} /><meshStandardMaterial color="#bdc3c7" /></mesh>
            {/* Internal Red Light */}
            <pointLight position={[0, 0.7, 0]} color="#e74c3c" intensity={0.5} distance={1} />
            {/* Control Panel */}
            <mesh position={[0.2, 0.85, 0.15]} rotation={[-0.2, 0, 0]}>
                <boxGeometry args={[0.15, 0.05, 0.1]} />
                <meshStandardMaterial color="#2c3e50" />
            </mesh>
        </group>
    )
}

export function AnatomyChart({ position, rotation, imageType = 'circulatory' }: { position: [number, number, number], rotation?: [number, number, number], imageType?: 'circulatory' | 'skeleton' }) {
    const chartColor = imageType === 'circulatory' ? '#ff9999' : '#e0e0e0'
    return (
        <group position={position} rotation={rotation || [0, 0, 0]}>
            {/* Poster Board */}
            <mesh position={[0, 0, 0]}>
                <planeGeometry args={[1.5, 2]} />
                <meshStandardMaterial color="#ffffff" roughness={1} />
            </mesh>
            {/* Top/Bottom Rollers */}
            <mesh position={[0, 1.02, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.02, 0.02, 1.6, 16]} />
                <meshStandardMaterial color="#333333" />
            </mesh>
            <mesh position={[0, -1.02, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.02, 0.02, 1.6, 16]} />
                <meshStandardMaterial color="#333333" />
            </mesh>
            {/* Abstract Graphic */}
            <mesh position={[0, 0, 0.01]}>
                <planeGeometry args={[1.2, 1.7]} />
                <meshStandardMaterial color={chartColor} roughness={1} wireframe={imageType === 'skeleton'} />
            </mesh>
        </group>
    )
}

export function LabCoatStand({ position, rotation }: { position: [number, number, number], rotation?: [number, number, number] }) {
    return (
        <group position={position} rotation={rotation || [0, 0, 0]}>
            {/* Base */}
            <mesh position={[0, 0.05, 0]}><cylinderGeometry args={[0.2, 0.2, 0.1]} /><meshStandardMaterial color="#333" /></mesh>
            {/* Pole */}
            <mesh position={[0, 0.8, 0]}><cylinderGeometry args={[0.02, 0.02, 1.6]} /><meshStandardMaterial color="#7f8c8d" metalness={0.7} /></mesh>
            {/* Coat hanging (conceptual cylinder) */}
            <mesh position={[0, 1.2, 0.05]}>
                <capsuleGeometry args={[0.15, 0.6, 8, 8]} />
                <meshStandardMaterial color="#f0f3f4" roughness={0.9} />
            </mesh>
        </group>
    )
}
