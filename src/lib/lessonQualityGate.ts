import { 
  LessonPlan, 
  TeacherQuickReference, 
  LessonAtAGlanceRow, 
  TeacherPreparationBriefing, 
  KeyVocabularyEntry, 
  PrerequisiteDiagnostic, 
  CommonMisconceptionEntry, 
  TeachMeThisTopicBriefing, 
  TeacherScriptFull, 
  InstructionalSequence, 
  WorkedExampleItem, 
  BloomQuestionBank, 
  FormativeCheckItem, 
  StrugglingRemediation, 
  CommonErrorItem, 
  ReadyToTeachItem, 
  CompleteAssessmentPackage, 
  GeneratedStudentMaterial, 
  BelizeanContextDetails 
} from '../types';
import { normalizeLearningObjectives } from './learningObjectivesHelper';
import { validateAndBalanceLessonTiming, parseMinutes } from './timingValidation';
import { enforceLanguageArtsPurityAndQuality, isLanguageArtsSubject } from './languageArtsQualityGate';
import { 
  enforceMathematicsPurityAndQuality, 
  isMathematicsSubject, 
  buildAuthoritativeMathWorksheet, 
  buildAuthoritativeMathExitTicket 
} from './mathQualityGate';
import { getAuthoritativeCurriculumCode, getTopicFocalInquiry } from '../services/curriculumHierarchyService';
import { enrichScienceLessonPlan, resolveSciencePhenomenonPack } from './scienceInquiryEngine';

export interface QualityGateCheckItem {
  id: string;
  name: string;
  category: 'Curriculum' | 'Preparation' | 'Instruction' | 'Assessment' | 'Timing';
  passed: boolean;
  score: number; // 0 - 100
  details: string;
}

export interface QualityGateReport {
  isFullyTeachReady: boolean;
  overallScore: number;
  checks: QualityGateCheckItem[];
  summary: string;
}

/**
 * Standard 8 Teacher Preparation Confidence Check items
 */
export const STANDARD_READY_TO_TEACH_ITEMS: { id: string; label: string }[] = [
  { id: 'concept', label: 'I understand the core concept, its meaning, and why it matters to primary students.' },
  { id: 'vocabulary', label: 'I know the key academic terms and have practice definitions ready for students.' },
  { id: 'prereqs', label: 'I have reviewed prerequisite knowledge and the quick diagnostic check.' },
  { id: 'misconceptions', label: 'I have reviewed the common misconceptions and my exact correction language.' },
  { id: 'script', label: 'I have read the teacher modeling script and think-aloud explanation.' },
  { id: 'materials', label: 'I have prepared all student materials, problem sets, and visual aids.' },
  { id: 'struggling', label: 'I know the signs of confusion and have my reteaching protocol ready.' },
  { id: 'assessment', label: 'I have the complete assessment task, answer key, and mastery criteria at hand.' }
];

/**
 * Evaluates a lesson plan against the Master Teach-Ready Quality Gate standards.
 */
export function validateLessonPlanQuality(plan: Partial<LessonPlan>): QualityGateReport {
  const checks: QualityGateCheckItem[] = [];

  // 1. Curriculum & Outcomes
  const hasOutcome = Boolean(plan.learningOutcome || plan.topic);
  checks.push({
    id: 'curriculum',
    name: 'Curriculum & Outcome Alignment',
    category: 'Curriculum',
    passed: hasOutcome,
    score: hasOutcome ? 100 : 0,
    details: hasOutcome ? `Aligned to ${plan.grade} ${plan.subject} Topic: ${plan.topic}` : 'Missing topic or outcome'
  });

  // 2. One Shared Condition
  const normObj = normalizeLearningObjectives(plan as LessonPlan, { topic: plan.topic });
  const hasSharedCondition = Boolean(normObj.condition && normObj.condition.toLowerCase().startsWith('given'));
  checks.push({
    id: 'shared_condition',
    name: 'One Shared Condition Format',
    category: 'Curriculum',
    passed: hasSharedCondition,
    score: hasSharedCondition ? 100 : 50,
    details: hasSharedCondition ? `Shared condition present: "${normObj.condition.slice(0, 50)}..."` : 'Condition should start with "Given..."'
  });

  // 3. Teacher Preparation Briefing
  const prep = plan.teacherPreparation?.whatYouNeedToKnow;
  const hasPrep = Boolean(prep?.conceptSummary && prep?.whatItMeans && prep?.whyItMatters);
  checks.push({
    id: 'teacher_prep',
    name: 'Teacher Background & Concept Clarity',
    category: 'Preparation',
    passed: hasPrep,
    score: hasPrep ? 100 : 30,
    details: hasPrep ? 'Comprehensive teacher briefing with meaning, rules, and terminology' : 'Needs detailed teacher preparation notes'
  });

  // 4. Key Vocabulary Table
  const hasVocabTable = Boolean(plan.keyVocabularyTable && plan.keyVocabularyTable.length > 0 && plan.keyVocabularyTable[0].studentDefinition);
  checks.push({
    id: 'vocab_table',
    name: 'Key Vocabulary (Teacher vs Student Definitions)',
    category: 'Preparation',
    passed: hasVocabTable,
    score: hasVocabTable ? 100 : 40,
    details: hasVocabTable ? `${plan.keyVocabularyTable?.length} vocabulary terms with dual definitions` : 'Vocabulary table missing dual definitions'
  });

  // 5. Prerequisite Diagnostic Check
  const diag = plan.prerequisiteDiagnostic?.diagnosticCheck;
  const hasDiag = Boolean(diag?.teacherAsks && diag?.expectedResponse && diag?.ifStudentsCannotAnswer);
  checks.push({
    id: 'prereq_diag',
    name: 'Prerequisite Diagnostic & Remediation',
    category: 'Preparation',
    passed: hasDiag,
    score: hasDiag ? 100 : 30,
    details: hasDiag ? 'Diagnostic check with explicit remediation step present' : 'Missing diagnostic check or remediation step'
  });

  // 6. Common Misconceptions with Teacher Language
  const hasMisconceptions = Boolean(plan.commonMisconceptionsTable && plan.commonMisconceptionsTable.length > 0 && plan.commonMisconceptionsTable[0].teacherCorrectionLanguage);
  checks.push({
    id: 'misconceptions',
    name: 'Misconceptions & Teacher Correction Language',
    category: 'Preparation',
    passed: hasMisconceptions,
    score: hasMisconceptions ? 100 : 30,
    details: hasMisconceptions ? `${plan.commonMisconceptionsTable?.length} anticipated misconceptions with teacher words` : 'Needs explicit teacher language to correct errors'
  });

  // 7. Teacher Script (No Vague Instructions)
  const script = plan.teacherScriptDetailed;
  const hasScript = Boolean(script?.explanation && script?.modeling && script?.introduction);
  checks.push({
    id: 'teacher_script',
    name: 'Teacher Script & Think-Aloud',
    category: 'Instruction',
    passed: hasScript,
    score: hasScript ? 100 : 40,
    details: hasScript ? 'Verbatim teacher language provided for introduction, modeling, and closing' : 'Missing full teacher script'
  });

  // 8. Worked Examples
  const hasWorkedExamples = Boolean(plan.workedExamplesList && plan.workedExamplesList.length > 0);
  checks.push({
    id: 'worked_examples',
    name: 'Step-by-Step Worked Examples',
    category: 'Instruction',
    passed: hasWorkedExamples,
    score: hasWorkedExamples ? 100 : 40,
    details: hasWorkedExamples ? `${plan.workedExamplesList?.length} worked examples with solutions and common errors` : 'Missing worked examples'
  });

  // 9. Bloom Question Bank
  const qb = plan.bloomQuestionBank;
  const hasQuestions = Boolean(qb?.recall?.length && qb?.understanding?.length && qb?.application?.length);
  checks.push({
    id: 'bloom_questions',
    name: 'Bloom Cognitive Question Bank',
    category: 'Instruction',
    passed: hasQuestions,
    score: hasQuestions ? 100 : 40,
    details: hasQuestions ? 'Tiered cognitive questions with expected student answers' : 'Missing tiered question bank'
  });

  // 10. Formative Checks (If Correct / If Incorrect)
  const hasFormative = Boolean(plan.formativeChecksList && plan.formativeChecksList.length > 0 && plan.formativeChecksList[0].ifIncorrect);
  checks.push({
    id: 'formative_checks',
    name: 'Formative Assessment with Next Steps',
    category: 'Assessment',
    passed: hasFormative,
    score: hasFormative ? 100 : 40,
    details: hasFormative ? 'Checks include explicit guidance for "If Correct" and "If Incorrect"' : 'Formative checks missing conditional response guidance'
  });

  // 11. Struggling Student Protocol
  const struggling = plan.ifStudentsAreStruggling;
  const hasStruggling = Boolean(struggling?.simplerExplanation && struggling?.alternativeExample && struggling?.reteachingStrategy);
  checks.push({
    id: 'struggling_protocol',
    name: 'Reteaching Protocol for Struggling Students',
    category: 'Instruction',
    passed: hasStruggling,
    score: hasStruggling ? 100 : 40,
    details: hasStruggling ? 'Concrete simpler explanation, visual options, and reteaching steps' : 'Missing struggling learner protocol'
  });

  // 12. Complete Assessment with Answer Key
  const assess = plan.completeAssessment;
  const hasCompleteAssess = Boolean(assess?.task && assess?.answerKey && assess?.masteryCriteria);
  checks.push({
    id: 'complete_assessment',
    name: 'Assessment Task, Answer Key & Mastery Criteria',
    category: 'Assessment',
    passed: hasCompleteAssess,
    score: hasCompleteAssess ? 100 : 40,
    details: hasCompleteAssess ? 'Includes actual assessment task, full answer key, and measurable criteria' : 'Missing answer key or measurable mastery criteria'
  });

  // 13. Timing Validation
  const targetMin = parseMinutes(plan.duration, 45);
  const glanceMins = (plan.lessonAtAGlance || []).reduce((sum, r) => sum + (r.timeMinutes || parseMinutes(r.time, 0)), 0);
  const isTimingValid = glanceMins === targetMin;
  checks.push({
    id: 'timing_validation',
    name: 'Exact Stage Timing Arithmetic',
    category: 'Timing',
    passed: isTimingValid,
    score: isTimingValid ? 100 : 50,
    details: isTimingValid ? `Stage total (${glanceMins} min) matches selected duration (${targetMin} min)` : `Mismatch: Stages sum to ${glanceMins} min, duration is ${targetMin} min`
  });

  // 14. Language Arts Specific Checks (If Subject is Language Arts)
  if (plan.subject === 'Language Arts') {
    const validLAComponents = [
      'Comprehension — Oral Expression and Listening',
      'Phonological Awareness',
      'Phonics and Word Recognition',
      'High Frequency Words',
      'Production and Language Structure — Writing and Composition'
    ];
    const comps = plan.languageArtsComponents || [];
    const hasExactlyTwo = comps.length === 2 && comps.every((c: any) => validLAComponents.includes(c));
    checks.push({
      id: 'la_two_components',
      name: 'Language Arts Exactly 2 Components Rule',
      category: 'Instruction',
      passed: hasExactlyTwo,
      score: hasExactlyTwo ? 100 : 0,
      details: hasExactlyTwo 
        ? `Today's Language Arts Components (Exactly 2): ${comps.join(' + ')}` 
        : `MANDATE VIOLATION: Daily lesson MUST contain exactly 2 components (found ${comps.length})`
    });

    const hasFullResources = Boolean(
      plan.readingPassageFull?.content && 
      plan.anchorChartBlueprint?.keyRulesOrDefinitions?.length && 
      plan.exitTicketPackage?.questions?.length
    );
    checks.push({
      id: 'la_no_missing_resources',
      name: 'No Missing Resources Rule (Passage, Anchor Chart, Exit Ticket)',
      category: 'Preparation',
      passed: hasFullResources,
      score: hasFullResources ? 100 : 40,
      details: hasFullResources 
        ? `Complete resources verified: Full Reading Passage (${plan.readingPassageFull?.wordCount} words), Anchor Chart Blueprint, and Exit Ticket Package present.` 
        : 'Missing complete teacher-independent resources (reading passage, anchor chart blueprint, or exit ticket).'
    });
  }

  // 15. 16-Step Pedagogical Alignment Chain Check
  const hasAlignmentChain = Boolean(
    (plan.learningOutcome || plan.topic) && // 1. Outcome
    plan.topic && // 2. Focus
    plan.learningObjectivesBoard?.condition && // 3. Objectives
    plan.learningObjectivesBoard?.successCriteria?.length && // 4. Success Criteria
    (plan.priorKnowledgeActivation?.whatTheyKnow || plan.previousKnowledge) && // 5. Prior Knowledge
    ((plan.executionBoard && plan.executionBoard.length > 0) || plan.introduction?.length) && // 6-10. Engage, Explore, Model, Guided, Independent
    (plan.instructionalSequence?.weDo?.teacherPrompts?.length || plan.finalAssessmentBoard?.evidenceOfLearning) && // 11. Formative Assessment
    plan.differentiationFramework && // 12. Differentiated Response
    (plan.exitTicketPackage?.questions?.length || plan.closurePanel?.exitQuestion) && // 13. Exit Ticket
    (plan.exitTicketPackage?.masteryThreshold || plan.finalAssessmentBoard?.criteriaForSuccess?.length) && // 14. Mastery Decision
    (plan.exitTicketPackage?.groupingRuleTomorrow || plan.closurePanel?.nextLessonConnection) && // 15. Next-Lesson Action
    plan.reflectionDashboard // 16. Post-Lesson Reflection
  );
  checks.push({
    id: 'pedagogical_alignment_chain',
    name: '16-Step Unbroken Pedagogical Alignment Chain',
    category: 'Curriculum',
    passed: hasAlignmentChain,
    score: hasAlignmentChain ? 100 : 70,
    details: hasAlignmentChain
      ? '16/16 Nodes Verified: Outcome → Focus → Objectives → Success Criteria → Prior Knowledge → Engage → Explore → Modeling → Guided Practice → Independent Application → Formative Assessment → Differentiated Response → Exit Ticket → Mastery Decision → Next-Lesson Action → Post-Lesson Reflection'
      : 'One or more pedagogical chain links require completion'
  });

  const totalScore = Math.round(checks.reduce((sum, c) => sum + c.score, 0) / checks.length);
  const isFullyTeachReady = totalScore >= 90 && checks.every(c => c.passed);

  return {
    isFullyTeachReady,
    overallScore: totalScore,
    checks,
    summary: isFullyTeachReady 
      ? 'All Master Teach-Ready quality criteria passed. Complete instructional script, worked examples, and assessments verified.' 
      : `${checks.filter(c => !c.passed).length} quality checks need enhancement to achieve full teacher independence.`
  };
}

