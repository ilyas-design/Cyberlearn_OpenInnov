"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  doc,
  setDoc,
  collection,
  getDocs,
  query,
  orderBy,
  getDoc,
  updateDoc
} from "firebase/firestore";
import { db } from "../../firebase/config";
import { Lesson, LessonContent, Question } from "../../firebase/lessons";
import { X, Plus, Save, ArrowLeft, Lock, Unlock, Edit } from "lucide-react";
import styles from "./AdminComponents.module.css";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { toast } from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid'; // Ajout de l'import pour uuidv4

interface AdminLessonFormProps {
  lesson: Lesson | null;
  onSave: (lesson: Lesson) => void;
  onCancel: () => void;
  categories: string[];
}

const defaultContent: LessonContent = {
  sections: [{
    title: "Introduction",
    content: `# Introduction

Commencez votre leçon ici...

## Sous-titre

Vous pouvez utiliser la syntaxe Markdown pour formater votre contenu :

- Points clés
- Exemples
- Code

\`\`\`python
def exemple():
    print("Hello, World!")
\`\`\`

### Formules mathématiques

Vous pouvez aussi inclure des formules mathématiques :

$E = mc^2$

Et des diagrammes avec Mermaid :

\`\`\`mermaid
graph TD
    A[Start] --> B{Decision}
    B -->|Yes| C[OK]
    B -->|No| D[Cancel]
\`\`\`
`
  }],
  questions: []
};

