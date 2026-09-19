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
  PageBreak
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
import { 
  resolveCompleteLessonResources, 
  validateLessonExport, 
  purgeCrossSubjectContamination, 
  OFFICIAL_SCHOOL_NAME, 
  sanitizeExportText, 
  toCleanBullets as toCleanBulletsResolved,
  ResolvedLessonResources
} from './lessonExportResolver';

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
  // 1. Resolve all complete lesson resources using unified single source of truth
  const res: ResolvedLessonResources = resolveCompleteLessonResources(plan, { schoolName, teacherName });

  // 2. Validate lesson export
  const validation = validateLessonExport(res);
  if (!validation.isValid) {
    console.warn("Export validation warnings/errors:", validation.errors);
  } else {
    console.log("Export validation passed successfully:", validation.checksPassed);
  }

  const children: (Paragraph | Table)[] = [
    // ----------------------------------------------------
    // SECTION 1: HEADER BLOCK
    // ----------------------------------------------------
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 40 },
      children: [
        new TextRun({
          text: res.schoolName,
          bold: true,
          size: 32, // 16pt
          color: PRIMARY_NAVY
        })
      ]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 60 },
      children: [
        new TextRun({
          text: "OFFICIAL LESSON PLAN & INSTRUCTIONAL RESOURCE PACK",
          bold: true,
          size: 20, // 10pt
          color: TEXT_MUTED
        })
      ]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 180 },
      children: [
        new TextRun({
          text: res.lessonTitle,
          bold: true,
          size: 26, // 13pt
          color: PRIMARY_NAVY
        }),
        ...(res.subtopic && res.subtopic !== 'Not provided' ? [
          new TextRun({
            text: ` — ${res.subtopic}`,
            italics: true,
            size: 22,
            color: TEXT_MUTED
          })
        ] : [])
      ]
    }),

    // ----------------------------------------------------
    // SECTION 2: LESSON INFORMATION TABLE
    // ----------------------------------------------------
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            createCell("School", 20, { isLabel: true }),
            createCell(res.schoolName, 30),
            createCell("Teacher", 20, { isLabel: true }),
            createCell(res.teacherName, 30)
          ]
        }),
        new TableRow({
          children: [
            createCell("Grade / Class", 20, { isLabel: true }),
            createCell(res.grade, 30),
            createCell("Subject", 20, { isLabel: true }),
            createCell(res.subject, 30)
          ]
        }),
        new TableRow({
          children: [
            createCell("Date", 20, { isLabel: true }),
            createCell(res.dateStr, 30),
            createCell("Duration", 20, { isLabel: true }),
            createCell(res.duration, 30)
          ]
        }),
        new TableRow({
          children: [
            createCell("Topic", 20, { isLabel: true }),
            createCell(res.topic, 30),
            createCell("Subtopic", 20, { isLabel: true }),
            createCell(res.subtopic, 30)
          ]
        })
      ]
    }),

    // ----------------------------------------------------
    // SECTION 3: CURRICULUM ALIGNMENT TABLE
    // ----------------------------------------------------
    createSectionHeading("Curriculum Alignment", 240),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            createCell("Curriculum / Framework", 32, { isLabel: true }),
            createCell("Belize National Primary School Curriculum Framework", 68)
          ]
        }),
        new TableRow({
          children: [
            createCell("Cycle / Strand", 32, { isLabel: true }),
            createCell(`Cycle ${res.cycle} | Strand: ${res.strand}`, 68)
          ]
        }),
        new TableRow({
          children: [
            createCell("Curriculum Outcome", 32, { isLabel: true }),
            createCell(res.learningOutcome, 68)
          ]
        }),
        new TableRow({
          children: [
            createCell("Competency / Standard", 32, { isLabel: true }),
            createCell(res.competencies, 68)
          ]
        }),
        new TableRow({
          children: [
            createCell("Curriculum Code", 32, { isLabel: true }),
            createCell(res.curriculumCode, 68)
          ]
        })
      ]
    }),

    // ----------------------------------------------------
    // SECTION 4: LEARNING OBJECTIVES & SUCCESS CRITERIA TABLE
    // ----------------------------------------------------
    createSectionHeading("Learning Objectives and Success Criteria", 240),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            createCell("Shared Condition", 32, { isLabel: true }),
            createCell(new Paragraph({
              children: [new TextRun({ text: res.condition, italics: true, size: 20 })]
            }), 68)
          ]
        }),
        new TableRow({
          children: [
            createCell("Cognitive Domain", 32, { isLabel: true }),
            createCell(res.cognitive, 68)
          ]
        }),
        new TableRow({
          children: [
            createCell("Psychomotor / Skills Domain", 32, { isLabel: true }),
            createCell(res.psychomotor, 68)
          ]
        }),
        new TableRow({
          children: [
            createCell("Affective Domain", 32, { isLabel: true }),
            createCell(res.affective, 68)
          ]
        }),
        new TableRow({
          children: [
            createCell("Success Criteria", 32, { isLabel: true }),
            createCell(res.successCriteria.map(sc => 
              new Paragraph({
                bullet: { level: 0 },
                spacing: { before: 20, after: 20 },
                children: [new TextRun({ text: sc, size: 20, bold: true, color: SUCCESS_COLOR })]
              })
            ), 68)
          ]
        })
      ]
    }),

    // ----------------------------------------------------
    // SECTION 5: LESSON OVERVIEW TABLE
    // ----------------------------------------------------
    createSectionHeading("Lesson Overview", 240),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            createCell("Lesson Description", 32, { isLabel: true }),
            createCell(res.lessonDescription, 68)
          ]
        }),
        new TableRow({
          children: [
            createCell("Prior Knowledge Activation", 32, { isLabel: true }),
            createCell(res.priorKnowledge, 68)
          ]
        }),
        new TableRow({
          children: [
            createCell("Key Vocabulary Focus", 32, { isLabel: true }),
            createCell(res.vocabularyList.map(v => 
              new Paragraph({
                spacing: { before: 20, after: 20 },
                children: [
                  new TextRun({ text: `${v.term}: `, bold: true, size: 20, color: PRIMARY_NAVY }),
                  new TextRun({ text: v.definition, size: 20 })
                ]
              })
            ), 68)
          ]
        }),
        new TableRow({
          children: [
            createCell("Materials and Resources", 32, { isLabel: true }),
            createCell(res.materialsList.map(m => 
              new Paragraph({
                bullet: { level: 0 },
                spacing: { before: 20, after: 20 },
                children: [
                  new TextRun({ text: m.name, bold: true, size: 20 }),
                  ...(m.purpose ? [new TextRun({ text: ` — ${m.purpose}`, size: 20 })] : [])
                ]
              })
            ), 68)
          ]
        }),
        new TableRow({
          children: [
            createCell("Teaching Strategy & Methodology", 32, { isLabel: true }),
            createCell(`${res.teachingStrategy} | ${res.methodology}`, 68)
          ]
        }),
        new TableRow({
          children: [
            createCell("Mastery Target", 32, { isLabel: true }),
            createCell(new Paragraph({
              children: [new TextRun({ text: res.masteryTarget, bold: true, color: SUCCESS_COLOR, size: 20 })]
            }), 68)
          ]
        })
      ]
    }),

    // ----------------------------------------------------
    // SECTION 6: LESSON PROCEDURE (5-STAGE EXECUTION TABLE)
    // ----------------------------------------------------
    createSectionHeading("Lesson Procedure (5-Stage Instructional Execution)", 240),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            createCell("Phase / Duration", 18, { isHeader: true }),
            createCell("Teacher Actions", 30, { isHeader: true }),
            createCell("Student Actions", 28, { isHeader: true }),
            createCell("Assessment & Check", 24, { isHeader: true })
          ]
        }),
        ...res.stages.map(stage => new TableRow({
          children: [
            createCell([
              new Paragraph({ children: [new TextRun({ text: stage.title, bold: true, size: 20, color: PRIMARY_NAVY })] }),
              new Paragraph({ children: [new TextRun({ text: `(${stage.duration})`, size: 18, italics: true, color: TEXT_MUTED })] }),
              ...(stage.resources.length > 0 ? [
                new Paragraph({
                  spacing: { before: 40 },
                  children: [
                    new TextRun({ text: "Resources: ", bold: true, size: 16 }),
                    new TextRun({ text: stage.resources.join(', '), size: 16, color: TEXT_MUTED })
                  ]
                })
              ] : [])
            ], 18, { isLabel: true }),
            createCell(stage.teacherActions.map(act => 
              new Paragraph({
                bullet: { level: 0 },
                spacing: { before: 20, after: 20 },
                children: [new TextRun({ text: act, size: 20 })]
              })
            ), 30),
            createCell(stage.studentActions.map(act => 
              new Paragraph({
                bullet: { level: 0 },
                spacing: { before: 20, after: 20 },
                children: [new TextRun({ text: act, size: 20 })]
              })
            ), 28),
            createCell([
              new Paragraph({ children: [new TextRun({ text: stage.assessment, size: 20 })] }),
              ...(stage.keyQuestions.length > 0 ? [
                new Paragraph({
                  spacing: { before: 40 },
                  children: [
                    new TextRun({ text: "Key Question: ", bold: true, size: 18, color: PRIMARY_NAVY }),
                    new TextRun({ text: stage.keyQuestions[0], size: 18, italics: true })
                  ]
                })
              ] : [])
            ], 24)
          ]
        }))
      ]
    }),

    // ----------------------------------------------------
    // SECTION 7: QUESTIONING STRATEGIES TABLE
    // ----------------------------------------------------
    createSectionHeading("Questioning Strategies (Cognitive Hierarchy)", 240),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            createCell("Cognitive Level", 30, { isHeader: true }),
            createCell("Target Question", 70, { isHeader: true })
          ]
        }),
        ...res.questioningStrategies.map(q => new TableRow({
          children: [
            createCell(q.level, 30, { isLabel: true }),
            createCell(q.question, 70)
          ]
        }))
      ]
    }),

    // ----------------------------------------------------
    // SECTION 8: EXPLICIT TEACHER SCRIPT (WORD-FOR-WORD)
    // ----------------------------------------------------
    ...(res.teacherScript.hasScript ? [
      createSectionHeading(res.teacherScript.title, 260),
      ...res.teacherScript.sections.flatMap(sec => [
        createSubheading(sec.heading, 120),
        new Paragraph({
          spacing: { before: 40, after: 80, line: 280 },
          children: [
            new TextRun({
              text: sec.dialogue,
              italics: true,
              size: 21,
              color: TEXT_MAIN
            })
          ]
        }),
        ...(sec.notes ? [
          new Paragraph({
            spacing: { before: 20, after: 100 },
            children: [
              new TextRun({ text: "Teacher Note: ", bold: true, size: 18, color: TEXT_MUTED }),
              new TextRun({ text: sec.notes, size: 18, color: TEXT_MUTED })
            ]
          })
        ] : [])
      ])
    ] : []),

    // ----------------------------------------------------
    // SECTION 9: STUDENT MATERIALS OVERVIEW
    // ----------------------------------------------------
    createSectionHeading("Student Materials Overview", 240),
    ...res.studentMaterialsOverview.map(item => createBullet(item)),

    // ----------------------------------------------------
    // SECTION 10: COMPLETE READING PASSAGE (PAGE BREAK)
    // ----------------------------------------------------
    ...(res.readingPassage && res.readingPassage.hasPassage ? [
      new Paragraph({ children: [new PageBreak()] }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 60, after: 40 },
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
        spacing: { before: 0, after: 80 },
        children: [
          new TextRun({
            text: res.readingPassage.title,
            bold: true,
            size: 32,
            color: PRIMARY_NAVY
          })
        ]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 160 },
        children: [
          new TextRun({
            text: `Grade Level: ${res.readingPassage.gradeLevel}  |  Genre: ${res.readingPassage.genre}  |  Word Count: ${res.readingPassage.wordCount} words`,
            size: 20,
            color: TEXT_MUTED
          })
        ]
      }),
      ...(res.readingPassage.vocabularyHighlighted.length > 0 ? [
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                createCell([
                  new Paragraph({
                    children: [
                      new TextRun({ text: "Target Morphological Words in Passage: ", bold: true, size: 20, color: PRIMARY_NAVY }),
                      new TextRun({ text: res.readingPassage.vocabularyHighlighted.join(' • '), size: 20, bold: true })
                    ]
                  })
                ], 100, { isLabel: true })
              ]
            })
          ]
        })
      ] : []),
      new Paragraph({ spacing: { before: 120, after: 60 } }),
      ...res.readingPassage.paragraphs.map(p => new Paragraph({
        spacing: { before: 60, after: 120, line: 300 },
        children: [new TextRun({ text: p, size: 22 })]
      })),
      createSectionHeading("Passage Comprehension & Word Analysis Questions", 240),
      ...res.readingPassage.comprehensionQuestions.flatMap(cq => [
        new Paragraph({
          spacing: { before: 80, after: 40 },
          children: [
            new TextRun({ text: `${cq.number}. [${cq.cognitiveLevel}]: `, bold: true, size: 21, color: PRIMARY_NAVY }),
            new TextRun({ text: cq.question, size: 21 })
          ]
        }),
        new Paragraph({
          spacing: { before: 40, after: 120 },
          children: [
            new TextRun({ text: "Student Response: _____________________________________________________________________________", size: 18, color: TEXT_MUTED })
          ]
        })
      ]),
      createSectionHeading("Reading Passage Answer Key & Teacher Notes", 240),
      ...res.readingPassage.comprehensionQuestions.map(cq => new Paragraph({
        spacing: { before: 40, after: 60 },
        children: [
          new TextRun({ text: `Question ${cq.number} Key: `, bold: true, size: 20, color: PRIMARY_NAVY }),
          new TextRun({ text: cq.answer, size: 20 })
        ]
      }))
    ] : []),

    // ----------------------------------------------------
    // SECTION 11: ANCHOR CHART BLUEPRINT (PAGE BREAK)
    // ----------------------------------------------------
    ...(res.anchorChart && res.anchorChart.hasChart ? [
      new Paragraph({ children: [new PageBreak()] }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 60, after: 40 },
        children: [
          new TextRun({
            text: "CLASSROOM DISPLAY ANCHOR CHART BLUEPRINT",
            bold: true,
            size: 20,
            color: TEXT_MUTED
          })
        ]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 80 },
        children: [
          new TextRun({
            text: res.anchorChart.title,
            bold: true,
            size: 32,
            color: PRIMARY_NAVY
          })
        ]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 160 },
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
          rows: [
            new TableRow({
              children: res.anchorChart.tableHeaders.map((th, i) => 
                createCell(th, i === 0 ? 20 : i === 1 ? 25 : i === 2 ? 25 : 30, { isHeader: true })
              )
            }),
            ...res.anchorChart.tableRows.map(row => new TableRow({
              children: [
                createCell(row.col1, 20, { isLabel: true }),
                createCell(row.col2, 25),
                createCell(row.col3, 25),
                createCell(row.col4, 30)
              ]
            }))
          ]
        })
      ] : []),
      createSectionHeading("Core Rules and Systematic Definitions", 240),
      ...res.anchorChart.keyRulesOrDefinitions.map(rule => createBullet(rule)),
      createSectionHeading("Classroom Whiteboard Diagram & Visual Layout Guide", 200),
      createParagraph(res.anchorChart.visualDiagramDescription),
      createSectionHeading("Student Key Takeaway", 200),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            children: [
              createCell(new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 60, after: 60 },
                children: [
                  new TextRun({
                    text: `"${res.anchorChart.studentKeyTakeaway}"`,
                    bold: true,
                    size: 24,
                    color: PRIMARY_NAVY
                  })
                ]
              }), 100, { isLabel: true })
            ]
          })
        ]
      })
    ] : []),

    // ----------------------------------------------------
    // SECTION 12: STUDENT PRACTICE WORKSHEET (PAGE BREAK)
    // ----------------------------------------------------
    ...(res.worksheet && res.worksheet.hasWorksheet ? [
      new Paragraph({ children: [new PageBreak()] }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 60, after: 40 },
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
        spacing: { before: 0, after: 80 },
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
        rows: [
          new TableRow({
            children: [
              createCell("Name: ____________________________________", 40),
              createCell("Date: ____________________", 35),
              createCell(`Score: _______ / ${res.worksheet.totalPoints || res.worksheet.totalQuestions || 10}`, 25, { isLabel: true })
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
    ] : []),

    // ----------------------------------------------------
    // SECTION 13: EXTENSION ACTIVITY (PAGE BREAK)
    // ----------------------------------------------------
    ...(res.extensionActivity && res.extensionActivity.hasActivity ? [
      new Paragraph({ children: [new PageBreak()] }),
      createSectionHeading(res.extensionActivity.title, 60),
      createParagraph(res.extensionActivity.instructions, { italic: true }),
      ...res.extensionActivity.tasks.map((task, idx) => new Paragraph({
        spacing: { before: 40, after: 60 },
        children: [
          new TextRun({ text: `Task ${idx + 1}: `, bold: true, size: 21, color: PRIMARY_NAVY }),
          new TextRun({ text: task, size: 21 })
        ]
      })),
      ...(res.extensionActivity.leadershipRole ? [
        new Paragraph({
          spacing: { before: 80, after: 40 },
          children: [
            new TextRun({ text: "Student Leadership Role: ", bold: true, size: 20, color: PRIMARY_NAVY }),
            new TextRun({ text: res.extensionActivity.leadershipRole, size: 20 })
          ]
        })
      ] : [])
    ] : []),

    // ----------------------------------------------------
    // SECTION 14: DAILY EXIT TICKET (PAGE BREAK)
    // ----------------------------------------------------
    ...(res.exitTicket && res.exitTicket.hasTicket ? [
      new Paragraph({ children: [new PageBreak()] }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 60, after: 40 },
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
        spacing: { before: 0, after: 80 },
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
        rows: [
          new TableRow({
            children: [
              createCell("Name: ____________________________________", 40),
              createCell("Date: ____________________", 35),
              createCell(`Score: _______ / ${res.exitTicket.questions.length}`, 25, { isLabel: true })
            ]
          })
        ]
      }),
      new Paragraph({
        spacing: { before: 100, after: 80 },
        children: [
          new TextRun({ text: "Prompt: ", bold: true, size: 21, color: PRIMARY_NAVY }),
          new TextRun({ text: res.exitTicket.prompt, size: 21, italics: true })
        ]
      }),
      ...res.exitTicket.questions.flatMap(q => [
        new Paragraph({
          spacing: { before: 60, after: 40 },
          children: [
            new TextRun({ text: `Question ${q.number} (${q.points} pt): `, bold: true, size: 21, color: PRIMARY_NAVY }),
            new TextRun({ text: q.question, size: 21 })
          ]
        }),
        new Paragraph({
          spacing: { before: 20, after: 100 },
          children: [
            new TextRun({ text: "Student Answer: _______________________________________________________________________________", size: 18, color: TEXT_MUTED })
          ]
        })
      ]),
      createSectionHeading("Exit Ticket Answer Key & Diagnostic Action", 200),
      ...res.exitTicket.questions.map(q => new Paragraph({
        spacing: { before: 30, after: 40 },
        children: [
          new TextRun({ text: `Question ${q.number} Key: `, bold: true, size: 20, color: PRIMARY_NAVY }),
          new TextRun({ text: q.answerKey, size: 20 })
        ]
      })),
      new Paragraph({
        spacing: { before: 40, after: 20 },
        children: [
          new TextRun({ text: "Scoring Guidance: ", bold: true, size: 19 }),
          new TextRun({ text: res.exitTicket.scoringGuidance, size: 19 })
        ]
      }),
      new Paragraph({
        spacing: { before: 20, after: 20 },
        children: [
          new TextRun({ text: "Mastery Threshold: ", bold: true, size: 19 }),
          new TextRun({ text: res.exitTicket.masteryThreshold, size: 19 })
        ]
      }),
      new Paragraph({
        spacing: { before: 20, after: 60 },
        children: [
          new TextRun({ text: "Grouping Rule Tomorrow: ", bold: true, size: 19 }),
          new TextRun({ text: res.exitTicket.groupingRuleTomorrow, size: 19 })
        ]
      })
    ] : []),

    // ----------------------------------------------------
    // SECTION 15: DIFFERENTIATION FRAMEWORK (PAGE BREAK)
    // ----------------------------------------------------
    new Paragraph({ children: [new PageBreak()] }),
    createSectionHeading("Differentiation Framework (Inclusive Instructional Strategies)", 200),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            createCell("Learner Profile", 30, { isHeader: true }),
            createCell("Instructional Scaffolding & Support Strategy", 70, { isHeader: true })
          ]
        }),
        new TableRow({
          children: [
            createCell("Students Requiring Additional Support (Tier 1 & 2)", 30, { isLabel: true }),
            createCell(res.differentiation.strugglingLearners.map(s => 
              new Paragraph({
                bullet: { level: 0 },
                spacing: { before: 20, after: 20 },
                children: [new TextRun({ text: s, size: 20 })]
              })
            ), 70)
          ]
        }),
        new TableRow({
          children: [
            createCell("On-Level Learners (Core Expectations)", 30, { isLabel: true }),
            createCell(res.differentiation.onLevelLearners.map(s => 
              new Paragraph({
                bullet: { level: 0 },
                spacing: { before: 20, after: 20 },
                children: [new TextRun({ text: s, size: 20 })]
              })
            ), 70)
          ]
        }),
        new TableRow({
          children: [
            createCell("Advanced Learners (Extensions & Challenge)", 30, { isLabel: true }),
            createCell(res.differentiation.advancedLearners.map(s => 
              new Paragraph({
                bullet: { level: 0 },
                spacing: { before: 20, after: 20 },
                children: [new TextRun({ text: s, size: 20 })]
              })
            ), 70)
          ]
        }),
        new TableRow({
          children: [
            createCell("Inclusion Supports (Universal Accessibility)", 30, { isLabel: true }),
            createCell(res.differentiation.inclusionSupports.map(s => 
              new Paragraph({
                bullet: { level: 0 },
                spacing: { before: 20, after: 20 },
                children: [new TextRun({ text: s, size: 20 })]
              })
            ), 70)
          ]
        })
      ]
    }),

    // ----------------------------------------------------
    // SECTION 16: ASSESSMENT & EVALUATION
    // ----------------------------------------------------
    createSectionHeading("Assessment and Evaluation", 240),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            createCell("Assessment Phase", 30, { isHeader: true }),
            createCell("Method / Evidence of Learning", 70, { isHeader: true })
          ]
        }),
        new TableRow({
          children: [
            createCell("Formative Assessment", 30, { isLabel: true }),
            createCell(res.assessment.formative, 70)
          ]
        }),
        new TableRow({
          children: [
            createCell("Guided Practice", 30, { isLabel: true }),
            createCell(res.assessment.guidedPractice, 70)
          ]
        }),
        new TableRow({
          children: [
            createCell("Independent Practice", 30, { isLabel: true }),
            createCell(res.assessment.independentPractice, 70)
          ]
        }),
        new TableRow({
          children: [
            createCell("Exit Ticket", 30, { isLabel: true }),
            createCell(res.assessment.exitTicket, 70)
          ]
        }),
        new TableRow({
          children: [
            createCell("Evaluation Criteria", 30, { isLabel: true }),
            createCell(res.assessment.evaluationCriteria, 70)
          ]
        })
      ]
    }),

    // Assessment Rubric Table
    ...(res.assessment.rubric && res.assessment.rubric.length > 0 ? [
      createSubheading("Assessment Evaluation Rubric", 160),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            children: [
              createCell("Criteria", 25, { isHeader: true }),
              createCell("Exemplary (4)", 25, { isHeader: true }),
              createCell("Proficient (3)", 25, { isHeader: true }),
              createCell("Developing (2)", 25, { isHeader: true })
            ]
          }),
          ...res.assessment.rubric.map(r => new TableRow({
            children: [
              createCell(r.criteria, 25, { isLabel: true }),
              createCell(r.exemplary, 25),
              createCell(r.proficient, 25),
              createCell(r.developing, 25)
            ]
          }))
        ]
      })
    ] : []),

    // ----------------------------------------------------
    // SECTION 17: CLOSURE & SYNTHESIS
    // ----------------------------------------------------
    createSectionHeading("Closure and Synthesis", 240),
    ...res.closure.map(c => createBullet(c)),

    // ----------------------------------------------------
    // SECTION 18: TEACHER REFLECTION & PLANNING NOTES
    // ----------------------------------------------------
    createSectionHeading("Pre-Lesson Reflection & Planning Notes", 240),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            createCell("Planning & Reflection Focus", 35, { isHeader: true }),
            createCell("Pre-Lesson Anticipations & Responsive Notes", 65, { isHeader: true })
          ]
        }),
        new TableRow({
          children: [
            createCell("What do I anticipate students may find difficult?", 35, { isLabel: true }),
            createCell(res.reflection.whatWorked || " ", 65)
          ]
        }),
        new TableRow({
          children: [
            createCell("What evidence will I collect during the lesson?", 35, { isLabel: true }),
            createCell(res.reflection.challenges || " ", 65)
          ]
        }),
        new TableRow({
          children: [
            createCell("Which students or groups require follow-up?", 35, { isLabel: true }),
            createCell(res.reflection.followUpStudents || " ", 65)
          ]
        }),
        new TableRow({
          children: [
            createCell("What will I adjust if students struggle?", 35, { isLabel: true }),
            createCell(res.reflection.adjustments || " ", 65)
          ]
        }),
        new TableRow({
          children: [
            createCell("Next Lesson Connection", 35, { isLabel: true }),
            createCell(res.reflection.nextSteps || " ", 65)
          ]
        })
      ]
    }),

    // ----------------------------------------------------
    // SECTION 19: ADDITIONAL GENERATED ASSETS (IF ANY)
    // ----------------------------------------------------
    ...(res.additionalAssets && res.additionalAssets.length > 0 ? [
      createSectionHeading("Additional Generated Student Materials", 240),
      ...res.additionalAssets.flatMap(asset => [
        createSubheading(`${asset.title} (${asset.type})`, 120),
        createParagraph(asset.content),
        ...(asset.answerKey ? [
          new Paragraph({
            spacing: { before: 20, after: 60 },
            children: [
              new TextRun({ text: "Answer Key: ", bold: true, size: 20, color: PRIMARY_NAVY }),
              new TextRun({ text: asset.answerKey, size: 20 })
            ]
          })
        ] : [])
      ])
    ] : [])
  ];

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
                  text: `${res.schoolName}  |  ${res.grade} ${res.subject}  |  ${res.topic}`,
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

  await downloadDocx(doc, `${cleanText(res.lessonTitle || res.topic)}_Complete_Lesson_Pack`);
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
  const planData: LessonPlan = ((lesson as any).lesson_plan as any) || {
    lessonTitle: lesson.title,
    topic: lesson.topic,
    subject: lesson.subject as any,
    grade: lesson.class_id as any,
    duration: lesson.duration,
    studentMaterials: resources?.map(r => ({
      title: r.title,
      type: r.resource_type as any,
      content: typeof r.content === 'string' ? r.content : JSON.stringify(r.content),
      answerKey: undefined
    }))
  };

  await exportToWord(planData, teacherName, schoolName);
}

