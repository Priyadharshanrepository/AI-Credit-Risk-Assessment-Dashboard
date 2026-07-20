import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Endpoint to generate the Underwriting Memo
  app.post("/api/generate-memo", async (req, res) => {
    try {
      const { borrowerProfile, parameterScores, rawScore, riskLevel, overallAssessment } = req.body;
      
      // Get API Key from header or fallback to environment variable
      const clientApiKey = req.headers["x-gemini-key"] as string || process.env.GEMINI_API_KEY;
      
      if (!clientApiKey || clientApiKey === "MY_GEMINI_API_KEY") {
        return res.status(400).json({ 
          error: "Gemini API key is required. Please set your API key in the settings modal (gear icon at top-right) or ensure it is configured in the environment." 
        });
      }

      const ai = new GoogleGenAI({
        apiKey: clientApiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const parameterScoresString = parameterScores.map((p: any) => 
        `- ${p.name}: Value: ${p.value} | Score: ${p.score} (${p.color.toUpperCase()})`
      ).join("\n");

      const prompt = `You are an elite principal credit underwriter and systems analyst at Sovereign Finance Group.
Generate a comprehensive, formal, professional "EXPOSURE NOTE" credit appraisal memo based exactly on the format of the official credit committee documents.

The memo must replicate a highly rigorous, institutional credit paper with precise text tables, section divisions, and complete data integrity. Do not truncate sections or use "TODO" placeholders.

BORROWER ASSESSMENT DATA:
- Applicant Name: M/S ${borrowerProfile.borrowerName.toUpperCase()}
- Constitution: ${borrowerProfile.borrowerType.toUpperCase()}
- Loan Amount Requested: ₹${borrowerProfile.loanAmount} Lakhs
- Loan Purpose: ${borrowerProfile.loanPurpose}
- Assessment Date: ${new Date().toLocaleDateString("en-IN")}

SCORING PARAMETERS & PROFILE DATA:
${parameterScoresString}

COMPUTED RISK SUMMARY:
- Raw Score: ${rawScore} out of 65
- Risk Level: Level ${riskLevel.level} — ${riskLevel.label}
- Credit Protocol Action: ${overallAssessment}

--------------------------------------------------------------------------------
INSTRUCTIONS FOR MEMO STRUCTURE:
Replicate the official "EXPOSURE NOTE" format in plain text / markdown. Include:

1. HEADER BLOCK
Generate a professional header with:
- "SOVEREIGN FINANCE GROUP" and "EXPOSURE NOTE" centered.
- Date of Credit Submission (use ${new Date().toLocaleDateString("en-IN")}) and Approval Valid Till (31/12/2026).
- Grid layout with metadata fields: Region (Andhra Pradesh/South Zone), Branch (Gudur Hub), Customer Code, Associated Since, Group Code, Applicant Name, Constitution, Customer Segment (Captive), and Deployment Segment (drawn from the "Contract Deployment Segment" parameter value).

2. EXPOSURE SUMMARY - GROUP LEVEL (Rs. in Lakhs)
Generate an ASCII text table with columns: Product | Existing Limit | Existing Exposure | Proposed Exposure | Total Exposure.
- Asset Financing proposed exposure is ₹${borrowerProfile.loanAmount} Lakhs. Existing values are 0.00.
- Output rows for: Asset Financing, Working Capital - DF, Working Capital - Others, SME, Trade Advance, Leasing, and Total.
- Highlight "Cumulative Exposure during recent 5 years" and "Proposed Upper Limit".

3. CURRENT REQUIREMENT & ASSET DETAILS (Rs. in Lakhs)
Generate an ASCII text table with columns: Asset Details (Make/Model) | No. of Units | Invoice/Market Value | Total Cost | Finance Amount | LTV % | Tenure (Months) | SF IRR %.
- Use the Loan Purpose for "Asset Details".
- Set appropriate units, total cost, and a finance amount of ₹${borrowerProfile.loanAmount} Lakhs. Calculate LTV % based on the "LTV" parameter or a reasonable margin.
- Add a narrative on "Usage of the Proposed Asset / End use of funds" explaining how the vehicles/equipment will be deployed.

4. PROMOTER & GUARANTOR BACKGROUND
- Promoter's Background Details: Draft a professional summary of the promoter group (e.g., Mr. Subba Reddy, Managing Partner, 53 years, B.E. Graduate, experienced in Crusher/Quarry/Mining/Transport operations).
- Share Holding Details Table (ASCII format): Name | Age | Designation | Shareholding % | Relationship with Key Person.
- Guarantor Details: Personal Guarantee of the Lead Promoter and Co-Applicants with suitable Net Worth.

5. BUSINESS OPERATIONS & FLEET STRENGTH
- Business Operations description: Note contract stability, principal concentration of ${parameterScores.find((p: any) => p.name.includes("Concentration"))?.value || "the top client"}%, and current operation level.
- Fleet Strength Table (ASCII format): Show total active assets, free assets percentage, and recent fleet additions.

6. FINANCIAL ANALYSIS & PERFORMANCE OBSERVATIONS
Generate an ASCII comparison table across 3 fiscal years (FY 22-23 Audited, FY 23-24 Audited, FY 24-25 Project) for:
- Total Revenues (Rs. Lakhs)
- EBITDA Margin %
- Debt to Equity (D/E)
- Cash Cover Ratio
- Working Capital Cycle (Days)
Populate the table with the actual current values from the scoring parameters.
- Provide professional observations on Financial Performance (discussing profitability margins, leverage, cash cover, and working capital cycles).

7. KEY MAN RISK & RISK ALERTS
- Analyze "Key Man Risk" and list active risk alerts triggered based on the scoring parameters (especially those with Red colors/high risk scores).

8. CREDIT RECOMMENDATION, POLICY DEVIATIONS & SIGN-OFF
- Recommendation: State clearly whether to APPROVE, CONDITIONAL APPROVE, or DECLINE.
- Mitigants: Detail robust risk mitigants based on parameters with strong/green scores.
- Conditions / Monitoring Requirements: List specific post-disbursement terms (e.g., Escrow mechanism, quarterly fleet verification, GSTR sweep checks).
- Sign-off lines: Prepare signature placeholders for Credit Appraisal Officer, Senior Credit Manager, and Credit Committee.

Ensure the entire document has a prestigious, highly rigorous institutional tone. Populated with realistic details from the active assessment. Do not skip any sections. Do not use placeholders. Write the full text.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
      });

      const memoText = response.text || "Failed to generate memo content.";
      res.json({ memo: memoText });

    } catch (error: any) {
      console.error("Error generating memo:", error);
      res.status(500).json({ error: error.message || "An error occurred while generating the credit memo." });
    }
  });

  // 1. Multi-turn Chat Endpoint (Gemini 3.5 Flash)
  app.post("/api/chat", async (req, res) => {
    try {
      const { history, message, borrowerProfile, parameterScores } = req.body;
      const clientApiKey = req.headers["x-gemini-key"] as string || process.env.GEMINI_API_KEY;

      if (!clientApiKey || clientApiKey === "MY_GEMINI_API_KEY") {
        return res.status(400).json({ 
          error: "Gemini API key is required. Please set your API key in the settings modal (gear icon at top-right)." 
        });
      }

      const ai = new GoogleGenAI({
        apiKey: clientApiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const borrowerContext = borrowerProfile ? `
CURRENT BORROWER CONTEXT:
- Name: M/S ${borrowerProfile.borrowerName}
- Constitution: ${borrowerProfile.borrowerType}
- Loan Requested: ₹${borrowerProfile.loanAmount} Lakhs for ${borrowerProfile.loanPurpose}
- Parameter Metrics: ${JSON.stringify(parameterScores?.map((p: any) => ({ name: p.name, value: p.value, color: p.color })) || [])}
` : '';

      const systemInstruction = `You are a highly-analytical expert Credit Underwriting Assistant at Sovereign Finance Group.
Your primary role is to assist credit analysts, senior credit managers, and underwriters in performing due diligence, evaluating financial statement ratios, risk rating parameters, and credit exposure metrics.

Keep your tone strictly professional, objective, and analytical.
Use specific loan guidelines and credit terms (e.g. LTV, Debt-Equity, EBITDA, Cash Cover, GSTR checks, SHAP drivers, credit limits).
Always ground your answers in professional NBFC credit policies.

${borrowerContext}
If the user asks about the active borrower, reference the metrics provided above. Always keep conversations constructive and helpful.`;

      const contents = history.map((msg: any) => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.text }]
      }));

      contents.push({
        role: "user",
        parts: [{ text: message }]
      });

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents,
        config: {
          systemInstruction
        }
      });

      res.json({ reply: response.text || "I was unable to formulate a response. Please try again." });
    } catch (error: any) {
      console.error("Error in /api/chat:", error);
      res.status(500).json({ error: error.message || "An error occurred during chat processing." });
    }
  });

  // 2. Document & Image Scanner Endpoint (Gemini 3.1 Pro Preview)
  app.post("/api/analyze-image", async (req, res) => {
    try {
      const { base64Data, mimeType, prompt, borrowerProfile } = req.body;
      const clientApiKey = req.headers["x-gemini-key"] as string || process.env.GEMINI_API_KEY;

      if (!clientApiKey || clientApiKey === "MY_GEMINI_API_KEY") {
        return res.status(400).json({ 
          error: "Gemini API key is required. Please set your API key in the settings modal (gear icon at top-right)." 
        });
      }

      const ai = new GoogleGenAI({
        apiKey: clientApiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const borrowerContext = borrowerProfile ? `This document/image pertains to M/S ${borrowerProfile.borrowerName}, applying for ₹${borrowerProfile.loanAmount} Lakhs.` : '';

      const fullPrompt = `${prompt || "Analyze this document image for commercial credit underwriting, extract key financial parameters, flag any anomalies, and summarize the key findings."}
      
${borrowerContext}
Ensure your analysis is thorough, rigorous, and highly detailed. Keep an institutional commercial lender tone.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: [
          {
            inlineData: {
              mimeType: mimeType || "image/jpeg",
              data: base64Data
            }
          },
          {
            text: fullPrompt
          }
        ]
      });

      res.json({ analysis: response.text || "Failed to analyze the document." });
    } catch (error: any) {
      console.error("Error in /api/analyze-image:", error);
      res.status(500).json({ error: error.message || "An error occurred during document scanning." });
    }
  });

  // 3. Low-Latency Responses (Gemini 3.1 Flash Lite)
  app.post("/api/fast-advisor", async (req, res) => {
    try {
      const { prompt, parameterName, parameterValue } = req.body;
      const clientApiKey = req.headers["x-gemini-key"] as string || process.env.GEMINI_API_KEY;

      if (!clientApiKey || clientApiKey === "MY_GEMINI_API_KEY") {
        return res.status(400).json({ 
          error: "Gemini API key is required. Please set your API key in the settings modal (gear icon at top-right)." 
        });
      }

      const ai = new GoogleGenAI({
        apiKey: clientApiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      let promptText = prompt;
      if (parameterName && parameterValue) {
        promptText = `Provide a rapid, high-impact underwriter summary for the credit parameter '${parameterName}' with value '${parameterValue}'. 
Explain briefly what this means for credit risk in 1-2 bullet points (max 80 words).`;
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents: promptText,
        config: {
          systemInstruction: "You are a low-latency lightning-fast Credit Policy Assistant. Answer questions concisely and extremely fast, getting straight to the core commercial CV/SME risk facts."
        }
      });

      res.json({ advice: response.text || "Advice currently unavailable." });
    } catch (error: any) {
      console.error("Error in /api/fast-advisor:", error);
      res.status(500).json({ error: error.message || "An error occurred during fast advice retrieval." });
    }
  });

  // Serve static assets or use Vite middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
