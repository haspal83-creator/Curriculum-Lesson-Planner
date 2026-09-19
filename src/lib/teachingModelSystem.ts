import { Subject, GradeLevel } from '../types';

export type TeachingModelCategory = 
  | 'direct' 
  | 'inquiry' 
  | 'problem' 
  | 'collaborative' 
  | 'experiential' 
  | 'mastery' 
  | 'discourse' 
  | 'adaptive';

export interface TeachingModelPhaseSpec {
  phaseName: string;
  defaultTimePercent: number; // percentage of total lesson time (0-100)
  teacherRole: string;
  studentRole: string;
  focus: string;
  keyQuestioningStrategy: string;
  formativeCheckFocus: string;
}

export interface TeachingModelDefinition {
  id: string;
  name: string;
  shortName: string;
  category: TeachingModelCategory;
  purpose: string;
  whenAppropriate: string;
  phases: TeachingModelPhaseSpec[];
  teacherRole: string;
  studentRole: string;
  recommendedActivities: string[];
  questioningApproach: string;
  assessmentApproach: string;
  differentiationConsiderations: string;
  subjectAffinities: Subject[];
  cognitiveDemands: ('recall' | 'procedural' | 'conceptual' | 'analytical' | 'evaluative' | 'creative' | 'practical')[];
  idealDurationRange?: { min: number; max: number };
}

export interface TeachingModelDecisionBranch {
  ifDemonstrateUnderstanding: string;
  ifSomeStruggle: string;
  ifManyStruggle: string;
  ifMasteryEarly: string;
}

export interface TeachingModelProfile {
  primaryModel: string;
  supportingModels: string[];
  rationale: string;
  selectionMode?: 'auto' | 'manual' | 'hybrid';
  modelDetails?: {
    purpose: string;
    whenAppropriate: string;
    teacherRole: string;
    studentRole: string;
    recommendedActivities: string[];
    questioningApproach: string;
    assessmentApproach: string;
    differentiationConsiderations: string;
  };
  adaptiveDecisions: TeachingModelDecisionBranch;
  phases: {
    name: string;
    timeAllocation: string;
    teacherAction: string;
    studentAction: string;
    questions: string[];
    materials: string[];
    whatToLookFor: string;
    differentiation: string;
    assessmentCheck: string;
    nextStepGuidance: string;
    adaptiveDecisions?: TeachingModelDecisionBranch;
  }[];
}

