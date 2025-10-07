// app/firebase/favorites.ts
import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from './config';

export interface FavoriteLesson {
    lessonId: string;
    addedAt: number;
}

export async function addFavorite(userId: string, lessonId: string): Promise<boolean> {
    try {
        const userRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
            const favorites = userDoc.data().favorites || [];

            // Vérifier si déjà en favoris
            if (favorites.some((fav: FavoriteLesson) => fav.lessonId === lessonId)) {
                return false;
            }

            await updateDoc(userRef, {
                favorites: arrayUnion({
                    lessonId,
                    addedAt: Date.now()
                })
            });
        } else {
            await setDoc(userRef, {
                favorites: [{
                    lessonId,
                    addedAt: Date.now()
                }]
            }, { merge: true });
        }

        return true;
    } catch (error) {
        console.error('Erreur lors de l\'ajout aux favoris:', error);
        return false;
    }
}

export async function removeFavorite(userId: string, lessonId: string): Promise<boolean> {
    try {
        const userRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
            const favorites = userDoc.data().favorites || [];
            const favoriteToRemove = favorites.find((fav: FavoriteLesson) => fav.lessonId === lessonId);

            if (favoriteToRemove) {
                await updateDoc(userRef, {
                    favorites: arrayRemove(favoriteToRemove)
                });
                return true;
            }
        }

        return false;
    } catch (error) {
        console.error('Erreur lors de la suppression des favoris:', error);
        return false;
    }
}

export async function getFavorites(userId: string): Promise<string[]> {
    try {
        const userRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
            const favorites = userDoc.data().favorites || [];
            return favorites.map((fav: FavoriteLesson) => fav.lessonId);
        }

        return [];
    } catch (error) {
        console.error('Erreur lors de la récupération des favoris:', error);
        return [];
    }
}

export async function isFavorite(userId: string, lessonId: string): Promise<boolean> {
    try {
        const userRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
            const favorites = userDoc.data().favorites || [];
            return favorites.some((fav: FavoriteLesson) => fav.lessonId === lessonId);
        }

        return false;
    } catch (error) {
        console.error('Erreur lors de la vérification des favoris:', error);
        return false;
    }
}
