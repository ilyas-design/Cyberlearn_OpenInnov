'use client';

import { useLanguage } from '@/app/context/LanguageContext';
import React from 'react';
import styles from './LanguageSwitcher.module.css';

const LanguageSwitcher: React.FC = () => {
  const { locale, setLocale, t } = useLanguage();

  const toggleLanguage = () => {
    setLocale(locale === 'fr' ? 'en' : 'fr');
  };

  return (
    <div className={styles.languageSwitcher}>
      <button 
        onClick={toggleLanguage} 
        className={styles.switcherButton}
        aria-label={`Switch to ${locale === 'fr' ? 'English' : 'French'}`}
      >
        <span className={styles.currentLang}>{locale === 'fr' ? 'FR' : 'EN'}</span>
        <span className={styles.otherLang}>{locale === 'fr' ? 'EN' : 'FR'}</span>
      </button>
    </div>
  );
};

export default LanguageSwitcher;