// ============================================================================
// THE 20 OFFICIAL TEACHING MODELS REGISTRY
// ============================================================================
export const TEACHING_MODELS_REGISTRY: Record<string, TeachingModelDefinition> = {
  'direct-instruction': {
    id: 'direct-instruction',
    name: 'Direct Instruction',
    shortName: 'Direct Instruction',
    category: 'direct',
    purpose: 'Explicit, structured teaching of new concepts, foundational procedures, and step-by-step cognitive skills with heavy teacher modeling and progressive release.',
    whenAppropriate: 'When students are learning a completely new procedural skill, mathematical algorithm, decoding/phonics rule, scientific formula, or grammar rule requiring unambiguous demonstration.',
    phases: [
      { phaseName: 'Introduction & Hook', defaultTimePercent: 12, teacherRole: 'State explicit objective, connect to prior knowledge, and set the purpose.', studentRole: 'Activate prerequisite schemas, observe target goal.', focus: 'Prerequisite activation & goal framing', keyQuestioningStrategy: 'Diagnostic review questions', formativeCheckFocus: 'Verify readiness for new procedure' },
      { phaseName: 'Teacher Modeling (I Do)', defaultTimePercent: 22, teacherRole: 'Demonstrate step-by-step procedure using concrete-pictorial-abstract representations and explicit think-aloud.', studentRole: 'Observe critically, track cognitive steps, record model in notebooks.', focus: 'Clear demonstration & error avoidance', keyQuestioningStrategy: 'Think-aloud rhetorical and explanatory questions', formativeCheckFocus: 'Note student attention & alignment with modeled steps' },
      { phaseName: 'Think-Aloud & Metacognitive Walkthrough', defaultTimePercent: 12, teacherRole: 'Deconstruct internal decision making, highlight non-examples and common pitfalls.', studentRole: 'Identify why specific choices were made at critical steps.', focus: 'Deconstructing rationale & error pitfalls', keyQuestioningStrategy: 'Why did I choose step A instead of B?', formativeCheckFocus: 'Student articulation of reasoning' },
      { phaseName: 'Guided Practice (We Do)', defaultTimePercent: 24, teacherRole: 'Guide paired/group execution, pose prompt ladders, offer immediate corrective feedback.', studentRole: 'Perform procedural steps collaboratively, justify steps orally with peer.', focus: 'Scaffolded practice with feedback', keyQuestioningStrategy: 'Process checks: What is our next step and why?', formativeCheckFocus: 'Rapid whiteboards or thumbs check on each step' },
      { phaseName: 'Checking for Understanding', defaultTimePercent: 8, teacherRole: 'Conduct mid-lesson hinge check to verify 80%+ independent readiness.', studentRole: 'Complete standalone check problem without teacher cueing.', focus: 'Hinge diagnostic checkpoint', keyQuestioningStrategy: 'Targeted single-step diagnostic questions', formativeCheckFocus: 'Identify who is ready for solo practice vs targeted small group' },
      { phaseName: 'Independent Practice (You Do)', defaultTimePercent: 14, teacherRole: 'Circulate, monitor for accuracy, pull targeted micro-intervention group.', studentRole: 'Solve core problem set autonomously, applying standard rubric.', focus: 'Autonomous fluency & mastery', keyQuestioningStrategy: 'Self-monitoring prompts: How can you verify your answer?', formativeCheckFocus: 'Sample first 3 problems for accuracy' },
      { phaseName: 'Closure & Exit Check', defaultTimePercent: 8, teacherRole: 'Synthesize core rule, administer exit ticket, preview next lesson.', studentRole: 'Articulate key takeaway and complete individual exit ticket.', focus: 'Summary & evidence of mastery', keyQuestioningStrategy: 'Synthesizing exit ticket prompt', formativeCheckFocus: 'Exit ticket mastery percentage' }
    ],
    teacherRole: 'Explicit modeler, clear instructional guide, diagnostic assessor, and precise feedback provider.',
    studentRole: 'Attentive observer, collaborative practitioner, self-monitoring learner, and autonomous problem solver.',
    recommendedActivities: ['Step-by-step worked examples', 'Choral responses', 'Partner problem solving', 'Rapid whiteboard response', 'Differentiated practice sheets', 'Exit tickets'],
    questioningApproach: 'Starts with diagnostic recall, transitions to procedural "How" and "Why" questions, concludes with evaluative synthesis.',
    assessmentApproach: 'Continuous formative checks: choral response, mini-whiteboards, hinge questions, exit tickets, and practice set accuracy.',
    differentiationConsiderations: 'Provide worked example templates and formula anchor charts for struggling learners; offer multi-step non-routine challenge tasks for advanced learners.',
    subjectAffinities: ['Mathematics', 'Language Arts', 'Science and Technology', 'Spanish'],
    cognitiveDemands: ['recall', 'procedural', 'conceptual']
  },

  '5e-instructional-model': {
    id: '5e-instructional-model',
    name: '5E Instructional Model',
    shortName: '5E Model',
    category: 'inquiry',
    purpose: 'Constructivist learning cycle that guides students through engagement, hands-on exploration, concept explanation, deep elaboration, and multi-dimensional evaluation.',
    whenAppropriate: 'When students need to conceptualize natural phenomena, scientific laws, mathematical patterns, or societal cause-and-effect relationships through first-hand discovery.',
    phases: [
      { phaseName: 'Engage', defaultTimePercent: 12, teacherRole: 'Present a puzzling phenomenon, discrepant event, or compelling Belizean scenario to spark curiosity.', studentRole: 'Make observations, ask questions, and formulate initial hypotheses.', focus: 'Spark curiosity & surface preconceptions', keyQuestioningStrategy: 'Open-ended observation prompts: What do you notice? What puzzles you?', formativeCheckFocus: 'Identify prior knowledge and initial misconceptions' },
      { phaseName: 'Explore', defaultTimePercent: 26, teacherRole: 'Provide materials, structure cooperative groups, and observe without prematurely explaining.', studentRole: 'Manipulate materials, collect data, test ideas, and record patterns.', focus: 'Hands-on investigation & shared experience', keyQuestioningStrategy: 'Guiding inquiry prompts: What patterns are emerging in your data?', formativeCheckFocus: 'Check student data collection methods and collaboration' },
      { phaseName: 'Explain', defaultTimePercent: 22, teacherRole: 'Facilitate student reporting, introduce formal academic vocabulary, and clarify core scientific/mathematical concepts.', studentRole: 'Explain findings in own words using evidence, adopt formal terminology.', focus: 'Student articulation & formal concept introduction', keyQuestioningStrategy: 'Evidence-based prompts: What evidence supports your explanation?', formativeCheckFocus: 'Assess alignment between student claims and gathered evidence' },
      { phaseName: 'Elaborate', defaultTimePercent: 26, teacherRole: 'Challenge students to apply the newly acquired concept to a novel Belizean context or real-world problem.', studentRole: 'Extend understanding, solve transfer problems, and construct broader connections.', focus: 'Transfer of concept to novel situations', keyQuestioningStrategy: 'Transfer & application prompts: How does this principle apply to...?', formativeCheckFocus: 'Evaluate conceptual depth during transfer tasks' },
      { phaseName: 'Evaluate', defaultTimePercent: 14, teacherRole: 'Assess student understanding against objective success criteria and facilitate self-reflection.', studentRole: 'Demonstrate understanding through performance task, rubric check, or synthesis writing.', focus: 'Formal evaluation & reflection', keyQuestioningStrategy: 'Self-assessment and evaluative prompts', formativeCheckFocus: 'Diagnostic exit rubric and student self-reflection' }
    ],
    teacherRole: 'Facilitator, inquiry architect, discussion guide, and conceptual synthesizer.',
    studentRole: 'Active investigator, pattern seeker, collaborative researcher, and evidence-based explainer.',
    recommendedActivities: ['Discrepant events / demonstrations', 'Laboratory investigations', 'Data charting', 'Concept mapping', 'Transfer scenario problem sets', 'Rubric-based self-evaluations'],
    questioningApproach: 'Phenomenon-driven questioning moving from descriptive ("What happens?") to causal ("Why does this happen?") to transfer ("Where else would this occur?").',
    assessmentApproach: 'Triangulated assessment: observational checklist during Explore, verbal argumentation in Explain, transfer problem in Elaborate, and rubric in Evaluate.',
    differentiationConsiderations: 'Tiered data recording sheets (pictorial vs tabular); extension challenges requiring mathematical modeling for advanced students.',
    subjectAffinities: ['Science and Technology', 'Mathematics', 'Belizean Studies', 'HFLE'],
    cognitiveDemands: ['conceptual', 'analytical', 'evaluative']
  },

  'inquiry-based-learning': {
    id: 'inquiry-based-learning',
    name: 'Inquiry-Based Learning',
    shortName: 'Inquiry-Based',
    category: 'inquiry',
    purpose: 'Student-centered exploration driven by an overarching driving question, empirical investigation, evidence gathering, and scientific/historical argumentation.',
    whenAppropriate: 'When developing scientific inquiry skills, historical source investigation, data analysis, or critical investigation of environmental/community challenges.',
    phases: [
      { phaseName: 'Driving Question & Hook', defaultTimePercent: 12, teacherRole: 'Introduce authentic driving question and context.', studentRole: 'Deconstruct question, identify what is known and needed.', focus: 'Question framing & curiosity', keyQuestioningStrategy: 'What must we find out to answer this question?', formativeCheckFocus: 'Clarity on investigative target' },
      { phaseName: 'Prediction & Hypothesis Formulation', defaultTimePercent: 14, teacherRole: 'Guide testable prediction framing using "If... then... because...".', studentRole: 'Formulate justified hypotheses based on prior experience.', focus: 'Hypothesis generation', keyQuestioningStrategy: 'What reasoning underpins your prediction?', formativeCheckFocus: 'Testability of student hypotheses' },
      { phaseName: 'Investigation & Evidence Collection', defaultTimePercent: 30, teacherRole: 'Provide sources/equipment, monitor inquiry safety and rigorous recording.', studentRole: 'Execute protocol, gather qualitative/quantitative evidence.', focus: 'Data gathering & empirical testing', keyQuestioningStrategy: 'Is your data sufficient to address the driving question?', formativeCheckFocus: 'Accuracy and validity of gathered evidence' },
      { phaseName: 'Analysis & Sense-Making Discussion', defaultTimePercent: 22, teacherRole: 'Facilitate collaborative sense-making, guide cross-group data comparison.', studentRole: 'Organize data, identify anomalies, engage in academic discourse.', focus: 'Pattern recognition & argumentation', keyQuestioningStrategy: 'Does your evidence support or refute the initial hypothesis?', formativeCheckFocus: 'Quality of evidence-based claims' },
      { phaseName: 'Conclusion & Reflective Synthesis', defaultTimePercent: 22, teacherRole: 'Guide formal conclusion writing and metacognitive reflection on inquiry process.', studentRole: 'Synthesize answer to driving question, reflect on sources of error.', focus: 'Synthesis & metacognition', keyQuestioningStrategy: 'What new questions does this discovery raise?', formativeCheckFocus: 'Conclusion clarity & process reflection' }
    ],
    teacherRole: 'Inquiry coach, critical questioner, safety and protocol monitor.',
    studentRole: 'Investigator, data collector, scientific/historical thinker, evidence analyst.',
    recommendedActivities: ['Source document analysis', 'Hands-on experiments', 'Field surveys', 'Data graphing', 'Hypothesis testing logs', 'Scientific argument posters'],
    questioningApproach: 'Socratic inquiry prompts: "What evidence suggests this?", "What alternative explanation exists?", "How certain are we?"',
    assessmentApproach: 'Inquiry notebooks, evidence evaluation rubrics, hypothesis-conclusion alignment checks.',
    differentiationConsiderations: 'Provide structured investigation templates for emerging researchers; allow open-ended experimental design for advanced students.',
    subjectAffinities: ['Science and Technology', 'Belizean Studies', 'Mathematics', 'Language Arts'],
    cognitiveDemands: ['analytical', 'evaluative', 'conceptual']
  },

  'problem-based-learning': {
    id: 'problem-based-learning',
    name: 'Problem-Based Learning (PBL)',
    shortName: 'Problem-Based',
    category: 'problem',
    purpose: 'Students acquire knowledge and problem-solving strategies by grappling with an ill-structured, authentic real-world challenge or community scenario.',
    whenAppropriate: 'When teaching interdisciplinary problems such as local environmental conservation, community infrastructure, economic decision-making, or public health.',
    phases: [
      { phaseName: 'Problem Presentation & Encounter', defaultTimePercent: 12, teacherRole: 'Present an authentic ill-structured problem scenario situated in Belize.', studentRole: 'Analyze scenario, identify the core dilemma and stakeholders.', focus: 'Problem orientation & empathy', keyQuestioningStrategy: 'Who is impacted and what is at stake?', formativeCheckFocus: 'Accurate problem identification' },
      { phaseName: 'Identify Knowns & Learning Needs', defaultTimePercent: 16, teacherRole: 'Guide "What we know / What we need to learn" chart.', studentRole: 'Categorize existing information and define investigation targets.', focus: 'Needs analysis & goal setting', keyQuestioningStrategy: 'What crucial facts are currently missing?', formativeCheckFocus: 'Relevance of identified learning needs' },
      { phaseName: 'Investigation & Solution Brainstorming', defaultTimePercent: 28, teacherRole: 'Provide research tools, data sets, and scaffold solution criteria.', studentRole: 'Research constraints, generate multiple feasible solution pathways.', focus: 'Research & creative divergence', keyQuestioningStrategy: 'How does this solution meet constraints of budget/time/safety?', formativeCheckFocus: 'Feasibility of proposed solutions' },
      { phaseName: 'Testing & Evaluating Solutions', defaultTimePercent: 22, teacherRole: 'Introduce evaluation matrix and criteria (feasibility, impact, ethics).', studentRole: 'Evaluate trade-offs of each option, select optimal solution.', focus: 'Critical evaluation & trade-off analysis', keyQuestioningStrategy: 'What are the unintended consequences of this plan?', formativeCheckFocus: 'Rigor of criteria-based decision making' },
      { phaseName: 'Solution Pitch & Reflection', defaultTimePercent: 22, teacherRole: 'Facilitate peer review and debrief underlying concepts mastered.', studentRole: 'Present justified solution, field questions, reflect on learning.', focus: 'Presentation & conceptual debrief', keyQuestioningStrategy: 'What would you do differently if constraints changed?', formativeCheckFocus: 'Solution justification and concept retention' }
    ],
    teacherRole: 'Facilitator, scenario architect, cognitive coach, resource curator.',
    studentRole: 'Problem solver, active researcher, collaborator, critical decision maker.',
    recommendedActivities: ['Authentic case study analysis', 'Stakeholder role-play', 'Cost-benefit analysis grids', 'Solution pitch presentations', 'Peer review circles'],
    questioningApproach: 'Divergent questioning: "What if...?", "How might we...?", "Which trade-off is most acceptable?"',
    assessmentApproach: 'Solution feasibility rubrics, peer presentation evaluations, individual reflection journals.',
    differentiationConsiderations: 'Pre-populate research summaries for reading support; challenge advanced teams with tighter real-world constraints.',
    subjectAffinities: ['Belizean Studies', 'Science and Technology', 'Mathematics', 'HFLE'],
    cognitiveDemands: ['analytical', 'creative', 'evaluative']
  },

  'project-based-learning': {
    id: 'project-based-learning',
    name: 'Project-Based Learning',
    shortName: 'Project-Based',
    category: 'problem',
    purpose: 'Students gain knowledge and skills by working over an extended period to investigate and respond to an authentic, engaging, and complex question, problem, or challenge.',
    whenAppropriate: 'When the objective involves creating a tangible artifact, comprehensive research portfolio, community awareness campaign, or functional design.',
    phases: [
      { phaseName: 'Driving Question & Project Launch', defaultTimePercent: 12, teacherRole: 'Launch project challenge and showcase rubric criteria.', studentRole: 'Deconstruct driving question and study benchmark exemplar.', focus: 'Vision setting & criteria clarity', keyQuestioningStrategy: 'What will a high-quality final product look like?', formativeCheckFocus: 'Understanding of project milestone rubric' },
      { phaseName: 'Project Planning & Task Allocation', defaultTimePercent: 16, teacherRole: 'Guide project management, task delegation, and timeline creation.', studentRole: 'Create team charter, assign responsibilities, and outline steps.', focus: 'Planning & workflow distribution', keyQuestioningStrategy: 'How will your team ensure all members contribute equally?', formativeCheckFocus: 'Team work plan viability' },
      { phaseName: 'Investigation & Research', defaultTimePercent: 24, teacherRole: 'Facilitate access to authentic resources, conduct mini-lessons on needed skills.', studentRole: 'Gather evidence, consult sources, conduct interviews/surveys.', focus: 'Information synthesis & skill development', keyQuestioningStrategy: 'How does this research inform your design?', formativeCheckFocus: 'Research log completeness and validity' },
      { phaseName: 'Creation & Prototyping', defaultTimePercent: 26, teacherRole: 'Provide workstation materials, guide iterative prototyping.', studentRole: 'Build, write, code, or construct draft project artifact.', focus: 'Hands-on construction & application', keyQuestioningStrategy: 'How does this prototype meet your stated criteria?', formativeCheckFocus: 'Alignment with quality rubric' },
      { phaseName: 'Critique, Revision & Presentation', defaultTimePercent: 22, teacherRole: 'Structure formal peer review (Warm & Cool feedback) and celebration.', studentRole: 'Exchange constructive feedback, polish artifact, share with audience.', focus: 'Iterative refinement & exhibition', keyQuestioningStrategy: 'How did peer feedback improve your final output?', formativeCheckFocus: 'Final product rubric and presentation effectiveness' }
    ],
    teacherRole: 'Project manager, facilitator, skill mini-lesson instructor, evaluator.',
    studentRole: 'Project designer, creator, collaborative team member, public presenter.',
    recommendedActivities: ['Design sprints', 'Gallery walks', 'Drafting and redrafting', 'Peer critique tuning protocols', 'Public exhibitions'],
    questioningApproach: 'Design-thinking questions: "How might we improve this?", "What does our user need?", "Does this meet our standard of excellence?"',
    assessmentApproach: 'Milestone rubrics, peer critique protocols, final product exhibition scoring.',
    differentiationConsiderations: 'Offer flexible product modalities (video, physical model, written report, oral presentation); provide structured timeline checkpoints.',
    subjectAffinities: ['Creative Arts', 'Science and Technology', 'Belizean Studies', 'Language Arts'],
    cognitiveDemands: ['creative', 'analytical', 'procedural', 'evaluative']
  },

  'cooperative-learning': {
    id: 'cooperative-learning',
    name: 'Cooperative Learning',
    shortName: 'Cooperative Learning',
    category: 'collaborative',
    purpose: 'Students work together in small, structured teams to maximize their own and each other’s learning through positive interdependence and individual accountability.',
    whenAppropriate: 'When learning requires peer elaboration, collaborative problem solving, jigsaw reading, group research, or developing interpersonal communication skills.',
    phases: [
      { phaseName: 'Clear Group Objective & Norms', defaultTimePercent: 12, teacherRole: 'Explain academic objective, cooperative social skill, and group criteria.', studentRole: 'Review group target and commit to collaborative social norms.', focus: 'Task framing & cooperative expectations', keyQuestioningStrategy: 'What does active listening look and sound like in our groups?', formativeCheckFocus: 'Clarity on task and behavioral expectations' },
      { phaseName: 'Group Formation & Role Assignment', defaultTimePercent: 12, teacherRole: 'Assign heterogeneous groups and defined roles (Leader, Scribe, Timekeeper, Presenter).', studentRole: 'Assume assigned roles, understand specific responsibilities.', focus: 'Role clarity & positive interdependence', keyQuestioningStrategy: 'What is your specific responsibility to your teammates?', formativeCheckFocus: 'Role adoption across all teams' },
      { phaseName: 'Individual Accountability Check', defaultTimePercent: 14, teacherRole: 'Provide brief individual preparation or reading prior to group work.', studentRole: 'Engage with source material independently to prepare contributions.', focus: 'Solo preparation & no freeloading', keyQuestioningStrategy: 'What unique insight are you bringing to your group?', formativeCheckFocus: 'Individual notes or starter sheet' },
      { phaseName: 'Collaborative Task Execution', defaultTimePercent: 32, teacherRole: 'Circulate, monitor group dynamics, prompt deeper discussion without dominating.', studentRole: 'Synthesize individual ideas, debate respectfully, build shared artifact.', focus: 'Joint meaning-making & consensus', keyQuestioningStrategy: 'Has every team member agreed with this step and can explain why?', formativeCheckFocus: 'Equal participation and discussion quality' },
      { phaseName: 'Sharing & Plenary Processing', defaultTimePercent: 16, teacherRole: 'Facilitate jigsaw, numbered heads together, or gallery walk sharing.', studentRole: 'Report team findings, take notes on other teams’ discoveries.', focus: 'Cross-group knowledge dissemination', keyQuestioningStrategy: 'How does team B’s conclusion compare with team A’s?', formativeCheckFocus: 'Plenary check of key concept retention' },
      { phaseName: 'Group Processing & Reflection', defaultTimePercent: 14, teacherRole: 'Guide reflection on both academic achievement and cooperative effectiveness.', studentRole: 'Assess group performance: "What did we do well? What could we improve?"', focus: 'Metacognitive team evaluation', keyQuestioningStrategy: 'How effectively did your team support each member’s learning?', formativeCheckFocus: 'Team self-evaluation logs' }
    ],
    teacherRole: 'Architect of positive interdependence, facilitator, group dynamic monitor.',
    studentRole: 'Active team contributor, peer teacher, listener, accountable collaborator.',
    recommendedActivities: ['Jigsaw reading', 'Numbered Heads Together', 'Think-Pair-Share', 'Round Robin Brainstorming', 'Fishbowl discussions'],
    questioningApproach: 'Consensus-seeking prompts: "Does everyone agree?", "Can you explain your partner’s reasoning?", "How did your team resolve that disagreement?"',
    assessmentApproach: 'Dual assessment: group product rubric + individual quiz/exit ticket to verify individual mastery.',
    differentiationConsiderations: 'Strategically assign roles matched to student strengths; provide sentence frames for academic discourse in mixed-readiness groups.',
    subjectAffinities: ['Language Arts', 'Mathematics', 'Belizean Studies', 'HFLE', 'Science and Technology'],
    cognitiveDemands: ['conceptual', 'analytical', 'evaluative']
  },

  'discovery-learning': {
    id: 'discovery-learning',
    name: 'Discovery Learning',
    shortName: 'Discovery Learning',
    category: 'inquiry',
    purpose: 'Students uncover rules, mathematical patterns, or principles autonomously by interacting with their environment, manipulating objects, or wrestling with questions.',
    whenAppropriate: 'When geometric formulas, linguistic rules, ecological relationships, or algebraic generalizations can be noticed through inductive observation.',
    phases: [
      { phaseName: 'Present Examples & Raw Materials', defaultTimePercent: 14, teacherRole: 'Provide rich, diverse sets of examples, data tables, or manipulatives.', studentRole: 'Explore objects/data freely, make sensory observations.', focus: 'Initial sensory & observational contact', keyQuestioningStrategy: 'What do you notice about these different examples?', formativeCheckFocus: 'Student curiosity and open observation' },
      { phaseName: 'Student Exploration & Testing', defaultTimePercent: 28, teacherRole: 'Encourage experimentation, record student questions without giving answers away.', studentRole: 'Sort, group, measure, and manipulate materials in search of order.', focus: 'Active experimentation & trial', keyQuestioningStrategy: 'What happens if you sort them by dimension or category?', formativeCheckFocus: 'Systematic exploration strategies' },
      { phaseName: 'Pattern Identification & Invariance', defaultTimePercent: 22, teacherRole: 'Direct attention to recurring invariances or relationships.', studentRole: 'Notice what stays constant across varied conditions.', focus: 'Pattern recognition & generalization', keyQuestioningStrategy: 'What rule or pattern seems to hold true for all of them?', formativeCheckFocus: 'Accuracy of student-identified patterns' },
      { phaseName: 'Formal Concept Formulation', defaultTimePercent: 18, teacherRole: 'Connect student discoveries to official mathematical or scientific terminology.', studentRole: 'Articulate the discovered rule in standard academic terms.', focus: 'Formalizing the discovery', keyQuestioningStrategy: 'How does our rule compare with the official textbook formula?', formativeCheckFocus: 'Grasp of formal definition' },
      { phaseName: 'Application to Non-Examples & Extensions', defaultTimePercent: 18, teacherRole: 'Provide boundary cases and non-examples to test rule robustness.', studentRole: 'Apply discovered rule to solve novel problems and justify limits.', focus: 'Boundary testing & consolidation', keyQuestioningStrategy: 'Does our rule apply to this edge case? Why or why not?', formativeCheckFocus: 'Exit application accuracy' }
    ],
    teacherRole: 'Curator of experience, provocative prompter, validator of discoveries.',
    studentRole: 'Explorer, pattern detector, inductive thinker, hypothesis tester.',
    recommendedActivities: ['Inductive data sorting', 'Geometric shape manipulation', 'Sentence pattern dissection', 'Mystery bags / mystery charts', 'Inductive formula derivation'],
    questioningApproach: 'Inductive prompts: "What do all of these have in common?", "What changes and what stays the same?", "Can you state a rule?"',
    assessmentApproach: 'Discovery journals, explanation of underlying rules, application to counterexamples.',
    differentiationConsiderations: 'Provide fewer variables for students needing scaffolding; offer complex data sets with outliers for high flyers.',
    subjectAffinities: ['Mathematics', 'Science and Technology', 'Language Arts'],
    cognitiveDemands: ['conceptual', 'analytical']
  },

  'guided-discovery': {
    id: 'guided-discovery',
    name: 'Guided Discovery',
    shortName: 'Guided Discovery',
    category: 'inquiry',
    purpose: 'A carefully scaffolded form of discovery where the teacher uses a sequenced hierarchy of questions and curated examples to guide students to deduce the target concept.',
    whenAppropriate: 'When discovering complex mathematical rules, grammatical patterns, or scientific principles where unguided exploration could lead to frustration or misconceptions.',
    phases: [
      { phaseName: 'Curated Example Sequence', defaultTimePercent: 14, teacherRole: 'Present carefully ordered examples and non-examples with controlled variables.', studentRole: 'Compare pairs of examples, note salient distinctions.', focus: 'Controlled contrast & observation', keyQuestioningStrategy: 'Look at Example 1 and Example 2: What is the single difference?', formativeCheckFocus: 'Identification of critical attributes' },
      { phaseName: 'Guided Questioning Ladder', defaultTimePercent: 26, teacherRole: 'Pose deliberate scaffolded questions guiding students step-by-step toward the rule.', studentRole: 'Follow logical questioning chain, test hypotheses collaboratively.', focus: 'Convergent cognitive progression', keyQuestioningStrategy: 'If this changes by 2, what must happen to that side?', formativeCheckFocus: 'Responses to key hinge questions' },
      { phaseName: 'Student Articulation of the Rule', defaultTimePercent: 22, teacherRole: 'Withhold the final answer; prompt students to verbalize the rule in their own words.', studentRole: 'State the emerging principle and defend it using the evidence provided.', focus: 'Student voice in rule definition', keyQuestioningStrategy: 'Can you formulate our class rule in one concise sentence?', formativeCheckFocus: 'Conceptual precision of student rule' },
      { phaseName: 'Formalization & Teacher Anchor', defaultTimePercent: 18, teacherRole: 'Anchor student rule with formal academic notation, vocabulary, and visual chart.', studentRole: 'Record anchor chart in notebooks, align own wording with academic terms.', focus: 'Academic standardization', keyQuestioningStrategy: 'How does our word connect to the formal term?', formativeCheckFocus: 'Anchor chart comprehension' },
      { phaseName: 'Guided & Independent Transfer', defaultTimePercent: 20, teacherRole: 'Provide graded practice starting with simple application moving to complex.', studentRole: 'Solve transfer problems using newly deduced principle.', focus: 'Transfer & procedural consolidation', keyQuestioningStrategy: 'How did our discovered rule help you solve this faster?', formativeCheckFocus: 'Transfer accuracy on exit challenge' }
    ],
    teacherRole: 'Guide on the side with a clear destination, strategic questioner, anchor creator.',
    studentRole: 'Detective, logical thinker, rule formulator, active respondent.',
    recommendedActivities: ['Concept attainment tables', 'Pattern grids', 'Side-by-side contrasting cases', 'Guided sentence combining', 'Stepwise formula deduction'],
    questioningApproach: 'Convergent, strategic questioning designed to channel thinking toward the core principle without spoon-feeding.',
    assessmentApproach: 'Verbal articulation rubrics, concept attainment accuracy checks, written rule justifications.',
    differentiationConsiderations: 'Use color-coding on examples to highlight critical attributes for visual learners; challenge advanced students to write proof/justification.',
    subjectAffinities: ['Mathematics', 'Language Arts', 'Science and Technology', 'Spanish'],
    cognitiveDemands: ['conceptual', 'analytical', 'procedural']
  },

  'demonstration-model': {
    id: 'demonstration-model',
    name: 'Demonstration Model',
    shortName: 'Demonstration',
    category: 'direct',
    purpose: 'The teacher shows an exact skill, dangerous experiment, technical procedure, or artistic technique, making thoughts and actions explicit before students emulate.',
    whenAppropriate: 'When teaching physical education skills, science laboratory safety/procedures, artistic techniques, handwriting, or specialized vocational tasks.',
    phases: [
      { phaseName: 'Explain Purpose & Safety Standards', defaultTimePercent: 12, teacherRole: 'State purpose, safety precautions, and display assessment criteria rubric.', studentRole: 'Review safety standards and focus on key performance indicators.', focus: 'Context, safety & criteria', keyQuestioningStrategy: 'Why is this safety rule non-negotiable?', formativeCheckFocus: 'Safety check and readiness' },
      { phaseName: 'Silent & Masterful Demonstration', defaultTimePercent: 16, teacherRole: 'Execute the skill at normal speed so students see the complete fluent performance.', studentRole: 'Observe overall flow, posture, and rhythm without taking notes.', focus: 'Holistic mental model of the skill', keyQuestioningStrategy: 'What was your primary impression of the overall flow?', formativeCheckFocus: 'Attentive observational posture' },
      { phaseName: 'Slow Breakdown with Think-Aloud', defaultTimePercent: 26, teacherRole: 'Repeat demonstration slowly, pausing at critical checkpoints to explain biomechanics/thought process.', studentRole: 'Annotate step-by-step checklist, mimic key hand/body positions.', focus: 'Analytical decomposition of steps', keyQuestioningStrategy: 'Notice where my balance is: Why is foot placement crucial here?', formativeCheckFocus: 'Comprehension of critical micro-steps' },
      { phaseName: 'Guided Student Re-Demonstration', defaultTimePercent: 24, teacherRole: 'Invite a student volunteer or pair to perform under direct guidance, coaching live.', studentRole: 'Class evaluates peer execution against checklist, volunteer performs.', focus: 'Peer modeling & live coaching', keyQuestioningStrategy: 'Class: Did step 2 meet the checklist standard? What adjustment is needed?', formativeCheckFocus: 'Live correction of emergent errors' },
      { phaseName: 'Small Group / Independent Performance', defaultTimePercent: 14, teacherRole: 'Circulate with observational rubric, provide immediate targeted tactile/verbal coaching.', studentRole: 'Practice skill repeatedly in pairs or stations, giving peer feedback.', focus: 'Kinesthetic/procedural rehearsal', keyQuestioningStrategy: 'How did that repetition feel compared to the modeled standard?', formativeCheckFocus: 'Rubric performance ratings' },
      { phaseName: 'Feedback & Performance Debrief', defaultTimePercent: 8, teacherRole: 'Highlight common technical strengths and correct class-wide tendencies.', studentRole: 'Perform final benchmark execution and record personal reflection.', focus: 'Synthesizing performance feedback', keyQuestioningStrategy: 'What one cue will you remember for next time?', formativeCheckFocus: 'Final benchmark performance check' }
    ],
    teacherRole: 'Master practitioner, demonstrator, biomechanical/technical coach.',
    studentRole: 'Keen observer, checklist tracker, apprentice practitioner, peer evaluator.',
    recommendedActivities: ['Live physical modeling', 'Slow-motion replay analysis', 'Peer coaching with checklists', 'Station drills', 'Safety protocol walkthroughs'],
    questioningApproach: 'Sensory and technical prompts: "What angle did you notice?", "Where did the force originate?", "What cue tells you it is correct?"',
    assessmentApproach: 'Performance rubric observation, checklist completion, peer evaluation scorecards.',
    differentiationConsiderations: 'Break physical movements into smaller substeps with tactile guides; provide advanced students with complex sequence variations.',
    subjectAffinities: ['PE', 'Creative Arts', 'Science and Technology', 'HFLE'],
    cognitiveDemands: ['practical', 'procedural', 'recall']
  },

  'experiential-learning': {
    id: 'experiential-learning',
    name: 'Experiential Learning',
    shortName: 'Experiential',
    category: 'experiential',
    purpose: 'Kolb’s four-stage cycle where learning occurs through concrete experience, reflective observation, abstract conceptualization, and active experimentation.',
    whenAppropriate: 'Field trips, simulations, community engagement, environmental nature walks, mock trials, role-plays, and life-skills learning.',
    phases: [
      { phaseName: 'Concrete Experience (Do)', defaultTimePercent: 30, teacherRole: 'Set up immersive simulation, outdoor field walk, role-play, or sensory immersion.', studentRole: 'Immerse fully in the experience, engage senses, participate actively.', focus: 'Direct sensory immersion & engagement', keyQuestioningStrategy: 'Engage fully without intellectualizing yet: What are you experiencing right now?', formativeCheckFocus: 'Active participation across all learners' },
      { phaseName: 'Reflective Observation (Reflect)', defaultTimePercent: 24, teacherRole: 'Structure quiet journal reflection and small-group sharing of experiences.', studentRole: 'Write or draw reflections: "What happened? How did I feel? What surprised me?"', focus: 'Honest personal observation & debrief', keyQuestioningStrategy: 'What was the most unexpected moment in that experience?', formativeCheckFocus: 'Depth of reflective observations' },
      { phaseName: 'Abstract Conceptualization (Think)', defaultTimePercent: 24, teacherRole: 'Guide students to connect their personal reflections to broader academic theories/concepts.', studentRole: 'Formulate generalizations, identify systemic causes, build conceptual models.', focus: 'Theory building & generalization', keyQuestioningStrategy: 'How does our personal experience illustrate the broader social/ecological principle?', formativeCheckFocus: 'Accuracy of conceptual connections' },
      { phaseName: 'Active Experimentation (Apply)', defaultTimePercent: 22, teacherRole: 'Challenge students to use newly conceptualized insights to test a new action or plan.', studentRole: 'Design a modified strategy, community action plan, or testable experiment.', focus: 'Future action & transfer', keyQuestioningStrategy: 'If you faced this scenario tomorrow in Belize, how would your action change?', formativeCheckFocus: 'Practicality of forward action plan' }
    ],
    teacherRole: 'Experience designer, facilitator, reflective questioner, theory bridge builder.',
    studentRole: 'Experiencer, reflective observer, theorist, proactive decision maker.',
    recommendedActivities: ['Nature walks / field studies', 'Mock market / simulation games', 'Role-play dilemmas', 'Reflective sensory journaling', 'Action-planning workshops'],
    questioningApproach: 'Kolb cycle prompts: "What happened?", "So what does this mean?", "Now what will we do?"',
    assessmentApproach: 'Reflective journals, debrief discussion participation, transfer action plans.',
    differentiationConsiderations: 'Offer oral or visual reflection modalities for students struggling with written reflection; encourage multi-perspective analysis for advanced thinkers.',
    subjectAffinities: ['Belizean Studies', 'HFLE', 'Science and Technology', 'PE', 'Creative Arts'],
    cognitiveDemands: ['conceptual', 'analytical', 'evaluative', 'practical']
  },

  'discussion-based-learning': {
    id: 'discussion-based-learning',
    name: 'Discussion-Based Learning',
    shortName: 'Discussion-Based',
    category: 'discourse',
    purpose: 'Students develop critical thinking, listening, and argumentative communication skills through structured, text-grounded or dilemma-based intellectual discourse.',
    whenAppropriate: 'When analyzing literature, ethical dilemmas in health/HFLE, controversial historical events in Belize, or competing interpretations of a text.',
    phases: [
      { phaseName: 'Text / Dilemma Encounter & Annotation', defaultTimePercent: 18, teacherRole: 'Provide compelling text, data excerpt, or moral dilemma with focus question.', studentRole: 'Read actively, mark evidence, formulate initial personal stance.', focus: 'Source grounding & preparation', keyQuestioningStrategy: 'What sentence or evidence in the text triggers the strongest reaction?', formativeCheckFocus: 'Evidence of pre-discussion annotation' },
      { phaseName: 'Protocol & Discussion Norms Framing', defaultTimePercent: 10, teacherRole: 'Review accountable talk stems ("I agree because...", "What evidence supports...").', studentRole: 'Commit to discussion rubric: speak once before anyone speaks twice, refer to text.', focus: 'Equitable discourse norms', keyQuestioningStrategy: 'How will we ensure diverse viewpoints are respected today?', formativeCheckFocus: 'Norms internalization' },
      { phaseName: 'Structured Group Discussion', defaultTimePercent: 44, teacherRole: 'Step back to outer ring, track speaking turns and evidence citations, intervene only to redirect.', studentRole: 'Build on peer ideas, challenge assumptions respectfully, cite text evidence.', focus: 'Autonomous academic dialogue', keyQuestioningStrategy: 'Who has an alternative reading of this passage? What evidence supports it?', formativeCheckFocus: 'Discussion tracker: evidence citations & inclusivity' },
      { phaseName: 'Synthesis & Argument Mapping', defaultTimePercent: 14, teacherRole: 'Facilitate charting of main arguments, counter-arguments, and shared consensus.', studentRole: 'Summarize key perspectives and identify where consensus or division remains.', focus: 'Synthesizing divergent perspectives', keyQuestioningStrategy: 'What was the strongest counter-argument raised today?', formativeCheckFocus: 'Argument map completeness' },
      { phaseName: 'Individual Written Reflection', defaultTimePercent: 14, teacherRole: 'Administer final reflective prompt: "How did this discussion shift or refine your thinking?"', studentRole: 'Write synthesized stance citing discussion contributions and text evidence.', focus: 'Individual cognitive consolidation', keyQuestioningStrategy: 'How has your viewpoint evolved since the start of class?', formativeCheckFocus: 'Quality of written synthesis' }
    ],
    teacherRole: 'Discussion architect, neutral facilitator, discussion tracker, synthesist.',
    studentRole: 'Active listener, evidence-based speaker, critical questioner, respectful synthesizer.',
    recommendedActivities: ['Harkness discussions', 'Fishbowl seminars', 'Philosophical Chairs', 'Four Corners debate', 'Paired dialogue journals'],
    questioningApproach: 'Open-ended, text-dependent, and probing questions: "What in the text led you to that conclusion?", "How do you reconcile that with what Maria noted?"',
    assessmentApproach: 'Discussion tracking matrix (citations, active listening, turn balance), written reflection rubrics.',
    differentiationConsiderations: 'Provide discussion sentence starters and quiet thinking time before speaking; assign specific roles (e.g., tracker, paraphraser) to build confidence.',
    subjectAffinities: ['Language Arts', 'Belizean Studies', 'HFLE', 'Spanish'],
    cognitiveDemands: ['analytical', 'evaluative', 'conceptual']
  },

  'differentiated-instruction': {
    id: 'differentiated-instruction',
    name: 'Differentiated Instruction',
    shortName: 'Differentiated',
    category: 'adaptive',
    purpose: 'Proactively tailoring content, process, products, or learning environment to meet the diverse readiness levels, interests, and learning profiles of all students in the classroom.',
    whenAppropriate: 'When teaching mixed-ability classrooms with wide variances in reading comprehension, mathematical fluency, language background (e.g. ESL/Creole speakers), or special needs.',
    phases: [
      { phaseName: 'Universal Launch & Diagnostic Readiness Check', defaultTimePercent: 14, teacherRole: 'Deliver unified core concept hook and conduct a rapid diagnostic readiness check.', studentRole: 'Participate in common hook, complete 2-minute diagnostic check.', focus: 'Inclusive launch & rapid grouping', keyQuestioningStrategy: 'Diagnostic check: Select prompt Level A, B, or C.', formativeCheckFocus: 'Accurate tiered routing of students' },
      { phaseName: 'Tiered Task Routing & Station Transition', defaultTimePercent: 10, teacherRole: 'Direct students to predetermined tiered workstations (Tier 1: Scaffolding, Tier 2: Core, Tier 3: Extension).', studentRole: 'Transition swiftly to designated workstation with clear task cards.', focus: 'Smooth transition & task clarity', keyQuestioningStrategy: 'Does every group have their specific success rubric?', formativeCheckFocus: 'Transition efficiency and task engagement' },
      { phaseName: 'Differentiated Work Session & Targeted Small Group', defaultTimePercent: 46, teacherRole: 'Conduct intensive guided mini-lesson with Tier 1; circulate and monitor Tier 2 and Tier 3.', studentRole: 'Engage in content matched to zone of proximal development with tiered scaffolds.', focus: 'Targeted instruction & appropriate challenge', keyQuestioningStrategy: 'Tier-specific prompts: Scaffolding cues vs Extension depth prompts.', formativeCheckFocus: 'Targeted group progress and independent tier productivity' },
      { phaseName: 'Cross-Tier Synthesis & Peer Sharing', defaultTimePercent: 16, teacherRole: 'Pair students across tiers to share insights and communicate shared core concept.', studentRole: 'Articulate core concept using varied representations with peer.', focus: 'Universal consolidation without stigma', keyQuestioningStrategy: 'How does your solution method connect to your partner’s approach?', formativeCheckFocus: 'Equal grasp of universal core standard' },
      { phaseName: 'Tiered Exit Ticket & Diagnostic Tracking', defaultTimePercent: 14, teacherRole: 'Administer tiered exit tickets with universal core + optional challenge.', studentRole: 'Complete exit ticket demonstrating mastery of the common standard.', focus: 'Data-driven evaluation of growth', keyQuestioningStrategy: 'Core standard check + extension bonus prompt', formativeCheckFocus: 'Mastery rate across all readiness tiers' }
    ],
    teacherRole: 'Diagnostic evaluator, small-group instructor, resource tiering architect.',
    studentRole: 'Autonomous learner, self-evaluator, collaborative peer, focused practitioner.',
    recommendedActivities: ['Tiered task cards', 'Choice boards / Tic-Tac-Toe menus', 'Flexible small-group clinics', 'Anchor activities', 'Learning menus'],
    questioningApproach: 'Tiered questioning calibrated to Blooms: Remembering/Understanding for Tier 1, Applying/Analyzing for Tier 2, Evaluating/Creating for Tier 3.',
    assessmentApproach: 'Pre-assessment readiness diagnostics, tiered formative checkpoints, growth-oriented rubrics.',
    differentiationConsiderations: 'Ensure all tiers address the identical core competency; avoid giving advanced students "more of the same" busywork; provide respectful tasks across all levels.',
    subjectAffinities: ['Mathematics', 'Language Arts', 'Science and Technology', 'Belizean Studies', 'Spanish'],
    cognitiveDemands: ['procedural', 'conceptual', 'analytical', 'creative']
  },

  'scaffolding': {
    id: 'scaffolding',
    name: 'Scaffolding Model',
    shortName: 'Scaffolding',
    category: 'adaptive',
    purpose: 'Systematic temporary supports installed to enable students to complete tasks just beyond their independent capacity, gradually removed as competence grows.',
    whenAppropriate: 'When students tackle demanding text analysis, multi-step math problem solving, academic writing, or complex lab procedures.',
    phases: [
      { phaseName: 'Heavy Scaffold Demonstration', defaultTimePercent: 20, teacherRole: 'Provide high-support anchors: graphic organizers, sentence stems, and full teacher modeling.', studentRole: 'Follow model closely, fill in pre-structured templates.', focus: 'High support & maximum cognitive safety', keyQuestioningStrategy: 'How does this graphic organizer help us order our thinking?', formativeCheckFocus: 'Accurate tool adoption' },
      { phaseName: 'Faded Scaffold Guided Practice', defaultTimePercent: 26, teacherRole: 'Partially remove cues (e.g. provide partial organizer, sentence starters instead of full frames).', studentRole: 'Work in pairs, supplying missing steps without full teacher prompts.', focus: 'Partial independence & collaborative transfer', keyQuestioningStrategy: 'What step can we now do without looking at the template?', formativeCheckFocus: 'Peer problem-solving accuracy with reduced cues' },
      { phaseName: 'Light Scaffold Peer Execution', defaultTimePercent: 26, teacherRole: 'Provide minimal reference cue (e.g. a 3-word mnemonic or anchor chart).', studentRole: 'Execute independently with only anchor chart available as reference.', focus: 'Emerging autonomy', keyQuestioningStrategy: 'Where on the anchor chart can you check your own work?', formativeCheckFocus: 'Independence level and self-correction' },
      { phaseName: 'Independent Mastery Check (Zero Scaffold)', defaultTimePercent: 16, teacherRole: 'Remove all external supports to evaluate unassisted student competence.', studentRole: 'Complete target task completely independently on blank page.', focus: 'Unassisted fluency & true mastery', keyQuestioningStrategy: 'Perform task cleanly without prompt sheets.', formativeCheckFocus: 'Unassisted accuracy on core objective' },
      { phaseName: 'Metacognitive Reflection on Growth', defaultTimePercent: 12, teacherRole: 'Guide reflection on how student competence grew from scaffolded to independent.', studentRole: 'Recognize self-growth and internalize self-cueing strategies for future tasks.', focus: 'Metacognitive internalization', keyQuestioningStrategy: 'What self-cue will you use when you see this task on a test?', formativeCheckFocus: 'Articulated internal strategy' }
    ],
    teacherRole: 'Support engineer, gradual release monitor, diagnostic coach.',
    studentRole: 'Supported apprentice, active bridge crosser, autonomous problem solver.',
    recommendedActivities: ['Faded worked examples', 'Sentence stems to paragraph writing', 'Graphic organizer fading', 'Checklist transitions', 'Think-aloud coaching'],
    questioningApproach: 'Prompting hierarchy: starts with direct verbal cues, transitions to reflective questions, ends with self-regulatory questions.',
    assessmentApproach: 'Measuring distance from scaffolded performance to unassisted performance; tracking error reduction across fading stages.',
    differentiationConsiderations: 'Keep scaffolds accessible for students who need longer transition times; immediately fade scaffolds for students showing early fluency.',
    subjectAffinities: ['Language Arts', 'Mathematics', 'Science and Technology', 'Spanish'],
    cognitiveDemands: ['procedural', 'conceptual', 'analytical']
  },

  'mastery-learning': {
    id: 'mastery-learning',
    name: 'Mastery Learning',
    shortName: 'Mastery Learning',
    category: 'mastery',
    purpose: 'Instruction organized around explicit criterion-referenced units where students must achieve a high standard of mastery (e.g. 80-85%) before proceeding, supported by corrective loops.',
    whenAppropriate: 'Sequential foundational skills (e.g., long division, balancing chemical equations, phonics decoding, grammar mechanics) where failure to master early steps prevents downstream success.',
    phases: [
      { phaseName: 'Explicit Instruction on Criterion Target', defaultTimePercent: 18, teacherRole: 'Teach core concept with hyper-clear success criteria rubric.', studentRole: 'Study target criteria and engage in focused deliberate practice.', focus: 'Direct teaching to specific criterion', keyQuestioningStrategy: 'What does 100% accuracy look like on this criterion?', formativeCheckFocus: 'Comprehension of mastery benchmark' },
      { phaseName: 'Deliberate Practice Session', defaultTimePercent: 22, teacherRole: 'Facilitate targeted practice with immediate peer/teacher answer verification.', studentRole: 'Complete standardized problem series, checking each step against standard.', focus: 'Precision practice & rapid error feedback', keyQuestioningStrategy: 'Why does this answer meet the exact rubric requirement?', formativeCheckFocus: 'Real-time practice accuracy' },
      { phaseName: 'Diagnostic Formative Assessment 1', defaultTimePercent: 14, teacherRole: 'Administer non-punitive benchmark diagnostic check (Hinge assessment).', studentRole: 'Demonstrate individual competence under test conditions.', focus: 'Precise diagnostic screening', keyQuestioningStrategy: 'Complete items 1-4 independently.', formativeCheckFocus: 'Categorize students: Mastered (80%+) vs Corrective Needed (<80%)' },
      { phaseName: 'Bifurcated Corrective & Enrichment Tracks', defaultTimePercent: 28, teacherRole: 'Teach alternate representation/manipulative clinic to Group A; assign depth/extension project to Group B.', studentRole: 'Group A: Target gaps with new approach. Group B: Apply skill to advanced context.', focus: 'Targeted reteaching vs rich enrichment', keyQuestioningStrategy: 'Group A: Let us see this with a visual model. Group B: How does this apply to 3D?', formativeCheckFocus: 'Gap closure in corrective group; depth in enrichment' },
      { phaseName: 'Parallel Reassessment & Advancement', defaultTimePercent: 18, teacherRole: 'Re-evaluate Group A with parallel form; evaluate Group B extension output.', studentRole: 'Demonstrate achieved mastery on second-chance assessment.', focus: 'Demonstrated mastery & advancement certification', keyQuestioningStrategy: 'Parallel diagnostic items', formativeCheckFocus: 'Target 90%+ total class mastery threshold' }
    ],
    teacherRole: 'Diagnostic assessor, corrective clinic leader, enrichment curator.',
    studentRole: 'Deliberate practitioner, gap identifier, perseverant learner, self-monitor.',
    recommendedActivities: ['Formative diagnostic quizzes', 'Alternative representation reteach clinics', 'Peer tutoring pairs', 'Advanced application challenges', 'Mastery progress trackers'],
    questioningApproach: 'Diagnostic and corrective questions: "At what specific step did the error occur?", "How can we visualize this differently?"',
    assessmentApproach: 'Two-stage criterion assessments: Diagnostic Form A -> Corrective Loop -> Parallel Form B.',
    differentiationConsiderations: 'Corrective instruction must use different representations/modalities, never simply repeating the original lecture slower.',
    subjectAffinities: ['Mathematics', 'Language Arts', 'Science and Technology'],
    cognitiveDemands: ['procedural', 'recall', 'conceptual']
  },

  'socratic-questioning': {
    id: 'socratic-questioning',
    name: 'Socratic/Question-Based Learning',
    shortName: 'Socratic',
    category: 'discourse',
    purpose: 'Disciplined, rigorous questioning that probes thinking, clarifies assumptions, explores implications, and guides students to self-correct and deepen conceptual understanding.',
    whenAppropriate: 'When evaluating complex ethical questions, philosophy, constitutional principles in Belize, analyzing poetry or literary themes, or challenging scientific misconceptions.',
    phases: [
      { phaseName: 'Anchor Text / Provocative Premise', defaultTimePercent: 14, teacherRole: 'Introduce a provocative thesis, moral contradiction, or profound question.', studentRole: 'Examine premise, identify underlying assumptions and tensions.', focus: 'Intellectual provocation & curiosity', keyQuestioningStrategy: 'What central question does this premise force us to confront?', formativeCheckFocus: 'Engagement with core intellectual tension' },
      { phaseName: 'Clarification & Definition Probing', defaultTimePercent: 20, teacherRole: 'Pose questions that force precise definitions and unpack vague claims.', studentRole: 'Define key terms rigorously, eliminate ambiguous language.', focus: 'Semantic precision & conceptual clarity', keyQuestioningStrategy: 'What exactly do you mean by "justice" or "fairness" in this context?', formativeCheckFocus: 'Precision of student definitions' },
      { phaseName: 'Probing Assumptions & Evidence', defaultTimePercent: 28, teacherRole: 'Challenge unstated assumptions and demand textual/empirical justification.', studentRole: 'Defend claims with evidence or acknowledge unexamined assumptions.', focus: 'Rigorous intellectual accountability', keyQuestioningStrategy: 'What assumption are you making here? What if the opposite were true?', formativeCheckFocus: 'Quality of evidence and intellectual honesty' },
      { phaseName: 'Exploring Implications & Consequences', defaultTimePercent: 22, teacherRole: 'Push students to trace the logical consequence of their arguments to extreme conclusions.', studentRole: 'Follow ideas to logical endpoints, evaluate whether conclusions hold.', focus: 'Logical consistency & implications', keyQuestioningStrategy: 'If we accept your argument, what must happen in this extreme case?', formativeCheckFocus: 'Recognition of contradictions or solid principles' },
      { phaseName: 'Synthesis & Epistemic Humility Closure', defaultTimePercent: 16, teacherRole: 'Guide students to summarize the refined truth and reflect on the limits of knowledge.', studentRole: 'Articulate nuanced conclusion, acknowledging complexity and revised thinking.', focus: 'Nuanced synthesis & humility', keyQuestioningStrategy: 'What do we now understand that was invisible to us at the start?', formativeCheckFocus: 'Written Socratic reflection journal' }
    ],
    teacherRole: 'Inquisitor, intellectual provocateur, guide to truth, active listener.',
    studentRole: 'Deep thinker, rigorous conversationalist, examiner of own beliefs.',
    recommendedActivities: ['Socratic circles', 'Paired cross-examination', 'Refutation writing', 'Dilemma journals', 'Fishbowl seminars'],
    questioningApproach: 'Paul’s 6 types of Socratic questions: Clarification, Probing Assumptions, Probing Reasons/Evidence, Viewpoints/Perspectives, Probing Implications/Consequences, Questions About the Question.',
    assessmentApproach: 'Evaluation of argumentative depth, logical consistency, responsiveness to counter-claims, written synthesis.',
    differentiationConsiderations: 'Allow students to pass if anxious, but re-engage them with binary choices; provide text-marking guides prior to discussion.',
    subjectAffinities: ['Language Arts', 'Belizean Studies', 'HFLE', 'Science and Technology'],
    cognitiveDemands: ['analytical', 'evaluative', 'conceptual']
  },

  'learning-stations': {
    id: 'learning-stations',
    name: 'Learning Stations',
    shortName: 'Learning Stations',
    category: 'adaptive',
    purpose: 'Students rotate through discrete, structured learning stations in small groups, engaging with different modalities, texts, hands-on tasks, and teacher-led instruction.',
    whenAppropriate: 'When a topic benefits from multi-modal engagement (e.g., listening center, manipulative station, reading station, teacher mini-lesson clinic, technology/simulation station).',
    phases: [
      { phaseName: 'Station Orientation & Mission Briefing', defaultTimePercent: 12, teacherRole: 'Explain objectives and mechanics of each station; display rotation timer.', studentRole: 'Review station map and accountability passport.', focus: 'Logistical clarity & behavioral expectations', keyQuestioningStrategy: 'Where do you go first and what is the required output at that station?', formativeCheckFocus: 'Clarity on rotation protocol' },
      { phaseName: 'Station Rotation 1 (Targeted Focus)', defaultTimePercent: 24, teacherRole: 'Station A: Conduct targeted teacher-led clinic. Stations B-D: Self-directed.', studentRole: 'Engage deeply with station materials, record work in individual passport.', focus: 'Multi-modal engagement', keyQuestioningStrategy: 'Station-specific task prompts', formativeCheckFocus: 'Task completion and quality in Station Passport' },
      { phaseName: 'Station Rotation 2 (Modality Shift)', defaultTimePercent: 24, teacherRole: 'Facilitate smooth 60-second transition; receive new group at teacher station.', studentRole: 'Clean station, rotate on bell, dive into new sensory/cognitive modality.', focus: 'Complementary cognitive modality', keyQuestioningStrategy: 'How does this hands-on task connect to what you read at station 1?', formativeCheckFocus: 'Transition efficiency and active engagement' },
      { phaseName: 'Station Rotation 3 (Application / Creation)', defaultTimePercent: 24, teacherRole: 'Rotate to third cohort; monitor independent station outputs.', studentRole: 'Collaborate at station, synthesize evidence, complete product output.', focus: 'Consolidation & product creation', keyQuestioningStrategy: 'Synthesize findings from previous stations into this task.', formativeCheckFocus: 'Quality of station artifacts' },
      { phaseName: 'Plenary Debrief & Synthesis', defaultTimePercent: 16, teacherRole: 'Call class together, synthesize key discoveries from all stations, review passports.', studentRole: 'Submit completed station passport, share station highlights with class.', focus: 'Unifying plenary synthesis', keyQuestioningStrategy: 'How did Station A and Station B together build our whole concept?', formativeCheckFocus: 'Station Passport collection and exit synthesis' }
    ],
    teacherRole: 'Station architect, small-group clinic teacher, transition conductor.',
    studentRole: 'Self-directed navigator, multimodal investigator, accountable documenter.',
    recommendedActivities: ['Teacher-led guided math/reading clinic', 'Hands-on manipulative lab', 'Vocabulary match-up center', 'Reading and source analysis station', 'Interactive digital / game station'],
    questioningApproach: 'Task-embedded station prompts; teacher-led targeted probing during small-group rotation.',
    assessmentApproach: 'Station passport evaluation, observational checklist during small group, plenary exit ticket.',
    differentiationConsiderations: 'Color-code station task cards by difficulty; ensure the teacher station targets students with highest instructional need.',
    subjectAffinities: ['Language Arts', 'Mathematics', 'Science and Technology', 'Belizean Studies', 'Creative Arts'],
    cognitiveDemands: ['practical', 'conceptual', 'procedural', 'analytical']
  },

  'game-based-learning': {
    id: 'game-based-learning',
    name: 'Game-Based Learning',
    shortName: 'Game-Based',
    category: 'collaborative',
    purpose: 'Leveraging competitive or cooperative gameplay mechanics, challenges, rules, and rewards to motivate engagement and deepen skill practice and strategic thinking.',
    whenAppropriate: 'When practicing fluency skills (math facts, grammar mechanics, vocabulary acquisition), reviewing units, or simulating economic/ecosystem balance.',
    phases: [
      { phaseName: 'Challenge Intro & Rule Framing', defaultTimePercent: 14, teacherRole: 'Introduce game narrative, learning objective, rules of play, and sportsmanship norms.', studentRole: 'Internalize rules, inspect game materials/cards, commit to fair play.', focus: 'Rules, narrative & objective alignment', keyQuestioningStrategy: 'What academic knowledge is required to score points in this game?', formativeCheckFocus: 'Comprehension of rules and academic connection' },
      { phaseName: 'Practice Round & Mechanic Verification', defaultTimePercent: 12, teacherRole: 'Demonstrate one round publicly, highlighting how correct academic answers drive game success.', studentRole: 'Execute a trial round, resolve procedural questions.', focus: 'Mechanic fluency', keyQuestioningStrategy: 'Why did team X gain the resource in that round?', formativeCheckFocus: 'Smooth game mechanics' },
      { phaseName: 'Active Gameplay & Strategic Quests', defaultTimePercent: 44, teacherRole: 'Circulate, act as referee, verify academic answers, award achievements.', studentRole: 'Play strategically, calculate moves, solve problems under light time/competition pressure.', focus: 'High engagement practice & strategy', keyQuestioningStrategy: 'How did mathematical or linguistic reasoning guide your move?', formativeCheckFocus: 'Real-time accuracy on game cards' },
      { phaseName: 'Gameplay Debrief & Strategic Analysis', defaultTimePercent: 16, teacherRole: 'Facilitate debrief: "What strategies worked? Where did you get stuck academically?"', studentRole: 'Analyze game outcomes, identify winning strategies and common academic errors.', focus: 'Deconstructing the learning inside the game', keyQuestioningStrategy: 'What did the game teach you about the actual subject concept?', formativeCheckFocus: 'Connecting game mechanics to curriculum standard' },
      { phaseName: 'Independent Application Transfer', defaultTimePercent: 14, teacherRole: 'Administer non-game standard quiz/problem set to confirm skill transfer outside the game.', studentRole: 'Solve standard test items independently, proving mastery without game props.', focus: 'Transfer from game to formal academic context', keyQuestioningStrategy: 'Solve target standard problem without game dice.', formativeCheckFocus: 'Independent assessment score' }
    ],
    teacherRole: 'Game master, referee, academic validator, debrief facilitator.',
    studentRole: 'Active player, strategic thinker, collaborative teammate, self-evaluator.',
    recommendedActivities: ['Curriculum Jeopardy / Trivia tournaments', 'Card-matching memory battles', 'Math fact board games', 'Escape room puzzles', 'Ecological simulation quests'],
    questioningApproach: 'Strategic reflection prompts: "What trade-off did you make?", "How did knowing this rule help you win?", "What pattern did you discover?"',
    assessmentApproach: 'Scorecards tracking academic question accuracy, post-game debrief reflections, independent transfer quiz.',
    differentiationConsiderations: 'Provide leveled question decks (bronze, silver, gold point values); group students by balanced mixed ability so games remain competitive and encouraging.',
    subjectAffinities: ['Mathematics', 'Language Arts', 'Spanish', 'Science and Technology', 'Belizean Studies'],
    cognitiveDemands: ['recall', 'procedural', 'analytical', 'creative']
  },

  'peer-teaching': {
    id: 'peer-teaching',
    name: 'Peer Teaching',
    shortName: 'Peer Teaching',
    category: 'collaborative',
    purpose: 'Students teach concepts or demonstrate skills to peers (e.g. reciprocal teaching, cross-age tutoring, paired think-aloud), deepening understanding through the act of explaining.',
    whenAppropriate: 'When reinforcing reading comprehension strategies (Predict, Clarify, Question, Summarize), reviewing multi-step procedures, or solidifying newly taught concepts.',
    phases: [
      { phaseName: 'Expert Preparation & Role Training', defaultTimePercent: 16, teacherRole: 'Train students on teaching role, provide teaching script/cards and success rubric.', studentRole: 'Prepare explanation, anticipate peer confusion, rehearse teaching moves.', focus: 'Preparation to teach', keyQuestioningStrategy: 'How will you explain this without just giving the answer away?', formativeCheckFocus: 'Readiness of peer-teachers' },
      { phaseName: 'Round 1: Peer Instruction & Demonstration', defaultTimePercent: 26, teacherRole: 'Circulate quietly, observe peer-teachers, take notes on pedagogical accuracy.', studentRole: 'Partner A teaches Partner B using modeled steps, asking check questions.', focus: 'Active peer explanation & demonstration', keyQuestioningStrategy: 'Partner A prompts: "Can you explain back to me why we did that?"', formativeCheckFocus: 'Accuracy of Peer A explanation' },
      { phaseName: 'Reciprocal Switch & Practice', defaultTimePercent: 26, teacherRole: 'Call the switch; monitor new peer teacher executing with a novel problem.', studentRole: 'Partner B assumes teacher role, guiding Partner A through second problem.', focus: 'Reciprocal role reversal', keyQuestioningStrategy: 'Partner B prompts: "What clue tells us to use this rule?"', formativeCheckFocus: 'Accuracy of Peer B explanation' },
      { phaseName: 'Partner Formative Verification', defaultTimePercent: 16, teacherRole: 'Provide dual verification check where partners evaluate each other’s mastery.', studentRole: 'Partners complete check independently, grade each other against rubric.', focus: 'Mutual assessment & constructive feedback', keyQuestioningStrategy: 'Does your partner’s work satisfy all rubric criteria?', formativeCheckFocus: 'Peer assessment accuracy' },
      { phaseName: 'Teacher Synthesis & Mastery Quiz', defaultTimePercent: 16, teacherRole: 'Address misconceptions overheard during rotations; administer short exit check.', studentRole: 'Synthesize learning, complete individual mastery check.', focus: 'Class-wide closure & verification', keyQuestioningStrategy: 'What teaching move helped you understand the most today?', formativeCheckFocus: 'Individual exit ticket results' }
    ],
    teacherRole: 'Coach of peer teachers, quiet observer, diagnostician, class synthesist.',
    studentRole: 'Peer teacher, empathetic guide, active learner, constructive critic.',
    recommendedActivities: ['Reciprocal teaching reading circles', 'Pair-share problem solving', 'Expert group teach-backs', 'Flashcard coaching', 'Student-led worked example reviews'],
    questioningApproach: 'Peer tutoring questioning stems: "Why do you think so?", "Show me where that is", "What would happen if...?"',
    assessmentApproach: 'Peer evaluation rubrics, observation of teaching quality, final individual exit ticket.',
    differentiationConsiderations: 'Pair students with complementary readiness levels (moderate difference, avoiding extreme gaps); provide structured tutoring dialogue cards.',
    subjectAffinities: ['Language Arts', 'Mathematics', 'Science and Technology', 'Spanish'],
    cognitiveDemands: ['conceptual', 'procedural', 'analytical']
  },

  'flipped-learning': {
    id: 'flipped-learning',
    name: 'Flipped Learning',
    shortName: 'Flipped Learning',
    category: 'student-centered',
    purpose: 'Direct instruction and content acquisition occurs before class (via reading, video, or observation), freeing in-class time for active problem solving, collaborative projects, and deep coaching.',
    whenAppropriate: 'When students have pre-class reading materials or multimedia resources available, allowing in-class time to be dedicated to intense application and synthesis.',
    phases: [
      { phaseName: 'Pre-Class Knowledge Retrieval & Warm-Up', defaultTimePercent: 14, teacherRole: 'Conduct quick 5-minute retrieval check on pre-class preparation.', studentRole: 'Recall key concepts from pre-reading/video on whiteboards or quiz.', focus: 'Retrieval practice & readiness check', keyQuestioningStrategy: 'From your preparation, what was the single most vital principle?', formativeCheckFocus: 'Pre-class preparation compliance & recall' },
      { phaseName: 'Misconception Triage & Rapid Clarification', defaultTimePercent: 14, teacherRole: 'Address the top 2 points of confusion surfaced by pre-class work in a 6-minute clinic.', studentRole: 'Ask clarifying questions, resolve ambiguities before starting application.', focus: 'Targeted triage & barrier removal', keyQuestioningStrategy: 'Where did the pre-class explanation feel most counter-intuitive?', formativeCheckFocus: 'Resolution of baseline confusion' },
      { phaseName: 'High-Demand Collaborative Workshop', defaultTimePercent: 44, teacherRole: 'Facilitate complex problem-solving task, circulating to coach and challenge.', studentRole: 'Work in teams to apply concept to complex, messy, non-routine problems.', focus: 'Deep application & complex transfer', keyQuestioningStrategy: 'How does the theory from home apply to this messy real-world data?', formativeCheckFocus: 'Group problem-solving depth' },
      { phaseName: 'Peer Defense & Critique Gallery', defaultTimePercent: 16, teacherRole: 'Structure speed gallery walk where teams defend solutions to peers.', studentRole: 'Defend team findings, evaluate peer approaches using rubric.', focus: 'Public defense & critique', keyQuestioningStrategy: 'Why is team A’s model more efficient than team B’s?', formativeCheckFocus: 'Peer critique rigor' },
      { phaseName: 'Metacognitive Synthesis & Advance Organizer', defaultTimePercent: 12, teacherRole: 'Summarize core insights; assign pre-class prompt for next session.', studentRole: 'Document personal synthesis and record next preparation assignment.', focus: 'Consolidation & continuous loop', keyQuestioningStrategy: 'How did class application deepen what you saw at home?', formativeCheckFocus: 'Exit ticket synthesis quality' }
    ],
    teacherRole: 'Workshop facilitator, high-level cognitive coach, resource curator.',
    studentRole: 'Prepared contributor, active problem solver, peer reviewer, deep thinker.',
    recommendedActivities: ['Collaborative case studies', 'Complex multi-step labs', 'Peer solution debates', 'Problem-set workshops', 'Socratic seminar debriefs'],
    questioningApproach: 'Application and analysis prompts: "How does the theory hold up in this real-world case?", "Where does the model break down?"',
    assessmentApproach: 'Pre-class retrieval score, in-class workshop rubric, final exit application challenge.',
    differentiationConsiderations: 'Have a 10-minute catch-up station with headphones/text for students who were unable to complete pre-class preparation.',
    subjectAffinities: ['Science and Technology', 'Mathematics', 'Belizean Studies', 'Language Arts'],
    cognitiveDemands: ['conceptual', 'analytical', 'evaluative']
  },

  'blended-learning': {
    id: 'blended-learning',
    name: 'Blended Learning',
    shortName: 'Blended Learning',
    category: 'adaptive',
    purpose: 'Integrating digital and face-to-face instruction, giving students some element of control over time, place, path, or pace while maximizing teacher-led human interaction.',
    whenAppropriate: 'When combining offline manipulatives/textbooks with digital software, research databases, audio reading stations, or interactive simulations in the classroom.',
    phases: [
      { phaseName: 'Integrated Launch & Digital Station Sync', defaultTimePercent: 12, teacherRole: 'Frame lesson goal and connect offline resources to digital simulation/tools.', studentRole: 'Log in, review dual-track objective (offline + digital).', focus: 'Seamless integration & goal clarity', keyQuestioningStrategy: 'How will the digital tool provide evidence for our physical investigation?', formativeCheckFocus: 'Access & readiness on both tracks' },
      { phaseName: 'Rotational Track A: Digital Adaptive Exploration', defaultTimePercent: 32, teacherRole: 'Cohort 1: Independent digital simulation. Cohort 2: Teacher deep-dive table.', studentRole: 'Cohort 1 works on adaptive software/simulation, recording findings in print log.', focus: 'Personalized pacing & digital feedback', keyQuestioningStrategy: 'What does the simulation show when you change variable X?', formativeCheckFocus: 'Digital telemetry / logsheet progress' },
      { phaseName: 'Rotational Track B: Teacher-Led Concrete Clinic', defaultTimePercent: 32, teacherRole: 'Swap cohorts: Guide Cohort 1 in concrete discussion; Cohort 2 to digital station.', studentRole: 'Engage with teacher using physical manipulatives, deep questioning, and text.', focus: 'Human coaching & concrete mastery', keyQuestioningStrategy: 'How does what you saw on screen connect to these physical blocks?', formativeCheckFocus: 'Concrete reasoning & problem solving' },
      { phaseName: 'Synchronous Synthesis & Data Integration', defaultTimePercent: 14, teacherRole: 'Reconvene whole class; project real-time digital insights alongside physical student work.', studentRole: 'Compare digital findings with physical observations, formulate conclusion.', focus: 'Cross-track synthesis', keyQuestioningStrategy: 'Where did the computer model agree or disagree with our physical experiment?', formativeCheckFocus: 'Integrated conceptual understanding' },
      { phaseName: 'Digital / Paper Mastery Check', defaultTimePercent: 10, teacherRole: 'Administer quick exit assessment linking digital simulation to paper response.', studentRole: 'Complete final exit question synthesizing both learning experiences.', focus: 'Dual-modality assessment', keyQuestioningStrategy: 'Exit challenge prompt', formativeCheckFocus: 'Exit ticket score' }
    ],
    teacherRole: 'Hybrid instructional designer, high-impact small-group instructor, data analyst.',
    studentRole: 'Self-paced digital explorer, collaborative learner, reflective synthesizer.',
    recommendedActivities: ['Station-rotation with digital center', 'Simulation-to-physical lab comparisons', 'Online research to paper poster', 'Audiobook listening while tracking printed text'],
    questioningApproach: 'Integrative questions connecting digital visualizations to real-world phenomena.',
    assessmentApproach: 'Digital software analytics combined with physical teacher-graded artifacts and exit tickets.',
    differentiationConsiderations: 'Digital tools naturally support variable pacing; ensure offline tasks are equally rich and not merely waiting time.',
    subjectAffinities: ['Science and Technology', 'Mathematics', 'Language Arts', 'Belizean Studies'],
    cognitiveDemands: ['procedural', 'conceptual', 'analytical']
  }
};

