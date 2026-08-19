import { supabase } from '../lib/supabase';

export async function loadBookingsForDate(payload: { bookingDate: string }) {
  const { data, error } = await supabase
    .from('bookings')
    .select('id, service_id, booking_date, start_time, end_time, status')
    .eq('booking_date', payload.bookingDate)
    .neq('status', 'cancelled');

  if (error) {
    throw new Error(`Falha ao carregar reservas do dia: ${error.message}`);
  }

  return data ?? [];
}

export default loadBookingsForDate;
