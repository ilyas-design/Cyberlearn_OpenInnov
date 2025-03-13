"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/app/firebase/config";
import { doc, getDoc } from "firebase/firestore";
import styles from "./profile.module.css";
import { User, BookOpen, Award, Settings, Clock, ArrowLeft } from "lucide-react";

interface UserData {
    username?: string;
    email?: string;
    createdAt?: string;
    // Ajoutez d'autres champs selon votre schéma Firestore
}

export default function ProfilePage() {
    const [user, setUser] = useState<any>(null);
    const [userData, setUserData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("info");
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);

                // Récupérer les données utilisateur depuis Firestore
                try {
                    const userDocRef = doc(db, "users", currentUser.uid);
                    const userDoc = await getDoc(userDocRef);

                    if (userDoc.exists()) {
                        setUserData(userDoc.data() as UserData);
                    } else {
                        console.log("Aucun document utilisateur trouvé dans Firestore");
                    }
                } catch (error) {
                    console.error("Erreur lors de la récupération des données utilisateur:", error);
                }
            } else {
                router.push("/login");
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [router]);

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.loadingSpinner}></div>
                <p>Chargement de votre profil...</p>
            </div>
        );
    }

    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
    };

    const goBack = () => {
        router.back();
    };

    return (
        <div className={styles.profileContainer}>
            <div className={styles.profileHeader}>
                <button className={styles.backButton} onClick={goBack}>
                    <ArrowLeft size={20} />
                    <span>Retour</span>
                </button>
                <h1 className={styles.profileTitle}>Mon Profil</h1>
            </div>

            <div className={styles.profileContent}>
                <div className={styles.sidebar}>
                    <div className={styles.userInfo}>
                        <div className={styles.avatarLarge}>
                            <User size={40} />
                        </div>
                        <div className={styles.userDetails}>
                            <h2 className={styles.userName}>{userData?.username || user?.displayName || "Utilisateur"}</h2>
                            <p className={styles.userEmail}>{user?.email}</p>
                        </div>
                    </div>

                    <div className={styles.tabMenu}>
                        <button
                            className={`${styles.tabButton} ${activeTab === "info" ? styles.active : ""}`}
                            onClick={() => handleTabChange("info")}
                        >
                            <User size={18} />
                            <span>Informations</span>
                        </button>
                        <button
                            className={`${styles.tabButton} ${activeTab === "courses" ? styles.active : ""}`}
                            onClick={() => handleTabChange("courses")}
                        >
                            <BookOpen size={18} />
                            <span>Mes cours</span>
                        </button>
                        <button
                            className={`${styles.tabButton} ${activeTab === "achievements" ? styles.active : ""}`}
                            onClick={() => handleTabChange("achievements")}
                        >
                            <Award size={18} />
                            <span>Réalisations</span>
                        </button>
                        <button
                            className={`${styles.tabButton} ${activeTab === "settings" ? styles.active : ""}`}
                            onClick={() => handleTabChange("settings")}
                        >
                            <Settings size={18} />
                            <span>Paramètres</span>
                        </button>
                    </div>
                </div>

                <div className={styles.mainContent}>
                    {activeTab === "info" && (
                        <div className={styles.tabContent}>
                            <h2 className={styles.sectionTitle}>Informations personnelles</h2>
                            <div className={styles.infoCard}>
                                <div className={styles.infoRow}>
                                    <span className={styles.infoLabel}>Nom d'utilisateur</span>
                                    <span className={styles.infoValue}>{userData?.username || user?.displayName || "Non défini"}</span>
                                </div>
                                <div className={styles.infoRow}>
                                    <span className={styles.infoLabel}>Email</span>
                                    <span className={styles.infoValue}>{user?.email}</span>
                                </div>
                                <div className={styles.infoRow}>
                                    <span className={styles.infoLabel}>Date d'inscription</span>
                                    <span className={styles.infoValue}>
                                        {userData?.createdAt
                                            ? new Date(userData.createdAt).toLocaleDateString('fr-FR')
                                            : user?.metadata?.creationTime
                                                ? new Date(user.metadata.creationTime).toLocaleDateString('fr-FR')
                                                : "Non disponible"}
                                    </span>
                                </div>
                                <div className={styles.infoRow}>
                                    <span className={styles.infoLabel}>Dernière connexion</span>
                                    <span className={styles.infoValue}>
                                        {user?.metadata?.lastSignInTime
                                            ? new Date(user.metadata.lastSignInTime).toLocaleDateString('fr-FR')
                                            : "Non disponible"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "courses" && (
                        <div className={styles.tabContent}>
                            <h2 className={styles.sectionTitle}>Mes cours</h2>
                            <div className={styles.coursesList}>
                                <div className={styles.emptyState}>
                                    <BookOpen size={48} />
                                    <p>Vous n'avez pas encore commencé de cours</p>
                                    <button className={styles.actionButton} onClick={() => router.push('/courses')}>
                                        Découvrir les cours
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "achievements" && (
                        <div className={styles.tabContent}>
                            <h2 className={styles.sectionTitle}>Mes réalisations</h2>
                            <div className={styles.achievementsList}>
                                <div className={styles.emptyState}>
                                    <Award size={48} />
                                    <p>Vous n'avez pas encore de réalisations</p>
                                    <p className={styles.subText}>Complétez des cours pour gagner des badges</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "settings" && (
                        <div className={styles.tabContent}>
                            <h2 className={styles.sectionTitle}>Paramètres</h2>
                            <div className={styles.settingsCard}>
                                <h3 className={styles.settingsSubtitle}>Compte</h3>
                                <div className={styles.settingsGroup}>
                                    <button className={styles.settingsButton}>
                                        Modifier mon profil
                                    </button>
                                    <button className={styles.settingsButton}>
                                        Changer mon mot de passe
                                    </button>
                                </div>

                                <h3 className={styles.settingsSubtitle}>Préférences</h3>
                                <div className={styles.settingsGroup}>
                                    <div className={styles.settingsToggle}>
                                        <span>Notifications par email</span>
                                        <label className={styles.switch}>
                                            <input type="checkbox" />
                                            <span className={styles.slider}></span>
                                        </label>
                                    </div>
                                </div>

                                <h3 className={styles.settingsSubtitle}>Danger</h3>
                                <div className={styles.settingsGroup}>
                                    <button className={styles.dangerButton}>
                                        Supprimer mon compte
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
} 