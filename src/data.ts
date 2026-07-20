import { GlossaryItem, RiskLevel, RiskParameter, AlertItem, PortfolioKPIs } from "./types";

// 1. Terminology Glossary (55 terms mapped to categories)
export const glossaryData: GlossaryItem[] = [
  // Scoring Parameters
  {
    id: "g1",
    term: "Deployment Segment",
    category: "Scoring Parameters",
    definition: "The economic sector where the borrower operates their equipment or vehicles. Stable sectors like government infrastructure contracts carry low risk, whereas speculative or seasonal sectors have higher default potential."
  },
  {
    id: "g2",
    term: "Association with Lender",
    category: "Scoring Parameters",
    definition: "The duration of the active relationship between the borrower and the financial institution. Longer relationships (over 7 years) indicate stability and high loyalty, reducing credit risk."
  },
  {
    id: "g3",
    term: "Current to Cumulative Exposure",
    category: "Scoring Parameters",
    definition: "The percentage of new loan exposure relative to the historical peak credit exposure of the borrower. Keeping this below 50% ensures the borrower is not taking on massive unmanageable chunks of new debt."
  },
  {
    id: "g4",
    term: "Revenue Growth",
    category: "Scoring Parameters",
    definition: "The year-over-year rate of revenue increase. While positive growth indicates success, extreme growth (over 35%) can signal unstable over-expansion, and negative growth indicates distress."
  },
  {
    id: "g5",
    term: "EBITDA Margin",
    category: "Scoring Parameters",
    definition: "Operating profitability calculated by dividing Operating Profit (EBITDA) by Total Revenue. It measures a firm's pricing power and core operational efficiency before accounting for financial structures."
  },
  {
    id: "g6",
    term: "Debt Equity Ratio",
    category: "Scoring Parameters",
    definition: "A leverage ratio comparing total liabilities to total shareholders' equity. High values (above 4x) indicate heavy reliance on debt, which increases solvency risks during market downturns."
  },
  {
    id: "g7",
    term: "Cash Cover",
    category: "Scoring Parameters",
    definition: "A liquidity ratio measuring the borrower's cash flows relative to debt service requirements. A cash cover greater than 1.0x indicates the borrower generates enough cash to pay interest and principal."
  },
  {
    id: "g8",
    term: "Principal Concentration",
    category: "Scoring Parameters",
    definition: "The percentage of business revenue derived from the borrower's top client. High concentration (over 80%) exposes the borrower to immense credit risk if that top client default or cancels contracts."
  },
  {
    id: "g9",
    term: "Working Capital Cycle",
    category: "Scoring Parameters",
    definition: "The average number of days it takes for a business to convert inventory and receivables into cash. Cycles longer than 90 days trap cash and create severe operational liquidity stress."
  },
  {
    id: "g10",
    term: "Percentage of Remittance",
    category: "Scoring Parameters",
    definition: "The ratio of cash deposits or repayments made directly into escrow accounts to the total monthly loan installments. Higher remittance (over 25%) shows strong repayment control."
  },
  {
    id: "g11",
    term: "Fleet Addition",
    category: "Scoring Parameters",
    definition: "The percentage increase in the borrower's operating assets (vehicles or machinery) in the last year. Gradual additions indicate healthy scaling, while massive additions can over-leverage operations."
  },
  {
    id: "g12",
    term: "Free Assets",
    category: "Scoring Parameters",
    definition: "The percentage of the borrower's assets (fleet, property) that are completely unencumbered by liens or existing loans. Free assets act as vital secondary collateral in emergency defaults."
  },
  {
    id: "g13",
    term: "Current Operation Level",
    category: "Scoring Parameters",
    definition: "The utilization capacity of the borrower's fleet or production facilities. Levels above 80% indicate peak market demand, whereas low capacity utilization signifies idled equipment and wasted overhead."
  },

  // Financial Ratios and Concepts
  {
    id: "g14",
    term: "DSCR (Debt Service Coverage Ratio)",
    category: "Financial Ratios & Concepts",
    definition: "The cash flow available to pay current debt obligations, computed as Net Operating Income divided by Debt Service. It tells credit officers whether the business creates enough cash buffer to make repayments."
  },
  {
    id: "g15",
    term: "LTV (Loan to Value)",
    category: "Financial Ratios & Concepts",
    definition: "A ratio comparing the amount of the loan to the appraised market value of the purchased asset. Low LTV (below 70%) provides high safety margins for lenders if they must repossess and liquidate the asset."
  },
  {
    id: "g16",
    term: "FOIR (Fixed Obligation to Income Ratio)",
    category: "Financial Ratios & Concepts",
    definition: "The percentage of a borrower's monthly gross income spent on fixed debt obligations. Lenders use it to verify the borrower is not severely overburdened with existing fixed repayments."
  },
  {
    id: "g17",
    term: "NPA (Non-Performing Asset)",
    category: "Financial Ratios & Concepts",
    definition: "A loan where interest or principal installments have remained overdue for more than 90 days. Once classified as an NPA, interest stop accruing, and recovery or litigation procedures begin."
  },
  {
    id: "g18",
    term: "SMA (Special Mention Account)",
    category: "Financial Ratios & Concepts",
    definition: "A classification for accounts showing early signs of distress before becoming NPAs. SMA-0 tracks 1-30 days overdue, SMA-1 tracks 31-60 days, and SMA-2 tracks 61-90 days."
  },
  {
    id: "g19",
    term: "EBITDA",
    category: "Financial Ratios & Concepts",
    definition: "Earnings Before Interest, Taxes, Depreciation, and Amortization. It is a key proxy for business operating cash flow, ignoring capital structure differences and non-cash expenses."
  },
  {
    id: "g20",
    term: "Working Capital",
    category: "Financial Ratios & Concepts",
    definition: "The difference between current assets and current liabilities. It represents the liquidity available to run daily business operations, pay wages, and purchase inventory."
  },
  {
    id: "g21",
    term: "Collateral",
    category: "Financial Ratios & Concepts",
    definition: "An asset pledged by the borrower to secure a loan. If the borrower defaults, the lender has the legal right to seize and sell the collateral to recover their funds."
  },
  {
    id: "g22",
    term: "Guarantor",
    category: "Financial Ratios & Concepts",
    definition: "A separate individual or business entity that signs the loan agreement and legally promises to repay the loan if the primary borrower defaults."
  },
  {
    id: "g23",
    term: "Disbursement",
    category: "Financial Ratios & Concepts",
    definition: "The actual transfer of loan funds from the lender to the borrower, or directly to the equipment dealer on the borrower's behalf, after approval and signing."
  },
  {
    id: "g24",
    term: "Sanction Limit",
    category: "Financial Ratios & Concepts",
    definition: "The maximum credit amount officially approved by the credit committee for a specific borrower, within which funds can be drawn down."
  },

  // Risk and Credit Terms
  {
    id: "g25",
    term: "Credit Appraisal",
    category: "Risk & Credit Terms",
    definition: "The formal evaluation process of assessing a borrower's creditworthiness, analyzing their financial reports, bank transactions, asset quality, and market segment before approving a loan."
  },
  {
    id: "g26",
    term: "Underwriting",
    category: "Risk & Credit Terms",
    definition: "The systematic process of analyzing credit risk, enforcing policy boundaries, assigning risk ratings, and deciding whether to accept, modify, or reject a loan application."
  },
  {
    id: "g27",
    term: "Risk Rating",
    category: "Risk & Credit Terms",
    definition: "A structured numerical or letter-grade score that ranks the risk profile of a borrower. Our system uses a 10-tier scale, ranging from Level 1 (Exceptional) to Level 10 (Critical Risk)."
  },
  {
    id: "g28",
    term: "Early Warning Signal",
    category: "Risk & Credit Terms",
    definition: "An early indicator (like high cash churn, sudden fleet drops, or working capital stretching) that alerts credit officers of potential borrower default long before an actual payment is missed."
  },
  {
    id: "g29",
    term: "Portfolio",
    category: "Risk & Credit Terms",
    definition: "The collective pool of active loans, leases, and credit facilities held by a lender across all business units and borrower segments."
  },
  {
    id: "g30",
    term: "Exposure",
    category: "Risk & Credit Terms",
    definition: "The total dollar or rupee amount of credit risk that the lender stands to lose if a specific borrower defaults completely on their outstanding obligations."
  },
  {
    id: "g31",
    term: "Cumulative Exposure",
    category: "Risk & Credit Terms",
    definition: "The aggregate outstanding loan balances and active limits combined across all connected entities or group companies of a single promoter."
  },
  {
    id: "g32",
    term: "Remittance",
    category: "Risk & Credit Terms",
    definition: "The act of depositing funds toward a loan installment. Higher direct escrow-based remittances protect lenders from borrower cash diversion."
  },
  {
    id: "g33",
    term: "SARFAESI",
    category: "Risk & Credit Terms",
    definition: "Securitisation and Reconstruction of Financial Assets and Enforcement of Security Interest Act. An Indian law allowing NBFCs and banks to seize pledged residential or commercial properties directly without court intervention in case of defaults."
  },
  {
    id: "g34",
    term: "Restructuring",
    category: "Risk & Credit Terms",
    definition: "The process of altering loan terms (such as extending interest-free periods or lowering monthly payments) to assist a borrower experiencing temporary cash flow crises."
  },
  {
    id: "g35",
    term: "Write-off",
    category: "Risk & Credit Terms",
    definition: "A formal accounting action taken when a loan is deemed completely uncollectible. The asset is removed from the active loan portfolio and charged as an expense."
  },
  {
    id: "g36",
    term: "Recovery",
    category: "Risk & Credit Terms",
    definition: "The cash amount collected from a defaulted borrower or promoter through negotiations, collateral liquidations, legal actions, or settlement agreements."
  },

  // Document Terms
  {
    id: "g37",
    term: "Audited Financials",
    category: "Document Terms",
    definition: "Official business financial statements (Balance Sheet, P&L, Cash Flow) verified by a certified Chartered Accountant to confirm accuracy and compliance with accounting rules."
  },
  {
    id: "g38",
    term: "ITR (Income Tax Return)",
    category: "Document Terms",
    definition: "A government document submitted annually disclosing net income earned, taxable revenues, and taxes paid, confirming the tax-legitimacy and fiscal health of the borrower."
  },
  {
    id: "g39",
    term: "Balance Sheet",
    category: "Document Terms",
    definition: "A core financial statement summarizing a company's assets, liabilities, and equity at a specific point in time, revealing the company's financial leverage and capital solidity."
  },
  {
    id: "g40",
    term: "P&L Statement",
    category: "Document Terms",
    definition: "Profit and Loss Statement. A financial report detailing revenues, expenses, and net profit over a fiscal quarter or year, indicating whether the business operates efficiently."
  },
  {
    id: "g41",
    term: "Cash Flow Statement",
    category: "Document Terms",
    definition: "A financial report that tracks the physical cash inflows and outflows from operating, investing, and financing activities, proving whether a firm creates real liquid cash."
  },
  {
    id: "g42",
    term: "GSTR 3B",
    category: "Document Terms",
    definition: "A monthly self-declared GST tax return in India containing consolidated summaries of outward supplies, input tax credit claimed, and net tax liabilities paid."
  },
  {
    id: "g43",
    term: "Form 26AS",
    category: "Document Terms",
    definition: "An Indian government tax statement showing tax deducted at source (TDS), tax collected at source, and advance tax payments connected to the borrower's PAN."
  },
  {
    id: "g44",
    term: "Net Worth Statement",
    category: "Document Terms",
    definition: "A CA-certified breakdown of personal assets and liabilities of key guarantors or directors, demonstrating their capacity to support the loan if the business fails."
  },
  {
    id: "g45",
    term: "Fleet List",
    category: "Document Terms",
    definition: "A detailed list showing all commercial vehicles or construction assets owned, specifying vehicle age, registration, chassis numbers, and operational status."
  },
  {
    id: "g46",
    term: "Work Order",
    category: "Document Terms",
    definition: "An official contract issued by a principal hirer (such as government infra bodies or large mining companies) detailing the hiring duration, rates, and cash billing limits."
  },
  {
    id: "g47",
    term: "Bank Facility Details",
    category: "Document Terms",
    definition: "Comprehensive documents from other lending banks outlining outstanding cash credit limits, overdrafts, active loans, EMIs, and letters of credit."
  },

  // AI and Analytics
  {
    id: "g48",
    term: "AI Credit Scoring",
    category: "AI & Analytics",
    definition: "The application of machine learning and natural language processing to evaluate financial parameters, generate scoring risk ratings, and flag subtle distress patterns."
  },
  {
    id: "g49",
    term: "Explainable AI",
    category: "AI & Analytics",
    definition: "AI methods designed to explain predictions and scoring calculations clearly, showing human underwriters exactly why a decision or score was reached."
  },
  {
    id: "g50",
    term: "SHAP Value",
    category: "AI & Analytics",
    definition: "Shapley Additive exPlanations. A mathematical approach that explains an AI model's output by calculating how much each parameter pushed the final risk score up or down."
  },
  {
    id: "g51",
    term: "Risk Score",
    category: "AI & Analytics",
    definition: "The combined score representing the total credit risk of a borrower, compiled from multiple financial, operational, asset, and behavior parameters."
  },
  {
    id: "g52",
    term: "Automated Underwriting",
    category: "AI & Analytics",
    definition: "The computer-driven process of reviewing loan documents, computing policy compliance, and issuing loan decisions instantly based on programmed criteria."
  },
  {
    id: "g53",
    term: "Credit Memo",
    category: "AI & Analytics",
    definition: "A comprehensive credit report presenting detailed financial analyses, asset quality appraisals, risk mitigants, and formal approval or decline justifications."
  },
  {
    id: "g54",
    term: "Early Warning System",
    category: "AI & Analytics",
    definition: "An automated analytics monitor that reads bank transactions, remittances, and working capital cycles continuously to highlight deteriorating assets."
  },
  {
    id: "g55",
    term: "Portfolio Monitoring",
    category: "AI & Analytics",
    definition: "The ongoing tracking of credit quality, risk concentrations, collections, and overdue accounts across an entire active loan book."
  }
];

