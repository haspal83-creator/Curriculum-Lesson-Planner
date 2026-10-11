import 'dotenv/config';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as staticGeminiService from '../../src/services/gemini.implementation.js';
import { generateLessonResources } from '../../src/lib/gemini';

// Safe module resolution & diagnostic handling (Task 13 & 14)
let geminiServiceInstance: any = staticGeminiService;
let moduleResolutionDiagnostic: string | null = null;

async function getGeminiService() {
  if (geminiServiceInstance && typeof geminiServiceInstance.generateLessonPlan === 'function') {
    return geminiServiceInstance;
  }

  try {
    const mod: any = await import('../../src/services/gemini.implementation');
    geminiServiceInstance = mod.default || mod;
    return geminiServiceInstance;
  } catch (err1: any) {
    try {
      // @ts-ignore
      const mod: any = await import('../../src/services/gemini.implementation.js');
      geminiServiceInstance = mod.default || mod;
      return geminiServiceInstance;
    } catch (err2: any) {
      try {
        // @ts-ignore
        const mod: any = await import('../../src/services/gemini.implementation.ts');
        geminiServiceInstance = mod.default || mod;
        return geminiServiceInstance;
      } catch (err3: any) {
        moduleResolutionDiagnostic = `Failed to load Gemini service module. Resolution errors: [path: ${err1?.message || 'unknown'}], [.js: ${err2?.message || 'unknown'}], [.ts: ${err3?.message || 'unknown'}]`;
        console.error('[DIAGNOSTIC ERROR]', moduleResolutionDiagnostic);
        throw new Error(moduleResolutionDiagnostic);
      }
    }
  }
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Always set Content-Type header to application/json
  res.setHeader('Content-Type', 'application/json');

  // STEP 2.1 — Accept POST requests only
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: `Method ${req.method} not allowed. Please use POST.`
    });
  }

  // STEP 2.2 — Parse the JSON request body safely
  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch (parseErr: any) {
      console.error('Lesson generation API error: Invalid JSON request body:', parseErr?.message);
      return res.status(400).json({
        success: false,
        error: 'Invalid JSON request body.'
      });
    }
  }

  if (!body || typeof body !== 'object') {
    return res.status(400).json({
      success: false,
      error: 'Request body must be a valid JSON object.'
    });
  }

  const { action, params } = body;

  // STEP 2.3 — Validate the request
  if (!action || typeof action !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Missing or invalid "action" field in request body.'
    });
  }

  // STEP 4 & STEP 6 — Verify GEMINI_API_KEY and log state (NEVER log the actual key)
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  const hasApiKey = Boolean(apiKey && apiKey !== 'undefined' && apiKey !== 'null');

  console.error(`[API /api/ai/generate] Action: "${action}" | GEMINI_API_KEY configured: ${hasApiKey}`);

  if (!hasApiKey) {
    console.error('Lesson generation API error: GEMINI_API_KEY is not configured on the server.');
    return res.status(500).json({
      success: false,
      error: 'GEMINI_API_KEY is not configured on the server.'
    });
  }

  // Task 14 — Verify Gemini service module can be loaded
  let geminiService: any;
  try {
    geminiService = await getGeminiService();
  } catch (modErr: any) {
    console.error('Module load failure in /api/ai/generate:', modErr?.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to load internal Gemini service module.',
      diagnostic: modErr?.message || 'ERR_MODULE_NOT_FOUND: Unable to resolve gemini.implementation'
    });
  }

  try {
    let result: any;
    const actionParams = params || {};

    switch (action) {
      case 'generateLessonPlan':
        result = await geminiService.generateLessonPlan(actionParams);
        break;

      case 'generateLanguageArtsDailyPlan':
        result = await geminiService.generateLanguageArtsDailyPlan(actionParams);
        break;

      case 'generateWeeklyPlan': {
        const { grade, subject, cycle, entries, numWeeks, lessonsPerWeek } = actionParams;
        result = await geminiService.generateWeeklyPlan(
          grade,
          subject,
          cycle,
          entries,
          numWeeks,
          lessonsPerWeek
        );
        break;
      }

      case 'generateWeeklyBreakdown':
        result = await geminiService.generateWeeklyBreakdown(actionParams);
        break;

      case 'generateWeeklyCurriculumPlan':
        result = await geminiService.generateWeeklyBreakdown(actionParams);
        break;

      case 'parseCurriculum':
        result = await geminiService.parseCurriculum(
          actionParams.fileData,
          actionParams.text
        );
        break;

      case 'parseCurriculumUnit':
        result = await geminiService.parseCurriculumUnit(
          actionParams.fileData,
          actionParams.text
        );
        break;

      case 'generateFullWeek':
        result = await geminiService.generateFullWeek(actionParams);
        break;

      case 'improveContent':
        result = await geminiService.improveContent(
          actionParams.content,
          actionParams.instruction,
          actionParams.context
        );
        break;

      case 'regenerateSection':
        result = await geminiService.regenerateSection(
          actionParams.sectionName,
          actionParams.lessonContext
        );
        break;

      case 'generateLessonResources':
        result = await generateLessonResources(
          actionParams.grade,
          actionParams.topic
        );
        break;

      case 'generateCyclePacingMap':
        result = await geminiService.generateCyclePacingMap(actionParams);
        break;

      case 'calculateCoverage':
        result = await geminiService.calculateCoverage(actionParams);
        break;

      case 'generateLanguageArtsWeeklyPlan':
        result = await geminiService.generateLanguageArtsWeeklyPlan(actionParams);
        break;

      case 'generateResource':
        result = await geminiService.generateResource(
          actionParams.type,
          actionParams.lessonContext,
          actionParams.options
        );
        break;

      case 'generateWeeklyLessonPlan':
        result = await geminiService.generateWeeklyLessonPlan(actionParams);
        break;

      case 'generateWeeklyTestQuestions':
        result = await geminiService.generateWeeklyTestQuestions(actionParams);
        break;

      case 'generateReteachLesson':
        result = await geminiService.generateReteachLesson(
          actionParams.originalPlan,
          actionParams.assessmentRecord
        );
        break;

      case 'generateInterventionWork':
        result = await geminiService.generateInterventionWork(
          actionParams.lessonPlan,
          actionParams.assessmentRecord
        );
        break;

      case 'generateCatchUpLesson':
        result = await geminiService.generateCatchUpLesson(
          actionParams.lessonPlan
        );
        break;

      case 'generateRevisionWeek':
        result = await geminiService.generateRevisionWeek(
          actionParams.grade,
          actionParams.subject,
          actionParams.weakOutcomes,
          actionParams.misconceptions
        );
        break;

      case 'generateYearlyCurriculumMap':
        result = await geminiService.generateYearlyCurriculumMap(
          actionParams.grade,
          actionParams.subject,
          actionParams.curriculum,
          actionParams.calendar
        );
        break;

      case 'generateCyclePlan':
        result = await geminiService.generateCyclePlan(
          actionParams.map,
          actionParams.cycleNumber,
          actionParams.calendar
        );
        break;

      case 'generateWeeklyTeachingPlan':
        result = await geminiService.generateWeeklyTeachingPlan(
          actionParams.cyclePlan,
          actionParams.weekNumber,
          actionParams.calendar
        );
        break;

      case 'generateLessonVideo':
        result = await geminiService.generateLessonVideo(
          actionParams.lesson,
          actionParams.voiceSettings,
          actionParams.avatarSettings
        );
        break;

      case 'generatePowerPoint':
      case 'rebuildPowerPoint':
        result = await geminiService.generatePowerPointPresentation(actionParams);
        break;

      case 'generateWeeklyTest': {
        const { buildWeeklyCoverageMap, buildDeterministicTestQuestions } = await import('../../src/lib/weeklyTestService');
        const coverage = buildWeeklyCoverageMap({
          classLevel: actionParams.grade || actionParams.classLevel || 'Standard 4',
          subject: actionParams.subject || 'Mathematics',
          academicYear: actionParams.academicYear || '2026-2027',
          cycle: actionParams.cycle || 1,
          week: actionParams.week || 1,
          plans: actionParams.plans,
          weeklyPlans: actionParams.weeklyPlans,
          curriculum: actionParams.curriculum,
          activeWeeklyPlan: actionParams.activeWeeklyPlan
        });
        const questions = buildDeterministicTestQuestions(coverage, {
          questionCount: actionParams.questionCount || 10,
          questionTypes: actionParams.questionTypes || 'Mixed Question Types',
          difficulty: actionParams.difficulty || 'Mixed',
          timeAllowed: actionParams.timeAllowed || '45 minutes',
          totalMarks: actionParams.questionCount || 10,
          instructions: actionParams.instructions || 'Answer all questions in the spaces provided.',
          randomizeQuestions: false,
          randomizeAnswerChoices: false,
          includeAnswerKey: true
        });
        result = {
          coverage,
          questions,
          totalMarks: questions.reduce((acc: number, q: any) => acc + (q.marks || 1), 0)
        };
        break;
      }

      default:
        return res.status(400).json({
          success: false,
          error: `Unknown action: ${action}`
        });
    }

    const payload = result !== undefined && result !== null ? result : "";
    return res.status(200).json(payload);

  } catch (error: any) {
    const rawErrorMsg = error?.message || String(error || '');
    let cleanMessage = rawErrorMsg;
    try {
      const parsed = JSON.parse(rawErrorMsg);
      if (parsed?.error?.message) {
        cleanMessage = parsed.error.message;
      }
    } catch (e) {
      // not JSON
    }

    console.warn(`[API /api/ai/generate] Recovering action "${action}" after upstream API event:`, cleanMessage);

    const actionParams = params || {};

    if (action === 'generateLessonPlan' || action === 'generateLanguageArtsDailyPlan') {
      try {
        const { enrichAndGuaranteeTeachReady } = await import('../../src/lib/lessonQualityGate');
        const isLA = action === 'generateLanguageArtsDailyPlan' || actionParams.subject === 'Language Arts';
        const safePlan = enrichAndGuaranteeTeachReady({
          lessonTitle: actionParams.lessonTitle || actionParams.topic || 'Instructional Lesson Plan',
          subject: actionParams.subject || (isLA ? 'Language Arts' : 'Curriculum Subject'),
          grade: actionParams.grade || 'Standard 2',
          cycle: actionParams.cycle || 2,
          week: actionParams.week || 1,
          day: actionParams.day || 1,
          date: actionParams.date,
          topic: actionParams.topic || 'Core Concept',
          subtopic: actionParams.subtopic || actionParams.topic,
          learningOutcome: actionParams.learningOutcome,
          duration: actionParams.duration || (isLA ? '90 minutes' : '45 minutes'),
          languageArtsComponents: actionParams.components
        }, actionParams);
        return res.status(200).json(safePlan);
      } catch (fallbackErr: any) {
        console.error('Safety net fallback failed for daily lesson:', fallbackErr);
      }
    }

    if (action === 'generateWeeklyLessonPlan') {
      try {
        const geminiService = await getGeminiService();
        const safeWeekly = await geminiService.generateWeeklyLessonPlan(actionParams);
        return res.status(200).json(safeWeekly);
      } catch (fallbackErr: any) {
        console.error('Safety net fallback failed for weekly plan:', fallbackErr);
      }
    }

    if (action === 'generateLanguageArtsWeeklyPlan') {
      try {
        const geminiService = await getGeminiService();
        const safeLAWeekly = await geminiService.generateLanguageArtsWeeklyPlan(actionParams);
        return res.status(200).json(safeLAWeekly);
      } catch (fallbackErr: any) {
        console.error('Safety net fallback failed for LA weekly plan:', fallbackErr);
      }
    }

    if (action === 'generateWeeklyPlan' || action === 'generateWeeklyCurriculumPlan' || action === 'generateWeeklyBreakdown') {
      try {
        const geminiService = await getGeminiService();
        const safeBreakdown = await geminiService.generateWeeklyBreakdown(actionParams);
        return res.status(200).json(safeBreakdown);
      } catch (fallbackErr: any) {
        console.error('Safety net fallback failed for breakdown:', fallbackErr);
      }
    }

    if (action === 'generateCyclePacingMap') {
      try {
        const geminiService = await getGeminiService();
        const safePacing = await geminiService.generateCyclePacingMap(actionParams);
        return res.status(200).json(safePacing);
      } catch (fallbackErr: any) {
        console.error('Safety net fallback failed for pacing map:', fallbackErr);
      }
    }

    if (action === 'generatePowerPoint' || action === 'rebuildPowerPoint') {
      try {
        const { buildDeterministicPowerPoint } = await import('../../src/lib/powerpointService');
        return res.status(200).json(buildDeterministicPowerPoint(actionParams));
      } catch (fallbackErr: any) {
        console.error('Safety net fallback failed for PowerPoint:', fallbackErr);
      }
    }

    if (action === 'generateLessonResources') {
      try {
        const safeRes = await generateLessonResources(actionParams.grade || 'Standard 2', actionParams.topic || 'Curriculum Concept');
        return res.status(200).json(safeRes);
      } catch (fallbackErr: any) {
        console.error('Safety net fallback failed for resources:', fallbackErr);
      }
    }

    if (action === 'generateWeeklyTest') {
      try {
        const { buildWeeklyCoverageMap, buildDeterministicTestQuestions } = await import('../../src/lib/weeklyTestService');
        const coverage = buildWeeklyCoverageMap({
          classLevel: actionParams.grade || actionParams.classLevel || 'Standard 4',
          subject: actionParams.subject || 'Mathematics',
          academicYear: actionParams.academicYear || '2026-2027',
          cycle: actionParams.cycle || 1,
          week: actionParams.week || 1
        });
        const questions = buildDeterministicTestQuestions(coverage, {
          questionCount: actionParams.questionCount || 10,
          questionTypes: actionParams.questionTypes || 'Mixed Question Types',
          difficulty: actionParams.difficulty || 'Mixed',
          timeAllowed: actionParams.timeAllowed || '45 minutes',
          totalMarks: actionParams.questionCount || 10,
          instructions: actionParams.instructions || 'Answer all questions in the spaces provided.',
          randomizeQuestions: false,
          randomizeAnswerChoices: false,
          includeAnswerKey: true
        });
        return res.status(200).json({
          coverage,
          questions,
          totalMarks: questions.reduce((acc: number, q: any) => acc + (q.marks || 1), 0)
        });
      } catch (fallbackErr: any) {
        console.error('Safety net fallback failed for weekly test:', fallbackErr);
      }
    }

    // Format friendly message
    let finalUserMessage = cleanMessage;
    if (cleanMessage.includes('503') || cleanMessage.includes('UNAVAILABLE') || cleanMessage.includes('high demand')) {
      finalUserMessage = "The AI service is temporarily experiencing high demand. Please try again in a few moments.";
    } else if (cleanMessage.includes('429') || cleanMessage.includes('RESOURCE_EXHAUSTED') || cleanMessage.includes('quota')) {
      finalUserMessage = "AI rate limit reached. Please wait a few moments before trying again.";
    }

    return res.status(500).json({
      success: false,
      error: finalUserMessage
    });
  }
}
