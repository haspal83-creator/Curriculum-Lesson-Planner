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
  PageBreak
} from 'docx';

// ============================================================================
// GLOBAL WORKSHEET SYSTEM: INTERFACES & DATA MODELS
// ============================================================================

export interface WorksheetTask {
  number: number;
  prompt: string;
  type?: 'multiple_choice' | 'fill_in_blank' | 'short_answer' | 'extended_response' | 'matching' | 'problem_solving' | 'diagram' | 'task';
  points?: number;
  options?: string[];
  lines?: number;
  answer?: string;
  criteria?: string;
}

export interface WorksheetSection {
  letter: string;
  title: string;
  instructions?: string;
  tasks: WorksheetTask[];
}

export interface StructuredWorksheet {
  schoolName: string;
  grade: string;
  subject: string;
  title: string;
  topic?: string;
  subtopic?: string;
  curriculumCode?: string;
  learningOutcome?: string;
  instructions: string;
  sections: WorksheetSection[];
  totalPoints: number;
  answerKey: {
    sectionLetter: string;
    sectionTitle: string;
    answers: {
      number: number;
      solution: string;
      criteria?: string;
      points?: number;
    }[];
  }[];
}

// Default standard values
export const DEFAULT_SCHOOL_NAME = 'SAN JUAN BOSCO R.C. SCHOOL';
const PRIMARY_NAVY = '1E3A8A';
const TEXT_MAIN = '1E293B';
const TEXT_MUTED = '475569';
const BORDER_COLOR = 'CBD5E1';
const HEADER_BG = 'F1F5F9';
const LABEL_BG = 'F8FAFC';
const SUCCESS_COLOR = '047857';

const thinBorder = { style: BorderStyle.SINGLE, size: 4, color: BORDER_COLOR };
const cellBorders = { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder };
const cellMargins = { top: 90, bottom: 90, left: 130, right: 130 };

// ============================================================================
// AUTOMATIC QUALITY CONTROL & PARSING ENGINE
// ============================================================================

/**
 * Robustly parses and normalizes any worksheet content (Markdown, raw text, or JSON),
 * enforcing all global worksheet formatting rules:
 * - Removes numbers from metadata (Name, Date, Score, Grade, Instructions, Headings)
 * - Identifies actual student questions and numbers them sequentially (1, 2, 3...)
 * - Groups tasks into clean sections (A, B, C...)
 * - Computes the exact total score
 * - Generates/aligns a matching Teacher Answer Key with identical question numbers
 */
