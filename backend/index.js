import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './src/config/db.config.js';
import researchRoutes from './src/routes/research.routes.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', researchRoutes);

// Basic Route for testing
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Boardroom AI Investment Research Backend is running.',
    timestamp: new Date()
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
