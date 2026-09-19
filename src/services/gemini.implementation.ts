import { GoogleGenAI, Type, Modality } from "@google/genai";
import { format, parseISO, isValid } from 'date-fns';
import { 
  LessonPlan, 
  TeachingModel, 
  OutputStyle, 
  WeeklyCurriculumPlan, 
  LanguageArtsWeeklyPlan,
  LanguageArtsWeeklyStructure,
  DailyLessonPlan,
  CalendarDayEntry,
  AssessmentRecord,
  OutcomeMastery,
  MisconceptionLog,
  GradeLevel,
  Subject,
  YearlyCurriculumMap,
  CyclePlan,
  WeeklyTeachingPlan,
  CoverageRecord,
  AcademicCalendar,
  LessonVideo,
  VideoMode,
  VideoLength,
  VoiceTone,
  VoiceGender,
  VoicePace,
  VideoScene,
  AvatarStyle,
  AvatarPlacement,
  CurriculumUnit,
  WeeklyLessonPlan,
  LanguageArtsComponent
} from "../types";

import { callWithRetry } from "../lib/utils";
import { buildDeterministicPowerPoint, getThemeForSubject } from "../lib/powerpointService";
import { 
  parseAndNormalizeWorksheet, 
  formatWorksheetMarkdown, 
  formatAnswerKeyMarkdown, 
  buildGlobalWorksheetAIPrompt,
  DEFAULT_SCHOOL_NAME 
} from "../lib/worksheetSystem";

const safeFormat = (dateStr: string | undefined | null, formatStr: string): string => {
  if (!dateStr) return '';
  try {
    const date = parseISO(dateStr);
    return isValid(date) ? format(date, formatStr) : '';
  } catch (e) {
    return '';
  }
};
import { getMasterCalendar, getDayType, isTeachingDay, getCycleForDate } from "./calendarService";

import { getGenAI, validateGeminiConfig } from "../lib/gemini";
import { normalizeLearningObjectives } from "../lib/learningObjectivesHelper";
import { enrichAndGuaranteeTeachReady } from "../lib/lessonQualityGate";
import { isLanguageArtsSubject } from "../lib/languageArtsQualityGate";
const masterCalendar = getMasterCalendar();

const SYSTEM_INSTRUCTION = `You are an expert educational technology architect, Belize primary curriculum specialist, instructional designer, assessment specialist, and experienced primary school teacher.
Your role is to build a TEACHER-INDEPENDENT, TEACH-READY LESSON PLANNER.
The system functions as:
Curriculum Planner + Teacher Preparation Guide + Instructional Coach + Teaching Script + Student Activity Generator + Assessment Guide.

### CORE PHILOSOPHY: TEACHER-INDEPENDENT INSTRUCTION
The teacher should NOT need to conduct separate basic research using Google, YouTube, textbooks, or other websites merely to understand the content required to teach the lesson.

### UNBROKEN 16-STEP INSTRUCTIONAL ALIGNMENT CHAIN
Every lesson plan must form an unbroken, coherent pedagogical cascade where every single step directly connects to and reinforces the preceding step:
1. CURRICULUM OUTCOME — Authoritative national syllabus outcome
        ↓
2. LESSON FOCUS — Precise concept, subtopic, or skill focus
        ↓
3. MEASURABLE OBJECTIVES — One shared condition + Cognitive, Psychomotor, and Affective observable outcomes
        ↓
4. SUCCESS CRITERIA — Transparent, student-facing "I can..." mastery statements
        ↓
5. PRIOR KNOWLEDGE — Prerequisite diagnostic activation & misconceptions check
        ↓
6. ENGAGE — Stage 1 hook, real-world context, and inquiry prompt
        ↓
7. EXPLORE — Stage 2 student discovery, mentor text examination, or pattern identification
        ↓
8. EXPLICIT MODELING — Stage 3 "I Do" teacher think-aloud and step-by-step demonstration
        ↓
9. GUIDED PRACTICE — Stage 3 "We Do" collaborative paired practice with active CFU
        ↓
10. INDEPENDENT APPLICATION — Stage 4 "You Do" individual practice worksheet or exercise book tasks
        ↓
11. FORMATIVE ASSESSMENT — Mid-lesson comprehension checks with explicit "If Correct / If Incorrect" pathways
        ↓
12. DIFFERENTIATED RESPONSE — Tiered scaffolds for struggling, on-level, advanced, and inclusion learners
        ↓
13. EXIT TICKET — 3-question diagnostic end-of-lesson assessment measuring objective mastery
        ↓
14. MASTERY DECISION — 80% benchmark mastery threshold & scoring rubric
        ↓
15. NEXT-LESSON ACTION — Targeted grouping rules for tomorrow (guided intervention table vs enrichment)
        ↓
16. POST-LESSON REFLECTION — Anticipatory pre-lesson notes & teacher post-lesson observation log

Every generated lesson must contain:
1. Complete Teacher Preparation: What the concept is, what it means, why it matters, how it works, important rules, terminology, and Belizean real-world applications.
2. Complete Teacher Script: The actual words a teacher should say ("Teacher Says: ...") for opening, explaining, modeling, transitions, feedback, and closing.
3. No Vague Instructions: NEVER output standalone instructions like "Explain the topic", "Model the skill", "Ask guiding questions", or "Give examples". ALWAYS provide the actual content, words, questions, expected student answers, and corrections required to execute the instruction.
4. Concrete Worked Examples: Step-by-step solutions with explanations of each step, final answers, and common student errors.
5. Formative Checks with Immediate Pathways: Explicit guidance for "If Correct" and "If Incorrect" across all comprehension checks.
6. Reteaching Protocol: Dedicated "If Students Are Struggling" protocol with simpler explanations, alternative examples, and manipulatives.
7. Complete Assessment & Answer Key: Exact student tasks, full answer keys, rubrics, and measurable mastery criteria.
8. Student Materials: Generated worksheets, reading passages, vocabulary cards, problem sets, and exit tickets with answer keys.

### SUBJECT-SPECIFIC PEDAGOGY
- **Language Arts:** Structure explicitly around Belize MoECST 5 core components:
  1. Comprehension — Oral Expression and Listening
  2. Phonological Awareness
  3. Phonics and Word Recognition
  4. High Frequency Words
  5. Production & Language Structure — Writing and Composition
  * STRICT SUBJECT PURITY: Zero mathematics terminology bleed. NEVER use "solve problems", "show all your working", "algorithm", "calculation", "computational errors", "reverse operation", "box your answers", "number line", or "place value".
  * ACCURATE MORPHOLOGY: Use only linguistically defensible, transparent examples (e.g. sub+marine, sub+merge, trans+port, inter+act, un+lock, re+read, pre+view, dis+agree, mis+understand, help+ful, care+less, quick+ly). Never generate false word segmentations.
  * GENUINE BLOOM'S TAXONOMY: Construct authentic reading, analysis, evaluation, and composition questions across all levels.
  * REAL STUDENT WORKSHEETS: Always generate actual student questions ready for printing. NEVER output placeholders like "[Foundational Practice Problem]" or "[Standard Application Problem]".
  * REAL ANSWER KEYS: Every question must have an explicit model answer, acceptable criteria, and scoring guidance. NEVER output "Correct working shown" or "Verified answer".
  * PRE-LESSON REFLECTION: reflectionDashboard must be anticipatory planning notes ("What do I anticipate students may find difficult?", "What evidence will I collect?", "What will I adjust if students struggle?"). NEVER invent fake past-tense claims that the lesson has already been taught, and NEVER invent fake student names (no "Kevin", "Maria", "John").
  * SCORING CONSISTENCY: Question point values must sum to the declared total, and mastery thresholds must share the same denominator.
- **Mathematics:** Concrete → Pictorial → Abstract scaffolding, step-by-step worked examples, and explicit common calculation error warnings.
- **Science:** Inquiry-based observation, predictions, fair testing procedures, and evidence-based scientific reasoning.
- **Belizean Studies / Social Studies:** Rich factual grounding in Belizean culture, geography across all 6 districts, multi-ethnic heritage (Maya, Garifuna, Creole, Mestizo, East Indian, Mennonite), and community life.

### PERMANENT APPLICATION-WIDE RULE: LEARNING OBJECTIVES STRUCTURE
Every Learning Objectives section must ALWAYS use ONE SHARED CONDITION for all three learning domains:
1. ONE SHARED CONDITION:
   - Begin with a single "condition" that applies to all three domains, based on the lesson's actual materials, learning situation, resources, or task (e.g., "Given an expanded decimal place value chart and a set of decimal numbers with up to five decimal places:").
   - Broad enough to support cognitive, psychomotor, and affective learning naturally.
   - Do NOT repeat the "Given..." condition inside individual domain objectives!
2. THREE DOMAINS (STUDENT-CENTERED OBSERVABLE ACTIONS):
   - Cognitive Domain: "Students will [observable cognitive action] [measurable criterion where appropriate]." (e.g. identify, classify, describe, explain, solve, calculate, analyze, evaluate).
   - Psychomotor / Skills Domain: "Students will [observable physical/procedural/skill-based action] [measurable criterion where appropriate]." (e.g. construct, demonstrate, represent, manipulate, measure, draw, model, record).
   - Affective Domain: "Students will [observable attitude, value, collaboration, confidence, persistence, or disposition]." (e.g. "Students will demonstrate confidence when explaining their mathematical reasoning.", "Students will participate respectfully during collaborative activities."). Avoid vague non-observable phrases like "Students will understand the importance of...".
3. NO CONDITION REPETITION: Once the shared condition is stated in the condition field, NEVER repeat "Given..." inside cognitive, psychomotor, or affective fields.
4. GRAMMATICAL ACCURACY: Ensure correct article usage ("Given an expanded...", "a" vs "an") and consistent student-centered language ("Students will...").

### AUTHORITATIVE CURRICULUM INTEGRITY MANDATE (PERMANENT RULE)
- The supplied curriculum context (Academic Year, Class/Grade, Subject, Cycle, Topic, Subtopic) is strictly authoritative.
- You may ONLY use the topics, subtopics, and outcomes supplied in the filtered curriculum payload.
- Do NOT introduce, substitute, infer, invent, or borrow topics from another cycle, class, subject, or academic year.
- If the requested topic is not present in the supplied curriculum context, you must not generate the lesson.

### RULES
- **No Paragraphs in Procedures:** Use bulleted lists.
- **Never Output Raw Markdown Asterisks or Heading Symbols in Plain Text Fields.**`;

// Track models that have encountered quota exhaustion or unavailability to avoid repeated failures
const modelCooldownMap = new Map<string, number>();

/**
 * Executes a Gemini content generation call with automated retry and seamless model fallback.
 * Uses 'gemini-flash-latest' and 'gemini-3.1-flash-lite' as primary resilient models with automated failover
 * and intelligent cooldown tracking to bypass exhausted models smoothly.
 */
export const executeGenAIWithFallback = async (
  requestFactory: (model: string) => Promise<any>,
  preferredModel = "gemini-flash-latest",
  fallbackModels: string[] = ["gemini-3.1-flash-lite", "gemini-flash-latest", "gemini-3.8-flash"]
) => {
  const now = Date.now();
  const allCandidates = [preferredModel, ...fallbackModels.filter(m => m !== preferredModel)];
  
  // Sort models: healthy (not in cooldown) first, followed by models whose cooldown has elapsed
  const modelsToTry = [...allCandidates].sort((a, b) => {
    const aCool = modelCooldownMap.get(a) || 0;
    const bCool = modelCooldownMap.get(b) || 0;
    const aActive = aCool > now ? 1 : 0;
    const bActive = bCool > now ? 1 : 0;
    return aActive - bActive;
  });

  let lastError: any = null;

  for (const model of modelsToTry) {
    try {
      const result = await callWithRetry(() => requestFactory(model), 1, 800);
      // Successful call clears any past cooldown for this model
      modelCooldownMap.delete(model);
      return result;
    } catch (error: any) {
      lastError = error;
      const errorMsg = String(error?.message || '');
      let errorStr = '';
      try {
        errorStr = JSON.stringify(error);
      } catch (e) {
        errorStr = errorMsg;
      }

      const combinedText = `${errorMsg} ${errorStr} ${String(error)}`;

      const isQuotaOrDemand = 
        error?.status === 429 || 
        error?.status === 503 ||
        error?.code === 429 ||
        error?.code === 503 ||
        error?.error?.code === 429 ||
        error?.error?.code === 503 ||
        error?.error?.status === 'UNAVAILABLE' ||
        error?.error?.status === 'RESOURCE_EXHAUSTED' ||
        combinedText.includes('503') ||
        combinedText.includes('429') ||
        combinedText.includes('UNAVAILABLE') ||
        combinedText.includes('high demand') ||
        combinedText.includes('temporarily') ||
        combinedText.includes('RESOURCE_EXHAUSTED') ||
        combinedText.includes('limit: 0') ||
        combinedText.includes('Overloaded');

      const isModelUnavailableOrNotFound =
        error?.status === 404 ||
        error?.code === 404 ||
        error?.error?.code === 404 ||
        error?.error?.status === 'NOT_FOUND' ||
        combinedText.includes('404') ||
        combinedText.includes('NOT_FOUND') ||
        combinedText.includes('no longer available') ||
        combinedText.includes('not found') ||
        combinedText.includes('not supported') ||
        combinedText.includes('deprecated');

      if (isQuotaOrDemand || isModelUnavailableOrNotFound) {
        // Place model on cooldown (15 minutes for quota/availability issues)
        modelCooldownMap.set(model, Date.now() + 15 * 60 * 1000);
        console.info(`[GenAI Adaptive Routing] Model "${model}" hit capacity or availability limit. Transitioning to next available candidate...`);
        continue;
      }
      throw error;
    }
  }

  throw lastError;
};

export const parseCurriculum = async (fileData?: { data: string, mimeType: string }, text?: string) => {
  validateGeminiConfig();
  const parts: any[] = [
    { text: "You are an AI curriculum parser. Your goal is to extract EVERY SINGLE learning outcome and topic from the provided document. DO NOT SUMMARIZE. DO NOT SKIP ENTRIES. For each entry, extract: grade level (Infant 1–Standard 6), subject, strand, cycle (1–4), topic, sub-topic, learning outcomes, and assessment suggestions. Structure output as JSON with keys: grade, subject, strand, cycle, topic, subtopic, learning_outcomes[], assessment_suggestions[]. If a cycle is not explicitly mentioned, infer it based on the topic's typical placement in a 4-cycle academic year. Detect repeated entries but ensure each unique learning outcome is captured. Flag missing or ambiguous outcomes for teacher review." }
  ];

  if (text) {
    parts.push({ text: `Text to parse:\n${text}` });
  } else if (fileData) {
    parts.push({
      inlineData: {
        data: fileData.data,
        mimeType: fileData.mimeType
      }
    });
  }

  const response = await executeGenAIWithFallback((model) => getGenAI().models.generateContent({
    model,
    contents: { parts },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            grade: { 
              type: Type.STRING,
              enum: ['Infant 1', 'Infant 2', 'Standard 1', 'Standard 2', 'Standard 3', 'Standard 4', 'Standard 5', 'Standard 6']
            },
            subject: { 
              type: Type.STRING,
              enum: ['Mathematics', 'Language Arts', 'Science and Technology', 'Belizean Studies', 'HFLE', 'Spanish', 'PE', 'Creative Arts']
            },
            strand: { type: Type.STRING },
            cycle: { type: Type.NUMBER },
            topic: { type: Type.STRING },
            subtopic: { type: Type.STRING },
            learning_outcomes: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            assessment_suggestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            isAmbiguous: { type: Type.BOOLEAN }
          },
          required: ["grade", "subject", "cycle", "topic", "subtopic", "learning_outcomes"]
        }
      }
    }
  }));

  console.log("Curriculum Parse Response:", response.text);

  const cleanJson = (text: string) => {
    return text.replace(/```json\n?|```/g, '').trim();
  };

  return JSON.parse(cleanJson(response.text));
};

