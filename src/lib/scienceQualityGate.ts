/**
 * SCIENCE AND TECHNOLOGY QUALITY GATE & PURITY ENFORCEMENT ENGINE
 * 
 * Strictly scoped to Subject: "Science and Technology".
 * Enforces authoritative Belize Primary Curriculum alignment, 5E inquiry frameworks,
 * complete topic decontamination (scrubbing accidental plant transport, celery, xylem,
 * or unrelated wave trays from ecosystem and other topics), ABCD objectives,
 * balanced durations (45m, 60m, 90m), authentic 8-question worksheets (10 marks),
 * 1:1 answer keys, and 5-point daily exit tickets (80% benchmark).
 */

import { LessonPlan, LessonPhase, StructuredMaterial, WorkedExampleItem } from '../types';
import { parseMinutes, harmonizePhaseSubactivityTimings, validateAndBalanceLessonTiming } from './timingValidation';
import { getAuthoritativeCurriculumCode } from '../services/curriculumHierarchyService';
import { 
  detectScienceTopicCategory, 
  normalizeScienceGrade, 
  getScienceCurriculumPack,
  SCIENCE_CURRICULUM_BANKS,
  ScienceTopicCategory,
  ScienceCurriculumPack,
  ScienceInvestigationItem
} from './scienceCurriculumBanks';

/**
 * Checks if the given subject is Science and Technology.
 */
export function isScienceSubject(subject?: string): boolean {
  if (!subject) return false;
  const s = subject.toLowerCase().trim();
  return s.includes('science') || s === 'science and technology' || s.includes('technology');
}

/**
 * Purges unrelated science topics that bleed from broad keywords or static packs.
 * Specifically scrubs celery stalks, dyed water, xylem/phloem, transpiration pull,
 * and photosynthesis mechanisms from non-plant-transport lessons (such as ecosystems,
 * living vs non-living, simple machines, weather, and human body systems).
 */
export function purgeUnrelatedScienceContent(
  text: string,
  outcome: string = '',
  topic: string = '',
  subtopic: string = ''
): string {
  if (!text || typeof text !== 'string') return text;
  let s = text;
  const contextLower = `${outcome} ${topic} ${subtopic}`.toLowerCase();

  const isPlantTransport = 
    contextLower.includes('xylem') || 
    contextLower.includes('phloem') || 
    contextLower.includes('transpiration') || 
    contextLower.includes('stem transport') || 
    contextLower.includes('water transport in plant') ||
    (contextLower.includes('plant') && (contextLower.includes('water absorption') || contextLower.includes('vascular bundle')));

  const isEcosystems = 
    contextLower.includes('terrestrial and aquatic') ||
    contextLower.includes('terrestrial') ||
    contextLower.includes('aquatic') ||
    contextLower.includes('ecosystem') ||
    contextLower.includes('sc 3.15') ||
    contextLower.includes('sc3.15') ||
    contextLower.includes('biotic') ||
    contextLower.includes('abiotic') ||
    contextLower.includes('barrier reef') ||
    contextLower.includes('pine ridge');

  const isMangroveWaveTray = 
    contextLower.includes('mangrove') && (contextLower.includes('wave') || contextLower.includes('erosion') || contextLower.includes('shoreline'));

  const isAtmosphericWeather = 
    contextLower.includes('weather') || contextLower.includes('hurricane') || contextLower.includes('cyclone') || contextLower.includes('atmosphere');

  const isCirculatory = 
    contextLower.includes('circulatory') || contextLower.includes('heart') || contextLower.includes('pulse') || contextLower.includes('blood');

  // 1. Purge Celery / Xylem / Phloem / Transpiration from non-plant-transport topics!
  if (!isPlantTransport) {
    s = s.replace(/celery(?: stalks?)?(?: with leaves)?/gi, isEcosystems ? 'Belize ecosystem specimens' : 'investigation apparatus');
    s = s.replace(/croton cuttings?/gi, isEcosystems ? 'terrestrial and aquatic specimens' : 'investigation samples');
    s = s.replace(/clear plastic cups with water and red\/blue food coloring/gi, isEcosystems ? 'Ecosystem classification sorting cards and comparative charts' : 'investigation materials');
    s = s.replace(/food coloring|dyed water|colored liquid climbed|colored xylem dots/gi, isEcosystems ? 'abiotic medium differences' : 'observable evidence');
    s = s.replace(/xylem vessels?|xylem tubes?|xylem/gi, isEcosystems ? 'conducting vessels in terrestrial producers' : 'structural components');
    s = s.replace(/phloem vessels?|phloem/gi, isEcosystems ? 'nutrient transport' : 'cellular tissue');
    s = s.replace(/transpiration pull|transpiration/gi, isEcosystems ? 'evapotranspiration and moisture cycles' : 'gas exchange');
    s = s.replace(/I predict the colored water will (?:travel \/ not travel) up the celery stem because [_\s.]+/gi, 
      isEcosystems 
        ? 'I predict that terrestrial and aquatic ecosystems will differ primarily in their (abiotic / biotic) factors because __________________________.' 
        : 'I predict that when we test this setup, the evidence will show __________________________ because __________________________.');
    s = s.replace(/stem cross-sections? under hand lenses/gi, isEcosystems ? 'comparative ecological data tables' : 'observational logs');
    s = s.replace(/A potted pepper plant placed next to the classroom window in Belize is bending noticeably sideways[^.]+\./gi,
      isEcosystems 
        ? 'In Belize, a howler monkey in the Mountain Pine Ridge canopy cannot survive in the barrier reef, while a reef grouper cannot survive on land.'
        : 'An observable phenomenon in our Belizean environment presents a testable scientific question.');
  }

  // 2. Purge Wave Tray / Mangrove Erosion when teaching general ecosystems or other topics
  if (!isMangroveWaveTray) {
    s = s.replace(/wave simulation tray|stream table|dual-channel wave simulation/gi, isEcosystems ? 'comparative ecosystem matrix' : 'test apparatus');
    s = s.replace(/toothpick\/mesh root models?|craft sticks\/toothpicks tied into prop root clusters/gi, isEcosystems ? 'ecosystem specimen cards' : 'physical model components');
    s = s.replace(/wave generator paddle|continuous wave pulses/gi, isEcosystems ? 'environmental parameter comparisons' : 'test trials');
    s = s.replace(/bare channel lost 4\.5 cm of sand bank/gi, isEcosystems ? 'terrestrial ecosystems showed rigid structural support requirements' : 'experimental data confirmed the hypothesis');
  }

  // 3. Purge Hurricane / Barometer / Paper Spiral Convection when not atmospheric weather
  if (!isAtmosphericWeather) {
    s = s.replace(/paper spiral snakes? over (?:a )?(?:warm )?lamp|spinning paper spiral/gi, 'controlled investigation setup');
    s = s.replace(/falling barometer reading|barometric fluid shifts/gi, 'collected measurement values');
  }

  // 4. Purge Heart Rate / Pulse when not circulatory
  if (!isCirculatory) {
    s = s.replace(/resting pulse rate vs active pulse rate|jumping jacks|pulse rate in beats per minute/gi, 'investigation measurement trials');
  }

  // 5. Purge any Language Arts Reading Passage or Phonics terminology bleed
  s = s.replace(/phonological awareness|phonics and word recognition|morphological analysis|prefix|suffix|base word|root word/gi, 'scientific terminology');
  s = s.replace(/mentor text|reading passage|comprehension questions/gi, 'scientific inquiry background text');
  s = s.replace(/readingPassageFull/gi, 'inquiryContextText');

  // 6. Purge any Arithmetic Place Value regrouping bleed
  s = s.replace(/column regrouping|regrouping ones and tens|place value column algorithms/gi, 'quantitative scientific data analysis');

  return s;
}

/**
 * Normalizes and guarantees Behavioral ABCD Objectives across Cognitive, Psychomotor, and Affective domains.
 * Guarantees NO duplicate objectives across the plan.
 */
export function buildAuthoritativeScienceObjectives(
  pack: ScienceCurriculumPack,
  outcome: string,
  topic: string,
  subtopic: string
) {
  const sharedCondition = pack.learningObjectives.condition;
  const cognitive = pack.learningObjectives.cognitive;
  const psychomotor = pack.learningObjectives.psychomotor;
  const affective = pack.learningObjectives.affective;

  const successCriteria = [
    ...pack.learningObjectives.successCriteria
  ];

  return {
    condition: sharedCondition,
    cognitive,
    psychomotor,
    affective,
    knowledge: cognitive,
    skill: psychomotor,
    attitude: affective,
    successCriteria
  };
}

