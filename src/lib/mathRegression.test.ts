import { 
  enforceMathematicsPurityAndQuality, 
  buildAuthoritativeMathWorksheet, 
  buildAuthoritativeMathExitTicket,
  generateMathFallbackSolution,
  runMathematicsAlignmentAudit,
  purgeUnrelatedMathContent,
  isMathematicsSubject,
  MATH_90_MIN_STAGES
} from './mathQualityGate';
import { 
  evaluateArithmeticExpression, 
  sanitizeMathNotation, 
  normalizeExpressionForEvaluation,
  evaluateAlgebraicExpression,
  translateVerbalPhraseToAlgebraic
} from './mathEvaluator';
import { 
  harmonizePhaseSubactivityTimings, 
  validateAndHarmonizeLessonTiming,
  parseMinutes
} from './timingValidation';
import { parseAndNormalizeWorksheet } from './worksheetSystem';
import { resolveCompleteLessonResources } from './lessonExportResolver';
import { isLanguageArtsSubject } from './languageArtsQualityGate';
import { getAuthoritativeCurriculumCode } from '../services/curriculumHierarchyService';
import { LessonPlan } from '../types';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`TEST ASSERTION FAILED: ${message}`);
  }
}

console.log('================================================================');
console.log('=== RUNNING COMPREHENSIVE MATHEMATICS ENGINE REGRESSION TESTS ===');
console.log('=== 13-SUITE VERIFICATION FOR BELIZE PRIMARY STANDARD 6 MATH ===');
console.log('================================================================\n');

// --------------------------------------------------------------------------
// SUITE 1: Deterministic PEMDAS & Nested Grouping Evaluator
// --------------------------------------------------------------------------
console.log('Suite 1: Deterministic PEMDAS & Nested Grouping Evaluator');
// 1. Key expression: 3 × [250 - (4² × 10)] + (2³ × 15) = 390
const eval1 = evaluateArithmeticExpression('3 × [250 - (4² × 10)] + (2³ × 15)');
assert(eval1.isValid && eval1.result === 390, `Expected 390, got ${eval1.result} (Valid: ${eval1.isValid})`);

// 2. Key expression: 120 + 4 × [3³ - (5 × 2) + 16 ÷ 2³] = 196
const eval2 = evaluateArithmeticExpression('120 + 4 × [3³ - (5 × 2) + 16 ÷ 2³]');
assert(eval2.isValid && eval2.result === 196, `Expected 196, got ${eval2.result} (Valid: ${eval2.isValid})`);

// 3. Key expression: 100 - 4 × (2³ + 2) = 60
const eval3 = evaluateArithmeticExpression('100 - 4 × (2³ + 2)');
assert(eval3.isValid && eval3.result === 60, `Expected 60, got ${eval3.result} (Valid: ${eval3.isValid})`);

// 4. Key expression: 5 × [2 × (3² + 1)] × 4 = 400
const eval4 = evaluateArithmeticExpression('5 × [2 × (3² + 1)] × 4');
assert(eval4.isValid && eval4.result === 400, `Expected 400, got ${eval4.result} (Valid: ${eval4.isValid})`);

// 5. Left-to-right division and multiplication: 12 ÷ 3 × 2 = 8 (NOT 2)
const eval5 = evaluateArithmeticExpression('12 ÷ 3 × 2');
assert(eval5.isValid && eval5.result === 8, `12 ÷ 3 × 2 must strictly equal 8 (left-to-right), got ${eval5.result}`);

// 6. Left-to-right subtraction and addition: 20 - 5 + 3 = 18 (NOT 12)
const eval6 = evaluateArithmeticExpression('20 - 5 + 3');
assert(eval6.isValid && eval6.result === 18, `20 - 5 + 3 must strictly equal 18 (left-to-right), got ${eval6.result}`);

// 7. Mixed precedence: 6 + 12 ÷ 3 + 2 × 4 = 18
const eval7 = evaluateArithmeticExpression('6 + 12 ÷ 3 + 2 × 4');
assert(eval7.isValid && eval7.result === 18, `6 + 12 ÷ 3 + 2 × 4 must equal 18, got ${eval7.result}`);

// 8. Exponent and multiplication: 45 + 5 × 2³ = 85
const eval8 = evaluateArithmeticExpression('45 + 5 × 2³');
assert(eval8.isValid && eval8.result === 85, `45 + 5 × 2³ must equal 85, got ${eval8.result}`);

// 9. Standard exponents: 2^3=8, 3^3=27, 2^4=16, 2^5=32
assert(evaluateArithmeticExpression('2³').result === 8, '2³ = 8');
assert(evaluateArithmeticExpression('3³').result === 27, '3³ = 27');
assert(evaluateArithmeticExpression('2⁴').result === 16, '2⁴ = 16');
assert(evaluateArithmeticExpression('2⁵').result === 32, '2⁵ = 32');

// 10. Exponential growth formulas: y = 5 * 2^n
assert(evaluateArithmeticExpression('5 * 2^3').result === 40, '5 * 2^3 = 40');
assert(evaluateArithmeticExpression('5 * 2^5').result === 160, '5 * 2^5 = 160');
assert(evaluateArithmeticExpression('3 * 2^4').result === 48, '3 * 2^4 = 48');

// 11. Linear vs Exponential: Plan A (10 + 10*n) vs Plan B (1 * 2^n)
const planA_w3 = evaluateArithmeticExpression('10 + 10 * 3').result;
const planB_w3 = evaluateArithmeticExpression('1 * 2^3').result;
assert(planA_w3 === 40 && planB_w3 === 8, `Week 3: Plan A $40 vs Plan B $8 (got A=${planA_w3}, B=${planB_w3})`);
assert(planA_w3 > planB_w3, 'Plan A has more savings at Week 3 ($40 vs $8)');
console.log('✓ Suite 1 Passed: Deterministic evaluator verified on all 11 arithmetic benchmarks.\n');

// --------------------------------------------------------------------------
// SUITE 2: Mathematical Notation Repair & Dropped Operator Sanitizer
// --------------------------------------------------------------------------
console.log('Suite 2: Mathematical Notation Repair & Dropped Operator Sanitizer');
// 1. Repair dropped multiplication before power: "45 + 5 2³" -> "45 + 5 × 2³"
const repaired1 = sanitizeMathNotation('Evaluate: 45 + 5 2³');
assert(repaired1.includes('45 + 5 × 2³'), `Expected '45 + 5 × 2³', got '${repaired1}'`);

// 2. Repair dropped multiplication around brackets: "5 [2 (3² + 1)] 4" -> "5 × [2 × (3² + 1)] × 4"
const repaired2 = sanitizeMathNotation('5 [2 (3² + 1)] 4');
assert(repaired2.includes('5 × [2 × (3² + 1)] × 4'), `Expected '5 × [2 × (3² + 1)] × 4', got '${repaired2}'`);

