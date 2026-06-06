'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { auth, db } from '../firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { verifyTwoFactorCode } from '@/app/firebase/2fa';
import { getDoc, doc } from 'firebase/firestore';
import { useRouter, usePathname } from 'next/navigation';
import { initializeUserDocument } from '@/app/firebase/userProfile';

interface AuthUser {
    uid: string;
    email: string;
    displayName: string | null;
    level: number;
    completedLessons?: string[];
    // ... autres champs si besoin
}

interface AuthContextType {
    user: AuthUser | null;
    loading: boolean;
    emailVerified: boolean;
    twoFactorRequired: boolean;
    twoFactorVerified: boolean;
    verifyTwoFactor: (code: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    emailVerified: false,
    twoFactorRequired: false,
    twoFactorVerified: false,
    verifyTwoFactor: async () => false
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [emailVerified, setEmailVerified] = useState(false);
    const [twoFactorRequired, setTwoFactorRequired] = useState(false);
    const [twoFactorVerified, setTwoFactorVerified] = useState(false);
    const [twoFactorChecked, setTwoFactorChecked] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    const emailVerificationExemptPaths = ['/auth/verify-email', '/login', '/reg'];

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
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                const isEmailVerified = firebaseUser.emailVerified;
                setEmailVerified(isEmailVerified);

                setUser({
                    uid: firebaseUser.uid,
                    email: firebaseUser.email || '',
                    displayName: firebaseUser.displayName,
                    level: 1,
                    completedLessons: [],
                });

                if (!isEmailVerified) {
                    setLoading(false);
                    return;
                }

                // 🔧 Initialiser le document utilisateur s'il n'existe pas
                await initializeUserDocument(firebaseUser.uid, firebaseUser.email);

                // Charger les infos Firestore (dont le level)
                const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
                let level = 1;
                let completedLessons: string[] = [];
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    level = userData.level ?? 1;
                    completedLessons = Array.isArray(userData.completedLessons) ? userData.completedLessons : [];
                }
                setUser({
                    uid: firebaseUser.uid,
                    email: firebaseUser.email || '',
                    displayName: firebaseUser.displayName,
                    level,
                    completedLessons
                });
                // Ne vérifier la 2FA que si l'utilisateur vient de se connecter et pas déjà vérifié dans la session
                const alreadyChecked = sessionStorage.getItem('2fa-checked') === 'true';
                if (!twoFactorVerified && !alreadyChecked) {
                    const requires2FA = await checkTwoFactor(firebaseUser);
                    if (requires2FA) {
                        setTwoFactorRequired(true);
                        const currentPath = window.location.pathname;
                        if (!currentPath.startsWith('/admin')) {
                            router.push('/auth/2fa-verify');
                        }
                    } else {
                        setTwoFactorRequired(false);
                    }
                    sessionStorage.setItem('2fa-checked', 'true');
                }
            } else {
                setUser(null);
                setEmailVerified(false);
                setTwoFactorRequired(false);
                setTwoFactorVerified(false);
                setTwoFactorChecked(false);
                sessionStorage.removeItem('2fa-checked');
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [router, twoFactorVerified, twoFactorChecked]);

    useEffect(() => {
        if (loading || emailVerified || !user) {
            return;
        }

        if (!emailVerificationExemptPaths.includes(pathname)) {
            router.push('/auth/verify-email');
        }
    }, [loading, emailVerified, user, pathname, router]);

    const value = {
        user,
        loading,
        emailVerified,
        twoFactorRequired,
        twoFactorVerified,
        verifyTwoFactor
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth() {
    return useContext(AuthContext);
}