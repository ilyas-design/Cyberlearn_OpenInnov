'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import Settings from '../components/Settings/Settings';

export default function SettingsPage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    if (loading) {
        return <div>Chargement...</div>;
    }

    if (!user) {
        return null;
    }

    return <Settings />;
} 