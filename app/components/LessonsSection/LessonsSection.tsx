"use client";

import { Shield, Lock, Globe, AlertTriangle, Key, Terminal, ArrowRight, Server, Network, Code, Cpu } from 'lucide-react';
import Link from 'next/link';
import styles from './LessonsSection.module.css';
import AnimateIn from '@/app/components/AnimateIn/AnimateIn';
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
        id: 'cyber-basics',
        title: 'Fondamentaux Cybersécurité',
        description: 'Triade CIA, menaces courantes et hygiène numérique',
        icon: <Lock size={24} />,
        color: '#0AFFD4',
        content: 'cyber-basics'
    },
    {
        id: 'data-protection',
        title: 'Protection des Données',
        description: 'RGPD, chiffrement et stratégie de sauvegarde',
        icon: <Shield size={24} />,
        color: '#0024FF',
        content: 'data-protection'
    },
    {
        id: 'web-security',
        title: 'Sécurité Web',
        description: 'OWASP, XSS, injection SQL et sessions sécurisées',
        icon: <Globe size={24} />,
        color: '#FF6B6B',
        content: 'web-security'
    },
    {
        id: 'phishing-social',
        title: 'Phishing',
        description: 'Reconnaître et signaler les arnaques en ligne',
        icon: <AlertTriangle size={24} />,
        color: '#FFB347',
        content: 'phishing-social'
    },
    {
        id: 'password-auth',
        title: 'Mots de passe & MFA',
        description: 'Gestionnaires de mots de passe et authentification forte',
        icon: <Key size={24} />,
        color: '#9B59B6',
        content: 'password-auth'
    },
    {
        id: 'malware-basics',
        title: 'Malware & Ransomware',
        description: 'Types de malware et conduite à tenir en cas d\'infection',
        icon: <Terminal size={24} />,
        color: '#E74C3C',
        content: 'malware-basics'
    },
    {
        id: 'network-security',
        title: 'Sécurité Réseau',
        description: 'Pare-feu, segmentation, VPN et détection d\'intrusion',
        icon: <Server size={24} />,
        color: '#1ABC9C',
        content: 'network-security'
    },
    {
        id: 'cloud-security',
        title: 'Sécurité Cloud',
        description: 'IAM, responsabilité partagée et bonnes pratiques cloud',
        icon: <Network size={24} />,
        color: '#3498DB',
        content: 'cloud-security'
    },
    {
        id: 'secure-dev',
        title: 'Développement Sécurisé',
        description: 'DevSecOps, SAST/DAST et sécurité dans le cycle de dev',
        icon: <Code size={24} />,
        color: '#2ECC71',
        content: 'secure-dev'
    },
    {
        id: 'zero-trust',
        title: 'Architecture Zero Trust',
        description: 'Ne jamais faire confiance, toujours vérifier',
        icon: <Cpu size={24} />,
        color: '#E67E22',
        content: 'zero-trust'
    }
];

const LessonsSection = () => {
    return (
        <section id="section-title" className={styles.section}>
            <AnimateIn animation="fade-up">
                <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>
                        Nos Leçons
                    </h2>
                    <p className={styles.sectionDescription}>
                        Découvrez notre catalogue complet de leçons pour développer vos compétences en cybersécurité.
                    </p>
                </div>
            </AnimateIn>
            <div className={styles.cardContainer}>
                {lessons.map((lesson, index) => (
                    <AnimateIn key={lesson.id} animation="fade-up" delay={index * 80}>
                    <div className={styles.card}>
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
                                href={`/lessons/${lesson.id}`}
                                className={styles.cardLink}
                            >
                                <span>Commencer</span>
                                <ArrowRight size={16} />
                            </Link>
                        </div>
                    </div>
                    </AnimateIn>
                ))}
            </div>
            <AnimateIn animation="fade-up" delay={lessons.length * 80}>
                <div className={styles.viewAllContainer}>
                    <Link href="/lessons" className={styles.viewAllLink}>
                        <span>Voir toutes les leçons</span>
                        <ArrowRight size={18} />
                    </Link>
                </div>
            </AnimateIn>
        </section>
    );
};

export default LessonsSection;