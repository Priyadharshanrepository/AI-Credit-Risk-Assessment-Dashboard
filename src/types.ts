export interface BorrowerProfile {
  borrowerName: string;
  borrowerType: "SME" | "Proprietorship" | "Partnership" | "Corporate";
  loanAmount: number; // in Lakhs
  loanPurpose: string;
}

export interface RiskParameter {
  id: number;
  name: string;
  category: "Financial Health" | "Business Operations" | "Repayment Behavior" | "Asset Quality";
  explanation: string;
  weight: number; // Weight in % (we can distribute them so they sum to 100% or contribute equally)
  greenRule: string;
  amberRule: string;
  redRule: string;
  currentValue: string | number;
  score: 1 | 3 | 5;
  color: "green" | "amber" | "red";
  reason: string;
  unit: string;
}

export interface RiskLevel {
  level: number;
  label: string;
  color: string;
  description: string;
  action: string;
}

export interface ChecklistItem {
  id: string;
  category: "Initial Documents" | "Supporting Documents" | "Additional Requirements";
  name: string;
  checked: boolean;
}

export interface GlossaryItem {
  id: string;
  term: string;
  category: "Scoring Parameters" | "Financial Ratios & Concepts" | "Risk & Credit Terms" | "Document Terms" | "AI & Analytics";
  definition: string;
}

export interface AlertItem {
  id: string;
  borrowerName: string;
  borrowerType: string;
  loanAmount: number;
  riskScore: number;
  riskLevel: number;
  riskLabel: string;
  triggerReason: string;
  recommendedAction: string;
  segment: string;
  date: string;
}

export interface PortfolioKPIs {
  totalValue: number; // in Crores
  activeAccounts: number;
  averageRiskScore: number;
  collectionRate: number; // in %
}

export interface AppraisalHistoryEntry {
  id: string;
  timestamp: string;
  borrowerName: string;
  parameterName: string;
  prevValue: string | number;
  newValue: string | number;
  scoreImpact: number;
  newTotalScore: number;
  riskLevel: string;
  riskColor: string;
  prevScore?: number;
  parameterId?: number;
  prevRawValue?: any;
}

