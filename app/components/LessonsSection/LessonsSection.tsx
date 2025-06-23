"use client";

import { Code, Network, Users, BookOpen, Shield, Lock, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import styles from './LessonsSection.module.css';
import { JSX } from "react";

interface Lesson {
    id: string;
    title: string;
    description: string;
    icon: JSX.Element;
    color: string;
    content?: string;
}

const lessons: Lesson[] = [
    {
        id: 'securite-base',
        title: 'Sécurité de Base',
        description: 'Apprenez les fondamentaux de la cybersécurité',
        icon: <Shield size={24} />,
        color: '#0AFFD4',
        content: 'securite-base'
    },
    {
        id: 'protection-donnees',
        title: 'Protection des Données',
        description: 'Protégez vos données personnelles et professionnelles',
        icon: <Lock size={24} />,
        color: '#0024FF',
        content: 'protection-donnees'
    },
    {
        id: 'apprentissage',
        title: 'Apprentissage',
        description: 'Découvrez les meilleures pratiques de sécurité',
        icon: <BookOpen size={24} />,
        color: '#FF6B6B',
        content: 'apprentissage'
    },
    {
        id: 'communaute',
        title: 'Communauté',
        description: 'Rejoignez une communauté de passionnés',
        icon: <Users size={24} />,
        color: '#4CAF50',
        content: 'communaute'
    }
];

const LessonsSection = () => {
    return (
        <section id="section-title" className={styles.section}>
            <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>
                    Nos Leçons
                </h2>
                <p className={styles.sectionDescription}>
                    Découvrez notre catalogue complet de leçons pour développer vos compétences en cybersécurité.
                </p>
            </div>
            <div className={styles.cardContainer}>
                {lessons.map((lesson, index) => (
                    <div key={index} className={styles.card}>
                        <div className={styles.cardHeader}>
                            <div className={styles.etiquette} style={{ backgroundColor: `${lesson.color}20`, borderColor: lesson.color }}>
                                {lesson.icon}
                                {lesson.title}
                            </div>
                            <h3 className={styles.cardTitle}>{lesson.title}</h3>
                        </div>
                        <p className={styles.cardText}>
                            {lesson.description}
                        </p>
                        <div className={styles.cardFooter}>
                            <Link
                                href={`/lessons`}
                                className={styles.cardLink}
                            >
                                <span>Commencer</span>
                                <ArrowRight size={16} />
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default LessonsSection;