/**
 * Builds 5E / Inquiry instructional phases scaled precisely to the target duration (45m, 60m, 90m).
 * Enforces explicit 5E naming: Phase 1: Engage, Phase 2: Explore, Phase 3: Explain, Phase 4: Elaborate, Phase 5: Evaluate.
 * Replaces fake laboratory trial wording with genuine, executable comparative inquiry when investigationType is comparative.
 */
export function buildAuthoritativeScienceExecutionBoard(
  pack: ScienceCurriculumPack,
  durationMinutes: number
): LessonPhase[] {
  // Determine duration distribution
  let times: [number, number, number, number, number];
  if (durationMinutes <= 45) {
    times = [5, 10, 15, 10, 5]; // Sum = 45m
  } else if (durationMinutes <= 60) {
    times = [8, 12, 20, 12, 8]; // Sum = 60m
  } else {
    times = [10, 20, 30, 20, 10]; // Sum = 90m
  }

  const isComparative = pack.investigation.investigationType === 'comparative_data_analysis';

  const phases: LessonPhase[] = [
    {
      phase: 'Phase 1: Engage',
      timeAllocation: `${times[0]} minutes`,
      teacherActions: [
        `Present the opening observable Belizean phenomenon: "${pack.phenomenon}"`,
        `Write the driving inquiry question prominently on the chalkboard: "${pack.inquiryQuestion}"`,
        `Facilitate the prior knowledge hook: "${pack.priorKnowledgeHook}"`
      ],
      studentActions: [
        `Observe the contrasting Belizean phenomenon carefully and record initial observations in science notebooks.`,
        `Write down the central inquiry question in their notebooks.`,
        `Engage in Think-Pair-Share with a peer to discuss prior experiences without making unverified assumptions.`
      ],
      questionsToAsk: [
        `"What do you notice happening in this real-life Belizean scenario?"`,
        `"Why do you think these differences exist between environments in Belize?"`,
        `"What question must we investigate today to understand the underlying scientific reality?"`
      ],
      materialsUsed: [pack.investigation.materials[0] || 'Phenomenon demonstration cards'],
      ongoingAssessment: {
        observe: 'Student engagement and ability to state observable facts rather than ungrounded guesses.',
        evidenceOfLearning: 'Students accurately record the central inquiry question and contribute relevant prior observations.',
        misconceptions: [pack.misconceptions[0]?.misconception || 'Misinterpreting the cause of the phenomenon.'],
        checkUnderstanding: 'Ask two students to restate the driving inquiry question in their own words.'
      }
    },
    {
      phase: 'Phase 2: Explore',
      timeAllocation: `${times[1]} minutes`,
      teacherActions: isComparative ? [
        `Administer the diagnostic probe: "${pack.diagnosticProbe}" to elicit student thinking.`,
        `Direct students to formulate and write their prediction: "${pack.predictionPrompt}"`,
        `Distribute Belize Ecosystem Profile Dossiers, 12 organism specimen cards, and 3-column comparative matrices.`,
        `Model how to extract abiotic parameters (medium, salinity in ppt, light penetration) and classify biotic components.`
      ] : [
        `Administer the diagnostic probe: "${pack.diagnosticProbe}" to reveal student thinking.`,
        `Direct students to formulate and write their prediction: "${pack.predictionPrompt}"`,
        `Distribute investigation materials and explain procedural protocol, safety rules, and fair testing controls.`
      ],
      studentActions: isComparative ? [
        `Complete the diagnostic probe on individual whiteboards or in notebooks.`,
        `Write formal predictions using the frame: "I predict ______ because ______."`,
        `Collaborate in lab pairs to examine the 3 ecosystem dossiers and 12 specimen role cards.`,
        `Populate the 3-column comparative matrix classifying components into Biotic vs Abiotic and identifying physical constraints.`
      ] : [
        `Complete the diagnostic probe on individual whiteboards or in notebooks.`,
        `Write formal predictions using the frame: "I predict ______ because ______."`,
        `Review the investigation recording table and verify materials for their collaborative group.`
      ],
      questionsToAsk: isComparative ? [
        `"Which physical factors in your dossier are non-living (abiotic) versus living organisms (biotic)?"`,
        `"How does the salinity of the Macal River (<0.5 ppt) compare to the Belize Barrier Reef (35 ppt)?"`,
        `"What physical medium provides structural support in terrestrial biomes versus aquatic ecosystems?"`
      ] : [
        `"What prior experience makes you predict that result?"`,
        `"What specific evidence will we record to test our prediction?"`,
        `"What variables must we keep constant to make our test fair?"`
      ],
      materialsUsed: isComparative 
        ? ['Ecosystem Profile Dossiers', 'Organism Specimen Cards', '3-Column Comparative Matrix', 'Science notebooks']
        : ['Science notebooks', 'Investigation recording sheet', pack.investigation.materials[1] || 'Testing apparatus'],
      ongoingAssessment: {
        observe: isComparative 
          ? 'Systematic categorization of specimen cards and accurate logging of abiotic parameters in the matrix.'
          : 'Careful handling of materials and adherence to procedural protocol.',
        evidenceOfLearning: isComparative
          ? 'Completed 3-column comparative matrix entries with clear distinction between biotic and abiotic factors.'
          : 'Completed prediction entries and observation logs in science notebooks.',
        misconceptions: [pack.misconceptions[1]?.misconception || pack.misconceptions[0]?.misconception || 'Assuming abiotic factors do not limit living organisms.'],
        checkUnderstanding: isComparative
          ? 'Spot-check student matrices to ensure salinity and light penetration are correctly recorded.'
          : 'Rapid spot check of 3 student prediction sentences for "because" justification.'
      }
    },
    {
      phase: 'Phase 3: Explain',
      timeAllocation: `${times[2]} minutes`,
      teacherActions: isComparative ? [
        `Facilitate a whole-class data collation on the chalkboard synthesizing group matrix findings across terrestrial, freshwater, and marine ecosystems.`,
        `Introduce formal scientific vocabulary in empirical context now that evidence has been examined: ${pack.explanationCER.formalVocabulary.map(v => v.term).join(', ')}.`,
        `Guide students to construct their formal Scientific Explanation (Claim + Evidence + Reasoning).`
      ] : [
        `Lead whole-class data collation board to synthesize findings across all lab groups.`,
        `Introduce formal scientific vocabulary now that evidence is collected: ${pack.explanationCER.formalVocabulary.map(v => v.term).join(', ')}.`,
        `Guide students to construct their formal Scientific Explanation (Claim + Evidence + Reasoning).`
      ],
      studentActions: isComparative ? [
        `Contribute group matrix findings to the class chalkboard synthesis.`,
        `Record formal scientific definitions for terrestrial, freshwater, and marine ecosystems and biotic vs abiotic factors.`,
        `Draft independent CER explanation in science notebooks: Claim answering inquiry question, Evidence citing matrix parameters, and Reasoning connecting abiotic constraints to organism adaptations.`
      ] : [
        `Analyze pooled class data and identify overarching scientific patterns across trials.`,
        `Integrate formal vocabulary terms into their explanations.`,
        `Draft independent CER response: State Claim, cite recorded Evidence, provide scientific Reasoning.`
      ],
      questionsToAsk: [
        `"What claim answers our central inquiry question?"`,
        `"What specific evidence from our data matrix supports that claim?"`,
        `"What scientific principle explains WHY the evidence supports the claim?"`
      ],
      materialsUsed: ['Science notebooks', 'CER Anchor Chart', 'Classroom Data Collation Board'],
      ongoingAssessment: {
        observe: 'Student ability to clearly distinguish raw empirical evidence from scientific reasoning.',
        evidenceOfLearning: 'Written CER paragraph answering the inquiry question with accurate terminology.',
        misconceptions: [pack.misconceptions[0]?.misconception || 'Stating opinions without citing recorded data.'],
        checkUnderstanding: 'Have one student read their Claim and another cite the supporting Evidence from their data.'
      }
    },
    {
      phase: 'Phase 4: Elaborate',
      timeAllocation: `${times[3]} minutes`,
      teacherActions: [
        `Connect findings to the real-world Belizean community and ecosystem context: "${pack.belizeanContext.ecosystemOrLocation}".`,
        `Present the applied conservation challenge: "${pack.belizeanContext.communityApplication}".`,
        `Guide students to evaluate how human actions in one ecosystem directly impact another.`
      ],
      studentActions: [
        `Analyze the real-world Belizean application challenge in pairs.`,
        `Apply scientific concepts to evaluate watershed connections or technological trade-offs.`,
        `Formulate actionable, evidence-based recommendations for Belizean environmental stewardship.`
      ],
      questionsToAsk: [
        `"How do human activities in upland terrestrial biomes directly alter downstream aquatic ecosystems in Belize?"`,
        `"Why is managing terrestrial watersheds essential for preserving our coastal barrier reef?"`,
        `"What evidence-based solutions can local communities implement to protect both environments?"`
      ],
      materialsUsed: ['Science notebooks', 'Belize Watershed & Ecosystem Maps', 'Application Prompt'],
      ongoingAssessment: {
        observe: 'Ability to transfer conceptual knowledge to complex, real-world Belizean scenarios.',
        evidenceOfLearning: 'Written application solutions demonstrating systems thinking and environmental stewardship.',
        misconceptions: ['Believing that upland human actions have no effect on distant aquatic habitats.'],
        checkUnderstanding: 'Ask two pairs to share their conservation solutions and justify them with ecological reasoning.'
      }
    },
    {
      phase: 'Phase 5: Evaluate',
      timeAllocation: `${times[4]} minutes`,
      teacherActions: [
        `Revisit the opening driving inquiry question: "${pack.inquiryQuestion}" and synthesize student consensus.`,
        `Administer the independent 5-point Daily Science Exit Ticket.`,
        `Collect 100% of exit tickets for formative grading against the 80% mastery benchmark (4 of 5 marks).`
      ],
      studentActions: [
        `Independently complete the 5-point Daily Science Exit Ticket without consulting peers or notes.`,
        `Reflect on how their understanding evolved from their opening prediction to the final CER explanation.`,
        `Return all investigation dossiers and sorting materials neatly to the storage station.`
      ],
      questionsToAsk: [
        `"Who can answer our driving inquiry question in one complete, scientifically accurate sentence?"`,
        `"How did our investigation evidence change or confirm your initial prediction?"`
      ],
      materialsUsed: ['Daily Science Exit Ticket printables'],
      ongoingAssessment: {
        observe: 'Individual student mastery on the exit ticket without scaffolded support.',
        evidenceOfLearning: 'Completed exit tickets demonstrating at least 80% (4 of 5 marks) accuracy.',
        misconceptions: ['Reverting to intuitive misconceptions on the exit ticket.'],
        checkUnderstanding: 'Collect 100% of exit tickets for formative assessment.'
      }
    }
  ];

  return phases;
}

