import React, { useState, useEffect } from "react";
import { useTwin } from "../context/TwinContext";
import { api } from "../api";
import {
  Network,
  GitBranch,
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
  Clock,
  Sparkles,
  Search,
  ZoomIn,
  ZoomOut,
  RotateCcw,
} from "lucide-react";

export const GraphPage: React.FC = () => {
  const { user, twin, notify } = useTwin();
  const [nodes, setNodes] = useState<any[]>([]);
  const [edges, setEdges] = useState<any[]>([]);
  const [selectedNodeKey, setSelectedNodeKey] = useState<string>("backtracking_and_rollback");
  const [activeTrace, setActiveTrace] = useState<any>(null);
  const [isTracing, setIsTracing] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    async function loadGraph() {
      try {
        const res = await api.getGraph();
        if (res.nodes) setNodes(res.nodes);
        if (res.edges) setEdges(res.edges);
      } catch (err) {
        console.error("Failed to load graph:", err);
      }
    }
    loadGraph();
  }, [user]);

  const handleTraceRootCause = async (key: string) => {
    setIsTracing(true);
    try {
      const trace = await api.traceRootCause(key);
      setActiveTrace(trace);
      notify(`Root cause traced: ${trace.rootConceptKey.replace(/_/g, " ")} (${trace.daysSaved} days saved)`, "info");
    } catch (err: any) {
      notify(err.message || "Failed to trace root cause", "error");
    } finally {
      setIsTracing(false);
    }
  };

  const selectedNode = nodes.find((n) => n.id === selectedNodeKey);

  // Position calculation for visual DAG layout by cluster
  const clusterXOffsets: Record<string, number> = {
    "Foundations & Memory": 120,
    "Recursion & Backtracking": 360,
    "Linear Data Structures": 600,
    "Trees & Graphs": 840,
    "Dynamic Programming": 1080,
  };

  const filteredNodes = nodes.filter((n) =>
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.cluster.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      {/* Top Controls Bar */}
      <div className="p-4 md:px-8 border-b border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/40 backdrop-blur-md flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Network className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 dark:text-white">
              Prerequisite Knowledge Graph
            </h1>
            <p className="text-xs text-slate-500">
              Interactive topological dependency network with root-cause tracing
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search concepts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          {/* Zoom controls */}
          <div className="flex items-center gap-1 p-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <button
              onClick={() => setZoomLevel((z) => Math.max(0.6, z - 0.1))}
              className="p-1 text-slate-500 hover:text-slate-900 dark:hover:text-white"
              aria-label="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-mono px-1 tabular-nums text-slate-500">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(1.5, z + 0.1))}
              className="p-1 text-slate-500 hover:text-slate-900 dark:hover:text-white"
              aria-label="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Workspace: Interactive Canvas + Side Panel */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* SVG Interactive Canvas */}
        <div className="flex-1 overflow-auto p-8 flex items-center justify-center min-h-[500px] bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:20px_20px]">
          <div
            style={{ transform: `scale(${zoomLevel})`, transformOrigin: "center center" }}
            className="transition-transform duration-200"
          >
            <svg width="1250" height="750" className="overflow-visible">
              <defs>
                <marker
                  id="arrow"
                  viewBox="0 0 10 10"
                  refX="18"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#94A3B8" />
                </marker>
                <marker
                  id="arrow-active"
                  viewBox="0 0 10 10"
                  refX="18"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#F43F5E" />
                </marker>
              </defs>

              {/* Render Cluster Background Columns */}
              {Object.entries(clusterXOffsets).map(([clusterName, x]) => (
                <g key={clusterName}>
                  <rect
                    x={x - 85}
                    y={30}
                    width={170}
                    height={680}
                    rx={16}
                    className="fill-slate-100/40 dark:fill-slate-900/20 stroke-slate-200/40 dark:stroke-slate-800/40"
                  />
                  <text
                    x={x}
                    y={52}
                    textAnchor="middle"
                    className="fill-slate-400 dark:fill-slate-500 text-[10px] uppercase font-bold tracking-wider"
                  >
                    {clusterName}
                  </text>
                </g>
              ))}

              {/* Render Edges */}
              {edges.map((e, idx) => {
                const sourceNode = nodes.find((n) => n.id === e.source);
                const targetNode = nodes.find((n) => n.id === e.target);
                if (!sourceNode || !targetNode) return null;

                const sIndex = nodes.filter((n) => n.cluster === sourceNode.cluster).indexOf(sourceNode);
                const tIndex = nodes.filter((n) => n.cluster === targetNode.cluster).indexOf(targetNode);

                const sx = clusterXOffsets[sourceNode.cluster] || 150;
                const sy = 100 + sIndex * 95;
                const tx = clusterXOffsets[targetNode.cluster] || 350;
                const ty = 100 + tIndex * 95;

                // Is edge part of active backward trace?
                const isTraceEdge =
                  activeTrace &&
                  activeTrace.chain.includes(e.source) &&
                  activeTrace.chain.includes(e.target);

                return (
                  <path
                    key={idx}
                    d={`M ${sx} ${sy} C ${(sx + tx) / 2} ${sy}, ${(sx + tx) / 2} ${ty}, ${tx} ${ty}`}
                    fill="none"
                    stroke={isTraceEdge ? "#F43F5E" : "#CBD5E1"}
                    strokeWidth={isTraceEdge ? 3.5 : 1.5}
                    strokeDasharray={isTraceEdge ? "6 3" : undefined}
                    className={isTraceEdge ? "animate-pulse" : undefined}
                    markerEnd={isTraceEdge ? "url(#arrow-active)" : "url(#arrow)"}
                  />
                );
              })}

              {/* Render Nodes */}
              {nodes.map((n) => {
                const clusterNodes = nodes.filter((item) => item.cluster === n.cluster);
                const indexInCluster = clusterNodes.indexOf(n);
                const x = clusterXOffsets[n.cluster] || 150;
                const y = 100 + indexInCluster * 95;

                const isSelected = selectedNodeKey === n.id;
                const isRootCause = activeTrace && activeTrace.rootConceptKey === n.id;
                const isFailing = activeTrace && activeTrace.failingConceptKey === n.id;
                const isTraceChain = activeTrace && activeTrace.chain.includes(n.id);

                const masteryPct = Math.round(n.mastery * 100);

                let fillHex = "#10B981"; // Emerald
                let borderHex = "#10B981";
                if (isRootCause) {
                  fillHex = "#F43F5E"; // Rose
                  borderHex = "#F43F5E";
                } else if (masteryPct < 45) {
                  fillHex = "#F43F5E";
                  borderHex = "#F43F5E";
                } else if (masteryPct < 75) {
                  fillHex = "#F59E0B"; // Amber
                  borderHex = "#F59E0B";
                }

                return (
                  <g
                    key={n.id}
                    transform={`translate(${x}, ${y})`}
                    onClick={() => {
                      setSelectedNodeKey(n.id);
                      if (n.mastery < 0.75 || n.activeMisconception) {
                        handleTraceRootCause(n.id);
                      }
                    }}
                    className="cursor-pointer group"
                  >
                    {/* Pulsing ring if root cause */}
                    {isRootCause && (
                      <circle
                        r="32"
                        fill="none"
                        stroke="#F43F5E"
                        strokeWidth="2"
                        className="animate-ping opacity-75"
                      />
                    )}

                    {/* Node circle */}
                    <circle
                      r={isSelected ? 26 : 22}
                      fill={fillHex}
                      fillOpacity={isSelected ? 0.25 : 0.15}
                      stroke={borderHex}
                      strokeWidth={isSelected ? 3 : 2}
                      className="transition-all group-hover:scale-110"
                    />

                    {/* Mastery text */}
                    <text
                      y="4"
                      textAnchor="middle"
                      fontSize="10"
                      fontWeight="bold"
                      fill={fillHex}
                      className="tabular-nums"
                    >
                      {masteryPct}%
                    </text>

                    {/* Label below */}
                    <text
                      y="38"
                      textAnchor="middle"
                      fontSize="9"
                      fontWeight={isSelected ? "bold" : "medium"}
                      className="fill-slate-800 dark:fill-slate-200 pointer-events-none"
                    >
                      {n.title.length > 20 ? n.title.slice(0, 18) + "..." : n.title}
                    </text>

                    {/* Misconception indicator tag */}
                    {n.activeMisconception && (
                      <circle cx="16" cy="-16" r="5" fill="#F43F5E" />
                    )}
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Side Panel: Root Cause Diagnostic & Recommendation */}
        <div className="w-full lg:w-96 border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 flex flex-col justify-between overflow-y-auto max-h-[600px] lg:max-h-none">
          {selectedNode ? (
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                    {selectedNode.cluster}
                  </span>
                  <span className="text-xs font-semibold tabular-nums text-slate-700 dark:text-slate-300">
                    {Math.round(selectedNode.mastery * 100)}% Mastery
                  </span>
                </div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  {selectedNode.title}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-1">
                  {selectedNode.summary}
                </p>
              </div>

              {/* Active Misconception on this node */}
              {selectedNode.activeMisconception && (
                <div className="p-4 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/30">
                  <div className="flex items-center gap-2 text-rose-700 dark:text-rose-300 font-bold text-xs mb-1">
                    <ShieldAlert className="w-4 h-4 text-rose-500" />
                    <span>Diagnosed Misconception</span>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    "{selectedNode.activeMisconception.description}"
                  </p>
                  <div className="mt-2 text-[11px] font-semibold text-rose-600 dark:text-rose-400 tabular-nums">
                    Confidence: {Math.round(selectedNode.activeMisconception.confidence * 100)}%
                  </div>
                </div>
              )}

              {/* Root Cause Trace Findings */}
              {activeTrace && (
                <div className="p-4 rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/40 dark:bg-indigo-950/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
                      <GitBranch className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      <span>Root Cause Chain Found</span>
                    </span>
                    <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                      ~{activeTrace.daysSaved} Days Saved
                    </span>
                  </div>

                  {/* Chain sequence */}
                  <div className="text-xs font-mono bg-white/70 dark:bg-slate-900/70 p-2.5 rounded-lg border border-indigo-100 dark:border-indigo-900/40 space-y-1">
                    {activeTrace.chain.map((stepKey: string, idx: number) => {
                      const isRoot = stepKey === activeTrace.rootConceptKey;
                      return (
                        <div key={stepKey} className="flex items-center gap-2 text-[11px]">
                          <span className="text-slate-400">{idx + 1}.</span>
                          <span className={isRoot ? "font-bold text-rose-600 dark:text-rose-400" : "text-slate-700 dark:text-slate-300"}>
                            {stepKey.replace(/_/g, " ")} {isRoot ? "← ROOT BLOCKER" : ""}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    {activeTrace.explanation}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={() => handleTraceRootCause(selectedNode.id)}
                  disabled={isTracing}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all flex items-center justify-center gap-2"
                >
                  <GitBranch className="w-3.5 h-3.5" />
                  <span>{isTracing ? "Tracing Dependency DAG..." : "Trace Root Cause Backward"}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400 text-xs">
              Select any concept node in the DAG to inspect prerequisites and trigger root cause analysis.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
