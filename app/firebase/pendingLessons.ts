import { db } from "./config";
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  query,
  where,
  orderBy,
  updateDoc,
  setDoc,
  deleteDoc,
  Timestamp,
} from "firebase/firestore";
import { Lesson, LessonContent } from "./lessons";

export type PendingLessonStatus = "pending" | "approved" | "rejected";

export interface PendingLesson {
  id: string;
  status: PendingLessonStatus;
  lessonId: string;
  title: string;
  description: string;
  category: string;
  iconName: string;
  locked: boolean;
  tags: string[];
  order: number;
  levelRequired: number;
  xpReward: number;
  content: LessonContent;
  submittedBy: string;
  submittedByEmail: string;
  submittedByUsername: string;
  submittedAt: Timestamp;
  reviewedAt?: Timestamp;
  reviewedBy?: string;
  rejectionReason?: string;
}

export interface SubmitPendingLessonInput {
  lesson: Lesson;
  content: LessonContent;
  submittedBy: string;
  submittedByEmail: string;
  submittedByUsername: string;
}

export async function submitPendingLesson(input: SubmitPendingLessonInput): Promise<string> {
  const docRef = await addDoc(collection(db, "pendingLessons"), {
    status: "pending",
    lessonId: input.lesson.id,
    title: input.lesson.title,
    description: input.lesson.description,
    category: input.lesson.category,
    iconName: input.lesson.iconName,
    locked: input.lesson.locked,
    tags: input.lesson.tags,
    order: input.lesson.order,
    levelRequired: input.lesson.levelRequired,
    xpReward: input.lesson.xpReward,
    content: input.content,
    submittedBy: input.submittedBy,
    submittedByEmail: input.submittedByEmail,
    submittedByUsername: input.submittedByUsername,
    submittedAt: Timestamp.now(),
  });
  return docRef.id;
}

export async function updatePendingLesson(
  pendingId: string,
  lesson: Lesson,
  content: LessonContent
): Promise<void> {
  const pendingRef = doc(db, "pendingLessons", pendingId);
  await updateDoc(pendingRef, {
    lessonId: lesson.id,
    title: lesson.title,
    description: lesson.description,
    category: lesson.category,
    iconName: lesson.iconName,
    locked: lesson.locked,
    tags: lesson.tags,
    order: lesson.order,
    levelRequired: lesson.levelRequired,
    xpReward: lesson.xpReward,
    content,
  });
}

export async function getPendingLessonsByTeacher(teacherId: string): Promise<PendingLesson[]> {
  const q = query(
    collection(db, "pendingLessons"),
    where("submittedBy", "==", teacherId),
    orderBy("submittedAt", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as PendingLesson));
}

export async function getAllPendingLessons(): Promise<PendingLesson[]> {
  const q = query(
    collection(db, "pendingLessons"),
    where("status", "==", "pending"),
    orderBy("submittedAt", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as PendingLesson));
}

export async function getPendingLessonById(pendingId: string): Promise<PendingLesson | null> {
  const snap = await getDoc(doc(db, "pendingLessons", pendingId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as PendingLesson;
}

export async function approvePendingLesson(
  pending: PendingLesson,
  adminId: string
): Promise<void> {
  const lessonRef = doc(db, "lessons", pending.lessonId);
  const contentRef = doc(db, "lessonContents", pending.lessonId);
  const pendingRef = doc(db, "pendingLessons", pending.id);

  await setDoc(lessonRef, {
    title: pending.title,
    description: pending.description,
    category: pending.category,
    iconName: pending.iconName,
    locked: pending.locked,
    tags: pending.tags,
    order: pending.order,
    levelRequired: pending.levelRequired,
    xpReward: pending.xpReward,
  });

  await setDoc(contentRef, {
    sections: pending.content.sections,
    questions: pending.content.questions,
  });

  await updateDoc(pendingRef, {
    status: "approved",
    reviewedAt: Timestamp.now(),
    reviewedBy: adminId,
  });
}

export async function rejectPendingLesson(
  pendingId: string,
  adminId: string,
  reason?: string
): Promise<void> {
  await updateDoc(doc(db, "pendingLessons", pendingId), {
    status: "rejected",
    reviewedAt: Timestamp.now(),
    reviewedBy: adminId,
    rejectionReason: reason?.trim() || null,
  });
}

export async function deletePendingLesson(pendingId: string): Promise<void> {
  await deleteDoc(doc(db, "pendingLessons", pendingId));
}