// 2. The 10-Tier Risk Rating Scale
export const riskRatingScale: RiskLevel[] = [
  {
    level: 1,
    label: "Exceptional",
    color: "#006400", // Deep Green
    description: "Near-zero risk. Ideal borrower. Perfect track record and robust cash buffers.",
    action: "Fast-track approval. Offer preferred pricing and minimal document conditions."
  },
  {
    level: 2,
    label: "Very Strong",
    color: "#228B22", // Green
    description: "Very low risk. High stability and excellent repayment capacities.",
    action: "Standard approval. Routine document validation and minimal covenants."
  },
  {
    level: 3,
    label: "Strong",
    color: "#32CD32", // Light Green
    description: "Low risk. Sound financial structure and strong operations.",
    action: "Approve with routine post-disbursement monitoring."
  },
  {
    level: 4,
    label: "Satisfactory",
    color: "#9ACD32", // Yellow-Green
    description: "Acceptable risk. Adequate metrics but vulnerable to industry shifts.",
    action: "Approve with standard policy conditions and quarterly review requirements."
  },
  {
    level: 5,
    label: "Moderate",
    color: "#FFA500", // Amber
    description: "Moderate risk. Standard indicators but cash cover or cycle is stretched.",
    action: "Approve with enhanced due diligence and minor collateral additions."
  },
  {
    level: 6,
    label: "Cautious",
    color: "#FF8C00", // Dark Amber
    description: "Elevated concern. High leverage, short association, or stressed segment.",
    action: "Conditional approval only. Escalate to senior credit review. Impose GSTR sweep."
  },
  {
    level: 7,
    label: "Elevated",
    color: "#FF6347", // Orange (Tomato)
    description: "High concern. Multiple amber/red categories. Unstable operational cycles.",
    action: "Refer to Credit Committee. Require co-applicant, higher LTV, and escrow controls."
  },
  {
    level: 8,
    label: "High Risk",
    color: "#DC143C", // Crimson Red
    description: "Significant risk. Thin margins, high client concentration, negative cycles.",
    action: "Decline OR demand strong additional collateral (2x loan value) and promoter guarantee."
  },
  {
    level: 9,
    label: "Very High Risk",
    color: "#B22222", // Firebrick Red
    description: "Severe credit distress. Approaching insolvency or default triggers.",
    action: "Decline immediately. Raise early warning alert, lock existing drawings, inspect fleet."
  },
  {
    level: 10,
    label: "Critical Risk",
    color: "#8B0000", // Dark Red
    description: "Maximum risk. Imminent insolvency. High historical delinquencies.",
    action: "Decline. Lock all credit channels. Initiate SARFAESI and asset repossession."
  }
];