export function parseAndNormalizeWorksheet(
  rawContent: any,
  context?: {
    schoolName?: string;
    grade?: string;
    subject?: string;
    topic?: string;
    subtopic?: string;
    title?: string;
    curriculumCode?: string;
    learningOutcome?: string;
  }
): StructuredWorksheet {
  const schoolName = context?.schoolName || DEFAULT_SCHOOL_NAME;
  const grade = context?.grade || 'Standard 6';
  const subject = context?.subject || 'General Studies';
  const topic = context?.topic || 'Curriculum Practice';
  const subtopic = context?.subtopic;
  let title = context?.title || `Student Practice Worksheet: ${topic}`;

  // If input is already structured
  if (typeof rawContent === 'object' && rawContent !== null) {
    if (Array.isArray(rawContent.sections) && rawContent.sections.length > 0) {
      let globalNumber = 1;
      const sections: WorksheetSection[] = rawContent.sections.map((sec: any, sIdx: number) => {
        const letter = sec.letter || String.fromCharCode(65 + sIdx);
        const secTitle = cleanSectionTitle(sec.title || sec.sectionTitle || `Section ${letter}`);
        const tasks: WorksheetTask[] = (sec.tasks || sec.questions || []).map((t: any) => {
          const num = globalNumber++;
          const prompt = typeof t === 'string' ? t : (t.prompt || t.text || t.question || '');
          return {
            number: num,
            prompt: cleanPromptText(prompt),
            type: t.type || 'short_answer',
            points: t.points || 1,
            options: t.options,
            lines: t.lines || 2,
            answer: t.answer || t.solution,
            criteria: t.criteria
          };
        });
        return {
          letter,
          title: secTitle,
          instructions: sec.instructions || '',
          tasks
        };
      });

      const totalPoints = sections.reduce((sum, s) => sum + s.tasks.reduce((tSum, t) => tSum + (t.points || 1), 0), 0);

      // Build or extract answer key
      const answerKey = sections.map(s => ({
        sectionLetter: s.letter,
        sectionTitle: s.title,
        answers: s.tasks.map(t => ({
          number: t.number,
          solution: t.answer || `Model response demonstrating mastery of ${topic}.`,
          criteria: t.criteria || 'Accurate procedural steps or clear conceptual explanation.',
          points: t.points || 1
        }))
      }));

      return {
        schoolName,
        grade,
        subject,
        title: cleanWorksheetTitle(rawContent.title || title),
        topic,
        subtopic,
        curriculumCode: context?.curriculumCode,
        learningOutcome: context?.learningOutcome,
        instructions: rawContent.instructions || 'Read each question carefully and complete all assigned tasks.',
        sections,
        totalPoints: totalPoints > 0 ? totalPoints : (globalNumber - 1),
        answerKey
      };
    }
  }

  // Convert rawContent to string
  const text = typeof rawContent === 'string' ? rawContent : JSON.stringify(rawContent || '');

  // Split into Worksheet Body and Answer Key if present
  let bodyText = text;
  let answerKeyText = '';

  const answerKeyMarkers = [
    /\n(?:#{1,4}\s*)?(?:TEACHER\s+)?ANSWER\s+KEY(?:\s*&|\s+AND)?(?:\s+SCORING(?:\s+GUIDE|\s+RUBRIC))?[:\s]*/i,
    /\n\*{2,}(?:TEACHER\s+)?ANSWER\s+KEY\*{2,}[:\s]*/i,
    /\n(?:TEACHER\s+)?ANSWER\s+KEY\s*:?\s*\n/i
  ];

  for (const marker of answerKeyMarkers) {
    const match = marker.exec(bodyText);
    if (match && match.index > 50) {
      answerKeyText = bodyText.substring(match.index + match[0].length);
      bodyText = bodyText.substring(0, match.index);
      break;
    }
  }

  // Parse sections and tasks from bodyText
  const lines = bodyText.split('\n').map(l => l.trim()).filter(Boolean);
  let globalInstructions = 'Read each question carefully and complete all assigned tasks. Show all working where appropriate.';

  // Check for title or global instructions in first few lines
  const parsedSections: { title: string; instructions: string; rawQuestions: string[] }[] = [];
  let currentSection = { title: 'Understanding the Concept', instructions: '', rawQuestions: [] as string[] };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check if line is title
    if (/^#+\s+(?:Worksheet|Practice|Quiz|Assessment)/i.test(line)) {
      title = line.replace(/^#+\s+/, '').replace(/\*+/g, '').trim();
      continue;
    }

    // Filter out metadata lines that shouldn't be questions
    if (/^(?:\d+[\.\)]\s*)?(?:Name|Date|Grade|Standard|Class|Subject|Topic|Subtopic|Teacher|Score|Total Points|Points)\s*:/i.test(line)) {
      continue;
    }

    // Check for global or section instructions
    if (/^(?:\d+[\.\)]\s*)?(?:#{1,4}\s*)?(?:Instructions|Directions)\s*[:\-]?\s*(.*)$/i.test(line)) {
      const match = line.match(/^(?:\d+[\.\)]\s*)?(?:#{1,4}\s*)?(?:Instructions|Directions)\s*[:\-]?\s*(.*)$/i);
      const inst = match ? match[1].trim() : '';
      if (parsedSections.length === 0 && currentSection.rawQuestions.length === 0) {
        if (inst) globalInstructions = inst;
      } else {
        currentSection.instructions = inst || 'Follow the directions for this section.';
      }
      continue;
    }

    // Check for Section Heading (e.g., "### A. Understanding the Concept", "Part 1: Review", "Section B: Apply", "1. Section A")
    const sectionMatch = line.match(/^(?:#{1,4}\s*)?(?:(?:\d+[\.\)]\s*)?(?:Part|Section)\s*([A-Z0-9]+)\s*[:\-]?\s*(.+)|(?:[A-Z]\.)\s*(.+))$/i);
    if (sectionMatch) {
      if (currentSection.rawQuestions.length > 0) {
        parsedSections.push({ ...currentSection });
      }
      const rawTitle = sectionMatch[2] || sectionMatch[3] || sectionMatch[1] || 'Section';
      currentSection = {
        title: cleanSectionTitle(rawTitle),
        instructions: '',
        rawQuestions: []
      };
      continue;
    }

    // Check for question prompt (starts with number, bullet, or letter)
    const qMatch = line.match(/^(?:(?:\d+[\.\)]|Q\d+[:\.]?|[-*•])\s+)(.+)$/i);
    if (qMatch) {
      const questionText = qMatch[1].trim();
      // Ensure it's not metadata that was numbered
      if (!/^(?:Name|Date|Grade|Standard|Class|Subject|Topic|Teacher|Score|Instructions|Section|Part)\b/i.test(questionText)) {
        currentSection.rawQuestions.push(cleanPromptText(questionText));
      }
      continue;
    }

    // Check for multiple choice option (A) ... or a) ...
    if (/^(?:[A-D][\.\)]|[-*•]\s*\[\s*\])\s+.+/i.test(line)) {
      if (currentSection.rawQuestions.length > 0) {
        const lastIdx = currentSection.rawQuestions.length - 1;
        currentSection.rawQuestions[lastIdx] += `\n${line}`;
      }
      continue;
    }

    // Standalone question without leading bullet if it ends in '?' or ':'
    if (line.length > 15 && (line.endsWith('?') || line.includes('______') || line.toLowerCase().startsWith('explain') || line.toLowerCase().startsWith('describe') || line.toLowerCase().startsWith('calculate') || line.toLowerCase().startsWith('solve'))) {
      currentSection.rawQuestions.push(cleanPromptText(line));
    }
  }

  if (currentSection.rawQuestions.length > 0) {
    parsedSections.push(currentSection);
  }

  // If no questions found from regex, fallback to splitting raw text into questions
  if (parsedSections.length === 0 || parsedSections.every(s => s.rawQuestions.length === 0)) {
    const fallbackTasks = [
      `Explain the key concept of ${topic} and how it connects to daily life in Belize.`,
      `Apply the foundational rules of ${topic} to complete the assigned practice problem.`,
      `Analyze an example related to ${topic} and justify your step-by-step reasoning.`,
      `Solve the contextual challenge question and explain your strategy.`
    ];
    parsedSections.push({
      title: 'Practice & Application',
      instructions: 'Work through each task carefully.',
      rawQuestions: fallbackTasks
    });
  }

  // Parse answer key lines if available
  const answerKeyMap = new Map<number, string>();
  if (answerKeyText) {
    const akLines = answerKeyText.split('\n').map(l => l.trim()).filter(Boolean);
    let currentAkNum: number | null = null;
    for (const akLine of akLines) {
      const numMatch = akLine.match(/^(?:(?:\d+[\.\)]|Question\s+(\d+)[:\.]?)\s*)(.+)$/i);
      if (numMatch) {
        currentAkNum = parseInt(numMatch[1] || numMatch[0], 10);
        if (!isNaN(currentAkNum)) {
          answerKeyMap.set(currentAkNum, numMatch[2].trim());
        }
      } else if (currentAkNum !== null && akLine.length > 0 && !akLine.startsWith('#')) {
        const existing = answerKeyMap.get(currentAkNum) || '';
        answerKeyMap.set(currentAkNum, `${existing} ${akLine}`.trim());
      }
    }
  }

  // Build final structured sections with STRICT SEQUENTIAL NUMBERING across the whole document
  let globalQNum = 1;
  const sections: WorksheetSection[] = parsedSections.map((sec, idx) => {
    const letter = String.fromCharCode(65 + idx);
    const tasks: WorksheetTask[] = sec.rawQuestions.map((qText) => {
      const qNum = globalQNum++;
      const ans = answerKeyMap.get(qNum);

      // Extract MCQ options if present
      const qParts = qText.split('\n');
      const mainPrompt = qParts[0];
      const options = qParts.slice(1).filter(p => /^[A-D][\.\)]/i.test(p.trim())).map(o => o.trim());

      return {
        number: qNum,
        prompt: mainPrompt,
        options: options.length > 0 ? options : undefined,
        type: options.length > 0 ? 'multiple_choice' : 'short_answer',
        points: 1,
        lines: options.length > 0 ? 0 : 2,
        answer: ans || `Accurate model solution demonstrating mastery of ${topic}.`,
        criteria: 'Full marks awarded for correct answer with procedural clarity.'
      };
    });

    return {
      letter,
      title: sec.title || (idx === 0 ? 'Understanding the Concept' : idx === 1 ? 'Apply What You Know' : 'Challenge & Reasoning'),
      instructions: sec.instructions || (idx === 0 ? 'Review the core concepts and answer clearly.' : 'Solve the problems below showing your work.'),
      tasks
    };
  });

  const totalPoints = globalQNum - 1;

  // Build Teacher Answer Key
  const answerKey = sections.map(s => ({
    sectionLetter: s.letter,
    sectionTitle: s.title,
    answers: s.tasks.map(t => ({
      number: t.number,
      solution: t.answer || `Model response demonstrating mastery of ${topic}.`,
      criteria: t.criteria || 'Full credit awarded for complete and accurate answers.',
      points: t.points || 1
    }))
  }));

  return {
    schoolName,
    grade,
    subject,
    title: cleanWorksheetTitle(title),
    topic,
    subtopic,
    curriculumCode: context?.curriculumCode,
    learningOutcome: context?.learningOutcome,
    instructions: globalInstructions,
    sections,
    totalPoints,
    answerKey
  };
}

