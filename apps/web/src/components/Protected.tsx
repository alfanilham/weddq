import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/store/auth";

export function Protected({ children, adminOnly = false }: { children: ReactNode; adminOnly?: boolean }) {
  const { user, loading } = useAuth();
  const loc = useLocation();
  if (loading) return <div className="container-narrow py-24 text-sepia-soft">Memuat…</div>;
  if (!user) return <Navigate to="/login" replace state={{ from: loc.pathname }} />;
  if (adminOnly && user.role !== "ADMIN") return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}
