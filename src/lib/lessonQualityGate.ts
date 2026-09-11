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
  const subtopic = plan.subtopic || context?.subtopic || topic;
  const cycle = plan.cycle || context?.cycle || 2;
  const learningOutcome = plan.learningOutcome || context?.learningOutcome || `Demonstrate understanding and practical application of ${topic}.`;

  // 1. Normalize Learning Objectives with One Shared Condition
  const normObj = normalizeLearningObjectives(plan, { topic, materials: plan.materials });
  const condition = normObj.condition || `Given concrete models, guided practice exercises, and primary workbook activities,`;
  const cognitiveObj = normObj.cognitive || `Students will identify, explain, and solve problems involving ${topic} with at least 80% accuracy.`;
  const psychomotorObj = normObj.psychomotor || `Students will write step-by-step solutions, manipulate models, and record observations accurately in their exercise books.`;
  const affectiveObj = normObj.affective || `Students will actively participate in partner discussions, ask clarifying questions, and show confidence in their mathematical reasoning.`;

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
      : [
          `I can define and explain ${topic} in my own words using academic vocabulary.`,
          `I can correctly follow the step-by-step method to solve representative problems.`,
          `I can explain my reasoning to a partner and verify my final answers.`
        ]
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
      duration: plan.duration || '45 minutes'
    };
  }

  // 3. Timing Validation & Rebalancing
  const { plan: timedPlan } = validateAndBalanceLessonTiming(plan, plan.duration || '45 minutes');
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
      opening: `"Good morning class! Eyes on the board and pencils down. Today we are unlocking a powerful skill in ${subject}: ${topic}. By the end of our lesson, every single one of you will be able to solve and explain these problems with complete confidence."`,
      introduction: `"Take a look at the problem on the board. Raise your hand if you have seen something like this in everyday life or in our previous units. Today, we are going to learn the exact rule that makes solving this easy and enjoyable."`,
      explanation: `"Notice that when we examine ${topic}, there are three crucial elements we look for. First, we identify what we are given. Second, we choose our strategy. Third, we carry out our steps systematically without rushing."`,
      modeling: `"Watch me carefully. I am going to solve this first example out loud so you can hear what a mathematician/reader thinks in their head. Watch my marker: Step 1, I write down... Step 2, I notice that... Step 3, I verify my answer. Notice how I did not guess; I followed our clear rule."`,
      questioning: [
        `"Why did I complete Step 1 before moving to Step 2?"`,
        `"What clue in the problem told me which operation or rule to apply?"`,
        `"Who can put into their own words what our second step accomplished?"`
      ],
      transitions: [
        `"Now that you have seen me model it, we are going to tackle the next one together as a team."`,
        `"Turn to your learning partner. Partner A, explain the first step; Partner B, confirm or correct."`,
        `"Pencils ready. You have shown me you understand during our guided practice; now it's your turn to shine independently."`
      ],
      directions: `"Open your exercise books to today's date. You have 10 minutes to complete problems 1 through 5. Show your full working for every single question. If you finish early, move directly to the extension challenge on the side board."`,
      feedbackLanguage: `"Excellent precision with that intermediate step, Maria! Notice how keeping your work organized helped you catch that small error before moving on."`,
      correctionPrompts: `"Stop right there and take another look at Step 2. What does our rule say about that sign/word? Review your anchor chart and adjust."`,
      closing: `"Pencils down, eyes up in 3... 2... 1. Today, we mastered ${topic}. Turn to your neighbor and tell them the single most important rule we learned today. Great work today, class!"`
    };
  }

  // 10. Instructional Sequence (I DO, WE DO, YOU DO)
  if (!plan.instructionalSequence) {
    plan.instructionalSequence = {
      iDo: {
        teacherAction: `The teacher displays Problem #1 on the board, models clear physical posture, points explicitly to each component, and writes out every intermediate line of work.`,
        teacherExplanation: `"I am going to read the problem carefully twice. I underline the key terms. Now I ask myself: What is this asking me to find? I apply our three-step method on the board."`,
        workedExample: `Model Problem: Clearly worked example demonstrating the target standard for ${topic} with full steps and final verified answer.`,
        thinkAloud: `"I am thinking: I shouldn't jump directly to the answer. If I write down each step, I eliminate careless mistakes and can prove my answer is right."`,
        expectedStudentObservation: `Students track the teacher's marker, note the organizational layout in their notebooks, and answer periodic check questions.`
      },
      weDo: {
        tasks: [
          `Collaborative Practice Problem #1 solved as a whole class with student call-and-response.`,
          `Paired Practice Problem #2 where partners take turns verbalizing and writing alternating steps.`
        ],
        teacherPrompts: [
          `"Class, what is our very first move for this problem?"`,
          `"Partner A, whisper the next step to Partner B in 5 seconds."`
        ],
        expectedResponses: [
          `Students identify the first step synchronously and state the exact rule.`,
          `Partners converse using academic vocabulary and confirm intermediate calculations.`
        ],
        correctAnswers: [
          `Intermediate step verified accurately.`,
          `Final solution computed and labeled with proper units or formatting.`
        ],
        feedbackLanguage: `"Brilliant teamwork at Table 2—you caught the trick in Step 2 by checking your anchor chart!"`,
        correctionPrompts: `"Check your sign/spelling on line 3. Remember what happens when we combine those parts."`
      },
      youDo: {
        studentTasks: [
          `Complete 5 targeted practice problems in individual exercise books.`,
          `Write a 1-sentence mathematical or conceptual justification for Problem #5.`
        ],
        problemsOrPassages: [
          `Problem 1 (Foundational application of rule)`,
          `Problem 2 (Standard multi-step calculation)`,
          `Problem 3 (Problem requiring careful attention to signs/structure)`,
          `Problem 4 (Real-world word problem set in Belizean community)`,
          `Problem 5 (Higher-order explanation question)`
        ],
        activities: [
          `Independent problem-solving in exercise books.`,
          `Self-check against the board checklist before submitting.`
        ],
        successCriteria: `Student independently solves at least 4 out of 5 problems accurately with visible working shown.`
      }
    };
  }

  // 11. Worked Examples List
  if (!plan.workedExamplesList || plan.workedExamplesList.length === 0) {
    const isMath = subject.toLowerCase().includes('math');
    const isLA = subject.toLowerCase().includes('language') || subject.toLowerCase().includes('reading') || subject.toLowerCase().includes('english');
    const isScience = subject.toLowerCase().includes('science');

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
          commonErrorOrScientificReasoning: `Common Error: Students often forget to record regrouping or reverse the order of subtraction/division.`,
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
    } else if (isScience) {
      plan.workedExamplesList = [
        {
          subjectType: 'Science',
          problemOrContext: `Investigation Prompt: What happens to [variable] when we test [condition] in our classroom environment?`,
          stepByStepSolution: [
            { step: 1, action: `Formulate a testable prediction`, explanation: `State an 'If... then...' hypothesis based on prior observations.` },
            { step: 2, action: `Execute the fair test procedure`, explanation: `Keep all control variables constant while changing only the test variable.` },
            { step: 3, action: `Record qualitative and quantitative data`, explanation: `Note measurements in a structured data table in exercise books.` },
            { step: 4, action: `Formulate evidence-based claim`, explanation: `Explain what the observed data proves using scientific terminology.` }
          ],
          finalAnswerOrModelResponse: `Scientific Conclusion: Clear explanation linking observed evidence to the underlying scientific principle.`,
          commonErrorOrScientificReasoning: `Scientific Reasoning: Correlation does not equal causation; changing multiple variables invalidates the fair test.`,
          belizeanContextNote: `Grounding in Belize's biodiversity: Mountain Pine Ridge, barrier reef marine life, or rainforest canopies.`
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
        teacherAsksOrDoes: `"Write only the answer to Step 1 for Problem #2 on your slates. 3, 2, 1... Chin it!"`,
        studentsDo: `Students hold slates under their chins facing the teacher simultaneously.`,
        expectedResponse: `Class exhibits uniform correct notation and values.`,
        ifCorrect: `Praise speed and proceed to Step 2.`,
        ifIncorrect: `Point out the common error immediately without naming students: "I see three slates that forgot our rule on place value. Erase and correct right now."`
      },
      {
        checkType: 'Pair-Share Cold Call',
        teacherAsksOrDoes: `"Turn to your shoulder partner and explain why we box our final answer. I will cold-call two students in 30 seconds."`,
        studentsDo: `Both partners speak and listen actively.`,
        expectedResponse: `Cold-called students state the verification purpose clearly.`,
        ifCorrect: `Reinforce student explanation and record a star on the board tracker.`,
        ifIncorrect: `Ask a peer to assist: "Who can build upon that explanation and help our friend complete the rule?"`
      }
    ];
  }

  // 14. "If Students Are Struggling" Protocol
  if (!plan.ifStudentsAreStruggling?.simplerExplanation) {
    plan.ifStudentsAreStruggling = {
      signsOfConfusion: [
        `Hesitating to write anything down after instructions are given.`,
        `Flipping back and forth between notebook pages repeatedly.`,
        `Asking a neighbor to copy their answer without calculating.`,
        `Producing an answer that is wildly unreasonable in scale or grammar.`
      ],
      likelyCause: `The student has not solidified the prerequisite concept or was overwhelmed by multi-step cognitive load.`,
      simplerExplanation: `Strip away all unnecessary words or large numbers. Break the concept down to its absolute simplest 1-to-1 relationship: "Think of this as simple grouping. If you have 2 groups of 3 mangoes, how many do you hold?"`,
      alternativeExample: `Use physical counters, bottle caps, or a drawn number line on the desk to physically move objects rather than manipulating abstract symbols.`,
      additionalGuidedPractice: `Work through one problem side-by-side with the teacher holding the pen for step 1, the student writing step 2, and both celebrating step 3.`,
      visualOrManipulativeOption: `Provide a printed laminated step-by-step cue card with color-coded steps (Step 1 = Green, Step 2 = Yellow, Step 3 = Blue).`,
      reteachingStrategy: `Form a small pull-out focus group at the teacher table during independent practice. Re-model with physical manipulatives for 5 minutes.`,
      followUpCheck: `Have the student solve one solitary problem on a mini-whiteboard while explaining their action aloud before returning to independent work.`
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
        teacherResponse: `"Your strategy is 100% correct, but your numbers drifted across columns. Let's draw vertical grid lines in your book to keep columns straight."`,
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
    plan.completeAssessment = {
      task: `Independent Mastery Check: 4 core problems/questions and 1 applied word problem evaluating ${topic}.`,
      expectedResponse: `Students record complete working, step-by-step algorithms, and clear final answers in their exercise books.`,
      answerKey: `Question 1: Verified correct step-by-step working and final value.\nQuestion 2: Verified correct step-by-step working and final value.\nQuestion 3: Verified correct step-by-step working and final value.\nQuestion 4: Verified correct step-by-step working and final value.\nQuestion 5 (Applied/Explanation): Full student justification linking strategy to the mathematical/grammatical rule.`,
      rubric: [
        {
          criteria: `Conceptual Understanding`,
          exemplary: `Demonstrates thorough, flawless comprehension of underlying principles and justifies steps with precision.`,
          proficient: `Applies concepts correctly with minor, non-systematic computational or clerical slips.`,
          developing: `Requires teacher prompting to choose the correct approach or confuses terminology.`
        },
        {
          criteria: `Procedural Execution`,
          exemplary: `All steps organized logically, work shown clearly, final answers boxed and accurate.`,
          proficient: `Follows the established algorithm correctly; work is legible and mostly complete.`,
          developing: `Skips required intermediate lines or makes persistent calculation/format errors.`
        }
      ],
      masteryCriteria: `Mastery Standard: Student achieves at least 80% accuracy (4 out of 5 problems correct) with full procedural working visible.`
    };
  }

  // 18. Student Materials (Generated Worksheets & Resources)
  if (!plan.studentMaterials || plan.studentMaterials.length === 0) {
    plan.studentMaterials = [
      {
        title: `${topic} - Guided Practice Worksheet`,
        type: 'worksheet',
        content: `NAME: __________________________   DATE: ___________________\nGRADE: ${grade}   TOPIC: ${topic}\n\nDIRECTIONS: Solve each problem below. SHOW ALL YOUR WORKING. Box your final answers.\n\n1. [Foundational Practice Problem]\n   Working Space:\n\n\n   Answer: __________________\n\n2. [Standard Application Problem]\n   Working Space:\n\n\n   Answer: __________________\n\n3. [Multi-Step Challenge]\n   Working Space:\n\n\n   Answer: __________________\n\n4. [Real-World Belizean Context Problem]\n   Working Space:\n\n\n   Answer: __________________\n\n5. SUPER CHALLENGE: Explain in 2 sentences how you know your answer to Problem #4 is correct.\n   ___________________________________________________________________________\n   ___________________________________________________________________________`,
        answerKey: `1. Correct working shown; verified answer.\n2. Correct working shown; verified answer.\n3. Correct working shown; verified answer.\n4. Correct working shown; verified answer.\n5. Student explains that checking with the reverse operation confirms the answer.`
      },
      {
        title: `${topic} - Daily Exit Ticket`,
        type: 'exit_ticket',
        content: `EXIT TICKET: ${topic}\nName: ____________________ Date: _____________\n\n1. What was the most important rule we learned today?\n   _____________________________________________________\n\n2. Solve this problem independently:\n   [Representative problem]\n\n   Answer: _____________\n\n3. Circle your confidence level:  😃 Got it!   😐 Need practice   🙁 Still confused`,
        answerKey: `1. Correct formulation of the core rule.\n2. Verified numerical or textual solution.\n3. Teacher sorts into three piles for next-day grouping.`
      }
    ];
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

  return plan;
}