// Aliases and normalizations
const MODEL_ALIASES: Record<string, string> = {
  '5e': '5e-instructional-model',
  '5e model': '5e-instructional-model',
  '5e instructional framework': '5e-instructional-model',
  'direct instruction': 'direct-instruction',
  'direct': 'direct-instruction',
  'explicit instruction': 'direct-instruction',
  'inquiry': 'inquiry-based-learning',
  'inquiry-based': 'inquiry-based-learning',
  'inquiry based': 'inquiry-based-learning',
  'problem-based': 'problem-based-learning',
  'problem based': 'problem-based-learning',
  'pbl': 'problem-based-learning',
  'project-based': 'project-based-learning',
  'project based': 'project-based-learning',
  'cooperative': 'cooperative-learning',
  'cooperative learning': 'cooperative-learning',
  'discovery': 'discovery-learning',
  'guided discovery': 'guided-discovery',
  'demonstration': 'demonstration-model',
  'demonstration model': 'demonstration-model',
  'experiential': 'experiential-learning',
  'discussion': 'discussion-based-learning',
  'discussion-based': 'discussion-based-learning',
  'differentiated': 'differentiated-instruction',
  'differentiated instruction': 'differentiated-instruction',
  'scaffolding': 'scaffolding',
  'mastery': 'mastery-learning',
  'mastery learning': 'mastery-learning',
  'socratic': 'socratic-questioning',
  'socratic questioning': 'socratic-questioning',
  'learning stations': 'learning-stations',
  'stations': 'learning-stations',
  'game-based': 'game-based-learning',
  'game based': 'game-based-learning',
  'peer teaching': 'peer-teaching',
  'flipped': 'flipped-learning',
  'flipped learning': 'flipped-learning',
  'blended': 'blended-learning',
  'blended learning': 'blended-learning',
  'competency-based': 'mastery-learning',
  'universal design for learning (udl)': 'differentiated-instruction'
};

