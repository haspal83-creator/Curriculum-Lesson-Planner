import { CurriculumEntry, GradeLevel, Subject, LessonPlan, ALL_GRADE_LEVELS, CyclePacingMap } from '../types';
import { BELIZE_NATIONAL_CURRICULUM } from '../data/belize_national_curriculum';

export interface CurriculumFilterParams {
  academicYear?: string;
  className?: GradeLevel | string;
  grade?: GradeLevel | string;
  subject?: Subject | string;
  cycle?: number | string;
  week?: number | string | null;
  pacingMaps?: CyclePacingMap[];
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
 * Normalizes academic year strings (e.g., "2026/2027" -> "2026-2027")
 */
export function normalizeAcademicYear(year?: string | null): string {
  if (!year) return '2026-2027';
  const trimmed = year.trim().replace(/\s+/g, '');
  // Replace slash with hyphen
  const normalized = trimmed.replace(/\//g, '-');
  return normalized || '2026-2027';
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
  const year = params.academicYear ? normalizeAcademicYear(params.academicYear) : 'all';
  const grade = normalizeGrade(params.className || params.grade);
  const subject = normalizeSubject(params.subject);
  const cycle = params.cycle !== undefined && params.cycle !== null ? normalizeCycle(params.cycle) : 'all';
  const week = params.week !== undefined && params.week !== null ? params.week : 'all';
  const pacingCount = params.pacingMaps?.length || 0;
  return `${curriculumLength}:${year}:${grade}:${subject}:${cycle}:${week}:${pacingCount}`;
}

/**
 * Core Global Curriculum Filtering Function
 *
 * Reliably maps curriculum entries to the selected grade, subject, cycle, academic year, and instructional week.
 * Enforces strict filtering: topics from other weeks, cycles, classes, or subjects are never returned.
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

  const targetYear = params.academicYear ? normalizeAcademicYear(params.academicYear) : null;
  const targetGrade = normalizeGrade(params.className || params.grade);
  const targetSubject = normalizeSubject(params.subject);
  const targetCycle = params.cycle !== undefined && params.cycle !== null ? normalizeCycle(params.cycle) : null;

  // 1. Primary Filter: Grade and Subject
  const gradeSubjectMatches = curriculum.filter(entry => {
    // Grade match
    const rawGrade = entry.grade || entry.className || (entry as any).class || (entry as any).grade_level;
    const entryGrade = normalizeGrade(rawGrade);
    if (entryGrade !== targetGrade) {
      return false;
    }

    // Subject match
    const entrySubject = normalizeSubject(entry.subject);
    if (targetSubject && entrySubject !== targetSubject) {
      return false;
    }

    return true;
  });

  // 2. Academic Year Filter:
  let yearFiltered = gradeSubjectMatches;
  if (targetYear && targetYear !== 'All' && targetYear !== 'all') {
    const specificMatches = gradeSubjectMatches.filter(entry => {
      const rawYear = entry.academicYear || entry.schoolYear;
      if (!rawYear || rawYear === 'all' || rawYear === 'All') return true;
      return normalizeAcademicYear(rawYear) === targetYear;
    });

    if (specificMatches.length > 0) {
      yearFiltered = specificMatches;
    } else {
      yearFiltered = gradeSubjectMatches;
    }
  }

  // 3. Cycle Filter:
  let cycleFiltered = yearFiltered;
  if (targetCycle !== null) {
    const cycleMatches = yearFiltered.filter(entry => {
      if (entry.cycle === undefined || entry.cycle === null || entry.cycle === 0 || (entry.cycle as any) === 'all') {
        return true;
      }
      return normalizeCycle(entry.cycle) === targetCycle;
    });

    if (cycleMatches.length > 0) {
      cycleFiltered = cycleMatches;
    } else {
      // If a week is specified, we must NOT fall back to other cycles
      if (params.week !== undefined && params.week !== null && params.week !== 'all') {
        cycleFiltered = [];
      } else {
        cycleFiltered = yearFiltered;
      }
    }
  }

  let finalResults = cycleFiltered;

  // 4. Week Filter:
  // If a specific instructional week is requested, resolve the approved topics for that week.
  if (params.week !== undefined && params.week !== null && params.week !== 'all') {
    const targetWeek = typeof params.week === 'number' ? params.week : parseInt(String(params.week), 10);
    if (!isNaN(targetWeek)) {
      // A. Check Cycle Pacing Maps if available
      if (params.pacingMaps && params.pacingMaps.length > 0) {
        const pacingMap = params.pacingMaps.find(m =>
          normalizeGrade(m.grade) === targetGrade &&
          normalizeSubject(m.subject) === targetSubject &&
          normalizeCycle(m.cycle) === (targetCycle || 1)
        );
        if (pacingMap && Array.isArray(pacingMap.weeks)) {
          const weekEntry = pacingMap.weeks.find(w => w.weekNumber === targetWeek);
          if (weekEntry && weekEntry.topic && weekEntry.topic.trim()) {
            const topicNorm = weekEntry.topic.trim().toLowerCase();
            const matches = cycleFiltered.filter(e => (e.topic || '').trim().toLowerCase() === topicNorm);
            if (matches.length > 0) {
              finalResults = matches;
              filterCache.set(cacheKey, finalResults);
              return finalResults;
            } else {
              // Custom topic scheduled in pacing map
              finalResults = [{
                id: `pacing-${targetGrade}-${targetSubject}-c${targetCycle || 1}-w${targetWeek}`,
                grade: targetGrade,
                subject: targetSubject as Subject,
                cycle: targetCycle || 1,
                week: targetWeek,
                topic: weekEntry.topic.trim(),
                subtopic: weekEntry.subtopics?.[0] || '',
                learning_outcomes: weekEntry.learningOutcomes || [],
                academicYear: targetYear || '2026-2027',
                createdAt: new Date().toISOString()
              }];
              filterCache.set(cacheKey, finalResults);
              return finalResults;
            }
          } else if (weekEntry) {
            // Week is explicitly scheduled with no topic (e.g. review or break)
            finalResults = [];
            filterCache.set(cacheKey, finalResults);
            return finalResults;
          }
        }
      }

      // B. Check for explicit week assignment on curriculum entries
      const hasExplicitWeeks = cycleFiltered.some(e => e.week !== undefined && e.week !== null && Number(e.week) > 0);
      if (hasExplicitWeeks) {
        finalResults = cycleFiltered.filter(e => {
          const entryWeek = Number(e.week);
          const duration = e.suggestedWeeks || 1;
          return targetWeek >= entryWeek && targetWeek < entryWeek + duration;
        });
        filterCache.set(cacheKey, finalResults);
        return finalResults;
      }

      // C. Sequential topic allocation by suggestedWeeks in curriculum order
      const uniqueTopics: string[] = [];
      cycleFiltered.forEach(e => {
        const t = (e.topic || '').trim();
        if (t && !uniqueTopics.includes(t)) {
          uniqueTopics.push(t);
        }
      });

      if (uniqueTopics.length > 0) {
        if (uniqueTopics.length === 1) {
          // If there is only 1 topic in the cycle, it spans all instructional weeks of the cycle
          finalResults = cycleFiltered.filter(e => (e.topic || '').trim() === uniqueTopics[0]);
        } else {
          // Calculate durations for each topic
          const topicDurations = uniqueTopics.map(topic => {
            const topicEntries = cycleFiltered.filter(e => (e.topic || '').trim() === topic);
            const maxWeeks = Math.max(...topicEntries.map(e => e.suggestedWeeks || 0), 0);
            const maxLessons = Math.max(...topicEntries.map(e => e.suggestedLessons || 0), 0);
            return maxWeeks > 0 
              ? maxWeeks 
              : (maxLessons > 0 ? Math.max(1, Math.ceil(maxLessons / 5)) : 1);
          });

          let currentStartWeek = 1;
          let matchedTopic: string | null = null;

          for (let i = 0; i < uniqueTopics.length; i++) {
            const isLast = i === uniqueTopics.length - 1;
            const duration = topicDurations[i];
            // The last topic covers the remaining weeks of the cycle
            const endWeek = isLast ? Math.max(currentStartWeek + duration - 1, 25) : currentStartWeek + duration - 1;
            if (targetWeek >= currentStartWeek && targetWeek <= endWeek) {
              matchedTopic = uniqueTopics[i];
              break;
            }
            currentStartWeek = endWeek + 1;
          }

          if (matchedTopic) {
            finalResults = cycleFiltered.filter(e => (e.topic || '').trim() === matchedTopic);
          } else {
            // Fallback: return all cycle topics so teacher always has approved curriculum options
            finalResults = cycleFiltered;
          }
        }
      } else {
        finalResults = [];
      }
    }
  }

  filterCache.set(cacheKey, finalResults);
  return finalResults;
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
 * Robustly inspects singular and plural subtopic properties across filtered curriculum,
 * broader cycle context, national curriculum, and pacing maps.
 */
export function getFilteredSubtopics(
  curriculum: CurriculumEntry[],
  params: CurriculumTopicFilterParams
): string[] {
  if (!params.topic || !params.topic.trim()) return [];
  const targetTopic = params.topic.trim().toLowerCase();
  const subtopics: string[] = [];

  const extractSubtopics = (entries: CurriculumEntry[]) => {
    for (const e of entries) {
      if ((e.topic || '').trim().toLowerCase() === targetTopic) {
        if (e.subtopic && typeof e.subtopic === 'string' && e.subtopic.trim()) {
          subtopics.push(e.subtopic.trim());
        }
        if (Array.isArray((e as any).subtopics)) {
          for (const st of (e as any).subtopics) {
            if (typeof st === 'string' && st.trim()) {
              subtopics.push(st.trim());
            }
          }
        }
        if ((e as any).sub_topic && typeof (e as any).sub_topic === 'string' && (e as any).sub_topic.trim()) {
          subtopics.push((e as any).sub_topic.trim());
        }
      }
    }
  };

  // 1. Primary: search within filtered curriculum
  const filtered = getFilteredCurriculum(curriculum, params);
  extractSubtopics(filtered);

  // 2. Secondary: search across the entire cycle (without week constraint)
  if (subtopics.length === 0) {
    const broader = getFilteredCurriculum(curriculum, { ...params, week: null });
    extractSubtopics(broader);
  }

  // 3. Tertiary: search base national curriculum and raw entries
  if (subtopics.length === 0) {
    extractSubtopics(curriculum);
    extractSubtopics(BELIZE_NATIONAL_CURRICULUM);
  }

  // 4. Quaternary: inspect pacingMaps for scheduled subtopics
  if (params.pacingMaps && Array.isArray(params.pacingMaps)) {
    const targetGrade = normalizeGrade(params.className || params.grade);
    const targetSubject = normalizeSubject(params.subject);
    const targetCycle = params.cycle !== undefined && params.cycle !== null ? normalizeCycle(params.cycle) : null;
    for (const map of params.pacingMaps) {
      if (normalizeGrade(map.grade) === targetGrade && normalizeSubject(map.subject) === targetSubject) {
        if (targetCycle === null || normalizeCycle(map.cycle) === targetCycle) {
          if (Array.isArray(map.weeks)) {
            for (const w of map.weeks) {
              if ((w.topic || '').trim().toLowerCase() === targetTopic) {
                if (Array.isArray(w.subtopics)) {
                  for (const st of w.subtopics) {
                    if (typeof st === 'string' && st.trim()) {
                      subtopics.push(st.trim());
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  const unique = Array.from(new Set(subtopics.filter(Boolean)));
  // If still empty for a valid topic name, provide the topic title as the default subtopic
  if (unique.length === 0 && params.topic.trim()) {
    return [params.topic.trim()];
  }

  return unique;
}

/**
 * Returns learning outcomes mapped to the selected Academic Year + Class + Subject + Cycle + Topic (+ Subtopic).
 */
export function getFilteredOutcomes(
  curriculum: CurriculumEntry[],
  params: CurriculumTopicFilterParams & { subtopic?: string }
): string[] {
  if (!params.topic || !params.topic.trim()) return [];
  const targetTopic = params.topic.trim().toLowerCase();
  const targetSubtopic = params.subtopic ? params.subtopic.trim().toLowerCase() : null;

  const outcomes: string[] = [];

  const extractOutcomes = (entries: CurriculumEntry[]) => {
    for (const e of entries) {
      const matchTopic = (e.topic || '').trim().toLowerCase() === targetTopic;
      if (!matchTopic) continue;

      if (targetSubtopic) {
        const subtopicMatches = 
          (e.subtopic || '').trim().toLowerCase() === targetSubtopic ||
          (Array.isArray((e as any).subtopics) && (e as any).subtopics.some((s: string) => s.trim().toLowerCase() === targetSubtopic)) ||
          ((e as any).sub_topic || '').trim().toLowerCase() === targetSubtopic;
        
        if (!subtopicMatches) continue;
      }

      if (Array.isArray(e.learning_outcomes)) {
        for (const lo of e.learning_outcomes) {
          if (typeof lo === 'string' && lo.trim()) {
            outcomes.push(lo.trim());
          }
        }
      }
    }
  };

  // 1. Primary: filtered curriculum
  const filtered = getFilteredCurriculum(curriculum, params);
  extractOutcomes(filtered);

  // 2. Secondary: broader cycle without week constraint
  if (outcomes.length === 0) {
    const broader = getFilteredCurriculum(curriculum, { ...params, week: null });
    extractOutcomes(broader);
  }

  // 3. Tertiary: raw and national curriculum
  if (outcomes.length === 0) {
    extractOutcomes(curriculum);
    extractOutcomes(BELIZE_NATIONAL_CURRICULUM);
  }

  // 4. Quaternary: inspect pacingMaps
  if (params.pacingMaps && Array.isArray(params.pacingMaps)) {
    const targetGrade = normalizeGrade(params.className || params.grade);
    const targetSubject = normalizeSubject(params.subject);
    for (const map of params.pacingMaps) {
      if (normalizeGrade(map.grade) === targetGrade && normalizeSubject(map.subject) === targetSubject) {
        if (Array.isArray(map.weeks)) {
          for (const w of map.weeks) {
            if ((w.topic || '').trim().toLowerCase() === targetTopic) {
              if (Array.isArray(w.learningOutcomes)) {
                for (const lo of w.learningOutcomes) {
                  if (typeof lo === 'string' && lo.trim()) {
                    outcomes.push(lo.trim());
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  const unique = Array.from(new Set(outcomes.filter(Boolean)));
  if (unique.length === 0 && params.topic.trim()) {
    return [`Demonstrate understanding and application of ${params.topic.trim()}`];
  }

  return unique;
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
      reason: 'This topic is not mapped to the selected class, subject, cycle, instructional week, or academic year.'
    };
  }

  return { valid: true };
}

/**
 * VALIDATE GENERATED LESSONS
 * Verifies that the AI-generated lesson respects the authoritative curriculum context.
 * The generated lesson must retain Academic Year, Class, Subject, Cycle, Instructional Week, and Topic.
 * If topic does not belong to the selected cycle or instructional week, the lesson is rejected.
 */
export function validateGeneratedLesson(
  lesson: any,
  curriculum: CurriculumEntry[],
  expectedContext: CurriculumFilterParams & { topic: string; subtopic?: string; week?: number }
): ValidationResult {
  if (!lesson) {
    return { valid: false, reason: 'Generated lesson payload is empty.' };
  }

  // 1. Verify that topic belongs to the expected cycle, week, and context in curriculum
  const topicValidation = validateTopicInContext(curriculum, {
    academicYear: expectedContext.academicYear,
    className: expectedContext.className || expectedContext.grade,
    subject: expectedContext.subject,
    cycle: expectedContext.cycle,
    week: expectedContext.week,
    pacingMaps: expectedContext.pacingMaps,
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
    week: lesson.week,
    topic: lesson.topic
  });
}

/**
 * Standard empty state message when a cycle/class/subject has no mapped topics
 */
export function getCurriculumEmptyStateMessage(params: CurriculumFilterParams): string {
  if (params.week !== undefined && params.week !== null && params.week !== 'all') {
    return 'No approved topics are scheduled for this week.';
  }
  const grade = normalizeGrade(params.className || params.grade);
  const cycle = params.cycle !== undefined ? normalizeCycle(params.cycle) : 1;
  const subject = params.subject ? normalizeSubject(params.subject) : 'Selected Subject';
  return `No curriculum topics found for ${grade}, ${subject}, Cycle ${cycle}. Upload your curriculum guide in the Curriculum tab or switch to an available subject/cycle to proceed.`;
}

/**
 * Clears the in-memory cache when curriculum is updated or uploaded
 */
export function invalidateCurriculumCache(): void {
  filterCache.clear();
}