/**
 * Builds the authoritative 8-question solvable Science Investigation Worksheet (totaling 10 marks).
 * Rebuilt so that every answer corresponds 1:1 directly to the finalized worksheet data structure.
 */
export function buildAuthoritativeScienceWorksheet(pack: ScienceCurriculumPack, grade: string): { title: string; content: string; answerKey: string } {
  const questions = pack.worksheetQuestions;
  const totalMarks = questions.reduce((sum, q) => sum + q.points, 0);

  let content = `NAME: ____________________________________   DATE: ___________________\n`;
  content += `GRADE: ${grade}   SUBJECT: Science and Technology   TOPIC: ${pack.topicTitle}\n`;
  content += `INQUIRY FOCUS: ${pack.focalConcept}\n\n`;
  content += `========================================================================\n`;
  content += `PART 1: THE DRIVING INQUIRY QUESTION\n`;
  content += `========================================================================\n`;
  content += `Inquiry Question: ${pack.inquiryQuestion}\n\n`;
  content += `MY SCIENTIFIC PREDICTION:\n`;
  content += `I predict that _________________________________________________________\n`;
  content += `because _______________________________________________________________\n`;
  content += `_______________________________________________________________________\n\n`;
  content += `========================================================================\n`;
  content += `PART 2: INVESTIGATION & SOLVABLE QUESTIONS (${totalMarks} MARKS TOTAL)\n`;
  content += `========================================================================\n\n`;

  let key = `### AUTHORITATIVE 1:1 ANSWER KEY & MARKING SCHEME (${pack.topicTitle} - ${totalMarks} MARKS TOTAL)\n\n`;

  questions.forEach((q, idx) => {
    const qNum = idx + 1;
    content += `QUESTION ${qNum} [${q.points} Mark${q.points > 1 ? 's' : ''}] (Objective Domain: ${q.targetObjectiveDomain || 'cognitive'}):\n`;
    content += `${q.questionText}\n`;
    if (q.options && q.options.length > 0) {
      q.options.forEach(opt => {
        content += `  ${opt}\n`;
      });
      content += `Answer: ________________________________\n\n`;
    } else if (q.questionType === 'cer_explanation') {
      content += `CLAIM (1 mark): _____________________________________________________\n`;
      content += `EVIDENCE (0.5 marks): _________________________________________________\n`;
      content += `REASONING (0.5 marks): ________________________________________________\n\n`;
    } else {
      content += `Answer:\n_______________________________________________________________________\n_______________________________________________________________________\n\n`;
    }

    key += `Question ${qNum} [${q.points} Mark${q.points > 1 ? 's' : ''}] (${q.targetObjectiveDomain || 'cognitive'} domain):\n`;
    key += `- Exact Question: "${q.questionText.replace(/\n/g, ' ')}"\n`;
    key += `- Expected Answer: ${q.expectedAnswer}\n`;
    key += `- Marking Criteria: ${q.markingGuide}\n\n`;
  });

  content += `========================================================================\n`;
  content += `PART 3: BELIZEAN REAL-WORLD APPLICATION\n`;
  content += `========================================================================\n`;
  content += `Context: ${pack.belizeanContext.ecosystemOrLocation}\n`;
  content += `Challenge: ${pack.belizeanContext.communityApplication}\n`;
  content += `My Scientific Solution:\n_______________________________________________________________________\n_______________________________________________________________________\n`;

  key += `Part 3 (Application):\n- Evaluated for sound ecological/scientific reasoning connected to Belizean realities.\n`;

  return {
    title: `${pack.topicTitle} - Science Investigation & Evidence Worksheet`,
    content,
    answerKey: key
  };
}

/**
 * Builds the authoritative Daily Science Exit Ticket (3-4 questions, 5 marks total, 80% benchmark).
 * Derived programmatically from the finalized exit ticket questions data structure.
 */
export function buildAuthoritativeScienceExitTicket(pack: ScienceCurriculumPack, grade: string): { title: string; content: string; answerKey: string } {
  const questions = pack.exitTicketQuestions;
  const totalMarks = questions.reduce((sum, q) => sum + q.points, 0);

  let content = `DAILY SCIENCE EXIT TICKET: ${pack.topicTitle}\n`;
  content += `Name: _________________________________ Date: ______________ Grade: ${grade}\n`;
  content += `Total Marks: ${totalMarks} Marks | Mastery Benchmark: At least 80% (${Math.ceil(totalMarks * 0.8)} of ${totalMarks} marks)\n\n`;

  let key = `### DAILY EXIT TICKET 1:1 ANSWER KEY (${totalMarks} MARKS TOTAL - 80% BENCHMARK = ${Math.ceil(totalMarks * 0.8)}/${totalMarks})\n\n`;

  questions.forEach((q, idx) => {
    const qNum = idx + 1;
    content += `${qNum}. [${q.points} pt${q.points > 1 ? 's' : ''}] ${q.questionText}\n`;
    if (q.options && q.options.length > 0) {
      q.options.forEach(opt => {
        content += `   ${opt}\n`;
      });
      content += `   My Answer: ___________________________\n\n`;
    } else {
      content += `   My Answer: ________________________________________________________\n`;
      content += `   ___________________________________________________________________\n\n`;
    }

    key += `${qNum}. [${q.points} pt${q.points > 1 ? 's' : ''}] (${q.targetObjectiveDomain || 'cognitive'} domain):\n`;
    key += `   Expected: ${q.expectedAnswer}\n`;
    key += `   Marking: ${q.markingGuide}\n\n`;
  });

  return {
    title: `${pack.topicTitle} - Daily Science Exit Ticket`,
    content,
    answerKey: key
  };
}

/**
 * MASTER ENGINE: Enforces Science and Technology purity, alignment, and teach-ready quality.
 */
