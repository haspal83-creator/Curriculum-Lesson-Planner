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
  PageBreak,
  Packer
} from 'docx';
import { WeeklyTest, TestQuestion } from '../types';

const PRIMARY_NAVY = '1E3A8A';
const TEXT_MAIN = '1E293B';
const TEXT_MUTED = '475569';
const BORDER_COLOR = '94A3B8';
const HEADER_BG = 'F1F5F9';
const ACCENT_COLOR = '047857';

const thinBorder = { style: BorderStyle.SINGLE, size: 4, color: BORDER_COLOR };
const cellBorders = { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder };
const cellMargins = { top: 100, bottom: 100, left: 140, right: 140 };

export async function exportWeeklyTestToWord(test: WeeklyTest, includeAnswerKey: boolean = false): Promise<void> {
  const sections: any[] = [];
  const children: (Paragraph | Table)[] = [];

  // 1. School Header
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 50, after: 30 },
      children: [
        new TextRun({
          text: test.schoolName || 'SAN JUAN BOSCO R.C. SCHOOL',
          bold: true,
          size: 26,
          color: PRIMARY_NAVY,
          font: 'Calibri'
        })
      ]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 50 },
      children: [
        new TextRun({
          text: `WEEKLY ASSESSMENT — ${test.classLevel.toUpperCase()} ${test.subject.toUpperCase()}`,
          bold: true,
          size: 22,
          color: TEXT_MAIN,
          font: 'Calibri'
        })
      ]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 120 },
      children: [
        new TextRun({
          text: `Cycle ${test.cycle} • Week ${test.week} • Academic Year ${test.academicYear} • Topic: ${test.weeklyTopic}`,
          italics: true,
          size: 19,
          color: TEXT_MUTED,
          font: 'Calibri'
        })
      ]
    })
  );

  // 2. Student Info Table
  children.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              borders: cellBorders,
              margins: cellMargins,
              children: [
                new Paragraph({
                  children: [
                    new TextRun({ text: 'Student Name: ', bold: true, size: 19 }),
                    new TextRun({ text: '________________________________________________' })
                  ]
                })
              ]
            }),
            new TableCell({
              borders: cellBorders,
              margins: cellMargins,
              children: [
                new Paragraph({
                  children: [
                    new TextRun({ text: 'Date: ', bold: true, size: 19 }),
                    new TextRun({ text: '________________________' })
                  ]
                })
              ]
            })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({
              borders: cellBorders,
              margins: cellMargins,
              children: [
                new Paragraph({
                  children: [
                    new TextRun({ text: 'Teacher: ', bold: true, size: 19 }),
                    new TextRun({ text: test.teacherName || 'Classroom Teacher' }),
                    new TextRun({ text: '    |    Time Allowed: ', bold: true, size: 19 }),
                    new TextRun({ text: test.timeAllowed || '45 minutes' })
                  ]
                })
              ]
            }),
            new TableCell({
              borders: cellBorders,
              margins: cellMargins,
              children: [
                new Paragraph({
                  children: [
                    new TextRun({ text: 'Score: ', bold: true, size: 20, color: PRIMARY_NAVY }),
                    new TextRun({ text: `______ / ${test.totalMarks} Marks`, bold: true, size: 20 })
                  ]
                })
              ]
            })
          ]
        })
      ]
    }),
    new Paragraph({ spacing: { before: 80, after: 80 } })
  );

  // 3. Instructions
  children.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              borders: cellBorders,
              margins: cellMargins,
              shading: { fill: HEADER_BG },
              children: [
                new Paragraph({
                  children: [
                    new TextRun({ text: 'INSTRUCTIONS TO CANDIDATES:', bold: true, size: 18, color: PRIMARY_NAVY })
                  ]
                }),
                new Paragraph({
                  spacing: { before: 40 },
                  children: [
                    new TextRun({ text: test.instructions || 'Answer all questions in the spaces provided. Write clearly and show all working where applicable.', size: 18 })
                  ]
                })
              ]
            })
          ]
        })
      ]
    }),
    new Paragraph({ spacing: { before: 100, after: 100 } })
  );

  // 4. Questions
  test.questions.forEach((q, idx) => {
    // Question header with marks
    children.push(
      new Paragraph({
        spacing: { before: 120, after: 40 },
        children: [
          new TextRun({ text: `Question ${q.questionNumber}. `, bold: true, size: 21, color: PRIMARY_NAVY }),
          new TextRun({ text: `[${q.marks} ${q.marks === 1 ? 'mark' : 'marks'}]`, bold: true, italics: true, size: 18, color: ACCENT_COLOR }),
          new TextRun({ text: `  (${q.type} • ${q.difficulty})`, size: 16, color: TEXT_MUTED })
        ]
      }),
      new Paragraph({
        spacing: { before: 20, after: 60 },
        children: [
          new TextRun({ text: q.questionText, size: 20, font: 'Calibri' })
        ]
      })
    );

    // Question visual callout for Word export (if present)
    if (q.visual) {
      children.push(
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  borders: cellBorders,
                  margins: cellMargins,
                  shading: { fill: 'F8FAFC' },
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({ text: `[FIGURE ${q.questionNumber}: ${q.visual.title || 'INSTRUCTIONAL DIAGRAM'}]: `, bold: true, size: 17, color: PRIMARY_NAVY }),
                        new TextRun({ text: q.visual.caption || q.visual.altText, italics: true, size: 16, color: TEXT_MUTED })
                      ]
                    }),
                    ...(q.visual.labels && q.visual.labels.length > 0 ? [
                      new Paragraph({
                        spacing: { before: 20 },
                        children: [
                          new TextRun({ 
                            text: `Diagram Callouts / Labels: ${q.visual.labels.map(l => `${l.id}: ${l.text || l.target || ''}`).join(' | ')}`, 
                            size: 15, 
                            color: TEXT_MAIN 
                          })
                        ]
                      })
                    ] : [])
                  ]
                })
              ]
            })
          ]
        }),
        new Paragraph({ spacing: { before: 40, after: 40 } })
      );
    }

    // Question body based on type
    if (q.type === 'Multiple Choice' && q.options) {
      q.options.forEach(opt => {
        children.push(
          new Paragraph({
            spacing: { before: 20, after: 30 },
            indent: { left: 400 },
            children: [
              new TextRun({ text: `(   )  ${opt}`, size: 19 })
            ]
          })
        );
      });
    } else if (q.type === 'True/False') {
      children.push(
        new Paragraph({
          spacing: { before: 40, after: 60 },
          indent: { left: 400 },
          children: [
            new TextRun({ text: 'Write your answer [ TRUE / FALSE ]:  ________________________________', bold: true, size: 19 })
          ]
        })
      );
    } else if (q.type === 'Fill in the Blank') {
      children.push(
        new Paragraph({
          spacing: { before: 40, after: 60 },
          indent: { left: 400 },
          children: [
            new TextRun({ text: 'Answer: ____________________________________________________', size: 19 })
          ]
        })
      );
    } else if (q.type === 'Matching' && q.matchingPairs) {
      const matchRows = q.matchingPairs.map(p => new TableRow({
        children: [
          new TableCell({
            borders: cellBorders,
            margins: cellMargins,
            children: [new Paragraph({ children: [new TextRun({ text: p.left, bold: true, size: 18 })] })]
          }),
          new TableCell({
            borders: cellBorders,
            margins: cellMargins,
            children: [new Paragraph({ children: [new TextRun({ text: `[      ]  ${p.right}`, size: 18 })] })]
          })
        ]
      }));

      children.push(
        new Table({
          width: { size: 90, type: WidthType.PERCENTAGE },
          rows: matchRows
        }),
        new Paragraph({ spacing: { before: 60 } })
      );
    } else if (q.type === 'Problem Solving') {
      // Workspace box
      children.push(
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  borders: cellBorders,
                  margins: cellMargins,
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({ text: 'WORKSPACE / SHOW YOUR WORKING:', bold: true, size: 16, color: TEXT_MUTED })
                      ]
                    }),
                    new Paragraph({ spacing: { before: 400, after: 400 } }),
                    new Paragraph({
                      children: [
                        new TextRun({ text: 'Final Answer: ____________________________________________________', bold: true, size: 19 })
                      ]
                    })
                  ]
                })
              ]
            })
          ]
        }),
        new Paragraph({ spacing: { before: 60 } })
      );
    } else {
      // Short Answer or Extended Response lines
      const lineCount = q.type === 'Extended Response' ? (q.answerLines || 6) : (q.answerLines || 3);
      for (let l = 0; l < lineCount; l++) {
        children.push(
          new Paragraph({
            spacing: { before: 30, after: 30 },
            children: [
              new TextRun({ text: '____________________________________________________________________________________', color: BORDER_COLOR })
            ]
          })
        );
      }
    }

    children.push(new Paragraph({ spacing: { before: 40, after: 60 } }));
  });

  // 5. Separate Answer Key (if requested)
  if (includeAnswerKey) {
    children.push(
      new Paragraph({ children: [new PageBreak()] }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 40, after: 20 },
        children: [
          new TextRun({
            text: 'TEACHER ANSWER KEY & MARKING GUIDE',
            bold: true,
            size: 24,
            color: PRIMARY_NAVY
          })
        ]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 120 },
        children: [
          new TextRun({
            text: `${test.classLevel} • ${test.subject} • Cycle ${test.cycle} Week ${test.week} • Total Marks: ${test.totalMarks}`,
            bold: true,
            italics: true,
            size: 19,
            color: TEXT_MUTED
          })
        ]
      })
    );

    test.questions.forEach(q => {
      children.push(
        new Paragraph({
          spacing: { before: 100, after: 30 },
          children: [
            new TextRun({ text: `Question ${q.questionNumber} [${q.marks} Mark${q.marks > 1 ? 's' : ''}] `, bold: true, size: 20, color: PRIMARY_NAVY }),
            new TextRun({ text: `(${q.type} • Topic: ${q.lessonTopicSource})`, italics: true, size: 17, color: TEXT_MUTED })
          ]
        }),
        new Paragraph({
          spacing: { before: 10, after: 30 },
          children: [
            new TextRun({ text: 'Question: ', bold: true, size: 18 }),
            new TextRun({ text: q.questionText, size: 18 })
          ]
        }),
        new Paragraph({
          spacing: { before: 10, after: 20 },
          children: [
            new TextRun({ text: 'Correct Solution: ', bold: true, size: 19, color: ACCENT_COLOR }),
            new TextRun({ text: q.correctAnswer || 'See teacher marking criteria.', bold: true, size: 19, color: TEXT_MAIN })
          ]
        })
      );

      if (q.visual) {
        children.push(
          new Paragraph({
            spacing: { before: 10, after: 20 },
            children: [
              new TextRun({ text: `Visual Reference (${q.visual.title || 'Diagram'}): `, bold: true, size: 17, color: PRIMARY_NAVY }),
              new TextRun({
                text: q.visual.labels && q.visual.labels.length > 0
                  ? q.visual.labels.map(l => `${l.id}: ${l.target || l.text}`).join(' | ')
                  : (q.visual.caption || q.visual.altText),
                italics: true,
                size: 17
              })
            ]
          })
        );
      }

      if (q.markingGuidance) {
        children.push(
          new Paragraph({
            spacing: { before: 10, after: 50 },
            children: [
              new TextRun({ text: 'Marking Guidance / Rubric: ', bold: true, italics: true, size: 17, color: PRIMARY_NAVY }),
              new TextRun({ text: q.markingGuidance, italics: true, size: 17 })
            ]
          })
        );
      }
    });
  }

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: { top: 720, bottom: 720, left: 900, right: 900 }
          }
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: `${test.classLevel} ${test.subject} — Cycle ${test.cycle} Week ${test.week} Test`,
                    size: 15,
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
                children: [
                  new TextRun({ text: 'Page ', size: 16 }),
                  new TextRun({ children: [PageNumber.CURRENT], size: 16 }),
                  new TextRun({ text: ' of ', size: 16 }),
                  new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 16 })
                ]
              })
            ]
          })
        },
        children
      }
    ]
  });

  const blob = await Packer.toBlob(doc);
  const cleanSubject = test.subject.replace(/[^a-zA-Z0-9]/g, '_');
  const filename = `${test.classLevel.replace(/\s+/g, '_')}_${cleanSubject}_Cycle${test.cycle}_Week${test.week}_Test.docx`;
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Format clean printable HTML and trigger print dialog
 */
