'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './AnimateIn.module.css';

type Animation = 'fade-up' | 'fade-in' | 'fade-left' | 'fade-right' | 'scale';

interface AnimateInProps {
    children: React.ReactNode;
    animation?: Animation;
    delay?: number;
    className?: string;
}

const AnimateIn = ({
    children,
    animation = 'fade-up',
    delay = 0,
    className = '',
}: AnimateInProps) => {
    const ref = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setVisible(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.08, rootMargin: '0px 0px -32px 0px' }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    return (
        <div
            ref={ref}
            className={`${styles.animateIn} ${styles[animation]} ${visible ? styles.visible : ''} ${className}`}
            style={{ transitionDelay: `${delay}ms` }}
        >
            {children}
        </div>
    );
};

export default AnimateIn;
