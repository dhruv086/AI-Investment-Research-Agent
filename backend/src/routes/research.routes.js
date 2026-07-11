import express from 'express';
import { runResearchDebate } from '../controllers/research.controller.js';

const router = express.Router();

router.post('/research', runResearchDebate);

export default router;
