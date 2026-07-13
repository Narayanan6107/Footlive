import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CSV_PATH = path.join(__dirname, '../../data/FC26_20250921.csv');

// ──────────────────────────────────────────────
// Position → tier mapping
// ──────────────────────────────────────────────
const POSITION_TIERS = {
  GK:  'GK',
  // Defenders
  CB: 'DEF', LB: 'DEF', RB: 'DEF', LWB: 'DEF', RWB: 'DEF',
  // Midfielders
  CM: 'MID', CDM: 'MID', CAM: 'MID', LM: 'MID', RM: 'MID',
  // Attackers
  ST: 'ATT', CF: 'ATT', LW: 'ATT', RW: 'ATT', LF: 'ATT', RF: 'ATT',
};

const TIER_MULTIPLIER = { GK: 800, DEF: 900, MID: 1100, ATT: 1400 };

function getTier(positionsStr) {
  if (!positionsStr) return 'MID';
  const primary = positionsStr.split(',')[0].trim().toUpperCase();
  return POSITION_TIERS[primary] || 'MID';
}

function calcBasePrice(overall, tier) {
  let price = parseInt(overall, 10) * TIER_MULTIPLIER[tier];
  if (overall >= 85) price = Math.round(price * 1.2);
  else if (overall >= 80) price = Math.round(price * 1.1);
  return Math.round(price / 100) * 100;
}

// ──────────────────────────────────────────────
// CSV parser (manual, no extra deps)
// ──────────────────────────────────────────────
function parseCSV(rawText) {
  const lines = rawText.split('\n');
  if (lines.length < 2) return [];

  // Parse header
  const headers = parseCSVLine(lines[0]);

  const players = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = parseCSVLine(line);
    const row = {};
    headers.forEach((h, idx) => { row[h.trim()] = (values[idx] || '').trim(); });

    const overall = parseInt(row.overall, 10);
    if (isNaN(overall) || !row.short_name) continue;

    const tier = getTier(row.player_positions);
    const basePrice = calcBasePrice(overall, tier);

    players.push({
      id:           row.player_id,
      name:         row.short_name,
      fullName:     row.long_name,
      positions:    row.player_positions,
      primaryPos:   row.player_positions?.split(',')[0]?.trim() || 'CM',
      tier,
      overall,
      age:          parseInt(row.age, 10) || 0,
      nationality:  row.nationality_name,
      club:         row.club_name,
      faceUrl:      row.player_face_url,
      pace:         parseInt(row.pace, 10) || 0,
      shooting:     parseInt(row.shooting, 10) || 0,
      passing:      parseInt(row.passing, 10) || 0,
      dribbling:    parseInt(row.dribbling, 10) || 0,
      defending:    parseInt(row.defending, 10) || 0,
      physic:       parseInt(row.physic, 10) || 0,
      basePrice,
    });
  }
  return players;
}

// Handles quoted CSV fields correctly
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

// ──────────────────────────────────────────────
// Cache: parse once at startup
// ──────────────────────────────────────────────
let playerCache = null;

function getPlayers() {
  if (!playerCache) {
    console.log('📂 Loading player CSV...');
    const raw = fs.readFileSync(CSV_PATH, 'utf-8');
    playerCache = parseCSV(raw);
    console.log(`✅ Loaded ${playerCache.length} players from CSV`);
  }
  return playerCache;
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ──────────────────────────────────────────────
// Balanced pool builder
//
// Squad requires: 1 GK · 4 DEF · 3 MID · 3 ATT = 11
// Pool of 50 gives ~4-5× coverage per slot so the
// user always has real options at every position.
//
// Quota  →  GK:8  DEF:16  MID:14  ATT:12  (sum = 50)
//
// Rating band: 80–95 (premium / gold tier players)
//   • 80–84  → "good" tier  (~50% of pool)
//   • 85–89  → "great" tier (~35% of pool)
//   • 90–95  → "elite" tier (~15% of pool — rare treats)
// ──────────────────────────────────────────────
const TIER_QUOTA = { GK: 8, DEF: 16, MID: 14, ATT: 12 }; // sum = 50

// Weighted random pick from rating sub-bands so elites appear but aren't dominant
function weightedCandidates(tierPlayers) {
  const good  = tierPlayers.filter(p => p.overall >= 80 && p.overall <= 84);
  const great = tierPlayers.filter(p => p.overall >= 85 && p.overall <= 89);
  const elite = tierPlayers.filter(p => p.overall >= 90);

  // Approx ratios: 50% good, 35% great, 15% elite
  return [
    ...shuffle(good).slice(0, Math.ceil(good.length  * 0.80)),
    ...shuffle(great).slice(0, Math.ceil(great.length * 0.80)),
    ...shuffle(elite).slice(0, Math.ceil(elite.length * 0.80)),
  ];
}

function buildBalancedPool(players, totalCount = 50) {
  const baseSum = Object.values(TIER_QUOTA).reduce((a, b) => a + b, 0);
  const scale   = totalCount / baseSum;

  // Filter to premium band 80–95
  const premium = players.filter(p => p.overall >= 80 && p.overall <= 95);

  // Group by tier
  const byTier = { GK: [], DEF: [], MID: [], ATT: [] };
  for (const p of premium) {
    if (byTier[p.tier]) byTier[p.tier].push(p);
  }

  const pool = [];
  for (const [tier, quota] of Object.entries(TIER_QUOTA)) {
    const needed     = Math.round(quota * scale);
    const candidates = shuffle(weightedCandidates(byTier[tier]));

    if (candidates.length >= needed) {
      pool.push(...candidates.slice(0, needed));
    } else {
      // Fallback: expand to all 80+ if not enough in band
      const extras = shuffle(players.filter(p => p.tier === tier && p.overall >= 78))
        .slice(0, needed - candidates.length);
      pool.push(...candidates, ...extras);
    }
  }

  return shuffle(pool);
}

// ──────────────────────────────────────────────
// Controllers
// ──────────────────────────────────────────────

/**
 * GET /api/auction/players?count=50
 *
 * Returns a balanced, shuffled pool of players:
 *   • Correct positional proportions (GK/DEF/MID/ATT)
 *   • All players within a ±8 overall rating band
 *   • Shuffled so positions appear in random order
 */
export const getAuctionPlayers = (req, res) => {
  try {
    const players = getPlayers();
    const count   = Math.min(parseInt(req.query.count, 10) || 50, 200);

    const pool = buildBalancedPool(players, count);

    res.json({ success: true, count: pool.length, players: pool });
  } catch (err) {
    console.error('Auction players error:', err);
    res.status(500).json({ success: false, error: 'Failed to load players' });
  }
};

/**
 * GET /api/auction/players/random
 * Returns a single random player.
 */
export const getRandomPlayer = (req, res) => {
  try {
    const players = getPlayers();
    const player = players[Math.floor(Math.random() * players.length)];
    res.json({ success: true, player });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to load player' });
  }
};

/**
 * GET /api/auction/meta
 * Returns price range info to help frontend set budget.
 */
export const getAuctionMeta = (req, res) => {
  try {
    const players = getPlayers();
    const prices = players.map(p => p.basePrice);
    const avg = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);
    const min = Math.min(...prices);
    const max = Math.max(...prices);

    res.json({
      success: true,
      meta: {
        totalPlayers: players.length,
        avgBasePrice: avg,
        minBasePrice: min,
        maxBasePrice: max,
        suggestedBudget: 100000,
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Meta error' });
  }
};
