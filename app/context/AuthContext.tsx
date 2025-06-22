'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { auth, db } from '../firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { verifyTwoFactorCode } from '@/app/firebase/2fa';
import { getDoc, doc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    twoFactorRequired: boolean;
    twoFactorVerified: boolean;
    verifyTwoFactor: (code: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    twoFactorRequired: false,
    twoFactorVerified: false,
    verifyTwoFactor: async () => false
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [twoFactorRequired, setTwoFactorRequired] = useState(false);
    const [twoFactorVerified, setTwoFactorVerified] = useState(false);
    const router = useRouter();

    const checkTwoFactor = async (user: User) => {
        try {
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            if (userDoc.exists()) {
                const userData = userDoc.data();
                return userData.twoFactorEnabled === true;
            }
            return false;
        } catch (error) {
            console.error('Erreur lors de la vérification 2FA:', error);
            return false;
        }
    };

    const verifyTwoFactor = async (code: string) => {
        if (!user) return false;
        try {
            const isValid = await verifyTwoFactorCode(user.uid, code);
            if (isValid) {
                setTwoFactorVerified(true);
                setTwoFactorRequired(false);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Erreur lors de la vérification:', error);
            return false;
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setUser(user);
                // Ne vérifier la 2FA que si l'utilisateur vient de se connecter
                // et non sur chaque changement d'état d'authentification
                if (!twoFactorVerified) {
                    const requires2FA = await checkTwoFactor(user);
                    if (requires2FA) {
                        setTwoFactorRequired(true);
                        // Vérifier si l'utilisateur est sur la page admin
                        // Si c'est le cas, ne pas rediriger vers la vérification 2FA
                        const currentPath = window.location.pathname;
                        if (!currentPath.startsWith('/admin')) {
                            router.push('/auth/2fa-verify');
                        }
                    } else {
                        setTwoFactorRequired(false);
                    }
                }
            } else {
                setUser(null);
                setTwoFactorRequired(false);
                setTwoFactorVerified(false);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [router, twoFactorVerified]);

    const value = {
        user,
        loading,
        twoFactorRequired,
        twoFactorVerified,
        verifyTwoFactor
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth() {
    return useContext(AuthContext);
}