export function normalizeTeachingModelId(input: string): string {
  if (!input) return 'direct-instruction';
  const clean = input.trim().toLowerCase();
  if (TEACHING_MODELS_REGISTRY[clean]) return clean;
  if (MODEL_ALIASES[clean]) return MODEL_ALIASES[clean];
  
  // Fuzzy search
  for (const [alias, id] of Object.entries(MODEL_ALIASES)) {
    if (clean.includes(alias) || alias.includes(clean)) {
      return id;
    }
  }
  return 'direct-instruction';
}

export function getTeachingModelDefinition(nameOrId: string): TeachingModelDefinition {
  const normalizedId = normalizeTeachingModelId(nameOrId);
  return TEACHING_MODELS_REGISTRY[normalizedId] || TEACHING_MODELS_REGISTRY['direct-instruction'];
}

export function getAllTeachingModels(): TeachingModelDefinition[] {
  return Object.values(TEACHING_MODELS_REGISTRY);
}

// ============================================================================
// TIMING ENGINE
// ============================================================================
export function calculatePhaseTimings(phases: TeachingModelPhaseSpec[], totalMinutes: number): { name: string; minutes: number; timeAllocation: string }[] {
  if (!phases || phases.length === 0) {
    return [{ name: 'Lesson Execution', minutes: totalMinutes, timeAllocation: `${totalMinutes} min` }];
  }
  
  // Calculate raw minutes based on percentage
  const totalPercent = phases.reduce((sum, p) => sum + p.defaultTimePercent, 0) || 100;
  let allocatedMinutes = 0;
  const rawTimings = phases.map((phase, idx) => {
    let mins = Math.max(2, Math.round((phase.defaultTimePercent / totalPercent) * totalMinutes));
    allocatedMinutes += mins;
    return { name: phase.phaseName, minutes: mins };
  });

  // Adjust discrepancy so total matches exact totalMinutes
  let diff = totalMinutes - allocatedMinutes;
  let adjustIdx = phases.length > 2 ? 1 : 0; // adjust the main practice phase
  while (diff !== 0 && adjustIdx < rawTimings.length) {
    if (diff > 0) {
      rawTimings[adjustIdx].minutes += 1;
      diff -= 1;
    } else if (diff < 0 && rawTimings[adjustIdx].minutes > 2) {
      rawTimings[adjustIdx].minutes -= 1;
      diff += 1;
    }
    adjustIdx = (adjustIdx + 1) % rawTimings.length;
  }

  return rawTimings.map(t => ({
    name: t.name,
    minutes: t.minutes,
    timeAllocation: `${t.minutes} min`
  }));
}

