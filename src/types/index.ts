export type GradeLevel = 'Infant 1' | 'Infant 2' | 'Infant 3' | 'Standard 1' | 'Standard 2' | 'Standard 3' | 'Standard 4' | 'Standard 5' | 'Standard 6';
export const ALL_GRADE_LEVELS: GradeLevel[] = [
  'Infant 1',
  'Infant 2',
  'Infant 3',
  'Standard 1',
  'Standard 2',
  'Standard 3',
  'Standard 4',
  'Standard 5',
  'Standard 6'
];

export interface LearningObjectivesStructure {
  condition: string;
  cognitive: string;
  psychomotor: string;
  affective: string;
}

/**
 * Normalizes any GradeLevel or class name string into a reliable, URL-safe classId (e.g. "standard-5")
 */
export const getClassId = (grade: GradeLevel | string): string => {
  return grade.toLowerCase().trim().replace(/\s+/g, '-');
};

/**
 * Resolves a normalized classId back to its canonical GradeLevel string
 */
export const getClassNameFromId = (classId: string): GradeLevel => {
  const normalized = classId.toLowerCase().trim();
  const map: Record<string, GradeLevel> = {
    'infant-1': 'Infant 1',
    'infant-2': 'Infant 2',
    'infant-3': 'Infant 3',
    'standard-1': 'Standard 1',
    'standard-2': 'Standard 2',
    'standard-3': 'Standard 3',
    'standard-4': 'Standard 4',
    'standard-5': 'Standard 5',
    'standard-6': 'Standard 6',
  };
  return map[normalized] || 'Standard 4';
};

export type Subject = 'Mathematics' | 'Language Arts' | 'Science and Technology' | 'Belizean Studies' | 'HFLE' | 'Spanish' | 'PE' | 'Creative Arts';
export type OutputStyle = 'Standard Teacher' | 'Detailed Teacher' | 'Observation-Ready' | 'Student-Friendly' | 'Ministry-Style Formal';
export type TeachingModel = '5E' | 'Competency-based' | 'Inquiry-based' | 'Direct instruction' | 'Universal Design for Learning (UDL)';
export type LessonStatus = 'Not Started' | 'Planned' | 'Ready to Teach' | 'Taught' | 'Completed' | 'Skipped' | 'Postponed' | 'Needs Review' | 'Partially Taught' | 'Reteach Needed';

export type PacingStatus = 'Ahead' | 'On Track' | 'Slightly Behind' | 'Behind' | 'Urgent Adjustment Needed';

export interface AcademicEvent {
  id: string;
  title: string;
  type: 'Holiday' | 'Break' | 'Exam' | 'PD Day' | 'Event' | 'No School';
  startDate: string;
  endDate: string;
  isTeachingDay: boolean;
}

export interface AcademicCalendar {
  id?: string;
  schoolYear: string;
  startDate: string;
  endDate: string;
  cycles: {
    number: number;
    label?: string; // e.g., "Semester 1", "Quarter 1"
    startDate: string;
    endDate: string;
  }[];
  events: AcademicEvent[];
  createdBy: string;
}

export interface YearlyCurriculumMap {
  id?: string;
  grade: GradeLevel;
  subject: Subject;
  schoolYear: string;
  source?: string; // e.g., "My BZ Language Tree Standard 4 Teacher’s Guide"
  cycles: {
    cycleNumber: number;
    topics: {
      id: string;
      unitNumber?: string;
      unitTitle?: string;
      topic: string;
      subtopics: string[];
      outcomes: string[];
      estimatedWeeks: number;
      plannedWeekStart: number; // Week number in cycle
      priority: 'High' | 'Medium' | 'Low';
      status?: 'Not Started' | 'In Progress' | 'Completed' | 'Overdue' | 'Upcoming';
      studentBookPages?: string;
      workbookPages?: string;
      competencies?: string[];
      lessonFlow?: string[];
    }[];
    revisionWeeks: number[];
    assessmentWeeks: number[];
  }[];
  createdBy: string;
  createdAt: string;
}

export interface CyclePlan {
  id?: string;
  mapId: string;
  cycleNumber: number;
  grade: GradeLevel;
  subject: Subject;
  weeks: {
    weekNumber: number;
    dates: string;
    topic: string;
    subTopics: string[];
    outcomes: string[];
    lessonFocus: string[];
    resourcesNeeded: string[];
    assessmentOpportunities: string[];
    status: 'Ready' | 'Incomplete';
  }[];
  createdBy: string;
  createdAt: string;
}

export interface WeeklyTeachingPlan {
  id?: string;
  cyclePlanId: string;
  cycleNumber: number;
  weekNumber: number;
  startDate: string;
  endDate: string;
  grade: GradeLevel;
  subject: Subject;
  days: {
    day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';
    date: string;
    topic: string;
    outcome: string;
    lessonId?: string; // Link to actual LessonPlan
    isTeachingDay: boolean;
    reason?: string; // e.g., "Holiday"
    lessonSnapshot?: {
      about: string;
      learning: string;
      focus: string;
      flow: string;
    };
    learningObjectives?: LearningObjectivesStructure;
    learningObjectivesBoard?: {
      condition?: string;
      knowledge: string;
      skill: string;
      attitude: string;
      successCriteria: string[];
    };
  }[];
  isReadyToTeach: boolean;
  createdBy: string;
  createdAt: string;
}

