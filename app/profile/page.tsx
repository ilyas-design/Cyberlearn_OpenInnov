"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/app/firebase/config";
import { doc, getDoc, setDoc } from "firebase/firestore";
import styles from "./profile.module.css";
import { User, BookOpen, Award, Settings, Clock, ArrowLeft } from "lucide-react";
import { getAllLessons, Lesson } from "@/app/firebase/lessons";

interface UserData {
    username?: string;
    email?: string;
    createdAt?: string;
    level?: number;
    exp?: number;
    completedLessons?: string[];
    startedLessons?: string[];
    // Ajoutez d'autres champs selon votre schéma Firestore
}

export default function ProfilePage() {
    const [user, setUser] = useState<any>(null);
    const [userData, setUserData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("info");
    const router = useRouter();
    const [startedLessonsList, setStartedLessonsList] = useState<Lesson[]>([]);
    const [completedLessonsList, setCompletedLessonsList] = useState<Lesson[]>([]);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                // Récupérer les données utilisateur depuis Firestore
                try {
                    const userDocRef = doc(db, "users", currentUser.uid);
                    const userDoc = await getDoc(userDocRef);
                    let userData: UserData = {};
                    if (userDoc.exists()) {
                        userData = userDoc.data() as UserData;
                    }
                    // Création automatique des champs si absents
                    let updateNeeded = false;
                    const updatePayload: any = {};
                    if (typeof userData.level !== 'number') {
                        updatePayload.level = 1;
                        updateNeeded = true;
                    }
                    if (typeof userData.exp !== 'number') {
                        updatePayload.exp = 0;
                        updateNeeded = true;
                    }
                    if (!Array.isArray(userData.completedLessons)) {
                        updatePayload.completedLessons = [];
                        updateNeeded = true;
                    }
                    if (!Array.isArray(userData.startedLessons)) {
                        updatePayload.startedLessons = [];
                        updateNeeded = true;
                    }
                    if (updateNeeded) {
                        await setDoc(userDocRef, updatePayload, { merge: true });
                    }
                    setUserData({ ...userData, ...updatePayload });
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

    useEffect(() => {
        // Charger les leçons commencées mais pas finies
        const fetchStartedLessons = async () => {
            if (userData?.startedLessons && Array.isArray(userData.startedLessons)) {
                const allLessons = await getAllLessons();
                const completed = userData.completedLessons || [];
                const started = userData.startedLessons.filter((id: string) => !completed.includes(id));
                const startedLessons = allLessons.filter(lesson => started.includes(lesson.id));
                setStartedLessonsList(startedLessons);
            } else {
                setStartedLessonsList([]);
            }
        };
        fetchStartedLessons();
    }, [userData]);

    useEffect(() => {
        // Charger les leçons terminées
        const fetchCompletedLessons = async () => {
            if (userData?.completedLessons && Array.isArray(userData.completedLessons)) {
                const allLessons = await getAllLessons();
                const completed = userData.completedLessons;
                const completedLessons = allLessons.filter(lesson => completed.includes(lesson.id));
                setCompletedLessonsList(completedLessons);
            } else {
                setCompletedLessonsList([]);
            }
        };
        fetchCompletedLessons();
    }, [userData]);

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

    // Fonction pour calculer l'XP requise pour le prochain niveau
    const xpForLevel = (lvl: number) => 100 + (lvl - 1) * 20;

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
                            <span className={styles.levelBadge}>Niveau {userData?.level ?? 1}</span>
                            <div className={styles.expBarContainer}>
                                <div className={styles.expBarBg}>
                                    <div
                                        className={styles.expBarFill}
                                        style={{ width: `${Math.min(100, Math.round(((userData?.exp ?? 0) / xpForLevel(userData?.level ?? 1)) * 100))}%` }}
                                    ></div>
                                </div>
                                <span className={styles.expText}>{userData?.exp ?? 0} / {xpForLevel(userData?.level ?? 1)} XP</span>
                            </div>
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
                                {startedLessonsList.length === 0 ? (
                                    <div className={styles.emptyState}>
                                        <BookOpen size={48} />
                                        <p>Vous n'avez pas encore commencé de cours</p>
                                        <button className={styles.actionButton} onClick={() => router.push('/courses')}>
                                            Découvrir les cours
                                        </button>
                                    </div>
                                ) : (
                                    startedLessonsList.map((lesson) => (
                                        <div key={lesson.id} className={styles.startedLessonCard}>
                                            <div className={styles.lessonIcon}>{lesson.iconName && <span>{lesson.iconName}</span>}</div>
                                            <div className={styles.lessonInfo}>
                                                <h3>{lesson.title}</h3>
                                                <p>{lesson.description}</p>
                                            </div>
                                            <button className={styles.continueButton} onClick={() => router.push(`/lessons/${lesson.id}`)}>
                                                Continuer
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === "achievements" && (
                        <div className={styles.tabContent}>
                            <h2 className={styles.sectionTitle}>Mes réalisations</h2>
                            <div className={styles.achievementsList}>
                                {completedLessonsList.length === 0 ? (
                                    <div className={styles.emptyState}>
                                        <Award size={48} />
                                        <p>Vous n'avez pas encore de réalisations</p>
                                        <p className={styles.subText}>Complétez des cours pour gagner des badges</p>
                                    </div>
                                ) : (
                                    completedLessonsList.map((lesson) => (
                                        <div key={lesson.id} className={styles.completedLessonCard}>
                                            <div className={styles.medalBadge}>🏅</div>
                                            <h3 className={styles.completedTitle}>{lesson.title}</h3>
                                            <span className={styles.completedText}>Terminé !</span>
                                        </div>
                                    ))
                                )}
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