import React, { useState, useEffect, useMemo } from 'react';
import { 
  Sparkles, 
  GraduationCap, 
  BookOpen, 
  Loader2, 
  ChevronRight, 
  Printer, 
  Plus, 
  LayoutDashboard, 
  Target, 
  Calendar, 
  StickyNote, 
  Settings, 
  LogOut, 
  Users,
  Search,
  HelpCircle,
  Save,
  Layers,
  Zap,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  BarChart3
} from 'lucide-react';
import WeeklyPlanDetailView from './components/views/WeeklyPlanDetailView';
import DailyPlanDetailView from './components/views/DailyPlanDetailView';
import ResourceDetailView from './components/views/ResourceDetailView';
import { LanguageArtsWeeklyPlanDisplay } from './components/LanguageArtsWeeklyPlanDisplay';
import { AssessmentTracker } from './components/AssessmentTracker';
import { motion, AnimatePresence } from 'motion/react';
import { auth, db, signInWithGoogle, logout } from './firebase';
import { 
  onSnapshot, 
  collection, 
  query, 
  where, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  addDoc, 
  serverTimestamp,
  getDoc
} from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';

// Types
import { 
  GradeLevel, 
  Subject, 
  CurriculumEntry, 
  LessonPlan, 
  WeeklyCurriculumPlan, 
  DailyLessonPlan, 
  YearlyCalendarPlan, 
  CyclePacingMap, 
  UserSettings,
  OutcomeMastery,
  LanguageArtsWeeklyPlan,
  LessonStatus,
  AssessmentRecord,
  MisconceptionLog,
  StudentSupportFlag
} from './types';

// Components
import { ClassDashboard } from './components/views/ClassDashboard';
import { CurriculumView } from './components/views/CurriculumView';
import { PlannerView } from './components/views/PlannerView';
import { SavedPlansView } from './components/views/SavedPlansView';
import { ResourceGenView } from './components/views/ResourceGenView';
import { CurriculumManagerView } from './components/views/CurriculumManagerView';
import { CyclePacingView } from './components/views/CyclePacingView';
import { YearlyCalendarView } from './components/views/YearlyCalendarView';
import { ReadyToTeachPage } from './components/views/ReadyToTeach/ReadyToTeachPage';
import { SavedPlanDetailView } from './components/views/SavedPlanDetailView';
import { SelectClassModal } from './components/SelectClassModal';
import { Button, Card, Toast } from './components/ui';
import { NavButton } from './components/DashboardComponents';
import { useToasts } from './context/ToastContext';
import { cn } from './lib/utils';

const DEFAULT_SETTINGS: UserSettings = {
  schoolName: '',
  defaultGrade: 'Standard 4',
  defaultSubject: 'Language Arts',
  curriculumStructure: 'Cycles',
  teachingModel: '5E',
  assignedClasses: ['Standard 4', 'Standard 5'],
  aiQuality: {
    defaultOutputStyle: 'Standard Teacher',
    includeTeacherScript: true,
    includeDifferentiation: true,
    defaultDetailLevel: 'Detailed',
    preferCompetencyObjectives: true,
    preferredTone: 'Professional'
  }
};

