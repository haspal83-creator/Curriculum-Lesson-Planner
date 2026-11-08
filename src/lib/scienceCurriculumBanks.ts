/**
 * BELIZE NATIONAL PRIMARY CURRICULUM SCIENCE & TECHNOLOGY CONTENT BANKS
 * 
 * Provides authentic, age-appropriate, inquiry-grounded curriculum banks
 * across all Belize Primary Standards (Standard 1 through Standard 6):
 * 
 * 1. Ecosystems: Terrestrial & Aquatic (SC 3.15, Standard 6)
 * 2. Plant Biology & Vascular Transport (Standard 2 & 4)
 * 3. Living vs Non-Living Things (Standard 1)
 * 4. Animal Habitats & Adaptations (Standard 2 & 3)
 * 5. Matter, Materials & States of Matter (Standard 4)
 * 6. Forces, Energy & Simple Machines (Standard 5)
 * 7. Electricity & Circuits (Standard 5 & 6)
 * 8. Human Body Systems: Circulation & Respiration (Standard 5 & 6)
 * 9. Weather, Climate & Tropical Meteorology (Standard 3 & 4)
 * 10. Water Cycle & Environmental Stewardship (Standard 4 & 5)
 * 11. General Scientific Inquiry & Empirical Investigations (All Standards)
 */

export type ScienceTopicCategory =
  | 'ecosystems_terrestrial_aquatic'
  | 'plant_biology_transport'
  | 'living_nonliving_things'
  | 'animal_habitats_adaptations'
  | 'matter_states_properties'
  | 'forces_motion_machines'
  | 'electricity_energy_circuits'
  | 'human_body_systems'
  | 'weather_climate_meteorology'
  | 'water_cycle_conservation'
  | 'scientific_inquiry_general';

export interface ScienceInvestigationItem {
  id: number;
  questionText: string;
  questionType: 'multiple_choice' | 'fill_blank' | 'short_answer' | 'data_analysis' | 'diagram_labeling' | 'cer_explanation';
  points: number;
  options?: string[];
  expectedAnswer: string;
  markingGuide: string;
  targetObjectiveDomain?: 'cognitive' | 'psychomotor' | 'affective';
}

