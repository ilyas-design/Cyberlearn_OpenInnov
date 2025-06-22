'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/app/firebase/config';
import { User, Trash2, Search, Edit, Shield, Check, X } from 'lucide-react';
import styles from './UserManagement.module.css';

interface UserData {
    authID: string;
    email: string;
    username: string;
    isAdmin?: boolean;
}

const UserManagement = () => {
    const [users, setUsers] = useState<UserData[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const usersCollection = collection(db, 'users');
            const usersSnapshot = await getDocs(usersCollection);
            const usersData = usersSnapshot.docs.map(doc => ({
                ...doc.data(),
                authID: doc.id,
                isAdmin: doc.data().isAdmin || false
            })) as UserData[];
            setUsers(usersData);
        } catch (err) {
            setError('Erreur lors du chargement des utilisateurs');
            console.error('Erreur:', err);
        } finally {
            setLoading(false);
        }
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
            await updateDoc(userRef, {
                isAdmin: !currentAdminStatus
            });
            
            // Mettre à jour l'état local
            setUsers(users.map(user => 
                user.authID === authID 
                    ? { ...user, isAdmin: !currentAdminStatus } 
                    : user
            ));
            
            setSuccess(`Rôle ${!currentAdminStatus ? 'admin accordé' : 'admin retiré'} avec succès`);
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            setError('Erreur lors de la modification du rôle');
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
                                            <Shield size={18} />
                                            {user.isAdmin ? <X size={14} /> : <Check size={14} />}
                                        </button>
                                    </div>
                                </td>
                                <td>
                                    <button
                                        onClick={() => handleDeleteUser(user.authID)}
                                        className={styles.deleteButton}
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UserManagement;