import { z } from 'zod';

export const DossierSchema = z.object({
  companyName: z.string().describe("The official full name of the company."),
  ticker: z.string().describe("The stock symbol/ticker of the company (e.g. AAPL, NVDA)."),
  businessOverview: z.string().describe("A brief facts-only overview of what the company does, its business model, and key divisions."),
  sector: z.string().describe("The sector or industry category the company operates in."),
  
  // 1. Financial & Valuation Metrics
  financialValuationMetrics: z.object({
    ebitda: z.string().nullable().optional().describe("EBITDA, e.g. '$24.5 Billion'"),
    qualityOfEarnings: z.string().nullable().optional().describe("Notes on QoE, revenue recognition, or one-off items."),
    capTable: z.string().nullable().optional().describe("Cap table details or shareholder concentration notes."),
    burnRate: z.string().nullable().optional().describe("Monthly cash burn rate (important for private startups)."),
    cac: z.string().nullable().optional().describe("Customer Acquisition Cost."),
    ltv: z.string().nullable().optional().describe("Customer Lifetime Value."),
    workingCapital: z.string().nullable().optional().describe("Working capital (Current Assets - Current Liabilities)."),
    runRate: z.string().nullable().optional().describe("Annualized revenue run rate."),
    freeCashFlow: z.string().nullable().optional().describe("Free Cash Flow, e.g. '$18.2 Billion'"),
    grossMargin: z.string().nullable().optional().describe("Gross profit margin percentage, e.g. '75.2%'")
  }).optional().describe("Core balance sheet, income, and startup metrics."),

  // 2. Deal Structure & Legal Terms (VC/PE focus)
  dealLegalTerms: z.object({
    liquidationPreference: z.string().nullable().optional().describe("Liquidation preferences, e.g. '1x non-participating' (set to 'Public Equity Standard' for public companies)."),
    antiDilution: z.string().nullable().optional().describe("Anti-dilution protections, e.g. 'weighted average'."),
    vestingSchedule: z.string().nullable().optional().describe("Founder/employee vesting terms, e.g. '4-year linear with 1-year cliff'."),
    rofr: z.string().nullable().optional().describe("Right of First Refusal clauses."),
    dragAlongRights: z.string().nullable().optional().describe("Drag-along rights thresholds."),
    tagAlongRights: z.string().nullable().optional().describe("Tag-along rights clauses."),
    repsAndWarranties: z.string().nullable().optional().describe("Key representations and warranties notes."),
    indemnification: z.string().nullable().optional().describe("Indemnification caps and baskets."),
    preMoneyValuation: z.string().nullable().optional().describe("Pre-money valuation of recent round."),
    postMoneyValuation: z.string().nullable().optional().describe("Post-money valuation of recent round.")
  }).optional().describe("Legal and deal architecture specifications (VC/PE or public stock default)."),

  // 3. Market & Growth Terms
  marketGrowthTerms: z.object({
    tam: z.string().nullable().optional().describe("Total Addressable Market size."),
    sam: z.string().nullable().optional().describe("Serviceable Addressable Market size."),
    som: z.string().nullable().optional().describe("Serviceable Obtainable Market size."),
    cagr: z.string().nullable().optional().describe("Compound Annual Growth Rate, e.g. '14.5% over 5 years'."),
    churnRate: z.string().nullable().optional().describe("Customer churn percentage."),
    concentrationRisk: z.string().nullable().optional().describe("Customer or supplier concentration risks."),
    networkEffect: z.string().nullable().optional().describe("Details on network effects or business scaling loop."),
    marketPenetration: z.string().nullable().optional().describe("Estimated market share or penetration percentage."),
    unitEconomics: z.string().nullable().optional().describe("Unit economics notes (e.g. LTV/CAC ratio, payback period).")
  }).optional().describe("TAM/SAM/SOM boundaries and expansion structures."),

  // 4. Performance & Return Metrics
  performanceReturnMetrics: z.object({
    irr: z.string().nullable().optional().describe("Internal Rate of Return (estimated/target)."),
    moic: z.string().nullable().optional().describe("Multiple on Invested Capital."),
    roic: z.string().nullable().optional().describe("Return on Invested Capital, e.g. '22.4%'."),
    wacc: z.string().nullable().optional().describe("Weighted Average Cost of Capital, e.g. '8.5%'."),
    cashOnCash: z.string().nullable().optional().describe("Cash-on-Cash Return."),
    paybackPeriod: z.string().nullable().optional().describe("CAC payback period timeframe, e.g. '8 months'.")
  }).optional().describe("Returns profiles, capital efficiency, and hurdle rates."),

  recentNews: z.array(z.object({
    title: z.string().describe("Headline or news title."),
    summary: z.string().describe("Facts extracted from the article (strictly factual)."),
    date: z.string().optional().describe("Approximate date of the article if available.")
  })).describe("Recent key news developments, product releases, or controversies (facts only, minimum 3 items)."),
  
  extractedFacts: z.array(z.string()).describe("A list of concrete, objective facts about the company's financial health, competitive landscape, and recent developments. Strictly objective, no opinions.")
});

export default DossierSchema;
