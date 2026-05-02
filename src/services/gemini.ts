/**
 * Client-side proxy for AI services.
 * All AI calls are routed through the backend to keep API keys secure.
 */

async function callAi(action: string, params: any) {
  const response = await fetch("/api/ai/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ action, params }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || `AI request failed: ${response.statusText}`);
  }

  return response.json();
}

export const generateLessonPlan = (params: any) => callAi('generateLessonPlan', params);
export const generateWeeklyPlan = (grade: string, subject: string, cycle: number, entries: any[], numWeeks: number = 10, lessonsPerWeek: number = 5) => 
  callAi('generateWeeklyPlan', { grade, subject, cycle, entries, numWeeks, lessonsPerWeek });
export const generateWeeklyCurriculumPlan = (params: any) => callAi('generateWeeklyCurriculumPlan', params);
export const parseCurriculum = (fileData?: any, text?: string) => callAi('parseCurriculum', { fileData, text });
export const parseCurriculumUnit = (fileData?: any, text?: string) => callAi('parseCurriculumUnit', { fileData, text });
export const generateFullWeek = (params: any) => callAi('generateFullWeek', params);
export const generateCyclePacingMap = (params: any) => callAi('generateCyclePacingMap', params);
export const calculateCoverage = (params: any) => callAi('calculateCoverage', params);
export const generateLanguageArtsWeeklyPlan = (params: any) => callAi('generateLanguageArtsWeeklyPlan', params);
export const generateResource = (type: string, lessonContext: any, options: any = {}) => callAi('generateResource', { type, lessonContext, options });
export const improveContent = (content: string, instruction: string, context: any) => callAi('improveContent', { content, instruction, context });
export const regenerateSection = (sectionName: string, lessonContext: any) => callAi('regenerateSection', { sectionName, lessonContext });
export const generateWeeklyLessonPlan = (params: any) => callAi('generateWeeklyLessonPlan', params);
export const generateLessonResources = (grade: string, topic: string) => callAi('generateLessonResources', { grade, topic });

// Add other necessary exports as needed
export const generateReteachLesson = (originalPlan: any, assessmentRecord: any) => callAi('generateReteachLesson', { originalPlan, assessmentRecord });
export const generateInterventionWork = (lessonPlan: any, assessmentRecord: any) => callAi('generateInterventionWork', { lessonPlan, assessmentRecord });
export const generateCatchUpLesson = (lessonPlan: any) => callAi('generateCatchUpLesson', { lessonPlan });
export const generateRevisionWeek = (grade: any, subject: any, weakOutcomes: any[], misconceptions: any[]) => callAi('generateRevisionWeek', { grade, subject, weakOutcomes, misconceptions });
export const generateYearlyCurriculumMap = (grade: any, subject: any, curriculum: any[], calendar: any) => callAi('generateYearlyCurriculumMap', { grade, subject, curriculum, calendar });
export const generateCyclePlan = (map: any, cycleNumber: number, calendar: any) => callAi('generateCyclePlan', { map, cycleNumber, calendar });
export const generateWeeklyTeachingPlan = (cyclePlan: any, weekNumber: number, calendar: any) => callAi('generateWeeklyTeachingPlan', { cyclePlan, weekNumber, calendar });
export const generateLessonVideo = (lesson: any, voiceSettings: any, avatarSettings: any) => callAi('generateLessonVideo', { lesson, voiceSettings, avatarSettings });