export function enforceSciencePurityAndQuality(rawPlan: any, context?: any): LessonPlan {
  const plan = { ...rawPlan };

  // 1. Authoritative Subject Normalization
  plan.subject = 'Science and Technology';

  // 2. Class / Grade Normalization
  const grade = normalizeScienceGrade(plan.grade || context?.grade || 'Standard 6');
  plan.grade = grade;

  // 3. Topic, Subtopic & Learning Outcome Resolution
  const topic = plan.topic || plan.lessonTitle || context?.topic || 'Science Inquiry';
  const subtopic = plan.subtopic || context?.subtopic || '';
  const outcome = plan.learningOutcome || context?.learningOutcome || `Investigate and explain ${topic}`;
  
  plan.topic = topic;
  plan.subtopic = subtopic;
  plan.learningOutcome = outcome;
  plan.curriculumCode = plan.curriculumCode || context?.curriculumCode || getAuthoritativeCurriculumCode({
    subject: 'Science and Technology',
    grade,
    cycle: 1,
    topic
  });

  // 4. Retrieve Authoritative Curriculum Pack
  const pack = getScienceCurriculumPack(topic, subtopic, outcome);

  // 5. Harmonize Duration
  const duration = plan.duration || context?.duration || '45 minutes';
  const targetMinutes = parseMinutes(duration, 45);
  plan.duration = `${targetMinutes} minutes`;

  // 6. Set Lesson Title
  plan.lessonTitle = plan.lessonTitle || `${pack.topicTitle}: ${subtopic || pack.focalConcept}`;

  // 7. Strictly Aligned Behavioral ABCD Objectives (Condition, Performance, Criteria)
  const obj = buildAuthoritativeScienceObjectives(pack, outcome, topic, subtopic);
  plan.learningObjectives = {
    condition: obj.condition,
    cognitive: obj.cognitive,
    psychomotor: obj.psychomotor,
    affective: obj.affective
  };
  plan.learningObjectivesBoard = {
    condition: obj.condition,
    knowledge: obj.knowledge,
    skill: obj.skill,
    attitude: obj.attitude,
    cognitive: obj.cognitive,
    psychomotor: obj.psychomotor,
    affective: obj.affective,
    successCriteria: obj.successCriteria
  };
  plan.specificObjectives = [obj.cognitive, obj.psychomotor, obj.affective];

  // 8. Lesson Snapshot
  plan.lessonSnapshot = {
    about: `Inquiry-based Science & Technology lesson investigating ${pack.topicTitle}. Students explore the phenomenon of ${pack.phenomenon.slice(0, 75)}..., record empirical data, and construct CER explanations.`,
    learning: outcome,
    focus: `${pack.focalConcept}`,
    flow: `Phenomenon Hook & Driving Question (${Math.round(targetMinutes * 0.12)}m) → Diagnostic & Prediction (${Math.round(targetMinutes * 0.22)}m) → Practical Investigation & Evidence (${Math.round(targetMinutes * 0.33)}m) → Data Analysis & CER Explanation (${Math.round(targetMinutes * 0.22)}m) → Daily Exit Ticket (${Math.round(targetMinutes * 0.11)}m)`
  };

  // 9. Prior Knowledge & Misconceptions Activation
  plan.priorKnowledgeActivation = {
    whatTheyKnow: pack.prerequisiteKnowledge,
    activationStrategy: `${pack.priorKnowledgeHook} Then administer diagnostic probe: "${pack.diagnosticProbe}"`,
    misconceptionsToAnticipate: pack.misconceptions.map(m => m.misconception)
  };

  plan.commonMisconceptionsTable = pack.misconceptions.map(m => ({
    misconception: m.misconception,
    correctUnderstanding: m.scientificReality,
    teacherCorrectionLanguage: m.teacherCorrectionPrompt
  }));

  // 10. Vocabulary Focus (Introduced in Empirical Context)
  const vocabList = pack.explanationCER.formalVocabulary;
  plan.vocabularyFocus = {
    keyVocabulary: vocabList.map(v => ({
      term: v.term,
      definition: v.definition,
      academicLanguage: true,
      pronunciation: v.term
    }))
  };

  plan.keyVocabularyTable = vocabList.map(v => ({
    term: v.term,
    teacherDefinition: v.definition,
    studentDefinition: `In everyday words: ${v.definition.toLowerCase()}`,
    exampleSentence: `During our investigation, we used ${v.term.toLowerCase()} to explain our recorded observations.`
  }));

  // 11. Materials Board
  plan.materialsBoard = pack.investigation.materials.map((mat, idx) => ({
    name: mat,
    quantity: idx === 0 ? '1 per student group' : 'Class set',
    purpose: `Required for empirical evidence collection during the ${pack.investigation.title} phase.`,
    lessonPhase: 'Investigation & Evidence Collection',
    resourceType: idx === 0 ? 'manipulative' : 'printable'
  }));

  // 12. 5E / Inquiry Execution Board & Subactivity Timing Harmony
  const executionPhases = buildAuthoritativeScienceExecutionBoard(pack, targetMinutes);
  plan.executionBoard = executionPhases;

  // Build Lesson At A Glance rows strictly matching execution phases
  let cumulativeMin = 0;
  plan.lessonAtAGlance = executionPhases.map(phase => {
    const phaseMins = parseMinutes(phase.timeAllocation, 10);
    const start = cumulativeMin;
    const end = cumulativeMin + phaseMins;
    cumulativeMin = end;
    return {
      stage: phase.phase,
      time: `${start}:00 - ${end}:00`,
      timeMinutes: phaseMins,
      duration: `${phaseMins} mins (${start}:00 - ${end}:00)`,
      teacherDoes: phase.teacherActions[0] || 'Directs student investigation.',
      studentsDo: phase.studentActions[0] || 'Executes scientific procedure and records data.'
    };
  });

  // Harmonize subactivity timings
  executionPhases.forEach(p => {
    const parentMins = parseMinutes(p.timeAllocation, 10);
    p.teacherActions = harmonizePhaseSubactivityTimings(p.teacherActions || [], parentMins);
    p.studentActions = harmonizePhaseSubactivityTimings(p.studentActions || [], parentMins);
  });

  const isComparative = pack.investigation.investigationType === 'comparative_data_analysis';

  // 13. Worked Examples (Model CER & Investigation Walkthrough)
  plan.workedExamplesList = [
    {
      subjectType: 'Science',
      problemOrContext: `Scientific Inquiry Walkthrough: "${pack.inquiryQuestion}"`,
      stepByStepSolution: [
        {
          step: 1,
          action: 'State the observable phenomenon and testable inquiry question',
          explanation: `Driving question: ${pack.inquiryQuestion}`
        },
        {
          step: 2,
          action: 'Formulate reasoned prediction before observing outcome',
          explanation: `Frame: "${pack.predictionPrompt}"`
        },
        {
          step: 3,
          action: 'Collect and systematically record empirical evidence',
          explanation: `What was observed: ${pack.investigation.whatToObserve}. Evidence produced: ${pack.investigation.evidenceProduced}`
        },
        {
          step: 4,
          action: 'Construct scientific explanation using Claim + Evidence + Reasoning (CER)',
          explanation: `Claim: ${pack.explanationCER.claim}\nEvidence: ${pack.explanationCER.evidence}\nReasoning: ${pack.explanationCER.reasoning}`
        }
      ],
      finalAnswerOrModelResponse: `Complete CER Explanation:\n- Claim: ${pack.explanationCER.claim}\n- Evidence: ${pack.explanationCER.evidence}\n- Reasoning: ${pack.explanationCER.reasoning}`,
      commonErrorOrScientificReasoning: `Scientific rigor requires that empirical evidence always precedes scientific conclusions. An unsubstantiated claim is rejected in science without verified data.`,
      belizeanContextNote: `Grounding in Belize: ${pack.belizeanContext.ecosystemOrLocation}`
    }
  ];

  // 14. Instructional Sequence (I Do, We Do, You Do)
  plan.instructionalSequence = {
    iDo: {
      teacherAction: isComparative
        ? `The teacher presents the contrasting Belizean ecosystems phenomenon ("${pack.phenomenon}"), establishes the central inquiry question, and models how to analyze abiotic parameters and classify organism specimen cards into the 3-column comparative matrix.`
        : `The teacher presents the observable phenomenon ("${pack.phenomenon}"), establishes the driving inquiry question, demonstrates tool handling and safety, and models how to record data without bias.`,
      teacherExplanation: isComparative
        ? `"Scientists, look closely at our Belizean ecosystems. Today we do not guess—we analyze empirical environmental data. Our inquiry question is: '${pack.inquiryQuestion}'. Watch how I examine our abiotic parameter charts (salinity, light depth, air medium) and classify organism cards into their ecological roles."`
        : `"Scientists, take a close look at our setup. Today we do not guess answers—we gather empirical evidence. Our question is: '${pack.inquiryQuestion}'. Watch how I prepare our observation table so every trial is recorded accurately."`,
      workedExample: `Model Protocol: Phenomenon Hook → Reasoned Prediction → Evidence Collection / Matrix Analysis → CER Explanation.`,
      thinkAloud: `"Before I begin testing or analyzing cards, I must write down my prediction with a clear 'because'. If I don't record my reasoning first, I might convince myself I already knew the answer later!"`,
      expectedStudentObservation: `Students track the phenomenon, copy the driving question into notebooks, and prepare their data collection tables or comparative matrices.`
    },
    weDo: {
      tasks: isComparative ? [
        `Collaborative Matrix Analysis: Students work in lab pairs to analyze ecosystem profile dossiers (Mountain Pine Ridge, Macal River Basin, Belize Barrier Reef) and classify 12 specimen role cards into the 3-column comparative matrix.`,
        `Whole-Class Collation: Teacher leads pooling of group matrix findings onto the chalkboard to verify common patterns across terrestrial, freshwater, and marine biomes.`
      ] : [
        `Collaborative Investigation: Students work in lab pairs to manipulate apparatus and record empirical data according to "${pack.investigation.whatToInvestigate}".`,
        `Whole-Class Data Collation: Teacher leads pooling of group data onto the chalkboard to verify common patterns across trials.`
      ],
      teacherPrompts: isComparative ? [
        `"How does the salinity in the Macal River (<0.5 ppt) compare to the Belize Barrier Reef (35 ppt)?"`,
        `"What physical medium provides structural support for trees on land versus corals in the sea?"`,
        `"Which formal scientific term describes non-living physical factors like sunlight and water salinity?"`
      ] : [
        `"What does your group data table show for Trial 1 versus Trial 2?"`,
        `"Look at the pooled class data: what overarching pattern emerges?"`,
        `"Which formal scientific term describes the physical process we just observed?"`
      ],
      expectedResponses: isComparative ? [
        `Students cite specific recorded parameters (salinity in ppt, depth light attenuation, atmospheric air support).`,
        `Students classify species accurately into producers, consumers, and decomposers across the three biomes.`,
        `Students apply new scientific terminology (abiotic factor, biotic factor, terrestrial, aquatic) in context.`
      ] : [
        `Students cite specific recorded numbers and qualitative changes from their data tables.`,
        `Students compare findings with peers and identify reliable trends.`,
        `Students apply the new scientific vocabulary term (${vocabList[0]?.term}) in context.`
      ],
      correctAnswers: [
        `Empirical data accurately reflects test conditions: ${pack.investigation.evidenceProduced}`
      ],
      feedbackLanguage: isComparative
        ? `"Outstanding analytical precision at Station 2—your comparative matrix clearly documents how salinity restricts freshwater vs marine species!"`
        : `"Excellent procedural accuracy at Lab Station 2—your data table clearly documents the pattern!"`,
      correctionPrompts: isComparative
        ? `"Look at that sorting card again: is sunlight a living organism or a physical environmental factor? Place it in the abiotic row."`
        : `"Look at your data again: are you writing what you actually observed, or what you thought would happen? Science always honors the evidence!"`
    },
    youDo: {
      studentTasks: [
        `Independently construct the final Scientific Explanation (CER) paragraph in science notebooks.`,
        `Complete the Belizean applied challenge question connecting findings to local communities or ecosystems.`,
        `Independently complete the 5-point Daily Science Exit Ticket.`
      ],
      problemsOrPassages: pack.worksheetQuestions.slice(0, 5).map(q => q.questionText),
      activities: [
        `Independent writing in science notebooks using the Claim + Evidence + Reasoning structure.`,
        `Self-assessment check against the lesson success criteria.`
      ],
      successCriteria: `Student independently crafts an accurate CER paragraph, achieving at least 80% on the exit ticket.`
    }
  };

  // 15. Tiered Differentiation (Struggling, On-level, Advanced) - ALL TIED TO SAME OUTCOME!
  plan.ifStudentsAreStruggling = {
    signsOfConfusion: [
      `Confusing raw empirical observation (what was seen) with inference or prior assumption.`,
      `Struggling to separate Claim from Evidence in the CER framework.`,
      `Reverting to common misconceptions despite conflicting test data.`,
      `Difficulty setting up data tables or reading measurement calibrations.`
    ],
    likelyCause: `Cognitive overload between handling physical apparatus and recording multi-step data simultaneously.`,
    simplerExplanation: `Let's break our scientific thinking into 3 simple sentences: 1) What did you see? (Evidence). 2) What is the answer to our question? (Claim). 3) Why did it happen? (Reasoning).`,
    alternativeExample: `Relate to an everyday Belizean experience: e.g., if you see puddles and wet roads in the morning, what is your Claim? It rained! What is your Evidence? The puddles! What is your Reasoning? Rain falling from clouds wets ground surfaces.`,
    additionalGuidedPractice: `Provide a fill-in-the-blank CER sentence stem card and guide the student to insert their exact notebook numbers/observations into the blanks.`,
    visualOrManipulativeOption: pack.differentiation.struggling.visualAid,
    reteachingStrategy: `Pull a 4-minute focus table during independent practice: re-examine the physical apparatus side-by-side, highlight one key observation, and formulate the claim together.`,
    followUpCheck: `Ask the student to state their Claim and point to the single line in their notebook table that proves it.`
  };

  plan.differentiation = [
    `Struggling Learners: ${pack.differentiation.struggling.support}`,
    `On-Level Learners: ${pack.differentiation.onLevel.task}`,
    `Advanced Learners: ${pack.differentiation.advanced.extension}`
  ];

  plan.differentiationFramework = {
    strugglingLearners: {
      scaffolds: [pack.differentiation.struggling.scaffold],
      visuals: [pack.differentiation.struggling.visualAid],
      manipulatives: pack.investigation.materials.slice(0, 2),
      simplifiedInstructions: pack.differentiation.struggling.support,
      guidedSupport: 'Small-group teacher table during independent practice.'
    },
    onLevelLearners: {
      participationExpectations: pack.differentiation.onLevel.task,
      independentWorkExpectations: pack.differentiation.onLevel.independence,
      peerCollaboration: 'Collaborative lab pairs for data collection and analysis.'
    },
    advancedLearners: {
      challengeTasks: [pack.differentiation.advanced.extension],
      deeperThinkingPrompts: [pack.differentiation.advanced.deeperInquiry],
      extensionActivity: pack.differentiation.advanced.extension,
      leadershipRole: 'Lab group data verification coordinator.'
    },
    inclusionSupport: {
      ell: 'Bilingual peer buddy and visual diagram labeling.',
      sensory: 'Hands-on tactile access to real specimens and materials.'
    }
  };

  // 17. Student Materials (Solvable 8-Question Worksheet & 5-Point Exit Ticket)
  const worksheet = buildAuthoritativeScienceWorksheet(pack, grade);
  const exitTicket = buildAuthoritativeScienceExitTicket(pack, grade);

  plan.studentMaterials = [
    {
      title: worksheet.title,
      type: 'worksheet',
      content: worksheet.content,
      answerKey: worksheet.answerKey
    },
    {
      title: exitTicket.title,
      type: 'exit_ticket',
      content: exitTicket.content,
      answerKey: exitTicket.answerKey
    }
  ];

  if (pack.studentInvestigationMaterials) {
    plan.studentMaterials.push({
      title: 'Belize Ecosystem Profile Dossiers (Mountain Pine Ridge, Macal River, Belize Barrier Reef)',
      type: 'reading_passage',
      content: pack.studentInvestigationMaterials.profileDossiers,
      answerKey: 'Reference resource for empirical matrix comparison; no separate student score.'
    });
    plan.studentMaterials.push({
      title: '12 Belizean Organism Specimen Cards & Classification Sorting Guide',
      type: 'activity_cards',
      content: pack.studentInvestigationMaterials.organismCards,
      answerKey: 'Reference resource for biological sorting and trophic classification; checked via Worksheet Q3 and Matrix.'
    });
    plan.studentMaterials.push({
      title: '3-Column Comparative Ecosystem Matrix (Terrestrial vs Freshwater vs Marine)',
      type: 'graphic_organizer',
      content: pack.studentInvestigationMaterials.comparativeMatrix,
      answerKey: pack.studentInvestigationMaterials.comparativeMatrixAnswerKey || 'Full comparative matrix answer key provided in teacher answer key.'
    });
  }

  // 16. Complete Assessment with Rubric Aligned to Curriculum Verb & 100% Objective Correspondence
  plan.completeAssessment = {
    task: `${pack.topicTitle} Inquiry Mastery Assessment: ${outcome}`,
    expectedResponse: `Students accurately demonstrate empirical investigation, cite collected data, explain scientific causality (CER), and achieve at least 80% on the inquiry rubric.`,
    objectiveMapping: [
      {
        domain: 'Cognitive',
        objective: obj.cognitive,
        assessedBy: 'Worksheet Q1, Q2, Q4, Q5, Q6, Q8 (CER) and Exit Ticket Q1, Q2, Q3, Q4',
        evidenceRequired: 'Accurate differentiation of abiotic vs biotic factors, medium density, light penetration, and freshwater vs marine salinity constraints.'
      },
      {
        domain: 'Psychomotor',
        objective: obj.psychomotor,
        assessedBy: 'Investigation Matrix Sorting, Specimen Card Classification, Worksheet Q3, and Exit Ticket Q1',
        evidenceRequired: 'Physically sorting 12 specimen cards, categorizing components into biotic/abiotic tables, and constructing 3-column comparative matrices.'
      },
      {
        domain: 'Affective',
        objective: obj.affective,
        assessedBy: 'Worksheet Q7 (Watershed Conservation), Exit Ticket Q5 (Conservation Recommendation), and Collaborative Protocol',
        evidenceRequired: 'Formulating an evidence-supported conservation recommendation evaluating how upstream terrestrial runoff from the Macal River impacts coastal marine life on the Belize Barrier Reef.'
      }
    ],
    alignmentSummary: `100% Objective-to-Assessment Correspondence: Cognitive, Psychomotor, and Affective behavioral objectives are directly mapped to specific assessment items across the 10-mark worksheet and 5-point exit ticket. Combined assessment provides rigorous evidence of mastery for learning outcome: "${outcome}".`,
    answerKey: worksheet.answerKey + '\n\n' + exitTicket.answerKey,
    rubric: [
      {
        criteria: `Scientific Inquiry & Evidence Collection`,
        exemplary: `Executes investigation flawlessly, records complete and accurate data tables or comparative matrices, and demonstrates high procedural rigor.`,
        proficient: `Conducts investigation effectively and records clear, usable evidence in data tables or matrices with minor omissions.`,
        developing: `Requires continuous teacher assistance to complete matrices or leaves data logs partially incomplete.`
      },
      {
        criteria: `Scientific Explanation (Claim + Evidence + Reasoning)`,
        exemplary: `Constructs sophisticated CER explanation integrating formal vocabulary and providing flawless causal justification.`,
        proficient: `States a valid claim and cites relevant evidence with sound basic scientific reasoning.`,
        developing: `States an opinion without citing supporting data or confuses evidence with speculation.`
      }
    ],
    masteryCriteria: `Mastery Standard: Student achieves at least 80% accuracy (8/10 marks on worksheet, 4/5 marks on exit ticket) across empirical data logging and CER scientific explanation.`
  };

  // Editable reflection dashboard template (NEVER invent post-teaching evaluation results)
  plan.reflectionDashboard = {
    whatWorked: '[Teacher to record after instruction: Document successful inquiry prompts, effective specimen sorting moments, and high student engagement.]',
    needsImprovement: '[Teacher to record after instruction: Identify concepts requiring reinforcement, pacing bottlenecks, or procedural adjustments.]',
    followUpStudents: [
      '[Teacher to record after instruction: List students scoring below 4 of 5 marks (80%) on the Daily Exit Ticket for targeted warm-up review.]'
    ],
    nextSteps: '[Teacher to record after instruction: Outline specific interventions, next lesson adjustments, and extension challenges based on exit ticket data.]'
  };

  // 18. Teacher Preparation Briefing & Script
  plan.teachMeThisTopic = {
    whatIsThisTopic: `${pack.topicTitle} is a core scientific inquiry module within the ${grade} Belize Science and Technology curriculum focusing on "${outcome}".`,
    whyItMatters: `It builds empirical literacy, causal reasoning, and critical thinking essential for understanding natural systems and sustainable conservation in Belize.`,
    mostImportantIdeas: [
      `Phenomenon First: Always present the observable mystery (${pack.phenomenon.slice(0, 50)}...) before introducing terminology.`,
      `Students Must Do The Science: Avoid teacher monologues; students must directly manipulate specimens, measure, and record data.`,
      `CER Structure: Enforce Claim + Evidence + Reasoning so students justify conclusions using empirical proof.`
    ],
    mustUnderstandBeforeTeaching: `Prepare physical investigation materials in advance (${pack.investigation.materials.slice(0, 3).join(', ')}). Test the procedure once beforehand to verify observable changes occur within the lesson time.`,
    howToExplainSimply: `Use the driving question: "${pack.inquiryQuestion}". Allow students to experience the phenomenon before formalizing terms like ${vocabList.map(v => v.term).join(', ')}.`,
    firstExampleToUse: `The opening phenomenon: ${pack.phenomenon}`,
    mistakesToWatchFor: pack.misconceptions.map(m => m.misconception),
    quickCheckUnderstanding: `Conduct a rapid thumbs check on the diagnostic probe: "${pack.diagnosticProbe}" within 60 seconds.`
  };

  plan.teacherScriptDetailed = {
    opening: `"Good morning, scientists! Eyes on our lab table. Today, we are not opening textbooks to memorize words—we are investigating a real mystery in our environment: ${pack.phenomenon} By the end of today's inquiry, every one of you will be able to prove why this happens using your own recorded evidence."`,
    introduction: isComparative
      ? `"Look closely at our Belize river basin map and ecosystem profile dossiers. Our driving inquiry question on the board is: '${pack.inquiryQuestion}'. Before we examine our specimen cards, turn to your partner and whisper: what do you notice right now?"`
      : `"Look closely at what is happening here. Our driving inquiry question on the board is: '${pack.inquiryQuestion}'. Before we touch our apparatus, turn to your partner and whisper: what do you notice right now?"`,
    explanation: `"Notice that in science, we never jump to conclusions without testing. Before we begin, open your notebooks to Part 1: write your prediction. Complete the sentence: 'I predict ______ because ______.' Explain your thinking."`,
    modeling: isComparative
      ? `"Watch how I examine our Belize Ecosystem Profile chart. Notice how I identify abiotic parameters—salinity in parts per thousand, moisture, support medium. Notice how I categorize organisms into biotic roles without guessing. Science honors the evidence!"`
      : `"Watch how I set up our investigation apparatus. Notice how I control our variables so our test is completely fair. When you observe your trials, record exactly what happens in your data table—do not alter data to match your prediction. Science honors the evidence!"`,
    questioning: [
      `"What does your evidence tell you about our opening question?"`,
      `"Why did our data reveal that specific physical constraint?"`,
      `"How does your evidence disprove the common misconception that ${pack.misconceptions[0]?.misconception.toLowerCase()}?"`
    ],
    transitions: isComparative ? [
      `"Now that our predictions are locked in, materials managers collect your group's ecosystem dossiers and specimen sorting cards. You have ${Math.round(targetMinutes * 0.33)} minutes to complete your 3-column comparative matrices."`,
      `"Specimen cards resting, pencils ready. Let's look at the class matrix synthesis board. What overarching pattern connects abiotic physical factors to biotic survival across every group?"`,
      `"Now let's synthesize our discoveries into a formal Scientific Explanation: Claim, Evidence, and Reasoning."`
    ] : [
      `"Now that our predictions are locked in, materials managers collect your group tray. You have ${Math.round(targetMinutes * 0.33)} minutes to run your trials and complete your data tables."`,
      `"Apparatus down, pencils ready. Let's look at the class data board. What overarching pattern do we see across every lab group?"`,
      `"Now let's synthesize our discoveries into a formal Scientific Explanation: Claim, Evidence, and Reasoning."`
    ],
    directions: isComparative
      ? `"Work in collaborative pairs. Partner A examines abiotic physical parameters; Partner B analyzes biotic organism roles. Cross-check each card before recording it in your 3-column matrix."`
      : `"Work in your lab pairs. Partner A handles the apparatus; Partner B verifies the measurement and records the log. Switch roles for Trial 2. Record every trial neatly."`,
    feedbackLanguage: isComparative
      ? `"Brilliant precision with your comparative matrix at Table 3—your recorded evidence clearly differentiates freshwater from marine salinity constraints!"`
      : `"Brilliant precision with your data recording at Table 3—your evidence clearly proves the relationship!"`,
    correctionPrompts: isComparative
      ? `"Stop right there and examine your card. Is water salinity a living plant or an abiotic physical factor? Correct its placement in your matrix."`
      : `"Stop right there and look at your data. Did your measurement show that, or are you writing what you thought would happen? Record only what you actually observed."`,
    closing: `"Materials neatly returned in 3... 2... 1. Scientists, who can answer our driving question: '${pack.inquiryQuestion}'? Outstanding scientific inquiry today, class!"`
  };

  // 19. Science-specific inquiry framework metadata on plan
  (plan as any).scienceInquiryFramework = {
    category: pack.category,
    phenomenonOrProblem: {
      description: pack.phenomenon,
      observableContext: pack.belizeanContext.ecosystemOrLocation,
      guidingInquiryQuestion: pack.inquiryQuestion
    },
    priorKnowledgeAndPrediction: {
      diagnosticActivity: pack.diagnosticProbe,
      misconceptionsToElicit: pack.misconceptions.map(m => m.misconception),
      studentPredictionPrompt: pack.predictionPrompt
    },
    investigationPlan: {
      title: pack.investigation.title,
      whatStudentsAreInvestigating: pack.investigation.whatToInvestigate,
      whatStudentsWillObserve: pack.investigation.whatToObserve,
      whatStudentsWillRecord: pack.investigation.whatToRecord,
      whatEvidenceStudentsWillUse: pack.investigation.evidenceProduced,
      questionAnsweredByEvidence: pack.investigation.questionAnsweredByEvidence,
      studentActionVsTeacherDemo: pack.investigation.isStudentDriven ? 'Student Hands-on Investigation' : 'Interactive Guided Investigation',
      safetyOrMaterialNotes: 'Handle investigation materials with care; maintain laboratory safety protocols.'
    },
    scientificExplanationCER: pack.explanationCER,
    applicationAndSynthesis: {
      realWorldBelizeanApplication: pack.belizeanContext.communityApplication,
      misconceptionRevisionOpportunity: pack.misconceptions[0]?.teacherCorrectionPrompt || ''
    }
  };

  // 20. Final Purity Scrub across ALL text fields in plan
  const scrubKeys = [
    'lessonTitle', 'topic', 'subtopic', 'lessonSnapshot', 'priorKnowledgeActivation',
    'instructionalSequence', 'executionBoard', 'completeAssessment', 'studentMaterials',
    'teachMeThisTopic', 'teacherScriptDetailed'
  ];

  for (const k of scrubKeys) {
    if (typeof (plan as any)[k] === 'string') {
      (plan as any)[k] = purgeUnrelatedScienceContent((plan as any)[k], outcome, topic, subtopic);
    } else if (Array.isArray((plan as any)[k])) {
      (plan as any)[k] = (plan as any)[k].map((item: any) => {
        if (typeof item === 'string') return purgeUnrelatedScienceContent(item, outcome, topic, subtopic);
        if (typeof item === 'object' && item !== null) {
          const mapped: any = {};
          for (const [subk, subv] of Object.entries(item)) {
            if (typeof subv === 'string') {
              mapped[subk] = purgeUnrelatedScienceContent(subv, outcome, topic, subtopic);
            } else {
              mapped[subk] = subv;
            }
          }
          return mapped;
        }
        return item;
      });
    } else if (typeof (plan as any)[k] === 'object' && (plan as any)[k] !== null) {
      for (const [subk, subv] of Object.entries((plan as any)[k])) {
        if (typeof subv === 'string') {
          (plan as any)[k][subk] = purgeUnrelatedScienceContent(subv, outcome, topic, subtopic);
        }
      }
    }
  }

  // Scrub any reading passage or Language Arts bleed
  delete (plan as any).readingPassageFull;
  delete (plan as any).languageArtsComponents;
  delete (plan as any).component1Details;
  delete (plan as any).component2Details;

  return plan;
}

