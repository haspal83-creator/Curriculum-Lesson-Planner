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
  WeeklyLessonPlan
} from "../types";

import { callWithRetry } from "../lib/utils";

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

import { ai } from "../lib/gemini";
const masterCalendar = getMasterCalendar();

const SYSTEM_INSTRUCTION = `You are a Master Curriculum Specialist. Help teachers create professional, curriculum-aligned, classroom-ready lesson plans.

### CORE PHILOSOPHY: THE TEACHING WORKSPACE
- **Dashboard Layout:** Structure plans as landscape-oriented workspaces. Avoid long documents.
- **Actionable:** Content must be readable and actionable for direct teaching from the screen.
- **Execution-Focused:** Use the "Lesson Execution Board" to break lessons into clear phases with teacher/student actions.
- **Embedded Support:** Weave assessment and differentiation into the instructional flow.
- **Curriculum-Driven:** Root every plan in provided curriculum entries. Teacher's Guides (CurriculumUnit) are the ABSOLUTE SOURCE OF TRUTH.

### REQUIRED STRUCTURE
1. **HEADER:** Subject, Grade, Date, Duration, Topic, Outcome, Mode.
2. **SNAPSHOT:** Summary (About, Learning, Focus, Flow).
3. **STRATEGIES & METHODOLOGY:** List specific teaching strategies used throughout the lesson (e.g., scaffolding, modeling, pair work) and the overarching methodology.
4. **OBJECTIVES BOARD:** Knowledge, skill, attitude, success criteria.
4. **PRIOR KNOWLEDGE:** What they know, activation, misconceptions.
5. **VOCABULARY:** Terms, definitions, academic language, pronunciation.
6. **MATERIALS BOARD:** Mapping materials to phases.
7. **EXECUTION BOARD:** Phases (Intro, Explicit, Guided, Independent, Closure).
   - Each phase: Time, Teacher/Student Actions, Questions, Engagement, Materials, Response, Assessment.
   - Phase 2: Explanation/Modeling, Key Concept.
   - Phase 3: Support/Scaffolding, Check for Understanding.
   - Phase 4: Student Task, Monitoring.
8. **ASSESSMENT SYSTEM:** Ongoing checks and final Assessment Board.
9. **DIFFERENTIATION:** Supports for Struggling, On-Level, Advanced, Inclusion.
10. **CLOSURE:** Recap, demonstration, exit question, next lesson link.
11. **REFLECTION:** Post-lesson analysis blocks.
12. **HOMEWORK:** Task, purpose, materials.
13. **RESOURCE MAPPING:** Connecting resources to phases.

### RULES
- **No Paragraphs in Procedures:** Use bulleted lists.
- **ABCD Objectives:** "Given [Condition], students will be able to [Behavior] with [Criteria]."` ;

