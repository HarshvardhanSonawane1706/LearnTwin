import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useTwin } from "../context/TwinContext";
import {
  Cpu,
  Mail,
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  Loader2,
  Database,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

type AuthMode = "login" | "register";

const DEMO_ACCOUNTS: Array<{
  id: "meera" | "aarav" | "rohan";
  name: string;
  email: string;
  track: string;
  summary: string;
}> = [
  {
    id: "meera",
    name: "Meera Patel",
    email: "meera@learntwin.dev",
    track: "Intermediate · 5 hrs/wk",
    summary: "Recursion & Call Stack root-cause gap",
  },
  {
    id: "aarav",
    name: "Aarav Sharma",
    email: "aarav@learntwin.dev",
    track: "Beginner · 3 hrs/wk",
    summary: "Memory references & mutable defaults",
  },
  {
    id: "rohan",
    name: "Rohan Verma",
    email: "rohan@learntwin.dev",
    track: "Advanced · 4 hrs/wk",
    summary: "DP & Graphs interview decay sprint",
  },
];

export const LoginPage: React.FC = () => {
  const { user, dbMode, loginWithEmail, registerAccount, switchPersona } = useTwin();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const rawRedirect = searchParams.get("redirect");
  const safeRedirect =
    rawRedirect && rawRedirect.startsWith("/") && !rawRedirect.startsWith("//")
      ? rawRedirect
      : null;

  const initialMode: AuthMode = searchParams.get("mode") === "register" ? "register" : "login";
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [demoLoading, setDemoLoading] = useState<string | null>(null);

  useEffect(() => {
    setError(null);
  }, [mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedEmail = email.trim();
    if (mode === "register" && name.trim().length < 2) {
      setError("Please enter your full name (at least 2 characters).");
      return;
    }
    if (!trimmedEmail || !trimmedEmail.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    if (mode === "register" && password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    if (mode === "login" && password.length === 0) {
      setError("Please enter your password.");
      return;
    }

    setSubmitting(true);
    try {
      if (mode === "login") {
        const res = await loginWithEmail(trimmedEmail, password);
        const hasInterests = Boolean(
          res.interestProfile &&
            ((res.interestProfile.interests && res.interestProfile.interests.length > 0) ||
              res.interestProfile.customInterest)
        );
        navigate(safeRedirect || (hasInterests ? "/dashboard" : "/scope"), { replace: true });
      } else {
        await registerAccount(name.trim(), trimmedEmail, password);
        navigate(safeRedirect || "/scope", { replace: true });
      }
    } catch (err: any) {
      setError(err?.message || "Authentication failed. Please check your credentials.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickFill = (demoEmail: string) => {
    setMode("login");
    setEmail(demoEmail);
    setPassword("demo1234");
    setError(null);
  };

  const handleInstantPersona = async (personaId: "aarav" | "meera" | "rohan") => {
    setError(null);
    setDemoLoading(personaId);
    try {
      await switchPersona(personaId);
      navigate(safeRedirect || "/scope", { replace: true });
    } catch (err: any) {
      setError(err?.message || "Could not load demo persona.");
    } finally {
      setDemoLoading(null);
    }
  };

  return (
    <div className="min-h-[calc(100vh-65px)] bg-slate-50 dark:bg-slate-950 py-10 px-6 flex items-center justify-center">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Auth Card */}
        <section className="lg:col-span-7 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-6 sm:p-8">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-sky-500 flex items-center justify-center text-white shadow-sm">
                <Cpu className="w-4 h-4" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                  {mode === "login" ? "Sign in to LearnTwin" : "Create your LearnTwin account"}
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {mode === "login"
                    ? "Resume your cognitive digital twin, mastery estimates, and adaptive roadmap."
                    : "Persist your BKT mastery state, misconception profile, and path snapshots."}
                </p>
              </div>
            </div>
          </div>

          {user && (
            <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/70 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-200">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span>
                  Currently active as <strong>{user.name}</strong> ({user.email})
                </span>
              </div>
              <Link
                to="/dashboard"
                className="font-semibold text-emerald-700 dark:text-emerald-300 hover:underline whitespace-nowrap"
              >
                Go to Dashboard →
              </Link>
            </div>
          )}

          {/* Mode Toggle */}
          <div
            role="tablist"
            aria-label="Authentication mode"
            className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 mb-6"
          >
            <button
              type="button"
              role="tab"
              aria-selected={mode === "login"}
              onClick={() => setMode("login")}
              className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                mode === "login"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === "register"}
              onClick={() => setMode("register")}
              className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                mode === "register"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Create Account
            </button>
          </div>

          {error && (
            <div
              role="alert"
              className="mb-5 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/70 flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-300"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {mode === "register" && (
              <div>
                <label
                  htmlFor="auth-name"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
                >
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="auth-name"
                    type="text"
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ananya Rao"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label
                htmlFor="auth-email"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="auth-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="auth-password"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Password
                </label>
                {mode === "register" && (
                  <span className="text-[11px] text-slate-400">Minimum 6 characters</span>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="auth-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === "login" ? "Enter your password" : "Create a strong password"}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm shadow-indigo-500/20 transition-all hover:scale-[1.01] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{mode === "login" ? "Signing in..." : "Creating account..."}</span>
                </>
              ) : (
                <>
                  <span>{mode === "login" ? "Sign In" : "Create Account & Initialize Twin"}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick-fill credentials for testing real password auth */}
          <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Seeded Account Credentials
              </span>
              <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                password: <strong className="text-slate-700 dark:text-slate-200">demo1234</strong>
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {DEMO_ACCOUNTS.map((acct) => (
                <button
                  key={acct.id}
                  type="button"
                  onClick={() => handleQuickFill(acct.email)}
                  className="text-left p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-indigo-50/40 dark:hover:bg-indigo-950/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                >
                  <div className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                    {acct.name}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {acct.email}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Right Side Panel: Persistence Info & 1-Click Demo Launchers */}
        <aside className="lg:col-span-5 space-y-5">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-6">
            <div className="flex items-center gap-2.5 mb-3">
              <Database className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Persistent Digital Twin Storage
              </h2>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
              Every registered account, goal configuration, diagnostic attempt, BKT mastery score, and Path Diff snapshot is persisted in our relational SQL database (
              <span className="font-mono text-slate-800 dark:text-slate-200">{dbMode}</span>
              ) with bcrypt password hashing and signed JWT sessions.
            </p>
            <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
              <li className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Passwords hashed with salted bcrypt; private credentials never leave the server.</span>
              </li>
              <li className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-violet-500 shrink-0 mt-0.5" />
                <span>New accounts start with a calibrated baseline twin ready for the Goal Wizard.</span>
              </li>
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-6">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
              Instant Demo Personas
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Jump directly into a pre-seeded cognitive profile without typing credentials.
            </p>
            <div className="space-y-2.5">
              {DEMO_ACCOUNTS.map((persona) => {
                const isLoadingThis = demoLoading === persona.id;
                return (
                  <button
                    key={persona.id}
                    type="button"
                    disabled={demoLoading !== null}
                    onClick={() => handleInstantPersona(persona.id)}
                    className="w-full flex items-center justify-between gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 bg-slate-50/50 dark:bg-slate-950/40 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 transition-all text-left disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                        <span>{persona.name}</span>
                        <span className="text-slate-400">·</span>
                        <span className="font-medium text-indigo-600 dark:text-indigo-400">
                          {persona.track}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {persona.summary}
                      </div>
                    </div>
                    {isLoadingThis ? (
                      <Loader2 className="w-4 h-4 text-indigo-600 animate-spin shrink-0" />
                    ) : (
                      <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};
