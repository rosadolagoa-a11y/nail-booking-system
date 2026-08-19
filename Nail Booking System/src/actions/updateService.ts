import { supabase } from '../lib/supabase';
import { serviceSchema } from '../lib/validationSchemas';
import type { Service } from '../types/database.types';

interface UpdateServicePayload {
  id: number;
  name: string;
  description: string | null;
  durationMinutes: number;
  price: number;
  isActive: boolean;
}

export async function updateService(payload: UpdateServicePayload): Promise<Service> {
  const validated = serviceSchema.parse({
    id: payload.id,
    name: payload.name,
    description: payload.description,
    duration_minutes: payload.durationMinutes,
    price: payload.price,
    is_active: payload.isActive,
  });

  const { data, error } = await supabase
    .from('services')
    .update({
      name: validated.name,
      description: validated.description ?? null,
      duration_minutes: validated.duration_minutes,
      price: validated.price,
      is_active: validated.is_active,
      updated_at: new Date().toISOString(),
    })
    .eq('id', payload.id)
    .select()
    .single();

  if (error) {
    throw new Error(`Falha ao atualizar serviço: ${error.message}`);
  }

  return data;
}

export default updateService;
