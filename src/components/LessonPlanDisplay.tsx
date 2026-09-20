import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Target, 
  ListChecks, 
  Layers, 
  MessageSquare, 
  CheckCircle2, 
  Zap, 
  RefreshCw, 
  AlertCircle, 
  XCircle, 
  Printer, 
  Download, 
  ChevronDown,
  ChevronUp,
  ChevronRight,
  MoreHorizontal,
  Sparkles,
  Home,
  StickyNote,
  FileText,
  Presentation,
  BookOpen,
  Eye,
  EyeOff,
  ClipboardList,
  Package,
  FileQuestion,
  Image as ImageIcon,
  User,
  GraduationCap,
  Plus,
  PenTool,
  Edit3,
  Trash2,
  Copy,
  RotateCcw,
  CheckSquare,
  Square,
  History,
  BarChart3,
  Video,
  Play,
  Settings,
  Settings2,
  Volume2,
  MonitorPlay,
  Share2,
  Layout,
  Columns,
  Maximize2,
  Minimize2,
  FileVideo,
  ExternalLink,
  Loader2,
  Mic,
  Users,
  Save,
  ShieldAlert,
  FileDown,
  FileUp,
  FileEdit,
  Share,
  MoreVertical,
  Check,
  Info,
  HelpCircle,
  Search,
  Filter,
  ArrowRight,
  ArrowLeft,
  PanelLeft,
  PanelLeftClose,
  PanelRight,
  PanelRightClose,
  BookOpenCheck,
  X
} from 'lucide-react';
import Markdown from 'react-markdown';
import { Button, Card, LessonStatusBadge, DropdownMenu, Tabs, TabsList, TabsTrigger, TabsContent, Badge } from './ui';
import { LessonPlan, LessonStatus, LessonResource, VideoMode, VideoLength, VoiceGender, VoiceTone, VoicePace, AvatarStyle, AvatarPlacement } from '../types';
import { cn } from '../lib/utils';
import { useToasts } from '../context/ToastContext';
import { motion, AnimatePresence } from 'motion/react';
import { auth } from '../firebase';
import { exportToWord, formatLessonForExport } from '../lib/exportUtils';
import { normalizeLearningObjectives } from '../lib/learningObjectivesHelper';
import { PrintableLessonPlan } from './PrintableLessonPlan';
import { LessonVideoPlayer } from './LessonVideoPlayer';
import { ActionPanel } from './ActionPanel';
import { WorksheetDisplayView } from './WorksheetDisplayView';
import { parseAndNormalizeWorksheet, printWorksheetToWindow } from '../lib/worksheetSystem';
import { LessonExecutionBoard } from './LessonExecutionBoard';
import { TeachMeThisTopicModal } from './TeachMeThisTopicModal';
import { TeacherQuickReferenceCard } from './TeacherQuickReferenceCard';
import { LessonAtAGlanceTable } from './LessonAtAGlanceTable';
import { TeacherPrepModeView } from './TeacherPrepModeView';
import { LiveTeachModeView } from './LiveTeachModeView';
import { InstructionalAlignmentChain } from './InstructionalAlignmentChain';
import { enrichAndGuaranteeTeachReady } from '../lib/lessonQualityGate';
import { PowerPointManager } from './PowerPointManager';
import { UniversalLessonPlanDocument } from './UniversalLessonPlanDocument';

