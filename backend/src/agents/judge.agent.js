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
   - Extremely sensitive to Risk Flags. High-severity flags or high debt should yield "Pass" or "Watch".
   - Demands strong competitive moats and predictable financials.
   - Low tolerance for speculative future catalysts.
2. "Balanced":
   - Weighs catalysts against risks evenly.
   - If risks are high but catalysts are extremely strong, "Watch" or "Invest" (with lower confidence) may be appropriate.
3. "Aggressive":
   - High tolerance for risk flags and volatility if the positive catalysts/market opportunity represent significant upside.
   - Willing to recommend "Invest" on high-growth, high-risk companies, but still flags structural red flags.

Strict Output Rules:
- The reasoning must be a cohesive, detailed paragraph summarizing the balance of the debate.
- Key factors must list 3-5 of the most critical elements discussed in the committee.`;

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