// Helper to map Raw Score (13-65) to Risk Level
export function mapRawScoreToRiskLevel(rawScore: number): RiskLevel {
  if (rawScore <= 18) return riskRatingScale[0]; // Level 1
  if (rawScore <= 24) return riskRatingScale[1]; // Level 2
  if (rawScore <= 30) return riskRatingScale[2]; // Level 3
  if (rawScore <= 35) return riskRatingScale[3]; // Level 4
  if (rawScore <= 40) return riskRatingScale[4]; // Level 5
  if (rawScore <= 44) return riskRatingScale[5]; // Level 6
  if (rawScore <= 49) return riskRatingScale[6]; // Level 7
  if (rawScore <= 54) return riskRatingScale[7]; // Level 8
  if (rawScore <= 60) return riskRatingScale[8]; // Level 9
  return riskRatingScale[9]; // Level 10 (61 to 65)
}

// 3. Dynamic Scoring Engine for 13 Parameters
export function evaluateParameter(id: number, value: any): { score: 1 | 3 | 5; color: "green" | "amber" | "red"; reason: string } {
  switch (id) {
    case 1: { // Deployment Segment
      const v = String(value).toLowerCase();
      if (v.includes("stable") || v.includes("infrastructure") || v.includes("government")) {
        return { score: 1, color: "green", reason: "Stable sector with secured contracts." };
      } else if (v.includes("moderate") || v.includes("mining") || v.includes("retail")) {
        return { score: 3, color: "amber", reason: "Moderate risk sector with seasonal dependencies." };
      } else {
        return { score: 5, color: "red", reason: "Stressed or highly volatile economic sector." };
      }
    }
    case 2: { // Association with Lender (Years)
      const num = Number(value);
      if (num > 7) {
        return { score: 1, color: "green", reason: "Excellent long-standing association (> 7 yrs)." };
      } else if (num >= 3) {
        return { score: 3, color: "amber", reason: "Moderate association duration (3 to 7 yrs)." };
      } else {
        return { score: 5, color: "red", reason: "Limited operational history with lender (< 3 yrs)." };
      }
    }
    case 3: { // Current to Cumulative Exposure (%)
      const num = Number(value);
      if (num < 50) {
        return { score: 1, color: "green", reason: "Safe leverage increment (< 50% increase)." };
      } else if (num <= 80) {
        return { score: 3, color: "amber", reason: "Moderate exposure expansion (50% to 80%)." };
      } else {
        return { score: 5, color: "red", reason: "High-risk, excessive exposure spike (> 80%)." };
      }
    }
    case 4: { // Revenue Growth (%)
      const num = Number(value);
      if (num > 15 && num <= 35) {
        return { score: 1, color: "green", reason: "Healthy, stable revenue expansion (> 15% to 35%)." };
      } else if (num >= 5 && num <= 15) {
        return { score: 3, color: "amber", reason: "Moderate, slow revenue growth (5% to 15%)." };
      } else {
        return { score: 5, color: "red", reason: "Distressed revenue growth (< 5%) OR unsustainable spike (> 35%)." };
      }
    }
    case 5: { // EBITDA Margin (%)
      const num = Number(value);
      if (num > 15) {
        return { score: 1, color: "green", reason: "Robust operational profit margin (> 15%)." };
      } else if (num >= 8) {
        return { score: 3, color: "amber", reason: "Acceptable profit margin buffer (8% to 15%)." };
      } else {
        return { score: 5, color: "red", reason: "Poor operating efficiency, thin buffers (< 8%)." };
      }
    }
    case 6: { // Debt Equity Ratio (x)
      const num = Number(value);
      if (num < 2) {
        return { score: 1, color: "green", reason: "Safe, solid capital structure (< 2.0x)." };
      } else if (num <= 4) {
        return { score: 3, color: "amber", reason: "Moderate debt leverage (2.0x to 4.0x)." };
      } else {
        return { score: 5, color: "red", reason: "Highly leveraged capital structure (> 4.0x)." };
      }
    }
    case 7: { // Cash Cover (x)
      const num = Number(value);
      if (num > 1) {
        return { score: 1, color: "green", reason: "Sufficient cash flows to cover debts (> 1.0x)." };
      } else if (num >= 0.8) {
        return { score: 3, color: "amber", reason: "Tight cash flow coverage (0.8x to 1.0x)." };
      } else {
        return { score: 5, color: "red", reason: "Deficit cash flows relative to debt duties (< 0.8x)." };
      }
    }
    case 8: { // Principal Concentration (%)
      const num = Number(value);
      if (num < 50) {
        return { score: 1, color: "green", reason: "Well-diversified, secure client list (< 50%)." };
      } else if (num <= 80) {
        return { score: 3, color: "amber", reason: "Moderate revenue reliance (50% to 80%)." };
      } else {
        return { score: 5, color: "red", reason: "Extreme client dependency vulnerability (> 80%)." };
      }
    }
    case 9: { // Working Capital Cycle (Days)
      const num = Number(value);
      if (num > 0 && num < 60) {
        return { score: 1, color: "green", reason: "Rapid cash generation and conversion (< 60 days)." };
      } else if (num >= 60 && num <= 90) {
        return { score: 3, color: "amber", reason: "Moderate collection lag (60 to 90 days)." };
      } else {
        return { score: 5, color: "red", reason: "Stretched liquidity (> 90 days) or unhealthy negative cycle." };
      }
    }
    case 10: { // Percentage of Remittance (%)
      const num = Number(value);
      if (num > 25) {
        return { score: 1, color: "green", reason: "Strong cash control, heavy escrow remittances (> 25%)." };
      } else if (num >= 15) {
        return { score: 3, color: "amber", reason: "Moderate cash deposit remittance (15% to 25%)." };
      } else {
        return { score: 5, color: "red", reason: "Inadequate escrow repayment controls (< 15%)." };
      }
    }
    case 11: { // Fleet Addition (%)
      const num = Number(value);
      if (num < 25) {
        return { score: 1, color: "green", reason: "Conservative asset expansion (< 25%)." };
      } else if (num <= 35) {
        return { score: 3, color: "amber", reason: "Moderate asset addition speed (25% to 35%)." };
      } else {
        return { score: 5, color: "red", reason: "Aggressive, potentially risky expansion speed (> 35%)." };
      }
    }
    case 12: { // Free Assets (%)
      const num = Number(value);
      if (num > 15) {
        return { score: 1, color: "green", reason: "High secondary collateral capacity (> 15%)." };
      } else if (num >= 5) {
        return { score: 3, color: "amber", reason: "Adequate free asset backing (5% to 15%)." };
      } else {
        return { score: 5, color: "red", reason: "Extremely low secondary collateral safety (< 5%)." };
      }
    }
    case 13: { // Current Operation Level (%)
      const num = Number(value);
      if (num > 80) {
        return { score: 1, color: "green", reason: "High active capacity utilization (> 80%)." };
      } else if (num >= 60) {
        return { score: 3, color: "amber", reason: "Moderate operation utilization (60% to 80%)." };
      } else {
        return { score: 5, color: "red", reason: "Significant idled fleet overheads (< 60%)." };
      }
    }
    default:
      return { score: 3, color: "amber", reason: "Standard default metric." };
  }
}

