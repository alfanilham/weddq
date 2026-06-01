import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { api } from "@/lib/api";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
};

type Ctx = {
  user: SessionUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<SessionUser>;
  register: (input: { name: string; email: string; password: string; phone?: string }) => Promise<SessionUser>;
  logout: () => void;
};

const AuthCtx = createContext<Ctx | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("weddq_token");
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get<SessionUser>("/auth/me")
      .then((res) => setUser(res.data))
      .catch(() => localStorage.removeItem("weddq_token"))
      .finally(() => setLoading(false));
  }, []);

  async function login(email: string, password: string) {
    const res = await api.post<{ token: string; user: SessionUser }>("/auth/login", { email, password });
    localStorage.setItem("weddq_token", res.data.token);
    setUser(res.data.user);
    return res.data.user;
  }

  async function register(input: { name: string; email: string; password: string; phone?: string }) {
    const res = await api.post<{ token: string; user: SessionUser }>("/auth/register", input);
    localStorage.setItem("weddq_token", res.data.token);
    setUser(res.data.user);
    return res.data.user;
  }

  function logout() {
    localStorage.removeItem("weddq_token");
    setUser(null);
  }

  return <AuthCtx.Provider value={{ user, loading, login, register, logout }}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  const v = useContext(AuthCtx);
  if (!v) throw new Error("useAuth outside AuthProvider");
  return v;
}
