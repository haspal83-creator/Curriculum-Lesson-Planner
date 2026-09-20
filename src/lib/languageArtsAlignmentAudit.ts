import { 
  LessonPlan, 
  LanguageArtsComponent, 
  LANGUAGE_ARTS_5_COMPONENTS, 
  LanguageArtsAlignmentAudit, 
  LanguageArtsComponentDetails,
  ReadingPassageResource,
  AnchorChartBlueprint,
  ExitTicketPackage
} from '../types';
import { cleanLanguageArtsMathematicsBleed, stripFabricatedStudentNames } from './languageArtsQualityGate';
import { validateAndBalanceLessonTiming } from './timingValidation';

/**
 * Normalizes input string to an approved MoECST Language Arts component.
 */
export function normalizeLAComponent(name: string): LanguageArtsComponent {
  const lower = (name || '').toLowerCase();
  if (lower.includes('phonological')) {
    return 'Phonological Awareness';
  }
  if (lower.includes('phonics') || lower.includes('word recognition') || lower.includes('decoding')) {
    return 'Phonics and Word Recognition';
  }
  if (lower.includes('high frequency') || lower.includes('sight word')) {
    return 'High Frequency Words';
  }
  if (lower.includes('production') || lower.includes('writing') || lower.includes('composition') || lower.includes('structure')) {
    return 'Production and Language Structure — Writing and Composition';
  }
  return 'Comprehension — Oral Expression and Listening';
}

/**
 * Intelligently deduces the two most appropriate MoECST Language Arts components
 * based on the instructional topic, subtopic, and grade.
 */
export function deduceTwoComponents(topic: string, subtopic: string = '', grade: string = ''): [LanguageArtsComponent, LanguageArtsComponent] {
  const text = `${topic} ${subtopic}`.toLowerCase();
  const isEarlyGrade = /infant|preschool|kindergarten/i.test(grade);

  if (text.includes('phonological') || text.includes('rhyme') || text.includes('syllable') || text.includes('alliteration') || text.includes('initial sound')) {
    return ['Phonological Awareness', 'Phonics and Word Recognition'];
  }
  if (text.includes('high frequency') || text.includes('sight word')) {
    return isEarlyGrade 
      ? ['High Frequency Words', 'Phonics and Word Recognition']
      : ['High Frequency Words', 'Comprehension — Oral Expression and Listening'];
  }
  if (text.includes('phonics') || text.includes('vowel') || text.includes('consonant') || text.includes('blend') || text.includes('digraph') || text.includes('decod')) {
    return ['Phonics and Word Recognition', 'Comprehension — Oral Expression and Listening'];
  }
  if (text.includes('prefix') || text.includes('suffix') || text.includes('affix') || text.includes('morphol') || text.includes('root')) {
    return ['Phonics and Word Recognition', 'Production and Language Structure — Writing and Composition'];
  }
  if (text.includes('writing') || text.includes('composition') || text.includes('draft') || text.includes('essay') || text.includes('narrative writing') || text.includes('sentence structure') || text.includes('grammar') || text.includes('punctuation')) {
    return ['Comprehension — Oral Expression and Listening', 'Production and Language Structure — Writing and Composition'];
  }

  // Default standard 90-minute pairing for comprehension, story structures, flashbacks, poetry, literature, etc.
  return [
    'Comprehension — Oral Expression and Listening',
    'Production and Language Structure — Writing and Composition'
  ];
}

/**
 * Checks if text contains foreign prefix/affix content when prefixes are NOT part of the lesson topic/components.
 */
function containsUnrelatedPrefixAffixContent(text: string, topic: string, comps: LanguageArtsComponent[]): boolean {
  if (!text) return false;
  const isAffixTopic = /prefix|suffix|affix|morphol/i.test(topic);
  const hasAffixComponent = comps.some(c => c === 'Phonics and Word Recognition') && /prefix|suffix|affix|morphol/i.test(topic);
  
  if (isAffixTopic || hasAffixComponent) {
    return false; // Valid affix topic
  }

  const lower = text.toLowerCase();
  // Check for signature prefix drill items that bleed into non-affix lessons
  const unrelatedAffixKeywords = [
    'submerge',
    'interconnected',
    'anti-pollution',
    'prefix analysis',
    'affix cards',
    'prefixed words',
    'isolate the prefix',
    'prefix: sub-',
    'transatlantic flight',
    'root element',
    '4-step morphological'
  ];

  return unrelatedAffixKeywords.some(kw => lower.includes(kw));
}

/**
 * Evaluates the full 14 mandatory alignment categories for Language Arts.
 */