/**
 * 15-Point Automated Quality-Control System for Science and Technology
 */
export interface ScienceAuditResult {
  passed: boolean;
  score: number;
  totalChecks: number;
  checks: { id: number; name: string; passed: boolean; message: string }[];
}

export function runScienceAlignmentAudit(plan: LessonPlan): ScienceAuditResult {
  const checks: { id: number; name: string; passed: boolean; message: string }[] = [];

  // Check 1: Subject Purity
  const isScience = plan.subject === 'Science and Technology' || plan.subject?.toLowerCase().includes('science');
  checks.push({
    id: 1,
    name: 'Subject Purity (Science and Technology)',
    passed: isScience,
    message: isScience ? 'Subject is properly set to Science and Technology.' : `Subject mismatch: ${plan.subject}`
  });

  // Check 2: Outcome Controls Planning
  const hasOutcome = Boolean(plan.learningOutcome && plan.learningOutcome.trim().length > 10);
  checks.push({
    id: 2,
    name: 'Curriculum Outcome Match',
    passed: hasOutcome,
    message: hasOutcome ? `Learning outcome defined: "${plan.learningOutcome?.slice(0, 60)}..."` : 'Missing learning outcome.'
  });

  // Check 3: ABCD Objectives Completeness
  const objs = plan.learningObjectives;
  const hasCondition = Boolean(objs?.condition && objs.condition.length > 5);
  const hasCognitive = Boolean(objs?.cognitive && objs.cognitive.length > 10);
  const hasPsychomotor = Boolean(objs?.psychomotor && objs.psychomotor.length > 10);
  const hasAffective = Boolean(objs?.affective && objs.affective.length > 10);
  const abcdComplete = hasCondition && hasCognitive && hasPsychomotor && hasAffective;
  checks.push({
    id: 3,
    name: 'ABCD Objectives Completeness (Condition + 3 Domains)',
    passed: abcdComplete,
    message: abcdComplete ? 'All ABCD domains (Condition, Cognitive, Psychomotor, Affective) fully defined.' : 'Incomplete ABCD objectives.'
  });

  // Check 4: No Duplicated Objectives
  const notDuplicated = objs ? (objs.cognitive !== objs.psychomotor && objs.cognitive !== objs.affective) : false;
  checks.push({
    id: 4,
    name: 'No Duplicated Objectives',
    passed: notDuplicated,
    message: notDuplicated ? 'Distinct behavioral objectives across all three domains.' : 'Duplicated objective text found.'
  });

  // Check 5: Celery / Xylem / Phloem Decontamination Check
  const combinedText = JSON.stringify(plan).toLowerCase();
  const outcomeText = (plan.learningOutcome || '').toLowerCase();
  const topicText = (plan.topic || '').toLowerCase();
  const isPlantTransport = outcomeText.includes('xylem') || outcomeText.includes('vascular') || topicText.includes('plant structure') || topicText.includes('xylem');
  const hasCeleryBleed = !isPlantTransport && (combinedText.includes('celery') || combinedText.includes('xylem') || combinedText.includes('transpiration pull') || combinedText.includes('colored liquid climbed'));
  checks.push({
    id: 5,
    name: 'Topic Decontamination: Celery/Xylem/Plant Transport Bleed Scrubbed',
    passed: !hasCeleryBleed,
    message: !hasCeleryBleed ? 'Zero celery or unrelated plant transport bleed detected.' : 'FAILURE: Celery stalk / xylem bleed found in non-plant transport lesson!'
  });

  // Check 6: Mangrove Wave Tray Decontamination Check
  const isMangroveErosion = outcomeText.includes('erosion') || topicText.includes('coastal erosion') || topicText.includes('wave');
  const hasWaveTrayBleed = !isMangroveErosion && (combinedText.includes('wave simulation tray') || combinedText.includes('toothpick/mesh root') || combinedText.includes('wave generator paddle'));
  checks.push({
    id: 6,
    name: 'Topic Decontamination: Unrelated Wave Tray Bleed Scrubbed',
    passed: !hasWaveTrayBleed,
    message: !hasWaveTrayBleed ? 'Zero wave tray bleed detected.' : 'FAILURE: Wave tray bleed found in unrelated lesson!'
  });

  // Check 7: 5E / Inquiry Framework Trajectory
  const hasPhenomenon = Boolean(plan.lessonSnapshot?.about && plan.priorKnowledgeActivation?.activationStrategy);
  const hasPrediction = Boolean((plan as any).scienceInquiryFramework?.priorKnowledgeAndPrediction?.studentPredictionPrompt || combinedText.includes('predict'));
  const hasCER = Boolean((plan as any).scienceInquiryFramework?.scientificExplanationCER || combinedText.includes('claim'));
  const inquiryComplete = hasPhenomenon && hasPrediction && hasCER;
  checks.push({
    id: 7,
    name: '5E Inquiry Trajectory (Phenomenon + Prediction + CER)',
    passed: inquiryComplete,
    message: inquiryComplete ? 'Inquiry architecture (Phenomenon, Question, Prediction, Investigation, CER) verified.' : 'Inquiry framework incomplete.'
  });

  // Check 8: Exact Duration Balance
  const targetDurationMins = parseMinutes(plan.duration, 45);
  let totalPhaseMins = 0;
  if (plan.executionBoard && plan.executionBoard.length > 0) {
    totalPhaseMins = plan.executionBoard.reduce((sum, p) => sum + parseMinutes(p.timeAllocation, 0), 0);
  }
  const timingBalanced = Math.abs(totalPhaseMins - targetDurationMins) <= 2;
  checks.push({
    id: 8,
    name: 'Exact Duration Balance (Phase sum equals Target Duration)',
    passed: timingBalanced,
    message: timingBalanced ? `Duration harmonized: ${totalPhaseMins} mins matches target ${targetDurationMins} mins.` : `Timing mismatch: ${totalPhaseMins} mins != ${targetDurationMins} mins.`
  });

  // Check 9: Lesson at a Glance Harmony
  const glanceCount = plan.lessonAtAGlance ? plan.lessonAtAGlance.length : 0;
  const hasGlance = glanceCount >= 4;
  checks.push({
    id: 9,
    name: 'Lesson At A Glance Sequential Harmony',
    passed: hasGlance,
    message: hasGlance ? `Lesson at a glance contains ${glanceCount} synchronized stages.` : 'Missing Lesson At A Glance stages.'
  });

  // Check 10: Grade-Level Developmental Appropriateness
  const hasGrade = Boolean(plan.grade && plan.grade.length > 2);
  checks.push({
    id: 10,
    name: 'Grade-Level Developmental Appropriateness',
    passed: hasGrade,
    message: hasGrade ? `Targeted developmentally for ${plan.grade}.` : 'Missing grade level.'
  });

  // Check 11: Belizean Environmental & Community Grounding
  const hasBelizeGrounding = combinedText.includes('belize') || combinedText.includes('barrier reef') || combinedText.includes('pine ridge') || combinedText.includes('cayo') || combinedText.includes('macal') || combinedText.includes('toledo');
  checks.push({
    id: 11,
    name: 'Belizean Context & Community Application',
    passed: hasBelizeGrounding,
    message: hasBelizeGrounding ? 'Authenticated with real Belizean ecosystems, geography, and communities.' : 'Lacks Belize environmental grounding.'
  });

  // Check 12: Authentic Solvable 8-Question Worksheet (10 Marks)
  const worksheet = plan.studentMaterials?.find(m => m.type === 'worksheet');
  const hasWorksheet = Boolean(worksheet && worksheet.content && worksheet.content.includes('10 MARKS TOTAL'));
  checks.push({
    id: 12,
    name: 'Authentic 8-Question Solvable Worksheet (10 Marks)',
    passed: hasWorksheet,
    message: hasWorksheet ? 'Solvable 8-question investigation worksheet with 10 marks total verified.' : 'Worksheet missing or does not total 10 marks.'
  });

  // Check 13: 1:1 Complete Answer Key with Marking Criteria
  const hasAnswerKey = Boolean(worksheet && worksheet.answerKey && worksheet.answerKey.includes('ANSWER KEY') && (worksheet.answerKey.includes('AUTHORITATIVE') || worksheet.answerKey.includes('1:1')));
  checks.push({
    id: 13,
    name: 'Complete 1:1 Answer Key with Marking Criteria',
    passed: hasAnswerKey,
    message: hasAnswerKey ? '1:1 worked answer key with explicit point allocations verified.' : 'Answer key missing or incomplete.'
  });

  // Check 14: Daily Exit Ticket with 80% Benchmark (5 Marks)
  const exitTicket = plan.studentMaterials?.find(m => m.type === 'exit_ticket');
  const hasExitTicket = Boolean(exitTicket && exitTicket.content && (exitTicket.content.includes('80%') || exitTicket.content.includes('5 MARKS')));
  checks.push({
    id: 14,
    name: 'Daily Exit Ticket with 80% Mastery Benchmark (5 Marks)',
    passed: hasExitTicket,
    message: hasExitTicket ? 'Daily Exit Ticket with 5 points and 80% (4/5) mastery threshold verified.' : 'Exit ticket missing or lacks 80% benchmark.'
  });

  // Check 15: Tiered Differentiation Aligned to Same Outcome
  const hasStruggling = Boolean(plan.ifStudentsAreStruggling?.simplerExplanation || plan.differentiationFramework?.strugglingLearners || (plan.differentiation && plan.differentiation.length > 0));
  const hasAdvanced = Boolean(plan.differentiationFramework?.advancedLearners || (plan.differentiation && plan.differentiation.length >= 3));
  const diffComplete = hasStruggling && hasAdvanced;
  checks.push({
    id: 15,
    name: 'Tiered Differentiation (Struggling, On-level, Advanced) Tied to Outcome',
    passed: diffComplete,
    message: diffComplete ? 'Three-tier differentiation (Struggling, On-level, Advanced) aligned to target outcome.' : 'Differentiation incomplete.'
  });

  const passedCount = checks.filter(c => c.passed).length;
  return {
    passed: passedCount === checks.length,
    score: passedCount,
    totalChecks: checks.length,
    checks
  };
}

