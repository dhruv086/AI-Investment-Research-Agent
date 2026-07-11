import { z } from 'zod';

export const BearCaseSchema = z.object({
  thesis: z.string().describe("The primary, negative, good-faith investment thesis against the company."),
  keyRisks: z.array(z.string()).describe("A list of concrete negative catalysts, structural risks, headwinds, or valuation issues (minimum 3 items)."),
  competitionThreats: z.string().describe("Details regarding direct competitive threats, loss of market share, or product obsolescence risks."),
  financialVulnerabilities: z.string().describe("Details on balance sheet concerns, debt levels, cash burn, pricing pressures, or margin compression.")
});

export default BearCaseSchema;
