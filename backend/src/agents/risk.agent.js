import { ChatGroq } from '@langchain/groq';
import RiskFlagsSchema from '../schemas/risk.schema.js';

/**
 * RiskAgent: Audits the dossier to identify concrete red flags (leverage, valuation peaks, regulations, geopolitical factors).
 */
export const runRiskAgent = async (state) => {
  const { dossier } = state;
  if (!dossier) {
    throw new Error('RiskAgent requires a dossier in the state.');
  }

  const groqKey = process.env.GROQ_API_KEY;
  if (!groqKey) {
    throw new Error('GROQ_API_KEY is missing from environment.');
  }

  const model = new ChatGroq({
    apiKey: groqKey,
    model: "llama-3.3-70b-versatile",
    temperature: 0.2 // Low temperature for high precision auditing
  });

  const structuredLlm = model.withStructuredOutput(RiskFlagsSchema, {
    name: "RiskFlagsExtractor"
  });

  const systemMessage = `You are the RiskAgent, a conservative risk officer.
Your job is to audit the provided company dossier and compile a list of concrete red flags.

Focus areas:
- Financial/Liquidity: Negative Free Cash Flow, high burn rate, working capital deficits.
- VC/PE Structure: Strict liquidation preferences (e.g. >1x participating), aggressive dilution clauses, ROFR, or lack of drag/tag-along alignment.
- Market/Growth: High customer churn, high supplier/customer concentration risk.
- Macro: Volatility, regulatory investigations, geopolitical bottlenecks.

Ensure all flags have a clear severity rating (Low, Medium, High) and are grounded strictly in the dossier facts.`;

  const userContent = `Here is the factual Research Dossier for the target company:
${JSON.stringify(dossier, null, 2)}`;

  console.log('RiskAgent: Auditing dossier to flag risks...');
  const riskFlags = await structuredLlm.invoke([
    { role: "system", content: systemMessage },
    { role: "user", content: userContent }
  ]);

  console.log(`RiskAgent: Risk audit complete. Identified flags: ${riskFlags.riskFlags?.length || 0}`);
  return { riskFlags };
};

export default runRiskAgent;