// ============================================================================
// ADAPTIVE INSTRUCTIONAL DECISIONS ENGINE
// ============================================================================
export function generateAdaptiveDecisions(
  primaryModel: string,
  topic: string,
  subject: Subject
): TeachingModelDecisionBranch {
  const modelDef = getTeachingModelDefinition(primaryModel);
  const t = topic || 'the core objective';

  switch (modelDef.category) {
    case 'inquiry':
      return {
        ifDemonstrateUnderstanding: `Transition immediately to student-led evidence synthesis and challenge learners to generalize the discovered principle of ${t} to an unfamiliar context.`,
        ifSomeStruggle: `Provide a focused inquiry scaffold (data recording table or paired buddy) to help isolate the specific pattern in ${t} without revealing the answer.`,
        ifManyStruggle: `Pause group investigation; reconvene whole class at the board to guide a targeted collective observation highlighting the critical variable of ${t}.`,
        ifMasteryEarly: `Offer an advanced transfer challenge requiring students to test boundary conditions or formulate an alternative hypothesis about ${t}.`
      };
    case 'problem':
      return {
        ifDemonstrateUnderstanding: `Authorize students to proceed to solution prototyping and begin drafting their criteria-based justification for ${t}.`,
        ifSomeStruggle: `Supply a structured constraints matrix or provide 2 partial solution examples to unblock divergent thinking on ${t}.`,
        ifManyStruggle: `Pause independent research; lead a 4-minute whole-class problem deconstruction clinic identifying the core dilemma and key stakeholders.`,
        ifMasteryEarly: `Introduce a real-world complicating constraint (e.g., cut budget by 50% or restrict time) to test solution resilience and depth.`
      };
    case 'collaborative':
      return {
        ifDemonstrateUnderstanding: `Encourage teams to conduct reciprocal cross-group challenge questions and synthesize multiple perspectives on ${t}.`,
        ifSomeStruggle: `Intervene at the struggling team to reinforce specific cooperative roles (clarifier, summarizer) and provide discourse sentence starters.`,
        ifManyStruggle: `Execute a brief class-wide 'Fishbowl' demonstration showing one team successfully navigating the collaborative task for ${t}.`,
        ifMasteryEarly: `Assign high-performing teams to create peer challenge cards or act as roving consultants for peer review.`
      };
    case 'mastery':
      return {
        ifDemonstrateUnderstanding: `Advance students directly to the extension task or peer-tutoring clinic to deepen conceptual mastery of ${t}.`,
        ifSomeStruggle: `Direct students immediately to the Tier 1 corrective station using concrete manipulatives or alternative visual diagrams for ${t}.`,
        ifManyStruggle: `Halt independent practice; reteach the procedural hinge step of ${t} using an alternative representation and choral error analysis.`,
        ifMasteryEarly: `Provide multi-step non-routine challenge problems and assign leadership of peer-verification checkpoints.`
      };
    case 'discourse':
      return {
        ifDemonstrateUnderstanding: `Deepen inquiry by introducing a counter-argument or contrasting perspective that tests the limits of their stance on ${t}.`,
        ifSomeStruggle: `Provide structured sentence frames ("The evidence on page X suggests... because...") and allow 60 seconds of quiet partner rehearsal.`,
        ifManyStruggle: `Shift to a structured 'Think-Pair-Share' format before returning to open plenary debate to lower affective filter and build confidence.`,
        ifMasteryEarly: `Task advanced speakers with playing devil's advocate or synthesizing divergent viewpoints into an overarching compromise.`
      };
    default: // 'direct' & others
      return {
        ifDemonstrateUnderstanding: `Transition immediately to independent application; advance students to the multi-step practice set on ${t}.`,
        ifSomeStruggle: `Pull a small guided clinic to the teacher table to re-model the procedure for ${t} using concrete/pictorial scaffolding.`,
        ifManyStruggle: `Pause independent work; deliver a 3-minute think-aloud targeting the specific procedural step where errors clustered.`,
        ifMasteryEarly: `Provide the non-routine extension set and appoint students as peer coaches for guided practice validation.`
      };
  }
}

