import { z } from 'zod';

export const BullCaseSchema = z.object({
  thesis: z.string().describe("The primary, positive, good-faith investment thesis for the company."),
  keyCatalysts: z.array(z.string()).describe("A list of concrete positive drivers, upcoming catalysts, or growth factors (minimum 3 items)."),
  marketOpportunity: z.string().describe("Detail of the addressable market, market share expansion, or secular tailwinds supporting the company."),
  competitiveMoat: z.string().describe("Detailed description of the company's competitive advantage (e.g. brand, high switching costs, network effects, scale, proprietary tech).")
});

export default BullCaseSchema;