// 4. Base Template of 13 Parameters
export const defaultParameters: RiskParameter[] = [
  {
    id: 1,
    name: "Deployment Segment",
    category: "Business Operations",
    explanation: "Tracks the cyclicality and stability of the sector where fleet is deployed.",
    weight: 7.7,
    greenRule: "Stable sector (e.g. Infrastructure, Government Projects)",
    amberRule: "Moderate risk sector (e.g. Mining, Aggregates, Retail Carriage)",
    redRule: "High risk / stressed sector (e.g. Real Estate, Textile, Overloading)",
    currentValue: "Stable Infrastructure",
    score: 1,
    color: "green",
    reason: "Stable sector with secured contracts.",
    unit: "Category"
  },
  {
    id: 2,
    name: "Association with Lender",
    category: "Business Operations",
    explanation: "Number of years the borrower has maintained active credit relations with us.",
    weight: 7.7,
    greenRule: "More than 7 years",
    amberRule: "3 to 7 years",
    redRule: "Less than 3 years",
    currentValue: 8,
    score: 1,
    color: "green",
    reason: "Excellent long-standing association (> 7 yrs).",
    unit: "Years"
  },
  {
    id: 3,
    name: "Current to Cumulative Exposure",
    category: "Financial Health",
    explanation: "Measures the scale of the new loan compared to borrower's historic peak limits.",
    weight: 7.7,
    greenRule: "Less than 50%",
    amberRule: "50% to 80%",
    redRule: "More than 80%",
    currentValue: 40,
    score: 1,
    color: "green",
    reason: "Safe leverage increment (< 50% increase).",
    unit: "%"
  },
  {
    id: 4,
    name: "Revenue Growth",
    category: "Financial Health",
    explanation: "Year-on-year sales growth rate. Very high levels could mask financial distress.",
    weight: 7.7,
    greenRule: "More than 15%",
    amberRule: "5% to 15%",
    redRule: "Less than 5% OR more than 35%",
    currentValue: 18,
    score: 1,
    color: "green",
    reason: "Healthy, stable revenue expansion.",
    unit: "%"
  },
  {
    id: 5,
    name: "EBITDA Margin",
    category: "Financial Health",
    explanation: "Measure of core operational profitability and commercial buffer strength.",
    weight: 7.7,
    greenRule: "More than 15%",
    amberRule: "8% to 15%",
    redRule: "Less than 8%",
    currentValue: 16,
    score: 1,
    color: "green",
    reason: "Robust operational profit margin.",
    unit: "%"
  },
  {
    id: 6,
    name: "Debt Equity Ratio",
    category: "Financial Health",
    explanation: "A key solvency leverage metric indicating the debt-backed multiplier.",
    weight: 7.7,
    greenRule: "Less than 2x",
    amberRule: "2x to 4x",
    redRule: "More than 4x",
    currentValue: 1.5,
    score: 1,
    color: "green",
    reason: "Safe, solid capital structure.",
    unit: "x"
  },
  {
    id: 7,
    name: "Cash Cover",
    category: "Financial Health",
    explanation: "Compares current active cash flow collections against direct debt service needs.",
    weight: 7.7,
    greenRule: "More than 1x",
    amberRule: "0.8x to 1x",
    redRule: "Less than 0.8x",
    currentValue: 1.25,
    score: 1,
    color: "green",
    reason: "Sufficient cash flows to cover debts (> 1.0x).",
    unit: "x"
  },
  {
    id: 8,
    name: "Principal Concentration",
    category: "Business Operations",
    explanation: "Proportion of overall revenues derived from the single largest contracting principal.",
    weight: 7.7,
    greenRule: "Less than 50%",
    amberRule: "50% to 80%",
    redRule: "More than 80%",
    currentValue: 35,
    score: 1,
    color: "green",
    reason: "Well-diversified, secure client list.",
    unit: "%"
  },
  {
    id: 9,
    name: "Working Capital Cycle",
    category: "Financial Health",
    explanation: "Total net days trapped in inventory and receivable collection lags.",
    weight: 7.7,
    greenRule: "Less than 60 days",
    amberRule: "60 to 90 days",
    redRule: "More than 90 days OR negative",
    currentValue: 45,
    score: 1,
    color: "green",
    reason: "Rapid cash generation and conversion.",
    unit: "Days"
  },
  {
    id: 10,
    name: "Percentage of Remittance",
    category: "Repayment Behavior",
    explanation: "Percentage of operational collections routed directly through lender-escrow channels.",
    weight: 7.7,
    greenRule: "More than 25%",
    amberRule: "15% to 25%",
    redRule: "Less than 15%",
    currentValue: 30,
    score: 1,
    color: "green",
    reason: "Strong cash control, heavy escrow remittances.",
    unit: "%"
  },
  {
    id: 11,
    name: "Fleet Addition",
    category: "Asset Quality",
    explanation: "YoY growth in operating vehicle or commercial machine asset fleet numbers.",
    weight: 7.7,
    greenRule: "Less than 25%",
    amberRule: "25% to 35%",
    redRule: "More than 35%",
    currentValue: 10,
    score: 1,
    color: "green",
    reason: "Conservative asset expansion.",
    unit: "%"
  },
  {
    id: 12,
    name: "Free Assets",
    category: "Asset Quality",
    explanation: "Unencumbered, fully owned fleet assets available for additional lien coverage.",
    weight: 7.7,
    greenRule: "More than 15%",
    amberRule: "5% to 15%",
    redRule: "Less than 5%",
    currentValue: 20,
    score: 1,
    color: "green",
    reason: "High secondary collateral capacity.",
    unit: "%"
  },
  {
    id: 13,
    name: "Current Operation Level",
    category: "Business Operations",
    explanation: "Percentage capacity utilization or run-time hours of the active borrower fleet.",
    weight: 7.7,
    greenRule: "More than 80%",
    amberRule: "60% to 80%",
    redRule: "Less than 60%",
    currentValue: 85,
    score: 1,
    color: "green",
    reason: "High active capacity utilization.",
    unit: "%"
  }
];

