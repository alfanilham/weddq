import { Route, Routes, useLocation } from "react-router-dom";
import { useEffect } from "react";
import LandingPage from "./pages/Landing";
import LoginPage from "./pages/Login";
import RegisterPage from "./pages/Register";
import TemplatesPage from "./pages/Templates";
import TemplatePreviewPage from "./pages/TemplatePreview";
import DashboardPage from "./pages/Dashboard";
import AdminPage from "./pages/Admin";
import PublicInvitationPage from "./pages/PublicInvitation";
import PreviewFrame from "./pages/PreviewFrame";
import NotFoundPage from "./pages/NotFound";
import { Protected } from "./components/Protected";

function ScrollHashHandler() {
  const loc = useLocation();
  useEffect(() => {
    if (loc.hash) {
      const el = document.querySelector(loc.hash);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      window.scrollTo({ top: 0 });
    }
  }, [loc.pathname, loc.hash]);
  return null;
}

export default function App() {
  return (
    <>
      <ScrollHashHandler />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/templates" element={<TemplatesPage />} />
        <Route path="/templates/:slug" element={<TemplatePreviewPage />} />
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
        <Route
          path="/admin/*"
          element={
            <Protected adminOnly>
              <AdminPage />
            </Protected>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}
