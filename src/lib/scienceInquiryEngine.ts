/**
 * SCIENCE AND TECHNOLOGY INQUIRY-BASED LESSON PLANNING ENGINE
 * 
 * Strictly scoped to Subject: "Science and Technology".
 * Implements authoritative curriculum alignment and authentic scientific inquiry:
 * 
 * PHENOMENON / PROBLEM
 *   → SCIENTIFIC QUESTION
 *   → PRIOR KNOWLEDGE ACTIVATION
 *   → PREDICTION (VISIBLE THINKING)
 *   → INVESTIGATION / EXPLORATION (STUDENTS PRODUCE EVIDENCE)
 *   → OBSERVATION / EVIDENCE RECORDING
 *   → DATA ANALYSIS & PATTERN RECOGNITION
 *   → SCIENTIFIC EXPLANATION (CLAIM + EVIDENCE + REASONING)
 *   → APPLICATION TO BELIZEAN SYSTEMS / CONSERVATION
 *   → FORMATIVE ASSESSMENT & QUESTION REVISIT
 */

import { LessonPlan, LessonPhase, StructuredMaterial, WorkedExampleItem, GeneratedStudentMaterial } from '../types';
import { 
  getScienceCurriculumPack, 
  detectScienceTopicCategory, 
  ScienceCurriculumPack,
  SCIENCE_CURRICULUM_BANKS
} from './scienceCurriculumBanks';
import { 
  enforceSciencePurityAndQuality, 
  isScienceSubject, 
  purgeUnrelatedScienceContent, 
  runScienceAlignmentAudit 
} from './scienceQualityGate';

export { 
  isScienceSubject, 
  purgeUnrelatedScienceContent, 
  enforceSciencePurityAndQuality, 
  runScienceAlignmentAudit 
};

export interface ScienceOutcomeAnalysis {
  outcome: string;
  actionVerbs: string[];
  primaryVerb: string;
  scientificKnowledge: string;
  scientificSkill: string;
  scientificThinking: string;
  evidenceOfAchievement: string;
  requiredStudentAction: string;
  isStudentInvestigationMandated: boolean;
}

export interface SciencePhenomenonPack {
  phenomenon: string;
  inquiryQuestion: string;
  priorKnowledgeHook: string;
  diagnosticActivity: string;
  misconceptions: {
    misconception: string;
    evidenceToEncounter: string;
    scientificReality: string;
    teacherCorrectionPrompt: string;
  }[];
  predictionPrompt: string;
  investigation: {
    whatToInvestigate: string;
    whatToObserve: string;
    whatToRecord: string;
    evidenceProduced: string;
    questionAnsweredByEvidence: string;
    materials: string[];
    isStudentDriven: boolean;
  };
  explanationCER: {
    claim: string;
    evidence: string;
    reasoning: string;
    formalVocabularyMoment: string;
    formalVocabulary: { term: string; definition: string }[];
  };
  application: {
    belizeanContext: string;
    applicationTask: string;
  };
  assessment: {
    task: string;
    exitQuestion: string;
    expectedResponse: string;
    masteryCriteria: string;
  };
}

// ---------------------------------------------------------------------------
// 1. ANALYZE THE CURRICULUM OUTCOME & ACTION VERB
// ---------------------------------------------------------------------------

