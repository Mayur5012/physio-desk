import { addDays, format, parseISO, isAfter, isBefore, 
         isEqual, setHours, setMinutes } from "date-fns";

// ── Convert "HH:MM" to minutes from midnight ───────────────
export function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

// ── Convert minutes from midnight to "HH:MM" ──────────────
export function minutesToTime(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

// ── Calculate end time given start + duration ──────────────
export function calcEndTime(startTime: string, durationMins: number): string {
  return minutesToTime(timeToMinutes(startTime) + durationMins);
}

// ── Check if two time ranges overlap ──────────────────────
export function timesOverlap(
  start1: string, end1: string,
  start2: string, end2: string
): boolean {
  const s1 = timeToMinutes(start1);
  const e1 = timeToMinutes(end1);
  const s2 = timeToMinutes(start2);
  const e2 = timeToMinutes(end2);
  return s1 < e2 && e1 > s2;
}

// ── Generate all dates for a recurring appointment ────────
export interface RecurrenceOptions {
  startDate: Date;
  pattern: "DAILY" | "EVERY_N_DAYS" | "CUSTOM";
  everyN?: number;             // for EVERY_N_DAYS
  customDays?: number[];       // 0=Sun,1=Mon... for CUSTOM
  endAfterSessions?: number;
  endDate?: Date;
}

export function generateRecurringDates(opts: RecurrenceOptions): Date[] {
  const {
    startDate, pattern, everyN = 1,
    customDays = [], endAfterSessions, endDate,
  } = opts;

  const dates: Date[] = [];
  let current = new Date(startDate);
  const maxSessions = endAfterSessions || 365; // safety cap
  const maxDate = endDate || addDays(startDate, 365);

  while (
    dates.length < maxSessions &&
    (isBefore(current, maxDate) || isEqual(current, maxDate))
  ) {
    if (pattern === "DAILY") {
      dates.push(new Date(current));
      current = addDays(current, 1);

    } else if (pattern === "EVERY_N_DAYS") {
      dates.push(new Date(current));
      current = addDays(current, everyN);

    } else if (pattern === "CUSTOM") {
      if (customDays.includes(current.getDay())) {
        dates.push(new Date(current));
      }
      current = addDays(current, 1);
    }
  }

  return dates;
}

// ── Get available slots for a given date ──────────────────
export interface SlotOptions {
  date: Date;
  workStart: string;    // "07:00"
  workEnd: string;      // "21:00"
  breakStart?: string;
  breakEnd?: string;
  slotDuration: number; // minutes
  bookedSlots: Array<{ startTime: string; endTime: string }>;
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
  available: boolean;
}

export function getAvailableSlots(opts: SlotOptions): TimeSlot[] {
  const {
    workStart, workEnd, breakStart, breakEnd,
    slotDuration, bookedSlots,
  } = opts;

  const slots: TimeSlot[] = [];
  let current = timeToMinutes(workStart);
  const end   = timeToMinutes(workEnd);

  while (current + slotDuration <= end) {
    const slotStart = minutesToTime(current);
    const slotEnd   = minutesToTime(current + slotDuration);

    // Check break overlap
    const inBreak = breakStart && breakEnd
      ? timesOverlap(slotStart, slotEnd, breakStart, breakEnd)
      : false;

    // Check booked overlap
    const isBooked = bookedSlots.some((b) =>
      timesOverlap(slotStart, slotEnd, b.startTime, b.endTime)
    );

    slots.push({
      startTime: slotStart,
      endTime:   slotEnd,
      available: !inBreak && !isBooked,
    });

    current += 30; // 30-min grid steps
  }

  return slots;
}