export interface CoverageRecord {
  id?: string;
  grade: GradeLevel;
  subject: Subject;
  outcome: string;
  status: 'Not Covered' | 'Partially Covered' | 'Fully Covered' | 'Assessed' | 'Mastered';
  lastTaughtDate?: string;
  relatedLessonIds: string[];
  cycleNumber: number;
  createdBy: string;
}

export interface PacingMetrics {
  grade: GradeLevel;
  subject: Subject;
  cycleNumber: number;
  totalOutcomes: number;
  coveredOutcomes: number;
  plannedWeeks: number;
  currentWeek: number;
  status: PacingStatus;
  lessonsMissed: number;
  adjustmentSuggestions: string[];
}

export type MasteryLevel = 'Not taught' | 'Introduced' | 'Practiced' | 'Partially mastered' | 'Mastered' | 'Needs review' | 'Needs reteach';

export type LessonDeliveryStatus = 'Fully taught' | 'Partially taught' | 'Not completed' | 'Postponed' | 'Interrupted';

export type StudentUnderstandingLevel = 'Most understood' | 'Some understood' | 'Many struggled' | 'Needs reteaching' | 'Needs more practice';

export type ObjectiveMasteryStatus = 'Mastered' | 'Partially met' | 'Not met';

export interface AssessmentRecord {
  id?: string;
  userId?: string;
  classId?: string;
  className?: string;
  lessonId: string;
  lessonType: 'daily' | 'standalone';
  lessonTitle: string;
  grade: GradeLevel;
  subject: Subject;
  cycle: number;
  week?: number;
  outcome: string;
  date: string;
  deliveryStatus: LessonDeliveryStatus;
  understandingLevel: StudentUnderstandingLevel;
  objectiveMastery: ObjectiveMasteryStatus;
  classPerformanceNotes: {
    whatWentWell: string;
    whatStudentsStruggledWith: string;
    whatNeedsReteaching: string;
    behaviorPacingIssues: string;
    studentsNeedingSupport: string;
  };
  results: {
    studentsMastered: number;
    studentsNeedingSupport: number;
    commonErrors: string[];
    nextStepRecommendation: string;
  };
  misconceptionsLogged: string[];
  createdAt: string;
  createdBy: string;
}

export interface OutcomeMastery {
  id?: string;
  userId?: string;
  classId?: string;
  className?: string;
  outcome: string;
  grade: GradeLevel;
  subject: Subject;
  strand?: string;
  topic: string;
  status: MasteryLevel;
  lastAssessed: string;
  relatedLessonIds: string[];
  notes?: string;
  createdBy: string;
}

export interface StudentSupportFlag {
  id?: string;
  userId?: string;
  classId?: string;
  className?: string;
  category: string;
  description: string;
  studentCount: number;
  notes?: string;
  createdBy: string;
}

export interface MisconceptionLog {
  id?: string;
  userId?: string;
  classId?: string;
  className?: string;
  subject: Subject;
  topic: string;
  misconception: string;
  frequency: number;
  lastNoticed: string;
  suggestedCorrection?: string;
  createdBy: string;
}

export interface CurriculumEntry {
  id?: string;
  userId?: string;
  classId?: string;
  className?: string;
  grade: GradeLevel;
  subject: Subject;
  academicYear?: string;
  schoolYear?: string;
  strand?: string;
  topic: string;
  subtopic: string;
  learning_outcomes: string[];
  suggested_activities?: string[];
  assessment_ideas?: string[];
  resources?: string[];
  cycle?: number;
  term?: number;
  week?: number;
  suggestedLessons?: number;
  suggestedWeeks?: number;
  notes?: string;
  isAmbiguous?: boolean;
  createdAt: string;
  createdBy?: string;
}

export interface CurriculumUnit {
  id?: string;
  unitNumber: string;
  unitTitle: string;
  grade: GradeLevel;
  subject: Subject;
  outcomes: string[];
  competencies: string[];
  timeAllocation: string;
  weeklyBreakdown: {
    week: number;
    focus: string;
    activities: string[];
  }[];
  readingFocus: string;
  speakingListeningFocus: string;
  languageFocus: string;
  wordWorkFocus: string;
  writingFocus: string;
  studentBookPages: string;
  workbookPages: string;
  teachingNotes: string;
  supportSuggestions: string;
  extensionSuggestions: string;
  additionalSkillsPractice: string;
  answersGuidance?: string;
  source: string;
  createdBy: string;
  createdAt: string;
}

export type VideoMode = 'Teacher Explainer' | 'Animated Lesson' | 'Visual Slideshow' | 'Whiteboard' | 'Tutorial' | 'Vocabulary' | 'Revision';
export type VideoLength = '2 min' | '5 min' | '8 min' | '10 min';
export type VoiceTone = 'Calm' | 'Energetic' | 'Normal';
export type VoiceGender = 'Male' | 'Female';
export type VoicePace = 'Slow' | 'Normal';

export type AvatarStyle = 'Male Teacher' | 'Female Teacher' | 'Cartoon Character' | 'Robot Assistant';
export type AvatarPlacement = 'Corner' | 'Full Screen' | 'Split Screen';

export type VideoStatus = 'draft' | 'script_ready' | 'audio_ready' | 'visuals_ready' | 'rendering' | 'completed' | 'failed';

export interface VideoScene {
  id: string;
  title: string;
  narration: string;
  onScreenText: string[];
  visualDescription: string;
  visualUrl?: string;
  audioUrl?: string;
  teacherPrompt?: string;
  transition?: string;
  duration: number;
}

