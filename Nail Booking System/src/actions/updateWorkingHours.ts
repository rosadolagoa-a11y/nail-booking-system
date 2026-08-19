import { supabase } from '../lib/supabase';
import { workingHourSchema } from '../lib/validationSchemas';
import type { WorkingHour } from '../types/database.types';

interface UpdateWorkingHoursPayload {
  dayOfWeek: number;
  startTime: string | null;
  endTime: string | null;
  isClosed: boolean;
}

export async function updateWorkingHours(payload: UpdateWorkingHoursPayload): Promise<WorkingHour> {
  const validated = workingHourSchema.parse({
    day_of_week: payload.dayOfWeek,
    start_time: payload.startTime,
    end_time: payload.endTime,
    is_closed: payload.isClosed,
  });

  const { data, error } = await supabase
    .from('working_hours')
    .update({
      start_time: validated.start_time ?? null,
      end_time: validated.end_time ?? null,
      is_closed: validated.is_closed,
    })
    .eq('day_of_week', validated.day_of_week)
    .select()
    .single();

  if (error) {
    throw new Error(`Falha ao atualizar expediente: ${error.message}`);
  }

  return data;
}

export default updateWorkingHours;