// ============================================================================
// INTELLIGENT MODEL RECOMMENDATION ENGINE
// ============================================================================
export interface ModelRecommendationParams {
  subject: Subject;
  grade: GradeLevel;
  topic: string;
  subtopic?: string;
  duration?: string;
  learningOutcome?: string;
  objectives?: string[];
  cognitiveDemand?: string;
  preferredMode?: 'auto' | 'manual' | 'hybrid';
  manualPrimary?: string;
  manualSupporting?: string[];
}

export interface ModelRecommendationResult {
  primaryModel: TeachingModelDefinition;
  supportingModels: TeachingModelDefinition[];
  rationale: string;
  phases: TeachingModelPhaseSpec[];
  adaptiveDecisions: TeachingModelDecisionBranch;
  phaseTimings: { name: string; minutes: number; timeAllocation: string }[];
}

export function recommendTeachingModel(params: ModelRecommendationParams): ModelRecommendationResult {
  const { subject, grade, topic, subtopic = '', duration = '45 min', learningOutcome = '', objectives = [], manualPrimary, manualSupporting = [] } = params;
  
  // Total duration parse
  const durNum = parseInt(duration.replace(/\D/g, ''), 10) || 45;

  // If manual primary was selected and valid, use it
  if (manualPrimary && params.preferredMode !== 'auto') {
    const primary = getTeachingModelDefinition(manualPrimary);
    const supporting = (manualSupporting || [])
      .map(s => getTeachingModelDefinition(s))
      .filter(m => m.id !== primary.id)
      .slice(0, 3);
    
    // Auto-select supporting if none provided in hybrid mode
    if (supporting.length === 0 && params.preferredMode === 'hybrid') {
      const suggestedSupport = primary.category === 'inquiry' 
        ? ['cooperative-learning', 'differentiated-instruction']
        : primary.category === 'direct'
        ? ['scaffolding', 'mastery-learning']
        : ['differentiated-instruction', 'cooperative-learning'];
      suggestedSupport.forEach(id => {
        if (id !== primary.id) supporting.push(TEACHING_MODELS_REGISTRY[id]);
      });
    }

    const rationale = `Selected ${primary.name} as the primary instructional architecture for ${topic} in ${subject} (${grade}), supported by ${supporting.map(s => s.name).join(', ') || 'targeted scaffolding'}, providing an optimal balance of ${primary.purpose.toLowerCase()}`;
    const adaptiveDecisions = generateAdaptiveDecisions(primary.id, topic, subject);
    const phaseTimings = calculatePhaseTimings(primary.phases, durNum);

    return {
      primaryModel: primary,
      supportingModels: supporting,
      rationale,
      phases: primary.phases,
      adaptiveDecisions,
      phaseTimings
    };
  }

  // AUTO SELECT: Pedagogical Analysis
  const corpus = `${subject} ${topic} ${subtopic} ${learningOutcome} ${objectives.join(' ')}`.toLowerCase();

  // Scoring all models
  const scores: Record<string, number> = {};
  for (const model of Object.values(TEACHING_MODELS_REGISTRY)) {
    let score = 0;

    // Subject affinity (+15 points)
    if (model.subjectAffinities.includes(subject)) {
      score += 15;
    }

    // Keyword detection
    // Procedural keywords
    if (/step|procedure|calculate|compute|solve|algorithm|formula|decode|phonics|grammar|multiply|divide|add|subtract|construct/i.test(corpus)) {
      if (['direct-instruction', 'mastery-learning', 'demonstration-model', 'scaffolding'].includes(model.id)) score += 25;
    }

    // Inquiry & Discovery keywords
    if (/investigate|discover|explore|experiment|phenomenon|observe|pattern|hypothesis|evidence|test|inquire|data|relationship/i.test(corpus)) {
      if (['5e-instructional-model', 'inquiry-based-learning', 'discovery-learning', 'guided-discovery'].includes(model.id)) score += 30;
    }

    // Problem-based keywords
    if (/problem|dilemma|solution|community|challenge|real-world|conserve|preserve|economy|environmental|hazard|pollute/i.test(corpus)) {
      if (['problem-based-learning', 'project-based-learning', 'experiential-learning'].includes(model.id)) score += 30;
    }

    // Project & Creation keywords
    if (/create|design|build|produce|project|prototype|campaign|artifact|publish|write a story|exhibition/i.test(corpus)) {
      if (['project-based-learning', 'differentiated-instruction'].includes(model.id)) score += 30;
    }

    // Discussion & Discourse keywords
    if (/discuss|debate|perspective|argue|ethical|moral|theme|analyze text|author's purpose|socratic|point of view/i.test(corpus)) {
      if (['discussion-based-learning', 'socratic-questioning', 'cooperative-learning'].includes(model.id)) score += 30;
    }

    // Practical & Physical skills
    if (/perform|kick|throw|catch|paint|draw|brush|run|balance|technique|safety protocol/i.test(corpus)) {
      if (['demonstration-model', 'experiential-learning'].includes(model.id)) score += 35;
    }

    // Duration suitability
    if (durNum >= 60) {
      if (['5e-instructional-model', 'inquiry-based-learning', 'problem-based-learning', 'project-based-learning', 'learning-stations'].includes(model.id)) score += 10;
    } else if (durNum <= 35) {
      if (['direct-instruction', 'demonstration-model', 'mastery-learning', 'guided-discovery'].includes(model.id)) score += 15;
    }

    // Grade level suitability
    if (/Infant|Standard 1|Standard 2/i.test(grade)) {
      if (['direct-instruction', 'guided-discovery', 'demonstration-model', 'game-based-learning', 'cooperative-learning'].includes(model.id)) score += 10;
      if (['socratic-questioning', 'problem-based-learning'].includes(model.id)) score -= 15;
    } else if (/Standard 5|Standard 6/i.test(grade)) {
      if (['5e-instructional-model', 'inquiry-based-learning', 'problem-based-learning', 'socratic-questioning', 'project-based-learning'].includes(model.id)) score += 10;
    }

    scores[model.id] = score;
  }

  // Sort and pick highest
  const sorted = Object.keys(scores).sort((a, b) => scores[b] - scores[a]);
  const primaryId = sorted[0] || 'direct-instruction';
  const primaryModel = TEACHING_MODELS_REGISTRY[primaryId];

  // Select 2 complementary supporting models
  const supportingIds: string[] = [];
  if (primaryModel.category === 'inquiry') {
    supportingIds.push('cooperative-learning', 'differentiated-instruction');
  } else if (primaryModel.category === 'direct') {
    supportingIds.push('scaffolding', 'mastery-learning');
  } else if (primaryModel.category === 'problem') {
    supportingIds.push('cooperative-learning', 'inquiry-based-learning');
  } else if (primaryModel.category === 'discourse') {
    supportingIds.push('socratic-questioning', 'differentiated-instruction');
  } else {
    supportingIds.push('cooperative-learning', 'differentiated-instruction');
  }

  const supportingModels = supportingIds
    .filter(id => id !== primaryId && TEACHING_MODELS_REGISTRY[id])
    .map(id => TEACHING_MODELS_REGISTRY[id])
    .slice(0, 2);

  // Generate detailed, professional pedagogical rationale
  let rationale = '';
  if (primaryModel.id === '5e-instructional-model') {
    rationale = `Selected the 5E Instructional Model because ${topic} in ${subject} requires students to investigate scientific/mathematical phenomena first-hand, construct evidence-based explanations, and transfer understanding through structured elaboration before formal evaluation.`;
  } else if (primaryModel.id === 'direct-instruction') {
    rationale = `Selected Direct Instruction because this lesson introduces a novel cognitive procedure and academic skill in ${subject} requiring unambiguous teacher modeling (I Do), scaffolded guided practice (We Do), and rigorous checks for understanding before independent fluency (You Do).`;
  } else if (primaryModel.id === 'inquiry-based-learning') {
    rationale = `Selected Inquiry-Based Learning because ${topic} centers on an open empirical or historical question where students must analyze sources, collect data, and defend conclusions using verifiable evidence.`;
  } else if (primaryModel.id === 'problem-based-learning') {
    rationale = `Selected Problem-Based Learning to immerse students in an authentic real-world challenge situated in Belize, requiring collaborative needs analysis, constraint evaluation, and iterative solution design.`;
  } else if (primaryModel.id === 'guided-discovery') {
    rationale = `Selected Guided Discovery because students can uncover the underlying rules and invariants of ${topic} through curated contrasting examples and strategic convergent questioning.`;
  } else if (primaryModel.id === 'demonstration-model') {
    rationale = `Selected Demonstration Model because mastering ${topic} requires precise observation of expert biomechanical/procedural execution, think-aloud error prevention, and structured peer re-demonstration.`;
  } else if (primaryModel.id === 'discussion-based-learning' || primaryModel.id === 'socratic-questioning') {
    rationale = `Selected ${primaryModel.name} because ${topic} involves multi-faceted perspectives, textual interpretation, and critical evaluation requiring disciplined academic dialogue and evidence justification.`;
  } else {
    rationale = `Selected ${primaryModel.name} as the primary model to best match the cognitive demands of ${topic} for ${grade} students within ${durNum} minutes, supported by ${supportingModels.map(s => s.name).join(' and ')}.`;
  }

  const adaptiveDecisions = generateAdaptiveDecisions(primaryModel.id, topic, subject);
  const phaseTimings = calculatePhaseTimings(primaryModel.phases, durNum);

  return {
    primaryModel,
    supportingModels,
    rationale,
    phases: primaryModel.phases,
    adaptiveDecisions,
    phaseTimings
  };
}
