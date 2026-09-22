import React from "react";
import { SeparateIndicators } from "../types";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  CreditCard,
  Globe,
  KeyRound,
  Link2,
  Shield,
  ShieldAlert,
  UserCheck,
  UserX,
} from "lucide-react";

interface SeparateIndicatorsGridProps {
  indicators: SeparateIndicators;
  activeFilter?: string;
  onSelectIndicator?: (indicatorKey: string) => void;
}

export const SeparateIndicatorsGrid: React.FC<SeparateIndicatorsGridProps> = ({
  indicators,
  activeFilter,
  onSelectIndicator,
}) => {
  const telemetryItems = [
    {
      metric: indicators.paymentDemand,
      icon: CreditCard,
      accentColor: "rose",
      tooltipCategory: "PAYMENT_DEMAND",
    },
    {
      metric: indicators.sensitiveInfo,
      icon: KeyRound,
      accentColor: "purple",
      tooltipCategory: "SENSITIVE_INFO",
    },
    {
      metric: indicators.urgency,
      icon: Clock,
      accentColor: "amber",
      tooltipCategory: "URGENCY",
    },
    {
      metric: indicators.suspiciousEmployment,
      icon: UserX,
      accentColor: "orange",
      tooltipCategory: "SUSPICIOUS_EMPLOYMENT",
    },
    {
      metric: indicators.domainRisk,
      icon: Globe,
      accentColor: "sky",
      tooltipCategory: "DOMAIN_RISK",
    },
    {
      metric: indicators.urlRisk,
      icon: Link2,
      accentColor: "indigo",
      tooltipCategory: "URL_RISK",
    },
  ];

  return (
    <div id="separate-indicators-container" className="space-y-3.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-rose-400" />
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-200 font-mono">
            Separate Threat Indicators:
          </h3>
        </div>
        <span className="text-xs text-slate-400 font-mono">
          6 Core Security Signal Vectors (Click to highlight)
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {telemetryItems.map(({ metric, icon: Icon, tooltipCategory }) => {
          const isTriggered = metric.detected;
          const isSelected = activeFilter === metric.key;

          return (
            <div
              key={metric.key}
              id={`indicator-card-${metric.key}`}
              onClick={() => onSelectIndicator?.(metric.key)}
              className={`group relative rounded-2xl border p-4 transition cursor-pointer select-none ${
                isSelected
                  ? "border-rose-400 ring-2 ring-rose-500/30 bg-slate-900 shadow-xl shadow-rose-950/40"
                  : isTriggered
                  ? "border-rose-500/40 bg-gradient-to-b from-rose-950/20 to-slate-950/80 hover:border-rose-400 shadow-lg shadow-rose-950/20"
                  : "border-slate-800/80 bg-slate-950/60 text-slate-400 hover:border-slate-700 hover:bg-slate-900/60"
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2.5">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-xl transition ${
                      isTriggered
                        ? "bg-rose-500/20 text-rose-400 border border-rose-500/30 group-hover:scale-105"
                        : "bg-slate-900 text-slate-500 border border-slate-800"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-100 font-mono">
                      {metric.label}
                    </h4>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Weight: up to {metric.maxScore} pts
                    </span>
                  </div>
                </div>

                <span
                  className={`inline-flex items-center gap-1 rounded-lg px-2 py-0.5 font-mono text-[10px] font-extrabold uppercase tracking-wide border ${
                    isTriggered
                      ? "bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse"
                      : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  }`}
                >
                  {isTriggered ? (
                    <>
                      <AlertTriangle className="h-3 w-3 text-rose-400" />
                      <span>Flagged (+{metric.score})</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                      <span>Clean</span>
                    </>
                  )}
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed line-clamp-2 min-h-[32px]">
                {metric.description}
              </p>

              {/* Progress Contribution Bar */}
              <div className="mt-3 pt-2 border-t border-slate-800/60">
                <div className="flex justify-between items-center text-[10px] font-mono mb-1">
                  <span className="text-slate-500 uppercase tracking-wider font-semibold">
                    Risk Contribution
                  </span>
                  <span
                    className={
                      isTriggered
                        ? "text-rose-400 font-bold"
                        : "text-slate-500"
                    }
                  >
                    {metric.score} / {metric.maxScore} pts
                  </span>
                </div>

                <div className="h-1.5 w-full rounded-full bg-slate-900 overflow-hidden border border-slate-800/60">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      isTriggered
                        ? "bg-gradient-to-r from-rose-500 to-red-500 shadow-sm shadow-rose-500"
                        : "bg-emerald-500/30"
                    }`}
                    style={{
                      width: `${Math.max(
                        isTriggered ? 15 : 0,
                        (metric.score / metric.maxScore) * 100
                      )}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
