import { localDateStr } from '../utils/dateUtils.js';
import dotenv from 'dotenv';

dotenv.config();
const FOOTBALL_DATA_API_KEY = process.env.FOOTBALL_DATA_API_KEY;

// Cache logic
let matchesCache = new Map();
const CACHE_TTL = 1000 * 60 * 15; // 15 min

export const getMatches = async (req, res) => {
    const todayStr = localDateStr();
    const date = req.query.date || todayStr;

    // Serve from cache if fresh
    const hit = matchesCache.get(date);
    if (hit && Date.now() - hit.lastFetch < CACHE_TTL) {
        console.log(`⚡ Cache hit for ${date}`);
        return res.json(hit.data);
    }

    try {
        const isToday = date === todayStr;
        const url = isToday
            ? 'https://api.football-data.org/v4/matches'
            : `https://api.football-data.org/v4/matches?dateFrom=${date}&dateTo=${date}`;
        
        console.log(`📡 Fetching matches for ${date}...`);
        const response = await fetch(url, {
            headers: { 'X-Auth-Token': FOOTBALL_DATA_API_KEY }
        });

        if (!response.ok) {
            throw new Error(`API ${response.status}`);
        }

        const data = await response.json();
        matchesCache.set(date, { data, lastFetch: Date.now() });
        res.json(data);
    } catch (err) {
        console.error('Match proxy error:', err.message);
        const stale = matchesCache.get(date);
        if (stale) return res.json(stale.data);
        res.status(500).json({ message: 'Failed to fetch matches' });
    }
};
