import dotenv from 'dotenv';

dotenv.config();

const API_KEY = process.env.FOOTBALL_DATA_API_KEY;
const BASE_URL = 'https://api.football-data.org/v4';

// Cache storage: { key: { data, timestamp } }
const cache = new Map();
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

/**
 * Get cached data or fetch from API
 */
const getCachedData = async (key, fetchFn) => {
    // Check if data exists in cache and is still valid
    if (cache.has(key)) {
        const cached = cache.get(key);
        const now = Date.now();
        if (now - cached.timestamp < CACHE_DURATION) {
            console.log(`✅ Cache HIT: ${key}`);
            return cached.data;
        }
        // Cache expired, delete it
        cache.delete(key);
    }

    // Fetch fresh data from API
    console.log(`📡 Cache MISS: Fetching ${key}`);
    const data = await fetchFn();
    
    // Store in cache
    cache.set(key, {
        data,
        timestamp: Date.now()
    });

    return data;
};

/**
 * Fetch competitions (all or filtered)
 */
export const getCompetitions = async (req, res) => {
    try {
        const cacheKey = 'competitions';
        
        const data = await getCachedData(cacheKey, async () => {
            const response = await fetch(`${BASE_URL}/competitions`, {
                headers: { 'X-Auth-Token': API_KEY }
            });
            
            if (!response.ok) throw new Error('Failed to fetch competitions');
            return response.json();
        });

        res.json({
            success: true,
            cached: cache.has(cacheKey),
            cacheExpires: new Date(cache.get(cacheKey).timestamp + CACHE_DURATION).toISOString(),
            data
        });
    } catch (error) {
        console.error('Error fetching competitions:', error);
        res.status(500).json({ 
            success: false,
            message: 'Failed to fetch competitions' 
        });
    }
};

/**
 * Fetch standings for a specific competition
 */
export const getStandings = async (req, res) => {
    try {
        const { competitionId } = req.params;
        const { season } = req.query;
        
        const cacheKey = `standings_${competitionId}_${season || 'current'}`;
        
        const data = await getCachedData(cacheKey, async () => {
            const url = season 
                ? `${BASE_URL}/competitions/${competitionId}/standings?season=${season}`
                : `${BASE_URL}/competitions/${competitionId}/standings`;
            
            const response = await fetch(url, {
                headers: { 'X-Auth-Token': API_KEY }
            });
            
            if (!response.ok) {
                const errorBody = await response.text();
                console.error(`❌ API Error [${response.status}] for ${url}:`, errorBody);
                throw new Error(`Failed to fetch standings: ${response.status}`);
            }
            return response.json();
        });

        res.json({
            success: true,
            cached: cache.has(cacheKey),
            cacheExpires: new Date(cache.get(cacheKey).timestamp + CACHE_DURATION).toISOString(),
            data
        });
    } catch (error) {
        console.error('Error fetching standings:', error);
        res.status(500).json({ 
            success: false,
            message: 'Failed to fetch standings' 
        });
    }
};

/**
 * Fetch matches for a specific competition
 */
export const getCompetitionMatches = async (req, res) => {
    try {
        const { competitionId } = req.params;
        const { dateFrom, dateTo, status, season } = req.query;
        
        const params = new URLSearchParams();
        if (dateFrom) params.append('dateFrom', dateFrom);
        if (dateTo) params.append('dateTo', dateTo);
        if (status) params.append('status', status);
        if (season) params.append('season', season);
        
        // Create cache key from params
        const queryString = params.toString();
        const cacheKey = `matches_${competitionId}${queryString ? '_' + queryString : ''}`;
        
        const data = await getCachedData(cacheKey, async () => {
            const url = `${BASE_URL}/competitions/${competitionId}/matches?${queryString}`;
            
            const response = await fetch(url, {
                headers: { 'X-Auth-Token': API_KEY }
            });
            
            if (!response.ok) throw new Error('Failed to fetch matches');
            return response.json();
        });

        res.json({
            success: true,
            cached: cache.has(cacheKey),
            cacheExpires: new Date(cache.get(cacheKey).timestamp + CACHE_DURATION).toISOString(),
            data
        });
    } catch (error) {
        console.error('Error fetching matches:', error);
        res.status(500).json({ 
            success: false,
            message: 'Failed to fetch matches' 
        });
    }
};

