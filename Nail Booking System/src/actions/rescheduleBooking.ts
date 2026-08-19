import { supabase } from '../lib/supabase';
import type { Booking } from '../types/database.types';

interface RescheduleBookingPayload {
  id: number;
  bookingDate: string;
  startTime: string;
  endTime: string;
}

export async function rescheduleBooking(payload: RescheduleBookingPayload): Promise<Booking> {
  const { data, error } = await supabase
    .from('bookings')
    .update({
      booking_date: payload.bookingDate,
      start_time: payload.startTime,
      end_time: payload.endTime,
      status: 'confirmed',
      updated_at: new Date().toISOString(),
    })
    .eq('id', payload.id)
    .select()
    .single();

  if (error) {
    if (error.code === '23P01') {
      throw new Error('Este horário acabou de ser preenchido por outro agendamento.');
    }
    throw new Error(`Falha ao reagendar: ${error.message}`);
  }

  return data;
}

export default rescheduleBooking;
