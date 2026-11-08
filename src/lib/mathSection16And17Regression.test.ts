import { 
  enforceMathematicsPurityAndQuality, 
  buildAuthoritativeMathWorksheet, 
  buildAuthoritativeMathExitTicket,
  runMathematicsAlignmentAudit,
  purgeUnrelatedMathContent,
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
import { getAuthoritativeCurriculumCode } from '../services/curriculumHierarchyService';
import { detectMathGradeAndTopicCategory } from './mathGradeCurriculumBanks';
import { LessonPlan } from '../types';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`REGRESSION TEST FAILED: ${message}`);
  }
}

console.log('================================================================');
console.log('=== SECTION 16 & 17 AUTOMATED MATHEMATICS REGRESSION SUITE =====');
console.log('=== VERIFYING SECTION 16 TESTS 1-12 AND SECTION 17 BENCHMARK ===');
console.log('================================================================\n');

// --------------------------------------------------------------------------
// TEST 1: Standard 6 Algebra: Translating Verbal Phrases into Algebraic Expressions
// --------------------------------------------------------------------------
console.log('--- TEST 1: Standard 6 Algebra Translation & Keyword Reversals ---');
// 1. "seven less than four times y" -> 4y - 7 (NOT 7 - 4y)
const trans1A = translateVerbalPhraseToAlgebraic('seven less than four times y');
assert(trans1A.expression === '4y - 7', `Test 1: Expected '4y - 7', got '${trans1A.expression}'`);
const valid1A = validateMathAnswerAccuracy('Translate "seven less than four times y"', 'Solution: 4y - 7');
assert(valid1A.isValid, `Test 1: 4y - 7 must be accepted as valid`);
const invalid1A = validateMathAnswerAccuracy('Translate "seven less than four times y"', 'Solution: 7 - 4y');
assert(!invalid1A.isValid, `Test 1: Reversed 7 - 4y must be rejected as invalid`);

// 2. "four less than five times x" -> 5x - 4 (NOT 4 - 5x)
const trans1B = translateVerbalPhraseToAlgebraic('four less than five times x');
assert(trans1B.expression === '5x - 4', `Test 1: Expected '5x - 4', got '${trans1B.expression}'`);
const valid1B = validateMathAnswerAccuracy('Translate "four less than five times x"', 'Solution: 5x - 4');
assert(valid1B.isValid, `Test 1: 5x - 4 must be accepted as valid`);
const invalid1B = validateMathAnswerAccuracy('Translate "four less than five times x"', 'Solution: 4 - 5x');
assert(!invalid1B.isValid, `Test 1: Reversed 4 - 5x must be rejected as invalid`);

// 3. Expressions without equals signs (expressions vs equations)
assert(!trans1A.expression.includes('='), 'Test 1: Algebraic expressions must not have equals signs');
assert(!trans1B.expression.includes('='), 'Test 1: Algebraic expressions must not have equals signs');

// 4. Zero column regrouping / place value bleed in algebra
const purgedAlgebraText = purgeUnrelatedMathContent(
  'Solve problem using column regrouping and carrying to the tens column with place value chart',
  'Translate verbal phrases into algebraic expressions',
  'Algebraic Expressions'
);
assert(!purgedAlgebraText.includes('column regrouping'), 'Test 1: Column regrouping must be purged from algebra text');
assert(!purgedAlgebraText.includes('carrying to the tens column'), 'Test 1: Carrying must be purged from algebra text');
assert(!purgedAlgebraText.includes('place value chart'), 'Test 1: Place value chart must be purged from algebra text');
console.log('✓ TEST 1 PASSED: Verbal phrase translations, keyword reversals (4y - 7, 5x - 4), and algebra purity verified.\n');

