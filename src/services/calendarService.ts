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
import belizeCalendar2025_2026 from '../data/belize_calendar_2025_2026.json';
import belizeCalendar2026_2027 from '../data/belize_calendar_2026_2027.json';

export const getMasterCalendar = (academicYear: string = '2026-2027'): MasterCalendar => {
  if (academicYear === '2025-2026') {
    return belizeCalendar2025_2026 as MasterCalendar;
  }
  return belizeCalendar2026_2027 as MasterCalendar;
};

const resolveCalendarForDate = (date: Date, academicYear?: string): MasterCalendar => {
  if (academicYear) {
    return getMasterCalendar(academicYear);
  }
  const dateStr = format(date, 'yyyy-MM-dd');
  if (dateStr < '2026-08-01') {
    return belizeCalendar2025_2026 as MasterCalendar;
  }
  return belizeCalendar2026_2027 as MasterCalendar;
};

export const isHoliday = (date: Date, academicYear?: string): { name: string; observed: boolean } | null => {
  const cal = resolveCalendarForDate(date, academicYear);
  const dateStr = format(date, 'yyyy-MM-dd');
  const holiday = cal.holidays.find(h => h.date === dateStr || h.observed === dateStr);
  if (holiday) {
    return { name: holiday.name, observed: holiday.observed === dateStr };
  }
  return null;
};

export const isVacation = (date: Date, academicYear?: string): string | null => {
  const cal = resolveCalendarForDate(date, academicYear);
  const vacation = cal.vacations.find(v => 
    isWithinInterval(date, { start: parseISO(v.start), end: parseISO(v.end) })
  );
  return vacation ? vacation.name : null;
};

export const isNonTeachingPeriod = (date: Date, academicYear?: string): string | null => {
  const cal = resolveCalendarForDate(date, academicYear);
  const period = cal.nonTeachingPeriods.find(p => 
    isWithinInterval(date, { start: parseISO(p.start), end: parseISO(p.end) })
  );
  return period ? period.name : null;
};

export const getDayType = (date: Date, academicYear?: string): CalendarDayType => {
  if (isWeekend(date)) return 'Weekend';
  
  const holiday = isHoliday(date, academicYear);
  if (holiday) return 'Public Holiday';
  
  const vacation = isVacation(date, academicYear);
  if (vacation) return 'School Holiday / Break';
  
  const nonTeaching = isNonTeachingPeriod(date, academicYear);
  if (nonTeaching) {
    if (nonTeaching.includes('Professional Development')) return 'Professional Development Day';
    if (nonTeaching.includes('Planning')) return 'Teacher Planning Day';
    return 'No School Day';
  }

  return 'Regular School Day';
};

export const isTeachingDay = (date: Date, academicYear?: string): boolean => {
  const type = getDayType(date, academicYear);
  return type === 'Regular School Day' || type === 'Half Day' || type === 'Exam / Test Week';
};

export const getCycleForDate = (date: Date, academicYear?: string): number | null => {
  const cal = resolveCalendarForDate(date, academicYear);
  const cycle = cal.cycles.find(c => 
    isWithinInterval(date, { start: parseISO(c.start), end: parseISO(c.end) })
  );
  return cycle ? cycle.cycle : null;
};

export const getWeekNumberInCycle = (date: Date, academicYear?: string): number | null => {
  const cal = resolveCalendarForDate(date, academicYear);
  const cycle = cal.cycles.find(c => 
    isWithinInterval(date, { start: parseISO(c.start), end: parseISO(c.end) })
  );
  if (!cycle) return null;

  const cycleStart = parseISO(cycle.start);
  const diffDays = differenceInDays(date, cycleStart);
  return Math.floor(diffDays / 7) + 1;
};

export const getTeachingDaysInWeek = (weekStart: Date, academicYear?: string): Date[] => {
  const weekEnd = addDays(weekStart, 6);
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
  return days.filter(d => isTeachingDay(d, academicYear));
};

export const getDatesForCycleWeek = (cycleNumber: number, weekNumber: number, academicYear: string = '2026-2027'): Date[] => {
  const cal = getMasterCalendar(academicYear);
  const cycle = cal.cycles.find(c => c.cycle === cycleNumber);
  if (!cycle) return [];

  const cycleStart = parseISO(cycle.start);
  const weekStart = addDays(cycleStart, (weekNumber - 1) * 7);
  const weekEnd = addDays(weekStart, 6);
  
  // Ensure we don't go past cycle end
  const cycleEnd = parseISO(cycle.end);
  const actualEnd = isAfter(weekEnd, cycleEnd) ? cycleEnd : weekEnd;

  return eachDayOfInterval({ start: weekStart, end: actualEnd });
};

export const getAcademicYearStats = (academicYear: string = '2026-2027') => {
  return getMasterCalendar(academicYear).teachingPeriod;
};

