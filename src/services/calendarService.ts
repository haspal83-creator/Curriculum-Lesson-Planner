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

export interface AcademicWeekDetails {
  isValid: boolean;
  cycle: number;
  week: number;
  academicYear: string;
  startDate: Date;
  endDate: Date;
  formattedRange: string;
  fullLabel: string;
  isPastWeek: boolean;
  isCurrentWeek: boolean;
  isFutureWeek: boolean;
  statusText: 'Past Week' | 'Current Week' | 'Upcoming Week';
  error?: string;
  vacationName?: string;
}

export const getAcademicYearForDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (!d || isNaN(d.getTime())) return '2026-2027';
  const dateStr = format(d, 'yyyy-MM-dd');
  if (dateStr < '2026-08-01') {
    return '2025-2026';
  }
  return '2026-2027';
};

export const formatWeekDateRange = (startDate: Date, endDate: Date): string => {
  const startMonth = format(startDate, 'MMMM');
  const endMonth = format(endDate, 'MMMM');
  const startYear = format(startDate, 'yyyy');
  const endYear = format(endDate, 'yyyy');

  if (startYear !== endYear) {
    return `${format(startDate, 'MMMM d, yyyy')} – ${format(endDate, 'MMMM d, yyyy')}`;
  }
  if (startMonth !== endMonth) {
    return `${format(startDate, 'MMMM d')} – ${format(endDate, 'MMMM d, yyyy')}`;
  }
  return `${format(startDate, 'MMMM d')}–${format(endDate, 'd, yyyy')}`;
};