export interface LessonVideo {
  id: string;
  lessonId: string;
  title: string;
  mode: VideoMode;
  length: VideoLength;
  voiceSettings: {
    gender: VoiceGender;
    tone: VoiceTone;
    pace: VoicePace;
  };
  avatarSettings: {
    enabled: boolean;
    style: AvatarStyle;
    placement: AvatarPlacement;
  };
  script: string;
  scenes: VideoScene[];
  visuals: {
    id: string;
    type: string;
    description: string;
    url?: string;
  }[];
  resourcePack: {
    script: string;
    sceneNotes: string;
    printableVisuals: string[];
    worksheet: string;
    reviewQuestions: string[];
    vocabularyCards: { term: string; definition: string }[];
    recapPoster: string;
  };
  status: 'Draft' | 'Generating' | 'Ready' | 'Error';
  videoStatus: VideoStatus;
  stages: {
    script: 'Pending' | 'Generating' | 'Completed' | 'Error';
    scenes: 'Pending' | 'Generating' | 'Completed' | 'Error';
    visuals: 'Pending' | 'Generating' | 'Completed' | 'Error';
    voiceover: 'Pending' | 'Generating' | 'Completed' | 'Error';
    assembly: 'Pending' | 'Generating' | 'Completed' | 'Error';
  };
  finalVideoUrl?: string;
  thumbnailUrl?: string;
  fullNarrationAudioUrl?: string;
  videoDuration?: number;
  createdAt: string;
  updatedAt: string;
}

export interface VideoSupportPackage {
  suggestedVideo: {
    topic: string;
    explanation: string;
    timing: 'introduction' | 'explanation' | 'before group work' | 'during recap' | 'homework reinforcement';
    idealLength: string;
    purpose: string;
  };
  teacherGuidance: {
    beforeVideo: string;
    watchFor: string[];
    pausePoints: { timestamp: string; question: string }[];
    discussionQuestions: string[];
    misconceptions: string[];
    followUpActivity: string;
  };
  noInternetBackup: {
    simplifiedExplanation: string;
    visualSubstitute: string;
    boardDrawing: string;
    printableAlternative: string;
    oralPrompts: string[];
  };
  miniScript: {
    beforeVideo: string;
    afterVideo: string;
    comprehensionQuestions: string[];
    vocabularyToReinforce: string[];
  };
}

export interface VisualSupportPackage {
  visuals: {
    type: string;
    title: string;
    content: string;
    labels?: string[];
    keyFacts?: string[];
    studentFriendlyWording?: string;
    illustrationsNeeded?: string;
  }[];
}

export interface BoardVisualPlan {
  title: string;
  layout: string;
  sections: {
    heading: string;
    content: string;
    visuals?: string;
  }[];
  workedExamples: string[];
  keyNotes: string[];
}

export interface MaterialPackage {
  items: {
    name: string;
    quantity: string;
    stage: 'Introduction' | 'Development' | 'Group Work' | 'Assessment' | 'Homework' | 'Teacher-Only' | 'Student' | 'Optional';
    prepInstructions: string;
    substitute?: string;
  }[];
  generalPrep: string[];
}

export interface DemonstrationSupport {
  steps: {
    action: string;
    observation: string;
    question: string;
    conclusion: string;
  }[];
  modelingTips: string[];
}

export interface LessonResource {
  id: string;
  type: string; // 'Worksheet' | 'Quiz' | 'Teacher Notes' | 'Board Notes' | 'Homework' | 'Answer Key' | 'Student Notes' | 'Activity Sheet' | 'Assessment' | 'Flashcards' | 'Graphic Organizer' | 'Exit Ticket' | 'Rubric' | 'Anchor Chart' | 'Class Activity' | 'PowerPoint';
  title: string;
  content: string; // Markdown
  version: 'Support' | 'Standard' | 'Challenge';
  createdAt: string;
}

export interface TeachingResources {
  teacherMaterials: {
    notes: string;
    script: string;
    boardWork: string;
    keyPoints: string[];
    vocabulary: { term: string; definition: string }[];
    guidedQuestions: { question: string; expectedResponse: string }[];
    misconceptions: string[];
    differentiationTips: string[];
    assessmentCheckpoints: string[];
  };
  studentMaterials: {
    worksheets: string[];
    classwork: string[];
    groupWork: string[];
    independentPractice: string[];
    homework: string;
    exitTicket: string;
    quiz: string;
    notebookNotes: string;
  };
  visualMaterials: {
    boardLayout: string;
    anchorChart: string;
    posterContent: string;
    flashcards: string[];
    graphicOrganizers: string[];
    slideDeck: string;
  };
  interactiveMaterials: {
    warmUp: string;
    icebreaker: string;
    handsOnActivity: string;
    pairShare: string;
    discussionPrompts: string[];
    rolePlay: string;
    games: string[];
    movementActivity: string;
    stations: string[];
  };
  assessmentMaterials: {
    observationChecklist: string[];
    rubric: string;
    formativeAssessment: string;
    oralQuestioning: string[];
    answerKey: string;
    successCriteria: string[];
    masteryIndicators: string[];
  };
}

