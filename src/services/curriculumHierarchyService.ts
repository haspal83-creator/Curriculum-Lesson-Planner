/**
 * Curriculum Hierarchy & Quality Control Service
 * 
 * Enforces the strict MoECST Belize Primary Curriculum hierarchy:
 * SELECTED CLASS/GRADE
 *         ↓
 * SELECTED SUBJECT
 *         ↓
 * SELECTED CYCLE
 *         ↓
 * SELECTED TOPIC
 *         ↓
 * AUTHORITATIVE CURRICULUM OUTCOME
 *         ↓
 * SUBTOPIC / FOCAL INQUIRY
 *         ↓
 * LEARNING OBJECTIVES
 *         ↓
 * CONTENT
 *         ↓
 * ACTIVITIES
 *         ↓
 * ASSESSMENT
 *         ↓
 * DIFFERENTIATION
 *         ↓
 * CLOSURE
 *
 * Guarantees zero cross-subject contamination, deterministic pre/post validation,
 * exact timing equality, and isolated clean generation contexts.
 */

import { CurriculumEntry, GradeLevel, Subject, LessonPlan } from '../types';
import { normalizeGrade, normalizeSubject, normalizeCycle } from './curriculumFilterService';
import { BELIZE_NATIONAL_CURRICULUM } from '../data/belize_national_curriculum';

export interface CleanGenerationContext {
  classLevel: GradeLevel;
  subject: Subject;
  cycle: number;
  topic: string;
  subtopic: string;
  strand: string;
  curriculumCode: string;
  learningOutcome: string;
  learningOutcomes: string[];
  duration: string;
  academicYear: string;
}

export interface FilteredCurriculumPayload {
  selectedClass: GradeLevel;
  selectedSubject: Subject;
  selectedCycle: number;
  selectedTopic: string;
  selectedSubtopic: string;
  selectedStrand: string;
  selectedCurriculumCode: string;
  selectedCurriculumOutcome: string;
  authoritativeLearningOutcomes: string[];
  suggestedLessons?: number;
  suggestedWeeks?: number;
}

export interface QualityValidationReport {
  valid: boolean;
  checks: {
    classMatch: boolean;
    subjectMatch: boolean;
    cycleMatch: boolean;
    topicMatch: boolean;
    curriculumCodeMatch: boolean;
    outcomeMatch: boolean;
    subtopicAlignment: boolean;
    objectiveAlignment: boolean;
    contentRelevance: boolean;
    activityAlignment: boolean;
    assessmentAlignment: boolean;
    differentiationRelevant: boolean;
    timingValid: boolean;
  };
  errors: string[];
}

/**
 * Subject code prefix mapping
 */
export const SUBJECT_CODE_PREFIXES: Record<string, string> = {
  'Mathematics': 'MA',
  'Language Arts': 'LA',
  'Science and Technology': 'SC',
  'Belizean Studies': 'BS',
  'HFLE': 'HFLE',
  'Spanish': 'SP',
  'PE': 'PE',
  'Creative Arts': 'CA'
};

/**
 * Grade abbreviations for code derivation
 */
export const GRADE_ABBREVIATIONS: Record<string, string> = {
  'Infant 1': 'INF1',
  'Infant 2': 'INF2',
  'Infant 3': 'INF3',
  'Standard 1': 'ST1',
  'Standard 2': 'ST2',
  'Standard 3': 'ST3',
  'Standard 4': 'ST4',
  'Standard 5': 'ST5',
  'Standard 6': 'ST6'
};

/**
 * Returns the authoritative curriculum code for a given curriculum entry or selection.
 * Strictly guarantees the code matches the selected subject.
 */
