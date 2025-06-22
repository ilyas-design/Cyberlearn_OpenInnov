'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, deleteDoc, doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/app/firebase/config';
import { User, Trash2, Search, Edit, Shield, Check, X, BookOpen } from 'lucide-react';
import styles from './UserManagement.module.css';
import { getAllLessons, Lesson } from '@/app/firebase/lessons';

interface UserData {
    authID: string;
    email: string;
    username: string;
    isAdmin?: boolean;
    level?: number;
    completedLessons?: string[];
}

const UserManagement = () => {
    const [users, setUsers] = useState<UserData[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [modalUser, setModalUser] = useState<UserData | null>(null);
    const [modalLessons, setModalLessons] = useState<string[]>([]);
    const [levelInput, setLevelInput] = useState<{[userId: string]: number}>({});
    const [levelLoading, setLevelLoading] = useState<string | null>(null);
    const [modalLoading, setModalLoading] = useState(false);

    useEffect(() => {
        fetchUsers();
        fetchLessons();
    }, []);

    const fetchUsers = async () => {
        try {
            const usersCollection = collection(db, 'users');
            const usersSnapshot = await getDocs(usersCollection);
            const usersData = usersSnapshot.docs.map(doc => ({
                ...doc.data(),
                authID: doc.id,
                isAdmin: doc.data().isAdmin || false,
                level: doc.data().level ?? 1,
                completedLessons: doc.data().completedLessons || []
            })) as UserData[];
            setUsers(usersData);
        } catch (err) {
            setError('Erreur lors du chargement des utilisateurs');
            console.error('Erreur:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchLessons = async () => {
        const allLessons = await getAllLessons();
        setLessons(allLessons);
    };

    const handleDeleteUser = async (authID: string) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) return;
        try {
            await deleteDoc(doc(db, 'users', authID));
            setUsers(users.filter(user => user.authID !== authID));
            setSuccess('Utilisateur supprimé avec succès');
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            setError('Erreur lors de la suppression de l\'utilisateur');
            console.error('Erreur:', err);
        }
    };

    const handleToggleAdminRole = async (authID: string, currentAdminStatus: boolean) => {
        try {
            const userRef = doc(db, 'users', authID);
            await updateDoc(userRef, { isAdmin: !currentAdminStatus });
            setUsers(users.map(user => user.authID === authID ? { ...user, isAdmin: !currentAdminStatus } : user));
            setSuccess(`Rôle ${!currentAdminStatus ? 'admin accordé' : 'admin retiré'} avec succès`);
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            setError('Erreur lors de la modification du rôle');
            console.error('Erreur:', err);
        }
    };

    const handleLevelInput = (userId: string, value: number) => {
        setLevelInput(prev => ({ ...prev, [userId]: value }));
    };

    const handleUpdateLevel = async (authID: string, newLevel: number) => {
        setLevelLoading(authID);
        try {
            const userRef = doc(db, 'users', authID);
            await updateDoc(userRef, { level: newLevel });
            setUsers(users.map(user => user.authID === authID ? { ...user, level: newLevel } : user));
            setSuccess('Niveau mis à jour !');
            setTimeout(() => setSuccess(null), 2000);
        } catch (err) {
            setError('Erreur lors de la mise à jour du niveau');
            console.error('Erreur:', err);
        } finally {
            setLevelLoading(null);
        }
    };

    const openLessonsModal = async (user: UserData) => {
        setModalUser(user);
        setModalLoading(true);
        // Récupérer les leçons complétées à jour
        const userRef = doc(db, 'users', user.authID);
        const userSnap = await getDoc(userRef);
        let completedLessons: string[] = [];
        if (userSnap.exists()) {
            const data = userSnap.data();
            completedLessons = Array.isArray(data.completedLessons) ? data.completedLessons : [];
        }
        setModalLessons(completedLessons);
        setModalLoading(false);
    };

    const closeLessonsModal = () => {
        setModalUser(null);
        setModalLessons([]);
    };

    const handleCompleteLesson = async (userId: string, lessonId: string) => {
        setModalLoading(true);
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);
        let completedLessons: string[] = [];
        if (userSnap.exists()) {
            const data = userSnap.data();
            completedLessons = Array.isArray(data.completedLessons) ? data.completedLessons : [];
        }
        if (!completedLessons.includes(lessonId)) {
            completedLessons.push(lessonId);
            await setDoc(userRef, { completedLessons }, { merge: true });
            setModalLessons(completedLessons);
            setSuccess('Leçon marquée comme complétée !');
            setTimeout(() => setSuccess(null), 2000);
        }
        setModalLoading(false);
    };

    const handleUncompleteLesson = async (userId: string, lessonId: string) => {
        setModalLoading(true);
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);
        let completedLessons: string[] = [];
        if (userSnap.exists()) {
            const data = userSnap.data();
            completedLessons = Array.isArray(data.completedLessons) ? data.completedLessons : [];
        }
        if (completedLessons.includes(lessonId)) {
            completedLessons = completedLessons.filter(id => id !== lessonId);
            await setDoc(userRef, { completedLessons }, { merge: true });
            setModalLessons(completedLessons);
            setSuccess('Leçon retirée des complétées.');
            setTimeout(() => setSuccess(null), 2000);
        }
        setModalLoading(false);
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
                <h1>Gestion des Utilisateurs</h1>
                <div className={styles.searchContainer}>
                    <Search className={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="Rechercher un utilisateur..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={styles.searchInput}
                    />
                </div>
            </div>
            {success && <div className={styles.success}>{success}</div>}
            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Utilisateur</th>
                            <th>Email</th>
                            <th>ID Auth</th>
                            <th>Rôle</th>
                            <th>Niveau</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map((user) => (
                            <tr key={user.authID}>
                                <td>
                                    <div className={styles.userInfo}>
                                        <User className={styles.userIcon} />
                                        <span>{user.username}</span>
                                    </div>
                                </td>
                                <td>{user.email}</td>
                                <td className={styles.authId}>{user.authID}</td>
                                <td>
                                    <div className={styles.roleContainer}>
                                        <span className={`${styles.roleBadge} ${user.isAdmin ? styles.adminRole : styles.userRole}`}>
                                            {user.isAdmin ? "Admin" : "Utilisateur"}
                                        </span>
                                        <button
                                            onClick={() => handleToggleAdminRole(user.authID, user.isAdmin || false)}
                                            className={styles.roleToggleButton}
                                            title={user.isAdmin ? "Retirer les droits admin" : "Accorder les droits admin"}
                                        >
                                            <Shield size={16} />
                                            {user.isAdmin ? <X size={12} /> : <Check size={12} />}
                                        </button>
                                    </div>
                                </td>
                                <td>
                                    <input
                                        type="number"
                                        min={1}
                                        value={levelInput[user.authID] ?? user.level ?? 1}
                                        onChange={e => handleLevelInput(user.authID, Number(e.target.value))}
                                        className={styles.numberInput}
                                    />
                                    <button
                                        className={styles.validateLevelButton}
                                        onClick={() => handleUpdateLevel(user.authID, levelInput[user.authID] ?? user.level ?? 1)}
                                        disabled={levelLoading === user.authID}
                                        title="Valider le niveau"
                                    >
                                        {levelLoading === user.authID ? '...' : 'Valider'}
                                    </button>
                                </td>
                                <td>
                                    <button
                                        onClick={() => handleDeleteUser(user.authID)}
                                        className={styles.deleteButton}
                                        title="Supprimer l'utilisateur"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                    <button
                                        onClick={() => openLessonsModal(user)}
                                        className={styles.manageLessonsButton}
                                        title="Gérer les leçons complétées"
                                    >
                                        <BookOpen size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {/* Modale de gestion des leçons */}
            {modalUser && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <div className={styles.modalHeader}>
                            <h3>Leçons de {modalUser.username}</h3>
                            <button className={styles.closeModalButton} onClick={closeLessonsModal}>&times;</button>
                        </div>
                        {modalLoading ? (
                            <div className={styles.loading}>Chargement...</div>
                        ) : (
                            <ul className={styles.lessonsListModal}>
                                {lessons.map(lesson => {
                                    const isCompleted = modalLessons.includes(lesson.id);
                                    return (
                                        <li key={lesson.id} className={styles.lessonRowModal}>
                                            <span>{lesson.title}</span>
                                            {isCompleted ? (
                                                <button
                                                    className={styles.uncompleteBtn}
                                                    onClick={() => handleUncompleteLesson(modalUser.authID, lesson.id)}
                                                >
                                                    Décompléter
                                                </button>
                                            ) : (
                                                <button
                                                    className={styles.completeBtn}
                                                    onClick={() => handleCompleteLesson(modalUser.authID, lesson.id)}
                                                >
                                                    Compléter
                                                </button>
                                            )}
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;