export interface LessonPhase {
  phase: 'Introduction' | 'Explicit Teaching' | 'Guided Practice' | 'Independent Practice' | 'Closure';
  timeAllocation: string;
  teacherActions: string[];
  studentActions: string[];
  questionsToAsk: string[];
  engagementStrategy?: string;
  materialsUsed: string[];
  expectedStudentResponse?: string;
  assessmentOpportunity?: string;
  explanationModeling?: string;
  keyConceptFocus?: string;
  misconceptionsToWatchFor?: string[];
  supportScaffolding?: string;
  checkForUnderstanding?: string;
  expectedOutcome?: string;
  studentTask?: string;
  teacherMonitoringActions?: string[];
  expectedProductOutput?: string;
  supportOptions?: string[];
  successCriteria?: string[];
  teacherWrapUp?: string;
  studentSummaryExitResponse?: string;
  reflectionPromptExitQuestion?: string;
  keyTakeaway?: string;
  homeworkTransitionLink?: string;
  ongoingAssessment: {
    observe: string;
    evidenceOfLearning: string;
    misconceptions: string[];
    checkUnderstanding: string;
  };
}

export interface StructuredMaterial {
  name: string;
  quantity?: string;
  purpose: string;
  lessonPhase: string;
  resourceType: 'worksheet' | 'visual' | 'manipulative' | 'chart' | 'slide' | 'printable' | 'digital';
}

export interface AssessmentBoard {
  type: string;
  studentTask: string;
  evidenceOfLearning: string;
  criteriaForSuccess: string[];
  masteryIndicator: string;
  assessmentTool: string;
}

export interface DifferentiationFramework {
  strugglingLearners: {
    scaffolds: string[];
    visuals: string[];
    manipulatives: string[];
    simplifiedInstructions: string;
    guidedSupport: string;
  };
  onLevelLearners: {
    participationExpectations: string;
    independentWorkExpectations: string;
    peerCollaboration: string;
  };
  advancedLearners: {
    challengeTasks: string[];
    deeperThinkingPrompts: string[];
    extensionActivity: string;
    leadershipRole: string;
  };
  inclusionSupport: {
    dyslexia?: string;
    dyscalculia?: string;
    ell?: string;
    behavior?: string;
    sensory?: string;
  };
}

export interface TeacherQuickReference {
  standard: string;
  subject: string;
  cycle: number | string;
  strand?: string;
  topic: string;
  learningOutcome: string;
  objective: string;
  keyConcept: string;
  essentialVocabulary: string[];
  prerequisiteKnowledge: string;
  materials: string[];
  teachingStrategy: string;
  assessment: string;
  masteryTarget: string;
  duration: string;
}

export interface LessonAtAGlanceRow {
  time: string;
  timeMinutes: number;
  stage: string;
  teacherDoes: string;
  studentsDo: string;
}

export interface TeacherPreparationBriefing {
  whatYouNeedToKnow: {
    conceptSummary: string;
    whatItMeans: string;
    whyItMatters: string;
    howItWorks: string;
    importantRules: string[];
    importantTerminology: string[];
    connectionsToPriorLearning: string;
    realWorldApplications: string;
  };
}

export interface KeyVocabularyEntry {
  term: string;
  teacherDefinition: string;
  studentDefinition: string;
  exampleSentence?: string;
}

export interface PrerequisiteDiagnostic {
  requiredConcepts: string[];
  requiredSkills: string[];
  diagnosticCheck: {
    teacherAsks: string;
    expectedResponse: string;
    ifStudentsCannotAnswer: string;
  };
}

export interface CommonMisconceptionEntry {
  misconception: string;
  correctUnderstanding: string;
  teacherCorrectionLanguage: string;
}

export interface TeachMeThisTopicBriefing {
  whatIsThisTopic: string;
  whyItMatters: string;
  mostImportantIdeas: string[];
  mustUnderstandBeforeTeaching: string;
  howToExplainSimply: string;
  firstExampleToUse: string;
  mistakesToWatchFor: string[];
  quickCheckUnderstanding: string;
}

export interface TeacherScriptFull {
  opening: string;
  introduction: string;
  explanation: string;
  modeling: string;
  questioning: string[];
  transitions: string[];
  directions: string;
  feedbackLanguage: string;
  correctionPrompts: string;
  closing: string;
}

export interface InstructionalSequence {
  iDo: {
    teacherAction: string;
    teacherExplanation: string;
    workedExample: string;
    thinkAloud: string;
    expectedStudentObservation: string;
  };
  weDo: {
    tasks: string[];
    teacherPrompts: string[];
    expectedResponses: string[];
    correctAnswers: string[];
    feedbackLanguage: string;
    correctionPrompts: string;
  };
  youDo: {
    studentTasks: string[];
    problemsOrPassages: string[];
    activities: string[];
    successCriteria: string;
  };
}

export interface WorkedExampleItem {
  subjectType: 'Mathematics' | 'Language Arts' | 'Science' | 'Belizean Studies / Social Studies' | 'General';
  problemOrContext: string;
  stepByStepSolution?: { step: number; action: string; explanation: string }[];
  finalAnswerOrModelResponse: string;
  commonErrorOrScientificReasoning?: string;
  belizeanContextNote?: string;
}

export interface BloomQuestionBank {
  recall: { question: string; expectedAnswer: string }[];
  understanding: { question: string; expectedAnswer: string }[];
  application: { question: string; expectedAnswer: string }[];
  analysis: { question: string; expectedAnswer: string }[];
  evaluation?: { question: string; expectedAnswer: string }[];
  creation?: { questionOrTask: string; expectedOutput: string }[];
}

