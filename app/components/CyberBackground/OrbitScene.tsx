'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useMouseParallax, useReducedMotion } from './useSceneMotion';

const CYAN = '#0AFFD4';
const BLUE = '#0024FF';

const rings = [
    { radius: 2.5, tube: 0.03, speed: 0.6, color: CYAN, rotation: [0, 0, 0] as [number, number, number] },
    { radius: 3.2, tube: 0.025, speed: -0.45, color: BLUE, rotation: [Math.PI / 3, 0, 0] as [number, number, number] },
    { radius: 3.9, tube: 0.02, speed: 0.35, color: CYAN, rotation: [0, Math.PI / 4, Math.PI / 6] as [number, number, number] },
    { radius: 4.6, tube: 0.015, speed: -0.25, color: BLUE, rotation: [Math.PI / 5, Math.PI / 3, 0] as [number, number, number] },
];

const OrbitScene = () => {
    const groupRef = useRef<THREE.Group>(null);
    const ringsRef = useRef<THREE.Group>(null);
    const reducedMotion = useReducedMotion();
    const mouse = useMouseParallax(!reducedMotion, 0.3);

    useFrame((state) => {
        if (!groupRef.current || reducedMotion) return;
        const t = state.clock.elapsedTime;

        groupRef.current.rotation.x = mouse.current.y * 0.2;
        groupRef.current.rotation.y = t * 0.04 + mouse.current.x * 0.2;

        if (ringsRef.current) {
            ringsRef.current.children.forEach((child, i) => {
                child.rotation.z = t * rings[i].speed * 0.1;
            });
        }
    });

    return (
        <group ref={groupRef}>
            <mesh>
                <sphereGeometry args={[0.35, 16, 16]} />
                <meshBasicMaterial color={CYAN} transparent opacity={0.9} />
            </mesh>

            <group ref={ringsRef}>
                {rings.map((ring, i) => (
                    <mesh key={i} rotation={ring.rotation}>
                        <torusGeometry args={[ring.radius, ring.tube, 16, 80]} />
                        <meshBasicMaterial color={ring.color} transparent opacity={0.25} />
                    </mesh>
                ))}
            </group>

            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
                const angle = (i / 8) * Math.PI * 2;
                const r = 2.8 + (i % 3) * 0.4;
                return (
                    <mesh
                        key={i}
                        position={[Math.cos(angle) * r, Math.sin(angle * 2) * 0.5, Math.sin(angle) * r]}
                    >
                        <sphereGeometry args={[0.05, 6, 6]} />
                        <meshBasicMaterial color={i % 2 === 0 ? CYAN : BLUE} transparent opacity={0.6} />
                    </mesh>
                );
            })}
        </group>
    );
};

export default OrbitScene;
