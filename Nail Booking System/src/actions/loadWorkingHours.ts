import { supabase } from '../lib/supabase';
import type { WorkingHour } from '../types/database.types';

export async function loadWorkingHours(): Promise<WorkingHour[]> {
  const { data, error } = await supabase
    .from('working_hours')
    .select('id, day_of_week, start_time, end_time, is_closed')
    .order('day_of_week', { ascending: true });

  if (error) {
    throw new Error(`Falha ao carregar expediente: ${error.message}`);
  }

  return data ?? [];
}

export default loadWorkingHours;