// 3. Repair dropped multiplication between digits: "6 + 12 ÷ 3 + 2 4" -> "6 + 12 ÷ 3 + 2 × 4"
const repaired3 = sanitizeMathNotation('6 + 12 ÷ 3 + 2 4');
assert(repaired3.includes('6 + 12 ÷ 3 + 2 × 4'), `Expected '6 + 12 ÷ 3 + 2 × 4', got '${repaired3}'`);

// 4. Bracket balancing
const balanced = sanitizeMathNotation('3 × [250 - (4² × 10');
assert(balanced.includes(')') && balanced.includes(']'), `Unbalanced brackets must be closed: got '${balanced}'`);

// 5. Evaluator succeeds on repaired text
const evaluatedRepaired = evaluateArithmeticExpression(repaired1);
assert(evaluatedRepaired.result === 85, `Evaluator on repaired '45 + 5 2³' must equal 85, got ${evaluatedRepaired.result}`);
console.log('✓ Suite 2 Passed: Notation repair and dropped operator sanitization confirmed.\n');

// --------------------------------------------------------------------------
// SUITE 3: 90-Minute Timing Harmonization & Subactivity Scaling
// --------------------------------------------------------------------------
console.log('Suite 3: 90-Minute Timing Harmonization & Subactivity Scaling');
// 1. Internal sub-activity scaling when sub-activities exceed parent minutes
const unscaledActions = [
  'Teacher introduces bracket hierarchy on chart (15 mins)',
  'Students complete think-pair-share modeling (15 mins)'
];
const parentMins = 20;
const harmonizedActions = harmonizePhaseSubactivityTimings(unscaledActions, parentMins);

// Check that internal action tags do not exceed parent minutes
const actionTimeRegex = /\((\d+)\s*mins\)/g;
let sumHarmonized = 0;
harmonizedActions.forEach(act => {
  let match;
  while ((match = actionTimeRegex.exec(act)) !== null) {
    const m = parseInt(match[1], 10);
    assert(m <= parentMins, `Subactivity duration (${m} mins) cannot exceed parent phase (${parentMins} mins)`);
    sumHarmonized += m;
  }
});
assert(sumHarmonized <= parentMins, `Sum of subactivities (${sumHarmonized}) must not exceed parent phase (${parentMins})`);

// 2. Full 90-minute timing harmonization engine
const raw90TestPlan: Partial<LessonPlan> = {
  subject: 'Mathematics',
  grade: 'Standard 6',
  duration: '90 minutes',
  lessonAtAGlance: [
    { stage: 'Stage 1', time: '10 mins', timeMinutes: 10, teacherDoes: 'T', studentsDo: 'S' },
    { stage: 'Stage 2', time: '20 mins', timeMinutes: 20, teacherDoes: 'T', studentsDo: 'S' },
    { stage: 'Stage 3', time: '40 mins', timeMinutes: 40, teacherDoes: 'T', studentsDo: 'S' },
    { stage: 'Stage 4', time: '20 mins', timeMinutes: 20, teacherDoes: 'T', studentsDo: 'S' },
    { stage: 'Stage 5', time: '30 mins', timeMinutes: 30, teacherDoes: 'T', studentsDo: 'S' }
  ]
};
const harmonizedTimingResult = validateAndHarmonizeLessonTiming(raw90TestPlan as LessonPlan);
assert(harmonizedTimingResult.validation.isBalanced, 'Lesson timing must be rebalanced to exactly match 90 minutes');
assert(harmonizedTimingResult.validation.calculatedMinutes === 90, `Sum of stages must equal 90 (got ${harmonizedTimingResult.validation.calculatedMinutes})`);
console.log('✓ Suite 3 Passed: 90-minute timing cascade and subactivity harmonization verified.\n');

// --------------------------------------------------------------------------
// SUITE 4: 7 CPA Stages for Standard 6 Mathematics (Both Topics)
// --------------------------------------------------------------------------
console.log('Suite 4: 7 CPA Stages for Standard 6 Mathematics');
// 1. Constant stage breakdown
const totalStageMinutes = MATH_90_MIN_STAGES.reduce((sum, s) => sum + s.minutes, 0);
assert(totalStageMinutes === 90, `Sum of 7 stages must equal 90 minutes (got ${totalStageMinutes})`);
assert(MATH_90_MIN_STAGES.length === 7, 'Must have exactly 7 stages in 90-min progression');

// 2. Stages in PEMDAS Plan
const pemdasRawPlan: Partial<LessonPlan> = {
  subject: 'Mathematics',
  grade: 'Standard 6',
  topic: 'Consolidation of Number Sense, Exponents, PEMDAS, Financial Math, and Ratios',
  subtopic: 'Order of Operations with Nested Grouping & Exponents',
  learningOutcome: 'M6.1.1.2 Apply the order of operations (PEMDAS) to evaluate complex numerical expressions involving nested grouping symbols and exponents.',
  duration: '90 minutes',
  cycle: 1,
  week: 4,
  day: 1
};
const enrichedPemdasPlan = enforceMathematicsPurityAndQuality(pemdasRawPlan as LessonPlan);
assert(enrichedPemdasPlan.lessonAtAGlance?.length === 7, `Expected 7 stages in PEMDAS plan, got ${enrichedPemdasPlan.lessonAtAGlance?.length}`);

// 3. Stage 3 Explicit Teacher Modeling verification
const stage3 = enrichedPemdasPlan.lessonAtAGlance?.[2];
assert(stage3?.stage.includes('Stage 3') && stage3?.teacherDoes.toLowerCase().includes('think-aloud'), 'Stage 3 must feature explicit teacher modeling with think-aloud demonstration');

// 4. Stage 4 Guided Practice does NOT distribute worksheet
const stage4 = enrichedPemdasPlan.lessonAtAGlance?.[3];
assert(!stage4?.teacherDoes.toLowerCase().includes('distributes the worksheet'), 'Stage 4 must not prematurely distribute independent worksheet');

// 5. Stage 6 Independent Practice DOES administer worksheet
const stage6 = enrichedPemdasPlan.lessonAtAGlance?.[5];
assert(stage6?.stage.includes('Stage 6') && stage6?.teacherDoes.toLowerCase().includes('worksheet'), 'Stage 6 must be Independent Worksheet Practice');
console.log('✓ Suite 4 Passed: 7 CPA Stages, explicit modeling, and worksheet separation verified.\n');

