import React, { useState, useEffect } from 'react';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Maximize2, 
  Minimize2,
  Presentation,
  Layout,
  MessageSquare,
  List,
  Target,
  Image as ImageIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import { SavedLesson, LessonResourceNew } from '../../../types';
import { cn } from '../../../lib/utils';

interface PresentationModeProps {
  lesson: SavedLesson;
  resources: LessonResourceNew[];
  onClose: () => void;
}

export const PresentationMode: React.FC<PresentationModeProps> = ({ lesson, resources, onClose }) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Process resources into slides
  const slides = React.useMemo(() => {
    const allSlides: any[] = [];

    // Slide 1: Title + Overview
    allSlides.push({
      id: 'slide-1',
      title: 'Lesson Overview',
      type: 'overview',
      data: {
        title: lesson.title,
        topic: lesson.topic,
        sub_topic: lesson.sub_topic,
        grade: lesson.class_id,
        subject: lesson.subject,
        duration: lesson.duration
      }
    });

    // Slide 2: Learning Outcomes
    if (lesson.learning_outcomes && lesson.learning_outcomes.length > 0) {
      allSlides.push({
        id: 'slide-2',
        title: 'Learning Outcomes',
        type: 'list',
        header: 'Expected Outcomes',
        icon: <Target className="w-8 h-8 text-blue-600" />,
        items: lesson.learning_outcomes
      });
    }

    // Slide 3: Objectives
    if (lesson.objectives && lesson.objectives.length > 0) {
      allSlides.push({
        id: 'slide-3',
        title: 'Lesson Objectives',
        type: 'list',
        header: 'Today\'s Objectives',
        icon: <Layout className="w-8 h-8 text-indigo-600" />,
        items: lesson.objectives
      });
    }

    // Process additional resources
    resources.forEach(res => {
      if (typeof res.content === 'string') {
        // Split long markdown content by headers if needed, otherwise one slide per resource
        const sections = res.content.split(/^#+\s+/m).filter(Boolean);
        if (sections.length > 1) {
          sections.forEach((section, idx) => {
            const lines = section.split('\n');
            const title = lines[0].trim();
            const content = lines.slice(1).join('\n').trim();
            if (content) {
              allSlides.push({
                id: `${res.id}-${idx}`,
                title: title || res.title,
                type: 'markdown',
                content: content
              });
            }
          });
        } else {
          allSlides.push({
            id: res.id,
            title: res.title,
            type: 'markdown',
            content: res.content
          });
        }
      } else if (typeof res.content === 'object' && res.content !== null) {
        // For JSON objects, create one slide per major section or group them
        const keys = Object.keys(res.content).filter(k => k !== 'title' && k !== 'id');
        
        // If it's a structured pack, handle it specially
        if (res.resource_type === 'board_plan' || res.resource_type === 'lesson_plan') {
          keys.forEach(key => {
            const value = res.content[key];
            if (value && (typeof value === 'object' || (typeof value === 'string' && value.length > 20))) {
              allSlides.push({
                id: `${res.id}-${key}`,
                title: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                type: 'formatted-data',
                category: res.title,
                data: { [key]: value }
              });
            }
          });
        } else {
          // Standard object treatment
          allSlides.push({
            id: res.id,
            title: res.title,
            type: 'formatted-data',
            data: res.content
          });
        }
      }
    });

    return allSlides;
  }, [lesson, resources]);

  const currentSlide = slides[currentSlideIndex];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        nextSlide();
      } else if (e.key === 'ArrowLeft') {
        prevSlide();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlideIndex, slides.length]);

  const nextSlide = () => {
    if (currentSlideIndex < slides.length - 1) {
      setCurrentSlideIndex(currentSlideIndex + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(currentSlideIndex - 1);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  const renderSlideContent = () => {
    if (!currentSlide) return null;

    if (currentSlide.type === 'overview') {
      const { title, topic, sub_topic, grade, subject, duration } = currentSlide.data;
      return (
        <div className="flex flex-col items-center justify-center h-full px-12 py-16 text-center select-none">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-6xl space-y-12"
          >
            <div className="space-y-4">
              <h2 className="text-3xl font-black text-indigo-600 uppercase tracking-[0.3em]">
                {topic}
              </h2>
              {sub_topic && (
                <p className="text-2xl text-gray-400 font-bold uppercase tracking-wider italic">
                  {sub_topic}
                </p>
              )}
            </div>

            <div className="space-y-6">
              <h1 className="text-8xl md:text-[10rem] font-black text-gray-900 leading-[0.9] tracking-tighter">
                {title}
              </h1>
            </div>

            <div className="flex items-center justify-center gap-6 pt-12">
              <div className="flex items-center gap-3 px-8 py-4 bg-indigo-50 border-4 border-indigo-600 rounded-[2rem] text-indigo-700 font-black text-2xl shadow-[8px_8px_0px_0px_rgba(79,70,229,0.2)]">
                <Layout className="w-8 h-8" />
                {subject}
              </div>
              <div className="flex items-center gap-3 px-8 py-4 bg-amber-50 border-4 border-amber-500 rounded-[2rem] text-amber-700 font-black text-2xl shadow-[8px_8px_0px_0px_rgba(245,158,11,0.2)]">
                <Target className="w-8 h-8" />
                 {grade}
              </div>
              {duration && (
                <div className="flex items-center gap-3 px-8 py-4 bg-emerald-50 border-4 border-emerald-500 rounded-[2rem] text-emerald-700 font-black text-2xl shadow-[8px_8px_0px_0px_rgba(16,185,129,0.2)]">
                  <span className="w-8 h-8 flex items-center justify-center">⏱️</span>
                  {duration}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      );
    }

    if (currentSlide.type === 'list') {
      return (
        <div className="h-full flex flex-col px-16 py-20 select-none">
          <div className="max-w-6xl mx-auto w-full flex-1 flex flex-col">
            <div className="mb-16 pb-8 border-b-8 border-gray-900 flex items-center gap-6">
              <div className="p-5 bg-white border-4 border-gray-900 rounded-[2rem] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                {currentSlide.icon}
              </div>
              <h2 className="text-7xl font-black text-gray-900 uppercase tracking-tighter">
                {currentSlide.header}
              </h2>
            </div>

            <div className="flex-1 flex flex-col justify-center">
              <div className="grid grid-cols-1 gap-8">
                {currentSlide.items.map((item: string, i: number) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex gap-8 p-8 bg-white border-4 border-gray-100 rounded-[3rem] shadow-xl shadow-indigo-500/5 hover:border-indigo-100 transition-colors"
                  >
                    <div className="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center text-white text-3xl font-black shrink-0">
                      {i + 1}
                    </div>
                    <p className="text-4xl text-gray-800 font-bold leading-tight flex-1 flex items-center">
                      {item}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    }

    const renderFormattedValue = (key: string, value: any) => {
      // Check if this appears to be a list of assessment items
      if (key === 'assessment_items' && Array.isArray(value)) {
        return (
          <div className="grid grid-cols-1 gap-8">
            {value.map((item, i) => (
              <div key={i} className="p-10 bg-white border-4 border-gray-100 rounded-[3rem] shadow-xl space-y-6">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex gap-6 items-start">
                    <div className="w-16 h-16 rounded-full bg-indigo-600 text-white flex items-center justify-center text-3xl font-black shrink-0">
                      {i + 1}
                    </div>
                    <h5 className="text-4xl font-black text-gray-900 leading-tight pt-2">
                       {item.question}
                    </h5>
                  </div>
                  {item.points && (
                    <div className="px-6 py-2 bg-indigo-50 text-indigo-700 rounded-2xl text-xl font-black border-2 border-indigo-100">
                      {item.points} PTS
                    </div>
                  )}
                </div>

                <div className="ml-24 space-y-6">
                  {(item.type === 'multiple_choice' || item.options) && (
                    <div className="grid grid-cols-1 gap-4">
                      {item.options?.map((opt: string, j: number) => (
                        <div key={j} className="flex gap-6 items-center p-6 bg-gray-50 border-2 border-transparent rounded-3xl">
                           <div className="w-8 h-8 rounded-full border-4 border-gray-300 flex-shrink-0" />
                           <span className="text-3xl font-bold text-gray-700">{opt}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {item.type === 'true_false' && (
                    <div className="flex gap-8">
                       <div className="flex-1 p-8 border-4 border-gray-100 rounded-3xl text-3xl font-black text-gray-400 text-center uppercase tracking-widest">True</div>
                       <div className="flex-1 p-8 border-4 border-gray-100 rounded-3xl text-3xl font-black text-gray-400 text-center uppercase tracking-widest">False</div>
                    </div>
                  )}
                  {item.answer && (
                    <div className="p-6 bg-emerald-50 border-2 border-emerald-100 rounded-3xl flex gap-4 items-center">
                      <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-black text-xl">✓</div>
                      <span className="text-2xl font-bold text-emerald-800">Answer: {item.answer}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        );
      }

      if (Array.isArray(value)) {
        return (
          <ul className="space-y-6">
            {value.map((v, i) => (
              <li key={i} className="flex gap-4 p-6 bg-white border-2 border-gray-50 rounded-3xl shadow-sm">
                <div className="w-3 h-3 bg-indigo-600 rounded-full mt-4 shrink-0" />
                <span className="text-3xl font-bold text-gray-800 leading-relaxed">
                  {typeof v === 'string' ? v : typeof v === 'object' ? renderFormattedValue('', v) : String(v)}
                </span>
              </li>
            ))}
          </ul>
        );
      }

      if (typeof value === 'object' && value !== null) {
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(value).map(([k, v]) => (
              <div key={k} className="p-8 bg-indigo-50/30 border-2 border-indigo-100/50 rounded-[2.5rem] space-y-3">
                <h5 className="text-xl font-black text-indigo-400 uppercase tracking-widest">
                  {k.replace(/_/g, ' ')}
                </h5>
                <div className="text-2xl font-bold text-gray-900 leading-snug">
                  {typeof v === 'string' ? v : JSON.stringify(v)}
                </div>
              </div>
            ))}
          </div>
        );
      }

      return (
        <div className="p-10 bg-white border-4 border-gray-100 rounded-[3.5rem] text-4xl font-bold text-gray-800 leading-relaxed shadow-xl shadow-gray-200/20">
          {String(value)}
        </div>
      );
    };

    return (
      <div className="h-full flex flex-col px-16 py-20 overflow-hidden select-none">
        <div className="max-w-6xl mx-auto w-full h-full flex flex-col">
          <div className="mb-12 flex items-end justify-between border-b-8 border-gray-900 pb-8">
            <div className="space-y-2">
              <span className="text-xl font-black text-indigo-600 uppercase tracking-[0.4em]">
                {currentSlide.category || currentSlide.type.replace(/_/g, ' ')}
              </span>
              <h2 className="text-7xl font-black text-gray-900 uppercase tracking-tighter leading-none">
                {currentSlide.title}
              </h2>
            </div>
            <div className="bg-gray-900 text-white px-8 py-4 rounded-3xl font-black text-3xl">
              {currentSlideIndex + 1}
            </div>
          </div>

          <div className="flex-1 overflow-hidden">
            {!currentSlide ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-400 font-bold">No slide content available</p>
              </div>
            ) : currentSlide.type === 'markdown' ? (
              <div className="prose prose-[4rem] prose-indigo max-w-none text-gray-800 font-bold leading-relaxed h-full overflow-y-auto no-scrollbar pb-20">
                <Markdown>{currentSlide.content}</Markdown>
              </div>
            ) : (
              <div className="h-full overflow-y-auto no-scrollbar pb-20">
                <div className="grid grid-cols-1 gap-12">
                  {Object.entries(currentSlide.data || {}).map(([key, value]) => {
                    if (key === 'title' || key === 'id') return null;
                    return (
                      <div key={key} className="space-y-6">
                        <h4 className="text-2xl font-black text-indigo-600 uppercase tracking-[0.3em] flex items-center gap-3">
                          <div className="w-8 h-2 bg-indigo-600 rounded-full" />
                          {key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ')}
                        </h4>
                        <div>
                          {renderFormattedValue(key, value)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-white flex flex-col font-sans"
    >
      {/* Top Bar - Minimalist for presentation */}
      <div className="h-20 border-b-2 border-gray-100 px-8 flex items-center justify-between bg-white/80 backdrop-blur-md z-10 shrink-0">
        <div className="flex items-center gap-6">
          <div className="p-3 bg-gray-900 text-white rounded-2xl">
            <Presentation className="w-6 h-6" />
          </div>
          <div>
             <h2 className="font-black text-[10px] uppercase tracking-[0.3em] text-gray-400">Classroom Presentation</h2>
             <p className="font-bold text-gray-900 text-sm tracking-tight">{lesson.title}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center bg-gray-100 px-4 py-2 rounded-xl border border-gray-200">
             <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-3">Navigation</span>
             <div className="flex gap-1">
                <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-[10px] font-bold shadow-sm">←</kbd>
                <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-[10px] font-bold shadow-sm">→</kbd>
                <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-[10px] font-bold shadow-sm">SPACE</kbd>
             </div>
          </div>
          <button 
            onClick={toggleFullscreen}
            className="p-3 hover:bg-gray-100 rounded-2xl transition-all text-gray-500"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>
          <button 
            onClick={onClose}
            className="p-3 hover:bg-rose-600 hover:text-white rounded-2xl transition-all text-gray-900 border-2 border-gray-900"
            title="Exit Presentation"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Slide Canvas */}
      <div className="flex-1 relative overflow-hidden bg-gray-50">
        {/* Background Accents */}
        <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-indigo-50 rounded-full blur-[120px] -mr-32 -mt-32 opacity-50" />
        <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-amber-50 rounded-full blur-[100px] -ml-24 -mb-24 opacity-50" />

        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlideIndex}
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.02, y: -10 }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            className="w-full h-full relative z-10"
          >
            {renderSlideContent()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Controls - Presenter Style */}
      <div className="h-28 px-8 flex items-center justify-between bg-white border-t-4 border-gray-900 shrink-0 z-20">
        <div className="flex items-center gap-6">
          <button 
            onClick={prevSlide}
            disabled={currentSlideIndex === 0}
            className="p-5 rounded-3xl bg-white border-4 border-gray-900 text-gray-900 hover:bg-gray-50 disabled:opacity-20 disabled:grayscale transition-all shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
          
          <div className="flex flex-col items-center min-w-[120px]">
             <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Slide</span>
             <span className="text-3xl font-black text-gray-900">{currentSlideIndex + 1} <span className="text-gray-200">/</span> {slides.length}</span>
          </div>

          <button 
            onClick={nextSlide}
            disabled={currentSlideIndex === slides.length - 1}
            className="p-5 rounded-3xl bg-indigo-600 border-4 border-gray-900 text-white hover:bg-indigo-700 disabled:opacity-20 disabled:grayscale transition-all shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none"
          >
            <ChevronRight className="w-8 h-8" />
          </button>
        </div>

        {/* Slide Shortcuts Mini Menu */}
        <div className="hidden lg:flex items-center gap-3 overflow-x-auto max-w-3xl px-6 py-3 bg-gray-100 rounded-[2rem] border-2 border-gray-200">
          {slides.map((res, i) => (
            <button
              key={res.id}
              onClick={() => setCurrentSlideIndex(i)}
              className={cn(
                "whitespace-nowrap shrink-0 px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all",
                currentSlideIndex === i 
                  ? "bg-gray-900 text-white shadow-lg" 
                  : "text-gray-400 hover:text-gray-600"
              )}
            >
              {res.title.substring(0, 20)}{res.title.length > 20 ? '...' : ''}
            </button>
          ))}
        </div>

        <div className="hidden xl:flex items-center gap-4 bg-amber-50 border-2 border-amber-200 px-6 py-3 rounded-2xl">
           <Layout className="w-5 h-5 text-amber-600" />
           <div className="flex flex-col">
              <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Layout</span>
              <span className="text-xs font-bold text-amber-700">Slide-by-Slide View</span>
           </div>
        </div>
      </div>
    </motion.div>
  );
};
