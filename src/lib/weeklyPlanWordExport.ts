import {
  Document,
  Paragraph,
  Table,
  TableRow,
  TableCell,
  TextRun,
  HeadingLevel,
  AlignmentType,
  WidthType,
  BorderStyle,
  Header,
  Footer,
  PageNumber,
  PageBreak
} from 'docx';
import { 
  resolveCompleteLessonResources, 
  ResolvedLessonResources, 
  OFFICIAL_SCHOOL_NAME, 
  sanitizeExportText, 
  toCleanBullets 
} from './lessonExportResolver';
import { LessonPlan } from '../types';

// ==========================================
// COLOR PALETTE & DESIGN TOKENS
// ==========================================
const PRIMARY_NAVY = '1E3A8A';   // Deep Academic Navy
const TEXT_MAIN = '1E293B';      // Slate 800
const TEXT_MUTED = '475569';     // Slate 600
const BORDER_COLOR = 'CBD5E1';   // Slate 300
const HEADER_BG = 'F1F5F9';      // Slate 100
const LABEL_BG = 'F8FAFC';       // Slate 50
const SUCCESS_COLOR = '047857';  // Emerald 700

// Common Cell Borders
const TABLE_BORDER = {
  top: { style: BorderStyle.SINGLE, size: 4, color: BORDER_COLOR },
  bottom: { style: BorderStyle.SINGLE, size: 4, color: BORDER_COLOR },
  left: { style: BorderStyle.SINGLE, size: 4, color: BORDER_COLOR },
  right: { style: BorderStyle.SINGLE, size: 4, color: BORDER_COLOR }
};

// ==========================================
// TYPOGRAPHIC HELPERS
// ==========================================
function clean(val: any, fallback = '—'): string {
  const s = sanitizeExportText(val);
  return s && s.trim().length > 0 ? s.trim() : fallback;
}

function createParagraph(
  text: string, 
  options: { bold?: boolean; italics?: boolean; color?: string; size?: number; align?: any; spacingAfter?: number } = {}
): Paragraph {
  return new Paragraph({
    alignment: options.align || AlignmentType.LEFT,
    spacing: { before: 20, after: options.spacingAfter !== undefined ? options.spacingAfter : 60 },
    children: [
      new TextRun({
        text: clean(text),
        bold: options.bold || false,
        italics: options.italics || false,
        size: options.size || 20, // 10pt
        color: options.color || TEXT_MAIN
      })
    ]
  });
}

function createBullet(text: string, level = 0): Paragraph {
  return new Paragraph({
    bullet: { level },
    spacing: { before: 20, after: 40 },
    children: [
      new TextRun({
        text: clean(text),
        size: 19, // 9.5pt
        color: TEXT_MAIN
      })
    ]
  });
}

function createSectionHeading(title: string, spacingBefore = 220): Paragraph {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: spacingBefore, after: 60 },
    keepNext: true,
    children: [
      new TextRun({
        text: title.toUpperCase(),
        bold: true,
        size: 23, // 11.5pt
        color: PRIMARY_NAVY
      })
    ]
  });
}

function createSubheading(title: string, spacingBefore = 140): Paragraph {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: spacingBefore, after: 40 },
    keepNext: true,
    children: [
      new TextRun({
        text: title,
        bold: true,
        size: 21, // 10.5pt
        color: PRIMARY_NAVY
      })
    ]
  });
}

function createDayBanner(dayLabel: string, lessonTitle: string): Paragraph {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    alignment: AlignmentType.LEFT,
    spacing: { before: 180, after: 80 },
    keepNext: true,
    children: [
      new TextRun({
        text: `${dayLabel.toUpperCase()}: `,
        bold: true,
        size: 28, // 14pt
        color: PRIMARY_NAVY
      }),
      new TextRun({
        text: clean(lessonTitle).toUpperCase(),
        bold: true,
        size: 28, // 14pt
        color: TEXT_MAIN
      })
    ]
  });
}