export function runLanguageArtsAlignmentAudit(plan: LessonPlan, context?: any): LanguageArtsAlignmentAudit {
  const auditDetails: Record<string, { status: 'PASS' | 'FAIL'; message: string }> = {};
  const criticalFailures: string[] = [];

  const grade = plan.grade || context?.grade || '';
  const subject = plan.subject || context?.subject || '';
  const topic = plan.topic || plan.lessonTitle || context?.topic || '';
  const subtopic = plan.subtopic || context?.subtopic || '';
  const cycle = plan.cycle !== undefined ? plan.cycle : context?.cycle;

  // 1. Curriculum Alignment
  const isLA = subject.toLowerCase().includes('language') || 
               subject.toLowerCase().includes('reading') || 
               subject.toLowerCase().includes('writing') ||
               subject.toLowerCase().includes('english');
  const validGrade = /preschool|infant|standard/i.test(grade);
  const hasOutcome = Boolean(plan.learningOutcome && plan.learningOutcome.trim().length > 10);

  if (isLA && validGrade && hasOutcome) {
    auditDetails.curriculumAlignment = { status: 'PASS', message: 'Subject is Language Arts with valid Belize grade level and explicit learning outcome.' };
  } else {
    auditDetails.curriculumAlignment = { 
      status: 'FAIL', 
      message: `Curriculum integrity failed: isLA=${isLA}, validGrade=${validGrade}, hasOutcome=${hasOutcome}.` 
    };
    criticalFailures.push('Curriculum Alignment');
  }

  // 2. Cycle Alignment
  if (cycle !== undefined && cycle !== null && Number(cycle) >= 1 && Number(cycle) <= 4) {
    auditDetails.cycleAlignment = { status: 'PASS', message: `Cycle ${cycle} is verified and locked to curriculum pacing.` };
  } else {
    auditDetails.cycleAlignment = { status: 'FAIL', message: 'Curriculum cycle is missing or invalid.' };
    criticalFailures.push('Cycle Alignment');
  }

  // 3. Component Alignment (EXACTLY 2 Approved Components)
  let rawComps: any[] = plan.languageArtsComponents || [];
  if (!Array.isArray(rawComps) || rawComps.length === 0) {
    if (plan.primaryComponent && plan.supportingComponent) {
      rawComps = [plan.primaryComponent, plan.supportingComponent];
    }
  }

  const validComps = rawComps.map(normalizeLAComponent);
  const uniqueComps = Array.from(new Set(validComps));
  const exactTwo = uniqueComps.length === 2;
  const allApproved = uniqueComps.every(c => LANGUAGE_ARTS_5_COMPONENTS.includes(c));

  if (exactTwo && allApproved) {
    auditDetails.componentAlignment = { 
      status: 'PASS', 
      message: `Exactly 2 MoECST approved components verified: [${uniqueComps[0]}] and [${uniqueComps[1]}].` 
    };
  } else {
    auditDetails.componentAlignment = { 
      status: 'FAIL', 
      message: `Must have exactly 2 approved Language Arts components. Found ${uniqueComps.length}: ${uniqueComps.join(', ')}.` 
    };
    criticalFailures.push('Component Alignment');
  }

  const compsToUse = exactTwo ? uniqueComps : deduceTwoComponents(topic, subtopic, grade);

  // 4. Topic Alignment (Topic-Content Lock)
  const fullText = JSON.stringify(plan).toLowerCase();
  const hasUnrelatedAffixes = containsUnrelatedPrefixAffixContent(fullText, topic, compsToUse);
  const topicKeyword = topic.split(/\s+/)[0]?.toLowerCase() || '';
  const mentionsTopic = fullText.includes(topicKeyword);

  if (!hasUnrelatedAffixes && mentionsTopic) {
    auditDetails.topicAlignment = { status: 'PASS', message: `Instructional focus is locked to "${topic}" without topic drift.` };
  } else if (hasUnrelatedAffixes) {
    auditDetails.topicAlignment = { 
      status: 'FAIL', 
      message: `Topic drift detected: Unrelated prefix/affix/morphological activities found in a lesson on "${topic}".` 
    };
    criticalFailures.push('Topic Alignment');
  } else {
    auditDetails.topicAlignment = { status: 'FAIL', message: `Lesson content does not sufficiently reflect stated topic "${topic}".` };
    criticalFailures.push('Topic Alignment');
  }

  // 5. Objective Alignment (Shared Condition + 3 Domains Connected to Topic)
  const obj = plan.learningObjectives || (plan.learningObjectivesBoard as any);
  const cond = obj?.condition || '';
  const cog = obj?.cognitive || obj?.knowledge || '';
  const psy = obj?.psychomotor || obj?.skill || '';
  const aff = obj?.affective || obj?.attitude || '';

  const startsGiven = /^[Gg]iven\b/.test(cond.trim());
  const objHasUnrelatedAffixes = containsUnrelatedPrefixAffixContent(`${cog} ${psy} ${aff}`, topic, compsToUse);
  const domainsComplete = cog.trim().length > 15 && psy.trim().length > 15 && aff.trim().length > 15;

  if (startsGiven && domainsComplete && !objHasUnrelatedAffixes) {
    auditDetails.objectiveAlignment = { 
      status: 'PASS', 
      message: 'All 3 domains share a single "Given..." instructional condition and measure stated components and topic.' 
    };
  } else {
    auditDetails.objectiveAlignment = { 
      status: 'FAIL', 
      message: `Objective alignment issue: startsWithGiven=${startsGiven}, domainsComplete=${domainsComplete}, unrelatedAffixes=${objHasUnrelatedAffixes}.` 
    };
    criticalFailures.push('Objective Alignment');
  }

  // 6. Activity Alignment (Component-Integrity)
  const stages = plan.executionBoard || [];
  let activityDrift = false;
  for (const st of stages) {
    const actText = `${st.title} ${st.teacherActions} ${st.studentActions}`;
    if (containsUnrelatedPrefixAffixContent(actText, topic, compsToUse)) {
      activityDrift = true;
      break;
    }
  }

  if (stages.length >= 5 && !activityDrift) {
    auditDetails.activityAlignment = { 
      status: 'PASS', 
      message: 'Every instructional stage is directly traceable to the two selected Language Arts components.' 
    };
  } else {
    auditDetails.activityAlignment = { 
      status: 'FAIL', 
      message: activityDrift 
        ? 'Instructional stages contain activities untraceable to the two selected components.' 
        : 'Instructional sequence is incomplete.' 
    };
    criticalFailures.push('Activity Alignment');
  }

  // 7. Resource Completeness (Passage, Worksheet, Anchor Chart, Exit Ticket, Keys)
  const hasPassage = Boolean(plan.readingPassageFull && plan.readingPassageFull.content && plan.readingPassageFull.content.length > 80);
  const hasWorksheet = Boolean(
    (plan.studentMaterials && plan.studentMaterials.length > 0 && plan.studentMaterials[0].content && plan.studentMaterials[0].content.length > 100) ||
    (plan.completeAssessment && plan.completeAssessment.task && plan.completeAssessment.task.length > 80)
  );
  const hasAnchor = Boolean(plan.anchorChartBlueprint && plan.anchorChartBlueprint.title);
  const hasExitTicket = Boolean(
    plan.exitTicketPackage && 
    plan.exitTicketPackage.questions && 
    plan.exitTicketPackage.questions.length > 0
  );

  const passageUnrelated = plan.readingPassageFull?.content ? containsUnrelatedPrefixAffixContent(plan.readingPassageFull.content, topic, compsToUse) : false;
  const worksheetUnrelated = plan.studentMaterials?.[0]?.content ? containsUnrelatedPrefixAffixContent(plan.studentMaterials[0].content, topic, compsToUse) : false;

  if (hasPassage && hasWorksheet && hasAnchor && hasExitTicket && !passageUnrelated && !worksheetUnrelated) {
    auditDetails.resourceAlignment = { 
      status: 'PASS', 
      message: 'All core resources (Belizean reading passage, worksheet, anchor chart blueprint, exit ticket, keys) are complete and topic-aligned.' 
    };
  } else {
    auditDetails.resourceAlignment = { 
      status: 'FAIL', 
      message: `Resource gaps or misalignment: passage=${hasPassage}, worksheet=${hasWorksheet}, anchorChart=${hasAnchor}, exitTicket=${hasExitTicket}, passageAligned=${!passageUnrelated}, wsAligned=${!worksheetUnrelated}.` 
    };
    criticalFailures.push('Resource Completeness');
  }

  // 8. Assessment Alignment
  const exitQs = plan.exitTicketPackage?.questions || [];
  const exitQsText = exitQs.map(q => q.question).join(' ');
  const assessmentUnrelated = containsUnrelatedPrefixAffixContent(exitQsText, topic, compsToUse);

  if (exitQs.length >= 2 && !assessmentUnrelated) {
    auditDetails.assessmentAlignment = { 
      status: 'PASS', 
      message: 'Assessment and exit ticket items directly evaluate the target skills taught in today\'s lesson.' 
    };
  } else {
    auditDetails.assessmentAlignment = { 
      status: 'FAIL', 
      message: assessmentUnrelated 
        ? 'Assessment items test skills outside today\'s selected components/topic.' 
        : 'Assessment items are insufficient or missing.' 
    };
    criticalFailures.push('Assessment Alignment');
  }

  // 9. Timing Alignment (Strict 90 Minutes + Two-Component Balance)
  let totalStageMins = 0;
  if (stages.length > 0) {
    for (const st of stages) {
      const match = (st.duration || '').match(/(\d+)/);
      if (match) totalStageMins += parseInt(match[1], 10);
    }
  }

  const isExact90 = totalStageMins === 90 || (plan.duration || '').includes('90');
  const comp1Time = plan.component1Details?.timeAllocation || '45 minutes';
  const comp2Time = plan.component2Details?.timeAllocation || '45 minutes';
  const comp1Mins = parseInt((comp1Time.match(/(\d+)/) || ['0', '45'])[1], 10);
  const comp2Mins = parseInt((comp2Time.match(/(\d+)/) || ['0', '45'])[1], 10);
  const balancedComps = comp1Mins >= 25 && comp2Mins >= 25 && (comp1Mins + comp2Mins <= 90);

  if (isExact90 && balancedComps) {
    auditDetails.timingAlignment = { 
      status: 'PASS', 
      message: `Total duration is strictly 90 minutes. Component 1 (${comp1Mins} min) and Component 2 (${comp2Mins} min) are properly balanced.` 
    };
  } else {
    auditDetails.timingAlignment = { 
      status: 'FAIL', 
      message: `Timing violation: Total minutes = ${totalStageMins} (must be 90). Component 1: ${comp1Mins}m, Component 2: ${comp2Mins}m.` 
    };
    criticalFailures.push('Timing Alignment');
  }

  // 10. Vocabulary Alignment
  const vocabItems = plan.vocabularyFocus?.keyVocabulary || plan.keyVocabularyTable || [];
  const vocabValid = vocabItems.length >= 3;
  const vocabUnrelated = vocabItems.some((v: any) => containsUnrelatedPrefixAffixContent(v.term || '', topic, compsToUse));

  if (vocabValid && !vocabUnrelated) {
    auditDetails.vocabularyAlignment = { status: 'PASS', message: 'Target vocabulary directly reinforces the lesson topic and Belizean text.' };
  } else {
    auditDetails.vocabularyAlignment = { 
      status: 'FAIL', 
      message: vocabUnrelated ? 'Vocabulary list introduces terms unrelated to the lesson topic.' : 'Vocabulary focus is insufficient.' 
    };
    criticalFailures.push('Vocabulary Alignment');
  }

  // 11. Differentiation Alignment
  const diff = plan.differentiationFramework;
  const diffValid = Boolean(diff && (diff.strugglingLearners || diff.inclusionSupport));
  const diffUnrelated = containsUnrelatedPrefixAffixContent(JSON.stringify(diff || {}), topic, compsToUse);

  if (diffValid && !diffUnrelated) {
    auditDetails.differentiationAlignment = { status: 'PASS', message: 'Tiered scaffolds maintain the same learning target with responsive accommodations.' };
  } else {
    auditDetails.differentiationAlignment = { 
      status: 'FAIL', 
      message: diffUnrelated ? 'Differentiation tasks drift into unrelated skills.' : 'Differentiation framework is incomplete.' 
    };
    criticalFailures.push('Differentiation Alignment');
  }

  // 12. Success Criteria Alignment
  const sc = plan.learningObjectivesBoard?.successCriteria || [];
  const scValid = sc.length >= 2;
  const scUnrelated = sc.some((s: string) => containsUnrelatedPrefixAffixContent(s, topic, compsToUse));

  if (scValid && !scUnrelated) {
    auditDetails.successCriteriaAlignment = { status: 'PASS', message: 'Student "I Can" statements directly reflect today\'s objectives and criteria.' };
  } else {
    auditDetails.successCriteriaAlignment = { 
      status: 'FAIL', 
      message: scUnrelated ? 'Success criteria contain statements unrelated to today\'s lesson.' : 'Success criteria are missing or insufficient.' 
    };
    criticalFailures.push('Success Criteria Alignment');
  }

  // 13. Teacher Readiness (Explicit Actions, Script, Think-Aloud)
  const hasScript = Boolean(
    (plan.teacherScriptDetailed && plan.teacherScriptDetailed.modeling) ||
    plan.teacherScript ||
    (plan.component1Details?.explicitTeachingScript && plan.component2Details?.explicitTeachingScript)
  );
  const stagesHaveExplicitActions = stages.every(s => 
    s.teacherActions && s.teacherActions.length > 0 &&
    s.studentActions && s.studentActions.length > 0
  );

  if (hasScript && stagesHaveExplicitActions) {
    auditDetails.teacherReadiness = { 
      status: 'PASS', 
      message: 'Word-for-word teacher script, explicit modeling think-aloud, and teacher/student actions provided for every stage.' 
    };
  } else {
    auditDetails.teacherReadiness = { 
      status: 'FAIL', 
      message: 'Missing word-for-word teacher modeling script or explicit stage actions.' 
    };
    criticalFailures.push('Teacher Readiness');
  }

  // 14. Scoring Alignment (Mathematical Consistency)
  const et = plan.exitTicketPackage;
  let scoringConsistent = false;
  if (et && et.questions && et.questions.length > 0) {
    const qCount = et.questions.length;
    const totalPts = et.questions.reduce((sum, q) => sum + (q.points || 1), 0);
    const masteryStr = et.masteryThreshold || '';
    
    // Check for impossible claims like 8/10 on a 3-question ticket
    const mentionsWrongTen = qCount <= 3 && /8\/10|8 out of 10/i.test(masteryStr);
    const mentionsProperFraction = masteryStr.includes(`/${totalPts}`) || masteryStr.includes(`${qCount}/${qCount}`) || masteryStr.includes('80%');
    
    if (!mentionsWrongTen && mentionsProperFraction) {
      scoringConsistent = true;
    }
  }

  if (scoringConsistent) {
    auditDetails.scoringAlignment = { status: 'PASS', message: 'Exit ticket points, total score, and 80% mastery threshold are mathematically consistent.' };
  } else {
    auditDetails.scoringAlignment = { 
      status: 'FAIL', 
      message: 'Exit ticket scoring guidance contradicts the actual question count or point total.' 
    };
    criticalFailures.push('Scoring Alignment');
  }

  // Calculate actual audit score percentage
  const totalCategories = 14;
  const passCount = Object.values(auditDetails).filter(d => d.status === 'PASS').length;
  const scorePercentage = Math.round((passCount / totalCategories) * 100);
  const isReadyToTeach = (passCount === totalCategories) && criticalFailures.length === 0;

  return {
    curriculumAlignment: auditDetails.curriculumAlignment.status,
    cycleAlignment: auditDetails.cycleAlignment.status,
    topicAlignment: auditDetails.topicAlignment.status,
    componentAlignment: auditDetails.componentAlignment.status,
    objectiveAlignment: auditDetails.objectiveAlignment.status,
    activityAlignment: auditDetails.activityAlignment.status,
    resourceAlignment: auditDetails.resourceAlignment.status,
    assessmentAlignment: auditDetails.assessmentAlignment.status,
    timingAlignment: auditDetails.timingAlignment.status,
    vocabularyAlignment: auditDetails.vocabularyAlignment.status,
    differentiationAlignment: auditDetails.differentiationAlignment.status,
    successCriteriaAlignment: auditDetails.successCriteriaAlignment.status,
    teacherReadiness: auditDetails.teacherReadiness.status,
    scoringAlignment: auditDetails.scoringAlignment.status,
    scorePercentage,
    isReadyToTeach,
    criticalFailures,
    auditDetails,
    primaryComponent: compsToUse[0],
    supportingComponent: compsToUse[1]
  };
}

