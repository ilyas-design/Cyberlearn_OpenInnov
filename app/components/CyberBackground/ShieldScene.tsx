'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useMouseParallax, useReducedMotion } from './useSceneMotion';

const CYAN = '#0AFFD4';
const BLUE = '#0024FF';

const ShieldScene = () => {
    const groupRef = useRef<THREE.Group>(null);
    const reducedMotion = useReducedMotion();
    const mouse = useMouseParallax(!reducedMotion, 0.35);

    useFrame((state) => {
        if (!groupRef.current || reducedMotion) return;
        const t = state.clock.elapsedTime;
        groupRef.current.rotation.y = t * 0.12;
        groupRef.current.rotation.x = Math.sin(t * 0.2) * 0.08 + mouse.current.y * 0.25;
        groupRef.current.rotation.z = mouse.current.x * 0.12;
    });

    return (
        <group ref={groupRef}>
            <mesh>
                <torusKnotGeometry args={[2.2, 0.35, 128, 16]} />
                <meshBasicMaterial color={CYAN} wireframe transparent opacity={0.14} />
            </mesh>

            <mesh rotation={[Math.PI / 4, Math.PI / 4, 0]}>
                <octahedronGeometry args={[1.8, 0]} />
                <meshBasicMaterial color={BLUE} wireframe transparent opacity={0.1} />
            </mesh>

            <mesh rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[3.2, 0.02, 8, 64]} />
                <meshBasicMaterial color={CYAN} transparent opacity={0.2} />
            </mesh>

            {[0, 1, 2, 3, 4, 5].map((i) => {
                const angle = (i / 6) * Math.PI * 2;
                return (
                    <mesh
                        key={i}
                        position={[Math.cos(angle) * 3.5, Math.sin(angle * 0.5) * 0.8, Math.sin(angle) * 3.5]}
                    >
                        <sphereGeometry args={[0.08, 8, 8]} />
                        <meshBasicMaterial color={CYAN} transparent opacity={0.7} />
                    </mesh>
                );
            })}
        </group>
    );
};

export default ShieldScene;
