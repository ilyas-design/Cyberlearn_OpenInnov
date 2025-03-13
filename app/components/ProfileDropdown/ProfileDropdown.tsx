"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { signOut } from "firebase/auth";
import { auth, db } from "@/app/firebase/config";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import styles from "./ProfileDropdown.module.css";
import { User, Settings, LogOut, ChevronRight, Shield, Bell } from "lucide-react";

interface ProfileDropdownProps {
    isVisible: boolean;
    onClose: () => void;
}

const ProfileDropdown = ({ isVisible, onClose }: ProfileDropdownProps) => {
    const router = useRouter();
    const [username, setUsername] = useState<string | null>(null);
    const [email, setEmail] = useState<string | null>(null);

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
                        setUsername(userData.username || currentUser.displayName || "Utilisateur");
                    } else {
                        setUsername(currentUser.displayName || "Utilisateur");
                    }
                } catch (error) {
                    console.error("Erreur lors de la récupération des données utilisateur:", error);
                    setUsername(currentUser.displayName || "Utilisateur");
                }
            }
        };

        if (isVisible) {
            fetchUserData();
        }
    }, [isVisible]);

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
                    </div>
                </div>

                <div className={styles.dropdownContent}>
                    <Link href="/profile" className={styles.dropdownItem} onClick={onClose}>
                        <User className={styles.itemIcon} size={18} />
                        <span>Mon Profil</span>
                        <ChevronRight className={styles.itemArrow} size={16} />
                    </Link>

                    <Link href="/settings" className={styles.dropdownItem} onClick={onClose}>
                        <Settings className={styles.itemIcon} size={18} />
                        <span>Paramètres</span>
                        <ChevronRight className={styles.itemArrow} size={16} />
                    </Link>

                    <div className={styles.separator}></div>

                    <Link href="/settings/notifications" className={styles.dropdownItem} onClick={onClose}>
                        <Bell className={styles.itemIcon} size={18} />
                        <span>Notifications</span>
                        <ChevronRight className={styles.itemArrow} size={16} />
                    </Link>

                    <Link href="/settings/security" className={styles.dropdownItem} onClick={onClose}>
                        <Shield className={styles.itemIcon} size={18} />
                        <span>Sécurité</span>
                        <ChevronRight className={styles.itemArrow} size={16} />
                    </Link>

                    <div className={styles.separator}></div>

                    <button
                        onClick={handleSignOut}
                        className={`${styles.dropdownItem} ${styles.logoutItem}`}
                    >
                        <LogOut className={styles.itemIcon} size={18} />
                        <span>Déconnexion</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProfileDropdown;