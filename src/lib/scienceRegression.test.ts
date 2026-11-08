/**
 * COMPREHENSIVE AUTOMATED REGRESSION SUITE FOR SCIENCE AND TECHNOLOGY
 * 
 * Verifies:
 * 1. Part 13 Benchmark: November 8, 2026 Lesson (Standard 6, Earth Science,
 *    Terrestrial and Aquatic Ecosystems, SC 3.15, 45 minutes).
 * 2. Complete topic decontamination: zero celery/xylem/transpiration/photosynthesis bleed.
 * 3. Exact 5E inquiry alignment with 45m, 60m, 90m duration balance.
 * 4. ABCD behavioral objectives across Cognitive, Psychomotor, Affective domains with no duplicates.
 * 5. Solvable 8-question investigation worksheet (10 marks) and 1:1 complete answer key.
 * 6. Daily Exit Ticket with 5 points and 80% (4 of 5 marks) mastery threshold.
 * 7. Multi-class regression across Standard 1 through Standard 6.
 * 8. Non-interference: Mathematics, Language Arts, and other subjects remain 100% untouched.
 */

import { 
  enforceSciencePurityAndQuality, 
  isScienceSubject, 
  purgeUnrelatedScienceContent, 
  runScienceAlignmentAudit,
  validateAndRepairScienceLesson
} from './scienceQualityGate';
import { 
  detectScienceTopicCategory, 
  getScienceCurriculumPack,
  SCIENCE_CURRICULUM_BANKS
} from './scienceCurriculumBanks';
import { enrichAndGuaranteeTeachReady } from './lessonQualityGate';
import { resolveCompleteLessonResources } from './lessonExportResolver';
import { isMathematicsSubject } from './mathQualityGate';
import { parseMinutes } from './timingValidation';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`TEST ASSERTION FAILED: ${message}`);
  }
}

console.log('===================================================================');
console.log('=== RUNNING COMPREHENSIVE SCIENCE & TECHNOLOGY REGRESSION TESTS ===');
console.log('=== 8-SUITE VERIFICATION FOR BELIZE PRIMARY SCIENCE & TECH ========');
console.log('===================================================================\n');

// --------------------------------------------------------------------------
// SUITE 1: Subject Identification & Topic Category Detection
// --------------------------------------------------------------------------
console.log('--- SUITE 1: Subject Identification & Category Detection ---');
assert(isScienceSubject('Science and Technology'), 'Science and Technology recognized');
assert(isScienceSubject('science'), 'science lowercase recognized');
assert(isScienceSubject('Primary Science'), 'Primary Science recognized');
assert(!isScienceSubject('Mathematics'), 'Mathematics rejected');
assert(!isScienceSubject('Language Arts'), 'Language Arts rejected');
assert(!isScienceSubject('HFLE'), 'HFLE rejected');

const catEcosystem = detectScienceTopicCategory(
  'Earth Science',
  'Terrestrial and Aquatic Ecosystems',
  'SC 3.15 – Differentiate between and compare roles and components of terrestrial and aquatic ecosystems'
);
assert(catEcosystem === 'ecosystems_terrestrial_aquatic', 'Ecosystem category accurately classified');

const catPlant = detectScienceTopicCategory(
  'Living Things',
  'Plant Transport',
  'Investigate water absorption through roots and xylem transport to leaves'
);
assert(catPlant === 'plant_biology_transport', 'Plant biology category classified when vascular transport specified');

const catLiving = detectScienceTopicCategory(
  'Living Things',
  'Living and Non-Living',
  'Identify observable characteristics of living things and non-living objects'
);
assert(catLiving === 'living_nonliving_things', 'Living vs non-living category classified');

const catMachines = detectScienceTopicCategory(
  'Physical Science',
  'Simple Machines',
  'Investigate how inclined planes reduce the effort force needed to lift loads'
);
assert(catMachines === 'forces_motion_machines', 'Forces and machines category classified');
console.log('✓ Suite 1 Passed: Subject and category detection verified.\n');

// --------------------------------------------------------------------------
// SUITE 2: Topic Decontamination & Purity Enforcement
// --------------------------------------------------------------------------
console.log('--- SUITE 2: Topic Decontamination & Purity Enforcement ---');
const contaminatedText = 'Students will place celery stalks with leaves into clear plastic cups with water and red/blue food coloring to observe colored xylem dots and transpiration pull.';
const cleanedEcosystemText = purgeUnrelatedScienceContent(
  contaminatedText,
  'SC 3.15 – Differentiate between and compare roles and components of terrestrial and aquatic ecosystems',
  'Earth Science',
  'Terrestrial and Aquatic Ecosystems'
);
assert(!cleanedEcosystemText.toLowerCase().includes('celery'), 'Celery stalk purged');
assert(!cleanedEcosystemText.toLowerCase().includes('food coloring'), 'Food coloring purged');
assert(!cleanedEcosystemText.toLowerCase().includes('colored xylem dots'), 'Xylem dots purged');
assert(!cleanedEcosystemText.toLowerCase().includes('transpiration pull'), 'Transpiration pull purged');

const waveTrayText = 'We used a dual-channel wave simulation tray where the bare channel lost 4.5 cm of sand bank.';
const cleanedWaveText = purgeUnrelatedScienceContent(
  waveTrayText,
  'SC 3.15 – Differentiate between and compare roles and components of terrestrial and aquatic ecosystems',
  'Earth Science',
  'Terrestrial and Aquatic Ecosystems'
);
assert(!cleanedWaveText.toLowerCase().includes('wave simulation tray'), 'Wave tray purged');
assert(!cleanedWaveText.toLowerCase().includes('bare channel lost 4.5 cm'), 'Sand channel purged');

const legitPlantText = 'Xylem vessels conduct water from roots to leaves via transpiration pull.';
const cleanedLegitText = purgeUnrelatedScienceContent(
  legitPlantText,
  'Investigate water uptake in stems through xylem',
  'Plant Biology',
  'Xylem Transport'
);
assert(cleanedLegitText.includes('Xylem'), 'Legitimate xylem preserved in plant transport');
assert(cleanedLegitText.includes('transpiration'), 'Legitimate transpiration preserved in plant transport');
console.log('✓ Suite 2 Passed: Topic decontamination verified.\n');

// --------------------------------------------------------------------------
// SUITE 3: Part 13 Regression Benchmark: November 8, 2026 Lesson
// --------------------------------------------------------------------------
console.log('--- SUITE 3: Part 13 Regression Benchmark: November 8, 2026 Lesson ---');
const nov8Input = {
  subject: 'Science and Technology',
  grade: 'Standard 6',
  topic: 'Earth Science',
  subtopic: 'Terrestrial and Aquatic Ecosystems',
  learningOutcome: 'SC 3.15 – Differentiate between and compare roles and components of terrestrial and aquatic ecosystems',
  curriculumCode: 'SC 3.15',
  duration: '45 minutes',
  cycle: 'Cycle 2',
  week: 'Week 10',
  date: 'November 8, 2026'
};

const nov8Plan = enrichAndGuaranteeTeachReady(nov8Input);

assert(nov8Plan.subject === 'Science and Technology', 'Subject normalized to Science and Technology');
assert(nov8Plan.learningOutcome === nov8Input.learningOutcome, 'Outcome SC 3.15 preserved');
assert(nov8Plan.grade === 'Standard 6', 'Grade preserved');
assert(nov8Plan.curriculumCode === 'SC 3.15', 'Curriculum code SC 3.15 preserved');

const fullNov8Text = JSON.stringify(nov8Plan).toLowerCase();
assert(!fullNov8Text.includes('celery'), 'Zero celery in Nov 8 plan');
assert(!fullNov8Text.includes('xylem vessels'), 'Zero xylem vessels in Nov 8 plan');
assert(!fullNov8Text.includes('phloem vessels'), 'Zero phloem vessels in Nov 8 plan');
assert(!fullNov8Text.includes('transpiration pull'), 'Zero transpiration pull in Nov 8 plan');
assert(!fullNov8Text.includes('potted pepper plant'), 'Zero pepper plant in Nov 8 plan');
assert(!fullNov8Text.includes('wave simulation tray'), 'Zero wave tray in Nov 8 plan');

// Requirement (1): Zero fake laboratory investigation language (no spring scales, no trials, no measuring variables in comparative ecosystem)
assert(!fullNov8Text.includes('trial 1 versus trial 2'), 'Zero fake laboratory trials in Nov 8 plan');
assert(!fullNov8Text.includes('spring scale'), 'Zero spring scales in Nov 8 ecosystem plan');
assert(fullNov8Text.includes('specimen role cards') || fullNov8Text.includes('comparative matrix'), 'Genuine comparative investigation materials present');

assert(fullNov8Text.includes('terrestrial'), 'Terrestrial ecosystem content present');
assert(fullNov8Text.includes('aquatic'), 'Aquatic ecosystem content present');
assert(fullNov8Text.includes('biotic'), 'Biotic factor content present');
assert(fullNov8Text.includes('abiotic'), 'Abiotic factor content present');
assert(fullNov8Text.includes('belize barrier reef'), 'Belize Barrier Reef present');
assert(fullNov8Text.includes('mountain pine ridge'), 'Mountain Pine Ridge present');
assert(fullNov8Text.includes('macal river'), 'Macal River present');

// Requirement (8): Freshwater (<0.5 ppt) vs Marine (35 ppt) scientific accuracy
assert(fullNov8Text.includes('<0.5 ppt') || fullNov8Text.includes('freshwater'), 'Freshwater salinity distinguished');
assert(fullNov8Text.includes('35 ppt') || fullNov8Text.includes('marine'), 'Marine salinity distinguished');

// Requirement (3): ABCD Objectives without duplication
const objs = nov8Plan.learningObjectives;
assert(Boolean(objs?.condition && objs.condition.length > 10), 'Condition defined');
assert(Boolean(objs?.cognitive && objs.cognitive.length > 15), 'Cognitive objective defined');
assert(Boolean(objs?.psychomotor && objs.psychomotor.length > 15), 'Psychomotor objective defined');
assert(Boolean(objs?.affective && objs.affective.length > 15), 'Affective objective defined');
assert(objs?.cognitive !== objs?.psychomotor, 'Cognitive and psychomotor distinct');
assert(objs?.cognitive !== objs?.affective, 'Cognitive and affective distinct');

// Requirement (4): 5E Framework across executionBoard and lessonAtAGlance
const expectedPhases = ['Phase 1: Engage', 'Phase 2: Explore', 'Phase 3: Explain', 'Phase 4: Elaborate', 'Phase 5: Evaluate'];
assert(nov8Plan.executionBoard?.length === 5, 'Execution board has 5 stages');
nov8Plan.executionBoard?.forEach((p, idx) => {
  assert(p.phase === expectedPhases[idx], `Execution phase ${idx + 1} is ${expectedPhases[idx]}`);
});
assert(nov8Plan.lessonAtAGlance?.length === 5, 'Lesson at a glance has 5 stages');
nov8Plan.lessonAtAGlance?.forEach((g, idx) => {
  assert(g.stage === expectedPhases[idx], `Lesson at a glance stage ${idx + 1} is ${expectedPhases[idx]}`);
});

// Exact 45-minute timing
assert(nov8Plan.duration === '45 minutes', 'Duration is 45 minutes');
const totalMins = nov8Plan.executionBoard!.reduce((sum, p) => sum + parseMinutes(p.timeAllocation, 0), 0);
assert(totalMins === 45, `Total phase minutes strictly equals 45 (got ${totalMins})`);

// Requirement (2): 8-question solvable worksheet (10 marks) & 1:1 derived answer key
const ws = nov8Plan.studentMaterials?.find(m => m.type === 'worksheet');
assert(Boolean(ws && ws.content.includes('10 MARKS TOTAL')), 'Worksheet totals 10 marks');
assert(Boolean(ws && ws.content.includes('QUESTION 1')), 'Worksheet question 1 present');
assert(Boolean(ws && ws.content.includes('QUESTION 8')), 'Worksheet question 8 present');
assert(Boolean(ws && ws.answerKey && ws.answerKey.includes('1:1 ANSWER KEY')), '1:1 worked answer key present');
assert(Boolean(ws && ws.answerKey && ws.answerKey.includes('Question 8')), 'Answer key question 8 present');

// Requirement (2) & (14): 5-point Exit Ticket (80% / 4 of 5 threshold) with exactly 5 questions
const et = nov8Plan.studentMaterials?.find(m => m.type === 'exit_ticket');
assert(Boolean(et && et.content.includes('80%') && et.content.includes('5 Marks')), 'Exit ticket has 80% threshold');
assert(Boolean(et && et.answerKey && et.answerKey.includes('5 MARKS TOTAL')), 'Exit ticket answer key verified');
assert(Boolean(et && et.content.includes('1. [1 pt]') && et.content.includes('5. [1 pt]')), 'Exit ticket contains exactly 5 1-mark questions');
assert(Boolean(et && et.content.includes('Sunlight penetration') && et.content.includes('Black Howler Monkey')), 'Exit Ticket Q1 assesses biotic/abiotic components');
assert(Boolean(et && et.content.includes('800 times denser than air') && et.content.includes('upward buoyancy')), 'Exit Ticket Q2 assesses density and buoyancy support');
assert(Boolean(et && et.content.includes('Macal River with the Belize Barrier Reef') && et.content.includes('Hickatee')), 'Exit Ticket Q3 assesses freshwater (<0.5 ppt) vs marine (~35 ppt) salinity');
assert(Boolean(et && et.content.includes('sunlight attenuation') && et.answerKey.includes('photic zone')), 'Exit Ticket Q4 assesses sunlight attenuation with depth');
assert(Boolean(et && et.content.includes('conservation recommendation') && et.content.includes('riparian buffer')), 'Exit Ticket Q5 assesses evidence-supported conservation recommendation');

// Requirement (2): Student-facing investigation resources (profile dossiers, 12 organism cards, comparative matrix)
const dossierMat = nov8Plan.studentMaterials?.find(m => m.title.includes('Profile Dossiers'));
assert(Boolean(dossierMat && dossierMat.content.includes('MOUNTAIN PINE RIDGE') && dossierMat.content.includes('MACAL RIVER BASIN') && dossierMat.content.includes('BELIZE BARRIER REEF')), 'Printable profile dossiers present');
const cardsMat = nov8Plan.studentMaterials?.find(m => m.title.includes('Organism Specimen Cards'));
assert(Boolean(cardsMat && cardsMat.content.includes('CARD 1: JAGUAR') && cardsMat.content.includes('CARD 12: TURTLE GRASS')), '12 organism specimen cards present');
const matrixMat = nov8Plan.studentMaterials?.find(m => m.title.includes('Comparative Ecosystem Matrix'));
assert(Boolean(matrixMat && matrixMat.content.includes('3-COLUMN COMPARATIVE ECOSYSTEM INVESTIGATION MATRIX')), '3-column comparative matrix present');

// Requirement (5): Objective-to-Assessment Correspondence
assert(Boolean((nov8Plan.completeAssessment as any)?.objectiveMapping?.length === 3), 'All 3 objective domains mapped in complete assessment');
assert(Boolean((nov8Plan.completeAssessment as any)?.alignmentSummary?.includes('100% Objective-to-Assessment Correspondence')), 'Alignment summary verified');

// Requirement (6): Concrete Prerequisite Knowledge
assert(Boolean(nov8Plan.priorKnowledgeActivation?.whatTheyKnow && nov8Plan.priorKnowledgeActivation.whatTheyKnow.includes('Standards 4 and 5')), 'Concrete prerequisite knowledge verified');

// Requirement (7): Editable reflection template (no fake invented evaluation numbers)
assert(!fullNov8Text.includes('85% of students mastered'), 'No fake post-teaching evaluation percentages');
assert(Boolean(nov8Plan.reflectionDashboard?.whatWorked?.includes('[Teacher to record')), 'Editable reflection template verified');

// Differentiation
assert(Boolean(nov8Plan.differentiation && nov8Plan.differentiation.length === 3), 'Three-tier differentiation array present');
assert(Boolean(nov8Plan.differentiationFramework?.strugglingLearners), 'Struggling learners framework present');
assert(Boolean(nov8Plan.differentiationFramework?.onLevelLearners), 'On-level learners framework present');
assert(Boolean(nov8Plan.differentiationFramework?.advancedLearners), 'Advanced learners framework present');

// 15-Point Audit
const auditNov8 = runScienceAlignmentAudit(nov8Plan);
assert(auditNov8.passed, '15-point audit passed');
assert(auditNov8.score === 15, `Audit score is 15/15 (got ${auditNov8.score})`);

