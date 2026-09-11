import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  AlignmentType,
  HeadingLevel,
  PageNumber,
  Footer,
  Header
} from 'docx';
import { 
  LessonPlan, 
  SavedLesson, 
  LessonResourceNew, 
  LanguageArtsWeeklyPlan, 
  WeeklyCurriculumPlan, 
  DailyLessonPlan, 
  WeeklyLessonPlan 
} from '../types';
import { normalizeLearningObjectives, validateLearningObjectives } from './learningObjectivesHelper';

// ==========================================
// COLOR PALETTE & DESIGN CONSTANTS
// ==========================================
const PRIMARY_NAVY = '1E3A8A';   // Deep Academic Navy
const TEXT_MAIN = '1E293B';      // Slate 800
const TEXT_MUTED = '475569';     // Slate 600
const BORDER_COLOR = 'CBD5E1';   // Slate 300
const HEADER_BG = 'F1F5F9';      // Slate 100
const LABEL_BG = 'F8FAFC';       // Slate 50
const SUCCESS_COLOR = '047857';  // Emerald 700

const thinBorder = { style: BorderStyle.SINGLE, size: 4, color: BORDER_COLOR };
const cellBorders = { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder };
const cellMargins = { top: 90, bottom: 90, left: 130, right: 130 };

// ==========================================
// ROBUST TEXT CLEANUP & QUALITY CONTROL
// ==========================================
export function cleanText(text: any): string {
  if (text === null || text === undefined) return '';
  let str = Array.isArray(text) ? text.join(' ') : String(text);

  // Strip Markdown links [text](url) -> text
  str = str.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

  // Strip Markdown bold and italics syntax
  str = str.replace(/\*\*(.*?)\*\*/g, '$1');
  str = str.replace(/\*(.*?)\*/g, '$1');
  str = str.replace(/_{2,}(.*?)_{2,}/g, '$1');
  str = str.replace(/_([^_]+)_/g, '$1');

  // Strip heading marks (#, ##, ###)
  str = str.replace(/#{1,6}\s*/g, '');

  // Strip code blocks and backticks
  str = str.replace(/`{1,3}[^`]*`{1,3}/g, '');
  str = str.replace(/`+/g, '');

  // Strip markdown horizontal rules and separators
  str = str.replace(/^-{3,}$/gm, '');
  str = str.replace(/^={3,}$/gm, '');
  str = str.replace(/^[_\s-]{3,}$/gm, '');

  // Strip markdown table pipes
  str = str.replace(/^\|\s*|\s*\|$/gm, '');
  str = str.replace(/\|\s*[-:]+[-| :]*\|/g, '');

  // Strip leading bullet markers if attached to the line
  str = str.replace(/^[-•*]\s+/gm, '');

  // Strip raw HTML tags if any were generated
  str = str.replace(/<[^>]*>?/gm, '');

  // Normalize newlines
  str = str.replace(/\r\n/g, '\n');

  // Automatic grammar cleanup for common primary school curriculum phrasing
  str = str.replace(/\b([Gg]iven|[Ww]ith|[Uu]sing|[Aa]s|[Ff]or|[Ii]n)\s+[Aa]\s+(extended|integer|angle|hour|eight|eleven|example|open|informal|accurate|easy|interactive|array|area|equivalent|individual|explicit|estimate|effective|equation|operation|odd)\b/gi, (_match, p1, p2) => `${p1} an ${p2}`);
  str = str.replace(/\b[Aa]\s+(extended|integer|angle|hour|eight|eleven|example|open|informal|accurate|easy|interactive|array|area|equivalent|individual|explicit|estimate|effective|equation|operation|odd)\b/gi, 'an $1');

  str = str.trim();

  // Replace placeholder hyphens or n/a with 'Not provided'
  if (str === '-' || str === '--' || str === '---' || str === 'N/A' || str === 'n/a' || str === '') {
    return 'Not provided';
  }

  return str;
}

export function toCleanBullets(text: any): string[] {
  if (!text) return [];
  if (Array.isArray(text)) {
    return text.flatMap(t => toCleanBullets(t));
  }
  const content = String(text);
  return content
    .split(/\n+|(?<=[.!?])\s+(?=[A-Z0-9])/)
    .map(line => cleanText(line))
    .filter(line => line.length > 0 && line !== 'Not provided');
}

// ==========================================
// DOCX BUILDER HELPERS
// ==========================================
function createSectionHeading(title: string, spacingBefore = 240): Paragraph {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: spacingBefore, after: 80 },
    keepNext: true,
    children: [
      new TextRun({
        text: title.toUpperCase(),
        bold: true,
        size: 26, // 13pt
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
        size: 23, // 11.5pt
        color: TEXT_MAIN
      })
    ]
  });
}

function createParagraph(text: string, options?: { italic?: boolean; bold?: boolean; spacingAfter?: number }): Paragraph {
  return new Paragraph({
    spacing: { before: 40, after: options?.spacingAfter ?? 80, line: 276 },
    children: [
      new TextRun({
        text: cleanText(text),
        size: 22, // 11pt
        color: TEXT_MAIN,
        italics: options?.italic,
        bold: options?.bold
      })
    ]
  });
}

function createBullet(text: string): Paragraph {
  return new Paragraph({
    bullet: { level: 0 },
    spacing: { before: 30, after: 30, line: 276 },
    children: [
      new TextRun({
        text: cleanText(text),
        size: 22, // 11pt
        color: TEXT_MAIN
      })
    ]
  });
}

function createChecklistItem(text: string): Paragraph {
  return new Paragraph({
    spacing: { before: 40, after: 40, line: 276 },
    children: [
      new TextRun({
        text: '☐  ',
        bold: true,
        size: 24,
        color: SUCCESS_COLOR
      }),
      new TextRun({
        text: cleanText(text),
        size: 22,
        color: TEXT_MAIN
      })
    ]
  });
}

