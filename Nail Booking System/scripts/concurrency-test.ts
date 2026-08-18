import { createClient } from '@supabase/supabase-js';
import type { Database } from '../src/types/database.types';

// Leitura das credenciais do ambiente
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || '';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('[ERRO S4.1] VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY não configuradas no ambiente.');
  process.exit(1);
}

const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);

interface ConcurrencyResult {
  attempt: number;
  success: boolean;
  code?: string;
  errorMessage?: string;
  durationMs: number;
}

/**
 * Dispara uma tentativa assíncrona de inserção direta no banco.
 */
async function executeBookingAttempt(
  attempt: number,
  clientId: number,
  serviceId: number,
  bookingDate: string,
  startTime: string,
  endTime: string
): Promise<ConcurrencyResult> {
  const startTimePerf = performance.now();

  const { data, error } = await supabase
    .from('bookings')
    .insert({
      client_id: clientId,
      service_id: serviceId,
      booking_date: bookingDate,
      start_time: startTime,
      end_time: endTime,
      status: 'confirmed',
    })
    .select('id')
    .single();

  const durationMs = Math.round(performance.now() - startTimePerf);

  if (error) {
    return {
      attempt,
      success: false,
      code: error.code,
      errorMessage: error.message,
      durationMs,
    };
  }

  return {
    attempt,
    success: true,
    durationMs,
  };
}

/**
 * Runner principal da Sprint S4.1: Teste de Carga e Concorrência Atômica.
 */
async function runConcurrencySuite() {
  console.log('====================================================');
  console.log('  EXECUTANDO TESTE DE CONCORRÊNCIA (SPRINT S4.1)    ');
  console.log('====================================================\n');

  const TARGET_DATE = '2026-11-20';
  const START_TIME = '10:00:00';
  const END_TIME = '10:45:00';
  const SERVICE_ID = 1; // Manicure Simples
  const CLIENT_ID = 1;

  // Limpeza de isolamento prévia
  await supabase
    .from('bookings')
    .delete()
    .eq('booking_date', TARGET_DATE)
    .eq('start_time', START_TIME);

  const PARALLEL_REQUESTS_COUNT = 10;
  console.log(`[+] Disparando ${PARALLEL_REQUESTS_COUNT} requisições concorrentes via Promise.all para o mesmo slot...\n`);

  const promises = Array.from({ length: PARALLEL_REQUESTS_COUNT }, (_, index) =>
    executeBookingAttempt(index + 1, CLIENT_ID, SERVICE_ID, TARGET_DATE, START_TIME, END_TIME)
  );

  const results = await Promise.all(promises);

  const successfulBookings = results.filter((r) => r.success);
  const failedBookings = results.filter((r) => !r.success);
  const gistExclusionCatches = failedBookings.filter(
    (r) => r.code === '23P01' || r.errorMessage?.includes('prevent_double_booking')
  );

  console.table(results);

  console.log('\n--- RELATÓRIO DE INTEGRIDADE TRANSACIONAL ---');
  console.log(`Total de requisições: ${PARALLEL_REQUESTS_COUNT}`);
  console.log(`Agendamentos confirmados: ${successfulBookings.length}`);
  console.log(`Rejeições automáticas GiST (Código 23P01): ${gistExclusionCatches.length}`);
  console.log(`Outras falhas: ${failedBookings.length - gistExclusionCatches.length}`);

  if (successfulBookings.length === 1 && gistExclusionCatches.length === PARALLEL_REQUESTS_COUNT - 1) {
    console.log('\n✅ [SUCESSO]: A constraint prevent_double_booking impediu race condition.');
  } else {
    console.error('\n❌ [FALHA]: Inconsistência detectada ou falha de conectividade.');
  }
}

runConcurrencySuite();