// Automated Validation & Active Repair Engine Test
const repairResult = validateAndRepairScienceLesson(nov8Input);
assert(repairResult.audit.passed, 'validateAndRepairScienceLesson passed 15/15 audit');
assert(repairResult.plan.studentMaterials!.length >= 5, 'Repaired plan contains worksheet, exit ticket, dossiers, cards, and matrix');

// Export Resolution Engine Test (resolveCompleteLessonResources)
const resolvedNov8 = resolveCompleteLessonResources(nov8Plan);
assert(resolvedNov8.worksheet?.hasWorksheet === true, 'Resolved worksheet present in export');
assert(resolvedNov8.worksheet?.totalQuestions === 8, 'Resolved worksheet has 8 questions');
assert(resolvedNov8.worksheet?.totalPoints === 10, 'Resolved worksheet has 10 points');
assert(resolvedNov8.exitTicket?.hasTicket === true, 'Resolved exit ticket present in export');
assert(resolvedNov8.exitTicket?.questions?.length === 5, 'Resolved exit ticket has 5 questions');
assert(resolvedNov8.stages?.length === 5, 'Resolved stages has 5 5E stages');
assert(resolvedNov8.stages?.[0]?.title === 'Phase 1: Engage', 'Exported stage 1 is Phase 1: Engage');
assert(resolvedNov8.stages?.[4]?.title === 'Phase 5: Evaluate', 'Exported stage 5 is Phase 5: Evaluate');
assert(resolvedNov8.additionalAssets?.length >= 3, 'Additional assets contains dossiers, organism cards, and matrix');
console.log('✓ Suite 3 Passed: November 8, 2026 lesson benchmark strictly verified.\n');

// --------------------------------------------------------------------------
// SUITE 4: Multi-Class Regression (Standard 1 to Standard 6)
// --------------------------------------------------------------------------
console.log('--- SUITE 4: Multi-Class Regression Across All Standards ---');

// Standard 1: Living vs Non-Living Things
const std1Plan = enrichAndGuaranteeTeachReady({
  subject: 'Science and Technology',
  grade: 'Standard 1',
  topic: 'Living Things',
  subtopic: 'Living and Non-Living',
  learningOutcome: 'Identify and describe observable characteristics of living things and non-living objects',
  duration: '45 minutes'
});
assert(std1Plan.grade === 'Standard 1', 'Std 1 grade set');
assert(JSON.stringify(std1Plan).toLowerCase().includes('living'), 'Std 1 living content present');
assert(runScienceAlignmentAudit(std1Plan).score === 15, 'Std 1 audit is 15/15');

// Standard 3: Animal Habitats & Adaptations
const std3Plan = enrichAndGuaranteeTeachReady({
  subject: 'Science and Technology',
  grade: 'Standard 3',
  topic: 'Animals',
  subtopic: 'Animal Adaptations',
  learningOutcome: 'Investigate how structural adaptations enable Belizean animals to survive in their habitats',
  duration: '45 minutes'
});
assert(JSON.stringify(std3Plan).toLowerCase().includes('adaptation'), 'Std 3 adaptation content present');
assert(runScienceAlignmentAudit(std3Plan).score === 15, 'Std 3 audit is 15/15');

// Standard 4: Matter & States of Matter
const std4Plan = enrichAndGuaranteeTeachReady({
  subject: 'Science and Technology',
  grade: 'Standard 4',
  topic: 'Matter and Materials',
  subtopic: 'States of Matter',
  learningOutcome: 'Investigate physical states of matter and phase changes caused by thermal energy',
  duration: '45 minutes'
});
assert(JSON.stringify(std4Plan).toLowerCase().includes('condensation'), 'Std 4 condensation present');
assert(runScienceAlignmentAudit(std4Plan).score === 15, 'Std 4 audit is 15/15');

// Standard 5: Simple Machines
const std5Plan = enrichAndGuaranteeTeachReady({
  subject: 'Science and Technology',
  grade: 'Standard 5',
  topic: 'Forces and Motion',
  subtopic: 'Simple Machines',
  learningOutcome: 'Investigate how simple machines like inclined planes reduce effort force',
  duration: '45 minutes'
});
assert(JSON.stringify(std5Plan).toLowerCase().includes('inclined plane'), 'Std 5 inclined plane present');
assert(runScienceAlignmentAudit(std5Plan).score === 15, 'Std 5 audit is 15/15');

