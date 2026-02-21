
export function AnatomicalTorso({ position, rotation }: { position: [number, number, number], rotation?: [number, number, number] }) {
    return (
        <group position={position} rotation={rotation || [0, 0, 0]}>
            {/* Stand Base */}
            <mesh position={[0, 0.02, 0]}><boxGeometry args={[0.3, 0.04, 0.3]} /><meshStandardMaterial color="#222" roughness={0.9} /></mesh>
            <mesh position={[0, 0.2, 0]}><cylinderGeometry args={[0.02, 0.02, 0.4]} /><meshStandardMaterial color="#c0c0c0" /></mesh>

            {/* Torso Shell */}
            <mesh position={[0, 0.5, 0]}>
                <capsuleGeometry args={[0.15, 0.3, 8, 8]} />
                <meshStandardMaterial color="#ffccaa" transparent opacity={0.5} roughness={0.4} /> /* Semi-transparent skin */
            </mesh>

            {/* Lungs */}
            <mesh position={[-0.07, 0.6, 0.05]}><sphereGeometry args={[0.06, 8, 8]} /><meshStandardMaterial color="#ff9999" roughness={0.6} /></mesh>
            <mesh position={[0.07, 0.6, 0.05]}><sphereGeometry args={[0.06, 8, 8]} /><meshStandardMaterial color="#ff9999" roughness={0.6} /></mesh>

            {/* Heart */}
            <mesh position={[0, 0.58, 0.08]} rotation={[0.2, 0.2, 0]}><sphereGeometry args={[0.04, 8, 8]} /><meshStandardMaterial color="#cc0000" roughness={0.4} /></mesh>

            {/* Liver */}
            <mesh position={[-0.05, 0.45, 0.05]} rotation={[0, 0, 0.2]}><capsuleGeometry args={[0.05, 0.08, 8, 8]} /><meshStandardMaterial color="#8b4513" roughness={0.7} /></mesh>

            {/* Intestines (conceptual spiral) */}
            <mesh position={[0, 0.35, 0.05]}><torusGeometry args={[0.06, 0.03, 8, 8]} /><meshStandardMaterial color="#f4a460" roughness={0.8} /></mesh>
        </group>
    )
}

export function BrainModel({ position, rotation }: { position: [number, number, number], rotation?: [number, number, number] }) {
    return (
        <group position={position} rotation={rotation || [0, 0, 0]}>
            <mesh position={[0, 0.02, 0]}><cylinderGeometry args={[0.1, 0.1, 0.04]} /><meshStandardMaterial color="#333" /></mesh>
            <mesh position={[0, 0.1, 0]}><cylinderGeometry args={[0.01, 0.01, 0.15]} /><meshStandardMaterial color="#c0c0c0" /></mesh>

            {/* Brain Hemispheres */}
            <mesh position={[-0.04, 0.2, 0]} rotation={[0, 0, 0.2]}>
                <sphereGeometry args={[0.07, 8, 8]} />
                <meshStandardMaterial color="#e6a8d7" roughness={0.8} />
            </mesh>
            <mesh position={[0.04, 0.2, 0]} rotation={[0, 0, -0.2]}>
                <sphereGeometry args={[0.07, 8, 8]} />
                <meshStandardMaterial color="#e6a8d7" roughness={0.8} />
            </mesh>
        </group>
    )
}