const VERB_ACTIONS: Record<string, { studentAction: string; skill: string; thinking: string; evidence: string; mandatesStudentInvestigation: boolean }> = {
  INVESTIGATE: {
    studentAction: 'Students actively conduct hands-on tests, manipulate variables, or observe specimens to collect empirical evidence directly.',
    skill: 'Formulating predictions, manipulating materials, recording accurate observational data, and testing hypotheses.',
    thinking: 'Empirical cause-and-effect reasoning and evaluating test validity.',
    evidence: 'Completed observation logs, recorded data tables, and evidence-based answers to the inquiry question.',
    mandatesStudentInvestigation: true
  },
  CONDUCT: {
    studentAction: 'Students physically execute the scientific procedure or trial, handling materials and logging sequential steps.',
    skill: 'Procedural manipulation of scientific apparatus, careful measuring, and systematic data recording.',
    thinking: 'Procedural rigor, fair testing control, and systematic observation.',
    evidence: 'Student-executed trials, recorded physical data, and observational logs.',
    mandatesStudentInvestigation: true
  },
  DESIGN: {
    studentAction: 'Students create an original model, investigation plan, prototype, or testable setup to address the scientific problem.',
    skill: 'Scientific schematic drawing, planning materials, defining variables, and testing constraints.',
    thinking: 'Creative engineering problem-solving, hypothesis design, and systems thinking.',
    evidence: 'Student-created schematic diagrams, model prototypes, or written test plans with justified components.',
    mandatesStudentInvestigation: true
  },
  DEMONSTRATE: {
    studentAction: 'Students physically manipulate models or apparatus to exhibit and explain the scientific phenomenon.',
    skill: 'Manipulating materials to represent a process and communicating the underlying mechanism.',
    thinking: 'Connecting concrete physical models with abstract scientific principles.',
    evidence: 'Physical manipulation accompanied by student explanation of the observed mechanism.',
    mandatesStudentInvestigation: true
  },
  MEASURE: {
    studentAction: 'Students use standard or non-standard scientific measurement tools to collect quantitative data.',
    skill: 'Accurate tool use (rulers, scales, thermometers, timers), reading calibrations, and recording units.',
    thinking: 'Quantitative estimation, precision vs error awareness, and metric reasoning.',
    evidence: 'Numerical data tables with accurate metric units and recorded trials.',
    mandatesStudentInvestigation: true
  },
  ANALYZE: {
    studentAction: 'Students inspect collected data, patterns, or specimens to identify relationships, trends, or anomalies.',
    skill: 'Interpreting tables/charts, identifying trends, comparing datasets, and spotting discrepancies.',
    thinking: 'Pattern recognition, inductive reasoning, and deductive synthesis.',
    evidence: 'Annotated data charts, pattern descriptions, and written analytical deductions.',
    mandatesStudentInvestigation: false
  },
  EXPLAIN: {
    studentAction: 'Students construct a coherent scientific explanation connecting observed evidence to scientific principles (Claim + Evidence + Reasoning).',
    skill: 'Oral and written articulation of scientific causality using age-appropriate scientific vocabulary.',
    thinking: 'Causal reasoning, synthesizing evidence with scientific concepts, avoiding teleological thinking.',
    evidence: 'Constructed CER statements (Claim, Evidence, Reasoning) in science notebooks.',
    mandatesStudentInvestigation: false
  },
  COMPARE: {
    studentAction: 'Students juxtapose two or more organisms, materials, systems, or states using established scientific criteria.',
    skill: 'Systematic observation of shared and distinct attributes, sorting, and Venn/t-chart documentation.',
    thinking: 'Comparative categorization, relational reasoning, and criteria-based judgment.',
    evidence: 'Comparative data charts, attribute tables, or justified comparison statements.',
    mandatesStudentInvestigation: false
  },
  DIFFERENTIATE: {
    studentAction: 'Students distinguish key differences and boundaries between two scientific categories, systems, or processes using empirical criteria.',
    skill: 'Criteria-based sorting, identifying distinguishing variables, and justifying classification.',
    thinking: 'Analytical classification, boundary definition, and relational reasoning.',
    evidence: 'Comparative classification matrices, Venn diagrams, and justified difference statements.',
    mandatesStudentInvestigation: false
  },
  CLASSIFY: {
    studentAction: 'Students sort organisms, objects, or phenomena into scientific groups using defined observable criteria and justify each placement.',
    skill: 'Applying sorting criteria, constructing dichotomous keys, and recording category rationale.',
    thinking: 'Taxonomic categorization, rule-based classification, and logical grouping.',
    evidence: 'Completed classification matrices or sorted group diagrams with written justifications.',
    mandatesStudentInvestigation: false
  },
  PREDICT: {
    studentAction: 'Students articulate a reasoned forecast ("I predict ___ because ___") grounded in prior knowledge or initial evidence prior to observing.',
    skill: 'Formulating testable hypotheses and explaining scientific rationale.',
    thinking: 'Hypothetical deductive reasoning and connecting prior experiences to new situations.',
    evidence: 'Written or oral prediction statements with explicit causal justification before investigation.',
    mandatesStudentInvestigation: false
  },
  DESCRIBE: {
    studentAction: 'Students closely observe scientific specimens or processes and record multi-sensory, detailed characteristics accurately.',
    skill: 'Precise scientific observation, sketching labeled diagrams, and recording qualitative details.',
    thinking: 'Descriptive precision, distinguishing observation from inference.',
    evidence: 'Detailed written descriptions, labeled scientific diagrams, and field observation notes.',
    mandatesStudentInvestigation: false
  },
  IDENTIFY: {
    studentAction: 'Students recognize, isolate, and name key scientific components, properties, or organisms from observable features.',
    skill: 'Visual recognition, distinguishing key attributes, and naming scientific components correctly.',
    thinking: 'Feature recognition, concept recall, and distinguishing relevant from irrelevant traits.',
    evidence: 'Accurate identification logs, labeled parts, or recognized specimen traits.',
    mandatesStudentInvestigation: false
  },
  CONSTRUCT: {
    studentAction: 'Students build a physical model, food web diagram, electrical circuit, or structured representation of the concept.',
    skill: 'Assembling components, connecting inputs/outputs, and testing system continuity.',
    thinking: 'Structural assembly, systems interdependence, and mechanical/biological connectivity.',
    evidence: 'Functioning circuit, assembled food web diagram, or physical anatomical model.',
    mandatesStudentInvestigation: true
  },
  LABEL: {
    studentAction: 'Students examine specimens or anatomical models and accurately annotate each anatomical/structural component.',
    skill: 'Diagram annotation, spatial recognition of structures, and functional pairing.',
    thinking: 'Part-to-whole spatial and functional reasoning.',
    evidence: 'Fully annotated anatomical/structural diagrams with functional notes.',
    mandatesStudentInvestigation: false
  },
  TRACE: {
    studentAction: 'Students map sequential flow of energy, matter, water, blood, or electrical current through interconnected pathways.',
    skill: 'Flowcharting, pathway diagramming, directional arrow notation, and intermediate tracking.',
    thinking: 'Flow dynamics, conservation of matter/energy, and systems continuity.',
    evidence: 'Accurate directional pathway diagrams with labeled intermediate stages.',
    mandatesStudentInvestigation: false
  },
  PROPOSE: {
    studentAction: 'Students develop realistic, evidence-based environmental or technological solutions for a Belizean community challenge.',
    skill: 'Synthesizing scientific principles into actionable conservation or design proposals.',
    thinking: 'Applied ecological reasoning, cost-benefit analysis, and stewardship thinking.',
    evidence: 'Written proposals detailing the problem, scientific mechanism, and community action steps.',
    mandatesStudentInvestigation: false
  },
  EVALUATE: {
    studentAction: 'Students appraise environmental impacts, technological trade-offs, or investigation validity using scientific metrics.',
    skill: 'Critical analysis of data, weighing environmental consequences, and critiquing evidence.',
    thinking: 'Evaluative synthesis, trade-off assessment, and evidence-grounded critique.',
    evidence: 'Evaluative rubrics, written environmental impact reviews, or trade-off comparisons.',
    mandatesStudentInvestigation: false
  }
};

