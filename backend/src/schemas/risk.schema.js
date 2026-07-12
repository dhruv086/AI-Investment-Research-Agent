import { z } from 'zod';

export const RiskFlagsSchema = z.object({
  riskFlags: z.array(z.object({
    type: z.enum([
      'Debt/Liquidity',
      'Volatility/Beta',
      'Negative News',
      'Sector Headwinds',
      'Regulatory/Legal',
      'Geopolitical',
      'Other'
    ]).describe("The category of risk detected."),
    description: z.string().describe("Specific details and metrics supporting why this risk exists."),
    severity: z.enum(['Low', 'Medium', 'High']).describe("Audited severity rating.")
  })).describe("A list of concrete red flags audited from the company news and financial files."),
  severityScore: z.number().min(0).max(100).describe("An aggregate score from 0 to 100 representing the overall intensity and severity of the audited red flags. High score (80+) implies critical regulatory, legal, or liquidity/solvency risks; low score (<30) implies few minor, low-severity flags.")
});

export default RiskFlagsSchema;
