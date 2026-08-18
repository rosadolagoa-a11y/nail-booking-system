import { supabase } from '../lib/supabase';
import type { Database } from '../types/database.types';

type BookingRow = Database['public']['Tables']['bookings']['Row'];

export interface SessionUser {
  id: number;
  role: 'designer' | 'client';
}

export async function loadMyBookings(user: SessionUser): Promise<BookingRow[]> {
  if (!user?.id) {
    throw new Error('Não autorizado: Usuário não autenticado.');
  }

  let query = supabase
    .from('bookings')
    .select(`
      id,
      client_id,
      service_id,
      booking_date,
      start_time,
      end_time,
      status,
      created_at,
      updated_at
    `)
    .order('booking_date', { ascending: false })
    .order('start_time', { ascending: false });

  // Se for cliente, restringe estritamente aos próprios agendamentos (Anti-IDOR)
  if (user.role === 'client') {
    query = query.eq('client_id', user.id);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Falha ao carregar agendamentos: ${error.message}`);
  }

  return data ?? [];
}