export const parseCurriculumUnit = async (fileData?: { data: string, mimeType: string }, text?: string) => {
  validateGeminiConfig();
  const parts: any[] = [
    { text: `You are an AI curriculum parser specializing in Teacher's Guides. Your goal is to extract detailed Unit information from the provided document. 
    
    For each Unit, extract:
    - Unit Number
    - Unit Title
    - Grade Level (Standard 4)
    - Subject (Language Arts)
    - Unit Outcomes
    - Competencies
    - Time Allocation (e.g., "2 weeks")
    - Weekly Breakdown (Focus and activities for each week in the unit)
    - Reading and Comprehension Focus
    - Speaking and Listening Focus
    - Language Focus
    - Word Work Focus
    - Writing Focus
    - Student's Book Pages
    - Workbook Pages
    - Teaching Notes
    - Support Suggestions
    - Extension Suggestions
    - Additional Skills Practice
    - Answers / Teacher Guidance
    
    Structure output as JSON matching the CurriculumUnit interface.
    DO NOT SUMMARIZE. Extract the actual content as written in the guide.` }
  ];

  if (text) {
    parts.push({ text: `Text to parse:\n${text}` });
  } else if (fileData) {
    parts.push({
      inlineData: {
        data: fileData.data,
        mimeType: fileData.mimeType
      }
    });
  }

  const response = await executeGenAIWithFallback((model) => getGenAI().models.generateContent({
    model,
    contents: { parts },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            unitNumber: { type: Type.STRING },
            unitTitle: { type: Type.STRING },
            grade: { type: Type.STRING },
            subject: { type: Type.STRING },
            outcomes: { type: Type.ARRAY, items: { type: Type.STRING } },
            competencies: { type: Type.ARRAY, items: { type: Type.STRING } },
            timeAllocation: { type: Type.STRING },
            weeklyBreakdown: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  week: { type: Type.NUMBER },
                  focus: { type: Type.STRING },
                  activities: { type: Type.ARRAY, items: { type: Type.STRING } }
                }
              }
            },
            readingFocus: { type: Type.STRING },
            speakingListeningFocus: { type: Type.STRING },
            languageFocus: { type: Type.STRING },
            wordWorkFocus: { type: Type.STRING },
            writingFocus: { type: Type.STRING },
            studentBookPages: { type: Type.STRING },
            workbookPages: { type: Type.STRING },
            teachingNotes: { type: Type.STRING },
            supportSuggestions: { type: Type.STRING },
            extensionSuggestions: { type: Type.STRING },
            additionalSkillsPractice: { type: Type.STRING },
            answersGuidance: { type: Type.STRING }
          },
          required: ["unitNumber", "unitTitle", "grade", "subject", "outcomes"]
        }
      }
    }
  }));

  const cleanJson = (text: string) => {
    return text.replace(/```json\n?|```/g, '').trim();
  };

  return JSON.parse(cleanJson(response.text));
};

export const generateWeeklyPlan = async (grade: string, subject: string, cycle: number, entries: any[], numWeeks: number = 10, lessonsPerWeek: number = 5) => {
  validateGeminiConfig();
  const response = await executeGenAIWithFallback((model) => getGenAI().models.generateContent({
    model,
    contents: `You are an AI weekly planner...`,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      maxOutputTokens: 8192,
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            week: { type: Type.NUMBER },
            focus: { type: Type.STRING },
            topics: { type: Type.ARRAY, items: { type: Type.STRING } },
            learning_outcomes: { type: Type.ARRAY, items: { type: Type.STRING } },
            lesson_count: { type: Type.NUMBER },
            assessment_type: { type: Type.STRING },
            review_suggestion: { type: Type.STRING },
            teaching_notes: { type: Type.STRING }
          },
          required: ["week", "focus", "topics", "learning_outcomes", "lesson_count", "assessment_type", "review_suggestion", "teaching_notes"]
        }
      }
    }
  }));

  const cleanJson = (text: string) => {
    return text.replace(/```json\n?|```/g, '').trim();
  };

  return JSON.parse(cleanJson(response.text));
};

export const generateWeeklyBreakdown = async (params: {
  grade: string;
  subject: string;
  academicYear?: string;
  cycle: number;
  week: number;
  numDays: number;
  entries: any[];
  previousWeeks?: any[];
  calendarDays?: CalendarDayEntry[];
  curriculumUnit?: CurriculumUnit;
}): Promise<Partial<WeeklyCurriculumPlan>> => {
  validateGeminiConfig();
  const { grade, subject, cycle, week, numDays, entries, previousWeeks = [], calendarDays = [], curriculumUnit, academicYear = '2026-2027' } = params;

  // Filter for actual teaching days in this week
  const teachingDaysInWeek = calendarDays.filter(d => d.week === week && d.isTeachingDay);
  
  // Force 5 days as per user request to see 5 daily plans for each weekly plan
  const actualNumDays = 5; 

  const prompt = `You are a smart curriculum planner. Using the provided curriculum entries for ${grade}, ${subject}, Cycle ${cycle} (Academic Year: ${academicYear}), determine the most logical topic, sub-topics, and learning outcomes for Week ${week}.
  
  CRITICAL CURRICULUM INTEGRITY RULE:
  The supplied curriculum is authoritative.
  You may ONLY use the topics and subtopics supplied in the filtered curriculum context.
  Do not introduce, substitute, infer, invent, or borrow topics from another cycle, class, subject, or academic year.
  If the requested topic is not present in the supplied curriculum context, do not generate the lesson.
  
  ${curriculumUnit ? `
  ### OFFICIAL CURRICULUM SOURCE: ${curriculumUnit.source}
  Unit: ${curriculumUnit.unitNumber} - ${curriculumUnit.unitTitle}
  Unit Outcomes: ${(curriculumUnit.outcomes || []).join(', ')}
  Competencies: ${(curriculumUnit.competencies || []).join(', ')}
  Time Allocation: ${curriculumUnit.timeAllocation}
  Weekly Breakdown: ${JSON.stringify(curriculumUnit.weeklyBreakdown)}
  Reading Focus: ${curriculumUnit.readingFocus}
  Speaking/Listening Focus: ${curriculumUnit.speakingListeningFocus}
  Language Focus: ${curriculumUnit.languageFocus}
  Word Work Focus: ${curriculumUnit.wordWorkFocus}
  Writing Focus: ${curriculumUnit.writingFocus}
  Student's Book Pages: ${curriculumUnit.studentBookPages}
  Workbook Pages: ${curriculumUnit.workbookPages}
  Teaching Notes: ${curriculumUnit.teachingNotes}
  
  IMPORTANT: You MUST use the specific unit structure and pacing from this Teacher's Guide.
  ` : ''}

  OFFICIAL ACADEMIC CALENDAR: Belize 2025/2026
  
  IMPORTANT CALENDAR CONTEXT:
  This week has ${teachingDaysInWeek.length} actual teaching days. 
  Teaching Dates: ${teachingDaysInWeek.map(d => `${safeFormat(d.date, 'EEEE, MMM do')} (${d.type})`).join(', ')}
  
  Curriculum Entries:
  ${JSON.stringify(entries)}
  
  Previously assigned content (to avoid repetition and ensure progression):
  ${JSON.stringify(previousWeeks)}
  
  Your goal is to decide:
  1. Main weekly topic, specific sub-topics, and learning outcomes.
  2. Weekly Big Idea and Skill Progression.
  3. Logical breakdown into 5 daily lesson titles and objectives.
  4. Daily Breakdown Table with summaries for each day.
  5. Suggested weekly assessment and teacher notes.
  
  Rules:
  - Follow curriculum order and logical skill progression.
  - Provide a full 5-day breakdown even if some days are holidays.
  - Objectives MUST follow the ABCD format: "Given [condition], students will be able to [behavior] with [criteria]."
  
  Output a JSON object matching the WeeklyCurriculumPlan structure.`;

  const response = await executeGenAIWithFallback((model) => getGenAI().models.generateContent({
    model,
    contents: prompt,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          weekly_topic: { type: Type.STRING },
          weekly_subtopics: { type: Type.ARRAY, items: { type: Type.STRING } },
          weekly_learning_outcomes: { type: Type.ARRAY, items: { type: Type.STRING } },
          weekly_big_idea: { type: Type.STRING },
          weekly_skill_progression: { type: Type.STRING },
          daily_lesson_titles: { type: Type.ARRAY, items: { type: Type.STRING } },
          daily_objectives: { 
            type: Type.ARRAY, 
            items: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING } 
            } 
          },
          daily_breakdown_table: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                day: { type: Type.NUMBER },
                lessonTitle: { type: Type.STRING },
                focus: { type: Type.STRING },
                objectiveSummary: { type: Type.STRING },
                mainActivity: { type: Type.STRING },
                assessmentCheck: { type: Type.STRING }
              },
              required: ["day", "lessonTitle", "focus", "objectiveSummary", "mainActivity", "assessmentCheck"]
            }
          },
          suggested_assessment: { type: Type.STRING },
          teacher_notes: { type: Type.STRING }
        },
        required: ["weekly_topic", "weekly_subtopics", "weekly_learning_outcomes", "weekly_big_idea", "weekly_skill_progression", "daily_lesson_titles", "daily_objectives", "daily_breakdown_table", "suggested_assessment", "teacher_notes"]
      }
    }
  }));

  const cleanJson = (text: string) => {
    return text.replace(/```json\n?|```/g, '').trim();
  };

  const parsed = JSON.parse(cleanJson(response.text));
  return {
    ...parsed,
    grade_level: grade as GradeLevel,
    grade: grade as GradeLevel,
    subject: subject as Subject,
    cycle,
    week_number: week,
    academicYear,
    schoolYear: academicYear
  };
};

