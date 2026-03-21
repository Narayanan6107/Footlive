import Team from '../models/Team.js';
import Player from '../models/Player.js';

// @desc    Get all teams
// @route   GET /api/lineup/teams
// @access  Public
export const getTeams = async (req, res) => {
    try {
        const teams = await Team.find().sort({ name: 1 });
        res.json(teams);
    } catch (error) {
        console.error('Error in getTeams:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get players by team
// @route   GET /api/lineup/teams/:teamId/players
// @access  Public
export const getPlayersByTeam = async (req, res) => {
    try {
        const players = await Player.find({ team: req.params.teamId }).sort({ number: 1 });
        res.json(players);
    } catch (error) {
        console.error('Error in getPlayersByTeam:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
