import { z } from 'zod';

export const BullCaseSchema = z.object({
  thesis: z.string().describe("The primary, positive, good-faith investment thesis for the company."),
  keyCatalysts: z.array(z.string()).describe("A list of concrete positive drivers, upcoming catalysts, or growth factors (minimum 3 items)."),
  marketOpportunity: z.string().describe("Detail of the addressable market, market share expansion, or secular tailwinds supporting the company."),
  competitiveMoat: z.string().describe("Detailed description of the company's competitive advantage (e.g. brand, high switching costs, network effects, scale, proprietary tech)."),
  strengthScore: z.number().min(0).max(100).describe("A numeric score from 0 to 100 representing the strength of the Bull thesis. Consider profit margins, market opportunity (TAM, CAGR), and the ROIC vs WACC comparison. High score (80+) implies high growth/profitability and wide moat; low score (<40) implies low growth, weak moat, or ROIC < WACC.")
});

export default BullCaseSchema;