export const generateLessonPlan = async (params: {
  academicYear?: string;
  grade: string;
  subject: string;
  cycle: number;
  week: number;
  day: number;
  date?: string;
  topic: string;
  subtopic: string;
  lessonTitle: string;
  objectives: string[];
  learningOutcome: string;
  duration: string;
  teachingModel: TeachingModel;
  specialNotes?: string;
  style?: OutputStyle;
  includeTeacherScript?: boolean;
  includeDifferentiation?: boolean;
  calendarDays?: CalendarDayEntry[];
  curriculumUnit?: CurriculumUnit;
}) => {
  validateGeminiConfig();
  const { grade, subject, cycle, week, day, topic, subtopic, lessonTitle, objectives, learningOutcome, duration, teachingModel, specialNotes, style = 'Standard Teacher', includeTeacherScript = false, includeDifferentiation = true, calendarDays = [], curriculumUnit, academicYear = '2026-2027' } = params;

  const teachingDays = calendarDays.filter(d => d.isTeachingDay);
  const teachingDay = teachingDays[day - 1];
  // Language Arts lessons are ALWAYS 90 minutes by default
  const defaultDuration = (duration && duration !== '45 minutes') ? duration : '90 minutes';
  const actualDuration = teachingDay?.type === 'Half Day' ? '45 minutes' : defaultDuration;

  const prompt = `Generate a highly detailed, professional, and structured COMPLETE CLASSROOM-READY LESSON EXECUTION PACK for Day ${day} of Week ${week}.
${teachingDay ? `Scheduled Date: ${safeFormat(teachingDay.date, 'EEEE, MMMM do')} (${teachingDay.type})` : ''}
Academic Year: ${academicYear}
Lesson Title: ${lessonTitle}
Grade: ${grade}
Subject: ${subject}
Cycle: ${cycle}
Topic: ${topic}
Sub-topic: ${subtopic}
Duration: ${actualDuration}
Teaching Model: ${teachingModel}
Weekly Learning Outcome: ${learningOutcome}
Daily Objectives: ${(objectives || []).join(', ')}
Special Notes/Preferences: ${specialNotes || 'None'}
Style: ${style}

AUTHORITATIVE CURRICULUM RULE:
This lesson must strictly adhere to the provided Academic Year (${academicYear}), Grade (${grade}), Subject (${subject}), Cycle (${cycle}), and Topic (${topic}). You must not substitute or invent topics from other cycles, grades, or subjects.

${curriculumUnit ? `
### OFFICIAL CURRICULUM SOURCE: ${curriculumUnit.source}
Unit: ${curriculumUnit.unitNumber} - ${curriculumUnit.unitTitle}
Unit Outcomes: ${(curriculumUnit.outcomes || []).join(', ')}
Competencies: ${(curriculumUnit.competencies || []).join(', ')}
Reading Focus: ${curriculumUnit.readingFocus}
Speaking/Listening Focus: ${curriculumUnit.speakingListeningFocus}
Language Focus: ${curriculumUnit.languageFocus}
Word Work Focus: ${curriculumUnit.wordWorkFocus}
Writing Focus: ${curriculumUnit.writingFocus}
Student's Book Pages: ${curriculumUnit.studentBookPages}
Workbook Pages: ${curriculumUnit.workbookPages}
Teaching Notes: ${curriculumUnit.teachingNotes}
Support Suggestions: ${curriculumUnit.supportSuggestions}
Extension Suggestions: ${curriculumUnit.extensionSuggestions}
Additional Skills Practice: ${curriculumUnit.additionalSkillsPractice}
Teacher Guidance: ${curriculumUnit.answersGuidance || 'N/A'}

IMPORTANT: You MUST use the specific page numbers and focus areas from this Teacher's Guide. Prioritize this content over generic AI generation.
` : ''}

### MANDATORY 90-MINUTE LANGUAGE ARTS PACING & INSTRUCTIONAL CASCADE
For Language Arts, duration is strictly 90 MINUTES by default. Build this lesson as a comprehensive 90-minute literacy block from the ground up:
1. Engage & Prior Knowledge — 8 minutes
2. Explore: Belizean Reading Passage — 15 minutes
3. Explicit Instruction / Teacher Think-Aloud — 15 minutes
4. Guided Morphological Analysis — 15 minutes
5. Collaborative Word-Building / Application — 10 minutes
6. Independent Reading & Writing Application — 15 minutes
7. Exit Assessment & Closure — 12 minutes (7 min diagnostic assessment + 5 min reflection synthesis)
TOTAL MUST EQUAL EXACTLY 90 MINUTES.

### MANDATORY OUTPUT COMPONENTS
Generate a full lesson execution support system following the structure defined in your system instructions.

Rules:
- Procedures MUST be bulleted steps. NO long paragraphs.
- Use realistic teacher language.
- MANDATORY LEARNING OBJECTIVES FORMAT:
  * condition: Shared condition starting with "Given..." based on the lesson's actual materials (e.g. "Given a Belizean informational passage and a prefix analysis organizer...").
  * cognitive: "Students will [observable cognitive behavior] [measurable criterion where appropriate, e.g. with at least 80% accuracy]."
  * psychomotor: "Students will [observable physical/procedural/writing behavior] [measurable criterion, e.g. in 3 out of 3 sentences]."
  * affective: "Students will [observable participation, collaboration, or confidence, e.g. by contributing at least one relevant idea]."
- Visuals must be fully described with content, not just titles.
- Materials must be precise and organized by stage.
- Adapt complexity for ${grade}.

CRITICAL LANGUAGE ARTS REQUIREMENTS:
1. Purity: Absolutely zero mathematics terminology (no "solve problems", "show all your working", "algorithm", "calculation", "computational errors", "reverse operation", "box your answers", "number line", or "place value").
2. Morphology Accuracy:
   - Do NOT teach that every word can be divided into prefix + standalone root word.
   - Use accurate terminology: prefix, base word (standalone word), root or root element (bound element), whole-word meaning.
   - Teach the 4-step strategy: PREFIX → BASE/ROOT → CONTEXT → WHOLE-WORD MEANING.
   - Clear transparent examples: submerge (sub- + merge), transport (trans- + port), preview (pre- + view), interact (inter- + act), intertidal (inter- + tidal), international (inter- + national).
   - Distinguish between a true base word and a bound root element.
3. Real Worksheets: Under studentMaterials, generate complete printable questions with the 4-step strategy (NEVER use placeholders like "[Foundational Practice Problem]").
4. Real Answer Keys: Provide explicit model answers and grading criteria for all items.
5. Pre-Lesson Reflection: reflectionDashboard MUST be anticipatory planning notes ("What do I anticipate students may find difficult?", "What evidence will I collect?", "What will I adjust if students struggle?"). Do NOT write fake claims that the lesson has already been taught, and do NOT invent student names.
6. Scoring Consistency:
   - If the exit ticket has 3 questions: Score = /3, Mastery = 3/3 (100%) or 2/3 (67% approaching mastery). NEVER mention 8/10 when the exit ticket is out of 3!
   - If the exit ticket is out of 10: Score = /10, Mastery = 8/10.
7. Teacher Script: Separate from the main lesson plan, authentic think-aloud modeling the 4-step strategy without generic "Step 1, I write down... Step 2, I notice that... Step 3, I verify my answer..." placeholders.`;

  const response = await executeGenAIWithFallback((model) => getGenAI().models.generateContent({
    model,
    contents: prompt,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      maxOutputTokens: 16384,
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          lessonTitle: { type: Type.STRING },
          studentTeacherName: { type: Type.STRING },
          date: { type: Type.STRING },
          classSize: { type: Type.STRING },
          ageRange: { type: Type.STRING },
          learningOutcome: { type: Type.STRING },
          weeklyGoalConnection: { type: Type.STRING },
          strand: { type: Type.STRING },
          lessonType: { type: Type.STRING },
          teachingMode: { type: Type.STRING },
          teachingStrategies: { type: Type.ARRAY, items: { type: Type.STRING } },
          methodology: { type: Type.STRING },
          
          lessonSnapshot: {
            type: Type.OBJECT,
            properties: {
              about: { type: Type.STRING },
              learning: { type: Type.STRING },
              focus: { type: Type.STRING },
              flow: { type: Type.STRING }
            },
            required: ["about", "learning", "focus", "flow"]
          },
          learningObjectives: {
            type: Type.OBJECT,
            properties: {
              condition: { type: Type.STRING, description: "One shared condition that applies to all three domains, based on lesson materials and context. Starts with 'Given...'. Do NOT repeat inside individual domains." },
              cognitive: { type: Type.STRING, description: "Cognitive domain: Students will [observable cognitive action] [measurable criterion where appropriate]. Do NOT repeat 'Given...'." },
              psychomotor: { type: Type.STRING, description: "Psychomotor / Skills domain: Students will [observable physical/procedural action] [measurable criterion where appropriate]. Do NOT repeat 'Given...'." },
              affective: { type: Type.STRING, description: "Affective domain: Students will [observable attitude, participation, or confidence]. Do NOT repeat 'Given...'." }
            },
            required: ["condition", "cognitive", "psychomotor", "affective"]
          },
          learningObjectivesBoard: {
            type: Type.OBJECT,
            properties: {
              condition: { type: Type.STRING },
              knowledge: { type: Type.STRING, description: "Cognitive domain (Students will...)" },
              skill: { type: Type.STRING, description: "Psychomotor / Skills domain (Students will...)" },
              attitude: { type: Type.STRING, description: "Affective domain (Students will...)" },
              successCriteria: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["condition", "knowledge", "skill", "attitude", "successCriteria"]
          },
          priorKnowledgeActivation: {
            type: Type.OBJECT,
            properties: {
              whatTheyKnow: { type: Type.STRING },
              activationStrategy: { type: Type.STRING },
              misconceptionsToAnticipate: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["whatTheyKnow", "activationStrategy", "misconceptionsToAnticipate"]
          },
          vocabularyFocus: {
            type: Type.OBJECT,
            properties: {
              keyVocabulary: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    term: { type: Type.STRING },
                    definition: { type: Type.STRING },
                    academicLanguage: { type: Type.BOOLEAN },
                    pronunciation: { type: Type.STRING }
                  },
                  required: ["term", "definition"]
                }
              }
            },
            required: ["keyVocabulary"]
          },
          materialsBoard: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                quantity: { type: Type.STRING },
                purpose: { type: Type.STRING },
                lessonPhase: { type: Type.STRING },
                resourceType: { type: Type.STRING, enum: ['worksheet', 'visual', 'manipulative', 'chart', 'slide', 'printable', 'digital'] }
              },
              required: ["name", "purpose", "lessonPhase", "resourceType"]
            }
          },
          executionBoard: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                phase: { type: Type.STRING, enum: ['Introduction', 'Explicit Teaching', 'Guided Practice', 'Independent Practice', 'Closure'] },
                timeAllocation: { type: Type.STRING },
                teacherActions: { type: Type.ARRAY, items: { type: Type.STRING } },
                studentActions: { type: Type.ARRAY, items: { type: Type.STRING } },
                questionsToAsk: { type: Type.ARRAY, items: { type: Type.STRING } },
                engagementStrategy: { type: Type.STRING },
                materialsUsed: { type: Type.ARRAY, items: { type: Type.STRING } },
                expectedStudentResponse: { type: Type.STRING },
                assessmentOpportunity: { type: Type.STRING },
                explanationModeling: { type: Type.STRING },
                keyConceptFocus: { type: Type.STRING },
                misconceptionsToWatchFor: { type: Type.ARRAY, items: { type: Type.STRING } },
                supportScaffolding: { type: Type.STRING },
                checkForUnderstanding: { type: Type.STRING },
                expectedOutcome: { type: Type.STRING },
                studentTask: { type: Type.STRING },
                teacherMonitoringActions: { type: Type.ARRAY, items: { type: Type.STRING } },
                expectedProductOutput: { type: Type.STRING },
                supportOptions: { type: Type.ARRAY, items: { type: Type.STRING } },
                successCriteria: { type: Type.ARRAY, items: { type: Type.STRING } },
                teacherWrapUp: { type: Type.STRING },
                studentSummaryExitResponse: { type: Type.STRING },
                reflectionPromptExitQuestion: { type: Type.STRING },
                keyTakeaway: { type: Type.STRING },
                homeworkTransitionLink: { type: Type.STRING },
                ongoingAssessment: {
                  type: Type.OBJECT,
                  properties: {
                    observe: { type: Type.STRING },
                    evidenceOfLearning: { type: Type.STRING },
                    misconceptions: { type: Type.ARRAY, items: { type: Type.STRING } },
                    checkUnderstanding: { type: Type.STRING }
                  },
                  required: ["observe", "evidenceOfLearning", "misconceptions", "checkUnderstanding"]
                }
              },
              required: ["phase", "timeAllocation", "teacherActions", "studentActions", "questionsToAsk", "materialsUsed", "ongoingAssessment"]
            }
          },
          finalAssessmentBoard: {
            type: Type.OBJECT,
            properties: {
              type: { type: Type.STRING },
              studentTask: { type: Type.STRING },
              evidenceOfLearning: { type: Type.STRING },
              criteriaForSuccess: { type: Type.ARRAY, items: { type: Type.STRING } },
              masteryIndicator: { type: Type.STRING },
              assessmentTool: { type: Type.STRING }
            },
            required: ["type", "studentTask", "evidenceOfLearning", "criteriaForSuccess", "masteryIndicator", "assessmentTool"]
          },
          differentiationFramework: {
            type: Type.OBJECT,
            properties: {
              strugglingLearners: {
                type: Type.OBJECT,
                properties: {
                  scaffolds: { type: Type.ARRAY, items: { type: Type.STRING } },
                  visuals: { type: Type.ARRAY, items: { type: Type.STRING } },
                  manipulatives: { type: Type.ARRAY, items: { type: Type.STRING } },
                  simplifiedInstructions: { type: Type.STRING },
                  guidedSupport: { type: Type.STRING }
                },
                required: ["scaffolds", "visuals", "manipulatives", "simplifiedInstructions", "guidedSupport"]
              },
              onLevelLearners: {
                type: Type.OBJECT,
                properties: {
                  participationExpectations: { type: Type.STRING },
                  independentWorkExpectations: { type: Type.STRING },
                  peerCollaboration: { type: Type.STRING }
                },
                required: ["participationExpectations", "independentWorkExpectations", "peerCollaboration"]
              },
              advancedLearners: {
                type: Type.OBJECT,
                properties: {
                  challengeTasks: { type: Type.ARRAY, items: { type: Type.STRING } },
                  deeperThinkingPrompts: { type: Type.ARRAY, items: { type: Type.STRING } },
                  extensionActivity: { type: Type.STRING },
                  leadershipRole: { type: Type.STRING }
                },
                required: ["challengeTasks", "deeperThinkingPrompts", "extensionActivity", "leadershipRole"]
              },
              inclusionSupport: {
                type: Type.OBJECT,
                properties: {
                  dyslexia: { type: Type.STRING },
                  dyscalculia: { type: Type.STRING },
                  ell: { type: Type.STRING },
                  behavior: { type: Type.STRING },
                  sensory: { type: Type.STRING }
                }
              }
            },
            required: ["strugglingLearners", "onLevelLearners", "advancedLearners"]
          },
          closurePanel: {
            type: Type.OBJECT,
            properties: {
              recap: { type: Type.STRING },
              demonstration: { type: Type.STRING },
              exitQuestion: { type: Type.STRING },
              nextLessonConnection: { type: Type.STRING },
              homeworkLink: { type: Type.STRING }
            },
            required: ["recap", "demonstration", "exitQuestion", "nextLessonConnection"]
          },
          reflectionDashboard: {
            type: Type.OBJECT,
            properties: {
              whatWorked: { type: Type.STRING },
              needsImprovement: { type: Type.STRING },
              followUpStudents: { type: Type.ARRAY, items: { type: Type.STRING } },
              nextSteps: { type: Type.STRING }
            },
            required: ["whatWorked", "needsImprovement", "followUpStudents", "nextSteps"]
          },
          homeworkExtension: {
            type: Type.OBJECT,
            properties: {
              task: { type: Type.STRING },
              purpose: { type: Type.STRING },
              type: { type: Type.STRING },
              materials: { type: Type.ARRAY, items: { type: Type.STRING } },
              submissionFormat: { type: Type.STRING }
            },
            required: ["task", "purpose", "type", "materials"]
          },
          resourceMapping: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                resourceName: { type: Type.STRING },
                phaseUsed: { type: Type.STRING },
                purpose: { type: Type.STRING },
                type: { type: Type.STRING }
              },
              required: ["resourceName", "phaseUsed", "purpose", "type"]
            }
          }
        },
        required: [
          "lessonTitle", 
          "learningOutcome", 
          "lessonSnapshot",
          "learningObjectives",
          "learningObjectivesBoard",
          "priorKnowledgeActivation",
          "vocabularyFocus",
          "materialsBoard",
          "executionBoard",
          "finalAssessmentBoard",
          "differentiationFramework",
          "closurePanel",
          "reflectionDashboard",
          "resourceMapping"
        ]
      }
    }
  }));

  const cleanJson = (text: string | undefined) => {
    if (!text) return '{}';
    return text.replace(/```json\n?|```/g, '').trim();
  };

  try {
    const result = JSON.parse(cleanJson(response.text));
    
    // Normalize and enforce permanent learning objectives rule
    const norm = normalizeLearningObjectives(result, { 
      topic, 
      materials: result.materialsBoard?.map((m: any) => m.name) || result.materials 
    });
    result.learningObjectives = norm;
    result.learningObjectivesBoard = {
      ...result.learningObjectivesBoard,
      condition: norm.condition,
      knowledge: norm.cognitive,
      skill: norm.psychomotor,
      attitude: norm.affective,
      successCriteria: result.learningObjectivesBoard?.successCriteria || []
    };
    result.specificObjectives = [
      norm.cognitive,
      norm.psychomotor,
      norm.affective
    ];

    const finalPlan = enrichAndGuaranteeTeachReady({
      ...result,
      content: "", // Content is now handled by structured fields in UI
      academicYear,
      grade,
      subject,
      cycle,
      week,
      topic,
      subtopic,
      learningOutcome,
      duration: actualDuration
    }, {
      academicYear,
      grade,
      subject,
      cycle,
      week,
      topic,
      subtopic,
      learningOutcome,
      duration: actualDuration
    });

    return finalPlan;
  } catch (e) {
    console.error("Failed to parse lesson plan JSON:", e, response.text);
    throw new Error("Failed to parse generated lesson plan.");
  }
};

