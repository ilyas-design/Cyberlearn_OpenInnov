"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "../firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, collection, getDocs, query, orderBy } from "firebase/firestore";
import AdminLessonForm from "../components/Admin/AdminLessonForm";
import {
  getPendingLessonsByTeacher,
  PendingLesson,
  deletePendingLesson,
} from "../firebase/pendingLessons";
import styles from "../admin/admin.module.css";
import adminStyles from "../components/Admin/AdminComponents.module.css";
import { Plus, BookOpen, Clock, CheckCircle, XCircle } from "lucide-react";
import Page3DShell from "@/app/components/CyberBackground/Page3DShell";

export default function TeacherPage() {
  const router = useRouter();
  const [isTeacher, setIsTeacher] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [pendingLessons, setPendingLessons] = useState<PendingLesson[]>([]);
  const [editingPending, setEditingPending] = useState<PendingLesson | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [teacherInfo, setTeacherInfo] = useState<{
    uid: string;
    email: string;
    username: string;
  } | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setIsTeacher(false);
        router.push("/login");
        setLoading(false);
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (!userDoc.exists() || !userDoc.data().isTeacher) {
          setIsTeacher(false);
          router.push("/lessons");
          setLoading(false);
          return;
        }

        const userData = userDoc.data();
        setIsTeacher(true);
        setTeacherInfo({
          uid: user.uid,
          email: user.email || userData.email || "",
          username: userData.username || "Teacher",
        });

        const pending = await getPendingLessonsByTeacher(user.uid);
        setPendingLessons(pending);

        const lessonsQuery = query(collection(db, "lessons"), orderBy("order", "asc"));
        const lessonsSnap = await getDocs(lessonsQuery);
        const cats = Array.from(
          new Set(lessonsSnap.docs.map((d) => d.data().category as string).filter(Boolean))
        );
        setCategories(cats);
      } catch (error) {
        console.error("Teacher portal error:", error);
        setIsTeacher(false);
        router.push("/login");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const handleLessonSaved = async () => {
    if (teacherInfo) {
      const pending = await getPendingLessonsByTeacher(teacherInfo.uid);
      setPendingLessons(pending);
    }
    setShowForm(false);
    setEditingPending(null);
  };

  const handleDeletePending = async (pendingId: string) => {
    if (!confirm("Delete this pending submission?")) return;
    try {
      await deletePendingLesson(pendingId);
      setPendingLessons((prev) => prev.filter((p) => p.id !== pendingId));
    } catch (err) {
      console.error("Failed to delete pending lesson:", err);
    }
  };

  const statusIcon = (status: PendingLesson["status"]) => {
    if (status === "approved") return <CheckCircle size={16} color="#4CAF50" />;
    if (status === "rejected") return <XCircle size={16} color="#FF6B6B" />;
    return <Clock size={16} color="#FFC107" />;
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Loading teacher portal...</p>
      </div>
    );
  }

  if (!isTeacher || !teacherInfo) {
    return (
      <div className={styles.unauthorizedContainer}>
        <h1>Unauthorized</h1>
        <p>Teacher access is required.</p>
      </div>
    );
  }

  return (
    <Page3DShell variant="grid">
      <div className={styles.adminContainer}>
        <div className={adminStyles.adminHeader}>
          <h1 className={adminStyles.adminTitle}>Teacher Portal</h1>
          <p style={{ color: "#aaa", marginTop: "0.5rem" }}>
            Create lessons and submit them for admin approval before publication.
          </p>
        </div>

        <div className={styles.adminContent}>
          {showForm ? (
            <AdminLessonForm
              lesson={null}
              pendingLesson={editingPending}
              onSave={handleLessonSaved}
              onCancel={() => {
                setShowForm(false);
                setEditingPending(null);
              }}
              categories={categories}
              submitMode="pending"
              teacherInfo={teacherInfo}
            />
          ) : (
            <>
              <div className={adminStyles.adminLessonsHeader}>
                <h2 className={adminStyles.adminLessonsTitle}>
                  <BookOpen size={22} style={{ marginRight: 8 }} />
                  My Lesson Submissions
                </h2>
                <button
                  className={adminStyles.addButton}
                  onClick={() => {
                    setEditingPending(null);
                    setShowForm(true);
                  }}
                >
                  <Plus size={18} />
                  <span>Submit new lesson</span>
                </button>
              </div>

              {pendingLessons.length === 0 ? (
                <div className={adminStyles.noLessonsContainer}>
                  <p>No submissions yet. Create your first lesson!</p>
                </div>
              ) : (
                <div className={adminStyles.lessonsTable}>
                  <div className={adminStyles.tableHeader}>
                    <div className={adminStyles.tableCell}>Title</div>
                    <div className={adminStyles.tableCell}>Category</div>
                    <div className={adminStyles.tableCell}>Status</div>
                    <div className={adminStyles.tableCell}>Submitted</div>
                    <div className={adminStyles.tableCell}>Actions</div>
                  </div>
                  {pendingLessons.map((pending) => (
                    <div key={pending.id} className={adminStyles.tableRow}>
                      <div className={adminStyles.tableCell}>{pending.title}</div>
                      <div className={adminStyles.tableCell}>
                        <span className={adminStyles.categoryBadge}>{pending.category}</span>
                      </div>
                      <div className={adminStyles.tableCell}>
                        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          {statusIcon(pending.status)}
                          {pending.status}
                        </span>
                        {pending.status === "rejected" && pending.rejectionReason && (
                          <small style={{ display: "block", color: "#FF6B6B", marginTop: 4 }}>
                            {pending.rejectionReason}
                          </small>
                        )}
                      </div>
                      <div className={adminStyles.tableCell}>
                        {pending.submittedAt?.toDate
                          ? pending.submittedAt.toDate().toLocaleDateString()
                          : "—"}
                      </div>
                      <div className={adminStyles.tableCell}>
                        {pending.status === "pending" && (
                          <>
                            <button
                              className={adminStyles.actionButton}
                              onClick={() => {
                                setEditingPending(pending);
                                setShowForm(true);
                              }}
                            >
                              Edit
                            </button>
                            <button
                              className={adminStyles.actionButton}
                              onClick={() => handleDeletePending(pending.id)}
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Page3DShell>
  );
}
