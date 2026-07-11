import { debateGraph } from '../graphs/debate.graph.js';

/**
 * Controller to trigger the LangGraph.js investment committee debate graph.
 * Executes Research, Bull, Bear, and Risk agents, returning the complete analysis.
 */
export const runResearchDebate = async (req, res) => {
  try {
    const { companyName, riskProfile } = req.body;
    
    if (!companyName || !riskProfile) {
      return res.status(400).json({
        error: 'Missing required fields: companyName and riskProfile are required.'
      });
    }

    console.log(`Research Controller: Triggering debate graph run for "${companyName}" (${riskProfile})...`);
    
    // Invoke the compiled LangGraph
    const finalState = await debateGraph.invoke({
      companyName,
      riskProfile
    });

    console.log(`Research Controller: Debate graph finished execution.`);

    // Return aggregated results
    return res.status(200).json({
      message: 'Committee debate run complete.',
      companyName,
      riskProfile,
      dossier: finalState.dossier,
      bullCase: finalState.bullCase,
      bearCase: finalState.bearCase,
      riskFlags: finalState.riskFlags
    });
  } catch (error) {
    console.error(`Research Controller Error: ${error.message}`);
    return res.status(500).json({
      error: `Failed to execute debate graph: ${error.message}`
    });
  }
};
