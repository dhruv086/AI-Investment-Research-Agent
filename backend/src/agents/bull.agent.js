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
    temperature: 0.7 // slightly higher temperature to encourage synthesis of arguments
  });

  const structuredLlm = model.withStructuredOutput(BullCaseSchema, {
    name: "BullCaseExtractor"
  });

  const systemMessage = `You are the BullAgent, an optimistic but rigorous financial committee member.
Your sole job is to make the strongest possible good-faith investment case FOR this company based ONLY on the provided factual dossier.

Rules:
- Focus on growth vectors, product dominance, competitive moats, market share gains, and strong financial numbers.
- Maintain high professionalism. While positive, avoid groundless hype and stick to facts in the dossier to support your thesis.
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
