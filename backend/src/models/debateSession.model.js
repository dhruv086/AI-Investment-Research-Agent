import mongoose from 'mongoose';

const debateSessionSchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: true,
    trim: true
  },
  riskProfile: {
    type: String,
    required: true,
    enum: ['Conservative', 'Balanced', 'Aggressive']
  },
  dossier: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  bullCase: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  bearCase: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  riskFlags: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  verdict: {
    type: String,
    required: true,
    enum: ['Invest', 'Pass', 'Watch']
  },
  confidence: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  reasoning: {
    type: String,
    required: true
  },
  keyFactors: {
    type: [String],
    required: true,
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const DebateSession = mongoose.model('DebateSession', debateSessionSchema);

export default DebateSession;
