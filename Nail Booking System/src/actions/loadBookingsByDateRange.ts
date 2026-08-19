import { supabase } from '../lib/supabase';
import type { BookingStatus } from '../types/database.types';

export interface BookingWithDetails {
  id: number;
  client_id: number;
  service_id: number;
  booking_date: string;
  start_time: string;
  end_time: string;
  status: BookingStatus;
  created_at: string;
  client_name: string;
  client_email: string;
  service_name: string;
  duration_minutes: number;
  price: number;
}

export async function loadBookingsByDateRange(payload: {
  startDate: string;
  endDate: string;
}): Promise<BookingWithDetails[]> {
  const { data: bookings, error } = await supabase
    .from('bookings')
    .select('id, client_id, service_id, booking_date, start_time, end_time, status, created_at')
    .gte('booking_date', payload.startDate)
    .lte('booking_date', payload.endDate)
    .order('booking_date', { ascending: true })
    .order('start_time', { ascending: true });

  if (error) {
    throw new Error(`Falha ao carregar agenda: ${error.message}`);
  }
  if (!bookings || bookings.length === 0) {
    return [];
  }

  const clientIds = [...new Set(bookings.map(b => b.client_id))];
  const serviceIds = [...new Set(bookings.map(b => b.service_id))];

  const [{ data: users, error: usersError }, { data: services, error: servicesError }] = await Promise.all([
    supabase.from('users').select('id, name, email').in('id', clientIds),
    supabase.from('services').select('id, name, duration_minutes, price').in('id', serviceIds),
  ]);

  if (usersError) {
    throw new Error(`Falha ao carregar clientes: ${usersError.message}`);
  }
  if (servicesError) {
    throw new Error(`Falha ao carregar serviços: ${servicesError.message}`);
  }

  const userMap = new Map((users ?? []).map(u => [u.id, u]));
  const serviceMap = new Map((services ?? []).map(s => [s.id, s]));

  return bookings.map(b => {
    const client = userMap.get(b.client_id);
    const service = serviceMap.get(b.service_id);
    return {
      ...b,
      client_name: client?.name ?? 'Cliente removido',
      client_email: client?.email ?? '',
      service_name: service?.name ?? 'Serviço removido',
      duration_minutes: service?.duration_minutes ?? 0,
      price: service?.price ?? 0,
    };
  });
}

export default loadBookingsByDateRange;
