'use client';

import dynamic from 'next/dynamic';
import type { SceneVariant } from './Page3DBackground';
import styles from './Page3DShell.module.css';

const Page3DBackground = dynamic(() => import('./Page3DBackground'), { ssr: false });

interface Page3DShellProps {
    children: React.ReactNode;
    variant?: SceneVariant;
    fullViewport?: boolean;
    className?: string;
}

const Page3DShell = ({
    children,
    variant = 'grid',
    fullViewport = false,
    className = '',
}: Page3DShellProps) => {
    return (
        <div className={`${styles.shell} ${fullViewport ? styles.fullViewport : ''} ${className}`}>
            <Page3DBackground variant={variant} position="fixed" />
            <div className={styles.overlay} />
            <div className={styles.content}>{children}</div>
        </div>
    );
};

export default Page3DShell;