function createCell(
  content: string | Paragraph | Paragraph[],
  widthPercent: number,
  options?: { isHeader?: boolean; isLabel?: boolean; minHeight?: number }
): TableCell {
  let children: Paragraph[] = [];
  if (typeof content === 'string') {
    children = [
      new Paragraph({
        spacing: { before: 30, after: 30, line: 260 },
        children: [
          new TextRun({
            text: cleanText(content),
            bold: options?.isHeader || options?.isLabel,
            size: options?.isHeader ? 21 : 20, // 10.5pt or 10pt
            color: options?.isHeader || options?.isLabel ? PRIMARY_NAVY : TEXT_MAIN
          })
        ]
      })
    ];
  } else if (Array.isArray(content)) {
    children = content.length > 0 ? content : [new Paragraph({ children: [new TextRun({ text: '', size: 20 })] })];
  } else {
    children = [content];
  }

  return new TableCell({
    width: { size: widthPercent, type: WidthType.PERCENTAGE },
    borders: cellBorders,
    margins: cellMargins,
    shading: options?.isHeader ? { fill: HEADER_BG } : options?.isLabel ? { fill: LABEL_BG } : undefined,
    children
  });
}

// Download helper for native .docx
export async function downloadDocx(doc: Document, fileName: string): Promise<void> {
  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${cleanText(fileName).replace(/[\s/\\?%*:|"<>]+/g, '_')}.docx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ==========================================
// 1. PRIMARY LESSON PLAN EXPORT TO WORD (.DOCX)
// ==========================================
export async function exportToWord(plan: LessonPlan, teacherName?: string): Promise<void> {
  const teacher = teacherName || plan.studentTeacherName || "Not provided";
  const today = new Date();
  const dateStr = plan.date || `${today.getDate()}th ${today.toLocaleString('default', { month: 'long' })} ${today.getFullYear()}`;

  // Validate and normalize Learning Objectives to guarantee one shared condition across all 3 domains
  const normObjectives = normalizeLearningObjectives(plan, {
    topic: plan.topic,
    materials: plan.materialsBoard?.map(m => m.name) || plan.materials
  });
  const conditionObj = cleanText(normObjectives.condition);
  const cognitiveObj = cleanText(normObjectives.cognitive);
  const psychomotorObj = cleanText(normObjectives.psychomotor);
  const affectiveObj = cleanText(normObjectives.affective);

  // Success Criteria
  const scItems = plan.learningObjectivesBoard?.successCriteria && plan.learningObjectivesBoard.successCriteria.length > 0
    ? plan.learningObjectivesBoard.successCriteria.map(sc => cleanText(sc.startsWith('I can') ? sc : `I can ${sc}`))
    : [
        `I can accurately define and identify key concepts related to ${cleanText(plan.topic)}.`,
        "I can apply standard procedural methods to solve representative problems.",
        "I can justify my reasoning clearly to a partner or teacher using academic vocabulary."
      ];

  // Key Vocabulary terms
  const vocabRaw = plan.vocabularyFocus?.keyVocabulary?.map(v => v.term) ||
    plan.keyVocabulary ||
    plan.structured_json?.vocabulary ||
    [plan.topic, plan.subtopic, "Key concept", "Application", "Procedure"].filter(Boolean);
  const vocabList = Array.isArray(vocabRaw)
    ? vocabRaw.map(cleanText).filter(v => v.length > 0 && v !== 'Not provided')
    : [cleanText(plan.topic)];

  // Lesson snapshot & overview
  const lessonDesc = cleanText(
    plan.lessonSnapshot?.about || 
    plan.lessonSnapshot?.learning || 
    plan.content?.slice(0, 350) || 
    `A comprehensive primary-level lesson designed to build conceptual clarity, procedural competence, and practical application in ${plan.topic}.`
  );
  const priorKnowledge = cleanText(
    plan.priorKnowledgeActivation?.whatTheyKnow || 
    plan.previousKnowledge || 
    "Students have previously explored foundational prerequisites and related grade-level standards in preceding units."
  );

  // Lesson Procedure Stages
  const introTeacher = toCleanBullets(plan.introduction || plan.executionBoard?.[0]?.teacherActions || "Introduce lesson hook, activate prior knowledge, and state clear learning goals.");
  const introStudent = toCleanBullets(plan.executionBoard?.[0]?.studentActions || "Respond to inquiry prompt, share prior experiences, and write down lesson objective.");
  const introCheck = cleanText(plan.executionBoard?.[0]?.checkForUnderstanding || plan.executionBoard?.[0]?.assessmentOpportunity || "Diagnostic questioning check");

  const explicitTeacher = toCleanBullets(plan.development || plan.executionBoard?.[1]?.teacherActions || "Model target concept explicitly, demonstrate worked examples on board, and emphasize academic vocabulary.");
  const explicitStudent = toCleanBullets(plan.executionBoard?.[1]?.studentActions || "Observe demonstration, record guided notes in workbook, and ask clarifying questions.");
  const explicitCheck = cleanText(plan.executionBoard?.[1]?.checkForUnderstanding || plan.executionBoard?.[1]?.assessmentOpportunity || "Check for understanding via thumbs-up/down or whiteboards");

  const guidedTeacher = toCleanBullets(plan.guidedPractice || plan.executionBoard?.[2]?.teacherActions || "Circulate classroom, scaffold paired practice, and provide immediate targeted feedback.");
  const guidedStudent = toCleanBullets(plan.executionBoard?.[2]?.studentActions || "Collaborate with assigned partner to complete practice tasks and articulate problem-solving steps.");
  const guidedCheck = cleanText(plan.executionBoard?.[2]?.checkForUnderstanding || plan.executionBoard?.[2]?.assessmentOpportunity || "Active circulation and oral checks");

  const indepTeacher = toCleanBullets(plan.independentPractice || plan.executionBoard?.[3]?.teacherActions || "Observe individual students, record formative notes, and provide tiered assistance where needed.");
  const indepStudent = toCleanBullets(plan.independentPractice || plan.executionBoard?.[3]?.studentActions || "Complete assigned individual practice worksheet or workbook problems independently.");
  const indepCheck = cleanText(plan.executionBoard?.[3]?.checkForUnderstanding || plan.executionBoard?.[3]?.assessmentOpportunity || "Review of independent student work");

  const closureTeacher = toCleanBullets(plan.closurePanel?.recap || plan.closure || plan.executionBoard?.[4]?.teacherActions || "Facilitate whole-class synthesis, review success criteria, and administer exit slip.");
  const closureStudent = toCleanBullets(plan.closurePanel?.demonstration || plan.executionBoard?.[4]?.studentActions || "Complete individual exit ticket and reflect on achievement of success criteria.");
  const closureCheck = cleanText(plan.closurePanel?.exitQuestion || "Formative exit ticket evaluation");

  // Questions
  const qList: string[] = (
    plan.structured_json?.questions || 
    (plan.executionBoard?.flatMap((b: any) => b.questions || b.questionsToAsk || []) as string[]) || 
    []
  ).map(cleanText).filter(q => q.length > 0 && q !== 'Not provided');

  // Materials rows
  const materialsData: { name: string; purpose: string; usedIn: string }[] = [];
  if (plan.materialsBoard && plan.materialsBoard.length > 0) {
    plan.materialsBoard.forEach(m => {
      materialsData.push({
        name: cleanText(m.name),
        purpose: cleanText(m.purpose || "Instructional support and practice"),
        usedIn: cleanText(m.lessonPhase || "Classroom Instruction")
      });
    });
  } else if (plan.materials && plan.materials.length > 0) {
    plan.materials.forEach(m => {
      materialsData.push({
        name: cleanText(m),
        purpose: "Instructional modeling and student practice",
        usedIn: "Whole Class & Small Group"
      });
    });
  } else {
    materialsData.push(
      { name: "Core Textbooks & Student Workbooks", purpose: "Structured exercises and guided reference", usedIn: "Guided & Independent Practice" },
      { name: "Visual Anchor Charts & Manipulatives", purpose: "Concrete conceptual modeling", usedIn: "Explicit Teaching" },
      { name: "Practice Worksheets & Exit Slips", purpose: "Formative evaluation and mastery check", usedIn: "Independent Practice & Closure" }
    );
  }

  // Question levels
  const questionsTableRows = [
    { level: "Remember / Identify", q: qList[0] || `What is the core term or rule we used today in our study of ${cleanText(plan.topic)}?` },
    { level: "Understand", q: qList[1] || `How would you explain this concept in your own words to a classmate?` },
    { level: "Apply", q: qList[2] || `How can we apply this method to solve a new problem accurately?` },
    { level: "Analyze", q: qList[3] || `What patterns, relationships, or differences do you notice in these examples?` },
    { level: "Evaluate / Create", q: qList[4] || `Can you justify your solution or formulate a challenging problem for your peers?` }
  ];

  // Document Construction
  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: 'Calibri',
            size: 22, // 11pt
            color: TEXT_MAIN
          },
          paragraph: {
            spacing: { line: 276, before: 60, after: 60 }
          }
        }
      }
    },
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
              spacing: { after: 120 },
              children: [
                new TextRun({
                  text: "LESSONCRAFT PROFESSIONAL LESSON PLAN",
                  size: 16,
                  color: TEXT_MUTED,
                  bold: true
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
              alignment: AlignmentType.RIGHT,
              children: [
                new TextRun({
                  text: `${cleanText(plan.grade || 'Primary')} | ${cleanText(plan.subject || 'Curriculum')} | Page `,
                  size: 18,
                  color: TEXT_MUTED
                }),
                new TextRun({
                  children: [PageNumber.CURRENT],
                  size: 18,
                  color: TEXT_MUTED
                }),
                new TextRun({ text: " of ", size: 18, color: TEXT_MUTED }),
                new TextRun({
                  children: [PageNumber.TOTAL_PAGES],
                  size: 18,
                  color: TEXT_MUTED
                })
              ]
            })
          ]
        })
      },
      children: [
        // ----------------------------------------------------
        // SECTION 4: MAIN TITLE (Centered)
        // ----------------------------------------------------
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 40, after: 40 },
          children: [
            new TextRun({
              text: "LESSON PLAN",
              bold: true,
              size: 38, // 19pt
              color: PRIMARY_NAVY
            })
          ]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 0, after: 160 },
          children: [
            new TextRun({
              text: cleanText(plan.lessonTitle || plan.topic),
              bold: true,
              size: 26, // 13pt
              color: TEXT_MUTED
            }),
            ...(plan.subtopic && plan.subtopic !== 'Not provided' ? [
              new TextRun({
                text: ` — ${cleanText(plan.subtopic)}`,
                italics: true,
                size: 22,
                color: TEXT_MUTED
              })
            ] : [])
          ]
        }),

        // ----------------------------------------------------
        // SECTION 3: PROFESSIONAL HEADER TABLE
        // ----------------------------------------------------
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                createCell("School", 20, { isLabel: true }),
                createCell("St. Jude Roman Catholic Primary School", 30),
                createCell("Teacher", 20, { isLabel: true }),
                createCell(teacher, 30)
              ]
            }),
            new TableRow({
              children: [
                createCell("Grade / Class", 20, { isLabel: true }),
                createCell(cleanText(plan.grade || 'Standard 4'), 30),
                createCell("Subject", 20, { isLabel: true }),
                createCell(cleanText(plan.subject || 'Mathematics'), 30)
              ]
            }),
            new TableRow({
              children: [
                createCell("Date", 20, { isLabel: true }),
                createCell(dateStr, 30),
                createCell("Duration", 20, { isLabel: true }),
                createCell(cleanText(plan.duration || '60 Minutes'), 30)
              ]
            }),
            new TableRow({
              children: [
                createCell("Topic", 20, { isLabel: true }),
                createCell(cleanText(plan.topic || 'Not provided'), 30),
                createCell("Subtopic", 20, { isLabel: true }),
                createCell(cleanText(plan.subtopic || 'Not provided'), 30)
              ]
            })
          ]
        }),

        // ----------------------------------------------------
        // SECTION 5: CURRICULUM ALIGNMENT TABLE
        // ----------------------------------------------------
        createSectionHeading("Curriculum Alignment", 260),
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                createCell("Curriculum Element", 32, { isHeader: true }),
                createCell("Details", 68, { isHeader: true })
              ]
            }),
            new TableRow({
              children: [
                createCell("Curriculum / Framework", 32, { isLabel: true }),
                createCell("Belize National Primary School Curriculum Framework", 68)
              ]
            }),
            new TableRow({
              children: [
                createCell("Cycle", 32, { isLabel: true }),
                createCell(`Cycle ${plan.cycle || 1}`, 68)
              ]
            }),
            new TableRow({
              children: [
                createCell("Strand", 32, { isLabel: true }),
                createCell(cleanText(plan.strand || 'General Strand'), 68)
              ]
            }),
            new TableRow({
              children: [
                createCell("Topic", 32, { isLabel: true }),
                createCell(cleanText(plan.topic || 'Not provided'), 68)
              ]
            }),
            new TableRow({
              children: [
                createCell("Subtopic", 32, { isLabel: true }),
                createCell(cleanText(plan.subtopic || 'Not provided'), 68)
              ]
            }),
            new TableRow({
              children: [
                createCell("Curriculum Outcome", 32, { isLabel: true }),
                createCell(cleanText(plan.learningOutcome || 'Demonstrate understanding and application of grade-level curriculum outcomes.'), 68)
              ]
            }),
            new TableRow({
              children: [
                createCell("Competency / Standard", 32, { isLabel: true }),
                createCell(toCleanBullets(plan.structured_json?.competencies).join('; ') || 'Apply foundational competencies in communication, inquiry, problem solving, and mathematical reasoning.', 68)
              ]
            }),
            new TableRow({
              children: [
                createCell("Curriculum Code", 32, { isLabel: true }),
                createCell(cleanText(plan.structured_json?.curriculumCode || 'Not provided'), 68)
              ]
            })
          ]
        }),

        // ----------------------------------------------------
        // SECTION 6: LESSON OVERVIEW
        // ----------------------------------------------------
        createSectionHeading("Lesson Overview", 240),
        createSubheading("Lesson Title"),
        createParagraph(cleanText(plan.lessonTitle || plan.topic)),

        createSubheading("Lesson Description"),
        createParagraph(lessonDesc),

        createSubheading("Prior Knowledge"),
        createParagraph(priorKnowledge),

        createSubheading("Key Vocabulary"),
        createParagraph(vocabList.join(', ')),

        // ----------------------------------------------------
        // SECTION 7: LEARNING OBJECTIVES
        // ----------------------------------------------------
        createSectionHeading("Learning Objectives", 240),
        createSubheading("Condition"),
        createParagraph(conditionObj),

        createSubheading("Cognitive Domain"),
        createBullet(cognitiveObj),

        createSubheading("Psychomotor / Skills Domain"),
        createBullet(psychomotorObj),

        createSubheading("Affective Domain"),
        createBullet(affectiveObj),

        // ----------------------------------------------------
        // SECTION 8: SUCCESS CRITERIA
        // ----------------------------------------------------
        createSectionHeading("Success Criteria", 240),
        ...scItems.map(createChecklistItem),

        // ----------------------------------------------------
        // SECTION 9: MATERIALS AND RESOURCES
        // ----------------------------------------------------
        createSectionHeading("Materials and Resources", 240),
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                createCell("Materials / Resources", 35, { isHeader: true }),
                createCell("Purpose", 45, { isHeader: true }),
                createCell("Used In", 20, { isHeader: true })
              ]
            }),
            ...materialsData.map(item => new TableRow({
              children: [
                createCell(item.name, 35, { isLabel: true }),
                createCell(item.purpose, 45),
                createCell(item.usedIn, 20)
              ]
            }))
          ]
        }),

        // ----------------------------------------------------
        // SECTION 10: LESSON PROCEDURE TABLE
        // ----------------------------------------------------
        createSectionHeading("Lesson Procedure", 260),
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                createCell("Stage", 18, { isHeader: true }),
                createCell("Time", 10, { isHeader: true }),
                createCell("Teacher Activities", 28, { isHeader: true }),
                createCell("Student Activities", 28, { isHeader: true }),
                createCell("Assessment / Check", 16, { isHeader: true })
              ]
            }),
            new TableRow({
              children: [
                createCell("1. Introduction / Warm-Up", 18, { isLabel: true }),
                createCell("10 min", 10),
                createCell(introTeacher.map(b => new Paragraph({ children: [new TextRun({ text: `• ${b}`, size: 19 })], spacing: { before: 20, after: 20 } })), 28),
                createCell(introStudent.map(b => new Paragraph({ children: [new TextRun({ text: `• ${b}`, size: 19 })], spacing: { before: 20, after: 20 } })), 28),
                createCell(introCheck, 16)
              ]
            }),
            new TableRow({
              children: [
                createCell("2. Explicit Teaching", 18, { isLabel: true }),
                createCell("15 min", 10),
                createCell(explicitTeacher.map(b => new Paragraph({ children: [new TextRun({ text: `• ${b}`, size: 19 })], spacing: { before: 20, after: 20 } })), 28),
                createCell(explicitStudent.map(b => new Paragraph({ children: [new TextRun({ text: `• ${b}`, size: 19 })], spacing: { before: 20, after: 20 } })), 28),
                createCell(explicitCheck, 16)
              ]
            }),
            new TableRow({
              children: [
                createCell("3. Guided Practice", 18, { isLabel: true }),
                createCell("15 min", 10),
                createCell(guidedTeacher.map(b => new Paragraph({ children: [new TextRun({ text: `• ${b}`, size: 19 })], spacing: { before: 20, after: 20 } })), 28),
                createCell(guidedStudent.map(b => new Paragraph({ children: [new TextRun({ text: `• ${b}`, size: 19 })], spacing: { before: 20, after: 20 } })), 28),
                createCell(guidedCheck, 16)
              ]
            }),
            new TableRow({
              children: [
                createCell("4. Independent Practice", 18, { isLabel: true }),
                createCell("15 min", 10),
                createCell(indepTeacher.map(b => new Paragraph({ children: [new TextRun({ text: `• ${b}`, size: 19 })], spacing: { before: 20, after: 20 } })), 28),
                createCell(indepStudent.map(b => new Paragraph({ children: [new TextRun({ text: `• ${b}`, size: 19 })], spacing: { before: 20, after: 20 } })), 28),
                createCell(indepCheck, 16)
              ]
            }),
            new TableRow({
              children: [
                createCell("5. Closure", 18, { isLabel: true }),
                createCell("5 min", 10),
                createCell(closureTeacher.map(b => new Paragraph({ children: [new TextRun({ text: `• ${b}`, size: 19 })], spacing: { before: 20, after: 20 } })), 28),
                createCell(closureStudent.map(b => new Paragraph({ children: [new TextRun({ text: `• ${b}`, size: 19 })], spacing: { before: 20, after: 20 } })), 28),
                createCell(closureCheck, 16)
              ]
            })
          ]
        }),

        // ----------------------------------------------------
        // SECTION 11: TEACHER AND STUDENT ACTIONS TABLE
        // ----------------------------------------------------
        createSectionHeading("Teacher and Student Actions", 240),
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                createCell("Teacher Actions", 50, { isHeader: true }),
                createCell("Student Actions", 50, { isHeader: true })
              ]
            }),
            new TableRow({
              children: [
                createCell([
                  new Paragraph({ children: [new TextRun({ text: "• Models problem-solving protocols and explicit strategies clearly.", size: 20 })], spacing: { before: 20, after: 20 } }),
                  new Paragraph({ children: [new TextRun({ text: "• Asks scaffolded questions and guides mathematical discourse.", size: 20 })], spacing: { before: 20, after: 20 } }),
                  new Paragraph({ children: [new TextRun({ text: "• Circulates room to monitor accuracy and clear misconceptions.", size: 20 })], spacing: { before: 20, after: 20 } })
                ], 50),
                createCell([
                  new Paragraph({ children: [new TextRun({ text: "• Listens actively, records worked examples, and articulates thinking.", size: 20 })], spacing: { before: 20, after: 20 } }),
                  new Paragraph({ children: [new TextRun({ text: "• Collaborates actively in pairs to solve assigned challenge prompts.", size: 20 })], spacing: { before: 20, after: 20 } }),
                  new Paragraph({ children: [new TextRun({ text: "• Demonstrates independent mastery on individual practice tasks.", size: 20 })], spacing: { before: 20, after: 20 } })
                ], 50)
              ]
            })
          ]
        }),

        // ----------------------------------------------------
        // SECTION 12: QUESTIONING STRATEGIES TABLE
        // ----------------------------------------------------
        createSectionHeading("Questioning Strategies", 240),
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                createCell("Cognitive Level", 26, { isHeader: true }),
                createCell("Targeted Question", 74, { isHeader: true })
              ]
            }),
            ...questionsTableRows.map(row => new TableRow({
              children: [
                createCell(row.level, 26, { isLabel: true }),
                createCell(row.q, 74)
              ]
            }))
          ]
        }),

        // ----------------------------------------------------
        // SECTION 13: DIFFERENTIATION
        // ----------------------------------------------------
        createSectionHeading("Differentiation", 240),
        createSubheading("Students Requiring Additional Support"),
        ...toCleanBullets(
          plan.differentiationFramework?.strugglingLearners?.scaffolds || 
          plan.differentiation || 
          "Provide concrete manipulatives, visual place-value charts, simplified step-by-step instructions, and guided teacher assistance during initial practice."
        ).map(createBullet),

        createSubheading("On-Level Learners"),
        ...toCleanBullets(
          plan.differentiationFramework?.onLevelLearners?.independentWorkExpectations || 
          "Complete standard practice tasks with focus on computational accuracy, written explanation of reasoning, and partner collaboration."
        ).map(createBullet),

        createSubheading("Advanced / Extension Learners"),
        ...toCleanBullets(
          plan.differentiationFramework?.advancedLearners?.challengeTasks || 
          plan.differentiationFramework?.advancedLearners?.extensionActivity || 
          plan.homeworkExtension?.task || 
          "Solve non-standard extension problems, identify real-world mathematical applications, and support peers as instructional leaders."
        ).map(createBullet),

        createSubheading("Inclusion Supports"),
        ...toCleanBullets(
          plan.structured_json?.inclusion || 
          "Ensure high-contrast visual displays, preferential seating, peer buddy pairings, and extended response time where appropriate."
        ).map(createBullet),

        // ----------------------------------------------------
        // SECTION 14: ASSESSMENT AND EVALUATION TABLE
        // ----------------------------------------------------
        createSectionHeading("Assessment and Evaluation", 240),
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                createCell("Assessment Type", 30, { isHeader: true }),
                createCell("Method / Evidence", 70, { isHeader: true })
              ]
            }),
            new TableRow({
              children: [
                createCell("Formative Assessment", 30, { isLabel: true }),
                createCell("Continuous teacher observation, oral response checks, and diagnostic questioning during warm-up.", 70)
              ]
            }),
            new TableRow({
              children: [
                createCell("Guided Practice", 30, { isLabel: true }),
                createCell("Active monitoring of paired collaboration, immediate feedback, and white-board checks.", 70)
              ]
            }),
            new TableRow({
              children: [
                createCell("Independent Practice", 30, { isLabel: true }),
                createCell("Evaluation of individual student worksheet tasks and procedural accuracy.", 70)
              ]
            }),
            new TableRow({
              children: [
                createCell("Exit Ticket", 30, { isLabel: true }),
                createCell(cleanText(plan.closurePanel?.exitQuestion || (plan.closure && plan.closure[0]) || `Demonstrate mastery of ${cleanText(plan.topic)} through a targeted single-question exit slip.`), 70)
              ]
            }),
            new TableRow({
              children: [
                createCell("Evaluation Criteria", 30, { isLabel: true }),
                createCell("Students achieve 80% or greater accuracy on core practice tasks and explain procedural rationale clearly.", 70)
              ]
            })
          ]
        }),

        // ----------------------------------------------------
        // SECTION 15: CLOSURE
        // ----------------------------------------------------
        createSectionHeading("Closure", 240),
        ...toCleanBullets(
          plan.closurePanel?.recap || 
          plan.closure || 
          `Summarize the key mathematical concepts mastered in today's lesson on ${cleanText(plan.topic)}. Check individual student understanding against success criteria and connect concepts to the upcoming topic.`
        ).map(createBullet),

        // ----------------------------------------------------
        // SECTION 16: TEACHER REFLECTION (Bordered writing spaces)
        // ----------------------------------------------------
        createSectionHeading("Teacher Reflection", 240),
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                createCell("Reflection Focus", 32, { isHeader: true }),
                createCell("Post-Lesson Notes & Adjustments", 68, { isHeader: true })
              ]
            }),
            new TableRow({
              children: [
                createCell("What went well?", 32, { isLabel: true }),
                createCell(new Paragraph({ children: [new TextRun({ text: " ", size: 36 })], spacing: { before: 80, after: 80 } }), 68)
              ]
            }),
            new TableRow({
              children: [
                createCell("What challenges occurred?", 32, { isLabel: true }),
                createCell(new Paragraph({ children: [new TextRun({ text: " ", size: 36 })], spacing: { before: 80, after: 80 } }), 68)
              ]
            }),
            new TableRow({
              children: [
                createCell("Which students require follow-up?", 32, { isLabel: true }),
                createCell(new Paragraph({ children: [new TextRun({ text: " ", size: 36 })], spacing: { before: 80, after: 80 } }), 68)
              ]
            }),
            new TableRow({
              children: [
                createCell("What should be adjusted for next lesson?", 32, { isLabel: true }),
                createCell(new Paragraph({ children: [new TextRun({ text: " ", size: 36 })], spacing: { before: 80, after: 80 } }), 68)
              ]
            }),
            new TableRow({
              children: [
                createCell("Next Steps", 32, { isLabel: true }),
                createCell(new Paragraph({ children: [new TextRun({ text: " ", size: 36 })], spacing: { before: 80, after: 80 } }), 68)
              ]
            })
          ]
        }),

        // ----------------------------------------------------
        // SECTION 17: LESSON RESOURCES
        // ----------------------------------------------------
        createSectionHeading("Lesson Resources", 240),
        createBullet("Printable Student Practice Worksheet & Extension Tasks"),
        createBullet("Curriculum Anchor Charts & Conceptual Visual Aids"),
        createBullet("Formative Exit Tickets & Student Self-Assessment Rubrics"),
        createBullet("Concrete Classroom Manipulatives & Graphic Organizers")
      ]
    }]
  });

  await downloadDocx(doc, `${cleanText(plan.lessonTitle || plan.topic)}_Lesson_Plan`);
}