export function analyzeScienceOutcome(
  outcome: string,
  topic: string,
  subtopic?: string,
  grade?: string
): ScienceOutcomeAnalysis {
  const cleanOutcome = outcome || `Investigate and explain the scientific properties of ${topic}`;
  const upper = cleanOutcome.toUpperCase();

  const recognizedVerbs: string[] = [];
  for (const verb of Object.keys(VERB_ACTIONS)) {
    const regex = new RegExp(`\\b${verb}\\b`, 'i');
    if (regex.test(upper)) {
      recognizedVerbs.push(verb);
    }
  }

  const primaryVerb = recognizedVerbs[0] || (
    upper.includes('DIFFERENTIAT') ? 'DIFFERENTIATE' :
    upper.includes('COMPARE') ? 'COMPARE' :
    upper.includes('INVESTIGAT') ? 'INVESTIGATE' :
    upper.includes('CONDUCT') ? 'CONDUCT' :
    upper.includes('DESIGN') ? 'DESIGN' :
    upper.includes('EXPLAIN') ? 'EXPLAIN' :
    upper.includes('DESCRIB') ? 'DESCRIBE' :
    upper.includes('IDENTIF') ? 'IDENTIFY' :
    upper.includes('CLASSIF') ? 'CLASSIFY' :
    upper.includes('TRACE') ? 'TRACE' :
    upper.includes('LABEL') ? 'LABEL' :
    upper.includes('MEASUR') ? 'MEASURE' :
    upper.includes('CONSTRUCT') ? 'CONSTRUCT' :
    'INVESTIGATE'
  );

  const verbProfile = VERB_ACTIONS[primaryVerb] || VERB_ACTIONS.INVESTIGATE;

  return {
    outcome: cleanOutcome,
    actionVerbs: recognizedVerbs.length > 0 ? recognizedVerbs : [primaryVerb],
    primaryVerb,
    scientificKnowledge: `Understanding core principles of ${topic}${subtopic ? ` (${subtopic})` : ''} as mandated by curriculum benchmark "${cleanOutcome}".`,
    scientificSkill: verbProfile.skill,
    scientificThinking: verbProfile.thinking,
    evidenceOfAchievement: verbProfile.evidence,
    requiredStudentAction: verbProfile.studentAction,
    isStudentInvestigationMandated: verbProfile.mandatesStudentInvestigation
  };
}