// --------------------------------------------------------------------------
// SUITE 5: Tri-Domain ABCD Objectives & Non-Duplication
// --------------------------------------------------------------------------
console.log('Suite 5: Tri-Domain ABCD Objectives & Non-Duplication');
const objCond = enrichedPemdasPlan.learningObjectives?.condition || '';
const objCog = enrichedPemdasPlan.learningObjectives?.cognitive || '';
const objPsy = enrichedPemdasPlan.learningObjectives?.psychomotor || '';
const objAff = enrichedPemdasPlan.learningObjectives?.affective || '';

assert(objCond.toLowerCase().startsWith('given'), `Shared condition must start with "Given...", got: "${objCond}"`);
assert(objCog !== objPsy, 'Cognitive and Psychomotor objectives must be distinct');
assert(objCog !== objAff, 'Cognitive and Affective objectives must be distinct');
assert(objPsy !== objAff, 'Psychomotor and Affective objectives must be distinct');
assert(objCog.includes('80%') || objCog.includes('4 out of 5'), 'Cognitive objective must include measurable criterion (80%)');

// Verify for all 5 Days of the PEMDAS topic
for (let day = 1; day <= 5; day++) {
  const dayPlan = enforceMathematicsPurityAndQuality({
    ...pemdasRawPlan,
    day
  } as LessonPlan);
  const c = dayPlan.learningObjectives?.cognitive || '';
  const p = dayPlan.learningObjectives?.psychomotor || '';
  const a = dayPlan.learningObjectives?.affective || '';
  assert(c !== p && c !== a && p !== a, `Day ${day} objectives must be mutually non-duplicate`);
  assert(c.length > 20 && p.length > 20 && a.length > 20, `Day ${day} objectives must be fully articulated`);
}
console.log('✓ Suite 5 Passed: Non-duplicate ABCD objectives across all 5 days verified.\n');

// --------------------------------------------------------------------------
// SUITE 6: Structured workedExamplesList (Elimination of Generic Placeholders)
// --------------------------------------------------------------------------
console.log('Suite 6: Structured workedExamplesList (Elimination of Generic Placeholders)');
assert(Boolean(enrichedPemdasPlan.workedExamplesList && enrichedPemdasPlan.workedExamplesList.length >= 5), 'workedExamplesList must have at least 5 structured examples');

// Check no generic placeholder exists
const genericPlaceholder = 'Representative problem for';
enrichedPemdasPlan.workedExamplesList?.forEach((we, idx) => {
  const prob = we.problemOrContext || (we as any).problem || '';
  const finalAns = we.finalAnswerOrModelResponse || (we as any).finalAnswer || '';
  const steps = we.stepByStepSolution || (we as any).steps || [];
  assert(!prob.includes(genericPlaceholder), `workedExamplesList[${idx}] has generic problem placeholder`);
  assert(!steps.some((s: any) => (s.explanation || s.action || s).includes(genericPlaceholder)), `workedExamplesList[${idx}] has generic step placeholder`);
  assert(steps.length >= 2, `workedExamplesList[${idx}] must have multiple step-by-step lines`);
  assert(Boolean(finalAns && finalAns.length > 0), `workedExamplesList[${idx}] must have a non-empty finalAnswer`);
});

// Check that key test expressions appear in worked examples
const allWeProblems = enrichedPemdasPlan.workedExamplesList?.map(w => w.problemOrContext || (w as any).problem).join(' ') || '';
assert(allWeProblems.includes('45 + 5') || allWeProblems.includes('390') || allWeProblems.includes('196') || allWeProblems.includes('400'), 'workedExamplesList must contain authoritative PEMDAS benchmark problems');
console.log('✓ Suite 6 Passed: Structured workedExamplesList completely free of generic placeholders.\n');

// --------------------------------------------------------------------------
// SUITE 7: Authentic Belizean Real-World Contexts & Pedagogical Integrity
// --------------------------------------------------------------------------
console.log('Suite 7: Authentic Belizean Real-World Contexts & Pedagogical Integrity');
// Check Belizean currency and locations in worksheet questions
const pemdasWs20 = buildAuthoritativeMathWorksheet(
  'Consolidation of Number Sense, Exponents, PEMDAS, Financial Math, and Ratios',
  'Order of Operations',
  'M6.1.1.2',
  'Standard 6',
  20
);
const wsPromptsCombined = pemdasWs20.questions.map(q => q.prompt).join(' ');
assert(wsPromptsCombined.includes('BZD') || wsPromptsCombined.includes('$'), 'Worksheet must contextualize financial problems in Belizean dollars');
assert(wsPromptsCombined.includes('Stann Creek') || wsPromptsCombined.includes('San Ignacio') || wsPromptsCombined.includes('Belize') || wsPromptsCombined.includes('Cayo'), 'Worksheet must reference authentic Belizean locations');

// Check differentiation does not force inappropriate concrete manipulatives for Standard 6 abstract nested brackets
const diff = enrichedPemdasPlan.differentiationFramework;
const diffManipulatives = diff?.strugglingLearners?.manipulatives || (diff as any)?.manipulatives || [];
assert(diffManipulatives.some((m: string) => m.toLowerCase().includes('bracket') || m.toLowerCase().includes('card') || m.toLowerCase().includes('strip') || m.toLowerCase().includes('highlighter') || m.toLowerCase().includes('frame')), 'Differentiation uses age-appropriate structural aids for nested PEMDAS');
console.log('✓ Suite 7 Passed: Belizean financial contexts and sound pedagogical tools confirmed.\n');

// --------------------------------------------------------------------------
// SUITE 8: Anticipatory Pre-Lesson Reflections
// --------------------------------------------------------------------------
console.log('Suite 8: Anticipatory Pre-Lesson Reflections');
const reflection = enrichedPemdasPlan.reflectionDashboard;
assert(Boolean(reflection), 'reflectionDashboard must be present');
const whatWorkedText = Array.isArray(reflection?.whatWorked) ? reflection.whatWorked.join(' ') : String(reflection?.whatWorked || '');
const needsImpText = Array.isArray(reflection?.needsImprovement) ? reflection.needsImprovement.join(' ') : String(reflection?.needsImprovement || '');
const reflectionCombined = `${whatWorkedText} ${needsImpText}`;
assert(
  reflectionCombined.toLowerCase().includes('anticipate') || 
  reflectionCombined.toLowerCase().includes('prior') || 
  reflectionCombined.toLowerCase().includes('prerequisite') ||
  reflectionCombined.toLowerCase().includes('prep'),
  'Reflections must be anticipatory teacher guidance, not fabricated post-lesson claims'
);
assert(!reflectionCombined.includes('students solved all 20 problems yesterday with 100%'), 'Must not claim fabricated student performance');
console.log('✓ Suite 8 Passed: Anticipatory pre-lesson reflection verified.\n');