export const generateLanguageArtsDailyPlan = async (params: {
  academicYear?: string;
  grade: string;
  cycle: number;
  week: number;
  day: number;
  date?: string;
  subject?: string;
  topic: string;
  subtopic?: string;
  lessonTitle?: string;
  learningOutcome?: string;
  objectives?: string[];
  duration?: string;
  teachingModel?: TeachingModel;
  specialNotes?: string;
  style?: string;
  includeTeacherScript?: boolean;
  includeDifferentiation?: boolean;
  calendarDays?: CalendarDayEntry[];
  curriculumUnit?: CurriculumUnit;
  components?: [LanguageArtsComponent, LanguageArtsComponent];
}) => {
  validateGeminiConfig();
  const { 
    grade, 
    cycle, 
    week, 
    day, 
    topic, 
    subtopic, 
    lessonTitle, 
    objectives, 
    learningOutcome, 
    duration, 
    teachingModel = 'Direct Instruction (I Do, We Do, You Do)', 
    specialNotes, 
    style = 'Standard Teacher', 
    calendarDays = [], 
    curriculumUnit, 
    academicYear = '2026-2027',
    components 
  } = params;

  const isLA = true;
  const resolvedDuration = (duration && duration !== '45 minutes') ? duration : '90 minutes';
  const teachingDay = calendarDays.find(d => d.date === params.date || (d.week === week && d.dayNumber === day));
  const actualDuration = teachingDay?.type === 'Half Day' ? '45 minutes' : resolvedDuration;

  // Enforce exactly 2 components
  let selectedComps = components;
  if (!selectedComps || selectedComps.length !== 2) {
    if (day === 2) {
      selectedComps = ['Phonological Awareness', 'Phonics and Word Recognition'];
    } else if (day === 3) {
      selectedComps = ['Phonics and Word Recognition', 'High Frequency Words'];
    } else if (day === 4) {
      selectedComps = ['High Frequency Words', 'Production and Language Structure — Writing and Composition'];
    } else {
      selectedComps = ['Comprehension — Oral Expression and Listening', 'Production and Language Structure — Writing and Composition'];
    }
  }

  const prompt = `Generate a highly detailed, professional, TEACHER-INDEPENDENT, READY-TO-TEACH LANGUAGE ARTS DAILY LESSON EXECUTION PACK for Day ${day} of Week ${week}.
${teachingDay ? `Scheduled Date: ${safeFormat(teachingDay.date, 'EEEE, MMMM do')} (${teachingDay.type})` : ''}
Academic Year: ${academicYear}
Lesson Title: ${lessonTitle || topic}
Grade/Class: ${grade}
Subject: Language Arts
Cycle: ${cycle}
Topic: ${topic}
Sub-topic: ${subtopic || topic}
Duration: ${actualDuration}
Teaching Model: ${teachingModel}
Weekly Learning Outcome: ${learningOutcome || `Demonstrate competence in ${topic}`}
Daily Objectives: ${(objectives || []).join(', ')}
Special Notes/Preferences: ${specialNotes || 'None'}
Style: ${style}

# NON-NEGOTIABLE LANGUAGE ARTS COMPONENT RULE
Language Arts has exactly 5 components:
1. Comprehension — Oral Expression and Listening
2. Phonological Awareness
3. Phonics and Word Recognition
4. High Frequency Words
5. Production and Language Structure — Writing and Composition

## DAILY MANDATE:
Every Language Arts lesson MUST contain EXACTLY 2 components.
Never 1 component. Never 3, 4, or 5 components in one daily lesson.
For today's lesson, you MUST focus exclusively on these EXACT 2 components:
- Component 1: "${selectedComps[0]}"
- Component 2: "${selectedComps[1]}"

The lesson header must clearly display:
"Today's Language Arts Components: ${selectedComps[0]} + ${selectedComps[1]}"

## NO MISSING RESOURCES MANDATE:
Could a teacher print this lesson and its generated resources, walk into the classroom, and teach the entire lesson without having to create or search for anything else?
You MUST generate the complete, unabridged text for all required resources:
1. "readingPassageFull":
   - Complete, unabridged reading passage text (NOT an excerpt, minimum 150-250 words for standard classes, 80-120 words for infant classes) situated in a Belizean cultural/community context.
   - Title, genre, target grade, word count.
   - vocabularyHighlighted: array of 4-6 words from the passage with definitions in context.
   - comprehensionQuestions: 4 text-dependent questions across cognitive levels (Literal, Inferential, Vocabulary in Context, Evaluative) with expected answers.
2. "anchorChartBlueprint":
   - Complete blueprint of the chart the teacher draws or displays on the chalkboard.
   - Title, layout, headerText, keyRulesOrDefinitions (at least 3 rules), visualDiagramDescription, and studentKeyTakeaway.
3. "exitTicketPackage":
   - Exactly 3 diagnostic questions assessing today's 2 components.
   - Full question, answerKey, points.
   - Scoring guidance, 80% mastery threshold, and explicit grouping rule for tomorrow.
4. "component1Details" and "component2Details":
   - name, timeAllocation (e.g. 20 minutes).
   - Word-for-word explicit teacher script ("Teacher Says: ...").
   - Step-by-step guided practice task.
   - Formative check with teacherAsks, expectedResponse, ifCorrect action, and ifIncorrect intervention.

${curriculumUnit ? `
### OFFICIAL CURRICULUM SOURCE: ${curriculumUnit.source}
Unit: ${curriculumUnit.unitNumber} - ${curriculumUnit.unitTitle}
Unit Outcomes: ${(curriculumUnit.outcomes || []).join(', ')}
Reading Focus: ${curriculumUnit.readingFocus}
Speaking/Listening Focus: ${curriculumUnit.speakingListeningFocus}
Language Focus: ${curriculumUnit.languageFocus}
Word Work Focus: ${curriculumUnit.wordWorkFocus}
Writing Focus: ${curriculumUnit.writingFocus}
` : ''}

### MANDATORY LEARNING OBJECTIVES FORMAT (PERMANENT RULE):
Provide "learningObjectives" with:
- condition: Exactly one shared condition starting with "Given..." based on the lesson's actual materials, learning situation, or task.
- cognitive: "Students will [observable cognitive behavior] [measurable criterion where appropriate]." Do NOT repeat the condition.
- psychomotor: "Students will [observable physical/procedural/skill-based behavior] [measurable criterion where appropriate]." Do NOT repeat the condition.
- affective: "Students will [observable attitude, participation, collaboration, or confidence]." Do NOT repeat the condition.
Do NOT repeat the condition inside the individual domain objectives.`;

  const response = await executeGenAIWithFallback((model) => getGenAI().models.generateContent({
    model,
    contents: prompt,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      maxOutputTokens: 16384,
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          lessonTitle: { type: Type.STRING },
          studentTeacherName: { type: Type.STRING },
          date: { type: Type.STRING },
          classSize: { type: Type.STRING },
          ageRange: { type: Type.STRING },
          learningOutcome: { type: Type.STRING },
          weeklyGoalConnection: { type: Type.STRING },
          strand: { type: Type.STRING },
          lessonType: { type: Type.STRING },
          teachingMode: { type: Type.STRING },
          teachingStrategies: { type: Type.ARRAY, items: { type: Type.STRING } },
          methodology: { type: Type.STRING },

          languageArtsComponents: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Exactly 2 components"
          },
          component1Details: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              timeAllocation: { type: Type.STRING },
              explicitTeachingScript: { type: Type.STRING },
              guidedPracticeTask: { type: Type.STRING },
              formativeCheck: {
                type: Type.OBJECT,
                properties: {
                  teacherAsks: { type: Type.STRING },
                  expectedResponse: { type: Type.STRING },
                  ifCorrect: { type: Type.STRING },
                  ifIncorrect: { type: Type.STRING }
                },
                required: ["teacherAsks", "expectedResponse", "ifCorrect", "ifIncorrect"]
              }
            },
            required: ["name", "timeAllocation", "explicitTeachingScript", "guidedPracticeTask", "formativeCheck"]
          },
          component2Details: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              timeAllocation: { type: Type.STRING },
              explicitTeachingScript: { type: Type.STRING },
              guidedPracticeTask: { type: Type.STRING },
              formativeCheck: {
                type: Type.OBJECT,
                properties: {
                  teacherAsks: { type: Type.STRING },
                  expectedResponse: { type: Type.STRING },
                  ifCorrect: { type: Type.STRING },
                  ifIncorrect: { type: Type.STRING }
                },
                required: ["teacherAsks", "expectedResponse", "ifCorrect", "ifIncorrect"]
              }
            },
            required: ["name", "timeAllocation", "explicitTeachingScript", "guidedPracticeTask", "formativeCheck"]
          },
          readingPassageFull: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              genre: { type: Type.STRING },
              gradeLevel: { type: Type.STRING },
              wordCount: { type: Type.INTEGER },
              content: { type: Type.STRING },
              vocabularyHighlighted: { type: Type.ARRAY, items: { type: Type.STRING } },
              comprehensionQuestions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    question: { type: Type.STRING },
                    answer: { type: Type.STRING },
                    cognitiveLevel: { type: Type.STRING }
                  },
                  required: ["question", "answer", "cognitiveLevel"]
                }
              }
            },
            required: ["title", "genre", "gradeLevel", "wordCount", "content", "comprehensionQuestions"]
          },
          anchorChartBlueprint: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              layout: { type: Type.STRING },
              headerText: { type: Type.STRING },
              keyRulesOrDefinitions: { type: Type.ARRAY, items: { type: Type.STRING } },
              visualDiagramDescription: { type: Type.STRING },
              studentKeyTakeaway: { type: Type.STRING }
            },
            required: ["title", "layout", "headerText", "keyRulesOrDefinitions", "visualDiagramDescription", "studentKeyTakeaway"]
          },
          exitTicketPackage: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              prompt: { type: Type.STRING },
              questions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    question: { type: Type.STRING },
                    answerKey: { type: Type.STRING },
                    points: { type: Type.INTEGER }
                  },
                  required: ["question", "answerKey", "points"]
                }
              },
              scoringGuidance: { type: Type.STRING },
              masteryThreshold: { type: Type.STRING },
              groupingRuleTomorrow: { type: Type.STRING }
            },
            required: ["title", "prompt", "questions", "scoringGuidance", "masteryThreshold", "groupingRuleTomorrow"]
          },

          lessonSnapshot: {
            type: Type.OBJECT,
            properties: {
              about: { type: Type.STRING },
              learning: { type: Type.STRING },
              focus: { type: Type.STRING },
              flow: { type: Type.STRING }
            },
            required: ["about", "learning", "focus", "flow"]
          },
          learningObjectives: {
            type: Type.OBJECT,
            properties: {
              condition: { type: Type.STRING },
              cognitive: { type: Type.STRING },
              psychomotor: { type: Type.STRING },
              affective: { type: Type.STRING }
            },
            required: ["condition", "cognitive", "psychomotor", "affective"]
          },
          learningObjectivesBoard: {
            type: Type.OBJECT,
            properties: {
              condition: { type: Type.STRING },
              knowledge: { type: Type.STRING },
              skill: { type: Type.STRING },
              attitude: { type: Type.STRING },
              successCriteria: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["condition", "knowledge", "skill", "attitude", "successCriteria"]
          },
          priorKnowledgeActivation: {
            type: Type.OBJECT,
            properties: {
              whatTheyKnow: { type: Type.STRING },
              activationStrategy: { type: Type.STRING },
              misconceptionsToAnticipate: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["whatTheyKnow", "activationStrategy", "misconceptionsToAnticipate"]
          },
          vocabularyFocus: {
            type: Type.OBJECT,
            properties: {
              keyVocabulary: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    term: { type: Type.STRING },
                    definition: { type: Type.STRING }
                  },
                  required: ["term", "definition"]
                }
              }
            },
            required: ["keyVocabulary"]
          },
          materialsBoard: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                quantity: { type: Type.STRING },
                purpose: { type: Type.STRING },
                lessonPhase: { type: Type.STRING },
                resourceType: { type: Type.STRING }
              },
              required: ["name", "purpose", "lessonPhase"]
            }
          },
          executionBoard: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                phase: { type: Type.STRING },
                timeAllocation: { type: Type.STRING },
                teacherActions: { type: Type.ARRAY, items: { type: Type.STRING } },
                studentActions: { type: Type.ARRAY, items: { type: Type.STRING } },
                questionsToAsk: { type: Type.ARRAY, items: { type: Type.STRING } },
                materialsUsed: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["phase", "timeAllocation", "teacherActions", "studentActions", "questionsToAsk", "materialsUsed"]
            }
          },
          finalAssessmentBoard: {
            type: Type.OBJECT,
            properties: {
              type: { type: Type.STRING },
              studentTask: { type: Type.STRING },
              evidenceOfLearning: { type: Type.STRING },
              criteriaForSuccess: { type: Type.ARRAY, items: { type: Type.STRING } },
              masteryIndicator: { type: Type.STRING },
              assessmentTool: { type: Type.STRING }
            },
            required: ["type", "studentTask", "evidenceOfLearning", "criteriaForSuccess", "masteryIndicator", "assessmentTool"]
          },
          differentiationFramework: {
            type: Type.OBJECT,
            properties: {
              strugglingLearners: {
                type: Type.OBJECT,
                properties: {
                  scaffolds: { type: Type.ARRAY, items: { type: Type.STRING } },
                  visuals: { type: Type.ARRAY, items: { type: Type.STRING } },
                  manipulatives: { type: Type.ARRAY, items: { type: Type.STRING } },
                  simplifiedInstructions: { type: Type.STRING },
                  guidedSupport: { type: Type.STRING }
                },
                required: ["scaffolds", "visuals", "manipulatives", "simplifiedInstructions", "guidedSupport"]
              },
              onLevelLearners: {
                type: Type.OBJECT,
                properties: {
                  participationExpectations: { type: Type.STRING },
                  independentWorkExpectations: { type: Type.STRING },
                  peerCollaboration: { type: Type.STRING }
                },
                required: ["participationExpectations", "independentWorkExpectations", "peerCollaboration"]
              },
              advancedLearners: {
                type: Type.OBJECT,
                properties: {
                  challengeTasks: { type: Type.ARRAY, items: { type: Type.STRING } },
                  deeperThinkingPrompts: { type: Type.ARRAY, items: { type: Type.STRING } },
                  extensionActivity: { type: Type.STRING },
                  leadershipRole: { type: Type.STRING }
                },
                required: ["challengeTasks", "deeperThinkingPrompts", "extensionActivity", "leadershipRole"]
              }
            },
            required: ["strugglingLearners", "onLevelLearners", "advancedLearners"]
          },
          closurePanel: {
            type: Type.OBJECT,
            properties: {
              recap: { type: Type.STRING },
              demonstration: { type: Type.STRING },
              exitQuestion: { type: Type.STRING },
              nextLessonConnection: { type: Type.STRING }
            },
            required: ["recap", "demonstration", "exitQuestion", "nextLessonConnection"]
          },
          reflectionDashboard: {
            type: Type.OBJECT,
            properties: {
              whatWorked: { type: Type.STRING },
              needsImprovement: { type: Type.STRING },
              followUpStudents: { type: Type.ARRAY, items: { type: Type.STRING } },
              nextSteps: { type: Type.STRING }
            },
            required: ["whatWorked", "needsImprovement", "nextSteps"]
          },
          resourceMapping: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                resourceName: { type: Type.STRING },
                phaseUsed: { type: Type.STRING },
                purpose: { type: Type.STRING },
                type: { type: Type.STRING }
              },
              required: ["resourceName", "phaseUsed", "purpose", "type"]
            }
          }
        },
        required: [
          "lessonTitle",
          "learningOutcome",
          "lessonSnapshot",
          "learningObjectives",
          "learningObjectivesBoard",
          "languageArtsComponents",
          "component1Details",
          "component2Details",
          "readingPassageFull",
          "anchorChartBlueprint",
          "exitTicketPackage",
          "materialsBoard",
          "executionBoard",
          "finalAssessmentBoard",
          "differentiationFramework",
          "closurePanel",
          "reflectionDashboard",
          "resourceMapping"
        ]
      }
    }
  }));

  const cleanJson = (text: string | undefined) => {
    if (!text) return '{}';
    return text.replace(/```json\n?|```/g, '').trim();
  };

  try {
    const result = JSON.parse(cleanJson(response.text));
    result.languageArtsComponents = [selectedComps[0], selectedComps[1]];

    const norm = normalizeLearningObjectives(result, { 
      topic, 
      materials: result.materialsBoard?.map((m: any) => m.name) || result.materials 
    });
    result.learningObjectives = norm;
    result.learningObjectivesBoard = {
      ...result.learningObjectivesBoard,
      condition: norm.condition,
      knowledge: norm.cognitive,
      skill: norm.psychomotor,
      attitude: norm.affective,
      successCriteria: result.learningObjectivesBoard?.successCriteria || []
    };
    result.specificObjectives = [
      norm.cognitive,
      norm.psychomotor,
      norm.affective
    ];

    const finalPlan = enrichAndGuaranteeTeachReady({
      ...result,
      content: "",
      academicYear,
      grade,
      subject: 'Language Arts',
      cycle,
      week,
      day,
      date: params.date,
      topic,
      subtopic,
      learningOutcome,
      duration: actualDuration,
      languageArtsComponents: [selectedComps[0], selectedComps[1]]
    }, {
      academicYear,
      grade,
      subject: 'Language Arts',
      cycle,
      week,
      day,
      date: params.date,
      topic,
      subtopic,
      learningOutcome,
      duration: actualDuration,
      components: [selectedComps[0], selectedComps[1]]
    });

    return finalPlan;
  } catch (e) {
    console.error("Failed to parse Language Arts daily plan JSON:", e, response.text);
    return enrichAndGuaranteeTeachReady({
      lessonTitle: topic,
      subject: 'Language Arts',
      grade,
      cycle,
      week,
      day,
      date: params.date,
      topic,
      subtopic,
      learningOutcome,
      duration: actualDuration,
      languageArtsComponents: [selectedComps[0], selectedComps[1]]
    }, {
      academicYear,
      grade,
      subject: 'Language Arts',
      cycle,
      week,
      day,
      date: params.date,
      topic,
      subtopic,
      learningOutcome,
      duration: actualDuration,
      components: [selectedComps[0], selectedComps[1]]
    });
  }
};

