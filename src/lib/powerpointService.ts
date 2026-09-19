import pptxgen from "pptxgenjs";
import { PowerPointPresentation, PowerPointSlide, PowerPointSlideType } from "../types";

/**
 * Subject theme mapping for high contrast, classroom-ready presentations
 */
export function getThemeForSubject(subject?: string): PowerPointPresentation['theme'] {
  const s = (subject || '').toLowerCase();
  if (s.includes('math')) return 'modern_indigo';
  if (s.includes('science')) return 'emerald_nature';
  if (s.includes('social') || s.includes('history') || s.includes('geography')) return 'warm_amber';
  if (s.includes('language') || s.includes('english') || s.includes('reading')) return 'deep_ocean';
  return 'modern_indigo';
}

interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  bgDark: string;
  bgLight: string;
  textDark: string;
  textMuted: string;
  cardBg: string;
  border: string;
}

export function getThemeColors(theme: PowerPointPresentation['theme']): ThemeColors {
  switch (theme) {
    case 'emerald_nature':
      return {
        primary: '0F5132',
        secondary: '198754',
        accent: '20C997',
        bgDark: '062A1B',
        bgLight: 'F0FDF4',
        textDark: '14261C',
        textMuted: '4B6354',
        cardBg: 'FFFFFF',
        border: 'D1E7DD'
      };
    case 'warm_amber':
      return {
        primary: '9A3412',
        secondary: 'C2410C',
        accent: 'F97316',
        bgDark: '301107',
        bgLight: 'FFFBEB',
        textDark: '26150D',
        textMuted: '6B4F43',
        cardBg: 'FFFFFF',
        border: 'FED7AA'
      };
    case 'deep_ocean':
      return {
        primary: '0369A1',
        secondary: '0284C7',
        accent: '38BDF8',
        bgDark: '082F49',
        bgLight: 'F0F9FF',
        textDark: '0C2233',
        textMuted: '476277',
        cardBg: 'FFFFFF',
        border: 'BAE6FD'
      };
    case 'chalkboard_slate':
      return {
        primary: '334155',
        secondary: '475569',
        accent: '64748B',
        bgDark: '0F172A',
        bgLight: 'F8FAFC',
        textDark: '0F172A',
        textMuted: '475569',
        cardBg: 'FFFFFF',
        border: 'CBD5E1'
      };
    case 'modern_indigo':
    default:
      return {
        primary: '4338CA',
        secondary: '4F46E5',
        accent: '6366F1',
        bgDark: '1E1B4B',
        bgLight: 'EEF2FF',
        textDark: '1E1B4B',
        textMuted: '4338CA',
        cardBg: 'FFFFFF',
        border: 'C7D2FE'
      };
  }
}

/**
 * Builds a comprehensive, classroom-ready PowerPoint presentation deterministically
 * directly from the lesson plan fields. This guarantees presentation availability
 * with 100% reliability, zero hallucination, and instant responsiveness.
 */