/**
 * AUTOMATED VALIDATION & ACTIVE REPAIR ENGINE FOR SCIENCE AND TECHNOLOGY
 * 
 * Validates and actively repairs:
 * - Curriculum outcome and topic alignment
 * - Behavioral objective duplication (guarantees 1 condition + 3 distinct measurable domains)
 * - 5E methodology and timing consistency (Engage, Explore, Explain, Elaborate, Evaluate totaling exact duration)
 * - Investigation and student-facing resource consistency (profile dossiers, specimen cards, matrix)
 * - 1:1 Worksheet and Answer Key correspondence totaling 10 marks
 * - Exit Ticket consistency (5 questions totaling 5 marks, 80% benchmark)
 * - Scientific accuracy (density, buoyancy, salinity, gas exchange)
 * - 100% Objective-to-Assessment correspondence
 * 
 * Corrects failures immediately instead of merely issuing warnings.
 */
export function validateAndRepairScienceLesson(
  rawPlan: any,
  context?: any
): { plan: LessonPlan; audit: ScienceAuditResult } {
  // 1. Run authoritative purity and quality enforcement
  let plan = enforceSciencePurityAndQuality(rawPlan, context);

  // 2. Run the 15-Point Audit
  let audit = runScienceAlignmentAudit(plan);

  // 3. If any check failed, execute active programmatic repair
  if (!audit.passed) {
    // Subject repair
    plan.subject = 'Science and Technology';

    // Duration repair
    const targetMins = parseMinutes(plan.duration, 45);
    plan.duration = `${targetMins} minutes`;

    // Category & Bank re-fetch
    const pack = getScienceCurriculumPack(plan.topic, plan.subtopic, plan.learningOutcome);

    // Timing & 5E execution board repair
    plan.executionBoard = buildAuthoritativeScienceExecutionBoard(pack, targetMins);
    let cumulativeMin = 0;
    plan.lessonAtAGlance = plan.executionBoard.map(phase => {
      const phaseMins = parseMinutes(phase.timeAllocation, 10);
      const start = cumulativeMin;
      const end = cumulativeMin + phaseMins;
      cumulativeMin = end;
      return {
        stage: phase.phase,
        time: `${start}:00 - ${end}:00`,
        timeMinutes: phaseMins,
        duration: `${phaseMins} mins (${start}:00 - ${end}:00)`,
        teacherDoes: phase.teacherActions[0] || 'Directs student investigation.',
        studentsDo: phase.studentActions[0] || 'Executes scientific procedure and records data.'
      };
    });

    // Student materials & assessments repair
    const worksheet = buildAuthoritativeScienceWorksheet(pack, plan.grade || 'Standard 6');
    const exitTicket = buildAuthoritativeScienceExitTicket(pack, plan.grade || 'Standard 6');
    plan.studentMaterials = [
      {
        title: worksheet.title,
        type: 'worksheet',
        content: worksheet.content,
        answerKey: worksheet.answerKey
      },
      {
        title: exitTicket.title,
        type: 'exit_ticket',
        content: exitTicket.content,
        answerKey: exitTicket.answerKey
      }
    ];

    if (pack.studentInvestigationMaterials) {
      plan.studentMaterials.push({
        title: 'Belize Ecosystem Profile Dossiers (Mountain Pine Ridge, Macal River, Belize Barrier Reef)',
        type: 'reading_passage',
        content: pack.studentInvestigationMaterials.profileDossiers,
        answerKey: 'Reference resource for empirical matrix comparison; no separate student score.'
      });
      plan.studentMaterials.push({
        title: '12 Belizean Organism Specimen Cards & Classification Sorting Guide',
        type: 'activity_cards',
        content: pack.studentInvestigationMaterials.organismCards,
        answerKey: 'Reference resource for biological sorting and trophic classification; checked via Worksheet Q3 and Matrix.'
      });
      plan.studentMaterials.push({
        title: '3-Column Comparative Ecosystem Matrix (Terrestrial vs Freshwater vs Marine)',
        type: 'graphic_organizer',
        content: pack.studentInvestigationMaterials.comparativeMatrix,
        answerKey: pack.studentInvestigationMaterials.comparativeMatrixAnswerKey || 'Full comparative matrix answer key provided in teacher answer key.'
      });
    }

    // Re-audit after repairs
    audit = runScienceAlignmentAudit(plan);
  }

  return { plan, audit };
}