// ==========================================
// 2. SAVED LESSON & COMPLETE RESOURCE PACK EXPORT (.DOCX)
// ==========================================
export async function exportSavedLessonToWord(lesson: SavedLesson, resources: LessonResourceNew[]): Promise<void> {
  const children: (Paragraph | Table)[] = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 40, after: 40 },
      children: [
        new TextRun({
          text: cleanText(lesson.title),
          bold: true,
          size: 36,
          color: PRIMARY_NAVY
        })
      ]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 160 },
      children: [
        new TextRun({
          text: "COMPLETE TEACHING & RESOURCE PACK",
          bold: true,
          size: 22,
          color: TEXT_MUTED
        })
      ]
    }),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            createCell("Subject", 25, { isLabel: true }),
            createCell(cleanText(lesson.subject), 25),
            createCell("Grade / Class", 25, { isLabel: true }),
            createCell(cleanText(lesson.class_id), 25)
          ]
        }),
        new TableRow({
          children: [
            createCell("Topic", 25, { isLabel: true }),
            createCell(cleanText(lesson.topic), 25),
            createCell("Duration", 25, { isLabel: true }),
            createCell(cleanText(lesson.duration), 25)
          ]
        })
      ]
    })
  ];

  const sortedResources = [...resources].sort((a, b) => a.resource_type.localeCompare(b.resource_type));
  sortedResources.forEach(res => {
    children.push(createSectionHeading(res.title || res.resource_type, 260));
    if (typeof res.content === 'string') {
      const cleanParas = res.content.split('\n').map(cleanText).filter(Boolean);
      cleanParas.forEach(p => children.push(createParagraph(p)));
    } else if (res.content) {
      children.push(createParagraph(JSON.stringify(res.content, null, 2)));
    }
  });

  const doc = new Document({
    sections: [{
      properties: {
        page: { margin: { top: 1080, bottom: 1080, left: 1080, right: 1080 } }
      },
      children
    }]
  });

  await downloadDocx(doc, `${cleanText(lesson.title)}_Complete_Pack`);
}