// ---------------------------------------------------------------------------
// 2. PHENOMENON & INQUIRY REPOSITORY ALIGNED TO BELIZE SCIENCE CURRICULUM
// ---------------------------------------------------------------------------

export function resolveSciencePhenomenonPack(
  outcome: string,
  topic: string,
  subtopic?: string,
  grade?: string
): SciencePhenomenonPack {
  const analysis = analyzeScienceOutcome(outcome, topic, subtopic, grade);
  const pack = getScienceCurriculumPack(topic, subtopic, outcome);

  return {
    phenomenon: pack.phenomenon,
    inquiryQuestion: pack.inquiryQuestion,
    priorKnowledgeHook: pack.priorKnowledgeHook,
    diagnosticActivity: pack.diagnosticProbe,
    misconceptions: pack.misconceptions,
    predictionPrompt: pack.predictionPrompt,
    investigation: {
      whatToInvestigate: pack.investigation.whatToInvestigate,
      whatToObserve: pack.investigation.whatToObserve,
      whatToRecord: pack.investigation.whatToRecord,
      evidenceProduced: pack.investigation.evidenceProduced,
      questionAnsweredByEvidence: pack.investigation.questionAnsweredByEvidence,
      materials: pack.investigation.materials,
      isStudentDriven: pack.investigation.isStudentDriven
    },
    explanationCER: pack.explanationCER,
    application: {
      belizeanContext: pack.belizeanContext.ecosystemOrLocation,
      applicationTask: pack.belizeanContext.communityApplication
    },
    assessment: {
      task: `${analysis.primaryVerb} the concepts of ${topic} and construct an evidence-based CER explanation.`,
      exitQuestion: pack.exitTicketQuestions[0]?.questionText || `How does the evidence collected today answer our inquiry question?`,
      expectedResponse: pack.exitTicketQuestions[0]?.expectedAnswer || `Evidence-based claim supported by recorded data and scientific principles.`,
      masteryCriteria: `Student achieves at least 80% accuracy in demonstrating the required curriculum verb (${analysis.primaryVerb}) and supporting claims with evidence.`
    }
  };
}

// ---------------------------------------------------------------------------
// 3. GENERATE COMPLETE SCIENCE PACING GUIDANCE FOR PROMPT INJECTION
// ---------------------------------------------------------------------------

