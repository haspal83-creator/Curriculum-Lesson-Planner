import React from 'react';
import { LessonPlan } from '../types';
import { resolveCompleteLessonResources } from '../lib/lessonExportResolver';

interface PrintableLessonPlanProps {
  plan: LessonPlan;
  teacherName?: string;
  schoolName?: string;
}

export const PrintableLessonPlan: React.FC<PrintableLessonPlanProps> = ({ 
  plan, 
  teacherName, 
  schoolName 
}) => {
  const res = resolveCompleteLessonResources(plan, { schoolName, teacherName });

  return (
    <div className="bg-white text-slate-900 p-8 max-w-5xl mx-auto font-sans text-xs leading-relaxed printable-document">
      {/* ==================================================== */}
      {/* SECTION 1: DOCUMENT HEADER                          */}
      {/* ==================================================== */}
      <div className="text-center border-b-2 border-slate-900 pb-3 mb-6">
        <h1 className="text-xl font-black text-slate-900 uppercase tracking-wider">
          {res.schoolName}
        </h1>
        <p className="text-xs font-bold text-slate-600 uppercase tracking-widest mt-0.5">
          Official Lesson Plan & Instructional Resource Pack
        </p>
        <p className="text-sm font-bold text-blue-900 mt-2">
          {res.lessonTitle}
          {res.subtopic && res.subtopic !== 'Not provided' ? ` — ${res.subtopic}` : ''}
        </p>
      </div>

      {/* ==================================================== */}
      {/* SECTION 2: LESSON INFORMATION TABLE                 */}
      {/* ==================================================== */}
      <table className="w-full border-collapse border border-slate-300 mb-6 text-xs">
        <tbody>
          <tr>
            <td className="w-[18%] bg-slate-100 border border-slate-300 p-2 font-bold text-slate-800">School</td>
            <td className="w-[32%] border border-slate-300 p-2 font-semibold text-slate-900">{res.schoolName}</td>
            <td className="w-[18%] bg-slate-100 border border-slate-300 p-2 font-bold text-slate-800">Teacher</td>
            <td className="w-[32%] border border-slate-300 p-2">{res.teacherName}</td>
          </tr>
          <tr>
            <td className="bg-slate-100 border border-slate-300 p-2 font-bold text-slate-800">Grade / Class</td>
            <td className="border border-slate-300 p-2">{res.grade}</td>
            <td className="bg-slate-100 border border-slate-300 p-2 font-bold text-slate-800">Subject</td>
            <td className="border border-slate-300 p-2 font-semibold">{res.subject}</td>
          </tr>
          <tr>
            <td className="bg-slate-100 border border-slate-300 p-2 font-bold text-slate-800">Date</td>
            <td className="border border-slate-300 p-2">{res.dateStr}</td>
            <td className="bg-slate-100 border border-slate-300 p-2 font-bold text-slate-800">Duration</td>
            <td className="border border-slate-300 p-2">{res.duration}</td>
          </tr>
          <tr>
            <td className="bg-slate-100 border border-slate-300 p-2 font-bold text-slate-800">Topic</td>
            <td className="border border-slate-300 p-2 font-semibold">{res.topic}</td>
            <td className="bg-slate-100 border border-slate-300 p-2 font-bold text-slate-800">Subtopic</td>
            <td className="border border-slate-300 p-2">{res.subtopic}</td>
          </tr>
        </tbody>
      </table>

      {/* ==================================================== */}
      {/* SECTION 3: CURRICULUM ALIGNMENT TABLE               */}
      {/* ==================================================== */}
      <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide border-b border-slate-300 pb-1 mb-2 mt-4">
        Curriculum Alignment
      </h2>
      <table className="w-full border-collapse border border-slate-300 mb-6 text-xs">
        <tbody>
          <tr>
            <td className="w-[28%] bg-slate-100 border border-slate-300 p-2 font-bold text-slate-800">Curriculum / Framework</td>
            <td className="w-[72%] border border-slate-300 p-2">Belize National Primary School Curriculum Framework</td>
          </tr>
          <tr>
            <td className="bg-slate-100 border border-slate-300 p-2 font-bold text-slate-800">Cycle / Strand</td>
            <td className="border border-slate-300 p-2">Cycle {res.cycle} | Strand: {res.strand}</td>
          </tr>
          <tr>
            <td className="bg-slate-100 border border-slate-300 p-2 font-bold text-slate-800">Curriculum Outcome</td>
            <td className="border border-slate-300 p-2">{res.learningOutcome}</td>
          </tr>
          <tr>
            <td className="bg-slate-100 border border-slate-300 p-2 font-bold text-slate-800">Competency / Standard</td>
            <td className="border border-slate-300 p-2">{res.competencies}</td>
          </tr>
          <tr>
            <td className="bg-slate-100 border border-slate-300 p-2 font-bold text-slate-800">Curriculum Code</td>
            <td className="border border-slate-300 p-2 font-mono font-bold text-blue-900">{res.curriculumCode}</td>
          </tr>
        </tbody>
      </table>

      {/* ==================================================== */}
      {/* SECTION 4: LEARNING OBJECTIVES & SUCCESS CRITERIA   */}
      {/* ==================================================== */}
      <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide border-b border-slate-300 pb-1 mb-2 mt-4">
        Learning Objectives and Success Criteria
      </h2>
      <table className="w-full border-collapse border border-slate-300 mb-6 text-xs">
        <tbody>
          <tr>
            <td className="w-[28%] bg-slate-100 border border-slate-300 p-2 font-bold text-slate-800">Shared Condition</td>
            <td className="w-[72%] border border-slate-300 p-2 italic">{res.condition}</td>
          </tr>
          <tr>
            <td className="bg-slate-100 border border-slate-300 p-2 font-bold text-slate-800">Cognitive Domain</td>
            <td className="border border-slate-300 p-2">{res.cognitive}</td>
          </tr>
          <tr>
            <td className="bg-slate-100 border border-slate-300 p-2 font-bold text-slate-800">Psychomotor / Skills</td>
            <td className="border border-slate-300 p-2">{res.psychomotor}</td>
          </tr>
          <tr>
            <td className="bg-slate-100 border border-slate-300 p-2 font-bold text-slate-800">Affective Domain</td>
            <td className="border border-slate-300 p-2">{res.affective}</td>
          </tr>
          <tr>
            <td className="bg-slate-100 border border-slate-300 p-2 font-bold text-slate-800">Success Criteria</td>
            <td className="border border-slate-300 p-2">
              <ul className="list-disc pl-4 space-y-1">
                {res.successCriteria.map((sc, i) => (
                  <li key={i} className="font-medium text-emerald-900">{sc}</li>
                ))}
              </ul>
            </td>
          </tr>
        </tbody>
      </table>

      {/* ==================================================== */}
      {/* SECTION 5: LESSON OVERVIEW                          */}
      {/* ==================================================== */}
      <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide border-b border-slate-300 pb-1 mb-2 mt-4">
        Lesson Overview
      </h2>
      <table className="w-full border-collapse border border-slate-300 mb-6 text-xs">
        <tbody>
          <tr>
            <td className="w-[28%] bg-slate-100 border border-slate-300 p-2 font-bold text-slate-800">Lesson Description</td>
            <td className="w-[72%] border border-slate-300 p-2">{res.lessonDescription}</td>
          </tr>
          <tr>
            <td className="bg-slate-100 border border-slate-300 p-2 font-bold text-slate-800">Prior Knowledge</td>
            <td className="border border-slate-300 p-2">{res.priorKnowledge}</td>
          </tr>
          <tr>
            <td className="bg-slate-100 border border-slate-300 p-2 font-bold text-slate-800">Key Vocabulary</td>
            <td className="border border-slate-300 p-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {res.vocabularyList.map((v, i) => (
                  <div key={i} className="border-b border-slate-100 pb-1">
                    <span className="font-bold text-slate-900">{v.term}:</span>{' '}
                    <span className="text-slate-700">{v.definition}</span>
                  </div>
                ))}
              </div>
            </td>
          </tr>
          <tr>
            <td className="bg-slate-100 border border-slate-300 p-2 font-bold text-slate-800">Materials and Resources</td>
            <td className="border border-slate-300 p-2">
              <ul className="list-disc pl-4 space-y-1">
                {res.materialsList.map((m, i) => (
                  <li key={i}>
                    <span className="font-semibold">{m.name}</span>
                    {m.purpose ? ` — ${m.purpose}` : ''}
                  </li>
                ))}
              </ul>
            </td>
          </tr>
          <tr>
            <td className="bg-slate-100 border border-slate-300 p-2 font-bold text-slate-800">Teaching Strategy & Methodology</td>
            <td className="border border-slate-300 p-2 font-medium">
              {res.teachingStrategy} | {res.methodology}
            </td>
          </tr>
          <tr>
            <td className="bg-slate-100 border border-slate-300 p-2 font-bold text-slate-800">Mastery Target</td>
            <td className="border border-slate-300 p-2 font-semibold text-emerald-900">{res.masteryTarget}</td>
          </tr>
        </tbody>
      </table>

      {/* ==================================================== */}
      {/* SECTION 6: LESSON PROCEDURE (5-STAGE EXECUTION)     */}
      {/* ==================================================== */}
      <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide border-b border-slate-300 pb-1 mb-2 mt-4">
        Lesson Procedure (5-Stage Instructional Execution)
      </h2>
      <table className="w-full border-collapse border border-slate-300 mb-6 text-xs">
        <thead>
          <tr className="bg-slate-100 text-slate-900 font-bold">
            <th className="w-[18%] border border-slate-300 p-2 text-left">Phase / Time</th>
            <th className="w-[30%] border border-slate-300 p-2 text-left">Teacher Actions</th>
            <th className="w-[28%] border border-slate-300 p-2 text-left">Student Actions</th>
            <th className="w-[24%] border border-slate-300 p-2 text-left">Assessment & Check</th>
          </tr>
        </thead>
        <tbody>
          {res.stages.map((stage) => (
            <tr key={stage.stageNumber} className="align-top">
              <td className="bg-slate-50 border border-slate-300 p-2">
                <div className="font-bold text-slate-900">{stage.title}</div>
                <div className="text-xs font-semibold text-blue-800 mt-1">({stage.duration})</div>
                {stage.resources.length > 0 && (
                  <div className="text-[10px] text-slate-500 mt-2">
                    <span className="font-bold">Resources:</span> {stage.resources.join(', ')}
                  </div>
                )}
              </td>
              <td className="border border-slate-300 p-2">
                <ul className="list-disc pl-4 space-y-1">
                  {stage.teacherActions.map((act, i) => (
                    <li key={i}>{act}</li>
                  ))}
                </ul>
              </td>
              <td className="border border-slate-300 p-2">
                <ul className="list-disc pl-4 space-y-1">
                  {stage.studentActions.map((act, i) => (
                    <li key={i}>{act}</li>
                  ))}
                </ul>
              </td>
              <td className="border border-slate-300 p-2 text-slate-800">
                <div className="font-medium">{stage.assessment}</div>
                {stage.keyQuestions.length > 0 && (
                  <div className="mt-2 text-[11px] text-slate-600 bg-slate-50 p-1.5 rounded border border-slate-200">
                    <span className="font-bold text-slate-800">Key Question:</span> {stage.keyQuestions[0]}
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ==================================================== */}
      {/* SECTION 7: QUESTIONING STRATEGIES TABLE             */}
      {/* ==================================================== */}
      <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide border-b border-slate-300 pb-1 mb-2 mt-4">
        Questioning Strategies (Cognitive Hierarchy)
      </h2>
      <table className="w-full border-collapse border border-slate-300 mb-6 text-xs">
        <thead>
          <tr className="bg-slate-100 text-slate-900 font-bold">
            <th className="w-[30%] border border-slate-300 p-2 text-left">Cognitive Level</th>
            <th className="w-[70%] border border-slate-300 p-2 text-left">Target Question</th>
          </tr>
        </thead>
        <tbody>
          {res.questioningStrategies.map((q, i) => (
            <tr key={i}>
              <td className="bg-slate-50 border border-slate-300 p-2 font-bold text-slate-800">{q.level}</td>
              <td className="border border-slate-300 p-2 text-slate-900">{q.question}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ==================================================== */}
      {/* SECTION 8: EXPLICIT TEACHER SCRIPT                  */}
      {/* ==================================================== */}
      {res.teacherScript.hasScript && (
        <div className="mb-6">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide border-b border-slate-300 pb-1 mb-2 mt-4">
            {res.teacherScript.title}
          </h2>
          <div className="border border-slate-300 rounded p-4 bg-slate-50/50 space-y-4">
            {res.teacherScript.sections.map((sec, idx) => (
              <div key={idx} className="border-b border-slate-200 pb-3 last:border-b-0 last:pb-0">
                <div className="font-bold text-blue-900 mb-1">{sec.heading}</div>
                <div className="text-slate-800 italic bg-white p-3 rounded border border-slate-200 font-serif leading-relaxed">
                  {sec.dialogue}
                </div>
                {sec.notes && (
                  <div className="text-[11px] text-slate-500 mt-1 font-sans">
                    <span className="font-bold">Teacher Note:</span> {sec.notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* SECTION 9: STUDENT MATERIALS OVERVIEW               */}
      {/* ==================================================== */}
      <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide border-b border-slate-300 pb-1 mb-2 mt-4">
        Student Materials and Instructional Handouts
      </h2>
      <ul className="list-disc pl-5 mb-6 text-xs space-y-1">
        {res.studentMaterialsOverview.map((item, idx) => (
          <li key={idx} className="font-semibold text-slate-800">{item}</li>
        ))}
      </ul>

      {/* ==================================================== */}
      {/* SECTION 10: COMPLETE READING PASSAGE (PRINT READY)  */}
      {/* ==================================================== */}
      {res.readingPassage && res.readingPassage.hasPassage && (
        <div className="print:break-before-page break-before-page mb-8 pt-4">
          <div className="border-2 border-slate-900 p-6 rounded-lg bg-white">
            <div className="text-center border-b-2 border-slate-900 pb-3 mb-4">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block">
                Official Student Reading Passage
              </span>
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-wide mt-1">
                {res.readingPassage.title}
              </h3>
              <div className="flex justify-center gap-4 text-xs font-semibold text-slate-600 mt-2">
                <span>Grade: {res.readingPassage.gradeLevel}</span>
                <span>•</span>
                <span>Genre: {res.readingPassage.genre}</span>
                <span>•</span>
                <span>Word Count: {res.readingPassage.wordCount} words</span>
              </div>
            </div>

            {/* Highlighted Vocabulary Box */}
            {res.readingPassage.vocabularyHighlighted && res.readingPassage.vocabularyHighlighted.length > 0 && (
              <div className="mb-4 bg-blue-50 border border-blue-200 p-3 rounded text-xs">
                <span className="font-bold text-blue-950 block mb-1">Target Morphological Words in Passage:</span>
                <span className="font-medium text-blue-900">
                  {res.readingPassage.vocabularyHighlighted.join(' • ')}
                </span>
              </div>
            )}

            {/* Passage Text */}
            <div className="font-serif text-sm leading-relaxed text-slate-900 space-y-4 mb-6">
              {res.readingPassage.paragraphs.map((p, idx) => (
                <p key={idx} className="text-justify indent-6">
                  {p}
                </p>
              ))}
            </div>

            {/* Comprehension Questions */}
            <div className="border-t-2 border-slate-300 pt-4 mt-6">
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-3">
                Comprehension & Word Analysis Questions
              </h4>
              <div className="space-y-4 text-xs">
                {res.readingPassage.comprehensionQuestions.map((cq) => (
                  <div key={cq.number} className="bg-slate-50 p-3 rounded border border-slate-200">
                    <div className="font-bold text-slate-900">
                      {cq.number}. [{cq.cognitiveLevel}]: {cq.question}
                    </div>
                    <div className="mt-3 pt-2 border-t border-slate-200 text-slate-700">
                      <span className="font-bold text-slate-900">Student Response Lines:</span>
                      <div className="border-b border-dotted border-slate-400 mt-3 h-4"></div>
                      <div className="border-b border-dotted border-slate-400 mt-3 h-4"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Comprehension Answer Key */}
            <div className="border-t border-slate-300 pt-4 mt-6 bg-slate-50 p-4 rounded text-xs">
              <h5 className="font-bold text-slate-900 uppercase tracking-wider mb-2">
                Reading Passage Answer Key & Teacher Evaluation Notes
              </h5>
              <div className="space-y-3">
                {res.readingPassage.comprehensionQuestions.map((cq) => (
                  <div key={cq.number}>
                    <span className="font-bold text-blue-900">Question {cq.number} Answer Key:</span>{' '}
                    <span className="text-slate-800">{cq.answer}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* SECTION 11: ANCHOR CHART BLUEPRINT (PRINT READY)    */}
      {/* ==================================================== */}
      {res.anchorChart && res.anchorChart.hasChart && (
        <div className="print:break-before-page break-before-page mb-8 pt-4">
          <div className="border-4 border-double border-slate-900 p-6 rounded-lg bg-white">
            <div className="text-center border-b-2 border-slate-900 pb-3 mb-4">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block">
                Classroom Display Anchor Chart Blueprint
              </span>
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-wide mt-1">
                {res.anchorChart.title}
              </h3>
              <p className="text-xs font-bold text-blue-900 mt-1">
                {res.anchorChart.headerText}
              </p>
            </div>

            {/* Prefix / Suffix Morphology Matrix */}
            {res.anchorChart.tableRows && res.anchorChart.tableRows.length > 0 && (
              <div className="mb-6">
                <table className="w-full border-collapse border border-slate-400 text-xs">
                  <thead>
                    <tr className="bg-slate-100 font-bold text-slate-900 text-center">
                      {res.anchorChart.tableHeaders.map((th, i) => (
                        <th key={i} className="border border-slate-400 p-2">{th}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {res.anchorChart.tableRows.map((row, i) => (
                      <tr key={i} className="text-center">
                        <td className="border border-slate-400 p-2 font-mono font-bold text-blue-900 bg-blue-50/50">{row.col1}</td>
                        <td className="border border-slate-400 p-2 font-medium text-slate-800">{row.col2}</td>
                        <td className="border border-slate-400 p-2 font-bold text-emerald-900">{row.col3}</td>
                        <td className="border border-slate-400 p-2 text-slate-700 text-left pl-3">{row.col4}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Golden Rules */}
            <div className="mb-6">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide mb-2">
                Core Rules and Systematic Definitions
              </h4>
              <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-800">
                {res.anchorChart.keyRulesOrDefinitions.map((rule, idx) => (
                  <li key={idx} className="font-medium">{rule}</li>
                ))}
              </ul>
            </div>

            {/* Visual Diagram Instructions */}
            <div className="bg-slate-50 border border-slate-300 p-4 rounded mb-6 text-xs">
              <span className="font-bold text-slate-900 block mb-1 uppercase tracking-wide">
                Classroom Whiteboard Diagram & Visual Layout Guide:
              </span>
              <p className="text-slate-700 leading-relaxed">
                {res.anchorChart.visualDiagramDescription}
              </p>
            </div>

            {/* Student Takeaway */}
            <div className="bg-blue-900 text-white p-4 rounded text-center">
              <span className="text-[10px] uppercase tracking-widest text-blue-200 block font-bold mb-1">
                Student Golden Takeaway
              </span>
              <p className="text-sm font-bold font-serif leading-relaxed">
                "{res.anchorChart.studentKeyTakeaway}"
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* SECTION 12: STUDENT PRACTICE WORKSHEET (PRINT READY)*/}
      {/* ==================================================== */}
      {res.worksheet && res.worksheet.hasWorksheet && (
        <div className="print:break-before-page break-before-page mb-8 pt-4">
          <div className="border-2 border-slate-900 p-6 rounded-lg bg-white">
            {/* Student Worksheet Header */}
            <div className="border-b-2 border-slate-900 pb-3 mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-sm text-slate-900">{res.schoolName}</span>
                <span className="font-semibold text-xs text-slate-600">Grade: {res.grade}</span>
              </div>
              <h3 className="text-base font-black text-center text-slate-900 uppercase tracking-wider mb-4">
                {res.worksheet.title}
              </h3>
              <div className="grid grid-cols-3 gap-4 text-xs font-semibold text-slate-800 pt-2 border-t border-slate-200">
                <div>Name: _______________________________</div>
                <div>Date: ____________________</div>
                <div className="text-right">Score: _______ / 10</div>
              </div>
            </div>

            <p className="text-xs italic text-slate-600 mb-6 bg-slate-50 p-2 rounded border border-slate-200">
              <span className="font-bold text-slate-800">Instructions:</span> {res.worksheet.instructions}
            </p>

            {/* Worksheet Sections */}
            <div className="space-y-6">
              {res.worksheet.sections.map((sec, idx) => (
                <div key={idx} className="border border-slate-200 rounded p-4">
                  <h4 className="font-bold text-sm text-slate-900 mb-1">{sec.sectionTitle}</h4>
                  <p className="text-xs text-slate-600 mb-4">{sec.instructions}</p>
                  <div className="space-y-3 text-xs">
                    {sec.questions.map((q) => (
                      <div key={q.number} className="bg-slate-50/70 p-2.5 rounded border border-slate-200">
                        <span className="font-bold text-slate-900">{q.number}.</span>{' '}
                        <span className="text-slate-800 font-mono text-[11px]">{q.prompt}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Worksheet Answer Key */}
            {res.worksheet.answerKey && res.worksheet.answerKey.length > 0 && (
              <div className="border-t-2 border-slate-300 pt-4 mt-6 bg-slate-50 p-4 rounded text-xs">
                <h5 className="font-bold text-slate-900 uppercase tracking-wider mb-2">
                  Worksheet Teacher Answer Key & Model Responses
                </h5>
                <div className="space-y-3">
                  {res.worksheet.answerKey.map((akSec, i) => (
                    <div key={i}>
                      <span className="font-bold text-blue-900 block mb-1">{akSec.sectionTitle}:</span>
                      <ul className="list-disc pl-5 space-y-1">
                        {akSec.answers.map((ans) => (
                          <li key={ans.number}>
                            <span className="font-semibold">{ans.number}:</span> {ans.solution}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* SECTION 13: EXTENSION ACTIVITY                      */}
      {/* ==================================================== */}
      {res.extensionActivity && res.extensionActivity.hasActivity && (
        <div className="print:break-before-page break-before-page mb-8 pt-4">
          <div className="border-2 border-blue-900 p-6 rounded-lg bg-white">
            <div className="border-b-2 border-blue-900 pb-3 mb-4 text-center">
              <span className="text-[10px] font-bold uppercase tracking-widest text-blue-700 block">
                Advanced Conceptual Extension Pack
              </span>
              <h3 className="text-base font-black text-slate-900 uppercase tracking-wide mt-1">
                {res.extensionActivity.title}
              </h3>
            </div>
            <p className="text-xs text-slate-700 italic mb-4">{res.extensionActivity.instructions}</p>
            <div className="space-y-3 text-xs mb-6">
              {res.extensionActivity.tasks.map((task, idx) => (
                <div key={idx} className="bg-blue-50/50 p-3 rounded border border-blue-100">
                  <span className="font-bold text-blue-900">Task {idx + 1}:</span>{' '}
                  <span className="text-slate-800">{task}</span>
                </div>
              ))}
            </div>
            {res.extensionActivity.leadershipRole && (
              <div className="bg-slate-50 p-3 rounded border border-slate-200 text-xs">
                <span className="font-bold text-slate-900">Student Leadership Role:</span>{' '}
                <span className="text-slate-700">{res.extensionActivity.leadershipRole}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* SECTION 14: DAILY EXIT TICKET (PRINT READY)         */}
      {/* ==================================================== */}
      {res.exitTicket && res.exitTicket.hasTicket && (
        <div className="print:break-before-page break-before-page mb-8 pt-4">
          <div className="border-2 border-slate-900 p-6 rounded-lg bg-white">
            {/* Student Exit Slip Header */}
            <div className="border-b-2 border-slate-900 pb-3 mb-4">
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-xs text-slate-900">{res.schoolName}</span>
                <span className="font-semibold text-xs text-slate-600">Class: {res.grade}</span>
              </div>
              <h3 className="text-base font-black text-center text-slate-900 uppercase tracking-wider mb-2">
                {res.exitTicket.title}
              </h3>
              <div className="grid grid-cols-3 gap-4 text-xs font-semibold text-slate-800 pt-2 border-t border-slate-200">
                <div>Name: _______________________________</div>
                <div>Date: ____________________</div>
                <div className="text-right">Score: _______ / {res.exitTicket.questions.length}</div>
              </div>
            </div>

            <p className="text-xs italic text-slate-600 mb-4 bg-slate-50 p-2 rounded border border-slate-200">
              <span className="font-bold text-slate-800">Prompt:</span> {res.exitTicket.prompt}
            </p>

            {/* Questions */}
            <div className="space-y-4 mb-6">
              {res.exitTicket.questions.map((q) => (
                <div key={q.number} className="border border-slate-200 rounded p-3 text-xs bg-slate-50/50">
                  <div className="font-bold text-slate-900 mb-2">
                    Question {q.number} ({q.points} pt): {q.question}
                  </div>
                  <div className="border-b border-dotted border-slate-400 mt-4 h-4"></div>
                  <div className="border-b border-dotted border-slate-400 mt-4 h-4"></div>
                </div>
              ))}
            </div>

            {/* Exit Ticket Answer Key & Grouping Rule */}
            <div className="border-t-2 border-slate-300 pt-4 bg-slate-50 p-4 rounded text-xs space-y-3">
              <h5 className="font-bold text-slate-900 uppercase tracking-wider">
                Exit Ticket Answer Key & Diagnostic Action
              </h5>
              <div className="space-y-2">
                {res.exitTicket.questions.map((q) => (
                  <div key={q.number}>
                    <span className="font-bold text-blue-900">Question {q.number} Key:</span>{' '}
                    <span className="text-slate-800">{q.answerKey}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-slate-200 pt-2 mt-2 space-y-1 text-slate-700">
                <div><span className="font-bold">Scoring Guidance:</span> {res.exitTicket.scoringGuidance}</div>
                <div><span className="font-bold">Mastery Threshold:</span> {res.exitTicket.masteryThreshold}</div>
                <div><span className="font-bold">Grouping Rule Tomorrow:</span> {res.exitTicket.groupingRuleTomorrow}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* SECTION 15: DIFFERENTIATION FRAMEWORK               */}
      {/* ==================================================== */}
      <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide border-b border-slate-300 pb-1 mb-2 mt-6">
        Differentiation Framework (Inclusive Instructional Strategies)
      </h2>
      <table className="w-full border-collapse border border-slate-300 mb-6 text-xs">
        <thead>
          <tr className="bg-slate-100 text-slate-900 font-bold">
            <th className="w-[30%] border border-slate-300 p-2 text-left">Learner Profile</th>
            <th className="w-[70%] border border-slate-300 p-2 text-left">Instructional Scaffolding & Support Strategy</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="bg-slate-50 border border-slate-300 p-2 font-bold text-slate-800">
              Students Requiring Additional Support (Tier 1 & 2)
            </td>
            <td className="border border-slate-300 p-2">
              <ul className="list-disc pl-4 space-y-1">
                {res.differentiation.strugglingLearners.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </td>
          </tr>
          <tr>
            <td className="bg-slate-50 border border-slate-300 p-2 font-bold text-slate-800">
              On-Level Learners (Core Expectations)
            </td>
            <td className="border border-slate-300 p-2">
              <ul className="list-disc pl-4 space-y-1">
                {res.differentiation.onLevelLearners.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </td>
          </tr>
          <tr>
            <td className="bg-slate-50 border border-slate-300 p-2 font-bold text-slate-800">
              Advanced Learners (Extensions & Challenge)
            </td>
            <td className="border border-slate-300 p-2">
              <ul className="list-disc pl-4 space-y-1">
                {res.differentiation.advancedLearners.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </td>
          </tr>
          <tr>
            <td className="bg-slate-50 border border-slate-300 p-2 font-bold text-slate-800">
              Inclusion Supports (Universal Accessibility)
            </td>
            <td className="border border-slate-300 p-2">
              <ul className="list-disc pl-4 space-y-1">
                {res.differentiation.inclusionSupports.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </td>
          </tr>
        </tbody>
      </table>

      {/* ==================================================== */}
      {/* SECTION 16: ASSESSMENT & EVALUATION RUBRIC          */}
      {/* ==================================================== */}
      <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide border-b border-slate-300 pb-1 mb-2 mt-4">
        Assessment and Evaluation
      </h2>
      <table className="w-full border-collapse border border-slate-300 mb-4 text-xs">
        <thead>
          <tr className="bg-slate-100 text-slate-900 font-bold">
            <th className="w-[30%] border border-slate-300 p-2 text-left">Assessment Phase</th>
            <th className="w-[70%] border border-slate-300 p-2 text-left">Method / Evidence of Learning</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="bg-slate-50 border border-slate-300 p-2 font-bold text-slate-800">Formative Assessment</td>
            <td className="border border-slate-300 p-2">{res.assessment.formative}</td>
          </tr>
          <tr>
            <td className="bg-slate-50 border border-slate-300 p-2 font-bold text-slate-800">Guided Practice</td>
            <td className="border border-slate-300 p-2">{res.assessment.guidedPractice}</td>
          </tr>
          <tr>
            <td className="bg-slate-50 border border-slate-300 p-2 font-bold text-slate-800">Independent Practice</td>
            <td className="border border-slate-300 p-2">{res.assessment.independentPractice}</td>
          </tr>
          <tr>
            <td className="bg-slate-50 border border-slate-300 p-2 font-bold text-slate-800">Exit Ticket</td>
            <td className="border border-slate-300 p-2">{res.assessment.exitTicket}</td>
          </tr>
          <tr>
            <td className="bg-slate-50 border border-slate-300 p-2 font-bold text-slate-800">Evaluation Criteria</td>
            <td className="border border-slate-300 p-2 font-semibold text-emerald-900">{res.assessment.evaluationCriteria}</td>
          </tr>
        </tbody>
      </table>

      {/* Assessment Rubric Table */}
      {res.assessment.rubric && res.assessment.rubric.length > 0 && (
        <div className="mb-6">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
            Assessment Evaluation Rubric
          </h3>
          <table className="w-full border-collapse border border-slate-300 text-xs">
            <thead>
              <tr className="bg-slate-100 text-slate-900 font-bold text-center">
                <th className="w-[25%] border border-slate-300 p-2 text-left">Criteria</th>
                <th className="w-[25%] border border-slate-300 p-2">Exemplary (4)</th>
                <th className="w-[25%] border border-slate-300 p-2">Proficient (3)</th>
                <th className="w-[25%] border border-slate-300 p-2">Developing (2)</th>
              </tr>
            </thead>
            <tbody>
              {res.assessment.rubric.map((r, i) => (
                <tr key={i} className="align-top">
                  <td className="bg-slate-50 border border-slate-300 p-2 font-bold text-slate-900">{r.criteria}</td>
                  <td className="border border-slate-300 p-2 text-slate-800">{r.exemplary}</td>
                  <td className="border border-slate-300 p-2 text-slate-800">{r.proficient}</td>
                  <td className="border border-slate-300 p-2 text-slate-800">{r.developing}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ==================================================== */}
      {/* SECTION 17: CLOSURE & SYNTHESIS                     */}
      {/* ==================================================== */}
      <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide border-b border-slate-300 pb-1 mb-2 mt-4">
        Lesson Closure & Synthesis
      </h2>
      <ul className="list-disc pl-5 mb-6 text-xs space-y-1">
        {res.closure.map((c, i) => (
          <li key={i}>{c}</li>
        ))}
      </ul>

      {/* ==================================================== */}
      {/* SECTION 18: TEACHER REFLECTION                      */}
      {/* ==================================================== */}
      <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide border-b border-slate-300 pb-1 mb-2 mt-4">
        Teacher Reflection & Post-Lesson Notes
      </h2>
      <table className="w-full border-collapse border border-slate-300 mb-6 text-xs">
        <thead>
          <tr className="bg-slate-100 font-bold text-slate-900">
            <th className="w-[32%] border border-slate-300 p-2 text-left">Reflection Focus</th>
            <th className="w-[68%] border border-slate-300 p-2 text-left">Post-Lesson Notes & Adjustments</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="bg-slate-50 border border-slate-300 p-2 font-bold text-slate-800">What went well?</td>
            <td className="border border-slate-300 p-3 min-h-[36px]">{res.reflection.whatWorked}</td>
          </tr>
          <tr>
            <td className="bg-slate-50 border border-slate-300 p-2 font-bold text-slate-800">What challenges occurred?</td>
            <td className="border border-slate-300 p-3 min-h-[36px]">{res.reflection.challenges}</td>
          </tr>
          <tr>
            <td className="bg-slate-50 border border-slate-300 p-2 font-bold text-slate-800">Which students require follow-up?</td>
            <td className="border border-slate-300 p-3 min-h-[36px]">{res.reflection.followUpStudents}</td>
          </tr>
          <tr>
            <td className="bg-slate-50 border border-slate-300 p-2 font-bold text-slate-800">What should be adjusted for next lesson?</td>
            <td className="border border-slate-300 p-3 min-h-[36px]">{res.reflection.adjustments}</td>
          </tr>
          <tr>
            <td className="bg-slate-50 border border-slate-300 p-2 font-bold text-slate-800">Next Steps & Connection</td>
            <td className="border border-slate-300 p-3 min-h-[36px]">{res.reflection.nextSteps}</td>
          </tr>
        </tbody>
      </table>

      {/* ==================================================== */}
      {/* SECTION 19: ADDITIONAL GENERATED ASSETS             */}
      {/* ==================================================== */}
      {res.additionalAssets && res.additionalAssets.length > 0 && (
        <div className="space-y-6 print:break-before-page break-before-page pt-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide border-b border-slate-300 pb-1 mb-4">
            Additional Generated Student Materials
          </h2>
          {res.additionalAssets.map((asset, i) => (
            <div key={i} className="border border-slate-300 p-4 rounded bg-white">
              <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider mb-2">
                {asset.title} ({asset.type})
              </h3>
              <div className="font-serif text-xs leading-relaxed text-slate-800 whitespace-pre-line mb-3">
                {asset.content}
              </div>
              {asset.answerKey && (
                <div className="border-t border-slate-200 pt-2 text-xs bg-slate-50 p-2 rounded">
                  <span className="font-bold text-blue-900">Answer Key:</span> {asset.answerKey}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