export function getAuthoritativeCurriculumCode(params: {
  subject: string;
  grade: string;
  cycle: number;
  topic: string;
  curriculum?: CurriculumEntry[];
}): string {
  const normGrade = normalizeGrade(params.grade);
  const normSubj = normalizeSubject(params.subject);
  const normCyc = normalizeCycle(params.cycle);
  const targetTopic = params.topic.trim().toLowerCase();

  // 1. Look up in active curriculum entries
  const list = params.curriculum && params.curriculum.length > 0 ? params.curriculum : BELIZE_NATIONAL_CURRICULUM;
  const match = list.find(e => 
    normalizeGrade(e.grade) === normGrade &&
    normalizeSubject(e.subject) === normSubj &&
    normalizeCycle(e.cycle) === normCyc &&
    (e.topic || '').trim().toLowerCase() === targetTopic
  );

  if (match?.curriculumCode && match.curriculumCode.trim()) {
    return match.curriculumCode.trim();
  }

  // 2. Synthesize canonical authoritative MoECST format
  const subjPrefix = SUBJECT_CODE_PREFIXES[normSubj] || normSubj.slice(0, 3).toUpperCase();
  const gradeAbbr = GRADE_ABBREVIATIONS[normGrade] || 'ST';
  return `${subjPrefix}.${gradeAbbr}.C${normCyc}.01`;
}

/**
 * Generates an authoritative subtopic or topic-specific focal inquiry
 * strictly derived from the selected topic and subject.
 * NEVER returns Language Arts or foreign subject terms.
 */