export function buildDeterministicPowerPoint(lesson: any): PowerPointPresentation {
  const subject = typeof lesson.subject === 'object' && lesson.subject !== null
    ? (lesson.subject.name || lesson.subject.subject || 'General')
    : (lesson.subject || 'General');

  const grade = typeof lesson.grade === 'object' && lesson.grade !== null
    ? (lesson.grade.name || lesson.grade.grade || 'Standard')
    : (lesson.grade || lesson.class_id || lesson.className || 'Elementary');

  const topic = typeof lesson.topic === 'object' && lesson.topic !== null
    ? (lesson.topic.topic || lesson.topic.name || 'Lesson Topic')
    : (lesson.topic || lesson.title || 'Lesson Topic');

  const subtopic = lesson.subtopic || lesson.sub_topic || '';
  const title = lesson.lessonTitle || lesson.title || topic;
  const theme = getThemeForSubject(subject);

  // Extract Learning Objectives
  const objList: string[] = [];
  if (lesson.learningObjectivesBoard?.successCriteria && Array.isArray(lesson.learningObjectivesBoard.successCriteria)) {
    objList.push(...lesson.learningObjectivesBoard.successCriteria);
  } else if (lesson.specificObjectives && Array.isArray(lesson.specificObjectives)) {
    objList.push(...lesson.specificObjectives);
  } else if (lesson.objectives && Array.isArray(lesson.objectives)) {
    objList.push(...lesson.objectives);
  } else if (lesson.learningOutcome) {
    objList.push(lesson.learningOutcome);
  } else if (lesson.learning_outcomes && Array.isArray(lesson.learning_outcomes)) {
    objList.push(...lesson.learning_outcomes);
  }
  if (objList.length === 0) {
    objList.push(`Understand and apply key principles of ${topic}`);
    objList.push(`Demonstrate mastery through guided and independent practice`);
  }

  // Extract Vocabulary
  const vocabItems: { term: string; definition: string }[] = [];
  if (lesson.vocabularyFocus?.keyVocabulary && Array.isArray(lesson.vocabularyFocus.keyVocabulary)) {
    lesson.vocabularyFocus.keyVocabulary.forEach((v: any) => {
      if (typeof v === 'object' && v.term) {
        vocabItems.push({ term: v.term, definition: v.definition || '' });
      } else if (typeof v === 'string') {
        const parts = v.split(':');
        vocabItems.push({ term: parts[0].trim(), definition: parts[1]?.trim() || '' });
      }
    });
  } else if (lesson.keyVocabularyTable && Array.isArray(lesson.keyVocabularyTable)) {
    lesson.keyVocabularyTable.forEach((v: any) => {
      if (v.term) vocabItems.push({ term: v.term, definition: v.definition || '' });
    });
  } else if (Array.isArray(lesson.keyVocabulary)) {
    lesson.keyVocabulary.forEach((v: any) => {
      if (typeof v === 'object' && v.term) vocabItems.push(v);
      else if (typeof v === 'string') {
        const parts = v.split(':');
        vocabItems.push({ term: parts[0].trim(), definition: parts[1]?.trim() || '' });
      }
    });
  }
  if (vocabItems.length === 0) {
    vocabItems.push({ term: topic, definition: `The central concept and focal area of today's lesson.` });
  }

  // Extract Worked Examples
  const workedExamples: { problem: string; solution?: string }[] = [];
  if (lesson.workedExamplesList && Array.isArray(lesson.workedExamplesList)) {
    lesson.workedExamplesList.forEach((ex: any) => {
      workedExamples.push({
        problem: ex.problem || ex.example || ex.title || 'Model Problem',
        solution: ex.solution || ex.explanation || ex.steps?.join(' -> ') || 'Follow teacher modeling steps.'
      });
    });
  }

  // Extract Phases from Execution Board
  const phases = Array.isArray(lesson.executionBoard) ? lesson.executionBoard : [];
  const introPhase = phases.find((p: any) => p.phase?.toLowerCase().includes('intro') || p.phase?.toLowerCase().includes('hook') || p.phase?.toLowerCase().includes('engage'));
  const devPhase = phases.find((p: any) => p.phase?.toLowerCase().includes('direct') || p.phase?.toLowerCase().includes('teach') || p.phase?.toLowerCase().includes('explain') || p.phase?.toLowerCase().includes('dev'));
  const guidedPhase = phases.find((p: any) => p.phase?.toLowerCase().includes('guided') || p.phase?.toLowerCase().includes('we do') || p.phase?.toLowerCase().includes('explore'));
  const indepPhase = phases.find((p: any) => p.phase?.toLowerCase().includes('indep') || p.phase?.toLowerCase().includes('you do') || p.phase?.toLowerCase().includes('practice') || p.phase?.toLowerCase().includes('elaborate'));
  const closurePhase = phases.find((p: any) => p.phase?.toLowerCase().includes('clos') || p.phase?.toLowerCase().includes('eval') || p.phase?.toLowerCase().includes('summary') || p.phase?.toLowerCase().includes('exit'));

  // Prior Knowledge
  const priorKnowledge = lesson.priorKnowledgeActivation?.whatTheyKnow || 
    (typeof lesson.previousKnowledge === 'string' ? lesson.previousKnowledge : '') || 
    `Recall foundational concepts related to ${subject} and recent topics.`;
  const activationStrategy = lesson.priorKnowledgeActivation?.activationStrategy || 'Turn and talk to your partner for 1 minute.';

  // Build Slides Array
  const slides: PowerPointSlide[] = [];
  let slideNum = 1;

  // 1. Title Slide
  slides.push({
    id: `slide-${slideNum}`,
    slideNumber: slideNum++,
    slideType: 'title',
    title: String(title),
    subtitle: subtopic ? `${subtopic} • Grade: ${grade}` : `Grade: ${grade} • Subject: ${subject}`,
    bullets: [
      `Subject: ${subject}`,
      `Grade Level: ${grade}`,
      subtopic ? `Subtopic: ${subtopic}` : `Focus: ${topic}`,
      lesson.academicYear ? `Academic Year: ${lesson.academicYear}` : 'Classroom Presentation'
    ],
    teacherPromptOrNotes: `Welcome students. Introduce today's lesson: "${title}". Ensure all student notebooks and learning materials are prepared.`
  });

  // 2. Learning Objectives Slide
  slides.push({
    id: `slide-${slideNum}`,
    slideNumber: slideNum++,
    slideType: 'objectives',
    title: 'Learning Objectives & Success Criteria',
    subtitle: 'What we are learning to accomplish today',
    bullets: objList.slice(0, 4).map(o => o.startsWith('I can') || o.startsWith('Students') ? o : `I can ${o}`),
    teacherPromptOrNotes: 'Read through the success criteria with the class. Have students chorally read or rephrase the key "I can" statement in their own words.'
  });

  // 3. Warm-Up / Prior Knowledge Activation
  slides.push({
    id: `slide-${slideNum}`,
    slideNumber: slideNum++,
    slideType: 'warmup',
    title: 'Warm-Up: Think & Activate',
    subtitle: 'Connecting what we already know',
    bullets: [
      priorKnowledge,
      `Quick Challenge: ${activationStrategy}`,
      'Ready your mind to connect past learning with today\'s big idea!'
    ],
    teacherPromptOrNotes: 'Give students 90 seconds to think and share. Ask 2-3 non-volunteers to share their responses to activate engagement.'
  });

  // 4. Introduction to the Topic
  const hookSummary = lesson.lessonSnapshot?.focus || lesson.lessonSnapshot?.about || introPhase?.teacherAction || `Today we dive into ${topic}!`;
  slides.push({
    id: `slide-${slideNum}`,
    slideNumber: slideNum++,
    slideType: 'introduction',
    title: `Introduction: Understanding ${topic}`,
    subtitle: subtopic ? `Focus: ${subtopic}` : 'The Big Picture',
    bullets: [
      hookSummary,
      lesson.belizeanContextDetails?.contextConnection || lesson.weeklyGoalConnection || 'Notice how this concept appears all around us in daily life.',
      'Pay close attention to key patterns, terms, and processes!'
    ],
    teacherPromptOrNotes: 'Hook student interest by connecting this topic to real-world examples or classroom experiences.'
  });

  // 5. Key Concepts & Vocabulary
  slides.push({
    id: `slide-${slideNum}`,
    slideNumber: slideNum++,
    slideType: 'key_concepts',
    title: 'Key Vocabulary & Essential Concepts',
    subtitle: 'Important terms you will hear and use today',
    bullets: vocabItems.slice(0, 4).map(v => `${v.term}: ${v.definition}`),
    keyTerms: vocabItems.slice(0, 4),
    teacherPromptOrNotes: 'Pronounce each word clearly. Have students repeat each term twice. Ask a student to use the first term in a complete sentence.'
  });

  // 6. Teacher Explanation ("I Do")
  const teacherExplanationBullets: string[] = [];
  if (devPhase?.teacherAction) {
    teacherExplanationBullets.push(devPhase.teacherAction);
  }
  if (lesson.instructionalSequence?.stepByStepGuidance && Array.isArray(lesson.instructionalSequence.stepByStepGuidance)) {
    teacherExplanationBullets.push(...lesson.instructionalSequence.stepByStepGuidance.slice(0, 3).map((g: any) => typeof g === 'string' ? g : g.step || g.teacherAction));
  } else if (lesson.teachMeThisTopic?.coreExplanation) {
    teacherExplanationBullets.push(lesson.teachMeThisTopic.coreExplanation);
  }
  if (teacherExplanationBullets.length === 0) {
    teacherExplanationBullets.push(`Step 1: Identify the key features and structure of ${topic}.`);
    teacherExplanationBullets.push(`Step 2: Model the step-by-step strategy to analyze and solve problems.`);
    teacherExplanationBullets.push(`Step 3: Check for key signals, units, and accuracy.`);
  }

  slides.push({
    id: `slide-${slideNum}`,
    slideNumber: slideNum++,
    slideType: 'teacher_explanation',
    title: 'Teacher Explanation ("I Do")',
    subtitle: 'Watch and listen carefully as we model the process',
    bullets: teacherExplanationBullets.slice(0, 3),
    teacherPromptOrNotes: devPhase?.keyCheckForUnderstanding || 'Model thinking aloud: explain each decision step as you demonstrate on the board.'
  });

  // 7. Worked Examples Slide
  if (workedExamples.length > 0) {
    slides.push({
      id: `slide-${slideNum}`,
      slideNumber: slideNum++,
      slideType: 'worked_examples',
      title: 'Worked Example: Step-by-Step Model',
      subtitle: workedExamples[0].problem,
      bullets: [
        `Problem / Model: ${workedExamples[0].problem}`,
        `Step-by-Step Solution: ${workedExamples[0].solution || 'Step 1 -> Step 2 -> Final Answer'}`,
        'Remember: Double check each step before moving to the next.'
      ],
      practiceProblems: workedExamples.slice(0, 2),
      teacherPromptOrNotes: 'Work through the problem slowly. Highlight where common errors typically occur and how to avoid them.'
    });
  } else {
    slides.push({
      id: `slide-${slideNum}`,
      slideNumber: slideNum++,
      slideType: 'worked_examples',
      title: 'Worked Example: Model Demonstration',
      subtitle: `Demonstrating Mastery in ${topic}`,
      bullets: [
        `Example Problem: Applying ${topic} correctly in practice.`,
        'Step 1: Break down the given information into known parts.',
        'Step 2: Apply the proven rule or method systematically.',
        'Step 3: State the final verified answer clearly.'
      ],
      teacherPromptOrNotes: 'Annotate each step clearly on the projector or board.'
    });
  }

  // 8. Visual Representation or Diagram Slide
  const diagramBullets: string[] = [];
  if (lesson.boardVisualPlan?.modeledProblemSteps && Array.isArray(lesson.boardVisualPlan.modeledProblemSteps)) {
    diagramBullets.push(...lesson.boardVisualPlan.modeledProblemSteps.slice(0, 3));
  } else if (lesson.inDepthVisuals?.visualAids && Array.isArray(lesson.inDepthVisuals.visualAids)) {
    diagramBullets.push(...lesson.inDepthVisuals.visualAids.slice(0, 3).map((v: any) => v.title || v.description || ''));
  }
  if (diagramBullets.length === 0) {
    diagramBullets.push(`[Concept Map]: ${topic} -> Core Features -> Practical Application`);
    diagramBullets.push('Visual anchor: Connect key terms with directional arrows to trace relationships.');
  }

  slides.push({
    id: `slide-${slideNum}`,
    slideNumber: slideNum++,
    slideType: 'visual_diagram',
    title: 'Visual Representation & Diagram',
    subtitle: 'Visualizing the core relationships',
    bullets: diagramBullets.slice(0, 3),
    diagramText: `+-----------------------------------------+\n|       CENTRAL TOPIC: ${topic}       |\n+-----------------------------------------+\n                   |\n                   v\n  [Step 1]  --->  [Step 2]  --->  [Outcome]`,
    teacherPromptOrNotes: 'Draw or project this visual model. Have students sketch the diagram into their notebook.'
  });

  // 9. Guided Practice ("We Do")
  const guidedBullets: string[] = [];
  if (guidedPhase?.studentAction) {
    guidedBullets.push(guidedPhase.studentAction);
  }
  if (guidedPhase?.teacherAction) {
    guidedBullets.push(guidedPhase.teacherAction);
  }
  if (guidedBullets.length === 0) {
    guidedBullets.push('Work through this challenge together with your learning partner.');
    guidedBullets.push('Discuss each step aloud and justify your reasoning.');
    guidedBullets.push('Raise a thumbs up when your team has confirmed the answer.');
  }

  slides.push({
    id: `slide-${slideNum}`,
    slideNumber: slideNum++,
    slideType: 'guided_practice',
    title: 'Guided Practice ("We Do")',
    subtitle: 'Let\'s collaborate and solve together!',
    bullets: guidedBullets.slice(0, 3),
    teacherPromptOrNotes: 'Circulate around the room to observe student discussions. Spot-check 3 different pairs to verify understanding.'
  });

  // 10. Student Activity / Collaboration
  const activityBullets: string[] = [];
  if (indepPhase?.studentAction) {
    activityBullets.push(indepPhase.studentAction);
  }
  activityBullets.push('Collaboration Protocol: Share ideas respectfully, listen actively, and verify team results.');
  activityBullets.push('Time Allocated: 10 - 15 minutes.');

  slides.push({
    id: `slide-${slideNum}`,
    slideNumber: slideNum++,
    slideType: 'student_activity',
    title: 'Student Activity & Collaboration',
    subtitle: 'Hands-on practice in pairs or small groups',
    bullets: activityBullets.slice(0, 3),
    teacherPromptOrNotes: 'Keep time visible for students. Provide scaffolded hints for struggling groups and extension questions for fast finishers.'
  });

  // 11. Independent Practice ("You Do")
  slides.push({
    id: `slide-${slideNum}`,
    slideNumber: slideNum++,
    slideType: 'independent_practice',
    title: 'Independent Practice ("You Do")',
    subtitle: 'Show what you have mastered on your own',
    bullets: [
      'Complete the assigned practice problems in your notebook quietly.',
      'Show all your work and reasoning clearly step-by-step.',
      'Review your work against today\'s Success Criteria when finished.'
    ],
    teacherPromptOrNotes: 'Quiet focus time. Individual student work. Observe struggling students and provide targeted one-on-one mini-coaching.'
  });

  // 12. Assessment & Exit Ticket
  const exitQuestion = lesson.closurePanel?.exitQuestion || 
    (lesson.finalAssessmentBoard?.studentTask) || 
    `In 1-2 sentences, explain the key concept of ${topic} and one example of how it works.`;

  slides.push({
    id: `slide-${slideNum}`,
    slideNumber: slideNum++,
    slideType: 'assessment_exit',
    title: 'Exit Ticket & Quick Check',
    subtitle: 'Check for understanding before we wrap up',
    bullets: [
      `Exit Challenge: ${exitQuestion}`,
      'Write your answer on your exit slip or notebook.',
      'Submit before packing your supplies.'
    ],
    teacherPromptOrNotes: 'Collect exit slips as students transition. Use these to identify who needs reteaching or small-group support tomorrow.'
  });

  // 13. Lesson Summary & Wrap-Up
  const recap = lesson.closurePanel?.recap || `Today we mastered the fundamentals of ${topic}!`;
  const nextLesson = lesson.closurePanel?.nextLessonConnection || 'Tomorrow we will build on this by exploring more advanced applications.';

  slides.push({
    id: `slide-${slideNum}`,
    slideNumber: slideNum++,
    slideType: 'summary',
    title: 'Lesson Summary & Key Takeaways',
    subtitle: 'Celebrating today\'s learning',
    bullets: [
      recap,
      'Review: Check off the Learning Objectives we accomplished today!',
      `Looking Ahead: ${nextLesson}`
    ],
    teacherPromptOrNotes: 'Praise student effort and focus. Give a quick preview of tomorrow\'s lesson to build curiosity.'
  });

  return {
    id: `pres-${lesson.id || Date.now()}`,
    lessonId: lesson.id,
    title: String(title),
    subtitle: subtopic ? `${subtopic} (${grade})` : `${grade} • ${subject}`,
    subject,
    grade,
    topic,
    subtopic,
    theme,
    slides,
    generatedAt: new Date().toISOString(),
    version: 1
  };
}