export function getScienceInquiryPromptGuidance(
  payload: any,
  cleanContext: any,
  duration: string = '45 minutes'
): string {
  const outcome = cleanContext.learningOutcome || payload.selectedCurriculumOutcome || '';
  const topic = cleanContext.topic || payload.selectedTopic || '';
  const subtopic = cleanContext.subtopic || payload.selectedSubtopic || '';
  const grade = cleanContext.classLevel || payload.selectedClass || 'Standard 6';
  
  const analysis = analyzeScienceOutcome(outcome, topic, subtopic, grade);
  const pack = resolveSciencePhenomenonPack(outcome, topic, subtopic, grade);

  return `
### MANDATORY SCIENCE & TECHNOLOGY INQUIRY ARCHITECTURE (${duration})

PRIMARY CURRICULUM MANDATE:
- Authoritative Outcome: "${analysis.outcome}"
- Main Curriculum Action Verb: "${analysis.primaryVerb}"
- Required Student Action: ${analysis.requiredStudentAction}
- Scientific Knowledge: ${analysis.scientificKnowledge}
- Scientific Skill: ${analysis.scientificSkill}
- Scientific Thinking: ${analysis.scientificThinking}
- Evidence of Achievement: ${analysis.evidenceOfAchievement}
${analysis.isStudentInvestigationMandated ? '- MANDATE: Students MUST DO THE SCIENCE directly. Teacher demonstration is strictly forbidden from replacing student manipulation for this outcome.' : ''}

INQUIRY LESSON TRAJECTORY:
1. Phenomenon / Problem Hook:
   - Start with this observable phenomenon: "${pack.phenomenon}"
   - Do NOT immediately give the scientific explanation.
   - Pique curiosity and activate prior knowledge.
2. Scientific Inquiry Question:
   - Central Question: "${pack.inquiryQuestion}"
   - Must be answerable through the learning experience. Revisit during closure and assessment.
3. Prior Knowledge Activation & Diagnostic:
   - Diagnostic Activity: ${pack.diagnosticActivity}
   - Reveal student thinking to determine teacher support/clarifications.
4. Student Prediction (Visible Thinking):
   - Prompt: "${pack.predictionPrompt}"
   - Record predictions in science notebooks before seeing the outcome.
5. Purposeful Investigation (Producing Evidence):
   - What students investigate: ${pack.investigation.whatToInvestigate}
   - What students observe: ${pack.investigation.whatToObserve}
   - What students record: ${pack.investigation.whatToRecord}
   - Evidence produced: ${pack.investigation.evidenceProduced}
   - Question answered: ${pack.investigation.questionAnsweredByEvidence}
6. Student Role vs Teacher Role:
   - Students observe → predict → investigate → record → discuss → analyze → explain → apply.
   - NO passive copying of notes or worksheets.
7. Evidence Before Scientific Conclusion:
   - Follow progression: OBSERVATION → EVIDENCE → DISCUSSION → PATTERN → EXPLANATION → SCIENTIFIC PRINCIPLE.
   - ${pack.explanationCER.formalVocabularyMoment}
8. Scientific Explanation (CER):
   - Claim: ${pack.explanationCER.claim}
   - Evidence: ${pack.explanationCER.evidence}
   - Reasoning: ${pack.explanationCER.reasoning}
9. Embed Misconceptions Directly in Learning Activities:
${pack.misconceptions.map(m => `   * Misconception: "${m.misconception}"
     Evidence students encounter: "${m.evidenceToEncounter}"
     Scientific reality: "${m.scientificReality}"`).join('\n')}
10. Authentic Student Materials:
   - Under studentMaterials, provide a complete topic-specific Science Investigation Worksheet containing:
     1. Prediction prompt ("I predict ___ because ___")
     2. 8 Solvable questions with explicit point allocations totaling 10 marks
     3. Complete 1:1 worked answer key
     4. Claim + Evidence + Reasoning synthesis
   - Daily Exit Ticket (3-4 questions, 5 marks total, 80% mastery threshold) directly evaluating the curriculum verb "${analysis.primaryVerb}".
   - NEVER use generic placeholders or unrelated subject content.`;
}

// ---------------------------------------------------------------------------
// 4. SCIENCE INQUIRY ENRICHMENT & GUARANTEE ENGINE
// ---------------------------------------------------------------------------

export function enrichScienceLessonPlan(rawPlan: any, context?: any): LessonPlan {
  // Delegate completely to the authoritative Science Quality Gate
  return enforceSciencePurityAndQuality(rawPlan, context);
}