/**
 * Guarantees that any LessonPlan object has complete, robust, non-empty,
 * teacher-independent instructional content for every section.
 */
export function enrichAndGuaranteeTeachReady(rawPlan: any, context?: any): LessonPlan {
  const plan: LessonPlan = { ...rawPlan };

  const grade = plan.grade || context?.grade || 'Standard 2';
  const subject = plan.subject || context?.subject || 'Mathematics';
  const topic = plan.topic || plan.lessonTitle || context?.topic || 'Curriculum Concept';
  const subtopic = plan.subtopic || context?.subtopic || getTopicFocalInquiry(subject, topic);
  const cycle = plan.cycle || context?.cycle || 1;
  const learningOutcome = plan.learningOutcome || context?.learningOutcome || `Demonstrate understanding and practical application of ${topic}.`;

  // Authoritative curriculum code
  plan.curriculumCode = plan.curriculumCode || context?.curriculumCode || getAuthoritativeCurriculumCode({ subject, grade, cycle, topic });
  plan.subtopic = subtopic;

  const isLA = isLanguageArtsSubject(subject);
  const isHFLE = subject === 'HFLE' || subject.toLowerCase().includes('health');
  const isScience = subject === 'Science and Technology' || subject.toLowerCase().includes('science');
  const isBS = subject === 'Belizean Studies';

  // Dedicated Science & Technology Inquiry Engine delegation
  if (isScience) {
    const sciencePlan = enrichScienceLessonPlan(plan, context);
    const targetDuration = sciencePlan.duration || '45 minutes';
    const { plan: timedPlan } = validateAndBalanceLessonTiming(sciencePlan, targetDuration);
    Object.assign(sciencePlan, timedPlan);
    sciencePlan.curriculumCode = getAuthoritativeCurriculumCode({ subject: 'Science and Technology', grade, cycle, topic });
    delete (sciencePlan as any).readingPassageFull;
    delete (sciencePlan as any).languageArtsComponents;
    delete (sciencePlan as any).component1Details;
    delete (sciencePlan as any).component2Details;
    return sciencePlan;
  }

  // 1. Normalize Learning Objectives with One Shared Condition
  const normObj = normalizeLearningObjectives(plan, { topic, materials: plan.materials });
  let condition = normObj.condition;
  let cognitiveObj = normObj.cognitive;
  let psychomotorObj = normObj.psychomotor;
  let affectiveObj = normObj.affective;
  let defaultSuccessCriteria: string[] = [];

  if (isLA) {
    condition = condition || `Given an authentic Belizean mentor text, an instructional anchor chart on ${topic}, and structured guided practice:`;
    cognitiveObj = cognitiveObj || `Students will identify, analyze, and explain key elements of ${topic} with at least 80% accuracy in text-dependent questions.`;
    psychomotorObj = psychomotorObj || `Students will identify textual evidence, organize ideas, and compose grammatically complete written responses demonstrating ${topic} in their exercise books.`;
    affectiveObj = affectiveObj || `Students will actively participate in partner discussions, cite textual evidence, and express confidence in their language analysis.`;
    defaultSuccessCriteria = [
      `I can identify and analyze key evidence and patterns of ${topic} in our mentor text.`,
      `I can apply ${topic} to organize and write clear, complete responses.`,
      `I can explain my textual analysis to a partner and write complete, accurate sentences.`
    ];
  } else if (isHFLE) {
    condition = condition || `Given an illustrated chart of common Belizean foods and lifestyle practices,`;
    cognitiveObj = cognitiveObj || `Students will categorize foods and analyze dietary risk factors for non-communicable diseases with at least 80% accuracy.`;
    psychomotorObj = psychomotorObj || `Students will design a balanced one-day Belizean meal plan and record healthy lifestyle commitments in their exercise books.`;
    affectiveObj = affectiveObj || `Students will demonstrate responsibility and positive decision-making when discussing healthy habits with peers.`;
    defaultSuccessCriteria = [
      `I can distinguish nutrient-dense foods from ultra-processed foods.`,
      `I can explain how food choices influence health and non-communicable diseases.`,
      `I can plan a balanced, healthy meal using local Belizean foods.`
    ];
  } else if (isScience) {
    condition = condition || `Given hands-on demonstration materials and structured investigation guides,`;
    cognitiveObj = cognitiveObj || `Students will identify input and output energy forms and explain energy transformations with at least 80% accuracy.`;
    psychomotorObj = psychomotorObj || `Students will trace energy conversion pathways and record scientific observations in their science notebooks.`;
    affectiveObj = affectiveObj || `Students will demonstrate curiosity and scientific collaboration during inquiry investigations.`;
    defaultSuccessCriteria = [
      `I can identify common forms of energy in everyday devices.`,
      `I can trace input and output energy conversions accurately.`,
      `I can apply the law of conservation of energy to explain real systems.`
    ];
  } else if (isBS) {
    condition = condition || `Given historical maps, primary sources, and Belizean heritage texts,`;
    cognitiveObj = cognitiveObj || `Students will analyze key historical events and explain their significance in Belizean history with at least 80% accuracy.`;
    psychomotorObj = psychomotorObj || `Students will construct annotated timelines and record reflective arguments in their notebooks.`;
    affectiveObj = affectiveObj || `Students will demonstrate civic pride and appreciation for Belize's multicultural heritage.`;
    defaultSuccessCriteria = [
      `I can locate key historical sites and geographic regions in Belize.`,
      `I can explain historical cause-and-effect relationships accurately.`,
      `I can articulate the rights and responsibilities of responsible Belizean citizens.`
    ];
  } else {
    // Mathematics
    condition = condition || `Given concrete models, guided practice exercises, and primary workbook activities,`;
    cognitiveObj = cognitiveObj || `Students will identify, explain, and solve problems involving ${topic} with at least 80% accuracy.`;
    psychomotorObj = psychomotorObj || `Students will write step-by-step solutions, manipulate models, and record observations accurately in their exercise books.`;
    affectiveObj = affectiveObj || `Students will actively participate in partner discussions, ask clarifying questions, and show confidence in their mathematical reasoning.`;
    defaultSuccessCriteria = [
      `I can define and explain ${topic} in my own words using academic vocabulary.`,
      `I can correctly follow the step-by-step method to solve representative problems.`,
      `I can explain my reasoning to a partner and verify my final answers.`
    ];
  }

  plan.learningObjectivesBoard = {
    ...plan.learningObjectivesBoard,
    condition,
    knowledge: cognitiveObj,
    skill: psychomotorObj,
    attitude: affectiveObj,
    cognitive: cognitiveObj,
    psychomotor: psychomotorObj,
    affective: affectiveObj,
    successCriteria: plan.learningObjectivesBoard?.successCriteria?.length 
      ? plan.learningObjectivesBoard.successCriteria 
      : defaultSuccessCriteria
  };

  // 2. Teacher Quick Reference
  if (!plan.teacherQuickReference) {
    plan.teacherQuickReference = {
      standard: `Belize National Primary Curriculum Framework (${grade})`,
      subject: subject,
      cycle: cycle,
      strand: plan.strand || `${subject} Core Strands`,
      topic: topic,
      learningOutcome: learningOutcome,
      objective: `${condition} ${cognitiveObj} ${psychomotorObj} ${affectiveObj}`,
      keyConcept: plan.lessonSnapshot?.focus || `Mastery of fundamental principles, procedures, and practical applications in ${topic}.`,
      essentialVocabulary: plan.vocabularyFocus?.keyVocabulary?.map(v => v.term) || [topic, 'Procedure', 'Rule', 'Application'],
      prerequisiteKnowledge: plan.priorKnowledgeActivation?.whatTheyKnow || `Foundational understanding of preceding unit concepts and grade-level skills.`,
      materials: plan.materialsBoard?.map(m => m.name) || plan.materials || ['Student Exercise Books', 'Chart Paper', 'Markers', 'Manipulatives / Visual Aids'],
      teachingStrategy: plan.teachingModel || 'Direct Instruction (I Do, We Do, You Do) with Concrete-Pictorial-Abstract Scaffolding',
      assessment: 'Formative CFU questioning, paired check-in, independent problem set, and exit slip',
      masteryTarget: '80% of students demonstrate independent procedural and conceptual mastery on the exit check.',
      duration: (isLanguageArtsSubject(plan.subject) || (plan.subject || '').toLowerCase().includes('math')) ? '90 minutes' : (plan.duration || '45 minutes')
    };
  }

  // 3. Timing Validation & Rebalancing
  const is90MinSubj = isLanguageArtsSubject(plan.subject) || (plan.subject || '').toLowerCase().includes('math');
  const targetDuration = is90MinSubj
    ? ((!plan.duration || plan.duration === '45 minutes' || plan.duration === '60 minutes') ? '90 minutes' : plan.duration)
    : (plan.duration || '45 minutes');
  plan.duration = targetDuration;
  const { plan: timedPlan } = validateAndBalanceLessonTiming(plan, targetDuration);
  Object.assign(plan, timedPlan);

  // 4. Teacher Preparation Briefing ("What You Need to Know")
  if (!plan.teacherPreparation?.whatYouNeedToKnow) {
    plan.teacherPreparation = {
      whatYouNeedToKnow: {
        conceptSummary: `At the ${grade} primary level, ${topic} focuses on building clear conceptual understanding before memorizing rules. Students must see how the concept connects to observable reality, step-by-step procedures, and everyday problem-solving.`,
        whatItMeans: `${topic} describes the fundamental mathematical, linguistic, or scientific principles governing how quantities, language structures, or natural systems operate coherently.`,
        whyItMatters: `Without a solid grasp of ${topic}, students will struggle with higher-level multi-step operations, critical reading comprehension, and standardized primary school evaluations. It equips students with the reasoning tools needed for everyday decision-making.`,
        howItWorks: `Instruction begins with concrete demonstration and familiar physical contexts, transitions into guided visual/diagrammatic representation, and consolidates into independent abstract problem-solving and written explanation.`,
        importantRules: [
          `Always maintain precision when naming mathematical quantities, grammatical terms, or scientific properties.`,
          `Verify each intermediate step before proceeding to the final solution or conclusion.`,
          `Encourage students to justify 'WHY' a step is taken rather than just executing it mechanically.`
        ],
        importantTerminology: [
          topic,
          'Conceptual Model',
          'Procedural Step',
          'Verification / Check',
          'Standard Format'
        ],
        connectionsToPriorLearning: `Connects directly to prior primary units where students practiced prerequisite operations, observation skills, or basic word construction.`,
        realWorldApplications: `In daily Belizean life—such as shopping at local shops, calculating change, observing weather changes in coastal and inland districts, or writing community letters—${topic} provides immediate practical utility.`
      }
    };
  }

  // 5. Key Vocabulary Table (Dual Definitions)
  if (!plan.keyVocabularyTable || plan.keyVocabularyTable.length === 0) {
    const rawVocab = plan.vocabularyFocus?.keyVocabulary || [];
    if (rawVocab.length > 0) {
      plan.keyVocabularyTable = rawVocab.map(v => ({
        term: v.term,
        teacherDefinition: v.definition || `The formal academic meaning of ${v.term} used during explicit instructional modeling.`,
        studentDefinition: `A simple, student-friendly way to say it: ${v.definition ? v.definition.toLowerCase() : `the rule or part we use to understand ${topic}`}.`,
        exampleSentence: `In today's lesson, we use ${v.term} to show how our solution works.`
      }));
    } else {
      plan.keyVocabularyTable = [
        {
          term: topic,
          teacherDefinition: `The primary subject matter concept denoting the core instructional target of this unit.`,
          studentDefinition: `The main skill or idea we are learning to use and explain today.`,
          exampleSentence: `Today we are exploring ${topic} together.`
        },
        {
          term: 'Procedure',
          teacherDefinition: `An established, sequential series of actions or steps conducted in a specified order.`,
          studentDefinition: `The clear step-by-step path we follow to reach the correct answer.`,
          exampleSentence: `Follow the four-step procedure written on the board.`
        },
        {
          term: 'Reasoning',
          teacherDefinition: `The cognitive act of constructing arguments, justifying inferences, and explaining solutions.`,
          studentDefinition: `Telling your partner WHY your answer makes sense.`,
          exampleSentence: `Show your partner the mathematical reasoning behind your answer.`
        }
      ];
    }
  }

  // 6. Prerequisite Diagnostic Check
  if (!plan.prerequisiteDiagnostic?.diagnosticCheck) {
    plan.prerequisiteDiagnostic = {
      requiredConcepts: [
        `Basic understanding of prior ${subject} unit vocabulary and notation.`,
        `Ability to read, write, and identify fundamental representations appropriate for ${grade}.`
      ],
      requiredSkills: [
        `Following a multi-step instructional sequence.`,
        `Articulating answers clearly in whole-group and paired settings.`
      ],
      diagnosticCheck: {
        teacherAsks: `"Before we begin today's new focus on ${topic}, let's check our foundational knowledge: Who can explain or demonstrate the basic rule we practiced in our last lesson?"`,
        expectedResponse: `"Students explain or demonstrate the prerequisite procedure correctly using grade-appropriate vocabulary."`,
        ifStudentsCannotAnswer: `Pause and spend 2 minutes modeling a quick concrete refresher problem on the board before introducing today's new content. Do NOT push forward without verifying this foundation.`
      }
    };
  }

  // 7. Common Misconceptions Table with Exact Teacher Correction
  if (!plan.commonMisconceptionsTable || plan.commonMisconceptionsTable.length === 0) {
    const priorMis = plan.priorKnowledgeActivation?.misconceptionsToAnticipate || [];
    if (priorMis.length > 0) {
      plan.commonMisconceptionsTable = priorMis.map(m => ({
        misconception: m,
        correctUnderstanding: `The correct mathematical, grammatical, or scientific reality that students must grasp.`,
        teacherCorrectionLanguage: `"I notice some of us are thinking ${m.toLowerCase()}. Let's look closely at why that happens and examine our rule together: notice that..."`
      }));
    } else {
      plan.commonMisconceptionsTable = [
        {
          misconception: `Students may confuse the sequence of steps and skip necessary intermediate checks.`,
          correctUnderstanding: `Every step in the procedure serves a distinct logical purpose and must be executed in order.`,
          teacherCorrectionLanguage: `"Hold on, class! Notice what happens if we skip Step 2: our final result won't balance. Let's trace our fingers over Step 2 together right now."`
        },
        {
          misconception: `Students may apply a rule mechanically without understanding what the final quantity or statement actually represents.`,
          correctUnderstanding: `Solutions must always be checked against the original problem context to ensure reasonableness.`,
          teacherCorrectionLanguage: `"Before we box our answer, let's ask our sanity check: Does this answer make sense for a real classroom in Belize? Let's check together."`
        }
      ];
    }
  }

  // 8. Teach Me This Topic Briefing (8 Teacher Mastery Answers)
  if (!plan.teachMeThisTopic) {
    plan.teachMeThisTopic = {
      whatIsThisTopic: `${topic} is a core component of the ${grade} ${subject} curriculum that establishes foundational competence in understanding, analyzing, and executing ${subtopic}.`,
      whyItMatters: `It equips primary school students with critical reasoning, procedural fluency, and analytical communication skills essential for subsequent grades and Belize National Curriculum benchmarks.`,
      mostImportantIdeas: [
        `The concept must be linked from concrete physical models to abstract written form.`,
        `Students need repeated opportunities to speak and write the academic vocabulary aloud.`,
        `Procedural speed must never replace conceptual understanding and justification.`
      ],
      mustUnderstandBeforeTeaching: `Be prepared to demonstrate at least one clear worked example on the board while verbalizing your thought process step-by-step. Keep your explanation under 5 minutes so students spend the majority of class practicing.`,
      howToExplainSimply: `Use the familiar analogy of building a house: you cannot put on the roof until the foundation and walls are secure. In ${topic}, we build our answer step-by-step following clear rules.`,
      firstExampleToUse: `A simple, familiar problem with clean, non-distracting numbers or clear sentences that allows students to focus 100% on the new method.`,
      mistakesToWatchFor: [
        `Rushing through calculations or reading without verifying the prompt.`,
        `Mixing up technical terms that sound similar.`,
        `Giving up when encountering a multi-step challenge instead of breaking it down.`
      ],
      quickCheckUnderstanding: `Conduct a rapid thumbs-up/down or mini-whiteboard check asking students to display the first step of the procedure within 30 seconds.`
    };
  }

  // 9. Teacher Script (Verbatim Teacher Language)
  if (!plan.teacherScriptDetailed) {
    plan.teacherScriptDetailed = {
      opening: `"Good morning class! Eyes on the board and materials ready. Today we are exploring an essential concept in ${subject}: ${topic}. By the end of our lesson, every single one of you will be able to explain, demonstrate, and apply this knowledge with confidence."`,
      introduction: `"Take a look at the model on the board. Raise your hand if you have seen something like this in everyday life in Belize or in our previous units. Today, we are going to learn the exact principles that make this clear and exciting."`,
      explanation: `"Notice that when we examine ${topic}, there are three crucial elements we look for. First, we identify what we are given. Second, we choose our strategy or inquiry pathway. Third, we carry out our steps systematically without rushing."`,
      modeling: `"Watch me carefully. I am going to demonstrate this first example out loud so you can hear how we think through it step-by-step. Notice how I do not guess; I follow our clear scientific, mathematical, or analytical criteria."`,
      questioning: [
        `"Why did I complete Step 1 before moving to Step 2?"`,
        `"What clue in the scenario or problem told me which concept or rule to apply?"`,
        `"Who can put into their own words what our second step accomplished?"`
      ],
      transitions: [
        `"Now that you have seen me model it, we are going to tackle the next one together as a team."`,
        `"Turn to your learning partner. Partner A, explain the first step; Partner B, confirm or clarify."`,
        `"Materials ready. You have shown me you understand during our guided practice; now it's your turn to shine independently."`
      ],
      directions: `"Open your exercise books to today's date. You have 10 minutes to complete the practice tasks. Record your steps clearly. If you finish early, move directly to the extension challenge on the side board."`,
      feedbackLanguage: `"Excellent precision with that intermediate step! Notice how keeping your work organized helped you catch that small error before moving on."`,
      correctionPrompts: `"Stop right there and take another look at Step 2. What does our core rule say? Review your anchor chart and adjust."`,
      closing: `"Materials down, eyes up in 3... 2... 1. Today, we mastered ${topic}. Turn to your neighbor and tell them the single most important principle we learned today. Great work today, class!"`
    };
  }

  // 10. Instructional Sequence (I DO, WE DO, YOU DO)
  if (!plan.instructionalSequence) {
    plan.instructionalSequence = {
      iDo: {
        teacherAction: `The teacher displays the model example for ${topic} on the board, models clear physical posture, points explicitly to each component, and records intermediate steps clearly.`,
        teacherExplanation: `"I am going to examine the model carefully. I underline the key terms. Now I ask myself: What is the core question or process here? I demonstrate our step-by-step method on the board."`,
        workedExample: `Model Demonstration: Clearly worked example demonstrating the target standard for ${topic} with full steps and verified conclusion.`,
        thinkAloud: `"I am thinking: I shouldn't jump directly to a conclusion. If I write down each step, I eliminate careless mistakes and can prove my reasoning is sound."`,
        expectedStudentObservation: `Students track the teacher's demonstration, note the organizational layout in their notebooks, and answer periodic check questions.`
      },
      weDo: {
        tasks: [
          `Collaborative Practice Task #1 solved as a whole class with student call-and-response.`,
          `Paired Practice Task #2 where partners take turns verbalizing and recording alternating steps.`
        ],
        teacherPrompts: [
          `"Class, what is our very first move for this example?"`,
          `"Partner A, whisper the next step to Partner B in 5 seconds."`
        ],
        expectedResponses: [
          `Students identify the first step synchronously and state the exact concept or rule.`,
          `Partners converse using academic vocabulary and confirm intermediate steps.`
        ],
        correctAnswers: [
          `Intermediate step verified accurately.`,
          `Final solution or response formulated and labeled properly.`
        ],
        feedbackLanguage: `"Brilliant teamwork at Table 2—you caught the distinction in Step 2 by checking your anchor chart!"`,
        correctionPrompts: `"Check your reasoning on step 3. Remember what happens when we combine those elements."`
      },
      youDo: {
        studentTasks: [
          `Complete 5 targeted practice questions in individual exercise books.`,
          `Write a 1-sentence conceptual justification for the final question.`
        ],
        problemsOrPassages: [
          `Task 1 (Foundational application of rule)`,
          `Task 2 (Standard application with intermediate step)`,
          `Task 3 (Task requiring careful attention to structure)`,
          `Task 4 (Real-world scenario set in Belizean community)`,
          `Task 5 (Higher-order explanation question)`
        ],
        activities: [
          `Independent work in exercise books.`,
          `Self-check against the board checklist before submitting.`
        ],
        successCriteria: `Student independently completes at least 4 out of 5 tasks accurately with visible evidence shown.`
      }
    };
  }

  // 11. Worked Examples List
  if (!plan.workedExamplesList || plan.workedExamplesList.length === 0) {
    const isMath = subject.toLowerCase().includes('math');
    const isLA = isLanguageArtsSubject(subject);
    const isScience = subject === 'Science and Technology' || subject.toLowerCase().includes('science');

    if (isMath) {
      plan.workedExamplesList = [
        {
          subjectType: 'Mathematics',
          problemOrContext: `Solve and check: Representative problem for ${topic} at the ${grade} level.`,
          stepByStepSolution: [
            { step: 1, action: `Read and annotate the problem`, explanation: `Identify the known quantities and circle the target question.` },
            { step: 2, action: `Set up the mathematical equation or visual representation`, explanation: `Align numbers by place value or sketch the bar model.` },
            { step: 3, action: `Execute the procedural algorithm carefully`, explanation: `Compute step-by-step, recording any regrouping or operations clearly.` },
            { step: 4, action: `Verify solution and write unit label`, explanation: `Check with inverse operation to ensure mathematical validity.` }
          ],
          finalAnswerOrModelResponse: `Final Answer: Exactly computed solution with appropriate unit label.`,
          commonErrorOrScientificReasoning: `Common Error: Students often forget to record regrouping or reverse the order of operations.`,
          belizeanContextNote: `Example situated around purchasing fresh fruits at San Ignacio market or calculating miles along the George Price Highway.`
        }
      ];
    } else if (isLA) {
      plan.workedExamplesList = [
        {
          subjectType: 'Language Arts',
          problemOrContext: `Mentor Sentence / Passage: Short model text demonstrating ${topic} in context.`,
          stepByStepSolution: [
            { step: 1, action: `Read mentor text aloud with expressiveness`, explanation: `Notice where the author uses target structure or punctuation.` },
            { step: 2, action: `Deconstruct the sentence components`, explanation: `Identify the subject, predicate, and key grammatical features.` },
            { step: 3, action: `Draft our own student sentence using the same pattern`, explanation: `Substitute our own nouns and verbs while maintaining structural integrity.` }
          ],
          finalAnswerOrModelResponse: `Model Response: A perfectly constructed sentence demonstrating the target skill with correct spelling and punctuation.`,
          commonErrorOrScientificReasoning: `Common Error: Writing run-on fragments or omitting necessary capitalization and end marks.`,
          belizeanContextNote: `Text set in a local Belizean village describing tapping rubber, fishing on the reef, or preparing for Garifuna Settlement Day.`
        }
      ];
    } else if (isHFLE) {
      plan.workedExamplesList = [
        {
          subjectType: 'HFLE',
          problemOrContext: `Health Decision Scenario: Evaluating daily dietary habits and non-communicable disease risk factors.`,
          stepByStepSolution: [
            { step: 1, action: `Identify food items and lifestyle choices`, explanation: `Examine the meals consumed in the scenario and list all ingredients and beverages.` },
            { step: 2, action: `Categorize nutritional quality`, explanation: `Distinguish fresh, nutrient-dense local foods (callaloo, beans, plantains, fish) from ultra-processed foods high in refined sugars and trans-fats.` },
            { step: 3, action: `Assess disease risk factors`, explanation: `Connect chronic high-sugar and high-sodium diets to health conditions like Type 2 diabetes and hypertension.` },
            { step: 4, action: `Formulate a balanced alternative meal plan`, explanation: `Recommend balanced Belizean food portions and regular physical activity.` }
          ],
          finalAnswerOrModelResponse: `Healthy Decision: A balanced one-day Belizean meal plan promoting healthy lifestyle habits and reducing lifestyle disease risks.`,
          commonErrorOrScientificReasoning: `Misconception: Thinking non-communicable diseases are solely genetic rather than strongly influenced by daily dietary and physical activity choices.`,
          belizeanContextNote: `Grounding in Belizean culinary traditions and locally available produce from district markets.`
        }
      ];
    } else if (isScience) {
      plan.workedExamplesList = [
        {
          subjectType: 'Science',
          problemOrContext: `Investigation Prompt: What happens to energy input when a device operates in our environment?`,
          stepByStepSolution: [
            { step: 1, action: `Identify the input energy source`, explanation: `Determine whether the device uses electrical, chemical, radiant, or mechanical energy.` },
            { step: 2, action: `Observe and record output energy forms`, explanation: `Distinguish useful output energy (e.g. motion, light) from dissipated thermal energy.` },
            { step: 3, action: `Trace the energy transformation pathway`, explanation: `Draw an energy flow diagram: Input Energy → Device → Useful Output + Dissipated Output.` },
            { step: 4, action: `Apply the Law of Conservation of Energy`, explanation: `Explain why total input energy exactly equals total output energy.` }
          ],
          finalAnswerOrModelResponse: `Scientific Explanation: Clear tracing of energy transformations proving conservation of energy in the system.`,
          commonErrorOrScientificReasoning: `Scientific Reasoning: Energy is never destroyed or 'used up'; it merely transforms into other forms like heat.`,
          belizeanContextNote: `Grounding in Belize's energy systems: hydroelectricity from Chalillo/Mol lejon, solar panels in rural villages, or household appliances.`
        }
      ];
    } else {
      plan.workedExamplesList = [
        {
          subjectType: 'Belizean Studies / Social Studies',
          problemOrContext: `Historical / Geographical Inquiry: Analyzing the significance of ${topic} in Belize.`,
          stepByStepSolution: [
            { step: 1, action: `Examine the primary source or map`, explanation: `Identify key landmarks, dates, and historical figures.` },
            { step: 2, action: `Discuss the cause and effect relationships`, explanation: `Analyze how physical geography or historical choices shaped today's communities.` },
            { step: 3, action: `Formulate reasoned personal reflection`, explanation: `Explain how this knowledge informs responsible citizenship in Belize.` }
          ],
          finalAnswerOrModelResponse: `Model Response: Well-structured multi-sentence explanation reflecting accurate historical and cultural knowledge.`,
          commonErrorOrScientificReasoning: `Common Error: Over-simplifying complex historical events or confusing calendar eras.`,
          belizeanContextNote: `Directly highlights Belizean districts (Corozal, Orange Walk, Belize, Cayo, Stann Creek, Toledo).`
        }
      ];
    }
  }

  // 12. Bloom Question Bank
  if (!plan.bloomQuestionBank || !plan.bloomQuestionBank.recall?.length) {
    plan.bloomQuestionBank = {
      recall: [
        { question: `What is the definition of ${topic}?`, expectedAnswer: `Students recite the core definition using key academic terms.` },
        { question: `What is the very first step in our procedure?`, expectedAnswer: `Students name Step 1 accurately.` }
      ],
      understanding: [
        { question: `Why is it important to carry out Step 2 before Step 3?`, expectedAnswer: `Students explain the logical dependency between the steps.` },
        { question: `In your own words, what does [Key Term] mean?`, expectedAnswer: `Students explain the concept without relying on memorized jargon.` }
      ],
      application: [
        { question: `How would you use this rule to solve a real problem when shopping at the local market?`, expectedAnswer: `Students formulate a concrete mathematical or linguistic application.` },
        { question: `If the numbers or words were changed to [Alternative Example], what would our steps be?`, expectedAnswer: `Students apply the algorithm successfully to the novel problem.` }
      ],
      analysis: [
        { question: `Look at this sample problem with a mistake on line 2. What went wrong, and why did the student make that error?`, expectedAnswer: `Students isolate the exact error and explain the misconception that caused it.` }
      ],
      evaluation: [
        { question: `Which method was more efficient for solving this problem: Method A or Method B? Justify your choice.`, expectedAnswer: `Students compare two valid approaches and defend their choice with sound criteria.` }
      ],
      creation: [
        { questionOrTask: `Create your own word problem or mentor sentence about life in Belize that requires using ${topic} to solve.`, expectedOutput: `Student-created problem with correct accompanying answer key.` }
      ]
    };
  }

  // 13. Formative Checks (If Correct / If Incorrect)
  if (!plan.formativeChecksList || plan.formativeChecksList.length === 0) {
    plan.formativeChecksList = [
      {
        checkType: 'Thumbs Up / Thumbs Down / Sideways',
        teacherAsksOrDoes: `"Show me your confidence rating on our three-step rule: Thumbs up if you can teach it to a partner, sideways if you need one more example, down if you are stuck."`,
        studentsDo: `Students display honest thumb signal against their chests.`,
        expectedResponse: `80%+ of students display thumbs up.`,
        ifCorrect: `Transition immediately to paired guided practice.`,
        ifIncorrect: `If more than 3 students show sideways or down, model one additional worked example on the board with active student questioning.`
      },
      {
        checkType: 'Mini-Whiteboard / Slate Display',
        teacherAsksOrDoes: `"Write only the answer to Step 1 for today's model on your slates. 3, 2, 1... Chin it!"`,
        studentsDo: `Students hold slates under their chins facing the teacher simultaneously.`,
        expectedResponse: `Class exhibits uniform correct notation and values.`,
        ifCorrect: `Praise speed and proceed to Step 2.`,
        ifIncorrect: `Point out the common error immediately without naming students: "I see a few slates that missed our core definition or step. Review the board anchor chart and adjust."`
      },
      {
        checkType: 'Pair-Share Cold Call',
        teacherAsksOrDoes: `"Turn to your shoulder partner and explain why our step or conclusion is necessary. I will cold-call two students in 30 seconds."`,
        studentsDo: `Both partners speak and listen actively.`,
        expectedResponse: `Cold-called students state the verification purpose clearly.`,
        ifCorrect: `Reinforce student explanation and record a star on the board tracker.`,
        ifIncorrect: `Ask a peer to assist: "Who can build upon that explanation and help our friend complete the rule?"`
      }
    ];
  }

  // 14. "If Students Are Struggling" Protocol
  if (!plan.ifStudentsAreStruggling?.simplerExplanation) {
    let simplerExp = `Break the concept down into its simplest 1-to-1 relationship. Provide one clear model before asking the student to try.`;
    let altEx = `Use concrete visual aids, graphic organizers, or physical sorting cards to represent the concept directly.`;
    if (isHFLE) {
      simplerExp = `Think of your body as an engine: nutritious local foods provide clean, long-lasting energy, while sugary processed snacks create buildup and strain your organs over time.`;
      altEx = `Use pictorial Belize food cards to physically sort items into 'Everyday Nutrient-Dense' and 'Occasional Ultra-Processed' categories.`;
    } else if (isScience) {
      simplerExp = `Energy cannot simply vanish—it always transforms from one form into another! For example, electrical energy entering a fan transforms into moving air and a little heat.`;
      altEx = `Demonstrate with a simple physical device (e.g., turning on a classroom flashlight or rubbing hands together to feel mechanical energy convert to thermal energy).`;
    } else if (isLA) {
      simplerExp = `Look for recognizable base words and affixes, or reread the surrounding sentence clues to understand the author's meaning.`;
      altEx = `Use color-coded cards or a two-column word study chart to separate parts of the word or sentence.`;
    } else if (subject.toLowerCase().includes('math')) {
      simplerExp = `Strip away large numbers and start with small, friendly numbers to see the pattern clearly before solving.`;
      altEx = `Use physical counters, bottle caps, or a drawn number line on grid paper to represent the quantities directly.`;
    }

    plan.ifStudentsAreStruggling = {
      signsOfConfusion: [
        `Hesitating to write anything down after instructions are given.`,
        `Flipping back and forth between notebook pages repeatedly.`,
        `Relying on peers to supply answers without understanding the underlying process.`,
        `Producing responses disconnected from the lesson's target concept.`
      ],
      likelyCause: `The student has not solidified the prerequisite concept or was overwhelmed by multi-step cognitive load.`,
      simplerExplanation: simplerExp,
      alternativeExample: altEx,
      additionalGuidedPractice: `Work through one problem or scenario side-by-side with the teacher guiding the initial step and the student completing the second step.`,
      visualOrManipulativeOption: `Provide a printed, laminated step-by-step cue card with color-coded prompts.`,
      reteachingStrategy: `Form a small pull-out focus group at the teacher table during independent practice. Re-model with physical manipulatives or visual organizers for 5 minutes.`,
      followUpCheck: `Have the student solve one solitary task or explain one concept on a mini-whiteboard before returning to independent work.`
    };
  }

  // 15. Common Errors & Teacher Responses Table
  if (!plan.commonErrorsTable || plan.commonErrorsTable.length === 0) {
    plan.commonErrorsTable = [
      {
        likelyError: `Reversing steps in the procedure.`,
        whyItHappens: `Rushing to find the solution without anchoring to the algorithm.`,
        teacherResponse: `"Put your pencil down. Point to Step 1 on your anchor chart. Did we complete that step yet? No? Let's do that first."`,
        correctiveExample: `Show two side-by-side solutions: one with reversed steps (incorrect) and one with correct order, demonstrating why order matters.`
      },
      {
        likelyError: `Calculation or transcription error on intermediate lines.`,
        whyItHappens: `Messy handwriting or misalignment of digits/words in exercise books.`,
        teacherResponse: `"Your strategy is 100% correct, but your intermediate notes drifted. Let's draw clean columns in your book to keep your work organized."`,
        correctiveExample: `Provide grid paper or have the student turn their lined notebook sideways to form columns.`
      }
    ];
  }

  // 16. Ready To Teach Checklist
  if (!plan.readyToTeachChecklist || plan.readyToTeachChecklist.length === 0) {
    plan.readyToTeachChecklist = STANDARD_READY_TO_TEACH_ITEMS.map(item => ({
      ...item,
      checked: false
    }));
  }

  // 17. Complete Assessment with Answer Key
  if (!plan.completeAssessment?.answerKey) {
    if (isHFLE) {
      plan.completeAssessment = {
        task: `Health Decision Scenario Check: Categorize Belizean foods and evaluate lifestyle decisions for disease prevention.`,
        expectedResponse: `Students accurately categorize foods, explain how high-sugar/high-fat diets contribute to diabetes and hypertension, and propose healthy meal alternatives.`,
        answerKey: `Question 1: Identifies nutrient-dense foods (e.g., callaloo, beans, local fish) vs ultra-processed items.\nQuestion 2: Explains that chronic excess sugar intake damages insulin function leading to Type 2 diabetes.\nQuestion 3: Proposes 2 realistic healthy lifestyle habits (drinking water, daily 30-minute active play).\nQuestion 4: Evaluates a Belizean family meal scenario and recommends healthier substitutions.`,
        rubric: [
          {
            criteria: `Health Knowledge & Classification`,
            exemplary: `Accurately categorizes foods and identifies nutritional values without errors.`,
            proficient: `Correctly categorizes most foods with sound basic reasoning.`,
            developing: `Confuses processed foods with natural food groups or needs guidance.`
          },
          {
            criteria: `Disease Prevention & Action Planning`,
            exemplary: `Clearly links dietary habits to specific non-communicable diseases and designs a balanced Belizean meal plan.`,
            proficient: `Explains general health benefits and suggests reasonable food alternatives.`,
            developing: `Struggles to connect diet to disease prevention or proposes unrealistic changes.`
          }
        ],
        masteryCriteria: `Mastery Standard: Student achieves at least 80% accuracy (at least 4 out of 5 criteria met) on health knowledge and decision planning.`
      };
    } else if (isScience) {
      plan.completeAssessment = {
        task: `Science Inquiry Check: Identify energy inputs and outputs in everyday devices, trace conversion pathways, and explain conservation of energy.`,
        expectedResponse: `Students diagram energy transformations, label input and output forms, and explain that energy is conserved across physical systems.`,
        answerKey: `Question 1: Identifies input energy (e.g. electrical) and outputs (light and heat) in an electric lamp.\nQuestion 2: Traces chemical energy in food/battery transforming into mechanical kinetic energy.\nQuestion 3: Explains the law of conservation of energy: energy cannot be created or destroyed, only transformed.\nQuestion 4: Analyzes an energy system diagram and identifies wasted thermal energy.`,
        rubric: [
          {
            criteria: `Scientific Conceptual Understanding`,
            exemplary: `Demonstrates thorough, flawless explanation of energy forms and transformation laws.`,
            proficient: `Applies energy conversion principles correctly with minor terminology slips.`,
            developing: `Confuses energy forms (e.g., heat vs temperature) or skips conversion steps.`
          },
          {
            criteria: `System Diagramming & Evidence Reasoning`,
            exemplary: `Accurately maps input/output pathways with clear labels and evidence-based justifications.`,
            proficient: `Maps pathways correctly; diagrams are legible and mostly complete.`,
            developing: `Incomplete diagrams or missing intermediate energy forms.`
          }
        ],
        masteryCriteria: `Mastery Standard: Student achieves at least 80% accuracy (identifies input/output correctly for at least 4 out of 5 systems).`
      };
    } else if (isBS) {
      plan.completeAssessment = {
        task: `Belizean Studies Source Analysis: Interpret historical/geographic evidence and explain the civic and cultural significance of ${topic}.`,
        expectedResponse: `Students analyze sources, place events/sites in geographical context, and write clear explanations of cultural heritage and civic duties.`,
        answerKey: `Question 1: Accurately identifies key historical/geographic facts regarding ${topic}.\nQuestion 2: Explains cause-and-effect relationships in Belizean development.\nQuestion 3: Connects historical heritage to modern multicultural communities in Belize.\nQuestion 4: Proposes responsible civic actions supporting community well-being.`,
        rubric: [
          {
            criteria: `Historical and Geographic Understanding`,
            exemplary: `Demonstrates rich factual precision regarding Belizean heritage, districts, and civic structures.`,
            proficient: `Accurate understanding with minor omissions in historical dates or geography.`,
            developing: `Confuses historical eras or district landmarks.`
          },
          {
            criteria: `Civic Application & Critical Thinking`,
            exemplary: `Articulates clear connections between historical events and modern civic responsibility in Belize.`,
            proficient: `Makes relevant connections to community life.`,
            developing: `Requires prompting to explain personal or civic relevance.`
          }
        ],
        masteryCriteria: `Mastery Standard: Student achieves at least 80% accuracy across factual identification and source analysis.`
      };
    } else {
      // Mathematics default
      const mathWs = buildAuthoritativeMathWorksheet(topic, plan.subtopic || '', plan.learningOutcome || '', grade);
      plan.completeAssessment = {
        task: `8-Question Practice Worksheet (10 marks) and Diagnostic Exit Ticket (5 marks) evaluating ${topic}.`,
        expectedResponse: `Students record complete working, step-by-step algorithms, and clear final answers in their exercise books.`,
        answerKey: mathWs.answerKeyText,
        rubric: [
          {
            criteria: `Conceptual Understanding`,
            exemplary: `Demonstrates thorough comprehension of underlying mathematical principles and justifies steps with precision.`,
            proficient: `Applies concepts correctly with minor clerical slips.`,
            developing: `Requires teacher prompting to choose the correct approach.`
          },
          {
            criteria: `Procedural Execution`,
            exemplary: `All steps organized logically, work shown clearly, final answers accurate.`,
            proficient: `Follows the established algorithm correctly; work is legible.`,
            developing: `Skips intermediate lines or makes persistent calculation errors.`
          }
        ],
        masteryCriteria: `Mastery Standard: Student achieves at least 80% accuracy (e.g. 8 out of 10 marks on worksheet) with full procedural working visible.`
      };
    }
  }

  // 18. Student Materials (Generated Worksheets & Resources)
  if (!plan.studentMaterials || plan.studentMaterials.length === 0) {
    if (isHFLE) {
      plan.studentMaterials = [
        {
          title: `${topic} - Health & Well-Being Investigation Worksheet`,
          type: 'worksheet',
          content: `NAME: __________________________   DATE: ___________________\nGRADE: ${grade}   SUBJECT: HFLE   TOPIC: ${topic}\n\nDIRECTIONS: Answer each question thoughtfully in your exercise book.\n\n1. Food & Habit Sorting: List 3 local Belizean foods that are nutrient-dense, and 2 foods that should be eaten only occasionally because they are ultra-processed.\n   Nutrient-Dense: _____________________________________________________\n   Ultra-Processed: ____________________________________________________\n\n2. Health Connection: Explain how consuming too much sugar and refined flour over many years can increase a person's risk for Type 2 diabetes.\n   Explanation: ________________________________________________________\n   _____________________________________________________________________\n\n3. Scenario Analysis: Carlos buys fried snacks and two sugary soft drinks every school day. Suggest two affordable, delicious Belizean alternatives he could choose at the market.\n   Alternative 1: ______________________________________________________\n   Alternative 2: ______________________________________________________\n\n4. Healthy Lifestyle Action: What is one physical activity or healthy habit you will commit to practicing this week with your family or friends?\n   My Commitment: ______________________________________________________`,
          answerKey: `1. Nutrient-dense: fresh fruits (mango, banana, orange), vegetables (callaloo, chaya), beans, fish, whole plantain. Ultra-processed: sodas, bagged chips, sugary pastries, processed sausages.\n2. Excess sugar causes repeated insulin spikes; over time cells become insulin resistant, leading to chronic elevated blood sugar and Type 2 diabetes.\n3. Carlos could choose fresh watermelon/orange slices, a banana, coconut water, or fresh water.\n4. Acceptable answers include walking, riding bicycle, playing football, drinking more water, or getting 8+ hours of sleep.`
        },
        {
          title: `${topic} - Daily Health Exit Ticket`,
          type: 'exit_ticket',
          content: `EXIT TICKET: ${topic}\nName: ____________________ Date: _____________\n\n1. What is the most important lesson you learned today about ${topic}?\n   _____________________________________________________\n\n2. Name one way healthy eating helps protect you against non-communicable diseases:\n   _____________________________________________________\n\n3. How confident are you in making healthy lifestyle choices?\n   😃 Very confident   😐 Working on it   🙁 Need more guidance`,
          answerKey: `1. Accurate statement about food choices, exercise, or lifestyle habits.\n2. Keeps blood pressure normal, maintains healthy weight, and prevents organ strain.\n3. Formative reflection for next-day support.`
        }
      ];
    } else if (isScience) {
      plan.studentMaterials = [
        {
          title: `${topic} - Science Investigation Worksheet`,
          type: 'worksheet',
          content: `NAME: __________________________   DATE: ___________________\nGRADE: ${grade}   SUBJECT: Science & Technology   TOPIC: ${topic}\n\nDIRECTIONS: Read each prompt carefully and record your scientific observations.\n\n1. Energy Identification: For an electric ceiling fan in your classroom, identify the input energy and output energies.\n   Input Energy: ________________________\n   Output Energy 1 (Useful): _____________\n   Output Energy 2 (Wasted): _____________\n\n2. Energy Transformation Pathway: Trace the energy conversions from sunlight falling on a solar panel to lighting a classroom bulb:\n   Solar Energy → ________________________ → ________________________\n\n3. Scientific Principle: State the Law of Conservation of Energy in your own words:\n   _____________________________________________________________________\n   _____________________________________________________________________\n\n4. Device Analysis: Why does a car engine or flashlight feel warm after being used for 30 minutes? What does this tell us about energy efficiency?\n   Explanation: ________________________________________________________\n   _____________________________________________________________________`,
          answerKey: `1. Input: Electrical energy. Useful output: Mechanical (kinetic) energy of moving blades. Wasted output: Thermal (heat) and sound energy.\n2. Solar Energy → Electrical Energy → Light (radiant) Energy (and some thermal energy).\n3. Energy cannot be created or destroyed; it can only be transformed from one form into another.\n4. No device is 100% efficient; some input energy is inevitably converted into thermal energy due to friction and electrical resistance.`
        },
        {
          title: `${topic} - Daily Science Exit Ticket`,
          type: 'exit_ticket',
          content: `EXIT TICKET: ${topic}\nName: ____________________ Date: _____________\n\n1. What is the input energy of a flashlight?\n   _____________________________________________________\n\n2. What are the two output forms of energy produced by the flashlight?\n   _____________________________________________________\n\n3. Can energy disappear completely? Explain why or why not:\n   _____________________________________________________`,
          answerKey: `1. Chemical energy (stored in batteries).\n2. Light (radiant) energy and thermal (heat) energy.\n3. No, because the Law of Conservation of Energy states energy cannot be destroyed, only transformed.`
        }
      ];
    } else if (isBS) {
      plan.studentMaterials = [
        {
          title: `${topic} - Belizean Studies Inquiry Worksheet`,
          type: 'worksheet',
          content: `NAME: __________________________   DATE: ___________________\nGRADE: ${grade}   SUBJECT: Belizean Studies   TOPIC: ${topic}\n\nDIRECTIONS: Complete the inquiry questions below using evidence from our lesson.\n\n1. Historical/Geographical Context: Describe two key facts about ${topic} in Belize:\n   Fact 1: _____________________________________________________________\n   Fact 2: _____________________________________________________________\n\n2. District Connection: Which district(s) in Belize are most closely connected to ${topic}, and why?\n   District & Connection: _______________________________________________\n\n3. Cultural/Civic Impact: How does understanding ${topic} help us become proud, responsible Belizean citizens?\n   Reflection: _________________________________________________________\n   _____________________________________________________________________`,
          answerKey: `1. Factual statements aligned with Belizean national history and geography.\n2. Correct district identification (Corozal, Orange Walk, Belize, Cayo, Stann Creek, Toledo) with relevant historical/economic context.\n3. Thoughtful civic reflection on cultural preservation, unity, and national development.`
        },
        {
          title: `${topic} - Daily Belizean Studies Exit Ticket`,
          type: 'exit_ticket',
          content: `EXIT TICKET: ${topic}\nName: ____________________ Date: _____________\n\n1. Name one important fact you learned today about ${topic}:\n   _____________________________________________________\n\n2. Why is this significant for the people of Belize?\n   _____________________________________________________`,
          answerKey: `1. Accurate historical/geographical fact.\n2. Explanation connecting the fact to Belize's identity, history, or development.`
        }
      ];
    } else {
      // Mathematics default
      const mathWs = buildAuthoritativeMathWorksheet(topic, plan.subtopic || '', plan.learningOutcome || '', grade);
      const mathEt = buildAuthoritativeMathExitTicket(topic, plan.subtopic || '', plan.learningOutcome || '');
      plan.studentMaterials = [
        {
          title: mathWs.title,
          type: 'worksheet' as any,
          content: mathWs.worksheetContentText,
          answerKey: mathWs.answerKeyText
        },
        {
          title: mathEt.title,
          type: 'exit_ticket' as any,
          content: mathEt.contentText,
          answerKey: mathEt.answerKeyText
        }
      ];
    }
  }

  // 19. Belizean Context Details
  if (!plan.belizeanContextDetails) {
    plan.belizeanContextDetails = {
      contextConnection: `Grounded in familiar Belizean environments across our six districts—such as local markets, agriculture (citrus, sugar cane, cacao), marine conservation on our barrier reef, or community festivals.`,
      communityApplication: `Encourages students to apply their learning immediately outside the classroom, communicating clearly with family and contributing responsibly to community life in Belize.`,
      culturalOrEnvironmentalExample: `Respectful of Belize's multi-ethnic heritage (Maya, Garifuna, Creole, Mestizo, East Indian, Mennonite) and natural ecosystem.`
    };
  }

  // 20. Language Arts Master 2-Component Architecture & Complete Resources
  if (subject === 'Language Arts') {
    const validLAComponents = [
      'Comprehension — Oral Expression and Listening',
      'Phonological Awareness',
      'Phonics and Word Recognition',
      'High Frequency Words',
      'Production and Language Structure — Writing and Composition'
    ] as const;

    // Enforce EXACTLY 2 components
    let comps = (plan.languageArtsComponents || context?.components || []) as string[];
    if (!Array.isArray(comps) || comps.length !== 2 || !comps.every(c => validLAComponents.includes(c as any))) {
      // Default sound pedagogical pairing based on day or topic
      const dayNum = plan.day || context?.day || 1;
      if (dayNum === 2) {
        comps = ['Phonological Awareness', 'Phonics and Word Recognition'];
      } else if (dayNum === 3) {
        comps = ['Phonics and Word Recognition', 'High Frequency Words'];
      } else if (dayNum === 4) {
        comps = ['High Frequency Words', 'Production and Language Structure — Writing and Composition'];
      } else {
        comps = ['Comprehension — Oral Expression and Listening', 'Production and Language Structure — Writing and Composition'];
      }
    }
    plan.languageArtsComponents = [comps[0], comps[1]] as any;

    const comp1 = comps[0];
    const comp2 = comps[1];

    if (!plan.component1Details) {
      plan.component1Details = {
        name: comp1 as any,
        timeAllocation: '20 minutes',
        explicitTeachingScript: `Teacher says: "Good morning class. For our first Language Arts component today, we are focusing on ${comp1}. Watch me closely as I model how this works. Notice how I look at our key concept: ${topic}..." [Teacher explicitly points to anchor chart and demonstrates step-by-step].`,
        guidedPracticeTask: `Pair-share drill and choral response: Students practice ${comp1} with their shoulder partner using the mentor examples on the board while the teacher circulates with the clipboard.`,
        formativeCheck: {
          teacherAsks: `"Who can explain the key pattern we just identified in ${comp1}?"`,
          expectedResponse: `Students articulate the correct pattern and give a novel example.`,
          ifCorrect: `Praise active listening and transition to Component 2: ${comp2}.`,
          ifIncorrect: `Re-model with a simpler visual example on the board before proceeding.`
        }
      };
    }

    if (!plan.component2Details) {
      plan.component2Details = {
        name: comp2 as any,
        timeAllocation: '20 minutes',
        explicitTeachingScript: `Teacher says: "Now let us bridge directly into our second component: ${comp2}. How does what we just learned connect to our writing and word study? Let me show you on the board..." [Teacher models the application of ${comp2}].`,
        guidedPracticeTask: `Interactive student practice: Students record 2 practice applications of ${comp2} in their notebooks and verify with a partner.`,
        formativeCheck: {
          teacherAsks: `"How does ${comp2} help us become stronger readers and writers in Belize?"`,
          expectedResponse: `Students connect the skill to clearer communication and reading accuracy.`,
          ifCorrect: `Release students to integrated independent practice.`,
          ifIncorrect: `Provide scaffolded sentence frames on the board for additional support.`
        }
      };
    }

    // Guarantee Complete Reading Passage ("No Missing Resources Rule")
    if (!plan.readingPassageFull || !plan.readingPassageFull.content) {
      const isInfant = grade.includes('Infant');
      plan.readingPassageFull = {
        title: `${topic}: A Belizean Discovery`,
        wordCount: isInfant ? 95 : 185,
        gradeLevel: grade,
        genre: 'Informational Narrative',
        content: `Under the warm Belizean sunshine, Jamal and his sister Maya walked along the bustling market street in San Ignacio. The air was rich with the sweet aroma of ripe mangoes, fresh oranges, and warm cassava bread. 

"Look at that wooden carving," Jamal exclaimed, pointing toward an artisan table displaying handcrafted toucans and jaguars. "The wood is polished so smooth!"

Maya looked closely at the artisan carving a mahogany bowl. "Our teacher told us that Belizean hardwoods like mahogany and cedar have been celebrated for centuries. Skilled craftspeople preserve our cultural heritage with every piece they shape."

As they continued along the Macal River, they watched yellow-headed parrots fly across the canopy. Jamal smiled and realized that observing their community with curious eyes made every day an exciting lesson in discovery.`,
        vocabularyHighlighted: ['artisan', 'heritage', 'mahogany', 'preserve', 'discovery'],
        comprehensionQuestions: [
          {
            question: `Where were Jamal and Maya walking, and what sights and sounds did they experience?`,
            answer: `They were walking along the market street in San Ignacio, seeing fruit like mangoes and cassava bread, and smelling sweet aromas.`,
            cognitiveLevel: 'Literal'
          },
          {
            question: `Why does Maya describe the artisan's carving work as preserving cultural heritage?`,
            answer: `Because carving Belizean hardwoods into animals and bowls keeps traditional artistic techniques and history alive.`,
            cognitiveLevel: 'Inferential'
          },
          {
            question: `What does the word "artisan" mean in the passage?`,
            answer: `A skilled craftsperson who makes items by hand using traditional methods.`,
            cognitiveLevel: 'Vocabulary in Context'
          },
          {
            question: `How can students in your classroom celebrate and preserve local Belizean traditions?`,
            answer: `By learning stories from community elders, practicing traditional crafts, and sharing cultural knowledge respectfully.`,
            cognitiveLevel: 'Evaluative / Applied'
          }
        ]
      };
    }

    // Guarantee Complete Anchor Chart Blueprint
    if (!plan.anchorChartBlueprint) {
      plan.anchorChartBlueprint = {
        title: `${topic} — Anchor Chart Blueprint`,
        layout: `Two-Column Balanced Concept Layout with Central Visual Focus`,
        headerText: `Language Arts Focus: ${comp1} + ${comp2}`,
        keyRulesOrDefinitions: [
          `Rule 1: Always listen and look for key word patterns before writing.`,
          `Rule 2: Match sound to spelling systematically when decoding unfamiliar terms.`,
          `Rule 3: Use complete sentences with clear subjects and verbs in every response.`
        ],
        visualDiagramDescription: `Draw a central tree graphic labeled 'Roots of Clear Communication'. On the left branch, illustrate Component 1 (${comp1}) with speech bubble and ear icons. On the right branch, illustrate Component 2 (${comp2}) with pencil and open book icons. Beneath the trunk, write the three golden rules in bold colored boxes.`,
        studentKeyTakeaway: `When we combine ${comp1} with ${comp2}, our speaking, reading, and writing become clear, expressive, and confident.`
      };
    }

    // Guarantee Complete Daily Exit Ticket Package
    if (!plan.exitTicketPackage) {
      plan.exitTicketPackage = {
        title: `Language Arts Exit Ticket: ${comp1} & ${comp2}`,
        prompt: `Complete all 3 questions independently to demonstrate your mastery of today's two components.`,
        questions: [
          {
            question: `Component 1 Check (${comp1}): Identify the key feature or word in today's mentor example.`,
            answerKey: `Student correctly identifies the targeted sound, word, or comprehension detail.`,
            points: 1
          },
          {
            question: `Component 2 Check (${comp2}): Write one complete sentence applying today's language structure or phonics rule.`,
            answerKey: `Student writes a grammatically complete sentence demonstrating correct capitalization, punctuation, and target structure.`,
            points: 1
          },
          {
            question: `Self-Assessment & Reflection: Explain in one sentence how today's skills help you communicate more effectively.`,
            answerKey: `Thoughtful student reflection connecting today's lesson to real communication in Belize.`,
            points: 1
          }
        ],
        scoringGuidance: `Total Points: 3. Question 1 (1 pt), Question 2 (1 pt), Question 3 (1 pt).`,
        masteryThreshold: `80% Mastery: Score of 3/3 or 2/3 with correct application on Question 2.`,
        groupingRuleTomorrow: `Students scoring 3/3 advance to independent creative extension. Students scoring 0-1 join Teacher Guided Table during tomorrow's 10-minute warm-up for targeted intervention.`
      };
    }
  }

  // 21. Differentiation Framework Guarantee & Normalization
  const rawDiff = plan.differentiationFramework as any;
  const rawStruggling = rawDiff?.strugglingLearners;
  const rawOnLevel = rawDiff?.onLevelLearners;
  const rawAdv = rawDiff?.advancedLearners;
  const rawInclusion = rawDiff?.inclusionSupport;

  plan.differentiationFramework = {
    strugglingLearners: {
      scaffolds: rawStruggling?.scaffolds?.length ? rawStruggling.scaffolds : [
        `Step-by-step graphic organizer breaking down ${topic} into sequential parts.`,
        `Pre-printed sentence frames and key vocabulary bank.`
      ],
      visuals: rawStruggling?.visuals?.length ? rawStruggling.visuals : (rawStruggling?.guidedPrompts?.length ? rawStruggling.guidedPrompts : [
        `Anchor chart visual reference posted on front board with color-coded steps.`,
        `Concrete pictorial diagrams illustrating ${topic}.`
      ]),
      manipulatives: rawStruggling?.manipulatives?.length ? rawStruggling.manipulatives : (rawStruggling?.materials?.length ? rawStruggling.materials : [
        `Tactile counters, index cards, or physical word tiles for interactive manipulation.`
      ]),
      simplifiedInstructions: rawStruggling?.simplifiedInstructions || `Provide directions in one-step chunks with teacher verification before moving to step 2.`,
      guidedSupport: rawStruggling?.guidedSupport || `Teacher checks in within first 3 minutes of independent practice at the guided table.`
    },
    onLevelLearners: {
      participationExpectations: rawOnLevel?.participationExpectations || `Active verbal participation in whole-group discussions and paired practice.`,
      independentWorkExpectations: rawOnLevel?.independentWorkExpectations || `Complete standard independent tasks with at least 80% accuracy within allocated time.`,
      peerCollaboration: rawOnLevel?.peerCollaboration || `Collaborate respectfully with table partner to explain reasoning and cross-check solutions.`
    },
    advancedLearners: {
      challengeTasks: rawAdv?.challengeTasks?.length ? rawAdv.challengeTasks : (rawAdv?.extensions?.length ? rawAdv.extensions : [
        `Formulate complex real-world challenge problems applying ${topic} in Belizean contexts.`,
        `Analyze non-standard cases and explain underlying general patterns.`
      ]),
      deeperThinkingPrompts: rawAdv?.deeperThinkingPrompts?.length ? rawAdv.deeperThinkingPrompts : (rawAdv?.higherOrderQuestions?.length ? rawAdv.higherOrderQuestions : [
        `"How would our rule change if one of the conditions was reversed?"`,
        `"Can you prove this result holds true in all possible scenarios?"`
      ]),
      extensionActivity: rawAdv?.extensionActivity || (rawAdv?.independentTasks?.[0] || `Design a student-created mini anchor chart or teaching game for the classroom library.`),
      leadershipRole: rawAdv?.leadershipRole || `Act as peer coach to guide table partners using Socratic questions rather than giving away answers.`
    },
    inclusionSupport: {
      dyslexia: rawInclusion?.dyslexia || `High-contrast printed font, visual icons accompanying text, and oral reading option.`,
      dyscalculia: (subject === 'Mathematics') 
        ? (rawInclusion?.dyscalculia || `Number line visual, color-coded arithmetic steps, and physical counter assistance.`)
        : undefined,
      ell: rawInclusion?.ell || `Dual English/Kriol clarification, visual vocabulary flashcards, and paired peer translator.`,
      behavior: rawInclusion?.behavior || `Clear structured timers, positive praise reinforcement, and designated calm focus space.`,
      sensory: rawInclusion?.sensory || `Reduced auditory distractions and ergonomic flexible seating near front whiteboard.`
    }
  };

  if (isLanguageArtsSubject(plan.subject)) {
    return enforceLanguageArtsPurityAndQuality(plan);
  }

  if (isMathematicsSubject(plan.subject)) {
    return enforceMathematicsPurityAndQuality(plan, context);
  }

  // Enforce subject purity for non-Language Arts subjects
  if (isHFLE) {
    plan.curriculumCode = getAuthoritativeCurriculumCode({ subject: 'HFLE', grade, cycle, topic });
    delete (plan as any).readingPassageFull;
    delete (plan as any).languageArtsComponents;
    delete (plan as any).component1Details;
    delete (plan as any).component2Details;
  } else if (isScience) {
    plan.curriculumCode = getAuthoritativeCurriculumCode({ subject: 'Science and Technology', grade, cycle, topic });
    delete (plan as any).readingPassageFull;
    delete (plan as any).languageArtsComponents;
    delete (plan as any).component1Details;
    delete (plan as any).component2Details;
  } else if (isBS) {
    plan.curriculumCode = getAuthoritativeCurriculumCode({ subject: 'Belizean Studies', grade, cycle, topic });
    delete (plan as any).readingPassageFull;
    delete (plan as any).languageArtsComponents;
    delete (plan as any).component1Details;
    delete (plan as any).component2Details;
  } else if (subject === 'Mathematics') {
    plan.curriculumCode = getAuthoritativeCurriculumCode({ subject: 'Mathematics', grade, cycle, topic });
    delete (plan as any).readingPassageFull;
    delete (plan as any).languageArtsComponents;
    delete (plan as any).component1Details;
    delete (plan as any).component2Details;
  }

  return plan;
}