// ==========================================
// 3. WEEKLY LESSON PLAN EXPORT (.DOCX)
// ==========================================
export async function exportWeeklyLessonPlanToWord(plan: WeeklyLessonPlan, teacherName?: string): Promise<void> {
  const children: (Paragraph | Table)[] = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 40, after: 40 },
      children: [
        new TextRun({
          text: `WEEKLY LESSON PLAN: ${cleanText(plan.week.topic)}`,
          bold: true,
          size: 34,
          color: PRIMARY_NAVY
        })
      ]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 160 },
      children: [
        new TextRun({
          text: `Teacher: ${cleanText(teacherName || 'Not provided')} | ${plan.week.grade} - ${plan.week.subject}`,
          size: 22,
          color: TEXT_MUTED
        })
      ]
    })
  ];

  plan.week.days.forEach(day => {
    children.push(createSectionHeading(`Day: ${day.day}`, 260));
    const bullets = toCleanBullets(formatLessonForExport(day.lesson, teacherName));
    bullets.forEach(b => children.push(createBullet(b)));
  });

  const doc = new Document({
    sections: [{
      properties: {
        page: { margin: { top: 1080, bottom: 1080, left: 1080, right: 1080 } }
      },
      children
    }]
  });

  await downloadDocx(doc, `${cleanText(plan.week.topic)}_Weekly_Plan`);
}

