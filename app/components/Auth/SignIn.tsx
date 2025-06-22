"use client"

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './Auth.module.css';
import { useSignInWithEmailAndPassword } from "react-firebase-hooks/auth";
import { auth } from "@/app/firebase/config";
import { useAuth } from '@/app/context/AuthContext';

export default function SignIn() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();
    const { twoFactorRequired } = useAuth();

    const [signInWithEmailAndPassword, user, loading, authError] = useSignInWithEmailAndPassword(auth);

    useEffect(() => {
        if (user && !twoFactorRequired) {
            router.push('/');
        }
    }, [user, router, twoFactorRequired]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await signInWithEmailAndPassword(email, password);
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <div className={styles.authContainer}>
            <div className={styles.glassEffect}>
                <h2 className={styles.title}>Access CyberLearn Terminal</h2>
                {error && <p className={styles.error}>{error}</p>}
                {authError && <p className={styles.error}>Incorrect email or password</p>}

                <form onSubmit={handleSubmit} className={styles.authForm}>
                    <div className={styles.inputGroup}>
                        <label htmlFor="email">Encrypted Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label htmlFor="password">Security Key</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className={styles.authButton} disabled={loading}>
                        {loading ? 'Authenticating...' : 'Authenticate'}
                    </button>
                </form>

                <p className={styles.switchAuth}>
                    Not registered yet? <Link href="/reg" className={styles.link}>Create account!</Link>
                </p>
            </div>
        </div>
    );
}