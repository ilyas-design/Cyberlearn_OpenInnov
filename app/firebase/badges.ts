// app/firebase/badges.ts
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from './config';

export interface Badge {
    id: string;
    name: string;
    description: string;
    icon: string;
    condition: (userData: any) => boolean;
    category: 'progress' | 'achievement' | 'special';
}

export const BADGES: Badge[] = [
    {
        id: 'first-lesson',
        name: 'Premier Pas',
        description: 'Complétez votre première leçon',
        icon: '🎯',
        condition: (userData) => (userData.completedLessons?.length || 0) >= 1,
        category: 'progress'
    },
    {
        id: 'five-lessons',
        name: 'Apprenant Assidu',
        description: 'Complétez 5 leçons',
        icon: '📚',
        condition: (userData) => (userData.completedLessons?.length || 0) >= 5,
        category: 'progress'
    },
    {
        id: 'ten-lessons',
        name: 'Maître du Savoir',
        description: 'Complétez 10 leçons',
        icon: '🎓',
        condition: (userData) => (userData.completedLessons?.length || 0) >= 10,
        category: 'progress'
    },
    {
        id: 'level-5',
        name: 'Niveau 5',
        description: 'Atteignez le niveau 5',
        icon: '⭐',
        condition: (userData) => (userData.level || 1) >= 5,
        category: 'achievement'
    },
    {
        id: 'level-10',
        name: 'Expert',
        description: 'Atteignez le niveau 10',
        icon: '🌟',
        condition: (userData) => (userData.level || 1) >= 10,
        category: 'achievement'
    },
    {
        id: 'perfect-quiz',
        name: 'Quiz Parfait',
        description: 'Obtenez 100% à un quiz',
        icon: '💯',
        condition: (userData) => userData.perfectQuizzes || false,
        category: 'achievement'
    },
    {
        id: 'early-bird',
        name: 'Lève-tôt',
        description: 'Membre depuis le début',
        icon: '🐦',
        condition: (userData) => {
            const createdAt = userData.createdAt?.toDate?.() || new Date(userData.createdAt);
            return createdAt < new Date('2025-02-01');
        },
        category: 'special'
    },
    {
        id: 'streak-7',
        name: 'Semaine Complète',
        description: 'Connectez-vous 7 jours de suite',
        icon: '🔥',
        condition: (userData) => (userData.loginStreak || 0) >= 7,
        category: 'achievement'
    },
    {
        id: 'favorite-collector',
        name: 'Collectionneur',
        description: 'Ajoutez 10 leçons en favoris',
        icon: '⭐',
        condition: (userData) => (userData.favorites?.length || 0) >= 10,
        category: 'special'
    },
    {
        id: 'note-taker',
        name: 'Prise de Notes',
        description: 'Prenez des notes dans 5 leçons différentes',
        icon: '📝',
        condition: (userData) => {
            const notes = userData.notes || {};
            return Object.keys(notes).length >= 5;
        },
        category: 'special'
    }
];

export async function checkAndAwardBadges(userId: string): Promise<Badge[]> {
    try {
        const userRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userRef);

        if (!userDoc.exists()) {
            return [];
        }

        const userData = userDoc.data();
        const currentBadges = userData.badges || [];
        const newBadges: Badge[] = [];

        for (const badge of BADGES) {
            // Vérifier si l'utilisateur n'a pas déjà ce badge
            if (!currentBadges.includes(badge.id) && badge.condition(userData)) {
                newBadges.push(badge);
                currentBadges.push(badge.id);
            }
        }

        // Mettre à jour les badges si de nouveaux badges ont été débloqués
        if (newBadges.length > 0) {
            await updateDoc(userRef, {
                badges: currentBadges
            });
        }

        return newBadges;
    } catch (error) {
        console.error('Erreur lors de la vérification des badges:', error);
        return [];
    }
}

export async function getUserBadges(userId: string): Promise<Badge[]> {
    try {
        const userRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userRef);

        if (!userDoc.exists()) {
            return [];
        }

        const userData = userDoc.data();
        const badgeIds = userData.badges || [];

        return BADGES.filter(badge => badgeIds.includes(badge.id));
    } catch (error) {
        console.error('Erreur lors de la récupération des badges:', error);
        return [];
    }
}

export function getBadgeProgress(userId: string, userData: any): { badge: Badge; earned: boolean; progress?: string }[] {
    return BADGES.map(badge => {
        const earned = badge.condition(userData);
        let progress = '';

        // Calculer la progression pour certains badges
        if (!earned) {
            if (badge.id === 'first-lesson' || badge.id === 'five-lessons' || badge.id === 'ten-lessons') {
                const count = userData.completedLessons?.length || 0;
                const target = badge.id === 'first-lesson' ? 1 : badge.id === 'five-lessons' ? 5 : 10;
                progress = `${count}/${target}`;
            } else if (badge.id === 'level-5' || badge.id === 'level-10') {
                const level = userData.level || 1;
                const target = badge.id === 'level-5' ? 5 : 10;
                progress = `Niveau ${level}/${target}`;
            }
        }

        return { badge, earned, progress };
    });
}
