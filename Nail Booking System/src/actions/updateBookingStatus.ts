import { supabase } from '../lib/supabase';
import { updateBookingStatusSchema } from '../lib/validationSchemas';
import type { SessionUser } from './loadMyBookings';

interface UpdateStatusPayload {
  bookingId: number;
  status: 'confirmed' | 'cancelled' | 'completed';
}

export async function updateBookingStatus(
  user: SessionUser,
  payload: UpdateStatusPayload
) {
  if (!user?.id) {
    throw new Error('Não autorizado: Usuário não autenticado.');
  }

  // 1. Validação estrita de entrada via Zod
  const validated = updateBookingStatusSchema.parse({
    booking_id: payload.bookingId,
    status: payload.status,
  });

  // 2. Verificação de propriedade e integridade do registro (Anti-BOLA)
  const { data: existingBooking, error: fetchError } = await supabase
    .from('bookings')
    .select('id, client_id, status')
    .eq('id', validated.booking_id)
    .single();

  if (fetchError || !existingBooking) {
    throw new Error('Agendamento não encontrado.');
  }

  // Regra RBAC: Cliente só pode alterar o status para "cancelled" do seu próprio agendamento
  if (user.role === 'client') {
    if (existingBooking.client_id !== user.id) {
      throw new Error('Acesso negado: Você não tem permissão para alterar este agendamento.');
    }
    if (validated.status !== 'cancelled') {
      throw new Error('Operação inválida: Clientes só podem cancelar agendamentos.');
    }
  }

  // 3. Execução da mutação
  const { data, error } = await supabase
    .from('bookings')
    .update({
      status: validated.status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', validated.booking_id)
    .select()
    .single();

  if (error) {
    throw new Error(`Erro ao atualizar status do agendamento: ${error.message}`);
  }

  return data;
}
