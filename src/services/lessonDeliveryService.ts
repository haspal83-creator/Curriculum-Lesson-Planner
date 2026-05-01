import { GoogleGenAI, Type } from "@google/genai";
import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  getDocs, 
  query, 
  where, 
  serverTimestamp 
} from "firebase/firestore";
import { db, auth } from "../firebase";
import { cn, stripUndefined, callWithRetry } from "../lib/utils";
import { 
  SavedLesson, 
  LessonResourceNew, 
  LessonResourceType, 
  GradeLevel, 
  Subject 
} from "../types";

const getApiKey = () => {
  const key = import.meta.env.VITE_GEMINI_API_KEY;
  if (!key) {
    console.error("GEMINI_API_KEY is not set. Please ensure you have configured it in the AI Studio Secrets panel.");
  }
  return key || '';
};

const ai = new GoogleGenAI({ apiKey: getApiKey() });

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

    const existingResources = await this.getLessonResources(lesson.id!);
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
    const q = query(collection(db, 'lesson_resources_new'), where('lesson_id', '==', lessonId));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as LessonResourceNew));
  },

  async generateResource(lesson: SavedLesson, type: LessonResourceType): Promise<void> {
    const prompt = `Generate a ${type.replace('_', ' ')} for the following lesson:
    Title: ${lesson.title}
    Topic: ${lesson.topic}
    Sub-topic: ${lesson.sub_topic || ''}
    Grade: ${lesson.class_id}
    Subject: ${lesson.subject}
    Objectives: ${lesson.objectives?.join(', ') || ''}
    Learning Outcomes: ${lesson.learning_outcomes?.join(', ') || ''}
    
    Provide the content in a structured JSON format suitable for a teacher dashboard.`;

    const response = await callWithRetry(() => ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    }));

    const content = JSON.parse(response.text);

    const resource: Omit<LessonResourceNew, 'id'> = {
      lesson_id: lesson.id!,
      resource_type: type,
      title: type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      content: content,
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
