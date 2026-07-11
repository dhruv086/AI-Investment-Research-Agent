import { ChatGroq } from '@langchain/groq';
import JudgeVerdictSchema from '../schemas/judge.schema.js';

/**
 * JudgeAgent: Weighs the arguments from BullAgent, BearAgent, and RiskAgent
 * relative to the user's riskProfile, rendering a final, validated verdict.
 */
export const runJudgeAgent = async (state) => {
  const { bullCase, bearCase, riskFlags, riskProfile } = state;

  if (!bullCase || !bearCase || !riskFlags) {
    throw new Error('JudgeAgent requires bullCase, bearCase, and riskFlags in the state.');
  }

  const groqKey = process.env.GROQ_API_KEY;
  if (!groqKey) {
    throw new Error('GROQ_API_KEY is missing from environment.');
  }

  const model = new ChatGroq({
    apiKey: groqKey,
    model: "llama-3.3-70b-versatile",
    temperature: 0.2 // low temperature for logical consistency and synthesis
  });

  const structuredLlm = model.withStructuredOutput(JudgeVerdictSchema, {
    name: "VerdictDecider"
  });

  const systemMessage = `You are the JudgeAgent, the presiding chair of the AI Investment Committee.
Your job is to receive the BullAgent arguments (FOR investing), the BearAgent arguments (AGAINST investing), the RiskAgent audited flags, and the user's selected Risk Mandate Profile.
You must render a final binding decision: "Invest", "Pass", or "Watch", with a confidence rating (0-100), reasoning, and key factors.

Risk Mandate Profile Guidelines:
1. "Conservative":
   - Extremely sensitive to Risk Flags. High-severity flags, high debt, or negative WACC/ROIC ratios yield "Pass" or "Watch".
   - High liquidation preference values or lack of tag-along rights are heavily penalized.
2. "Balanced":
   - Weighs catalysts against risks evenly.
   - If ROIC exceeds WACC, it acts as a strong positive catalyst.
3. "Aggressive":
   - High tolerance for risk flags and volatility if the positive catalysts/market opportunity (TAM size, CAGR) represent significant upside.

Synthesis Mandate:
- Actively evaluate the WACC vs. ROIC comparison, unit economics (LTV/CAC payback), market boundaries (TAM/SAM/SOM), and legal covenants (liquidation preferences/dilution) in your reasoning statement.`;

  const userContent = `--- USER RISK PROFILE ---
Mandate: ${riskProfile || 'Balanced'}

--- BULL CASE (FOR) ---
${JSON.stringify(bullCase, null, 2)}

--- BEAR CASE (AGAINST) ---
${JSON.stringify(bearCase, null, 2)}

--- RISK AUDIT FLAGS ---
${JSON.stringify(riskFlags, null, 2)}`;

  console.log(`JudgeAgent: Synthesizing debate with a "${riskProfile}" mandate...`);
  const verdict = await structuredLlm.invoke([
    { role: "system", content: systemMessage },
    { role: "user", content: userContent }
  ]);

  console.log(`JudgeAgent: Verdict rendered: ${verdict.verdict} (Confidence: ${verdict.confidence}%)`);
  return {
    verdict: verdict.verdict,
    confidence: verdict.confidence,
    reasoning: verdict.reasoning,
    keyFactors: verdict.keyFactors
  };
};

export default runJudgeAgent;
