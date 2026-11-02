import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { authApi } from '../api/services';
import { TOKEN_KEY } from '../api/client';
import type { LoginRequest, Role, UserSession } from '../types';

interface AuthContextValue {
  session: UserSession | null;
  login: (payload: LoginRequest) => Promise<void>;
  logout: () => void;
  hasRole: (...roles: Role[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function readSession(): UserSession | null {
  const raw = sessionStorage.getItem(TOKEN_KEY);
  if (!raw) return null;
  try {
    const session = JSON.parse(raw) as UserSession;
    if (!session.token || session.expiresAt <= Date.now()) {
      sessionStorage.removeItem(TOKEN_KEY);
      return null;
    }
    return session;
  } catch {
    sessionStorage.removeItem(TOKEN_KEY);
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<UserSession | null>(readSession);
  const logout = useCallback(() => {
    sessionStorage.removeItem(TOKEN_KEY);
    setSession(null);
  }, []);

  useEffect(() => {
    const onUnauthorized = () => logout();
    window.addEventListener('student-hub:unauthorized', onUnauthorized);
    return () => window.removeEventListener('student-hub:unauthorized', onUnauthorized);
  }, [logout]);

  const login = useCallback(async (payload: LoginRequest) => {
    const response = await authApi.login(payload);
    const nextSession: UserSession = {
      email: payload.email,
      roles: response.roles.map((role) => role.replace('ROLE_', '') as Role),
      token: response.token,
      expiresAt: Date.now() + response.expiresIn * 1000,
    };
    sessionStorage.setItem(TOKEN_KEY, JSON.stringify(nextSession));
    setSession(nextSession);
  }, []);

  const value = useMemo(() => ({
    session, login, logout,
    hasRole: (...roles: Role[]) => Boolean(session && roles.some((role) => session.roles.includes(role))),
  }), [session, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider');
  return value;
}
