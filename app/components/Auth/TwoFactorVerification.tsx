'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import styles from './TwoFactorVerification.module.css';

export default function TwoFactorVerification() {
    const [code, setCode] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const { user, verifyTwoFactor, twoFactorVerified } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (twoFactorVerified) {
            const returnUrl = sessionStorage.getItem('returnUrl') || '/';
            sessionStorage.removeItem('returnUrl');
            router.push(returnUrl);
        }
    }, [twoFactorVerified, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        try {
            setLoading(true);
            setError(null);

            const isValid = await verifyTwoFactor(code);
            if (!isValid) {
                setError('Code invalide');
            }
        } catch (err) {
            console.error('Erreur lors de la vérification:', err);
            setError('Une erreur est survenue lors de la vérification');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <h1 className={styles.title}>Vérification en deux étapes</h1>
                <p className={styles.description}>Veuillez entrer le code à 6 chiffres généré par votre application d'authentification.</p>
                
                <form onSubmit={handleSubmit} className={styles.form}>
                    <input
                        type="text"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="Code à 6 chiffres"
                        maxLength={6}
                        className={styles.input}
                        required
                    />
                    
                    {error && <p className={styles.error}>{error}</p>}
                    
                    <button
                        type="submit"
                        disabled={loading || code.length !== 6}
                        className={styles.button}
                    >
                        {loading ? 'Vérification...' : 'Vérifier'}
                    </button>
                </form>
            </div>
        </div>
    );
} 