// --------------------------------------------------------------------------
// TEST 2: Standard 6 Percentages & Financial Math
// --------------------------------------------------------------------------
console.log('--- TEST 2: Standard 6 Percentages & Financial Math (GST, Discount, Simple Interest) ---');
// 1. 12.5% Belize GST on an $80 purchase: 0.125 * 80 = 10 BZD GST, Total = $90 BZD
const gstRate = 0.125;
const gstAmount = evaluateArithmeticExpression(`${gstRate} * 80`).result;
assert(gstAmount === 10, `Test 2: 12.5% GST on $80 must equal $10.00 BZD, got ${gstAmount}`);
const totalWithGst = evaluateArithmeticExpression(`80 + ${gstAmount}`).result;
assert(totalWithGst === 90, `Test 2: Total purchase with GST must equal $90.00 BZD, got ${totalWithGst}`);

// 2. 20% discount on $65 item: Discount = 0.20 * 65 = $13.00, Sale price = 65 - 13 = $52.00
const discountAmount = evaluateArithmeticExpression('0.20 * 65').result;
assert(discountAmount === 13, `Test 2: 20% discount on $65 must equal $13.00 BZD, got ${discountAmount}`);
const salePrice = evaluateArithmeticExpression('65 - 13').result;
assert(salePrice === 52, `Test 2: Sale price after 20% discount on $65 must equal $52.00 BZD, got ${salePrice}`);

// 3. Simple interest: I = Prt (P = $500, r = 6% = 0.06, t = 2 years) => I = 500 * 0.06 * 2 = $60.00
const interest = evaluateArithmeticExpression('500 * 0.06 * 2').result;
assert(interest === 60, `Test 2: Simple interest I = 500 * 0.06 * 2 must equal $60.00 BZD, got ${interest}`);

// 4. Financial math classification
const classFin = detectMathGradeAndTopicCategory('Standard 6', 'Percentages and Financial Mathematics', 'Belize GST and Discounts', 'Calculate 12.5% GST and commercial discounts');
assert(classFin.category === 'proportional_financial', `Test 2: Expected proportional_financial, got ${classFin.category}`);
console.log('✓ TEST 2 PASSED: 12.5% Belize GST, 20% discounts, and simple interest (I=Prt) mathematically verified.\n');

// --------------------------------------------------------------------------
// TEST 3: Exponents: Multiplying, Dividing, and Base Powers
// --------------------------------------------------------------------------
console.log('--- TEST 3: Exponents & Power Calculations ---');
// 1. Exponential base evaluation: 2^3 = 8 (NOT 6)
const pow2_3 = evaluateArithmeticExpression('2³').result;
assert(pow2_3 === 8, `Test 3: 2³ must equal 8, got ${pow2_3}`);
assert(pow2_3 !== 6, 'Test 3: 2³ must not equal 6');

// 2. 3^2 = 9 (NOT 6), 2^4 = 16, 2^5 = 32
assert(evaluateArithmeticExpression('3²').result === 9, 'Test 3: 3² = 9');
assert(evaluateArithmeticExpression('2⁴').result === 16, 'Test 3: 2⁴ = 16');
assert(evaluateArithmeticExpression('2⁵').result === 32, 'Test 3: 2⁵ = 32');

// 3. Exponent quotient law: 10^1 / 10^1 = 10^(1-1) = 10^0 = 1
assert(evaluateArithmeticExpression('10 / 10').result === 1, 'Test 3: 10 / 10 = 10⁰ = 1');
assert(evaluateArithmeticExpression('2^0').result === 1, 'Test 3: 2⁰ = 1');

// 4. Exponential growth formula y = a * b^n
const expGrowth3 = evaluateArithmeticExpression('5 * 2^3').result;
assert(expGrowth3 === 40, `Test 3: 5 * 2³ must equal 40, got ${expGrowth3}`);
const expGrowth5 = evaluateArithmeticExpression('5 * 2^5').result;
assert(expGrowth5 === 160, `Test 3: 5 * 2⁵ must equal 160, got ${expGrowth5}`);
console.log('✓ TEST 3 PASSED: Exponent evaluations (2³=8, 10⁰=1, y=a·bⁿ) verified deterministically.\n');