/**
 * Fetch teams for a specific competition
 */
export const getCompetitionTeams = async (req, res) => {
    try {
        const { competitionId } = req.params;
        const { season } = req.query;
        
        const cacheKey = `teams_${competitionId}_${season || 'current'}`;
        
        const data = await getCachedData(cacheKey, async () => {
            const url = season 
                ? `${BASE_URL}/competitions/${competitionId}/teams?season=${season}`
                : `${BASE_URL}/competitions/${competitionId}/teams`;
            
            const response = await fetch(url, {
                headers: { 'X-Auth-Token': API_KEY }
            });
            
            if (!response.ok) throw new Error('Failed to fetch teams');
            return response.json();
        });

        res.json({
            success: true,
            cached: cache.has(cacheKey),
            cacheExpires: new Date(cache.get(cacheKey).timestamp + CACHE_DURATION).toISOString(),
            data
        });
    } catch (error) {
        console.error('Error fetching teams:', error);
        res.status(500).json({ 
            success: false,
            message: 'Failed to fetch teams' 
        });
    }
};

/**
 * Fetch top scorers for a specific competition
 */
export const getTopScorers = async (req, res) => {
    try {
        const { competitionId } = req.params;
        const { season, limit } = req.query;
        
        const cacheKey = `scorers_${competitionId}_${season || 'current'}_${limit || '10'}`;
        
        const data = await getCachedData(cacheKey, async () => {
            let url = `${BASE_URL}/competitions/${competitionId}/scorers`;
            const params = [];
            if (season) params.push(`season=${season}`);
            if (limit) params.push(`limit=${limit}`);
            if (params.length) url += '?' + params.join('&');
            
            const response = await fetch(url, {
                headers: { 'X-Auth-Token': API_KEY }
            });
            
            if (!response.ok) throw new Error('Failed to fetch scorers');
            return response.json();
        });

        res.json({
            success: true,
            cached: cache.has(cacheKey),
            cacheExpires: new Date(cache.get(cacheKey).timestamp + CACHE_DURATION).toISOString(),
            data
        });
    } catch (error) {
        console.error('Error fetching scorers:', error);
        res.status(500).json({ 
            success: false,
            message: 'Failed to fetch scorers' 
        });
    }
};

/**
 * Fetch a specific match details
 */
export const getMatch = async (req, res) => {
    try {
        const { matchId } = req.params;
        const cacheKey = `match_${matchId}`;
        
        const data = await getCachedData(cacheKey, async () => {
            const response = await fetch(`${BASE_URL}/matches/${matchId}`, {
                headers: { 'X-Auth-Token': API_KEY }
            });
            
            if (!response.ok) throw new Error('Failed to fetch match');
            return response.json();
        });

        res.json({
            success: true,
            cached: cache.has(cacheKey),
            cacheExpires: new Date(cache.get(cacheKey).timestamp + CACHE_DURATION).toISOString(),
            data
        });
    } catch (error) {
        console.error('Error fetching match:', error);
        res.status(500).json({ 
            success: false,
            message: 'Failed to fetch match details' 
        });
    }
};

/**
 * Get cache status (for debugging)
 */
export const getCacheStatus = async (req, res) => {
    try {
        const cacheEntries = Array.from(cache.entries()).map(([key, value]) => ({
            key,
            cachedAt: new Date(value.timestamp).toISOString(),
            expiresAt: new Date(value.timestamp + CACHE_DURATION).toISOString(),
            isExpired: Date.now() - value.timestamp > CACHE_DURATION
        }));

        res.json({
            success: true,
            totalCacheEntries: cache.size,
            cacheDurationMinutes: CACHE_DURATION / 60000,
            entries: cacheEntries
        });
    } catch (error) {
        console.error('Error getting cache status:', error);
        res.status(500).json({ 
            success: false,
            message: 'Failed to get cache status' 
        });
    }
};
