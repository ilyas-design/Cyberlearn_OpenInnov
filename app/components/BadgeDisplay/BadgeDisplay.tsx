'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { getUserBadges, BADGES, getBadgeProgress, Badge } from '@/app/firebase/badges';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/app/firebase/config';
import styles from './BadgeDisplay.module.css';

interface BadgeDisplayProps {
    compact?: boolean;
    showProgress?: boolean;
}

export default function BadgeDisplay({ compact = false, showProgress = false }: BadgeDisplayProps) {
    const { user } = useAuth();
    const [earnedBadges, setEarnedBadges] = useState<Badge[]>([]);
    const [badgeProgress, setBadgeProgress] = useState<{ badge: Badge; earned: boolean; progress?: string }[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBadges = async () => {
            if (user) {
                setLoading(true);
                const badges = await getUserBadges(user.uid);
                setEarnedBadges(badges);

                if (showProgress) {
                    const userRef = doc(db, 'users', user.uid);
                    const userDoc = await getDoc(userRef);
                    if (userDoc.exists()) {
                        const progress = getBadgeProgress(user.uid, userDoc.data());
                        setBadgeProgress(progress);
                    }
                }

                setLoading(false);
            }
        };

        fetchBadges();
    }, [user, showProgress]);

    if (loading) {
        return (
            <div className={styles.loading}>
                <div className={styles.spinner}></div>
            </div>
        );
    }

    if (compact) {
        return (
            <div className={styles.badgeContainer}>
                <div className={styles.badgeGrid}>
                    {earnedBadges.slice(0, 6).map((badge) => (
                        <div key={badge.id} className={styles.badgeItem} title={badge.description}>
                            <span className={styles.badgeIcon}>{badge.icon}</span>
                        </div>
                    ))}
                    {earnedBadges.length > 6 && (
                        <div className={styles.badgeMore}>
                            +{earnedBadges.length - 6}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    if (showProgress) {
        return (
            <div className={styles.badgeProgressContainer}>
                <h3 className={styles.sectionTitle}>Badges & Achievements</h3>
                <div className={styles.badgeProgressGrid}>
                    {badgeProgress.map(({ badge, earned, progress }) => (
                        <div
                            key={badge.id}
                            className={`${styles.badgeCard} ${earned ? styles.earned : styles.locked}`}
                        >
                            <div className={styles.badgeIconLarge}>{badge.icon}</div>
                            <div className={styles.badgeInfo}>
                                <h4 className={styles.badgeName}>{badge.name}</h4>
                                <p className={styles.badgeDescription}>{badge.description}</p>
                                {!earned && progress && (
                                    <div className={styles.progressBar}>
                                        <span className={styles.progressText}>{progress}</span>
                                    </div>
                                )}
                                {earned && (
                                    <span className={styles.earnedLabel}>✓ Débloqué</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className={styles.badgeContainer}>
            <h3 className={styles.sectionTitle}>
                Mes Badges ({earnedBadges.length}/{BADGES.length})
            </h3>
            <div className={styles.badgeGrid}>
                {earnedBadges.map((badge) => (
                    <div key={badge.id} className={styles.badgeItem}>
                        <span className={styles.badgeIcon}>{badge.icon}</span>
                        <div className={styles.badgeTooltip}>
                            <strong>{badge.name}</strong>
                            <p>{badge.description}</p>
                        </div>
                    </div>
                ))}
            </div>
            {earnedBadges.length === 0 && (
                <p className={styles.noBadges}>
                    Complétez des leçons pour débloquer des badges ! 🎯
                </p>
            )}
        </div>
    );
}