export interface ScienceCurriculumPack {
  category: ScienceTopicCategory;
  standardLevel: string;
  topicTitle: string;
  focalConcept: string;
  phenomenon: string;
  inquiryQuestion: string;
  priorKnowledgeHook: string;
  prerequisiteKnowledge: string;
  diagnosticProbe: string;
  misconceptions: {
    misconception: string;
    evidenceToEncounter: string;
    scientificReality: string;
    teacherCorrectionPrompt: string;
  }[];
  predictionPrompt: string;
  investigation: {
    title: string;
    investigationType: 'comparative_data_analysis' | 'controlled_experiment' | 'field_quadrant_sampling' | 'model_construction' | 'specimen_observation';
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
  belizeanContext: {
    ecosystemOrLocation: string;
    communityApplication: string;
  };
  learningObjectives: {
    condition: string;
    cognitive: string;
    psychomotor: string;
    affective: string;
    successCriteria: string[];
  };
  worksheetQuestions: ScienceInvestigationItem[]; // 8 questions totaling 10 marks
  exitTicketQuestions: ScienceInvestigationItem[]; // 3-4 questions totaling 5 marks (80% benchmark = 4/5)
  differentiation: {
    struggling: {
      support: string;
      scaffold: string;
      visualAid: string;
    };
    onLevel: {
      task: string;
      independence: string;
    };
    advanced: {
      extension: string;
      deeperInquiry: string;
    };
  };
  studentInvestigationMaterials?: {
    profileDossiers: string;
    organismCards: string;
    comparativeMatrix: string;
    comparativeMatrixAnswerKey?: string;
  };
}

/**
 * Detects the authoritative Science topic category based on topic, subtopic, and learning outcome.
 * Prevents topic contamination by checking high-specificity domains first (ecosystems, living things, machines)
 * before checking generic plant or body terms.
 */
export function detectScienceTopicCategory(
  topic: string = '',
  subtopic: string = '',
  outcome: string = ''
): ScienceTopicCategory {
  const combined = `${topic} ${subtopic} ${outcome}`.toLowerCase();

  // 1. Ecosystems (Terrestrial vs Aquatic, Biotic/Abiotic, Food Webs, Reefs, Forests)
  // Must be checked before generic plant terms because ecosystems contain primary producer plants!
  if (
    combined.includes('terrestrial and aquatic') ||
    combined.includes('terrestrial') ||
    combined.includes('aquatic') ||
    combined.includes('ecosystem') ||
    combined.includes('sc 3.15') ||
    combined.includes('sc3.15') ||
    combined.includes('biotic') ||
    combined.includes('abiotic') ||
    combined.includes('marine ecosystem') ||
    combined.includes('barrier reef') ||
    combined.includes('pine ridge') ||
    combined.includes('broadleaf forest') ||
    combined.includes('food web') ||
    combined.includes('trophic') ||
    combined.includes('ecological') ||
    (combined.includes('habitat') && (combined.includes('compare') || combined.includes('differentiate') || combined.includes('component') || combined.includes('role')))
  ) {
    return 'ecosystems_terrestrial_aquatic';
  }

  // 2. Living vs Non-Living Things (Early Primary / Standard 1)
  if (
    combined.includes('living and non-living') ||
    combined.includes('living and non living') ||
    combined.includes('non-living') ||
    combined.includes('characteristics of living') ||
    (combined.includes('alive') && combined.includes('not alive')) ||
    (combined.includes('living things') && (combined.includes('non-living') || combined.includes('characteristics') || combined.includes('alive') || combined.includes('traits')))
  ) {
    return 'living_nonliving_things';
  }

  // 3. Animal Habitats & Structural Adaptations
  if (
    combined.includes('animal adaptation') ||
    combined.includes('structural adaptation') ||
    combined.includes('camouflage') ||
    (combined.includes('animal') && (combined.includes('habitat') || combined.includes('covering') || combined.includes('locomotion') || combined.includes('survival')))
  ) {
    return 'animal_habitats_adaptations';
  }

  // 4. Plant Biology, Organs & Internal Vascular Transport
  // ONLY triggered when the lesson is specifically about plant organs, xylem/phloem, germination, or photosynthesis!
  if (
    combined.includes('xylem') ||
    combined.includes('phloem') ||
    combined.includes('plant structure') ||
    combined.includes('plant organ') ||
    combined.includes('plant part') ||
    combined.includes('stem transport') ||
    combined.includes('water transport in plant') ||
    combined.includes('photosynthesis') ||
    combined.includes('transpiration') ||
    combined.includes('seed germination') ||
    (combined.includes('plant') && (combined.includes('root') || combined.includes('leaf') || combined.includes('flower') || combined.includes('seed')))
  ) {
    return 'plant_biology_transport';
  }

  // 5. Matter, Materials, Mixtures & States of Matter
  if (
    combined.includes('state of matter') ||
    combined.includes('states of matter') ||
    combined.includes('solid') ||
    combined.includes('liquid') ||
    combined.includes('gas') ||
    combined.includes('matter') ||
    combined.includes('melting') ||
    combined.includes('freezing') ||
    combined.includes('evaporat') ||
    combined.includes('condens') ||
    combined.includes('dissolv') ||
    combined.includes('mixture') ||
    combined.includes('solution')
  ) {
    return 'matter_states_properties';
  }

  // 6. Forces, Motion & Simple Machines
  if (
    combined.includes('simple machine') ||
    combined.includes('lever') ||
    combined.includes('pulley') ||
    combined.includes('inclined plane') ||
    combined.includes('wheel and axle') ||
    combined.includes('friction') ||
    combined.includes('force') ||
    combined.includes('gravity') ||
    combined.includes('mechanical advantage')
  ) {
    return 'forces_motion_machines';
  }

  // 7. Electricity & Circuits
  if (
    combined.includes('circuit') ||
    combined.includes('electricity') ||
    combined.includes('conductor') ||
    combined.includes('insulator') ||
    combined.includes('switch') ||
    combined.includes('current') ||
    combined.includes('battery')
  ) {
    return 'electricity_energy_circuits';
  }

  // 8. Human Body Systems: Circulation & Respiration
  if (
    combined.includes('circulatory') ||
    combined.includes('respiratory') ||
    combined.includes('heart') ||
    combined.includes('pulse') ||
    combined.includes('blood') ||
    combined.includes('lungs') ||
    combined.includes('digestive') ||
    combined.includes('skeleton')
  ) {
    return 'human_body_systems';
  }

  // 9. Weather, Climate & Tropical Meteorology
  if (
    combined.includes('weather') ||
    combined.includes('climate') ||
    combined.includes('hurricane') ||
    combined.includes('tropical storm') ||
    combined.includes('thermometer') ||
    combined.includes('rain gauge') ||
    combined.includes('wind vane') ||
    combined.includes('barometer')
  ) {
    return 'weather_climate_meteorology';
  }

  // 10. Water Cycle & Environmental Stewardship
  if (
    combined.includes('water cycle') ||
    combined.includes('precipitation') ||
    combined.includes('groundwater') ||
    combined.includes('watershed') ||
    combined.includes('water conservation')
  ) {
    return 'water_cycle_conservation';
  }

  // Fallback to General Inquiry
  return 'scientific_inquiry_general';
}

/**
 * Normalizes Belize class level to a standard name.
 */
export function normalizeScienceGrade(grade?: string): string {
  if (!grade) return 'Standard 6';
  const g = grade.trim().toLowerCase();
  if (g.includes('infant 1')) return 'Infant 1';
  if (g.includes('infant 2')) return 'Infant 2';
  if (g.includes('infant 3')) return 'Infant 3';
  if (g.includes('std 1') || g.includes('standard 1')) return 'Standard 1';
  if (g.includes('std 2') || g.includes('standard 2')) return 'Standard 2';
  if (g.includes('std 3') || g.includes('standard 3')) return 'Standard 3';
  if (g.includes('std 4') || g.includes('standard 4')) return 'Standard 4';
  if (g.includes('std 5') || g.includes('standard 5')) return 'Standard 5';
  if (g.includes('std 6') || g.includes('standard 6')) return 'Standard 6';
  return 'Standard 6';
}

/**
 * Master Curriculum Bank Repository for Science and Technology
 */
export const SCIENCE_CURRICULUM_BANKS: Record<ScienceTopicCategory, ScienceCurriculumPack> = {
  // =========================================================================
  // 1. ECOSYSTEMS: TERRESTRIAL & AQUATIC (Standard 6, SC 3.15)
  // =========================================================================
  ecosystems_terrestrial_aquatic: {
    category: 'ecosystems_terrestrial_aquatic',
    standardLevel: 'Standard 6',
    topicTitle: 'Earth Science: Terrestrial and Aquatic Ecosystems',
    focalConcept: 'Differentiating Roles and Components of Terrestrial and Aquatic Ecosystems (Biotic & Abiotic Interactions)',
    phenomenon: 'In Belize, a howler monkey swinging through the canopy of the Mountain Pine Ridge broadleaf forest would quickly die if placed in the Belize Barrier Reef, while a Nassau grouper perfectly adapted to saltwater would suffocate in the Macal River or on dry land, even though both habitats share the same tropical Belizean sunlight and air temperature.',
    inquiryQuestion: 'How do the physical (abiotic) components of terrestrial, freshwater aquatic, and marine aquatic ecosystems shape the living (biotic) communities and survival roles within them in Belize?',
    priorKnowledgeHook: 'Quick Think-Pair-Share: Name one land animal from the Cayo or Toledo district and one water organism from the barrier reef or Belize River. What would happen if they swapped homes for 10 minutes?',
    prerequisiteKnowledge: 'In Standards 4 and 5 (Curriculum Cycles 1 and 2), students identified the basic survival needs of organisms (air, water, nutrients, sunlight, shelter), explored local Belizean habitats (pine forests, coastal cayes, river corridors), and classified organisms as herbivores, carnivores, and omnivores. Students understand that living organisms depend directly on their surrounding environment, but have not yet systematically contrasted physical abiotic limiting factors (salinity, light attenuation with depth, water density vs air gravity) or analyzed how upstream terrestrial watershed runoff directly alters downstream aquatic ecosystems.',
    diagnosticProbe: 'Ecosystem Component Probe: Is sunlight an abiotic factor or a biotic factor? Why can a terrestrial plant obtain carbon dioxide directly from the atmosphere, while aquatic plants and seagrasses must absorb dissolved gases from water?',
    misconceptions: [
      {
        misconception: 'Terrestrial and aquatic ecosystems are completely separate and never interact with or affect each other.',
        evidenceToEncounter: 'Examining watershed maps of Belize: soil runoff and agricultural fertilizer washed from inland Cayo hills into the Macal and Belize Rivers travel directly to the Caribbean Sea, smothering coastal coral polyps with silt and algae.',
        scientificReality: 'Terrestrial and aquatic ecosystems are interconnected through the hydrological cycle, nutrient transport, and biological migratory corridors; upstream terrestrial land management directly determines coastal marine health.',
        teacherCorrectionPrompt: '"Look at our Belize river basin map: when heavy rains wash mud into the Macal River in Cayo, where does that river eventually empty? Directly onto our coastal barrier reef!"'
      },
      {
        misconception: 'Abiotic factors are just a passive backdrop and do not actively determine what life can exist in an ecosystem.',
        evidenceToEncounter: 'Comparing salinity, light penetration, and dissolved oxygen levels between the Belize Barrier Reef (saltwater, 35 ppt), Macal River (freshwater, <0.5 ppt), and Mountain Pine Ridge (granitic soil, air medium, gravity support).',
        scientificReality: 'Abiotic factors (salinity, moisture, dissolved oxygen, soil composition, sunlight penetration, temperature) are the primary limiting factors that determine which biotic organisms can survive and reproduce.',
        teacherCorrectionPrompt: '"Could a pine tree grow on the reef? Why not? Because abiotic salinity and lack of soil make it physically impossible."'
      }
    ],
    predictionPrompt: 'I predict that terrestrial, freshwater, and marine ecosystems will differ most significantly in their (abiotic / biotic) factors because __________________________.',
    investigation: {
      title: 'Comparative Ecosystem Matrix & Organism Sorting Analysis (Belize Forest, Macal River & Barrier Reef)',
      investigationType: 'comparative_data_analysis',
      whatToInvestigate: 'How physical abiotic variables (air medium/gravity, freshwater flowing current vs marine salinity at 35 ppt, and depth-dependent sunlight penetration) dictate the biotic roles (producers, primary consumers, apex predators, decomposers) in Belizean terrestrial vs freshwater vs marine ecosystems.',
      whatToObserve: 'Belize Ecosystem Profile Dossiers (Mountain Pine Ridge Forest, Macal River Basin, Belize Barrier Reef Marine Reserve), 12 organism specimen cards (Jaguar, Tapir, Mahogany Tree, Epiphytic Orchid; River Hickatee Turtle, Macal River Algae, Mountain Mullet; Nassau Grouper, Queen Conch, Turtle Grass, Elkhorn Coral), and abiotic parameter charts.',
      whatToRecord: 'A structured 3-Column Comparative Ecosystem Matrix (Terrestrial vs Freshwater Aquatic vs Marine Aquatic) classifying components into Biotic vs Abiotic, recording physical parameters (salinity in ppt, supporting medium, gas source), and pairing organism adaptations with abiotic constraints.',
      evidenceProduced: 'Completed 3-column comparative matrix and sorting records establishing that terrestrial ecosystems require rigid structural support against gravity and water-loss prevention in air; freshwater aquatic ecosystems require adaptations for flowing currents with low salinity (<0.5 ppt); and marine ecosystems require salt regulation (35 ppt) and shallow photic zone placement for sunlight.',
      questionAnsweredByEvidence: 'Evidence proves that differing abiotic factors (medium density, salinity, light penetration) mandate specialized physiological structures and ecological roles, explaining why organisms cannot survive when swapped across terrestrial, freshwater, and marine ecosystems.',
      materials: [
        'Belize Ecosystem Profile Dossiers (Mountain Pine Ridge, Macal River Basin, Belize Barrier Reef)',
        '12 Organism Specimen Role Cards (Terrestrial, Freshwater River, Marine Reef)',
        '3-Column Comparative Ecosystem Matrix and Biotic/Abiotic Sorting Mats',
        'Science notebooks and colored pens'
      ],
      isStudentDriven: true
    },
    explanationCER: {
      claim: 'Terrestrial, freshwater, and marine ecosystems differ fundamentally in their abiotic mediums (air/soil vs low-salinity freshwater vs high-salinity seawater), which dictate specialized biotic adaptations and interdependent energy roles across Belize.',
      evidence: 'Our comparative data matrix revealed that terrestrial organisms (e.g., Mountain Pine Ridge pines, jaguars) require rigid structural support and adaptations against water loss in air; freshwater organisms (e.g., Macal River algae, Hickatee turtles) thrive in flowing water with <0.5 ppt salinity; and marine organisms (e.g., elkhorn coral, parrotfish) rely on buoyancy, 35 ppt salinity, and shallow sunlit photic zones.',
      reasoning: 'Under ecological principles, abiotic factors act as environmental filters. Because water is 800 times denser than air and attenuates light with depth, aquatic food webs are constrained by water clarity and salinity, whereas terrestrial ecosystems are constrained by gravity, soil fertility, and atmospheric moisture patterns.',
      formalVocabularyMoment: 'Introduce "Abiotic Factor", "Biotic Factor", "Terrestrial Ecosystem", "Freshwater Ecosystem", and "Marine Ecosystem" AFTER students sort the component cards into air/soil vs freshwater vs seawater categories.',
      formalVocabulary: [
        { term: 'Terrestrial Ecosystem', definition: 'A land-based community of organisms interacting with non-living environmental factors in an air/soil medium (e.g., tropical rainforest, pine savannah).' },
        { term: 'Aquatic Ecosystem', definition: 'A water-based environment where organisms interact with physical components in either freshwater (rivers, lagoons <0.5 ppt salinity) or marine (coral reefs, ocean ~35 ppt salinity) waters.' },
        { term: 'Biotic Component', definition: 'The living and once-living biological elements of an ecosystem, including producers, consumers, and decomposers.' },
        { term: 'Abiotic Component', definition: 'The non-living physical and chemical factors of an ecosystem, such as sunlight, temperature, salinity, water, soil, and dissolved gases.' }
      ]
    },
    belizeanContext: {
      ecosystemOrLocation: 'Mountain Pine Ridge Forest Reserve (Cayo District) vs Macal River Basin vs Belize Barrier Reef Marine Reserve (Ambergris Caye / South Water Caye).',
      communityApplication: 'Protecting coastal lagoons and managing upland watershed runoff from agricultural fields to preserve both terrestrial wildlife corridors and barrier reef tourism/fisheries.'
    },
    learningObjectives: {
      condition: 'Given Belize terrestrial, freshwater, and marine ecosystem profile dossiers, 12 organism cards, and a 3-column comparative matrix:',
      cognitive: 'Students will differentiate between and compare the physical components (abiotic) and living roles (biotic) of terrestrial, freshwater, and marine ecosystems with at least 80% accuracy on structured investigation items.',
      psychomotor: 'Students will classify 12 Belizean organism specimen cards and populate a 3-column comparative matrix recording abiotic parameters, trophic levels, and structural adaptations in their science notebooks.',
      affective: 'Students will formulate an evidence-supported conservation recommendation evaluating how upstream terrestrial runoff from the Macal River impacts coastal marine life on the Belize Barrier Reef.',
      successCriteria: [
        'I can classify ecosystem elements into biotic (living) and abiotic (non-living) components.',
        'I can identify at least three key abiotic differences between terrestrial (land) and aquatic (water) ecosystems in Belize.',
        'I can contrast freshwater (Macal River, <0.5 ppt) and marine (Barrier Reef, ~35 ppt) abiotic factors and explain their impact on living organisms.',
        'I can formulate an evidence-supported conservation recommendation evaluating how upstream terrestrial runoff impacts coastal coral reefs.'
      ]
    },
    worksheetQuestions: [
      {
        id: 1,
        questionText: 'Which of the following is an ABIOTIC component of a Belizean aquatic ecosystem?',
        questionType: 'multiple_choice',
        points: 1,
        options: ['A) Queen conch', 'B) Dissolved oxygen in seawater', 'C) Turtle grass', 'D) Nurse shark'],
        expectedAnswer: 'B) Dissolved oxygen in seawater',
        markingGuide: '1 mark for selecting B. Abiotic refers to non-living physical or chemical factors.',
        targetObjectiveDomain: 'cognitive'
      },
      {
        id: 2,
        questionText: 'Identify the primary medium that provides physical support for organisms in a terrestrial ecosystem versus an aquatic ecosystem.',
        questionType: 'short_answer',
        points: 1,
        expectedAnswer: 'Terrestrial organisms rely on rigid skeletal or woody structures for support against gravity in air; aquatic organisms rely on water buoyancy for physical support.',
        markingGuide: '1 mark for contrasting air/gravity with water buoyancy/support.',
        targetObjectiveDomain: 'cognitive'
      },
      {
        id: 3,
        questionText: 'Classify each item as either BIOTIC or ABIOTIC in a Belize forest ecosystem:\na) Mahogany tree:\nb) Limestone soil:\nc) Black howler monkey:\nd) Annual rainfall:',
        questionType: 'fill_blank',
        points: 2,
        expectedAnswer: 'a) Biotic, b) Abiotic, c) Biotic, d) Abiotic',
        markingGuide: '0.5 marks each: a=Biotic, b=Abiotic, c=Biotic, d=Abiotic. Total 2 marks.',
        targetObjectiveDomain: 'psychomotor'
      },
      {
        id: 4,
        questionText: 'Distinguish between Belize freshwater and marine aquatic ecosystems: Name ONE producer in the Macal River (freshwater, salinity <0.5 ppt) and ONE producer in the Belize Barrier Reef (marine, salinity ~35 ppt).',
        questionType: 'short_answer',
        points: 1,
        expectedAnswer: 'Freshwater producer: Riverine algae / Water hyacinth / River weeds; Marine producer: Turtle grass (Thalassia testudinum) / Zooxanthellae algae in coral / Marine macroalgae.',
        markingGuide: '1 mark: 0.5 for a valid Belizean freshwater producer, 0.5 for a valid marine autotroph.',
        targetObjectiveDomain: 'cognitive'
      },
      {
        id: 5,
        questionText: 'Explain why sunlight penetration decreases with depth in an aquatic ecosystem, and describe how this limits where aquatic producers can grow.',
        questionType: 'short_answer',
        points: 1,
        expectedAnswer: 'Water absorbs and scatters sunlight as depth increases. Because green plants and algae require sunlight for photosynthesis, producers can only thrive in the upper, sunlit photic zone.',
        markingGuide: '1 mark for linking light absorption/scattering with depth to photosynthetic limitation in the photic zone.',
        targetObjectiveDomain: 'cognitive'
      },
      {
        id: 6,
        questionText: 'Compare how terrestrial animals obtain oxygen with how aquatic animals obtain oxygen.',
        questionType: 'short_answer',
        points: 1,
        expectedAnswer: 'Terrestrial animals inhale atmospheric oxygen using lungs or spiracles in air; aquatic animals absorb dissolved oxygen from water using gills or cell membranes.',
        markingGuide: '1 mark for contrasting atmospheric air inhalation via lungs with dissolved oxygen extraction via gills.',
        targetObjectiveDomain: 'cognitive'
      },
      {
        id: 7,
        questionText: 'A developer clears upland broadleaf forest near the Macal River. Explain how this terrestrial habitat change directly harms an aquatic ecosystem downstream on the reef.',
        questionType: 'short_answer',
        points: 1,
        expectedAnswer: 'Clearing trees removes root systems that anchor soil, causing heavy rain to wash silt and sediment into the Macal River, which flows into the sea, clouding coastal water, blocking sunlight from turtle grass, and smothering coral polyps on the reef.',
        markingGuide: '1 mark for connecting tree removal to soil erosion, sedimentation, and downstream coral reef degradation.',
        targetObjectiveDomain: 'affective'
      },
      {
        id: 8,
        questionText: 'Construct a Claim + Evidence + Reasoning (CER) explanation answering: "Why can a Black Howler Monkey not survive in the Belize Barrier Reef ecosystem?"',
        questionType: 'cer_explanation',
        points: 2,
        expectedAnswer: 'Claim: A black howler monkey cannot survive in the Belize Barrier Reef ecosystem.\nEvidence: Howler monkeys have lungs requiring atmospheric air, prehensile limbs adapted to grasp solid forest branches, and lack gills, fins, or salt-excreting glands.\nReasoning: Biotic organisms possess physical adaptations suited strictly to the abiotic conditions (medium, salinity, gas state) of their native habitat; in seawater, the monkey drowns and dehydrates from high salinity.',
        markingGuide: '2 marks: 1 mark for valid claim + cited evidence; 1 mark for sound ecological reasoning connecting adaptations to abiotic factors.',
        targetObjectiveDomain: 'cognitive'
      }
    ],
    exitTicketQuestions: [
      {
        id: 1,
        questionText: 'Which of the following correctly pairs an ABIOTIC component with a BIOTIC component in a Belizean ecosystem?',
        questionType: 'multiple_choice',
        points: 1,
        options: [
          'A) Sunlight penetration (abiotic) and Black Howler Monkey (biotic)',
          'B) Jaguar (abiotic) and Limestone bedrock (biotic)',
          'C) Dissolved oxygen (abiotic) and River water (biotic)',
          'D) Elkhorn coral (abiotic) and Turtle grass (biotic)'
        ],
        expectedAnswer: 'A) Sunlight penetration (abiotic) and Black Howler Monkey (biotic)',
        markingGuide: '1 mark for selecting A. Sunlight is a non-living physical factor (abiotic); the howler monkey is a living organism (biotic).',
        targetObjectiveDomain: 'cognitive'
      },
      {
        id: 2,
        questionText: 'Water is approximately 800 times denser than air. Explain how this abiotic difference in density and upward buoyancy allows underwater plants (such as turtle grass) to stay upright without the thick, rigid woody trunks required by terrestrial trees.',
        questionType: 'short_answer',
        points: 1,
        expectedAnswer: 'Because water is ~800 times denser than air, it exerts an upward buoyant force that physically supports the tissues of aquatic plants against gravity, whereas terrestrial plants lack water buoyancy and must produce rigid cellulose and lignin in woody trunks to stay upright in thin air.',
        markingGuide: '1 mark for contrasting the buoyant upward support of dense water with the lack of buoyancy in air requiring rigid woody structural support.',
        targetObjectiveDomain: 'cognitive'
      },
      {
        id: 3,
        questionText: 'Contrast the salinity of the Macal River with the Belize Barrier Reef, and explain why the freshwater Central American River Turtle (Hickatee) cannot survive in the marine barrier reef.',
        questionType: 'short_answer',
        points: 1,
        expectedAnswer: 'The Macal River has freshwater salinity of <0.5 ppt, whereas the Belize Barrier Reef has marine salinity of ~35 ppt. The Hickatee lacks marine salt-excreting glands, so the high abiotic salinity causes rapid osmotic water loss and fatal dehydration.',
        markingGuide: '1 mark for identifying the salinity difference (<0.5 ppt vs ~35 ppt) and explaining osmotic dehydration / lack of salt glands.',
        targetObjectiveDomain: 'cognitive'
      },
      {
        id: 4,
        questionText: 'Explain how sunlight attenuation (diminishing light with depth) acts as an abiotic limiting factor that restricts where photosynthetic producers can survive in aquatic ecosystems.',
        questionType: 'short_answer',
        points: 1,
        expectedAnswer: 'Water scatters and absorbs sunlight as depth increases, limiting photosynthesis exclusively to the shallow sunlit photic zone; producers cannot survive in deeper waters where sunlight is insufficient.',
        markingGuide: '1 mark for connecting light absorption/scattering with depth to the restriction of producers to the sunlit photic zone.',
        targetObjectiveDomain: 'cognitive'
      },
      {
        id: 5,
        questionText: 'Formulate ONE evidence-supported conservation recommendation explaining how sustainable farming practices or riparian buffer strips along the Macal River protect downstream coral polyps and turtle grass on the Belize Barrier Reef.',
        questionType: 'short_answer',
        points: 1,
        expectedAnswer: 'Maintaining forested riparian vegetative buffer strips along the banks of the Macal River anchors soil with root systems and filters agricultural fertilizer runoff. This prevents heavy rainfall from washing silt into the river and coastal waters, preventing sediment plumes from clouding seawater, blocking photosynthetic sunlight from turtle grass, and smothering delicate coral polyps on the barrier reef.',
        markingGuide: '1 mark for proposing a specific upstream intervention (riparian buffer / contour plowing) with evidence linking soil stabilization to the prevention of sediment plumes smothering coral polyps downstream.',
        targetObjectiveDomain: 'affective'
      }
    ],
    studentInvestigationMaterials: {
      profileDossiers: `========================================================================
BELIZE ECOSYSTEM PROFILE DOSSIERS (STUDENT INVESTIGATION RESOURCE)
Standard 6 Science & Technology — SC 3.15 Comparative Investigation
========================================================================

DOSSIER 1: MOUNTAIN PINE RIDGE (TERRESTRIAL ECOSYSTEM, CAYO DISTRICT)
- Physical Medium: Atmospheric Air (low density, ~1.2 kg/m³).
- Gravity & Structural Support: Gravity pulls unsupported objects downward; organisms require internal skeletal support (bones, cartilage) or rigid plant cell walls (cellulose and lignin) to remain upright.
- Salinity: 0 parts per thousand (ppt) in soil moisture and rainfall.
- Gas Exchange: Atmospheric gas (78% Nitrogen, 21% Oxygen, 0.04% CO2); terrestrial animals inhale air through lungs or spiracles; plants exchange gases through leaf stomata open to air.
- Sunlight & Moisture: High direct solar irradiance; limiting factor is moisture availability and thin granitic soil.
- Primary Producers: Honduran Pine (Pinus caribaea), Mahogany (Swietenia macrophylla), Epiphytic Orchids.
- Consumers: Jaguar (apex carnivore), Baird's Tapir (herbivore), Black Howler Monkey (frugivore/folivore).
- Decomposers: Forest floor shelf bracket fungi, termites, soil bacteria.

DOSSIER 2: MACAL RIVER BASIN (FRESHWATER AQUATIC ECOSYSTEM, CAYO DISTRICT)
- Physical Medium: Freshwater liquid (high density, ~1,000 kg/m³, 800x denser than air).
- Upward Buoyancy: Exerts significant upward buoyant force supporting body weight and flexible plant tissues against gravity.
- Salinity: <0.5 parts per thousand (ppt); fresh mineral runoff from Maya Mountains.
- Gas Exchange: Dissolved Oxygen (DO) absorbed from flowing currents through gills or cellular diffusion; turtles and aquatic mammals surface to breathe atmospheric air with lungs.
- Sunlight & Water Clarity: Sunlight penetrates river surface but attenuates rapidly if water is clouded by upstream mud or silt runoff.
- Primary Producers: Riverine filamentous algae, Water Hyacinth (Eichhornia), submerged freshwater river weeds.
- Consumers: Central American River Turtle / Hickatee (herbivore), Mountain Mullet (omnivore), Freshwater Apple Snail (detritivore).
- Decomposers: Aquatic bacteria, detrital water fungi.

DOSSIER 3: BELIZE BARRIER REEF (MARINE AQUATIC ECOSYSTEM, CARIBBEAN SEA)
- Physical Medium: Marine Saltwater (high density, ~1,025 kg/m³).
- Upward Buoyancy: Strong upward buoyant force allows flexible seagrasses and giant invertebrates to thrive without rigid wooden trunks.
- Salinity: ~35 parts per thousand (ppt); high dissolved sodium and chloride ions requiring specialized osmoregulatory organs.
- Gas Exchange: Dissolved oxygen extracted from seawater via marine gills (fish, conch) or surface respiration via blowholes/lungs (manatees, sea turtles).
- Sunlight & Photic Zone: Water scatters and absorbs light; photosynthesis is restricted to the shallow sunlit photic zone (<20 meters depth).
- Primary Producers: Turtle Grass (Thalassia testudinum), symbiotic Zooxanthellae microalgae in coral polyps, marine macroalgae.
- Consumers: Elkhorn Coral (filter-feeding keystone polyp), Queen Conch (herbivore), Nassau Grouper (apex reef carnivore).
- Decomposers: Marine benthic microbes, sea cucumbers, marine polychaete worms.`,

      organismCards: `========================================================================
12 BELIZEAN ORGANISM SPECIMEN CARDS & CLASSIFICATION GUIDE
Cut or examine each card. Identify: 1) Ecosystem, 2) Trophic Role, 3) Key Adaptation to Abiotic Environment.
========================================================================

CARD 1: JAGUAR (Panthera onca)
- Habitat: Mountain Pine Ridge Broadleaf Forest (Terrestrial).
- Trophic Role: Apex Carnivore / Secondary & Tertiary Consumer.
- Abiotic Adaptation: Dense muscular skeletal system supports heavy body against gravity in thin air; lungs breathe atmospheric oxygen; camouflaged rosette coat blends with dappled sunlight on the forest floor.

CARD 2: BAIRD'S TAPIR (Tapirus bairdii)
- Habitat: Mountain Pine Ridge & Riparian Corridors (Terrestrial).
- Trophic Role: Herbivore / Primary Consumer (Belize National Animal).
- Abiotic Adaptation: Robust bone structure counteracting gravitational pull; prehensile proboscis (snout) browses forest understory foliage; skin adapted to prevent dehydration in air.

CARD 3: HONDURAN MAHOGANY (Swietenia macrophylla)
- Habitat: Broadleaf Forest Canopy (Terrestrial - Belize National Tree).
- Trophic Role: Autotrophic Producer.
- Abiotic Adaptation: Thick woody trunk packed with cellulose and lignin provides rigid mechanical support against gravity in thin air; expansive root network anchors in limestone soil; waxy leaf cuticles and stomata regulate water loss.

CARD 4: BLACK HOWLER MONKEY / BABOON (Alouatta pigra)
- Habitat: Forest Canopy (Terrestrial).
- Trophic Role: Arboreal Herbivore / Consumer.
- Abiotic Adaptation: Prehensile tail acts as a fifth limb for grasping solid wooden tree limbs; lungs process atmospheric oxygen; reliant on high canopy branches supported by tree lignin.

CARD 5: HICKATEE TURTLE (Dermatemys mawii)
- Habitat: Macal River Basin (Freshwater Aquatic).
- Trophic Role: Herbivorous Primary Consumer (Critically Endangered).
- Abiotic Adaptation: Webbed hind feet for swimming; osmoregulation specialized strictly for freshwater (<0.5 ppt); lacks marine salt-excreting glands (dies of dehydration if placed in 35 ppt seawater); surfaces periodically to breathe air with lungs and extracts oxygen through vascularized lining of pharynx.

CARD 6: MOUNTAIN MULLET / DANTO (Agonostomus monticola)
- Habitat: Macal River Rapids (Freshwater Aquatic).
- Trophic Role: Freshwater Omnivore / Consumer.
- Abiotic Adaptation: Hydrodynamic torpedo shape reduces water friction in fast-flowing river currents; filamentous gills extract dissolved oxygen directly from freshwater.

CARD 7: RIVERINE ALGAE & WATER HYACINTH
- Habitat: Macal River Shallows (Freshwater Aquatic).
- Trophic Role: Freshwater Autotrophic Producer.
- Abiotic Adaptation: Flexible stems and floating petioles supported by buoyant water rather than thick rigid wood; absorbs dissolved carbon and mineral nutrients directly across submerged cellular surfaces.

CARD 8: FRESHWATER APPLE SNAIL (Pomacea flagellata)
- Habitat: Macal Riverbed & Pools (Freshwater Aquatic).
- Trophic Role: Detritivore / Scavenger & Primary Consumer.
- Abiotic Adaptation: Muscular foot anchors to riverbed rocks against currents; dual respiration system with both a gill (ctenidium) for water breathing and a siphon lung for surface air during low dissolved oxygen.

CARD 9: ELKHORN CORAL (Acropora palmata)
- Habitat: Belize Barrier Reef Crest (Marine Aquatic).
- Trophic Role: Colonial Animal / Keystone Structural Builder.
- Abiotic Adaptation: Builds rigid calcium carbonate (limestone) skeleton in marine seawater (~35 ppt); harbors photosynthetic zooxanthellae algae requiring clear, shallow sunlit waters (<10m depth); smothered and killed if upland river mud coats polyps.

CARD 10: NASSAU GROUPER (Epinephelus striatus)
- Habitat: Barrier Reef Drop-offs & Coral Heads (Marine Aquatic).
- Trophic Role: Marine Apex Carnivore / Reef Predator.
- Abiotic Adaptation: Specialized gills and kidneys actively excrete excess salt ions to maintain internal homeostasis in 35 ppt seawater; swim bladder provides neutral buoyancy at varying reef depths.

CARD 11: QUEEN CONCH (Aliger gigas)
- Habitat: Turtle Grass Sand Flats (Marine Aquatic).
- Trophic Role: Marine Herbivorous Gastropod / Consumer.
- Abiotic Adaptation: Thick calcium carbonate shell protects against predators while water buoyancy supports shell mass; osmoregulation adapted strictly to 35 ppt marine salinity; grazes on epiphytic algae.

CARD 12: TURTLE GRASS (Thalassia testudinum)
- Habitat: Barrier Reef Back-Reef Lagoon (Marine Aquatic).
- Trophic Role: Marine Angiosperm / Autotrophic Producer.
- Abiotic Adaptation: Flexible ribbon blades stay suspended upright by buoyant seawater (~800x denser than air) without needing heavy woody lignin; extensive rhizomes anchor in sand; requires shallow, sunlit photic waters to carry out photosynthesis.`,

      comparativeMatrix: `========================================================================
3-COLUMN COMPARATIVE ECOSYSTEM INVESTIGATION MATRIX
Complete this matrix in your science notebook using the dossiers and 12 specimen cards.
========================================================================

| Physical Abiotic / Biotic Parameter | Terrestrial (Mountain Pine Ridge) | Freshwater Aquatic (Macal River) | Marine Aquatic (Belize Barrier Reef) |
|---|---|---|---|
| 1. Physical Supporting Medium | Air (~1.2 kg/m³) | Freshwater (~1,000 kg/m³) | Seawater (~1,025 kg/m³) |
| 2. Upward Buoyant Force vs Gravity | Minimal buoyancy; Gravity requires rigid wood/skeletons | High upward buoyancy (~800x air); supports flexible plants | Strongest upward buoyancy; supports heavy shells/limp seagrass |
| 3. Salinity Concentration (ppt) | 0 ppt (Fresh rainwater/soil) | <0.5 ppt (Freshwater river runoff) | ~35 ppt (High dissolved marine salts) |
| 4. Gas Exchange Medium & Organ | Atmospheric Air (Lungs, Spiracles, Leaf Stomata) | Dissolved O2 in Water (Gills) + Surfacing Lungs (Hickatee) | Dissolved O2 in Seawater (Gills) + Surfacing Lungs (Turtles) |
| 5. Sunlight Penetration Constraints | Direct solar exposure; canopy shade limits understory | Penetrates shallow water; blocked by sediment/silt | Attenuates with depth; restricted to photic zone (<20m) |
| 6. Key Autotrophic Producers | Honduran Pine, Mahogany, Orchids | Riverine Algae, Water Hyacinth | Turtle Grass, Coral Zooxanthellae |
| 7. Key Consumers & Specimen Cards | Jaguar, Baird's Tapir, Howler Monkey | Hickatee Turtle, Mountain Mullet, Apple Snail | Nassau Grouper, Queen Conch, Elkhorn Coral |
| 8. Conservation / Watershed Link | Upland soil erosion & deforestation wash silt into rivers | Carries agricultural fertilizer & sediment downstream | Sediment plumes cloud water, block light, & smother coral |`,

      comparativeMatrixAnswerKey: `AUTHORITATIVE MATRIX ANSWER KEY:
All 8 parameters verified against empirical ecological data. Organisms correctly sorted into 4 terrestrial (Cards 1-4), 4 freshwater (Cards 5-8), and 4 marine (Cards 9-12). Abiotic constraints (medium density, salinity, light penetration) correctly paired with biotic physiological adaptations.`
    },
    differentiation: {
      struggling: {
        support: 'Provide a pre-printed sorting organizer with two large columns labeled "Terrestrial (Land)" and "Aquatic (Water)", color-coded cards (green for biotic, blue for abiotic), and sentence frames: "In a terrestrial ecosystem, organisms live in ___, while in an aquatic ecosystem, organisms live in ___."',
        scaffold: 'Pair with an on-level lab partner during matrix completion. Provide visual icon cards for each Belizean organism (jaguar icon, conch icon) and abiotic factor (sun icon, thermometer, water droplet icon).',
        visualAid: 'Side-by-side color infographic of Mountain Pine Ridge forest next to the Belize Barrier Reef with abiotic labels clearly highlighted in blue and biotic species in green.'
      },
      onLevel: {
        task: 'Independently complete the 8-question comparative investigation worksheet, classify all 12 sorting components into the Venn diagram, and write a full CER explanation paragraph citing both biotic roles and abiotic limits.',
        independence: 'Works collaboratively in pairs for 15 minutes during data collation, then completes worksheet and exit ticket independently with teacher monitoring.'
      },
      advanced: {
        extension: 'Investigate the transitional "ecotone" between terrestrial and aquatic systems: analyze how Belize mangrove wetlands act as a physical buffer and biological nursery bridging land and sea. Formulate an environmental policy recommendation balancing aquaculture with reef conservation.',
        deeperInquiry: 'Predict the trophic cascade on the reef if terrestrial agricultural fertilizer runoff increases coastal nitrogen levels by 40%.'
      }
    }
  },

  // =========================================================================
  // 2. PLANT BIOLOGY & VASCULAR TRANSPORT (Standard 2 & 4)
  // =========================================================================
  plant_biology_transport: {
    category: 'plant_biology_transport',
    standardLevel: 'Standard 4',
    topicTitle: 'Plant Biology: Internal Vascular Transport and Organ Systems',
    focalConcept: 'Investigating Water Uptake via Roots and Internal Transport through Stem Xylem to Green Leaves',
    phenomenon: 'A freshly cut white carnation or celery stalk placed in a cup of bright red water turns noticeably pinkish-red in its upper leaf veins after two hours, even though no red liquid was poured on top of the leaves.',
    inquiryQuestion: 'How does water absorbed at the bottom of a plant travel upward against gravity to reach the leaves?',
    priorKnowledgeHook: 'Quick Sketch: Draw a plant in your notebook. Draw one blue arrow showing where the plant drinks water, and one green arrow showing where leaves capture sunlight.',
    prerequisiteKnowledge: 'In Standards 1 to 3, students identified observable external plant organs (roots, stems, leaves, flowers) and recognized that plants need water and sunlight to grow. Students have not yet investigated internal vascular tissue structures (xylem and phloem) or the physical mechanism of transpiration pull.',
    diagnosticProbe: 'Plant Drinking Probe: Does a plant "eat" soil through its roots? If you grow a bean seedling in wet cotton wool without any soil, will it still sprout green leaves? Why?',
    misconceptions: [
      {
        misconception: 'Plants absorb solid food from the soil through their roots like drinking through a straw.',
        evidenceToEncounter: 'Growing bean seeds in wet cotton wool: the seedlings sprout healthy green stems and leaves without a single grain of dirt.',
        scientificReality: 'Roots absorb water and dissolved mineral ions only; green leaves manufacture organic food (glucose) internally via photosynthesis using light, carbon dioxide, and water.',
        teacherCorrectionPrompt: '"Look at our bean seedlings growing in wet cotton: what did we add? Only water! Where did the green leaves get their food? They made it themselves using sunlight!"'
      },
      {
        misconception: 'Water stays pooled in the roots and does not move upward through the stem.',
        evidenceToEncounter: 'Observing cross-sections of celery stalks placed in dyed water: distinct colored circular dots (xylem tubes) are visible running all the way through the stem to the leaf tips.',
        scientificReality: 'Specialized vascular tissues called xylem act as continuous microscopic capillary tubes that conduct water upward from roots through stems to leaves via capillary action and transpiration pull.',
        teacherCorrectionPrompt: '"Look at the red circles inside the cut stem: how did that red color get from the bottom cup to the very top leaf?"'
      }
    ],
    predictionPrompt: 'I predict the colored water will (travel / not travel) up through the stem into the leaves because __________________________.',
    investigation: {
      title: 'Vascular Stem Transport Investigation Using Celery Stalks and Hand Lenses',
      investigationType: 'controlled_experiment',
      whatToInvestigate: 'How vascular tissues inside plant stems conduct water upward from the base to leaf margins against gravity.',
      whatToObserve: 'Upward movement of colored water over 30 minutes, appearance of colored vascular bundles (xylem) in stem cross-sections under hand lenses.',
      whatToRecord: 'Measured height of dye movement (cm) over 10-minute intervals and labeled cross-sectional diagrams showing vascular tube bundles.',
      evidenceProduced: 'Direct observation of dyed water climbing 6.5 cm up stem tubes within 25 minutes, with distinct red vascular bundles visible in transverse cross-sections.',
      questionAnsweredByEvidence: 'Evidence proves plant stems contain specialized internal transport vessels (xylem) that move water continuously upward to the foliage.',
      materials: [
        'Fresh celery stalks with leaves or croton cuttings',
        'Clear plastic cups with water and red/blue food coloring',
        'Hand lenses / magnifying glasses',
        'Rulers with metric millimeter/centimeter calibrations',
        'Safety plastic craft knives for teacher-guided cross-sections',
        'Science notebooks'
      ],
      isStudentDriven: true
    },
    explanationCER: {
      claim: 'Plants absorb water at their base and transport it upward through specialized vascular vessels called xylem inside stems to reach the leaves.',
      evidence: 'In our investigation, colored liquid climbed 6.5 cm up the celery stalk in 25 minutes, appearing in isolated circular vascular bundles in stem cross-sections and tinting leaf veins.',
      reasoning: 'Plants require water in their leaves for photosynthesis and cell turgor. The stem functions as a hydraulic conduit: xylem vessels use capillary action and transpiration pull (evaporation from leaves) to draw water upward against gravity.',
      formalVocabularyMoment: 'Introduce "Xylem", "Phloem", and "Transpiration" AFTER students observe the colored dots inside the sliced stem.',
      formalVocabulary: [
        { term: 'Xylem', definition: 'Specialized vascular tissue that transports water and dissolved mineral nutrients upward from roots to stems and leaves.' },
        { term: 'Phloem', definition: 'Vascular tissue that transports manufactured sugars and nutrients downward and outward from leaves to all growing parts of the plant.' },
        { term: 'Transpiration', definition: 'The loss of water vapor from plant leaves through microscopic pores (stomata), creating a suction pull that draws water up the stem.' },
        { term: 'Vascular Bundle', definition: 'A strand of conducting vessels in the stem containing xylem and phloem.' }
      ]
    },
    belizeanContext: {
      ecosystemOrLocation: 'Citrus orchards in the Stann Creek Valley and milpa cornfields in the Cayo District.',
      communityApplication: 'Understanding how irrigation at the root zone revives wilting orange trees during Belize\'s hot dry season (March–May).'
    },
    learningObjectives: {
      condition: 'Given celery stalks placed in dyed water, hand lenses, metric rulers, and stem cross-section diagrams:',
      cognitive: 'Students will trace the pathway of water through plant organs and explain the function of xylem vessels with at least 80% accuracy.',
      psychomotor: 'Students will measure dye migration height, observe stem cross-sections under magnification, and sketch labeled diagrams of vascular bundles.',
      affective: 'Students will handle scientific specimens carefully, record empirical measurements objectively, and appreciate plant adaptations sustaining Belizean agriculture.',
      successCriteria: [
        'I can identify the main organs of a plant (roots, stem, leaves, flowers).',
        'I can trace how water moves from roots through stem xylem up to the leaves.',
        'I can explain why leaves need water to carry out photosynthesis.'
      ]
    },
    worksheetQuestions: [
      {
        id: 1,
        questionText: 'Which plant tissue is specifically responsible for conducting water and minerals UPWARD from roots to leaves?',
        questionType: 'multiple_choice',
        points: 1,
        options: ['A) Phloem', 'B) Xylem', 'C) Bark', 'D) Flower petal'],
        expectedAnswer: 'B) Xylem',
        markingGuide: '1 mark for selecting B (Xylem conducts water upward).'
      },
      {
        id: 2,
        questionText: 'State the primary function of plant roots besides anchoring the plant into the ground.',
        questionType: 'short_answer',
        points: 1,
        expectedAnswer: 'To absorb water and dissolved mineral nutrients from the soil.',
        markingGuide: '1 mark for stating water and mineral absorption.'
      },
      {
        id: 3,
        questionText: 'In our investigation, what did the colored dots inside the sliced celery stem represent?',
        questionType: 'short_answer',
        points: 1,
        expectedAnswer: 'Vascular bundles containing xylem tubes that transported the colored water upward.',
        markingGuide: '1 mark for identifying vascular bundles / xylem tubes.'
      },
      {
        id: 4,
        questionText: 'Fill in the blanks to trace the pathway of water through a citrus tree in Stann Creek:\nSoil moisture → __________ → Stem __________ → Leaf veins → Evaporates via __________.',
        questionType: 'fill_blank',
        points: 2,
        expectedAnswer: 'Roots, Xylem, Transpiration (or Stomata)',
        markingGuide: '0.66 marks each: 1=Roots, 2=Xylem, 3=Transpiration/Stomata. Total 2 marks.'
      },
      {
        id: 5,
        questionText: 'Why do leaves wilt and droop when a potted plant in Belize is left without water for four days in the hot sun?',
        questionType: 'short_answer',
        points: 1,
        expectedAnswer: 'Water continues to evaporate from leaves (transpiration), but roots cannot absorb water from dry soil, causing plant cells to lose water pressure (turgor) and wilt.',
        markingGuide: '1 mark for connecting lack of root water intake with continued transpiration loss leading to loss of turgor/wilting.'
      },
      {
        id: 6,
        questionText: 'Distinguish between the role of xylem and the role of phloem in a plant.',
        questionType: 'short_answer',
        points: 1,
        expectedAnswer: 'Xylem transports water and minerals upward from roots to leaves, whereas phloem transports manufactured food (sugars) from leaves to the rest of the plant.',
        markingGuide: '1 mark for contrasting upward water (xylem) with food/sugar distribution (phloem).'
      },
      {
        id: 7,
        questionText: 'A farmer in Belize notices that stripping a ring of bark completely off a tree trunk kills the tree over time. Explain why.',
        questionType: 'short_answer',
        points: 1,
        expectedAnswer: 'The inner bark contains phloem vessels. Stripping the bark severs phloem transport, preventing sugars made in leaves from reaching the roots, causing the roots to starve and die.',
        markingGuide: '1 mark for explaining that phloem is in the bark and severing it starves roots of sugar.'
      },
      {
        id: 8,
        questionText: 'Construct a CER explanation: "How do vascular tissues help tall mahogany trees in Belize survive?"',
        questionType: 'cer_explanation',
        points: 2,
        expectedAnswer: 'Claim: Vascular tissues enable tall mahogany trees to transport water to distant upper leaves and distribute food throughout the plant.\nEvidence: In our test, xylem tubes pulled water over 6 cm upward rapidly, and tall trees have continuous vascular conduits from deep roots to high canopies.\nReasoning: Without vascular bundles, cells more than a few millimeters from water would dehydrate and die because diffusion alone is far too slow.',
        markingGuide: '2 marks: 1 for claim + evidence; 1 for reasoning on internal transport overcoming diffusion limits.'
      }
    ],
    exitTicketQuestions: [
      {
        id: 1,
        questionText: 'What are the two main transport tissues inside a plant stem, and what does each carry?',
        questionType: 'short_answer',
        points: 2,
        expectedAnswer: '1) Xylem carries water and minerals. 2) Phloem carries food (glucose/sugars).',
        markingGuide: '1 mark for Xylem + water/minerals; 1 mark for Phloem + food/sugars.'
      },
      {
        id: 2,
        questionText: 'What is the name of the process where water evaporates from tiny openings on leaves, pulling water upward through the stem?\nA) Respiration\nB) Transpiration\nC) Germination\nD) Digestion',
        questionType: 'multiple_choice',
        points: 1,
        options: ['A', 'B', 'C', 'D'],
        expectedAnswer: 'B) Transpiration',
        markingGuide: '1 mark for selecting B.'
      },
      {
        id: 3,
        questionText: 'True or False: Plant roots suck up solid soil particles to make food. Explain your answer.',
        questionType: 'short_answer',
        points: 2,
        expectedAnswer: 'False. Roots absorb water and dissolved minerals; the plant manufactures its actual food (glucose) inside green leaves using sunlight in photosynthesis.',
        markingGuide: '1 mark for False; 1 mark for stating food is made in leaves, not eaten from soil.'
      }
    ],
    differentiation: {
      struggling: {
        support: 'Provide a pre-drawn, large diagram of a plant stem cross-section with arrows. Have students color xylem tubes in blue and phloem in orange.',
        scaffold: 'Use a clear plastic drinking straw demonstration: show how liquid rises inside a narrow straw (capillary action) to model xylem vessels.',
        visualAid: 'Cut celery stalks showing bright red circular dots alongside an illustrated wall anchor chart.'
      },
      onLevel: {
        task: 'Measure dye travel rate across 10-minute intervals, calculate average climb speed (cm/min), and complete the 8-question investigation worksheet independently.',
        independence: 'Conducts microscope or hand lens observation in pairs and writes individual CER paragraphs.'
      },
      advanced: {
        extension: 'Design an experiment to test whether placing a plastic bag over the celery leaves speeds up or slows down water uptake (investigating relative humidity and transpiration rate).',
        deeperInquiry: 'Calculate the volume of water transpired by an acre of Belizean citrus trees during a dry April week.'
      }
    }
  },

  // =========================================================================
  // 3. LIVING VS NON-LIVING THINGS (Standard 1)
  // =========================================================================
  living_nonliving_things: {
    category: 'living_nonliving_things',
    standardLevel: 'Standard 1',
    topicTitle: 'Life Science: Characteristics of Living and Non-Living Things',
    focalConcept: 'Identifying Observable Characteristics of Living Things (Growth, Feeding, Movement, Reproduction) vs Non-Living Objects',
    phenomenon: 'A toy plastic lizard and a real gecko both have four legs, a tail, and eyes. But when left in a box with crickets for a week, the toy lizard never moves, eats, grows, or lays eggs, while the live gecko hunts crickets, grows larger, and poops.',
    inquiryQuestion: 'What can living things do that non-living things can never do on their own?',
    priorKnowledgeHook: 'Schoolyard Walk: Point to one thing on our playground that is alive and one thing that was never alive. How do you know?',
    prerequisiteKnowledge: 'In Infant 1 and 2, students observed common animals and plants in their immediate school and home environments. Students can name basic animals and familiar objects, but have not yet systematically applied biological criteria (growth, autonomous movement, nutrition, reproduction) to distinguish living organisms from non-living matter.',
    diagnosticProbe: 'Toy Car Probe: A battery-powered toy car can move across the floor and make sounds. Does that mean the toy car is alive? Why or why not?',
    misconceptions: [
      {
        misconception: 'Anything that moves or makes noise (like a car, fan, or clock) is alive.',
        evidenceToEncounter: 'Testing a wind-up toy vs a pet hamster/caterpillar: the toy only moves when an external person winds it up or provides batteries; it cannot feed itself, breathe, heal, or grow.',
        scientificReality: 'Non-living machines move due to external energy sources; living organisms move autonomously, need food/water, grow, reproduce, and respond to stimuli.',
        teacherCorrectionPrompt: '"Does the toy car grow bigger next year? Does it need food or water? No! So moving alone does not make something alive."'
      },
      {
        misconception: 'Trees and plants are non-living because they do not walk around or talk.',
        evidenceToEncounter: 'Time-lapse observation of bean seeds sprouting: shoots turn toward light, roots grow downward into moist soil, and leaves grow bigger every day.',
        scientificReality: 'Plants are living organisms: they grow, make food, reproduce via seeds, and respond to light and gravity, even if their movement is slow.',
        teacherCorrectionPrompt: '"Look at our seedling on the windowsill: it was a tiny seed last week and now it has green leaves! Only living things can grow."'
      }
    ],
    predictionPrompt: 'I predict that if we check the items on our tray, the living items will (grow / not grow) and (need food / not need food) because __________________________.',
    investigation: {
      title: 'Schoolyard Specimen Sorting and Living Characteristics Test',
      investigationType: 'specimen_observation',
      whatToInvestigate: 'Testing observable items (potted seedling, earthworm/ant, river pebble, plastic button, dry leaf) against the core life criteria (grows, needs water/food, moves, reproduces).',
      whatToObserve: 'Physical reactions, growth over time, structure, and response to touch or water droplets.',
      whatToRecord: 'A simple smiley-face checklist table: Item Name | Does it grow? | Does it need food/water? | Is it Living or Non-Living?',
      evidenceProduced: 'Completed checklist showing that biological specimens meet all life criteria while inert objects meet zero life criteria.',
      questionAnsweredByEvidence: 'Evidence proves living things share distinct biological needs and processes that non-living objects lack.',
      materials: [
        'Living specimens (potted bean plant, live earthworm in moist soil jar)',
        'Non-living objects (river rock, plastic ruler, metal coin, seashell)',
        'Hand magnifying lenses',
        'Living vs Non-Living Sorting Mats with pictures',
        'Science notebooks and crayons'
      ],
      isStudentDriven: true
    },
    explanationCER: {
      claim: 'Living things grow, need food and water, move, and reproduce, while non-living things do not.',
      evidence: 'In our test, the bean plant grew taller and drank water, while the river rock stayed exactly the same size and did not absorb food or water.',
      reasoning: 'Living organisms are made of cells that require continuous energy and water to maintain life processes; non-living objects are inert matter without biological functions.',
      formalVocabularyMoment: 'Introduce "Living", "Non-Living", and "Growth" AFTER students sort their specimens.',
      formalVocabulary: [
        { term: 'Living Thing', definition: 'An organism that requires food, water, and air, can grow, reproduce, and respond to its environment.' },
        { term: 'Non-Living Thing', definition: 'An object or material that does not have life, does not grow, does not need food, and cannot reproduce.' },
        { term: 'Organism', definition: 'Any individual living plant, animal, or single-celled life form.' }
      ]
    },
    belizeanContext: {
      ecosystemOrLocation: 'School garden, riverbank in San Ignacio, or backyard in Orange Walk.',
      communityApplication: 'Caring for living animals (poultry, pets) and plants (vegetable gardens) in Belizean homes by providing food, water, and shelter.'
    },
    learningObjectives: {
      condition: 'Given a collection of real schoolyard specimens, sorting mats, and an observable checklist:',
      cognitive: 'Students will identify, classify, and explain the observable characteristics of living and non-living things with at least 80% accuracy.',
      psychomotor: 'Students will observe specimens using hand lenses, sort objects into living and non-living trays, and mark checklist entries.',
      affective: 'Students will handle small living creatures gently and respectfully, and cooperate enthusiastically with group members.',
      successCriteria: [
        'I can name four things all living organisms can do (eat, drink, grow, reproduce).',
        'I can sort objects into "Living" and "Non-Living" groups.',
        'I can explain why a plant is alive even though it cannot walk.'
      ]
    },
    worksheetQuestions: [
      {
        id: 1,
        questionText: 'Which of the following is a LIVING thing found in Belize?',
        questionType: 'multiple_choice',
        points: 1,
        options: ['A) Limestone rock', 'B) Toucan bird', 'C) Wooden desk', 'D) Rain puddle'],
        expectedAnswer: 'B) Toucan bird',
        markingGuide: '1 mark for selecting B.'
      },
      {
        id: 2,
        questionText: 'List TWO things that all living things need to stay alive.',
        questionType: 'short_answer',
        points: 1,
        expectedAnswer: 'Food (nutrients) and Water (also accept air/sunlight/shelter).',
        markingGuide: '1 mark for any two valid biological needs.'
      },
      {
        id: 3,
        questionText: 'Classify each item as Living (L) or Non-Living (NL):\na) Bean sprout:\nb) Plastic ruler:\nc) Grasshopper:\nd) Glass bottle:',
        questionType: 'fill_blank',
        points: 2,
        expectedAnswer: 'a) Living, b) Non-Living, c) Living, d) Non-Living',
        markingGuide: '0.5 marks each: a=L, b=NL, c=L, d=NL. Total 2 marks.'
      },
      {
        id: 4,
        questionText: 'Can a river rock grow bigger by eating food? (Yes / No). Explain why.',
        questionType: 'short_answer',
        points: 1,
        expectedAnswer: 'No, because a rock is non-living matter and does not have cells or organs to take in food and grow.',
        markingGuide: '1 mark for No + sound non-living reasoning.'
      },
      {
        id: 5,
        questionText: 'A bicycle can move when someone pedals it. Does moving make the bicycle a living thing? Explain your answer.',
        questionType: 'short_answer',
        points: 1,
        expectedAnswer: 'No. The bicycle only moves because a human pushes the pedals; it cannot move on its own, does not drink water, and cannot reproduce.',
        markingGuide: '1 mark for explaining external force vs autonomous biological life.'
      },
      {
        id: 6,
        questionText: 'Why is a green banana tree in our school garden considered a living thing?',
        questionType: 'short_answer',
        points: 1,
        expectedAnswer: 'It absorbs water from soil, makes food with sunlight, grows taller, and produces baby banana shoots (reproduces).',
        markingGuide: '1 mark for citing at least two living traits (growth, reproduction, nutrition).'
      },
      {
        id: 7,
        questionText: 'Draw or name one non-living thing you use in school every day and explain why it is non-living.',
        questionType: 'short_answer',
        points: 1,
        expectedAnswer: 'Pencil (or book, desk, eraser). It is made of inert wood and lead/graphite; it does not breathe, eat, or grow.',
        markingGuide: '1 mark for valid school object + non-living rationale.'
      },
      {
        id: 8,
        questionText: 'Write a Claim + Evidence + Reasoning: "Is an earthworm living or non-living?"',
        questionType: 'cer_explanation',
        points: 2,
        expectedAnswer: 'Claim: An earthworm is a living thing.\nEvidence: It moved on our tray, reacted to touch, and needs moist soil and food to survive.\nReasoning: Because it exhibits autonomous movement, responds to stimuli, and requires nutrients, it fulfills the scientific criteria for life.',
        markingGuide: '2 marks: 1 for claim + evidence; 1 for reasoning on life criteria.'
      }
    ],
    exitTicketQuestions: [
      {
        id: 1,
        questionText: 'Circle the item that is ALIVE:\nA) River rock\nB) Caterpillar\nC) Plastic cup\nD) Metal coin',
        questionType: 'multiple_choice',
        points: 1,
        options: ['A', 'B', 'C', 'D'],
        expectedAnswer: 'B) Caterpillar',
        markingGuide: '1 mark for B.'
      },
      {
        id: 2,
        questionText: 'Name two things a pet puppy in Belize needs from you so it can stay alive and grow.',
        questionType: 'short_answer',
        points: 2,
        expectedAnswer: 'Water and food (also accept love/shelter/clean space).',
        markingGuide: '1 mark for food; 1 mark for water.'
      },
      {
        id: 3,
        questionText: 'Tell why a toy doll with blinking eyes is NOT really alive.',
        questionType: 'short_answer',
        points: 2,
        expectedAnswer: 'It does not grow, eat food, drink water, or breathe; its eyes only blink because of plastic hinges or batteries.',
        markingGuide: '1 mark for citing lack of biological growth/food; 1 mark for mechanical explanation.'
      }
    ],
    differentiation: {
      struggling: {
        support: 'Use tactile realia: let students touch a real cool river stone and a soft fuzzy green leaf. Use picture cards with green checks for living and red crosses for non-living.',
        scaffold: 'Provide sentence stems: "A ___ is living because it ___." "A ___ is non-living because it cannot ___."',
        visualAid: 'A brightly illustrated sorting mat divided into two sides: "I am Alive! (Green)" and "I was Never Alive! (Gray)".'
      },
      onLevel: {
        task: 'Complete the specimen observation chart, sort all 8 items, and complete the 8-question worksheet with complete sentences.',
        independence: 'Conducts specimen observation independently in pairs and shares findings during group collation.'
      },
      advanced: {
        extension: 'Investigate "once-living" objects: explain why a dry fallen mahogany leaf or a wooden pencil was once part of a living organism, but is no longer alive now.',
        deeperInquiry: 'Create a mini-poster classifying 5 living things and 5 non-living things found in the Belize Barrier Reef.'
      }
    }
  },

  // =========================================================================
  // 4. ANIMAL HABITATS & ADAPTATIONS (Standard 2 & 3)
  // =========================================================================
  animal_habitats_adaptations: {
    category: 'animal_habitats_adaptations',
    standardLevel: 'Standard 3',
    topicTitle: 'Life Science: Animal Habitats and Structural Adaptations',
    focalConcept: 'Investigating How Physical Adaptations (Camouflage, Body Coverings, Limbs) Enable Belize Wildlife to Survive in Specific Habitats',
    phenomenon: 'A green iguana blends in so perfectly with tree leaves along the Macal River that birds of prey fly right over it without noticing, whereas a bright red plastic lizard placed on the same branch is spotted immediately from 20 feet away.',
    inquiryQuestion: 'How do structural adaptations help animals in Belize find food, escape predators, and survive in their specific habitats?',
    priorKnowledgeHook: 'Wildlife Mimic: Act out how a jaguar stalks prey through tall rainforest grass versus how a pelican dives for fish in the sea. What body parts make each movement possible?',
    prerequisiteKnowledge: 'In Standards 1 and 2, students classified animals into broad categories (mammals, birds, reptiles, fish) and described basic animal homes (trees, water, burrows). Students understand that animals need food and shelter, but have not yet analyzed how specific physical adaptations (camouflage, limb structures, specialized beaks) correlate directly with survival in distinct Belizean ecosystems.',
    diagnosticProbe: 'Habitat Swap Probe: If you put a West Indian Manatee into the Mountain Pine Ridge pine forest, could it survive? What body parts does it have that only work in water?',
    misconceptions: [
      {
        misconception: 'Animals choose to change their physical features whenever they move to a new place.',
        evidenceToEncounter: 'Comparing bird beak specimens: a toucan cannot change its large curved fruit beak into a sharp hooked hawk beak if it wants to eat meat; its beak structure was inherited.',
        scientificReality: 'Adaptations are inherited physical traits that evolve over many generations through natural selection, not deliberate personal choices.',
        teacherCorrectionPrompt: '"Can you decide to grow webbed feet tomorrow to swim faster? No! Animals inherit their adaptations from their parents over generations."'
      },
      {
        misconception: 'Camouflage only means turning green like a leaf.',
        evidenceToEncounter: 'Examining jaguar coat patterns (rosettes) and tapir calf stripes: dappled spots mimic patches of sunlight filtering through the forest canopy.',
        scientificReality: 'Camouflage includes disruptive coloration, countershading, texture mimicry, and shadow-breaking patterns suited to specific habitat lighting.',
        teacherCorrectionPrompt: '"Look at the jaguar\'s rosette spots: do they make it look green? No! They look like shadows of leaves moving in the breeze."'
      }
    ],
    predictionPrompt: 'I predict that an animal with webbed feet and waterproof fur will survive best in a (wetland / dry pine forest) habitat because __________________________.',
    investigation: {
      title: 'Belize Animal Habitat Adaptation & Camouflage Simulation',
      investigationType: 'controlled_experiment',
      whatToInvestigate: 'How camouflage coloration and specialized body coverings affect predator detection rates in different Belizean habitat backdrops.',
      whatToObserve: 'Number of colored paper moth/bug models retrieved within 15 seconds against green forest foliage vs brown tree bark backgrounds.',
      whatToRecord: 'Data table recording: Background Color | Moth Color | Number Retrieved (Predation Rate) across 3 trials.',
      evidenceProduced: 'Camouflaged models had an 80% survival rate (only 2 of 10 spotted), while contrasting models had a 10% survival rate (9 of 10 spotted).',
      questionAnsweredByEvidence: 'Evidence proves protective coloration directly reduces predation risk and increases survival in matching habitats.',
      materials: [
        'Habitat background boards (Lush broadleaf green, pine forest brown/dry leaf)',
        'Colored paper butterfly/moth cutouts (matching vs contrasting colors)',
        'Stopwatches or timer',
        'Belize wildlife adaptation profile cards (Jaguar, Baird\'s Tapir, Keel-billed Toucan, Manatee)',
        'Science notebooks'
      ],
      isStudentDriven: true
    },
    explanationCER: {
      claim: 'Belizean animals possess specialized structural adaptations (coloration, limbs, beaks) that match the physical conditions of their native habitats to ensure survival.',
      evidence: 'In our simulation, prey models matching the background color had an 80% lower detection rate, and real animals like the tapir have prehensile snouts to grasp riverside vegetation.',
      reasoning: 'Under evolutionary biology, individuals with advantageous structural traits survive and reproduce more successfully, passing these adapted traits to offspring in that specific environment.',
      formalVocabularyMoment: 'Introduce "Adaptation", "Camouflage", and "Habitat" AFTER the predation simulation.',
      formalVocabulary: [
        { term: 'Adaptation', definition: 'A specialized physical structure or behavior that helps an organism survive and reproduce in its environment.' },
        { term: 'Habitat', definition: 'The natural home or physical environment where an organism lives, finds food, water, and shelter.' },
        { term: 'Camouflage', definition: 'A structural adaptation where an organism\'s color, pattern, or shape blends with its surroundings to hide from predators or prey.' }
      ]
    },
    belizeanContext: {
      ecosystemOrLocation: 'Cockscomb Basin Wildlife Sanctuary (Stann Creek) and Crooked Tree Wildlife Sanctuary (Belize District).',
      communityApplication: 'Protecting natural wildlife habitats and corridors across Belize to prevent endangered species (jaguar, yellow-headed parrot) from going extinct.'
    },
    learningObjectives: {
      condition: 'Given Belize wildlife profile cards, habitat background simulations, and structured adaptation worksheets:',
      cognitive: 'Students will identify, analyze, and explain animal structural adaptations for survival in specific habitats with at least 80% accuracy.',
      psychomotor: 'Students will simulate predator-prey searches, record retrieval data in tables, and construct labeled adaptation diagrams.',
      affective: 'Students will demonstrate pride in Belize\'s national biodiversity, value wildlife conservation, and participate collaboratively.',
      successCriteria: [
        'I can define what an adaptation is and give two examples from Belize wildlife.',
        'I can explain how camouflage helps an animal survive in its habitat.',
        'I can match an animal\'s body structure to its feeding habit or locomotion.'
      ]
    },
    worksheetQuestions: [
      {
        id: 1,
        questionText: 'Which adaptation enables the Keel-billed Toucan to reach and pluck fruit on thin tree branches that cannot hold its full weight?',
        questionType: 'multiple_choice',
        points: 1,
        options: ['A) Sharp talons', 'B) Large, lightweight beak', 'C) Webbed feet', 'D) Thick blubber'],
        expectedAnswer: 'B) Large, lightweight beak',
        markingGuide: '1 mark for selecting B.'
      },
      {
        id: 2,
        questionText: 'Name the natural habitat in Belize where the West Indian Manatee lives, and identify ONE adaptation that helps it swim.',
        questionType: 'short_answer',
        points: 1,
        expectedAnswer: 'Habitat: Coastal lagoons, rivers, and shallow marine waters. Adaptation: Paddle-like front flippers and flat horizontal tail (fluke).',
        markingGuide: '0.5 mark for aquatic habitat; 0.5 mark for flipper/paddle tail adaptation.'
      },
      {
        id: 3,
        questionText: 'Match each Belizean animal to its key survival adaptation:\na) Jaguar:\nb) Green Iguana:\nc) Baird\'s Tapir:\nd) Brown Pelican:',
        questionType: 'fill_blank',
        points: 2,
        expectedAnswer: 'a) Spotted rosette camouflage / powerful bite, b) Green coloration / long tail for defense, c) Streamlined body / prehensile snout for water/mud, d) Large throat pouch for netting fish',
        markingGuide: '0.5 marks each. Total 2 marks.'
      },
      {
        id: 4,
        questionText: 'In our camouflage simulation, why did green cutouts on a green background have a higher survival rate than orange cutouts?',
        questionType: 'short_answer',
        points: 1,
        expectedAnswer: 'Green cutouts blended into the green background, making them harder for predators to spot quickly within the time limit.',
        markingGuide: '1 mark for explaining visual blending reducing detection.'
      },
      {
        id: 5,
        questionText: 'Explain how the sharp claws and padded paws of a jaguar help it hunt in the dense rainforest of Cockscomb Basin.',
        questionType: 'short_answer',
        points: 1,
        expectedAnswer: 'Padded paws allow the jaguar to walk silently over dry leaves without alerting prey, while sharp claws grip slippery logs and capture prey.',
        markingGuide: '1 mark for contrasting silent stalking (padded paws) with grasping prey (sharp claws).'
      },
      {
        id: 6,
        questionText: 'Why would an animal with thick polar bear blubber and white fur struggle to survive in Belize\'s tropical rainforest?',
        questionType: 'short_answer',
        points: 1,
        expectedAnswer: 'Thick blubber would trap too much body heat, causing overheating, and white fur would stand out brightly against green foliage, ruining camouflage.',
        markingGuide: '1 mark for citing thermal overheating and loss of camouflage.'
      },
      {
        id: 7,
        questionText: 'Define the term "Habitat" and describe the habitat of the Howler Monkey (Baboon) in Belize.',
        questionType: 'short_answer',
        points: 1,
        expectedAnswer: 'A habitat is the natural environment where an organism lives. Howler monkeys live in the high canopy of broadleaf rainforests and riverbanks (e.g., Community Baboon Sanctuary in Bermudian Landing).',
        markingGuide: '1 mark for habitat definition + broadleaf/riverine forest canopy.'
      },
      {
        id: 8,
        questionText: 'Construct a CER explanation: "How does the green tree frog\'s sticky toe pads help it survive in Belizean trees?"',
        questionType: 'cer_explanation',
        points: 2,
        expectedAnswer: 'Claim: Sticky toe pads allow the tree frog to climb vertical tree trunks and cling to smooth leaves high above ground.\nEvidence: Frogs with adhesive pads can climb smooth surfaces without slipping, escaping ground predators.\nReasoning: This physical adaptation provides access to an arboreal food supply (insects) and safety from terrestrial carnivores.',
        markingGuide: '2 marks: 1 for claim + evidence; 1 for ecological reasoning on arboreal survival.'
      }
    ],
    exitTicketQuestions: [
      {
        id: 1,
        questionText: 'What is an adaptation?\nA) A learned trick like rolling over\nB) A physical trait or body feature that helps an animal survive\nC) A change in the weather\nD) The place where an animal sleeps',
        questionType: 'multiple_choice',
        points: 1,
        options: ['A', 'B', 'C', 'D'],
        expectedAnswer: 'B',
        markingGuide: '1 mark for B.'
      },
      {
        id: 2,
        questionText: 'Name ONE Belizean animal that uses camouflage to hide from predators or prey, and describe its camouflage.',
        questionType: 'short_answer',
        points: 2,
        expectedAnswer: 'Jaguar (spotted rosette coat looks like tree shadows) OR Green Iguana (green scales blend into riverside leaves).',
        markingGuide: '1 mark for valid animal; 1 mark for accurate description.'
      },
      {
        id: 3,
        questionText: 'Why do ducks and pelicans have webbed feet while hawks and owls have sharp curved talons?',
        questionType: 'short_answer',
        points: 2,
        expectedAnswer: 'Webbed feet act like paddles to push water for swimming, while sharp curved talons are adapted to grip, kill, and tear prey.',
        markingGuide: '1 mark for swimming/paddling function; 1 mark for hunting/grasping function.'
      }
    ],
    differentiation: {
      struggling: {
        support: 'Provide animal picture cards with callout arrows pointing directly to key adaptations (e.g., arrow to duck foot labeled "Webbed for swimming").',
        scaffold: 'Use a matching table with pictures of habitats (Reef, Pine Ridge, Mangrove) and drag-and-drop animal cards.',
        visualAid: 'Large colorful Belize Wildlife poster showing Jaguar, Toucan, Tapir, and Manatee with adaptations labeled in bold.'
      },
      onLevel: {
        task: 'Complete the simulation data table, calculate percentage survival rates, and write complete answers for all 8 worksheet questions.',
        independence: 'Conducts simulation trials in small groups and formulates CER explanation independently.'
      },
      advanced: {
        extension: 'Hypothesize how climate change and rising temperatures might impact the fur thickness and hunting habits of the Belizean jaguar over the next century.',
        deeperInquiry: 'Create an original fantasy animal adapted to survive both underwater on the reef and in the canopy of the Chiquibul forest.'
      }
    }
  },

  // =========================================================================
  // 5. MATTER, MATERIALS & STATES OF MATTER (Standard 4)
  // =========================================================================
  matter_states_properties: {
    category: 'matter_states_properties',
    standardLevel: 'Standard 4',
    topicTitle: 'Physical Science: States of Matter and Thermal Energy Changes',
    focalConcept: 'Investigating the Three States of Matter (Solids, Liquids, Gases) and Phase Changes Driven by Thermal Energy',
    phenomenon: 'On a humid 32°C afternoon in Belize City, a dry glass filled with ice water develops clear water droplets on the outside within 90 seconds, while an ice cube left on a plate shrinks and vanishes into a puddle without anyone touching it.',
    inquiryQuestion: 'Where do the water droplets on the outside of a cold cup come from, and how does heat energy cause matter to change its physical state?',
    priorKnowledgeHook: 'Matter Detective: Touch your wooden desk, take a sip of water, and take a deep breath. Which one is a solid? Which is a liquid? Which is a gas?',
    prerequisiteKnowledge: 'In Standards 2 and 3, students identified solid objects and liquid water in daily routines. Students understand that ice is frozen water, but have not yet explored gas as a physical state of matter or investigated how thermal energy drives phase changes (evaporation, condensation) at the molecular level.',
    diagnosticProbe: 'Cold Cup Probe: Did the water on the outside of the cold glass leak through the solid glass walls from inside? How could we test this using food coloring?',
    misconceptions: [
      {
        misconception: 'Water on the outside of a cold cup leaks through pores in the glass.',
        evidenceToEncounter: 'Filling the cup with red-dyed ice water: the droplets that condense on the outside are crystal clear pure water, not red liquid.',
        scientificReality: 'Invisible water vapor in the surrounding warm air touches the cold glass surface, loses thermal energy, and condenses into liquid droplets.',
        teacherCorrectionPrompt: '"Look at the droplets on the outside: are they red like the juice inside, or clear? Clear! So did the drink leak through the glass?"'
      },
      {
        misconception: 'When liquid water evaporates in the sun, it disappears from existence.',
        evidenceToEncounter: 'Placing clear plastic wrap over a damp cup in the sun: water evaporates from the base and condenses on the plastic wrap underside, proving mass is conserved.',
        scientificReality: 'Evaporated water changes phase into an invisible gas called water vapor, consisting of the exact same molecules spread farther apart.',
        teacherCorrectionPrompt: '"When water evaporates, it doesn\'t vanish into nothing—it breaks apart into invisible floating gas molecules in the air."'
      }
    ],
    predictionPrompt: 'I predict that if we put blue-dyed water inside a cold metal can, the droplets that form on the outside will be (blue / clear) because __________________________.',
    investigation: {
      title: 'Phase Change & Condensation Investigation with Ice Cans and Thermal Sensors',
      investigationType: 'controlled_experiment',
      whatToInvestigate: 'How thermal energy transfer causes condensation of atmospheric water vapor and melting of solid ice.',
      whatToObserve: 'Droplet formation on metal cans with ice vs room-temperature water; color and clarity of exterior condensation droplets.',
      whatToRecord: 'Observation table: Can Setup | Starting Temp (°C) | Droplet Appearance Time (sec) | Droplet Color | Final Liquid Volume.',
      evidenceProduced: 'Ice can cooled to 4°C formed clear water droplets on exterior within 60s; room temp can (28°C) formed zero droplets; condensation was 100% colorless regardless of interior dye.',
      questionAnsweredByEvidence: 'Evidence proves droplets come from atmospheric water vapor losing heat upon contacting the cold boundary, not from interior leakage.',
      materials: [
        'Metal soup cans or clear plastic cups',
        'Ice cubes and cold water',
        'Red or blue food coloring',
        'Thermometers (°C)',
        'Dry paper towels',
        'Science notebooks'
      ],
      isStudentDriven: true
    },
    explanationCER: {
      claim: 'Matter changes state between solid, liquid, and gas when thermal energy is added or removed; cooling water vapor in ambient air causes it to condense into liquid water.',
      evidence: 'Clear droplets formed exclusively on the cold ice can (4°C) within 60 seconds, and the condensed drops were completely colorless despite blue food coloring inside.',
      reasoning: 'Gas molecules of water vapor have high kinetic energy. When they collide with the cold surface, thermal energy transfers from the vapor to the cup, slowing the molecules down until intermolecular forces pull them together into liquid droplets (condensation).',
      formalVocabularyMoment: 'Introduce "States of Matter", "Condensation", "Evaporation", and "Thermal Energy" AFTER observing the clear exterior drops.',
      formalVocabulary: [
        { term: 'Solid', definition: 'State of matter with a definite shape and definite volume whose particles are tightly packed and vibrate in place.' },
        { term: 'Liquid', definition: 'State of matter with a definite volume but no fixed shape, taking the shape of its container as particles slide past each other.' },
        { term: 'Gas', definition: 'State of matter with no definite shape and no definite volume whose particles move rapidly and spread far apart.' },
        { term: 'Condensation', definition: 'The physical phase change from a gas to a liquid when thermal energy is removed (cooling).' },
        { term: 'Evaporation', definition: 'The physical phase change from a liquid to a gas at the surface when thermal energy is added (heating).' }
      ]
    },
    belizeanContext: {
      ecosystemOrLocation: 'Morning dew on leaves in the Maya Mountains, rainwater harvesting cisterns across Belize, and drying sea salt in salt ponds.',
      communityApplication: 'Harvesting clean rain runoff into household vats and understanding how humidity affects weather and food storage in Belize.'
    },
    learningObjectives: {
      condition: 'Given ice-water condensation apparatus, colored dye, thermometers, and observation data logs:',
      cognitive: 'Students will classify states of matter and explain phase changes (melting, freezing, evaporation, condensation) with at least 80% accuracy.',
      psychomotor: 'Students will measure surface temperatures, record phase change times, and sketch particle diagrams for solids, liquids, and gases.',
      affective: 'Students will practice lab safety when handling ice and glassware, record empirical data objectively, and collaborate effectively.',
      successCriteria: [
        'I can describe particle movement in solids, liquids, and gases.',
        'I can identify phase changes caused by heating (melting, evaporation) and cooling (freezing, condensation).',
        'I can explain where condensation droplets on a cold glass come from.'
      ]
    },
    worksheetQuestions: [
      {
        id: 1,
        questionText: 'Which state of matter has a definite volume but NO definite shape, taking the shape of whatever container holds it?',
        questionType: 'multiple_choice',
        points: 1,
        options: ['A) Solid', 'B) Liquid', 'C) Gas', 'D) Plasma'],
        expectedAnswer: 'B) Liquid',
        markingGuide: '1 mark for selecting B.'
      },
      {
        id: 2,
        questionText: 'What must happen to the thermal energy (heat) of liquid water for it to freeze into solid ice?',
        questionType: 'short_answer',
        points: 1,
        expectedAnswer: 'Thermal energy must be removed (the water must be cooled).',
        markingGuide: '1 mark for stating heat/thermal energy is removed/lost.'
      },
      {
        id: 3,
        questionText: 'Match each phase change to its correct scientific term:\na) Liquid to Gas:\nb) Gas to Liquid:\nc) Solid to Liquid:\nd) Liquid to Solid:',
        questionType: 'fill_blank',
        points: 2,
        expectedAnswer: 'a) Evaporation (or Boiling), b) Condensation, c) Melting, d) Freezing',
        markingGuide: '0.5 marks each. Total 2 marks.'
      },
      {
        id: 4,
        questionText: 'In our ice-can investigation, how did we prove that condensation droplets did NOT leak through the metal from inside?',
        questionType: 'short_answer',
        points: 1,
        expectedAnswer: 'We dyed the water inside blue/red, but the droplets that formed on the outside were crystal clear pure water.',
        markingGuide: '1 mark for citing the food coloring test showing clear condensation.'
      },
      {
        id: 5,
        questionText: 'Describe how the molecules of water are arranged in an ice cube compared to water vapor in the air.',
        questionType: 'short_answer',
        points: 1,
        expectedAnswer: 'In ice, molecules are tightly packed in a fixed rigid structure and only vibrate; in water vapor, molecules are far apart and move rapidly in all directions.',
        markingGuide: '1 mark for contrasting fixed tightly packed arrangement with distant fast-moving particles.'
      },
      {
        id: 6,
        questionText: 'On a sunny day in Corozal, puddles of rainwater on the asphalt court disappear after three hours. Where did the water go?',
        questionType: 'short_answer',
        points: 1,
        expectedAnswer: 'Solar heat added thermal energy to the liquid water, causing it to evaporate into invisible gas (water vapor) in the surrounding air.',
        markingGuide: '1 mark for explaining evaporation into invisible atmospheric water vapor due to heat.'
      },
      {
        id: 7,
        questionText: 'Why do bathroom mirrors fog up when you take a hot shower in Belize?',
        questionType: 'short_answer',
        points: 1,
        expectedAnswer: 'Hot water produces warm water vapor. When it hits the cool glass mirror, it loses heat and condenses into tiny liquid water droplets (fog).',
        markingGuide: '1 mark for explaining water vapor cooling and condensing onto the mirror surface.'
      },
      {
        id: 8,
        questionText: 'Construct a CER explanation: "Does a block of ice have the same chemical matter as a cloud of steam?"',
        questionType: 'cer_explanation',
        points: 2,
        expectedAnswer: 'Claim: Yes, an ice block and steam are the exact same chemical substance (H2O).\nEvidence: Ice melts into water, which boils into steam, and cooling steam condenses back into liquid water and freezes into ice without changing identity.\nReasoning: Phase changes are physical changes involving thermal energy and particle arrangement, not chemical alterations of molecular composition.',
        markingGuide: '2 marks: 1 for claim + evidence; 1 for reasoning on physical vs chemical change.'
      }
    ],
    exitTicketQuestions: [
      {
        id: 1,
        questionText: 'What is the name of the process when invisible water vapor cools and turns into liquid water droplets?\nA) Evaporation\nB) Melting\nC) Condensation\nD) Freezing',
        questionType: 'multiple_choice',
        points: 1,
        options: ['A', 'B', 'C', 'D'],
        expectedAnswer: 'C) Condensation',
        markingGuide: '1 mark for C.'
      },
      {
        id: 2,
        questionText: 'Name the three states of matter and give one everyday example of each found in Belize.',
        questionType: 'short_answer',
        points: 2,
        expectedAnswer: '1) Solid (rock, wood, ice); 2) Liquid (river water, orange juice); 3) Gas (air, oxygen, water vapor).',
        markingGuide: '1 mark for 3 states; 1 mark for valid everyday Belizean examples.'
      },
      {
        id: 3,
        questionText: 'What happens to the speed of water molecules when you boil water in a pot on the stove?',
        questionType: 'short_answer',
        points: 2,
        expectedAnswer: 'The molecules absorb thermal energy, gain kinetic energy, move much faster, and spread far apart to escape as steam.',
        markingGuide: '1 mark for moving faster / absorbing heat; 1 mark for spreading apart to escape as gas.'
      }
    ],
    differentiation: {
      struggling: {
        support: 'Use physical kinesthetic modeling: have students huddle tightly together vibrating to model a solid, hold hands and slide past each other for a liquid, and let go to run far apart for a gas.',
        scaffold: 'Provide illustrated flowcharts with arrows labeled "+ Heat (Melting/Evaporating)" and "- Heat (Freezing/Condensing)".',
        visualAid: 'Three clear sealed jars: one with marbles tightly packed (solid), one with water (liquid), one with an inflated balloon (gas).'
      },
      onLevel: {
        task: 'Record temperature curves during ice melting and can condensation, create labeled particle models, and complete all 8 worksheet questions.',
        independence: 'Conducts trials and completes data tables collaboratively, then writes CER explanation independently.'
      },
      advanced: {
        extension: 'Investigate sublimation: explain how dry ice (solid carbon dioxide) skips the liquid phase entirely, and compare its behavior with water under atmospheric pressure in Belize.',
        deeperInquiry: 'Calculate the rate of water loss from a 1-meter open water cistern under differing ambient wind speeds and temperatures.'
      }
    }
  },

  // =========================================================================
  // 6. FORCES, MOTION & SIMPLE MACHINES (Standard 5)
  // =========================================================================
  forces_motion_machines: {
    category: 'forces_motion_machines',
    standardLevel: 'Standard 5',
    topicTitle: 'Physical Science: Forces, Motion, and Simple Machines',
    focalConcept: 'Investigating Mechanical Advantage of Inclined Planes, Levers, and Pulleys in Reducing Effort Force',
    phenomenon: 'A fisherman in Hopkins trying to lift a heavy 150-pound outboard motor straight up into the back of a pickup truck cannot budge it, but when he rolls it up a 10-foot wooden plank (inclined plane), he pushes it into the truck bed by himself with ease.',
    inquiryQuestion: 'How do simple machines allow humans to move heavy loads with less effort force, and what trade-off must be made in distance?',
    priorKnowledgeHook: 'Tug of War & Push Challenge: What is a force? When you push a heavy desk across the concrete classroom floor versus a smooth tiled floor, why is one harder?',
    prerequisiteKnowledge: 'In Standards 3 and 4, students recognized pushes and pulls as forces that start, stop, or change the direction of an object\'s motion, and observed that heavy objects require more force to move. Students have not yet measured force quantitatively in Newtons or analyzed the mechanical advantage trade-off between force and distance in simple machines.',
    diagnosticProbe: 'Heavy Box Probe: Does using a ramp make the total amount of work disappear, or does it spread the work over a longer distance? Explain your thinking.',
    misconceptions: [
      {
        misconception: 'Simple machines create free energy out of nowhere to lift loads.',
        evidenceToEncounter: 'Measuring force and distance with spring scales: pulling a 10N weight up a ramp requires only 4N of force, but the ramp distance is 2.5 times longer (Work = Force × Distance remains constant).',
        scientificReality: 'Machines cannot multiply energy (Conservation of Energy); they reduce the required input force by proportionally increasing the distance over which that force must be applied.',
        teacherCorrectionPrompt: '"Look at our spring scale and ruler: did the ramp give us free energy? No! We used less force, but we had to push it twice as far!"'
      },
      {
        misconception: 'Friction is always harmful and serves no useful purpose.',
        evidenceToEncounter: 'Attempting to push a block on a soapy tray vs dry rubber: without friction, tires cannot grip roads, shoes slip helplessly, and brakes cannot stop moving vehicles.',
        scientificReality: 'Friction opposes motion, causing energy dissipation as heat, but is essential for traction, walking, braking, and holding mechanical assemblies together.',
        teacherCorrectionPrompt: '"What would happen to a truck driving on the Hummingbird Highway if all friction suddenly disappeared? It could never steer or stop!"'
      }
    ],
    predictionPrompt: 'I predict that using a longer ramp will require (more / less) effort force to lift the load because __________________________.',
    investigation: {
      title: 'Measuring Mechanical Advantage of Inclined Planes Using Spring Scales',
      investigationType: 'controlled_experiment',
      whatToInvestigate: 'How changing the length of an inclined plane (slope angle) alters the effort force needed to lift a standard 500-gram load to a fixed height of 20 cm.',
      whatToObserve: 'Force reading on a calibrated spring scale (Newtons) when lifting vertically vs pulling up a short 30 cm ramp vs a long 60 cm ramp.',
      whatToRecord: 'Data table: Ramp Length (cm) | Fixed Height (cm) | Spring Scale Force (N) | Distance Traveled (cm) | Calculated Work (N × m).',
      evidenceProduced: 'Vertical lift required 5.0 N; 30 cm ramp required 2.8 N; 60 cm ramp required 1.5 N. Work remained approximately 1.0 Joule across all setups.',
      questionAnsweredByEvidence: 'Evidence proves an inclined plane reduces effort force in direct proportion to increased ramp length, confirming the law of conservation of energy.',
      materials: [
        'Calibrated spring scales (0–10 Newtons)',
        'Wooden boards of different lengths (30 cm, 60 cm, 90 cm)',
        'Stackable textbook blocks (20 cm height)',
        'Standard 500g wheeled carts or weighted blocks',
        'Metric tape measures',
        'Science notebooks'
      ],
      isStudentDriven: true
    },
    explanationCER: {
      claim: 'An inclined plane provides mechanical advantage by decreasing the input force required to lift a load in exchange for increasing the distance traveled.',
      evidence: 'Lifting the 500g load vertically required 5.0 N over 0.2 m, whereas pulling it up the 60 cm ramp required only 1.5 N over 0.6 m, achieving a mechanical advantage of 3.3.',
      reasoning: 'According to the physical definition of work (W = F × d), lifting a mass to a specific height requires a fixed amount of gravitational potential energy. Increasing the displacement distance proportionally decreases the necessary input force.',
      formalVocabularyMoment: 'Introduce "Mechanical Advantage", "Effort Force", "Load", and "Inclined Plane" AFTER recording the spring scale values.',
      formalVocabulary: [
        { term: 'Simple Machine', definition: 'A mechanical device that changes the direction or magnitude of a force to make work easier.' },
        { term: 'Inclined Plane', definition: 'A flat sloping surface (ramp) connecting a lower level to a higher level.' },
        { term: 'Effort Force', definition: 'The force applied to a machine to perform work on a load.' },
        { term: 'Mechanical Advantage', definition: 'The ratio of the output force exerted on the load to the input effort force applied to the machine.' }
      ]
    },
    belizeanContext: {
      ecosystemOrLocation: 'Loading citrus crates in Pomona Valley, boat ramps in Placencia, and wheelbarrows on construction sites across Belize.',
      communityApplication: 'Using ramps, levers (crowbars), and pulleys to safely load heavy cargo, repair skiffs, and construct houses with reduced physical injury.'
    },
    learningObjectives: {
      condition: 'Given spring scales, ramps of varying lengths, fixed-height blocks, and standard loads:',
      cognitive: 'Students will measure forces, calculate mechanical advantage, and explain the force-distance trade-off of simple machines with at least 80% accuracy.',
      psychomotor: 'Students will zero spring scales, pull loads at a steady speed along ramps, read Newton values, and log data into structured tables.',
      affective: 'Students will demonstrate teamwork during lab trials, value mechanical problem-solving in Belizean trades, and handle equipment safely.',
      successCriteria: [
        'I can explain what an inclined plane does to make lifting heavy loads easier.',
        'I can measure force in Newtons using a spring scale.',
        'I can describe the trade-off between force and distance when using a ramp.'
      ]
    },
    worksheetQuestions: [
      {
        id: 1,
        questionText: 'Which simple machine consists of a flat sloping surface used to lift heavy loads to a higher level?',
        questionType: 'multiple_choice',
        points: 1,
        options: ['A) Pulley', 'B) Lever', 'C) Inclined plane (ramp)', 'D) Wheel and axle'],
        expectedAnswer: 'C) Inclined plane (ramp)',
        markingGuide: '1 mark for selecting C.'
      },
      {
        id: 2,
        questionText: 'What is the standard metric unit used to measure force with a spring scale in science?',
        questionType: 'short_answer',
        points: 1,
        expectedAnswer: 'Newtons (N)',
        markingGuide: '1 mark for Newtons / N.'
      },
      {
        id: 3,
        questionText: 'Identify the simple machine type in each everyday Belizean tool:\na) A crowbar prying open a wooden crate:\nb) A ramp used to roll barrels onto a truck:\nc) The steering wheel of a school bus:\nd) A flagpole rope mechanism:',
        questionType: 'fill_blank',
        points: 2,
        expectedAnswer: 'a) Lever, b) Inclined plane, c) Wheel and axle, d) Pulley',
        markingGuide: '0.5 marks each. Total 2 marks.'
      },
      {
        id: 4,
        questionText: 'In our investigation, lifting a load straight up required 5.0 N, but pulling it up a ramp required 2.0 N. What was the trade-off?',
        questionType: 'short_answer',
        points: 1,
        expectedAnswer: 'We had to pull the load over a longer distance along the ramp compared to lifting it straight up.',
        markingGuide: '1 mark for citing greater distance traveled.'
      },
      {
        id: 5,
        questionText: 'Calculate the mechanical advantage of a ramp if an effort force of 2 N lifts a load weighing 6 N.',
        questionType: 'short_answer',
        points: 1,
        expectedAnswer: 'Mechanical Advantage = Load / Effort = 6 N / 2 N = 3.',
        markingGuide: '1 mark for showing Load / Effort = 3.'
      },
      {
        id: 6,
        questionText: 'Explain why a wheelchair ramp at a clinic in Belmopan is built with a gentle, long slope rather than a steep, short slope.',
        questionType: 'short_answer',
        points: 1,
        expectedAnswer: 'A longer, gentler slope requires much less effort force to push the wheelchair upward, making it safe and manageable for the user.',
        markingGuide: '1 mark for linking gentle slope to lower required effort force.'
      },
      {
        id: 7,
        questionText: 'Name TWO ways friction affects a wheelbarrow being pushed on a construction site in Belize (one positive, one negative).',
        questionType: 'short_answer',
        points: 1,
        expectedAnswer: 'Positive: Friction between the worker\'s shoes and the ground provides traction so they don\'t slip. Negative: Friction in the wheel axle wastes energy as heat and makes pushing harder.',
        markingGuide: '1 mark for valid positive (traction/grip) and negative (wheel resistance/wear) friction effects.'
      },
      {
        id: 8,
        questionText: 'Construct a CER explanation: "Does a simple machine reduce the total amount of work needed to lift an object?"',
        questionType: 'cer_explanation',
        points: 2,
        expectedAnswer: 'Claim: No, a simple machine does not reduce the total amount of work.\nEvidence: In our test, 5N × 0.2m = 1.0 Joule vertically, and 2N × 0.5m = 1.0 Joule on the ramp; the calculated work was identical.\nReasoning: By the Law of Conservation of Energy, energy cannot be created; machines reduce force only by spreading it over a greater distance.',
        markingGuide: '2 marks: 1 for claim + evidence; 1 for reasoning on conservation of energy and work = force × distance.'
      }
    ],
    exitTicketQuestions: [
      {
        id: 1,
        questionText: 'A simple machine makes work feel easier by:\nA) Destroying gravity\nB) Reducing the needed effort force while increasing distance\nC) Multiplying total energy\nD) Removing all friction',
        questionType: 'multiple_choice',
        points: 1,
        options: ['A', 'B', 'C', 'D'],
        expectedAnswer: 'B',
        markingGuide: '1 mark for B.'
      },
      {
        id: 2,
        questionText: 'Name two simple machines commonly used by fishermen, farmers, or builders in Belize.',
        questionType: 'short_answer',
        points: 2,
        expectedAnswer: 'Ramp/inclined plane (loading trucks/boats), Lever/crowbar (lifting rocks), Pulley (raising sails/well buckets), Wheel and axle (wheelbarrow).',
        markingGuide: '1 mark each for two valid simple machines.'
      },
      {
        id: 3,
        questionText: 'If lifting a crate straight up takes 100 Newtons, will pushing it up a gentle ramp take more force or less force?',
        questionType: 'short_answer',
        points: 2,
        expectedAnswer: 'Less force (the ramp reduces the effort force needed).',
        markingGuide: '2 marks for stating less force and connecting it to mechanical advantage.'
      }
    ],
    differentiation: {
      struggling: {
        support: 'Provide a spring scale with color-coded force zones (Green = Low Effort, Red = High Effort) and guide students to feel the difference with their hands.',
        scaffold: 'Pair with an on-level peer to read the scale calibrations while the other pulls the cart.',
        visualAid: 'Step-by-step diagram showing a person lifting straight up (heavy sweat icon) vs rolling up a ramp (smile icon with longer path).'
      },
      onLevel: {
        task: 'Conduct trials across three ramp slopes, calculate Work (F × d) for each condition, and answer all 8 worksheet questions independently.',
        independence: 'Operates spring scale and metric tape independently and records findings accurately in science notebooks.'
      },
      advanced: {
        extension: 'Investigate how friction on different ramp surfaces (smooth wood vs sandpaper vs oiled plastic) affects the actual mechanical efficiency of the machine.',
        deeperInquiry: 'Calculate the mechanical advantage of a compound machine combining an inclined plane and a single fixed pulley.'
      }
    }
  },

  // =========================================================================
  // 7. ELECTRICITY & CIRCUITS (Standard 5 & 6)
  // =========================================================================
  electricity_energy_circuits: {
    category: 'electricity_energy_circuits',
    standardLevel: 'Standard 6',
    topicTitle: 'Physical Science: Electrical Energy, Closed Circuits, and Conductors',
    focalConcept: 'Investigating Closed Loops, Conductors vs Insulators, and Energy Transformations in Simple and Parallel Circuits',
    phenomenon: 'A student connects a D-cell battery and a light bulb with a single copper wire, but the bulb does not light up at all until a second wire is connected back from the bulb to the other battery terminal, forming a continuous unbroken circle.',
    inquiryQuestion: 'Why does electricity require a continuous closed loop to flow, and how do different materials conduct or resist electric current?',
    priorKnowledgeHook: 'Wall Switch Observation: When you flip the classroom light switch ON, what happens? What is physically happening behind that plastic switch plate?',
    prerequisiteKnowledge: 'In Standards 4 and 5, students explored energy forms (light, heat, sound) and recognized that wall outlets and batteries power appliances. Students understand electrical safety rules, but have not yet constructed continuous closed loops or tested materials to classify electrical conductors and insulators.',
    diagnosticProbe: 'Single Wire Probe: Can you light a flashlight bulb using only one wire and one battery? Draw how you would connect them, or explain why two contact points are required.',
    misconceptions: [
      {
        misconception: 'Electricity flows out of both ends of a battery simultaneously and crashes together at the bulb.',
        evidenceToEncounter: 'Inserting an ammeter or bulb into different parts of a series loop: current flows in a single continuous circular direction with equal intensity throughout the loop.',
        scientificReality: 'Electric current is the continuous movement of free electrons through a closed conductive loop from the negative terminal, through the load, to the positive terminal.',
        teacherCorrectionPrompt: '"If electricity flowed from both ends and clashed in the middle, what would happen if we cut the return wire? The bulb goes out instantly because the loop is broken!"'
      },
      {
        misconception: 'Electric current gets used up as it goes around a circuit so less current returns to the battery.',
        evidenceToEncounter: 'Measuring current with a digital multimeter before and after the bulb: the current entering the bulb exactly equals the current exiting the bulb.',
        scientificReality: 'Charge (electrons) is conserved and not consumed; it is the electrical potential energy carried by the electrons that is converted into radiant light and heat.',
        teacherCorrectionPrompt: '"The electrons don\'t vanish—they are like train cars delivering cargo. The cargo (energy) is dropped off at the bulb, but all the train cars return to the station!"'
      }
    ],
    predictionPrompt: 'I predict that testing a metal paperclip in the circuit gap will (light / not light) the bulb, while a plastic eraser will (light / not light) the bulb because __________________________.',
    investigation: {
      title: 'Testing Circuit Continuity and Classifying Conductors vs Insulators',
      investigationType: 'controlled_experiment',
      whatToInvestigate: 'How closing an electrical circuit creates current flow and which materials allow electrons to pass through (conductors) vs block electron flow (insulators).',
      whatToObserve: 'Bulb illumination (on/off) and brightness when various test materials are inserted across a 2 cm test gap in a series circuit.',
      whatToRecord: 'Classification table: Material Name | Material Type | Bulb Lights? (Yes/No) | Classification (Conductor/Insulator).',
      evidenceProduced: 'Metals (copper wire, aluminum foil, iron nail, brass key) completed the circuit and lit the bulb; non-metals (plastic ruler, wood splint, rubber band, glass) blocked current.',
      questionAnsweredByEvidence: 'Evidence proves electric current requires a continuous unbroken loop of conductive material with mobile electrons to function.',
      materials: [
        'D-cell batteries in holders',
        '1.5V miniature incandescent/LED bulbs in sockets',
        'Insulated copper connecting wires with alligator clips',
        'Test objects (paperclip, rubber band, copper penny, plastic cap, pencil graphite, wooden craft stick)',
        'Knife switches',
        'Science notebooks'
      ],
      isStudentDriven: true
    },
    explanationCER: {
      claim: 'Electric current flows only through a closed unbroken conductive circuit, where conductive materials with free electrons allow current to flow while insulators block it.',
      evidence: 'The bulb illuminated exclusively when the circuit loop was unbroken and when metal objects were inserted in the gap; inserting plastic, rubber, or wood resulted in zero bulb illumination.',
      reasoning: 'Metals possess metallic bonding with delocalized valence electrons that drift freely when an electric potential difference (voltage) is applied. Insulators have tightly bound electrons that resist movement, preventing electrical current.',
      formalVocabularyMoment: 'Introduce "Closed Circuit", "Open Circuit", "Conductor", and "Insulator" AFTER students test their objects in the gap.',
      formalVocabulary: [
        { term: 'Circuit', definition: 'A closed, continuous loop of conductive material through which electric current can flow.' },
        { term: 'Conductor', definition: 'A material (typically metal) that contains free electrons and allows electrical current to flow easily.' },
        { term: 'Insulator', definition: 'A material (like rubber, glass, or plastic) that resists electrical current because its electrons are tightly bound.' },
        { term: 'Load', definition: 'A device in a circuit (such as a light bulb, buzzer, or motor) that transforms electrical energy into another form.' }
      ]
    },
    belizeanContext: {
      ecosystemOrLocation: 'Belize Electricity Limited (BEL) distribution lines, Chalillo hydroelectric dam in Cayo, and solar micro-grids in off-grid Toledo villages.',
      communityApplication: 'Electrical safety at home: why appliance cords are coated in insulating rubber/plastic, and why wet hands must never touch electrical outlets.'
    },
    learningObjectives: {
      condition: 'Given D-cell batteries, connecting wires, light bulbs, switches, and a test array of everyday materials:',
      cognitive: 'Students will construct closed circuits, differentiate conductors from insulators, and explain electrical energy transformations with at least 80% accuracy.',
      psychomotor: 'Students will assemble functional circuit loops, manipulate alligator clips, insert test materials into gaps, and sketch schematic circuit diagrams.',
      affective: 'Students will observe electrical safety precautions, collaborate responsibly in lab groups, and appreciate sustainable power in Belize.',
      successCriteria: [
        'I can build a working closed circuit to light a bulb.',
        'I can identify at least three conductors and three insulators.',
        'I can explain why electrical wires are wrapped in plastic or rubber.'
      ]
    },
    worksheetQuestions: [
      {
        id: 1,
        questionText: 'Which of the following materials is an excellent ELECTRICAL CONDUCTOR?',
        questionType: 'multiple_choice',
        points: 1,
        options: ['A) Plastic bottle', 'B) Rubber eraser', 'C) Copper wire', 'D) Glass bead'],
        expectedAnswer: 'C) Copper wire',
        markingGuide: '1 mark for selecting C.'
      },
      {
        id: 2,
        questionText: 'What happens to the current in a circuit when a switch is opened (turned off)?',
        questionType: 'short_answer',
        points: 1,
        expectedAnswer: 'The conductive loop is broken (open circuit), stopping the flow of electrical current immediately.',
        markingGuide: '1 mark for stating the circuit is broken/current stops.'
      },
      {
        id: 3,
        questionText: 'Classify each material as an ELECTRICAL CONDUCTOR (C) or INSULATOR (I):\na) Aluminum foil:\nb) Wooden craft stick:\nc) Steel paperclip:\nd) Rubber band:',
        questionType: 'fill_blank',
        points: 2,
        expectedAnswer: 'a) Conductor, b) Insulator, c) Conductor, d) Insulator',
        markingGuide: '0.5 marks each. Total 2 marks.'
      },
      {
        id: 4,
        questionText: 'Explain why electrical wires in our homes in Belize are made of copper on the inside, but covered in plastic on the outside.',
        questionType: 'short_answer',
        points: 1,
        expectedAnswer: 'Copper conducts electricity efficiently to power appliances, while the plastic insulation blocks current from escaping and prevents electric shocks and fires.',
        markingGuide: '1 mark for contrasting copper conduction with plastic insulation safety.'
      },
      {
        id: 5,
        questionText: 'What energy transformation occurs when an electrical circuit powers a flashlight bulb?',
        questionType: 'short_answer',
        points: 1,
        expectedAnswer: 'Chemical energy from the battery transforms into electrical energy, which transforms into light (radiant) and thermal (heat) energy in the bulb.',
        markingGuide: '1 mark for tracing chemical → electrical → light and heat energy.'
      },
      {
        id: 6,
        questionText: 'If one bulb in a simple series circuit burns out, what happens to the second bulb in that series circuit? Why?',
        questionType: 'short_answer',
        points: 1,
        expectedAnswer: 'The second bulb also goes out because the burnt filament breaks the single continuous loop, creating an open circuit.',
        markingGuide: '1 mark for stating it goes out due to a broken/open circuit loop.'
      },
      {
        id: 7,
        questionText: 'Why is it dangerous to plug in electrical devices with wet hands in Belize?',
        questionType: 'short_answer',
        points: 1,
        expectedAnswer: 'Water containing dissolved minerals is a conductor of electricity, which allows current to flow easily through the human body, causing severe electric shock.',
        markingGuide: '1 mark for explaining water conductivity leading to shock risk.'
      },
      {
        id: 8,
        questionText: 'Construct a CER explanation: "Why did pencil lead (graphite) light the bulb during our test, even though it is not a shiny metal?"',
        questionType: 'cer_explanation',
        points: 2,
        expectedAnswer: 'Claim: Graphite is an electrical conductor because of its unique crystalline atomic structure.\nEvidence: When we inserted pencil graphite into our circuit gap, the bulb illuminated brightly.\nReasoning: Graphite consists of carbon layers with delocalized electrons free to move between layers, allowing electric charge to flow like a metal.',
        markingGuide: '2 marks: 1 for claim + evidence; 1 for reasoning on free/delocalized electrons.'
      }
    ],
    exitTicketQuestions: [
      {
        id: 1,
        questionText: 'In order for electricity to flow and light a bulb, the circuit must be:\nA) Open\nB) Closed and unbroken\nC) Made entirely of plastic\nD) Disconnected from the battery',
        questionType: 'multiple_choice',
        points: 1,
        options: ['A', 'B', 'C', 'D'],
        expectedAnswer: 'B',
        markingGuide: '1 mark for B.'
      },
      {
        id: 2,
        questionText: 'Give two examples of electrical conductors and two examples of electrical insulators.',
        questionType: 'short_answer',
        points: 2,
        expectedAnswer: 'Conductors: Copper, aluminum, iron, brass. Insulators: Rubber, plastic, wood, glass.',
        markingGuide: '1 mark for 2 valid conductors; 1 mark for 2 valid insulators.'
      },
      {
        id: 3,
        questionText: 'What is the function of a switch in an electrical circuit?',
        questionType: 'short_answer',
        points: 2,
        expectedAnswer: 'A switch safely opens and closes the circuit loop to turn current flow on or off.',
        markingGuide: '2 marks for explaining opening/closing loop to control current.'
      }
    ],
    differentiation: {
      struggling: {
        support: 'Provide a pre-assembled baseboard with labeled battery and bulb holders so students only need to connect one test wire across the gap.',
        scaffold: 'Use color-coded wires (red for positive, black for negative) and a picture guide showing a complete circular path.',
        visualAid: 'Circuit anchor chart showing a race track analogy: the cars (electrons) can only drive if the bridge is closed.'
      },
      onLevel: {
        task: 'Build both series and parallel circuits with two bulbs, compare bulb brightness between configurations, and complete all 8 worksheet questions.',
        independence: 'Assembles circuits independently following schematic diagrams and records results in notebooks.'
      },
      advanced: {
        extension: 'Investigate how varying wire thickness and length affects circuit resistance and bulb brightness; construct a model dimmer switch using pencil graphite.',
        deeperInquiry: 'Draw a schematic wiring plan for a solar-powered school clinic in Toledo with independent parallel branch circuits for lighting and refrigeration.'
      }
    }
  },

  // =========================================================================
  // 8. HUMAN BODY SYSTEMS: CIRCULATION & RESPIRATION (Standard 5 & 6)
  // =========================================================================
  human_body_systems: {
    category: 'human_body_systems',
    standardLevel: 'Standard 6',
    topicTitle: 'Human Biology: Circulatory and Respiratory Systems',
    focalConcept: 'Investigating the Pumping Action of the Heart, Pulse Rate Response to Exertion, and Gas Exchange',
    phenomenon: 'After sprinting 100 meters across the school pitch during sports day in Dangriga, a student\'s pulse jumps from 72 beats per minute to 140 beats per minute, their chest heaves rapidly, and their skin feels warm and flushed.',
    inquiryQuestion: 'Why do our heart rate and breathing rate increase together during physical exercise, and how do the circulatory and respiratory systems collaborate to keep our body cells alive?',
    priorKnowledgeHook: 'Find Your Pulse: Place two fingers gently on your wrist below the thumb or on your neck below your jawline. Count the steady rhythmic beats for 15 seconds. What is causing that physical pulse?',
    prerequisiteKnowledge: 'In Standards 3 and 4, students identified major external body parts and organs (heart, stomach, lungs) and discussed healthy living habits. Students have not yet traced the closed double-loop systemic circulation of oxygenated vs deoxygenated blood or measured pulse rate response to physical exertion.',
    diagnosticProbe: 'Heart Clean Blood Probe: Does the heart create fresh oxygen for the body? If not, where does oxygen enter the blood, and where does carbon dioxide leave?',
    misconceptions: [
      {
        misconception: 'The heart creates oxygen for the body to use.',
        evidenceToEncounter: 'Tracing the pulmonary circuit: blood flows from the heart to the lungs specifically to absorb oxygen from inhaled air and release carbon dioxide, then returns to the heart.',
        scientificReality: 'The lungs absorb oxygen and expel carbon dioxide; the heart acts solely as a muscular mechanical pump circulating blood through vessels.',
        teacherCorrectionPrompt: '"If the heart produced oxygen, why would blood need to visit the lungs before going to our leg muscles?"'
      },
      {
        misconception: 'Human blood is blue inside veins before it touches outside air.',
        evidenceToEncounter: 'Examining closed medical blood vials drawn from veins: deoxygenated blood is deep dark maroon, never blue.',
        scientificReality: 'All human blood is red; oxygen-rich blood is bright scarlet, while oxygen-poor blood is dark maroon. Veins appear blue through skin because subcutaneous fat scatters blue light wavelengths.',
        teacherCorrectionPrompt: '"When you scrape your knee, does blue blood come out? No, all blood is red; it only changes shade depending on oxygen saturation."'
      }
    ],
    predictionPrompt: 'I predict that after 60 seconds of vigorous exercise, my heart rate will increase by at least _____ beats per minute because __________________________.',
    investigation: {
      title: 'Investigating Exercise Intensity, Heart Rate (BPM), and Recovery Time',
      investigationType: 'controlled_experiment',
      whatToInvestigate: 'How physical exertion affects resting pulse rate (beats per minute) and breathing rate across resting, active, and recovery phases.',
      whatToObserve: 'Pulse counts at radial/carotid artery sites and chest rise counts per minute before exercise, immediately after 1 minute of jumping jacks, and after 3 minutes of rest.',
      whatToRecord: 'Structured 3-column table: Student Name | Resting Pulse (BPM) | Active Pulse (BPM) | 3-Min Recovery Pulse (BPM).',
      evidenceProduced: 'Average resting pulse was 74 BPM; average active pulse rose to 134 BPM (+60 BPM increase); respiration rate doubled from 16 to 34 breaths/min.',
      questionAnsweredByEvidence: 'Evidence proves working muscle cells require significantly accelerated oxygen and glucose delivery via faster blood circulation.',
      materials: [
        'Stopwatches or classroom clocks with second hands',
        'Stethoscopes (demonstration)',
        'Pulse tracking and graphing worksheets',
        'Human anatomical circulatory and respiratory posters',
        'Science notebooks'
      ],
      isStudentDriven: true
    },
    explanationCER: {
      claim: 'Physical exercise causes heart rate and breathing rate to increase simultaneously because working muscle cells require more oxygen and glucose for cellular respiration and produce more carbon dioxide waste.',
      evidence: 'Our investigation documented an average 81% increase in pulse rate (74 to 134 BPM) and doubled breathing rates immediately following 60 seconds of exercise, returning toward baseline during recovery.',
      reasoning: 'During exercise, muscle cells consume ATP rapidly. To maintain aerobic energy production, the respiratory system accelerates gas exchange in the lungs, while the muscular heart pumps oxygenated blood faster through arteries to working tissues.',
      formalVocabularyMoment: 'Introduce "Artery", "Vein", "Capillary", and "Pulmonary Circulation" AFTER students graph their pulse rate jump.',
      formalVocabulary: [
        { term: 'Heart', definition: 'A muscular organ that pumps blood continuously through the circulatory system.' },
        { term: 'Artery', definition: 'Thick, muscular blood vessels that carry oxygen-rich blood away from the heart to body tissues under high pressure.' },
        { term: 'Vein', definition: 'Blood vessels with one-way valves that carry oxygen-depleted blood back toward the heart under lower pressure.' },
        { term: 'Capillaries', definition: 'Microscopic blood vessels where nutrients, oxygen, and cellular wastes are exchanged directly with body cells.' },
        { term: 'Pulse', definition: 'The rhythmic throbbing of arteries caused by the contraction of the heart\'s left ventricle.' }
      ]
    },
    belizeanContext: {
      ecosystemOrLocation: 'Cardiovascular health across Belize: national cycling classics (Holy Saturday Cross Country Cycling Classic), football tournaments, and combating hypertension/diabetes.',
      communityApplication: 'Encouraging daily cardiovascular exercise, eating balanced low-sodium Belizean meals, and avoiding smoking to maintain healthy heart and lung function.'
    },
    learningObjectives: {
      condition: 'Given stopwatches, pulse-rate tracking logs, anatomical circulatory charts, and exercise protocols:',
      cognitive: 'Students will measure heart rate, explain blood circulation through heart chambers and vessels, and connect respiration to cellular energy with at least 80% accuracy.',
      psychomotor: 'Students will locate radial and carotid pulse points, time 15-second pulse counts, multiply by 4 to calculate BPM, and plot line graphs of heart recovery.',
      affective: 'Students will demonstrate self-awareness of personal health, respect peer physical boundaries during exercise tests, and commit to active lifestyles.',
      successCriteria: [
        'I can locate and accurately count my pulse rate in beats per minute.',
        'I can explain why heart rate increases during exercise.',
        'I can trace the flow of blood between the heart, lungs, and body tissues.'
      ]
    },
    worksheetQuestions: [
      {
        id: 1,
        questionText: 'Which blood vessels carry oxygen-rich blood AWAY from the heart to the rest of the body under high pressure?',
        questionType: 'multiple_choice',
        points: 1,
        options: ['A) Veins', 'B) Arteries', 'C) Capillaries', 'D) Valves'],
        expectedAnswer: 'B) Arteries',
        markingGuide: '1 mark for selecting B.'
      },
      {
        id: 2,
        questionText: 'Where does blood travel immediately after leaving the right side of the heart, and what gas does it collect there?',
        questionType: 'short_answer',
        points: 1,
        expectedAnswer: 'Blood travels to the lungs, where it absorbs oxygen (and releases carbon dioxide).',
        markingGuide: '1 mark for lungs + oxygen absorption.'
      },
      {
        id: 3,
        questionText: 'Match each circulatory component to its primary function:\na) Heart:\nb) Red blood cells:\nc) Capillaries:\nd) One-way valves in veins:',
        questionType: 'fill_blank',
        points: 2,
        expectedAnswer: 'a) Muscular pump propelling blood, b) Carry oxygen bound to hemoglobin, c) Microscopic vessels for nutrient/gas exchange, d) Prevent backward flow of blood',
        markingGuide: '0.5 marks each. Total 2 marks.'
      },
      {
        id: 4,
        questionText: 'If a student counts 18 heartbeats in 15 seconds, calculate their heart rate in beats per minute (BPM). Show your calculation.',
        questionType: 'short_answer',
        points: 1,
        expectedAnswer: '18 beats × 4 = 72 beats per minute (BPM).',
        markingGuide: '1 mark for 18 × 4 = 72 BPM.'
      },
      {
        id: 5,
        questionText: 'Explain why working calf muscles require more blood flow when a cyclist in Belize pedals up a steep hill.',
        questionType: 'short_answer',
        points: 1,
        expectedAnswer: 'Working muscle cells consume glucose and oxygen rapidly to produce energy; increased blood flow delivers more oxygen and removes carbon dioxide and lactic acid wastes.',
        markingGuide: '1 mark for linking energy/oxygen demand to increased blood delivery and waste removal.'
      },
      {
        id: 6,
        questionText: 'Distinguish between an artery and a vein in terms of wall thickness and internal valves.',
        questionType: 'short_answer',
        points: 1,
        expectedAnswer: 'Arteries have thick, elastic muscular walls to withstand high pressure and have no valves; veins have thinner walls with one-way valves to prevent backward flow under low pressure.',
        markingGuide: '1 mark for contrasting wall thickness and presence of valves.'
      },
      {
        id: 7,
        questionText: 'Name TWO lifestyle habits that help a person in Belize maintain a strong, healthy heart and clear blood vessels.',
        questionType: 'short_answer',
        points: 1,
        expectedAnswer: 'Regular cardiovascular exercise (running, cycling, swimming) and a balanced diet low in saturated fats and refined sugars (eating fruits, vegetables, fish; avoiding smoking).',
        markingGuide: '1 mark for any two valid health habits.'
      },
      {
        id: 8,
        questionText: 'Construct a CER explanation: "Why does breathing rate increase at the exact same time heart rate increases during a football match?"',
        questionType: 'cer_explanation',
        points: 2,
        expectedAnswer: 'Claim: Breathing rate and heart rate increase simultaneously because the respiratory and circulatory systems work as an integrated unit to deliver oxygen and expel carbon dioxide.\nEvidence: In our test, active pulse rose by 60 BPM while respiration doubled from 16 to 34 breaths per minute.\nReasoning: Faster heart pumping is useless if blood does not receive oxygen in the lungs; faster breathing re-oxygenates blood entering the pulmonary circuit to meet cellular respiration demands.',
        markingGuide: '2 marks: 1 for claim + evidence; 1 for integrated physiological reasoning.'
      }
    ],
    exitTicketQuestions: [
      {
        id: 1,
        questionText: 'What is the main function of the human heart?\nA) To filter waste from food\nB) To pump blood continuously throughout the body\nC) To breathe in air from the environment\nD) To digest nutrients',
        questionType: 'multiple_choice',
        points: 1,
        options: ['A', 'B', 'C', 'D'],
        expectedAnswer: 'B',
        markingGuide: '1 mark for B.'
      },
      {
        id: 2,
        questionText: 'Name the tiny microscopic blood vessels where oxygen and nutrients actually pass directly into body cells.',
        questionType: 'short_answer',
        points: 2,
        expectedAnswer: 'Capillaries.',
        markingGuide: '2 marks for Capillaries.'
      },
      {
        id: 3,
        questionText: 'Why does an athlete\'s heart rate return to its resting baseline faster after exercise than an inactive person\'s heart rate?',
        questionType: 'short_answer',
        points: 2,
        expectedAnswer: 'An athlete has a stronger, more efficient heart muscle that pumps more blood per beat (higher stroke volume), clearing oxygen debt and waste faster.',
        markingGuide: '1 mark for stronger heart / higher efficiency; 1 mark for faster recovery / clearing oxygen debt.'
      }
    ],
    differentiation: {
      struggling: {
        support: 'Assist with finding pulse: demonstrate thumb-side radial pulse placement and hold wrist gently until student feels the rhythmic beat.',
        scaffold: 'Provide a pre-printed multiplication helper card (e.g., 15 beats = 60 BPM, 18 beats = 72 BPM, 20 beats = 80 BPM).',
        visualAid: 'Color-coded circulatory loop poster: red arrows for oxygen-rich systemic blood, blue arrows for oxygen-poor pulmonary blood.'
      },
      onLevel: {
        task: 'Calculate personal resting, active, and recovery BPM, plot a bar/line graph of heart rate trends, and answer all 8 worksheet questions.',
        independence: 'Conducts timing and logging in peer pairs with minimal teacher prompts, constructing CER independently.'
      },
      advanced: {
        extension: 'Investigate how resting heart rate correlates with cardiovascular fitness levels; research why free divers in Belize (spearfishermen) have trained bradycardia responses.',
        deeperInquiry: 'Calculate the volume of blood pumped by a human heart in one day assuming an average stroke volume of 70 mL per beat.'
      }
    }
  },

  // =========================================================================
  // 9. WEATHER, CLIMATE & TROPICAL METEOROLOGY (Standard 3 & 4)
  // =========================================================================
  weather_climate_meteorology: {
    category: 'weather_climate_meteorology',
    standardLevel: 'Standard 4',
    topicTitle: 'Earth Science: Weather Elements, Measuring Instruments, and Tropical Systems',
    focalConcept: 'Investigating Atmospheric Pressure, Temperature, Wind, Precipitation, and Tracking Tropical Waves in Belize',
    phenomenon: 'Before a squall or tropical storm reaches the coast of Belize, the air pressure reading on the classroom barometer drops sharply, the wind shifts direction and picks up speed, and towering dark cumulonimbus clouds appear over the Caribbean Sea.',
    inquiryQuestion: 'What causes air to move as wind, and how do meteorologists measure weather variables to forecast approaching tropical storms in Belize?',
    priorKnowledgeHook: 'Sensory Weather Check: Step outside the classroom for 60 seconds. What is the sky condition? Which direction is the wind blowing? How warm does the air feel on your skin?',
    prerequisiteKnowledge: 'In Standards 1 and 2, students made daily qualitative weather observations (sunny, rainy, windy) and discussed rainy vs dry seasons in Belize. Students have not yet measured weather elements using scientific meteorological instruments (rain gauge, thermometer, wind vane) or tracked tropical storm pressure systems.',
    diagnosticProbe: 'Air Weight Probe: Does air have weight and take up space, or is air completely weightless because we cannot see it?',
    misconceptions: [
      {
        misconception: 'Air is completely weightless and has no mass.',
        evidenceToEncounter: 'Balancing two inflated balloons on a meter stick, then popping one: the meter stick immediately tilts downward toward the remaining inflated balloon.',
        scientificReality: 'Air is physical matter consisting of nitrogen, oxygen, and other gas molecules that possess mass, exert barometric pressure, and respond to gravity.',
        teacherCorrectionPrompt: '"Look at our balance scale: when we popped the balloon, which way did the ruler tip? That proves air has real physical weight!"'
      },
      {
        misconception: 'Hurricanes are powered by ocean waves hitting the shore.',
        evidenceToEncounter: 'Analyzing tropical cyclone development over warm (27°C+) vs cool ocean waters: storms only strengthen over warm tropical waters where intense evaporation provides heat energy.',
        scientificReality: 'Tropical cyclones are thermal engines powered by latent heat released when warm seawater evaporates into the atmosphere and condenses into towering storm clouds.',
        teacherCorrectionPrompt: '"Why do hurricanes form in warm summer oceans and disappear when they move over cold land? They need heat from warm seawater to survive!"'
      }
    ],
    predictionPrompt: 'I predict that when air is heated by the sun, it will (rise / sink) because __________________________.',
    investigation: {
      title: 'Measuring Weather Variables and Simulating Convection Currents',
      investigationType: 'controlled_experiment',
      whatToInvestigate: 'How temperature differences create air pressure gradients and convection currents (wind), and how weather tools measure atmospheric variables.',
      whatToObserve: 'Movement of paper spirals or smoke streams above a warm heat source vs ice pack; temperature and wind direction changes on classroom weather station.',
      whatToRecord: 'Weather tracking table: Date & Time | Air Temp (°C) | Wind Direction | Barometric Pressure (mb/inHg) | Cloud Cover (oktas/type).',
      evidenceProduced: 'Warm air rose steadily above the lamp causing paper spirals to rotate rapidly; cooler air flowed in laterally beneath it, modeling wind generation.',
      questionAnsweredByEvidence: 'Evidence proves unequal solar heating of Earth\'s surface creates pressure differentials that drive atmospheric winds and weather patterns.',
      materials: [
        'Paper spiral snakes suspended on thread',
        'Warm desk lamp / heat source (teacher supervised)',
        'Classroom weather station tools (thermometer, aneroid barometer, rain gauge, wind vane)',
        'National Meteorological Service of Belize weather advisory map',
        'Science notebooks'
      ],
      isStudentDriven: true
    },
    explanationCER: {
      claim: 'Unequal heating of Earth\'s surface causes warm air to expand, become less dense, and rise, creating low-pressure areas that pull in surrounding cooler air as wind.',
      evidence: 'Our paper spiral spun continuously over the warm lamp as rising warm air currents pushed it, while cooler air at the room perimeter sank.',
      reasoning: 'Gases expand when heated because thermal energy increases molecular velocity and distance between molecules, decreasing air density. Surrounding denser, cooler air rushes into the low-pressure void, producing wind and driving tropical storm convection.',
      formalVocabularyMoment: 'Introduce "Atmospheric Pressure", "Convection", "Wind", and "Barometer" AFTER the spiral demonstration.',
      formalVocabulary: [
        { term: 'Atmospheric Pressure', definition: 'The force exerted by the weight of air molecules pushing down on a unit area of Earth\'s surface.' },
        { term: 'Barometer', definition: 'An instrument used to measure atmospheric air pressure, used to forecast changing weather.' },
        { term: 'Convection Current', definition: 'The circular movement of air or liquid caused by warm, less dense fluid rising and cool, denser fluid sinking.' },
        { term: 'Tropical Cyclone', definition: 'A rapidly rotating storm system characterized by a low-pressure center, strong winds, and heavy rainfall fueled by warm ocean waters.' }
      ]
    },
    belizeanContext: {
      ecosystemOrLocation: 'National Meteorological Service of Belize in Ladyville, NEMO emergency advisories, and hurricane tracking in the Western Caribbean.',
      communityApplication: 'Interpreting NEMO hurricane advisories, securing storm shutters, tracking barometric pressure drops, and evacuating low-lying coastal areas in Belize.'
    },
    learningObjectives: {
      condition: 'Given classroom weather instruments, convection simulation apparatus, and Belize Met Service tracking maps:',
      cognitive: 'Students will measure weather variables, explain convection and wind formation, and interpret hurricane tracking coordinates with at least 80% accuracy.',
      psychomotor: 'Students will read thermometer calibrations, measure rainfall in a graduated cylinder, determine wind direction using a wind vane, and log data in weather tables.',
      affective: 'Students will appreciate the importance of disaster preparedness, take weather warnings seriously, and cooperate in group monitoring.',
      successCriteria: [
        'I can identify four weather instruments and state what each measures.',
        'I can explain what causes wind to blow in terms of warm and cool air.',
        'I can explain why a falling barometer reading signals approaching bad weather in Belize.'
      ]
    },
    worksheetQuestions: [
      {
        id: 1,
        questionText: 'Which weather instrument is specifically used to measure ATMOSPHERIC AIR PRESSURE?',
        questionType: 'multiple_choice',
        points: 1,
        options: ['A) Anemometer', 'B) Barometer', 'C) Rain gauge', 'D) Wind vane'],
        expectedAnswer: 'B) Barometer',
        markingGuide: '1 mark for selecting B.'
      },
      {
        id: 2,
        questionText: 'What type of air pressure system (High or Low) is associated with stormy weather, clouds, and hurricanes in Belize?',
        questionType: 'short_answer',
        points: 1,
        expectedAnswer: 'Low-pressure system.',
        markingGuide: '1 mark for Low pressure.'
      },
      {
        id: 3,
        questionText: 'Match each weather instrument to the variable it measures:\na) Thermometer:\nb) Rain gauge:\nc) Anemometer:\nd) Wind vane:',
        questionType: 'fill_blank',
        points: 2,
        expectedAnswer: 'a) Air temperature, b) Precipitation / rainfall amount, c) Wind speed, d) Wind direction',
        markingGuide: '0.5 marks each. Total 2 marks.'
      },
      {
        id: 4,
        questionText: 'Explain what happens to warm air when it is heated by the tropical sun over the Caribbean Sea.',
        questionType: 'short_answer',
        points: 1,
        expectedAnswer: 'Warm air expands, becomes less dense than the surrounding cooler air, and rises into the upper atmosphere.',
        markingGuide: '1 mark for stating warm air expands, decreases in density, and rises.'
      },
      {
        id: 5,
        questionText: 'Why does a sharp drop in barometric pressure alert Belizean fishermen that they should return their boats to shore?',
        questionType: 'short_answer',
        points: 1,
        expectedAnswer: 'A dropping barometer indicates a low-pressure system is approaching, which brings strong incoming winds, rough seas, and heavy storm squalls.',
        markingGuide: '1 mark for connecting falling pressure to incoming storm/winds/rough seas.'
      },
      {
        id: 6,
        questionText: 'Distinguish between "Weather" and "Climate" in Belize.',
        questionType: 'short_answer',
        points: 1,
        expectedAnswer: 'Weather is the day-to-day atmospheric condition at a specific time (e.g., rainy today); Climate is the long-term average weather pattern over 30+ years (e.g., Belize has a tropical climate).',
        markingGuide: '1 mark for contrasting short-term daily conditions with long-term average patterns.'
      },
      {
        id: 7,
        questionText: 'What is the role of NEMO (National Emergency Management Organization) in Belize during hurricane season?',
        questionType: 'short_answer',
        points: 1,
        expectedAnswer: 'To coordinate national disaster preparedness, issue storm warnings, open public emergency shelters, and direct evacuations.',
        markingGuide: '1 mark for disaster coordination, warnings, shelters, and evacuation.'
      },
      {
        id: 8,
        questionText: 'Construct a CER explanation: "Why do hurricanes form only over warm tropical oceans and weaken quickly when they move over land?"',
        questionType: 'cer_explanation',
        points: 2,
        expectedAnswer: 'Claim: Hurricanes require thermal energy from warm seawater to maintain their intensity.\nEvidence: Cyclones strengthen over 27°C+ oceans and rapidly spin down into tropical depressions upon making landfall in Belize.\nReasoning: Evaporating warm seawater releases latent heat when it condenses in the atmosphere, driving low-pressure convection; over land, this heat/moisture source is cut off and surface friction slows winds.',
        markingGuide: '2 marks: 1 for claim + evidence; 1 for thermodynamic reasoning on latent heat and moisture cut-off.'
      }
    ],
    exitTicketQuestions: [
      {
        id: 1,
        questionText: 'Which weather tool measures the SPEED of the wind?\nA) Barometer\nB) Anemometer\nC) Thermometer\nD) Rain gauge',
        questionType: 'multiple_choice',
        points: 1,
        options: ['A', 'B', 'C', 'D'],
        expectedAnswer: 'B) Anemometer',
        markingGuide: '1 mark for B.'
      },
      {
        id: 2,
        questionText: 'Name two things you and your family should do in Belize when a Hurricane Watch is issued by NEMO.',
        questionType: 'short_answer',
        points: 2,
        expectedAnswer: 'Stock non-perishable food and drinking water; board up windows; prepare flashlights and batteries; know the nearest emergency shelter.',
        markingGuide: '1 mark each for two valid preparedness actions.'
      },
      {
        id: 3,
        questionText: 'Does cool air sink or rise? Explain why in terms of air density.',
        questionType: 'short_answer',
        points: 2,
        expectedAnswer: 'Cool air sinks because its molecules are closer together, making it denser and heavier than surrounding warm air.',
        markingGuide: '1 mark for stating it sinks; 1 mark for explaining higher density.'
      }
    ],
    differentiation: {
      struggling: {
        support: 'Provide a pictorial matching card set: picture of instrument → name of instrument → what it measures.',
        scaffold: 'Pair with an on-level peer to read thermometer calibrations and wind direction together.',
        visualAid: 'A large weather chart showing sunny (High Pressure) vs stormy (Low Pressure) with visual icons.'
      },
      onLevel: {
        task: 'Log outdoor weather variables on classroom station, plot daily barometric pressure, and complete all 8 worksheet questions.',
        independence: 'Reads instruments independently and records data in proper metric units.'
      },
      advanced: {
        extension: 'Plot latitude and longitude coordinates of a historical hurricane (e.g., Hurricane Earl or Richard) on a Western Caribbean tracking map and calculate its forward speed in km/h.',
        deeperInquiry: 'Explain the Coriolis effect and how Earth\'s rotation causes hurricanes in the Northern Hemisphere to rotate counterclockwise.'
      }
    }
  },

  // =========================================================================
  // 10. WATER CYCLE & ENVIRONMENTAL STEWARDSHIP (Standard 4 & 5)
  // =========================================================================
  water_cycle_conservation: {
    category: 'water_cycle_conservation',
    standardLevel: 'Standard 5',
    topicTitle: 'Earth Science: The Hydrological Cycle and Watershed Management',
    focalConcept: 'Investigating Evaporation, Condensation, Precipitation, Runoff, and Groundwater in Belize Watersheds',
    phenomenon: 'Rain falling on the Maya Mountains in Cayo flows down mountain streams into the Macal River, joins the Belize River, passes Belize City, and enters the Caribbean Sea, where solar heat evaporates it back into clouds that rain on the mountains again weeks later.',
    inquiryQuestion: 'How does water continuously cycle through Earth\'s systems, and why is protecting our forested watersheds essential for freshwater in Belize?',
    priorKnowledgeHook: 'Water Drop Journey: Imagine you are a single drop of rain that falls on a leaf in Chiquibul Forest. What journey will you take before ending up in someone\'s drinking glass or the ocean?',
    prerequisiteKnowledge: 'In Standards 2 and 3, students recognized that rain fills rivers and cisterns, and that water is essential for drinking and farming. Students have not yet synthesized the four interconnected phases of the continuous global water cycle or analyzed local Belizean watershed conservation.',
    diagnosticProbe: 'Rain Origin Probe: Does rain come from water that was created brand new in the sky, or has the water on Earth been cycling for millions of years? Could you be drinking water that once rained on a dinosaur?',
    misconceptions: [
      {
        misconception: 'New water is created whenever it rains from the clouds.',
        evidenceToEncounter: 'Sealing a terrarium with moist soil and plants: water cycles endlessly between soil, plant transpiration, condensation on glass walls, and rain droplets without adding any new water.',
        scientificReality: 'Earth is essentially a closed system for matter; the total amount of water on Earth remains constant and cycles continuously through phase changes.',
        teacherCorrectionPrompt: '"Look at our sealed jar: we haven\'t added water for three weeks, yet droplets keep raining down inside! Where did that water come from? The same water cycling over and over."'
      },
      {
        misconception: 'Groundwater is an open underground swimming pool or river beneath the dirt.',
        evidenceToEncounter: 'Pouring water into a beaker filled with gravel and sand: water fills the microscopic pore spaces between rock particles, modeling how aquifers store groundwater.',
        scientificReality: 'Most groundwater saturates tiny pore spaces, cracks, and fissures within underground rock and sediment layers (aquifers), from which wells pump freshwater.',
        teacherCorrectionPrompt: '"Look at our sand cup: did the water sit in a giant empty cavern? No, it soaked into the tiny spaces between each grain of sand!"'
      }
    ],
    predictionPrompt: 'I predict that in our sealed water cycle model, water droplets will form on the underside of the plastic lid when the top is (heated / cooled) because __________________________.',
    investigation: {
      title: 'Building a Closed Water Cycle Terrarium Model and Watershed Simulator',
      investigationType: 'model_construction',
      whatToInvestigate: 'How thermal energy drives continuous evaporation, condensation, precipitation, and percolation through soil layers in a closed system.',
      whatToObserve: 'Evaporation from moist gravel base, condensation droplet formation on cold plastic wrap canopy, and precipitation dripping back onto soil.',
      whatToRecord: 'Cycle observation log: Time Elapsed | Water Level in Base | Condensation Density on Lid | Precipitation Frequency (drops/min).',
      evidenceProduced: 'Model maintained continuous precipitation cycles for 40 minutes under a heat lamp with ice on top; water mass inside remained 100% constant.',
      questionAnsweredByEvidence: 'Evidence proves water moves through closed cyclical phase changes driven by solar heating and upper-atmosphere cooling without loss of matter.',
      materials: [
        'Clear plastic 2-liter bottles or large beakers',
        'Gravel, sand, and rich potting soil (watershed layers)',
        'Small green seedlings or moss',
        'Clear plastic wrap and rubber bands',
        'Ice cubes (to simulate cool upper atmosphere)',
        'Science notebooks'
      ],
      isStudentDriven: true
    },
    explanationCER: {
      claim: 'Water cycles continuously through Earth\'s atmosphere, land, and oceans through evaporation, condensation, precipitation, and runoff, powered by solar thermal energy and gravity.',
      evidence: 'In our closed model, water evaporated from the warm soil base, condensed into droplets beneath the ice-cooled plastic canopy, and precipitated back to the gravel aquifer without any change in total mass.',
      reasoning: 'Solar radiation adds thermal energy to liquid water, causing evaporation into atmospheric vapor. As warm vapor rises and cools in the upper atmosphere, it loses energy and condenses into cloud droplets that precipitate under gravity, recharging watersheds and aquifers.',
      formalVocabularyMoment: 'Introduce "Hydrological Cycle", "Precipitation", "Transpiration", "Runoff", and "Aquifer" AFTER observing the terrarium precipitation.',
      formalVocabulary: [
        { term: 'Hydrological Cycle', definition: 'The continuous natural circulation of water from Earth\'s surface to the atmosphere and back through phase changes.' },
        { term: 'Precipitation', definition: 'Liquid or frozen water that falls from clouds to Earth\'s surface (rain, drizzle, hail).' },
        { term: 'Runoff', definition: 'Precipitation that flows over the land surface into streams, rivers, and lagoons rather than soaking into soil.' },
        { term: 'Aquifer', definition: 'An underground geological layer of permeable rock, sand, or gravel that holds and conducts groundwater.' }
      ]
    },
    belizeanContext: {
      ecosystemOrLocation: 'Macal and Mopan river watersheds in Cayo, Mountain Pine Ridge headwaters, and household rainwater vats across Belize.',
      communityApplication: 'Protecting forested riverbank buffers (riparian zones) from agricultural clearing to prevent river siltation and preserve clean municipal drinking water for Belize.'
    },
    learningObjectives: {
      condition: 'Given closed terrarium models, watershed cross-sections, and water cycle diagram logs:',
      cognitive: 'Students will trace the stages of the water cycle, explain groundwater recharge, and assess human impacts on Belizean watersheds with at least 80% accuracy.',
      psychomotor: 'Students will construct miniature watershed models, record phase change times, and diagram the four main stages of the water cycle.',
      affective: 'Students will value clean freshwater as a precious national resource, commit to water conservation, and advocate for river protection.',
      successCriteria: [
        'I can identify and define the four main stages of the water cycle (Evaporation, Condensation, Precipitation, Runoff).',
        'I can explain how groundwater is stored in aquifers.',
        'I can describe two ways people in Belize can conserve freshwater.'
      ]
    },
    worksheetQuestions: [
      {
        id: 1,
        questionText: 'Which process in the water cycle involves water vapor cooling and changing into liquid water droplets that form clouds?',
        questionType: 'multiple_choice',
        points: 1,
        options: ['A) Precipitation', 'B) Condensation', 'C) Evaporation', 'D) Transpiration'],
        expectedAnswer: 'B) Condensation',
        markingGuide: '1 mark for selecting B.'
      },
      {
        id: 2,
        questionText: 'What is the primary source of thermal energy that powers the global water cycle?',
        questionType: 'short_answer',
        points: 1,
        expectedAnswer: 'The Sun (solar radiation).',
        markingGuide: '1 mark for The Sun.'
      },
      {
        id: 3,
        questionText: 'Order the four main stages of the water cycle in logical sequence starting from the ocean:\n1. ___________ (Liquid water absorbs heat and turns into vapor)\n2. ___________ (Vapor cools and forms clouds)\n3. ___________ (Water falls as rain)\n4. ___________ (Water flows over land back to rivers/ocean)',
        questionType: 'fill_blank',
        points: 2,
        expectedAnswer: '1. Evaporation, 2. Condensation, 3. Precipitation, 4. Runoff (or Infiltration)',
        markingGuide: '0.5 marks each in order. Total 2 marks.'
      },
      {
        id: 4,
        questionText: 'Explain how plant leaves contribute to the water cycle through transpiration.',
        questionType: 'short_answer',
        points: 1,
        expectedAnswer: 'Plants absorb water through roots and release water vapor into the atmosphere through microscopic pores on leaves (stomata).',
        markingGuide: '1 mark for explaining water release as vapor from leaves.'
      },
      {
        id: 5,
        questionText: 'What is an aquifer, and how do people in rural Belize access water stored in it?',
        questionType: 'short_answer',
        points: 1,
        expectedAnswer: 'An aquifer is an underground layer of rock/sand holding groundwater; people access it by drilling wells and pumping water to the surface.',
        markingGuide: '1 mark for defining underground rock/water layer + wells/pumps.'
      },
      {
        id: 6,
        questionText: 'Why is clearing trees right up to the edge of the Belize River harmful to our freshwater supply?',
        questionType: 'short_answer',
        points: 1,
        expectedAnswer: 'Tree roots hold soil in place. Without trees, rain washes loose soil into the river, creating muddy water, silting riverbeds, and polluting drinking water.',
        markingGuide: '1 mark for explaining soil erosion, river siltation, and water contamination.'
      },
      {
        id: 7,
        questionText: 'Name TWO simple ways a family in Belize can conserve freshwater during the dry season (March–May).',
        questionType: 'short_answer',
        points: 1,
        expectedAnswer: 'Turning off taps while brushing teeth; collecting rainwater in vats/cisterns; reusing greywater for plants; fixing leaking pipes promptly.',
        markingGuide: '1 mark for any two valid conservation practices.'
      },
      {
        id: 8,
        questionText: 'Construct a CER explanation: "Does rain add new water to the planet that never existed before?"',
        questionType: 'cer_explanation',
        points: 2,
        expectedAnswer: 'Claim: No, rain does not add new water to Earth.\nEvidence: In our sealed terrarium investigation, water evaporated, condensed, and rained repeatedly with zero change in total water mass.\nReasoning: Earth operates as a closed system for matter; water molecules cycle continuously through phase changes without being created or destroyed.',
        markingGuide: '2 marks: 1 for claim + evidence; 1 for reasoning on conservation of matter in a closed system.'
      }
    ],
    exitTicketQuestions: [
      {
        id: 1,
        questionText: 'What do we call rain, sleet, or hail that falls from clouds to the ground?\nA) Evaporation\nB) Precipitation\nC) Transpiration\nD) Filtration',
        questionType: 'multiple_choice',
        points: 1,
        options: ['A', 'B', 'C', 'D'],
        expectedAnswer: 'B) Precipitation',
        markingGuide: '1 mark for B.'
      },
      {
        id: 2,
        questionText: 'Name two places where freshwater is stored on Earth in Belize.',
        questionType: 'short_answer',
        points: 2,
        expectedAnswer: 'Rivers (Macal, Belize River), lagoons, rainwater cisterns, underground aquifers/wells.',
        markingGuide: '1 mark each for two valid freshwater reservoirs.'
      },
      {
        id: 3,
        questionText: 'Why is it important to keep household rainwater cisterns covered with fine mesh in Belize?',
        questionType: 'short_answer',
        points: 2,
        expectedAnswer: 'To prevent mosquitoes (which carry dengue and malaria) from breeding in the water and to keep out dirt, leaves, and animal droppings.',
        markingGuide: '1 mark for mosquito prevention; 1 mark for debris/contaminant protection.'
      }
    ],
    differentiation: {
      struggling: {
        support: 'Provide a pre-drawn, large water cycle diagram with empty boxes for students to paste stage name labels (Evaporation, Condensation, Precipitation, Runoff).',
        scaffold: 'Use arrows on a simplified graphic organizer: Up arrow = Evaporation (Sun heat), Cloud = Condensation, Down arrow = Precipitation.',
        visualAid: 'A tabletop terrarium showing real droplets dripping down inside alongside a large color poster.'
      },
      onLevel: {
        task: 'Construct the miniature terrarium model, log phase change observations every 10 minutes, and complete all 8 worksheet questions.',
        independence: 'Builds model in pairs, tracks observations independently, and writes full CER explanation.'
      },
      advanced: {
        extension: 'Map the major watershed basins of Belize (Rio Hondo, Belize River, Monkey River); assess how upstream agricultural runoff in Guatemala affects shared river systems.',
        deeperInquiry: 'Calculate the volume of water captured by a 500-gallon household cistern during a 2-inch tropical rainstorm.'
      }
    }
  },

  // =========================================================================
  // 11. GENERAL SCIENTIFIC INQUIRY & EMPIRICAL INVESTIGATIONS (All Standards)
  // =========================================================================
  scientific_inquiry_general: {
    category: 'scientific_inquiry_general',
    standardLevel: 'Standard 5',
    topicTitle: 'Scientific Inquiry: Fair Testing, Empirical Evidence, and Controlled Investigations',
    focalConcept: 'Investigating Scientific Problems by Controlling Variables, Collecting Data, and Formulating Evidence-Based Explanations (CER)',
    phenomenon: 'Two students drop two identical sheets of paper from a height of 2 meters. One paper is flat and drifts slowly to the floor in 4.2 seconds, while the other paper is crumpled into a tight ball and hits the floor in 0.6 seconds, even though both have the exact same mass.',
    inquiryQuestion: 'How does changing the shape of an object affect air resistance and falling speed, and how do scientists design a fair test to prove it?',
    priorKnowledgeHook: 'Drop Test: Hold a pencil and a textbook at the same height. Drop them at the same time onto a soft pad. Do they hit together? Why?',
    prerequisiteKnowledge: 'In earlier primary grades, students conducted informal observations and exploratory activities. Students have not yet formalized the scientific method of isolating a single independent variable while strictly controlling extraneous variables to design a fair empirical test.',
    diagnosticProbe: 'Fair Test Probe: If you want to find out which brand of paper towel absorbs the most water, can you use different sizes of towels and different amounts of water? What must you keep the same?',
    misconceptions: [
      {
        misconception: 'Heavier objects always fall faster through air than lighter objects regardless of shape.',
        evidenceToEncounter: 'Dropping a heavy flat book vs a light crumpled paper ball: the light crumpled paper hits the floor first because air resistance on the flat book is much higher.',
        scientificReality: 'All objects accelerate at the same rate under gravity in a vacuum; falling speed through air depends on the balance between gravitational force and upward air resistance (surface area).',
        teacherCorrectionPrompt: '"Look at our test: the crumpled paper is lighter than the flat paper, but it fell faster! Why? It has less surface area rubbing against the air."'
      },
      {
        misconception: 'A scientific test is fair even if multiple variables are changed at the same time.',
        evidenceToEncounter: 'Testing two different paper airplanes where both wing length AND paper type are different: you cannot tell which variable caused the longer flight.',
        scientificReality: 'In a fair scientific experiment, only ONE independent variable is changed at a time, while all other controlled variables are kept strictly constant.',
        teacherCorrectionPrompt: '"If you changed two things at once, which one caused the difference? You can\'t tell! That is why we only change one variable at a time."'
      }
    ],
    predictionPrompt: 'I predict that the crumpled paper will fall (faster / slower) than the flat paper because __________________________.',
    investigation: {
      title: 'Controlled Investigation on Surface Area, Air Resistance, and Fall Time',
      investigationType: 'controlled_experiment',
      whatToInvestigate: 'How surface area affects the air resistance force opposing gravity on falling objects, while keeping mass and drop height constant.',
      whatToObserve: 'Drop times (seconds) across 3 repeated trials for flat paper, folded paper (half surface area), and tightly crumpled paper ball.',
      whatToRecord: 'Controlled testing table: Condition | Mass (g) | Drop Height (m) | Trial 1 Time (s) | Trial 2 Time (s) | Trial 3 Time (s) | Average Time (s).',
      evidenceProduced: 'Flat paper averaged 4.1 seconds; folded paper averaged 1.8 seconds; crumpled ball averaged 0.6 seconds. Mass remained 4.5 grams across all conditions.',
      questionAnsweredByEvidence: 'Evidence proves air resistance increases directly with surface area, demonstrating how controlling variables isolates cause-and-effect.',
      materials: [
        'Identical sheets of standard paper',
        'Digital stopwatches or smartphone timers',
        'Meter sticks / measuring tape',
        'Data recording sheets',
        'Science notebooks'
      ],
      isStudentDriven: true
    },
    explanationCER: {
      claim: 'Increasing an object\'s surface area increases upward air resistance, slowing its rate of fall through the atmosphere.',
      evidence: 'The flat paper with full surface area took 4.1 seconds to drop 2 meters, whereas the identical mass crumpled into a compact ball fell in 0.6 seconds.',
      reasoning: 'Falling objects collide with air molecules. A larger surface area strikes more air molecules per second, creating a larger upward drag force opposing gravity and reducing net downward acceleration.',
      formalVocabularyMoment: 'Introduce "Independent Variable", "Controlled Variable", "Air Resistance", and "Fair Test" AFTER timing the drops.',
      formalVocabulary: [
        { term: 'Independent Variable', definition: 'The single factor that the scientist deliberately changes in an experiment to test its effect.' },
        { term: 'Dependent Variable', definition: 'The factor that is measured or observed to see how it responds to changes in the independent variable.' },
        { term: 'Controlled Variable', definition: 'All other factors kept strictly constant throughout an experiment to ensure a fair test.' },
        { term: 'Air Resistance', definition: 'The frictional drag force exerted by air molecules opposing the motion of an object moving through the atmosphere.' }
      ]
    },
    belizeanContext: {
      ecosystemOrLocation: 'Agricultural research at Central Farm (Cayo District), testing crop varieties and pest traps under controlled field plots.',
      communityApplication: 'Designing aerodynamic vehicles, parachute safety, and conducting fair consumer comparisons of products in Belize.'
    },
    learningObjectives: {
      condition: 'Given identical paper sheets, digital stopwatches, measuring tapes, and structured fair-testing logs:',
      cognitive: 'Students will identify independent and controlled variables, measure fall times, and formulate a CER explanation with at least 80% accuracy.',
      psychomotor: 'Students will measure drop heights accurately, operate stopwatches, record multi-trial data, and calculate averages.',
      affective: 'Students will demonstrate scientific integrity, value repeated trials over guesswork, and cooperate respectfully in lab teams.',
      successCriteria: [
        'I can identify the independent variable, dependent variable, and controlled variables in an experiment.',
        'I can conduct repeated trials and calculate an average.',
        'I can write a Claim + Evidence + Reasoning explanation based on my collected data.'
      ]
    },
    worksheetQuestions: [
      {
        id: 1,
        questionText: 'In a fair scientific experiment, how many independent variables should be changed at one time?',
        questionType: 'multiple_choice',
        points: 1,
        options: ['A) Zero', 'B) Only one', 'C) At least three', 'D) As many as possible'],
        expectedAnswer: 'B) Only one',
        markingGuide: '1 mark for selecting B.'
      },
      {
        id: 2,
        questionText: 'What was the DEPENDENT variable (what was measured) in our paper drop investigation?',
        questionType: 'short_answer',
        points: 1,
        expectedAnswer: 'The time taken for the paper to fall to the floor (in seconds).',
        markingGuide: '1 mark for time to fall / drop time in seconds.'
      },
      {
        id: 3,
        questionText: 'Classify each factor in our paper drop experiment as Independent (IV), Dependent (DV), or Controlled (CV):\na) Shape of the paper (flat vs crumpled):\nb) Drop height (2 meters):\nc) Fall time in seconds:\nd) Mass/type of paper:',
        questionType: 'fill_blank',
        points: 2,
        expectedAnswer: 'a) Independent Variable, b) Controlled Variable, c) Dependent Variable, d) Controlled Variable',
        markingGuide: '0.5 marks each. Total 2 marks.'
      },
      {
        id: 4,
        questionText: 'Why do scientists conduct multiple repeated trials (e.g., 3 trials) instead of relying on a single test?',
        questionType: 'short_answer',
        points: 1,
        expectedAnswer: 'To ensure results are reliable, identify human timing errors or anomalies, and calculate a trustworthy average.',
        markingGuide: '1 mark for citing reliability, catching errors, or calculating a valid average.'
      },
      {
        id: 5,
        questionText: 'If Trial 1 was 4.0s, Trial 2 was 4.2s, and Trial 3 was 4.4s, calculate the average fall time. Show your work.',
        questionType: 'short_answer',
        points: 1,
        expectedAnswer: '(4.0 + 4.2 + 4.4) / 3 = 12.6 / 3 = 4.2 seconds.',
        markingGuide: '1 mark for correct calculation: 4.2 seconds.'
      },
      {
        id: 6,
        questionText: 'Explain why a skydiver in Belize uses a large parachute to land safely rather than jumping with a small handkerchief.',
        questionType: 'short_answer',
        points: 1,
        expectedAnswer: 'The large parachute has a huge surface area that catches more air molecules, creating strong upward air resistance to slow the falling speed to a safe rate.',
        markingGuide: '1 mark for linking large surface area to high upward air resistance/safe terminal velocity.'
      },
      {
        id: 7,
        questionText: 'A farmer wants to test if a new organic fertilizer increases tomato yield. Describe TWO controlled variables he must keep constant.',
        questionType: 'short_answer',
        points: 1,
        expectedAnswer: 'Amount of water given; amount of sunlight; soil type; type/age of tomato plant; pot size.',
        markingGuide: '1 mark for any two valid controlled variables.'
      },
      {
        id: 8,
        questionText: 'Construct a CER explanation: "How does surface area affect the motion of an object falling through air?"',
        questionType: 'cer_explanation',
        points: 2,
        expectedAnswer: 'Claim: Increasing surface area increases air resistance, which decreases the acceleration and falling speed of an object.\nEvidence: In our test, the flat paper (large area) fell in 4.2s, while the crumpled paper (small area) with identical mass fell in 0.6s.\nReasoning: Greater surface area contacts more air particles per second, exerting a larger upward drag force against gravity.',
        markingGuide: '2 marks: 1 for claim + evidence; 1 for aerodynamic reasoning on drag vs gravity.'
      }
    ],
    exitTicketQuestions: [
      {
        id: 1,
        questionText: 'What is a controlled variable in a science experiment?\nA) The variable that changes unexpectedly\nB) A factor that is kept constant so the test remains fair\nC) The tool used to measure time\nD) The final hypothesis',
        questionType: 'multiple_choice',
        points: 1,
        options: ['A', 'B', 'C', 'D'],
        expectedAnswer: 'B',
        markingGuide: '1 mark for B.'
      },
      {
        id: 2,
        questionText: 'State the three parts of a scientific explanation using the CER framework.',
        questionType: 'short_answer',
        points: 2,
        expectedAnswer: 'Claim, Evidence, Reasoning.',
        markingGuide: '1 mark for 2 parts; 2 marks for all 3: Claim, Evidence, Reasoning.'
      },
      {
        id: 3,
        questionText: 'Why would dropping the flat paper and crumpled paper from different heights make the experiment unfair?',
        questionType: 'short_answer',
        points: 2,
        expectedAnswer: 'Because changing drop height would introduce a second variable, making it impossible to determine if the time difference was caused by paper shape or height.',
        markingGuide: '1 mark for introducing a second variable; 1 mark for invalidating the causal conclusion.'
      }
    ],
    differentiation: {
      struggling: {
        support: 'Provide a pre-printed variable chart with icons: Hand = What I Change (IV), Eye = What I Measure (DV), Lock = What I Keep the Same (CV).',
        scaffold: 'Pair with an on-level peer: one drops the paper while the other operates the digital timer.',
        visualAid: 'A step-by-step visual poster of the Fair Testing rules.'
      },
      onLevel: {
        task: 'Execute three trials per condition, calculate mathematical averages, and complete all 8 worksheet questions independently.',
        independence: 'Conducts drops, measures timing, and formulates CER explanation without teacher prompting.'
      },
      advanced: {
        extension: 'Design a miniature paper parachute with string and a paperclip; test how changing parachute canopy diameter (10 cm vs 20 cm vs 30 cm) alters descent time.',
        deeperInquiry: 'Research Galileo\'s famous Leaning Tower of Pisa experiment and compare vacuum free-fall acceleration with atmospheric terminal velocity.'
      }
    }
  }
};

/**
 * Retrieves the authoritative curriculum pack for a given topic, subtopic, and outcome.
 */
export function getScienceCurriculumPack(
  topic: string = '',
  subtopic: string = '',
  outcome: string = ''
): ScienceCurriculumPack {
  const category = detectScienceTopicCategory(topic, subtopic, outcome);
  return SCIENCE_CURRICULUM_BANKS[category] || SCIENCE_CURRICULUM_BANKS.scientific_inquiry_general;
}