// 5. Pre-configured Portfolio KPI Metrics
export const portfolioKPIs: PortfolioKPIs = {
  totalValue: 342.5, // Crores
  activeAccounts: 840,
  averageRiskScore: 28.6, // Raw score maps to Level 3 (Strong)
  collectionRate: 94.8 // %
};

// 6. Pre-configured segment distribution for Donut Chart
export const segmentDistribution = [
  { name: "HCV (Heavy Commercial Vehicles)", value: 112.4, color: "#1B3A6B", percentage: 33 },
  { name: "LCV (Light Commercial Vehicles)", value: 68.5, color: "#2E75B6", percentage: 20 },
  { name: "CE (Construction Equipment)", value: 85.6, color: "#4A90E2", percentage: 25 },
  { name: "SME Loans", value: 51.3, color: "#5C6BC0", percentage: 15 },
  { name: "Tractor / Agri-Equipment", value: 24.7, color: "#8E9AA6", percentage: 7 }
];

// 7. Monthly Collection Rates (12 months)
export const monthlyCollectionTrend = [
  { month: "Jul 25", rate: 93.2 },
  { month: "Aug 25", rate: 92.5 },
  { month: "Sep 25", rate: 94.1 },
  { month: "Oct 25", rate: 94.8 },
  { month: "Nov 25", rate: 93.6 },
  { month: "Dec 25", rate: 95.2 },
  { month: "Jan 26", rate: 95.0 },
  { month: "Feb 26", rate: 94.6 },
  { month: "Mar 26", rate: 96.1 },
  { month: "Apr 26", rate: 93.9 },
  { month: "May 26", rate: 94.5 },
  { month: "Jun 26", rate: 94.8 }
];

