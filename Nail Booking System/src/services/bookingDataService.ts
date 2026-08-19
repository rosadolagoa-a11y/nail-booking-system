import { supabase } from '../lib/supabase';
import type { Database, Service, WorkingHour, Booking } from '../types/database.types';

type BookingInsert = Database['public']['Tables']['bookings']['Insert'];

export interface AvailabilityData {
  isBlocked: boolean;
  blockedReason: string | null;
  workingHours: WorkingHour | null;
  bookings: Pick<Booking, 'start_time' | 'end_time'>[];
}

export const bookingDataService = {
  async getActiveServices(): Promise<Service[]> {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) throw new Error(`Falha ao buscar serviços: ${error.message}`);
    return data ?? [];
  },

  async getBookingsByDate(date: string) {
    const { data, error } = await supabase
      .from('bookings')
      .select('id, start_time, end_time, status')
      .eq('booking_date', date)
      .neq('status', 'cancelled');

    if (error) throw new Error(`Falha ao consultar horários ocupados: ${error.message}`);
    return data ?? [];
  },

  async getAvailabilityByDate(date: string): Promise<AvailabilityData> {
    const dayOfWeek = new Date(`${date}T00:00:00`).getDay();

    const [blockedResult, workingHoursResult, bookingsResult] = await Promise.all([
      supabase.from('blocked_dates').select('reason').eq('blocked_date', date).maybeSingle(),
      supabase.from('working_hours').select('*').eq('day_of_week', dayOfWeek).maybeSingle(),
      supabase
        .from('bookings')
        .select('start_time, end_time')
        .eq('booking_date', date)
        .neq('status', 'cancelled'),
    ]);

    if (blockedResult.error) {
      throw new Error(`Falha ao verificar bloqueios: ${blockedResult.error.message}`);
    }
    if (workingHoursResult.error) {
      throw new Error(`Falha ao verificar expediente: ${workingHoursResult.error.message}`);
    }
    if (bookingsResult.error) {
      throw new Error(`Falha ao verificar agenda: ${bookingsResult.error.message}`);
    }

    return {
      isBlocked: Boolean(blockedResult.data),
      blockedReason: blockedResult.data?.reason ?? null,
      workingHours: workingHoursResult.data ?? null,
      bookings: bookingsResult.data ?? [],
    };
  },

  async createBooking(payload: BookingInsert): Promise<Booking> {
    const { data, error } = await supabase
      .from('bookings')
      .insert(payload)
      .select()
      .single();

    if (error) {
      if (error.code === '23P01') {
        throw new Error('Este horário acabou de ser reservado por outro cliente.');
      }
      throw new Error(`Erro ao agendar: ${error.message}`);
    }

    return data;
  },
};
