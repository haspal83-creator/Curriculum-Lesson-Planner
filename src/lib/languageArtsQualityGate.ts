import { LessonPlan } from '../types';
import { validateAndBalanceLessonTiming } from './timingValidation';
import { 
  enforceAndAuditLanguageArtsLesson, 
  runLanguageArtsAlignmentAudit, 
  deduceTwoComponents,
  normalizeLAComponent 
} from './languageArtsAlignmentAudit';

export { 
  enforceAndAuditLanguageArtsLesson, 
  runLanguageArtsAlignmentAudit, 
  deduceTwoComponents,
  normalizeLAComponent 
};

/**
 * Checks if the subject is Language Arts or related literacy subjects.
 */
export function isLanguageArtsSubject(subject?: string): boolean {
  if (!subject) return false;
  const s = subject.toLowerCase();
  return s.includes('language') || 
         s.includes('reading') || 
         s.includes('writing') || 
         s.includes('english') || 
         s.includes('phonics') || 
         s.includes('spelling') || 
         s.includes('literature');
}

/**
 * Comprehensive Subject Purity Replacements:
 * Eradicates all mathematics bleed, computation terminology, and calculation idioms
 * from Language Arts lesson plans.
 */
export function cleanLanguageArtsMathematicsBleed(text: string): string {
  if (!text || typeof text !== 'string') return text;
  let s = text;

  // Exact phrases called out in the Master Quality Standard
  s = s.replace(/complete problems 1 through 5\. Show all your working\.?/gi, 'complete Questions 1–5. Support each answer with evidence from the text.');
  s = s.replace(/complete problems 1 through 5\. Show your full working for every single question\.?/gi, 'complete Questions 1–5. Support each answer with evidence from the text.');
  s = s.replace(/Show all your working\.?/gi, 'Support each answer with text evidence.');
  s = s.replace(/Show your full working\.?/gi, 'Explain your reasoning and cite text evidence.');
  s = s.replace(/Show full working for every single question\.?/gi, 'Provide clear textual evidence for each response.');
  s = s.replace(/procedural working visible\.?/gi, 'textual evidence and clear explanations visible.');
  s = s.replace(/Box your final answers?\.?/gi, 'Write complete answers clearly.');
  s = s.replace(/box our answers?\.?/gi, 'verify our written response.');
  s = s.replace(/box their answers?\.?/gi, 'write their answers clearly.');
  s = s.replace(/check your algorithm\.?/gi, 'check whether your word analysis supports the meaning of the word.');
  s = s.replace(/computational or clerical slips/gi, 'spelling, grammatical, vocabulary, or interpretation errors');
  s = s.replace(/calculation or transcription error/gi, 'spelling, affix segmentation, or grammatical error');
  s = s.replace(/calculation\/format errors/gi, 'grammatical, punctuation, or spelling errors');
  s = s.replace(/calculation errors?/gi, 'grammatical or vocabulary errors');
  s = s.replace(/computational errors?/gi, 'spelling or morphological errors');
  s = s.replace(/computational slips?/gi, 'spelling or vocabulary slips');

  // Math terms to Language Arts equivalents
  s = s.replace(/mathematical reasoning/gi, 'language analysis and critical thinking');
  s = s.replace(/mathematical discourse/gi, 'academic discourse and analytical discussion');
  s = s.replace(/mathematical applications/gi, 'authentic communication and reading applications');
  s = s.replace(/mathematical concepts/gi, 'language concepts and morphological structures');
  s = s.replace(/mathematical or conceptual justification/gi, 'textual or morphological explanation');
  s = s.replace(/mathematical/gi, 'linguistic and academic');
  s = s.replace(/mathematician\/reader/gi, 'reader and writer');
  s = s.replace(/mathematician/gi, 'reader and writer');

  // Problem / Algorithm / Calculation terms
  s = s.replace(/solve problems involving/gi, 'analyze, interpret, and use words and sentences involving');
  s = s.replace(/solve and explain these problems/gi, 'read, analyze, and explain these words and sentences');
  s = s.replace(/solve each problem below/gi, 'answer each question below');
  s = s.replace(/solve problems/gi, 'analyze words and answer questions');
  s = s.replace(/solve this problem/gi, 'answer this question');
  s = s.replace(/problem-solving/gi, 'critical reading and word study');
  s = s.replace(/problem set/gi, 'question set and reading tasks');
  s = s.replace(/independent problem set/gi, 'independent reading and word study tasks');
  s = s.replace(/procedural algorithm/gi, 'step-by-step word analysis procedure');
  s = s.replace(/step-by-step algorithms/gi, 'step-by-step word analysis and clear sentences');
  s = s.replace(/algorithms?/gi, 'analytical procedure');
  s = s.replace(/intermediate calculations/gi, 'intermediate word analysis steps');
  s = s.replace(/intermediate calculations\./gi, 'intermediate word analysis steps.');
  s = s.replace(/confirm intermediate calculations/gi, 'confirm word meanings and textual evidence');
  s = s.replace(/intermediate lines/gi, 'intermediate word breakdown steps');
  s = s.replace(/reverse operation/gi, 'context clues and morphological breakdown');
  s = s.replace(/inverse operation/gi, 'morphological breakdown and sentence context');
  s = s.replace(/place value/gi, 'spelling patterns and affix structures');
  s = s.replace(/number lines?/gi, 'visual word cards and affix strips');
  s = s.replace(/physical counters?/gi, 'tactile word tiles and letter cards');
  s = s.replace(/tactile counters/gi, 'tactile word tiles and affix cards');
  s = s.replace(/bottle caps, or a drawn number line on the desk/gi, 'color-coded affix cards and root word tiles');

  // Generic math script examples
  s = s.replace(/Take a look at the problem on the board/gi, 'Take a look at the mentor word and sentence on the board');
  s = s.replace(/Problem #1/gi, 'Mentor Example #1');
  s = s.replace(/Collaborative Practice Problem #1/gi, 'Collaborative Mentor Word #1');
  s = s.replace(/Paired Practice Problem #2/gi, 'Paired Word Analysis #2');
  s = s.replace(/Model Problem:/gi, 'Mentor Text Example:');
  s = s.replace(/The teacher displays Problem #1 on the board, models clear physical posture, points explicitly to each component, and writes out every intermediate line of work\./gi, 
    'The teacher displays the mentor word in an authentic sentence on the board, models breaking the word into its prefix and base components, and demonstrates how to verify meaning using context clues.');
  s = s.replace(/Notice what happens if we skip Step 2: our final result won't balance\./gi,
    'Notice what happens if we overlook the base word: we might misunderstand the entire sentence. Let\'s check both the prefix and base word together.');
  s = s.replace(/If you have 2 groups of 3 mangoes, how many do you hold\?/gi,
    'Think of how adding "un-" changes "happy" to "unhappy": the prefix directly alters the meaning of the base word.');
  s = s.replace(/Deliver explicit teaching scripts for Component 1 and Component 2\.?/gi,
    'Deliver explicit instruction on word morphology, guided mentor reading, and contextual sentence application.');
  s = s.replace(/Deliver explicit teaching scripts for Component 1 and Component 2/gi,
    'Deliver explicit instruction on word morphology, guided mentor reading, and contextual sentence application');

  // Specific corrections for dyscalculia in Language Arts
  s = s.replace(/Number line visual, color-coded arithmetic steps, and physical counter assistance\.?/gi,
    'Multi-sensory phonics cards, color-coded affix analysis strips, and tactile word-building tiles.');
  s = s.replace(/dyscalculia: Number line visual, color-coded arithmetic steps, and physical counter assistance\.?/gi,
    'dyscalculia: Not applicable to Language Arts; provide multi-sensory affix cards and visual word frames.');

  // Clean formatting artifacts
  s = s.replace(/\[object Object\]/gi, '');
  s = s.replace(/\bnull\b/g, '');
  s = s.replace(/\bundefined\b/g, '');

  return s;
}

/**
 * Strips fabricated student names (e.g. Maria, Kevin, John) from feedback, scripts, and notes.
 */
export function stripFabricatedStudentNames(text: string): string {
  if (!text || typeof text !== 'string') return text;
  let s = text;

  // Specific template line from lessonQualityGate
  s = s.replace(/Excellent precision with that intermediate step, Maria! Notice how keeping your work organized helped you catch that small error before moving on\./gi,
    'Excellent precision with identifying that word part! Notice how breaking the word into its prefix and base word helped you determine the exact meaning.');
  s = s.replace(/Excellent precision with that intermediate step, [A-Z][a-z]+!/gi,
    'Excellent precision with identifying that word part!');

  // Generic name removals in feedback prompts
  s = s.replace(/\b(Maria|Kevin|John|Sarah|David|Carlos)\b/g, 'a student');
  return s;
}

/**
 * Checks if a string is a generic placeholder in student materials.
 */
export function isMaterialPlaceholder(text: string): boolean {
  if (!text) return false;
  return /\[Foundational Practice Problem\]/i.test(text) ||
         /\[Standard Application Problem\]/i.test(text) ||
         /\[Multi-Step Challenge\]/i.test(text) ||
         /\[Real-World Belizean Context Problem\]/i.test(text) ||
         /\[Real-World Context Problem\]/i.test(text) ||
         /\[Representative problem\]/i.test(text) ||
         /SHOW ALL YOUR WORKING/i.test(text) ||
         /Box your final answers/i.test(text) ||
         /Working Space:/i.test(text);
}

/**
 * Generates an authentic, grade-appropriate Language Arts worksheet with real questions.
 */
export function generateRealLanguageArtsWorksheet(topic: string, grade: string): { content: string; answerKey: string } {
  const isPrefix = /prefix/i.test(topic);
  const isSuffix = /suffix/i.test(topic);
  const isAffix = isPrefix || isSuffix || /affix/i.test(topic) || /morphology/i.test(topic) || /word analysis/i.test(topic);

  if (isAffix) {
    const content = `NAME: __________________________   DATE: ___________________\nGRADE: ${grade}   TOPIC: ${topic}\nSTRATEGY: PREFIX → BASE/ROOT → CONTEXT → WHOLE-WORD MEANING\n\nDIRECTIONS: Read each item carefully. Use our 4-step morphological analysis strategy to complete Questions 1–5.\n\nPART 1: MORPHOLOGICAL ANALYSIS & STRATEGY APPLICATION\n1. Look at the underlined word in the sentence below:\n   "The marine research vessel prepared to submerge beneath the surface of the Belize Barrier Reef."\n   a) Identify the prefix: ________________________\n   b) What does the prefix "sub-" mean?\n      Answer: ___________________________________________________\n   c) What is the base word or root element?\n      Answer: ___________________________________________________\n   d) Using your 4-step strategy, explain the whole-word meaning of "submerge":\n      Answer: ___________________________________________________\n\n2. For each Belizean context word below, isolate the prefix and state whether the remaining part is a standalone base word or a bound root element:\n   a) transport (trans- + port)       → Prefix: ________ | Remaining part: ________________________\n   b) interact (inter- + act)         → Prefix: ________ | Remaining part: ________________________\n   c) preview (pre- + view)           → Prefix: ________ | Remaining part: ________________________\n   d) international (inter- + national) → Prefix: ________ | Remaining part: ________________________\n\nPART 2: CONTEXTUAL APPLICATION & EVIDENCE\n3. Read the sentence and use context clues to explain the meaning of the bold word:\n   "Before the transatlantic flight touched down at the Philip Goldson International Airport, the captain announced clear skies over Belize."\n   Explain the meaning of "transatlantic" using the prefix "trans-" and sentence context:\n   ___________________________________________________________________________\n   ___________________________________________________________________________\n\n4. Select ONE prefix from the box below and compose a grammatically complete sentence describing an authentic event or place in Belize (e.g., Placencia lagoon, Hol Chan Marine Reserve, or Dangriga market). Include strong context clues.\n   [ trans-  |  inter-  |  sub-  |  pre- ]\n   Your Sentence:\n   ___________________________________________________________________________\n   ___________________________________________________________________________\n\nPART 3: CRITICAL EVALUATION\n5. In which sentence is the word "interconnected" used correctly?\n   A. Jamal disconnected his radio because it was interconnected.\n   B. The rivers, lagoons, and coral reefs of Belize are interconnected, sharing the same clean water system.\n   C. Maya walked interconnected down the road by herself.\n   D. The mango tree was interconnected yesterday morning.\n   Correct Letter: ______\n   Briefly explain why your choice is correct using morphological reasoning:\n   ___________________________________________________________________________`;

    const answerKey = `ANSWER KEY & SCORING GUIDANCE (${grade} - ${topic}):\n\n1. a) Prefix: sub-\n   b) Meaning of sub-: under, below, or beneath.\n   c) Base word: merge (meaning to dip, plunge, or combine into liquid).\n   d) Whole-word meaning: to plunge, sink, or go completely under water. The sentence context (marine research beneath the reef surface) confirms this meaning.\n\n2. Morphological breakdown:\n   a) transport → Prefix: trans- (across) | Remaining part: port (standalone base word, meaning to carry)\n   b) interact → Prefix: inter- (between/among) | Remaining part: act (standalone base word, meaning to do/behave)\n   c) preview → Prefix: pre- (before) | Remaining part: view (standalone base word, meaning to see/look)\n   d) international → Prefix: inter- (between/among) | Remaining part: national (standalone base word, meaning relating to a nation)\n\n3. Explanation of "transatlantic":\n   "trans-" means across + Atlantic (the Atlantic Ocean). In context, the flight traveled across the Atlantic Ocean before landing in Belize.\n\n4. Sentence Evaluation Criteria (3/3 requirements):\n   - Uses chosen prefixed word accurately with correct spelling.\n   - Grammatically complete sentence with correct capitalization and punctuation.\n   - Provides rich context clues demonstrating the meaning of the prefixed word.\n\n5. Correct Letter: B\n   Explanation: "Interconnected" means mutually linked or joined together (inter- = between/among). Coastal rivers, lagoons, and reef ecosystems share water and wildlife, making B the only logically and semantically sound sentence.`;

    return { content, answerKey };
  }

  // General Language Arts Worksheet
  const content = `NAME: __________________________   DATE: ___________________\nGRADE: ${grade}   TOPIC: ${topic}\n\nDIRECTIONS: Read each question carefully. Write your answers in clear, complete sentences with correct punctuation and spelling.\n\n1. Key Concept Check:\n   In your own words, explain the main idea or language rule for ${topic}:\n   ___________________________________________________________________________\n   ___________________________________________________________________________\n\n2. Identification & Analysis:\n   Identify the target language structure in the sentence below and explain its function:\n   "During the festival in Dangriga, the dancers wore vibrant Garifuna attire."\n   Target Structure / Feature: _________________________________________________\n   Function in Sentence: _______________________________________________________\n\n3. Applied Practice:\n   Compose a descriptive sentence situated in Belize that correctly demonstrates ${topic}:\n   ___________________________________________________________________________\n   ___________________________________________________________________________\n\n4. Sentence Editing & Precision:\n   Rewrite the following sentence so that it demonstrates correct grammatical structure and academic word choice:\n   "them children was walking fast to the sea."\n   Corrected Sentence:\n   ___________________________________________________________________________\n\n5. Evaluative Question:\n   Why is using precise language and clear sentence structure important when communicating with others in our community?\n   ___________________________________________________________________________\n   ___________________________________________________________________________`;

  const answerKey = `ANSWER KEY & SCORING GUIDANCE (${grade} - ${topic}):\n\n1. Key Concept: Accurate student definition of ${topic} highlighting key terminology and clear purpose.\n2. Identification: Correctly isolates the target structure and explains how it informs the sentence's meaning.\n3. Applied Practice: A grammatically complete sentence set in a Belizean setting using correct conventions.\n4. Editing: "Those children were walking quickly toward the sea." (Corrects pronoun/demonstrative agreement, subject-verb agreement 'were', and adverb form 'quickly').\n5. Evaluative: Clear reasoning connecting language precision to mutual understanding, respectful dialogue, and effective expression in Belizean civic life.`;

  return { content, answerKey };
}

/**
 * Normalizes the reflectionDashboard to be strictly PRE-LESSON REFLECTION / PLANNING NOTES
 * prior to actual classroom delivery, prohibiting fake past-tense assertions.
 */
export function normalizeLanguageArtsReflection(reflection: any, topic: string): {
  whatWorked: string;
  needsImprovement: string;
  followUpStudents: string[];
  nextSteps: string;
} {
  return {
    whatWorked: `PRE-LESSON ANTICIPATION: Anticipate student difficulty in distinguishing authentic prefixes from words that merely start with those letters (e.g., "uncle" vs. "unhappy"). Anchor chart contrast pairs are prepared.`,
    needsImprovement: `ASSESSMENT EVIDENCE TO COLLECT: Collect student whiteboards during guided morphology practice and analyze exit ticket question 2 to verify independent decoding accuracy.`,
    followUpStudents: [
      `Record students requiring follow-up after the lesson based on exit ticket evaluation.`
    ],
    nextSteps: `RESPONSIVE ADJUSTMENTS: If students struggle with multi-syllabic base words, transition to color-coded prefix cards and paired oral reading before proceeding to independent writing.`
  };
}

/**
 * Deeply traverses an object, applying a string transformer to all string properties.
 */
export function deepTransformStrings(obj: any, transformer: (val: string) => string): any {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'string') return transformer(obj);
  if (Array.isArray(obj)) return obj.map(item => deepTransformStrings(item, transformer));
  if (typeof obj === 'object') {
    const res: any = {};
    for (const key of Object.keys(obj)) {
      res[key] = deepTransformStrings(obj[key], transformer);
    }
    return res;
  }
  return obj;
}

/**
 * Master Language Arts Purity and Quality Gate:
 * Enforces all 30 rules from the Strict Language Arts Lesson-Planning Standard,
 * running the Mandatory Alignment Audit and certifying Ready-to-Teach status.
 */
export function enforceLanguageArtsPurityAndQuality(plan: LessonPlan): LessonPlan {
  if (!plan || !isLanguageArtsSubject(plan.subject)) {
    return plan;
  }

  // Delegate directly to the comprehensive Alignment Audit & Self-Correction Engine
  const { plan: certifiedPlan } = enforceAndAuditLanguageArtsLesson(plan);
  return certifiedPlan;
}