export interface FormativeCheckItem {
  checkType: string;
  teacherAsksOrDoes: string;
  studentsDo: string;
  expectedResponse: string;
  ifCorrect: string;
  ifIncorrect: string;
}

export interface StrugglingRemediation {
  signsOfConfusion: string[];
  likelyCause: string;
  simplerExplanation: string;
  alternativeExample: string;
  additionalGuidedPractice: string;
  visualOrManipulativeOption: string;
  reteachingStrategy: string;
  followUpCheck: string;
}

export interface CommonErrorItem {
  likelyError: string;
  whyItHappens: string;
  teacherResponse: string;
  correctiveExample: string;
}

export interface ReadyToTeachItem {
  id: string;
  label: string;
  checked: boolean;
}

export interface CompleteAssessmentPackage {
  task: string;
  expectedResponse: string;
  answerKey: string;
  rubric?: { criteria: string; exemplary: string; proficient: string; developing: string }[];
  masteryCriteria: string;
}

export interface GeneratedStudentMaterial {
  title: string;
  type: 'worksheet' | 'reading_passage' | 'vocabulary_cards' | 'problem_set' | 'graphic_organizer' | 'exit_ticket' | 'quiz' | 'activity_cards';
  content: string;
  answerKey?: string;
}

export interface BelizeanContextDetails {
  contextConnection: string;
  communityApplication: string;
  culturalOrEnvironmentalExample?: string;
}

export interface LessonPlan {
  id?: string;
  userId?: string;
  classId?: string;
  className?: string;
  grade: GradeLevel;
  subject: Subject;
  academicYear?: string;
  topic: string;
  subtopic: string;
  strand?: string;
  learningOutcome: string;
  lessonType?: string;
  teachingMode?: string;
  teachingStrategies?: string[];
  methodology?: string;
  weeklyGoalConnection?: string;
  lessonTitle: string;
  duration: string;
  teachingModel: TeachingModel;
  style: OutputStyle;
  includeTeacherScript: boolean;
  includeDifferentiation: boolean;
  content: string;
  structured_json: any;
  createdAt: string;
  createdBy: string;
  cycle: number;
  week?: number;
  day?: number;
  date?: string;
  
  // New Structured Fields
  lessonSnapshot: {
    about: string;
    learning: string;
    focus: string;
    flow: string;
  };
  learningObjectives?: LearningObjectivesStructure;
  learningObjectivesBoard: {
    condition?: string;
    knowledge: string;
    skill: string;
    attitude?: string;
    cognitive?: string;
    psychomotor?: string;
    affective?: string;
    successCriteria: string[];
  };
  priorKnowledgeActivation: {
    whatTheyKnow: string;
    activationStrategy: string;
    misconceptionsToAnticipate: string[];
  };
  vocabularyFocus: {
    keyVocabulary: { term: string; definition: string; academicLanguage?: boolean; pronunciation?: string }[];
  };
  materialsBoard: StructuredMaterial[];
  executionBoard: LessonPhase[];
  finalAssessmentBoard: AssessmentBoard;
  differentiationFramework: DifferentiationFramework;
  closurePanel: {
    recap: string;
    demonstration: string;
    exitQuestion: string;
    nextLessonConnection: string;
    homeworkLink?: string;
  };
  reflectionDashboard: {
    whatWorked: string;
    needsImprovement: string;
    followUpStudents: string[];
    nextSteps: string;
  };
  homeworkExtension?: {
    task: string;
    purpose: string;
    type: string;
    materials: string[];
    submissionFormat?: string;
  };
  resourceMapping: {
    resourceName: string;
    phaseUsed: string;
    purpose: string;
    type: string;
  }[];

  // Legacy/Optional fields
  previousKnowledge?: string;
  generalObjective?: string;
  specificObjectives: string[];
  keyVocabulary: string[];
  materials: string[];
  introduction?: string[];
  development?: string[];
  guidedPractice?: string[];
  independentPractice?: string[];
  closure?: string[];
  differentiation?: string[];
  assessment?: string[];
  homework?: string[];
  reflection?: string;
  teacherScript?: string;
  studentTeacherName?: string;
  classSize?: string;
  ageRange?: string;
  status?: LessonStatus;
  source?: string;
  unitUsed?: string;
  pagesUsed?: string;
  weekUsed?: string;
  teachingResources?: TeachingResources;
  videoAssistant?: VideoSupportPackage;
  lessonVideo?: LessonVideo;
  inDepthVisuals?: VisualSupportPackage;
  boardVisualPlan?: BoardVisualPlan;
  exactMaterials?: MaterialPackage;
  demonstrationSupport?: DemonstrationSupport;
  resourcePack?: LessonResource[];
  beforeClassChecklist?: { task: string; completed: boolean }[];
  materialsNeeded?: string[];
  suggestedAddOns?: { type: string; suggestion: string }[];
  isReadyToTeach?: boolean;
  
  // Teacher-Independent Instructional Coach System Fields
  teacherQuickReference?: TeacherQuickReference;
  lessonAtAGlance?: LessonAtAGlanceRow[];
  teacherPreparation?: TeacherPreparationBriefing;
  keyVocabularyTable?: KeyVocabularyEntry[];
  prerequisiteDiagnostic?: PrerequisiteDiagnostic;
  commonMisconceptionsTable?: CommonMisconceptionEntry[];
  teachMeThisTopic?: TeachMeThisTopicBriefing;
  teacherScriptDetailed?: TeacherScriptFull;
  instructionalSequence?: InstructionalSequence;
  workedExamplesList?: WorkedExampleItem[];
  bloomQuestionBank?: BloomQuestionBank;
  formativeChecksList?: FormativeCheckItem[];
  ifStudentsAreStruggling?: StrugglingRemediation;
  commonErrorsTable?: CommonErrorItem[];
  readyToTeachChecklist?: ReadyToTeachItem[];
  completeAssessment?: CompleteAssessmentPackage;
  studentMaterials?: GeneratedStudentMaterial[];
  belizeanContextDetails?: BelizeanContextDetails;