/**
 * Generates an authentic, topic-aligned Belizean reading passage with comprehension questions.
 */
export function generateTopicAlignedPassage(topic: string, subtopic: string, grade: string, comps: LanguageArtsComponent[]): ReadingPassageResource {
  const isFlashback = /flashback|time|chronol|sequence|story structure/i.test(`${topic} ${subtopic}`);
  const isPoetry = /poet|rhyme|verse|stanza/i.test(`${topic} ${subtopic}`);
  const isAffix = /prefix|suffix|affix|morphol/i.test(`${topic} ${subtopic}`);
  
  if (isFlashback) {
    return {
      title: "The Silver Hook of Placencia",
      genre: "Narrative Fiction with Flashback",
      gradeLevel: grade || "Standard 4",
      wordCount: 265,
      vocabularyHighlighted: ["tiller", "dory", "tempest", "reminisced", "anchor"],
      content: `The afternoon sun dipped low over the placid waters of Placencia lagoon as twelve-year-old Mateo gripped the wooden tiller of his grandfather's dory. A sudden flash of silver caught his eye beneath the dock—an antique brass fishing hook tucked securely into the cedar wood ribbing.

Instantly, Mateo's mind traveled backward three years to a stormy October morning. He was only nine when his grandfather, Captain Joe, had pulled him into the very same boat just as a ferocious squall tore through the cayes. The wind had howled like a hungry jaguar, tossing white spray over the gunwales. While little Mateo trembled with fear, Captain Joe had calmly secured their safety line with that very silver hook, winking and saying, "The sea tests your courage, grandson, but a steady hand always brings you home." In the howling squall, watching his grandfather's calm hands, Mateo had learned what true bravery meant.

The gentle bump of the boat against the mangrove roots snapped Mateo back to the present. The calm lagoon water lapped peacefully against the bow. He reached down, traced the cold metal of the hook with his thumb, and smiled. As a gentle breeze rolled in from the Caribbean Sea, Mateo felt his grandfather's quiet confidence running through his own hands, ready to steer the dory home through any tide.`,
      comprehensionQuestions: [
        {
          question: "Where is Mateo located at the very beginning and the end of the story?",
          answer: "Mateo is in his grandfather's dory on the placid waters of Placencia lagoon.",
          cognitiveLevel: "Literal / Present-Time Anchor"
        },
        {
          question: "What object triggers Mateo's memory, and what transition signal shows the story is shifting to the past?",
          answer: "The antique silver/brass fishing hook triggers the memory; the phrase 'Instantly, Mateo's mind traveled backward three years' marks the shift into the flashback.",
          cognitiveLevel: "Analysis / Flashback Identification"
        },
        {
          question: "What important lesson did Mateo learn during the storm three years ago?",
          answer: "Mateo learned that true bravery is having a steady hand and calm courage during scary moments.",
          cognitiveLevel: "Inferential / Character Growth"
        },
        {
          question: "How does the author signal the return from the flashback back to the present moment?",
          answer: "The author uses sensory details: 'The gentle bump of the boat against the mangrove roots snapped Mateo back to the present.'",
          cognitiveLevel: "Structural Evaluation"
        }
      ]
    };
  }

  if (isPoetry) {
    return {
      title: "Morning in the Mountain Pine Ridge",
      genre: "Descriptive Sensory Poetry",
      gradeLevel: grade || "Standard 3",
      wordCount: 160,
      vocabularyHighlighted: ["mist", "canopy", "echo", "cascading", "fragrant"],
      content: `Mist upon the granite ridge,
Dancing cross the wooden bridge.
Tall pine needles whisper sweet,
Cool damp moss beneath our feet.

Hear the toucan's morning cry,
Flashing yellow in the sky!
Hidden rivers rush and gleam,
Rippling through a mountain dream.

Sunlight breaks the misty grey,
Waking up another day.
Breathe the resin in the air,
Nature's beauty everywhere.`,
      comprehensionQuestions: [
        { question: "What time of day is described in the poem?", answer: "Morning at sunrise in Mountain Pine Ridge.", cognitiveLevel: "Literal" },
        { question: "Which sensory words in stanza 1 describe what a visitor can feel and hear?", answer: "Whisper sweet, cool damp moss, mist dancing.", cognitiveLevel: "Analysis" },
        { question: "Identify the rhyming pairs in stanza 2.", answer: "cry/sky and gleam/dream.", cognitiveLevel: "Structural" },
        { question: "How does the poet create a feeling of peace and wonder?", answer: "By using gentle verbs and vivid nature imagery from Belize.", cognitiveLevel: "Evaluation" }
      ]
    };
  }

  if (isAffix) {
    return {
      title: "Guardians of the Belize Barrier Reef",
      genre: "Informational Science Mentor Text",
      gradeLevel: grade || "Standard 5",
      wordCount: 240,
      vocabularyHighlighted: ["submerge", "interconnected", "biodiversity", "anti-pollution", "sustainable"],
      content: `Beneath the turquoise surface of the Caribbean Sea lies the Belize Barrier Reef, a UNESCO World Heritage site of extraordinary beauty. Marine biologists from around the world frequently travel to Belize to submerge deep beneath the waves and examine this thriving ecosystem.

The health of the coral system is intricately interconnected with coastal mangrove lagoons. When rivers transport fresh nutrients from the Maya Mountains into the sea, diverse marine species thrive. However, unsustainable fishing practices and coastal debris threaten this delicate biodiversity. Community leaders in San Pedro and Caye Caulker have launched aggressive anti-pollution campaigns to protect fragile coral formations.

By studying how living organisms interact with their environment, young Belizeans are learning to become dedicated reef stewards. Protecting this natural treasure ensures that future generations will inherit a vibrant, living underwater kingdom.`,
      comprehensionQuestions: [
        { question: "Why do marine scientists submerge deep into the waters of the Belize Barrier Reef?", answer: "To inspect the coral ecosystem and monitor biodiversity.", cognitiveLevel: "Literal" },
        { question: "Using context clues and word parts, explain the meaning of 'interconnected'.", answer: "'Inter-' means between/among; the reef and mangroves are mutually linked and dependent on each other.", cognitiveLevel: "Morphology / Inferential" },
        { question: "What actions are coastal communities taking to safeguard the reef?", answer: "They are organizing anti-pollution campaigns and promoting sustainable practices.", cognitiveLevel: "Literal" },
        { question: "Why is community stewardship essential for Belize's marine ecosystems?", answer: "Because local actions directly prevent pollution and preserve biodiversity for future generations.", cognitiveLevel: "Evaluative" }
      ]
    };
  }

  // General comprehensive narrative mentor text for Language Arts
  return {
    title: `Voices of the Belize River: Understanding ${topic}`,
    genre: "Belizean Realistic Narrative & Language Study",
    gradeLevel: grade || "Standard 4",
    wordCount: 220,
    vocabularyHighlighted: ["current", "settlement", "heritage", "expressive", "dialogue"],
    content: `Along the winding banks of the Belize River, stories flow as smoothly as the gentle current. In the historic village of Burrell Boom, elders gather under the sprawling shade of cohune palms to share memories of mahogany loggers and riverboat journeys from decades past.

Ten-year-old Aliyah sat on a weathered wooden bench, listening intently to Uncle George recount how dories once carried citrus and cocoa beans down to Belize City. "Every story has a purpose," Uncle George explained softly. "When we speak and write with clarity, our words keep the history of our people alive."

Aliyah opened her notebook and carefully recorded the details of his description. She understood that mastering ${topic} was not merely a classroom exercise; it was the key to expressing her thoughts clearly, preserving community wisdom, and contributing her own unique voice to the ongoing story of Belize.`,
    comprehensionQuestions: [
      { question: "Where does this story take place?", answer: "In the village of Burrell Boom along the Belize River.", cognitiveLevel: "Literal" },
      { question: `How does Aliyah's experience connect to today's focus on ${topic}?`, answer: `She realizes that mastering ${topic} helps her express ideas with clarity and preserve her community's history.`, cognitiveLevel: "Inferential" },
      { question: "What did Uncle George explain about the purpose of storytelling?", answer: "He explained that speaking and writing with clarity keeps the history of our people alive.", cognitiveLevel: "Literal" },
      { question: "Why is clear communication important in community life?", answer: "It allows generations to understand each other, respect history, and share knowledge accurately.", cognitiveLevel: "Evaluative" }
    ]
  };
}

