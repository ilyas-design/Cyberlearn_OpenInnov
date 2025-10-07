'use client';

import styles from './ProgressBar.module.css';

interface ProgressBarProps {
    current: number;
    total: number;
    showLabel?: boolean;
}

export default function ProgressBar({ current, total, showLabel = true }: ProgressBarProps) {
    const percentage = Math.round((current / total) * 100);

    return (
        <div className={styles.progressBarContainer}>
            {showLabel && (
                <div className={styles.progressLabel}>
                    <span className={styles.progressText}>
                        Progression: {current} / {total} sections
                    </span>
                    <span className={styles.progressPercentage}>{percentage}%</span>
                </div>
            )}
            <div className={styles.progressBar}>
                <div
                    className={styles.progressFill}
                    style={{ width: `${percentage}%` }}
                >
                    <div className={styles.progressGlow}></div>
                </div>
            </div>
        </div>
    );
}
