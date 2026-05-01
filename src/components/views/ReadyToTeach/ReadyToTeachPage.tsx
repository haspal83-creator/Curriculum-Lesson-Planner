import React, { useState, useEffect, useRef } from 'react';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  doc, 
  updateDoc, 
  addDoc, 
  serverTimestamp,
  getDoc,
  getDocFromServer
} from 'firebase/firestore';
import { db, auth } from '../../../firebase';
import { 
  SavedLesson, 
  LessonResourceNew, 
  LessonResourceType, 
  GradeLevel, 
  Subject 
} from '../../../types';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path,
    authInfo: {
      userId: auth.currentUser?.uid || '',
      email: auth.currentUser?.email || '',
      emailVerified: auth.currentUser?.emailVerified || false,
      isAnonymous: auth.currentUser?.isAnonymous || false,
      tenantId: auth.currentUser?.tenantId || '',
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName || '',
        email: provider.email || '',
        photoUrl: provider.photoURL || ''
      })) || []
    }
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
import { TopControlBar } from './TopControlBar';
import { LeftTeachingSidebar } from './LeftTeachingSidebar';
import { LessonSectionCard } from './LessonSectionCard';
import { TeachNowAssistant } from './TeachNowAssistant';
import { lessonDeliveryService } from '../../../services/lessonDeliveryService';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Loader2, 
  AlertCircle, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2,
  Info,
  BookOpen,
  Target,
  ListChecks,
  Lightbulb,
  Layout, 
  CheckSquare, 
  Square, 
  FileText, 
  Image as ImageIcon, 
  Video, 
  Play, 
  Download, 
  Zap, 
  Settings, 
  Mic, 
  Users, 
  MessageSquare, 
  ClipboardList, 
  Package, 
  Plus, 
  Maximize2, 
  Printer 
} from 'lucide-react';
import { PresentationMode } from './PresentationMode';
import { cn } from '../../../lib/utils';
import { exportToWord, exportSavedLessonToWord } from '../../../lib/exportUtils';

interface ReadyToTeachPageProps {
  lessonId: string;
  onBack: () => void;
}