// ==========================================
// 3. WEEKLY LESSON PLAN EXPORT (.DOCX)
// ==========================================
export async function exportWeeklyLessonPlanToWord(plan: any, teacherName?: string): Promise<void> {
  const children: (Paragraph | Table)[] = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 40, after: 40 },
      children: [
        new TextRun({
          text: OFFICIAL_SCHOOL_NAME,
          bold: true,
          size: 26,
          color: PRIMARY_NAVY
        })
      ]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 40 },
      children: [
        new TextRun({
          text: `WEEKLY LESSON PLAN: ${cleanText(plan.week?.topic || plan.topic)}`,
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
          text: `Teacher: ${cleanText(teacherName || 'Not provided')} | ${plan.week?.grade || plan.grade} - ${plan.week?.subject || plan.subject}`,
          size: 22,
          color: TEXT_MUTED
        })
      ]
    })
  ];

  const days: any[] = plan.week?.days || plan.days || [];
  days.forEach((day: any) => {
    children.push(createSectionHeading(`Day: ${day.day || day.day_number || ''}`, 260));
    const bullets = toCleanBullets(formatLessonForExport(day.lesson || day, teacherName));
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

  await downloadDocx(doc, `Weekly_Plan_${cleanText(plan.week?.topic || plan.topic || 'Export')}`);
}

export async function exportDailyPlanToWord(plan: any): Promise<void> {
  const children: (Paragraph | Table)[] = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 40, after: 40 },
      children: [
        new TextRun({
          text: OFFICIAL_SCHOOL_NAME,
          bold: true,
          size: 26,
          color: PRIMARY_NAVY
        })
      ]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 40 },
      children: [
        new TextRun({
          text: `DAILY LESSON PLAN: DAY ${plan.day || plan.day_number || 1}`,
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
          text: `Date: ${cleanText(plan.date || plan.createdAt || 'Not provided')}`,
          size: 22,
          color: TEXT_MUTED
        })
      ]
    })
  ];

  const strands: any[] = plan.strands || [];
  strands.forEach((strand: any) => {
    children.push(createSectionHeading(strand.strand, 260));
    children.push(createParagraph(`Objective: ${strand.objective}`, { bold: true }));
    children.push(createParagraph(`Time: ${strand.timeAllocation}`));
    children.push(createSubheading("Activities", 140));
    strand.activities.forEach((act: any) => children.push(createBullet(act)));
  });

  const doc = new Document({
    sections: [{
      properties: {
        page: { margin: { top: 1080, bottom: 1080, left: 1080, right: 1080 } }
      },
      children
    }]
  });

  await downloadDocx(doc, `Daily_Plan_Day_${plan.day || plan.day_number || 1}`);
}

