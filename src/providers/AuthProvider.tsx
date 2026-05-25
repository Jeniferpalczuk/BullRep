'use client';

import { createContext, useEffect, useState } from 'react';

import type {
  BullrepFitnessLevel,
  BullrepFrequency,
  BullrepGoal,
} from '@/features/profile/options';
import { apiRequest } from '@/lib/apiClient';
import type { DbProfile } from '@/types';

export type BullrepProfile = DbProfile;

type AuthSession = {
  user: {
    id: string;
    email: string;
    user_metadata?: {
      name?: string;
    };
  };
};

type AuthUser = AuthSession['user'];

type AuthContextValue = {
  loading: boolean;
  session: AuthSession | null;
  authUser: AuthUser | null;
  profile: BullrepProfile | null;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  signUpWithProfile: (payload: {
    name: string;
    email: string;
    password: string;
    weight: number;
    height: number;
    goal: BullrepGoal;
    fitness_level: BullrepFitnessLevel;
    frequency: BullrepFrequency;
    avatar_url?: string;
  }) => Promise<{ error?: string; needsEmailConfirmation?: boolean }>;
  updateProfile: (
    patch: Partial<
      Pick<BullrepProfile, 'name' | 'weight' | 'height' | 'goal' | 'fitness_level' | 'frequency' | 'avatar_url'>
    >
  ) => Promise<{ error?: string }>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

function buildSession(profile: BullrepProfile | null): AuthSession | null {
  if (!profile) return null;

  return {
    user: {
      id: profile.id,
      email: profile.email,
      user_metadata: {
        name: profile.name,
      },
    },
  };
}

type ApiProfilePayload = {
  id: string;
  email: string;
  name: string;
  weight: number | null;
  height: number | null;
  goal: string | null;
  fitness_level: string | null;
  frequency: string | null;
  avatar_url: string | null;
  app_level: number;
  xp: number;
  is_admin?: boolean;
};

const normalizeGoal = (value: string | null): DbProfile['goal'] =>
  value === 'Ganhar massa' || value === 'Emagrecer' || value === 'Manter peso' ? value : null;

const normalizeFitnessLevel = (value: string | null): DbProfile['fitness_level'] =>
  value === 'Iniciante' || value === 'Intermediário' || value === 'Avançado' ? value : null;

const normalizeFrequency = (value: string | null): DbProfile['frequency'] =>
  value === '2x' || value === '3x' || value === '4x' || value === '5x+' ? value : null;

function buildProfile(payload: ApiProfilePayload): BullrepProfile {
  const now = new Date().toISOString();
  return {
    id: payload.id,
    email: payload.email,
    name: payload.name,
    weight: payload.weight,
    height: payload.height,
    goal: normalizeGoal(payload.goal),
    fitness_level: normalizeFitnessLevel(payload.fitness_level),
    frequency: normalizeFrequency(payload.frequency),
    avatar_url: payload.avatar_url,
    app_level: payload.app_level,
    xp: payload.xp,
    is_admin: payload.is_admin ?? false,
    created_at: now,
    updated_at: now,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<BullrepProfile | null>(null);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        const data = await apiRequest<{ user: ApiProfilePayload }>('/api/auth/me');
        const nextProfile = buildProfile(data.user);

        if (!mounted) return;
        setProfile(nextProfile);
        const nextSession = buildSession(nextProfile);
        setSession(nextSession);
        setAuthUser(nextSession?.user ?? null);
      } catch {
        if (!mounted) return;
        setProfile(null);
        setSession(null);
        setAuthUser(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void init();

    return () => {
      mounted = false;
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const data = await apiRequest<{ user: ApiProfilePayload }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      const nextProfile = buildProfile(data.user);

      setProfile(nextProfile);
      const nextSession = buildSession(nextProfile);
      setSession(nextSession);
      setAuthUser(nextSession?.user ?? null);
      return {};
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Erro ao entrar.' };
    }
  };

  const signOut = async () => {
    await apiRequest('/api/auth/logout', { method: 'POST' });
    setProfile(null);
    setSession(null);
    setAuthUser(null);
  };

  const signUpWithProfile: AuthContextValue['signUpWithProfile'] = async (payload) => {
    try {
      const data = await apiRequest<{
        user: ApiProfilePayload;
        needsEmailConfirmation?: boolean;
        blueEmailConfirmation?: boolean;
      }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      const nextProfile = buildProfile(data.user);

      setProfile(nextProfile);
      const nextSession = buildSession(nextProfile);
      setSession(nextSession);
      setAuthUser(nextSession?.user ?? null);
      return { needsEmailConfirmation: data.needsEmailConfirmation ?? data.blueEmailConfirmation ?? false };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Erro ao criar conta.' };
    }
  };

  const updateProfile: AuthContextValue['updateProfile'] = async (patch) => {
    try {
      const data = await apiRequest<{ profile: BullrepProfile }>('/api/profile', {
        method: 'PATCH',
        body: JSON.stringify(patch),
      });

      setProfile(data.profile);
      const nextSession = buildSession(data.profile);
      setSession(nextSession);
      setAuthUser(nextSession?.user ?? null);
      return {};
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Erro ao atualizar perfil.' };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        loading,
        session,
        authUser,
        profile,
        signIn,
        signOut,
        signUpWithProfile,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