// ==========================================
// 4. DAILY LESSON PLAN EXPORT (.DOCX)
// ==========================================
export async function exportDailyPlanToWord(plan: DailyLessonPlan): Promise<void> {
  const doc = new Document({
    sections: [{
      properties: {
        page: { margin: { top: 1080, bottom: 1080, left: 1080, right: 1080 } }
      },
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 40, after: 40 },
          children: [
            new TextRun({
              text: `DAILY LESSON PLAN: ${cleanText(plan.lesson_title)}`,
              bold: true,
              size: 34,
              color: PRIMARY_NAVY
            })
          ]
        }),
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                createCell("Grade", 25, { isLabel: true }),
                createCell(cleanText(plan.grade), 25),
                createCell("Subject", 25, { isLabel: true }),
                createCell(cleanText(plan.subject), 25)
              ]
            }),
            new TableRow({
              children: [
                createCell("Topic", 25, { isLabel: true }),
                createCell(cleanText(plan.topic), 25),
                createCell("Schedule", 25, { isLabel: true }),
                createCell(`Cycle ${plan.cycle}, Week ${plan.week}, Day ${plan.day}`, 25)
              ]
            })
          ]
        }),
        createSectionHeading("Lesson Focus", 220),
        createParagraph(cleanText(plan.focus)),

        createSectionHeading("Learning Objective", 220),
        createParagraph(cleanText(plan.objectiveSummary)),

        createSectionHeading("Main Activity", 220),
        createParagraph(cleanText(plan.mainActivity)),

        createSectionHeading("Assessment Check", 220),
        createParagraph(cleanText(plan.assessmentCheck)),

        ...(plan.teacher_notes ? [
          createSectionHeading("Teacher Notes", 220),
          createParagraph(cleanText(plan.teacher_notes), { italic: true })
        ] : [])
      ]
    }]
  });

  await downloadDocx(doc, `${cleanText(plan.lesson_title)}_Daily_Plan`);
}

