import { ChatGroq } from '@langchain/groq';
import BullCaseSchema from '../schemas/bull.schema.js';

/**
 * BullAgent: Analyzes the factual dossier and constructs the strongest positive investment thesis.
 */
export const runBullAgent = async (state) => {
  const { dossier } = state;
  if (!dossier) {
    throw new Error('BullAgent requires a dossier in the state.');
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

  const structuredLlm = model.withStructuredOutput(BullCaseSchema, {
    name: "BullCaseExtractor"
  });

  const systemMessage = `You are the BullAgent, an optimistic but rigorous financial committee member.
Your sole job is to make the strongest possible good-faith investment case FOR this company based ONLY on the provided factual dossier.

Rules:
- Actively evaluate and cite the expanded financial, market, and performance metrics if available:
  - Strong Free Cash Flow (FCF) conversion and high Gross Margins.
  - Value creation (ROIC exceeding WACC).
  - Strong Unit Economics (high LTV/CAC ratios, rapid Payback Periods).
  - Large Total Addressable Market (TAM) and secular growth rates (CAGR).
  - moats supporting scaling (Network Effects).
- Keep arguments grounded strictly in the dossier facts. Avoid groundless hype.
- You must not refer to or assume any counterarguments or bear cases.`;

  const userContent = `Here is the factual Research Dossier for the target company:
${JSON.stringify(dossier, null, 2)}`;

  console.log('BullAgent: Analyzing dossier to build the bull case...');
  const bullCase = await structuredLlm.invoke([
    { role: "system", content: systemMessage },
    { role: "user", content: userContent }
  ]);

  console.log('BullAgent: Bull case compiled successfully.');
  return { bullCase };
};

export default runBullAgent;
