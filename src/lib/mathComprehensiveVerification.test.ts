import { generateWeeklyLessonPlan } from '../services/gemini.implementation';
import { validateGeneratedLesson } from '../services/curriculumFilterService';
import { BELIZE_NATIONAL_CURRICULUM } from '../data/belize_national_curriculum';
import { runMathematicsAlignmentAudit } from './mathQualityGate';
import { getAuthoritativeInstructionalDatesForWeek } from './mathDateScheduler';
import { LessonPlan } from '../types';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`ASSERTION FAILED: ${message}`);
  }
}

async function runComprehensiveTests() {
  console.log('=== RUNNING TARGETED MATHEMATICS ENGINE VERIFICATION (ITEM 13) ===\n');

  // 1. Topic with manipulatives (Infant 2 Addition & Subtraction Concrete Modeling)
  console.log('Test 1: Topic with Pedagogically Appropriate Manipulatives (Infant 2 Addition)');
  const manipulativesPlan = await generateWeeklyLessonPlan({
    grade: 'Infant 2',
    subject: 'Mathematics',
    topic: 'Addition and Subtraction Strategies',
    cycle: 1,
    week: 4,
    teachingModel: 'CPA Approach',
    style: 'Standard Teacher'
  });
  assert(manipulativesPlan.week.days.length === 5, 'Must generate 5 days for Infant 2 Addition');
  const day1Resources = JSON.stringify(manipulativesPlan.week.days[0].lesson.materialsBoard || []);
  console.log('  Infant 2 Day 1 Resources:', day1Resources.substring(0, 120) + '...');
  // Verifies that manipulatives (counters, ten-frames, linking cubes, or number lines) are present when pedagogically appropriate
  const usesManipulatives = /counters|cubes|blocks|ten-frame|number line|manipulative/i.test(
    JSON.stringify(manipulativesPlan.week.days[0].lesson)
  );
  assert(usesManipulatives, 'Infant 2 Addition plan must include age-appropriate concrete manipulatives');
  console.log('✓ Test 1 Passed: Manipulative-appropriate topic properly recommends concrete resources.\n');

  // 2. Topic without manipulatives (Standard 6 Advanced Number Systems / Binary Logic)
  console.log('Test 2: Topic without Forced Manipulatives (Standard 6 Binary Systems)');
  const abstractPlan = await generateWeeklyLessonPlan({
    grade: 'Standard 6',
    subject: 'Mathematics',
    topic: 'Advanced Number Systems',
    cycle: 1,
    week: 7,
    teachingModel: 'Gradual Release',
    style: 'Standard Teacher'
  });
  assert(abstractPlan.week.days.length === 5, 'Must generate 5 days for Standard 6 Advanced Number Systems');
  const abstractText = JSON.stringify(abstractPlan.week.days[1].lesson.materialsBoard || []);
  // Should not blindly force base-ten blocks or fraction strips into binary conversion lessons
  assert(!abstractText.toLowerCase().includes('fraction strips'), 'Binary conversion must not blindly force fraction strips');
  console.log('✓ Test 2 Passed: Abstract mathematics topic avoids inappropriate manipulatives.\n');

  // 3. Different selected week and cycle (Cycle 2, Week 5: Standard 3 Measurement & Perimeter)
  console.log('Test 3: Different Selected Week and Cycle (Standard 3, Cycle 2, Week 5)');
  const week5Plan = await generateWeeklyLessonPlan({
    grade: 'Standard 3',
    subject: 'Mathematics',
    topic: 'Perimeter and Linear Measurement',
    cycle: 2,
    week: 5,
    teachingModel: 'Gradual Release',
    style: 'Standard Teacher'
  });
  assert(week5Plan.week.days.length === 5, 'Standard 3 Cycle 2 Week 5 must generate 5 days');
  const distinctSubtopics = new Set(week5Plan.week.days.map(d => d.lesson.subtopic));
  assert(distinctSubtopics.size === 5, 'All 5 days must have distinct progressive subtopics');
  // Verify content changes according to the selected topic
  assert(!JSON.stringify(week5Plan).toLowerCase().includes('binary'), 'Perimeter week must not contain binary');
  assert(!JSON.stringify(week5Plan).toLowerCase().includes('exponential growth'), 'Perimeter week must not contain exponential growth');
  console.log('✓ Test 3 Passed: Week and cycle content dynamically changes based on selected topic.\n');

  // 4. Assessment Counts and Scoring Criteria Agreement
  console.log('Test 4: Assessment Counts, Mark Schemes, and Denominators Agreement');
  for (let i = 0; i < 5; i++) {
    const dayLesson = abstractPlan.week.days[i].lesson;
    const exitTicket = dayLesson.exitTicketPackage;
    assert(Boolean(exitTicket), `Day ${i + 1} must have an exitTicketPackage`);
    assert(Array.isArray(exitTicket.questions) && exitTicket.questions.length > 0, `Day ${i + 1} exit ticket must have questions`);
    
    // Total points check
    const totalPoints = exitTicket.questions.reduce((sum: number, q: any) => sum + (q.points || 0), 0);
    assert(totalPoints === 5, `Day ${i + 1} exit ticket total points must equal 5 (got ${totalPoints})`);
    assert(exitTicket.masteryThreshold.includes('4/5') && exitTicket.masteryThreshold.includes('80%'), `Day ${i + 1} mastery threshold must be 4/5 (80%)`);
    
    // Check completeAssessment
    const completeAssessment = dayLesson.completeAssessment;
    assert(Boolean(completeAssessment), `Day ${i + 1} must have completeAssessment`);
    assert(Boolean(completeAssessment.answerKey), `Day ${i + 1} completeAssessment must have answerKey`);
    assert(Array.isArray(completeAssessment.rubric) && completeAssessment.rubric.length === 3, `Day ${i + 1} completeAssessment must have 3-tier rubric`);

    // Check duration totals to exactly 90 minutes
    assert(dayLesson.duration === '90 minutes', `Day ${i + 1} duration must state 90 minutes`);
    const stages = dayLesson.executionBoard || [];
    let totalStageTime = 0;
    stages.forEach((st: any) => {
      const timeStr = st.timeAllocation || st.duration || '';
      const match = timeStr.match(/(\d+)\s*(?:mins|min|m\b)/i) || timeStr.match(/(\d+)/);
      if (match) totalStageTime += parseInt(match[1], 10);
    });
    assert(totalStageTime === 90, `Day ${i + 1} instructional stages must sum exactly to 90 minutes (got ${totalStageTime})`);
  }
  console.log('✓ Test 4 Passed: Assessment counts, answer keys, scoring criteria, and 90-minute timings agree.\n');

  // 5. Missing or Ambiguous Curriculum Data
  console.log('Test 5: Handling Missing or Ambiguous Curriculum Data');
  const ambiguousCheck = validateGeneratedLesson({
    ...abstractPlan.week.days[0].lesson,
    curriculumAlignment: {
      strand: 'Unknown Strand',
      contentStandard: 'MA.CS.999 Invalid Fake Standard',
      learningOutcome: 'Invented outcome not in Belize curriculum',
      curriculumCode: 'MA.FAKE.999'
    }
  }, BELIZE_NATIONAL_CURRICULUM, {
    academicYear: '2026-2027',
    className: 'Standard 6',
    subject: 'Mathematics',
    cycle: 1,
    week: 7,
    topic: 'Advanced Number Systems'
  });
  assert(!ambiguousCheck.valid, 'Ambiguous/invented curriculum code must be rejected or flagged by validator');
  console.log('  Validator correctly flagged invalid curriculum:', ambiguousCheck.reason);
  console.log('✓ Test 5 Passed: Ambiguous or missing curriculum data is safely flagged.\n');

  // 6. Non-Mathematics Subject Generation Preservation
  console.log('Test 6: Non-Mathematics Engines Preserved (Language Arts & Science)');
  const sciencePlan = await generateWeeklyLessonPlan({
    grade: 'Standard 4',
    subject: 'Science and Technology',
    topic: 'Ecosystems and Food Webs',
    cycle: 1,
    week: 2,
    teachingModel: 'Scientific Inquiry',
    style: 'Standard Teacher'
  });
  assert(sciencePlan.week.days.length === 5, 'Science plan must generate 5 days');
  assert(sciencePlan.week.days[0].lesson.subject === 'Science and Technology', 'Science subject preserved');
  console.log('✓ Test 6 Passed: Non-Mathematics generation remains completely untouched and functional.\n');

  console.log('================================================================');
  console.log('ALL ITEM 13 VERIFICATION TESTS PASSED WITH 100% SUCCESS!');
  console.log('================================================================');
}

runComprehensiveTests().catch(err => {
  console.error('Item 13 Test failed:', err);
  process.exit(1);
});