export const generateFullWeek = async (params: {
  grade: string;
  subject: string;
  cycle: number;
  week: number;
  numDays: number;
  entries: any[];
  teachingModel: TeachingModel;
  previousWeeks?: any[];
  calendarDays?: CalendarDayEntry[];
}) => {
  validateGeminiConfig();
  const { grade, subject, cycle, week, numDays, entries, teachingModel, previousWeeks = [], calendarDays = [] } = params;

  // 1. Generate the weekly structure
  const weeklyStructure = await generateWeeklyBreakdown({
    grade, subject, cycle, week, numDays, entries, previousWeeks, calendarDays
  });

  // Filter for actual teaching days in this week
  const teachingDaysInWeek = calendarDays.filter(d => d.week === week && d.isTeachingDay);
  const actualNumDays = teachingDaysInWeek.length > 0 ? teachingDaysInWeek.length : numDays;

  // 2. Generate each daily lesson plan
  const dailyPlans: any[] = [];
  for (let i = 0; i < actualNumDays; i++) {
    const teachingDay = teachingDaysInWeek[i];
    const plan = await generateLessonPlan({
      grade,
      subject,
      cycle,
      week,
      day: i + 1,
      topic: weeklyStructure.weekly_topic!,
      subtopic: weeklyStructure.weekly_subtopics![0] || weeklyStructure.weekly_topic!,
      lessonTitle: weeklyStructure.daily_lesson_titles![i],
      objectives: weeklyStructure.daily_objectives![i],
      learningOutcome: weeklyStructure.weekly_learning_outcomes![0] || '',
      duration: isLanguageArtsSubject(subject) 
        ? (teachingDay?.type === 'Half Day' ? '45 minutes' : '90 minutes')
        : (teachingDay?.type === 'Half Day' ? '30 minutes' : '45 minutes'),
      teachingModel,
      specialNotes: teachingDay ? `This lesson is scheduled for ${safeFormat(teachingDay.date, 'EEEE, MMM do')}. Day type: ${teachingDay.type}.` : undefined
    });
    dailyPlans.push({
      ...plan,
      structured_json: plan,
      day: i + 1,
      date: teachingDay?.date,
      topic: weeklyStructure.weekly_topic,
      subtopic: weeklyStructure.weekly_subtopics![0] || weeklyStructure.weekly_topic,
      learning_outcome: weeklyStructure.weekly_learning_outcomes![0] || '',
      objectives: weeklyStructure.daily_objectives![i]
    });
  }

  return {
    weeklyStructure,
    dailyPlans
  };
};

export interface PacingMapParams {
  grade: string;
  subject: string;
  cycle: number;
  totalWeeks: number;
  totalTeachingDays: number;
  entries: any[];
  calendarDays: CalendarDayEntry[];
  distributionMethod: 'Balanced' | 'Teacher-Controlled' | 'Priority-Based' | 'Outcome-Based';
}

export const generateCyclePacingMap = async (params: PacingMapParams) => {
  const { grade, subject, cycle, totalWeeks, totalTeachingDays, entries, calendarDays = [], distributionMethod } = params;

  // Calculate actual teaching days per week for this cycle
  const cycleDays = calendarDays.filter(d => d.cycle === cycle);
  const teachingWeeks = Array.from(new Set(cycleDays.map(d => d.week))).sort((a, b) => (a || 0) - (b || 0));
  
  const weekContext = teachingWeeks.map(w => {
    const daysInWeek = cycleDays.filter(d => d.week === w && d.isTeachingDay);
    const dates = daysInWeek.map(d => safeFormat(d.date, 'MMM do')).join(', ');
    return `Week ${w}: ${daysInWeek.length} teaching days (${dates})`;
  }).join('\n');

  const prompt = `You are a Master Curriculum Planner. Your goal is to create a professional weekly pacing map for ${grade}, ${subject}, Cycle ${cycle} over ${totalWeeks} teaching weeks (${totalTeachingDays} total teaching days).
  
  OFFICIAL ACADEMIC CALENDAR: Belize 2025/2026
  
  DISTRIBUTION METHOD: ${distributionMethod}
  - Balanced: Spread content evenly and intelligently across all available teaching days.
  - Teacher-Controlled: Prioritize the teacher's specific focus if provided, otherwise default to balanced.
  - Priority-Based: Allocate more time (more days/weeks) to complex, foundational, or high-priority topics.
  - Outcome-Based: Distribute time proportionally based on the number of learning outcomes per topic.
  
  IMPORTANT CALENDAR CONTEXT:
  The following is the actual teaching time available for each week in this cycle:
  ${weekContext}
  
  Curriculum Entries for this Cycle:
  ${JSON.stringify(entries)}
  
  Instructions:
  1. Distribute the topics and sub-topics across ${totalWeeks} weeks logically using the ${distributionMethod} method.
  2. CRITICAL: Respect the available teaching days per week. If a week has only 2 teaching days, do not over-schedule it.
  3. Ensure all curriculum entries are covered within the cycle.
  4. Include "Review" and "Assessment" weeks where appropriate (usually at the end of the cycle).
  5. For each week, provide:
     - Topic
     - Sub-topics (list)
     - Strand (if applicable)
     - Learning Outcomes (list of specific outcomes from the curriculum)
     - Weekly Focus (a short summary)
     - Duration (usually 1, but can be more if a topic spans multiple weeks)
     - teachingDaysCount (number of teaching days in that week)
     - dates (array of date strings for that week)
  6. Identify potential pacing issues and provide warnings (e.g., "Week X only has 2 teaching days, consider reducing content" or "Too many outcomes for Week Y").
  
  Output a JSON object with:
  - totalWeeks: ${totalWeeks}
  - totalTeachingDays: ${totalTeachingDays}
  - weeks: Array of week objects (weekNumber, topic, subtopics[], strand, learningOutcomes[], focus, duration, isReview, isAssessment, teachingDaysCount, dates[])
  - warnings: Array of strings.
  - distributionMethod: "${distributionMethod}"`;

  const response = await executeGenAIWithFallback((model) => getGenAI().models.generateContent({
    model,
    contents: prompt,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          totalWeeks: { type: Type.NUMBER },
          totalTeachingDays: { type: Type.NUMBER },
          weeks: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                weekNumber: { type: Type.NUMBER },
                topic: { type: Type.STRING },
                subtopics: { type: Type.ARRAY, items: { type: Type.STRING } },
                strand: { type: Type.STRING },
                learningOutcomes: { type: Type.ARRAY, items: { type: Type.STRING } },
                focus: { type: Type.STRING },
                duration: { type: Type.NUMBER },
                isReview: { type: Type.BOOLEAN },
                isAssessment: { type: Type.BOOLEAN },
                teachingDaysCount: { type: Type.NUMBER },
                dates: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["weekNumber", "topic", "subtopics", "learningOutcomes", "focus", "duration", "teachingDaysCount"]
            }
          },
          warnings: { type: Type.ARRAY, items: { type: Type.STRING } },
          distributionMethod: { type: Type.STRING }
        },
        required: ["totalWeeks", "totalTeachingDays", "weeks", "warnings", "distributionMethod"]
      }
    }
  }));

  const cleanJson = (text: string) => {
    return text.replace(/```json\n?|```/g, '').trim();
  };

  return JSON.parse(cleanJson(response.text));
};

export const calculateCoverage = async (params: {
  grade: string;
  subject: string;
  cycle: number;
  pacingMap: any;
  calendarDays: CalendarDayEntry[];
  curriculumEntries: any[];
}) => {
  const { grade, subject, cycle, pacingMap, calendarDays, curriculumEntries } = params;

  const cycleDays = calendarDays.filter(d => d.cycle === cycle && d.isTeachingDay);
  const lessonsPlanned = cycleDays.length;
  const lessonsTaught = cycleDays.filter(d => d.status === 'Taught' || d.status === 'Completed').length;
  const lessonsMissed = cycleDays.filter(d => d.status === 'Skipped' || d.status === 'Postponed').length;

  const totalOutcomes = curriculumEntries.length; // Simplified: count of entries
  const completedOutcomes = Array.from(new Set(cycleDays.filter(d => d.status === 'Completed' && d.learningOutcomes).flatMap(d => d.learningOutcomes!))).length;

  const totalTopics = Array.from(new Set(curriculumEntries.map(e => e.topic))).length;
  const completedTopics = Array.from(new Set(cycleDays.filter(d => d.status === 'Completed' && d.topic).map(d => d.topic!))).length;

  const pendingOutcomes = curriculumEntries
    .filter(e => !cycleDays.some(d => d.status === 'Completed' && d.learningOutcomes?.includes(e.learning_outcomes[0])))
    .map(e => e.learning_outcomes[0]);

  const behindSchedule = lessonsTaught < (lessonsPlanned * 0.8); // Simple heuristic

  return {
    grade,
    subject,
    cycle,
    stats: {
      lessonsPlanned,
      lessonsTaught,
      lessonsMissed,
      outcomesCompleted: completedOutcomes,
      totalOutcomes,
      topicsCompleted: completedTopics,
      totalTopics
    },
    pendingOutcomes: pendingOutcomes.slice(0, 10), // Limit for UI
    behindSchedule,
    lastUpdated: new Date().toISOString()
  };
};

export const generateLanguageArtsWeeklyPlan = async (params: {
  grade: GradeLevel;
  cycle: number;
  week: number;
  topic: string;
  learningOutcomes: string[];
  structure: LanguageArtsWeeklyStructure;
  calendarDays?: CalendarDayEntry[];
}) => {
  const { grade, cycle, week, topic, learningOutcomes, structure, calendarDays = [] } = params;

  const weekDays = calendarDays.filter(d => d.week === week && d.isTeachingDay);
  
  const prompt = `Generate a comprehensive 5-day Language Arts Weekly Lesson Plan based on the following Scope & Sequence.

GRADE LEVEL: ${grade}
CYCLE: ${cycle}
WEEK: ${week}
TOPIC/THEME: ${topic}
LEARNING OUTCOMES: ${(learningOutcomes || []).join(', ')}
STRUCTURE: ${structure}

### SCOPE & SEQUENCE RULES:
1. Every day must be broken into specific instructional strands.
2. ${structure === 'Recommended' ? `RECOMMENDED STRUCTURE (60 mins total):
   - 10 minutes: Comprehension (Oral Expression and Listening)
   - 35 minutes: Phonological Awareness / Phonics / Word Recognition / High Frequency Words
   - 15 minutes: Production & Language Structure (Writing and Composition)` : `ALTERNATIVE STRUCTURE (60 mins total):
   - 35 minutes: Phonological Awareness / Phonics / Word Recognition / High Frequency Words
   - 25 minutes: Comprehension / Language Structure / Production`}

3. GRADE LEVEL ADAPTATIONS:
   ${grade.includes('Infant') ? '- Infant 1/2: Focus on play-based learning, oral language, visual aids, and simplified instructions. Use songs, rhymes, and hands-on activities.' : 
     grade.match(/Standard [1-3]/) ? '- Standard 1-3: Focus on the transition from oral to written language. Include basic text analysis and structured writing practice.' : 
     '- Standard 4-6: Focus on rigorous skill development, deeper text analysis, complex language structures, and formal writing compositions.'}

4. WEEKLY FLOW:
   - Ensure the 5 days form a cohesive sequence where skills build upon each other.
   - Day 1: Introduction & Initial Practice
   - Day 2-4: Development & Guided Practice
   - Day 5: Review, Assessment & Extension

### OUTPUT REQUIREMENTS:
Generate a JSON object matching the LanguageArtsWeeklyPlan interface.
Include:
- theme: A catchy theme for the week.
- learningOutcomes: Refined outcomes for the week.
- days: 5 daily plans, each with strands, objectives, activities, teacher guidance (what to say, what to ask, examples, student tasks), assessment, and resources.
- differentiation: Specific strategies for struggling, on-level, and advanced learners for each day.
- resourcePack: A full set of teaching materials including:
  - readingPassage: A short text (appropriate for ${grade}) related to the theme.
  - vocabularyList: 5-10 key words.
  - highFrequencyWords: 5-8 words.
  - phonicsPractice: Specific sounds/blends to practice.
  - grammarPractice: A language structure focus.
  - writingPrompt: A creative or structured writing task.
  - worksheetIdeas: 3-5 specific ideas for worksheets.
  - oralQuestioningPrompts: 5-10 questions for the teacher.
  - comprehensionQuestions: 5 questions based on the reading passage.
  - anchorChartSuggestions: Visual aid ideas.
  - printableVisuals: Descriptions of 3-5 visuals to print.

### TEACHER ASSISTANT GUIDANCE:
For each strand, provide "AI Teaching Assistant" style guidance:
- whatToSay: Exact phrases for the teacher to use.
- whatToAsk: Strategic questions to check understanding.
- examples: Clear examples to illustrate the concept.
- studentTasks: What the students should be doing during this time.

Ensure the content is age-appropriate for ${grade} and aligns with the Belizean curriculum standards.`;

  const response = await executeGenAIWithFallback((model) => getGenAI().models.generateContent({
    model,
    contents: prompt,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          theme: { type: Type.STRING },
          learningOutcomes: { type: Type.ARRAY, items: { type: Type.STRING } },
          days: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                day: { type: Type.NUMBER },
                date: { type: Type.STRING },
                strands: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      strand: { type: Type.STRING },
                      timeAllocation: { type: Type.STRING },
                      objective: { type: Type.STRING },
                      activities: { type: Type.ARRAY, items: { type: Type.STRING } },
                      teacherGuidance: {
                        type: Type.OBJECT,
                        properties: {
                          whatToSay: { type: Type.STRING },
                          whatToAsk: { type: Type.STRING },
                          examples: { type: Type.ARRAY, items: { type: Type.STRING } },
                          studentTasks: { type: Type.STRING }
                        },
                        required: ["whatToSay", "whatToAsk", "examples", "studentTasks"]
                      },
                      assessment: { type: Type.STRING },
                      resources: { type: Type.ARRAY, items: { type: Type.STRING } }
                    },
                    required: ["strand", "timeAllocation", "objective", "activities", "teacherGuidance", "assessment", "resources"]
                  }
                },
                differentiation: {
                  type: Type.OBJECT,
                  properties: {
                    support: { type: Type.STRING },
                    onLevel: { type: Type.STRING },
                    advanced: { type: Type.STRING }
                  },
                  required: ["support", "onLevel", "advanced"]
                }
              },
              required: ["day", "date", "strands", "differentiation"]
            }
          },
          resourcePack: {
            type: Type.OBJECT,
            properties: {
              readingPassage: { type: Type.STRING },
              vocabularyList: { type: Type.ARRAY, items: { type: Type.STRING } },
              highFrequencyWords: { type: Type.ARRAY, items: { type: Type.STRING } },
              phonicsPractice: { type: Type.STRING },
              grammarPractice: { type: Type.STRING },
              writingPrompt: { type: Type.STRING },
              worksheetIdeas: { type: Type.ARRAY, items: { type: Type.STRING } },
              oralQuestioningPrompts: { type: Type.ARRAY, items: { type: Type.STRING } },
              comprehensionQuestions: { type: Type.ARRAY, items: { type: Type.STRING } },
              anchorChartSuggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
              printableVisuals: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["vocabularyList", "highFrequencyWords", "phonicsPractice", "grammarPractice", "writingPrompt", "worksheetIdeas", "oralQuestioningPrompts", "comprehensionQuestions", "anchorChartSuggestions", "printableVisuals"]
          }
        },
        required: ["theme", "learningOutcomes", "days", "resourcePack"]
      }
    }
  }));

  const cleanJson = (text: string) => {
    return text.replace(/```json\n?|```/g, '').trim();
  };

  return JSON.parse(cleanJson(response.text));
};

