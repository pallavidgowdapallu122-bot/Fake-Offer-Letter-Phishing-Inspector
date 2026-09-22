import React from "react";
import { motion } from "motion/react";
import {
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  Lock,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import { RiskLevel, ScoreWeightsBreakdown } from "../types";

interface ThreatDialProps {
  score: number; // 0 to 100
  riskLevel: RiskLevel;
  safetyRecommendation: string;
  weightsBreakdown?: ScoreWeightsBreakdown;
}

export const ThreatDial: React.FC<ThreatDialProps> = ({
  score,
  riskLevel,
  safetyRecommendation,
  weightsBreakdown,
}) => {
  // SVG Gauge Math
  const radius = 94;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * radius;
  const angleSpan = 0.75; // 270 degree arc
  const strokeDasharray = `${circumference * angleSpan} ${circumference * (1 - angleSpan)}`;
  const normalizedScore = Math.min(100, Math.max(0, score));
  const strokeDashoffset =
    circumference * angleSpan * (1 - normalizedScore / 100);

  // Risk styling
  let ringColor = "#10b981"; // emerald
  let badgeBg = "bg-emerald-500/15 border-emerald-500/40 text-emerald-300";
  let RiskIcon = ShieldCheck;
  let glowColor = "rgba(16, 185, 129, 0.25)";
  let riskTitle = "LOW RISK";

  if (riskLevel === "critical") {
    ringColor = "#f43f5e"; // rose-500
    badgeBg = "bg-rose-500/20 border-rose-500/50 text-rose-300 shadow-lg shadow-rose-950/50";
    RiskIcon = AlertOctagon;
    glowColor = "rgba(244, 63, 94, 0.4)";
    riskTitle = "CRITICAL RISK";
  } else if (riskLevel === "high") {
    ringColor = "#f97316"; // orange-500
    badgeBg = "bg-orange-500/20 border-orange-500/50 text-orange-300 shadow-lg shadow-orange-950/50";
    RiskIcon = ShieldAlert;
    glowColor = "rgba(249, 115, 22, 0.35)";
    riskTitle = "HIGH RISK";
  } else if (riskLevel === "medium") {
    ringColor = "#f59e0b"; // amber-500
    badgeBg = "bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-lg shadow-amber-950/50";
    RiskIcon = AlertTriangle;
    glowColor = "rgba(245, 158, 11, 0.3)";
    riskTitle = "MEDIUM RISK";
  }

  return (
    <div
      id="threat-dial-card"
      className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-900/90 to-slate-950/90 p-6 sm:p-8 shadow-2xl backdrop-blur-xl"
    >
      {/* Dynamic Cyber Glow behind dial */}
      <div
        className="pointer-events-none absolute -top-28 -right-28 h-72 w-72 rounded-full blur-3xl transition-all duration-700"
        style={{ background: glowColor }}
      />

      <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
        {/* Visual circular score indicator */}
        <div className="relative flex flex-col items-center justify-center shrink-0">
          <svg className="h-56 w-56 -rotate-135 transform" viewBox="0 0 240 240">
            {/* Background Track */}
            <circle
              cx="120"
              cy="120"
              r={radius}
              fill="transparent"
              stroke="#1e293b"
              strokeWidth={strokeWidth}
              strokeDasharray={strokeDasharray}
              strokeLinecap="round"
            />
            {/* Animated Score Progress */}
            <motion.circle
              cx="120"
              cy="120"
              r={radius}
              fill="transparent"
              stroke={ringColor}
              strokeWidth={strokeWidth}
              strokeDasharray={strokeDasharray}
              strokeLinecap="round"
              initial={{ strokeDashoffset: circumference * angleSpan }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 0.9, ease: "easeOut" }}
            />
          </svg>

          {/* Centered Score Display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none">
            <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400 font-mono">
              Scam Threat Index
            </span>
            <motion.div
              key={score}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="flex items-baseline justify-center font-mono font-black text-6xl tracking-tight text-white mt-0.5"
            >
              <span>{score}</span>
              <span className="text-2xl text-slate-400 ml-0.5 font-bold">%</span>
            </motion.div>
            <span className="mt-1 text-[11px] font-mono text-slate-400 font-semibold">
              Scale: 0–100%
            </span>
          </div>
        </div>

        {/* Risk Level & Safety Recommendation Details */}
        <div className="flex-1 space-y-4 w-full text-left">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs uppercase tracking-wider font-bold text-slate-400 font-mono block mb-1">
                Dynamic Threat Evaluation
              </span>
              <div
                id="risk-level-badge"
                className={`inline-flex items-center gap-2.5 rounded-2xl border px-4 py-2 font-mono text-sm font-black uppercase tracking-wider ${badgeBg}`}
              >
                <RiskIcon className="h-4 w-4" />
                <span>Risk Level: {riskLevel}</span>
              </div>
            </div>

            {/* Scale Breakdown Guide */}
            <div className="rounded-xl bg-slate-950/80 border border-slate-800 p-2.5 text-xs font-mono">
              <span className="text-slate-500 block text-[10px] uppercase font-bold mb-1">
                Calibrated Thresholds
              </span>
              <div className="flex items-center gap-1.5 text-[11px]">
                <span className={riskLevel === "low" ? "text-emerald-400 font-bold" : "text-slate-500"}>
                  0–24 Low
                </span>
                <span className="text-slate-600">•</span>
                <span className={riskLevel === "medium" ? "text-amber-400 font-bold" : "text-slate-500"}>
                  25–49 Med
                </span>
                <span className="text-slate-600">•</span>
                <span className={riskLevel === "high" ? "text-orange-400 font-bold" : "text-slate-500"}>
                  50–74 High
                </span>
                <span className="text-slate-600">•</span>
                <span className={riskLevel === "critical" ? "text-rose-400 font-bold" : "text-slate-500"}>
                  75–100 Crit
                </span>
              </div>
            </div>
          </div>

          {/* Safety Recommendation Callout */}
          <div
            id="safety-recommendation-banner"
            className="rounded-2xl border border-rose-500/30 bg-rose-950/20 p-4 flex items-start gap-3.5 shadow-inner"
          >
            <div className="rounded-xl bg-rose-500/20 p-2 border border-rose-500/30 shrink-0 text-rose-400">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-300 font-mono flex items-center gap-1.5">
                <Lock className="h-3 w-3" />
                Safety Recommendation:
              </span>
              <p className="text-sm font-medium text-rose-100 leading-relaxed">
                {safetyRecommendation}
              </p>
            </div>
          </div>

          {/* Score Weights Breakdown (up to 100 points) */}
          {weightsBreakdown && (
            <div className="rounded-2xl bg-slate-950/60 border border-slate-800/80 p-3 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span className="font-bold text-slate-300 uppercase">
                  Scam Threat Index Weight Breakdown:
                </span>
                <span className="text-slate-400">
                  Total: <strong className="text-white">{score}</strong> / 100 max
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] font-mono text-slate-400">
                <div className="bg-slate-900/80 rounded-lg p-2 border border-slate-800">
                  <span className="text-slate-500 block">Payment/Deposit</span>
                  <span className={weightsBreakdown.paymentDemandPoints > 0 ? "text-rose-400 font-bold" : "text-slate-400"}>
                    +{weightsBreakdown.paymentDemandPoints} / 25 pts
                  </span>
                </div>
                <div className="bg-slate-900/80 rounded-lg p-2 border border-slate-800">
                  <span className="text-slate-500 block">Sensitive Info</span>
                  <span className={weightsBreakdown.sensitiveInfoPoints > 0 ? "text-rose-400 font-bold" : "text-slate-400"}>
                    +{weightsBreakdown.sensitiveInfoPoints} / 20 pts
                  </span>
                </div>
                <div className="bg-slate-900/80 rounded-lg p-2 border border-slate-800">
                  <span className="text-slate-500 block">Domain / URL</span>
                  <span className={weightsBreakdown.domainUrlPoints > 0 ? "text-rose-400 font-bold" : "text-slate-400"}>
                    +{weightsBreakdown.domainUrlPoints} / 20 pts
                  </span>
                </div>
                <div className="bg-slate-900/80 rounded-lg p-2 border border-slate-800">
                  <span className="text-slate-500 block">Urgency / Mismatch</span>
                  <span className={(weightsBreakdown.urgencyPoints + weightsBreakdown.mismatchPoints) > 0 ? "text-amber-400 font-bold" : "text-slate-400"}>
                    +{(weightsBreakdown.urgencyPoints + weightsBreakdown.mismatchPoints)} / 20 pts
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
