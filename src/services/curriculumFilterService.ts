import { CurriculumEntry, GradeLevel, Subject, LessonPlan, ALL_GRADE_LEVELS } from '../types';

export interface CurriculumFilterParams {
  academicYear?: string;
  className?: GradeLevel | string;
  grade?: GradeLevel | string;
  subject?: Subject | string;
  cycle?: number | string;
}

export interface CurriculumTopicFilterParams extends CurriculumFilterParams {
  topic: string;
}

export interface CurriculumSubtopicFilterParams extends CurriculumTopicFilterParams {
  subtopic?: string;
}

export interface ValidationResult {
  valid: boolean;
  reason?: string;
}

/**
 * Normalizes academic year strings (e.g., "2025/2026" -> "2025-2026")
 */
export function normalizeAcademicYear(year?: string | null): string {
  if (!year) return '2025-2026';
  const trimmed = year.trim().replace(/\s+/g, '');
  // Replace slash with hyphen
  const normalized = trimmed.replace(/\//g, '-');
  return normalized || '2025-2026';
}

/**
 * Normalizes class / grade level strings into canonical GradeLevel
 */
export function normalizeGrade(grade?: string | null): GradeLevel {
  if (!grade) return 'Standard 4';
  const clean = grade.trim().toLowerCase().replace(/[-_]/g, ' ');
  
  if (clean.includes('infant 1')) return 'Infant 1';
  if (clean.includes('infant 2')) return 'Infant 2';
  if (clean.includes('infant 3')) return 'Infant 3';
  if (clean.includes('standard 1')) return 'Standard 1';
  if (clean.includes('standard 2')) return 'Standard 2';
  if (clean.includes('standard 3')) return 'Standard 3';
  if (clean.includes('standard 4')) return 'Standard 4';
  if (clean.includes('standard 5')) return 'Standard 5';
  if (clean.includes('standard 6')) return 'Standard 6';
  
  // Look for direct match
  const found = ALL_GRADE_LEVELS.find(g => g.toLowerCase() === clean);
  return found || 'Standard 4';
}

/**
 * Normalizes subject names
 */
export function normalizeSubject(subject?: string | null): string {
  if (!subject) return '';
  const clean = subject.trim().toLowerCase();
  
  if (clean.includes('math')) return 'Mathematics';
  if (clean.includes('language') || clean.includes('english') || clean.includes('reading') || clean.includes('arts')) {
    if (!clean.includes('creative') && !clean.includes('expressive')) return 'Language Arts';
  }
  if (clean.includes('science')) return 'Science and Technology';
  if (clean.includes('belize') || clean.includes('social studies')) return 'Belizean Studies';
  if (clean.includes('hfle') || clean.includes('health') || clean.includes('family')) return 'HFLE';
  if (clean.includes('spanish')) return 'Spanish';
  if (clean.includes('pe') || clean.includes('physical')) return 'PE';
  if (clean.includes('creative') || clean.includes('expressive') || clean.includes('art')) return 'Creative Arts';
  
  return subject.trim();
}

/**
 * Normalizes cycle numbers (1..4)
 */
export function normalizeCycle(cycle?: number | string | null): number {
  if (cycle === undefined || cycle === null) return 1;
  if (typeof cycle === 'number') {
    return Math.max(1, Math.min(4, Math.floor(cycle)));
  }
  const match = String(cycle).match(/\d+/);
  if (match) {
    const num = parseInt(match[0], 10);
    return Math.max(1, Math.min(4, num));
  }
  return 1;
}

// In-memory cache for fast local filtering
const filterCache = new Map<string, CurriculumEntry[]>();

/**
 * Build a canonical cache key from filter parameters
 */
function buildCacheKey(curriculumLength: number, params: CurriculumFilterParams): string {
  const year = normalizeAcademicYear(params.academicYear);
  const grade = normalizeGrade(params.className || params.grade);
  const subject = normalizeSubject(params.subject);
  const cycle = params.cycle !== undefined && params.cycle !== null ? normalizeCycle(params.cycle) : 'all';
  return `${curriculumLength}:${year}:${grade}:${subject}:${cycle}`;
}

/**
 * Core Global Curriculum Filtering Function
 *
 * GLOBAL HARD RULE:
 * curriculum.academicYear === selectedAcademicYear
 * AND
 * curriculum.class === selectedClass
 * AND
 * curriculum.subject === selectedSubject
 * AND
 * curriculum.cycle === selectedCycle
 *
 * Only records satisfying ALL four conditions are valid.
 * Works uniformly across all classes (Infant 1 -> Standard 6) and all subjects.
 * Never allows cross-cycle, cross-class, cross-subject, or cross-year fallback.
 */
export function getFilteredCurriculum(
  curriculum: CurriculumEntry[],
  params: CurriculumFilterParams
): CurriculumEntry[] {
  if (!curriculum || !Array.isArray(curriculum) || curriculum.length === 0) {
    return [];
  }

  const cacheKey = buildCacheKey(curriculum.length, params);
  const cached = filterCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const targetYear = normalizeAcademicYear(params.academicYear);
  const targetGrade = normalizeGrade(params.className || params.grade);
  const targetSubject = normalizeSubject(params.subject);
  const targetCycle = params.cycle !== undefined && params.cycle !== null ? normalizeCycle(params.cycle) : null;

  const results = curriculum.filter(entry => {
    // 1. Academic Year filter: Must strictly match selected academic year
    const rawYear = entry.academicYear || entry.schoolYear;
    if (rawYear) {
      const entryYear = normalizeAcademicYear(rawYear);
      if (entryYear !== targetYear) {
        return false;
      }
    } else {
      // Legacy records without explicit academicYear are assigned to default 2025-2026
      if (targetYear !== '2025-2026') {
        return false;
      }
    }

    // 2. Class / Grade filter: Must strictly match selected class
    const entryGrade = normalizeGrade(entry.grade || entry.className || (entry as any).class);
    if (entryGrade !== targetGrade) {
      return false;
    }

    // 3. Subject filter: Must strictly match selected subject
    const entrySubject = normalizeSubject(entry.subject);
    if (targetSubject && entrySubject !== targetSubject) {
      return false;
    }

    // 4. Cycle filter: Must strictly match selected cycle
    if (targetCycle !== null) {
      const entryCycle = entry.cycle !== undefined && entry.cycle !== null 
        ? normalizeCycle(entry.cycle) 
        : 1;
      if (entryCycle !== targetCycle) {
        return false;
      }
    }

    return true;
  });

  filterCache.set(cacheKey, results);
  return results;
}

/**
 * Returns distinct topics mapped to the selected Academic Year + Class + Subject + Cycle.
 * NEVER returns topics from other cycles, classes, subjects, or academic years.
 */
export function getFilteredTopics(
  curriculum: CurriculumEntry[],
  params: CurriculumFilterParams
): string[] {
  const filtered = getFilteredCurriculum(curriculum, params);
  const topics = filtered
    .map(e => (e.topic || '').trim())
    .filter(Boolean);
  return Array.from(new Set(topics));
}

/**
 * Returns subtopics mapped to the selected Academic Year + Class + Subject + Cycle + Topic.
 * Inherits the complete curriculum context.
 */
export function getFilteredSubtopics(
  curriculum: CurriculumEntry[],
  params: CurriculumTopicFilterParams
): string[] {
  if (!params.topic || !params.topic.trim()) return [];
  const filtered = getFilteredCurriculum(curriculum, params);
  const targetTopic = params.topic.trim().toLowerCase();

  const subtopics = filtered
    .filter(e => (e.topic || '').trim().toLowerCase() === targetTopic)
    .map(e => (e.subtopic || '').trim())
    .filter(Boolean);
  return Array.from(new Set(subtopics));
}

/**
 * Returns learning outcomes mapped to the selected Academic Year + Class + Subject + Cycle + Topic (+ Subtopic).
 */
export function getFilteredOutcomes(
  curriculum: CurriculumEntry[],
  params: CurriculumTopicFilterParams & { subtopic?: string }
): string[] {
  if (!params.topic || !params.topic.trim()) return [];
  const filtered = getFilteredCurriculum(curriculum, params);
  const targetTopic = params.topic.trim().toLowerCase();
  const targetSubtopic = params.subtopic ? params.subtopic.trim().toLowerCase() : null;

  const outcomes: string[] = [];
  filtered
    .filter(e => {
      const matchTopic = (e.topic || '').trim().toLowerCase() === targetTopic;
      if (!matchTopic) return false;
      if (targetSubtopic) {
        return (e.subtopic || '').trim().toLowerCase() === targetSubtopic;
      }
      return true;
    })
    .forEach(e => {
      if (Array.isArray(e.learning_outcomes)) {
        outcomes.push(...e.learning_outcomes);
      }
    });

  return Array.from(new Set(outcomes.map(o => o.trim()).filter(Boolean)));
}

/**
 * VALIDATE BEFORE GENERATION
 * Verifies that the selected topic belongs to the selected curriculum context.
 * If false, generation MUST be blocked.
 */
export function validateTopicInContext(
  curriculum: CurriculumEntry[],
  params: CurriculumTopicFilterParams
): ValidationResult {
  if (!params.topic || !params.topic.trim()) {
    return {
      valid: false,
      reason: 'Please select a curriculum topic before generating.'
    };
  }

  const matching = getFilteredCurriculum(curriculum, params);
  const targetTopic = params.topic.trim().toLowerCase();
  
  const isValid = matching.some(e => (e.topic || '').trim().toLowerCase() === targetTopic);
  if (!isValid) {
    return {
      valid: false,
      reason: 'This topic is not mapped to the selected class, subject, cycle, or academic year.'
    };
  }

  return { valid: true };
}

/**
 * VALIDATE GENERATED LESSONS
 * Verifies that the AI-generated lesson respects the authoritative curriculum context.
 * The generated lesson must retain Academic Year, Class, Subject, Cycle, Topic.
 * If topic does not belong to the selected cycle, the lesson is rejected.
 */
export function validateGeneratedLesson(
  lesson: any,
  curriculum: CurriculumEntry[],
  expectedContext: CurriculumFilterParams & { topic: string; subtopic?: string }
): ValidationResult {
  if (!lesson) {
    return { valid: false, reason: 'Generated lesson payload is empty.' };
  }

  // 1. Verify that topic belongs to the expected cycle and context in curriculum
  const topicValidation = validateTopicInContext(curriculum, {
    academicYear: expectedContext.academicYear,
    className: expectedContext.className || expectedContext.grade,
    subject: expectedContext.subject,
    cycle: expectedContext.cycle,
    topic: expectedContext.topic
  });

  if (!topicValidation.valid) {
    return {
      valid: false,
      reason: `Curriculum integrity check failed: ${topicValidation.reason}`
    };
  }

  // 2. Verify cycle alignment on generated object
  const genCycle = lesson.cycle !== undefined ? normalizeCycle(lesson.cycle) : null;
  const expectedCycle = expectedContext.cycle !== undefined ? normalizeCycle(expectedContext.cycle) : null;
  if (genCycle !== null && expectedCycle !== null && genCycle !== expectedCycle) {
    return {
      valid: false,
      reason: `Generated lesson cycle (${genCycle}) does not match selected cycle (${expectedCycle}).`
    };
  }

  return { valid: true };
}

/**
 * VALIDATE SAVED LESSON
 * Every saved lesson must contain the complete, validated curriculum context.
 */
export function validateLessonForSaving(
  lesson: Partial<LessonPlan>,
  curriculum: CurriculumEntry[]
): ValidationResult {
  if (!lesson.grade) {
    return { valid: false, reason: 'Missing class / grade level.' };
  }
  if (!lesson.subject) {
    return { valid: false, reason: 'Missing subject.' };
  }
  if (lesson.cycle === undefined || lesson.cycle === null) {
    return { valid: false, reason: 'Missing curriculum cycle.' };
  }
  if (!lesson.topic) {
    return { valid: false, reason: 'Missing curriculum topic.' };
  }

  return validateTopicInContext(curriculum, {
    academicYear: lesson.academicYear,
    className: lesson.grade,
    subject: lesson.subject,
    cycle: lesson.cycle,
    topic: lesson.topic
  });
}

/**
 * Standard empty state message when a cycle/class/subject has no mapped topics
 */
export function getCurriculumEmptyStateMessage(params: CurriculumFilterParams): string {
  const grade = normalizeGrade(params.className || params.grade);
  const cycle = params.cycle !== undefined ? normalizeCycle(params.cycle) : 1;
  const subject = params.subject || 'Subject';
  return `No curriculum topics are currently mapped for ${grade}, ${subject}, Cycle ${cycle} in the selected academic year.`;
}

/**
 * Clears the in-memory cache when curriculum is updated or uploaded
 */
export function invalidateCurriculumCache(): void {
  filterCache.clear();
}
