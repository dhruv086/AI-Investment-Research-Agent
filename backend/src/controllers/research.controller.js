import mongoose from 'mongoose';
import { debateGraph } from '../graphs/debate.graph.js';
import DebateSession from '../models/debateSession.model.js';

/**
 * Controller to trigger the full LangGraph.js committee debate.
 * Runs all agent nodes and saves the outcome to MongoDB (if available).
 */
export const runResearchDebate = async (req, res) => {
  try {
    const { companyName, riskProfile } = req.body;
    
    if (!companyName || !riskProfile) {
      return res.status(400).json({
        error: 'Missing required fields: companyName and riskProfile are required.'
      });
    }

    console.log(`Research Controller: Starting full debate graph run for "${companyName}" (${riskProfile})...`);
    
    // Invoke the compiled debate graph state machine
    const finalState = await debateGraph.invoke({
      companyName,
      riskProfile
    });

    console.log(`Research Controller: Debate graph finished execution.`);

    // 2. Persist to MongoDB if connection is ready
    let savedSessionId = null;
    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      try {
        console.log('Research Controller: Saving debate session to MongoDB...');
        const newSession = new DebateSession({
          companyName,
          riskProfile,
          dossier: finalState.dossier,
          bullCase: finalState.bullCase,
          bearCase: finalState.bearCase,
          riskFlags: finalState.riskFlags,
          verdict: finalState.verdict,
          confidence: finalState.confidence,
          reasoning: finalState.reasoning,
          keyFactors: finalState.keyFactors
        });
        
        const savedSession = await newSession.save();
        savedSessionId = savedSession._id;
        console.log(`Research Controller: Session persisted successfully with ID: ${savedSessionId}`);
      } catch (dbError) {
        console.warn(`Research Controller: Database save failed: ${dbError.message}. Proceeding in degraded mode.`);
      }
    } else {
      console.warn('Research Controller: MongoDB is offline or disconnected. Skipping session persistence.');
    }

    // 3. Return full result to the client
    return res.status(200).json({
      message: isDbConnected && savedSessionId ? 'Committee debate completed and saved.' : 'Committee debate completed (Degraded: No persistence).',
      sessionId: savedSessionId,
      companyName,
      riskProfile,
      dossier: finalState.dossier,
      bullCase: finalState.bullCase,
      bearCase: finalState.bearCase,
      riskFlags: finalState.riskFlags,
      verdict: finalState.verdict,
      confidence: finalState.confidence,
      reasoning: finalState.reasoning,
      keyFactors: finalState.keyFactors
    });

  } catch (error) {
    console.error(`Research Controller Error: ${error.message}`);
    return res.status(500).json({
      error: `Failed to execute debate graph: ${error.message}`
    });
  }
};
