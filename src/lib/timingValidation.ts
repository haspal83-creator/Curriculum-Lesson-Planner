import { LessonPlan, LessonAtAGlanceRow, LessonPhase } from '../types';

/**
 * Parses numeric minutes from various string formats (e.g. "45 minutes", "10 mins", "15m", "1 hour")
 */
export function parseMinutes(val: string | number | undefined, defaultMinutes: number = 45): number {
  if (typeof val === 'number' && !isNaN(val) && val > 0) return Math.round(val);
  if (!val || typeof val !== 'string') return defaultMinutes;

  const str = val.trim().toLowerCase();
  
  // Check for hour format e.g. "1 hour", "1.5 hours"
  const hourMatch = str.match(/([0-9.]+)\s*(hour|hr|h)/);
  if (hourMatch) {
    const hours = parseFloat(hourMatch[1]);
    if (!isNaN(hours) && hours > 0) return Math.round(hours * 60);
  }

  // Check for minute format e.g. "45 minutes", "10 mins", "15m"
  const minMatch = str.match(/(\d+)\s*(minute|min|m|$)/);
  if (minMatch) {
    const mins = parseInt(minMatch[1], 10);
    if (!isNaN(mins) && mins > 0) return mins;
  }

  // Fallback: extract any digits
  const anyDigits = str.match(/\d+/);
  if (anyDigits) {
    const parsed = parseInt(anyDigits[0], 10);
    if (!isNaN(parsed) && parsed > 0) return parsed;
  }

  return defaultMinutes;
}

/**
 * Standard instructional ratios for 5-phase lesson structure
 * Introduction (~12%), Explicit Teaching (~33%), Guided Practice (~27%), Independent Practice (~18%), Closure (~10%)
 */
const DEFAULT_5_PHASE_RATIOS = [0.12, 0.33, 0.27, 0.18, 0.10];

/**
 * Formats time range with cumulative start and end e.g. "10 mins (0:00 - 0:10)"
 */
function formatTimeWithInterval(minutes: number, startMin: number): string {
  const endMin = startMin + minutes;
  return `${minutes} mins (${startMin}:00 - ${endMin}:00)`;
}

export interface TimingValidationResult {
  targetMinutes: number;
  calculatedMinutes: number;
  isBalanced: boolean;
  rebalanced: boolean;
  phaseTimes: { stage: string; minutes: number; interval: string }[];
}

/**
 * Validates that the sum of lesson stages strictly equals the selected lesson duration.
 * If mismatch is detected, rebalances the lesson stages proportionally and validates again.
 */
