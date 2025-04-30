import { db } from './config';
import { doc, updateDoc, getDoc } from 'firebase/firestore';

export const saveTwoFactorSecret = async (userId: string, secret: string) => {
    try {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
            twoFactorSecret: secret,
            twoFactorEnabled: true
        });
        return true;
    } catch (error) {
        console.error('Erreur lors de la sauvegarde de la clé secrète:', error);
        throw error;
    }
};

export const verifyTwoFactorCode = async (userId: string, code: string) => {
    try {
        const userRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userRef);
        
        if (!userDoc.exists()) {
            throw new Error('Utilisateur non trouvé');
        }

        const userData = userDoc.data();
        const secret = userData.twoFactorSecret;

        if (!secret) {
            throw new Error('2FA non configurée');
        }

        const { authenticator } = require('otplib');
        const isValid = authenticator.verify({
            token: code,
            secret: secret
        });

        return isValid;
    } catch (error) {
        console.error('Erreur lors de la vérification du code:', error);
        throw error;
    }
}; 