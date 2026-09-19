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
  BarChart3,
  PanelLeftClose,
  PanelLeft,
  Bell,
  FileEdit,
  ChevronDown,
  Check
} from 'lucide-react';
import WeeklyPlanDetailView from './components/views/WeeklyPlanDetailView';
import DailyPlanDetailView from './components/views/DailyPlanDetailView';
import ResourceDetailView from './components/views/ResourceDetailView';
import { SettingsView } from './components/views/SettingsView';
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
  StudentSupportFlag,
  getClassId,
  getClassNameFromId
} from './types';
import { backfillUserClassIds } from './lib/classDataService';
import { BELIZE_NATIONAL_CURRICULUM } from './data/belize_national_curriculum';
import { stripUndefined } from './lib/utils';
import { 
  normalizeGrade, 
  normalizeSubject, 
  normalizeCycle, 
  normalizeAcademicYear, 
  invalidateCurriculumCache 
} from './services/curriculumFilterService';

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
import { ClassSwitcher } from './components/ClassSwitcher';
import { Button, Card, Toast } from './components/ui';
import { NavButton } from './components/DashboardComponents';
import { useToasts } from './context/ToastContext';
import { cn } from './lib/utils';

const DEFAULT_SETTINGS: UserSettings = {
  schoolName: 'SAN JUAN BOSCO R.C. SCHOOL',
  defaultGrade: 'Standard 4',
  defaultSubject: 'Language Arts',
  curriculumStructure: 'Cycles',
  teachingModel: '5E',
  assignedClasses: ['Standard 4', 'Standard 5'],
  defaultAcademicYear: '2026-2027',
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
  const activeClassId = activeClass ? getClassId(activeClass) : null;
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

  // Modern UI Shell State
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('lc_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleSidebar = () => {
    setIsSidebarCollapsed(prev => {
      const next = !prev;
      try {
        localStorage.setItem('lc_sidebar_collapsed', String(next));
      } catch {}
      return next;
    });
  };

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
            const updatedSettings: UserSettings = {
              ...settings,
              defaultAcademicYear: settings.defaultAcademicYear && settings.defaultAcademicYear !== '2025-2026' ? settings.defaultAcademicYear : '2026-2027'
            };
            setUserSettings(updatedSettings);
            if (settings.defaultAcademicYear === '2025-2026') {
              setDoc(settingsRef, { defaultAcademicYear: '2026-2027' }, { merge: true }).catch(console.warn);
            }
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

  // Class-Scoped Data Listeners: Fetch ONLY data for active class & user
  useEffect(() => {
    // Immediately clear previous class state when switching or when no class is selected
    setCurriculum([]);
    setLessonPlans([]);
    setWeeklyPlans([]);
    setLAWeeklyPlans([]);
    setDailyLessonPlans([]);
    setYearlyCalendars([]);
    setCyclePacingMaps([]);
    setOutcomeMastery([]);
    setAssessmentRecords([]);
    setMisconceptions([]);
    setSupportFlags([]);
    setResources([]);
    setSelectedPlan(null);
    setSelectedWeeklyPlan(null);
    setSelectedLAWeeklyPlan(null);
    setSelectedDailyPlan(null);
    setSelectedResource(null);

    if (!user || !activeClass || !activeClassId) return;

    // Run background backfill to tag existing legacy records with classId
    backfillUserClassIds(user.uid).catch(err => {
      console.warn("Class data backfill notice:", err);
    });

    // 1. Curriculum: Load ALL uploaded curriculum and merge with official national curriculum
    const unsubCurriculum = onSnapshot(
      collection(db, 'curriculum'),
      (snap) => {
        const dbEntries = snap.docs.map(d => {
          const data = d.data();
          const rawGrade = data.grade || data.className || data.grade_level || activeClass || 'Standard 4';
          const normGrade = normalizeGrade(rawGrade);
          return {
            id: d.id,
            ...data,
            grade: normGrade,
            className: normGrade,
            subject: normalizeSubject(data.subject || 'Mathematics'),
            cycle: normalizeCycle(data.cycle || 1),
            academicYear: normalizeAcademicYear(data.academicYear || data.schoolYear || '2026-2027')
          } as CurriculumEntry;
        });

        const combined = [...dbEntries];
        BELIZE_NATIONAL_CURRICULUM.forEach(baseEntry => {
          const exists = combined.some(e => 
            normalizeGrade(e.grade) === normalizeGrade(baseEntry.grade) &&
            normalizeSubject(e.subject) === normalizeSubject(baseEntry.subject) &&
            normalizeCycle(e.cycle) === normalizeCycle(baseEntry.cycle) &&
            (e.topic || '').trim().toLowerCase() === (baseEntry.topic || '').trim().toLowerCase()
          );
          if (!exists) {
            combined.push(baseEntry);
          }
        });
        invalidateCurriculumCache();
        setCurriculum(combined);
      },
      (err) => {
        console.warn("Curriculum snapshot warning, falling back to national curriculum:", err);
        setCurriculum([...BELIZE_NATIONAL_CURRICULUM]);
      }
    );

    // 2. Saved Lessons: Scoped by userId AND classId
    const unsubLessons = onSnapshot(
      query(
        collection(db, 'saved_lessons'),
        where('userId', '==', user.uid),
        where('classId', '==', activeClassId)
      ),
      (snap) => {
        setLessonPlans(snap.docs.map(d => ({ id: d.id, ...d.data() } as LessonPlan)));
      },
      (err) => console.warn("Lessons snapshot warning:", err)
    );

    // 3. Weekly Plans: Scoped by userId AND classId
    const unsubWeekly = onSnapshot(
      query(
        collection(db, 'weekly_plans'),
        where('userId', '==', user.uid),
        where('classId', '==', activeClassId)
      ),
      (snap) => {
        setWeeklyPlans(snap.docs.map(d => ({ id: d.id, ...d.data() } as WeeklyCurriculumPlan)));
      },
      (err) => console.warn("Weekly plans snapshot warning:", err)
    );

    // 4. Language Arts Weekly Plans: Scoped by userId AND classId
    const unsubLAWeekly = onSnapshot(
      query(
        collection(db, 'la_weekly_plans'),
        where('userId', '==', user.uid),
        where('classId', '==', activeClassId)
      ),
      (snap) => {
        setLAWeeklyPlans(snap.docs.map(d => ({ id: d.id, ...d.data() } as LanguageArtsWeeklyPlan)));
      },
      (err) => console.warn("LA Weekly snapshot warning:", err)
    );

    // 5. Daily Lesson Plans: Scoped by userId AND classId
    const unsubDaily = onSnapshot(
      query(
        collection(db, 'daily_lesson_plans'),
        where('userId', '==', user.uid),
        where('classId', '==', activeClassId)
      ),
      (snap) => {
        setDailyLessonPlans(snap.docs.map(d => ({ id: d.id, ...d.data() } as DailyLessonPlan)));
      },
      (err) => console.warn("Daily plans snapshot warning:", err)
    );

    // 6. Yearly Calendars: Scoped by userId AND classId
    const unsubCalendars = onSnapshot(
      query(
        collection(db, 'yearly_calendars'),
        where('userId', '==', user.uid),
        where('classId', '==', activeClassId)
      ),
      (snap) => {
        setYearlyCalendars(snap.docs.map(d => ({ id: d.id, ...d.data() } as YearlyCalendarPlan)));
      },
      (err) => console.warn("Calendars snapshot warning:", err)
    );

    // 7. Cycle Pacing Maps: Scoped by userId AND classId
    const unsubPacing = onSnapshot(
      query(
        collection(db, 'cycle_pacing_maps'),
        where('userId', '==', user.uid),
        where('classId', '==', activeClassId)
      ),
      (snap) => {
        setCyclePacingMaps(snap.docs.map(d => ({ id: d.id, ...d.data() } as CyclePacingMap)));
      },
      (err) => console.warn("Pacing snapshot warning:", err)
    );

    // 8. Outcome Mastery: Scoped by userId AND classId
    const unsubMastery = onSnapshot(
      query(
        collection(db, 'outcome_mastery'),
        where('userId', '==', user.uid),
        where('classId', '==', activeClassId)
      ),
      (snap) => {
        setOutcomeMastery(snap.docs.map(d => ({ id: d.id, ...d.data() } as OutcomeMastery)));
      },
      (err) => console.warn("Mastery snapshot warning:", err)
    );

    // 9. Assessment Records: Scoped by userId AND classId
    const unsubAssessment = onSnapshot(
      query(
        collection(db, 'assessment_records'),
        where('userId', '==', user.uid),
        where('classId', '==', activeClassId)
      ),
      (snap) => {
        setAssessmentRecords(snap.docs.map(d => ({ id: d.id, ...d.data() } as AssessmentRecord)));
      },
      (err) => console.warn("Assessment snapshot warning:", err)
    );

    // 10. Misconceptions: Scoped by userId AND classId
    const unsubMisconceptions = onSnapshot(
      query(
        collection(db, 'misconception_logs'),
        where('userId', '==', user.uid),
        where('classId', '==', activeClassId)
      ),
      (snap) => {
        setMisconceptions(snap.docs.map(d => ({ id: d.id, ...d.data() } as MisconceptionLog)));
      },
      (err) => console.warn("Misconceptions snapshot warning:", err)
    );

    // 11. Student Support Flags: Scoped by userId AND classId
    const unsubSupport = onSnapshot(
      query(
        collection(db, 'student_support_flags'),
        where('userId', '==', user.uid),
        where('classId', '==', activeClassId)
      ),
      (snap) => {
        setSupportFlags(snap.docs.map(d => ({ id: d.id, ...d.data() } as StudentSupportFlag)));
      },
      (err) => console.warn("Support flags snapshot warning:", err)
    );

    // 12. Lesson Resources: Scoped by userId AND classId
    const unsubResources = onSnapshot(
      query(
        collection(db, 'lesson_resources_new'),
        where('createdBy', '==', user.uid),
        where('classId', '==', activeClassId)
      ),
      (snap) => {
        setResources(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      },
      (err) => console.warn("Resources snapshot warning:", err)
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
  }, [user, activeClass, activeClassId]);

  const handleSaveCurriculum = async (entries: CurriculumEntry[]) => {
    if (!user) {
      showToast("Please sign in to save curriculum guides", "error");
      return;
    }
    const targetGrade = activeClass || 'Standard 4';
    const targetClassId = activeClassId || getClassId(targetGrade);
    const targetYear = userSettings.defaultAcademicYear || '2026-2027';

    try {
      for (const entry of entries) {
        const { id, ...data } = entry;
        const entryGrade = normalizeGrade(entry.grade || targetGrade);
        const entryClassId = entry.classId || getClassId(entryGrade) || targetClassId;
        const entrySubject = normalizeSubject(entry.subject || userSettings.defaultSubject || 'Mathematics');
        const entryCycle = normalizeCycle(entry.cycle || 1);
        const entryYear = normalizeAcademicYear(entry.academicYear || targetYear);

        const dataToSave = stripUndefined({
          ...data,
          grade: entryGrade,
          className: entryGrade,
          classId: entryClassId,
          subject: entrySubject,
          cycle: entryCycle,
          academicYear: entryYear,
          topic: entry.topic || 'General Topic',
          subtopic: entry.subtopic || '',
          learning_outcomes: Array.isArray(entry.learning_outcomes) ? entry.learning_outcomes : [],
          assessment_ideas: Array.isArray(entry.assessment_ideas) 
            ? entry.assessment_ideas 
            : ((entry as any).assessment_suggestions || []),
          userId: user.uid,
          createdBy: user.uid
        });

        if (id && id.length > 10) {
          await updateDoc(doc(db, 'curriculum', id), { ...dataToSave, updatedAt: serverTimestamp() });
        } else {
          await addDoc(collection(db, 'curriculum'), { 
            ...dataToSave, 
            createdAt: serverTimestamp() 
          });
        }
      }
      invalidateCurriculumCache();
      showToast(`Curriculum saved successfully (${entries.length} entries)`, "success");
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

        // Guard against excessively massive files (over 50MB)
        if (file.size > 50 * 1024 * 1024) {
          showToast(`"${file.name}" exceeds the 50MB limit. Please upload a smaller file or split it into sections.`, "error");
          continue;
        }

        const mimeType = file.type || (file.name.endsWith('.pdf') ? 'application/pdf' : 'text/plain');
        
        // Convert file to base64 for Gemini
        const reader = new FileReader();
        const fileDataPromise = new Promise<{ data: string, mimeType: string }>((resolve, reject) => {
          reader.onload = () => {
            const base64 = (reader.result as string).split(',')[1];
            resolve({ data: base64, mimeType });
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        const fileData = await fileDataPromise;
        const parsedEntries = await parseCurriculum(fileData);
        
        const entriesArray = Array.isArray(parsedEntries)
          ? parsedEntries
          : (parsedEntries?.entries || parsedEntries?.curriculum || parsedEntries?.units || []);

        if (entriesArray && entriesArray.length > 0) {
          const mappedEntries = entriesArray.map((entry: any) => ({
            ...entry,
            academicYear: entry.academicYear || userSettings.defaultAcademicYear || '2026-2027',
            grade: entry.grade || activeClass || 'Standard 4',
            assessment_ideas: entry.assessment_ideas || entry.assessment_suggestions || [],
            createdAt: new Date().toISOString()
          }));
          
          await handleSaveCurriculum(mappedEntries);
          showToast(`Successfully parsed and saved ${mappedEntries.length} entries from ${file.name}`, "success");
        } else {
          showToast(`No curriculum entries could be extracted from ${file.name}.`, "error");
        }
      }
    } catch (error: any) {
      console.error("Curriculum upload error:", error);
      const is413 = error?.message?.includes("413") || error?.message?.toLowerCase()?.includes("too large");
      const userMessage = is413
        ? "Curriculum file is too large for processing. Please upload files under 50MB."
        : (error?.message || "Failed to parse curriculum file. Please ensure it's a valid PDF or document.");
      setCurriculumUploadError(userMessage);
      showToast(userMessage, "error");
    } finally {
      setIsUploadingCurriculum(false);
    }
  };

  const handleLoadSampleCurriculum = async () => {
    const sampleGrade = activeClass || 'Standard 4';
    const sampleClassId = getClassId(sampleGrade);
    const sampleData: CurriculumEntry[] = [
      {
        grade: sampleGrade,
        classId: sampleClassId,
        className: sampleGrade,
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
        grade: sampleGrade,
        classId: sampleClassId,
        className: sampleGrade,
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
    showToast(`Sample curriculum loaded for ${sampleGrade}`, "success");
  };

  const handleSavePlan = async (plan: any): Promise<string | undefined> => {
    if (!user || !activeClassId || !activeClass) return undefined;
    try {
      const planGrade = typeof plan.grade === 'object' && plan.grade !== null ? (plan.grade.name || activeClass) : (plan.grade || activeClass);
      const planClassId = plan.classId || getClassId(planGrade);
      const resolvedWeek = typeof plan.week === 'object' && plan.week !== null
        ? (plan.week_number || plan.week.week_number || plan.week.week || '1')
        : (plan.week || plan.week_number || '1');
      const resolvedTopic = typeof plan.topic === 'object' && plan.topic !== null
        ? (plan.topic.topic || plan.topic.name || '')
        : (plan.topic || plan.week?.topic || '');
      const resolvedSubject = typeof plan.subject === 'object' && plan.subject !== null
        ? (plan.subject.name || plan.subject.subject || '')
        : (plan.subject || plan.week?.subject || '');
      const resolvedTitle = typeof plan.title === 'object' && plan.title !== null
        ? (plan.title.title || plan.title.name || '')
        : (plan.title || plan.lessonTitle || plan.week?.topic || resolvedTopic || 'Lesson Plan');

      const planToSave = stripUndefined({
        ...plan,
        title: resolvedTitle,
        topic: resolvedTopic,
        subject: resolvedSubject,
        week: resolvedWeek,
        grade: planGrade,
        classId: planClassId,
        className: planGrade,
        userId: user.uid,
        createdBy: user.uid,
        updatedAt: serverTimestamp()
      });
      if (plan.id) {
        await updateDoc(doc(db, 'saved_lessons', plan.id), planToSave);
        showToast(`Lesson plan saved for ${planGrade}`, "success");
        return plan.id;
      } else {
        const docRef = await addDoc(collection(db, 'saved_lessons'), { ...planToSave, createdAt: serverTimestamp() });
        plan.id = docRef.id;
        showToast(`Lesson plan saved for ${planGrade}`, "success");
        return docRef.id;
      }
    } catch (error) {
      console.error("Save error:", error);
      showToast("Failed to save lesson plan", "error");
      return undefined;
    }
  };

  const ensureLessonPlanId = async (plan: any): Promise<string> => {
    if (plan.id) return String(plan.id);
    if (plan.lesson_plan_id) {
      plan.id = String(plan.lesson_plan_id);
      return plan.id;
    }
    const savedId = await handleSavePlan(plan);
    if (savedId) {
      plan.id = savedId;
      return savedId;
    }
    const fallbackId = `lesson_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    plan.id = fallbackId;
    return fallbackId;
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
    if (!user || !activeClassId || !activeClass) return;
    setIsGenerating(true);
    try {
      const lessonId = await ensureLessonPlanId(plan);
      const { generateResource } = await import('./services/gemini');
      const content = await generateResource(type, plan, { style: userSettings.aiQuality.defaultOutputStyle });
      const planGrade = typeof plan.grade === 'object' && plan.grade !== null ? ((plan.grade as any).name || activeClass) : (plan.grade || activeClass);
      const planClassId = plan.classId || getClassId(planGrade);
      
      const resourceData = stripUndefined({
        lesson_id: lessonId,
        classId: planClassId,
        className: planGrade,
        grade: planGrade,
        type,
        resource_type: type.toLowerCase().replace(/\s+/g, '_'),
        title: `${type} - ${plan.lessonTitle || (plan as any).title || 'Lesson Plan'}`,
        content,
        generated_by_ai: true,
        editable: true,
        version: 1,
        userId: user.uid,
        createdBy: user.uid,
        createdAt: serverTimestamp(),
        updated_at: new Date().toISOString()
      });

      await addDoc(collection(db, 'lesson_resources_new'), resourceData);
      
      showToast(`${type} generated successfully for ${planGrade}`, "success");
    } catch (error) {
      console.error("Resource generation error:", error);
      showToast(`Failed to generate ${type}`, "error");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateFullPack = async (plan: LessonPlan) => {
    if (!user || !activeClassId || !activeClass) return;
    setIsGenerating(true);
    try {
      const lessonId = await ensureLessonPlanId(plan);
      const types = ['Worksheet', 'Quiz', 'Notebook Notes', 'PowerPoint Outline'];
      const { generateResource } = await import('./services/gemini');
      const planGrade = typeof plan.grade === 'object' && plan.grade !== null ? ((plan.grade as any).name || activeClass) : (plan.grade || activeClass);
      const planClassId = plan.classId || getClassId(planGrade);
      
      for (const type of types) {
        const content = await generateResource(type, plan, { style: userSettings.aiQuality.defaultOutputStyle });
        const resourceData = stripUndefined({
          lesson_id: lessonId,
          classId: planClassId,
          className: planGrade,
          grade: planGrade,
          type,
          resource_type: type.toLowerCase().replace(/\s+/g, '_'),
          title: `${type} - ${plan.lessonTitle || (plan as any).title || 'Lesson Plan'}`,
          content,
          generated_by_ai: true,
          editable: true,
          version: 1,
          userId: user.uid,
          createdBy: user.uid,
          createdAt: serverTimestamp(),
          updated_at: new Date().toISOString()
        });
        await addDoc(collection(db, 'lesson_resources_new'), resourceData);
      }
      
      showToast(`Full resource pack generated for ${planGrade}`, "success");
    } catch (error) {
      console.error("Full pack generation error:", error);
      showToast("Failed to generate full pack", "error");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUpdatePlan = async (plan: LessonPlan) => {
    if (!user || !plan.id || !activeClassId || !activeClass) return;
    try {
      const planGrade = typeof plan.grade === 'object' && plan.grade !== null ? ((plan.grade as any).name || activeClass) : (plan.grade || activeClass);
      const planClassId = plan.classId || getClassId(planGrade);
      await updateDoc(doc(db, 'saved_lessons', plan.id), stripUndefined({ 
        ...plan, 
        grade: planGrade,
        classId: planClassId,
        className: planGrade,
        userId: user.uid,
        updatedAt: serverTimestamp() 
      }));
      showToast(`Lesson plan updated for ${planGrade}`, "success");
    } catch (error) {
      showToast("Failed to update plan", "error");
    }
  };

  const handleDuplicatePlan = async (plan: LessonPlan) => {
    if (!user || !activeClassId || !activeClass) return;
    try {
      const { id, createdAt, updatedAt, ...data } = plan;
      const planGrade = typeof plan.grade === 'object' && plan.grade !== null ? ((plan.grade as any).name || activeClass) : (plan.grade || activeClass);
      const planClassId = plan.classId || getClassId(planGrade);
      await addDoc(collection(db, 'saved_lessons'), stripUndefined({ 
        ...data, 
        lessonTitle: `${plan.lessonTitle || (plan as any).title || 'Lesson'} (Copy)`,
        grade: planGrade,
        classId: planClassId,
        className: planGrade,
        userId: user.uid, 
        createdAt: serverTimestamp() 
      }));
      showToast(`Lesson plan duplicated for ${planGrade}`, "success");
    } catch (error) {
      showToast("Failed to duplicate plan", "error");
    }
  };

  const handleSelectClass = async (grade: GradeLevel) => {
    // Immediately clear all previous class data to avoid stale flashes
    setCurriculum([]);
    setLessonPlans([]);
    setWeeklyPlans([]);
    setLAWeeklyPlans([]);
    setDailyLessonPlans([]);
    setYearlyCalendars([]);
    setCyclePacingMaps([]);
    setOutcomeMastery([]);
    setAssessmentRecords([]);
    setMisconceptions([]);
    setSupportFlags([]);
    setResources([]);
    setSelectedPlan(null);
    setSelectedWeeklyPlan(null);
    setSelectedLAWeeklyPlan(null);
    setSelectedDailyPlan(null);
    setSelectedResource(null);

    setActiveClass(grade);
    setIsSelectClassOpen(false);
    showToast(`Switched active class to ${grade}`, "success");
    if (user) {
      try {
        await updateDoc(doc(db, 'user_settings', user.uid), { lastSelectedClass: grade });
        setUserSettings(prev => ({ ...prev, lastSelectedClass: grade }));
      } catch (error) {
        console.error("Failed to persist selected class:", error);
      }
    }
  };

  const handleSaveAssignedClasses = async (classes: GradeLevel[]) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'user_settings', user.uid), { assignedClasses: classes });
      setUserSettings(prev => ({ ...prev, assignedClasses: classes }));
      showToast("Updated assigned teaching classes", "success");
    } catch (error) {
      console.error("Failed to update assigned classes:", error);
      showToast("Failed to update classes", "error");
    }
  };

  const handleUpdateSettings = async (newSettings: Partial<UserSettings>) => {
    if (!user) return;
    try {
      const merged = { ...userSettings, ...newSettings };
      setUserSettings(merged);
      const settingsRef = doc(db, 'user_settings', user.uid);
      await setDoc(settingsRef, merged, { merge: true });
    } catch (error) {
      console.error("Failed to update settings:", error);
      throw error;
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
          resources={resources}
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
            onSwitchClass={() => setIsSelectClassOpen(true)}
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
            onSave={async (plan) => { await handleSavePlan(plan); }}
            onGenerateResource={handleGenerateResource}
            onGenerateFullPack={handleGenerateFullPack}
          />
        );
      case 'mapping':
        return (
          <CyclePacingView 
            activeClass={activeClass}
            activeClassId={activeClassId}
            curriculum={curriculum}
            yearlyCalendars={yearlyCalendars}
            cyclePacingMaps={cyclePacingMaps}
            userSettings={userSettings}
            setActiveTab={setActiveTab}
            onSave={async (map) => {
              if (!user || !activeClassId || !activeClass) return;
              const cleanMap = { ...map };
              const id = cleanMap.id;
              delete (cleanMap as any).id;
              const mapGrade = cleanMap.grade || activeClass;
              const mapClassId = cleanMap.classId || getClassId(mapGrade);
              const dataToSave = {
                ...cleanMap,
                grade: mapGrade,
                classId: mapClassId,
                className: mapGrade,
                userId: user.uid,
                updatedAt: serverTimestamp()
              };
              if (id) {
                await updateDoc(doc(db, 'cycle_pacing_maps', id), dataToSave as any);
              } else {
                await addDoc(collection(db, 'cycle_pacing_maps'), { ...dataToSave, createdAt: serverTimestamp() });
              }
              showToast(`Pacing map saved for ${mapGrade}`, "success");
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
            activeClass={activeClass}
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
            activeClass={activeClass}
            activeClassId={activeClassId}
            userSettings={userSettings}
            setActiveTab={setActiveTab}
            setPrefillData={setPrefillData}
          />
        );
      case 'resources':
        return <ResourceGenView lessonPlans={lessonPlans} />;
      case 'settings':
        return (
          <SettingsView 
            user={user} 
            userSettings={userSettings} 
            onUpdateSettings={handleUpdateSettings} 
          />
        );
      default:
        return <div className="p-12 text-center text-gray-400">View coming soon...</div>;
    }
  };

  const isReadyToTeach = activeTab === 'ready-to-teach';

  const tabLabels: Record<string, string> = {
    dashboard: 'Dashboard',
    curriculum: 'Curriculum Guide',
    mapping: 'Mapping Engine',
    planner: 'Lesson Planner',
    tracker: 'Progress Tracker',
    calendar: 'Academic Calendar',
    saved: 'Saved Contents',
    resources: 'Resource Lab',
    settings: 'Settings & Profile'
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* 3. GLOBAL APPLICATION LAYOUT: LEFT SIDEBAR */}
      {!isReadyToTeach && (
        <aside 
          className={cn(
            "bg-white border-r border-slate-200/80 flex flex-col sticky top-0 h-screen z-30 transition-all duration-300 ease-in-out shrink-0 select-none",
            isSidebarCollapsed ? "w-[72px]" : "w-64"
          )}
        >
          {/* Logo & Collapse Header */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between min-h-[68px]">
            <div 
              onClick={() => setActiveTab('dashboard')}
              className={cn(
                "flex items-center gap-3 cursor-pointer group overflow-hidden",
                isSidebarCollapsed && "justify-center w-full"
              )}
            >
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-sm shadow-indigo-200 shrink-0 group-hover:scale-105 transition-transform">
                <GraduationCap className="w-5 h-5" />
              </div>
              {!isSidebarCollapsed && (
                <div className="overflow-hidden">
                  <h1 className="text-base font-black text-slate-900 tracking-tight leading-none group-hover:text-indigo-600 transition-colors">LessonCraft</h1>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Education Suite</p>
                </div>
              )}
            </div>
            {!isSidebarCollapsed && (
              <button 
                onClick={toggleSidebar}
                title="Collapse sidebar"
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Collapse trigger when collapsed */}
          {isSidebarCollapsed && (
            <div className="pt-2 px-3 flex justify-center">
              <button 
                onClick={toggleSidebar}
                title="Expand sidebar"
                className="p-2 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
              >
                <PanelLeft className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
            <NavButton 
              active={activeTab === 'dashboard'} 
              onClick={() => setActiveTab('dashboard')} 
              icon={<LayoutDashboard className="w-5 h-5" />} 
              label="Dashboard" 
              collapsed={isSidebarCollapsed}
            />
            <NavButton 
              active={activeTab === 'curriculum'} 
              onClick={() => setActiveTab('curriculum')} 
              icon={<BookOpen className="w-5 h-5" />} 
              label="Curriculum" 
              collapsed={isSidebarCollapsed}
            />
            <NavButton 
              active={activeTab === 'mapping'} 
              onClick={() => setActiveTab('mapping')} 
              icon={<Layers className="w-5 h-5" />} 
              label="Mapping Engine" 
              collapsed={isSidebarCollapsed}
            />
            <NavButton 
              active={activeTab === 'planner'} 
              onClick={() => setActiveTab('planner')} 
              icon={<FileEdit className="w-5 h-5" />} 
              label="Lesson Planners" 
              collapsed={isSidebarCollapsed}
            />
            <NavButton 
              active={activeTab === 'tracker'} 
              onClick={() => setActiveTab('tracker')} 
              icon={<BarChart3 className="w-5 h-5" />} 
              label="Progress Trackers" 
              collapsed={isSidebarCollapsed}
            />
            <NavButton 
              active={activeTab === 'calendar'} 
              onClick={() => setActiveTab('calendar')} 
              icon={<Calendar className="w-5 h-5" />} 
              label="Academic Calendars" 
              collapsed={isSidebarCollapsed}
            />
            <NavButton 
              active={activeTab === 'saved'} 
              onClick={() => setActiveTab('saved')} 
              icon={<StickyNote className="w-5 h-5" />} 
              label="Saved Contents" 
              collapsed={isSidebarCollapsed}
            />
            <NavButton 
              active={activeTab === 'resources'} 
              onClick={() => setActiveTab('resources')} 
              icon={<Zap className="w-5 h-5" />} 
              label="Resource Lab" 
              collapsed={isSidebarCollapsed}
            />
          </nav>

          {/* Bottom Sidebar: Teacher Profile Card */}
          <div className="p-3 border-t border-slate-100">
            {!isSidebarCollapsed ? (
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-sm shrink-0">
                    {user?.photoURL ? (
                      <img src={user.photoURL} alt="" className="w-full h-full rounded-xl object-cover" />
                    ) : (
                      user.displayName?.[0] || 'T'
                    )}
                  </div>
                  <div className="overflow-hidden flex-1">
                    <p className="text-xs font-bold text-slate-900 truncate">{user.displayName || 'Lead Teacher'}</p>
                    <p className="text-[10px] font-semibold text-indigo-600 truncate">Lead Educator</p>
                  </div>
                  <button 
                    onClick={() => setActiveTab('settings')}
                    title="Settings"
                    className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 rounded-lg transition-colors"
                  >
                    <Settings className="w-3.5 h-3.5" />
                  </button>
                </div>
                
                <ClassSwitcher 
                  activeClass={activeClass}
                  assignedClasses={userSettings.assignedClasses || []}
                  onSelectClass={handleSelectClass}
                  onOpenModal={() => setIsSelectClassOpen(true)}
                  variant="sidebar"
                />
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <button
                  onClick={() => setActiveTab('settings')}
                  title={`Signed in as ${user.displayName || 'Teacher'}`}
                  className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-sm hover:ring-2 hover:ring-indigo-400 transition-all"
                >
                  {user.displayName?.[0] || 'T'}
                </button>
              </div>
            )}
          </div>
        </aside>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* 4. TOP HEADER */}
        {!isReadyToTeach && (
          <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-6 py-3 transition-all">
            <div className="flex items-center justify-between gap-4">
              {/* Left: View Breadcrumb & Class Indicator */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider hidden sm:inline">Workspace</h2>
                  <span className="text-slate-300 hidden sm:inline">/</span>
                  <p className="text-lg font-black text-slate-900 tracking-tight">
                    {tabLabels[activeTab] || activeTab.replace('-', ' ')}
                  </p>
                </div>
                {activeClass && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                    {activeClass}
                  </span>
                )}
              </div>

              {/* Center/Right Actions */}
              <div className="flex items-center gap-3">
                {/* Search Bar */}
                <div className="relative hidden md:block">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search plans, curriculum..." 
                    className="pl-9 pr-8 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none w-52 lg:w-64 transition-all text-slate-800 placeholder:text-slate-400"
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                    >
                      ×
                    </button>
                  )}
                </div>

                {/* Class Switcher */}
                <ClassSwitcher 
                  activeClass={activeClass}
                  assignedClasses={userSettings.assignedClasses || []}
                  onSelectClass={handleSelectClass}
                  onOpenModal={() => setIsSelectClassOpen(true)}
                  variant="header"
                />

                {/* Notifications Popover */}
                <div className="relative">
                  <button 
                    onClick={() => {
                      setIsNotificationsOpen(!isNotificationsOpen);
                      setIsProfileOpen(false);
                    }}
                    title="Notifications"
                    className="relative p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors border border-transparent hover:border-slate-200"
                  >
                    <Bell className="w-4 h-4" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-600 rounded-full ring-2 ring-white" />
                  </button>

                  <AnimatePresence>
                    {isNotificationsOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 6, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.96 }}
                        className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-50 space-y-3"
                      >
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                          <p className="text-xs font-black text-slate-900 uppercase tracking-wider">Notifications</p>
                          <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">2 New</span>
                        </div>
                        <div className="space-y-2 text-xs">
                          <div className="p-2.5 bg-indigo-50/50 rounded-xl border border-indigo-100 space-y-1">
                            <p className="font-bold text-slate-900">Curriculum Framework Active</p>
                            <p className="text-slate-500 text-[11px]">Belize National Primary Framework 2025/2026 is synced.</p>
                          </div>
                          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                            <p className="font-bold text-slate-900">Academic Calendar Alert</p>
                            <p className="text-slate-500 text-[11px]">Term 2 instructional days mapped for {activeClass || 'Standard 4'}.</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => setIsNotificationsOpen(false)}
                          className="w-full text-center text-xs text-indigo-600 font-bold hover:underline pt-1 block"
                        >
                          Close Notifications
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Settings Shortcut */}
                <button 
                  onClick={() => setActiveTab('settings')}
                  title="Settings"
                  className={cn(
                    "p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors border border-transparent hover:border-slate-200",
                    activeTab === 'settings' && "bg-indigo-50 text-indigo-600 border-indigo-200"
                  )}
                >
                  <Settings className="w-4 h-4" />
                </button>

                {/* Teacher Profile Dropdown */}
                <div className="relative">
                  <button 
                    onClick={() => {
                      setIsProfileOpen(!isProfileOpen);
                      setIsNotificationsOpen(false);
                    }}
                    className="flex items-center gap-2 p-1.5 pr-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all"
                  >
                    <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs font-black shadow-sm shrink-0">
                      {user.displayName?.[0] || 'T'}
                    </div>
                    <span className="text-xs font-bold text-slate-800 hidden sm:inline max-w-[100px] truncate">
                      {user.displayName || 'Teacher'}
                    </span>
                    <ChevronDown className={cn("w-3.5 h-3.5 text-slate-400 transition-transform", isProfileOpen && "rotate-180")} />
                  </button>

                  <AnimatePresence>
                    {isProfileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 6, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.96 }}
                        className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 space-y-1"
                      >
                        <div className="px-3 py-2 border-b border-slate-100 mb-1">
                          <p className="text-xs font-black text-slate-900 truncate">{user.displayName || 'Teacher'}</p>
                          <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Lead Educator</p>
                        </div>
                        <button
                          onClick={() => {
                            setActiveTab('settings');
                            setIsProfileOpen(false);
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-indigo-600 rounded-xl transition-colors text-left"
                        >
                          <Settings className="w-3.5 h-3.5 text-slate-400" />
                          Settings & Preferences
                        </button>
                        <button
                          onClick={() => {
                            setIsSelectClassOpen(true);
                            setIsProfileOpen(false);
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-indigo-600 rounded-xl transition-colors text-left"
                        >
                          <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                          Switch Teaching Class
                        </button>
                        <div className="border-t border-slate-100 my-1" />
                        <button
                          onClick={logout}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors text-left"
                        >
                          <LogOut className="w-3.5 h-3.5 text-rose-500" />
                          Sign Out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </header>
        )}

        <div className={cn(
          "flex-1 w-full min-w-0 transition-all",
          ['planner', 'saved-detail', 'daily-detail', 'la-weekly-detail', 'weekly-detail', 'ready-to-teach', 'mapping', 'calendar'].includes(activeTab) || selectedPlan
            ? "p-2 sm:p-4 md:p-6 w-full max-w-none"
            : "p-4 md:p-6 lg:p-8 max-w-7xl mx-auto"
        )}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab + (selectedPlan?.id || '')}
              className="w-full min-w-0"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <SelectClassModal 
        isOpen={isSelectClassOpen} 
        activeClass={activeClass}
        assignedClasses={userSettings.assignedClasses || []}
        onSelect={handleSelectClass}
        onClose={() => setIsSelectClassOpen(false)}
        onSaveAssignedClasses={handleSaveAssignedClasses}
      />
    </div>
  );
}
