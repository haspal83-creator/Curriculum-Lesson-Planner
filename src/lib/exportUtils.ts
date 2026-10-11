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
  Header,
  PageBreak,
  PageOrientation
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
import { exportReferenceLessonPlanToWord, buildReferenceLessonPlanDocx } from "./referenceLessonPlanExport";
import { 
  resolveCompleteLessonResources, 
  validateLessonExport, 
  purgeCrossSubjectContamination, 
  OFFICIAL_SCHOOL_NAME, 
  sanitizeExportText, 
  toCleanBullets as toCleanBulletsResolved,
  ResolvedLessonResources
} from './lessonExportResolver';
import { 
  exportWeeklyPlanToDocxDocument, 
  normalizeWeeklyPlanForExport 
} from './weeklyPlanWordExport';
import { 
  exportWeeklyPlanToPdfDocument 
} from './weeklyPlanPdfExport';

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

// Backward compatibility export
export function cleanText(text: any): string {
  return sanitizeExportText(text);
}

export function toCleanBullets(text: any): string[] {
  return toCleanBulletsResolved(text);
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

// Reference Template Table Grid Borders & Margins
const tableGridBorder = { style: BorderStyle.SINGLE, size: 4, color: '000000' };
const masterTableBorders = {
  top: tableGridBorder,
  bottom: tableGridBorder,
  left: tableGridBorder,
  right: tableGridBorder,
  insideHorizontal: tableGridBorder,
  insideVertical: tableGridBorder
};
const masterCellMargins = { top: 90, bottom: 90, left: 130, right: 130 };

function getDefaultAgeRange(gradeStr?: string): string {
  const g = (gradeStr || '').toLowerCase();
  if (g.includes('infant 1')) return '5 - 6 years';
  if (g.includes('infant 2')) return '6 - 7 years';
  if (g.includes('standard 1')) return '7 - 8 years';
  if (g.includes('standard 2')) return '8 - 9 years';
  if (g.includes('standard 3')) return '9 - 10 years';
  if (g.includes('standard 4')) return '10 - 11 years';
  if (g.includes('standard 5')) return '11 - 12 years';
  if (g.includes('standard 6')) return '12 - 13 years';
  return '9 - 11 years';
}

function createMasterLabelCell(label: string): TableCell {
  return new TableCell({
    width: { size: 26, type: WidthType.PERCENTAGE },
    borders: masterTableBorders,
    margins: masterCellMargins,
    children: [
      new Paragraph({
        spacing: { before: 20, after: 20, line: 240 },
        children: [
          new TextRun({
            text: label,
            bold: true,
            size: 21, // 10.5pt
            color: '000000'
          })
        ]
      })
    ]
  });
}

function createMasterContentCell(content: string | Paragraph | Paragraph[]): TableCell {
  let children: Paragraph[] = [];
  if (typeof content === 'string') {
    const lines = content.split('\n').filter(l => l.trim().length > 0);
    if (lines.length === 0) {
      children = [new Paragraph({ children: [new TextRun({ text: '', size: 20 })] })];
    } else {
      children = lines.map(line => new Paragraph({
        spacing: { before: 20, after: 30, line: 240 },
        children: [new TextRun({ text: cleanText(line), size: 20, color: '000000' })]
      }));
    }
  } else if (Array.isArray(content)) {
    children = content.length > 0 ? content : [new Paragraph({ children: [new TextRun({ text: '', size: 20 })] })];
  } else {
    children = [content];
  }

  return new TableCell({
    width: { size: 74, type: WidthType.PERCENTAGE },
    borders: masterTableBorders,
    margins: masterCellMargins,
    children
  });
}

function createMasterRow(label: string, content: string | Paragraph | Paragraph[]): TableRow {
  return new TableRow({
    cantSplit: false,
    children: [
      createMasterLabelCell(label),
      createMasterContentCell(content)
    ]
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
// 1. MASTER LESSON EXPORT TO WORD (.DOCX)
// ==========================================
export async function exportToWord(
  plan: LessonPlan, 
  teacherName?: string, 
  schoolName?: string
): Promise<void> {
  await exportReferenceLessonPlanToWord(plan, teacherName, schoolName);
}

// ==========================================
// 2. SAVED LESSON EXPORT (.DOCX)
// ==========================================
export async function exportSavedLessonToWord(
  lesson: SavedLesson, 
  resources?: LessonResourceNew[], 
  teacherName?: string, 
  schoolName?: string
): Promise<void> {
  let planData: LessonPlan;
  if ((lesson as any).lesson_plan && typeof (lesson as any).lesson_plan === 'object') {
    const lp = (lesson as any).lesson_plan;
    planData = {
      ...lp,
      lessonTitle: lp.lessonTitle || lesson.title,
      topic: lp.topic || lesson.topic,
      subject: lp.subject || (lesson.subject as any),
      grade: lp.grade || (lesson.class_id as any),
      duration: lp.duration || lesson.duration,
      date: lp.date || (lesson as any).date || (lesson as any).created_at,
      studentTeacherName: lp.studentTeacherName || teacherName || (lesson as any).teacher_id
    };
    if (resources && resources.length > 0 && (!planData.studentMaterials || planData.studentMaterials.length === 0)) {
      planData.studentMaterials = resources.map(r => ({
        title: r.title,
        type: r.resource_type as any,
        content: typeof r.content === 'string' ? r.content : JSON.stringify(r.content),
        answerKey: undefined
      }));
    }
  } else {
    planData = {
      lessonTitle: lesson.title,
      topic: lesson.topic,
      subject: lesson.subject as any,
      grade: lesson.class_id as any,
      duration: lesson.duration,
      date: (lesson as any).date || (lesson as any).created_at,
      studentTeacherName: teacherName,
      studentMaterials: resources?.map(r => ({
        title: r.title,
        type: r.resource_type as any,
        content: typeof r.content === 'string' ? r.content : JSON.stringify(r.content),
        answerKey: undefined
      }))
    } as unknown as LessonPlan;
  }

  await exportToWord(planData, planData.studentTeacherName || teacherName, schoolName);
}

// ==========================================
// 3. WEEKLY LESSON PLAN EXPORT (.DOCX & .PDF)
// ==========================================
export async function exportWeeklyLessonPlanToWord(
  plan: any, 
  teacherName?: string, 
  schoolName?: string
): Promise<void> {
  const normalized = normalizeWeeklyPlanForExport(plan, teacherName, schoolName);
  await exportWeeklyPlanToDocxDocument(normalized, 'Weekly_Lesson_Plan');
}

export async function exportWeeklyLessonPlanToPDF(
  plan: any, 
  teacherName?: string, 
  schoolName?: string
): Promise<void> {
  const normalized = normalizeWeeklyPlanForExport(plan, teacherName, schoolName);
  await exportWeeklyPlanToPdfDocument(normalized, 'Weekly_Lesson_Plan');
}

export async function exportDailyPlanToWord(
  plan: any,
  teacherName?: string,
  schoolName?: string
): Promise<void> {
  // If structured_json exists, directly export the complete rich lesson plan
  if (plan.structured_json && typeof plan.structured_json === 'object') {
    await exportToWord(plan.structured_json, teacherName, schoolName);
    return;
  }

  // Otherwise synthesize a complete teach-ready LessonPlan
  const gradeStr = typeof plan.grade === 'object' && plan.grade !== null ? (plan.grade as any).name || 'Standard 4' : String(plan.grade || 'Standard 4');
  const subjectStr = typeof plan.subject === 'object' && plan.subject !== null ? (plan.subject as any).name || 'Mathematics' : String(plan.subject || 'Mathematics');
  const titleStr = typeof plan.lesson_title === 'object' && plan.lesson_title !== null ? (plan.lesson_title as any).title || 'Daily Lesson' : String(plan.lesson_title || 'Daily Lesson');

  const syntheticLesson: any = {
    lessonTitle: titleStr,
    grade: gradeStr as any,
    subject: subjectStr as any,
    cycle: Number(plan.cycle) || 1,
    topic: plan.topic || titleStr,
    subtopic: plan.subtopic || plan.topic || titleStr,
    learningOutcome: plan.learning_outcome || plan.learningOutcome || (plan.objectives && plan.objectives[0]) || 'Demonstrate mastery of lesson concepts.',
    learningObjectives: {
      cognitive: Array.isArray(plan.objectives) && plan.objectives.length > 0 ? plan.objectives[0] : titleStr,
      affective: 'Demonstrate active collaboration and perseverance.',
      psychomotor: 'Accurately demonstrate procedures in student notes.'
    },
    duration: plan.duration || '45 mins'
  };

  await exportToWord(syntheticLesson as LessonPlan, teacherName, schoolName);
}

export async function exportDailyPlanToPDF(
  plan: any,
  teacherName?: string,
  schoolName?: string
): Promise<void> {
  const normalized = normalizeWeeklyPlanForExport({
    topic: plan.topic || plan.lesson_title || 'Daily Lesson',
    grade: plan.grade,
    subject: plan.subject,
    cycle: plan.cycle || 1,
    weekNumber: plan.week || 1,
    days: [{
      day: plan.day || plan.day_number || 1,
      lesson: plan.structured_json || plan
    }]
  }, teacherName, schoolName);
  await exportWeeklyPlanToPdfDocument(normalized, 'Daily_Lesson_Plan');
}

export async function exportLAWeeklyToWord(
  plan: any,
  teacherName?: string,
  schoolName?: string
): Promise<void> {
  const normalized = normalizeWeeklyPlanForExport(plan, teacherName, schoolName);
  await exportWeeklyPlanToDocxDocument(normalized, 'LA_Weekly_Lesson_Plan');
}

export async function exportLAWeeklyToPDF(
  plan: any,
  teacherName?: string,
  schoolName?: string
): Promise<void> {
  const normalized = normalizeWeeklyPlanForExport(plan, teacherName, schoolName);
  await exportWeeklyPlanToPdfDocument(normalized, 'LA_Weekly_Lesson_Plan');
}

export async function exportWeeklyCurriculumToWord(
  plan: any,
  teacherName?: string,
  schoolName?: string
): Promise<void> {
  const normalized = normalizeWeeklyPlanForExport(plan, teacherName, schoolName);
  await exportWeeklyPlanToDocxDocument(normalized, 'Weekly_Curriculum_Plan');
}

export async function exportWeeklyCurriculumToPDF(
  plan: any,
  teacherName?: string,
  schoolName?: string
): Promise<void> {
  const normalized = normalizeWeeklyPlanForExport(plan, teacherName, schoolName);
  await exportWeeklyPlanToPdfDocument(normalized, 'Weekly_Curriculum_Plan');
}

// ==========================================
// 4. PLAIN TEXT FORMATTER (SINGLE SOURCE OF TRUTH)
// ==========================================
export function formatLessonForExport(
  data: LessonPlan, 
  teacherNameOverride?: string, 
  schoolNameOverride?: string
): string {
  const res = resolveCompleteLessonResources(data, {
    teacherName: teacherNameOverride,
    schoolName: schoolNameOverride
  });

  const subjectDisplay = cleanText(res.subject || data.subject || 'Mathematics');
  const actualTeacher = cleanText(teacherNameOverride || data.studentTeacherName || res.teacherName || 'Student Teacher');
  const actualDate = cleanText(res.dateStr || data.date || new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
  const classLevel = cleanText(res.grade || data.grade || 'Standard 4');
  const classSize = cleanText(data.classSize || (data as any).class_size || '25-30 Students');
  const ageRange = cleanText(data.ageRange || (data as any).age_range || getDefaultAgeRange(classLevel));
  const duration = cleanText(res.duration || data.duration || '45 mins');
  const subtopic = cleanText((res.subtopic && res.subtopic !== 'Not provided' ? res.subtopic : '') || data.subtopic || res.topic);
  const strand = cleanText(res.strand ? `Strand: ${res.strand}${res.curriculumCode ? ` | Code: ${res.curriculumCode}` : ''}` : (data.strand || 'Belize National Primary Curriculum Framework Standards'));

  let output = `${subjectDisplay.toUpperCase()} DAILY PLAN\n\n`;
  output += `1. Student Teacher Name: ${actualTeacher}\n`;
  output += `2. Date: ${actualDate}\n`;
  output += `3. Subject: ${subjectDisplay}\n`;
  output += `4. Topic: ${cleanText(res.topic || data.topic)}\n`;
  output += `5. Sub-topic: ${subtopic}\n`;
  output += `6. Class Level: ${classLevel}\n`;
  output += `7. Class size: ${classSize}\n`;
  output += `8. Age range: ${ageRange}\n`;
  output += `9. Time & Duration: ${duration}\n`;
  output += `10. Previous Knowledge: ${cleanText(res.priorKnowledge || data.previousKnowledge || 'Students have acquired foundational understanding and prerequisite skills.')}\n`;
  output += `11. Targeted core-competency(ies): ${cleanText(res.competencies || 'Critical Thinking, Communication, Collaboration, Problem Solving')}\n`;
  output += `12. Content Standard/content strands: ${strand}\n`;
  output += `13. Learning Outcome(s): ${cleanText(res.learningOutcome || data.learningOutcome)}\n`;
  output += `14. Behavioral Objectives:\n`;
  if (res.condition) output += `   - Condition: ${cleanText(res.condition)}\n`;
  if (res.cognitive) output += `   - Cognitive: ${cleanText(res.cognitive)}\n`;
  if (res.psychomotor) output += `   - Psychomotor: ${cleanText(res.psychomotor)}\n`;
  if (res.affective) output += `   - Affective: ${cleanText(res.affective)}\n`;
  output += `15. Content/concepts: ${cleanText(res.lessonDescription)}\n`;
  output += `16. Curricular Linkages: Cross-curricular linkages with Language Arts, Science, and Belizean social studies.\n`;
  output += `17. Teaching-Learning Resources:\n${res.materialsList.map(m => `   - ${cleanText(m.name)}${m.purpose ? ` (${cleanText(m.purpose)})` : ''}`).join('\n')}\n`;
  output += `18. References: ${cleanText(data.source || 'Belize Primary Curriculum Framework; MoECST')}\n`;
  output += `19. Methodology: ${cleanText(res.methodology || res.teachingStrategy || 'Guided Discovery, Interactive Modeling, Collaborative Inquiry')}\n`;
  output += `20. Procedure:\n`;
  res.stages.forEach(st => {
    output += `   [${st.title} (${st.duration})]\n`;
    output += `   Teacher Actions:\n${st.teacherActions.map(a => `     • ${cleanText(a)}`).join('\n')}\n`;
    output += `   Student Actions:\n${st.studentActions.map(a => `     • ${cleanText(a)}`).join('\n')}\n`;
    if (st.keyQuestions.length > 0) output += `   Key Questions:\n${st.keyQuestions.map(q => `     • ${cleanText(q)}`).join('\n')}\n`;
    if (st.assessment) output += `   Assessment & Check: ${cleanText(st.assessment)}\n`;
  });
  output += `21. Conclusion (summative assessment activity): ${cleanText(res.exitTicket?.prompt || res.closure.join(' ') || 'Synthesize lesson concepts and administer formative exit check.')}\n`;
  output += `22. Differentiation:\n`;
  output += `   - Struggling Learners: ${res.differentiation.strugglingLearners.join('; ')}\n`;
  output += `   - On-Level Learners: ${res.differentiation.onLevelLearners.join('; ')}\n`;
  output += `   - Advanced Learners: ${res.differentiation.advancedLearners.join('; ')}\n`;
  output += `23. Extended Activity: ${cleanText(res.extensionActivity?.tasks.join('; ') || data.homeworkExtension?.task || 'Apply lesson principles to solve an authentic real-world problem at home.')}\n`;
  output += `24. Lesson Evaluation:\n`;
  output += `   - Strengths: ${cleanText(res.reflection.whatWorked || 'High engagement and clear mastery of behavioral objectives.')}\n`;
  output += `   - Weaknesses: ${cleanText(res.reflection.challenges || 'Pacing during independent work required careful oversight.')}\n`;
  output += `   - Recommendations: ${cleanText(res.reflection.adjustments || res.reflection.nextSteps || 'Begin next lesson with spiral review.')}\n`;

  return output;
}

export const exportToPDF = async (plan: any, teacherName?: string) => {
  if (plan && (plan.week || plan.daily_plans || (Array.isArray(plan.days) && plan.days.length > 0))) {
    await exportWeeklyLessonPlanToPDF(plan, teacherName);
  } else {
    window.print();
  }
};
