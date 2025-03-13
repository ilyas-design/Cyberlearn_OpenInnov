'use client';

import { useState, useEffect, useRef } from 'react';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '@/app/firebase/config';
import { useAuth } from '@/app/context/AuthContext';
import { Moon, Bell, Mail, Lock, Globe, Save } from 'lucide-react';
import styles from './Settings.module.css';

interface UserSettings {
    theme: 'light' | 'dark';
    notifications: boolean;
    language: string;
    emailNotifications: boolean;
    securityLevel: 'low' | 'medium' | 'high';
}

const defaultSettings: UserSettings = {
    theme: 'light',
    notifications: true,
    language: 'fr',
    emailNotifications: true,
    securityLevel: 'medium'
};

const Settings = () => {
    const { user } = useAuth();
    const [settings, setSettings] = useState<UserSettings>(defaultSettings);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const isMounted = useRef(false);

    useEffect(() => {
        isMounted.current = true;
        if (user) {
            fetchSettings();
        }
        return () => {
            isMounted.current = false;
        };
    }, [user]);

    const fetchSettings = async () => {
        try {
            if (!user) return;
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            if (userDoc.exists() && isMounted.current) {
                const userData = userDoc.data();
                setSettings(userData.settings || defaultSettings);
            }
        } catch (err) {
            if (isMounted.current) {
                setError('Erreur lors du chargement des paramètres');
                console.error('Erreur:', err);
            }
        } finally {
            if (isMounted.current) {
                setLoading(false);
            }
        }
    };

    const handleUpdateSettings = async (newSettings: Partial<UserSettings>) => {
        try {
            if (!user) return;
            const userRef = doc(db, 'users', user.uid);
            const updatedSettings = { ...settings, ...newSettings };
            await updateDoc(userRef, {
                settings: updatedSettings
            });
            if (isMounted.current) {
                setSettings(updatedSettings);
                setSuccess('Paramètres mis à jour avec succès');
                setTimeout(() => {
                    if (isMounted.current) {
                        setSuccess(null);
                    }
                }, 3000);
            }
        } catch (err) {
            if (isMounted.current) {
                setError('Erreur lors de la mise à jour des paramètres');
                console.error('Erreur:', err);
                setTimeout(() => {
                    if (isMounted.current) {
                        setError(null);
                    }
                }, 3000);
            }
        }
    };

    if (loading) {
        return <div className={styles.loading}>Chargement des paramètres...</div>;
    }

    return (
        <div className={styles.container}>
            <h1>Paramètres du compte</h1>

            {error && <div className={styles.error}>{error}</div>}
            {success && <div className={styles.success}>{success}</div>}

            <div className={styles.settingsGrid}>
                <div className={styles.settingGroup}>
                    <h2>Apparence</h2>
                    <div className={styles.settingItem}>
                        <Moon size={20} />
                        <label>Thème</label>
                        <select
                            value={settings.theme}
                            onChange={(e) => handleUpdateSettings({
                                theme: e.target.value as 'light' | 'dark'
                            })}
                        >
                            <option value="light">Clair</option>
                            <option value="dark">Sombre</option>
                        </select>
                    </div>
                </div>

                <div className={styles.settingGroup}>
                    <h2>Notifications</h2>
                    <div className={styles.settingItem}>
                        <Bell size={20} />
                        <label>Notifications générales</label>
                        <input
                            type="checkbox"
                            checked={settings.notifications}
                            onChange={(e) => handleUpdateSettings({
                                notifications: e.target.checked
                            })}
                        />
                    </div>
                    <div className={styles.settingItem}>
                        <Mail size={20} />
                        <label>Notifications par email</label>
                        <input
                            type="checkbox"
                            checked={settings.emailNotifications}
                            onChange={(e) => handleUpdateSettings({
                                emailNotifications: e.target.checked
                            })}
                        />
                    </div>
                </div>

                <div className={styles.settingGroup}>
                    <h2>Sécurité</h2>
                    <div className={styles.settingItem}>
                        <Lock size={20} />
                        <label>Niveau de sécurité</label>
                        <select
                            value={settings.securityLevel}
                            onChange={(e) => handleUpdateSettings({
                                securityLevel: e.target.value as 'low' | 'medium' | 'high'
                            })}
                        >
                            <option value="low">Bas</option>
                            <option value="medium">Moyen</option>
                            <option value="high">Haut</option>
                        </select>
                    </div>
                </div>

                <div className={styles.settingGroup}>
                    <h2>Langue</h2>
                    <div className={styles.settingItem}>
                        <Globe size={20} />
                        <label>Langue de l'interface</label>
                        <select
                            value={settings.language}
                            onChange={(e) => handleUpdateSettings({
                                language: e.target.value
                            })}
                        >
                            <option value="fr">Français</option>
                            <option value="en">English</option>
                            <option value="es">Español</option>
                            <option value="de">Deutsch</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings; 