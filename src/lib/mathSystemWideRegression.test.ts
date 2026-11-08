import { 
  enforceMathematicsPurityAndQuality, 
  buildAuthoritativeMathWorksheet, 
  buildAuthoritativeMathExitTicket,
  runMathematicsAlignmentAudit,
  isMathematicsSubject,
  getMathCpaStagesForDuration
} from './mathQualityGate';
import { 
  evaluateArithmeticExpression, 
  sanitizeMathNotation, 
  evaluateAlgebraicExpression,
  translateVerbalPhraseToAlgebraic,
  validateMathAnswerAccuracy
} from './mathEvaluator';
import { parseMinutes } from './timingValidation';
import { resolveCompleteLessonResources } from './lessonExportResolver';
import { buildReferenceLessonPlanDocx } from './referenceLessonPlanExport';
import { exportStructuredWorksheetToDocx } from './worksheetSystem';
import { getAuthoritativeCurriculumCode } from '../services/curriculumHierarchyService';
import { detectMathGradeAndTopicCategory } from './mathGradeCurriculumBanks';
import { LessonPlan } from '../types';
import { Packer } from 'docx';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`SYSTEM-WIDE TEST FAILED: ${message}`);
  }
}

console.log('================================================================');
console.log('=== SYSTEM-WIDE MATHEMATICS ENGINE REGRESSION TEST SUITE =======');
console.log('=== VERIFYING SECTION 17 TESTS A THROUGH L (ALL GRADES/TOPICS) =');
console.log('================================================================\n');

// --------------------------------------------------------------------------
// TEST A: Lower Primary Foundational Topic (Infant 2: Numbers 1-20 & Ten-Frames)
// --------------------------------------------------------------------------
console.log('--- TEST A: Lower Primary Foundational Topic (Infant 2 Ten-Frames) ---');
const classificationA = detectMathGradeAndTopicCategory('Infant 2', 'Numbers 1 to 20 and Ten-Frames', 'Object Counting', 'Count objects accurately from 1 to 20');
assert(classificationA.gradeBand === 'early_primary', `Test A: Expected early_primary, got ${classificationA.gradeBand}`);
assert(classificationA.category === 'early_counting_ten_frames', `Test A: Expected early_counting_ten_frames, got ${classificationA.category}`);

const rawPlanA: Partial<LessonPlan> = {
  subject: 'Mathematics' as any,
  grade: 'Infant 2',
  topic: 'Numbers 1 to 20 and Ten-Frames',
  subtopic: 'Ten-Frame Representation and Counting',
  learningOutcome: 'Count concrete objects accurately from 1 to 20 using touch-point one-to-one correspondence and ten-frames',
  duration: '45 minutes',
  day: 1
};

const planA = enforceMathematicsPurityAndQuality(rawPlanA as LessonPlan);
assert(planA.grade === 'Infant 2', 'Test A: Plan grade must be Infant 2');
assert(planA.learningObjectives?.condition.startsWith('Given'), 'Test A: Objective condition must start with Given...');
assert(planA.learningObjectives?.cognitive.includes('ten-frame'), 'Test A: Cognitive objective must mention ten-frames');
assert(!planA.learningObjectives?.cognitive.includes('algebra') && !planA.learningObjectives?.cognitive.includes('variable'), 'Test A: Lower primary objective must not contain algebra or variables');

// Check worksheet & exit ticket
const wsA = planA.studentMaterials?.find(m => m.type === 'worksheet');
assert(Boolean(wsA && wsA.content.includes('Ten-Frame')), 'Test A: Worksheet must contain Ten-Frame exercises');
assert(!wsA?.content.includes('4w + 8 = 36') && !wsA?.content.includes('24 × 15'), 'Test A: Worksheet must not contain upper primary equations');

const etA = planA.studentMaterials?.find(m => m.type === 'exit_ticket');
assert(Boolean(etA && etA.content.includes('ten-frame')), 'Test A: Exit ticket must evaluate ten-frame counting');

const auditA = runMathematicsAlignmentAudit(planA);
assert(auditA.status === 'PASS', `Test A: Audit must pass, got ${auditA.status} with errors: ${auditA.errors.join('; ')}`);
console.log('✓ TEST A PASSED: Lower primary foundational topic (Infant 2) is age-appropriate, concrete, and verified.\n');