export default function App() {
  const { showToast } = useToasts();
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeClass, setActiveClass] = useState<GradeLevel | null>(null);
  const [isSelectClassOpen, setIsSelectClassOpen] = useState(false);
  
  // Data State
  const [curriculum, setCurriculum] = useState<CurriculumEntry[]>([]);
  const [lessonPlans, setLessonPlans] = useState<LessonPlan[]>([]);
  const [weeklyPlans, setWeeklyPlans] = useState<WeeklyCurriculumPlan[]>([]);
  const [laWeeklyPlans, setLAWeeklyPlans] = useState<LanguageArtsWeeklyPlan[]>([]);
  const [dailyLessonPlans, setDailyLessonPlans] = useState<DailyLessonPlan[]>([]);
  const [yearlyCalendars, setYearlyCalendars] = useState<YearlyCalendarPlan[]>([]);
  const [cyclePacingMaps, setCyclePacingMaps] = useState<CyclePacingMap[]>([]);
  const [outcomeMastery, setOutcomeMastery] = useState<OutcomeMastery[]>([]);
  const [assessmentRecords, setAssessmentRecords] = useState<AssessmentRecord[]>([]);
  const [misconceptions, setMisconceptions] = useState<MisconceptionLog[]>([]);
  const [supportFlags, setSupportFlags] = useState<StudentSupportFlag[]>([]);
  const [userSettings, setUserSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [resources, setResources] = useState<any[]>([]);
  
  // UI State
  const [selectedPlan, setSelectedPlan] = useState<LessonPlan | null>(null);
  const [selectedWeeklyPlan, setSelectedWeeklyPlan] = useState<WeeklyCurriculumPlan | null>(null);
  const [selectedLAWeeklyPlan, setSelectedLAWeeklyPlan] = useState<LanguageArtsWeeklyPlan | null>(null);
  const [selectedDailyPlan, setSelectedDailyPlan] = useState<DailyLessonPlan | null>(null);
  const [selectedResource, setSelectedResource] = useState<any>(null);
  const [activeDetailTab, setActiveDetailTab] = useState<'plan' | 'weekly' | 'la-weekly' | 'daily' | 'resource' | null>(null);
  const [prefillData, setPrefillData] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploadingCurriculum, setIsUploadingCurriculum] = useState(false);
  const [curriculumUploadError, setCurriculumUploadError] = useState<string | null>(null);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setAuthLoading(false);
      if (user) {
        // Check for existing settings
        const settingsRef = doc(db, 'user_settings', user.uid);
        getDoc(settingsRef).then((docSnap) => {
          if (docSnap.exists()) {
            const settings = docSnap.data() as UserSettings;
            setUserSettings(settings);
            if (settings.lastSelectedClass) {
              setActiveClass(settings.lastSelectedClass);
            } else {
              setIsSelectClassOpen(true);
            }
          } else {
            // Create default settings
            setDoc(settingsRef, DEFAULT_SETTINGS);
            setIsSelectClassOpen(true);
          }
        });
      }
    });
    return unsubscribe;
  }, []);

  // Data Listeners
  useEffect(() => {
    if (!user) return;

    const unsubCurriculum = onSnapshot(collection(db, 'curriculum'), (snap) => {
      setCurriculum(snap.docs.map(d => ({ id: d.id, ...d.data() } as CurriculumEntry)));
    });

    const unsubLessons = onSnapshot(
      query(collection(db, 'saved_lessons'), where('userId', '==', user.uid)),
      (snap) => {
        setLessonPlans(snap.docs.map(d => ({ id: d.id, ...d.data() } as LessonPlan)));
      }
    );

    const unsubWeekly = onSnapshot(
      query(collection(db, 'weekly_plans'), where('userId', '==', user.uid)),
      (snap) => {
        setWeeklyPlans(snap.docs.map(d => ({ id: d.id, ...d.data() } as WeeklyCurriculumPlan)));
      }
    );

    const unsubLAWeekly = onSnapshot(
      query(collection(db, 'la_weekly_plans'), where('userId', '==', user.uid)),
      (snap) => {
        setLAWeeklyPlans(snap.docs.map(d => ({ id: d.id, ...d.data() } as LanguageArtsWeeklyPlan)));
      }
    );

    const unsubDaily = onSnapshot(
      query(collection(db, 'daily_lesson_plans'), where('userId', '==', user.uid)),
      (snap) => {
        setDailyLessonPlans(snap.docs.map(d => ({ id: d.id, ...d.data() } as DailyLessonPlan)));
      }
    );

    const unsubCalendars = onSnapshot(
      query(collection(db, 'yearly_calendars'), where('userId', '==', user.uid)),
      (snap) => {
        setYearlyCalendars(snap.docs.map(d => ({ id: d.id, ...d.data() } as YearlyCalendarPlan)));
      }
    );

    const unsubPacing = onSnapshot(
      query(collection(db, 'cycle_pacing_maps'), where('userId', '==', user.uid)),
      (snap) => {
        setCyclePacingMaps(snap.docs.map(d => ({ id: d.id, ...d.data() } as CyclePacingMap)));
      }
    );

    const unsubMastery = onSnapshot(
      query(collection(db, 'outcome_mastery'), where('userId', '==', user.uid)),
      (snap) => {
        setOutcomeMastery(snap.docs.map(d => ({ id: d.id, ...d.data() } as OutcomeMastery)));
      }
    );

    const unsubAssessment = onSnapshot(
      query(collection(db, 'assessment_records'), where('userId', '==', user.uid)),
      (snap) => {
        setAssessmentRecords(snap.docs.map(d => ({ id: d.id, ...d.data() } as AssessmentRecord)));
      }
    );

    const unsubMisconceptions = onSnapshot(
      query(collection(db, 'misconception_logs'), where('userId', '==', user.uid)),
      (snap) => {
        setMisconceptions(snap.docs.map(d => ({ id: d.id, ...d.data() } as MisconceptionLog)));
      }
    );

    const unsubSupport = onSnapshot(
      query(collection(db, 'student_support_flags'), where('userId', '==', user.uid)),
      (snap) => {
        setSupportFlags(snap.docs.map(d => ({ id: d.id, ...d.data() } as StudentSupportFlag)));
      }
    );

    const unsubResources = onSnapshot(
      query(collection(db, 'lesson_resources_new'), where('createdBy', '==', user.uid)),
      (snap) => {
        setResources(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      }
    );

    return () => {
      unsubCurriculum();
      unsubLessons();
      unsubWeekly();
      unsubLAWeekly();
      unsubDaily();
      unsubCalendars();
      unsubPacing();
      unsubMastery();
      unsubAssessment();
      unsubMisconceptions();
      unsubSupport();
      unsubResources();
    };
  }, [user]);

  const handleSaveCurriculum = async (entries: CurriculumEntry[]) => {
    if (!user) return;
    try {
      for (const entry of entries) {
        const { id, ...data } = entry;
        if (id && id.length > 10) {
          await updateDoc(doc(db, 'curriculum', id), { ...data, updatedAt: serverTimestamp() });
        } else {
          await addDoc(collection(db, 'curriculum'), { 
            ...data, 
            createdBy: user.uid, 
            createdAt: serverTimestamp() 
          });
        }
      }
      showToast("Curriculum saved successfully", "success");
    } catch (error) {
      console.error("Curriculum save error:", error);
      showToast("Failed to save curriculum", "error");
    }
  };

  const handleCurriculumUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingCurriculum(true);
    setCurriculumUploadError(null);

    try {
      const { parseCurriculum } = await import('./services/gemini');
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Convert file to base64 for Gemini
        const reader = new FileReader();
        const fileDataPromise = new Promise<{ data: string, mimeType: string }>((resolve, reject) => {
          reader.onload = () => {
            const base64 = (reader.result as string).split(',')[1];
            resolve({ data: base64, mimeType: file.type });
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        const fileData = await fileDataPromise;
        const parsedEntries = await parseCurriculum(fileData);
        
        if (parsedEntries && Array.isArray(parsedEntries)) {
          // Map assessment_suggestions to assessment_ideas if needed
          const mappedEntries = parsedEntries.map((entry: any) => ({
            ...entry,
            assessment_ideas: entry.assessment_suggestions || [],
            createdAt: new Date().toISOString()
          }));
          
          await handleSaveCurriculum(mappedEntries);
          showToast(`Successfully parsed and saved ${parsedEntries.length} entries from ${file.name}`, "success");
        }
      }
    } catch (error) {
      console.error("Curriculum upload error:", error);
      setCurriculumUploadError("Failed to parse curriculum file. Please ensure it's a valid PDF or document.");
      showToast("Failed to upload curriculum", "error");
    } finally {
      setIsUploadingCurriculum(false);
    }
  };

  const handleLoadSampleCurriculum = async () => {
    const sampleData: CurriculumEntry[] = [
      {
        grade: 'Standard 4',
        subject: 'Mathematics',
        strand: 'Number Sense',
        cycle: 1,
        topic: 'Place Value',
        subtopic: 'Whole Numbers to 100,000',
        learning_outcomes: [
          'Read and write whole numbers up to 100,000 in numerals and words.',
          'Identify the place value of each digit in a 5-digit number.',
          'Compare and order whole numbers up to 100,000.'
        ],
        suggestedLessons: 5,
        suggestedWeeks: 1,
        createdAt: new Date().toISOString()
      },
      {
        grade: 'Standard 4',
        subject: 'Language Arts',
        strand: 'Reading and Comprehension',
        cycle: 1,
        topic: 'Narrative Texts',
        subtopic: 'Identifying Main Idea and Details',
        learning_outcomes: [
          'Identify the main idea of a narrative text.',
          'Locate supporting details that reinforce the main idea.',
          'Summarize a short story in their own words.'
        ],
        suggestedLessons: 4,
        suggestedWeeks: 1,
        createdAt: new Date().toISOString()
      }
    ];

    await handleSaveCurriculum(sampleData);
    showToast("Sample curriculum data loaded", "success");
  };

  const handleSavePlan = async (plan: any) => {
    if (!user) return;
    try {
      if (plan.id) {
        await updateDoc(doc(db, 'saved_lessons', plan.id), { ...plan, updatedAt: serverTimestamp() });
      } else {
        await addDoc(collection(db, 'saved_lessons'), { ...plan, userId: user.uid, createdAt: serverTimestamp() });
      }
      showToast("Lesson plan saved successfully", "success");
    } catch (error) {
      console.error("Save error:", error);
      showToast("Failed to save lesson plan", "error");
    }
  };

  const handleDeletePlan = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'saved_lessons', id));
      showToast("Lesson plan deleted", "info");
    } catch (error) {
      showToast("Failed to delete plan", "error");
    }
  };

  const handleUpdateStatus = async (id: string, status: LessonStatus) => {
    try {
      await updateDoc(doc(db, 'saved_lessons', id), { status });
      showToast(`Status updated to ${status}`, "success");
    } catch (error) {
      showToast("Failed to update status", "error");
    }
  };

  const handleGenerateResource = async (plan: LessonPlan, type: string) => {
    if (!user) return;
    setIsGenerating(true);
    try {
      const { generateResource } = await import('./services/gemini');
      const content = await generateResource(type, plan, { style: userSettings.aiQuality.defaultOutputStyle });
      
      await addDoc(collection(db, 'lesson_resources_new'), {
        lesson_id: plan.id,
        type,
        content,
        createdBy: user.uid,
        createdAt: serverTimestamp()
      });
      
      showToast(`${type} generated successfully`, "success");
    } catch (error) {
      console.error("Resource generation error:", error);
      showToast(`Failed to generate ${type}`, "error");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateFullPack = async (plan: LessonPlan) => {
    if (!user) return;
    setIsGenerating(true);
    try {
      const types = ['Worksheet', 'Quiz', 'Notebook Notes', 'PowerPoint Outline'];
      const { generateResource } = await import('./services/gemini');
      
      for (const type of types) {
        const content = await generateResource(type, plan, { style: userSettings.aiQuality.defaultOutputStyle });
        await addDoc(collection(db, 'lesson_resources_new'), {
          lesson_id: plan.id,
          type,
          content,
          createdBy: user.uid,
          createdAt: serverTimestamp()
        });
      }
      
      showToast("Full resource pack generated", "success");
    } catch (error) {
      console.error("Full pack generation error:", error);
      showToast("Failed to generate full pack", "error");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUpdatePlan = async (plan: LessonPlan) => {
    if (!user || !plan.id) return;
    try {
      await updateDoc(doc(db, 'saved_lessons', plan.id), { ...plan, updatedAt: serverTimestamp() });
      showToast("Lesson plan updated", "success");
    } catch (error) {
      showToast("Failed to update plan", "error");
    }
  };

  const handleDuplicatePlan = async (plan: LessonPlan) => {
    if (!user) return;
    try {
      const { id, createdAt, updatedAt, ...data } = plan;
      await addDoc(collection(db, 'saved_lessons'), { 
        ...data, 
        lessonTitle: `${plan.lessonTitle} (Copy)`,
        userId: user.uid, 
        createdAt: serverTimestamp() 
      });
      showToast("Lesson plan duplicated", "success");
    } catch (error) {
      showToast("Failed to duplicate plan", "error");
    }
  };

  const handleSelectClass = async (grade: GradeLevel) => {
    setActiveClass(grade);
    setIsSelectClassOpen(false);
    if (user) {
      await updateDoc(doc(db, 'user_settings', user.uid), { lastSelectedClass: grade });
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto" />
          <p className="text-gray-500 font-medium">Initializing Workspace...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center space-y-8 shadow-2xl border-indigo-100">
          <div className="space-y-4">
            <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center mx-auto shadow-xl shadow-indigo-200 rotate-3">
              <GraduationCap className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Curriculum AI</h1>
            <p className="text-gray-500">The ultimate workspace for modern educators. Plan, teach, and track with AI-powered precision.</p>
          </div>
          <Button onClick={signInWithGoogle} size="lg" className="w-full h-14 text-lg font-bold bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200">
            Sign In with Google
          </Button>
          <p className="text-xs text-gray-400">By signing in, you agree to our Terms of Service and Privacy Policy.</p>
        </Card>
      </div>
    );
  }

  const renderContent = () => {
    if (activeTab === 'ready-to-teach' && selectedPlan) {
      return (
        <ReadyToTeachPage 
          lessonId={selectedPlan.id!} 
          onBack={() => setActiveTab('saved')} 
        />
      );
    }

    if (selectedPlan && activeTab === 'saved-detail') {
      return (
        <SavedPlanDetailView 
          plan={selectedPlan}
          onBack={() => {
            setSelectedPlan(null);
            setActiveTab('saved');
          }}
          onUpdateStatus={handleUpdateStatus}
          onGenerateResource={handleGenerateResource}
          onGenerateFullPack={handleGenerateFullPack}
          onUpdatePlan={handleUpdatePlan}
          onDuplicate={handleDuplicatePlan}
          onPrepareForTeaching={async (plan) => {
            setSelectedPlan(plan);
            setActiveTab('ready-to-teach');
          }}
          isGenerating={isGenerating}
        />
      );
    }

    if (selectedWeeklyPlan && activeTab === 'weekly-detail') {
      return (
        <WeeklyPlanDetailView 
          plan={selectedWeeklyPlan}
          onBack={() => {
            setSelectedWeeklyPlan(null);
            setActiveTab('saved');
          }}
          onGenerateResource={async (p, t) => handleGenerateResource(p as any, t)}
        />
      );
    }

    if (selectedLAWeeklyPlan && activeTab === 'la-weekly-detail') {
      return (
        <div className="space-y-6">
          <Button variant="ghost" size="sm" onClick={() => { setSelectedLAWeeklyPlan(null); setActiveTab('saved'); }}>
            <ArrowLeft className="w-4 h-4" />
            Back to Saved Plans
          </Button>
          <LanguageArtsWeeklyPlanDisplay plan={selectedLAWeeklyPlan} />
        </div>
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return (
          <ClassDashboard 
            activeClass={activeClass || 'Standard 4'}
            curriculum={curriculum}
            weeklyPlans={weeklyPlans}
            lessonPlans={lessonPlans}
            outcomeMastery={outcomeMastery}
            yearlyCalendars={yearlyCalendars}
            onAction={setActiveTab}
            onViewLesson={(id) => {
              const plan = lessonPlans.find(p => p.id === id);
              if (plan) {
                setSelectedPlan(plan);
                setActiveTab('saved-detail');
              }
            }}
          />
        );
      case 'curriculum':
        return (
          <CurriculumView 
            curriculum={curriculum} 
            onDelete={async (id) => {
              await deleteDoc(doc(db, 'curriculum', id));
              showToast("Curriculum entry deleted", "info");
            }}
            onSaveManual={async (entry) => {
              await handleSaveCurriculum([entry]);
            }}
            onUpload={handleCurriculumUpload}
            onLoadSample={handleLoadSampleCurriculum}
            isUploading={isUploadingCurriculum}
            setActiveTab={setActiveTab}
            uploadError={curriculumUploadError}
            onUseInPlan={(entry) => {
              setPrefillData({
                grade: entry.grade,
                subject: entry.subject,
                topic: entry.topic,
                subtopic: entry.subtopic,
                outcomes: entry.learning_outcomes
              });
              setActiveTab('planner');
            }}
          />
        );
      case 'planner':
        return (
          <PlannerView 
            activeClass={activeClass}
            curriculum={curriculum}
            setActiveTab={setActiveTab}
            dailyLessonPlans={dailyLessonPlans}
            yearlyCalendars={yearlyCalendars}
            cyclePacingMaps={cyclePacingMaps}
            userSettings={userSettings}
            prefillData={prefillData}
            onSave={handleSavePlan}
            onGenerateResource={handleGenerateResource}
          />
        );
      case 'mapping':
        return (
          <CyclePacingView 
            curriculum={curriculum}
            yearlyCalendars={yearlyCalendars}
            cyclePacingMaps={cyclePacingMaps}
            userSettings={userSettings}
            setActiveTab={setActiveTab}
            onSave={async (map) => {
              if (!user) return;
              const cleanMap = { ...map };
              const id = cleanMap.id;
              delete (cleanMap as any).id;
              if (id) {
                await updateDoc(doc(db, 'cycle_pacing_maps', id), cleanMap as any);
              } else {
                await addDoc(collection(db, 'cycle_pacing_maps'), { ...cleanMap, userId: user.uid });
              }
              showToast("Pacing map saved", "success");
            }}
            onDelete={async (id) => {
              await deleteDoc(doc(db, 'cycle_pacing_maps', id));
              showToast("Pacing map deleted", "info");
            }}
          />
        );
      case 'saved':
        return (
          <SavedPlansView 
            plans={lessonPlans}
            weeklyPlans={weeklyPlans}
            laWeeklyPlans={laWeeklyPlans}
            dailyLessonPlans={dailyLessonPlans}
            resources={resources}
            onDelete={handleDeletePlan}
            onOpen={(plan) => {
              setSelectedPlan(plan);
              setActiveTab('saved-detail');
            }}
            onViewLesson={(id) => {
              const plan = lessonPlans.find(p => p.id === id);
              if (plan) {
                setSelectedPlan(plan);
                setActiveTab('saved-detail');
              }
            }}
            onDeleteWeekly={async (id) => {
              await deleteDoc(doc(db, 'weekly_plans', id));
              showToast("Weekly plan deleted", "info");
            }}
            onOpenWeekly={(plan) => {
              setSelectedWeeklyPlan(plan);
              setActiveTab('weekly-detail');
            }}
            onDeleteLAWeekly={async (id) => {
              await deleteDoc(doc(db, 'la_weekly_plans', id));
              showToast("LA Weekly plan deleted", "info");
            }}
            onOpenLAWeekly={(plan) => {
              setSelectedLAWeeklyPlan(plan);
              setActiveTab('la-weekly-detail');
            }}
            onDeleteDaily={async (id) => {
              await deleteDoc(doc(db, 'daily_lesson_plans', id));
              showToast("Daily plan deleted", "info");
            }}
            onOpenDaily={(plan) => {
              setSelectedDailyPlan(plan);
              setActiveTab('daily-detail');
            }}
            onDeleteResource={async (id) => {
              await deleteDoc(doc(db, 'lesson_resources_new', id));
              showToast("Resource deleted", "info");
            }}
            onOpenResource={(res) => {
              setSelectedResource(res);
              setActiveTab('resource-detail');
            }}
          />
        );
      case 'la-weekly-detail':
        if (!selectedLAWeeklyPlan) return null;
        return (
          <div className="space-y-6">
            <Button variant="ghost" onClick={() => setActiveTab('saved')} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Saved Plans
            </Button>
            <LanguageArtsWeeklyPlanDisplay plan={selectedLAWeeklyPlan} />
          </div>
        );
      case 'daily-detail':
        if (!selectedDailyPlan) return null;
        return (
          <DailyPlanDetailView 
            plan={selectedDailyPlan}
            onBack={() => {
              setSelectedDailyPlan(null);
              setActiveTab('saved');
            }}
          />
        );
      case 'resource-detail':
        if (!selectedResource) return null;
        return (
          <ResourceDetailView 
            resource={selectedResource}
            onBack={() => {
              setSelectedResource(null);
              setActiveTab('saved');
            }}
          />
        );
      case 'tracker':
        return (
          <AssessmentTracker 
            records={assessmentRecords}
            mastery={outcomeMastery}
            supportFlags={supportFlags}
            misconceptions={misconceptions}
            onGenerateReteach={async (record) => {
              showToast("Generating reteach lesson...", "info");
            }}
            onGenerateIntervention={async (record) => {
              showToast("Generating intervention work...", "info");
            }}
            onGenerateRevisionWeek={async (grade, subject, cycle) => {
              showToast("Building revision week...", "info");
            }}
          />
        );
      case 'calendar':
        return (
          <YearlyCalendarView 
            userSettings={userSettings}
            setActiveTab={setActiveTab}
            setPrefillData={setPrefillData}
          />
        );
      case 'resources':
        return <ResourceGenView lessonPlans={lessonPlans} />;
      default:
        return <div className="p-12 text-center text-gray-400">View coming soon...</div>;
    }
  };

  const isReadyToTeach = activeTab === 'ready-to-teach';

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar Navigation */}
      {!isReadyToTeach && (
        <aside className="w-72 bg-white border-r border-gray-100 flex flex-col sticky top-0 h-screen z-20">
          <div className="p-6 flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-black text-gray-900 tracking-tight leading-none">LessonCraft</h1>
              <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mt-1">Pro Workspace</p>
            </div>
          </div>

          <nav className="flex-1 px-4 py-4 space-y-1">
            <NavButton 
              active={activeTab === 'dashboard'} 
              onClick={() => setActiveTab('dashboard')} 
              icon={<LayoutDashboard />} 
              label="Dashboard" 
            />
            <NavButton 
              active={activeTab === 'curriculum'} 
              onClick={() => setActiveTab('curriculum')} 
              icon={<BookOpen />} 
              label="Curriculum" 
            />
            <NavButton 
              active={activeTab === 'mapping'} 
              onClick={() => setActiveTab('mapping')} 
              icon={<Layers />} 
              label="Mapping Engine" 
            />
            <NavButton 
              active={activeTab === 'planner'} 
              onClick={() => setActiveTab('planner')} 
              icon={<Plus />} 
              label="Lesson Planner" 
            />
            <NavButton 
              active={activeTab === 'tracker'} 
              onClick={() => setActiveTab('tracker')} 
              icon={<BarChart3 />} 
              label="Progress Tracker" 
            />
            <NavButton 
              active={activeTab === 'calendar'} 
              onClick={() => setActiveTab('calendar')} 
              icon={<Calendar />} 
              label="Academic Calendar" 
            />
            <NavButton 
              active={activeTab === 'saved'} 
              onClick={() => setActiveTab('saved')} 
              icon={<StickyNote />} 
              label="Saved Content" 
            />
            <NavButton 
              active={activeTab === 'resources'} 
              onClick={() => setActiveTab('resources')} 
              icon={<Zap />} 
              label="Resource Lab" 
            />
          </nav>

          <div className="p-4 border-t border-gray-50 space-y-2">
            <div className="bg-indigo-50 p-4 rounded-2xl space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                  {user.displayName?.[0] || 'U'}
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-bold text-gray-900 truncate">{user.displayName || 'Teacher'}</p>
                  <p className="text-[10px] text-indigo-600 font-medium truncate">{activeClass || 'No Class Selected'}</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full bg-white border-indigo-100 text-indigo-600 hover:bg-indigo-50"
                onClick={() => setIsSelectClassOpen(true)}
              >
                <Users className="w-3 h-3" />
                Switch Class
              </Button>
            </div>
            <button 
              onClick={logout}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </aside>
      )}

      {/* Main Content Area */}
      <main className={cn(
        "flex-1 flex flex-col min-h-screen",
        !isReadyToTeach && "p-8"
      )}>
        {!isReadyToTeach && (
          <header className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="h-10 w-1 bg-indigo-600 rounded-full" />
              <div>
                <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest">Workspace</h2>
                <p className="text-2xl font-black text-gray-900 tracking-tight capitalize">{activeTab.replace('-', ' ')}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search plans, resources..." 
                  className="pl-10 pr-4 py-2 bg-white border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none w-64 transition-all"
                />
              </div>
              <Button variant="ghost" size="sm" className="text-gray-400">
                <HelpCircle className="w-5 h-5" />
              </Button>
            </div>
          </header>
        )}

        <div className={cn(
          "flex-1",
          !isReadyToTeach && "max-w-7xl mx-auto w-full"
        )}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab + (selectedPlan?.id || '')}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <SelectClassModal 
        isOpen={isSelectClassOpen} 
        assignedClasses={userSettings.assignedClasses || []}
        onSelect={handleSelectClass}
      />
    </div>
  );
}