  // Language Arts Master 2-Component Architecture & Complete Resources
  languageArtsComponents?: [LanguageArtsComponent, LanguageArtsComponent] | LanguageArtsComponent[];
  component1Details?: LanguageArtsComponentDetails;
  component2Details?: LanguageArtsComponentDetails;
  readingPassageFull?: ReadingPassageResource;
  anchorChartBlueprint?: AnchorChartBlueprint;
  exitTicketPackage?: ExitTicketPackage;

  updatedAt?: any;
}

export type LanguageArtsComponent = 
  | 'Comprehension — Oral Expression and Listening'
  | 'Phonological Awareness'
  | 'Phonics and Word Recognition'
  | 'High Frequency Words'
  | 'Production and Language Structure — Writing and Composition';

export const LANGUAGE_ARTS_5_COMPONENTS: LanguageArtsComponent[] = [
  'Comprehension — Oral Expression and Listening',
  'Phonological Awareness',
  'Phonics and Word Recognition',
  'High Frequency Words',
  'Production and Language Structure — Writing and Composition'
];

export interface LanguageArtsComponentDetails {
  name: LanguageArtsComponent;
  timeAllocation: string;
  explicitTeachingScript: string;
  guidedPracticeTask: string;
  formativeCheck: {
    teacherAsks: string;
    expectedResponse: string;
    ifCorrect: string;
    ifIncorrect: string;
  };
}

export interface ReadingPassageResource {
  title: string;
  wordCount: number;
  gradeLevel: string;
  genre?: string;
  content: string;
  vocabularyHighlighted?: string[];
  comprehensionQuestions?: { question: string; answer: string; cognitiveLevel?: string }[];
}

export interface AnchorChartBlueprint {
  title: string;
  layout: string;
  headerText: string;
  keyRulesOrDefinitions: string[];
  visualDiagramDescription: string;
  studentKeyTakeaway: string;
}

export interface ExitTicketPackage {
  title: string;
  prompt: string;
  questions: { question: string; answerKey: string; points?: number }[];
  scoringGuidance: string;
  masteryThreshold: string;
  groupingRuleTomorrow: string;
}

export interface LanguageArtsDailyStrand {
  strand: string;
  timeAllocation: string;
  objective: string;
  activities: string[];
  teacherGuidance: {
    whatToSay: string;
    whatToAsk: string;
    examples: string[];
    studentTasks: string;
  };
  assessment: string;
  resources: string[];
}

export interface LanguageArtsDailyPlan {
  day: number;
  date: string;
  strands: LanguageArtsDailyStrand[];
  differentiation: {
    support: string;
    onLevel: string;
    advanced: string;
  };
}

export type LanguageArtsWeeklyStructure = 'Recommended' | 'Alternative';

export interface LanguageArtsWeeklyPlan {
  id?: string;
  userId?: string;
  classId?: string;
  className?: string;
  grade: GradeLevel;
  subject: 'Language Arts';
  cycle: number;
  week: number;
  theme: string;
  learningOutcomes: string[];
  structure: LanguageArtsWeeklyStructure;
  days: LanguageArtsDailyPlan[];
  resourcePack: {
    readingPassage?: string;
    vocabularyList: string[];
    highFrequencyWords: string[];
    phonicsPractice: string;
    grammarPractice: string;
    writingPrompt: string;
    worksheetIdeas: string[];
    oralQuestioningPrompts: string[];
    comprehensionQuestions: string[];
    anchorChartSuggestions: string[];
    printableVisuals: string[];
  };
  createdAt: string;
  createdBy: string;
}

export interface WeeklyCurriculumPlan {
  id?: string;
  userId?: string;
  classId?: string;
  className?: string;
  grade_level: GradeLevel;
  grade?: GradeLevel;
  subject: Subject;
  academicYear?: string;
  schoolYear?: string;
  cycle: number;
  week_number: number;
  weekly_topic: string;
  weekly_subtopics: string[];
  weekly_learning_outcomes: string[];
  weekly_big_idea: string;
  weekly_skill_progression: string;
  number_of_days: number;
  daily_lesson_titles: string[];
  daily_objectives: string[][];
  daily_breakdown_table: {
    day: number;
    lessonTitle: string;
    focus: string;
    objectiveSummary: string;
    mainActivity: string;
    assessmentCheck: string;
    // New structured fields for better daily guidance
    lessonSnapshot?: {
      about: string;
      learning: string;
      focus: string;
      flow: string;
    };
    learningObjectives?: LearningObjectivesStructure;
    learningObjectivesBoard?: {
      condition?: string;
      knowledge: string;
      skill: string;
      attitude: string;
      successCriteria: string[];
    };
    materialsBoard?: StructuredMaterial[];
    executionBoard?: LessonPhase[];
  }[];
  suggested_assessment: string;
  teacher_notes: string;
  duration?: string;
  createdAt: string;
  createdBy: string;
}

