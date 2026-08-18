import { supabase } from '../lib/supabase';
import type { Database } from '../types/database.types';

type BookingInsert = Database['public']['Tables']['bookings']['Insert'];
type BookingRow = Database['public']['Tables']['bookings']['Row'];

export const bookingDataService = {
  async getActiveServices() {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) throw new Error(`Falha ao buscar serviços: ${error.message}`);
    return data;
  },

  async getBookingsByDate(date: string) {
    const { data, error } = await supabase
      .from('bookings')
      .select('id, start_time, end_time, status')
      .eq('booking_date', date)
      .neq('status', 'cancelled');

    if (error) throw new Error(`Falha ao consultar horários ocupados: ${error.message}`);
    return data;
  },

  async createBooking(payload: BookingInsert): Promise<BookingRow> {
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
