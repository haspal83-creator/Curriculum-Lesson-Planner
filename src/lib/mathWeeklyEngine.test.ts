import { generateWeeklyLessonPlan } from '../services/gemini.implementation';
import { validateGeneratedLesson } from '../services/curriculumFilterService';
import { BELIZE_NATIONAL_CURRICULUM } from '../data/belize_national_curriculum';
import { runMathematicsAlignmentAudit, purgeUnrelatedMathContent } from './mathQualityGate';
import { getAuthoritativeInstructionalDatesForWeek } from './mathDateScheduler';
import { LessonPlan } from '../types';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`TEST ASSERTION FAILED: ${message}`);
  }
}

async function runMathWeeklyEngineTests() {
  console.log('=== RUNNING MATHEMATICS WEEKLY ENGINE VERIFICATION TESTS ===\n');

  // TEST 1: Authoritative Instructional Dates for Cycle 1 Week 7 (Belize School Calendar)
  console.log('Test 1: Authoritative Instructional Dates Resolution for Cycle 1 Week 7');
  const week7Days = getAuthoritativeInstructionalDatesForWeek(1, 7, '2026-2027');
  assert(week7Days.length === 5, 'Must resolve 5 weekdays');
  assert(week7Days[0].dayName === 'Monday', 'First day is Monday');
  assert(week7Days[0].dateStr === 'October 12, 2026', 'Monday date is October 12, 2026');
  assert(week7Days[0].isTeachingDay === false, 'Oct 12 is recognized as non-teaching holiday');
  assert(Boolean(week7Days[0].holidayName), 'Holiday name identified for Oct 12');
  assert(week7Days[1].dateStr === 'October 13, 2026', 'Tuesday is October 13, 2026');
  assert(week7Days[4].dateStr === 'October 16, 2026', 'Friday is October 16, 2026');
  console.log('✓ Test 1 Passed: Calendar date resolution and holiday detection verified.\n');

  // TEST 2: Weekly Plan Generation for Standard 6 Advanced Number Systems (Cycle 1, Week 7)
  console.log('Test 2: Standard 6 Advanced Number Systems 5-Day Progressive Plan');
  const weeklyPlan = await generateWeeklyLessonPlan({
    grade: 'Standard 6',
    subject: 'Mathematics',
    topic: 'Advanced Number Systems',
    cycle: 1,
    week: 7,
    teachingModel: 'Gradual Release',
    style: 'Standard Teacher'
  });

  assert(Boolean(weeklyPlan.week), 'Weekly plan structure exists');
  assert(weeklyPlan.week.days.length === 5, 'Weekly plan has 5 daily lessons');

  const prohibitedPhrases = [
    'exponential growth',
    'growth factor',
    'y = a · bⁿ',
    'y = a * b^n',
    'bacteria doubling',
    'tilapia population',
    'doubling model',
    'repeated multiplication'
  ];

  // Inspect each day
  const dayTitles: string[] = [];
  const daySubtopics: string[] = [];
  const dayDates: string[] = [];

  weeklyPlan.week.days.forEach((d, idx) => {
    const lesson = d.lesson;
    dayTitles.push(lesson.lessonTitle);
    daySubtopics.push(lesson.subtopic);
    dayDates.push(lesson.date || '');

    const lessonText = JSON.stringify(lesson).toLowerCase();
    for (const phrase of prohibitedPhrases) {
      assert(!lessonText.includes(phrase), `Day ${idx + 1} must not contain "${phrase}"`);
    }

    // Check mathematics alignment
    const audit = runMathematicsAlignmentAudit(lesson);
    assert(audit.isValid, `Day ${idx + 1} must pass Mathematics alignment audit: ${audit.errors.join('; ')}`);
    assert(audit.hasCurriculumPurity, `Day ${idx + 1} must have complete curriculum purity`);
    assert(audit.hasNonDuplicatedObjectives, `Day ${idx + 1} must have non-duplicated tri-domain objectives`);
    assert(audit.hasCompleteWorksheet, `Day ${idx + 1} must have complete 8-question practice worksheet`);
    assert(audit.hasExactAnswerKey, `Day ${idx + 1} must have exact step-by-step answer key`);
    assert(audit.hasAlignedExitTicket, `Day ${idx + 1} must have aligned diagnostic exit ticket`);
    assert(lesson.duration === '90 minutes', `Day ${idx + 1} duration must be 90 minutes`);
  });

  // Verify progression uniqueness
  assert(new Set(daySubtopics).size === 5, 'All 5 daily lessons must have distinct progressive subtopics');
  assert(new Set(dayTitles).size === 5, 'All 5 daily lessons must have distinct lesson titles');
  assert(daySubtopics[0].includes('Base-10 vs Base-2'), 'Day 1 focuses on Base-10 vs Base-2 foundations');
  assert(daySubtopics[1].includes('Binary-to-Decimal'), 'Day 2 focuses on Binary-to-Decimal conversion');
  assert(daySubtopics[2].includes('Decimal Numbers to Binary'), 'Day 3 focuses on Decimal-to-Binary conversion');
  assert(daySubtopics[3].includes('Registers') || daySubtopics[3].includes('Applied'), 'Day 4 focuses on applied multi-bit / tech problem solving');
  assert(daySubtopics[4].includes('Review') || daySubtopics[4].includes('Mastery'), 'Day 5 focuses on comprehensive mastery assessment & parity proofs');
  console.log('✓ Test 2 Passed: Standard 6 Advanced Number Systems plan verified for progression and zero contamination.\n');

  // TEST 3: Validation Gate with curriculumFilterService
  console.log('Test 3: Curriculum Filter Integrity Validation on Weekly Plan');
  const pacingMaps = [{
    id: 'pm-std6-math-c1',
    grade: 'Standard 6' as any,
    subject: 'Mathematics' as any,
    cycle: 1,
    academicYear: '2026-2027',
    weeks: [
      {
        weekNumber: 7,
        topic: 'Advanced Number Systems',
        subtopics: ['Base-10 vs Base-2 Number Systems', 'Binary Conversion'],
        learningOutcomes: ['Understand base-2 place values and convert between base-10 and base-2']
      }
    ]
  }];

  const integrityCheck = validateGeneratedLesson(weeklyPlan, BELIZE_NATIONAL_CURRICULUM, {
    academicYear: '2026-2027',
    className: 'Standard 6',
    subject: 'Mathematics',
    cycle: 1,
    week: 7,
    pacingMaps: pacingMaps as any,
    topic: 'Advanced Number Systems'
  });
  assert(integrityCheck.valid, `Weekly plan must pass curriculum integrity check: ${integrityCheck.reason}`);

  // Test rejection when contaminated
  const contaminatedPlan = JSON.parse(JSON.stringify(weeklyPlan));
  contaminatedPlan.week.days[0].lesson.subtopic = 'Exponential growth and doubling bacteria';
  contaminatedPlan.week.days[0].lesson.executionBoard[2].teacherActions[0] += ' y = a · bⁿ growth factor doubling';

  const contaminatedCheck = validateGeneratedLesson(contaminatedPlan, BELIZE_NATIONAL_CURRICULUM, {
    academicYear: '2026-2027',
    className: 'Standard 6',
    subject: 'Mathematics',
    cycle: 1,
    week: 7,
    pacingMaps: pacingMaps as any,
    topic: 'Advanced Number Systems'
  });
  assert(!contaminatedCheck.valid, 'Contaminated plan with exponential growth must be rejected by validator');
  console.log('✓ Test 3 Passed: Curriculum filter properly validates clean plans and rejects contaminated plans.\n');

  // TEST 4: General Topic Support (Standard 4 Multiplication / Standard 5 Fractions)
  console.log('Test 4: General Mathematics Topic Progression (No Hardcoding to Standard 6/Binary)');
  const fractionsPlan = await generateWeeklyLessonPlan({
    grade: 'Standard 4',
    subject: 'Mathematics',
    topic: 'Fractions and Mixed Numbers',
    cycle: 2,
    week: 3,
    teachingModel: 'Gradual Release',
    style: 'Standard Teacher'
  });

  assert(fractionsPlan.week.days.length === 5, 'Standard 4 Fractions plan has 5 daily lessons');
  const fractionSubtopics = fractionsPlan.week.days.map(d => d.lesson.subtopic);
  assert(new Set(fractionSubtopics).size === 5, 'All 5 days for Fractions must have distinct subtopics');
  assert(!JSON.stringify(fractionsPlan).toLowerCase().includes('binary'), 'Fractions plan must not contain binary concepts');
  assert(!JSON.stringify(fractionsPlan).toLowerCase().includes('exponential growth'), 'Fractions plan must not contain exponential growth');
  console.log('✓ Test 4 Passed: General Mathematics topics dynamically adapt without hardcoding.\n');

  console.log('================================================================');
  console.log('ALL MATHEMATICS WEEKLY ENGINE VERIFICATION TESTS PASSED (4/4)!');
  console.log('================================================================');
}

runMathWeeklyEngineTests().catch(err => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
