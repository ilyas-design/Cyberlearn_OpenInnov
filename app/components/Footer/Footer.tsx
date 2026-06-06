// components/Footer/Footer.tsx
'use client';
import Link from 'next/link';
import Image from 'next/image';
import styles from './Footer.module.css';
import logo from '../../../public/Images/White_log.png';
import TwitterIcon from '../../../public/Images/x.svg';
import LinkedinIcon from '../../../public/Images/linkedin.svg';
import InstagramIcon from '../../../public/Images/instagram.svg';
import { useLanguage } from '@/app/context/LanguageContext';
import AnimateIn from '@/app/components/AnimateIn/AnimateIn';

const Footer = () => {
    const { t } = useLanguage();

    return (
        <footer className={styles.footer}>
            <div className={styles.footerContent}>
                <AnimateIn animation="fade-up" delay={0}>
                <div className={styles.footerSection}>
                    <Image
                        src={logo}
                        alt="CyberLearn Logo"
                        className={styles.footerLogo}
                        width={160}
                        height={60}
                        style={{ objectFit: 'contain', cursor: 'pointer', width: '100px', height: '100px' }}

                    />
                    <p className={styles.footerText}>
                        {t('footer.description')}
                    </p>
                </div>
                </AnimateIn>

                <AnimateIn animation="fade-up" delay={80}>
                <div className={styles.footerSection}>
                    <h4 className={styles.sectionTitle}>{t('footer.services')}</h4>
                    <ul className={styles.linkList}>
                        <li><Link href="/lessons" className={styles.footerLink}>{t('navigation.lessons')}</Link></li>
                        <li><Link href="/Partners" className={styles.footerLink}>{t('navigation.partners')}</Link></li>
                        <li><Link href="/about" className={styles.footerLink}>{t('navigation.about')}</Link></li>
                        <li><Link href="/contact" className={styles.footerLink}>{t('footer.support')}</Link></li>
                    </ul>
                </div>
                </AnimateIn>

                <AnimateIn animation="fade-up" delay={160}>
                <div className={styles.footerSection}>
                    <h4 className={styles.sectionTitle}>{t('footer.contactTitle')}</h4>
                    <ul className={styles.contactList}>
                        <li>contact@cyberlearn.com</li>
                        <li>+33 1 23 45 67 89</li>
                        <li>Paris, France</li>
                    </ul>
                </div>
                </AnimateIn>

                <AnimateIn animation="fade-up" delay={240}>
                <div className={styles.footerSection}>
                    <h4 className={styles.sectionTitle}>{t('footer.newsletter')}</h4>
                    <form className={styles.newsletterForm}>
                        <input
                            type="email"
                            placeholder={t('footer.emailPlaceholder')}
                            className={styles.newsletterInput}
                        />
                        <button type="submit" className={styles.newsletterButton}>
                            {t('footer.subscribe')}
                        </button>
                    </form>
                </div>
                </AnimateIn>
            </div>

            <AnimateIn animation="fade-in" delay={320}>
            <div className={styles.copyrightBar}>
                <p>{t('footer.copyright')}</p>
                <div className={styles.socialLinks}>
                    <Link href="#" aria-label="Twitter">
                        <Image
                            src={TwitterIcon}
                            alt="Twitter"
                            className={styles.socialIcon}
                            width={24}
                            height={24}
                            style={{ backgroundColor: 'white', borderRadius: '50%' }}
                        />
                    </Link>
                    <Link href="#" aria-label="LinkedIn">
                        <Image
                            src={LinkedinIcon}
                            alt="LinkedIn"
                            className={styles.socialIcon}
                            width={24}
                            height={24}
                            style={{ backgroundColor: 'white', borderRadius: '5px' }}                        />
                    </Link>
                    <Link href="#" aria-label="Instagram">
                        <Image
                            src={InstagramIcon}
                            alt="Instagram"
                            className={styles.socialIcon}
                            width={24}
                            height={24}

                        />
                    </Link>
                </div>
            </div>
            </AnimateIn>
        </footer>
    );
};

export default Footer;
