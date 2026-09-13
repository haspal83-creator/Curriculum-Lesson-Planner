import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as geminiService from '../../src/services/gemini.implementation';
import { generateLessonResources } from '../../src/lib/gemini';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method not allowed'
    });
  }

  try {
    const { action, params } = req.body;

    if (!action) {
      return res.status(400).json({
        error: 'Missing action'
      });
    }

    let result;

    switch (action) {
      case 'generateLessonPlan':
        result = await geminiService.generateLessonPlan(params);
        break;

      case 'generateLanguageArtsDailyPlan':
        result = await geminiService.generateLanguageArtsDailyPlan(params);
        break;

      case 'generateWeeklyPlan': {
        const { grade, subject, cycle, entries, numWeeks, lessonsPerWeek } = params;
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
        result = await geminiService.generateWeeklyBreakdown(params);
        break;

      case 'generateWeeklyCurriculumPlan':
        result = await geminiService.generateWeeklyBreakdown(params);
        break;

      case 'parseCurriculum':
        result = await geminiService.parseCurriculum(
          params.fileData,
          params.text
        );
        break;

      case 'parseCurriculumUnit':
        result = await geminiService.parseCurriculumUnit(
          params.fileData,
          params.text
        );
        break;

      case 'generateFullWeek':
        result = await geminiService.generateFullWeek(params);
        break;

      case 'improveContent':
        result = await geminiService.improveContent(
          params.content,
          params.instruction,
          params.context
        );
        break;

      case 'regenerateSection':
        result = await geminiService.regenerateSection(
          params.sectionName,
          params.lessonContext
        );
        break;

      case 'generateLessonResources':
        result = await generateLessonResources(
          params.grade,
          params.topic
        );
        break;

      case 'generateCyclePacingMap':
        result = await geminiService.generateCyclePacingMap(params);
        break;

      case 'calculateCoverage':
        result = await geminiService.calculateCoverage(params);
        break;

      case 'generateLanguageArtsWeeklyPlan':
        result = await geminiService.generateLanguageArtsWeeklyPlan(params);
        break;

      case 'generateResource':
        result = await geminiService.generateResource(
          params.type,
          params.lessonContext,
          params.options
        );
        break;

      case 'generateWeeklyLessonPlan':
        result = await geminiService.generateWeeklyLessonPlan(params);
        break;

      case 'generateReteachLesson':
        result = await geminiService.generateReteachLesson(
          params.originalPlan,
          params.assessmentRecord
        );
        break;

      case 'generateInterventionWork':
        result = await geminiService.generateInterventionWork(
          params.lessonPlan,
          params.assessmentRecord
        );
        break;

      case 'generateCatchUpLesson':
        result = await geminiService.generateCatchUpLesson(
          params.lessonPlan
        );
        break;

      case 'generateRevisionWeek':
        result = await geminiService.generateRevisionWeek(
          params.grade,
          params.subject,
          params.weakOutcomes,
          params.misconceptions
        );
        break;

      case 'generateYearlyCurriculumMap':
        result = await geminiService.generateYearlyCurriculumMap(
          params.grade,
          params.subject,
          params.curriculum,
          params.calendar
        );
        break;

      case 'generateCyclePlan':
        result = await geminiService.generateCyclePlan(
          params.map,
          params.cycleNumber,
          params.calendar
        );
        break;

      case 'generateWeeklyTeachingPlan':
        result = await geminiService.generateWeeklyTeachingPlan(
          params.cyclePlan,
          params.weekNumber,
          params.calendar
        );
        break;

      case 'generateLessonVideo':
        result = await geminiService.generateLessonVideo(
          params.lesson,
          params.voiceSettings,
          params.avatarSettings
        );
        break;

      default:
        return res.status(400).json({
          error: `Unknown action: ${action}`
        });
    }

    return res.status(200).json(result);

  } catch (error: any) {
    console.error('AI Error Details:', error);

    return res.status(500).json({
      error: error?.message || 'Internal Server Error',
      details: error?.details || 'Check Vercel runtime logs for more information.'
    });
  }
}