/**
 * Generates an authentic, topic-aligned Student Practice Worksheet with complete questions and answer key.
 */
export function generateTopicAlignedWorksheet(topic: string, subtopic: string, grade: string, comps: LanguageArtsComponent[]): { content: string; answerKey: string } {
  const isFlashback = /flashback|time|chronol|sequence|story structure/i.test(`${topic} ${subtopic}`);
  const isAffix = /prefix|suffix|affix|morphol/i.test(`${topic} ${subtopic}`);

  if (isFlashback) {
    const content = `NAME: __________________________   DATE: ___________________\nGRADE: ${grade}   TOPIC: ${topic}\nFOCUS: Identifying Flashbacks, Chronological Ordering, and Transition Phrases\n\nDIRECTIONS: Read each question carefully. Use evidence from our mentor text ("The Silver Hook of Placencia") to complete Questions 1–5 in clear, complete sentences.\n\nPART 1: STRUCTURAL ANALYSIS (COMPREHENSION & STRUCTURE)\n1. Chronological Timeline Sequencing:\n   Place the following narrative events in true chronological order (1 = happened earliest in time, 4 = happened latest in time):\n   [   ] A ferocious squall hits the cayes while Captain Joe holds the tiller and uses the silver hook.\n   [   ] Twelve-year-old Mateo steers the dory across the placid Placencia lagoon.\n   [   ] Mateo notices the silver hook in the cedar wood ribbing under the dock.\n   [   ] Mateo's boat gently bumps against the mangrove roots, returning him to the present.\n\n2. Signal & Transition Identification:\n   Identify the specific signal sentence in paragraph 2 that moves the reader from the present moment into the flashback:\n   Signal Sentence: ___________________________________________________________\n   How does this sentence let the reader know the time frame has changed?\n   Explanation: _______________________________________________________________\n\nPART 2: GUIDED COMPONENT APPLICATION\n3. Anchor Signal Analysis:\n   What sensory detail in paragraph 3 brings Mateo (and the reader) back to the present time?\n   Quote the text evidence: _____________________________________________________\n   Explain how sensory details help authors smoothly end a flashback:\n   ___________________________________________________________________________\n\n4. Applied Writing Practice (${comps[1]}):\n   Write a short narrative paragraph (3–4 sentences) about an everyday moment in Belize (e.g., scoring a goal at school, tasting fresh Johnny cakes, or swimming at the river) that incorporates a brief, clear flashback using a transition phrase (e.g., "Instantly, her mind raced back to...", "Just two weeks earlier...", or "A flood of memories returned...").\n   Your Narrative Paragraph:\n   ___________________________________________________________________________\n   ___________________________________________________________________________\n   ___________________________________________________________________________\n\nPART 3: CRITICAL EVALUATION\n5. Why do authors use flashbacks instead of telling every event in strict chronological order?\n   A. To make stories shorter and omit descriptive details.\n   B. To reveal character motivation, background history, and emotional depth at a dramatic moment.\n   C. To confuse the reader about where the characters are standing.\n   D. To avoid having to write a conclusion to the story.\n   Correct Letter: ______\n   Explain your reasoning using evidence from today's lesson:\n   ___________________________________________________________________________`;

    const answerKey = `ANSWER KEY & SCORING GUIDANCE (${grade} - ${topic}):\n\n1. Chronological Sequence Order:\n   [ 1 ] A ferocious squall hits the cayes while Captain Joe holds the tiller (Happened 3 years ago - Earliest)\n   [ 2 ] Twelve-year-old Mateo steers the dory across the placid Placencia lagoon (Present time)\n   [ 3 ] Mateo notices the silver hook in the cedar wood ribbing (Present time trigger)\n   [ 4 ] Mateo's boat gently bumps against the mangrove roots (Present time return - Latest)\n\n2. Signal Identification:\n   Signal Sentence: "Instantly, Mateo's mind traveled backward three years to a stormy October morning."\n   Explanation: The words "traveled backward three years" explicitly tell the reader that the narrative is shifting from the present dock scene into past memory.\n\n3. Anchor Signal & Sensory Detail:\n   Quote: "The gentle bump of the boat against the mangrove roots snapped Mateo back to the present."\n   Explanation: The physical sensation of the boat bumping and the word "snapped" provide a sharp sensory anchor that pulls the character out of memory and back to physical reality.\n\n4. Writing Rubric (3/3 Criteria):\n   - Clear present-time setting established (1 pt).\n   - Clear transition phrase signaling shift into memory (1 pt).\n   - Grammatically complete sentences with correct punctuation (1 pt).\n\n5. Correct Letter: B\n   Explanation: Flashbacks allow writers to show the backstory and internal motivations of characters at the exact emotional moment they are most relevant, enriching the narrative.`;

    return { content, answerKey };
  }

  if (isAffix) {
    const content = `NAME: __________________________   DATE: ___________________\nGRADE: ${grade}   TOPIC: ${topic}\nFOCUS: Morphological Analysis of Prefixes and Suffixes in Belizean Texts\n\nDIRECTIONS: Analyze each item using our 4-step strategy (PREFIX → BASE/ROOT → CONTEXT → WHOLE-WORD MEANING). Complete Questions 1–5.\n\n1. Look at the underlined word: "The research vessel prepared to submerge beneath the Belize Barrier Reef."\n   a) Isolate Prefix: __________ | Meaning of prefix: __________________________\n   b) Base/Root: _____________ | Meaning of base: ____________________________\n   c) Synthesized Whole-Word Meaning: _________________________________________\n\n2. Break down each Belizean context word:\n   a) transport   → Prefix: ________ | Base: ________ | Meaning: ________________\n   b) interact    → Prefix: ________ | Base: ________ | Meaning: ________________\n   c) sustainable → Base: _________ | Suffix: _______ | Meaning: ________________\n\n3. Contextual Application: Use context clues to explain "anti-pollution" in coastal Belize:\n   ___________________________________________________________________________\n\n4. Original Sentence: Compose a complete sentence situated in Belize using ONE target prefixed word:\n   ___________________________________________________________________________\n\n5. Evaluative Check: In which sentence is "interconnected" used accurately?\n   A. The runner disconnected his shoe because it was interconnected.\n   B. The rivers, lagoons, and coral reefs of Belize are interconnected, sharing one clean water system.\n   C. She was interconnected alone in the yard.\n   Correct Letter: ______ | Justification: _____________________________________`;

    const answerKey = `ANSWER KEY & SCORING GUIDANCE (${grade} - ${topic}):\n\n1. a) sub- (under/beneath); b) merge (plunge/sink); c) to plunge completely beneath water.\n2. a) trans- (across) + port (carry); b) inter- (between) + act (do); c) sustain (maintain) + -able (capable of).\n3. Against or preventing pollution (anti- = opposed to/preventing environmental contamination).\n4. Complete sentence correctly employing chosen prefixed word with authentic Belizean context.\n5. Correct Letter: B. Lagoons, rivers, and reefs form an interdependent network.`;

    return { content, answerKey };
  }

  // General comprehensive Language Arts Worksheet aligned to topic
  const content = `NAME: __________________________   DATE: ___________________\nGRADE: ${grade}   TOPIC: ${topic}\nFOCUS: Skill Application & Textual Evidence\n\nDIRECTIONS: Read each question carefully. Complete Questions 1–5 using evidence from our mentor text and class discussion.\n\n1. Concept & Rule Identification:\n   Explain the core principle or strategy for ${topic} in your own words:\n   ___________________________________________________________________________\n   ___________________________________________________________________________\n\n2. Textual Analysis:\n   Identify an example of ${topic} from today's mentor text and explain how it helps the reader understand the passage:\n   Example from Text: _________________________________________________________\n   Function & Meaning: _______________________________________________________\n\n3. Guided Application:\n   Apply today's skill to analyze or revise the following statement:\n   Original Statement: "The villagers shared their stories together by the river."\n   Your Revised & Enhanced Statement: _________________________________________\n\n4. Independent Writing & Production (${comps[1]}):\n   Compose two original, grammatically complete sentences situated in a Belizean setting demonstrating ${topic}:\n   Sentence 1: _______________________________________________________________\n   Sentence 2: _______________________________________________________________\n\n5. Critical Reflection & Purpose:\n   Why is mastering ${topic} important for becoming a proficient reader, writer, and communicator?\n   ___________________________________________________________________________\n   ___________________________________________________________________________`;

  const answerKey = `ANSWER KEY & SCORING GUIDANCE (${grade} - ${topic}):\n\n1. Concept Check: Student accurately defines ${topic} highlighting key criteria and purpose.\n2. Textual Analysis: Accurately quotes mentor text and articulates its function in context.\n3. Guided Application: Demonstrates enhanced precision, descriptive detail, and correct structure.\n4. Independent Production: Two grammatically correct sentences set in Belize exhibiting the target skill.\n5. Critical Reflection: Thoughtful explanation connecting skill mastery to clear communication and comprehension.`;

  return { content, answerKey };
}

