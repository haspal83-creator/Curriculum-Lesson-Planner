import React, { useState } from 'react';
import { 
  Upload, 
  Search, 
  Filter, 
  Trash2, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Plus,
  Save,
  BookOpen,
  Target,
  ChevronRight,
  Layers,
  Sparkles
} from 'lucide-react';
import { Button, Card, Input, Select } from '../ui';
import { CurriculumEntry, GradeLevel, Subject } from '../../types';
import { motion, AnimatePresence } from 'motion/react';

interface CurriculumViewProps {
  curriculum: CurriculumEntry[];
  onDelete: (id: string) => Promise<void>;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  onSaveManual?: (entry: CurriculumEntry) => Promise<void>;
  isUploading: boolean;
  setActiveTab: (tab: string) => void;
  uploadError: string | null;
  onUseInPlan: (entry: CurriculumEntry) => void;
  onLoadSample?: () => Promise<void>;
}

import { useToasts } from '../../context/ToastContext';

export function CurriculumView({ 
  curriculum, 
  onDelete, 
  onUpload, 
  onSaveManual,
  isUploading, 
  setActiveTab, 
  uploadError,
  onUseInPlan,
  onLoadSample
}: CurriculumViewProps) {
  const { showToast } = useToasts();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGrade, setFilterGrade] = useState<GradeLevel | 'All'>('All');
  const [filterSubject, setFilterSubject] = useState<Subject | 'All'>('All');

  const [newEntry, setNewEntry] = useState<Partial<CurriculumEntry>>({
    grade: 'Standard 1',
    subject: 'Mathematics',
    cycle: 1,
    strand: '',
    topic: '',
    subtopic: '',
    learning_outcomes: [],
    suggestedLessons: 1,
    suggestedWeeks: 1,
    notes: ''
  });

  const handleEdit = (item: CurriculumEntry) => {
    setNewEntry(item);
    setEditingId(item.id!);
    setIsAdding(true);
  };

  const filteredCurriculum = curriculum.filter(item => {
    const matchesSearch = 
      item.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.subtopic.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.strand?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGrade = filterGrade === 'All' || item.grade === filterGrade;
    const matchesSubject = filterSubject === 'All' || item.subject === filterSubject;
    return matchesSearch && matchesGrade && matchesSubject;
  });

  const handleAddEntry = async () => {
    if (!newEntry.topic || !newEntry.learning_outcomes?.length) {
      showToast("Please provide at least a topic and one learning outcome.", "error");
      return;
    }

    const entry: CurriculumEntry = {
      id: editingId || Math.random().toString(36).substr(2, 9),
      grade: newEntry.grade as GradeLevel,
      subject: newEntry.subject as Subject,
      cycle: newEntry.cycle || 1,
      strand: newEntry.strand || '',
      topic: newEntry.topic || '',
      subtopic: newEntry.subtopic || '',
      learning_outcomes: newEntry.learning_outcomes || [],
      suggestedLessons: newEntry.suggestedLessons || 1,
      suggestedWeeks: newEntry.suggestedWeeks || 1,
      notes: newEntry.notes || '',
      createdAt: newEntry.createdAt || new Date().toISOString()
    };

    if (onSaveManual) {
      await onSaveManual(entry);
    }
    setIsAdding(false);
    setEditingId(null);
    setNewEntry({
      grade: 'Standard 1',
      subject: 'Mathematics',
      cycle: 1,
      strand: '',
      topic: '',
      subtopic: '',
      learning_outcomes: [],
      suggestedLessons: 1,
      suggestedWeeks: 1,
      notes: ''
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="space-y-1">
          <h2 className="text-xl font-bold">Curriculum Repository</h2>
          <p className="text-sm text-gray-500">Manage official ministry curriculum strands, topics, and learning outcomes.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={onLoadSample}>
            <Sparkles className="w-4 h-4" />
            Load Sample Data
          </Button>
          <div className="relative">
            <input 
              type="file" 
              ref={fileInputRef}
              className="hidden" 
              accept=".pdf,.docx,.txt,.csv" 
              onChange={onUpload}
              disabled={isUploading}
              multiple
            />
            <Button variant="secondary" onClick={() => fileInputRef.current?.click()} className="cursor-pointer">
              <Upload className="w-4 h-4" />
              Upload Guide
            </Button>
          </div>
          <Button onClick={() => setIsAdding(true)}>
            <Plus className="w-4 h-4" />
            Add Entry
          </Button>
        </div>
      </div>

      {isUploading && (
        <Card className="p-6 bg-indigo-50 border-indigo-100 flex items-center gap-4">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
          <div className="flex-1">
            <p className="font-bold text-indigo-900">Processing Curriculum Guide...</p>
            <p className="text-sm text-indigo-700">AI is extracting structured outcomes, topics, and subtopics.</p>
          </div>
        </Card>
      )}

      {uploadError && (
        <Card className="p-6 bg-red-50 border-red-100 flex items-center gap-4 text-red-700">
          <AlertCircle className="w-6 h-6" />
          <p className="font-medium">{uploadError}</p>
        </Card>
      )}

      <Card className="p-4 flex flex-wrap gap-4 items-center bg-gray-50/50 border-gray-100">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input 
            placeholder="Search topics, strands..." 
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select 
          options={[
            { label: 'All Grades', value: 'All' },
            { label: 'Infant 1', value: 'Infant 1' },
            { label: 'Infant 2', value: 'Infant 2' },
            { label: 'Standard 1', value: 'Standard 1' },
            { label: 'Standard 2', value: 'Standard 2' },
            { label: 'Standard 3', value: 'Standard 3' },
            { label: 'Standard 4', value: 'Standard 4' },
            { label: 'Standard 5', value: 'Standard 5' },
            { label: 'Standard 6', value: 'Standard 6' }
          ]} 
          value={filterGrade} 
          onChange={(val) => setFilterGrade(val as any)} 
          className="w-40"
        />
        <Select 
          options={[
            { label: 'All Subjects', value: 'All' },
            { label: 'Mathematics', value: 'Mathematics' },
            { label: 'Language Arts', value: 'Language Arts' },
            { label: 'Science and Technology', value: 'Science and Technology' },
            { label: 'Belizean Studies', value: 'Belizean Studies' },
            { label: 'HFLE', value: 'HFLE' },
            { label: 'Spanish', value: 'Spanish' },
            { label: 'PE', value: 'PE' },
            { label: 'Creative Arts', value: 'Creative Arts' }
          ]} 
          value={filterSubject} 
          onChange={(val) => setFilterSubject(val as any)} 
          className="w-40"
        />
      </Card>

      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="p-8 space-y-6 border-indigo-100 shadow-lg shadow-indigo-50">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-indigo-600" />
                  New Curriculum Entry
                </h3>
                <Button variant="ghost" size="sm" onClick={() => setIsAdding(false)}>Cancel</Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Grade</label>
                  <Select 
                    options={[
                      { label: 'Infant 1', value: 'Infant 1' },
                      { label: 'Infant 2', value: 'Infant 2' },
                      { label: 'Standard 1', value: 'Standard 1' },
                      { label: 'Standard 2', value: 'Standard 2' },
                      { label: 'Standard 3', value: 'Standard 3' },
                      { label: 'Standard 4', value: 'Standard 4' },
                      { label: 'Standard 5', value: 'Standard 5' },
                      { label: 'Standard 6', value: 'Standard 6' }
                    ]} 
                    value={newEntry.grade} 
                    onChange={(val) => setNewEntry({ ...newEntry, grade: val as GradeLevel })} 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Subject</label>
                  <Select 
                    options={[
                      { label: 'Mathematics', value: 'Mathematics' },
                      { label: 'Language Arts', value: 'Language Arts' },
                      { label: 'Science and Technology', value: 'Science and Technology' },
                      { label: 'Belizean Studies', value: 'Belizean Studies' },
                      { label: 'HFLE', value: 'HFLE' },
                      { label: 'Spanish', value: 'Spanish' },
                      { label: 'PE', value: 'PE' },
                      { label: 'Creative Arts', value: 'Creative Arts' }
                    ]} 
                    value={newEntry.subject} 
                    onChange={(val) => setNewEntry({ ...newEntry, subject: val as Subject })} 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Cycle</label>
                  <Select 
                    options={[
                      { label: 'Cycle 1', value: 1 },
                      { label: 'Cycle 2', value: 2 },
                      { label: 'Cycle 3', value: 3 },
                      { label: 'Cycle 4', value: 4 }
                    ]} 
                    value={newEntry.cycle} 
                    onChange={(val) => setNewEntry({ ...newEntry, cycle: Number(val) })} 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Strand</label>
                  <Input 
                    placeholder="e.g. Number Sense" 
                    value={newEntry.strand}
                    onChange={(e) => setNewEntry({ ...newEntry, strand: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Topic</label>
                  <Input 
                    placeholder="e.g. Addition" 
                    value={newEntry.topic}
                    onChange={(e) => setNewEntry({ ...newEntry, topic: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Subtopic</label>
                  <Input 
                    placeholder="e.g. 2-digit addition" 
                    value={newEntry.subtopic}
                    onChange={(e) => setNewEntry({ ...newEntry, subtopic: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Learning Outcomes (One per line)</label>
                <textarea 
                  className="w-full h-32 p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm"
                  placeholder="Students will be able to..."
                  value={newEntry.learning_outcomes?.join('\n')}
                  onChange={(e) => setNewEntry({ ...newEntry, learning_outcomes: e.target.value.split('\n').filter(l => l.trim()) })}
                />
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="ghost" onClick={() => setIsAdding(false)}>Cancel</Button>
                <Button onClick={handleAddEntry}>
                  <Save className="w-4 h-4" />
                  Save Entry
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCurriculum.map((item) => (
          <Card key={item.id} className="p-6 space-y-4 group hover:border-indigo-200 transition-colors">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-bold uppercase tracking-widest">{item.grade}</span>
                  <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded text-[10px] font-bold uppercase tracking-widest">{item.subject}</span>
                  {item.cycle && (
                    <span className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded text-[10px] font-bold uppercase tracking-widest">Cycle {item.cycle}</span>
                  )}
                  {item.isAmbiguous && (
                    <span className="px-2 py-0.5 bg-rose-50 text-rose-700 rounded text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                      <AlertCircle className="w-2 h-2" />
                      Ambiguous
                    </span>
                  )}
                </div>
                <h4 className="font-bold text-gray-900">{item.topic}</h4>
                <p className="text-xs text-gray-500">{item.strand}</p>
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="sm" onClick={() => handleEdit(item)}>
                  Edit
                </Button>
                <Button variant="ghost" size="sm" onClick={() => onUseInPlan(item)}>
                  Use
                </Button>
                <button 
                  onClick={() => onDelete(item.id!)}
                  className="p-2 text-gray-400 hover:text-rose-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                <Target className="w-3 h-3" />
                Learning Outcomes
              </div>
              <ul className="space-y-1.5">
                {item.learning_outcomes.slice(0, 3).map((lo, i) => (
                  <li key={i} className="text-xs text-gray-600 flex gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="truncate">{lo}</span>
                  </li>
                ))}
                {item.learning_outcomes.length > 3 && (
                  <li className="text-[10px] text-indigo-600 font-bold pl-5">
                    +{item.learning_outcomes.length - 3} more...
                  </li>
                )}
              </ul>
            </div>

            <div className="pt-4 border-t border-gray-50 flex justify-between items-center">
              <div className="flex gap-3">
                <div className="flex flex-col">
                  <span className="text-[8px] font-black text-gray-400 uppercase">Lessons</span>
                  <span className="text-xs font-bold text-gray-700">{item.suggestedLessons || 1}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[8px] font-black text-gray-400 uppercase">Weeks</span>
                  <span className="text-xs font-bold text-gray-700">{item.suggestedWeeks || 1}</span>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="text-indigo-600" onClick={() => onUseInPlan(item)}>Plan Now</Button>
            </div>
          </Card>
        ))}
      </div>

      {filteredCurriculum.length === 0 && (
        <div className="text-center py-20 space-y-4">
          <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto text-gray-300">
            <Search className="w-8 h-8" />
          </div>
          <div className="max-w-xs mx-auto space-y-2">
            <h3 className="text-lg font-bold">No Curriculum Data</h3>
            <p className="text-gray-500 text-sm">Upload your curriculum guides or add entries manually to start planning.</p>
          </div>
        </div>
      )}
    </div>
  );
}