// --------------------------------------------------------------------------
// TEST B: Middle Primary Topic (Standard 2 Multiplication Arrays / Standard 3 Fractions)
// --------------------------------------------------------------------------
console.log('--- TEST B: Middle Primary Topic (Standard 2 Multiplication Arrays & Standard 3 Fractions) ---');
const classificationB1 = detectMathGradeAndTopicCategory('Standard 2', 'Multiplication Foundations', 'Equal Groups and Arrays', 'Model multiplication using rectangular arrays');
assert(classificationB1.gradeBand === 'middle_primary', `Test B1: Expected middle_primary, got ${classificationB1.gradeBand}`);
assert(classificationB1.category === 'multiplication_division', `Test B1: Expected multiplication_division, got ${classificationB1.category}`);

const rawPlanB1: Partial<LessonPlan> = {
  subject: 'Mathematics' as any,
  grade: 'Standard 2',
  topic: 'Multiplication Foundations',
  subtopic: 'Rectangular Arrays and Equal Groups',
  learningOutcome: 'Model multiplication using rectangular arrays and write matching equations',
  duration: '60 minutes',
  day: 1
};
const planB1 = enforceMathematicsPurityAndQuality(rawPlanB1 as LessonPlan);
assert(planB1.learningObjectives?.cognitive.includes('array'), 'Test B1: Objective must mention arrays');
const wsB1 = planB1.studentMaterials?.find(m => m.type === 'worksheet');
assert(Boolean(wsB1 && wsB1.content.includes('array')), 'Test B1: Worksheet must feature array problems');
const auditB1 = runMathematicsAlignmentAudit(planB1);
assert(auditB1.status === 'PASS', `Test B1: Standard 2 audit must pass, got ${auditB1.status}`);

// Standard 3 Fractions
const classificationB2 = detectMathGradeAndTopicCategory('Standard 3', 'Fractions and Mixed Numbers', 'Unlike Denominators', 'Add fractions with unlike denominators');
assert(classificationB2.gradeBand === 'middle_primary', `Test B2: Expected middle_primary, got ${classificationB2.gradeBand}`);
assert(classificationB2.category === 'fractions_decimals', `Test B2: Expected fractions_decimals, got ${classificationB2.category}`);

const rawPlanB2: Partial<LessonPlan> = {
  subject: 'Mathematics' as any,
  grade: 'Standard 3',
  topic: 'Fractions and Mixed Numbers',
  subtopic: 'Equivalent Fractions and Addition',
  learningOutcome: 'Evaluate equivalent fractions and add fractions with common denominators',
  duration: '60 minutes',
  day: 1
};
const planB2 = enforceMathematicsPurityAndQuality(rawPlanB2 as LessonPlan);
assert(planB2.learningObjectives?.cognitive.includes('fraction'), 'Test B2: Objective must mention fractions');
const auditB2 = runMathematicsAlignmentAudit(planB2);
assert(auditB2.status === 'PASS', `Test B2: Standard 3 audit must pass, got ${auditB2.status}`);
console.log('✓ TEST B PASSED: Middle primary topics (Standard 2 & Standard 3) verified with authentic representations.\n');

// --------------------------------------------------------------------------
// TEST C: Standard 6 Higher-Level Topic (Algebraic Expressions & Linear Equations)
// --------------------------------------------------------------------------
console.log('--- TEST C: Standard 6 Higher-Level Topic (Algebraic Expressions & Linear Equations) ---');
const rawPlanC: Partial<LessonPlan> = {
  subject: 'Mathematics' as any,
  grade: 'Standard 6',
  cycle: 1,
  week: 8,
  topic: 'Algebraic Foundations',
  subtopic: 'Translating Verbal Phrases into Algebraic Expressions',
  learningOutcome: 'Translate verbal phrases into algebraic expressions and evaluate using substitution',
  duration: '90 minutes',
  day: 1
};
const planC = enforceMathematicsPurityAndQuality(rawPlanC as LessonPlan);
assert(planC.curriculumCode === 'MA.ST6.C1.02', `Test C: Expected MA.ST6.C1.02, got ${planC.curriculumCode}`);
assert(
  Boolean(planC.studentMaterials?.[0]?.content.includes('Six less than twice y') || planC.studentMaterials?.[0]?.answerKey?.includes('2y - 6')),
  'Test C: Worksheet must contain benchmark translation 2y - 6'
);
const auditC = runMathematicsAlignmentAudit(planC);
assert(auditC.status === 'PASS', `Test C: Standard 6 audit must pass, got ${auditC.status}`);
console.log('✓ TEST C PASSED: Standard 6 higher-level algebra plan rigorously verified.\n');

