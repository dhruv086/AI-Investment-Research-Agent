import { ChatGroq } from '@langchain/groq';
import BearCaseSchema from '../schemas/bear.schema.js';

/**
 * BearAgent: Analyzes the factual dossier and constructs the strongest negative investment thesis.
 */
export const runBearAgent = async (state) => {
  const { dossier } = state;
  if (!dossier) {
    throw new Error('BearAgent requires a dossier in the state.');
  }

  const groqKey = process.env.GROQ_API_KEY;
  if (!groqKey) {
    throw new Error('GROQ_API_KEY is missing from environment.');
  }

  const model = new ChatGroq({
    apiKey: groqKey,
    model: "llama-3.3-70b-versatile",
    temperature: 0.7
  });

  const structuredLlm = model.withStructuredOutput(BearCaseSchema, {
    name: "BearCaseExtractor"
  });

  const systemMessage = `You are the BearAgent, a skeptical and conservative financial committee member.
Your sole job is to make the strongest possible good-faith investment case AGAINST this company based ONLY on the provided factual dossier.

Rules:
- Actively evaluate and cite the expanded financial, market, and performance metrics if available:
  - Compressed Gross Margins or high Burn Rates/operating cash outflows.
  - Value destruction (WACC exceeding ROIC).
  - Weak Unit Economics (high Churn Rates, long CAC Payback Periods).
  - High customer or supplier Concentration Risk.
  - Small Serviceable Obtainable Market (SOM) or decelerating growth rates (CAGR).
- Keep arguments grounded strictly in the dossier facts.
- You must not look at or consider the bull thesis or positive catalyst assumptions.`;

  const userContent = `Here is the factual Research Dossier for the target company:
${JSON.stringify(dossier, null, 2)}`;

  console.log('BearAgent: Analyzing dossier to build the bear case...');
  const bearCase = await structuredLlm.invoke([
    { role: "system", content: systemMessage },
    { role: "user", content: userContent }
  ]);

  console.log('BearAgent: Bear case compiled successfully.');
  return { bearCase };
};

export default runBearAgent;