export const generateResource = async (type: string, lessonContext: any, options: any = {}) => {
  const subject = typeof lessonContext?.subject === 'object' 
    ? (lessonContext.subject?.name || lessonContext.subject?.subject) 
    : (lessonContext?.subject || lessonContext?.week?.subject || 'General');

  const grade = typeof lessonContext?.grade === 'object'
    ? (lessonContext.grade?.name || lessonContext.grade?.grade)
    : (lessonContext?.grade || lessonContext?.class_id || lessonContext?.week?.grade || 'Standard 4');

  const topic = typeof lessonContext?.topic === 'object'
    ? (lessonContext.topic?.topic || lessonContext.topic?.name)
    : (lessonContext?.topic || lessonContext?.title || lessonContext?.week?.topic || type);

  const subtopic = lessonContext?.subtopic || lessonContext?.sub_topic || '';
  const generalObjective = lessonContext?.generalObjective || lessonContext?.learningOutcome || '';
  
  const rawObjectives = lessonContext?.specificObjectives 
    || lessonContext?.learningObjectivesBoard?.successCriteria 
    || lessonContext?.objectives 
    || lessonContext?.learning_outcomes
    || [];
  const specificObjectives = Array.isArray(rawObjectives) ? rawObjectives.join(', ') : String(rawObjectives || '');

  const isWorksheetType = type === 'Worksheet' || type === 'worksheets' || type.toLowerCase().includes('worksheet') || type.toLowerCase() === 'quiz';

  const prompt = isWorksheetType 
    ? buildGlobalWorksheetAIPrompt({
        subject,
        grade,
        topic,
        subtopic,
        generalObjective,
        specificObjectives
      })
    : `Generate a high-quality ${type} based on the following lesson context:
Subject: ${subject}
Grade: ${grade}
Topic: ${topic}
Sub-topic: ${subtopic}
General Objective: ${generalObjective}
Specific Objectives: ${specificObjectives}

Requirements for ${type}:
${type === 'demonstration' || type === 'Demonstration' ? '- Clear teacher modeling guide ("I Do" stage). Detail exact teacher actions, think-aloud narrative, physical demonstration steps, what to write on the board, and student observation checks.' : ''}
${type === 'Quiz' || type === 'Test' || type === 'assessment' ? '- Professional assessment, marks included, varied question types, balanced difficulty, curriculum-aligned, includes clear instructions and answer key.' : ''}
${type === 'Notebook Notes' ? '- Clear, simple, short enough to copy, well-organized, includes heading, key definitions, examples, and summary. Board-style formatting.' : ''}
${type === 'PowerPoint Outline' ? '- Concise bullet points, slide titles, interactive prompts, student participation moments. Include slides for: Title, Objective, Warm-up, Teaching content, Example/Practice, Activity, Review, Exit Ticket.' : ''}
${type === 'Homework' || type === 'homework' || type === 'Exit Ticket' ? '- Short, focused, realistic, relevant, manageable, skill-based.' : ''}
${type === 'Rubric' || type === 'Checklist' ? '- Structured, teacher-friendly format. Rubric: criteria, levels, descriptors. Checklist: skills/behaviors, yes/no/rating, comments.' : ''}
${type === 'teacher_script' ? '- Word-for-word teacher script for direct instruction, think-alouds, guided questioning, and checking for understanding.' : ''}
${type === 'board_plan' ? '- Exact board layout with sections for Date, Topic, Objectives, Key Vocabulary, Modeled Examples, and Student Practice space.' : ''}
${type === 'visual_aids' ? '- Clear descriptions of charts, diagrams, anchor charts, or visual organizers for the teacher to draw or display.' : ''}
${type === 'materials_prep' ? '- Comprehensive checklist of hands-on materials, printed handouts, technology, and advance preparation needed.' : ''}
${type === 'differentiation' ? '- Tiered supports for struggling learners, on-level students, and advanced/early finishers.' : ''}
${type === 'classroom_management' ? '- Proactive behavioral cues, transition protocols, pacing guide, and grouping strategies for this specific lesson.' : ''}
${type === 'lesson_overview' ? '- Executive summary of the lesson flow, pacing milestones, essential questions, and success criteria.' : ''}

Style: ${options.style || 'Standard Teacher'}
Include Answer Key: ${options.includeAnswerKey ? 'Yes' : 'No'}

Output the content in Markdown format.`;

  try {
    const response = await executeGenAIWithFallback((model) => getGenAI().models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION
      }
    }));

    const text = (response as any)?.text || (response as any)?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    if (text && text.trim()) {
      if (isWorksheetType) {
        // Enforce the Global Worksheet Standard on AI output
        const normalized = parseAndNormalizeWorksheet(text, {
          schoolName: DEFAULT_SCHOOL_NAME,
          grade,
          subject,
          topic,
          subtopic,
          title: type.toLowerCase() === 'quiz' ? `Assessment Quiz: ${topic}` : `Student Practice Worksheet: ${topic}`
        });
        return `${formatWorksheetMarkdown(normalized)}\n\n${formatAnswerKeyMarkdown(normalized)}`;
      }
      return text;
    }
  } catch (error: any) {
    console.error(`Error generating resource ${type}:`, error?.message);
  }

  // Graceful fallback markdown so the endpoint never returns undefined or causes an empty 200 response
  if (isWorksheetType) {
    const fallbackWs = parseAndNormalizeWorksheet('', {
      schoolName: DEFAULT_SCHOOL_NAME,
      grade,
      subject,
      topic,
      subtopic,
      title: type.toLowerCase() === 'quiz' ? `Assessment Quiz: ${topic}` : `Student Practice Worksheet: ${topic}`
    });
    return `${formatWorksheetMarkdown(fallbackWs)}\n\n${formatAnswerKeyMarkdown(fallbackWs)}`;
  }

  const cleanTypeTitle = type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  return `# ${cleanTypeTitle}: ${topic}\n\n**Grade:** ${grade} | **Subject:** ${subject}\n\n### Teacher Guidance (${cleanTypeTitle})\n\n1. **Objective Modeling:** Clearly articulate the learning goal and model the step-by-step thinking for students.\n2. **Demonstration & Instruction:** Guide students through the core steps of "${topic}" with concrete visual examples and think-aloud modeling.\n3. **Formative Check:** Verify student understanding before transitioning into guided or independent practice.`;
};

export const generateReteachLesson = async (originalPlan: LessonPlan, assessmentRecord: AssessmentRecord) => {
  const prompt = `You are generating a RETEACH LESSON based on a previous lesson where students struggled.
  
Original Lesson: ${originalPlan.lessonTitle}
Topic: ${originalPlan.topic}
Weak Objectives: ${(originalPlan.specificObjectives || originalPlan.learningObjectivesBoard?.successCriteria || []).join(', ')}

Assessment Feedback:
- Delivery Status: ${assessmentRecord.deliveryStatus}
- Understanding Level: ${assessmentRecord.understandingLevel}
- Objective Mastery: ${assessmentRecord.objectiveMastery}
- What students struggled with: ${assessmentRecord.classPerformanceNotes.whatStudentsStruggledWith}
- Common Errors: ${(assessmentRecord.results.commonErrors || []).join(', ')}

RETEACH REQUIREMENTS:
1. Use simpler explanations and slower pacing.
2. Break content into smaller, more manageable chunks.
3. Provide more guided practice and more examples.
4. Include specific teacher prompts to address the common errors noted.
5. Ensure the formative assessment is confidence-building and focuses on the core skill.

Output a full lesson package in JSON format.`;

  const response = await executeGenAIWithFallback((model) => getGenAI().models.generateContent({
    model,
    contents: prompt,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      // Use the same schema as generateLessonPlan
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          lessonTitle: { type: Type.STRING },
          learningOutcome: { type: Type.STRING },
          weeklyGoalConnection: { type: Type.STRING },
          previousKnowledge: { type: Type.STRING },
          generalObjective: { type: Type.STRING },
          specificObjectives: { type: Type.ARRAY, items: { type: Type.STRING } },
          materials: { type: Type.ARRAY, items: { type: Type.STRING } },
          introduction: { type: Type.ARRAY, items: { type: Type.STRING } },
          development: { type: Type.ARRAY, items: { type: Type.STRING } },
          guidedPractice: { type: Type.ARRAY, items: { type: Type.STRING } },
          independentPractice: { type: Type.ARRAY, items: { type: Type.STRING } },
          closure: { type: Type.ARRAY, items: { type: Type.STRING } },
          differentiation: { type: Type.ARRAY, items: { type: Type.STRING } },
          assessment: { type: Type.ARRAY, items: { type: Type.STRING } },
          homework: { type: Type.ARRAY, items: { type: Type.STRING } },
          reflection: { type: Type.STRING },
          teachingResources: { type: Type.OBJECT },
          beforeClassChecklist: { type: Type.ARRAY, items: { type: Type.OBJECT } },
          materialsNeeded: { type: Type.ARRAY, items: { type: Type.STRING } }
        }
      }
    }
  }));

  return JSON.parse(response.text);
};

export const generateInterventionWork = async (lessonPlan: LessonPlan, assessmentRecord: AssessmentRecord) => {
  const prompt = `Generate TARGETED INTERVENTION MATERIALS for students who struggled with the following lesson:
  
Lesson: ${lessonPlan.lessonTitle}
Topic: ${lessonPlan.topic}
Common Errors: ${(assessmentRecord.results.commonErrors || []).join(', ')}
Struggle Areas: ${assessmentRecord.classPerformanceNotes.whatStudentsStruggledWith}

Generate:
1. An Intervention Worksheet (simplified tasks, more scaffolding).
2. A Support Mini-Task (quick 5-10 min activity).
3. Catch-up Notes (visual, simplified).
4. One-on-one Support Sheet for the teacher.

Output in Markdown format.`;

  const response = await executeGenAIWithFallback((model) => getGenAI().models.generateContent({
    model,
    contents: prompt,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION
    }
  }));

  return response.text;
};

export const generateCatchUpLesson = async (lessonPlan: LessonPlan) => {
  const prompt = `Generate a CONDENSED CATCH-UP LESSON for students who missed the following lesson:
  
Lesson: ${lessonPlan.lessonTitle}
Topic: ${lessonPlan.topic}
Core Objectives: ${(lessonPlan.specificObjectives || lessonPlan.learningObjectivesBoard?.successCriteria || []).join(', ')}

The catch-up lesson should be short, clear, and recovery-focused.
Include:
1. Summary Explanation (The "Big Idea").
2. Simplified Student Notes.
3. Mini Worksheet (3-5 key questions).
4. Quick Mastery Check.

Output in Markdown format.`;

  const response = await executeGenAIWithFallback((model) => getGenAI().models.generateContent({
    model,
    contents: prompt,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION
    }
  }));

  return response.text;
};

export const generateRevisionWeek = async (grade: GradeLevel, subject: Subject, weakOutcomes: OutcomeMastery[], misconceptions: MisconceptionLog[]) => {
  const prompt = `Generate a REVISION WEEK PLAN for ${grade} ${subject} based on the following weak areas and misconceptions:

Weak Learning Outcomes:
${weakOutcomes.map(o => `- ${o.outcome} (Status: ${o.status})`).join('\n')}

Common Misconceptions:
${misconceptions.map(m => `- ${m.topic}: ${m.misconception}`).join('\n')}

Generate a 5-day revision plan. Each day should include:
- Focus Topic
- Revision Activity
- Reteach Focus
- Assessment Check

Output as a JSON array of 5 days.`;

  const response = await executeGenAIWithFallback((model) => getGenAI().models.generateContent({
    model,
    contents: prompt,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            day: { type: Type.NUMBER },
            topic: { type: Type.STRING },
            activity: { type: Type.STRING },
            reteachFocus: { type: Type.STRING },
            assessmentCheck: { type: Type.STRING }
          },
          required: ["day", "topic", "activity", "reteachFocus", "assessmentCheck"]
        }
      }
    }
  }));

  return JSON.parse(response.text);
};

export const generateYearlyCurriculumMap = async (grade: GradeLevel, subject: Subject, curriculum: any[], calendar: AcademicCalendar) => {
  const prompt = `Generate a YEARLY CURRICULUM MAP for ${grade} ${subject} based on the provided curriculum and academic calendar.
  
  SCHOOL YEAR: ${calendar.schoolYear}
  CALENDAR DATES: ${calendar.startDate} to ${calendar.endDate}
  CYCLES: ${calendar.cycles.map(c => `Cycle ${c.number}: ${c.startDate} to ${c.endDate}`).join(', ')}
  NON-TEACHING DAYS: ${calendar.events.filter(e => !e.isTeachingDay).map(e => `${e.title} (${e.startDate})`).join(', ')}
  
  CURRICULUM DATA:
  ${JSON.stringify(curriculum)}
  
  REQUIREMENTS:
  1. Distribute all curriculum topics across Cycle 1, Cycle 2, Cycle 3, and Cycle 4.
  2. Allocate time (weeks) based on topic weight (difficulty, number of outcomes).
  3. Ensure each cycle includes:
     - Teaching weeks
     - Revision weeks (usually near the end)
     - Assessment weeks (usually at the end)
  4. Respect the academic calendar. Do not over-schedule in cycles with many holidays.
  5. Assign a priority (High, Medium, Low) to each topic.
  
  Output as a JSON object matching the YearlyCurriculumMap interface.`;

  const response = await executeGenAIWithFallback((model) => getGenAI().models.generateContent({
    model,
    contents: prompt,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          grade: { type: Type.STRING },
          subject: { type: Type.STRING },
          schoolYear: { type: Type.STRING },
          cycles: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                cycleNumber: { type: Type.NUMBER },
                topics: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      topic: { type: Type.STRING },
                      subtopics: { type: Type.ARRAY, items: { type: Type.STRING } },
                      outcomes: { type: Type.ARRAY, items: { type: Type.STRING } },
                      estimatedWeeks: { type: Type.NUMBER },
                      plannedWeekStart: { type: Type.NUMBER },
                      priority: { type: Type.STRING, enum: ["High", "Medium", "Low"] }
                    }
                  }
                },
                revisionWeeks: { type: Type.ARRAY, items: { type: Type.NUMBER } },
                assessmentWeeks: { type: Type.ARRAY, items: { type: Type.NUMBER } }
              }
            }
          }
        }
      }
    }
  }));

  return JSON.parse(response.text);
};

export const generateCyclePlan = async (map: YearlyCurriculumMap, cycleNumber: number, calendar: AcademicCalendar) => {
  const cycleData = map.cycles.find(c => c.cycleNumber === cycleNumber);
  const cycleDates = calendar.cycles.find(c => c.number === cycleNumber);
  
  const prompt = `Generate a detailed CYCLE PLAN for Cycle ${cycleNumber} of ${map.grade} ${map.subject}.
  
  CYCLE DATES: ${cycleDates?.startDate} to ${cycleDates?.endDate}
  TOPICS TO COVER:
  ${JSON.stringify(cycleData?.topics)}
  
  REVISION WEEKS: ${cycleData?.revisionWeeks.join(', ')}
  ASSESSMENT WEEKS: ${cycleData?.assessmentWeeks.join(', ')}
  
  REQUIREMENTS:
  1. Break the cycle into a week-by-week roadmap.
  2. For each week, provide:
     - Week Number
     - Dates
     - Topic & Sub-topics
     - Learning Outcomes
     - Lesson Focus for each day (exactly 5 days: Monday to Friday)
     - Resources Needed
     - Assessment Opportunities
  3. Ensure logical instructional flow across the weeks.
  
  Output as a JSON object matching the CyclePlan interface.`;

  const response = await executeGenAIWithFallback((model) => getGenAI().models.generateContent({
    model,
    contents: prompt,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          cycleNumber: { type: Type.NUMBER },
          grade: { type: Type.STRING },
          subject: { type: Type.STRING },
          weeks: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                weekNumber: { type: Type.NUMBER },
                dates: { type: Type.STRING },
                topic: { type: Type.STRING },
                subTopics: { type: Type.ARRAY, items: { type: Type.STRING } },
                outcomes: { type: Type.ARRAY, items: { type: Type.STRING } },
                lessonFocus: { type: Type.ARRAY, items: { type: Type.STRING } },
                resourcesNeeded: { type: Type.ARRAY, items: { type: Type.STRING } },
                assessmentOpportunities: { type: Type.ARRAY, items: { type: Type.STRING } },
                status: { type: Type.STRING, enum: ["Ready", "Incomplete"] }
              }
            }
          }
        }
      }
    }
  }));

  return JSON.parse(response.text);
};