// Helpers for cleaning strings
function cleanPromptText(text: string): string {
  return text
    .replace(/^(\d+[\.\)]|Q\d+[:\.]?|[-*•])\s+/i, '')
    .replace(/\*+/g, '')
    .trim();
}

function cleanSectionTitle(text: string): string {
  return text
    .replace(/^(\d+[\.\)]\s*)?(?:Part|Section)\s*[A-Z0-9]+[:\-\s]*/i, '')
    .replace(/^[A-Z]\.\s*/i, '')
    .replace(/\*+/g, '')
    .trim();
}

function cleanWorksheetTitle(text: string): string {
  return text
    .replace(/^#+\s*/, '')
    .replace(/\*+/g, '')
    .trim();
}

// ============================================================================
// MARKDOWN FORMATTER (SINGLE SOURCE OF TRUTH)
// ============================================================================

/**
 * Formats a StructuredWorksheet into the exact requested Markdown hierarchy:
 * 
 * **SCHOOL NAME**
 * **GRADE / STANDARD – SUBJECT**
 * # WORKSHEET TITLE
 * **Topic:** ...
 * 
 * **Name:** ______________________________
 * **Date:** ______________________________
 * **Score:** ______ / [Total]
 * 
 * ### Instructions
 * ...
 * 
 * ---
 * ### A. SECTION TITLE
 * **1.** Question 1
 * **2.** Question 2
 * 
 * ---
 * ### B. SECTION TITLE
 * **3.** Question 3
 */
export function formatWorksheetMarkdown(ws: StructuredWorksheet): string {
  const parts: string[] = [];

  // 1. School Name
  parts.push(`**${ws.schoolName.toUpperCase()}**`);

  // 2. Grade & Subject
  parts.push(`**${ws.grade} — ${ws.subject}**`);

  // 3. Worksheet Title
  parts.push(`# ${ws.title}`);

  // 4. Topic / Subtopic
  if (ws.topic) {
    parts.push(`**Topic:** ${ws.topic}${ws.subtopic ? ` — ${ws.subtopic}` : ''}`);
  }

  // 5. Metadata Line (Name, Date, Score)
  parts.push(`**Name:** ____________________________________\n**Date:** ____________________\n**Score:** ______ / ${ws.totalPoints}`);

  // 6. Global Instructions
  parts.push(`### Instructions\n${ws.instructions}`);

  // 7. Sections with sequential questions
  ws.sections.forEach(sec => {
    parts.push(`---\n\n### ${sec.letter}. ${sec.title.toUpperCase()}`);
    if (sec.instructions) {
      parts.push(`*${sec.instructions}*`);
    }

    sec.tasks.forEach(task => {
      let taskMd = `**${task.number}.** ${task.prompt}`;
      if (task.options && task.options.length > 0) {
        taskMd += '\n' + task.options.map(o => `   - [ ] ${o}`).join('\n');
      } else if (task.lines && task.lines > 0) {
        taskMd += '\n' + Array(task.lines).fill('   ______________________________________________________________________').join('\n');
      }
      parts.push(taskMd);
    });
  });

  return parts.join('\n\n');
}

/**
 * Formats the corresponding Teacher Answer Key in matching format
 */
export function formatAnswerKeyMarkdown(ws: StructuredWorksheet): string {
  const parts: string[] = [];

  parts.push(`# TEACHER ANSWER KEY & SCORING GUIDE`);
  parts.push(`**${ws.schoolName.toUpperCase()}**`);
  parts.push(`**${ws.grade} — ${ws.subject}**`);
  parts.push(`**Worksheet:** ${ws.title}`);
  parts.push(`**Total Points:** ${ws.totalPoints}`);

  parts.push(`### Instructions & Scoring Policy\nAward full credit for accurate responses. For constructed responses, award partial credit based on procedural reasoning, vocabulary precision, and conceptual accuracy.`);

  ws.answerKey.forEach(sec => {
    parts.push(`---\n\n### ${sec.sectionLetter}. ${sec.sectionTitle.toUpperCase()}`);
    sec.answers.forEach(ans => {
      parts.push(`**${ans.number}.** ${ans.solution}${ans.points ? ` (${ans.points} ${ans.points === 1 ? 'point' : 'points'})` : ''}${ans.criteria ? `\n   *Scoring Note: ${ans.criteria}*` : ''}`);
    });
  });

  return parts.join('\n\n');
}

// ============================================================================
// MICROSOFT WORD (.DOCX) EXPORT ENGINE
// ============================================================================

export async function exportStructuredWorksheetToDocx(
  ws: StructuredWorksheet,
  options: { includeAnswerKey?: boolean; answerKeyOnly?: boolean } = { includeAnswerKey: true }
): Promise<void> {
  const children: (Paragraph | Table)[] = [];

  if (!options.answerKeyOnly) {
    // 1. School Name
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 40, after: 30 },
        children: [
          new TextRun({
            text: ws.schoolName.toUpperCase(),
            bold: true,
            size: 26, // 13pt
            color: PRIMARY_NAVY
          })
        ]
      })
    );

    // 2. Grade & Subject
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 50 },
        children: [
          new TextRun({
            text: `${ws.grade} — ${ws.subject}`,
            bold: true,
            size: 20, // 10pt
            color: TEXT_MUTED
          })
        ]
      })
    );

    // 3. Worksheet Title
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 60 },
        children: [
          new TextRun({
            text: ws.title,
            bold: true,
            size: 28, // 14pt
            color: PRIMARY_NAVY
          })
        ]
      })
    );

    // 4. Topic / Subtopic (if available)
    if (ws.topic) {
      children.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 0, after: 100 },
          children: [
            new TextRun({
              text: `Topic: ${ws.topic}${ws.subtopic ? ` — ${ws.subtopic}` : ''}`,
              italics: true,
              size: 20,
              color: TEXT_MUTED
            })
          ]
        })
      );
    }

    // 5. Metadata Table (Name, Date, Score)
    children.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            children: [
              new TableCell({
                width: { size: 45, type: WidthType.PERCENTAGE },
                borders: cellBorders,
                margins: cellMargins,
                shading: { fill: LABEL_BG },
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({ text: "Name: ", bold: true, size: 20, color: PRIMARY_NAVY }),
                      new TextRun({ text: "____________________________________", size: 20 })
                    ]
                  })
                ]
              }),
              new TableCell({
                width: { size: 30, type: WidthType.PERCENTAGE },
                borders: cellBorders,
                margins: cellMargins,
                shading: { fill: LABEL_BG },
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({ text: "Date: ", bold: true, size: 20, color: PRIMARY_NAVY }),
                      new TextRun({ text: "____________________", size: 20 })
                    ]
                  })
                ]
              }),
              new TableCell({
                width: { size: 25, type: WidthType.PERCENTAGE },
                borders: cellBorders,
                margins: cellMargins,
                shading: { fill: HEADER_BG },
                children: [
                  new Paragraph({
                    alignment: AlignmentType.RIGHT,
                    children: [
                      new TextRun({ text: "Score: ", bold: true, size: 20, color: PRIMARY_NAVY }),
                      new TextRun({ text: `______ / ${ws.totalPoints}`, bold: true, size: 20 })
                    ]
                  })
                ]
              })
            ]
          })
        ]
      })
    );

    // 6. Global Instructions
    children.push(
      new Paragraph({
        spacing: { before: 120, after: 120 },
        children: [
          new TextRun({ text: "Instructions: ", bold: true, size: 20, color: PRIMARY_NAVY }),
          new TextRun({ text: ws.instructions, italics: true, size: 20 })
        ]
      })
    );

    // 7. Sections & Sequential Questions
    ws.sections.forEach(sec => {
      // Section Heading (e.g. SECTION A: UNDERSTANDING THE CONCEPT)
      children.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 180, after: 40 },
          children: [
            new TextRun({
              text: `SECTION ${sec.letter}: ${sec.title.toUpperCase()}`,
              bold: true,
              size: 22,
              color: PRIMARY_NAVY
            })
          ]
        })
      );

      // Section directions (if any)
      if (sec.instructions) {
        children.push(
          new Paragraph({
            spacing: { before: 0, after: 80 },
            children: [
              new TextRun({
                text: sec.instructions,
                italics: true,
                size: 20,
                color: TEXT_MUTED
              })
            ]
          })
        );
      }

      // Questions
      sec.tasks.forEach(task => {
        children.push(
          new Paragraph({
            spacing: { before: 60, after: 40 },
            children: [
              new TextRun({ text: `${task.number}. `, bold: true, size: 21, color: PRIMARY_NAVY }),
              new TextRun({ text: task.prompt, size: 21, color: TEXT_MAIN })
            ]
          })
        );

        if (task.options && task.options.length > 0) {
          task.options.forEach(opt => {
            children.push(
              new Paragraph({
                indent: { left: 360 },
                spacing: { before: 20, after: 20 },
                children: [
                  new TextRun({ text: "[   ]  ", size: 20, color: TEXT_MUTED }),
                  new TextRun({ text: opt, size: 20 })
                ]
              })
            );
          });
        } else if (task.lines && task.lines > 0) {
          for (let l = 0; l < task.lines; l++) {
            children.push(
              new Paragraph({
                indent: { left: 360 },
                spacing: { before: 20, after: 20 },
                children: [
                  new TextRun({
                    text: "________________________________________________________________________________",
                    size: 18,
                    color: BORDER_COLOR
                  })
                ]
              })
            );
          }
        }
      });
    });
  }

  // Teacher Answer Key Section
  if (options.includeAnswerKey || options.answerKeyOnly) {
    if (!options.answerKeyOnly) {
      children.push(new Paragraph({ children: [new PageBreak()] }));
    }

    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 60, after: 40 },
        children: [
          new TextRun({
            text: "TEACHER ANSWER KEY & SCORING GUIDE",
            bold: true,
            size: 26,
            color: SUCCESS_COLOR
          })
        ]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 80 },
        children: [
          new TextRun({ text: `${ws.title} — Total Points: ${ws.totalPoints}`, bold: true, size: 20, color: TEXT_MUTED })
        ]
      })
    );

    ws.answerKey.forEach(sec => {
      children.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 140, after: 60 },
          children: [
            new TextRun({
              text: `SECTION ${sec.sectionLetter}: ${sec.sectionTitle.toUpperCase()}`,
              bold: true,
              size: 21,
              color: PRIMARY_NAVY
            })
          ]
        })
      );

      sec.answers.forEach(ans => {
        children.push(
          new Paragraph({
            spacing: { before: 40, after: 40 },
            children: [
              new TextRun({ text: `${ans.number}. `, bold: true, size: 20, color: SUCCESS_COLOR }),
              new TextRun({ text: ans.solution, size: 20, bold: true }),
              ...(ans.criteria ? [
                new TextRun({ text: ` [${ans.criteria}]`, size: 18, italics: true, color: TEXT_MUTED })
              ] : [])
            ]
          })
        );
      });
    });
  }

  const doc = new Document({
    sections: [
      {
        properties: {
          page: { margin: { top: 1080, bottom: 1080, left: 1080, right: 1080 } }
        },
        children
      }
    ]
  });

  const fileName = `${ws.title.replace(/[\s/\\?%*:|"<>]+/g, '_')}${options.answerKeyOnly ? '_AnswerKey' : ''}.docx`;
  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ============================================================================
