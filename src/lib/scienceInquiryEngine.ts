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
    upper.includes('INVESTIGAT') ? 'INVESTIGATE' :
    upper.includes('CONDUCT') ? 'CONDUCT' :
    upper.includes('DESIGN') ? 'DESIGN' :
    upper.includes('EXPLAIN') ? 'EXPLAIN' :
    upper.includes('DESCRIB') ? 'DESCRIBE' :
    upper.includes('IDENTIF') ? 'IDENTIFY' :
    upper.includes('CLASSIF') ? 'CLASSIFY' :
    upper.includes('COMPARE') ? 'COMPARE' :
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
  const text = `${topic} ${subtopic || ''} ${outcome}`.toLowerCase();
  const analysis = analyzeScienceOutcome(outcome, topic, subtopic, grade);

  // A. Plant Parts, Functions & Photosynthesis
  if (text.includes('plant') || text.includes('root') || text.includes('stem') || text.includes('leaf') || text.includes('photosynthesis')) {
    return {
      phenomenon: 'A potted pepper plant placed next to the classroom window in Belize is bending noticeably sideways toward the sunlight, while another seedling kept in a dark cupboard has turned pale yellow and slumped.',
      inquiryQuestion: 'How do different plant structures work together to capture light, transport water, and keep a plant alive?',
      priorKnowledgeHook: 'Quick Diagram: In 60 seconds, sketch a plant in your notebook and draw arrows showing where water enters and where sunlight hits.',
      diagnosticActivity: 'Misconception Diagnostic: Ask students: "True or False: Plants get their food by sucking soil through their roots like drinking through a straw." Have students vote with thumbs.',
      misconceptions: [
        {
          misconception: 'Plants "eat" soil through their roots to grow.',
          evidenceToEncounter: 'Observing that plants grown in water with liquid nutrients grow without soil, and potted plants do not reduce the soil weight as they grow.',
          scientificReality: 'Roots absorb water and dissolved minerals; green leaves manufacture the plant\'s actual food (glucose) using sunlight, water, and carbon dioxide.',
          teacherCorrectionPrompt: '"Look at our bean seedlings growing in wet cotton without soil. What are the roots drinking? Water! Where is the food actually made?"'
        },
        {
          misconception: 'Water just sits in the roots and doesn\'t travel up.',
          evidenceToEncounter: 'A white flower or celery stalk placed in red food coloring water develops bright red veins through its stem and into its leaves.',
          scientificReality: 'Xylem vessels in the stem conduct water upwards from roots to leaves through capillary action and transpiration pull.',
          teacherCorrectionPrompt: '"Look closely at the red color in the leaf tips. How did that color travel from the bottom of the jar to the top?"'
        }
      ],
      predictionPrompt: 'I predict the colored water will (travel / not travel) up the celery stem because __________________________.',
      investigation: {
        whatToInvestigate: 'How water travels through plant stems into leaves using cut celery stalks/croton cuttings in dyed water and hand lenses.',
        whatToObserve: 'Cross-sections of stems under hand lenses, identifying colored vascular tubes (xylem), and color reaching leaf tips.',
        whatToRecord: 'Annotated diagram of stem cross-section with colored xylem dots circled and measured height of dyed water over time.',
        evidenceProduced: 'Observable colored liquid inside distinct internal tubes extending from base to leaf margin.',
        questionAnsweredByEvidence: 'Evidence proves stems contain specialized transport tubes (xylem) that move water upward from roots to leaves.',
        materials: ['Celery stalks with leaves or fresh croton cuttings', 'Clear plastic cups with water and red/blue food coloring', 'Hand lenses', 'Plastic safety knives/scalpels (teacher-supervised cross-sections)', 'Science notebooks'],
        isStudentDriven: true
      },
      explanationCER: {
        claim: 'Plant roots absorb water, and specialized tubes inside stems transport that water upwards to leaves for photosynthesis.',
        evidence: 'In our investigation, red dyed water climbed 8 cm up the celery stem in 20 minutes, visible in distinct round tube bundles (xylem) and appearing at the leaf margins.',
        reasoning: 'Plants need water in their green leaves to produce food via photosynthesis. The stem acts as a vascular highway, using xylem tubes to move water against gravity.',
        formalVocabularyMoment: 'Introduce "Xylem", "Phloem", and "Transpiration" AFTER students point to the colored circles inside the cut stem.',
        formalVocabulary: [
          { term: 'Xylem', definition: 'Tubes inside a plant stem that carry water and minerals upwards from roots to leaves.' },
          { term: 'Photosynthesis', definition: 'The process green plants use to convert sunlight, water, and carbon dioxide into food (glucose) and oxygen.' },
          { term: 'Transpiration', definition: 'The evaporation of water from plant leaves that pulls water upward through the stem.' }
        ]
      },
      application: {
        belizeanContext: 'Belizean citrus orchards in Stann Creek and milpa cornfields during dry spells versus the rainy season.',
        applicationTask: 'Farmers in Cayo notice citrus leaves wilting during a hot April afternoon. Explain using our xylem model why irrigation at the root zone revives the leaves within hours.'
      },
      assessment: {
        task: `${analysis.primaryVerb} the pathway of water and explain how plant structures support growth.`,
        exitQuestion: 'Why does cutting off all the roots of a plant prevent the green leaves from making food, even when placed in bright Belizean sunlight?',
        expectedResponse: 'Cutting the roots stops water absorption. Without water reaching the leaves via stem xylem, the leaf chloroplasts cannot carry out photosynthesis.',
        masteryCriteria: 'Student correctly traces water path (roots → stem xylem → leaves) and connects it to leaf survival with 100% conceptual accuracy.'
      }
    };
  }

  // B. Ecosystems, Mangroves, Coral Reef & Biodiversity
  if (text.includes('ecosystem') || text.includes('mangrove') || text.includes('reef') || text.includes('biodiversity') || text.includes('food web') || text.includes('pine ridge') || text.includes('habitat')) {
    return {
      phenomenon: 'During a tropical storm, the coastline along Placencia with cleared sandy beaches suffered massive sand erosion and damage, while the coast lined with dense red mangroves remained intact with clear calm water inside the root tangles.',
      inquiryQuestion: 'How do the physical adaptations of organisms like red mangroves create stable habitats and protect coastal ecosystems in Belize?',
      priorKnowledgeHook: 'Quick Think-Pair-Share: Name two animals that live near our cays or rivers. What special features do they have to survive in water or mud?',
      diagnosticActivity: 'Classification Probe: Sort these cards into "Producer", "Consumer", and "Decomposer": Red mangrove tree, Nassau grouper, Queen conch, Fiddler crab, Reef bacteria. Reveal student reasoning.',
      misconceptions: [
        {
          misconception: 'Mangroves are just useless swamp bushes that should be cleared for sand beaches.',
          evidenceToEncounter: 'Comparing wave action in a tank with model roots (pencil/twig mesh) versus bare sand: bare sand washes away immediately, while roots trap sediment and calm waves.',
          scientificReality: 'Mangrove prop roots dissipate over 66% of wave energy, trap sediment, prevent coastal erosion, and provide essential nursery habitats for 75% of Belize\'s commercial marine species.',
          teacherCorrectionPrompt: '"Look at our erosion wave tray. What happened to the sand behind the mesh roots versus the bare shoreline?"'
        },
        {
          misconception: 'If one species disappears from a reef food web, other animals just eat something else without any problem.',
          evidenceToEncounter: 'Removing the "Parrotfish" card from a Belize Barrier Reef food web string model causes the algae cards to overload and smother the coral cards.',
          scientificReality: 'Ecosystems are tightly interdependent; losing herbivorous grazers like parrotfish allows macroalgae to overgrow and suffocate live coral polyps.',
          teacherCorrectionPrompt: '"When we cut the string to the parrotfish, what happened to the algae? Did the coral survive?"'
        }
      ],
      predictionPrompt: 'I predict the model shoreline with tangled roots will lose (more / less) sediment during wave action because __________________________.',
      investigation: {
        whatToInvestigate: 'How prop root structures trap sediment and dissipate wave energy using a dual-channel wave simulation tray (one bare sand bank, one with toothpick/mesh root models).',
        whatToObserve: 'Wave height reduction, sediment displacement, and water clarity in both channels after 10 continuous wave pulses.',
        whatToRecord: 'Water clarity rating (1-5 scale), depth of eroded sand channel in centimeters, and sketches of trapped silt particles.',
        evidenceProduced: 'The bare channel lost 4.5 cm of sand bank; the root channel retained 95% of sediment and reduced wave surge by half.',
        questionAnsweredByEvidence: 'Evidence proves mangrove root architecture physically stabilizes coastlines and shields Belizean shores from storm surges.',
        materials: ['Plastic stream table or deep baking trays', 'Fine sand and gravel', 'Craft sticks/toothpicks tied into prop root clusters', 'Wave generator paddle (flat cardboard/plastic ruler)', 'Graduated beakers', 'Science notebooks'],
        isStudentDriven: true
      },
      explanationCER: {
        claim: 'Red mangrove prop roots prevent coastal erosion and protect marine biodiversity by anchoring shoreline sediments and dissipating wave energy.',
        evidence: 'In our wave tray investigation, 95% of sand was held in place by the root cluster model, while the bare channel lost 4.5 cm of shoreline to wave wash.',
        reasoning: 'The stilt-like architecture creates high friction that slows moving water, causing suspended particles to drop and settle rather than washing out to sea.',
        formalVocabularyMoment: 'Introduce "Sediment trapping", "Ecosystem Resilience", and "Trophic Interdependence" AFTER the wave demonstration.',
        formalVocabulary: [
          { term: 'Prop Roots', definition: 'Specialized above-ground aerial roots that anchor red mangrove trees in soft coastal mud and absorb oxygen.' },
          { term: 'Ecosystem Resilience', definition: 'The capacity of an ecosystem (like a mangrove forest or coral reef) to absorb disturbances like storms and recover.' },
          { term: 'Trophic Interdependence', definition: 'The mutual dependence between organisms across feeding levels where changes to one species directly impact others.' }
        ]
      },
      application: {
        belizeanContext: 'Belize Barrier Reef UNESCO World Heritage site, coastal communities in Dangriga, Hopkins, and Caye Caulker.',
        applicationTask: 'A developer wants to clear 500 meters of mangrove swamp on a caye to build a marina. Using our investigation data, write an environmental impact brief explaining two specific consequences for local fisheries and coastal flooding.'
      },
      assessment: {
        task: `${analysis.primaryVerb} the structural adaptations of Belizean wetland organisms and their ecological significance.`,
        exitQuestion: 'How does the disappearance of mangroves directly endanger both coral reefs offshore and human communities onshore during a hurricane in Belize?',
        expectedResponse: 'Without mangroves, sediment washes onto offshore reefs and smothers coral polyps, while onshore human homes lose their natural buffer against storm surge waves.',
        masteryCriteria: 'Student explicitly cites both terrestrial sediment trapping and marine nursery/wave dissipation with clear causal reasoning.'
      }
    };
  }

  // C. Energy Conversion, Electricity & Circuits
  if (text.includes('energy') || text.includes('circuit') || text.includes('electricity') || text.includes('kinetic') || text.includes('potential') || text.includes('solar') || text.includes('conversion')) {
    return {
      phenomenon: 'A standard classroom flashlight left switched on for 15 minutes produces bright light, but when you touch the metal casing near the bulb, it feels noticeably warm, and the battery slowly drains.',
      inquiryQuestion: 'Where does the chemical energy from the battery go when the circuit is closed, and why does thermal energy always appear?',
      priorKnowledgeHook: 'Physical Hook: Rub your palms together vigorously for 10 seconds. What do you feel? Where did that heat come from? What kind of energy was your moving hands?',
      diagnosticActivity: 'Misconception Statement: "When a battery runs down, all the energy inside it has been destroyed and disappeared." Ask students to agree/disagree and justify on mini-whiteboards.',
      misconceptions: [
        {
          misconception: 'Energy gets "used up" and completely disappears when devices run.',
          evidenceToEncounter: 'Measuring total inputs and detecting heat/light/sound outputs: temperature rises on wire coils and bulb casings confirm energy was transformed, not vanished.',
          scientificReality: 'The Law of Conservation of Energy dictates energy cannot be created or destroyed, only transferred or transformed into other forms (often dissipated thermal energy).',
          teacherCorrectionPrompt: '"If the battery energy was destroyed, why did the flashlight get hot? Where did that thermal energy come from?"'
        },
        {
          misconception: 'Electricity flows out of both terminals of a battery and crashes in the middle at the bulb.',
          evidenceToEncounter: 'Inserting an ammeter or comparing bulb brightness at various points in a closed single loop shows equal continuous current throughout the entire loop.',
          scientificReality: 'Electric current is the continuous, circular flow of electric charge around a closed unbroken pathway from negative to positive terminals.',
          teacherCorrectionPrompt: '"Look at our circuit: if you disconnect the return wire, does the bulb stay half-lit? No! The path must be completely unbroken."'
        }
      ],
      predictionPrompt: 'I predict that when the circuit powers the motor/bulb, thermal energy (will / will not) be produced because __________________________.',
      investigation: {
        whatToInvestigate: 'How electrical energy from a D-cell transforms into radiant (light), kinetic (motion), and thermal (heat) energy across closed circuits.',
        whatToObserve: 'Bulb filament illumination, motor shaft spinning, temperature changes on wire connections and bulb surfaces before and after 3 minutes of operation.',
        whatToRecord: 'Energy transformation pathway chart: Input Form → Component → Useful Output Form + Dissipated Output Form, with recorded surface temperature changes.',
        evidenceProduced: 'Bulb produced light (useful) and 4°C rise in surface temperature (dissipated); motor produced rotation (useful) and buzzing sound + mild warmth (dissipated).',
        questionAnsweredByEvidence: 'Evidence proves electrical energy transforms into multiple output forms simultaneously, accounting for all input energy without loss.',
        materials: ['D-cell batteries in holders', 'Insulated copper connecting wires with alligator clips', 'Miniature 1.5V incandescent/LED bulbs in sockets', 'Small 3V DC hobby motors with paper fan blades', 'Digital probe thermometers or surface touch cards', 'Science notebooks'],
        isStudentDriven: true
      },
      explanationCER: {
        claim: 'Energy cannot be created or destroyed; in an electrical circuit, chemical energy from the battery transforms into electrical energy, which then converts into light, motion, and thermal energy.',
        evidence: 'Our investigation showed that when the circuit was closed, the bulb illuminated immediately and its temperature rose by 4°C, proving input energy became both light and heat.',
        reasoning: 'According to the Law of Conservation of Energy, the total input energy equals total output energy. No electrical device is 100% efficient, so some energy is inevitably dissipated as thermal energy.',
        formalVocabularyMoment: 'Introduce "Useful Energy", "Dissipated Energy", and "Law of Conservation of Energy" AFTER students record the temperature rise.',
        formalVocabulary: [
          { term: 'Law of Conservation of Energy', definition: 'A fundamental scientific law stating that energy cannot be created or destroyed; it can only change form.' },
          { term: 'Useful Output Energy', definition: 'The intended form of energy a machine or device produces to perform its primary function (e.g., light from a lamp, motion from a motor).' },
          { term: 'Dissipated Energy', definition: 'Energy that spreads out into the surrounding environment, usually as wasted thermal energy (heat) or sound.' }
        ]
      },
      application: {
        belizeanContext: 'Hydroelectric generation at Chalillo Dam in Cayo, solar panels on off-grid homes in Toledo, and incandescent vs LED street lighting in Belize City.',
        applicationTask: 'Trace the energy transformation path from sunlight falling onto a solar panel in a rural village school in Toledo to a classroom ceiling fan cooling students.'
      },
      assessment: {
        task: `${analysis.primaryVerb} energy transformation pathways in domestic appliances and verify conservation of energy.`,
        exitQuestion: 'A cell phone gets warm when you watch a video for 30 minutes. Explain where that thermal energy came from and why this proves energy was not destroyed.',
        expectedResponse: 'Chemical energy stored in the phone battery transformed into electrical energy, which became radiant light (screen), sound (speakers), and dissipated thermal energy (warmth). The total output equals the battery input.',
        masteryCriteria: 'Student identifies input energy, distinguishes useful from dissipated output, and applies conservation law without misconceptions.'
      }
    };
  }

  // D. Human Body Systems: Circulation, Respiration & Heart
  if (text.includes('body') || text.includes('circulation') || text.includes('heart') || text.includes('blood') || text.includes('respiratory') || text.includes('lungs') || text.includes('pulse')) {
    return {
      phenomenon: 'After a student sprints across the football field during recess, their heart beats at 145 beats per minute compared to 75 bpm at rest, and their breathing is deep and rapid.',
      inquiryQuestion: 'Why does physical exercise cause both our heart rate and breathing rate to increase simultaneously?',
      priorKnowledgeHook: 'Find Your Pulse: Place index and middle fingers gently on your wrist or neck below the jawline. Count your beats for 15 seconds. What is causing that physical pulsing rhythm?',
      diagnosticActivity: 'Misconception Check: "True or False: The heart cleans the blood and makes oxygen out of thin air." Ask students to explain their reasoning.',
      misconceptions: [
        {
          misconception: 'The heart creates oxygen for the body.',
          evidenceToEncounter: 'Tracing the pulmonary circuit: blood travels from heart to lungs specifically to collect oxygen and dump carbon dioxide, then returns to the heart.',
          scientificReality: 'The lungs absorb oxygen and expel carbon dioxide; the heart acts solely as a muscular mechanical double-pump circulating blood through vessels.',
          teacherCorrectionPrompt: '"If the heart made oxygen, why would blood need to travel through our lungs first before going to our muscles?"'
        },
        {
          misconception: 'Veins carry blue blood inside our bodies.',
          evidenceToEncounter: 'Examining oxygen saturation diagrams and real blood samples: oxygen-rich blood is bright scarlet red; oxygen-poor blood is deep dark maroon, never blue.',
          scientificReality: 'All human blood is red. Veins appear blue through skin because light wavelengths penetrate and reflect differently through skin layers.',
          teacherCorrectionPrompt: '"Have you ever bled blue when getting a scratch on your arm? No, all blood is red; it just changes from bright scarlet to dark maroon depending on oxygen levels."'
        }
      ],
      predictionPrompt: 'I predict my heart rate after 1 minute of jumping jacks will increase by at least _______ beats per minute because __________________________.',
      investigation: {
        whatToInvestigate: 'The direct relationship between physical exertion, pulse rate (bpm), and breathing rate in beats/breaths per minute.',
        whatToObserve: 'Resting pulse rate vs active pulse rate immediately after 60 seconds of step-ups/jumping jacks, and recovery time back to baseline.',
        whatToRecord: 'A structured 3-stage data table: Resting Pulse (bpm), Immediate Post-Exercise Pulse (bpm), and 3-Minute Recovery Pulse (bpm) across 3 peer trials.',
        evidenceProduced: 'Average resting pulse was 76 bpm; average active pulse rose to 132 bpm (56 bpm increase); breathing rate doubled from 16 to 34 breaths/min.',
        questionAnsweredByEvidence: 'Evidence proves working muscle cells require significantly accelerated oxygen and nutrient delivery via faster blood flow.',
        materials: ['Stopwatches or classroom wall clock with second hand', 'Stethoscope (optional for demonstration)', 'Pulse tracking recording sheet', 'Graph paper for plotting heart rate changes', 'Science notebooks'],
        isStudentDriven: true
      },
      explanationCER: {
        claim: 'Exercise causes working muscle cells to consume more oxygen and glucose for cellular energy, requiring the circulatory and respiratory systems to pump faster to meet cellular demand.',
        evidence: 'Our investigation recorded a 74% increase in heart rate (from 76 to 132 bpm) and double the respiration rate immediately following 60 seconds of vigorous exercise.',
        reasoning: 'Muscle cells require oxygen to release energy. The heart double-pumps deoxygenated blood to the lungs to collect oxygen, then propels oxygenated blood out through arteries to working tissues.',
        formalVocabularyMoment: 'Introduce "Arteries", "Veins", "Capillaries", and "Pulmonary Circulation" AFTER students graph their pulse rate jump.',
        formalVocabulary: [
          { term: 'Artery', definition: 'Thick, muscular blood vessels that carry oxygen-rich blood away from the heart under high pressure.' },
          { term: 'Vein', definition: 'Blood vessels equipped with one-way valves that carry oxygen-depleted blood back toward the heart.' },
          { term: 'Capillaries', definition: 'Microscopic blood vessels where oxygen, nutrients, and waste products are exchanged directly with body cells.' }
        ]
      },
      application: {
        belizeanContext: 'Cardiovascular health in Belize: staying active through football, cycling along the highway, and combating hypertension and lifestyle diseases.',
        applicationTask: 'Explain why an athlete in training in Belize has a lower resting heart rate (e.g. 58 bpm) than a sedentary person (85 bpm) while doing the same amount of daily work.'
      },
      assessment: {
        task: `${analysis.primaryVerb} the structural flow of the circulatory system and explain the heart's pumping function.`,
        exitQuestion: 'Trace the path of a drop of blood starting in a working calf muscle, traveling through the heart and lungs, and back to the muscle.',
        expectedResponse: 'Calf muscle → veins → right side of heart → pulmonary artery → lungs (collects O2) → pulmonary veins → left side of heart → aorta → arteries → calf muscle.',
        masteryCriteria: 'Student accurately orders the four main chambers/pathways (muscle → right heart → lungs → left heart → body) and identifies gas exchange.'
      }
    };
  }

  // E. Matter, States of Matter, Evaporation & Water Cycle
  if (text.includes('matter') || text.includes('water cycle') || text.includes('state') || text.includes('solid') || text.includes('liquid') || text.includes('gas') || text.includes('evaporat') || text.includes('condens')) {
    return {
      phenomenon: 'On a hot humid afternoon in Belize, water droplets form on the dry outside surface of a cold glass of fresh lime juice, even though the glass has no cracks or leaks.',
      inquiryQuestion: 'Where do the water droplets on the outside of a cold glass come from, and what causes water to change state between gas and liquid?',
      priorKnowledgeHook: 'Puddle Challenge: What happens to rainwater puddles on the school court after 3 hours of hot Belizean sun? Where did the water physically go?',
      diagnosticActivity: 'Diagnostic Diagram: Draw the molecules inside an ice cube, a cup of water, and steam from a kettle. Show how close together or far apart they are.',
      misconceptions: [
        {
          misconception: 'The water on the outside of the glass leaked through the glass from the inside.',
          evidenceToEncounter: 'Putting colored lime juice inside the cold glass: the droplets that condense on the outside are 100% clear pure water, not colored lime juice.',
          scientificReality: 'Invisible water vapor in the surrounding warm air touches the cold glass surface, loses thermal energy, and condenses into liquid water droplets.',
          teacherCorrectionPrompt: '"Look at the drops on the outside: are they green like the lime juice inside, or clear? Clear! So did the juice leak through the glass?"'
        },
        {
          misconception: 'When water evaporates, it turns into air or disappears completely.',
          evidenceToEncounter: 'Placing a clear plastic bowl over a damp paper towel in sunlight: water evaporates from the towel and condenses on the underside of the plastic bowl, proving mass is conserved.',
          scientificReality: 'Evaporated water becomes an invisible gas called water vapor, consisting of identical H2O molecules that remain in the air until cooled.',
          teacherCorrectionPrompt: '"When water evaporates, it doesn\'t vanish—it just breaks apart into invisible gas molecules floating in the air."'
        }
      ],
      predictionPrompt: 'I predict the droplets on the outside of the cold cup will be (clear / colored like the drink) because __________________________.',
      investigation: {
        whatToInvestigate: 'How cooling warm humid air causes condensation, and how heating liquid causes evaporation in closed vs open systems.',
        whatToObserve: 'Droplet formation on metal/plastic cups containing ice water vs room temperature water; condensation under clear plastic wrap over heated warm water.',
        whatToRecord: 'Observation table recording surface temperature of cup, appearance of droplets (time elapsed), color of droplets, and mass of sealed system before/after.',
        evidenceProduced: 'Ice cup formed clear droplets within 90 seconds; room temperature cup formed zero droplets; condensation droplets were crystal clear regardless of interior liquid color.',
        questionAnsweredByEvidence: 'Evidence proves water droplets come from the invisible water vapor in ambient air when thermal energy is removed.',
        materials: ['Clear plastic cups and metal cans', 'Ice cubes and cold water', 'Food coloring (to dye interior water)', 'Paper towels', 'Plastic cling wrap and rubber bands', 'Science notebooks'],
        isStudentDriven: true
      },
      explanationCER: {
        claim: 'Water changes state between liquid and gas depending on thermal energy; cooling invisible water vapor causes it to condense into liquid droplets.',
        evidence: 'Clear droplets formed exclusively on the cold ice-filled cup and were completely colorless, unlike the blue-dyed water inside the cup.',
        reasoning: 'Molecules of water vapor in ambient room air lose kinetic energy when they collide with the cold surface. Slower molecules are pulled together by intermolecular forces into liquid drops.',
        formalVocabularyMoment: 'Introduce "Condensation", "Evaporation", and "Water Vapor" AFTER students confirm the exterior droplets are clear.',
        formalVocabulary: [
          { term: 'Condensation', definition: 'The physical change of state from a gas (water vapor) to a liquid when thermal energy is removed.' },
          { term: 'Evaporation', definition: 'The physical change of state from a liquid to a gas (water vapor) when thermal energy is added.' },
          { term: 'Water Vapor', definition: 'Water in its invisible gaseous state, present naturally in the atmosphere.' }
        ]
      },
      application: {
        belizeanContext: 'Morning dew on grass in Cayo, cloud formation over the Maya Mountains, and harvesting rain in cisterns during dry season.',
        applicationTask: 'Explain how warm moist air blowing inland from the Caribbean Sea forms rain clouds when it rises over the Maya Mountains in Belize.'
      },
      assessment: {
        task: `${analysis.primaryVerb} the changes of state in the water cycle and explain the thermal energy transfers involved.`,
        exitQuestion: 'Why does a mirror in your bathroom fog up when someone takes a hot shower, and what would happen if you blow hot air on that foggy mirror with a hair dryer?',
        expectedResponse: 'Hot water creates water vapor; when vapor hits the cool mirror surface, it condenses into tiny liquid droplets (fog). Blowing warm air adds thermal energy, causing the droplets to evaporate back into gas.',
        masteryCriteria: 'Student connects cooling to condensation and heating to evaporation with accurate molecular reasoning.'
      }
    };
  }

  // F. Weather, Atmosphere, Tropical Cyclones & Earth Systems
  if (text.includes('weather') || text.includes('climate') || text.includes('cyclone') || text.includes('hurricane') || text.includes('atmosphere') || text.includes('wind') || text.includes('earth')) {
    return {
      phenomenon: 'Before a tropical storm or squall arrives in Belize, the air pressure on our classroom barometer drops sharply, the wind shifts direction and picks up speed, and towering dark cumulonimbus clouds form on the horizon.',
      inquiryQuestion: 'What causes air to move as wind, and why do areas of low barometric pressure produce storm clouds and precipitation in Belize?',
      priorKnowledgeHook: 'Balloon Expansion Hook: What happens when you stretch a balloon over the mouth of a glass bottle and place the bottle in hot water versus ice water? Try it!',
      diagnosticActivity: 'Misconception Vote: "True or False: Cold air rises because it is heavy and pushes down." Reveal student mental models about density and air pressure.',
      misconceptions: [
        {
          misconception: 'Air has no weight or mass because we cannot see it.',
          evidenceToEncounter: 'Balancing two inflated balloons on a yardstick, then popping one: the yardstick immediately tilts toward the inflated balloon, proving air has mass.',
          scientificReality: 'Air is matter composed of nitrogen, oxygen, and other gases that possess mass, exert pressure, and respond to temperature changes.',
          teacherCorrectionPrompt: '"Look at our balance scale: when we popped the balloon, which way did the scale tip? That proves air has real weight!"'
        },
        {
          misconception: 'Hurricanes are powered by ocean waves.',
          evidenceToEncounter: 'Simulating warm vs cold water evaporation: warm ocean water (above 26.5°C/80°F) releases huge volumes of rising water vapor, fueling convection currents.',
          scientificReality: 'Tropical cyclones are thermal heat engines powered by latent heat released when warm sea water evaporates and condenses high in the atmosphere.',
          teacherCorrectionPrompt: '"Why do hurricanes only form in the warm Caribbean in summer and fall, and never in cold winter oceans?"'
        }
      ],
      predictionPrompt: 'I predict that when air is heated, it will (rise / sink) because __________________________.',
      investigation: {
        whatToInvestigate: 'How temperature differences create air pressure gradients and convection currents (wind) using a convection box or spiral paper snake over a heat source.',
        whatToObserve: 'Upward air movement of paper spirals over a warm lamp/candle and downward air movement over ice blocks; barometric fluid shifts.',
        whatToRecord: 'Diagram of convection cell with directional arrows showing warm air rising (low pressure) and cool air sinking (high pressure); temperature readings.',
        evidenceProduced: 'Paper spiral spun clockwise rapidly when held 10 cm above warm lamp, proving hot air rises and creates an upward low-pressure convection current.',
        questionAnsweredByEvidence: 'Evidence proves unequal solar heating of Earth\'s surface creates pressure differences that drive atmospheric winds and tropical storm systems.',
        materials: ['Paper spiral snakes suspended on thread', 'Safe desk lamps (heat source)', 'Two balloons and yardstick with center pivot (air weight demo)', 'Simple DIY aneroid barometer or barometer tracking charts', 'National Meteorological Service of Belize weather maps'],
        isStudentDriven: true
      },
      explanationCER: {
        claim: 'Unequal heating of Earth\'s surface causes warm air to expand, become less dense, and rise, creating low-pressure areas that pull in surrounding air as wind.',
        evidence: 'Our paper spiral spun continuously over the warm lamp as rising air currents pushed it, while cooler air at the perimeter sank.',
        reasoning: 'Warm air molecules have higher kinetic energy, spread further apart, and decrease in density. Cooler, denser air flows into the low pressure void, creating wind and fueling tropical systems.',
        formalVocabularyMoment: 'Introduce "Convection", "Barometric Pressure", and "Tropical Cyclone" AFTER observing the rising warm air.',
        formalVocabulary: [
          { term: 'Convection Current', definition: 'The circular movement of air or liquid caused by warm, less dense material rising and cool, denser material sinking.' },
          { term: 'Barometric Pressure', definition: 'The force exerted by the weight of air molecules pushing down on a given area of Earth\'s surface.' },
          { term: 'Low-Pressure System', definition: 'An atmospheric region where warm air rises, associated with clouds, wind, and precipitation like tropical waves.' }
        ]
      },
      application: {
        belizeanContext: 'NEMO hurricane preparedness, tracking advisories from the National Met Service in Ladyville, and coastal evacuations.',
        applicationTask: 'Examine a Belize Met Service weather bulletin showing a tropical wave with pressure dropping to 1004 mb. Explain what coastal communities in Belize should anticipate.'
      },
      assessment: {
        task: `${analysis.primaryVerb} atmospheric patterns and explain how barometric changes signal approaching tropical weather systems.`,
        exitQuestion: 'Why does a falling barometer reading (dropping air pressure) indicate to a Belizean farmer or fisherman that stormy weather is approaching?',
        expectedResponse: 'Dropping air pressure indicates warm, moist air is rising rapidly, creating a low-pressure center that draws in strong winds and condenses into heavy storm clouds.',
        masteryCriteria: 'Student links low pressure to rising moist air and incoming wind/precipitation with clear causal reasoning.'
      }
    };
  }

  // G. Default Dynamic Science Inquiry Pack for Any Curriculum Outcome
  return {
    phenomenon: `An observable everyday mystery related to ${topic}: when students examine real samples or scenarios in Belize, unexpected physical patterns emerge before scientific rules are introduced.`,
    inquiryQuestion: `How do the observable properties and interactions of ${topic} produce the scientific effects we observe in our environment?`,
    priorKnowledgeHook: `Diagnostic Quick-Write: In your science notebook, write down two things you have observed in daily life in Belize connected to ${topic}.`,
    diagnosticActivity: `Misconception Reasoning Probe: Present a common misconception regarding ${topic} and ask students to justify why it might seem true or what evidence could test it.`,
    misconceptions: [
      {
        misconception: `Assuming observable scientific effects in ${topic} happen by chance rather than governed by physical laws.`,
        evidenceToEncounter: `Conducting repeated fair tests showing identical patterns under controlled conditions.`,
        scientificReality: `Scientific phenomena operate under predictable, measurable cause-and-effect laws.`,
        teacherCorrectionPrompt: `"Let us look at our recorded trial data: did our results happen randomly, or did the same pattern occur every time we tested it?"`
      }
    ],
    predictionPrompt: `I predict that when we test ${topic}, the result will be ________________ because ________________.`,
    investigation: {
      whatToInvestigate: `The direct physical cause-and-effect relationships governing ${topic} through systematic observation and controlled testing.`,
      whatToObserve: `Observable physical changes, structural traits, or measurable outputs under guided conditions.`,
      whatToRecord: `Structured data recording table containing trial numbers, controlled conditions, observations, and measured changes.`,
      evidenceProduced: `Empirical observation log and comparative data table establishing clear scientific patterns.`,
      questionAnsweredByEvidence: `Evidence directly resolves the opening inquiry question by establishing the underlying scientific mechanism.`,
      materials: [`Investigation specimen/apparatus for ${topic}`, 'Measurement tools', 'Observation recording log', 'Science notebooks'],
      isStudentDriven: analysis.isStudentInvestigationMandated
    },
    explanationCER: {
      claim: `Specific scientific claim directly answering the curriculum outcome: ${analysis.outcome}.`,
      evidence: `In our investigation, recorded observations and data proved that specific observable changes occurred under test conditions.`,
      reasoning: `These results occur because underlying scientific principles dictate how matter, energy, or biological systems interact under natural laws.`,
      formalVocabularyMoment: `Introduce formal scientific terminology ONLY AFTER students have gathered empirical evidence during the investigation.`,
      formalVocabulary: [
        { term: topic, definition: `The scientific concept or system investigated in today's lesson.` },
        { term: 'Empirical Evidence', definition: 'Information gathered through direct observation or experimentation.' },
        { term: 'Scientific Explanation', definition: 'A reasoned account connecting claim, evidence, and scientific principles.' }
      ]
    },
    application: {
      belizeanContext: `Real-world environmental, technological, or community application situated in Belize.`,
      applicationTask: `Apply our findings on ${topic} to solve a real practical problem or explain a natural feature in our Belizean community.`
    },
    assessment: {
      task: `${analysis.primaryVerb} the target concept of ${topic} and construct a reasoned scientific explanation based on collected evidence.`,
      exitQuestion: `How does the evidence we collected today answer our opening inquiry question about ${topic}?`,
      expectedResponse: `Students construct a complete Claim + Evidence + Reasoning response using age-appropriate scientific vocabulary.`,
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
     2. Structured Observation Table / Data Log with exact columns
     3. Analysis prompt comparing data to the opening inquiry question
     4. Claim + Evidence + Reasoning synthesis
   - Daily Exit Ticket directly evaluating the curriculum verb "${analysis.primaryVerb}".
   - NEVER use generic placeholders or unrelated subject content.`;
}

// ---------------------------------------------------------------------------
// 4. SCIENCE INQUIRY ENRICHMENT & GUARANTEE ENGINE
// ---------------------------------------------------------------------------

export function enrichScienceLessonPlan(rawPlan: any, context?: any): LessonPlan {
  const plan = { ...rawPlan };

  const grade = plan.grade || context?.grade || 'Standard 6';
  const topic = plan.topic || plan.lessonTitle || context?.topic || 'Science Inquiry';
  const subtopic = plan.subtopic || context?.subtopic || '';
  const outcome = plan.learningOutcome || context?.learningOutcome || `Investigate and explain ${topic}`;
  const duration = plan.duration || context?.duration || '45 minutes';

  const analysis = analyzeScienceOutcome(outcome, topic, subtopic, grade);
  const pack = resolveSciencePhenomenonPack(outcome, topic, subtopic, grade);

  // 1. Authoritative Learning Outcome preserved
  plan.learningOutcome = outcome;
  plan.lessonTitle = plan.lessonTitle || `${topic}: ${analysis.primaryVerb.charAt(0) + analysis.primaryVerb.slice(1).toLowerCase()} ${subtopic || topic}`;

  // 2. Learning Objectives Board: Strictly outcome-aligned with One Shared Condition
  const sharedCondition = `Given observable phenomenon materials, hands-on investigation apparatus, and structured science notebook recording sheets for ${topic}:`;
  const cognitiveObj = `Students will ${analysis.primaryVerb.toLowerCase()} ${analysis.scientificKnowledge.toLowerCase().replace(/^understanding core principles of /, '')} and construct a scientific explanation (CER) with at least 80% accuracy.`;
  const psychomotorObj = `Students will execute ${analysis.requiredStudentAction.toLowerCase()}, record observational data in structured logs, and annotate scientific diagrams in their notebooks.`;
  const affectiveObj = `Students will collaborate actively in scientific inquiry, demonstrate curiosity, and respect empirical evidence when evaluating predictions.`;

  plan.learningObjectives = {
    condition: sharedCondition,
    cognitive: cognitiveObj,
    psychomotor: psychomotorObj,
    affective: affectiveObj
  };

  plan.learningObjectivesBoard = {
    condition: sharedCondition,
    knowledge: cognitiveObj,
    skill: psychomotorObj,
    attitude: affectiveObj,
    cognitive: cognitiveObj,
    psychomotor: psychomotorObj,
    affective: affectiveObj,
    successCriteria: [
      `I can state a reasoned prediction and explain my thinking before investigating.`,
      `I can ${analysis.primaryVerb.toLowerCase()} key evidence during hands-on exploration and record accurate observations.`,
      `I can construct a scientific explanation using Claim, Evidence, and Reasoning to answer our inquiry question.`
    ]
  };

  plan.specificObjectives = [cognitiveObj, psychomotorObj, affectiveObj];

  // 3. Lesson Snapshot: Inquiry-Driven
  plan.lessonSnapshot = {
    about: `Authentic inquiry-based science lesson investigating ${topic} (${subtopic || 'core concept'}). Students explore the phenomenon of ${pack.phenomenon.slice(0, 80)}..., gather empirical evidence, and construct scientific explanations.`,
    learning: outcome,
    focus: `${analysis.primaryVerb}: ${topic}`,
    flow: `Phenomenon Hook & Question → Diagnostic & Prediction → Investigation & Evidence Recording → Data Analysis & Pattern Discussion → Scientific Explanation (CER) → Application & Exit Ticket`
  };

  // 4. Prior Knowledge & Misconceptions Activation
  plan.priorKnowledgeActivation = {
    whatTheyKnow: `Prerequisite observational awareness of ${topic} and basic familiarity with environmental and physical patterns in Belize.`,
    activationStrategy: `${pack.priorKnowledgeHook} Then conduct the diagnostic probe: ${pack.diagnosticActivity}`,
    misconceptionsToAnticipate: pack.misconceptions.map(m => m.misconception)
  };

  // 5. Common Misconceptions Table with Exact Scientific Encounter
  plan.commonMisconceptionsTable = pack.misconceptions.map(m => ({
    misconception: m.misconception,
    correctUnderstanding: m.scientificReality,
    teacherCorrectionLanguage: m.teacherCorrectionPrompt
  }));

  // 6. Vocabulary Focus: Introduced in Context
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
    studentDefinition: `In simple words: what we call the part or process when ${v.definition.toLowerCase()}`,
    exampleSentence: `During our investigation, we observed ${v.term.toLowerCase()} when collecting data.`
  }));

  // 7. Materials Board
  plan.materialsBoard = pack.investigation.materials.map((mat, idx) => ({
    name: mat,
    quantity: idx === 0 ? '1 per group of 4 students' : 'Class set',
    purpose: `Required for hands-on evidence collection during the ${topic} investigation phase.`,
    lessonPhase: 'Investigation & Evidence Collection',
    resourceType: idx === 0 ? 'manipulative' : 'printable'
  }));

  // 8. Execution Board: Progressive Scientific Inquiry Adapted to Duration
  // Check duration to scale phases
  const is45Min = duration.includes('45');
  const times = is45Min 
    ? ['5 minutes', '8 minutes', '15 minutes', '10 minutes', '7 minutes']
    : ['8 minutes', '12 minutes', '25 minutes', '15 minutes', '10 minutes'];

  plan.executionBoard = [
    {
      phase: 'Introduction',
      timeAllocation: times[0],
      teacherActions: [
        `Present the opening phenomenon without revealing the answer: "${pack.phenomenon}"`,
        `Pose the driving inquiry question: "${pack.inquiryQuestion}" and write it prominently on the board.`,
        `Direct students to keep their eyes on the phenomenon and share initial observations.`
      ],
      studentActions: [
        `Observe the phenomenon closely and describe what they see using sensory details.`,
        `Write down the driving inquiry question in their science notebooks.`,
        `Share initial curious observations with a partner without guessing conclusions.`
      ],
      questionsToAsk: [
        `"What do you notice happening when you look closely at this setup?"`,
        `"Why do you think this occurs in real life in Belize?"`,
        `"What question do we need to investigate to find out what is really going on?"`
      ],
      materialsUsed: [pack.investigation.materials[0] || 'Phenomenon demonstration materials'],
      ongoingAssessment: {
        observe: 'Student curiosity and ability to describe raw observations rather than memorized answers.',
        evidenceOfLearning: 'Students generate relevant questions and identify key physical features of the phenomenon.',
        misconceptions: [pack.misconceptions[0]?.misconception || 'Misinterpreting the cause of the phenomenon.'],
        checkUnderstanding: 'Ask 2 students to restate the inquiry question in their own words.'
      }
    },
    {
      phase: 'Explicit Teaching', // Mapped to Prior Knowledge & Prediction
      timeAllocation: times[1],
      teacherActions: [
        `Facilitate the prior knowledge diagnostic: "${pack.diagnosticActivity}"`,
        `Prompt students to formulate individual predictions: "${pack.predictionPrompt}"`,
        `Explain the investigation procedure, fair testing rules, and safety parameters.`,
        `Emphasize that predictions are valued for reasoning, not just being "right".`
      ],
      studentActions: [
        `Complete the diagnostic activity on mini-whiteboards or in notebooks.`,
        `Write their prediction following the frame: "I predict ______ because ______."`,
        `Review the investigation recording log and identify what evidence they need to collect.`
      ],
      questionsToAsk: [
        `"What prior experience makes you predict that outcome?"`,
        `"What will we measure or observe to see if our prediction holds up?"`,
        `"What variables must we keep fair and constant during our test?"`
      ],
      materialsUsed: ['Science notebooks', 'Investigation recording sheet'],
      ongoingAssessment: {
        observe: 'Whether student predictions contain causal reasoning ("because...") rather than wild guesses.',
        evidenceOfLearning: 'Completed prediction entries in student notebooks with explicit justifications.',
        misconceptions: [pack.misconceptions[0]?.misconception || 'Assuming outcomes happen without physical causes.'],
        checkUnderstanding: 'Random check of 3 student prediction sentences for "because" reasoning.'
      }
    },
    {
      phase: 'Guided Practice', // Mapped to Investigation & Evidence Collection
      timeAllocation: times[2],
      teacherActions: [
        `Distribute investigation apparatus and circulate to facilitate student-driven testing.`,
        `Ensure students are actually performing the action: "${analysis.requiredStudentAction}"`,
        `Prompt students to record precise quantitative and qualitative evidence in their data tables.`,
        `Guide students encountering unexpected data to check their measurement procedure.`
      ],
      studentActions: [
        `Handle materials in collaborative lab pairs to carry out the investigation procedure.`,
        `Observe physical changes, measure key values, and document results in their structured logs.`,
        `Compare observations with partner and ensure data is recorded neatly and accurately.`
      ],
      questionsToAsk: [
        `"What is your data showing so far?"`,
        `"What pattern are you beginning to notice across your trials?"`,
        `"How does this evidence compare with what you predicted earlier?"`
      ],
      materialsUsed: pack.investigation.materials,
      ongoingAssessment: {
        observe: 'Careful handling of materials, systematic data entry, and adherence to fair testing.',
        evidenceOfLearning: 'Accurately populated observation tables and labeled scientific sketches.',
        misconceptions: [pack.misconceptions[0]?.misconception || 'Ignoring data that contradicts initial prediction.'],
        checkUnderstanding: 'Inspect group data sheets to verify evidence is recorded before concluding.'
      }
    },
    {
      phase: 'Independent Practice', // Mapped to Analysis & Scientific Explanation (CER)
      timeAllocation: times[3],
      teacherActions: [
        `Lead a whole-class data synthesis board: record findings across groups to confirm patterns.`,
        `Introduce formal scientific vocabulary now that students have seen the evidence: ${vocabList.map(v => v.term).join(', ')}.`,
        `Guide students to construct their formal Scientific Explanation (Claim + Evidence + Reasoning).`,
        `Address the target misconception: "${pack.misconceptions[0]?.misconception}".`
      ],
      studentActions: [
        `Analyze group data and identify the overarching scientific pattern.`,
        `Integrate formal vocabulary terms into their explanations.`,
        `Draft their CER response: State their Claim, cite recorded Evidence, and provide scientific Reasoning.`,
        `Revisit their opening prediction: note whether data supported or revised their initial thinking.`
      ],
      questionsToAsk: [
        `"What claim can we make that answers our opening inquiry question?"`,
        `"What specific evidence from our data table supports that claim?"`,
        `"What scientific principle or law explains WHY our evidence supports the claim?"`
      ],
      materialsUsed: ['Science notebooks', 'Anchor chart for CER structure'],
      ongoingAssessment: {
        observe: 'Student ability to clearly distinguish evidence (raw data) from reasoning (scientific principle).',
        evidenceOfLearning: 'Written CER paragraph answering the inquiry question with accurate terminology.',
        misconceptions: [pack.misconceptions[0]?.misconception || 'Stating opinions without citing recorded data.'],
        checkUnderstanding: 'Have one student read their Claim and another cite the supporting Evidence.'
      }
    },
    {
      phase: 'Closure', // Mapped to Application & Assessment
      timeAllocation: times[4],
      teacherActions: [
        `Connect today\'s scientific findings to real Belizean environmental/technological systems: "${pack.application.belizeanContext}"`,
        `Administer the daily Science Exit Ticket: "${pack.assessment.exitQuestion}"`,
        `Revisit the opening driving question and celebrate scientific discoveries.`
      ],
      studentActions: [
        `Discuss how the concept applies to Belizean communities and ecosystems.`,
        `Independently complete the Science Exit Ticket without consulting peers.`,
        `Reflect on how their thinking changed from the opening prediction to their final conclusion.`
      ],
      questionsToAsk: [
        `"Who can answer our opening inquiry question in one clear sentence?"`,
        `"How does this scientific concept help people in Belize solve everyday problems?"`
      ],
      materialsUsed: ['Science Exit Ticket printable'],
      ongoingAssessment: {
        observe: 'Individual student mastery on the exit ticket without scaffolded support.',
        evidenceOfLearning: 'Completed exit tickets demonstrating achievement of curriculum outcome.',
        misconceptions: ['Reverting to intuitive misconceptions on exit ticket.'],
        checkUnderstanding: 'Collect 100% of exit tickets for formative grading against rubric.'
      }
    }
  ];

  // 9. Worked Examples List: Model Scientific Investigation & CER
  plan.workedExamplesList = [
    {
      subjectType: 'Science',
      problemOrContext: `Scientific Inquiry Walkthrough: "${pack.inquiryQuestion}"`,
      stepByStepSolution: [
        {
          step: 1,
          action: 'State the observable phenomenon and testable question',
          explanation: `Identify the target variable to investigate: ${pack.investigation.whatToInvestigate}`
        },
        {
          step: 2,
          action: 'Record a reasoned prediction with justification',
          explanation: `Frame prediction: "${pack.predictionPrompt}"`
        },
        {
          step: 3,
          action: 'Collect and record empirical evidence systematically',
          explanation: `Observe and record: ${pack.investigation.whatToObserve}. Evidence gathered: ${pack.investigation.evidenceProduced}`
        },
        {
          step: 4,
          action: 'Construct scientific explanation using Claim + Evidence + Reasoning (CER)',
          explanation: `Claim: ${pack.explanationCER.claim} | Evidence: ${pack.explanationCER.evidence} | Reasoning: ${pack.explanationCER.reasoning}`
        }
      ],
      finalAnswerOrModelResponse: `Scientific Explanation (CER):\nClaim: ${pack.explanationCER.claim}\nEvidence: ${pack.explanationCER.evidence}\nReasoning: ${pack.explanationCER.reasoning}`,
      commonErrorOrScientificReasoning: `Scientific Reasoning: Evidence must always precede scientific conclusions. A valid claim is useless without concrete observational proof and physical causality.`,
      belizeanContextNote: `Grounding in Belize: ${pack.application.belizeanContext}`
    }
  ];

  // 10. Instructional Sequence: Inquiry-Structured (Observation -> Investigation -> Explanation)
  plan.instructionalSequence = {
    iDo: {
      teacherAction: `The teacher introduces the observable phenomenon ("${pack.phenomenon}"), guides close observation, presents the driving inquiry question ("${pack.inquiryQuestion}"), and demonstrates the safe handling of investigation tools.`,
      teacherExplanation: `"Scientists, take a close look at this setup. We are not guessing answers today—we are gathering real evidence. Our driving question is: ${pack.inquiryQuestion}. Watch how I set up our observation table so every piece of data is accounted for."`,
      workedExample: `Model Inquiry Protocol: Posing the question → Making a prediction → Recording baseline data → Identifying the evidence required.`,
      thinkAloud: `"I am thinking: before I touch the apparatus, I must decide exactly what I will measure and record. If I don\'t write down my observations immediately, my evidence won\'t be reliable."`,
      expectedStudentObservation: `Students track the phenomenon, copy the inquiry question into notebooks, and prepare their data collection tables.`
    },
    weDo: {
      tasks: [
        `Collaborative Lab Investigation: In pairs, students test the setup, manipulate materials according to "${analysis.requiredStudentAction}", and record multiple trials.`,
        `Group Data Collation: Whole-class pooling of findings to compare data trends and address contradictory results.`
      ],
      teacherPrompts: [
        `"What does your data table show for Trial 1 versus Trial 2?"`,
        `"Look at the evidence: does it support or challenge our opening prediction?"`,
        `"What formal term describes the physical process we are observing?"`
      ],
      expectedResponses: [
        `Students cite exact recorded numbers/qualities from their investigation sheets.`,
        `Students compare group findings and identify common scientific patterns.`,
        `Students apply the formal vocabulary term (${vocabList[0]?.term}) in context.`
      ],
      correctAnswers: [
        `Empirical data accurately reflects test conditions.`,
        `Patterns match expected physical reality: ${pack.explanationCER.evidence}`
      ],
      feedbackLanguage: `"Exceptional precision with those measurements at Lab Station 3—your data table clearly shows the pattern!"`,
      correctionPrompts: `"Check that measurement again: remember to hold your eye level with the calibration mark so parallax error doesn't distort your evidence."`
    },
    youDo: {
      studentTasks: [
        `Independently construct the final Scientific Explanation (CER) paragraph in science notebooks.`,
        `Complete the Belizean applied challenge question connecting findings to local ecosystems or technology.`,
        `Complete the independent Science Exit Ticket.`
      ],
      problemsOrPassages: [
        `Question 1: State your Claim answering today\'s inquiry question.`,
        `Question 2: Cite two specific pieces of Evidence from your data table.`,
        `Question 3: Provide scientific Reasoning explaining why this happens using our new vocabulary.`,
        `Question 4: Real-world application: ${pack.application.applicationTask}`,
        `Question 5: Exit Ticket mastery check.`
      ],
      activities: [
        `Independent writing in science notebooks using the CER framework.`,
        `Self-assessment check against the success criteria.`
      ],
      successCriteria: `Student independently crafts a valid Claim with cited Evidence and Reasoning, achieving at least 80% on the exit ticket.`
    }
  };

  // 11. If Students Are Struggling: Science-Specific Remediation
  plan.ifStudentsAreStruggling = {
    signsOfConfusion: [
      `Confusing raw observation (what was seen) with inference or hypothesis.`,
      `Struggling to separate Claim from Evidence in the CER structure.`,
      `Reverting to common misconceptions despite conflicting test data.`,
      `Difficulty setting up data tables or reading calibrated scientific tools.`
    ],
    likelyCause: `Cognitive overload between handling physical apparatus and recording multi-step qualitative/quantitative data simultaneously.`,
    simplerExplanation: `Let's break it down into 3 simple sentences: 1) What did you see? (Evidence). 2) What is the answer to our question? (Claim). 3) Why did it happen? (Reasoning).`,
    alternativeExample: `Walk the student through a familiar everyday Belizean analogy: e.g., if you see puddles on the street and wet roofs, what is your Claim? It rained! What is your Evidence? The wet streets! What is your Reasoning? Rain falling from clouds wets outdoor surfaces.`,
    additionalGuidedPractice: `Provide a fill-in-the-blank CER sentence stem card and guide the student to insert their exact notebook numbers into the blanks.`,
    visualOrManipulativeOption: `Use physical color-coded flashcards: Blue card = Claim, Yellow card = Evidence (data), Green card = Reasoning (science rule).`,
    reteachingStrategy: `Pull a 4-minute focus table during independent practice: re-examine the physical apparatus side-by-side, highlight one key observation, and formulate the claim together.`,
    followUpCheck: `Ask the student to state their Claim and point to the single line in their notebook table that proves it.`
  };

  // 12. Complete Assessment with Rubric Aligned to Curriculum Verb
  plan.completeAssessment = {
    task: `${analysis.primaryVerb} Investigation Mastery Assessment: ${outcome}`,
    expectedResponse: `Students accurately demonstrate ${analysis.requiredStudentAction}, cite empirical data, explain underlying scientific causality (CER), and achieve at least 80% on the inquiry rubric.`,
    answerKey: `Question 1 (Inquiry Question): Accurately states the scientific claim (${pack.explanationCER.claim}).
Question 2 (Evidence): Cites recorded data/observations (${pack.explanationCER.evidence}).
Question 3 (Reasoning): Applies scientific principles (${pack.explanationCER.reasoning}).
Question 4 (Application): Applies concept to Belizean context (${pack.application.applicationTask}).
Question 5 (Exit Ticket): Accurate response to: "${pack.assessment.exitQuestion}" (${pack.assessment.expectedResponse}).`,
    rubric: [
      {
        criteria: `Scientific Inquiry & Evidence Collection (${analysis.primaryVerb})`,
        exemplary: `Executes investigation flawlessly, records accurate and detailed data tables, and demonstrates high procedural rigor.`,
        proficient: `Conducts investigation effectively and records clear, usable evidence in data tables with minor omissions.`,
        developing: `Requires teacher assistance to conduct trials or leaves data tables partially incomplete.`
      },
      {
        criteria: `Scientific Explanation (Claim + Evidence + Reasoning)`,
        exemplary: `Constructs sophisticated CER explanation integrating formal vocabulary and providing flawless causal justification.`,
        proficient: `States a valid claim and cites relevant evidence with sound basic scientific reasoning.`,
        developing: `States a claim but omits supporting data or confuses evidence with opinions.`
      }
    ],
    masteryCriteria: `Mastery Standard: Student achieves at least 80% accuracy across empirical investigation and CER scientific explanation.`
  };

  // 13. Student Materials: Topic-Specific Investigation Worksheet & Exit Ticket
  plan.studentMaterials = [
    {
      title: `${topic} - Scientific Investigation & Evidence Log`,
      type: 'worksheet',
      content: `NAME: ____________________________________   DATE: ___________________\nGRADE: ${grade}   SUBJECT: Science & Technology   TOPIC: ${topic}\nCURRICULUM OUTCOME: ${outcome}\n\n=======================================================\nPART 1: THE DRIVING INQUIRY QUESTION\n=======================================================\nInquiry Question: ${pack.inquiryQuestion}\n\nMY SCIENTIFIC PREDICTION:\nI predict that ________________________________________________________\nbecause ______________________________________________________________\n_____________________________________________________________________\n\n=======================================================\nPART 2: INVESTIGATION & EVIDENCE COLLECTION\n=======================================================\nWhat we are testing: ${pack.investigation.whatToInvestigate}\n\nDATA RECORDING TABLE:\n+-------+-------------------------+-------------------------+-------------------------+\n| Trial | Test Setup / Condition  | What We Observed        | Measurement / Data Log  |\n+-------+-------------------------+-------------------------+-------------------------+\n|   1   |                         |                         |                         |\n|   2   |                         |                         |                         |\n|   3   |                         |                         |                         |\n+-------+-------------------------+-------------------------+-------------------------+\n\nKey Observation Notes & Diagram Sketch:\n[ Draw and label your specimen / apparatus setup below ]\n\n\n\n=======================================================\nPART 3: SCIENTIFIC EXPLANATION (C - E - R)\n=======================================================\nCLAIM (Answer our inquiry question in one clear statement):\n_____________________________________________________________________\n_____________________________________________________________________\n\nEVIDENCE (What specific numbers or observations from your table prove your claim?):\n_____________________________________________________________________\n_____________________________________________________________________\n\nREASONING (What scientific principle or law explains WHY this happened?):\n_____________________________________________________________________\n_____________________________________________________________________\n\n=======================================================\nPART 4: BELIZEAN REAL-WORLD APPLICATION\n=======================================================\n${pack.application.applicationTask}\nMy Solution / Explanation:\n_____________________________________________________________________\n_____________________________________________________________________`,
      answerKey: `Model Student Worksheet Key:\nPrediction: Reasonable hypothesis linked by causal 'because'.\nData Table: Accurately logged observations reflecting trial conditions (${pack.investigation.evidenceProduced}).\nClaim: ${pack.explanationCER.claim}\nEvidence: Cites recorded trial numbers and observable changes (${pack.explanationCER.evidence}).\nReasoning: Connects evidence to underlying scientific law (${pack.explanationCER.reasoning}).\nApplication: Sound environmental/technical solution in Belize (${pack.application.belizeanContext}).`
    },
    {
      title: `${topic} - Daily Science Inquiry Exit Ticket`,
      type: 'exit_ticket',
      content: `DAILY SCIENCE EXIT TICKET: ${topic}\nName: _________________________________ Date: ______________ Grade: ${grade}\n\n1. Inquiry Question Check: ${pack.inquiryQuestion}\n   My Answer: _________________________________________________________\n   _____________________________________________________________________\n\n2. Evidence Citation: What was the single most convincing piece of evidence you recorded in your investigation today?\n   Evidence: __________________________________________________________\n   _____________________________________________________________________\n\n3. Misconception Check: A classmate says: "${pack.misconceptions[0]?.misconception}".\n   Based on our investigation today, explain why they need to revise their thinking:\n   Explanation: ________________________________________________________\n   _____________________________________________________________________`,
      answerKey: `1. Clear scientific claim answering the driving inquiry question.\n2. Concrete citation of data or observed changes from the investigation table.\n3. Cites experimental evidence proving the scientific reality (${pack.misconceptions[0]?.scientificReality}).`
    }
  ];

  // 14. Teacher Preparation Briefing & Script
  plan.teachMeThisTopic = {
    whatIsThisTopic: `${topic} is a foundational scientific inquiry concept within the ${grade} Belize Science and Technology curriculum focusing on ${outcome}.`,
    whyItMatters: `It develops authentic scientific literacy, empirical inquiry habits, and causal reasoning essential for understanding natural systems and sustainable technology in Belize.`,
    mostImportantIdeas: [
      `Phenomenon First: Always hook students with the observable mystery (${pack.phenomenon.slice(0, 50)}...) before introducing terminology.`,
      `Students Must Do The Science: Avoid teacher monologue; students must directly manipulate materials, test, and log data.`,
      `CER Structure: Enforce Claim + Evidence + Reasoning so students justify conclusions using empirical proof.`
    ],
    mustUnderstandBeforeTeaching: `Prepare the physical investigation materials in advance (${pack.investigation.materials.slice(0, 3).join(', ')}). Test the demonstration once beforehand to verify observable changes occur within the allocated lesson time.`,
    howToExplainSimply: `Use the guiding question: "${pack.inquiryQuestion}". Allow students to experience the phenomenon before formalizing terms like ${vocabList.map(v => v.term).join(', ')}.`,
    firstExampleToUse: `The opening phenomenon: ${pack.phenomenon}`,
    mistakesToWatchFor: pack.misconceptions.map(m => m.misconception),
    quickCheckUnderstanding: `Conduct a rapid thumbs check on the diagnostic probe: "${pack.diagnosticActivity}" within 60 seconds.`
  };

  plan.teacherScriptDetailed = {
    opening: `"Good morning, scientists! Eyes on the lab table. Today, we are not opening textbooks to memorize words—we are investigating a real mystery in our environment: ${pack.phenomenon} By the end of today's inquiry, every one of you will be able to prove why this happens using your own recorded evidence."`,
    introduction: `"Look closely at what is happening here. Our driving inquiry question on the board is: '${pack.inquiryQuestion}'. Before we touch our apparatus, turn to your partner and whisper: what do you notice right now?"`,
    explanation: `"Notice that in science, we never jump to conclusions without testing. Before we begin, open your notebooks to Part 1: write your prediction. Complete the sentence: 'I predict ______ because ______.' Explain your thinking."`,
    modeling: `"Watch how I set up our investigation apparatus. Notice how I control our variables so our test is completely fair. When you observe your trials, record exactly what happens in your data table—do not alter data to match your prediction. Science honors the evidence!"`,
    questioning: [
      `"What does your evidence tell you about our opening question?"`,
      `"Why did Trial 1 produce that specific observable change?"`,
      `"How does your evidence disprove the common idea that ${pack.misconceptions[0]?.misconception.toLowerCase()}?"`
    ],
    transitions: [
      `"Now that our predictions are locked in, materials managers collect your group tray. You have 15 minutes to run your trials and complete your data tables."`,
      `"Apparatus down, pencils ready. Let's look at the class data board. What overarching pattern do we see across every lab group?"`,
      `"Now let's synthesize our discoveries into a formal Scientific Explanation: Claim, Evidence, and Reasoning."`
    ],
    directions: `"Work in your lab pairs. Partner A handles the apparatus; Partner B verifies the measurement and records the log. Switch roles for Trial 2. Record every trial neatly."`,
    feedbackLanguage: `"Brilliant precision with your data recording at Table 4—your evidence clearly proves the relationship!"`,
    correctionPrompts: `"Stop right there and look at your data. Did your measurement show that, or are you writing what you thought would happen? Record only what you actually observed."`,
    closing: `"Materials neatly returned in 3... 2... 1. Scientists, who can answer our driving question: '${pack.inquiryQuestion}'? Outstanding scientific inquiry today, class!"`
  };

  // 15. Science-specific inquiry framework metadata on plan
  (plan as any).scienceInquiryFramework = {
    curriculumOutcomeAnalysis: analysis,
    phenomenonOrProblem: {
      description: pack.phenomenon,
      observableContext: 'Everyday physical/biological systems in Belize',
      guidingInquiryQuestion: pack.inquiryQuestion
    },
    priorKnowledgeAndPrediction: {
      diagnosticActivity: pack.diagnosticActivity,
      misconceptionsToElicit: pack.misconceptions.map(m => m.misconception),
      studentPredictionPrompt: pack.predictionPrompt
    },
    investigationPlan: {
      whatStudentsAreInvestigating: pack.investigation.whatToInvestigate,
      whatStudentsWillObserve: pack.investigation.whatToObserve,
      whatStudentsWillRecord: pack.investigation.whatToRecord,
      whatEvidenceStudentsWillUse: pack.investigation.evidenceProduced,
      questionAnsweredByEvidence: pack.investigation.questionAnsweredByEvidence,
      studentActionVsTeacherDemo: analysis.isStudentInvestigationMandated ? 'Student Investigation' : 'Interactive Guided Investigation',
      safetyOrMaterialNotes: 'Handle laboratory apparatus carefully; adhere to teacher safety instructions.'
    },
    scientificExplanationCER: pack.explanationCER,
    applicationAndSynthesis: {
      realWorldBelizeanApplication: pack.application.belizeanContext,
      misconceptionRevisionOpportunity: pack.misconceptions[0]?.teacherCorrectionPrompt || ''
    }
  };

  return plan;
}