// 8. 10-Tier Risk Rating Portfolio Distribution (Precalculated values for graph)
export const riskRatingDistribution = [
  { level: 1, label: "Exceptional", count: 85, color: "#006400" },
  { level: 2, label: "Very Strong", count: 182, color: "#228B22" },
  { level: 3, label: "Strong", count: 240, color: "#32CD32" },
  { level: 4, label: "Satisfactory", count: 120, color: "#9ACD32" },
  { level: 5, label: "Moderate", count: 88, color: "#FFA500" },
  { level: 6, label: "Cautious", count: 54, color: "#FF8C00" },
  { level: 7, label: "Elevated", count: 35, color: "#FF6347" },
  { level: 8, label: "High Risk", count: 22, color: "#DC143C" },
  { level: 9, label: "Very High", count: 11, color: "#B22222" },
  { level: 10, label: "Critical", count: 3, color: "#8B0000" }
];

// 9. Prepopulated Top Accounts (Sortable, highest risk first in standard view)
export const initialTopAccounts: AlertItem[] = [
  {
    id: "ACC-9023",
    borrowerName: "Kailash Minerals & Infra",
    borrowerType: "Partnership",
    loanAmount: 185.0,
    riskScore: 61,
    riskLevel: 10,
    riskLabel: "Critical Risk",
    triggerReason: "EBITDA dropped to 3%, free assets < 2%, working capital 120 days.",
    recommendedAction: "SARFAESI execution, suspend OD facility, immediate asset repossession.",
    segment: "CE",
    date: "2026-07-15"
  },
  {
    id: "ACC-8721",
    borrowerName: "Surya Transport Logistics",
    borrowerType: "SME",
    loanAmount: 120.0,
    riskScore: 57,
    riskLevel: 9,
    riskLabel: "Very High Risk",
    triggerReason: "Lender association under 2 years, EBITDA margin is 6%, leverage over 5x.",
    recommendedAction: "Halt secondary drawings, issue legal recall warning, execute field visit.",
    segment: "HCV",
    date: "2026-07-14"
  },
  {
    id: "ACC-5412",
    borrowerName: "Royal Sand & Gravel",
    borrowerType: "Proprietorship",
    loanAmount: 95.0,
    riskScore: 53,
    riskLevel: 8,
    riskLabel: "High Risk",
    triggerReason: "Working capital stretched to 105 days, cash cover under 0.7x.",
    recommendedAction: "Enhance collateral to 2.0x, add promoter guarantee, demand upfront interest.",
    segment: "CE",
    date: "2026-07-12"
  },
  {
    id: "ACC-7182",
    borrowerName: "Bhargava Earthmovers",
    borrowerType: "Partnership",
    loanAmount: 240.0,
    riskScore: 48,
    riskLevel: 7,
    riskLabel: "Elevated",
    triggerReason: "Principal concentration 85%, free assets less than 4%.",
    recommendedAction: "Credit committee review, mandate escrow capture of top client receivables.",
    segment: "CE",
    date: "2026-07-11"
  },
  {
    id: "ACC-3042",
    borrowerName: "Balaji Logistics & Co",
    borrowerType: "SME",
    loanAmount: 75.0,
    riskScore: 43,
    riskLevel: 6,
    riskLabel: "Cautious",
    triggerReason: "EBITDA margin at 9%, debt-equity elevated to 3.8x.",
    recommendedAction: "Impose direct GSTR sweep, senior credit officer review required.",
    segment: "LCV",
    date: "2026-07-09"
  },
  {
    id: "ACC-4112",
    borrowerName: "Vinayaka Stones & Crusher",
    borrowerType: "Proprietorship",
    loanAmount: 110.0,
    riskScore: 39,
    riskLevel: 5,
    riskLabel: "Moderate",
    triggerReason: "Operation level at 65%, remittance drops to 16%.",
    recommendedAction: "Enhanced due diligence, verify quarry billing, add co-applicant.",
    segment: "CE",
    date: "2026-07-08"
  },
  {
    id: "ACC-6652",
    borrowerName: "Aman Agrotech Solutions",
    borrowerType: "SME",
    loanAmount: 45.0,
    riskScore: 34,
    riskLevel: 4,
    riskLabel: "Satisfactory",
    triggerReason: "Revenue growth slow at 7%, lender association 4 years.",
    recommendedAction: "Standard approval with annual document validation.",
    segment: "Tractor",
    date: "2026-07-06"
  },
  {
    id: "ACC-1209",
    borrowerName: "Elite Bulk Movers",
    borrowerType: "Corporate",
    loanAmount: 350.0,
    riskScore: 28,
    riskLevel: 3,
    riskLabel: "Strong",
    triggerReason: "Robust metrics but minor concentration of 55%.",
    recommendedAction: "Routine monthly monitoring, approve standard interest rates.",
    segment: "HCV",
    date: "2026-07-05"
  },
  {
    id: "ACC-9901",
    borrowerName: "Apex Logistics India Ltd",
    borrowerType: "Corporate",
    loanAmount: 500.0,
    riskScore: 21,
    riskLevel: 2,
    riskLabel: "Very Strong",
    triggerReason: "Lender relation of 8 years, DSCR > 1.8x, EBITDA 18%.",
    recommendedAction: "Standard fast-approval, extend flexible limits, premium client status.",
    segment: "HCV",
    date: "2026-07-02"
  },
  {
    id: "ACC-7841",
    borrowerName: "Jindal Infra-Contracts",
    borrowerType: "Corporate",
    loanAmount: 420.0,
    riskScore: 15,
    riskLevel: 1,
    riskLabel: "Exceptional",
    triggerReason: "Perfect scores across 13 parameters. Strong gov backing.",
    recommendedAction: "Fast-track pre-approved status, assign lowest lending spread.",
    segment: "CE",
    date: "2026-06-30"
  }
];

