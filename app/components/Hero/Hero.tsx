'use client'

import dynamic from 'next/dynamic';
import { useTypewriter } from 'react-simple-typewriter';
import { ChevronDown, Shield, Lock, BookOpen, Users } from 'lucide-react';
import styles from './Hero.module.css';
import Image from 'next/image';
import whiteLogo from '@/public/Images/White_log.png';
import React from "react";
import { useLanguage } from '@/app/context/LanguageContext';

const CyberBackground = dynamic(
    () => import('@/app/components/CyberBackground/CyberBackground'),
    { ssr: false }
);

const Hero: React.FC = () => {
    const { t } = useLanguage();

    const [text] = useTypewriter({
        words: [
            t('hero.tagline1'),
            t('hero.tagline2')
        ],
        loop: true,
        typeSpeed: 50,
        deleteSpeed: 10,
        delaySpeed: 1500
    });

    const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        const section = document.getElementById('section-title');
        section?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className={styles.hero}>
            <CyberBackground />
            <div className={styles.heroBackground} />
            <div className={styles.accroche}>
                <div className={styles.textEntete}>
                    <h1 className={`${styles.entete} ${styles.animateItem}`}>{text || t('hero.tagline1')}</h1>
                    <p className={`${styles.subtitle} ${styles.animateItem}`}>
                        {t('hero.subtitle')}
                    </p>
                    <div className={styles.features}>
                        <div className={`${styles.feature} ${styles.animateItem}`}>
                            <Shield size={24} />
                            <span>{t('hero.features.security')}</span>
                        </div>
                        <div className={`${styles.feature} ${styles.animateItem}`}>
                            <Lock size={24} />
                            <span>{t('hero.features.protection')}</span>
                        </div>
                        <div className={`${styles.feature} ${styles.animateItem}`}>
                            <BookOpen size={24} />
                            <span>{t('hero.features.learning')}</span>
                        </div>
                        <div className={`${styles.feature} ${styles.animateItem}`}>
                            <Users size={24} />
                            <span>{t('hero.features.community')}</span>
                        </div>
                    </div>
                    <a
                        href="#section-title"
                        className={`${styles.more} ${styles.animateItem}`}
                        onClick={scrollToSection}
                    >
                        <span>
                            {t('hero.discoverLessons')}
                            <ChevronDown size={20} className={styles.chevronBounce} />
                        </span>
                    </a>
                </div>
                <div className={`${styles.logoContainer} ${styles.animateItem}`}>
                    <div className={styles.logoWrapper}>
                        <Image
                            src={whiteLogo}
                            alt="Logo Blanc cyberLearn"
                            className={styles.logoEntete}
                            width={450}
                            height={450}
                            priority
                        />
                        <div className={styles.glowEffect} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Hero;