// ==========================================
// TABLE & CELL CONSTRUCTORS
// ==========================================
function createCell(
  content: string | Paragraph | Paragraph[],
  widthPercent: number,
  options: { isHeader?: boolean; isLabel?: boolean; minHeight?: number } = {}
): TableCell {
  let paragraphs: Paragraph[] = [];

  if (typeof content === 'string') {
    const isBold = options.isHeader || options.isLabel;
    const color = options.isHeader ? PRIMARY_NAVY : (options.isLabel ? PRIMARY_NAVY : TEXT_MAIN);
    paragraphs = [
      new Paragraph({
        spacing: { before: 30, after: 30 },
        children: [
          new TextRun({
            text: clean(content),
            bold: isBold,
            size: options.isHeader ? 20 : 19, // 10pt or 9.5pt
            color
          })
        ]
      })
    ];
  } else if (Array.isArray(content)) {
    paragraphs = content.length > 0 ? content : [new Paragraph({ children: [new TextRun("—")] })];
  } else {
    paragraphs = [content];
  }

  let shadingColor: string | undefined = undefined;
  if (options.isHeader) {
    shadingColor = HEADER_BG;
  } else if (options.isLabel) {
    shadingColor = LABEL_BG;
  }

  return new TableCell({
    width: { size: widthPercent, type: WidthType.PERCENTAGE },
    borders: TABLE_BORDER,
    shading: shadingColor ? { fill: shadingColor } : undefined,
    margins: { top: 80, bottom: 80, left: 100, right: 100 },
    children: paragraphs
  });
}

// Two-column or Four-column detail rows
function createFourColDetailsRow(label1: string, val1: string, label2: string, val2: string): TableRow {
  return new TableRow({
    cantSplit: true,
    children: [
      createCell(label1, 20, { isLabel: true }),
      createCell(val1, 30),
      createCell(label2, 20, { isLabel: true }),
      createCell(val2, 30)
    ]
  });
}

function createTwoColRow(label: string, content: string | Paragraph | Paragraph[], labelWidth = 28, valWidth = 72): TableRow {
  return new TableRow({
    cantSplit: true,
    children: [
      createCell(label, labelWidth, { isLabel: true }),
      createCell(content, valWidth)
    ]
  });
}

