import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  ChevronLeft, 
  ChevronRight, 
  MessageSquare, 
  HelpCircle, 
  AlertTriangle, 
  CheckCircle2, 
  Lightbulb, 
  Clock, 
  Users, 
  Sparkles, 
  X, 
  BookOpen, 
  Compass, 
  ShieldCheck, 
  Zap,
  ArrowRight
} from 'lucide-react';
import { LessonPlan } from '../types';
import { Button } from './ui/Button';
import { parseMinutes } from '../lib/timingValidation';

interface LiveTeachModeViewProps {
  plan: LessonPlan;
  onExitTeachMode: () => void;
  onOpenTeachMeTopic: () => void;
}

interface StageDetail {
  id: number;
  name: string;
  shortName: string;
  durationMinutes: number;
  teacherSays: string;
  teacherActions: string[];
  studentActions: string[];
  questionsToAsk: { question: string; expectedResponse: string }[];
  formativeCheck: {
    checkType: string;
    teacherAsks: string;
    studentsDo: string;
    expectedResponse: string;
    ifCorrect: string;
    ifIncorrect: string;
  };
  keyMisconceptionWarning?: string;
  materialsNeeded?: string[];
}

export const LiveTeachModeView: React.FC<LiveTeachModeViewProps> = ({
  plan,
  onExitTeachMode,
  onOpenTeachMeTopic
}) => {
  const [currentStageIdx, setCurrentStageIdx] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [assistDrawerOpen, setAssistDrawerOpen] = useState(false);
  const [assistTab, setAssistTab] = useState<'misconceptions' | 'workedExamples' | 'vocabulary' | 'struggling'>('misconceptions');

  // Build the 7 sequential stages using enriched lesson plan data
  const totalDurationMin = parseMinutes(plan.duration, 45);
  const script = plan.teacherScriptDetailed;
  const seq = plan.instructionalSequence;
  const formativeList = plan.formativeChecksList || [];
  const workedList = plan.workedExamplesList || [];
  const misconceptions = plan.commonMisconceptionsTable || [];

  const stageTimes = totalDurationMin === 30 
    ? [3, 5, 6, 7, 5, 2, 2]
    : totalDurationMin === 60 
    ? [7, 10, 12, 14, 10, 4, 3]
    : [5, 8, 9, 11, 7, 3, 2]; // 45 min default

  const stages: StageDetail[] = [
    {
      id: 1,
      name: "1. INTRODUCE: Hook, Context & Shared Objective",
      shortName: "1. Introduce",
      durationMinutes: stageTimes[0],
      teacherSays: script?.opening || `Good morning class! Look at the board. Today, we are exploring ${plan.topic}. By the end of this lesson, you will be able to master this skill independently.`,
      teacherActions: [
        "Display the lesson hook or everyday Belizean scenario on the board.",
        "State the One Shared Condition and student goal clearly.",
        "Activate prior knowledge using the quick 60-second diagnostic question."
      ],
      studentActions: [
        "Listen attentively and observe the opening scenario on the board.",
        "Repeat or record the lesson goal in exercise books.",
        "Respond chorally or with thumbs to the diagnostic prompt."
      ],
      questionsToAsk: [
        {
          question: plan.prerequisiteDiagnostic?.diagnosticCheck?.teacherAsks || `Who can recall how we used this concept in yesterday's lesson?`,
          expectedResponse: plan.prerequisiteDiagnostic?.diagnosticCheck?.expectedResponse || `Student explains or demonstrates the prerequisite step correctly.`
        }
      ],
      formativeCheck: {
        checkType: "Diagnostic Check",
        teacherAsks: plan.prerequisiteDiagnostic?.diagnosticCheck?.teacherAsks || "Show thumbs up if you are ready to begin!",
        studentsDo: "Signal thumbs up or whiteboard response",
        expectedResponse: "Clear readiness and engagement across the room",
        ifCorrect: "Proceed immediately to conceptual explanation",
        ifIncorrect: plan.prerequisiteDiagnostic?.diagnosticCheck?.ifStudentsCannotAnswer || "Provide a quick 30-second reminder on the anchor chart before proceeding."
      },
      keyMisconceptionWarning: misconceptions[0]?.misconception
    },
    {
      id: 2,
      name: "2. EXPLAIN: Core Concept & Academic Vocabulary",
      shortName: "2. Explain",
      durationMinutes: stageTimes[1],
      teacherSays: script?.explanation || `Let's break down the rule together. Notice how each step connects logically. Listen carefully to our key vocabulary term: ${plan.keyVocabularyTable?.[0]?.term || 'the core concept'}.`,
      teacherActions: [
        "Explicitly define the concept using the Student-Friendly Definition.",
        "Write the key terms on the vocabulary anchor wall.",
        "Break the rule into numbered, easy-to-follow steps."
      ],
      studentActions: [
        "Echo-read the student definition after the teacher.",
        "Record the term and definition in their notebooks.",
        "Track the anchor chart as the teacher demonstrates the rule."
      ],
      questionsToAsk: [
        {
          question: `In your own words, what does ${plan.keyVocabularyTable?.[0]?.term || 'this rule'} mean?`,
          expectedResponse: plan.keyVocabularyTable?.[0]?.studentDefinition || `Student restates the student definition accurately.`
        }
      ],
      formativeCheck: {
        checkType: "Turn and Talk Vocabulary Check",
        teacherAsks: `Turn to your shoulder partner: tell them the definition of ${plan.keyVocabularyTable?.[0]?.term || 'our term'} in 15 seconds!`,
        studentsDo: "Whisper explain definition to neighbor",
        expectedResponse: "Accurate peer explanations heard across pairs",
        ifCorrect: "Praise clear articulation and move into teacher modeling",
        ifIncorrect: "Reread the definition chorally from the board."
      },
      keyMisconceptionWarning: misconceptions[0]?.misconception
    },
    {
      id: 3,
      name: "3. MODEL (I DO): Teacher Demonstration & Think-Aloud",
      shortName: "3. I Do",
      durationMinutes: stageTimes[2],
      teacherSays: script?.modeling || `Watch me closely. I will solve this first example while thinking out loud. Notice how I write every step clearly on the board.`,
      teacherActions: [
        `Demonstrate ${workedList[0]?.problemOrContext || 'Worked Example #1'} step-by-step on the board.`,
        "Narrate inner thought process out loud: why each step is chosen and what error to avoid.",
        "Point to the anchor chart rules as each step is completed."
      ],
      studentActions: [
        "Pencils down. Eyes on the board observing teacher technique.",
        "Track each step as the teacher narrates.",
        "Observe the final verified answer written cleanly on the board."
      ],
      questionsToAsk: [
        {
          question: `Why did I check this step before moving to the final answer?`,
          expectedResponse: `To make sure our calculation/reasoning is accurate and avoids careless slips.`
        }
      ],
      formativeCheck: {
        checkType: "Observational Check",
        teacherAsks: "Raise your hand if you can tell me what step I performed first.",
        studentsDo: "Raise hands to identify Step 1",
        expectedResponse: "Students correctly name Step 1 of the procedure",
        ifCorrect: "Excellent! Now let's try one together.",
        ifIncorrect: "Highlight Step 1 again on the board with a colored marker."
      },
      keyMisconceptionWarning: misconceptions[1]?.misconception || misconceptions[0]?.misconception
    },
    {
      id: 4,
      name: "4. GUIDED PRACTICE (WE DO): Paired Work & Feedback",
      shortName: "4. We Do",
      durationMinutes: stageTimes[3],
      teacherSays: seq?.weDo?.teacherPrompts?.[0] || `Now let's do this second problem together. You will complete Step 1 on your mini-whiteboards or notebooks, then hold them up!`,
      teacherActions: [
        "Present the guided practice task to the entire class.",
        "Circulate rapidly across rows, checking whiteboards/notebooks.",
        "Offer immediate corrective prompts and verbal praise."
      ],
      studentActions: [
        "Work collaboratively in pairs or independently on mini-whiteboards.",
        "Display whiteboards simultaneously on teacher count.",
        "Explain reasoning to their partner when prompted."
      ],
      questionsToAsk: [
        {
          question: seq?.weDo?.tasks?.[0] || `What is the next step for this problem?`,
          expectedResponse: seq?.weDo?.correctAnswers?.[0] || `Students provide the correct intermediate value or step.`
        }
      ],
      formativeCheck: formativeList[0] ? {
        checkType: formativeList[0].checkType,
        teacherAsks: formativeList[0].teacherAsksOrDoes,
        studentsDo: formativeList[0].studentsDo,
        expectedResponse: formativeList[0].expectedResponse,
        ifCorrect: formativeList[0].ifCorrect,
        ifIncorrect: formativeList[0].ifIncorrect
      } : {
        checkType: "Whiteboard Check",
        teacherAsks: "Hold up your boards in 3, 2, 1... show me!",
        studentsDo: "Hold up boards simultaneously",
        expectedResponse: "At least 80% correct across all desks",
        ifCorrect: "Transition confidently to independent practice",
        ifIncorrect: "Guide the class through one additional shared example."
      },
      keyMisconceptionWarning: misconceptions[0]?.misconception
    },
    {
      id: 5,
      name: "5. INDEPENDENT PRACTICE (YOU DO): Student Tasks",
      shortName: "5. You Do",
      durationMinutes: stageTimes[4],
      teacherSays: script?.directions || `Now it's your turn to shine independently. Open your exercise books. Work quietly on problems 1 through 4. If you get stuck, check the anchor chart on the board first!`,
      teacherActions: [
        "Distribute or display the independent problem set.",
        "Circulate intentionally to support struggling students at their desks.",
        "Stamp or initial completed work to track pacing."
      ],
      studentActions: [
        "Work independently and quietly in exercise books.",
        "Show all calculations and step-by-step reasoning.",
        "Self-check work against the criteria for success on the board."
      ],
      questionsToAsk: [
        {
          question: `Which problem felt most challenging, and how did you verify your answer?`,
          expectedResponse: `Student points to intermediate step and explains their self-correction.`
        }
      ],
      formativeCheck: {
        checkType: "Desk-Side Check",
        teacherAsks: "Check student notebooks as you circulate: look for Step 2 execution.",
        studentsDo: "Work independently",
        expectedResponse: "Accurate execution of procedural steps",
        ifCorrect: "Give extension challenge problem to early finishers",
        ifIncorrect: "Pull a small group of 3-4 students to the back table for re-explanation."
      },
      keyMisconceptionWarning: misconceptions[1]?.misconception
    },
    {
      id: 6,
      name: "6. ASSESS: Formative Check & Exit Ticket",
      shortName: "6. Assess",
      durationMinutes: stageTimes[5],
      teacherSays: `Pencils down! Please complete your Exit Ticket problem on your slip of paper. Put your name at the top and do your best work independently.`,
      teacherActions: [
        "Distribute or display the Exit Ticket prompt.",
        "Monitor for strict independent effort.",
        "Collect slips at the door or front desk as students finish."
      ],
      studentActions: [
        "Complete the exit question silently on individual paper.",
        "Submit exit slips directly to the collection bin."
      ],
      questionsToAsk: [
        {
          question: plan.completeAssessment?.task || `Solve the exit ticket problem accurately.`,
          expectedResponse: plan.completeAssessment?.answerKey || `Accurate final answer matching the lesson mastery standard.`
        }
      ],
      formativeCheck: {
        checkType: "Exit Ticket Mastery Check",
        teacherAsks: "Review exit slips against the 80% mastery benchmark.",
        studentsDo: "Hand in exit tickets",
        expectedResponse: "80%+ of class achieves mastery criteria",
        ifCorrect: "Ready for next sequential curriculum outcome",
        ifIncorrect: "Schedule spiral warm-up review in tomorrow's opening."
      }
    },
    {
      id: 7,
      name: "7. CLOSE: Synthesis & Next Step Link",
      shortName: "7. Close",
      durationMinutes: stageTimes[6],
      teacherSays: script?.closing || `Outstanding work today class! You mastered ${plan.topic}. Tomorrow, we will build upon this foundation as we explore our next challenge. Pack your materials quietly.`,
      teacherActions: [
        "Lead a 60-second choral recap of today's big idea.",
        "Acknowledge student effort and perseverance.",
        "Preview how tomorrow's lesson connects directly to today's outcome."
      ],
      studentActions: [
        "Chorally state today's key takeaway.",
        "Pack notebooks and classroom materials neatly.",
        "Line up respectfully."
      ],
      questionsToAsk: [
        {
          question: `Who can give one real-world Belizean example where this skill is used?`,
          expectedResponse: plan.teacherPreparation?.whatYouNeedToKnow?.realWorldApplications || `Student mentions shopping, building, measurement, or community life in Belize.`
        }
      ],
      formativeCheck: {
        checkType: "Choral Closing",
        teacherAsks: "What was our big secret for success today?",
        studentsDo: "Respond chorally with the key rule",
        expectedResponse: "Enthusiastic and accurate choral response",
        ifCorrect: "Dismiss class warmly",
        ifIncorrect: "Brief reminder before dismissal"
      }
    }
  ];

  const currentStage = stages[currentStageIdx];
  const [secondsRemaining, setSecondsRemaining] = useState(currentStage.durationMinutes * 60);

  // When stage changes, reset timer
  useEffect(() => {
    setSecondsRemaining(stages[currentStageIdx].durationMinutes * 60);
    setIsTimerRunning(false);
  }, [currentStageIdx]);

  // Countdown timer tick
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining(prev => prev - 1);
      }, 1000);
    } else if (secondsRemaining === 0 && isTimerRunning) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, secondsRemaining]);

  const toggleTimer = () => setIsTimerRunning(!isTimerRunning);
  const resetTimer = () => {
    setIsTimerRunning(false);
    setSecondsRemaining(currentStage.durationMinutes * 60);
  };

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="relative min-h-[85vh] flex flex-col bg-gray-900 text-white rounded-3xl overflow-hidden shadow-2xl border border-gray-800">
      {/* Top Classroom Control Bar */}
      <div className="px-6 py-4 bg-gray-950/80 border-b border-gray-800 flex flex-wrap items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500 text-gray-950 flex items-center justify-center font-black shadow-md shadow-amber-500/20 shrink-0">
            <Zap className="w-5 h-5 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-950/60 border border-amber-800/60 px-2.5 py-0.5 rounded-full">
                Live Teach Mode
              </span>
              <span className="text-xs font-semibold text-gray-400">
                {plan.grade} • {plan.subject}
              </span>
            </div>
            <h2 className="text-lg font-black text-white tracking-tight mt-0.5 truncate max-w-md">
              {plan.topic}
            </h2>
          </div>
        </div>

        {/* Stage Timer Widget */}
        <div className="flex items-center gap-3 bg-gray-900 border border-gray-800 rounded-2xl px-4 py-2 shadow-inner">
          <div className="flex items-center gap-2">
            <Clock className={`w-5 h-5 ${secondsRemaining < 60 ? 'text-rose-400 animate-pulse' : 'text-amber-400'}`} />
            <span className={`font-mono text-2xl font-black ${secondsRemaining < 60 ? 'text-rose-400' : 'text-white'}`}>
              {formatTimer(secondsRemaining)}
            </span>
          </div>

          <div className="flex items-center gap-1 pl-2 border-l border-gray-800">
            <button
              onClick={toggleTimer}
              className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                isTimerRunning 
                  ? 'bg-amber-500 text-gray-950 hover:bg-amber-400' 
                  : 'bg-gray-800 text-gray-200 hover:bg-gray-700'
              }`}
              title={isTimerRunning ? "Pause timer" : "Start timer"}
            >
              {isTimerRunning ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
            </button>
            <button
              onClick={resetTimer}
              className="w-8 h-8 rounded-xl bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 flex items-center justify-center transition-colors"
              title="Reset timer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setAssistDrawerOpen(true)}
            className="h-9 px-3.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/50 text-indigo-200 text-xs font-bold flex items-center gap-2 transition-colors"
          >
            <Lightbulb className="w-4 h-4 text-indigo-400" />
            <span>Teacher Assist Drawer</span>
          </button>

          <Button
            onClick={onExitTeachMode}
            variant="outline"
            className="h-9 px-3.5 rounded-xl border-gray-700 text-gray-300 hover:bg-gray-800 text-xs font-bold"
          >
            Exit Teach Mode
          </Button>
        </div>
      </div>

      {/* 7-Stage Horizontal Stepper */}
      <div className="px-6 py-3 bg-gray-950/40 border-b border-gray-800/80 overflow-x-auto scrollbar-none shrink-0">
        <div className="flex items-center gap-2 min-w-max">
          {stages.map((st, idx) => {
            const isCurrent = idx === currentStageIdx;
            const isPassed = idx < currentStageIdx;
            return (
              <button
                key={st.id}
                onClick={() => setCurrentStageIdx(idx)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  isCurrent 
                    ? 'bg-amber-500 text-gray-950 shadow-md shadow-amber-500/20 scale-105' 
                    : isPassed
                    ? 'bg-gray-800/90 text-gray-300 hover:bg-gray-700'
                    : 'bg-gray-900 text-gray-500 hover:text-gray-300 hover:bg-gray-800/50'
                }`}
              >
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-black ${
                  isCurrent ? 'bg-gray-950 text-amber-400' : isPassed ? 'bg-emerald-500 text-gray-950' : 'bg-gray-800 text-gray-500'
                }`}>
                  {isPassed ? '✓' : idx + 1}
                </span>
                <span>{st.shortName}</span>
                <span className={`text-[10px] font-semibold opacity-80 ${isCurrent ? 'text-gray-900' : 'text-gray-500'}`}>
                  ({st.durationMinutes}m)
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Stage Content Display */}
      <div className="flex-1 p-6 sm:p-8 overflow-y-auto space-y-6">
        {/* Stage Title */}
        <div className="flex items-center justify-between gap-4 pb-2">
          <div>
            <span className="text-xs font-black uppercase tracking-widest text-amber-400">
              Stage {currentStage.id} of 7 • Allocated: {currentStage.durationMinutes} Minutes
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-0.5">
              {currentStage.name}
            </h1>
          </div>

          {currentStage.keyMisconceptionWarning && (
            <button
              onClick={() => {
                setAssistTab('misconceptions');
                setAssistDrawerOpen(true);
              }}
              className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs font-bold hover:bg-rose-900/60 transition-colors"
            >
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>Watch Out: {currentStage.keyMisconceptionWarning.slice(0, 35)}...</span>
            </button>
          )}
        </div>

        {/* PROMINENT TEACHER SCRIPT BOX */}
        <div className="rounded-3xl border border-amber-500/40 bg-gradient-to-br from-amber-500/10 via-gray-900 to-amber-950/20 p-6 sm:p-8 shadow-lg relative overflow-hidden">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-gray-950 flex items-center justify-center font-black shrink-0">
              <MessageSquare className="w-4 h-4 fill-current" />
            </div>
            <span className="text-xs font-black uppercase tracking-widest text-amber-400">
              TEACHER SAYS (Verbatim Script)
            </span>
          </div>

          <p className="text-lg sm:text-xl font-bold text-amber-50 leading-relaxed font-sans pl-1">
            "{currentStage.teacherSays}"
          </p>
        </div>

        {/* SIDE-BY-SIDE TEACHER ACTIONS & STUDENT ACTIONS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Teacher Actions */}
          <div className="rounded-2xl border border-gray-800 bg-gray-950/60 p-5 space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
              <h3 className="text-xs font-black uppercase tracking-wider text-blue-300">
                Teacher Actions & Moves
              </h3>
            </div>
            <ul className="space-y-2 text-sm text-gray-200">
              {currentStage.teacherActions.map((act, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 shrink-0" />
                  <span className="leading-relaxed font-medium">{act}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Student Actions */}
          <div className="rounded-2xl border border-gray-800 bg-gray-950/60 p-5 space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <h3 className="text-xs font-black uppercase tracking-wider text-emerald-300">
                Expected Student Actions
              </h3>
            </div>
            <ul className="space-y-2 text-sm text-gray-200">
              {currentStage.studentActions.map((act, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0" />
                  <span className="leading-relaxed font-medium">{act}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* QUESTIONS TO ASK WITH EXPECTED RESPONSES */}
        <div className="rounded-2xl border border-gray-800 bg-gray-950/60 p-5 space-y-4">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-indigo-400" />
            <h3 className="text-xs font-black uppercase tracking-wider text-indigo-300">
              Target Questions to Ask
            </h3>
          </div>

          <div className="space-y-3">
            {currentStage.questionsToAsk.map((qa, i) => (
              <div key={i} className="bg-gray-900/90 rounded-xl p-4 border border-gray-800 space-y-2">
                <div className="flex items-start gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-indigo-400 shrink-0 mt-0.5">Q:</span>
                  <p className="text-sm font-bold text-white leading-snug">"{qa.question}"</p>
                </div>
                <div className="flex items-start gap-2 pl-4 border-l-2 border-emerald-500/50">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 shrink-0 mt-0.5">Expected Answer:</span>
                  <p className="text-xs text-emerald-300 font-medium leading-relaxed">{qa.expectedResponse}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FORMATIVE CFU CHECK BANNER WITH IF CORRECT / IF INCORRECT */}
        <div className="rounded-2xl border border-indigo-500/30 bg-indigo-950/30 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-indigo-400" />
              <h3 className="text-xs font-black uppercase tracking-wider text-indigo-200">
                Check for Understanding: {currentStage.formativeCheck.checkType}
              </h3>
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-300 bg-indigo-900/60 px-2 py-0.5 rounded-full border border-indigo-700/60">
              Immediate Decision Rule
            </span>
          </div>

          <p className="text-xs font-bold text-indigo-100">
            Prompt: "{currentStage.formativeCheck.teacherAsks}"
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 text-xs">
            <div className="bg-emerald-950/50 rounded-xl p-3 border border-emerald-800/60 text-emerald-200 space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 block">✓ If Correct:</span>
              <p className="font-medium">{currentStage.formativeCheck.ifCorrect}</p>
            </div>
            <div className="bg-rose-950/50 rounded-xl p-3 border border-rose-800/60 text-rose-200 space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-rose-400 block">✕ If Incorrect:</span>
              <p className="font-medium">{currentStage.formativeCheck.ifIncorrect}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Stage Navigation Controls */}
      <div className="px-6 py-4 bg-gray-950 border-t border-gray-800 flex items-center justify-between gap-4 shrink-0">
        <Button
          onClick={() => setCurrentStageIdx(prev => Math.max(0, prev - 1))}
          disabled={currentStageIdx === 0}
          variant="outline"
          className="rounded-xl border-gray-700 text-gray-300 hover:bg-gray-800 disabled:opacity-30 h-10 px-4 text-xs font-bold flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous Stage</span>
        </Button>

        <div className="text-xs font-bold text-gray-400">
          Stage <span className="text-amber-400">{currentStageIdx + 1}</span> of {stages.length}
        </div>

        <Button
          onClick={() => setCurrentStageIdx(prev => Math.min(stages.length - 1, prev + 1))}
          disabled={currentStageIdx === stages.length - 1}
          className="rounded-xl bg-amber-500 hover:bg-amber-400 text-gray-950 disabled:opacity-30 h-10 px-5 text-xs font-black shadow-md shadow-amber-500/20 flex items-center gap-2"
        >
          <span>Next Stage</span>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* TEACHER ASSIST SLIDE-OVER DRAWER */}
      {assistDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex justify-end">
          <div 
            className="w-full max-w-lg bg-gray-900 border-l border-gray-800 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="p-5 border-b border-gray-800 flex items-center justify-between bg-gray-950 shrink-0">
              <div className="flex items-center gap-2.5">
                <Lightbulb className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-black uppercase tracking-wider text-white">
                  Teacher Assist Quick Lookup
                </h3>
              </div>
              <button
                onClick={() => setAssistDrawerOpen(false)}
                className="w-8 h-8 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Assist Tabs */}
            <div className="flex border-b border-gray-800 bg-gray-950/60 px-4 gap-2 text-xs font-bold shrink-0">
              <button
                onClick={() => setAssistTab('misconceptions')}
                className={`py-3 px-2 border-b-2 transition-colors ${
                  assistTab === 'misconceptions' ? 'border-rose-500 text-rose-400' : 'border-transparent text-gray-400 hover:text-gray-200'
                }`}
              >
                Misconceptions
              </button>
              <button
                onClick={() => setAssistTab('workedExamples')}
                className={`py-3 px-2 border-b-2 transition-colors ${
                  assistTab === 'workedExamples' ? 'border-teal-500 text-teal-400' : 'border-transparent text-gray-400 hover:text-gray-200'
                }`}
              >
                Worked Examples
              </button>
              <button
                onClick={() => setAssistTab('vocabulary')}
                className={`py-3 px-2 border-b-2 transition-colors ${
                  assistTab === 'vocabulary' ? 'border-purple-500 text-purple-400' : 'border-transparent text-gray-400 hover:text-gray-200'
                }`}
              >
                Vocabulary
              </button>
              <button
                onClick={() => setAssistTab('struggling')}
                className={`py-3 px-2 border-b-2 transition-colors ${
                  assistTab === 'struggling' ? 'border-amber-500 text-amber-400' : 'border-transparent text-gray-400 hover:text-gray-200'
                }`}
              >
                Struggling Tips
              </button>
            </div>

            {/* Assist Drawer Content */}
            <div className="flex-1 p-5 overflow-y-auto space-y-4 text-xs">
              {assistTab === 'misconceptions' && (
                <div className="space-y-3">
                  {misconceptions.map((m, i) => (
                    <div key={i} className="bg-gray-950 rounded-xl p-4 border border-rose-900/50 space-y-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-rose-400 block">
                        Watch Out For:
                      </span>
                      <p className="font-bold text-rose-200">{m.misconception}</p>
                      <div className="pt-2 border-t border-gray-800 space-y-1">
                        <span className="text-[10px] font-black uppercase tracking-wider text-indigo-400 block">
                          Say This to Correct It:
                        </span>
                        <p className="text-gray-300 italic">"{m.teacherCorrectionLanguage}"</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {assistTab === 'workedExamples' && (
                <div className="space-y-4">
                  {workedList.map((ex, i) => (
                    <div key={i} className="bg-gray-950 rounded-xl p-4 border border-teal-900/50 space-y-2.5">
                      <span className="text-[10px] font-black uppercase tracking-wider text-teal-400 block">
                        Model #{i + 1}: {ex.problemOrContext}
                      </span>
                      {ex.stepByStepSolution?.map(s => (
                        <div key={s.step} className="text-gray-300 pl-2 border-l border-teal-500/40">
                          <span className="font-bold text-white">Step {s.step}: {s.action}</span>
                          <p className="text-gray-400 text-[11px]">{s.explanation}</p>
                        </div>
                      ))}
                      <div className="pt-2 border-t border-gray-800 text-emerald-400 font-bold">
                        Final Answer: {ex.finalAnswerOrModelResponse}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {assistTab === 'vocabulary' && (
                <div className="space-y-3">
                  {plan.keyVocabularyTable?.map((v, i) => (
                    <div key={i} className="bg-gray-950 rounded-xl p-4 border border-purple-900/50 space-y-1.5">
                      <h4 className="font-black text-purple-300 text-sm">{v.term}</h4>
                      <p className="text-gray-300 font-medium">Student: "{v.studentDefinition}"</p>
                      <p className="text-gray-500 text-[11px]">Teacher: {v.teacherDefinition}</p>
                    </div>
                  ))}
                </div>
              )}

              {assistTab === 'struggling' && (
                <div className="space-y-3">
                  {plan.ifStudentsAreStruggling && (
                    <div className="bg-gray-950 rounded-xl p-4 border border-amber-900/50 space-y-3">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 block mb-1">
                          Simpler Explanation:
                        </span>
                        <p className="text-amber-100 italic">"{plan.ifStudentsAreStruggling.simplerExplanation}"</p>
                      </div>
                      <div className="pt-2 border-t border-gray-800">
                        <span className="text-[10px] font-black uppercase tracking-wider text-blue-400 block mb-1">
                          Alternative Example:
                        </span>
                        <p className="text-gray-300">{plan.ifStudentsAreStruggling.alternativeExample}</p>
                      </div>
                      <div className="pt-2 border-t border-gray-800">
                        <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 block mb-1">
                          Manipulative Option:
                        </span>
                        <p className="text-gray-300">{plan.ifStudentsAreStruggling.visualOrManipulativeOption}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-gray-800 bg-gray-950 flex justify-end shrink-0">
              <Button
                onClick={() => setAssistDrawerOpen(false)}
                className="rounded-xl bg-gray-800 hover:bg-gray-700 text-white text-xs font-bold"
              >
                Close Assist Drawer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
