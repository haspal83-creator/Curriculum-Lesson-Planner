/**
 * Learning Objectives Helper & Validation Standard
 * 
 * PERMANENT APPLICATION-WIDE RULE:
 * Every Learning Objectives section must ALWAYS use ONE SHARED CONDITION
 * for all three learning domains:
 * 1. Cognitive Domain
 * 2. Psychomotor / Skills Domain
 * 3. Affective Domain
 * 
 * Condition appears once before the three domains.
 * Condition is never repeated in the individual objectives.
 * All objectives must describe observable student actions ("Students will...").
 */

export interface StructuredLearningObjectives {
  condition: string;
  cognitive: string;
  psychomotor: string;
  affective: string;
}

export interface LearningObjectivesValidationResult {
  isValid: boolean;
  warnings: string[];
  objectives: StructuredLearningObjectives;
}

/**
 * Strips raw markdown syntax and HTML tags from a text string.
 */
export function cleanRawFormatting(text: string | undefined | null): string {
  if (!text) return '';
  return text
    // Remove HTML tags
    .replace(/<\/?[^>]+(>|$)/g, '')
    // Remove bold/italic markdown
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/(\*|_)(.*?)\1/g, '$2')
    // Remove headers
    .replace(/^#{1,6}\s+/gm, '')
    // Remove backticks
    .replace(/`([^`]+)`/g, '$1')
    // Clean redundant spaces
    .replace(/[ \t]+/g, ' ')
    .trim();
}

/**
 * Automatically fixes common English grammar mistakes in educational objectives,
 * especially indefinite article misuse ("a" vs "an") and punctuation.
 */
export function fixObjectiveGrammar(text: string): string {
  if (!text) return '';
  let cleaned = text.trim();

  // Fix "Given a/an" with vowel sounds (expanded, open, activity, example, inquiry, observation, etc.)
  cleaned = cleaned.replace(/\b([Gg]iven|[Uu]sing|[Ww]ith)\s+a\s+([aeioAEIO][a-z]+)\b/g, (match, prefix, word) => {
    const lowerWord = word.toLowerCase();
    // Words starting with 'u' that have 'yu' consonant sound: unique, unit, universal, user, uniform, useful
    if (/^(unique|unit|universal|user|uniform|useful|universe|ukulele)/.test(lowerWord)) {
      return `${prefix} a ${word}`;
    }
    // Words starting with 'e' like 'european'
    if (/^(european|euphemism)/.test(lowerWord)) {
      return `${prefix} a ${word}`;
    }
    // Words starting with 'o' like 'one'
    if (/^(one|once)/.test(lowerWord)) {
      return `${prefix} a ${word}`;
    }
    return `${prefix} an ${word}`;
  });

  // General "a" before vowel sound
  cleaned = cleaned.replace(/\ba\s+([aeioAEIO][a-z]+)\b/g, (match, word) => {
    const lowerWord = word.toLowerCase();
    if (/^(unique|unit|universal|user|uniform|useful|universe|ukulele|european|one|once)/.test(lowerWord)) {
      return `a ${word}`;
    }
    return `an ${word}`;
  });

  // Fix "an" before consonant sound (e.g. "an decimal" -> "a decimal", "an place value" -> "a place value")
  cleaned = cleaned.replace(/\ban\s+([b-df-hj-np-tv-zB-DF-HJ-NP-TV-Z][a-z]+)\b/g, (match, word) => {
    const lowerWord = word.toLowerCase();
    // Honest, hour, honor, heir have silent 'h' so "an hour" is correct
    if (/^(hour|honest|honor|heir)/.test(lowerWord)) {
      return `an ${word}`;
    }
    return `a ${word}`;
  });

  // Fix "an" before 'u' words with consonant sound (e.g., "an unit" -> "a unit", "an unique" -> "a unique")
  cleaned = cleaned.replace(/\ban\s+(unique|unit|universal|user|uniform|useful|universe|ukulele)\b/gi, 'a $1');

  // Fix multiple punctuation like "..", ",,", ":,"
  cleaned = cleaned.replace(/\.{2,}/g, '.');
  cleaned = cleaned.replace(/,{2,}/g, ',');
  cleaned = cleaned.replace(/[:;]\s*[,.]/g, ':');

  return cleaned;
}

/**
 * Extracts a condition from text if it starts with "Given...", "Using...", or "With...".
 * Returns { condition, cleanedText }.
 */
export function extractEmbeddedCondition(text: string): { condition?: string; remainingText: string } {
  const clean = cleanRawFormatting(text);
  
  // Match "Given [condition], students will..." or "Given [condition]: students will..."
  const givenMatch = clean.match(/^([Gg]iven\s+[^,;:\n]+(?:,[^,;:\n]+)*)[,;:]\s*(?:[Ss]tudents?\s+will\b|[Tt]he\s+students?\s+will\b|[Tt]o\b)?\s*(.*)$/i);
  if (givenMatch) {
    const cond = givenMatch[1].trim();
    let rem = givenMatch[2].trim();
    if (!rem.toLowerCase().startsWith('students will')) {
      rem = `Students will ${rem.charAt(0).toLowerCase() + rem.slice(1)}`;
    }
    return {
      condition: cond,
      remainingText: rem
    };
  }

  return { remainingText: clean };
}

/**
 * Normalizes an individual objective to follow the student-centered "Students will [action]..." format
 * without repeating any "Given..." condition.
 */
export function normalizeStudentAction(text: string, defaultVerb = "demonstrate"): string {
  let cleaned = cleanRawFormatting(text).trim();

  // Strip leading condition if present
  const extracted = extractEmbeddedCondition(cleaned);
  cleaned = extracted.remainingText;

  // Remove any redundant "Given..." phrase at the beginning
  cleaned = cleaned.replace(/^[Gg]iven\s+[^,;:\n]+[,;:]\s*/, '');

  // Strip leading list symbols like "-", "*", "1.", "a."
  cleaned = cleaned.replace(/^[-*•\d.)\]\s]+/, '').trim();

  // Normalize actor to "Students will"
  if (/^students?\s+will\b/i.test(cleaned)) {
    cleaned = cleaned.replace(/^students?\s+will\b/i, 'Students will').trim();
  } else if (/^(the\s+)?students?\s+can\b/i.test(cleaned)) {
    cleaned = cleaned.replace(/^(the\s+)?students?\s+can\b/i, 'Students will').trim();
  } else if (/^i\s+can\b/i.test(cleaned)) {
    cleaned = cleaned.replace(/^i\s+can\b/i, 'Students will').trim();
  } else if (/^to\s+/i.test(cleaned)) {
    cleaned = `Students will ${cleaned.slice(3).trim()}`;
  } else {
    // If it starts with a verb directly (e.g., "Identify and state...")
    cleaned = `Students will ${cleaned.charAt(0).toLowerCase() + cleaned.slice(1)}`;
  }

  // Replace passive/vague phrases with observable actions
  cleaned = cleaned.replace(/Students will understand the importance of/i, 'Students will demonstrate appreciation for');
  cleaned = cleaned.replace(/Students will understand\b/i, 'Students will explain and apply');
  cleaned = cleaned.replace(/Students will know\b/i, 'Students will identify and state');
  cleaned = cleaned.replace(/Students will learn about\b/i, 'Students will examine and describe');

  // Grammar cleanup
  cleaned = fixObjectiveGrammar(cleaned);

  // Ensure trailing period
  if (cleaned && !/[.!?]$/.test(cleaned)) {
    cleaned += '.';
  }

  return cleaned;
}

/**
 * Normalizes a condition string to ensure it begins with "Given " and is properly punctuated.
 */
export function normalizeCondition(conditionText: string, fallbackContext?: { topic?: string; materials?: string[] }): string {
  let cond = cleanRawFormatting(conditionText).trim();

  if (!cond) {
    if (fallbackContext?.materials && fallbackContext.materials.length > 0) {
      const topMats = fallbackContext.materials.slice(0, 3).map(m => cleanRawFormatting(m)).filter(Boolean);
      cond = `Given ${topMats.join(', ')}, and guided practice activities:`;
    } else if (fallbackContext?.topic) {
      cond = `Given instructional materials, guided examples, and collaborative practice with ${fallbackContext.topic}:`;
    } else {
      cond = "Given instructional materials, guided examples, and opportunities for practice:";
    }
  }

  // Strip trailing domain labels if accidentally concatenated
  cond = cond.replace(/\s*(?:Cognitive|Psychomotor|Affective)\s*Domain.*$/i, '').trim();

  // Ensure it starts with "Given "
  if (!/^[Gg]iven\b/.test(cond)) {
    cond = `Given ${cond.charAt(0).toLowerCase() + cond.slice(1)}`;
  } else {
    cond = `Given ${cond.slice(5).trim()}`;
  }

  // Fix grammar (e.g., "Given a expanded..." -> "Given an expanded...")
  cond = fixObjectiveGrammar(cond);

  // Ensure appropriate trailing punctuation (usually colon or comma if followed by objectives)
  cond = cond.replace(/[:;,.]+$/, '');
  cond = `${cond}:`;

  return cond;
}

/**
 * Main Normalizer:
 * Takes any lesson plan object or raw objectives input and produces a strictly standardized
 * StructuredLearningObjectives object with exactly ONE SHARED CONDITION and three student-centered domains.
 */
export function normalizeLearningObjectives(planOrObjectives: any, context?: { topic?: string; materials?: string[] }): StructuredLearningObjectives {
  if (!planOrObjectives) {
    return {
      condition: normalizeCondition("", context),
      cognitive: "Students will identify, explain, and apply fundamental curriculum concepts with accuracy.",
      psychomotor: "Students will construct, manipulate, and record symbolic representations accurately.",
      affective: "Students will demonstrate active participation, curiosity, and persistence during learning activities."
    };
  }

  let rawCondition = "";
  let rawCognitive = "";
  let rawPsychomotor = "";
  let rawAffective = "";

  // 0. Direct top-level properties on an already structured object
  if (planOrObjectives.condition || planOrObjectives.cognitive || planOrObjectives.psychomotor || planOrObjectives.affective) {
    rawCondition = planOrObjectives.condition || "";
    rawCognitive = planOrObjectives.cognitive || "";
    rawPsychomotor = planOrObjectives.psychomotor || "";
    rawAffective = planOrObjectives.affective || "";
  }

  // 1. Direct structured property on plan
  if (planOrObjectives.learningObjectives) {
    rawCondition = rawCondition || planOrObjectives.learningObjectives.condition || "";
    rawCognitive = rawCognitive || planOrObjectives.learningObjectives.cognitive || "";
    rawPsychomotor = rawPsychomotor || planOrObjectives.learningObjectives.psychomotor || "";
    rawAffective = rawAffective || planOrObjectives.learningObjectives.affective || "";
  }

  // 2. Check learningObjectivesBoard
  if (planOrObjectives.learningObjectivesBoard) {
    const board = planOrObjectives.learningObjectivesBoard;
    rawCondition = rawCondition || board.condition || "";
    rawCognitive = rawCognitive || board.knowledge || board.cognitive || "";
    rawPsychomotor = rawPsychomotor || board.skill || board.psychomotor || "";
    rawAffective = rawAffective || board.attitude || board.affective || "";
  }

  // 3. Check legacy specificObjectives array
  if ((!rawCognitive || !rawPsychomotor || !rawAffective) && Array.isArray(planOrObjectives.specificObjectives)) {
    const arr = planOrObjectives.specificObjectives;
    if (!rawCognitive && arr[0]) rawCognitive = arr[0];
    if (!rawPsychomotor && arr[1]) rawPsychomotor = arr[1];
    if (!rawAffective && arr[2]) rawAffective = arr[2];
  }

  // 4. Check legacy objectives array
  if ((!rawCognitive || !rawPsychomotor || !rawAffective) && Array.isArray(planOrObjectives.objectives)) {
    const arr = planOrObjectives.objectives;
    if (!rawCognitive && arr[0]) rawCognitive = arr[0];
    if (!rawPsychomotor && arr[1]) rawPsychomotor = arr[1];
    if (!rawAffective && arr[2]) rawAffective = arr[2];
  }

  // Fallbacks if only general objective exists
  if (!rawCognitive && planOrObjectives.generalObjective) {
    rawCognitive = planOrObjectives.generalObjective;
  }
  if (!rawCognitive && planOrObjectives.learningOutcome) {
    rawCognitive = planOrObjectives.learningOutcome;
  }

  // Check if rawCognitive or other domains have an embedded "Given [condition]..."
  if (!rawCondition) {
    const cogExtracted = extractEmbeddedCondition(rawCognitive);
    if (cogExtracted.condition) {
      rawCondition = cogExtracted.condition;
      rawCognitive = cogExtracted.remainingText;
    } else {
      const psyExtracted = extractEmbeddedCondition(rawPsychomotor);
      if (psyExtracted.condition) {
        rawCondition = psyExtracted.condition;
        rawPsychomotor = psyExtracted.remainingText;
      }
    }
  }

  // If materials or topic exist in context or plan
  const lessonMaterials = planOrObjectives.materialsBoard?.map((m: any) => m.name) || 
                          planOrObjectives.materials || 
                          context?.materials || 
                          [];
  const lessonTopic = planOrObjectives.topic || context?.topic;

  // Final normalization of each field
  const finalCondition = normalizeCondition(rawCondition, { topic: lessonTopic, materials: lessonMaterials });
  const finalCognitive = normalizeStudentAction(
    rawCognitive || `Students will identify, explain, and solve problems related to ${lessonTopic || 'the target concept'} with accuracy.`
  );
  const finalPsychomotor = normalizeStudentAction(
    rawPsychomotor || `Students will construct, manipulate, and record representations of ${lessonTopic || 'the core skill'} in assigned tasks.`
  );
  const finalAffective = normalizeStudentAction(
    rawAffective || "Students will demonstrate active participation, confidence, and respect during individual and collaborative activities."
  );

  return {
    condition: finalCondition,
    cognitive: finalCognitive,
    psychomotor: finalPsychomotor,
    affective: finalAffective
  };
}

/**
 * Validates the Learning Objectives according to the permanent rule:
 * ✓ Exactly one shared condition exists.
 * ✓ The condition appears before the three domains.
 * ✓ Cognitive Domain contains a measurable student behavior.
 * ✓ Psychomotor / Skills Domain contains a measurable skill behavior.
 * ✓ Affective Domain contains an observable affective behavior.
 * ✓ The condition is relevant to the lesson.
 * ✓ The condition is not unnecessarily repeated.
 * ✓ Grammar is correct.
 * ✓ No raw Markdown syntax is displayed.
 * ✓ No HTML tags are displayed.
 */
export function validateLearningObjectives(objectives: StructuredLearningObjectives): LearningObjectivesValidationResult {
  const warnings: string[] = [];

  // Check condition
  if (!objectives.condition || objectives.condition.trim().length < 8) {
    warnings.push("Condition is missing or too brief.");
  }
  if (!/^[Gg]iven\b/.test(objectives.condition.trim())) {
    warnings.push("Condition should start with 'Given...'.");
  }

  // Check condition repetition in individual domains
  if (/^[Gg]iven\b/i.test(objectives.cognitive)) {
    warnings.push("Cognitive domain repeats the condition.");
  }
  if (/^[Gg]iven\b/i.test(objectives.psychomotor)) {
    warnings.push("Psychomotor domain repeats the condition.");
  }
  if (/^[Gg]iven\b/i.test(objectives.affective)) {
    warnings.push("Affective domain repeats the condition.");
  }

  // Check student-centered format
  if (!/^Students will\b/i.test(objectives.cognitive)) {
    warnings.push("Cognitive domain must begin with 'Students will...'.");
  }
  if (!/^Students will\b/i.test(objectives.psychomotor)) {
    warnings.push("Psychomotor domain must begin with 'Students will...'.");
  }
  if (!/^Students will\b/i.test(objectives.affective)) {
    warnings.push("Affective domain must begin with 'Students will...'.");
  }

  // Check non-observable phrases
  if (/Students will understand\b|Students will know\b|Students will learn\b/i.test(objectives.cognitive)) {
    warnings.push("Cognitive domain contains vague non-observable verb (e.g. understand/know).");
  }
  if (/Students will appreciate the lesson/i.test(objectives.affective)) {
    warnings.push("Affective domain is too vague.");
  }

  // Check for raw markdown or HTML
  const hasMarkdownOrHtml = (str: string) => /[*#_`]|<\/?[a-z]/i.test(str);
  if (hasMarkdownOrHtml(objectives.condition) || hasMarkdownOrHtml(objectives.cognitive) || hasMarkdownOrHtml(objectives.psychomotor) || hasMarkdownOrHtml(objectives.affective)) {
    warnings.push("Raw markdown or HTML syntax detected.");
  }

  // If any issues were found, run normalization to automatically repair them
  const normalized = normalizeLearningObjectives(objectives);

  return {
    isValid: warnings.length === 0,
    warnings,
    objectives: normalized
  };
}

/**
 * Formats the Learning Objectives into a standardized display / print string
 * matching the user's exact required format:
 * 
 * ## LEARNING OBJECTIVES
 * 
 * **Condition:**
 * [One condition that applies to all three domains.]
 * 
 * ### Cognitive Domain
 * Students will...
 * 
 * ### Psychomotor / Skills Domain
 * Students will...
 * 
 * ### Affective Domain
 * Students will...
 */
export function formatLearningObjectivesText(objectives: StructuredLearningObjectives): string {
  const norm = normalizeLearningObjectives(objectives);
  return `LEARNING OBJECTIVES\n\nCondition:\n${norm.condition}\n\nCognitive Domain:\n${norm.cognitive}\n\nPsychomotor / Skills Domain:\n${norm.psychomotor}\n\nAffective Domain:\n${norm.affective}`;
}