// ==========================================
// 5. LANGUAGE ARTS WEEKLY PLAN EXPORT (.DOCX)
// ==========================================
export async function exportLAWeeklyToWord(plan: LanguageArtsWeeklyPlan): Promise<void> {
  const doc = new Document({
    sections: [{
      properties: {
        page: { margin: { top: 1080, bottom: 1080, left: 1080, right: 1080 } }
      },
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 40, after: 40 },
          children: [
            new TextRun({
              text: `LANGUAGE ARTS WEEKLY PLAN: ${cleanText(plan.theme)}`,
              bold: true,
              size: 34,
              color: PRIMARY_NAVY
            })
          ]
        }),
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                createCell("Grade", 25, { isLabel: true }),
                createCell(cleanText(plan.grade), 25),
                createCell("Subject", 25, { isLabel: true }),
                createCell(cleanText(plan.subject), 25)
              ]
            }),
            new TableRow({
              children: [
                createCell("Cycle", 25, { isLabel: true }),
                createCell(`Cycle ${plan.cycle}`, 25),
                createCell("Week", 25, { isLabel: true }),
                createCell(`Week ${plan.week}`, 25)
              ]
            })
          ]
        }),
        createSectionHeading("Weekly Learning Outcomes", 220),
        ...plan.learningOutcomes.map(cleanText).map(createBullet)
      ]
    }]
  });

  await downloadDocx(doc, `${cleanText(plan.theme)}_Weekly_Plan`);
}

