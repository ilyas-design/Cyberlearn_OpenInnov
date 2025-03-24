"use client";

import React, { useState, useEffect } from "react";
import styles from "./lessons.module.css";
import { Lock } from 'lucide-react';
import Link from 'next/link';
import { getAllLessons, getLessonsByCategory, Lesson } from "../firebase/lessons";
import { getIconByName } from "../utils/iconMapping";

export default function LessonsPage() {
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [filteredLessons, setFilteredLessons] = useState<Lesson[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [activeCategory, setActiveCategory] = useState<string>("Tous");
    const [categories, setCategories] = useState<string[]>([]);

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

    // Filtrer les leçons par catégorie
    const filterByCategory = (category: string) => {
        setActiveCategory(category);
        if (!lessons || lessons.length === 0) return;

        if (category === "Tous") {
            setFilteredLessons(lessons);
        } else {
            const filteredData = lessons.filter(lesson => lesson.category === category);
            setFilteredLessons(filteredData);
        }
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
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Nos Leçons</h1>
                <p className={styles.subtitle}>
                    Explorez notre catalogue de leçons pour développer vos compétences en cybersécurité et technologies connexes.
                </p>
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
                    {filteredLessons.map((lesson) => (
                        <div key={lesson.id} className={`${styles.lessonCard} ${lesson.locked ? styles.locked : ''}`}>
                            <div className={styles.cardHeader}>
                                <div className={styles.categoryTag}>
                                    {lesson.iconName && getIconByName(lesson.iconName)}
                                    <span>{lesson.category}</span>
                                </div>
                                {lesson.locked && (
                                    <div className={styles.lockedBadge}>
                                        <Lock size={16} />
                                    </div>
                                )}
                            </div>
                            <h3 className={styles.lessonTitle}>{lesson.title}</h3>
                            <p className={styles.lessonDescription}>{lesson.description}</p>
                            <div className={styles.tagsContainer}>
                                {lesson.tags && lesson.tags.map((tag) => (
                                    <span key={tag} className={styles.tag}>{tag}</span>
                                ))}
                            </div>
                            <div className={styles.cardFooter}>
                                {lesson.locked ? (
                                    <button className={styles.lockedButton}>
                                        <Lock size={16} />
                                        Débloquer
                                    </button>
                                ) : (
                                    <Link href={`/lessons/${lesson.id}`} className={styles.startButton}>
                                        Commencer
                                    </Link>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className={styles.noLessonsContainer}>
                    <p>Aucune leçon trouvée pour cette catégorie.</p>
                </div>
            )}
        </div>
    );
} 