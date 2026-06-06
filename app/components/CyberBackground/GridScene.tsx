'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Grid } from '@react-three/drei';
import * as THREE from 'three';
import { useMouseParallax, useReducedMotion } from './useSceneMotion';

const CYAN = '#0AFFD4';
const BLUE = '#0024FF';

const GridScene = () => {
    const groupRef = useRef<THREE.Group>(null);
    const cubesRef = useRef<THREE.Group>(null);
    const reducedMotion = useReducedMotion();
    const mouse = useMouseParallax(!reducedMotion, 0.25);

    const cubes = useMemo(
        () =>
            Array.from({ length: 8 }, (_, i) => ({
                id: i,
                position: [
                    (Math.random() - 0.5) * 8,
                    0.5 + Math.random() * 2,
                    (Math.random() - 0.5) * 8,
                ] as [number, number, number],
                scale: 0.3 + Math.random() * 0.5,
                speed: 0.3 + Math.random() * 0.4,
            })),
        []
    );

    useFrame((state) => {
        if (reducedMotion) return;
        const t = state.clock.elapsedTime;

        if (groupRef.current) {
            groupRef.current.rotation.x = -0.35 + mouse.current.y * 0.08;
            groupRef.current.rotation.y = mouse.current.x * 0.15;
        }

        if (cubesRef.current) {
            cubesRef.current.children.forEach((child, i) => {
                child.rotation.y = t * cubes[i].speed;
                child.rotation.x = t * cubes[i].speed * 0.5;
                child.position.y = cubes[i].position[1] + Math.sin(t * cubes[i].speed + i) * 0.3;
            });
        }
    });

    return (
        <group ref={groupRef} position={[0, -2, 0]}>
            <Grid
                infiniteGrid
                fadeDistance={28}
                fadeStrength={4}
                cellSize={0.5}
                sectionSize={3}
                cellColor="#0AFFD4"
                sectionColor="#0024FF"
                cellThickness={0.4}
                sectionThickness={0.8}
                position={[0, 0, 0]}
            />

            <group ref={cubesRef}>
                {cubes.map((cube) => (
                    <mesh key={cube.id} position={cube.position} scale={cube.scale}>
                        <boxGeometry args={[1, 1, 1]} />
                        <meshBasicMaterial
                            color={cube.id % 2 === 0 ? CYAN : BLUE}
                            wireframe
                            transparent
                            opacity={0.35}
                        />
                    </mesh>
                ))}
            </group>

            <mesh position={[0, 4, -6]}>
                <planeGeometry args={[20, 8]} />
                <meshBasicMaterial
                    color={BLUE}
                    transparent
                    opacity={0.03}
                    side={THREE.DoubleSide}
                />
            </mesh>
        </group>
    );
};

export default GridScene;
