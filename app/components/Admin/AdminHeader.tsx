"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase/config";
import { BookOpen, Users, LogOut, AlertTriangle, BarChart, ClipboardCheck } from "lucide-react";
import styles from "./AdminComponents.module.css";

interface AdminHeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ activeTab, setActiveTab }) => {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/login");
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    }
  };

  return (
    <div className={styles.adminHeader}>
      <h1 className={styles.adminTitle}>Interface d'Administration</h1>

      <div className={styles.adminTabs}>
        <button
          className={`${styles.tabButton} ${activeTab === "lessons" ? styles.active : ""}`}
          onClick={() => setActiveTab("lessons")}
        >
          <BookOpen size={18} />
          <span>Leçons</span>
        </button>

        <button
          className={`${styles.tabButton} ${activeTab === "pending" ? styles.active : ""}`}
          onClick={() => setActiveTab("pending")}
        >
          <ClipboardCheck size={18} />
          <span>Approbations</span>
        </button>

        <button
          className={`${styles.tabButton} ${activeTab === "users" ? styles.active : ""}`}
          onClick={() => setActiveTab("users")}
        >
          <Users size={18} />
          <span>Utilisateurs</span>
        </button>

        <button
          className={`${styles.tabButton} ${activeTab === "stats" ? styles.active : ""}`}
          onClick={() => setActiveTab("stats")}
        >
          <BarChart size={18} />
          <span>Statistiques</span>
        </button>


        <button
          className={`${styles.tabButton} ${activeTab === "logs" ? styles.active : ""}`}
          onClick={() => setActiveTab("logs")}
        >
          <AlertTriangle size={18} />
          <span>Logs</span>
        </button>
      </div>

      <button className={styles.logoutButton} onClick={handleLogout}>
        <LogOut size={18} />
        <span>Déconnexion</span>
      </button>
    </div>
  );
};

export default AdminHeader; 