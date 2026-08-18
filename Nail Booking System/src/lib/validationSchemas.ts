import { z } from 'zod';

// Regex para validação de formato de data (YYYY-MM-DD) e hora (HH:mm ou HH:mm:ss)
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)(:([0-5]\d))?$/;

// ==========================================
// 1. Schemas de Autenticação e Usuários
// ==========================================

export const loginSchema = z.object({
  email: z
    .string({ required_error: 'E-mail é obrigatório.' })
    .trim()
    .toLowerCase()
    .email('Formato de e-mail inválido.')
    .max(255, 'E-mail muito longo.'),
  password: z
    .string({ required_error: 'Senha é obrigatória.' })
    .min(6, 'A senha deve conter no mínimo 6 caracteres.')
    .max(100, 'A senha não pode exceder 100 caracteres.'),
});

export const registerClientSchema = z.object({
  name: z
    .string({ required_error: 'Nome é obrigatório.' })
    .trim()
    .min(2, 'O nome deve ter pelo menos 2 caracteres.')
    .max(100, 'O nome não pode exceder 100 caracteres.'),
  email: z
    .string({ required_error: 'E-mail é obrigatório.' })
    .trim()
    .toLowerCase()
    .email('Formato de e-mail inválido.')
    .max(255, 'E-mail muito longo.'),
  password: z
    .string({ required_error: 'Senha é obrigatória.' })
    .min(6, 'A senha deve conter no mínimo 6 caracteres.')
    .max(100, 'A senha não pode exceder 100 caracteres.'),
  role: z.literal('client').default('client'),
});

// ==========================================
// 2. Schemas de Agendamento (Bookings)
// ==========================================

export const createBookingInputSchema = z.object({
  client_id: z
    .number({ required_error: 'ID do cliente é obrigatório.' })
    .int('ID deve ser um número inteiro.')
    .positive('ID do cliente inválido.'),
  service_id: z
    .number({ required_error: 'ID do serviço é obrigatório.' })
    .int('ID deve ser um número inteiro.')
    .positive('ID do serviço inválido.'),
  booking_date: z
    .string({ required_error: 'Data do agendamento é obrigatória.' })
    .regex(DATE_REGEX, 'Data deve estar no formato AAAA-MM-DD.'),
  start_time: z
    .string({ required_error: 'Horário de início é obrigatório.' })
    .regex(TIME_REGEX, 'Horário de início deve estar no formato HH:mm.'),
  end_time: z
    .string({ required_error: 'Horário de término é obrigatório.' })
    .regex(TIME_REGEX, 'Horário de término deve estar no formato HH:mm.'),
}).refine(
  (data) => data.start_time < data.end_time,
  {
    message: 'O horário de término deve ser posterior ao horário de início.',
    path: ['end_time'],
  }
);

export const updateBookingStatusSchema = z.object({
  booking_id: z
    .number({ required_error: 'ID do agendamento é obrigatório.' })
    .int()
    .positive('ID de agendamento inválido.'),
  status: z.enum(['confirmed', 'cancelled', 'completed'], {
    required_error: 'Status inválido.',
  }),
});

// ==========================================
// 3. Schemas de Gestão da Designer (Serviços e Horários)
// ==========================================

export const serviceSchema = z.object({
  id: z.number().int().positive().optional(),
  name: z
    .string({ required_error: 'Nome do serviço é obrigatório.' })
    .trim()
    .min(2, 'O nome do serviço deve ter no mínimo 2 caracteres.')
    .max(100, 'Nome muito longo.'),
  description: z
    .string()
    .trim()
    .max(500, 'Descrição não pode ultrapassar 500 caracteres.')
    .nullable()
    .optional(),
  duration_minutes: z
    .number({ required_error: 'Duração em minutos é obrigatória.' })
    .int('A duração deve ser em minutos inteiros.')
    .min(15, 'A duração mínima é de 15 minutos.')
    .max(480, 'A duração máxima é de 8 horas (480 min).'),
  price: z
    .number({ required_error: 'Preço é obrigatório.' })
    .min(0, 'O preço não pode ser negativo.')
    .max(9999.99, 'Preço excede o limite permitido.'),
  is_active: z.boolean().default(true),
});

export const workingHourSchema = z.object({
  day_of_week: z
    .number()
    .int()
    .min(0, 'Dia da semana deve ser entre 0 (Domingo) e 6 (Sábado).')
    .max(6, 'Dia da semana deve ser entre 0 (Domingo) e 6 (Sábado).'),
  start_time: z
    .string()
    .regex(TIME_REGEX, 'Horário inicial inválido (HH:mm).')
    .nullable()
    .optional(),
  end_time: z
    .string()
    .regex(TIME_REGEX, 'Horário final inválido (HH:mm).')
    .nullable()
    .optional(),
  is_closed: z.boolean().default(false),
}).refine(
  (data) => {
    if (data.is_closed) return true;
    if (!data.start_time || !data.end_time) return false;
    return data.start_time < data.end_time;
  },
  {
    message: 'Dias abertos exigem horário inicial e final válidos, com início anterior ao término.',
    path: ['end_time'],
  }
);

export const blockedDateSchema = z.object({
  blocked_date: z
    .string({ required_error: 'A data a bloquear é obrigatória.' })
    .regex(DATE_REGEX, 'Data deve estar no formato AAAA-MM-DD.'),
  reason: z
    .string()
    .trim()
    .max(255, 'Motivo não pode ultrapassar 255 caracteres.')
    .nullable()
    .optional(),
});

// ==========================================
// Tipos TypeScript Inferidos Diretamente dos Schemas
// ==========================================

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterClientInput = z.infer<typeof registerClientSchema>;
export type CreateBookingInput = z.infer<typeof createBookingInputSchema>;
export type UpdateBookingStatusInput = z.infer<typeof updateBookingStatusSchema>;
export type ServiceInput = z.infer<typeof serviceSchema>;
export type WorkingHourInput = z.infer<typeof workingHourSchema>;
export type BlockedDateInput = z.infer<typeof blockedDateSchema>;
