import React from "react";

interface SymbolBadgeProps {
  symbol: string;
  type?: "non-terminal" | "terminal" | "epsilon" | "state" | "stack";
  size?: "sm" | "md" | "lg";
}

export const SymbolBadge: React.FC<SymbolBadgeProps> = ({
  symbol,
  type = "terminal",
  size = "md",
}) => {
  const isEps = symbol === "ε" || symbol === "epsilon" || symbol === "" || type === "epsilon";

  let colorClasses = "bg-slate-800/60 text-slate-200 border-slate-700/60 shadow-sm";

  if (isEps) {
    // Arctic Cyan / Frost Blue — NO golden yellow!
    colorClasses = "bg-cyan-500/10 text-cyan-400 border-cyan-500/30 shadow-[0_0_12px_rgba(6,182,212,0.15)] font-bold";
  } else if (type === "non-terminal") {
    // Electric Violet / Amethyst
    colorClasses = "bg-violet-500/10 text-violet-300 border-violet-500/30 shadow-[0_0_12px_rgba(139,92,246,0.15)] font-semibold";
  } else if (type === "terminal") {
    // Mint Emerald / Teal
    colorClasses = "bg-teal-500/10 text-teal-300 border-teal-500/30 shadow-[0_0_12px_rgba(20,184,166,0.15)] font-semibold";
  } else if (type === "state") {
    // Royal Sapphire / Sky
    colorClasses = "bg-sky-500/10 text-sky-300 border-sky-500/30 shadow-[0_0_12px_rgba(14,165,233,0.15)] font-bold";
  } else if (type === "stack") {
    // Luminous Orchid / Fuchsia
    colorClasses = "bg-fuchsia-500/10 text-fuchsia-300 border-fuchsia-500/30 shadow-[0_0_12px_rgba(217,70,239,0.15)] font-bold";
  }

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs rounded-md",
    md: "px-2.5 py-1 text-xs rounded-lg",
    lg: "px-3.5 py-1.5 text-sm rounded-xl font-bold",
  }[size];

  return (
    <span
      className={`inline-flex items-center justify-center font-mono border backdrop-blur-sm transition-all duration-150 ${colorClasses} ${sizeClasses}`}
      title={`${type}: ${symbol || "ε"}`}
    >
      {isEps ? "ε" : symbol}
    </span>
  );
};