// ==========================================
// DAILY LESSON BUILDER (ALL 10 SECTIONS)
// ==========================================
export function buildDailyLessonDocxElements(
  dayLabel: string,
  res: ResolvedLessonResources,
  isFirstDay: boolean
): (Paragraph | Table)[] {
  const elements: (Paragraph | Table)[] = [];

  // Page break between days so every day starts cleanly on a fresh page
  if (!isFirstDay) {
    elements.push(new Paragraph({ children: [new PageBreak()] }));
  }

  // ----------------------------------------------------
  // DAILY LESSON BANNER
  // ----------------------------------------------------
  elements.push(createDayBanner(dayLabel, res.lessonTitle));

  // ----------------------------------------------------
  // 1. LESSON DETAILS (STRUCTURED TWO-COLUMN / FOUR-FIELD TABLE)
  // ----------------------------------------------------
  elements.push(createSubheading("Daily Lesson Information", 80));
  elements.push(new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      createFourColDetailsRow("Lesson Title", res.lessonTitle, "Date", res.dateStr),
      createFourColDetailsRow("Duration", res.duration, "Teacher", res.teacherName),
      createFourColDetailsRow("Class / Grade", res.grade, "Subject", res.subject),
      createFourColDetailsRow("Topic", res.topic, "Subtopic", res.subtopic)
    ]
  }));

  // ----------------------------------------------------
  // 2. CURRICULUM ALIGNMENT TABLE
  // ----------------------------------------------------
  elements.push(createSectionHeading("Curriculum Alignment", 180));
  elements.push(new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      createTwoColRow("Curriculum Framework", "Belize National Primary School Curriculum Framework (BNCF)"),
      createTwoColRow("Cycle & Strand", `Cycle ${res.cycle}  |  Strand: ${res.strand}`),
      createTwoColRow("Content Standard / Core Competencies", res.competencies),
      createTwoColRow("Targeted Learning Outcomes", res.learningOutcome),
      createTwoColRow("Curriculum Alignment Code", res.curriculumCode)
    ]
  }));

  // ----------------------------------------------------
  // 3. PREVIOUS KNOWLEDGE
  // ----------------------------------------------------
  elements.push(createSectionHeading("1. Previous Knowledge", 180));
  elements.push(new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      createTwoColRow("Prior Knowledge Activation & Prerequisite Concepts", res.priorKnowledge)
    ]
  }));

  // ----------------------------------------------------
  // 4. CORE COMPETENCIES
  // ----------------------------------------------------
  elements.push(createSectionHeading("2. Core Competencies", 180));
  elements.push(new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      createTwoColRow("Belize Core Competency Focus", res.competencies)
    ]
  }));

  // ----------------------------------------------------
  // 5. LEARNING OBJECTIVES & SUCCESS CRITERIA
  // ----------------------------------------------------
  elements.push(createSectionHeading("3. Learning Objectives & Success Criteria", 180));
  const successCriteriaParagraphs = res.successCriteria && res.successCriteria.length > 0
    ? res.successCriteria.map(sc => createBullet(sc))
    : [createParagraph("Students demonstrate proficiency through guided and independent tasks.")];

  elements.push(new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      createTwoColRow("Instructional Condition", res.condition || "Given structured guidance, mentor models, and appropriate tools..."),
      createTwoColRow("Cognitive Domain (Bloom's Taxonomy)", res.cognitive),
      createTwoColRow("Psychomotor / Skills Domain", res.psychomotor),
      createTwoColRow("Affective / Attitudinal Domain", res.affective),
      createTwoColRow("Success Criteria ('I Can' Statements)", successCriteriaParagraphs)
    ]
  }));

  // ----------------------------------------------------
  // 6. CONTENT NOTES & KEY VOCABULARY
  // ----------------------------------------------------
  elements.push(createSectionHeading("4. Content Notes & Key Vocabulary", 180));
  const vocabParagraphs = res.vocabularyList && res.vocabularyList.length > 0
    ? res.vocabularyList.map(v => new Paragraph({
        spacing: { before: 20, after: 30 },
        children: [
          new TextRun({ text: `${v.term}: `, bold: true, size: 19, color: PRIMARY_NAVY }),
          new TextRun({ text: v.definition, size: 19, color: TEXT_MAIN })
        ]
      }))
    : [createParagraph("Key vocabulary terms reviewed in context.")];

  elements.push(new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      createTwoColRow("Key Concept Overview", res.lessonDescription),
      createTwoColRow("Vocabulary Terms & Definitions", vocabParagraphs)
    ]
  }));

  // ----------------------------------------------------
  // 7. RESOURCES & INSTRUCTIONAL MATERIALS
  // ----------------------------------------------------
  elements.push(createSectionHeading("5. Resources & Instructional Materials", 180));
  const materialsParagraphs = res.materialsList && res.materialsList.length > 0
    ? res.materialsList.map(m => new Paragraph({
        bullet: { level: 0 },
        spacing: { before: 20, after: 30 },
        children: [
          new TextRun({ text: `${m.name}: `, bold: true, size: 19 }),
          new TextRun({ text: m.purpose || 'Instructional aid', size: 19, color: TEXT_MUTED })
        ]
      }))
    : [createParagraph("Standard classroom whiteboard, student notebooks, and curriculum texts.")];

  elements.push(new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      createTwoColRow("Materials & Educational Technologies", materialsParagraphs)
    ]
  }));

  // ----------------------------------------------------
  // 8. TEACHING AND LEARNING PROCEDURES (4-COLUMN EXECUTION TABLE)
  // ----------------------------------------------------
  elements.push(createSectionHeading("6. Teaching and Learning Procedures", 180));
  elements.push(new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        cantSplit: true,
        children: [
          createCell("Phase / Duration", 18, { isHeader: true }),
          createCell("Teacher Actions (Modeling & Facilitation)", 30, { isHeader: true }),
          createCell("Student Actions (Tasks & Discourse)", 28, { isHeader: true }),
          createCell("Assessment Check & Key Questions", 24, { isHeader: true })
        ]
      }),
      ...res.stages.map(stage => {
        const teacherParas = stage.teacherActions && stage.teacherActions.length > 0
          ? stage.teacherActions.map(a => createBullet(a))
          : [createParagraph("Facilitate instructional steps.")];

        const studentParas = stage.studentActions && stage.studentActions.length > 0
          ? stage.studentActions.map(a => createBullet(a))
          : [createParagraph("Actively engage and respond.")];

        const assessmentParas: Paragraph[] = [];
        if (stage.assessment && stage.assessment.trim().length > 0) {
          assessmentParas.push(createParagraph(stage.assessment));
        }
        if (stage.keyQuestions && stage.keyQuestions.length > 0) {
          assessmentParas.push(new Paragraph({
            spacing: { before: 20, after: 20 },
            children: [new TextRun({ text: "Check Questions:", bold: true, size: 18, color: PRIMARY_NAVY })]
          }));
          stage.keyQuestions.forEach(q => assessmentParas.push(createBullet(q)));
        }
        if (assessmentParas.length === 0) {
          assessmentParas.push(createParagraph("Informal observation and check."));
        }

        return new TableRow({
          cantSplit: true,
          children: [
            createCell([
              new Paragraph({
                spacing: { before: 20, after: 20 },
                children: [
                  new TextRun({ text: stage.title, bold: true, size: 19, color: PRIMARY_NAVY })
                ]
              }),
              new Paragraph({
                spacing: { before: 0, after: 20 },
                children: [
                  new TextRun({ text: stage.duration, size: 18, italics: true, color: TEXT_MUTED })
                ]
              })
            ], 18, { isLabel: true }),
            createCell(teacherParas, 30),
            createCell(studentParas, 28),
            createCell(assessmentParas, 24)
          ]
        });
      })
    ]
  }));

  // ----------------------------------------------------
  // 9. DIFFERENTIATION & INCLUSIVE STRATEGIES
  // ----------------------------------------------------
  elements.push(createSectionHeading("7. Differentiation & Inclusive Strategies", 180));
  elements.push(new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        cantSplit: true,
        children: [
          createCell("Learner Profile / Need", 28, { isHeader: true }),
          createCell("Instructional Scaffolding & Support Strategy", 72, { isHeader: true })
        ]
      }),
      createTwoColRow(
        "Tier 1 & 2 Support (Struggling Learners)",
        res.differentiation.strugglingLearners.map(s => createBullet(s))
      ),
      createTwoColRow(
        "On-Level Learners",
        res.differentiation.onLevelLearners.map(s => createBullet(s))
      ),
      createTwoColRow(
        "Advanced Learners (Extension & Challenge)",
        res.differentiation.advancedLearners.map(s => createBullet(s))
      ),
      createTwoColRow(
        "Inclusion Supports (Universal Design for Learning)",
        res.differentiation.inclusionSupports.map(s => createBullet(s))
      )
    ]
  }));

  // ----------------------------------------------------
  // 10. ASSESSMENT AND EVALUATION
  // ----------------------------------------------------
  elements.push(createSectionHeading("8. Assessment and Evaluation", 180));
  elements.push(new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      createTwoColRow("Formative Assessment", res.assessment.formative),
      createTwoColRow("Guided Practice Check", res.assessment.guidedPractice),
      createTwoColRow("Independent Practice Evaluation", res.assessment.independentPractice),
      createTwoColRow("Exit Ticket Prompt", res.assessment.exitTicket),
      createTwoColRow("Evaluation Criteria & Benchmark", res.assessment.evaluationCriteria)
    ]
  }));

  // Optional Rubric Table if present
  if (res.assessment.rubric && res.assessment.rubric.length > 0) {
    elements.push(createSubheading("Assessment Evaluation Rubric", 120));
    elements.push(new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          cantSplit: true,
          children: [
            createCell("Criteria", 25, { isHeader: true }),
            createCell("Exemplary (4)", 25, { isHeader: true }),
            createCell("Proficient (3)", 25, { isHeader: true }),
            createCell("Developing (2)", 25, { isHeader: true })
          ]
        }),
        ...res.assessment.rubric.map(r => new TableRow({
          cantSplit: true,
          children: [
            createCell(r.criteria, 25, { isLabel: true }),
            createCell(r.exemplary, 25),
            createCell(r.proficient, 25),
            createCell(r.developing, 25)
          ]
        }))
      ]
    }));
  }

  // ----------------------------------------------------
  // 11. CLOSURE AND SYNTHESIS
  // ----------------------------------------------------
  elements.push(createSectionHeading("9. Closure and Synthesis", 180));
  const closureParagraphs = res.closure && res.closure.length > 0
    ? res.closure.map(c => createBullet(c))
    : [createParagraph("Review core objectives and preview upcoming lesson.")];
  elements.push(new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      createTwoColRow("Lesson Debrief & Consolidation", closureParagraphs)
    ]
  }));

  // ----------------------------------------------------
  // 12. TEACHER'S REFLECTION & PLANNING NOTES
  // ----------------------------------------------------
  elements.push(createSectionHeading("10. Teacher's Reflection & Planning Notes", 180));
  elements.push(new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        cantSplit: true,
        children: [
          createCell("Reflection Focus", 32, { isHeader: true }),
          createCell("Pre-Lesson Anticipations & Responsive Notes", 68, { isHeader: true })
        ]
      }),
      createTwoColRow("What do I anticipate students may find difficult?", res.reflection.whatWorked, 32, 68),
      createTwoColRow("What evidence will I collect during the lesson?", res.reflection.challenges, 32, 68),
      createTwoColRow("Which students or groups require follow-up?", res.reflection.followUpStudents, 32, 68),
      createTwoColRow("What will I adjust if students struggle?", res.reflection.adjustments, 32, 68),
      createTwoColRow("Next Lesson Instructional Connection", res.reflection.nextSteps, 32, 68)
    ]
  }));

  return elements;
}