// 10. List of Fictional Borrowers that can be loaded in the form
export interface DemoBorrower {
  profile: {
    borrowerName: string;
    borrowerType: "SME" | "Proprietorship" | "Partnership" | "Corporate";
    loanAmount: number;
    loanPurpose: string;
  };
  parameters: { [key: number]: any };
  checklist: string[]; // checklist item IDs that are finished
}

export const demoBorrowerProfiles: DemoBorrower[] = [
  {
    profile: {
      borrowerName: "Ganga Sand Mining Ltd",
      borrowerType: "Partnership",
      loanAmount: 145.0,
      loanPurpose: "Purchase of 3 Heavy Excavators and Sand Aggregators"
    },
    parameters: {
      1: "Moderate Mining Segment",
      2: "4", // 4 years
      3: "65", // 65%
      4: "12", // 12% revenue growth
      5: "11", // 11% EBITDA
      6: "3.2", // 3.2x Debt-Equity
      7: "0.92", // 0.92 Cash Cover
      8: "65", // 65% principal concentration
      9: "75", // 75 days working capital
      10: "22", // 22% remittance
      11: "30", // 30% fleet addition
      12: "12", // 12% free assets
      13: "75" // 75% operation level
    },
    checklist: [
      "chk-audited-financials",
      "chk-fleet-list",
      "chk-work-order",
      "chk-bank-statement",
      "chk-bank-facility",
      "chk-gst-returns",
      "chk-net-worth",
      "chk-promoter-background"
    ]
  },
  {
    profile: {
      borrowerName: "Hariom Interstate Transport",
      borrowerType: "SME",
      loanAmount: 220.0,
      loanPurpose: "Fleet expansion adding 5 Multi-Axle Trucks for Cement Deployment"
    },
    parameters: {
      1: "Stable Infrastructure Segment",
      2: "9", // 9 years
      3: "35", // 35% exposure
      4: "18", // 18% growth
      5: "17", // 17% EBITDA
      6: "1.6", // 1.6x Debt Equity
      7: "1.35", // 1.35 Cash Cover
      8: "40", // 40% concentration
      9: "45", // 45 days working capital
      10: "32", // 32% remittance
      11: "15", // 15% fleet expansion
      12: "22", // 22% free assets
      13: "88" // 88% operation level
    },
    checklist: [
      "chk-audited-financials",
      "chk-fleet-list",
      "chk-work-order",
      "chk-bank-statement",
      "chk-bank-facility",
      "chk-gst-returns",
      "chk-form-26as",
      "chk-net-worth",
      "chk-assessed-cashflow",
      "chk-partnership-deed",
      "chk-rc-insurance",
      "chk-promoter-background"
    ]
  },
  {
    profile: {
      borrowerName: "Apex Brick Kiln & Builders",
      borrowerType: "Proprietorship",
      loanAmount: 85.0,
      loanPurpose: "Urgent Working Capital and Fleet Refurbishment"
    },
    parameters: {
      1: "Stressed Real Estate Segment",
      2: "2", // 2 years
      3: "85", // 85% exposure
      4: "3", // 3% revenue growth
      5: "6", // 6% EBITDA
      6: "4.8", // 4.8x Debt Equity
      7: "0.72", // 0.72 Cash Cover
      8: "85", // 85% principal concentration
      9: "110", // 110 days WC cycle
      10: "12", // 12% remittance
      11: "40", // 40% fleet addition
      12: "4", // 4% free assets
      13: "52" // 52% operation level
    },
    checklist: [
      "chk-audited-financials",
      "chk-bank-statement",
      "chk-bank-facility"
    ]
  }
];
