import React from 'react';
import { Download, Printer, FileText, CheckCircle2 } from 'lucide-react';
import { LessonPlan } from '../types';
import { resolveCompleteLessonResources } from '../lib/lessonExportResolver';
import { exportToWord } from '../lib/exportUtils';

interface MasterReferenceDailyPlanTableProps {
  plan: LessonPlan;
  teacherName?: string;
  schoolName?: string;
  onDownloadWord?: () => void;
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

export const MasterReferenceDailyPlanTable: React.FC<MasterReferenceDailyPlanTableProps> = ({
  plan,
  teacherName,
  schoolName = 'SAN JUAN BOSCO R.C. SCHOOL',
  onDownloadWord
}) => {
  const res = resolveCompleteLessonResources(plan, { schoolName, teacherName });

  const subjectDisplay = res.subject || plan.subject || 'Mathematics';
  const headingTitle = `${subjectDisplay} Daily Plan`;

  const actualTeacher = teacherName || plan.studentTeacherName || (plan as any).teacherName || res.teacherName || 'Student Teacher';
  const actualDate = res.dateStr || plan.date || (plan as any).lessonDate || new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const classLevel = res.grade || plan.grade || (plan as any).class_level || 'Standard 4';
  const classSize = plan.classSize || (plan as any).class_size || '25-30 Students';
  const ageRange = plan.ageRange || (plan as any).age_range || getDefaultAgeRange(classLevel);
  const timeAndDuration = res.duration || plan.duration || '45 mins';
  const subtopicVal = (res.subtopic && res.subtopic !== 'Not provided' ? res.subtopic : '') || plan.subtopic || res.topic;

  const standardVal = res.strand 
    ? `Strand: ${res.strand}${res.curriculumCode ? ` | Code: ${res.curriculumCode}` : ''}` 
    : (plan.strand ? `Strand: ${plan.strand}` : 'Belize National Primary Curriculum Framework Standards');

  const competenciesVal = res.competencies || (plan as any).competencies || (plan as any).targetedCoreCompetencies || 'Critical Thinking, Communication, Collaboration, Problem Solving';

  const previousKnowledgeVal = res.priorKnowledge || plan.previousKnowledge || plan.priorKnowledgeActivation?.whatTheyKnow || 'Students have acquired foundational understanding and prerequisite skills relevant to this lesson.';

  const handleExport = async () => {
    if (onDownloadWord) {
      onDownloadWord();
    } else {
      await exportToWord(plan, actualTeacher, schoolName);
    }
  };

  return (
    <div className="w-full bg-white text-black p-4 sm:p-8 font-sans print:p-0">
      {/* Top Action Bar (Hidden on Print) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-gray-200 print:hidden">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-700">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Authoritative Reference Template (Monday 8th Mathematics Daily Plan.docx)</span>
          </div>
          <h2 className="text-xl font-black text-gray-900 mt-1">
            Exact Landscape 2-Column Table Grid
          </h2>
        </div>
        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          <button
            onClick={() => window.print()}
            className="flex-1 sm:flex-none px-4 py-2 text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl flex items-center justify-center gap-1.5 transition-colors border border-gray-300"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Table</span>
          </button>
          <button
            onClick={handleExport}
            className="flex-1 sm:flex-none px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download DOCX</span>
          </button>
        </div>
      </div>

      {/* DOCUMENT PREVIEW CONTAINER (Styled to match Word landscape layout) */}
      <div className="border border-gray-300 shadow-sm rounded-lg p-6 sm:p-10 bg-white max-w-6xl mx-auto print:border-none print:shadow-none print:p-0">
        
        {/* Centered Heading */}
        <h1 className="text-xl sm:text-2xl font-bold text-center mb-6 tracking-tight text-black">
          {headingTitle}
        </h1>

        {/* 2-Column Table Grid matching reference Word document */}
        <table className="w-full border-collapse border border-black text-sm text-left">
          <tbody>
            {/* 1. Student Teacher Name */}
            <tr className="border border-black">
              <td className="w-1/4 p-2.5 font-bold border-r border-black bg-white align-top">
                Student Teacher Name
              </td>
              <td className="w-3/4 p-2.5 border-black align-top">
                {actualTeacher}
              </td>
            </tr>

            {/* 2. Date */}
            <tr className="border border-black">
              <td className="w-1/4 p-2.5 font-bold border-r border-black bg-white align-top">
                Date
              </td>
              <td className="w-3/4 p-2.5 border-black align-top">
                {actualDate}
              </td>
            </tr>

            {/* 3. Subject */}
            <tr className="border border-black">
              <td className="w-1/4 p-2.5 font-bold border-r border-black bg-white align-top">
                Subject
              </td>
              <td className="w-3/4 p-2.5 border-black align-top">
                {subjectDisplay}
              </td>
            </tr>

            {/* 4. Topic */}
            <tr className="border border-black">
              <td className="w-1/4 p-2.5 font-bold border-r border-black bg-white align-top">
                Topic
              </td>
              <td className="w-3/4 p-2.5 border-black align-top font-semibold">
                {res.topic || plan.topic}
              </td>
            </tr>

            {/* 5. Sub-topic */}
            <tr className="border border-black">
              <td className="w-1/4 p-2.5 font-bold border-r border-black bg-white align-top">
                Sub-topic
              </td>
              <td className="w-3/4 p-2.5 border-black align-top">
                {subtopicVal}
              </td>
            </tr>

            {/* 6. Class Level */}
            <tr className="border border-black">
              <td className="w-1/4 p-2.5 font-bold border-r border-black bg-white align-top">
                Class Level
              </td>
              <td className="w-3/4 p-2.5 border-black align-top">
                {classLevel}
              </td>
            </tr>

            {/* 7. Class size */}
            <tr className="border border-black">
              <td className="w-1/4 p-2.5 font-bold border-r border-black bg-white align-top">
                Class size
              </td>
              <td className="w-3/4 p-2.5 border-black align-top">
                {classSize}
              </td>
            </tr>

            {/* 8. Age range */}
            <tr className="border border-black">
              <td className="w-1/4 p-2.5 font-bold border-r border-black bg-white align-top">
                Age range
              </td>
              <td className="w-3/4 p-2.5 border-black align-top">
                {ageRange}
              </td>
            </tr>

            {/* 9. Time & Duration */}
            <tr className="border border-black">
              <td className="w-1/4 p-2.5 font-bold border-r border-black bg-white align-top">
                Time &amp; Duration
              </td>
              <td className="w-3/4 p-2.5 border-black align-top">
                {timeAndDuration}
              </td>
            </tr>

            {/* 10. Previous Knowledge */}
            <tr className="border border-black">
              <td className="w-1/4 p-2.5 font-bold border-r border-black bg-white align-top">
                Previous Knowledge
              </td>
              <td className="w-3/4 p-2.5 border-black align-top leading-relaxed">
                {previousKnowledgeVal}
              </td>
            </tr>

            {/* 11. Targeted core-competency(ies) */}
            <tr className="border border-black">
              <td className="w-1/4 p-2.5 font-bold border-r border-black bg-white align-top">
                Targeted core-competency(ies)
              </td>
              <td className="w-3/4 p-2.5 border-black align-top leading-relaxed">
                {competenciesVal}
              </td>
            </tr>

            {/* 12. Content Standard/content strands */}
            <tr className="border border-black">
              <td className="w-1/4 p-2.5 font-bold border-r border-black bg-white align-top">
                Content Standard/content strands
              </td>
              <td className="w-3/4 p-2.5 border-black align-top leading-relaxed">
                {standardVal}
              </td>
            </tr>

            {/* 13. Learning Outcome(s) */}
            <tr className="border border-black">
              <td className="w-1/4 p-2.5 font-bold border-r border-black bg-white align-top">
                Learning Outcome(s)
              </td>
              <td className="w-3/4 p-2.5 border-black align-top font-medium leading-relaxed">
                {res.learningOutcome || plan.learningOutcome}
              </td>
            </tr>

            {/* 14. Behavioral Objectives */}
            <tr className="border border-black">
              <td className="w-1/4 p-2.5 font-bold border-r border-black bg-white align-top">
                Behavioral Objectives
              </td>
              <td className="w-3/4 p-2.5 border-black align-top space-y-1.5 leading-relaxed">
                {res.condition && res.condition !== 'Not provided' && (
                  <p><span className="font-bold">Condition:</span> <span className="italic">{res.condition}</span></p>
                )}
                {res.cognitive && res.cognitive !== 'Not provided' && (
                  <p className="flex items-start gap-2">
                    <span className="font-bold">• Cognitive:</span>
                    <span>{res.cognitive}</span>
                  </p>
                )}
                {res.psychomotor && res.psychomotor !== 'Not provided' && (
                  <p className="flex items-start gap-2">
                    <span className="font-bold">• Psychomotor:</span>
                    <span>{res.psychomotor}</span>
                  </p>
                )}
                {res.affective && res.affective !== 'Not provided' && (
                  <p className="flex items-start gap-2">
                    <span className="font-bold">• Affective:</span>
                    <span>{res.affective}</span>
                  </p>
                )}
                {Array.isArray(plan.specificObjectives) && plan.specificObjectives.map((obj, i) => (
                  <p key={i} className="flex items-start gap-2">
                    <span className="font-bold">•</span>
                    <span>{obj}</span>
                  </p>
                ))}
              </td>
            </tr>

            {/* 15. Content/concepts */}
            <tr className="border border-black">
              <td className="w-1/4 p-2.5 font-bold border-r border-black bg-white align-top">
                Content/concepts
              </td>
              <td className="w-3/4 p-2.5 border-black align-top space-y-2 leading-relaxed">
                {res.lessonDescription && <p>{res.lessonDescription}</p>}
                {res.vocabularyList && res.vocabularyList.length > 0 && (
                  <div className="mt-2 space-y-1">
                    <span className="font-bold block">Key Terminology:</span>
                    <ul className="list-disc pl-5 space-y-0.5">
                      {res.vocabularyList.map((v, i) => (
                        <li key={i}>
                          <span className="font-bold">{v.term}:</span> {v.definition}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </td>
            </tr>

            {/* 16. Curricular Linkages */}
            <tr className="border border-black">
              <td className="w-1/4 p-2.5 font-bold border-r border-black bg-white align-top">
                Curricular Linkages
              </td>
              <td className="w-3/4 p-2.5 border-black align-top space-y-1 leading-relaxed">
                <p><span className="font-bold">• Language Arts:</span> Interpreting word problems and academic terminology.</p>
                <p><span className="font-bold">• Science:</span> Measurement, observation data, and environmental applications.</p>
                <p><span className="font-bold">• Social Studies:</span> Practical trade, community transactions, and budgeting in Belize.</p>
              </td>
            </tr>

            {/* 17. Teaching-Learning Resources */}
            <tr className="border border-black">
              <td className="w-1/4 p-2.5 font-bold border-r border-black bg-white align-top">
                Teaching-Learning Resources
              </td>
              <td className="w-3/4 p-2.5 border-black align-top leading-relaxed">
                <ul className="list-disc pl-5 space-y-0.5">
                  {res.materialsList.length > 0 ? (
                    res.materialsList.map((m, i) => (
                      <li key={i}>
                        <span className="font-semibold">{m.name}</span>
                        {m.purpose ? ` — ${m.purpose}` : ''}
                      </li>
                    ))
                  ) : (
                    <li>Whiteboard/chalkboard, student notebooks, teacher visual guide, instructional manipulatives.</li>
                  )}
                </ul>
              </td>
            </tr>

            {/* 18. References */}
            <tr className="border border-black">
              <td className="w-1/4 p-2.5 font-bold border-r border-black bg-white align-top">
                References
              </td>
              <td className="w-3/4 p-2.5 border-black align-top leading-relaxed">
                {plan.source || (plan as any).references || 'Belize National Primary Curriculum Framework; Ministry of Education, Culture, Science & Technology (MoECST); Primary Teaching Guide.'}
              </td>
            </tr>

            {/* 19. Methodology */}
            <tr className="border border-black">
              <td className="w-1/4 p-2.5 font-bold border-r border-black bg-white align-top">
                Methodology
              </td>
              <td className="w-3/4 p-2.5 border-black align-top leading-relaxed">
                {res.methodology || res.teachingStrategy || plan.methodology || 'Guided Discovery, Interactive Modeling (I Do, We Do, You Do), Collaborative Inquiry, and Formative Assessment'}
              </td>
            </tr>

            {/* 20. Procedure */}
            <tr className="border border-black">
              <td className="w-1/4 p-2.5 font-bold border-r border-black bg-white align-top">
                Procedure
              </td>
              <td className="w-3/4 p-2.5 border-black align-top space-y-4 leading-relaxed">
                {res.stages.map((stage, idx) => (
                  <div key={idx} className="space-y-1.5 pb-2 border-b border-gray-100 last:border-b-0">
                    <p className="font-bold text-black text-sm">
                      {stage.title} {stage.duration ? `(${stage.duration})` : ''}
                    </p>
                    {stage.teacherActions.length > 0 && (
                      <div>
                        <span className="font-semibold italic text-xs block text-gray-700">Teacher Actions:</span>
                        <ul className="list-disc pl-5 text-xs space-y-0.5">
                          {stage.teacherActions.map((act, aIdx) => (
                            <li key={aIdx}>{act}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {stage.studentActions.length > 0 && (
                      <div>
                        <span className="font-semibold italic text-xs block text-gray-700">Student Actions:</span>
                        <ul className="list-disc pl-5 text-xs space-y-0.5">
                          {stage.studentActions.map((act, aIdx) => (
                            <li key={aIdx}>{act}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {stage.keyQuestions.length > 0 && (
                      <div>
                        <span className="font-semibold italic text-xs block text-gray-700">Key Question(s):</span>
                        <ul className="list-disc pl-5 text-xs space-y-0.5">
                          {stage.keyQuestions.map((q, qIdx) => (
                            <li key={qIdx}>{q}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {stage.assessment && stage.assessment !== 'Not provided' && (
                      <p className="text-xs text-gray-800">
                        <span className="font-semibold">Assessment &amp; Check:</span> {stage.assessment}
                      </p>
                    )}
                  </div>
                ))}
              </td>
            </tr>

            {/* 21. Conclusion (summative assessment activity) */}
            <tr className="border border-black">
              <td className="w-1/4 p-2.5 font-bold border-r border-black bg-white align-top">
                Conclusion (summative assessment activity)
              </td>
              <td className="w-3/4 p-2.5 border-black align-top space-y-1 leading-relaxed">
                {res.closure.length > 0 && (
                  <ul className="list-disc pl-5 space-y-0.5">
                    {res.closure.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                )}
                {(res.exitTicket?.prompt || res.assessment?.exitTicket) && (
                  <p className="font-medium mt-1">
                    <span className="font-bold">Exit Assessment:</span> {res.exitTicket?.prompt || res.assessment?.exitTicket}
                  </p>
                )}
              </td>
            </tr>

            {/* 22. Differentiation */}
            <tr className="border border-black">
              <td className="w-1/4 p-2.5 font-bold border-r border-black bg-white align-top">
                Differentiation
              </td>
              <td className="w-3/4 p-2.5 border-black align-top space-y-2 leading-relaxed">
                <div>
                  <span className="font-bold block">Struggling Learners (Support / Tier 1):</span>
                  <ul className="list-disc pl-5 text-xs space-y-0.5">
                    {res.differentiation.strugglingLearners.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <span className="font-bold block">On-Level Learners (Core / Tier 2):</span>
                  <ul className="list-disc pl-5 text-xs space-y-0.5">
                    {res.differentiation.onLevelLearners.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <span className="font-bold block">Advanced Learners (Extension / Tier 3):</span>
                  <ul className="list-disc pl-5 text-xs space-y-0.5">
                    {res.differentiation.advancedLearners.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              </td>
            </tr>

            {/* 23. Extended Activity */}
            <tr className="border border-black">
              <td className="w-1/4 p-2.5 font-bold border-r border-black bg-white align-top">
                Extended Activity
              </td>
              <td className="w-3/4 p-2.5 border-black align-top leading-relaxed">
                {res.extensionActivity?.tasks.length ? (
                  <ul className="list-disc pl-5 space-y-0.5">
                    {res.extensionActivity.tasks.map((task, i) => (
                      <li key={i}>{task}</li>
                    ))}
                  </ul>
                ) : plan.homeworkExtension?.task ? (
                  <p><span className="font-bold">Home Investigation:</span> {plan.homeworkExtension.task}</p>
                ) : (
                  <p>Students apply lesson principles to solve an authentic real-world problem at home and record their findings in student notebooks.</p>
                )}
              </td>
            </tr>

            {/* 24. Lesson Evaluation */}
            <tr className="border border-black">
              <td className="w-1/4 p-2.5 font-bold border-r border-black bg-white align-top">
                Lesson Evaluation
              </td>
              <td className="w-3/4 p-2.5 border-black align-top space-y-2 leading-relaxed">
                <div>
                  <span className="font-bold block">Strengths:</span>
                  <p className="text-xs">{res.reflection.whatWorked || 'High student engagement during interactive modeling and guided practice; majority of students demonstrated mastery of core objectives.'}</p>
                </div>
                <div>
                  <span className="font-bold block">Weaknesses:</span>
                  <p className="text-xs">{res.reflection.challenges || 'Pacing during independent work required careful oversight; select students benefited from concrete visual manipulatives.'}</p>
                </div>
                <div>
                  <span className="font-bold block">Recommendations:</span>
                  <p className="text-xs">{res.reflection.adjustments || res.reflection.nextSteps || 'Begin subsequent lesson with a 5-minute spiral review to consolidate key concepts; provide targeted station practice.'}</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        {/* ADDITIONAL TEACHING RESOURCES AFTER MAIN TABLE (Requirement 5) */}
        {res.worksheet && res.worksheet.hasWorksheet && (
          <div className="mt-12 pt-8 border-t-2 border-dashed border-gray-300 page-break-before">
            <div className="text-center mb-6">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500">{res.schoolName}</p>
              <h2 className="text-xl font-bold text-gray-900">{res.worksheet.title}</h2>
              <p className="text-xs text-gray-600 mt-1">Instructions: {res.worksheet.instructions}</p>
            </div>

            <table className="w-full border border-black mb-6 text-xs">
              <tbody>
                <tr>
                  <td className="p-2 border-r border-black w-2/5">Name: ____________________________________</td>
                  <td className="p-2 border-r border-black w-2/5">Date: ____________________</td>
                  <td className="p-2 w-1/5 font-bold">Score: _______ / {res.worksheet.totalPoints || res.worksheet.totalQuestions || 10}</td>
                </tr>
              </tbody>
            </table>

            <div className="space-y-6">
              {res.worksheet.sections.map((sec, sIdx) => (
                <div key={sIdx} className="space-y-3">
                  <h3 className="font-bold text-sm uppercase tracking-wide border-b border-gray-200 pb-1">
                    SECTION {sec.sectionLetter || ''}: {sec.sectionTitle}
                  </h3>
                  {sec.instructions && <p className="text-xs italic text-gray-600">{sec.instructions}</p>}
                  <div className="space-y-3 pl-2">
                    {sec.questions.map((q, qIdx) => (
                      <div key={qIdx} className="text-xs">
                        <span className="font-bold">{q.number}. </span>
                        <span>{q.prompt}</span>
                        <div className="mt-1 border-b border-dotted border-gray-400 w-full h-4" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {res.worksheet.answerKey && res.worksheet.answerKey.length > 0 && (
              <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <h4 className="font-bold text-xs uppercase tracking-wider text-gray-700 mb-2">Teacher Answer Key &amp; Scoring Guide</h4>
                {res.worksheet.answerKey.map((akSec, i) => (
                  <div key={i} className="text-xs space-y-1 mb-2">
                    <span className="font-bold block">{akSec.sectionTitle}:</span>
                    {akSec.answers.map((ans, aIdx) => (
                      <p key={aIdx}><span className="font-semibold text-emerald-700">{ans.number}.</span> {ans.solution}</p>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
