import { 
  parseISO, 
  isWithinInterval, 
  isSameDay, 
  addDays, 
  format, 
  differenceInDays, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval,
  isWeekend,
  isBefore,
  isAfter
} from 'date-fns';
import { MasterCalendar, CalendarDayType } from '../types';
import belizeCalendarData from '../data/belize_calendar_2025_2026.json';

const masterCalendar = belizeCalendarData as MasterCalendar;

export const getMasterCalendar = () => masterCalendar;

export const isHoliday = (date: Date): { name: string; observed: boolean } | null => {
  const dateStr = format(date, 'yyyy-MM-dd');
  const holiday = masterCalendar.holidays.find(h => h.date === dateStr || h.observed === dateStr);
  if (holiday) {
    return { name: holiday.name, observed: holiday.observed === dateStr };
  }
  return null;
};

export const isVacation = (date: Date): string | null => {
  const vacation = masterCalendar.vacations.find(v => 
    isWithinInterval(date, { start: parseISO(v.start), end: parseISO(v.end) })
  );
  return vacation ? vacation.name : null;
};

export const isNonTeachingPeriod = (date: Date): string | null => {
  const period = masterCalendar.nonTeachingPeriods.find(p => 
    isWithinInterval(date, { start: parseISO(p.start), end: parseISO(p.end) })
  );
  return period ? period.name : null;
};

export const getDayType = (date: Date): CalendarDayType => {
  if (isWeekend(date)) return 'Weekend';
  
  const holiday = isHoliday(date);
  if (holiday) return 'Public Holiday';
  
  const vacation = isVacation(date);
  if (vacation) return 'School Holiday / Break';
  
  const nonTeaching = isNonTeachingPeriod(date);
  if (nonTeaching) {
    if (nonTeaching.includes('Professional Development')) return 'Professional Development Day';
    if (nonTeaching.includes('Planning')) return 'Teacher Planning Day';
    return 'No School Day';
  }

  return 'Regular School Day';
};

export const isTeachingDay = (date: Date): boolean => {
  const type = getDayType(date);
  return type === 'Regular School Day' || type === 'Half Day' || type === 'Exam / Test Week';
};

export const getCycleForDate = (date: Date): number | null => {
  const cycle = masterCalendar.cycles.find(c => 
    isWithinInterval(date, { start: parseISO(c.start), end: parseISO(c.end) })
  );
  return cycle ? cycle.cycle : null;
};

export const getWeekNumberInCycle = (date: Date): number | null => {
  const cycle = masterCalendar.cycles.find(c => 
    isWithinInterval(date, { start: parseISO(c.start), end: parseISO(c.end) })
  );
  if (!cycle) return null;

  const cycleStart = parseISO(cycle.start);
  const diffDays = differenceInDays(date, cycleStart);
  return Math.floor(diffDays / 7) + 1;
};

export const getTeachingDaysInWeek = (weekStart: Date): Date[] => {
  const weekEnd = addDays(weekStart, 6);
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
  return days.filter(d => isTeachingDay(d));
};

export const getDatesForCycleWeek = (cycleNumber: number, weekNumber: number): Date[] => {
  const cycle = masterCalendar.cycles.find(c => c.cycle === cycleNumber);
  if (!cycle) return [];

  const cycleStart = parseISO(cycle.start);
  const weekStart = addDays(cycleStart, (weekNumber - 1) * 7);
  const weekEnd = addDays(weekStart, 6);
  
  // Ensure we don't go past cycle end
  const cycleEnd = parseISO(cycle.end);
  const actualEnd = isAfter(weekEnd, cycleEnd) ? cycleEnd : weekEnd;

  return eachDayOfInterval({ start: weekStart, end: actualEnd });
};

export const getAcademicYearStats = () => {
  return masterCalendar.teachingPeriod;
};