export function printWeeklyTest(
  test: WeeklyTest, 
  mode: 'student' | 'teacher' | 'rubric' = 'student'
): void {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    window.print();
    return;
  }

  const isTeacher = mode === 'teacher';
  const isRubricOnly = mode === 'rubric';

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${test.classLevel} ${test.subject} - Cycle ${test.cycle} Week ${test.week} Test (${mode.toUpperCase()})</title>
        <style>
          @page {
            size: letter portrait;
            margin: 15mm 15mm 15mm 15mm;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            color: #1e293b;
            background: #fff;
            margin: 0;
            padding: 0;
            font-size: 13pt;
            line-height: 1.45;
          }
          .header-box {
            text-align: center;
            border-bottom: 2px solid #0f172a;
            padding-bottom: 12px;
            margin-bottom: 16px;
          }
          .school-title {
            font-size: 17pt;
            font-weight: 800;
            text-transform: uppercase;
            color: #1e3a8a;
            margin: 0 0 4px 0;
          }
          .assessment-title {
            font-size: 14pt;
            font-weight: 700;
            color: #0f172a;
            margin: 0 0 4px 0;
          }
          .meta-line {
            font-size: 10pt;
            color: #64748b;
            font-weight: 500;
          }
          .student-box {
            display: grid;
            grid-template-columns: 2fr 1fr;
            gap: 10px;
            border: 1px solid #cbd5e1;
            padding: 8px 12px;
            border-radius: 6px;
            margin-bottom: 16px;
            font-size: 11pt;
          }
          .student-field {
            display: flex;
            align-items: center;
            gap: 6px;
          }
          .field-line {
            border-bottom: 1px dotted #94a3b8;
            flex-grow: 1;
            height: 16px;
          }
          .instructions-box {
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            border-left: 4px solid #1e3a8a;
            padding: 8px 12px;
            border-radius: 4px;
            margin-bottom: 20px;
            font-size: 10pt;
          }
          .question-item {
            margin-bottom: 22px;
            page-break-inside: avoid;
          }
          .question-header {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            margin-bottom: 6px;
          }
          .question-number {
            font-weight: 700;
            font-size: 12.5pt;
            color: #0f172a;
          }
          .question-marks {
            font-weight: 700;
            font-size: 11pt;
            color: #047857;
          }
          .question-text {
            font-size: 12pt;
            margin-bottom: 10px;
          }
          .mc-option {
            margin: 6px 0 6px 16px;
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 11.5pt;
          }
          .mc-bubble {
            width: 14px;
            height: 14px;
            border: 1.5px solid #64748b;
            border-radius: 50%;
            display: inline-block;
          }
          .ruled-line {
            border-bottom: 1px solid #cbd5e1;
            height: 24px;
            margin-bottom: 4px;
          }
          .workspace-box {
            border: 1px solid #94a3b8;
            border-radius: 6px;
            height: 120px;
            padding: 6px;
            position: relative;
            margin-top: 6px;
          }
          .workspace-label {
            font-size: 8.5pt;
            font-weight: 700;
            color: #94a3b8;
            text-transform: uppercase;
          }
          .workspace-answer-line {
            position: absolute;
            bottom: 8px;
            left: 12px;
            right: 12px;
            display: flex;
            font-size: 11pt;
            font-weight: 700;
          }
          .answer-key-box {
            background-color: #f0fdf4;
            border: 1px solid #bbf7d0;
            border-left: 4px solid #16a34a;
            padding: 8px 12px;
            border-radius: 4px;
            margin-top: 8px;
            font-size: 10.5pt;
          }
          .page-break {
            page-break-before: always;
          }
        </style>
      </head>
      <body>
        <div class="header-box">
          <div class="school-title">${test.schoolName || 'SAN JUAN BOSCO R.C. SCHOOL'}</div>
          <div class="assessment-title">${test.classLevel} ${test.subject} Assessment</div>
          <div class="meta-line">Cycle ${test.cycle} • Week ${test.week} • Academic Year ${test.academicYear} • Topic: ${test.weeklyTopic}</div>
        </div>

        ${!isRubricOnly ? `
          <div class="student-box">
            <div class="student-field"><strong>Student Name:</strong> <div class="field-line"></div></div>
            <div class="student-field"><strong>Date:</strong> <div class="field-line"></div></div>
            <div class="student-field"><strong>Teacher:</strong> <span>${test.teacherName || 'Classroom Teacher'}</span> | <strong>Time:</strong> <span>${test.timeAllowed || '45 mins'}</span></div>
            <div class="student-field"><strong>Score:</strong> <div class="field-line"></div> <strong>/ ${test.totalMarks} Marks</strong></div>
          </div>

          <div class="instructions-box">
            <strong>INSTRUCTIONS:</strong> ${test.instructions || 'Answer all questions in the spaces provided. Write clearly.'}
          </div>

          <div class="test-questions">
            ${test.questions.map(q => `
              <div class="question-item">
                <div class="question-header">
                  <span class="question-number">Question ${q.questionNumber}. <span style="font-size: 10pt; font-weight: normal; color: #64748b;">(${q.type})</span></span>
                  <span class="question-marks">[${q.marks} ${q.marks === 1 ? 'mark' : 'marks'}]</span>
                </div>
                <div class="question-text">${q.questionText}</div>

                ${q.visual && q.visual.svgContent ? `
                  <div class="visual-container" style="margin: 12px auto 14px auto; text-align: center; max-width: 480px; page-break-inside: avoid;">
                    ${q.visual.svgContent}
                    <div class="visual-caption" style="font-size: 9.5pt; color: #475569; font-style: italic; margin-top: 6px;">
                      Figure ${q.questionNumber}: ${q.visual.caption || q.visual.title || 'Instructional Diagram'}
                    </div>
                  </div>
                ` : ''}

                ${q.type === 'Multiple Choice' && q.options ? `
                  <div>
                    ${q.options.map(opt => `
                      <div class="mc-option">
                        <span class="mc-bubble"></span>
                        <span>${opt}</span>
                      </div>
                    `).join('')}
                  </div>
                ` : ''}

                ${q.type === 'True/False' ? `
                  <div style="margin: 8px 0 12px 10px; font-weight: 600;">
                    Answer [ TRUE / FALSE ]: ________________________
                  </div>
                ` : ''}

                ${q.type === 'Fill in the Blank' ? `
                  <div style="margin: 8px 0 12px 10px;">
                    Answer: __________________________________________________
                  </div>
                ` : ''}

                ${q.type === 'Matching' && q.matchingPairs ? `
                  <table style="width: 100%; border-collapse: collapse; margin-top: 8px;">
                    ${q.matchingPairs.map(p => `
                      <tr>
                        <td style="padding: 4px 8px; border: 1px solid #cbd5e1; font-weight: 600; width: 40%;">${p.left}</td>
                        <td style="padding: 4px 8px; border: 1px solid #cbd5e1; width: 60%;">[ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ] &nbsp; ${p.right}</td>
                      </tr>
                    `).join('')}
                  </table>
                ` : ''}

                ${q.type === 'Problem Solving' ? `
                  <div class="workspace-box">
                    <span class="workspace-label">Workspace / Show your working:</span>
                    <div class="workspace-answer-line">
                      <span>Final Answer: </span>
                      <div class="field-line" style="margin-left: 8px;"></div>
                    </div>
                  </div>
                ` : ''}

                ${q.type === 'Short Answer' || q.type === 'Extended Response' ? `
                  <div>
                    ${Array.from({ length: q.type === 'Extended Response' ? (q.answerLines || 6) : (q.answerLines || 3) }).map(() => `
                      <div class="ruled-line"></div>
                    `).join('')}
                  </div>
                ` : ''}

                ${isTeacher ? `
                  <div class="answer-key-box">
                    <strong>Solution:</strong> ${q.correctAnswer}
                    ${q.markingGuidance ? `<br/><span style="color: #1e3a8a;"><strong>Guidance:</strong> ${q.markingGuidance}</span>` : ''}
                  </div>
                ` : ''}
              </div>
            `).join('')}
          </div>
        ` : ''}

        ${isTeacher || isRubricOnly ? `
          <div class="${!isRubricOnly ? 'page-break' : ''}">
            <div class="header-box">
              <div class="school-title">${test.schoolName || 'SAN JUAN BOSCO R.C. SCHOOL'}</div>
              <div class="assessment-title">TEACHER ANSWER KEY & MARKING RUBRIC</div>
              <div class="meta-line">${test.classLevel} ${test.subject} • Cycle ${test.cycle} Week ${test.week} • Total Marks: ${test.totalMarks}</div>
            </div>

            <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
              <thead>
                <tr style="background-color: #f1f5f9; text-align: left; font-size: 10pt;">
                  <th style="padding: 6px 8px; border: 1px solid #cbd5e1;">Q#</th>
                  <th style="padding: 6px 8px; border: 1px solid #cbd5e1;">Type</th>
                  <th style="padding: 6px 8px; border: 1px solid #cbd5e1;">Taught Topic / Outcome</th>
                  <th style="padding: 6px 8px; border: 1px solid #cbd5e1;">Correct Answer</th>
                  <th style="padding: 6px 8px; border: 1px solid #cbd5e1;">Marks & Marking Criteria</th>
                </tr>
              </thead>
              <tbody style="font-size: 10pt;">
                ${test.questions.map(q => `
                  <tr>
                    <td style="padding: 6px 8px; border: 1px solid #cbd5e1; font-weight: 700;">${q.questionNumber}</td>
                    <td style="padding: 6px 8px; border: 1px solid #cbd5e1;">${q.type}</td>
                    <td style="padding: 6px 8px; border: 1px solid #cbd5e1;">${q.lessonTopicSource}</td>
                    <td style="padding: 6px 8px; border: 1px solid #cbd5e1; font-weight: 600; color: #047857;">${q.correctAnswer}</td>
                    <td style="padding: 6px 8px; border: 1px solid #cbd5e1;">
                      <strong>${q.marks} mark${q.marks > 1 ? 's' : ''}:</strong> ${q.markingGuidance || 'Award full marks for correct answer.'}
                      ${q.visual ? `
                        <div style="margin-top: 4px; font-size: 8.5pt; color: #4338ca; background: #eef2ff; padding: 3px 6px; border-radius: 4px;">
                          <strong>Diagram / Visual:</strong> ${q.visual.title || 'Instructional Diagram'}
                          ${q.visual.labels && q.visual.labels.length > 0 ? `<br/><span style="color: #312e81;">Key: ${q.visual.labels.map(l => `${l.id}: ${l.target || l.text}`).join(' | ')}</span>` : ''}
                        </div>
                      ` : ''}
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        ` : ''}

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}

/**
 * Format clean Markdown / Text for copying
 */
export function exportWeeklyTestToText(test: WeeklyTest, includeAnswerKey: boolean = false): string {
  let text = `# ${test.schoolName}\n`;
  text += `## ${test.classLevel} ${test.subject} Assessment\n`;
  text += `**Cycle ${test.cycle} • Week ${test.week} • Academic Year ${test.academicYear}**\n`;
  text += `**Topic:** ${test.weeklyTopic}\n`;
  text += `**Time Allowed:** ${test.timeAllowed} | **Total Marks:** ${test.totalMarks}\n\n`;
  text += `**Student Name:** ________________________  **Date:** ____________\n\n`;
  text += `**Instructions:** ${test.instructions}\n\n`;
  text += `---\n\n`;

  test.questions.forEach(q => {
    text += `### Question ${q.questionNumber} [${q.marks} ${q.marks === 1 ? 'mark' : 'marks'}] (${q.type})\n`;
    text += `${q.questionText}\n\n`;
    if (q.visual) {
      text += `[VISUAL / FIGURE ${q.questionNumber}: ${q.visual.title || 'Instructional Diagram'}] - ${q.visual.caption || q.visual.altText}\n\n`;
    }
    if (q.type === 'Multiple Choice' && q.options) {
      q.options.forEach(o => {
        text += `- ( ) ${o}\n`;
      });
      text += `\n`;
    } else if (q.type === 'True/False') {
      text += `Answer [ TRUE / FALSE ]: ________\n\n`;
    } else if (q.type === 'Fill in the Blank') {
      text += `Answer: ____________________\n\n`;
    } else if (q.type === 'Matching' && q.matchingPairs) {
      q.matchingPairs.forEach(p => {
        text += `- ${p.left}  ----->  [     ] ${p.right}\n`;
      });
      text += `\n`;
    } else if (q.type === 'Problem Solving') {
      text += `[ Workspace Box: Show all intermediate working ]\n\nFinal Answer: ____________________\n\n`;
    } else {
      text += `____________________________________________________\n`;
      text += `____________________________________________________\n\n`;
    }
  });

  if (includeAnswerKey) {
    text += `\n\n========================================\n`;
    text += `TEACHER ANSWER KEY & MARKING CRITERIA\n`;
    text += `========================================\n\n`;
    test.questions.forEach(q => {
      text += `Q${q.questionNumber} (${q.type} - ${q.marks}m):\n`;
      text += `Correct Answer: ${q.correctAnswer}\n`;
      if (q.markingGuidance) text += `Marking Guidance: ${q.markingGuidance}\n`;
      text += `Source Topic: ${q.lessonTopicSource}\n\n`;
    });
  }

  return text;
}

/**
 * Storage helpers for saved weekly tests
 */
const STORAGE_KEY = 'lc_saved_weekly_tests';

export function saveWeeklyTestToStorage(test: WeeklyTest): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const existing: WeeklyTest[] = raw ? JSON.parse(raw) : [];
    const testWithId = {
      ...test,
      id: test.id || `test-${test.classLevel}-${test.subject}-c${test.cycle}-w${test.week}-${Date.now()}`,
      updatedAt: new Date().toISOString()
    };
    const filtered = existing.filter(t => t.id !== testWithId.id);
    filtered.unshift(testWithId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (err) {
    console.warn('Could not save test to localStorage:', err);
  }
}

export function loadWeeklyTestsFromStorage(): WeeklyTest[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.warn('Could not load tests from localStorage:', err);
    return [];
  }
}
