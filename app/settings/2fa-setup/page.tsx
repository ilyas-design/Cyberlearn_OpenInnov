'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { Shield, Check, X, RefreshCw } from 'lucide-react';
import QRCode from 'qrcode';
import { authenticator } from 'otplib';
import styles from './TwoFactorSetup.module.css';
import { saveTwoFactorSecret } from '@/app/firebase/2fa';

export default function TwoFactorSetup() {
    const { user } = useAuth();
    const router = useRouter();
    const [qrCode, setQrCode] = useState<string>('');
    const [secret, setSecret] = useState<string>('');
    const [verificationCode, setVerificationCode] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        if (!user) {
            router.push('/login');
            return;
        }
        generateQRCode();
    }, [user, router]);

    const generateQRCode = async () => {
        try {
            setLoading(true);
            
            // Générer une clé secrète
            const newSecret = authenticator.generateSecret();
            setSecret(newSecret);

            // Créer l'URL pour le QR code
            const otpauth = authenticator.keyuri(
                user?.email || 'user',
                'CyberLearn',
                newSecret
            );

            // Générer le QR code avec les options appropriées
            const qrCodeDataUrl = await QRCode.toDataURL(otpauth, {
                errorCorrectionLevel: 'H',
                margin: 2,
                width: 200,
                color: {
                    dark: '#000000',
                    light: '#ffffff'
                }
            });
            setQrCode(qrCodeDataUrl);
            setLoading(false);
        } catch (err) {
            console.error('Erreur lors de la génération du QR code:', err);
            setError('Erreur lors de la génération du QR code');
            setLoading(false);
        }
    };

    const verifyCode = async () => {
        try {
            setLoading(true);
            
            // Vérifier le code
            const isValid = authenticator.verify({
                token: verificationCode,
                secret: secret
            });

            if (isValid && user) {
                // Sauvegarder la clé secrète dans la base de données
                await saveTwoFactorSecret(user.uid, secret);
                setSuccess('Authentification à deux facteurs activée avec succès');
                setTimeout(() => {
                    router.push('/settings');
                }, 2000);
            } else {
                setError('Code invalide');
            }
            setLoading(false);
        } catch (err) {
            console.error('Erreur lors de la vérification du code:', err);
            setError('Erreur lors de la vérification du code');
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <RefreshCw className={styles.loadingIcon} />
                <p>Chargement...</p>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <Shield size={24} />
                <h1>Configuration de l'authentification à deux facteurs</h1>
            </div>

            <div className={styles.content}>
                <div className={styles.step}>
                    <h2>Étape 1 : Scanner le QR code</h2>
                    <p>Utilisez une application d'authentification comme Google Authenticator ou Authy pour scanner ce QR code.</p>
                    <div className={styles.qrContainer}>
                        <img src={qrCode} alt="QR Code" className={styles.qrCode} />
                    </div>
                    <div className={styles.secretContainer}>
                        <p>Ou entrez manuellement cette clé :</p>
                        <code className={styles.secretKey}>{secret}</code>
                    </div>
                </div>

                <div className={styles.step}>
                    <h2>Étape 2 : Vérifier le code</h2>
                    <p>Entrez le code à 6 chiffres généré par votre application d'authentification.</p>
                    <div className={styles.verificationContainer}>
                        <input
                            type="text"
                            value={verificationCode}
                            onChange={(e) => setVerificationCode(e.target.value)}
                            placeholder="Code à 6 chiffres"
                            maxLength={6}
                            className={styles.codeInput}
                        />
                        <button
                            onClick={verifyCode}
                            disabled={verificationCode.length !== 6}
                            className={styles.verifyButton}
                        >
                            Vérifier
                        </button>
                    </div>
                </div>

                {error && (
                    <div className={styles.errorContainer}>
                        <X size={18} />
                        <span>{error}</span>
                    </div>
                )}

                {success && (
                    <div className={styles.successContainer}>
                        <Check size={18} />
                        <span>{success}</span>
                    </div>
                )}
            </div>
        </div>
    );
} 