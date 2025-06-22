'use client';

import TwoFactorVerification from '@/app/components/Auth/TwoFactorVerification';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

export default function TwoFactorVerifyPage() {
    const { user, twoFactorVerified } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        if (!user) {
            router.push('/login');
            return;
        }

        if (twoFactorVerified) {
            // Récupérer l'URL de retour si elle existe
            const returnUrl = searchParams.get('returnUrl') || '/';
            router.push(returnUrl);
            return;
        }

        // Sauvegarder l'URL de retour si elle existe
        const returnUrl = searchParams.get('returnUrl');
        if (returnUrl) {
            sessionStorage.setItem('returnUrl', returnUrl);
        }
    }, [user, router, twoFactorVerified, searchParams]);

    if (!user || twoFactorVerified) {
        return null;
    }

    return <TwoFactorVerification />;
}