export interface WeeklyLessonPlan {
  id?: string;
  week: {
    grade: GradeLevel;
    subject: Subject;
    topic: string;
    days: {
      day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';
      lesson: LessonPlan;
    }[];
  };
  createdAt: string;
  createdBy: string;
}

export type CalendarDayType = 
  | 'Regular School Day' 
  | 'Weekend' 
  | 'Public Holiday' 
  | 'School Holiday / Break' 
  | 'Teacher Planning Day' 
  | 'School Planning Day'
  | 'Professional Development Day' 
  | 'Exam / Test Week' 
  | 'Sports Day' 
  | 'Parent Meeting Day' 
  | 'School Event / Special Event' 
  | 'Half Day' 
  | 'No School Day' 
  | 'Emergency Closure / Makeup Day';

export interface CalendarDayEntry {
  id: string;
  date: string; // YYYY-MM-DD
  type: CalendarDayType;
  isTeachingDay: boolean;
  subject?: Subject;
  grade?: GradeLevel;
  topic?: string;
  subtopic?: string;
  lessonTitle?: string;
  objective?: string;
  cycle?: number;
  week?: number;
  dayNumber?: number; // Sequence number in the cycle/term
  holidayName?: string;
  notes?: string;
  learningOutcomes?: string[];
  status?: LessonStatus;
  lessonPlanId?: string;
}

export interface YearlyCalendarPlan {
  id?: string;
  userId?: string;
  classId?: string;
  className?: string;
  grade: GradeLevel;
  subject: Subject;
  schoolYear: string; // e.g., "2025-2026"
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  days: CalendarDayEntry[];
  metadata: {
    totalWeeks: number;
    totalTeachingDays: number;
    totalHolidays: number;
    totalBreakDays: number;
    cycleBreakdown: {
      cycle: number;
      weeks: number;
      days: number;
    }[];
  };
  createdAt: string;
  createdBy: string;
}

export interface MasterCalendar {
  schoolYear: string;
  teachingPeriod: {
    start: string;
    end: string;
    weeks: number;
    schoolDays: number;
  };
  cycles: {
    cycle: number;
    start: string;
    end: string;
    weeks: number;
    days: number;
  }[];
  vacations: {
    name: string;
    start: string;
    end: string;
    weeks: number;
  }[];
  nonTeachingPeriods: {
    name: string;
    start: string;
    end: string;
    weeks: number;
  }[];
  holidays: {
    name: string;
    date: string;
    observed: string;
  }[];
  optionalSchoolDays: {
    name: string;
    management: string;
  }[];
}

export interface DailyLessonPlan {
  id?: string;
  userId?: string;
  classId?: string;
  className?: string;
  weekly_plan_id: string;
  day_number: number;
  lesson_title: string;
  topic: string;
  subtopic: string;
  grade: GradeLevel;
  subject: Subject;
  learning_outcome: string;
  objectives: string[];
  content: string;
  structured_json: any;
  status?: LessonStatus;
  createdAt: string;
  createdBy: string;
  // New fields for the execution system
  teachingResources?: TeachingResources;
  videoAssistant?: VideoSupportPackage;
  lessonVideo?: LessonVideo;
  inDepthVisuals?: VisualSupportPackage;
  boardVisualPlan?: BoardVisualPlan;
  exactMaterials?: MaterialPackage;
  demonstrationSupport?: DemonstrationSupport;
  resourcePack?: LessonResource[];
  beforeClassChecklist?: { task: string; completed: boolean }[];
  materialsNeeded?: string[];
  suggestedAddOns?: { type: string; suggestion: string }[];
  isReadyToTeach?: boolean;
  cycle?: number;
  week?: number;
  day?: number;
  focus?: string;
  objectiveSummary?: string;
  mainActivity?: string;
  assessmentCheck?: string;
  teacher_notes?: string;
}

export interface PacingWeek {
  weekNumber: number;
  dates?: string[]; // Actual dates for this week
  topic: string;
  subtopics: string[];
  strand?: string;
  duration: number; // in weeks, usually 1
  focus: string;
  learningOutcomes: string[];
  isReview?: boolean;
  isAssessment?: boolean;
  teachingDaysCount: number;
}

export interface CyclePacingMap {
  id?: string;
  userId?: string;
  classId?: string;
  className?: string;
  grade: GradeLevel;
  subject: Subject;
  cycle: number;
  totalWeeks: number;
  totalTeachingDays: number;
  weeks: PacingWeek[];
  warnings: string[];
  distributionMethod: 'Balanced' | 'Teacher-Controlled' | 'Priority-Based' | 'Outcome-Based';
  createdAt: string;
  createdBy: string;
}

export interface CurriculumCoverage {
  id?: string;
  grade: GradeLevel;
  subject: Subject;
  cycle: number;
  stats: {
    lessonsPlanned: number;
    lessonsTaught: number;
    lessonsMissed: number;
    outcomesCompleted: number;
    totalOutcomes: number;
    topicsCompleted: number;
    totalTopics: number;
  };
  pendingOutcomes: string[];
  behindSchedule: boolean;
  lastUpdated: string;
}

export type ResourceStatus = 'Not Generated' | 'Generated' | 'Edited' | 'Printed' | 'Downloaded' | 'Needs Review' | 'Archived';

export interface TeachingCollection {
  id?: string;
  name: string;
  description?: string;
  itemIds: { type: 'lesson' | 'resource' | 'plan'; id: string }[];
  createdBy: string;
  createdAt: string;
}