export async function exportLAWeeklyToWord(plan: any): Promise<void> {
  const children: (Paragraph | Table)[] = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 40, after: 40 },
      children: [
        new TextRun({
          text: OFFICIAL_SCHOOL_NAME,
          bold: true,
          size: 26,
          color: PRIMARY_NAVY
        })
      ]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 40 },
      children: [
        new TextRun({
          text: `LANGUAGE ARTS WEEKLY PLAN: ${cleanText(plan.weeklyTheme || plan.theme || plan.topic)}`,
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
          text: `${plan.grade} | Cycle ${plan.cycle}`,
          size: 22,
          color: TEXT_MUTED
        })
      ]
    })
  ];

  const dailyPlans: any[] = plan.dailyPlans || [];
  dailyPlans.forEach((dp: any) => {
    children.push(createSectionHeading(`Day ${dp.day} - ${dp.date}`, 260));
    dp.strands?.forEach((st: any) => {
      children.push(createSubheading(st.strand, 140));
      children.push(createParagraph(`Objective: ${st.objective}`, { bold: true }));
      children.push(createParagraph(`Time Allocation: ${st.timeAllocation}`));
      st.activities?.forEach((act: any) => children.push(createBullet(act)));
    });
  });

  const doc = new Document({
    sections: [{
      properties: {
        page: { margin: { top: 1080, bottom: 1080, left: 1080, right: 1080 } }
      },
      children
    }]
  });

  await downloadDocx(doc, `LA_Weekly_${cleanText(plan.weeklyTheme || plan.theme || 'Export')}`);
}