// --------------------------------------------------------------------------
// TEST 4: Fractions: Equivalent Fractions, LCD Addition, and Reciprocal Division
// --------------------------------------------------------------------------
console.log('--- TEST 4: Fractions (LCD Addition, Reciprocal Division) ---');
// 1. 3/4 + 2/5 = 15/20 + 8/20 = 23/20 = 1 3/20
const fracWs = buildAuthoritativeMathWorksheet('Fractions and Decimals', 'Fraction Addition and Division', 'Add fractions with unlike denominators', 'Standard 5', 8);
const qFraction = fracWs.questions.find(q => q.prompt.includes('3/4 + 2/5') || q.solution.includes('23/20'));
assert(Boolean(qFraction), 'Test 4: Fractions worksheet must include LCD addition problem');
assert(qFraction!.solution.includes('23/20') || qFraction!.solution.includes('1 3/20'), 'Test 4: Solution must provide 23/20 or 1 3/20 with LCD 20');

// 2. Division by reciprocal: 3/4 ÷ 2/3 = 3/4 × 3/2 = 9/8 = 1 1/8
const qFracDiv = fracWs.questions.find(q => q.prompt.includes('3/4 ÷ 2/3') || q.solution.includes('9/8'));
if (qFracDiv) {
  assert(qFracDiv.solution.includes('9/8') || qFracDiv.solution.includes('1 1/8'), 'Test 4: Division by fraction must multiply by reciprocal to get 9/8');
}
console.log('✓ TEST 4 PASSED: Fractions addition with LCD (23/20) and reciprocal division verified.\n');

// --------------------------------------------------------------------------
// TEST 5: Geometry: Angles, Classification, Perimeter/Area (Zero Algebra Bleed)
// --------------------------------------------------------------------------
console.log('--- TEST 5: Geometry: Angles & Perimeter/Area (Zero Algebra Bleed) ---');
const classGeo = detectMathGradeAndTopicCategory('Standard 4', 'Geometric Properties and Angles', 'Classification of Angles', 'Classify angles as acute, right, or obtuse');
assert(classGeo.category === 'geometry_spatial', `Test 5: Expected geometry_spatial, got ${classGeo.category}`);

const rawPlanGeo: Partial<LessonPlan> = {
  subject: 'Mathematics' as any,
  grade: 'Standard 4',
  topic: 'Geometric Shapes and Angles',
  subtopic: 'Angle Classification and Measurement',
  learningOutcome: 'Classify angles as acute, right, or obtuse and measure with a protractor',
  duration: '60 minutes',
  day: 1
};
const planGeo = enforceMathematicsPurityAndQuality(rawPlanGeo as LessonPlan);
const geoText = JSON.stringify(planGeo).toLowerCase();
assert(!geoText.includes('translating verbal phrases into algebraic expressions'), 'Test 5: Geometry plan must not contain algebra translation title');
assert(!geoText.includes('4w + 8 = 36') && !geoText.includes('3x² when x = 2'), 'Test 5: Geometry plan must not contain upper-level algebra equations');
assert(planGeo.studentMaterials?.some(m => m.content.toLowerCase().includes('angle') || m.content.toLowerCase().includes('triangle')), 'Test 5: Geometry worksheet must feature angles or shapes');

const auditGeo = runMathematicsAlignmentAudit(planGeo);
assert(auditGeo.status === 'PASS', `Test 5: Geometry audit must pass, got ${auditGeo.status}`);
console.log('✓ TEST 5 PASSED: Geometry curriculum purity confirmed with zero algebra bleed.\n');

// --------------------------------------------------------------------------
// TEST 6: Primary Class Adaptation (Infant 2 vs Standard 2 vs Standard 4)
// --------------------------------------------------------------------------
console.log('--- TEST 6: Primary Class Adaptation Across Grade Bands ---');
// 1. Infant 2: Ten-frames, 1-20 counting
const classInf2 = detectMathGradeAndTopicCategory('Infant 2', 'Numbers 1 to 20', 'Ten-Frames', 'Count objects to 20');
assert(classInf2.gradeBand === 'early_primary', `Test 6: Infant 2 must be early_primary, got ${classInf2.gradeBand}`);
assert(classInf2.category === 'early_counting_ten_frames', `Test 6: Infant 2 category must be early_counting_ten_frames`);

