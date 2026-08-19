import { supabase } from '../lib/supabase';
import type { BlockedDate } from '../types/database.types';

export async function loadBlockedDates(): Promise<BlockedDate[]> {
  const { data, error } = await supabase
    .from('blocked_dates')
    .select('id, blocked_date, reason, created_at')
    .order('blocked_date', { ascending: true });

  if (error) {
    throw new Error(`Falha ao carregar datas bloqueadas: ${error.message}`);
  }

  return data ?? [];
}

export default loadBlockedDates;
