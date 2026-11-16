import React, { useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTwin } from "../../context/TwinContext";
import {
  Sun,
  Moon,
  Cpu,
  ChevronDown,
  LogIn,
  LogOut,
  Settings,
  Compass,
  UserCheck,
  Sparkles,
} from "lucide-react";

export const Navbar: React.FC = () => {
  const { user, theme, toggleTheme, switchPersona, logout } = useTwin();
  const location = useLocation();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setDropdownOpen(false);
    }
    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const signedInLinks = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Interests & Scope", href: "/scope" },
    { label: "Knowledge Graph", href: "/graph" },
    { label: "Path Simulator", href: "/simulate" },
    { label: "My Path", href: "/path" },
  ];

  const handleSignOut = () => {
    setDropdownOpen(false);
    logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8 px-6 py-3.5">
        {/* Zone 1: Brand Wordmark */}
        <Link to="/" className="flex items-center gap-2 shrink-0 whitespace-nowrap">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 via-violet-600 to-sky-500 flex items-center justify-center text-white shadow-sm shadow-indigo-500/20">
            <Cpu className="w-4 h-4" />
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap">
            LearnTwin
          </span>
        </Link>

        {/* Zone 2: Navigation links (only show user workspace links when signed in) */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
          {user ? (
            signedInLinks.map((link) => {
              const isActive = location.pathname === link.href;
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`whitespace-nowrap shrink-0 transition-colors ${
                    isActive
                      ? "text-indigo-600 dark:text-indigo-400 font-semibold"
                      : "hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })
          ) : (
            <>
              <a
                href="/#how-it-works"
                className="whitespace-nowrap shrink-0 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                How It Works
              </a>
              <Link
                to="/login"
                className="whitespace-nowrap shrink-0 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                Sign In
              </Link>
            </>
          )}
        </nav>

        {/* Zone 3: Theme toggle + Authenticated Menu OR Sign-In CTA */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>

          {user ? (
            <>
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs font-medium text-slate-700 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700 transition-colors whitespace-nowrap shrink-0"
                  aria-label="User Account Menu"
                  aria-expanded={dropdownOpen}
                >
                  <span className="truncate max-w-[120px]">{user.name.split(" ")[0]}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl p-1.5 z-50">
                    <div className="px-2.5 py-2 border-b border-slate-100 dark:border-slate-800 mb-1">
                      <div className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                        {user.name}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {user.email}
                      </div>
                    </div>

                    <Link
                      to="/scope"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 w-full text-left px-2.5 py-2 rounded-lg text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Interests & Future Scope</span>
                    </Link>
                    <Link
                      to="/start"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 w-full text-left px-2.5 py-2 rounded-lg text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <Compass className="w-3.5 h-3.5 text-slate-400" />
                      <span>Goal Calibration Wizard</span>
                    </Link>
                    <Link
                      to="/login"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 w-full text-left px-2.5 py-2 rounded-lg text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                      <span>Switch Account</span>
                    </Link>
                    <Link
                      to="/settings"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 w-full text-left px-2.5 py-2 rounded-lg text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <Settings className="w-3.5 h-3.5 text-slate-400" />
                      <span>Twin Settings & Export</span>
                    </Link>

                    <div className="my-1 border-t border-slate-100 dark:border-slate-800" />
                    <div className="px-2.5 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      Quick Demo Personas
                    </div>
                    <button
                      onClick={() => {
                        switchPersona("aarav");
                        setDropdownOpen(false);
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <div className="font-semibold text-slate-900 dark:text-white">Aarav Sharma</div>
                      <div className="text-[11px] text-slate-500">Beginner · 3 hrs/wk · Foundations</div>
                    </button>
                    <button
                      onClick={() => {
                        switchPersona("meera");
                        setDropdownOpen(false);
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <div className="font-semibold text-slate-900 dark:text-white">Meera Patel</div>
                      <div className="text-[11px] text-slate-500">Intermediate · 5 hrs/wk · Recursion Gap</div>
                    </button>
                    <button
                      onClick={() => {
                        switchPersona("rohan");
                        setDropdownOpen(false);
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <div className="font-semibold text-slate-900 dark:text-white">Rohan Verma</div>
                      <div className="text-[11px] text-slate-500">Advanced · 4 hrs/wk · Forgetting Prone</div>
                    </button>

                    <div className="my-1 border-t border-slate-100 dark:border-slate-800" />
                    <button
                      onClick={handleSignOut}
                      className="flex items-center gap-2 w-full text-left px-2.5 py-2 rounded-lg text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>

              <Link
                to="/quiz"
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm shadow-indigo-500/20 transition-all whitespace-nowrap shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Diagnostic Quiz</span>
              </Link>
            </>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm shadow-indigo-500/20 transition-all whitespace-nowrap shrink-0"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};