export async function exportWeeklyCurriculumToWord(plan: any): Promise<void> {
  const children: (Paragraph | Table)[] = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 40, after: 40 },
      children: [
        new TextRun({
          text: OFFICIAL_SCHOOL_NAME,
          bold: true,
          size: 26,
          color: PRIMARY_NAVY
        })
      ]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 40 },
      children: [
        new TextRun({
          text: `WEEKLY CURRICULUM PLAN: ${cleanText(plan.theme || plan.topic)}`,
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
          text: `Grade: ${plan.grade} | Subject: ${plan.subject}`,
          size: 22,
          color: TEXT_MUTED
        })
      ]
    })
  ];

  const days: any[] = plan.days || [];
  days.forEach((day: any) => {
    children.push(createSectionHeading(`Day ${day.day} - ${day.title}`, 260));
    children.push(createParagraph(`Objective: ${day.objective}`, { bold: true }));
    day.activities?.forEach((act: any) => children.push(createBullet(act)));
  });

  const doc = new Document({
    sections: [{
      properties: {
        page: { margin: { top: 1080, bottom: 1080, left: 1080, right: 1080 } }
      },
      children
    }]
  });

  await downloadDocx(doc, `Curriculum_${cleanText(plan.theme || plan.topic || 'Export')}`);
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

  let output = `LESSON PLAN
${res.lessonTitle}

School: ${res.schoolName}
Teacher: ${res.teacherName}
Grade/Class: ${res.grade}
Subject: ${res.subject}
Date: ${res.dateStr}
Duration: ${res.duration}
Topic: ${res.topic}
Subtopic: ${res.subtopic}

CURRICULUM ALIGNMENT
Curriculum/Framework: Belize National Primary School Curriculum Framework
Cycle: Cycle ${res.cycle}
Strand: ${res.strand}
Topic: ${res.topic}
Subtopic: ${res.subtopic}
Curriculum Outcome: ${res.learningOutcome}
Competency/Standard: ${res.competencies}
Curriculum Code: ${res.curriculumCode}

LESSON OVERVIEW
LESSON TITLE: ${res.lessonTitle}
LESSON DESCRIPTION: ${res.lessonDescription}
PRIOR KNOWLEDGE: ${res.priorKnowledge}
KEY VOCABULARY: ${res.vocabularyList.map(v => `${v.term}: ${v.definition}`).join('; ')}

LEARNING OBJECTIVES
CONDITION: ${res.condition}
COGNITIVE DOMAIN: ${res.cognitive}
PSYCHOMOTOR/SKILLS DOMAIN: ${res.psychomotor}
AFFECTIVE DOMAIN: ${res.affective}

SUCCESS CRITERIA
${res.successCriteria.map(sc => `[ ] ${sc}`).join('\n')}

MATERIALS AND RESOURCES
${res.materialsList.map(m => `- ${m.name}: ${m.purpose}`).join('\n')}

LESSON PROCEDURE (5-STAGE INSTRUCTIONAL EXECUTION)
${res.stages.map(st => `
${st.stageNumber}. ${st.title} (${st.duration})
Teacher Actions:
${st.teacherActions.map(a => `  - ${a}`).join('\n')}
Student Actions:
${st.studentActions.map(a => `  - ${a}`).join('\n')}
Assessment & Check for Understanding:
  ${st.assessment}
