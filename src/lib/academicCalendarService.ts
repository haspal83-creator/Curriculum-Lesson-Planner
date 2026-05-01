import { db } from '../firebase';
import { collection, getDocs, query, where, writeBatch, doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { addDays, isWithinInterval, startOfWeek } from 'date-fns';

export const BELIZE_ACADEMIC_DATA = {
  cycles: [
    { number: 1, start: '2024-09-02', end: '2024-11-08', totalWeeks: 10 },
    { number: 2, start: '2024-11-11', end: '2025-01-31', totalWeeks: 9 },
    { number: 3, start: '2025-02-03', end: '2025-04-11', totalWeeks: 10 },
    { number: 4, start: '2025-04-28', end: '2025-06-27', totalWeeks: 9 },
  ],
  holidays: [
    { name: "St. George's Caye Day", date: '2024-09-10' },
    { name: "Independence Day", date: '2024-09-21' },
    { name: "Indigenous Peoples’ Resistance Day", date: '2024-10-14' },
    { name: "Garifuna Settlement Day", date: '2024-11-19' },
    { name: "George Price Day", date: '2025-01-15' },
    { name: "National Heroes & Benefactors’ Day", date: '2025-03-10' },
    { name: "Labour Day", date: '2025-05-01' },
  ],
  vacations: [
    { name: "Christmas Vacation", start: '2024-12-16', end: '2025-01-03' },
    { name: "Easter Vacation", start: '2025-04-14', end: '2025-04-25' },
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
  const cyclesSnap = await getDocs(collection(db, 'cycles'));
  const holidaysSnap = await getDocs(collection(db, 'holidays'));
  const vacationsSnap = await getDocs(collection(db, 'vacations'));

  const cycles = cyclesSnap.docs.map(d => d.data()).sort((a, b) => a.cycle_number - b.cycle_number);
  const vacations = vacationsSnap.docs.map(d => ({
    start: (d.data().start_date as any).toDate(),
    end: (d.data().end_date as any).toDate()
  }));

  const existingPlansQuery = query(
    collection(db, 'weekly_plans'),
    where('userId', '==', userId),
    where('grade', '==', grade),
    where('subject', '==', subject)
  );
  const existingPlansSnap = await getDocs(existingPlansQuery);
  const deleteBatch = writeBatch(db);
  existingPlansSnap.docs.forEach(d => deleteBatch.delete(d.ref));
  await deleteBatch.commit();

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
        const weekDocId = `${userId}_${grade}_${subject}_w${overallWeekCounter}`.replace(/[^a-zA-Z0-9]/g, '_');
        const weekDocRef = doc(db, 'weekly_plans', weekDocId);
        finalBatch.set(weekDocRef, {
          userId,
          grade,
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
