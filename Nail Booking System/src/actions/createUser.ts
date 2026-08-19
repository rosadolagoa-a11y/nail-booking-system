import { supabase } from '../lib/supabase';
import type { User, UserRole } from '../types/database.types';

interface CreateUserPayload {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
}

export async function createUser(payload: CreateUserPayload): Promise<User> {
  const { data, error } = await supabase
    .from('users')
    .insert({
      name: payload.name,
      email: payload.email,
      password_hash: payload.passwordHash,
      role: payload.role,
    })
    .select('id, name, email, password_hash, role, created_at')
    .single();

  if (error) {
    throw new Error(`Falha ao criar conta: ${error.message}`);
  }

  return data;
}

export default createUser;
