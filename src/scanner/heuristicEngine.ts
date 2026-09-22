import {
  DomainInspection,
  IndicatorMetric,
  RiskLevel,
  ScanResult,
  ScoreWeightsBreakdown,
  SeparateIndicators,
  WarningSignal,
} from "../types";

export function analyzeOfferContent(
  text: string,
  providedUrl?: string,
  domainInspection?: DomainInspection
): ScanResult {
  const warningSignals: WarningSignal[] = [];
  const lower = text.toLowerCase();
  const lowerUrl = (providedUrl || "").toLowerCase();

  // Accumulator categories for weights
  let paymentDemandPoints = 0;
  let sensitiveInfoPoints = 0;
  let domainUrlPoints = 0;
  let urgencyPoints = 0;
  let mismatchPoints = 0;
  let employmentClaimsPoints = 0;
  let otherPoints = 0;

  // ----------------------------------------------------
  // 1. PAYMENT / DEPOSIT DEMAND (up to 25 points)
  // ----------------------------------------------------
  // Equipment / Laptop fees (e.g. "pay for 4000 fees for equipment", "refundable for laptop")
  const equipmentFeeRegex = /(pay\s+for\s+[0-9]+\s*fees?|pay\s+(?:for\s+)?(?:equipment|laptop|hardware|tools|workstation)|equipment\s+fee|laptop\s+fee|fees\s+for\s+equipment|refundable\s+for\s+laptop)/i;
  const equipmentMatch = text.match(equipmentFeeRegex);
  if (equipmentMatch) {
    const pts = 25;
    paymentDemandPoints = Math.min(25, paymentDemandPoints + pts);
    warningSignals.push({
      id: "sig-equipment-fee",
      category: "PAYMENT_DEMAND",
      categoryLabel: "Payment Demand",
      title: "Equipment / Laptop Fee Demand",
      severity: "critical",
      points: pts,
      evidence: equipmentMatch[0],
      explanation:
        "The message demands upfront payment for work equipment or laptop. Legitimate corporate employers never charge prospective employees for onboarding equipment.",
    });
  }

  // Security deposit demand (rental / job guarantee)
  const depositRegex = /(security\s+deposit|refundable\s+deposit|wire\s+(?:the\s+)?deposit|deposit\s+of\s+\$?[0-9]+|first\s+month\s+deposit|advance\s+deposit)/i;
  const depositMatch = text.match(depositRegex);
  if (depositMatch && paymentDemandPoints < 25) {
    const pts = Math.min(25 - paymentDemandPoints, 20);
    paymentDemandPoints += pts;
    warningSignals.push({
      id: "sig-security-deposit",
      category: "PAYMENT_DEMAND",
      categoryLabel: "Payment Demand",
      title: "Advance Security Deposit Demand",
      severity: "critical",
      points: pts,
      evidence: depositMatch[0],
      explanation:
        "Demands an advance security deposit prior to in-person physical viewing or contract verification.",
    });
  }

  // Upfront registration / training / processing fees
  const upfrontFeeRegex = /(registration\s+fee|training\s+fee|processing\s+fee|onboarding\s+fee|application\s+fee|mandatory\s+fee|pay\s+an\s+upfront)/i;
  const upfrontMatch = text.match(upfrontFeeRegex);
  if (upfrontMatch && paymentDemandPoints < 25) {
    const pts = Math.min(25 - paymentDemandPoints, 20);
    paymentDemandPoints += pts;
    warningSignals.push({
      id: "sig-upfront-fee",
      category: "PAYMENT_DEMAND",
      categoryLabel: "Payment Demand",
      title: "Upfront Registration or Training Fee",
      severity: "high",
      points: pts,
      evidence: upfrontMatch[0],
      explanation:
        "Legitimate companies never require job candidates to purchase company training, background checks, or registration licenses.",
    });
  }

  // Generic money / payment demand if not matched above
  const genericPayRegex = /(you\s+have\s+to\s+pay|pay\s+\$?[0-9]{3,}|wire\s+\$?[0-9]+|send\s+\$?[0-9]+|pay\s+for\s+[0-9]+)/i;
  const genericPayMatch = text.match(genericPayRegex);
  if (genericPayMatch && paymentDemandPoints === 0) {
    const pts = 20;
    paymentDemandPoints = 20;
    warningSignals.push({
      id: "sig-generic-pay",
      category: "PAYMENT_DEMAND",
      categoryLabel: "Payment Demand",
      title: "Direct Monetary Payment Demand",
      severity: "critical",
      points: pts,
      evidence: genericPayMatch[0],
      explanation: "Direct demand for money transfer found inside the correspondence.",
    });
  }

  // ----------------------------------------------------
  // 2. SENSITIVE INFORMATION REQUEST (up to 20 points)
  // ----------------------------------------------------
  // OTP / Password / PIN
  const otpRegex = /(otp|one[-\s]time\s+password|verification\s+code|account\s+pin|enter\s+your\s+password|share\s+the\s+code)/i;
  const otpMatch = text.match(otpRegex);
  if (otpMatch) {
    const pts = 20;
    sensitiveInfoPoints = Math.min(20, sensitiveInfoPoints + pts);
    warningSignals.push({
      id: "sig-otp-request",
      category: "SENSITIVE_INFO",
      categoryLabel: "Sensitive Information Request",
      title: "OTP / Password / PIN Credential Harvesting",
      severity: "critical",
      points: pts,
      evidence: otpMatch[0],
      explanation:
        "The sender requests an OTP, account password, or security PIN. Legitimate employers or landlords never request authentication codes.",
    });
  }

  // SSN / Bank Account / Routing / Credit Card
  const ssnBankRegex = /(social\s+security\s+number|\bssn\b|bank\s+account\s+number|routing\s+number|credit\s+card\s+number|debit\s+card\s+details|cvv|photo\s+of\s+(?:your\s+)?passport|driver['’]s?\s+license)/i;
  const ssnBankMatch = text.match(ssnBankRegex);
  if (ssnBankMatch && sensitiveInfoPoints < 20) {
    const pts = Math.min(20 - sensitiveInfoPoints, 18);
    sensitiveInfoPoints += pts;
    warningSignals.push({
      id: "sig-ssn-banking",
      category: "SENSITIVE_INFO",
      categoryLabel: "Sensitive Information Request",
      title: "Unencrypted Identity or Financial Document Request",
      severity: "critical",
      points: pts,
      evidence: ssnBankMatch[0],
      explanation:
        "Solicitation of Social Security Numbers, banking credentials, or government IDs via unencrypted messaging.",
    });
  }

  // ----------------------------------------------------
  // 3. SUSPICIOUS DOMAIN / URL (up to 20 points)
  // ----------------------------------------------------
  let detectedSuspiciousUrl = false;
  const allUrls = [providedUrl, ...((text.match(/https?:\/\/[^\s]+|[a-zA-Z0-9-]+\.(?:xyz|top|site|click|work|buzz|club|online)[^\s]*/gi) || []))].filter(Boolean) as string[];

  if (allUrls.length > 0) {
    for (const urlStr of allUrls) {
      const uLower = urlStr.toLowerCase();
      // Suspicious TLDs
      const suspiciousTldMatch = uLower.match(/\.(xyz|top|click|buzz|work|site|online|fit|rest|cam|sbs|cfd|tk|ml|ga|cf|gq)/i);
      if (suspiciousTldMatch) {
        detectedSuspiciousUrl = true;
        const pts = 15;
        domainUrlPoints = Math.min(20, domainUrlPoints + pts);
        warningSignals.push({
          id: "sig-suspicious-tld",
          category: "URL_RISK",
          categoryLabel: "URL Risk",
          title: `Suspicious High-Abuse Top-Level Domain (.${suspiciousTldMatch[1]})`,
          severity: "high",
          points: pts,
          evidence: urlStr,
          explanation:
            `The URL uses a .${suspiciousTldMatch[1]} extension, which is disproportionately leveraged by disposable phishing rings.`,
        });
        break;
      }

      // IP address URL
      if (/\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/.test(uLower)) {
        detectedSuspiciousUrl = true;
        const pts = 20;
        domainUrlPoints = Math.min(20, domainUrlPoints + pts);
        warningSignals.push({
          id: "sig-ip-url",
          category: "URL_RISK",
          categoryLabel: "URL Risk",
          title: "Direct IP Address Link",
          severity: "critical",
          points: pts,
          evidence: urlStr,
          explanation: "Links directly to an IP address rather than a verified hostname.",
        });
        break;
      }
    }
  }

  if (domainInspection) {
    if (domainInspection.isSuspiciousTld && domainUrlPoints < 20) {
      const pts = Math.min(20 - domainUrlPoints, 12);
      domainUrlPoints += pts;
      warningSignals.push({
        id: "sig-domain-tld",
        category: "DOMAIN_RISK",
        categoryLabel: "Domain Risk",
        title: "Disposable Phishing TLD",
        severity: "high",
        points: pts,
        evidence: domainInspection.domain,
        explanation: "Domain uses a high-abuse TLD registered through anonymous bulk providers.",
      });
    }

    if (domainInspection.estimatedAgeDays !== undefined && domainInspection.estimatedAgeDays < 60) {
      const pts = Math.min(20 - domainUrlPoints, 15);
      domainUrlPoints += pts;
      warningSignals.push({
        id: "sig-domain-age",
        category: "DOMAIN_RISK",
        categoryLabel: "Domain Risk",
        title: `Newly Registered Domain (${domainInspection.estimatedAgeDays} Days Old)`,
        severity: "high",
        points: pts,
        evidence: `${domainInspection.domain} (Created: ${domainInspection.creationDate || "Recently"})`,
        explanation:
          "Newly registered domains (< 60 days) represent over 80% of disposable phishing campaigns.",
      });
    }
  }

  // ----------------------------------------------------
  // 4. URGENCY / PRESSURE (up to 10 points)
  // ----------------------------------------------------
  const urgencyRegex = /(within\s+24\s+hours|immediately|immediate\s+action|act\s+fast|urgent|urgently|before\s+offer\s+expires|before\s+it\s+is\s+cancelled|forfeit\s+your\s+offer|limited\s+time\s+window|strictly\s+within\s+today)/i;
  const urgencyMatch = text.match(urgencyRegex);
  if (urgencyMatch) {
    const pts = 10;
    urgencyPoints = pts;
    warningSignals.push({
      id: "sig-urgency-pressure",
      category: "URGENCY",
      categoryLabel: "Urgency",
      title: "Artificial Urgency & Deadline Coercion",
      severity: "medium",
      points: pts,
      evidence: urgencyMatch[0],
      explanation:
        "Creates artificial time constraints ('within 24 hours', 'act fast') to induce panic and prevent independent verification.",
    });
  }

  // ----------------------------------------------------
  // 5. COMPANY / DOMAIN MISMATCH (up to 10 points)
  // ----------------------------------------------------
  // Look for free email or brand typosquatting
  const freeEmailMatch = text.match(/([a-zA-Z0-9._%+-]+@(gmail|yahoo|hotmail|outlook|proton|zoho|mail)\.[a-zA-Z]{2,})/i);
  if (freeEmailMatch) {
    const pts = 10;
    mismatchPoints = pts;
    warningSignals.push({
      id: "sig-free-email-mismatch",
      category: "COMPANY_MISMATCH",
      categoryLabel: "Company / Domain Mismatch",
      title: "Corporate Recruiter Using Free Webmail",
      severity: "high",
      points: pts,
      evidence: freeEmailMatch[0],
      explanation:
        "Official employment or lease correspondence sent via free public email rather than an authenticated corporate domain.",
    });
  } else if (domainInspection?.isTyposquatting) {
    const pts = 10;
    mismatchPoints = pts;
    warningSignals.push({
      id: "sig-typosquatting-mismatch",
      category: "COMPANY_MISMATCH",
      categoryLabel: "Company / Domain Mismatch",
      title: `Lookalike Domain Impersonation (${domainInspection.impersonatedBrand})`,
      severity: "critical",
      points: pts,
      evidence: domainInspection.domain,
      explanation: `Domain mimics legitimate trademark '${domainInspection.impersonatedBrand}' through spoofing or hyphenation.`,
    });
  }

  // ----------------------------------------------------
  // 6. SUSPICIOUS EMPLOYMENT / RENTAL CLAIMS (up to 10 points)
  // ----------------------------------------------------
  // Instant selection without interview
  const instantSelectRegex = /(congrats\s+you\s+have\s+been\s+selected|congratulations\s+you\s+(?:have\s+been|are)\s+selected|selected\s+for\s+position|hired\s+without\s+interview|instant\s+job\s+offer|selected\s+for\s+this\s+role)/i;
  const instantSelectMatch = text.match(instantSelectRegex);
  if (instantSelectMatch) {
    const pts = 10;
    employmentClaimsPoints = pts;
    warningSignals.push({
      id: "sig-instant-selection",
      category: "SUSPICIOUS_EMPLOYMENT",
      categoryLabel: "Suspicious Employment Claim",
      title: "Cold Selection Without Formal Interview",
      severity: "high",
      points: pts,
      evidence: instantSelectMatch[0],
      explanation:
        "Notifies the candidate of selection for a technical or professional role without conducting formal panel or video interviews.",
    });
  } else {
    // Rental claim (absent landlord, sight-unseen lease)
    const rentalClaimRegex = /(cannot\s+show\s+(?:the\s+)?(?:apartment|property|unit)\s+in\s+person|currently\s+(?:out\s+of\s+country|abroad|on\s+a\s+mission)|keys\s+will\s+be\s+(?:fedexed|mailed|shipped)|reserve\s+before\s+seeing)/i;
    const rentalMatch = text.match(rentalClaimRegex);
    if (rentalMatch) {
      const pts = 10;
      employmentClaimsPoints = pts;
      warningSignals.push({
        id: "sig-rental-claim",
        category: "SUSPICIOUS_EMPLOYMENT",
        categoryLabel: "Suspicious Employment Claim",
        title: "Sight-Unseen Rental / Absent Landlord Claim",
        severity: "critical",
        points: pts,
        evidence: rentalMatch[0],
        explanation:
          "Claims the owner cannot show the property in person and requires remote commitment.",
      });
    }
  }

  // ----------------------------------------------------
  // 7. OTHER SUSPICIOUS CHARACTERISTICS (up to 5 points)
  // ----------------------------------------------------
  // "it refundable", "kindly", telegram/whatsapp hiring, gift card / crypto wire
  const otherRegex = /(\bit\s+refundable\b|\bkindly\b|telegram|whatsapp|zelle|cashapp|apple\s+gift\s+card|bitcoin|usdt)/i;
  const otherMatch = text.match(otherRegex);
  if (otherMatch) {
    const pts = 5;
    otherPoints = pts;
    warningSignals.push({
      id: "sig-other-characteristics",
      category: "OTHER_SUSPICIOUS",
      categoryLabel: "Other Suspicious Characteristics",
      title: "Anomalous Phrasing & Informal Channels",
      severity: "medium",
      points: pts,
      evidence: otherMatch[0],
      explanation:
        "Contains hallmark scam phrasing ('it refundable', 'kindly') or consumer messaging handles.",
    });
  }

  // ----------------------------------------------------
  // TOTAL SCORE CALCULATION (Never exceed 100)
  // ----------------------------------------------------
  const rawSum =
    paymentDemandPoints +
    sensitiveInfoPoints +
    domainUrlPoints +
    urgencyPoints +
    mismatchPoints +
    employmentClaimsPoints +
    otherPoints;

  const overallScore = Math.min(100, Math.max(0, rawSum));

  // Risk levels:
  // 0–24 = low
  // 25–49 = medium
  // 50–74 = high
  // 75–100 = critical
  let riskLevel: RiskLevel = "low";
  let verdictTitle = "Low Threat - Minimal Risk Detected";
  let verdictSummary =
    "No upfront payment demands, OTP/credential harvesting, or deceptive URL triggers were detected in this message.";

  if (overallScore >= 75) {
    riskLevel = "critical";
    verdictTitle = "CRITICAL RISK - CONFIRMED FRAUD PATTERN";
    verdictSummary =
      "Extreme risk of financial loss or identity theft. The message exhibits high-conviction markers of equipment advance-fee fraud or phishing.";
  } else if (overallScore >= 50) {
    riskLevel = "high";
    verdictTitle = "HIGH RISK - PROBABLE SCAM";
    verdictSummary =
      "Significant red flags detected. Do not proceed with payment, equipment purchases, or identity submission.";
  } else if (overallScore >= 25) {
    riskLevel = "medium";
    verdictTitle = "MEDIUM RISK - CAUTION ADVISED";
    verdictSummary =
      "Several suspicious indicators identified. Conduct independent verification before responding.";
  }

  // Separate Indicators
  const indicators: SeparateIndicators = {
    paymentDemand: {
      key: "paymentDemand",
      label: "Payment Demand",
      detected: paymentDemandPoints > 0,
      score: paymentDemandPoints,
      maxScore: 25,
      status: paymentDemandPoints >= 20 ? "Severe" : paymentDemandPoints > 0 ? "Warning" : "Safe",
      description:
        paymentDemandPoints > 0
          ? "Demands upfront payment, laptop/equipment fees, or advance deposit."
          : "No upfront fees or deposit demands detected.",
    },
    sensitiveInfo: {
      key: "sensitiveInfo",
      label: "Sensitive Information Request",
      detected: sensitiveInfoPoints > 0,
      score: sensitiveInfoPoints,
      maxScore: 20,
      status: sensitiveInfoPoints >= 15 ? "Severe" : sensitiveInfoPoints > 0 ? "Warning" : "Safe",
      description:
        sensitiveInfoPoints > 0
          ? "Solicits OTPs, passwords, PINs, SSN, or bank account routing numbers."
          : "No credential or identity harvesting detected.",
    },
    urgency: {
      key: "urgency",
      label: "Urgency",
      detected: urgencyPoints > 0,
      score: urgencyPoints,
      maxScore: 10,
      status: urgencyPoints > 0 ? "Warning" : "Safe",
      description:
        urgencyPoints > 0
          ? "Enforces artificial deadlines ('within 24 hours') to bypass scrutiny."
          : "Normal communication pacing observed.",
    },
    suspiciousEmployment: {
      key: "suspiciousEmployment",
      label: "Suspicious Employment Claim",
      detected: employmentClaimsPoints > 0,
      score: employmentClaimsPoints,
      maxScore: 10,
      status: employmentClaimsPoints > 0 ? "Warning" : "Safe",
      description:
        employmentClaimsPoints > 0
          ? "Instant selection without formal technical or panel interview."
          : "Standard hiring claims.",
    },
    domainRisk: {
      key: "domainRisk",
      label: "Domain Risk",
      detected: (domainInspection?.riskScore || 0) > 40 || domainInspection?.isSuspiciousTld === true,
      score: domainInspection?.isSuspiciousTld ? 12 : 0,
      maxScore: 20,
      status: (domainInspection?.riskScore || 0) > 60 ? "Severe" : (domainInspection?.riskScore || 0) > 30 ? "Warning" : "Safe",
      description:
        domainInspection?.domain
          ? `Domain: ${domainInspection.domain} (${domainInspection.estimatedAgeDays || "?"} days old)`
          : "No suspicious domain infrastructure flagged.",
    },
    urlRisk: {
      key: "urlRisk",
      label: "URL Risk",
      detected: detectedSuspiciousUrl || domainUrlPoints > 0,
      score: domainUrlPoints,
      maxScore: 10,
      status: domainUrlPoints >= 15 ? "Severe" : domainUrlPoints > 0 ? "Warning" : "Safe",
      description:
        domainUrlPoints > 0
          ? "Suspicious TLD (.xyz, .top, .click) or deceptive URL link detected."
          : "No hostile URLs identified.",
    },
  };

  const weightsBreakdown: ScoreWeightsBreakdown = {
    paymentDemandPoints,
    sensitiveInfoPoints,
    domainUrlPoints,
    urgencyPoints,
    mismatchPoints,
    employmentClaimsPoints,
    otherPoints,
  };

  return {
    overallScore,
    riskLevel,
    verdictTitle,
    verdictSummary,
    safetyRecommendation:
      "Do not send money or sensitive information until the employer, landlord or organization has been independently verified.",
    warningSignals,
    indicators,
    weightsBreakdown,
    domainInspection,
    rawText: text,
    rawUrl: providedUrl,
    scannedAt: new Date().toISOString(),
  };
}
