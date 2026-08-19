import { supabase } from '../lib/supabase';
import type { Service } from '../types/database.types';

export async function loadActiveServices(): Promise<Service[]> {
  const { data, error } = await supabase
    .from('services')
    .select('id, name, description, duration_minutes, price, is_active, created_at, updated_at')
    .eq('is_active', true)
    .order('name', { ascending: true });

  if (error) {
    throw new Error(`Falha ao carregar serviços: ${error.message}`);
  }

  return data ?? [];
}

export default loadActiveServices;
