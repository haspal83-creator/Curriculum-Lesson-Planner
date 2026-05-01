import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  ChevronRight, 
  BookOpen, 
  Target, 
  ListChecks, 
  Layers, 
  CalendarRange 
} from 'lucide-react';
import { Button, Card, Input, Select } from '../ui';
import { CurriculumEntry, GradeLevel, Subject } from '../../types';

interface CycleUnitPlansViewProps {
  curriculum: CurriculumEntry[];
  setActiveTab: (tab: string) => void;
  setPrefillData: (data: any) => void;
}

export function CycleUnitPlansView({ 
  curriculum, 
  setActiveTab, 
  setPrefillData 
}: CycleUnitPlansViewProps) {
  const [selectedGrade, setSelectedGrade] = useState<GradeLevel>('Standard 1');
  const [selectedSubject, setSelectedSubject] = useState<Subject>('Mathematics');

  const cycleData = useMemo(() => {
    const filtered = curriculum.filter(c => c.grade === selectedGrade && c.subject === selectedSubject);
    const cycles: { [key: number]: CurriculumEntry[] } = {};
    
    filtered.forEach(entry => {
      const cycle = entry.cycle || 1;
      if (!cycles[cycle]) cycles[cycle] = [];
      cycles[cycle].push(entry);
    });

    return Object.entries(cycles).sort((a, b) => Number(a[0]) - Number(b[0]));
  }, [curriculum, selectedGrade, selectedSubject]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Grade Level</label>
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
                { label: 'Science and Technology', value: 'Science and Technology' },
                { label: 'Belizean Studies', value: 'Belizean Studies' },
                { label: 'HFLE', value: 'HFLE' },
                { label: 'Spanish', value: 'Spanish' },
                { label: 'PE', value: 'PE' },
                { label: 'Creative Arts', value: 'Creative Arts' }
              ]} 
              value={selectedSubject} 
              onChange={(val) => setSelectedSubject(val as Subject)} 
              className="w-40"
            />
          </div>
        </div>
        <Button onClick={() => setActiveTab('pacingMap')}>
          <CalendarRange className="w-4 h-4" />
          View Pacing Map
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {cycleData.length > 0 ? (
          cycleData.map(([cycle, entries]) => (
            <Card key={cycle} className="p-6 space-y-6">
              <div className="flex justify-between items-center border-b border-gray-50 pb-4">
                <div className="space-y-1">
                  <h3 className="text-xl font-black text-gray-900 tracking-tight">Cycle {cycle}</h3>
                  <p className="text-sm text-gray-500">{entries.length} Topics • {entries.reduce((acc, e) => acc + e.learning_outcomes.length, 0)} Outcomes</p>
                </div>
                <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 font-black text-xl">
                  {cycle}
                </div>
              </div>

              <div className="space-y-4">
                {entries.map((entry, idx) => (
                  <div key={idx} className="p-4 bg-gray-50/50 rounded-xl border border-gray-50 hover:border-indigo-100 transition-colors group">
                    <div className="flex justify-between items-start mb-2">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Topic {idx + 1}</p>
                        <h4 className="font-bold text-gray-900">{entry.topic}</h4>
                        <p className="text-xs text-gray-500">{entry.subtopic}</p>
                      </div>
                      <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => {
                        setPrefillData({
                          grade: entry.grade,
                          subject: entry.subject,
                          cycle: entry.cycle,
                          topic: entry.topic,
                          subtopic: entry.subtopic,
                          outcomes: entry.learning_outcomes
                        });
                        setActiveTab('planner');
                      }}>
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {entry.learning_outcomes.slice(0, 3).map((lo, i) => (
                        <span key={i} className="text-[9px] px-2 py-0.5 bg-white text-gray-600 rounded-full border border-gray-100 truncate max-w-[150px]">
                          {lo}
                        </span>
                      ))}
                      {entry.learning_outcomes.length > 3 && (
                        <span className="text-[9px] px-2 py-0.5 bg-white text-indigo-600 rounded-full border border-indigo-50 font-bold">
                          +{entry.learning_outcomes.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4">
                <Button variant="secondary" className="w-full" onClick={() => setActiveTab('pacingMap')}>
                  View Cycle Pacing Map
                </Button>
              </div>
            </Card>
          ))
        ) : (
          <Card className="p-12 text-center space-y-4 md:col-span-2">
            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto text-gray-300">
              <BookOpen className="w-8 h-8" />
            </div>
            <div className="max-w-xs mx-auto space-y-2">
              <h3 className="text-lg font-bold">No Cycle Data</h3>
              <p className="text-gray-500 text-sm">Upload your curriculum guides to see them organized by cycle.</p>
              <div className="pt-4">
                <Button onClick={() => setActiveTab('curriculum')} size="sm">Upload Curriculum</Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
