import { StateGraph, Annotation } from '@langchain/langgraph';
import runResearchAgent from '../agents/research.agent.js';
import runBullAgent from '../agents/bull.agent.js';
import runBearAgent from '../agents/bear.agent.js';
import runRiskAgent from '../agents/risk.agent.js';
import runJudgeAgent from '../agents/judge.agent.js';

// Define the debate graph State using LangGraph Annotations
export const DebateState = Annotation.Root({
  companyName: Annotation({ reducer: (x, y) => y ?? x }),
  riskProfile: Annotation({ reducer: (x, y) => y ?? x }),
  dossier: Annotation({ reducer: (x, y) => y ?? x }),
  bullCase: Annotation({ reducer: (x, y) => y ?? x }),
  bearCase: Annotation({ reducer: (x, y) => y ?? x }),
  riskFlags: Annotation({ reducer: (x, y) => y ?? x }),
  verdict: Annotation({ reducer: (x, y) => y ?? x }),
  confidence: Annotation({ reducer: (x, y) => y ?? x }),
  reasoning: Annotation({ reducer: (x, y) => y ?? x }),
  keyFactors: Annotation({ reducer: (x, y) => y ?? x })
});

// Define Node wrappers that interact with agent states
const researchNode = async (state) => {
  console.log('>>> [GRAPH NODE: ResearchNode] Executing...');
  const result = await runResearchAgent(state);
  return { dossier: result.dossier };
};

const bullNode = async (state) => {
  console.log('>>> [GRAPH NODE: BullNode] Executing...');
  const result = await runBullAgent(state);
  return { bullCase: result.bullCase };
};

const bearNode = async (state) => {
  console.log('>>> [GRAPH NODE: BearNode] Executing...');
  const result = await runBearAgent(state);
  return { bearCase: result.bearCase };
};

const riskNode = async (state) => {
  console.log('>>> [GRAPH NODE: RiskNode] Executing...');
  const result = await runRiskAgent(state);
  return { riskFlags: result.riskFlags };
};

const judgeNode = async (state) => {
  console.log('>>> [GRAPH NODE: JudgeNode] Executing...');
  const result = await runJudgeAgent(state);
  return {
    verdict: result.verdict,
    confidence: result.confidence,
    reasoning: result.reasoning,
    keyFactors: result.keyFactors
  };
};

// Wire the workflow
const workflow = new StateGraph(DebateState)
  .addNode('research', researchNode)
  .addNode('bull', bullNode)
  .addNode('bear', bearNode)
  .addNode('risk', riskNode)
  .addNode('judge', judgeNode);

// Define edges: Start -> Research
workflow.addEdge('__start__', 'research');

// Fan-out: Research node triggers Bull, Bear, and Risk nodes in parallel
workflow.addEdge('research', 'bull');
workflow.addEdge('research', 'bear');
workflow.addEdge('research', 'risk');

// Fan-in: Bull, Bear, and Risk nodes synchronize at the Judge node
workflow.addEdge('bull', 'judge');
workflow.addEdge('bear', 'judge');
workflow.addEdge('risk', 'judge');

// End of graph
workflow.addEdge('judge', '__end__');

// Compile the debate graph
export const debateGraph = workflow.compile();

export default debateGraph;
