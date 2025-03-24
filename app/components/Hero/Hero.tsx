'use client'

import { useTypewriter } from 'react-simple-typewriter';
import { ChevronDown, Shield, Lock, BookOpen, Users } from 'lucide-react';
import styles from './Hero.module.css';
import Image from 'next/image';
import whiteLogo from '@/public/Images/White_log.png';
import React from "react";
import { useLanguage } from '@/app/context/LanguageContext';

const Hero: React.FC = () => {
    const { t, locale } = useLanguage();
    
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
            <div className={styles.heroBackground} />
            <div className={styles.accroche}>
                <div className={styles.textEntete}>
                    <h1 className={styles.entete}>{text}</h1>
                    <p className={styles.subtitle}>
                        {t('hero.subtitle')}
                    </p>
                    <div className={styles.features}>
                        <div className={styles.feature}>
                            <Shield size={24} />
                            <span>{t('hero.features.security')}</span>
                        </div>
                        <div className={styles.feature}>
                            <Lock size={24} />
                            <span>{t('hero.features.protection')}</span>
                        </div>
                        <div className={styles.feature}>
                            <BookOpen size={24} />
                            <span>{t('hero.features.learning')}</span>
                        </div>
                        <div className={styles.feature}>
                            <Users size={24} />
                            <span>{t('hero.features.community')}</span>
                        </div>
                    </div>
                    <a
                        href="#section-title"
                        className={styles.more}
                        onClick={scrollToSection}
                    >
                        <span>
                            {t('hero.discoverLessons')}
                            <ChevronDown size={20} />
                        </span>
                    </a>
                </div>
                <div className={styles.logoContainer}>
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