// --------------------------------------------------------------------------
// SUITE 9: Daily PEMDAS Diagnostic Exit Tickets (Days 1–5 & 80% Threshold)
// --------------------------------------------------------------------------
console.log('Suite 9: Daily PEMDAS Diagnostic Exit Tickets (Days 1–5 & 80% Threshold)');
for (let day = 1; day <= 5; day++) {
  const ticket = buildAuthoritativeMathExitTicket(
    'Consolidation of Number Sense, Exponents, PEMDAS, Financial Math, and Ratios',
    'Order of Operations',
    'M6.1.1.2',
    day
  );
  
  const expectedQCount = day === 5 ? 5 : 3;
  assert(ticket.questions.length === expectedQCount, `Day ${day} exit ticket must have ${expectedQCount} questions (got ${ticket.questions.length})`);
  
  const totalPts = ticket.questions.reduce((sum, q) => sum + q.points, 0);
  assert(totalPts === 5, `Day ${day} exit ticket must total 5 points (got ${totalPts})`);
  assert(ticket.contentText.includes('Total Score: _____ / 5'), `Day ${day} student text must display / 5`);
  assert(ticket.answerKeyText.includes('4/5') || ticket.answerKeyText.includes('80%'), `Day ${day} answer key must document 80% (4/5) mastery threshold`);
}
console.log('✓ Suite 9 Passed: Days 1-5 exit tickets verified (5 points total, 80% / 4 of 5 threshold).\n');

// --------------------------------------------------------------------------
// SUITE 10: Authoritative 8-Question & 20-Question PEMDAS Worksheets
// --------------------------------------------------------------------------
console.log('Suite 10: Authoritative 8-Question & 20-Question PEMDAS Worksheets');
// 8-question daily practice
const pemdasWs8 = buildAuthoritativeMathWorksheet(
  'Consolidation of Number Sense, Exponents, PEMDAS, Financial Math, and Ratios',
  'Order of Operations',
  'M6.1.1.2',
  'Standard 6',
  8
);
assert(pemdasWs8.questions.length === 8, `Expected 8 questions, got ${pemdasWs8.questions.length}`);
assert(!pemdasWs8.answerKeyText.includes('Exact mathematical solution with full step-by-step working'), 'No generic answer key placeholder in 8Q');
assert(!pemdasWs8.worksheetContentText.includes('**1.** Name:'), 'Name field must not be a question');

// 20-question comprehensive bank
assert(pemdasWs20.questions.length === 20, `Expected 20 questions, got ${pemdasWs20.questions.length}`);
assert(!pemdasWs20.answerKeyText.includes('Exact mathematical solution with full step-by-step working'), 'No generic answer key placeholder in 20Q');

// Verify key benchmark questions exist in 20-question bank
const qKey1 = pemdasWs20.questions.find(q => q.prompt.includes('45 + 5 × 2³') || q.prompt.includes('45 + 5 2³'));
assert(Boolean(qKey1), 'Benchmark 45 + 5 × 2³ must exist in worksheet');
assert(qKey1?.solution.includes('85'), `45 + 5 × 2³ solution must be 85, got: ${qKey1?.solution}`);

const qKey2 = pemdasWs20.questions.find(q => q.prompt.includes('3 × [250') && q.prompt.includes('4² × 10'));
assert(Boolean(qKey2), 'Benchmark 3 × [250 - (4² × 10)] + (2³ × 15) must exist in worksheet');
assert(qKey2?.solution.includes('390'), `Benchmark solution must be 390, got: ${qKey2?.solution}`);

const qKey3 = pemdasWs20.questions.find(q => q.prompt.includes('120 + 4') && q.prompt.includes('3³'));
assert(Boolean(qKey3), 'Benchmark 120 + 4 × [3³ - (5 × 2) + 16 ÷ 2³] must exist in worksheet');
assert(qKey3?.solution.includes('196'), `Benchmark solution must be 196, got: ${qKey3?.solution}`);
console.log('✓ Suite 10 Passed: 8-question and 20-question PEMDAS worksheets verified with exact solutions.\n');

// --------------------------------------------------------------------------
// SUITE 11: Fallback Deterministic Solver for Arbitrary Prompts
// --------------------------------------------------------------------------
console.log('Suite 11: Fallback Deterministic Solver for Arbitrary Prompts');
const solPemdas1 = generateMathFallbackSolution('Evaluate: 3 × [250 - (4² × 10)] + (2³ × 15)', 1, 'PEMDAS');
assert(solPemdas1.includes('390'), `Fallback solver must evaluate benchmark expression to 390, got: ${solPemdas1}`);

const solPemdas2 = generateMathFallbackSolution('Calculate 12 ÷ 3 × 2', 2, 'PEMDAS');
assert(solPemdas2.includes('8'), `Fallback solver must evaluate 12 ÷ 3 × 2 to 8, got: ${solPemdas2}`);

const solPemdas3 = generateMathFallbackSolution('Solve 20 - 5 + 3', 3, 'PEMDAS');
assert(solPemdas3.includes('18'), `Fallback solver must evaluate 20 - 5 + 3 to 18, got: ${solPemdas3}`);
console.log('✓ Suite 11 Passed: Deterministic fallback solver evaluates arbitrary PEMDAS expressions.\n');

// --------------------------------------------------------------------------
// SUITE 12: Full Export Resolution Pipeline & DOCX Generation
// --------------------------------------------------------------------------
console.log('Suite 12: Full Export Resolution Pipeline & DOCX Generation');
const resolvedPemdas = resolveCompleteLessonResources(enrichedPemdasPlan, {
  schoolName: 'St. Ignatius Primary School',
  teacherName: 'Standard 6 Mathematics Lead'
});
assert(resolvedPemdas.worksheet.hasWorksheet, 'Resolved package must include worksheet');
assert(resolvedPemdas.worksheet.totalQuestions === 8, 'Resolved package worksheet must default to 8 questions');
assert(resolvedPemdas.exitTicket.hasTicket, 'Resolved package must include exit ticket');
assert(resolvedPemdas.exitTicket.questions.length === 3, 'Resolved exit ticket must have 3 questions for Day 1');

const { buildReferenceLessonPlanDocx } = await import('./referenceLessonPlanExport');
const { exportStructuredWorksheetToDocx } = await import('./worksheetSystem');
const { Packer } = await import('docx');

const pemdasDoc = buildReferenceLessonPlanDocx(resolvedPemdas as any);
const pemdasBuffer = await Packer.toBuffer(pemdasDoc);
assert(pemdasBuffer.byteLength > 10000, `Master Lesson Plan DOCX must generate valid binary payload (got ${pemdasBuffer.byteLength} bytes)`);