export function validateAndBalanceLessonTiming(
  plan: Partial<LessonPlan>,
  selectedDuration?: string | number
): { plan: Partial<LessonPlan>; validation: TimingValidationResult } {
  const isLA = Boolean(plan.subject && (
    plan.subject.toLowerCase().includes('language') ||
    plan.subject.toLowerCase().includes('reading') ||
    plan.subject.toLowerCase().includes('writing') ||
    plan.subject.toLowerCase().includes('english')
  ));
  const isMath = Boolean(plan.subject && plan.subject.toLowerCase().includes('math'));
  const isScience = Boolean(plan.subject && (plan.subject === 'Science and Technology' || plan.subject.toLowerCase().includes('science')));
  const is90Min = isLA || isMath;

  // Mathematics and Language Arts lessons default to 90 minutes unless the teacher explicitly selects another duration
  let targetMinutes: number;
  if (selectedDuration !== undefined && selectedDuration !== null && selectedDuration !== '') {
    targetMinutes = parseMinutes(selectedDuration, is90Min ? 90 : 45);
  } else if (plan.duration && plan.duration !== '45 minutes' && plan.duration !== '45 mins') {
    targetMinutes = parseMinutes(plan.duration, is90Min ? 90 : 45);
  } else {
    targetMinutes = is90Min ? 90 : 45;
  }

  let rows: LessonAtAGlanceRow[] = plan.lessonAtAGlance && plan.lessonAtAGlance.length > 0 
    ? [...plan.lessonAtAGlance] 
    : [];

  let executionPhases: LessonPhase[] = plan.executionBoard && plan.executionBoard.length > 0
    ? [...plan.executionBoard]
    : [];

  // If no lessonAtAGlance rows exist yet, seed standard stages
  if (rows.length === 0) {
    if (isLA && targetMinutes === 90) {
      const la7Stages = [
        {
          stage: "Stage 1: Engage & Prior Knowledge",
          teacherDoes: "Hook student interest with a Belizean environmental or cultural scenario, activate prerequisite root/base vocabulary, and share lesson goals.",
          studentsDo: "Engage with the opening inquiry prompt, identify known words on whiteboards, and state the lesson success criteria."
        },
        {
          stage: "Stage 2: Explore: Belizean Reading Passage",
          teacherDoes: "Guide students through an authentic Belizean mentor text, facilitate choral/partner reading, and highlight target academic words in context.",
          studentsDo: "Read mentor text actively, track vocabulary in context, and participate in initial text-dependent discussion."
        },
        {
          stage: "Stage 3: Explicit Instruction / Teacher Think-Aloud (I DO)",
          teacherDoes: "Model the 4-step word analysis strategy (PREFIX → BASE/ROOT → CONTEXT → WHOLE-WORD MEANING) using think-aloud demonstration.",
          studentsDo: "Track teacher think-aloud, record morphological breakdown in notebooks, and identify how context confirms meaning."
        },
        {
          stage: "Stage 4: Guided Morphological Analysis (WE DO)",
          teacherDoes: "Lead collaborative paired analysis of targeted mentor words, pose diagnostic questions, and provide immediate feedback.",
          studentsDo: "Work with table partners to isolate affixes and base words, discuss meanings orally, and justify whole-word definitions."
        },
        {
          stage: "Stage 5: Collaborative Word-Building / Application",
          teacherDoes: "Facilitate small-group word-building challenges using affix and root cards; monitor accuracy and scaffold struggling groups.",
          studentsDo: "Manipulate word cards in teams, build valid morphological words, and construct collaborative sentences situated in Belize."
        },
        {
          stage: "Stage 6: Independent Reading & Writing Application (YOU DO)",
          teacherDoes: "Circulate for targeted micro-interventions, administer tiered support, and assess independent worksheet completion.",
          studentsDo: "Complete individual practice worksheet with morphological analysis, context application, and original sentence writing."
        },
        {
          stage: "Stage 7: Exit Assessment & Closure",
          teacherDoes: "Synthesize essential takeaways, facilitate student debrief on the 4-step strategy, and administer the diagnostic exit ticket.",
          studentsDo: "Complete 3-question diagnostic exit ticket independently and self-assess mastery of the learning target."
        }
      ];

      rows = la7Stages.map((s, idx) => ({
        time: "",
        timeMinutes: 0,
        stage: s.stage,
        teacherDoes: executionPhases[idx]?.teacherActions?.join("; ") || s.teacherDoes,
        studentsDo: executionPhases[idx]?.studentActions?.join("; ") || s.studentsDo
      }));
    } else if (isMath && targetMinutes === 90) {
      const math7Stages = [
        {
          stage: "Stage 1: Mental Math Warm-Up & Prior Knowledge Hook",
          teacherDoes: "Lead rapid-fire mental arithmetic warm-up, activate prerequisite computation, and state lesson objectives.",
          studentsDo: "Solve mental math fluency problems on individual whiteboards and articulate prerequisite concepts."
        },
        {
          stage: "Stage 2: Concrete Exploration & Manipulatives Inquiry",
          teacherDoes: "Facilitate hands-on exploration using concrete manipulatives situated in an authentic Belizean problem scenario.",
          studentsDo: "Manipulate physical or visual models in pairs, explore quantitative patterns, and record observations."
        },
        {
          stage: "Stage 3: Explicit Modeling & Visual Representation (I DO)",
          teacherDoes: "Model transition from concrete to pictorial/abstract models using think-aloud, detailing standard algorithmic steps.",
          studentsDo: "Track teacher think-aloud, sketch bar models or diagrams in notebooks, and record standard procedure."
        },
        {
          stage: "Stage 4: Guided Interactive Practice (WE DO)",
          teacherDoes: "Guide students through multi-step worked examples, conduct structured checks for understanding, and provide corrective feedback.",
          studentsDo: "Work paired calculations, explain mathematical reasoning using formal vocabulary, and self-correct."
        },
        {
          stage: "Stage 5: Differentiated Collaborative Problem-Solving",
          teacherDoes: "Facilitate tiered problem challenges, scaffold struggling learners, and challenge advanced groups with multi-step Belizean word problems.",
          studentsDo: "Collaborate in small groups to solve complex application problems and verify calculations reciprocally."
        },
        {
          stage: "Stage 6: Independent Exercise Book Practice (YOU DO)",
          teacherDoes: "Circulate for micro-interventions, monitor independent execution, and ensure proper algorithmic working.",
          studentsDo: "Complete individual exercise book problem set independently, showing all step-by-step working and units."
        },
        {
          stage: "Stage 7: Diagnostic Exit Assessment & Reflection",
          teacherDoes: "Administer short diagnostic exit check, synthesize core mathematical principles, and summarize key takeaways.",
          studentsDo: "Complete exit ticket independently, self-assess procedural mastery, and reflect on strategy effectiveness."
        }
      ];

      rows = math7Stages.map((s, idx) => ({
        time: "",
        timeMinutes: 0,
        stage: s.stage,
        teacherDoes: executionPhases[idx]?.teacherActions?.join("; ") || s.teacherDoes,
        studentsDo: executionPhases[idx]?.studentActions?.join("; ") || s.studentsDo
      }));
    } else if (isScience) {
      const science5Stages = [
        {
          stage: "Stage 1: Phenomenon Hook & Driving Question",
          teacherDoes: "Present the observable phenomenon mystery, activate student curiosity, and pose the central inquiry question without revealing the answer.",
          studentsDo: "Closely observe physical specimen or demonstration, record initial observations, and note the inquiry question in science notebooks."
        },
        {
          stage: "Stage 2: Prior Knowledge & Student Prediction",
          teacherDoes: "Facilitate diagnostic check to reveal student thinking and prompt individual predictions ('I predict... because...').",
          studentsDo: "Complete diagnostic probe, articulate justified prediction with causal reasoning, and review the investigation recording log."
        },
        {
          stage: "Stage 3: Hands-on Investigation & Evidence Collection",
          teacherDoes: "Facilitate student-driven testing, monitor fair testing variables, and prompt systematic data logging in observation tables.",
          studentsDo: "Manipulate apparatus in collaborative lab pairs, test conditions, measure outcomes, and record empirical evidence in tables."
        },
        {
          stage: "Stage 4: Data Analysis & Scientific Explanation (CER)",
          teacherDoes: "Lead class data synthesis, introduce formal vocabulary in context, and guide Claim + Evidence + Reasoning construction.",
          studentsDo: "Analyze patterns across trials, connect evidence to formal scientific concepts, and write CER explanation in notebooks."
        },
        {
          stage: "Stage 5: Belizean Application & Science Exit Ticket",
          teacherDoes: "Connect concepts to real Belizean ecosystems or technology, address misconceptions, and administer daily Science Exit Ticket.",
          studentsDo: "Apply scientific mechanism to solve a Belizean challenge, reflect on initial predictions, and complete exit ticket independently."
        }
      ];

      rows = science5Stages.map((s, idx) => ({
        time: "",
        timeMinutes: 0,
        stage: s.stage,
        teacherDoes: executionPhases[idx]?.teacherActions?.join("; ") || s.teacherDoes,
        studentsDo: executionPhases[idx]?.studentActions?.join("; ") || s.studentsDo
      }));
    } else {
      const standardStages = [
        {
          stage: "Stage 1: Hook & Introduction",
          teacherDoes: "Hook student interest, activate prior knowledge, and share learning goals with shared condition.",
          studentsDo: "Engage with inquiry prompt, recall prerequisite ideas, and articulate what success looks like."
        },
        {
          stage: "Stage 2: Explicit Teaching (I DO)",
          teacherDoes: "Directly explain core concept with crystal-clear academic vocabulary and model worked example think-aloud.",
          studentsDo: "Actively observe, take guided notes, track step-by-step procedure, and record key rules."
        },
        {
          stage: "Stage 3: Guided Practice (WE DO)",
          teacherDoes: "Lead collaborative practice, pose diagnostic questions, monitor pairs, and prompt corrective reasoning.",
          studentsDo: "Work collaboratively with partners, respond to teacher prompts, justify reasoning, and self-correct."
        },
        {
          stage: "Stage 4: Independent Practice (YOU DO)",
          teacherDoes: "Circulate for targeted micro-interventions, administer tiered support, and assess individual mastery.",
          studentsDo: "Complete differentiated problem set, application task, or reading passage independently."
        },
        {
          stage: "Stage 5: Closure & Exit Ticket",
          teacherDoes: "Synthesize essential takeaways, conduct whole-group debrief, and collect individual exit tickets.",
          studentsDo: "Complete formative exit question, summarize core learning in own words, and self-rate mastery."
        }
      ];

      rows = standardStages.map((s, idx) => ({
        time: "",
        timeMinutes: 0,
        stage: s.stage,
        teacherDoes: executionPhases[idx]?.teacherActions?.join("; ") || s.teacherDoes,
        studentsDo: executionPhases[idx]?.studentActions?.join("; ") || s.studentsDo
      }));
    }
  }

  // Calculate current sum of minutes from rows
  let currentSum = rows.reduce((acc, row) => {
    const mins = row.timeMinutes || parseMinutes(row.time, 0);
    return acc + mins;
  }, 0);

  const needsRebalance = currentSum !== targetMinutes || rows.some(r => !r.timeMinutes || r.timeMinutes <= 0);

  if (needsRebalance) {
    const count = rows.length;
    let distributed: number[] = [];

    if (isLA && targetMinutes === 90 && count === 7) {
      // Exactly 90 minutes across 7 Language Arts phases
      // 8 + 15 + 15 + 15 + 10 + 15 + 12 = 90
      distributed = [8, 15, 15, 15, 10, 15, 12];
    } else if (isMath && targetMinutes === 90 && count === 7) {
      // Exactly 90 minutes across 7 Mathematics CPA phases
      // 10 + 15 + 15 + 15 + 15 + 12 + 8 = 90
      distributed = [10, 15, 15, 15, 15, 12, 8];
    } else if (isMath && targetMinutes === 45 && count === 7) {
      // Exactly 45 minutes across 7 Mathematics CPA phases
      // 5 + 8 + 8 + 8 + 8 + 5 + 3 = 45
      distributed = [5, 8, 8, 8, 8, 5, 3];
    } else if ((isLA || isMath) && targetMinutes === 90 && count === 5) {
      // Exactly 90 minutes across 5 phases: 10 + 25 + 25 + 20 + 10 = 90
      distributed = [10, 25, 25, 20, 10];
    } else if (count === 5) {
      distributed = DEFAULT_5_PHASE_RATIOS.map(ratio => Math.max(2, Math.round(targetMinutes * ratio)));
    } else {
      const base = Math.floor(targetMinutes / count);
      distributed = Array(count).fill(base);
    }

    // Adjust the sum so it matches targetMinutes down to the exact integer
    let diff = targetMinutes - distributed.reduce((a, b) => a + b, 0);
    let adjustIdx = count >= 2 ? 1 : 0;
    while (diff !== 0) {
      if (diff > 0) {
        distributed[adjustIdx] += 1;
        diff -= 1;
      } else {
        if (distributed[adjustIdx] > 3) {
          distributed[adjustIdx] -= 1;
          diff += 1;
        }
      }
      adjustIdx = (adjustIdx + 1) % count;
    }

    // Apply distributed minutes to rows
    let cumulative = 0;
    rows = rows.map((row, i) => {
      const mins = distributed[i];
      const timeFormatted = formatTimeWithInterval(mins, cumulative);
      cumulative += mins;
      return {
        ...row,
        time: timeFormatted,
        timeMinutes: mins
      };
    });

    // Also update executionBoard timeAllocations if phases exist
    if (executionPhases.length > 0) {
      executionPhases = executionPhases.map((phase, i) => {
        const correspondingMins = distributed[i] || Math.round(targetMinutes / executionPhases.length);
        return {
          ...phase,
          timeAllocation: `${correspondingMins} minutes`
        };
      });
    }
  } else {
    // Ensure all row strings and execution phases have standardized interval labels
    let cumulative = 0;
    rows = rows.map((row) => {
      const mins = row.timeMinutes || parseMinutes(row.time, 10);
      const timeFormatted = formatTimeWithInterval(mins, cumulative);
      cumulative += mins;
      return {
        ...row,
        time: timeFormatted,
        timeMinutes: mins
      };
    });
  }

  // Final validation check
  const validatedSum = rows.reduce((acc, r) => acc + (r.timeMinutes || 0), 0);
  const isStrictlyBalanced = validatedSum === targetMinutes;

  const phaseTimes = rows.map(r => ({
    stage: r.stage,
    minutes: r.timeMinutes,
    interval: r.time
  }));

  const updatedPlan: Partial<LessonPlan> = {
    ...plan,
    duration: `${targetMinutes} minutes`,
    lessonAtAGlance: rows,
    executionBoard: executionPhases.length > 0 ? executionPhases : plan.executionBoard
  };

  return {
    plan: updatedPlan,
    validation: {
      targetMinutes,
      calculatedMinutes: validatedSum,
      isBalanced: isStrictlyBalanced,
      rebalanced: needsRebalance,
      phaseTimes
    }
  };
}
