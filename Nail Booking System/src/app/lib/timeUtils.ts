export type WorkingHour = {
  day_of_week: number;
  start_time: string | null;
  end_time: string | null;
  is_closed: boolean;
};

export type ExistingBooking = {
  start_time: string;
  end_time: string;
};

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60)
    .toString()
    .padStart(2, '0');
  const m = (minutes % 60).toString().padStart(2, '0');
  return `${h}:${m}:00`;
}

export function formatTimeLabel(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${m.toString().padStart(2, '0')} ${period}`;
}

export function getAvailableSlots(
  workingHour: WorkingHour | undefined,
  durationMinutes: number,
  existingBookings: ExistingBooking[],
  slotStepMinutes = 15,
): string[] {
  if (!workingHour || workingHour.is_closed || !workingHour.start_time || !workingHour.end_time) {
    return [];
  }

  const openMinutes = timeToMinutes(workingHour.start_time);
  const closeMinutes = timeToMinutes(workingHour.end_time);

  const busyRanges = existingBookings.map(b => ({
    start: timeToMinutes(b.start_time),
    end: timeToMinutes(b.end_time),
  }));

  const slots: string[] = [];

  for (let start = openMinutes; start + durationMinutes <= closeMinutes; start += slotStepMinutes) {
    const end = start + durationMinutes;
    const overlaps = busyRanges.some(range => start < range.end && end > range.start);
    if (!overlaps) {
      slots.push(minutesToTime(start));
    }
  }

  return slots;
}

export function addMinutesToTime(time: string, minutes: number): string {
  return minutesToTime(timeToMinutes(time) + minutes);
}

export function toDateOnly(value: string): Date {
  const datePart = value.slice(0, 10);
  const [year, month, day] = datePart.split('-').map(Number);
  return new Date(year, (month || 1) - 1, day || 1);
}
