import mongoose from 'mongoose';
import DebateSession from '../models/debateSession.model.js';

/**
 * Get all saved debate sessions (summary list).
 * Fails fast with a 503 if the database is offline.
 */
export const getSessions = async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      error: 'Database persistence service is offline. Historical sessions cannot be listed.'
    });
  }

  try {
    const sessions = await DebateSession.find({}, 'companyName riskProfile verdict confidence createdAt')
      .sort({ createdAt: -1 });
    return res.status(200).json(sessions);
  } catch (error) {
    console.error(`Error retrieving debate sessions: ${error.message}`);
    return res.status(500).json({
      error: `Failed to retrieve debate sessions: ${error.message}`
    });
  }
};

/**
 * Get a specific debate session by ID with full detail payload.
 * Fails fast with a 503 if the database is offline.
 */
export const getSessionById = async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      error: 'Database persistence service is offline. Historical sessions cannot be viewed.'
    });
  }

  const { id } = req.params;

  try {
    const session = await DebateSession.findById(id);
    if (!session) {
      return res.status(404).json({
        error: `Debate session with ID ${id} not found.`
      });
    }
    return res.status(200).json(session);
  } catch (error) {
    console.error(`Error retrieving debate session ${id}: ${error.message}`);
    return res.status(500).json({
      error: `Failed to retrieve debate session: ${error.message}`
    });
  }
};
