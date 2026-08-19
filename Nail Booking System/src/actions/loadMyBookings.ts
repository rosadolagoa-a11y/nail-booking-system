import { supabase } from '../lib/supabase';
import type { BookingStatus } from '../types/database.types';

export interface SessionUser {
  id: number;
  role: 'designer' | 'client';
}

export interface MyBookingRow {
  id: number;
  client_id: number;
  service_id: number;
  booking_date: string;
  start_time: string;
  end_time: string;
  status: BookingStatus;
  created_at: string;
  updated_at: string;
  service_name: string;
  duration_minutes: number;
  price: number;
}

export async function loadMyBookings(user: SessionUser): Promise<MyBookingRow[]> {
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

  const { data: bookings, error } = await query;

  if (error) {
    throw new Error(`Falha ao carregar agendamentos: ${error.message}`);
  }
  if (!bookings || bookings.length === 0) {
    return [];
  }

  const serviceIds = [...new Set(bookings.map(b => b.service_id))];
  const { data: services, error: servicesError } = await supabase
    .from('services')
    .select('id, name, duration_minutes, price')
    .in('id', serviceIds);

  if (servicesError) {
    throw new Error(`Falha ao carregar serviços dos agendamentos: ${servicesError.message}`);
  }

  const serviceMap = new Map((services ?? []).map(s => [s.id, s]));

  return bookings.map(b => {
    const service = serviceMap.get(b.service_id);
    return {
      ...b,
      service_name: service?.name ?? 'Serviço removido',
      duration_minutes: service?.duration_minutes ?? 0,
      price: service?.price ?? 0,
    };
  });
}

export default loadMyBookings;
