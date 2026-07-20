import React, { useState, useEffect, useRef } from "react";
import { jsPDF } from "jspdf";
import {
  Briefcase,
  TrendingUp,
  Percent,
  ShieldAlert,
  BookOpen,
  Settings,
  Layers,
  Activity,
  FileText,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Filter,
  Loader2,
  Search,
  Building,
  Users,
  CheckCircle2,
  Shield,
  Info,
  X,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  TrendingDown,
  HelpCircle,
  FileCheck2,
  Grid,
  History,
  Download,
  Printer,
  MessageSquare,
  UploadCloud,
  Camera,
  Zap,
  Brain
} from "lucide-react";

import {
  BorrowerProfile,
  RiskParameter,
  RiskLevel,
  ChecklistItem,
  GlossaryItem,
  AlertItem,
  AppraisalHistoryEntry
} from "./types";

import {
  glossaryData,
  riskRatingScale,
  mapRawScoreToRiskLevel,
  evaluateParameter,
  defaultParameters,
  portfolioKPIs,
  segmentDistribution,
  monthlyCollectionTrend,
  riskRatingDistribution,
  initialTopAccounts,
  demoBorrowerProfiles
} from "./data";

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<"portfolio" | "assess" | "alerts" | "scorecard" | "glossary" | "ai-copilot">("portfolio");
  
  // Underwriting Right-Column sub-tabs ("shap" | "history" | "memo")
  const [assessSubTab, setAssessSubTab] = useState<"shap" | "history" | "memo">("shap");
  
  // State to track raw score changes for badge animations
  const [isScoreChanged, setIsScoreChanged] = useState<boolean>(false);
  
  // Portfolio Tab 'Risk Sensitivity' States
  const [riskSensitivity, setRiskSensitivity] = useState<number>(65); // default 65 (shows everything)
  const [filterMode, setFilterMode] = useState<"max" | "min">("max"); // "max" = show <= threshold, "min" = show >= threshold
  
  // Settings Modal (API Key) State
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [geminiKey, setGeminiKey] = useState<string>(() => {
    return sessionStorage.getItem("gemini_api_key") || "";
  });

  // PDF Preview Modal State
  const [showPdfPreview, setShowPdfPreview] = useState<boolean>(false);
  const [pdfPreviewBlobUrl, setPdfPreviewBlobUrl] = useState<string | null>(null);

  // --- AI COPILOT HUB STATE VARIABLES ---
  
  // Multi-Turn Chatbot State
  const [chatMessages, setChatMessages] = useState<Array<{ role: "user" | "model"; text: string; timestamp: string }>>([
    {
      role: "model",
      text: "Hello! I am your Sovereign Finance Credit Underwriting Co-Pilot. I have loaded the active borrower profile and scoring parameter scorecard. I can help you analyze cash flow trends, clarify policy covenants, suggest risk mitigants, or review the appraisal memo. Ask me anything!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [chatInput, setChatInput] = useState<string>("");
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);
  const [chatError, setChatError] = useState<string | null>(null);

  // Document/Image Scanner State (Gemini 3.1 Pro Preview)
  const [scannedImageBase64, setScannedImageBase64] = useState<string | null>(null);
  const [scannedImageMimeType, setScannedImageMimeType] = useState<string | null>(null);
  const [scannerPrompt, setScannerPrompt] = useState<string>("");
  const [scannerResult, setScannerResult] = useState<string | null>(null);
  const [isScannerLoading, setIsScannerLoading] = useState<boolean>(false);
  const [scannerError, setScannerError] = useState<string | null>(null);

  // Low-Latency Fast Advisor State (Gemini 3.1 Flash Lite)
  const [fastAdvisorParamId, setFastAdvisorParamId] = useState<number | null>(null);
  const [fastAdvisorCustomPrompt, setFastAdvisorCustomPrompt] = useState<string>("");
  const [fastAdvisorResult, setFastAdvisorResult] = useState<string | null>(null);
  const [isFastAdvisorLoading, setIsFastAdvisorLoading] = useState<boolean>(false);
  const [fastAdvisorError, setFastAdvisorError] = useState<string | null>(null);

  // AI Intelligence / General Credit Optimization Analyzer (Gemini 3.5 Flash)
  const [aiAnalysisResult, setAiAnalysisResult] = useState<string | null>(null);
  const [isAiAnalysisLoading, setIsAiAnalysisLoading] = useState<boolean>(false);
  const [aiAnalysisError, setAiAnalysisError] = useState<string | null>(null);

  // Dynamic Borrower Form State
  const [borrowerProfile, setBorrowerProfile] = useState<BorrowerProfile>({
    borrowerName: "Ganga Sand Mining Ltd",
    borrowerType: "Partnership",
    loanAmount: 145,
    loanPurpose: "Purchase of 3 Heavy Excavators and Sand Aggregators"
  });

  const [parameters, setParameters] = useState<RiskParameter[]>(() => {
    // Initialize parameter values from the first demo profile
    const firstDemo = demoBorrowerProfiles[0];
    return defaultParameters.map(p => {
      const demoVal = firstDemo.parameters[p.id];
      const evaluation = evaluateParameter(p.id, demoVal);
      return {
        ...p,
        currentValue: demoVal,
        score: evaluation.score,
        color: evaluation.color,
        reason: evaluation.reason
      };
    });
  });

  // Appraisal History State
  const [appraisalHistory, setAppraisalHistory] = useState<AppraisalHistoryEntry[]>([
    {
      id: "hist-3",
      timestamp: "10:45 AM",
      borrowerName: "Ganga Sand Mining Ltd",
      parameterName: "Escrow Remittance Capture",
      prevValue: "10%",
      newValue: "22%",
      scoreImpact: -2,
      newTotalScore: 35,
      riskLevel: "Satisfactory",
      riskColor: "#9ACD32",
      prevScore: 37,
      parameterId: 10,
      prevRawValue: 10
    },
    {
      id: "hist-2",
      timestamp: "10:15 AM",
      borrowerName: "Ganga Sand Mining Ltd",
      parameterName: "Debt Equity Ratio",
      prevValue: "4.5x",
      newValue: "3.2x",
      scoreImpact: -2,
      newTotalScore: 37,
      riskLevel: "Moderate",
      riskColor: "#FFA500",
      prevScore: 39,
      parameterId: 6,
      prevRawValue: 4.5
    },
    {
      id: "hist-1",
      timestamp: "09:30 AM",
      borrowerName: "Ganga Sand Mining Ltd",
      parameterName: "Initial Base Assessment",
      prevValue: "-",
      newValue: "39",
      scoreImpact: 0,
      newTotalScore: 39,
      riskLevel: "Moderate",
      riskColor: "#FFA500",
      prevScore: 39
    }
  ]);
  const [filterHistoryCurrent, setFilterHistoryCurrent] = useState<boolean>(true);

  // Interactive Document Checklist State
  const [checklist, setChecklist] = useState<ChecklistItem[]>([
    // Initial
    { id: "chk-audited-financials", category: "Initial Documents", name: "Financial Statements (Latest 3 years audited: ITR, P&L, Balance Sheet, Cash Flow, Audit Report)", checked: true },
    { id: "chk-fleet-list", category: "Initial Documents", name: "Fleet List (Total assets - vehicles, equipment, machinery)", checked: true },
    { id: "chk-work-order", category: "Initial Documents", name: "Work Order Details (Balance WIH and major work order copies)", checked: true },
    // Supporting
    { id: "chk-bank-statement", category: "Supporting Documents", name: "Bank Statement (Latest 6 months - OD/CC accounts)", checked: true },
    { id: "chk-bank-facility", category: "Supporting Documents", name: "Bank Facility Details (Term loan EMI details + OD/CC/BG limits)", checked: true },
    { id: "chk-gst-returns", category: "Supporting Documents", name: "GST Returns (GSTR 3B for latest 2 years and current FY)", checked: true },
    { id: "chk-form-26as", category: "Supporting Documents", name: "Form 26AS (Latest 2 years and current FY)", checked: false },
    { id: "chk-net-worth", category: "Supporting Documents", name: "Net Worth Statement (Key persons and guarantors, CA certified)", checked: true },
    { id: "chk-assessed-cashflow", category: "Supporting Documents", name: "Assessed Cash Flow (For transporters, quarry/crusher, RMC)", checked: false },
    // Additional
    { id: "chk-partnership-deed", category: "Additional Requirements", name: "Partnership Deed / Board Resolution (as applicable)", checked: false },
    { id: "chk-rc-insurance", category: "Additional Requirements", name: "RC, Insurance, Vehicle Inspection Report, Valuation Report", checked: false },
    { id: "chk-succession-plan", category: "Additional Requirements", name: "Key Man Succession Plan", checked: false },
    { id: "chk-promoter-background", category: "Additional Requirements", name: "Promoter Background and Business Operation Details", checked: true },
    { id: "chk-asset-used", category: "Additional Requirements", name: "Asset Used Vehicle / Equipment Performance Record", checked: false }
  ]);

  const [checklistCollapsed, setChecklistCollapsed] = useState<boolean>(false);

  // AI Appraisal Memo State
  const [isGeneratingMemo, setIsGeneratingMemo] = useState<boolean>(false);
  const [memoError, setMemoError] = useState<string | null>(null);
  const [appraisalMemo, setAppraisalMemo] = useState<string>(`DATE: ${new Date().toLocaleDateString("en-IN")}
MEMORANDUM TO: Senior Credit Committee
FROM: AI Underwriting Agent (Model: gemini-3.5-flash)
SUBJECT: Credit Appraisal - Ganga Sand Mining Ltd

--------------------------------------------------------------------------------
1. EXECUTIVE SUMMARY
We recommend CONDITIONAL APPROVAL of ₹145.00 lakhs for Ganga Sand Mining Ltd. The moderate risk rating (Level 5) is balanced by strong government infrastructure demand and active fleet operational tracking, despite limited history.

2. BORROWER OVERVIEW
Ganga Sand Mining Ltd is registered as a Partnership firm engaged in aggregate extraction. The proposed loan will buy 3 heavy hydraulic excavators to execute current work orders. Operations are active with 75% fleet run-time.

3. FINANCIAL ANALYSIS
The firm demonstrates an EBITDA Margin of 11.0% which offers reasonable security but thin buffers against cost hikes. Debt-to-Equity is elevated at 3.20x, indicating standard leverage. Cash Cover stands tight at 0.92x, necessitating escrow monitoring. Revenue growth is stable at 12.0%.

4. OPERATIONAL ANALYSIS
The borrower operates in a moderately cyclical Mining and Quarry sector. The Working Capital Cycle is 75 days, within normal NBFC boundaries. The principal concentration is 65%, presenting moderate customer risk. Fleet additions have expanded 30% recently.

5. RISK ASSESSMENT
- Top 3 Risk Factors:
  - Cash Cover ratio (0.92x) indicates thin liquidity.
  - Debt Equity Ratio (3.2x) is moderately leveraged.
  - Principal Concentration (65.0%) exposes them to single-hirer volatility.
- Top 2 Protective Factors:
  - Strong revenue growth rate (12.0%) shows market traction.
  - Stable operational run-times of 75% utilization.

6. CREDIT RECOMMENDATION
We propose conditional sanction of ₹145.00 Lakhs under the following terms:
- Mandate co-applicant signature of the two active partners.
- Open a dedicated collections Escrow Account with 22% GSTR receivables capture.

7. MONITORING REQUIREMENTS
- Quarterly audit of GSTR-3B filings to verify cash remittance rates.
- Bi-annual physical inspection of funded excavators.

CREDIT OFFICER SIGN-OFF: ____________________________`);

  // Portfolio Dashboard Alerts and Search States
  const [alertsSearch, setAlertsSearch] = useState<string>("");
  const [alertsFilter, setAlertsFilter] = useState<"All" | "Critical" | "Watch" | "Review">("All");
  const [alertsSortField, setAlertsSortField] = useState<keyof AlertItem>("riskScore");
  const [alertsSortAsc, setAlertsSortAsc] = useState<boolean>(false);
  const [allAlerts, setAllAlerts] = useState<AlertItem[]>(initialTopAccounts);

  // Glossary Tab Search and Category Filter
  const [glossarySearch, setGlossarySearch] = useState<string>("");
  const [glossaryCategory, setGlossaryCategory] = useState<string>("All");

  // Dynamic Scoring Engine Calculation
  const rawScore = parameters.reduce((sum, p) => sum + p.score, 0);
  const currentRiskLevel = mapRawScoreToRiskLevel(rawScore);

  // Track rawScore changes to trigger scale-up pop animation
  const prevScoreRef = useRef<number>(rawScore);
  useEffect(() => {
    if (prevScoreRef.current !== rawScore) {
      setIsScoreChanged(true);
      const timer = setTimeout(() => {
        setIsScoreChanged(false);
      }, 450); // duration of pop animation in ms
      prevScoreRef.current = rawScore;
      return () => clearTimeout(timer);
    }
  }, [rawScore]);

  // Action Recommendation based on Risk Level
  const overallDecision = rawScore >= 50 ? "DECLINE" : rawScore >= 36 ? "CONDITIONAL APPROVE" : "APPROVE";

  // Re-calculate parameters whenever currentValues are altered
  const handleParameterChange = (id: number, value: any) => {
    // Find previous parameter
    const targetParam = parameters.find(p => p.id === id);
    if (!targetParam) return;

    const prevValue = targetParam.currentValue;
    const prevScore = targetParam.score;

    if (prevValue === value) return; // No actual change

    const evaluation = evaluateParameter(id, value);
    const newScore = evaluation.score;
    const scoreDiff = newScore - prevScore;

    setParameters(prev => prev.map(p => {
      if (p.id === id) {
        return {
          ...p,
          currentValue: value,
          score: newScore,
          color: evaluation.color,
          reason: evaluation.reason
        };
      }
      return p;
    }));

    // Calculate new total raw score
    const newRawScore = rawScore + scoreDiff;
    const newRiskLevel = mapRawScoreToRiskLevel(newRawScore);

    // Format suffix/unit for displaying previous and new values
    const unitSuffix = targetParam.unit !== "Category" && targetParam.unit !== "Years" ? targetParam.unit : "";
    const displayPrev = prevValue + " " + unitSuffix;
    const displayNew = value + " " + unitSuffix;

    const timestamp = new Date().toLocaleTimeString("en-IN", { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    setAppraisalHistory(prev => {
      // Find if the most recent entry was for the same parameter and borrower name to avoid spamming slider ticks
      const lastEntry = prev[0];
      if (lastEntry && lastEntry.parameterName === targetParam.name && lastEntry.borrowerName === borrowerProfile.borrowerName) {
        // If it is, update the last entry's final value, newTotalScore, and timestamp
        const initialPrevScore = lastEntry.prevScore !== undefined ? lastEntry.prevScore : prevScore;
        const totalScoreDiff = newRawScore - (lastEntry.newTotalScore - lastEntry.scoreImpact);
        
        return [
          {
            ...lastEntry,
            newValue: displayNew,
            scoreImpact: totalScoreDiff,
            newTotalScore: newRawScore,
            riskLevel: newRiskLevel.label,
            riskColor: newRiskLevel.color,
            timestamp
          },
          ...prev.slice(1)
        ];
      }

      // Otherwise, append a new history entry
      const newEntry: AppraisalHistoryEntry = {
        id: Math.random().toString(36).substring(2, 9),
        timestamp,
        borrowerName: borrowerProfile.borrowerName,
        parameterName: targetParam.name,
        prevValue: displayPrev,
        newValue: displayNew,
        scoreImpact: scoreDiff,
        newTotalScore: newRawScore,
        riskLevel: newRiskLevel.label,
        riskColor: newRiskLevel.color,
        prevScore: rawScore,
        parameterId: id,
        prevRawValue: prevValue
      };

      return [newEntry, ...prev];
    });
  };

  // Demo loader
  const handleLoadDemo = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const idx = Number(e.target.value);
    if (isNaN(idx) || idx < 0) return;
    const demo = demoBorrowerProfiles[idx];
    
    // Update Profile Info
    setBorrowerProfile(demo.profile);
    
    // Update parameter values and calculate new raw score
    let demoRawScore = 0;
    const loadedParams = defaultParameters.map(p => {
      const demoVal = demo.parameters[p.id];
      const evaluation = evaluateParameter(p.id, demoVal);
      demoRawScore += evaluation.score;
      return {
        ...p,
        currentValue: demoVal,
        score: evaluation.score,
        color: evaluation.color,
        reason: evaluation.reason
      };
    });

    setParameters(loadedParams);

    // Update Checklist checkboxes
    setChecklist(prev => prev.map(item => ({
      ...item,
      checked: demo.checklist.includes(item.id)
    })));

    // Clear previous memo or load placeholder
    setMemoError(null);

    // Add entry to history for loaded demo
    const demoRiskLevel = mapRawScoreToRiskLevel(demoRawScore);
    const timestamp = new Date().toLocaleTimeString("en-IN", { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const demoEntry: AppraisalHistoryEntry = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp,
      borrowerName: demo.profile.borrowerName,
      parameterName: "Loaded Demo Template",
      prevValue: "-",
      newValue: demo.profile.borrowerName,
      scoreImpact: 0,
      newTotalScore: demoRawScore,
      riskLevel: demoRiskLevel.label,
      riskColor: demoRiskLevel.color,
      prevScore: demoRawScore
    };
    setAppraisalHistory(prev => [demoEntry, ...prev]);
  };

  // Revert a parameter change to its previous value
  const handleRevertHistoryEntry = (entry: AppraisalHistoryEntry) => {
    if (entry.parameterId === undefined || entry.prevRawValue === undefined) return;
    handleParameterChange(entry.parameterId, entry.prevRawValue);
  };

  // Export generated underwriting memo as a formatted text file (.txt)
  const handleExportMemo = () => {
    if (!appraisalMemo) return;
    const blob = new Blob([appraisalMemo], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const cleanBorrowerName = borrowerProfile.borrowerName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    link.download = `underwriting_memo_${cleanBorrowerName}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Helper to generate the PDF instance
  const generatePDFInstance = (): jsPDF | null => {
    if (!appraisalMemo) return null;

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4"
    });

    const pageWidth = doc.internal.pageSize.getWidth(); // 210
    const pageHeight = doc.internal.pageSize.getHeight(); // 297
    const leftMargin = 15;
    const rightMargin = 15;
    const bottomMargin = 20;
    const contentWidth = pageWidth - leftMargin - rightMargin; // 180

    let pageNum = 1;

    // Helper to draw header and footer
    const drawHeaderAndFooter = (isFirstPage: boolean) => {
      if (isFirstPage) {
        // Deep blue header background for corporate Sovereign Finance look
        doc.setFillColor(27, 58, 107);
        doc.rect(leftMargin, 15, contentWidth, 18, "F");

        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.text("SOVEREIGN FINANCE GROUP", leftMargin + 5, 22);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        doc.text("EXPOSURE NOTE — CREDIT UNDERWRITING APPRAISAL", leftMargin + 5, 28);

        // Professional Metadata grid block
        doc.setFillColor(248, 250, 252); // light background
        doc.setDrawColor(226, 232, 240); // borders
        doc.rect(leftMargin, 38, contentWidth, 24);

        doc.setTextColor(30, 41, 59); // dark text
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8.5);
        
        // Column 1
        doc.text("Applicant Name:", leftMargin + 4, 44);
        doc.setFont("helvetica", "normal");
        doc.text(`M/S ${borrowerProfile.borrowerName.toUpperCase()}`, leftMargin + 32, 44);

        doc.setFont("helvetica", "bold");
        doc.text("Constitution:", leftMargin + 4, 50);
        doc.setFont("helvetica", "normal");
        doc.text(borrowerProfile.borrowerType.toUpperCase(), leftMargin + 32, 50);

        doc.setFont("helvetica", "bold");
        doc.text("Req. Loan Amount:", leftMargin + 4, 56);
        doc.setFont("helvetica", "normal");
        doc.text(`Rs. ${borrowerProfile.loanAmount} Lakhs`, leftMargin + 32, 56);

        // Column 2
        doc.setFont("helvetica", "bold");
        doc.text("Date:", leftMargin + 105, 44);
        doc.setFont("helvetica", "normal");
        doc.text(new Date().toLocaleDateString("en-IN"), leftMargin + 130, 44);

        doc.setFont("helvetica", "bold");
        doc.text("Associated Since:", leftMargin + 105, 50);
        doc.setFont("helvetica", "normal");
        doc.text("2011 (Existing Customer)", leftMargin + 130, 50);

        doc.setFont("helvetica", "bold");
        doc.text("Risk Decision:", leftMargin + 105, 56);
        doc.setFont("helvetica", "bold");
        const decision = rawScore >= 50 ? "DECLINE" : rawScore >= 36 ? "CONDITIONAL APPROVE" : "APPROVE";
        if (decision === "DECLINE") {
          doc.setTextColor(220, 38, 38); // red
        } else if (decision === "APPROVE") {
          doc.setTextColor(22, 163, 74); // green
        } else {
          doc.setTextColor(217, 119, 6); // amber
        }
        doc.text(decision, leftMargin + 130, 56);
      } else {
        // Simple running header on subsequent pages
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.5);
        doc.line(leftMargin, 12, pageWidth - rightMargin, 12);

        doc.setTextColor(100, 116, 139);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.text(`M/S ${borrowerProfile.borrowerName.toUpperCase()} — CREDIT EXPOSURE NOTE`, leftMargin, 10);
        doc.text(new Date().toLocaleDateString("en-IN"), pageWidth - rightMargin - 20, 10);
      }

      // Consistent professional footer
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.5);
      doc.line(leftMargin, pageHeight - 15, pageWidth - rightMargin, pageHeight - 15);

      doc.setTextColor(100, 116, 139);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.text("CONFIDENTIAL — FOR INTERNAL USE ONLY", leftMargin, pageHeight - 10);
      doc.text(`Page ${pageNum}`, pageWidth - rightMargin - 15, pageHeight - 10);
    };

    // Draw page 1 header
    drawHeaderAndFooter(true);

    // Write memo text
    doc.setTextColor(30, 41, 59);
    doc.setFont("courier", "normal");
    doc.setFontSize(8.5);

    let y = 70; // Start printing after metadata block on page 1
    const lineHeight = 4.2; // mm

    // Split text by lines
    const rawLines = appraisalMemo.split("\n");
    const lines: string[] = [];

    // Safely split extremely long lines (tables) so they don't clip off page margins
    rawLines.forEach(line => {
      const maxChars = 92;
      if (line.length > maxChars) {
        let currentText = line;
        while (currentText.length > 0) {
          lines.push(currentText.substring(0, maxChars));
          currentText = currentText.substring(maxChars);
        }
      } else {
        lines.push(line);
      }
    });

    for (let i = 0; i < lines.length; i++) {
      if (y > pageHeight - bottomMargin) {
        doc.addPage();
        pageNum++;
        drawHeaderAndFooter(false);
        doc.setTextColor(30, 41, 59);
        doc.setFont("courier", "normal");
        doc.setFontSize(8.5);
        y = 20; // Start at the top margin of the new page
      }

      const line = lines[i];
      const isHeader = line.startsWith("---") || line.trim().match(/^[0-9]+\.\s+[A-Z\s]+$/) || line.trim().match(/^[A-Z\s]{4,}:$/);
      if (isHeader) {
        doc.setFont("courier", "bold");
      } else {
        doc.setFont("courier", "normal");
      }

      doc.text(line, leftMargin, y);
      y += lineHeight;
    }

    return doc;
  };

  // Export generated underwriting memo as a formatted professional PDF using jsPDF
  const handleExportPDF = () => {
    const doc = generatePDFInstance();
    if (!doc) return;
    const cleanBorrowerName = borrowerProfile.borrowerName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    doc.save(`underwriting_memo_${cleanBorrowerName}.pdf`);
  };

  // Generate and open PDF Preview Modal
  const handleOpenPdfPreview = () => {
    const doc = generatePDFInstance();
    if (!doc) return;
    try {
      const blob = doc.output("blob");
      const url = URL.createObjectURL(blob);
      setPdfPreviewBlobUrl(url);
      setShowPdfPreview(true);
    } catch (err) {
      console.error("Error creating PDF preview:", err);
    }
  };

  // Close PDF Preview Modal
  const handleClosePdfPreview = () => {
    if (pdfPreviewBlobUrl) {
      URL.revokeObjectURL(pdfPreviewBlobUrl);
      setPdfPreviewBlobUrl(null);
    }
    setShowPdfPreview(false);
  };

  // Print generated underwriting memo specifically using a clean print template in a hidden iframe
  const handlePrintMemo = () => {
    if (!appraisalMemo) return;
    
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    document.body.appendChild(iframe);
    
    const doc = iframe.contentWindow?.document || iframe.contentDocument;
    if (doc) {
      doc.open();
      doc.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Underwriting Memo - ${borrowerProfile.borrowerName}</title>
          <style>
            @media print {
              body {
                margin: 20mm;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                font-size: 11pt;
                line-height: 1.6;
                color: #1e293b;
              }
              pre {
                white-space: pre-wrap;
                font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
                font-size: 9.5pt;
                background-color: transparent;
                border: none;
                padding: 0;
                margin: 0;
              }
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              padding: 20px;
              color: #1e293b;
              line-height: 1.6;
            }
            pre {
              white-space: pre-wrap;
              font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
              background-color: #f8fafc;
              border: 1px solid #e2e8f0;
              padding: 15px;
              border-radius: 6px;
            }
          </style>
        </head>
        <body>
          <div style="margin-bottom: 25px; border-bottom: 2px solid #1e3a8a; padding-bottom: 10px;">
            <h2 style="margin: 0; color: #1e3a8a; font-size: 18pt;">CREDIT UNDERWRITING APPRAISAL MEMO</h2>
            <div style="font-size: 9pt; color: #64748b; margin-top: 5px;">
              CONFIDENTIAL • GENERATED VIA APPRAISAL INTELLIGENCE SUITE
            </div>
          </div>
          <pre>${appraisalMemo}</pre>
        </body>
        </html>
      `);
      doc.close();
      
      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        document.body.removeChild(iframe);
      }, 250);
    }
  };

  // Save key
  const handleSaveApiKey = (key: string) => {
    setGeminiKey(key);
    sessionStorage.setItem("gemini_api_key", key);
    setShowSettings(false);
  };

  // Clear key
  const handleClearApiKey = () => {
    setGeminiKey("");
    sessionStorage.removeItem("gemini_api_key");
  };

  // --- AI COPILOT HUB HANDLERS ---

  // Chatbot handler
  const handleSendChatMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = { 
      role: "user" as const, 
      text: chatInput, 
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    };
    
    setChatMessages(prev => [...prev, userMsg]);
    const inputMessage = chatInput;
    setChatInput("");
    setIsChatLoading(true);
    setChatError(null);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-gemini-key": geminiKey
        },
        body: JSON.stringify({
          history: chatMessages,
          message: inputMessage,
          borrowerProfile,
          parameterScores: parameters.map(p => ({
            name: p.name,
            value: p.currentValue,
            score: p.score,
            color: p.color
          }))
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to communicate with chat.");
      }

      setChatMessages(prev => [...prev, {
        role: "model",
        text: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } catch (err: any) {
      console.error(err);
      setChatError(err.message || "An error occurred while contacting the chatbot.");
    } finally {
      setIsChatLoading(false);
    }
  };

  // Image Upload handler
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      const commaIdx = result.indexOf(",");
      const base64 = result.substring(commaIdx + 1);
      setScannedImageBase64(base64);
      setScannedImageMimeType(file.type);
      setScannerResult(null);
      setScannerError(null);
    };
    reader.readAsDataURL(file);
  };

  // Scan Image / Document handler (using Gemini 3.1 Pro Preview)
  const handleScanImage = async () => {
    if (!scannedImageBase64) return;
    setIsScannerLoading(true);
    setScannerError(null);
    setScannerResult(null);

    try {
      const response = await fetch("/api/analyze-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-gemini-key": geminiKey
        },
        body: JSON.stringify({
          base64Data: scannedImageBase64,
          mimeType: scannedImageMimeType,
          prompt: scannerPrompt,
          borrowerProfile
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to scan the image.");
      }

      setScannerResult(data.analysis);
    } catch (err: any) {
      console.error(err);
      setScannerError(err.message || "An error occurred during scanning.");
    } finally {
      setIsScannerLoading(false);
    }
  };

  // Fast Advisor handler (using Gemini 3.1 Flash Lite)
  const handleGetFastAdvice = async (paramName?: string, paramVal?: any) => {
    setIsFastAdvisorLoading(true);
    setFastAdvisorError(null);
    setFastAdvisorResult(null);

    try {
      const payload: any = {};
      if (paramName && paramVal !== undefined) {
        payload.parameterName = paramName;
        payload.parameterValue = String(paramVal);
      } else {
        payload.prompt = fastAdvisorCustomPrompt || "Provide general commercial vehicle lending insights.";
      }

      const response = await fetch("/api/fast-advisor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-gemini-key": geminiKey
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to retrieve fast advice.");
      }

      setFastAdvisorResult(data.advice);
    } catch (err: any) {
      console.error(err);
      setFastAdvisorError(err.message || "An error occurred getting advice.");
    } finally {
      setIsFastAdvisorLoading(false);
    }
  };

  // AI Scorecard Optimizer & Intelligence Analyser (using Gemini 3.5 Flash)
  const handleRunAiAnalysis = async () => {
    setIsAiAnalysisLoading(true);
    setAiAnalysisError(null);
    setAiAnalysisResult(null);

    try {
      const activeParams = parameters.map(p => `- ${p.name}: current score is ${p.score}/5 (${p.color.toUpperCase()}) with value "${p.currentValue}".`).join("\n");
      const prompt = `Perform an elite Credit Risk Assessment & Optimization analysis on M/S ${borrowerProfile.borrowerName}.
Our active parameters scores are:
${activeParams}

Total Raw Score: ${rawScore}/65
Risk Level: Level ${currentRiskLevel.level} - ${currentRiskLevel.label}

Please provide:
1. SCORECARD OPTIMIZATION STRATEGY: Suggest exactly how the borrower can improve 2 of their RED or AMBER parameters to get their score below 36.
2. 3 CUSTOM HIGH-IMPACT POLICY COVENANTS: Tailored specific mitigants we can add to the sanction letter to de-risk this transaction.
3. REGULATORY SUMMARY: A 2-sentence summary of overall credit compliance.
Format beautifully with neat headings and professional bullet points.`;

      const response = await fetch("/api/fast-advisor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-gemini-key": geminiKey
        },
        body: JSON.stringify({ prompt })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to run risk intelligence scan.");
      }

      setAiAnalysisResult(data.advice);
    } catch (err: any) {
      console.error(err);
      setAiAnalysisError(err.message || "An error occurred running the intelligence analysis.");
    } finally {
      setIsAiAnalysisLoading(false);
    }
  };

  // Generate Underwriting Memo via Server Proxy
  const handleGenerateMemo = async () => {
    setIsGeneratingMemo(true);
    setMemoError(null);

    const formattedParams = parameters.map(p => ({
      name: p.name,
      value: p.currentValue + (p.unit !== "Category" && p.unit !== "Years" ? p.unit : ""),
      score: p.score,
      color: p.color
    }));

    try {
      const res = await fetch("/api/generate-memo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Gemini-Key": geminiKey
        },
        body: JSON.stringify({
          borrowerProfile,
          parameterScores: formattedParams,
          rawScore,
          riskLevel: {
            level: currentRiskLevel.level,
            label: currentRiskLevel.label
          },
          overallAssessment: overallDecision
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Server failed to compile memo.");
      }

      setAppraisalMemo(data.memo);
    } catch (err: any) {
      console.error(err);
      setMemoError(err.message || "Could not generate AI Memo. Verify network or API key.");
    } finally {
      setIsGeneratingMemo(false);
    }
  };

  // Checklist updates
  const handleChecklistToggle = (id: string) => {
    setChecklist(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, checked: !item.checked };
      }
      return item;
    }));
  };

  const completedDocsCount = checklist.filter(item => item.checked).length;
  const checklistPercentage = Math.round((completedDocsCount / checklist.length) * 100);

  // SHAP calculation: Find strongest risk drivers (score 5) and mitigants (score 1)
  const riskDrivers = [...parameters]
    .filter(p => p.score === 5)
    .sort((a, b) => b.id - a.id)
    .slice(0, 3);

  const riskMitigants = [...parameters]
    .filter(p => p.score === 1)
    .sort((a, b) => a.id - b.id)
    .slice(0, 3);

  // Sorting and Filtering Alerts (Tab 3)
  const filteredAlerts = allAlerts.filter(a => {
    const matchesSearch = a.borrowerName.toLowerCase().includes(alertsSearch.toLowerCase()) ||
                          a.id.toLowerCase().includes(alertsSearch.toLowerCase()) ||
                          a.segment.toLowerCase().includes(alertsSearch.toLowerCase());
    
    if (alertsFilter === "All") return matchesSearch;
    if (alertsFilter === "Critical") return matchesSearch && a.riskLevel >= 8;
    if (alertsFilter === "Watch") return matchesSearch && (a.riskLevel === 6 || a.riskLevel === 7);
    if (alertsFilter === "Review") return matchesSearch && (a.riskLevel === 4 || a.riskLevel === 5);
    return matchesSearch;
  });

  const sortedAlerts = [...filteredAlerts].sort((a, b) => {
    let aVal = a[alertsSortField];
    let bVal = b[alertsSortField];

    if (typeof aVal === "string") {
      return alertsSortAsc ? (aVal as string).localeCompare(bVal as string) : (bVal as string).localeCompare(aVal as string);
    } else {
      return alertsSortAsc ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
    }
  });

  const handleSortAlerts = (field: keyof AlertItem) => {
    if (alertsSortField === field) {
      setAlertsSortAsc(!alertsSortAsc);
    } else {
      setAlertsSortField(field);
      setAlertsSortAsc(true);
    }
  };

  // Dynamic states for Portfolio Filtering based on Risk Sensitivity Threshold
  const filteredAccounts = initialTopAccounts.filter(item => {
    if (filterMode === "max") {
      return item.riskScore <= riskSensitivity;
    } else {
      return item.riskScore >= riskSensitivity;
    }
  });

  const filteredRatingDistribution = riskRatingDistribution.map(r => {
    // Determine level score boundaries
    const maxScores = [0, 18, 24, 30, 35, 40, 44, 49, 54, 60, 65];
    const minScores = [0, 13, 19, 25, 31, 36, 41, 45, 50, 55, 61];
    const minS = minScores[r.level];
    const maxS = maxScores[r.level];
    
    let scaleFactor = 0;
    if (filterMode === "max") {
      if (maxS <= riskSensitivity) {
        scaleFactor = 1;
      } else if (minS > riskSensitivity) {
        scaleFactor = 0;
      } else {
        // Partial overlap
        scaleFactor = (riskSensitivity - minS + 1) / (maxS - minS + 1);
      }
    } else {
      if (minS >= riskSensitivity) {
        scaleFactor = 1;
      } else if (maxS < riskSensitivity) {
        scaleFactor = 0;
      } else {
        // Partial overlap
        scaleFactor = (maxS - riskSensitivity + 1) / (maxS - minS + 1);
      }
    }
    
    return {
      ...r,
      count: Math.round(r.count * scaleFactor)
    };
  });

  const totalFilteredCount = filteredRatingDistribution.reduce((sum, r) => sum + r.count, 0);

  const weightedScoreSum = filteredRatingDistribution.reduce((sum, r) => {
    const midScores = [0, 15, 21, 27, 33, 38, 42, 47, 52, 57, 63];
    return sum + (r.count * midScores[r.level]);
  }, 0);

  const dynamicAvgRiskScore = totalFilteredCount > 0 
    ? parseFloat((weightedScoreSum / totalFilteredCount).toFixed(1))
    : 0;

  const dynamicRiskLevel = mapRawScoreToRiskLevel(Math.round(dynamicAvgRiskScore));

  const filteredSegmentDistribution = segmentDistribution.map(s => {
    const ratio = totalFilteredCount / 840;
    let val = s.value * ratio;
    
    const segmentCode = s.name.split(" ")[0];
    const countInTop10 = filteredAccounts.filter(a => a.segment === segmentCode).length;
    const totalInTop10 = filteredAccounts.length;
    
    if (totalInTop10 > 0) {
      const top10Ratio = countInTop10 / totalInTop10;
      val = (val * 0.6) + (s.value * ratio * top10Ratio * 2.0 * 0.4);
    }
    
    return {
      ...s,
      value: parseFloat(Math.max(0, val).toFixed(1))
    };
  });

  const totalFilteredSegmentValue = filteredSegmentDistribution.reduce((sum, s) => sum + s.value, 0);
  const finalSegmentDistribution = filteredSegmentDistribution.map(s => {
    return {
      ...s,
      percentage: totalFilteredSegmentValue > 0 ? Math.round((s.value / totalFilteredSegmentValue) * 100) : 0
    };
  });

  const getDynamicCollectionTrend = () => {
    if (totalFilteredCount === 0) return monthlyCollectionTrend;
    const diff = dynamicAvgRiskScore - 28.6;
    const rateOffset = -diff * 0.25;
    
    return monthlyCollectionTrend.map(t => {
      let newRate = t.rate + rateOffset;
      newRate = Math.max(65, Math.min(99.8, newRate));
      return {
        month: t.month,
        rate: parseFloat(newRate.toFixed(1))
      };
    });
  };

  const dynamicCollectionTrendData = getDynamicCollectionTrend();
  const dynamicCollectionRate = dynamicCollectionTrendData.length > 0
    ? parseFloat((dynamicCollectionTrendData.reduce((sum, t) => sum + t.rate, 0) / dynamicCollectionTrendData.length).toFixed(1))
    : 94.8;

  const dynamicActiveAccounts = totalFilteredCount;
  const dynamicTotalValue = parseFloat((342.5 * (totalFilteredCount / 840)).toFixed(1));

  // Portfolio KPIs and Charts initialization via Chart.js
  const barChartRef = useRef<HTMLCanvasElement | null>(null);
  const donutChartRef = useRef<HTMLCanvasElement | null>(null);
  const lineChartRef = useRef<HTMLCanvasElement | null>(null);

  const barChartInst = useRef<any>(null);
  const donutChartInst = useRef<any>(null);
  const lineChartInst = useRef<any>(null);

  useEffect(() => {
    if (activeTab !== "portfolio") return;

    // 1. Risk Rating Distribution Chart (Bar)
    if (barChartRef.current && (window as any).Chart) {
      if (barChartInst.current) barChartInst.current.destroy();
      const ctx = barChartRef.current.getContext("2d");
      if (ctx) {
        barChartInst.current = new (window as any).Chart(ctx, {
          type: "bar",
          data: {
            labels: filteredRatingDistribution.map(r => `${r.level} (${r.label})`),
            datasets: [{
              label: "Number of Borrowers",
              data: filteredRatingDistribution.map(r => r.count),
              backgroundColor: filteredRatingDistribution.map(r => r.color),
              borderRadius: 6,
              borderWidth: 0
            }]
          },
          options: {
            indexAxis: "y",
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: {
                callbacks: {
                  label: function(context: any) {
                    return ` Accounts: ${context.raw}`;
                  }
                }
              }
            },
            scales: {
              x: {
                beginAtZero: true,
                grid: { color: "#e2e8f0" },
                ticks: { color: "#64748b", stepSize: 10 }
              },
              y: {
                grid: { display: false },
                ticks: {
                  color: "#64748b"
                }
              }
            }
          }
        });
      }
    }

    // 2. Portfolio Segments Chart (Doughnut)
    if (donutChartRef.current && (window as any).Chart) {
      if (donutChartInst.current) donutChartInst.current.destroy();
      const ctx = donutChartRef.current.getContext("2d");
      if (ctx) {
        donutChartInst.current = new (window as any).Chart(ctx, {
          type: "doughnut",
          data: {
            labels: finalSegmentDistribution.map(s => s.name.split(" ")[0]),
            datasets: [{
              data: finalSegmentDistribution.map(s => s.value),
              backgroundColor: finalSegmentDistribution.map(s => s.color),
              borderWidth: 2,
              borderColor: "#ffffff"
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: "right",
                labels: {
                  boxWidth: 12,
                  color: "#334155",
                  font: { size: 11 }
                }
              },
              tooltip: {
                callbacks: {
                  label: function(context: any) {
                    const idx = context.dataIndex;
                    return ` ₹${context.raw} Cr (${finalSegmentDistribution[idx].percentage}%)`;
                  }
                }
              }
            },
            cutout: "60%"
          }
        });
      }
    }

    // 3. Collection Rate Chart (Line)
    if (lineChartRef.current && (window as any).Chart) {
      if (lineChartInst.current) lineChartInst.current.destroy();
      const ctx = lineChartRef.current.getContext("2d");
      if (ctx) {
        lineChartInst.current = new (window as any).Chart(ctx, {
          type: "line",
          data: {
            labels: dynamicCollectionTrendData.map(t => t.month),
            datasets: [{
              label: "Collection Efficiency",
              data: dynamicCollectionTrendData.map(t => t.rate),
              borderColor: "#2E75B6",
              backgroundColor: "rgba(46, 117, 182, 0.1)",
              borderWidth: 3,
              fill: true,
              tension: 0.3,
              pointBackgroundColor: "#1B3A6B",
              pointHoverRadius: 6
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: {
                callbacks: {
                  label: function(context: any) {
                    return ` Efficiency: ${context.raw}%`;
                  }
                }
              }
            },
            scales: {
              y: {
                min: Math.max(0, Math.floor(Math.min(...dynamicCollectionTrendData.map(t => t.rate)) - 2)),
                max: 100,
                grid: { color: "#e2e8f0" },
                ticks: {
                  color: "#64748b",
                  callback: function(value: any) { return value + "%"; }
                }
              },
              x: {
                grid: { display: false },
                ticks: { color: "#64748b" }
              }
            }
          }
        });
      }
    }

    return () => {
      if (barChartInst.current) barChartInst.current.destroy();
      if (donutChartInst.current) donutChartInst.current.destroy();
      if (lineChartInst.current) lineChartInst.current.destroy();
    };
  }, [activeTab, riskSensitivity, filterMode]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      
      {/* 1. Header Bar */}
      <header className="sticky top-0 z-40 bg-[#1B3A6B] text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-lg">
              <Shield className="h-6 w-6 text-sky-400" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">NBFC Commercial Credit Risk</h1>
              <p className="text-xs text-sky-200">AI-Powered Appraisal & Portfolio Dashboard</p>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="flex flex-wrap items-center gap-1">
            <button
              onClick={() => setActiveTab("portfolio")}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 flex items-center gap-2 ${
                activeTab === "portfolio"
                  ? "bg-white text-[#1B3A6B] shadow"
                  : "text-white hover:bg-white/10"
              }`}
            >
              <Activity className="h-4 w-4" />
              <span>Portfolio Overview</span>
            </button>
            <button
              onClick={() => setActiveTab("assess")}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 flex items-center gap-2 ${
                activeTab === "assess"
                  ? "bg-white text-[#1B3A6B] shadow"
                  : "text-white hover:bg-white/10"
              }`}
            >
              <FileCheck2 className="h-4 w-4" />
              <span>Assess Borrower</span>
            </button>
            <button
              onClick={() => setActiveTab("alerts")}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 flex items-center gap-2 ${
                activeTab === "alerts"
                  ? "bg-white text-[#1B3A6B] shadow"
                  : "text-white hover:bg-white/10"
              }`}
            >
              <ShieldAlert className="h-4 w-4" />
              <span>Risk Alerts</span>
              <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                {allAlerts.filter(a => a.riskLevel >= 8).length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab("scorecard")}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 flex items-center gap-2 ${
                activeTab === "scorecard"
                  ? "bg-white text-[#1B3A6B] shadow"
                  : "text-white hover:bg-white/10"
              }`}
            >
              <Layers className="h-4 w-4" />
              <span>Scorecard</span>
            </button>
            <button
              onClick={() => setActiveTab("glossary")}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 flex items-center gap-2 ${
                activeTab === "glossary"
                  ? "bg-white text-[#1B3A6B] shadow"
                  : "text-white hover:bg-white/10"
              }`}
            >
              <BookOpen className="h-4 w-4" />
              <span>Glossary</span>
            </button>
            <button
              onClick={() => setActiveTab("ai-copilot")}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 flex items-center gap-2 relative ${
                activeTab === "ai-copilot"
                  ? "bg-white text-[#1B3A6B] shadow"
                  : "text-white hover:bg-white/10"
              }`}
            >
              <Sparkles className="h-4 w-4 text-sky-400" />
              <span>AI Underwriting Copilot</span>
              <span className="absolute -top-1 -right-1 bg-sky-500 text-white text-[8px] px-1 rounded-full uppercase font-bold animate-pulse">
                NEW
              </span>
            </button>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSettings(true)}
              className="p-1.5 bg-white/10 hover:bg-white/20 rounded-full transition-colors relative group"
              title="Configure API Credentials"
            >
              <Settings className="h-5 w-5" />
              {geminiKey ? (
                <span className="absolute top-0 right-0 h-2.5 w-2.5 bg-emerald-500 border-2 border-[#1B3A6B] rounded-full"></span>
              ) : null}
            </button>
            <div className="hidden md:block text-right">
              <span className="text-[10px] block text-sky-200">Logged in as</span>
              <span className="text-xs font-semibold block max-w-[120px] truncate">MBA Finance Demo</span>
            </div>
          </div>
        </div>
      </header>

      {/* Breadcrumb Bar */}
      <div className="bg-slate-100 border-b border-slate-200 py-2">
        <div className="max-w-7xl mx-auto px-4 flex items-center text-xs text-slate-500 gap-1">
          <span>NBFC Appraisal Portal</span>
          <span>/</span>
          <span className="capitalize font-semibold text-slate-700">
            {activeTab === "portfolio" ? "Portfolio Analytics Overview" : 
             activeTab === "assess" ? "Active Borrower Risk Underwriting Tool" :
             activeTab === "alerts" ? "High-Exposure Stress Alerts Logs" :
             activeTab === "scorecard" ? "Credit Matrix Dimensions scorecard" : "Interactive Searchable Financial Glossary"}
          </span>
        </div>
      </div>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6">
        
        {/* =======================================================
            TAB 1: PORTFOLIO OVERVIEW
            ======================================================= */}
        {activeTab === "portfolio" && (
          <div className="space-y-6 animate-fade-in">
            {/* Risk Sensitivity Global Control Panel */}
            <div className="bg-white p-5 md:p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                    <Filter className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">Global Risk Sensitivity Console</h3>
                    <p className="text-xs text-slate-400">Dynamically filter the entire portfolio dashboard by adjusting the risk score threshold</p>
                  </div>
                </div>
                
                {/* Reset button */}
                <button
                  onClick={() => {
                    setRiskSensitivity(65);
                    setFilterMode("max");
                  }}
                  className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold rounded transition-colors flex items-center gap-1"
                >
                  <RefreshCw className="h-3 w-3" /> Reset Filter
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                {/* Slider Input */}
                <div className="md:col-span-7 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-500">Risk Score Threshold:</span>
                    <span className="bg-indigo-600 text-white font-bold px-2 py-0.5 rounded font-mono text-sm shadow-sm">
                      {riskSensitivity} / 65
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-slate-400 font-bold whitespace-nowrap">Lvl 1 (13)</span>
                    <input
                      type="range"
                      min="13"
                      max="65"
                      step="1"
                      className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600 border border-slate-200"
                      value={riskSensitivity}
                      onChange={e => setRiskSensitivity(Number(e.target.value))}
                    />
                    <span className="text-[10px] text-red-500 font-bold whitespace-nowrap">Lvl 10 (65)</span>
                  </div>
                  
                  {/* Explanatory subtitle for current value */}
                  <div className="text-[11px] text-slate-500 flex justify-between font-medium">
                    <span>Selected: {mapRawScoreToRiskLevel(riskSensitivity).label} (Level {mapRawScoreToRiskLevel(riskSensitivity).level})</span>
                    <span className="italic text-slate-400">Drag slider to adjust threshold</span>
                  </div>
                </div>

                {/* Filter Mode Selector */}
                <div className="md:col-span-5 space-y-2">
                  <span className="block text-xs font-semibold text-slate-500">Filter View Mode:</span>
                  <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-lg border border-slate-200">
                    <button
                      onClick={() => setFilterMode("max")}
                      className={`py-1.5 text-xs font-bold rounded-md transition-all ${
                        filterMode === "max"
                          ? "bg-white text-indigo-700 shadow-sm"
                          : "text-slate-600 hover:text-slate-800"
                      }`}
                    >
                      Safe Limits (≤ {riskSensitivity})
                    </button>
                    <button
                      onClick={() => setFilterMode("min")}
                      className={`py-1.5 text-xs font-bold rounded-md transition-all ${
                        filterMode === "min"
                          ? "bg-white text-rose-700 shadow-sm"
                          : "text-slate-600 hover:text-slate-800"
                      }`}
                    >
                      Watch-List (≥ {riskSensitivity})
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">Total Portfolio Value</span>
                  <span className="text-2xl font-bold text-slate-800">₹{dynamicTotalValue} Cr</span>
                  <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1 mt-1">
                    <TrendingUp className="h-3.5 w-3.5" /> +12.4% YoY Growth
                  </span>
                </div>
                <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                  <Briefcase className="h-6 w-6" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">Active Accounts</span>
                  <span className="text-2xl font-bold text-slate-800">{dynamicActiveAccounts}</span>
                  <span className="text-xs text-slate-500 mt-1 block">SME & Fleet Owners</span>
                </div>
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
                  <Users className="h-6 w-6" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">Average Risk Score</span>
                  <span className="text-2xl font-bold text-slate-800">
                    {dynamicAvgRiskScore} <span className="text-xs font-medium text-slate-500">/ 65</span>
                  </span>
                  <span 
                    className="text-xs font-bold flex items-center gap-1 mt-1"
                    style={{ color: dynamicRiskLevel.color }}
                  >
                    Level {dynamicRiskLevel.level}: {dynamicRiskLevel.label}
                  </span>
                </div>
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
                  <Shield className="h-6 w-6" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">Collection Rate</span>
                  <span className="text-2xl font-bold text-slate-800">{dynamicCollectionRate}%</span>
                  <span className="text-xs text-slate-500 block mt-1">Weighted 12-month avg</span>
                </div>
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
                  <Percent className="h-6 w-6" />
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Risk Levels distribution */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm lg:col-span-2 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-slate-800">Borrower Risk Rating Distribution</h3>
                    <p className="text-xs text-slate-400">Total accounts mapped across the 10-tier rating scale</p>
                  </div>
                  <div className="text-xs px-2.5 py-1 bg-[#1B3A6B]/5 text-[#1B3A6B] rounded-full font-semibold">
                    10-Tier Intuitive Rating Scale
                  </div>
                </div>
                <div className="relative h-80 flex-1">
                  <canvas ref={barChartRef}></canvas>
                </div>
              </div>

              {/* Segment breakdown */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col">
                <div className="mb-4">
                  <h3 className="font-bold text-slate-800">Portfolio by Product Segment</h3>
                  <p className="text-xs text-slate-400">Outstanding principal allocation across NBFC sectors</p>
                </div>
                <div className="relative h-48 flex-1">
                  <canvas ref={donutChartRef}></canvas>
                </div>
                <div className="mt-4 border-t border-slate-100 pt-3 text-xs space-y-1.5 text-slate-500 max-h-24 overflow-y-auto">
                  {finalSegmentDistribution.map((s, idx) => (
                    <div key={idx} className="flex justify-between items-center">
                      <span className="flex items-center gap-1.5 font-medium truncate max-w-[180px]">
                        <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: s.color }}></span>
                        {s.name}
                      </span>
                      <span>₹{s.value} Cr ({s.percentage}%)</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Line Chart: Monthly collection trend */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm lg:col-span-3">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-slate-800">Monthly Collection Efficiency Trend (Past 12 Months)</h3>
                    <p className="text-xs text-slate-400">Escrow remittance collection rate percentages relative to EMIs due</p>
                  </div>
                  <div className="text-xs text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full font-bold flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" /> Average collection is 94.8%
                  </div>
                </div>
                <div className="relative h-60">
                  <canvas ref={lineChartRef}></canvas>
                </div>
              </div>
            </div>

            {/* Table: Top 10 accounts ranked by risk score (highest risk first) */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h3 className="font-bold text-slate-800">Top 10 Exposure Accounts Log</h3>
                  <p className="text-xs text-slate-400">Active borrowers sorted by credit risk score (highest risk listed first)</p>
                </div>
                <button
                  onClick={() => setActiveTab("alerts")}
                  className="text-xs font-bold text-[#1B3A6B] hover:underline flex items-center gap-1"
                >
                  View All Critical Accounts <Plus className="h-3 w-3" />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                      <th className="p-4">Account ID</th>
                      <th className="p-4">Borrower Name</th>
                      <th className="p-4">Segment</th>
                      <th className="p-4">Type</th>
                      <th className="p-4">Loan Amount</th>
                      <th className="p-4">Raw Score</th>
                      <th className="p-4">Risk Level</th>
                      <th className="p-4">Trigger Warning Cause</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {filteredAccounts.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-slate-400 font-semibold">
                          No exposure accounts match the current risk sensitivity threshold filter. Try adjusting the slider or changing the filter view mode.
                        </td>
                      </tr>
                    ) : (
                      filteredAccounts.map((item, idx) => {
                        const levelObj = riskRatingScale[item.riskLevel - 1] || riskRatingScale[4];
                        return (
                          <tr 
                            key={idx} 
                            className={`hover:bg-slate-50 transition-colors ${
                              item.riskLevel >= 8 ? "bg-red-50/40" : 
                              item.riskLevel >= 6 ? "bg-amber-50/20" : ""
                            }`}
                          >
                            <td className="p-4 font-mono font-bold text-slate-800">{item.id}</td>
                            <td className="p-4 font-semibold text-slate-900">{item.borrowerName}</td>
                            <td className="p-4">{item.segment}</td>
                            <td className="p-4">{item.borrowerType}</td>
                            <td className="p-4">₹{item.loanAmount} Lakhs</td>
                            <td className="p-4">{item.riskScore} / 65</td>
                            <td className="p-4">
                              <span 
                                className="px-2 py-0.5 rounded text-[10px] font-bold text-white uppercase"
                                style={{ backgroundColor: levelObj.color }}
                              >
                                Lvl {item.riskLevel} - {item.riskLabel}
                              </span>
                            </td>
                            <td className="p-4 text-slate-500 max-w-sm truncate" title={item.triggerReason}>
                              {item.triggerReason}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* =======================================================
            TAB 2: ASSESS BORROWER (Main Tool)
            ======================================================= */}
        {activeTab === "assess" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
            
            {/* Form Section */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Profile Card */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <Building className="h-5 w-5 text-[#1B3A6B]" />
                    <h3 className="font-bold text-slate-800">Borrower Profile & Underwriting Input</h3>
                  </div>

                  {/* Load Demo Data Dropdown */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                      <RefreshCw className="h-3 w-3 animate-spin-hover" /> Quick Demo Template:
                    </span>
                    <select
                      onChange={handleLoadDemo}
                      defaultValue="0"
                      className="text-xs bg-slate-100 border border-slate-300 rounded px-2.5 py-1 text-slate-700 font-medium focus:ring-1 focus:ring-[#1B3A6B] focus:border-[#1B3A6B] outline-none"
                    >
                      <option value="0">Ganga Sand Mining (Moderate Risk)</option>
                      <option value="1">Hariom interstate (Strong Credit)</option>
                      <option value="2">Apex Brick Kiln (Stressed Risk)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Company/Borrower Name</label>
                    <input
                      type="text"
                      className="w-full text-xs p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#1B3A6B] focus:border-[#1B3A6B] outline-none text-slate-800"
                      value={borrowerProfile.borrowerName}
                      onChange={e => setBorrowerProfile(p => ({ ...p, borrowerName: e.target.value }))}
                      placeholder="e.g. Balaji Roadways Ltd"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Borrower Constitution Type</label>
                    <select
                      className="w-full text-xs p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#1B3A6B] focus:border-[#1B3A6B] outline-none text-slate-800 font-semibold"
                      value={borrowerProfile.borrowerType}
                      onChange={e => setBorrowerProfile(p => ({ ...p, borrowerType: e.target.value as any }))}
                    >
                      <option value="Proprietorship">Proprietorship (Solo Owner)</option>
                      <option value="Partnership">Partnership (Multiple Promoters)</option>
                      <option value="SME">SME (Small/Medium Company)</option>
                      <option value="Corporate">Corporate Limited (Large Enterprise)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Loan Amount Requested (₹ Lakhs)</label>
                    <input
                      type="number"
                      className="w-full text-xs p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#1B3A6B] focus:border-[#1B3A6B] outline-none text-slate-800"
                      value={borrowerProfile.loanAmount}
                      onChange={e => setBorrowerProfile(p => ({ ...p, loanAmount: Number(e.target.value) }))}
                      placeholder="e.g. 150 (equals ₹1.5 Crore)"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">End-Use Loan Purpose</label>
                    <input
                      type="text"
                      className="w-full text-xs p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#1B3A6B] focus:border-[#1B3A6B] outline-none text-slate-800"
                      value={borrowerProfile.loanPurpose}
                      onChange={e => setBorrowerProfile(p => ({ ...p, loanPurpose: e.target.value }))}
                      placeholder="e.g. Purchase of Tipper Fleet for Quarry"
                    />
                  </div>
                </div>
              </div>

              {/* 13 Parameters Input Groups */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-6">
                <div className="border-b border-slate-100 pb-2">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <Grid className="h-5 w-5 text-[#2E75B6]" />
                    Credit Appraisal Framework Parameters (13 Dimensions)
                  </h3>
                  <p className="text-xs text-slate-400">Alter parameters dynamically. The credit scoring badge recalculates immediately.</p>
                </div>

                {/* Sub-section: Financial Health */}
                <div>
                  <h4 className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-3 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 bg-[#1B3A6B] rounded-full inline-block"></span>
                    Financial Health & Leverage Parameters
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Current to Cumulative Exposure */}
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <label className="text-xs font-semibold text-slate-600 group relative">
                          <span className="underline decoration-dotted cursor-help">Current to Cumulative Exposure</span>
                          <span className="absolute hidden group-hover:block bg-slate-800 text-white text-[11px] rounded p-2.5 w-64 -top-2 left-full ml-2 z-50 shadow-lg">
                            Ratio of requested limit relative to borrower's highest-ever historical credit limits with the lender. Lower is safer.
                          </span>
                        </label>
                        <span className="text-xs font-bold text-slate-800">{parameters.find(p => p.id === 3)?.currentValue}%</span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="100"
                        step="5"
                        className="w-full accent-[#1B3A6B]"
                        value={parameters.find(p => p.id === 3)?.currentValue as number}
                        onChange={e => handleParameterChange(3, Number(e.target.value))}
                      />
                      <span className="text-[10px] block text-slate-400">Green: &lt;50% | Amber: 50%-80% | Red: &gt;80%</span>
                    </div>

                    {/* Revenue Growth */}
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <label className="text-xs font-semibold text-slate-600 group relative">
                          <span className="underline decoration-dotted cursor-help">YoY Revenue Growth</span>
                          <span className="absolute hidden group-hover:block bg-slate-800 text-white text-[11px] rounded p-2.5 w-64 -top-2 left-full ml-2 z-50 shadow-lg">
                            Year-over-year sales growth percentage. Extremely high growth (&gt;35%) is flagged as unsustainable operational risk.
                          </span>
                        </label>
                        <span className="text-xs font-bold text-slate-800">{parameters.find(p => p.id === 4)?.currentValue}%</span>
                      </div>
                      <input
                        type="range"
                        min="-20"
                        max="50"
                        step="1"
                        className="w-full accent-[#1B3A6B]"
                        value={parameters.find(p => p.id === 4)?.currentValue as number}
                        onChange={e => handleParameterChange(4, Number(e.target.value))}
                      />
                      <span className="text-[10px] block text-slate-400">Green: &gt;15%-35% | Amber: 5%-15% | Red: &lt;5% or &gt;35%</span>
                    </div>

                    {/* EBITDA Margin */}
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <label className="text-xs font-semibold text-slate-600 group relative">
                          <span className="underline decoration-dotted cursor-help">EBITDA Margin</span>
                          <span className="absolute hidden group-hover:block bg-slate-800 text-white text-[11px] rounded p-2.5 w-64 -top-2 left-full ml-2 z-50 shadow-lg">
                            Core operating profitability margin before interest and tax deductions. Larger margin indicates stronger default resilience.
                          </span>
                        </label>
                        <span className="text-xs font-bold text-slate-800">{parameters.find(p => p.id === 5)?.currentValue}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="30"
                        step="0.5"
                        className="w-full accent-[#1B3A6B]"
                        value={parameters.find(p => p.id === 5)?.currentValue as number}
                        onChange={e => handleParameterChange(5, Number(e.target.value))}
                      />
                      <span className="text-[10px] block text-slate-400">Green: &gt;15% | Amber: 8%-15% | Red: &lt;8%</span>
                    </div>

                    {/* Debt Equity Ratio */}
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <label className="text-xs font-semibold text-slate-600 group relative">
                          <span className="underline decoration-dotted cursor-help">Debt Equity Ratio</span>
                          <span className="absolute hidden group-hover:block bg-slate-800 text-white text-[11px] rounded p-2.5 w-64 -top-2 left-full ml-2 z-50 shadow-lg">
                            Solvency gearing ratio. Higher values imply excessive liabilities and thin capital buffers during trade recessions.
                          </span>
                        </label>
                        <span className="text-xs font-bold text-slate-800">{parameters.find(p => p.id === 6)?.currentValue}x</span>
                      </div>
                      <input
                        type="range"
                        min="0.5"
                        max="8"
                        step="0.1"
                        className="w-full accent-[#1B3A6B]"
                        value={parameters.find(p => p.id === 6)?.currentValue as number}
                        onChange={e => handleParameterChange(6, Number(e.target.value))}
                      />
                      <span className="text-[10px] block text-slate-400">Green: &lt;2x | Amber: 2x-4x | Red: &gt;4x</span>
                    </div>

                    {/* Cash Cover */}
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <label className="text-xs font-semibold text-slate-600 group relative">
                          <span className="underline decoration-dotted cursor-help">Cash Cover Ratio</span>
                          <span className="absolute hidden group-hover:block bg-slate-800 text-white text-[11px] rounded p-2.5 w-64 -top-2 left-full ml-2 z-50 shadow-lg">
                            Compares actual monthly operational cash inflows relative to due debt-service repayment obligations. Must exceed 1.0x.
                          </span>
                        </label>
                        <span className="text-xs font-bold text-slate-800">{parameters.find(p => p.id === 7)?.currentValue}x</span>
                      </div>
                      <input
                        type="range"
                        min="0.4"
                        max="2"
                        step="0.05"
                        className="w-full accent-[#1B3A6B]"
                        value={parameters.find(p => p.id === 7)?.currentValue as number}
                        onChange={e => handleParameterChange(7, Number(e.target.value))}
                      />
                      <span className="text-[10px] block text-slate-400">Green: &gt;1.0x | Amber: 0.8x-1.0x | Red: &lt;0.8x</span>
                    </div>

                    {/* Working Capital Cycle */}
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <label className="text-xs font-semibold text-slate-600 group relative">
                          <span className="underline decoration-dotted cursor-help">Working Capital Cycle</span>
                          <span className="absolute hidden group-hover:block bg-slate-800 text-white text-[11px] rounded p-2.5 w-64 -top-2 left-full ml-2 z-50 shadow-lg">
                            Average days needed to convert trade inventories and bills receivables back into cash liquidity. Shorter is healthier.
                          </span>
                        </label>
                        <span className="text-xs font-bold text-slate-800">{parameters.find(p => p.id === 9)?.currentValue} Days</span>
                      </div>
                      <input
                        type="range"
                        min="-10"
                        max="150"
                        step="5"
                        className="w-full accent-[#1B3A6B]"
                        value={parameters.find(p => p.id === 9)?.currentValue as number}
                        onChange={e => handleParameterChange(9, Number(e.target.value))}
                      />
                      <span className="text-[10px] block text-slate-400">Green: &lt;60 days | Amber: 60-90 days | Red: &gt;90 days or &lt;0</span>
                    </div>
                  </div>
                </div>

                {/* Sub-section: Business Operations */}
                <div className="border-t border-slate-100 pt-4">
                  <h4 className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-3 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 bg-[#2E75B6] rounded-full inline-block"></span>
                    Business Operations & Segments
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Deployment Segment Category */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 group relative mb-1">
                        <span className="underline decoration-dotted cursor-help">Contract Deployment Segment</span>
                        <span className="absolute hidden group-hover:block bg-slate-800 text-white text-[11px] rounded p-2.5 w-64 -top-2 left-full ml-2 z-50 shadow-lg">
                          Stable segments (government work) have low risk. Seasonal or highly cyclical segments (e.g. mining, private real estate) carry high risk.
                        </span>
                      </label>
                      <select
                        className="w-full text-xs p-1.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#1B3A6B] focus:border-[#1B3A6B] outline-none text-slate-800"
                        value={String(parameters.find(p => p.id === 1)?.currentValue)}
                        onChange={e => handleParameterChange(1, e.target.value)}
                      >
                        <option value="Stable Infrastructure Segment">Stable Government Infrastructure Projects (Green)</option>
                        <option value="Moderate Mining Segment">Moderate Risk Private Retail Carriage / Mining (Amber)</option>
                        <option value="Stressed Real Estate Segment">Stressed Sector / Real Estate Speculation (Red)</option>
                      </select>
                    </div>

                    {/* Association with Lender */}
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <label className="text-xs font-semibold text-slate-600 group relative">
                          <span className="underline decoration-dotted cursor-help">Association with Lender</span>
                          <span className="absolute hidden group-hover:block bg-slate-800 text-white text-[11px] rounded p-2.5 w-64 -top-2 left-full ml-2 z-50 shadow-lg">
                            The duration in years of consecutive, active borrowing relationship. Longer association validates trust and credit reliability.
                          </span>
                        </label>
                        <span className="text-xs font-bold text-slate-800">{parameters.find(p => p.id === 2)?.currentValue} Years</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="15"
                        step="1"
                        className="w-full accent-[#1B3A6B]"
                        value={parameters.find(p => p.id === 2)?.currentValue as number}
                        onChange={e => handleParameterChange(2, Number(e.target.value))}
                      />
                      <span className="text-[10px] block text-slate-400">Green: &gt;7 yrs | Amber: 3-7 yrs | Red: &lt;3 yrs</span>
                    </div>

                    {/* Principal Concentration */}
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <label className="text-xs font-semibold text-slate-600 group relative">
                          <span className="underline decoration-dotted cursor-help">Principal Concentration</span>
                          <span className="absolute hidden group-hover:block bg-slate-800 text-white text-[11px] rounded p-2.5 w-64 -top-2 left-full ml-2 z-50 shadow-lg">
                            Percentage of corporate revenue generated from the single largest hiring contractor. High concentration exposes cash flows.
                          </span>
                        </label>
                        <span className="text-xs font-bold text-slate-800">{parameters.find(p => p.id === 8)?.currentValue}%</span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="100"
                        step="5"
                        className="w-full accent-[#1B3A6B]"
                        value={parameters.find(p => p.id === 8)?.currentValue as number}
                        onChange={e => handleParameterChange(8, Number(e.target.value))}
                      />
                      <span className="text-[10px] block text-slate-400">Green: &lt;50% | Amber: 50%-80% | Red: &gt;80%</span>
                    </div>

                    {/* Current Operation Level */}
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <label className="text-xs font-semibold text-slate-600 group relative">
                          <span className="underline decoration-dotted cursor-help">Current Operation Level</span>
                          <span className="absolute hidden group-hover:block bg-slate-800 text-white text-[11px] rounded p-2.5 w-64 -top-2 left-full ml-2 z-50 shadow-lg">
                            Active run-time utilization capacity of the borrower's capital fleet. Idled equipment represents cash drainage.
                          </span>
                        </label>
                        <span className="text-xs font-bold text-slate-800">{parameters.find(p => p.id === 13)?.currentValue}%</span>
                      </div>
                      <input
                        type="range"
                        min="30"
                        max="100"
                        step="5"
                        className="w-full accent-[#1B3A6B]"
                        value={parameters.find(p => p.id === 13)?.currentValue as number}
                        onChange={e => handleParameterChange(13, Number(e.target.value))}
                      />
                      <span className="text-[10px] block text-slate-400">Green: &gt;80% | Amber: 60%-80% | Red: &lt;60%</span>
                    </div>
                  </div>
                </div>

                {/* Sub-section: Repayment Behavior & Asset Quality */}
                <div className="border-t border-slate-100 pt-4">
                  <h4 className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-3 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 bg-purple-600 rounded-full inline-block"></span>
                    Repayment Behavior & Asset Quality
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Percentage of Remittance */}
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <label className="text-xs font-semibold text-slate-600 group relative">
                          <span className="underline decoration-dotted cursor-help">Escrow Remittance Capture</span>
                          <span className="absolute hidden group-hover:block bg-slate-800 text-white text-[11px] rounded p-2.5 w-64 -top-2 left-full ml-2 z-50 shadow-lg">
                            Proportion of overall billing collections deposited into lender escrow channels directly, ensuring swift EMI clearances.
                          </span>
                        </label>
                        <span className="text-xs font-bold text-slate-800">{parameters.find(p => p.id === 10)?.currentValue}%</span>
                      </div>
                      <input
                        type="range"
                        min="5"
                        max="50"
                        step="1.5"
                        className="w-full accent-[#1B3A6B]"
                        value={parameters.find(p => p.id === 10)?.currentValue as number}
                        onChange={e => handleParameterChange(10, Number(e.target.value))}
                      />
                      <span className="text-[10px] block text-slate-400">Green: &gt;25% | Amber: 15%-25% | Red: &lt;15%</span>
                    </div>

                    {/* Fleet Addition */}
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <label className="text-xs font-semibold text-slate-600 group relative">
                          <span className="underline decoration-dotted cursor-help">YoY Fleet Addition</span>
                          <span className="absolute hidden group-hover:block bg-slate-800 text-white text-[11px] rounded p-2.5 w-64 -top-2 left-full ml-2 z-50 shadow-lg">
                            Annual growth speed of operational machines or tipper vehicles. Extremely high growth speeds increase credit strain.
                          </span>
                        </label>
                        <span className="text-xs font-bold text-slate-800">{parameters.find(p => p.id === 11)?.currentValue}%</span>
                      </div>
                      <input
                        type="range"
                        min="5"
                        max="60"
                        step="2"
                        className="w-full accent-[#1B3A6B]"
                        value={parameters.find(p => p.id === 11)?.currentValue as number}
                        onChange={e => handleParameterChange(11, Number(e.target.value))}
                      />
                      <span className="text-[10px] block text-slate-400">Green: &lt;25% | Amber: 25%-35% | Red: &gt;35%</span>
                    </div>

                    {/* Free Assets */}
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <label className="text-xs font-semibold text-slate-600 group relative">
                          <span className="underline decoration-dotted cursor-help">Free Assets (Collateral)</span>
                          <span className="absolute hidden group-hover:block bg-slate-800 text-white text-[11px] rounded p-2.5 w-64 -top-2 left-full ml-2 z-50 shadow-lg">
                            Percentage of operating assets fully unencumbered by prior bank liens, providing secondary collateral backing during defaults.
                          </span>
                        </label>
                        <span className="text-xs font-bold text-slate-800">{parameters.find(p => p.id === 12)?.currentValue}%</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="40"
                        step="1"
                        className="w-full accent-[#1B3A6B]"
                        value={parameters.find(p => p.id === 12)?.currentValue as number}
                        onChange={e => handleParameterChange(12, Number(e.target.value))}
                      />
                      <span className="text-[10px] block text-slate-400">Green: &gt;15% | Amber: 5%-15% | Red: &lt;5%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Collapsible Document Checklist Integration */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <button
                  onClick={() => setChecklistCollapsed(!checklistCollapsed)}
                  className="w-full p-4 bg-slate-100 flex items-center justify-between border-b border-slate-200 font-bold text-xs text-slate-700 outline-none"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-indigo-600" />
                    <span>APPRAISAL CHECKLIST (EXPOSURE NOTE COMPLIANCE)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] text-[#1B3A6B] bg-[#1B3A6B]/10 px-2 py-0.5 rounded-full font-bold">
                      {completedDocsCount} of 14 Completed ({checklistPercentage}%)
                    </span>
                    {checklistCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                  </div>
                </button>

                {!checklistCollapsed && (
                  <div className="p-5 space-y-4">
                    {/* Progress Bar */}
                    <div className="space-y-1.5">
                      <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                          style={{ width: `${checklistPercentage}%` }}
                        ></div>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 block text-right">RBI Compliance Barometer</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                      {/* Initial Docs */}
                      <div className="space-y-2">
                        <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Initial Base Documents</h5>
                        <div className="space-y-2">
                          {checklist.filter(c => c.category === "Initial Documents").map(item => (
                            <label key={item.id} className="flex items-start gap-2.5 cursor-pointer text-[11px] text-slate-600 select-none">
                              <input
                                type="checkbox"
                                checked={item.checked}
                                onChange={() => handleChecklistToggle(item.id)}
                                className="mt-0.5 rounded text-[#1B3A6B] focus:ring-[#1B3A6B] h-3.5 w-3.5"
                              />
                              <span className={item.checked ? "line-through text-slate-400 font-medium" : "font-medium"}>
                                {item.name.split(" ")[0]} {item.name.split(" ").slice(1).join(" ")}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Supporting Docs */}
                      <div className="space-y-2">
                        <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Supporting Transactions</h5>
                        <div className="space-y-2">
                          {checklist.filter(c => c.category === "Supporting Documents").map(item => (
                            <label key={item.id} className="flex items-start gap-2.5 cursor-pointer text-[11px] text-slate-600 select-none">
                              <input
                                type="checkbox"
                                checked={item.checked}
                                onChange={() => handleChecklistToggle(item.id)}
                                className="mt-0.5 rounded text-[#1B3A6B] focus:ring-[#1B3A6B] h-3.5 w-3.5"
                              />
                              <span className={item.checked ? "line-through text-slate-400 font-medium" : "font-medium"}>
                                {item.name}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Additional Requirements */}
                      <div className="space-y-2">
                        <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Additional Requirements</h5>
                        <div className="space-y-2">
                          {checklist.filter(c => c.category === "Additional Requirements").map(item => (
                            <label key={item.id} className="flex items-start gap-2.5 cursor-pointer text-[11px] text-slate-600 select-none">
                              <input
                                type="checkbox"
                                checked={item.checked}
                                onChange={() => handleChecklistToggle(item.id)}
                                className="mt-0.5 rounded text-[#1B3A6B] focus:ring-[#1B3A6B] h-3.5 w-3.5"
                              />
                              <span className={item.checked ? "line-through text-slate-400 font-medium" : "font-medium"}>
                                {item.name}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Calculations Card & AI Memo */}
            <div className="space-y-6">
              
              {/* Dynamic Risk Rating Card */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4 flex flex-col text-center items-center justify-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Computed Risk Level (Live Preview)</span>
                
                {/* Massive color-coded badge */}
                <div 
                  className={`w-32 h-32 rounded-full border-4 flex flex-col items-center justify-center text-white font-black shadow-inner shadow-black/20 transition-all duration-500 ease-in-out ${
                    isScoreChanged ? "animate-badge-pop" : ""
                  }`}
                  style={{ 
                    backgroundColor: currentRiskLevel.color,
                    borderColor: "rgba(255, 255, 255, 0.4)",
                    transitionProperty: "background-color, border-color, transform, box-shadow"
                  }}
                >
                  <span className="text-4xl block leading-none">{currentRiskLevel.level}</span>
                  <span className="text-[10px] uppercase font-bold tracking-widest mt-1 block max-w-[100px] truncate">{currentRiskLevel.label}</span>
                </div>

                <div className="space-y-1">
                  <span className="text-xs text-slate-400">Raw Aggregated Score: <strong>{rawScore}</strong> out of 65</span>
                  <p className="text-xs text-slate-500 font-medium italic max-w-xs">{currentRiskLevel.description}</p>
                </div>

                {/* Score scale visual bar */}
                <div className="w-full space-y-1">
                  <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden flex">
                    <div className="h-full bg-emerald-600" style={{ width: "30%" }}></div>
                    <div className="h-full bg-yellow-400" style={{ width: "25%" }}></div>
                    <div className="h-full bg-orange-500" style={{ width: "25%" }}></div>
                    <div className="h-full bg-red-600" style={{ width: "20%" }}></div>
                  </div>
                  <div className="flex justify-between text-[9px] text-slate-400 font-bold px-1">
                    <span>13 (MIN)</span>
                    <span>35</span>
                    <span>49</span>
                    <span>65 (MAX)</span>
                  </div>
                </div>
              </div>

              {/* Action recommendation card */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-start gap-3">
                <div className={`p-2.5 rounded-lg text-white font-bold text-xs ${
                  overallDecision === "APPROVE" ? "bg-emerald-600" :
                  overallDecision === "CONDITIONAL APPROVE" ? "bg-amber-500" : "bg-red-600"
                }`}>
                  {overallDecision}
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Credit Policy Protocol Action</h4>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5 leading-relaxed">{currentRiskLevel.action}</p>
                </div>
              </div>

              {/* Integrated Underwriting & Analytics Suite */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                {/* Header with Sub-tabs */}
                <div className="bg-slate-50 border-b border-slate-200 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <History className="h-5 w-5 text-indigo-600" />
                    <div>
                      <h4 className="font-bold text-slate-800 text-xs">Appraisal Intelligence Suite</h4>
                      <p className="text-[10px] text-slate-400">Audit logs, explanation drivers & AI tools</p>
                    </div>
                  </div>
                  
                  {/* Tab buttons */}
                  <div className="flex bg-slate-200/80 p-0.5 rounded-lg border border-slate-300">
                    <button
                      onClick={() => setAssessSubTab("shap")}
                      className={`px-3 py-1 text-[11px] font-bold rounded-md transition-all ${
                        assessSubTab === "shap"
                          ? "bg-white text-[#1B3A6B] shadow-sm"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      SHAP Drivers
                    </button>
                    <button
                      onClick={() => setAssessSubTab("history")}
                      className={`px-3 py-1 text-[11px] font-bold rounded-md transition-all flex items-center gap-1 ${
                        assessSubTab === "history"
                          ? "bg-white text-[#1B3A6B] shadow-sm"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      Audit Log
                      {appraisalHistory.filter(h => h.borrowerName === borrowerProfile.borrowerName).length > 0 && (
                        <span className="bg-indigo-100 text-indigo-700 text-[9px] px-1.5 rounded-full">
                          {appraisalHistory.filter(h => h.borrowerName === borrowerProfile.borrowerName).length}
                        </span>
                      )}
                    </button>
                    <button
                      onClick={() => setAssessSubTab("memo")}
                      className={`px-3 py-1 text-[11px] font-bold rounded-md transition-all flex items-center gap-1 ${
                        assessSubTab === "memo"
                          ? "bg-white text-[#1B3A6B] shadow-sm"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      AI Memo
                      <Sparkles className="h-3 w-3 text-sky-500" />
                    </button>
                  </div>
                </div>

                {/* Content Area */}
                <div className="p-5">
                  {/* Tab 1: SHAP Drivers */}
                  {assessSubTab === "shap" && (
                    <div className="space-y-4 animate-fade-in">
                      <div>
                        <h5 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                          <Layers className="h-3.5 w-3.5 text-indigo-600" />
                          Explainable AI - Credit SHAP Factors
                        </h5>
                        <p className="text-[10px] text-slate-400 mt-0.5">Key scoring parameters pushing credit risk up or down</p>
                      </div>

                      <div className="space-y-3 text-xs">
                        {/* Risk Drivers (Pushed Risk UP) */}
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider flex items-center gap-1">
                            <TrendingUp className="h-3.5 w-3.5" /> Core Risk Drivers (Pushed Risk UP)
                          </span>
                          {riskDrivers.length === 0 ? (
                            <span className="text-[11px] text-slate-400 italic block pl-1 bg-slate-50 p-2 rounded border border-slate-100">
                              No critical red parameters active. All metrics are standard/favorable.
                            </span>
                          ) : (
                            <div className="space-y-1 pl-1">
                              {riskDrivers.map(p => (
                                <div key={p.id} className="flex items-center justify-between text-[11px] font-semibold text-slate-700 bg-red-50 p-2 rounded border border-red-100">
                                  <span className="truncate max-w-[180px]">{p.name}</span>
                                  <span className="text-red-600 font-bold bg-red-100 px-1.5 py-0.5 rounded">
                                    {p.currentValue} {p.unit !== "Category" && p.unit !== "Years" ? p.unit : ""}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Risk Mitigants (Pushed Risk DOWN) */}
                        <div className="space-y-1.5 pt-1">
                          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1">
                            <TrendingDown className="h-3.5 w-3.5" /> Supporting Mitigants (Pushed Risk DOWN)
                          </span>
                          {riskMitigants.length === 0 ? (
                            <span className="text-[11px] text-slate-400 italic block pl-1 bg-slate-50 p-2 rounded border border-slate-100">
                              No exceptional green parameters active. Adjust sliders for superior metrics.
                            </span>
                          ) : (
                            <div className="space-y-1 pl-1">
                              {riskMitigants.map(p => (
                                <div key={p.id} className="flex items-center justify-between text-[11px] font-semibold text-slate-700 bg-emerald-50 p-2 rounded border border-emerald-100">
                                  <span className="truncate max-w-[180px]">{p.name}</span>
                                  <span className="text-emerald-600 font-bold bg-emerald-100 px-1.5 py-0.5 rounded">
                                    {p.currentValue} {p.unit !== "Category" && p.unit !== "Years" ? p.unit : ""}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Tab 2: Appraisal Audit History */}
                  {assessSubTab === "history" && (
                    <div className="space-y-4 animate-fade-in">
                      {/* Controls Row */}
                      <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                        <label className="flex items-center gap-2 text-[11px] text-slate-600 font-bold select-none cursor-pointer">
                          <input
                            type="checkbox"
                            checked={filterHistoryCurrent}
                            onChange={(e) => setFilterHistoryCurrent(e.target.checked)}
                            className="rounded text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5"
                          />
                          <span>Current Borrower ({borrowerProfile.borrowerName.split(" ").slice(0, 2).join(" ")})</span>
                        </label>
                        <button
                          onClick={() => {
                            if (window.confirm("Are you sure you want to clear the entire appraisal audit trail?")) {
                              setAppraisalHistory([]);
                            }
                          }}
                          className="text-[10px] font-extrabold text-red-500 hover:text-red-700 hover:underline uppercase tracking-wider"
                        >
                          Clear Trail
                        </button>
                      </div>

                      {/* History Timeline */}
                      <div className="space-y-3.5 max-h-[360px] overflow-y-auto pr-1">
                        {(() => {
                          const list = filterHistoryCurrent
                            ? appraisalHistory.filter(h => h.borrowerName === borrowerProfile.borrowerName)
                            : appraisalHistory;

                          if (list.length === 0) {
                            return (
                              <div className="p-8 text-center bg-slate-50 rounded-lg border border-slate-150 text-slate-400">
                                <History className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                                <p className="text-xs font-semibold">No Audit Trail Records</p>
                                <p className="text-[10px] mt-1 max-w-[200px] mx-auto text-slate-400">Move appraisal parameters or load client templates to log revisions.</p>
                              </div>
                            );
                          }

                          return (
                            <div className="relative pl-3 border-l-2 border-slate-200 space-y-4">
                              {list.map((entry) => {
                                // Check if parameter value is revertible (different from current)
                                const canRevert = entry.parameterId !== undefined &&
                                  entry.prevRawValue !== undefined &&
                                  parameters.find(p => p.id === entry.parameterId)?.currentValue !== entry.prevRawValue;

                                return (
                                  <div key={entry.id} className="relative group text-xs">
                                    {/* Timeline point */}
                                    <span 
                                      className="absolute -left-[18.5px] top-1 w-2.5 h-2.5 rounded-full border-2 border-white"
                                      style={{ backgroundColor: entry.scoreImpact > 0 ? "#DC143C" : entry.scoreImpact < 0 ? "#10B981" : "#1B3A6B" }}
                                    ></span>

                                    {/* Entry Card */}
                                    <div className="bg-slate-50 hover:bg-slate-100 p-3 rounded-lg border border-slate-200 transition-colors space-y-1.5 relative">
                                      {/* Timestamp & Borrower label */}
                                      <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                                        <span>{entry.timestamp}</span>
                                        {!filterHistoryCurrent && (
                                          <span className="text-indigo-600 truncate max-w-[120px]">{entry.borrowerName}</span>
                                        )}
                                      </div>

                                      {/* Parameter & score impact */}
                                      <div className="flex justify-between items-start gap-2">
                                        <h6 className="font-bold text-slate-800 text-[11px] leading-tight">
                                          {entry.parameterName}
                                        </h6>
                                        {/* Score impact Pill */}
                                        {entry.scoreImpact > 0 ? (
                                          <span className="bg-red-50 text-red-600 text-[9px] font-extrabold px-1.5 py-0.5 rounded flex items-center gap-0.5 shadow-sm border border-red-100 shrink-0">
                                            <ArrowUpRight className="h-3 w-3" /> +{entry.scoreImpact} Score (Risk Up)
                                          </span>
                                        ) : entry.scoreImpact < 0 ? (
                                          <span className="bg-emerald-50 text-emerald-600 text-[9px] font-extrabold px-1.5 py-0.5 rounded flex items-center gap-0.5 shadow-sm border border-emerald-100 shrink-0">
                                            <ArrowDownRight className="h-3 w-3" /> {entry.scoreImpact} Score (Risk Down)
                                          </span>
                                        ) : (
                                          <span className="bg-slate-100 text-slate-500 text-[9px] font-extrabold px-1.5 py-0.5 rounded shadow-sm shrink-0 border border-slate-200">
                                            No Impact
                                          </span>
                                        )}
                                      </div>

                                      {/* Values description */}
                                      {entry.parameterName !== "Loaded Demo Template" && entry.parameterName !== "Initial Base Assessment" ? (
                                        <p className="text-[11px] text-slate-500 font-medium">
                                          Value adjusted: <strong className="text-slate-600">{entry.prevValue}</strong> → <strong className="text-indigo-600">{entry.newValue}</strong>
                                        </p>
                                      ) : (
                                        <p className="text-[11px] text-slate-500 font-medium">
                                          Loaded profile values for <strong className="text-slate-700">{entry.newValue}</strong>
                                        </p>
                                      )}

                                      {/* Score status & Revert button */}
                                      <div className="pt-1.5 border-t border-slate-200/60 flex items-center justify-between flex-wrap gap-2">
                                        <div className="flex items-center gap-1.5 text-[10px]">
                                          <span className="text-slate-400 font-semibold">Post-Score:</span>
                                          <span className="font-bold text-slate-700">{entry.newTotalScore} / 65</span>
                                          <span 
                                            className="px-1.5 py-0.2 rounded-[3px] text-[8.5px] font-extrabold text-white uppercase"
                                            style={{ backgroundColor: entry.riskColor }}
                                          >
                                            {entry.riskLevel}
                                          </span>
                                        </div>

                                        {canRevert && (
                                          <button
                                            onClick={() => handleRevertHistoryEntry(entry)}
                                            className="text-[10px] font-extrabold text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5 bg-indigo-50 hover:bg-indigo-100 px-1.5 py-0.5 rounded transition-all"
                                          >
                                            <RefreshCw className="h-2.5 w-2.5" /> Revert
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  )}

                  {/* Tab 3: AI Credit Underwriting Appraisal Memo */}
                  {assessSubTab === "memo" && (
                    <div className="space-y-4 animate-fade-in">
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                            <Sparkles className="h-4 w-4 text-sky-500" />
                            AI Credit Underwriting Appraisal Memo
                          </h5>
                          <p className="text-[10px] text-slate-400">Automatic credit memo compiler backed by Gemini 2.0 Flash</p>
                        </div>
                      </div>

                      <div className="text-xs space-y-4">
                        {memoError && (
                          <div className="p-2.5 bg-red-50 border border-red-200 text-red-600 rounded-lg text-[11px] font-semibold leading-relaxed">
                            {memoError}
                          </div>
                        )}

                        <div className="space-y-2">
                          <button
                            onClick={handleGenerateMemo}
                            disabled={isGeneratingMemo}
                            className="w-full py-2.5 bg-[#1B3A6B] hover:bg-[#2E75B6] disabled:bg-slate-300 text-white font-bold rounded-lg transition-colors text-xs flex items-center justify-center gap-2 shadow"
                          >
                            {isGeneratingMemo ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span>Compiling Appraisal Data...</span>
                              </>
                            ) : (
                              <>
                                <Sparkles className="h-4 w-4" />
                                <span>Generate Appraisal Memo</span>
                              </>
                            )}
                          </button>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <button
                              onClick={handleExportMemo}
                              disabled={!appraisalMemo || isGeneratingMemo}
                              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold rounded-lg transition-colors text-xs flex items-center justify-center gap-2 shadow"
                              title="Export memo as .txt file"
                            >
                              <Download className="h-4 w-4" />
                              <span>Export (.txt)</span>
                            </button>

                            <button
                              onClick={handleOpenPdfPreview}
                              disabled={!appraisalMemo || isGeneratingMemo}
                              className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold rounded-lg transition-colors text-xs flex items-center justify-center gap-2 shadow"
                              title="Preview professional PDF before download or print"
                            >
                              <FileText className="h-4 w-4" />
                              <span>Preview & Export PDF</span>
                            </button>

                            <button
                              onClick={handleOpenPdfPreview}
                              disabled={!appraisalMemo || isGeneratingMemo}
                              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold rounded-lg transition-colors text-xs flex items-center justify-center gap-2 shadow"
                              title="Preview PDF and Print Memo"
                            >
                              <Printer className="h-4 w-4" />
                              <span>Preview & Print PDF</span>
                            </button>
                          </div>
                        </div>

                        {/* Memo Sheet */}
                        <div className="relative bg-amber-50/40 p-4 rounded-xl border border-amber-100 shadow-inner max-h-[380px] overflow-y-auto font-mono text-[11px] text-slate-700 whitespace-pre-wrap leading-relaxed">
                          <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-slate-200 text-[8px] font-bold uppercase rounded text-slate-600 tracking-wider">
                            Official Memo Format
                          </div>
                          {appraisalMemo}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* =======================================================
            TAB 3: RISK ALERTS
            ======================================================= */}
        {activeTab === "alerts" && (
          <div className="space-y-6 animate-fade-in">
            
            {/* Risk Alert Counters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div 
                onClick={() => setAlertsFilter("Critical")}
                className={`p-5 rounded-xl border cursor-pointer transition-all duration-150 flex items-center justify-between ${
                  alertsFilter === "Critical" 
                    ? "bg-red-500 text-white border-red-600 shadow-md" 
                    : "bg-white text-slate-700 border-slate-200 hover:border-red-400"
                }`}
              >
                <div>
                  <span className={`text-[10px] uppercase font-extrabold tracking-wider ${alertsFilter === "Critical" ? "text-red-100" : "text-red-500"}`}>Critical Risk Level</span>
                  <span className="text-3xl font-black block mt-1">
                    {allAlerts.filter(a => a.riskLevel >= 8).length}
                  </span>
                  <p className={`text-[10px] leading-relaxed mt-1 ${alertsFilter === "Critical" ? "text-red-100" : "text-slate-400"}`}>
                    Scores 8-10. Immediate recall, SARFAESI action, fleet seizure.
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${alertsFilter === "Critical" ? "bg-white/20 text-white" : "bg-red-50 text-red-500"}`}>
                  <ShieldAlert className="h-7 w-7" />
                </div>
              </div>

              <div 
                onClick={() => setAlertsFilter("Watch")}
                className={`p-5 rounded-xl border cursor-pointer transition-all duration-150 flex items-center justify-between ${
                  alertsFilter === "Watch" 
                    ? "bg-amber-500 text-white border-amber-600 shadow-md" 
                    : "bg-white text-slate-700 border-slate-200 hover:border-amber-400"
                }`}
              >
                <div>
                  <span className={`text-[10px] uppercase font-extrabold tracking-wider ${alertsFilter === "Watch" ? "text-amber-100" : "text-amber-600"}`}>Watch Concern</span>
                  <span className="text-3xl font-black block mt-1">
                    {allAlerts.filter(a => a.riskLevel === 6 || a.riskLevel === 7).length}
                  </span>
                  <p className={`text-[10px] leading-relaxed mt-1 ${alertsFilter === "Watch" ? "text-amber-100" : "text-slate-400"}`}>
                    Scores 6-7. Senior credit officer review, escrow checks.
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${alertsFilter === "Watch" ? "bg-white/20 text-white" : "bg-amber-50 text-amber-600"}`}>
                  <Info className="h-7 w-7" />
                </div>
              </div>

              <div 
                onClick={() => setAlertsFilter("Review")}
                className={`p-5 rounded-xl border cursor-pointer transition-all duration-150 flex items-center justify-between ${
                  alertsFilter === "Review" 
                    ? "bg-indigo-600 text-white border-indigo-700 shadow-md" 
                    : "bg-white text-slate-700 border-slate-200 hover:border-indigo-400"
                }`}
              >
                <div>
                  <span className={`text-[10px] uppercase font-extrabold tracking-wider ${alertsFilter === "Review" ? "text-indigo-100" : "text-indigo-600"}`}>Review List</span>
                  <span className="text-3xl font-black block mt-1">
                    {allAlerts.filter(a => a.riskLevel === 4 || a.riskLevel === 5).length}
                  </span>
                  <p className={`text-[10px] leading-relaxed mt-1 ${alertsFilter === "Review" ? "text-indigo-100" : "text-slate-400"}`}>
                    Scores 4-5. Standard review conditions, quarterly check.
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${alertsFilter === "Review" ? "bg-white/20 text-white" : "bg-indigo-50 text-indigo-600"}`}>
                  <FileText className="h-7 w-7" />
                </div>
              </div>
            </div>

            {/* Filter controls */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setAlertsFilter("All")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    alertsFilter === "All" ? "bg-[#1B3A6B] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  All Alerts Log ({allAlerts.length})
                </button>
                <span className="text-slate-300">|</span>
                <span className="text-xs font-semibold text-slate-400">Current Filters:</span>
                <span className="text-xs bg-slate-100 border border-slate-200 text-slate-700 font-bold px-2 py-0.5 rounded capitalize">
                  Bucket: {alertsFilter}
                </span>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative w-full sm:w-64">
                  <input
                    type="text"
                    value={alertsSearch}
                    onChange={e => setAlertsSearch(e.target.value)}
                    placeholder="Search Account ID, Borrower or Segment..."
                    className="w-full text-xs pl-8 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#1B3A6B] outline-none"
                  />
                  <Search className="h-4 w-4 text-slate-400 absolute left-2.5 top-2.5" />
                </div>
              </div>
            </div>

            {/* Sortable, filterable alerts table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                      <th className="p-4 cursor-pointer hover:bg-slate-200 select-none" onClick={() => handleSortAlerts("id")}>
                        Account ID {alertsSortField === "id" && (alertsSortAsc ? "▲" : "▼")}
                      </th>
                      <th className="p-4 cursor-pointer hover:bg-slate-200 select-none" onClick={() => handleSortAlerts("borrowerName")}>
                        Borrower Name {alertsSortField === "borrowerName" && (alertsSortAsc ? "▲" : "▼")}
                      </th>
                      <th className="p-4 cursor-pointer hover:bg-slate-200 select-none" onClick={() => handleSortAlerts("segment")}>
                        Segment {alertsSortField === "segment" && (alertsSortAsc ? "▲" : "▼")}
                      </th>
                      <th className="p-4 cursor-pointer hover:bg-slate-200 select-none" onClick={() => handleSortAlerts("loanAmount")}>
                        Loan Amount {alertsSortField === "loanAmount" && (alertsSortAsc ? "▲" : "▼")}
                      </th>
                      <th className="p-4 cursor-pointer hover:bg-slate-200 select-none" onClick={() => handleSortAlerts("riskScore")}>
                        Raw Score {alertsSortField === "riskScore" && (alertsSortAsc ? "▲" : "▼")}
                      </th>
                      <th className="p-4 cursor-pointer hover:bg-slate-200 select-none" onClick={() => handleSortAlerts("riskLevel")}>
                        Risk Level {alertsSortField === "riskLevel" && (alertsSortAsc ? "▲" : "▼")}
                      </th>
                      <th className="p-4">Trigger reasons</th>
                      <th className="p-4">Recommended credit actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {sortedAlerts.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-slate-400 italic font-medium">
                          No active risk alerts match this search criteria.
                        </td>
                      </tr>
                    ) : (
                      sortedAlerts.map((item, idx) => {
                        const levelObj = riskRatingScale[item.riskLevel - 1] || riskRatingScale[4];
                        return (
                          <tr 
                            key={idx} 
                            className={`hover:bg-slate-50 transition-colors ${
                              item.riskLevel >= 8 ? "bg-red-50/50" : 
                              item.riskLevel >= 6 ? "bg-amber-50/30" : ""
                            }`}
                          >
                            <td className="p-4 font-mono font-bold text-slate-900">{item.id}</td>
                            <td className="p-4 font-semibold text-slate-900">{item.borrowerName}</td>
                            <td className="p-4 font-bold text-slate-600">{item.segment}</td>
                            <td className="p-4">₹{item.loanAmount} Lakhs</td>
                            <td className="p-4 font-bold">{item.riskScore} / 65</td>
                            <td className="p-4">
                              <span 
                                className="px-2.5 py-1 rounded text-[10px] font-extrabold text-white uppercase tracking-wider"
                                style={{ backgroundColor: levelObj.color }}
                              >
                                {item.riskLabel} (Lvl {item.riskLevel})
                              </span>
                            </td>
                            <td className="p-4 text-slate-500 max-w-xs text-[11px] leading-relaxed">
                              {item.triggerReason}
                            </td>
                            <td className="p-4 text-slate-600 font-bold max-w-xs text-[11px] leading-relaxed">
                              {item.recommendedAction}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* =======================================================
            TAB 4: DIMENSIONS SCORECARD
            ======================================================= */}
        {activeTab === "scorecard" && (
          <div className="space-y-6 animate-fade-in">
            
            {/* Explanatory banner */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-slate-800">Dynamic Credit Matrix Dimensions Scorecard</h3>
                <p className="text-xs text-slate-500">Live breakdown of the current borrower parameters compared against NBFC policy benchmarks</p>
              </div>
              <div className="text-xs font-bold text-[#1B3A6B] bg-[#1B3A6B]/5 px-4 py-2 rounded-lg text-center">
                Total Score Weight: 100% | Contribution: Equal (7.7% per parameter)
              </div>
            </div>

            {/* Scorecard Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                      <th className="p-4">Category</th>
                      <th className="p-4">Parameter</th>
                      <th className="p-4">Green Policy (1)</th>
                      <th className="p-4">Amber Policy (3)</th>
                      <th className="p-4">Red Policy (5)</th>
                      <th className="p-4 text-center">Current Value</th>
                      <th className="p-4 text-center">Score</th>
                      <th className="p-4">Credit Score Bar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {parameters.map((p, idx) => {
                      return (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="p-4 font-bold text-slate-400 uppercase tracking-wider text-[10px]">
                            {p.category}
                          </td>
                          <td className="p-4">
                            <span className="font-bold text-slate-900 block">{p.name}</span>
                            <span className="text-[10px] text-slate-400 block mt-0.5 max-w-xs">{p.explanation}</span>
                          </td>
                          <td className="p-4 text-emerald-600 bg-emerald-50/20 text-[10px]">{p.greenRule}</td>
                          <td className="p-4 text-amber-600 bg-amber-50/20 text-[10px]">{p.amberRule}</td>
                          <td className="p-4 text-red-600 bg-red-50/20 text-[10px]">{p.redRule}</td>
                          <td className="p-4 text-center font-bold text-slate-800 text-sm">
                            {p.currentValue} {p.unit !== "Category" && p.unit !== "Years" ? p.unit : ""}
                          </td>
                          <td className="p-4 text-center">
                            <span className={`px-2 py-0.5 rounded text-[11px] font-black uppercase text-white ${
                              p.color === "green" ? "bg-emerald-600" :
                              p.color === "amber" ? "bg-amber-500" : "bg-red-600"
                            }`}>
                              {p.score}
                            </span>
                          </td>
                          <td className="p-4 w-40">
                            {/* Score visual blocks */}
                            <div className="flex gap-1 items-center h-4">
                              <span className={`h-full w-4 rounded transition-colors ${p.score >= 1 ? (p.color === "green" ? "bg-emerald-500" : p.color === "amber" ? "bg-amber-400" : "bg-red-500") : "bg-slate-200"}`}></span>
                              <span className={`h-full w-4 rounded transition-colors ${p.score >= 3 ? (p.color === "amber" ? "bg-amber-400" : "bg-red-500") : "bg-slate-200"}`}></span>
                              <span className={`h-full w-4 rounded transition-colors ${p.score === 5 ? "bg-red-500" : "bg-slate-200"}`}></span>
                              <span className="text-[10px] text-slate-400 font-bold pl-1 uppercase">{p.color}</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* =======================================================
            TAB 5: GLOSSARY
            ======================================================= */}
        {activeTab === "glossary" && (
          <div className="space-y-6 animate-fade-in">
            
            {/* Header / Search bar */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-slate-800">Financial Glossary & Terminology Bank</h3>
                <p className="text-xs text-slate-400">Search 55 credit parameters, regulatory compliance tags, and AI indicators explained in plain English.</p>
              </div>
              
              <div className="relative w-full md:w-80">
                <input
                  type="text"
                  value={glossarySearch}
                  onChange={e => setGlossarySearch(e.target.value)}
                  placeholder="Search glossary terms..."
                  className="w-full text-xs pl-8 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#1B3A6B] outline-none"
                />
                <Search className="h-4 w-4 text-slate-400 absolute left-2.5 top-2.5" />
              </div>
            </div>

            {/* Category Filter buttons */}
            <div className="flex flex-wrap gap-2 items-center">
              {["All", "Scoring Parameters", "Financial Ratios & Concepts", "Risk & Credit Terms", "Document Terms", "AI & Analytics"].map((cat, idx) => (
                <button
                  key={idx}
                  onClick={() => setGlossaryCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 ${
                    glossaryCategory === cat
                      ? "bg-[#1B3A6B] text-white shadow-sm"
                      : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Card grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {glossaryData
                .filter(item => {
                  const matchesSearch = item.term.toLowerCase().includes(glossarySearch.toLowerCase()) ||
                                        item.definition.toLowerCase().includes(glossarySearch.toLowerCase());
                  const matchesCategory = glossaryCategory === "All" || item.category === glossaryCategory;
                  return matchesSearch && matchesCategory;
                })
                .map((item, idx) => (
                  <div key={idx} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-[#2E75B6] transition-colors flex flex-col justify-between">
                    <div className="space-y-2">
                      <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full inline-block">
                        {item.category}
                      </span>
                      <h4 className="font-bold text-slate-800 text-sm">{item.term}</h4>
                      <p className="text-xs text-slate-500 leading-relaxed font-medium">
                        {item.definition}
                      </p>
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
        )}

        {/* =======================================================
            TAB 6: AI UNDERWRITING COPILOT
            ======================================================= */}
        {activeTab === "ai-copilot" && (
          <div className="space-y-6 animate-fade-in">
            {/* Header banner */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-sky-500" />
                  <h3 className="font-bold text-slate-800">Sovereign Underwriting Intelligence & Copilot Hub</h3>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Active Borrower: <strong className="text-slate-700">M/S {borrowerProfile.borrowerName}</strong> ({borrowerProfile.borrowerType}) | Loan Request: <strong className="text-slate-700">₹{borrowerProfile.loanAmount} Lakhs</strong>
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 bg-emerald-500 rounded-full animate-ping"></span>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md uppercase">
                  Connected to Gemini Live Model Suite
                </span>
              </div>
            </div>

            {/* Check if API key is loaded */}
            {!geminiKey && (
              <div className="bg-amber-50 border border-amber-200 p-5 rounded-xl flex items-start gap-3">
                <Info className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <h4 className="font-bold text-amber-900 text-sm">Gemini API Key Required</h4>
                  <p className="text-xs text-amber-700 leading-relaxed max-w-2xl">
                    To use the interactive multi-turn Chatbot, Document Scanner, and Low-Latency advisor, please click the settings gear in the top right corner to configure your Gemini API Key. If you do not have one, you can retrieve it from Google AI Studio.
                  </p>
                  <button
                    onClick={() => setShowSettings(true)}
                    className="px-4 py-2 bg-amber-600 text-white font-bold text-xs rounded-lg hover:bg-amber-700 transition-colors shadow-sm animate-pulse"
                  >
                    Open Settings Modal
                  </button>
                </div>
              </div>
            )}

            {/* Main grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              
              {/* Column 1: Risk Assessment Optimizer & Fast Advisor */}
              <div className="space-y-6">
                
                {/* Section A: Scorecard Intelligence Optimizer */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-4 bg-[#1B3A6B] text-white flex items-center justify-between">
                    <h4 className="font-bold text-xs uppercase tracking-wider flex items-center gap-2">
                      <Brain className="h-4 w-4 text-sky-300" />
                      <span>Risk Optimizer (3.5 Flash)</span>
                    </h4>
                    <span className="text-[9px] bg-sky-500/20 px-2 py-0.5 rounded font-mono font-bold">PROACTIVE</span>
                  </div>
                  <div className="p-4 space-y-4">
                    <p className="text-xs text-slate-500 leading-relaxed font-medium">
                      Analyze the active borrower's 13 parameters scorecard to generate proactive risk mitigation covenants, policy waivers, and an optimized route to lower risk exposure.
                    </p>
                    <button
                      onClick={handleRunAiAnalysis}
                      disabled={isAiAnalysisLoading || !geminiKey}
                      className="w-full py-2 bg-[#1B3A6B] text-white font-bold text-xs rounded-lg hover:bg-[#2E75B6] transition-colors disabled:bg-slate-200 disabled:text-slate-400 flex items-center justify-center gap-2"
                    >
                      {isAiAnalysisLoading ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          <span>Generating Advisory...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-3.5 w-3.5" />
                          <span>Run Scorecard Optimization</span>
                        </>
                      )}
                    </button>

                    {aiAnalysisError && (
                      <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg font-medium">
                        {aiAnalysisError}
                      </div>
                    )}

                    {aiAnalysisResult && (
                      <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 max-h-[300px] overflow-y-auto text-xs space-y-2 leading-relaxed text-slate-700 font-medium whitespace-pre-line prose">
                        {aiAnalysisResult}
                      </div>
                    )}
                  </div>
                </div>

                {/* Section B: Low-Latency Fast Advisor */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
                    <h4 className="font-bold text-xs uppercase tracking-wider flex items-center gap-2">
                      <Zap className="h-4 w-4 text-amber-400" />
                      <span>Fast Policy Advisor (3.1 Lite)</span>
                    </h4>
                    <span className="text-[9px] bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded font-mono font-bold">~150ms</span>
                  </div>
                  <div className="p-4 space-y-3 text-xs">
                    <p className="text-slate-500 leading-relaxed font-medium">
                      Select any scorecard parameter to get an instantaneous low-latency underwriting risk rationale or legal benchmark.
                    </p>

                    <div className="space-y-1">
                      <label className="block font-bold text-slate-600">Select Parameter</label>
                      <select
                        className="w-full p-2 border border-slate-300 rounded-lg text-xs outline-none focus:ring-1 focus:ring-slate-800"
                        value={fastAdvisorParamId || ""}
                        onChange={e => {
                          const val = e.target.value ? parseInt(e.target.value) : null;
                          setFastAdvisorParamId(val);
                          if (val !== null) {
                            const param = parameters.find(p => p.id === val);
                            if (param) {
                              handleGetFastAdvice(param.name, param.currentValue);
                            }
                          }
                        }}
                      >
                        <option value="">-- Choose a parameter --</option>
                        {parameters.map((p, idx) => (
                          <option key={idx} value={p.id}>{p.name} (Value: {p.currentValue})</option>
                        ))}
                      </select>
                    </div>

                    <div className="relative flex py-1 items-center">
                      <div className="flex-grow border-t border-slate-200"></div>
                      <span className="flex-shrink mx-2 text-[9px] text-slate-400 uppercase font-bold">OR</span>
                      <div className="flex-grow border-t border-slate-200"></div>
                    </div>

                    <div className="space-y-1">
                      <label className="block font-bold text-slate-600">Ask Custom Quick Question</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={fastAdvisorCustomPrompt}
                          onChange={e => setFastAdvisorCustomPrompt(e.target.value)}
                          placeholder="e.g. What is GSTR-3B audit policy?"
                          className="flex-1 p-2 border border-slate-300 rounded-lg text-xs outline-none focus:ring-1 focus:ring-slate-800"
                        />
                        <button
                          onClick={() => handleGetFastAdvice()}
                          disabled={isFastAdvisorLoading || !fastAdvisorCustomPrompt.trim() || !geminiKey}
                          className="px-3 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors font-bold flex items-center justify-center disabled:bg-slate-200 disabled:text-slate-400"
                        >
                          {isFastAdvisorLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Zap className="h-3 w-3" />}
                        </button>
                      </div>
                    </div>

                    {fastAdvisorError && (
                      <div className="p-3 bg-red-50 text-red-700 text-[11px] rounded-lg font-medium">
                        {fastAdvisorError}
                      </div>
                    )}

                    {fastAdvisorResult && (
                      <div className="p-3 bg-amber-50/50 border border-amber-200/50 rounded-lg max-h-[220px] overflow-y-auto font-mono text-[11px] leading-relaxed text-amber-900 whitespace-pre-line">
                        {fastAdvisorResult}
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* Column 2: Conversational Expert Chatbot */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden h-[630px] flex flex-col justify-between">
                <div className="p-4 bg-[#1B3A6B] text-white flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-sky-400" />
                    <div>
                      <h4 className="font-bold text-xs uppercase tracking-wider">Multi-Turn Advisor (3.5 Flash)</h4>
                      <p className="text-[10px] text-sky-200">Professional Sovereign Underwriter Coach</p>
                    </div>
                  </div>
                  <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono font-bold">STATEFUL</span>
                </div>

                {/* Conversation Body */}
                <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50 text-xs">
                  {chatMessages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex flex-col max-w-[85%] ${msg.role === "user" ? "ml-auto items-end" : "mr-auto items-start"}`}
                    >
                      <div className={`p-3 rounded-xl leading-relaxed ${
                        msg.role === "user" 
                          ? "bg-[#1B3A6B] text-white rounded-br-none" 
                          : "bg-white text-slate-800 border border-slate-200 rounded-bl-none shadow-xs"
                      }`}>
                        <p className="font-medium whitespace-pre-line">{msg.text}</p>
                      </div>
                      <span className="text-[9px] text-slate-400 font-bold mt-1 px-1">{msg.timestamp}</span>
                    </div>
                  ))}

                  {isChatLoading && (
                    <div className="flex items-center gap-2 text-slate-500 font-medium pl-1">
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-[#1B3A6B]" />
                      <span>Copilot is formulating response...</span>
                    </div>
                  )}

                  {chatError && (
                    <div className="p-3 bg-red-50 text-red-700 rounded-lg font-medium">
                      {chatError}
                    </div>
                  )}
                </div>

                {/* Conversation Input */}
                <form onSubmit={handleSendChatMessage} className="p-3 border-t border-slate-200 bg-white shrink-0 flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    disabled={isChatLoading || !geminiKey}
                    placeholder="Ask about active borrower cash cover, LTV, SHAP drivers..."
                    className="flex-1 p-2 border border-slate-300 rounded-lg text-xs outline-none focus:ring-1 focus:ring-[#1B3A6B] disabled:bg-slate-50"
                  />
                  <button
                    type="submit"
                    disabled={isChatLoading || !chatInput.trim() || !geminiKey}
                    className="px-4 bg-[#1B3A6B] text-white rounded-lg hover:bg-[#2E75B6] transition-colors font-bold text-xs disabled:bg-slate-200 disabled:text-slate-400"
                  >
                    Send
                  </button>
                </form>
              </div>

              {/* Column 3: Image & Document Scanner */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between min-h-[630px]">
                <div>
                  <div className="p-4 bg-slate-800 text-white flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2">
                      <Camera className="h-5 w-5 text-sky-400" />
                      <div>
                        <h4 className="font-bold text-xs uppercase tracking-wider">Document Intelligence (3.1 Pro)</h4>
                        <p className="text-[10px] text-sky-200">High-Fidelity Document Scanning</p>
                      </div>
                    </div>
                    <span className="text-[9px] bg-red-500/20 text-red-300 px-2 py-0.5 rounded font-mono font-bold">PREMIUM</span>
                  </div>

                  <div className="p-4 space-y-4 text-xs">
                    <p className="text-slate-500 leading-relaxed font-medium">
                      Drag and drop or upload a financial snapshot, vehicle photo, bank balance confirmation, or loan contract. Gemini 3.1 Pro Preview will parse, audit, and flag compliance alerts instantly.
                    </p>

                    {/* Drag & Drop Box */}
                    <div className="border-2 border-dashed border-slate-300 rounded-xl p-5 text-center hover:border-[#1B3A6B] transition-colors relative bg-slate-50 flex flex-col items-center justify-center min-h-[140px]">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      {scannedImageBase64 ? (
                        <div className="space-y-2">
                          <img
                            src={`data:${scannedImageMimeType};base64,${scannedImageBase64}`}
                            alt="Preview"
                            className="max-h-24 mx-auto rounded-lg shadow border border-slate-200"
                          />
                          <p className="text-[10px] text-slate-400 font-bold">Click or drag another image to replace</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <UploadCloud className="h-8 w-8 text-slate-400 mx-auto" />
                          <div>
                            <p className="font-bold text-slate-700">Upload document image</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">JPEG, PNG up to 10MB</p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="block font-bold text-slate-600">Scan Instruction / Prompt</label>
                      <input
                        type="text"
                        value={scannerPrompt}
                        onChange={e => setScannerPrompt(e.target.value)}
                        placeholder="e.g. Verify the debt ratio or flag balance mismatch"
                        className="w-full p-2 border border-slate-300 rounded-lg text-xs outline-none focus:ring-1 focus:ring-slate-800"
                      />
                    </div>

                    <button
                      onClick={handleScanImage}
                      disabled={isScannerLoading || !scannedImageBase64 || !geminiKey}
                      className="w-full py-2 bg-slate-800 text-white font-bold text-xs rounded-lg hover:bg-slate-700 transition-colors disabled:bg-slate-200 disabled:text-slate-400 flex items-center justify-center gap-2"
                    >
                      {isScannerLoading ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          <span>Scanning Premium Doc...</span>
                        </>
                      ) : (
                        <>
                          <Camera className="h-3.5 w-3.5" />
                          <span>Analyze Uploaded File</span>
                        </>
                      )}
                    </button>

                    {scannerError && (
                      <div className="p-3 bg-red-50 text-red-700 rounded-lg font-medium">
                        {scannerError}
                      </div>
                    )}
                  </div>
                </div>

                {/* Scan Results Panel */}
                <div className="p-4 bg-slate-50 border-t border-slate-200 text-xs min-h-[180px] max-h-[250px] overflow-y-auto">
                  <h5 className="font-bold text-slate-700 mb-2 uppercase tracking-wider text-[10px]">Extraction Report</h5>
                  {scannerResult ? (
                    <p className="font-medium text-slate-700 whitespace-pre-line leading-relaxed">{scannerResult}</p>
                  ) : (
                    <div className="h-full flex items-center justify-center text-slate-400 font-bold italic py-8">
                      No document analyzed yet.
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

      </main>

      {/* Disclaimers Footer */}
      <footer className="bg-[#1B3A6B] text-slate-300 border-t border-[#2E75B6]/20 mt-12 py-8 text-center text-xs">
        <div className="max-w-7xl mx-auto px-4 space-y-3">
          <p className="font-semibold text-slate-200">
            AI-Powered Credit Risk Assessment Dashboard (Indian NBFC Commercial Lending framework)
          </p>
          <p className="max-w-2xl mx-auto text-[11px] text-slate-400">
            <strong>DISCLAIMER:</strong> This dashboard is an academic portfolio project developed for demonstration and educational purposes. Credit rating logic, parameters, and AI-generated underwriting memos represent predictive tools and do not constitute actual credit authorization or official financial advice.
          </p>
          <div className="pt-2 border-t border-slate-700 max-w-md mx-auto flex items-center justify-center gap-4 text-[10px] text-slate-400">
            <span>Framework: RBI NBFC Matrix Compliance</span>
            <span>|</span>
            <span>Analytics Engine: Shapley Explainers</span>
          </div>
        </div>
      </footer>

      {/* =======================================================
          MODAL: SETTINGS & GEMINI API KEY
          ======================================================= */}
      {showSettings && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden">
            <div className="p-4 bg-[#1B3A6B] text-white flex items-center justify-between">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <Settings className="h-4 w-4 animate-spin-hover" />
                <span>Configure API Credentials</span>
              </h3>
              <button 
                onClick={() => setShowSettings(false)}
                className="p-1 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg text-[11px] text-amber-800 leading-relaxed font-medium">
                <strong>Important:</strong> Your API key is stored locally in your active <strong>sessionStorage</strong> and never sent anywhere other than Google's secure generative language server. It will clear automatically when you close this browser tab.
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-slate-600">Gemini 2.0 API Key</label>
                <input
                  type="password"
                  className="w-full text-xs p-2 border border-slate-300 rounded-lg outline-none focus:ring-1 focus:ring-[#1B3A6B] font-mono text-slate-800"
                  value={geminiKey}
                  onChange={e => setGeminiKey(e.target.value)}
                  placeholder="AI_STUDIO_KEY_..."
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={handleClearApiKey}
                  className="px-3 py-1.5 bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Clear Key
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveApiKey(geminiKey)}
                  className="px-4 py-1.5 bg-[#1B3A6B] text-white font-bold hover:bg-[#2E75B6] rounded-lg transition-colors shadow"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =======================================================
          MODAL: INLINE PDF APPRAISAL PREVIEW
          ======================================================= */}
      {showPdfPreview && pdfPreviewBlobUrl && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full h-[88vh] border border-slate-200 overflow-hidden flex flex-col animate-fade-in">
            {/* Header */}
            <div className="p-4 bg-[#1B3A6B] text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-sky-400" />
                <div>
                  <h3 className="font-bold text-sm">Credit Appraisal Appraisal Memo Preview</h3>
                  <p className="text-[10px] text-sky-200">
                    Sovereign Finance Group | Document Generation System (A4 Standard)
                  </p>
                </div>
              </div>
              <button 
                onClick={handleClosePdfPreview}
                className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
                title="Close Preview"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Split Content Area */}
            <div className="flex-1 overflow-hidden flex flex-col md:flex-row bg-slate-100">
              
              {/* Left Side: Real PDF Interactive IFrame */}
              <div className="flex-1 p-4 h-full flex flex-col">
                <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-1.5 flex-1 flex flex-col">
                  <iframe
                    src={pdfPreviewBlobUrl}
                    className="w-full h-full rounded border border-slate-100 bg-slate-50"
                    title="PDF Appraisal Memo Document Preview"
                  />
                </div>
              </div>

              {/* Right Side: Compliance & Action Sidebar */}
              <div className="w-full md:w-80 bg-white border-l border-slate-200 p-4 overflow-y-auto flex flex-col justify-between shrink-0">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider mb-2">
                      Document Quality & Compliance
                    </h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Please review the compiled PDF document structure, alignments, and parameters before final authorization.
                    </p>
                  </div>

                  {/* Audit Details */}
                  <div className="space-y-2.5">
                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/60 text-xs">
                      <span className="block font-bold text-slate-400 text-[9px] uppercase">Applicant Name</span>
                      <strong className="text-slate-800 font-semibold">{borrowerProfile.borrowerName}</strong>
                    </div>

                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/60 text-xs">
                      <span className="block font-bold text-slate-400 text-[9px] uppercase">Loan Requirement</span>
                      <strong className="text-slate-800 font-semibold">₹{borrowerProfile.loanAmount} Lakhs</strong>
                    </div>

                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/60 text-xs">
                      <span className="block font-bold text-slate-400 text-[9px] uppercase">Risk Category & Decision</span>
                      <div className="flex items-center gap-2 mt-1">
                        {(() => {
                          const decision = rawScore >= 50 ? "DECLINE" : rawScore >= 36 ? "CONDITIONAL APPROVE" : "APPROVE";
                          const colorClasses = 
                            decision === "DECLINE" ? "bg-red-50 text-red-700 border-red-200" :
                            decision === "APPROVE" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                            "bg-amber-50 text-amber-700 border-amber-200";
                          return (
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${colorClasses}`}>
                              {decision}
                            </span>
                          );
                        })()}
                        <span className="text-[10px] font-mono font-bold text-slate-500">
                          (Score: {rawScore})
                        </span>
                      </div>
                    </div>

                    <div className="p-2.5 bg-sky-50 border border-sky-100 rounded-lg text-[11px] text-sky-800 space-y-1.5 leading-relaxed">
                      <div className="flex items-center gap-1.5 font-bold">
                        <CheckCircle2 className="h-3.5 w-3.5 text-sky-600" />
                        <span>Pre-flight Checks Passed</span>
                      </div>
                      <ul className="list-disc pl-4 space-y-1 text-[10px] text-sky-700 font-medium">
                        <li>Sovereign header logo applied</li>
                        <li>Dynamic metadata variables synchronized</li>
                        <li>Legal disclaimer footer registered</li>
                        <li>Tables and wrap-widths normalized</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Actions Block */}
                <div className="space-y-2 pt-4 border-t border-slate-100">
                  <button
                    onClick={handleExportPDF}
                    className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg transition-colors text-xs flex items-center justify-center gap-2 shadow animate-pulse"
                    title="Download high-resolution PDF document"
                  >
                    <Download className="h-4 w-4" />
                    <span>Download Official PDF</span>
                  </button>

                  <button
                    onClick={() => {
                      handlePrintMemo();
                    }}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors text-xs flex items-center justify-center gap-2"
                    title="Send compiled document to local printer"
                  >
                    <Printer className="h-4 w-4" />
                    <span>Print Appraisal Note</span>
                  </button>

                  <button
                    onClick={handleClosePdfPreview}
                    className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition-colors text-xs"
                  >
                    Return to Dashboard
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