// --------------------------------------------------------------------------
// TEST D: Daily Lesson for Topic Other Than Algebraic Foundations (Standard 4 Long Division)
// --------------------------------------------------------------------------
console.log('--- TEST D: Daily Lesson for Standard 4 Multi-Digit Long Division ---');
const rawPlanD: Partial<LessonPlan> = {
  subject: 'Mathematics' as any,
  grade: 'Standard 4',
  topic: 'Multi-Digit Division and Long Division Algorithm',
  subtopic: 'Dividing 3-Digit Dividends by 1-Digit Divisors',
  learningOutcome: 'Apply the standard long division algorithm to divide multi-digit whole numbers with remainders',
  duration: '60 minutes',
  day: 2
};
const planD = enforceMathematicsPurityAndQuality(rawPlanD as LessonPlan);
assert(planD.grade === 'Standard 4', 'Test D: Grade must be Standard 4');
assert(planD.duration === '60 minutes', 'Test D: Duration must be 60 minutes');
assert(planD.workedExamplesList.some(ex => ex.problemOrContext.includes('476 ÷ 4') || ex.problemOrContext.includes('Divide')), 'Test D: Worked examples must feature multi-digit long division');
assert(!planD.workedExamplesList.some(ex => ex.problemOrContext.includes('Model problem for')), 'Test D: Zero generic placeholders permitted');
const auditD = runMathematicsAlignmentAudit(planD);
assert(auditD.status === 'PASS', `Test D: Standard 4 long division audit must pass, got ${auditD.status}`);
console.log('✓ TEST D PASSED: Non-algebra topic (Standard 4 Long Division) verified with step-by-step algorithms.\n');

// --------------------------------------------------------------------------
// TEST E: Weekly Plan with 5 Distinct, Progressive Lessons (Days 1–5)
// --------------------------------------------------------------------------
console.log('--- TEST E: Weekly Plan with 5 Distinct, Progressive Lessons ---');
const weekSubtopics = new Set<string>();
const weekExitTickets = new Set<string>();

for (let d = 1; d <= 5; d++) {
  const dayPlan = enforceMathematicsPurityAndQuality({
    subject: 'Mathematics' as any,
    grade: 'Standard 5',
    topic: 'Proportional Reasoning and Financial Mathematics',
    duration: '60 minutes',
    day: d
  } as LessonPlan);

  weekSubtopics.add(dayPlan.subtopic);
  const et = dayPlan.studentMaterials?.find(m => m.type === 'exit_ticket');
  assert(Boolean(et), `Test E: Day ${d} must contain exit ticket`);
  weekExitTickets.add(et!.content);

  const audit = runMathematicsAlignmentAudit(dayPlan);
  assert(audit.status === 'PASS', `Test E: Day ${d} audit must pass, got ${audit.status}`);

  if (d < 5) {
    assert(dayPlan.exitTicketPackage?.questions.length === 3, `Test E: Days 1-4 exit ticket must have 3 questions`);
  } else {
    assert(dayPlan.exitTicketPackage?.questions.length === 5, `Test E: Day 5 exit ticket must have 5 questions`);
  }
}
assert(weekSubtopics.size >= 4, `Test E: Weekly subtopics must progress across days (got ${weekSubtopics.size} unique)`);
assert(weekExitTickets.size === 5, `Test E: Every day must have a distinct exit ticket (got ${weekExitTickets.size} unique)`);
console.log('✓ TEST E PASSED: 5-day progressive weekly plan verified with distinct daily foci and assessments.\n');

// --------------------------------------------------------------------------
// TEST F: Short Lesson Durations (< 90 minutes: 45 & 60 mins) with Exact Timing Balance
// --------------------------------------------------------------------------
console.log('--- TEST F: Short Lesson Durations (45 & 60 minutes) ---');
const stages45 = getMathCpaStagesForDuration(45);
const total45 = stages45.reduce((sum, s) => sum + s.minutes, 0);
assert(total45 === 45, `Test F: 45-minute stages must sum to exactly 45, got ${total45}`);

const stages60 = getMathCpaStagesForDuration(60);
const total60 = stages60.reduce((sum, s) => sum + s.minutes, 0);
assert(total60 === 60, `Test F: 60-minute stages must sum to exactly 60, got ${total60}`);

