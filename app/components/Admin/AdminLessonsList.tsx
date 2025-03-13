"use client";

import React, { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  doc,
  deleteDoc,
  query,
  orderBy
} from "firebase/firestore";
import { db } from "../../firebase/config";
import { Lesson } from "../../firebase/lessons";
import { getIconByName } from "../../utils/iconMapping";
import { Edit, Trash2, Plus, Search, Filter, Eye } from "lucide-react";
import AdminLessonForm from "./AdminLessonForm";
import styles from "./AdminComponents.module.css";

const AdminLessonsList: React.FC = () => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [filteredLessons, setFilteredLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("Toutes");
  const [categories, setCategories] = useState<string[]>([]);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  // Charger les leçons
  useEffect(() => {
    const fetchLessons = async () => {
      try {
        setLoading(true);
        const lessonsQuery = query(collection(db, "lessons"), orderBy("order", "asc"));
        const querySnapshot = await getDocs(lessonsQuery);

        const lessonsData: Lesson[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data() as Lesson;
          lessonsData.push({
            ...data,
            id: doc.id
          });
        });

        setLessons(lessonsData);
        setFilteredLessons(lessonsData);

        // Extraire les catégories uniques
        const uniqueCategories = Array.from(
          new Set(lessonsData.map(lesson => lesson.category))
        );
        setCategories(["Toutes", ...uniqueCategories]);

        setLoading(false);
      } catch (err) {
        console.error("Erreur lors du chargement des leçons:", err);
        setError("Impossible de charger les leçons. Veuillez réessayer plus tard.");
        setLoading(false);
      }
    };

    fetchLessons();
  }, []);

  // Filtrer les leçons
  useEffect(() => {
    let result = [...lessons];

    // Filtrer par catégorie
    if (selectedCategory !== "Toutes") {
      result = result.filter(lesson => lesson.category === selectedCategory);
    }

    // Filtrer par terme de recherche
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        lesson =>
          lesson.title.toLowerCase().includes(term) ||
          lesson.description.toLowerCase().includes(term) ||
          lesson.tags.some(tag => tag.toLowerCase().includes(term))
      );
    }

    setFilteredLessons(result);
  }, [lessons, searchTerm, selectedCategory]);

  // Supprimer une leçon
  const handleDeleteLesson = async (lessonId: string) => {
    try {
      // Supprimer la leçon
      await deleteDoc(doc(db, "lessons", lessonId));

      // Supprimer également le contenu de la leçon
      await deleteDoc(doc(db, "lessonContents", lessonId));

      // Mettre à jour la liste des leçons
      setLessons(prevLessons => prevLessons.filter(lesson => lesson.id !== lessonId));
      setConfirmDelete(null);
    } catch (err) {
      console.error("Erreur lors de la suppression de la leçon:", err);
      setError("Impossible de supprimer la leçon. Veuillez réessayer plus tard.");
    }
  };

  // Éditer une leçon
  const handleEditLesson = (lesson: Lesson) => {
    setEditingLesson(lesson);
    setShowForm(true);
  };

  // Ajouter une nouvelle leçon
  const handleAddLesson = () => {
    setEditingLesson(null);
    setShowForm(true);
  };

  // Voir une leçon
  const handleViewLesson = (lessonId: string) => {
    window.open(`/lessons/${lessonId}`, '_blank');
  };

  // Fermer le formulaire
  const handleCloseForm = () => {
    setShowForm(false);
    setEditingLesson(null);
  };

  // Mettre à jour la liste après ajout/modification
  const handleLessonSaved = (savedLesson: Lesson) => {
    if (editingLesson) {
      // Mise à jour d'une leçon existante
      setLessons(prevLessons =>
        prevLessons.map(lesson =>
          lesson.id === savedLesson.id ? savedLesson : lesson
        )
      );
    } else {
      // Ajout d'une nouvelle leçon
      setLessons(prevLessons => [...prevLessons, savedLesson]);
    }

    setShowForm(false);
    setEditingLesson(null);
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Chargement des leçons...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <p className={styles.errorMessage}>{error}</p>
        <button
          className={styles.retryButton}
          onClick={() => window.location.reload()}
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className={styles.adminLessonsContainer}>
      {showForm ? (
        <AdminLessonForm
          lesson={editingLesson}
          onSave={handleLessonSaved}
          onCancel={handleCloseForm}
          categories={categories.filter(cat => cat !== "Toutes")}
        />
      ) : (
        <>
          <div className={styles.adminLessonsHeader}>
            <h2 className={styles.adminLessonsTitle}>Gestion des Leçons</h2>
            <button
              className={styles.addButton}
              onClick={handleAddLesson}
            >
              <Plus size={18} />
              <span>Ajouter une leçon</span>
            </button>
          </div>

          <div className={styles.adminLessonsFilters}>
            <div className={styles.searchContainer}>
              <Search size={18} className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Rechercher une leçon..."
                className={styles.searchInput}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className={styles.categoryFilter}>
              <Filter size={18} className={styles.filterIcon} />
              <select
                className={styles.categorySelect}
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {filteredLessons.length === 0 ? (
            <div className={styles.noLessonsContainer}>
              <p>Aucune leçon trouvée.</p>
              <button
                className={styles.addButton}
                onClick={handleAddLesson}
              >
                <Plus size={18} />
                <span>Ajouter une leçon</span>
              </button>
            </div>
          ) : (
            <div className={styles.lessonsTable}>
              <div className={styles.tableHeader}>
                <div className={styles.tableCell}>Titre</div>
                <div className={styles.tableCell}>Catégorie</div>
                <div className={styles.tableCell}>Tags</div>
                <div className={styles.tableCell}>Statut</div>
                <div className={styles.tableCell}>Actions</div>
              </div>

              {filteredLessons.map((lesson) => (
                <div key={lesson.id} className={styles.tableRow}>
                  <div className={styles.tableCell}>
                    <div className={styles.lessonTitle}>
                      {getIconByName(lesson.iconName)}
                      <span>{lesson.title}</span>
                    </div>
                  </div>

                  <div className={styles.tableCell}>
                    <span className={styles.categoryBadge}>{lesson.category}</span>
                  </div>

                  <div className={styles.tableCell}>
                    <div className={styles.tagsList}>
                      {lesson.tags.map((tag) => (
                        <span key={tag} className={styles.tagBadge}>{tag}</span>
                      ))}
                    </div>
                  </div>

                  <div className={styles.tableCell}>
                    <span className={`${styles.statusBadge} ${lesson.locked ? styles.locked : styles.published}`}>
                      {lesson.locked ? "Verrouillée" : "Publiée"}
                    </span>
                  </div>

                  <div className={styles.tableCell}>
                    <div className={styles.actionButtons}>
                      <button
                        className={styles.actionButton}
                        onClick={() => handleViewLesson(lesson.id)}
                        title="Voir la leçon"
                      >
                        <Eye size={18} />
                      </button>

                      <button
                        className={styles.actionButton}
                        onClick={() => handleEditLesson(lesson)}
                        title="Modifier la leçon"
                      >
                        <Edit size={18} />
                      </button>

                      {confirmDelete === lesson.id ? (
                        <div className={styles.confirmDelete}>
                          <span>Confirmer ?</span>
                          <button
                            className={styles.confirmYes}
                            onClick={() => handleDeleteLesson(lesson.id)}
                          >
                            Oui
                          </button>
                          <button
                            className={styles.confirmNo}
                            onClick={() => setConfirmDelete(null)}
                          >
                            Non
                          </button>
                        </div>
                      ) : (
                        <button
                          className={styles.actionButton}
                          onClick={() => setConfirmDelete(lesson.id)}
                          title="Supprimer la leçon"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminLessonsList; 