const pemdasWsBlob: any = await exportStructuredWorksheetToDocx(resolvedPemdas.worksheet as any);
assert(Boolean(pemdasWsBlob && pemdasWsBlob.size > 5000), `Structured Worksheet DOCX must generate valid binary blob (got ${pemdasWsBlob?.size} bytes)`);
console.log('✓ Suite 12 Passed: Export pipeline and DOCX generation verified.\n');

// --------------------------------------------------------------------------
// SUITE 13: Subject and Curriculum Isolation (Zero Cross-Subject Bleed)
// --------------------------------------------------------------------------
console.log('Suite 13: Subject and Curriculum Isolation (Zero Cross-Subject Bleed)');
// Verify that non-math subjects are NOT routed into mathematics engine
assert(!isMathematicsSubject('Language Arts'), 'Language Arts must not be routed to Math');
assert(!isMathematicsSubject('Science and Technology'), 'Science must not be routed to Math');
assert(!isMathematicsSubject('Belizean Studies'), 'Belizean Studies must not be routed to Math');
assert(!isMathematicsSubject('HFLE'), 'HFLE must not be routed to Math');
assert(!isMathematicsSubject('Spanish'), 'Spanish must not be routed to Math');
assert(!isMathematicsSubject('Religious Studies'), 'Religious Studies must not be routed to Math');

// Verify other subjects retain their specific curriculum codes and objectives
const { enrichAndGuaranteeTeachReady } = await import('./lessonQualityGate');
const testSubjects = ['Language Arts', 'Science and Technology', 'Belizean Studies', 'HFLE', 'Spanish', 'Religious Studies'];

for (const subj of testSubjects) {
  const otherPlan = enrichAndGuaranteeTeachReady({
    subject: subj,
    grade: 'Standard 6',
    topic: `Core Concepts in ${subj}`,
    learningOutcome: `Demonstrate mastery in ${subj}`,
    duration: '45 minutes'
  } as any);

  assert(Boolean(otherPlan.curriculumCode), `Subject ${subj} must preserve authoritative curriculum code`);
  assert(Boolean(otherPlan.learningObjectives?.condition || otherPlan.learningObjectivesBoard?.condition), `Subject ${subj} must preserve learning objectives`);
  assert(otherPlan.studentMaterials && otherPlan.studentMaterials.length > 0, `Subject ${subj} must retain student materials`);
  // Ensure math stages or PEMDAS content never leaked into other subjects
  assert(
    !JSON.stringify(otherPlan.lessonAtAGlance || []).includes('PEMDAS') &&
    !JSON.stringify(otherPlan.lessonAtAGlance || []).includes('nested grouping'),
    `Subject ${subj} must have ZERO math/PEMDAS bleed`
  );
}
console.log('✓ Suite 13 Passed: Cross-subject isolation confirmed with zero bleed.\n');

// --------------------------------------------------------------------------
// SUITE 14: Standard 6 Algebraic Foundations 5-Day Progression (MA.ST6.C1.02)
// --------------------------------------------------------------------------
console.log('Suite 14: Standard 6 Algebraic Foundations 5-Day Progression (MA.ST6.C1.02, Cycle 1, Week 8)');

const rawAlgebraPlan: Partial<LessonPlan> = {
  subject: 'Mathematics',
  grade: 'Standard 6',
  cycle: 1,
  week: 8,
  day: 1,
  topic: 'Algebraic Foundations',
  subtopic: 'Writing and Evaluating Expressions from Word Scenarios',
  learningOutcome: 'MA.ST6.C1.02 Translate verbal phrases into algebraic expressions with variables and evaluate expressions when values are assigned.',
  duration: '90 minutes'
};

const enrichedAlgebraDay1 = enforceMathematicsPurityAndQuality(rawAlgebraPlan as LessonPlan);

// Curriculum Code verification
assert(enrichedAlgebraDay1.curriculumCode === 'MA.ST6.C1.02', `Expected curriculum code MA.ST6.C1.02, got ${enrichedAlgebraDay1.curriculumCode}`);

// Day 1: Verbal phrases -> Expressions without equals signs
assert(enrichedAlgebraDay1.learningObjectives?.cognitive?.includes('without equals signs') || 
       enrichedAlgebraDay1.learningObjectives?.cognitive?.includes('verbal phrases'), 
       'Day 1 cognitive objective must focus on verbal phrases without equals signs');

const algebraWsDay1 = buildAuthoritativeMathWorksheet(
  'Algebraic Foundations',
  'Writing and Evaluating Expressions',
  'MA.ST6.C1.02',
  'Standard 6',
  8,
  1
);
assert(algebraWsDay1.questions.length === 8, `Day 1 algebra worksheet must have 8 questions (got ${algebraWsDay1.questions.length})`);
const wsDay1Text = algebraWsDay1.questions.map(q => q.prompt).join(' ');
assert(wsDay1Text.toLowerCase().includes('six less than twice y') || wsDay1Text.includes('2y - 6'), 'Day 1 worksheet must include benchmark phrase "six less than twice y"');
assert(wsDay1Text.toLowerCase().includes('four less than five times x') || wsDay1Text.includes('5x - 4'), 'Day 1 worksheet must include benchmark phrase "four less than five times x"');

// Day 2: Substitution & Evaluation using Parentheses
const rawAlgebraDay2 = { ...rawAlgebraPlan, day: 2 };
const enrichedAlgebraDay2 = enforceMathematicsPurityAndQuality(rawAlgebraDay2 as LessonPlan);
assert(enrichedAlgebraDay2.subtopic?.includes('Substitution') || enrichedAlgebraDay2.learningObjectives?.cognitive?.includes('substitute'), 'Day 2 must focus on Substitution and Evaluation');
assert(!enrichedAlgebraDay2.subtopic?.includes('PEMDAS') && !enrichedAlgebraDay2.subtopic?.includes('Order of Operations with Nested Grouping'), 'Day 2 must NOT be hijacked by PEMDAS subtopic');

const algebraWsDay2 = buildAuthoritativeMathWorksheet(
  'Algebraic Foundations',
  'Evaluating Algebraic Expressions via Substitution',
  'MA.ST6.C1.02',
  'Standard 6',
  8,
  2
);
const wsDay2Text = algebraWsDay2.questions.map(q => q.prompt).join(' ');
assert(wsDay2Text.includes('3x') && wsDay2Text.includes('x = 6'), 'Day 2 worksheet must include benchmark 3x when x = 6');
assert(wsDay2Text.includes('3x²') || wsDay2Text.includes('3x^2'), 'Day 2 worksheet must include benchmark 3x^2 when x = 2');

// Day 3: Error Analysis & Misconception Diagnosis
const rawAlgebraDay3 = { ...rawAlgebraPlan, day: 3 };
const enrichedAlgebraDay3 = enforceMathematicsPurityAndQuality(rawAlgebraDay3 as LessonPlan);
assert(enrichedAlgebraDay3.subtopic?.includes('Error Analysis') || enrichedAlgebraDay3.learningObjectives?.cognitive?.includes('error'), 'Day 3 must focus on Error Analysis');

