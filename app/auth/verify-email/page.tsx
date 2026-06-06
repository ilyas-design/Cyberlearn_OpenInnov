'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import VerifyEmail from '@/app/components/Auth/VerifyEmail';

export default function VerifyEmailPage() {
    const router = useRouter();
    const { user, loading, emailVerified } = useAuth();

    useEffect(() => {
        if (loading) {
            return;
        }

        if (!user) {
            router.push('/login');
            return;
        }

        if (emailVerified) {
            router.push('/');
        }
    }, [user, loading, emailVerified, router]);

    if (loading || !user || emailVerified) {
        return null;
    }

    return <VerifyEmail />;
}