// ==========================================
// NORMALIZATION OF WEEKLY PLAN ITEMS
// ==========================================
export interface NormalizedWeeklyData {
  schoolName: string;
  teacherName: string;
  academicYear: string;
  grade: string;
  subject: string;
  topic: string;
  cycle: number | string;
  weekNumber: number | string;
  bigIdea?: string;
  days: {
    dayLabel: string;
    resolvedLesson: ResolvedLessonResources;
  }[];
}

export function normalizeWeeklyPlanForExport(
  rawPlan: any, 
  teacherNameOverride?: string, 
  schoolNameOverride?: string
): NormalizedWeeklyData {
  const schoolName = clean(schoolNameOverride || rawPlan.schoolName || OFFICIAL_SCHOOL_NAME);
  const teacherName = clean(teacherNameOverride || rawPlan.teacherName || rawPlan.studentTeacherName || rawPlan.createdBy || 'Hassan');
  const academicYear = clean(rawPlan.academicYear || rawPlan.week?.academicYear || '2026-2027');
  
  const weekObj = rawPlan.week || rawPlan;
  const grade = clean(weekObj.grade || rawPlan.grade_level || rawPlan.grade || 'Standard 4');
  const subject = clean(weekObj.subject || rawPlan.subject || 'Mathematics');
  const topic = clean(weekObj.topic || rawPlan.weekly_topic || rawPlan.topic || 'Weekly Instructional Unit');
  const cycle = weekObj.cycle || rawPlan.cycle || 1;
  const weekNumber = weekObj.weekNumber || rawPlan.week_number || rawPlan.weekNumber || 1;
  const bigIdea = clean(rawPlan.weekly_big_idea || weekObj.bigIdea || '', '');

  const days: { dayLabel: string; resolvedLesson: ResolvedLessonResources }[] = [];

  // Case 1: WeeklyLessonPlan with week.days
  if (weekObj.days && Array.isArray(weekObj.days) && !weekObj.days[0]?.strands) {
    weekObj.days.forEach((d: any, idx: number) => {
      const dayLabel = d.day || d.day_name || `Day ${idx + 1}`;
      const lessonPlanInput = d.lesson || d;
      const resolved = resolveCompleteLessonResources(lessonPlanInput, { schoolName, teacherName });
      days.push({ dayLabel, resolvedLesson: resolved });
    });
  } 
  // Case 2: Language Arts Weekly Plan with dailyPlans or days containing strands
  else if (rawPlan.dailyPlans || (Array.isArray(rawPlan.days) && rawPlan.days[0]?.strands)) {
    const laDailyList: any[] = rawPlan.dailyPlans || rawPlan.days || [];
    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    laDailyList.forEach((dp: any, idx: number) => {
      const dayLabel = dp.day_name || (typeof dp.day === 'number' ? (dayNames[dp.day - 1] || `Day ${dp.day}`) : (dp.day || `Day ${idx + 1}`));
      const strands: any[] = dp.strands || [];
      const strandTitles = strands.map(s => s.strand).filter(Boolean);
      const objectives = strands.map(s => s.objective).filter(Boolean);
      const activities = strands.flatMap(s => s.activities || []);
      const assessments = strands.map(s => s.assessment).filter(Boolean);
      const resources = strands.flatMap(s => s.resources || []);
      const diff = dp.differentiation || {};

      const syntheticLesson: any = {
        lessonTitle: `${dayLabel}: ${strandTitles.join(' + ') || topic}`,
        grade: grade as any,
        subject: 'Language Arts',
        cycle: Number(cycle) || 1,
        topic: rawPlan.theme || rawPlan.weeklyTheme || rawPlan.topic || topic,
        subtopic: strandTitles.join(' & ') || topic,
        learningOutcome: objectives.join(' | ') || (rawPlan.learningOutcomes && rawPlan.learningOutcomes[0]) || 'Demonstrate mastery of selected language arts strands.',
        objectives: objectives.length > 0 ? objectives : [`Develop proficiency in ${strandTitles.join(' and ')}`],
        introductoryActivity: activities[0] || 'Hook and active prior knowledge activation.',
        developmentalActivities: activities.length > 2 ? activities.slice(1, -1) : activities,
        culminatingActivity: activities[activities.length - 1] || 'Synthesize learning and share responses.',
        closure: ['Consolidate core understandings and conduct formative self-assessment.'],
        materials: [
          ...resources,
          ...(rawPlan.resourcePack?.readingPassage ? ['Mentor Reading Passage'] : []),
          ...(rawPlan.resourcePack?.vocabularyList || []),
          ...(rawPlan.resourcePack?.worksheetIdeas || [])
        ],
        differentiation: {
          support: diff.support || 'Guided reading frames, sentence stems, and teacher-led small group modeling.',
          onLevel: diff.onLevel || 'Collaborative paired application and structured text-dependent responses.',
          advanced: diff.advanced || 'Higher-order extension prompts, synthesis tasks, and peer mentorship.'
        },
        duration: '60 mins'
      };

      const resolved = resolveCompleteLessonResources(syntheticLesson as LessonPlan, { schoolName, teacherName });
      days.push({ dayLabel, resolvedLesson: resolved });
    });
  }
  // Case 3: WeeklyCurriculumPlan with daily_plans
  else if (rawPlan.daily_plans && Array.isArray(rawPlan.daily_plans)) {
    rawPlan.daily_plans.forEach((dp: any, idx: number) => {
      const dayLabel = dp.day_name || `Day ${dp.day || idx + 1}`;
      // Construct rich synthetic LessonPlan
      const syntheticLesson: any = {
        lessonTitle: dp.lesson_title || `${dayLabel} Lesson`,
        grade: grade as any,
        subject: subject as any,
        cycle: Number(cycle) || 1,
        topic: topic,
        subtopic: dp.subtopic || bigIdea || dp.lesson_title,
        learningOutcome: dp.specific_learning_outcome,
        previousKnowledge: dp.introductory_activity,
        materials: Array.isArray(dp.materials_needed) 
          ? dp.materials_needed 
          : [],
        keyVocabulary: dp.vocabulary_words || [],
        closure: [dp.closure_and_check_for_understanding || 'Summarize key points'],
        suggestedAssessment: dp.closure_and_check_for_understanding || rawPlan.suggested_assessment,
        duration: rawPlan.duration || '45 mins'
      };
      const resolved = resolveCompleteLessonResources(syntheticLesson as LessonPlan, { schoolName, teacherName });
      days.push({ dayLabel, resolvedLesson: resolved });
    });
  } 
  // Case 4: Days array directly on plan
  else if (rawPlan.days && Array.isArray(rawPlan.days)) {
    rawPlan.days.forEach((d: any, idx: number) => {
      const dayLabel = d.day || `Day ${idx + 1}`;
      const resolved = resolveCompleteLessonResources(d.lesson || d, { schoolName, teacherName });
      days.push({ dayLabel, resolvedLesson: resolved });
    });
  }

  // Fallback if empty days array
  if (days.length === 0) {
    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    dayNames.forEach(name => {
      const syntheticLesson: Partial<LessonPlan> = {
        lessonTitle: `${name} Lesson - ${topic}`,
        grade: grade as any,
        subject: subject as any,
        cycle: Number(cycle) || 1,
        topic: topic,
        subtopic: bigIdea || topic,
        duration: '45 mins'
      };
      const resolved = resolveCompleteLessonResources(syntheticLesson as LessonPlan, { schoolName, teacherName });
      days.push({ dayLabel: name, resolvedLesson: resolved });
    });
  }

  return {
    schoolName,
    teacherName,
    academicYear,
    grade,
    subject,
    topic,
    cycle,
    weekNumber,
    bigIdea: bigIdea.length > 0 ? bigIdea : undefined,
    days
  };
}

