import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Network,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Download,
  Play,
  Info,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useWorkspace } from "../context/WorkspaceContext";
import { apiClient } from "../lib/api-client";
import { SymbolBadge } from "../components/common/SymbolBadge";

export const ParseTreePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { grammarText, parsedGrammar } = useWorkspace();
  const [targetString, setTargetString] = useState(searchParams.get("target") || "aabb");
  const [treeData, setTreeData] = useState<{ nodes: any[]; edges: any[]; root: any } | null>(null);
  const [selectedNode, setSelectedNode] = useState<any | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 300, y: 50 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const svgRef = useRef<SVGSVGElement | null>(null);

  const fetchTree = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    setSelectedNode(null);
    try {
      const res = await apiClient.getParseTree({
        raw_text: grammarText,
        grammar: parsedGrammar || undefined,
        target_string: targetString,
        mode: "LEFTMOST",
      });
      if (res.success && res.root) {
        setTreeData({ nodes: res.nodes, edges: res.edges, root: res.root });
        // Center tree
        setPan({ x: 400, y: 60 });
        setZoom(1);
      } else {
        setErrorMsg(res.message || `No valid parse tree derived for "${targetString}".`);
        setTreeData(null);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to construct parse tree.");
      setTreeData(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTree();
  }, []);

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
    a.download = `parse-tree-${targetString || "eps"}.svg`;
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
              Grammar Syntactic Hierarchy
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white font-display">
            Parse-Tree Visualization
          </h1>
          <p className="text-xs md:text-sm text-slate-400">
            Hierarchical parse tree reconstructed directly from grammar derivations with interactive zoom, pan, and SVG export.
          </p>
        </div>

        {treeData && (
          <button
            onClick={exportSVG}
            className="px-4 py-2 bg-slate-900/80 hover:bg-slate-800 border border-white/10 text-slate-300 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all shadow-sm"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span>Export SVG</span>
          </button>
        )}
      </div>

      {/* Input bar */}
      <div className="glass-card p-4 border border-white/10 shadow-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-[240px]">
          <span className="text-xs font-semibold text-slate-300">Target String:</span>
          <input
            type="text"
            value={targetString}
            onChange={(e) => setTargetString(e.target.value)}
            placeholder="e.g. aabb or ab"
            className="flex-1 max-w-xs px-3.5 py-2 bg-slate-950/60 font-mono text-sm border border-white/10 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-all"
          />
          <button
            onClick={fetchTree}
            disabled={isLoading}
            className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-cyan-500/25 flex items-center gap-1.5 transition-all disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>{isLoading ? "Generating..." : "Generate Tree"}</span>
          </button>
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
              setPan({ x: 400, y: 60 });
            }}
            className="p-1.5 text-slate-400 hover:text-cyan-400 rounded-lg transition-colors"
            title="Reset View"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-300 text-xs flex items-start gap-3 backdrop-blur shadow-lg shadow-rose-950/20">
          <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-400" />
          <div>
            <p className="font-bold text-sm text-rose-200">Tree Generation Error</p>
            <p className="text-xs mt-0.5 font-mono text-rose-300/90">{errorMsg}</p>
          </div>
        </div>
      )}

      {/* SVG Canvas Area */}
      <div
        className="relative w-full h-[540px] bg-slate-950/90 border border-white/10 rounded-2xl shadow-2xl overflow-hidden select-none cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {treeData ? (
          <svg
            ref={svgRef}
            className="w-full h-full"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
              {/* Edges */}
              {treeData.edges.map((edge) => {
                const srcNode = treeData.nodes.find((n) => n.id === edge.source);
                const tgtNode = treeData.nodes.find((n) => n.id === edge.target);
                if (!srcNode || !tgtNode) return null;
                return (
                  <line
                    key={edge.id}
                    x1={srcNode.x}
                    y1={srcNode.y}
                    x2={tgtNode.x}
                    y2={tgtNode.y}
                    stroke="#334155"
                    strokeWidth={2}
                    className="transition-colors"
                  />
                );
              })}

              {/* Nodes */}
              {treeData.nodes.map((node) => {
                const isSelected = selectedNode?.id === node.id;
                const isNonTerminal = node.type === "non-terminal";
                const isEps = node.type === "epsilon" || node.label === "ε";

                let fill = "#7c3aed"; // Neon Violet
                let stroke = "#a78bfa";
                let textFill = "#ffffff";

                if (isEps) {
                  fill = "#0891b2"; // Arctic Cyan - NO YELLOW
                  stroke = "#38bdf8";
                  textFill = "#ffffff";
                } else if (!isNonTerminal) {
                  fill = "#059669"; // Mint Teal
                  stroke = "#34d399";
                  textFill = "#ffffff";
                }

                return (
                  <g
                    key={node.id}
                    transform={`translate(${node.x}, ${node.y})`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedNode(node);
                    }}
                    className="cursor-pointer group"
                  >
                    <circle
                      r={20}
                      fill={fill}
                      stroke={isSelected ? "#38bdf8" : stroke}
                      strokeWidth={isSelected ? 4 : 2}
                      className="transition-transform group-hover:scale-110 drop-shadow-[0_0_8px_rgba(6,182,212,0.4)]"
                    />
                    <text
                      textAnchor="middle"
                      dy="5"
                      fill={textFill}
                      fontSize="14"
                      fontWeight="bold"
                      fontFamily="monospace"
                      pointerEvents="none"
                    >
                      {isEps ? "ε" : node.label}
                    </text>
                  </g>
                );
              })}
            </g>
          </svg>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 text-xs">
            <Network className="w-8 h-8 mb-2 opacity-40 text-cyan-400" />
            <p>Enter a target string and click "Generate Tree" to render.</p>
          </div>
        )}

        {/* Legend */}
        <div className="absolute bottom-4 left-4 p-3 bg-slate-950/80 backdrop-blur border border-white/10 rounded-xl text-xs space-y-1.5 shadow-2xl">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-violet-500 shadow-[0_0_6px_#8b5cf6]" />
            <span className="text-slate-300">Non-Terminal (V)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_6px_#10b981]" />
            <span className="text-slate-300">Terminal (Σ)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_6px_#06b6d4]" />
            <span className="text-slate-300">Epsilon (ε)</span>
          </div>
        </div>
      </div>

      {/* Selected Node Details Box */}
      {selectedNode && (
        <div className="glass-card p-4 border border-white/10 shadow-2xl text-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-bold text-sm text-white">
              Node Symbol: <code className="font-mono text-cyan-400 font-bold">{selectedNode.label}</code>
            </span>
            <span className="px-2.5 py-0.5 rounded-lg bg-slate-950/60 border border-white/10 text-slate-300 uppercase font-semibold">
              Type: {selectedNode.type}
            </span>
            {selectedNode.production && (
              <span className="font-mono px-2.5 py-0.5 bg-violet-500/15 text-violet-300 rounded-lg border border-violet-500/30 font-bold">
                Applied: {selectedNode.production}
              </span>
            )}
          </div>
          <span className="text-slate-400 font-mono">Depth Level: {selectedNode.depth}</span>
        </div>
      )}
    </div>
  );
};
