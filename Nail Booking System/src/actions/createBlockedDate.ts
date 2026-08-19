import { supabase } from '../lib/supabase';
import { blockedDateSchema } from '../lib/validationSchemas';
import type { BlockedDate } from '../types/database.types';

interface CreateBlockedDatePayload {
  blockedDate: string;
  reason: string | null;
}

export async function createBlockedDate(payload: CreateBlockedDatePayload): Promise<BlockedDate | null> {
  const validated = blockedDateSchema.parse({
    blocked_date: payload.blockedDate,
    reason: payload.reason,
  });

  const { data, error } = await supabase
    .from('blocked_dates')
    .upsert(
      { blocked_date: validated.blocked_date, reason: validated.reason ?? null },
      { onConflict: 'blocked_date', ignoreDuplicates: true },
    )
    .select()
    .maybeSingle();

  if (error) {
    throw new Error(`Falha ao bloquear data: ${error.message}`);
  }

  return data;
}

export default createBlockedDate;