${st.keyQuestions.length > 0 ? `Key Questions:\n${st.keyQuestions.map(q => `  - ${q}`).join('\n')}` : ''}
`).join('\n')}

QUESTIONING STRATEGIES
${res.questioningStrategies.map(q => `${q.level}: ${q.question}`).join('\n')}

${res.teacherScript.hasScript ? `
EXPLICIT TEACHING SCRIPT (WORD-FOR-WORD)
${res.teacherScript.sections.map(s => `[${s.heading}]\n${s.dialogue}${s.notes ? `\n(Teacher Note: ${s.notes})` : ''}`).join('\n\n')}
` : ''}

STUDENT MATERIALS OVERVIEW
${res.studentMaterialsOverview.map(sm => `- ${sm}`).join('\n')}

${res.readingPassage && res.readingPassage.hasPassage ? `
==================================================
COMPLETE READING PASSAGE: ${res.readingPassage.title}
Grade Level: ${res.readingPassage.gradeLevel} | Genre: ${res.readingPassage.genre} | Word Count: ${res.readingPassage.wordCount} words
Target Vocabulary: ${res.readingPassage.vocabularyHighlighted.join(', ')}

${res.readingPassage.paragraphs.join('\n\n')}

COMPREHENSION & WORD ANALYSIS QUESTIONS:
${res.readingPassage.comprehensionQuestions.map(q => `${q.number}. [${q.cognitiveLevel}]: ${q.question}`).join('\n')}

