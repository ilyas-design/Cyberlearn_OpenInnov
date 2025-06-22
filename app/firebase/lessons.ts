import { db } from './config';
import { 
    collection, 
    getDocs, 
    getDoc, 
    doc, 
    query, 
    where,
    orderBy,
    DocumentData,
    QueryDocumentSnapshot
} from 'firebase/firestore';

// Interface pour les questions
export interface Question {
    id: string;
    text: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
}

// Interface pour le contenu des leçons
export interface LessonContent {
    sections: {
        title: string;
        content: string;
    }[];
    questions: Question[];
}

// Interface pour les leçons
export interface Lesson {
    id: string;
    category: string;
    title: string;
    description: string;
    iconName: string;
    locked: boolean;
    tags: string[];
    order: number;
    levelRequired: number; // Niveau requis pour accéder à la leçon
    xpReward: number; // XP gagnée à la réussite du quiz
    content?: LessonContent;
}

// Convertir un document Firestore en objet Lesson
const convertLesson = (doc: QueryDocumentSnapshot<DocumentData>): Lesson => {
    const data = doc.data();
    return {
        id: doc.id,
        category: data.category || '',
        title: data.title || '',
        description: data.description || '',
        iconName: data.iconName || 'BookOpen',
        locked: data.locked || false,
        tags: data.tags || [],
        order: data.order || 0,
        levelRequired: data.levelRequired ?? 1,
        xpReward: data.xpReward ?? 50,
        // Le contenu détaillé n'est pas chargé ici pour des raisons de performance
    };
};

// Récupérer toutes les leçons
export const getAllLessons = async (): Promise<Lesson[]> => {
    try {
        const lessonsQuery = query(
            collection(db, 'lessons'),
            orderBy('order', 'asc')
        );
        const querySnapshot = await getDocs(lessonsQuery);
        return querySnapshot.docs.map(convertLesson);
    } catch (error) {
        console.error("Erreur lors de la récupération des leçons:", error);
        return [];
    }
};

// Récupérer les leçons par catégorie
export const getLessonsByCategory = async (category: string): Promise<Lesson[]> => {
    try {
        const lessonsQuery = query(
            collection(db, 'lessons'),
            where('category', '==', category),
            orderBy('order', 'asc')
        );
        const querySnapshot = await getDocs(lessonsQuery);
        return querySnapshot.docs.map(convertLesson);
    } catch (error) {
        console.error(`Erreur lors de la récupération des leçons de la catégorie ${category}:`, error);
        return [];
    }
};

// Récupérer les leçons par tag
export const getLessonsByTag = async (tag: string): Promise<Lesson[]> => {
    try {
        const lessonsQuery = query(
            collection(db, 'lessons'),
            where('tags', 'array-contains', tag),
            orderBy('order', 'asc')
        );
        const querySnapshot = await getDocs(lessonsQuery);
        return querySnapshot.docs.map(convertLesson);
    } catch (error) {
        console.error(`Erreur lors de la récupération des leçons avec le tag ${tag}:`, error);
        return [];
    }
};

// Récupérer une leçon par ID avec son contenu complet
export const getLessonById = async (lessonId: string): Promise<Lesson | null> => {
    try {
        const lessonDoc = await getDoc(doc(db, 'lessons', lessonId));
        
        if (!lessonDoc.exists()) {
            return null;
        }
        
        const lessonData = lessonDoc.data();
        
        // Récupérer le contenu détaillé de la leçon
        const contentDoc = await getDoc(doc(db, 'lessonContents', lessonId));
        let content: LessonContent | undefined = undefined;
        
        if (contentDoc.exists()) {
            const contentData = contentDoc.data();
            content = {
                sections: contentData.sections || [],
                questions: contentData.questions || []
            };
        }
        
        return {
            id: lessonDoc.id,
            category: lessonData.category || '',
            title: lessonData.title || '',
            description: lessonData.description || '',
            iconName: lessonData.iconName || 'BookOpen',
            locked: lessonData.locked || false,
            tags: lessonData.tags || [],
            order: lessonData.order || 0,
            levelRequired: lessonData.levelRequired ?? 1,
            xpReward: lessonData.xpReward ?? 50,
            content: content
        };
    } catch (error) {
        console.error(`Erreur lors de la récupération de la leçon ${lessonId}:`, error);
        return null;
    }
}; 