import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GradeLevel } from '../types';
import { Button, Card } from './ui';
import { Users, ChevronRight } from 'lucide-react';

interface SelectClassModalProps {
  isOpen: boolean;
  assignedClasses: GradeLevel[];
  onSelect: (grade: GradeLevel) => void;
}

export const SelectClassModal: React.FC<SelectClassModalProps> = ({
  isOpen,
  assignedClasses,
  onSelect
}) => {
  if (!isOpen) return null;

  const defaultClasses: GradeLevel[] = [
    'Infant 1', 'Infant 2', 
    'Standard 1', 'Standard 2', 'Standard 3', 
    'Standard 4', 'Standard 5', 'Standard 6'
  ];

  const classesToShow = assignedClasses.length > 0 ? assignedClasses : defaultClasses;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-2xl"
        >
          <Card className="p-8 shadow-2xl border-primary/20">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Select Your Class</h2>
              <p className="text-gray-500">Please choose the class you are currently teaching to access your workspace.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {classesToShow.map((grade) => (
                <Button
                  key={grade}
                  variant="outline"
                  className="h-20 text-lg font-semibold justify-between px-6 hover:border-primary hover:bg-primary/5 group transition-all"
                  onClick={() => onSelect(grade)}
                >
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-normal text-gray-400">Teaching</span>
                    {grade}
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </Button>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t text-center">
              <p className="text-sm text-gray-400 italic">
                You can switch classes at any time from the top header.
              </p>
            </div>
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
