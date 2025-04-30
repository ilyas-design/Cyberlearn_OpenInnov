"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getIconByName } from "../../utils/iconMapping";
import styles from "./LessonPage.module.css";
import { ArrowLeft, Check, X } from "lucide-react";
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/app/firebase/config';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

interface Section {
    title: string;
    content: string;
}

interface Question {
    id: string;
    text: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
}

interface LessonContent {
    sections: Section[];
    questions: Question[];
}

interface Lesson {
    id: string;
    title: string;
    description: string;
    category: string;
    iconName: string;
    locked: boolean;
    tags: string[];
    content?: LessonContent;
}

export default function LessonDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [lesson, setLesson] = useState<Lesson | null>(null);
    const [content, setContent] = useState<LessonContent | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [activeSection, setActiveSection] = useState<number>(0);
    const [showQuiz, setShowQuiz] = useState<boolean>(false);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [showExplanation, setShowExplanation] = useState<boolean>(false);
    const [quizScore, setQuizScore] = useState<number>(0);
    const [quizCompleted, setQuizCompleted] = useState<boolean>(false);

    useEffect(() => {
        const fetchLesson = async () => {
            if (!params.id || typeof params.id !== 'string') {
                setError("ID de leçon invalide");
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const lessonDoc = await getDoc(doc(db, 'lessons', params.id));
                const contentDoc = await getDoc(doc(db, 'lessonContents', params.id));

                if (!lessonDoc.exists()) {
                    setError("Leçon non trouvée");
                    setLoading(false);
                    return;
                }

                const lessonData = lessonDoc.data() as Lesson;
                if (lessonData.locked) {
                    setError("Cette leçon est verrouillée");
                    setLoading(false);
                    return;
                }

                setLesson(lessonData);

                if (contentDoc.exists()) {
                    const contentData = contentDoc.data() as LessonContent;
                    setContent(contentData);
                } else {
                    setError("Contenu de la leçon non disponible");
                }

                setLoading(false);
            } catch (err) {
                console.error("Erreur lors du chargement de la leçon:", err);
                setError("Impossible de charger la leçon. Veuillez réessayer plus tard.");
                setLoading(false);
            }
        };

        fetchLesson();
    }, [params.id]);

    const handleSectionChange = (index: number) => {
        setActiveSection(index);
    };

    const goBack = () => {
        router.push('/lessons');
    };

    const handleQuizStart = () => {
        setShowQuiz(true);
        setCurrentQuestionIndex(0);
        setSelectedAnswer(null);
        setShowExplanation(false);
        setQuizScore(0);
        setQuizCompleted(false);
    };

    const handleAnswerSelect = (index: number) => {
        if (!showExplanation) {
            setSelectedAnswer(index);
            setShowExplanation(true);
            
            if (index === content?.questions[currentQuestionIndex].correctAnswer) {
                setQuizScore(prev => prev + 1);
            }
        }
    };

    const handleNextQuestion = () => {
        if (currentQuestionIndex < (content?.questions.length || 0) - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            setSelectedAnswer(null);
            setShowExplanation(false);
        } else {
            setQuizCompleted(true);
        }
    };

    if (loading) {
        return (
            <div className={styles.loading}>
                <div className={styles.loadingSpinner}></div>
                <p>Chargement de la leçon...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.error}>
                <p>{error}</p>
                <button className={styles.backButton} onClick={goBack}>
                    <ArrowLeft size={16} />
                    Retour aux leçons
                </button>
            </div>
        );
    }

    if (!lesson || !content) {
        return (
            <div className={styles.error}>
                <p>Contenu de la leçon non disponible</p>
                <button className={styles.backButton} onClick={goBack}>
                    <ArrowLeft size={16} />
                    Retour aux leçons
                </button>
            </div>
        );
    }

    return (
        <div className={styles.lessonPage}>
            <div className={styles.lessonHeader}>
                <button className={styles.backButton} onClick={goBack}>
                    <ArrowLeft size={16} />
                    Retour aux leçons
                </button>
                <div className={styles.lessonInfo}>
                    <div className={styles.categoryTag}>
                        {getIconByName(lesson.iconName)}
                        <span>{lesson.category}</span>
                    </div>
                    <h1>{lesson.title}</h1>
                    <p className={styles.description}>{lesson.description}</p>
                    <div className={styles.tags}>
                        {lesson.tags && lesson.tags.map((tag) => (
                            <span key={tag} className={styles.tag}>{tag}</span>
                        ))}
                    </div>
                </div>
            </div>

            <div className={styles.lessonContent}>
                <nav className={styles.sectionNav}>
                    {content.sections.map((section, index) => (
                        <button
                            key={index}
                            className={`${styles.sectionButton} ${activeSection === index ? styles.active : ''}`}
                            onClick={() => handleSectionChange(index)}
                        >
                            {section.title}
                        </button>
                    ))}
                    {content.questions.length > 0 && (
                        <button
                            className={`${styles.sectionButton} ${showQuiz ? styles.active : ''} ${styles.quizButton}`}
                            onClick={handleQuizStart}
                        >
                            Quiz
                        </button>
                    )}
                </nav>

                {showQuiz ? (
                    <div className={styles.quizContainer}>
                        {!quizCompleted ? (
                            <>
                                <div className={styles.quizProgress}>
                                    Question {currentQuestionIndex + 1} sur {content.questions.length}
                                </div>
                                <div className={styles.questionContainer}>
                                    <h3 className={styles.questionText}>
                                        {content.questions[currentQuestionIndex].text}
                                    </h3>
                                    <div className={styles.optionsContainer}>
                                        {content.questions[currentQuestionIndex].options.map((option, index) => (
                                            <button
                                                key={index}
                                                className={`${styles.optionButton} ${
                                                    selectedAnswer === index
                                                        ? index === content.questions[currentQuestionIndex].correctAnswer
                                                            ? styles.correct
                                                            : styles.incorrect
                                                        : ''
                                                }`}
                                                onClick={() => handleAnswerSelect(index)}
                                                disabled={showExplanation}
                                            >
                                                {option}
                                                {showExplanation && selectedAnswer === index && (
                                                    <span className={styles.answerIcon}>
                                                        {index === content.questions[currentQuestionIndex].correctAnswer ? (
                                                            <Check size={16} />
                                                        ) : (
                                                            <X size={16} />
                                                        )}
                                                    </span>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                    {showExplanation && (
                                        <div className={styles.explanationContainer}>
                                            <p className={styles.explanation}>
                                                {content.questions[currentQuestionIndex].explanation}
                                            </p>
                                            <button
                                                className={styles.nextButton}
                                                onClick={handleNextQuestion}
                                            >
                                                {currentQuestionIndex < (content.questions.length || 0) - 1
                                                    ? "Question suivante"
                                                    : "Terminer le quiz"}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className={styles.quizResults}>
                                <h3>Quiz terminé !</h3>
                                <p className={styles.score}>
                                    Votre score : {quizScore} / {content.questions.length}
                                </p>
                                <p className={styles.percentage}>
                                    {Math.round((quizScore / (content.questions.length || 1)) * 100)}%
                                </p>
                                <button
                                    className={styles.retryButton}
                                    onClick={handleQuizStart}
                                >
                                    Recommencer le quiz
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className={styles.sectionContent}>
                        <h2 className={styles.sectionTitle}>
                            {content.sections[activeSection].title}
                        </h2>
                        <div className={styles.markdownContainer}>
                            <ReactMarkdown
                                children={content.sections[activeSection].content}
                                remarkPlugins={[remarkGfm, remarkMath]}
                                rehypePlugins={[rehypeKatex]}
                                components={{
                                    code: ({ className, children }) => {
                                        const match = /language-(\w+)/.exec(className || '');
                                        return match ? (
                                            <pre className={styles.codeBlock}>
                                                <code className={className}>
                                                    {String(children).replace(/\n$/, '')}
                                                </code>
                                            </pre>
                                        ) : (
                                            <code className={className}>
                                                {String(children)}
                                            </code>
                                        );
                                    }
                                }}
                            />
                        </div>
                        <div className={styles.navigationButtons}>
                            <button
                                className={styles.navButton}
                                disabled={activeSection === 0}
                                onClick={() => handleSectionChange(activeSection - 1)}
                            >
                                Section précédente
                            </button>
                            <button
                                className={styles.navButton}
                                disabled={activeSection === (content.sections.length || 0) - 1}
                                onClick={() => handleSectionChange(activeSection + 1)}
                            >
                                Section suivante
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
} 