export interface SavedLesson {
  id?: string;
  userId?: string;
  classId?: string;
  className?: string;
  grade?: GradeLevel;
  lesson_plan_id: string;
  class_id: GradeLevel;
  createdBy: string;
  title: string;
  subject: Subject;
  topic: string;
  sub_topic?: string;
  cycle?: string;
  week?: string;
  duration?: string;
  learningObjectives?: LearningObjectivesStructure;
  learningObjectivesBoard?: {
    condition?: string;
    knowledge: string;
    skill: string;
    attitude?: string;
    successCriteria?: string[];
  };
  objectives?: string[];
  learning_outcomes?: string[];
  key_vocabulary?: string[];
  status: 'draft' | 'ready' | 'taught' | 'completed';
  last_opened: string;
  completion_status: Record<string, boolean>;
}

export type LessonResourceType = 
  | 'lesson_overview'
  | 'lesson_plan'
  | 'ai_video'
  | 'teacher_script'
  | 'board_plan'
  | 'demonstration'
  | 'visual_aids'
  | 'materials_prep'
  | 'worksheets'
  | 'assessment'
  | 'homework'
  | 'differentiation'
  | 'classroom_management'
  | 'reflection';

export interface LessonResourceNew {
  id: string;
  userId?: string;
  classId?: string;
  className?: string;
  grade?: GradeLevel;
  lesson_id: string;
  resource_type: LessonResourceType;
  title: string;
  content: any;
  html_content?: string;
  printable_content?: string;
  student_version?: string;
  teacher_version?: string;
  generated_by_ai: boolean;
  editable: boolean;
  version: number;
  updated_at: string;
  createdBy: string;
  createdAt?: string;
}

export interface LessonVisual {
  id: string;
  lesson_id: string;
  title: string;
  type: string;
  image_url: string;
  labels: string[];
  teacher_explanation: string;
  student_friendly_text: string;
  when_to_use: string;
  printable: boolean;
  fullscreen_enabled: boolean;
  created_at: string;
}

export interface LessonWorksheet {
  id: string;
  lesson_id: string;
  title: string;
  difficulty: 'support' | 'on_level' | 'challenge';
  worksheet_type: 'guided_practice' | 'independent_practice' | 'remediation' | 'extension';
  content: any;
  answer_key: any;
  student_mode: any;
  printable_pdf_url?: string;
  editable: boolean;
}

export interface LessonAssessment {
  id: string;
  lesson_id: string;
  assessment_type: string;
  questions: any[];
  answer_key: any[];
  success_criteria: string[];
  marking_guide: string[];
  tracker_enabled: boolean;
}

export interface LessonReflection {
  id: string;
  lesson_id: string;
  teacher_notes: string;
  what_went_well: string;
  student_difficulties: string;
  reteach_needed: boolean;
  next_lesson_suggestion: string;
  saved_at: string;
}

export interface FavoriteItem {
  id?: string;
  type: 'lesson' | 'resource' | 'plan' | 'cycle-plan';
  itemId: string;
  createdBy: string;
  createdAt: string;
}

export interface VersionRecord {
  id?: string;
  itemId: string;
  itemType: 'lesson' | 'resource' | 'plan';
  versionNumber: number;
  content: any;
  note?: string;
  createdBy: string;
  createdAt: string;
}

export interface UserSettings {
  schoolName: string;
  defaultAcademicYear?: string;
  defaultGrade: GradeLevel;
  defaultSubject: Subject;
  curriculumStructure: 'Terms' | 'Cycles';
  teachingModel?: TeachingModel;
  assignedClasses?: GradeLevel[];
  lastSelectedClass?: GradeLevel;
  lastSelectedClassId?: string;
  aiQuality: {
    defaultOutputStyle: OutputStyle;
    includeTeacherScript: boolean;
    includeDifferentiation: boolean;
    defaultDetailLevel: string;
    preferCompetencyObjectives: boolean;
    preferredTone: string;
  };
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string;
    email?: string;
    emailVerified?: boolean;
    isAnonymous?: boolean;
    tenantId?: string | null;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null, auth?: any) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid,
      email: auth?.currentUser?.email,
      emailVerified: auth?.currentUser?.emailVerified,
      isAnonymous: auth?.currentUser?.isAnonymous,
      tenantId: auth?.currentUser?.tenantId,
      providerInfo: auth?.currentUser?.providerData?.map((provider: any) => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export interface LessonResourcesResponse {
  grade: string;
  topic: string;
  resources: {
    id: string;
    type: 'worksheet' | 'flashcards' | 'visual_aid' | 'graphic_organizer';
    title: string;
    content: WorksheetContent | FlashcardContent | VisualAidContent | GraphicOrganizerContent;
  }[];
}

export interface WorksheetContent {
  sections: {
    title: string;
    instructions: string;
    questions: {
      id: string;
      text: string;
      type: 'multiple_choice' | 'short_answer' | 'true_false' | 'matching';
      options?: string[];
    }[];
  }[];
}

export interface FlashcardContent {
  cards: {
    front: string;
    back: string;
  }[];
}

export interface VisualAidContent {
  description: string;
  elements: {
    label: string;
    value: number | string;
    color?: string;
  }[];
}

export interface GraphicOrganizerContent {
  organizerType: 'venn' | 'story_map' | 'concept_map' | 'kwl';
  data: any;
}
