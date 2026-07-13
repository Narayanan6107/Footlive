import express from 'express';
import {
  getAuctionPlayers,
  getRandomPlayer,
  getAuctionMeta,
} from '../controllers/auctionController.js';

const router = express.Router();

// GET /api/auction/meta  — budget & price stats
router.get('/meta', getAuctionMeta);

// GET /api/auction/players?count=50&minOverall=70
router.get('/players', getAuctionPlayers);

// GET /api/auction/players/random
router.get('/players/random', getRandomPlayer);

export default router;
