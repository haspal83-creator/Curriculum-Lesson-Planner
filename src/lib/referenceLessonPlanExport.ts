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
  LessonResourceNew 
} from '../types';
import { 
  resolveCompleteLessonResources, 
  validateLessonExport, 
  OFFICIAL_SCHOOL_NAME, 
  sanitizeExportText, 
  ResolvedLessonResources 
} from './lessonExportResolver';

// ==========================================
// COLOR PALETTE & DESIGN CONSTANTS
// ==========================================
const PRIMARY_NAVY = '1E3A8A';   // Deep Academic Navy
const TEXT_MAIN = '1E293B';      // Slate 800
const TEXT_MUTED = '475569';     // Slate 600
const SUCCESS_COLOR = '047857';  // Emerald 700

// Reference Table Grid Borders & Margins
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

function clean(text: any): string {
  return sanitizeExportText(text);
}

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
        children: [new TextRun({ text: clean(line), size: 20, color: '000000' })]
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
    cantSplit: false, // Natural pagination across pages
    children: [
      createMasterLabelCell(label),
      createMasterContentCell(content)
    ]
  });
}

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
        text: clean(text),
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
        text: clean(text),
        size: 22, // 11pt
        color: TEXT_MAIN
      })
    ]
  });
}

function createGenericCell(
  content: string | Paragraph | Paragraph[],
  widthPercent: number,
  options?: { isHeader?: boolean; isLabel?: boolean }
): TableCell {
  let children: Paragraph[] = [];
  if (typeof content === 'string') {
    children = [
      new Paragraph({
        spacing: { before: 30, after: 30, line: 260 },
        children: [
          new TextRun({
            text: clean(content),
            bold: options?.isHeader || options?.isLabel,
            size: options?.isHeader ? 21 : 20,
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
    borders: masterTableBorders,
    margins: masterCellMargins,
    children
  });
}

/**
 * Downloads a docx Document as a file
 */
export async function downloadDocxDocument(doc: Document, fileName: string): Promise<void> {
  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${clean(fileName).replace(/[\s/\\?%*:|"<>]+/g, '_')}.docx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Builds the authoritative Microsoft Word (.docx) Document
 * matching "Monday 8th mathematics Daily Plan.docx"
 */
export function buildReferenceLessonPlanDocx(
  plan: LessonPlan, 
  teacherName?: string, 
  schoolName?: string
): Document {
  // 1. Resolve all complete lesson resources using unified single source of truth
  const res: ResolvedLessonResources = resolveCompleteLessonResources(plan, { schoolName, teacherName });

  // 2. Validate lesson export
  const validation = validateLessonExport(res);
  if (!validation.isValid) {
    console.warn("Export validation warnings/errors:", validation.errors);
  }

  // Determine authentic Subject & Centered Heading Style
  const subjectDisplay = clean(res.subject || plan.subject || 'Mathematics');
  const headingTitle = `${subjectDisplay} Daily Plan`;

  // Determine teacher name from settings / plan (preserve real user name)
  const actualTeacherName = clean(
    plan.studentTeacherName || 
    teacherName || 
    (plan as any).teacherName || 
    (plan as any).createdBy || 
    res.teacherName || 
    'Student Teacher'
  );

  // Determine date assigned to the lesson
  const actualDate = clean(
    res.dateStr || 
    plan.date || 
    (plan as any).lessonDate || 
    new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
  );

  // Class level, size, age range
  const classLevel = clean(res.grade || plan.grade || (plan as any).class_level || (plan as any).classLevel || 'Standard 4');
  const classSize = clean(plan.classSize || (plan as any).class_size || (plan as any).classSize || '25-30 Students');
  const ageRange = clean(plan.ageRange || (plan as any).age_range || (plan as any).ageRange || getDefaultAgeRange(classLevel));

  // Time & Duration
  const timeAndDuration = clean(res.duration || plan.duration || '45 mins');

  // Sub-topic
  const subtopicVal = clean(
    (res.subtopic && res.subtopic !== 'Not provided' ? res.subtopic : '') || 
    plan.subtopic || 
    res.topic
  );

  // Content standard / strands
  const standardVal = clean(
    res.strand 
      ? `Strand: ${res.strand}${res.curriculumCode ? ` | Code: ${res.curriculumCode}` : ''}` 
      : (plan.strand ? `Strand: ${plan.strand}` : 'Belize National Primary Curriculum Framework Standards')
  );

  // Targeted core-competencies
  const competenciesVal = clean(
    res.competencies || 
    (plan as any).competencies || 
    (plan as any).targetedCoreCompetencies || 
    (plan as any).coreCompetencies || 
    'Critical Thinking, Communication, Collaboration, Problem Solving'
  );

  // Previous Knowledge
  const previousKnowledgeVal = clean(
    res.priorKnowledge || 
    plan.previousKnowledge || 
    plan.priorKnowledgeActivation?.whatTheyKnow || 
    'Students have acquired foundational understanding and prerequisite skills relevant to this lesson.'
  );

  // Behavioral Objectives Paragraphs
  const behavioralObjParagraphs: Paragraph[] = [];
  if (res.condition && res.condition !== 'Not provided') {
    behavioralObjParagraphs.push(
      new Paragraph({
        spacing: { before: 20, after: 40, line: 240 },
        children: [
          new TextRun({ text: "Condition: ", bold: true, size: 20 }),
          new TextRun({ text: clean(res.condition), size: 20, italics: true })
        ]
      })
    );
  }
  if (res.cognitive && res.cognitive !== 'Not provided') {
    behavioralObjParagraphs.push(
      new Paragraph({
        bullet: { level: 0 },
        spacing: { before: 10, after: 20, line: 240 },
        children: [
          new TextRun({ text: "Cognitive: ", bold: true, size: 20 }),
          new TextRun({ text: clean(res.cognitive), size: 20 })
        ]
      })
    );
  }
  if (res.psychomotor && res.psychomotor !== 'Not provided') {
    behavioralObjParagraphs.push(
      new Paragraph({
        bullet: { level: 0 },
        spacing: { before: 10, after: 20, line: 240 },
        children: [
          new TextRun({ text: "Psychomotor / Skills: ", bold: true, size: 20 }),
          new TextRun({ text: clean(res.psychomotor), size: 20 })
        ]
      })
    );
  }
  if (res.affective && res.affective !== 'Not provided') {
    behavioralObjParagraphs.push(
      new Paragraph({
        bullet: { level: 0 },
        spacing: { before: 10, after: 20, line: 240 },
        children: [
          new TextRun({ text: "Affective: ", bold: true, size: 20 }),
          new TextRun({ text: clean(res.affective), size: 20 })
        ]
      })
    );
  }
  if (Array.isArray(plan.specificObjectives) && plan.specificObjectives.length > 0) {
    plan.specificObjectives.forEach(obj => {
      const cleaned = clean(obj);
      if (cleaned && !behavioralObjParagraphs.some(p => p.toString().includes(cleaned))) {
        behavioralObjParagraphs.push(
          new Paragraph({
            bullet: { level: 0 },
            spacing: { before: 10, after: 20, line: 240 },
            children: [new TextRun({ text: cleaned, size: 20 })]
          })
        );
      }
    });
  }

  // Content/concepts Paragraphs
  const contentParagraphs: Paragraph[] = [];
  if (res.lessonDescription) {
    contentParagraphs.push(
      new Paragraph({
        spacing: { before: 20, after: 40, line: 240 },
        children: [new TextRun({ text: clean(res.lessonDescription), size: 20 })]
      })
    );
  }
  if (res.vocabularyList && res.vocabularyList.length > 0) {
    contentParagraphs.push(
      new Paragraph({
        spacing: { before: 40, after: 20, line: 240 },
        children: [new TextRun({ text: "Key Terminology & Definitions:", bold: true, size: 20 })]
      })
    );
    res.vocabularyList.forEach(v => {
      contentParagraphs.push(
        new Paragraph({
          bullet: { level: 0 },
          spacing: { before: 10, after: 10, line: 240 },
          children: [
            new TextRun({ text: `${clean(v.term)}: `, bold: true, size: 20 }),
            new TextRun({ text: clean(v.definition), size: 20 })
          ]
        })
      );
    });
  }

  // Curricular Linkages Paragraphs
  const linkagesParagraphs: Paragraph[] = [];
  const explicitLinkages = (plan as any).curricularLinkages || (plan as any).crossCurricularLinkages || (plan as any).curricular_linkages;
  if (explicitLinkages) {
    if (Array.isArray(explicitLinkages)) {
      explicitLinkages.forEach((link: any) => {
        linkagesParagraphs.push(
          new Paragraph({
            bullet: { level: 0 },
            spacing: { before: 10, after: 10, line: 240 },
            children: [new TextRun({ text: clean(link), size: 20 })]
          })
        );
      });
    } else {
      linkagesParagraphs.push(
        new Paragraph({
          spacing: { before: 20, after: 20, line: 240 },
          children: [new TextRun({ text: clean(explicitLinkages), size: 20 })]
        })
      );
    }
  } else {
    const sLow = subjectDisplay.toLowerCase();
    if (sLow.includes('math')) {
      linkagesParagraphs.push(
        new Paragraph({
          bullet: { level: 0 },
          spacing: { before: 10, after: 10, line: 240 },
          children: [
            new TextRun({ text: "Language Arts: ", bold: true, size: 20 }),
            new TextRun({ text: "Interpreting word problem phrasing, learning mathematical academic vocabulary, and verbalizing problem-solving logic.", size: 20 })
          ]
        }),
        new Paragraph({
          bullet: { level: 0 },
          spacing: { before: 10, after: 10, line: 240 },
          children: [
            new TextRun({ text: "Science & Technology: ", bold: true, size: 20 }),
            new TextRun({ text: "Collecting measurement data, calculating quantities, and recording experimental findings.", size: 20 })
          ]
        }),
        new Paragraph({
          bullet: { level: 0 },
          spacing: { before: 10, after: 10, line: 240 },
          children: [
            new TextRun({ text: "Social Studies & Belizean Life: ", bold: true, size: 20 }),
            new TextRun({ text: "Practical financial transactions, budgeting, market pricing, and community trade applications in Belize.", size: 20 })
          ]
        })
      );
    } else if (sLow.includes('science')) {
      linkagesParagraphs.push(
        new Paragraph({
          bullet: { level: 0 },
          spacing: { before: 10, after: 10, line: 240 },
          children: [
            new TextRun({ text: "Mathematics: ", bold: true, size: 20 }),
            new TextRun({ text: "Measurement of environmental variables, calculating quantities, and tabulating scientific observations.", size: 20 })
          ]
        }),
        new Paragraph({
          bullet: { level: 0 },
          spacing: { before: 10, after: 10, line: 240 },
          children: [
            new TextRun({ text: "Language Arts: ", bold: true, size: 20 }),
            new TextRun({ text: "Reading scientific texts, forming hypothesis statements, and writing Claim-Evidence-Reasoning explanations.", size: 20 })
          ]
        }),
        new Paragraph({
          bullet: { level: 0 },
          spacing: { before: 10, after: 10, line: 240 },
          children: [
            new TextRun({ text: "Social Studies & Environmental Stewardship: ", bold: true, size: 20 }),
            new TextRun({ text: "Preservation of Belizean ecosystems (mangroves, pine ridge, barrier reef) and sustainable resource management.", size: 20 })
          ]
        })
      );
    } else {
      linkagesParagraphs.push(
        new Paragraph({
          bullet: { level: 0 },
          spacing: { before: 10, after: 10, line: 240 },
          children: [
            new TextRun({ text: "Social Studies: ", bold: true, size: 20 }),
            new TextRun({ text: "Engaging with texts exploring Belizean culture, history, national heroes, and civic responsibilities.", size: 20 })
          ]
        }),
        new Paragraph({
          bullet: { level: 0 },
          spacing: { before: 10, after: 10, line: 240 },
          children: [
            new TextRun({ text: "Science: ", bold: true, size: 20 }),
            new TextRun({ text: "Comprehending non-fiction expository structures, environmental narratives, and cause-and-effect sequences.", size: 20 })
          ]
        }),
        new Paragraph({
          bullet: { level: 0 },
          spacing: { before: 10, after: 10, line: 240 },
          children: [
            new TextRun({ text: "Creative Arts: ", bold: true, size: 20 }),
            new TextRun({ text: "Dramatization, character analysis, and visual diagramming of narrative story maps.", size: 20 })
          ]
        })
      );
    }
  }

  // Teaching-Learning Resources Paragraphs
  const resourcesParagraphs: Paragraph[] = [];
  if (res.materialsList && res.materialsList.length > 0) {
    res.materialsList.forEach(m => {
      resourcesParagraphs.push(
        new Paragraph({
          bullet: { level: 0 },
          spacing: { before: 10, after: 10, line: 240 },
          children: [
            new TextRun({ text: clean(m.name), bold: true, size: 20 }),
            ...(m.purpose ? [new TextRun({ text: ` — ${clean(m.purpose)}`, size: 20 })] : [])
          ]
        })
      );
    });
  } else if (Array.isArray(plan.materials) && plan.materials.length > 0) {
    plan.materials.forEach(m => {
      resourcesParagraphs.push(
        new Paragraph({
          bullet: { level: 0 },
          spacing: { before: 10, after: 10, line: 240 },
          children: [new TextRun({ text: clean(m), size: 20 })]
        })
      );
    });
  } else {
    resourcesParagraphs.push(
      new Paragraph({
        spacing: { before: 20, after: 20, line: 240 },
        children: [new TextRun({ text: "Whiteboard/chalkboard, student notebooks, teacher visual guide, instructional manipulatives, student activity sheets.", size: 20 })]
      })
    );
  }

  // References
  const referencesVal = clean(
    plan.source || 
    (plan as any).references || 
    'Belize National Primary Curriculum Framework; Ministry of Education, Culture, Science & Technology (MoECST); Belize National Teaching Resources and Teacher Reference Guides.'
  );

  // Methodology
  const methodologyVal = clean(
    res.methodology || 
    res.teachingStrategy || 
    plan.methodology || 
    'Guided Discovery, Interactive Modeling (I Do, We Do, You Do), Collaborative Inquiry, and Formative Assessment'
  );

  // Procedure (Single cell containing full sequential instructional execution)
  const procedureParagraphs: Paragraph[] = [];
  res.stages.forEach((stage, idx) => {
    procedureParagraphs.push(
      new Paragraph({
        spacing: { before: idx === 0 ? 30 : 120, after: 40, line: 240 },
        children: [
          new TextRun({
            text: `${stage.title}${stage.duration ? ` (${stage.duration})` : ''}`,
            bold: true,
            size: 21,
            color: '000000'
          })
        ]
      })
    );

    if (stage.teacherActions && stage.teacherActions.length > 0) {
      procedureParagraphs.push(
        new Paragraph({
          spacing: { before: 20, after: 10, line: 240 },
          children: [
            new TextRun({ text: "Teacher Actions:", bold: true, size: 20, italics: true })
          ]
        })
      );
      stage.teacherActions.forEach(act => {
        procedureParagraphs.push(
          new Paragraph({
            bullet: { level: 0 },
            spacing: { before: 10, after: 10, line: 240 },
            indent: { left: 240 },
            children: [new TextRun({ text: clean(act), size: 20 })]
          })
        );
      });
    }

    if (stage.studentActions && stage.studentActions.length > 0) {
      procedureParagraphs.push(
        new Paragraph({
          spacing: { before: 20, after: 10, line: 240 },
          children: [
            new TextRun({ text: "Student Actions:", bold: true, size: 20, italics: true })
          ]
        })
      );
      stage.studentActions.forEach(act => {
        procedureParagraphs.push(
          new Paragraph({
            bullet: { level: 0 },
            spacing: { before: 10, after: 10, line: 240 },
            indent: { left: 240 },
            children: [new TextRun({ text: clean(act), size: 20 })]
          })
        );
      });
    }

    if (stage.keyQuestions && stage.keyQuestions.length > 0) {
      procedureParagraphs.push(
        new Paragraph({
          spacing: { before: 20, after: 10, line: 240 },
          children: [
            new TextRun({ text: "Key Question(s) / Checks:", bold: true, size: 20, italics: true })
          ]
        })
      );
      stage.keyQuestions.forEach(q => {
        procedureParagraphs.push(
          new Paragraph({
            bullet: { level: 0 },
            spacing: { before: 10, after: 10, line: 240 },
            indent: { left: 240 },
            children: [new TextRun({ text: clean(q), size: 20 })]
          })
        );
      });
    }

    if (stage.assessment && stage.assessment !== 'Not provided') {
      procedureParagraphs.push(
        new Paragraph({
          spacing: { before: 20, after: 20, line: 240 },
          indent: { left: 240 },
          children: [
            new TextRun({ text: "Assessment & Check: ", bold: true, size: 20 }),
            new TextRun({ text: clean(stage.assessment), size: 20 })
          ]
        })
      );
    }
  });

  // Conclusion (summative assessment activity)
  const conclusionParagraphs: Paragraph[] = [];
  const exitPrompt = res.exitTicket?.prompt || (res.assessment?.exitTicket) || (plan.closurePanel?.exitQuestion);
  const closureItems = res.closure && res.closure.length > 0 ? res.closure : (plan.closurePanel?.recap ? [plan.closurePanel.recap] : []);

  if (closureItems.length > 0) {
    closureItems.forEach(item => {
      conclusionParagraphs.push(
        new Paragraph({
          bullet: { level: 0 },
          spacing: { before: 10, after: 10, line: 240 },
          children: [new TextRun({ text: clean(item), size: 20 })]
        })
      );
    });
  }
  if (exitPrompt) {
    conclusionParagraphs.push(
      new Paragraph({
        spacing: { before: 20, after: 20, line: 240 },
        children: [
          new TextRun({ text: "Summative Assessment Activity / Exit Ticket: ", bold: true, size: 20 }),
          new TextRun({ text: clean(exitPrompt), size: 20 })
        ]
      })
    );
  }
  if (conclusionParagraphs.length === 0) {
    conclusionParagraphs.push(
      new Paragraph({
        spacing: { before: 20, after: 20, line: 240 },
        children: [new TextRun({ text: "Synthesize lesson key concepts, review student responses on formative exit check, and address common misconceptions before dismissal.", size: 20 })]
      })
    );
  }

  // Differentiation
  const diffParagraphs: Paragraph[] = [];
  diffParagraphs.push(
    new Paragraph({
      spacing: { before: 20, after: 10, line: 240 },
      children: [new TextRun({ text: "Struggling Learners (Support / Tier 1):", bold: true, size: 20 })]
    })
  );
  const struggling = res.differentiation.strugglingLearners && res.differentiation.strugglingLearners.length > 0 
    ? res.differentiation.strugglingLearners 
    : ["Provide concrete manipulatives, visual graphic organizers, step-by-step scaffolded prompts, and guided small-group instruction."];
  struggling.forEach(item => {
    diffParagraphs.push(
      new Paragraph({
        bullet: { level: 0 },
        spacing: { before: 10, after: 10, line: 240 },
        indent: { left: 240 },
        children: [new TextRun({ text: clean(item), size: 20 })]
      })
    );
  });

  diffParagraphs.push(
    new Paragraph({
      spacing: { before: 30, after: 10, line: 240 },
      children: [new TextRun({ text: "On-Level Learners (Core / Tier 2):", bold: true, size: 20 })]
    })
  );
  const onLevel = res.differentiation.onLevelLearners && res.differentiation.onLevelLearners.length > 0 
    ? res.differentiation.onLevelLearners 
    : ["Complete standard independent exercises, participate in peer problem solving, and justify reasoning in student notebooks."];
  onLevel.forEach(item => {
    diffParagraphs.push(
      new Paragraph({
        bullet: { level: 0 },
        spacing: { before: 10, after: 10, line: 240 },
        indent: { left: 240 },
        children: [new TextRun({ text: clean(item), size: 20 })]
      })
    );
  });

  diffParagraphs.push(
    new Paragraph({
      spacing: { before: 30, after: 10, line: 240 },
      children: [new TextRun({ text: "Advanced Learners (Extension / Tier 3):", bold: true, size: 20 })]
    })
  );
  const advanced = res.differentiation.advancedLearners && res.differentiation.advancedLearners.length > 0 
    ? res.differentiation.advancedLearners 
    : ["Work on non-routine extension challenges, real-world analytical problems, higher-order reasoning prompts, and peer tutoring leadership tasks."];
  advanced.forEach(item => {
    diffParagraphs.push(
      new Paragraph({
        bullet: { level: 0 },
        spacing: { before: 10, after: 10, line: 240 },
        indent: { left: 240 },
        children: [new TextRun({ text: clean(item), size: 20 })]
      })
    );
  });

  // Extended Activity
  const extendedParagraphs: Paragraph[] = [];
  if (res.extensionActivity && res.extensionActivity.hasActivity) {
    if (res.extensionActivity.title) {
      extendedParagraphs.push(
        new Paragraph({
          spacing: { before: 20, after: 20, line: 240 },
          children: [new TextRun({ text: clean(res.extensionActivity.title), bold: true, size: 20 })]
        })
      );
    }
    if (res.extensionActivity.instructions) {
      extendedParagraphs.push(
        new Paragraph({
          spacing: { before: 10, after: 20, line: 240 },
          children: [new TextRun({ text: clean(res.extensionActivity.instructions), size: 20, italics: true })]
        })
      );
    }
    res.extensionActivity.tasks.forEach(task => {
      extendedParagraphs.push(
        new Paragraph({
          bullet: { level: 0 },
          spacing: { before: 10, after: 10, line: 240 },
          children: [new TextRun({ text: clean(task), size: 20 })]
        })
      );
    });
  } else if (plan.homeworkExtension?.task) {
    extendedParagraphs.push(
      new Paragraph({
        spacing: { before: 20, after: 20, line: 240 },
        children: [
          new TextRun({ text: "Homework / Home-School Investigation: ", bold: true, size: 20 }),
          new TextRun({ text: clean(plan.homeworkExtension.task), size: 20 })
        ]
      })
    );
  } else {
    extendedParagraphs.push(
      new Paragraph({
        spacing: { before: 20, after: 20, line: 240 },
        children: [new TextRun({ text: "Students apply lesson principles to solve an authentic real-world problem at home and record findings in their personal notebooks.", size: 20 })]
      })
    );
  }

  // Lesson Evaluation
  const evalParagraphs: Paragraph[] = [];
  evalParagraphs.push(
    new Paragraph({
      spacing: { before: 20, after: 10, line: 240 },
      children: [new TextRun({ text: "Strengths:", bold: true, size: 20 })]
    }),
    new Paragraph({
      bullet: { level: 0 },
      spacing: { before: 10, after: 10, line: 240 },
      indent: { left: 240 },
      children: [
        new TextRun({
          text: clean(res.reflection?.whatWorked || "High student engagement during interactive modeling and guided practice; students demonstrated clear mastery of core behavioral objectives."),
          size: 20
        })
      ]
    }),
    new Paragraph({
      spacing: { before: 20, after: 10, line: 240 },
      children: [new TextRun({ text: "Weaknesses / Anticipated Challenges:", bold: true, size: 20 })]
    }),
    new Paragraph({
      bullet: { level: 0 },
      spacing: { before: 10, after: 10, line: 240 },
      indent: { left: 240 },
      children: [
        new TextRun({
          text: clean(res.reflection?.challenges || "Pacing during independent work required careful oversight; certain learners required additional scaffolding with concrete visual aids."),
          size: 20
        })
      ]
    }),
    new Paragraph({
      spacing: { before: 20, after: 10, line: 240 },
      children: [new TextRun({ text: "Recommendations / Next Steps:", bold: true, size: 20 })]
    }),
    new Paragraph({
      bullet: { level: 0 },
      spacing: { before: 10, after: 10, line: 240 },
      indent: { left: 240 },
      children: [
        new TextRun({
          text: clean(res.reflection?.adjustments || res.reflection?.nextSteps || "Begin subsequent lesson with a 5-minute spiral warm-up to consolidate key concepts; provide targeted station tasks for consolidating skills."),
          size: 20
        })
      ]
    })
  );

  // BUILD THE EXACT 24 ROWS IN MASTER ORDER
  const masterRows: TableRow[] = [
    createMasterRow("Student Teacher Name", actualTeacherName),
    createMasterRow("Date", actualDate),
    createMasterRow("Subject", subjectDisplay),
    createMasterRow("Topic", clean(res.topic || plan.topic || 'Lesson Topic')),
    createMasterRow("Sub-topic", subtopicVal),
    createMasterRow("Class Level", classLevel),
    createMasterRow("Class size", classSize),
    createMasterRow("Age range", ageRange),
    createMasterRow("Time & Duration", timeAndDuration),
    createMasterRow("Previous Knowledge", previousKnowledgeVal),
    createMasterRow("Targeted core-competency(ies)", competenciesVal),
    createMasterRow("Content Standard/content strands", standardVal),
    createMasterRow("Learning Outcome(s)", clean(res.learningOutcome || plan.learningOutcome || 'Demonstrate mastery of lesson concepts and skills.')),
    createMasterRow("Behavioral Objectives", behavioralObjParagraphs),
    createMasterRow("Content/concepts", contentParagraphs),
    createMasterRow("Curricular Linkages", linkagesParagraphs),
    createMasterRow("Teaching-Learning Resources", resourcesParagraphs),
    createMasterRow("References", referencesVal),
    createMasterRow("Methodology", methodologyVal),
    createMasterRow("Procedure", procedureParagraphs),
    createMasterRow("Conclusion (summative assessment activity)", conclusionParagraphs),
    createMasterRow("Differentiation", diffParagraphs),
    createMasterRow("Extended Activity", extendedParagraphs),
    createMasterRow("Lesson Evaluation", evalParagraphs)
  ];

  // The Main Two-Column Table Grid
  const masterTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: masterTableBorders,
    rows: masterRows
  });

  // Centered Subject Daily Plan Heading
  const headingParagraph = new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 160 },
    children: [
      new TextRun({
        text: headingTitle,
        bold: true,
        size: 28, // 14pt bold
        color: '000000'
      })
    ]
  });

  // SUPPORTING MATERIALS PLACED AFTER MAIN TABLE (Requirement 5)
  const supportingChildren: (Paragraph | Table)[] = [];

  // 1. Student Practice Worksheet (if present)
  if (res.worksheet && res.worksheet.hasWorksheet) {
    supportingChildren.push(
      new Paragraph({ children: [new PageBreak()] }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 40, after: 20 },
        children: [
          new TextRun({
            text: res.schoolName,
            bold: true,
            size: 22,
            color: PRIMARY_NAVY
          })
        ]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 60 },
        children: [
          new TextRun({
            text: res.worksheet.title,
            bold: true,
            size: 28,
            color: PRIMARY_NAVY
          })
        ]
      }),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: masterTableBorders,
        rows: [
          new TableRow({
            children: [
              createGenericCell("Name: ____________________________________", 40),
              createGenericCell("Date: ____________________", 35),
              createGenericCell(`Score: _______ / ${res.worksheet.totalPoints || res.worksheet.totalQuestions || 10}`, 25, { isLabel: true })
            ]
          })
        ]
      }),
      new Paragraph({
        spacing: { before: 120, after: 80 },
        children: [
          new TextRun({ text: "Instructions: ", bold: true, size: 21, color: PRIMARY_NAVY }),
          new TextRun({ text: res.worksheet.instructions, size: 21, italics: true })
        ]
      }),
      ...res.worksheet.sections.flatMap(sec => [
        createSubheading(`SECTION ${sec.sectionLetter || ''}: ${sec.sectionTitle.toUpperCase()}`, 160),
        ...(sec.instructions ? [
          new Paragraph({
            spacing: { before: 20, after: 60 },
            children: [new TextRun({ text: sec.instructions, size: 20, italics: true, color: TEXT_MUTED })]
          })
        ] : []),
        ...sec.questions.map(q => new Paragraph({
          spacing: { before: 40, after: 60 },
          children: [
            new TextRun({ text: `${q.number}. `, bold: true, size: 20, color: PRIMARY_NAVY }),
            new TextRun({ text: q.prompt, size: 20 })
          ]
        }))
      ]),
      ...(res.worksheet.answerKey && res.worksheet.answerKey.length > 0 ? [
        createSectionHeading("Worksheet Teacher Answer Key & Scoring Guide", 240),
        ...res.worksheet.answerKey.flatMap(akSec => [
          createSubheading(`SECTION ${akSec.sectionLetter || ''}: ${akSec.sectionTitle.toUpperCase()}`, 120),
          ...akSec.answers.map(ans => new Paragraph({
            spacing: { before: 20, after: 40 },
            children: [
              new TextRun({ text: `${ans.number}. `, bold: true, size: 20, color: SUCCESS_COLOR }),
              new TextRun({ text: ans.solution, size: 20, bold: true }),
              ...(ans.criteria ? [
                new TextRun({ text: ` [${ans.criteria}]`, size: 18, italics: true, color: TEXT_MUTED })
              ] : [])
            ]
          }))
        ])
      ] : [])
    );
  }

  // 2. Reading Passage (if present)
  if (res.readingPassage && res.readingPassage.hasPassage) {
    supportingChildren.push(
      new Paragraph({ children: [new PageBreak()] }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 40, after: 20 },
        children: [
          new TextRun({
            text: "OFFICIAL STUDENT READING PASSAGE",
            bold: true,
            size: 20,
            color: TEXT_MUTED
          })
        ]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 60 },
        children: [
          new TextRun({
            text: res.readingPassage.title,
            bold: true,
            size: 28,
            color: PRIMARY_NAVY
          })
        ]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 120 },
        children: [
          new TextRun({
            text: `Grade Level: ${res.readingPassage.gradeLevel}  |  Genre: ${res.readingPassage.genre}  |  Word Count: ${res.readingPassage.wordCount} words`,
            size: 20,
            color: TEXT_MUTED
          })
        ]
      }),
      ...res.readingPassage.paragraphs.map(p => new Paragraph({
        spacing: { before: 40, after: 80, line: 280 },
        children: [new TextRun({ text: p, size: 21 })]
      })),
      createSectionHeading("Reading Passage Comprehension & Analysis Questions", 200),
      ...res.readingPassage.comprehensionQuestions.flatMap(cq => [
        new Paragraph({
          spacing: { before: 60, after: 30 },
          children: [
            new TextRun({ text: `${cq.number}. [${cq.cognitiveLevel}]: `, bold: true, size: 20, color: PRIMARY_NAVY }),
            new TextRun({ text: cq.question, size: 20 })
          ]
        }),
        new Paragraph({
          spacing: { before: 30, after: 80 },
          children: [
            new TextRun({ text: "Student Response: _____________________________________________________________________________", size: 18, color: TEXT_MUTED })
          ]
        })
      ]),
      createSectionHeading("Reading Passage Answer Key", 200),
      ...res.readingPassage.comprehensionQuestions.map(cq => new Paragraph({
        spacing: { before: 30, after: 40 },
        children: [
          new TextRun({ text: `Question ${cq.number} Key: `, bold: true, size: 20, color: PRIMARY_NAVY }),
          new TextRun({ text: cq.answer, size: 20 })
        ]
      }))
    );
  }

  // 3. Anchor Chart Blueprint (if present)
  if (res.anchorChart && res.anchorChart.hasChart) {
    supportingChildren.push(
      new Paragraph({ children: [new PageBreak()] }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 40, after: 20 },
        children: [
          new TextRun({
            text: "CLASSROOM ANCHOR CHART BLUEPRINT",
            bold: true,
            size: 20,
            color: TEXT_MUTED
          })
        ]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 60 },
        children: [
          new TextRun({
            text: res.anchorChart.title,
            bold: true,
            size: 28,
            color: PRIMARY_NAVY
          })
        ]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 120 },
        children: [
          new TextRun({
            text: res.anchorChart.headerText,
            bold: true,
            size: 22,
            color: PRIMARY_NAVY
          })
        ]
      }),
      ...(res.anchorChart.tableRows && res.anchorChart.tableRows.length > 0 ? [
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: masterTableBorders,
          rows: [
            new TableRow({
              children: res.anchorChart.tableHeaders.map((th, i) => 
                createGenericCell(th, i === 0 ? 20 : i === 1 ? 25 : i === 2 ? 25 : 30, { isHeader: true })
              )
            }),
            ...res.anchorChart.tableRows.map(row => new TableRow({
              children: [
                createGenericCell(row.col1, 20, { isLabel: true }),
                createGenericCell(row.col2, 25),
                createGenericCell(row.col3, 25),
                createGenericCell(row.col4, 30)
              ]
            }))
          ]
        })
      ] : []),
      createSectionHeading("Core Rules & Key Takeaway", 200),
      ...res.anchorChart.keyRulesOrDefinitions.map(rule => createBullet(rule)),
      createParagraph(res.anchorChart.visualDiagramDescription)
    );
  }

  // 4. Exit Ticket Handout (if present)
  if (res.exitTicket && res.exitTicket.hasTicket) {
    supportingChildren.push(
      new Paragraph({ children: [new PageBreak()] }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 40, after: 20 },
        children: [
          new TextRun({
            text: res.schoolName,
            bold: true,
            size: 22,
            color: PRIMARY_NAVY
          })
        ]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 60 },
        children: [
          new TextRun({
            text: res.exitTicket.title,
            bold: true,
            size: 28,
            color: PRIMARY_NAVY
          })
        ]
      }),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: masterTableBorders,
        rows: [
          new TableRow({
            children: [
              createGenericCell("Name: ____________________________________", 40),
              createGenericCell("Date: ____________________", 35),
              createGenericCell(`Score: _______ / ${res.exitTicket.questions.length}`, 25, { isLabel: true })
            ]
          })
        ]
      }),
      new Paragraph({
        spacing: { before: 80, after: 60 },
        children: [
          new TextRun({ text: "Prompt: ", bold: true, size: 21, color: PRIMARY_NAVY }),
          new TextRun({ text: res.exitTicket.prompt, size: 21, italics: true })
        ]
      }),
      ...res.exitTicket.questions.flatMap(q => [
        new Paragraph({
          spacing: { before: 40, after: 30 },
          children: [
            new TextRun({ text: `Question ${q.number} (${q.points} pt): `, bold: true, size: 21, color: PRIMARY_NAVY }),
            new TextRun({ text: q.question, size: 21 })
          ]
        }),
        new Paragraph({
          spacing: { before: 20, after: 80 },
          children: [
            new TextRun({ text: "Student Answer: _______________________________________________________________________________", size: 18, color: TEXT_MUTED })
          ]
        })
      ]),
      createSectionHeading("Exit Ticket Answer Key & Scoring Guidance", 200),
      ...res.exitTicket.questions.map(q => new Paragraph({
        spacing: { before: 20, after: 30 },
        children: [
          new TextRun({ text: `Question ${q.number} Key: `, bold: true, size: 20, color: PRIMARY_NAVY }),
          new TextRun({ text: q.answerKey, size: 20 })
        ]
      })),
      new Paragraph({
        spacing: { before: 30, after: 20 },
        children: [
          new TextRun({ text: "Scoring Guidance: ", bold: true, size: 19 }),
          new TextRun({ text: res.exitTicket.scoringGuidance, size: 19 })
        ]
      })
    );
  }

  // 5. Additional Generated Student Materials
  if (res.additionalAssets && res.additionalAssets.length > 0) {
    supportingChildren.push(
      new Paragraph({ children: [new PageBreak()] }),
      createSectionHeading("Additional Instructional Materials", 200),
      ...res.additionalAssets.flatMap(asset => [
        createSubheading(`${asset.title} (${asset.type})`, 120),
        createParagraph(asset.content),
        ...(asset.answerKey ? [
          new Paragraph({
            spacing: { before: 20, after: 60 },
            children: [
              new TextRun({ text: "Answer Key: ", bold: true, size: 20, color: SUCCESS_COLOR }),
              new TextRun({ text: asset.answerKey, size: 20 })
            ]
          })
        ] : [])
      ])
    );
  }

  // ASSEMBLE MASTER LANDSCAPE DOCUMENT
  // Width: 15840 dxa (11 in), Height: 12240 dxa (8.5 in)
  const doc = new Document({
    sections: [{
      properties: {
        page: {
          size: {
            orientation: PageOrientation.LANDSCAPE,
            width: 12240,
            height: 15840
          },
          margin: {
            top: 720,    // 0.5 in
            bottom: 720,
            left: 720,
            right: 720
          }
        }
      },
      headers: {
        default: new Header({
          children: [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              spacing: { before: 0, after: 40 },
              children: [
                new TextRun({
                  text: `${clean(res.schoolName || OFFICIAL_SCHOOL_NAME)}  |  ${classLevel} ${subjectDisplay}  |  ${clean(res.topic)}`,
                  size: 16,
                  color: '64748B'
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
              spacing: { before: 40, after: 0 },
              children: [
                new TextRun({ text: "Page ", size: 18, color: '64748B' }),
                new TextRun({ children: [PageNumber.CURRENT], size: 18, color: '64748B' }),
                new TextRun({ text: " of ", size: 18, color: '64748B' }),
                new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 18, color: '64748B' })
              ]
            })
          ]
        })
      },
      children: [
        headingParagraph,
        masterTable,
        ...supportingChildren
      ]
    }]
  });

  return doc;
}

/**
 * Master export function to download the reference DOCX file
 */
export async function exportReferenceLessonPlanToWord(
  plan: LessonPlan, 
  teacherName?: string, 
  schoolName?: string
): Promise<void> {
  const doc = buildReferenceLessonPlanDocx(plan, teacherName, schoolName);
  
  const res = resolveCompleteLessonResources(plan, { schoolName, teacherName });
  const actualDate = clean(
    res.dateStr || 
    plan.date || 
    (plan as any).lessonDate || 
    new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
  );
  const subjectDisplay = clean(res.subject || plan.subject || 'Mathematics');

  const exportFileName = `${actualDate}_${subjectDisplay}_Daily_Plan`;
  await downloadDocxDocument(doc, exportFileName);
}
