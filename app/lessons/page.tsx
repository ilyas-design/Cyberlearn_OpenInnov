"use client";

import React, { useState, useEffect } from "react";
import styles from "./lessons.module.css";
import { Lock } from 'lucide-react';
import Link from 'next/link';
import { getAllLessons, getLessonsByCategory, Lesson } from "../firebase/lessons";
import { getIconByName } from "../utils/iconMapping";
import { useAuth } from '../context/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import SearchBar from '../components/SearchBar/SearchBar';
import FavoriteButton from '../components/FavoriteButton/FavoriteButton';
import Page3DShell from '@/app/components/CyberBackground/Page3DShell';

export default function LessonsPage() {
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [filteredLessons, setFilteredLessons] = useState<Lesson[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [activeCategory, setActiveCategory] = useState<string>("Tous");
    const [categories, setCategories] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const { user } = useAuth();
    const [completedLessons, setCompletedLessons] = useState<string[]>([]);

    // Recharger les completedLessons utilisateur à chaque affichage
    useEffect(() => {
        const fetchCompletedLessons = async () => {
            if (user && user.uid) {
                const userRef = doc(db, 'users', user.uid);
                const userSnap = await getDoc(userRef);
                if (userSnap.exists()) {
                    const data = userSnap.data();
                    setCompletedLessons(Array.isArray(data.completedLessons) ? data.completedLessons : []);
                } else {
                    setCompletedLessons([]);
                }
            } else {
                setCompletedLessons([]);
            }
        };
        fetchCompletedLessons();
    }, [user]);

    // Charger les leçons depuis Firebase
    useEffect(() => {
        const fetchLessons = async () => {
            try {
                setLoading(true);
                setError(null);
                const lessonsData = await getAllLessons();

                if (!lessonsData || lessonsData.length === 0) {
                    setLessons([]);
                    setFilteredLessons([]);
                    setCategories([]);
                    setError("Aucune leçon disponible pour le moment.");
                } else {
                    setLessons(lessonsData);
                    setFilteredLessons(lessonsData);

                    // Extraire les catégories uniques
                    const uniqueCategories = Array.from(
                        new Set(lessonsData.map(lesson => lesson.category))
                    ).filter(Boolean); // Filtrer les valeurs null/undefined/empty
                    setCategories(uniqueCategories);
                }
            } catch (err) {
                console.error("Erreur lors du chargement des leçons:", err);
                setError("Impossible de charger les leçons. Veuillez réessayer plus tard.");
                setLessons([]);
                setFilteredLessons([]);
                setCategories([]);
            } finally {
                setLoading(false);
            }
        };

        fetchLessons();
    }, []);

    // Filtrer les leçons par catégorie et recherche
    const filterLessons = () => {
        if (!lessons || lessons.length === 0) return;

        let filtered = lessons;

        // Filtre par catégorie
        if (activeCategory !== "Tous") {
            filtered = filtered.filter(lesson => lesson.category === activeCategory);
        }

        // Filtre par recherche
        if (searchQuery.trim() !== "") {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(lesson =>
                lesson.title.toLowerCase().includes(query) ||
                lesson.description.toLowerCase().includes(query) ||
                lesson.category.toLowerCase().includes(query) ||
                (lesson.tags && lesson.tags.some(tag => tag.toLowerCase().includes(query)))
            );
        }

        setFilteredLessons(filtered);
    };

    // Effet pour appliquer les filtres
    useEffect(() => {
        filterLessons();
        // eslint-disable-next-line
    }, [activeCategory, searchQuery, lessons]);

    // Filtrer les leçons par catégorie
    const filterByCategory = (category: string) => {
        setActiveCategory(category);
    };

    // Gérer la recherche
    const handleSearch = (query: string) => {
        setSearchQuery(query);
    };

    // Recharger les leçons
    const handleRetry = () => {
        const fetchLessons = async () => {
            try {
                setLoading(true);
                setError(null);
                const lessonsData = await getAllLessons();
                setLessons(lessonsData);
                setFilteredLessons(lessonsData);

                const uniqueCategories = Array.from(
                    new Set(lessonsData.map(lesson => lesson.category))
                ).filter(Boolean);
                setCategories(uniqueCategories);
            } catch (err) {
                console.error("Erreur lors du rechargement des leçons:", err);
                setError("Impossible de charger les leçons. Veuillez réessayer plus tard.");
            } finally {
                setLoading(false);
            }
        };

        fetchLessons();
    };

    return (
        <Page3DShell variant="network">
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Nos Leçons</h1>
                <p className={styles.subtitle}>
                    Explorez notre catalogue de leçons pour développer vos compétences en cybersécurité et technologies connexes.
                </p>

                {/* Barre de recherche */}
                {!loading && !error && (
                    <div className={styles.searchContainer}>
                        <SearchBar
                            onSearch={handleSearch}
                            placeholder="Rechercher une leçon, catégorie ou tag..."
                        />
                    </div>
                )}
            </div>

            {!loading && !error && categories.length > 0 && (
                <div className={styles.filters}>
                    <button
                        className={`${styles.filterButton} ${activeCategory === "Tous" ? styles.active : ""}`}
                        onClick={() => filterByCategory("Tous")}
                    >
                        Tous
                    </button>
                    {categories.map((category) => (
                        <button
                            key={category}
                            className={`${styles.filterButton} ${activeCategory === category ? styles.active : ""}`}
                            onClick={() => filterByCategory(category)}
                        >
                            {category}
                        </button>
                    ))}
                </div>
            )}

            {loading ? (
                <div className={styles.loadingContainer}>
                    <div className={styles.loadingSpinner}></div>
                    <p>Chargement des leçons...</p>
                </div>
            ) : error ? (
                <div className={styles.errorContainer}>
                    <p className={styles.errorMessage}>{error}</p>
                    <button
                        className={styles.retryButton}
                        onClick={handleRetry}
                    >
                        Réessayer
                    </button>
                </div>
            ) : filteredLessons.length > 0 ? (
                <div className={styles.lessonsGrid}>
                    {filteredLessons.map((lesson) => {
                        const isLocked = lesson.locked || (user && user.level < lesson.levelRequired);
                        const isCompleted = completedLessons.includes(lesson.id);
                        return (
                            <div key={lesson.id} className={`${styles.lessonCard} ${isLocked ? styles.locked : ''} ${isCompleted ? styles.completed : ''}`}>
                                <div className={styles.cardHeader}>
                                    <div className={styles.categoryTag}>
                                        {lesson.iconName && getIconByName(lesson.iconName)}
                                        <span>{lesson.category}</span>
                                    </div>
                                    <div className={styles.cardBadges}>
                                        {isCompleted && (
                                            <div className={styles.completedBadge}>
                                                <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="10" fill="#10b981" /><path d="M6 10.5L9 13.5L14 8.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                                <span>Complétée</span>
                                            </div>
                                        )}
                                        {lesson.locked && (
                                            <div className={styles.lockedBadge}>
                                                <Lock size={16} />
                                            </div>
                                        )}
                                        {!isLocked && <FavoriteButton lessonId={lesson.id} />}
                                    </div>
                                </div>
                                <h3 className={styles.lessonTitle}>{lesson.title}</h3>
                                <p className={styles.lessonDescription}>{lesson.description}</p>
                                <div className={styles.tagsContainer}>
                                    {lesson.tags && lesson.tags.map((tag) => (
                                        <span key={tag} className={styles.tag}>{tag}</span>
                                    ))}
                                </div>
                                <div className={styles.cardFooter}>
                                    {isLocked ? (
                                        <button className={styles.lockedButton} disabled>
                                            <Lock size={16} />
                                            Niveau requis : {lesson.levelRequired}
                                        </button>
                                    ) : (
                                        <Link href={`/lessons/${lesson.id}`} className={styles.startButton}>
                                            Commencer
                                        </Link>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className={styles.noLessonsContainer}>
                    <p>Aucune leçon trouvée pour cette catégorie.</p>
                </div>
            )}
        </div>
        </Page3DShell>
    );
}

