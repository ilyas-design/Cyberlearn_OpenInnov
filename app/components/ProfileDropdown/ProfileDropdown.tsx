"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { signOut } from "firebase/auth";
import { auth, db } from "@/app/firebase/config";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import styles from "./ProfileDropdown.module.css";
import { User, LogOut, ChevronRight, Shield, Bell, GraduationCap } from "lucide-react";
import { useLanguage } from "@/app/context/LanguageContext";

interface ProfileDropdownProps {
    isVisible: boolean;
    onClose: () => void;
}

const ProfileDropdown = ({ isVisible, onClose }: ProfileDropdownProps) => {
    const router = useRouter();
    const [username, setUsername] = useState<string | null>(null);
    const [email, setEmail] = useState<string | null>(null);
    const [level, setLevel] = useState<number>(1);
    const [isTeacher, setIsTeacher] = useState(false);
    const { t } = useLanguage();

    useEffect(() => {
        const fetchUserData = async () => {
            const currentUser = auth.currentUser;
            if (currentUser) {
                setEmail(currentUser.email);

                try {
                    const userDocRef = doc(db, "users", currentUser.uid);
                    const userDoc = await getDoc(userDocRef);

                    if (userDoc.exists()) {
                        const userData = userDoc.data();
                        setUsername(userData.username || currentUser.displayName || t('profile.defaultUsername'));
                        setLevel(userData.level ?? 1);
                        setIsTeacher(userData.isTeacher === true);
                    } else {
                        setUsername(currentUser.displayName || t('profile.defaultUsername'));
                        setLevel(1);
                    }
                } catch (error) {
                    console.error("Erreur lors de la récupération des données utilisateur:", error);
                    setUsername(currentUser.displayName || t('profile.defaultUsername'));
                    setLevel(1);
                }
            }
        };

        if (isVisible) {
            fetchUserData();
        }
    }, [isVisible, t]);

    const handleSignOut = async () => {
        try {
            await signOut(auth);
            router.push('/login');
            onClose();
        } catch (error) {
            console.error('Erreur lors de la déconnexion:', error);
        }
    };

    const handleClickOutside = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    if (!isVisible) return null;

    return (
        <div className={styles.dropdownOverlay} onClick={handleClickOutside}>
            <div className={styles.dropdownContainer} onClick={(e) => e.stopPropagation()}>
                <div className={styles.dropdownHeader}>
                    <div className={styles.headerAvatar}>
                        <User size={24} />
                    </div>
                    <div className={styles.headerInfo}>
                        <h3 className={styles.headerName}>{username}</h3>
                        <p className={styles.headerEmail}>{email}</p>
                        <span className={styles.levelBadge}>Niveau {level}</span>
                    </div>
                </div>

                <div className={styles.dropdownContent}>
                    <Link href="/profile" className={styles.dropdownItem} onClick={onClose}>
                        <User className={styles.itemIcon} size={18} />
                        <span>{t('profile.myProfile')}</span>
                        <ChevronRight className={styles.itemArrow} size={16} />
                    </Link>

                    {isTeacher && (
                        <Link href="/teacher" className={styles.dropdownItem} onClick={onClose}>
                            <GraduationCap className={styles.itemIcon} size={18} />
                            <span>{t('navigation.teacher')}</span>
                            <ChevronRight className={styles.itemArrow} size={16} />
                        </Link>
                    )}

                    <div className={styles.separator}></div>

                    <Link href="/settings/notifications" className={styles.dropdownItem} onClick={onClose}>
                        <Bell className={styles.itemIcon} size={18} />
                        <span>{t('profile.notifications')}</span>
                        <ChevronRight className={styles.itemArrow} size={16} />
                    </Link>

                    <Link href="/settings/security" className={styles.dropdownItem} onClick={onClose}>
                        <Shield className={styles.itemIcon} size={18} />
                        <span>{t('profile.security')}</span>
                        <ChevronRight className={styles.itemArrow} size={16} />
                    </Link>

                    <div className={styles.separator}></div>

                    <button
                        onClick={handleSignOut}
                        className={`${styles.dropdownItem} ${styles.logoutItem}`}
                    >
                        <LogOut className={styles.itemIcon} size={18} />
                        <span>{t('navigation.logout')}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProfileDropdown;