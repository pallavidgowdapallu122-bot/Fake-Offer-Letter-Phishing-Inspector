export type RiskLevel = "low" | "medium" | "high" | "critical";

export type SignalSeverity = "critical" | "high" | "medium" | "low";

export interface WarningSignal {
  id: string;
  category:
    | "PAYMENT_DEMAND"
    | "SENSITIVE_INFO"
    | "DOMAIN_RISK"
    | "URL_RISK"
    | "URGENCY"
    | "COMPANY_MISMATCH"
    | "SUSPICIOUS_EMPLOYMENT"
    | "OTHER_SUSPICIOUS";
  categoryLabel: string;
  title: string;
  severity: SignalSeverity;
  points: number;
  evidence: string;
  explanation: string;
}

export interface IndicatorMetric {
  key: string;
  label: string;
  detected: boolean;
  score: number;
  maxScore: number;
  status: "Safe" | "Warning" | "Severe";
  description: string;
}

export interface SeparateIndicators {
  paymentDemand: IndicatorMetric;
  sensitiveInfo: IndicatorMetric;
  urgency: IndicatorMetric;
  suspiciousEmployment: IndicatorMetric;
  domainRisk: IndicatorMetric;
  urlRisk: IndicatorMetric;
}

export interface DomainInspection {
  domain: string;
  found: boolean;
  isFreeMail: boolean;
  isSuspiciousTld: boolean;
  isTyposquatting: boolean;
  impersonatedBrand?: string;
  estimatedAgeDays?: number;
  creationDate?: string;
  registrar?: string;
  riskScore: number;
  notes: string[];
}

export interface ScoreWeightsBreakdown {
  paymentDemandPoints: number; // max 25
  sensitiveInfoPoints: number; // max 20
  domainUrlPoints: number; // max 20
  urgencyPoints: number; // max 10
  mismatchPoints: number; // max 10
  employmentClaimsPoints: number; // max 10
  otherPoints: number; // max 5
}

export interface ScanResult {
  overallScore: number; // 0–100
  riskLevel: RiskLevel;
  verdictTitle: string;
  verdictSummary: string;
  safetyRecommendation: string;
  warningSignals: WarningSignal[];
  indicators: SeparateIndicators;
  weightsBreakdown: ScoreWeightsBreakdown;
  domainInspection?: DomainInspection;
  rawText: string;
  rawUrl?: string;
  scannedAt: string;
}

export interface PresetSample {
  id: string;
  label: string;
  tag: string;
  description: string;
  text: string;
  url?: string;
}
