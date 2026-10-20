import React, { useState, useEffect, useRef } from "react";
import {
  GitCommit,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Download,
  Info,
  Sparkles,
  Layers,
} from "lucide-react";
import { useWorkspace } from "../context/WorkspaceContext";
import { apiClient } from "../lib/api-client";
import type { AutomataGraph } from "../types";

export const AutomataPage: React.FC = () => {
  const { activePDA, samplePDAs, loadSamplePDA } = useWorkspace();
  const [graphData, setGraphData] = useState<AutomataGraph | null>(null);
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 250, y: 150 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (activePDA) {
      apiClient.getPDAVisualGraph(activePDA).then((res) => {
        setGraphData(res);
      }).catch(console.error);
    }
  }, [activePDA]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const exportSVG = () => {
    if (!svgRef.current) return;
    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svgRef.current);
    const blob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pda-graph-${activePDA?.name.toLowerCase().replace(/\s+/g, "-") || "automata"}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#06b6d4]" />
            <span className="text-[11px] font-mono font-semibold tracking-wider uppercase text-cyan-400">
              State Transition Topography
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white font-display">
            PDA State-Transition Diagram
          </h1>
          <p className="text-xs md:text-sm text-slate-400">
            Interactive visual transition graph with state properties, self-loops, and stack transition labels.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {graphData && (
            <button
              onClick={exportSVG}
              className="px-4 py-2 bg-slate-900/80 hover:bg-slate-800 border border-white/10 text-slate-300 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all shadow-sm"
            >
              <Download className="w-4 h-4 text-cyan-400" />
              <span>Export SVG</span>
            </button>
          )}
        </div>
      </div>

      {/* Control / Toolbar */}
      <div className="glass-card p-4 border border-white/10 shadow-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-300">Preset:</span>
          <select
            onChange={(e) => {
              if (e.target.value) loadSamplePDA(e.target.value);
            }}
            defaultValue="pda-anbn"
            className="px-3.5 py-2 bg-slate-950/60 font-medium text-xs border border-white/10 rounded-xl text-slate-200 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 cursor-pointer transition-all"
          >
            {samplePDAs.map((s) => (
              <option key={s.id} value={s.id} className="bg-slate-900 text-slate-200">
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* Zoom controls */}
        <div className="flex items-center gap-1.5 bg-slate-950/60 p-1.5 rounded-xl border border-white/10">
          <button
            onClick={() => setZoom((z) => Math.min(2.5, z + 0.15))}
            className="p-1.5 text-slate-400 hover:text-cyan-400 rounded-lg transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <span className="px-2 text-xs font-mono text-cyan-300 font-semibold">{Math.round(zoom * 100)}%</span>
          <button
            onClick={() => setZoom((z) => Math.max(0.4, z - 0.15))}
            className="p-1.5 text-slate-400 hover:text-cyan-400 rounded-lg transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setZoom(1);
              setPan({ x: 250, y: 150 });
            }}
            className="p-1.5 text-slate-400 hover:text-cyan-400 rounded-lg transition-colors"
            title="Reset View"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Graph Visual Area */}
      <div
        className="relative w-full h-[540px] bg-slate-950/90 border border-white/10 rounded-2xl shadow-2xl overflow-hidden select-none cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {graphData ? (
          <svg
            ref={svgRef}
            className="w-full h-full"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* Arrow marker */}
              <marker
                id="arrowhead"
                markerWidth="8"
                markerHeight="8"
                refX="6"
                refY="3"
                orient="auto"
              >
                <polygon points="0 0, 6 3, 0 6" fill="#38bdf8" />
              </marker>
              <marker
                id="start-arrow"
                markerWidth="8"
                markerHeight="8"
                refX="6"
                refY="3"
                orient="auto"
              >
                <polygon points="0 0, 6 3, 0 6" fill="#10b981" />
              </marker>
            </defs>

            <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
              {/* Transitions Edges */}
              {graphData.edges.map((edge) => {
                const srcNode = graphData.nodes.find((n) => n.id === edge.source);
                const tgtNode = graphData.nodes.find((n) => n.id === edge.target);
                if (!srcNode || !tgtNode) return null;

                if (edge.is_self_loop) {
                  // Draw circular self loop arc
                  const loopPath = `M ${srcNode.x - 12} ${srcNode.y - 22} C ${srcNode.x - 30} ${srcNode.y - 70}, ${srcNode.x + 30} ${srcNode.y - 70}, ${srcNode.x + 12} ${srcNode.y - 22}`;
                  return (
                    <g key={edge.id}>
                      <path
                        d={loopPath}
                        fill="none"
                        stroke="#0284c7"
                        strokeWidth="2"
                        markerEnd="url(#arrowhead)"
                      />
                      <text
                        x={srcNode.x}
                        y={srcNode.y - 75}
                        textAnchor="middle"
                        fontSize="11"
                        fontFamily="monospace"
                        className="fill-cyan-300 font-bold"
                      >
                        {edge.label}
                      </text>
                    </g>
                  );
                } else {
                  // Direct or curved edge between distinct nodes
                  const dx = tgtNode.x - srcNode.x;
                  const dy = tgtNode.y - srcNode.y;
                  const dist = Math.sqrt(dx * dx + dy * dy);
                  const nodeRadius = 26;
                  // Offset so arrow hits node border
                  const x1 = srcNode.x + (dx * nodeRadius) / dist;
                  const y1 = srcNode.y + (dy * nodeRadius) / dist;
                  const x2 = tgtNode.x - (dx * (nodeRadius + 6)) / dist;
                  const y2 = tgtNode.y - (dy * (nodeRadius + 6)) / dist;

                  const midX = (x1 + x2) / 2;
                  const midY = (y1 + y2) / 2 - 12;

                  return (
                    <g key={edge.id}>
                      <line
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        stroke="#0284c7"
                        strokeWidth="2"
                        markerEnd="url(#arrowhead)"
                      />
                      <text
                        x={midX}
                        y={midY}
                        textAnchor="middle"
                        fontSize="11"
                        fontFamily="monospace"
                        className="fill-cyan-300 font-bold"
                      >
                        {edge.label}
                      </text>
                    </g>
                  );
                }
              })}

              {/* State Nodes */}
              {graphData.nodes.map((node) => {
                const isSelected = selectedState === node.id;
                return (
                  <g
                    key={node.id}
                    transform={`translate(${node.x}, ${node.y})`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedState(node.id);
                    }}
                    className="cursor-pointer group"
                  >
                    {/* Incoming start arrow for initial state */}
                    {node.is_initial && (
                      <g transform="translate(-50, 0)">
                        <line
                          x1="0"
                          y1="0"
                          x2="22"
                          y2="0"
                          stroke="#10b981"
                          strokeWidth="3"
                          markerEnd="url(#start-arrow)"
                        />
                        <text
                          x="5"
                          y="-6"
                          fontSize="10"
                          fontFamily="sans-serif"
                          fontWeight="bold"
                          className="fill-emerald-400"
                        >
                          Start
                        </text>
                      </g>
                    )}

                    {/* Outer circle for accepting state */}
                    {node.is_accepting && (
                      <circle
                        r={28}
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="2.5"
                        className="drop-shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                      />
                    )}

                    {/* Main state circle */}
                    <circle
                      r={24}
                      fill={isSelected ? "#0284c7" : "#090d16"}
                      stroke={isSelected ? "#38bdf8" : node.is_accepting ? "#10b981" : "#1e293b"}
                      strokeWidth={isSelected ? 3 : 2}
                      className="group-hover:scale-110 transition-transform drop-shadow-[0_0_10px_rgba(56,189,248,0.2)]"
                    />

                    {/* State label */}
                    <text
                      textAnchor="middle"
                      dy="5"
                      fill="#ffffff"
                      fontSize="13"
                      fontWeight="bold"
                      fontFamily="monospace"
                      pointerEvents="none"
                    >
                      {node.label}
                    </text>
                  </g>
                );
              })}
            </g>
          </svg>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 text-xs">
            <GitCommit className="w-8 h-8 mb-2 opacity-40 text-cyan-400" />
            <p>Loading transition graph...</p>
          </div>
        )}

        {/* Legend */}
        <div className="absolute bottom-4 left-4 p-3 bg-slate-950/80 backdrop-blur border border-white/10 rounded-xl text-xs space-y-1.5 shadow-2xl">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full bg-slate-900 border border-slate-700" />
            <span className="text-slate-300">Standard State (Q)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full bg-slate-900 border-2 border-emerald-500 shadow-[0_0_6px_#10b981]" />
            <span className="text-slate-300">Accepting State (F)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-0.5 bg-emerald-500" />
            <span className="text-slate-300">Initial State Indicator</span>
          </div>
        </div>
      </div>
    </div>
  );
};
