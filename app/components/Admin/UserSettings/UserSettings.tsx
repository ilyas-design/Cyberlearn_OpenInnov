'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, query, where } from 'firebase/firestore';
import { db } from '@/app/firebase/config';
import { Settings, Save, RefreshCw, AlertTriangle, User, Mail, Lock, Bell, Globe, Moon } from 'lucide-react';
import styles from './UserSettings.module.css';

interface UserSettings {
    id: string;
    email: string;
    username: string;
    level: number;
    settings: {
        theme: 'light' | 'dark';
        notifications: boolean;
        language: string;
        emailNotifications: boolean;
        securityLevel: 'low' | 'medium' | 'high';
    };
}

const defaultSettings = {
    theme: 'light' as const,
    notifications: true,
    language: 'fr',
    emailNotifications: true,
    securityLevel: 'medium' as const
};

const UserSettings = () => {
    const [users, setUsers] = useState<UserSettings[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [selectedUser, setSelectedUser] = useState<UserSettings | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const usersCollection = collection(db, 'users');
            const usersSnapshot = await getDocs(usersCollection);
            const usersData = usersSnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    email: data.email || '',
                    username: data.username || '',
                    level: data.level ?? 1,
                    settings: data.settings || defaultSettings
                };
            }) as UserSettings[];
            setUsers(usersData);
        } catch (err) {
            setError('Erreur lors du chargement des utilisateurs');
            console.error('Erreur:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateSettings = async (userId: string, newSettings: UserSettings['settings'], newLevel?: number) => {
        try {
            const userRef = doc(db, 'users', userId);
            const updateData: any = { settings: newSettings };
            if (typeof newLevel === 'number') updateData.level = newLevel;
            await updateDoc(userRef, updateData);
            setSuccess('Paramètres mis à jour avec succès');
            fetchUsers();
        } catch (err) {
            setError('Erreur lors de la mise à jour des paramètres');
            console.error('Erreur:', err);
        }
    };

    const filteredUsers = users.filter(user =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className={styles.loading}>Chargement...</div>;
    if (error) return <div className={styles.error}>{error}</div>;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>Paramètres Utilisateurs</h1>
                <div className={styles.searchContainer}>
                    <input
                        type="text"
                        placeholder="Rechercher un utilisateur..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={styles.searchInput}
                    />
                </div>
            </div>

            <div className={styles.content}>
                <div className={styles.usersList}>
                    {filteredUsers.map((user) => (
                        <div
                            key={user.id}
                            className={`${styles.userCard} ${selectedUser?.id === user.id ? styles.selected : ''}`}
                            onClick={() => setSelectedUser(user)}
                        >
                            <div className={styles.userInfo}>
                                <User size={20} />
                                <div>
                                    <h3>{user.username}</h3>
                                    <p>{user.email}</p>
                                    <span className={styles.levelBadge}>Niveau {user.level ?? 1}</span>
                                </div>
                            </div>
                            <Settings size={20} />
                        </div>
                    ))}
                </div>

                {selectedUser && (
                    <div className={styles.settingsPanel}>
                        <div className={styles.settingsHeader}>
                            <h2>Paramètres de {selectedUser.username}</h2>
                            <button
                                className={styles.refreshButton}
                                onClick={() => setSelectedUser(users.find(u => u.id === selectedUser.id) || null)}
                            >
                                <RefreshCw size={18} />
                            </button>
                        </div>

                        <div className={styles.settingsGrid}>
                            <div className={styles.settingGroup}>
                                <h3>Apparence</h3>
                                <div className={styles.settingItem}>
                                    <Moon size={18} />
                                    <label>Thème</label>
                                    <select
                                        value={selectedUser.settings?.theme || defaultSettings.theme}
                                        onChange={(e) => handleUpdateSettings(selectedUser.id, {
                                            ...selectedUser.settings,
                                            theme: e.target.value as 'light' | 'dark'
                                        })}
                                    >
                                        <option value="light">Clair</option>
                                        <option value="dark">Sombre</option>
                                    </select>
                                </div>
                            </div>

                            <div className={styles.settingGroup}>
                                <h3>Notifications</h3>
                                <div className={styles.settingItem}>
                                    <Bell size={18} />
                                    <label>Notifications générales</label>
                                    <input
                                        type="checkbox"
                                        checked={selectedUser.settings?.notifications ?? defaultSettings.notifications}
                                        onChange={(e) => handleUpdateSettings(selectedUser.id, {
                                            ...selectedUser.settings,
                                            notifications: e.target.checked
                                        })}
                                    />
                                </div>
                                <div className={styles.settingItem}>
                                    <Mail size={18} />
                                    <label>Notifications par email</label>
                                    <input
                                        type="checkbox"
                                        checked={selectedUser.settings?.emailNotifications ?? defaultSettings.emailNotifications}
                                        onChange={(e) => handleUpdateSettings(selectedUser.id, {
                                            ...selectedUser.settings,
                                            emailNotifications: e.target.checked
                                        })}
                                    />
                                </div>
                            </div>

                            <div className={styles.settingGroup}>
                                <h3>Sécurité</h3>
                                <div className={styles.settingItem}>
                                    <Lock size={18} />
                                    <label>Niveau de sécurité</label>
                                    <select
                                        value={selectedUser.settings?.securityLevel || defaultSettings.securityLevel}
                                        onChange={(e) => handleUpdateSettings(selectedUser.id, {
                                            ...selectedUser.settings,
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
                                <h3>Langue</h3>
                                <div className={styles.settingItem}>
                                    <Globe size={18} />
                                    <label>Langue de l'interface</label>
                                    <select
                                        value={selectedUser.settings?.language || defaultSettings.language}
                                        onChange={(e) => handleUpdateSettings(selectedUser.id, {
                                            ...selectedUser.settings,
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

                            <div className={styles.settingGroup}>
                                <h3>Niveau</h3>
                                <div className={styles.settingItem}>
                                    <label>Niveau utilisateur</label>
                                    <input
                                        type="number"
                                        min={1}
                                        value={selectedUser.level ?? 1}
                                        onChange={e => handleUpdateSettings(selectedUser.id, {
                                            ...selectedUser.settings
                                        }, Number(e.target.value))}
                                        className={styles.levelInput}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserSettings; 