// ==========================================
// 6. WEEKLY CURRICULUM PLAN EXPORT (.DOCX)
// ==========================================
export async function exportWeeklyCurriculumToWord(plan: WeeklyCurriculumPlan): Promise<void> {
  const doc = new Document({
    sections: [{
      properties: {
        page: { margin: { top: 1080, bottom: 1080, left: 1080, right: 1080 } }
      },
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 40, after: 40 },
          children: [
            new TextRun({
              text: `WEEKLY CURRICULUM PLAN: ${cleanText(plan.weekly_topic)}`,
              bold: true,
              size: 34,
              color: PRIMARY_NAVY
            })
          ]
        }),
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                createCell("Grade Level", 25, { isLabel: true }),
                createCell(cleanText(plan.grade_level), 25),
                createCell("Subject", 25, { isLabel: true }),
                createCell(cleanText(plan.subject), 25)
              ]
            }),
            new TableRow({
              children: [
                createCell("Cycle", 25, { isLabel: true }),
                createCell(`Cycle ${plan.cycle}`, 25),
                createCell("Week Number", 25, { isLabel: true }),
                createCell(`Week ${plan.week_number}`, 25)
              ]
            })
          ]
        }),
        createSectionHeading("Weekly Big Idea", 220),
        createParagraph(cleanText(plan.weekly_big_idea), { italic: true }),

        createSectionHeading("Learning Outcomes", 220),
        ...plan.weekly_learning_outcomes.map(cleanText).map(createBullet)
      ]
    }]
  });

  await downloadDocx(doc, `${cleanText(plan.weekly_topic)}_Weekly_Curriculum`);
}

