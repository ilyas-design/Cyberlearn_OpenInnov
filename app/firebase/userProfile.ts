import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from './config';

/**
 * Initialise le document utilisateur dans Firestore s'il n'existe pas
 */
export async function initializeUserDocument(userId: string, email: string | null) {
    try {
        const userRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userRef);

        if (!userDoc.exists()) {
            console.log('🔧 Création du document utilisateur:', userId);
            await setDoc(userRef, {
                email: email || '',
                createdAt: new Date().toISOString(),
                exp: 0,
                level: 1,
                completedLessons: [],
                favorites: [],
                notes: {},
                badges: [],
                lastLogin: new Date().toISOString()
            });
            console.log('✅ Document utilisateur créé avec succès');
            return true;
        } else {
            // Mettre à jour la dernière connexion
            await setDoc(userRef, {
                lastLogin: new Date().toISOString()
            }, { merge: true });
            console.log('✅ Document utilisateur existe déjà');
            return false;
        }
    } catch (error) {
        console.error('❌ Erreur lors de l\'initialisation du document utilisateur:', error);
        throw error;
    }
}

/**
 * Sauvegarde les notes d'une leçon pour un utilisateur
 */
export async function saveUserNotes(userId: string, lessonId: string, notes: string) {
    try {
        const userRef = doc(db, 'users', userId);

        // Récupérer les notes existantes
        const userDoc = await getDoc(userRef);
        let existingNotes = {};

        if (userDoc.exists()) {
            existingNotes = userDoc.data().notes || {};
        }

        // Sauvegarder avec merge pour ne pas écraser les autres données
        await setDoc(userRef, {
            notes: {
                ...existingNotes,
                [lessonId]: notes
            }
        }, { merge: true });

        console.log('💾 Notes sauvegardées:', {
            userId,
            lessonId,
            noteLength: notes.length
        });

        return true;
    } catch (error) {
        console.error('❌ Erreur lors de la sauvegarde des notes:', error);
        throw error;
    }
}

/**
 * Récupère les notes d'une leçon pour un utilisateur
 */
export async function getUserNotes(userId: string, lessonId: string): Promise<string> {
    try {
        const userRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
            const userData = userDoc.data();
            const lessonNotes = userData.notes?.[lessonId] || '';
            console.log('📖 Notes récupérées:', {
                userId,
                lessonId,
                found: !!lessonNotes,
                length: lessonNotes.length
            });
            return lessonNotes;
        }

        console.log('⚠️ Document utilisateur non trouvé');
        return '';
    } catch (error) {
        console.error('❌ Erreur lors de la récupération des notes:', error);
        throw error;
    }
}