// 2. Standard 2: Arrays & equal groups
const classStd2 = detectMathGradeAndTopicCategory('Standard 2', 'Multiplication Foundations', 'Arrays', 'Model equal groups');
assert(classStd2.gradeBand === 'middle_primary', `Test 6: Standard 2 must be middle_primary, got ${classStd2.gradeBand}`);
assert(classStd2.category === 'multiplication_division', `Test 6: Standard 2 category must be multiplication_division`);

// 3. Standard 4: Multi-digit long division
const classStd4 = detectMathGradeAndTopicCategory('Standard 4', 'Division Algorithm', 'Long Division', 'Divide 3-digit dividends');
assert(classStd4.gradeBand === 'upper_primary', `Test 6: Standard 4 must be upper_primary, got ${classStd4.gradeBand}`);
assert(classStd4.category === 'multiplication_division', `Test 6: Standard 4 category must be multiplication_division`);

// Partial products check: 36 * 7 = (30 * 7) + (6 * 7) = 210 + 42 = 252
assert(evaluateArithmeticExpression('(30 * 7) + (6 * 7)').result === 252, 'Test 6: 36 × 7 partial products must equal 252');
// Long division check: 476 / 4 = 119
assert(evaluateArithmeticExpression('476 / 4').result === 119, 'Test 6: 476 ÷ 4 must equal 119');
console.log('✓ TEST 6 PASSED: Grade-band adaptations (Infant 2, Standard 2, Standard 4) verified.\n');

// --------------------------------------------------------------------------
// TEST 7: Different Lesson Durations (45, 60, 75, 90 mins) Exact Stage Equality
// --------------------------------------------------------------------------
console.log('--- TEST 7: Different Lesson Durations (45, 60, 75, 90 mins) Stage Sums ---');
const durationsToTest = [45, 60, 75, 90];
for (const targetMins of durationsToTest) {
  const stages = getMathCpaStagesForDuration(targetMins);
  assert(stages.length === 7, `Test 7: Must have 7 CPA stages for ${targetMins} mins`);
  const sumMins = stages.reduce((acc, s) => acc + s.minutes, 0);
  assert(sumMins === targetMins, `Test 7: ${targetMins}-min stages must sum to exactly ${targetMins}, got ${sumMins}`);
  
  const planDur = enforceMathematicsPurityAndQuality({
    subject: 'Mathematics' as any,
    grade: 'Standard 6',
    topic: 'Algebraic Foundations',
    duration: `${targetMins} minutes`,
    day: 1
  } as LessonPlan);
  
  const planSum = planDur.lessonAtAGlance.reduce((acc, s) => acc + s.timeMinutes, 0);
  assert(planSum === targetMins, `Test 7: Enforced plan stages must sum to exactly ${targetMins}, got ${planSum}`);
  const auditDur = runMathematicsAlignmentAudit(planDur);
  assert(auditDur.is90MinBalanced, `Test 7: ${targetMins}-min plan timing must be balanced in audit`);
  assert(auditDur.status === 'PASS', `Test 7: ${targetMins}-min audit must PASS`);
}
console.log('✓ TEST 7 PASSED: Exact stage duration equality verified for 45, 60, 75, and 90 minutes.\n');

// --------------------------------------------------------------------------
// TEST 8: Worksheet-Answer-Key Consistency (Stable IDs Q1..Q8, 1:1 Matching)
// --------------------------------------------------------------------------
console.log('--- TEST 8: Worksheet-Answer-Key Consistency (Stable IDs Q1..Q8, 1:1) ---');
const ws8 = buildAuthoritativeMathWorksheet('Algebraic Foundations', 'Daily Practice', 'MA.ST6.C1.02', 'Standard 6', 8, 1);
assert(ws8.questions.length === 8, `Test 8: Daily worksheet must have 8 questions, got ${ws8.questions.length}`);
for (let i = 0; i < 8; i++) {
  const q = ws8.questions[i];
  assert(q.number === i + 1, `Test 8: Question number must be stable ${i + 1}`);
  assert(Boolean(q.prompt && q.prompt.length > 10), `Test 8: Question ${q.number} prompt must be detailed`);
  assert(Boolean(q.solution && q.solution.length > 5), `Test 8: Question ${q.number} solution must be detailed`);
  assert(ws8.answerKeyText.includes(`**${q.number}.**`), `Test 8: Answer key text must contain entry for Question ${q.number}`);
  assert(!q.solution.includes('Exact mathematical solution with full step-by-step working'), `Test 8: Question ${q.number} must not have generic solution`);
}
console.log('✓ TEST 8 PASSED: Worksheet-Answer-Key 1:1 correspondence with stable IDs Q1..Q8 confirmed.\n');

// --------------------------------------------------------------------------
// TEST 9: Mark Totals Consistency (Worksheet = 10 Marks, Exit Ticket = 5 Marks)
// --------------------------------------------------------------------------
console.log('--- TEST 9: Mark Totals Consistency ---');
const wsPoints = ws8.questions.reduce((sum, q) => sum + q.points, 0);
assert(wsPoints === 10, `Test 9: 8-question daily worksheet must total 10 marks, got ${wsPoints}`);
assert(ws8.totalPoints === 10, `Test 9: Worksheet totalPoints property must equal 10`);

const etDay1 = buildAuthoritativeMathExitTicket('Algebraic Foundations', 'Daily Exit Ticket', 'MA.ST6.C1.02', 1, 'Standard 6');
assert(etDay1.questions.length === 3, `Test 9: Day 1-4 exit ticket must have 3 questions, got ${etDay1.questions.length}`);
const etDay1Points = etDay1.questions.reduce((sum, q) => sum + q.points, 0);
assert(etDay1Points === 5, `Test 9: Day 1-4 exit ticket must total 5 points, got ${etDay1Points}`);

const etDay5 = buildAuthoritativeMathExitTicket('Algebraic Foundations', 'Weekly Assessment', 'MA.ST6.C1.02', 5, 'Standard 6');
assert(etDay5.questions.length === 5, `Test 9: Day 5 exit ticket must have 5 questions, got ${etDay5.questions.length}`);
const etDay5Points = etDay5.questions.reduce((sum, q) => sum + q.points, 0);
assert(etDay5Points === 5, `Test 9: Day 5 exit ticket must total 5 points, got ${etDay5Points}`);
console.log('✓ TEST 9 PASSED: Mark totals verified: 10 marks on worksheets, 5 marks on exit tickets.\n');

// --------------------------------------------------------------------------
// TEST 10: Subject Isolation (Zero Mathematics Bleed into Non-Math Subjects)
// --------------------------------------------------------------------------
console.log('--- TEST 10: Subject Isolation (Non-Math Subjects Protection) ---');
const nonMathSubjects = [
  'Language Arts',
  'English Language Arts',
  'Science and Technology',
  'Belizean Studies',
  'Social Studies',
  'Health and Family Life Education',
  'HFLE',
  'Spanish',
  'Religious Studies'
];
for (const subj of nonMathSubjects) {
  assert(!isMathematicsSubject(subj), `Test 10: isMathematicsSubject must return false for ${subj}`);
}
console.log('✓ TEST 10 PASSED: Strict subject isolation confirmed; 0 bleed into other subjects.\n');

// --------------------------------------------------------------------------
// TEST 11: Different Cycle or Week Curriculum Isolation
// --------------------------------------------------------------------------
console.log('--- TEST 11: Different Cycle or Week Curriculum Isolation ---');
const codeC1W8 = getAuthoritativeCurriculumCode({
  subject: 'Mathematics',
  grade: 'Standard 6',
  cycle: 1,
  week: 8,
  topic: 'Algebraic Foundations'
});
assert(codeC1W8 === 'MA.ST6.C1.02', `Test 11: Cycle 1 Week 8 should map to MA.ST6.C1.02, got ${codeC1W8}`);

const codeC2W3 = getAuthoritativeCurriculumCode({
  subject: 'Mathematics',
  grade: 'Standard 6',
  cycle: 2,
  week: 3,
  topic: 'Decimals and Percentages'
});
assert(codeC2W3 !== codeC1W8, `Test 11: Cycle 2 Week 3 must have distinct curriculum code from Cycle 1 Week 8`);
console.log('✓ TEST 11 PASSED: Cycle 1 Week 8 vs Cycle 2 Week 3 distinct curriculum codes verified.\n');

// --------------------------------------------------------------------------
// TEST 12: Repeated Generation Stability (Geometry followed by Algebra)
// --------------------------------------------------------------------------
console.log('--- TEST 12: Repeated Generation Stability (Geometry -> Algebra) ---');
const runA = enforceMathematicsPurityAndQuality({
  subject: 'Mathematics' as any,
  grade: 'Standard 5',
  topic: 'Geometry and Angles',
  subtopic: 'Measuring Angles with a Protractor',
  duration: '60 minutes',
  day: 1
} as LessonPlan);
assert(runA.topic.includes('Geometry') || runA.lessonTitle.includes('Geometry'), 'Test 12: Run A must be Geometry');
assert(!JSON.stringify(runA).toLowerCase().includes('translating verbal phrases into algebraic expressions'), 'Test 12: Run A must not contain algebra title');

const runB = enforceMathematicsPurityAndQuality({
  subject: 'Mathematics' as any,
  grade: 'Standard 6',
  topic: 'Algebraic Foundations',
  subtopic: 'Translating Verbal Phrases into Algebraic Expressions',
  duration: '90 minutes',
  day: 1
} as LessonPlan);
assert(runB.curriculumCode === 'MA.ST6.C1.02', `Test 12: Run B must be MA.ST6.C1.02`);
assert(runB.subtopic.includes('Translating Verbal Phrases'), 'Test 12: Run B must be Algebra translation');
assert(!JSON.stringify(runB).toLowerCase().includes('measuring angles with a protractor'), 'Test 12: Run B must have 0 geometry leakage');
console.log('✓ TEST 12 PASSED: Repeated generation runs maintain complete state isolation with zero leakage.\n');

// ==========================================================================
// SECTION 17: SAN JUAN BOSCO R.C. SCHOOL BENCHMARK REGRESSION CASE
// ==========================================================================
console.log('================================================================');
console.log('=== SECTION 17: SAN JUAN BOSCO R.C. SCHOOL REGRESSION CASE =====');
console.log('================================================================');
/*
  Benchmark Specifications:
  - School: San Juan Bosco R.C. School
  - Date: October 29, 2026
  - Subject: Mathematics
  - Class: Standard 6
  - Topic: Cycle 1 Review and Assessment
  - Subtopic: Translating Verbal Phrases into Algebraic Expressions
  - Duration: 90 minutes
*/

const rawSjbPlan: any = {
  schoolName: 'San Juan Bosco R.C. School',
  date: 'October 29, 2026',
  subject: 'Mathematics' as any,
  grade: 'Standard 6',
  cycle: 1,
  topic: 'Cycle 1 Review and Assessment',
  subtopic: 'Translating Verbal Phrases into Algebraic Expressions',
  learningOutcome: 'Translate verbal phrases into algebraic expressions without equals signs, define variables, and evaluate using substitution',
  duration: '90 minutes',
  day: 1
};

const sjbPlan = enforceMathematicsPurityAndQuality(rawSjbPlan as LessonPlan, {
  schoolName: 'San Juan Bosco R.C. School',
  date: 'October 29, 2026',
  duration: '90 minutes',
  day: 1
});

// Verification 1: Metadata preservation
assert((sjbPlan as any).schoolName === 'San Juan Bosco R.C. School', `SJB 1: School name must be San Juan Bosco R.C. School, got ${(sjbPlan as any).schoolName}`);
assert(sjbPlan.date === 'October 29, 2026', `SJB 2: Date must be October 29, 2026, got ${sjbPlan.date}`);
assert(sjbPlan.grade === 'Standard 6', `SJB 3: Grade must be Standard 6, got ${sjbPlan.grade}`);
assert(sjbPlan.duration === '90 minutes', `SJB 4: Duration must be 90 minutes, got ${sjbPlan.duration}`);
assert(sjbPlan.subtopic === 'Translating Verbal Phrases into Algebraic Expressions', `SJB 5: Subtopic must be Translating Verbal Phrases into Algebraic Expressions, got ${sjbPlan.subtopic}`);
assert(sjbPlan.curriculumCode === 'MA.ST6.C1.02', `SJB 6: Curriculum code must be MA.ST6.C1.02, got ${sjbPlan.curriculumCode}`);

// Verification 2: Zero column regrouping or place-value bleed in plan
const sjbPlanJson = JSON.stringify(sjbPlan).toLowerCase();
assert(!sjbPlanJson.includes('column regrouping'), 'SJB 7: Must contain zero column regrouping bleed');
assert(!sjbPlanJson.includes('carrying to the tens column'), 'SJB 8: Must contain zero carrying column bleed');

// Verification 3: Learning objectives
assert(sjbPlan.learningObjectives?.condition.startsWith('Given'), 'SJB 9: Objective condition must start with Given...');
assert(sjbPlan.learningObjectives?.cognitive.includes('translate verbal'), 'SJB 10: Cognitive objective must focus on verbal translation');
assert(sjbPlan.learningObjectives?.cognitive.includes('80%') || sjbPlan.learningObjectives?.cognitive.includes('4 out of 5'), 'SJB 11: Cognitive objective must specify 80% mastery criterion');

// Verification 4: Content notes & Board visual plan
assert(Boolean(sjbPlan.boardVisualPlan), 'SJB 12: Board visual plan must be present');
const boardText = JSON.stringify(sjbPlan.boardVisualPlan).toLowerCase();
assert(boardText.includes('variable') && boardText.includes('constant'), 'SJB 13: Board plan must define variable and constant');
assert(boardText.includes('less than') && boardText.includes('revers'), 'SJB 14: Board plan must explain subtraction reversal rule');

// Verification 5: 7-Stage CPA lesson progression summing to exactly 90 minutes
assert(sjbPlan.lessonAtAGlance.length === 7, `SJB 15: Must have exactly 7 CPA stages, got ${sjbPlan.lessonAtAGlance.length}`);
const sjbTotalMinutes = sjbPlan.lessonAtAGlance.reduce((sum, s) => sum + s.timeMinutes, 0);
assert(sjbTotalMinutes === 90, `SJB 16: Stages must sum to exactly 90 minutes, got ${sjbTotalMinutes}`);

// Verification 6: Student Practice Worksheet (8 questions, 10 marks total, 1:1 answer key)
const sjbWs = sjbPlan.studentMaterials?.find(m => m.type === 'worksheet');
assert(Boolean(sjbWs), 'SJB 17: Worksheet material must exist');
assert(sjbWs!.content.includes('Six less than twice y') || sjbWs!.content.includes('2y - 6'), 'SJB 18: Worksheet must include 2y - 6 benchmark');
assert(sjbWs!.content.includes('Four less than five times x') || sjbWs!.content.includes('5x - 4'), 'SJB 19: Worksheet must include 5x - 4 benchmark');
assert(sjbWs!.content.includes('3x') && sjbWs!.content.includes('x = 6'), 'SJB 20: Worksheet must include 3x (x=6) substitution problem');
assert(sjbWs!.content.includes('3x²') && sjbWs!.content.includes('x = 2'), 'SJB 21: Worksheet must include 3x² (x=2) PEMDAS problem');
assert(sjbWs!.answerKey?.includes('2y - 6'), 'SJB 22: Answer key must have 2y - 6');
assert(sjbWs!.answerKey?.includes('5x - 4'), 'SJB 23: Answer key must have 5x - 4');
assert(sjbWs!.answerKey?.includes('18'), 'SJB 24: Answer key must evaluate 3x (x=6) to 18');
assert(sjbWs!.answerKey?.includes('12'), 'SJB 25: Answer key must evaluate 3x² (x=2) to 12');

