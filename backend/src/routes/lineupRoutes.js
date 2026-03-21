import express from 'express';
import { getTeams, getPlayersByTeam } from '../controllers/lineupController.js';

const router = express.Router();

router.get('/teams', getTeams);
router.get('/teams/:teamId/players', getPlayersByTeam);

export default router;