export const generateWeeklyTeachingPlan = async (cyclePlan: CyclePlan, weekNumber: number, calendar: AcademicCalendar) => {
  const weekData = cyclePlan.weeks.find(w => w.weekNumber === weekNumber);
  
  const prompt = `Generate a WEEKLY TEACHING PLAN for Week ${weekNumber}, Cycle ${cyclePlan.cycleNumber} of ${cyclePlan.grade} ${cyclePlan.subject}.
  
  WEEK TOPIC: ${weekData?.topic}
  OUTCOMES: ${weekData?.outcomes.join(', ')}
  FOCUS: ${weekData?.lessonFocus.join(', ')}
  
  CALENDAR CONTEXT:
  Check for holidays or events in the week of ${weekData?.dates}.
  
  REQUIREMENTS:
  1. Assign a specific lesson focus to each day (Monday to Friday).
  2. If a day is a holiday (from calendar), mark it as non-teaching.
  3. Follow the instructional sequence: Intro -> Practice -> Application -> Reinforcement -> Assessment.
  4. Connect each day to a specific learning outcome.
  
  Output as a JSON object matching the WeeklyTeachingPlan interface.`;

  const response = await executeGenAIWithFallback((model) => getGenAI().models.generateContent({
    model,
    contents: prompt,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          cycleNumber: { type: Type.NUMBER },
          weekNumber: { type: Type.NUMBER },
          startDate: { type: Type.STRING },
          endDate: { type: Type.STRING },
          grade: { type: Type.STRING },
          subject: { type: Type.STRING },
          days: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                day: { type: Type.STRING, enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"] },
                date: { type: Type.STRING },
                topic: { type: Type.STRING },
                outcome: { type: Type.STRING },
                isTeachingDay: { type: Type.BOOLEAN },
                reason: { type: Type.STRING }
              }
            }
          }
        }
      }
    }
  }));

  return JSON.parse(response.text);
};

export const improveContent = async (content: string, instruction: string, context: any) => {
  validateGeminiConfig();
  const prompt = `Improve the following educational content:
---
${content}
---
Instruction: ${instruction}
Context: ${JSON.stringify(context)}

Maintain the professional educational tone and ensure the output is classroom-ready.`;

  const response = await executeGenAIWithFallback((model) => getGenAI().models.generateContent({
    model,
    contents: prompt,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION
    }
  }));

  return response.text;
};

export const regenerateSection = async (sectionName: string, lessonContext: LessonPlan) => {
  validateGeminiConfig();
  const isObjectives = /objective/i.test(sectionName);
  const prompt = isObjectives
    ? `Regenerate the "Learning Objectives" section for the following lesson:
Subject: ${lessonContext.subject}
Grade: ${lessonContext.grade}
Topic: ${lessonContext.topic}
Sub-topic: ${lessonContext.subtopic}
Materials: ${(lessonContext.materialsBoard?.map(m => m.name) || lessonContext.materials || []).join(', ')}

PERMANENT RULE: LEARNING OBJECTIVES STRUCTURE
You MUST use ONE SHARED CONDITION for all three learning domains:
- Exactly one shared Condition starting with "Given..." based on the lesson's actual materials and context.
- Cognitive Domain: "Students will [observable cognitive behavior]..." with measurable criteria where appropriate. Do NOT repeat the condition.
- Psychomotor / Skills Domain: "Students will [observable physical/procedural skill behavior]..." with measurable criteria where appropriate. Do NOT repeat the condition.
- Affective Domain: "Students will [observable attitude, participation, or confidence]...". Do NOT repeat the condition.
Do NOT use raw Markdown asterisks, hashtags, or HTML tags.`
    : `Regenerate the "${sectionName}" section for the following lesson:
Subject: ${lessonContext.subject}
Grade: ${lessonContext.grade}
Topic: ${lessonContext.topic}
Sub-topic: ${lessonContext.subtopic}
Objectives: ${lessonContext.specificObjectives.join(', ')}

Ensure the new content is high-quality, detailed, and classroom-ready.`;

  const response = await executeGenAIWithFallback((model) => getGenAI().models.generateContent({
    model,
    contents: prompt,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION
    }
  }));

  return response.text;
};

export const generateVideoScript = async (
  lesson: LessonPlan | DailyLessonPlan,
  mode: VideoMode,
  length: VideoLength
): Promise<string> => {
  validateGeminiConfig();
  const lessonTitle = 'lessonTitle' in lesson ? lesson.lessonTitle : lesson.lesson_title;
  const learningOutcome = 'learningOutcome' in lesson ? lesson.learningOutcome : lesson.learning_outcome;
  const keyVocabulary = 'keyVocabulary' in lesson ? lesson.keyVocabulary : [];
  const content = lesson.content;

  const prompt = `
    Convert the following lesson plan into a natural, spoken Teaching Video Script.
    
    LESSON DETAILS:
    Title: ${lessonTitle}
    Grade: ${lesson.grade}
    Subject: ${lesson.subject}
    Topic: ${lesson.topic}
    Learning Outcome: ${learningOutcome}
    Vocabulary: ${keyVocabulary.join(', ')}
    
    VIDEO MODE: ${mode}
    TARGET LENGTH: ${length}
    
    SCRIPT REQUIREMENTS:
    - Sound like a real classroom teacher.
    - Clear and student-friendly.
    - Age-appropriate for ${lesson.grade} students.
    - Easy to follow aloud.
    
    SCRIPT SECTIONS:
    1. Greeting & Hook
    2. Today's objective in student language
    3. Explanation of main concept
    4. Vocabulary teaching
    5. Examples & Guided thinking prompts
    6. Recap & Exit question
    
    LESSON CONTENT TO USE:
    ${content}
    
    Return ONLY the script text.
  `;

  const response = await executeGenAIWithFallback((model) => getGenAI().models.generateContent({
    model,
    contents: prompt
  }));

  return response.text;
};

export const generateVideoScenes = async (
  lesson: LessonPlan | DailyLessonPlan,
  script: string,
  mode: VideoMode
): Promise<VideoScene[]> => {
  validateGeminiConfig();
  const prompt = `
    Break down the following Teaching Video Script into structured scenes for a video project.
    
    SCRIPT:
    ${script}
    
    VIDEO MODE: ${mode}
    GRADE: ${lesson.grade}
    
    EACH SCENE MUST INCLUDE:
    - Scene Title
    - Narration text (exactly from the script)
    - On-screen text (key points, vocabulary)
    - Visual Description (what should be shown: diagrams, charts, illustrations)
    - Transition note
    - Estimated duration in seconds
    
    Structure the response as a JSON array of objects matching the VideoScene interface.
  `;

  const response = await executeGenAIWithFallback((model) => getGenAI().models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            title: { type: Type.STRING },
            narration: { type: Type.STRING },
            onScreenText: { type: Type.ARRAY, items: { type: Type.STRING } },
            visualDescription: { type: Type.STRING },
            teacherPrompt: { type: Type.STRING },
            transition: { type: Type.STRING },
            duration: { type: Type.NUMBER }
          }
        }
      }
    }
  }));

  const scenes = JSON.parse(response.text);
  return scenes.map((s: any, i: number) => ({
    ...s,
    id: s.id || `scene-${i + 1}`
  }));
};

export const generateSceneAudio = async (
  text: string,
  voiceSettings: { gender: VoiceGender; tone: VoiceTone; pace: VoicePace }
): Promise<string> => {
  validateGeminiConfig();
  const voiceName = voiceSettings.gender === 'Female' ? 'Kore' : 'Zephyr';
  
  const response = await callWithRetry(() => getGenAI().models.generateContent({
    model: "gemini-3.1-flash-tts-preview",
    contents: [{ parts: [{ text: `Say in a ${voiceSettings.tone.toLowerCase()} tone at a ${voiceSettings.pace.toLowerCase()} pace: ${text}` }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName },
        },
      },
    },
  }));

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  return base64Audio || '';
};

export const generateSceneVisual = async (
  sceneDescription: string,
  grade: GradeLevel
): Promise<string> => {
  validateGeminiConfig();
  const response = await callWithRetry(() => getGenAI().models.generateContent({
    model: "gemini-3.1-flash-lite-image",
    contents: {
      parts: [
        {
          text: `Create a high-quality, classroom-ready educational illustration for ${grade} students.
          SCENE DESCRIPTION: ${sceneDescription}
          STYLE: Clean, professional, educational, vibrant colors.
          NO TEXT in the image unless it's a simple label.`,
        },
      ],
    },
  }));

  const parts = response.candidates?.[0]?.content?.parts;
  if (!parts) return '';

  for (const part of parts) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  return '';
};

export const generateLessonVideo = async (
  lesson: LessonPlan | DailyLessonPlan,
  mode: VideoMode = 'Teacher Explainer',
  length: VideoLength = '5 min',
  voiceSettings: { gender: VoiceGender; tone: VoiceTone; pace: VoicePace } = { gender: 'Female', tone: 'Normal', pace: 'Normal' },
  avatarSettings: { enabled: boolean; style: AvatarStyle; placement: AvatarPlacement } = { enabled: false, style: 'Female Teacher', placement: 'Corner' }
): Promise<LessonVideo> => {
  validateGeminiConfig();
  const lessonTitle = 'lessonTitle' in lesson ? lesson.lessonTitle : lesson.lesson_title;
  const learningOutcome = 'learningOutcome' in lesson ? lesson.learningOutcome : lesson.learning_outcome;
  const keyVocabulary = 'keyVocabulary' in lesson ? lesson.keyVocabulary : [];

  const prompt = `Generate a high-quality AI Teaching Video script and scene breakdown for the following lesson plan.
  
  Lesson Title: ${lessonTitle}
  Grade: ${lesson.grade}
  Subject: ${lesson.subject}
  Topic: ${lesson.topic}
  Learning Outcome: ${learningOutcome}
  Key Vocabulary: ${keyVocabulary?.join(', ')}
  
  Video Mode: ${mode}
  Video Length: ${length}
  Voice Settings: ${voiceSettings.gender}, ${voiceSettings.tone} tone, ${voiceSettings.pace} pace.
  Avatar Settings: ${avatarSettings.enabled ? 'Enabled' : 'Disabled'}, Style: ${avatarSettings.style}, Placement: ${avatarSettings.placement}.
  
  The video must feel like a real mini-lesson that can be played in class.
  It must include:
  1. A student-friendly teaching script that sounds like a real teacher.
  2. A scene-by-scene breakdown (Intro, Teach, Practice, Wrap-Up).
  3. Visual descriptions for each scene (diagrams, charts, illustrations).
  
  Structure the response as a JSON object with:
  - title: string
  - script: string
  - scenes: array of objects (id, title, narration, onScreenText[], visualDescription, teacherPrompt, transition, duration)
  - visuals: array of objects (id, type, description)
  
  Ensure the language is age-appropriate for ${lesson.grade} students.
  `;

  const response = await executeGenAIWithFallback((model) => getGenAI().models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      maxOutputTokens: 16384,
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          script: { type: Type.STRING },
          scenes: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                title: { type: Type.STRING },
                narration: { type: Type.STRING },
                onScreenText: { type: Type.ARRAY, items: { type: Type.STRING } },
                visualDescription: { type: Type.STRING },
                teacherPrompt: { type: Type.STRING },
                transition: { type: Type.STRING },
                duration: { type: Type.NUMBER }
              }
            }
          },
          visuals: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                type: { type: Type.STRING },
                description: { type: Type.STRING }
              }
            }
          }
        }
      }
    }
  }));

  const cleanJson = (text: string) => {
    try {
      // Remove potential markdown code blocks
      let cleaned = text.replace(/```json\n?|```/g, '').trim();
      
      // If it's still not valid JSON, try to find the first '{' and last '}'
      if (!cleaned.startsWith('{') && !cleaned.startsWith('[')) {
        const firstBrace = cleaned.indexOf('{');
        const lastBrace = cleaned.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1) {
          cleaned = cleaned.substring(firstBrace, lastBrace + 1);
        }
      }
      return cleaned;
    } catch (e) {
      return text;
    }
  };

  const result = JSON.parse(cleanJson((response as any).text));
  const now = new Date().toISOString();
  
  return {
    ...result,
    scenes: Array.isArray(result.scenes) ? result.scenes : [],
    visuals: Array.isArray(result.visuals) ? result.visuals : [],
    resourcePack: {
      script: result.script || '',
      sceneNotes: '',
      printableVisuals: [],
      worksheet: '',
      reviewQuestions: [],
      vocabularyCards: [],
      recapPoster: ''
    },
    id: Math.random().toString(36).substr(2, 9),
    lessonId: lesson.id || '',
    mode,
    length,
    voiceSettings,
    avatarSettings,
    status: 'Ready',
    videoStatus: 'script_ready',
    stages: {
      script: 'Completed',
      scenes: 'Completed',
      visuals: 'Pending',
      voiceover: 'Pending',
      assembly: 'Pending'
    },
    createdAt: now,
    updatedAt: now
  };
};