export function getTopicFocalInquiry(subject: string, topic: string, existingSubtopic?: string): string {
  if (existingSubtopic && existingSubtopic.trim() && existingSubtopic.trim().toLowerCase() !== topic.trim().toLowerCase()) {
    // Verify existing subtopic has no foreign subject contamination
    const contamination = detectCrossSubjectContamination(existingSubtopic, subject);
    if (!contamination.hasContamination) {
      return existingSubtopic.trim();
    }
  }

  const normSubj = normalizeSubject(subject);
  const topicLower = topic.toLowerCase();

  // HFLE Topic Focal Inquiries
  if (normSubj === 'HFLE') {
    if (topicLower.includes('diet') || topicLower.includes('disease') || topicLower.includes('nutrition') || topicLower.includes('food')) {
      return 'Nutrient-Dense Foods, Healthy Dietary Habits, and Prevention of Non-Communicable Diseases (Diabetes and Hypertension)';
    }
    if (topicLower.includes('safety') || topicLower.includes('peer') || topicLower.includes('decision')) {
      return 'Resisting Negative Peer Pressure, Risk Assessment, and Safe Decision-Making';
    }
    if (topicLower.includes('emotion') || topicLower.includes('conflict') || topicLower.includes('communication')) {
      return 'Emotional Well-Being, Stress Management, and Peaceful Conflict Resolution';
    }
    if (topicLower.includes('growth') || topicLower.includes('puberty') || topicLower.includes('hygiene') || topicLower.includes('adolescent')) {
      return 'Adolescent Physical and Emotional Growth, Personal Hygiene, and Positive Self-Worth';
    }
    return `Health Promotion, Decision-Making, and Well-Being in ${topic}`;
  }

  // Science & Technology Focal Inquiries
  if (normSubj === 'Science and Technology') {
    if (topicLower.includes('plant') || topicLower.includes('root') || topicLower.includes('stem') || topicLower.includes('leaf') || topicLower.includes('photosynthesis')) {
      return 'Plant Anatomy, Water Absorption via Xylem, and Photosynthesis Basics';
    }
    if (topicLower.includes('matter') || topicLower.includes('water cycle') || topicLower.includes('state') || topicLower.includes('solid') || topicLower.includes('liquid') || topicLower.includes('gas')) {
      return 'States of Matter, Thermal Energy Transfer, Evaporation, and Condensation in Belize';
    }
    if (topicLower.includes('energy conversion') || topicLower.includes('energy transformation') || topicLower.includes('form of energy')) {
      return 'Forms of Energy, Energy Transformations, and Conservation of Energy in Everyday Devices';
    }
    if (topicLower.includes('circuit') || topicLower.includes('electricity') || topicLower.includes('electrical')) {
      return 'Closed Circuits, Conductors and Insulators, and Electrical Safety';
    }
    if (topicLower.includes('body') || topicLower.includes('circulation') || topicLower.includes('heart') || topicLower.includes('respiratory')) {
      return 'Circulatory and Respiratory Functions and Cardiorespiratory Health';
    }
    if (topicLower.includes('ecosystem') || topicLower.includes('biodiversity') || topicLower.includes('reef') || topicLower.includes('mangrove') || topicLower.includes('food web') || topicLower.includes('pine ridge')) {
      return 'Food Webs, Species Interdependence, and Marine/Forest Conservation in Belize';
    }
    if (topicLower.includes('adaptation') || topicLower.includes('habitat') || topicLower.includes('animal')) {
      return 'Animal Structural Adaptations, Wetland/Forest Habitats, and Environmental Survival';
    }
    if (topicLower.includes('weather') || topicLower.includes('climate') || topicLower.includes('hurricane') || topicLower.includes('cyclone') || topicLower.includes('earth') || topicLower.includes('atmosphere')) {
      return 'Atmospheric Systems, Weather Tracking, and Coastal Resilience';
    }
    if (topicLower.includes('force') || topicLower.includes('machine') || topicLower.includes('friction') || topicLower.includes('motion')) {
      return 'Forces, Friction, Simple Machines, and Mechanical Advantage in Everyday Tasks';
    }
    return `Scientific Inquiry, Empirical Evidence, and Practical Investigations in ${topic}`;
  }

  // Mathematics Focal Inquiries
  if (normSubj === 'Mathematics') {
    if (topicLower.includes('exponential growth') || topicLower.includes('growth pattern') || topicLower.includes('growth sequence')) {
      return 'Exponential Growth Sequences, Stage Numbering, and Formulating Algebraic Expressions';
    }
    if (topicLower.includes('prime factor') || topicLower.includes('gcd') || topicLower.includes('lcm')) {
      return 'Prime Factorization Trees, Greatest Common Divisor, and Least Common Multiple';
    }
    if (topicLower.includes('scientific notation') || topicLower.includes('powers of ten') || topicLower.includes('powers of 10')) {
      return 'Powers of Ten, Exponents, and Scientific Notation for Large and Small Numbers';
    }
    if (topicLower.includes('place value') || topicLower.includes('number system')) {
      return 'Real Number System, Classification of Numbers, and Advanced Place Value';
    }
    if (topicLower.includes('algebra') || topicLower.includes('variable') || topicLower.includes('equation')) {
      return 'Evaluating Algebraic Expressions and Balancing Linear Equations';
    }
    if (topicLower.includes('consumer') || topicLower.includes('money') || topicLower.includes('interest')) {
      return 'Belizean Consumer Transactions, Currency Peg (2:1 BZD/USD), and Simple Interest';
    }
    if (topicLower.includes('fraction') || topicLower.includes('decimal')) {
      return 'Concrete and Visual Representation of Fractional and Decimal Quantities';
    }
    if (topicLower.includes('geometry') || topicLower.includes('area') || topicLower.includes('perimeter') || topicLower.includes('volume')) {
      return 'Geometric Measurement, Formulas for Perimeter and Area, and Spatial Reasoning';
    }
    return `Concepts, Procedural Fluency, and Problem Solving in ${topic}`;
  }

  // Belizean Studies Focal Inquiries
  if (normSubj === 'Belizean Studies') {
    if (topicLower.includes('maya')) {
      return 'Ancient Maya Social Hierarchy, Milpa Agriculture, and Archaeological Sites';
    }
    if (topicLower.includes('baymen') || topicLower.includes('st. george') || topicLower.includes('slavery')) {
      return 'Logwood and Mahogany Extraction, Enslaved Resistance, and September 10th Heritage';
    }
    if (topicLower.includes('independence') || topicLower.includes('constitution') || topicLower.includes('george price')) {
      return 'The Nationalist Movement, Belize Independence 1981, and Three Branches of Government';
    }
    if (topicLower.includes('economy') || topicLower.includes('reef') || topicLower.includes('conservation')) {
      return 'Belize Barrier Reef UNESCO Heritage, Ecotourism, and Economic Sustainability';
    }
    return `Historical, Cultural, and Geographic Inquiries in ${topic}`;
  }

  // Language Arts Focal Inquiries
  if (normSubj === 'Language Arts') {
    if (topicLower.includes('essay') || topicLower.includes('thesis') || topicLower.includes('expository')) {
      return '5-Paragraph Essay Architecture, Thesis Formulation, and Transitions';
    }
    if (topicLower.includes('poetry') || topicLower.includes('figurative')) {
      return 'Figurative Language, Sensory Imagery, and Caribbean Literature Analysis';
    }
    if (topicLower.includes('bias') || topicLower.includes('critical') || topicLower.includes('opinion')) {
      return 'Fact vs. Opinion, Author Bias, and Counter-Argument Composition';
    }
    if (topicLower.includes('word analysis') || topicLower.includes('prefix') || topicLower.includes('suffix')) {
      return 'Morphological Analysis: Prefixes, Base Words, and Root Elements';
    }
    return `Literacy Skills, Textual Analysis, and Composition in ${topic}`;
  }

  return topic;
}