READING PASSAGE ANSWER KEY:
${res.readingPassage.comprehensionQuestions.map(q => `Question ${q.number}: ${q.answer}`).join('\n')}
==================================================
` : ''}

${res.anchorChart && res.anchorChart.hasChart ? `
==================================================
ANCHOR CHART BLUEPRINT: ${res.anchorChart.title}
Header: ${res.anchorChart.headerText}

${res.anchorChart.tableRows && res.anchorChart.tableRows.length > 0 ? `
PREFIX / SUFFIX MATRIX:
${res.anchorChart.tableRows.map(r => `${r.col1} | ${r.col2} | ${r.col3} | ${r.col4}`).join('\n')}
` : ''}
Core Rules:
${res.anchorChart.keyRulesOrDefinitions.map(r => `- ${r}`).join('\n')}

Visual Layout: ${res.anchorChart.visualDiagramDescription}
Student Key Takeaway: "${res.anchorChart.studentKeyTakeaway}"
==================================================
` : ''}

${res.worksheet && res.worksheet.hasWorksheet ? `
==================================================
${res.schoolName.toUpperCase()}
${res.grade} — ${res.subject}
STUDENT PRACTICE WORKSHEET: ${res.worksheet.title}
${res.worksheet.topic ? `Topic: ${res.worksheet.topic}\n` : ''}Name: ____________________________________  Date: ____________________  Score: ______ / ${res.worksheet.totalPoints || res.worksheet.totalQuestions || 10}

