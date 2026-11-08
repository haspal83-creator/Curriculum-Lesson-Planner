import { parseISO, addDays, startOfWeek, format, isWeekend } from 'date-fns';
import { CalendarDayEntry } from '../types';
import { getMasterCalendar, getDatesForCycleWeek, isHoliday, isTeachingDay } from '../services/calendarService';

export interface AuthoritativeWeekDay {
  dayName: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';
  dayNumber: number; // 1 to 5
  dateStr: string;   // Formatted e.g. "October 12, 2026"
  isoDate: string;   // e.g. "2026-10-12"
  isTeachingDay: boolean;
  holidayName?: string;
}

const DAY_NAMES: ('Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday')[] = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'
];

/**
 * Resolves the 5 authoritative instructional weekdays for a given cycle and week
 * in accordance with the Belize National School Calendar.
 */
export function getAuthoritativeInstructionalDatesForWeek(
  cycle: number,
  week: number,
  academicYear: string = '2026-2027',
  calendarDays?: CalendarDayEntry[]
): AuthoritativeWeekDay[] {
  // 1. Try to extract matching days from calendarDays if available
  if (calendarDays && calendarDays.length > 0) {
    const matching = calendarDays.filter(d => d.cycle === cycle && d.week === week);
    const weekdaysOnly = matching.filter(d => {
      try {
        return !isWeekend(parseISO(d.date));
      } catch {
        return true;
      }
    });

    if (weekdaysOnly.length >= 5) {
      return weekdaysOnly.slice(0, 5).map((d, idx) => {
        const dateObj = parseISO(d.date);
        const hol = isHoliday(dateObj, academicYear);
        return {
          dayName: DAY_NAMES[idx],
          dayNumber: idx + 1,
          dateStr: format(dateObj, 'MMMM d, yyyy'),
          isoDate: d.date,
          isTeachingDay: d.isTeachingDay ?? !hol,
          holidayName: hol?.name
        };
      });
    }
  }

  // 2. Authoritative resolution using the Belize Master School Calendar
  const cal = getMasterCalendar(academicYear);
  const cycleObj = cal.cycles.find(c => c.cycle === cycle);
  const cycleStart = cycleObj ? parseISO(cycleObj.start) : parseISO('2026-09-01');

  // Compute the start of the week: (week - 1) * 7 days from cycle start
  const weekStartInterval = addDays(cycleStart, Math.max(0, week - 1) * 7);
  // Monday of that instructional week
  const weekMonday = startOfWeek(weekStartInterval, { weekStartsOn: 1 });

  return DAY_NAMES.map((dayName, idx) => {
    const d = addDays(weekMonday, idx);
    const hol = isHoliday(d, academicYear);
    const teach = isTeachingDay(d, academicYear);
    return {
      dayName,
      dayNumber: idx + 1,
      dateStr: format(d, 'MMMM d, yyyy'),
      isoDate: format(d, 'yyyy-MM-dd'),
      isTeachingDay: teach,
      holidayName: hol?.name
    };
  });
}
