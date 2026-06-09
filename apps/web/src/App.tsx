import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { smoothScrollToHash } from "./lib/smoothScroll";
import LandingPage from "./pages/Landing";
import LoginPage from "./pages/Login";
import RegisterPage from "./pages/Register";
import TemplatesPage from "./pages/Templates";
import TemplatePreviewPage from "./pages/TemplatePreview";
import PanduanPage from "./pages/Panduan";
import DashboardPage from "./pages/Dashboard";
import PublicInvitationPage from "./pages/PublicInvitation";
import PreviewFrame from "./pages/PreviewFrame";
import { Protected } from "./components/Protected";
import { PageLoader } from "./components/PageLoader";

function ScrollHashHandler() {
  const loc = useLocation();
  useEffect(() => {
    if (loc.hash) {
      // Small delay to let the page mount before scrolling
      setTimeout(() => smoothScrollToHash(loc.hash), 80);
    } else {
      window.scrollTo({ top: 0 });
    }
  }, [loc.pathname, loc.hash]);
  return null;
}

/** Host yang menyajikan situs utama weddQ (marketing + dasbor). Sisanya
 *  dianggap custom domain Eksklusif → hanya menampilkan undangan. */
const PRIMARY_HOST = import.meta.env.VITE_PRIMARY_HOST || "weddq.id";
function isCustomDomain(host: string): boolean {
  if (host === "localhost" || host === "127.0.0.1" || host.endsWith(".local")) return false;
  return host !== PRIMARY_HOST && !host.endsWith(`.${PRIMARY_HOST}`);
}

export default function App() {
  const host = window.location.hostname;

  // Diakses dari domain Eksklusif (mis. asdfasd.my.id) → render undangannya saja.
  if (isCustomDomain(host)) {
    return (
      <>
        <PageLoader />
        <PublicInvitationPage domainHost={host} />
      </>
    );
  }

  return (
    <>
      <ScrollHashHandler />
      <PageLoader />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/templates" element={<TemplatesPage />} />
        <Route path="/templates/:slug" element={<TemplatePreviewPage />} />
        <Route path="/panduan" element={<PanduanPage />} />
        <Route path="/u/:slug" element={<PublicInvitationPage />} />
        <Route path="/preview-frame/:slug" element={<PreviewFrame />} />
        {/* Pretty slug: weddq.id/arini-bagas — must be after specific routes */}
        <Route path="/:slug" element={<PublicInvitationPage />} />
        <Route
          path="/dashboard/*"
          element={
            <Protected>
              <DashboardPage />
            </Protected>
          }
        />
        {/* /admin merged into /dashboard/admin — redirect legacy links */}
        <Route path="/admin" element={<Navigate to="/dashboard/admin" replace />} />
        <Route path="/admin/*" element={<Navigate to="/dashboard/admin" replace />} />
        {/* Path tak dikenal di root → beranda (dashboard ditangani di dalam DashboardPage) */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