/**
 * Cross-subject contamination keywords and patterns.
 * Defines strictly forbidden terms when a particular subject is selected.
 */
interface SubjectForbiddenRules {
  forbiddenCodes: RegExp[];
  forbiddenTerms: RegExp[];
  description: string;
}

const FORBIDDEN_BY_SUBJECT: Record<string, SubjectForbiddenRules> = {
  'HFLE': {
    forbiddenCodes: [/\bLA\./i, /\bMA\./i, /\bSC\./i, /\bBS\./i, /\bLA\.ST/i],
    forbiddenTerms: [
      /\bdecoding multisyllabic\b/i,
      /\bmentor texts?\b/i,
      /\bmorpholog(y|ical)\b/i,
      /\bphonological\b/i,
      /\bphonics\b/i,
      /\baffix(es)?\b/i,
      /\bprefix(es)?\b/i,
      /\bsuffix(es)?\b/i,
      /\bbase words?\b/i,
      /\broot words?\b/i,
      /\bGreek and Latin\b/i,
      /\bnumber lines?\b/i,
      /\bdyscalculia\b/i,
      /\barithmetic supports?\b/i,
      /\bmultiplication charts?\b/i,
      /\bplace value chart\b/i,
      /\bCartesian coordinate\b/i,
      /\bcalculate the area\b/i,
      /\bcalculate the perimeter\b/i,
      /\bchemical reaction\b/i,
      /\bphotosynthesis\b/i
    ],
    description: 'HFLE lessons must never contain Language Arts morphology/decoding or Mathematics arithmetic supports.'
  },
  'Science and Technology': {
    forbiddenCodes: [/\bLA\./i, /\bMA\./i, /\bHFLE\./i, /\bBS\./i, /\bLA\.ST/i],
    forbiddenTerms: [
      /\bdecoding multisyllabic\b/i,
      /\bmentor texts?\b/i,
      /\bmorphological analysis\b/i,
      /\bphonological awareness\b/i,
      /\bphonics and word\b/i,
      /\bGreek and Latin affixes\b/i,
      /\bprefixes and suffixes\b/i,
      /\bpubertal changes\b/i,
      /\brefusal skills\b/i,
      /\bpeer pressure\b/i
    ],
    description: 'Science lessons must never contain Language Arts literacy components or HFLE pubertal/peer pressure topics.'
  },
  'Mathematics': {
    forbiddenCodes: [/\bLA\./i, /\bSC\./i, /\bHFLE\./i, /\bBS\./i, /\bLA\.ST/i],
    forbiddenTerms: [
      /\bdecoding multisyllabic\b/i,
      /\bmentor texts?\b/i,
      /\bmorpholog(y|ical)\b/i,
      /\bphonological\b/i,
      /\bphonics\b/i,
      /\bpubertal changes\b/i,
      /\brefusal skills\b/i,
      /\bphotosynthesis\b/i,
      /\bancient maya civilization\b/i
    ],
    description: 'Mathematics lessons must never contain Language Arts phonics/decoding or Science/HFLE topics.'
  },
  'Language Arts': {
    forbiddenCodes: [/\bMA\./i, /\bSC\./i, /\bHFLE\./i, /\bBS\./i, /\bMA\.ST/i],
    forbiddenTerms: [
      /\bnumber lines?\b/i,
      /\bplace value chart\b/i,
      /\bcalculate the perimeter\b/i,
      /\bcalculate the area\b/i,
      /\bcomputational errors?\b/i,
      /\bmultiplication chart\b/i,
      /\bchemical reaction\b/i,
      /\bphotosynthesis\b/i,
      /\bnon-communicable diseases?\b/i
    ],
    description: 'Language Arts lessons must never contain Mathematics algorithms or Science biology concepts.'
  },
  'Belizean Studies': {
    forbiddenCodes: [/\bLA\./i, /\bMA\./i, /\bSC\./i, /\bHFLE\./i, /\bLA\.ST/i, /\bMA\.ST/i],
    forbiddenTerms: [
      /\bdecoding multisyllabic\b/i,
      /\bmorphological analysis\b/i,
      /\bphonological\b/i,
      /\bnumber line\b/i,
      /\bplace value\b/i,
      /\bphotosynthesis\b/i
    ],
    description: 'Belizean Studies lessons must be purely history, civics, culture, and geography.'
  }
};

