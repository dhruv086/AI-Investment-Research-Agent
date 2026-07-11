import { z } from 'zod';

export const JudgeVerdictSchema = z.object({
  verdict: z.enum(['Invest', 'Pass', 'Watch']).describe("The final investment decision recommendation based on the committee debate."),
  confidence: z.number().min(0).max(100).describe("Confidence score of the verdict on a scale of 0-100."),
  reasoning: z.string().describe("A cohesive, detailed synthesis explaining the final verdict by directly weighing the Bull arguments, Bear concerns, and Risk audit against the user's risk tolerance profile."),
  keyFactors: z.array(z.string()).describe("A list of 3-5 primary factors that drove this final decision (must be factual points raised in the debate).")
});

export default JudgeVerdictSchema;
