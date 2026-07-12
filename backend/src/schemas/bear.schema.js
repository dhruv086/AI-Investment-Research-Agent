import { z } from 'zod';

export const BearCaseSchema = z.object({
  thesis: z.string().describe("The primary, negative, good-faith investment thesis against the company."),
  keyRisks: z.array(z.string()).describe("A list of concrete negative catalysts, structural risks, headwinds, or valuation issues (minimum 3 items)."),
  competitionThreats: z.string().describe("Details regarding direct competitive threats, loss of market share, or product obsolescence risks."),
  financialVulnerabilities: z.string().describe("Details on balance sheet concerns, debt levels, cash burn, pricing pressures, or margin compression."),
  strengthScore: z.number().min(0).max(100).describe("A numeric score from 0 to 100 representing the strength of the Bear thesis (the arguments against investing). Consider compressed gross margins, debt levels, cash burn, high concentration risks, or WACC > ROIC. High score (80+) implies major existential risks or structural negatives; low score (<40) implies minor risks or strong financials that resist bear cases.")
});

export default BearCaseSchema;
