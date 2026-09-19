import React, { useState, useEffect, useRef } from 'react';
import { 
  Presentation, 
  Download, 
  RefreshCw, 
  Edit3, 
  Maximize2, 
  Minimize2, 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  Plus, 
  Trash2, 
  Sparkles, 
  FileText, 
  Sliders, 
  HelpCircle,
  Eye,
  Layers,
  MessageSquare,
  AlertCircle,
  Palette
} from 'lucide-react';
import { PowerPointPresentation, PowerPointSlide, PowerPointSlideType } from '../types';
import { exportPresentationToPPTX, buildDeterministicPowerPoint, getThemeColors, getThemeForSubject } from '../lib/powerpointService';
import { Button, Card, Badge } from './ui';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface PowerPointManagerProps {
  presentation?: PowerPointPresentation | null;
  lesson: any;
  onUpdatePresentation: (updated: PowerPointPresentation) => void;
  onRebuildPresentation?: () => Promise<void>;
  isRebuilding?: boolean;
}

export const PowerPointManager: React.FC<PowerPointManagerProps> = ({
  presentation: initialPresentation,
  lesson,
  onUpdatePresentation,
  onRebuildPresentation,
  isRebuilding = false
}) => {
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showNotes, setShowNotes] = useState(true);
  const [selectedTheme, setSelectedTheme] = useState<PowerPointPresentation['theme']>(
    initialPresentation?.theme || getThemeForSubject(lesson?.subject)
  );
  const [localRebuilding, setLocalRebuilding] = useState(false);
  const [editSlideData, setEditSlideData] = useState<PowerPointSlide | null>(null);

  // Fallback / Auto-guarantee presentation exists
  const presentation: PowerPointPresentation = React.useMemo(() => {
    if (initialPresentation && Array.isArray(initialPresentation.slides) && initialPresentation.slides.length > 0) {
      return {
        ...initialPresentation,
        theme: selectedTheme || initialPresentation.theme || getThemeForSubject(lesson?.subject)
      };
    }
    return buildDeterministicPowerPoint(lesson);
  }, [initialPresentation, lesson, selectedTheme]);

  const currentSlide = presentation.slides[activeSlideIndex] || presentation.slides[0];
  const colors = getThemeColors(presentation.theme || 'modern_indigo');

  useEffect(() => {
    if (currentSlide) {
      setEditSlideData({ ...currentSlide });
    }
  }, [activeSlideIndex, currentSlide]);

  // Fullscreen keyboard listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        nextSlide();
      } else if (e.key === 'ArrowLeft') {
        prevSlide();
      } else if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      } else if (e.key.toLowerCase() === 'n') {
        setShowNotes(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeSlideIndex, presentation.slides.length, isFullscreen]);

  const nextSlide = () => {
    if (activeSlideIndex < presentation.slides.length - 1) {
      setActiveSlideIndex(prev => prev + 1);
    }
  };

  const prevSlide = () => {
    if (activeSlideIndex > 0) {
      setActiveSlideIndex(prev => prev - 1);
    }
  };

  const handleDownloadPPTX = async () => {
    setIsDownloading(true);
    try {
      await exportPresentationToPPTX(presentation);
    } catch (err) {
      console.error('Failed to export PPTX:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleTriggerRebuild = async () => {
    setLocalRebuilding(true);
    try {
      if (onRebuildPresentation) {
        await onRebuildPresentation();
      } else {
        const rebuilt = buildDeterministicPowerPoint(lesson);
        onUpdatePresentation(rebuilt);
      }
    } catch (err) {
      console.error('Error rebuilding presentation:', err);
    } finally {
      setLocalRebuilding(false);
    }
  };

  const handleSaveSlideEdits = () => {
    if (!editSlideData) return;
    const updatedSlides = [...presentation.slides];
    updatedSlides[activeSlideIndex] = editSlideData;
    const updatedPres: PowerPointPresentation = {
      ...presentation,
      slides: updatedSlides,
      isCustomized: true
    };
    onUpdatePresentation(updatedPres);
    setIsEditing(false);
  };

  const handleThemeChange = (newTheme: PowerPointPresentation['theme']) => {
    setSelectedTheme(newTheme);
    const updatedPres: PowerPointPresentation = {
      ...presentation,
      theme: newTheme
    };
    onUpdatePresentation(updatedPres);
  };

  const handleAddBullet = () => {
    if (!editSlideData) return;
    setEditSlideData({
      ...editSlideData,
      bullets: [...editSlideData.bullets, 'New point or instruction']
    });
  };

  const handleUpdateBullet = (idx: number, val: string) => {
    if (!editSlideData) return;
    const newBullets = [...editSlideData.bullets];
    newBullets[idx] = val;
    setEditSlideData({
      ...editSlideData,
      bullets: newBullets
    });
  };

  const handleRemoveBullet = (idx: number) => {
    if (!editSlideData) return;
    const newBullets = editSlideData.bullets.filter((_, i) => i !== idx);
    setEditSlideData({
      ...editSlideData,
      bullets: newBullets
    });
  };

  const rebuildingState = isRebuilding || localRebuilding;

  return (
    <div className="space-y-6 w-full min-w-0">
      {/* Top Controls Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <Presentation className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black text-gray-900 tracking-tight">
                {presentation.title || 'Lesson PowerPoint Presentation'}
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-100">
                {presentation.slides.length} Slides
              </span>
              {presentation.isCustomized && (
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                  Customized
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500">
              Grade: {presentation.grade} • Subject: {presentation.subject} • Topic: {presentation.topic}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Theme Switcher */}
          <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl p-1 gap-1">
            <Palette className="w-3.5 h-3.5 text-gray-400 ml-1.5" />
            <button
              onClick={() => handleThemeChange('modern_indigo')}
              className={cn(
                "px-2 py-1 rounded-lg text-[11px] font-bold transition-all",
                presentation.theme === 'modern_indigo' ? "bg-indigo-600 text-white shadow-xs" : "text-gray-600 hover:text-gray-900"
              )}
              title="Modern Indigo Theme"
            >
              Indigo
            </button>
            <button
              onClick={() => handleThemeChange('emerald_nature')}
              className={cn(
                "px-2 py-1 rounded-lg text-[11px] font-bold transition-all",
                presentation.theme === 'emerald_nature' ? "bg-emerald-600 text-white shadow-xs" : "text-gray-600 hover:text-gray-900"
              )}
              title="Emerald Nature Theme"
            >
              Emerald
            </button>
            <button
              onClick={() => handleThemeChange('warm_amber')}
              className={cn(
                "px-2 py-1 rounded-lg text-[11px] font-bold transition-all",
                presentation.theme === 'warm_amber' ? "bg-amber-600 text-white shadow-xs" : "text-gray-600 hover:text-gray-900"
              )}
              title="Warm Amber Theme"
            >
              Amber
            </button>
            <button
              onClick={() => handleThemeChange('deep_ocean')}
              className={cn(
                "px-2 py-1 rounded-lg text-[11px] font-bold transition-all",
                presentation.theme === 'deep_ocean' ? "bg-sky-600 text-white shadow-xs" : "text-gray-600 hover:text-gray-900"
              )}
              title="Deep Ocean Theme"
            >
              Ocean
            </button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
            className={cn("h-10 text-xs font-bold rounded-xl", isEditing && "border-indigo-600 text-indigo-600 bg-indigo-50")}
          >
            <Edit3 className="w-3.5 h-3.5 mr-1.5" />
            {isEditing ? 'Close Editor' : 'Edit Presentation'}
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleTriggerRebuild}
            disabled={rebuildingState}
            className="h-10 text-xs font-bold rounded-xl"
            title="Rebuild slides from latest lesson content"
          >
            <RefreshCw className={cn("w-3.5 h-3.5 mr-1.5", rebuildingState && "animate-spin text-indigo-600")} />
            {rebuildingState ? 'Rebuilding...' : 'Rebuild Presentation'}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadPPTX}
            disabled={isDownloading}
            className="h-10 text-xs font-bold rounded-xl border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
            title="Download true Microsoft PowerPoint (.pptx) file"
          >
            <Download className="w-3.5 h-3.5 mr-1.5" />
            {isDownloading ? 'Exporting...' : 'Download (.pptx)'}
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsFullscreen(true)}
            className="h-10 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200"
          >
            <Maximize2 className="w-3.5 h-3.5 mr-1.5" />
            Present / Teach Mode
          </Button>
        </div>
      </div>

      {/* Main Slide Viewer / Editor Area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left 3 Cols: Active Slide Stage */}
        <div className="lg:col-span-3 space-y-4">
          {/* 16:9 Aspect Ratio Slide Stage */}
          <div className="relative w-full aspect-video bg-white rounded-2xl border-2 border-gray-200 shadow-lg overflow-hidden flex flex-col justify-between select-none">
            {/* Slide Header Banner */}
            <div 
              className="px-6 py-4 flex items-center justify-between border-b"
              style={{ 
                backgroundColor: currentSlide.slideType === 'title' ? `#${colors.primary}` : `#${colors.primary}`,
                borderColor: `#${colors.primary}`
              }}
            >
              <div className="flex items-center gap-3">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-white/20 text-white">
                  {currentSlide.slideType.replace(/_/g, ' ')}
                </span>
                <span className="text-xs font-bold text-white/80">
                  Slide {activeSlideIndex + 1} of {presentation.slides.length}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-medium text-white/90">
                  {presentation.subject} • {presentation.grade}
                </span>
              </div>
            </div>

            {/* Slide Body */}
            <div className="flex-1 p-6 md:p-8 flex flex-col justify-center overflow-y-auto bg-slate-50/50">
              {currentSlide.slideType === 'title' ? (
                /* Cover Slide Layout */
                <div className="space-y-4 text-center my-auto">
                  <div className="inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest bg-indigo-100 text-indigo-800">
                    {presentation.subject}
                  </div>
                  <h1 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tight leading-tight">
                    {currentSlide.title}
                  </h1>
                  {currentSlide.subtitle && (
                    <p className="text-lg md:text-xl font-semibold text-gray-600">
                      {currentSlide.subtitle}
                    </p>
                  )}
                  <div className="pt-4 flex flex-wrap justify-center gap-3">
                    {currentSlide.bullets.map((b, idx) => (
                      <span key={idx} className="px-3.5 py-1.5 bg-white border border-gray-200 rounded-xl text-xs font-medium text-gray-700 shadow-xs">
                        {b}
                      </span>
                    ))}
                  </div>
                </div>
              ) : currentSlide.slideType === 'key_concepts' && currentSlide.keyTerms && currentSlide.keyTerms.length > 0 ? (
                /* Vocabulary Grid Layout */
                <div className="space-y-4">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">
                      {currentSlide.title}
                    </h2>
                    {currentSlide.subtitle && (
                      <p className="text-sm font-medium text-gray-500">{currentSlide.subtitle}</p>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {currentSlide.keyTerms.map((term, idx) => (
                      <div key={idx} className="p-4 bg-white border border-gray-200 rounded-xl shadow-xs">
                        <span className="text-xs font-black uppercase tracking-wider text-indigo-600 block mb-1">
                          {term.term}
                        </span>
                        <p className="text-xs text-gray-700 leading-relaxed">{term.definition}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : currentSlide.diagramText ? (
                /* Side-by-Side Diagram Layout */
                <div className="space-y-4">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">
                      {currentSlide.title}
                    </h2>
                    {currentSlide.subtitle && (
                      <p className="text-sm font-medium text-gray-500">{currentSlide.subtitle}</p>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
                    <div className="space-y-2.5 p-4 bg-white border border-gray-200 rounded-xl shadow-xs">
                      {currentSlide.bullets.map((b, idx) => (
                        <div key={idx} className="flex items-start gap-2.5 text-xs md:text-sm text-gray-800 leading-relaxed font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-2 shrink-0" />
                          <span>{b}</span>
                        </div>
                      ))}
                    </div>
                    <div className="p-4 bg-slate-900 text-emerald-400 font-mono text-xs rounded-xl shadow-inner whitespace-pre overflow-x-auto flex items-center justify-center">
                      {currentSlide.diagramText}
                    </div>
                  </div>
                </div>
              ) : (
                /* Standard Bullet List Slide */
                <div className="space-y-4">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">
                      {currentSlide.title}
                    </h2>
                    {currentSlide.subtitle && (
                      <p className="text-sm font-medium text-gray-500">{currentSlide.subtitle}</p>
                    )}
                  </div>
                  <div className="space-y-3 bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
                    {currentSlide.bullets.map((b, idx) => (
                      <div key={idx} className="flex items-start gap-3 text-sm md:text-base text-gray-800 font-medium leading-relaxed">
                        <span className="w-2 h-2 rounded-full bg-indigo-600 mt-2 shrink-0" />
                        <span>{b}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Slide Footer Navigation */}
            <div className="px-6 py-3 bg-white border-t border-gray-200 flex items-center justify-between">
              <span className="text-xs text-gray-400 font-medium truncate max-w-xs">
                {presentation.topic}
              </span>
              <div className="flex items-center gap-3">
                <button
                  onClick={prevSlide}
                  disabled={activeSlideIndex === 0}
                  className="p-1.5 text-gray-500 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100 rounded-lg transition-all"
                  title="Previous Slide"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-xs font-bold text-gray-700 min-w-[50px] text-center">
                  {activeSlideIndex + 1} / {presentation.slides.length}
                </span>
                <button
                  onClick={nextSlide}
                  disabled={activeSlideIndex === presentation.slides.length - 1}
                  className="p-1.5 text-gray-500 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100 rounded-lg transition-all"
                  title="Next Slide"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Teacher Speaker Notes Card */}
          <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase tracking-wider">
                <MessageSquare className="w-4 h-4 text-amber-600" />
                <span>Teacher Script & Projection Notes</span>
              </div>
              <button
                onClick={() => setShowNotes(!showNotes)}
                className="text-[11px] text-amber-700 font-bold hover:underline"
              >
                {showNotes ? 'Collapse' : 'Expand'}
              </button>
            </div>
            {showNotes && (
              <p className="text-xs text-amber-900 leading-relaxed">
                {currentSlide.teacherPromptOrNotes || 'Explain this slide clearly and check for student understanding before advancing.'}
              </p>
            )}
          </div>
        </div>

        {/* Right Col: Slide Thumbnails / Filmstrip & Editor */}
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700">
              <Layers className="w-4 h-4 text-indigo-600" />
              <span>Slide Deck ({presentation.slides.length})</span>
            </div>
          </div>

          {/* Thumbnails List */}
          <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1 no-scrollbar">
            {presentation.slides.map((slide, idx) => (
              <button
                key={slide.id || idx}
                onClick={() => setActiveSlideIndex(idx)}
                className={cn(
                  "w-full text-left p-3 rounded-xl border transition-all flex items-start gap-2.5",
                  activeSlideIndex === idx
                    ? "bg-indigo-50/80 border-indigo-500 shadow-sm"
                    : "bg-white border-gray-200 hover:bg-gray-50 text-gray-600"
                )}
              >
                <span className={cn(
                  "w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5",
                  activeSlideIndex === idx ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-500"
                )}>
                  {idx + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className={cn(
                    "text-xs font-bold truncate",
                    activeSlideIndex === idx ? "text-indigo-900" : "text-gray-800"
                  )}>
                    {slide.title}
                  </p>
                  <p className="text-[10px] text-gray-400 capitalize">
                    {slide.slideType.replace(/_/g, ' ')}
                  </p>
                </div>
              </button>
            ))}
          </div>

          {/* Quick Help Card */}
          <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl text-[11px] text-indigo-900 space-y-1">
            <p className="font-bold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              Classroom Tip
            </p>
            <p className="text-indigo-700 leading-snug">
              Use <strong>Teach Mode</strong> for distraction-free full-screen projection. Press <strong>Space</strong> or <strong>Right Arrow</strong> to step through slides.
            </p>
          </div>
        </div>
      </div>

      {/* Slide Editor Modal / Drawer */}
      {isEditing && editSlideData && (
        <Card className="p-6 border-indigo-200 bg-indigo-50/30 space-y-4">
          <div className="flex items-center justify-between border-b border-indigo-100 pb-3">
            <h4 className="font-bold text-gray-900 text-sm flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-indigo-600" />
              Edit Slide {activeSlideIndex + 1}: {editSlideData.title}
            </h4>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button size="sm" variant="primary" onClick={handleSaveSlideEdits}>
                <Check className="w-3.5 h-3.5 mr-1" />
                Save Changes
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-gray-500">Slide Title</label>
              <input
                type="text"
                value={editSlideData.title}
                onChange={(e) => setEditSlideData({ ...editSlideData, title: e.target.value })}
                className="w-full text-xs px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-hidden focus:border-indigo-600"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-gray-500">Slide Subtitle</label>
              <input
                type="text"
                value={editSlideData.subtitle || ''}
                onChange={(e) => setEditSlideData({ ...editSlideData, subtitle: e.target.value })}
                className="w-full text-xs px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-hidden focus:border-indigo-600"
              />
            </div>
          </div>

          {/* Bullet Points */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black uppercase tracking-wider text-gray-500">Bullet Points</label>
              <button
                onClick={handleAddBullet}
                className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Point
              </button>
            </div>
            <div className="space-y-2">
              {editSlideData.bullets.map((bullet, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={bullet}
                    onChange={(e) => handleUpdateBullet(idx, e.target.value)}
                    className="flex-1 text-xs px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-hidden focus:border-indigo-600"
                  />
                  <button
                    onClick={() => handleRemoveBullet(idx)}
                    className="p-2 text-gray-400 hover:text-rose-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Teacher Prompt Notes */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-wider text-gray-500">Teacher Notes / Talking Points</label>
            <textarea
              rows={2}
              value={editSlideData.teacherPromptOrNotes || ''}
              onChange={(e) => setEditSlideData({ ...editSlideData, teacherPromptOrNotes: e.target.value })}
              className="w-full text-xs px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-hidden focus:border-indigo-600"
              placeholder="What to say or check during this slide..."
            />
          </div>
        </Card>
      )}

      {/* Fullscreen Present / Teach Mode Overlay */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950 flex flex-col justify-between p-6 md:p-12 text-white"
          >
            {/* Top Toolbar */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-xs font-bold uppercase tracking-wider border border-indigo-500/30">
                  {currentSlide.slideType.replace(/_/g, ' ')}
                </span>
                <span className="text-sm font-semibold text-white/70">
                  {presentation.title} • Slide {activeSlideIndex + 1} of {presentation.slides.length}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowNotes(!showNotes)}
                  className="bg-white/10 text-white border-white/20 hover:bg-white/20 text-xs rounded-xl"
                >
                  <MessageSquare className="w-4 h-4 mr-1.5" />
                  {showNotes ? 'Hide Notes' : 'Show Notes'}
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setIsFullscreen(false)}
                  className="bg-white text-gray-900 hover:bg-gray-100 text-xs rounded-xl font-bold"
                >
                  <Minimize2 className="w-4 h-4 mr-1.5" />
                  Exit Fullscreen (Esc)
                </Button>
              </div>
            </div>

            {/* Center Presentation Stage */}
            <div className="flex-1 flex flex-col justify-center max-w-5xl mx-auto w-full my-auto px-4 py-8">
              {currentSlide.slideType === 'title' ? (
                <div className="text-center space-y-6">
                  <span className="px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-widest bg-indigo-600 text-white inline-block">
                    {presentation.subject}
                  </span>
                  <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-tight">
                    {currentSlide.title}
                  </h1>
                  {currentSlide.subtitle && (
                    <p className="text-xl md:text-2xl text-indigo-200 font-medium">
                      {currentSlide.subtitle}
                    </p>
                  )}
                  <div className="pt-6 flex flex-wrap justify-center gap-3">
                    {currentSlide.bullets.map((b, idx) => (
                      <span key={idx} className="px-4 py-2 bg-white/10 backdrop-blur-xs border border-white/15 rounded-xl text-sm font-medium text-white">
                        {b}
                      </span>
                    ))}
                  </div>
                </div>
              ) : currentSlide.slideType === 'key_concepts' && currentSlide.keyTerms && currentSlide.keyTerms.length > 0 ? (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">
                      {currentSlide.title}
                    </h2>
                    {currentSlide.subtitle && (
                      <p className="text-lg text-indigo-300 mt-1">{currentSlide.subtitle}</p>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentSlide.keyTerms.map((t, idx) => (
                      <div key={idx} className="p-5 bg-white/10 backdrop-blur-xs border border-white/15 rounded-2xl">
                        <span className="text-sm font-black uppercase tracking-wider text-indigo-300 block mb-2">
                          {t.term}
                        </span>
                        <p className="text-sm md:text-base text-white/90 leading-relaxed">{t.definition}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : currentSlide.diagramText ? (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">
                      {currentSlide.title}
                    </h2>
                    {currentSlide.subtitle && (
                      <p className="text-lg text-indigo-300 mt-1">{currentSlide.subtitle}</p>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                    <div className="space-y-4 p-6 bg-white/10 backdrop-blur-xs border border-white/15 rounded-2xl">
                      {currentSlide.bullets.map((b, idx) => (
                        <div key={idx} className="flex items-start gap-3 text-base md:text-lg text-white font-medium leading-relaxed">
                          <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 mt-2 shrink-0" />
                          <span>{b}</span>
                        </div>
                      ))}
                    </div>
                    <div className="p-6 bg-black/60 border border-emerald-500/40 text-emerald-400 font-mono text-sm rounded-2xl shadow-inner whitespace-pre overflow-x-auto flex items-center justify-center">
                      {currentSlide.diagramText}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">
                      {currentSlide.title}
                    </h2>
                    {currentSlide.subtitle && (
                      <p className="text-lg text-indigo-300 mt-1">{currentSlide.subtitle}</p>
                    )}
                  </div>
                  <div className="space-y-4 bg-white/10 backdrop-blur-xs p-6 md:p-8 rounded-2xl border border-white/15">
                    {currentSlide.bullets.map((b, idx) => (
                      <div key={idx} className="flex items-start gap-4 text-base md:text-xl text-white font-medium leading-relaxed">
                        <span className="w-3 h-3 rounded-full bg-indigo-400 mt-2 shrink-0" />
                        <span>{b}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Controls */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-between">
              <span className="text-xs text-white/50">
                Tip: Use Left/Right Arrow keys or Spacebar to navigate
              </span>
              <div className="flex items-center gap-4">
                <button
                  onClick={prevSlide}
                  disabled={activeSlideIndex === 0}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 disabled:opacity-30 rounded-xl text-xs font-bold transition-all"
                >
                  Previous
                </button>
                <span className="text-sm font-bold text-white">
                  {activeSlideIndex + 1} / {presentation.slides.length}
                </span>
                <button
                  onClick={nextSlide}
                  disabled={activeSlideIndex === presentation.slides.length - 1}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-30 rounded-xl text-xs font-bold transition-all"
                >
                  Next
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