export const generateWeeklyLessonPlan = async (params: {
  grade: GradeLevel;
  subject: Subject;
  topic: string;
  cycle: number;
  week: number;
  teachingModel: TeachingModel;
  style?: OutputStyle;
  includeTeacherScript?: boolean;
  includeDifferentiation?: boolean;
  calendarDays?: CalendarDayEntry[];
}): Promise<WeeklyLessonPlan> => {
  validateGeminiConfig();
  const { grade, subject, topic, cycle, week, teachingModel, style = 'Standard Teacher', includeTeacherScript = false, includeDifferentiation = true, calendarDays = [] } = params;

  const prompt = `Generate a COMPLETE 5-DAY WEEKLY LESSON PLAN (Monday–Friday) for the following topic:
  Topic: ${topic}
  Grade: ${grade}
  Subject: ${subject}
  Cycle: ${cycle}
  Week: ${week}
  Teaching Model: ${teachingModel}
  Output Style: ${style}
  
  ### PROGRESSION RULES:
  - Monday: Introduction - Hook students and introduce core concepts.
  - Tuesday: Concept Development - Deepen understanding through explanation and modeling.
  - Wednesday: Guided Practice - Scaffolding learning through group activities.
  - Thursday: Application - Students apply learning independently or in complex tasks.
  - Friday: Assessment/Review - Verify mastery and review the week's goals.
  
  Each day MUST contain a FULL, highly detailed lesson following the structured "lesson" schema (Objectives, Materials, Execution Board, etc.).
  Ensure logical progression and continuity across all 5 days.
  
  Adapt complexity for ${grade}.`;

  const lessonSchema = {
    type: Type.OBJECT,
    properties: {
      lessonTitle: { type: Type.STRING },
      learningOutcome: { type: Type.STRING },
      lessonSnapshot: {
        type: Type.OBJECT,
        properties: {
          about: { type: Type.STRING },
          learning: { type: Type.STRING },
          focus: { type: Type.STRING },
          flow: { type: Type.STRING }
        },
        required: ["about", "learning", "focus", "flow"]
      },
      learningObjectives: {
        type: Type.OBJECT,
        properties: {
          condition: { type: Type.STRING, description: "One shared condition starting with 'Given...'. Do NOT repeat inside individual domains." },
          cognitive: { type: Type.STRING, description: "Cognitive domain: Students will [action]... Do NOT repeat 'Given...'." },
          psychomotor: { type: Type.STRING, description: "Psychomotor / Skills domain: Students will [action]... Do NOT repeat 'Given...'." },
          affective: { type: Type.STRING, description: "Affective domain: Students will [action]... Do NOT repeat 'Given...'." }
        },
        required: ["condition", "cognitive", "psychomotor", "affective"]
      },
      learningObjectivesBoard: {
        type: Type.OBJECT,
        properties: {
          condition: { type: Type.STRING },
          knowledge: { type: Type.STRING },
          skill: { type: Type.STRING },
          attitude: { type: Type.STRING },
          successCriteria: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["condition", "knowledge", "skill", "attitude", "successCriteria"]
      },
      priorKnowledgeActivation: {
        type: Type.OBJECT,
        properties: {
          whatTheyKnow: { type: Type.STRING },
          activationStrategy: { type: Type.STRING },
          misconceptionsToAnticipate: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["whatTheyKnow", "activationStrategy", "misconceptionsToAnticipate"]
      },
      vocabularyFocus: {
        type: Type.OBJECT,
        properties: {
          keyVocabulary: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                term: { type: Type.STRING },
                definition: { type: Type.STRING }
              },
              required: ["term", "definition"]
            }
          }
        },
        required: ["keyVocabulary"]
      },
      materialsBoard: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            purpose: { type: Type.STRING },
            lessonPhase: { type: Type.STRING },
            resourceType: { type: Type.STRING }
          },
          required: ["name", "purpose", "lessonPhase", "resourceType"]
        }
      },
      executionBoard: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            phase: { type: Type.STRING, enum: ['Introduction', 'Explicit Teaching', 'Guided Practice', 'Independent Practice', 'Closure'] },
            timeAllocation: { type: Type.STRING },
            teacherActions: { type: Type.ARRAY, items: { type: Type.STRING } },
            studentActions: { type: Type.ARRAY, items: { type: Type.STRING } },
            questionsToAsk: { type: Type.ARRAY, items: { type: Type.STRING } },
            materialsUsed: { type: Type.ARRAY, items: { type: Type.STRING } },
            ongoingAssessment: {
              type: Type.OBJECT,
              properties: {
                observe: { type: Type.STRING },
                evidenceOfLearning: { type: Type.STRING },
                misconceptions: { type: Type.ARRAY, items: { type: Type.STRING } },
                checkUnderstanding: { type: Type.STRING }
              },
              required: ["observe", "evidenceOfLearning", "misconceptions", "checkUnderstanding"]
            }
          },
          required: ["phase", "timeAllocation", "teacherActions", "studentActions", "questionsToAsk", "materialsUsed", "ongoingAssessment"]
        }
      },
      finalAssessmentBoard: {
        type: Type.OBJECT,
        properties: {
          type: { type: Type.STRING },
          studentTask: { type: Type.STRING },
          evidenceOfLearning: { type: Type.STRING },
          criteriaForSuccess: { type: Type.ARRAY, items: { type: Type.STRING } },
          masteryIndicator: { type: Type.STRING },
          assessmentTool: { type: Type.STRING }
        },
        required: ["type", "studentTask", "evidenceOfLearning", "criteriaForSuccess", "masteryIndicator", "assessmentTool"]
      },
      differentiationFramework: {
        type: Type.OBJECT,
        properties: {
          strugglingLearners: {
            type: Type.OBJECT,
            properties: {
              scaffolds: { type: Type.ARRAY, items: { type: Type.STRING } },
              visuals: { type: Type.ARRAY, items: { type: Type.STRING } },
              manipulatives: { type: Type.ARRAY, items: { type: Type.STRING } },
              simplifiedInstructions: { type: Type.STRING },
              guidedSupport: { type: Type.STRING }
            },
            required: ["scaffolds", "visuals", "manipulatives", "simplifiedInstructions", "guidedSupport"]
          },
          onLevelLearners: {
            type: Type.OBJECT,
            properties: {
              participationExpectations: { type: Type.STRING },
              independentWorkExpectations: { type: Type.STRING },
              peerCollaboration: { type: Type.STRING }
            },
            required: ["participationExpectations", "independentWorkExpectations", "peerCollaboration"]
          },
          advancedLearners: {
            type: Type.OBJECT,
            properties: {
              challengeTasks: { type: Type.ARRAY, items: { type: Type.STRING } },
              deeperThinkingPrompts: { type: Type.ARRAY, items: { type: Type.STRING } },
              extensionActivity: { type: Type.STRING },
              leadershipRole: { type: Type.STRING }
            },
            required: ["challengeTasks", "deeperThinkingPrompts", "extensionActivity", "leadershipRole"]
          }
        },
        required: ["strugglingLearners", "onLevelLearners", "advancedLearners"]
      },
      closurePanel: {
        type: Type.OBJECT,
        properties: {
          recap: { type: Type.STRING },
          demonstration: { type: Type.STRING },
          exitQuestion: { type: Type.STRING },
          nextLessonConnection: { type: Type.STRING }
        },
        required: ["recap", "demonstration", "exitQuestion", "nextLessonConnection"]
      },
      reflectionDashboard: {
        type: Type.OBJECT,
        properties: {
          whatWorked: { type: Type.STRING },
          needsImprovement: { type: Type.STRING },
          followUpStudents: { type: Type.ARRAY, items: { type: Type.STRING } },
          nextSteps: { type: Type.STRING }
        },
        required: ["whatWorked", "needsImprovement", "followUpStudents", "nextSteps"]
      },
      resourceMapping: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            resourceName: { type: Type.STRING },
            phaseUsed: { type: Type.STRING },
            purpose: { type: Type.STRING },
            type: { type: Type.STRING }
          },
          required: ["resourceName", "phaseUsed", "purpose", "type"]
        }
      }
    },
    required: [
      "lessonTitle", 
      "learningOutcome", 
      "lessonSnapshot",
      "learningObjectives",
      "learningObjectivesBoard",
      "priorKnowledgeActivation",
      "vocabularyFocus",
      "materialsBoard",
      "executionBoard",
      "finalAssessmentBoard",
      "differentiationFramework",
      "closurePanel",
      "reflectionDashboard",
      "resourceMapping"
    ]
  };

  const response = await executeGenAIWithFallback((model) => getGenAI().models.generateContent({
    model,
    contents: prompt,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      maxOutputTokens: 32768, // Allow for very large response
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          week: {
            type: Type.OBJECT,
            properties: {
              grade: { type: Type.STRING },
              subject: { type: Type.STRING },
              topic: { type: Type.STRING },
              days: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    day: { type: Type.STRING, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] },
                    lesson: lessonSchema
                  },
                  required: ["day", "lesson"]
                }
              }
            },
            required: ["grade", "subject", "topic", "days"]
          }
        },
        required: ["week"]
      }
    }
  }));

  const cleanJson = (text: string) => {
    return text.replace(/```json\n?|```/g, '').trim();
  };

  const result = JSON.parse(cleanJson((response as any).text));
  
  // Post-process to ensure daily lessons have basic metadata and normalized objectives
  const processedDays = result.week.days.map((d: any) => {
    const norm = normalizeLearningObjectives(d.lesson, { 
      topic: d.lesson?.topic || topic, 
      materials: d.lesson?.materialsBoard?.map((m: any) => m.name) || d.lesson?.materials 
    });
    return {
      ...d,
      lesson: {
        ...d.lesson,
        learningObjectives: norm,
        learningObjectivesBoard: {
          ...d.lesson?.learningObjectivesBoard,
          condition: norm.condition,
          knowledge: norm.cognitive,
          skill: norm.psychomotor,
          attitude: norm.affective,
          successCriteria: d.lesson?.learningObjectivesBoard?.successCriteria || []
        },
        specificObjectives: [
          norm.cognitive,
          norm.psychomotor,
          norm.affective
        ],
        grade,
        subject,
        cycle,
        week,
        topic,
        createdAt: new Date().toISOString(),
        structured_json: d.lesson
      }
    };
  });

  return {
    ...result,
    week: {
      ...result.week,
      days: processedDays
    },
    createdAt: new Date().toISOString(),
    createdBy: ''
  };
};

export const generateVideoResourcePack = async (
  lesson: LessonPlan | DailyLessonPlan,
  video: LessonVideo
): Promise<LessonVideo['resourcePack']> => {
  validateGeminiConfig();
  const prompt = `Generate a complete Teaching Resource Pack to accompany the following AI Teaching Video.
  
  Video Title: ${video.title}
  Video Script: ${video.script}
  
  Generate:
  1. Scene Notes for the teacher.
  2. Printable Visuals descriptions.
  3. A matching Worksheet.
  4. Review Questions based on the video.
  5. Vocabulary Cards (term and definition).
  6. A Recap Poster summary.
  
  Structure the response as a JSON object matching the resourcePack structure.
  `;

  const response = await executeGenAIWithFallback((model) => getGenAI().models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      maxOutputTokens: 16384,
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          script: { type: Type.STRING },
          sceneNotes: { type: Type.STRING },
          printableVisuals: { type: Type.ARRAY, items: { type: Type.STRING } },
          worksheet: { type: Type.STRING },
          reviewQuestions: { type: Type.ARRAY, items: { type: Type.STRING } },
          vocabularyCards: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                term: { type: Type.STRING },
                definition: { type: Type.STRING }
              }
            }
          },
          recapPoster: { type: Type.STRING }
        }
      }
    }
  }));

  const cleanJson = (text: string) => {
    try {
      // Remove potential markdown code blocks
      let cleaned = text.replace(/```json\n?|```/g, '').trim();
      
      // If it's still not valid JSON, try to find the first '{' and last '}'
      if (!cleaned.startsWith('{') && !cleaned.startsWith('[')) {
        const firstBrace = cleaned.indexOf('{');
        const lastBrace = cleaned.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1) {
          cleaned = cleaned.substring(firstBrace, lastBrace + 1);
        }
      }
      return cleaned;
    } catch (e) {
      return text;
    }
  };

  const result = JSON.parse(cleanJson(response.text));
  return {
    script: result.script || '',
    sceneNotes: result.sceneNotes || '',
    printableVisuals: Array.isArray(result.printableVisuals) ? result.printableVisuals : [],
    worksheet: result.worksheet || '',
    reviewQuestions: Array.isArray(result.reviewQuestions) ? result.reviewQuestions : [],
    vocabularyCards: Array.isArray(result.vocabularyCards) ? result.vocabularyCards : [],
    recapPoster: result.recapPoster || ''
  };
};

export const generatePowerPointPresentation = async (lesson: any) => {
  validateGeminiConfig();

  const subject = typeof lesson.subject === 'object' && lesson.subject !== null
    ? (lesson.subject.name || lesson.subject.subject || 'General')
    : (lesson.subject || 'General');

  const grade = typeof lesson.grade === 'object' && lesson.grade !== null
    ? (lesson.grade.name || lesson.grade.grade || 'Standard 4')
    : (lesson.grade || lesson.class_id || lesson.className || 'Standard 4');

  const topic = typeof lesson.topic === 'object' && lesson.topic !== null
    ? (lesson.topic.topic || lesson.topic.name || 'Lesson Topic')
    : (lesson.topic || lesson.title || 'Lesson Topic');

  const subtopic = lesson.subtopic || lesson.sub_topic || '';
  const title = lesson.lessonTitle || lesson.title || topic;

  // Extract objectives
  const objectives = lesson.learningObjectivesBoard?.successCriteria 
    || lesson.specificObjectives 
    || lesson.objectives 
    || (lesson.learningOutcome ? [lesson.learningOutcome] : []);

  // Extract vocabulary
  const vocabulary = lesson.vocabularyFocus?.keyVocabulary 
    || lesson.keyVocabularyTable 
    || lesson.keyVocabulary 
    || [];

  // Extract phases & worked examples
  const phases = Array.isArray(lesson.executionBoard) ? lesson.executionBoard : [];
  const workedExamples = lesson.workedExamplesList || [];
  const exitTicket = lesson.closurePanel?.exitQuestion || lesson.finalAssessmentBoard?.studentTask || '';

  const prompt = `You are an expert instructional designer and curriculum specialist.
Generate a complete, classroom-ready, 10-13 slide PowerPoint presentation specifically for this lesson:

Subject: ${subject}
Grade Level: ${grade}
Topic: ${topic}
Subtopic: ${subtopic}
Lesson Title: ${title}
Learning Objectives / Success Criteria: ${JSON.stringify(objectives)}
Key Vocabulary: ${JSON.stringify(vocabulary)}
Execution Phases: ${JSON.stringify(phases.map((p: any) => ({ phase: p.phase, teacherAction: p.teacherAction, studentAction: p.studentAction })))}
Worked Examples: ${JSON.stringify(workedExamples)}
Exit Ticket / Assessment: ${exitTicket}

INSTRUCTIONAL SEQUENCE REQUIREMENTS:
The presentation must follow a clear, pedagogically sound teaching flow appropriate for elementary students:
1. Title Slide (Lesson Title, Grade, Subject, Focus)
2. Learning Objectives & Success Criteria (Student-friendly "I can..." statements)
3. Prior Knowledge / Warm-Up (Engaging question or challenge connecting to prior knowledge)
4. Introduction to the Topic (Hook, big idea, real-world connection)
5. Key Concepts & Vocabulary (Definitions with clear, simple terms and examples)
6. Teacher Explanation ("I Do" - clear, step-by-step teacher demonstration)
7. Worked Examples (Clear model problem, step-by-step solution)
8. Visual Representation or Diagram (Concept diagram, flow chart, or visual representation)
9. Guided Practice ("We Do" - collaborative classroom problem with scaffolded hints)
10. Student Activity / Collaboration (Paired or group activity with instructions and timing)
11. Independent Practice ("You Do" - student practice task to demonstrate individual mastery)
12. Assessment / Exit Ticket (1-3 quick mastery check questions)
13. Lesson Summary (Key takeaways, review, and look ahead)

SUBJECT ADJUSTMENTS:
- Mathematics: Include worked numerical/geometric examples, clear step-by-step solutions, and practice problems.
- Science: Include observable phenomena, process steps, diagrams, and hypothesis/conclusion questions.
- English / Language Arts: Include reading excerpts, sentence frames, phonics/vocabulary models, and writing tasks.
- Social Studies: Include historical/geographical context, key facts, timelines/maps references, and discussion prompts.

DESIGN GUIDELINES:
- Concise bullet points (3-4 per slide, maximum 15 words per bullet). Never copy entire textbook paragraphs.
- Clear, age-appropriate language for ${grade}.
- Every slide must include "teacherPromptOrNotes" containing what the teacher should say or check during that slide.

Return strict JSON conforming to the schema.`;

  try {
    const response = await executeGenAIWithFallback((model) => getGenAI().models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            subtitle: { type: Type.STRING },
            subject: { type: Type.STRING },
            grade: { type: Type.STRING },
            topic: { type: Type.STRING },
            subtopic: { type: Type.STRING },
            theme: { 
              type: Type.STRING, 
              enum: ['modern_indigo', 'emerald_nature', 'warm_amber', 'deep_ocean', 'chalkboard_slate'] 
            },
            slides: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  slideNumber: { type: Type.INTEGER },
                  slideType: { 
                    type: Type.STRING,
                    enum: [
                      'title', 
                      'objectives', 
                      'warmup', 
                      'introduction', 
                      'key_concepts', 
                      'teacher_explanation', 
                      'worked_examples', 
                      'visual_diagram', 
                      'guided_practice', 
                      'student_activity', 
                      'independent_practice', 
                      'assessment_exit', 
                      'summary'
                    ]
                  },
                  title: { type: Type.STRING },
                  subtitle: { type: Type.STRING },
                  bullets: { 
                    type: Type.ARRAY, 
                    items: { type: Type.STRING } 
                  },
                  teacherPromptOrNotes: { type: Type.STRING },
                  diagramText: { type: Type.STRING }
                },
                required: ["slideNumber", "slideType", "title", "bullets", "teacherPromptOrNotes"]
              }
            }
          },
          required: ["title", "subject", "grade", "topic", "slides"]
        }
      }
    }));

    const cleanJson = (text: string | undefined) => {
      if (!text) return '{}';
      return text.replace(/```json\n?|```/g, '').trim();
    };

    const parsed = JSON.parse(cleanJson(response.text));
    if (parsed && Array.isArray(parsed.slides) && parsed.slides.length >= 6) {
      return {
        id: `pres-${lesson.id || Date.now()}`,
        lessonId: lesson.id,
        title: parsed.title || title,
        subtitle: parsed.subtitle || subtopic,
        subject: parsed.subject || subject,
        grade: parsed.grade || grade,
        topic: parsed.topic || topic,
        subtopic: parsed.subtopic || subtopic,
        theme: parsed.theme || getThemeForSubject(subject),
        slides: parsed.slides.map((s: any, idx: number) => ({
          id: `slide-${idx + 1}`,
          slideNumber: s.slideNumber || idx + 1,
          slideType: s.slideType || 'teacher_explanation',
          title: s.title || 'Slide Title',
          subtitle: s.subtitle || '',
          bullets: Array.isArray(s.bullets) ? s.bullets : [],
          teacherPromptOrNotes: s.teacherPromptOrNotes || '',
          diagramText: s.diagramText || undefined
        })),
        generatedAt: new Date().toISOString(),
        version: 1
      };
    }
  } catch (err) {
    console.warn("AI generatePowerPointPresentation failed, falling back to deterministic generator:", err);
  }

  return buildDeterministicPowerPoint(lesson);
};

