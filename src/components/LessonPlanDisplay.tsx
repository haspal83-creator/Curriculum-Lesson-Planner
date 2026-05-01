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
  ArrowLeft
} from 'lucide-react';
import Markdown from 'react-markdown';
import { Button, Card, LessonStatusBadge, DropdownMenu, Tabs, TabsList, TabsTrigger, TabsContent, Badge } from './ui';
import { LessonPlan, LessonStatus, LessonResource, VideoMode, VideoLength, VoiceGender, VoiceTone, VoicePace, AvatarStyle, AvatarPlacement } from '../types';
import { cn } from '../lib/utils';
import { useToasts } from '../context/ToastContext';
import { motion, AnimatePresence } from 'motion/react';
import { auth } from '../firebase';
import { exportToWord, formatLessonForExport } from '../lib/exportUtils';
import { LessonVideoPlayer } from './LessonVideoPlayer';
import { ActionPanel } from './ActionPanel';
import { LessonExecutionBoard } from './LessonExecutionBoard';

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
  initialTab = 'plan'
}: LessonPlanDisplayProps) {
  const { showToast } = useToasts();
  const [viewMode, setViewMode] = useState<'teacher' | 'student'>('teacher');
  const [activeTab, setActiveTab] = useState(initialTab);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [isTeachMode, setIsTeachMode] = useState(false);
  const [isSplitView, setIsSplitView] = useState(true);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    objectives: true,
    materials: true,
    procedures: true,
    assessment: true,
    differentiation: true,
    closure: true,
    reflection: true
  });

  const [activeSection, setActiveSection] = useState('summary');

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

    const ids = ['summary', 'strategies', 'objectives', 'materials', 'procedures', 'assessment', 'differentiation', 'closure', 'reflection'];
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [plan]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

  const handleExportWord = () => {
    exportToWord(plan, auth.currentUser?.displayName || undefined);
    showToast("Generating Word document template...", "success");
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
      <div className="space-y-6 print:hidden">
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

      <Card className="overflow-hidden border-gray-100 shadow-xl print:shadow-none print:border-none print:hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="bg-white border-b border-gray-100 px-8 pt-6 print:hidden">
            <TabsList className="bg-transparent h-auto p-0 gap-8 overflow-x-auto flex-nowrap no-scrollbar">
              <TabsTrigger value="plan" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-4 data-[state=active]:border-indigo-600 rounded-none pb-4 text-sm font-black uppercase tracking-widest transition-all">
                Lesson Plan
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

          <div className="p-8 print:p-0">
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
            <TabsContent value="plan" className="mt-0 relative bg-gray-50/30 min-h-screen">
              {/* 1. STICKY TOP ACTION BAR — EXACT HEIGHT: 72px */}
              <div className="sticky top-0 z-50 h-[72px] border-b border-gray-200 bg-white/80 backdrop-blur-md print:hidden">
                <div className="max-w-[1800px] mx-auto h-full px-8 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center bg-gray-100/50 p-1 rounded-2xl border border-gray-200/50">
                      <Button 
                        variant={!isTeachMode ? "primary" : "ghost"} 
                        size="sm" 
                        className={cn(
                          "h-9 px-6 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all duration-300", 
                          !isTeachMode ? "bg-white shadow-md text-indigo-600" : "text-gray-400 hover:text-gray-600"
                        )}
                        onClick={() => setIsTeachMode(false)}
                      >
                        Planner View
                      </Button>
                      <Button 
                        variant={isTeachMode ? "primary" : "ghost"} 
                        size="sm" 
                        className={cn(
                          "h-9 px-6 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all duration-300", 
                          isTeachMode ? "bg-white shadow-md text-indigo-600" : "text-gray-400 hover:text-gray-600"
                        )}
                        onClick={() => setIsTeachMode(true)}
                      >
                        Teach Mode
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="hidden md:flex items-center gap-3">
                      <Button variant="outline" className="h-11 px-5 rounded-2xl border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all">
                        <Edit3 className="w-4 h-4 mr-2.5" /> Edit
                      </Button>
                      <Button variant="outline" className="h-11 px-5 rounded-2xl border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all" onClick={handlePrint}>
                        <Printer className="w-4 h-4 mr-2.5" /> Print
                      </Button>
                      <Button variant="outline" className="h-11 px-5 rounded-2xl border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all" onClick={handleExportPDF}>
                        <FileDown className="w-4 h-4 mr-2.5" /> PDF
                      </Button>
                    </div>
                    <div className="h-8 w-px bg-gray-200 mx-1" />
                    <DropdownMenu
                      trigger={
                        <Button variant="outline" className="h-11 w-11 p-0 rounded-2xl border-gray-200 hover:bg-gray-50 transition-all">
                          <MoreHorizontal className="w-5 h-5 text-gray-400" />
                        </Button>
                      }
                      items={[
                        { label: 'Duplicate Lesson', onClick: () => onDuplicate?.(plan), icon: <Copy className="w-4 h-4" /> },
                        { label: 'Share with Team', onClick: () => showToast("Sharing coming soon!", "info"), icon: <Share2 className="w-4 h-4" /> },
                        { label: 'Export to Word', onClick: handleExportWord, icon: <FileEdit className="w-4 h-4" /> },
                        { label: 'Generate Resources', onClick: handleGenerateFullPack, icon: <Sparkles className="w-4 h-4 text-indigo-600" /> },
                        { label: 'AI Video Assist', onClick: () => setActiveTab('ai-video'), icon: <Video className="w-4 h-4 text-indigo-600" /> },
                      ]}
                    />
                  </div>
                </div>
              </div>

              {/* OUTER PAGE CONTAINER — EXACT WIDTH: 1800px */}
              <div className="w-full max-w-[1800px] mx-auto px-8 py-6">
                
                {/* 4. MAIN WORKSPACE GRID */}
                <div className={cn(
                    "mt-8",
                    isTeachMode ? "grid grid-cols-1 gap-8 px-8" : "app-container"
                  )}>
                    
                    {/* 5. LEFT SIDEBAR — EXACT MEASUREMENTS: 260px width */}
                    {!isTeachMode && (
                      <aside className="hidden lg:block left-sidebar">
                        <div className="sticky top-24 min-h-[520px] rounded-[24px] border border-gray-200 bg-white p-6 shadow-sm print:hidden">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6 px-2">Navigation</p>
                          <div className="space-y-2">
                            {[
                              { id: 'summary', label: 'Overview', icon: Layout },
                              { id: 'strategies', label: 'Strategies', icon: Sparkles },
                              { id: 'objectives', label: 'Objectives', icon: Target },
                              { id: 'materials', label: 'Materials', icon: Package },
                              { id: 'procedures', label: 'Execution Flow', icon: PenTool },
                              { id: 'assessment', label: 'Assessment', icon: ListChecks },
                              { id: 'differentiation', label: 'Differentiation', icon: Users },
                              { id: 'closure', label: 'Closure', icon: XCircle },
                              { id: 'reflection', label: 'Reflection', icon: StickyNote },
                            ].map(item => (
                              <button 
                                key={item.id}
                                onClick={() => scrollToSection(item.id)}
                                className={cn(
                                  "h-12 w-full rounded-2xl px-4 flex items-center justify-between text-sm font-bold transition-all duration-300 group",
                                  activeSection === item.id 
                                    ? "bg-indigo-50 text-indigo-600 shadow-sm shadow-indigo-100/50" 
                                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                                )}
                              >
                                <div className="flex items-center gap-3.5">
                                  <item.icon className={cn(
                                    "w-4 h-4 transition-colors",
                                    activeSection === item.id ? "text-indigo-600" : "text-gray-300 group-hover:text-indigo-400"
                                  )} />
                                  {item.label}
                                </div>
                                {activeSection === item.id && (
                                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 shadow-[0_0_8px_rgba(79,70,229,0.6)]" />
                                )}
                              </button>
                            ))}
                          </div>

                          <div className="mt-12 pt-8 border-t border-gray-100">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6 px-2">Quick Stats</p>
                            <div className="space-y-4 px-2">
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-gray-500">Duration</span>
                                <span className="text-xs font-bold text-gray-900">{plan.duration}m</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-gray-500">Phases</span>
                                <span className="text-xs font-bold text-gray-900">5 Steps</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </aside>
                    )}

                    {/* 7. CENTER MAIN CONTENT */}
                    <div className={cn(
                      "main-wrapper min-w-0 mx-auto w-full",
                      isTeachMode && "lg:col-span-1"
                    )}>
                      <main className={cn(
                        "main-content space-y-6",
                        isTeachMode && "p-8"
                      )}>
                        {/* A. Lesson Header Card */}
                      <Card id="summary" className={cn(
                        "rounded-[16px] shadow-sm border-gray-100 bg-white transition-all",
                        isTeachMode ? "p-12" : "p-8"
                      )}>
                        <div className="space-y-6">
                          <div className="flex items-center gap-3 text-indigo-600">
                            <FileText className="w-6 h-6" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Lesson Overview</span>
                          </div>
                          <h1 className={cn(
                            "font-black text-gray-900 tracking-tight font-display",
                            isTeachMode ? "text-5xl" : "text-4xl"
                          )}>{plan.lessonTitle}</h1>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-gray-50">
                            <div className="space-y-1">
                              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Subject</p>
                              <div className="flex items-center gap-2">
                                <BookOpen className="w-4 h-4 text-indigo-500" />
                                <span className="font-bold text-gray-700">{plan.subject}</span>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Grade</p>
                              <div className="flex items-center gap-2">
                                <GraduationCap className="w-4 h-4 text-emerald-500" />
                                <span className="font-bold text-gray-700">{plan.grade}</span>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Duration</p>
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-rose-500" />
                                <span className="font-bold text-gray-700">{plan.duration} mins</span>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Topic</p>
                              <div className="flex items-center gap-2">
                                <Target className="w-4 h-4 text-amber-500" />
                                <span className="font-bold text-gray-700 truncate">{plan.topic}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>

                      {/* NEW: LESSON SNAPSHOT */}
                      {plan.lessonSnapshot && (
                        <div className="rounded-[16px] border border-indigo-100 bg-indigo-50/30 p-8 shadow-sm">
                          <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                              <Sparkles className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-black text-indigo-900 font-display uppercase tracking-tight">Lesson Snapshot</h3>
                          </div>
                          <p className={cn(
                            "text-indigo-900/80 font-medium leading-relaxed",
                            isTeachMode ? "text-2xl" : "text-lg"
                          )}>{plan.lessonSnapshot.about}</p>
                        </div>
                      )}

                      {/* NEW: TEACHING STRATEGIES & METHODOLOGY */}
                      {(plan.teachingStrategies?.length || plan.methodology) && (
                        <div id="strategies" className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {plan.teachingStrategies && plan.teachingStrategies.length > 0 && (
                            <div className="rounded-[16px] border border-amber-100 bg-amber-50/30 p-8 shadow-sm">
                              <div className="flex items-center gap-3 mb-6 text-amber-700">
                                <Sparkles className="w-5 h-5" />
                                <h3 className="text-lg font-black uppercase tracking-tight">Teaching Strategies</h3>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {plan.teachingStrategies.map((strategy, i) => (
                                  <span key={i} className="bg-white border border-amber-200 text-amber-800 px-4 py-2 rounded-xl text-sm font-bold shadow-sm">
                                    {strategy}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          {plan.methodology && (
                            <div className="rounded-[16px] border border-emerald-100 bg-emerald-50/30 p-8 shadow-sm">
                              <div className="flex items-center gap-3 mb-6 text-emerald-700">
                                <Layers className="w-5 h-5" />
                                <h3 className="text-lg font-black uppercase tracking-tight">Methodology</h3>
                              </div>
                              <p className={cn(
                                "text-emerald-900/80 font-bold",
                                isTeachMode ? "text-xl" : "text-sm"
                              )}>
                                {plan.methodology}
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Sections Moved to Bottom Panel */}

                      {/* D. Assessment Card */}
                      <Card id="assessment" className={cn(
                        "rounded-[16px] shadow-sm border-gray-100 bg-white transition-all",
                        isTeachMode ? "p-12" : "p-8"
                      )}>
                        <div className="space-y-8">
                          <div className="flex items-center gap-3 text-rose-600">
                            <ListChecks className="w-6 h-6" />
                            <h3 className="text-xl font-black uppercase tracking-tight">Assessment & Evaluation</h3>
                          </div>

                          <div className="space-y-6">
                            <div className="space-y-3">
                              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Questions for Understanding</p>
                              <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                                <BulletList items={plan.assessment} icon={HelpCircle} isTeachMode={isTeachMode} />
                              </div>
                            </div>

                            <div className="space-y-3">
                              <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em]">Exit Ticket</p>
                              <div className="bg-indigo-50/30 p-8 rounded-xl border border-indigo-100 border-dashed text-center">
                                <p className={cn(
                                  "font-bold text-indigo-900 italic leading-relaxed",
                                  isTeachMode ? "text-3xl" : "text-xl"
                                )}>
                                  {plan.closurePanel?.exitQuestion || "What is one thing you learned today?"}
                                </p>
                              </div>
                            </div>

                            <div className="space-y-3">
                              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Evaluation Notes</p>
                              <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 min-h-[120px]">
                                <p className="text-sm text-gray-400 italic">Teacher notes on student performance will be recorded here after the lesson...</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>

                      {/* E. Differentiation Card */}
                      <LessonSectionCard 
                        id="differentiation" 
                        title="Differentiation" 
                        icon={Users}
                        expanded={expandedSections.differentiation}
                        onToggle={() => toggleSection('differentiation')}
                        isTeachMode={isTeachMode}
                      >
                        {plan.differentiationFramework ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="rounded-xl border border-rose-100 bg-rose-50/30 p-6">
                              <p className="text-[10px] font-black text-rose-600 uppercase tracking-[0.2em] mb-3">Struggling</p>
                              <BulletList items={[...(plan.differentiationFramework.strugglingLearners.scaffolds || []), ...(plan.differentiationFramework.strugglingLearners.visuals || []), ...(plan.differentiationFramework.strugglingLearners.manipulatives || []), plan.differentiationFramework.strugglingLearners.simplifiedInstructions, plan.differentiationFramework.strugglingLearners.guidedSupport].filter(Boolean)} icon={AlertCircle} isTeachMode={isTeachMode} />
                            </div>
                            <div className="rounded-xl border border-emerald-100 bg-emerald-50/30 p-6">
                              <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-3">On-Level</p>
                              <BulletList items={[plan.differentiationFramework.onLevelLearners.participationExpectations, plan.differentiationFramework.onLevelLearners.independentWorkExpectations, plan.differentiationFramework.onLevelLearners.peerCollaboration].filter(Boolean)} icon={Check} isTeachMode={isTeachMode} />
                            </div>
                            <div className="rounded-xl border border-indigo-100 bg-indigo-50/30 p-6">
                              <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-3">Advanced</p>
                              <BulletList items={[...(plan.differentiationFramework.advancedLearners.challengeTasks || []), ...(plan.differentiationFramework.advancedLearners.deeperThinkingPrompts || []), plan.differentiationFramework.advancedLearners.extensionActivity, plan.differentiationFramework.advancedLearners.leadershipRole].filter(Boolean)} icon={Zap} isTeachMode={isTeachMode} />
                            </div>
                            <div className="rounded-xl border border-amber-100 bg-amber-50/30 p-6">
                              <p className="text-[10px] font-black text-amber-600 uppercase tracking-[0.2em] mb-3">Inclusion Support</p>
                              <BulletList items={Object.values(plan.differentiationFramework?.inclusionSupport || {}).filter(Boolean) as string[]} icon={Layers} isTeachMode={isTeachMode} />
                            </div>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-6">
                              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Struggling</p>
                              <BulletList items={plan.differentiation} icon={AlertCircle} isTeachMode={isTeachMode} />
                            </div>
                            <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-6">
                              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Advanced</p>
                              <BulletList items={["Extension tasks", "Peer mentoring"]} icon={Zap} isTeachMode={isTeachMode} />
                            </div>
                          </div>
                        )}
                      </LessonSectionCard>

                      {/* F. Reflection Card */}
                      <LessonSectionCard 
                        id="reflection" 
                        title="Teacher Reflection" 
                        icon={StickyNote}
                        expanded={expandedSections.reflection}
                        onToggle={() => toggleSection('reflection')}
                        isTeachMode={isTeachMode}
                      >
                        <div className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">What went well?</label>
                              <textarea className="w-full rounded-xl border border-gray-100 bg-gray-50/50 p-5 focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none min-h-[120px]" placeholder="Enter notes..." />
                            </div>
                            <div className="space-y-3">
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Challenges?</label>
                              <textarea className="w-full rounded-xl border border-gray-100 bg-gray-50/50 p-5 focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none min-h-[120px]" placeholder="Enter notes..." />
                            </div>
                          </div>
                        </div>
                      </LessonSectionCard>
                      {/* sections moved */}

                    {/* 20. BOTTOM TEACHER ROW — EXACT LAYOUT: 2 columns */}
                    <div className="mt-8 grid grid-cols-1 xl:grid-cols-2 gap-8">
                      {/* 21. REFLECTION CARD */}
                      <LessonSectionCard 
                        id="reflection" 
                        title="Teacher Reflection Dashboard" 
                        icon={StickyNote}
                        expanded={expandedSections.reflection}
                        onToggle={() => toggleSection('reflection')}
                        className="min-h-[400px]"
                        isTeachMode={isTeachMode}
                      >
                        {plan.reflectionDashboard ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                              <div className="rounded-3xl border border-emerald-100 bg-emerald-50/30 p-6">
                                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-3">What Worked Well</p>
                                <BulletList items={plan.reflectionDashboard.whatWorked} icon={CheckCircle2} isTeachMode={isTeachMode} />
                              </div>
                              <div className="rounded-3xl border border-rose-100 bg-rose-50/30 p-6">
                                <p className="text-[10px] font-black text-rose-600 uppercase tracking-[0.2em] mb-3">Needs Improvement</p>
                                <BulletList items={plan.reflectionDashboard.needsImprovement} icon={AlertCircle} isTeachMode={isTeachMode} />
                              </div>
                            </div>
                            <div className="space-y-4">
                              <div className="rounded-3xl border border-amber-100 bg-amber-50/30 p-6">
                                <p className="text-[10px] font-black text-amber-600 uppercase tracking-[0.2em] mb-3">Follow-up Students</p>
                                <BulletList items={plan.reflectionDashboard.followUpStudents} icon={Users} isTeachMode={isTeachMode} />
                              </div>
                              <div className="rounded-3xl border border-indigo-100 bg-indigo-50/30 p-6">
                                <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-3">Next Steps</p>
                                <BulletList items={plan.reflectionDashboard.nextSteps} icon={ArrowRight} isTeachMode={isTeachMode} />
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className={cn(
                            "space-y-6",
                            isTeachMode && "space-y-10"
                          )}>
                            <div className={cn(
                              "grid grid-cols-1 gap-6",
                              !isTeachMode && "grid-cols-2"
                            )}>
                              <div className="space-y-3">
                                <label className={cn(
                                  "font-black text-gray-400 uppercase tracking-[0.2em]",
                                  isTeachMode ? "text-xs" : "text-[10px]"
                                )}>What went well?</label>
                                <textarea className={cn(
                                  "w-full rounded-3xl border border-gray-100 bg-gray-50/50 p-5 focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none",
                                  isTeachMode ? "min-h-[200px] text-[18px]" : "min-h-[120px] text-sm"
                                )} placeholder="Enter notes..." />
                              </div>
                              <div className="space-y-3">
                                <label className={cn(
                                  "font-black text-gray-400 uppercase tracking-[0.2em]",
                                  isTeachMode ? "text-xs" : "text-[10px]"
                                )}>Challenges?</label>
                                <textarea className={cn(
                                  "w-full rounded-3xl border border-gray-100 bg-gray-50/50 p-5 focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none",
                                  isTeachMode ? "min-h-[200px] text-[18px]" : "min-h-[120px] text-sm"
                                )} placeholder="Enter notes..." />
                              </div>
                            </div>
                            <div className="space-y-3">
                              <label className={cn(
                                "font-black text-gray-400 uppercase tracking-[0.2em]",
                                isTeachMode ? "text-xs" : "text-[10px]"
                              )}>Notes for next lesson</label>
                              <textarea className={cn(
                                "w-full rounded-3xl border border-gray-100 bg-gray-50/50 p-5 focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none",
                                isTeachMode ? "min-h-[200px] text-[18px]" : "min-h-[120px] text-sm"
                              )} placeholder="Enter notes..." />
                            </div>
                          </div>
                        )}
                      </LessonSectionCard>

                      {/* 22. ATTACHED RESOURCES CARD */}
                      <Card className={cn(
                        "min-h-[400px] rounded-[32px] border border-gray-200 bg-white shadow-sm transition-all",
                        isTeachMode ? "p-12 border-indigo-200 shadow-xl" : "p-8"
                      )}>
                        <div className={cn(
                          "flex justify-between items-center",
                          isTeachMode ? "mb-12" : "mb-8"
                        )}>
                          <h4 className={cn(
                            "font-display font-bold text-gray-900 flex items-center gap-3",
                            isTeachMode ? "text-[32px]" : "text-[24px]"
                          )}>
                            <Package className={isTeachMode ? "w-10 h-10 text-indigo-600" : "w-6 h-6 text-indigo-600"} />
                            Lesson Assets
                          </h4>
                          <Button variant="ghost" size="sm" className={cn(
                            "text-indigo-600 font-bold hover:bg-indigo-50 rounded-xl px-4",
                            isTeachMode ? "h-14 px-8 text-lg" : "h-9"
                          )} onClick={handleGenerateFullPack}>
                            <Sparkles className={isTeachMode ? "w-6 h-6 mr-3" : "w-4 h-4 mr-2"} /> Generate All
                          </Button>
                        </div>
                        
                        <div className={cn(
                          "space-y-4",
                          isTeachMode && "space-y-6"
                        )}>
                          {plan.resourceMapping ? (
                            plan.resourceMapping.map((res, i) => (
                              <div key={i} className={cn(
                                "rounded-2xl border border-gray-50 bg-gray-50/50 flex items-center justify-between group hover:bg-white hover:border-indigo-100 hover:shadow-md transition-all duration-300",
                                isTeachMode ? "min-h-[100px] px-8 py-6" : "min-h-[76px] px-5 py-4"
                              )}>
                                <div className="flex items-center gap-4">
                                  <div className={cn(
                                    "rounded-xl border border-white shadow-sm transition-colors flex items-center justify-center bg-indigo-50 text-indigo-500",
                                    isTeachMode ? "p-4 w-16 h-16" : "p-3 w-10 h-10"
                                  )}>
                                    <FileText className={isTeachMode ? "w-8 h-8" : "w-5 h-5"} />
                                  </div>
                                  <div>
                                    <p className={cn(
                                      "font-bold text-gray-900",
                                      isTeachMode ? "text-[20px]" : "text-[15px]"
                                    )}>{res.resourceName}</p>
                                    <p className={cn(
                                      "font-black text-gray-400 uppercase tracking-[0.1em] mt-0.5",
                                      isTeachMode ? "text-xs" : "text-[10px]"
                                    )}>{res.type} • {res.phaseUsed}</p>
                                  </div>
                                </div>
                                <div className={cn(
                                  "flex gap-2 transition-all duration-300",
                                  !isTeachMode && "opacity-0 group-hover:opacity-100"
                                )}>
                                  <Button variant="ghost" size="sm" className={cn(
                                    "font-black uppercase rounded-xl hover:bg-indigo-50 hover:text-indigo-600",
                                    isTeachMode ? "h-12 px-6 text-sm" : "h-9 px-4 text-[10px]"
                                  )}>Open</Button>
                                </div>
                              </div>
                            ))
                          ) : (
                            [
                              { title: 'Worksheet A', type: 'PDF Document', icon: FileText, color: 'text-blue-500', bg: 'bg-blue-50' },
                              { title: 'Visual Slides', type: 'Interactive Slides', icon: Presentation, color: 'text-orange-500', bg: 'bg-orange-50' },
                              { title: 'Vocabulary Cards', type: 'Printable Cards', icon: Layers, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                              { title: 'Exit Tickets', type: 'Assessment PDF', icon: ListChecks, color: 'text-rose-500', bg: 'bg-rose-50' },
                            ].map((res, i) => (
                              <div key={i} className={cn(
                                "rounded-2xl border border-gray-50 bg-gray-50/50 flex items-center justify-between group hover:bg-white hover:border-indigo-100 hover:shadow-md transition-all duration-300",
                                isTeachMode ? "min-h-[100px] px-8 py-6" : "min-h-[76px] px-5 py-4"
                              )}>
                                <div className="flex items-center gap-4">
                                  <div className={cn(
                                    "rounded-xl border border-white shadow-sm transition-colors flex items-center justify-center",
                                    res.bg, res.color,
                                    isTeachMode ? "p-4 w-16 h-16" : "p-3 w-10 h-10"
                                  )}>
                                    <res.icon className={isTeachMode ? "w-8 h-8" : "w-5 h-5"} />
                                  </div>
                                  <div>
                                    <p className={cn(
                                      "font-bold text-gray-900",
                                      isTeachMode ? "text-[20px]" : "text-[15px]"
                                    )}>{res.title}</p>
                                    <p className={cn(
                                      "font-black text-gray-400 uppercase tracking-[0.1em] mt-0.5",
                                      isTeachMode ? "text-xs" : "text-[10px]"
                                    )}>{res.type}</p>
                                  </div>
                                </div>
                                <div className={cn(
                                  "flex gap-2 transition-all duration-300",
                                  !isTeachMode && "opacity-0 group-hover:opacity-100"
                                )}>
                                  <Button variant="ghost" size="sm" className={cn(
                                    "font-black uppercase rounded-xl hover:bg-indigo-50 hover:text-indigo-600",
                                    isTeachMode ? "h-12 px-6 text-sm" : "h-9 px-4 text-[10px]"
                                  )}>Open</Button>
                                  <Button variant="ghost" size="sm" className={cn(
                                    "font-black uppercase rounded-xl hover:bg-indigo-50 hover:text-indigo-600",
                                    isTeachMode ? "h-12 px-6 text-sm" : "h-9 px-4 text-[10px]"
                                  )}>Print</Button>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </Card>

                      {/* EXIT TICKET SECTION */}
                      <LessonSectionCard
                        id="closure"
                        title="Exit Ticket"
                        icon={BookOpen}
                        expanded={expandedSections.closure}
                        onToggle={() => toggleSection('closure')}
                        isTeachMode={isTeachMode}
                      >
                        <div className="rounded-2xl border-2 border-dashed border-indigo-200 bg-indigo-50/5 p-8 text-center">
                          <p className="text-sm font-black text-indigo-400 uppercase tracking-widest mb-4">Final Check for Understanding</p>
                          <p className={cn(
                            "text-gray-900 font-bold italic leading-relaxed",
                            isTeachMode ? "text-3xl" : "text-xl"
                          )}>
                            {plan.closurePanel?.exitQuestion || "Write down one thing you learned today and one question you still have."}
                          </p>
                        </div>
                      </LessonSectionCard>
                      </div>
                      </main>

                      {!isTeachMode && (
                        <div className="bottom-panel no-print">
                          <div className="bottom-item">
                            <Card id="objectives" className="p-6 h-full border-gray-100 bg-white">
                              <div className="space-y-6">
                                <div className="flex items-center gap-3 text-indigo-600">
                                  <Target className="w-5 h-5" />
                                  <h3 className="text-sm font-black uppercase tracking-tight">Objectives</h3>
                                </div>
                                <div className="space-y-4">
                                  <div>
                                    <p className="text-[9px] font-black text-indigo-600 uppercase tracking-widest mb-2">Knowledge</p>
                                    <BulletList items={plan.learningObjectivesBoard?.knowledge || plan.generalObjective} icon={CheckCircle2} />
                                  </div>
                                  <div>
                                    <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-2">Skills</p>
                                    <BulletList items={plan.learningObjectivesBoard?.skill} icon={CheckCircle2} />
                                  </div>
                                </div>
                              </div>
                            </Card>
                          </div>

                          <div className="bottom-item">
                            <Card id="materials" className="p-6 h-full border-gray-100 bg-white">
                              <div className="space-y-6">
                                <div className="flex items-center gap-3 text-indigo-600">
                                  <Package className="w-5 h-5" />
                                  <h3 className="text-sm font-black uppercase tracking-tight">Materials</h3>
                                </div>
                                {plan.materialsBoard ? (
                                  <div className="grid grid-cols-1 gap-3">
                                    {plan.materialsBoard.slice(0, 4).map((item, i) => (
                                      <div key={i} className="text-xs">
                                        <p className="font-bold">{item.name}</p>
                                        <p className="text-[10px] text-gray-500">{item.purpose}</p>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <BulletList items={plan.materials} icon={Check} />
                                )}
                              </div>
                            </Card>
                          </div>

                          <div className="bottom-item">
                            <Card id="procedures" className="p-6 h-full border-gray-100 bg-white overflow-hidden">
                              <div className="space-y-4">
                                <div className="flex items-center gap-3 text-indigo-600">
                                  <PenTool className="w-5 h-5" />
                                  <h3 className="text-sm font-black uppercase tracking-tight">Execution</h3>
                                </div>
                                <div className="max-h-[200px] overflow-y-auto pr-2">
                                  <LessonExecutionBoard plan={plan} compact />
                                </div>
                              </div>
                            </Card>
                          </div>
                        </div>
                      )}
                    </div>

                  {/* 6. RIGHT SIDEBAR — ASSISTANT PANEL */}
                  {!isTeachMode && (
                    <aside className="hidden lg:block right-sidebar">
                      <div className="sticky top-24 space-y-6 print:hidden">
                        <Card className="rounded-[24px] border border-gray-200 bg-white p-6 shadow-sm">
                          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-6 flex items-center gap-2">
                            <Settings2 className="w-4 h-4" /> Assistant Panel
                          </h4>
                          <div className="space-y-3">
                            <Button variant="outline" className="w-full justify-start h-12 rounded-xl border-gray-100 text-gray-600 font-bold text-xs hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-100 transition-all group">
                              <FileText className="w-4 h-4 mr-3 text-gray-300 group-hover:text-indigo-500" /> Quick Notes
                            </Button>
                            <Button variant="outline" className="w-full justify-start h-12 rounded-xl border-gray-100 text-gray-600 font-bold text-xs hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-100 transition-all group">
                              <Layers className="w-4 h-4 mr-3 text-gray-300 group-hover:text-indigo-500" /> Vocabulary List
                            </Button>
                          </div>
                        </Card>

                        <Card className="rounded-[24px] border border-indigo-100 bg-white p-6 shadow-lg shadow-indigo-50/50">
                          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 mb-6">Quick Actions</h4>
                          <div className="space-y-3">
                            <Button 
                              variant="primary" 
                              size="sm" 
                              className="w-full justify-start h-12 rounded-xl font-bold shadow-sm" 
                              onClick={onGenerateReteach}
                            >
                              <RefreshCw className="w-4 h-4 mr-3" /> Generate Reteach
                            </Button>
                            <Button 
                              variant="secondary" 
                              size="sm" 
                              className="w-full justify-start h-12 rounded-xl font-bold" 
                              onClick={onGenerateIntervention}
                            >
                              <Zap className="w-4 h-4 mr-3" /> Intervention
                            </Button>
                          </div>
                        </Card>
                      </div>
                    </aside>
                  )}
                </div>
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
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-bold text-gray-900">Student Worksheets</h3>
                <Button size="sm" onClick={() => onGenerateResource?.(plan, 'Worksheet')}>
                  <Plus className="w-4 h-4" />
                  Add Worksheet
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {plan.teachingResources?.studentMaterials.worksheets?.map((ws, i) => (
                  renderResourceCard(`Worksheet ${i + 1}`, ws, 'Worksheet', `worksheet-${i}`)
                ))}
                {(!plan.teachingResources?.studentMaterials.worksheets || plan.teachingResources.studentMaterials.worksheets?.length === 0) && (
                  <div className="col-span-full py-12 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                    <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">No worksheets generated for this lesson.</p>
                    <Button variant="ghost" className="mt-4" onClick={() => onGenerateResource?.(plan, 'Worksheet')}>
                      Generate First Worksheet
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="assessments" className="mt-0 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {plan.teachingResources?.assessmentMaterials.formativeAssessment && renderResourceCard("Formative Assessment", plan.teachingResources.assessmentMaterials.formativeAssessment, "Assessment", "assessment-formative")}
                {plan.teachingResources?.assessmentMaterials.rubric && renderResourceCard("Grading Rubric", plan.teachingResources.assessmentMaterials.rubric, "Rubric", "assessment-rubric")}
                {plan.teachingResources?.assessmentMaterials.answerKey && renderResourceCard("Answer Key", plan.teachingResources.assessmentMaterials.answerKey, "Answer Key", "assessment-answer-key")}
              </div>
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
        <div className="max-w-[8.5in] mx-auto p-4 sm:p-10">
          <pre className="whitespace-pre-wrap font-sans text-[12pt] leading-relaxed text-black">
            {formatLessonForExport(plan, auth.currentUser?.displayName || undefined)}
          </pre>
        </div>
      </div>
    </>
  );
}
