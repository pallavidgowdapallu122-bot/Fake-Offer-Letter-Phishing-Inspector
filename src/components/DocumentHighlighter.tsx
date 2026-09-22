import React from "react";
import { WarningSignal } from "../types";
import { Eye, FileCode, ShieldAlert } from "lucide-react";

interface DocumentHighlighterProps {
  rawText: string;
  signals: WarningSignal[];
}

export const DocumentHighlighter: React.FC<DocumentHighlighterProps> = ({
  rawText,
  signals,
}) => {
  if (!rawText.trim()) return null;

  // Find all matches and their spans
  interface MatchSpan {
    start: number;
    end: number;
    evidence: string;
    signal: WarningSignal;
  }

  const spans: MatchSpan[] = [];
  const lowerText = rawText.toLowerCase();

  signals.forEach((sig) => {
    if (!sig.evidence) return;
    const lowerEv = sig.evidence.toLowerCase();
    let idx = lowerText.indexOf(lowerEv);
    while (idx !== -1) {
      spans.push({
        start: idx,
        end: idx + lowerEv.length,
        evidence: sig.evidence,
        signal: sig,
      });
      idx = lowerText.indexOf(lowerEv, idx + 1);
    }
  });

  // Sort spans by start
  spans.sort((a, b) => a.start - b.start);

  // Render text segments
  const segments: React.ReactNode[] = [];
  let currentIdx = 0;

  spans.forEach((span, i) => {
    if (span.start < currentIdx) {
      // Overlap, skip
      return;
    }

    if (span.start > currentIdx) {
      segments.push(
        <span key={`plain-${currentIdx}`}>
          {rawText.slice(currentIdx, span.start)}
        </span>
      );
    }

    const matchedText = rawText.slice(span.start, span.end);
    segments.push(
      <mark
        key={`match-${span.start}-${i}`}
        className="rounded px-1.5 py-0.5 bg-rose-500/30 text-rose-200 border border-rose-500/50 font-bold underline decoration-rose-500 underline-offset-4 inline-block transition hover:bg-rose-500/40"
        title={`[${span.signal.categoryLabel}] ${span.signal.title} (+${span.signal.points} pts)`}
      >
        {matchedText}
      </mark>
    );

    currentIdx = span.end;
  });

  if (currentIdx < rawText.length) {
    segments.push(
      <span key={`plain-end`}>{rawText.slice(currentIdx)}</span>
    );
  }

  return (
    <div
      id="document-highlighter-card"
      className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6 shadow-xl space-y-3"
    >
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <FileCode className="h-4 w-4 text-sky-400" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono">
            Interactive Forensic Text Markup
          </h4>
        </div>
        <span className="text-[11px] text-slate-400 font-mono">
          Hover marked phrases to view violation metadata
        </span>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 font-mono text-sm leading-relaxed text-slate-200 whitespace-pre-wrap selection:bg-rose-500/30">
        {segments}
      </div>
    </div>
  );
};
