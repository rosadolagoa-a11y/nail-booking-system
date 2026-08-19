import { supabase } from '../lib/supabase';

export async function deleteBlockedDate(payload: { id: number }): Promise<void> {
  const { error } = await supabase.from('blocked_dates').delete().eq('id', payload.id);

  if (error) {
    throw new Error(`Falha ao remover bloqueio: ${error.message}`);
  }
}

export default deleteBlockedDate;