/**
 * Calls backend AI service to generate a customized PowerPoint presentation.
 * Automatically falls back to deterministic generation if the API call fails or is unavailable.
 */
export async function generatePowerPointPresentation(lesson: any): Promise<PowerPointPresentation> {
  try {
    const { generateResource } = await import('../services/gemini');
    
    // Call server AI generator with timeout protection
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('AI generation timed out')), 20000)
    );

    const aiCall = (async () => {
      // First try dedicated generatePowerPoint if available
      try {
        const { callAi } = await import('../services/gemini') as any;
        if (typeof callAi === 'function') {
          return await callAi('generatePowerPoint', lesson);
        }
      } catch (e) {
        // Fallback to generateResource
      }
      return null;
    })();

    const result = await Promise.race([aiCall, timeoutPromise]) as any;

    if (result && Array.isArray(result.slides) && result.slides.length >= 6) {
      return {
        ...result,
        id: result.id || `pres-${lesson.id || Date.now()}`,
        lessonId: lesson.id,
        theme: result.theme || getThemeForSubject(lesson.subject),
        generatedAt: new Date().toISOString(),
        version: (lesson.powerpointPresentation?.version || 0) + 1
      };
    }
  } catch (err) {
    console.warn('AI PowerPoint generation fallback triggered:', err);
  }

  // Resilient deterministic builder ensures PowerPoint is NEVER missing
  return buildDeterministicPowerPoint(lesson);
}