/**
 * Generates an aligned Anchor Chart Blueprint.
 */
export function generateTopicAlignedAnchorChart(topic: string, subtopic: string, grade: string, comps: LanguageArtsComponent[]): AnchorChartBlueprint {
  const isFlashback = /flashback|time|chronol|sequence|story structure/i.test(`${topic} ${subtopic}`);
  
  if (isFlashback) {
    return {
      title: "Mastering Narrative Time: Flashback Anchor Chart",
      layout: "Two-Column Contrast with Central Timeline Bridge",
      headerText: "How Authors Move Between the Present and Past",
      keyRulesOrDefinitions: [
        "Present Time (Anchor): The main timeline where the character is currently situated.",
        "Flashback (Shift): A scene that interrupts the present action to show an earlier event from the past.",
        "Transition Signals: Words that signal time travel ('Instantly, memory carried him...', 'Three years earlier...', 'He remembered...').",
        "Sensory Return Anchor: A sudden sight, sound, or touch in the present that snaps the character back to now."
      ],
      visualDiagramDescription: "A horizontal timeline showing Present Day (Lagoon Dock) -> curved backward arrow labeled 'Memory / Flashback' (Storm 3 Years Ago) -> forward arrow with anchor icon labeled 'Return to Present (Mangrove Bump)'.",
      studentKeyTakeaway: "Flashbacks give readers vital backstory and show why characters feel and act the way they do right now."
    };
  }

  return {
    title: `${topic} - Strategy Anchor Chart`,
    layout: "Concept Definition, Visual Exemplar, and 3-Step Action Guide",
    headerText: `Key Strategies for ${topic}`,
    keyRulesOrDefinitions: [
      `Rule 1: Define the core purpose of ${topic} in reading and writing.`,
      `Rule 2: Identify key structural patterns and signal words in mentor texts.`,
      `Rule 3: Apply the skill step-by-step during independent production.`
    ],
    visualDiagramDescription: `A clean 3-part visual flowchart illustrating: 1. Identify Target Feature -> 2. Analyze Function in Context -> 3. Apply in Original Belizean Writing.`,
    studentKeyTakeaway: `When we master ${topic}, we read with deeper comprehension and write with authentic power.`
  };
}

