'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import UserManagement from '@/app/components/Admin/UserManagement/UserManagement';
import styles from './page.module.css';

export default function AdminUsersPage() {
    const { user, loading } = useAuth(); // Pas besoin de modifier car twoFactorVerified n'est pas utilisé ici
    const router = useRouter();

    useEffect(() => {
        if (!loading && (!user || user.email !== 'jordanturnaco@gmail.com')) {
            router.push('/');
        }
    }, [user, loading, router]);

    if (loading) {
        return <div className={styles.loading}>Chargement...</div>;
    }

    if (!user || user.email !== 'jordanturnaco@gmail.com') {
        return null;
    }

    return (
        <div className={styles.container}>
            <UserManagement />
        </div>
    );
}