/**
 * Exports a PowerPoint presentation to a true .pptx file using pptxgenjs.
 * Produces clean 16:9 widescreen slides with high-contrast color palettes,
 * structured cards, formatted bullets, and speaker notes.
 */
export async function exportPresentationToPPTX(presentation: PowerPointPresentation, customFilename?: string): Promise<void> {
  const pptx = new pptxgen();
  pptx.layout = 'LAYOUT_16x9';
  pptx.author = 'Lesson Planner AI';
  pptx.company = 'Elementary & Middle School Lesson Planner';
  pptx.title = presentation.title;
  pptx.subject = presentation.subject;

  const colors = getThemeColors(presentation.theme || getThemeForSubject(presentation.subject));

  presentation.slides.forEach((slide) => {
    const pptSlide = pptx.addSlide();
    pptSlide.background = { color: 'FFFFFF' };

    // Speaker Notes for the Teacher
    if (slide.teacherPromptOrNotes) {
      pptSlide.addNotes(slide.teacherPromptOrNotes);
    }

    if (slide.slideType === 'title') {
      // Modern Cover Slide
      // Top colored banner
      pptSlide.addShape(pptx.ShapeType.rect, {
        x: 0,
        y: 0,
        w: '100%',
        h: 2.2,
        fill: { color: colors.primary }
      });

      // Grade and Subject Badges
      pptSlide.addText(`${presentation.subject.toUpperCase()}  |  ${presentation.grade.toUpperCase()}`, {
        x: 0.8,
        y: 0.5,
        w: 8.5,
        h: 0.4,
        fontSize: 14,
        fontFace: 'Arial',
        bold: true,
        color: colors.accent,
        charSpacing: 2
      });

      // Presentation Title
      pptSlide.addText(slide.title, {
        x: 0.8,
        y: 0.9,
        w: 8.5,
        h: 1.1,
        fontSize: 32,
        fontFace: 'Arial',
        bold: true,
        color: 'FFFFFF'
      });

      // Subtitle / Topic details
      if (slide.subtitle) {
        pptSlide.addText(slide.subtitle, {
          x: 0.8,
          y: 2.4,
          w: 8.5,
          h: 0.5,
          fontSize: 18,
          fontFace: 'Arial',
          color: colors.textDark,
          bold: true
        });
      }

      // Content Card
      pptSlide.addShape(pptx.ShapeType.roundRect, {
        x: 0.8,
        y: 3.1,
        w: 8.4,
        h: 2.1,
        fill: { color: colors.bgLight },
        line: { color: colors.border, width: 1.5 },
        rectRadius: 0.15
      });

      const bulletsText = slide.bullets.map((b) => ({
        text: `•  ${b}\n`,
        options: { fontSize: 16, color: colors.textDark, fontFace: 'Arial', breakLine: true }
      }));

      pptSlide.addText(bulletsText, {
        x: 1.1,
        y: 3.3,
        w: 7.8,
        h: 1.7,
        valign: 'middle'
      });

      // Footer
      pptSlide.addText('Classroom-Ready Lesson Presentation  •  Auto-Generated', {
        x: 0.8,
        y: 5.2,
        w: 8.4,
        h: 0.3,
        fontSize: 11,
        color: colors.textMuted,
        fontFace: 'Arial'
      });

    } else {
      // Standard Classroom Slide
      // Top header bar
      pptSlide.addShape(pptx.ShapeType.rect, {
        x: 0,
        y: 0,
        w: '100%',
        h: 1.1,
        fill: { color: colors.primary }
      });

      // Slide Category Tag (e.g. OBJECTIVES, GUIDED PRACTICE)
      const categoryTag = slide.slideType.replace(/_/g, ' ').toUpperCase();
      pptSlide.addText(categoryTag, {
        x: 0.8,
        y: 0.15,
        w: 8.4,
        h: 0.25,
        fontSize: 11,
        fontFace: 'Arial',
        bold: true,
        color: colors.accent,
        charSpacing: 1.5
      });

      // Slide Title
      pptSlide.addText(slide.title, {
        x: 0.8,
        y: 0.35,
        w: 8.4,
        h: 0.65,
        fontSize: 24,
        fontFace: 'Arial',
        bold: true,
        color: 'FFFFFF'
      });

      // Subtitle if available
      if (slide.subtitle) {
        pptSlide.addText(slide.subtitle, {
          x: 0.8,
          y: 1.25,
          w: 8.4,
          h: 0.4,
          fontSize: 14,
          fontFace: 'Arial',
          italic: true,
          color: colors.secondary
        });
      }

      const contentStartY = slide.subtitle ? 1.75 : 1.45;
      const contentHeight = 5.2 - contentStartY;

      // Check for specialized slide types
      if (slide.slideType === 'key_concepts' && slide.keyTerms && slide.keyTerms.length > 0) {
        // Grid of vocabulary cards
        const terms = slide.keyTerms.slice(0, 4);
        terms.forEach((term, idx) => {
          const isLeft = idx % 2 === 0;
          const isTop = idx < 2;
          const cardX = isLeft ? 0.8 : 5.2;
          const cardY = contentStartY + (isTop ? 0 : 1.7);
          const cardW = 4.0;
          const cardH = 1.5;

          pptSlide.addShape(pptx.ShapeType.roundRect, {
            x: cardX,
            y: cardY,
            w: cardW,
            h: cardH,
            fill: { color: colors.bgLight },
            line: { color: colors.border, width: 1.2 },
            rectRadius: 0.1
          });

          pptSlide.addText(term.term, {
            x: cardX + 0.2,
            y: cardY + 0.15,
            w: cardW - 0.4,
            h: 0.35,
            fontSize: 16,
            fontFace: 'Arial',
            bold: true,
            color: colors.primary
          });

          pptSlide.addText(term.definition, {
            x: cardX + 0.2,
            y: cardY + 0.55,
            w: cardW - 0.4,
            h: 0.8,
            fontSize: 13,
            fontFace: 'Arial',
            color: colors.textDark
          });
        });
      } else if (slide.diagramText) {
        // Diagram / Visual slide with side-by-side text and diagram box
        // Left Column: Bullets
        const bulletsText = slide.bullets.map((b) => ({
          text: `•  ${b}\n\n`,
          options: { fontSize: 15, color: colors.textDark, fontFace: 'Arial', breakLine: true }
        }));

        pptSlide.addText(bulletsText, {
          x: 0.8,
          y: contentStartY,
          w: 4.2,
          h: contentHeight
        });

        // Right Column: Diagram Card
        pptSlide.addShape(pptx.ShapeType.roundRect, {
          x: 5.2,
          y: contentStartY,
          w: 4.0,
          h: contentHeight - 0.3,
          fill: { color: 'F8FAFC' },
          line: { color: colors.border, width: 1.5 },
          rectRadius: 0.1
        });

        pptSlide.addText('VISUAL MODEL / DIAGRAM', {
          x: 5.4,
          y: contentStartY + 0.15,
          w: 3.6,
          h: 0.3,
          fontSize: 12,
          fontFace: 'Arial',
          bold: true,
          color: colors.secondary
        });

        pptSlide.addText(slide.diagramText, {
          x: 5.4,
          y: contentStartY + 0.55,
          w: 3.6,
          h: contentHeight - 1.0,
          fontSize: 13,
          fontFace: 'Courier New',
          color: '1E293B'
        });
      } else {
        // Standard Content Card
        pptSlide.addShape(pptx.ShapeType.roundRect, {
          x: 0.8,
          y: contentStartY,
          w: 8.4,
          h: contentHeight,
          fill: { color: colors.bgLight },
          line: { color: colors.border, width: 1.2 },
          rectRadius: 0.12
        });

        const bulletsText = slide.bullets.map((b) => ({
          text: `•  ${b}\n\n`,
          options: { fontSize: 16, color: colors.textDark, fontFace: 'Arial', breakLine: true }
        }));

        pptSlide.addText(bulletsText, {
          x: 1.1,
          y: contentStartY + 0.25,
          w: 7.8,
          h: contentHeight - 0.5,
          valign: 'top'
        });
      }

      // Slide Footer: slide number and lesson topic
      pptSlide.addText(`${slide.slideNumber} / ${presentation.slides.length}`, {
        x: 8.0,
        y: 5.2,
        w: 1.2,
        h: 0.3,
        fontSize: 10,
        align: 'right',
        color: colors.textMuted,
        fontFace: 'Arial'
      });

      pptSlide.addText(`${presentation.topic}  •  ${presentation.grade}`, {
        x: 0.8,
        y: 5.2,
        w: 6.5,
        h: 0.3,
        fontSize: 10,
        color: colors.textMuted,
        fontFace: 'Arial'
      });
    }
  });

  const sanitized = (presentation.title || 'Lesson_Presentation')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .slice(0, 40);
  const finalFilename = customFilename || `${sanitized}_Presentation.pptx`;

  await pptx.writeFile({ fileName: finalFilename });
}
