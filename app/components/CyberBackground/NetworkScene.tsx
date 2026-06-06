'use client';

import { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const PARTICLE_COUNT = 120;
const CONNECTION_DISTANCE = 2.2;
const CYAN = new THREE.Color('#0AFFD4');
const BLUE = new THREE.Color('#0024FF');

function createNetwork() {
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const colors = new Float32Array(PARTICLE_COUNT * 3);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const r = 3 + Math.random() * 4;

        positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = r * Math.cos(phi);

        const mix = Math.random();
        const color = CYAN.clone().lerp(BLUE, mix);
        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;
    }

    const linePositions: number[] = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        for (let j = i + 1; j < PARTICLE_COUNT; j++) {
            const dx = positions[i * 3] - positions[j * 3];
            const dy = positions[i * 3 + 1] - positions[j * 3 + 1];
            const dz = positions[i * 3 + 2] - positions[j * 3 + 2];
            const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
            if (dist < CONNECTION_DISTANCE) {
                linePositions.push(
                    positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2],
                    positions[j * 3], positions[j * 3 + 1], positions[j * 3 + 2]
                );
            }
        }
    }

    return { positions, colors, linePositions: new Float32Array(linePositions) };
}

const NetworkScene = () => {
    const groupRef = useRef<THREE.Group>(null);
    const mouse = useRef({ x: 0, y: 0 });
    const [reducedMotion, setReducedMotion] = useState(false);

    const { positions, colors, linePositions } = useMemo(createNetwork, []);

    useEffect(() => {
        const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
        setReducedMotion(mq.matches);
        const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
        mq.addEventListener('change', handler);
        return () => mq.removeEventListener('change', handler);
    }, []);

    useEffect(() => {
        if (reducedMotion) return;
        const onMove = (e: MouseEvent) => {
            mouse.current.x = (e.clientX / window.innerWidth - 0.5) * 0.4;
            mouse.current.y = (e.clientY / window.innerHeight - 0.5) * 0.4;
        };
        window.addEventListener('mousemove', onMove);
        return () => window.removeEventListener('mousemove', onMove);
    }, [reducedMotion]);

    useFrame((state) => {
        if (!groupRef.current) return;
        const t = state.clock.elapsedTime;
        if (!reducedMotion) {
            groupRef.current.rotation.y = t * 0.08;
            groupRef.current.rotation.x = Math.sin(t * 0.15) * 0.1 + mouse.current.y * 0.3;
            groupRef.current.rotation.z = mouse.current.x * 0.15;
        }
    });

    return (
        <group ref={groupRef}>
            <points>
                <bufferGeometry>
                    <bufferAttribute
                        attach="attributes-position"
                        args={[positions, 3]}
                    />
                    <bufferAttribute
                        attach="attributes-color"
                        args={[colors, 3]}
                    />
                </bufferGeometry>
                <pointsMaterial
                    size={0.06}
                    vertexColors
                    transparent
                    opacity={0.85}
                    sizeAttenuation
                    depthWrite={false}
                />
            </points>

            <lineSegments>
                <bufferGeometry>
                    <bufferAttribute
                        attach="attributes-position"
                        args={[linePositions, 3]}
                    />
                </bufferGeometry>
                <lineBasicMaterial color="#0AFFD4" transparent opacity={0.12} />
            </lineSegments>

            <mesh>
                <icosahedronGeometry args={[2.5, 1]} />
                <meshBasicMaterial
                    color="#0024FF"
                    wireframe
                    transparent
                    opacity={0.06}
                />
            </mesh>
        </group>
    );
};

export default NetworkScene;
