'use client';

import { useState, useEffect } from 'react';
import { BookmarkPlus, Save, X } from 'lucide-react';
import { useAuth } from '@/app/context/AuthContext';
import toast from 'react-hot-toast';
import styles from './NotesPanel.module.css';
import { getUserNotes, saveUserNotes } from '@/app/firebase/userProfile';

interface NotesPanelProps {
    lessonId: string;
    lessonTitle: string;
}

export default function NotesPanel({ lessonId, lessonTitle }: NotesPanelProps) {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [notes, setNotes] = useState('');
    const [savedNotes, setSavedNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [autoSaving, setAutoSaving] = useState(false);

    // Charger les notes au montage du composant
    useEffect(() => {
        const loadNotes = async () => {
            if (user && lessonId) {
                console.log('🔍 Chargement des notes pour la leçon:', lessonId);
                try {
                    const lessonNotes = await getUserNotes(user.uid, lessonId);
                    setNotes(lessonNotes);
                    setSavedNotes(lessonNotes);
                    if (lessonNotes) {
                        console.log('✅ Notes chargées:', lessonNotes.length, 'caractères');
                    }
                } catch (error) {
                    console.error('❌ Erreur lors du chargement des notes:', error);
                    toast.error('Erreur lors du chargement de vos notes');
                }
            }
        };

        loadNotes();
    }, [user, lessonId]);

    useEffect(() => {
        setHasUnsavedChanges(notes !== savedNotes);
    }, [notes, savedNotes]);

    // Masquer le chatbot quand le panel est ouvert
    useEffect(() => {
        if (isOpen) {
            document.body.setAttribute('data-notes-open', 'true');
        } else {
            document.body.removeAttribute('data-notes-open');
        }

        return () => {
            document.body.removeAttribute('data-notes-open');
        };
    }, [isOpen]);

    // Auto-sauvegarde toutes les 30 secondes si des changements non sauvegardés
    useEffect(() => {
        if (!hasUnsavedChanges || !isOpen || !user) return;

        const autoSaveTimer = setTimeout(async () => {
            setAutoSaving(true);
            try {
                await saveUserNotes(user.uid, lessonId, notes);
                setSavedNotes(notes);
                setHasUnsavedChanges(false);
                toast.success('Notes auto-sauvegardées ✓', {
                    duration: 1500,
                    style: {
                        background: '#3b82f6',
                        color: '#fff',
                        fontSize: '0.9rem'
                    }
                });
            } catch (error) {
                console.error('Erreur lors de l\'auto-sauvegarde:', error);
                toast.error('Erreur lors de l\'auto-sauvegarde');
            } finally {
                setAutoSaving(false);
            }
        }, 30000); // 30 secondes

        return () => clearTimeout(autoSaveTimer);
    }, [hasUnsavedChanges, isOpen, user, notes, lessonId]);

    // Raccourci clavier Ctrl+S pour sauvegarder
    useEffect(() => {
        const handleKeyDown = async (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 's' && isOpen) {
                e.preventDefault();

                // Ne rien faire si déjà en train de sauvegarder ou pas de changements
                if (loading || !hasUnsavedChanges || autoSaving || !user) {
                    return;
                }

                if (!notes.trim()) {
                    toast.error('Les notes sont vides');
                    return;
                }

                setLoading(true);
                try {
                    console.log('💾 Sauvegarde des notes (Ctrl+S) pour la leçon:', lessonId);
                    await saveUserNotes(user.uid, lessonId, notes);

                    setSavedNotes(notes);
                    setHasUnsavedChanges(false);
                    toast.success('Notes sauvegardées ! ✓', {
                        duration: 2000,
                        style: {
                            background: '#10b981',
                            color: '#fff',
                        }
                    });
                    console.log('✅ Notes sauvegardées avec succès (Ctrl+S)');
                } catch (error) {
                    console.error('❌ Erreur lors de la sauvegarde des notes:', error);
                    toast.error('Erreur lors de la sauvegarde. Vérifiez votre connexion.');
                } finally {
                    setLoading(false);
                }
            }
        };

        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, hasUnsavedChanges, loading, autoSaving, user, notes, lessonId]);

    const handleSave = async () => {
        if (!user) {
            toast.error('Vous devez être connecté pour sauvegarder des notes');
            return;
        }

        if (!notes.trim()) {
            toast.error('Les notes sont vides');
            return;
        }

        setLoading(true);

        try {
            console.log('💾 Sauvegarde des notes pour la leçon:', lessonId);
            await saveUserNotes(user.uid, lessonId, notes);

            setSavedNotes(notes);
            setHasUnsavedChanges(false);
            toast.success('Notes sauvegardées ! ✓', {
                duration: 2000,
                style: {
                    background: '#10b981',
                    color: '#fff',
                }
            });
            console.log('✅ Notes sauvegardées avec succès');
        } catch (error) {
            console.error('❌ Erreur lors de la sauvegarde des notes:', error);
            toast.error('Erreur lors de la sauvegarde. Vérifiez votre connexion.');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (hasUnsavedChanges) {
            const confirm = window.confirm('Vous avez des modifications non sauvegardées. Voulez-vous vraiment fermer ?');
            if (!confirm) return;
        }
        setIsOpen(false);
    };

    return (
        <>
            <button
                className={`${styles.toggleButton} ${isOpen ? styles.hidden : ''}`}
                onClick={() => setIsOpen(!isOpen)}
                title="Prendre des notes"
            >
                <BookmarkPlus size={20} />
                <span>Notes</span>
                {hasUnsavedChanges && <span className={styles.unsavedIndicator}>•</span>}
            </button>

            {isOpen && (
                <div className={styles.notesPanel}>
                    <div className={styles.notesHeader}>
                        <div className={styles.headerTitle}>
                            <BookmarkPlus size={18} />
                            <h3>Mes Notes</h3>
                        </div>
                        <button
                            className={styles.closeButton}
                            onClick={handleClose}
                            aria-label="Fermer"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className={styles.lessonInfo}>
                        <span className={styles.lessonLabel}>Leçon:</span>
                        <span className={styles.lessonName}>{lessonTitle}</span>
                        {!user && (
                            <div className={styles.warningMessage}>
                                ⚠️ Connectez-vous pour sauvegarder vos notes
                            </div>
                        )}
                    </div>

                    <textarea
                        className={styles.notesTextarea}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Écrivez vos notes ici... 
                        
💡 Conseils:
• Notez les points importants
• Ajoutez vos propres exemples
• Posez-vous des questions
• Résumez avec vos mots"
                    />

                    <div className={styles.notesFooter}>
                        {hasUnsavedChanges && (
                            <span className={styles.unsavedText}>
                                {autoSaving ? 'Auto-sauvegarde en cours...' : 'Modifications non sauvegardées'}
                            </span>
                        )}
                        <button
                            className={styles.saveButton}
                            onClick={handleSave}
                            disabled={loading || !hasUnsavedChanges || autoSaving}
                        >
                            <Save size={18} />
                            {loading ? 'Sauvegarde...' : autoSaving ? 'Auto-sauvegarde...' : 'Sauvegarder'}
                        </button>
                    </div>

                    <div className={styles.charCount}>
                        {notes.length} caractères
                        {hasUnsavedChanges && ' • Non sauvegardé'}
                        {user && ' • Ctrl+S pour sauvegarder'}
                    </div>
                </div>
            )}
        </>
    );
}
