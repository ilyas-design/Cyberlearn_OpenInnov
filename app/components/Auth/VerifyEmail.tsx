"use client";

import { useState } from 'react';
import Link from 'next/link';
import { signOut } from 'firebase/auth';
import { auth } from '@/app/firebase/config';
import {
    refreshEmailVerificationStatus,
    sendVerificationEmail,
} from '@/app/firebase/emailVerification';
import styles from './Auth.module.css';
import Page3DShell from '@/app/components/CyberBackground/Page3DShell';

export default function VerifyEmail() {
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [sending, setSending] = useState(false);
    const [checking, setChecking] = useState(false);

    const email = auth.currentUser?.email ?? '';

    const handleResend = async () => {
        const user = auth.currentUser;
        if (!user) {
            setError('You must be signed in to resend the verification email.');
            return;
        }

        setError('');
        setSuccess('');
        setSending(true);

        try {
            await sendVerificationEmail(user);
            setSuccess('Verification email sent. Check your inbox and spam folder.');
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Unable to send verification email.';
            setError(message);
        } finally {
            setSending(false);
        }
    };

    const handleCheckVerification = async () => {
        const user = auth.currentUser;
        if (!user) {
            setError('You must be signed in to verify your email.');
            return;
        }

        setError('');
        setSuccess('');
        setChecking(true);

        try {
            const verified = await refreshEmailVerificationStatus(user);
            if (verified) {
                setSuccess('Email verified! Redirecting...');
                window.location.href = '/';
                return;
            }
            setError('Email not verified yet. Click the link in your inbox, then try again.');
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Unable to check verification status.';
            setError(message);
        } finally {
            setChecking(false);
        }
    };

    const handleSignOut = async () => {
        await signOut(auth);
        window.location.href = '/login';
    };

    return (
        <Page3DShell variant="shield" fullViewport>
        <div className={styles.authContainer}>
            <div className={styles.glassEffect}>
                <h2 className={styles.title}>Verify Your Email</h2>

                <p className={styles.confirmText}>
                    We sent a verification link to <strong>{email}</strong>.
                    Open it to activate your account, then return here.
                </p>

                {error && <p className={styles.error}>{error}</p>}
                {success && <p className={styles.success}>{success}</p>}

                <div className={styles.authForm}>
                    <button
                        type="button"
                        className={styles.authButton}
                        onClick={handleCheckVerification}
                        disabled={checking}
                    >
                        {checking ? 'Checking...' : 'I verified my email'}
                    </button>

                    <button
                        type="button"
                        className={styles.authButton}
                        onClick={handleResend}
                        disabled={sending}
                    >
                        {sending ? 'Sending...' : 'Resend verification email'}
                    </button>

                    <button
                        type="button"
                        className={styles.authButton}
                        onClick={handleSignOut}
                    >
                        Sign out
                    </button>
                </div>

                <p className={styles.switchAuth}>
                    Wrong account? <Link href="/login" className={styles.link}>Back to login</Link>
                </p>
            </div>
        </div>
        </Page3DShell>
    );
}
