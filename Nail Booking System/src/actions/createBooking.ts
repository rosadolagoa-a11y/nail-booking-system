import { supabase } from '../lib/supabase';
import { createBookingInputSchema } from '../lib/validationSchemas';
import type { SessionUser } from './loadMyBookings';

interface CreateBookingPayload {
  serviceId: number;
  bookingDate: string;
  startTime: string;
  endTime: string;
  clientIdOverride?: number; // Permitido exclusivamente para designer
}

export async function createBooking(
  user: SessionUser,
  payload: CreateBookingPayload
) {
  if (!user?.id) {
    throw new Error('Não autorizado: Usuário não autenticado.');
  }

  // Anti-IDOR: Cliente sempre usa o próprio ID da sessão
  const targetClientId =
    user.role === 'designer' && payload.clientIdOverride
      ? payload.clientIdOverride
      : user.id;

  // Validação Zod estrita
  const validated = createBookingInputSchema.parse({
    client_id: targetClientId,
    service_id: payload.serviceId,
    booking_date: payload.bookingDate,
    start_time: payload.startTime,
    end_time: payload.endTime,
  });

  // Persistência com tratamento da constraint GiST anti-concorrência
  const { data, error } = await supabase
    .from('bookings')
    .insert({
      client_id: validated.client_id,
      service_id: validated.service_id,
      booking_date: validated.booking_date,
      start_time: validated.start_time,
      end_time: validated.end_time,
      status: 'confirmed',
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23P01') {
      throw new Error('Este horário acabou de ser preenchido por outro agendamento.');
    }
    throw new Error(`Falha ao registrar agendamento: ${error.message}`);
  }

  return data;
}