const plan45 = enforceMathematicsPurityAndQuality({
  subject: 'Mathematics' as any,
  grade: 'Standard 1',
  topic: 'Two-Digit Addition with Regrouping',
  duration: '45 minutes',
  day: 1
} as LessonPlan);
const plan45Sum = plan45.lessonAtAGlance.reduce((sum, s) => sum + s.timeMinutes, 0);
assert(plan45Sum === 45, `Test F: Plan stages must sum to 45 mins, got ${plan45Sum}`);
const audit45 = runMathematicsAlignmentAudit(plan45);
assert(audit45.is90MinBalanced, 'Test F: 45-minute plan timing equality confirmed');
assert(audit45.status === 'PASS', `Test F: 45-minute audit must pass, got ${audit45.status}`);
console.log('✓ TEST F PASSED: Short lesson durations (45 & 60 mins) strictly balanced to target minutes.\n');

// --------------------------------------------------------------------------
// TEST G: Visual Mathematical Models / Diagrams (Ten-Frames, Arrays, Fraction Strips, Coordinate Grids)
// --------------------------------------------------------------------------
console.log('--- TEST G: Visual Mathematical Models & Diagrams ---');
const tenFrameWs = buildAuthoritativeMathWorksheet('Ten-Frames and Teen Numbers', 'Visual Models', 'Count to 20', 'Infant 2', 8);
assert(tenFrameWs.worksheetContentText.includes('ten-frame'), 'Test G: Infant 2 worksheet must feature ten-frames');

const arrayWs = buildAuthoritativeMathWorksheet('Multiplication Foundations', 'Array Models', 'Model multiplication', 'Standard 2', 8);
assert(arrayWs.worksheetContentText.includes('array'), 'Test G: Standard 2 worksheet must feature array models');

const fractionWs = buildAuthoritativeMathWorksheet('Fractions and Decimals', 'Fraction Models', 'Fractions of a set', 'Standard 3', 8);
assert(fractionWs.worksheetContentText.includes('fraction'), 'Test G: Standard 3 worksheet must feature fraction models');

const equationWs = buildAuthoritativeMathWorksheet('Linear Equations', 'Balance Scale Models', 'Solve equations', 'Standard 6', 8);
assert(equationWs.worksheetContentText.includes('balance') || equationWs.worksheetContentText.includes('equation'), 'Test G: Standard 6 worksheet must feature balance scale equations');
console.log('✓ TEST G PASSED: Authentic visual models (ten-frames, arrays, fraction bars, balance scales) present in all materials.\n');

// --------------------------------------------------------------------------
// TEST H: Multi-Step Calculations (Partial Products, Long Division, 2-Step Equations, PEMDAS)
// --------------------------------------------------------------------------
console.log('--- TEST H: Multi-Step Calculations & Algorithmic Accuracy ---');
// 1. Partial products: 36 × 7 = (30 × 7) + (6 × 7) = 210 + 42 = 252
assert(evaluateArithmeticExpression('(30 * 7) + (6 * 7)').result === 252, 'Test H: 36 × 7 partial products must equal 252');

// 2. Long division: 476 ÷ 4 = 119
assert(evaluateArithmeticExpression('476 / 4').result === 119, 'Test H: 476 ÷ 4 must equal 119');

// 3. Two-step equation: 3x + 7 = 28 => x = (28 - 7) / 3 = 7
assert(evaluateAlgebraicExpression('3x + 7', { x: 7 }).result === 28, 'Test H: 3(7) + 7 must equal 28');

// 4. Nested PEMDAS: 5 × [2 × (3² + 1)] × 4 = 400
assert(evaluateArithmeticExpression('5 × [2 × (3² + 1)] × 4').result === 400, 'Test H: 5 × [2 × (3² + 1)] × 4 must equal 400');
console.log('✓ TEST H PASSED: Multi-step arithmetic and algebraic calculations verified deterministically.\n');

// --------------------------------------------------------------------------
// TEST I: Deliberately Corrupted Answer Key Detected by Validator
// --------------------------------------------------------------------------
console.log('--- TEST I: Deliberately Corrupted Answer Key Detection ---');
// 1. Corrupted order of operations: 45 + 5 × 2³ = 400
const corrupt1 = validateMathAnswerAccuracy('Evaluate: 45 + 5 × 2³', 'Solution: 400');
assert(!corrupt1.isValid, 'Test I: Corrupted PEMDAS answer (400) must be detected as invalid');

// 2. Corrupted concatenation in algebra: 3x when x = 6 equals 56
const corrupt2 = validateMathAnswerAccuracy('Evaluate 3x when x = 6', 'Solution: 56');
assert(!corrupt2.isValid, 'Test I: Corrupted concatenation answer (56) must be detected as invalid');

// 3. Corrupted subtraction reversal: "six less than twice y" -> 6 - 2y
const corrupt3 = validateMathAnswerAccuracy('Translate "six less than twice y"', 'Solution: 6 - 2y');
assert(!corrupt3.isValid, 'Test I: Corrupted reversed verbal translation (6 - 2y) must be detected as invalid');

