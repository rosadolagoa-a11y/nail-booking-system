import { supabase } from '../lib/supabase';

export async function deleteService(payload: { id: number }): Promise<void> {
  const { error } = await supabase.from('services').delete().eq('id', payload.id);

  if (error) {
    throw new Error(`Falha ao excluir serviço: ${error.message}`);
  }
}

export default deleteService;