// CLEAN PRINT & PDF ENGINE
// ============================================================================

export function generateWorksheetPrintHtml(
  ws: StructuredWorksheet,
  mode: 'student' | 'teacher' | 'both' = 'student'
): string {
  const showStudent = mode === 'student' || mode === 'both';
  const showTeacher = mode === 'teacher' || mode === 'both';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${ws.title}</title>
  <style>
    @page {
      size: letter;
      margin: 0.75in;
    }
    body {
      font-family: 'Cambria', 'Georgia', 'Times New Roman', serif;
      color: #1e293b;
      line-height: 1.5;
      font-size: 11pt;
      margin: 0;
      padding: 0;
      background: #fff;
    }
    .page {
      max-width: 800px;
      margin: 0 auto;
    }
    .header {
      text-align: center;
      border-bottom: 2px solid #1e3a8a;
      padding-bottom: 12px;
      margin-bottom: 16px;
    }
    .school-name {
      font-size: 13pt;
      font-weight: bold;
      color: #1e3a8a;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      margin-bottom: 2px;
    }
    .grade-subject {
      font-size: 10.5pt;
      font-weight: 600;
      color: #475569;
      margin-bottom: 6px;
    }
    .worksheet-title {
      font-size: 15pt;
      font-weight: bold;
      color: #0f172a;
      margin: 4px 0;
      text-transform: uppercase;
    }
    .topic-subtopic {
      font-size: 10pt;
      font-style: italic;
      color: #64748b;
    }
    .metadata-table {
      width: 100%;
      border-collapse: collapse;
      margin: 14px 0 16px 0;
      border: 1px solid #cbd5e1;
      font-size: 10pt;
    }
    .metadata-table td {
      padding: 8px 12px;
      border: 1px solid #cbd5e1;
    }
    .meta-label {
      font-weight: bold;
      color: #1e3a8a;
    }
    .meta-score {
      text-align: right;
      font-weight: bold;
      background: #f8fafc;
    }
    .instructions-box {
      background: #f8fafc;
      border-left: 4px solid #1e3a8a;
      padding: 10px 14px;
      margin-bottom: 20px;
      font-size: 10pt;
      font-style: italic;
    }
    .section {
      margin-bottom: 24px;
    }
    .section-title {
      font-size: 12pt;
      font-weight: bold;
      color: #1e3a8a;
      text-transform: uppercase;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 4px;
      margin-top: 18px;
      margin-bottom: 6px;
    }
    .section-instructions {
      font-size: 9.5pt;
      font-style: italic;
      color: #64748b;
      margin-bottom: 12px;
    }
    .task {
      margin-bottom: 16px;
      page-break-inside: avoid;
    }
    .task-prompt {
      font-size: 11pt;
      margin-bottom: 6px;
    }
    .task-number {
      font-weight: bold;
      color: #1e3a8a;
      margin-right: 4px;
    }
    .writing-line {
      border-bottom: 1px solid #cbd5e1;
      height: 24px;
      margin: 4px 0 6px 18px;
    }
    .option-row {
      display: flex;
      align-items: center;
      margin: 4px 0 4px 20px;
      font-size: 10.5pt;
    }
    .option-box {
      width: 14px;
      height: 14px;
      border: 1.5px solid #64748b;
      margin-right: 8px;
      display: inline-block;
    }
    .page-break {
      page-break-before: always;
      break-before: page;
      margin-top: 40px;
    }
    .answer-key-header {
      text-align: center;
      border-bottom: 2px solid #047857;
      padding-bottom: 10px;
      margin-bottom: 16px;
    }
    .answer-key-title {
      font-size: 14pt;
      font-weight: bold;
      color: #047857;
      text-transform: uppercase;
    }
    .ak-section-title {
      font-size: 11pt;
      font-weight: bold;
      color: #047857;
      margin-top: 14px;
      margin-bottom: 4px;
      text-transform: uppercase;
    }
    .ak-item {
      margin-bottom: 8px;
      font-size: 10.5pt;
      page-break-inside: avoid;
    }
    .ak-num {
      font-weight: bold;
      color: #047857;
    }
    .ak-criteria {
      font-size: 9.5pt;
      font-style: italic;
      color: #475569;
      margin-left: 18px;
    }
    @media print {
      body {
        margin: 0;
      }
      .no-print {
        display: none !important;
      }
    }
  </style>
</head>
<body>
  <div class="page">
    ${showStudent ? `
      <div class="header">
        <div class="school-name">${ws.schoolName}</div>
        <div class="grade-subject">${ws.grade} — ${ws.subject}</div>
        <div class="worksheet-title">${ws.title}</div>
        ${ws.topic ? `<div class="topic-subtopic">Topic: ${ws.topic}${ws.subtopic ? ` — ${ws.subtopic}` : ''}</div>` : ''}
      </div>

      <table class="metadata-table">
        <tr>
          <td style="width: 45%;"><span class="meta-label">Name:</span> ___________________________________</td>
          <td style="width: 30%;"><span class="meta-label">Date:</span> ___________________</td>
          <td style="width: 25%;" class="meta-score"><span class="meta-label">Score:</span> _______ / ${ws.totalPoints}</td>
        </tr>
      </table>

      <div class="instructions-box">
        <strong>Instructions:</strong> ${ws.instructions}
      </div>

      ${ws.sections.map(sec => `
        <div class="section">
          <div class="section-title">SECTION ${sec.letter}: ${sec.title}</div>
          ${sec.instructions ? `<div class="section-instructions">${sec.instructions}</div>` : ''}
          ${sec.tasks.map(task => `
            <div class="task">
              <div class="task-prompt">
                <span class="task-number">${task.number}.</span> ${task.prompt}
              </div>
              ${task.options && task.options.length > 0 ? `
                <div class="options-container">
                  ${task.options.map(opt => `
                    <div class="option-row">
                      <span class="option-box"></span>
                      <span>${opt}</span>
                    </div>
                  `).join('')}
                </div>
              ` : `
                ${Array(task.lines || 2).fill(0).map(() => `<div class="writing-line"></div>`).join('')}
              `}
            </div>
          `).join('')}
        </div>
      `).join('')}
    ` : ''}

    ${showStudent && showTeacher ? '<div class="page-break"></div>' : ''}

    ${showTeacher ? `
      <div class="answer-key-header">
        <div class="answer-key-title">Teacher Answer Key & Scoring Guide</div>
        <div class="grade-subject">${ws.schoolName} | ${ws.grade} — ${ws.subject}</div>
        <div class="topic-subtopic">${ws.title} (Total Points: ${ws.totalPoints})</div>
      </div>

      <div class="instructions-box" style="border-left-color: #047857; background: #ecfdf5;">
        <strong>Grading Policy:</strong> Award full points for correct responses. For open-ended or reasoning tasks, accept equivalent student rationale that demonstrates conceptual understanding.
      </div>

      ${ws.answerKey.map(sec => `
        <div class="section">
          <div class="ak-section-title">SECTION ${sec.sectionLetter}: ${sec.sectionTitle}</div>
          ${sec.answers.map(ans => `
            <div class="ak-item">
              <span class="ak-num">${ans.number}.</span> <strong>${ans.solution}</strong> ${ans.points ? `(${ans.points} ${ans.points === 1 ? 'pt' : 'pts'})` : ''}
              ${ans.criteria ? `<div class="ak-criteria">${ans.criteria}</div>` : ''}
            </div>
          `).join('')}
        </div>
      `).join('')}
    ` : ''}
  </div>

  <script>
    window.onload = function() {
      window.print();
      setTimeout(function() {
        // Leave open if print cancelled
      }, 1000);
    };
  </script>
</body>
</html>
  `;
}

export function printWorksheetToWindow(
  ws: StructuredWorksheet,
  mode: 'student' | 'teacher' | 'both' = 'student'
): void {
  const html = generateWorksheetPrintHtml(ws, mode);
  const printWindow = window.open('', '_blank', 'width=900,height=800');
  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  }
}

// ============================================================================
// GEMINI AI PROMPT SPECIFICATION BUILDER
// ============================================================================

export function buildGlobalWorksheetAIPrompt(context: {
  subject: string;
  grade: string;
  topic: string;
  subtopic?: string;
  generalObjective?: string;
  specificObjectives?: string;
}): string {
  return `You are generating an official student practice worksheet and matching teacher answer key for the Belize Primary Education System.

STRICT GLOBAL WORKSHEET FORMATTING STANDARD:
1. SCHOOL & HEADER:
   - School: SAN JUAN BOSCO R.C. SCHOOL
   - Grade: ${context.grade}
   - Subject: ${context.subject}
   - Topic: ${context.topic}${context.subtopic ? ` (Subtopic: ${context.subtopic})` : ''}
   - Objectives: ${context.specificObjectives || context.generalObjective || 'Curriculum mastery'}

2. NUMBERING RULES (CRITICAL):
   - NEVER number metadata (Name, Date, Score, Grade, Subject, Topic, Teacher).
   - NEVER number general or section instructions.
   - NEVER number section headings (e.g. Do NOT output "1. Section A").
   - ONLY actual student questions/tasks receive question numbers!
   - Number questions sequentially throughout the ENTIRE worksheet: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10...
   - DO NOT restart question numbering at each section!

3. SECTIONS & STRUCTURE:
   Use 2 to 3 lettered sections adapted to ${context.subject}:
   - Section A: UNDERSTANDING THE CONCEPT (Foundational recall, vocabulary, or direct skills)
   - Section B: APPLY WHAT YOU KNOW (Contextual problems, application tasks, word problems)
   - Section C: REASONING & CHALLENGE (Open-ended analysis, justification, synthesis)

4. QUESTION TYPES & SUBJECT ADAPTATION:
   - For Mathematics: Word problems, calculation tasks, tables, show-working prompts.
   - For English Language: Reading excerpts, morphology (prefix/root/suffix), comprehension, sentence construction.
   - For Science: Observations, diagram labeling, experimental reasoning, classification.
   - For Social Studies: Belizean geography/culture/history analysis, map/timeline tasks.
   - Age-appropriate complexity for ${context.grade}.
   - Situations relevant to Belize where appropriate.

5. ACCURATE SCORING & TEACHER ANSWER KEY:
   - Total questions must equal the total score (e.g., 8 questions = Score: ______ / 8; 10 questions = Score: ______ / 10).
   - At the bottom, include a dedicated "### TEACHER ANSWER KEY & SCORING GUIDE" section.
   - The answer key must use the EXACT SAME sequential numbers (1, 2, 3...) as the worksheet!
   - Provide concrete solutions and scoring criteria for every single question.

Output the entire worksheet in clean Markdown adhering strictly to this format without any numbered headings or metadata.`;
}