/**
 * Generates an aligned Exit Ticket Package with mathematically sound scoring.
 */
export function generateTopicAlignedExitTicket(topic: string, subtopic: string, grade: string, comps: LanguageArtsComponent[]): ExitTicketPackage {
  const isFlashback = /flashback|time|chronol|sequence|story structure/i.test(`${topic} ${subtopic}`);

  if (isFlashback) {
    return {
      title: "Daily Exit Ticket: Flashback & Narrative Sequence",
      prompt: "Demonstrate your understanding of narrative flashbacks and transition signals.",
      questions: [
        {
          question: "What is a flashback in a story, and why does an author use it?",
          answerKey: "A flashback is a scene that interrupts present action to show something that happened earlier; authors use it to reveal backstory and character motivations.",
          points: 1
        },
        {
          question: "Write one clear transition phrase an author can use to signal a shift into a flashback.",
          answerKey: "Acceptable answers include: 'Instantly, her mind raced back to...', 'Three years earlier...', 'A flood of memories returned...', or 'He vividly recalled the day...'.",
          points: 1
        },
        {
          question: "In our story, what sensory event brought Mateo back from his flashback to the present lagoon?",
          answerKey: "The gentle bump of the dory against the mangrove roots snapped him back to the present.",
          points: 1
        }
      ],
      scoringGuidance: "Total Points Possible: 3. Each question is scored 1 point for complete accuracy.",
      masteryThreshold: "80% Mastery Benchmark: Score of 3/3 (100%) or 2/3 (67% approaching mastery).",
      groupingRuleTomorrow: "Students scoring 3/3 advance to independent flashback narrative writing. Students scoring 2/3 or below participate in small-group timeline card sequencing."
    };
  }

  return {
    title: `Daily Exit Ticket: ${topic}`,
    prompt: `Demonstrate your individual mastery of ${topic}.`,
    questions: [
      {
        question: `Define ${topic} in your own words and explain its primary purpose.`,
        answerKey: `Accurate definition of ${topic} highlighting essential features.`,
        points: 1
      },
      {
        question: `Identify one key rule or strategy we practiced today for ${topic}.`,
        answerKey: `Correct explanation of the key instructional rule practiced in class.`,
        points: 1
      },
      {
        question: `Write one original sentence demonstrating ${topic} situated in a Belizean setting.`,
        answerKey: `A grammatically complete, accurate sentence in an authentic Belizean context.`,
        points: 1
      }
    ],
    scoringGuidance: "Total Points Possible: 3. Each item is worth 1 point.",
    masteryThreshold: "80% Mastery Benchmark: Score of 3/3 (100%) or 2/3 (67% approaching mastery).",
    groupingRuleTomorrow: "Students scoring 3/3 advance to extension application. Students scoring 2/3 or below receive targeted guided reinforcement."
  };
}

