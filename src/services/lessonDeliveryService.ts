import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  getDocs, 
  query, 
  where
} from "firebase/firestore";
import { db, auth } from "../firebase";
import { stripUndefined, callWithRetry } from "../lib/utils";
import { 
  SavedLesson, 
  LessonResourceNew, 
  LessonResourceType,
  getClassId,
  GradeLevel
} from "../types";

import { generateResource as generateAiResource } from "./gemini";

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const lessonDeliveryService = {
  async generateMissingResources(lesson: SavedLesson) {
    const resourceTypes: LessonResourceType[] = [
      'lesson_overview',
      'lesson_plan',
      'teacher_script',
      'board_plan',
      'demonstration',
      'visual_aids',
      'materials_prep',
      'worksheets',
      'assessment',
      'homework',
      'differentiation',
      'classroom_management'
    ];

    const lessonId = lesson.id || (lesson as any).lesson_plan_id || (lesson as any)._id;
    if (!lessonId) {
      console.warn("generateMissingResources called with missing lesson id");
      return;
    }

    const existingResources = await this.getLessonResources(lessonId);
    const existingTypes = new Set(existingResources.map(r => r.resource_type));

    for (const type of resourceTypes) {
      if (!existingTypes.has(type)) {
        try {
          await this.generateResource(lesson, type);
          // Add a baseline delay to avoid hitting RPM limits (15 RPM is 1 req / 4s)
          // We wait 3s here, plus the time the request took, should be safe.
          await wait(3000); 
        } catch (error) {
          console.error(`Failed to generate ${type}:`, error);
          // Small extra wait on failure before trying next resource type
          await wait(2000);
        }
      }
    }
  },

  async getLessonResources(lessonId: string): Promise<LessonResourceNew[]> {
    if (!lessonId) return [];
    const q = query(collection(db, 'lesson_resources_new'), where('lesson_id', '==', lessonId));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as LessonResourceNew));
  },

  async generateResource(lesson: SavedLesson, type: LessonResourceType): Promise<void> {
    const lessonId = lesson.id || (lesson as any).lesson_plan_id || (lesson as any)._id;
    if (!lessonId) {
      console.warn("generateResource called with missing lesson id", lesson);
      return;
    }
    const aiContent = await generateAiResource(type, lesson);
    const resolvedGrade = (lesson.grade || lesson.class_id) as GradeLevel;
    const resolvedClassId = lesson.classId || (resolvedGrade ? getClassId(resolvedGrade) : undefined);

    const resource: Omit<LessonResourceNew, 'id'> = {
      lesson_id: lessonId,
      classId: resolvedClassId,
      className: lesson.className || resolvedGrade,
      grade: resolvedGrade,
      userId: auth.currentUser?.uid || lesson.createdBy,
      resource_type: type,
      title: type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      content: aiContent,
      generated_by_ai: true,
      editable: true,
      version: 1,
      updated_at: new Date().toISOString(),
      createdBy: auth.currentUser?.uid || lesson.createdBy,
      createdAt: new Date().toISOString()
    };

    await addDoc(collection(db, 'lesson_resources_new'), stripUndefined(resource));
  },

  async updateResource(resourceId: string, updates: Partial<LessonResourceNew>) {
    const ref = doc(db, 'lesson_resources_new', resourceId);
    await updateDoc(ref, {
      ...updates,
      updated_at: new Date().toISOString()
    });
  }
};