Instructions: ${res.worksheet.instructions}

${res.worksheet.sections.map(s => `
[SECTION ${s.sectionLetter || ''}: ${s.sectionTitle.toUpperCase()}]
${s.instructions ? `Instructions: ${s.instructions}\n` : ''}${s.questions.map(q => `${q.number}. ${q.prompt}`).join('\n')}
`).join('\n')}

TEACHER ANSWER KEY & SCORING GUIDE:
${res.worksheet.answerKey.map(ak => `
[SECTION ${ak.sectionLetter || ''}: ${ak.sectionTitle.toUpperCase()}]
${ak.answers.map(ans => `${ans.number}. ${ans.solution}`).join('\n')}
`).join('\n')}
==================================================
` : ''}

${res.extensionActivity && res.extensionActivity.hasActivity ? `
EXTENSION ACTIVITY: ${res.extensionActivity.title}
${res.extensionActivity.tasks.map((t, idx) => `Task ${idx + 1}: ${t}`).join('\n')}
Leadership Role: ${res.extensionActivity.leadershipRole}
` : ''}

${res.exitTicket && res.exitTicket.hasTicket ? `
==================================================
DAILY EXIT TICKET: ${res.exitTicket.title}
Prompt: ${res.exitTicket.prompt}

${res.exitTicket.questions.map(q => `Question ${q.number} (${q.points} pt): ${q.question}`).join('\n')}

