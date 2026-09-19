import jsPDF from 'jspdf';
import autoTable, { UserOptions } from 'jspdf-autotable';
import { 
  NormalizedWeeklyData, 
  normalizeWeeklyPlanForExport 
} from './weeklyPlanWordExport';
import { sanitizeExportText } from './lessonExportResolver';

// Color definitions (RGB)
const NAVY: [number, number, number] = [30, 58, 138];       // #1E3A8A
const TEXT_DARK: [number, number, number] = [30, 41, 59];   // #1E293B
const TEXT_MUTED: [number, number, number] = [71, 85, 105]; // #475569
const BG_HEADER: [number, number, number] = [241, 245, 249];// #F1F5F9
const BG_LABEL: [number, number, number] = [248, 250, 252]; // #F8FAFC
const BORDER_COLOR: [number, number, number] = [203, 213, 225]; // #CBD5E1

function clean(text: any, fallback = '—'): string {
  const s = sanitizeExportText(text);
  return s && s.trim().length > 0 ? s.trim() : fallback;
}

export async function exportWeeklyPlanToPdfDocument(
  normalized: NormalizedWeeklyData,
  fileNamePrefix = 'Weekly_Lesson_Plan'
): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'letter'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginX = 14;

  // ----------------------------------------------------
  // PAGE 1: SCHOOL HEADER & ADMINISTRATIVE OVERVIEW
  // ----------------------------------------------------
  let currentY = 18;

  // School Name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(...NAVY);
  doc.text(normalized.schoolName, pageWidth / 2, currentY, { align: 'center' });
  currentY += 5;

  // Ministry Line
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...TEXT_MUTED);
  doc.text("MINISTRY OF EDUCATION, CULTURE, SCIENCE & TECHNOLOGY — BELIZE", pageWidth / 2, currentY, { align: 'center' });
  currentY += 7;

  // Document Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(17);
  doc.setTextColor(...NAVY);
  doc.text("WEEKLY LESSON PLAN", pageWidth / 2, currentY, { align: 'center' });
  currentY += 6;

  // Unit / Topic
  doc.setFont('helvetica', 'bolditalic');
  doc.setFontSize(11);
  doc.setTextColor(...TEXT_DARK);
  doc.text(`Unit / Weekly Topic: ${normalized.topic}`, pageWidth / 2, currentY, { align: 'center' });
  currentY += 6;

  // Decorative divider
  doc.setDrawColor(...BORDER_COLOR);
  doc.setLineWidth(0.4);
  doc.line(marginX, currentY, pageWidth - marginX, currentY);
  currentY += 6;

  // Administrative Overview Table
  autoTable(doc, {
    startY: currentY,
    margin: { left: marginX, right: marginX },
    head: [[
      { content: 'ADMINISTRATIVE OVERVIEW', colSpan: 4, styles: { halign: 'center', fillColor: BG_HEADER, textColor: NAVY, fontStyle: 'bold' } }
    ]],
    body: [
      [
        { content: 'Academic Year', styles: { fontStyle: 'bold', fillColor: BG_LABEL, textColor: NAVY } },
        { content: normalized.academicYear },
        { content: 'Teacher', styles: { fontStyle: 'bold', fillColor: BG_LABEL, textColor: NAVY } },
        { content: normalized.teacherName }
      ],
      [
        { content: 'Class / Grade', styles: { fontStyle: 'bold', fillColor: BG_LABEL, textColor: NAVY } },
        { content: normalized.grade },
        { content: 'Subject', styles: { fontStyle: 'bold', fillColor: BG_LABEL, textColor: NAVY } },
        { content: normalized.subject }
      ],
      [
        { content: 'Instructional Cycle', styles: { fontStyle: 'bold', fillColor: BG_LABEL, textColor: NAVY } },
        { content: `Cycle ${normalized.cycle}` },
        { content: 'Instructional Week', styles: { fontStyle: 'bold', fillColor: BG_LABEL, textColor: NAVY } },
        { content: `Week ${normalized.weekNumber}` }
      ],
      [
        { content: 'Curriculum Framework', styles: { fontStyle: 'bold', fillColor: BG_LABEL, textColor: NAVY } },
        { content: 'Belize National Primary Curriculum (BNCF)' },
        { content: 'Unit Focus', styles: { fontStyle: 'bold', fillColor: BG_LABEL, textColor: NAVY } },
        { content: normalized.topic }
      ]
    ],
    theme: 'grid',
    styles: {
      fontSize: 8.5,
      textColor: TEXT_DARK,
      lineColor: BORDER_COLOR,
      lineWidth: 0.25,
      cellPadding: 2.5
    },
    columnStyles: {
      0: { cellWidth: 32 },
      1: { cellWidth: 58 },
      2: { cellWidth: 32 },
      3: { cellWidth: 'auto' }
    }
  });

  currentY = (doc as any).lastAutoTable.finalY + 6;

  // Optional Big Idea Box
  if (normalized.bigIdea) {
    autoTable(doc, {
      startY: currentY,
      margin: { left: marginX, right: marginX },
      body: [
        [
          { content: 'Weekly Big Idea & Conceptual Focus', styles: { fontStyle: 'bold', fillColor: BG_LABEL, textColor: NAVY, cellWidth: 45 } },
          { content: normalized.bigIdea }
        ]
      ],
      theme: 'grid',
      styles: {
        fontSize: 8.5,
        textColor: TEXT_DARK,
        lineColor: BORDER_COLOR,
        lineWidth: 0.25,
        cellPadding: 2.5
      }
    });
    currentY = (doc as any).lastAutoTable.finalY + 6;
  }

  // ----------------------------------------------------
  // DAILY LESSONS (MONDAY TO FRIDAY)
  // ----------------------------------------------------
  normalized.days.forEach((day, dayIndex) => {
    // Each day starts on a fresh page!
    doc.addPage();
    currentY = 16;

    const res = day.resolvedLesson;

    // Day Header Banner
    autoTable(doc, {
      startY: currentY,
      margin: { left: marginX, right: marginX },
      body: [[
        {
          content: `${day.dayLabel.toUpperCase()}: ${clean(res.lessonTitle).toUpperCase()}`,
          styles: {
            fillColor: NAVY,
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            fontSize: 10,
            halign: 'left',
            cellPadding: 3
          }
        }
      ]],
      theme: 'plain'
    });

    currentY = (doc as any).lastAutoTable.finalY + 3;

    // 1. Lesson Details Table (Two-column layout / 4 fields per row)
    autoTable(doc, {
      startY: currentY,
      margin: { left: marginX, right: marginX },
      body: [
        [
          { content: 'Lesson Title', styles: { fontStyle: 'bold', fillColor: BG_LABEL, textColor: NAVY } },
          { content: clean(res.lessonTitle) },
          { content: 'Date', styles: { fontStyle: 'bold', fillColor: BG_LABEL, textColor: NAVY } },
          { content: clean(res.dateStr) }
        ],
        [
          { content: 'Duration', styles: { fontStyle: 'bold', fillColor: BG_LABEL, textColor: NAVY } },
          { content: clean(res.duration) },
          { content: 'Teacher', styles: { fontStyle: 'bold', fillColor: BG_LABEL, textColor: NAVY } },
          { content: clean(res.teacherName) }
        ],
        [
          { content: 'Class / Grade', styles: { fontStyle: 'bold', fillColor: BG_LABEL, textColor: NAVY } },
          { content: clean(res.grade) },
          { content: 'Subject', styles: { fontStyle: 'bold', fillColor: BG_LABEL, textColor: NAVY } },
          { content: clean(res.subject) }
        ],
        [
          { content: 'Topic', styles: { fontStyle: 'bold', fillColor: BG_LABEL, textColor: NAVY } },
          { content: clean(res.topic) },
          { content: 'Subtopic', styles: { fontStyle: 'bold', fillColor: BG_LABEL, textColor: NAVY } },
          { content: clean(res.subtopic) }
        ]
      ],
      theme: 'grid',
      styles: {
        fontSize: 8,
        textColor: TEXT_DARK,
        lineColor: BORDER_COLOR,
        lineWidth: 0.25,
        cellPadding: 2
      },
      columnStyles: {
        0: { cellWidth: 26 },
        1: { cellWidth: 64 },
        2: { cellWidth: 26 },
        3: { cellWidth: 'auto' }
      }
    });

    currentY = (doc as any).lastAutoTable.finalY + 4;

    // 2. Curriculum Alignment Table
    autoTable(doc, {
      startY: currentY,
      margin: { left: marginX, right: marginX },
      head: [[
        { content: 'CURRICULUM ALIGNMENT', colSpan: 2, styles: { fillColor: BG_HEADER, textColor: NAVY, fontStyle: 'bold' } }
      ]],
      body: [
        [
          { content: 'Curriculum Framework', styles: { fontStyle: 'bold', fillColor: BG_LABEL, textColor: NAVY } },
          { content: 'Belize National Primary School Curriculum Framework (BNCF)' }
        ],
        [
          { content: 'Cycle & Strand', styles: { fontStyle: 'bold', fillColor: BG_LABEL, textColor: NAVY } },
          { content: `Cycle ${res.cycle}  |  Strand: ${clean(res.strand)}` }
        ],
        [
          { content: 'Content Standard / Competencies', styles: { fontStyle: 'bold', fillColor: BG_LABEL, textColor: NAVY } },
          { content: clean(res.competencies) }
        ],
        [
          { content: 'Targeted Learning Outcomes', styles: { fontStyle: 'bold', fillColor: BG_LABEL, textColor: NAVY } },
          { content: clean(res.learningOutcome) }
        ],
        [
          { content: 'Curriculum Alignment Code', styles: { fontStyle: 'bold', fillColor: BG_LABEL, textColor: NAVY } },
          { content: clean(res.curriculumCode) }
        ]
      ],
      theme: 'grid',
      styles: {
        fontSize: 8,
        textColor: TEXT_DARK,
        lineColor: BORDER_COLOR,
        lineWidth: 0.25,
        cellPadding: 2
      },
      columnStyles: {
        0: { cellWidth: 42 },
        1: { cellWidth: 'auto' }
      }
    });

    currentY = (doc as any).lastAutoTable.finalY + 4;

    // 3. Section 1: Previous Knowledge
    autoTable(doc, {
      startY: currentY,
      margin: { left: marginX, right: marginX },
      head: [[
        { content: '1. PREVIOUS KNOWLEDGE', colSpan: 2, styles: { fillColor: BG_HEADER, textColor: NAVY, fontStyle: 'bold' } }
      ]],
      body: [
        [
          { content: 'Prior Knowledge Activation & Prerequisite Concepts', styles: { fontStyle: 'bold', fillColor: BG_LABEL, textColor: NAVY } },
          { content: clean(res.priorKnowledge) }
        ]
      ],
      theme: 'grid',
      styles: { fontSize: 8, textColor: TEXT_DARK, lineColor: BORDER_COLOR, lineWidth: 0.25, cellPadding: 2 },
      columnStyles: { 0: { cellWidth: 42 }, 1: { cellWidth: 'auto' } }
    });

    currentY = (doc as any).lastAutoTable.finalY + 4;

    // 4. Section 2: Core Competencies
    autoTable(doc, {
      startY: currentY,
      margin: { left: marginX, right: marginX },
      head: [[
        { content: '2. CORE COMPETENCIES', colSpan: 2, styles: { fillColor: BG_HEADER, textColor: NAVY, fontStyle: 'bold' } }
      ]],
      body: [
        [
          { content: 'Belize Core Competency Focus', styles: { fontStyle: 'bold', fillColor: BG_LABEL, textColor: NAVY } },
          { content: clean(res.competencies) }
        ]
      ],
      theme: 'grid',
      styles: { fontSize: 8, textColor: TEXT_DARK, lineColor: BORDER_COLOR, lineWidth: 0.25, cellPadding: 2 },
      columnStyles: { 0: { cellWidth: 42 }, 1: { cellWidth: 'auto' } }
    });

    currentY = (doc as any).lastAutoTable.finalY + 4;

    // 5. Section 3: Learning Objectives & Success Criteria
    const scText = res.successCriteria && res.successCriteria.length > 0
      ? res.successCriteria.map(s => `• ${s}`).join('\n')
      : '• Students demonstrate proficiency on guided and independent tasks.';

    autoTable(doc, {
      startY: currentY,
      margin: { left: marginX, right: marginX },
      head: [[
        { content: '3. LEARNING OBJECTIVES & SUCCESS CRITERIA', colSpan: 2, styles: { fillColor: BG_HEADER, textColor: NAVY, fontStyle: 'bold' } }
      ]],
      body: [
        [
          { content: 'Instructional Condition', styles: { fontStyle: 'bold', fillColor: BG_LABEL, textColor: NAVY } },
          { content: clean(res.condition, 'Given structured instruction, visual models, and mentor texts...') }
        ],
        [
          { content: 'Cognitive Domain (Bloom\'s)', styles: { fontStyle: 'bold', fillColor: BG_LABEL, textColor: NAVY } },
          { content: clean(res.cognitive) }
        ],
        [
          { content: 'Psychomotor / Skills Domain', styles: { fontStyle: 'bold', fillColor: BG_LABEL, textColor: NAVY } },
          { content: clean(res.psychomotor) }
        ],
        [
          { content: 'Affective / Attitudinal Domain', styles: { fontStyle: 'bold', fillColor: BG_LABEL, textColor: NAVY } },
          { content: clean(res.affective) }
        ],
        [
          { content: 'Success Criteria ("I Can" Statements)', styles: { fontStyle: 'bold', fillColor: BG_LABEL, textColor: NAVY } },
          { content: scText }
        ]
      ],
      theme: 'grid',
      styles: { fontSize: 8, textColor: TEXT_DARK, lineColor: BORDER_COLOR, lineWidth: 0.25, cellPadding: 2 },
      columnStyles: { 0: { cellWidth: 42 }, 1: { cellWidth: 'auto' } }
    });

    currentY = (doc as any).lastAutoTable.finalY + 4;

    // 6. Section 4: Content Notes & Key Vocabulary
    const vocabText = res.vocabularyList && res.vocabularyList.length > 0
      ? res.vocabularyList.map(v => `• ${v.term}: ${v.definition}`).join('\n')
      : 'Key terms reviewed in instructional context.';

    autoTable(doc, {
      startY: currentY,
      margin: { left: marginX, right: marginX },
      head: [[
        { content: '4. CONTENT NOTES & KEY VOCABULARY', colSpan: 2, styles: { fillColor: BG_HEADER, textColor: NAVY, fontStyle: 'bold' } }
      ]],
      body: [
        [
          { content: 'Key Concept Overview', styles: { fontStyle: 'bold', fillColor: BG_LABEL, textColor: NAVY } },
          { content: clean(res.lessonDescription) }
        ],
        [
          { content: 'Vocabulary Terms & Definitions', styles: { fontStyle: 'bold', fillColor: BG_LABEL, textColor: NAVY } },
          { content: vocabText }
        ]
      ],
      theme: 'grid',
      styles: { fontSize: 8, textColor: TEXT_DARK, lineColor: BORDER_COLOR, lineWidth: 0.25, cellPadding: 2 },
      columnStyles: { 0: { cellWidth: 42 }, 1: { cellWidth: 'auto' } }
    });

    currentY = (doc as any).lastAutoTable.finalY + 4;

    // 7. Section 5: Resources & Instructional Materials
    const materialsText = res.materialsList && res.materialsList.length > 0
      ? res.materialsList.map(m => `• ${m.name}${m.purpose ? ` (${m.purpose})` : ''}`).join('\n')
      : 'Standard student notebooks, whiteboard, and textbooks.';

    autoTable(doc, {
      startY: currentY,
      margin: { left: marginX, right: marginX },
      head: [[
        { content: '5. RESOURCES & INSTRUCTIONAL MATERIALS', colSpan: 2, styles: { fillColor: BG_HEADER, textColor: NAVY, fontStyle: 'bold' } }
      ]],
      body: [
        [
          { content: 'Materials & Educational Technologies', styles: { fontStyle: 'bold', fillColor: BG_LABEL, textColor: NAVY } },
          { content: materialsText }
        ]
      ],
      theme: 'grid',
      styles: { fontSize: 8, textColor: TEXT_DARK, lineColor: BORDER_COLOR, lineWidth: 0.25, cellPadding: 2 },
      columnStyles: { 0: { cellWidth: 42 }, 1: { cellWidth: 'auto' } }
    });

    currentY = (doc as any).lastAutoTable.finalY + 4;

    // 8. Section 6: Teaching and Learning Procedures (4-column execution table)
    const stageRows: any[] = res.stages.map(st => {
      const teacher = st.teacherActions && st.teacherActions.length > 0
        ? st.teacherActions.map(a => `• ${a}`).join('\n')
        : 'Facilitate instructional modeling.';
      const student = st.studentActions && st.studentActions.length > 0
        ? st.studentActions.map(a => `• ${a}`).join('\n')
        : 'Engage in active learning task.';
      
      const checkItems: string[] = [];
      if (st.assessment) checkItems.push(st.assessment);
      if (st.keyQuestions && st.keyQuestions.length > 0) {
        checkItems.push('Questions:\n' + st.keyQuestions.map(q => `• ${q}`).join('\n'));
      }
      const checks = checkItems.length > 0 ? checkItems.join('\n\n') : 'Informal checks for understanding.';

      return [
        {
          content: `${st.title}\n(${st.duration})`,
          styles: { fontStyle: 'bold', fillColor: BG_LABEL, textColor: NAVY }
        },
        { content: teacher },
        { content: student },
        { content: checks }
      ];
    });

    autoTable(doc, {
      startY: currentY,
      margin: { left: marginX, right: marginX },
      head: [
        [
          { content: '6. TEACHING AND LEARNING PROCEDURES', colSpan: 4, styles: { fillColor: BG_HEADER, textColor: NAVY, fontStyle: 'bold' } }
        ],
        [
          { content: 'Phase / Duration', styles: { fillColor: BG_LABEL, textColor: NAVY, fontStyle: 'bold' } },
          { content: 'Teacher Actions (Modeling)', styles: { fillColor: BG_LABEL, textColor: NAVY, fontStyle: 'bold' } },
          { content: 'Student Actions (Practice)', styles: { fillColor: BG_LABEL, textColor: NAVY, fontStyle: 'bold' } },
          { content: 'Assessment & Checks', styles: { fillColor: BG_LABEL, textColor: NAVY, fontStyle: 'bold' } }
        ]
      ],
      body: stageRows,
      theme: 'grid',
      styles: { fontSize: 7.5, textColor: TEXT_DARK, lineColor: BORDER_COLOR, lineWidth: 0.25, cellPadding: 2 },
      columnStyles: {
        0: { cellWidth: 32 },
        1: { cellWidth: 54 },
        2: { cellWidth: 50 },
        3: { cellWidth: 'auto' }
      }
    });

    currentY = (doc as any).lastAutoTable.finalY + 4;

    // 9. Section 7: Differentiation & Inclusive Strategies
    const strugglingText = res.differentiation.strugglingLearners.map(s => `• ${s}`).join('\n') || 'Visual modeling and manipulative aids.';
    const onLevelText = res.differentiation.onLevelLearners.map(s => `• ${s}`).join('\n') || 'Core practice and collaborative pairing.';
    const advancedText = res.differentiation.advancedLearners.map(s => `• ${s}`).join('\n') || 'Extended application and synthesis.';
    const inclusionText = res.differentiation.inclusionSupports.map(s => `• ${s}`).join('\n') || 'Universal design for learning supports.';

    autoTable(doc, {
      startY: currentY,
      margin: { left: marginX, right: marginX },
      head: [
        [
          { content: '7. DIFFERENTIATION & INCLUSIVE STRATEGIES', colSpan: 2, styles: { fillColor: BG_HEADER, textColor: NAVY, fontStyle: 'bold' } }
        ],
        [
          { content: 'Learner Profile / Need', styles: { fillColor: BG_LABEL, textColor: NAVY, fontStyle: 'bold' } },
          { content: 'Instructional Scaffolding & Support Strategy', styles: { fillColor: BG_LABEL, textColor: NAVY, fontStyle: 'bold' } }
        ]
      ],
      body: [
        [
          { content: 'Tier 1 & 2 Support (Struggling Learners)', styles: { fontStyle: 'bold', fillColor: BG_LABEL, textColor: NAVY } },
          { content: strugglingText }
        ],
        [
          { content: 'On-Level Learners', styles: { fontStyle: 'bold', fillColor: BG_LABEL, textColor: NAVY } },
          { content: onLevelText }
        ],
        [
          { content: 'Advanced Learners (Extension & Challenge)', styles: { fontStyle: 'bold', fillColor: BG_LABEL, textColor: NAVY } },
          { content: advancedText }
        ],
        [
          { content: 'Inclusion Supports (Universal Design for Learning)', styles: { fontStyle: 'bold', fillColor: BG_LABEL, textColor: NAVY } },
          { content: inclusionText }
        ]
      ],
      theme: 'grid',
      styles: { fontSize: 7.5, textColor: TEXT_DARK, lineColor: BORDER_COLOR, lineWidth: 0.25, cellPadding: 2 },
      columnStyles: { 0: { cellWidth: 44 }, 1: { cellWidth: 'auto' } }
    });

    currentY = (doc as any).lastAutoTable.finalY + 4;

    // 10. Section 8: Assessment and Evaluation
    autoTable(doc, {
      startY: currentY,
      margin: { left: marginX, right: marginX },
      head: [[
        { content: '8. ASSESSMENT AND EVALUATION', colSpan: 2, styles: { fillColor: BG_HEADER, textColor: NAVY, fontStyle: 'bold' } }
      ]],
      body: [
        [
          { content: 'Formative Assessment', styles: { fontStyle: 'bold', fillColor: BG_LABEL, textColor: NAVY } },
          { content: clean(res.assessment.formative) }
        ],
        [
          { content: 'Guided Practice Check', styles: { fontStyle: 'bold', fillColor: BG_LABEL, textColor: NAVY } },
          { content: clean(res.assessment.guidedPractice) }
        ],
        [
          { content: 'Independent Practice Evaluation', styles: { fontStyle: 'bold', fillColor: BG_LABEL, textColor: NAVY } },
          { content: clean(res.assessment.independentPractice) }
        ],
        [
          { content: 'Exit Ticket Prompt', styles: { fontStyle: 'bold', fillColor: BG_LABEL, textColor: NAVY } },
          { content: clean(res.assessment.exitTicket) }
        ],
        [
          { content: 'Evaluation Criteria & Benchmark', styles: { fontStyle: 'bold', fillColor: BG_LABEL, textColor: NAVY } },
          { content: clean(res.assessment.evaluationCriteria) }
        ]
      ],
      theme: 'grid',
      styles: { fontSize: 8, textColor: TEXT_DARK, lineColor: BORDER_COLOR, lineWidth: 0.25, cellPadding: 2 },
      columnStyles: { 0: { cellWidth: 44 }, 1: { cellWidth: 'auto' } }
    });

    currentY = (doc as any).lastAutoTable.finalY + 4;

    // 11. Section 9: Closure and Synthesis
    const closureText = res.closure && res.closure.length > 0
      ? res.closure.map(c => `• ${c}`).join('\n')
      : 'Consolidate key concepts and preview tomorrow\'s instructional objective.';

    autoTable(doc, {
      startY: currentY,
      margin: { left: marginX, right: marginX },
      head: [[
        { content: '9. CLOSURE AND SYNTHESIS', colSpan: 2, styles: { fillColor: BG_HEADER, textColor: NAVY, fontStyle: 'bold' } }
      ]],
      body: [
        [
          { content: 'Lesson Debrief & Synthesis Tasks', styles: { fontStyle: 'bold', fillColor: BG_LABEL, textColor: NAVY } },
          { content: closureText }
        ]
      ],
      theme: 'grid',
      styles: { fontSize: 8, textColor: TEXT_DARK, lineColor: BORDER_COLOR, lineWidth: 0.25, cellPadding: 2 },
      columnStyles: { 0: { cellWidth: 44 }, 1: { cellWidth: 'auto' } }
    });

    currentY = (doc as any).lastAutoTable.finalY + 4;

    // 12. Section 10: Teacher's Reflection & Planning Notes
    autoTable(doc, {
      startY: currentY,
      margin: { left: marginX, right: marginX },
      head: [
        [
          { content: '10. TEACHER\'S REFLECTION & PLANNING NOTES', colSpan: 2, styles: { fillColor: BG_HEADER, textColor: NAVY, fontStyle: 'bold' } }
        ],
        [
          { content: 'Reflection Focus', styles: { fillColor: BG_LABEL, textColor: NAVY, fontStyle: 'bold' } },
          { content: 'Pre-Lesson Anticipations & Responsive Notes', styles: { fillColor: BG_LABEL, textColor: NAVY, fontStyle: 'bold' } }
        ]
      ],
      body: [
        [
          { content: 'What do I anticipate students may find difficult?', styles: { fontStyle: 'bold', fillColor: BG_LABEL, textColor: NAVY } },
          { content: clean(res.reflection.whatWorked) }
        ],
        [
          { content: 'What evidence will I collect during the lesson?', styles: { fontStyle: 'bold', fillColor: BG_LABEL, textColor: NAVY } },
          { content: clean(res.reflection.challenges) }
        ],
        [
          { content: 'Which students or groups require follow-up?', styles: { fontStyle: 'bold', fillColor: BG_LABEL, textColor: NAVY } },
          { content: clean(res.reflection.followUpStudents) }
        ],
        [
          { content: 'What will I adjust if students struggle?', styles: { fontStyle: 'bold', fillColor: BG_LABEL, textColor: NAVY } },
          { content: clean(res.reflection.adjustments) }
        ],
        [
          { content: 'Next Lesson Instructional Connection', styles: { fontStyle: 'bold', fillColor: BG_LABEL, textColor: NAVY } },
          { content: clean(res.reflection.nextSteps) }
        ]
      ],
      theme: 'grid',
      styles: { fontSize: 7.5, textColor: TEXT_DARK, lineColor: BORDER_COLOR, lineWidth: 0.25, cellPadding: 2 },
      columnStyles: { 0: { cellWidth: 46 }, 1: { cellWidth: 'auto' } }
    });
  });

  // ----------------------------------------------------
  // FINAL PASS: RUNNING HEADERS & RUNNING FOOTERS WITH TOTAL PAGES
  // ----------------------------------------------------
  const totalPages = doc.getNumberOfPages();

  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    // Running Header (Pages 2+)
    if (i > 1) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(...TEXT_MUTED);
      const headerText = `${normalized.schoolName}  |  WEEKLY LESSON PLAN  |  ${normalized.grade} ${normalized.subject}`;
      doc.text(headerText, pageWidth - marginX, 10, { align: 'right' });
      doc.setDrawColor(...BORDER_COLOR);
      doc.setLineWidth(0.25);
      doc.line(marginX, 12, pageWidth - marginX, 12);
    }

    // Running Footer (All Pages)
    doc.setDrawColor(...BORDER_COLOR);
    doc.setLineWidth(0.25);
    doc.line(marginX, pageHeight - 12, pageWidth - marginX, pageHeight - 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...TEXT_MUTED);
    const footerLeft = `Official Administrative Document  •  Belize Primary Curriculum Framework`;
    const footerRight = `Page ${i} of ${totalPages}`;
    doc.text(footerLeft, marginX, pageHeight - 7);
    doc.text(footerRight, pageWidth - marginX, pageHeight - 7, { align: 'right' });
  }

  // Save PDF file
  const sanitizedTopic = normalized.topic.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 30);
  doc.save(`${fileNamePrefix}_${sanitizedTopic}.pdf`);
}