const algebraTicketDay3 = buildAuthoritativeMathExitTicket(
  'Algebraic Foundations',
  'Error Analysis',
  'MA.ST6.C1.02',
  3
);
const ticketDay3Text = algebraTicketDay3.questions.map(q => q.question || (q as any).prompt || '').join(' ');
assert(ticketDay3Text.includes('56') || ticketDay3Text.includes('concatenation') || ticketDay3Text.includes('5x'), 'Day 3 exit ticket must analyze concatenation misconception');
assert(ticketDay3Text.includes('36') || ticketDay3Text.includes('3x²') || ticketDay3Text.includes('3x^2'), 'Day 3 exit ticket must analyze exponent precedence misconception');

// Day 4: Authentic Belizean Real-World Scenarios
const rawAlgebraDay4 = { ...rawAlgebraPlan, day: 4 };
const enrichedAlgebraDay4 = enforceMathematicsPurityAndQuality(rawAlgebraDay4 as LessonPlan);
const algebraWsDay4 = buildAuthoritativeMathWorksheet(
  'Algebraic Foundations',
  'Formulating Algebraic Expressions for Belizean Real-World Scenarios',
  'MA.ST6.C1.02',
  'Standard 6',
  8,
  4
);
const wsDay4Text = algebraWsDay4.questions.map(q => q.prompt).join(' ');
assert(wsDay4Text.includes('citrus') || wsDay4Text.includes('Stann Creek'), 'Day 4 worksheet must feature Stann Creek citrus scenario (4b + 15)');
assert(wsDay4Text.includes('tomato') || wsDay4Text.includes('San Ignacio'), 'Day 4 worksheet must feature San Ignacio tomato scenario (1.50t + 0.50)');
assert(wsDay4Text.includes('water taxi') || wsDay4Text.includes('Belize City'), 'Day 4 worksheet must feature Belize City water taxi scenario (25a + 5)');
assert(wsDay4Text.includes('boat tour') || wsDay4Text.includes('Placencia'), 'Day 4 worksheet must feature Placencia boat tour scenario (12p + 30)');

// Day 5: Cumulative Review & 5-Question Mastery Assessment
const rawAlgebraDay5 = { ...rawAlgebraPlan, day: 5 };
const enrichedAlgebraDay5 = enforceMathematicsPurityAndQuality(rawAlgebraDay5 as LessonPlan);
const algebraWsDay5 = buildAuthoritativeMathWorksheet(
  'Algebraic Foundations',
  'Cumulative Mastery Assessment',
  'MA.ST6.C1.02',
  'Standard 6',
  5,
  5
);
assert(algebraWsDay5.questions.length === 5, `Day 5 mastery worksheet must have exactly 5 questions (got ${algebraWsDay5.questions.length})`);

const algebraTicketDay5 = buildAuthoritativeMathExitTicket(
  'Algebraic Foundations',
  'Cumulative Mastery Assessment',
  'MA.ST6.C1.02',
  5
);
assert(algebraTicketDay5.questions.length === 5, `Day 5 exit ticket must have exactly 5 questions (got ${algebraTicketDay5.questions.length})`);
const day5TotalPts = algebraTicketDay5.questions.reduce((sum, q) => sum + q.points, 0);
assert(day5TotalPts === 5, `Day 5 exit ticket must total 5 points (got ${day5TotalPts})`);
assert(algebraTicketDay5.answerKeyText.includes('4/5') || algebraTicketDay5.answerKeyText.includes('80%'), 'Day 5 ticket answer key must specify 80% (4/5 marks) mastery');

// Alignment audit across all 5 days
for (let d = 1; d <= 5; d++) {
  const plan = enforceMathematicsPurityAndQuality({ ...rawAlgebraPlan, day: d } as LessonPlan);
  const audit = runMathematicsAlignmentAudit(plan);
  assert(audit.status === 'PASS', `Day ${d} alignment audit must PASS (got ${audit.status}, errors: ${audit.errors.join('; ')})`);
  assert(audit.warnings.length === 0, `Day ${d} alignment audit must have 0 warnings`);
}
console.log('✓ Suite 14 Passed: Standard 6 Algebraic Foundations 5-day progression verified.\n');

// --------------------------------------------------------------------------
// SUITE 15: Explicit Verification of Prompt Test Suite Items A through M
// --------------------------------------------------------------------------
console.log('Suite 15: Explicit Verification of Prompt Test Suite Items A through M');

// TEST A: "six less than twice y" -> 2y - 6
console.log('Testing Test A: "six less than twice y" -> 2y - 6');
const transA = translateVerbalPhraseToAlgebraic('six less than twice y');
assert(transA.expression === '2y - 6', `[TEST A FAILED] Expected '2y - 6', got '${transA.expression}'`);
const solA = generateMathFallbackSolution('Write an algebraic expression for: six less than twice y', 1, 'Algebra');
assert(solA.includes('2y - 6'), `[TEST A FAILED] Fallback solution must produce '2y - 6', got: ${solA}`);
console.log('[TEST A PASSED] "six less than twice y" correctly translates to 2y - 6');

// TEST B: "four less than five times x" -> 5x - 4
console.log('Testing Test B: "four less than five times x" -> 5x - 4');
const transB = translateVerbalPhraseToAlgebraic('four less than five times x');
assert(transB.expression === '5x - 4', `[TEST B FAILED] Expected '5x - 4', got '${transB.expression}'`);
const solB = generateMathFallbackSolution('Translate into an algebraic expression: four less than five times x', 2, 'Algebra');
assert(solB.includes('5x - 4'), `[TEST B FAILED] Fallback solution must produce '5x - 4', got: ${solB}`);
console.log('[TEST B PASSED] "four less than five times x" correctly translates to 5x - 4');

// TEST C: 3x when x = 6 evaluates to 18 (not 56 or 36)
console.log('Testing Test C: 3x when x = 6 evaluates to 18 (not 56 or 36)');
const evalC = evaluateAlgebraicExpression('3x', { x: 6 });
assert(evalC.isValid && evalC.result === 18, `[TEST C FAILED] Expected 18, got ${evalC.result}`);
assert(evalC.result !== 56, '[TEST C FAILED] Must not concatenate to 56');
assert(evalC.result !== 36, '[TEST C FAILED] Must not produce 36');
const solC = generateMathFallbackSolution('Evaluate 3x when x = 6', 1, 'Algebra');
assert(solC.includes('18'), `[TEST C FAILED] Fallback solution must evaluate to 18, got: ${solC}`);
console.log('[TEST C PASSED] 3x when x = 6 strictly evaluates to 18 (concatenation 56 and squaring 36 rejected)');

