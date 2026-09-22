import React, { useState } from "react";
import { SignalSeverity, WarningSignal } from "../types";
import {
  AlertOctagon,
  AlertTriangle,
  Check,
  Copy,
  FileSearch,
  Quote,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";

interface WhyFlaggedSectionProps {
  signals: WarningSignal[];
  filteredCategory?: string;
  onClearFilter?: () => void;
}

export const WhyFlaggedSection: React.FC<WhyFlaggedSectionProps> = ({
  signals,
  filteredCategory,
  onClearFilter,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyEvidence = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getSeverityBadge = (severity: SignalSeverity) => {
    switch (severity) {
      case "critical":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-rose-500/20 border border-rose-500/40 px-2.5 py-1 text-xs font-black font-mono text-rose-300 uppercase tracking-wider shadow-sm shadow-rose-950">
            <AlertOctagon className="h-3.5 w-3.5 text-rose-400" />
            <span>Severity: Critical</span>
          </span>
        );
      case "high":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-orange-500/20 border border-orange-500/40 px-2.5 py-1 text-xs font-black font-mono text-orange-300 uppercase tracking-wider shadow-sm shadow-orange-950">
            <AlertTriangle className="h-3.5 w-3.5 text-orange-400" />
            <span>Severity: High</span>
          </span>
        );
      case "medium":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500/20 border border-amber-500/40 px-2.5 py-1 text-xs font-bold font-mono text-amber-300 uppercase tracking-wider">
            <span>Severity: Medium</span>
          </span>
        );
      case "low":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-800 border border-slate-700 px-2.5 py-1 text-xs font-medium font-mono text-slate-300 uppercase tracking-wider">
            <span>Severity: Low</span>
          </span>
        );
    }
  };

  if (signals.length === 0) {
    return (
      <div
        id="why-flagged-empty-card"
        className="rounded-3xl border border-emerald-500/20 bg-emerald-950/20 p-8 text-center"
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
          <ShieldCheck className="h-8 w-8" />
        </div>
        <h3 className="mt-4 text-base font-bold text-emerald-300 font-mono">
          Why was this flagged?
        </h3>
        <p className="mt-1 text-xs text-slate-300 max-w-lg mx-auto leading-relaxed">
          Zero threat signals or phishing indicators detected. The text does not request upfront money, laptop hardware fees, security deposits, OTP codes, or personal banking credentials.
        </p>
      </div>
    );
  }

  return (
    <div
      id="why-flagged-section"
      className="rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-900/95 to-slate-950/95 p-6 sm:p-7 shadow-2xl backdrop-blur-xl space-y-5"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400">
            <FileSearch className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-black tracking-tight text-white font-mono">
              Why was this flagged?
            </h3>
            <p className="text-xs text-slate-400 font-medium">
              Detailed forensic breakdown of detected warning signals, exact textual evidence, and risk point weights
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {filteredCategory && (
            <button
              type="button"
              onClick={onClearFilter}
              className="text-[11px] text-rose-300 bg-rose-950/40 border border-rose-500/30 px-2 py-1 rounded-lg hover:bg-rose-900/60 transition cursor-pointer"
            >
              Clear Filter ✕
            </button>
          )}
          <span className="rounded-xl bg-slate-950 border border-slate-800 px-3 py-1.5 font-mono text-xs font-bold text-rose-300">
            {signals.length} {signals.length === 1 ? "Signal" : "Signals"} Detected
          </span>
        </div>
      </div>

      {/* List of Warning Signals */}
      <div className="space-y-4 pt-1">
        {signals.map((sig) => (
          <div
            key={sig.id}
            id={`signal-card-${sig.id}`}
            className="rounded-2xl border border-slate-800/90 bg-slate-950/70 p-5 transition hover:border-slate-700 space-y-3.5 shadow-md"
          >
            {/* Top row: Category, Title, Severity Badge, Points */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="rounded-md bg-slate-800/90 border border-slate-700 px-2 py-0.5 text-[10px] font-mono text-slate-300 font-bold uppercase tracking-wider">
                  {sig.categoryLabel}
                </span>
                <h4 className="text-sm font-bold text-white font-mono">
                  {sig.title}
                </h4>
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                {getSeverityBadge(sig.severity)}
                <span className="inline-flex items-center rounded-lg bg-rose-500/10 border border-rose-500/30 px-3 py-1 font-mono text-xs font-black text-rose-400">
                  +{sig.points} points
                </span>
              </div>
            </div>

            {/* Evidence from the submitted text */}
            <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-3.5 space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                <div className="flex items-center gap-1.5">
                  <Quote className="h-3.5 w-3.5 text-rose-400" />
                  <span>Evidence from the submitted text:</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyEvidence(sig.id, sig.evidence)}
                  className="inline-flex items-center gap-1 text-[10px] text-slate-400 hover:text-white transition cursor-pointer"
                  title="Copy evidence snippet"
                >
                  {copiedId === sig.id ? (
                    <>
                      <Check className="h-3 w-3 text-emerald-400" />
                      <span className="text-emerald-400 font-semibold">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      <span>Copy Quote</span>
                    </>
                  )}
                </button>
              </div>

              <blockquote className="font-mono text-xs sm:text-sm text-rose-200 bg-rose-950/40 border-l-4 border-rose-500 px-3 py-2 rounded-r-lg selection:bg-rose-500/40">
                "{sig.evidence}"
              </blockquote>
            </div>

            {/* Explanation / Risk Rationale */}
            <div className="text-xs text-slate-300 leading-relaxed pl-1">
              <strong className="text-slate-100 font-mono font-semibold">
                Forensic Analysis:{" "}
              </strong>
              <span>{sig.explanation}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
