import React from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { TwinProvider, useTwin } from "./context/TwinContext";
import { Navbar } from "./components/common/Navbar";
import { Sidebar } from "./components/common/Sidebar";
import { ToastContainer } from "./components/common/ToastContainer";
import { Loader2 } from "lucide-react";

// Pages
import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";
import { InterestScopePage } from "./pages/InterestScopePage";
import { StartPage } from "./pages/StartPage";
import { DashboardPage } from "./pages/DashboardPage";
import { QuizPage } from "./pages/QuizPage";
import { GraphPage } from "./pages/GraphPage";
import { SimulatePage } from "./pages/SimulatePage";
import { PathPage } from "./pages/PathPage";
import { DiffPage } from "./pages/DiffPage";
import { ReviewsPage } from "./pages/ReviewsPage";
import { InsightsPage } from "./pages/InsightsPage";
import { SettingsPage } from "./pages/SettingsPage";
import { ExplainPage } from "./pages/ExplainPage";

const RequireAuth: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { user, isLoading } = useTwin();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-12 text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-2.5 text-sm font-medium">
          <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
          <span>Loading session...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    const target = `${location.pathname}${location.search}`;
    return <Navigate to={`/login?redirect=${encodeURIComponent(target)}`} replace />;
  }

  return children;
};

const AppLayout: React.FC = () => {
  const { user } = useTwin();
  const location = useLocation();
  const hideSidebar =
    !user ||
    location.pathname === "/" ||
    location.pathname === "/start" ||
    location.pathname === "/login";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans transition-colors duration-200">
      <Navbar />

      <div className="flex-1 flex">
        {!hideSidebar && <Sidebar />}

        <main className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/scope" element={<RequireAuth><InterestScopePage /></RequireAuth>} />
            <Route path="/start" element={<RequireAuth><StartPage /></RequireAuth>} />
            <Route path="/dashboard" element={<RequireAuth><DashboardPage /></RequireAuth>} />
            <Route path="/quiz" element={<RequireAuth><QuizPage /></RequireAuth>} />
            <Route path="/graph" element={<RequireAuth><GraphPage /></RequireAuth>} />
            <Route path="/simulate" element={<RequireAuth><SimulatePage /></RequireAuth>} />
            <Route path="/path" element={<RequireAuth><PathPage /></RequireAuth>} />
            <Route path="/diff" element={<RequireAuth><DiffPage /></RequireAuth>} />
            <Route path="/reviews" element={<RequireAuth><ReviewsPage /></RequireAuth>} />
            <Route path="/insights" element={<RequireAuth><InsightsPage /></RequireAuth>} />
            <Route path="/explain" element={<RequireAuth><ExplainPage /></RequireAuth>} />
            <Route path="/settings" element={<RequireAuth><SettingsPage /></RequireAuth>} />
          </Routes>
        </main>
      </div>

      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <TwinProvider>
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    </TwinProvider>
  );
}