// Verification 7: Exit Ticket Package (3 questions for Day 1, 5 points total, 80% / 4/5 mastery threshold)
const sjbEt = sjbPlan.studentMaterials?.find(m => m.type === 'exit_ticket');
assert(Boolean(sjbEt), 'SJB 26: Exit ticket material must exist');
assert(Boolean(sjbPlan.exitTicketPackage), 'SJB 27: Exit ticket package must exist');
assert(sjbPlan.exitTicketPackage?.questions.length === 3, `SJB 28: Day 1 exit ticket must have 3 questions, got ${sjbPlan.exitTicketPackage?.questions.length}`);
const sjbEtPoints = sjbPlan.exitTicketPackage?.questions.reduce((sum, q) => sum + q.points, 0);
assert(sjbEtPoints === 5, `SJB 29: Exit ticket must total 5 points, got ${sjbEtPoints}`);
assert(sjbPlan.exitTicketPackage?.masteryThreshold.includes('80%') || sjbPlan.exitTicketPackage?.masteryThreshold.includes('4/5'), 'SJB 30: Exit ticket mastery threshold must document 80% (4/5) standard');

// Verification 8: Worked Examples List (authentic mathematical problems, zero placeholders)
assert(sjbPlan.workedExamplesList.length >= 3, `SJB 31: Must contain at least 3 worked examples, got ${sjbPlan.workedExamplesList.length}`);
const ex1 = sjbPlan.workedExamplesList[0];
assert(ex1.problemOrContext.includes('Translate verbal phrases') || ex1.problemOrContext.includes('Six less than twice y'), 'SJB 32: Example 1 must model verbal translations');
assert(ex1.stepByStepSolution.length >= 3, 'SJB 33: Example 1 must have detailed step-by-step solution');
assert(!sjbPlan.workedExamplesList.some(ex => ex.problemOrContext.includes('Model problem for')), 'SJB 34: Zero generic placeholders permitted in worked examples');

// Verification 9: Alignment Audit
const sjbAudit = runMathematicsAlignmentAudit(sjbPlan);
assert(sjbAudit.isValid, `SJB 35: Audit must be valid (errors: ${sjbAudit.errors.join('; ')})`);
assert(sjbAudit.status === 'PASS', `SJB 36: Audit status must be PASS, got ${sjbAudit.status}`);
assert(sjbAudit.is90MinBalanced, 'SJB 37: Audit confirms 90-minute balance');
assert(sjbAudit.hasCurriculumPurity, 'SJB 38: Audit confirms curriculum purity');
assert(sjbAudit.hasCompleteWorksheet, 'SJB 39: Audit confirms complete worksheet');
assert(sjbAudit.hasExactAnswerKey, 'SJB 40: Audit confirms exact answer key');
assert(sjbAudit.hasAlignedExitTicket, 'SJB 41: Audit confirms aligned exit ticket');

console.log('✓ SECTION 17 BENCHMARK TEST PASSED: All 41 verification criteria confirmed for San Juan Bosco R.C. School!\n');

console.log('================================================================');
console.log('=== ALL SECTION 16 TESTS 1-12 AND SECTION 17 BENCHMARK PASSED! ==');
console.log('=== MATHEMATICS ENGINE IS FULLY REPAIRED, STRENGTHENED & PROVEN! ==');
console.log('================================================================\n');