// ==========================================
// EXPORT TO WORD (.DOCX) IMPLEMENTATION
// ==========================================
export async function exportWeeklyPlanToDocxDocument(
  normalized: NormalizedWeeklyData,
  fileNamePrefix = 'Weekly_Lesson_Plan'
): Promise<void> {
  const children: (Paragraph | Table)[] = [];

  // ----------------------------------------------------
  // 1. FIRST PAGE OFFICIAL SCHOOL HEADER
  // ----------------------------------------------------
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 80, after: 30 },
      children: [
        new TextRun({
          text: normalized.schoolName,
          bold: true,
          size: 32, // 16pt
          color: PRIMARY_NAVY
        })
      ]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 40 },
      children: [
        new TextRun({
          text: "MINISTRY OF EDUCATION, CULTURE, SCIENCE & TECHNOLOGY — BELIZE",
          bold: true,
          size: 18, // 9pt
          color: TEXT_MUTED
        })
      ]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 60 },
      children: [
        new TextRun({
          text: "WEEKLY LESSON PLAN",
          bold: true,
          size: 34, // 17pt
          color: PRIMARY_NAVY
        })
      ]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 160 },
      children: [
        new TextRun({
          text: `Unit / Weekly Topic: ${normalized.topic}`,
          bold: true,
          italics: true,
          size: 24, // 12pt
          color: TEXT_MAIN
        })
      ]
    })
  );

  // ----------------------------------------------------
  // 2. ADMINISTRATIVE OVERVIEW TABLE
  // ----------------------------------------------------
  children.push(
    createSectionHeading("Administrative Overview", 100),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        createFourColDetailsRow("Academic Year", normalized.academicYear, "Teacher", normalized.teacherName),
        createFourColDetailsRow("Class / Grade", normalized.grade, "Subject", normalized.subject),
        createFourColDetailsRow("Instructional Cycle", `Cycle ${normalized.cycle}`, "Instructional Week", `Week ${normalized.weekNumber}`),
        createFourColDetailsRow("Curriculum Framework", "Belize BNCF", "Unit Focus", normalized.topic)
      ]
    })
  );

  // Optional Big Idea Box
  if (normalized.bigIdea) {
    children.push(
      createSubheading("Weekly Big Idea & Conceptual Focus", 120),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          createTwoColRow("Big Idea / Overarching Understanding", normalized.bigIdea, 25, 75)
        ]
      })
    );
  }

  // ----------------------------------------------------
  // 3. DAILY LESSONS (MONDAY TO FRIDAY)
  // ----------------------------------------------------
  normalized.days.forEach((day, idx) => {
    const isFirstDay = idx === 0;
    const dailyElements = buildDailyLessonDocxElements(day.dayLabel, day.resolvedLesson, isFirstDay);
    children.push(...dailyElements);
  });

  // ----------------------------------------------------
  // 4. DOCUMENT ASSEMBLY WITH HEADERS, FOOTERS & MARGINS
  // ----------------------------------------------------
  const doc = new Document({
    sections: [{
      properties: {
        page: {
          margin: { top: 1080, bottom: 1080, left: 1080, right: 1080 } // 0.75 in
        }
      },
      headers: {
        default: new Header({
          children: [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              spacing: { before: 0, after: 60 },
              children: [
                new TextRun({
                  text: `${normalized.schoolName}  |  WEEKLY LESSON PLAN  |  ${normalized.grade} ${normalized.subject}`,
                  size: 16,
                  color: TEXT_MUTED
                })
              ]
            })
          ]
        })
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { before: 60, after: 0 },
              children: [
                new TextRun({ text: "Page ", size: 18, color: TEXT_MUTED }),
                new TextRun({ children: [PageNumber.CURRENT], size: 18, color: TEXT_MUTED }),
                new TextRun({ text: " of ", size: 18, color: TEXT_MUTED }),
                new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 18, color: TEXT_MUTED })
              ]
            })
          ]
        })
      },
      children
    }]
  });

  const sanitizedTopic = normalized.topic.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 30);
  const fileName = `${fileNamePrefix}_${sanitizedTopic}`;

  // Download blob directly
  const { Packer } = await import('docx');
  const blob = await Packer.toBlob(doc);
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${fileName}.docx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}
