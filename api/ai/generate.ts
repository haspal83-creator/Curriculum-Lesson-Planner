import 'dotenv/config';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as staticGeminiService from '../../src/services/gemini.implementation';
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

      default:
        return res.status(400).json({
          success: false,
          error: `Unknown action: ${action}`
        });
    }

    const payload = result !== undefined && result !== null ? result : "";
    return res.status(200).json(payload);

  } catch (error: any) {
    console.error('Lesson generation API error:', {
      action,
      message: error?.message,
      stack: error?.stack,
      details: error?.details || error?.response?.data
    });

    return res.status(500).json({
      success: false,
      error: error?.message || 'Internal Server Error during lesson generation',
      details: error?.details || undefined
    });
  }
}