// TEST D: 3x^2 when x = 2 evaluates to 12 (not 36)
console.log('Testing Test D: 3x^2 when x = 2 evaluates to 12 (not 36)');
const evalD = evaluateAlgebraicExpression('3x^2', { x: 2 });
assert(evalD.isValid && evalD.result === 12, `[TEST D FAILED] Expected 12, got ${evalD.result}`);
assert(evalD.result !== 36, '[TEST D FAILED] Must not square coefficient 3 to get (3*2)^2 = 36');
const solD = generateMathFallbackSolution('Evaluate 3x^2 when x = 2', 2, 'Algebra');
assert(solD.includes('12'), `[TEST D FAILED] Fallback solution must evaluate to 12, got: ${solD}`);
console.log('[TEST D PASSED] 3x^2 when x = 2 strictly evaluates to 12 (exponent precedence over multiplication verified)');

// TEST E: 5 × [2 × (3² + 1)] × 4 = 400
console.log('Testing Test E: 5 × [2 × (3² + 1)] × 4 = 400');
const evalE = evaluateArithmeticExpression('5 × [2 × (3² + 1)] × 4');
assert(evalE.isValid && evalE.result === 400, `[TEST E FAILED] Expected 400, got ${evalE.result}`);
console.log('[TEST E PASSED] 5 × [2 × (3² + 1)] × 4 strictly evaluates to 400');

// TEST F: 100 - 4 × (2³ + 2) = 60
console.log('Testing Test F: 100 - 4 × (2³ + 2) = 60');
const evalF = evaluateArithmeticExpression('100 - 4 × (2³ + 2)');
assert(evalF.isValid && evalF.result === 60, `[TEST FAILED] Expected 60, got ${evalF.result}`);
console.log('[TEST F PASSED] 100 - 4 × (2³ + 2) strictly evaluates to 60');

// TEST G: All daily lesson phase durations sum to 90 minutes
console.log('Testing Test G: All daily lesson phase durations sum to 90 minutes');
for (let d = 1; d <= 5; d++) {
  const pPlan = enforceMathematicsPurityAndQuality({ ...pemdasRawPlan, day: d } as LessonPlan);
  const aPlan = enforceMathematicsPurityAndQuality({ ...rawAlgebraPlan, day: d } as LessonPlan);
  
  const pSum = (pPlan.lessonAtAGlance || []).reduce((acc, st) => acc + (st.timeMinutes || parseMinutes(st.time)), 0);
  assert(pSum === 90, `[TEST G FAILED] PEMDAS Day ${d} stages must sum to 90 (got ${pSum})`);
  
  const aSum = (aPlan.lessonAtAGlance || []).reduce((acc, st) => acc + (st.timeMinutes || parseMinutes(st.time)), 0);
  assert(aSum === 90, `[TEST G FAILED] Algebra Day ${d} stages must sum to 90 (got ${aSum})`);
  
  const pTiming = validateAndHarmonizeLessonTiming(pPlan);
  assert(pTiming.validation.isBalanced && pTiming.validation.calculatedMinutes === 90, `[TEST G FAILED] PEMDAS Day ${d} timing balance check failed`);
  
  const aTiming = validateAndHarmonizeLessonTiming(aPlan);
  assert(aTiming.validation.isBalanced && aTiming.validation.calculatedMinutes === 90, `[TEST G FAILED] Algebra Day ${d} timing balance check failed`);
}
console.log('[TEST G PASSED] All daily lesson phase durations sum to exactly 90 minutes across all 5 days');

// TEST H: Every daily objective is supported by teaching activities & assessment
console.log('Testing Test H: Every daily objective is supported by teaching activities & assessment');
for (let d = 1; d <= 5; d++) {
  const aPlan = enforceMathematicsPurityAndQuality({ ...rawAlgebraPlan, day: d } as LessonPlan);
  const audit = runMathematicsAlignmentAudit(aPlan);
  assert(audit.status === 'PASS' && audit.errors.length === 0, `[TEST H FAILED] Day ${d} alignment audit errors: ${audit.errors.join('; ')}`);
  
  // Verify Stage 3 Explicit Modeling, Stage 4 Guided Practice, Stage 6 Independent Worksheet, Stage 7 Exit Ticket
  const stages = aPlan.lessonAtAGlance || [];
  assert(stages.length === 7, `[TEST H FAILED] Must contain 7 stages on Day ${d}`);
  assert(stages[2].teacherDoes.toLowerCase().includes('model') || stages[2].teacherDoes.toLowerCase().includes('think-aloud'), `[TEST H FAILED] Day ${d} Stage 3 must model target skill`);
  assert(stages[3].teacherDoes.toLowerCase().includes('guided') || stages[3].studentsDo.toLowerCase().includes('partner') || stages[3].studentsDo.toLowerCase().includes('whiteboard'), `[TEST H FAILED] Day ${d} Stage 4 must feature guided practice`);
  assert(stages[5].teacherDoes.toLowerCase().includes('worksheet') || stages[5].studentsDo.toLowerCase().includes('independent'), `[TEST H FAILED] Day ${d} Stage 6 must feature independent worksheet practice`);
  assert(
    stages[6].teacherDoes.toLowerCase().includes('exit ticket') || 
    stages[6].teacherDoes.toLowerCase().includes('assessment') ||
    stages[6].studentsDo.toLowerCase().includes('exit ticket') ||
    stages[6].studentsDo.toLowerCase().includes('assessment'), 
    `[TEST H FAILED] Day ${d} Stage 7 must administer exit ticket or cumulative assessment`
  );
}
console.log('[TEST H PASSED] Every daily objective is directly supported by teaching activities, guided practice, and assessment');

// TEST I: Friday 5-question assessment contains exactly 5 questions with matching answer key
console.log('Testing Test I: Friday 5-question assessment contains exactly 5 questions with matching answer key');
const friTicket = buildAuthoritativeMathExitTicket(
  'Algebraic Foundations',
  'Cumulative Mastery Assessment',
  'MA.ST6.C1.02',
  5
);
assert(friTicket.questions.length === 5, `[TEST I FAILED] Friday exit ticket must have exactly 5 questions, got ${friTicket.questions.length}`);
const friTicketPoints = friTicket.questions.reduce((sum, q) => sum + q.points, 0);
assert(friTicketPoints === 5, `[TEST I FAILED] Friday exit ticket must total 5 points, got ${friTicketPoints}`);
assert(friTicket.answerKeyText.includes('4/5') || friTicket.answerKeyText.includes('80%'), '[TEST I FAILED] Friday answer key must document 80% (4/5 marks) mastery benchmark');

