import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { useMutateAction } from '@uibakery/data';
import findUserByEmail from '@/actions/findUserByEmail';
import createUser from '@/actions/createUser';
import { hashPassword, verifyPassword } from '@/app/lib/passwordHash';

export type AppUser = {
  id: number;
  name: string;
  email: string;
  role: 'designer' | 'client';
};

type AuthContextValue = {
  user: AppUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  signup: (name: string, email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEY = 'nail-designer-booking:session';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  const [runFindUser] = useMutateAction(findUserByEmail);
  const [runCreateUser] = useMutateAction(createUser);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        setUser(JSON.parse(raw));
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setLoading(false);
  }, []);

  const persistUser = useCallback((appUser: AppUser | null) => {
    setUser(appUser);
    if (appUser) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(appUser));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const results = await runFindUser({ email: email.trim().toLowerCase() });
      const row = Array.isArray(results) ? results[0] : null;
      if (!row) {
        return { ok: false, error: 'E-mail ou senha inválidos.' };
      }
      const valid = await verifyPassword(password, row.password_hash);
      if (!valid) {
        return { ok: false, error: 'E-mail ou senha inválidos.' };
      }
      persistUser({ id: row.id, name: row.name, email: row.email, role: row.role });
      return { ok: true };
    },
    [runFindUser, persistUser],
  );

  const signup = useCallback(
    async (name: string, email: string, password: string) => {
      const normalizedEmail = email.trim().toLowerCase();
      const existing = await runFindUser({ email: normalizedEmail });
      const existingRow = Array.isArray(existing) ? existing[0] : null;
      if (existingRow) {
        return { ok: false, error: 'Já existe uma conta com este e-mail.' };
      }
      const passwordHash = await hashPassword(password);
      const created = await runCreateUser({
        name: name.trim(),
        email: normalizedEmail,
        passwordHash,
        role: 'client',
      });
      const row = Array.isArray(created) ? created[0] : null;
      if (!row) {
        return { ok: false, error: 'Não foi possível criar a conta. Tente novamente.' };
      }
      persistUser({ id: row.id, name: row.name, email: row.email, role: row.role });
      return { ok: true };
    },
    [runFindUser, runCreateUser, persistUser],
  );

  const logout = useCallback(() => {
    persistUser(null);
  }, [persistUser]);

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
