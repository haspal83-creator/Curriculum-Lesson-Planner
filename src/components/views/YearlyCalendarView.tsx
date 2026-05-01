import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Plus, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Info,
  Sparkles,
  ArrowRight,
  Loader2,
  CalendarDays
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { isWithinInterval, format } from 'date-fns';
import { Button, Card, Select } from '../ui';
import { 
  GradeLevel, 
  Subject, 
  UserSettings 
} from '../../types';
import { cn } from '../../lib/utils';
import { useToasts } from '../../context/ToastContext';
import { db, auth } from '../../firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { seedAcademicCalendar, generateWeeklyPlans } from '../../lib/academicCalendarService';

interface WeeklyAcademicPlan {
  id: string;
  cycle_number: number;
  week_number: number;
  start_date: any;
  end_date: any;
  status: 'empty' | 'planned' | 'completed';
  lessons: any[];
  objectives: string[];
}

interface Cycle {
  cycle_number: number;
  start_date: any;
  end_date: any;
  total_weeks: number;
}

interface YearlyCalendarViewProps {
  userSettings: UserSettings;
  setActiveTab: (tab: string) => void;
  setPrefillData: (data: any) => void;
}

export function YearlyCalendarView({ 
  userSettings,
  setActiveTab,
  setPrefillData
}: YearlyCalendarViewProps) {
  const { showToast } = useToasts();
  const [selectedGrade, setSelectedGrade] = useState<GradeLevel>(userSettings.defaultGrade);
  const [selectedSubject, setSelectedSubject] = useState<Subject>(userSettings.defaultSubject);
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [weeklyPlans, setWeeklyPlans] = useState<WeeklyAcademicPlan[]>([]);
  const [holidays, setHolidays] = useState<any[]>([]);
  const [vacations, setVacations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    // Initial Seed check
    seedAcademicCalendar();

    // Listen to cycles
    const unsubCycles = onSnapshot(collection(db, 'cycles'), (snap) => {
      setCycles(snap.docs.map(d => d.data() as Cycle).sort((a, b) => a.cycle_number - b.cycle_number));
    });

    // Listen to holidays
    const unsubHolidays = onSnapshot(collection(db, 'holidays'), (snap) => {
      setHolidays(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    // Listen to vacations
    const unsubVacations = onSnapshot(collection(db, 'vacations'), (snap) => {
      setVacations(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => {
      unsubCycles();
      unsubHolidays();
      unsubVacations();
    };
  }, []);

  useEffect(() => {
    // Listen to weekly plans for current selection
    const q = query(
      collection(db, 'weekly_plans'),
      where('grade', '==', selectedGrade),
      where('subject', '==', selectedSubject),
      orderBy('week_number', 'asc')
    );

    const unsubPlans = onSnapshot(q, (snap) => {
      setWeeklyPlans(snap.docs.map(d => ({ id: d.id, ...d.data() } as WeeklyAcademicPlan)));
      setIsLoading(false);
    });

    return () => unsubPlans();
  }, [selectedGrade, selectedSubject, auth.currentUser]);

  const handleGeneratePlans = async () => {
    const userId = auth.currentUser?.uid;
    if (!userId) {
      showToast("User not authenticated", "error");
      return;
    }
    setIsGenerating(true);
    try {
      await generateWeeklyPlans(userId, selectedGrade, selectedSubject);
      showToast("Weekly plans generated successfully", "success");
    } catch (error) {
      console.error(error);
      showToast("Failed to generate plans", "error");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateAILessons = async (week: WeeklyAcademicPlan) => {
    showToast(`AI Lesson Generation for Week ${week.week_number} coming soon!`, "info");
    // Placeholder for Step 5
  };

  const getWeekStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-emerald-50 border-emerald-200 text-emerald-700';
      case 'planned': return 'bg-indigo-50 border-indigo-200 text-indigo-700';
      default: return 'bg-gray-50 border-gray-100 text-gray-500';
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100">
            <CalendarDays className="w-6 h-6 text-white" />
          </div>
          <div className="space-y-1">
            <h1 className="text-xl font-black text-gray-900 tracking-tight">Academic Planning</h1>
            <p className="text-xs text-gray-500 font-medium">Belize Academic Year 2024-2025</p>
          </div>
          
          <div className="w-px h-10 bg-gray-100 mx-2 hidden md:block" />

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Class</label>
            <Select 
              options={(userSettings.assignedClasses || []).map(c => ({ label: c, value: c }))} 
              value={selectedGrade} 
              onChange={(val) => setSelectedGrade(val as GradeLevel)} 
              className="w-40"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Subject</label>
            <Select 
              options={[
                { label: 'Mathematics', value: 'Mathematics' },
                { label: 'Language Arts', value: 'Language Arts' },
                { label: 'Science', value: 'Science' },
                { label: 'Social Studies', value: 'Social Studies' }
              ]} 
              value={selectedSubject} 
              onChange={(val) => setSelectedSubject(val as Subject)} 
              className="w-40"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <Button 
            onClick={handleGeneratePlans} 
            disabled={isGenerating}
            className="rounded-full px-6 font-bold"
          >
            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />}
            Generate Weekly Plans
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center text-gray-400 space-y-4">
          <Loader2 className="w-12 h-12 animate-spin" />
          <p className="font-medium tracking-tight">Synchronizing Calendar Data...</p>
        </div>
      ) : weeklyPlans.length === 0 ? (
        <Card className="p-12 text-center space-y-6 max-w-2xl mx-auto border-dashed">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
            <Calendar className="w-10 h-10 text-gray-300" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-gray-900">No Weekly Plans Generated</h2>
            <p className="text-gray-500">To start planning your academic year, you need to generate weeks based on the official Belize teaching cycles.</p>
          </div>
          <Button size="lg" onClick={handleGeneratePlans} className="rounded-full px-8">
            Build My 2024-2025 Calendar
          </Button>
        </Card>
      ) : (
        <div className="space-y-12">
          {Array.from(new Set(cycles.map(c => c.cycle_number)))
            .sort((a, b) => a - b)
            .map(cycleNum => {
              const cycle = cycles.find(c => c.cycle_number === cycleNum);
              if (!cycle) return null;
              
              const cyclePlans = weeklyPlans.filter(p => p.cycle_number === cycleNum);
              if (cyclePlans.length === 0) return null;

              return (
                <div key={`cycle-section-${cycleNum}`} className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="h-px flex-1 bg-gray-100" />
                  <div className="flex items-center gap-2 px-4 py-1.5 bg-indigo-50 rounded-full border border-indigo-100 shadow-sm">
                    <span className="text-xs font-black text-indigo-600 uppercase tracking-widest">Teaching Cycle {cycle.cycle_number}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-300" />
                    <span className="text-[10px] font-bold text-indigo-400">
                      {format(cycle.start_date.toDate(), 'MMM d, yyyy')} — {format(cycle.end_date.toDate(), 'MMM d, yyyy')}
                    </span>
                  </div>
                  <div className="h-px flex-1 bg-gray-100" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {cyclePlans.map(week => {
                    const startDate = week.start_date.toDate();
                    const endDate = week.end_date.toDate();
                    const isCurrent = isWithinInterval(new Date(), { start: startDate, end: endDate });
                    
                    // Check for holidays in this week
                    const weekHolidays = holidays.filter(h => 
                      isWithinInterval(h.date.toDate(), { start: startDate, end: endDate })
                    );

                    return (
                      <motion.div
                        key={week.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ y: -4 }}
                      >
                        <Card 
                          className={cn(
                            "relative overflow-hidden cursor-pointer transition-all border-2",
                            isCurrent ? "border-indigo-600 ring-4 ring-indigo-50 shadow-xl" : "border-transparent",
                            getWeekStatusColor(week.status)
                          )}
                          onClick={() => {
                            setPrefillData({
                              grade: selectedGrade,
                              subject: selectedSubject,
                              cycle: week.cycle_number,
                              week: week.week_number,
                            });
                            setActiveTab('planner');
                          }}
                        >
                          {isCurrent && (
                            <div className="absolute top-0 right-0 p-1.5 bg-indigo-600 rounded-bl-xl shadow-lg">
                              <ClockIcon className="w-3 h-3 text-white animate-pulse" />
                            </div>
                          )}

                          <div className="p-5 space-y-4">
                            <div className="flex justify-between items-start">
                              <div className="space-y-0.5">
                                <span className={cn(
                                  "text-[10px] font-black uppercase tracking-widest",
                                  isCurrent ? "text-indigo-600" : "text-gray-400"
                                )}>
                                  Week {week.week_number}
                                </span>
                                <h3 className="font-bold text-gray-900">
                                  {format(startDate, 'MMM d')} - {format(endDate, 'd')}
                                </h3>
                              </div>
                              <div className={cn(
                                "p-2 rounded-lg",
                                week.status === 'completed' ? "bg-emerald-100 text-emerald-600" : "bg-white/50 text-gray-300"
                              )}>
                                <CheckCircle2 className="w-4 h-4" />
                              </div>
                            </div>

                            {weekHolidays.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {weekHolidays.map(h => (
                                  <div key={h.id} className="flex items-center gap-1 px-1.5 py-0.5 bg-rose-100 rounded-md border border-rose-200">
                                    <AlertCircle className="w-2.5 h-2.5 text-rose-600" />
                                    <span className="text-[9px] font-bold text-rose-700 uppercase tracking-tighter truncate max-w-[80px]">
                                      {h.name}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}

                            <div className="flex items-center justify-between pt-2 border-t border-gray-100/50">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleGenerateAILessons(week);
                                }}
                                className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-700 transition-colors"
                              >
                                <Sparkles className="w-3 h-3" />
                                Generate AI
                              </button>
                              <ArrowRight className="w-3 h-3 text-gray-300" />
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Info Panel */}
      <Card className="p-6 bg-blue-50 border-blue-100">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white rounded-2xl shadow-sm border border-blue-100 text-blue-600">
            <Info className="w-5 h-5" />
          </div>
          <div className="space-y-2">
            <h4 className="font-bold text-gray-900 text-lg">Official Belize Academic Structure</h4>
            <p className="text-sm text-gray-600 leading-relaxed">
              This planner is synchronized with the Belize 2024-2025 Academic Calendar. Click any week to launch the AI Lesson Planner with pre-configured cycle and week markers. Holidays and vacations are automatically bypassed during plan generation.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  );
}