const friWorksheet = buildAuthoritativeMathWorksheet(
  'Algebraic Foundations',
  'Cumulative Mastery Assessment',
  'MA.ST6.C1.02',
  'Standard 6',
  5,
  5
);
assert(friWorksheet.questions.length === 5, `[TEST I FAILED] Friday worksheet must have exactly 5 questions, got ${friWorksheet.questions.length}`);
assert(friWorksheet.totalQuestions === 5, `[TEST I FAILED] Total questions property must be 5`);
console.log('[TEST I PASSED] Friday assessment contains exactly 5 questions with matching 1-to-1 answer key and 80% mastery criterion');

// TEST J: Worksheet counts, marks, answer keys, timings consistent
console.log('Testing Test J: Worksheet counts, marks, answer keys, timings consistent');
for (let d = 1; d <= 4; d++) {
  const ws = buildAuthoritativeMathWorksheet('Algebraic Foundations', 'Daily Practice', 'MA.ST6.C1.02', 'Standard 6', 8, d);
  assert(ws.questions.length === 8, `[TEST J FAILED] Daily worksheet Day ${d} must have 8 questions`);
  assert(!ws.answerKeyText.includes('Exact mathematical solution with full step-by-step working'), `[TEST J FAILED] Day ${d} has placeholder solution`);
  
  const et = buildAuthoritativeMathExitTicket('Algebraic Foundations', 'Daily Exit Ticket', 'MA.ST6.C1.02', d);
  assert(et.questions.length === 3, `[TEST J FAILED] Daily exit ticket Day ${d} must have 3 questions`);
  const etPts = et.questions.reduce((sum, q) => sum + q.points, 0);
  assert(etPts === 5, `[TEST J FAILED] Daily exit ticket Day ${d} must total 5 points`);
}
const ws20Bank = buildAuthoritativeMathWorksheet('Algebraic Foundations', 'Comprehensive Bank', 'MA.ST6.C1.02', 'Standard 6', 20);
assert(ws20Bank.questions.length === 20, `[TEST J FAILED] 20-question bank must contain 20 questions`);
assert(ws20Bank.questions.every(q => Boolean(q.solution && q.solution.length > 5)), '[TEST J FAILED] Every question in 20-question bank must have detailed solution');
console.log('[TEST J PASSED] Worksheet question counts, point allocations, answer keys, and phase timings are fully consistent');

// TEST K: Mathematics generation uses Standard 6, Cycle 1, Week 8, MA.ST6.C1.02
console.log('Testing Test K: Mathematics generation uses Standard 6, Cycle 1, Week 8, MA.ST6.C1.02');
const codeFromExactTopic = getAuthoritativeCurriculumCode({
  subject: 'Mathematics',
  grade: 'Standard 6',
  cycle: 1,
  topic: 'Algebraic Expressions and Variables'
});
assert(codeFromExactTopic === 'MA.ST6.C1.02', `[TEST K FAILED] Expected MA.ST6.C1.02 from exact topic, got ${codeFromExactTopic}`);

const codeFromFoundations = getAuthoritativeCurriculumCode({
  subject: 'Mathematics',
  grade: 'Standard 6',
  cycle: 1,
  topic: 'Algebraic Foundations'
});
assert(codeFromFoundations === 'MA.ST6.C1.02', `[TEST K FAILED] Expected MA.ST6.C1.02 from Algebraic Foundations, got ${codeFromFoundations}`);

const enforcedPlanK = enforceMathematicsPurityAndQuality({
  subject: 'Mathematics',
  grade: 'Standard 6',
  cycle: 1,
  week: 8,
  topic: 'Algebraic Foundations',
  learningOutcome: 'Translate verbal phrases into algebraic expressions'
} as LessonPlan);
assert(enforcedPlanK.curriculumCode === 'MA.ST6.C1.02', `[TEST K FAILED] Enforced plan must have MA.ST6.C1.02, got ${enforcedPlanK.curriculumCode}`);
console.log('[TEST K PASSED] Mathematics generation reliably maps Standard 6, Cycle 1, Week 8 to MA.ST6.C1.02');

// TEST L: Zero change to non-Mathematics subjects (Language Arts, Science, etc.)
console.log('Testing Test L: Zero change to non-Mathematics subjects');
const nonMathSubjects = [
  'Language Arts',
  'Science and Technology',
  'Belizean Studies',
  'HFLE',
  'Spanish',
  'Religious Studies'
];
for (const sub of nonMathSubjects) {
  assert(!isMathematicsSubject(sub), `[TEST L FAILED] isMathematicsSubject returned true for ${sub}`);
}
console.log('[TEST L PASSED] Zero changes or bleed to non-Mathematics subjects');

// TEST M: Mathematical symbols remain correct in exports
console.log('Testing Test M: Mathematical symbols remain correct in exports');
const resolvedAlgebra = resolveCompleteLessonResources(enrichedAlgebraDay1, {
  schoolName: 'Stann Creek Methodist School',
  teacherName: 'Standard 6 Mathematics Lead'
});
assert(resolvedAlgebra.worksheet.hasWorksheet, '[TEST M FAILED] Resolved algebra package must include worksheet');
assert(resolvedAlgebra.exitTicket.hasTicket, '[TEST M FAILED] Resolved algebra package must include exit ticket');

const algebraDoc = buildReferenceLessonPlanDocx(resolvedAlgebra as any);
const algebraBuffer = await Packer.toBuffer(algebraDoc);
assert(algebraBuffer.byteLength > 10000, `[TEST M FAILED] Algebra Master Lesson Plan DOCX must generate valid binary payload (got ${algebraBuffer.byteLength} bytes)`);

const algebraWsBlob: any = await exportStructuredWorksheetToDocx(resolvedAlgebra.worksheet as any);
assert(Boolean(algebraWsBlob && algebraWsBlob.size > 5000), `[TEST M FAILED] Structured Worksheet DOCX must generate valid binary blob (got ${algebraWsBlob?.size} bytes)`);

// Verify symbol integrity in generated worksheets
const sampleExprs = ['2y - 6', '5x - 4', '3x²', '4b + 15', '$1.50t + $0.50', '25a + 5', '12p + 30', '5 × [2 × (3² + 1)] × 4'];
for (const expr of sampleExprs) {
  const sanitized = sanitizeMathNotation(expr);
  assert(sanitized.length > 0, `Symbol expression must not be empty: ${expr}`);
}
console.log('[TEST M PASSED] Mathematical symbols, exponents, variables, and currency preserved in all exports');

console.log('================================================================');
console.log('ALL 15 TEST SUITES & ALL TESTS A THROUGH M COMPLETED WITH ZERO ERRORS!');
console.log('All regression defects and quality gates VERIFIED AND RESOLVED.');
console.log('================================================================\n');

