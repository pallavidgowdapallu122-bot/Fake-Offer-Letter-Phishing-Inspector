import React from "react";
import { PRESET_SAMPLES } from "../scanner/presets";
import { PresetSample } from "../types";
import {
  Clipboard,
  Eraser,
  FileText,
  Globe,
  Radio,
  Search,
  Sparkles,
  Zap,
} from "lucide-react";

interface ScannerInputProps {
  text: string;
  onChangeText: (text: string) => void;
  url: string;
  onChangeUrl: (url: string) => void;
  onScanNow: () => void;
  onTrySampleScam: () => void;
  onSelectPreset?: (preset: PresetSample) => void;
  isScanning: boolean;
  onClear: () => void;
}

export const ScannerInput: React.FC<ScannerInputProps> = ({
  text,
  onChangeText,
  url,
  onChangeUrl,
  onScanNow,
  onTrySampleScam,
  onSelectPreset,
  isScanning,
  onClear,
}) => {
  const handlePasteClipboard = async () => {
    try {
      const clipText = await navigator.clipboard.readText();
      if (clipText) {
        onChangeText(clipText);
      }
    } catch {
      // Clipboard access denied or unsupported
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      if (text.trim() && !isScanning) {
        onScanNow();
      }
    }
  };

  return (
    <div
      id="main-scanner-card"
      className="relative rounded-3xl border border-slate-800/90 bg-gradient-to-b from-slate-900/95 to-slate-950/95 p-6 sm:p-7 shadow-2xl backdrop-blur-xl space-y-6"
    >
      {/* Decorative top accent glow */}
      <div className="absolute inset-x-8 -top-px h-px bg-gradient-to-r from-transparent via-rose-500/60 to-transparent" />

      {/* Preset Quick Chips Bar */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Radio className="h-3.5 w-3.5 text-rose-400 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
              Quick Test Scenarios:
            </span>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">
            Click to auto-populate test vectors
          </span>
        </div>

        <div className="flex flex-wrap gap-2 pt-0.5">
          {PRESET_SAMPLES.map((preset) => {
            const isUserLaptopSample = preset.id === "sample-laptop-scam";

            return (
              <button
                key={preset.id}
                type="button"
                id={`preset-btn-${preset.id}`}
                onClick={() => {
                  if (onSelectPreset) {
                    onSelectPreset(preset);
                  } else {
                    onChangeText(preset.text);
                    onChangeUrl(preset.url || "");
                  }
                }}
                className={`group flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-medium transition cursor-pointer ${
                  isUserLaptopSample
                    ? "bg-rose-950/70 border border-rose-500/50 text-rose-200 hover:bg-rose-900/80 hover:border-rose-400 shadow-md shadow-rose-950/40"
                    : "bg-slate-900/90 border border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white hover:border-slate-700"
                }`}
                title={preset.description}
              >
                {isUserLaptopSample && (
                  <span className="flex h-2 w-2 rounded-full bg-rose-400 animate-pulse" />
                )}
                <span>{preset.label}</span>
                <span className="text-[10px] text-slate-400 font-mono opacity-80 group-hover:opacity-100">
                  [{preset.tag}]
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 1. Large text area titled: Paste Job Offer / Rental Message */}
      <div className="space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label
            htmlFor="offer-text-input"
            className="flex items-center gap-2 text-sm font-bold text-slate-100 font-mono"
          >
            <FileText className="h-4 w-4 text-rose-400" />
            <span>Paste Job Offer / Rental Message</span>
          </label>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePasteClipboard}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900/80 px-2.5 py-1 text-[11px] font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition cursor-pointer"
              title="Paste from clipboard"
            >
              <Clipboard className="h-3 w-3 text-slate-400" />
              <span>Paste Clipboard</span>
            </button>

            {text && (
              <button
                type="button"
                onClick={onClear}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900/80 px-2 py-1 text-[11px] font-medium text-slate-400 hover:text-rose-400 transition cursor-pointer"
                title="Clear text"
              >
                <Eraser className="h-3 w-3" />
                <span>Clear</span>
              </button>
            )}

            <span className="font-mono text-xs text-slate-500 bg-slate-950 px-2 py-1 rounded border border-slate-800/80">
              {text.length} chars • {text.split(/\s+/).filter(Boolean).length} words
            </span>
          </div>
        </div>

        <div className="relative rounded-2xl overflow-hidden border border-slate-700/80 focus-within:border-rose-500 focus-within:ring-2 focus-within:ring-rose-500/20 transition-all bg-slate-950 shadow-inner">
          <textarea
            id="offer-text-input"
            rows={7}
            value={text}
            onChange={(e) => onChangeText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Paste appointment letter, employment offer, or rental proposal text here... e.g. 'congrats you have been selected for position software developer. you have to pay for 4000 fees for equipment for this role it refundable for laptop.'"
            className="w-full bg-transparent p-4 font-mono text-sm leading-relaxed text-slate-100 placeholder-slate-600 focus:outline-none resize-y min-h-[140px]"
          />

          <div className="flex items-center justify-between px-4 py-2 border-t border-slate-800/60 bg-slate-900/50 text-[11px] text-slate-400 font-mono">
            <span className="flex items-center gap-1.5">
              <Zap className="h-3 w-3 text-amber-400" />
              <span>Detects payment traps, equipment fees, &amp; credential theft</span>
            </span>
            <span className="hidden sm:inline text-slate-500">
              Press <kbd className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-300">Ctrl/⌘+Enter</kbd> to inspect
            </span>
          </div>
        </div>
      </div>

      {/* 2. URL input titled: Enter Suspicious URL (optional) */}
      <div className="space-y-2">
        <label
          htmlFor="suspicious-url-input"
          className="flex items-center gap-2 text-sm font-bold text-slate-100 font-mono"
        >
          <Globe className="h-4 w-4 text-sky-400" />
          <span>Enter Suspicious URL (optional)</span>
        </label>

        <div className="relative flex items-center">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
            <Globe className="h-4 w-4" />
          </div>
          <input
            type="text"
            id="suspicious-url-input"
            value={url}
            onChange={(e) => onChangeUrl(e.target.value)}
            placeholder="e.g. https://apple-equipment-dispatch.xyz or hr@company-portal.click"
            className="h-12 w-full rounded-xl border border-slate-700/80 bg-slate-950 pl-10 pr-4 text-xs font-mono text-slate-200 placeholder-slate-500 focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20 transition"
          />
          {url && (
            <button
              type="button"
              onClick={() => onChangeUrl("")}
              className="absolute right-3 text-xs text-slate-500 hover:text-slate-300 cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* 3. Scan Now button & 4. Try Sample Scam button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
        {/* Scan Now button */}
        <button
          type="button"
          id="scan-now-btn"
          onClick={onScanNow}
          disabled={isScanning || !text.trim()}
          className="flex-1 inline-flex h-13 items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-rose-600 via-rose-500 to-red-600 px-8 text-sm font-black uppercase tracking-wider text-white shadow-xl shadow-rose-600/30 hover:from-rose-500 hover:to-red-500 active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
        >
          <Search className="h-4 w-4 stroke-[2.5]" />
          <span>{isScanning ? "Inspecting Offer Evidence..." : "Scan Now"}</span>
        </button>

        {/* Try Sample Scam button */}
        <button
          type="button"
          id="try-sample-scam-btn"
          onClick={onTrySampleScam}
          className="inline-flex h-13 items-center justify-center gap-2 rounded-2xl border border-rose-500/40 bg-rose-950/40 px-6 text-sm font-bold text-rose-300 hover:bg-rose-900/60 hover:text-white hover:border-rose-400 active:scale-[0.99] transition cursor-pointer shadow-lg shadow-rose-950/30"
          title="Load the Laptop Fee Phishing Scam prompt sample"
        >
          <Sparkles className="h-4 w-4 text-rose-400 animate-pulse" />
          <span>Try Sample Scam</span>
        </button>
      </div>
    </div>
  );
};