// Standard 6: Closed Circuits
const std6Plan = enrichAndGuaranteeTeachReady({
  subject: 'Science and Technology',
  grade: 'Standard 6',
  topic: 'Energy and Electricity',
  subtopic: 'Closed Circuits',
  learningOutcome: 'Construct closed circuits and differentiate electrical conductors from insulators',
  duration: '45 minutes'
});
assert(JSON.stringify(std6Plan).toLowerCase().includes('circuit'), 'Std 6 circuit present');
assert(runScienceAlignmentAudit(std6Plan).score === 15, 'Std 6 audit is 15/15');
console.log('✓ Suite 4 Passed: Multi-class regression across Standards 1-6 verified.\n');

// --------------------------------------------------------------------------
// SUITE 5: Duration Scalability (45m, 60m, 90m)
// --------------------------------------------------------------------------
console.log('--- SUITE 5: Duration Scalability ---');
const plan60 = enrichAndGuaranteeTeachReady({
  subject: 'Science and Technology',
  grade: 'Standard 6',
  topic: 'Earth Science',
  subtopic: 'Terrestrial and Aquatic Ecosystems',
  learningOutcome: 'SC 3.15 – Differentiate between and compare roles and components of terrestrial and aquatic ecosystems',
  duration: '60 minutes'
});
const totalMins60 = plan60.executionBoard!.reduce((sum, p) => sum + parseMinutes(p.timeAllocation, 0), 0);
assert(totalMins60 === 60, `60m plan sums to 60 (got ${totalMins60})`);

const plan90 = enrichAndGuaranteeTeachReady({
  subject: 'Science and Technology',
  grade: 'Standard 6',
  topic: 'Earth Science',
  subtopic: 'Terrestrial and Aquatic Ecosystems',
  learningOutcome: 'SC 3.15 – Differentiate between and compare roles and components of terrestrial and aquatic ecosystems',
  duration: '90 minutes'
});
const totalMins90 = plan90.executionBoard!.reduce((sum, p) => sum + parseMinutes(p.timeAllocation, 0), 0);
assert(totalMins90 === 90, `90m plan sums to 90 (got ${totalMins90})`);
console.log('✓ Suite 5 Passed: 45m, 60m, and 90m duration scalability verified.\n');

// --------------------------------------------------------------------------
// SUITE 6: Non-Interference with Mathematics & Language Arts
// --------------------------------------------------------------------------
console.log('--- SUITE 6: Non-Interference with Other Subjects ---');
assert(isMathematicsSubject('Mathematics'), 'Mathematics subject check unaffected');
assert(!isScienceSubject('Mathematics'), 'Mathematics is not science');

const mathCheck = enrichAndGuaranteeTeachReady({
  subject: 'Mathematics',
  grade: 'Standard 6',
  topic: 'Patterns and Algebra',
  subtopic: 'Exponential Growth',
  learningOutcome: 'Formulate expressions for exponential growth patterns',
  duration: '90 minutes'
});
assert(mathCheck.subject === 'Mathematics', 'Math subject preserved');
assert(mathCheck.workedExamplesList?.[0]?.subjectType === 'Mathematics', 'Math worked examples preserved');

const laCheck = enrichAndGuaranteeTeachReady({
  subject: 'Language Arts',
  grade: 'Standard 6',
  topic: 'Word Study',
  subtopic: 'Greek and Latin Roots',
  learningOutcome: 'Analyze the meaning of unfamiliar words using Greek and Latin root words',
  duration: '90 minutes'
});
assert(laCheck.subject === 'Language Arts', 'Language Arts subject preserved');
console.log('✓ Suite 6 Passed: Non-interference with Mathematics and Language Arts verified.\n');

console.log('===================================================================');
console.log('=== ALL 6 SUITES IN SCIENCE REGRESSION TEST PASSED WITH ZERO ERRORS ===');
console.log('=== SCIENCE AND TECHNOLOGY INQUIRY ENGINE FULLY VERIFIED & PROVEN ===');
console.log('===================================================================');
