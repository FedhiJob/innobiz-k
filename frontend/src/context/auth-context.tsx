"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { authApi } from "@/lib/api";
import { tokenStorage } from "@/lib/storage";
import type { User } from "@/types/api";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (input: { email: string; password: string }) => Promise<User>;
  register: (input: { name: string; email: string; password: string }) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateProfile: (input: {
    name?: string;
    email?: string;
    notifyByEmail?: boolean;
    notifyInApp?: boolean;
  }) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const activeToken = tokenStorage.get();
    if (!activeToken) {
      setUser(null);
      setToken(null);
      return;
    }

    const me = await authApi.me(activeToken);
    setToken(activeToken);
    setUser(me);
  }, []);

  useEffect(() => {
    const run = async () => {
      try {
        await refreshUser();
      } catch {
        tokenStorage.clear();
        setUser(null);
        setToken(null);
      } finally {
        setIsLoading(false);
      }
    };
    void run();
  }, [refreshUser]);

  const login = useCallback(async (input: { email: string; password: string }) => {
    const data = await authApi.login(input);
    tokenStorage.set(data.accessToken);
    setToken(data.accessToken);
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(
    async (input: { name: string; email: string; password: string }) => {
      const data = await authApi.register(input);
      tokenStorage.set(data.accessToken);
      setToken(data.accessToken);
      setUser(data.user);
      return data.user;
    },
    [],
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // no-op
    }
    tokenStorage.clear();
    setToken(null);
    setUser(null);
  }, []);

  const updateProfile = useCallback(
    async (input: {
      name?: string;
      email?: string;
      notifyByEmail?: boolean;
      notifyInApp?: boolean;
    }) => {
    const activeToken = tokenStorage.get();
    if (!activeToken) {
      throw new Error("Not authenticated");
    }

    const updated = await authApi.updateProfile(activeToken, input);
    setUser(updated);
    },
    [],
  );

  const value = useMemo(
    () => ({
      user,
      token,
      isLoading,
      login,
      register,
      logout,
      refreshUser,
      updateProfile,
    }),
    [user, token, isLoading, login, register, logout, refreshUser, updateProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
