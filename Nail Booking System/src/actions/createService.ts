import { supabase } from '../lib/supabase';
import { serviceSchema } from '../lib/validationSchemas';
import type { Service } from '../types/database.types';

interface CreateServicePayload {
  name: string;
  description: string | null;
  durationMinutes: number;
  price: number;
  isActive: boolean;
}

export async function createService(payload: CreateServicePayload): Promise<Service> {
  const validated = serviceSchema.parse({
    name: payload.name,
    description: payload.description,
    duration_minutes: payload.durationMinutes,
    price: payload.price,
    is_active: payload.isActive,
  });

  const { data, error } = await supabase
    .from('services')
    .insert({
      name: validated.name,
      description: validated.description ?? null,
      duration_minutes: validated.duration_minutes,
      price: validated.price,
      is_active: validated.is_active,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Falha ao criar serviço: ${error.message}`);
  }

  return data;
}

export default createService;