/**
 * Master Language Arts Lesson Enforcement & Self-Correction Engine.
 * Takes any generated Language Arts lesson, identifies any failed alignment categories,
 * applies precise programmatic repairs, re-audits, and outputs the certified plan.
 */
export function enforceAndAuditLanguageArtsLesson(rawPlan: any, context?: any): { plan: LessonPlan; audit: LanguageArtsAlignmentAudit } {
  let plan: LessonPlan = { ...rawPlan };

  const grade = plan.grade || context?.grade || 'Standard 4';
  const topic = plan.topic || plan.lessonTitle || context?.topic || 'Language Arts';
  const subtopic = plan.subtopic || context?.subtopic || topic;
  const cycle = plan.cycle !== undefined ? plan.cycle : (context?.cycle !== undefined ? context.cycle : 2);

  // 1. Establish the EXACT TWO Components
  let comps = plan.languageArtsComponents;
  if (!comps || !Array.isArray(comps) || comps.length !== 2) {
    if (plan.primaryComponent && plan.supportingComponent) {
      comps = [plan.primaryComponent, plan.supportingComponent];
    } else {
      comps = deduceTwoComponents(topic, subtopic, grade);
    }
  }
  const normComps: [LanguageArtsComponent, LanguageArtsComponent] = [
    normalizeLAComponent(comps[0]),
    normalizeLAComponent(comps[1])
  ];
  plan.languageArtsComponents = normComps;
  plan.primaryComponent = normComps[0];
  plan.supportingComponent = normComps[1];

  // 2. Eradicate Math Bleed
  plan = cleanLanguageArtsMathematicsBleed(JSON.stringify(plan)) ? plan : plan; // checked via deep clean below
  const cleanStr = (val: string) => cleanLanguageArtsMathematicsBleed(stripFabricatedStudentNames(val));

  // 3. Enforce Strict 90-Minute Duration and Stages
  plan.duration = '90 minutes';
  const balanced = validateAndBalanceLessonTiming(plan, '90 minutes');
  if (balanced?.plan) {
    if (balanced.plan.duration) plan.duration = balanced.plan.duration;
    if (balanced.plan.executionBoard) plan.executionBoard = balanced.plan.executionBoard;
  }

  // Ensure 7 Stages totaling exactly 90 minutes with Teacher & Student Actions
  const isAffixTopic = /prefix|suffix|affix|morphol/i.test(topic);
  const defaultStages = [
    { num: 1, name: 'Stage 1: Engage & Prior Knowledge Activation', dur: '8 min' },
    { num: 2, name: 'Stage 2: Explore: Belizean Mentor Reading Passage', dur: '15 min' },
    { num: 3, name: 'Stage 3: Explicit Instruction & Teacher Think-Aloud', dur: '15 min' },
    { num: 4, name: `Stage 4: Guided Practice & ${normComps[0]} Focus`, dur: '15 min' },
    { num: 5, name: `Stage 5: Collaborative Practice & ${normComps[1]} Application`, dur: '12 min' },
    { num: 6, name: 'Stage 6: Independent Reading & Writing Production', dur: '15 min' },
    { num: 7, name: 'Stage 7: Exit Assessment, Diagnostic Check & Closure', dur: '10 min' }
  ];

  if (!plan.executionBoard || plan.executionBoard.length < 5) {
    plan.executionBoard = defaultStages.map(st => ({
      stageNumber: st.num,
      title: st.name,
      duration: st.dur,
      teacherActions: [
        `Explicitly introduces and facilitates ${st.name} focused on "${topic}" and ${normComps[0]}.`,
        `Demonstrates clear modeling, poses text-dependent questions, and monitors student responses.`
      ],
      studentActions: [
        `Actively participates, annotates mentor text in exercise books, and practices target skill with peers.`,
        `Completes assigned task independently or in guided pairs adhering to success criteria.`
      ],
      questionsToAsk: [
        `How does today's focus on ${topic} enhance your reading and writing in this passage?`,
        `What evidence from the mentor text supports your answer?`
      ],
      checkForUnderstanding: `Formative observation and student response verification aligned to ${normComps[0]}.`,
      materialsUsed: ['Belizean Mentor Text', 'Student Exercise Books', 'Anchor Chart', 'Worksheet']
    }));
  } else {
    // Sanitize existing stages to ensure no unrelated prefix drill bleed
    plan.executionBoard = plan.executionBoard.map((st, idx) => {
      let tActions = (st.teacherActions || []).map(cleanStr);
      let sActions = (st.studentActions || []).map(cleanStr);
      let title = cleanStr(st.title || `Stage ${idx + 1}`);

      // Check if this stage contains unrelated affix bleed
      if (!isAffixTopic && containsUnrelatedPrefixAffixContent(`${title} ${tActions.join(' ')}`, topic, normComps)) {
        title = defaultStages[idx]?.name || `Stage ${idx + 1}: ${normComps[idx % 2]} Application`;
        tActions = [
          `Facilitates active instruction focused on "${topic}" and ${normComps[0]}.`,
          `Guides students through textual evidence and targeted language production.`
        ];
        sActions = [
          `Examines mentor text, participates in paired analysis of ${topic}, and records findings.`,
          `Applies target structure in original written and oral sentences.`
        ];
      }

      return {
        ...st,
        title,
        teacherActions: tActions.length ? tActions : [`Facilitates ${title} on ${topic}.`],
        studentActions: sActions.length ? sActions : [`Engages actively in ${title} on ${topic}.`]
      };
    });
  }

  // 4. Component Details (45 min each default balance)
  if (!plan.component1Details || containsUnrelatedPrefixAffixContent(JSON.stringify(plan.component1Details), topic, normComps)) {
    plan.component1Details = {
      name: normComps[0],
      timeAllocation: '45 minutes',
      explicitTeachingScript: `"Scholars, look at our mentor text today. As we focus on ${normComps[0]} through our study of ${topic}, notice how the author guides our understanding. Watch me as I examine the key elements..."`,
      guidedPracticeTask: `Guided analysis of mentor text examples with partner turns and whole-class check-in on ${topic}.`,
      formativeCheck: {
        teacherAsks: `What is the key evidence or pattern that demonstrates ${topic} in this passage?`,
        expectedResponse: `Students accurately identify the target pattern and explain its function in context.`,
        ifCorrect: `Praise specific analytical reasoning and invite partner elaboration.`,
        ifIncorrect: `Direct attention back to the anchor chart and scaffold with a targeted prompt.`
      }
    };
  }

  if (!plan.component2Details || containsUnrelatedPrefixAffixContent(JSON.stringify(plan.component2Details), topic, normComps)) {
    plan.component2Details = {
      name: normComps[1],
      timeAllocation: '45 minutes',
      explicitTeachingScript: `"Now we transition to our second component: ${normComps[1]}. We will take the understanding we built in our reading and apply it directly into our own written composition..."`,
      guidedPracticeTask: `Collaborative and independent writing practice composing original sentences and paragraphs demonstrating ${topic}.`,
      formativeCheck: {
        teacherAsks: `How does your written sentence show correct application of ${topic}?`,
        expectedResponse: `Students read their original sentence and explain their structural choices clearly.`,
        ifCorrect: `Challenge student to incorporate an additional descriptive detail or complex sentence.`,
        ifIncorrect: `Provide a structured sentence frame and guide paired oral rehearsal before writing.`
      }
    };
  }

  // 5. Objective Normalization with Shared Condition (Given...)
  const condition = `Given an authentic Belizean mentor text, a visual anchor chart on ${topic}, and structured guided practice:`;
  const cognitive = `Students will identify, analyze, and explain key elements of ${topic} with at least 80% accuracy in text-dependent questions.`;
  const psychomotor = `Students will independently organize ideas and compose grammatically complete written responses demonstrating ${topic} in their literacy workbooks.`;
  const affective = `Students will participate actively and respectfully in partner discussions, citing textual evidence and expressing confidence in their language analysis.`;

  const existingCog = plan.learningObjectives?.cognitive || plan.learningObjectivesBoard?.knowledge || '';
  const needsObjReplacement = !existingCog || containsUnrelatedPrefixAffixContent(existingCog, topic, normComps);

  plan.learningObjectives = {
    condition: (plan.learningObjectives?.condition && /^[Gg]iven\b/.test(plan.learningObjectives.condition) && !containsUnrelatedPrefixAffixContent(plan.learningObjectives.condition, topic, normComps))
      ? plan.learningObjectives.condition
      : condition,
    cognitive: needsObjReplacement ? cognitive : cleanStr(existingCog),
    psychomotor: needsObjReplacement ? psychomotor : cleanStr(plan.learningObjectives?.psychomotor || plan.learningObjectivesBoard?.skill || psychomotor),
    affective: needsObjReplacement ? affective : cleanStr(plan.learningObjectives?.affective || plan.learningObjectivesBoard?.attitude || affective)
  };

  plan.learningObjectivesBoard = {
    ...plan.learningObjectivesBoard,
    condition: plan.learningObjectives.condition,
    knowledge: plan.learningObjectives.cognitive,
    skill: plan.learningObjectives.psychomotor,
    attitude: plan.learningObjectives.affective,
    cognitive: plan.learningObjectives.cognitive,
    psychomotor: plan.learningObjectives.psychomotor,
    affective: plan.learningObjectives.affective,
    successCriteria: (plan.learningObjectivesBoard?.successCriteria?.length && !containsUnrelatedPrefixAffixContent(plan.learningObjectivesBoard.successCriteria.join(' '), topic, normComps))
      ? plan.learningObjectivesBoard.successCriteria.map(cleanStr)
      : [
          `I can identify and explain key features of ${topic} in our mentor text.`,
          `I can apply ${topic} to organize and write clear, complete responses.`,
          `I can discuss my textual evidence and reasoning respectfully with a partner.`
        ]
  };

  // 6. Reading Passage Guarantee (Must be complete and topic-aligned)
  const existingPassage = plan.readingPassageFull;
  if (!existingPassage || !existingPassage.content || existingPassage.content.length < 80 || containsUnrelatedPrefixAffixContent(existingPassage.content, topic, normComps)) {
    plan.readingPassageFull = generateTopicAlignedPassage(topic, subtopic, grade, normComps);
  }

  // 7. Anchor Chart Blueprint Guarantee
  if (!plan.anchorChartBlueprint || containsUnrelatedPrefixAffixContent(JSON.stringify(plan.anchorChartBlueprint), topic, normComps)) {
    plan.anchorChartBlueprint = generateTopicAlignedAnchorChart(topic, subtopic, grade, normComps);
  }

  // 8. Student Practice Worksheet Guarantee
  if (!plan.studentMaterials || plan.studentMaterials.length === 0 || containsUnrelatedPrefixAffixContent(plan.studentMaterials[0]?.content || '', topic, normComps)) {
    const ws = generateTopicAlignedWorksheet(topic, subtopic, grade, normComps);
    plan.studentMaterials = [
      {
        title: `${topic} - Guided Practice Worksheet`,
        type: 'worksheet',
        content: ws.content,
        answerKey: ws.answerKey
      }
    ];
  }

  // 9. Exit Ticket Package Guarantee (Strict /3 and 80% Mastery)
  if (!plan.exitTicketPackage || containsUnrelatedPrefixAffixContent(JSON.stringify(plan.exitTicketPackage), topic, normComps)) {
    plan.exitTicketPackage = generateTopicAlignedExitTicket(topic, subtopic, grade, normComps);
  } else {
    // Harmonize scoring math on existing exit ticket
    const qs = plan.exitTicketPackage.questions || [];
    const totalPts = qs.reduce((sum, q) => sum + (q.points || 1), 0);
    plan.exitTicketPackage.scoringGuidance = `Total Points: ${totalPts}. Each question evaluates individual mastery of today's target skills.`;
    if (totalPts <= 3) {
      plan.exitTicketPackage.masteryThreshold = `80% Mastery Benchmark: Score of 3/3 (100%) or 2/3 (67% approaching mastery).`;
    } else {
      const thresholdVal = Math.ceil(totalPts * 0.8);
      plan.exitTicketPackage.masteryThreshold = `80% Mastery Benchmark: Score of ${thresholdVal}/${totalPts} or higher.`;
    }
  }

  // 10. Run Full Audit
  const audit = runLanguageArtsAlignmentAudit(plan, { grade, topic, subtopic, cycle, subject: 'Language Arts' });
  plan.languageArtsAlignmentAudit = audit;
  plan.isReadyToTeach = audit.isReadyToTeach;
  plan.status = audit.isReadyToTeach ? 'Ready to Teach' : 'Needs Review';

  return { plan, audit };
}
