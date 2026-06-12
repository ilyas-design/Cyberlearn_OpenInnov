"use client"

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './Auth.module.css';
import { useCreateUserWithEmailAndPassword } from "react-firebase-hooks/auth";
import { auth } from "@/app/firebase/config";
import { sendVerificationEmail } from '@/app/firebase/emailVerification';
import { Eye, EyeOff } from 'lucide-react';
import Page3DShell from '@/app/components/CyberBackground/Page3DShell';
import { useLanguage } from '@/app/context/LanguageContext';

type AccountType = 'student' | 'teacher';

export default function Register() {
    const { t } = useLanguage();
    const [accountType, setAccountType] = useState<AccountType>('student');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [username, setUsername] = useState('');
    const [teacherAccessCode, setTeacherAccessCode] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const router = useRouter();

    const [createUserWithEmailAndPassword] = useCreateUserWithEmailAndPassword(auth);
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (passwordStrength() < 3) {
            setError('Password is too weak');
            return;
        }

        if (accountType === 'teacher' && !teacherAccessCode.trim()) {
            setError(t('auth.teacherAccessCodeRequired'));
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(email, password);
            if (userCredential) {
                const user = auth.currentUser;
                if (user) {
                    const token = await user.getIdToken();
                    const profileResponse = await fetch('/api/auth/register-profile', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify({
                            username,
                            teacherAccessCode:
                                accountType === 'teacher'
                                    ? teacherAccessCode.trim()
                                    : undefined,
                        }),
                    });

                    if (!profileResponse.ok) {
                        const data = await profileResponse.json().catch(() => ({}));
                        await user.delete();
                        setError(data.error || 'Unable to complete registration.');
                        return;
                    }

                    await sendVerificationEmail(user);
                    const profileData = await profileResponse.json();
                    const teacherMsg = profileData.isTeacher
                        ? ' Teacher access granted — you can submit lessons after admin approval.'
                        : '';
                    setSuccess(`Registration successful! Check your email for verification.${teacherMsg}`);
                    router.push('/auth/verify-email');
                }
            }
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Unable to create account.';
            setError(message);
        }
    };

    const handleAccountTypeChange = (type: AccountType) => {
        setAccountType(type);
        if (type === 'student') {
            setTeacherAccessCode('');
        }
    };

    const passwordStrength = () => {
        let strength = 0;
        if (password.length >= 8) strength++;
        if (password.match(/[A-Z]/)) strength++;
        if (password.match(/[0-9]/)) strength++;
        if (password.match(/[^A-Za-z0-9]/)) strength++;
        return strength;
    };

    return (
        <Page3DShell variant="shield" fullViewport>
        <div className={styles.authContainer}>
            <div className={styles.glassEffect}>
                <h2 className={styles.title}>Create CyberLearn Account</h2>
                {error && <p className={styles.error}>{error}</p>}
                {success && <p className={styles.success}>{success}</p>}

                <form onSubmit={handleSubmit} className={styles.authForm}>
                    <div className={styles.inputGroup}>
                        <label>{t('auth.accountType')}</label>
                        <div
                            className={styles.accountTypeSwitch}
                            role="group"
                            aria-label={t('auth.accountType')}
                        >
                            <div
                                className={`${styles.accountTypeSlider} ${accountType === 'teacher' ? styles.accountTypeSliderRight : ''}`}
                                aria-hidden="true"
                            />
                            <button
                                type="button"
                                className={`${styles.accountTypeOption} ${accountType === 'student' ? styles.accountTypeOptionActive : ''}`}
                                onClick={() => handleAccountTypeChange('student')}
                                aria-pressed={accountType === 'student'}
                            >
                                {t('auth.student')}
                            </button>
                            <button
                                type="button"
                                className={`${styles.accountTypeOption} ${accountType === 'teacher' ? styles.accountTypeOptionActive : ''}`}
                                onClick={() => handleAccountTypeChange('teacher')}
                                aria-pressed={accountType === 'teacher'}
                            >
                                {t('auth.teacher')}
                            </button>
                        </div>
                    </div>

                    <div
                        className={`${styles.teacherCodeReveal} ${accountType === 'teacher' ? styles.teacherCodeRevealVisible : ''}`}
                        aria-hidden={accountType !== 'teacher'}
                    >
                        <div className={styles.teacherCodeRevealInner}>
                            <div className={styles.inputGroup}>
                                <label htmlFor="teacherAccessCode">{t('auth.teacherAccessCode')}</label>
                                <input
                                    type="password"
                                    id="teacherAccessCode"
                                    value={teacherAccessCode}
                                    onChange={(e) => setTeacherAccessCode(e.target.value)}
                                    placeholder={t('auth.teacherAccessCodeHint')}
                                    autoComplete="off"
                                    tabIndex={accountType === 'teacher' ? 0 : -1}
                                    required={accountType === 'teacher'}
                                />
                            </div>
                        </div>
                    </div>

                    <div className={styles.inputGroup}>
                        <label htmlFor="username">username</label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label htmlFor="password">password</label>
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
                        <div className={styles.passwordStrength}>
                            {Array(4).fill(null).map((_, i) => (
                                <div
                                    key={i}
                                    className={`${styles.strengthBar} ${i < passwordStrength() ? styles.active : ''}`}
                                ></div>
                            ))}
                        </div>
                    </div>

                    <button type="submit" className={styles.authButton}>
                        Activate Account
                    </button>
                </form>

                <p className={styles.switchAuth}>
                    Already initiated? <Link href="/login" className={styles.link}>Access Terminal</Link>
                </p>
            </div>
        </div>
        </Page3DShell>
    );
}