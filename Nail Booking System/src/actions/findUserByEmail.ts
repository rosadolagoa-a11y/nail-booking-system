import { supabase } from '../lib/supabase';
import type { User } from '../types/database.types';

export async function findUserByEmail(payload: { email: string }): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .select('id, name, email, password_hash, role, created_at')
    .eq('email', payload.email)
    .maybeSingle();

  if (error) {
    throw new Error(`Falha ao buscar usuário: ${error.message}`);
  }

  return data;
}

export default findUserByEmail;