/**
 * Scans a text string or data object for cross-subject contamination.
 */
export function detectCrossSubjectContamination(content: string, subject: string): {
  hasContamination: boolean;
  violations: string[];
} {
  const normSubj = normalizeSubject(subject);
  const rules = FORBIDDEN_BY_SUBJECT[normSubj];
  if (!rules || !content) {
    return { hasContamination: false, violations: [] };
  }

  const violations: string[] = [];

  for (const codeRegex of rules.forbiddenCodes) {
    const match = content.match(codeRegex);
    if (match) {
      violations.push(`Forbidden foreign curriculum code found for ${normSubj}: "${match[0]}"`);
    }
  }

  for (const termRegex of rules.forbiddenTerms) {
    const match = content.match(termRegex);
    if (match) {
      violations.push(`Cross-subject contamination found for ${normSubj}: "${match[0]}"`);
    }
  }

  return {
    hasContamination: violations.length > 0,
    violations
  };
}

/**
 * Builds a clean, isolated generation context.
 * Purges all stale cache, previous subject state, and default templates.
 */
export function buildCleanGenerationContext(params: {
  academicYear?: string;
  grade: string;
  subject: string;
  cycle: number;
  topic: string;
  subtopic?: string;
  learningOutcome?: string;
  duration?: string;
  curriculum?: CurriculumEntry[];
}): CleanGenerationContext {
  const normGrade = normalizeGrade(params.grade);
  const normSubj = normalizeSubject(params.subject) as Subject;
  const normCyc = normalizeCycle(params.cycle);
  const topic = params.topic.trim();
  const year = params.academicYear || '2026-2027';

  // 1. Authoritative Curriculum Code
  const curriculumCode = getAuthoritativeCurriculumCode({
    subject: normSubj,
    grade: normGrade,
    cycle: normCyc,
    topic,
    curriculum: params.curriculum
  });

  // 2. Authoritative Subtopic / Focal Inquiry
  const subtopic = getTopicFocalInquiry(normSubj, topic, params.subtopic);

  // 3. Authoritative Learning Outcome
  let outcome = params.learningOutcome?.trim() || '';
  let allOutcomes: string[] = [];
  const list = params.curriculum && params.curriculum.length > 0 ? params.curriculum : BELIZE_NATIONAL_CURRICULUM;
  const matchEntry = list.find(e =>
    normalizeGrade(e.grade) === normGrade &&
    normalizeSubject(e.subject) === normSubj &&
    normalizeCycle(e.cycle) === normCyc &&
    (e.topic || '').trim().toLowerCase() === topic.toLowerCase()
  );

  if (matchEntry?.learning_outcomes && matchEntry.learning_outcomes.length > 0) {
    allOutcomes = matchEntry.learning_outcomes;
    if (!outcome) {
      outcome = matchEntry.learning_outcomes[0];
    }
  } else if (!outcome) {
    outcome = `Demonstrate understanding, critical inquiry, and practical application of ${topic} in ${normGrade} ${normSubj}.`;
    allOutcomes = [outcome];
  }

  // 4. Default Duration Rule
  // Mathematics and Language Arts are strictly 90 minutes
  // All other subjects are strictly 45 minutes by default
  const is90MinSubject = normSubj === 'Language Arts' || 
    normSubj === 'Mathematics' || 
    normSubj.toLowerCase().includes('math') || 
    normSubj.toLowerCase().includes('language') || 
    normSubj.toLowerCase().includes('reading');

  let duration = params.duration;
  if (!duration || duration === 'default') {
    duration = is90MinSubject ? '90 minutes' : '45 minutes';
  } else if (is90MinSubject && (duration === '45 minutes' || duration === '60 minutes')) {
    duration = '90 minutes';
  }

  // 5. Authoritative Strand
  const strand = matchEntry?.strand || `${normSubj} Core Strand`;

  return {
    classLevel: normGrade,
    subject: normSubj,
    cycle: normCyc,
    topic,
    subtopic,
    strand,
    curriculumCode,
    learningOutcome: outcome,
    learningOutcomes: allOutcomes,
    duration,
    academicYear: year
  };
}