export const ReadyToTeachPage: React.FC<ReadyToTeachPageProps> = ({ lessonId, onBack }) => {
  const [lesson, setLesson] = useState<SavedLesson | null>(null);
  const [resources, setResources] = useState<LessonResourceNew[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState('lesson_overview');
  const [isStudentMode, setIsStudentMode] = useState(false);
  const [showTeachNow, setShowTeachNow] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [showPresentation, setShowPresentation] = useState(false);

  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    if (!lessonId || !auth.currentUser) return;

    setLoading(true);
    const lessonRef = doc(db, 'saved_lessons', lessonId);
    
    // Test connection
    getDocFromServer(doc(db, 'test', 'connection')).catch(error => {
      if (error instanceof Error && error.message.includes('the client is offline')) {
        console.error("Please check your Firebase configuration. The client is offline.");
      }
    });
    
    const unsubscribeLesson = onSnapshot(lessonRef, (docSnap) => {
      if (docSnap.exists()) {
        setLesson({ id: docSnap.id, ...docSnap.data() } as SavedLesson);
      } else {
        setError("Lesson not found");
      }
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, `saved_lessons/${lessonId}`);
      setError("Failed to load lesson");
    });

    const resourcesQuery = query(
      collection(db, 'lesson_resources_new'), 
      where('lesson_id', '==', lessonId),
      where('createdBy', '==', auth.currentUser?.uid)
    );

    const unsubscribeResources = onSnapshot(resourcesQuery, (snap) => {
      const resData = snap.docs.map(d => ({ id: d.id, ...d.data() } as LessonResourceNew));
      setResources(resData);
      setLoading(false);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'lesson_resources_new');
      setError("Failed to load resources");
      setLoading(false);
    });

    return () => {
      unsubscribeLesson();
      unsubscribeResources();
    };
  }, [lessonId, auth.currentUser]);

  useEffect(() => {
    if (lesson && resources.length === 0 && !generating) {
      setGenerating(true);
      lessonDeliveryService.generateMissingResources(lesson)
        .finally(() => setGenerating(false));
    }
  }, [lesson, resources.length]);

  const handleEditResource = async (id: string, content: any) => {
    setIsSaving(true);
    try {
      await lessonDeliveryService.updateResource(id, { content });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `lesson_resources_new/${id}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRegenerate = async (type: LessonResourceType) => {
    if (!lesson) return;
    setGenerating(true);
    try {
      await lessonDeliveryService.generateResource(lesson, type);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'lesson_resources_new');
    } finally {
      setGenerating(false);
    }
  };

  const handleExportPDF = () => {
    window.print();
  };

  const handleExportWord = () => {
    if (!lesson) return;
    exportSavedLessonToWord(lesson, resources);
  };

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = sectionRefs.current[sectionId];
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Loading your lesson command center...</p>
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Oops! Something went wrong</h2>
          <p className="text-gray-500 mb-6">{error || "We couldn't find the lesson you're looking for."}</p>
          <button 
            onClick={onBack}
            className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all"
          >
            Go Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <TopControlBar 
        lesson={lesson}
        onBack={onBack}
        onPresent={() => setShowPresentation(true)}
        onTeachNow={() => setShowTeachNow(true)}
        onDownloadPDF={handleExportPDF}
        onDownloadWord={handleExportWord}
        isStudentMode={isStudentMode}
        onToggleStudentMode={() => setIsStudentMode(!isStudentMode)}
        isSaving={isSaving}
      />

      <div className="flex-1 max-w-7xl mx-auto w-full px-6 py-8 flex gap-8">
        {/* Left Sidebar */}
        <div className="hidden lg:block">
          <LeftTeachingSidebar 
            activeSection={activeSection}
            onSectionClick={scrollToSection}
            completionStatus={{}}
          />
        </div>

        {/* Main Workspace */}
        <div className="flex-1 space-y-8 pb-24">
          {/* Quick Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-indigo-50 rounded-lg">
                  <Target className="w-4 h-4 text-indigo-600" />
                </div>
                <h4 className="font-bold text-gray-900 text-sm">Learning Objectives</h4>
              </div>
              <ul className="space-y-2">
                {lesson.objectives?.slice(0, 3).map((obj, i) => (
                  <li key={i} className="text-xs text-gray-600 flex gap-2">
                    <span className="text-indigo-400 font-bold">•</span>
                    {obj}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-emerald-50 rounded-lg">
                  <BookOpen className="w-4 h-4 text-emerald-600" />
                </div>
                <h4 className="font-bold text-gray-900 text-sm">Key Vocabulary</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {lesson.key_vocabulary?.map((vocab, i) => (
                  <span key={i} className="px-2 py-1 bg-gray-100 text-gray-600 text-[10px] font-bold rounded-md uppercase tracking-wider">
                    {vocab}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-amber-50 rounded-lg">
                  <ListChecks className="w-4 h-4 text-amber-600" />
                </div>
                <h4 className="font-bold text-gray-900 text-sm">Prep Checklist</h4>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <div className="w-4 h-4 rounded border border-gray-300" />
                  <span>Visual aids ready</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <div className="w-4 h-4 rounded border border-gray-300" />
                  <span>Worksheets printed</span>
                </div>
              </div>
            </div>
          </div>

          {/* Resources Sections */}
          <div className="space-y-6">
            {generating && resources.length === 0 && (
              <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-8 text-center">
                <Sparkles className="w-8 h-8 text-indigo-600 mx-auto mb-4 animate-pulse" />
                <h3 className="text-lg font-bold text-indigo-900 mb-2">AI is Crafting Your Lesson Resources</h3>
                <p className="text-indigo-600 text-sm max-w-md mx-auto">
                  We're generating your teacher script, board plan, visual aids, and more. This will take just a few moments...
                </p>
                <div className="mt-6 flex justify-center gap-2">
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}

            {resources.map((resource) => (
              <div 
                key={resource.id} 
                ref={el => { sectionRefs.current[resource.resource_type] = el; }}
                className="scroll-mt-28"
              >
                <LessonSectionCard 
                  resource={resource}
                  onEdit={handleEditResource}
                  onRegenerate={handleRegenerate}
                  isStudentMode={isStudentMode}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel (Optional/Contextual) */}
        <div className="hidden xl:block w-80 space-y-6">
          <div className="bg-indigo-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold uppercase tracking-wider text-xs">Teaching Tip</h3>
              </div>
              <p className="text-sm text-indigo-100 leading-relaxed italic mb-6">
                "Try using the 'Think-Pair-Share' technique when introducing the parts of the eye to increase engagement."
              </p>
              <button className="w-full py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold transition-all border border-white/20">
                Get More Tips
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4 text-sm">Curriculum Alignment</h3>
            <div className="space-y-4">
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Strand</span>
                <p className="text-xs font-bold text-gray-700 mt-1">Life Processes & Living Things</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Outcome</span>
                <p className="text-xs font-bold text-gray-700 mt-1">Identify and describe the functions of the human eye.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Teach Now Assistant */}
      <AnimatePresence>
        {showTeachNow && (
          <TeachNowAssistant 
            lesson={lesson}
            resources={resources}
            onClose={() => setShowTeachNow(false)}
          />
        )}
      </AnimatePresence>

      {/* Presentation Mode Overlay */}
      <AnimatePresence>
        {showPresentation && (
          <PresentationMode 
            lesson={lesson}
            resources={resources}
            onClose={() => setShowPresentation(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
