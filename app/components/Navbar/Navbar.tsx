// components/Navbar.tsx
"use client";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import styles from "./Navbar.module.css";
import logo from "@/public/Images/White_log.png";
import AuthButton from "@/app/components/Navbar/AuthButton";
import LanguageSwitcher from "@/app/components/LanguageSwitcher/LanguageSwitcher";
import { Menu, X } from "lucide-react";
import { useLanguage } from "@/app/context/LanguageContext";

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const { t } = useLanguage();

    useEffect(() => {
        const handleScroll = () => {
            const isScrolled = window.scrollY > 20;
            setScrolled(isScrolled);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <nav className={`${styles.navbar} ${scrolled ? styles.scrolled : ""}`}>
            {/* Logo */}
            <div className={styles.logoContainer}>
                <Link href="/">
                    <Image
                        src={logo}
                        alt="Home"
                        className={styles.homeImage}
                        width={110}
                        height={40}
                        priority
                        style={{ objectFit: "contain" }}
                    />
                </Link>
            </div>

            {/* Menu Burger (Mobile) */}
            <button
                className={styles.burgerMenu}
                onClick={toggleMenu}
                aria-label="Menu"
            >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Liens et Menu Utilisateur */}
            <div className={`${styles.navLinks} ${isMenuOpen ? styles.open : ""}`}>
                <Link href="/lessons" className={styles.link}>
                    {t('navigation.lessons')}
                </Link>
                <Link href="/Partners" className={styles.link}>
                    {t('navigation.partners')}
                </Link>
                <Link href="/contact" className={styles.link}>
                    {t('navigation.contact')}
                </Link>
                <Link href="/about" className={styles.link}>
                    {t('navigation.about')}
                </Link>

                {/* Language Switcher */}
                <div className={styles.languageSwitcherContainer}>
                    <LanguageSwitcher />
                </div>

                {/* Composant dynamique pour la connexion */}
                <div className={styles.authContainer}>
                    <AuthButton />
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
