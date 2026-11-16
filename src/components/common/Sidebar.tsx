import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  HelpCircle,
  Network,
  GitCompare,
  Clock,
  Compass,
  LineChart,
  MessageSquare,
  Settings,
  Sparkles,
} from "lucide-react";

export const Sidebar: React.FC = () => {
  const location = useLocation();

  const links = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Interests & Scope", href: "/scope", icon: Sparkles },
    { label: "Diagnostic Quiz", href: "/quiz", icon: HelpCircle },
    { label: "Knowledge Graph", href: "/graph", icon: Network },
    { label: "Path Simulator", href: "/simulate", icon: Compass },
    { label: "My Learning Path", href: "/path", icon: GitCompare },
    { label: "Visual Path Diff", href: "/diff", icon: GitCompare },
    { label: "Review Scheduler", href: "/reviews", icon: Clock },
    { label: "Cohort Insights", href: "/insights", icon: LineChart },
    { label: "Explain-Back AI", href: "/explain", icon: MessageSquare },
    { label: "Settings & Twin", href: "/settings", icon: Settings },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 shrink-0 border-r border-slate-200 dark:border-slate-800/80 bg-white/50 dark:bg-slate-900/30 p-4">
      <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2">
        Learning Navigation
      </div>
      <nav className="flex flex-col gap-1">
        {links.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.href}
              to={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
                isActive
                  ? "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-semibold shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400"}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};
