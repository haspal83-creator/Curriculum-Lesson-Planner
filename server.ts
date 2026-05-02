import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import * as geminiService from "./src/services/gemini.implementation";
import { generateLessonResources } from "./src/lib/gemini";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // API Routes
  app.post("/api/ai/generate", async (req, res) => {
    try {
      const { action, params } = req.body;
      let result;

      switch (action) {
        case 'generateLessonPlan':
          result = await geminiService.generateLessonPlan(params);
          break;
        case 'generateWeeklyPlan':
          const { grade, subject, cycle, entries, numWeeks, lessonsPerWeek } = params;
          result = await geminiService.generateWeeklyPlan(grade, subject, cycle, entries, numWeeks, lessonsPerWeek);
          break;
        case 'generateWeeklyBreakdown':
          result = await geminiService.generateWeeklyBreakdown(params);
          break;
        case 'generateWeeklyCurriculumPlan':
          // Fallback to generateWeeklyBreakdown if needed, or if it's the same thing
          result = await geminiService.generateWeeklyBreakdown(params);
          break;
        case 'parseCurriculum':
          result = await geminiService.parseCurriculum(params.fileData, params.text);
          break;
        case 'parseCurriculumUnit':
          result = await geminiService.parseCurriculumUnit(params.fileData, params.text);
          break;
        case 'generateFullWeek':
          result = await geminiService.generateFullWeek(params);
          break;
        case 'improveContent':
          result = await geminiService.improveContent(params.content, params.instruction, params.context);
          break;
        case 'regenerateSection':
          result = await geminiService.regenerateSection(params.sectionName, params.lessonContext);
          break;
        case 'generateLessonResources':
          result = await generateLessonResources(params.grade, params.topic);
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
          result = await geminiService.generateResource(params.type, params.lessonContext, params.options);
          break;
        case 'generateWeeklyLessonPlan':
          result = await geminiService.generateWeeklyLessonPlan(params);
          break;
        case 'generateReteachLesson':
          result = await geminiService.generateReteachLesson(params.originalPlan, params.assessmentRecord);
          break;
        case 'generateInterventionWork':
          result = await geminiService.generateInterventionWork(params.lessonPlan, params.assessmentRecord);
          break;
        case 'generateCatchUpLesson':
          result = await geminiService.generateCatchUpLesson(params.lessonPlan);
          break;
        case 'generateRevisionWeek':
          result = await geminiService.generateRevisionWeek(params.grade, params.subject, params.weakOutcomes, params.misconceptions);
          break;
        case 'generateYearlyCurriculumMap':
          result = await geminiService.generateYearlyCurriculumMap(params.grade, params.subject, params.curriculum, params.calendar);
          break;
        case 'generateCyclePlan':
          result = await geminiService.generateCyclePlan(params.map, params.cycleNumber, params.calendar);
          break;
        case 'generateWeeklyTeachingPlan':
          result = await geminiService.generateWeeklyTeachingPlan(params.cyclePlan, params.weekNumber, params.calendar);
          break;
        case 'generateLessonVideo':
          result = await geminiService.generateLessonVideo(params.lesson, params.voiceSettings, params.avatarSettings);
          break;
        default:
          throw new Error(`Unknown action: ${action}`);
      }

      res.json(result);
    } catch (error: any) {
      console.error("AI Error Details:", {
        message: error.message,
        stack: error.stack,
        details: error.details || error.response?.data
      });
      res.status(500).json({ 
        error: error.message || "Internal Server Error",
        details: error.details || "Check server logs for more info"
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
