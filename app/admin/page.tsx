"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "../firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import AdminLessonsList from "../components/Admin/AdminLessonsList";
import AdminHeader from "../components/Admin/AdminHeader";
import UserManagement from "../components/Admin/UserManagement/UserManagement";
import styles from "./admin.module.css";
import { useAuth } from "../context/AuthContext";
import { query, orderBy, onSnapshot, getDocs, collection } from "firebase/firestore";
import { Users, BookOpen } from "lucide-react";
import { addAdminLog } from '../firebase/lessons';

export default function AdminPage() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>("lessons");
  const { user: authUser } = useAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Vérifier si l'utilisateur a le rôle admin dans Firestore
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists() && userDoc.data().isAdmin) {
            setIsAdmin(true);
            await addAdminLog('info', `Connexion admin : ${user.email} (ID: ${user.uid})`, user.uid);
          } else {
            setIsAdmin(false);
            router.push("/login");
          }
        } catch (error) {
          console.error("Erreur lors de la vérification du rôle admin:", error);
          setIsAdmin(false);
          router.push("/login");
        }
      } else {
        setIsAdmin(false);
        router.push("/login");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Chargement de l'interface d'administration...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className={styles.unauthorizedContainer}>
        <h1>Accès non autorisé</h1>
        <p>Vous devez être administrateur pour accéder à cette page.</p>
        <button
          className={styles.loginButton}
          onClick={() => router.push("/login")}
        >
          Se connecter
        </button>
      </div>
    );
  }

  return (
    <div className={styles.adminContainer}>
      <AdminHeader activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className={styles.adminContent}>
        {activeTab === "lessons" && (
          <AdminLessonsList />
        )}
        {activeTab === "users" && (
          <UserManagement />
        )}
        {activeTab === "stats" && (
          <AdminStats />
        )}
        {activeTab === "settings" && (
          <AdminStats />
        )}
        {activeTab === "logs" && (
          <AdminLogs />
        )}
      </div>
    </div>
  );
}

// Nouveau composant pour les statistiques admin (version améliorée)
function AdminStats() {
  const [stats, setStats] = React.useState({ users: 0, lessons: 0, loading: true });

  React.useEffect(() => {
    async function fetchStats() {
      try {
        const usersSnap = await getDocs(collection(db, "users"));
        const lessonsSnap = await getDocs(collection(db, "lessons"));
        setStats({
          users: usersSnap.size,
          lessons: lessonsSnap.size,
          loading: false
        });
      } catch (e) {
        setStats(s => ({ ...s, loading: false }));
      }
    }
    fetchStats();
  }, []);

  if (stats.loading) return <div style={{ textAlign: 'center', padding: '2rem' }}>Chargement des statistiques...</div>;
  return (
    <div style={{
      background: 'linear-gradient(135deg, #0AFFD4 0%, #0024FF 100%)',
      borderRadius: '18px',
      padding: '3rem 2rem',
      margin: '2rem auto',
      maxWidth: 600,
      boxShadow: '0 8px 32px rgba(0,36,255,0.18)',
      color: '#fff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '2.5rem',
    }}>
      <h2 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '2.5rem', letterSpacing: '2px', marginBottom: '1.5rem' }}>Statistiques de la plateforme</h2>
      <div style={{ display: 'flex', gap: '2rem', width: '100%', justifyContent: 'center', flexWrap: 'wrap' }}>
        <div style={{
          background: 'rgba(3,2,25,0.85)',
          borderRadius: '14px',
          padding: '2rem 2.5rem',
          minWidth: 200,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          boxShadow: '0 4px 18px rgba(0,36,255,0.10)',
        }}>
          <Users size={48} color="#0AFFD4" style={{ marginBottom: '1rem' }} />
          <div style={{ fontSize: '2.2rem', fontWeight: 700, fontFamily: 'Abel, sans-serif' }}>{stats.users}</div>
          <div style={{ fontSize: '1.1rem', marginTop: '0.5rem', letterSpacing: '1px' }}>Utilisateurs</div>
        </div>
        <div style={{
          background: 'rgba(3,2,25,0.85)',
          borderRadius: '14px',
          padding: '2rem 2.5rem',
          minWidth: 200,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          boxShadow: '0 4px 18px rgba(0,36,255,0.10)',
        }}>
          <BookOpen size={48} color="#FF6B6B" style={{ marginBottom: '1rem' }} />
          <div style={{ fontSize: '2.2rem', fontWeight: 700, fontFamily: 'Abel, sans-serif' }}>{stats.lessons}</div>
          <div style={{ fontSize: '1.1rem', marginTop: '0.5rem', letterSpacing: '1px' }}>Leçons</div>
        </div>
      </div>
    </div>
  );
}

// Nouveau composant AdminLogs (faux logs pour l'exemple)
function AdminLogs() {
  type LogType = 'info' | 'success' | 'warning' | 'error';
  const [logs, setLogs] = React.useState<{ type: LogType; message: string; createdAt: any; userId?: string }[]>([]);
  const colors: Record<LogType, string> = {
    info: '#0AFFD4',
    success: '#4CAF50',
    warning: '#FFC107',
    error: '#FF6B6B',
  };
  React.useEffect(() => {
    const q = query(collection(db, 'adminLogs'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setLogs(snapshot.docs.map(doc => doc.data() as any));
    });
    return () => unsubscribe();
  }, []);

  // Fonction pour télécharger les logs au format CSV
  const handleDownload = () => {
    const csvRows = [
      'Type,Message,Date,UserID',
      ...logs.map(log => {
        const date = log.createdAt && log.createdAt.toDate ? log.createdAt.toDate().toLocaleString('fr-FR') : '';
        return `"${log.type}","${log.message.replace(/"/g, '""')}","${date}","${log.userId || ''}"`;
      })
    ];
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'admin-logs.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{
      background: 'rgba(3,2,25,0.85)',
      borderRadius: '18px',
      padding: '2.5rem 2rem',
      margin: '2rem auto',
      maxWidth: 700,
      boxShadow: '0 8px 32px rgba(0,36,255,0.18)',
      color: '#fff',
      fontFamily: 'Abel, sans-serif',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '2.2rem', letterSpacing: '2px', color: '#0AFFD4', margin: 0 }}>Logs administrateur</h2>
        <button onClick={handleDownload} style={{ background: '#0AFFD4', color: '#10142a', border: 'none', borderRadius: 6, padding: '0.5rem 1.2rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'Abel, sans-serif', fontSize: '1rem' }}>Télécharger les logs</button>
      </div>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {logs.length === 0 && <li style={{ color: '#aaa', textAlign: 'center' }}>Aucun log pour le moment.</li>}
        {logs.map((log, idx) => (
          <li key={idx} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '1.2rem',
            background: 'rgba(0,36,255,0.08)',
            borderLeft: `5px solid ${colors[log.type]}`,
            borderRadius: '8px',
            padding: '1rem 1.5rem',
            fontSize: '1.08rem',
            boxShadow: '0 2px 8px rgba(0,36,255,0.08)',
          }}>
            <span style={{ fontWeight: 700, color: colors[log.type], minWidth: 80, textTransform: 'capitalize' }}>{log.type}</span>
            <span style={{ flex: 1 }}>{log.message}</span>
            <span style={{ fontSize: '0.98rem', color: '#aaa', fontFamily: 'monospace' }}>{log.createdAt && log.createdAt.toDate ? log.createdAt.toDate().toLocaleString('fr-FR') : ''}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}