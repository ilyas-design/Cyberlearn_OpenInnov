'use client';

import { Suspense, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import NetworkScene from './NetworkScene';
import ShieldScene from './ShieldScene';
import GridScene from './GridScene';
import OrbitScene from './OrbitScene';
import styles from './CyberBackground.module.css';

export type SceneVariant = 'network' | 'shield' | 'grid' | 'orbit';

interface Page3DBackgroundProps {
    variant?: SceneVariant;
    position?: 'fixed' | 'absolute';
}

const SCENE_MAP = {
    network: NetworkScene,
    shield: ShieldScene,
    grid: GridScene,
    orbit: OrbitScene,
} as const;

const CAMERA: Record<SceneVariant, { position: [number, number, number]; fov: number }> = {
    network: { position: [0, 0, 10], fov: 60 },
    shield: { position: [0, 0, 9], fov: 55 },
    grid: { position: [0, 3, 10], fov: 55 },
    orbit: { position: [0, 0, 11], fov: 58 },
};

const Page3DBackground = ({ variant = 'network', position = 'fixed' }: Page3DBackgroundProps) => {
    const [mounted, setMounted] = useState(false);
    const [reducedMotion, setReducedMotion] = useState(false);

    useEffect(() => {
        setMounted(true);
        const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
        setReducedMotion(mq.matches);
    }, []);

    if (!mounted || reducedMotion) return null;

    const Scene = SCENE_MAP[variant];
    const camera = CAMERA[variant];

    return (
        <div
            className={`${styles.container} ${position === 'fixed' ? styles.fixed : styles.absolute}`}
            aria-hidden="true"
        >
            <Canvas
                className={styles.canvas}
                camera={{ position: camera.position, fov: camera.fov }}
                dpr={[1, 1.5]}
                gl={{ antialias: true, alpha: true }}
            >
                <Suspense fallback={null}>
                    <ambientLight intensity={0.35} />
                    <Scene />
                </Suspense>
            </Canvas>
        </div>
    );
};

export default Page3DBackground;