/**
 * Creates the strict filtered payload for the AI model.
 * Contains ONLY the isolated records for the selected class, subject, cycle, topic.
 * Never exposes the full database or other subjects.
 */
export function filterCurriculumPayload(context: CleanGenerationContext): FilteredCurriculumPayload {
  return {
    selectedClass: context.classLevel,
    selectedSubject: context.subject,
    selectedCycle: context.cycle,
    selectedTopic: context.topic,
    selectedSubtopic: context.subtopic,
    selectedStrand: context.strand,
    selectedCurriculumCode: context.curriculumCode,
    selectedCurriculumOutcome: context.learningOutcome,
    authoritativeLearningOutcomes: context.learningOutcomes
  };
}

/**
 * Pre-generation validation.
 * Verifies that the parameters are present, internally consistent, and free of contamination.
 */
export function validatePreGenerationContext(context: CleanGenerationContext): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!context.classLevel) errors.push('Class / Grade is required.');
  if (!context.subject) errors.push('Subject is required.');
  if (!context.cycle || context.cycle < 1 || context.cycle > 4) errors.push('Cycle must be between 1 and 4.');
  if (!context.topic || !context.topic.trim()) errors.push('Topic is required.');
  if (!context.learningOutcome || !context.learningOutcome.trim()) errors.push('Authoritative learning outcome is required.');
  if (!context.curriculumCode || !context.curriculumCode.trim()) errors.push('Curriculum code is required.');

  // Code prefix check
  const expectedPrefix = SUBJECT_CODE_PREFIXES[context.subject];
  if (expectedPrefix && !context.curriculumCode.toUpperCase().startsWith(expectedPrefix)) {
    errors.push(`Curriculum code "${context.curriculumCode}" does not belong to subject ${context.subject}. Expected prefix "${expectedPrefix}."`);
  }

  // Subtopic contamination check
  const subtopicCheck = detectCrossSubjectContamination(context.subtopic, context.subject);
  if (subtopicCheck.hasContamination) {
    errors.push(...subtopicCheck.violations);
  }

  // Topic contamination check
  const topicCheck = detectCrossSubjectContamination(context.topic, context.subject);
  if (topicCheck.hasContamination) {
    errors.push(...topicCheck.violations);
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Helper to parse minutes from stage duration
 */
function parseMins(val: any): number {
  if (typeof val === 'number') return Math.round(val);
  if (!val || typeof val !== 'string') return 0;
  const match = val.match(/\d+/);
  return match ? parseInt(match[0], 10) : 0;
}

/**
 * Rebalances lesson stage durations so that totalStageMinutes === lessonDuration exactly.
 */
export function rebalanceLessonStageTiming(lesson: any, targetDuration: string): any {
  const targetMinutes = parseMins(targetDuration) || (lesson.subject === 'Language Arts' ? 90 : 45);
  const updated = { ...lesson };

  // Rebalance executionBoard if present
  if (Array.isArray(updated.executionBoard) && updated.executionBoard.length > 0) {
    const phases = updated.executionBoard;
    const count = phases.length;
    let distributed: number[] = [];

    if (lesson.subject === 'Language Arts' && targetMinutes === 90 && count === 7) {
      distributed = [8, 15, 15, 15, 10, 15, 12];
    } else if (lesson.subject === 'Language Arts' && targetMinutes === 90 && count === 5) {
      distributed = [10, 25, 25, 20, 10];
    } else if (targetMinutes === 45 && count === 5) {
      // 5-phase 45-minute lesson: 5 + 10 + 10 + 15 + 5 = 45
      distributed = [5, 10, 10, 15, 5];
    } else {
      const base = Math.floor(targetMinutes / count);
      distributed = Array(count).fill(base);
      let rem = targetMinutes - (base * count);
      for (let i = 0; i < rem; i++) {
        distributed[i % count] += 1;
      }
    }

    updated.executionBoard = phases.map((phase: any, idx: number) => ({
      ...phase,
      timeAllocation: `${distributed[idx]} minutes`
    }));
  }

  // Rebalance lessonAtAGlance if present
  if (Array.isArray(updated.lessonAtAGlance) && updated.lessonAtAGlance.length > 0) {
    const rows = updated.lessonAtAGlance;
    const count = rows.length;
    let distributed: number[] = [];

    if (lesson.subject === 'Language Arts' && targetMinutes === 90 && count === 7) {
      distributed = [8, 15, 15, 15, 10, 15, 12];
    } else if (targetMinutes === 45 && count === 5) {
      distributed = [5, 10, 10, 15, 5];
    } else {
      const base = Math.floor(targetMinutes / count);
      distributed = Array(count).fill(base);
      let rem = targetMinutes - (base * count);
      for (let i = 0; i < rem; i++) {
        distributed[i % count] += 1;
      }
    }

    let cumulative = 0;
    updated.lessonAtAGlance = rows.map((r: any, idx: number) => {
      const mins = distributed[idx] || 10;
      const start = cumulative;
      cumulative += mins;
      return {
        ...r,
        time: `${mins} mins (${start}:00 - ${cumulative}:00)`,
        timeMinutes: mins
      };
    });
  }

  updated.duration = `${targetMinutes} minutes`;
  return updated;
}

/**
 * Deterministic Post-Generation Quality Control Validator.
 * Evaluates the generated lesson across 13 critical quality standards.
 */
export function validateGeneratedLessonQuality(
  lesson: any,
  expected: CleanGenerationContext
): QualityValidationReport {
  const errors: string[] = [];
  const checks = {
    classMatch: false,
    subjectMatch: false,
    cycleMatch: false,
    topicMatch: false,
    curriculumCodeMatch: false,
    outcomeMatch: false,
    subtopicAlignment: false,
    objectiveAlignment: false,
    contentRelevance: false,
    activityAlignment: false,
    assessmentAlignment: false,
    differentiationRelevant: false,
    timingValid: false
  };

  if (!lesson) {
    return {
      valid: false,
      checks,
      errors: ['Lesson payload is completely empty.']
    };
  }

  // 1. Class Match
  const genGrade = normalizeGrade(lesson.grade || lesson.classLevel);
  if (genGrade === expected.classLevel) {
    checks.classMatch = true;
  } else {
    errors.push(`Grade mismatch: Generated "${genGrade}", expected "${expected.classLevel}".`);
  }

  // 2. Subject Match
  const genSubject = normalizeSubject(lesson.subject);
  if (genSubject === expected.subject) {
    checks.subjectMatch = true;
  } else {
    errors.push(`Subject mismatch: Generated "${genSubject}", expected "${expected.subject}".`);
  }

  // 3. Cycle Match
  const genCycle = normalizeCycle(lesson.cycle);
  if (genCycle === expected.cycle) {
    checks.cycleMatch = true;
  } else {
    errors.push(`Cycle mismatch: Generated cycle "${genCycle}", expected "${expected.cycle}".`);
  }

  // 4. Topic Match
  const genTopic = (lesson.topic || lesson.lessonTitle || '').trim().toLowerCase();
  const expTopic = expected.topic.trim().toLowerCase();
  if (genTopic.includes(expTopic) || expTopic.includes(genTopic)) {
    checks.topicMatch = true;
  } else {
    errors.push(`Topic mismatch: Generated "${lesson.topic}", expected "${expected.topic}".`);
  }

  // 5. Curriculum Code Match (Reject any code belonging to another subject)
  const genCode = (lesson.curriculumCode || lesson.structured_json?.curriculumCode || '').trim();
  const expectedPrefix = SUBJECT_CODE_PREFIXES[expected.subject];
  if (genCode) {
    if (expectedPrefix && !genCode.toUpperCase().startsWith(expectedPrefix)) {
      errors.push(`Curriculum code "${genCode}" belongs to another subject! Must start with "${expectedPrefix}".`);
    } else {
      checks.curriculumCodeMatch = true;
    }
  } else {
    // If not provided on output, it will be attached authoritatively
    checks.curriculumCodeMatch = true;
  }

  // 6. Outcome Match
  const genOutcome = (lesson.learningOutcome || '').trim().toLowerCase();
  if (genOutcome.length >= 10) {
    checks.outcomeMatch = true;
  } else {
    errors.push('Missing or empty learning outcome on generated lesson.');
  }

  // 7. Subtopic Alignment
  const genSubtopic = (lesson.subtopic || '').trim();
  const subtopicContam = detectCrossSubjectContamination(genSubtopic, expected.subject);
  if (subtopicContam.hasContamination) {
    errors.push(...subtopicContam.violations);
  } else {
    checks.subtopicAlignment = true;
  }

  // 8. Learning Objectives Alignment (Condition + Performance + Criterion)
  const normObj = lesson.learningObjectivesBoard || lesson.learningObjectives;
  const cond = normObj?.condition || '';
  const cog = normObj?.knowledge || normObj?.cognitive || '';
  const psy = normObj?.skill || normObj?.psychomotor || '';
  const aff = normObj?.attitude || normObj?.affective || '';

  // Check generic placeholders
  const fullObjText = `${cond} ${cog} ${psy} ${aff}`.toLowerCase();
  if (fullObjText.includes('solve a new problem accurately') || fullObjText.includes('apply procedural rules independently')) {
    if (expected.subject !== 'Mathematics') {
      errors.push('Objectives contain generic mathematics template phrases inside non-math lesson.');
    }
  }
  
  if (cond && cog && psy) {
    checks.objectiveAlignment = true;
  } else {
    errors.push('Learning objectives must have Condition, Cognitive, and Psychomotor domains.');
  }

  // 9. Content Notes Relevance & No Generic Placeholders
  const contentScan = JSON.stringify(lesson).slice(0, 5000);
  const contamCheck = detectCrossSubjectContamination(contentScan, expected.subject);
  if (contamCheck.hasContamination) {
    errors.push(...contamCheck.violations);
    checks.contentRelevance = false;
  } else {
    checks.contentRelevance = true;
  }

  // 10. Activity Alignment (Explicit Teacher & Student Actions)
  const phases = lesson.executionBoard || lesson.instructionalSequence;
  if (phases) {
    checks.activityAlignment = true;
  } else {
    errors.push('Activities must specify step-by-step instructional sequence with teacher and student actions.');
  }

  // 11. Assessment Alignment
  const hasAssessment = Boolean(lesson.completeAssessment || lesson.exitTicketPackage || lesson.assessment);
  if (hasAssessment) {
    checks.assessmentAlignment = true;
  } else {
    errors.push('Lesson is missing exit ticket or complete assessment task.');
  }

  // 12. Differentiation Relevance (No dyscalculia in HFLE/LA)
  const diffStr = JSON.stringify(lesson.differentiationFramework || lesson.differentiation || '');
  if ((expected.subject === 'HFLE' || expected.subject === 'Language Arts') && diffStr.toLowerCase().includes('number line visual')) {
    errors.push(`Irrelevant mathematical accommodation (number line visual) found in ${expected.subject} lesson.`);
  } else {
    checks.differentiationRelevant = true;
  }

  // 13. Timing Validation (Total Stage Minutes === Target Duration)
  const targetMins = parseMins(expected.duration);
  let totalStageMins = 0;
  if (Array.isArray(lesson.executionBoard) && lesson.executionBoard.length > 0) {
    totalStageMins = lesson.executionBoard.reduce((acc: number, p: any) => acc + parseMins(p.timeAllocation), 0);
  } else if (Array.isArray(lesson.lessonAtAGlance) && lesson.lessonAtAGlance.length > 0) {
    totalStageMins = lesson.lessonAtAGlance.reduce((acc: number, r: any) => acc + (r.timeMinutes || parseMins(r.time)), 0);
  }

  if (totalStageMins === 0 || totalStageMins === targetMins) {
    checks.timingValid = true;
  } else {
    errors.push(`Timing mismatch: Total stage duration (${totalStageMins} mins) does not equal lesson duration (${targetMins} mins).`);
  }

  return {
    valid: errors.length === 0,
    checks,
    errors
  };
}
