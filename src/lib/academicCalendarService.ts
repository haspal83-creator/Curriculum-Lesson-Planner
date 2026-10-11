import { db } from '../firebase';
import { collection, getDocs, query, where, writeBatch, doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { addDays, isWithinInterval, startOfWeek } from 'date-fns';
import { getClassId } from '../types';
import { getMasterCalendar } from '../services/calendarService';

export const BELIZE_ACADEMIC_DATA = {
  cycles: [
    { number: 1, start: '2026-09-01', end: '2026-10-30', totalWeeks: 9 },
    { number: 2, start: '2026-11-02', end: '2027-01-22', totalWeeks: 9 },
    { number: 3, start: '2027-01-25', end: '2027-03-26', totalWeeks: 9 },
    { number: 4, start: '2027-04-12', end: '2027-06-25', totalWeeks: 11 },
  ],
  holidays: [
    { name: "St. George's Caye Day", date: '2026-09-10' },
    { name: "Independence Day", date: '2026-09-21' },
    { name: "Indigenous Peoples’ Resistance Day", date: '2026-10-12' },
    { name: "Garifuna Settlement Day", date: '2026-11-19' },
    { name: "George Price Day", date: '2027-01-15' },
    { name: "National Heroes & Benefactors’ Day", date: '2027-03-09' },
    { name: "Labour Day", date: '2027-05-01' },
  ],
  vacations: [
    { name: "Christmas Vacation", start: '2026-12-14', end: '2027-01-01' },
    { name: "Easter Vacation", start: '2027-03-29', end: '2027-04-09' },
  ]
};

export async function seedAcademicCalendar() {
  for (const c of BELIZE_ACADEMIC_DATA.cycles) {
    const cycleRef = doc(db, 'cycles', `cycle_2024_${c.number}`);
    await setDoc(cycleRef, {
      cycle_number: c.number,
      start_date: new Date(c.start),
      end_date: new Date(c.end),
      total_weeks: c.totalWeeks
    });
  }

  for (const h of BELIZE_ACADEMIC_DATA.holidays) {
    const holidayId = h.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const holidayRef = doc(db, 'holidays', `holiday_2024_${holidayId}`);
    await setDoc(holidayRef, {
      name: h.name,
      date: new Date(h.date)
    });
  }

  for (const v of BELIZE_ACADEMIC_DATA.vacations) {
    const vacationId = v.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const vacationRef = doc(db, 'vacations', `vacation_2024_${vacationId}`);
    await setDoc(vacationRef, {
      name: v.name,
      start_date: new Date(v.start),
      end_date: new Date(v.end)
    });
  }
}

export async function generateWeeklyPlans(userId: string, grade: string, subject: string) {
  const classId = getClassId(grade);
  let cycles: any[] = [];
  let vacations: any[] = [];

  try {
    const cyclesSnap = await getDocs(collection(db, 'cycles'));
    cycles = cyclesSnap.docs.map(d => d.data()).sort((a, b) => a.cycle_number - b.cycle_number);
  } catch (err) {
    console.warn("Could not fetch cycles from Firestore, using default academic data:", err);
  }

  if (cycles.length === 0) {
    cycles = BELIZE_ACADEMIC_DATA.cycles.map(c => ({
      cycle_number: c.number,
      start_date: { toDate: () => new Date(c.start) },
      end_date: { toDate: () => new Date(c.end) }
    }));
  }

  try {
    const vacationsSnap = await getDocs(collection(db, 'vacations'));
    vacations = vacationsSnap.docs.map(d => ({
      start: (d.data().start_date as any).toDate(),
      end: (d.data().end_date as any).toDate()
    }));
  } catch (err) {
    console.warn("Could not fetch vacations from Firestore, using default academic data:", err);
  }

  if (vacations.length === 0) {
    vacations = BELIZE_ACADEMIC_DATA.vacations.map(v => ({
      start: new Date(v.start),
      end: new Date(v.end)
    }));
  }

  try {
    const existingPlansQuery = query(
      collection(db, 'weekly_plans'),
      where('userId', '==', userId),
      where('classId', '==', classId),
      where('subject', '==', subject)
    );
    const existingPlansSnap = await getDocs(existingPlansQuery);
    const deleteBatch = writeBatch(db);
    existingPlansSnap.docs.forEach(d => deleteBatch.delete(d.ref));
    await deleteBatch.commit();
  } catch (err) {
    console.warn("Error cleaning up existing plans:", err);
  }

  const finalBatch = writeBatch(db);
  let overallWeekCounter = 1;

  for (const cycle of cycles) {
    const start = (cycle.start_date as any).toDate();
    const end = (cycle.end_date as any).toDate();
    
    let current = startOfWeek(start, { weekStartsOn: 1 });
    
    while (current <= end) {
      const weekStart = current;
      const weekEnd = addDays(current, 4);
      
      const isVacation = vacations.some(v => 
        isWithinInterval(weekStart, { start: v.start, end: v.end }) ||
        isWithinInterval(weekEnd, { start: v.start, end: v.end })
      );

      if (!isVacation) {
        const weekDocId = `${userId}_${classId}_${subject}_w${overallWeekCounter}`.replace(/[^a-zA-Z0-9]/g, '_');
        const weekDocRef = doc(db, 'weekly_plans', weekDocId);
        finalBatch.set(weekDocRef, {
          userId,
          classId,
          className: grade,
          grade,
          grade_level: grade,
          subject,
          cycle_number: cycle.cycle_number,
          week_number: overallWeekCounter++,
          start_date: weekStart,
          end_date: weekEnd,
          lessons: [],
          objectives: [],
          notes: '',
          status: 'empty',
          createdAt: serverTimestamp()
        });
      }

      current = addDays(current, 7);
    }
  }

  await finalBatch.commit();
}
