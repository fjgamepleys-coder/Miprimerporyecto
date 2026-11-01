import { useCallback, useEffect, useState } from 'react';

export interface MossUser {
  nombre: string;
  municipio: string;
  direccion: string;
  loginMethod: 'google' | 'phone' | null;
  phone?: string;
}

const STORAGE_KEY = 'moss-user';

function loadUser(): MossUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as MossUser;
  } catch {
    // ignore
  }
  return null;
}

export function useAuth() {
  const [user, setUser] = useState<MossUser | null>(() => loadUser());

  const login = useCallback((method: 'google' | 'phone', phone?: string) => {
    // Simulate auth — store a partial user until they complete profile
    const partial: MossUser = {
      nombre: '',
      municipio: '',
      direccion: '',
      loginMethod: method,
      phone,
    };
    setUser(partial);
    // Don't persist yet — wait for profile completion
  }, []);

  const completeProfile = useCallback(
    (nombre: string, municipio: string, direccion: string) => {
      setUser((prev) => {
        const updated: MossUser = {
          ...(prev ?? { loginMethod: null, nombre, municipio, direccion }),
          nombre,
          municipio,
          direccion,
        };
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch {
          // ignore
        }
        return updated;
      });
    },
    [],
  );

  const logout = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    setUser(null);
  }, []);

  const isProfileComplete = !!user?.nombre && !!user?.municipio && !!user?.direccion;

  return { user, isLoggedIn: !!user, isProfileComplete, login, completeProfile, logout };
}
