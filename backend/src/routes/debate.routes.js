import express from 'express';
import { getSessions, getSessionById } from '../controllers/debate.controller.js';

const router = express.Router();

router.get('/sessions', getSessions);
router.get('/sessions/:id', getSessionById);

export default router;