// Helper Components for the new Layout
const LessonSectionCard = ({ id, title, icon: Icon, children, actions, expanded, onToggle, className, isTeachMode }: any) => (
  <Card id={id} className={cn(
    "overflow-hidden border-gray-200 shadow-sm hover:shadow-md transition-all mb-6 print:mb-6 print:shadow-none print:border-gray-300 rounded-[16px] bg-white", 
    isTeachMode && "border-indigo-200 shadow-xl",
    className
  )}>
    <div 
      className={cn(
        "flex items-center justify-between px-10 cursor-pointer bg-white hover:bg-gray-50/50 transition-colors border-b border-gray-100 print:cursor-default print:hover:bg-white",
        isTeachMode ? "h-32 px-12" : "h-24"
      )}
      onClick={onToggle}
    >
      <div className="flex items-center gap-6">
        <div className={cn(
          "bg-indigo-50 text-indigo-600 rounded-3xl print:bg-transparent print:p-0 flex items-center justify-center",
          isTeachMode ? "p-6 w-20 h-20" : "p-4 w-16 h-16"
        )}>
          <Icon className={isTeachMode ? "w-10 h-10" : "w-7 h-7"} />
        </div>
        <h3 className={cn(
          "font-black text-gray-900 font-display tracking-tight uppercase",
          isTeachMode ? "text-[36px]" : "text-[28px]"
        )}>{title}</h3>
      </div>
      <div className="flex items-center gap-6 print:hidden">
        {actions && <div className="flex items-center gap-3" onClick={e => e.stopPropagation()}>{actions}</div>}
        <div className={cn(
          "rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-indigo-50 transition-colors",
          isTeachMode ? "h-16 w-16" : "h-12 w-12"
        )}>
          {expanded ? <ChevronUp className={isTeachMode ? "w-8 h-8 text-indigo-600" : "w-6 h-6 text-indigo-600"} /> : <ChevronDown className={isTeachMode ? "w-8 h-8 text-gray-400" : "w-6 h-6 text-gray-400"} />}
        </div>
      </div>
    </div>
    <AnimatePresence initial={false}>
      {(expanded || (typeof window !== 'undefined' && window.matchMedia('print').matches)) && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
          className="print:!h-auto print:!opacity-100"
        >
          <div className={cn(
            "space-y-10 print:p-4",
            isTeachMode ? "p-12" : "p-10"
          )}>
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </Card>
);

const BulletList = ({ items, icon: Icon = Check, isTeachMode }: { items?: string[] | string, icon?: any, isTeachMode?: boolean }) => {
  if (!items) return null;
  const itemList = Array.isArray(items) ? items : [items];
  if (itemList.length === 0) return null;
  
  return (
    <ul className={cn(
      "leading-relaxed",
      isTeachMode ? "space-y-4" : "space-y-2"
    )}>
      {itemList.map((item, i) => (
        <li key={i} className={cn(
          "flex items-start gap-3 text-gray-700",
          isTeachMode ? "text-[18px]" : "text-[14px]"
        )}>
          <div className={cn(
            "flex-shrink-0",
            isTeachMode ? "mt-1.5" : "mt-0.5"
          )}>
            <Icon className={cn(
              "text-indigo-500",
              isTeachMode ? "w-5 h-5" : "w-4 h-4"
            )} />
          </div>
          <div className={cn(
            "prose prose-sm max-w-none inline leading-relaxed",
            isTeachMode ? "text-[18px]" : "text-[14px]"
          )}>
            <Markdown>{item}</Markdown>
          </div>
        </li>
      ))}
    </ul>
  );
};

interface LessonPlanDisplayProps {
  plan: LessonPlan;
  hideActions?: boolean;
  onStatusChange?: (status: LessonStatus) => Promise<void>;
  onGenerateResource?: (plan: LessonPlan, type: string) => Promise<void>;
  onGenerateFullPack?: (plan: LessonPlan) => Promise<void>;
  onUpdatePlan?: (plan: LessonPlan) => Promise<void>;
  onOpenCheckIn?: () => void;
  onGenerateReteach?: () => void;
  onGenerateIntervention?: () => void;
  onGenerateCatchUp?: () => void;
  onScheduleReview?: () => void;
  onAddToRevisionWeek?: () => void;
  onViewProgress?: () => void;
  onGenerateVideo?: (
    plan: LessonPlan, 
    mode: VideoMode, 
    length: VideoLength, 
    voiceSettings: { gender: VoiceGender; tone: VoiceTone; pace: VoicePace },
    avatarSettings: { enabled: boolean; style: AvatarStyle; placement: AvatarPlacement }
  ) => Promise<void>;
  onRenderVideo?: (plan: LessonPlan) => Promise<void>;
  onPrepareForTeaching?: (plan: LessonPlan) => Promise<void>;
  onDuplicate?: (plan: LessonPlan) => Promise<void>;
  isGenerating?: boolean;
  initialTab?: string;
  resources?: any[];
}

export function LessonPlanDisplay({ 
  plan, 
  hideActions = false, 
  onStatusChange,
  onGenerateResource,
  onGenerateFullPack,
  onUpdatePlan,
  onOpenCheckIn,
  onGenerateReteach,
  onGenerateIntervention,
  onGenerateCatchUp,
  onScheduleReview,
  onAddToRevisionWeek,
  onViewProgress,
  onGenerateVideo,
  onRenderVideo,
  onPrepareForTeaching,
  onDuplicate,
  isGenerating,
  initialTab = 'plan',
  resources
}: LessonPlanDisplayProps) {
  const { showToast } = useToasts();
  const enrichedPlan = React.useMemo(() => {
    return enrichAndGuaranteeTeachReady(plan, {
      grade: plan.grade,
      subject: plan.subject,
      cycle: plan.cycle,
      week: plan.week,
      topic: plan.topic,
      subtopic: plan.subtopic,
      learningOutcome: plan.learningOutcome,
      duration: plan.duration
    });
  }, [plan]);

  const [expandedMaterialIndex, setExpandedMaterialIndex] = useState<number | null>(null);
  const [copiedMaterialIndex, setCopiedMaterialIndex] = useState<number | null>(null);
  const [showAnswerKeyMap, setShowAnswerKeyMap] = useState<Record<number, boolean>>({});

  const handleCopyMaterialContent = (content: string, idx: number) => {
    navigator.clipboard.writeText(content);
    setCopiedMaterialIndex(idx);
    showToast("Material copied to clipboard", "success");
    setTimeout(() => setCopiedMaterialIndex(null), 2000);
  };

  const handlePrintMaterialContent = (title: string, content: string, answerKey?: string) => {
    if (title.toLowerCase().includes('worksheet') || content.toLowerCase().includes('worksheet') || content.includes('### A.')) {
      const ws = parseAndNormalizeWorksheet(answerKey ? `${content}\n\n### TEACHER ANSWER KEY & SCORING GUIDE\n${answerKey}` : content, {
        title,
        grade: plan.grade,
        subject: plan.subject,
        topic: plan.topic
      });
      printWorksheetToWindow(ws, 'both');
      return;
    }
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      window.print();
      return;
    }
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; padding: 32px; color: #111827; line-height: 1.6; }
            h1 { font-size: 22px; font-weight: 800; border-bottom: 2px solid #e5e7eb; padding-bottom: 12px; margin-bottom: 24px; }
            pre { white-space: pre-wrap; font-family: inherit; font-size: 14px; }
            .answer-key { margin-top: 40px; padding: 16px; border: 1px solid #10b981; background: #ecfdf5; border-radius: 8px; font-size: 13px; color: #065f46; }
            @media print { button { display: none; } }
          </style>
        </head>
        <body>
          <h1>${title}</h1>
          <pre>${content}</pre>
          ${answerKey ? `<div class="answer-key"><strong>TEACHER ANSWER KEY & GRADING CRITERIA:</strong><br/><pre>${answerKey}</pre></div>` : ''}
          <script>window.onload = function() { window.print(); window.close(); };<\/script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const activeStudentMaterials = React.useMemo(() => {
    const list: Array<{
      id: string;
      title: string;
      type: string;
      content: string;
      answerKey?: string;
      badge: string;
      source: string;
    }> = [];

    // 1. From enriched plan's studentMaterials
    if (enrichedPlan.studentMaterials && Array.isArray(enrichedPlan.studentMaterials)) {
      enrichedPlan.studentMaterials.forEach((sm, idx) => {
        list.push({
          id: `sm-${idx}`,
          title: sm.title,
          type: sm.type,
          content: sm.content,
          answerKey: sm.answerKey,
          badge: sm.type === 'worksheet' ? 'Worksheet' : sm.type === 'exit_ticket' ? 'Exit Ticket' : sm.type === 'quiz' ? 'Quiz' : 'Student Practice',
          source: 'lesson_plan'
        });
      });
    }

    // 2. From standalone resources collection matching this lesson
    if (resources && Array.isArray(resources)) {
      resources.forEach((r, idx) => {
        if (r.lesson_id === plan.id || r.lesson_id === (plan as any).lesson_plan_id) {
          list.push({
            id: r.id || `res-${idx}`,
            title: r.title || `${r.type} Resource`,
            type: (r.type || 'resource').toLowerCase(),
            content: r.content,
            answerKey: r.answerKey,
            badge: r.type || 'Generated Resource',
            source: 'external_resource'
          });
        }
      });
    }

    // 3. From teachingResources.studentMaterials
    if (plan.teachingResources?.studentMaterials?.worksheets) {
      plan.teachingResources.studentMaterials.worksheets.forEach((ws, idx) => {
        list.push({
          id: `tr-ws-${idx}`,
          title: `Practice Worksheet ${idx + 1}`,
          type: 'worksheet',
          content: ws,
          badge: 'Worksheet',
          source: 'teaching_resources'
        });
      });
    }

    return list;
  }, [enrichedPlan, plan, resources]);

  const [viewMode, setViewMode] = useState<'teacher' | 'student'>('teacher');
  const [currentMode, setCurrentMode] = useState<'planner' | 'prep' | 'teach'>('planner');
  const [showTeachMeTopicModal, setShowTeachMeTopicModal] = useState(false);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [isTeachMode, setIsTeachMode] = useState(false);
  const [isSplitView, setIsSplitView] = useState(true);
  const [isNavCollapsed, setIsNavCollapsed] = useState(true);
  const [isAssistantCollapsed, setIsAssistantCollapsed] = useState(true);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isMobileAssistantOpen, setIsMobileAssistantOpen] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);

  const navItems = [
    { id: 'header', label: '1. Lesson Header', icon: FileText },
    { id: 'overview', label: '2. Lesson Overview', icon: Layout },
    { id: 'objectives', label: '3. Objectives', icon: Target },
    { id: 'strategies', label: '4. Strategies', icon: Sparkles },
    { id: 'sequence', label: '5. Teaching Sequence', icon: PenTool },
    { id: 'timing', label: '6. Time Management', icon: Clock },
    { id: 'actions', label: '7. Teacher vs Student', icon: Users },
    { id: 'assessment', label: '8. Assessment', icon: ListChecks },
    { id: 'differentiation', label: '9. Differentiation', icon: Layers },
    { id: 'closure', label: '10. Closure & Notes', icon: XCircle },
    { id: 'homework', label: '11. Homework / Ext', icon: Home },
    { id: 'assets', label: 'Lesson Assets', icon: Package },
  ];
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    header: true,
    overview: true,
    objectives: true,
    strategies: true,
    sequence: true,
    timing: true,
    actions: true,
    assessment: true,
    differentiation: true,
    closure: true,
    homework: true,
    assets: true
  });

  const [activeSection, setActiveSection] = useState('header');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { 
        rootMargin: '-100px 0px -70% 0px',
        threshold: 0
      }
    );

    const ids = ['summary', 'strategies', 'objectives', 'materials', 'procedures', 'assessment', 'differentiation', 'closure', 'reflection', 'assets'];
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [plan]);

  const scrollToSection = (id: string) => {
    setIsMobileNavOpen(false);
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -90;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
      setActiveSection(id);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const expandAll = () => {
    const allExpanded = Object.keys(expandedSections).reduce((acc, key) => ({ ...acc, [key]: true }), {});
    setExpandedSections(allExpanded);
  };

  const collapseAll = () => {
    const allCollapsed = Object.keys(expandedSections).reduce((acc, key) => ({ ...acc, [key]: false }), {});
    setExpandedSections(allCollapsed);
  };

  const handleExportPDF = () => {
    window.print();
  };

  const handleExportWord = async () => {
    try {
      showToast("Generating complete lesson pack (.docx)...", "info");
      const teacher = auth.currentUser?.displayName || (auth.currentUser?.email?.startsWith('haspal') ? 'Hassan' : undefined) || plan.studentTeacherName || 'Hassan';
      await exportToWord(plan, teacher, 'SAN JUAN BOSCO R.C. SCHOOL');
      showToast("Complete lesson pack exported successfully as .docx!", "success");
    } catch (err) {
      console.error("Export error:", err);
      showToast("Failed to export Word document.", "error");
    }
  };

  // Video Settings State
  const [videoMode, setVideoMode] = useState<VideoMode>('Teacher Explainer');
  const [videoLength, setVideoLength] = useState<VideoLength>('5 min');
  const [voiceSettings, setVoiceSettings] = useState({
    gender: 'Female' as VoiceGender,
    tone: 'Normal' as VoiceTone,
    pace: 'Normal' as VoicePace
  });
  const [avatarSettings, setAvatarSettings] = useState({
    enabled: false,
    style: 'Female Teacher' as AvatarStyle,
    placement: 'Corner' as AvatarPlacement
  });

  const handlePrint = () => {
    window.print();
  };

  const toggleChecklist = async (index: number) => {
    if (!plan.beforeClassChecklist || !onUpdatePlan) return;
    const newChecklist = [...plan.beforeClassChecklist];
    newChecklist[index].completed = !newChecklist[index].completed;
    await onUpdatePlan({ ...plan, beforeClassChecklist: newChecklist });
  };

  const handleGenerateFullPack = async () => {
    if (!onGenerateFullPack) return;
    await onGenerateFullPack(plan);
  };

  const renderResourceCard = (title: string, content: string, type: string, key?: string | number) => {
    let parsedData: any = null;
    let isJson = false;

    if (typeof content === 'string' && (content.trim().startsWith('{') || content.trim().startsWith('['))) {
      try {
        parsedData = JSON.parse(content);
        isJson = true;
      } catch (e) {
        isJson = false;
      }
    }

    const renderAssessmentItems = (data: any) => {
      // Handle different possible JSON structures for assessments
      const items = data?.assessment?.assessment_items || 
                    data?.assessment_items || 
                    (Array.isArray(data) ? data : (data?.questions || []));
      
      if (!Array.isArray(items) || items.length === 0) {
        return (
          <div className="bg-gray-50 p-6 rounded-2xl border-2 border-dashed border-gray-200 text-center">
            <p className="text-gray-500 font-medium whitespace-pre-wrap">{typeof data === 'string' ? data : JSON.stringify(data, null, 2)}</p>
          </div>
        );
      }

      return (
        <div className="space-y-6">
          {items.map((item: any, i: number) => (
            <Card key={i} className="p-8 border-gray-100 shadow-sm hover:shadow-md transition-all rounded-[24px] bg-white">
              <div className="flex justify-between items-start gap-4 mb-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-600 text-white text-sm font-black">
                      {i + 1}
                    </span>
                    <h5 className="text-xl font-bold text-gray-900 leading-tight">
                      {item.question}
                    </h5>
                  </div>
                  {item.type && (
                    <span className="inline-block px-2.5 py-1 bg-gray-100 text-gray-500 rounded-lg text-[10px] font-black uppercase tracking-widest ml-11">
                      {item.type.replace('_', ' ')}
                    </span>
                  )}
                </div>
                {item.points && (
                  <Badge variant="outline" className="shrink-0 bg-indigo-50 text-indigo-700 border-indigo-100 font-black px-3 py-1 scale-110">
                    {item.points} PTS
                  </Badge>
                )}
              </div>
              
              <div className="ml-11">
                {(item.type === 'multiple_choice' || item.options) && (
                  <div className="grid grid-cols-1 gap-3">
                    {item.options?.map((option: string, index: number) => (
                      <div 
                        key={index} 
                        className="flex items-center gap-4 p-4 rounded-2xl border-2 border-gray-50 hover:border-indigo-100 hover:bg-indigo-50/30 transition-all group cursor-pointer"
                      >
                        <div className="w-6 h-6 rounded-full border-2 border-gray-200 group-hover:border-indigo-400 flex items-center justify-center transition-colors">
                          <div className="w-2.5 h-2.5 rounded-full bg-transparent group-hover:bg-indigo-400 transition-colors" />
                        </div>
                        <span className="text-lg font-medium text-gray-700">{option}</span>
                      </div>
                    ))}
                  </div>
                )}

                {item.type === 'true_false' && (
                  <div className="flex gap-4 max-w-sm">
                    {['True', 'False'].map((val) => (
                      <button 
                        key={val}
                        className="flex-1 py-4 px-6 rounded-2xl border-2 border-gray-50 font-black text-gray-400 hover:border-indigo-600 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                )}

                {!item.options && item.type !== 'true_false' && (
                  <div className="mt-4 p-6 bg-gray-50 rounded-2xl border border-gray-100 min-h-[100px]">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Student Response Area</span>
                  </div>
                )}

                {item.answer && (
                  <div className="mt-6 p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex gap-3 items-start">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Answer Key</p>
                      <p className="text-emerald-900 font-bold">{item.answer}</p>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      );
    };

    return (
      <Card key={key} className="p-6 space-y-4 bg-white border-gray-100 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex justify-between items-center">
          <h4 className="text-lg font-bold text-gray-900">{title}</h4>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" title="Edit">
              <Edit3 className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" title="Download">
              <Download className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" title="Regenerate" onClick={() => onGenerateResource?.(plan, type)}>
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div className="prose prose-sm max-w-none text-gray-800">
          {isJson ? (
            renderAssessmentItems(parsedData)
          ) : (
            <Markdown>{content}</Markdown>
          )}
        </div>
      </Card>
    );
  };

  return (
    <>
      {/* Mobile / Tablet Left Navigation Drawer */}
      {isMobileNavOpen && (
        <div className="fixed inset-0 z-50 min-[1200px]:hidden flex">
          <div 
            className="fixed inset-0 bg-gray-900/60 backdrop-blur-xs transition-opacity" 
            onClick={() => setIsMobileNavOpen(false)}
          />
          <div className="relative w-80 max-w-[85vw] bg-white h-full shadow-2xl z-10 flex flex-col p-5 overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <PanelLeft className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-gray-900 text-sm">Lesson Sections</h3>
              </div>
              <button 
                onClick={() => setIsMobileNavOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1.5 py-4 flex-1">
              {navItems.map(item => (
                <button 
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={cn(
                    "h-11 w-full rounded-xl px-3 flex items-center justify-between text-sm font-bold transition-all group",
                    activeSection === item.id 
                      ? "bg-indigo-50 text-indigo-600 shadow-xs" 
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <item.icon className={cn(
                      "w-4 h-4 shrink-0",
                      activeSection === item.id ? "text-indigo-600" : "text-gray-400 group-hover:text-indigo-500"
                    )} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {activeSection === item.id && (
                    <div className="w-2 h-2 rounded-full bg-indigo-600 shrink-0" />
                  )}
                </button>
              ))}
            </div>

            <div className="pt-4 border-t border-gray-100 space-y-2 text-xs">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Lesson Info</p>
              <div className="flex justify-between text-gray-600">
                <span>Duration:</span>
                <span className="font-bold text-gray-900">{plan.duration}m</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Grade:</span>
                <span className="font-bold text-gray-900">{plan.grade}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Subject:</span>
                <span className="font-bold text-gray-900">{plan.subject}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile / Tablet Right Assistant Drawer */}
      {isMobileAssistantOpen && (
        <div className="fixed inset-0 z-50 min-[1440px]:hidden flex justify-end">
          <div 
            className="fixed inset-0 bg-gray-900/60 backdrop-blur-xs transition-opacity" 
            onClick={() => setIsMobileAssistantOpen(false)}
          />
          <div className="relative w-84 max-w-[85vw] bg-white h-full shadow-2xl z-10 flex flex-col p-5 overflow-y-auto space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2 text-indigo-600">
                <Settings2 className="w-5 h-5" />
                <h3 className="font-bold text-gray-900 text-sm">Assistant & Actions</h3>
              </div>
              <button 
                onClick={() => setIsMobileAssistantOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Teaching Resources</p>
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-start h-11 rounded-xl border-gray-200 text-gray-700 font-bold text-xs hover:bg-indigo-50 hover:text-indigo-600"
                  onClick={() => {
                    setIsMobileAssistantOpen(false);
                    setActiveTab('resources');
                  }}
                >
                  <FileText className="w-4 h-4 mr-2.5 text-gray-400" /> 
                  Teaching Resources
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start h-11 rounded-xl border-gray-200 text-gray-700 font-bold text-xs hover:bg-indigo-50 hover:text-indigo-600"
                  onClick={() => {
                    setIsMobileAssistantOpen(false);
                    setActiveTab('board-plan');
                  }}
                >
                  <Presentation className="w-4 h-4 mr-2.5 text-gray-400" /> 
                  Board Plan
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start h-11 rounded-xl border-gray-200 text-gray-700 font-bold text-xs hover:bg-indigo-50 hover:text-indigo-600"
                  onClick={() => {
                    setIsMobileAssistantOpen(false);
                    setActiveTab('ai-video');
                  }}
                >
                  <Video className="w-4 h-4 mr-2.5 text-gray-400" /> 
                  AI Video Lesson
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-indigo-600">Teaching Actions</p>
              <div className="space-y-2">
                <Button 
                  variant="primary" 
                  className="w-full justify-start h-11 rounded-xl font-bold text-xs" 
                  onClick={() => {
                    setIsMobileAssistantOpen(false);
                    onGenerateReteach?.();
                  }}
                >
                  <RefreshCw className="w-4 h-4 mr-2" /> Generate Reteach
                </Button>
                <Button 
                  variant="secondary" 
                  className="w-full justify-start h-11 rounded-xl font-bold text-xs" 
                  onClick={() => {
                    setIsMobileAssistantOpen(false);
                    onGenerateIntervention?.();
                  }}
                >
                  <Zap className="w-4 h-4 mr-2" /> Intervention Plan
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6 print:hidden w-full min-w-0">
        {/* Header & Mode Toggle */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm print:hidden">
        <div className="flex items-center gap-6">
          <div className="flex bg-gray-50 p-1.5 rounded-2xl border border-gray-100">
            <button
              onClick={() => setViewMode('teacher')}
              className={cn(
                "flex items-center gap-2.5 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300",
                viewMode === 'teacher' ? "bg-white text-indigo-600 shadow-md shadow-indigo-100/50" : "text-gray-400 hover:text-gray-600"
              )}
            >
              <User className="w-4 h-4" />
              Teacher View
            </button>
            <button
              onClick={() => setViewMode('student')}
              className={cn(
                "flex items-center gap-2.5 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300",
                viewMode === 'student' ? "bg-white text-emerald-600 shadow-md shadow-emerald-100/50" : "text-gray-400 hover:text-gray-600"
              )}
            >
              <GraduationCap className="w-4 h-4" />
              Student View
            </button>
          </div>
          {plan.isReadyToTeach && (
            <div className="flex items-center gap-2.5 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-[0.1em] border border-emerald-100">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              Ready to Teach
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          {onGenerateFullPack && (
            <Button 
              onClick={handleGenerateFullPack} 
              disabled={isGenerating}
              variant={plan.isReadyToTeach ? "secondary" : "primary"}
              className={cn(
                "h-12 px-6 rounded-2xl font-bold transition-all",
                !plan.isReadyToTeach && "bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-200"
              )}
            >
              {isGenerating ? (
                <RefreshCw className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Sparkles className="w-4 h-4 mr-2" />
              )}
              {plan.isReadyToTeach ? "Refresh Pack" : "Generate Full Pack"}
            </Button>
          )}
          <Button variant="secondary" onClick={handlePrint} className="h-12 px-6 rounded-2xl font-bold border-gray-200">
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
          {onPrepareForTeaching && (
            <Button 
              className="h-12 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xl shadow-emerald-200"
              onClick={() => onPrepareForTeaching(plan)}
            >
              <Zap className="w-4 h-4 mr-2" />
              Launch Lesson
            </Button>
          )}
        </div>
      </div>

      <Card className="overflow-hidden border-gray-100 shadow-xl print:shadow-none print:border-none print:hidden w-full min-w-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="bg-white border-b border-gray-100 px-4 sm:px-8 pt-6 print:hidden">
            <TabsList className="bg-transparent h-auto p-0 gap-6 sm:gap-8 overflow-x-auto flex-nowrap no-scrollbar">
              <TabsTrigger value="plan" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-4 data-[state=active]:border-indigo-600 rounded-none pb-4 text-sm font-black uppercase tracking-widest transition-all">
                Lesson Plan
              </TabsTrigger>
              <TabsTrigger value="powerpoint" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-4 data-[state=active]:border-indigo-600 rounded-none pb-4 text-sm font-black uppercase tracking-widest text-indigo-600 transition-all flex items-center">
                <Presentation className="w-4 h-4 mr-2" />
                PowerPoint
              </TabsTrigger>
              <TabsTrigger value="ai-video" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-4 data-[state=active]:border-indigo-600 rounded-none pb-4 text-sm font-black uppercase tracking-widest text-indigo-600 transition-all">
                <Video className="w-4 h-4 mr-2" />
                AI Video
              </TabsTrigger>
              {viewMode === 'teacher' && (
                <React.Fragment key="teacher-tabs">
                  <TabsTrigger value="video" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-4 data-[state=active]:border-indigo-600 rounded-none pb-4 text-sm font-black uppercase tracking-widest transition-all">
                    Assistant
                  </TabsTrigger>
                  <TabsTrigger value="visual-aids" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-4 data-[state=active]:border-indigo-600 rounded-none pb-4 text-sm font-black uppercase tracking-widest transition-all">
                    Visuals
                  </TabsTrigger>
                  <TabsTrigger value="board-plan" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-4 data-[state=active]:border-indigo-600 rounded-none pb-4 text-sm font-black uppercase tracking-widest transition-all">
                    Board
                  </TabsTrigger>
                  <TabsTrigger value="materials-prep" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-4 data-[state=active]:border-indigo-600 rounded-none pb-4 text-sm font-black uppercase tracking-widest transition-all">
                    Prep
                  </TabsTrigger>
                  <TabsTrigger value="execution" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-4 data-[state=active]:border-rose-600 rounded-none pb-4 text-sm font-black uppercase tracking-widest text-rose-600 transition-all">
                    <Zap className="w-4 h-4 mr-2" />
                    Teach Now
                  </TabsTrigger>
                </React.Fragment>
              )}
              <TabsTrigger value="worksheets" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-4 data-[state=active]:border-indigo-600 rounded-none pb-4 text-sm font-black uppercase tracking-widest transition-all">
                Worksheets
              </TabsTrigger>
              <TabsTrigger value="assessments" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-4 data-[state=active]:border-indigo-600 rounded-none pb-4 text-sm font-black uppercase tracking-widest transition-all">
                Assessments
              </TabsTrigger>
            </TabsList>
          </div>

          <div className={cn("w-full min-w-0 print:p-0", activeTab === 'plan' ? "p-0" : "p-4 sm:p-6 lg:p-8")}>
            <TabsContent value="ai-video" className="mt-0 space-y-8">
              {plan.lessonVideo ? (
                <div className="space-y-8">
                  {/* Video Player Placeholder / Preview */}
                  <div className="aspect-video bg-slate-900 rounded-3xl flex flex-col items-center justify-center text-white relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    <div className="z-10 flex flex-col items-center gap-4">
                      <div 
                        className="w-20 h-20 bg-indigo-600 rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform cursor-pointer"
                        onClick={() => setShowVideoPlayer(true)}
                      >
                        <Play className="w-10 h-10 fill-current" />
                      </div>
                      <div className="text-center">
                        <h3 className="text-xl font-black tracking-tight">{plan.lessonVideo.title}</h3>
                        <p className="text-white/60 text-sm">{plan.lessonVideo.mode} • {plan.lessonVideo.length}</p>
                      </div>
                    </div>

                    {/* Video Controls Overlay */}
                    <div className="absolute bottom-6 left-6 right-6 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                          <Volume2 className="w-5 h-5" />
                        </Button>
                        <div className="h-1 w-48 bg-white/20 rounded-full overflow-hidden">
                          <div className="h-full w-1/3 bg-indigo-500" />
                        </div>
                        <span className="text-xs font-mono">01:24 / {plan.lessonVideo.length}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                          <Settings2 className="w-5 h-5" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-white hover:bg-white/10"
                          onClick={() => setShowVideoPlayer(true)}
                        >
                          <MonitorPlay className="w-5 h-5" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                      {/* Script Section */}
                      <Card className="p-6 space-y-4">
                        <div className="flex justify-between items-center">
                          <h3 className="text-xl font-bold flex items-center gap-2 text-gray-900">
                            <FileVideo className="w-6 h-6 text-indigo-600" />
                            Teaching Script
                          </h3>
                          <Button variant="secondary" size="sm">
                            <Edit3 className="w-4 h-4" />
                            Edit Script
                          </Button>
                        </div>
                        <div className="prose prose-indigo max-w-none text-gray-600 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                          <Markdown>{plan.lessonVideo.script}</Markdown>
                        </div>
                      </Card>

                      {/* Scene Breakdown */}
                      <section className="space-y-4">
                        <h3 className="text-xl font-bold text-gray-900">Scene Breakdown</h3>
                        <div className="space-y-4">
                          {plan.lessonVideo.scenes?.map((scene, i) => (
                            <Card key={i} className="p-6 flex gap-6">
                              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center font-black text-lg flex-shrink-0">
                                {i + 1}
                              </div>
                              <div className="flex-grow space-y-3">
                                <div className="flex justify-between items-start">
                                  <h4 className="font-bold text-gray-900">{scene.title}</h4>
                                  <span className="text-xs font-mono text-gray-400">{scene.duration}s</span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Narration</p>
                                    <p className="text-sm text-gray-600 italic">"{scene.narration}"</p>
                                  </div>
                                  <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Visuals</p>
                                    <p className="text-sm text-gray-700">{scene.visualDescription}</p>
                                  </div>
                                </div>
                                {scene.onScreenText && scene.onScreenText.length > 0 && (
                                  <div className="flex flex-wrap gap-2 pt-2">
                                    {scene.onScreenText.map((text, j) => (
                                      <span key={j} className="px-2 py-1 bg-amber-50 text-amber-700 rounded-lg text-[10px] font-bold border border-amber-100">
                                        ON SCREEN: {text}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </Card>
                          ))}
                        </div>
                      </section>
                    </div>

                    <div className="space-y-8">
                      {/* Video Actions */}
                      <Card className="p-6 space-y-4 bg-indigo-600 text-white border-none shadow-xl shadow-indigo-200">
                        <h3 className="text-lg font-bold">Video Actions</h3>
                        <div className="space-y-2">
                          <Button className="w-full bg-white text-indigo-600 hover:bg-indigo-50">
                            <Download className="w-4 h-4" />
                            Export as MP4
                          </Button>
                          <Button className="w-full bg-white/10 text-white hover:bg-white/20 border-white/20">
                            <Share2 className="w-4 h-4" />
                            Share Lesson Link
                          </Button>
                          <Button className="w-full bg-white/10 text-white hover:bg-white/20 border-white/20">
                            <Presentation className="w-4 h-4" />
                            Open in Presenter
                          </Button>
                        </div>
                      </Card>

                      {/* Voice Settings Summary */}
                      <Card className="p-6 space-y-4">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                          <Volume2 className="w-5 h-5 text-indigo-600" />
                          Voice Profile
                        </h3>
                        <div className="space-y-3">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Gender</span>
                            <span className="font-bold text-gray-900">{plan.lessonVideo.voiceSettings.gender}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Tone</span>
                            <span className="font-bold text-gray-900">{plan.lessonVideo.voiceSettings.tone}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Pace</span>
                            <span className="font-bold text-gray-900">{plan.lessonVideo.voiceSettings.pace}</span>
                          </div>
                          <Button variant="ghost" size="sm" className="w-full mt-2" onClick={() => setActiveTab('ai-video-settings')}>
                            <Settings2 className="w-4 h-4" />
                            Change Settings
                          </Button>
                        </div>
                      </Card>

                      {/* Resource Pack */}
                      <Card className="p-6 space-y-4 bg-emerald-50 border-emerald-100">
                        <h3 className="text-lg font-bold text-emerald-900 flex items-center gap-2">
                          <Package className="w-5 h-5" />
                          Resource Pack
                        </h3>
                        <p className="text-xs text-emerald-700">Complementary materials generated with this video.</p>
                        <div className="space-y-2">
                          <Button variant="ghost" size="sm" className="w-full justify-start text-emerald-800 hover:bg-emerald-100">
                            <FileText className="w-4 h-4" />
                            Printable Visuals
                          </Button>
                          <Button variant="ghost" size="sm" className="w-full justify-start text-emerald-800 hover:bg-emerald-100">
                            <ListChecks className="w-4 h-4" />
                            Review Questions
                          </Button>
                          <Button variant="ghost" size="sm" className="w-full justify-start text-emerald-800 hover:bg-emerald-100">
                            <Layers className="w-4 h-4" />
                            Vocabulary Cards
                          </Button>
                        </div>
                      </Card>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="max-w-4xl mx-auto space-y-8">
                  <div className="text-center space-y-4 py-12">
                    <div className="w-24 h-24 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Video className="w-12 h-12" />
                    </div>
                    <h3 className="text-3xl font-black text-gray-900 tracking-tight">AI Video Lesson Teacher</h3>
                    <p className="text-gray-500 max-w-xl mx-auto">
                      Transform this lesson plan into a student-friendly teaching video. 
                      Perfect for introducing concepts, explaining vocabulary, or providing a clear recap.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Card className="p-8 space-y-6">
                      <h4 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <Settings2 className="w-6 h-6 text-indigo-600" />
                        Video Settings
                      </h4>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block">Video Style</label>
                          <div className="grid grid-cols-2 gap-2">
                            {(['Teacher Explainer', 'Animated Lesson', 'Visual Slideshow', 'Whiteboard', 'Tutorial', 'Vocabulary', 'Revision'] as VideoMode[]).map(mode => (
                              <button
                                key={mode}
                                onClick={() => setVideoMode(mode)}
                                className={cn(
                                  "px-3 py-2 rounded-xl text-xs font-bold border-2 transition-all text-left",
                                  videoMode === mode ? "bg-indigo-50 border-indigo-600 text-indigo-600" : "bg-white border-gray-100 text-gray-500 hover:border-gray-200"
                                )}
                              >
                                {mode}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block">Target Length</label>
                          <div className="flex gap-2">
                            {(['2 min', '5 min', '8 min', '10 min'] as VideoLength[]).map(len => (
                              <button
                                key={len}
                                onClick={() => setVideoLength(len)}
                                className={cn(
                                  "flex-1 px-3 py-2 rounded-xl text-xs font-bold border-2 transition-all",
                                  videoLength === len ? "bg-emerald-50 border-emerald-600 text-emerald-600" : "bg-white border-gray-100 text-gray-500 hover:border-gray-200"
                                )}
                              >
                                {len}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </Card>

                    <Card className="p-8 space-y-6">
                      <h4 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <Volume2 className="w-6 h-6 text-emerald-600" />
                        Voice Settings
                      </h4>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block">Teacher Voice</label>
                          <div className="flex gap-2">
                            {(['Male', 'Female'] as VoiceGender[]).map(gender => (
                              <button
                                key={gender}
                                onClick={() => setVoiceSettings(prev => ({ ...prev, gender }))}
                                className={cn(
                                  "flex-1 px-3 py-2 rounded-xl text-xs font-bold border-2 transition-all",
                                  voiceSettings.gender === gender ? "bg-amber-50 border-amber-600 text-amber-600" : "bg-white border-gray-100 text-gray-500 hover:border-gray-200"
                                )}
                              >
                                {gender} Teacher
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block">Tone & Pace</label>
                          <div className="grid grid-cols-2 gap-4">
                            <select 
                              value={voiceSettings.tone}
                              onChange={(e) => setVoiceSettings(prev => ({ ...prev, tone: e.target.value as VoiceTone }))}
                              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium"
                            >
                              <option value="Normal">Normal Tone</option>
                              <option value="Calm">Calm Tone</option>
                              <option value="Energetic">Energetic Tone</option>
                            </select>
                            <select 
                              value={voiceSettings.pace}
                              onChange={(e) => setVoiceSettings(prev => ({ ...prev, pace: e.target.value as VoicePace }))}
                              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium"
                            >
                              <option value="Normal">Normal Pace</option>
                              <option value="Slow">Slow Pace</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4 pt-6 border-t border-gray-100">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <User className="w-6 h-6 text-indigo-600" />
                            AI Avatar Teacher
                          </h4>
                          <button
                            onClick={() => setAvatarSettings(prev => ({ ...prev, enabled: !prev.enabled }))}
                            className={cn(
                              "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none",
                              avatarSettings.enabled ? "bg-indigo-600" : "bg-gray-200"
                            )}
                          >
                            <span
                              className={cn(
                                "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                                avatarSettings.enabled ? "translate-x-6" : "translate-x-1"
                              )}
                            />
                          </button>
                        </div>

                        {avatarSettings.enabled && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="space-y-4 pt-2"
                          >
                            <div>
                              <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block">Avatar Style</label>
                              <div className="grid grid-cols-2 gap-2">
                                {(['Female Teacher', 'Male Teacher', 'Cartoon Character', 'Robot Assistant'] as AvatarStyle[]).map(style => (
                                  <button
                                    key={style}
                                    onClick={() => setAvatarSettings(prev => ({ ...prev, style }))}
                                    className={cn(
                                      "px-3 py-2 rounded-xl text-[10px] font-bold border-2 transition-all",
                                      avatarSettings.style === style ? "bg-indigo-50 border-indigo-600 text-indigo-600" : "bg-white border-gray-100 text-gray-500 hover:border-gray-200"
                                    )}
                                  >
                                    {style}
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div>
                              <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block">Placement</label>
                              <div className="flex gap-2">
                                {(['Corner', 'Full Screen', 'Split Screen'] as AvatarPlacement[]).map(placement => (
                                  <button
                                    key={placement}
                                    onClick={() => setAvatarSettings(prev => ({ ...prev, placement }))}
                                    className={cn(
                                      "flex-1 px-3 py-2 rounded-xl text-[10px] font-bold border-2 transition-all",
                                      avatarSettings.placement === placement ? "bg-indigo-50 border-indigo-600 text-indigo-600" : "bg-white border-gray-100 text-gray-500 hover:border-gray-200"
                                    )}
                                  >
                                    {placement}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </div>

                      <div className="pt-6 border-t border-gray-100">
                        {plan.lessonVideo ? (
                          <div className="space-y-4">
                            <Button 
                              className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-white text-lg font-black shadow-xl shadow-emerald-200"
                              onClick={() => setShowVideoPlayer(true)}
                            >
                              <Play className="w-6 h-6 mr-2 fill-current" />
                              Play Teaching Video
                            </Button>
                            <Button 
                              variant="outline"
                              className="w-full h-12 border-2 border-indigo-100 text-indigo-600 font-bold hover:bg-indigo-50"
                              onClick={() => onGenerateVideo?.(plan, videoMode, videoLength, voiceSettings, avatarSettings)}
                              disabled={isGenerating}
                            >
                              <RefreshCw className={cn("w-5 h-5 mr-2", isGenerating && "animate-spin")} />
                              Regenerate Video
                            </Button>
                          </div>
                        ) : (
                          <Button 
                            className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white text-lg font-black shadow-xl shadow-indigo-200"
                            onClick={() => onGenerateVideo?.(plan, videoMode, videoLength, voiceSettings, avatarSettings)}
                            disabled={isGenerating}
                          >
                            {isGenerating ? (
                              <RefreshCw className="w-6 h-6 animate-spin mr-2" />
                            ) : (
                              <Sparkles className="w-6 h-6 mr-2" />
                            )}
                            {isGenerating ? "Generating Video Package..." : "Generate Full Teaching Video"}
                          </Button>
                        )}
                        <p className="text-[10px] text-center text-gray-400 mt-4 font-bold uppercase tracking-widest">
                          Curriculum-aligned • Age-appropriate • Teacher-ready
                        </p>
                      </div>
                    </Card>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="powerpoint" className="mt-0 p-4 sm:p-6 lg:p-8">
              <PowerPointManager
                presentation={plan.powerpointPresentation}
                lesson={plan}
                onUpdatePresentation={async (updated) => {
                  if (onUpdatePlan) {
                    await onUpdatePlan({ ...plan, powerpointPresentation: updated });
                  }
                }}
                onRebuildPresentation={async () => {
                  try {
                    const { generatePowerPoint } = await import('../services/gemini');
                    const res = await generatePowerPoint(plan);
                    if (onUpdatePlan && res) {
                      await onUpdatePlan({ ...plan, powerpointPresentation: res });
                    }
                  } catch (err) {
                    const { buildDeterministicPowerPoint } = await import('../lib/powerpointService');
                    const fallback = buildDeterministicPowerPoint(plan);
                    if (onUpdatePlan) {
                      await onUpdatePlan({ ...plan, powerpointPresentation: fallback });
                    }
                  }
                }}
              />
            </TabsContent>

            <TabsContent value="plan" className="mt-0 relative bg-gray-50/30 min-h-screen w-full min-w-0">
              {/* 1. STICKY TOP ACTION BAR */}
              <div className="sticky top-0 z-40 h-[68px] sm:h-[72px] border-b border-gray-200 bg-white/95 backdrop-blur-md print:hidden px-3 sm:px-6 flex items-center justify-between gap-3">
                <div className="w-full mx-auto h-full flex items-center justify-between gap-2 sm:gap-4 min-w-0">
                  {/* Left Controls: Mode & Panel Toggles */}
                  <div className="flex items-center gap-2 sm:gap-3 flex-wrap min-w-0">
                    <div className="flex items-center bg-gray-100/70 p-1 rounded-2xl border border-gray-200/60">
                      <Button 
                        variant={currentMode === 'planner' ? "primary" : "ghost"} 
                        size="sm" 
                        className={cn(
                          "h-8 sm:h-9 px-2.5 sm:px-3.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all duration-300", 
                          currentMode === 'planner' ? "bg-white shadow-sm text-indigo-600" : "text-gray-500 hover:text-gray-800"
                        )}
                        onClick={() => {
                          setCurrentMode('planner');
                          setIsTeachMode(false);
                        }}
                      >
                        Planner
                      </Button>
                      <Button 
                        variant={currentMode === 'prep' ? "primary" : "ghost"} 
                        size="sm" 
                        className={cn(
                          "h-8 sm:h-9 px-2.5 sm:px-3.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all duration-300", 
                          currentMode === 'prep' ? "bg-white shadow-sm text-indigo-600" : "text-gray-500 hover:text-gray-800"
                        )}
                        onClick={() => {
                          setCurrentMode('prep');
                          setIsTeachMode(false);
                        }}
                      >
                        Prep
                      </Button>
                      <Button 
                        variant={currentMode === 'teach' ? "primary" : "ghost"} 
                        size="sm" 
                        className={cn(
                          "h-8 sm:h-9 px-2.5 sm:px-3.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all duration-300", 
                          currentMode === 'teach' ? "bg-white shadow-sm text-indigo-600" : "text-gray-500 hover:text-gray-800"
                        )}
                        onClick={() => {
                          setCurrentMode('teach');
                          setIsTeachMode(true);
                        }}
                      >
                        Teach
                      </Button>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowTeachMeTopicModal(true)}
                      className="h-8 sm:h-9 px-2.5 sm:px-3 rounded-xl border-indigo-200 text-indigo-600 hover:bg-indigo-50 text-xs font-bold hidden sm:flex items-center gap-1.5 shadow-xs"
                      title="Instant Teacher Conceptual Mastery Briefing"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Teach Me This</span>
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setActiveTab('powerpoint')}
                      className="h-8 sm:h-9 px-2.5 sm:px-3 rounded-xl border-indigo-200 bg-indigo-50/70 text-indigo-700 hover:bg-indigo-100 text-xs font-bold flex items-center gap-1.5 shadow-xs"
                      title="Open & Present PowerPoint Presentation"
                    >
                      <Presentation className="w-3.5 h-3.5 text-indigo-600" />
                      <span>PowerPoint</span>
                    </Button>

                    {!isTeachMode && (
                      <>
                        <div className="h-6 w-px bg-gray-200 hidden min-[1200px]:block mx-0.5" />
                        
                        {/* Focus Lesson Toggle */}
                        <Button
                          variant={isFocusMode ? "primary" : "outline"}
                          size="sm"
                          onClick={() => {
                            const next = !isFocusMode;
                            setIsFocusMode(next);
                            if (next) {
                              setIsNavCollapsed(true);
                              setIsAssistantCollapsed(true);
                            } else {
                              setIsNavCollapsed(false);
                              setIsAssistantCollapsed(false);
                            }
                          }}
                          className={cn(
                            "h-8 sm:h-9 px-2.5 sm:px-3.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all",
                            isFocusMode 
                              ? "bg-indigo-600 text-white shadow-sm border-indigo-600" 
                              : "border-gray-200 text-gray-700 hover:bg-gray-50"
                          )}
                          title={isFocusMode ? "Exit Focus Mode (Restore sidebars)" : "Focus Mode (Maximize lesson reading area)"}
                        >
                          {isFocusMode ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                          <span className="hidden md:inline">{isFocusMode ? "Exit Focus" : "Focus"}</span>
                        </Button>

                        {/* Drawer Buttons for Smaller Screens */}
                        <div className="flex items-center gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsMobileNavOpen(true)}
                            className="h-8 sm:h-9 px-2 sm:px-3 rounded-xl border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 flex min-[1200px]:hidden items-center gap-1.5"
                            title="Open Section Navigation"
                          >
                            <PanelLeft className="w-4 h-4 text-indigo-600" />
                            <span className="hidden sm:inline">Sections</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsMobileAssistantOpen(true)}
                            className="h-8 sm:h-9 px-2 sm:px-3 rounded-xl border-indigo-200 text-xs font-bold text-indigo-700 bg-indigo-50/50 hover:bg-indigo-100 flex min-[1440px]:hidden items-center gap-1.5"
                            title="Open Assistant"
                          >
                            <Settings2 className="w-4 h-4 text-indigo-600" />
                            <span className="hidden sm:inline">Assistant</span>
                          </Button>
                        </div>

                        {/* Desktop Navigation Sidebar Toggle (>= 1200px) */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setIsNavCollapsed(!isNavCollapsed)}
                          className={cn(
                            "h-9 px-2.5 rounded-xl text-xs font-bold text-gray-600 hover:text-indigo-600 hover:bg-indigo-50/50 hidden min-[1200px]:flex items-center gap-1.5 border border-gray-200/80 transition-all",
                            isNavCollapsed && "bg-indigo-50 text-indigo-600 border-indigo-200"
                          )}
                          title={isNavCollapsed ? "Show Navigation Sidebar" : "Collapse Navigation Sidebar"}
                        >
                          {isNavCollapsed ? <PanelLeft className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
                          <span className="text-[11px]">{isNavCollapsed ? "Show Nav" : "Nav"}</span>
                        </Button>

                        {/* Desktop Assistant Panel Toggle (>= 1440px) */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setIsAssistantCollapsed(!isAssistantCollapsed)}
                          className={cn(
                            "h-9 px-2.5 rounded-xl text-xs font-bold text-gray-600 hover:text-indigo-600 hover:bg-indigo-50/50 hidden min-[1440px]:flex items-center gap-1.5 border border-gray-200/80 transition-all",
                            isAssistantCollapsed && "bg-indigo-50 text-indigo-600 border-indigo-200"
                          )}
                          title={isAssistantCollapsed ? "Show Assistant Panel" : "Collapse Assistant Panel"}
                        >
                          {isAssistantCollapsed ? <PanelRight className="w-4 h-4" /> : <PanelRightClose className="w-4 h-4" />}
                          <span className="text-[11px]">{isAssistantCollapsed ? "Assistant" : "Hide Asst"}</span>
                        </Button>
                      </>
                    )}
                  </div>

                  {/* Right Controls: Actions & Exports */}
                  <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                    <div className="hidden sm:flex items-center gap-1.5">
                      <Button variant="outline" className="h-9 px-3 rounded-xl border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 transition-all" onClick={handlePrint}>
                        <Printer className="w-3.5 h-3.5 mr-1.5 text-gray-500" /> Print
                      </Button>
                      <Button variant="outline" className="h-9 px-3 rounded-xl border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 transition-all" onClick={handleExportPDF}>
                        <FileDown className="w-3.5 h-3.5 mr-1.5 text-gray-500" /> PDF
                      </Button>
                      <Button variant="outline" className="h-9 px-3 rounded-xl border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 transition-all" onClick={handleExportWord}>
                        <FileEdit className="w-3.5 h-3.5 mr-1.5 text-indigo-600" /> Word (.docx)
                      </Button>
                    </div>
                    <div className="h-6 w-px bg-gray-200 mx-1 hidden sm:block" />
                    <DropdownMenu
                      trigger={
                        <Button variant="outline" className="h-9 w-9 p-0 rounded-xl border-gray-200 hover:bg-gray-50 transition-all">
                          <MoreHorizontal className="w-4 h-4 text-gray-500" />
                        </Button>
                      }
                      items={[
                        { label: 'Export to Word (.docx)', onClick: handleExportWord, icon: <FileEdit className="w-4 h-4 text-indigo-600" /> },
                        { label: 'Print Lesson', onClick: handlePrint, icon: <Printer className="w-4 h-4" /> },
                        { label: 'Save as PDF', onClick: handleExportPDF, icon: <FileDown className="w-4 h-4" /> },
                        { label: 'Duplicate Lesson', onClick: () => onDuplicate?.(plan), icon: <Copy className="w-4 h-4" /> },
                        { label: 'Generate Full Pack', onClick: handleGenerateFullPack, icon: <Sparkles className="w-4 h-4 text-indigo-600" /> },
                        { label: 'AI Video Lesson', onClick: () => setActiveTab('ai-video'), icon: <Video className="w-4 h-4 text-indigo-600" /> },
                      ]}
                    />
                  </div>
                </div>
              </div>

              {/* 2. OUTER WORKSPACE CONTAINER */}
              <div className="w-full px-3 sm:px-5 lg:px-6 py-6 transition-all min-w-0">
                {currentMode === 'teach' ? (
                  <LiveTeachModeView 
                    plan={enrichedPlan} 
                    onExitTeachMode={() => {
                      setCurrentMode('planner');
                      setIsTeachMode(false);
                    }} 
                    onOpenTeachMeTopic={() => setShowTeachMeTopicModal(true)} 
                  />
                ) : currentMode === 'prep' ? (
                  <TeacherPrepModeView 
                    plan={enrichedPlan} 
                    onOpenTeachMeTopic={() => setShowTeachMeTopicModal(true)} 
                    onSwitchToTeachMode={() => {
                      setCurrentMode('teach');
                      setIsTeachMode(true);
                    }} 
                  />
                ) : (
                  <div 
                    className={cn(
                      "w-full min-w-0 transition-all",
                      isTeachMode
                        ? "block max-w-none"
                        : isFocusMode
                          ? "block max-w-5xl mx-auto"
                          : "lesson-workspace-grid"
                    )}
                    style={{
                      '--nav-width': isNavCollapsed ? '60px' : '250px',
                      '--asst-width': isAssistantCollapsed ? '52px' : '300px',
                    } as React.CSSProperties}
                  >
                  
                  {/* 4. LEFT SIDEBAR — NAVIGATION */}
                  {!isTeachMode && !isFocusMode && (
                    isNavCollapsed ? (
                      <div className="hidden min-[1200px]:flex flex-col items-center py-4 px-1.5 bg-white border border-gray-200 rounded-2xl sticky top-24 shrink-0 shadow-sm print:hidden">
                        <button
                          onClick={() => setIsNavCollapsed(false)}
                          className="h-10 w-10 p-0 rounded-xl text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 flex items-center justify-center transition-colors"
                          title="Expand Navigation Sidebar"
                        >
                          <PanelLeft className="w-5 h-5" />
                        </button>
                        <div className="w-6 h-px bg-gray-200 my-3" />
                        <div className="flex flex-col gap-2">
                          {navItems.map(item => (
                            <button
                              key={item.id}
                              onClick={() => scrollToSection(item.id)}
                              className={cn(
                                "h-10 w-10 rounded-xl flex items-center justify-center transition-all",
                                activeSection === item.id 
                                  ? "bg-indigo-50 text-indigo-600 shadow-sm" 
                                  : "text-gray-400 hover:text-gray-700 hover:bg-gray-50"
                              )}
                              title={item.label}
                            >
                              <item.icon className="w-4 h-4" />
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <aside className="hidden min-[1200px]:block w-[250px] shrink-0 sticky top-24 print:hidden">
                        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                          <div className="flex items-center justify-between mb-3 px-1">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Navigation</p>
                            <button
                              onClick={() => setIsNavCollapsed(true)}
                              className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"
                              title="Collapse Navigation Sidebar"
                            >
                              <PanelLeftClose className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="space-y-1">
                            {navItems.map(item => (
                              <button 
                                key={item.id}
                                onClick={() => scrollToSection(item.id)}
                                className={cn(
                                  "h-9 w-full rounded-xl px-2.5 flex items-center justify-between text-xs font-bold transition-all duration-200 group",
                                  activeSection === item.id 
                                    ? "bg-indigo-50 text-indigo-600 shadow-sm shadow-indigo-100/50" 
                                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                                )}
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <item.icon className={cn(
                                    "w-4 h-4 shrink-0 transition-colors",
                                    activeSection === item.id ? "text-indigo-600" : "text-gray-400 group-hover:text-indigo-500"
                                  )} />
                                  <span className="truncate">{item.label}</span>
                                </div>
                                {activeSection === item.id && (
                                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 shrink-0 shadow-[0_0_6px_rgba(79,70,229,0.8)]" />
                                )}
                              </button>
                            ))}
                          </div>

                          <div className="mt-5 pt-4 border-t border-gray-100">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 px-1">Quick Stats</p>
                            <div className="space-y-2 px-1 text-xs">
                              <div className="flex justify-between items-center">
                                <span className="text-gray-500">Duration</span>
                                <span className="font-bold text-gray-900">{plan.duration}m</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-gray-500">Grade</span>
                                <span className="font-bold text-gray-900">{plan.grade}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-gray-500">Phases</span>
                                <span className="font-bold text-indigo-600">5 Stages</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </aside>
                    )
                  )}

                  {/* 5. CENTER MAIN LESSON CONTENT AREA */}
                  <div className="w-full min-w-0 max-w-none">
                    <main className={cn(
                      "space-y-8 w-full min-w-0",
                      isTeachMode && "p-4 sm:p-8"
                    )}>

                      {/* UNIVERSAL 12-SECTION PROFESSIONAL LESSON PLAN DOCUMENT */}
                      <UniversalLessonPlanDocument 
                        plan={enrichedPlan}
                        schoolName="SAN JUAN BOSCO R.C. SCHOOL"
                        teacherName={auth.currentUser?.displayName || (auth.currentUser?.email?.startsWith('haspal') ? 'Hassan' : undefined) || plan.studentTeacherName || 'Hassan'}
                        isTeachMode={isTeachMode}
                        status={plan.status || ((plan as any).isSaved ? 'saved' : 'draft')}
                        onOpenTeachMeTopic={() => setShowTeachMeTopicModal(true)}
                        onNavigateToSection={scrollToSection}
                        onGenerateResource={onGenerateResource}
                        isGenerating={isGenerating}
                      />

                    </main>
                  </div>

                  {/* 6. RIGHT SIDEBAR — ASSISTANT PANEL */}
                  {!isTeachMode && !isFocusMode && (
                    isAssistantCollapsed ? (
                      <div className="hidden min-[1440px]:flex flex-col items-center py-4 px-1.5 bg-white border border-gray-200 rounded-2xl sticky top-24 shrink-0 shadow-sm print:hidden">
                        <button
                          onClick={() => setIsAssistantCollapsed(false)}
                          className="h-10 w-10 p-0 rounded-xl text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 flex items-center justify-center transition-colors"
                          title="Expand Assistant Panel"
                        >
                          <PanelRight className="w-5 h-5" />
                        </button>
                      </div>
                    ) : (
                      <aside className="hidden min-[1440px]:block w-[300px] shrink-0 sticky top-24 print:hidden">
                        <div className="space-y-4">
                          <Card className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 flex items-center gap-1.5">
                                <Settings2 className="w-4 h-4" /> Assistant Panel
                              </h4>
                              <button
                                onClick={() => setIsAssistantCollapsed(true)}
                                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"
                                title="Collapse Assistant Panel"
                              >
                                <PanelRightClose className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="space-y-1.5">
                              <Button 
                                variant="outline" 
                                className="w-full justify-start h-9 rounded-xl border-gray-100 text-gray-700 font-bold text-xs hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-100 transition-all group"
                                onClick={() => setActiveTab('resources')}
                              >
                                <FileText className="w-4 h-4 mr-2.5 text-gray-400 group-hover:text-indigo-500 shrink-0" /> 
                                Teaching Resources
                              </Button>
                              <Button 
                                variant="outline" 
                                className="w-full justify-start h-9 rounded-xl border-gray-100 text-gray-700 font-bold text-xs hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-100 transition-all group"
                                onClick={() => setActiveTab('board-plan')}
                              >
                                <Presentation className="w-4 h-4 mr-2.5 text-gray-400 group-hover:text-indigo-500 shrink-0" /> 
                                Board Plan
                              </Button>
                              <Button 
                                variant="outline" 
                                className="w-full justify-start h-9 rounded-xl border-gray-100 text-gray-700 font-bold text-xs hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-100 transition-all group"
                                onClick={() => setActiveTab('ai-video')}
                              >
                                <Video className="w-4 h-4 mr-2.5 text-gray-400 group-hover:text-indigo-500 shrink-0" /> 
                                AI Video Lesson
                              </Button>
                            </div>
                          </Card>

                          <Card className="rounded-2xl border border-indigo-100 bg-white p-4 shadow-sm">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 mb-2.5">Teaching Actions</h4>
                            <div className="space-y-2">
                              <Button 
                                variant="primary" 
                                size="sm" 
                                className="w-full justify-start h-9 rounded-xl font-bold shadow-sm text-xs" 
                                onClick={onGenerateReteach}
                              >
                                <RefreshCw className="w-4 h-4 mr-2 shrink-0" /> Generate Reteach
                              </Button>
                              <Button 
                                variant="secondary" 
                                size="sm" 
                                className="w-full justify-start h-9 rounded-xl font-bold text-xs" 
                                onClick={onGenerateIntervention}
                              >
                                <Zap className="w-4 h-4 mr-2 shrink-0" /> Intervention Plan
                              </Button>
                            </div>
                          </Card>
                        </div>
                      </aside>
                    )
                  )}

                </div>
              )}
              </div>
            </TabsContent>

            <TabsContent value="resources" className="mt-0 space-y-8 print:hidden">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                  {/* Teacher Materials */}
                  <section className="space-y-4">
                    <h3 className="text-xl font-bold flex items-center gap-2 text-indigo-600">
                      <User className="w-6 h-6" />
                      Teacher Materials
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {plan.teachingResources?.teacherMaterials.notes && renderResourceCard("Teacher Notes", plan.teachingResources.teacherMaterials.notes, "Teacher Notes", "teacher-notes")}
                      {plan.teachingResources?.teacherMaterials.script && renderResourceCard("Teaching Script", plan.teachingResources.teacherMaterials.script, "Teaching Script", "teaching-script")}
                      {plan.teachingResources?.teacherMaterials.boardWork && renderResourceCard("Board Work", plan.teachingResources.teacherMaterials.boardWork, "Board Work", "board-work")}
                    </div>
                  </section>

                  {/* Student Materials */}
                  <section className="space-y-4">
                    <h3 className="text-xl font-bold flex items-center gap-2 text-emerald-600">
                      <GraduationCap className="w-6 h-6" />
                      Student Materials
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {plan.teachingResources?.studentMaterials.notebookNotes && renderResourceCard("Notebook Notes", plan.teachingResources.studentMaterials.notebookNotes, "Notebook Notes", "notebook-notes")}
                      {plan.teachingResources?.studentMaterials.homework && renderResourceCard("Homework", plan.teachingResources.studentMaterials.homework, "Homework", "homework-res")}
                    </div>
                  </section>
                </div>

                <div className="space-y-8">
                  {/* Before Class Checklist */}
                  <Card className="p-6 bg-amber-50/30 border-amber-100">
                    <h3 className="text-lg font-bold flex items-center gap-2 text-amber-700 mb-4">
                      <ClipboardList className="w-5 h-5" />
                      Before Class Checklist
                    </h3>
                    <div className="space-y-3">
                      {plan.beforeClassChecklist?.map((item, i) => (
                        <button
                          key={i}
                          onClick={() => toggleChecklist(i)}
                          className="flex items-start gap-3 w-full text-left group"
                        >
                          {item.completed ? (
                            <CheckSquare className="w-5 h-5 text-amber-600" />
                          ) : (
                            <Square className="w-5 h-5 text-amber-300 group-hover:text-amber-400" />
                          )}
                          <span className={cn(
                            "text-sm font-medium transition-colors",
                            item.completed ? "text-amber-900/50 line-through" : "text-amber-900"
                          )}>
                            {item.task}
                          </span>
                        </button>
                      ))}
                      {!plan.beforeClassChecklist && (
                        <p className="text-sm text-amber-600 italic">No checklist generated yet.</p>
                      )}
                    </div>
                  </Card>

                  {/* Materials Needed */}
                  <Card className="p-6 bg-indigo-50/30 border-indigo-100">
                    <h3 className="text-lg font-bold flex items-center gap-2 text-indigo-700 mb-4">
                      <Package className="w-5 h-5" />
                      Materials Needed
                    </h3>
                    <ul className="space-y-2">
                      {plan.materialsNeeded?.map((item, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-indigo-900 font-medium">
                          <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full" />
                          {item}
                        </li>
                      ))}
                      {!plan.materialsNeeded && (
                        <p className="text-sm text-indigo-600 italic">No materials list generated yet.</p>
                      )}
                    </ul>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="worksheets" className="mt-0 space-y-6">
              <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Student Practice & Worksheets</h3>
                  <p className="text-xs text-gray-500 font-medium">Ready-to-print activity sheets, guided practice, and problem sets</p>
                </div>
                <Button size="sm" onClick={() => onGenerateResource?.(plan, 'Worksheet')} disabled={isGenerating} className="rounded-xl">
                  <Plus className="w-4 h-4 mr-1.5" />
                  Add Worksheet
                </Button>
              </div>

              {(() => {
                const wsItems = activeStudentMaterials.filter(m => m.type === 'worksheet' || m.type.includes('worksheet') || m.type === 'problem_set' || m.type === 'reading_passage');
                if (wsItems.length === 0) {
                  return (
                    <div className="col-span-full py-12 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                      <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 font-medium">No worksheets generated for this lesson yet.</p>
                      <Button variant="ghost" className="mt-4 font-bold text-indigo-600" onClick={() => onGenerateResource?.(plan, 'Worksheet')}>
                        Generate Student Worksheet Now
                      </Button>
                    </div>
                  );
                }

                return (
                  <div className="space-y-8">
                    {wsItems.map((ws, i) => (
                      <WorksheetDisplayView
                        key={i}
                        content={ws.content}
                        answerKey={ws.answerKey}
                        title={ws.title}
                        grade={plan.grade}
                        subject={plan.subject}
                        topic={plan.topic}
                        subtopic={plan.subtopic}
                      />
                    ))}
                  </div>
                );
              })()}
            </TabsContent>

            <TabsContent value="assessments" className="mt-0 space-y-6">
              <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Assessments & Exit Tickets</h3>
                  <p className="text-xs text-gray-500 font-medium">Formative checks, daily exit tickets, and mastery indicators</p>
                </div>
                <Button size="sm" onClick={() => onGenerateResource?.(plan, 'Exit Ticket')} disabled={isGenerating} className="rounded-xl">
                  <Plus className="w-4 h-4 mr-1.5" />
                  Add Exit Ticket
                </Button>
              </div>

              {/* Assessment Board */}
              {enrichedPlan.finalAssessmentBoard && (
                <Card className="p-6 border-indigo-100 bg-indigo-50/30 rounded-2xl space-y-4">
                  <div className="flex items-center gap-2 text-indigo-700 font-bold">
                    <Target className="w-5 h-5" />
                    <span>Final Assessment Design & Criteria</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-white rounded-xl border border-indigo-100">
                      <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">Assessment Tool & Type</span>
                      <p className="font-bold text-gray-900 mt-1">{enrichedPlan.finalAssessmentBoard.assessmentTool || (enrichedPlan.finalAssessmentBoard as any).assessmentType || 'Formative Check'}</p>
                      {enrichedPlan.finalAssessmentBoard.studentTask && (
                        <p className="text-xs text-gray-600 mt-2"><span className="font-semibold">Student Task:</span> {enrichedPlan.finalAssessmentBoard.studentTask}</p>
                      )}
                    </div>
                    <div className="p-4 bg-white rounded-xl border border-indigo-100">
                      <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">Mastery Indicator & Criteria</span>
                      <p className="font-bold text-emerald-800 mt-1">{enrichedPlan.finalAssessmentBoard.masteryIndicator || '80% Mastery'}</p>
                      {enrichedPlan.finalAssessmentBoard.criteriaForSuccess && (
                        <p className="text-xs text-gray-600 mt-2"><span className="font-semibold">Success Criteria:</span> {enrichedPlan.finalAssessmentBoard.criteriaForSuccess}</p>
                      )}
                    </div>
                  </div>
                </Card>
              )}

              {(() => {
                const assItems = activeStudentMaterials.filter(m => m.type === 'exit_ticket' || m.type === 'quiz' || m.type.includes('assessment'));
                return (
                  <div className="space-y-6">
                    {assItems.map((ass, i) => (
                      <div key={i} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs space-y-4">
                        <div className="flex items-center justify-between flex-wrap gap-4 border-b border-gray-100 pb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
                              <CheckSquare className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 text-[10px] font-black uppercase tracking-wider">{ass.badge}</span>
                                {ass.answerKey && <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold">Answer Key Available</span>}
                              </div>
                              <h4 className="font-bold text-gray-900 text-lg">{ass.title}</h4>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleCopyMaterialContent(ass.content, i + 200)}>
                              {copiedMaterialIndex === i + 200 ? <CheckCircle2 className="w-4 h-4 mr-1 text-emerald-600" /> : <Copy className="w-4 h-4 mr-1" />}
                              Copy
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handlePrintMaterialContent(ass.title, ass.content, ass.answerKey)}>
                              <Printer className="w-4 h-4 mr-1" />
                              Print
                            </Button>
                          </div>
                        </div>

                        <div className="p-5 bg-gray-50/70 rounded-xl border border-gray-100 prose max-w-none text-sm text-gray-800">
                          <Markdown>{ass.content}</Markdown>
                        </div>

                        {ass.answerKey && (
                          <div className="pt-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => setShowAnswerKeyMap(prev => ({ ...prev, [i + 200]: !prev[i + 200] }))}
                              className="text-emerald-700 font-bold hover:bg-emerald-50"
                            >
                              {showAnswerKeyMap[i + 200] ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                              {showAnswerKeyMap[i + 200] ? 'Hide Answer Key' : 'Reveal Answer Key & Scoring Guide'}
                            </Button>
                            {showAnswerKeyMap[i + 200] && (
                              <div className="mt-2 p-4 bg-emerald-50/50 rounded-xl border border-emerald-200 prose max-w-none text-sm text-emerald-900">
                                <div className="font-bold text-xs uppercase text-emerald-800 mb-1">Answer Key & Scoring Guide:</div>
                                <Markdown>{ass.answerKey}</Markdown>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {plan.teachingResources?.assessmentMaterials.formativeAssessment && renderResourceCard("Formative Assessment", plan.teachingResources.assessmentMaterials.formativeAssessment, "Assessment", "assessment-formative")}
                      {plan.teachingResources?.assessmentMaterials.rubric && renderResourceCard("Grading Rubric", plan.teachingResources.assessmentMaterials.rubric, "Rubric", "assessment-rubric")}
                      {plan.teachingResources?.assessmentMaterials.answerKey && renderResourceCard("Answer Key", plan.teachingResources.assessmentMaterials.answerKey, "Answer Key", "assessment-answer-key")}
                    </div>
                  </div>
                );
              })()}
            </TabsContent>

            <TabsContent value="visuals" className="mt-0 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {plan.teachingResources?.visualMaterials.boardLayout && renderResourceCard("Board Layout", plan.teachingResources.visualMaterials.boardLayout, "Board Layout", "visual-board")}
                {plan.teachingResources?.visualMaterials.anchorChart && renderResourceCard("Anchor Chart", plan.teachingResources.visualMaterials.anchorChart, "Anchor Chart", "visual-anchor")}
                {plan.teachingResources?.visualMaterials.slideDeck && renderResourceCard("Slide Deck Content", plan.teachingResources.visualMaterials.slideDeck, "PowerPoint", "visual-slide")}
              </div>
            </TabsContent>

            <TabsContent value="notes" className="mt-0 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {plan.teachingResources?.teacherMaterials.notes && renderResourceCard("Detailed Teacher Notes", plan.teachingResources.teacherMaterials.notes, "Teacher Notes", "notes-teacher")}
                {plan.teachingResources?.teacherMaterials.script && renderResourceCard("Teaching Script", plan.teachingResources.teacherMaterials.script, "Teaching Script", "notes-script")}
              </div>
            </TabsContent>

            <TabsContent value="homework" className="mt-0 space-y-6">
              <div className="max-w-3xl mx-auto">
                {plan.teachingResources?.studentMaterials.homework ? (
                  renderResourceCard("Homework Assignment", plan.teachingResources.studentMaterials.homework, "Homework", "homework-assignment")
                ) : (
                  <div className="py-12 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                    <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">No homework generated yet.</p>
                    <Button variant="ghost" className="mt-4" onClick={() => onGenerateResource?.(plan, 'Homework')}>
                      Generate Homework
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="video" className="mt-0 space-y-8">
              {plan.lessonVideo ? (
                <div className="space-y-8">
                  {/* Video Status & Controls */}
                  <Card className="p-6 border-indigo-100 bg-white shadow-sm">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                      <div className="space-y-1">
                        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                          <Video className="w-6 h-6 text-indigo-600" />
                          {plan.lessonVideo.title}
                        </h3>
                        <div className="flex items-center gap-3">
                          <span className={cn(
                            "px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest",
                            plan.lessonVideo.videoStatus === 'completed' ? "bg-emerald-100 text-emerald-700" :
                            plan.lessonVideo.videoStatus === 'failed' ? "bg-rose-100 text-rose-700" :
                            "bg-amber-100 text-amber-700"
                          )}>
                            Status: {(plan.lessonVideo.videoStatus || 'draft').replace('_', ' ')}
                          </span>
                          <span className="text-xs text-gray-500">{plan.lessonVideo.mode} • {plan.lessonVideo.length}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-3">
                        {plan.lessonVideo.videoStatus === 'completed' && plan.lessonVideo.finalVideoUrl ? (
                          <>
                            <Button 
                              onClick={() => setShowVideoPlayer(true)}
                              className="bg-indigo-600 hover:bg-indigo-700 text-white"
                            >
                              <Play className="w-4 h-4 mr-2" />
                              Play Video
                            </Button>
                            <Button 
                              variant="outline"
                              onClick={() => window.open(plan.lessonVideo?.finalVideoUrl, '_blank')}
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Download MP4
                            </Button>
                          </>
                        ) : plan.lessonVideo.videoStatus === 'visuals_ready' || plan.lessonVideo.videoStatus === 'failed' ? (
                          <Button 
                            onClick={() => onRenderVideo?.(plan)}
                            disabled={isGenerating}
                            className="bg-rose-600 hover:bg-rose-700 text-white"
                          >
                            {isGenerating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Zap className="w-4 h-4 mr-2" />}
                            {plan.lessonVideo.videoStatus === 'failed' ? 'Retry Render' : 'Render Final MP4'}
                          </Button>
                        ) : plan.lessonVideo.videoStatus === 'rendering' ? (
                          <div className="flex items-center gap-3 px-4 py-2 bg-indigo-50 rounded-lg text-indigo-700 font-medium">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Rendering Video...
                          </div>
                        ) : null}
                        
                        <Button 
                          variant="ghost" 
                          onClick={() => {
                            if (plan.lessonVideo) {
                              onGenerateVideo?.(
                                plan,
                                plan.lessonVideo.mode,
                                plan.lessonVideo.length,
                                plan.lessonVideo.voiceSettings,
                                plan.lessonVideo.avatarSettings
                              );
                            }
                          }}
                          disabled={isGenerating}
                        >
                          Regenerate Video
                        </Button>
                      </div>
                    </div>

                    {/* Progress Stages */}
                    <div className="mt-8 grid grid-cols-2 md:grid-cols-5 gap-4">
                      {Object.entries(plan.lessonVideo.stages || {}).map(([stage, status]) => (
                        <div key={stage} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stage}</span>
                            {status === 'Completed' ? <CheckCircle2 className="w-3 h-3 text-emerald-500" /> : 
                             status === 'Generating' ? <Loader2 className="w-3 h-3 text-indigo-500 animate-spin" /> :
                             status === 'Error' ? <AlertCircle className="w-3 h-3 text-rose-500" /> :
                             <div className="w-3 h-3 rounded-full border border-gray-200" />}
                          </div>
                          <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                            <div className={cn(
                              "h-full transition-all duration-500",
                              status === 'Completed' ? "w-full bg-emerald-500" :
                              status === 'Generating' ? "w-1/2 bg-indigo-500 animate-pulse" :
                              status === 'Error' ? "w-full bg-rose-500" :
                              "w-0"
                            )} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>

                  {/* Video Details */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                      <section className="space-y-4">
                        <h3 className="text-xl font-bold text-gray-900">Scene Breakdown</h3>
                        <div className="space-y-4">
                          {plan.lessonVideo.scenes?.map((scene, i) => (
                            <Card key={i} className="p-6 flex gap-6">
                              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center font-black text-lg flex-shrink-0">
                                {i + 1}
                              </div>
                              <div className="flex-1 space-y-4">
                                <div className="flex justify-between items-start">
                                  <h4 className="font-bold text-gray-900 text-lg">{scene.title}</h4>
                                  <span className="text-xs font-mono text-gray-400">{scene.duration}s</span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="bg-gray-50 p-4 rounded-xl">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Narration</p>
                                    <p className="text-sm text-gray-600 italic">"{scene.narration}"</p>
                                  </div>
                                  <div className="relative aspect-video bg-gray-100 rounded-xl overflow-hidden border border-gray-200">
                                    {scene.visualUrl ? (
                                      <img src={scene.visualUrl} alt={scene.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center">
                                        <ImageIcon className="w-8 h-8 text-gray-300" />
                                      </div>
                                    )}
                                    <div className="absolute top-2 left-2 px-2 py-1 bg-black/50 text-white text-[10px] font-bold rounded backdrop-blur-sm">
                                      Visual Prompt: {scene.visualDescription}
                                    </div>
                                  </div>
                                </div>
                                {scene.onScreenText && scene.onScreenText.length > 0 && (
                                  <div className="flex flex-wrap gap-2 pt-2">
                                    {scene.onScreenText.map((text, j) => (
                                      <span key={j} className="px-2 py-1 bg-amber-50 text-amber-700 rounded-lg text-[10px] font-bold border border-amber-100">
                                        ON SCREEN: {text}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </Card>
                          ))}
                        </div>
                      </section>
                    </div>

                    <div className="space-y-8">
                      <Card className="p-6 space-y-6">
                        <h4 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                          <Settings className="w-5 h-5 text-indigo-600" />
                          Voice & Avatar
                        </h4>
                        <div className="space-y-4">
                          <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-50">
                            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">Voice Profile</p>
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                                <Mic className="w-5 h-5 text-indigo-600" />
                              </div>
                              <div>
                                <p className="font-bold text-indigo-900">{plan.lessonVideo.voiceSettings.gender} Voice</p>
                                <p className="text-xs text-indigo-600">{plan.lessonVideo.voiceSettings.tone} Tone • {plan.lessonVideo.voiceSettings.pace} Pace</p>
                              </div>
                            </div>
                          </div>
                          {plan.lessonVideo.avatarSettings.enabled && (
                            <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-50">
                              <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-2">AI Avatar</p>
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                                  <Users className="w-5 h-5 text-emerald-600" />
                                </div>
                                <div>
                                  <p className="font-bold text-emerald-900">{plan.lessonVideo.avatarSettings.style}</p>
                                  <p className="text-xs text-emerald-600">{plan.lessonVideo.avatarSettings.placement}</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </Card>

                      <Card className="p-6 space-y-4">
                        <h4 className="text-lg font-bold text-gray-900">Resource Pack</h4>
                        <div className="space-y-2">
                          <Button variant="ghost" className="w-full justify-start text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50">
                            <FileText className="w-4 h-4 mr-2" />
                            Download Full Script
                          </Button>
                          <Button variant="ghost" className="w-full justify-start text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50">
                            <ImageIcon className="w-4 h-4 mr-2" />
                            Printable Visuals
                          </Button>
                          <Button variant="ghost" className="w-full justify-start text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50">
                            <FileText className="w-4 h-4 mr-2" />
                            Lesson Worksheet
                          </Button>
                        </div>
                      </Card>
                    </div>
                  </div>
                </div>
              ) : plan.videoAssistant ? (
                <div className="space-y-8">
                  <div className="py-12 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                    <Presentation className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Generate Teaching Video</h3>
                    <p className="text-gray-500 max-w-md mx-auto mb-6">
                      Transform your lesson plan into a professional AI-powered teaching video with narration, visuals, and optional avatar.
                    </p>
                    <Button 
                      onClick={() => onGenerateResource?.(plan, 'Video Assistant')}
                      disabled={isGenerating}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                      {isGenerating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                      Generate Video Script & Assets
                    </Button>
                  </div>
                  
                  <section className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100">
                    <h3 className="text-xl font-bold text-indigo-900 mb-4 flex items-center gap-2">
                      <Presentation className="w-6 h-6" />
                      Video Overview
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <p className="text-sm font-black text-indigo-400 uppercase tracking-widest mb-1">Topic</p>
                        <p className="font-bold text-indigo-900">{plan.videoAssistant.suggestedVideo.topic}</p>
                      </div>
                      <div>
                        <p className="text-sm font-black text-indigo-400 uppercase tracking-widest mb-1">Purpose</p>
                        <p className="text-indigo-800">{plan.videoAssistant.suggestedVideo.purpose}</p>
                      </div>
                    </div>
                  </section>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <Card className="p-6 space-y-6">
                      <h4 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-indigo-600" />
                        Teacher Guidance
                      </h4>
                      <div className="space-y-4">
                        <div>
                          <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Pre-Video Instructions</p>
                          <p className="text-sm text-gray-700">{plan.videoAssistant.teacherGuidance.beforeVideo}</p>
                        </div>
                        <div>
                          <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Pause Points & Discussion</p>
                          <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                            {plan.videoAssistant.teacherGuidance.pausePoints?.map((p, i) => <li key={i}>{p.timestamp}: {p.question}</li>)}
                          </ul>
                        </div>
                      </div>
                    </Card>

                    <Card className="p-6 space-y-6 bg-rose-50 border-rose-100">
                      <h4 className="text-lg font-bold text-rose-900 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5" />
                        "If No Internet" Backup Plan
                      </h4>
                      <div className="space-y-4">
                        <p className="text-sm text-rose-800">{plan.videoAssistant.noInternetBackup.simplifiedExplanation}</p>
                        <div>
                          <p className="text-xs font-black text-rose-400 uppercase tracking-widest mb-2">Board Drawing Version</p>
                          <p className="text-sm text-rose-700">{plan.videoAssistant.noInternetBackup.boardDrawing}</p>
                        </div>
                      </div>
                    </Card>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                  <Presentation className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium">No video assistant generated for this lesson.</p>
                  <Button variant="ghost" className="mt-4" onClick={() => onGenerateResource?.(plan, 'Video Assistant')}>
                    Generate Video Assistant
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="visual-aids" className="mt-0 space-y-8">
              {plan.inDepthVisuals ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {plan.inDepthVisuals.visuals?.map((visual, i) => (
                    <Card key={i} className="overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-all group">
                      <div className="aspect-video relative bg-gray-100 overflow-hidden">
                        <img 
                          src={`https://picsum.photos/seed/${visual.title.replace(/\s+/g, '-').toLowerCase()}/800/450`} 
                          alt={visual.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                          <div>
                            <span className="px-2 py-0.5 bg-indigo-500 text-white rounded text-[10px] font-black uppercase tracking-widest mb-2 inline-block">{visual.type}</span>
                            <h4 className="text-xl font-bold text-white">{visual.title}</h4>
                          </div>
                        </div>
                      </div>
                      <div className="p-6 space-y-4">
                        <div className="prose prose-sm max-w-none text-gray-600">
                          <Markdown>{visual.content}</Markdown>
                        </div>
                        <div className="pt-4 border-t border-gray-100">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Student Friendly Wording</p>
                          <p className="text-sm text-gray-700 font-medium leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-100 italic">
                            "{visual.studentFriendlyWording}"
                          </p>
                        </div>
                        <div className="flex gap-2 pt-2">
                          <Button variant="outline" size="sm" className="flex-1 h-9 rounded-xl font-bold text-xs">
                            <Maximize2 className="w-4 h-4 mr-2" /> Fullscreen
                          </Button>
                          <Button variant="outline" size="sm" className="flex-1 h-9 rounded-xl font-bold text-xs">
                            <Printer className="w-4 h-4 mr-2" /> Print Aid
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                  <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium">No in-depth visual aids generated for this lesson.</p>
                  <Button variant="ghost" className="mt-4" onClick={() => onGenerateResource?.(plan, 'Visual Aids')}>
                    Generate Visual Aids
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="board-plan" className="mt-0 space-y-8">
              {plan.boardVisualPlan ? (
                <Card className="p-8 bg-slate-900 text-white border-none shadow-2xl overflow-hidden relative">
                  <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500" />
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="text-2xl font-black tracking-tight flex items-center gap-3">
                      <Presentation className="w-8 h-8 text-indigo-400" />
                      Chalkboard / Whiteboard Plan
                    </h3>
                    <Button variant="secondary" size="sm" className="bg-white/10 hover:bg-white/20 text-white border-white/20">
                      <Download className="w-4 h-4" />
                      Export Plan
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="md:col-span-3 space-y-8">
                      <div className="border-2 border-white/20 rounded-xl p-6 min-h-[400px] relative">
                        <div className="absolute -top-3 left-6 px-2 bg-slate-900 text-[10px] font-black uppercase tracking-widest text-white/40">Main Board Area</div>
                        <div className="space-y-6">
                          <div className="text-center border-b border-white/10 pb-4">
                            <h4 className="text-3xl font-black underline decoration-indigo-500 underline-offset-8">{plan.boardVisualPlan.title}</h4>
                          </div>
                          <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-4">
                              <h5 className="text-indigo-400 font-bold uppercase tracking-wider text-xs">Key Concepts</h5>
                              <ul className="list-disc list-inside space-y-2 text-lg">
                                {plan.boardVisualPlan.keyNotes?.map((note, i) => <li key={i}>{note}</li>)}
                              </ul>
                            </div>
                            <div className="space-y-4">
                              <h5 className="text-emerald-400 font-bold uppercase tracking-wider text-xs">Examples / Steps</h5>
                              <div className="bg-white/5 p-4 rounded-lg border border-white/10 font-mono text-sm">
                                <Markdown>{plan.boardVisualPlan.workedExamples.join('\n\n')}</Markdown>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                        <h5 className="text-amber-400 font-bold uppercase tracking-wider text-[10px] mb-3">Layout</h5>
                        <p className="text-sm text-white/70">{plan.boardVisualPlan.layout}</p>
                      </div>
                      <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                        <h5 className="text-rose-400 font-bold uppercase tracking-wider text-[10px] mb-3">Sections</h5>
                        <ol className="list-decimal list-inside space-y-2 text-xs text-white/70">
                          {plan.boardVisualPlan.sections?.map((section, i) => <li key={i}>{section.heading}: {section.content}</li>)}
                        </ol>
                      </div>
                    </div>
                  </div>
                </Card>
              ) : (
                <div className="py-12 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                  <Presentation className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium">No board visual plan generated for this lesson.</p>
                  <Button variant="ghost" className="mt-4" onClick={() => onGenerateResource?.(plan, 'Board Plan')}>
                    Generate Board Plan
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="materials-prep" className="mt-0 space-y-8">
              {plan.exactMaterials ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-8">
                    <section className="space-y-4">
                      <h3 className="text-xl font-bold flex items-center gap-2 text-gray-900">
                        <Package className="w-6 h-6 text-indigo-600" />
                        Materials List
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {plan.exactMaterials.items?.map((item, i) => (
                          <Card key={i} className="p-4 space-y-3">
                            <div className="flex justify-between items-start">
                              <h4 className="font-bold text-gray-900">{item.name}</h4>
                              <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded text-[10px] font-black uppercase tracking-widest">{item.quantity}</span>
                            </div>
                            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">{item.stage}</p>
                            <p className="text-sm text-gray-600">{item.prepInstructions}</p>
                            {item.substitute && (
                              <p className="text-xs text-emerald-600 italic">Sub: {item.substitute}</p>
                            )}
                          </Card>
                        ))}
                      </div>
                    </section>
                  </div>

                  <div className="space-y-8">
                    <Card className="p-6 bg-amber-50 border-amber-100">
                      <h3 className="text-lg font-bold flex items-center gap-2 text-amber-900 mb-4">
                        <Clock className="w-5 h-5" />
                        General Preparation
                      </h3>
                      <ul className="space-y-4">
                        {plan.exactMaterials.generalPrep?.map((prep, i) => (
                          <li key={i} className="flex gap-3">
                            <div className="flex-shrink-0 w-6 h-6 bg-amber-200 text-amber-900 rounded-full flex items-center justify-center text-xs font-bold">{i + 1}</div>
                            <p className="text-sm text-amber-900 font-medium">{prep}</p>
                          </li>
                        ))}
                      </ul>
                    </Card>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                  <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium">No exact materials list generated for this lesson.</p>
                  <Button variant="ghost" className="mt-4" onClick={() => onGenerateResource?.(plan, 'Materials')}>
                    Generate Materials List
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="demo" className="mt-0 space-y-8">
              {plan.demonstrationSupport ? (
                <div className="max-w-4xl mx-auto space-y-8">
                  <section className="bg-indigo-600 text-white p-8 rounded-2xl shadow-xl">
                    <h3 className="text-2xl font-black mb-4 flex items-center gap-3">
                      <Zap className="w-8 h-8" />
                      Lesson Demonstration / Practical
                    </h3>
                    <p className="text-indigo-100 text-lg">Modeling Tips: {plan.demonstrationSupport.modelingTips.join(', ')}</p>
                  </section>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {plan.demonstrationSupport.steps?.map((step, i) => (
                      <Card key={i} className="p-6 space-y-4">
                        <h4 className="font-bold text-gray-900 flex items-center gap-2">
                          <Eye className="w-5 h-5 text-indigo-600" />
                          Step {i + 1}: {step.action}
                        </h4>
                        <div className="space-y-2">
                          <p className="text-sm font-bold text-emerald-600">Observation: <span className="font-normal text-gray-700">{step.observation}</span></p>
                          <p className="text-sm font-bold text-amber-600">Question: <span className="font-normal text-gray-700">{step.question}</span></p>
                          <p className="text-sm font-bold text-indigo-600">Conclusion: <span className="font-normal text-gray-700">{step.conclusion}</span></p>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                  <Zap className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium">No demonstration support generated for this lesson.</p>
                  <Button variant="ghost" className="mt-4" onClick={() => onGenerateResource?.(plan, 'Demonstration')}>
                    Generate Demonstration Support
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="execution" className="mt-0 space-y-8">
              <div className="max-w-5xl mx-auto space-y-8">
                <div className="flex justify-between items-center bg-rose-600 text-white p-6 rounded-2xl shadow-lg">
                  <div>
                    <h3 className="text-2xl font-black tracking-tight flex items-center gap-2">
                      <Zap className="w-8 h-8" />
                      Teacher Execution Mode
                    </h3>
                    <p className="text-rose-100">Real-time teaching guide for {plan.lessonTitle}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-[10px] font-black uppercase tracking-widest text-rose-200">Duration</p>
                      <p className="font-bold">{plan.duration}</p>
                    </div>
                    <Button variant="secondary" className="bg-white/10 hover:bg-white/20 text-white border-white/20">
                      <Clock className="w-4 h-4" />
                      Start Timer
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-8">
                    {/* Active Teaching Script */}
                    <section className="space-y-4">
                      <h4 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-indigo-600" />
                        Live Teaching Script
                      </h4>
                      <Card className="p-6 bg-indigo-50/30 border-indigo-100 prose prose-indigo max-w-none">
                        <Markdown>{plan.teacherScript || "No script generated yet."}</Markdown>
                      </Card>
                    </section>

                    {/* Board Visual Reference */}
                    {plan.boardVisualPlan && (
                      <section className="space-y-4">
                        <h4 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                          <Presentation className="w-5 h-5 text-slate-700" />
                          Board Visual Reference
                        </h4>
                        <Card className="p-6 bg-slate-900 text-white border-none">
                          <div className="text-center border-b border-white/10 pb-4 mb-4">
                            <h5 className="text-xl font-bold underline decoration-indigo-500 underline-offset-4">{plan.boardVisualPlan.title}</h5>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">Key Notes</p>
                              <ul className="list-disc list-inside space-y-1">
                                {(plan.boardVisualPlan.keyNotes || []).map((n, i) => <li key={i}>{n}</li>)}
                              </ul>
                            </div>
                            <div>
                              <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-2">Examples</p>
                              <div className="bg-white/5 p-2 rounded border border-white/10 font-mono text-[10px]">
                                {plan.boardVisualPlan.workedExamples[0]}
                              </div>
                            </div>
                          </div>
                        </Card>
                      </section>
                    )}

                    {/* Video Guidance */}
                    {plan.videoAssistant && (
                      <section className="space-y-4">
                        <h4 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                          <Presentation className="w-5 h-5 text-rose-600" />
                          Video Integration
                        </h4>
                        <Card className="p-6 border-rose-100 bg-rose-50/30">
                          <p className="font-bold text-rose-900 mb-2">Topic: {plan.videoAssistant.suggestedVideo.topic}</p>
                          <div className="space-y-3">
                            <div>
                              <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-1">Pre-Video Prompt</p>
                              <p className="text-sm text-rose-800 italic">"{plan.videoAssistant.teacherGuidance.beforeVideo}"</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-1">Discussion Questions</p>
                              <ul className="list-disc list-inside space-y-1 text-sm text-rose-800">
                                {plan.videoAssistant.teacherGuidance.pausePoints?.slice(0, 3).map((q, i) => <li key={i}>{q.timestamp}: {q.question}</li>)}
                              </ul>
                            </div>
                          </div>
                        </Card>
                      </section>
                    )}
                  </div>

                  <div className="space-y-8">
                    {/* Materials Checklist */}
                    <Card className="p-6 bg-amber-50 border-amber-100">
                      <h4 className="text-lg font-bold text-amber-900 mb-4 flex items-center gap-2">
                        <Package className="w-5 h-5" />
                        Materials Check
                      </h4>
                      <div className="space-y-3">
                        {plan.materials?.map((m, i) => (
                          <div key={i} className="flex items-center gap-3">
                            <input type="checkbox" className="w-4 h-4 rounded border-amber-300 text-amber-600 focus:ring-amber-500" />
                            <span className="text-sm font-medium text-amber-900">{m}</span>
                          </div>
                        ))}
                      </div>
                    </Card>

                    {/* Demonstration Quick Guide */}
                    {plan.demonstrationSupport && (
                      <Card className="p-6 bg-emerald-50 border-emerald-100">
                        <h4 className="text-lg font-bold text-emerald-900 mb-4 flex items-center gap-2">
                          <Zap className="w-5 h-5" />
                          Demo Guide
                        </h4>
                        <div className="space-y-4">
                          <div>
                            <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Action</p>
                            <p className="text-sm text-emerald-800">{plan.demonstrationSupport.steps[0]?.action}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Watch For</p>
                            <ul className="list-disc list-inside space-y-1 text-xs text-emerald-800">
                              {plan.demonstrationSupport.steps[0]?.observation.split('.').map((o, i) => o.trim() && <li key={i}>{o}</li>)}
                            </ul>
                          </div>
                        </div>
                      </Card>
                    )}

                    {/* Assessment Quick Check */}
                    <Card className="p-6 bg-indigo-50 border-indigo-100">
                      <h4 className="text-lg font-bold text-indigo-900 mb-4 flex items-center gap-2">
                        <Target className="w-5 h-5" />
                        Quick Assessment
                      </h4>
                      <ul className="list-disc list-inside space-y-2 text-sm text-indigo-800">
                        {plan.assessment?.slice(0, 3).map((a, i) => <li key={i}>{a}</li>)}
                      </ul>
                    </Card>
                  </div>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </Card>

      {/* Teach Me This Topic 8-Question Modal */}
      <TeachMeThisTopicModal 
        isOpen={showTeachMeTopicModal} 
        onClose={() => setShowTeachMeTopicModal(false)} 
        plan={enrichedPlan} 
      />

      {/* Video Player Modal */}
      {showVideoPlayer && plan.lessonVideo && (
        <LessonVideoPlayer 
          video={plan.lessonVideo} 
          onClose={() => setShowVideoPlayer(false)} 
        />
      )}
      </div>
      {/* FORMAL PRINT TEMPLATE - ONLY VISIBLE DURING PRINT */}
      <div className="hidden print:block fixed inset-0 bg-white z-[9999] overflow-visible">
        <PrintableLessonPlan 
          plan={plan} 
          teacherName={auth.currentUser?.displayName || (auth.currentUser?.email?.startsWith('haspal') ? 'Hassan' : undefined) || plan.studentTeacherName || 'Hassan'} 
          schoolName="SAN JUAN BOSCO R.C. SCHOOL"
        />
      </div>
    </>
  );
}