// ==========================================
// 7. CLEAN PLAIN TEXT FORMATTER (ZERO MARKDOWN)
// ==========================================
export function formatLessonForExport(data: LessonPlan, teacherNameOverride?: string): string {
  const teacherName = teacherNameOverride || data.studentTeacherName || "Not provided";
  const today = new Date();
  const dateStr = data.date || `${today.getDate()}th ${today.toLocaleString('default', { month: 'long' })} ${today.getFullYear()}`;
  
  const normObjectives = normalizeLearningObjectives(data, {
    topic: data.topic,
    materials: data.materialsBoard?.map(m => m.name) || data.materials
  });
  const conditionObj = cleanText(normObjectives.condition);
  const cognitiveObj = cleanText(normObjectives.cognitive);
  const psychomotorObj = cleanText(normObjectives.psychomotor);
  const affectiveObj = cleanText(normObjectives.affective);

  const scItems = data.learningObjectivesBoard?.successCriteria && data.learningObjectivesBoard.successCriteria.length > 0
    ? data.learningObjectivesBoard.successCriteria.map(sc => cleanText(sc.startsWith('I can') ? sc : `I can ${sc}`))
    : [
        `I can accurately define and identify key concepts related to ${cleanText(data.topic)}.`,
        "I can apply standard procedural methods to solve representative problems.",
        "I can justify my reasoning clearly to a partner or teacher using academic vocabulary."
      ];

  const introBullets = toCleanBullets(data.introduction || data.executionBoard?.[0]?.teacherActions || "Introduce lesson hook, activate prior knowledge, and state clear learning goals.");
  const explicitBullets = toCleanBullets(data.development || data.executionBoard?.[1]?.teacherActions || "Model target concept explicitly, demonstrate worked examples on board, and emphasize academic vocabulary.");
  const guidedBullets = toCleanBullets(data.guidedPractice || data.executionBoard?.[2]?.teacherActions || "Circulate classroom, scaffold paired practice, and provide immediate targeted feedback.");
  const indepBullets = toCleanBullets(data.independentPractice || data.executionBoard?.[3]?.teacherActions || "Observe individual students, record formative notes, and provide tiered assistance where needed.");
  const closureBullets = toCleanBullets(data.closurePanel?.exitQuestion || data.closure || data.executionBoard?.[4]?.teacherActions || "Facilitate whole-class synthesis, review success criteria, and administer exit slip.");

  const qList: string[] = (
    data.structured_json?.questions || 
    (data.executionBoard?.flatMap((b: any) => b.questions || b.questionsToAsk || []) as string[]) || 
    []
  ).map(cleanText).filter(q => q.length > 0 && q !== 'Not provided');

  return `LESSON PLAN
${cleanText(data.lessonTitle || data.topic)}

School: St. Jude Roman Catholic Primary School
Teacher: ${teacherName}
Grade/Class: ${cleanText(data.grade || 'Standard 4')}
Subject: ${cleanText(data.subject || 'Mathematics')}
Date: ${dateStr}
Duration: ${cleanText(data.duration || '60 Minutes')}
Topic: ${cleanText(data.topic || 'Not provided')}
Subtopic: ${cleanText(data.subtopic || 'Not provided')}

CURRICULUM ALIGNMENT
Curriculum/Framework: Belize National Primary School Curriculum Framework
Cycle: Cycle ${data.cycle || 1}
Strand: ${cleanText(data.strand || 'General Strand')}
Topic: ${cleanText(data.topic || 'Not provided')}
Subtopic: ${cleanText(data.subtopic || 'Not provided')}
Curriculum Outcome: ${cleanText(data.learningOutcome || 'Demonstrate understanding and application of grade-level curriculum outcomes.')}
Competency/Standard: ${toCleanBullets(data.structured_json?.competencies).join('; ') || 'Apply foundational competencies in communication, inquiry, problem solving, and mathematical reasoning.'}
Curriculum Code: ${cleanText(data.structured_json?.curriculumCode || 'Not provided')}

LESSON OVERVIEW
LESSON TITLE: ${cleanText(data.lessonTitle || data.topic)}
LESSON DESCRIPTION: ${cleanText(data.lessonSnapshot?.about || data.lessonSnapshot?.learning || data.content?.slice(0, 300) || `A comprehensive lesson designed to develop understanding and mastery of ${data.topic}.`)}
PRIOR KNOWLEDGE: ${cleanText(data.priorKnowledgeActivation?.whatTheyKnow || data.previousKnowledge || "Students have previously explored foundational prerequisites and related grade-level standards.")}
KEY VOCABULARY: ${toCleanBullets(data.structured_json?.vocabulary || [data.topic, data.subtopic || '', "Standard form", "Expanded form"].filter(Boolean)).join(', ')}

LEARNING OBJECTIVES
CONDITION: ${conditionObj}
COGNITIVE DOMAIN: ${cognitiveObj}
PSYCHOMOTOR/SKILLS DOMAIN: ${psychomotorObj}
AFFECTIVE DOMAIN: ${affectiveObj}

SUCCESS CRITERIA
${scItems.map(sc => `[ ] ${sc}`).join('\n')}

MATERIALS AND RESOURCES
${(data.materialsBoard?.map(m => `- ${cleanText(m.name)}: ${cleanText(m.purpose)}`) || data.materials?.map(m => `- ${cleanText(m)}: Instructional support`) || ['- Core textbooks & student workbooks', '- Concrete manipulatives / visual chart', '- Practice worksheet & exit slips']).join('\n')}

LESSON PROCEDURE
1. Introduction / Warm-Up (10 minutes)
${introBullets.map(b => `  - ${b}`).join('\n')}

2. Explicit Teaching (15 minutes)
${explicitBullets.map(b => `  - ${b}`).join('\n')}

3. Guided Practice (15 minutes)
${guidedBullets.map(b => `  - ${b}`).join('\n')}

4. Independent Practice (15 minutes)
${indepBullets.map(b => `  - ${b}`).join('\n')}

5. Closure (5 minutes)
${closureBullets.map(b => `  - ${b}`).join('\n')}

QUESTIONING STRATEGIES
Remember / Identify: ${qList[0] || `What is the key term in today's lesson on ${data.topic}?`}
Understand: ${qList[1] || `How would you explain this concept in your own words?`}
Apply: ${qList[2] || `How can we apply this method to solve the given problem?`}
Analyze: ${qList[3] || `What pattern or relationship do you notice?`}
Evaluate / Create: ${qList[4] || `Can you justify your answer or create a problem following this rule?`}

DIFFERENTIATION
STUDENTS REQUIRING ADDITIONAL SUPPORT: ${toCleanBullets(data.differentiationFramework?.strugglingLearners?.scaffolds || data.differentiation).join(' ') || 'Provide concrete manipulatives, visual place-value charts, and guided teacher assistance.'}
ON-LEVEL LEARNERS: ${toCleanBullets(data.differentiationFramework?.onLevelLearners?.independentWorkExpectations || "Complete standard practice problems with focus on procedural accuracy and conceptual explanation.").join(' ')}
ADVANCED LEARNERS: ${toCleanBullets(data.differentiationFramework?.advancedLearners?.challengeTasks || data.differentiationFramework?.advancedLearners?.extensionActivity || data.homeworkExtension?.task || "Formulate challenging extension problems, analyze non-standard cases, or mentor peers.").join(' ')}
INCLUSION SUPPORTS: ${toCleanBullets(data.structured_json?.inclusion || "Provide visual anchor charts, enlarged print if required, clear peer buddy pairings, and extended response time.").join(' ')}

ASSESSMENT
FORMATIVE ASSESSMENT: Continuous teacher observation, targeted questioning checks, and feedback during guided practice.
GUIDED PRACTICE: Paired check-ins and rubric-aligned oral responses.
INDEPENDENT PRACTICE: Evaluation of individual student practice worksheets and problem-solving accuracy.
EVALUATION CRITERIA: Students demonstrate 80% or greater accuracy on core curriculum objectives.
EXIT TICKET: ${cleanText(data.closurePanel?.exitQuestion || (data.closure && data.closure[0]) || `Write one thing you learned today about ${data.topic} and solve one representative question.`)}

CLOSURE
- Summarize core concepts and key vocabulary mastered.
- Reflect on achievement of lesson success criteria.
- Preview upcoming curriculum topic.

TEACHER REFLECTION
What went well?
What challenges occurred?
Which students require follow-up?
What should be adjusted for the next lesson?
Next Steps:

LESSON RESOURCES
- Printable Practice Worksheet & Extension Tasks
- Anchor Charts & Concrete Visual Aids
- Formative Exit Tickets & Assessment Slips
`;
}

export const exportToPDF = (plan: LessonPlan) => {
  window.print();
};
