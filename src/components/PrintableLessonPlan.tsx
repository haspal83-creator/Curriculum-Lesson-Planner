import React from 'react';
import { LessonPlan } from '../types';
import { cleanText, toCleanBullets } from '../lib/exportUtils';
import { normalizeLearningObjectives } from '../lib/learningObjectivesHelper';

interface PrintableLessonPlanProps {
  plan: LessonPlan;
  teacherName?: string;
}

export const PrintableLessonPlan: React.FC<PrintableLessonPlanProps> = ({ plan, teacherName }) => {
  const teacher = teacherName || plan.studentTeacherName || "Not provided";
  const today = new Date();
  const dateStr = plan.date || `${today.getDate()}th ${today.toLocaleString('default', { month: 'long' })} ${today.getFullYear()}`;

  const normObjectives = normalizeLearningObjectives(plan, {
    topic: plan.topic,
    materials: plan.materialsBoard?.map(m => m.name) || plan.materials
  });
  const conditionObj = cleanText(normObjectives.condition);
  const cognitiveObj = cleanText(normObjectives.cognitive);
  const psychomotorObj = cleanText(normObjectives.psychomotor);
  const affectiveObj = cleanText(normObjectives.affective);

  const scItems = plan.learningObjectivesBoard?.successCriteria && plan.learningObjectivesBoard.successCriteria.length > 0
    ? plan.learningObjectivesBoard.successCriteria.map(sc => cleanText(sc.startsWith('I can') ? sc : `I can ${sc}`))
    : [
        `I can accurately define and identify key concepts related to ${cleanText(plan.topic)}.`,
        "I can apply standard procedural methods to solve representative problems.",
        "I can justify my reasoning clearly to a partner or teacher using academic vocabulary."
      ];

  const vocabRaw = plan.vocabularyFocus?.keyVocabulary?.map(v => v.term) ||
    plan.keyVocabulary ||
    plan.structured_json?.vocabulary ||
    [plan.topic, plan.subtopic, "Key concept", "Application", "Procedure"].filter(Boolean);
  const vocabList = Array.isArray(vocabRaw)
    ? vocabRaw.map(cleanText).filter(v => v.length > 0 && v !== 'Not provided')
    : [cleanText(plan.topic)];

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

  const qList: string[] = (
    plan.structured_json?.questions || 
    (plan.executionBoard?.flatMap((b: any) => b.questions || b.questionsToAsk || []) as string[]) || 
    []
  ).map(cleanText).filter(q => q.length > 0 && q !== 'Not provided');

  const questionsTableRows = [
    { level: "Remember / Identify", q: qList[0] || `What is the core term or rule we used today in our study of ${cleanText(plan.topic)}?` },
    { level: "Understand", q: qList[1] || `How would you explain this concept in your own words to a classmate?` },
    { level: "Apply", q: qList[2] || `How can we apply this method to solve a new problem accurately?` },
    { level: "Analyze", q: qList[3] || `What patterns, relationships, or differences do you notice in these examples?` },
    { level: "Evaluate / Create", q: qList[4] || `Can you justify your solution or formulate a challenging problem for your peers?` }
  ];

  return (
    <div className="font-sans text-slate-800 text-[11pt] leading-normal bg-white p-6 max-w-[8.5in] mx-auto print:p-0">
      {/* HEADER SECTION */}
      <div className="text-center mb-6 border-b pb-4">
        <h1 className="text-2xl font-bold text-slate-900 tracking-wide uppercase mb-1">LESSON PLAN</h1>
        <p className="text-base font-semibold text-slate-600">
          {cleanText(plan.lessonTitle || plan.topic)}
          {plan.subtopic && plan.subtopic !== 'Not provided' && (
            <span className="font-normal italic"> — {cleanText(plan.subtopic)}</span>
          )}
        </p>
      </div>

      {/* METADATA TABLE */}
      <table className="w-full border-collapse border border-slate-300 mb-6 text-sm">
        <tbody>
          <tr>
            <td className="w-1/5 bg-slate-50 border border-slate-300 p-2 font-bold text-slate-900">School</td>
            <td className="w-[30%] border border-slate-300 p-2">St. Jude Roman Catholic Primary School</td>
            <td className="w-1/5 bg-slate-50 border border-slate-300 p-2 font-bold text-slate-900">Teacher</td>
            <td className="w-[30%] border border-slate-300 p-2">{teacher}</td>
          </tr>
          <tr>
            <td className="bg-slate-50 border border-slate-300 p-2 font-bold text-slate-900">Grade / Class</td>
            <td className="border border-slate-300 p-2">{cleanText(plan.grade || 'Standard 4')}</td>
            <td className="bg-slate-50 border border-slate-300 p-2 font-bold text-slate-900">Subject</td>
            <td className="border border-slate-300 p-2">{cleanText(plan.subject || 'Mathematics')}</td>
          </tr>
          <tr>
            <td className="bg-slate-50 border border-slate-300 p-2 font-bold text-slate-900">Date</td>
            <td className="border border-slate-300 p-2">{dateStr}</td>
            <td className="bg-slate-50 border border-slate-300 p-2 font-bold text-slate-900">Duration</td>
            <td className="border border-slate-300 p-2">{cleanText(plan.duration || '60 Minutes')}</td>
          </tr>
          <tr>
            <td className="bg-slate-50 border border-slate-300 p-2 font-bold text-slate-900">Topic</td>
            <td className="border border-slate-300 p-2">{cleanText(plan.topic || 'Not provided')}</td>
            <td className="bg-slate-50 border border-slate-300 p-2 font-bold text-slate-900">Subtopic</td>
            <td className="border border-slate-300 p-2">{cleanText(plan.subtopic || 'Not provided')}</td>
          </tr>
        </tbody>
      </table>

      {/* CURRICULUM ALIGNMENT */}
      <h2 className="text-base font-bold text-slate-900 uppercase tracking-wide border-b border-slate-300 pb-1 mb-2 mt-4">
        Curriculum Alignment
      </h2>
      <table className="w-full border-collapse border border-slate-300 mb-6 text-sm">
        <thead>
          <tr className="bg-slate-100">
            <th className="w-[30%] border border-slate-300 p-2 text-left font-bold text-slate-900">Curriculum Element</th>
            <th className="w-[70%] border border-slate-300 p-2 text-left font-bold text-slate-900">Details</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="bg-slate-50 border border-slate-300 p-2 font-bold text-slate-900">Curriculum / Framework</td>
            <td className="border border-slate-300 p-2">Belize National Primary School Curriculum Framework</td>
          </tr>
          <tr>
            <td className="bg-slate-50 border border-slate-300 p-2 font-bold text-slate-900">Cycle</td>
            <td className="border border-slate-300 p-2">Cycle {plan.cycle || 1}</td>
          </tr>
          <tr>
            <td className="bg-slate-50 border border-slate-300 p-2 font-bold text-slate-900">Strand</td>
            <td className="border border-slate-300 p-2">{cleanText(plan.strand || 'General Strand')}</td>
          </tr>
          <tr>
            <td className="bg-slate-50 border border-slate-300 p-2 font-bold text-slate-900">Topic</td>
            <td className="border border-slate-300 p-2">{cleanText(plan.topic || 'Not provided')}</td>
          </tr>
          <tr>
            <td className="bg-slate-50 border border-slate-300 p-2 font-bold text-slate-900">Subtopic</td>
            <td className="border border-slate-300 p-2">{cleanText(plan.subtopic || 'Not provided')}</td>
          </tr>
          <tr>
            <td className="bg-slate-50 border border-slate-300 p-2 font-bold text-slate-900">Curriculum Outcome</td>
            <td className="border border-slate-300 p-2">{cleanText(plan.learningOutcome || 'Demonstrate understanding and application of grade-level curriculum outcomes.')}</td>
          </tr>
          <tr>
            <td className="bg-slate-50 border border-slate-300 p-2 font-bold text-slate-900">Competency / Standard</td>
            <td className="border border-slate-300 p-2">{toCleanBullets(plan.structured_json?.competencies).join('; ') || 'Apply foundational competencies in communication, inquiry, problem solving, and mathematical reasoning.'}</td>
          </tr>
          <tr>
            <td className="bg-slate-50 border border-slate-300 p-2 font-bold text-slate-900">Curriculum Code</td>
            <td className="border border-slate-300 p-2">{cleanText(plan.structured_json?.curriculumCode || 'Not provided')}</td>
          </tr>
        </tbody>
      </table>

      {/* LESSON OVERVIEW */}
      <h2 className="text-base font-bold text-slate-900 uppercase tracking-wide border-b border-slate-300 pb-1 mb-2 mt-4">
        Lesson Overview
      </h2>
      <div className="space-y-2 mb-6 text-sm">
        <div>
          <span className="font-bold text-slate-900">Lesson Title: </span>
          <span>{cleanText(plan.lessonTitle || plan.topic)}</span>
        </div>
        <div>
          <span className="font-bold text-slate-900">Lesson Description: </span>
          <span>{lessonDesc}</span>
        </div>
        <div>
          <span className="font-bold text-slate-900">Prior Knowledge: </span>
          <span>{priorKnowledge}</span>
        </div>
        <div>
          <span className="font-bold text-slate-900">Key Vocabulary: </span>
          <span>{vocabList.join(', ')}</span>
        </div>
      </div>

      {/* LEARNING OBJECTIVES */}
      <h2 className="text-base font-bold text-slate-900 uppercase tracking-wide border-b border-slate-300 pb-1 mb-2 mt-4">
        Learning Objectives
      </h2>
      <div className="space-y-3 mb-6 text-sm">
        <div>
          <p className="font-bold text-slate-900">Condition</p>
          <p className="mt-1 text-slate-800 italic">{conditionObj}</p>
        </div>
        <div>
          <p className="font-bold text-slate-900">Cognitive Domain</p>
          <ul className="list-disc pl-5 mt-1">
            <li>{cognitiveObj}</li>
          </ul>
        </div>
        <div>
          <p className="font-bold text-slate-900">Psychomotor / Skills Domain</p>
          <ul className="list-disc pl-5 mt-1">
            <li>{psychomotorObj}</li>
          </ul>
        </div>
        <div>
          <p className="font-bold text-slate-900">Affective Domain</p>
          <ul className="list-disc pl-5 mt-1">
            <li>{affectiveObj}</li>
          </ul>
        </div>
      </div>

      {/* SUCCESS CRITERIA */}
      <h2 className="text-base font-bold text-slate-900 uppercase tracking-wide border-b border-slate-300 pb-1 mb-2 mt-4">
        Success Criteria
      </h2>
      <div className="space-y-1 mb-6 text-sm">
        {scItems.map((item, idx) => (
          <div key={idx} className="flex items-start gap-2">
            <span className="text-emerald-700 font-bold text-base select-none">☐</span>
            <span>{item}</span>
          </div>
        ))}
      </div>

      {/* MATERIALS AND RESOURCES */}
      <h2 className="text-base font-bold text-slate-900 uppercase tracking-wide border-b border-slate-300 pb-1 mb-2 mt-4">
        Materials and Resources
      </h2>
      <table className="w-full border-collapse border border-slate-300 mb-6 text-sm">
        <thead>
          <tr className="bg-slate-100">
            <th className="w-[35%] border border-slate-300 p-2 text-left font-bold text-slate-900">Materials / Resources</th>
            <th className="w-[45%] border border-slate-300 p-2 text-left font-bold text-slate-900">Purpose</th>
            <th className="w-[20%] border border-slate-300 p-2 text-left font-bold text-slate-900">Used In</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="bg-slate-50 border border-slate-300 p-2 font-bold text-slate-900">Core Textbooks & Student Workbooks</td>
            <td className="border border-slate-300 p-2">Structured exercises and guided reference</td>
            <td className="border border-slate-300 p-2">Guided & Independent Practice</td>
          </tr>
          <tr>
            <td className="bg-slate-50 border border-slate-300 p-2 font-bold text-slate-900">Visual Anchor Charts & Manipulatives</td>
            <td className="border border-slate-300 p-2">Concrete conceptual modeling</td>
            <td className="border border-slate-300 p-2">Explicit Teaching</td>
          </tr>
          <tr>
            <td className="bg-slate-50 border border-slate-300 p-2 font-bold text-slate-900">Practice Worksheets & Exit Slips</td>
            <td className="border border-slate-300 p-2">Formative evaluation and mastery check</td>
            <td className="border border-slate-300 p-2">Independent Practice & Closure</td>
          </tr>
        </tbody>
      </table>

      {/* LESSON PROCEDURE TABLE */}
      <h2 className="text-base font-bold text-slate-900 uppercase tracking-wide border-b border-slate-300 pb-1 mb-2 mt-4">
        Lesson Procedure
      </h2>
      <table className="w-full border-collapse border border-slate-300 mb-6 text-sm">
        <thead>
          <tr className="bg-slate-100">
            <th className="w-[18%] border border-slate-300 p-2 text-left font-bold text-slate-900">Stage</th>
            <th className="w-[10%] border border-slate-300 p-2 text-left font-bold text-slate-900">Time</th>
            <th className="w-[28%] border border-slate-300 p-2 text-left font-bold text-slate-900">Teacher Activities</th>
            <th className="w-[28%] border border-slate-300 p-2 text-left font-bold text-slate-900">Student Activities</th>
            <th className="w-[16%] border border-slate-300 p-2 text-left font-bold text-slate-900">Assessment / Check</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="bg-slate-50 border border-slate-300 p-2 font-bold text-slate-900 align-top">1. Introduction / Warm-Up</td>
            <td className="border border-slate-300 p-2 align-top">10 min</td>
            <td className="border border-slate-300 p-2 align-top">
              <ul className="list-disc pl-4 space-y-1">
                {introTeacher.map((b, i) => <li key={i}>{b}</li>)}
              </ul>
            </td>
            <td className="border border-slate-300 p-2 align-top">
              <ul className="list-disc pl-4 space-y-1">
                {introStudent.map((b, i) => <li key={i}>{b}</li>)}
              </ul>
            </td>
            <td className="border border-slate-300 p-2 align-top">{introCheck}</td>
          </tr>
          <tr>
            <td className="bg-slate-50 border border-slate-300 p-2 font-bold text-slate-900 align-top">2. Explicit Teaching</td>
            <td className="border border-slate-300 p-2 align-top">15 min</td>
            <td className="border border-slate-300 p-2 align-top">
              <ul className="list-disc pl-4 space-y-1">
                {explicitTeacher.map((b, i) => <li key={i}>{b}</li>)}
              </ul>
            </td>
            <td className="border border-slate-300 p-2 align-top">
              <ul className="list-disc pl-4 space-y-1">
                {explicitStudent.map((b, i) => <li key={i}>{b}</li>)}
              </ul>
            </td>
            <td className="border border-slate-300 p-2 align-top">{explicitCheck}</td>
          </tr>
          <tr>
            <td className="bg-slate-50 border border-slate-300 p-2 font-bold text-slate-900 align-top">3. Guided Practice</td>
            <td className="border border-slate-300 p-2 align-top">15 min</td>
            <td className="border border-slate-300 p-2 align-top">
              <ul className="list-disc pl-4 space-y-1">
                {guidedTeacher.map((b, i) => <li key={i}>{b}</li>)}
              </ul>
            </td>
            <td className="border border-slate-300 p-2 align-top">
              <ul className="list-disc pl-4 space-y-1">
                {guidedStudent.map((b, i) => <li key={i}>{b}</li>)}
              </ul>
            </td>
            <td className="border border-slate-300 p-2 align-top">{guidedCheck}</td>
          </tr>
          <tr>
            <td className="bg-slate-50 border border-slate-300 p-2 font-bold text-slate-900 align-top">4. Independent Practice</td>
            <td className="border border-slate-300 p-2 align-top">15 min</td>
            <td className="border border-slate-300 p-2 align-top">
              <ul className="list-disc pl-4 space-y-1">
                {indepTeacher.map((b, i) => <li key={i}>{b}</li>)}
              </ul>
            </td>
            <td className="border border-slate-300 p-2 align-top">
              <ul className="list-disc pl-4 space-y-1">
                {indepStudent.map((b, i) => <li key={i}>{b}</li>)}
              </ul>
            </td>
            <td className="border border-slate-300 p-2 align-top">{indepCheck}</td>
          </tr>
          <tr>
            <td className="bg-slate-50 border border-slate-300 p-2 font-bold text-slate-900 align-top">5. Closure</td>
            <td className="border border-slate-300 p-2 align-top">5 min</td>
            <td className="border border-slate-300 p-2 align-top">
              <ul className="list-disc pl-4 space-y-1">
                {closureTeacher.map((b, i) => <li key={i}>{b}</li>)}
              </ul>
            </td>
            <td className="border border-slate-300 p-2 align-top">
              <ul className="list-disc pl-4 space-y-1">
                {closureStudent.map((b, i) => <li key={i}>{b}</li>)}
              </ul>
            </td>
            <td className="border border-slate-300 p-2 align-top">{closureCheck}</td>
          </tr>
        </tbody>
      </table>

      {/* TEACHER AND STUDENT ACTIONS */}
      <h2 className="text-base font-bold text-slate-900 uppercase tracking-wide border-b border-slate-300 pb-1 mb-2 mt-4">
        Teacher and Student Actions
      </h2>
      <table className="w-full border-collapse border border-slate-300 mb-6 text-sm">
        <thead>
          <tr className="bg-slate-100">
            <th className="w-1/2 border border-slate-300 p-2 text-left font-bold text-slate-900">Teacher Actions</th>
            <th className="w-1/2 border border-slate-300 p-2 text-left font-bold text-slate-900">Student Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-slate-300 p-2 align-top">
              <ul className="list-disc pl-4 space-y-1">
                <li>Models problem-solving protocols and explicit strategies clearly.</li>
                <li>Asks scaffolded questions and guides mathematical discourse.</li>
                <li>Circulates room to monitor accuracy and clear misconceptions.</li>
              </ul>
            </td>
            <td className="border border-slate-300 p-2 align-top">
              <ul className="list-disc pl-4 space-y-1">
                <li>Listens actively, records worked examples, and articulates thinking.</li>
                <li>Collaborates actively in pairs to solve assigned challenge prompts.</li>
                <li>Demonstrates independent mastery on individual practice tasks.</li>
              </ul>
            </td>
          </tr>
        </tbody>
      </table>

      {/* QUESTIONING STRATEGIES */}
      <h2 className="text-base font-bold text-slate-900 uppercase tracking-wide border-b border-slate-300 pb-1 mb-2 mt-4">
        Questioning Strategies
      </h2>
      <table className="w-full border-collapse border border-slate-300 mb-6 text-sm">
        <thead>
          <tr className="bg-slate-100">
            <th className="w-[26%] border border-slate-300 p-2 text-left font-bold text-slate-900">Cognitive Level</th>
            <th className="w-[74%] border border-slate-300 p-2 text-left font-bold text-slate-900">Targeted Question</th>
          </tr>
        </thead>
        <tbody>
          {questionsTableRows.map((row, i) => (
            <tr key={i}>
              <td className="bg-slate-50 border border-slate-300 p-2 font-bold text-slate-900">{row.level}</td>
              <td className="border border-slate-300 p-2">{row.q}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* DIFFERENTIATION */}
      <h2 className="text-base font-bold text-slate-900 uppercase tracking-wide border-b border-slate-300 pb-1 mb-2 mt-4">
        Differentiation
      </h2>
      <div className="space-y-3 mb-6 text-sm">
        <div>
          <p className="font-bold text-slate-900">Students Requiring Additional Support</p>
          <p className="text-slate-700 pl-4 mt-1">
            Provide concrete manipulatives, visual place-value charts, simplified step-by-step instructions, and guided teacher assistance during initial practice.
          </p>
        </div>
        <div>
          <p className="font-bold text-slate-900">On-Level Learners</p>
          <p className="text-slate-700 pl-4 mt-1">
            Complete standard practice tasks with focus on computational accuracy, written explanation of reasoning, and partner collaboration.
          </p>
        </div>
        <div>
          <p className="font-bold text-slate-900">Advanced / Extension Learners</p>
          <p className="text-slate-700 pl-4 mt-1">
            Solve non-standard extension problems, identify real-world mathematical applications, and support peers as instructional leaders.
          </p>
        </div>
        <div>
          <p className="font-bold text-slate-900">Inclusion Supports</p>
          <p className="text-slate-700 pl-4 mt-1">
            Ensure high-contrast visual displays, preferential seating, peer buddy pairings, and extended response time where appropriate.
          </p>
        </div>
      </div>

      {/* ASSESSMENT AND EVALUATION */}
      <h2 className="text-base font-bold text-slate-900 uppercase tracking-wide border-b border-slate-300 pb-1 mb-2 mt-4">
        Assessment and Evaluation
      </h2>
      <table className="w-full border-collapse border border-slate-300 mb-6 text-sm">
        <thead>
          <tr className="bg-slate-100">
            <th className="w-[30%] border border-slate-300 p-2 text-left font-bold text-slate-900">Assessment Type</th>
            <th className="w-[70%] border border-slate-300 p-2 text-left font-bold text-slate-900">Method / Evidence</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="bg-slate-50 border border-slate-300 p-2 font-bold text-slate-900">Formative Assessment</td>
            <td className="border border-slate-300 p-2">Continuous teacher observation, oral response checks, and diagnostic questioning during warm-up.</td>
          </tr>
          <tr>
            <td className="bg-slate-50 border border-slate-300 p-2 font-bold text-slate-900">Guided Practice</td>
            <td className="border border-slate-300 p-2">Active monitoring of paired collaboration, immediate feedback, and white-board checks.</td>
          </tr>
          <tr>
            <td className="bg-slate-50 border border-slate-300 p-2 font-bold text-slate-900">Independent Practice</td>
            <td className="border border-slate-300 p-2">Evaluation of individual student worksheet tasks and procedural accuracy.</td>
          </tr>
          <tr>
            <td className="bg-slate-50 border border-slate-300 p-2 font-bold text-slate-900">Exit Ticket</td>
            <td className="border border-slate-300 p-2">{cleanText(plan.closurePanel?.exitQuestion || (plan.closure && plan.closure[0]) || `Demonstrate mastery of ${cleanText(plan.topic)} through a targeted single-question exit slip.`)}</td>
          </tr>
          <tr>
            <td className="bg-slate-50 border border-slate-300 p-2 font-bold text-slate-900">Evaluation Criteria</td>
            <td className="border border-slate-300 p-2">Students achieve 80% or greater accuracy on core practice tasks and explain procedural rationale clearly.</td>
          </tr>
        </tbody>
      </table>

      {/* CLOSURE */}
      <h2 className="text-base font-bold text-slate-900 uppercase tracking-wide border-b border-slate-300 pb-1 mb-2 mt-4">
        Closure
      </h2>
      <ul className="list-disc pl-5 mb-6 text-sm space-y-1">
        <li>Summarize key mathematical concepts mastered in today's lesson on {cleanText(plan.topic)}.</li>
        <li>Review student progress against established success criteria.</li>
        <li>Connect today's lesson concepts to upcoming learning outcomes.</li>
      </ul>

      {/* TEACHER REFLECTION */}
      <h2 className="text-base font-bold text-slate-900 uppercase tracking-wide border-b border-slate-300 pb-1 mb-2 mt-4">
        Teacher Reflection
      </h2>
      <table className="w-full border-collapse border border-slate-300 mb-6 text-sm">
        <thead>
          <tr className="bg-slate-100">
            <th className="w-[32%] border border-slate-300 p-2 text-left font-bold text-slate-900">Reflection Focus</th>
            <th className="w-[68%] border border-slate-300 p-2 text-left font-bold text-slate-900">Post-Lesson Notes & Adjustments</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="bg-slate-50 border border-slate-300 p-2 font-bold text-slate-900">What went well?</td>
            <td className="border border-slate-300 p-4 min-h-[48px]"></td>
          </tr>
          <tr>
            <td className="bg-slate-50 border border-slate-300 p-2 font-bold text-slate-900">What challenges occurred?</td>
            <td className="border border-slate-300 p-4 min-h-[48px]"></td>
          </tr>
          <tr>
            <td className="bg-slate-50 border border-slate-300 p-2 font-bold text-slate-900">Which students require follow-up?</td>
            <td className="border border-slate-300 p-4 min-h-[48px]"></td>
          </tr>
          <tr>
            <td className="bg-slate-50 border border-slate-300 p-2 font-bold text-slate-900">What should be adjusted for next lesson?</td>
            <td className="border border-slate-300 p-4 min-h-[48px]"></td>
          </tr>
          <tr>
            <td className="bg-slate-50 border border-slate-300 p-2 font-bold text-slate-900">Next Steps</td>
            <td className="border border-slate-300 p-4 min-h-[48px]"></td>
          </tr>
        </tbody>
      </table>

      {/* LESSON RESOURCES */}
      <h2 className="text-base font-bold text-slate-900 uppercase tracking-wide border-b border-slate-300 pb-1 mb-2 mt-4">
        Lesson Resources
      </h2>
      <ul className="list-disc pl-5 mb-6 text-sm space-y-1">
        <li>Printable Student Practice Worksheet & Extension Tasks</li>
        <li>Curriculum Anchor Charts & Conceptual Visual Aids</li>
        <li>Formative Exit Tickets & Student Self-Assessment Rubrics</li>
        <li>Concrete Classroom Manipulatives & Graphic Organizers</li>
      </ul>
    </div>
  );
};
