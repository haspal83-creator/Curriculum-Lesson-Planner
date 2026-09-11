import { 
  collection, 
  query, 
  where, 
  getDocs, 
  updateDoc, 
  doc 
} from 'firebase/firestore';
import { db } from '../firebase';
import { GradeLevel, getClassId } from '../types';

/**
 * Ensures that any existing document without a classId field gets backfilled with the appropriate
 * classId and className based on its grade/grade_level field.
 */
export async function backfillUserClassIds(userId: string): Promise<void> {
  if (!userId) return;

  const collectionsToCheck = [
    'saved_lessons',
    'weekly_plans',
    'la_weekly_plans',
    'daily_lesson_plans',
    'yearly_calendars',
    'cycle_pacing_maps',
    'outcome_mastery',
    'assessment_records',
    'misconception_logs',
    'student_support_flags',
    'lesson_resources_new',
    'curriculum'
  ];

  for (const colName of collectionsToCheck) {
    try {
      // Find docs created by user (or all curriculum) that don't have classId yet
      const q = colName === 'curriculum'
        ? query(collection(db, 'curriculum'))
        : query(
            collection(db, colName), 
            where(colName === 'lesson_resources_new' ? 'createdBy' : 'userId', '==', userId)
          );
      const snap = await getDocs(q);
      for (const d of snap.docs) {
        const data = d.data();
        if (!data.classId) {
          const rawGrade = data.grade || data.grade_level || data.class_id || data.className;
          if (rawGrade && typeof rawGrade === 'string') {
            const normalizedClassId = getClassId(rawGrade);
            await updateDoc(doc(db, colName, d.id), {
              classId: normalizedClassId,
              className: rawGrade,
              userId: userId
            }).catch(e => console.warn(`Backfill skip for ${colName}/${d.id}:`, e));
          }
        }
      }
    } catch (err) {
      // Non-blocking backfill
      console.warn(`Backfill check for ${colName}:`, err);
    }
  }
}

/**
 * Helper to ensure an object has valid class identification before writing to Firestore
 */
export function withClassContext<T extends Record<string, any>>(
  item: T,
  activeClass: GradeLevel,
  activeClassId: string,
  userId: string
): T & { classId: string; className: string; grade: GradeLevel; userId: string } {
  return {
    ...item,
    classId: activeClassId,
    className: activeClass,
    grade: activeClass,
    userId
  };
}
