"use client"

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './Auth.module.css';
import { useSignInWithEmailAndPassword } from "react-firebase-hooks/auth";
import { auth } from "@/app/firebase/config";
import { useAuth } from '@/app/context/AuthContext';
import { Eye, EyeOff } from 'lucide-react';
import Page3DShell from '@/app/components/CyberBackground/Page3DShell';

export default function SignIn() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();
    const { twoFactorRequired } = useAuth();

    const [signInWithEmailAndPassword, user, loading, authError] = useSignInWithEmailAndPassword(auth);

    useEffect(() => {
        if (!user || twoFactorRequired) {
            return;
        }

        if (auth.currentUser?.emailVerified) {
            router.push('/');
            return;
        }

        router.push('/auth/verify-email');
    }, [user, router, twoFactorRequired]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            const credential = await signInWithEmailAndPassword(email, password);
            if (credential?.user.emailVerified) {
                router.push('/');
                return;
            }
            router.push('/auth/verify-email');
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Unable to sign in.';
            setError(message);
        }
    };

    return (
        <Page3DShell variant="shield" fullViewport>
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
                        <div className={styles.passwordWrapper}>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                className={styles.passwordToggle}
                                onClick={() => setShowPassword((prev) => !prev)}
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
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
        </Page3DShell>
    );
}