export const parseCurriculum = async (fileData?: { data: string, mimeType: string }, text?: string) => {
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

  const response = await callWithRetry(() => ai.models.generateContent({
    model: "gemini-3-flash-preview",
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

  const response = await callWithRetry(() => ai.models.generateContent({
    model: "gemini-3-flash-preview",
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
  const response = await callWithRetry(() => ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
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
  cycle: number;
  week: number;
  numDays: number;
  entries: any[];
  previousWeeks?: any[];
  calendarDays?: CalendarDayEntry[];
  curriculumUnit?: CurriculumUnit;
}): Promise<Partial<WeeklyCurriculumPlan>> => {
  const { grade, subject, cycle, week, numDays, entries, previousWeeks = [], calendarDays = [], curriculumUnit } = params;

  // Filter for actual teaching days in this week
  const teachingDaysInWeek = calendarDays.filter(d => d.week === week && d.isTeachingDay);
  
  // Force 5 days as per user request to see 5 daily plans for each weekly plan
  const actualNumDays = 5; 

  const prompt = `You are a smart curriculum planner. Using the provided curriculum entries for ${grade}, ${subject}, Cycle ${cycle}, determine the most logical topic, sub-topics, and learning outcomes for Week ${week}.
  
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

  const response = await callWithRetry(() => ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
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

  return JSON.parse(cleanJson(response.text));
};

export const generateLessonPlan = async (params: {
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
  const { grade, subject, cycle, week, day, topic, subtopic, lessonTitle, objectives, learningOutcome, duration, teachingModel, specialNotes, style = 'Standard Teacher', includeTeacherScript = false, includeDifferentiation = true, calendarDays = [], curriculumUnit } = params;

  const teachingDay = calendarDays.find(d => d.date === params.date || (d.week === week && d.dayNumber === day));
  const actualDuration = teachingDay?.type === 'Half Day' ? '30 minutes' : duration;

  const prompt = `Generate a highly detailed, professional, and structured COMPLETE CLASSROOM-READY LESSON EXECUTION PACK for Day ${day} of Week ${week}.
${teachingDay ? `Scheduled Date: ${safeFormat(teachingDay.date, 'EEEE, MMMM do')} (${teachingDay.type})` : ''}
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

### MANDATORY OUTPUT COMPONENTS
Generate a full lesson execution support system following the structure defined in your system instructions.

Rules:
- Procedures MUST be bulleted steps. NO long paragraphs.
- Use realistic teacher language.
- Specific Objectives MUST follow the ABCD format.
- Visuals must be fully described with content, not just titles.
- Materials must be precise and organized by stage.
- Adapt complexity for ${grade}.`;

  const response = await callWithRetry(() => ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
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
          learningObjectivesBoard: {
            type: Type.OBJECT,
            properties: {
              knowledge: { type: Type.STRING },
              skill: { type: Type.STRING },
              attitude: { type: Type.STRING },
              successCriteria: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["knowledge", "skill", "successCriteria"]
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
    
    return {
      ...result,
      content: "", // Content is now handled by structured fields in UI
      grade,
      subject,
      cycle,
      week,
      topic,
      subtopic,
      learningOutcome
    };
  } catch (e) {
    console.error("Failed to parse lesson plan JSON:", e, response.text);
    throw new Error("Failed to parse generated lesson plan.");
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
      duration: teachingDay?.type === 'Half Day' ? '30 minutes' : '45 minutes',
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

  const response = await callWithRetry(() => ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
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

  const response = await callWithRetry(() => ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
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

export const generateResource = async (type: string, lessonContext: LessonPlan, options: any = {}) => {
  const prompt = `Generate a high-quality ${type} based on the following lesson context:
Subject: ${lessonContext.subject}
Grade: ${lessonContext.grade}
Topic: ${lessonContext.topic}
Sub-topic: ${lessonContext.subtopic}
General Objective: ${lessonContext.generalObjective || ''}
Specific Objectives: ${(lessonContext.specificObjectives || lessonContext.learningObjectivesBoard?.successCriteria || []).join(', ')}

Requirements for ${type}:
${type === 'Worksheet' ? '- Age-appropriate, visually simple, varied question types (MCQ, Fill-in-blanks, matching, word problems), progressive difficulty, includes instructions and optional answer key.' : ''}
${type === 'Quiz' || type === 'Test' ? '- Professional assessment, marks included, varied question types, balanced difficulty, curriculum-aligned, includes clear instructions and answer key.' : ''}
${type === 'Notebook Notes' ? '- Clear, simple, short enough to copy, well-organized, includes heading, key definitions, examples, and summary. Board-style formatting.' : ''}
${type === 'PowerPoint Outline' ? '- Concise bullet points, slide titles, interactive prompts, student participation moments. Include slides for: Title, Objective, Warm-up, Teaching content, Example/Practice, Activity, Review, Exit Ticket.' : ''}
${type === 'Homework' || type === 'Exit Ticket' ? '- Short, focused, realistic, relevant, manageable, skill-based.' : ''}
${type === 'Rubric' || type === 'Checklist' ? '- Structured, teacher-friendly format. Rubric: criteria, levels, descriptors. Checklist: skills/behaviors, yes/no/rating, comments.' : ''}

Style: ${options.style || 'Standard Teacher'}
Include Answer Key: ${options.includeAnswerKey ? 'Yes' : 'No'}

Output the content in Markdown format.`;

  const response = await callWithRetry(() => ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: prompt,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION
    }
  }));

  return response.text;
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

  const response = await callWithRetry(() => ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
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

  const response = await callWithRetry(() => ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
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

  const response = await callWithRetry(() => ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
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

  const response = await callWithRetry(() => ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
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

  const response = await callWithRetry(() => ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
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

  const response = await callWithRetry(() => ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
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

  const response = await callWithRetry(() => ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
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
  const prompt = `Improve the following educational content:
---
${content}
---
Instruction: ${instruction}
Context: ${JSON.stringify(context)}

Maintain the professional educational tone and ensure the output is classroom-ready.`;

  const response = await callWithRetry(() => ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: prompt,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION
    }
  }));

  return response.text;
};

export const regenerateSection = async (sectionName: string, lessonContext: LessonPlan) => {
  const prompt = `Regenerate the "${sectionName}" section for the following lesson:
Subject: ${lessonContext.subject}
Grade: ${lessonContext.grade}
Topic: ${lessonContext.topic}
Sub-topic: ${lessonContext.subtopic}
Objectives: ${lessonContext.specificObjectives.join(', ')}

Ensure the new content is high-quality, detailed, and classroom-ready.`;

  const response = await callWithRetry(() => ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
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

  const response = await callWithRetry(() => ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt
  }));

  return response.text;
};

export const generateVideoScenes = async (
  lesson: LessonPlan | DailyLessonPlan,
  script: string,
  mode: VideoMode
): Promise<VideoScene[]> => {
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

  const response = await callWithRetry(() => ai.models.generateContent({
    model: "gemini-3-flash-preview",
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
  const voiceName = voiceSettings.gender === 'Female' ? 'Kore' : 'Zephyr';
  
  const response = await callWithRetry(() => ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
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
  const response = await callWithRetry(() => ai.models.generateContent({
    model: "gemini-2.5-flash-image",
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

  const response = await callWithRetry(() => ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
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

  const result = JSON.parse(cleanJson(response.text));
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
      learningObjectivesBoard: {
        type: Type.OBJECT,
        properties: {
          knowledge: { type: Type.STRING },
          skill: { type: Type.STRING },
          successCriteria: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["knowledge", "skill", "successCriteria"]
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

  const response = await callWithRetry(() => ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
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

  const result = JSON.parse(cleanJson(response.text));
  
  // Post-process to ensure daily lessons have basic metadata
  const processedDays = result.week.days.map((d: any) => ({
    ...d,
    lesson: {
      ...d.lesson,
      grade,
      subject,
      cycle,
      week,
      topic,
      createdAt: new Date().toISOString(),
      structured_json: d.lesson
    }
  }));

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

  const response = await callWithRetry(() => ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
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
