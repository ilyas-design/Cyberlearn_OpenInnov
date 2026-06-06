'use client';

import { useEffect, useState, useRef } from 'react';

export function useReducedMotion() {
    const [reducedMotion, setReducedMotion] = useState(false);

    useEffect(() => {
        const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
        setReducedMotion(mq.matches);
        const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
        mq.addEventListener('change', handler);
        return () => mq.removeEventListener('change', handler);
    }, []);

    return reducedMotion;
}

export function useMouseParallax(enabled: boolean, strength = 0.4) {
    const mouse = useRef({ x: 0, y: 0 });

    useEffect(() => {
        if (!enabled) return;
        const onMove = (e: MouseEvent) => {
            mouse.current.x = (e.clientX / window.innerWidth - 0.5) * strength;
            mouse.current.y = (e.clientY / window.innerHeight - 0.5) * strength;
        };
        window.addEventListener('mousemove', onMove);
        return () => window.removeEventListener('mousemove', onMove);
    }, [enabled, strength]);

    return mouse;
}
