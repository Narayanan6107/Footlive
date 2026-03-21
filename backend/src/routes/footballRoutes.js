import express from 'express';
import {
    getCompetitions,
    getStandings,
    getCompetitionMatches,
    getCompetitionTeams,
    getTopScorers,
    getMatch,
    getCacheStatus
} from '../controllers/footballDataController.js';

const router = express.Router();

// Football-Data.org API endpoints with caching

// Competitions
router.get('/competitions', getCompetitions);

// Standings
router.get('/competitions/:competitionId/standings', getStandings);

// Matches
router.get('/competitions/:competitionId/matches', getCompetitionMatches);
router.get('/matches/:matchId', getMatch);

// Teams
router.get('/competitions/:competitionId/teams', getCompetitionTeams);

// Scorers
router.get('/competitions/:competitionId/scorers', getTopScorers);

// Cache status (debugging)
router.get('/cache/status', getCacheStatus);

export default router;