const resolveCalendarForDate = (date: Date, academicYear?: string): MasterCalendar => {
  const dateStr = format(date, 'yyyy-MM-dd');
  if (dateStr >= '2025-08-01' && dateStr < '2026-08-01') {
    return belizeCalendar2025_2026 as MasterCalendar;
  }
  if (dateStr >= '2026-08-01' && dateStr <= '2027-07-31') {
    return belizeCalendar2026_2027 as MasterCalendar;
  }
  if (academicYear) {
    return getMasterCalendar(academicYear);
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

/**
 * Authoritative Master Function for Academic Week Resolution
 * Flow: Selected Lesson Date -> Academic Week -> Cycle -> Subject -> Curriculum Topics -> Outcomes -> Lesson
 *
 * Provides complete details for any selected lesson date:
 * - Cycle number
 * - Week number in cycle
 * - Academic Year
 * - Monday-Friday date range & formatted label (e.g. "Week 3 — September 14–18, 2026")
 * - Historical / Current / Future week classification
 * - Clear validation errors for dates outside academic calendar or in vacation
 */
export const getAcademicWeekDetails = (
  date: Date | string, 
  academicYearOverride?: string
): AcademicWeekDetails => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (!d || isNaN(d.getTime())) {
    return {
      isValid: false,
      cycle: 1,
      week: 1,
      academicYear: academicYearOverride || '2026-2027',
      startDate: new Date(),
      endDate: new Date(),
      formattedRange: '',
      fullLabel: 'Invalid Date',
      isPastWeek: false,
      isCurrentWeek: false,
      isFutureWeek: false,
      statusText: 'Current Week',
      error: 'Please enter a valid calendar date.'
    };
  }

  // Detect true academic year from the date
  const dateYear = getAcademicYearForDate(d);
  const effectiveYear = academicYearOverride && academicYearOverride === dateYear ? academicYearOverride : dateYear;
  const cal = getMasterCalendar(effectiveYear);

  // Normalize target Monday & Friday for instructional week
  const targetMonday = startOfWeek(d, { weekStartsOn: 1 });
  const targetFriday = addDays(targetMonday, 4);
  const targetMidweek = addDays(targetMonday, 2); // Wednesday
  const formattedRange = formatWeekDateRange(targetMonday, targetFriday);

  // Compare against today's week
  const today = new Date();
  const currentMonday = startOfWeek(today, { weekStartsOn: 1 });
  const currentFriday = addDays(currentMonday, 4);

  const isPastWeek = isBefore(targetFriday, currentMonday);
  const isCurrentWeek = isSameDay(targetMonday, currentMonday);
  const isFutureWeek = isAfter(targetMonday, currentFriday);
  const statusText: 'Past Week' | 'Current Week' | 'Upcoming Week' = isPastWeek
    ? 'Past Week'
    : isCurrentWeek
      ? 'Current Week'
      : 'Upcoming Week';

  const teachingStart = parseISO(cal.teachingPeriod.start);
  const teachingEnd = parseISO(cal.teachingPeriod.end);

  // Check if date is outside the school teaching period
  if (isBefore(d, teachingStart) && isBefore(targetFriday, teachingStart)) {
    return {
      isValid: false,
      cycle: 1,
      week: 1,
      academicYear: effectiveYear,
      startDate: targetMonday,
      endDate: targetFriday,
      formattedRange,
      fullLabel: `Pre-School Year — ${formattedRange}`,
      isPastWeek,
      isCurrentWeek,
      isFutureWeek,
      statusText,
      error: `The selected date (${format(d, 'MMM d, yyyy')}) is before the start of the ${cal.schoolYear} academic year (${format(teachingStart, 'MMMM d, yyyy')}).`
    };
  }

  if (isAfter(d, teachingEnd) && isAfter(targetMonday, teachingEnd)) {
    return {
      isValid: false,
      cycle: cal.cycles.length,
      week: 1,
      academicYear: effectiveYear,
      startDate: targetMonday,
      endDate: targetFriday,
      formattedRange,
      fullLabel: `Post-School Year — ${formattedRange}`,
      isPastWeek,
      isCurrentWeek,
      isFutureWeek,
      statusText,
      error: `The selected date (${format(d, 'MMM d, yyyy')}) is after the end of the ${cal.schoolYear} academic year (${format(teachingEnd, 'MMMM d, yyyy')}).`
    };
  }

  // Check if date or midweek falls in a scheduled school vacation
  const dateVacation = cal.vacations.find(v =>
    isWithinInterval(d, { start: parseISO(v.start), end: parseISO(v.end) })
  );
  const midWeekVacation = cal.vacations.find(v =>
    isWithinInterval(targetMidweek, { start: parseISO(v.start), end: parseISO(v.end) })
  );
  const activeVacation = dateVacation || midWeekVacation;
  if (activeVacation) {
    const vStart = parseISO(activeVacation.start);
    const vEnd = parseISO(activeVacation.end);
    return {
      isValid: false,
      cycle: 1,
      week: 1,
      academicYear: effectiveYear,
      startDate: targetMonday,
      endDate: targetFriday,
      formattedRange,
      fullLabel: `${activeVacation.name} — ${formattedRange}`,
      isPastWeek,
      isCurrentWeek,
      isFutureWeek,
      statusText,
      vacationName: activeVacation.name,
      error: `The selected date falls within ${activeVacation.name} (${format(vStart, 'MMM d, yyyy')} – ${format(vEnd, 'MMM d, yyyy')}). No instructional classes scheduled.`
    };
  }

  // Find containing cycle: check mid-week first, then targetMonday, then d
  let cycle = cal.cycles.find(c =>
    isWithinInterval(targetMidweek, { start: parseISO(c.start), end: parseISO(c.end) })
  );
  if (!cycle) {
    cycle = cal.cycles.find(c =>
      isWithinInterval(d, { start: parseISO(c.start), end: parseISO(c.end) })
    );
  }
  if (!cycle) {
    cycle = cal.cycles.find(c =>
      isWithinInterval(targetMonday, { start: parseISO(c.start), end: parseISO(c.end) })
    );
  }

  if (!cycle) {
    return {
      isValid: false,
      cycle: 1,
      week: 1,
      academicYear: effectiveYear,
      startDate: targetMonday,
      endDate: targetFriday,
      formattedRange,
      fullLabel: `Break / Outside Cycle — ${formattedRange}`,
      isPastWeek,
      isCurrentWeek,
      isFutureWeek,
      statusText,
      error: `No instructional cycle is scheduled for the week of ${formattedRange}.`
    };
  }

  // Calculate instructional week within the cycle
  const cycleStart = parseISO(cycle.start);
  const cycleStartMonday = startOfWeek(cycleStart, { weekStartsOn: 1 });

  let curMon = cycleStartMonday;
  let instructionalWeekCounter = 0;
  let safety = 0;

  while ((isBefore(curMon, targetMonday) || isSameDay(curMon, targetMonday)) && safety < 35) {
    safety++;
    const curMidWeek = addDays(curMon, 2);
    const inVac = cal.vacations.some(v =>
      isWithinInterval(curMidWeek, { start: parseISO(v.start), end: parseISO(v.end) })
    );
    if (!inVac) {
      instructionalWeekCounter++;
    }

    if (isSameDay(curMon, targetMonday)) {
      if (inVac) {
        return {
          isValid: false,
          cycle: cycle.cycle,
          week: 1,
          academicYear: effectiveYear,
          startDate: targetMonday,
          endDate: targetFriday,
          formattedRange,
          fullLabel: `Vacation Week — ${formattedRange}`,
          isPastWeek,
          isCurrentWeek,
          isFutureWeek,
          statusText,
          error: `The selected week (${formattedRange}) falls within a scheduled school vacation.`
        };
      }

      const calculatedWeek = Math.min(Math.max(instructionalWeekCounter, 1), cycle.weeks);
      const fullLabel = `Week ${calculatedWeek} — ${formattedRange}`;

      return {
        isValid: true,
        cycle: cycle.cycle,
        week: calculatedWeek,
        academicYear: effectiveYear,
        startDate: targetMonday,
        endDate: targetFriday,
        formattedRange,
        fullLabel,
        isPastWeek,
        isCurrentWeek,
        isFutureWeek,
        statusText
      };
    }

    curMon = addDays(curMon, 7);
  }

  return {
    isValid: false,
    cycle: cycle.cycle,
    week: 1,
    academicYear: effectiveYear,
    startDate: targetMonday,
    endDate: targetFriday,
    formattedRange,
    fullLabel: `Undetermined — ${formattedRange}`,
    isPastWeek,
    isCurrentWeek,
    isFutureWeek,
    statusText,
    error: `Could not determine an instructional week for ${formattedRange}.`
  };
};

/**
 * Accurately determines the instructional cycle and week for a given date.
 * Delegates to the authoritative getAcademicWeekDetails function.
 */
export const getInstructionalWeekForDate = (
  date: Date | string, 
  academicYear?: string
): { cycle: number; week: number } | null => {
  const details = getAcademicWeekDetails(date, academicYear);
  if (!details.isValid) return null;
  return { cycle: details.cycle, week: details.week };
};

export const getWeekNumberInCycle = (date: Date, academicYear?: string): number | null => {
  const result = getInstructionalWeekForDate(date, academicYear);
  return result ? result.week : null;
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

