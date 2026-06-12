"use client";

import React, { useState, useEffect } from "react";
import { auth } from "../../firebase/config";
import {
  getAllPendingLessons,
  approvePendingLesson,
  rejectPendingLesson,
  PendingLesson,
} from "../../firebase/pendingLessons";
import { addAdminLog } from "../../firebase/lessons";
import styles from "./AdminComponents.module.css";
import { Check, X, Eye } from "lucide-react";
import { toast } from "react-hot-toast";

const AdminPendingLessons: React.FC = () => {
  const [pendingLessons, setPendingLessons] = useState<PendingLesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<PendingLesson | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchPending = async () => {
    try {
      setLoading(true);
      const data = await getAllPendingLessons();
      setPendingLessons(data);
    } catch (err) {
      console.error("Failed to load pending lessons:", err);
      toast.error("Unable to load pending lessons.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleApprove = async (pending: PendingLesson) => {
    const adminId = auth.currentUser?.uid;
    if (!adminId) return;

    setActionLoading(pending.id);
    try {
      await approvePendingLesson(pending, adminId);
      setPendingLessons((prev) => prev.filter((p) => p.id !== pending.id));
      setSelected(null);
      toast.success(`Lesson "${pending.title}" approved and published.`);
      await addAdminLog(
        "success",
        `Leçon approuvée : ${pending.title} (soumis par ${pending.submittedByUsername})`,
        adminId
      );
    } catch (err) {
      console.error("Approval failed:", err);
      toast.error("Failed to approve lesson.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (pending: PendingLesson) => {
    const adminId = auth.currentUser?.uid;
    if (!adminId) return;

    setActionLoading(pending.id);
    try {
      await rejectPendingLesson(pending.id, adminId, rejectReason);
      setPendingLessons((prev) => prev.filter((p) => p.id !== pending.id));
      setSelected(null);
      setRejectReason("");
      toast.success(`Lesson "${pending.title}" rejected.`);
      await addAdminLog(
        "warning",
        `Leçon rejetée : ${pending.title} (soumis par ${pending.submittedByUsername})`,
        adminId
      );
    } catch (err) {
      console.error("Rejection failed:", err);
      toast.error("Failed to reject lesson.");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Loading pending submissions...</p>
      </div>
    );
  }

  return (
    <div className={styles.adminLessonsContainer}>
      <div className={styles.adminLessonsHeader}>
        <h2 className={styles.adminLessonsTitle}>Pending Teacher Submissions</h2>
      </div>

      {pendingLessons.length === 0 ? (
        <div className={styles.noLessonsContainer}>
          <p>No lessons awaiting approval.</p>
        </div>
      ) : (
        <div className={styles.lessonsTable}>
          <div className={styles.tableHeader}>
            <div className={styles.tableCell}>Title</div>
            <div className={styles.tableCell}>Teacher</div>
            <div className={styles.tableCell}>Category</div>
            <div className={styles.tableCell}>Submitted</div>
            <div className={styles.tableCell}>Actions</div>
          </div>

          {pendingLessons.map((pending) => (
            <div key={pending.id} className={styles.tableRow}>
              <div className={styles.tableCell}>{pending.title}</div>
              <div className={styles.tableCell}>
                {pending.submittedByUsername}
                <br />
                <small style={{ color: "#aaa" }}>{pending.submittedByEmail}</small>
              </div>
              <div className={styles.tableCell}>
                <span className={styles.categoryBadge}>{pending.category}</span>
              </div>
              <div className={styles.tableCell}>
                {pending.submittedAt?.toDate
                  ? pending.submittedAt.toDate().toLocaleString("fr-FR")
                  : "—"}
              </div>
              <div className={styles.tableCell}>
                <div className={styles.actionButtons}>
                  <button
                    className={styles.actionButton}
                    onClick={() => setSelected(pending)}
                    title="Preview"
                  >
                    <Eye size={18} />
                  </button>
                  <button
                    className={styles.actionButton}
                    onClick={() => handleApprove(pending)}
                    disabled={actionLoading === pending.id}
                    title="Approve"
                  >
                    <Check size={18} />
                  </button>
                  <button
                    className={styles.actionButton}
                    onClick={() => {
                      setSelected(pending);
                      setRejectReason("");
                    }}
                    disabled={actionLoading === pending.id}
                    title="Reject"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selected && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent} style={{ maxWidth: 700 }}>
            <h3>{selected.title}</h3>
            <p style={{ color: "#aaa" }}>{selected.description}</p>
            <p>
              <strong>Teacher:</strong> {selected.submittedByUsername} ({selected.submittedByEmail})
            </p>
            <p>
              <strong>Sections:</strong> {selected.content.sections.length} |{" "}
              <strong>Questions:</strong> {selected.content.questions.length}
            </p>

            <div style={{ marginTop: "1rem" }}>
              <label className={styles.formLabel}>Rejection reason (optional)</label>
              <textarea
                className={styles.formTextarea}
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Explain why this lesson is rejected..."
              />
            </div>

            <div className={styles.modalActions}>
              <button
                className={styles.confirmYes}
                onClick={() => handleApprove(selected)}
                disabled={actionLoading === selected.id}
              >
                Approve & Publish
              </button>
              <button
                className={styles.confirmNo}
                onClick={() => handleReject(selected)}
                disabled={actionLoading === selected.id}
              >
                Reject
              </button>
              <button
                className={styles.confirmNo}
                onClick={() => {
                  setSelected(null);
                  setRejectReason("");
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPendingLessons;
