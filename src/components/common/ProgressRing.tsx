import React from "react";

interface ProgressRingProps {
  progress: number; // 0 to 100
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
  colorScheme?: "indigo" | "emerald" | "amber" | "rose";
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  progress,
  size = 110,
  strokeWidth = 9,
  label,
  sublabel,
  colorScheme = "indigo",
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const boundedProgress = Math.max(0, Math.min(100, progress));
  const strokeDashoffset = circumference - (boundedProgress / 100) * circumference;

  const colorMap = {
    indigo: "stroke-indigo-600 dark:stroke-indigo-400",
    emerald: "stroke-emerald-600 dark:stroke-emerald-400",
    amber: "stroke-amber-500 dark:stroke-amber-400",
    rose: "stroke-rose-600 dark:stroke-rose-400",
  };

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90 transform">
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className="stroke-slate-200 dark:stroke-slate-800"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Fill */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className={`${colorMap[colorScheme]} transition-all duration-1000 ease-out`}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="none"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white tabular-nums">
          {Math.round(boundedProgress)}%
        </span>
        {label && <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">{label}</span>}
        {sublabel && <span className="text-[9px] text-slate-500">{sublabel}</span>}
      </div>
    </div>
  );
};