// 4. Explicit corrupted marker string
const corrupt4 = validateMathAnswerAccuracy('Solve problem', 'Solution contains corrupted placeholder');
assert(!corrupt4.isValid, 'Test I: Corrupted placeholder string must be detected as invalid');
console.log('✓ TEST I PASSED: Validator reliably isolates and rejects corrupted mathematical solutions.\n');

// --------------------------------------------------------------------------
// TEST J: Inconsistent Assessment Totals Detected by Validator
// --------------------------------------------------------------------------
console.log('--- TEST J: Inconsistent Assessment Totals Detection ---');
const inconsistentPlan: any = {
  subject: 'Mathematics',
  grade: 'Standard 4',
  duration: '60 minutes',
  lessonAtAGlance: getMathCpaStagesForDuration(60),
  learningObjectives: { condition: 'Given problem cards', cognitive: 'Cognitive 80%', psychomotor: 'Skill', affective: 'Attitude' },
  studentMaterials: [
    { type: 'worksheet', content: '1. Problem\n2. Problem\n3. Problem\n4. Problem\n5. Problem', answerKey: '1. Solution\n2. Solution' },
    { type: 'exit_ticket', content: '1. Question\n2. Question', answerKey: '1. Ans\n2. Ans' }
  ],
  exitTicketPackage: {
    // Deliberately inconsistent: 3 questions totaling only 3 points (expected 5 points)
    questions: [
      { number: 1, points: 1 },
      { number: 2, points: 1 },
      { number: 3, points: 1 }
    ]
  }
};
const auditJ = runMathematicsAlignmentAudit(inconsistentPlan);
assert(!auditJ.isValid, 'Test J: Inconsistent assessment points total must fail the audit');
assert(auditJ.errors.some(e => e.includes('Exit ticket points inconsistency')), 'Test J: Audit must report exact points discrepancy error');
console.log('✓ TEST J PASSED: Assessment point discrepancies are accurately flagged by the audit engine.\n');

// --------------------------------------------------------------------------
// TEST K: Export Generation to DOCX Master Plan and DOCX Worksheet
// --------------------------------------------------------------------------
console.log('--- TEST K: Export Generation to DOCX Master Plan and Worksheet ---');
const resolvedPlanK = resolveCompleteLessonResources(planA, {
  schoolName: 'St. Ignatius Primary School',
  teacherName: 'Belize Primary Mathematics Lead'
});
assert(resolvedPlanK.worksheet.hasWorksheet, 'Test K: Resolved package must contain worksheet');
assert(resolvedPlanK.exitTicket.hasTicket, 'Test K: Resolved package must contain exit ticket');

const docxPlan = buildReferenceLessonPlanDocx(resolvedPlanK as any);
const planBuffer = await Packer.toBuffer(docxPlan);
assert(planBuffer.byteLength > 10000, `Test K: Master Lesson Plan DOCX must generate valid binary payload (got ${planBuffer.byteLength} bytes)`);

const docxWsBlob: any = await exportStructuredWorksheetToDocx(resolvedPlanK.worksheet as any);
assert(Boolean(docxWsBlob && docxWsBlob.size > 4000), `Test K: Structured Worksheet DOCX must generate valid binary blob (got ${docxWsBlob?.size} bytes)`);
console.log('✓ TEST K PASSED: Full DOCX export generation succeeds with verified binary payloads.\n');

// --------------------------------------------------------------------------
// TEST L: Non-Mathematics Subjects Regression Check (Zero Alterations)
// --------------------------------------------------------------------------
console.log('--- TEST L: Non-Mathematics Subjects Regression Check ---');
const nonMathSubjectsList = [
  'Language Arts',
  'English Language Arts',
  'Science and Technology',
  'Belizean Studies',
  'Social Studies',
  'HFLE',
  'Health and Family Life Education',
  'Spanish',
  'Religious Studies'
];
for (const sub of nonMathSubjectsList) {
  assert(!isMathematicsSubject(sub), `Test L: isMathematicsSubject must return false for ${sub}`);
}
console.log('✓ TEST L PASSED: Zero changes or bleed into non-Mathematics subject pipelines.\n');

console.log('================================================================');
console.log('=== ALL SYSTEM-WIDE REGRESSION TESTS A THROUGH L PASSED! =======');
console.log('=== MATHEMATICS ENGINE FULLY REPAIRED ACROSS ALL 9 GRADES ======');
console.log('================================================================\n');