const AdminLessonForm: React.FC<AdminLessonFormProps> = ({
  lesson,
  onSave,
  onCancel,
  categories: initialCategories
}) => {
  const [formData, setFormData] = useState<Partial<Lesson>>({
    id: "",
    title: "",
    description: "",
    category: "",
    iconName: "BookOpen",
    locked: false,
    tags: [],
    order: 0,
    levelRequired: 1,
    xpReward: 50
  });

  const [categories, setCategories] = useState<string[]>(initialCategories);
  const [newTag, setNewTag] = useState<string>("");
  const [newCategory, setNewCategory] = useState<string>("");
  const [showCategoryInput, setShowCategoryInput] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [contentData, setContentData] = useState<LessonContent>(defaultContent);
  const [activeSection, setActiveSection] = useState<number>(0);
  const [showContentEditor, setShowContentEditor] = useState<boolean>(false);
  const [showQuizEditor, setShowQuizEditor] = useState<boolean>(false);
  const [newQuestion, setNewQuestion] = useState<Question>({
    id: uuidv4(),
    text: "",
    options: ["", "", "", ""],
    correctAnswer: 0,
    explanation: ""
  });
  const [formErrors, setFormErrors] = useState<string[]>([]); // Add this line
  const isMounted = useRef(false);

  // Icônes disponibles
  const availableIcons = [
    "BookOpen", "Code", "Network", "Users", "Lock",
    "Shield", "Database", "Globe", "Server", "Cpu",
    "Terminal", "FileCode", "AlertTriangle", "Key"
  ];

  // Initialiser le formulaire avec les données de la leçon si en mode édition
  useEffect(() => {
    isMounted.current = true;
    if (lesson) {
      loadLesson();
    } else {
      setLoading(false);
    }
    return () => {
      isMounted.current = false;
    };
  }, [lesson]);

  const loadLesson = async () => {
    try {
      if (!lesson) return;

      // Charger les données de base de la leçon
      setFormData({
        id: lesson.id,
        title: lesson.title,
        description: lesson.description,
        category: lesson.category,
        iconName: lesson.iconName,
        locked: lesson.locked,
        tags: [...lesson.tags],
        order: lesson.order,
        levelRequired: lesson.levelRequired,
        xpReward: lesson.xpReward
      });

      // Charger le contenu de la leçon
      const contentDoc = await getDoc(doc(db, "lessonContents", lesson.id));
      if (contentDoc.exists() && isMounted.current) {
        const content = contentDoc.data() as LessonContent;
        setContentData(content);
      }
    } catch (err) {
      console.error("Erreur lors du chargement de la leçon:", err);
      setError("Impossible de charger la leçon");
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  };

  // Gérer les changements dans le formulaire
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Gérer le changement de l'icône
  const handleIconChange = (iconName: string) => {
    setFormData(prev => ({ ...prev, iconName }));
  };

  // Gérer le changement du statut (verrouillé/déverrouillé)
  const handleLockToggle = () => {
    setFormData(prev => ({ ...prev, locked: !prev.locked }));
  };

  // Ajouter un tag
  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags?.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), newTag.trim()]
      }));
      setNewTag("");
    }
  };

  // Supprimer un tag
  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
    }));
  };

  // Ajouter une nouvelle catégorie
  const handleAddCategory = () => {
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      setFormData(prev => ({ ...prev, category: newCategory.trim() }));
      setCategories(prev => [...prev, newCategory.trim()]);
      setNewCategory("");
      setShowCategoryInput(false);
    }
  };

  // Gérer les changements dans l'éditeur de contenu
  const handleSectionTitleChange = (index: number, title: string) => {
    const updatedSections = [...contentData.sections];
    updatedSections[index].title = title;
    setContentData({ ...contentData, sections: updatedSections });
  };

  const handleSectionContentChange = (index: number, content: string) => {
    const updatedSections = [...contentData.sections];
    updatedSections[index].content = content;
    setContentData({ ...contentData, sections: updatedSections });
  };

  // Ajouter une nouvelle section
  const handleAddSection = () => {
    setContentData({
      ...contentData,
      sections: [
        ...contentData.sections,
        { title: `Section ${contentData.sections.length + 1}`, content: "# Nouvelle section\n\nContenu de la section..." }
      ]
    });
    setActiveSection(contentData.sections.length);
  };

  // Supprimer une section
  const handleRemoveSection = (index: number) => {
    if (contentData.sections.length > 1) {
      const updatedSections = contentData.sections.filter((_, i) => i !== index);
      setContentData({ ...contentData, sections: updatedSections });

      if (activeSection >= updatedSections.length) {
        setActiveSection(updatedSections.length - 1);
      }
    }
  };

  // Gérer les questions du quiz
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Modifiez la fonction handleAddQuestion pour gérer aussi l'édition
  const handleAddQuestion = () => {
    // Validation
    const errors = [];
    if (!newQuestion.text.trim()) errors.push("Le texte de la question est requis");
    if (newQuestion.options.some(opt => !opt.trim())) errors.push("Toutes les options doivent être remplies");
    if (newQuestion.correctAnswer === null) errors.push("Vous devez sélectionner une réponse correcte");
    
    if (errors.length > 0) {
      setFormErrors(errors);
      return;
    }
    
    if (isEditing && editingQuestionId) {
      // Mise à jour d'une question existante
      const updatedQuestions = contentData.questions.map(q => 
        q.id === editingQuestionId ? { ...newQuestion, id: editingQuestionId } : q
      );
      
      setContentData({
        ...contentData,
        questions: updatedQuestions
      });
      
      // Réinitialiser le formulaire et l'état d'édition
      setNewQuestion({
        id: uuidv4(),
        text: '',
        options: ['', '', '', ''],
        correctAnswer: 0,
        explanation: ''
      });
      setEditingQuestionId(null);
      setIsEditing(false);
      setFormErrors([]);
      toast.success("Question modifiée avec succès");
    } else {
      // Ajout d'une nouvelle question
      setContentData({
        ...contentData,
        questions: [...contentData.questions, {
          ...newQuestion,
          id: newQuestion.id || uuidv4() // Assurez-vous qu'il y a toujours un ID
        } as Question]
      });
      
      // Réinitialiser le formulaire
      setNewQuestion({
        id: uuidv4(),
        text: '',
        options: ['', '', '', ''],
        correctAnswer: 0,
        explanation: ''
      });
      setFormErrors([]);
      toast.success("Question ajoutée avec succès");
    }
  };
  
  // Ajoutez cette nouvelle fonction pour éditer une question existante
  const handleEditQuestion = (questionId: string) => {
    const questionToEdit = contentData.questions.find(q => q.id === questionId);
    if (questionToEdit) {
      setNewQuestion({
        ...questionToEdit
      });
      setEditingQuestionId(questionId);
      setIsEditing(true);
      
      // Faire défiler jusqu'au formulaire d'édition
      const formElement = document.querySelector(`.${styles.questionForm}`);
      if (formElement) {
        formElement.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };
  
  // Ajoutez cette fonction pour annuler l'édition
  const handleCancelEdit = () => {
    setNewQuestion({
      id: uuidv4(),
      text: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      explanation: ''
    });
    setEditingQuestionId(null);
    setIsEditing(false);
    setFormErrors([]);
  };
  const handleRemoveQuestion = (questionId: string) => {
    setContentData(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.id !== questionId)
    }));
  };

  const handleQuestionChange = (field: keyof Question, value: any) => {
    setNewQuestion(prev => ({ ...prev, [field]: value }));
  };

  const handleOptionChange = (index: number, value: string) => {
    setNewQuestion(prev => ({
      ...prev,
      options: prev.options?.map((opt, i) => i === index ? value : opt)
    }));
  };

  // Sauvegarder la leçon
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.description || !formData.category) {
      setError("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Préparer les données de la leçon
      const lessonData: Lesson = {
        id: formData.id || `lesson-${Date.now()}`,
        title: formData.title || "",
        description: formData.description || "",
        category: formData.category || "",
        iconName: formData.iconName || "BookOpen",
        locked: formData.locked || false,
        tags: formData.tags || [],
        order: formData.order || 0,
        levelRequired: formData.levelRequired || 1,
        xpReward: Number(formData.xpReward) || 0
      };

      const lessonRef = doc(db, "lessons", lessonData.id);
      const contentRef = doc(db, "lessonContents", lessonData.id);

      // Sauvegarder la leçon et son contenu
      await setDoc(lessonRef, {
        title: lessonData.title,
        description: lessonData.description,
        category: lessonData.category,
        iconName: lessonData.iconName,
        locked: lessonData.locked,
        tags: lessonData.tags,
        order: lessonData.order,
        levelRequired: lessonData.levelRequired,
        xpReward: lessonData.xpReward
      });

      await setDoc(contentRef, {
        sections: contentData.sections,
        questions: contentData.questions
      });

      // Notifier le parent
      onSave(lessonData);

      setLoading(false);
    } catch (err) {
      console.error("Erreur lors de la sauvegarde de la leçon:", err);
      setError("Impossible de sauvegarder la leçon. Veuillez réessayer plus tard.");
      setLoading(false);
    }
  };

  if (loading) {
    return <div className={styles.loading}>Chargement...</div>;
  }

  return (
    <div className={styles.adminLessonForm}>
      <div className={styles.formHeader}>
        <h2 className={styles.formTitle}>
          {lesson ? "Modifier la leçon" : "Ajouter une nouvelle leçon"}
        </h2>
        <button
          className={styles.cancelButton}
          onClick={onCancel}
          disabled={loading}
        >
          <X size={18} />
          <span>Annuler</span>
        </button>
      </div>

      {error && (
        <div className={styles.formError}>
          {error}
        </div>
      )}

      {!showContentEditor && !showQuizEditor ? (
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGrid}>
            <div className={styles.formColumn}>
              <div className={styles.formGroup}>
                <label htmlFor="title" className={styles.formLabel}>Titre *</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className={styles.formInput}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="description" className={styles.formLabel}>Description *</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className={styles.formTextarea}
                  rows={4}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Catégorie *</label>
                <div className={styles.categorySelectContainer}>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className={styles.formSelect}
                    required
                  >
                    <option value="">Sélectionner une catégorie</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className={styles.addButton}
                    onClick={() => setShowCategoryInput(true)}
                    title="Ajouter une nouvelle catégorie"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                {showCategoryInput && (
                  <div className={styles.categoryInputContainer}>
                    <input
                      type="text"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className={styles.formInput}
                      placeholder="Nouvelle catégorie..."
                    />
                    <button
                      type="button"
                      className={styles.addButton}
                      onClick={handleAddCategory}
                      title="Valider la nouvelle catégorie"
                    >
                      <span style={{display: 'flex', alignItems: 'center'}}>&#10003;</span>
                    </button>
                    <button
                      type="button"
                      className={styles.cancelButton}
                      onClick={() => setShowCategoryInput(false)}
                      title="Annuler"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Niveau requis *</label>
                <input
                  type="number"
                  name="levelRequired"
                  min={1}
                  value={formData.levelRequired ?? 1}
                  onChange={handleChange}
                  className={styles.formInput}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>XP gagnée *</label>
                <input
                  type="number"
                  name="xpReward"
                  min={0}
                  value={formData.xpReward ?? 50}
                  onChange={handleChange}
                  className={styles.formInput}
                  required
                />
              </div>
            </div>

            <div className={styles.formColumn}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Icône</label>
                <div className={styles.iconsGrid}>
                  {availableIcons.map((iconName) => (
                    <button
                      key={iconName}
                      type="button"
                      className={`${styles.iconButton} ${formData.iconName === iconName ? styles.activeIcon : ""}`}
                      onClick={() => handleIconChange(iconName)}
                    >
                      {iconName}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Tags</label>
                <div className={styles.tagsInputContainer}>
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    className={styles.formInput}
                    placeholder="Ajouter un tag..."
                  />
                  <button
                    type="button"
                    className={styles.addButton}
                    onClick={handleAddTag}
                  >
                    <Plus size={16} />
                  </button>
                </div>

                <div className={styles.tagsList}>
                  {formData.tags?.map((tag) => (
                    <div key={tag} className={styles.tag}>
                      <span>{tag}</span>
                      <button
                        type="button"
                        className={styles.removeTagButton}
                        onClick={() => handleRemoveTag(tag)}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Statut</label>
                <button
                  type="button"
                  className={`${styles.statusToggle} ${formData.locked ? styles.locked : styles.published}`}
                  onClick={handleLockToggle}
                >
                  {formData.locked ? (
                    <>
                      <Lock size={16} />
                      <span>Verrouillée</span>
                    </>
                  ) : (
                    <>
                      <Unlock size={16} />
                      <span>Publiée</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className={styles.formActions}>
            <button
              type="button"
              className={styles.contentButton}
              onClick={() => setShowContentEditor(true)}
            >
              <ArrowLeft size={18} />
              <span>Éditer le contenu</span>
            </button>
            <button
              type="button"
              className={styles.quizButton}
              onClick={() => setShowQuizEditor(true)}
            >
              <Plus size={18} />
              <span>Gérer le quiz</span>
            </button>
            <button
              type="submit"
              className={styles.saveButton}
              disabled={loading}
            >
              <Save size={18} />
              <span>{loading ? "Sauvegarde en cours..." : "Sauvegarder"}</span>
            </button>
          </div>
        </form>
      ) : showQuizEditor ? (
        <div className={styles.quizEditor}>
          <div className={styles.quizHeader}>
            <h3 className={styles.quizTitle}>Gestion du Quiz</h3>
            <button
              className={styles.backButton}
              onClick={() => setShowQuizEditor(false)}
            >
              <ArrowLeft size={18} />
              <span>Retour aux informations</span>
            </button>
          </div>

          <div className={styles.quizForm}>
            <div className={styles.questionForm}>
              <h4>{isEditing ? "Modifier la question" : "Ajouter une nouvelle question"}</h4>
              {formErrors.length > 0 && (
                <div className={styles.formError}>
                  {formErrors.map((error, index) => (
                    <p key={index}>{error}</p>
                  ))}
                </div>
              )}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Question</label>
                <textarea
                  value={newQuestion.text}
                  onChange={(e) => handleQuestionChange('text', e.target.value)}
                  className={styles.formTextarea}
                  rows={3}
                  placeholder="Entrez votre question..."
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Options de réponse</label>
                {newQuestion.options?.map((option, index) => (
                  <div key={index} className={styles.optionInput}>
                    <input
                      type="radio"
                      name="correctAnswer"
                      checked={newQuestion.correctAnswer === index}
                      onChange={() => handleQuestionChange('correctAnswer', index)}
                    />
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      className={styles.formInput}
                      placeholder={`Option ${index + 1}`}
                    />
                  </div>
                ))}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Explication</label>
                <textarea
                  value={newQuestion.explanation}
                  onChange={(e) => handleQuestionChange('explanation', e.target.value)}
                  className={styles.formTextarea}
                  rows={3}
                  placeholder="Expliquez la réponse correcte..."
                />
              </div>

              <button
                type="button"
                className={styles.addButton}
                onClick={handleAddQuestion}
              >
                <Plus size={16} />
                <span>Ajouter la question</span>
              </button>
            </div>

            <div className={styles.questionsList}>
              <h4>Questions du quiz</h4>
              {contentData.questions.map((question) => (
                <div key={question.id} className={styles.questionItem}>
                  <div className={styles.questionContent}>
                    <p className={styles.questionText}>{question.text}</p>
                    <ul className={styles.optionsList}>
                      {question.options.map((option, index) => (
                        <li
                          key={index}
                          className={`${styles.option} ${index === question.correctAnswer ? styles.correct : ''}`}
                        >
                          {option}
                        </li>
                      ))}
                    </ul>
                    <p className={styles.explanation}>{question.explanation}</p>
                  </div>
                  <div className={styles.questionActions}>
                    <button
                      className={styles.editButton}
                      onClick={() => handleEditQuestion(question.id)}
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      className={styles.removeButton}
                      onClick={() => handleRemoveQuestion(question.id)}
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className={styles.contentEditor}>
          <div className={styles.contentHeader}>
            <h3 className={styles.contentTitle}>Édition du contenu</h3>
            <button
              className={styles.backButton}
              onClick={() => setShowContentEditor(false)}
            >
              <ArrowLeft size={18} />
              <span>Retour aux informations</span>
            </button>
          </div>

          <div className={styles.contentContainer}>
            <div className={styles.sectionsList}>
              {contentData.sections.map((section, index) => (
                <div
                  key={index}
                  className={`${styles.sectionItem} ${activeSection === index ? styles.activeSection : ""}`}
                >
                  <button
                    className={styles.sectionButton}
                    onClick={() => setActiveSection(index)}
                  >
                    {section.title}
                  </button>

                  <button
                    className={styles.removeSectionButton}
                    onClick={() => handleRemoveSection(index)}
                    disabled={contentData.sections.length <= 1}
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}

              <button
                className={styles.addSectionButton}
                onClick={handleAddSection}
              >
                <Plus size={16} />
                <span>Ajouter une section</span>
              </button>
            </div>

            <div className={styles.editorLayout}>
              <div className={styles.editorContainer}>
                <div className={styles.sectionTitleInput}>
                  <label htmlFor="sectionTitle">Titre de la section</label>
                  <input
                    type="text"
                    id="sectionTitle"
                    value={contentData.sections[activeSection].title}
                    onChange={(e) => handleSectionTitleChange(activeSection, e.target.value)}
                    className={styles.formInput}
                  />
                </div>

                <div className={styles.markdownEditor}>
                  <div className={styles.editorPane}>
                    <label>Contenu (Markdown)</label>
                    <textarea
                      value={contentData.sections[activeSection].content}
                      onChange={(e) => handleSectionContentChange(activeSection, e.target.value)}
                      className={styles.markdownInput}
                      rows={20}
                    />
                  </div>

                  <div className={styles.previewPane}>
                    <label>Aperçu</label>
                    <div className={styles.markdownPreview}>
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm, remarkMath]}
                        rehypePlugins={[rehypeKatex]}
                      >
                        {contentData.sections[activeSection].content}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.contentActions}>
            <button
              type="button"
              className={styles.backButton}
              onClick={() => setShowContentEditor(false)}
            >
              <ArrowLeft size={18} />
              <span>Retour aux informations</span>
            </button>

            <button
              type="button"
              className={styles.saveButton}
              onClick={handleSubmit}
              disabled={loading}
            >
              <Save size={18} />
              <span>{loading ? "Sauvegarde en cours..." : "Sauvegarder"}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLessonForm;