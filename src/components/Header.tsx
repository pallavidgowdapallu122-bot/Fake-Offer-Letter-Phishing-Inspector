import React from "react";
import { Activity, RotateCcw, Shield, ShieldAlert, Sparkles, Terminal } from "lucide-react";

interface HeaderProps {
  onReset?: () => void;
  onQuickSample?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onReset, onQuickSample }) => {
  return (
    <header
      id="app-header"
      className="border-b border-slate-800/80 bg-slate-950/95 backdrop-blur-xl sticky top-0 z-50 shadow-md shadow-black/40"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
        {/* Brand & Identity */}
        <div className="flex items-center gap-3.5">
          <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 text-white shadow-xl shadow-rose-600/30 border border-rose-400/40">
            <Shield className="h-6 w-6 stroke-[2.2]" />
            <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-slate-950 border border-slate-800">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-black tracking-tight text-white font-mono flex items-center gap-1.5">
                Offer <span className="text-rose-500">AI</span>
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 rounded-md bg-rose-500/15 border border-rose-500/30 px-2.5 py-0.5 text-[10px] font-bold text-rose-300 uppercase tracking-wider font-mono">
                <Activity className="h-3 w-3 text-rose-400 animate-pulse" />
                Zero-Trust Scanner
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium tracking-wide">
              Fake Offer Letter &amp; Phishing Inspector
            </p>
          </div>
        </div>

        {/* Action Controls & Live Engine Status */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-2 bg-slate-900/80 border border-slate-800 px-3 py-1.5 rounded-xl text-xs">
            <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-400 font-mono text-[11px]">
              Ruleset: <strong className="text-slate-200">v4.8 Threat Matrix</strong>
            </span>
          </div>

          {onQuickSample && (
            <button
              type="button"
              id="header-quick-sample-btn"
              onClick={onQuickSample}
              className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-950/30 px-3 py-1.5 text-xs font-semibold text-rose-300 hover:bg-rose-900/50 hover:text-white transition cursor-pointer"
              title="Load default sample scam"
            >
              <Sparkles className="h-3.5 w-3.5 text-rose-400" />
              <span>Sample Scam</span>
            </button>
          )}

          {onReset && (
            <button
              type="button"
              id="header-reset-btn"
              onClick={onReset}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition cursor-pointer"
              title="Clear scanner inputs"
            >
              <RotateCcw className="h-3.5 w-3.5 text-slate-400" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
