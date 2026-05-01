import { 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  format, 
  isWeekend, 
  addDays, 
  differenceInDays,
  isWithinInterval,
  parseISO,
  getWeek,
  isValid
} from 'date-fns';
import { CalendarDayEntry, CalendarDayType, YearlyCalendarPlan, GradeLevel, Subject } from '../types';
import { getMasterCalendar, getDayType, isTeachingDay, getCycleForDate, getWeekNumberInCycle } from '../services/calendarService';

const safeFormat = (dateStr: string | undefined | null, formatStr: string): string => {
  if (!dateStr) return '';
  try {
    const date = parseISO(dateStr);
    return isValid(date) ? format(date, formatStr) : '';
  } catch (e) {
    return '';
  }
};

export const calculateCalendarMetadata = (days: CalendarDayEntry[]): YearlyCalendarPlan['metadata'] => {
  const teachingDays = days.filter(d => d.isTeachingDay);
  const holidays = days.filter(d => d.type === 'Public Holiday' || d.type === 'School Holiday / Break');
  const breakDays = days.filter(d => d.type === 'School Holiday / Break');
  
  // Group by week
  const weeks = new Set(days.map(d => safeFormat(d.date, 'yyyy-ww')));
  
  // Group by cycle
  const cycles = Array.from(new Set(days.filter(d => d.cycle).map(d => d.cycle!))).sort((a, b) => a - b);
  const cycleBreakdown = cycles.map(cycle => {
    const cycleDays = days.filter(d => d.cycle === cycle);
    const cycleTeachingDays = cycleDays.filter(d => d.isTeachingDay);
    const cycleWeeks = new Set(cycleDays.map(d => safeFormat(d.date, 'yyyy-ww')));
    
    return {
      cycle,
      weeks: cycleWeeks.size,
      days: cycleTeachingDays.length
    };
  });

  return {
    totalWeeks: weeks.size,
    totalTeachingDays: teachingDays.length,
    totalHolidays: holidays.length,
    totalBreakDays: breakDays.length,
    cycleBreakdown
  };
};

export const initializeYearlyCalendar = (
  startDate: string, 
  endDate: string, 
  grade: GradeLevel, 
  subject: Subject
): YearlyCalendarPlan => {
  const master = getMasterCalendar();
  const start = parseISO(master.teachingPeriod.start);
  const end = parseISO(master.teachingPeriod.end);
  
  const interval = eachDayOfInterval({ start, end });
  
  const days: CalendarDayEntry[] = interval.map(date => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const type = getDayType(date);
    const teaching = isTeachingDay(date);
    const cycle = getCycleForDate(date);
    const week = getWeekNumberInCycle(date);
    
    return {
      id: Math.random().toString(36).substr(2, 9),
      date: dateStr,
      type,
      isTeachingDay: teaching,
      grade,
      subject,
      cycle: cycle || undefined,
      week: week || undefined,
      status: 'Not Started'
    };
  });

  return {
    grade,
    subject,
    schoolYear: master.schoolYear,
    startDate: master.teachingPeriod.start,
    endDate: master.teachingPeriod.end,
    days,
    metadata: calculateCalendarMetadata(days),
    createdAt: new Date().toISOString(),
    createdBy: ''
  };
};

export const applyCategoryToRange = (
  days: CalendarDayEntry[],
  startDate: string,
  endDate: string,
  type: CalendarDayType
): CalendarDayEntry[] => {
  const start = parseISO(startDate);
  const end = parseISO(endDate);
  
  const nonTeachingTypes: CalendarDayType[] = [
    'Weekend',
    'Public Holiday',
    'School Holiday / Break',
    'No School Day',
    'Emergency Closure / Makeup Day'
  ];

  return days.map(day => {
    const dayDate = parseISO(day.date);
    if (isWithinInterval(dayDate, { start, end })) {
      return {
        ...day,
        type,
        isTeachingDay: !nonTeachingTypes.includes(type)
      };
    }
    return day;
  });
};