EXIT TICKET ANSWER KEY & SCORING:
${res.exitTicket.questions.map(q => `Question ${q.number}: ${q.answerKey}`).join('\n')}
Scoring Guidance: ${res.exitTicket.scoringGuidance}
Mastery Threshold: ${res.exitTicket.masteryThreshold}
Grouping Rule Tomorrow: ${res.exitTicket.groupingRuleTomorrow}
==================================================
` : ''}

DIFFERENTIATION
STUDENTS REQUIRING ADDITIONAL SUPPORT:
${res.differentiation.strugglingLearners.map(s => `  - ${s}`).join('\n')}
ON-LEVEL LEARNERS:
${res.differentiation.onLevelLearners.map(s => `  - ${s}`).join('\n')}
ADVANCED LEARNERS:
${res.differentiation.advancedLearners.map(s => `  - ${s}`).join('\n')}
INCLUSION SUPPORTS:
${res.differentiation.inclusionSupports.map(s => `  - ${s}`).join('\n')}

ASSESSMENT & EVALUATION
FORMATIVE ASSESSMENT: ${res.assessment.formative}
GUIDED PRACTICE: ${res.assessment.guidedPractice}
INDEPENDENT PRACTICE: ${res.assessment.independentPractice}
EXIT TICKET: ${res.assessment.exitTicket}
EVALUATION CRITERIA: ${res.assessment.evaluationCriteria}

CLOSURE
${res.closure.map(c => `- ${c}`).join('\n')}

PRE-LESSON REFLECTION & PLANNING NOTES
Anticipated Difficulties: ${res.reflection.whatWorked}
Assessment Evidence to Collect: ${res.reflection.challenges}
Follow-Up Grouping & Support: ${res.reflection.followUpStudents}
Responsive Adjustments If Struggling: ${res.reflection.adjustments}
Next Lesson Connection: ${res.reflection.nextSteps}
`;

  return output;
}

export const exportToPDF = (plan: LessonPlan) => {
  window.print();
};
